export type LanguageCode =
  | 'en'
  | 'mr'
  | 'hi'
  | 'gu'
  | 'te'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'bn'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur';

export type UserRole = 'farmer' | 'fpo' | 'bulk_buyer' | 'retail_consumer';

export type AuthRole = 'farmer' | 'mart';

export type AuthProvider = 'google' | 'phone' | 'demo';

export interface UserProfile {
  id: string;
  name: string;
  role: AuthRole;
  phone: string;
  email?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  registrationAllowed?: boolean;
  memberSince?: string;
  authProvider?: AuthProvider;
  googleAccountName?: string;
  googleEmail?: string;
  securityPin?: string;
  
  // Farmer specific details
  farmName?: string;
  villageOrDistrict?: string;
  state?: string;
  pinCode?: string;
  landSizeAcres?: number;
  primaryCrops?: string[];
  kisanId?: string;
  organicCertified?: boolean;
  soilType?: string;
  irrigationType?: string;
  bankUpiOrAccount?: string;
  whatsappNumber?: string;
  bioOrNotes?: string;

  // Mart / Supermarket / Buyer specific details
  martName?: string;
  martType?: 'Supermarket Mart' | 'Retail Chain Mart' | 'Wholesale Cash & Carry' | 'Hypermarket' | 'Agri-Export Mart';
  city?: string;
  gstinOrLicense?: string;
  procurementCapacityTonsPerMonth?: number;
  contactPerson?: string;
  activeEscrowBalanceINR?: number;
}

export type CropCategory = 'all' | 'exotic' | 'fruits' | 'vegetables' | 'grains' | 'spices' | 'organic';

export interface ProduceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerType: 'Farmer' | 'FPO Cooperative' | 'Organic Cluster';
  location: string;
  state: string;
  district: string;
  cropName: string;
  cropCategory: CropCategory;
  variety: string;
  availableQtyTons: number;
  minOrderQtyKg: number;
  expectedPricePerKg: number;
  currentMandiPricePerKg: number;
  qualityGrade: 'Export Grade A+' | 'Grade A' | 'Grade B' | 'Organic Certified';
  harvestDate: string;
  shelfLifeDays: number;
  imageUrl: string;
  isOrganic: boolean;
  fpoVerified: boolean;
  isSold?: boolean;
  status?: 'active' | 'sold';
  isMarkedByBuyer?: boolean;
  markedByBuyersCount?: number;
  activeBidsCount: number;
  highestBidPerKg?: number;
  description: string;
  batchQrCode?: string;
  labReportScore?: number;
  coordinates: { lat: number; lng: number };
}

export interface BulkBuyerProfile {
  id: string;
  companyName: string;
  type: 'Supermarket Chain' | 'Exporter' | 'Food Processing' | 'HoReCa Buyer' | 'Mandi Commission Agent' | 'FPO Aggregator' | 'Agri-Tech Startup';
  logo: string;
  verifiedBuyerBadge: boolean;
  requiredCrop: string;
  cropCategory?: CropCategory;
  neededQtyTons: number;
  offeredPricePerKg: number;
  deliveryLocation: string;
  paymentTerms: '100% Escrow on Dispatch' | 'Instant QR on Weighment' | '3 Days T+1' | 'Letter of Credit (LC)';
  contactPerson?: string;
  contactPhone?: string;
  urgency?: 'Immediate' | 'This Week' | 'Next 15 Days' | 'Harvest Season Contract';
  status?: 'active' | 'fulfilled';
  markedYieldIds?: string[];
  createdAt?: string;
}

export interface FreightShipment {
  id: string;
  truckId: string;
  driverName: string;
  driverPhone: string;
  truckType: '10-Ton Reefer Cold Chain' | '5-Ton Ventilated' | 'Tata Ace Mini 1.5-Ton';
  temperatureRange: string;
  currentTempCelsius: number;
  originHub: string;
  destinationMandi: string;
  status: 'Loading at Farms' | 'In Transit on Highway' | 'Reached Buyer Hub' | 'Completed';
  currentLocationName: string;
  eta: string;
  capacityUtilizationPercent: number;
  participatingFarmersCount: number;
  costSavedPercent: number;
  routeStops: {
    stopNumber: number;
    farmName: string;
    location: string;
    action: string;
    completed: boolean;
    scheduledTime: string;
  }[];
}

