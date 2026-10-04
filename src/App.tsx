import React, { useState, useEffect, useMemo } from 'react';
import { LanguageCode, ProduceListing, OrderContract, UserRole, BulkBuyerProfile, WeatherAlert, AuthRole, UserProfile, StockAlert } from './types';
import {
  initialProduceListings,
  bulkBuyersList,
  activeFreightShipments,
  modernCropTutorials,
  sampleOrderContracts,
  initialWeatherAlerts,
} from './data/mockData';
import { translations } from './utils/translations';
import { fetchRealTimeWeatherAlerts } from './services/geminiService';
import { getCurrentSessionUser, loginUserSession, logoutUserSession, subscribeToAuth } from './services/authService';
import { calculateStockAlerts, applyListingDiscount } from './utils/stockAlertEngine';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MarketplaceView } from './components/MarketplaceView';
import { DemandForecastView } from './components/DemandForecastView';
import { CropRecommendationEngineView } from './components/CropRecommendationEngineView';
import { LogisticsSupportView } from './components/LogisticsSupportView';
import { TutorialsMasterclassView } from './components/TutorialsMasterclassView';
import { OrdersEscrowView } from './components/OrdersEscrowView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ListProduceModal } from './components/ListProduceModal';
import { BuyerBiddingModal } from './components/BuyerBiddingModal';
import { PostBulkDemandModal } from './components/PostBulkDemandModal';
import { WeatherAlertRadarModal } from './components/WeatherAlertRadarModal';
import { LoginModal } from './components/LoginModal';
import { AuthGatewayView } from './components/AuthGatewayView';
import { ProfileEditModal } from './components/ProfileEditModal';
import { FarmParcelMapView } from './components/FarmParcelMapView';
import { Sprout, ShoppingBag, ShieldCheck, ArrowRight, UserCheck, Sparkles, Building2, CheckCircle, LogOut, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { safeStorage } from './utils/security';

export const App: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('mr');
  const [userRole, setUserRole] = useState<UserRole>('farmer');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentSessionUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalInitialTab, setLoginModalInitialTab] = useState<AuthRole>('farmer');
  const [isProfileEditOpen, setIsProfileEditOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('marketplace');
  const [selectedTutorialId, setSelectedTutorialId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'logout' } | null>(null);

  const LISTINGS_STORAGE_KEY = 'kisanmitra_farmer_selling_v5';
  const BULK_BUYERS_STORAGE_KEY = 'kisanmitra_mart_demands_v5';
  const CONTRACTS_STORAGE_KEY = 'kisanmitra_contracts_v5';

  // Data state with persistent storage initialization
  const [listings, setListings] = useState<ProduceListing[]>(() => {
    const saved = safeStorage.getItem<ProduceListing[]>(LISTINGS_STORAGE_KEY, null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return initialProduceListings;
  });

  const [bulkBuyers, setBulkBuyers] = useState<BulkBuyerProfile[]>(() => {
    const saved = safeStorage.getItem<BulkBuyerProfile[]>(BULK_BUYERS_STORAGE_KEY, null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return bulkBuyersList;
  });

  const [contracts, setContracts] = useState<OrderContract[]>(() => {
    const saved = safeStorage.getItem<OrderContract[]>(CONTRACTS_STORAGE_KEY, null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return sampleOrderContracts;
  });

  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>(initialWeatherAlerts);

  // Dismissed stock alerts tracking
  const [dismissedStockAlertIds, setDismissedStockAlertIds] = useState<Set<string>>(() => {
    const saved = safeStorage.getItem<string[]>('kisanmitra_dismissed_stock_alerts_v5', []);
    return new Set(saved || []);
  });

  // Automated Real-time Stock Expiry & Peak Demand Alerts
  const stockAlerts = useMemo(() => {
    const computed = calculateStockAlerts(listings, bulkBuyers);
    return computed.filter((alert) => !dismissedStockAlertIds.has(alert.id));
  }, [listings, bulkBuyers, dismissedStockAlertIds]);

  const handleApplyListingDiscount = (listingId: string, percent: number) => {
    const { updatedListings, updatedItem } = applyListingDiscount(listingId, percent, listings);
    setListings(updatedListings);
    showToast(
      currentLanguage === 'mr'
        ? `⚡ ${updatedItem?.cropName || 'शेतमालावर'} ${percent}% तात्काळ डिस्काउंट लागू केला! नवीन अपेक्षित भाव: ₹${updatedItem?.expectedPricePerKg}/किलो.`
        : currentLanguage === 'hi'
        ? `⚡ ${updatedItem?.cropName || 'फसल'} पर ${percent}% तत्काल डिस्काउंट लागू किया गया! नया भाव: ₹${updatedItem?.expectedPricePerKg}/किलो.`
        : `⚡ ${percent}% Clearance discount applied to ${updatedItem?.cropName || 'produce'}! New price: ₹${updatedItem?.expectedPricePerKg}/kg.`,
      'success'
    );
  };

  const handleDismissStockAlert = (alertId: string) => {
    setDismissedStockAlertIds((prev) => {
      const next = new Set([...prev, alertId]);
      safeStorage.setItem('kisanmitra_dismissed_stock_alerts_v5', Array.from(next));
      return next;
    });
  };

  // Sync state changes to localStorage safely
  useEffect(() => {
    safeStorage.setItem(LISTINGS_STORAGE_KEY, listings);
  }, [listings]);

  useEffect(() => {
    safeStorage.setItem(BULK_BUYERS_STORAGE_KEY, bulkBuyers);
  }, [bulkBuyers]);

  useEffect(() => {
    safeStorage.setItem(CONTRACTS_STORAGE_KEY, contracts);
  }, [contracts]);

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [isAddDemandModalOpen, setIsAddDemandModalOpen] = useState<boolean>(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState<boolean>(false);
  const [isRefreshingAlerts, setIsRefreshingAlerts] = useState<boolean>(false);
  const [selectedListingForBid, setSelectedListingForBid] = useState<ProduceListing | null>(null);

  const t = translations[currentLanguage] || translations.mr;

  // Subscribe to persistent Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user) {
        if (user.role === 'farmer') {
          setUserRole('farmer');
        } else if (user.role === 'mart') {
          setUserRole('bulk_buyer');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle scannable QR Code deep link (?lotId=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const lotId = params.get('lotId') || params.get('lot');
    if (lotId && listings.length > 0) {
      const found = listings.find((item) => item.id === lotId);
      if (found) {
        setActiveTab('marketplace');
        setSelectedListingForBid(found);
        showToast(
          currentLanguage === 'mr'
            ? `QR कोडद्वारे शेतमाल उघडला: ${found.cropName}`
            : currentLanguage === 'hi'
            ? `QR कोड से फसल खुली: ${found.cropName}`
            : `Opened scanned produce lot: ${found.cropName}`,
          'info'
        );
      }
    }
  }, [listings, currentLanguage]);

  // Show auto-dismissing toast notifications
  const showToast = (text: string, type: 'success' | 'info' | 'logout' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Open Login Modal with specific role selected
  const handleOpenLoginModal = (role: AuthRole = 'farmer') => {
    setLoginModalInitialTab(role);
    setIsLoginModalOpen(true);
  };

  // Handle successful login
  const handleLoginSuccess = (user: UserProfile) => {
    loginUserSession(user);
    setCurrentUser(user);
    if (user.role === 'farmer') {
      setUserRole('farmer');
    } else {
      setUserRole('bulk_buyer');
    }
    const welcomeMsg = currentLanguage === 'mr'
      ? `स्वागत आहे! ${user.name} म्हणून यशस्वीरित्या लॉगिन केले.`
      : currentLanguage === 'hi'
      ? `स्वागत है! ${user.name} के रूप में सफलतापूर्वक लॉगिन किया गया।`
      : `Welcome! Successfully logged in as ${user.name}.`;
    showToast(welcomeMsg, 'success');
  };

  // Handle real logout -> Takes user OUTSIDE software
  const handleLogout = () => {
    const loggedOutUserName = currentUser?.name || 'User';
    logoutUserSession();
    setCurrentUser(null);
    const logoutMsg = currentLanguage === 'mr'
      ? `${loggedOutUserName} सॉफ्टवेअरमधून यशस्वीरित्या लॉगआउट झाले.`
      : currentLanguage === 'hi'
      ? `${loggedOutUserName} सॉफ्टवेयर से सफलतापूर्वक लॉगआउट हो गए।`
      : `Successfully logged out from KisanMitra software.`;
    showToast(logoutMsg, 'logout');
  };

  // Switch active user role (view mode) without altering or corrupting the authenticated user profile
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
  };

  // Refresh Weather Alerts dynamically for registered locations
  const handleRefreshWeatherAlerts = async () => {
    setIsRefreshingAlerts(true);
    try {
      const registeredLocations = Array.from(
        new Set([
          ...listings.map((l) => l.location),
          'Baramati, Maharashtra',
          'Nashik, Maharashtra',
          'Devgad, Maharashtra',
          'Shopian, Kashmir',
          'Karnal, Haryana',
        ])
      );

      const freshAlerts = await fetchRealTimeWeatherAlerts(registeredLocations, currentLanguage);
      if (freshAlerts && freshAlerts.length > 0) {
        setWeatherAlerts(freshAlerts);
      }
    } catch (err) {
      console.error('Failed to refresh weather alerts:', err);
    } finally {
      setIsRefreshingAlerts(false);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setWeatherAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isDismissed: true } : a))
    );
  };

  const handleAddListing = (newListing: ProduceListing) => {
    setListings((prev) => [newListing, ...prev]);
    setActiveTab('marketplace');
    showToast(
      currentLanguage === 'mr'
        ? `🌾 नवीन शेतमाल ${newListing.cropName} यशस्वीरित्या जोडला! सर्व शेतकरी, खरेदीदार व फूड ब्रँड्सना थेट दृश्यमान.`
        : currentLanguage === 'hi'
        ? `🌾 नई फसल ${newListing.cropName} सफलतापूर्वक जोड़ी गई! सभी किसानों, थोक खरीदारों व फूड ब्रांड्स को तुरंत दिखाई देगी।`
        : `🌾 Yield ${newListing.cropName} published! Broadcasted & visible to all Farmers, Bulk Buyers & Food Brands!`,
      'success'
    );
  };

  const handleDeleteListing = (listingId: string) => {
    setListings((prev) => prev.filter((item) => item.id !== listingId));
  };

  const handleToggleMarkSold = (listingId: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          const newSoldState = !item.isSold;
          return {
            ...item,
            isSold: newSoldState,
            status: newSoldState ? 'sold' : 'active',
          };
        }
        return item;
      })
    );
  };

  // Bulk Buyer Demand Add & Delete Handlers
  const handleAddBulkDemand = (newDemand: BulkBuyerProfile) => {
    setBulkBuyers((prev) => [newDemand, ...prev]);
    setActiveTab('marketplace');
    showToast(
      currentLanguage === 'mr'
        ? `🏢 खरेदी मागणी ${newDemand.requiredCrop} यशस्वीरित्या नोंदवली! सर्व शेतकरी, खरेदीदार व फूड ब्रँड्सना थेट दृश्यमान.`
        : currentLanguage === 'hi'
        ? `🏢 खरीद मांग ${newDemand.requiredCrop} सफलतापूर्वक पोस्ट की गई! सभी किसानों, खरीदारों व फूड ब्रांड्स को दिखाई देगी।`
        : `🏢 Procurement demand for ${newDemand.requiredCrop} posted! Broadcasted & visible to all Farmers, Buyers & Food Brands!`,
      'success'
    );
  };

  const handleDeleteBulkDemand = (demandId: string) => {
    setBulkBuyers((prev) => prev.filter((item) => item.id !== demandId));
  };

  // Bulk Buyer Mark / Unmark Yield Handlers
  const handleToggleMarkYield = (listingId: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          const nextMarked = !item.isMarkedByBuyer;
          return {
            ...item,
            isMarkedByBuyer: nextMarked,
            markedByBuyersCount: Math.max(0, (item.markedByBuyersCount || 0) + (nextMarked ? 1 : -1)),
          };
        }
        return item;
      })
    );
  };

  const handleClearAllMarkedYields = () => {
    setListings((prev) =>
      prev.map((item) => ({
        ...item,
        isMarkedByBuyer: false,
        markedByBuyersCount: 0,
      }))
    );
  };

  const handleOrderCreated = (newContract: OrderContract) => {
    setContracts((prev) => [newContract, ...prev]);
    setActiveTab('orders');
    showToast(
      currentLanguage === 'mr'
        ? `नवीन करार ${newContract.id} सुरक्षित पेमेंट पर्यायाने तयार झाला!`
        : currentLanguage === 'hi'
        ? `नया अनुबंध ${newContract.id} सुरक्षित भुगतान विकल्प से बनाया गया!`
        : `New contract ${newContract.id} created with secured payment option!`,
      'success'
    );
  };

  const handleUpdateContractStatus = (contractId: string, newStatus: OrderContract['status']) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              status: newStatus,
              escrowStatus: newStatus === 'Delivered & Paid' ? 'Released to Farmer Account' : c.escrowStatus,
              paymentDetails: c.paymentDetails
                ? { ...c.paymentDetails, paymentStatus: 'Released to Farmer' }
                : undefined,
            }
          : c
      )
    );
    showToast(
      currentLanguage === 'mr'
        ? 'एस्क्रो रक्कम शेतकऱ्याच्या खात्यात यशस्वीरित्या जमा करण्यात आली.'
        : currentLanguage === 'hi'
        ? 'एस्क्रो राशि किसान के खाते में सफलतापूर्वक ट्रांसफर कर दी गई।'
        : 'Escrow payout successfully released to farmer account.',
      'success'
    );
  };

  const handleUpdateContract = (updatedContract: OrderContract) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === updatedContract.id ? updatedContract : c))
    );
    showToast(
      currentLanguage === 'mr'
        ? `करार ${updatedContract.id} चे पेमेंट तपशील अद्ययावत केले!`
        : currentLanguage === 'hi'
        ? `अनुबंध ${updatedContract.id} के भुगतान विवरण अपडेट किए गए!`
        : `Contract ${updatedContract.id} payment details updated successfully!`,
      'success'
    );
  };

  const handleDeleteContract = (contractId: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== contractId));
    showToast(
      currentLanguage === 'mr'
        ? `करार नोंद यशस्वीरित्या हटवली!`
        : currentLanguage === 'hi'
        ? `अनुबंध रिकॉर्ड सफलतापूर्वक हटा दिया गया!`
        : `Contract log ${contractId} deleted successfully!`,
      'info'
    );
  };

  const handleNavigateTab = (tab: string, contextId?: string) => {
    setActiveTab(tab);
    if (tab === 'tutorials' && contextId) {
      setSelectedTutorialId(contextId);
    }
  };

  // If user is not authenticated, render OUTSIDE Login Gateway
  if (!currentUser) {
    return (
      <div className="min-h-[100dvh] bg-[#050706] text-[#E5E9E7] flex flex-col items-center justify-center font-sans selection:bg-[#C2D66E] selection:text-[#0F1411] p-0 sm:p-4">
        <div className="w-full min-h-[100dvh] sm:min-h-0 sm:max-w-2xl bg-[#0F1411] sm:rounded-3xl sm:border sm:border-[#2C3631] sm:shadow-2xl overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-y-auto scrollbar-hide relative">
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className={`absolute top-4 left-4 right-4 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 ${
                    toastMessage.type === 'logout'
                      ? 'bg-[#1C1616] border-red-500/30 text-red-200'
                      : 'bg-[#141F18] border-[#C2D66E]/40 text-[#E5E9E7]'
                  }`}
                >
                  {toastMessage.type === 'logout' ? (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4 text-red-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C2D66E]/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-[#C2D66E]" />
                    </div>
                  )}
                  <div className="text-xs sm:text-sm font-medium leading-tight">
                    {toastMessage.text}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AuthGatewayView
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
              onLoginSuccess={handleLoginSuccess}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            />
          </div>
        </div>
        
        {/* Voice Assistant Modal for Login Screen */}
        <VoiceAssistantModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          currentLanguage={currentLanguage}
          onNavigateTab={handleNavigateTab}
          onLanguageChange={setCurrentLanguage}
          userRole={userRole}
          currentUser={currentUser}
        />
      </div>
    );
  }

  // Inside Software Application View
  return (
    <div className="min-h-[100dvh] bg-[#050706] text-[#E5E9E7] flex flex-col font-sans selection:bg-[#C2D66E] selection:text-[#0F1411]">
      <div className="w-full min-h-[100dvh] bg-[#0F1411] flex flex-col relative">
        <div className="flex-1 flex flex-col w-full overflow-y-auto overflow-x-hidden relative scrollbar-hide">
          {/* Dynamic Toast Notification for Login & Logout */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`absolute top-4 left-4 right-4 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 ${
                  toastMessage.type === 'logout'
                    ? 'bg-[#1C1616] border-red-500/30 text-red-200'
                    : 'bg-[#141F18] border-[#C2D66E]/40 text-[#E5E9E7]'
                }`}
              >
                {toastMessage.type === 'logout' ? (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#C2D66E]/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-[#C2D66E]" />
                  </div>
                )}
                <div className="text-xs sm:text-sm font-medium leading-tight">
                  {toastMessage.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        {/* Top Navbar */}
        <Navbar
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          userRole={userRole}
          onRoleChange={handleRoleChange}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          ordersCount={contracts.length}
          onNavigateTab={handleNavigateTab}
          activeTab={activeTab}
          weatherAlertsCount={weatherAlerts.filter((a) => !a.isDismissed && a.severity !== 'FAVORABLE').length}
          onOpenWeatherRadar={() => setIsWeatherModalOpen(true)}
          stockAlertsCount={stockAlerts.length}
          stockAlerts={stockAlerts}
          onOpenStockAlerts={() => {
            setActiveTab('marketplace');
            setTimeout(() => {
              const el = document.getElementById('stock-alerts-notification-center-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
          onApplyDiscount={handleApplyListingDiscount}
          onDismissStockAlert={handleDismissStockAlert}
          currentUser={currentUser}
          onOpenLoginModal={handleOpenLoginModal}
          onOpenProfileEdit={() => setIsProfileEditOpen(true)}
          onLogout={handleLogout}
        />

        {/* Quick Role & Software Mode Bar */}
        <div className="bg-[#141B17] border-b border-[#2C3631]/80 px-3 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Left: Software Mode Pill Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#8E9B94] hidden sm:inline">
                {currentLanguage === 'mr' ? 'सॉफ्टवेअर मोड:' : currentLanguage === 'hi' ? 'सॉफ्टवेयर मोड:' : 'Software Mode:'}
              </span>
              <div className="flex items-center p-0.5 bg-[#0F1411] border border-[#2C3631] rounded-full">
                <button
                  id="quick-switch-farmer-btn"
                  type="button"
                  onClick={() => {
                    handleRoleChange('farmer');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    userRole === 'farmer'
                      ? 'bg-[#C2D66E] text-[#0F1411] shadow-sm'
                      : 'text-[#8E9B94] hover:text-[#E5E9E7]'
                  }`}
                >
                  <span>🌾</span>
                  <span>{t.farmerLogin}</span>
                </button>

                <button
                  id="quick-switch-mart-btn"
                  type="button"
                  onClick={() => {
                    handleRoleChange('bulk_buyer');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    userRole === 'bulk_buyer'
                      ? 'bg-emerald-400 text-[#0F1411] shadow-sm'
                      : 'text-[#8E9B94] hover:text-[#E5E9E7]'
                  }`}
                >
                  <span>🏪</span>
                  <span>{t.martLogin}</span>
                </button>
              </div>
            </div>

            {/* Right: Security & Direct Network Status Badge */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A221E] border border-[#2C3631] text-[11px] text-[#8E9B94]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C2D66E]" />
                <span className="text-[#D4E4BC] font-medium hidden xs:inline">
                  {currentLanguage === 'mr' ? 'सुरक्षित कृषी B2B मंच' : 'Encrypted Agri B2B Network'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </span>
            </div>
          </div>
        </div>

          {/* Main Content Area */}
          <main className="flex-1 w-full mx-auto px-3 sm:px-4 py-4 pb-24">
          {activeTab === 'marketplace' && (
            <MarketplaceView
              listings={listings}
              bulkBuyers={bulkBuyers}
              currentLanguage={currentLanguage}
              userRole={userRole}
              currentUser={currentUser}
              onOpenProfileEdit={() => setIsProfileEditOpen(true)}
              onOpenListModal={() => setIsListModalOpen(true)}
              onOpenAddDemandModal={() => setIsAddDemandModalOpen(true)}
              onSelectListingForBid={(listing) => setSelectedListingForBid(listing)}
              onDeleteListing={handleDeleteListing}
              onToggleMarkSold={handleToggleMarkSold}
              onToggleMarkYield={handleToggleMarkYield}
              onDeleteBulkBuyerDemand={handleDeleteBulkDemand}
              onClearAllMarkedYields={handleClearAllMarkedYields}
              onNavigateTab={handleNavigateTab}
              weatherAlerts={weatherAlerts}
              onOpenWeatherRadar={() => setIsWeatherModalOpen(true)}
              stockAlerts={stockAlerts}
              onApplyDiscount={handleApplyListingDiscount}
              onDismissStockAlert={handleDismissStockAlert}
            />
          )}

          {activeTab === 'forecast' && (
            <DemandForecastView
              currentLanguage={currentLanguage}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activeTab === 'cropAdvisor' && (
            <CropRecommendationEngineView
              currentLanguage={currentLanguage}
              onNavigateTab={handleNavigateTab}
              userRole={userRole}
            />
          )}

          {activeTab === 'map' && (
            <FarmParcelMapView
              currentLanguage={currentLanguage}
              currentUser={currentUser}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activeTab === 'logistics' && (
            <LogisticsSupportView
              shipments={activeFreightShipments}
              currentLanguage={currentLanguage}
              onNavigateTab={handleNavigateTab}
              weatherAlerts={weatherAlerts}
              onOpenWeatherRadar={() => setIsWeatherModalOpen(true)}
              onRefreshWeatherAlerts={handleRefreshWeatherAlerts}
              isRefreshingWeatherAlerts={isRefreshingAlerts}
            />
          )}

          {activeTab === 'tutorials' && (
            <TutorialsMasterclassView
              tutorials={modernCropTutorials}
              currentLanguage={currentLanguage}
              selectedTutorialId={selectedTutorialId}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersEscrowView
              contracts={contracts}
              currentLanguage={currentLanguage}
              onNavigateTab={handleNavigateTab}
              onUpdateContractStatus={handleUpdateContractStatus}
              onUpdateContract={handleUpdateContract}
              onDeleteContract={handleDeleteContract}
            />
          )}
        </main>
        </div>
        
        {/* Feature Navigation (Bottom Bar) */}
        <div className="shrink-0 w-full z-50 bg-[#0F1411]">
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleNavigateTab}
            currentLanguage={currentLanguage}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            activeOrdersCount={contracts.length}
          />
        </div>
      </div>

      {/* Real-time Weather Alert Radar & Logistics Risk Modal */}
      <WeatherAlertRadarModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        alerts={weatherAlerts}
        currentLanguage={currentLanguage}
        onRefreshAlerts={handleRefreshWeatherAlerts}
        isRefreshing={isRefreshingAlerts}
        onDismissAlert={handleDismissAlert}
        onNavigateTab={handleNavigateTab}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentLanguage={currentLanguage}
        onNavigateTab={handleNavigateTab}
        onLanguageChange={setCurrentLanguage}
        onOpenListProduce={() => setIsListModalOpen(true)}
        onOpenAddDemand={() => setIsAddDemandModalOpen(true)}
        onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
        onOpenProfileModal={() => setIsProfileEditOpen(true)}
        userRole={userRole}
        currentUser={currentUser}
      />

      {/* List Produce Modal */}
      <ListProduceModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onAddListing={handleAddListing}
        currentLanguage={currentLanguage}
        currentUser={currentUser}
      />

      {/* Post Bulk Buyer Procurement Demand Modal */}
      <PostBulkDemandModal
        isOpen={isAddDemandModalOpen}
        onClose={() => setIsAddDemandModalOpen(false)}
        onAddDemand={handleAddBulkDemand}
        currentLanguage={currentLanguage}
      />

      {/* Buyer Bidding / Direct Purchase Modal */}
      <BuyerBiddingModal
        isOpen={!!selectedListingForBid}
        onClose={() => setSelectedListingForBid(null)}
        listing={selectedListingForBid}
        currentLanguage={currentLanguage}
        onOrderCreated={handleOrderCreated}
      />

      {/* Software Authentication / Login Modal for In-App Switch */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentLanguage={currentLanguage}
        initialRole={loginModalInitialTab}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* Profile & Farm Info Edit Modal */}
      {currentUser && (
        <ProfileEditModal
          isOpen={isProfileEditOpen}
          onClose={() => setIsProfileEditOpen(false)}
          currentUser={currentUser}
          currentLanguage={currentLanguage}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            setToastMessage({
              text:
                currentLanguage === 'mr'
                  ? `🌾 माहिती यशस्वीपणे अद्ययावत केली! (${updated.name})`
                  : currentLanguage === 'hi'
                  ? `🌾 प्रोफ़ाइल व खेत की जानकारी सफलतापूर्वक अपडेट हुई! (${updated.name})`
                  : `🌾 Profile & Farm Details successfully updated! (${updated.name})`,
              type: 'success',
            });
            setTimeout(() => {
              setToastMessage((prev) => (prev?.type === 'success' ? null : prev));
            }, 4500);
          }}
        />
      )}
    </div>
  );
};

export default App;
