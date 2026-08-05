import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FileSpreadsheet, 
  Download, 
  IndianRupee, 
  Building2, 
  Layers, 
  PieChart, 
  CheckCircle2, 
  AlertTriangle,
  FileMinus,
  FilePlus,
  FileText
} from 'lucide-react';

export default function GstrSummaryView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await axios.get('/api/audit/summary');
        setData(res.data);
      } catch (err) {
        console.error("GSTR Summary fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  const exportCSV = () => {
    if (!data) return;
    const metrics = data.metrics;
    const csvContent = [
      ['Metric', 'Value (INR / Count)'],
      ['Total Audited Invoices', metrics.totalInvoices || 0],
      ['Standard Invoices Count', metrics.invoiceCount || 0],
      ['Credit Notes Count', metrics.creditNoteCount || 0],
      ['Debit Notes Count', metrics.debitNoteCount || 0],
      ['Compliance Rate (%)', (metrics.complianceRate || 100) + '%'],
      ['Total Subtotal Taxable Value', metrics.totalSubtotal || 0],
      ['Total CGST', metrics.totalCgst || 0],
      ['Total SGST', metrics.totalSgst || 0],
      ['Total IGST', metrics.totalIgst || 0],
      ['Total Tax Liability', metrics.totalTaxLiability || 0],
      ['Total Net Grand Amount', metrics.totalGrandTotal || 0]
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GSTR_Summary_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const metrics = data?.metrics || {};
  const hsnList = data?.hsnSummary || [];
  const vendorList = data?.vendorSummary || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            MONTHLY GSTR FILING RECONCILIATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 font-sans">
            GSTR-1 &amp; GSTR-2 Summary Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Aggregated taxable values, CGST/SGST/IGST breakdown, and Credit/Debit Note adjustments.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-medium text-xs flex items-center space-x-2 transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export GSTR Summary (CSV)</span>
        </button>
      </div>

      {/* Document Type Breakdown Cards (Invoices, Credit Notes, Debit Notes) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Standard Tax Invoices</span>
              <span className="text-xl font-bold text-white font-mono">{metrics.invoiceCount || 0}</span>
            </div>
          </div>
          <span className="text-xs font-mono text-indigo-400 font-bold">Billing (+)</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileMinus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Credit Notes</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{metrics.creditNoteCount || 0}</span>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">Tax Credit (-)</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Debit Notes</span>
              <span className="text-xl font-bold text-blue-400 font-mono">{metrics.debitNoteCount || 0}</span>
            </div>
          </div>
          <span className="text-xs font-mono text-blue-400 font-bold">Surcharge (+)</span>
        </div>
      </div>

      {/* Primary Tax Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card bg-zinc-900/80 border-indigo-500/30">
          <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">NET TAXABLE SUB-TOTAL</span>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            ₹{(metrics.totalSubtotal || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Adjusted Net Taxable Value</span>
        </div>

        <div className="bento-card bg-zinc-900/80 border-indigo-500/30">
          <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase">TOTAL CGST</span>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-2">
            ₹{(metrics.totalCgst || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Central GST (50% Intrastate)</span>
        </div>

        <div className="bento-card bg-zinc-900/80 border-purple-500/30">
          <span className="text-[11px] font-mono font-bold text-purple-400 uppercase">TOTAL SGST</span>
          <div className="text-2xl font-bold text-purple-400 font-mono mt-2">
            ₹{(metrics.totalSgst || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">State GST (50% Intrastate)</span>
        </div>

        <div className="bento-card bg-zinc-900/80 border-blue-500/30">
          <span className="text-[11px] font-mono font-bold text-blue-400 uppercase">TOTAL IGST</span>
          <div className="text-2xl font-bold text-blue-400 font-mono mt-2">
            ₹{(metrics.totalIgst || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Integrated GST (Interstate)</span>
        </div>
      </div>

      {/* Two Column Section: HSN Summary & Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HSN Code Summary Table */}
        <div className="bento-card">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">HSN / SAC SUMMARY BREAKDOWN</h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="p-3">HSN/SAC CODE</th>
                  <th className="p-3 text-right">ITEM QTY</th>
                  <th className="p-3 text-right">NET VALUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {hsnList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-zinc-500 text-xs">No HSN data found</td>
                  </tr>
                ) : (
                  hsnList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-mono text-indigo-400 font-bold">{item.hsnCode}</td>
                      <td className="p-3 text-right font-mono">{item.count}</td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        ₹{(item.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Vendors Table */}
        <div className="bento-card">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">TOP SUPPLIER VENDORS</h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="p-3">VENDOR NAME</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3 text-right">DOCS</th>
                  <th className="p-3 text-right">NET VALUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {vendorList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-zinc-500 text-xs">No vendor data found</td>
                  </tr>
                ) : (
                  vendorList.map((v, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-semibold text-white">{v.vendorName}</td>
                      <td className="p-3 font-mono text-zinc-400">{v.gstin || 'N/A'}</td>
                      <td className="p-3 text-right font-mono">{v.count}</td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        ₹{(v.totalValue || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
