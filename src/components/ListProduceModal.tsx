import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, CheckCircle2, ShieldCheck, MapPin, DollarSign, Calendar, Info, UserCheck, ChevronDown, Radio, Trash2 } from 'lucide-react';
import { CropCategory, LanguageCode, ProduceListing, UserProfile } from '../types';
import { translations } from '../utils/translations';
import confetti from 'canvas-confetti';

const SAVED_FARMER_INFO_KEY = 'kisan_persistent_farmer_info';

interface ListProduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (listing: ProduceListing) => void;
  currentLanguage: LanguageCode;
  currentUser?: UserProfile | null;
}

export const ListProduceModal: React.FC<ListProduceModalProps> = ({
  isOpen,
  onClose,
  onAddListing,
  currentLanguage,
  currentUser,
}) => {
  const t = translations[currentLanguage];

  // Helper to retrieve saved farmer info
  const getInitialFarmerInfo = () => {
    try {
      const saved = localStorage.getItem(SAVED_FARMER_INFO_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  };

  const savedFarmer = getInitialFarmerInfo();

  const [cropName, setCropName] = useState('Dragon Fruit (Red Velvet)');
  const [cropCategory, setCropCategory] = useState<CropCategory>('exotic');
  const [variety, setVariety] = useState('Kamalam Red Flesh Grade 1');
  const [availableQtyTons, setAvailableQtyTons] = useState('5.0');
  const [minOrderQtyKg, setMinOrderQtyKg] = useState('200');
  const [expectedPricePerKg, setExpectedPricePerKg] = useState('145');
  const [qualityGrade, setQualityGrade] = useState<'Export Grade A+' | 'Grade A' | 'Grade B' | 'Organic Certified'>('Export Grade A+');
  const [location, setLocation] = useState(
    savedFarmer?.location || currentUser?.villageOrDistrict || 'Baramati, Pune'
  );
  const [state, setState] = useState(
    savedFarmer?.state || currentUser?.state || 'Maharashtra'
  );
  const [district, setDistrict] = useState(
    savedFarmer?.district || (currentUser?.villageOrDistrict ? currentUser.villageOrDistrict.split(',').pop()?.trim() : 'Pune')
  );
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isOrganic, setIsOrganic] = useState(true);
  const [description, setDescription] = useState('Farm-fresh direct harvest, zero pesticide residue, trellis pole grown with high brix sweetness.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=600&q=80');
  const [sellerName, setSellerName] = useState(
    savedFarmer?.sellerName || currentUser?.farmName || currentUser?.name || 'Suresh Patil Agro Farm'
  );
  const [sellerType, setSellerType] = useState<'Farmer' | 'FPO Cooperative' | 'Organic Cluster'>(
    savedFarmer?.sellerType || 'Farmer'
  );

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      const saved = getInitialFarmerInfo();
      if (!saved) {
        if (currentUser.name || currentUser.farmName) {
          setSellerName(currentUser.farmName || currentUser.name);
        }
        if (currentUser.villageOrDistrict) {
          setLocation(currentUser.villageOrDistrict);
          setDistrict(currentUser.villageOrDistrict.split(',').pop()?.trim() || 'Pune');
        }
        if (currentUser.state) {
          setState(currentUser.state);
        }
      }
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleClearSavedFarmerInfo = () => {
    try {
      localStorage.removeItem(SAVED_FARMER_INFO_KEY);
      setSellerName(currentUser?.farmName || currentUser?.name || 'Suresh Patil Agro Farm');
      setLocation(currentUser?.villageOrDistrict || 'Baramati, Pune');
      setState(currentUser?.state || 'Maharashtra');
      setDistrict('Pune');
      setSellerType('Farmer');
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist farmer information in localStorage so it remains the same until explicitly deleted or updated
    try {
      localStorage.setItem(
        SAVED_FARMER_INFO_KEY,
        JSON.stringify({
          sellerName: sellerName.trim(),
          sellerType,
          location: location.trim(),
          state: state.trim(),
          district: district.trim(),
          contactNumber: currentUser?.phone || '',
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Failed to save farmer persistent info:', e);
    }

    const newListing: ProduceListing = {
      id: `prod-${Date.now()}`,
      sellerId: currentUser?.id || `user-${Date.now()}`,
      sellerName: sellerName.trim(),
      sellerType,
      location: location.trim(),
      state: state.trim(),
      district: district.trim(),
      cropName,
      cropCategory,
      variety,
      availableQtyTons: parseFloat(availableQtyTons) || 1,
      minOrderQtyKg: parseFloat(minOrderQtyKg) || 100,
      expectedPricePerKg: parseFloat(expectedPricePerKg) || 100,
      currentMandiPricePerKg: Math.round((parseFloat(expectedPricePerKg) || 100) * 0.85),
      qualityGrade,
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      shelfLifeDays: 30,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=600&q=80',
      isOrganic,
      fpoVerified: sellerType === 'FPO Cooperative',
      isSold: false,
      status: 'active',
      activeBidsCount: 1,
      highestBidPerKg: parseFloat(expectedPricePerKg),
      description,
      batchQrCode: `KS-${cropCategory.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`,
      labReportScore: 97,
      coordinates: { lat: 18.1517, lng: 74.5772 },
    };

    onAddListing(newListing);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onClose();
  };

  const sampleImages = [
    { label: 'Dragon Fruit', url: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=600&q=80' },
    { label: 'Pomegranate', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80' },
    { label: 'Grapes', url: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=600&q=80' },
    { label: 'Red Onion', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80' },
    { label: 'Devgad Mango', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80' },
    { label: 'Jaggery Gur', url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80' },
  ];

  const GENUINE_YIELD_TEMPLATES = [
    {
      label: '🌵 Red Dragon Fruit',
      seller: 'Patil Organic Orchards',
      sellerType: 'Farmer' as const,
      crop: 'Dragon Fruit (Red Velvet Flesh - Kamalam)',
      category: 'exotic' as CropCategory,
      variety: 'Kamalam Red Grade 1',
      qty: '12.5',
      minQty: '250',
      price: '145',
      location: 'Baramati, Pune',
      state: 'Maharashtra',
      district: 'Pune',
      shelfLife: '15',
      organic: true,
      grade: 'Export Grade A+' as const,
      image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=600&q=80',
      desc: 'High brix sweetness (>15.8%), farm-gate pre-cooled, trellised concrete pole grown with zero synthetic pesticide residue.'
    },
    {
      label: '🍎 Bhagwa Pomegranate',
      seller: 'Mayank Patil (Patil Precision Agri)',
      sellerType: 'Farmer' as const,
      crop: 'Bhagwa Export Pomegranates',
      category: 'fruits' as CropCategory,
      variety: 'Bhagwa Super Grade Ruby Arils',
      qty: '16.0',
      minQty: '400',
      price: '150',
      location: 'Solapur & Sangli Belt',
      state: 'Maharashtra',
      district: 'Solapur',
      shelfLife: '45',
      organic: true,
      grade: 'Export Grade A+' as const,
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      desc: 'Deep crimson soft arils, Brix 16.5%, GlobalGAP pre-harvest residue certified, pre-cooled at 5°C packhouse.'
    },
    {
      label: '🧅 Lasalgaon Export Onion',
      seller: 'Dnyaneshwar Krishi Sangh FPO',
      sellerType: 'FPO Cooperative' as const,
      crop: 'Nashik Premium Red Onions (Export Garva)',
      category: 'vegetables' as CropCategory,
      variety: 'Garva Red Medium 50-65mm Size',
      qty: '45.0',
      minQty: '1000',
      price: '32',
      location: 'Lasalgaon & Niphad',
      state: 'Maharashtra',
      district: 'Nashik',
      shelfLife: '90',
      organic: false,
      grade: 'Grade A' as const,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      desc: 'Cured in solar ventilated chawls. 0% rotting, firm multi-layer dry pink skin ideal for long-distance transport & export.'
    },
    {
      label: '🍇 Tasgaon Sonaka Grapes',
      seller: 'Yogita Banore (Banore Organic Harvest)',
      sellerType: 'Farmer' as const,
      crop: 'Export Seedless Table Grapes (Sonaka & Thompson)',
      category: 'fruits' as CropCategory,
      variety: 'Sonaka Super Elongated White Seedless',
      qty: '18.0',
      minQty: '300',
      price: '155',
      location: 'Niphad & Dindori, Nashik',
      state: 'Maharashtra',
      district: 'Nashik',
      shelfLife: '30',
      organic: true,
      grade: 'Export Grade A+' as const,
      image: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=600&q=80',
      desc: 'GlobalGAP certified, zero pesticide residue (APEDA approved), berry length 24mm+, Brix sweetness 18.2%.'
    },
    {
      label: '🥭 Devgad GI Hapus Mango',
      seller: 'Konkan Mango Producers Federation',
      sellerType: 'FPO Cooperative' as const,
      crop: 'Devgad GI-Tagged Alphonso (Hapus) Mangoes',
      category: 'fruits' as CropCategory,
      variety: 'GI Tagged Devgad Alphonso Grade 1',
      qty: '18.0',
      minQty: '500',
      price: '260',
      location: 'Devgad & Ratnagiri',
      state: 'Maharashtra',
      district: 'Sindhudurg',
      shelfLife: '14',
      organic: true,
      grade: 'Export Grade A+' as const,
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      desc: 'Naturally grass-hay ripened without calcium carbide. Intense tropical aroma and smooth fiberless golden pulp.'
    },
    {
      label: '🍯 Kolhapur Organic Jaggery',
      seller: 'Kolhapur Organic Cane Cluster',
      sellerType: 'Organic Cluster' as const,
      crop: 'Kolhapur GI Natural Chemical-Free Jaggery (Gur)',
      category: 'organic' as CropCategory,
      variety: 'Traditional Kolhapuri Organic Block Gur',
      qty: '30.0',
      minQty: '500',
      price: '54',
      location: 'Kolhapur & Karveer',
      state: 'Maharashtra',
      district: 'Kolhapur',
      shelfLife: '365',
      organic: true,
      grade: 'Organic Certified' as const,
      image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
      desc: '100% natural clarifier with okra stem extract, zero sodium hydrosulphite, rich golden caramel color, GI certified.'
    }
  ];

  const applyTemplate = (tpl: typeof GENUINE_YIELD_TEMPLATES[0]) => {
    setCropName(tpl.crop);
    setCropCategory(tpl.category);
    setVariety(tpl.variety);
    setAvailableQtyTons(tpl.qty);
    setMinOrderQtyKg(tpl.minQty);
    setExpectedPricePerKg(tpl.price);
    setQualityGrade(tpl.grade);
    setLocation(tpl.location);
    setState(tpl.state);
    setDistrict(tpl.district);
    setIsOrganic(tpl.organic);
    setDescription(tpl.desc);
    setImageUrl(tpl.image);
    setSellerName(tpl.seller);
    setSellerType(tpl.sellerType);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#E5E9E7]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#151C18] border-b border-[#2C3631] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/15 border border-[#C2D66E]/40 text-[#C2D66E] flex items-center justify-center font-bold shadow-md">
              <Upload className="w-5 h-5 text-[#C2D66E]" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg text-white flex items-center gap-1.5">
                <span className="text-[#C2D66E] not-italic font-bold font-sans text-xl leading-none">+</span>
                <span>{t.listProduce.replace(/^\+\s*/, '')}</span>
              </h3>
              <p className="text-xs text-[#8E9B94]">
                Direct farm-gate harvest listing universally visible to all Farmers, Bulk Buyers, Supermarkets & Food Brands
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#8E9B94] hover:text-[#C2D66E] hover:bg-[#242C28] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          {/* AI Fair Price Banner */}
          <div className="p-4 bg-[#242C28] border border-[#2C3631] rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#C2D66E] shrink-0 mt-0.5" />
            <div className="text-xs text-[#8E9B94]">
              <span className="font-serif font-bold text-[#C2D66E] block mb-0.5">
                AI Direct Pricing Advantage:
              </span>
              Direct selling on KisanMitra bypasses mandi middlemen, giving farmers{' '}
              <span className="text-[#D4E4BC] font-bold">18-25% higher profit</span> while saving buyers 10-15% on wholesale procurement.
            </div>
          </div>

          {/* Genuine Farmer Yield Quick-Fill Templates */}
          <div className="p-3.5 bg-[#151C18] border border-[#C2D66E]/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#C2D66E] flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#C2D66E]" />
                1-Click Genuine Farmer Yield Templates:
              </span>
              <span className="text-[10px] text-[#8E9B94]">Click to auto-populate harvest parameters</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GENUINE_YIELD_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-2.5 py-1 rounded-xl bg-[#242C28] hover:bg-[#C2D66E] hover:text-[#0F1411] text-[#D4E4BC] text-xs font-medium border border-[#2C3631] hover:border-[#C2D66E] transition-all shadow-sm flex items-center gap-1 active:scale-95"
                >
                  <span>{tpl.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">₹{tpl.price}/kg</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seller Name & Type */}
            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1 flex items-center justify-between">
                <span>Seller Name / FPO Name</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#C2D66E] font-medium flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-[#C2D66E]" /> Saved Info Active
                  </span>
                  {savedFarmer && (
                    <button
                      type="button"
                      onClick={handleClearSavedFarmerInfo}
                      className="text-[10px] text-red-400 hover:text-red-300 underline flex items-center gap-0.5 cursor-pointer"
                      title="Clear saved farmer info"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </label>
              <div className="relative flex items-center">
                <input
                  type="search"
                  name="farm_crop_seller_entity"
                  id="farm_crop_seller_entity"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-bwautofill="false"
                  aria-autocomplete="none"
                  spellCheck={false}
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl pl-3.5 pr-10 py-2 text-sm text-white focus:border-[#C2D66E] focus:outline-none appearance-none"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#C2D66E] pointer-events-none" title="Verified Farm Gate">
                  <div className="w-6 h-6 rounded-full bg-[#C2D66E]/15 border border-[#C2D66E]/40 flex items-center justify-center shadow-sm">
                    <UserCheck className="w-3.5 h-3.5 text-[#C2D66E]" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                Seller Entity Type
              </label>
              <div className="relative">
                <select
                  value={sellerType}
                  onChange={(e) => setSellerType(e.target.value as any)}
                  className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl pl-3.5 pr-9 py-2 text-sm text-white focus:border-[#C2D66E] focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Farmer" className="bg-[#1A221E] text-white">Individual Progressive Farmer</option>
                  <option value="FPO Cooperative" className="bg-[#1A221E] text-white">FPO / Farmer Producer Company</option>
                  <option value="Organic Cluster" className="bg-[#1A221E] text-white">Certified Organic Cluster</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#C2D66E] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Crop Name & Category */}
            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                Crop Name & Variety
              </label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Dragon Fruit, Walnut, Avocado"
                className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-sm text-white focus:border-[#C2D66E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  value={cropCategory}
                  onChange={(e) => setCropCategory(e.target.value as any)}
                  className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl pl-3.5 pr-9 py-2 text-sm text-white focus:border-[#C2D66E] focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="exotic" className="bg-[#1A221E] text-white">Exotic & New-Edge (Dragon Fruit, Walnut, Avocado)</option>
                  <option value="fruits" className="bg-[#1A221E] text-white">Fruits</option>
                  <option value="vegetables" className="bg-[#1A221E] text-white">Vegetables</option>
                  <option value="grains" className="bg-[#1A221E] text-white">Grains & Pulses</option>
                  <option value="spices" className="bg-[#1A221E] text-white">Spices & Saffron</option>
                  <option value="organic" className="bg-[#1A221E] text-white">Organic Certified</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#C2D66E] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Quantity & Min Order */}
            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                Total Available Quantity (Metric Tons)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={availableQtyTons}
                onChange={(e) => setAvailableQtyTons(e.target.value)}
                className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-sm text-white focus:border-[#C2D66E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                Minimum Order Quantity (Kg)
              </label>
              <input
                type="number"
                required
                value={minOrderQtyKg}
                onChange={(e) => setMinOrderQtyKg(e.target.value)}
                className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-sm text-white focus:border-[#C2D66E] focus:outline-none"
              />
            </div>

            {/* Expected Price & Quality Grade */}
            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                Expected Price (<span className="text-[#C2D66E] font-bold">₹</span> per Kg)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C2D66E] font-bold text-base select-none">₹</span>
                <input
                  type="number"
                  required
                  value={expectedPricePerKg}
                  onChange={(e) => setExpectedPricePerKg(e.target.value)}
                  className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl pl-8 pr-3.5 py-2 text-sm text-[#C2D66E] focus:border-[#C2D66E] focus:outline-none font-serif font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                Quality Grade
              </label>
              <div className="relative">
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as any)}
                  className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl pl-3.5 pr-9 py-2 text-sm text-white focus:border-[#C2D66E] focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Export Grade A+" className="bg-[#1A221E] text-white">Export Grade A+ (Premium Size & Brix)</option>
                  <option value="Grade A" className="bg-[#1A221E] text-white">Grade A (Supermarket Quality)</option>
                  <option value="Grade B" className="bg-[#1A221E] text-white">Grade B (Standard Processing Quality)</option>
                  <option value="Organic Certified" className="bg-[#1A221E] text-white">Organic Certified (Zero Chemical)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#C2D66E] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Farm Location & Harvest Date & Shelf Life */}
            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                Farm Gate Location / District
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Baramati, Pune"
                className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-sm text-white focus:border-[#C2D66E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
                Harvest Date / कापणी तारीख
              </label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-sm text-white focus:border-[#C2D66E] focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Direct Buyer Demand & Peak Window Matching Notice */}
          <div className="p-3 bg-[#131E18] border border-[#C2D66E]/40 rounded-2xl flex items-start gap-2.5 text-xs text-[#D4E4BC]">
            <div className="w-6 h-6 rounded-lg bg-[#C2D66E]/20 text-[#C2D66E] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              ⚡
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-[#E5E9E7] block">
                {currentLanguage === 'mr'
                  ? 'थेट खरेदीदार मागणी व पीक विंडो मॅचिंग सक्रिय'
                  : currentLanguage === 'hi'
                  ? 'प्रत्यक्ष खरीदार मांग व पीक विंडो मैचिंग सक्रिय'
                  : 'Direct Buyer Demand & Peak Window Matching Active'}
              </span>
              <p className="text-[11px] text-[#8E9B94] leading-relaxed">
                {currentLanguage === 'mr'
                  ? 'आपल्या मालासाठी प्रमाणित मेट्रो खरेदीदारांकडून खरेदी मागणी वाढल्यास तात्काळ पीक विंडो सूचना मिळेल.'
                  : currentLanguage === 'hi'
                  ? 'आपके माल के लिए प्रमाणित खरीदारों से मांग बढ़ने पर तुरंत पीक विंडो नोटिफिकेशन प्राप्त करें।'
                  : 'Automated engine matches your produce with high-bid bulk mart procurement windows and verified corporate buyers.'}
              </p>
            </div>
          </div>

          {/* Organic Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is-organic-check"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              className="w-4 h-4 rounded text-[#C2D66E] bg-[#242C28] border-[#2C3631] focus:ring-[#C2D66E] accent-[#C2D66E] cursor-pointer"
            />
            <label htmlFor="is-organic-check" className="text-xs text-[#E5E9E7] font-medium cursor-pointer">
              100% Naturally Grown / Organic Certified (Fetches 15-20% price premium)
            </label>
          </div>

          {/* Preset Photo Select */}
          <div>
            <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
              Select or Upload Harvest Photo
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {sampleImages.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setImageUrl(img.url)}
                  className={`rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                    imageUrl === img.url ? 'border-[#C2D66E] ring-2 ring-[#C2D66E]/40' : 'border-[#2C3631] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-12 object-cover rounded-xl" />
                  <span className="text-[9px] block text-center text-[#8E9B94] mt-0.5 truncate">{img.label}</span>
                </button>
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or enter image URL"
              className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-xs text-[#E5E9E7] focus:border-[#C2D66E] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#8E9B94] mb-1">
              Harvest Notes / Quality Attributes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2 text-xs text-white focus:border-[#C2D66E] focus:outline-none"
            />
          </div>

          {/* Universal Visibility Guarantee Banner */}
          <div className="p-3.5 bg-[#151C18] border border-[#C2D66E]/40 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#C2D66E]/20 text-[#C2D66E] flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-[#C2D66E] animate-pulse" />
            </div>
            <p className="text-[11px] text-[#D4E4BC] leading-relaxed">
              <strong className="text-[#C2D66E]">Broadcast Visibility:</strong> Once published, this yield is immediately broadcasted to all registered Farmers, Bulk Buyers, Supermarket Chains, and Food Processing Brands across the marketplace.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#2C3631]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#8E9B94] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Listing to Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
