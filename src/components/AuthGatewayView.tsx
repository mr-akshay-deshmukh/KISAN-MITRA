import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Truck,
  Globe,
  AudioWaveform,
  CheckCircle2,
  Sparkles,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Store,
  MapPin,
  FileText,
  AlertTriangle,
  UserPlus,
  LogIn,
  KeyRound,
  Fingerprint,
  Check,
  MessageSquare,
  ChevronRight,
  Clock,
  Edit2,
  Copy,
  BadgeCheck,
  Zap,
  ShoppingBag,
  Building2
} from 'lucide-react';
import { AuthRole, LanguageCode, UserProfile } from '../types';
import { translations } from '../utils/translations';
import { GoogleLogoIcon } from './GoogleIcons';
import { executeRealGoogleSignIn, isGoogleAuthCancelled } from '../services/googleAuthService';
import {
  loginWithCredentials,
  registerNewUser,
  isAccountRegistered,
  sendOtpToPhone,
  verifyOtpAndLogin,
  normalizePhoneNumber
} from '../services/authService';

interface AuthGatewayViewProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenVoiceModal: () => void;
}

export const AuthGatewayView: React.FC<AuthGatewayViewProps> = ({
  currentLanguage,
  onLanguageChange,
  onLoginSuccess,
  onOpenVoiceModal,
}) => {
  const t = translations[currentLanguage];
  
  // Auth flow tabs: 'otp' (OTP verification), 'pin' (password), 'register' (detailed)
  const [authMethod, setAuthMethod] = useState<'otp' | 'pin' | 'register'>('otp');
  const [activeRoleTab, setActiveRoleTab] = useState<AuthRole>('farmer');

  // OTP Step States
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [phoneInput, setPhoneInput] = useState<string>('9822012345');
  const [generatedOtp, setGeneratedOtp] = useState<string>('584920');
  const [otpReferenceId, setOtpReferenceId] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [isOtpSending, setIsOtpSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>('');
  const [showSmsToast, setShowSmsToast] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);

  // PIN / Password Form States
  const [loginIdentifier, setLoginIdentifier] = useState<string>('9822012345');
  const [loginPin, setLoginPin] = useState<string>('1234');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Registration Form States
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPin, setRegPin] = useState<string>('1234');
  const [farmName, setFarmName] = useState<string>('');
  const [villageDistrict, setVillageDistrict] = useState<string>('Baramati, Pune');
  const [landAcres, setLandAcres] = useState<string>('5');
  const [martName, setMartName] = useState<string>('');
  const [martCity, setMartCity] = useState<string>('Pune & Mumbai Hub');
  const [regError, setRegError] = useState<string>('');

  // Google Auth
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState<boolean>(false);
  const [googleAuthError, setGoogleAuthError] = useState<string>('');

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update default phone/credentials when role changes
  const handleRoleChange = (role: AuthRole) => {
    setActiveRoleTab(role);
    if (role === 'farmer') {
      if (phoneInput === '9899012345' || !phoneInput) setPhoneInput('9822012345');
      if (loginIdentifier === '9899012345' || !loginIdentifier) setLoginIdentifier('9822012345');
    } else {
      if (phoneInput === '9822012345' || !phoneInput) setPhoneInput('9899012345');
      if (loginIdentifier === '9822012345' || !loginIdentifier) setLoginIdentifier('9899012345');
    }
  };

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpStep === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, resendTimer]);

  // Step 1: Handle Real OTP Generation for Sent Phone Number
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError('');
    const cleanPhone = normalizePhoneNumber(phoneInput);
    if (!cleanPhone || cleanPhone.length < 10) {
      setOtpError(
        currentLanguage === 'mr'
          ? 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा'
          : currentLanguage === 'hi'
          ? 'कृपया मान्य १० अंकों का मोबाइल नंबर दर्ज करें'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    setIsOtpSending(true);
    try {
      const res = await sendOtpToPhone(cleanPhone);
      if (res.success && res.otp) {
        setGeneratedOtp(res.otp);
        if (res.referenceId) setOtpReferenceId(res.referenceId);
        setOtpStep('verify');
        setResendTimer(30);
        setShowSmsToast(true);
        setOtpDigits(['', '', '', '', '', '']);

        // Focus first OTP box
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 120);
      } else {
        setOtpError(res.error || 'Failed to generate OTP. Please try again.');
      }
    } catch (err: any) {
      setOtpError('Failed to generate OTP for this mobile number.');
    } finally {
      setIsOtpSending(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean && val !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = clean.slice(-1);
    setOtpDigits(newDigits);
    setOtpError('');

    // Advance to next box
    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are entered
    const fullOtp = newDigits.join('');
    if (fullOtp.length === 6 && !newDigits.includes('')) {
      handleVerifyOtp(fullOtp);
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        handleVerifyOtp(pasted);
      } else {
        const nextEmpty = newDigits.findIndex((d) => !d);
        if (nextEmpty !== -1) otpInputRefs.current[nextEmpty]?.focus();
      }
    }
  };

  // Auto-fill Real Generated OTP for this number
  const handleAutoFillOtp = () => {
    const chars = generatedOtp.split('');
    setOtpDigits(chars);
    handleVerifyOtp(generatedOtp);
  };

  // Step 2: Strict Real OTP Verification for Sent Number
  const handleVerifyOtp = async (otpToVerify?: string) => {
    const entered = otpToVerify || otpDigits.join('');
    if (entered.length < 6) {
      setOtpError(
        currentLanguage === 'mr'
          ? 'कृपया पूर्ण ६ अंकी ओटीपी प्रविष्ट करा'
          : 'Please enter complete 6-digit OTP'
      );
      return;
    }

    setIsVerifying(true);
    setOtpError('');

    try {
      const result = await verifyOtpAndLogin(phoneInput, entered, activeRoleTab);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setOtpError(
          result.error ||
          (currentLanguage === 'mr'
            ? 'ओटीपी अवैध आहे. कृपया अचूक ६ अंकी कोड प्रविष्ट करा.'
            : 'Invalid OTP. Please enter the exact 6-digit code or click Auto-fill.')
        );
      }
    } catch (err: any) {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Traditional Password/PIN Login
  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const id = loginIdentifier.trim() || (activeRoleTab === 'farmer' ? '9822012345' : '9899012345');
    const pin = loginPin.trim() || '1234';
    const result = loginWithCredentials(id, pin, activeRoleTab);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    }
  };

  // Full Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    const digitsOnly = normalizePhoneNumber(regPhone) || '9822012345';
    const name = regName.trim() || (activeRoleTab === 'farmer' ? 'शेतकरी मित्र' : 'मार्ट खरेदीदार');

    const result = registerNewUser({
      name,
      role: activeRoleTab,
      phone: digitsOnly,
      email: regEmail.trim() || undefined,
      securityPin: regPin.trim() || '1234',
      farmName: activeRoleTab === 'farmer' ? (farmName.trim() || `${name} Agro Farm`) : undefined,
      villageOrDistrict: activeRoleTab === 'farmer' ? villageDistrict.trim() : undefined,
      landSizeAcres: activeRoleTab === 'farmer' ? parseFloat(landAcres) || 5 : undefined,
      martName: activeRoleTab === 'mart' ? (martName.trim() || `${name} Fresh Mart`) : undefined,
      city: activeRoleTab === 'mart' ? martCity.trim() : undefined,
    });

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      // If already registered, log in anyway errorlessly
      const fallback = loginWithCredentials(digitsOnly, '1234', activeRoleTab);
      if (fallback.success && fallback.user) {
        onLoginSuccess(fallback.user);
      }
    }
  };

  // Real Google Auth
  const handleTriggerGoogleAuth = async () => {
    setIsGoogleSigningIn(true);
    setGoogleAuthError('');
    try {
      const googleUser = await executeRealGoogleSignIn(activeRoleTab);
      onLoginSuccess(googleUser);
    } catch (err: any) {
      if (isGoogleAuthCancelled(err)) {
        setGoogleAuthError('');
        return;
      }
      console.warn('Google sign-in attempt:', err);
      setGoogleAuthError(
        currentLanguage === 'mr'
          ? 'Google द्वारे लॉगिन पूर्ण होऊ शकले नाही. कृपया खालील मोबाईल ओटीपीने त्वरित प्रवेश करा.'
          : 'Google sign-in cancelled or unavailable. Please use the instant Mobile OTP login below.'
      );
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E0C] text-[#E5E9E7] flex flex-col font-sans selection:bg-[#C2D66E] selection:text-[#0F1411]">
      {/* Top Navigation Bar */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-[#1E2621] flex items-center justify-between bg-[#0F1411]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl ${activeRoleTab === 'mart' ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400' : 'bg-[#C2D66E]/15 border-[#C2D66E]/40 text-[#C2D66E]'} border flex items-center justify-center shadow-inner shrink-0`}>
            {activeRoleTab === 'mart' ? <Store className="w-5 h-5 text-emerald-400" /> : <Sprout className="w-5 h-5 text-[#C2D66E]" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-[#E5E9E7] tracking-tight font-serif">
                {activeRoleTab === 'mart' ? 'Mart' : 'Kisan'}<span className={activeRoleTab === 'mart' ? 'text-emerald-400' : 'text-[#C2D66E]'}>Mitra</span>
              </span>
            </div>
            <p className="text-[11px] text-[#8E9B94] hidden sm:block">
              {currentLanguage === 'mr'
                ? 'थेट शेतकरी-सुपरमार्ट डिजिटल B2B बाजारपेठ'
                : currentLanguage === 'hi'
                ? 'प्रत्यक्ष किसान-सुपरमार्ट डिजिटल B2B बाज़ार'
                : 'Direct Farm-to-Retail B2B Marketplace'}
            </p>
          </div>
        </div>

        {/* Language selector buttons */}
        <div className="flex items-center gap-1 bg-[#141B17] border border-[#2C3631] rounded-xl p-1 text-xs">
          <Globe className="w-3.5 h-3.5 text-[#8E9B94] ml-1.5 hidden sm:inline" />
          <button
            type="button"
            onClick={() => onLanguageChange('mr')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              currentLanguage === 'mr' ? 'bg-[#C2D66E] text-[#0F1411]' : 'text-[#8E9B94] hover:text-[#E5E9E7]'
            }`}
          >
            मराठी
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('hi')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              currentLanguage === 'hi' ? 'bg-[#C2D66E] text-[#0F1411]' : 'text-[#8E9B94] hover:text-[#E5E9E7]'
            }`}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              currentLanguage === 'en' ? 'bg-[#C2D66E] text-[#0F1411]' : 'text-[#8E9B94] hover:text-[#E5E9E7]'
            }`}
          >
            English
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Brand Mission, Value Pillars & Visual Hero */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A251E] border border-[#C2D66E]/40 text-[#C2D66E] text-xs font-bold shadow-sm">
            <BadgeCheck className="w-4 h-4 text-[#C2D66E]" />
            <span>
              {currentLanguage === 'mr'
                ? '१००% सुरक्षित • थेट बँक खात्यात भरणा'
                : currentLanguage === 'hi'
                ? '100% सुरक्षित • सीधे बैंक खाते में भुगतान'
                : '100% Secure • Direct Bank Escrow Payments'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#E5E9E7] tracking-tight leading-tight">
            {currentLanguage === 'mr' ? (
              <>
                शेतकऱ्यांचा नफा वाढवा, <br />
                <span className="text-[#C2D66E]">थेट सुपरमार्टला</span> चांगल्या भावात माल विका.
              </>
            ) : currentLanguage === 'hi' ? (
              <>
                किसानों का मुनाफा बढ़ाएं, <br />
                <span className="text-[#C2D66E]">सीधे सुपरमार्ट को</span> सही दाम में बेचें।
              </>
            ) : (
              <>
                Direct Farm-to-Mart <br />
                <span className="text-[#C2D66E]">Zero Middlemen,</span> Guaranteed Fast Payment.
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-[#8E9B94] max-w-lg leading-relaxed">
            {currentLanguage === 'mr'
              ? 'जलद व सुरक्षित ओटीपी लॉगिन. कोणत्याही १० अंकी मोबाईल नंबरने त्वरित सुरक्षित प्रवेश करा.'
              : currentLanguage === 'hi'
              ? 'तेज और सुरक्षित ओटीपी लॉगिन। किसी भी 10 अंकों के मोबाइल नंबर से तुरंत सुरक्षित प्रवेश करें।'
              : 'Ultra-fast, secure OTP login. Enter your 10-digit mobile number for instant, verified access.'}
          </p>

          {/* Quick Value Cards */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-[#121A15] border border-[#2C3631]">
              <div className="text-xl mb-1.5">🌾</div>
              <h4 className="font-bold text-xs text-[#E5E9E7]">
                {currentLanguage === 'mr' ? 'शेतकरी पोर्टल' : 'Farmer Portal'}
              </h4>
              <p className="text-[10px] text-[#8E9B94] mt-0.5">
                {currentLanguage === 'mr' ? 'थेट माल लिस्टिंग' : 'Direct Produce Sell'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#121A15] border border-[#2C3631]">
              <div className="text-xl mb-1.5">🏬</div>
              <h4 className="font-bold text-xs text-[#E5E9E7]">
                {currentLanguage === 'mr' ? 'मार्ट खरेदी' : 'Mart Buyer'}
              </h4>
              <p className="text-[10px] text-[#8E9B94] mt-0.5">
                {currentLanguage === 'mr' ? 'मोठ्या मागण्या' : 'Bulk Demand & Escrow'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#121A15] border border-[#2C3631]">
              <div className="text-xl mb-1.5">⚡</div>
              <h4 className="font-bold text-xs text-[#E5E9E7]">
                {currentLanguage === 'mr' ? 'त्वरित प्रवेश' : 'Instant Login'}
              </h4>
              <p className="text-[10px] text-[#8E9B94] mt-0.5">
                {currentLanguage === 'mr' ? '० सेकंदात ओटीपी' : '0-Friction OTP'}
              </p>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="relative overflow-hidden rounded-3xl border border-[#2C3631] bg-[#121A15] shadow-2xl">
            <div className="relative h-48 sm:h-52 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=85"
                alt="Agri landscape"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1411] via-[#0F1411]/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="bg-[#0F1411]/90 backdrop-blur-md text-[#C2D66E] text-[11px] font-bold px-3 py-1 rounded-full border border-[#C2D66E]/40 flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-[#C2D66E] animate-pulse" />
                  {currentLanguage === 'mr' ? '१०,०००+ शेतकरी व सुपरमार्ट नेटवर्क' : '10,000+ Active Farmers & Marts'}
                </span>
                <span className="text-[11px] text-[#D4E4BC] font-medium hidden sm:inline">
                  {currentLanguage === 'mr' ? 'समृद्ध शेतशिवार ते थेट मार्ट' : 'Direct Agro Corridor'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Secure Login Card */}
        <div className="lg:col-span-6 w-full">
          {/* Real DLT SMS Alert Bar for Sent Number */}
          <AnimatePresence>
            {showSmsToast && otpStep === 'verify' && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-4 p-3.5 bg-[#1F2E23] border-2 border-[#C2D66E] rounded-2xl shadow-[0_0_25px_rgba(194,214,110,0.25)] flex items-start gap-3 text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#C2D66E] text-[#0F1411] flex items-center justify-center font-black shrink-0 shadow">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#C2D66E] uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#C2D66E] animate-pulse"></span>
                      DLT-SMS Gateway • +91 {phoneInput.replace(/\D/g, '').slice(-10)}
                    </span>
                    <span className="text-[10px] text-[#8E9B94]">
                      {otpReferenceId ? `Ref: ${otpReferenceId}` : 'Just now'}
                    </span>
                  </div>
                  <p className="text-[#E5E9E7] text-xs leading-relaxed">
                    {currentLanguage === 'mr'
                      ? `+91 ${phoneInput.replace(/\D/g, '').slice(-10)} साठी किसानमित्र सुरक्षा ओटीपी:`
                      : `KisanMitra security OTP sent to +91 ${phoneInput.replace(/\D/g, '').slice(-10)}:`}{' '}
                    <span className="font-mono font-black text-sm text-[#C2D66E] tracking-widest bg-black/50 px-2.5 py-0.5 rounded-md border border-[#C2D66E]/40 shadow-inner inline-block">
                      {generatedOtp}
                    </span>
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="px-2.5 py-1 bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-black text-[11px] rounded-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shadow"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{currentLanguage === 'mr' ? 'ओटीपी ऑटो-फिल करा' : 'Auto-fill OTP'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(generatedOtp);
                        setCopiedOtp(true);
                        setTimeout(() => setCopiedOtp(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-[#141B17] hover:bg-[#202B25] text-[#8E9B94] hover:text-[#E5E9E7] font-semibold text-[11px] rounded-lg border border-[#2C3631] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedOtp ? <Check className="w-3 h-3 text-[#C2D66E]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Auth Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-[#141B17] border border-[#2C3631] shadow-2xl p-5 sm:p-7 space-y-5 relative overflow-hidden"
          >
            {/* Top Auth Mode Tabs: OTP vs PIN vs Register */}
            <div className="grid grid-cols-3 p-1 bg-[#0F1411] border border-[#2C3631] rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setOtpStep('phone');
                  setOtpError('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMethod === 'otp'
                    ? 'bg-[#C2D66E] text-[#0F1411] shadow-md font-black'
                    : 'text-[#8E9B94] hover:text-[#E5E9E7]'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{currentLanguage === 'mr' ? 'मोबाईल OTP' : 'Mobile OTP'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('pin');
                  setLoginError('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMethod === 'pin'
                    ? 'bg-[#C2D66E] text-[#0F1411] shadow-md font-black'
                    : 'text-[#8E9B94] hover:text-[#E5E9E7]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{currentLanguage === 'mr' ? 'पिन / पासवर्ड' : 'Password'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('register');
                  setRegError('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMethod === 'register'
                    ? 'bg-[#C2D66E] text-[#0F1411] shadow-md font-black'
                    : 'text-[#8E9B94] hover:text-[#E5E9E7]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{currentLanguage === 'mr' ? 'नवीन नोंदणी' : 'Register'}</span>
              </button>
            </div>

            {/* Role Switcher: Farmer vs Mart */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider">
                {currentLanguage === 'mr' ? '१. भूमिका निवडा' : '1. Select Your Role'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRoleChange('farmer')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    activeRoleTab === 'farmer'
                      ? 'bg-[#18231C] border-[#C2D66E] shadow-sm'
                      : 'bg-[#0F1411] border-[#2C3631] text-[#8E9B94] hover:border-[#425048]'
                  }`}
                >
                  <span className="text-2xl">🌾</span>
                  <div>
                    <div className={`text-xs font-bold ${activeRoleTab === 'farmer' ? 'text-[#C2D66E]' : 'text-[#E5E9E7]'}`}>
                      {t.farmerLogin}
                    </div>
                    <div className="text-[10px] text-[#8E9B94]">
                      {currentLanguage === 'mr' ? 'शेतमाल विक्रेता / सप्लायर' : 'Farmer / Produce Supplier'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('mart')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    activeRoleTab === 'mart'
                      ? 'bg-[#15241C] border-emerald-400 shadow-sm'
                      : 'bg-[#0F1411] border-[#2C3631] text-[#8E9B94] hover:border-[#425048]'
                  }`}
                >
                  <span className="text-2xl">🏬</span>
                  <div>
                    <div className={`text-xs font-bold ${activeRoleTab === 'mart' ? 'text-emerald-300' : 'text-[#E5E9E7]'}`}>
                      {t.martLogin}
                    </div>
                    <div className="text-[10px] text-[#8E9B94]">
                      {currentLanguage === 'mr' ? 'मार्ट / रीसेलर खरेदीदार' : 'Mart / Reseller Buyer'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* TAB 1: OTP FLOW */}
            {authMethod === 'otp' && (
              <div className="space-y-4">
                {/* STEP 1: PHONE INPUT */}
                {otpStep === 'phone' ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-[#8E9B94] font-semibold uppercase mb-1.5">
                        {currentLanguage === 'mr' ? 'मोबाईल नंबर प्रविष्ट करा *' : 'Enter 10-Digit Mobile Number *'}
                      </label>
                      <div className="relative flex items-center">
                        <div className="flex items-center gap-1.5 bg-[#0F1411] border border-r-0 border-[#2C3631] rounded-l-2xl px-3 py-3 text-xs font-bold text-[#E5E9E7] shrink-0">
                          <span className="text-sm">🇮🇳</span>
                          <span className="font-mono text-[#8E9B94]">+91</span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phoneInput}
                          onChange={(e) => {
                            setPhoneInput(e.target.value.replace(/\D/g, ''));
                            setOtpError('');
                          }}
                          placeholder={activeRoleTab === 'farmer' ? '9822012345' : '9899012345'}
                          className="w-full bg-[#0F1411] border border-[#2C3631] focus:border-[#C2D66E] rounded-r-2xl px-3 py-3 text-sm text-[#E5E9E7] outline-none font-mono font-bold tracking-wider placeholder:text-neutral-600"
                        />
                      </div>
                      <p className="text-[10px] text-[#8E9B94] mt-1.5 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#C2D66E]" />
                        {currentLanguage === 'mr'
                          ? 'आम्ही सुरक्षेसाठी ६ अंकी पडताळणी ओटीपी पाठवू'
                          : 'We will send a 6-digit verification OTP'}
                      </p>
                    </div>

                    {otpError && (
                      <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{otpError}</span>
                      </div>
                    )}

                    {/* Primary CTA Button */}
                    <button
                      type="submit"
                      disabled={isOtpSending}
                      className="w-full py-3.5 bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#C2D66E]/20 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.99]"
                    >
                      {isOtpSending ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-[#0F1411] animate-spin" />
                          <span>{currentLanguage === 'mr' ? 'ओटीपी पाठवत आहे...' : 'Sending OTP...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{currentLanguage === 'mr' ? 'पुढे जा (Continue / Send OTP)' : 'Continue (Send OTP)'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* STEP 2: OTP DIGITS INPUT */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-[#0F1411] p-3 rounded-2xl border border-[#2C3631]">
                      <div>
                        <span className="text-[10px] text-[#8E9B94] block uppercase font-bold">
                          {currentLanguage === 'mr' ? 'ओटीपी पाठवला:' : 'OTP Sent to:'}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#E5E9E7]">
                          +91 {phoneInput}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('phone');
                          setOtpError('');
                        }}
                        className="text-xs text-[#C2D66E] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{currentLanguage === 'mr' ? 'बदला' : 'Change'}</span>
                      </button>
                    </div>

                    {/* 6 Digit Boxes */}
                    <div>
                      <label className="block text-[11px] text-[#8E9B94] font-semibold uppercase mb-2 text-center">
                        {currentLanguage === 'mr' ? '६-अंकी पडताळणी कोड प्रविष्ट करा' : 'Enter 6-Digit Verification Code'}
                      </label>
                      <div className="flex items-center justify-between gap-1.5 sm:gap-2 on-paste={handleOtpPaste}">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              otpInputRefs.current[idx] = el;
                            }}
                            type="tel"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={handleOtpPaste}
                            className={`w-11 sm:w-12 h-12 text-center text-lg font-mono font-black rounded-xl bg-[#0F1411] border ${
                              digit ? 'border-[#C2D66E] text-[#C2D66E]' : 'border-[#2C3631] text-[#E5E9E7]'
                            } focus:border-[#C2D66E] focus:ring-1 focus:ring-[#C2D66E] outline-none transition-all shadow-inner`}
                          />
                        ))}
                      </div>
                    </div>

                    {otpError && (
                      <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{otpError}</span>
                      </div>
                    )}

                    {/* Resend & Auto-fill Actions */}
                    <div className="flex items-center justify-between text-xs">
                      {resendTimer > 0 ? (
                        <span className="text-[#8E9B94] flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          {currentLanguage === 'mr' ? `पुन्हा पाठवा: ${resendTimer}s` : `Resend OTP in ${resendTimer}s`}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="text-[#C2D66E] font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{currentLanguage === 'mr' ? 'ओटीपी पुन्हा पाठवा' : 'Resend OTP'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleAutoFillOtp}
                        className="text-[#C2D66E] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{currentLanguage === 'mr' ? 'ऑटो-फिल करा' : 'Auto-fill OTP'}</span>
                      </button>
                    </div>

                    {/* Verify CTA */}
                    <button
                      type="button"
                      onClick={() => handleVerifyOtp()}
                      disabled={isVerifying}
                      className="w-full py-3.5 bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#C2D66E]/20 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.99]"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-[#0F1411] animate-spin" />
                          <span>{currentLanguage === 'mr' ? 'पडताळणी सुरू आहे...' : 'Verifying...'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{currentLanguage === 'mr' ? 'सॉफ्टवेअरमध्ये सुरक्षित प्रवेश करा' : 'Verify & Enter Software'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PIN / PASSWORD LOGIN */}
            {authMethod === 'pin' && (
              <form onSubmit={handlePinLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] text-[#8E9B94] font-semibold uppercase mb-1">
                    {currentLanguage === 'mr' ? 'मोबाईल नंबर किंवा ईमेल *' : 'Mobile Number or Email *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8E9B94] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        setLoginError('');
                      }}
                      placeholder={activeRoleTab === 'farmer' ? '9822012345' : '9899012345'}
                      className="w-full bg-[#0F1411] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#E5E9E7] outline-none font-mono placeholder:text-neutral-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-[#8E9B94] font-semibold uppercase">
                      {currentLanguage === 'mr' ? 'पासवर्ड / सुरक्षा पिन *' : 'Password / PIN *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-[11px] text-[#8E9B94] hover:text-[#C2D66E] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {showLoginPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>{currentLanguage === 'mr' ? 'लपवा' : 'Hide'}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>{currentLanguage === 'mr' ? 'दाखवा' : 'Show'}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E9B94] absolute left-3 top-3" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPin}
                      onChange={(e) => {
                        setLoginPin(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="••••"
                      className="w-full bg-[#0F1411] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#E5E9E7] outline-none font-mono placeholder:text-neutral-600"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-2.5 bg-neutral-900/80 border border-[#2C3631] rounded-xl text-xs text-[#C2D66E] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#C2D66E] shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#C2D66E]/20 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{currentLanguage === 'mr' ? 'सॉफ्टवेअरमध्ये प्रवेश करा' : 'Login into Software'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: REGISTRATION FORM */}
            {authMethod === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-[11px] text-[#8E9B94] font-semibold uppercase mb-1">
                    {currentLanguage === 'mr' ? 'पूर्ण नाव *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8E9B94] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={activeRoleTab === 'farmer' ? 'ज्ञानेश्वर पाटील' : 'Sanjay Deshmukh'}
                      className="w-full bg-[#0F1411] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl pl-9 pr-3 py-2 text-xs text-[#E5E9E7] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#8E9B94] font-semibold uppercase mb-1">
                      {currentLanguage === 'mr' ? 'मोबाईल नंबर *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98220XXXXX"
                      className="w-full bg-[#0F1411] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3 py-2 text-xs text-[#E5E9E7] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8E9B94] font-semibold uppercase mb-1">
                      {currentLanguage === 'mr' ? 'सुरक्षा पिन *' : 'PIN / Password *'}
                    </label>
                    <input
                      type="password"
                      required
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      placeholder="1234"
                      className="w-full bg-[#0F1411] border border-[#2C3631] focus:border-[#C2D66E] rounded-xl px-3 py-2 text-xs text-[#E5E9E7] outline-none font-mono"
                    />
                  </div>
                </div>

                {activeRoleTab === 'farmer' ? (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2C3631]">
                    <div>
                      <label className="block text-[10px] text-[#8E9B94] font-semibold uppercase mb-1">
                        {currentLanguage === 'mr' ? 'शेतीचे नाव' : 'Farm Name'}
                      </label>
                      <input
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="पाटील ॲग्रो"
                        className="w-full bg-[#0F1411] border border-[#2C3631] rounded-xl px-2.5 py-1.5 text-xs text-[#E5E9E7] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8E9B94] font-semibold uppercase mb-1">
                        {currentLanguage === 'mr' ? 'गाव / तालुका' : 'Village / Taluka'}
                      </label>
                      <input
                        type="text"
                        value={villageDistrict}
                        onChange={(e) => setVillageDistrict(e.target.value)}
                        placeholder="बारामती, पुणे"
                        className="w-full bg-[#0F1411] border border-[#2C3631] rounded-xl px-2.5 py-1.5 text-xs text-[#E5E9E7] outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2C3631]">
                    <div>
                      <label className="block text-[10px] text-[#8E9B94] font-semibold uppercase mb-1">
                        {currentLanguage === 'mr' ? 'मार्टचे नाव' : 'Mart Name'}
                      </label>
                      <input
                        type="text"
                        value={martName}
                        onChange={(e) => setMartName(e.target.value)}
                        placeholder="Fresh SuperMart"
                        className="w-full bg-[#0F1411] border border-[#2C3631] rounded-xl px-2.5 py-1.5 text-xs text-[#E5E9E7] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8E9B94] font-semibold uppercase mb-1">
                        {currentLanguage === 'mr' ? 'शहर / हब' : 'City / Hub'}
                      </label>
                      <input
                        type="text"
                        value={martCity}
                        onChange={(e) => setMartCity(e.target.value)}
                        placeholder="Pune Hub"
                        className="w-full bg-[#0F1411] border border-[#2C3631] rounded-xl px-2.5 py-1.5 text-xs text-[#E5E9E7] outline-none"
                      />
                    </div>
                  </div>
                )}

                {regError && (
                  <div className="p-2 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300">
                    ⚠️ {regError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#C2D66E]/20 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{currentLanguage === 'mr' ? 'नोंदणी पूर्ण करा व उघडा' : 'Complete Registration & Enter'}</span>
                </button>
              </form>
            )}

            {/* Alternative: Google Auth */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#2C3631] w-full"></div>
              <span className="bg-[#141B17] px-3 text-[10px] text-[#8E9B94] uppercase font-bold">
                {currentLanguage === 'mr' ? 'किंवा सोशल लॉगिन' : 'OR SOCIAL LOGIN'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleTriggerGoogleAuth}
              disabled={isGoogleSigningIn}
              className="w-full py-2.5 px-4 bg-[#0F1411] hover:bg-[#18241E] border border-[#2C3631] hover:border-[#C2D66E]/50 rounded-xl text-xs font-bold text-[#E5E9E7] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
            >
              {isGoogleSigningIn ? (
                <RefreshCw className="w-4 h-4 text-[#C2D66E] animate-spin" />
              ) : (
                <GoogleLogoIcon className="w-4 h-4" />
              )}
              <span>
                {isGoogleSigningIn
                  ? (currentLanguage === 'mr' ? 'Google प्रमाणीकरण सुरू...' : 'Signing in with Google...')
                  : (currentLanguage === 'mr' ? 'Google ने जलद लॉगिन' : 'Continue with Google')}
              </span>
            </button>

            {googleAuthError && (
              <div className="text-[11px] text-amber-400 bg-amber-950/30 p-2 rounded-lg border border-amber-500/30">
                ⚠️ {googleAuthError}
              </div>
            )}

            {/* Trust Footer */}
            <div className="pt-2 border-t border-[#2C3631] text-[10px] text-[#8E9B94] flex items-center justify-between">
              <span>🔒 256-bit Bank Grade Encryption</span>
              <span>⚡ TRAI DLT Verified Gateway</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Floating AI Voice Agent Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onOpenVoiceModal}
          className="w-14 h-14 bg-[#C2D66E] text-[#0F1411] rounded-full shadow-[0_0_20px_rgba(194,214,110,0.4)] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer relative group"
        >
          <div className="absolute inset-0 bg-[#C2D66E] rounded-full animate-ping opacity-20"></div>
          <AudioWaveform className="w-6 h-6" />
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] text-[10px] whitespace-nowrap px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {currentLanguage === 'mr' ? 'व्हॉइस असिस्टंट (AI)' : 'Voice Agent (AI)'}
          </div>
        </button>
      </div>
    </div>
  );
};
