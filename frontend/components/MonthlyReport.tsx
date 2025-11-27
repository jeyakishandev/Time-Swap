'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyReportProps {
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

export default function MonthlyReport({ monthlyData }: MonthlyReportProps) {
  const dataWithNet = monthlyData.map(item => ({
    ...item,
    net: item.income - item.expenses
  }));

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Rapport mensuel</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataWithNet} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5C6A" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            stroke="#9BA8AB"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9BA8AB' }}
          />
          <YAxis 
            stroke="#9BA8AB"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9BA8AB' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a2332', 
              border: '1px solid #4A5C6A',
              borderRadius: '8px',
              color: '#fff'
            }}
            labelStyle={{ color: '#9BA8AB' }}
            formatter={(value: number) => `${value.toFixed(2)} crédits`}
          />
          <Legend 
            wrapperStyle={{ color: '#9BA8AB', fontSize: '14px' }}
          />
          <Bar dataKey="income" fill="#10b981" name="Revenus" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="#ef4444" name="Dépenses" radius={[4, 4, 0, 0]} />
          <Bar dataKey="net" fill="#3b82f6" name="Solde net" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

