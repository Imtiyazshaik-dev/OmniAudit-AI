import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  ArrowRight, 
  FileText, 
  IndianRupee, 
  ShieldAlert,
  Download,
  Calendar,
  Hash,
  Briefcase
} from 'lucide-react';

export default function InvoiceAuditResultModal({ invoice, onClose }) {
  if (!invoice) return null;

  const isPassed = invoice.auditStatus === 'PASSED';
  const isInterstate = invoice.isInterstate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border ${
              isPassed 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-glow-emerald' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-glow-rose'
            }`}>
              {isPassed ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{invoice.vendorName}</h2>
                <span className={`px-3 py-0.5 text-xs font-mono font-bold rounded-full border ${
                  isPassed
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {invoice.auditStatus}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center space-x-2">
                <span>Invoice #{invoice.invoiceNumber}</span>
                <span>•</span>
                <span>Date: {invoice.date}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Discrepancy Alerts (If any) */}
          {Array.isArray(invoice.discrepancies) && invoice.discrepancies.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs font-mono">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>GST COMPLIANCE DISCREPANCIES FLAGGED ({invoice.discrepancies.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-rose-200 pl-1">
                {invoice.discrepancies.map((disc, idx) => (
                  <li key={idx}>{disc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* GSTIN State Codes Comparison Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block mb-2">SUPPLIER (ISSUER)</span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">{invoice.supplierState?.name || 'Unknown State'}</span>
                  <span className="text-xs font-mono text-indigo-400">{invoice.supplierGSTIN || 'N/A'}</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                  State {invoice.supplierState?.code || '--'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block mb-2">RECIPIENT (BUYER)</span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">{invoice.recipientState?.name || 'Unknown State'}</span>
                  <span className="text-xs font-mono text-purple-400">{invoice.recipientGSTIN || 'N/A'}</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
                  State {invoice.recipientState?.code || '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Type & Tax Split Comparison */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-zinc-300 font-mono">TRANSACTION CLASSIFICATION:</span>
                <span className={`px-2.5 py-0.5 text-xs font-bold font-mono rounded-full ${
                  isInterstate
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isInterstate ? 'INTERSTATE (IGST 100%)' : 'INTRASTATE (CGST 50% + SGST 50%)'}
                </span>
              </div>
              <span className="text-xs text-zinc-400">Rule 2-Digit GSTIN Code</span>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px]">SUBTOTAL</span>
                <span className="text-sm font-bold text-white">₹{(invoice.amounts?.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px]">CALCULATED CGST</span>
                <span className="text-sm font-bold text-indigo-400">₹{(invoice.calculatedTaxSplit?.cgst || 0).toLocaleString('en-IN')}</span>
                {invoice.extractedTaxSplit?.cgst !== invoice.calculatedTaxSplit?.cgst && (
                  <span className="text-[10px] text-rose-400 block font-sans">Extracted: ₹{invoice.extractedTaxSplit?.cgst}</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px]">CALCULATED SGST</span>
                <span className="text-sm font-bold text-purple-400">₹{(invoice.calculatedTaxSplit?.sgst || 0).toLocaleString('en-IN')}</span>
                {invoice.extractedTaxSplit?.sgst !== invoice.calculatedTaxSplit?.sgst && (
                  <span className="text-[10px] text-rose-400 block font-sans">Extracted: ₹{invoice.extractedTaxSplit?.sgst}</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px]">CALCULATED IGST</span>
                <span className="text-sm font-bold text-blue-400">₹{(invoice.calculatedTaxSplit?.igst || 0).toLocaleString('en-IN')}</span>
                {invoice.extractedTaxSplit?.igst !== invoice.calculatedTaxSplit?.igst && (
                  <span className="text-[10px] text-rose-400 block font-sans">Extracted: ₹{invoice.extractedTaxSplit?.igst}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-mono font-bold text-white border-t border-zinc-800/80">
              <span>GRAND TOTAL AMOUNT:</span>
              <span className="text-base text-emerald-400">₹{(invoice.amounts?.grandTotal || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase mb-3 tracking-wider">EXTRACTED INVOICE LINE ITEMS</h4>
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 font-mono">
                  <tr>
                    <th className="p-3">ITEM DESCRIPTION</th>
                    <th className="p-3">HSN/SAC</th>
                    <th className="p-3 text-right">QTY</th>
                    <th className="p-3 text-right">RATE</th>
                    <th className="p-3 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {Array.isArray(invoice.lineItems) && invoice.lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-medium">{item.description}</td>
                      <td className="p-3 font-mono text-zinc-400">{item.hsnSac || '--'}</td>
                      <td className="p-3 text-right font-mono">{item.qty}</td>
                      <td className="p-3 text-right font-mono">₹{(item.price || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono font-bold text-white">₹{(item.total || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-mono">Audited by Gemini Vision AI Multimodal Engine</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
          >
            Close Audit View
          </button>
        </div>

      </div>
    </div>
  );
}
