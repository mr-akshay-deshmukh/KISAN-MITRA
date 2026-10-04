import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Camera,
  Upload,
  Phone,
  Mail,
  MapPin,
  Sprout,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  Building2,
  FileBadge,
  Save,
  CreditCard,
  Droplets,
  Layers,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { UserProfile, LanguageCode, AuthRole } from '../types';
import { GoogleLogoIcon } from './GoogleIcons';
import { updateUserProfile } from '../services/authService';
import confetti from 'canvas-confetti';

const SAVED_FARMER_INFO_KEY = 'kisan_persistent_farmer_info';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  currentLanguage: LanguageCode;
  onProfileUpdated: (updatedUser: UserProfile) => void;
}

const PRESET_AVATARS_FARMER = [
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    label: 'Progressive Farmer',
  },
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    label: 'Women Agri Leader',
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    label: 'Organic Cultivator',
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    label: 'Orchard Owner',
  },
  {
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    label: 'Polyhouse Specialist',
  },
];

const PRESET_AVATARS_MART = [
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    label: 'Procurement Manager',
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    label: 'Retail Category Head',
  },
  {
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    label: 'Wholesale Buyer',
  },
];

const POPULAR_CROPS = [
  'Dragon Fruit (ड्रॅगन फ्रूट)',
  'Pomegranate / Kesar (डाळिंब)',
  'Grapes / Thomson (द्राक्षे)',
  'Export Banana (केळी)',
  'Nashik Red Onion (कांदा)',
  'Tomato (टोमॅटो)',
  'Soybean (सोयाबीन)',
  'Sugarcane (ऊस)',
  'Turmeric / Haldi (हळद)',
  'Cotton (कापूस)',
  'Capsicum (ढोबळी मिरची)',
  'Ginger (आले)',
];

