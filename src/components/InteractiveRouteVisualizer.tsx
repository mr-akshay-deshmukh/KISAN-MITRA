import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  Sparkles,
  ShieldCheck,
  Thermometer,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronRight,
  Share2,
  Layers,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Volume2,
  VolumeX,
  Radio,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  Sprout,
  Filter,
  Eye,
  Activity,
  Check,
  Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageCode } from '../types';
import { audioSpeech } from '../utils/audioSpeech';

export interface RouteFarmNode {
  id: string;
  name: string;
  farmer: string;
  crop: string;
  qtyTons: number;
  lat: number;
  lng: number;
  xPercent: number; // 0 - 100 for SVG canvas projection
  yPercent: number; // 0 - 100 for SVG canvas projection
  region: string;
  category: 'fruits' | 'vegetables' | 'grains' | 'organic';
  pickupWindow: string;
  loadingTimeMins: number;
  contactNumber: string;
  elevationMeters: number;
  isIncluded: boolean;
}

export interface RouteHubNode {
  id: string;
  name: string;
  hubType: 'apmc_terminal' | 'export_port' | 'air_cargo' | 'fpo_aggregation' | 'food_processing';
  lat: number;
  lng: number;
  xPercent: number;
  yPercent: number;
  city: string;
  state: string;
  capacityTons: number;
  receivingWindow: string;
  coldStorageAvailable: boolean;
  contactPerson: string;
}

export interface RouteCorridorPreset {
  id: string;
  title: string;
  marathiTitle: string;
  hindiTitle: string;
  description: string;
  farmIds: string[];
  destinationHubId: string;
  truckType: string;
  baseDistanceKm: number;
  baseTransitHours: number;
  highwayCorridor: string;
}

// Coordinate bounding box for Western Maharashtra & Central India Agro Corridors
// Lat: ~16.0° N to ~20.5° N
// Lng: ~72.6° E to ~75.6° E

export const MOCK_FARM_NODES: RouteFarmNode[] = [
  {
    id: 'farm-baramati',
    name: 'Suresh Patil Dragon Fruit Orchards',
    farmer: 'Suresh Patil & Sons',
    crop: 'Red Velvet Dragon Fruit (कमलम)',
    qtyTons: 2.5,
    lat: 18.1523,
    lng: 74.5768,
    xPercent: 68,
    yPercent: 54,
    region: 'Baramati, Pune',
    category: 'fruits',
    pickupWindow: '06:00 AM - 06:45 AM',
    loadingTimeMins: 35,
    contactNumber: '+91 98221 44520',
    elevationMeters: 538,
    isIncluded: true,
  },
  {
    id: 'farm-indapur',
    name: 'Ganesh FPO Pomegranate Packhouse',
    farmer: 'Ganesh Agro Producers Group',
    crop: 'Bhagwa Export Pomegranate (अनार)',
    qtyTons: 3.2,
    lat: 18.1158,
    lng: 75.0298,
    xPercent: 82,
    yPercent: 56,
    region: 'Indapur, Pune',
    category: 'fruits',
    pickupWindow: '07:15 AM - 08:00 AM',
    loadingTimeMins: 40,
    contactNumber: '+91 94220 18733',
    elevationMeters: 512,
    isIncluded: true,
  },
  {
    id: 'farm-daund',
    name: 'Anand Hydroponic & Exotic Greens',
    farmer: 'Anand Shinde',
    crop: 'Walnuts, Cherry Tomatoes & Lettuce',
    qtyTons: 2.8,
    lat: 18.4632,
    lng: 74.5815,
    xPercent: 68,
    yPercent: 44,
    region: 'Daund, Pune',
    category: 'vegetables',
    pickupWindow: '08:45 AM - 09:30 AM',
    loadingTimeMins: 30,
    contactNumber: '+91 98902 77114',
    elevationMeters: 514,
    isIncluded: true,
  },
  {
    id: 'farm-saswad',
    name: 'Khandke Organic High-Density Farms',
    farmer: 'Dattatray Khandke',
    crop: 'Organic Figs & Colored Bell Peppers',
    qtyTons: 1.5,
    lat: 18.3444,
    lng: 74.0298,
    xPercent: 52,
    yPercent: 48,
    region: 'Saswad, Purandar',
    category: 'organic',
    pickupWindow: '09:45 AM - 10:15 AM',
    loadingTimeMins: 25,
    contactNumber: '+91 98234 55901',
    elevationMeters: 620,
    isIncluded: false,
  },
  {
    id: 'farm-niphad',
    name: 'Sahyadri Valley Export Vineyard',
    farmer: 'Kailasrao Bhor',
    crop: 'Sonaka & Thompson Export Grapes',
    qtyTons: 4.5,
    lat: 20.0894,
    lng: 74.0215,
    xPercent: 52,
    yPercent: 12,
    region: 'Niphad, Nashik',
    category: 'fruits',
    pickupWindow: '05:30 AM - 06:15 AM',
    loadingTimeMins: 45,
    contactNumber: '+91 98224 88310',
    elevationMeters: 565,
    isIncluded: false,
  },
  {
    id: 'farm-pimpalgaon',
    name: 'Pimpalgaon Baswant Onion Cluster',
    farmer: 'Pimpalgaon Onion Union',
    crop: 'Garwa Export Red Onions (कांदा)',
    qtyTons: 5.0,
    lat: 20.1685,
    lng: 73.9872,
    xPercent: 50,
    yPercent: 9,
    region: 'Pimpalgaon, Nashik',
    category: 'vegetables',
    pickupWindow: '06:30 AM - 07:15 AM',
    loadingTimeMins: 50,
    contactNumber: '+91 94231 66205',
    elevationMeters: 580,
    isIncluded: false,
  },
  {
    id: 'farm-sangamner',
    name: 'Pravara Valley Pomegranate & Citrus',
    farmer: 'Sangamner Horticulture FPO',
    crop: 'Ruby Red Pomegranate & Sweet Lime',
    qtyTons: 3.0,
    lat: 19.5761,
    lng: 74.2089,
    xPercent: 57,
    yPercent: 24,
    region: 'Sangamner, Ahmednagar',
    category: 'fruits',
    pickupWindow: '07:30 AM - 08:15 AM',
    loadingTimeMins: 35,
    contactNumber: '+91 98601 22987',
    elevationMeters: 549,
    isIncluded: false,
  },
  {
    id: 'farm-devgad',
    name: 'Devgad Alphonso Direct Groves',
    farmer: 'Vasantrao Rane',
    crop: 'GI Tagged Devgad Alphonso Mango (हापूस)',
    qtyTons: 3.8,
    lat: 16.3752,
    lng: 73.3768,
    xPercent: 32,
    yPercent: 92,
    region: 'Devgad, Sindhudurg',
    category: 'fruits',
    pickupWindow: '05:00 AM - 05:45 AM',
    loadingTimeMins: 40,
    contactNumber: '+91 94224 33119',
    elevationMeters: 25,
    isIncluded: false,
  },
];

