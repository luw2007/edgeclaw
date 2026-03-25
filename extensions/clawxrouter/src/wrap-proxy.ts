import {
  callChatCompletion,
  type ChatMessage,
  DEFAULT_PII_EXTRACTION_PROMPT,
} from "./local-model.js";
import { loadPrompt, loadPromptWithVars } from "./prompt-loader.js";
import { getGlobalCollector } from "./token-stats.js";
import type { PrivacyConfig } from "./types.js";
import { recordRouterOperation } from "./usage-intel.js";
import { getGlobalWrapMappingManager } from "./wrap-mapping.js";

const DEFAULT_WRAP_RESTORE_PROMPT = `You are a text restoration assistant. Review the restored text and fix any grammatical, logical or contextual issues caused by data substitution. Preserve the core meaning exactly. Output ONLY the corrected text.`;

const DEFAULT_SENSITIVITY_CHECK_PROMPT = `You are a privacy auditor. Evaluate whether a desensitized text still contains real PII missed by the replacement. You will receive a mapping table of expected fake values and the text. Only flag data NOT in the mapping table. Output ONLY JSON: {"score": 0.0, "findings": []}.`;

function resolveWrapModelConfig(config: PrivacyConfig) {
  const wrapModel = config.wrapConfig?.wrapModel;
  if (wrapModel?.endpoint) {
    return {
      endpoint: wrapModel.endpoint,
      model: wrapModel.model ?? "openbmb/minicpm4.1",
      providerType: wrapModel.type ?? "openai-compatible",
      apiKey: wrapModel.apiKey,
      customModule: wrapModel.module,
      provider: wrapModel.provider,
    };
  }
  return {
    endpoint: config.localModel?.endpoint ?? "http://localhost:11434",
    model: config.localModel?.model ?? "openbmb/minicpm4.1",
    providerType: config.localModel?.type ?? "openai-compatible",
    apiKey: config.localModel?.apiKey,
    customModule: config.localModel?.module,
    provider: config.localModel?.provider,
  };
}

function parsePiiJson(raw: string): Array<{ type: string; value: string }> {
  let cleaned = raw.replace(/\s+/g, " ").trim();

  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const arrayStart = cleaned.indexOf("[");
  if (arrayStart < 0) return [];
  let jsonStr = cleaned.slice(arrayStart);

  const lastBracket = jsonStr.lastIndexOf("]");
  if (lastBracket >= 0) {
    jsonStr = jsonStr.slice(0, lastBracket + 1);
  } else {
    const lastCloseBrace = jsonStr.lastIndexOf("}");
    if (lastCloseBrace >= 0) {
      jsonStr = jsonStr.slice(0, lastCloseBrace + 1) + "]";
    } else {
      return [];
    }
  }

  jsonStr = jsonStr.replace(/,\s*\]/g, "]");

  jsonStr = jsonStr
    .replace(/(?<=[\[,{]\s*)'([^']+?)'(?=\s*:)/g, '"$1"')
    .replace(/(?<=:\s*)'([^']*?)'(?=\s*[,}\]])/g, '"$1"');

  try {
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (item: unknown) =>
        item &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).type === "string" &&
        typeof (item as Record<string, unknown>).value === "string",
    ) as Array<{ type: string; value: string }>;
  } catch {
    return [];
  }
}

