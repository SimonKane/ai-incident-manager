"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import FilterButton from "../components/FilterButton";
import IncidentCard from "../components/IncidentCard";
import IncidentDetail from "../components/IncidentDetail";
import StaffSettings from "../components/StaffSettings";

const mockIncidents = [
  {
    id: "1",
    title: "Database connection timeout",
    description: "AI-bedömning: Databaslutningen har högt sla på grund av hög belastning.",
    severity: "Kritisk" as const,
    service: "API Gateway",
    environment: "Prod-EU",
    timestamp: "14:32:21",
    status: "Åtgärdad" as const,
    timeline: [
      { time: "14:32:21", title: "Händelse upptäckt", description: "Database connection timeout | API Gateway" },
      { time: "14:32:23", title: "AI-analys klar", description: "AI identifierade trolig orsak och förslag åtgärd (92% konfidens)" },
      { time: "14:32:25", title: "Åtgärd initierad", description: "Lambda-funktion restart_db_connection kördes" },
      { time: "14:33:02", title: "Verifiering", description: "Anslutning återställd, felrate tillbaka till normal nivå" },
    ],
    actions: [
      { id: "1", title: "Omstartade databasanslutning via Lambda: restart_db_connection", timestamp: "Started 14:32:25", status: "Klar" as const },
    ],
    relatedIncidents: [
      { title: "API Gateway latency spike", service: "API Gateway" },
      { title: "Database CPU high", service: "Database" },
    ],
  },
  {
    id: "2",
    title: "High memory usage detected",
    description: "En minnesläcka upptäcktes i User Service som orsakade hög belastning.",
    severity: "Varning" as const,
    service: "User Service",
    environment: "Prod-EU",
    timestamp: "14:28:10",
    status: "Åtgärdad" as const,
    timeline: [
      { time: "14:28:10", title: "Varning identifierad" },
      { time: "14:28:15", title: "AI-analysis klar" },
    ],
    actions: [],
    relatedIncidents: [],
  },
  {
    id: "3",
    title: "Payment processing failed",
    description: "Betalningsprocessering misslyckades för ett stort batch av transaktioner.",
    severity: "Kritisk" as const,
    service: "Payment Service",
    environment: "Prod-EU",
    timestamp: "14:25:47",
    status: "Eskalerad" as const,
    timeline: [],
    actions: [],
    relatedIncidents: [],
  },
  {
    id: "4",
    title: "File upload completed",
    description: "En filuppladdning slutfördes utan problem.",
    severity: "Info" as const,
    service: "File Service",
    environment: "Prod-EU",
    timestamp: "14:20:33",
    status: "Åtgärdad" as const,
    timeline: [],
    actions: [],
    relatedIncidents: [],
  },
  {
    id: "5",
    title: "Rate limit approaching",
    description: "API Gateway närmar sig rate limit för en av API-nycklarna.",
    severity: "Varning" as const,
    service: "API Gateway",
    environment: "Prod-EU",
    timestamp: "14:18:02",
    status: "Åtgärdad" as const,
    timeline: [],
    actions: [],
    relatedIncidents: [],
  },
  {
    id: "6",
    title: "Authentication failures",
    description: "En ökning i autentiseringsfel identifierades.",
    severity: "Kritisk" as const,
    service: "Auth Service",
    environment: "Prod-EU",
    timestamp: "14:15:29",
    status: "Eskalerad" as const,
    timeline: [],
    actions: [],
    relatedIncidents: [],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"incidents" | "settings">(
    "incidents",
  );
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [filter, setFilter] = useState<"Alla" | "Kritiska" | "Varningar" | "Info">("Alla");

  const incident = mockIncidents.find((i) => i.id === selectedIncident);

  const filteredIncidents = mockIncidents.filter((i) => {
    if (filter === "Alla") return true;
    if (filter === "Kritiska") return i.severity === "Kritisk";
    if (filter === "Varningar") return i.severity === "Varning";
    if (filter === "Info") return i.severity === "Info";
    return true;
  });

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "incidents" ? (
        <main className="flex flex-1 flex-col gap-8 px-10 py-8 overflow-y-auto">
          <div>
            <h1 className="text-3xl font-semibold text-slate-50">
              Händelser
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              AI-övervakade incidenter i realtid
            </p>
          </div>

          <div className="flex gap-3">
            <FilterButton label="Alla" count={47} active={filter === "Alla"} onClick={() => setFilter("Alla")} />
            <FilterButton label="Kritiska" count={12} active={filter === "Kritiska"} onClick={() => setFilter("Kritiska")} />
            <FilterButton label="Varningar" count={18} active={filter === "Varningar"} onClick={() => setFilter("Varningar")} />
            <FilterButton label="Info" count={17} active={filter === "Info"} onClick={() => setFilter("Info")} />
          </div>

          <div className="space-y-3 pr-4">
            {filteredIncidents.map((inc) => (
              <IncidentCard
                key={inc.id}
                {...inc}
                onClick={() => setSelectedIncident(inc.id === selectedIncident ? null : inc.id)}
                isSelected={selectedIncident === inc.id}
              />
            ))}
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
