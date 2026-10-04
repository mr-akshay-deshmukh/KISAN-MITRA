import React, { useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Download,
  AlertCircle,
  ArrowUpRight,
  QrCode,
  Landmark,
  CreditCard,
  Building2,
  Banknote,
  Receipt,
  FileText,
  DollarSign,
  Lock,
  Unlock,
  Check,
  Trash2,
  RotateCcw,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { LanguageCode, OrderContract, PaymentMethodType } from '../types';
import { translations } from '../utils/translations';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { ContractPaymentSimulatorModal } from './ContractPaymentSimulatorModal';

interface OrdersEscrowViewProps {
  contracts: OrderContract[];
  currentLanguage: LanguageCode;
  onNavigateTab: (tab: string) => void;
  onUpdateContractStatus?: (contractId: string, newStatus: OrderContract['status']) => void;
  onUpdateContract?: (updatedContract: OrderContract) => void;
  onDeleteContract?: (contractId: string) => void;
}

export const OrdersEscrowView: React.FC<OrdersEscrowViewProps> = ({
  contracts,
  currentLanguage,
  onNavigateTab,
  onUpdateContractStatus,
  onUpdateContract,
  onDeleteContract,
}) => {
  const t = translations[currentLanguage];

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedContractForReceipt, setSelectedContractForReceipt] = useState<OrderContract | null>(null);
  const [selectedContractForPayment, setSelectedContractForPayment] = useState<OrderContract | null>(null);
  const [releasedContracts, setReleasedContracts] = useState<Record<string, boolean>>({});

  // Filtered list
  const filteredContracts = contracts.filter((contract) => {
    if (selectedFilter === 'all') return true;
    const method = contract.paymentDetails?.method || 'bank_escrow';
    return method === selectedFilter;
  });

  // Calculate totals
  const totalVolumeINR = contracts.reduce((sum, c) => sum + c.totalValueINR, 0);
  const escrowFundedINR = contracts
    .filter((c) => c.status === 'Escrow Funded' || c.status === 'Dispatched')
    .reduce((sum, c) => sum + c.totalValueINR, 0);
  const upiSettledINR = contracts
    .filter((c) => c.paymentDetails?.method === 'upi_qr')
    .reduce((sum, c) => sum + c.totalValueINR, 0);
  const lcVolumeINR = contracts
    .filter((c) => c.paymentDetails?.method === 'letter_of_credit')
    .reduce((sum, c) => sum + c.totalValueINR, 0);

  const handleReleaseEscrow = (contractId: string) => {
    setReleasedContracts((prev) => ({ ...prev, [contractId]: true }));
    if (onUpdateContractStatus) {
      onUpdateContractStatus(contractId, 'Delivered & Paid');
    }
  };

  const getMethodBadge = (method?: PaymentMethodType) => {
    switch (method) {
      case 'upi_qr':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <QrCode className="w-3 h-3 text-emerald-400" />
            <span>Instant UPI</span>
          </span>
        );
      case 'letter_of_credit':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Landmark className="w-3 h-3 text-emerald-400" />
            <span>Letter of Credit (LC)</span>
          </span>
        );
      case 'rtgs_neft':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <CreditCard className="w-3 h-3 text-emerald-400" />
            <span>RTGS Virtual Account</span>
          </span>
        );
      case 'buyer_credit_line':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Building2 className="w-3 h-3 text-emerald-400" />
            <span>NABARD Credit Line</span>
          </span>
        );
      case 'apmc_cash_voucher':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Banknote className="w-3 h-3 text-emerald-400" />
            <span>e-Rupee Gate Token</span>
          </span>
        );
      default:
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Bank Escrow Vault</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#1A221E] border border-[#2C3631] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#C2D66E]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Agri Escrow & Multi-Option Payments
              </span>
              <span className="bg-[#242C28] text-[#D4E4BC] text-[11px] font-medium px-3 py-1 rounded-full border border-[#2C3631]">
                100% Guaranteed Farmer Payout
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-white tracking-tight">
              {t.orders}
            </h1>

            <p className="text-xs sm:text-sm text-[#8E9B94]">
              Multi-channel payment gateway supporting Instant UPI, Tripartite Bank Escrow (ICICI/SBI), Institutional Letters of Credit (LC), RTGS Virtual Accounts, and NABARD Credit Lines.
            </p>
          </div>

          {/* Quick Escrow Highlights */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            <div className="p-3.5 bg-[#151C18] border border-[#2C3631] rounded-2xl">
              <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block">Total Volume</span>
              <span className="font-serif font-bold text-lg text-white">₹{(totalVolumeINR / 100000).toFixed(2)} L</span>
            </div>
            <div className="p-3.5 bg-[#151C18] border border-[#C2D66E]/40 rounded-2xl">
              <span className="text-[10px] text-[#D4E4BC] uppercase tracking-wider block">Escrow Protected</span>
              <span className="font-serif font-bold text-lg text-[#C2D66E]">₹{(escrowFundedINR / 100000).toFixed(2)} L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Filter Pills & Log Management Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A221E] border border-[#2C3631] p-3 rounded-2xl">
        {/* Payment Method Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[#8E9B94] uppercase tracking-wider shrink-0 mr-1">
            Payment Filter:
          </span>
          {[
            { id: 'all', label: 'All Settlements' },
            { id: 'upi_qr', label: '⚡ Instant UPI' },
            { id: 'bank_escrow', label: '🏦 Bank Escrow' },
            { id: 'letter_of_credit', label: '📜 Letter of Credit (LC)' },
            { id: 'rtgs_neft', label: '💳 RTGS / NEFT' },
            { id: 'buyer_credit_line', label: '🏪 Credit Line' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilter === filter.id
                  ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-md'
                  : 'bg-[#242C28] text-[#8E9B94] hover:text-white border border-[#2C3631]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-[#1A221E] border border-dashed border-[#2C3631] rounded-3xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#242C28] border border-[#2C3631] flex items-center justify-center text-[#8E9B94]">
              <FileCheck className="w-7 h-7 text-[#C2D66E]" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-serif italic font-bold text-lg text-white">No Order Contracts Yet</h3>
              <p className="text-xs text-[#8E9B94]">
                When buyers and farmers agree on a deal or fulfill a procurement requirement, the trade contract and escrow status will appear here.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('marketplace')}
                className="px-4 py-2 rounded-2xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Browse Produce & Demands</span>
              </button>
            </div>
          </div>
        ) : (
          filteredContracts.map((contract) => {
          const isPaid = releasedContracts[contract.id] || contract.status === 'Delivered & Paid';
          const payment = contract.paymentDetails;

          return (
            <div
              key={contract.id}
              className="bg-[#1A221E] border border-[#2C3631] hover:border-[#C2D66E]/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 transition-all"
            >
              {/* Top Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C3631] pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#242C28] border border-[#2C3631] text-[#C2D66E] font-bold flex items-center justify-center text-xs">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif italic font-bold text-lg sm:text-xl text-white">
                        {contract.cropName}
                      </h3>
                      <span className="font-mono text-xs text-[#C2D66E] bg-[#242C28] px-2.5 py-0.5 rounded-full border border-[#2C3631]">
                        {contract.id}
                      </span>
                      {getMethodBadge(payment?.method)}
                    </div>
                    <span className="text-xs text-[#8E9B94] block mt-0.5">
                      Dated: {contract.orderDate} • Delivery: {contract.deliveryLocation || 'Fulfillment Hub'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm ${
                      isPaid
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#C2D66E] text-[#0F1411]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isPaid ? 'Delivered & Paid' : contract.status}
                  </span>
                </div>
              </div>

              {/* Contract Body Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-[#242C28] rounded-2xl border border-[#2C3631]">
                  <span className="text-[#8E9B94] text-[10px] uppercase tracking-wider font-semibold block">Farmer / FPO:</span>
                  <span className="font-serif font-bold text-white text-sm truncate block mt-1">{contract.farmerOrFpoName}</span>
                  {contract.sellerBankUpi && (
                    <span className="text-[10px] text-[#C2D66E] font-mono mt-0.5 block truncate">VPA: {contract.sellerBankUpi}</span>
                  )}
                </div>

                <div className="p-3.5 bg-[#242C28] rounded-2xl border border-[#2C3631]">
                  <span className="text-[#8E9B94] text-[10px] uppercase tracking-wider font-semibold block">Buyer Entity:</span>
                  <span className="font-serif font-bold text-white text-sm truncate block mt-1">{contract.buyerName}</span>
                  <span className="text-[10px] text-[#8E9B94] mt-0.5 block">{contract.buyerType}</span>
                </div>

                <div className="p-3.5 bg-[#242C28] rounded-2xl border border-[#2C3631]">
                  <span className="text-[#8E9B94] text-[10px] uppercase tracking-wider font-semibold block">Quantity & Agreed Rate:</span>
                  <span className="font-serif font-bold text-white text-sm block mt-1">
                    {contract.quantityTons} MT @ ₹{contract.agreedPricePerKg}/kg
                  </span>
                  <span className="text-[10px] text-[#8E9B94] mt-0.5 block">QC: {contract.inspectionScore}</span>
                </div>

                <div className="p-3.5 bg-[#242C28] border border-[#C2D66E]/50 rounded-2xl">
                  <span className="text-[#D4E4BC] text-[10px] uppercase tracking-wider font-semibold block">Total Value Settled:</span>
                  <span className="font-serif font-bold text-[#C2D66E] text-lg block mt-0.5">
                    ₹{contract.totalValueINR.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    {payment?.methodLabel ? payment.methodLabel.slice(0, 22) + '...' : 'Escrow Secured'}
                  </span>
                </div>
              </div>

              {/* Payment Details Pill & Actions Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-[#2C3631]">
                <div className="flex flex-wrap items-center gap-3 text-[#8E9B94]">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#C2D66E]" />
                    <span>Transport: <strong className="text-white font-medium">{contract.logisticsPartner}</strong></span>
                  </div>
                  {payment?.utrNumber && (
                    <div className="font-mono text-[11px] text-[#C2D66E] bg-[#151C18] px-2 py-0.5 rounded-md border border-[#2C3631]">
                      UTR: {payment.utrNumber}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedContractForPayment(contract)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#242C28] hover:bg-[#2C3631] border border-[#C2D66E]/40 text-xs font-bold text-[#C2D66E] flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#C2D66E]" />
                    <span>⚡ QR / Escrow Checkout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedContractForReceipt(contract)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#242C28] hover:bg-[#2C3631] border border-[#2C3631] text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C2D66E]" />
                    <span>View Tax Invoice</span>
                  </button>

                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => handleReleaseEscrow(contract.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Release Escrow to Farmer</span>
                    </button>
                  )}

                  {onDeleteContract && (
                    <button
                      type="button"
                      onClick={() => onDeleteContract(contract.id)}
                      className="p-2 rounded-xl bg-[#242C28] hover:bg-red-500/20 text-[#8E9B94] hover:text-red-400 border border-[#2C3631] hover:border-red-500/30 text-xs transition-all"
                      title="Delete this buyer/seller trade log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* QR Code & Escrow Payment Simulation Modal */}
      <ContractPaymentSimulatorModal
        isOpen={!!selectedContractForPayment}
        onClose={() => setSelectedContractForPayment(null)}
        contract={selectedContractForPayment}
        currentLanguage={currentLanguage}
        onPaymentSuccess={(updatedContract) => {
          if (onUpdateContract) {
            onUpdateContract(updatedContract);
          } else if (onUpdateContractStatus) {
            onUpdateContractStatus(updatedContract.id, updatedContract.status);
          }
          setSelectedContractForPayment(null);
        }}
      />

      {/* Tax Invoice & Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!selectedContractForReceipt}
        onClose={() => setSelectedContractForReceipt(null)}
        contract={selectedContractForReceipt}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};
