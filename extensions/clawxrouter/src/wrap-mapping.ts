import { generateFakeValue } from "./fake-data.js";
import type { PiiMapping, WrapMappingEntry } from "./types.js";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class WrapMappingManager {
  private sessions: Map<string, WrapMappingEntry> = new Map();
  private defaultTtlMs: number;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(ttlMs: number = 300_000) {
    this.defaultTtlMs = ttlMs;
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
    if (typeof this.cleanupInterval.unref === "function") {
      this.cleanupInterval.unref();
    }
  }

  getOrCreateMapping(
    sessionKey: string,
    piiItems: Array<{ type: string; value: string }>,
    locale: string,
  ): PiiMapping[] {
    const now = Date.now();
    let entry = this.sessions.get(sessionKey);

    if (!entry || entry.lastAccessedAt + this.defaultTtlMs < now) {
      entry = {
        mappings: new Map(),
        createdAt: now,
        lastAccessedAt: now,
      };
      this.sessions.set(sessionKey, entry);
    }

    entry.lastAccessedAt = now;
    const result: PiiMapping[] = [];

    for (const item of piiItems) {
      const existing = entry.mappings.get(item.value);
      if (existing) {
        result.push(existing);
        continue;
      }

      const fake = generateFakeValue(item.type, item.value, locale);
      const mapping: PiiMapping = {
        original: item.value,
        fake,
        type: item.type,
      };
      entry.mappings.set(item.value, mapping);
      result.push(mapping);
    }

    return result;
  }

  forwardReplace(text: string, sessionKey: string): string {
    const entry = this.sessions.get(sessionKey);
    if (!entry) return text;

    const mappings = [...entry.mappings.values()].sort(
      (a, b) => b.original.length - a.original.length,
    );

    let result = text;
    for (const m of mappings) {
      result = result.replace(new RegExp(escapeRegExp(m.original), "g"), m.fake);
    }
    return result;
  }

  reverseReplace(text: string, sessionKey: string): string {
    const entry = this.sessions.get(sessionKey);
    if (!entry) return text;

    const mappings = [...entry.mappings.values()].sort((a, b) => b.fake.length - a.fake.length);

    let result = text;
    for (const m of mappings) {
      result = result.replace(new RegExp(escapeRegExp(m.fake), "g"), m.original);
    }
    return result;
  }

  getMappingCount(sessionKey: string): number {
    const entry = this.sessions.get(sessionKey);
    return entry ? entry.mappings.size : 0;
  }

  getMappings(sessionKey: string): PiiMapping[] {
    const entry = this.sessions.get(sessionKey);
    if (!entry) return [];
    return [...entry.mappings.values()];
  }

  clearSession(sessionKey: string): void {
    this.sessions.delete(sessionKey);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.sessions) {
      if (entry.lastAccessedAt + this.defaultTtlMs < now) {
        this.sessions.delete(key);
      }
    }
  }

  dispose(): void {
    clearInterval(this.cleanupInterval);
  }
}

let _globalManager: WrapMappingManager | undefined;

export function getGlobalWrapMappingManager(ttlMs?: number): WrapMappingManager {
  if (!_globalManager) {
    _globalManager = new WrapMappingManager(ttlMs);
  }
  return _globalManager;
}