export const MOCK_DELIVERY_HUBS: RouteHubNode[] = [
  {
    id: 'hub-vashi',
    name: 'Vashi APMC Central Terminal & Cold Logistics',
    hubType: 'apmc_terminal',
    lat: 19.076,
    lng: 72.9985,
    xPercent: 22,
    yPercent: 32,
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    capacityTons: 850,
    receivingWindow: '12:00 PM - 05:00 PM',
    coldStorageAvailable: true,
    contactPerson: 'Director R. S. Kadam (Gate 4)',
  },
  {
    id: 'hub-pune-hadapsar',
    name: 'Pune Hadapsar Regional Cold Aggregation Terminal',
    hubType: 'fpo_aggregation',
    lat: 18.5089,
    lng: 73.9259,
    xPercent: 49,
    yPercent: 43,
    city: 'Pune',
    state: 'Maharashtra',
    capacityTons: 400,
    receivingWindow: '09:00 AM - 02:00 PM',
    coldStorageAvailable: true,
    contactPerson: 'M. P. Deshmukh',
  },
  {
    id: 'hub-jnpt',
    name: 'JNPT Nhava Sheva Reefer Container Freight Station',
    hubType: 'export_port',
    lat: 18.9498,
    lng: 72.9512,
    xPercent: 20,
    yPercent: 36,
    city: 'Uran, Navi Mumbai',
    state: 'Maharashtra',
    capacityTons: 2500,
    receivingWindow: '24x7 Verified Port Gate-In',
    coldStorageAvailable: true,
    contactPerson: 'Marine Freight Logistics Desk',
  },
  {
    id: 'hub-mumbai-cargo',
    name: 'Chhatrapati Shivaji Maharaj Air Cargo Perishable Terminal',
    hubType: 'air_cargo',
    lat: 19.0896,
    lng: 72.8656,
    xPercent: 17,
    yPercent: 30,
    city: 'Mumbai',
    state: 'Maharashtra',
    capacityTons: 600,
    receivingWindow: '06:00 AM - 08:00 PM',
    coldStorageAvailable: true,
    contactPerson: 'Air India Cargo Perishables Gate',
  },
  {
    id: 'hub-ranjangaon',
    name: 'Ranjangaon MIDC Food Processing Mega Cluster',
    hubType: 'food_processing',
    lat: 18.7758,
    lng: 74.3215,
    xPercent: 61,
    yPercent: 37,
    city: 'Shirur, Pune',
    state: 'Maharashtra',
    capacityTons: 1200,
    receivingWindow: '08:00 AM - 06:00 PM',
    coldStorageAvailable: true,
    contactPerson: 'AgroProcure Quality Incharge',
  },
];

export const CORRIDOR_PRESETS: RouteCorridorPreset[] = [
  {
    id: 'preset-baramati-mumbai',
    title: 'Baramati-Indapur-Daund Cluster ➔ Vashi APMC Cold Hub',
    marathiTitle: 'बारामती-इंदापूर-दौंड क्लस्टर ➔ वाशी एपीएमसी कोल्ड हब',
    hindiTitle: 'बारामती-इंदापुर-दौंड क्लस्टर ➔ वाशी एपीएमसी कोल्ड हब',
    description: 'Consolidates dragon fruit, pomegranate & exotic greens into one 10-Ton Reefer via Pune-Mumbai Expressway corridor.',
    farmIds: ['farm-baramati', 'farm-indapur', 'farm-daund'],
    destinationHubId: 'hub-vashi',
    truckType: '10-Ton Reefer (+4°C to +7°C)',
    baseDistanceKm: 218,
    baseTransitHours: 4.8,
    highwayCorridor: 'NH-65 & Yashwantrao Chavan Pune-Mumbai Expressway',
  },
  {
    id: 'preset-nashik-export',
    title: 'Nashik Grape & Onion Belt ➔ JNPT Port Reefer Terminal',
    marathiTitle: 'नाशिक द्राक्ष व कांदा पट्टा ➔ जेएनपीटी पोर्ट कंटेनर टर्मिनल',
    hindiTitle: 'नासिक अंगूर एवं प्याज बेल्ट ➔ जेएनपीटी पोर्ट कंटेनर टर्मिनल',
    description: 'Direct export corridor connecting Niphad vineyards and Pimpalgaon auction lots directly to marine reefer ships.',
    farmIds: ['farm-niphad', 'farm-pimpalgaon', 'farm-sangamner'],
    destinationHubId: 'hub-jnpt',
    truckType: '12-Ton Pre-Cooled Container Reefer',
    baseDistanceKm: 204,
    baseTransitHours: 4.5,
    highwayCorridor: 'NH-160 & Samruddhi Mahamarg Corridor',
  },
  {
    id: 'preset-pune-local',
    title: 'Purandar-Daund-Baramati ➔ Pune Hadapsar Agro Hub',
    marathiTitle: 'पुरंदर-दौंड-बारामती ➔ पुणे हडपसर अ‍ॅग्रो हब',
    hindiTitle: 'पुरंदर-दौंड-बारामती ➔ पुणे हडपसर एग्रो हब',
    description: 'Fast regional milk-run supplying fresh daily organics and fruits to Pune corporate supermarket distribution.',
    farmIds: ['farm-saswad', 'farm-daund', 'farm-baramati'],
    destinationHubId: 'hub-pune-hadapsar',
    truckType: '6-Ton Ventilated E-Truck',
    baseDistanceKm: 92,
    baseTransitHours: 2.3,
    highwayCorridor: 'Pune-Solapur Highway & Hadapsar Bypass',
  },
  {
    id: 'preset-konkan-mango',
    title: 'Devgad Alphonso Mango Groves ➔ Mumbai Air Cargo Hub',
    marathiTitle: 'देवगड हापूस बागायत ➔ मुंबई आंतरराष्ट्रीय एअर कार्गो',
    hindiTitle: 'देवगढ़ हापुस बाग ➔ मुंबई अंतरराष्ट्रीय एयर कार्गो',
    description: 'Ultra-fresh express lane delivering GI-tagged Devgad Alphonso to Gulf and London air freight flights within 7 hours.',
    farmIds: ['farm-devgad', 'farm-saswad'],
    destinationHubId: 'hub-mumbai-cargo',
    truckType: '8-Ton Controlled Atmosphere Reefer (+12°C)',
    baseDistanceKm: 345,
    baseTransitHours: 7.2,
    highwayCorridor: 'NH-66 Mumbai-Goa Highway & Expressway',
  },
];

