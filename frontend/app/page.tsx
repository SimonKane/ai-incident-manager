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
    title: "OOM crash loop i API-tjänst",
    description: "AI upptäckte upprepade omstarter efter out-of-memory och ökade minnesgränsen via Lambda.",
    severity: "Kritisk" as const,
    service: "API Service",
    environment: "Prod-EU",
    timestamp: "02:14:21",
    status: "Åtgärdad" as const,
    specifiedError: "Container avslutades med OOMKilled efter tre crash loops inom fem minuter.",
    remediation: "Lambda startade om tjänsten, ökade memory limit från 512 MB till 1024 MB och verifierade att felfrekvensen gick ner.",
    timeline: [
      { time: "02:14:21", title: "OOM crash loop upptäckt", description: "Serverloggen visade OOMKilled och täta container-restarts." },
      { time: "02:14:27", title: "AI beslutade auto-fix", description: "Felet klassades som reversibel driftincident." },
      { time: "02:14:35", title: "Lambda-åtgärd körd", description: "Tjänsten startades om och minnesgränsen höjdes." },
      { time: "02:16:02", title: "Verifierad", description: "Inga nya crash loops och API svarar normalt." },
    ],
    actions: [
      { id: "1", title: "Restart och memory scale-up via Lambda", timestamp: "Klar 02:14:35", status: "Klar" as const },
    ],
    assignedTo: null,
  },
  {
    id: "2",
    title: "Lagring nästan full",
    description: "AI såg att disken passerade 88% och rensade temporära filer innan tjänsten började fallera.",
    severity: "Varning" as const,
    service: "File Service",
    environment: "Prod-EU",
    timestamp: "02:08:10",
    status: "Åtgärdad" as const,
    specifiedError: "Diskanvändning nådde 88% och loggar visade ökande skrivlatens.",
    remediation: "Lambda rensade temp-kataloger, roterade gamla loggar och lämnade disken på 61%.",
    timeline: [
      { time: "02:08:10", title: "Varning identifierad", description: "Diskanvändning passerade nattgränsen på 85%." },
      { time: "02:08:16", title: "Rensning startad", description: "Lambda tog bort temporära filer äldre än 24 timmar." },
      { time: "02:09:04", title: "Loggar roterade", description: "Gamla app-loggar komprimerades och arkiverades." },
      { time: "02:09:31", title: "Verifierad", description: "Diskanvändning nere på 61%." },
    ],
    actions: [
      { id: "2", title: "Rensade tempfiler och roterade loggar", timestamp: "Klar 02:09:31", status: "Klar" as const },
    ],
    assignedTo: null,
  },
  {
    id: "3",
    title: "Misstänkt credential abuse",
    description: "AI upptäckte onormal API-nyckelanvändning, spärrade nyckeln temporärt och tilldelade uppgiften till rätt tekniker.",
    severity: "Kritisk" as const,
    service: "Auth Service",
    environment: "Prod-EU",
    timestamp: "01:57:47",
    status: "Eskalerad" as const,
    specifiedError: "Samma API-nyckel användes från tre nya länder och anropade admin-endpoints 240 gånger på två minuter.",
    remediation: "AI spärrade nyckeln temporärt, krävde token-rotation och skapade säkerhetsincident.",
    timeline: [
      { time: "01:57:47", title: "Avvikande credential-användning upptäckt", description: "API Gateway-loggar visade ovanlig geografi och endpoint-mix." },
      { time: "01:57:52", title: "Containment startad", description: "Lambda spärrade API-nyckeln temporärt." },
      { time: "01:58:05", title: "Uppgift tilldelad", description: "Alex Berg fick incidenten baserat på området backend/auth." },
      { time: "01:58:22", title: "Bevakning höjd", description: "AI fortsätter följa auth- och gateway-loggar." },
    ],
    actions: [
      { id: "3", title: "Spärrade API-nyckel och krävde rotation", timestamp: "Klar 01:57:52", status: "Klar" as const },
    ],
    assignedTo: {
      name: "Alex Berg",
      department: "backend",
    },
  },
  {
    id: "4",
    title: "Unauthorized access-försök",
    description: "AI såg upprepade 403-svar mot skyddade endpoints och blockerade käll-IP temporärt.",
    severity: "Varning" as const,
    service: "Admin Portal",
    environment: "Prod-EU",
    timestamp: "01:44:33",
    status: "Eskalerad" as const,
    specifiedError: "En okänd IP försökte nå admin-endpoints med saknade eller ogiltiga behörigheter.",
    remediation: "Lambda blockerade IP-adressen i 30 minuter och tilldelade uppgiften för manuell granskning.",
    timeline: [
      { time: "01:44:33", title: "Unauthorized access mönster upptäckt", description: "Många 403-svar mot /admin och /settings." },
      { time: "01:44:39", title: "IP blockerad", description: "Temporär regel lades till i WAF." },
      { time: "01:44:51", title: "Uppgift tilldelad", description: "Nora Lind fick incidenten baserat på området devops/access." },
    ],
    actions: [
      { id: "4", title: "Blockerade misstänkt IP via WAF-regel", timestamp: "Klar 01:44:39", status: "Klar" as const },
    ],
    assignedTo: {
      name: "Nora Lind",
      department: "devops",
    },
  },
  {
    id: "5",
    title: "Rate spike mot API Gateway",
    description: "AI upptäckte en kraftig trafikspik och aktiverade rate limiting innan felraten steg.",
    severity: "Varning" as const,
    service: "API Gateway",
    environment: "Prod-EU",
    timestamp: "01:31:02",
    status: "Åtgärdad" as const,
    specifiedError: "Request-volymen ökade från 120 till 1 900 requests/minut från samma klientgrupp.",
    remediation: "Lambda aktiverade striktare rate limit och autoscaling höjde kapaciteten ett steg.",
    timeline: [
      { time: "01:31:02", title: "Rate spike upptäckt", description: "API Gateway-loggar visade 15x normal nattvolym." },
      { time: "01:31:09", title: "Rate limit aktiverad", description: "Klientgruppen begränsades till säkrare nivå." },
      { time: "01:31:35", title: "Kapacitet höjd", description: "Autoscaling ökade antal instanser." },
      { time: "01:33:10", title: "Verifierad", description: "Felrate stabil och svarstider normala." },
    ],
    actions: [
      { id: "5", title: "Aktiverade rate limit och skalade upp API-kapacitet", timestamp: "Klar 01:31:35", status: "Klar" as const },
    ],
    assignedTo: null,
  },
  {
    id: "6",
    title: "Möjlig data deletion",
    description: "AI såg ovanligt många delete-operationer, pausade fortsatt radering och tilldelade uppgiften till databasansvarig.",
    severity: "Kritisk" as const,
    service: "Customer Data API",
    environment: "Prod-EU",
    timestamp: "01:12:29",
    status: "Eskalerad" as const,
    specifiedError: "DELETE-anrop mot kunddata ökade kraftigt från ett admin-konto utanför normalt underhållsfönster.",
    remediation: "AI pausade delete-endpoints, tog snapshot-referens och tilldelade uppgiften för mänskligt beslut om återställning.",
    timeline: [
      { time: "01:12:29", title: "Ovanlig data deletion upptäckt", description: "Auditloggar visade 84 delete-operationer på tre minuter." },
      { time: "01:12:34", title: "Fortsatt radering stoppad", description: "Lambda satte feature flag för delete-endpoints till read-only." },
      { time: "01:12:49", title: "Snapshot säkrad", description: "Senaste backup och aktuell snapshot markerades för incidenten." },
      { time: "01:13:02", title: "Uppgift tilldelad", description: "Maja Holm fick incidenten baserat på området database." },
    ],
    actions: [
      { id: "6", title: "Pausade delete-endpoints och säkrade snapshot", timestamp: "Klar 01:12:49", status: "Klar" as const },
    ],
    assignedTo: {
      name: "Maja Holm",
      department: "database",
    },
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

  const filterCounts = {
    Alla: mockIncidents.length,
    Kritiska: mockIncidents.filter((i) => i.severity === "Kritisk").length,
    Varningar: mockIncidents.filter((i) => i.severity === "Varning").length,
    Info: mockIncidents.filter((i) => i.severity === "Info").length,
  };

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
            <FilterButton label="Alla" count={filterCounts.Alla} active={filter === "Alla"} onClick={() => setFilter("Alla")} />
            <FilterButton label="Kritiska" count={filterCounts.Kritiska} active={filter === "Kritiska"} onClick={() => setFilter("Kritiska")} />
            <FilterButton label="Varningar" count={filterCounts.Varningar} active={filter === "Varningar"} onClick={() => setFilter("Varningar")} />
            <FilterButton label="Info" count={filterCounts.Info} active={filter === "Info"} onClick={() => setFilter("Info")} />
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
