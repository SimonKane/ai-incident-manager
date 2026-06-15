"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  onClose: () => void;
};

export default function IncidentDetail({
  id,
  title,
  severity,
  service,
  environment,
  timestamp,
  specifiedError,
  remediation,
  timeline,
  actions,
  assignedTo,
  onClose,
}: IncidentDetailProps) {
  const severityColor = {
    Critical: "text-red-400",
    Warning: "text-yellow-400",
    Info: "text-blue-400",
  };
  const [notifyStatus, setNotifyStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [notifyMessage, setNotifyMessage] = useState<string | null>(null);

  async function notifyAssignedStaff() {
    setNotifyStatus("sending");
    setNotifyMessage(null);

    try {
      const response = await fetch(`${API_URL}/incidents/${id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await response.json()) as {
        message?: string;
        sentMethods?: string[];
        failedMethods?: Array<{ method: string; reason?: string }>;
      };

      if (!response.ok) {
        throw new Error(data.message || "Could not notify technician");
      }

      const failedText = data.failedMethods?.length
        ? ` Failed: ${data.failedMethods
            .map((failure) =>
              failure.reason
                ? `${failure.method} (${failure.reason})`
                : failure.method,
            )
            .join(", ")}`
        : "";

      setNotifyStatus("sent");
      setNotifyMessage(
        data.sentMethods?.length
          ? `Notified via ${data.sentMethods.join(", ")}.${failedText}`
          : "Notification sent",
      );
    } catch (error) {
      setNotifyStatus("error");
      setNotifyMessage(
        error instanceof Error ? error.message : "Could not notify technician",
      );
    }
  }

  return (
    <div className="sticky top-0 flex h-screen w-96 flex-col gap-6 border-l border-slate-800/80 bg-slate-950 px-6 py-8 text-slate-100 ">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 cursor-pointer text-slate-400 hover:text-slate-200"
      >
        ✕
      </button>

      <div>
        <h2 className="text-2xl font-semibold text-slate-50">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{timestamp}</p>
        <div className="scrollbar-hidden mt-3 flex h-10 gap-2 overflow-x-auto">
          <span
            className={`rounded-sm flex items-center bg-slate-900/80 px-2 py-1 text-xs font-semibold ${severityColor[severity]}`}
          >
            {severity}
          </span>
          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            {service}
          </span>
          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            {environment}
          </span>
        </div>
      </div>

      <div className="scrollbar-hidden space-y-4 overflow-y-auto pr-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Specified error
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {specifiedError}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Recommended action
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{remediation}</p>

          {actions.length > 0 && (
            <div className="mt-3 space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 rounded-lg bg-slate-900/40 p-3"
                >
                  <div className="mt-1 text-emerald-400">✓</div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-slate-100">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-400">{action.timestamp}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                    {action.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {assignedTo && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Assigned to
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {assignedTo.name}
              <span className="text-slate-500"> • {assignedTo.department}</span>
            </p>
            <button
              type="button"
              disabled={notifyStatus === "sending"}
              onClick={notifyAssignedStaff}
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-emerald-500 px-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {notifyStatus === "sending" ? "Notifying..." : "Notify"}
            </button>
            {notifyMessage && (
              <p
                className={`mt-2 text-xs ${
                  notifyStatus === "error"
                    ? "text-red-300"
                    : "text-emerald-300"
                }`}
              >
                {notifyMessage}
              </p>
            )}
          </div>
        )}

        {timeline.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Timeline
            </h3>
            <div className="mt-3 space-y-3 border-l border-slate-800/50 pl-4">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute left-[-13px] top-1 h-2 w-2 rounded-full bg-slate-700" />
                  <p className="text-xs font-semibold text-slate-300">
                    {event.time}
                  </p>
                  <p className="text-xs text-slate-400">{event.title}</p>
                  {event.description && (
                    <p className="mt-1 text-xs text-slate-500">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
