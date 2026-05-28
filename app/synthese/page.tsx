"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

type Sale = {
  id: string;
  agent: string;
  neighborhood: string;
  date: string;
  in_zone: boolean;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function SynthesePage() {
  const { session } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch("/api/sales", { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSales(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  // ---- données pour les graphiques ----

  // Évolution quotidienne (30 derniers jours actifs)
  const allDates = Array.from(new Set(sales.map((s) => s.date))).sort();
  const dailyData = allDates.slice(-30).map((date) => {
    const daySales = sales.filter((s) => s.date === date);
    return {
      date: new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      zone: daySales.filter((s) => s.in_zone !== false).length,
      horsZone: daySales.filter((s) => s.in_zone === false).length,
    };
  });

  // Ventes par agent
  const agentMap: Record<string, number> = {};
  sales.forEach((s) => { agentMap[s.agent] = (agentMap[s.agent] || 0) + 1; });
  const agentData = Object.entries(agentMap)
    .map(([name, total]) => ({ name: name.split(" ")[0], total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Zone vs Hors zone
  const inZone = sales.filter((s) => s.in_zone !== false).length;
  const outZone = sales.filter((s) => s.in_zone === false).length;
  const zoneData = [
    { name: "Dans la zone", value: inZone },
    { name: "Hors zone", value: outZone },
  ].filter((d) => d.value > 0);
  const ZONE_COLORS = ["#10b981", "#f59e0b"];

  // ---- stats existantes ----
  const salesByMonth = sales.reduce((acc, sale) => {
    const month = sale.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(sale);
    return acc;
  }, {} as Record<string, Sale[]>);
  const months = Object.keys(salesByMonth).sort().reverse();

  const neighborhoodStats = sales.reduce((acc, sale) => {
    if (!acc[sale.neighborhood]) acc[sale.neighborhood] = { total: 0, byMonth: {} as Record<string, number>, agents: new Set<string>() };
    acc[sale.neighborhood].total++;
    const month = sale.date.slice(0, 7);
    acc[sale.neighborhood].byMonth[month] = (acc[sale.neighborhood].byMonth[month] || 0) + 1;
    acc[sale.neighborhood].agents.add(sale.agent);
    return acc;
  }, {} as Record<string, { total: number; byMonth: Record<string, number>; agents: Set<string> }>);
  const neighborhoodsSorted = Object.entries(neighborhoodStats)
    .map(([name, stats]) => ({ name, total: stats.total, byMonth: stats.byMonth, agentsCount: stats.agents.size }))
    .sort((a, b) => b.total - a.total);

  const agentsSorted = Object.entries(agentMap)
    .map(([name, total]) => {
      const neighborhoods = Array.from(new Set(sales.filter((s) => s.agent === name).map((s) => s.neighborhood)));
      return { name, total, neighborhoods };
    })
    .sort((a, b) => b.total - a.total);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar active="synthese" />
        <div className="flex items-center justify-center py-24">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar active="synthese" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Graphiques */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Évolution quotidienne */}
          <motion.section
            custom={0} variants={fadeUp} initial="hidden" animate="show"
            className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Évolution des ventes</h2>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="gZone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gHors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="zone" name="Dans la zone" stroke="#10b981" fill="url(#gZone)" strokeWidth={2} />
                  <Area type="monotone" dataKey="horsZone" name="Hors zone" stroke="#f59e0b" fill="url(#gHors)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm text-center py-12">Pas encore de données</p>
            )}
          </motion.section>

          {/* Zone pie */}
          <motion.section
            custom={1} variants={fadeUp} initial="hidden" animate="show"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg flex flex-col"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Répartition zone</h2>
            {zoneData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={zoneData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {zoneData.map((_, i) => <Cell key={i} fill={ZONE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1">
                  {zoneData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ZONE_COLORS[i] }} />
                        <span className="text-slate-600">{d.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {d.value} ({sales.length > 0 ? ((d.value / sales.length) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-sm text-center py-12">Pas encore de données</p>
            )}
          </motion.section>
        </div>

        {/* Bar chart agents */}
        <motion.section
          custom={2} variants={fadeUp} initial="hidden" animate="show"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Ventes par commercial</h2>
          {agentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" name="Ventes" radius={[6, 6, 0, 0]} fill="var(--th-primary)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">Pas encore de données</p>
          )}
        </motion.section>

        {/* Synthèse mensuelle */}
        <motion.section
          custom={3} variants={fadeUp} initial="hidden" animate="show"
          className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden"
        >
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Ventes par mois</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-900">
                  <th className="px-6 py-3">Mois</th>
                  <th className="px-6 py-3 text-center">Jours actifs</th>
                  <th className="px-6 py-3 text-center">Total</th>
                  <th className="px-6 py-3 text-center">Moy/jour</th>
                  <th className="px-6 py-3 text-center">Dans zone</th>
                  <th className="px-6 py-3 text-center">Hors zone</th>
                  <th className="px-6 py-3 text-center">Top quartier</th>
                  <th className="px-6 py-3 text-center">Commerciaux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {months.map((month) => {
                  const ms = salesByMonth[month];
                  const uniqueDates = new Set(ms.map((s) => s.date)).size;
                  const topN = Object.entries(
                    ms.reduce((acc, s) => { acc[s.neighborhood] = (acc[s.neighborhood] || 0) + 1; return acc; }, {} as Record<string, number>)
                  ).sort((a, b) => b[1] - a[1])[0];
                  const inZ = ms.filter((s) => s.in_zone !== false).length;
                  const outZ = ms.filter((s) => s.in_zone === false).length;
                  return (
                    <tr key={month} className="text-sm hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Date(`${month}-01`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">{uniqueDates}</td>
                      <td className="px-6 py-4 text-center font-semibold bg-blue-50 text-blue-900">{ms.length}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{(ms.length / uniqueDates).toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />{inZ}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />{outZ}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-900">
                        {topN ? `${topN[0]} (${topN[1]})` : "—"}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {Array.from(new Set(ms.map((s) => s.agent))).join(", ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top quartiers */}
          <motion.section
            custom={4} variants={fadeUp} initial="hidden" animate="show"
            className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden"
          >
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Top quartiers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-sm font-semibold text-slate-900">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Quartier</th>
                    <th className="px-4 py-3 text-center">Total</th>
                    <th className="px-4 py-3 text-center">Part</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {neighborhoodsSorted.map((n, i) => (
                    <tr key={n.name} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{i + 1}</td>
                      <td className="px-4 py-3 text-slate-900">{n.name}</td>
                      <td className="px-4 py-3 text-center font-semibold text-blue-900 bg-blue-50">{n.total}</td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {sales.length > 0 ? ((n.total / sales.length) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Top commerciaux */}
          <motion.section
            custom={5} variants={fadeUp} initial="hidden" animate="show"
            className="rounded-2xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Top commerciaux</h2>
            </div>
            <div className="space-y-3 p-6">
              {agentsSorted.map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: "var(--th-primary)" }}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.neighborhoods.slice(0, 3).join(", ")}{agent.neighborhoods.length > 3 ? "…" : ""}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{agent.total}</p>
                      <p className="text-xs text-slate-500">
                        {sales.length > 0 ? ((agent.total / sales.length) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sales.length > 0 ? (agent.total / sales.length) * 100 : 0}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: "var(--th-primary)" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
