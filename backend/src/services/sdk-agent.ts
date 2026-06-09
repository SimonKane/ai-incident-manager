import Anthropic from "@anthropic-ai/sdk";

// Skapar en agent och en environment en gång, kan återanvändas, ändras och arkiveras i Claude Console (https://platform.claude.com/dashboard)

// Gissningsvis mer kostnadseffektivt än att spec:a propmt alt initiera agent och environment varje gång

// Kräver CLI och <export ANTHROPIC_API_KEY='your-api-key-here'> i t.ex ~/.zshrc eller ~/.bashrc

async function main() {
  const client = new Anthropic();

  const agent = await client.beta.agents.create({
    name: "Coding Assistant",
    model: "claude-haiku-4-5",
    system:
      "You are a helpful coding assistant. Write clean, well-documented code.",
    tools: [{ type: "agent_toolset_20260401" }],
  });

  console.log(`Agent ID: ${agent.id}, version: ${agent.version}`);

  const environment = await client.beta.environments.create({
    name: "quickstart-env",
    config: {
      type: "cloud",
      networking: { type: "unrestricted" },
    },
  });
  console.log(`Environment ID: ${environment.id}`);
}

main().catch(console.error);
