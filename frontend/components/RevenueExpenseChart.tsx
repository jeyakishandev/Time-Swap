'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  month?: string;
  week?: string;
  income: number;
  expenses: number;
}

interface RevenueExpenseChartProps {
  data: ChartData[];
  type: 'monthly' | 'weekly';
}

export default function RevenueExpenseChart({ data, type }: RevenueExpenseChartProps) {
  const xAxisKey = type === 'monthly' ? 'month' : 'week';
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
        {type === 'monthly' ? 'Évolution mensuelle' : 'Évolution hebdomadaire'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5C6A" opacity={0.3} />
          <XAxis 
            dataKey={xAxisKey} 
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
          />
          <Legend 
            wrapperStyle={{ color: '#9BA8AB', fontSize: '14px' }}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Revenus"
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Dépenses"
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

