import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import type { ChatCompletionResult } from "./local-model.js";
import type { PrivacyConfig } from "./types.js";
import { getGlobalWrapMappingManager } from "./wrap-mapping.js";
import { wrapDesensitize, wrapRestore, scoreSensitivity } from "./wrap-proxy.js";

vi.mock("./local-model.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("./local-model.js")>();
  return {
    ...original,
    callChatCompletion: vi.fn(),
  };
});

vi.mock("./token-stats.js", () => ({
  getGlobalCollector: () => null,
}));

vi.mock("./usage-intel.js", () => ({
  recordRouterOperation: vi.fn(),
}));

import { callChatCompletion } from "./local-model.js";

const mockCallChat = callChatCompletion as MockedFunction<typeof callChatCompletion>;

function makeConfig(overrides?: Partial<PrivacyConfig>): PrivacyConfig {
  return {
    enabled: true,
    s2Policy: "wrap",
    localModel: {
      enabled: true,
      model: "test-model",
      endpoint: "http://localhost:11434",
      type: "openai-compatible",
    },
    wrapConfig: {
      fakeDataLocale: "zh-CN",
      restoreMode: "mapping-only",
      mappingTtlMs: 300_000,
    },
    rules: {
      keywords: { S2: [], S3: [] },
      patterns: { S2: [], S3: [] },
    },
    ...overrides,
  } as PrivacyConfig;
}

let sessionCounter = 0;
function uniqueSession(): string {
  return `wrap-proxy-test-${Date.now()}-${++sessionCounter}`;
}

const LOW_SENSITIVITY = JSON.stringify({ score: 0.1, findings: [] });

describe("wrapDesensitize", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("替换检测到的 PII 并返回正确的 mappingCount", async () => {
    const session = uniqueSession();
    const piiJson = JSON.stringify([
      { type: "NAME", value: "张三" },
      { type: "PHONE", value: "13912345678" },
    ]);
    mockCallChat.mockResolvedValueOnce({ text: piiJson } as ChatCompletionResult);

    const config = makeConfig();
    const result = await wrapDesensitize(
      "请帮我联系张三，他的手机号是13912345678",
      config,
      session,
    );

    expect(result.wrapped).not.toContain("张三");
    expect(result.wrapped).not.toContain("13912345678");
    expect(result.mappingCount).toBe(2);
    expect(result.failed).toBeFalsy();

    getGlobalWrapMappingManager().clearSession(session);
  });

  it("未检测到 PII 时返回原文", async () => {
    const session = uniqueSession();
    mockCallChat.mockResolvedValueOnce({ text: "[]" } as ChatCompletionResult);

    const config = makeConfig();
    const input = "今天天气不错";
    const result = await wrapDesensitize(input, config, session);

    expect(result.wrapped).toBe(input);
    expect(result.mappingCount).toBe(0);
    expect(result.failed).toBeFalsy();
  });

  it("LLM 调用失败时降级返回原文并标记 failed", async () => {
    const session = uniqueSession();
    mockCallChat.mockRejectedValueOnce(new Error("connection refused"));

    const config = makeConfig();
    const input = "联系张三 13912345678";
    const result = await wrapDesensitize(input, config, session);

    expect(result.wrapped).toBe(input);
    expect(result.mappingCount).toBe(0);
    expect(result.failed).toBe(true);
  });
});