export interface ModernCropTutorial {
  id: string;
  cropName: string;
  marathiName: string;
  hindiName: string;
  tagline: string;
  badge: string;
  investmentPerAcre: string;
  annualIncomePotential: string;
  roiDurationYears: string;
  gestationMonths: number;
  waterRequirement: 'Low / Drought Tolerant' | 'Moderate Drip' | 'High Controlled';
  soilType: string;
  bannerImage: string;
  overview: string;
  whySwitchToThisCrop: string[];
  subsidyInfo: {
    schemeName: string;
    percent: string;
    maxAmount: string;
    govtPortal: string;
  };
  stages: {
    stageNumber: number;
    title: string;
    duration: string;
    instructions: string[];
    proTip: string;
    equipmentNeeded: string;
  }[];
  economics: {
    year: number;
    expensesINR: number;
    yieldTons: number;
    grossIncomeINR: number;
    netProfitINR: number;
  }[];
}

export interface ForecastResult {
  crop: string;
  currentMandiPrice: number;
  unit: string;
  projectedPriceRange: {
    min: number;
    max: number;
    average: number;
  };
  demandScore: number;
  trend: 'UPWARD' | 'STABLE' | 'DOWNWARD';
  confidenceScore: number;
  optimalHarvestWindow: string;
  keyDemandDrivers: string[];
  historicalComparison?: {
    lastYearSameMonthAvgPrice: number;
    fiveYearPriceTrend: string;
    historicalSupplyArrivalTons: string;
    seasonalPriceCycle: string;
  };
  weatherImpact?: {
    forecastSummary: string;
    rainfallAndHumidityRisk: 'Favorable Clear' | 'Moderate Rain Risk' | 'Heatwave Stress' | 'High Humidity Warning';
    temperatureOutlook: string;
    harvestAdvisoryBasedOnWeather: string;
  };
  marketTrends?: {
    metroRetailSurgePercent: string;
    exportOrderVolume: string;
    foodProcessingDemand: string;
    mandiArrivalShortfallPercent: string;
  };
  priceForecastWeekly: {
    week: string;
    price: number;
    demandLevel: string;
  }[];
  buyerSegmentsInDemand: {
    segment: string;
    willingnessToPay: string;
    qtyNeededTons: number;
  }[];
  farmerAdvisorySummary: string;
  voiceSpokenScript: string;
}

export interface RouteOptimizationResult {
  totalDistanceKm: number;
  estimatedTransitTimeHours: number;
  traditionalCostSeparateTrucksINR: number;
  optimizedPooledCostINR: number;
  farmerCostSavingsPercent: number;
  co2ReductionKg: number;
  coldChainIntegrityScore: string;
  trafficDetails?: {
    peakCongestionAvoidedHours: number;
    congestionRiskLevel: 'Low (Early Dispatch)' | 'Moderate' | 'Heavy Toll Traffic Diverted';
    expresswayCorridorRecommendation: string;
    estimatedFuelSavedLiters: number;
  };
  deliveryWindowDetails?: {
    deliveryWindowStart: string;
    deliveryWindowEnd: string;
    projectedHubArrival: string;
    onTimeProbability: string;
    shelfLifePreservedDays: number;
  };
  pickupSequence: {
    step: number;
    location: string;
    action: string;
    departureTime: string;
    eta: string;
    tempRequirement: string;
    distanceFromPrevKm?: number;
    trafficStatus?: 'Clear Green' | 'Moderate' | 'Heavy';
  }[];
  aiOptimizationNotes: string[];
  driverInstructionsInLanguage: string;
}

export interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  spokenAudioText?: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'MARKETPLACE' | 'LOGISTICS' | 'TUTORIAL' | 'FORECAST';
    target: string;
  }[];
  shipmentsData?: FreightShipment[];
}

export type PaymentMethodType =
  | 'upi_qr'
  | 'bank_escrow'
  | 'letter_of_credit'
  | 'rtgs_neft'
  | 'buyer_credit_line'
  | 'apmc_cash_voucher';

export interface PaymentDetails {
  method: PaymentMethodType;
  methodLabel: string;
  transactionRefId: string;
  utrNumber?: string;
  paidAmountINR: number;
  paymentTimestamp: string;
  paymentStatus: 'Escrow Secured' | 'Instant Settled' | 'LC Verified by Bank' | 'Pending Gate Weighment' | 'Processing Wire' | 'Released to Farmer';
  escrowBankName?: string;
  upiIdUsed?: string;
  lcNumber?: string;
  lcTenureDays?: number;
  virtualAccountNumber?: string;
  buyerGstNumber?: string;
  invoiceNumber?: string;
  advancePaidPercent?: number;
  settlementNote?: string;
}

export interface OrderContract {
  id: string;
  cropName: string;
  quantityTons: number;
  agreedPricePerKg: number;
  totalValueINR: number;
  buyerName: string;
  buyerType: string;
  farmerOrFpoName: string;
  orderDate: string;
  dispatchDeadline: string;
  status: 'Contract Created' | 'Escrow Funded' | 'Dispatched' | 'Delivered & Paid';
  logisticsPartner: string;
  escrowStatus: string;
  inspectionScore: string;
  paymentDetails?: PaymentDetails;
  deliveryLocation?: string;
  sellerBankUpi?: string;
}

export type WeatherSeverity = 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'FAVORABLE';

export type WeatherConditionType =
  | 'HEAVY_RAIN'
  | 'HEATWAVE'
  | 'HAILSTORM'
  | 'HIGH_HUMIDITY'
  | 'FOG_MIST'
  | 'CYCLONIC_WINDS'
  | 'CLEAR_FAVORABLE';

export interface WeatherAlert {
  id: string;
  location: string;
  district: string;
  state: string;
  coordinates: { lat: number; lng: number };
  registeredCrops: string[];
  condition: WeatherConditionType;
  severity: WeatherSeverity;
  temperatureCelsius: number;
  humidityPercent: number;
  rainfallMm?: number;
  windSpeedKmh?: number;
  forecastTitle: string;
  forecastTitleLocalized?: {
    mr: string;
    hi: string;
    en: string;
    gu?: string;
    te?: string;
  };
  detailedAdvisory: string;
  detailedAdvisoryLocalized?: {
    mr: string;
    hi: string;
    en: string;
    gu?: string;
    te?: string;
  };
  logisticsImpact: {
    corridorName: string; // e.g., 'Pune-Mumbai Expressway / Khopoli Ghat'
    transitDelayMinutes: number;
    delayRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
    recommendedReeferTempCelsius: number;
    preCoolingRequired: boolean;
    cargoTarpingRequired: boolean;
    recommendedDispatchWindow: string;
    driverActionInstruction: string;
    driverActionLocalized?: {
      mr: string;
      hi: string;
      en: string;
    };
  };
  issuedAt: string;
  validUntil: string;
  isDismissed?: boolean;
}

export type SoilType =
  | 'black_cotton'
  | 'red_loamy'
  | 'sandy_loam'
  | 'alluvial'
  | 'laterite'
  | 'clayey';

export type SeasonType = 'kharif' | 'rabi' | 'zaid' | 'perennial';

export type IrrigationType =
  | 'drip'
  | 'sprinkler'
  | 'canal_flood'
  | 'borewell_well'
  | 'rainfed';

