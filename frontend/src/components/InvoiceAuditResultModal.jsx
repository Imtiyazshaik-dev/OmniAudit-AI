import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  ArrowLeft, 
  FileText, 
  IndianRupee, 
  ShieldAlert,
  Download,
  Calendar,
  Hash,
  Briefcase,
  Sparkles,
  FileMinus,
  FilePlus,
  Link2
} from 'lucide-react';

export default function InvoiceAuditResultModal({ invoice, onClose }) {
  if (!invoice) return null;

  const isPassed = invoice.auditStatus === 'PASSED';
  const isInterstate = invoice.isInterstate;
  const docType = invoice.documentType || 'INVOICE';
  const isCreditNote = docType === 'CREDIT_NOTE';
  const isDebitNote = docType === 'DEBIT_NOTE';

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto flex flex-col justify-between animate-in fade-in duration-200">
      
      {/* Top Isolated Navigation Bar */}
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold font-mono transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>BACK TO WORKSPACE</span>
          </button>

          <div className="h-5 w-[1px] bg-zinc-800 hidden sm:block" />

          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${
              isPassed 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">{invoice.vendorName}</h2>
                
                {/* Document Type Badge */}
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                  isCreditNote
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : isDebitNote
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}>
                  {isCreditNote ? 'CREDIT NOTE (-)' : isDebitNote ? 'DEBIT NOTE (+)' : 'TAX INVOICE'}
                </span>

                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                  isPassed
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {invoice.auditStatus}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center space-x-2 font-mono mt-0.5">
                <span>Doc #{invoice.invoiceNumber}</span>
                <span>•</span>
                <span>Date: {invoice.date}</span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
          title="Exit Audit Inspection View"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Full-Screen Isolated Workspace Content */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        
        {/* Credit Note / Debit Note Original Invoice Reference Banner */}
        {(isCreditNote || isDebitNote) && invoice.originalInvoiceNumber && (
          <div className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs font-mono ${
            isCreditNote
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
          }`}>
            <Link2 className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold text-white block">
                {isCreditNote ? 'Credit Note Adjustment linked to Original Invoice' : 'Debit Note Surcharge linked to Original Invoice'}
              </span>
              <span>Ref Invoice #: <strong className="text-white">{invoice.originalInvoiceNumber}</strong> {invoice.originalInvoiceDate && `(Issued ${invoice.originalInvoiceDate})`}</span>
            </div>
          </div>
        )}

        {/* Discrepancy Alerts (If any) */}
        {Array.isArray(invoice.discrepancies) && invoice.discrepancies.length > 0 && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2.5">
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
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block mb-2">SUPPLIER (ISSUER)</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base font-bold text-white block">{invoice.supplierState?.name || 'Unknown State'}</span>
                <span className="text-xs font-mono text-indigo-400">{invoice.supplierGSTIN || 'N/A'}</span>
              </div>
              <span className="px-3 py-1 text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                State Code {invoice.supplierState?.code || '--'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block mb-2">RECIPIENT (BUYER)</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base font-bold text-white block">{invoice.recipientState?.name || 'Unknown State'}</span>
                <span className="text-xs font-mono text-purple-400">{invoice.recipientGSTIN || 'N/A'}</span>
              </div>
              <span className="px-3 py-1 text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
                State Code {invoice.recipientState?.code || '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Type & Tax Split Comparison */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-zinc-300 font-mono">TRANSACTION CLASSIFICATION:</span>
              <span className={`px-3 py-1 text-xs font-bold font-mono rounded-full ${
                isInterstate
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {isInterstate ? 'INTERSTATE (IGST 100%)' : 'INTRASTATE (CGST 50% + SGST 50%)'}
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">2-Digit GSTIN Rule Verification</span>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-400 block text-[10px] uppercase">SUBTOTAL VALUE</span>
              <span className="text-base font-bold text-white mt-1 block">
                {isCreditNote ? '-' : ''}₹{(invoice.amounts?.subtotal || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-400 block text-[10px] uppercase">CALCULATED CGST</span>
              <span className="text-base font-bold text-indigo-400 mt-1 block">
                {isCreditNote ? '-' : ''}₹{(invoice.calculatedTaxSplit?.cgst || 0).toLocaleString('en-IN')}
              </span>
              {invoice.extractedTaxSplit?.cgst !== invoice.calculatedTaxSplit?.cgst && (
                <span className="text-[10px] text-rose-400 block font-sans mt-1">Stated in doc: ₹{invoice.extractedTaxSplit?.cgst}</span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-400 block text-[10px] uppercase">CALCULATED SGST</span>
              <span className="text-base font-bold text-purple-400 mt-1 block">
                {isCreditNote ? '-' : ''}₹{(invoice.calculatedTaxSplit?.sgst || 0).toLocaleString('en-IN')}
              </span>
              {invoice.extractedTaxSplit?.sgst !== invoice.calculatedTaxSplit?.sgst && (
                <span className="text-[10px] text-rose-400 block font-sans mt-1">Stated in doc: ₹{invoice.extractedTaxSplit?.sgst}</span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-400 block text-[10px] uppercase">CALCULATED IGST</span>
              <span className="text-base font-bold text-blue-400 mt-1 block">
                {isCreditNote ? '-' : ''}₹{(invoice.calculatedTaxSplit?.igst || 0).toLocaleString('en-IN')}
              </span>
              {invoice.extractedTaxSplit?.igst !== invoice.calculatedTaxSplit?.igst && (
                <span className="text-[10px] text-rose-400 block font-sans mt-1">Stated in doc: ₹{invoice.extractedTaxSplit?.igst}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 text-xs font-mono font-bold text-white border-t border-zinc-800/80">
            <span className="text-sm">
              {isCreditNote ? 'NET CREDIT ADJUSTMENT AMOUNT:' : isDebitNote ? 'NET DEBIT SURCHARGE AMOUNT:' : 'GRAND TOTAL INVOICE AMOUNT:'}
            </span>
            <span className={`text-lg font-bold ${isCreditNote ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isCreditNote ? '-' : ''}₹{(invoice.amounts?.grandTotal || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">EXTRACTED LINE ITEMS &amp; ADJUSTMENTS</h4>
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 font-mono">
                <tr>
                  <th className="p-3.5">ITEM DESCRIPTION</th>
                  <th className="p-3.5">HSN/SAC</th>
                  <th className="p-3.5 text-right">QTY</th>
                  <th className="p-3.5 text-right">UNIT RATE</th>
                  <th className="p-3.5 text-right">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {Array.isArray(invoice.lineItems) && invoice.lineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/40">
                    <td className="p-3.5 font-medium">{item.description}</td>
                    <td className="p-3.5 font-mono text-zinc-400">{item.hsnSac || '--'}</td>
                    <td className="p-3.5 text-right font-mono">{item.qty}</td>
                    <td className="p-3.5 text-right font-mono">₹{(item.price || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">₹{(item.total || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 px-6 py-4 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Multimodal Gemini 3.6 Vision Audit Engine</span>
        </div>

        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs border border-zinc-800 transition-colors"
        >
          Return to Workspace
        </button>
      </footer>

    </div>
  );
}
