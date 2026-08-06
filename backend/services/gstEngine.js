/**
 * OmniAudit AI - Automated GST Compliance & Tax Split Engine
 * 
 * Rules:
 * 1. Supplier GSTIN & Recipient GSTIN first 2 digits represent the State Code.
 * 2. Same state code => Intrastate transaction => Tax split 50% CGST + 50% SGST (IGST = 0).
 * 3. Different state code => Interstate transaction => 100% IGST (CGST = 0, SGST = 0).
 * 4. Programmatic arithmetic validation:
 *    - Subtotal + Total Tax == Grand Total (within ±1.50 rounding margin).
 *    - Sum of line item totals == Subtotal OR Stated Gross Total (Amazon / B2B Tax-Inclusive vs Exclusive Pricing).
 */

// State code dictionary for human-readable state names
export const GST_STATE_CODES = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
  "38": "Ladakh",
  "97": "Other Territory"
};

/**
 * Extracts and validates 2-digit GST state code from GSTIN
 */
export function extractStateCode(gstin) {
  if (!gstin || typeof gstin !== "string") return null;
  const cleaned = gstin.trim().toUpperCase();
  const match = cleaned.match(/^([0-9]{2})/);
  return match ? match[1] : null;
}

/**
 * Helper to safely round numeric values to 2 decimal places
 */
export function round(val) {
  return Math.round((Number(val) || 0) * 100) / 100;
}

/**
 * Core GST Compliance Audit Logic
 * @param {Object} invoiceData Extracted raw invoice metrics
 * @returns {Object} Full audit report with status, state information, calculated tax split, and discrepancy alerts.
 */
