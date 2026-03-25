/**
 * GuardClaw Local Model Detector
 *
 * Provider-agnostic edge model integration supporting multiple API protocols:
 *   - "openai-compatible": /v1/chat/completions (Ollama, vLLM, LiteLLM, LocalAI, LMStudio, SGLang, TGI …)
 *   - "ollama-native":     /api/chat (Ollama native API)
 *   - "custom":            User-supplied module with callChat() export
 */

import { loadPrompt, loadPromptWithVars } from "./prompt-loader.js";
import { getGlobalCollector } from "./token-stats.js";
import type {
  DetectionContext,
  DetectionResult,
  EdgeProviderType,
  PrivacyConfig,
  SensitivityLevel,
} from "./types.js";
import { levelToNumeric } from "./types.js";
import { recordRouterOperation } from "./usage-intel.js";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatCompletionOptions = {
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
  frequencyPenalty?: number;
  apiKey?: string;
  /** Force-disable reasoning output for compatible backends. */
  disableThinking?: boolean;
  timeoutMs?: number;
};

export type LlmUsageInfo = {
  input: number;
  output: number;
  total: number;
};

export type ChatCompletionResult = {
  text: string;
  usage?: LlmUsageInfo;
};

/**
 * Custom edge provider module interface.
 * Users implementing type="custom" must export a module matching this shape.
 */
export interface CustomEdgeProvider {
  callChat(
    endpoint: string,
    model: string,
    messages: ChatMessage[],
    options?: ChatCompletionOptions,
  ): Promise<string>;
}

const _customProviderCache: Map<string, CustomEdgeProvider> = new Map();

async function loadCustomProvider(modulePath: string): Promise<CustomEdgeProvider> {
  const cached = _customProviderCache.get(modulePath);
  if (cached) return cached;
  const mod = (await import(modulePath)) as CustomEdgeProvider;
  if (typeof mod.callChat !== "function") {
    throw new Error(`Custom edge provider at "${modulePath}" must export a callChat() function`);
  }
  _customProviderCache.set(modulePath, mod);
  return mod;
}

/**
 * Dispatch a chat completion call based on the configured edge provider type.
 * This is the single entry point for all edge model calls.
 *
 * Returns a ChatCompletionResult with the response text and optional usage info
 * parsed from the API response (for token accounting).
 */
export async function callChatCompletion(
  endpoint: string,
  model: string,
  messages: ChatMessage[],
  options?: ChatCompletionOptions & { providerType?: EdgeProviderType; customModule?: string },
): Promise<ChatCompletionResult> {
  const providerType = options?.providerType ?? "openai-compatible";

  let result: ChatCompletionResult;
  switch (providerType) {
    case "ollama-native":
      result = await callOllamaNative(endpoint, model, messages, options);
      break;
    case "custom": {
      if (!options?.customModule) {
        throw new Error("Custom edge provider requires a 'module' path in localModel config");
      }
      const provider = await loadCustomProvider(options.customModule);
      const text = await provider.callChat(endpoint, model, messages, options);
      result = { text };
      break;
    }
    case "openai-compatible":
    default:
      result = await callOpenAICompatible(endpoint, model, messages, options);
      break;
  }
  return result;
}

/**
 * OpenAI-compatible chat completions call.
 * POST ${endpoint}/v1/chat/completions — works with Ollama, vLLM, LiteLLM, LocalAI, LMStudio, SGLang, TGI, etc.
 */
const GUARDCLAW_FETCH_TIMEOUT_MS = 60_000;

