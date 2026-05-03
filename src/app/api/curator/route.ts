import { NextResponse } from "next/server";
import type { CuratorContext } from "@/lib/curatorContext";

type Body = {
  messages: { role: string; content: string }[];
  context: CuratorContext;
};

function buildSystemPrompt(ctx: CuratorContext) {
  return [
    `You are the official curator agent for the ENS artist ${ctx.artistEns}.`,
    `Your ENS handle in-product is ${ctx.curatorEns}.`,
    ctx.agentEnsip25Headline
      ? `ENSIP-25 / registry: ${ctx.agentEnsip25Headline}${ctx.agentEnsip25Verified ? " (verified)" : " (not fully verified)"}.`
      : "",
    ctx.curatorPitch ? `Artist description of your role: ${ctx.curatorPitch}` : "",
    `Artist statement: ${ctx.artistStatement || "(none yet)"}`,
    `Demo metrics — Art sales generated (mock): ${ctx.artSalesEth} ETH. Collector count (mock): ${ctx.collectorCount}.`,
    `Official contract addresses: ${ctx.contracts.length ? ctx.contracts.join(", ") : "(none listed)"}.`,
    `Be concise (2–5 sentences). Speak as their representative, not a generic bot.`,
    `Clearly label mock sales figures as demo estimates when mentioned.`,
  ]
    .filter(Boolean)
    .join("\n");
}

function mockReply(ctx: CuratorContext, lastUser: string): string {
  const q = lastUser.toLowerCase();
  if (/who are you|what are you/.test(q)) {
    return `I am the curator tied to ${ctx.curatorEns}, speaking for ${ctx.artistEns}. ${ctx.curatorPitch || "I help visitors understand their onchain work and official contracts."}`;
  }
  if (/eth|sale|revenue|money|earn/.test(q)) {
    return `Art sales generated is shown as about ${ctx.artSalesEth} ETH from the contracts you listed—mock data, not audited onchain totals. Net after fees may differ.`;
  }
  if (/collector|collectors|community/.test(q)) {
    return `Collector count is around ${ctx.collectorCount}, derived for the hackathon preview. Real distribution lives onchain across those wallets.`;
  }
  if (/contract|official|verify/.test(q)) {
    if (!ctx.contracts.length) {
      return `${ctx.artistEns} has not published official contract addresses in this demo yet. Ask them to add lines on their dashboard.`;
    }
    return `Official contracts configured for this page: ${ctx.contracts.slice(0, 3).join(", ")}${ctx.contracts.length > 3 ? ", …" : ""}. Always cross-check on a block explorer.`;
  }
  if (/statement|about|bio|story/.test(q)) {
    return ctx.artistStatement.trim()
      ? `From their statement: ${ctx.artistStatement.trim()}`
      : `They have not saved a statement in this demo yet—${ctx.artistEns} can add one from the dashboard.`;
  }
  return `I represent ${ctx.artistEns}. ${ctx.curatorPitch || "Ask about their contracts, collectors, or the demo sales figures shown on the proof page."}`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages, context } = body;
  if (!context?.artistEns || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last?.content?.trim()) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: mockReply(context, last.content) });
  }

  try {
    const system = buildSystemPrompt(context);
    const openaiMessages = [
      { role: "system" as const, content: system },
      ...messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: openaiMessages,
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    const data = (await res.json()) as {
      error?: { message?: string };
      choices?: { message?: { content?: string } }[];
    };
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "OpenAI error" },
        { status: 502 }
      );
    }
    const reply = data.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ reply: reply || mockReply(context, last.content) });
  } catch {
    return NextResponse.json({ reply: mockReply(context, last.content) });
  }
}
