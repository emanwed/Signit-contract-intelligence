import Anthropic from "@anthropic-ai/sdk";
import type { AskAnswer, CompactContract } from "@/lib/types";

// The Anthropic SDK needs the Node.js runtime (not Edge).
export const runtime = "nodejs";

// Workhorse model. Note: SETUP.md's "claude-sonnet-5" is not a valid model ID;
// claude-sonnet-4-6 is the current Sonnet the guide intends (swap to
// claude-haiku-4-5 for cheaper/faster). The key is read only here, server-side.
const MODEL = "claude-sonnet-4-6";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Stable instruction prefix. Kept in the `system` block (and marked cacheable)
// so instructions + portfolio form a constant prefix and the volatile question
// goes last — the caching-optimal layout. Prompt caching activates automatically
// once that prefix crosses the model's minimum (2048 tokens on Sonnet 4.6); until
// then it's a harmless no-op, and the structure already trims tokens per call.
const SYSTEM = `You are Signit, a Saudi post-signature contract-intelligence assistant.
The user's question may be written in Arabic, English, or Franco-Arabic (Arabizi/Franco — Arabic in Latin letters and numbers, where digits stand in for letters: 3=ع, 7=ح, 2=ء/ق, 5=خ, 9=ص; so "3o2ood"/"3okood"=عقود, "tajdeed"=تجديد, "mas2ouleya"=مسؤولية, "bayanat"=بيانات). Interpret the question in whichever it is written in, then answer.
Answer ONLY from the provided portfolio JSON — never invent contract ids or figures.
Return ONLY strict JSON, no markdown, no preamble:
{"answer_ar":"one concise Arabic sentence","answer_en":"one concise English sentence","matchIds":["ids that match"]}`;

interface AskRequest {
  question: string;
  portfolio: CompactContract[];
}

function isAskAnswer(v: unknown): v is AskAnswer {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.answer_ar === "string" &&
    typeof o.answer_en === "string" &&
    Array.isArray(o.matchIds) &&
    o.matchIds.every((x) => typeof x === "string")
  );
}

export async function POST(req: Request) {
  try {
    const { question, portfolio } = (await req.json()) as AskRequest;

    if (!question?.trim() || !Array.isArray(portfolio)) {
      return Response.json(
        { ok: false, error: "Missing question or portfolio" },
        { status: 200 },
      );
    }

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512, // answer is two short sentences + a few ids
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [
        {
          role: "user",
          content: [
            // Portfolio is stable within a session → part of the cached prefix.
            {
              type: "text",
              text: `Portfolio JSON:\n${JSON.stringify(portfolio)}`,
              cache_control: { type: "ephemeral" },
            },
            // Volatile question last — outside any cache breakpoint.
            { type: "text", text: `Question: "${question}"` },
          ],
        },
      ],
    });

    const text = msg.content
      .filter(
        (b): b is Anthropic.TextBlock => b.type === "text",
      )
      .map((b) => b.text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const parsed: unknown = JSON.parse(text);
    if (!isAskAnswer(parsed)) {
      return Response.json(
        { ok: false, error: "Model returned an unexpected shape" },
        { status: 200 },
      );
    }

    return Response.json({ ok: true, data: parsed });
  } catch (e) {
    // Graceful failure — the client falls back to the local keyword matcher,
    // so the demo never visibly breaks (e.g. missing key, network, rate limit).
    return Response.json({ ok: false, error: String(e) }, { status: 200 });
  }
}
