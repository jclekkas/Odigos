/**
 * Optional model eval for a handful of quote texts.
 * Skips, and spends nothing, when OPENAI_API_KEY is unset.
 * The scheduled audit workflow does not run this script.
 *
 *   OPENAI_API_KEY=... OPENAI_MODEL=gpt-4o npx tsx scripts/eval-golden-quotes.ts
 */
import OpenAI from "openai";

const key = process.env.OPENAI_API_KEY?.trim();
if (!key) {
  console.log("No OPENAI_API_KEY set. Skipping the model eval.");
  process.exit(0);
}

const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o";
const baseURL = process.env.OPENAI_BASE_URL?.trim() || undefined;

const samples = [
  {
    id: "ca-over-cap",
    text: "California dealer. Sale price $32,000. OTD $36,400. APR 4.9% for 60 months. Doc fee $499.",
    expect: "doc fee over the California cap",
  },
  {
    id: "tx-not-a-hard-cap",
    text: "Texas dealer. Sale price $30,000. OTD $34,000. APR 5.9% for 60 months. Documentary fee $350.",
    expect: "not an automatic statutory cap violation",
  },
  {
    id: "lease-missing-factor",
    text: "Honda lease in Ohio. $429 a month for 36 months, 12,000 miles a year. No money factor and no residual.",
    expect: "missing lease terms",
  },
];

const client = new OpenAI({ apiKey: key, baseURL });
let passed = 0;

for (const sample of samples) {
  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You check car dealer quotes. Reply with one short sentence naming the main problem, or say the quote looks complete.",
      },
      { role: "user", content: sample.text },
    ],
  });
  const answer = response.choices[0]?.message?.content ?? "";
  console.log(`\n${sample.id}`);
  console.log(`expected topic: ${sample.expect}`);
  console.log(`model: ${answer}`);
  if (answer.trim().length > 0) passed += 1;
}

console.log(`\nModel returned text for ${passed} of ${samples.length} samples. This is not a pass/fail score. Read the answers.`);
