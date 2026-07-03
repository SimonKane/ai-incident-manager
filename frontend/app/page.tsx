"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import FilterButton from "../components/FilterButton";
import IncidentCard from "../components/IncidentCard";
import IncidentDetail from "../components/IncidentDetail";
import TeamSettings from "../components/TeamSettings";

type Severity = "Critical" | "Warning" | "Info";
type Status = "Resolved" | "Escalated" | "Pending";
type Filter = "All" | "Critical" | "Warnings" | "Info";
type AppView = "incidents" | "team";

type Incident = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  service: string;
  environment: string;
  timestamp: string;
  status: Status;
  specifiedError: string;
  remediation: string;
  impact: string;
  confidence: string;
  timeline: Array<{
    time: string;
    title: string;
    description?: string;
  }>;
  actions: Array<{
    id: string;
    title: string;
    timestamp: string;
    status: "Pending" | "Running" | "Done";
  }>;
  assignedTo: {
    name: string;
    department: string;
    phoneNumber?: string | null;
    notificationMethods?: string[];
  } | null;
};

const demoIncidents: Incident[] = [
  {
    id: "inc-1042",
    title: "Checkout API latency spike",
    description:
      "P95 latency crossed 2.8s after a new release started routing traffic through the fraud scoring service.",
    severity: "Critical",
    service: "checkout-api",
    environment: "Production",
    timestamp: "10:42:18",
    status: "Escalated",
    specifiedError:
      "The checkout endpoint is healthy but slow. Error budget burn is high and conversion can be affected if the queue keeps growing.",
    remediation:
      "Roll traffic back to revision checkout-api-00040, keep fraud scoring in degraded async mode, and inspect the new cache miss pattern.",
    impact: "Customer checkout may complete slowly in EU and US regions.",
    confidence: "94%",
    timeline: [
      {
        time: "10:42:18",
        title: "Signal received",
        description: "Latency anomaly detected from synthetic checkout probes.",
      },
      {
        time: "10:42:31",
        title: "AI analysis completed",
        description: "Release correlation found against checkout-api-00041.",
      },
      {
        time: "10:42:44",
        title: "Simulation notified owner",
        description: "Slack and SMS delivery simulated for the on-call engineer.",
      },
    ],
    actions: [
      {
        id: "act-1042-1",
        title: "Prepare rollback command for checkout-api-00040",
        timestamp: "AI action generated",
        status: "Done",
      },
    ],
    assignedTo: {
      name: "Mira Lind",
      department: "Platform",
      phoneNumber: "+46 70 000 12 34",
      notificationMethods: ["slack", "sms"],
    },
  },
  {
    id: "inc-9821",
    title: "Payment worker memory pressure",
    description:
      "Payment worker containers are restarting after memory climbs during invoice batch processing.",
    severity: "Warning",
    service: "payment-worker",
    environment: "Production",
    timestamp: "09:58:03",
    status: "Pending",
    specifiedError:
      "OOM restarts are below the incident threshold but trending upward. Batch jobs can be delayed if memory is not capped.",
    remediation:
      "Reduce batch size for the next run, inspect the invoice serializer, and raise a temporary memory limit while the leak is isolated.",
    impact: "Invoices can be delayed, but card payments are still processing.",
    confidence: "88%",
    timeline: [
      {
        time: "09:58:03",
        title: "Warning threshold crossed",
        description: "Three restarts observed in the last 20 minutes.",
      },
      {
        time: "09:58:12",
        title: "Likely cause grouped",
        description: "Memory growth matches invoice batch windows.",
      },
    ],
    actions: [
      {
        id: "act-9821-1",
        title: "Open payment-worker memory profile",
        timestamp: "Ready for engineer",
        status: "Pending",
      },
    ],
    assignedTo: {
      name: "Noah Berg",
      department: "Payments",
      notificationMethods: ["slack"],
    },
  },
  {
    id: "inc-7210",
    title: "Suspicious IAM access pattern",
    description:
      "A deploy token attempted role assumptions from an unexpected ASN outside the approved CI network.",
    severity: "Critical",
    service: "iam-guard",
    environment: "Production",
    timestamp: "08:17:49",
    status: "Resolved",
    specifiedError:
      "The token is no longer active. Audit logs show denied role assumptions and no confirmed production mutation.",
    remediation:
      "Rotate the deploy token, keep the temporary deny rule for 24 hours, and review the last successful role assumption.",
    impact: "No confirmed customer impact. Security team should still review.",
    confidence: "91%",
    timeline: [
      {
        time: "08:17:49",
        title: "Security signal detected",
        description: "CloudTrail pattern matched the suspicious role rule.",
      },
      {
        time: "08:18:08",
        title: "Token contained",
        description: "Deny rule simulated and incident marked resolved.",
      },
    ],
    actions: [
      {
        id: "act-7210-1",
        title: "Generate token rotation checklist",
        timestamp: "AI action completed",
        status: "Done",
      },
    ],
    assignedTo: {
      name: "Elin Stone",
      department: "Security",
      notificationMethods: ["slack", "sms"],
    },
  },
  {
    id: "inc-4308",
    title: "Search index lag recovered",
    description:
      "Search ingestion lag briefly increased during a data import and returned to normal without intervention.",
    severity: "Info",
    service: "search-indexer",
    environment: "Staging",
    timestamp: "07:41:22",
    status: "Resolved",
    specifiedError:
      "Index lag peaked at 11 minutes during a staging import and is now below the alert threshold.",
    remediation:
      "No action required. Keep the import job under observation during the next scheduled run.",
    impact: "No production impact.",
    confidence: "97%",
    timeline: [
      {
        time: "07:41:22",
        title: "Informational event logged",
        description: "Staging import caused temporary ingestion lag.",
      },
      {
        time: "07:49:10",
        title: "Recovered",
        description: "Lag returned to the normal operating range.",
      },
    ],
    actions: [],
    assignedTo: null,
  },
];

