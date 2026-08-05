import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  StatCard, 
  GstrChartCard, 
  QuickRuleGuideCard 
} from '../components/BentoGrid';
import UploadDropzone from '../components/UploadDropzone';
import InvoiceAuditResultModal from '../components/InvoiceAuditResultModal';
import { 
  FileCheck2, 
  AlertTriangle, 
  IndianRupee, 
  ShieldAlert, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle,
  Eye,
  RefreshCw,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardView() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, historyRes] = await Promise.all([
        axios.get('/api/audit/summary'),
        axios.get('/api/audit/history?limit=5')
      ]);

      setMetrics(summaryRes.data.metrics);
      setRecentInvoices(historyRes.data.invoices);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAuditComplete = (newAuditData) => {
    setSelectedInvoice(newAuditData.invoice);
    fetchData();
  };

  const handleSeedDemoData = async () => {
    setLoading(true);
    try {
      await axios.post('/api/audit/seed-demo');
      await fetchData();
    } catch (err) {
      alert("Failed to seed sample demo invoices.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllInvoices = async () => {
    if (!window.confirm("Are you sure you want to clear all invoices in your workspace?")) return;
    setLoading(true);
    try {
      await axios.post('/api/audit/clear-all');
      await fetchData();
    } catch (err) {
      alert("Failed to clear invoices.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● REALTIME AUDIT ENGINE ACTIVE
            </span>
            {user?.name && (
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user.organization || user.name} Workspace
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 font-sans">
            GST Compliance &amp; IDP Control Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Multimodal document processing, CGST/SGST/IGST state code routing, and tax arithmetic validation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {recentInvoices.length > 0 && (
            <button
              onClick={handleClearAllInvoices}
              className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400 text-xs font-medium flex items-center space-x-1.5 transition-all"
              title="Clear all invoices from workspace"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Data</span>
            </button>
          )}

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium flex items-center space-x-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/upload"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-glow-indigo flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Audit New Invoice</span>
          </Link>
        </div>
      </div>

      {/* KPI Bento Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL AUDITED"
          value={metrics?.totalInvoices || 0}
          subtitle="Processed invoices"
          icon={FileCheck2}
          color="indigo"
        />
        <StatCard
          title="COMPLIANCE RATE"
          value={`${metrics?.complianceRate || 100}%`}
          subtitle="Passed tax split rules"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="TOTAL TAX LIABILITY"
          value={`₹${(metrics?.totalTaxLiability || 0).toLocaleString('en-IN')}`}
          subtitle="CGST + SGST + IGST"
          icon={IndianRupee}
          color="amber"
        />
        <StatCard
          title="FLAGGED DISCREPANCIES"
          value={metrics?.flaggedCount || 0}
          subtitle="Requires compliance review"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Main Interactive Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Drag & Drop Dropzone */}
        <div className="lg:col-span-2 bento-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Instant Multimodal Vision Audit</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Upload raw invoice image/PDF or run 1-click sample demo</p>
            </div>
          </div>
          <UploadDropzone onAuditComplete={handleAuditComplete} />
        </div>

        {/* Right Col: Quick Rule Guide */}
        <div className="space-y-6">
          <QuickRuleGuideCard />
          <GstrChartCard metrics={metrics} />
        </div>

      </div>

      {/* Recent Audits Table */}
      <div className="bento-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-sans">Recent Invoice Audits</h3>
            <p className="text-xs text-zinc-400">Live compliance verification logs</p>
          </div>

          <div className="flex items-center space-x-3">
            {recentInvoices.length === 0 && (
              <button
                onClick={handleSeedDemoData}
                className="text-xs font-mono font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Load Sample Invoices</span>
              </button>
            )}

            <Link
              to="/history"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-mono"
            >
              <span>VIEW ALL INVOICES</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-3">
            <p className="text-xs text-zinc-400">Workspace is empty. No audited invoices found.</p>
            <div className="flex items-center justify-center space-x-3">
              <Link
                to="/upload"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
              >
                Upload First Invoice
              </Link>
              <button
                onClick={handleSeedDemoData}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Load Sample Test Invoices</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="p-3">VENDOR NAME</th>
                  <th className="p-3">INVOICE #</th>
                  <th className="p-3">STATE ROUTING</th>
                  <th className="p-3 text-right">TOTAL AMOUNT</th>
                  <th className="p-3 text-center">STATUS</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {recentInvoices.map((inv) => {
                  const isPassed = inv.auditStatus === 'PASSED';
                  return (
                    <tr key={inv._id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 font-semibold text-white">{inv.vendorName}</td>
                      <td className="p-3 font-mono text-zinc-400">{inv.invoiceNumber}</td>
                      <td className="p-3 font-mono text-xs">
                        <span className="text-zinc-300">
                          {inv.supplierState?.code || '??'} &rarr; {inv.recipientState?.code || '??'}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-1.5 font-sans">
                          ({inv.isInterstate ? 'Interstate' : 'Intrastate'})
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        ₹{(inv.amounts?.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full border ${
                          isPassed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-glow-rose'
                        }`}>
                          {inv.auditStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center space-x-1 text-xs ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Modal */}
      {selectedInvoice && (
        <InvoiceAuditResultModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
