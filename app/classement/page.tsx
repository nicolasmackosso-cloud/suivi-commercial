"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

type Sale = {
  id: string;
  agent: string;
  neighborhood: string;
  date: string;
  in_zone: boolean;
};

export default function ClassementPage() {
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

  const allDates = Array.from(new Set(sales.map((s) => s.date))).sort().reverse().slice(0, 15).reverse();

  const neighborhoodStats = sales.reduce((acc, sale) => {
    if (!acc[sale.neighborhood]) acc[sale.neighborhood] = { total: 0, inZone: 0, byDate: {} as Record<string, number> };
    acc[sale.neighborhood].total++;
    if (sale.in_zone !== false) acc[sale.neighborhood].inZone++;
    acc[sale.neighborhood].byDate[sale.date] = (acc[sale.neighborhood].byDate[sale.date] || 0) + 1;
    return acc;
  }, {} as Record<string, { total: number; inZone: number; byDate: Record<string, number> }>);

  const neighborhoodsSorted = Object.entries(neighborhoodStats)
    .map(([name, stats]) => ({ name, total: stats.total, inZone: stats.inZone, byDate: stats.byDate }))
    .sort((a, b) => b.total - a.total);

  const totalSales = sales.length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar active="classement" />
        <div className="flex items-center justify-center py-24">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar active="classement" />

      <div className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-white" style={{ backgroundColor: "var(--th-primary)" }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold sticky left-0 z-10" style={{ backgroundColor: "var(--th-primary)" }}>#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold sticky left-12 z-10" style={{ backgroundColor: "var(--th-primary)" }}>Quartier</th>
                  {allDates.map((date) => (
                    <th key={date} className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">
                      J{new Date(date + "T12:00:00").getDate()}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-sm font-semibold">Total</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Part&nbsp;(%)</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {neighborhoodsSorted.map((neighborhood, index) => {
                  const percentage = totalSales > 0 ? ((neighborhood.total / totalSales) * 100).toFixed(1) : "0.0";
                  const bgColor = index < 3 ? "bg-white hover:bg-slate-50" : index % 2 === 0 ? "bg-emerald-50 hover:bg-emerald-100" : "bg-emerald-100/60 hover:bg-emerald-100";

                  return (
                    <motion.tr
                      key={neighborhood.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      className={bgColor}
                    >
                      <td className="px-4 py-3 text-sm font-bold text-slate-900 sticky left-0 z-10 bg-inherit">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 sticky left-12 z-10 bg-inherit">{neighborhood.name}</td>
                      {allDates.map((date) => {
                        const count = neighborhood.byDate[date] || 0;
                        return (
                          <td key={`${neighborhood.name}-${date}`} className="px-3 py-3 text-center text-sm font-medium text-slate-900">
                            {count === 0 ? (
                              <span className="text-slate-300">—</span>
                            ) : (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold"
                                style={{ backgroundColor: "var(--th-primary)" }}
                              >
                                {count}
                              </motion.span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center text-sm font-bold text-blue-900 bg-blue-50">{neighborhood.total}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900">{percentage}%</td>
                      <td className="px-4 py-3 text-center">
                        {neighborhood.inZone > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {neighborhood.inZone}
                          </span>
                        )}
                        {(neighborhood.total - neighborhood.inZone) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 ml-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            {neighborhood.total - neighborhood.inZone}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
