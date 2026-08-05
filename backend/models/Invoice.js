import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  description: String,
  qty: Number,
  price: Number,
  total: Number,
  hsnSac: String
}, { _id: false });

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    originalFilename: String,
    documentType: {
      type: String,
      enum: ['INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE'],
      default: 'INVOICE'
    },
    originalInvoiceNumber: String,
    originalInvoiceDate: String,
    vendorName: {
      type: String,
      default: 'Unknown Vendor'
    },
    supplierGSTIN: String,
    recipientGSTIN: String,
    supplierState: {
      code: String,
      name: String
    },
    recipientState: {
      code: String,
      name: String
    },
    isInterstate: Boolean,
    invoiceNumber: String,
    date: String,
    lineItems: [lineItemSchema],
    amounts: {
      subtotal: Number,
      totalTax: Number,
      grandTotal: Number,
      expectedGrandTotal: Number
    },
    extractedTaxSplit: {
      cgst: Number,
      sgst: Number,
      igst: Number,
      total: Number
    },
    calculatedTaxSplit: {
      cgst: Number,
      sgst: Number,
      igst: Number,
      total: Number
    },
    auditStatus: {
      type: String,
      enum: ['PASSED', 'FLAGGED_MISMATCH'],
      default: 'PASSED'
    },
    discrepancies: [String],
    fileUrl: String
  },
  { timestamps: true }
);

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