async function extractPii(
  content: string,
  config: PrivacyConfig,
  sessionKey: string,
): Promise<Array<{ type: string; value: string }>> {
  const modelCfg = resolveWrapModelConfig(config);
  const textSnippet = content.slice(0, 3000);

  const systemPrompt = loadPromptWithVars("pii-extraction", DEFAULT_PII_EXTRACTION_PROMPT, {
    CONTENT: textSnippet,
  });

  const promptHasContent = systemPrompt.includes(textSnippet) && textSnippet.length > 10;
  const userMessage = promptHasContent
    ? "Extract all PII from the text above. Output ONLY the JSON array."
    : textSnippet;

  const result = await callChatCompletion(
    modelCfg.endpoint,
    modelCfg.model,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    {
      temperature: 0.0,
      maxTokens: 2500,
      stop: ["Input:", "Task:"],
      apiKey: modelCfg.apiKey,
      disableThinking: true,
      providerType: modelCfg.providerType,
      customModule: modelCfg.customModule,
      timeoutMs: config.wrapConfig?.timeoutMs,
    },
  );

  if (result.usage) {
    const collector = getGlobalCollector();
    collector?.record({
      sessionKey,
      provider: "edge",
      model: modelCfg.model,
      source: "router",
      usage: result.usage,
    });
    recordRouterOperation(
      sessionKey,
      "desensitization",
      result.usage,
      modelCfg.model,
      modelCfg.provider,
    );
  }

  const llmItems = parsePiiJson(result.text);
  return augmentWithRegex(llmItems, textSnippet);
}

const REGEX_PII_PATTERNS: Array<{ type: string; pattern: RegExp }> = [
  { type: "IP", pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|1?\d\d?)\b/g },
  { type: "EMAIL", pattern: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g },
  { type: "PHONE", pattern: /\b1[3-9]\d{9}\b/g },
];

function augmentWithRegex(
  llmItems: Array<{ type: string; value: string }>,
  text: string,
): Array<{ type: string; value: string }> {
  const existingValues = new Set(llmItems.map((i) => i.value));
  const result = [...llmItems];

  for (const { type, pattern } of REGEX_PII_PATTERNS) {
    const cloned = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = cloned.exec(text)) !== null) {
      const val = match[0];
      if (!existingValues.has(val)) {
        existingValues.add(val);
        result.push({ type, value: val });
      }
    }
  }

  return result;
}

export type SensitivityScore = {
  score: number;
  findings: string[];
};

function parseSensitivityResult(raw: string): SensitivityScore {
  let cleaned = raw.trim();
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const braceStart = cleaned.indexOf("{");
  if (braceStart < 0) return { score: 1.0, findings: ["unparseable response"] };
  const braceEnd = cleaned.lastIndexOf("}");
  if (braceEnd < 0) return { score: 1.0, findings: ["unparseable response"] };

  try {
    const obj = JSON.parse(cleaned.slice(braceStart, braceEnd + 1));
    const score = typeof obj.score === "number" ? Math.max(0, Math.min(1, obj.score)) : 1.0;
    const findings = Array.isArray(obj.findings)
      ? obj.findings.filter((f: unknown) => typeof f === "string")
      : [];
    return { score, findings };
  } catch {
    return { score: 1.0, findings: ["json parse failed"] };
  }
}

export async function scoreSensitivity(
  text: string,
  config: PrivacyConfig,
  sessionKey: string,
  mappings?: Array<{ type: string; original: string; fake: string }>,
): Promise<SensitivityScore> {
  const modelCfg = resolveWrapModelConfig(config);
  const snippet = text.slice(0, 3000);
  const systemPrompt = loadPrompt("wrap-sensitivity-check", DEFAULT_SENSITIVITY_CHECK_PROMPT);

  let userContent = snippet;
  if (mappings && mappings.length > 0) {
    const table = mappings.map((m) => `| ${m.type} | ${m.fake} |`).join("\n");
    userContent = `## 替换码表（fake values used）\n| PII类型 | 替换值 |\n|---------|--------|\n${table}\n\n## 待审计文本\n${snippet}`;
  }

  const result = await callChatCompletion(
    modelCfg.endpoint,
    modelCfg.model,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    {
      temperature: 0.0,
      maxTokens: 500,
      apiKey: modelCfg.apiKey,
      disableThinking: true,
      providerType: modelCfg.providerType,
      customModule: modelCfg.customModule,
    },
  );

  if (result.usage) {
    const collector = getGlobalCollector();
    collector?.record({
      sessionKey,
      provider: "edge",
      model: modelCfg.model,
      source: "router",
      usage: result.usage,
    });
    recordRouterOperation(
      sessionKey,
      "desensitization",
      result.usage,
      modelCfg.model,
      modelCfg.provider,
    );
  }

  return parseSensitivityResult(result.text);
}

