"use client";

import { FormEvent, useEffect, useState } from "react";

type PreferredNotification = "email" | "phone" | "sms" | "slack";

type StaffMember = {
  _id: string;
  name: string;
  email: string;
  department: string;
  organization: string;
  preferredNotification?: PreferredNotification | PreferredNotification[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const notificationOptions: {
  value: PreferredNotification;
  label: string;
}[] = [
  { value: "email", label: "E-post" },
  { value: "phone", label: "Telefon" },
  { value: "sms", label: "SMS" },
  { value: "slack", label: "Slack" },
];

const emptyForm = {
  name: "",
  email: "",
  department: "",
  organization: "Acme",
  preferredNotification: ["email"] as PreferredNotification[],
};

export default function StaffSettings() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingStaffIds, setUpdatingStaffIds] = useState<string[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function getPreferredNotifications(member: StaffMember) {
    const preferredNotification = member.preferredNotification;

    if (Array.isArray(preferredNotification)) return preferredNotification;
    if (preferredNotification) return [preferredNotification];

    return ["email"] as PreferredNotification[];
  }

  function formatPreferredNotifications(member: StaffMember) {
    const notifications = getPreferredNotifications(member);

    return notifications
      .map(
        (notification) =>
          notificationOptions.find((option) => option.value === notification)
            ?.label || notification,
      )
      .join(", ");
  }

  function toggleNotification(
    currentNotifications: PreferredNotification[],
    notification: PreferredNotification,
  ) {
    if (currentNotifications.includes(notification)) {
      if (currentNotifications.length === 1) return currentNotifications;
      return currentNotifications.filter((item) => item !== notification);
    }

    return [...currentNotifications, notification];
  }

  function toggleMemberNotification(
    member: StaffMember,
    notification: PreferredNotification,
  ) {
    const notifications = getPreferredNotifications(member);
    const nextNotifications = toggleNotification(notifications, notification);

    if (nextNotifications === notifications) return;

    void updatePreferredNotification(member._id, nextNotifications);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadStaff() {
      try {
        const response = await fetch(`${API_URL}/staff`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          setStaff([]);
          return;
        }

        if (!response.ok) throw new Error("Kunde inte hämta tekniker");

        const data = (await response.json()) as StaffMember[];
        setStaff(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setListError(err instanceof Error ? err.message : "Något gick fel");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadStaff();

    return () => controller.abort();
  }, []);

  async function addStaffMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.preferredNotification.length === 0) {
      setFormError("Välj minst ett notifikationssätt");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const response = await fetch(`${API_URL}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Kunde inte lägga till tekniker");

      const createdStaff = (await response.json()) as StaffMember;
      setStaff((currentStaff) => [...currentStaff, createdStaff]);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setIsSaving(false);
    }
  }

  async function updatePreferredNotification(
    staffId: string,
    preferredNotification: PreferredNotification[],
  ) {
    if (preferredNotification.length === 0) {
      setListError("Välj minst ett notifikationssätt");
      return;
    }

    setListError(null);
    setUpdatingStaffIds((currentIds) => [...currentIds, staffId]);
    setStaff((currentStaff) =>
      currentStaff.map((member) =>
        member._id === staffId ? { ...member, preferredNotification } : member,
      ),
    );

    try {
      const response = await fetch(`${API_URL}/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredNotification }),
      });

      if (!response.ok) throw new Error("Kunde inte uppdatera tekniker");

      await response.json();
      setStaff((currentStaff) =>
        currentStaff.map((member) =>
          member._id === staffId
            ? { ...member, preferredNotification }
            : member,
        ),
      );
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setUpdatingStaffIds((currentIds) =>
        currentIds.filter((currentId) => currentId !== staffId),
      );
    }
  }

  async function deleteStaffMember(staffId: string) {
    setListError(null);

    const previousStaff = staff;
    setStaff((currentStaff) =>
      currentStaff.filter((member) => member._id !== staffId),
    );

    try {
      const response = await fetch(`${API_URL}/staff/${staffId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Kunde inte ta bort tekniker");
    } catch (err) {
      setStaff(previousStaff);
      setListError(err instanceof Error ? err.message : "Något gick fel");
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 overflow-y-auto px-10 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-50">
          Inställningar
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Tekniker och kontaktvägar
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60">
          <div className="grid grid-cols-[1.3fr_1.2fr_0.9fr_1fr_56px] gap-3 border-b border-slate-800/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Namn</span>
            <span>E-post</span>
            <span>Team</span>
            <span>Kontakt</span>
            <span />
          </div>

          {isLoading ? (
            <div className="px-5 py-8 text-sm text-slate-400">Laddar...</div>
          ) : staff.length === 0 ? (
            <div className="px-5 py-8 text-sm text-slate-400">
              Inga tekniker hittades.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/70">
              {staff.map((member) => (
                <div
                  key={member._id}
                  className="grid grid-cols-[1.3fr_1.2fr_0.9fr_1fr_56px] items-center gap-3 px-5 py-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-100">
                      {member.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {member.organization}
                    </p>
                  </div>
                  <span className="truncate text-slate-300">
                    {member.email}
                  </span>
                  <span className="text-slate-300">{member.department}</span>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {notificationOptions.map((option) => {
                        const notifications = getPreferredNotifications(member);
                        const checked = notifications.includes(option.value);
                        const isOnlySelectedOption =
                          checked && notifications.length === 1;
                        const isUpdating = updatingStaffIds.includes(
                          member._id,
                        );

                        return (
                          <label
                            key={option.value}
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              checked
                                ? "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/30"
                                : "bg-slate-900 text-slate-400 ring-1 ring-slate-800 hover:bg-slate-800/80"
                            } ${isOnlySelectedOption || isUpdating ? "cursor-not-allowed opacity-80" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isOnlySelectedOption || isUpdating}
                              onChange={() =>
                                toggleMemberNotification(member, option.value)
                              }
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {updatingStaffIds.includes(member._id)
                        ? "Sparar..."
                        : formatPreferredNotifications(member)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteStaffMember(member._id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Ta bort ${member.name}`}
                    title="Ta bort"
                  >
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
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v5" />
                      <path d="M14 11v5" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {listError && (
            <div className="border-t border-slate-800/80 px-5 py-4 text-sm text-red-200">
              {listError}
            </div>
          )}
        </div>

        <form
          onSubmit={addStaffMember}
          className="h-fit rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5"
        >
          <h2 className="text-base font-semibold text-slate-100">
            Lägg till tekniker
          </h2>

          <div className="mt-5 space-y-4">
            <label className="block text-xs font-semibold text-slate-400">
              Namn
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400/70"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-400">
              E-post
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    email: event.target.value,
                  }))
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400/70"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-400">
              Team
              <input
                required
                value={form.department}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    department: event.target.value,
                  }))
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400/70"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-400">
              Organisation
              <input
                required
                value={form.organization}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    organization: event.target.value,
                  }))
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400/70"
              />
            </label>
            <div className="block text-xs font-semibold text-slate-400">
              Kontakt
              <div className="mt-2 flex flex-wrap gap-2">
                {notificationOptions.map((option) => (
                  (() => {
                    const checked = form.preferredNotification.includes(
                      option.value,
                    );
                    const isOnlySelectedOption =
                      checked && form.preferredNotification.length === 1;

                    return (
                      <label
                        key={option.value}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
                          checked
                            ? "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/30"
                            : "bg-slate-900 text-slate-400 ring-1 ring-slate-800 hover:bg-slate-800/80"
                        } ${isOnlySelectedOption ? "cursor-not-allowed opacity-80" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isOnlySelectedOption}
                          onChange={() =>
                            setForm((currentForm) => {
                              const preferredNotification = toggleNotification(
                                currentForm.preferredNotification,
                                option.value,
                              );

                              if (
                                preferredNotification ===
                                currentForm.preferredNotification
                              ) {
                                return currentForm;
                              }

                              return {
                                ...currentForm,
                                preferredNotification,
                              };
                            })
                          }
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    );
                  })()
                ))}
              </div>
            </div>
          </div>

          {formError && (
            <p className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Sparar..." : "Lägg till"}
          </button>
        </form>
      </section>
    </main>
  );
}
