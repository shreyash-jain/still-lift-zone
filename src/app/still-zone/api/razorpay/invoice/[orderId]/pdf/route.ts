/**
 * Invoice PDF Generation API
 * GET /api/razorpay/invoice/[orderId]/pdf
 * 
 * Generates and returns a professional light-themed PDF invoice
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { getSupabaseAdmin } from '@/lib/razorpay/supabase-admin';
import fs from 'fs';
import path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface InvoiceData {
    invoice_number: string;
    amount: number;
    currency: string;
    tax_amount: number;
    total_amount: number;
    status: string;
    payment_method: string | null;
    razorpay_order_id: string;
    razorpay_payment_id: string | null;
    billing_name: string | null;
    billing_email: string | null;
    paid_at: string | null;
    created_at: string;
    plan_name?: string;
    plan_description?: string;
    duration_type?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function formatCurrency(amount: number, currency: string): string {
    const value = amount / 100;
    if (currency === 'INR') {
        return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

// Load logo as base64
function getLogoBase64(): string | null {
    try {
        const pngLogoPath = path.join(process.cwd(), 'public', 'Logo-stilllift-new.png');
        if (fs.existsSync(pngLogoPath)) {
            const logoBuffer = fs.readFileSync(pngLogoPath);
            return `data:image/png;base64,${logoBuffer.toString('base64')}`;
        }
        return null;
    } catch (error) {
        console.warn('Could not load logo:', error);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Professional Light Theme PDF Generation
// ═══════════════════════════════════════════════════════════════════════════════

function generateInvoicePDF(invoice: InvoiceData, logoBase64: string | null): jsPDF {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // ═══════════════════════════════════════════════════════════════════════════
    // Professional Color Palette (Light Theme)
    // ═══════════════════════════════════════════════════════════════════════════
    const colors = {
        primary: [13, 148, 136] as [number, number, number],        // Teal-500
        primaryDark: [15, 118, 110] as [number, number, number],    // Teal-600
        secondary: [71, 85, 105] as [number, number, number],       // Slate-500
        text: [15, 23, 42] as [number, number, number],             // Slate-900
        textLight: [71, 85, 105] as [number, number, number],       // Slate-500
        textMuted: [148, 163, 184] as [number, number, number],     // Slate-400
        border: [226, 232, 240] as [number, number, number],        // Slate-200
        background: [248, 250, 252] as [number, number, number],    // Slate-50
        white: [255, 255, 255] as [number, number, number],
        success: [34, 197, 94] as [number, number, number],         // Green-500
        successBg: [220, 252, 231] as [number, number, number],     // Green-100
        pending: [234, 179, 8] as [number, number, number],         // Yellow-500
        pendingBg: [254, 249, 195] as [number, number, number],     // Yellow-100
    };

    let y = margin;

    // ═══════════════════════════════════════════════════════════════════════════
    // Header Section - Clean & Professional
    // ═══════════════════════════════════════════════════════════════════════════

    // Logo
    const logoSize = 18;
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, 'PNG', margin, y, logoSize, logoSize);
        } catch {
            // Fallback: draw a simple circle
            doc.setFillColor(...colors.primary);
            doc.circle(margin + logoSize / 2, y + logoSize / 2, logoSize / 2, 'F');
        }
    }

    // Company Name
    doc.setTextColor(...colors.text);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Still Zone', margin + logoSize + 6, y + 8);

    // Tagline
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textLight);
    doc.text('Meditation & Mindfulness', margin + logoSize + 6, y + 14);

    // Invoice Label (Right Side)
    doc.setTextColor(...colors.primary);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, y + 8, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textLight);
    doc.text(invoice.invoice_number, pageWidth - margin, y + 16, { align: 'right' });

    y += 35;

    // Separator Line
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 15;

    // ═══════════════════════════════════════════════════════════════════════════
    // Invoice Details - Two Column Layout
    // ═══════════════════════════════════════════════════════════════════════════

    const colWidth = contentWidth / 2 - 10;

    // Left Column - Company Info
    doc.setTextColor(...colors.textMuted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM', margin, y);

    y += 5;
    doc.setTextColor(...colors.text);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Still Zone Wellness', margin, y);

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textLight);
    doc.text('Premium Meditation & Mindfulness', margin, y);
    y += 4;
    doc.text('support@stillzone.app', margin, y);
    y += 4;
    doc.text('www.stillzone.app', margin, y);

    // Right Column - Bill To
    const rightColX = margin + colWidth + 20;
    let rightY = y - 18;

    doc.setTextColor(...colors.textMuted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', rightColX, rightY);

    rightY += 5;
    doc.setTextColor(...colors.text);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.billing_name || 'Valued Customer', rightColX, rightY);

    rightY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textLight);
    if (invoice.billing_email) {
        doc.text(invoice.billing_email, rightColX, rightY);
    }

    y += 20;

    // ═══════════════════════════════════════════════════════════════════════════
    // Invoice Meta Cards - Date, Status, Payment ID
    // ═══════════════════════════════════════════════════════════════════════════

    const cardWidth = (contentWidth - 20) / 3;
    const cardHeight = 22;
    const cardY = y;

    // Date Card
    doc.setFillColor(...colors.background);
    doc.roundedRect(margin, cardY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cardY, cardWidth, cardHeight, 3, 3, 'D');

    doc.setTextColor(...colors.textMuted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DATE', margin + cardWidth / 2, cardY + 7, { align: 'center' });

    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(invoice.paid_at || invoice.created_at), margin + cardWidth / 2, cardY + 16, { align: 'center' });

    // Status Card
    const statusX = margin + cardWidth + 10;
    const isPaid = invoice.status === 'captured';
    const statusBgColor = isPaid ? colors.successBg : colors.pendingBg;
    const statusTextColor = isPaid ? colors.success : colors.pending;

    doc.setFillColor(...statusBgColor);
    doc.roundedRect(statusX, cardY, cardWidth, cardHeight, 3, 3, 'F');

    doc.setTextColor(...statusTextColor);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS', statusX + cardWidth / 2, cardY + 7, { align: 'center' });

    doc.setFontSize(11);
    doc.text(isPaid ? 'PAID' : invoice.status.toUpperCase(), statusX + cardWidth / 2, cardY + 16, { align: 'center' });

    // Payment ID Card
    const paymentX = statusX + cardWidth + 10;
    doc.setFillColor(...colors.background);
    doc.roundedRect(paymentX, cardY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setDrawColor(...colors.border);
    doc.roundedRect(paymentX, cardY, cardWidth, cardHeight, 3, 3, 'D');

    doc.setTextColor(...colors.textMuted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT REF', paymentX + cardWidth / 2, cardY + 7, { align: 'center' });

    doc.setTextColor(...colors.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const paymentId = invoice.razorpay_payment_id || 'Pending';
    const shortPaymentId = paymentId.length > 16 ? paymentId.slice(-12) : paymentId;
    doc.text(shortPaymentId, paymentX + cardWidth / 2, cardY + 16, { align: 'center' });

    y = cardY + cardHeight + 20;

    // ═══════════════════════════════════════════════════════════════════════════
    // Items Table - Clean Professional Design
    // ═══════════════════════════════════════════════════════════════════════════

    // Table Header
    doc.setFillColor(...colors.background);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    doc.line(margin, y + 10, pageWidth - margin, y + 10);

    doc.setTextColor(...colors.textLight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', margin + 5, y + 7);
    doc.text('QTY', pageWidth - margin - 50, y + 7, { align: 'center' });
    doc.text('AMOUNT', pageWidth - margin - 5, y + 7, { align: 'right' });

    y += 14;

    // Table Row
    const planName = invoice.plan_name || 'Subscription Plan';
    const planDesc = invoice.plan_description || '';

    doc.setTextColor(...colors.text);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(planName, margin + 5, y + 5);

    if (planDesc) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...colors.textLight);
        const truncatedDesc = planDesc.length > 55 ? planDesc.substring(0, 55) + '...' : planDesc;
        doc.text(truncatedDesc, margin + 5, y + 11);
    }

    if (invoice.duration_type) {
        doc.setFontSize(8);
        doc.setTextColor(...colors.primary);
        doc.text(`${invoice.duration_type.charAt(0).toUpperCase() + invoice.duration_type.slice(1)} Plan`, margin + 5, y + 17);
    }

    // Quantity
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('1', pageWidth - margin - 50, y + 10, { align: 'center' });

    // Amount
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(invoice.amount, invoice.currency), pageWidth - margin - 5, y + 10, { align: 'right' });

    y += 25;

    // Bottom border of item row
    doc.setDrawColor(...colors.border);
    doc.line(margin, y, pageWidth - margin, y);

    y += 5;

    // Order ID (small text)
    doc.setFontSize(7);
    doc.setTextColor(...colors.textMuted);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order: ${invoice.razorpay_order_id}`, margin + 5, y);

    y += 15;

    // ═══════════════════════════════════════════════════════════════════════════
    // Totals Section - Right Aligned
    // ═══════════════════════════════════════════════════════════════════════════

    const totalsWidth = 85;
    const totalsX = pageWidth - margin - totalsWidth;
    const labelWidth = 45;

    // Subtotal Row
    doc.setTextColor(...colors.textLight);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal', totalsX, y + 5);
    doc.setTextColor(...colors.text);
    doc.text(formatCurrency(invoice.amount, invoice.currency), pageWidth - margin - 5, y + 5, { align: 'right' });

    y += 8;

    // Tax Row
    doc.setTextColor(...colors.textLight);
    doc.text('Tax (GST)', totalsX, y + 5);
    doc.setTextColor(...colors.text);
    doc.text(formatCurrency(invoice.tax_amount, invoice.currency), pageWidth - margin - 5, y + 5, { align: 'right' });

    y += 10;

    // Divider
    doc.setDrawColor(...colors.border);
    doc.line(totalsX, y, pageWidth - margin, y);

    y += 3;

    // Total Row
    doc.setFillColor(...colors.primary);
    doc.roundedRect(totalsX, y, totalsWidth, 14, 2, 2, 'F');

    doc.setTextColor(...colors.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', totalsX + 8, y + 9);
    doc.setFontSize(12);
    doc.text(formatCurrency(invoice.total_amount, invoice.currency), pageWidth - margin - 8, y + 9, { align: 'right' });

    // ═══════════════════════════════════════════════════════════════════════════
    // Footer - Clean & Minimal
    // ═══════════════════════════════════════════════════════════════════════════

    const footerY = pageHeight - 30;

    // Separator
    doc.setDrawColor(...colors.border);
    doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

    // Thank you message
    doc.setTextColor(...colors.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for your purchase!', pageWidth / 2, footerY, { align: 'center' });

    // Footer notes
    doc.setTextColor(...colors.textMuted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, footerY + 6, { align: 'center' });
    doc.text('Questions? Contact support@stillzone.app', pageWidth / 2, footerY + 12, { align: 'center' });

    return doc;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET Handler
// ═══════════════════════════════════════════════════════════════════════════════

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Fetch invoice with plan details
        const { data: invoice, error } = await supabase
            .from('user_invoices')
            .select(`
                *,
                payment_plans (
                    plan_name,
                    description,
                    duration_type
                )
            `)
            .eq('razorpay_order_id', orderId)
            .single();

        if (error || !invoice) {
            console.error('Invoice fetch error:', error);
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Prepare invoice data
        const invoiceData: InvoiceData = {
            invoice_number: invoice.invoice_number,
            amount: invoice.amount,
            currency: invoice.currency,
            tax_amount: invoice.tax_amount || 0,
            total_amount: invoice.total_amount,
            status: invoice.status,
            payment_method: invoice.payment_method,
            razorpay_order_id: invoice.razorpay_order_id,
            razorpay_payment_id: invoice.razorpay_payment_id,
            billing_name: invoice.billing_name,
            billing_email: invoice.billing_email,
            paid_at: invoice.paid_at,
            created_at: invoice.created_at,
            plan_name: invoice.payment_plans?.plan_name,
            plan_description: invoice.payment_plans?.description,
            duration_type: invoice.payment_plans?.duration_type,
        };

        // Load logo and generate PDF
        const logoBase64 = getLogoBase64();
        const doc = generateInvoicePDF(invoiceData, logoBase64);
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        // Return PDF response
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate invoice PDF' },
            { status: 500 }
        );
    }
}
