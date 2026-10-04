import React, { useState } from 'react';
import { X, Building2, TrendingUp, Sparkles, ShieldCheck, MapPin, Truck, CheckCircle2, DollarSign, Radio } from 'lucide-react';
import { BulkBuyerProfile, CropCategory, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface PostBulkDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDemand: (demand: BulkBuyerProfile) => void;
  currentLanguage: LanguageCode;
}

const companyPresets = [
  { name: 'Haldiram Snack Foods & Agri Procurement', type: 'Food Processing' as const, logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=120&q=80' },
  { name: 'ITC Agri Business & Aashirvaad', type: 'Food Processing' as const, logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=120&q=80' },
  { name: 'PepsiCo Agri Direct Farm Sourcing', type: 'Food Processing' as const, logo: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=120&q=80' },
  { name: 'Dabur Herbal & Natural Puree Unit', type: 'Food Processing' as const, logo: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=120&q=80' },
  { name: 'Vadilal Dairy & Fruit Processing Unit', type: 'Food Processing' as const, logo: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=120&q=80' },
  { name: 'BigBasket Wholesale Agritech', type: 'Supermarket Chain' as const, logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80' },
  { name: 'Reliance Fresh Direct Farm Link', type: 'Supermarket Chain' as const, logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=120&q=80' },
  { name: 'DMart Agri B2B Procurement Hub', type: 'Supermarket Chain' as const, logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=120&q=80' },
  { name: 'Gulf & Europe Agri Exports Ltd.', type: 'Exporter' as const, logo: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=120&q=80' },
  { name: 'Zomato Hyperpure & Swiggy Instamart', type: 'HoReCa Buyer' as const, logo: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=120&q=80' },
];

export const PostBulkDemandModal: React.FC<PostBulkDemandModalProps> = ({
  isOpen,
  onClose,
  onAddDemand,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  const [companyName, setCompanyName] = useState('BigBasket Wholesale Agritech');
  const [buyerType, setBuyerType] = useState<BulkBuyerProfile['type']>('Supermarket Chain');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80');
  const [requiredCrop, setRequiredCrop] = useState('');
  const [cropCategory, setCropCategory] = useState<CropCategory>('fruits');
  const [neededQtyTons, setNeededQtyTons] = useState('');
  const [offeredPricePerKg, setOfferedPricePerKg] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Pune & Mumbai Central Fulfillment Hubs');
  const [paymentTerms, setPaymentTerms] = useState<BulkBuyerProfile['paymentTerms']>('100% Escrow on Dispatch');
  const [urgency, setUrgency] = useState<BulkBuyerProfile['urgency']>('This Week');
  const [contactPerson, setContactPerson] = useState('Procurement Lead (Agri)');
  const [contactPhone, setContactPhone] = useState('+91 98900 12345');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof companyPresets[0]) => {
    setCompanyName(preset.name);
    setBuyerType(preset.type);
    setLogo(preset.logo);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredCrop.trim() || !neededQtyTons || !offeredPricePerKg || !deliveryLocation.trim()) {
      return;
    }

    const newDemand: BulkBuyerProfile = {
      id: `buyer-demand-${Date.now()}`,
      companyName,
      type: buyerType,
      logo,
      verifiedBuyerBadge: true,
      requiredCrop: requiredCrop.trim(),
      cropCategory,
      neededQtyTons: parseFloat(neededQtyTons),
      offeredPricePerKg: parseFloat(offeredPricePerKg),
      deliveryLocation: deliveryLocation.trim(),
      paymentTerms,
      contactPerson,
      contactPhone,
      urgency,
      status: 'active',
      markedYieldIds: [],
      createdAt: new Date().toISOString(),
    };

    onAddDemand(newDemand);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1A221E] border border-[#C2D66E]/40 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-[#E5E9E7] p-5 sm:p-7 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#242C28] text-[#8E9B94] hover:text-white hover:bg-[#2C3631] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#C2D66E]/15 border border-[#C2D66E]/40 text-[#C2D66E] flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C2D66E] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              B2B Institutional Procurement & Food Brand Sourcing
            </span>
            <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-white tracking-tight">
              {t.postDemandRequirement}
            </h2>
            <p className="text-[11px] text-[#8E9B94] mt-0.5">
              Instantly broadcasted & visible to all Farmers, FPOs, Buyers, Supermarkets & Food Brands across India.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Preset Company Quick Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider">
              Quick Select Buyer Company
            </label>
            <div className="flex flex-wrap gap-2">
              {companyPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    companyName === preset.name
                      ? 'bg-[#C2D66E] text-[#0F1411] border-[#C2D66E] font-bold shadow-md'
                      : 'bg-[#242C28] text-[#D4E4BC] border-[#2C3631] hover:border-[#8E9B94]'
                  }`}
                >
                  <img src={preset.logo} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                  <span>{preset.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Company Name & Buyer Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Company / Buyer Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. BigBasket, ITC, Reliance Fresh"
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Buyer Type
              </label>
              <select
                value={buyerType}
                onChange={(e) => setBuyerType(e.target.value as any)}
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none"
              >
                <option value="Supermarket Chain">Supermarket Chain (BigBasket, Reliance)</option>
                <option value="Exporter">Exporter (Gulf, Europe, SE Asia)</option>
                <option value="Food Processing">Food Processing (Haldiram, ITC, Dabur)</option>
                <option value="HoReCa Buyer">HoReCa Hotel & Restaurant Chain</option>
                <option value="FPO Aggregator">FPO Aggregator / Cluster Lead</option>
                <option value="Agri-Tech Startup">Agri-Tech Startup & Quick-Commerce</option>
                <option value="Mandi Commission Agent">Direct Mandi Commission Partner</option>
              </select>
            </div>
          </div>

          {/* Required Crop & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Required Crop / Yield *
              </label>
              <input
                type="text"
                required
                value={requiredCrop}
                onChange={(e) => setRequiredCrop(e.target.value)}
                placeholder="e.g. Red Velvet Dragon Fruit, Export Onions"
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Crop Category
              </label>
              <select
                value={cropCategory}
                onChange={(e) => setCropCategory(e.target.value as CropCategory)}
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none"
              >
                <option value="fruits">Fruits (ड्रॅगन फ्रूट, आंबा, द्राक्षे)</option>
                <option value="vegetables">Vegetables (कांदा, टोमॅटो, लसूण)</option>
                <option value="exotic">Exotic & New-Edge (Avocado, Berries)</option>
                <option value="spices">Spices & Herbs (केसर, वेलची, हळद)</option>
                <option value="grains">Grains & Pulses (काळा गहू, बाजरी)</option>
                <option value="organic">100% Certified Organic</option>
              </select>
            </div>
          </div>

          {/* Quantity & Offered Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Target Volume (Tons) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={neededQtyTons}
                onChange={(e) => setNeededQtyTons(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Offered Price per Kg (₹/kg) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={offeredPricePerKg}
                onChange={(e) => setOfferedPricePerKg(e.target.value)}
                placeholder="e.g. 165"
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none font-bold text-[#C2D66E]"
              />
            </div>
          </div>

          {/* Delivery Hub & Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Delivery Location / Hub *
              </label>
              <input
                type="text"
                required
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="e.g. Navi Mumbai Cold Storage, Pune Hub"
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as any)}
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none"
              >
                <option value="100% Escrow on Dispatch">100% Escrow on Dispatch</option>
                <option value="Instant QR on Weighment">Instant QR on Weighment</option>
                <option value="3 Days T+1">3 Days T+1 Direct Bank RTGS</option>
                <option value="Letter of Credit (LC)">Letter of Credit (Export Trade LC)</option>
              </select>
            </div>
          </div>

          {/* Timeline & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Procurement Timeline
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none"
              >
                <option value="Immediate">Immediate / Ready Stock</option>
                <option value="This Week">Within This Week</option>
                <option value="Next 15 Days">Within Next 15 Days</option>
                <option value="Harvest Season Contract">Pre-Harvest Seasonal Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider mb-1">
                Contact Phone / Desk
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98900 12345"
                className="w-full bg-[#242C28] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>
          </div>

          {/* Universal Broadcast Notice */}
          <div className="bg-[#242C28] border border-[#C2D66E]/40 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#C2D66E]/20 text-[#C2D66E] flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-[#C2D66E] animate-pulse" />
            </div>
            <p className="text-[11px] text-[#D4E4BC] leading-relaxed">
              <strong className="text-[#C2D66E]">Broadcast Visibility:</strong> Upon posting, your requirement is immediately broadcasted to all 1,200+ Farmers, FPO clusters, Supermarket Buyers, and Food Processing Brands. Farmers can fulfill directly with their matching harvest.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C3631]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#2C3631] text-[#8E9B94] hover:text-white hover:bg-[#242C28] font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Post Requirement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
