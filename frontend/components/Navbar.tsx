import Image from "next/image";

type AppTab = "incidents" | "settings";

type NavbarProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export default function RightNavbar({ activeTab, onTabChange }: NavbarProps) {
  const navItemClass = (tab: AppTab) =>
    `flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
      activeTab === tab
        ? "bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-400/20"
        : "text-slate-200 hover:bg-slate-800/50"
    }`;

  const iconClass = (tab: AppTab) =>
    `inline-flex h-8 w-8 items-center justify-center rounded-full ${
      activeTab === tab
        ? "bg-emerald-500/20 text-emerald-200"
        : "bg-slate-800/70 text-slate-300"
    }`;

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col gap-6 border-r border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-6 py-8 text-slate-100 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center">
          <Image
            src="/ai-fix-logo.png"
            alt="LogFix AI"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-100">
            LogFix AI
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <button
          type="button"
          className={navItemClass("incidents")}
          onClick={() => onTabChange("incidents")}
        >
          <span className={iconClass("incidents")}>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 7h12" />
              <path d="M6 12h12" />
              <path d="M6 17h12" />
            </svg>
          </span>
          Incidents
        </button>
        <button
          type="button"
          className={navItemClass("settings")}
          onClick={() => onTabChange("settings")}
        >
          <span className={iconClass("settings")}>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 3v2" />
              <path d="M12 19v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M17.66 17.66l1.41 1.41" />
              <path d="M3 12h2" />
              <path d="M19 12h2" />
              <path d="M4.93 19.07l1.41-1.41" />
              <path d="M17.66 6.34l1.41-1.41" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          Settings
        </button>
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>AI-agent</span>
          <span className="flex items-center gap-1 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Online
          </span>
        </div>
        <div className="mt-4 space-y-3 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span>Resolved today</span>
            <span className="text-sm font-semibold text-slate-100">23</span>
          </div>
          <div className="flex items-center justify-between">
            <span>MTTR (today)</span>
            <span className="text-sm font-semibold text-slate-100">18m</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Detected issues</span>
            <span className="text-sm font-semibold text-slate-100">47</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-200">
              AC
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">Acme Corp</p>
              <p className="text-[11px] text-slate-400">Production</p>
            </div>
          </div>
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
