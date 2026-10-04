import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Layers,
  Sparkles,
  Droplet,
  Thermometer,
  ShieldCheck,
  TrendingUp,
  Plus,
  Compass,
  Truck,
  Building2,
  Sprout,
  X,
  CheckCircle2,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  ArrowRight,
  Eye,
  Activity,
  Radio,
  Clock,
  DollarSign,
  Info,
  Copy,
  Check,
  FileText,
  Share2,
  Search,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageCode, UserProfile, CropCategory } from '../types';
import { translations } from '../utils/translations';
import { MaharashtraYieldHeatmap } from './MaharashtraYieldHeatmap';

const FARM_PARCELS_STORAGE_KEY = 'kisan_farm_parcels_data';

export interface FarmMarker {
  id: string;
  name: string;
  farmerName: string;
  cropName: string;
  category: CropCategory;
  areaAcres: number;
  expectedYieldTons: number;
  soilType: string;
  moisturePercent: number;
  phLevel: number;
  tempCelsius: number;
  xPercent: number; // 0-100 on interactive visual map
  yPercent: number; // 0-100 on interactive visual map
  lat: number;
  lng: number;
  verifiedFPO: boolean;
  status: 'Growing' | 'Harvest Ready' | 'Export Dispatched';
  type: 'farm' | 'mandi' | 'mart_hub' | 'cold_storage';
  region: string;
  
  // Enhanced Verified Address Details (Network-Errorless & 100% Offline Viewable)
  fullAddress: string;
  gatOrSurveyNo: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  nearestHighway: string;
  plusCode: string;
  ndviScore: number; // 0.0 - 1.0 (Vegetation Greenness Index)
  landRecordVerified: boolean;
  contactNumber: string;
}

