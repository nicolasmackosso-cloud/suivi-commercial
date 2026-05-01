"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sale = {
  id: string;
  agent: string;
  neighborhood: string;
  date: string;
};

export default function ClassementPage() {
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

  // Obtenir les 15 derniers jours actifs
  const allDates = Array.from(new Set(sales.map((s) => s.date)))
    .sort()
    .reverse()
    .slice(0, 15)
    .reverse();

  // Grouper les ventes par quartier et date
  const neighborhoodStats = sales.reduce(
    (acc, sale) => {
      if (!acc[sale.neighborhood]) {
        acc[sale.neighborhood] = { total: 0, byDate: {} as Record<string, number> };
      }
      acc[sale.neighborhood].total++;
      acc[sale.neighborhood].byDate[sale.date] =
        (acc[sale.neighborhood].byDate[sale.date] || 0) + 1;
      return acc;
    },
    {} as Record<string, any>
  );

  // Trier les quartiers par total (décroissant)
  const neighborhoodsSorted = Object.entries(neighborhoodStats)
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      byDate: stats.byDate,
    }))
    .sort((a, b) => b.total - a.total);

  const totalSales = sales.length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              Classement automatique décroissant — Mis à jour en temps réel
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
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Synthèse
              </Link>
              <Link
                href="/classement"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Classement
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold sticky left-0 bg-blue-600 z-10">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold sticky left-12 bg-blue-600 z-10">
                    Quartier
                  </th>
                  {allDates.map((date) => {
                    const day = new Date(date);
                    const dayNum = day.getDate();
                    return (
                      <th
                        key={date}
                        className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap bg-blue-600"
                      >
                        J{dayNum}
                      </th>
                    );
                  })}
                  <th className="px-4 py-3 text-center text-sm font-semibold bg-blue-700">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold bg-blue-700">
                    Part (%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {neighborhoodsSorted.map((neighborhood, index) => {
                  const percentage =
                    totalSales > 0
                      ? ((neighborhood.total / totalSales) * 100).toFixed(1)
                      : "0.0";

                  // Colorer les lignes alternativement (sauf les premières)
                  const bgColor =
                    index < 4
                      ? "bg-white hover:bg-slate-50"
                      : index % 2 === 0
                      ? "bg-green-50 hover:bg-green-100"
                      : "bg-green-100 hover:bg-green-150";

                  return (
                    <tr key={neighborhood.name} className={bgColor}>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 sticky left-0 z-10 bg-inherit">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 sticky left-12 z-10 bg-inherit">
                        {neighborhood.name}
                      </td>
                      {allDates.map((date) => {
                        const count = neighborhood.byDate[date] || 0;
                        return (
                          <td
                            key={`${neighborhood.name}-${date}`}
                            className="px-3 py-3 text-center text-sm font-medium text-slate-900"
                          >
                            {count === 0 ? "—" : count}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900 bg-blue-50">
                        {neighborhood.total}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900 bg-blue-50">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
