"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

type Sale = {
  id: string;
  agent: string;
  neighborhood: string;
  date: string;
  in_zone: boolean;
};

const defaultForm = {
  agent: "",
  neighborhood: "",
  date: new Date().toISOString().slice(0, 10),
  in_zone: true,
};

export default function Home() {
  const { session } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [form, setForm] = useState({ ...defaultForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = session?.access_token || "";

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setSales(await res.json());
    } catch {
      setError("Erreur lors du chargement des ventes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSales();
  }, [token]);

  const agents = Array.from(new Set(sales.map((s) => s.agent))).sort();
  const dates = Array.from(new Set(sales.map((s) => s.date))).sort().reverse();

  const cellSales = (agent: string, date: string) =>
    sales.filter((s) => s.agent === agent && s.date === date);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agent || !form.neighborhood || !form.date) return;
    setError(null);
    try {
      const payload = {
        agent: form.agent.trim(),
        neighborhood: form.neighborhood.trim(),
        date: form.date,
        in_zone: form.in_zone,
      };
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...payload, id: editingId } : payload;
      const res = await fetch("/api/sales", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      await fetchSales();
      setForm({ ...defaultForm });
      setEditingId(null);
    } catch {
      setError("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setForm({
      agent: sale.agent,
      neighborhood: sale.neighborhood,
      date: sale.date,
      in_zone: sale.in_zone ?? true,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/sales?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      await fetchSales();
      if (editingId === id) {
        setEditingId(null);
        setForm({ ...defaultForm });
      }
    } catch {
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
    } catch {
      alert("Erreur lors du téléchargement");
    }
  };

  const downloadAsExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sales);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventes");
    XLSX.writeFile(wb, "ventes.xlsx");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar active="tableau" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700"
            >
              {error}
              <button onClick={() => setError(null)} className="ml-2 font-bold">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Tableau croisé</h2>
                <p className="mt-1 text-slate-500">Ventes par commercial, quartier et date</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadAsImage}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  📷 Image
                </button>
                <button
                  onClick={downloadAsExcel}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  📊 Excel
                </button>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Formulaire */}
              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg lg:col-span-1 h-fit"
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  {editingId ? "Modifier une vente" : "Ajouter une vente"}
                </h2>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Commercial
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.agent}
                      onChange={(e) => setForm({ ...form, agent: e.target.value })}
                      placeholder="Nom du commercial"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quartier
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.neighborhood}
                      onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                      placeholder="Nom du quartier"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date de vente
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>

                  {/* Zone toggle */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Zone
                    </label>
                    <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, in_zone: true })}
                        className={`flex-1 py-2.5 text-sm font-medium transition ${
                          form.in_zone
                            ? "bg-emerald-500 text-white"
                            : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        ✓ Dans notre zone
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, in_zone: false })}
                        className={`flex-1 py-2.5 text-sm font-medium transition border-l border-slate-300 ${
                          !form.in_zone
                            ? "bg-amber-500 text-white"
                            : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        ✗ Hors zone
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white transition"
                      style={{ backgroundColor: "var(--th-primary)" }}
                    >
                      {editingId ? "Mettre à jour" : "Ajouter"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setForm({ ...defaultForm }); }}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </motion.section>

              {/* Tableau */}
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="lg:col-span-2"
              >
                <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10">
                            Commercial
                          </th>
                          {dates.map((date) => (
                            <th key={date} className="px-4 py-4 text-center text-sm font-semibold text-slate-900 whitespace-nowrap">
                              {new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                            </th>
                          ))}
                          <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map((agent) => (
                          <tr key={agent} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900 sticky left-0 bg-white hover:bg-slate-50 z-10">
                              {agent}
                            </td>
                            {dates.map((date) => {
                              const cs = cellSales(agent, date);
                              return (
                                <td key={`${agent}-${date}`} className="px-4 py-4 text-center">
                                  {cs.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 justify-center">
                                      <AnimatePresence>
                                        {cs.map((sale) => (
                                          <motion.div
                                            key={sale.id}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition ${
                                              sale.in_zone !== false
                                                ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                                : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                                            }`}
                                            onDoubleClick={() => handleEdit(sale)}
                                            title={`${sale.in_zone !== false ? "Dans la zone" : "Hors zone"} — Double-clic pour modifier`}
                                          >
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sale.in_zone !== false ? "bg-emerald-500" : "bg-amber-500"}`} />
                                            {sale.neighborhood}
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleDelete(sale.id); }}
                                              className="ml-1.5 opacity-60 hover:opacity-100 font-bold"
                                            >
                                              ×
                                            </button>
                                          </motion.div>
                                        ))}
                                      </AnimatePresence>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900 bg-slate-50">
                              {sales.filter((s) => s.agent === agent).length}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                          <td className="px-6 py-4 text-sm text-slate-900 sticky left-0 bg-slate-100 z-10">TOTAL</td>
                          {dates.map((date) => (
                            <td key={`total-${date}`} className="px-4 py-4 text-center text-sm text-slate-900">
                              {sales.filter((s) => s.date === date).length}
                            </td>
                          ))}
                          <td className="px-6 py-4 text-center text-sm text-slate-900">{sales.length}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.section>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
