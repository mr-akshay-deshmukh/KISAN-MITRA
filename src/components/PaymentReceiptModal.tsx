import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Truck,
  QrCode,
  FileText,
  CreditCard,
  Banknote,
  Calendar,
  MapPin,
  Clock,
  Landmark,
  Share2
} from 'lucide-react';
import { LanguageCode, OrderContract } from '../types';
import { translations } from '../utils/translations';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: OrderContract | null;
  currentLanguage: LanguageCode;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  contract,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  if (!isOpen || !contract) return null;

  const payment = contract.paymentDetails || {
    method: 'bank_escrow',
    methodLabel: 'Bank Escrow Vault (Agri Nodal Account)',
    transactionRefId: `TXN-${contract.id.replace('CTR-', '')}`,
    utrNumber: `UTR-${Date.now().toString().slice(-10)}`,
    paidAmountINR: contract.totalValueINR,
    paymentTimestamp: `${contract.orderDate} 10:30 AM`,
    paymentStatus: contract.status === 'Delivered & Paid' ? 'Released to Farmer' : 'Escrow Secured',
    escrowBankName: 'ICICI Bank Agri Escrow Nodal',
    invoiceNumber: `TAX-AGRI-${contract.id.replace('CTR-', '')}`,
  };

  const handlePrint = () => {
    window.print();
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'upi_qr':
        return <QrCode className="w-5 h-5 text-emerald-400" />;
      case 'bank_escrow':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'letter_of_credit':
        return <Landmark className="w-5 h-5 text-emerald-400" />;
      case 'rtgs_neft':
        return <CreditCard className="w-5 h-5 text-emerald-400" />;
      case 'buyer_credit_line':
        return <Building2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <Banknote className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#151C18] border border-[#2C3631] rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-[#E5E9E7]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1A221E] border-b border-[#2C3631] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/15 border border-[#C2D66E]/40 text-[#C2D66E] flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-[#C2D66E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#C2D66E] uppercase tracking-widest">
                  Official Trade Settlement Certificate
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{payment.paymentStatus}</span>
                </span>
              </div>
              <h3 className="font-serif italic font-bold text-lg text-white">
                Tax Invoice & Payment Gate Pass
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-[#8E9B94] hover:text-[#C2D66E] hover:bg-[#242C28] transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8E9B94] hover:text-[#C2D66E] hover:bg-[#242C28] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 no-scrollbar bg-[#151C18]">
          {/* Certificate Top Badge */}
          <div className="p-4 rounded-2xl bg-[#1A221E] border border-[#2C3631] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-[#8E9B94] uppercase tracking-wider font-semibold block">
                Invoice & Settlement ID:
              </span>
              <span className="font-mono font-bold text-white text-base">
                {payment.invoiceNumber || `INV-${contract.id}`}
              </span>
              <span className="text-[11px] text-[#8E9B94] block mt-0.5">
                Contract Reference: <strong className="text-[#C2D66E]">{contract.id}</strong>
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] text-[#8E9B94] uppercase tracking-wider font-semibold block">
                Settled Timestamp:
              </span>
              <span className="text-xs text-white font-medium flex sm:justify-end items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C2D66E]" />
                {payment.paymentTimestamp}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                Banking UTR: {payment.utrNumber || '429188201948'}
              </span>
            </div>
          </div>

          {/* Amount Paid Highlight Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#242C28] to-[#1A221E] border border-[#C2D66E]/40 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-[#D4E4BC] uppercase tracking-wider font-bold block">
                Total Settlement Amount
              </span>
              <div className="font-serif font-bold text-2xl sm:text-3xl text-[#C2D66E] mt-1">
                ₹{contract.totalValueINR.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-[#8E9B94] block mt-1">
                Calculated at ₹{contract.agreedPricePerKg}/kg for {contract.quantityTons} Metric Tons ({contract.quantityTons * 1000} kg)
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#C2D66E]/15 border border-[#C2D66E]/40 flex flex-col items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-[#C2D66E]" />
              <span className="text-[8px] font-extrabold text-[#C2D66E] uppercase mt-0.5">100% Safe</span>
            </div>
          </div>

          {/* Payment Method Specification Details */}
          <div className="p-4 rounded-2xl bg-[#1A221E] border border-[#2C3631] space-y-3">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#2C3631]">
              {getMethodIcon(payment.method)}
              <div>
                <span className="text-xs font-bold text-white block">
                  {payment.methodLabel}
                </span>
                <span className="text-[11px] text-[#8E9B94]">
                  Transaction Reference: {payment.transactionRefId}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {payment.upiIdUsed && (
                <div className="p-2.5 bg-[#242C28] rounded-xl">
                  <span className="text-[#8E9B94] text-[10px] block">UPI ID / VPA:</span>
                  <span className="font-mono font-bold text-white text-[11px] truncate block">{payment.upiIdUsed}</span>
                </div>
              )}
              {payment.escrowBankName && (
                <div className="p-2.5 bg-[#242C28] rounded-xl">
                  <span className="text-[#8E9B94] text-[10px] block">Nodal Escrow Bank:</span>
                  <span className="font-bold text-white text-[11px] truncate block">{payment.escrowBankName}</span>
                </div>
              )}
              {payment.lcNumber && (
                <div className="p-2.5 bg-[#242C28] rounded-xl">
                  <span className="text-[#8E9B94] text-[10px] block">LC Number:</span>
                  <span className="font-mono font-bold text-emerald-300 text-[11px] truncate block">{payment.lcNumber}</span>
                </div>
              )}
              {payment.virtualAccountNumber && (
                <div className="p-2.5 bg-[#242C28] rounded-xl">
                  <span className="text-[#8E9B94] text-[10px] block">Virtual Account (VAN):</span>
                  <span className="font-mono font-bold text-emerald-300 text-[11px] truncate block">{payment.virtualAccountNumber}</span>
                </div>
              )}
              {payment.buyerGstNumber && (
                <div className="p-2.5 bg-[#242C28] rounded-xl">
                  <span className="text-[#8E9B94] text-[10px] block">Buyer GSTIN:</span>
                  <span className="font-mono font-bold text-white text-[11px] truncate block">{payment.buyerGstNumber}</span>
                </div>
              )}
              <div className="p-2.5 bg-[#242C28] rounded-xl">
                <span className="text-[#8E9B94] text-[10px] block">Tax Invoice State:</span>
                <span className="font-bold text-emerald-400 text-[11px] block">GST Exempted (Agri Produce)</span>
              </div>
            </div>

            {payment.settlementNote && (
              <p className="text-[11px] text-[#8E9B94] bg-[#242C28] p-2.5 rounded-xl border border-[#2C3631] italic">
                ℹ️ {payment.settlementNote}
              </p>
            )}
          </div>

          {/* Parties & Produce Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Farmer / Seller */}
            <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-[#C2D66E] uppercase tracking-widest block">
                Seller / Farm Gate Beneficiary
              </span>
              <div className="font-serif font-bold text-white text-base">
                {contract.farmerOrFpoName}
              </div>
              <div className="text-xs text-[#8E9B94] space-y-1">
                <div>Quality Grade: <strong className="text-white">{contract.inspectionScore}</strong></div>
                {contract.sellerBankUpi && (
                  <div>Linked Farmer VPA: <strong className="text-[#C2D66E] font-mono">{contract.sellerBankUpi}</strong></div>
                )}
              </div>
            </div>

            {/* Buyer / Offtaker */}
            <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-[#C2D66E] uppercase tracking-widest block">
                Purchasing Corporate Entity
              </span>
              <div className="font-serif font-bold text-white text-base">
                {contract.buyerName}
              </div>
              <div className="text-xs text-[#8E9B94] space-y-1">
                <div>Buyer Segment: <strong className="text-white">{contract.buyerType}</strong></div>
                <div>Destination Hub: <strong className="text-white">{contract.deliveryLocation || 'APMC Central Hub'}</strong></div>
              </div>
            </div>
          </div>

          {/* Cold Chain Logistics & Security Stamp */}
          <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#C2D66E] shrink-0" />
              <div>
                <span className="text-white font-bold block">Assigned Logistics Partner</span>
                <span className="text-[#8E9B94] text-[11px]">{contract.logisticsPartner}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-3 py-1 bg-[#242C28] border border-[#2C3631] text-[#C2D66E] font-mono rounded-full font-bold">
                GATE-PASS-VALIDATED
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#1A221E] border-t border-[#2C3631] flex items-center justify-between">
          <span className="text-[11px] text-[#8E9B94] hidden sm:block">
            Verified by KisanMitra Agri Escrow Protocol (NABARD / RBI Guidelines)
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#242C28] hover:bg-[#2C3631] border border-[#2C3631] text-xs font-bold text-white flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
