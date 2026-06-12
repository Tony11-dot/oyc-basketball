"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Registration, RegistrationStatus } from "@/lib/types";

const STATUS_BADGE: Record<RegistrationStatus, string> = {
  new: "bg-amber-100 text-amber-700",
  signed: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-100 text-slate-600",
};

export default function RegistrationsAdmin() {
  const { t } = useI18n();
  const toast = useToast();
  const [list, setList] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/registrations");
    const data = res.ok ? await res.json() : { registrations: [] };
    setList(data.registrations ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      );
    });
  }, [list, query, statusFilter]);

  const open = list.find((r) => r.id === openId) ?? null;

  async function setStatus(id: string, status: RegistrationStatus) {
    const res = await fetch(`/api/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const { registration } = await res.json();
      setList((l) => l.map((r) => (r.id === id ? registration : r)));
    } else {
      toast.error(t.admin.toasts.saveError);
    }
  }

  async function remove(id: string) {
    if (!confirm(t.admin.reg.deleteConfirm)) return;
    const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
    if (res.ok) {
      setList((l) => l.filter((r) => r.id !== id));
      setOpenId(null);
    } else {
      toast.error(t.admin.toasts.saveError);
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{t.admin.titles.registrations}</h1>
          <p className="mt-1 text-sm text-muted">{t.admin.titles.registrationsSub}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>
          ↻ {t.admin.refresh}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.admin.actions.search}
          className="h-10 min-w-48 flex-1 rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | "all")}
          className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
        >
          <option value="all">{t.admin.reg.allStatuses}</option>
          <option value="new">{t.admin.status.new}</option>
          <option value="signed">{t.admin.status.signed}</option>
          <option value="archived">{t.admin.status.archived}</option>
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-muted">{t.admin.loading}</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">{t.admin.reg.none}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-start text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3 text-start">{t.admin.reg.name}</th>
                <th className="hidden px-4 py-3 text-start sm:table-cell">{t.admin.reg.phone}</th>
                <th className="hidden px-4 py-3 text-start md:table-cell">{t.admin.reg.email}</th>
                <th className="px-4 py-3 text-start">{t.admin.reg.status}</th>
                <th className="px-4 py-3 text-end">{t.admin.reg.date}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setOpenId(r.id)}
                  className="cursor-pointer border-b border-line last:border-0 transition hover:bg-surface"
                >
                  <td className="px-4 py-3 font-medium text-ink">
                    {r.firstName} {r.lastName}
                  </td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell" dir="ltr">{r.phone}</td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell" dir="ltr">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[r.status]}`}>
                      {t.admin.status[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end text-muted" dir="ltr">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!open} onClose={() => setOpenId(null)} title={t.admin.reg.details}>
        {open && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Detail label={t.admin.reg.name} value={`${open.firstName} ${open.lastName}`} />
              <Detail label={t.admin.reg.status} value={t.admin.status[open.status]} />
              <Detail label={t.admin.reg.phone} value={open.phone} ltr />
              <Detail label={t.admin.reg.email} value={open.email} ltr />
              <Detail label={t.admin.reg.date} value={new Date(open.createdAt).toLocaleString()} ltr />
            </div>
            {open.notes && <Detail label={t.admin.reg.notes} value={open.notes} />}

            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {open.status !== "signed" ? (
                <Button size="sm" onClick={() => setStatus(open.id, "signed")}>
                  ✓ {t.admin.reg.markSigned}
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => setStatus(open.id, "new")}>
                  ↺ {t.admin.reg.markNew}
                </Button>
              )}
              <Button size="sm" variant="danger" onClick={() => remove(open.id)}>
                {t.admin.reg.delete}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}

function Detail({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 font-medium text-ink" dir={ltr ? "ltr" : undefined}>{value}</p>
    </div>
  );
}
