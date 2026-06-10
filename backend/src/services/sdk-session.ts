import Anthropic from "@anthropic-ai/sdk";

async function main() {
  const client = new Anthropic();

  const session = await client.beta.sessions.create({
    agent: "agent_01KaScu4BXH2xsH2XBsu61S7",
    environment_id: "env_01T6ssvRjWnfrPUhrZGWgd1L",
    title: "incident session",
  });
  console.log(`Session ID: ${session.id}`);

  const stream = await client.beta.sessions.events.stream(
    "sesn_017Gf7Ez99Dxk2SZ6Rxd8DMo",
  );

  await client.beta.sessions.events.send("sesn_017Gf7Ez99Dxk2SZ6Rxd8DMo", {
    events: [
      {
        type: "user.message",
        content: [
          {
            type: "text",
            text: "Create a Python script that generates the first 20 Fibonacci numbers and saves them to fibonacci.txt",
          },
        ],
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "agent.message") {
      for (const block of event.content) {
        process.stdout.write(block.text);
      }
    } else if (event.type === "agent.mcp_tool_use") {
      console.log(`\n[Using tool: ${event.name}]`);
    } else if (event.type === "session.status_idle") {
      console.log("\n\nAgent finished.");
      break;
    }
  }
}

main().catch(console.error);
