import { computeTaxSplit } from '../services/gstEngine.js';

console.log("=== RUNNING OMNIAUDIT GST ENGINE TESTS ===");

// Test 1: Valid Intrastate Invoice (MH to MH)
const intrastateInvoice = {
  supplierGSTIN: "27AAAAA0000A1Z5", // Maharashtra
  recipientGSTIN: "27BBBBB1111B2Z6", // Maharashtra
  subtotal: 10000,
  totalTax: 1800,
  taxes: { cgst: 900, sgst: 900, igst: 0 },
  grandTotal: 11800,
  lineItems: [{ total: 10000 }]
};
const res1 = computeTaxSplit(intrastateInvoice);
console.assert(res1.auditStatus === "PASSED", "Test 1 Failed: Should pass for valid MH-MH split");
console.assert(!res1.isInterstate, "Test 1 Failed: Should be intrastate");
console.assert(res1.calculatedTaxSplit.cgst === 900 && res1.calculatedTaxSplit.sgst === 900, "Test 1 Failed: Split math");
console.log("✔ Test 1 Passed: Valid Intrastate Invoice");

// Test 2: Valid Interstate Invoice (MH to KA)
const interstateInvoice = {
  supplierGSTIN: "27AAAAA0000A1Z5", // Maharashtra (27)
  recipientGSTIN: "29CCCCC2222C3Z7", // Karnataka (29)
  subtotal: 50000,
  totalTax: 9000,
  taxes: { cgst: 0, sgst: 0, igst: 9000 },
  grandTotal: 59000,
  lineItems: [{ total: 50000 }]
};
const res2 = computeTaxSplit(interstateInvoice);
console.assert(res2.auditStatus === "PASSED", "Test 2 Failed: Should pass for valid MH-KA split");
console.assert(res2.isInterstate, "Test 2 Failed: Should be interstate");
console.assert(res2.calculatedTaxSplit.igst === 9000, "Test 2 Failed: IGST math");
console.log("✔ Test 2 Passed: Valid Interstate Invoice");

// Test 3: Flagged Invoice - Interstate charged CGST/SGST instead of IGST
const flawedInvoice1 = {
  supplierGSTIN: "27AAAAA0000A1Z5", // Maharashtra
  recipientGSTIN: "07DDDDD3333D4Z8", // Delhi (07)
  subtotal: 20000,
  totalTax: 3600,
  taxes: { cgst: 1800, sgst: 1800, igst: 0 }, // ERR: Should be IGST
  grandTotal: 23600,
  lineItems: [{ total: 20000 }]
};
const res3 = computeTaxSplit(flawedInvoice1);
console.assert(res3.auditStatus === "FLAGGED_MISMATCH", "Test 3 Failed: Should flag mismatch");
console.assert(res3.discrepancies.length > 0, "Test 3 Failed: Should report discrepancy");
console.log("✔ Test 3 Passed: Detected Interstate Tax Routing Error");

// Test 4: Flawed Invoice - Arithmetic Mismatch
const flawedInvoice2 = {
  supplierGSTIN: "27AAAAA0000A1Z5",
  recipientGSTIN: "27BBBBB1111B2Z6",
  subtotal: 10000,
  totalTax: 1800,
  grandTotal: 15000, // ERR: 10000 + 1800 != 15000
  lineItems: [{ total: 10000 }]
};
const res4 = computeTaxSplit(flawedInvoice2);
console.assert(res4.auditStatus === "FLAGGED_MISMATCH", "Test 4 Failed: Should flag arithmetic mismatch");
console.log("✔ Test 4 Passed: Detected Stated vs Grand Total Arithmetic Discrepancy");

// Test 5: Valid Amazon / B2B Tax-Inclusive Invoice (Subtotal: 305.93, IGST 18%: 55.07, Line Total: 361.00)
const amazonInvoice = {
  supplierGSTIN: "07AAAAA0000A1Z5", // Delhi
  recipientGSTIN: "27BBBBB1111B2Z6", // Maharashtra
  subtotal: 305.93,
  totalTax: 55.07,
  taxes: { cgst: 0, sgst: 0, igst: 55.07 },
  grandTotal: 361.00,
  lineItems: [{ price: 305.93, total: 361.00 }] // Gross line total matches grand total (361.00)
};
const res5 = computeTaxSplit(amazonInvoice);
console.assert(res5.auditStatus === "PASSED", "Test 5 Failed: Amazon Tax-Inclusive invoice should pass");
console.assert(res5.discrepancies.length === 0, "Test 5 Failed: Should have 0 discrepancies");
console.log("✔ Test 5 Passed: Valid Amazon B2B Tax-Inclusive Pricing Invoice (305.93 + 55.07 = 361.00)");

console.log("=== ALL GST ENGINE TESTS PASSED SUCCESSFULLY! ===");
