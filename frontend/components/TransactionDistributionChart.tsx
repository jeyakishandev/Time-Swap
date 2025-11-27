'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TransactionDistributionChartProps {
  totalIncome: number;
  totalExpenses: number;
}

export default function TransactionDistributionChart({ totalIncome, totalExpenses }: TransactionDistributionChartProps) {
  const data = [
    { name: 'Revenus', value: totalIncome },
    { name: 'Dépenses', value: totalExpenses },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  const total = totalIncome + totalExpenses;
  const incomePercentage = total > 0 ? ((totalIncome / total) * 100).toFixed(1) : '0';
  const expensePercentage = total > 0 ? ((totalExpenses / total) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Répartition des transactions</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a2332', 
              border: '1px solid #4A5C6A',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => `${value.toFixed(2)} crédits`}
          />
          <Legend 
            wrapperStyle={{ color: '#9BA8AB', fontSize: '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-green-400 text-2xl font-bold">{incomePercentage}%</p>
          <p className="text-gray-300 text-sm">Revenus</p>
        </div>
        <div className="text-center">
          <p className="text-red-400 text-2xl font-bold">{expensePercentage}%</p>
          <p className="text-gray-300 text-sm">Dépenses</p>
        </div>
      </div>
    </div>
  );
}

