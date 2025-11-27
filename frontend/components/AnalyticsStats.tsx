'use client';

import { useMemo } from 'react';
import type { Transaction } from '../lib/api';

interface AnalyticsStatsProps {
  transactions: Transaction[];
  userId: string;
}

interface StatsData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  averageTransaction: number;
  largestIncome: number;
  largestExpense: number;
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[];
  weeklyData: {
    week: string;
    income: number;
    expenses: number;
  }[];
}

export function calculateAnalytics(transactions: Transaction[], userId: string): StatsData {
  const userTransactions = transactions.filter(t => 
    t.senderId === userId || t.receiverId === userId
  );

  // Calculer revenus et dépenses
  const incomes = userTransactions
    .filter(t => t.receiverId === userId)
    .map(t => t.amount);
  
  const expenses = userTransactions
    .filter(t => t.senderId === userId)
    .map(t => t.amount);

  const totalIncome = incomes.reduce((sum, amount) => sum + amount, 0);
  const totalExpenses = expenses.reduce((sum, amount) => sum + amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const transactionCount = userTransactions.length;
  const averageTransaction = transactionCount > 0 
    ? (totalIncome + totalExpenses) / transactionCount 
    : 0;
  const largestIncome = incomes.length > 0 ? Math.max(...incomes) : 0;
  const largestExpense = expenses.length > 0 ? Math.max(...expenses) : 0;

  // Données mensuelles (6 derniers mois)
  const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    monthlyData[monthKey] = { income: 0, expenses: 0 };
  }

  userTransactions.forEach(transaction => {
    const date = new Date(transaction.createdAt);
    const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    
    if (monthlyData[monthKey]) {
      if (transaction.receiverId === userId) {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    }
  });

  const monthlyArray = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses
  }));

  // Données hebdomadaires (4 dernières semaines)
  const weeklyData: { [key: string]: { income: number; expenses: number } } = {};
  
  for (let i = 3; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = `Sem. ${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
    weeklyData[weekKey] = { income: 0, expenses: 0 };
  }

  userTransactions.forEach(transaction => {
    const date = new Date(transaction.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = `Sem. ${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
    
    if (weeklyData[weekKey]) {
      if (transaction.receiverId === userId) {
        weeklyData[weekKey].income += transaction.amount;
      } else {
        weeklyData[weekKey].expenses += transaction.amount;
      }
    }
  });

  const weeklyArray = Object.entries(weeklyData).map(([week, data]) => ({
    week,
    income: data.income,
    expenses: data.expenses
  }));

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    transactionCount,
    averageTransaction,
    largestIncome,
    largestExpense,
    monthlyData: monthlyArray,
    weeklyData: weeklyArray
  };
}

export default function AnalyticsStats({ transactions, userId }: AnalyticsStatsProps) {
  const stats = useMemo(() => calculateAnalytics(transactions, userId), [transactions, userId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-300 text-xs sm:text-sm">Revenus totaux</p>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalIncome.toFixed(2)}</p>
        <p className="text-gray-400 text-xs mt-1">Crédits reçus</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-300 text-xs sm:text-sm">Dépenses totales</p>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalExpenses.toFixed(2)}</p>
        <p className="text-gray-400 text-xs mt-1">Crédits envoyés</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-300 text-xs sm:text-sm">Solde net</p>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p className={`text-2xl sm:text-3xl font-bold ${stats.netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {stats.netBalance >= 0 ? '+' : ''}{stats.netBalance.toFixed(2)}
        </p>
        <p className="text-gray-400 text-xs mt-1">Bilan financier</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-300 text-xs sm:text-sm">Moyenne</p>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white">{stats.averageTransaction.toFixed(2)}</p>
        <p className="text-gray-400 text-xs mt-1">Par transaction</p>
      </div>
    </div>
  );
}

