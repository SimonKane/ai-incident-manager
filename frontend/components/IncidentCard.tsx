type IncidentCardProps = {
  id: string;
  title: string;
  description: string;
  severity: "Kritisk" | "Varning" | "Info";
  service: string;
  environment: string;
  timestamp: string;
  status: "Åtgärdad" | "Eskalerad" | "Väntar";
  onClick: () => void;
  isSelected: boolean;
};

const severityConfig = {
  Kritisk: {
    icon: "🔴",
    bgColor: "bg-red-950/50",
    textColor: "text-red-400",
    borderColor: "border-red-900/30",
  },
  Varning: {
    icon: "⚠️",
    bgColor: "bg-yellow-950/50",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-900/30",
  },
  Info: {
    icon: "ℹ️",
    bgColor: "bg-blue-950/50",
    textColor: "text-blue-400",
    borderColor: "border-blue-900/30",
  },
};

const statusConfig = {
  Åtgärdad: "text-emerald-400",
  Eskalerad: "text-purple-400",
  Väntar: "text-slate-400",
};

export default function IncidentCard({
  id,
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
      className={`w-full text-left transition-all ${isSelected ? "ring-2 ring-emerald-400/50" : ""}`}
    >
      <div
        className={`flex gap-4 rounded-2xl border p-4 ${config.bgColor} ${config.borderColor} cursor-pointer hover:bg-opacity-70`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl">{config.icon}</div>
          <div className="whitespace-nowrap text-xs text-slate-400">
            {timestamp}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400">
                <span className={`font-semibold ${config.textColor}`}>
                  {severity}
                </span>
                {" • "}
                {service} {" • "} {environment}
              </p>
            </div>
            <span
              className={`whitespace-nowrap text-xs font-semibold ${statusConfig[status]}`}
            >
              {status}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </button>
  );
}
