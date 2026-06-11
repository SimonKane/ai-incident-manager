import Anthropic from "@anthropic-ai/sdk";
import { Staff } from "../models/staff.model";
import { IncidentType, Incident } from "../models/incident.model";
import { Analyzed, AnalyzedType } from "../models/analyzedIncident.model";

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

const testdata3 = [
  "eventTime: 2026-06-10T05:30:01Z",
  "eventName: DeleteBucket",
  "eventSource: s3.amazonaws.com",
  "userIdentity.type: IAMUser",
  "userIdentity.userName: temp-contractor-04",
  "requestParameters.bucketName: prod-customer-exports",
  "sourceIPAddress: 203.0.113.77",
  "userAgent: aws-cli/2.9.0",
  "errorCode: (none)",
  "additionalEventData.DeleteMarkerCreated: false",
];

export async function normalize(data: any) {
  const session = await client.beta.sessions.create({
    agent: "agent_017DBieyHopJheGedyLijfDq",
    environment_id: "env_01XiGui8aQgwsben2ass7Vto",
    title: `Incident ${Math.floor(10000 + Math.random() * 90000)}`,
  });

  const stream = await client.beta.sessions.events.stream(session.id);

  console.log("normalize input:", JSON.stringify(data));

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
  const cleaned = response
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "");
  const normalized = JSON.parse(cleaned);
  const incident: Omit<IncidentType, "_id"> = {
    title: normalized.title,
    description: normalized.description,
    severity: normalized.severity,
    service: normalized.service,
    environment: normalized.environment,
    timestamp: normalized.timestamp,
    status: normalized.status,
    timeline: normalized.timeline,
  };

  const saved = await Incident.create({ ...incident });
  return saved;
}

export async function analyze(data: any) {
  try {
    const incident = await normalize(data);
    const staff = await Staff.find({});

    const session = await client.beta.sessions.create({
      agent: "agent_01GhmDyyF5vmMhPqaoBWmGhQ",
      environment_id: "env_01XiGui8aQgwsben2ass7Vto",
      title: `analyzed: ${incident.title}`,
    });

    const stream = await client.beta.sessions.events.stream(session.id);

    await client.beta.sessions.events.send(session.id, {
      events: [
        {
          type: "user.message",
          content: [
            {
              type: "text",
              text: `Available staff:\n${JSON.stringify(staff, null, 2)}\n\nIncident:\n${JSON.stringify(incident, null, 2)}`,
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
    const cleaned = response
      .trim()
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "");
    const normalized = JSON.parse(cleaned);

    const analyzed: Omit<AnalyzedType, "_id"> = {
      type: normalized.type,
      priority: normalized.priority,
      action: normalized.action,
      target: normalized.target,
      assignedTo: normalized.assignedTo,
      recommendation: normalized.recommendation,
      incident: incident._id,
    };

    await Analyzed.create({ ...analyzed });
    return analyzed;
  } catch (error) {
    console.error("analyze failed:", error);
    return undefined;
  }
}
