import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import path from 'path';
import { analyzeInvoiceBuffer, generateFallbackExtraction } from '../services/geminiService.js';
import { computeTaxSplit } from '../services/gstEngine.js';
import { Invoice } from '../models/Invoice.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF documents are supported.'));
    }
  }
});

/**
 * Helper to construct Mongoose query for user scoping
 */
function getUserQuery(user) {
  if (user && user.id && user.id !== 'demo_user_id' && mongoose.Types.ObjectId.isValid(user.id)) {
    return { userId: user.id };
  }
  return { userId: null };
}

/**
 * POST /api/audit/upload
 * Multimodal document ingestion & automated GST compliance engine pipeline
 */
router.post('/upload', authenticateToken, upload.single('invoice'), async (req, res) => {
  try {
    let rawExtraction;
    let filename = 'invoice_upload.png';

    if (req.file) {
      filename = req.file.originalname;
      rawExtraction = await analyzeInvoiceBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    } else if (req.body && req.body.sampleType) {
      filename = `sample_${req.body.sampleType}.pdf`;
      rawExtraction = generateFallbackExtraction(filename);
    } else {
      return res.status(400).json({ error: 'No invoice file or sample type provided.' });
    }

    // Run GST Compliance & Tax Split Engine
    const auditReport = computeTaxSplit(rawExtraction);

    // Explicit user ID scoping: real user vs demo mode
    const isValidUserId = req.user && req.user.id !== 'demo_user_id' && mongoose.Types.ObjectId.isValid(req.user.id);
    const userIdToSave = isValidUserId ? req.user.id : null;

    // Save audit record to database
    const invoiceRecord = new Invoice({
      userId: userIdToSave,
      originalFilename: filename,
      documentType: rawExtraction.documentType || 'INVOICE',
      originalInvoiceNumber: rawExtraction.originalInvoiceNumber || '',
      originalInvoiceDate: rawExtraction.originalInvoiceDate || '',
      vendorName: rawExtraction.vendorName || 'Unknown Vendor',
      supplierGSTIN: rawExtraction.supplierGSTIN || '',
      recipientGSTIN: rawExtraction.recipientGSTIN || '',
      supplierState: auditReport.supplierState,
      recipientState: auditReport.recipientState,
      isInterstate: auditReport.isInterstate,
      invoiceNumber: rawExtraction.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      date: rawExtraction.date || new Date().toISOString().split('T')[0],
      lineItems: rawExtraction.lineItems || [],
      amounts: auditReport.amounts,
      extractedTaxSplit: auditReport.extractedTaxSplit,
      calculatedTaxSplit: auditReport.calculatedTaxSplit,
      auditStatus: auditReport.auditStatus,
      discrepancies: auditReport.discrepancies
    });

    await invoiceRecord.save();

    return res.status(201).json({
      message: 'Document processed and audited successfully.',
      invoice: invoiceRecord,
      auditReport
    });
  } catch (err) {
    console.error("Audit Upload Error:", err);
    return res.status(500).json({ error: err.message || 'Failed to audit invoice document' });
  }
});

