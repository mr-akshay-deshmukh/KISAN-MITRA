import React, { useState } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Filter,
  ShieldCheck,
  Volume2,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Phone,
  MessageSquare,
  Award,
  ShoppingCart,
  Trash2,
  RotateCcw,
  Tag,
  CheckCheck,
  X,
  Star,
  Bookmark,
  BookmarkCheck,
  Building2,
  Clock,
  Layers,
  FileCheck,
  Edit3,
  User,
  Sprout,
  Radio,
  Eye,
  Globe,
  Users,
  Image as ImageIcon,
  Upload,
  Camera,
  Check,
  QrCode,
  Share2,
} from 'lucide-react';
import { CropCategory, LanguageCode, ProduceListing, BulkBuyerProfile, UserRole, WeatherAlert, UserProfile, StockAlert } from '../types';
import { translations } from '../utils/translations';
import { audioSpeech } from '../utils/audioSpeech';
import { WeatherAlertBanner } from './WeatherAlertBanner';
import { ProduceListingQRModal } from './ProduceListingQRModal';
import { StockAlertNotificationCenter } from './StockAlertNotificationCenter';

interface MarketplaceViewProps {
  listings: ProduceListing[];
  bulkBuyers: BulkBuyerProfile[];
  currentLanguage: LanguageCode;
  userRole: UserRole;
  currentUser?: UserProfile | null;
  onOpenProfileEdit?: () => void;
  onOpenListModal: () => void;
  onOpenAddDemandModal?: () => void;
  onSelectListingForBid: (listing: ProduceListing) => void;
  onDeleteListing?: (id: string) => void;
  onToggleMarkSold?: (id: string) => void;
  onToggleMarkYield?: (listingId: string) => void;
  onDeleteBulkBuyerDemand?: (demandId: string) => void;
  onClearAllMarkedYields?: () => void;
  onNavigateTab: (tab: string, contextId?: string) => void;
  weatherAlerts?: WeatherAlert[];
  onOpenWeatherRadar?: () => void;
  stockAlerts?: StockAlert[];
  onApplyDiscount?: (listingId: string, percent: number) => void;
  onDismissStockAlert?: (alertId: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  listings,
  bulkBuyers,
  currentLanguage,
  userRole,
  currentUser,
  onOpenProfileEdit,
  onOpenListModal,
  onOpenAddDemandModal,
  onSelectListingForBid,
  onDeleteListing,
  onToggleMarkSold,
  onToggleMarkYield,
  onDeleteBulkBuyerDemand,
  onClearAllMarkedYields,
  onNavigateTab,
  weatherAlerts = [],
  onOpenWeatherRadar,
  stockAlerts = [],
  onApplyDiscount,
  onDismissStockAlert,
}) => {
  const t = translations[currentLanguage];

  const [selectedCategory, setSelectedCategory] = useState<CropCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'marked' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFpoVerified, setOnlyFpoVerified] = useState(false);
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [listingToDelete, setListingToDelete] = useState<ProduceListing | null>(null);
  const [demandToDelete, setDemandToDelete] = useState<BulkBuyerProfile | null>(null);
  const [selectedListingForQR, setSelectedListingForQR] = useState<ProduceListing | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const martImages = [
    {
      id: 'mandi_hub',
      title: 'Vibrant Kisan Mandi & Produce Mart',
      url: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=1600&q=85',
      badge: '🌾 Kisan Wholesale Mandi & Mart',
    },
    {
      id: 'supermarket',
      title: 'Modern Agritech Supermart & Retail Aisle',
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85',
      badge: '🏪 Supermarket & Retail Terminal',
    },
    {
      id: 'harvest_stalls',
      title: 'Farm-Fresh Organic Harvest Stalls',
      url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=85',
      badge: '🥗 Organic Farmers Mart',
    },
    {
      id: 'organic_crates',
      title: 'Direct Packhouse & Graded Harvest Crates',
      url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1600&q=85',
      badge: '📦 Direct Packhouse Terminal',
    },
    {
      id: 'marketplace_hub',
      title: 'Sahyadri Corridor Agri Bazaar & Farmers Market',
      url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=85',
      badge: '✨ Direct Fair Trade Terminal',
    },
    {
      id: 'vegetable_crates',
      title: 'Fresh Vegetable Harvest & Grading Yard',
      url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1600&q=85',
      badge: '🥦 Farm Harvest Wholesale Yard',
    },
    {
      id: 'spices_bazaar',
      title: 'Indian Traditional Spices & Dry Fruits Bazaar',
      url: 'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=1600&q=85',
      badge: '🌶️ Spices & Dry Fruits Bazaar',
    },
    {
      id: 'greenhouse_mart',
      title: 'Precision Hydroponics & Greenhouse Produce Mart',
      url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=85',
      badge: '🌱 Hi-Tech Greenhouse Mart',
    },
  ];

  const [selectedMartImageIdx, setSelectedMartImageIdx] = useState<number>(() => {
    const saved = localStorage.getItem('kisansetu_selected_mart_idx');
    return saved !== null ? parseInt(saved, 10) || 0 : 0;
  });
  const [customMartImageUrl, setCustomMartImageUrl] = useState<string>(() => {
    return localStorage.getItem('kisansetu_custom_mart_image') || '';
  });
  const [isMartImageModalOpen, setIsMartImageModalOpen] = useState(false);
  const [inputCustomUrl, setInputCustomUrl] = useState('');

  const currentActiveMartImage = customMartImageUrl || martImages[selectedMartImageIdx]?.url || martImages[0].url;
  const currentActiveMartTitle = customMartImageUrl ? 'Custom Uploaded Mart Image' : martImages[selectedMartImageIdx]?.title || 'Agri Mart';
  const currentActiveMartBadge = customMartImageUrl ? '📷 Custom Mart Image' : martImages[selectedMartImageIdx]?.badge || '🏪 Agri Mart';

  const handleSelectPresetImage = (idx: number) => {
    setSelectedMartImageIdx(idx);
    setCustomMartImageUrl('');
    localStorage.setItem('kisansetu_selected_mart_idx', idx.toString());
    localStorage.removeItem('kisansetu_custom_mart_image');
    showToast(`Mart image updated to: ${martImages[idx].title}`);
  };

  const handleApplyCustomUrl = (urlToApply: string) => {
    if (!urlToApply.trim()) return;
    setCustomMartImageUrl(urlToApply.trim());
    localStorage.setItem('kisansetu_custom_mart_image', urlToApply.trim());
    setIsMartImageModalOpen(false);
    setInputCustomUrl('');
    showToast('Custom Mart image applied successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomMartImageUrl(reader.result);
          localStorage.setItem('kisansetu_custom_mart_image', reader.result);
          setIsMartImageModalOpen(false);
          showToast('New Mart photo uploaded and set successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const categories: { id: CropCategory; label: string; icon: string }[] = [
    { id: 'all', label: t.allCrops, icon: '🌿' },
    { id: 'exotic', label: t.exoticCrops, icon: '🥑' },
    { id: 'fruits', label: t.fruits, icon: '🍎' },
    { id: 'vegetables', label: t.vegetables, icon: '🥦' },
    { id: 'grains', label: t.grains, icon: '🌾' },
    { id: 'spices', label: t.spices, icon: '🌶️' },
    { id: 'organic', label: t.organic, icon: '🌱' },
  ];

  const activeCount = listings.filter((l) => !l.isSold && l.status !== 'sold').length;
  const markedCount = listings.filter((l) => !!l.isMarkedByBuyer).length;
  const soldCount = listings.filter((l) => l.isSold || l.status === 'sold').length;

  // Calculate marked yields statistics
  const markedListings = listings.filter((l) => !!l.isMarkedByBuyer);
  const totalMarkedTons = markedListings.reduce((acc, curr) => acc + curr.availableQtyTons, 0);
  const totalMarkedEstimatedValue = markedListings.reduce(
    (acc, curr) => acc + curr.availableQtyTons * 1000 * curr.expectedPricePerKg,
    0
  );

  const filteredListings = listings.filter((item) => {
    const isSold = !!item.isSold || item.status === 'sold';
    const isMarked = !!item.isMarkedByBuyer;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !isSold) ||
      (statusFilter === 'marked' && isMarked) ||
      (statusFilter === 'sold' && isSold);

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'organic' ? item.isOrganic : item.cropCategory === selectedCategory);

    const matchesSearch =
      item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFpo = !onlyFpoVerified || item.fpoVerified;
    const matchesOrganicCheck = !onlyOrganic || item.isOrganic;

    return matchesStatus && matchesCategory && matchesSearch && matchesFpo && matchesOrganicCheck;
  });

  const handleSpeakProduce = (item: ProduceListing) => {
    setActiveAudioId(item.id);

    const isSold = item.isSold || item.status === 'sold';
    const isMarked = !!item.isMarkedByBuyer;
    const statusNote = isSold
      ? currentLanguage === 'mr'
        ? ' हा शेतमाल विक्री झालेला आहे.'
        : currentLanguage === 'hi'
        ? ' यह फसल बिक चुकी है।'
        : ' This lot is sold out.'
      : isMarked
      ? currentLanguage === 'mr'
        ? ' हा शेतमाल मोठ्या खरेदीदारांनी निवडलेला आहे.'
        : currentLanguage === 'hi'
        ? ' यह फसल थोक खरीदारों द्वारा चुनी गई है।'
        : ' This yield is marked by bulk buyers.'
      : '';

    const script =
      currentLanguage === 'mr'
        ? `शेतकरी ${item.sellerName}, ठिकाण ${item.location}. पीक ${item.cropName}, उपलब्ध साठा ${item.availableQtyTons} टन. अपेक्षित भाव ₹${item.expectedPricePerKg} प्रति किलो. प्रतवारी ${item.qualityGrade}.${statusNote}`
        : currentLanguage === 'hi'
        ? `किसान ${item.sellerName}, स्थान ${item.location}. फसल ${item.cropName}, उपलब्ध मात्रा ${item.availableQtyTons} टन. अपेक्षित मूल्य ₹${item.expectedPricePerKg} प्रति किलो. ग्रेड ${item.qualityGrade}.${statusNote}`
        : `Seller ${item.sellerName} from ${item.location}. Crop ${item.cropName}, available harvest ${item.availableQtyTons} Tons at price ₹${item.expectedPricePerKg} per kg. Quality ${item.qualityGrade}.${statusNote}`;

    audioSpeech.speak(
      script,
      currentLanguage,
      undefined,
      () => setActiveAudioId(null),
      () => setActiveAudioId(null)
    );
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 right-4 sm:right-6 z-50 bg-[#1A221E] border border-[#C2D66E] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideIn">
          <div className="w-6 h-6 rounded-full bg-[#C2D66E]/20 text-[#C2D66E] flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <span className="text-xs font-semibold text-[#E5E9E7]">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#8E9B94] hover:text-white text-xs ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Farm Listing Confirmation Modal */}
      {listingToDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A221E] border border-red-500/40 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-[#E5E9E7]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif">{t.deleteListing}</h3>
                <p className="text-xs text-[#8E9B94]">
                  {listingToDelete.cropName} • {listingToDelete.sellerName} ({listingToDelete.location})
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#D4E4BC] leading-relaxed bg-[#242C28] p-3 rounded-2xl border border-[#2C3631]">
              {t.confirmDelete}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setListingToDelete(null)}
                className="py-2.5 rounded-xl border border-[#2C3631] text-[#8E9B94] hover:text-white hover:bg-[#242C28] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (listingToDelete) {
                    onDeleteListing?.(listingToDelete.id);
                    showToast(
                      `${listingToDelete.cropName} ${
                        currentLanguage === 'mr'
                          ? 'यशस्वीपणे काढून टाकण्यात आले'
                          : currentLanguage === 'hi'
                          ? 'सफलतापूर्वक हटा दिया गया'
                          : 'deleted successfully'
                      }`
                    );
                    setListingToDelete(null);
                  }
                }}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.deleteListing.replace(/\s*\(.*\)/, '')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Bulk Buyer Demand Confirmation Modal */}
      {demandToDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A221E] border border-red-500/40 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-[#E5E9E7]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif">{t.deleteDemand}</h3>
                <p className="text-xs text-[#8E9B94]">
                  {demandToDelete.companyName} • {demandToDelete.requiredCrop} ({demandToDelete.neededQtyTons} Tons)
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#D4E4BC] leading-relaxed bg-[#242C28] p-3 rounded-2xl border border-[#2C3631]">
              {t.confirmDeleteDemand}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDemandToDelete(null)}
                className="py-2.5 rounded-xl border border-[#2C3631] text-[#8E9B94] hover:text-white hover:bg-[#242C28] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (demandToDelete) {
                    onDeleteBulkBuyerDemand?.(demandToDelete.id);
                    showToast(
                      `${demandToDelete.companyName} requirement ${
                        currentLanguage === 'mr'
                          ? 'मागणी हटवली'
                          : currentLanguage === 'hi'
                          ? 'मांग हटा दी गई'
                          : 'removed successfully'
                      }`
                    );
                    setDemandToDelete(null);
                  }
                }}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.deleteDemand}</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Top Banner: Marketplace Benefits for Farmers & Buyers */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1A221E] border border-[#2C3631] p-5 sm:p-7 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#C2D66E]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modern Vibrant Produce Mart & Supermarket Terminal Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            key={currentActiveMartImage}
            src={currentActiveMartImage}
            alt={currentActiveMartTitle}
            className="w-full h-full object-cover object-center opacity-35 mix-blend-luminosity scale-105 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A221E] via-[#1A221E]/90 to-[#1A221E]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A221E] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                <span className="flex items-center gap-1">
                  {userRole === 'farmer' ? (
                    '🌾'
                  ) : userRole === 'fpo' ? (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <Building2 className="w-2.5 h-2.5 text-emerald-400" />
                    </span>
                  ) : userRole === 'bulk_buyer' ? (
                    '🏪'
                  ) : (
                    '🥗'
                  )}
                </span>
                <span>
                  {t.currentRole}: {userRole === 'farmer' ? t.farmer : userRole === 'fpo' ? t.fpo : userRole === 'bulk_buyer' ? t.bulkBuyer : t.consumer}
                </span>
              </span>
              <span className="bg-[#242C28] text-[#D4E4BC] text-[11px] font-medium px-3 py-1 rounded-full border border-[#2C3631] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C2D66E]" />
                Zero APMC Middlemen Cut
              </span>
              <button
                type="button"
                onClick={() => setIsMartImageModalOpen(true)}
                className="bg-[#242C28]/80 hover:bg-[#2C3631] text-[#C2D66E] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#C2D66E]/40 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Customize Mart Image"
              >
                <ImageIcon className="w-3 h-3 text-[#C2D66E]" />
                <span>Change Mart Image</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-white tracking-tight leading-snug">
              {userRole === 'bulk_buyer'
                ? currentLanguage === 'mr'
                  ? 'शेतकऱ्यांकडून थेट मोठ्या प्रमाणावर खरेदी व सुरक्षित डिजिटल व्यवहार'
                  : currentLanguage === 'hi'
                  ? 'किसानों से सीधी थोक खरीद और सुरक्षित डिजिटल अनुबंध'
                  : 'Direct Farm-Gate B2B Procurement with Escrow'
                : userRole === 'fpo'
                ? currentLanguage === 'mr'
                  ? 'FPO शेतकरी गट एकत्रीकरण, थेट विक्री व लॉजिस्टिक्स सॉफ्टवेअर'
                  : currentLanguage === 'hi'
                  ? 'FPO किसान समूह एकत्रीकरण, सीधी बिक्री व लॉजिस्टिक्स सॉफ्टवेयर'
                  : 'FPO Produce Aggregation & Cold-Chain Logistics'
                : userRole === 'retail_consumer'
                ? currentLanguage === 'mr'
                  ? 'शेतातून थेट ताजी व १००% प्रमाणित सेंद्रिय फळे व भाजीपाला'
                  : currentLanguage === 'hi'
                  ? 'खेत से सीधी ताजा एवं 100% जैविक फसलें'
                  : 'Farm-Fresh 100% Organic Direct Produce'
                : currentLanguage === 'mr'
                ? 'शेतकऱ्यांना जास्त भाव, खरेदीदारांना थेट बचत आणि सुरक्षित व्यवहार'
                : currentLanguage === 'hi'
                ? 'किसानों को बेहतर भाव, खरीदारों को कम कीमत और सीधा डिजिटल अनुबंध'
                : 'Direct Marketplace for Modern Yield'}
            </h1>

            <p className="text-xs sm:text-sm text-[#8E9B94] leading-relaxed">
              {t.connectedToBuyers}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* AI Crop Recommendation Engine Button */}
            <button
              id="marketplace-crop-advisor-btn"
              type="button"
              onClick={() => onNavigateTab('cropAdvisor')}
              className="px-4 py-3 rounded-2xl bg-[#242C28] hover:bg-[#2C3631] border border-[#C2D66E]/50 text-[#C2D66E] font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              title={t.cropAdvisor}
            >
              <Sparkles className="w-4 h-4 text-[#C2D66E]" />
              <span>{t.cropAdvisor}</span>
            </button>

            {/* List Farm Produce Button - Always accessible so anyone can list yields */}
            <button
              id="marketplace-list-produce-btn"
              onClick={onOpenListModal}
              className="px-5 py-3 rounded-2xl bg-[#C2D66E] text-[#0F1411] font-bold text-xs uppercase tracking-widest hover:bg-[#D4E4BC] active:scale-95 transition-all shadow-md flex items-center gap-2"
              title="Add farm harvest yield - universally visible to all farmers, buyers, supermarkets & food brands"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.listProduce}</span>
            </button>

            {/* Post Bulk Demand Button (for Bulk Buyers & Food Brands) */}
            <button
              id="marketplace-post-demand-btn"
              onClick={onOpenAddDemandModal}
              className="px-5 py-3 rounded-2xl bg-[#242C28] hover:bg-[#2C3631] text-[#C2D66E] border border-[#C2D66E]/60 font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md flex items-center gap-2"
              title="Post procurement requirement - universally visible to all farmers, buyers & food brands"
            >
              <Building2 className="w-4 h-4 stroke-[2.5]" />
              <span>{t.addBulkDemand}</span>
            </button>

            <button
              id="marketplace-procure-btn"
              onClick={() => onNavigateTab('orders')}
              className="px-4 py-3 rounded-2xl bg-[#242C28] hover:bg-[#2C3631] border border-[#2C3631] text-[#D4E4BC] font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-[#C2D66E]" />
              <span>{t.orders}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Peak Demand & Direct Buyer Matching Notification Center */}
      {stockAlerts && stockAlerts.length > 0 && (
        <div id="stock-alerts-notification-center-section">
          <StockAlertNotificationCenter
            alerts={stockAlerts}
            currentLanguage={currentLanguage}
            onApplyDiscount={(listingId, percent) => {
              if (onApplyDiscount) {
                onApplyDiscount(listingId, percent);
              }
            }}
            onMarkSold={(listingId) => {
              if (onToggleMarkSold) {
                onToggleMarkSold(listingId);
              }
            }}
            onNavigateTab={onNavigateTab}
            onSelectListingForBid={onSelectListingForBid}
            listings={listings}
            bulkBuyers={bulkBuyers}
            onDismissAlert={onDismissStockAlert}
          />
        </div>
      )}

      {/* Mindblowing Farming Landscape & Direct Mart Spotlight with Image Switcher */}
      <div className="relative overflow-hidden rounded-3xl border border-[#2C3631] bg-[#141B17] shadow-2xl group transition-all">
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <img
            key={currentActiveMartImage}
            src={currentActiveMartImage}
            alt={currentActiveMartTitle}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1411] via-[#0F1411]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1411]/80 via-transparent to-transparent hidden sm:block" />

          {/* Top badges & Image Switcher controls */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2">
            <span className="bg-[#0F1411]/85 backdrop-blur-md border border-[#C2D66E]/40 text-[#C2D66E] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#C2D66E] animate-ping" />
              {currentActiveMartBadge}
            </span>

            {/* Quick Mart Image Switcher Buttons */}
            <div className="flex items-center gap-1.5 bg-[#0F1411]/80 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-lg">
              {martImages.slice(0, 5).map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => handleSelectPresetImage(idx)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 ${
                    !customMartImageUrl && selectedMartImageIdx === idx
                      ? 'bg-[#C2D66E] text-[#0F1411] shadow-sm font-bold'
                      : 'text-[#8E9B94] hover:text-[#E5E9E7] hover:bg-[#242C28]'
                  }`}
                  title={img.title}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span className="hidden sm:inline">
                    {img.id === 'mandi_hub'
                      ? 'Mandi'
                      : img.id === 'supermarket'
                      ? 'Supermart'
                      : img.id === 'harvest_stalls'
                      ? 'Stalls'
                      : img.id === 'organic_crates'
                      ? 'Packhouse'
                      : 'Bazaar'}
                  </span>
                </button>
              ))}

              <button
                onClick={() => setIsMartImageModalOpen(true)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#242C28] hover:bg-[#2C3631] text-[#C2D66E] border border-[#C2D66E]/40 flex items-center gap-1 transition-all"
                title="Open Mart Gallery & Upload Custom Photo"
              >
                <ImageIcon className="w-3 h-3 text-[#C2D66E]" />
                <span>More</span>
              </button>
            </div>
          </div>

          {/* Bottom details */}
          <div className="absolute bottom-3.5 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h3 className="text-white font-serif italic font-bold text-base sm:text-lg drop-shadow-md">
                {currentActiveMartTitle} • {currentLanguage === 'mr' ? 'थेट शेतशिवार ते सुपरमार्ट' : currentLanguage === 'hi' ? 'खेत से सीधा बाज़ार' : 'Direct Fair Trade'}
              </h3>
              <p className="text-xs text-[#D4E4BC] drop-shadow-sm font-medium">
                {currentLanguage === 'mr'
                  ? 'नाशिक, पुणे व सांगली पट्ट्यातील १०,०००+ एकर थेट कनेक्टेड'
                  : currentLanguage === 'hi'
                  ? 'नासिक, पुणे और सांगली क्लस्टर के 10,000+ एकड़ सीधे जुड़े हुए'
                  : '10,000+ Certified Acres Across High-Yield Clusters Connected to Smart B2B Trade'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMartImageModalOpen(true)}
                className="text-[10px] font-bold uppercase tracking-wider bg-[#242C28]/90 hover:bg-[#2C3631] text-[#C2D66E] border border-[#C2D66E]/40 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                title="Select or Upload Different Mart Image"
              >
                <ImageIcon className="w-3 h-3 text-[#C2D66E]" />
                <span>Change Mart Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Bulk Buyer Live Demand Ticker with Add & Delete Support */}
      <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2C3631]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C2D66E] animate-pulse"></span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#8E9B94]">
                  {currentLanguage === 'mr'
                    ? 'थेट खरेदीदार व फूड ब्रँड्सची मागणी (Bulk Buyers & Food Brands Live Procurement)'
                    : currentLanguage === 'hi'
                    ? 'थोक खरीदार व फूड ब्रांड्स की मांग (Bulk Buyers & Food Brands Live Procurement)'
                    : 'Corporate Bulk Buyers & Food Processing Brands'}
                </h2>
                <span className="text-[10px] bg-[#C2D66E]/15 text-[#C2D66E] border border-[#C2D66E]/40 px-2 py-0.5 rounded-full font-semibold hidden sm:inline-flex items-center gap-1.5 shadow-sm">
                  <Radio className="w-3 h-3 text-[#C2D66E] animate-pulse" />
                  <span>Broadcast to All</span>
                </span>
              </div>
              <p className="text-[11px] text-[#8E9B94] mt-0.5">
                Every requirement is universally visible to all Farmers, FPOs, Supermarkets, and Food Brands.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddDemandModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#242C28] hover:bg-[#C2D66E] text-[#D4E4BC] hover:text-[#0F1411] border border-[#2C3631] hover:border-[#C2D66E] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addBulkDemand}</span>
            </button>

            <span className="text-[11px] text-[#C2D66E] font-serif italic font-semibold bg-[#242C28] px-3 py-1.5 rounded-xl border border-[#2C3631]">
              {bulkBuyers.length} Verified Demands
            </span>
          </div>
        </div>

        {bulkBuyers.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-[#242C28] border border-[#2C3631] rounded-3xl space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1A221E] border border-[#2C3631] flex items-center justify-center mx-auto text-[#C2D66E]">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif italic font-bold text-base text-white">
                {currentLanguage === 'mr'
                  ? 'कोणतीही खरेदीदार / मार्ट मागणी नोंद नाही'
                  : currentLanguage === 'hi'
                  ? 'कोई खरीदार / मार्ट मांग दर्ज नहीं है'
                  : 'No Mart or Buyer Demands Yet'}
              </h3>
              <p className="text-xs text-[#8E9B94] leading-relaxed">
                {currentLanguage === 'mr'
                  ? 'फक्त खरेदीदार किंवा मार्टने जोडलेली मागणी येथे दिसेल आणि सर्व शेतकऱ्यांना थेट दृश्यमान होईल.'
                  : currentLanguage === 'hi'
                  ? 'केवल खरीदार या मार्ट द्वारा पोस्ट की गई मांग यहाँ दिखाई देगी और सभी किसानों को दिखेगी।'
                  : 'Only procurement requirements posted by buyers or marts will appear here. All demands are universally visible to all farmers and marts.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenAddDemandModal}
                className="px-5 py-2.5 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{currentLanguage === 'mr' ? 'खरेदी मागणी नोंदवा' : currentLanguage === 'hi' ? 'खरीद मांग जोड़ें' : 'Post Buyer / Mart Requirement'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {bulkBuyers.map((buyer) => {
              // Check matching produce listings for this demand
              const matchingListings = listings.filter((l) =>
                l.cropName.toLowerCase().includes(buyer.requiredCrop.toLowerCase().split(' ')[0])
              );
              const matchingTons = matchingListings.reduce((sum, item) => sum + item.availableQtyTons, 0);

              return (
                <div
                  key={buyer.id}
                  className="bg-[#242C28] border border-[#2C3631] hover:border-[#C2D66E]/50 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-sm relative"
                >
                  {/* Top Bar: Type, Logo, and Delete Button */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-[#C2D66E]">
                            {buyer.type}
                          </span>
                          <span className="bg-[#1A221E] text-[#C2D66E] border border-[#2C3631] text-[9px] font-semibold px-1.5 py-0.2 rounded-md flex items-center gap-1">
                            <Radio className="w-2 h-2 text-[#C2D66E] animate-pulse" />
                            <span>Visible to All</span>
                          </span>
                        </div>
                        <h4 className="font-serif italic font-bold text-sm text-[#E5E9E7] group-hover:text-[#D4E4BC] transition-colors mt-0.5 line-clamp-1">
                          {buyer.companyName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <img
                          src={buyer.logo}
                          alt={buyer.companyName}
                          className="w-8 h-8 rounded-xl object-cover border border-[#2C3631]"
                        />
                        {/* Delete Demand Button */}
                        <button
                          type="button"
                          onClick={() => setDemandToDelete(buyer)}
                          className="p-1.5 rounded-lg text-[#8E9B94] hover:text-red-400 hover:bg-red-500/15 transition-colors"
                          title={t.deleteDemand}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Demand Specifications */}
                    <div className="mt-3 pt-2.5 border-t border-[#2C3631] space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#8E9B94]">
                        <span>Crop Needed:</span>
                        <span className="font-semibold text-[#D4E4BC] line-clamp-1 text-right max-w-[130px]">
                          {buyer.requiredCrop}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#8E9B94]">
                        <span>Volume:</span>
                        <span className="font-bold text-[#E5E9E7]">{buyer.neededQtyTons} Tons</span>
                      </div>
                      <div className="flex justify-between text-[#8E9B94]">
                        <span>Offered Rate:</span>
                        <span className="font-bold text-[#C2D66E]">₹{buyer.offeredPricePerKg}/kg</span>
                      </div>
                      <div className="flex justify-between text-[#8E9B94] text-[10px]">
                        <span>Delivery Hub:</span>
                        <span className="text-[#8E9B94] truncate max-w-[130px]">{buyer.deliveryLocation}</span>
                      </div>
                      {buyer.paymentTerms && (
                        <div className="flex justify-between text-[10px] pt-0.5">
                          <span className="text-[#8E9B94]">Payment:</span>
                          <span className="font-semibold text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            {buyer.paymentTerms}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Matching Harvest Indicator */}
                    {matchingListings.length > 0 && (
                      <div className="mt-2.5 py-1 px-2 rounded-lg bg-[#1A221E] border border-[#2C3631] flex items-center justify-between text-[10px]">
                        <span className="text-[#8E9B94] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#C2D66E]" />
                          {matchingListings.length} Matching Lots
                        </span>
                        <span className="text-[#C2D66E] font-semibold">{matchingTons.toFixed(1)} Tons</span>
                      </div>
                    )}
                  </div>

                  {/* Procurement Action */}
                  <div className="mt-3 pt-2 border-t border-[#2C3631]/60 flex items-center gap-2">
                    <button
                      onClick={() => {
                        const match = matchingListings[0] || listings[0];
                        if (match) {
                          onSelectListingForBid(match);
                        }
                      }}
                      className="flex-1 py-2 rounded-xl border border-[#C2D66E] text-[#C2D66E] hover:bg-[#C2D66E] hover:text-[#0F1411] text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Supply Harvest</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Marked Yields Summary Card (Visible when yields are marked or filter active) */}
      {statusFilter === 'marked' && (
        <div className="bg-[#1A221E] border border-[#C2D66E]/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#C2D66E]/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#C2D66E]/20 text-[#C2D66E]">
                  <Star className="w-4 h-4 fill-[#C2D66E]" />
                </span>
                <h3 className="text-base sm:text-lg font-serif italic font-bold text-white">
                  {t.markedYields} ({markedCount} Lots Selected)
                </h3>
              </div>
              <p className="text-xs text-[#8E9B94]">
                Bulk buyers can shortlist lots, evaluate lab purity, and execute single-click escrow procurement contracts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[#242C28] border border-[#2C3631] px-3.5 py-2 rounded-2xl text-right">
                <span className="text-[9px] uppercase font-bold text-[#8E9B94] block">Total Harvest Volume</span>
                <span className="text-sm font-bold text-[#E5E9E7]">{totalMarkedTons.toFixed(1)} Tons</span>
              </div>

              <div className="bg-[#242C28] border border-[#2C3631] px-3.5 py-2 rounded-2xl text-right">
                <span className="text-[9px] uppercase font-bold text-[#8E9B94] block">Estimated Value</span>
                <span className="text-sm font-bold text-[#C2D66E]">
                  ₹{(totalMarkedEstimatedValue / 100000).toFixed(2)} Lakhs
                </span>
              </div>

              {markedCount > 0 && (
                <button
                  onClick={() => {
                    if (markedListings.length > 0) {
                      onSelectListingForBid(markedListings[0]);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#C2D66E] text-[#0F1411] font-bold text-xs uppercase tracking-wider hover:bg-[#D4E4BC] active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t.procureMarkedLots}</span>
                </button>
              )}

              {markedCount > 0 && (
                <button
                  onClick={() => {
                    onClearAllMarkedYields?.();
                    showToast(
                      currentLanguage === 'mr'
                        ? 'सर्व मार्क केलेले शेतमाल काढले'
                        : currentLanguage === 'hi'
                        ? 'सभी मार्क की गई फसलें हटा दी गईं'
                        : 'Cleared all marked yields'
                    );
                  }}
                  className="p-2.5 rounded-xl bg-[#242C28] border border-[#2C3631] text-[#8E9B94] hover:text-white text-xs font-semibold"
                  title="Clear All Marked"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8E9B94] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-[#1A221E] border border-[#2C3631] focus:border-[#C2D66E] rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#E5E9E7] placeholder:text-[#8E9B94] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8E9B94] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Status Filter Toggle with Marked Yields Tab */}
            <div className="flex items-center bg-[#1A221E] border border-[#2C3631] rounded-2xl p-1 gap-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-sm'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                All ({listings.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  statusFilter === 'active'
                    ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-sm'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2D66E]"></span>
                <span>Active ({activeCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('marked')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  statusFilter === 'marked'
                    ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-sm'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                <Star className={`w-3 h-3 ${markedCount > 0 ? 'text-[#C2D66E] fill-[#C2D66E]' : ''}`} />
                <span>Marked ({markedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('sold')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  statusFilter === 'sold'
                    ? 'bg-amber-400 text-[#0F1411] font-bold shadow-sm'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Sold ({soldCount})</span>
              </button>
            </div>

            <button
              onClick={() => setOnlyFpoVerified(!onlyFpoVerified)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                onlyFpoVerified
                  ? 'bg-emerald-500 border-emerald-500 text-[#0F1411] font-bold shadow-md'
                  : 'bg-[#1A221E] border-[#2C3631] text-[#E5E9E7] hover:border-emerald-500/50'
              }`}
            >
              <span className={`w-4 h-4 rounded-md flex items-center justify-center ${onlyFpoVerified ? 'bg-[#0F1411] text-emerald-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}`}>
                <Building2 className="w-2.5 h-2.5" />
              </span>
              <span className={onlyFpoVerified ? 'text-[#0F1411]' : 'text-emerald-300'}>{t.verifiedFpo} Only</span>
            </button>

            <button
              onClick={() => setOnlyOrganic(!onlyOrganic)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                onlyOrganic
                  ? 'bg-[#C2D66E] border-[#C2D66E] text-[#0F1411] font-bold'
                  : 'bg-[#1A221E] border-[#2C3631] text-[#E5E9E7] hover:border-[#8E9B94]'
              }`}
            >
              <span>🌱 100% Organic</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-md scale-102'
                    : 'bg-[#1A221E] border border-[#2C3631] text-[#8E9B94] hover:text-[#E5E9E7] hover:bg-[#242C28]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Produce Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredListings.map((item) => {
          const isAudioPlaying = activeAudioId === item.id;
          const isSold = !!item.isSold || item.status === 'sold';
          const isMarked = !!item.isMarkedByBuyer;
          const farmerGainPercent = Math.round(
            ((item.expectedPricePerKg - item.currentMandiPricePerKg) / item.currentMandiPricePerKg) * 100
          );
          const itemAlert = stockAlerts?.find((a) => a.listingId === item.id && !a.isDismissed);

          return (
            <div
              key={item.id}
              className={`bg-[#242C28] border ${
                isMarked
                  ? 'border-[#C2D66E] ring-1 ring-[#C2D66E]/40'
                  : isSold
                  ? 'border-amber-500/40 opacity-90'
                  : 'border-[#2C3631] hover:border-[#C2D66E]/60'
              } rounded-3xl overflow-hidden shadow-xl transition-all duration-200 flex flex-col group`}
            >
              {/* Image & Badges */}
              <div className="relative h-44 w-full overflow-hidden bg-[#1A221E]">
                <img
                  src={item.imageUrl}
                  alt={item.cropName}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                    isSold ? 'grayscale-[35%]' : ''
                  }`}
                />

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-[#0F1411]/90 backdrop-blur-md text-[#D4E4BC] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#2C3631] shadow-sm flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#C2D66E]" />
                      {item.qualityGrade}
                    </span>

                    <span className="bg-[#0F1411]/90 backdrop-blur-md text-[#C2D66E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2C3631] shadow-sm flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-[#C2D66E] animate-pulse" />
                      <span>Visible to All</span>
                    </span>

                    {item.isOrganic && (
                      <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                        Organic
                      </span>
                    )}

                    {item.fpoVerified && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Building2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>FPO</span>
                      </span>
                    )}

                    {isMarked && (
                      <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#0F1411]" />
                        <span>Marked</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* QR Code Share Trigger Button on Image */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedListingForQR(item);
                      }}
                      className="p-2 rounded-full backdrop-blur-md bg-[#0F1411]/80 hover:bg-[#C2D66E] text-[#D4E4BC] hover:text-[#0F1411] transition-all shadow-md active:scale-90 border border-white/10"
                      title={currentLanguage === 'mr' ? 'QR कोड तयार करा व शेअर करा' : 'Generate & Share Scannable QR Code'}
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {/* Mark Yield Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMarkYield?.(item.id);
                        showToast(
                          isMarked
                            ? `${item.cropName} ${currentLanguage === 'mr' ? 'मार्क काढला' : currentLanguage === 'hi' ? 'अनमार्क किया गया' : 'unmarked'}`
                            : `${item.cropName} ${currentLanguage === 'mr' ? 'खरेदीदारांसाठी मार्क केला' : currentLanguage === 'hi' ? 'थोक खरीद हेतु मार्क किया गया' : 'marked for procurement'}`
                        );
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
                        isMarked
                          ? 'bg-[#C2D66E] text-[#0F1411]'
                          : 'bg-[#0F1411]/80 text-[#8E9B94] hover:text-[#C2D66E] hover:bg-[#0F1411]'
                      }`}
                      title={isMarked ? t.unmarkYield : t.markYield}
                    >
                      <Star className={`w-4 h-4 ${isMarked ? 'fill-[#0F1411]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Bottom Overlay Price Comparison */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#0F1411]/90 backdrop-blur-md border border-[#2C3631] rounded-2xl px-3 py-1.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#8E9B94] block font-medium">Farm Direct:</span>
                    <span className="font-bold text-[#C2D66E] text-sm">
                      ₹{item.expectedPricePerKg} <span className="text-[10px] text-[#8E9B94]">/ kg</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-[#8E9B94] block">APMC Mandi:</span>
                    <span className="text-[11px] text-[#8E9B94] line-through">
                      ₹{item.currentMandiPricePerKg}/kg
                    </span>
                    <span className="text-[10px] text-[#D4E4BC] font-bold block">
                      +{farmerGainPercent}% Net
                    </span>
                  </div>
                </div>
              </div>

              {/* Automated Stock Expiry & Demand Window Alert Indicator */}
              {itemAlert && (
                <div
                  className={`px-3.5 py-1.5 flex items-center justify-between gap-1.5 text-xs border-y ${
                    itemAlert.type === 'CRITICAL_EXPIRY'
                      ? 'bg-red-950/70 border-red-500/50 text-red-200'
                      : itemAlert.type === 'PEAK_DEMAND_WINDOW'
                      ? 'bg-emerald-950/70 border-[#C2D66E]/50 text-[#D4E4BC]'
                      : 'bg-amber-950/70 border-amber-500/50 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {itemAlert.type === 'CRITICAL_EXPIRY' ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                    ) : itemAlert.type === 'PEAK_DEMAND_WINDOW' ? (
                      <span className="w-2 h-2 rounded-full bg-[#C2D66E] animate-pulse shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    )}
                    <span className="font-bold text-[11px] truncate">
                      {itemAlert.type === 'CRITICAL_EXPIRY'
                        ? (currentLanguage === 'mr' ? `मुदत संपत आहे (${itemAlert.hoursRemaining} तास)` : `Expiry Risk: ${itemAlert.hoursRemaining}h left`)
                        : itemAlert.type === 'PEAK_DEMAND_WINDOW'
                        ? (currentLanguage === 'mr' ? `पीक मागणी (+₹${(itemAlert.peakDemandPriceEstimate || item.expectedPricePerKg) - item.expectedPricePerKg > 0 ? (itemAlert.peakDemandPriceEstimate || item.expectedPricePerKg) - item.expectedPricePerKg : 15}/किलो)` : `Peak Demand Surge (₹${itemAlert.peakDemandPriceEstimate || Math.round(item.expectedPricePerKg * 1.18)}/kg)`)
                        : (currentLanguage === 'mr' ? `शेल्फ-लाईफ: ${itemAlert.daysRemaining} दिवस` : `Freshness: ${itemAlert.daysRemaining}d left`)}
                    </span>
                  </div>

                  {itemAlert.type === 'CRITICAL_EXPIRY' && onApplyDiscount && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyDiscount(item.id, 10);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-0.5 transition-all shadow-xs cursor-pointer"
                      title="Apply 10% Clearance Discount"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>-10%</span>
                    </button>
                  )}
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#1A221E]">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1 text-[11px] text-[#8E9B94]">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-[#C2D66E] shrink-0" />
                      {item.location}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedListingForQR(item);
                      }}
                      className="font-mono text-[9px] bg-[#242C28] hover:bg-[#C2D66E] text-[#8E9B94] hover:text-[#0F1411] px-2 py-0.5 rounded-full border border-[#2C3631] hover:border-[#C2D66E] flex items-center gap-1 transition-all cursor-pointer"
                      title="Open Scannable Batch QR Code"
                    >
                      <QrCode className="w-2.5 h-2.5" />
                      <span>{item.batchQrCode}</span>
                    </button>
                  </div>

                  <h3 className="font-serif italic font-bold text-lg text-white group-hover:text-[#D4E4BC] transition-colors line-clamp-1 flex items-center justify-between gap-2">
                    <span className={isSold ? 'line-through text-[#8E9B94]' : ''}>{item.cropName}</span>
                    {isSold && (
                      <span className="text-[10px] not-italic font-sans font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 shrink-0">
                        {t.soldOut}
                      </span>
                    )}
                  </h3>

                  <p className="text-xs text-[#8E9B94] line-clamp-1 font-medium">
                    {item.sellerType}: <span className="text-white font-semibold">{item.sellerName}</span>
                  </p>

                  <p className="text-[11px] text-[#8E9B94] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2C3631] text-xs">
                  <div className="bg-[#242C28] p-2.5 rounded-xl border border-[#2C3631]/60">
                    <span className="text-[9px] uppercase tracking-wider text-[#8E9B94] block">Harvest Lot:</span>
                    <span className="font-bold text-[#E5E9E7]">{item.availableQtyTons} Tons</span>
                    <span className="text-[9px] text-[#8E9B94] block">Min: {item.minOrderQtyKg} kg</span>
                  </div>

                  <div className="bg-[#242C28] p-2.5 rounded-xl border border-[#2C3631]/60">
                    <span className="text-[9px] uppercase tracking-wider text-[#8E9B94] block">Lab Purity:</span>
                    <span className="font-bold text-[#C2D66E]">{item.labReportScore}/100</span>
                    <span className="text-[9px] text-[#8E9B94] block">{item.activeBidsCount} Active Bids</span>
                  </div>
                </div>

                {/* Bulk Buyer & Seller Toolbar: QR Share, Mark Yield, Mark Sold & Delete */}
                <div className="pt-2 border-t border-[#2C3631] flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                  {/* QR Code Share Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedListingForQR(item)}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold border border-[#C2D66E]/50 bg-[#1F2B24] hover:bg-[#C2D66E] text-[#C2D66E] hover:text-[#0F1411] transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    title={currentLanguage === 'mr' ? 'QR कोड ओपन करा' : 'Open Lot QR Code'}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Share</span>
                  </button>

                  {/* Mark Yield Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMarkYield?.(item.id);
                      showToast(
                        isMarked
                          ? `${item.cropName} unmarked`
                          : `${item.cropName} marked for bulk procurement`
                      );
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                      isMarked
                        ? 'bg-[#C2D66E] text-[#0F1411] border-[#C2D66E] shadow-sm'
                        : 'bg-[#242C28] border-[#2C3631] text-[#D4E4BC] hover:border-[#C2D66E]'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isMarked ? 'fill-[#0F1411]' : ''}`} />
                    <span>{isMarked ? 'Marked' : 'Mark'}</span>
                  </button>

                  {/* Mark Sold Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMarkSold?.(item.id);
                      showToast(
                        isSold
                          ? `${item.cropName} marked as Active`
                          : `${item.cropName} marked as Sold Out`
                      );
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      isSold
                        ? 'bg-[#C2D66E]/15 border-[#C2D66E]/40 text-[#C2D66E] hover:bg-[#C2D66E] hover:text-[#0F1411]'
                        : 'bg-[#242C28] border-[#2C3631] text-[#D4E4BC] hover:border-amber-400/60 hover:text-amber-300'
                    }`}
                  >
                    {isSold ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t.markActive}</span>
                      </>
                    ) : (
                      <>
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t.markSold}</span>
                      </>
                    )}
                  </button>

                  {/* Delete Listing Button */}
                  <button
                    type="button"
                    onClick={() => setListingToDelete(item)}
                    className="p-1.5 px-2.5 rounded-xl border border-red-500/30 text-red-400 hover:text-red-200 hover:bg-red-500/20 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold"
                    title={t.deleteListing}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span className="hidden sm:inline text-[11px]">Delete</span>
                  </button>
                </div>

                {/* Action Buttons for Purchasing */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    {isSold ? (
                      <div className="col-span-2 py-2 rounded-xl bg-[#242C28] border border-[#2C3631] text-[#8E9B94] text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                        <CheckCheck className="w-4 h-4 text-amber-400" />
                        <span>{t.soldOut} (Lot Completed)</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onSelectListingForBid(item)}
                          className="w-full py-2 rounded-xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{t.directBuy}</span>
                        </button>

                        <button
                          onClick={() => onSelectListingForBid(item)}
                          className="w-full py-2 rounded-xl border border-[#C2D66E] text-[#C2D66E] hover:bg-[#C2D66E] hover:text-[#0F1411] text-xs font-bold uppercase tracking-wider active:scale-95 transition-all"
                        >
                          {t.placeBid}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Voice Listen Button for Farmer Accessibility */}
                  <button
                    onClick={() => handleSpeakProduce(item)}
                    className={`w-full py-1.5 px-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      isAudioPlaying
                        ? 'bg-[#C2D66E]/20 border-[#C2D66E] text-[#C2D66E] animate-pulse'
                        : 'bg-[#242C28] hover:bg-[#2C3631] border-[#2C3631] text-[#8E9B94] hover:text-[#E5E9E7]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#C2D66E]" />
                    <span>{isAudioPlaying ? 'वाचत आहे... (Speaking)' : t.listenAudio}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {listings.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-[#1A221E] border border-[#2C3631] rounded-3xl space-y-4 shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-[#242C28] border border-[#C2D66E]/40 flex items-center justify-center mx-auto text-[#C2D66E] shadow-sm">
            <Sprout className="w-8 h-8 text-[#C2D66E]" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif italic font-bold text-lg text-white">
              {currentLanguage === 'mr'
                ? 'कोणतीही शेतमाल विक्री नोंद नाही'
                : currentLanguage === 'hi'
                ? 'कोई किसान फसल बिक्री दर्ज नहीं है'
                : 'No Farmer Selling Listings Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8E9B94] leading-relaxed">
              {currentLanguage === 'mr'
                ? 'फक्त शेतकऱ्यांनी जोडलेला शेतमाल येथे दिसेल. शेतकरी जेव्हा शेतमाल विक्रीसाठी जोडतील, तेव्हा तो त्वरित सर्व शेतकरी, खरेदीदार, मार्ट्स आणि फूड ब्रँड्सना दृश्यमान होईल.'
                : currentLanguage === 'hi'
                ? 'केवल किसानों द्वारा जोड़ी गई फसलें यहाँ दिखाई देंगी। जब किसान बिक्री के लिए फसल जोड़ेंगे, तो वह सभी किसानों, खरीदारों, मार्ट्स और फूड कंपनियों को दिखेगी।'
                : 'Only produce added by farmers will appear in the software. When a farmer adds a harvest to sell, it immediately appears and is broadcasted to all Farmers, Buyers, Marts, and Food Brands.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenListModal}
              className="px-6 py-3 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{currentLanguage === 'mr' ? 'शेतमाल विक्री जोडा' : currentLanguage === 'hi' ? 'फसल बिक्री जोड़ें' : 'List Farm Produce to Sell'}</span>
            </button>
          </div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="p-12 text-center bg-[#1A221E] border border-[#2C3631] rounded-3xl space-y-3">
          <p className="text-[#8E9B94] text-sm">
            No produce found matching your filter criteria.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setStatusFilter('all');
              setSearchQuery('');
              setOnlyFpoVerified(false);
              setOnlyOrganic(false);
            }}
            className="px-5 py-2.5 rounded-full bg-[#C2D66E] text-[#0F1411] text-xs font-bold uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : null}
      {/* Mart Image Customization & Studio Modal */}
      {isMartImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-6 w-full max-w-3xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C3631] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/10 border border-[#C2D66E]/30 flex items-center justify-center text-[#C2D66E]">
                  <ImageIcon className="w-5 h-5 text-[#C2D66E]" />
                </div>
                <div>
                  <h3 className="font-serif italic font-bold text-lg text-white">
                    {currentLanguage === 'mr'
                      ? 'मार्ट व मार्केटप्लेस फोटो निवडा'
                      : currentLanguage === 'hi'
                      ? 'मार्ट एवं बाज़ार चित्र चुनें'
                      : 'Choose or Change Mart Image'}
                  </h3>
                  <p className="text-xs text-[#8E9B94]">
                    Select a high-definition agro-mart theme or upload your own photo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMartImageModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#242C28] text-[#8E9B94] hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Active Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9B94] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#C2D66E]" />
                <span>Currently Active Mart Visual</span>
              </span>
              <div className="relative h-44 rounded-2xl overflow-hidden border border-[#2C3631]">
                <img
                  src={currentActiveMartImage}
                  alt={currentActiveMartTitle}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 justify-between">
                  <div>
                    <span className="text-xs font-bold text-white drop-shadow-md block">
                      {currentActiveMartTitle}
                    </span>
                    <span className="text-[10px] text-[#C2D66E] font-medium">
                      {currentActiveMartBadge}
                    </span>
                  </div>
                  {customMartImageUrl && (
                    <button
                      type="button"
                      onClick={() => handleSelectPresetImage(0)}
                      className="px-3 py-1 rounded-full bg-red-600/80 hover:bg-red-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Presets</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Curated Mart Presets Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C2D66E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2D66E]" />
                  <span>Curated High-Definition Mart Themes ({martImages.length})</span>
                </span>
                <span className="text-[10px] text-[#8E9B94]">Click any image to set immediately</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {martImages.map((img, idx) => {
                  const isSelected = !customMartImageUrl && selectedMartImageIdx === idx;
                  return (
                    <div
                      key={img.id}
                      onClick={() => handleSelectPresetImage(idx)}
                      className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-[#C2D66E] ring-2 ring-[#C2D66E]/50 shadow-lg scale-[1.02]'
                          : 'border-[#2C3631] hover:border-[#8E9B94] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="h-28 w-full overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 flex flex-col justify-between">
                        <div className="flex justify-end">
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#C2D66E] text-[#0F1411] flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-white line-clamp-1 block leading-tight">
                            {img.title}
                          </span>
                          <span className="text-[9px] text-[#C2D66E] font-medium line-clamp-1">
                            {img.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Photo Upload & URL options */}
            <div className="pt-2 border-t border-[#2C3631] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E9B94] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#C2D66E]" />
                <span>Upload or Link Your Own Mart Photo</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload Box */}
                <label className="border-2 border-dashed border-[#2C3631] hover:border-[#C2D66E] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#141B17]/60 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-[#242C28] flex items-center justify-center text-[#C2D66E] group-hover:scale-110 transition-transform mb-2">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-[#C2D66E]">
                    Upload Photo from Device
                  </span>
                  <span className="text-[10px] text-[#8E9B94] mt-0.5">
                    JPG, PNG, WebP supported
                  </span>
                </label>

                {/* Paste Web Image URL */}
                <div className="border border-[#2C3631] rounded-2xl p-4 bg-[#141B17]/60 flex flex-col justify-between gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Paste Public Image URL
                    </label>
                    <input
                      type="url"
                      value={inputCustomUrl}
                      onChange={(e) => setInputCustomUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 rounded-xl bg-[#242C28] border border-[#2C3631] text-xs text-white placeholder-[#8E9B94] focus:outline-none focus:border-[#C2D66E]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCustomUrl(inputCustomUrl)}
                    disabled={!inputCustomUrl.trim()}
                    className="w-full py-2 rounded-xl bg-[#C2D66E] disabled:bg-[#242C28] disabled:text-[#8E9B94] text-[#0F1411] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Custom URL</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-[#2C3631]">
              <button
                type="button"
                onClick={() => setIsMartImageModalOpen(false)}
                className="px-6 py-2.5 rounded-full bg-[#242C28] hover:bg-[#2C3631] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Produce Listing Scannable QR Code Modal */}
      <ProduceListingQRModal
        isOpen={!!selectedListingForQR}
        onClose={() => setSelectedListingForQR(null)}
        listing={selectedListingForQR}
        currentLanguage={currentLanguage}
        onDirectProcure={onSelectListingForBid}
      />
    </div>
  );
};

