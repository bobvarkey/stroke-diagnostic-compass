import { describe, expect, it } from "vitest";
import { AiProviderError, describeAiError } from "../lib/aiProviders";
import { buildAnalyzeDocumentMessages, parseJsonFromModel } from "../lib/aiPrompts";

describe("parseJsonFromModel", () => {
  it("parses a fenced JSON reply", () => {
    const reply = 'Here you go:\n```json\n{"summary":"ok","labs":[]}\n```';
    expect(parseJsonFromModel(reply)).toEqual({ summary: "ok", labs: [] });
  });

  it("parses JSON embedded in prose", () => {
    expect(parseJsonFromModel('Result: {"summary":"ok"} done')).toEqual({ summary: "ok" });
  });

  it("throws when no JSON is present", () => {
    expect(() => parseJsonFromModel("no data here")).toThrow();
  });
});

describe("buildAnalyzeDocumentMessages", () => {
  it("appends the image as a second part when provided", () => {
    const { user } = buildAnalyzeDocumentMessages({
      documentText: "CT head completed",
      checkedTests: ["CBC"],
      imageDataUrl: "data:image/png;base64,AAAA",
    });
    expect(user).toHaveLength(2);
    expect(user[0]).toMatchObject({ type: "text" });
    expect(user[1]).toEqual({ type: "image", dataUrl: "data:image/png;base64,AAAA" });
  });

  it("includes race-specific guidance from demographics", () => {
    const { system } = buildAnalyzeDocumentMessages({
      documentText: "History",
      checkedTests: [],
      demographics: { race: "south-asian" },
    });
    expect(system).toContain("CYP2C19");
  });

  it("does not add an image part without an image", () => {
    const { user } = buildAnalyzeDocumentMessages({
      documentText: "History",
      checkedTests: [],
    });
    expect(user).toHaveLength(1);
  });
});

describe("describeAiError", () => {
  it("explains a rejected key", () => {
    const error = new AiProviderError("openai", "auth", "bad key", 401);
    expect(describeAiError(error)).toContain("rejected this API key");
  });

  it("points quota failures at the billing dashboard", () => {
    const error = new AiProviderError("anthropic", "quota", "no credits", 402);
    expect(describeAiError(error)).toContain("billing dashboard");
  });

  it("passes through non-provider errors", () => {
    expect(describeAiError(new Error("boom"))).toBe("boom");
  });
});
