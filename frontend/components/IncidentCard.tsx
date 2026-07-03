type IncidentCardProps = {
  id: string;
  title: string;
  description: string;
  severity: "Critical" | "Warning" | "Info";
  service: string;
  environment: string;
  timestamp: string;
  status: "Resolved" | "Escalated" | "Pending";
  onClick: () => void;
  isSelected: boolean;
};

const severityConfig = {
  Critical: {
    label: "CR",
    chip: "border-red-400/30 bg-red-500/10 text-red-200",
    dot: "bg-red-400",
  },
  Warning: {
    label: "WA",
    chip: "border-amber-400/30 bg-amber-500/10 text-amber-100",
    dot: "bg-amber-300",
  },
  Info: {
    label: "IN",
    chip: "border-sky-400/30 bg-sky-500/10 text-sky-100",
    dot: "bg-sky-300",
  },
};

const statusConfig = {
  Resolved: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  Escalated: "border-fuchsia-300/25 bg-fuchsia-400/10 text-fuchsia-200",
  Pending: "border-slate-300/20 bg-slate-400/10 text-slate-300",
};

export default function IncidentCard({
  title,
  description,
  severity,
  service,
  environment,
  timestamp,
  status,
  onClick,
  isSelected,
}: IncidentCardProps) {
  const config = severityConfig[severity];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer rounded-lg border p-4 text-left transition ${
        isSelected
          ? "border-teal-300/45 bg-teal-400/[0.08] shadow-lg shadow-teal-950/20"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex gap-4">
        <div className="flex w-12 shrink-0 flex-col items-center gap-2">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-bold ${config.chip}`}
          >
            {config.label}
          </span>
          <span className="whitespace-nowrap text-[11px] text-slate-500">
            {timestamp}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                <h3 className="truncate text-sm font-semibold text-white">
                  {title}
                </h3>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                {description}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold ${statusConfig[status]}`}
            >
              {status}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-400">
            <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
              {severity}
            </span>
            <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
              {service}
            </span>
            <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
              {environment}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
