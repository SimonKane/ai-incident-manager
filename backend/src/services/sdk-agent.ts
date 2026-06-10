import Anthropic from "@anthropic-ai/sdk";

// Skapar en agent och en environment en gång, kan återanvändas, ändras och arkiveras i Claude Console (https://platform.claude.com/dashboard)

// Gissningsvis mer kostnadseffektivt än att spec:a propmt alt initiera agent och environment varje gång

// Kräver CLI och <export ANTHROPIC_API_KEY='your-api-key-here'> i t.ex ~/.zshrc eller ~/.bashrc

async function main() {
  const client = new Anthropic();

  const agent = await client.beta.agents.create({
    name: "incident-ai",
    model: "claude-haiku-4-5",
    system: `You are an AI that normalizes surveillance data into a structured incident format.

Read the following raw data and create an incident description.

Respond ONLY with a JSON object in this format (no other text):
{
  "title": "Short, describing title (maximum 10 words)",
  "description": "detailed description that summarizes the problem, include all relevant info from the logs and metrics",
  "status": "open",
  "priority": "critical" | "high" | "medium" | "low"
}`,

    tools: [{ type: "agent_toolset_20260401" }],
  });

  console.log(`Agent ID: ${agent.id}, version: ${agent.version}`);

  const environment = await client.beta.environments.create({
    name: "ai-env",
    config: {
      type: "cloud",
      networking: { type: "unrestricted" },
    },
  });
  console.log(`Environment ID: ${environment.id}`);
}

main().catch(console.error);
