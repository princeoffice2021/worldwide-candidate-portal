import React, { useState, useEffect } from 'react';
import { api } from '../lib/apiClient';
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  FileText, 
  Calendar, 
  CreditCard, 
  Download,
  ShieldCheck,
  Globe2
} from 'lucide-react';

interface InvoiceViewProps {
  invoiceId: string;
  onNavigate: (view: string, slug?: string) => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ invoiceId, onNavigate }) => {
  const [data, setData] = useState<{ invoice: any; payment: any } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const id = invoiceId || new URLSearchParams(window.location.search).get('id') || '';
        if (!id) {
          setError('Invoice identifier not provided.');
          return;
        }
        const res = await api.getInvoice(id);
        if (res && res.invoice) {
          setData(res);
        } else {
          setError('Invoice not found or access restricted.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Generating invoice document...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Invoice Unavailable</h2>
          <p className="text-xs text-slate-600">{error || 'Could not find requested invoice.'}</p>
          <button
            onClick={() => onNavigate('employer-dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            Go to Employer Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { invoice, payment } = data;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Action Bar (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <button
            onClick={() => onNavigate('employer-dashboard')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Employer Dashboard</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>

        {/* INVOICE PAPER CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  CP
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">Candidate Portal</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Worldwide Candidate & Recruitment Network Ltd.</p>
              <p className="text-[11px] text-slate-400">Tax Registration ID: EU-VAT-982173491</p>
              <p className="text-[11px] text-slate-400">100 Enterprise Way, Suite 800, Wilmington, DE, USA</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{invoice.payment_status || 'PAID'}</span>
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{invoice.invoice_number}</h1>
              <p className="text-xs text-slate-500">
                Date Issued: <span className="font-semibold text-slate-700">{new Date(invoice.issued_at || invoice.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
              {payment?.payment_reference && (
                <p className="text-[11px] font-mono text-slate-400">Ref: {payment.payment_reference}</p>
              )}
            </div>
          </div>

          {/* Billed To & Payment Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-2">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Billed To (Employer)</span>
              <h3 className="text-sm font-bold text-slate-900">{invoice.company_name}</h3>
              <p className="text-xs text-slate-700 font-medium">Attn: {invoice.billing_name}</p>
              {invoice.billing_email && <p className="text-xs text-slate-500">{invoice.billing_email}</p>}
              {invoice.billing_phone && <p className="text-xs text-slate-500">{invoice.billing_phone}</p>}
              {invoice.billing_address && <p className="text-xs text-slate-500">{invoice.billing_address}</p>}
              {invoice.tax_id && <p className="text-xs text-slate-600 font-mono mt-1">Tax ID: {invoice.tax_id}</p>}
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Payment Information</span>
              <p className="text-xs text-slate-800 font-bold flex items-center sm:justify-end space-x-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span className="capitalize">{payment?.provider || 'Secure Electronic Payment'}</span>
              </p>
              <p className="text-xs text-slate-500">
                Billing Cycle: <span className="capitalize font-semibold text-slate-700">{invoice.billing_interval || 'Monthly'}</span>
              </p>
              <p className="text-xs text-slate-500">
                Payment Status: <span className="text-emerald-700 font-bold">Successfully Captured</span>
              </p>
              {payment?.paid_at && (
                <p className="text-[11px] text-slate-400">
                  Paid on {new Date(payment.paid_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-2">Description & Entitlements</th>
                  <th className="py-3 px-2 text-center">Billing Cycle</th>
                  <th className="py-3 px-2 text-right">Qty</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.line_items && invoice.line_items.length > 0 ? (
                  invoice.line_items.map((item: any, idx: number) => (
                    <tr key={idx} className="text-slate-800">
                      <td className="py-4 px-2">
                        <p className="font-extrabold text-slate-900 text-sm">{item.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Direct phone candidate unlocks & verified resume access included
                        </p>
                      </td>
                      <td className="py-4 px-2 text-center capitalize text-slate-600">
                        {invoice.billing_interval}
                      </td>
                      <td className="py-4 px-2 text-right font-medium text-slate-600">
                        {item.quantity || 1}
                      </td>
                      <td className="py-4 px-2 text-right font-bold text-slate-900">
                        ${item.total_amount || item.unit_amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-slate-800">
                    <td className="py-4 px-2">
                      <p className="font-extrabold text-slate-900 text-sm">{invoice.plan_name_snapshot}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Direct phone candidate unlocks & verified resume access included
                      </p>
                    </td>
                    <td className="py-4 px-2 text-center capitalize text-slate-600">
                      {invoice.billing_interval}
                    </td>
                    <td className="py-4 px-2 text-right font-medium text-slate-600">1</td>
                    <td className="py-4 px-2 text-right font-bold text-slate-900">
                      ${invoice.subtotal}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-slate-200 pt-6 flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">${invoice.subtotal}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied:</span>
                  <span className="font-semibold">-${invoice.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Standard Tax (18%):</span>
                <span className="font-semibold text-slate-800">${invoice.tax_amount}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-base border-t border-slate-200 pt-3">
                <span>Total Paid:</span>
                <span className="text-blue-600">${invoice.total_amount} {invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Footer & Assurance */}
          <div className="border-t border-slate-100 pt-6 text-center text-slate-500 space-y-2">
            <p className="text-xs font-semibold text-slate-700">
              Thank you for trusting Candidate Portal for your worldwide recruitment needs.
            </p>
            <p className="text-[10px] text-slate-400 max-w-xl mx-auto">
              This invoice serves as an official electronic receipt. For billing inquiries or corporate custom invoice consolidation, contact billing@candidateportal.com.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
