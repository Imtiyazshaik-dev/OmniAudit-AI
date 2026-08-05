import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';

export default function UploadDropzone({ onAuditComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file type. Please upload a PNG, JPG, WEBP, or PDF invoice document.');
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
  };

  const processUpload = async (fileToUpload = null, sampleType = null) => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Animated Processing Pipeline Steps
      setProcessingStage('Reading document & extracting multimodal image tokens...');
      await new Promise(r => setTimeout(r, 600));

      setProcessingStage('Running Google Gemini Vision AI model (gemini-3.6-flash)...');
      await new Promise(r => setTimeout(r, 800));

      setProcessingStage('Executing GST State Code matching & Tax Split Engine...');
      await new Promise(r => setTimeout(r, 600));

      setProcessingStage('Verifying line item totals & persisting audit log...');
      
      let response;
      if (sampleType) {
        response = await axios.post('/api/audit/upload', { sampleType });
      } else {
        const formData = new FormData();
        formData.append('invoice', fileToUpload || selectedFile);
        response = await axios.post('/api/audit/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (onAuditComplete) {
        onAuditComplete(response.data);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg(err.response?.data?.error || 'Failed to process and audit invoice document.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="w-full">
      {/* Drag & Drop Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10 shadow-glow-indigo'
            : selectedFile
            ? 'border-emerald-500/60 bg-emerald-500/5'
            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            {selectedFile ? (
              <FileText className="w-8 h-8 text-emerald-400" />
            ) : (
              <UploadCloud className="w-8 h-8 text-indigo-400" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {selectedFile ? selectedFile.name : 'Drop your Invoice image or PDF here'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Supports PNG, JPG, WEBP, and PDF up to 10MB
            </p>
          </div>

          {selectedFile && !isProcessing && (
            <div className="flex items-center space-x-3 pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => processUpload()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-glow-indigo flex items-center space-x-2 transition-transform transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Run AI Audit</span>
              </button>
              
              <button
                onClick={() => setSelectedFile(null)}
                className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Change File
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="w-full max-w-md mt-4 p-4 rounded-2xl bg-zinc-950 border border-indigo-500/30 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-medium text-indigo-400">
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>AI Audit Pipeline Active</span>
                </span>
                <span>PROCESSING...</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans">{processingStage}</p>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full w-3/4 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1-Click Sample Invoice Test Buttons */}
      <div className="mt-6 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>TRY WITH SAMPLE INVOICE (1-CLICK DEMO)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => processUpload(null, 'intrastate')}
            disabled={isProcessing}
            className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 text-left group transition-all"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Intrastate (MH &rarr; MH)</span>
              <CheckCircle2 className="w-3.5 h-3.5 opacity-80 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Splits 50% CGST + 50% SGST</p>
          </button>

          <button
            onClick={() => processUpload(null, 'interstate')}
            disabled={isProcessing}
            className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 text-left group transition-all"
          >
            <div className="flex items-center justify-between text-xs font-bold text-blue-400">
              <span>Interstate (KA &rarr; MH)</span>
              <CheckCircle2 className="w-3.5 h-3.5 opacity-80 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Routes 100% Tax to IGST</p>
          </button>

          <button
            onClick={() => processUpload(null, 'mismatch')}
            disabled={isProcessing}
            className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/50 text-left group transition-all"
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-400">
              <span>Tax Mismatch Invoice</span>
              <AlertCircle className="w-3.5 h-3.5 opacity-80 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Flags tax routing error &amp; arithmetic</p>
          </button>
        </div>
      </div>
    </div>
  );
}
