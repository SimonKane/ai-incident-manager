import Anthropic from "@anthropic-ai/sdk";

// Grundläggande API-anrop, ett meddelande

// Kräver <export ANTHROPIC_API_KEY='your-api-key-here'> i t.ex ~/.zshrc eller ~/.bashrc

// Kör med "npx tsx src/services/sdk-msg.ts"

async function main() {
  const anthropic = new Anthropic();

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1000,
    messages: [{ role: "user", content: "Hello! Tell me a fun fact." }],
  });
  console.log(msg);
}

main().catch(console.error);