async function callOpenAICompatible(
  endpoint: string,
  model: string,
  messages: ChatMessage[],
  options?: ChatCompletionOptions,
): Promise<ChatCompletionResult> {
  const url = endpoint.includes("/chat/completions") ? endpoint : `${endpoint}/v1/chat/completions`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options?.apiKey) {
    headers["Authorization"] = `Bearer ${options.apiKey}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.maxTokens ?? 800,
      stream: true,
      ...(options?.stop ? { stop: options.stop } : {}),
      ...(options?.frequencyPenalty != null ? { frequency_penalty: options.frequencyPenalty } : {}),
      ...(options?.disableThinking ? { chat_template_kwargs: { enable_thinking: false } } : {}),
    }),
    signal: AbortSignal.timeout(options?.timeoutMs ?? GUARDCLAW_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Chat completions API error: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/event-stream") && response.body) {
    return await consumeSSEStream(response.body);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  let text = data.choices?.[0]?.message?.content ?? "";
  text = stripThinkingTags(text);

  const usage: LlmUsageInfo | undefined = data.usage
    ? {
        input: data.usage.prompt_tokens ?? 0,
        output: data.usage.completion_tokens ?? 0,
        total:
          data.usage.total_tokens ??
          (data.usage.prompt_tokens ?? 0) + (data.usage.completion_tokens ?? 0),
      }
    : undefined;

  return { text, usage };
}

async function consumeSSEStream(body: ReadableStream<Uint8Array>): Promise<ChatCompletionResult> {
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let textParts: string[] = [];
  let usage: LlmUsageInfo | undefined;
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;

        try {
          const chunk = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }>;
            usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
          };
          const delta = chunk.choices?.[0]?.delta;
          if (delta?.content) {
            textParts.push(delta.content);
          }
          if (chunk.usage) {
            usage = {
              input: chunk.usage.prompt_tokens ?? 0,
              output: chunk.usage.completion_tokens ?? 0,
              total: chunk.usage.total_tokens ?? 0,
            };
          }
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  let text = textParts.join("");
  text = stripThinkingTags(text);
  return { text, usage };
}

/**
 * Ollama native API call.
 * POST ${endpoint}/api/chat — Ollama's own protocol (non-streaming).
 */
async function callOllamaNative(
  endpoint: string,
  model: string,
  messages: ChatMessage[],
  options?: ChatCompletionOptions,
): Promise<ChatCompletionResult> {
  const url = `${endpoint}/api/chat`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.1,
        num_predict: options?.maxTokens ?? 800,
        ...(options?.stop ? { stop: options.stop } : {}),
        ...(options?.frequencyPenalty != null
          ? { repeat_penalty: 1.0 + (options.frequencyPenalty ?? 0) }
          : {}),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama native API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    message?: { content?: string };
    prompt_eval_count?: number;
    eval_count?: number;
  };
  let text = data.message?.content ?? "";
  text = stripThinkingTags(text);

  const promptTokens = data.prompt_eval_count ?? 0;
  const outputTokens = data.eval_count ?? 0;
  const usage: LlmUsageInfo | undefined =
    promptTokens || outputTokens
      ? { input: promptTokens, output: outputTokens, total: promptTokens + outputTokens }
      : undefined;

  return { text, usage };
}

/** Strip <think>...</think> blocks emitted by reasoning models (MiniCPM, Qwen3, etc.) */
function stripThinkingTags(text: string): string {
  let result = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const lastThinkClose = result.lastIndexOf("</think>");
  if (lastThinkClose !== -1) {
    result = result.slice(lastThinkClose + "</think>".length).trim();
  }
  return result;
}

/**
 * Detect sensitivity level using a local model
 */
export async function detectByLocalModel(
  context: DetectionContext,
  config: PrivacyConfig,
): Promise<DetectionResult> {
  // Check if local model is enabled
  if (!config.localModel?.enabled) {
    return {
      level: "S1",
      levelNumeric: 1,
      reason: "Local model detection disabled",
      detectorType: "localModelDetector",
      confidence: 0,
    };
  }

  try {
    const { system, user } = buildDetectionMessages(context);
    const result = await callLocalModel(system, user, config);
    const parsed = parseModelResponse(result.text);

    if (result.usage) {
      const collector = getGlobalCollector();
      collector?.record({
        sessionKey: context.sessionKey ?? "",
        provider: "edge",
        model: config.localModel?.model ?? "unknown",
        source: "router",
        usage: result.usage,
      });
      recordRouterOperation(
        context.sessionKey,
        "detection",
        result.usage,
        config.localModel?.model ?? "unknown",
        config.localModel?.provider,
      );
    }

    return {
      level: parsed.level,
      levelNumeric: levelToNumeric(parsed.level),
      reason: parsed.reason,
      detectorType: "localModelDetector",
      confidence: parsed.confidence ?? 0.8,
    };
  } catch (err) {
    // If local model fails, return S1 (safe) but log the error
    console.error("[GuardClaw] Local model detection failed:", err);
    return {
      level: "S1",
      levelNumeric: 1,
      reason: `Local model error: ${String(err)}`,
      detectorType: "localModelDetector",
      confidence: 0,
    };
  }
}

/** Default detection system prompt (fallback if prompts/detection-system.md is missing) */
export const DEFAULT_DETECTION_SYSTEM_PROMPT = `[SYSTEM] You are a strict privacy classifier. Output ONLY a single JSON object — nothing else.

Classify by BOTH actual data AND intent. If the user asks to read/analyze a file, classify based on what the file WILL contain.

S3 = PRIVATE (local only, never cloud):
  - Financial: payslip, salary, tax, bank account, SSN, 工资单, 报销单, 税表
  - Medical: health records, diagnoses, prescriptions, lab results, 病历, 体检报告
  - Credentials: passwords, API keys, secrets, tokens, private keys
  - ANY request to read/analyze a file about the above topics → S3
  "evaluate these passwords" → S3
  "check my payslip" → S3
  "summarize the medical record" → S3

S2 = SENSITIVE (redact PII, then send to cloud):
  - Addresses (ANY physical address, 地址, 住址, street, road, apartment, 路, 街, 小区, 弄, 号)
  - Gate/door codes, pickup codes, delivery tracking numbers
  - Phone numbers, email addresses, real names used as contact PII
  - License plates, SSN/ID mixed with personal context, chat logs with PII
  - File content containing the above PII → S2
  - ANY mention of "address"/"地址" with actual location data → S2
  "1847 Elm St, gate code 4523#" → S2
  "我的地址是北京市朝阳区xxx" → S2
  "张伟 手机13912345678" → S2
  "my address is 123 Main St" → S2

S1 = SAFE: No sensitive data or intent.
  "write a poem about spring" → S1
  "how to read Excel with pandas" → S1

Rules:
- Passwords/credentials → ALWAYS S3 (never S2)
- Medical data → ALWAYS S3 (never S2)
- Gate/access/pickup codes → S2 (not S3)
- If file content is provided and contains PII → at least S2
- When unsure → pick higher level

Output format: {"level":"S1|S2|S3","reason":"brief"}`;

/**
 * Build separate system/user messages for the detection prompt.
 *
 * System instruction is loaded from prompts/detection-system.md (editable by users).
 * The dynamic [CONTENT] block becomes the user message.
 */
function buildDetectionMessages(context: DetectionContext): { system: string; user: string } {
  const system = loadPrompt("detection-system", DEFAULT_DETECTION_SYSTEM_PROMPT);

  const parts: string[] = ["[CONTENT]"];

  if (context.message) {
    parts.push(`Message: ${context.message.slice(0, 1500)}`);
  }

  if (context.toolName) {
    parts.push(`Tool: ${context.toolName}`);
  }

  if (context.toolParams) {
    const paramsStr = JSON.stringify(context.toolParams, null, 2);
    parts.push(`Tool Parameters: ${paramsStr.slice(0, 800)}`);
  }

  if (context.toolResult) {
    const resultStr =
      typeof context.toolResult === "string"
        ? context.toolResult
        : JSON.stringify(context.toolResult);
    parts.push(`Tool Result: ${resultStr.slice(0, 800)}`);
  }

  if (context.recentContext && context.recentContext.length > 0) {
    parts.push(`Recent Context: ${context.recentContext.slice(-3).join(" | ")}`);
  }

  parts.push("[/CONTENT]");

  return { system, user: parts.join("\n") };
}

/**
 * Call local/edge model via the configured provider protocol.
 * Dispatches to the correct API based on localModel.type.
 * Returns both the text response and optional usage info for router overhead tracking.
 */
async function callLocalModel(
  systemPrompt: string,
  userContent: string,
  config: PrivacyConfig,
): Promise<ChatCompletionResult> {
  const model = config.localModel?.model ?? "openbmb/minicpm4.1";
  const endpoint = config.localModel?.endpoint ?? "http://localhost:11434";
  const providerType = config.localModel?.type ?? "openai-compatible";

  const modelLower = model.toLowerCase();
  const finalUser = modelLower.includes("qwen") ? `/no_think\n${userContent}` : userContent;

  return await callChatCompletion(
    endpoint,
    model,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: finalUser },
    ],
    {
      temperature: 0.1,
      maxTokens: 800,
      apiKey: config.localModel?.apiKey,
      disableThinking: true,
      providerType,
      customModule: config.localModel?.module,
    },
  );
}

/**
 * Two-step desensitization using a local model:
 *   Step 1: Model identifies PII items as a JSON array
 *   Step 2: Programmatic string replacement using the model's output
 *
 * Falls back to rule-based redaction if the local model is unavailable.
 */
export async function desensitizeWithLocalModel(
  content: string,
  config: PrivacyConfig,
  sessionKey?: string,
): Promise<{ desensitized: string; wasModelUsed: boolean; failed?: boolean }> {
  if (!config.localModel?.enabled) {
    return { desensitized: content, wasModelUsed: false, failed: true };
  }

  try {
    const endpoint = config.localModel?.endpoint ?? "http://localhost:11434";
    const model = config.localModel?.model ?? "openbmb/minicpm4.1";
    const providerType = config.localModel?.type ?? "openai-compatible";
    const customModule = config.localModel?.module;

    const piiItems = await extractPiiWithModel(endpoint, model, content, {
      apiKey: config.localModel?.apiKey,
      providerType,
      customModule,
      sessionKey,
      provider: config.localModel?.provider,
    });

    if (piiItems.length === 0) {
      return { desensitized: content, wasModelUsed: true };
    }

    // Step 2: Programmatic replacement
    let redacted = content;
    // Sort by value length descending to avoid partial replacements
    const sorted = [...piiItems].sort((a, b) => b.value.length - a.value.length);
    for (const item of sorted) {
      if (!item.value || item.value.length < 2) continue;
      const tag = mapPiiTypeToTag(item.type);
      // Replace all occurrences of this value
      redacted = replaceAll(redacted, item.value, tag);
    }

    return { desensitized: redacted, wasModelUsed: true };
  } catch (err) {
    console.error("[GuardClaw] Local model desensitization failed:", err);
    return { desensitized: content, wasModelUsed: false, failed: true };
  }
}

/** Map model PII types to [REDACTED:...] tags */
function mapPiiTypeToTag(type: string): string {
  const t = type.toUpperCase().replace(/\s+/g, "_");
  const mapping: Record<string, string> = {
    ADDRESS: "[REDACTED:ADDRESS]",
    ACCESS_CODE: "[REDACTED:ACCESS_CODE]",
    GATE_CODE: "[REDACTED:ACCESS_CODE]",
    DOOR_CODE: "[REDACTED:ACCESS_CODE]",
    PIN: "[REDACTED:ACCESS_CODE]",
    DELIVERY: "[REDACTED:DELIVERY]",
    COURIER_NUMBER: "[REDACTED:DELIVERY]",
    COURIER_NO: "[REDACTED:DELIVERY]",
    COURIER_CODE: "[REDACTED:DELIVERY]",
    TRACKING_NUMBER: "[REDACTED:DELIVERY]",
    NAME: "[REDACTED:NAME]",
    SENDER_NAME: "[REDACTED:NAME]",
    RECIPIENT_NAME: "[REDACTED:NAME]",
    PHONE: "[REDACTED:PHONE]",
    SENDER_PHONE: "[REDACTED:PHONE]",
    FACILITY_PHONE: "[REDACTED:PHONE]",
    LANDLINE: "[REDACTED:PHONE]",
    MOBILE: "[REDACTED:PHONE]",
    EMAIL: "[REDACTED:EMAIL]",
    ID: "[REDACTED:ID]",
    ID_CARD: "[REDACTED:ID]",
    ID_NUMBER: "[REDACTED:ID]",
    PASSPORT: "[REDACTED:ID]",
    PASSPORT_NUMBER: "[REDACTED:ID]",
    DRIVER_LICENSE: "[REDACTED:ID]",
    DRIVERS_LICENSE: "[REDACTED:ID]",
    DL: "[REDACTED:ID]",
    SSN: "[REDACTED:ID]",
    CARD: "[REDACTED:CARD]",
    BANK_CARD: "[REDACTED:CARD]",
    CARD_NUMBER: "[REDACTED:CARD]",
    SECRET: "[REDACTED:SECRET]",
    PASSWORD: "[REDACTED:SECRET]",
    API_KEY: "[REDACTED:API_KEY]",
    TOKEN: "[REDACTED:SECRET]",
    CREDENTIAL: "[REDACTED:SECRET]",
    ACCESS_KEY: "[REDACTED:ACCESS_KEY]",
    AK: "[REDACTED:ACCESS_KEY]",
    AWS_KEY: "[REDACTED:ACCESS_KEY]",
    AWS_ACCESS_KEY: "[REDACTED:ACCESS_KEY]",
    SECRET_KEY: "[REDACTED:SECRET_KEY]",
    SK: "[REDACTED:SECRET_KEY]",
    AWS_SECRET: "[REDACTED:SECRET_KEY]",
    AWS_SECRET_KEY: "[REDACTED:SECRET_KEY]",
    JWT: "[REDACTED:JWT]",
    JWT_TOKEN: "[REDACTED:JWT]",
    BEARER_TOKEN: "[REDACTED:JWT]",
    RSA_PRIVATE_KEY: "[REDACTED:PRIVATE_KEY]",
    PRIVATE_KEY: "[REDACTED:PRIVATE_KEY]",
    RSA_KEY: "[REDACTED:PRIVATE_KEY]",
    RSA_PUBLIC_KEY: "[REDACTED:PUBLIC_KEY]",
    PUBLIC_KEY: "[REDACTED:PUBLIC_KEY]",
    CERTIFICATE: "[REDACTED:CERTIFICATE]",
    CERT: "[REDACTED:CERTIFICATE]",
    X509: "[REDACTED:CERTIFICATE]",
    X509_CERT: "[REDACTED:CERTIFICATE]",
    HTTPS_CERT: "[REDACTED:CERTIFICATE]",
    SSL_CERT: "[REDACTED:CERTIFICATE]",
    TLS_CERT: "[REDACTED:CERTIFICATE]",
    SSH_KEY: "[REDACTED:SSH_KEY]",
    SSH_PUBLIC_KEY: "[REDACTED:SSH_KEY]",
    DB_CONNECTION: "[REDACTED:DB_CONNECTION]",
    CONNECTION_STRING: "[REDACTED:DB_CONNECTION]",
    DATABASE_URL: "[REDACTED:DB_CONNECTION]",
    ENV_VAR: "[REDACTED:ENV_VAR]",
    ENV_VARIABLE: "[REDACTED:ENV_VAR]",
    IP: "[REDACTED:IP]",
    LICENSE_PLATE: "[REDACTED:LICENSE]",
    PLATE: "[REDACTED:LICENSE]",
    COMPANY: "[REDACTED:COMPANY]",
    COMPANY_NAME: "[REDACTED:COMPANY]",
    ORGANIZATION: "[REDACTED:COMPANY]",
    ORG: "[REDACTED:COMPANY]",
    USCC: "[REDACTED:USCC]",
    UNIFIED_SOCIAL_CREDIT_CODE: "[REDACTED:USCC]",
    TAX_ID: "[REDACTED:TAX_ID]",
    TAX_NUMBER: "[REDACTED:TAX_ID]",
    BANK_ACCOUNT: "[REDACTED:BANK_ACCOUNT]",
    ACCOUNT_NUMBER: "[REDACTED:BANK_ACCOUNT]",
    BIZ_LICENSE: "[REDACTED:BIZ_LICENSE]",
    BUSINESS_LICENSE: "[REDACTED:BIZ_LICENSE]",
    ORG_CODE: "[REDACTED:ORG_CODE]",
    ORGANIZATION_CODE: "[REDACTED:ORG_CODE]",
    DOMAIN: "[REDACTED:DOMAIN]",
    WEBSITE: "[REDACTED:DOMAIN]",
    URL: "[REDACTED:URL]",
    JOB_TITLE: "[REDACTED:JOB_TITLE]",
    POSITION: "[REDACTED:JOB_TITLE]",
    TITLE: "[REDACTED:JOB_TITLE]",
    DEPARTMENT: "[REDACTED:DEPARTMENT]",
    DEPT: "[REDACTED:DEPARTMENT]",
    PAYMENT: "[REDACTED:PAYMENT]",
    PAYMENT_ACCOUNT: "[REDACTED:PAYMENT]",
    BIRTHDAY: "[REDACTED:BIRTHDAY]",
    DOB: "[REDACTED:BIRTHDAY]",
    DATE_OF_BIRTH: "[REDACTED:BIRTHDAY]",
    TIME: "[REDACTED:TIME]",
    DATE: "[REDACTED:DATE]",
    SALARY: "[REDACTED:SALARY]",
    INCOME: "[REDACTED:SALARY]",
    WAGE: "[REDACTED:SALARY]",
    AMOUNT: "[REDACTED:AMOUNT]",
    PRICE: "[REDACTED:AMOUNT]",
    COST: "[REDACTED:AMOUNT]",
    NOTE: "[REDACTED:NOTE]",
    REMARK: "[REDACTED:NOTE]",
    MEMO: "[REDACTED:NOTE]",
    ORDER: "[REDACTED:ORDER]",
    ORDER_NUMBER: "[REDACTED:ORDER]",
    ORDER_ID: "[REDACTED:ORDER]",
    CONTRACT: "[REDACTED:CONTRACT]",
    CONTRACT_NUMBER: "[REDACTED:CONTRACT]",
    CONTRACT_ID: "[REDACTED:CONTRACT]",
    INVOICE: "[REDACTED:INVOICE]",
    INVOICE_NUMBER: "[REDACTED:INVOICE]",
    INVOICE_ID: "[REDACTED:INVOICE]",
    CUSTOMER_ID: "[REDACTED:CUSTOMER_ID]",
    CUSTOMER_NUMBER: "[REDACTED:CUSTOMER_ID]",
    CLIENT_ID: "[REDACTED:CUSTOMER_ID]",
    TRANSACTION: "[REDACTED:TRANSACTION]",
    TRANSACTION_ID: "[REDACTED:TRANSACTION]",
    TXN_ID: "[REDACTED:TRANSACTION]",
    RECEIPT: "[REDACTED:RECEIPT]",
    RECEIPT_NUMBER: "[REDACTED:RECEIPT]",
    RECEIPT_ID: "[REDACTED:RECEIPT]",
    SKU: "[REDACTED:SKU]",
    ITEM_CODE: "[REDACTED:SKU]",
    PRODUCT_CODE: "[REDACTED:SKU]",
    PRODUCT: "[REDACTED:PRODUCT]",
    PRODUCT_NAME: "[REDACTED:PRODUCT]",
    ITEM_NAME: "[REDACTED:PRODUCT]",
    PROJECT: "[REDACTED:PROJECT]",
    PROJECT_CODE: "[REDACTED:PROJECT]",
    PROJECT_ID: "[REDACTED:PROJECT]",
    EMPLOYEE_ID: "[REDACTED:EMPLOYEE_ID]",
    STAFF_ID: "[REDACTED:EMPLOYEE_ID]",
    WORKER_ID: "[REDACTED:EMPLOYEE_ID]",
    ETHNICITY: "[REDACTED:ETHNICITY]",
    RACE: "[REDACTED:ETHNICITY]",
    ETHNIC_ORIGIN: "[REDACTED:ETHNICITY]",
    RELIGION: "[REDACTED:RELIGION]",
    RELIGIOUS_BELIEF: "[REDACTED:RELIGION]",
    PHILOSOPHICAL_BELIEF: "[REDACTED:RELIGION]",
    POLITICAL_OPINION: "[REDACTED:POLITICAL]",
    POLITICAL_AFFILIATION: "[REDACTED:POLITICAL]",
    POLITICAL_PARTY: "[REDACTED:POLITICAL]",
    UNION_MEMBERSHIP: "[REDACTED:UNION]",
    TRADE_UNION: "[REDACTED:UNION]",
    HEALTH: "[REDACTED:HEALTH]",
    HEALTH_CONDITION: "[REDACTED:HEALTH]",
    MEDICAL_CONDITION: "[REDACTED:HEALTH]",
    DIAGNOSIS: "[REDACTED:HEALTH]",
    MEDICATION: "[REDACTED:MEDICATION]",
    PRESCRIPTION: "[REDACTED:MEDICATION]",
    DRUG: "[REDACTED:MEDICATION]",
    BIOMETRIC: "[REDACTED:BIOMETRIC]",
    BIOMETRIC_ID: "[REDACTED:BIOMETRIC]",
    FINGERPRINT: "[REDACTED:BIOMETRIC]",
    FACE_ID: "[REDACTED:BIOMETRIC]",
    VOICEPRINT: "[REDACTED:BIOMETRIC]",
    GENETIC: "[REDACTED:GENETIC]",
    GENETIC_DATA: "[REDACTED:GENETIC]",
    GENETIC_MARKER: "[REDACTED:GENETIC]",
    DNA: "[REDACTED:GENETIC]",
    SEXUAL_ORIENTATION: "[REDACTED:SEXUAL_ORIENTATION]",
    SEXUALITY: "[REDACTED:SEXUAL_ORIENTATION]",
    CRIMINAL_RECORD: "[REDACTED:CRIMINAL_RECORD]",
    CONVICTION: "[REDACTED:CRIMINAL_RECORD]",
    OFFENSE: "[REDACTED:CRIMINAL_RECORD]",
    GENDER: "[REDACTED:GENDER]",
    SEX: "[REDACTED:GENDER]",
    AGE: "[REDACTED:AGE]",
    BIRTH_PLACE: "[REDACTED:BIRTH_PLACE]",
    PLACE_OF_BIRTH: "[REDACTED:BIRTH_PLACE]",
    BIRTHPLACE: "[REDACTED:BIRTH_PLACE]",
    NATIONALITY: "[REDACTED:NATIONALITY]",
    CITIZENSHIP: "[REDACTED:NATIONALITY]",
    IMMIGRATION_STATUS: "[REDACTED:NATIONALITY]",
    MEDICAL_RECORD_NUMBER: "[REDACTED:MRN]",
    MRN: "[REDACTED:MRN]",
    PATIENT_ID: "[REDACTED:MRN]",
    HEALTH_PLAN_ID: "[REDACTED:HEALTH_PLAN]",
    HEALTH_PLAN_NUMBER: "[REDACTED:HEALTH_PLAN]",
    MEDICARE_ID: "[REDACTED:HEALTH_PLAN]",
    MEDICAID_ID: "[REDACTED:HEALTH_PLAN]",
    INSURANCE_NUMBER: "[REDACTED:INSURANCE]",
    INSURANCE_ID: "[REDACTED:INSURANCE]",
    POLICY_NUMBER: "[REDACTED:INSURANCE]",
    DEVICE_ID: "[REDACTED:DEVICE_ID]",
    DEVICE_IDENTIFIER: "[REDACTED:DEVICE_ID]",
    SERIAL_NUMBER: "[REDACTED:DEVICE_ID]",
    IMEI: "[REDACTED:DEVICE_ID]",
    MAC_ADDRESS: "[REDACTED:DEVICE_ID]",
    GEO_COORDINATES: "[REDACTED:GEO]",
    GPS: "[REDACTED:GEO]",
    LATITUDE_LONGITUDE: "[REDACTED:GEO]",
    LOCATION: "[REDACTED:GEO]",
    GEOLOCATION: "[REDACTED:GEO]",
    COOKIE_ID: "[REDACTED:COOKIE_ID]",
    TRACKING_ID: "[REDACTED:COOKIE_ID]",
    ADVERTISING_ID: "[REDACTED:COOKIE_ID]",
    DEVICE_FINGERPRINT: "[REDACTED:COOKIE_ID]",
    STUDENT_ID: "[REDACTED:STUDENT_ID]",
    STUDENT_NUMBER: "[REDACTED:STUDENT_ID]",
    CREDIT_SCORE: "[REDACTED:CREDIT_SCORE]",
    CREDIT_RATING: "[REDACTED:CREDIT_SCORE]",
    FICO_SCORE: "[REDACTED:CREDIT_SCORE]",
    LOAN_NUMBER: "[REDACTED:LOAN]",
    LOAN_ID: "[REDACTED:LOAN]",
    MORTGAGE_NUMBER: "[REDACTED:LOAN]",
    FAX: "[REDACTED:FAX]",
    FAX_NUMBER: "[REDACTED:FAX]",
    USERNAME: "[REDACTED:USERNAME]",
    ACCOUNT_NAME: "[REDACTED:USERNAME]",
    SCREEN_NAME: "[REDACTED:USERNAME]",
    HANDLE: "[REDACTED:USERNAME]",
    SIGNATURE: "[REDACTED:SIGNATURE]",
    DIGITAL_SIGNATURE: "[REDACTED:SIGNATURE]",
    BROWSING_HISTORY: "[REDACTED:BROWSING_HISTORY]",
    SEARCH_HISTORY: "[REDACTED:BROWSING_HISTORY]",
    SEARCH_QUERY: "[REDACTED:BROWSING_HISTORY]",
    BROWSING_DATA: "[REDACTED:BROWSING_HISTORY]",
    WEB_HISTORY: "[REDACTED:BROWSING_HISTORY]",
    MESSAGE_CONTENT: "[REDACTED:MESSAGE_CONTENT]",
    COMMUNICATION: "[REDACTED:MESSAGE_CONTENT]",
    SMS_CONTENT: "[REDACTED:MESSAGE_CONTENT]",
    EMAIL_CONTENT: "[REDACTED:MESSAGE_CONTENT]",
    CHAT_MESSAGE: "[REDACTED:MESSAGE_CONTENT]",
    MAIL_BODY: "[REDACTED:MESSAGE_CONTENT]",
  };
  return mapping[t] ?? `[REDACTED:${t}]`;
}

/** Simple replaceAll polyfill for older Node */
function replaceAll(str: string, search: string, replacement: string): string {
  // Escape regex special chars in search string
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return str.replace(new RegExp(escaped, "g"), replacement);
}

/** Default PII extraction system prompt (fallback if prompts/pii-extraction.md is missing) */
export const DEFAULT_PII_EXTRACTION_PROMPT = `You are a PII extraction engine. Extract ALL PII (personally identifiable information) from the given text as a JSON array.

Personal types: NAME (every person), PHONE, LANDLINE, FAX, ADDRESS (all variants including shortened), ACCESS_CODE (gate/door/门禁码), DELIVERY (tracking numbers, pickup codes/取件码), ID (SSN/身份证), PASSPORT, DRIVER_LICENSE, CARD (bank/medical/insurance), LICENSE_PLATE (plate numbers/车牌), EMAIL, PASSWORD, PAYMENT (Venmo/PayPal/支付宝/微信), BIRTHDAY, AGE, GENDER, BIRTH_PLACE, NATIONALITY, SALARY, AMOUNT (monetary values), TIME (appointment/delivery times), DATE, NOTE (private instructions), IP, USERNAME (account names/handles)

GDPR Art.9 special categories: ETHNICITY (race/民族/种族), RELIGION (religious/philosophical beliefs), POLITICAL_OPINION (political affiliations/party), UNION_MEMBERSHIP (trade union), HEALTH (medical conditions/diagnoses), MEDICATION (prescriptions/drugs), BIOMETRIC (fingerprints/face ID/voiceprints), GENETIC (DNA/genetic markers), SEXUAL_ORIENTATION, CRIMINAL_RECORD (convictions/offenses)

HIPAA/healthcare: MEDICAL_RECORD_NUMBER/MRN (patient IDs), HEALTH_PLAN_ID (Medicare/Medicaid/insurance plan numbers), DEVICE_ID (medical device identifiers/IMEI/serial numbers)

CCPA/financial/identity: INSURANCE_NUMBER (policy numbers), CREDIT_SCORE (FICO/credit ratings), LOAN_NUMBER (loans/mortgages), GEO_COORDINATES (GPS/precise location), COOKIE_ID (tracking IDs/advertising IDs/device fingerprints), STUDENT_ID (education records), SIGNATURE, BROWSING_HISTORY (browsing/search history/浏览记录/搜索记录), MESSAGE_CONTENT (email/SMS/chat message content/邮件内容/短信内容/聊天消息)

Secrets & credentials: API_KEY (sk-xxx/key-xxx prefixed keys), ACCESS_KEY/AK (AKIA-prefixed AWS keys), SECRET_KEY/SK (cloud secret keys), JWT (JSON Web Tokens/Bearer tokens), PRIVATE_KEY (RSA/PEM private keys), PUBLIC_KEY, CERTIFICATE/CERT (X.509/SSL/TLS/HTTPS certs), SSH_KEY (ssh-rsa public keys), DB_CONNECTION (database connection strings/DSN), ENV_VAR (KEY=VALUE environment variables)

Enterprise types: COMPANY (company/organization names/公司名), USCC (统一社会信用代码/18-digit), TAX_ID (税号), BANK_ACCOUNT (对公账户), BIZ_LICENSE (营业执照号), ORG_CODE (组织机构代码), DOMAIN (company domains/websites), URL, JOB_TITLE (职位), DEPARTMENT (部门)

Business data types: ORDER (订单号/order numbers), CONTRACT (合同号), INVOICE (发票号), CUSTOMER_ID (客户编号), TRANSACTION (交易流水号), RECEIPT (收据号), SKU (商品编码/item codes), PRODUCT (产品名称), PROJECT (项目编号), EMPLOYEE_ID (员工工号)

Important: Extract EVERY person's name, EVERY address variant, ALL company/organization names, and ALL business identifiers (order/contract/invoice numbers, etc).
Extract ALL IP addresses (e.g. 192.168.x.x, 10.x.x.x), database hosts, server addresses, ports, usernames, and passwords — especially from technical/code contexts.

Example 1:
Input: Alex at Apex Inc (USCC 91110108MA01ABCD5X) placed order ORD20240315001 for SKU ABC-1234. Li Na phone 13912345678, gate code 1234#, contract HT-2024-000123, invoice 0412345678, customer CUS00012345, project PRJ-2024-0088
Output: [{"type":"NAME","value":"Alex"},{"type":"COMPANY","value":"Apex Inc"},{"type":"USCC","value":"91110108MA01ABCD5X"},{"type":"ORDER","value":"ORD20240315001"},{"type":"SKU","value":"ABC-1234"},{"type":"NAME","value":"Li Na"},{"type":"PHONE","value":"13912345678"},{"type":"ACCESS_CODE","value":"1234#"},{"type":"CONTRACT","value":"HT-2024-000123"},{"type":"INVOICE","value":"0412345678"},{"type":"CUSTOMER_ID","value":"CUS00012345"},{"type":"PROJECT","value":"PRJ-2024-0088"}]

Example 2:
Input: 连接 MySQL 192.168.1.100:3306，用户名 root，密码 P@ss123。邮件发到 test@corp.com，SMTP smtp.corp.com:587
Output: [{"type":"IP","value":"192.168.1.100"},{"type":"USERNAME","value":"root"},{"type":"PASSWORD","value":"P@ss123"},{"type":"EMAIL","value":"test@corp.com"},{"type":"DOMAIN","value":"smtp.corp.com"}]

Now extract PII from the following text:

{{CONTENT}}

Output ONLY the JSON array — no explanation, no markdown fences.`;

/**
 * Extract PII from content using local model via chat completions.
 *
 * Two-step approach: model identifies PII items as JSON, then we do
 * programmatic string replacement. More reliable than asking models to rewrite.
 */
async function extractPiiWithModel(
  endpoint: string,
  model: string,
  content: string,
  opts?: {
    apiKey?: string;
    providerType?: EdgeProviderType;
    customModule?: string;
    sessionKey?: string;
    provider?: string;
  },
): Promise<Array<{ type: string; value: string }>> {
  const textSnippet = content.slice(0, 3000);

  const systemPrompt = loadPromptWithVars("pii-extraction", DEFAULT_PII_EXTRACTION_PROMPT, {
    CONTENT: textSnippet,
  });

  const promptHasContent = systemPrompt.includes(textSnippet) && textSnippet.length > 10;
  const userMessage = promptHasContent
    ? "Extract all PII from the text above. Output ONLY the JSON array."
    : textSnippet;

  const result = await callChatCompletion(
    endpoint,
    model,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    {
      temperature: 0.0,
      maxTokens: 2500,
      stop: ["Input:", "Task:"],
      apiKey: opts?.apiKey,
      disableThinking: true,
      providerType: opts?.providerType,
      customModule: opts?.customModule,
    },
  );

  if (result.usage) {
    const collector = getGlobalCollector();
    collector?.record({
      sessionKey: opts?.sessionKey ?? "",
      provider: "edge",
      model,
      source: "router",
      usage: result.usage,
    });
    recordRouterOperation(opts?.sessionKey, "desensitization", result.usage, model, opts?.provider);
  }

  return parsePiiJson(result.text);
}

/** Parse the model's PII extraction output into structured items */
function parsePiiJson(raw: string): Array<{ type: string; value: string }> {
  // Normalize whitespace (model may use newlines between items)
  let cleaned = raw.replace(/\s+/g, " ").trim();

  // Strip markdown code fences if present
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Find the JSON array in the output
  const arrayStart = cleaned.indexOf("[");
  if (arrayStart < 0) return [];
  let jsonStr = cleaned.slice(arrayStart);

  // Find the last ] to cut off any trailing garbage
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

  // Fix trailing commas before ]
  jsonStr = jsonStr.replace(/,\s*\]/g, "]");

  // Normalize Python-style single-quoted JSON to double-quoted JSON.
  // Some local models output {'key': 'value'} instead of {"key": "value"}.
  jsonStr = jsonStr
    .replace(/(?<=[\[,{]\s*)'([^']+?)'(?=\s*:)/g, '"$1"')
    .replace(/(?<=:\s*)'([^']*?)'(?=\s*[,}\]])/g, '"$1"');

  try {
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr)) return [];
    const items = arr.filter(
      (item: unknown) =>
        item &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).type === "string" &&
        typeof (item as Record<string, unknown>).value === "string",
    ) as Array<{ type: string; value: string }>;
    return items;
  } catch {
    console.error("[GuardClaw] Failed to parse PII extraction JSON:", jsonStr.slice(0, 300));
    return [];
  }
}

/**
 * Parse model response to extract sensitivity level
 */
function parseModelResponse(response: string): {
  level: SensitivityLevel;
  reason?: string;
  confidence?: number;
} {
  try {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        level?: string;
        reason?: string;
        confidence?: number;
      };

      // Validate level
      const level = parsed.level?.toUpperCase();
      if (level === "S1" || level === "S2" || level === "S3") {
        return {
          level: level as SensitivityLevel,
          reason: parsed.reason,
          confidence: parsed.confidence,
        };
      }
    }

    // Fallback: look for level mentions in text
    const upperResponse = response.toUpperCase();
    if (upperResponse.includes("S3") || upperResponse.includes("PRIVATE")) {
      return {
        level: "S3",
        reason: "Detected from text analysis",
        confidence: 0.6,
      };
    }
    if (upperResponse.includes("S2") || upperResponse.includes("SENSITIVE")) {
      return {
        level: "S2",
        reason: "Detected from text analysis",
        confidence: 0.6,
      };
    }

    // Default to S1 if unable to parse
    return {
      level: "S1",
      reason: "Unable to parse model response",
      confidence: 0.3,
    };
  } catch (err) {
    console.error("[GuardClaw] Error parsing model response:", err);
    return {
      level: "S1",
      reason: "Parse error",
      confidence: 0,
    };
  }
}
