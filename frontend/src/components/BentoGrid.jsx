import React from 'react';
import { 
  FileCheck2, 
  AlertTriangle, 
  IndianRupee, 
  ShieldAlert, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet,
  Zap,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'indigo' }) {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    rose: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400',
    amber: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400'
  };

  return (
    <div className="bento-card bento-card-glow relative group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase font-mono">{title}</span>
        <div className={`p-2 rounded-xl bg-gradient-to-br border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </div>
        <div className="mt-1 flex items-center space-x-2">
          {trend && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> {trend}
            </span>
          )}
          <span className="text-xs text-zinc-400 font-sans">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}

export function GstrChartCard({ metrics }) {
  const chartData = [
    { name: 'CGST (Central)', amount: metrics?.totalCgst || 0, fill: '#6366f1' },
    { name: 'SGST (State)', amount: metrics?.totalSgst || 0, fill: '#a855f7' },
    { name: 'IGST (Interstate)', amount: metrics?.totalIgst || 0, fill: '#3b82f6' }
  ];

  return (
    <div className="bento-card col-span-1 md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>Monthly GST Tax Distribution</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Aggregated CGST, SGST, and IGST tax splits</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
          ₹{(metrics?.totalTaxLiability || 0).toLocaleString('en-IN')} Total Tax
        </span>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }}
              formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Tax Amount']}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function QuickRuleGuideCard() {
  return (
    <div className="bento-card bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 border-indigo-500/20">
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="w-4 h-4 text-indigo-400" />
        <h4 className="text-sm font-bold text-white">Automated GST Audit Rules</h4>
      </div>
      
      <ul className="space-y-2.5 text-xs text-zinc-300">
        <li className="flex items-start space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
          <span><strong className="text-white">Intrastate (Same State Code):</strong> First 2 GSTIN digits match. Split tax 50% CGST + 50% SGST.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
          <span><strong className="text-white">Interstate (Different State):</strong> GSTIN state prefixes differ. Route 100% tax to IGST.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
          <span><strong className="text-white">Arithmetic Check:</strong> Flags any invoice where Subtotal + Tax ≠ Grand Total.</span>
        </li>
      </ul>
    </div>
  );
}
