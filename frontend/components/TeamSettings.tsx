"use client";

import { useEffect, useMemo, useState } from "react";

type NotificationMethod = "slack" | "sms" | "email" | "phone";

type Technician = {
  id: string;
  name: string;
  department: string;
  role: string;
  methods: NotificationMethod[];
  contacts: Partial<Record<NotificationMethod, string>>;
  escalationLevel: "Primary" | "Secondary" | "Observer";
};

const defaultTechnicians: Technician[] = [
  {
    id: "tech-mira",
    name: "Mira Lind",
    department: "Platform",
    role: "Senior SRE",
    methods: ["slack", "sms"],
    contacts: {
      slack: "U04MIRA",
      sms: "+46 70 000 12 34",
    },
    escalationLevel: "Primary",
  },
  {
    id: "tech-noah",
    name: "Noah Berg",
    department: "Payments",
    role: "Backend Engineer",
    methods: ["slack"],
    contacts: {
      slack: "U08NOAH",
    },
    escalationLevel: "Secondary",
  },
  {
    id: "tech-elin",
    name: "Elin Stone",
    department: "Security",
    role: "Security Engineer",
    methods: ["slack", "sms", "email"],
    contacts: {
      slack: "U02ELIN",
      sms: "+46 70 000 56 78",
      email: "elin.stone@example.com",
    },
    escalationLevel: "Primary",
  },
];

const methodLabels: Record<NotificationMethod, string> = {
  slack: "Slack",
  sms: "SMS",
  email: "Email",
  phone: "Phone",
};

const contactLabels: Record<NotificationMethod, string> = {
  slack: "Slack user ID",
  sms: "Phone number for SMS",
  email: "Email address",
  phone: "Phone number",
};

const contactPlaceholders: Record<NotificationMethod, string> = {
  slack: "U012ABCD",
  sms: "+46 70 000 00 00",
  email: "alex@example.com",
  phone: "+46 70 000 00 00",
};

const storageKey = "ai-incident-manager-technicians";

function normalizeTechnician(technician: Technician): Technician {
  return {
    ...technician,
    contacts: technician.contacts ?? {},
  };
}

function loadTechnicians() {
  if (typeof window === "undefined") return defaultTechnicians;

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return defaultTechnicians;

    const parsed = JSON.parse(stored) as Technician[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map(normalizeTechnician)
      : defaultTechnicians;
  } catch {
    return defaultTechnicians;
  }
}