export default function Home() {
  const [activeView, setActiveView] = useState<AppView>("incidents");
  const [selectedIncident, setSelectedIncident] = useState<string | null>(
    demoIncidents[0].id,
  );
  const [filter, setFilter] = useState<Filter>("All");
  const [feedState, setFeedState] = useState<"syncing" | "ready">("syncing");

  useEffect(() => {
    const timer = window.setTimeout(() => setFeedState("ready"), 850);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredIncidents = useMemo(
    () =>
      demoIncidents.filter((incident) => {
        if (filter === "All") return true;
        if (filter === "Critical") return incident.severity === "Critical";
        if (filter === "Warnings") return incident.severity === "Warning";
        if (filter === "Info") return incident.severity === "Info";
        return true;
      }),
    [filter],
  );

  const incident =
    demoIncidents.find((item) => item.id === selectedIncident) ??
    filteredIncidents[0] ??
    null;

  const filterCounts = {
    All: demoIncidents.length,
    Critical: demoIncidents.filter((item) => item.severity === "Critical")
      .length,
    Warnings: demoIncidents.filter((item) => item.severity === "Warning")
      .length,
    Info: demoIncidents.filter((item) => item.severity === "Info").length,
  };

  const handledCount = demoIncidents.filter(
    (item) => item.status === "Resolved",
  ).length;

  return (
    <div className="min-h-screen bg-[#071014] text-slate-100">
      <div className="flex min-h-screen">
        <Navbar
          activeView={activeView}
          onViewChange={setActiveView}
          activeCount={demoIncidents.length}
          handledCount={handledCount}
          feedState={feedState}
        />

        {activeView === "team" ? (
          <TeamSettings />
        ) : (
          <main className="flex min-w-0 flex-1 flex-col gap-6 px-5 py-5 lg:px-8 lg:py-7">
          <section className="rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(20,184,166,0.18),rgba(15,23,42,0.92)_42%,rgba(88,28,135,0.22))] px-5 py-5 shadow-2xl shadow-black/25 lg:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
                  Showcase mode
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white lg:text-5xl">
                  AI Incident Manager
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  A clean incident command center that classifies operational
                  signals, recommends next actions, assigns ownership, and
                  simulates Slack/SMS notification without requiring a backend.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-xs text-slate-400">Active</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {demoIncidents.length}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-xs text-slate-400">Critical</p>
                  <p className="mt-1 text-2xl font-semibold text-red-300">
                    {filterCounts.Critical}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-xs text-slate-400">MTTR demo</p>
                  <p className="mt-1 text-2xl font-semibold text-teal-200">
                    12m
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 rounded-lg border border-white/10 bg-slate-950/60 p-4 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Incident queue
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Seeded portfolio data with backend-safe fallbacks.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    label="All"
                    count={filterCounts.All}
                    active={filter === "All"}
                    onClick={() => setFilter("All")}
                  />
                  <FilterButton
                    label="Critical"
                    count={filterCounts.Critical}
                    active={filter === "Critical"}
                    onClick={() => setFilter("Critical")}
                  />
                  <FilterButton
                    label="Warnings"
                    count={filterCounts.Warnings}
                    active={filter === "Warnings"}
                    onClick={() => setFilter("Warnings")}
                  />
                  <FilterButton
                    label="Info"
                    count={filterCounts.Info}
                    active={filter === "Info"}
                    onClick={() => setFilter("Info")}
                  />
                </div>
              </div>

              <div className="scrollbar-hidden mt-4 max-h-[calc(100vh-290px)] space-y-3 overflow-y-auto pr-1">
                {filteredIncidents.map((item) => (
                  <IncidentCard
                    key={item.id}
                    {...item}
                    onClick={() => setSelectedIncident(item.id)}
                    isSelected={incident?.id === item.id}
                  />
                ))}
              </div>
            </div>

            {incident && <IncidentDetail key={incident.id} {...incident} />}
          </section>
          </main>
        )}
      </div>
    </div>
  );
}
