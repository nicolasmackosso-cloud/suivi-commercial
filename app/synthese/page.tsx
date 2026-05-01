"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sale = {
  id: string;
  agent: string;
  neighborhood: string;
  date: string;
};

export default function SynthesePage() {
  const [sales, setSales] = useState<Sale[]>([]);

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

  // Grouper par mois
  const salesByMonth = sales.reduce(
    (acc, sale) => {
      const month = sale.date.slice(0, 7); // YYYY-MM
      if (!acc[month]) acc[month] = [];
      acc[month].push(sale);
      return acc;
    },
    {} as Record<string, Sale[]>
  );

  const months = Object.keys(salesByMonth).sort().reverse();

  // Statistiques par quartier
  const neighborhoodStats = sales.reduce(
    (acc, sale) => {
      if (!acc[sale.neighborhood]) {
        acc[sale.neighborhood] = {
          total: 0,
          byMonth: {} as Record<string, number>,
          agents: new Set<string>(),
        };
      }
      acc[sale.neighborhood].total++;
      const month = sale.date.slice(0, 7);
      acc[sale.neighborhood].byMonth[month] =
        (acc[sale.neighborhood].byMonth[month] || 0) + 1;
      acc[sale.neighborhood].agents.add(sale.agent);
      return acc;
    },
    {} as Record<string, any>
  );

  const neighborhoodsSorted = Object.entries(neighborhoodStats)
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      byMonth: stats.byMonth,
      agentsCount: stats.agents.size,
    }))
    .sort((a, b) => b.total - a.total);

  // Top commerciaux
  const agentStats = sales.reduce(
    (acc, sale) => {
      if (!acc[sale.agent]) {
        acc[sale.agent] = {
          total: 0,
          neighborhoods: new Set<string>(),
        };
      }
      acc[sale.agent].total++;
      acc[sale.agent].neighborhoods.add(sale.neighborhood);
      return acc;
    },
    {} as Record<string, any>
  );

  const agentsSorted = Object.entries(agentStats)
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      neighborhoods: Array.from(stats.neighborhoods),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              Synthèse mensuelle — Ventes Mistral Pointe-Noire
            </h1>
            <div className="flex gap-2 flex-wrap justify-end">
              <Link
                href="/"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Tableau croisé
              </Link>
              <Link
                href="/synthese"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
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
        {/* Synthèse mensuelle */}
        <section className="mb-8 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Ventes par mois
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-900">
                  <th className="px-6 py-3">Mois</th>
                  <th className="px-6 py-3 text-center">Nb jours</th>
                  <th className="px-6 py-3 text-center">Total ventes</th>
                  <th className="px-6 py-3 text-center">Moy/jour</th>
                  <th className="px-6 py-3 text-center">Quartiers actifs</th>
                  <th className="px-6 py-3 text-center">Top quartier</th>
                  <th className="px-6 py-3 text-center">Commerciaux actifs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {months.map((month) => {
                  const monthSales = salesByMonth[month];
                  const uniqueDates = new Set(
                    monthSales.map((s) => s.date)
                  ).size;
                  const uniqueNeighborhoods = new Set(
                    monthSales.map((s) => s.neighborhood)
                  );
                  const uniqueAgents = new Set(
                    monthSales.map((s) => s.agent)
                  );

                  // Top quartier du mois
                  const topNeighborhood = Object.entries(
                    monthSales.reduce(
                      (acc, sale) => {
                        acc[sale.neighborhood] = (acc[sale.neighborhood] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  ).sort((a, b) => b[1] - a[1])[0];

                  const monthKey = `${month.slice(5, 7)}/${month.slice(0, 4)}`;

                  return (
                    <tr key={month} className="text-sm hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Date(`${month}-01`).toLocaleDateString("fr-FR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {uniqueDates}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-blue-900 bg-blue-50">
                        {monthSales.length}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {(monthSales.length / uniqueDates).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {uniqueNeighborhoods.size}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-900">
                        {topNeighborhood
                          ? `${topNeighborhood[0]} (${topNeighborhood[1]})`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {Array.from(uniqueAgents).join(", ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Top quartiers */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Top quartiers vente mistral
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-900">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Quartier</th>
                    <th className="px-4 py-3 text-center">Mars (J1-J9)</th>
                    <th className="px-4 py-3 text-center">Avril (J5-J9)</th>
                    <th className="px-4 py-3 text-center">Total cumul</th>
                    <th className="px-4 py-3 text-center">Part (%)</th>
                    <th className="px-4 py-3">Tendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {neighborhoodsSorted.map((neighborhood, index) => {
                    const percentage = (
                      (neighborhood.total / sales.length) *
                      100
                    ).toFixed(1);
                    return (
                      <tr
                        key={neighborhood.name}
                        className="text-sm hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-slate-900">
                          {neighborhood.name}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {neighborhood.byMonth["2026-03"] || 0}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {neighborhood.byMonth["2026-04"] || 0}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-blue-900 bg-blue-50">
                          {neighborhood.total}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {percentage}%
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {" "}
                          {neighborhood.total > 5
                            ? "↑ Leader absolu"
                            : neighborhood.total > 3
                            ? "→ Très forte hausse"
                            : "→ Solide"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top commerciaux */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Top commerciaux
              </h2>
            </div>
            <div className="space-y-3 p-6">
              {agentsSorted.map((agent, index) => {
                const percentage = (
                  (agent.total / sales.length) *
                  100
                ).toFixed(1);
                return (
                  <div
                    key={agent.name}
                    className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                            {index + 1}
                          </span>
                          <span className="text-lg font-semibold text-slate-900">
                            {agent.name}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          Quartiers : {agent.neighborhoods.join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">
                          {agent.total}
                        </p>
                        <p className="text-sm text-slate-600">{percentage}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