export default function TeamSettings() {
  const [technicians, setTechnicians] =
    useState<Technician[]>(loadTechnicians);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Platform");
  const [role, setRole] = useState("On-call Engineer");
  const [methods, setMethods] = useState<NotificationMethod[]>([
    "slack",
    "sms",
  ]);
  const [contacts, setContacts] = useState<
    Partial<Record<NotificationMethod, string>>
  >({});

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(technicians));
  }, [technicians]);

  const primaryCount = useMemo(
    () =>
      technicians.filter((tech) => tech.escalationLevel === "Primary").length,
    [technicians],
  );

  const hasRequiredContactInfo = methods.every((method) =>
    contacts[method]?.trim(),
  );

  function toggleMethod(method: NotificationMethod) {
    setMethods((current) =>
      current.includes(method)
        ? current.filter((item) => item !== method)
        : [...current, method],
    );
  }

  function addTechnician() {
    const trimmedName = name.trim();

    if (!trimmedName || methods.length === 0 || !hasRequiredContactInfo) {
      return;
    }

    const selectedContacts = methods.reduce<
      Partial<Record<NotificationMethod, string>>
    >((nextContacts, method) => {
      nextContacts[method] = contacts[method]?.trim();
      return nextContacts;
    }, {});

    setTechnicians((current) => [
      {
        id: `tech-${Date.now()}`,
        name: trimmedName,
        department,
        role,
        methods,
        contacts: selectedContacts,
        escalationLevel: current.length < 2 ? "Primary" : "Secondary",
      },
      ...current,
    ]);
    setName("");
    setDepartment("Platform");
    setRole("On-call Engineer");
    setMethods(["slack", "sms"]);
    setContacts({});
  }

  function updateTechnicianMethods(
    technicianId: string,
    method: NotificationMethod,
  ) {
    setTechnicians((current) =>
      current.map((tech) => {
        if (tech.id !== technicianId) return tech;

        if (tech.methods.includes(method)) {
          const nextMethods = tech.methods.filter((item) => item !== method);
          return {
            ...tech,
            methods: nextMethods.length > 0 ? nextMethods : tech.methods,
          };
        }

        const contactValue = window.prompt(
          `Enter ${contactLabels[method].toLowerCase()}`,
          "",
        );

        if (!contactValue?.trim()) return tech;

        return {
          ...tech,
          methods: [...tech.methods, method],
          contacts: {
            ...tech.contacts,
            [method]: contactValue.trim(),
          },
        };
      }),
    );
  }

  function updateEscalation(
    technicianId: string,
    escalationLevel: Technician["escalationLevel"],
  ) {
    setTechnicians((current) =>
      current.map((tech) =>
        tech.id === technicianId ? { ...tech, escalationLevel } : tech,
      ),
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 px-5 py-5 lg:px-8 lg:py-7">
      <section className="rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(20,184,166,0.16),rgba(15,23,42,0.94)_48%,rgba(30,64,175,0.18))] px-5 py-5 shadow-2xl shadow-black/25 lg:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              Frontend-only routing
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white lg:text-5xl">
              Technician routing
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Add IT technicians, choose notification channels, and preview how
              the incident manager would route alerts in production.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs text-slate-400">Technicians</p>
              <p className="mt-1 text-2xl font-semibold">
                {technicians.length}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs text-slate-400">Primary</p>
              <p className="mt-1 text-2xl font-semibold text-teal-200">
                {primaryCount}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs text-slate-400">Sends</p>
              <p className="mt-1 text-2xl font-semibold text-slate-100">0</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="rounded-lg border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-black/20">
          <h2 className="text-lg font-semibold text-white">Add technician</h2>
          <p className="mt-1 text-xs text-slate-400">
            Saved locally in this browser for the demo.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex Chen"
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/50"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Department
              </span>
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="mt-2 h-11 w-full cursor-pointer rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition focus:border-teal-300/50"
              >
                <option>Platform</option>
                <option>Payments</option>
                <option>Security</option>
                <option>Frontend</option>
                <option>Database</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Role
              </span>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition focus:border-teal-300/50"
              />
            </label>

            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Notifications
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(Object.keys(methodLabels) as NotificationMethod[]).map(
                  (method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => toggleMethod(method)}
                      className={`cursor-pointer rounded-md border px-3 py-2 text-left text-sm transition ${
                        methods.includes(method)
                          ? "border-teal-300/40 bg-teal-400/10 text-teal-100"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                      }`}
                    >
                      {methodLabels[method]}
                    </button>
                  ),
                )}
              </div>
            </div>

            {methods.length > 0 && (
              <div className="rounded-lg border border-teal-300/15 bg-teal-400/[0.06] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">
                  Contact details
                </p>
                <div className="mt-3 space-y-3">
                  {methods.map((method) => (
                    <label key={method} className="block">
                      <span className="text-xs text-slate-400">
                        {contactLabels[method]}
                      </span>
                      <input
                        value={contacts[method] ?? ""}
                        onChange={(event) =>
                          setContacts((current) => ({
                            ...current,
                            [method]: event.target.value,
                          }))
                        }
                        placeholder={contactPlaceholders[method]}
                        className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/50"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={addTechnician}
              disabled={
                !name.trim() || methods.length === 0 || !hasRequiredContactInfo
              }
              className="h-11 w-full cursor-pointer rounded-md bg-teal-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Add technician
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Notification roster
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Changing channels updates the demo roster only.
              </p>
            </div>
            <span className="rounded-md border border-teal-300/20 bg-teal-400/10 px-3 py-2 text-xs font-semibold text-teal-100">
              No real messages sent
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {technicians.map((tech) => (
              <article
                key={tech.id}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-base font-semibold text-white">
                      {tech.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {tech.role} - {tech.department}
                    </p>
                  </div>

                  <select
                    value={tech.escalationLevel}
                    onChange={(event) =>
                      updateEscalation(
                        tech.id,
                        event.target.value as Technician["escalationLevel"],
                      )
                    }
                    className="h-9 cursor-pointer rounded-md border border-white/10 bg-black/25 px-3 text-xs font-semibold text-slate-200 outline-none focus:border-teal-300/50"
                  >
                    <option>Primary</option>
                    <option>Secondary</option>
                    <option>Observer</option>
                  </select>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(Object.keys(methodLabels) as NotificationMethod[]).map(
                    (method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => updateTechnicianMethods(tech.id, method)}
                        className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                          tech.methods.includes(method)
                            ? "border-teal-300/40 bg-teal-400/10 text-teal-100"
                            : "border-white/10 bg-black/20 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {methodLabels[method]}
                      </button>
                    ),
                  )}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {tech.methods.map((method) => (
                    <div
                      key={`${tech.id}-${method}-contact`}
                      className="rounded-md border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {methodLabels[method]}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-300">
                        {tech.contacts[method] || "Demo contact configured"}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
