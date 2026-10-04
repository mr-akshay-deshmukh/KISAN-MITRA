import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  X,
  Printer,
  Sparkles,
  MapPin,
  Building2,
  ShieldCheck,
  Phone,
  Layers,
  ExternalLink,
  Smartphone,
  Star,
  Sprout,
  Send,
} from 'lucide-react';
import { LanguageCode, ProduceListing } from '../types';
import { translations } from '../utils/translations';

interface ProduceListingQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ProduceListing | null;
  currentLanguage: LanguageCode;
  onDirectProcure?: (listing: ProduceListing) => void;
}

export const ProduceListingQRModal: React.FC<ProduceListingQRModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentLanguage,
  onDirectProcure,
}) => {
  const t = translations[currentLanguage];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const getShareableUrl = (item: ProduceListing): string => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    return `${origin}/?lotId=${item.id}&crop=${encodeURIComponent(item.cropName)}&seller=${encodeURIComponent(item.sellerName)}&price=${item.expectedPricePerKg}`;
  };

  useEffect(() => {
    if (!listing || !isOpen) return;

    setGenerating(true);
    const url = getShareableUrl(listing);

    // Generate high-resolution QR Code
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0F1411',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
        setGenerating(false);
      })
      .catch((err) => {
        console.error('QR code generation failed:', err);
        setGenerating(false);
      });
  }, [listing, isOpen]);

  if (!isOpen || !listing) return null;

  const shareUrl = getShareableUrl(listing);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !listing) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `KisanMitra-QR-${listing.cropName.replace(/\s+/g, '_')}-${listing.batchQrCode || listing.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareWhatsApp = () => {
    if (!listing) return;
    const isMr = currentLanguage === 'mr';
    const isHi = currentLanguage === 'hi';

    const msg = isMr
      ? `🌾 *किसानमित्र थेट शेतमाल लॉट*\n\n🌿 *पीक:* ${listing.cropName}\n📍 *स्थान:* ${listing.location}\n⚖️ *उपलब्ध प्रमाण:* ${listing.availableQtyTons} टन (किमान: ${listing.minOrderQtyKg} किलो)\n💰 *किंमत:* ₹${listing.expectedPricePerKg}/किलो (मंडी भाव: ₹${listing.currentMandiPricePerKg})\n🧪 *लॅब प्युरिटी:* ${listing.labReportScore}/100\n👨‍🌾 *शेतकरी/FPO:* ${listing.sellerName}\n\n📲 *थेट खरेदी व तपशील पाहण्यासाठी खालील QR लिंक स्कॅन/ओपन करा:*\n${shareUrl}`
      : isHi
      ? `🌾 *किसानमित्र डायरेक्ट फार्म लॉट*\n\n🌿 *फसल:* ${listing.cropName}\n📍 *स्थान:* ${listing.location}\n⚖️ *मात्रा:* ${listing.availableQtyTons} टन\n💰 *दाम:* ₹${listing.expectedPricePerKg}/किलो\n🧪 *लैब स्कोर:* ${listing.labReportScore}/100\n👨‍🌾 *विक्रेता:* ${listing.sellerName}\n\n📲 *सीधी खरीद हेतु लिंक खोलें:*\n${shareUrl}`
      : `🌾 *KisanMitra Verified Farm Harvest Lot*\n\n🌿 *Crop:* ${listing.cropName}\n📍 *Location:* ${listing.location}\n⚖️ *Available:* ${listing.availableQtyTons} Tons\n💰 *Direct Farmgate Price:* ₹${listing.expectedPricePerKg}/kg (Mandi: ₹${listing.currentMandiPricePerKg})\n🧪 *Lab Certified Purity:* ${listing.labReportScore}/100\n👨‍🌾 *Seller:* ${listing.sellerName}\n\n📲 *Scan QR or open direct procurement link:*\n${shareUrl}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-[#141C17] border border-[#C2D66E]/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-[#E5E9E7] my-auto overflow-hidden ring-1 ring-[#C2D66E]/20"
        >
          {/* Header Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-[#C2D66E]/15 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#1F2A23] hover:bg-[#2C3B32] text-[#8E9B94] hover:text-[#E5E9E7] transition-all cursor-pointer z-10"
            aria-label="Close QR Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#C2D66E]/20 border border-[#C2D66E]/50 flex items-center justify-center text-[#C2D66E] shadow-inner shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic font-bold text-lg sm:text-xl text-[#D4E4BC]">
                  {currentLanguage === 'mr'
                    ? 'शेतमाल QR कोड व शेअर लिंक'
                    : currentLanguage === 'hi'
                    ? 'फसल QR कोड एवं शेयर लिंक'
                    : 'Produce Lot QR Code & Share'}
                </h3>
                <span className="bg-[#C2D66E]/20 text-[#C2D66E] border border-[#C2D66E]/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Offline Ready
                </span>
              </div>
              <p className="text-xs text-[#8E9B94] mt-0.5">
                {currentLanguage === 'mr'
                  ? 'हा QR कोड व्यापारी व खरेदीदारांना दाखवा किंवा थेट व्हॉट्सॲपवर पाठवा'
                  : 'Scan with any smartphone camera to view lab purity, price, and place instant escrow bids.'}
              </p>
            </div>
          </div>

          {/* Printable / Scannable Card Container */}
          <div
            ref={printableRef}
            className="bg-[#0D1410] border-2 border-[#233529] rounded-2xl p-4 sm:p-5 mb-4 relative overflow-hidden shadow-inner"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* QR Image Box */}
              <div className="relative shrink-0 flex flex-col items-center">
                <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-[#C2D66E] flex items-center justify-center relative">
                  {generating || !qrDataUrl ? (
                    <div className="w-44 h-44 flex flex-col items-center justify-center text-[#0F1411]">
                      <div className="w-8 h-8 border-3 border-[#0F1411] border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-[11px] font-bold">Generating QR...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={qrDataUrl}
                        alt={`QR Code for ${listing.cropName}`}
                        className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                      />
                      {/* Center Brand Badge */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#0F1411] border-2 border-[#C2D66E] flex items-center justify-center shadow-lg">
                        <Sprout className="w-5 h-5 text-[#C2D66E]" />
                      </div>
                    </div>
                  )}
                </div>

                <span className="mt-2 text-[10px] uppercase font-bold tracking-widest text-[#C2D66E] bg-[#16231C] px-2.5 py-0.5 rounded-full border border-[#273B2E]">
                  Batch: {listing.batchQrCode || `KM-${listing.id.toUpperCase()}`}
                </span>
              </div>

              {/* Crop & Lot Information */}
              <div className="flex-1 w-full space-y-2.5 text-xs">
                <div className="border-b border-[#233529] pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#8E9B94] font-medium">
                      {listing.sellerType} Listing
                    </span>
                    <div className="flex items-center gap-1.5">
                      {listing.isOrganic && (
                        <span className="bg-[#C2D66E] text-[#0F1411] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          Organic
                        </span>
                      )}
                      {listing.fpoVerified && (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                          FPO Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-serif italic font-bold text-xl text-[#D4E4BC] tracking-tight mt-0.5">
                    {listing.cropName}
                  </h4>
                  <p className="text-[11px] text-[#A6B5AD] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C2D66E] shrink-0" />
                    <span>{listing.location}</span>
                  </p>
                </div>

                {/* Lot Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#141E18] p-2 rounded-xl border border-[#233529]">
                    <span className="text-[9px] uppercase tracking-wider text-[#8E9B94] block">Farmgate Price</span>
                    <span className="font-extrabold text-[#C2D66E] text-base">
                      ₹{listing.expectedPricePerKg}
                      <span className="text-[10px] text-[#8E9B94] font-normal"> / kg</span>
                    </span>
                    <span className="text-[9px] text-[#8E9B94] block">Mandi: ₹{listing.currentMandiPricePerKg}/kg</span>
                  </div>

                  <div className="bg-[#141E18] p-2 rounded-xl border border-[#233529]">
                    <span className="text-[9px] uppercase tracking-wider text-[#8E9B94] block">Available Lot</span>
                    <span className="font-extrabold text-[#E5E9E7] text-base">
                      {listing.availableQtyTons}
                      <span className="text-[10px] text-[#8E9B94] font-normal"> Tons</span>
                    </span>
                    <span className="text-[9px] text-[#8E9B94] block">Min: {listing.minOrderQtyKg} kg</span>
                  </div>

                  <div className="bg-[#141E18] p-2 rounded-xl border border-[#233529]">
                    <span className="text-[9px] uppercase tracking-wider text-[#8E9B94] block">Lab Purity</span>
                    <span className="font-bold text-emerald-400">
                      {listing.labReportScore}/100
                    </span>
                    <span className="text-[9px] text-[#8E9B94] block">Govt/NABL Tested</span>
                  </div>

                  <div className="bg-[#141E18] p-2 rounded-xl border border-[#233529]">
                    <span className="text-[9px] uppercase tracking-wider text-[#8E9B94] block">Seller Contact</span>
                    <span className="font-bold text-[#E5E9E7] truncate block">
                      {listing.sellerName}
                    </span>
                    <span className="text-[9px] text-[#8E9B94] block">{listing.sellerPhone || 'Verified Farmer'}</span>
                  </div>
                </div>

                <div className="bg-[#16221A] p-2 rounded-xl border border-[#2C3E32] flex items-center gap-2 text-[11px] text-[#9EAEA5]">
                  <Sparkles className="w-4 h-4 text-[#C2D66E] shrink-0" />
                  <span>Scanning opens instant contract escrow procurement with zero middlemen commission.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {/* Share to WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="Share Lot on WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-[#202C25] hover:bg-[#2C3C33] text-[#D4E4BC] border border-[#33463B] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {/* Download PNG */}
            <button
              type="button"
              onClick={handleDownloadQR}
              disabled={!qrDataUrl}
              className="py-2.5 px-3 rounded-xl bg-[#202C25] hover:bg-[#2C3C33] text-[#D4E4BC] border border-[#33463B] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Download PNG for Print / Sticker"
            >
              <Download className="w-3.5 h-3.5 text-[#C2D66E]" />
              <span>Save PNG</span>
            </button>

            {/* Print Slip */}
            <button
              type="button"
              onClick={handlePrintSlip}
              className="py-2.5 px-3 rounded-xl bg-[#202C25] hover:bg-[#2C3C33] text-[#D4E4BC] border border-[#33463B] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Print Packhouse Crate Label"
            >
              <Printer className="w-3.5 h-3.5 text-[#C2D66E]" />
              <span>Print Slip</span>
            </button>
          </div>

          {/* Footer Direct Procure & Close */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#233529]">
            <span className="text-[11px] text-[#8E9B94] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C2D66E]" />
              <span>KisanMitra Verified Traceable Smart QR</span>
            </span>

            <div className="flex items-center gap-2">
              {onDirectProcure && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDirectProcure(listing);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {t.directBuy}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-[#1D2721] hover:bg-[#2B3931] text-[#E5E9E7] text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
