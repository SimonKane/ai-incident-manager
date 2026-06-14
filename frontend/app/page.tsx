"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import Navbar from "../components/Navbar";
import FilterButton from "../components/FilterButton";
import IncidentCard from "../components/IncidentCard";
import IncidentDetail from "../components/IncidentDetail";
import StaffSettings from "../components/StaffSettings";

const API_URL = "http://localhost:3000";

type AppTab = "incidents" | "settings";
type Severity = "Critical" | "Warning" | "Info";
type Status = "Resolved" | "Escalated" | "Pending";
type Filter = "All" | "Critical" | "Warnings" | "Info";

type DbIncident = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  severity: string;
  service: string;
  environment: string;
  timestamp: string;
  status: string;
  timeline?: Array<{
    time: string;
    title: string;
    description?: string;
  }>;
  analysis?: {
    type: string;
    priority: string;
    action: string;
    target: string;
    assignedTo: string;
    assignedDepartment: string | null;
    recommendation: string;
  } | null;
};

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
  } | null;
};

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function normalizeSeverity(severity: string): Severity {
  const value = severity.toLowerCase();

  if (
    value.includes("krit") ||
    value.includes("critical") ||
    value.includes("high")
  ) {
    return "Critical";
  }

  if (
    value.includes("varning") ||
    value.includes("warning") ||
    value.includes("medium")
  ) {
    return "Warning";
  }

  return "Info";
}

function normalizeStatus(status: string): Status {
  const value = status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (value.includes("eskaler") || value.includes("escalat")) {
    return "Escalated";
  }

  if (
    value.includes("vant") ||
    value.includes("pending") ||
    value.includes("open")
  ) {
    return "Pending";
  }

  return "Resolved";
}

function hasAssignedTechnician(assignedTo?: string) {
  if (!assignedTo) return false;

  const value = assignedTo.trim().toLowerCase();
  return value !== "" && value !== "none" && value !== "ingen";
}

function toIncident(incident: DbIncident): Incident {
  const analysis = incident.analysis;
  const id = incident.id || incident._id || crypto.randomUUID();
  const hasAnalysisAction = Boolean(analysis?.action?.trim());

  return {
    id,
    title: incident.title,
    description: incident.description,
    severity: normalizeSeverity(incident.severity),
    service: incident.service,
    environment: incident.environment,
    timestamp: formatTime(incident.timestamp),
    status: normalizeStatus(incident.status),
    specifiedError: incident.description,
    remediation:
      analysis?.recommendation ||
      analysis?.action ||
      "No recommended action has been registered.",
    timeline: (incident.timeline || []).map((event) => ({
      ...event,
      time: formatTime(event.time),
    })),
    actions: hasAnalysisAction
      ? [
          {
            id: `${id}-action`,
            title: analysis?.action || "",
            timestamp: "AI action registered",
            status: "Done",
          },
        ]
      : [],
    assignedTo:
      analysis && hasAssignedTechnician(analysis.assignedTo)
        ? {
            name: analysis.assignedTo,
            department: analysis.assignedDepartment || "Unknown department",
          }
        : null,
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("incidents");
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [incidentError, setIncidentError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadIncidents() {
      try {
        setIsLoadingIncidents(true);
        setIncidentError(null);

        const response = await fetch(`${API_URL}/incidents`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Could not load incidents");

        const data = (await response.json()) as DbIncident[];
        const nextIncidents = data.map(toIncident);

        setIncidents(nextIncidents);
        setSelectedIncident((currentId) =>
          nextIncidents.some((incident) => incident.id === currentId)
            ? currentId
            : null,
        );
      } catch (err) {
        if (!controller.signal.aborted) {
          setIncidentError(
            err instanceof Error ? err.message : "Something went wrong",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingIncidents(false);
      }
    }

    void loadIncidents();

    socket.on("incident:processed", (data) => {
      const newIncident = toIncident(data.incident);
      setIncidents((prev) => [newIncident, ...prev]);
    });

    return () => {
      controller.abort();
      socket.off("incident:processed");
    };
  }, []);

  const incident = incidents.find((i) => i.id === selectedIncident);

  const filteredIncidents = incidents.filter((i) => {
    if (filter === "All") return true;
    if (filter === "Critical") return i.severity === "Critical";
    if (filter === "Warnings") return i.severity === "Warning";
    if (filter === "Info") return i.severity === "Info";
    return true;
  });

  const filterCounts = {
    All: incidents.length,
    Critical: incidents.filter((i) => i.severity === "Critical").length,
    Warnings: incidents.filter((i) => i.severity === "Warning").length,
    Info: incidents.filter((i) => i.severity === "Info").length,
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "incidents" ? (
        <main className="flex flex-1 flex-col gap-8 overflow-y-auto px-10 py-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-50">Incidents</h1>
            <p className="mt-2 text-sm text-slate-400">
              AI-monitored incidents from the database
            </p>
          </div>

          <div className="flex gap-3">
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

          <div className="space-y-3 pr-4">
            {isLoadingIncidents ? (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-sm text-slate-400">
                Loading incidents...
              </div>
            ) : incidentError ? (
              <div className="rounded-2xl border border-red-900/40 bg-red-950/30 p-6 text-sm text-red-200">
                {incidentError}
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-sm text-slate-400">
                No incidents found.
              </div>
            ) : (
              filteredIncidents.map((inc) => (
                <IncidentCard
                  key={inc.id}
                  {...inc}
                  onClick={() =>
                    setSelectedIncident(
                      inc.id === selectedIncident ? null : inc.id,
                    )
                  }
                  isSelected={selectedIncident === inc.id}
                />
              ))
            )}
          </div>
        </main>
      ) : (
        <StaffSettings />
      )}

      {activeTab === "incidents" && incident && (
        <IncidentDetail
          {...incident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