describe("wrapRestore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("mapping-only 模式通过映射表还原真实数据", async () => {
    const session = uniqueSession();
    const piiJson = JSON.stringify([
      { type: "NAME", value: "李四" },
      { type: "PHONE", value: "13800001111" },
    ]);
    mockCallChat.mockResolvedValueOnce({ text: piiJson } as ChatCompletionResult);

    const config = makeConfig({
      wrapConfig: { restoreMode: "mapping-only", fakeDataLocale: "zh-CN", mappingTtlMs: 300_000 },
    });
    const desResult = await wrapDesensitize("李四的号码是13800001111", config, session);

    expect(desResult.mappingCount).toBe(2);

    const restoreResult = await wrapRestore(desResult.wrapped, config, session);

    expect(restoreResult.restored).toContain("李四");
    expect(restoreResult.restored).toContain("13800001111");
    expect(restoreResult.llmCorrected).toBe(false);

    getGlobalWrapMappingManager().clearSession(session);
  });

  it("mapping-with-llm 模式调用 LLM 校正", async () => {
    const session = uniqueSession();
    const piiJson = JSON.stringify([{ type: "NAME", value: "王五" }]);
    mockCallChat.mockResolvedValueOnce({ text: piiJson } as ChatCompletionResult);

    const config = makeConfig({
      wrapConfig: {
        restoreMode: "mapping-with-llm",
        fakeDataLocale: "zh-CN",
        mappingTtlMs: 300_000,
      },
    });
    const desResult = await wrapDesensitize("帮我找王五", config, session);

    const manager = getGlobalWrapMappingManager();
    const mappingRestored = manager.reverseReplace(desResult.wrapped, session);
    const correctedText = mappingRestored.replace("帮我找", "请帮我联系");
    mockCallChat.mockResolvedValueOnce({ text: correctedText } as ChatCompletionResult);

    const restoreResult = await wrapRestore(desResult.wrapped, config, session);

    expect(restoreResult.llmCorrected).toBe(true);
    expect(restoreResult.restored).toContain("王五");

    manager.clearSession(session);
  });

  it("mapping-with-llm 模式 LLM 校正失败时降级到 mapping 结果", async () => {
    const session = uniqueSession();
    const piiJson = JSON.stringify([{ type: "NAME", value: "赵六" }]);
    mockCallChat.mockResolvedValueOnce({ text: piiJson } as ChatCompletionResult);

    const config = makeConfig({
      wrapConfig: {
        restoreMode: "mapping-with-llm",
        fakeDataLocale: "zh-CN",
        mappingTtlMs: 300_000,
      },
    });
    const desResult = await wrapDesensitize("赵六在哪里", config, session);

    mockCallChat.mockRejectedValueOnce(new Error("model timeout"));

    const restoreResult = await wrapRestore(desResult.wrapped, config, session);

    expect(restoreResult.restored).toContain("赵六");
    expect(restoreResult.llmCorrected).toBe(false);

    getGlobalWrapMappingManager().clearSession(session);
  });
});

describe("多轮会话映射一致性", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("同一 session 中相同 PII 两次 desensitize 映射到相同的虚假值", async () => {
    const session = uniqueSession();
    const piiJson = JSON.stringify([{ type: "NAME", value: "周七" }]);

    mockCallChat.mockResolvedValueOnce({ text: piiJson } as ChatCompletionResult);
    const config = makeConfig();
    const result1 = await wrapDesensitize("周七发了消息", config, session);

    mockCallChat.mockResolvedValueOnce({ text: piiJson } as ChatCompletionResult);
    const result2 = await wrapDesensitize("周七又发了消息", config, session);

    const manager = getGlobalWrapMappingManager();
    const entry1Fake = result1.wrapped.replace("发了消息", "").trim();
    const entry2Fake = result2.wrapped.replace("又发了消息", "").trim();
    expect(entry1Fake).toBe(entry2Fake);

    expect(result1.mappingCount).toBe(1);
    expect(result2.mappingCount).toBe(1);

    manager.clearSession(session);
  });
});

