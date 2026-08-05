import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Building2,
  FileCheck,
  FileMinus,
  FilePlus,
  FileText
} from 'lucide-react';
import InvoiceAuditResultModal from '../components/InvoiceAuditResultModal';

export default function HistoryView() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/audit/history', {
        params: { status: statusFilter, docType: docTypeFilter, search: searchQuery }
      });
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, docTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this audit record?")) return;
    try {
      await axios.delete(`/api/audit/${id}`);
      fetchHistory();
    } catch (err) {
      alert("Failed to delete record");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
          AUDIT COMPLIANCE LOGS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 font-sans">
          Historical Audit Records
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Search, filter, and inspect past Invoices, Credit Notes, and Debit Notes.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search vendor, invoice #, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </form>

        {/* Document Type & Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Doc Type Filter */}
          <div className="flex items-center space-x-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setDocTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                docTypeFilter === 'ALL'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setDocTypeFilter('INVOICE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                docTypeFilter === 'INVOICE'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setDocTypeFilter('CREDIT_NOTE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                docTypeFilter === 'CREDIT_NOTE'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Credit Notes
            </button>
            <button
              onClick={() => setDocTypeFilter('DEBIT_NOTE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                docTypeFilter === 'DEBIT_NOTE'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Debit Notes
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('PASSED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'PASSED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Passed
            </button>
            <button
              onClick={() => setStatusFilter('FLAGGED_MISMATCH')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'FLAGGED_MISMATCH'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Flagged
            </button>
          </div>

        </div>

      </div>

      {/* History Table */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 font-mono border-b border-zinc-800">
              <tr>
                <th className="p-4">DOC TYPE</th>
                <th className="p-4">VENDOR &amp; INVOICE</th>
                <th className="p-4">SUPPLIER GSTIN</th>
                <th className="p-4">RECIPIENT GSTIN</th>
                <th className="p-4">TRANSACTION</th>
                <th className="p-4 text-right">AMOUNT</th>
                <th className="p-4 text-center">STATUS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-zinc-500 text-xs">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isPassed = inv.auditStatus === 'PASSED';
                  const docType = inv.documentType || 'INVOICE';
                  const isCreditNote = docType === 'CREDIT_NOTE';
                  const isDebitNote = docType === 'DEBIT_NOTE';

                  return (
                    <tr key={inv._id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full border ${
                          isCreditNote
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : isDebitNote
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          {isCreditNote ? 'CREDIT NOTE (-)' : isDebitNote ? 'DEBIT NOTE (+)' : 'INVOICE'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-white block text-sm">{inv.vendorName}</span>
                        <span className="text-[11px] font-mono text-zinc-400">#{inv.invoiceNumber} • {inv.date}</span>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="text-zinc-300 block">{inv.supplierGSTIN || 'N/A'}</span>
                        <span className="text-[10px] text-indigo-400 font-sans">{inv.supplierState?.name} ({inv.supplierState?.code})</span>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="text-zinc-300 block">{inv.recipientGSTIN || 'N/A'}</span>
                        <span className="text-[10px] text-purple-400 font-sans">{inv.recipientState?.name} ({inv.recipientState?.code})</span>
                      </td>

                      <td className="p-4 font-mono">
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                          inv.isInterstate
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {inv.isInterstate ? 'INTERSTATE (IGST)' : 'INTRASTATE (CGST/SGST)'}
                        </span>
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-sm">
                        <span className={isCreditNote ? 'text-amber-400' : 'text-white'}>
                          {isCreditNote ? '-' : ''}₹{(inv.amounts?.grandTotal || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 text-[10px] font-mono font-bold rounded-full border ${
                          isPassed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-glow-rose'
                        }`}>
                          {inv.auditStatus}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-indigo-400 transition-colors"
                            title="Inspect Audit Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(inv._id, e)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/50 text-rose-400 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceAuditResultModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
