"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

type Sale = {
  id: string;
  agent: string;
  neighborhood: string;
  date: string;
};

const defaultForm = {
  agent: "",
  neighborhood: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function Home() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [form, setForm] = useState({ ...defaultForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await import("@/lib/supabase").then(({ supabase }) =>
        supabase.auth.getSession()
      );

      const response = await fetch("/api/sales", {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch sales");
      const data = await response.json();
      setSales(data);
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Erreur lors du chargement des ventes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);

  const agents = Array.from(new Set(sales.map((s) => s.agent))).sort();
  const dates = Array.from(new Set(sales.map((s) => s.date)))
    .sort()
    .reverse();

  const salesByAgentAndDate = (agent: string, date: string) => {
    return sales.filter((s) => s.agent === agent && s.date === date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agent || !form.neighborhood || !form.date) return;

    try {
      const { data: { session } } = await import("@/lib/supabase").then(({ supabase }) =>
        supabase.auth.getSession()
      );

      const payload = {
        agent: form.agent.trim(),
        neighborhood: form.neighborhood.trim(),
        date: form.date,
      };

      if (editingId) {
        // Update existing sale
        const response = await fetch("/api/sales", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || ""}`,
          },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
        if (!response.ok) throw new Error("Failed to update sale");
      } else {
        // Create new sale
        const response = await fetch("/api/sales", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || ""}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create sale");
      }

      await fetchSales();
      setForm({ ...defaultForm });
      setEditingId(null);
    } catch (err) {
      console.error("Error saving sale:", err);
      setError("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setForm({
      agent: sale.agent,
      neighborhood: sale.neighborhood,
      date: sale.date,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await import("@/lib/supabase").then(({ supabase }) =>
        supabase.auth.getSession()
      );

      const response = await fetch(`/api/sales?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete sale");
      await fetchSales();
      if (editingId === id) {
        setEditingId(null);
        setForm({ ...defaultForm });
      }
    } catch (err) {
      console.error("Error deleting sale:", err);
      setError("Erreur lors de la suppression");
    }
  };

  const downloadAsImage = async () => {
    const table = document.querySelector("table");
    if (!table) return;

    try {
      const canvas = await html2canvas(table);
      const link = document.createElement("a");
      link.download = "tableau-ventes.png";
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Error downloading image:", err);
      alert("Erreur lors du téléchargement de l'image");
    }
  };

  const downloadAsExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sales);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventes");
    XLSX.writeFile(wb, "ventes.xlsx");
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Suivi commercial</h1>
            <div className="flex gap-2 flex-wrap justify-end items-center">
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
              <Link
                href="/parametres"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Paramètres
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-600">Chargement des données...</div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    Tableau croisé
                  </h2>
                  <p className="mt-2 text-lg text-slate-600">
                    Suivez les ventes par commercial, quartier et date
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadAsImage}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    📷 Télécharger Image
                  </button>
                  <button
                    onClick={downloadAsExcel}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    📊 Télécharger Excel
                  </button>
                </div>
              </div>
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
          </>
        )}
      </div>
    </main>
  );
}