describe("scoreSensitivity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("返回低分表示文本安全", async () => {
    const session = uniqueSession();
    const responseJson = JSON.stringify({ score: 0.05, findings: [] });
    mockCallChat.mockResolvedValueOnce({ text: responseJson } as ChatCompletionResult);

    const result = await scoreSensitivity("今天天气不错", makeConfig(), session);
    expect(result.score).toBe(0.05);
    expect(result.findings).toHaveLength(0);
  });

  it("返回高分表示文本包含可疑 PII", async () => {
    const session = uniqueSession();
    const responseJson = JSON.stringify({
      score: 0.8,
      findings: ["包含真实手机号模式", "包含身份证号格式"],
    });
    mockCallChat.mockResolvedValueOnce({ text: responseJson } as ChatCompletionResult);

    const result = await scoreSensitivity("联系人电话13912345678", makeConfig(), session);
    expect(result.score).toBe(0.8);
    expect(result.findings).toHaveLength(2);
  });

  it("LLM 返回非法 JSON 时降级为最高分", async () => {
    const session = uniqueSession();
    mockCallChat.mockResolvedValueOnce({
      text: "I cannot evaluate this text",
    } as ChatCompletionResult);

    const result = await scoreSensitivity("some text", makeConfig(), session);
    expect(result.score).toBe(1.0);
    expect(result.findings.length).toBeGreaterThan(0);
  });

  it("LLM 返回带 markdown 代码块的 JSON 也能解析", async () => {
    const session = uniqueSession();
    const responseText = '```json\n{"score": 0.15, "findings": []}\n```';
    mockCallChat.mockResolvedValueOnce({ text: responseText } as ChatCompletionResult);

    const result = await scoreSensitivity("普通文本", makeConfig(), session);
    expect(result.score).toBe(0.15);
  });

  it("score 被 clamp 到 [0, 1] 范围", async () => {
    const session = uniqueSession();
    mockCallChat.mockResolvedValueOnce({
      text: JSON.stringify({ score: 2.5, findings: [] }),
    } as ChatCompletionResult);

    const result = await scoreSensitivity("text", makeConfig(), session);
    expect(result.score).toBe(1.0);
  });
});

describe("wrapDesensitize 敏感度检查集成", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("敏感度打分超阈值时标记为 failed", async () => {
    const session = uniqueSession();
    const piiJson = JSON.stringify([{ type: "NAME", value: "张三" }]);
    const highScore = JSON.stringify({ score: 0.7, findings: ["发现真实姓名模式"] });
    mockCallChat
      .mockResolvedValueOnce({ text: piiJson } as ChatCompletionResult)
      .mockResolvedValueOnce({ text: highScore } as ChatCompletionResult);

    const config = makeConfig({
      wrapConfig: {
        sensitivityThreshold: 0.3,
        enableSensitivityCheck: true,
        sensitivityBlockOnFail: true,
      },
    });
    const result = await wrapDesensitize("请联系张三", config, session);

    expect(result.failed).toBe(true);
    expect(result.sensitivityScore?.score).toBe(0.7);
    expect(result.sensitivityScore?.findings).toContain("发现真实姓名模式");
    expect(result.mappingCount).toBe(0);

    getGlobalWrapMappingManager().clearSession(session);
  });

  it("敏感度打分低于阈值时正常通过", async () => {
    const session = uniqueSession();
    const piiJson = JSON.stringify([{ type: "PHONE", value: "13800001234" }]);
    const lowScore = JSON.stringify({ score: 0.05, findings: [] });
    mockCallChat
      .mockResolvedValueOnce({ text: piiJson } as ChatCompletionResult)
      .mockResolvedValueOnce({ text: lowScore } as ChatCompletionResult);

    const config = makeConfig({
      wrapConfig: {
        sensitivityThreshold: 0.3,
        enableSensitivityCheck: true,
        sensitivityBlockOnFail: true,
      },
    });
    const result = await wrapDesensitize("手机号13800001234", config, session);

    expect(result.failed).toBeFalsy();
    expect(result.sensitivityScore?.score).toBe(0.05);
    expect(result.wrapped).not.toContain("13800001234");

    getGlobalWrapMappingManager().clearSession(session);
  });

  it("敏感度打分调用失败时降级为 failed", async () => {
    const session = uniqueSession();
    const piiJson = JSON.stringify([{ type: "NAME", value: "李四" }]);
    mockCallChat
      .mockResolvedValueOnce({ text: piiJson } as ChatCompletionResult)
      .mockRejectedValueOnce(new Error("LLM timeout"));

    const config = makeConfig({
      wrapConfig: {
        sensitivityThreshold: 0.3,
        enableSensitivityCheck: true,
        sensitivityBlockOnFail: true,
      },
    });
    const result = await wrapDesensitize("联系李四", config, session);

    expect(result.failed).toBe(true);
    expect(result.sensitivityScore?.score).toBe(1.0);

    getGlobalWrapMappingManager().clearSession(session);
  });
});