export async function wrapDesensitize(
  content: string,
  config: PrivacyConfig,
  sessionKey: string,
): Promise<{
  wrapped: string;
  mappingCount: number;
  failed?: boolean;
  sensitivityScore?: SensitivityScore;
}> {
  try {
    const wrapCfg = config.wrapConfig ?? {};
    const locale = wrapCfg.fakeDataLocale ?? "zh-CN";

    const piiItems = await extractPii(content, config, sessionKey);
    if (piiItems.length === 0) {
      return { wrapped: content, mappingCount: 0 };
    }

    const manager = getGlobalWrapMappingManager(wrapCfg.mappingTtlMs);
    manager.getOrCreateMapping(sessionKey, piiItems, locale);
    const wrapped = manager.forwardReplace(content, sessionKey);
    const mappingCount = manager.getMappingCount(sessionKey);

    let sensitivityResult: SensitivityScore | undefined;
    if (wrapCfg.enableSensitivityCheck) {
      const threshold = wrapCfg.sensitivityThreshold ?? 0.3;
      try {
        const mappings = manager.getMappings(sessionKey);
        sensitivityResult = await scoreSensitivity(wrapped, config, sessionKey, mappings);
      } catch {
        sensitivityResult = { score: 1.0, findings: ["sensitivity check failed"] };
      }

      if (sensitivityResult.score > threshold) {
        console.warn(
          `[GuardClaw] Wrap sensitivity check warning: score=${sensitivityResult.score} > threshold=${threshold}, findings=${JSON.stringify(sensitivityResult.findings)}`,
        );
        if (wrapCfg.sensitivityBlockOnFail) {
          return {
            wrapped: content,
            mappingCount: 0,
            failed: true,
            sensitivityScore: sensitivityResult,
          };
        }
      }
    }

    return { wrapped, mappingCount, sensitivityScore: sensitivityResult };
  } catch (err) {
    console.error("[GuardClaw] Wrap desensitize failed:", err);
    return { wrapped: content, mappingCount: 0, failed: true };
  }
}

export async function wrapRestore(
  response: string,
  config: PrivacyConfig,
  sessionKey: string,
): Promise<{ restored: string; llmCorrected: boolean }> {
  try {
    const wrapCfg = config.wrapConfig ?? {};
    const manager = getGlobalWrapMappingManager(wrapCfg.mappingTtlMs);
    const restored = manager.reverseReplace(response, sessionKey);

    if (wrapCfg.restoreMode === "mapping-with-llm") {
      try {
        const modelCfg = resolveWrapModelConfig(config);
        const systemPrompt = loadPrompt("wrap-restore", DEFAULT_WRAP_RESTORE_PROMPT);

        const messages: ChatMessage[] = [
          { role: "system", content: systemPrompt },
          { role: "user", content: restored },
        ];

        const result = await callChatCompletion(modelCfg.endpoint, modelCfg.model, messages, {
          temperature: 0.1,
          maxTokens: 2000,
          apiKey: modelCfg.apiKey,
          disableThinking: true,
          providerType: modelCfg.providerType,
          customModule: modelCfg.customModule,
          timeoutMs: config.wrapConfig?.timeoutMs,
        });

        if (result.usage) {
          const collector = getGlobalCollector();
          collector?.record({
            sessionKey,
            provider: "edge",
            model: modelCfg.model,
            source: "router",
            usage: result.usage,
          });
          recordRouterOperation(
            sessionKey,
            "desensitization",
            result.usage,
            modelCfg.model,
            modelCfg.provider,
          );
        }

        const corrected = result.text.trim();
        if (corrected.length > 0) {
          return { restored: corrected, llmCorrected: true };
        }
      } catch (err) {
        console.error("[GuardClaw] Wrap LLM restore correction failed, using mapping-only:", err);
      }
    }

    return { restored, llmCorrected: false };
  } catch (err) {
    console.error("[GuardClaw] Wrap restore failed:", err);
    return { restored: response, llmCorrected: false };
  }
}
