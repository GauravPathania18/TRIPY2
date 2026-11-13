import React from 'react';
import { CreditCard } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface BudgetChartProps {
  bookings: any[];
  savedTrips: any[];
}

export default function BudgetChart({ bookings, savedTrips }: BudgetChartProps) {
  // Recharts Chart budget totals estimation
  const getBudgetChartData = () => {
    const data: any[] = [];
    bookings.forEach((b) => {
      data.push({
        name: b.package_name?.substr(0, 15) || 'Tour session',
        Cost: b.total_cost,
        Travelers: b.travelers * 10000 // scaling for visual comparison
      });
    });
    savedTrips.forEach((t) => {
      data.push({
        name: t.destination?.substr(0, 15),
        Cost: t.budget,
        Travelers: 20000
      });
    });

    // Fallback default chart if empty so UI looks breathtaking
    if (data.length === 0) {
      return [
        { name: 'Goa Signature', Cost: 60000, Travelers: 20000 },
        { name: 'Himalayan Trek', Cost: 48000, Travelers: 15000 },
        { name: 'Tokyo Custom', Cost: 140000, Travelers: 30000 }
      ];
    }
    return data;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
      <h2 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-amber-500" />
        <span>Financial Budget Analytics</span>
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getBudgetChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.15} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontClass="font-mono" />
            <YAxis stroke="#94a3b8" fontSize={10} fontClass="font-mono" />
            <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
            <Bar dataKey="Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