export interface SoilHealthInput {
  soilType: SoilType;
  phLevel: number;
  nitrogen: 'low' | 'medium' | 'high' | 'optimal';
  phosphorus: 'low' | 'medium' | 'high' | 'optimal';
  potassium: 'low' | 'medium' | 'high' | 'optimal';
  organicCarbonPercent: number;
  electricalConductivityDsm: number;
  irrigation: IrrigationType;
  landSizeAcres: number;
  budgetPerAcreINR: number;
  state: string;
  district: string;
  season: SeasonType;
  expectedRainfall: 'Normal' | 'Deficit / Drought Risk' | 'High / Excess' | 'Delayed Monsoon';
}

export interface CropRecommendationItem {
  id: string;
  cropName: string;
  localName: string;
  variety: string;
  category: 'exotic' | 'fruits' | 'vegetables' | 'grains' | 'spices' | 'cash_crop';
  suitabilityScore: number;
  rank: number;
  projectedProfitPerAcreINR: number;
  projectedRevenuePerAcreINR: number;
  inputCostPerAcreINR: number;
  roiPercent: number;
  expectedYieldTonsPerAcre: number;
  expectedPricePerKg: {
    min: number;
    max: number;
    avg: number;
  };
  harvestDurationDays: number;
  waterRequirement: 'Low / Drought Tolerant' | 'Moderate Drip' | 'High Controlled';
  riskRating: 'Low' | 'Medium' | 'High';
  marketDemandTrend: 'Surging' | 'High' | 'Stable';
  keyMarketOfftakers: string[];
  soilCompatibilityRationale: string;
  weatherResilienceRationale: string;
  marketDemandRationale: string;
  soilNutrientPrescription: {
    fertilizerDosage: string;
    organicAmendments: string;
    phCorrectionTip?: string;
  };
  seasonalRoadmap: {
    stage: string;
    timeframe: string;
    keyAction: string;
  }[];
  matchedBuyerDemandsCount: number;
  availableGovtSubsidy: string;
  imageUrl?: string;
}

export interface CropRecommendationResponse {
  regionSummary: string;
  seasonalClimateOutlook: string;
  overallSoilHealthAnalysis: {
    healthIndexScore: number;
    primaryLimitingFactor: string;
    organicMatterStatus: string;
    npkBalanceStatus: string;
  };
  topRecommendations: CropRecommendationItem[];
  expertAdvisorSummary: string;
  spokenAudioScript: string;
}

export type StockAlertType = 'CRITICAL_EXPIRY' | 'APPROACHING_EXPIRY' | 'PEAK_DEMAND_WINDOW' | 'OPTIMAL_HARVEST_DISPATCH';
export type StockAlertSeverity = 'critical' | 'warning' | 'opportunity' | 'info';

export interface StockAlertAction {
  id: string;
  label: Record<LanguageCode, string>;
  actionType: 'DISCOUNT_10' | 'DISCOUNT_15' | 'MATCH_BUYER' | 'BOOK_LOGISTICS' | 'MARK_SOLD' | 'VIEW_LISTING';
  badge?: string;
}

export interface StockAlert {
  id: string;
  listingId: string;
  cropName: string;
  variety?: string;
  sellerId?: string;
  sellerName?: string;
  location?: string;
  availableQtyTons: number;
  expectedPricePerKg: number;
  currentMandiPricePerKg: number;
  peakDemandPriceEstimate?: number;
  harvestDate: string;
  shelfLifeDays: number;
  daysRemaining: number;
  hoursRemaining?: number;
  shelfLifePercentRemaining: number;
  type: StockAlertType;
  severity: StockAlertSeverity;
  title: Record<LanguageCode, string>;
  message: Record<LanguageCode, string>;
  recommendation: Record<LanguageCode, string>;
  suggestedActions: StockAlertAction[];
  matchedBuyerDemandCount?: number;
  bestBuyerMatch?: {
    id: string;
    companyName: string;
    offeredPricePerKg: number;
    neededQtyTons: number;
    deliveryLocation: string;
  };
  isRead?: boolean;
  isDismissed?: boolean;
  appliedDiscountPercent?: number;
  createdAt: string;
}


