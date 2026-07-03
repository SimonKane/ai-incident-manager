import Image from "next/image";

type NavbarProps = {
  activeView: "incidents" | "team";
  onViewChange: (view: "incidents" | "team") => void;
  activeCount: number;
  handledCount: number;
  feedState: "syncing" | "ready";
};

export default function Navbar({
  activeView,
  onViewChange,
  activeCount,
  handledCount,
  feedState,
}: NavbarProps) {
  const navClass = (view: "incidents" | "team") =>
    `flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
      activeView === view
        ? "border-teal-300/20 bg-teal-400/10 font-semibold text-teal-100"
        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-slate-200"
    }`;

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[#081317]/95 px-5 py-6 shadow-2xl shadow-black/30 lg:sticky lg:top-0 lg:flex">
      <div className="flex items-center gap-3">
        <Image
          src="/ai-fix-logo.png"
          alt="AI Incident Manager"
          width={52}
          height={52}
          className="h-12 w-12 object-contain"
          priority
        />
        <div>
          <p className="text-base font-semibold tracking-tight text-white">
            LogFix AI
          </p>
          <p className="text-xs text-slate-500">Incident intelligence</p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        <button
          type="button"
          onClick={() => onViewChange("incidents")}
          className={navClass("incidents")}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-300/15 text-xs">
            AI
          </span>
          Incidents
        </button>
        <button
          type="button"
          onClick={() => onViewChange("team")}
          className={navClass("team")}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-xs">
            IT
          </span>
          Technicians
        </button>
      </nav>

      <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Demo engine</span>
          <span className="flex items-center gap-2 text-teal-200">
            <span className="h-2 w-2 rounded-full bg-teal-300" />
            {feedState === "ready" ? "Ready" : "Syncing"}
          </span>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Seeded incidents</span>
            <span className="font-semibold text-white">{activeCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Handled</span>
            <span className="font-semibold text-white">{handledCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">External sends</span>
            <span className="font-semibold text-teal-200">Simulated</span>
          </div>
        </div>
      </div>

      <div className="mt-auto rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(20,184,166,0.12),rgba(15,23,42,0.55))] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
          Portfolio build
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Frontend-only showcase with backend architecture preserved for review
          and future scaling.
        </p>
      </div>
    </aside>
  );
}
