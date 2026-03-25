import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WrapMappingManager } from "./wrap-mapping.js";

describe("WrapMappingManager", () => {
  let manager: WrapMappingManager;

  beforeEach(() => {
    manager = new WrapMappingManager(300_000);
  });

  afterEach(() => {
    manager.dispose();
  });

  it("forwardReplace replaces original PII with fake values", () => {
    const piiItems = [
      { type: "NAME", value: "张伟" },
      { type: "PHONE", value: "13800138000" },
    ];
    const mappings = manager.getOrCreateMapping("sess-1", piiItems, "zh-CN");

    const text = "用户张伟的手机号是13800138000";
    const replaced = manager.forwardReplace(text, "sess-1");

    expect(replaced).not.toContain("张伟");
    expect(replaced).not.toContain("13800138000");
    expect(replaced).toContain(mappings[0].fake);
    expect(replaced).toContain(mappings[1].fake);
  });

  it("reverseReplace restores fake values back to originals", () => {
    const piiItems = [
      { type: "NAME", value: "张伟" },
      { type: "PHONE", value: "13800138000" },
    ];
    const mappings = manager.getOrCreateMapping("sess-1", piiItems, "zh-CN");

    const fakeText = `用户${mappings[0].fake}的手机号是${mappings[1].fake}`;
    const restored = manager.reverseReplace(fakeText, "sess-1");

    expect(restored).toContain("张伟");
    expect(restored).toContain("13800138000");
    expect(restored).not.toContain(mappings[0].fake);
    expect(restored).not.toContain(mappings[1].fake);
  });

  it("same PII in same session maps to same fake value across calls", () => {
    const pii1 = [{ type: "EMAIL", value: "test@real.com" }];
    const pii2 = [
      { type: "EMAIL", value: "test@real.com" },
      { type: "NAME", value: "John" },
    ];

    const mappings1 = manager.getOrCreateMapping("sess-1", pii1, "en");
    const mappings2 = manager.getOrCreateMapping("sess-1", pii2, "en");

    expect(mappings1[0].fake).toBe(mappings2[0].fake);
    expect(mappings2).toHaveLength(2);
  });

  it("different sessions have independent mappings", () => {
    const pii = [{ type: "NAME", value: "张伟" }];

    const m1 = manager.getOrCreateMapping("sess-a", pii, "zh-CN");
    const m2 = manager.getOrCreateMapping("sess-b", pii, "zh-CN");

    expect(m1[0].fake).toBeDefined();
    expect(m2[0].fake).toBeDefined();

    manager.clearSession("sess-a");
    expect(manager.getMappingCount("sess-a")).toBe(0);
    expect(manager.getMappingCount("sess-b")).toBe(1);
  });

  it("TTL expiry cleans up stale sessions", async () => {
    const shortManager = new WrapMappingManager(100);
    try {
      shortManager.getOrCreateMapping("sess-ttl", [{ type: "NAME", value: "李娜" }], "zh-CN");
      expect(shortManager.getMappingCount("sess-ttl")).toBe(1);

      await new Promise((r) => setTimeout(r, 150));
      shortManager.cleanup();

      expect(shortManager.getMappingCount("sess-ttl")).toBe(0);
    } finally {
      shortManager.dispose();
    }
  });

  it("long value replaced before its substring to avoid corruption", () => {
    const pii = [
      { type: "NAME", value: "张" },
      { type: "NAME", value: "张伟强" },
    ];
    const mappings = manager.getOrCreateMapping("sess-sub", pii, "zh-CN");
    const shortFake = mappings[0].fake;
    const longFake = mappings[1].fake;

    const text = "联系张伟强和张经理";
    const replaced = manager.forwardReplace(text, "sess-sub");

    expect(replaced).toContain(longFake);
    expect(replaced).not.toContain("张伟强");

    const reverseText = `联系${longFake}和${shortFake}经理`;
    const restored = manager.reverseReplace(reverseText, "sess-sub");
    expect(restored).toContain("张伟强");
    expect(restored).toContain("张");
  });

  it("clearSession removes all mappings for specified session", () => {
    manager.getOrCreateMapping(
      "sess-clear",
      [
        { type: "NAME", value: "王芳" },
        { type: "PHONE", value: "13900139000" },
      ],
      "zh-CN",
    );
    expect(manager.getMappingCount("sess-clear")).toBe(2);

    manager.clearSession("sess-clear");
    expect(manager.getMappingCount("sess-clear")).toBe(0);

    const text = "王芳 13900139000";
    expect(manager.forwardReplace(text, "sess-clear")).toBe(text);
  });

  it("getMappingCount returns correct count", () => {
    expect(manager.getMappingCount("empty")).toBe(0);

    manager.getOrCreateMapping(
      "sess-count",
      [
        { type: "NAME", value: "刘洋" },
        { type: "EMAIL", value: "liu@test.com" },
        { type: "PHONE", value: "13700137000" },
      ],
      "zh-CN",
    );
    expect(manager.getMappingCount("sess-count")).toBe(3);

    manager.getOrCreateMapping("sess-count", [{ type: "NAME", value: "刘洋" }], "zh-CN");
    expect(manager.getMappingCount("sess-count")).toBe(3);
  });
});
