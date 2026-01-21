-- ═══════════════════════════════════════════════════════════════════════════════
-- UPDATE EXISTING INVOICES WITH MISSING FIELDS
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Update all captured invoices that are missing invoice_pdf_url and invoice_pdf_generated_at
UPDATE public.user_invoices
SET 
    invoice_pdf_url = '/api/razorpay/invoice/' || razorpay_order_id || '/pdf',
    invoice_pdf_generated_at = COALESCE(paid_at, created_at)
WHERE 
    status = 'captured'
    AND (invoice_pdf_url IS NULL OR invoice_pdf_generated_at IS NULL);

-- Also update pending invoices with a placeholder (they'll get proper values when captured)
UPDATE public.user_invoices
SET 
    invoice_pdf_generated_at = created_at
WHERE 
    status = 'pending'
    AND invoice_pdf_generated_at IS NULL;

-- Verify the update worked
SELECT 
    id,
    invoice_number,
    status,
    razorpay_order_id,
    invoice_pdf_url,
    invoice_pdf_generated_at,
    paid_at
FROM public.user_invoices
ORDER BY created_at DESC
LIMIT 10;