interface InteractiveRouteVisualizerProps {
  currentLanguage: LanguageCode;
  onBookPooledTruck?: () => void;
  onAlertDriver?: (message: string) => void;
}

export const InteractiveRouteVisualizer: React.FC<InteractiveRouteVisualizerProps> = ({
  currentLanguage,
  onBookPooledTruck,
  onAlertDriver,
}) => {
  // State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-baramati-mumbai');
  const [farmNodes, setFarmNodes] = useState<RouteFarmNode[]>(MOCK_FARM_NODES);
  const [destinationHubId, setDestinationHubId] = useState<string>('hub-vashi');
  const [optimizationMode, setOptimizationMode] = useState<'fastest' | 'cold_chain' | 'lowest_cost'>('cold_chain');
  const [mapTheme, setMapTheme] = useState<'dark_corridor' | 'topographic' | 'cold_heatmap'>('dark_corridor');
  const [activeNodeDetails, setActiveNodeDetails] = useState<RouteFarmNode | RouteHubNode | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'elevation' | 'waypoints' | 'telemetry'>('map');

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0); // 0 to 100
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(1);
  const [simCurrentKm, setSimCurrentKm] = useState(0);
  const [simCurrentTemp, setSimCurrentTemp] = useState(5.2);
  const [simSpeedKmh, setSimSpeedKmh] = useState(64);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Active Hub
  const activeHub = useMemo(() => {
    return MOCK_DELIVERY_HUBS.find((h) => h.id === destinationHubId) || MOCK_DELIVERY_HUBS[0];
  }, [destinationHubId]);

  // Active Included Farms
  const activeFarms = useMemo(() => {
    return farmNodes.filter((f) => f.isIncluded);
  }, [farmNodes]);

  // Load Preset
  const handleSelectPreset = (presetId: string) => {
    const preset = CORRIDOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setDestinationHubId(preset.destinationHubId);
    setFarmNodes((prev) =>
      prev.map((f) => ({
        ...f,
        isIncluded: preset.farmIds.includes(f.id),
      }))
    );
    // Reset simulation
    setIsSimulating(false);
    setSimProgress(0);
    setSimCurrentKm(0);
  };

  // Toggle Farm Inclusion
  const handleToggleFarm = (farmId: string) => {
    setFarmNodes((prev) =>
      prev.map((f) => (f.id === farmId ? { ...f, isIncluded: !f.isIncluded } : f))
    );
    setIsSimulating(false);
    setSimProgress(0);
  };

  // Calculate Ordered Stops (Optimal Sequencing based on distance & logistics)
  const routeWaypoints = useMemo(() => {
    if (activeFarms.length === 0) return [];

    // Sort active farms from east/south towards destination hub (Navi Mumbai / Pune)
    const sorted = [...activeFarms].sort((a, b) => {
      // Calculate distance heuristic to destination hub
      const distA = Math.hypot(a.xPercent - activeHub.xPercent, a.yPercent - activeHub.yPercent);
      const distB = Math.hypot(b.xPercent - activeHub.xPercent, b.yPercent - activeHub.yPercent);
      return distB - distA; // Start furthest away, pick up inward towards hub
    });

    return sorted;
  }, [activeFarms, activeHub]);

  // Calculate Aggregated Metrics
  const routeMetrics = useMemo(() => {
    const totalTons = activeFarms.reduce((sum, f) => sum + f.qtyTons, 0);
    const stopCount = activeFarms.length;

    let baseDist = 180;
    if (selectedPresetId === 'preset-baramati-mumbai') baseDist = 218;
    else if (selectedPresetId === 'preset-nashik-export') baseDist = 204;
    else if (selectedPresetId === 'preset-pune-local') baseDist = 92;
    else if (selectedPresetId === 'preset-konkan-mango') baseDist = 345;
    else {
      // Custom distance estimation
      baseDist = Math.max(75, Math.round(stopCount * 42 + 90));
    }

    const modeMultiplier = optimizationMode === 'fastest' ? 1.05 : optimizationMode === 'cold_chain' ? 1.0 : 0.95;
    const totalKm = Math.round(baseDist * modeMultiplier);
    const transitHours = +(totalKm / 46 + stopCount * 0.45).toFixed(1);

    // Cost calculations
    const costSeparate = Math.round(stopCount * 6200 + totalKm * 32);
    const costPooled = Math.round(costSeparate * (1 - Math.min(0.48, 0.28 + stopCount * 0.05)));
    const savingsPercent = Math.round(((costSeparate - costPooled) / costSeparate) * 100);
    const co2SavedKg = Math.round(stopCount * 22 + totalKm * 0.18);
    const fuelSavedLiters = Math.round(co2SavedKg / 2.6);

    return {
      totalTons: +totalTons.toFixed(1),
      stopCount,
      totalKm,
      transitHours,
      costSeparate,
      costPooled,
      savingsPercent,
      co2SavedKg,
      fuelSavedLiters,
    };
  }, [activeFarms, selectedPresetId, optimizationMode]);

  // Path polyline coordinates generation for SVG
  const pathPoints = useMemo(() => {
    if (routeWaypoints.length === 0) return [];
    // Points array: [Farm 1, Intermediate Highway waypoint, Farm 2, ..., Pune Expressway Corridor, Destination Hub]
    const pts: { x: number; y: number; label: string; type: string }[] = [];

    routeWaypoints.forEach((farm, idx) => {
      pts.push({
        x: farm.xPercent,
        y: farm.yPercent,
        label: `Stop ${idx + 1}: ${farm.name}`,
        type: 'farm',
      });
    });

    // Add intermediate realistic expressway junction curve
    // E.g., Khandala / Khopoli Ghat junction before Vashi
    if (activeHub.id === 'hub-vashi' || activeHub.id === 'hub-jnpt' || activeHub.id === 'hub-mumbai-cargo') {
      pts.push({
        x: 32,
        y: 38,
        label: 'Pune-Mumbai Expressway (Khopoli Ghat Cold Corridor)',
        type: 'highway_corridor',
      });
    } else if (activeHub.id === 'hub-pune-hadapsar') {
      pts.push({
        x: 54,
        y: 45,
        label: 'Hadapsar Green Freight Bypass',
        type: 'highway_corridor',
      });
    }

    // Destination
    pts.push({
      x: activeHub.xPercent,
      y: activeHub.yPercent,
      label: `Drop-off Terminal: ${activeHub.name}`,
      type: 'hub',
    });

    return pts;
  }, [routeWaypoints, activeHub]);

  // SVG Smooth Path 'd' attribute
  const svgPathD = useMemo(() => {
    if (pathPoints.length < 2) return '';
    let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      // Generate slight natural organic Bezier curve for highways
      const cx1 = prev.x + (curr.x - prev.x) * 0.45;
      const cy1 = prev.y + (curr.y - prev.y) * 0.15;
      const cx2 = prev.x + (curr.x - prev.x) * 0.55;
      const cy2 = prev.y + (curr.y - prev.y) * 0.85;

      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [pathPoints]);

  // Interactive Live Transit Animation Loop
  useEffect(() => {
    if (!isSimulating) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setSimProgress((prev) => {
        const step = (dt * 5 * simSpeed); // 20s to complete full trip at 1x
        const next = prev + step;

        if (next >= 100) {
          setIsSimulating(false);
          // Play destination audio chime if unmuted
          if (!isAudioMuted) {
            audioSpeech.speak('Reefer truck safely arrived at delivery terminal.', currentLanguage);
          }
          return 100;
        }

        // Live Telemetry updates
        const currentDistance = Math.round((next / 100) * routeMetrics.totalKm);
        setSimCurrentKm(currentDistance);

        // Fluctuate simulated reefer temperature slightly around +4.8°C to +5.4°C
        const tempNoise = Math.sin(now / 800) * 0.25;
        setSimCurrentTemp(+(5.0 + tempNoise).toFixed(1));

        // Speed fluctuation
        const speedNoise = Math.sin(now / 500) * 8;
        setSimSpeedKmh(Math.round(62 + speedNoise));

        return next;
      });

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSimulating, simSpeed, routeMetrics.totalKm, isAudioMuted]);

  // Current interpolated truck coordinates on SVG canvas
  const currentTruckPos = useMemo(() => {
    if (pathPoints.length === 0) return { x: 50, y: 50 };
    if (pathPoints.length === 1) return { x: pathPoints[0].x, y: pathPoints[0].y };

    const totalSegments = pathPoints.length - 1;
    const globalT = simProgress / 100;
    const segmentIndex = Math.min(totalSegments - 1, Math.floor(globalT * totalSegments));
    const localT = (globalT * totalSegments) - segmentIndex;

    const p0 = pathPoints[segmentIndex];
    const p1 = pathPoints[segmentIndex + 1];

    const curX = p0.x + (p1.x - p0.x) * localT;
    const curY = p0.y + (p1.y - p0.y) * localT;

    return { x: +curX.toFixed(2), y: +curY.toFixed(2) };
  }, [pathPoints, simProgress]);

  // Spoken Highway Announcement
  const handleAnnounceMilestone = () => {
    const text =
      currentLanguage === 'mr'
        ? `१०-टन शेअर्ड कोल्ड-चेन ट्रक सध्या महामार्गावर ६४ किमी वेगाने सुरू आहे. आतील तापमान ५.२ अंश सेल्सिअस सुरक्षित आहे.`
        : currentLanguage === 'hi'
        ? `10-टन साझा कोल्ड-चेन ट्रक वर्तमान में 64 किमी/घंटे की गति से हाईवे पर चल रहा है। अंदर का तापमान 5.2 डिग्री सुरक्षित है।`
        : `10-Ton Shared Reefer Truck active on highway at 64 km/h. Temperature sealed at +5.2°C.`;

    audioSpeech.speak(text, currentLanguage);
  };

  const copyCoordinates = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`bg-[#1A221E] border border-[#2C3631] rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none overflow-y-auto p-4 sm:p-6 bg-black/95 backdrop-blur-xl' : 'p-4 sm:p-6'
      }`}
    >
      {/* Header Banner & Preset Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#2C3631]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              GIS Path Optimizer
            </span>
            <span className="bg-[#242C28] text-[#D4E4BC] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#2C3631]">
              Live GPS & Altitude Telemetry
            </span>
            <span className="bg-[#C2D66E]/15 text-[#C2D66E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C2D66E]/30">
              Mock GIS Coordinates
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-white flex items-center gap-2">
            <span>
              {currentLanguage === 'mr'
                ? 'परस्परसंवादी शेत-ते-मार्केट वाहतूक मार्ग दर्शक'
                : currentLanguage === 'hi'
                ? 'इंटरएक्टिव फार्म-टू-मार्केट रूट विज़ुअलाइज़र'
                : 'Interactive Farm-to-Hub Route Visualizer'}
            </span>
          </h2>
          <p className="text-xs text-[#8E9B94]">
            Simulates optimal milk-run consolidation paths from farm parcel gates to terminal buyers with real-time elevation & cold-chain checkpoints.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-[#242C28] hover:bg-[#2C3631] text-[#D4E4BC] border border-[#2C3631] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Minimize' : 'Expand'}</span>
          </button>

          <button
            type="button"
            onClick={handleAnnounceMilestone}
            className="p-2 rounded-xl bg-[#242C28] hover:bg-[#2C3631] text-[#C2D66E] border border-[#2C3631] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Speak Telemetry"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Audio Guide</span>
          </button>

          {onBookPooledTruck && (
            <button
              type="button"
              onClick={onBookPooledTruck}
              className="px-4 py-2 rounded-xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lock This Route</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Corridors Horizontal Picker */}
      <div className="py-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9B94] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#C2D66E]" />
            <span>Select Strategic Agro-Highway Corridor:</span>
          </span>
          <span className="text-[10px] text-[#C2D66E]">
            {activeFarms.length} of {farmNodes.length} Farm Parcels Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {CORRIDOR_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#242C28] border-[#C2D66E] shadow-md ring-1 ring-[#C2D66E]/50'
                    : 'bg-[#141B17] border-[#2C3631] hover:border-[#8E9B94]/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {currentLanguage === 'mr' ? preset.marathiTitle : currentLanguage === 'hi' ? preset.hindiTitle : preset.title}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#C2D66E] text-[#0F1411] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8E9B94] line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-[#2C3631]/60 flex items-center justify-between text-[10px] text-[#D4E4BC]">
                  <span className="font-mono font-semibold">{preset.baseDistanceKm} km</span>
                  <span className="bg-[#0F1411] px-2 py-0.5 rounded text-[#C2D66E] font-medium border border-[#2C3631]">
                    ~{preset.baseTransitHours} hrs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Map & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Left / Center: Interactive SVG Map Canvas (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Map Top Control Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-[#141B17] border border-[#2C3631] p-2.5 rounded-2xl">
            {/* View Layer Switcher */}
            <div className="flex items-center gap-1 bg-[#0F1411] p-1 rounded-xl border border-[#2C3631]">
              <button
                type="button"
                onClick={() => setMapTheme('dark_corridor')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mapTheme === 'dark_corridor'
                    ? 'bg-[#C2D66E] text-[#0F1411]'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                Dark Corridor
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('topographic')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mapTheme === 'topographic'
                    ? 'bg-[#C2D66E] text-[#0F1411]'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                Topographic
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('cold_heatmap')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mapTheme === 'cold_heatmap'
                    ? 'bg-[#C2D66E] text-[#0F1411]'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                Cold Sensor
              </button>
            </div>

            {/* Optimization Mode */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[10px] font-bold text-[#8E9B94] uppercase mr-1 hidden sm:inline">Strategy:</span>
              <button
                type="button"
                onClick={() => setOptimizationMode('cold_chain')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  optimizationMode === 'cold_chain'
                    ? 'bg-[#242C28] text-[#C2D66E] border border-[#C2D66E]/40'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                ❄️ Max Cold-Chain
              </button>
              <button
                type="button"
                onClick={() => setOptimizationMode('fastest')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  optimizationMode === 'fastest'
                    ? 'bg-[#242C28] text-[#C2D66E] border border-[#C2D66E]/40'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                ⚡ Fastest
              </button>
              <button
                type="button"
                onClick={() => setOptimizationMode('lowest_cost')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  optimizationMode === 'lowest_cost'
                    ? 'bg-[#242C28] text-[#C2D66E] border border-[#C2D66E]/40'
                    : 'text-[#8E9B94] hover:text-white'
                }`}
              >
                💰 Max Savings
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.8, +(z + 0.2).toFixed(1)))}
                className="p-1.5 rounded-lg bg-[#242C28] hover:bg-[#2C3631] text-[#D4E4BC] text-xs cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.8, +(z - 0.2).toFixed(1)))}
                className="p-1.5 rounded-lg bg-[#242C28] hover:bg-[#2C3631] text-[#D4E4BC] text-xs cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg bg-[#242C28] hover:bg-[#2C3631] text-[#8E9B94] text-xs cursor-pointer font-mono text-[10px]"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>
          </div>

          {/* SVG Coordinate Map Display Box */}
          <div className="relative h-[380px] sm:h-[440px] rounded-3xl bg-[#0B0F0D] border border-[#2C3631] overflow-hidden select-none shadow-inner">
            {/* Background Grid & Textures */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                mapTheme === 'dark_corridor'
                  ? 'bg-[radial-gradient(#2C3631_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40'
                  : mapTheme === 'topographic'
                  ? 'bg-[radial-gradient(#405248_1px,transparent_1px)] [background-size:18px_18px] opacity-60'
                  : 'bg-[radial-gradient(#3B654D_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-50'
              }`}
            ></div>

            {/* Simulated Region Labels on Map */}
            <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-1">
              <span className="text-[10px] font-mono tracking-widest text-[#8E9B94]/60 uppercase">
                WESTERN MAHARASHTRA AGRO GRID
              </span>
              <span className="text-[11px] font-serif italic font-bold text-[#C2D66E]/80">
                Pune - Nashik - Konkan - Mumbai Corridor
              </span>
            </div>

            {/* Geographic Lat/Lng HUD overlay */}
            <div className="absolute bottom-3 left-4 pointer-events-none z-10 flex items-center gap-3 text-[10px] font-mono text-[#8E9B94]/70 bg-[#0F1411]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#2C3631]">
              <span>LAT: 16.0°N - 20.5°N</span>
              <span>•</span>
              <span>LNG: 72.6°E - 75.6°E</span>
              <span>•</span>
              <span className="text-[#C2D66E]">ELEVATION: 10m - 620m MSL</span>
            </div>

            {/* Compass Rose */}
            <div className="absolute top-4 right-4 pointer-events-none z-10 w-9 h-9 rounded-full bg-[#141B17]/90 border border-[#2C3631] flex items-center justify-center text-[#C2D66E] shadow-md">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '60s' }} />
            </div>

            {/* Interactive SVG Layer with dynamic Zoom */}
            <div
              className="w-full h-full transition-transform duration-300 origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  {/* Glowing line filters */}
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C2D66E" />
                    <stop offset="60%" stopColor="#8BE398" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                  <linearGradient id="coldSensorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#C2D66E" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Major Highway Corridors (Background Roads) */}
                {/* NH-65 Solapur - Pune */}
                <path
                  d="M 88 60 Q 68 54 49 43"
                  fill="none"
                  stroke="#242E28"
                  strokeWidth="0.9"
                  strokeDasharray="1.5,1.5"
                />
                {/* Yashwantrao Chavan Expressway (Pune to Navi Mumbai) */}
                <path
                  d="M 49 43 Q 32 38 22 32"
                  fill="none"
                  stroke="#2E3C34"
                  strokeWidth="1.2"
                />
                {/* NH-160 (Nashik to Mumbai) */}
                <path
                  d="M 52 12 Q 34 22 22 32"
                  fill="none"
                  stroke="#242E28"
                  strokeWidth="0.9"
                  strokeDasharray="1.5,1.5"
                />
                {/* NH-66 Mumbai - Goa */}
                <path
                  d="M 32 92 Q 26 62 20 36"
                  fill="none"
                  stroke="#242E28"
                  strokeWidth="0.9"
                  strokeDasharray="1.5,1.5"
                />

                {/* Highway Badges on map */}
                <text x="36" y="37" fill="#6B7A72" fontSize="2.2" fontFamily="monospace" fontWeight="bold">
                  PUNE-MUMBAI EXPWY
                </text>
                <text x="70" y="58" fill="#6B7A72" fontSize="2" fontFamily="monospace">
                  NH-65
                </text>
                <text x="38" y="16" fill="#6B7A72" fontSize="2" fontFamily="monospace">
                  SAMRUDDHI EXPWY
                </text>

                {/* Active Optimal Route Path Spline */}
                {svgPathD && (
                  <>
                    {/* Outer Glow Line */}
                    <path
                      d={svgPathD}
                      fill="none"
                      stroke={mapTheme === 'cold_heatmap' ? 'url(#coldSensorGradient)' : '#C2D66E'}
                      strokeWidth="1.6"
                      strokeOpacity="0.4"
                      filter="url(#routeGlow)"
                    />
                    {/* Core Solid Polyline */}
                    <path
                      d={svgPathD}
                      fill="none"
                      stroke={mapTheme === 'cold_heatmap' ? '#38BDF8' : 'url(#pathGradient)'}
                      strokeWidth="0.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Animated Directional Flow Dashes */}
                    <path
                      d={svgPathD}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="0.6"
                      strokeDasharray="1.5, 3"
                      className="animate-pulse"
                      strokeOpacity="0.9"
                    />
                  </>
                )}

                {/* Inactive Farm Nodes (Greyed out markers) */}
                {farmNodes
                  .filter((f) => !f.isIncluded)
                  .map((farm) => (
                    <g
                      key={farm.id}
                      onClick={() => handleToggleFarm(farm.id)}
                      className="cursor-pointer transition-opacity opacity-40 hover:opacity-100"
                    >
                      <circle
                        cx={farm.xPercent}
                        cy={farm.yPercent}
                        r="1.4"
                        fill="#1F2923"
                        stroke="#405047"
                        strokeWidth="0.4"
                      />
                      <text
                        x={farm.xPercent}
                        y={farm.yPercent + 3.2}
                        fill="#75857D"
                        fontSize="2.1"
                        textAnchor="middle"
                      >
                        + {farm.name.split(' ')[0]}
                      </text>
                    </g>
                  ))}

                {/* Destination Hub Markers */}
                {MOCK_DELIVERY_HUBS.map((hub) => {
                  const isSelected = hub.id === destinationHubId;
                  return (
                    <g
                      key={hub.id}
                      onClick={() => {
                        setDestinationHubId(hub.id);
                        setActiveNodeDetails(hub);
                      }}
                      className="cursor-pointer group"
                    >
                      {isSelected && (
                        <>
                          <circle
                            cx={hub.xPercent}
                            cy={hub.yPercent}
                            r="4.5"
                            fill="#38BDF8"
                            fillOpacity="0.15"
                            className="animate-ping"
                            style={{ animationDuration: '3s' }}
                          />
                          <circle
                            cx={hub.xPercent}
                            cy={hub.yPercent}
                            r="2.8"
                            fill="#0F172A"
                            stroke="#38BDF8"
                            strokeWidth="0.6"
                          />
                        </>
                      )}
                      <circle
                        cx={hub.xPercent}
                        cy={hub.yPercent}
                        r="2.0"
                        fill={isSelected ? '#38BDF8' : '#1E293B'}
                        stroke={isSelected ? '#FFFFFF' : '#64748B'}
                        strokeWidth="0.4"
                      />
                      <text
                        x={hub.xPercent}
                        y={hub.yPercent - 3}
                        fill={isSelected ? '#38BDF8' : '#94A3B8'}
                        fontSize="2.4"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        🏁 {hub.city} Hub
                      </text>
                    </g>
                  );
                })}

                {/* Active Pickup Farm Markers (Sequenced with Stop numbers) */}
                {routeWaypoints.map((farm, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <g
                      key={farm.id}
                      onClick={() => setActiveNodeDetails(farm)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse Ring */}
                      <circle
                        cx={farm.xPercent}
                        cy={farm.yPercent}
                        r="3.5"
                        fill="#C2D66E"
                        fillOpacity="0.18"
                        className="animate-pulse"
                      />
                      {/* Node Circle */}
                      <circle
                        cx={farm.xPercent}
                        cy={farm.yPercent}
                        r="2.2"
                        fill="#0F1411"
                        stroke="#C2D66E"
                        strokeWidth="0.7"
                      />
                      {/* Stop Sequence Number */}
                      <text
                        x={farm.xPercent}
                        y={farm.yPercent + 0.8}
                        fill="#C2D66E"
                        fontSize="2.2"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {idx + 1}
                      </text>
                      {/* Label */}
                      <text
                        x={farm.xPercent}
                        y={farm.yPercent + 4.2}
                        fill="#FFFFFF"
                        fontSize="2.3"
                        fontWeight="bold"
                        textAnchor="middle"
                        filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.9))"
                      >
                        {farm.name.split(' ')[0]} ({farm.qtyTons}T)
                      </text>
                    </g>
                  );
                })}

                {/* Live Animated 10-Ton Reefer Truck Marker */}
                {pathPoints.length >= 2 && (
                  <g
                    transform={`translate(${currentTruckPos.x}, ${currentTruckPos.y})`}
                    className="transition-all duration-75"
                  >
                    {/* Radar Pulse Ring */}
                    <circle
                      r="4"
                      fill="#C2D66E"
                      fillOpacity="0.25"
                      className="animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                    {/* Truck Background Badge */}
                    <circle r="2.8" fill="#1A221E" stroke="#C2D66E" strokeWidth="0.8" />
                    {/* Tiny Truck Icon Indicator */}
                    <text
                      y="1"
                      fontSize="3.2"
                      textAnchor="middle"
                      fill="#C2D66E"
                    >
                      🚛
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* On-Map Floating Live Telemetry Badge (During Simulation or Active Route) */}
            <div className="absolute top-3 right-14 z-10 bg-[#1A221E]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#2C3631] shadow-xl flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C2D66E] animate-ping"></span>
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#8E9B94] block">Reefer Telemetry</span>
                  <span className="font-mono font-bold text-white text-xs">
                    {simCurrentTemp}°C Sealed
                  </span>
                </div>
              </div>

              <div className="h-6 w-px bg-[#2C3631]"></div>

              <div>
                <span className="text-[9px] uppercase font-bold text-[#8E9B94] block">GPS Speed</span>
                <span className="font-mono font-bold text-[#D4E4BC] text-xs">
                  {simSpeedKmh} km/h
                </span>
              </div>
            </div>
          </div>

          {/* Live Transit Simulator Control Dock */}
          <div className="p-4 bg-[#141B17] border border-[#2C3631] rounded-2xl space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    isSimulating
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                      : 'bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] shadow-md active:scale-95'
                  }`}
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isSimulating ? 'Pause Drive' : 'Simulate Transit Drive'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSimulating(false);
                    setSimProgress(0);
                    setSimCurrentKm(0);
                  }}
                  className="p-2 rounded-full bg-[#242C28] hover:bg-[#2C3631] text-[#8E9B94] hover:text-white transition-colors cursor-pointer"
                  title="Reset to Start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 bg-[#0F1411] p-1 rounded-full border border-[#2C3631] text-xs">
                  <span className="text-[10px] text-[#8E9B94] px-1 font-bold">Speed:</span>
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSimSpeed(spd as 1 | 2 | 4)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        simSpeed === spd
                          ? 'bg-[#C2D66E] text-[#0F1411]'
                          : 'text-[#8E9B94] hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar Info */}
              <div className="text-right text-xs">
                <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block">
                  Corridor Progress:
                </span>
                <span className="font-mono font-bold text-[#C2D66E]">
                  {simCurrentKm} / {routeMetrics.totalKm} km ({Math.round(simProgress)}%)
                </span>
              </div>
            </div>

            {/* Slider / Progress Line */}
            <div className="space-y-1">
              <div className="w-full bg-[#0F1411] h-2.5 rounded-full overflow-hidden border border-[#2C3631] relative">
                <div
                  className="bg-gradient-to-r from-[#C2D66E] via-[#8BE398] to-[#38BDF8] h-full rounded-full transition-all duration-150"
                  style={{ width: `${simProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#8E9B94] font-mono">
                <span>Start: Stop 1 Gate</span>
                <span>Khopoli Ghat Toll</span>
                <span>Final: {activeHub.city} Hub</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Telemetry, Waypoints & Cost Breakdown (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Real-time KPI Card */}
          <div className="p-4 bg-[#141B17] border border-[#2C3631] rounded-3xl space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2C3631] pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#C2D66E]" />
                <span>Optimized Path Telemetry</span>
              </span>
              <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Save {routeMetrics.savingsPercent}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#1A221E] border border-[#2C3631] rounded-2xl">
                <span className="text-[10px] text-[#8E9B94] uppercase block font-semibold">Total Distance</span>
                <span className="text-lg font-serif font-bold text-white font-mono">{routeMetrics.totalKm} km</span>
              </div>

              <div className="p-3 bg-[#1A221E] border border-[#2C3631] rounded-2xl">
                <span className="text-[10px] text-[#8E9B94] uppercase block font-semibold">Estimated Transit</span>
                <span className="text-lg font-serif font-bold text-[#D4E4BC] font-mono">{routeMetrics.transitHours} hrs</span>
              </div>

              <div className="p-3 bg-[#1A221E] border border-[#2C3631] rounded-2xl">
                <span className="text-[10px] text-[#8E9B94] uppercase block font-semibold">Consolidated Load</span>
                <span className="text-lg font-serif font-bold text-[#C2D66E] font-mono">{routeMetrics.totalTons} MT</span>
              </div>

              <div className="p-3 bg-[#1A221E] border border-[#2C3631] rounded-2xl">
                <span className="text-[10px] text-[#8E9B94] uppercase block font-semibold">CO2 Saved</span>
                <span className="text-lg font-serif font-bold text-[#38BDF8] font-mono">{routeMetrics.co2SavedKg} kg</span>
              </div>
            </div>

            {/* Cost Comparison */}
            <div className="p-3.5 bg-[#1F2923] border border-[#C2D66E]/40 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8E9B94] font-medium">Individual Separate Trucks:</span>
                <span className="line-through text-[#8E9B94] font-mono font-semibold">
                  ₹{routeMetrics.costSeparate.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-[#D4E4BC]">Consolidated 10T Reefer:</span>
                <span className="text-[#C2D66E] font-mono text-base">
                  ₹{routeMetrics.costPooled.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-[#D4E4BC]/80 pt-1 border-t border-[#2C3631]/60">
                ⚡ Saves ~₹{(routeMetrics.costSeparate - routeMetrics.costPooled).toLocaleString('en-IN')} in total diesel & toll expenses.
              </p>
            </div>
          </div>

          {/* Turn-by-Turn Waypoint Sequence */}
          <div className="p-4 bg-[#141B17] border border-[#2C3631] rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic font-bold text-sm text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C2D66E]" />
                <span>Optimized Milk-Run Waypoints ({routeWaypoints.length + 1})</span>
              </h3>
              <span className="text-[10px] text-[#8E9B94]">Click to inspect node</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {routeWaypoints.map((farm, idx) => (
                <div
                  key={farm.id}
                  onClick={() => setActiveNodeDetails(farm)}
                  className="p-3 bg-[#1A221E] hover:bg-[#242C28] border border-[#2C3631] rounded-2xl transition-all cursor-pointer text-xs space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#C2D66E] text-[#0F1411] font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white group-hover:text-[#C2D66E] line-clamp-1">
                        {farm.name}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[#C2D66E] font-bold shrink-0">
                      {farm.qtyTons} MT
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#8E9B94] pl-7">
                    <span>{farm.crop.split('(')[0]}</span>
                    <span className="text-[#D4E4BC] font-mono">{farm.pickupWindow.split('-')[0]}</span>
                  </div>
                </div>
              ))}

              {/* Delivery Hub Dropoff */}
              <div
                onClick={() => setActiveNodeDetails(activeHub)}
                className="p-3 bg-[#13222E] hover:bg-[#1E303E] border border-[#38BDF8]/50 rounded-2xl transition-all cursor-pointer text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#38BDF8] text-[#0F172A] font-bold flex items-center justify-center text-[10px] shrink-0">
                      🏁
                    </span>
                    <span className="font-bold text-white line-clamp-1">
                      {activeHub.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-[#38BDF8]/20 text-[#38BDF8] px-2 py-0.5 rounded font-bold">
                    Drop-off
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#8E9B94] pl-7">
                  <span>{activeHub.city}, {activeHub.state}</span>
                  <span className="text-[#38BDF8] font-mono">{activeHub.receivingWindow.split('-')[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Node Details Inspection Modal / Bottom Sheet */}
      {activeNodeDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C3631] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/10 border border-[#C2D66E]/30 flex items-center justify-center text-[#C2D66E]">
                  {'farmer' in activeNodeDetails ? <Sprout className="w-5 h-5" /> : <Building2 className="w-5 h-5 text-[#38BDF8]" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2D66E]">
                    {'farmer' in activeNodeDetails ? 'Verified Farm Gate Node' : 'Central Mandi / Logistics Terminal'}
                  </span>
                  <h3 className="font-serif italic font-bold text-lg text-white">
                    {activeNodeDetails.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveNodeDetails(null)}
                className="w-8 h-8 rounded-full bg-[#242C28] text-[#8E9B94] hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Node GIS Data Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#242C28] rounded-2xl border border-[#2C3631] space-y-0.5">
                <span className="text-[10px] text-[#8E9B94] uppercase block">Mock Coordinates</span>
                <span className="font-mono font-bold text-[#C2D66E] flex items-center justify-between">
                  <span>{activeNodeDetails.lat}° N, {activeNodeDetails.lng}° E</span>
                  <button
                    type="button"
                    onClick={() => copyCoordinates(`${activeNodeDetails.lat}, ${activeNodeDetails.lng}`)}
                    className="p-1 hover:text-white text-[#8E9B94] transition-colors"
                    title="Copy Lat/Lng"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-[#C2D66E]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </span>
              </div>

              <div className="p-3 bg-[#242C28] rounded-2xl border border-[#2C3631] space-y-0.5">
                <span className="text-[10px] text-[#8E9B94] uppercase block">Location Region</span>
                <span className="font-bold text-white">
                  {'region' in activeNodeDetails ? activeNodeDetails.region : `${activeNodeDetails.city}, ${activeNodeDetails.state}`}
                </span>
              </div>

              {'farmer' in activeNodeDetails ? (
                <>
                  <div className="p-3 bg-[#242C28] rounded-2xl border border-[#2C3631] space-y-0.5">
                    <span className="text-[10px] text-[#8E9B94] uppercase block">Harvest Crop & Qty</span>
                    <span className="font-bold text-white">{activeNodeDetails.crop} ({activeNodeDetails.qtyTons} MT)</span>
                  </div>
                  <div className="p-3 bg-[#242C28] rounded-2xl border border-[#2C3631] space-y-0.5">
                    <span className="text-[10px] text-[#8E9B94] uppercase block">Gate Elevation</span>
                    <span className="font-mono font-bold text-[#D4E4BC]">{activeNodeDetails.elevationMeters}m MSL</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-[#242C28] rounded-2xl border border-[#2C3631] space-y-0.5">
                    <span className="text-[10px] text-[#8E9B94] uppercase block">Hub Capacity</span>
                    <span className="font-mono font-bold text-[#38BDF8]">{activeNodeDetails.capacityTons} MT Daily</span>
                  </div>
                  <div className="p-3 bg-[#242C28] rounded-2xl border border-[#2C3631] space-y-0.5">
                    <span className="text-[10px] text-[#8E9B94] uppercase block">Cold Chain Gate</span>
                    <span className="font-bold text-[#C2D66E]">{activeNodeDetails.coldStorageAvailable ? 'Active 24/7' : 'Standard'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#2C3631]">
              {'farmer' in activeNodeDetails ? (
                <button
                  type="button"
                  onClick={() => {
                    handleToggleFarm(activeNodeDetails.id);
                    setActiveNodeDetails(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeNodeDetails.isIncluded
                      ? 'bg-red-600/80 hover:bg-red-500 text-white'
                      : 'bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411]'
                  }`}
                >
                  {activeNodeDetails.isIncluded ? 'Remove from Milk-Run' : 'Add to Optimal Route'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDestinationHubId(activeNodeDetails.id);
                    setActiveNodeDetails(null);
                  }}
                  className="px-4 py-2 rounded-full bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0F172A] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Set as Target Delivery Hub
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveNodeDetails(null)}
                className="px-5 py-2 rounded-full bg-[#242C28] hover:bg-[#2C3631] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