export function computeTaxSplit(invoiceData) {
  const discrepancies = [];

  const supplierGstin = (invoiceData.supplierGSTIN || "").trim().toUpperCase();
  const recipientGstin = (invoiceData.recipientGSTIN || "").trim().toUpperCase();

  const supplierStateCode = extractStateCode(supplierGstin);
  const recipientStateCode = extractStateCode(recipientGstin);

  const supplierStateName = GST_STATE_CODES[supplierStateCode] || "Unknown State";
  const recipientStateName = GST_STATE_CODES[recipientStateCode] || "Unknown State";

  const isInterstate = Boolean(
    supplierStateCode &&
    recipientStateCode &&
    supplierStateCode !== recipientStateCode
  );

  let subtotal = round(invoiceData.subtotal);
  const extractedTaxAmount = round(invoiceData.totalTax || invoiceData.taxes?.total || 0);
  const grandTotal = round(invoiceData.grandTotal);

  // Extracted individual tax amounts if present
  const extractedCgst = round(invoiceData.taxes?.cgst || invoiceData.cgst || 0);
  const extractedSgst = round(invoiceData.taxes?.sgst || invoiceData.sgst || 0);
  const extractedIgst = round(invoiceData.taxes?.igst || invoiceData.igst || 0);

  // Determine expected total tax
  let totalTaxAmount = extractedTaxAmount;
  if (!totalTaxAmount && (extractedCgst || extractedSgst || extractedIgst)) {
    totalTaxAmount = round(extractedCgst + extractedSgst + extractedIgst);
  }

  // AUTOMATIC AMAZON / E-COMMERCE SUBTOTAL NORMALIZATION:
  // If subtotal is missing (0) OR subtotal was mis-extracted as equal to grandTotal (while tax > 0),
  // calculate true net subtotal = grandTotal - totalTaxAmount (e.g. 361.00 - 55.07 = 305.93)
  if (grandTotal > 0 && totalTaxAmount > 0) {
    if (subtotal === 0 || Math.abs(subtotal - grandTotal) <= 1.5) {
      subtotal = round(grandTotal - totalTaxAmount);
    }
  }

  // Calculate expected tax split based on GST Law
  let expectedCgst = 0;
  let expectedSgst = 0;
  let expectedIgst = 0;

  if (isInterstate) {
    // Interstate => 100% IGST
    expectedIgst = totalTaxAmount;
    expectedCgst = 0;
    expectedSgst = 0;
  } else {
    // Intrastate => 50% CGST + 50% SGST
    expectedCgst = round(totalTaxAmount / 2);
    expectedSgst = round(totalTaxAmount / 2);
    expectedIgst = 0;
  }

  // -------------------------------------------------------------
  // RULE VERIFICATIONS & DISCREPANCY CHECKS
  // -------------------------------------------------------------

  // 1. GSTIN Validation
  if (!supplierStateCode) {
    discrepancies.push(`Supplier GSTIN (${supplierGstin || "N/A"}) is missing or has an invalid 2-digit state code prefix.`);
  }
  if (!recipientStateCode) {
    discrepancies.push(`Recipient GSTIN (${recipientGstin || "N/A"}) is missing or has an invalid 2-digit state code prefix.`);
  }

  // 2. Tax Split Verification
  if (isInterstate) {
    if (extractedCgst > 0 || extractedSgst > 0) {
      discrepancies.push(
        `Interstate transaction (${supplierStateName} -> ${recipientStateName}): Charged CGST (₹${extractedCgst}) / SGST (₹${extractedSgst}) instead of IGST.`
      );
    }
  } else if (supplierStateCode && recipientStateCode && !isInterstate) {
    if (extractedIgst > 0) {
      discrepancies.push(
        `Intrastate transaction (${supplierStateName}): Charged IGST (₹${extractedIgst}) instead of split CGST & SGST.`
      );
    }
  }

  // 3. Line Items Sum Check (Handles both Net Subtotal and Amazon Gross Tax-Inclusive line item pricing)
  if (Array.isArray(invoiceData.lineItems) && invoiceData.lineItems.length > 0) {
    const lineItemSum = round(
      invoiceData.lineItems.reduce((acc, item) => acc + (Number(item.total) || 0), 0)
    );

    const matchesSubtotal = Math.abs(lineItemSum - subtotal) <= 1.5;
    const matchesGrandTotal = grandTotal > 0 && Math.abs(lineItemSum - grandTotal) <= 1.5;
    const matchesExpectedGrand = Math.abs(lineItemSum - (subtotal + totalTaxAmount)) <= 1.5;

    if (subtotal > 0 && !matchesSubtotal && !matchesGrandTotal && !matchesExpectedGrand) {
      discrepancies.push(
        `Arithmetic discrepancy: Sum of line items (₹${lineItemSum.toFixed(2)}) does not match invoice subtotal (₹${subtotal.toFixed(2)}) or Gross Total (₹${grandTotal.toFixed(2)}).`
      );
    }
  }

  // 4. Subtotal + Tax = Grand Total Check
  const expectedGrandTotal = round(subtotal + totalTaxAmount);
  if (subtotal > 0 && grandTotal > 0 && Math.abs(expectedGrandTotal - grandTotal) > 1.5) {
    discrepancies.push(
      `Calculation error: Subtotal (₹${subtotal.toFixed(2)}) + Tax (₹${totalTaxAmount.toFixed(2)}) = ₹${expectedGrandTotal.toFixed(2)}, which differs from stated Grand Total (₹${grandTotal.toFixed(2)}).`
    );
  }

  const auditStatus = discrepancies.length === 0 ? "PASSED" : "FLAGGED_MISMATCH";

  return {
    auditStatus,
    isInterstate,
    supplierState: {
      code: supplierStateCode,
      name: supplierStateName,
      gstin: supplierGstin
    },
    recipientState: {
      code: recipientStateCode,
      name: recipientStateName,
      gstin: recipientGstin
    },
    extractedTaxSplit: {
      cgst: extractedCgst,
      sgst: extractedSgst,
      igst: extractedIgst,
      total: totalTaxAmount
    },
    calculatedTaxSplit: {
      cgst: expectedCgst,
      sgst: expectedSgst,
      igst: expectedIgst,
      total: totalTaxAmount
    },
    amounts: {
      subtotal,
      totalTax: totalTaxAmount,
      grandTotal,
      expectedGrandTotal
    },
    discrepancies
  };
}
