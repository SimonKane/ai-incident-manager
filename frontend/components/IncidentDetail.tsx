"use client";

import { useEffect, useState } from "react";

type IncidentDetailProps = {
  id: string;
  title: string;
  severity: "Critical" | "Warning" | "Info";
  service: string;
  environment: string;
  timestamp: string;
  description: string;
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

export default function IncidentDetail({
  id,
  title,
  timestamp,
  description,
  specifiedError,
  remediation,
  impact,
  confidence,
  timeline,
  actions,
  assignedTo,
}: IncidentDetailProps) {
  const [simulationState, setSimulationState] = useState<
    "preparing" | "sent" | "skipped"
  >(assignedTo ? "preparing" : "skipped");

  useEffect(() => {
    if (!assignedTo) return;

    const timer = window.setTimeout(() => setSimulationState("sent"), 700);
    return () => window.clearTimeout(timer);
  }, [assignedTo, id]);

  const methods = assignedTo?.notificationMethods?.length
    ? assignedTo.notificationMethods
    : ["slack"];

  return (
    <aside className="min-h-[560px] rounded-lg border border-white/10 bg-slate-950/75 p-5 shadow-xl shadow-black/20 xl:sticky xl:top-7 xl:h-[calc(100vh-56px)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
        <div className="rounded-lg border border-teal-300/20 bg-teal-400/10 px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-teal-200">
            AI confidence
          </p>
          <p className="text-xl font-semibold text-white">{confidence}</p>
        </div>
      </div>

      <div className="scrollbar-hidden mt-5 max-h-[calc(100%-150px)] space-y-4 overflow-y-auto pr-1">
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Detected problem
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {specifiedError}
          </p>
          <p className="mt-3 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-400">
            Impact: {impact}
          </p>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Recommended action
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {remediation}
          </p>

          {actions.length > 0 && (
            <div className="mt-4 space-y-2">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-emerald-300/15 bg-emerald-400/10 px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-emerald-50">
                      {action.title}
                    </p>
                    <p className="mt-1 text-xs text-emerald-200/70">
                      {action.timestamp}
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-300/15 px-2 py-1 text-[10px] font-semibold text-emerald-100">
                    {action.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Notification simulation
          </h3>
          {assignedTo ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {assignedTo.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {assignedTo.department}
                  </p>
                </div>
                <span className="rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-slate-300">
                  Auto routed
                </span>
              </div>

              <div className="space-y-2">
                {methods.map((method) => (
                  <p
                    key={method}
                    className="rounded-md border border-teal-300/20 bg-teal-400/10 px-3 py-2 text-xs text-teal-100"
                  >
                    {simulationState === "sent"
                      ? `${method.toUpperCase()} message sent (just simulation)`
                      : `Preparing ${method.toUpperCase()} simulation...`}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-400">
              No notification needed for this informational incident.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Timeline
          </h3>
          <div className="mt-4 space-y-3 border-l border-white/10 pl-4">
            <div className="relative">
              <div className="absolute left-[-21px] top-1 h-2.5 w-2.5 rounded-full bg-teal-300" />
              <p className="text-xs font-semibold text-slate-300">
                {timestamp}
              </p>
              <p className="text-xs text-slate-500">Incident opened</p>
            </div>
            {timeline.map((event) => (
              <div key={`${event.time}-${event.title}`} className="relative">
                <div className="absolute left-[-20px] top-1.5 h-2 w-2 rounded-full bg-slate-600" />
                <p className="text-xs font-semibold text-slate-300">
                  {event.time}
                </p>
                <p className="text-xs text-slate-400">{event.title}</p>
                {event.description && (
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