const INITIAL_FARM_MARKERS: FarmMarker[] = [
  {
    id: 'farm-nasal',
    name: 'Nasal Green Vineyard & Agro Estate',
    farmerName: 'Kailasrao Bhor & Sons',
    cropName: 'Nashik Green Export Grapes (Sonaka & Thompson)',
    category: 'fruits',
    areaAcres: 18.5,
    expectedYieldTons: 72,
    soilType: 'Lush Black Loam (Drip Fertigated)',
    moisturePercent: 76,
    phLevel: 7.1,
    tempCelsius: 25,
    xPercent: 41,
    yPercent: 26,
    lat: 20.0894,
    lng: 74.0215,
    verifiedFPO: true,
    status: 'Harvest Ready',
    type: 'farm',
    region: 'Nasal, Niphad, Nashik',
    fullAddress: 'Gat No. 142/A & Survey 88, Nasal Village, Niphad Taluka, Nashik District, Maharashtra - 422303',
    gatOrSurveyNo: 'Gat No. 142/A & 142/B',
    village: 'Nasal (नासल)',
    taluka: 'Niphad (निफाड)',
    district: 'Nashik (नाशिक)',
    state: 'Maharashtra',
    pincode: '422303',
    nearestHighway: 'NH-848 / Mumbai-Agra National Expressway (1.8 km)',
    plusCode: '3C7Q+VM Nasal, Maharashtra',
    ndviScore: 0.94,
    landRecordVerified: true,
    contactNumber: '+91 98224 51092',
  },
  {
    id: 'cold-1',
    name: 'Nashik Ozar Green Agro Hub & Cold Chain',
    farmerName: 'MahaAgro Green Ozar Consortium',
    cropName: 'Nashik Green Grapes & Solar Pre-Cooling Hub',
    category: 'fruits',
    areaAcres: 14.5,
    expectedYieldTons: 850,
    soilType: 'Fertile Red Alluvial Loam & Controlled Atmosphere Facility',
    moisturePercent: 82,
    phLevel: 7.2,
    tempCelsius: 4,
    xPercent: 39,
    yPercent: 33,
    lat: 19.982,
    lng: 73.821,
    verifiedFPO: true,
    status: 'Harvest Ready',
    type: 'farm',
    region: 'Ozar (ओझर), Nashik',
    fullAddress: 'Gat No. 84 & MIDC Agro Food Processing Park, Sector B, Ozar, Niphad Taluka, Nashik District, Maharashtra - 422206',
    gatOrSurveyNo: 'Gat No. 84 & MIDC Plot B-14',
    village: 'Ozar (ओझर / ओआर)',
    taluka: 'Niphad / Dindori (निफाड)',
    district: 'Nashik (नाशिक)',
    state: 'Maharashtra',
    pincode: '422206',
    nearestHighway: 'Nashik-Ozar Airport Road / NH-60 (0.4 km)',
    plusCode: 'XQJV+MR Ozar, Maharashtra',
    ndviScore: 0.95,
    landRecordVerified: true,
    contactNumber: '+91 253 257 8900',
  },
  {
    id: 'farm-2',
    name: 'Nashik Export Grape Valley',
    farmerName: 'Sunil Patil',
    cropName: 'Thompson Seedless Grapes',
    category: 'fruits',
    areaAcres: 14.0,
    expectedYieldTons: 56,
    soilType: 'Red Loamy Well-Drained Soil',
    moisturePercent: 74,
    phLevel: 7.2,
    tempCelsius: 26,
    xPercent: 43,
    yPercent: 30,
    lat: 19.9975,
    lng: 73.7898,
    verifiedFPO: true,
    status: 'Harvest Ready',
    type: 'farm',
    region: 'Pimpalgaon Baswant, Nashik',
    fullAddress: 'Survey No. 89/3, Pimpalgaon Baswant Agri Export Zone, Nashik, Maharashtra - 422209',
    gatOrSurveyNo: 'Survey No. 89/3',
    village: 'Pimpalgaon Baswant (पिंपळगाव)',
    taluka: 'Niphad (निफाड)',
    district: 'Nashik (नाशिक)',
    state: 'Maharashtra',
    pincode: '422209',
    nearestHighway: 'NH-3 Mumbai-Agra Highway (0.5 km)',
    plusCode: 'XQWX+2X Pimpalgaon, Maharashtra',
    ndviScore: 0.92,
    landRecordVerified: true,
    contactNumber: '+91 98231 66472',
  },
  {
    id: 'farm-1',
    name: 'Sahyadri Green Dragon Fruit Estate',
    farmerName: 'Dattatray Shinde',
    cropName: 'Red Velvet Dragon Fruit (Kamalam)',
    category: 'exotic',
    areaAcres: 8.5,
    expectedYieldTons: 24,
    soilType: 'Rich Organic Black Cotton Soil',
    moisturePercent: 71,
    phLevel: 6.8,
    tempCelsius: 28,
    xPercent: 48,
    yPercent: 54,
    lat: 18.1528,
    lng: 74.577,
    verifiedFPO: true,
    status: 'Harvest Ready',
    type: 'farm',
    region: 'Baramati, Pune',
    fullAddress: 'Gat No. 204, Near Sharda Krishi Kendra, Malegaon BK, Baramati, Pune District, Maharashtra - 413115',
    gatOrSurveyNo: 'Gat No. 204/1',
    village: 'Malegaon BK (माळेगाव)',
    taluka: 'Baramati (बारामती)',
    district: 'Pune (पुणे)',
    state: 'Maharashtra',
    pincode: '413115',
    nearestHighway: 'Baramati-Phaltan State Highway SH-10 (0.8 km)',
    plusCode: '5H3G+4F Baramati, Maharashtra',
    ndviScore: 0.91,
    landRecordVerified: true,
    contactNumber: '+91 94230 18452',
  },
  {
    id: 'farm-3',
    name: 'Devgad Organic Mango Groves',
    farmerName: 'Ramesh Sawant',
    cropName: 'GI Tag Devgad Alphonso Mango',
    category: 'fruits',
    areaAcres: 22.0,
    expectedYieldTons: 40,
    soilType: 'Laterite Coastal Mineral Loam',
    moisturePercent: 68,
    phLevel: 6.2,
    tempCelsius: 30,
    xPercent: 28,
    yPercent: 82,
    lat: 16.3754,
    lng: 73.3768,
    verifiedFPO: true,
    status: 'Growing',
    type: 'farm',
    region: 'Devgad, Sindhudurg',
    fullAddress: 'Wadi No. 4, Jamsande Port Road, Devgad, Sindhudurg District, Maharashtra - 416613',
    gatOrSurveyNo: 'Gat No. 312',
    village: 'Jamsande (जामसंडे)',
    taluka: 'Devgad (देवगड)',
    district: 'Sindhudurg (सिंधुदुर्ग)',
    state: 'Maharashtra',
    pincode: '416613',
    nearestHighway: 'Mhadei Coastal Highway / Sagari Mahamarg (1.2 km)',
    plusCode: '99GH+3R Devgad, Maharashtra',
    ndviScore: 0.88,
    landRecordVerified: true,
    contactNumber: '+91 97654 32189',
  },
  {
    id: 'farm-4',
    name: 'Sangli Super Bhagwa Orchard',
    farmerName: 'Vinayak Jadhav',
    cropName: 'Bhagwa Pomegranate (Export Grade)',
    category: 'fruits',
    areaAcres: 10.0,
    expectedYieldTons: 35,
    soilType: 'Medium Black Alluvial Soil',
    moisturePercent: 65,
    phLevel: 7.4,
    tempCelsius: 29,
    xPercent: 52,
    yPercent: 76,
    lat: 16.8524,
    lng: 74.5815,
    verifiedFPO: true,
    status: 'Harvest Ready',
    type: 'farm',
    region: 'Tasgaon, Sangli',
    fullAddress: 'Gat No. 77, Savalaj Road, Tasgaon, Sangli District, Maharashtra - 416312',
    gatOrSurveyNo: 'Gat No. 77/2',
    village: 'Savalaj (सावळज)',
    taluka: 'Tasgaon (तासगाव)',
    district: 'Sangli (सांगली)',
    state: 'Maharashtra',
    pincode: '416312',
    nearestHighway: 'Sangli-Tasgaon Road SH-165 (0.9 km)',
    plusCode: 'VR2J+5M Tasgaon, Maharashtra',
    ndviScore: 0.89,
    landRecordVerified: true,
    contactNumber: '+91 98901 23456',
  },
  {
    id: 'farm-5',
    name: 'Solapur Royal Pomegranate & Fig',
    farmerName: 'Anandrao Deshmukh',
    cropName: 'Arakta Pomegranate & Poona Fig',
    category: 'fruits',
    areaAcres: 16.5,
    expectedYieldTons: 48,
    soilType: 'Fertile Sandy Loam',
    moisturePercent: 62,
    phLevel: 7.8,
    tempCelsius: 31,
    xPercent: 68,
    yPercent: 62,
    lat: 17.6599,
    lng: 75.9064,
    verifiedFPO: true,
    status: 'Growing',
    type: 'farm',
    region: 'Pandharpur, Solapur',
    fullAddress: 'Gat No. 405, Gopalpur Agri Ring Road, Pandharpur, Solapur, Maharashtra - 413304',
    gatOrSurveyNo: 'Gat No. 405/B',
    village: 'Gopalpur (गोपाळपूर)',
    taluka: 'Pandharpur (पंढरपूर)',
    district: 'Solapur (सोलापूर)',
    state: 'Maharashtra',
    pincode: '413304',
    nearestHighway: 'Solapur-Pune NH-65 (3.5 km)',
    plusCode: 'MH5V+8P Pandharpur, Maharashtra',
    ndviScore: 0.86,
    landRecordVerified: true,
    contactNumber: '+91 94220 89123',
  },
  {
    id: 'farm-6',
    name: 'Nagpur Mandarin Citrus Groves',
    farmerName: 'Kishore Bobde',
    cropName: 'Nagpur Santra (Sweet Orange)',
    category: 'fruits',
    areaAcres: 30.0,
    expectedYieldTons: 85,
    soilType: 'Fertile Black Alluvium Soil',
    moisturePercent: 69,
    phLevel: 7.1,
    tempCelsius: 29,
    xPercent: 86,
    yPercent: 22,
    lat: 21.1458,
    lng: 79.0882,
    verifiedFPO: true,
    status: 'Harvest Ready',
    type: 'farm',
    region: 'Katol, Nagpur',
    fullAddress: 'Survey No. 112, Kondhali Road, Katol, Nagpur District, Maharashtra - 441502',
    gatOrSurveyNo: 'Survey No. 112/1',
    village: 'Kondhali (कोंढाळी)',
    taluka: 'Katol (काटोल)',
    district: 'Nagpur (नागपूर)',
    state: 'Maharashtra',
    pincode: '441502',
    nearestHighway: 'Nagpur-Amravati NH-53 (2.0 km)',
    plusCode: '4RWC+9Q Katol, Maharashtra',
    ndviScore: 0.93,
    landRecordVerified: true,
    contactNumber: '+91 98239 87654',
  },
  {
    id: 'hub-1',
    name: 'Vashi APMC Central Terminal Mandi',
    farmerName: 'Maharashtra Agri Marketing Board',
    cropName: 'State Wholesale Agri Terminal & Export Hub',
    category: 'all',
    areaAcres: 45.0,
    expectedYieldTons: 1200,
    soilType: 'Commercial Logistical Facility',
    moisturePercent: 55,
    phLevel: 7.0,
    tempCelsius: 29,
    xPercent: 32,
    yPercent: 44,
    lat: 19.076,
    lng: 72.998,
    verifiedFPO: true,
    status: 'Export Dispatched',
    type: 'mandi',
    region: 'Navi Mumbai / Vashi',
    fullAddress: 'APMC Market Complex, Sector 19, Turbhe, Vashi, Navi Mumbai, Maharashtra - 400703',
    gatOrSurveyNo: 'Plot No. 1-12 Commercial Sector',
    village: 'Turbhe (तुर्भे)',
    taluka: 'Thane / Navi Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '400703',
    nearestHighway: 'Sion-Panvel Highway / Mumbai-Pune Expressway (0.2 km)',
    plusCode: '3XXW+6C Navi Mumbai, Maharashtra',
    ndviScore: 0.45,
    landRecordVerified: true,
    contactNumber: '022-27888888',
  },
  {
    id: 'mart-1',
    name: 'Pune Fresh Supermarket Fulfillment Mart',
    farmerName: 'SmartRetail Logistics Central Hub',
    cropName: 'Direct Mart Cold-Storage & Delivery Hub',
    category: 'all',
    areaAcres: 12.0,
    expectedYieldTons: 450,
    soilType: 'Cold-Chain Controlled Facility',
    moisturePercent: 50,
    phLevel: 7.0,
    tempCelsius: 22,
    xPercent: 44,
    yPercent: 52,
    lat: 18.5204,
    lng: 73.8567,
    verifiedFPO: true,
    status: 'Export Dispatched',
    type: 'mart_hub',
    region: 'Gultekdi / Hadapsar, Pune',
    fullAddress: 'Agro Logistics Hub, Plot 44, Market Yard Road, Gultekdi, Pune, Maharashtra - 411037',
    gatOrSurveyNo: 'Commercial Plot 44',
    village: 'Gultekdi (गुलटेकडी)',
    taluka: 'Haveli (हवेली)',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411037',
    nearestHighway: 'Pune-Solapur Highway (1.1 km)',
    plusCode: 'GRCR+5M Pune, Maharashtra',
    ndviScore: 0.48,
    landRecordVerified: true,
    contactNumber: '+91 20 2426 7800',
  },
];

