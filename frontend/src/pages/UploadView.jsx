import React, { useState } from 'react';
import UploadDropzone from '../components/UploadDropzone';
import InvoiceAuditResultModal from '../components/InvoiceAuditResultModal';
import { Sparkles, ShieldCheck, FileCheck } from 'lucide-react';

export default function UploadView() {
  const [auditResult, setAuditResult] = useState(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GEMINI 3.6 FLASH MULTIMODAL AUDIT WORKSPACE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Upload Invoice Document
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          Extract raw invoice metadata, split taxes into CGST, SGST, or IGST based on 2-digit GSTIN state codes, and flag calculation mismatches automatically.
        </p>
      </div>

      <div className="bento-card">
        <UploadDropzone onAuditComplete={(res) => setAuditResult(res.invoice)} />
      </div>

      {auditResult && (
        <InvoiceAuditResultModal
          invoice={auditResult}
          onClose={() => setAuditResult(null)}
        />
      )}
    </div>
  );
}