const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Gujarat',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Telangana',
  'Punjab',
  'Haryana',
  'Rajasthan',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Kerala',
  'Bihar',
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentLanguage,
  onProfileUpdated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser.whatsappNumber || currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || currentUser.googleEmail || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  
  // Farmer Specific Fields
  const [farmName, setFarmName] = useState(currentUser.farmName || '');
  const [villageOrDistrict, setVillageOrDistrict] = useState(currentUser.villageOrDistrict || '');
  const [state, setState] = useState(currentUser.state || 'Maharashtra');
  const [pinCode, setPinCode] = useState(currentUser.pinCode || '');
  const [landSizeAcres, setLandSizeAcres] = useState<number>(currentUser.landSizeAcres || 5);
  const [kisanId, setKisanId] = useState(currentUser.kisanId || '');
  const [organicCertified, setOrganicCertified] = useState<boolean>(currentUser.organicCertified ?? true);
  const [soilType, setSoilType] = useState<string>(currentUser.soilType || 'Black Cotton (काळी कसदार)');
  const [irrigationType, setIrrigationType] = useState<string>(currentUser.irrigationType || 'Drip Irrigation (ठिबक सिंचन)');
  const [bankUpiOrAccount, setBankUpiOrAccount] = useState<string>(currentUser.bankUpiOrAccount || '');
  const [bioOrNotes, setBioOrNotes] = useState<string>(currentUser.bioOrNotes || '');
  
  // Selected Crops
  const [selectedCrops, setSelectedCrops] = useState<string[]>(
    currentUser.primaryCrops && currentUser.primaryCrops.length > 0
      ? currentUser.primaryCrops
      : ['Dragon Fruit (ड्रॅगन फ्रूट)', 'Pomegranate / Kesar (डाळिंब)']
  );
  const [newCropInput, setNewCropInput] = useState('');

  // Mart Specific Fields
  const [martName, setMartName] = useState(currentUser.martName || '');
  const [martType, setMartType] = useState(currentUser.martType || 'Supermarket Mart');
  const [city, setCity] = useState(currentUser.city || '');
  const [gstinOrLicense, setGstinOrLicense] = useState(currentUser.gstinOrLicense || '');
  const [procurementCapacityTons, setProcurementCapacityTons] = useState<number>(currentUser.procurementCapacityTonsPerMonth || 150);
  const [contactPerson, setContactPerson] = useState(currentUser.contactPerson || currentUser.name);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize state when modal is opened or currentUser updates
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setWhatsappNumber(currentUser.whatsappNumber || currentUser.phone || '');
      setEmail(currentUser.email || currentUser.googleEmail || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setFarmName(currentUser.farmName || '');
      setVillageOrDistrict(currentUser.villageOrDistrict || '');
      setState(currentUser.state || 'Maharashtra');
      setPinCode(currentUser.pinCode || '');
      setLandSizeAcres(currentUser.landSizeAcres || 5);
      setKisanId(currentUser.kisanId || '');
      setOrganicCertified(currentUser.organicCertified ?? true);
      setSoilType(currentUser.soilType || 'Black Cotton (काळी कसदार)');
      setIrrigationType(currentUser.irrigationType || 'Drip Irrigation (ठिबक सिंचन)');
      setBankUpiOrAccount(currentUser.bankUpiOrAccount || '');
      setBioOrNotes(currentUser.bioOrNotes || '');
      if (currentUser.primaryCrops && currentUser.primaryCrops.length > 0) {
        setSelectedCrops(currentUser.primaryCrops);
      }
      setMartName(currentUser.martName || '');
      setMartType(currentUser.martType || 'Supermarket Mart');
      setCity(currentUser.city || '');
      setGstinOrLicense(currentUser.gstinOrLicense || '');
      setProcurementCapacityTons(currentUser.procurementCapacityTonsPerMonth || 150);
      setContactPerson(currentUser.contactPerson || currentUser.name);
      setErrorMessage('');
      setSaveSuccessMessage('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const isFarmer = currentUser.role === 'farmer';

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#C2D66E', '#D4E4BC', '#10B981'],
      });
    } catch {
      // ignore
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        currentLanguage === 'mr'
          ? 'कृपया ५ MB पेक्षा लहान आकाराचा फोटो निवडा.'
          : 'Please select an image smaller than 5 MB.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatarUrl(event.target.result);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter((c) => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleAddCustomCrop = () => {
    const trimmed = newCropInput.trim();
    if (trimmed && !selectedCrops.includes(trimmed)) {
      setSelectedCrops([...selectedCrops, trimmed]);
      setNewCropInput('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage(
        currentLanguage === 'mr' ? 'कृपया पूर्ण नाव प्रविष्ट करा.' : 'Please enter your full name.'
      );
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage(
        currentLanguage === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.' : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    setTimeout(() => {
      const updatedData: Partial<UserProfile> = {
        name: name.trim(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim(),
        avatarUrl: avatarUrl.trim() || currentUser.avatarUrl,
        ...(isFarmer
          ? {
              farmName: farmName.trim() || `${name.trim()} Farm`,
              villageOrDistrict: villageOrDistrict.trim() || 'Baramati, Pune',
              state: state.trim(),
              pinCode: pinCode.trim(),
              landSizeAcres: Number(landSizeAcres) || 1,
              primaryCrops: selectedCrops.length > 0 ? selectedCrops : ['Vegetables', 'Fruits'],
              kisanId: kisanId.trim() || `MH-KSN-${Math.floor(1000 + Math.random() * 9000)}`,
              organicCertified,
              soilType,
              irrigationType,
              bankUpiOrAccount: bankUpiOrAccount.trim(),
              bioOrNotes: bioOrNotes.trim(),
            }
          : {
              martName: martName.trim() || `${name.trim()} SuperMart`,
              martType: martType as any,
              city: city.trim() || 'Pune',
              gstinOrLicense: gstinOrLicense.trim(),
              procurementCapacityTonsPerMonth: Number(procurementCapacityTons) || 100,
              contactPerson: contactPerson.trim() || name.trim(),
            }),
      };

      const result = updateUserProfile(updatedData);
      setIsSaving(false);

      if (result) {
        if (isFarmer) {
          try {
            localStorage.setItem(
              SAVED_FARMER_INFO_KEY,
              JSON.stringify({
                sellerName: (farmName.trim() || name.trim()),
                sellerType: 'Farmer',
                location: villageOrDistrict.trim() || 'Baramati, Pune',
                state: state.trim() || 'Maharashtra',
                district: villageOrDistrict.split(',').pop()?.trim() || 'Pune',
                contactNumber: phone.trim(),
                updatedAt: new Date().toISOString(),
              })
            );
          } catch (e) {
            console.warn('Failed to sync persistent farmer info:', e);
          }
        }

        triggerConfetti();
        onProfileUpdated(result);
        setSaveSuccessMessage(
          currentLanguage === 'mr'
            ? 'आपली माहिती व शेतीचा तपशील यशस्वीरित्या सेव्ह झाला!'
            : currentLanguage === 'hi'
            ? 'आपकी जानकारी व कृषि विवरण सफलतापूर्वक सहेजा गया!'
            : 'Your profile and farm details have been saved successfully!'
        );
        setTimeout(() => {
          onClose();
        }, 800);
      }
    }, 400);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        id="profile-edit-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-3xl bg-[#141B17] border border-[#2C3631] rounded-3xl shadow-2xl overflow-hidden my-auto text-[#E5E9E7] max-h-[90vh] flex flex-col"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#1A221E] via-[#202B25] to-[#1A221E] px-5 sm:px-6 py-4 border-b border-[#2C3631] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/15 border border-[#C2D66E]/40 flex items-center justify-center text-[#C2D66E] shadow-inner">
              {isFarmer ? <Sprout className="w-5 h-5 text-[#C2D66E]" /> : <Building2 className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#E5E9E7] tracking-tight font-serif">
                  {isFarmer
                    ? (currentLanguage === 'mr' ? 'शेतकरी प्रोफाइल व शेतजमीन तपशील' : currentLanguage === 'hi' ? 'किसान प्रोफ़ाइल व खेत विवरण' : 'Farmer Profile & Farm Details')
                    : (currentLanguage === 'mr' ? 'मार्ट व खरेदीदार माहिती अद्ययावत करा' : 'Mart Buyer Profile & Sourcing Details')}
                </h2>
                <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  {isFarmer ? 'Kisan KYC' : 'Mart KYC'}
                </span>
              </div>
              <p className="text-xs text-[#8E9B94]">
                {currentLanguage === 'mr'
                  ? 'आपला फोटो, मोबाईल नंबर, शेतीचे क्षेत्रफळ व पिकांची माहिती भरा'
                  : 'Add your photo, phone number, land records, and primary crops'}
              </p>
            </div>
          </div>

          <button
            id="close-profile-modal-btn"
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1A221E] hover:bg-[#2C3631] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631] flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSave} className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          
          {/* Status Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl text-xs text-red-300 flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccessMessage && (
            <div className="p-3 bg-emerald-950/40 border border-[#C2D66E] rounded-2xl text-xs text-[#C2D66E] flex items-center gap-2 font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-[#C2D66E]" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* Section 1: Profile Photo / Image Upload & Presets */}
          <div className="bg-[#0F1411] border border-[#2C3631] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4E4BC] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#C2D66E]" />
                <span>{currentLanguage === 'mr' ? '१. प्रोफाइल फोटो / शेतीचे छायाचित्र' : '1. Profile Photo / Farm Image'}</span>
              </span>
              <span className="text-[10px] text-[#8E9B94]">
                {currentLanguage === 'mr' ? 'खरेदीदारांना विश्वास वाढवण्यासाठी' : 'Helps buyers verify your farm'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar Live Preview */}
              <div className="relative group">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                  alt={name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#C2D66E]/60 shadow-lg shadow-[#C2D66E]/10"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-[10px] font-bold text-white transition-opacity cursor-pointer gap-1"
                >
                  <Upload className="w-4 h-4 text-[#C2D66E]" />
                  <span>{currentLanguage === 'mr' ? 'बदला' : 'Change'}</span>
                </button>

                {currentUser.authProvider === 'google' && (
                  <span className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200" title="Google Synced">
                    <GoogleLogoIcon className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Upload Controls & Presets */}
              <div className="flex-1 w-full space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    id="upload-farmer-photo-btn"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-[#1A241E] hover:bg-[#233129] border border-[#C2D66E]/40 text-[#C2D66E] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{currentLanguage === 'mr' ? 'डिव्हाइसवरून फोटो अपलोड करा' : 'Upload From Device'}</span>
                  </button>

                  <span className="text-[11px] text-[#8E9B94]">
                    {currentLanguage === 'mr' ? 'किंवा खालीलपैकी एक अवतार निवडा:' : 'or choose a preset avatar:'}
                  </span>
                </div>

                {/* Preset Avatars Row */}
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {(isFarmer ? PRESET_AVATARS_FARMER : PRESET_AVATARS_MART).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      title={preset.label}
                      className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        avatarUrl === preset.url
                          ? 'border-[#C2D66E] ring-2 ring-[#C2D66E]/40 scale-105'
                          : 'border-[#2C3631] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      {avatarUrl === preset.url && (
                        <div className="absolute inset-0 bg-[#C2D66E]/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-[#0F1411] stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Personal & Contact Information */}
          <div className="bg-[#0F1411] border border-[#2C3631] rounded-2xl p-4 sm:p-5 space-y-4">
            <span className="text-xs font-bold text-[#D4E4BC] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#C2D66E]" />
              <span>{currentLanguage === 'mr' ? '२. वैयक्तिक व संपर्क तपशील' : '2. Personal & Contact Info'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                  {currentLanguage === 'mr' ? 'पूर्ण नाव (Full Name) *' : 'Full Name *'}
                </label>
                <div className="flex items-center rounded-xl bg-[#141B17] border border-[#2C3631] focus-within:border-[#C2D66E] px-3 py-2.5 text-xs sm:text-sm">
                  <User className="w-4 h-4 text-[#8E9B94] mr-2 shrink-0" />
                  <input
                    id="profile-fullname-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. मंदार करंडे"
                    className="w-full bg-transparent text-[#E5E9E7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                  {currentLanguage === 'mr' ? 'मोबाईल नंबर (Mobile Number) *' : 'Mobile Number *'}
                </label>
                <div className="flex items-center rounded-xl bg-[#141B17] border border-[#2C3631] focus-within:border-[#C2D66E] px-3 py-2.5 text-xs sm:text-sm">
                  <Phone className="w-4 h-4 text-[#8E9B94] mr-2 shrink-0" />
                  <input
                    id="profile-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98220 14892"
                    className="w-full bg-transparent text-[#E5E9E7] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#8E9B94]">
                    {currentLanguage === 'mr' ? 'व्हॉट्सॲप नंबर (WhatsApp Number)' : 'WhatsApp Number'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setWhatsappNumber(phone)}
                    className="text-[10px] text-[#C2D66E] hover:underline font-semibold cursor-pointer"
                  >
                    {currentLanguage === 'mr' ? 'मोबाईल नंबर सारखाच' : 'Same as Phone'}
                  </button>
                </div>
                <div className="flex items-center rounded-xl bg-[#141B17] border border-[#2C3631] focus-within:border-[#C2D66E] px-3 py-2.5 text-xs sm:text-sm">
                  <span className="text-[#25D366] text-sm mr-2 shrink-0">📱</span>
                  <input
                    id="profile-whatsapp-input"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 98220 14892"
                    className="w-full bg-transparent text-[#E5E9E7] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                  {currentLanguage === 'mr' ? 'ईमेल पत्ता (Email Address)' : 'Email Address'}
                </label>
                <div className="flex items-center rounded-xl bg-[#141B17] border border-[#2C3631] focus-within:border-[#C2D66E] px-3 py-2.5 text-xs sm:text-sm">
                  <Mail className="w-4 h-4 text-[#8E9B94] mr-2 shrink-0" />
                  <input
                    id="profile-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer.karande@gmail.com"
                    className="w-full bg-transparent text-[#E5E9E7] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Farm & Land Details (FARMER ROLE) */}
          {isFarmer ? (
            <div className="bg-[#0F1411] border border-[#2C3631] rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4E4BC] uppercase tracking-wider flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-[#C2D66E]" />
                  <span>{currentLanguage === 'mr' ? '३. शेतजमीन व पिकांचा तपशील (Farm Details)' : '3. Farm & Crop Details'}</span>
                </span>
                <label className="flex items-center gap-2 cursor-pointer bg-[#1A241E] px-2.5 py-1 rounded-full border border-[#C2D66E]/40 text-xs text-[#C2D66E] font-semibold">
                  <input
                    type="checkbox"
                    checked={organicCertified}
                    onChange={(e) => setOrganicCertified(e.target.checked)}
                    className="accent-[#C2D66E] cursor-pointer"
                  />
                  <span>{currentLanguage === 'mr' ? '🌱 सेंद्रिय / जैविक प्रमाणित' : '🌱 Organic Certified'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'फार्म / मळ्याचे नाव (Farm Name)' : 'Farm / Estate Name'}
                  </label>
                  <input
                    id="profile-farmname-input"
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="उदा. करंडे ऑरगॅनिक ऑर्चर्ड फार्म्स"
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'गाव / तालुका / जिल्हा (Village / District) *' : 'Village / District *'}
                  </label>
                  <div className="flex items-center rounded-xl bg-[#141B17] border border-[#2C3631] focus-within:border-[#C2D66E] px-3 py-2.5 text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 text-[#8E9B94] mr-2 shrink-0" />
                    <input
                      id="profile-district-input"
                      type="text"
                      required
                      value={villageOrDistrict}
                      onChange={(e) => setVillageOrDistrict(e.target.value)}
                      placeholder="उदा. बारामती, पुणे"
                      className="w-full bg-transparent text-[#E5E9E7] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'राज्य (State)' : 'State'}
                  </label>
                  <select
                    id="profile-state-select"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s} className="bg-[#141B17] text-[#E5E9E7]">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'पिनकोड (PIN Code)' : 'PIN Code'}
                  </label>
                  <input
                    id="profile-pincode-input"
                    type="text"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="413102"
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'एकूण जमीन (Land Size in Acres)' : 'Land Size (Acres)'}
                  </label>
                  <input
                    id="profile-landsize-input"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'किसान क्रेडिट / ७/१२ नोंद क्रमांक (Kisan ID / 7/12)' : 'Kisan ID / 7/12 Record'}
                  </label>
                  <div className="flex items-center rounded-xl bg-[#141B17] border border-[#2C3631] focus-within:border-[#C2D66E] px-3 py-2.5 text-xs sm:text-sm">
                    <FileBadge className="w-4 h-4 text-[#8E9B94] mr-2 shrink-0" />
                    <input
                      id="profile-kisanid-input"
                      type="text"
                      value={kisanId}
                      onChange={(e) => setKisanId(e.target.value)}
                      placeholder="MH-KSN-7842"
                      className="w-full bg-transparent text-[#E5E9E7] focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'मातीचा प्रकार (Soil Type)' : 'Soil Type'}
                  </label>
                  <div className="flex items-center rounded-xl bg-[#141B17] border border-[#2C3631] focus-within:border-[#C2D66E] px-3 py-2 text-xs sm:text-sm">
                    <Layers className="w-4 h-4 text-[#8E9B94] mr-2 shrink-0" />
                    <select
                      id="profile-soil-select"
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full bg-transparent text-[#E5E9E7] focus:outline-none text-xs sm:text-sm"
                    >
                      <option value="Black Cotton (काळी कसदार)" className="bg-[#141B17]">Black Cotton (काळी कसदार)</option>
                      <option value="Red Loamy (तांबडी चिकण)" className="bg-[#141B17]">Red Loamy (तांबडी चिकण)</option>
                      <option value="Sandy Loam (रेताड पोयटा)" className="bg-[#141B17]">Sandy Loam (रेताड पोयटा)</option>
                      <option value="Alluvial (गाळाची जमीन)" className="bg-[#141B17]">Alluvial (गाळाची जमीन)</option>
                      <option value="Laterite (जांभा प्रकार)" className="bg-[#141B17]">Laterite (जांभा प्रकार)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'सिंचन पद्धत (Irrigation Method)' : 'Irrigation System'}
                  </label>
                  <div className="flex items-center rounded-xl bg-[#141B17] border border-[#2C3631] focus-within:border-[#C2D66E] px-3 py-2 text-xs sm:text-sm">
                    <Droplets className="w-4 h-4 text-[#8E9B94] mr-2 shrink-0" />
                    <select
                      id="profile-irrigation-select"
                      value={irrigationType}
                      onChange={(e) => setIrrigationType(e.target.value)}
                      className="w-full bg-transparent text-[#E5E9E7] focus:outline-none text-xs sm:text-sm"
                    >
                      <option value="Drip Irrigation (ठिबक सिंचन)" className="bg-[#141B17]">Drip Irrigation (ठिबक सिंचन)</option>
                      <option value="Sprinkler System (तुषार सिंचन)" className="bg-[#141B17]">Sprinkler System (तुषार सिंचन)</option>
                      <option value="Borewell & Well (विहीर / बोअरवेल)" className="bg-[#141B17]">Borewell & Well (विहीर / बोअरवेल)</option>
                      <option value="Canal / Flood (कालवा)" className="bg-[#141B17]">Canal / Flood (कालवा)</option>
                      <option value="Rainfed (कोरडवाहू)" className="bg-[#141B17]">Rainfed (कोरडवाहू)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Primary Crops Selector */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-semibold text-[#8E9B94]">
                  {currentLanguage === 'mr' ? 'प्रमुख पिके (Primary Crops Grown) - क्लिक करून निवडा:' : 'Primary Crops Grown (Click to select):'}
                </label>
                
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {POPULAR_CROPS.map((crop) => {
                    const isSelected = selectedCrops.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => toggleCrop(crop)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#C2D66E] text-[#0F1411] shadow-xs'
                            : 'bg-[#18221B] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{crop}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Crop Add */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newCropInput}
                    onChange={(e) => setNewCropInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomCrop();
                      }
                    }}
                    placeholder={currentLanguage === 'mr' ? 'इतर पीक जोडा (उदा. स्ट्रॉबेरी, पेरू)...' : 'Add other crop (e.g. Guava, Custard Apple)...'}
                    className="flex-1 px-3 py-2 bg-[#141B17] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl text-xs text-[#E5E9E7] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCrop}
                    className="px-3 py-2 bg-[#1E2822] hover:bg-[#2A372F] text-[#C2D66E] rounded-xl text-xs font-bold border border-[#C2D66E]/40 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{currentLanguage === 'mr' ? 'जोडा' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Section 3: Mart Buyer Details (MART ROLE) */
            <div className="bg-[#0F1411] border border-[#2C3631] rounded-2xl p-4 sm:p-5 space-y-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{currentLanguage === 'mr' ? '३. मार्ट / खरेदीदार कंपनी तपशील' : '3. Mart & Sourcing Details'}</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'मार्ट / कंपनीचे नाव (Mart Name) *' : 'Mart / Company Name *'}
                  </label>
                  <input
                    id="profile-martname-input"
                    type="text"
                    required
                    value={martName}
                    onChange={(e) => setMartName(e.target.value)}
                    placeholder="उदा. ग्रीन बास्केट सुपरमार्ट"
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-emerald-400 rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'मार्ट प्रकार (Category)' : 'Category'}
                  </label>
                  <select
                    value={martType}
                    onChange={(e: any) => setMartType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-emerald-400 rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none"
                  >
                    <option value="Supermarket Mart">Supermarket Mart</option>
                    <option value="Retail Chain Mart">Retail Chain Mart</option>
                    <option value="Wholesale Cash & Carry">Wholesale Cash & Carry</option>
                    <option value="Hypermarket">Hypermarket</option>
                    <option value="Agri-Export Mart">Agri-Export Mart</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'शहर व हब (City / Warehouse Hub)' : 'City / Hub'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="उदा. पुणे व मुंबई हब"
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-emerald-400 rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'जीएसटीआयएन / लायसन्स (GSTIN)' : 'GSTIN / FSSAI'}
                  </label>
                  <input
                    type="text"
                    value={gstinOrLicense}
                    onChange={(e) => setGstinOrLicense(e.target.value)}
                    placeholder="27AABCG1234F1Z1"
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-emerald-400 rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'मासिक खरेदी क्षमता (Tons/Month)' : 'Procurement Capacity (Tons/Month)'}
                  </label>
                  <input
                    type="number"
                    value={procurementCapacityTons}
                    onChange={(e) => setProcurementCapacityTons(parseInt(e.target.value) || 50)}
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-emerald-400 rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'संपर्क अधिकारी (Contact Person)' : 'Contact Person'}
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Procurement Head"
                    className="w-full px-3 py-2.5 bg-[#141B17] border border-[#2C3631] focus:border-emerald-400 rounded-xl text-xs sm:text-sm text-[#E5E9E7] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Bank UPI / Escrow Direct Payout (FARMER) */}
          {isFarmer && (
            <div className="bg-[#0F1411] border border-[#2C3631] rounded-2xl p-4 sm:p-5 space-y-3">
              <span className="text-xs font-bold text-[#D4E4BC] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#C2D66E]" />
                <span>{currentLanguage === 'mr' ? '४. थेट बँक ट्रान्सफर व UPI तपशील (Direct Escrow Payouts)' : '4. Direct Bank Transfer & UPI'}</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'UPI ID किंवा बँक खाते (Bank UPI / A/C)' : 'Bank UPI ID or A/C'}
                  </label>
                  <div className="flex items-center rounded-xl bg-[#141B17] border border-[#2C3631] focus-within:border-[#C2D66E] px-3 py-2.5 text-xs sm:text-sm">
                    <span className="text-[#C2D66E] font-mono text-xs font-bold mr-2">₹</span>
                    <input
                      id="profile-upi-input"
                      type="text"
                      value={bankUpiOrAccount}
                      onChange={(e) => setBankUpiOrAccount(e.target.value)}
                      placeholder="9822014892@oksbi किंवा ICICI Bank A/C"
                      className="w-full bg-transparent text-[#E5E9E7] focus:outline-none font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-[#8E9B94] mt-1">
                    {currentLanguage === 'mr'
                      ? 'शेतमाल डिलिव्हरीनंतर थेट एस्क्रो रक्कम या खात्यात जमा केली जाते.'
                      : 'Escrow payment is deposited directly to this account upon delivery weighment.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9B94] mb-1.5">
                    {currentLanguage === 'mr' ? 'शेतीची विशेष माहिती (Farm Bio / Tagline)' : 'Farm Bio / Tagline for Buyers'}
                  </label>
                  <textarea
                    rows={2}
                    value={bioOrNotes}
                    onChange={(e) => setBioOrNotes(e.target.value)}
                    placeholder={currentLanguage === 'mr' ? 'उदा. उच्च दर्जाचे ड्रॅगन फ्रूट व डाळिंब बागायतदार...' : 'e.g. Premium export-quality Dragon Fruit and Pomegranate orchard...'}
                    className="w-full px-3 py-2 bg-[#141B17] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl text-xs text-[#E5E9E7] focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Footer */}
          <div className="pt-3 border-t border-[#2C3631] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2C3631] bg-[#161D19] hover:bg-[#202924] text-xs font-semibold text-[#8E9B94] hover:text-[#E5E9E7] transition-all cursor-pointer"
            >
              {currentLanguage === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>

            <button
              id="save-farmer-profile-btn"
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#C2D66E]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#0F1411]" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{currentLanguage === 'mr' ? 'माहिती सेव्ह करा' : currentLanguage === 'hi' ? 'जानकारी सहेजें' : 'Save Profile & Farm Details'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