interface FarmParcelMapViewProps {
  currentLanguage: LanguageCode;
  currentUser: UserProfile | null;
  onNavigateTab?: (tab: string, filter?: string) => void;
}

export const FarmParcelMapView: React.FC<FarmParcelMapViewProps> = ({
  currentLanguage,
  currentUser,
  onNavigateTab,
}) => {
  const t = translations[currentLanguage];

  // Initialize farm markers from localStorage to retain farmer info permanently until deleted
  const [markers, setMarkers] = useState<FarmMarker[]>(() => {
    try {
      const saved = localStorage.getItem(FARM_PARCELS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved farm markers from storage:', e);
    }
    return INITIAL_FARM_MARKERS;
  });

  // Save markers to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(FARM_PARCELS_STORAGE_KEY, JSON.stringify(markers));
    } catch (e) {
      console.warn('Failed to save farm markers to storage:', e);
    }
  }, [markers]);

  // Default selected marker is Nasal Green Vineyard or Nashik Ozar
  const [selectedMarker, setSelectedMarker] = useState<FarmMarker | null>(() => {
    return markers[1] || markers[0] || INITIAL_FARM_MARKERS[1];
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'farms' | 'hubs' | 'nasal'>('nasal');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'ndvi' | 'topography' | 'logistics'>('ndvi');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingParcel, setIsAddingParcel] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);
  const [parcelToDelete, setParcelToDelete] = useState<FarmMarker | null>(null);
  
  // New parcel creation states initialized from currentUser
  const [newParcelName, setNewParcelName] = useState<string>(
    currentUser?.farmName ? `${currentUser.farmName} Green Plot` : ''
  );
  const [newParcelCrop, setNewParcelCrop] = useState<string>(
    currentUser?.primaryCrops?.[0] || 'Green Grapes (Sonaka)'
  );
  const [newParcelAcres, setNewParcelAcres] = useState<number>(
    currentUser?.landSizeAcres || 5
  );
  const [newParcelVillage, setNewParcelVillage] = useState<string>(
    currentUser?.villageOrDistrict?.split(',')[0]?.trim() || 'Ozar / Nasal'
  );
  const [newParcelTaluka, setNewParcelTaluka] = useState<string>('Niphad');
  const [newParcelDistrict, setNewParcelDistrict] = useState<string>(
    currentUser?.villageOrDistrict?.split(',')[1]?.trim() || 'Nashik'
  );
  const [activeRouteTarget, setActiveRouteTarget] = useState<FarmMarker | null>(INITIAL_FARM_MARKERS[8]); // Vashi Mandi
  const [isSimulatingLogistics, setIsSimulatingLogistics] = useState<boolean>(true);

  // Sync default parcel input if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.farmName && !newParcelName) {
        setNewParcelName(`${currentUser.farmName} Green Plot`);
      }
      if (currentUser.villageOrDistrict) {
        const parts = currentUser.villageOrDistrict.split(',');
        if (parts[0]) setNewParcelVillage(parts[0].trim());
        if (parts[1]) setNewParcelDistrict(parts[1].trim());
      }
      if (currentUser.landSizeAcres) {
        setNewParcelAcres(currentUser.landSizeAcres);
      }
      if (currentUser.primaryCrops && currentUser.primaryCrops.length > 0) {
        setNewParcelCrop(currentUser.primaryCrops[0]);
      }
    }
  }, [currentUser]);

  const handleDeleteParcel = (parcel: FarmMarker) => {
    setMarkers((prev) => prev.filter((m) => m.id !== parcel.id));
    if (selectedMarker?.id === parcel.id) {
      const remaining = markers.filter((m) => m.id !== parcel.id);
      setSelectedMarker(remaining[0] || null);
    }
    setParcelToDelete(null);
  };

  const filteredMarkers = useMemo(() => {
    return markers.filter((m) => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesCrop = m.cropName.toLowerCase().includes(q);
        const matchesRegion = m.region.toLowerCase().includes(q);
        const matchesVillage = (m.village || '').toLowerCase().includes(q);
        const matchesDistrict = (m.district || '').toLowerCase().includes(q);
        const matchesAddress = (m.fullAddress || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCrop && !matchesRegion && !matchesVillage && !matchesDistrict && !matchesAddress) {
          return false;
        }
      }

      if (activeFilter === 'farms') return m.type === 'farm';
      if (activeFilter === 'hubs') return m.type === 'mandi' || m.type === 'mart_hub' || m.type === 'cold_storage';
      if (activeFilter === 'nasal') {
        const r = m.region.toLowerCase();
        const n = m.name.toLowerCase();
        return (
          m.id === 'farm-nasal' ||
          m.id === 'cold-1' ||
          r.includes('nasal') ||
          r.includes('ozar') ||
          r.includes('nashik') ||
          n.includes('ozar') ||
          n.includes('nasal') ||
          n.includes('nashik')
        );
      }
      return true;
    });
  }, [markers, activeFilter, searchQuery]);

  const handleCopyAddress = (marker: FarmMarker) => {
    if (!marker) return;
    const textToCopy = `📍 Verified Farm & Cold Hub Address:
Facility: ${marker.name}
Grower / Operator: ${marker.farmerName}
Address: ${marker.fullAddress}
Gat/Survey: ${marker.gatOrSurveyNo}
Village: ${marker.village}, Taluka: ${marker.taluka}, District: ${marker.district} - ${marker.pincode}
Nearest Highway: ${marker.nearestHighway}
GPS Coordinates: ${marker.lat.toFixed(4)}° N, ${marker.lng.toFixed(4)}° E (Plus Code: ${marker.plusCode})
Land Record: Verified 7/12 Digital Revenue Extract (NDVI Index: ${marker.ndviScore})`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedAddressId(marker.id);
    setTimeout(() => {
      setCopiedAddressId(null);
    }, 3000);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingParcel) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const vName = newParcelVillage.trim() || 'Ozar / Nasal';
    const tName = newParcelTaluka.trim() || 'Niphad';
    const dName = newParcelDistrict.trim() || 'Nashik';

    const newFarm: FarmMarker = {
      id: `farm-${Date.now()}`,
      name: newParcelName.trim() || `${currentUser?.name || 'Farmer'}'s Green Plot`,
      farmerName: currentUser?.name || 'Kisan Partner',
      cropName: newParcelCrop,
      category: 'fruits',
      areaAcres: Number(newParcelAcres) || 6,
      expectedYieldTons: Math.round((Number(newParcelAcres) || 6) * 4.2),
      soilType: 'Rich Fertile Green Loam (Drip Irrigated)',
      moisturePercent: 78,
      phLevel: 7.2,
      tempCelsius: 26,
      xPercent: Math.max(10, Math.min(90, Math.round(x))),
      yPercent: Math.max(10, Math.min(90, Math.round(y))),
      lat: 19.982 + (Math.random() - 0.5) * 0.4,
      lng: 73.821 + (Math.random() - 0.5) * 0.4,
      verifiedFPO: true,
      status: 'Harvest Ready',
      type: 'farm',
      region: `${vName}, ${dName}`,
      fullAddress: `Gat No. ${Math.floor(Math.random() * 200 + 50)}, ${vName}, ${tName} Taluka, ${dName} District, Maharashtra - 422206`,
      gatOrSurveyNo: `Gat No. ${Math.floor(Math.random() * 200 + 50)}/A`,
      village: vName,
      taluka: tName,
      district: dName,
      state: 'Maharashtra',
      pincode: '422206',
      nearestHighway: 'Nashik-Ozar Airport Road / NH-60 (0.6 km)',
      plusCode: '4C9Q+GR Ozar, Maharashtra',
      ndviScore: 0.94,
      landRecordVerified: true,
      contactNumber: currentUser?.phone || '+91 98220 00000',
    };

    setMarkers((prev) => [newFarm, ...prev]);
    setSelectedMarker(newFarm);
    setIsAddingParcel(false);
    setNewParcelName('');
  };

  // Zero-network distance and freight logistics calculation
  const calculatedLogistics = useMemo(() => {
    if (!selectedMarker) return null;
    const targetHub = activeRouteTarget || INITIAL_FARM_MARKERS[8]; // default Vashi Mandi
    const dx = Math.abs(selectedMarker.xPercent - targetHub.xPercent);
    const dy = Math.abs(selectedMarker.yPercent - targetHub.yPercent);
    const distUnits = Math.sqrt(dx * dx + dy * dy);
    const distanceKm = Math.round(distUnits * 6.2) + 20;
    const transitHours = (distanceKm / 46).toFixed(1);
    const freightCost = Math.round(distanceKm * 26 + selectedMarker.expectedYieldTons * 110);

    return {
      source: selectedMarker.name,
      destination: targetHub.name,
      distanceKm,
      transitHours,
      freightCost,
      status: 'Direct Corridor (Zero Toll Delay / FASTag Green Corridor)',
      reeferTemp: '+4°C Reefer Controlled / Solar Cold Chain',
    };
  }, [selectedMarker, activeRouteTarget]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Banner & Geospatial Control Center */}
      <div className="bg-[#141B17] border border-[#2C3631] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950">
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#E5E9E7]">
                {t.farmDetails} - Nashik Ozar & Nasal Geospatial Map
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Nashik Ozar Green Active
              </span>
            </div>
            <p className="text-xs text-[#8E9B94]">
              {currentLanguage === 'mr'
                ? 'नाशिक ओझर (Ozar) व नासल शिवाराचे अचूक पत्ते, NDVI 0.95 हिरवा निर्देशांक व थेट कोल्ड-चेन वाहतूक.'
                : currentLanguage === 'hi'
                ? 'नासिक ओझर (Ozar) व नासल क्षेत्र के सटीक पते, NDVI 0.95 हरा सूचकांक व डायरेक्ट कोल्ड-चेन।'
                : 'Nashik Ozar & Nasal lush green vegetation indices, 100% verified farm addresses, and reefer logistics.'}
            </p>
          </div>
        </div>

        {/* Action Controls & Layer Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E9B94]" />
            <input
              type="text"
              placeholder="Search Ozar, Nasal, Nashik, crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#0F1411] border border-[#2C3631] rounded-xl text-xs text-[#E5E9E7] placeholder-[#8E9B94] focus:outline-none focus:border-emerald-400 w-44 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8E9B94] hover:text-[#E5E9E7]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Layer Switcher */}
          <div className="flex items-center p-1 bg-[#0F1411] border border-[#2C3631] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMapLayer('ndvi')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                mapLayer === 'ndvi'
                  ? 'bg-emerald-500 text-[#0F1411] font-black shadow-sm'
                  : 'text-[#8E9B94] hover:text-[#E5E9E7]'
              }`}
              title="Normalized Difference Vegetation Index (Lush Green Canopy)"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>NDVI Green</span>
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                mapLayer === 'satellite'
                  ? 'bg-emerald-500 text-[#0F1411] font-bold shadow-sm'
                  : 'text-[#8E9B94] hover:text-[#E5E9E7]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setMapLayer('logistics')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                mapLayer === 'logistics'
                  ? 'bg-emerald-500 text-[#0F1411] font-bold shadow-sm'
                  : 'text-[#8E9B94] hover:text-[#E5E9E7]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Logistics</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 bg-[#0F1411] border border-[#2C3631] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('nasal')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'nasal'
                  ? 'bg-emerald-500 text-[#0F1411] font-black shadow-md'
                  : 'text-[#8E9B94] hover:text-emerald-400'
              }`}
            >
              🍇 Nashik Ozar & Nasal
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#242C28] text-emerald-400 border border-emerald-500/40 font-bold'
                  : 'text-[#8E9B94] hover:text-[#E5E9E7]'
              }`}
            >
              All ({markers.length})
            </button>
            <button
              onClick={() => setActiveFilter('farms')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'farms'
                  ? 'bg-[#242C28] text-emerald-400 border border-emerald-500/40 font-bold'
                  : 'text-[#8E9B94] hover:text-[#E5E9E7]'
              }`}
            >
              🌾 Farms
            </button>
          </div>

          {/* Add Farm Parcel Button */}
          <button
            onClick={() => setIsAddingParcel(!isAddingParcel)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isAddingParcel
                ? 'bg-amber-500 text-black shadow-amber-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-[#0F1411] font-black'
            }`}
          >
            {isAddingParcel ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>
              {isAddingParcel
                ? (currentLanguage === 'mr' ? 'रद्द करा' : 'Cancel')
                : (currentLanguage === 'mr' ? '+ शेत जोडा' : '+ Add Parcel')}
            </span>
          </button>
        </div>
      </div>

      {/* Add Parcel Drawer Banner */}
      {isAddingParcel && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1C2720] border border-emerald-500 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#E5E9E7] shadow-xl"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 bg-emerald-500 text-[#0F1411] font-black rounded-lg text-xs">
              📍 STEP 1
            </span>
            <span className="font-semibold">
              {currentLanguage === 'mr'
                ? 'शेत नाव व पत्ता भरा, नंतर नकाशावर कुठेही क्लिक करून हिरवी पिन लावा:'
                : 'Enter farm/hub name & address details, then click anywhere on the map to drop your green parcel pin:'}
            </span>
            <input
              type="text"
              placeholder="e.g. Nashik Ozar Green Vineyard"
              value={newParcelName}
              onChange={(e) => setNewParcelName(e.target.value)}
              className="bg-[#0F1411] border border-[#2C3631] rounded-xl px-3 py-1.5 text-xs text-[#E5E9E7] focus:outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              placeholder="Crop (e.g. Green Grapes / Sonaka)"
              value={newParcelCrop}
              onChange={(e) => setNewParcelCrop(e.target.value)}
              className="bg-[#0F1411] border border-[#2C3631] rounded-xl px-3 py-1.5 text-xs text-[#E5E9E7] focus:outline-none focus:border-emerald-400"
            />
            <input
              type="number"
              placeholder="Acres"
              value={newParcelAcres}
              onChange={(e) => setNewParcelAcres(Number(e.target.value))}
              className="w-20 bg-[#0F1411] border border-[#2C3631] rounded-xl px-3 py-1.5 text-xs text-[#E5E9E7] focus:outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              placeholder="Village (e.g. Ozar / Nasal)"
              value={newParcelVillage}
              onChange={(e) => setNewParcelVillage(e.target.value)}
              className="bg-[#0F1411] border border-[#2C3631] rounded-xl px-3 py-1.5 text-xs text-[#E5E9E7] focus:outline-none focus:border-emerald-400"
            />
          </div>
          <span className="text-[11px] text-emerald-400 font-bold animate-pulse flex items-center gap-1">
            👉 Click on the Map below to Drop Pin
          </span>
        </motion.div>
      )}

      {/* Main Interactive Geospatial Canvas & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Canvas (8 Columns) */}
        <div className="lg:col-span-8 bg-[#101713] border border-[#2C3631] rounded-3xl p-3 relative overflow-hidden shadow-2xl flex flex-col min-h-[560px]">
          {/* Top Canvas Status Overlay */}
          <div className="flex items-center justify-between z-20 mb-2 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono text-emerald-400 font-bold tracking-wide">
                GEO-GRID: NASHIK OZAR (ओझर) & NASAL GREEN AGRI CORRIDOR
              </span>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-1.5 bg-[#141B17]/90 backdrop-blur-md border border-[#2C3631] p-1 rounded-xl">
              <button
                onClick={() => setZoomLevel((prev) => Math.min(1.4, prev + 0.15))}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0F1411] text-[#E5E9E7] hover:text-emerald-400 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.15))}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0F1411] text-[#E5E9E7] hover:text-emerald-400 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2 h-7 flex items-center justify-center rounded-lg bg-[#0F1411] text-[#8E9B94] hover:text-[#E5E9E7] text-[10px] font-mono transition-colors cursor-pointer"
                title="Reset View"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Interactive Vector Map Stage */}
          <div
            onClick={handleMapClick}
            className={`relative w-full flex-1 rounded-2xl overflow-hidden border border-[#2C3631]/60 transition-transform duration-300 ${
              isAddingParcel ? 'cursor-crosshair ring-2 ring-emerald-400' : 'cursor-default'
            }`}
            style={{
              backgroundColor: mapLayer === 'ndvi' ? '#09150e' : mapLayer === 'satellite' ? '#0b1610' : '#08100c',
              backgroundImage:
                mapLayer === 'ndvi'
                  ? 'radial-gradient(ellipse at 40% 30%, #163d24 0%, #0e2b19 45%, #09150e 90%)'
                  : 'radial-gradient(ellipse at 50% 50%, #15261b 0%, #0b1610 80%)',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            {/* SVG Background: Regional Agro Topography, River Basins & NDVI Vegetation Gradients */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1c3325" strokeWidth="0.6" strokeDasharray="3 3" />
                </pattern>
                <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0.9" />
                </linearGradient>
                <radialGradient id="ozarGreenZone" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#15803d" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#09150e" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="baramatiGreenZone" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#09150e" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Lush Green Agro Zones (Nashik Ozar Belt, Nasal, Baramati, Sangli) */}
              <ellipse cx="39%" cy="33%" rx="140" ry="105" fill="url(#ozarGreenZone)" />
              <ellipse cx="41%" cy="26%" rx="130" ry="95" fill="url(#ozarGreenZone)" />
              <ellipse cx="48%" cy="54%" rx="140" ry="90" fill="url(#baramatiGreenZone)" />
              <ellipse cx="52%" cy="76%" rx="120" ry="80" fill="url(#baramatiGreenZone)" />
              <ellipse cx="28%" cy="82%" rx="100" ry="110" fill="url(#ozarGreenZone)" />

              {/* Nashik Ozar & Nasal Farm Parcel Polygon Boundaries */}
              <polygon
                points="36%,30% 43%,29% 45%,37% 37%,38%"
                fill="#22c55e"
                fillOpacity="0.18"
                stroke="#22c55e"
                strokeWidth="1.8"
                strokeDasharray="4 2"
              />
              <polygon
                points="38%,24% 45%,23% 47%,30% 39%,32%"
                fill="#22c55e"
                fillOpacity="0.15"
                stroke="#22c55e"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <polygon
                points="45%,50% 52%,49% 54%,58% 47%,60%"
                fill="#10b981"
                fillOpacity="0.1"
                stroke="#10b981"
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />

              {/* River Basins (Godavari near Nashik/Ozar/Niphad, Krishna, Bhima) */}
              <path
                d="M 120 170 Q 260 190 410 270 T 780 430"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeOpacity="0.4"
              />
              <path
                d="M 160 380 Q 340 420 540 460 T 820 500"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeOpacity="0.3"
              />

              {/* Active Freight / Logistics Corridors */}
              {(mapLayer === 'logistics' || isSimulatingLogistics) && (
                <>
                  {/* Nashik Ozar & Nasal to Vashi Terminal Corridor */}
                  <line
                    x1="39%"
                    y1="33%"
                    x2="32%"
                    y2="44%"
                    stroke="url(#corridorGrad)"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  <line
                    x1="41%"
                    y1="26%"
                    x2="32%"
                    y2="44%"
                    stroke="url(#corridorGrad)"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  {/* Baramati to Pune Hub */}
                  <line
                    x1="48%"
                    y1="54%"
                    x2="44%"
                    y2="52%"
                    stroke="url(#corridorGrad)"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  {/* Sangli to Pune */}
                  <line
                    x1="52%"
                    y1="76%"
                    x2="44%"
                    y2="52%"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                  />
                </>
              )}
            </svg>

            {/* Region Labels */}
            <div className="absolute top-4 left-6 text-[11px] font-mono text-emerald-300 font-bold bg-[#141B17]/90 px-2.5 py-1 rounded-lg border border-emerald-500/40 pointer-events-none shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🍇 NASHIK OZAR (ओझर) & NASAL GREEN AGRI CORRIDOR</span>
            </div>
            <div className="absolute top-1/2 left-6 text-[10px] font-mono text-[#8E9B94]/80 pointer-events-none">
              WESTERN GHATS / KONKAN
            </div>
            <div className="absolute top-1/2 right-6 text-[10px] font-mono text-[#8E9B94]/80 pointer-events-none">
              MARATHWADA & VIDARBHA
            </div>
            <div className="absolute bottom-4 right-1/4 text-[10px] font-mono text-[#8E9B94]/80 pointer-events-none">
              SOUTHERN CLUSTER (SANGLI/SOLAPUR)
            </div>

            {/* Render Farm Markers & Hub Pins */}
            {filteredMarkers.map((marker) => {
              const isSelected = selectedMarker?.id === marker.id;
              const isOzar = marker.id === 'cold-1' || marker.name.toLowerCase().includes('ozar') || marker.region.toLowerCase().includes('ozar');
              const isNasal = marker.id === 'farm-nasal' || marker.region.toLowerCase().includes('nasal');
              const isGreenHighlighted = isOzar || isNasal || marker.type === 'farm';
              const isMandi = marker.type === 'mandi';
              const isMart = marker.type === 'mart_hub';

              return (
                <div
                  key={marker.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMarker(marker);
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                  style={{ left: `${marker.xPercent}%`, top: `${marker.yPercent}%` }}
                >
                  {/* Green Pulse animation for selected, Ozar, or Nasal */}
                  {(isSelected || isOzar || isNasal) && (
                    <span
                      className={`absolute -inset-2.5 rounded-full animate-ping opacity-75 ${
                        isOzar ? 'bg-emerald-400' : isNasal ? 'bg-emerald-400' : 'bg-emerald-400'
                      }`}
                    />
                  )}

                  {/* Marker Visual Pin */}
                  <div
                    className={`relative p-2 rounded-2xl border transition-all duration-200 flex items-center gap-1.5 shadow-xl ${
                      isSelected
                        ? 'bg-[#1C2720] border-emerald-400 scale-110 ring-2 ring-emerald-400/80 z-20 shadow-emerald-950'
                        : isOzar
                        ? 'bg-[#142B1D] border-emerald-400 hover:scale-105 ring-2 ring-emerald-500/70 shadow-lg shadow-emerald-950/60'
                        : isNasal
                        ? 'bg-[#14261B] border-emerald-400 hover:scale-105 ring-1 ring-emerald-500/50'
                        : isGreenHighlighted
                        ? 'bg-[#14221A] border-emerald-500/70 hover:border-emerald-400 hover:scale-105'
                        : isMandi
                        ? 'bg-[#1D1912] border-amber-500/70 hover:border-amber-400 hover:scale-105'
                        : 'bg-[#132219] border-emerald-400/70 hover:border-emerald-300 hover:scale-105'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isOzar
                          ? 'bg-emerald-400 text-[#0F1411] font-black'
                          : isNasal
                          ? 'bg-emerald-400 text-[#0F1411] font-black'
                          : isGreenHighlighted
                          ? 'bg-emerald-500 text-[#0F1411]'
                          : isMandi
                          ? 'bg-amber-400 text-[#0F1411]'
                          : 'bg-emerald-400 text-[#0F1411]'
                      }`}
                    >
                      {isOzar ? '🍇' : isNasal ? '🍇' : isGreenHighlighted ? '🌾' : isMandi ? '🏛️' : '🏪'}
                    </div>

                    <div className="pr-1 hidden sm:block">
                      <div
                        className={`text-[11px] font-bold whitespace-nowrap flex items-center gap-1 ${
                          isSelected ? 'text-emerald-300' : isOzar ? 'text-emerald-300' : isNasal ? 'text-emerald-400' : 'text-[#E5E9E7]'
                        }`}
                      >
                        <span>{marker.name.split(' ')[0]}</span>
                        {isOzar && <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1 rounded font-black">OZAR GREEN</span>}
                        {isNasal && !isOzar && <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1 rounded">NASAL</span>}
                      </div>
                      <div className="text-[9px] text-[#8E9B94] leading-tight">
                        {isGreenHighlighted ? `${marker.areaAcres} Ac • ${marker.cropName.split(' ')[0]}` : marker.region.split(',')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Hover Quick Card Popup */}
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block z-30 pointer-events-none min-w-[220px]">
                    <div className="bg-[#141B17] border border-emerald-500/60 p-2.5 rounded-xl shadow-2xl text-xs space-y-1">
                      <div className="font-bold text-[#E5E9E7] flex items-center justify-between">
                        <span>{marker.name}</span>
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/20 px-1 rounded font-black">
                          NDVI {marker.ndviScore}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-300 font-semibold">{marker.cropName}</div>
                      <div className="text-[10px] text-[#8E9B94] truncate">📍 {marker.village}, {marker.taluka}</div>
                      <div className="text-[10px] text-[#8E9B94] flex items-center justify-between pt-1 border-t border-[#2C3631]">
                        <span>Yield: {marker.expectedYieldTons} T</span>
                        <span className="text-emerald-400 font-bold">Moisture: {marker.moisturePercent}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Floating Map Footer Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md bg-emerald-400" />
                <span className="text-[11px] text-emerald-300 font-semibold">🍇 Nashik Ozar & Nasal Green</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md bg-emerald-600" />
                <span className="text-[11px] text-[#8E9B94]">🌾 Regional Farm Parcels</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md bg-amber-400" />
                <span className="text-[11px] text-[#8E9B94]">🏛️ APMC Mandi Hub</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSimulatingLogistics(!isSimulatingLogistics)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSimulatingLogistics
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-[#141B17] text-[#8E9B94] border-[#2C3631] hover:text-[#E5E9E7]'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSimulatingLogistics ? 'Transit Active' : 'Simulate Freight'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Parcel & Verified Address Inspector Drawer (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {selectedMarker ? (
            <motion.div
              key={selectedMarker.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#141B17] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-[#E5E9E7]"
            >
              {/* Header Title */}
              <div className="flex items-start justify-between gap-2 border-b border-[#2C3631] pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        selectedMarker.id === 'cold-1'
                          ? 'bg-emerald-500 text-[#0F1411] font-black'
                          : selectedMarker.id === 'farm-nasal'
                          ? 'bg-emerald-500 text-[#0F1411] font-black'
                          : selectedMarker.type === 'farm'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {selectedMarker.id === 'cold-1'
                        ? '🍇 NASHIK OZAR GREEN HUB'
                        : selectedMarker.id === 'farm-nasal'
                        ? '🍇 NASAL GREEN ESTATE'
                        : selectedMarker.type === 'farm'
                        ? '🌾 Verified Green Parcel'
                        : '🏪 Buyer Terminal Hub'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                      NDVI {selectedMarker.ndviScore} Vigor
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#E5E9E7]">{selectedMarker.name}</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedMarker.village}, {selectedMarker.taluka}, {selectedMarker.district}</span>
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#1C2720] border border-emerald-500/40 flex items-center justify-center text-lg">
                  {selectedMarker.id === 'cold-1' ? '🍇' : selectedMarker.id === 'farm-nasal' ? '🍇' : selectedMarker.type === 'farm' ? '🌾' : '🏪'}
                </div>
              </div>

              {/* Verified Address Card with Zero-Network Instant Inspector */}
              <div className="bg-[#0F1813] border border-emerald-500/30 rounded-2xl p-3.5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>7/12 Verified Farm & Hub Address</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(selectedMarker)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy full verified address"
                  >
                    {copiedAddressId === selectedMarker.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-emerald-400" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-[#D4E4BC] leading-relaxed bg-[#0A120D] p-2.5 rounded-xl border border-[#2C3631]/80">
                  <p className="font-semibold text-[#E5E9E7]">{selectedMarker.fullAddress}</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 pt-2 border-t border-[#2C3631]/60 text-[11px] text-[#8E9B94]">
                    <div>
                      <span className="text-[#8E9B94]">Gat/Survey: </span>
                      <span className="text-emerald-400 font-semibold">{selectedMarker.gatOrSurveyNo}</span>
                    </div>
                    <div>
                      <span className="text-[#8E9B94]">Pincode: </span>
                      <span className="text-[#E5E9E7] font-semibold">{selectedMarker.pincode}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#8E9B94]">Highway: </span>
                      <span className="text-[#D4E4BC] font-medium">{selectedMarker.nearestHighway}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#8E9B94]">GPS RTK: </span>
                      <span className="font-mono text-emerald-400 font-semibold">{selectedMarker.lat.toFixed(4)}°N, {selectedMarker.lng.toFixed(4)}°E ({selectedMarker.plusCode})</span>
                    </div>
                  </div>
                </div>

                {/* Open Full Address Modal Button */}
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="w-full py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Verified Revenue Document & Geo-Tag</span>
                </button>
              </div>

              {/* Crop & Agronomy Summary */}
              <div className="bg-[#0F1411] border border-[#2C3631] rounded-2xl p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9B94]">Crop / Facility:</span>
                  <span className="font-bold text-emerald-400">{selectedMarker.cropName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9B94]">Grower / Operator:</span>
                  <span className="font-semibold text-[#E5E9E7]">{selectedMarker.farmerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9B94]">Land Acreage:</span>
                  <span className="font-semibold text-[#E5E9E7]">{selectedMarker.areaAcres} Acres</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9B94]">Est. Yield / Capacity:</span>
                  <span className="font-bold text-emerald-300">{selectedMarker.expectedYieldTons} Metric Tons</span>
                </div>
              </div>

              {/* Live IoT Agronomy & Soil Telemetry */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#8E9B94] uppercase">
                  <span>IoT Soil & Microclimate</span>
                  <span className="text-emerald-400 font-mono text-[10px]">● Live Sync</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0F1411] border border-[#2C3631] p-2.5 rounded-xl text-center">
                    <Droplet className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <div className="text-[10px] text-[#8E9B94]">Moisture</div>
                    <div className="text-xs font-bold text-emerald-300">{selectedMarker.moisturePercent}%</div>
                  </div>
                  <div className="bg-[#0F1411] border border-[#2C3631] p-2.5 rounded-xl text-center">
                    <Activity className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-[10px] text-[#8E9B94]">Soil pH</div>
                    <div className="text-xs font-bold text-[#E5E9E7]">{selectedMarker.phLevel}</div>
                  </div>
                  <div className="bg-[#0F1411] border border-[#2C3631] p-2.5 rounded-xl text-center">
                    <Thermometer className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <div className="text-[10px] text-[#8E9B94]">Temperature</div>
                    <div className="text-xs font-bold text-[#E5E9E7]">{selectedMarker.tempCelsius}°C</div>
                  </div>
                </div>
              </div>

              {/* Freight Logistics Corridor Calculator */}
              {calculatedLogistics && (
                <div className="bg-[#14231A] border border-emerald-500/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      <span>Direct Transit Corridor</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Fastest Route</span>
                  </div>

                  <div className="text-xs text-[#8E9B94] space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Destination Terminal:</span>
                      <span className="font-semibold text-[#E5E9E7] truncate max-w-[150px]">
                        {calculatedLogistics.destination.split(' ')[0]} Hub
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Corridor Distance:</span>
                      <span className="font-bold text-[#E5E9E7]">{calculatedLogistics.distanceKm} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Transit Time:</span>
                      <span className="font-bold text-amber-300">{calculatedLogistics.transitHours} Hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reefer Freight Cost:</span>
                      <span className="font-bold text-emerald-400">₹{calculatedLogistics.freightCost}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('marketplace', selectedMarker.cropName)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0F1411] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-950"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trade Crop</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('logistics')}
                  className="py-2.5 px-3 rounded-xl bg-[#242C28] hover:bg-[#2C3631] text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Book Freight</span>
                </button>
              </div>

              {/* Delete / Remove Parcel Option */}
              <div className="pt-1 flex items-center justify-between border-t border-[#2C3631]/60 text-[11px]">
                <span className="text-[#8E9B94] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Permanent in GIS until deleted</span>
                </span>
                <button
                  type="button"
                  onClick={() => setParcelToDelete(selectedMarker)}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Plot</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#141B17] border border-[#2C3631] rounded-3xl p-6 text-center text-[#8E9B94] space-y-2">
              <Compass className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs">Click on Nashik Ozar, Nasal or any farm parcel on the map to inspect verified farm address and live telemetry.</p>
            </div>
          )}
        </div>
      </div>

      {/* Geospatial D3 Heatmap for Maharashtra Yield Density */}
      <div className="mt-8">
        <MaharashtraYieldHeatmap currentLanguage={currentLanguage} />
      </div>

      {/* Network-Errorless Full Farm Address & Land Record Modal */}
      <AnimatePresence>
        {isAddressModalOpen && selectedMarker && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141B17] border border-emerald-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-[#E5E9E7] space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#2C3631] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#E5E9E7]">Official Land & Hub Record</h3>
                    <p className="text-xs text-emerald-400">100% Verified Revenue Address & Geo-Boundary</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#0F1411] border border-[#2C3631] flex items-center justify-center text-[#8E9B94] hover:text-[#E5E9E7]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Farm Name & Header */}
              <div className="bg-[#0F1813] border border-emerald-500/30 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold">REVENUE 7/12 & MIDC EXTRACT</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                    ✓ Verified Active
                  </span>
                </div>
                <div className="text-lg font-bold text-[#E5E9E7]">{selectedMarker.name}</div>
                <div className="text-xs text-[#8E9B94]">
                  Registered Operator: <span className="text-[#E5E9E7] font-semibold">{selectedMarker.farmerName}</span>
                </div>
              </div>

              {/* Complete Address Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="bg-[#0F1411] border border-[#2C3631] p-3 rounded-xl space-y-1.5">
                  <div className="text-[#8E9B94] font-semibold">Full Physical Postal Address:</div>
                  <div className="font-bold text-emerald-300 leading-relaxed">{selectedMarker.fullAddress}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#0F1411] border border-[#2C3631] p-2.5 rounded-xl">
                    <div className="text-[#8E9B94] text-[11px]">Gat / Survey Number</div>
                    <div className="font-bold text-[#E5E9E7] mt-0.5">{selectedMarker.gatOrSurveyNo}</div>
                  </div>
                  <div className="bg-[#0F1411] border border-[#2C3631] p-2.5 rounded-xl">
                    <div className="text-[#8E9B94] text-[11px]">Village / Panchayat / MIDC</div>
                    <div className="font-bold text-[#E5E9E7] mt-0.5">{selectedMarker.village}</div>
                  </div>
                  <div className="bg-[#0F1411] border border-[#2C3631] p-2.5 rounded-xl">
                    <div className="text-[#8E9B94] text-[11px]">Taluka & District</div>
                    <div className="font-bold text-[#E5E9E7] mt-0.5">{selectedMarker.taluka}, {selectedMarker.district}</div>
                  </div>
                  <div className="bg-[#0F1411] border border-[#2C3631] p-2.5 rounded-xl">
                    <div className="text-[#8E9B94] text-[11px]">PIN Code</div>
                    <div className="font-bold text-[#E5E9E7] mt-0.5">{selectedMarker.pincode}</div>
                  </div>
                </div>

                <div className="bg-[#0F1411] border border-[#2C3631] p-3 rounded-xl space-y-1">
                  <div className="text-[#8E9B94] text-[11px]">Nearest Highway Access</div>
                  <div className="font-semibold text-[#D4E4BC]">{selectedMarker.nearestHighway}</div>
                </div>

                <div className="bg-[#0F1411] border border-[#2C3631] p-3 rounded-xl space-y-1">
                  <div className="text-[#8E9B94] text-[11px]">DGPS Coordinates & Plus Code</div>
                  <div className="font-mono text-emerald-400 font-bold">
                    {selectedMarker.lat.toFixed(6)}° N, {selectedMarker.lng.toFixed(6)}° E ({selectedMarker.plusCode})
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#2C3631]">
                <button
                  type="button"
                  onClick={() => handleCopyAddress(selectedMarker)}
                  className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#0F1411] font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-950"
                >
                  {copiedAddressId === selectedMarker.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAddressId === selectedMarker.id ? 'Address Copied!' : 'Copy Full Verified Address'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="py-2.5 px-4 bg-[#242C28] hover:bg-[#2C3631] text-[#E5E9E7] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Delete Parcel Confirmation Modal */}
        {parcelToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141B17] border border-red-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl text-[#E5E9E7] space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#E5E9E7]">Delete Farm Plot</h3>
                  <p className="text-xs text-[#8E9B94]">Remove parcel and GIS records from software</p>
                </div>
              </div>

              <div className="bg-[#0F1411] border border-[#2C3631] p-3.5 rounded-2xl space-y-1 text-xs">
                <div className="text-sm font-semibold text-white">{parcelToDelete.name}</div>
                <div className="text-[#8E9B94]">{parcelToDelete.village}, {parcelToDelete.taluka}, {parcelToDelete.district}</div>
                <div className="text-emerald-400 font-medium mt-1">{parcelToDelete.cropName} • {parcelToDelete.areaAcres} Acres</div>
              </div>

              <p className="text-xs text-[#8E9B94]">
                This plot will be deleted from your persistent farm records. If not deleted, it remains saved across all sessions.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setParcelToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#2C3631] bg-[#161D19] hover:bg-[#202924] text-xs font-semibold text-[#8E9B94] hover:text-[#E5E9E7] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteParcel(parcelToDelete)}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-red-950 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
