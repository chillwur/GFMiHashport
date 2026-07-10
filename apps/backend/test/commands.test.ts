import { describe, expect, it } from "vitest";
import { parseCommand } from "../src/lib/commands.js";

describe("parseCommand", () => {
  it("parses balance and address", () => {
    expect(parseCommand("balance")).toEqual({ kind: "balance" });
    expect(parseCommand("  Bal ")).toEqual({ kind: "balance" });
    expect(parseCommand("Address")).toEqual({ kind: "address" });
  });

  it("parses send with phone-number recipients", () => {
    expect(parseCommand("send 5 XLM to +2348000000000")).toEqual({
      kind: "send",
      amount: "5",
      asset: "XLM",
      recipient: "+2348000000000",
    });
  });

  it("parses send with G-address recipients and lowercase assets", () => {
    const g = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";
    expect(parseCommand(`SEND 12.5 usdc to ${g}`)).toEqual({
      kind: "send",
      amount: "12.5",
      asset: "USDC",
      recipient: g,
    });
  });

  it("parses swap with 'to' and 'for'", () => {
    expect(parseCommand("swap 10 XLM to USDC")).toEqual({
      kind: "swap",
      amount: "10",
      fromAsset: "XLM",
      toAsset: "USDC",
    });
    expect(parseCommand("swap 3 usdc for xlm")).toEqual({
      kind: "swap",
      amount: "3",
      fromAsset: "USDC",
      toAsset: "XLM",
    });
  });

  it("routes greetings to help and garbage to unknown", () => {
    expect(parseCommand("hi").kind).toBe("help");
    expect(parseCommand("deploy").kind).toBe("deploy");
    expect(parseCommand("wire me money pls")).toEqual({
      kind: "unknown",
      raw: "wire me money pls",
    });
  });
});
