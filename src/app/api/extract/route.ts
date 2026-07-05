import Anthropic from "@anthropic-ai/sdk";

// The Anthropic SDK needs the Node.js runtime (not Edge).
export const runtime = "nodejs";
// Reading a whole contract can take a moment; give the route headroom.
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ExtractRequest {
  text?: string;
  pdfBase64?: string;
  fileName?: string;
}

const INSTRUCTIONS = `You are Signit, a Saudi post-signature contract-intelligence assistant. Read the signed contract provided and extract its key terms.

Return ONLY strict JSON (no markdown, no preamble) with this exact shape:
{
  "title_ar": "contract title in Arabic",
  "title_en": "contract title in English",
  "party_ar": "the counterparty name in Arabic",
  "party_en": "the counterparty name in English",
  "type": one of "nda" | "msa" | "sow" | "lease" | "employment" | "po" | "licence" (NDA / Master Services Agreement / Statement of Work / Lease / Employment / Purchase Order / Licence Agreement),
  "typeConfidence": number 0-100 (your confidence in the contract-type classification above),
  "valueSAR": number (total contract value in SAR, 0 if none),
  "endGreg": "YYYY-MM-DD" (Gregorian end/expiry date),
  "endHijri": "YYYY/MM/DD" (Hijri end date; best estimate),
  "autoRenew": boolean,
  "noticeDays": number (renewal notice window in days, 0 if none),
  "risk": one of "high" | "medium" | "low",
  "anomaly_ar": "one short Arabic sentence describing any risk/anomaly, or null",
  "anomaly_en": "one short English sentence describing any risk/anomaly, or null",
  "facts": [
    {
      "k": one of "value" | "renewal" | "liability" | "penalty" | "law" | "term" | "pdpl",
      "conf": one of "high" | "medium" | "low" (your confidence in this extraction),
      "va": "the extracted value, in Arabic",
      "ve": "the extracted value, in English",
      "sa": "the exact source clause it came from, in Arabic (quote it)",
      "se": "the exact source clause it came from, in English (quote it)"
    }
  ]
}
Extract 2-5 facts. Use confidence "low" when the contract is ambiguous or the term is missing. Fill both Arabic and English for every text field. If a date is unknown, estimate reasonably.`;

function stripFences(s: string): string {
  return s.replace(/```json|```/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const { text, pdfBase64, fileName } = (await req.json()) as ExtractRequest;

    if (!pdfBase64 && !text?.trim()) {
      return Response.json(
        { ok: false, error: "No contract text or file provided" },
        { status: 200 },
      );
    }

    const content: Anthropic.ContentBlockParam[] = [];
    if (pdfBase64) {
      content.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: pdfBase64,
        },
      });
      content.push({
        type: "text",
        text: `Extract the key terms from the attached signed contract${
          fileName ? ` "${fileName}"` : ""
        }.`,
      });
    } else {
      content.push({
        type: "text",
        text: `Extract the key terms from this signed contract:\n"""\n${text}\n"""`,
      });
    }

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      // Static extraction schema/instructions live in the cacheable system
      // prefix; only the document/text varies per request.
      system: [
        { type: "text", text: INSTRUCTIONS, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content }],
    });

    const raw = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed: unknown = JSON.parse(stripFences(raw));
    if (typeof parsed !== "object" || parsed === null) {
      return Response.json(
        { ok: false, error: "Model returned an unexpected shape" },
        { status: 200 },
      );
    }

    return Response.json({ ok: true, data: parsed });
  } catch (e) {
    // Graceful failure — the client falls back to manual entry.
    return Response.json({ ok: false, error: String(e) }, { status: 200 });
  }
}
