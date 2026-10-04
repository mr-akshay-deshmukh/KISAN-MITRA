import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Truck,
  AlertCircle,
  Sparkles,
  Building2,
  QrCode,
  Landmark,
  CreditCard,
  Banknote,
  Copy,
  Check,
  ArrowRight,
  Clock,
  Lock,
  FileCheck,
  Smartphone,
  ChevronRight,
  Info,
  DollarSign
} from 'lucide-react';
import { LanguageCode, ProduceListing, OrderContract, PaymentMethodType, PaymentDetails } from '../types';
import { translations } from '../utils/translations';

interface BuyerBiddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ProduceListing | null;
  currentLanguage: LanguageCode;
  onOrderCreated: (contract: OrderContract) => void;
}

export const BuyerBiddingModal: React.FC<BuyerBiddingModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentLanguage,
  onOrderCreated,
}) => {
  const t = translations[currentLanguage];

  // Wizard Steps: 1: 'configure', 2: 'payment_select', 3: 'processing', 4: 'success'
  const [currentStep, setCurrentStep] = useState<'configure' | 'payment_select' | 'processing' | 'success'>('configure');

  // Trade configuration
  const [orderType, setOrderType] = useState<'bid' | 'direct_buy'>('direct_buy');
  const [offeredPricePerKg, setOfferedPricePerKg] = useState<number>(listing?.expectedPricePerKg || 140);
  const [quantityTons, setQuantityTons] = useState<number>(listing?.availableQtyTons || 2.5);
  const [buyerCompanyName, setBuyerCompanyName] = useState('BigBasket / More Retail Procurement Partner');
  const [buyerType, setBuyerType] = useState('Supermarket Chain');
  const [deliveryLocation, setDeliveryLocation] = useState('Navi Mumbai APMC Fulfillment Center');
  const [needReeferTruck, setNeedReeferTruck] = useState(true);
  const [buyerGstNumber, setBuyerGstNumber] = useState('27AABCU9603R1ZM');

  // Payment configuration
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('bank_escrow');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'etospay' | 'cred'>('gpay');
  const [buyerUpiId, setBuyerUpiId] = useState('procure.retail@okhdfcbank');
  const [escrowBank, setEscrowBank] = useState('ICICI Bank Agri Nodal Escrow');
  const [escrowDepositMode, setEscrowDepositMode] = useState<'100_percent' | 'advance_20'>('100_percent');
  const [lcTenure, setLcTenure] = useState<number>(60);
  const [lcBank, setLcBank] = useState('State Bank of India (Overseas Commercial Branch)');
  const [rtgsUtrInput, setRtgsUtrInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(299);
  const [createdContractResult, setCreatedContractResult] = useState<OrderContract | null>(null);

  // Sync state if listing changes
  useEffect(() => {
    if (listing) {
      setOfferedPricePerKg(listing.expectedPricePerKg);
      setQuantityTons(Math.min(listing.availableQtyTons, 3.0));
      setCurrentStep('configure');
      setTimerSeconds(299);
      setCreatedContractResult(null);
    }
  }, [listing]);

  // Countdown timer for UPI QR
  useEffect(() => {
    if (currentStep === 'payment_select' && selectedPaymentMethod === 'upi_qr') {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, selectedPaymentMethod]);

  if (!isOpen || !listing) return null;

  const totalValueINR = Math.round(quantityTons * 1000 * offeredPricePerKg);
  const reeferCostINR = needReeferTruck ? Math.round(quantityTons * 850) : 0;
  const grandTotalINR = totalValueINR + reeferCostINR;
  const mandiBenchmarkDiff = Math.round(
    ((offeredPricePerKg - listing.currentMandiPricePerKg) / listing.currentMandiPricePerKg) * 100
  );

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText('kisanmitra.escrow@icici');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment_select');
  };

  const handleExecutePayment = () => {
    setCurrentStep('processing');

    const generatedContractId = `CTR-${Date.now().toString().slice(-6)}`;
    const randomUtr = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    let methodLabel = 'Bank Escrow Vault (ICICI Agri Nodal)';
    let paymentStatus: PaymentDetails['paymentStatus'] = 'Escrow Secured';
    let settlementNote = '100% Escrow funds locked in Nodal Account until gate digital weighing.';

    if (selectedPaymentMethod === 'upi_qr') {
      methodLabel = `Instant UPI Settlement (${selectedUpiApp.toUpperCase()})`;
      paymentStatus = 'Instant Settled';
      settlementNote = `Instant UPI transfer settled via NPCI network directly to farmer's registered VPA (${listing.sellerName}).`;
    } else if (selectedPaymentMethod === 'letter_of_credit') {
      methodLabel = `Institutional Letter of Credit (${lcTenure}-Day Sight)`;
      paymentStatus = 'LC Verified by Bank';
      settlementNote = `Irrevocable LC opened with ${lcBank} with ${lcTenure}-day settlement against verified gate pass.`;
    } else if (selectedPaymentMethod === 'rtgs_neft') {
      methodLabel = 'Corporate RTGS Virtual Account (VAN)';
      paymentStatus = 'Processing Wire';
      settlementNote = `RTGS Wire routed through Virtual Account VAN-KM-${generatedContractId}.`;
    } else if (selectedPaymentMethod === 'buyer_credit_line') {
      methodLabel = 'NABARD Pre-Approved Buyer Credit Line (BNPL 15 Days)';
      paymentStatus = 'Escrow Secured';
      settlementNote = 'Corporate credit line utilized with 0% interest for 15-day trade cycle.';
    } else if (selectedPaymentMethod === 'apmc_cash_voucher') {
      methodLabel = 'APMC Digital e-Rupee Gate Voucher';
      paymentStatus = 'Pending Gate Weighment';
      settlementNote = 'Digital e-Rupee token generated for instant redemption at APMC Mandi weighbridge terminal.';
    }

    const paymentDetails: PaymentDetails = {
      method: selectedPaymentMethod,
      methodLabel,
      transactionRefId: `TXN-${Date.now().toString().slice(-8)}`,
      utrNumber: rtgsUtrInput || randomUtr,
      paidAmountINR: grandTotalINR,
      paymentTimestamp: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      paymentStatus,
      escrowBankName: selectedPaymentMethod === 'bank_escrow' ? escrowBank : undefined,
      upiIdUsed: selectedPaymentMethod === 'upi_qr' ? buyerUpiId : undefined,
      lcNumber: selectedPaymentMethod === 'letter_of_credit' ? `LC-${lcBank.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-5)}` : undefined,
      lcTenureDays: selectedPaymentMethod === 'letter_of_credit' ? lcTenure : undefined,
      virtualAccountNumber: selectedPaymentMethod === 'rtgs_neft' ? `ICIC0000011-KM-${generatedContractId}` : undefined,
      buyerGstNumber,
      invoiceNumber: `TAX-AGRI-${generatedContractId}`,
      advancePaidPercent: escrowDepositMode === 'advance_20' ? 20 : 100,
      settlementNote,
    };

    const newContract: OrderContract = {
      id: generatedContractId,
      cropName: listing.cropName,
      quantityTons: quantityTons,
      agreedPricePerKg: offeredPricePerKg,
      totalValueINR: grandTotalINR,
      buyerName: buyerCompanyName,
      buyerType: buyerType,
      farmerOrFpoName: listing.sellerName,
      orderDate: new Date().toISOString().split('T')[0],
      dispatchDeadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: selectedPaymentMethod === 'upi_qr' ? 'Escrow Funded' : 'Escrow Funded',
      logisticsPartner: needReeferTruck ? 'KisanMitra Shared Cold Chain Reefer' : 'Self-Arranged Transport',
      escrowStatus: selectedPaymentMethod === 'upi_qr' ? 'Instant UPI Escrow Funded' : `Secured via ${methodLabel}`,
      inspectionScore: `${listing.qualityGrade} (Verified)`,
      deliveryLocation,
      sellerBankUpi: `${listing.sellerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@icici`,
      paymentDetails,
    };

    // Simulate gateway verification
    setTimeout(() => {
      onOrderCreated(newContract);
      setCreatedContractResult(newContract);
      setCurrentStep('success');
    }, 1800);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#151C18] border border-[#2C3631] rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-[#E5E9E7]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1A221E] border-b border-[#2C3631] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/15 border border-[#C2D66E]/40 text-[#C2D66E] flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5 text-[#C2D66E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#C2D66E] uppercase tracking-widest">
                  Direct B2B Trade & Multi-Option Settlement
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Verified FPO Gate</span>
                </span>
              </div>
              <h3 className="font-serif italic font-bold text-lg text-white mt-0.5">
                {listing.cropName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#8E9B94] hover:text-[#C2D66E] hover:bg-[#242C28] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Tabs */}
        <div className="px-4 py-2 bg-[#121815] border-b border-[#2C3631] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'configure'
                  ? 'bg-[#C2D66E] text-[#0F1411]'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              1
            </span>
            <span className={currentStep === 'configure' ? 'text-white font-bold' : 'text-[#8E9B94]'}>
              1. Order & Logistics
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#2C3631]" />
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'payment_select'
                  ? 'bg-[#C2D66E] text-[#0F1411]'
                  : currentStep === 'processing' || currentStep === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-[#242C28] text-[#8E9B94]'
              }`}
            >
              2
            </span>
            <span className={currentStep === 'payment_select' ? 'text-white font-bold' : 'text-[#8E9B94]'}>
              2. Payment Options
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#2C3631]" />
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'success'
                  ? 'bg-[#C2D66E] text-[#0F1411]'
                  : 'bg-[#242C28] text-[#8E9B94]'
              }`}
            >
              3
            </span>
            <span className={currentStep === 'success' ? 'text-white font-bold' : 'text-[#8E9B94]'}>
              3. Invoice & Escrow
            </span>
          </div>
        </div>

        {/* STEP 1: CONFIGURE LOT & TRADE */}
        {currentStep === 'configure' && (
          <form onSubmit={handleProceedToPayment} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
            {/* Seller Snapshot */}
            <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[#8E9B94] block">Seller & Farm Gate:</span>
                <span className="font-serif font-bold text-white text-sm">{listing.sellerName}</span>
                <span className="text-[#8E9B94] block text-[11px]">{listing.location}, {listing.state}</span>
              </div>
              <div className="text-right">
                <span className="text-[#8E9B94] block">Farmer Ask Price:</span>
                <span className="font-serif font-bold text-[#C2D66E] text-base">₹{listing.expectedPricePerKg} / kg</span>
                <span className="text-[#8E9B94] block text-[10px]">Mandi: ₹{listing.currentMandiPricePerKg}/kg</span>
              </div>
            </div>

            {/* Trade Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#121815] rounded-2xl border border-[#2C3631]">
              <button
                type="button"
                onClick={() => {
                  setOrderType('direct_buy');
                  setOfferedPricePerKg(listing.expectedPricePerKg);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'direct_buy'
                    ? 'bg-[#C2D66E] text-[#0F1411] shadow-md'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                Direct Buy Lot (Instant Lock)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('bid')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'bid'
                    ? 'bg-[#C2D66E] text-[#0F1411] shadow-md'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                Place Custom B2B Bid
              </button>
            </div>

            {/* Pricing & Quantity Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                  {orderType === 'direct_buy' ? 'Agreed Price per Kg' : 'Your B2B Bid Price per Kg'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C2D66E] font-bold text-base select-none">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={offeredPricePerKg}
                    onChange={(e) => setOfferedPricePerKg(parseFloat(e.target.value) || 0)}
                    disabled={orderType === 'direct_buy'}
                    className="w-full bg-[#1A221E] border border-[#2C3631] rounded-2xl pl-8 pr-3.5 py-2 text-sm text-[#C2D66E] font-serif font-bold focus:border-[#C2D66E] focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-[#C2D66E] font-medium block mt-1">
                  {mandiBenchmarkDiff >= 0
                    ? `+${mandiBenchmarkDiff}% above traditional APMC mandi price`
                    : `${mandiBenchmarkDiff}% below ask`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                  Order Quantity (Metric Tons)
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min={0.1}
                  max={listing.availableQtyTons}
                  value={quantityTons}
                  onChange={(e) => setQuantityTons(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-[#1A221E] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-sm text-white font-bold focus:border-[#C2D66E] focus:outline-none"
                />
                <span className="text-[10px] text-[#8E9B94] block mt-1">
                  Max available: {listing.availableQtyTons} Tons ({listing.availableQtyTons * 1000} kg)
                </span>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                  Buyer / Company Name
                </label>
                <input
                  type="text"
                  required
                  value={buyerCompanyName}
                  onChange={(e) => setBuyerCompanyName(e.target.value)}
                  className="w-full bg-[#1A221E] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                  Buyer Category
                </label>
                <select
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value)}
                  className="w-full bg-[#1A221E] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
                >
                  <option value="Supermarket Chain">Supermarket Chain (Retail)</option>
                  <option value="Exporter">Exporter (International Air/Sea)</option>
                  <option value="Food Processing">Food Processing / Juice Company</option>
                  <option value="HoReCa Buyer">HoReCa (Hotels, Cloud Kitchens)</option>
                  <option value="Direct Consumer Group">Direct Apartment / Consumer Group</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                  Destination Delivery Hub / City
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full bg-[#1A221E] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                  Buyer Corporate GSTIN
                </label>
                <input
                  type="text"
                  required
                  value={buyerGstNumber}
                  onChange={(e) => setBuyerGstNumber(e.target.value)}
                  className="w-full bg-[#1A221E] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-xs text-white font-mono focus:border-[#C2D66E] focus:outline-none"
                />
              </div>
            </div>

            {/* Logistics Option Checkbox */}
            <div className="p-3.5 bg-[#1A221E] border border-[#2C3631] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#C2D66E]" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Add KisanMitra Smart Cold-Chain Transport?
                  </span>
                  <span className="text-[11px] text-[#8E9B94]">
                    IoT temperature monitoring & shared freight rate (+₹{reeferCostINR.toLocaleString('en-IN')})
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={needReeferTruck}
                onChange={(e) => setNeedReeferTruck(e.target.checked)}
                className="w-4 h-4 rounded text-[#C2D66E] bg-[#121815] border-[#2C3631] focus:ring-[#C2D66E] accent-[#C2D66E] cursor-pointer"
              />
            </div>

            {/* Total Calculation */}
            <div className="p-4 bg-[#121815] rounded-2xl border border-[#2C3631] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#8E9B94]">
                <span>Produce Total ({quantityTons} MT @ ₹{offeredPricePerKg}/kg):</span>
                <span className="font-semibold text-white">₹{totalValueINR.toLocaleString('en-IN')}</span>
              </div>
              {needReeferTruck && (
                <div className="flex items-center justify-between text-[#8E9B94]">
                  <span>Cold Chain Reefer Freight Addon:</span>
                  <span className="font-semibold text-white">₹{reeferCostINR.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#2C3631] flex items-center justify-between text-sm sm:text-base">
                <span className="font-bold text-white">Total Payable:</span>
                <span className="font-serif font-bold text-[#C2D66E] text-xl">
                  ₹{grandTotalINR.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Next Step Action */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#2C3631]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#8E9B94] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Select Payment Method</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: CHOOSE FROM DIFFERENT PAYMENT OPTIONS */}
        {currentStep === 'payment_select' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar bg-[#151C18]">
            {/* Amount Banner */}
            <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider font-semibold block">Total Amount to Settle</span>
                <span className="font-serif font-bold text-xl text-[#C2D66E]">₹{grandTotalINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right text-xs">
                <span className="text-[#8E9B94] block">{listing.cropName}</span>
                <span className="text-white font-medium">{quantityTons} Tons • ₹{offeredPricePerKg}/kg</span>
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                Choose Payment Option:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. UPI Dynamic QR */}
                <div
                  onClick={() => setSelectedPaymentMethod('upi_qr')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'upi_qr'
                      ? 'bg-[#242C28] border-[#C2D66E] shadow-md ring-1 ring-[#C2D66E]/50'
                      : 'bg-[#1A221E] border-[#2C3631] hover:border-[#8E9B94]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Instant UPI & QR</span>
                        <span className="text-[10px] text-[#8E9B94]">0% Fee • Instant Settlement</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      FASTEST
                    </span>
                  </div>
                </div>

                {/* 2. Bank Escrow Vault */}
                <div
                  onClick={() => setSelectedPaymentMethod('bank_escrow')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'bank_escrow'
                      ? 'bg-[#242C28] border-[#C2D66E] shadow-md ring-1 ring-[#C2D66E]/50'
                      : 'bg-[#1A221E] border-[#2C3631] hover:border-[#8E9B94]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Bank Escrow Vault</span>
                        <span className="text-[10px] text-[#8E9B94]">SBI / ICICI Nodal Account</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      100% SECURE
                    </span>
                  </div>
                </div>

                {/* 3. Letter of Credit */}
                <div
                  onClick={() => setSelectedPaymentMethod('letter_of_credit')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'letter_of_credit'
                      ? 'bg-[#242C28] border-[#C2D66E] shadow-md ring-1 ring-[#C2D66E]/50'
                      : 'bg-[#1A221E] border-[#2C3631] hover:border-[#8E9B94]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Letter of Credit (LC)</span>
                        <span className="text-[10px] text-[#8E9B94]">30-90 Days Sight • Exporters</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      INSTITUTIONAL
                    </span>
                  </div>
                </div>

                {/* 4. RTGS / NEFT Corporate Wire */}
                <div
                  onClick={() => setSelectedPaymentMethod('rtgs_neft')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'rtgs_neft'
                      ? 'bg-[#242C28] border-[#C2D66E] shadow-md ring-1 ring-[#C2D66E]/50'
                      : 'bg-[#1A221E] border-[#2C3631] hover:border-[#8E9B94]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">RTGS / NEFT VAN Wire</span>
                        <span className="text-[10px] text-[#8E9B94]">Virtual Account Number</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      DIRECT BANK
                    </span>
                  </div>
                </div>

                {/* 5. Pre-Approved Credit Line */}
                <div
                  onClick={() => setSelectedPaymentMethod('buyer_credit_line')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'buyer_credit_line'
                      ? 'bg-[#242C28] border-[#C2D66E] shadow-md ring-1 ring-[#C2D66E]/50'
                      : 'bg-[#1A221E] border-[#2C3631] hover:border-[#8E9B94]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">NABARD Credit Line</span>
                        <span className="text-[10px] text-[#8E9B94]">Pay Later (15 Days @ 0%)</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      BNPL LIMIT
                    </span>
                  </div>
                </div>

                {/* 6. APMC Cash / e-Rupee Voucher */}
                <div
                  onClick={() => setSelectedPaymentMethod('apmc_cash_voucher')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'apmc_cash_voucher'
                      ? 'bg-[#242C28] border-[#C2D66E] shadow-md ring-1 ring-[#C2D66E]/50'
                      : 'bg-[#1A221E] border-[#2C3631] hover:border-[#8E9B94]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">e-Rupee Gate Voucher</span>
                        <span className="text-[10px] text-[#8E9B94]">Redeem at Mandi Weighbridge</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      OFFLINE TOKEN
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DYNAMIC FORM DEPENDING ON SELECTED PAYMENT OPTION */}

            {/* A. UPI & Dynamic QR Details */}
            {selectedPaymentMethod === 'upi_qr' && (
              <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#2C3631] pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Dynamic Bharat UPI QR Code</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#C2D66E] font-mono bg-[#121815] px-2.5 py-1 rounded-full border border-[#2C3631]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires in {formatTimer(timerSeconds)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Generated Dynamic QR Canvas Box */}
                  <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center shrink-0">
                    {/* SVG Clean Bharat QR Code Representation */}
                    <svg viewBox="0 0 140 140" className="w-32 h-32">
                      <rect width="140" height="140" fill="#ffffff" />
                      {/* Top Left Marker */}
                      <rect x="10" y="10" width="36" height="36" fill="#0F1411" rx="4" />
                      <rect x="16" y="16" width="24" height="24" fill="#ffffff" rx="2" />
                      <rect x="22" y="22" width="12" height="12" fill="#0F1411" rx="1" />
                      {/* Top Right Marker */}
                      <rect x="94" y="10" width="36" height="36" fill="#0F1411" rx="4" />
                      <rect x="100" y="16" width="24" height="24" fill="#ffffff" rx="2" />
                      <rect x="106" y="22" width="12" height="12" fill="#0F1411" rx="1" />
                      {/* Bottom Left Marker */}
                      <rect x="10" y="94" width="36" height="36" fill="#0F1411" rx="4" />
                      <rect x="16" y="100" width="24" height="24" fill="#ffffff" rx="2" />
                      <rect x="22" y="106" width="12" height="12" fill="#0F1411" rx="1" />
                      {/* Random Data matrix dots */}
                      <circle cx="56" cy="20" r="3" fill="#0F1411" />
                      <circle cx="68" cy="20" r="3" fill="#0F1411" />
                      <circle cx="80" cy="20" r="3" fill="#0F1411" />
                      <circle cx="56" cy="32" r="3" fill="#0F1411" />
                      <circle cx="74" cy="32" r="3" fill="#0F1411" />
                      <circle cx="62" cy="44" r="3" fill="#0F1411" />
                      <circle cx="20" cy="56" r="3" fill="#0F1411" />
                      <circle cx="32" cy="56" r="3" fill="#0F1411" />
                      <circle cx="44" cy="56" r="3" fill="#0F1411" />
                      <circle cx="56" cy="56" r="3" fill="#0F1411" />
                      <circle cx="68" cy="56" r="3" fill="#0F1411" />
                      <circle cx="80" cy="56" r="3" fill="#0F1411" />
                      <circle cx="94" cy="56" r="3" fill="#0F1411" />
                      <circle cx="106" cy="56" r="3" fill="#0F1411" />
                      <circle cx="118" cy="56" r="3" fill="#0F1411" />
                      <circle cx="20" cy="68" r="3" fill="#0F1411" />
                      <circle cx="38" cy="68" r="3" fill="#0F1411" />
                      <circle cx="56" cy="68" r="3" fill="#0F1411" />
                      <circle cx="74" cy="68" r="3" fill="#0F1411" />
                      <circle cx="92" cy="68" r="3" fill="#0F1411" />
                      <circle cx="110" cy="68" r="3" fill="#0F1411" />
                      <circle cx="56" cy="80" r="3" fill="#0F1411" />
                      <circle cx="68" cy="80" r="3" fill="#0F1411" />
                      <circle cx="80" cy="80" r="3" fill="#0F1411" />
                      <circle cx="94" cy="80" r="3" fill="#0F1411" />
                      <circle cx="56" cy="94" r="3" fill="#0F1411" />
                      <circle cx="68" cy="94" r="3" fill="#0F1411" />
                      <circle cx="80" cy="94" r="3" fill="#0F1411" />
                      <circle cx="100" cy="94" r="3" fill="#0F1411" />
                      <circle cx="116" cy="94" r="3" fill="#0F1411" />
                      <circle cx="56" cy="106" r="3" fill="#0F1411" />
                      <circle cx="74" cy="106" r="3" fill="#0F1411" />
                      <circle cx="92" cy="106" r="3" fill="#0F1411" />
                      <circle cx="110" cy="106" r="3" fill="#0F1411" />
                      <circle cx="56" cy="118" r="3" fill="#0F1411" />
                      <circle cx="68" cy="118" r="3" fill="#0F1411" />
                      <circle cx="86" cy="118" r="3" fill="#0F1411" />
                      <circle cx="104" cy="118" r="3" fill="#0F1411" />
                      <circle cx="120" cy="118" r="3" fill="#0F1411" />
                      {/* Center NPCI UPI Logo Icon */}
                      <rect x="58" y="58" width="24" height="24" rx="4" fill="#151C18" />
                      <path d="M64 68 L70 63 L76 68 L70 73 Z" fill="#C2D66E" />
                    </svg>
                    <span className="text-[10px] font-bold text-gray-800 tracking-wider mt-1">ETOSPay • UPI • NPCI</span>
                  </div>

                  {/* UPI App Quick Pickers & VPA Info */}
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <span className="text-[11px] text-[#8E9B94] block mb-1">Pay with any UPI App:</span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {(['gpay', 'phonepe', 'paytm', 'etospay', 'cred'] as const).map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setSelectedUpiApp(app)}
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                              selectedUpiApp === app
                                ? 'bg-[#C2D66E] text-[#0F1411] border-[#C2D66E] font-extrabold'
                                : 'bg-[#242C28] text-[#8E9B94] border-[#2C3631] hover:text-white'
                            }`}
                          >
                            {app === 'etospay' ? 'ETOSPay' : app}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#8E9B94] block mb-1">Escrow Merchant VPA:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value="kisanmitra.escrow@icici"
                          className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-3 py-1.5 text-xs text-[#C2D66E] font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-3 py-1.5 rounded-xl bg-[#242C28] hover:bg-[#2C3631] text-xs text-white border border-[#2C3631] flex items-center gap-1 shrink-0"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#8E9B94] block mb-1">Or Enter Your Corporate UPI ID:</span>
                      <input
                        type="text"
                        value={buyerUpiId}
                        onChange={(e) => setBuyerUpiId(e.target.value)}
                        className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-[#C2D66E] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* B. Bank Escrow Vault Details */}
            {selectedPaymentMethod === 'bank_escrow' && (
              <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-[#2C3631] pb-3">
                  <ShieldCheck className="w-4 h-4 text-[#C2D66E]" />
                  <span className="text-xs font-bold text-white">Tripartite Agri Bank Escrow Setup</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#8E9B94] mb-1">Selected Nodal Escrow Bank</label>
                    <select
                      value={escrowBank}
                      onChange={(e) => setEscrowBank(e.target.value)}
                      className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
                    >
                      <option value="ICICI Bank Agri Nodal Escrow">ICICI Bank Agri Nodal (IFSC: ICIC0000011)</option>
                      <option value="State Bank of India Krishi Escrow">State Bank of India Krishi Nodal (IFSC: SBIN0001201)</option>
                      <option value="HDFC Bank Rural Treasury Nodal">HDFC Bank Rural Treasury (IFSC: HDFC0000018)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8E9B94] mb-1">Deposit Lock Schedule</label>
                    <select
                      value={escrowDepositMode}
                      onChange={(e) => setEscrowDepositMode(e.target.value as any)}
                      className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
                    >
                      <option value="100_percent">100% Full Lock (₹{grandTotalINR.toLocaleString('en-IN')})</option>
                      <option value="advance_20">20% Booking Token (₹{Math.round(grandTotalINR * 0.2).toLocaleString('en-IN')}) + 80% on Dispatch</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-[#121815] rounded-xl border border-[#2C3631] text-[11px] text-[#8E9B94] space-y-1">
                  <span className="font-bold text-white block">🔒 Escrow Release Conditions:</span>
                  <div>1. Mandi weighbridge gross and tare slips uploaded electronically.</div>
                  <div>2. Certified quality inspection score matches {listing.qualityGrade}.</div>
                  <div>3. Funds released immediately into farmer’s verified account upon buyer acceptance.</div>
                </div>
              </div>
            )}

            {/* C. Letter of Credit Details */}
            {selectedPaymentMethod === 'letter_of_credit' && (
              <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-[#2C3631] pb-3">
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Institutional Letter of Credit (LC) Terms</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#8E9B94] mb-1">LC Issuing Bank</label>
                    <input
                      type="text"
                      value={lcBank}
                      onChange={(e) => setLcBank(e.target.value)}
                      className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8E9B94] mb-1">Credit Usance Tenure</label>
                    <select
                      value={lcTenure}
                      onChange={(e) => setLcTenure(parseInt(e.target.value))}
                      className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
                    >
                      <option value={30}>30 Days Sight LC (Domestic Wholesale)</option>
                      <option value={60}>60 Days Sight LC (Air / Sea Export Standard)</option>
                      <option value={90}>90 Days Sight LC (Long-Haul International)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-[#121815] rounded-xl border border-emerald-500/30 text-[11px] text-[#8E9B94] space-y-1">
                  <span className="font-bold text-emerald-300 block">📜 Export & Wholesale Compliance:</span>
                  <div>• Irrevocable Documentary Credit backed by EXIM/Commercial Bank.</div>
                  <div>• Negotiable against Clean Reefer Bill of Lading & APMC Phyto-Sanitary Pass.</div>
                </div>
              </div>
            )}

            {/* D. RTGS / NEFT VAN Wire */}
            {selectedPaymentMethod === 'rtgs_neft' && (
              <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-[#2C3631] pb-3">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Virtual Account Number (VAN) RTGS Wire</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#121815] rounded-xl">
                    <span className="text-[#8E9B94] block text-[10px]">Beneficiary Name:</span>
                    <span className="font-bold text-white block">KisanMitra Agri Escrow Nodal</span>
                  </div>
                  <div className="p-3 bg-[#121815] rounded-xl">
                    <span className="text-[#8E9B94] block text-[10px]">Virtual Account (VAN):</span>
                    <span className="font-mono font-bold text-emerald-300 block">ICIC0000011-KM-LOT-{Date.now().toString().slice(-4)}</span>
                  </div>
                  <div className="p-3 bg-[#121815] rounded-xl">
                    <span className="text-[#8E9B94] block text-[10px]">IFSC Code:</span>
                    <span className="font-mono font-bold text-white block">ICIC0000011</span>
                  </div>
                  <div className="p-3 bg-[#121815] rounded-xl">
                    <span className="text-[#8E9B94] block text-[10px]">Account Type:</span>
                    <span className="font-bold text-white block">Current Escrow Account</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#8E9B94] mb-1">Bank RTGS UTR Number (Optional / Simulator)</label>
                  <input
                    type="text"
                    placeholder="e.g., ICICR520260904001928"
                    value={rtgsUtrInput}
                    onChange={(e) => setRtgsUtrInput(e.target.value)}
                    className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#C2D66E] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* E. Pre-Approved Credit Line Details */}
            {selectedPaymentMethod === 'buyer_credit_line' && (
              <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#2C3631] pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">NABARD AgriFin Buyer Credit Line</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    APPROVED
                  </span>
                </div>

                <div className="p-3 bg-[#121815] rounded-xl space-y-2">
                  <div className="flex justify-between text-xs text-[#8E9B94]">
                    <span>Available Credit Limit:</span>
                    <span className="font-bold text-white">₹25,00,000</span>
                  </div>
                  <div className="w-full bg-[#242C28] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[35%]"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8E9B94]">
                    <span>This Order: ₹{grandTotalINR.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-400">0% Interest for 15 Days</span>
                  </div>
                </div>
              </div>
            )}

            {/* F. APMC Cash / e-Rupee Voucher */}
            {selectedPaymentMethod === 'apmc_cash_voucher' && (
              <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[#2C3631] pb-3">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">APMC Mandi Weighbridge e-Rupee Cash Token</span>
                </div>
                <div className="p-3 bg-[#121815] rounded-xl text-xs text-[#8E9B94] space-y-1.5">
                  <p>
                    A digital SMS voucher token with 6-digit OTP will be generated. The farmer or FPO can immediately present this voucher at the APMC Mandi Cash Counter upon weighment.
                  </p>
                  <div className="text-[11px] text-emerald-300 font-mono">
                    Token Security: OTP Authenticated with RBI Digital Rupee CBDC
                  </div>
                </div>
              </div>
            )}

            {/* Payment Execution Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-[#2C3631]">
              <button
                type="button"
                onClick={() => setCurrentStep('configure')}
                className="px-4 py-2 text-xs font-semibold text-[#8E9B94] hover:text-white"
              >
                Back to Lot Details
              </button>
              <button
                type="button"
                onClick={handleExecutePayment}
                className="px-6 py-2.5 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {selectedPaymentMethod === 'upi_qr'
                    ? `Pay ₹${grandTotalINR.toLocaleString('en-IN')} via UPI`
                    : selectedPaymentMethod === 'bank_escrow'
                    ? `Lock ₹${grandTotalINR.toLocaleString('en-IN')} in Escrow`
                    : selectedPaymentMethod === 'letter_of_credit'
                    ? 'Issue Institutional LC'
                    : `Confirm & Settle ₹${grandTotalINR.toLocaleString('en-IN')}`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING SIMULATION */}
        {currentStep === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#C2D66E] border-t-transparent"></div>
            <div>
              <h3 className="text-lg font-bold text-white font-serif">
                Connecting to {selectedPaymentMethod === 'upi_qr' ? 'UPI NPCI Switch' : 'Agri Escrow Banking Gateway'}...
              </h3>
              <p className="text-xs text-[#8E9B94] mt-1 max-w-sm">
                Securing contract amount, issuing cryptographic transaction certificate, and notifying {listing.sellerName}.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS & ORDER RECEIPT */}
        {currentStep === 'success' && createdContractResult && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 no-scrollbar">
            <div className="p-5 rounded-2xl bg-[#1A221E] border border-emerald-500/50 flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif italic font-bold text-xl text-white">
                Payment Authorized & Contract Created!
              </h3>
              <p className="text-xs text-[#8E9B94] max-w-md">
                Your order for <strong className="text-white">{listing.cropName}</strong> has been secured with{' '}
                <strong className="text-[#C2D66E]">{createdContractResult.paymentDetails?.methodLabel}</strong>.
              </p>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#121815] rounded-xl border border-[#2C3631]">
                <span className="text-[#8E9B94] text-[10px] block">Contract ID:</span>
                <span className="font-mono font-bold text-white">{createdContractResult.id}</span>
              </div>
              <div className="p-3 bg-[#121815] rounded-xl border border-[#2C3631]">
                <span className="text-[#8E9B94] text-[10px] block">Payment Reference:</span>
                <span className="font-mono font-bold text-[#C2D66E]">{createdContractResult.paymentDetails?.transactionRefId}</span>
              </div>
              <div className="p-3 bg-[#121815] rounded-xl border border-[#2C3631]">
                <span className="text-[#8E9B94] text-[10px] block">Settled Amount:</span>
                <span className="font-bold text-white text-sm">₹{createdContractResult.totalValueINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-[#121815] rounded-xl border border-[#2C3631]">
                <span className="text-[#8E9B94] text-[10px] block">Logistics:</span>
                <span className="font-medium text-emerald-400">{createdContractResult.logisticsPartner}</span>
              </div>
            </div>

            {/* Success Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#2C3631]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider shadow-md"
              >
                Go to Escrow Contracts View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