/**
 * GET /api/audit/history
 * Fetch audit logs with strict user scoping
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { status, docType, search, limit = 50 } = req.query;
    const query = getUserQuery(req.user);

    if (status && status !== 'ALL') {
      query.auditStatus = status;
    }

    if (docType && docType !== 'ALL') {
      query.documentType = docType;
    }

    if (search) {
      query.$or = [
        { vendorName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { supplierGSTIN: { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({ count: invoices.length, invoices });
  } catch (err) {
    console.error("History Error:", err);
    return res.status(500).json({ error: 'Failed to retrieve audit history' });
  }
});

/**
 * GET /api/audit/summary
 * GSTR-1 & GSTR-2 Monthly Tax Breakdown & Compliance Metrics (Accounts for Invoices, Debit Notes & Credit Notes)
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const query = getUserQuery(req.user);
    const invoices = await Invoice.find(query);

    let totalSubtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalTaxableGrand = 0;
    let passedCount = 0;
    let flaggedCount = 0;

    let invoiceCount = 0;
    let creditNoteCount = 0;
    let debitNoteCount = 0;

    const hsnSummaryMap = {};
    const vendorSummaryMap = {};

    invoices.forEach(inv => {
      const isCreditNote = inv.documentType === 'CREDIT_NOTE';
      const multiplier = isCreditNote ? -1 : 1;

      if (inv.documentType === 'CREDIT_NOTE') creditNoteCount++;
      else if (inv.documentType === 'DEBIT_NOTE') debitNoteCount++;
      else invoiceCount++;

      totalSubtotal += (inv.amounts?.subtotal || 0) * multiplier;
      totalCgst += (inv.calculatedTaxSplit?.cgst || 0) * multiplier;
      totalSgst += (inv.calculatedTaxSplit?.sgst || 0) * multiplier;
      totalIgst += (inv.calculatedTaxSplit?.igst || 0) * multiplier;
      totalTaxableGrand += (inv.amounts?.grandTotal || 0) * multiplier;

      if (inv.auditStatus === 'PASSED') {
        passedCount++;
      } else {
        flaggedCount++;
      }

      // Vendor summary
      const vName = inv.vendorName || 'Unknown Vendor';
      if (!vendorSummaryMap[vName]) {
        vendorSummaryMap[vName] = { count: 0, totalValue: 0, gstin: inv.supplierGSTIN };
      }
      vendorSummaryMap[vName].count += 1;
      vendorSummaryMap[vName].totalValue += (inv.amounts?.grandTotal || 0) * multiplier;

      // HSN summary
      if (Array.isArray(inv.lineItems)) {
        inv.lineItems.forEach(item => {
          const code = item.hsnSac || 'UNSPECIFIED';
          if (!hsnSummaryMap[code]) {
            hsnSummaryMap[code] = { count: 0, totalAmount: 0 };
          }
          hsnSummaryMap[code].count += (item.qty || 1);
          hsnSummaryMap[code].totalAmount += (item.total || 0) * multiplier;
        });
      }
    });

    const totalInvoices = invoices.length;
    const complianceRate = totalInvoices > 0 
      ? Math.round((passedCount / totalInvoices) * 100) 
      : 100;

    return res.json({
      metrics: {
        totalInvoices,
        invoiceCount,
        creditNoteCount,
        debitNoteCount,
        passedCount,
        flaggedCount,
        complianceRate,
        totalSubtotal,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTaxLiability: totalCgst + totalSgst + totalIgst,
        totalGrandTotal: totalTaxableGrand
      },
      hsnSummary: Object.entries(hsnSummaryMap).map(([hsnCode, data]) => ({
        hsnCode,
        count: data.count,
        totalAmount: data.totalAmount
      })),
      vendorSummary: Object.entries(vendorSummaryMap).map(([vendorName, data]) => ({
        vendorName,
        gstin: data.gstin,
        count: data.count,
        totalValue: data.totalValue
      })).sort((a, b) => b.totalValue - a.totalValue).slice(0, 5)
    });
  } catch (err) {
    console.error("Summary Error:", err);
    return res.status(500).json({ error: 'Failed to calculate GSTR summary' });
  }
});

/**
 * Purges invoices matching active user or unassigned demo records
 */
const clearAllHandler = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.id !== 'demo_user_id' && mongoose.Types.ObjectId.isValid(req.user.id)) {
      query = { $or: [{ userId: req.user.id }, { userId: null }, { userId: { $exists: false } }] };
    }
    const result = await Invoice.deleteMany(query);
    return res.json({ message: 'All invoices cleared successfully.', deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Clear All Error:", err);
    return res.status(500).json({ error: 'Failed to clear invoices.' });
  }
};

router.post('/clear-all', authenticateToken, clearAllHandler);
router.delete('/clear-all', authenticateToken, clearAllHandler);

/**
 * DELETE /api/audit/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid invoice ID format' });
    }
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Invoice record not found' });
    }
    return res.json({ message: 'Audit record deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete audit record' });
  }
});

/**
 * POST /api/audit/seed-demo
 * Seeds demo set including Invoices, Credit Notes, and Debit Notes
 */
router.post('/seed-demo', authenticateToken, async (req, res) => {
  try {
    const isValidUserId = req.user && req.user.id !== 'demo_user_id' && mongoose.Types.ObjectId.isValid(req.user.id);
    const userIdToSave = isValidUserId ? req.user.id : null;
    const sampleFiles = [
      'sample_intrastate.pdf', 
      'sample_interstate.pdf', 
      'sample_mismatch.pdf',
      'sample_credit_note.pdf',
      'sample_debit_note.pdf'
    ];
    const createdRecords = [];

    for (const filename of sampleFiles) {
      const raw = generateFallbackExtraction(filename);
      const audit = computeTaxSplit(raw);

      const record = new Invoice({
        userId: userIdToSave,
        originalFilename: filename,
        documentType: raw.documentType || 'INVOICE',
        originalInvoiceNumber: raw.originalInvoiceNumber || '',
        originalInvoiceDate: raw.originalInvoiceDate || '',
        vendorName: raw.vendorName,
        supplierGSTIN: raw.supplierGSTIN,
        recipientGSTIN: raw.recipientGSTIN,
        supplierState: audit.supplierState,
        recipientState: audit.recipientState,
        isInterstate: audit.isInterstate,
        invoiceNumber: raw.invoiceNumber,
        date: raw.date,
        lineItems: raw.lineItems,
        amounts: audit.amounts,
        extractedTaxSplit: audit.extractedTaxSplit,
        calculatedTaxSplit: audit.calculatedTaxSplit,
        auditStatus: audit.auditStatus,
        discrepancies: audit.discrepancies
      });

      await record.save();
      createdRecords.push(record);
    }

    return res.status(201).json({
      message: 'Demo dataset (Invoices, Credit Notes & Debit Notes) seeded successfully.',
      count: createdRecords.length,
      invoices: createdRecords
    });
  } catch (err) {
    console.error("Seed Demo Error:", err);
    return res.status(500).json({ error: 'Failed to seed demo data' });
  }
});

export default router;
