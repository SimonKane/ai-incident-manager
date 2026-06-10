import Anthropic from "@anthropic-ai/sdk";
import { Incident, IncidentType } from "../models/incident.model";
const client = new Anthropic();

const testdata = {
  ALARM: `"prod-api-latency" in us-east-1`,
  StateChangeTime: "2026-06-10T08:23:11.000Z",
  OldStateValue: "OK",
  NewStateValue: "ALARM",
  Threshold: "2000ms",
  MetricName: "Latency",
  Namespace: "AWS/ApiGateway",
  Dimensions: "Stage=prod, ApiName=user-service",
  EvaluationPeriods: 3,
  DatapointsToAlarm: 3,
  CurrentValue: "8743ms",
};

const testdata2 = [
  "2026-06-10T09:12:03Z [ERROR] container exited with code 137 (OOMKilled)",
  "2026-06-10T09:12:04Z Task arn:aws:ecs:us-east-1:123456789012:task/prod/a3f9c stopped",
  "2026-06-10T09:12:10Z [INFO] Starting replacement task...",
  "2026-06-10T09:12:44Z [ERROR] container exited with code 137 (OOMKilled)",
  "2026-06-10T09:12:45Z Task arn:aws:ecs:us-east-1:123456789012:task/prod/b7d2e stopped",
  "2026-06-10T09:12:51Z [INFO] Starting replacement task...",
  "2026-06-10T09:13:22Z [ERROR] container exited with code 137 (OOMKilled)",
  "Service: payment-processor | Cluster: prod-cluster | Desired: 3 | Running: 0",
];

async function normalize(data: any) {
  const session = await client.beta.sessions.create({
    agent: "agent_017DBieyHopJheGedyLijfDq",
    environment_id: "env_01XiGui8aQgwsben2ass7Vto",
    title: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  });

  console.log(`Session ID: ${session.id}`);

  const stream = await client.beta.sessions.events.stream(session.id);

  await client.beta.sessions.events.send(session.id, {
    events: [
      {
        type: "user.message",
        content: [
          {
            type: "text",
            text: `${JSON.stringify(data)}`,
          },
        ],
      },
    ],
  });

  let response = "";

  for await (const event of stream) {
    if (event.type === "agent.message") {
      for (const block of event.content) {
        response += block.text;
      }
    } else if (event.type === "session.status_idle") {
      break;
    }
  }
  console.log(JSON.parse(response));
  const final = JSON.parse(response);
}

normalize(testdata2).catch(console.error);
