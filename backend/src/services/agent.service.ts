import Anthropic from "@anthropic-ai/sdk";
import { io } from "../index";
import { Staff } from "../models/staff.model";
import { IncidentType, Incident } from "../models/incident.model";
import { Analyzed, AnalyzedType } from "../models/analyzedIncident.model";

const client = new Anthropic();

export async function normalize(data: any) {
  const session = await client.beta.sessions.create({
    agent: "agent_017DBieyHopJheGedyLijfDq",
    environment_id: "env_01XiGui8aQgwsben2ass7Vto",
    title: `Incident ${Math.floor(10000 + Math.random() * 90000)}`,
  });

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

    io.emit("incident:processed", {
      incident,
      analyzed,
    });

    return analyzed;
  } catch (error) {
    console.error("Analysis failed:", error);
    return undefined;
  }
}
