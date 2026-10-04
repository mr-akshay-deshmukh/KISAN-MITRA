import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Landmark,
  CreditCard,
  Building2,
  Banknote,
  Clock,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Lock,
  Unlock,
  AlertCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Layers,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { LanguageCode, OrderContract, PaymentMethodType, PaymentDetails } from '../types';
import { translations } from '../utils/translations';

interface ContractPaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: OrderContract | null;
  currentLanguage: LanguageCode;
  onPaymentSuccess: (updatedContract: OrderContract) => void;
}

// Synthesize pleasant UPI chime on successful simulation
const playUpiSuccessChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play two-tone chime (F5 -> A5 -> C6)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.18); // C6
    gain2.gain.setValueAtTime(0.35, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.8);
  } catch (e) {
    // AudioContext autoplay restrictions or disabled
  }
};

export const ContractPaymentSimulatorModal: React.FC<ContractPaymentSimulatorModalProps> = ({
  isOpen,
  onClose,
  contract,
  currentLanguage,
  onPaymentSuccess,
}) => {
  const t = translations[currentLanguage];

  // Active Checkout Mode
  const [selectedMethod, setSelectedMethod] = useState<'upi_qr' | 'bank_escrow' | 'other_methods'>('upi_qr');
  const [secondaryMethod, setSecondaryMethod] = useState<PaymentMethodType>('letter_of_credit');

  // UPI / QR Specific States
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'etospay' | 'cred' | 'any'>('gpay');
  const [customBuyerVpa, setCustomBuyerVpa] = useState('corporate.buyer@okhdfcbank');
  const [copiedUpiString, setCopiedUpiString] = useState(false);
  const [qrExpirySeconds, setQrExpirySeconds] = useState(300);
  const [isScanningSimulated, setIsScanningSimulated] = useState(false);
  const [simulatedStep, setSimulatedStep] = useState<
    'idle' | 'scanning' | 'verifying_npci' | 'entering_mpin' | 'settled'
  >('idle');
  const [mpinInput, setMpinInput] = useState('••••');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Escrow Specific States
  const [selectedEscrowBank, setSelectedEscrowBank] = useState('ICICI Bank Agri Nodal Escrow');
  const [escrowDepositType, setEscrowDepositType] = useState<'full_100' | 'token_20'>('full_100');
  const [escrowConditionsChecked, setEscrowConditionsChecked] = useState({
    weightSlip: true,
    qcVerified: true,
    disbursementAuto: true,
  });

  // Sync state with contract when modal opens
  useEffect(() => {
    if (contract) {
      const initialMethod = contract.paymentDetails?.method || 'bank_escrow';
      if (initialMethod === 'upi_qr') {
        setSelectedMethod('upi_qr');
      } else if (initialMethod === 'bank_escrow') {
        setSelectedMethod('bank_escrow');
      } else {
        setSelectedMethod('other_methods');
        setSecondaryMethod(initialMethod);
      }
      setQrExpirySeconds(300);
      setSimulatedStep('idle');
      setIsScanningSimulated(false);
    }
  }, [contract]);

  // Countdown for dynamic QR
  useEffect(() => {
    if (isOpen && selectedMethod === 'upi_qr' && simulatedStep !== 'settled') {
      const timer = setInterval(() => {
        setQrExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, selectedMethod, simulatedStep]);

  if (!isOpen || !contract) return null;

  const totalAmount = contract.totalValueINR;
  const sellerVpa =
    contract.sellerBankUpi ||
    `${contract.farmerOrFpoName.toLowerCase().replace(/[^a-z0-9]/g, '')}@icici`;
  const upiIntentString = `upi://pay?pa=${sellerVpa}&pn=${encodeURIComponent(
    contract.farmerOrFpoName
  )}&am=${totalAmount}&cu=INR&tn=KisanMitra_Agri_${contract.id}`;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUpiString = () => {
    navigator.clipboard?.writeText(upiIntentString);
    setCopiedUpiString(true);
    setTimeout(() => setCopiedUpiString(false), 2000);
  };

  const handleRefreshQr = () => {
    setQrExpirySeconds(300);
    setSimulatedStep('idle');
    setIsScanningSimulated(false);
  };

  // Run the complete multi-stage UPI Payment Simulation
  const handleStartUpiSimulation = () => {
    setIsScanningSimulated(true);
    setSimulatedStep('scanning');

    // Step 1: Camera Scan -> Step 2: NPCI Routing (800ms)
    setTimeout(() => {
      setSimulatedStep('verifying_npci');

      // Step 2 -> Step 3: MPIN validation (1800ms)
      setTimeout(() => {
        setSimulatedStep('entering_mpin');

        // Step 3 -> Step 4: Settlement Completed (2800ms)
        setTimeout(() => {
          setSimulatedStep('settled');
          setIsScanningSimulated(false);

          if (soundEnabled) {
            playUpiSuccessChime();
          }

          // Generate updated contract state
          const newUtr = `UPI-${Date.now().toString().slice(-8)}`;
          const updatedContract: OrderContract = {
            ...contract,
            status: 'Escrow Funded',
            escrowStatus: `Instant UPI Settled (${selectedUpiApp.toUpperCase()})`,
            paymentDetails: {
              method: 'upi_qr',
              methodLabel: `Instant Bharat UPI (${selectedUpiApp.toUpperCase()})`,
              transactionRefId: `TXN-UPI-${contract.id.replace('CTR-', '')}`,
              utrNumber: newUtr,
              paidAmountINR: totalAmount,
              paymentTimestamp: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              paymentStatus: 'Instant Settled',
              upiIdUsed: customBuyerVpa,
              buyerGstNumber: contract.paymentDetails?.buyerGstNumber || '27AABCU9603R1ZM',
              invoiceNumber: `TAX-UPI-${contract.id.replace('CTR-', '')}`,
              advancePaidPercent: 100,
              settlementNote: `Instant UPI transfer settled directly to farmer VPA (${sellerVpa}) via NPCI switch with UTR ${newUtr}.`,
            },
          };

          onPaymentSuccess(updatedContract);
        }, 1200);
      }, 1000);
    }, 900);
  };

  // Run the Standard Bank Escrow Lock Simulation
  const handleStartEscrowSimulation = () => {
    setIsScanningSimulated(true);
    setSimulatedStep('verifying_npci');

    setTimeout(() => {
      setSimulatedStep('settled');
      setIsScanningSimulated(false);

      if (soundEnabled) {
        playUpiSuccessChime();
      }

      const newUtr = `ESC-ICIC-${Date.now().toString().slice(-8)}`;
      const updatedContract: OrderContract = {
        ...contract,
        status: 'Escrow Funded',
        escrowStatus: `Secured with ${selectedEscrowBank}`,
        paymentDetails: {
          method: 'bank_escrow',
          methodLabel: `Bank Escrow Vault (${selectedEscrowBank})`,
          transactionRefId: `TXN-ESC-${contract.id.replace('CTR-', '')}`,
          utrNumber: newUtr,
          paidAmountINR: totalAmount,
          paymentTimestamp: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          paymentStatus: 'Escrow Secured',
          escrowBankName: selectedEscrowBank,
          buyerGstNumber: contract.paymentDetails?.buyerGstNumber || '27AABCU9603R1ZM',
          invoiceNumber: `TAX-ESC-${contract.id.replace('CTR-', '')}`,
          advancePaidPercent: escrowDepositType === 'token_20' ? 20 : 100,
          settlementNote: `Escrow deposit locked in ${selectedEscrowBank} nodal vault. Auto-releases upon mandi weighbridge pass and quality inspection.`,
        },
      };

      onPaymentSuccess(updatedContract);
    }, 1200);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#151C18] border border-[#2C3631] rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-[#E5E9E7]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-[#1A221E] border-b border-[#2C3631] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/15 border border-[#C2D66E]/40 text-[#C2D66E] flex items-center justify-center font-bold shadow-md">
              <QrCode className="w-5 h-5 text-[#C2D66E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#C2D66E] uppercase tracking-widest">
                  Order Payment & Checkout Engine
                </span>
                <span className="bg-[#242C28] text-white border border-[#2C3631] text-[10px] font-mono px-2 py-0.5 rounded-full">
                  {contract.id}
                </span>
              </div>
              <h3 className="font-serif italic font-bold text-lg text-white">
                {contract.cropName} • ₹{totalAmount.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-[#8E9B94] hover:text-[#C2D66E] hover:bg-[#242C28] transition-colors"
              title={soundEnabled ? 'Mute Chime Sound' : 'Enable Chime Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#C2D66E]" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8E9B94] hover:text-[#C2D66E] hover:bg-[#242C28] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Checkout Mode Selector Tabs */}
        <div className="p-3 bg-[#121815] border-b border-[#2C3631]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Tab 1: UPI / QR Simulation */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('upi_qr');
                setSimulatedStep('idle');
              }}
              className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                selectedMethod === 'upi_qr'
                  ? 'bg-[#242C28] border-[#C2D66E] text-white shadow-md ring-1 ring-[#C2D66E]/40'
                  : 'bg-[#1A221E] border-[#2C3631] text-[#8E9B94] hover:text-white'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMethod === 'upi_qr'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-[#151C18] text-[#8E9B94]'
                }`}
              >
                <QrCode className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">⚡ UPI / Dynamic QR</span>
                <span className="text-[10px] text-[#8E9B94] block">Instant RT-Settlement</span>
              </div>
            </button>

            {/* Tab 2: Standard Tripartite Bank Escrow */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('bank_escrow');
                setSimulatedStep('idle');
              }}
              className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                selectedMethod === 'bank_escrow'
                  ? 'bg-[#242C28] border-[#C2D66E] text-white shadow-md ring-1 ring-[#C2D66E]/40'
                  : 'bg-[#1A221E] border-[#2C3631] text-[#8E9B94] hover:text-white'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMethod === 'bank_escrow'
                    ? 'bg-[#C2D66E]/20 text-[#C2D66E]'
                    : 'bg-[#151C18] text-[#8E9B94]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">🏦 Bank Escrow Vault</span>
                <span className="text-[10px] text-[#8E9B94] block">ICICI / SBI Nodal Lock</span>
              </div>
            </button>

            {/* Tab 3: Other Corporate Channels */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('other_methods');
                setSimulatedStep('idle');
              }}
              className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all text-left col-span-2 sm:col-span-1 ${
                selectedMethod === 'other_methods'
                  ? 'bg-[#242C28] border-[#C2D66E] text-white shadow-md ring-1 ring-[#C2D66E]/40'
                  : 'bg-[#1A221E] border-[#2C3631] text-[#8E9B94] hover:text-white'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMethod === 'other_methods'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-[#151C18] text-[#8E9B94]'
                }`}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">📜 LC / RTGS / Credit</span>
                <span className="text-[10px] text-[#8E9B94] block">Institutional Lines</span>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar bg-[#151C18]">
          {/* Produce & Beneficiary Summary Card */}
          <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#8E9B94] text-[10px] uppercase tracking-wider block">Beneficiary Farmer / FPO</span>
              <span className="font-serif font-bold text-white text-base">{contract.farmerOrFpoName}</span>
              <span className="text-[#C2D66E] font-mono text-[11px] block mt-0.5">VPA: {sellerVpa}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-[#8E9B94] text-[10px] uppercase tracking-wider block">Contract Lot Value</span>
              <span className="font-serif font-bold text-[#C2D66E] text-xl">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[#8E9B94] text-[10px] block">
                {contract.quantityTons} MT ({contract.quantityTons * 1000} kg) @ ₹{contract.agreedPricePerKg}/kg
              </span>
            </div>
          </div>

          {/* MODE 1: UPI DYNAMIC QR CODE SIMULATION */}
          {selectedMethod === 'upi_qr' && (
            <div className="space-y-4">
              {/* Top simulation status banner */}
              <div className="p-3.5 bg-[#1A221E] border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Dynamic NPCI Bharat QR Generator</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#C2D66E] font-mono bg-[#121815] px-2.5 py-1 rounded-full border border-[#2C3631] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C2D66E]" />
                    {formatTimer(qrExpirySeconds)}
                  </span>
                  <button
                    onClick={handleRefreshQr}
                    className="p-1 rounded-lg bg-[#242C28] hover:bg-[#2C3631] text-[#8E9B94] hover:text-white"
                    title="Regenerate QR"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* QR Container & Simulator Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* QR Code Graphic Box (Col 5) */}
                <div className="sm:col-span-5 p-4 bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
                  {/* Active scanning laser line during simulation */}
                  {simulatedStep === 'scanning' && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_#10B981] top-1/4"></div>
                  )}

                  {/* SVG QR Code */}
                  <svg viewBox="0 0 140 140" className="w-36 h-36">
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
                    {/* Data Matrix */}
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
                    {/* Center Brand Icon */}
                    <rect x="58" y="58" width="24" height="24" rx="4" fill="#151C18" />
                    <path d="M64 68 L70 63 L76 68 L70 73 Z" fill="#C2D66E" />
                  </svg>

                  <div className="mt-2 text-center">
                    <span className="text-[11px] font-bold text-gray-900 block">
                      Scan with any UPI App
                    </span>
                    <span className="text-[9px] font-mono text-gray-500 block">
                      ₹{totalAmount.toLocaleString('en-IN')} Locked
                    </span>
                  </div>
                </div>

                {/* Simulation Controls & UPI Intent Details (Col 7) */}
                <div className="sm:col-span-7 space-y-3">
                  {/* UPI App Simulation Chips */}
                  <div>
                    <span className="text-[11px] text-[#8E9B94] block mb-1.5 font-semibold">
                      Simulate Direct App Launch:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'gpay', name: 'Google Pay', color: 'text-emerald-400' },
                        { id: 'phonepe', name: 'PhonePe', color: 'text-purple-400' },
                        { id: 'paytm', name: 'Paytm', color: 'text-sky-400' },
                        { id: 'etospay', name: 'ETOSPay', color: 'text-amber-400' },
                        { id: 'cred', name: 'CRED Pay', color: 'text-rose-400' },
                        { id: 'any', name: 'Any UPI App', color: 'text-white' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id as any)}
                          className={`p-2 rounded-xl text-[10px] font-bold border transition-all truncate text-center ${
                            selectedUpiApp === app.id
                              ? 'bg-[#242C28] border-[#C2D66E] text-white shadow-sm ring-1 ring-[#C2D66E]'
                              : 'bg-[#1A221E] border-[#2C3631] text-[#8E9B94] hover:text-white'
                          }`}
                        >
                          <span className={app.color}>●</span> {app.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payer Corporate UPI ID */}
                  <div>
                    <label className="text-[11px] text-[#8E9B94] block mb-1 font-semibold">
                      Buyer Registered VPA / UPI ID:
                    </label>
                    <input
                      type="text"
                      value={customBuyerVpa}
                      onChange={(e) => setCustomBuyerVpa(e.target.value)}
                      className="w-full bg-[#1A221E] border border-[#2C3631] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-[#C2D66E] focus:outline-none"
                    />
                  </div>

                  {/* Copy Intent String */}
                  <div>
                    <span className="text-[10px] text-[#8E9B94] block mb-1">
                      Raw UPI Payment String (Deep Link):
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={upiIntentString}
                        className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-2.5 py-1 text-[10px] text-[#8E9B94] font-mono truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopyUpiString}
                        className="px-2.5 py-1 rounded-xl bg-[#242C28] hover:bg-[#2C3631] text-[10px] text-white border border-[#2C3631] flex items-center gap-1 shrink-0"
                      >
                        {copiedUpiString ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedUpiString ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Big Trigger Simulation Button */}
                  <div className="pt-1">
                    {simulatedStep === 'idle' && (
                      <button
                        type="button"
                        onClick={handleStartUpiSimulation}
                        className="w-full py-3 px-4 rounded-2xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Simulate App Scan & Instant Settle</span>
                      </button>
                    )}

                    {simulatedStep === 'scanning' && (
                      <div className="p-3 bg-[#242C28] rounded-2xl border border-emerald-500/50 flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold">
                        <RefreshCw className="w-4 h-4" />
                        <span>Scanning Bharat QR on Mobile Device...</span>
                      </div>
                    )}

                    {simulatedStep === 'verifying_npci' && (
                      <div className="p-3 bg-[#242C28] rounded-2xl border border-[#C2D66E]/50 flex items-center justify-center gap-2 text-xs text-[#C2D66E] font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>NPCI Gateway Authorizing Bank Switch...</span>
                      </div>
                    )}

                    {simulatedStep === 'entering_mpin' && (
                      <div className="p-3 bg-[#242C28] rounded-2xl border border-purple-500/50 flex items-center justify-center gap-2 text-xs text-purple-300 font-bold">
                        <Lock className="w-4 h-4" />
                        <span>6-Digit UPI MPIN Verified ({mpinInput})</span>
                      </div>
                    )}

                    {simulatedStep === 'settled' && (
                      <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Payment Settled & Contract Updated!</span>
                        </div>
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-3 py-1 bg-emerald-400 text-black text-[11px] rounded-lg font-bold"
                        >
                          View Contract
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: STANDARD TRIPARTITE BANK ESCROW */}
          {selectedMethod === 'bank_escrow' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#2C3631]">
                  <ShieldCheck className="w-4 h-4 text-[#C2D66E]" />
                  <span className="font-bold text-white">Tripartite Agri Bank Escrow Configuration</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#8E9B94] block mb-1">Select Nodal Escrow Vault</label>
                    <select
                      value={selectedEscrowBank}
                      onChange={(e) => setSelectedEscrowBank(e.target.value)}
                      className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
                    >
                      <option value="ICICI Bank Agri Nodal Escrow">ICICI Bank Agri Nodal (IFSC: ICIC0000011)</option>
                      <option value="State Bank of India Krishi Escrow">State Bank of India Krishi Escrow (IFSC: SBIN0001201)</option>
                      <option value="HDFC Bank Rural Treasury Nodal">HDFC Bank Rural Treasury (IFSC: HDFC0000018)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#8E9B94] block mb-1">Escrow Deposit Structure</label>
                    <select
                      value={escrowDepositType}
                      onChange={(e) => setEscrowDepositType(e.target.value as any)}
                      className="w-full bg-[#121815] border border-[#2C3631] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
                    >
                      <option value="full_100">100% Full Lock (₹{totalAmount.toLocaleString('en-IN')})</option>
                      <option value="token_20">20% Booking Advance (₹{Math.round(totalAmount * 0.2).toLocaleString('en-IN')}) + 80% on Dispatch</option>
                    </select>
                  </div>
                </div>

                {/* Escrow Rule Conditions */}
                <div className="p-3 bg-[#121815] rounded-xl border border-[#2C3631] space-y-2">
                  <span className="font-bold text-white block text-[11px]">
                    Automatic Escrow Release Criteria:
                  </span>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[#8E9B94]">
                      <input
                        type="checkbox"
                        checked={escrowConditionsChecked.weightSlip}
                        onChange={(e) =>
                          setEscrowConditionsChecked({ ...escrowConditionsChecked, weightSlip: e.target.checked })
                        }
                        className="w-3.5 h-3.5 rounded text-[#C2D66E] bg-[#1A221E] border-[#2C3631] accent-[#C2D66E] cursor-pointer"
                      />
                      <span>APMC / Warehouse electronic weighbridge gross and tare slips verified.</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-[#8E9B94]">
                      <input
                        type="checkbox"
                        checked={escrowConditionsChecked.qcVerified}
                        onChange={(e) =>
                          setEscrowConditionsChecked({ ...escrowConditionsChecked, qcVerified: e.target.checked })
                        }
                        className="w-3.5 h-3.5 rounded text-[#C2D66E] bg-[#1A221E] border-[#2C3631] accent-[#C2D66E] cursor-pointer"
                      />
                      <span>Quality inspection parameter certified ({contract.inspectionScore || 'Grade A+'}).</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-[#8E9B94]">
                      <input
                        type="checkbox"
                        checked={escrowConditionsChecked.disbursementAuto}
                        onChange={(e) =>
                          setEscrowConditionsChecked({ ...escrowConditionsChecked, disbursementAuto: e.target.checked })
                        }
                        className="w-3.5 h-3.5 rounded text-[#C2D66E] bg-[#1A221E] border-[#2C3631] accent-[#C2D66E] cursor-pointer"
                      />
                      <span>Real-time release directly into farmer FPO bank account upon gate receipt.</span>
                    </label>
                  </div>
                </div>

                {/* Escrow Trigger */}
                <div className="pt-2">
                  {simulatedStep === 'idle' && (
                    <button
                      type="button"
                      onClick={handleStartEscrowSimulation}
                      className="w-full py-3 px-4 rounded-2xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Lock ₹{totalAmount.toLocaleString('en-IN')} in Tripartite Escrow</span>
                    </button>
                  )}

                  {simulatedStep === 'verifying_npci' && (
                    <div className="p-3 bg-[#242C28] rounded-2xl border border-[#C2D66E]/50 flex items-center justify-center gap-2 text-xs text-[#C2D66E] font-bold">
                      <RefreshCw className="w-4 h-4" />
                      <span>Creating Tripartite Nodal Vault Contract with {selectedEscrowBank}...</span>
                    </div>
                  )}

                  {simulatedStep === 'settled' && (
                    <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Escrow Vault Funded & Locked Successfully!</span>
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1 bg-emerald-400 text-black text-[11px] rounded-lg font-bold"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: OTHER INSTITUTIONAL CHANNELS (LC / RTGS / CREDIT LINE) */}
          {selectedMethod === 'other_methods' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'letter_of_credit', name: 'Letter of Credit (LC)', icon: Landmark, color: 'text-emerald-400' },
                  { id: 'rtgs_neft', name: 'RTGS Virtual Account', icon: CreditCard, color: 'text-emerald-400' },
                  { id: 'buyer_credit_line', name: 'NABARD Credit Line', icon: Building2, color: 'text-emerald-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSecondaryMethod(item.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        secondaryMethod === item.id
                          ? 'bg-[#242C28] border-[#C2D66E] text-white shadow-md'
                          : 'bg-[#1A221E] border-[#2C3631] text-[#8E9B94] hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.color} mb-1.5`} />
                      <span className="text-xs font-bold block">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-form for selected secondary method */}
              <div className="p-4 bg-[#1A221E] border border-[#2C3631] rounded-2xl space-y-3 text-xs">
                {secondaryMethod === 'letter_of_credit' && (
                  <div className="space-y-2">
                    <span className="font-bold text-emerald-300 block">60-Day Commercial Sight LC</span>
                    <p className="text-[#8E9B94] text-[11px]">
                      Irrevocable letter of credit backed by State Bank of India Commercial Branch against export Bill of Lading.
                    </p>
                  </div>
                )}
                {secondaryMethod === 'rtgs_neft' && (
                  <div className="space-y-2">
                    <span className="font-bold text-emerald-300 block">Corporate RTGS Virtual Account (VAN)</span>
                    <p className="text-[#8E9B94] text-[11px]">
                      Route payment directly through Virtual Account <strong className="text-white font-mono">ICIC0000011-KM-{contract.id}</strong>.
                    </p>
                  </div>
                )}
                {secondaryMethod === 'buyer_credit_line' && (
                  <div className="space-y-2">
                    <span className="font-bold text-emerald-300 block">NABARD Pre-Approved Buyer Credit Line</span>
                    <p className="text-[#8E9B94] text-[11px]">
                      15-day 0% interest trade credit line for retail and supermarket procurement partners.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const updatedContract: OrderContract = {
                      ...contract,
                      status: 'Escrow Funded',
                      escrowStatus: `Secured via ${secondaryMethod.replace(/_/g, ' ').toUpperCase()}`,
                      paymentDetails: {
                        method: secondaryMethod,
                        methodLabel: secondaryMethod === 'letter_of_credit' ? 'Commercial Letter of Credit (LC)' : secondaryMethod === 'rtgs_neft' ? 'Corporate RTGS Wire' : 'NABARD Credit Line',
                        transactionRefId: `TXN-${Date.now().toString().slice(-8)}`,
                        utrNumber: `INST-${Date.now().toString().slice(-8)}`,
                        paidAmountINR: totalAmount,
                        paymentTimestamp: new Date().toLocaleDateString('en-IN'),
                        paymentStatus: secondaryMethod === 'letter_of_credit' ? 'LC Verified by Bank' : 'Escrow Secured',
                        buyerGstNumber: contract.paymentDetails?.buyerGstNumber || '27AABCU9603R1ZM',
                        invoiceNumber: `TAX-${contract.id.replace('CTR-', '')}`,
                      },
                    };
                    onPaymentSuccess(updatedContract);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider shadow-md transition-all mt-2"
                >
                  Apply {secondaryMethod.replace(/_/g, ' ').toUpperCase()} Checkout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#1A221E] border-t border-[#2C3631] flex items-center justify-between text-xs">
          <span className="text-[#8E9B94] hidden sm:block text-[11px]">
            Protected by KisanMitra Direct Farmer Payout Guarantee (RBI / NPCI Compliant)
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#242C28] hover:bg-[#2C3631] text-white font-bold text-xs uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
