"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sale = {
  id: string;
  agent: string;
  neighborhood: string;
  date: string;
};

const initialSales: Sale[] = [
  { id: "1", agent: "Nicolas", neighborhood: "Safoumou", date: "2026-03-27" },
  { id: "2", agent: "Bernice", neighborhood: "Tohimbamba", date: "2026-04-04" },
  { id: "3", agent: "Judicaël", neighborhood: "Mawata", date: "2026-01-04" },
  { id: "4", agent: "Arstel", neighborhood: "Mpaka", date: "2026-02-03" },
  { id: "5", agent: "Gloire", neighborhood: "Ngoyo", date: "2026-01-04" },
];

const defaultForm = {
  agent: "",
  neighborhood: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function Home() {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [form, setForm] = useState({ ...defaultForm });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("suivi-sales");
    if (stored) {
      try {
        setSales(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load sales", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("suivi-sales", JSON.stringify(sales));
  }, [sales]);

  const agents = Array.from(new Set(sales.map((s) => s.agent))).sort();
  const dates = Array.from(new Set(sales.map((s) => s.date)))
    .sort()
    .reverse();

  const salesByAgentAndDate = (agent: string, date: string) => {
    return sales.filter((s) => s.agent === agent && s.date === date);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agent || !form.neighborhood || !form.date) return;

    const newSale: Sale = {
      id: editingId ?? crypto.randomUUID(),
      agent: form.agent.trim(),
      neighborhood: form.neighborhood.trim(),
      date: form.date,
    };

    setSales((current) => {
      if (editingId) {
        return current.map((s) => (s.id === editingId ? newSale : s));
      }
      return [newSale, ...current];
    });

    setForm({ ...defaultForm });
    setEditingId(null);
  };

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setForm({
      agent: sale.agent,
      neighborhood: sale.neighborhood,
      date: sale.date,
    });
  };

  const handleDelete = (id: string) => {
    setSales(sales.filter((s) => s.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ ...defaultForm });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              Suivi commercial de quartier
            </h1>
            <div className="flex gap-2 flex-wrap justify-end">
              <Link
                href="/"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Tableau croisé
              </Link>
              <Link
                href="/synthese"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Synthèse
              </Link>
              <Link
                href="/classement"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Classement
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Tableau croisé
          </h2>
          <p className="mt-2 text-lg text-slate-600">
            Suivez les ventes par commercial, quartier et date
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg lg:col-span-1">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              {editingId ? "Modifier une vente" : "Ajouter une vente"}
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Commercial
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.agent}
                  onChange={(e) => setForm({ ...form, agent: e.target.value })}
                  placeholder="Nom du commercial"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quartier
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.neighborhood}
                  onChange={(e) =>
                    setForm({ ...form, neighborhood: e.target.value })
                  }
                  placeholder="Nom du quartier"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date de vente
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  {editingId ? "Mettre à jour" : "Ajouter"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ ...defaultForm });
                    }}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10">
                        Commercial
                      </th>
                      {dates.map((date) => (
                        <th
                          key={date}
                          className="px-4 py-4 text-center text-sm font-semibold text-slate-900 whitespace-nowrap"
                        >
                          {new Date(date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => {
                      const totalVentes = sales.filter(
                        (s) => s.agent === agent
                      ).length;
                      return (
                        <tr
                          key={agent}
                          className="border-b border-slate-200 hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-slate-900 sticky left-0 bg-white hover:bg-slate-50 z-10">
                            {agent}
                          </td>
                          {dates.map((date) => {
                            const cellSales = salesByAgentAndDate(agent, date);
                            return (
                              <td
                                key={`${agent}-${date}`}
                                className="px-4 py-4 text-center"
                              >
                                {cellSales.length > 0 ? (
                                  <div className="space-y-2">
                                    {cellSales.map((sale) => (
                                      <div
                                        key={sale.id}
                                        className="inline-block bg-blue-100 text-blue-900 rounded-lg px-3 py-1 text-xs font-medium cursor-pointer hover:bg-blue-200 transition"
                                        onDoubleClick={() => handleEdit(sale)}
                                        title="Double-cliquez pour modifier"
                                      >
                                        {sale.neighborhood}
                                        <button
                                          onClick={() => handleDelete(sale.id)}
                                          className="ml-2 text-blue-600 hover:text-red-600 font-bold"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900 bg-slate-50">
                            {totalVentes}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                      <td className="px-6 py-4 text-sm text-slate-900 sticky left-0 bg-slate-100 z-10">
                        TOTAL
                      </td>
                      {dates.map((date) => {
                        const totalByDate = sales.filter(
                          (s) => s.date === date
                        ).length;
                        return (
                          <td
                            key={`total-${date}`}
                            className="px-4 py-4 text-center text-sm text-slate-900"
                          >
                            {totalByDate}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center text-sm text-slate-900">
                        {sales.length}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
