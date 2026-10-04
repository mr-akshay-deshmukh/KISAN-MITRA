import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  Award,
  Zap,
  Droplets,
  DollarSign,
  Calendar,
  Scale,
  ArrowUpRight,
  Info,
  SlidersHorizontal,
  ExternalLink,
  Landmark,
  CheckCircle2,
  FileCheck,
  Search,
  Percent,
} from 'lucide-react';
import { CropRecommendationItem, LanguageCode } from '../types';

interface CropYieldAnalyticsSectionProps {
  crops: CropRecommendationItem[];
  currentLanguage: LanguageCode;
  initialLandSizeAcres?: number;
  onSelectCrop?: (cropId: string) => void;
  selectedCropId?: string | null;
}

type ChartViewType = 'yield_profit' | 'cost_revenue' | 'cycle_efficiency' | 'govt_subsidies';

export interface GovtSubsidyScheme {
  id: string;
  name: string;
  localName: string;
  category: 'Horticulture & Orchards' | 'Irrigation & Solar' | 'Farm Mechanization' | 'Post-Harvest & Cold Chain' | 'Insurance & Organic';
  subsidyPercent: string;
  maxGrantINR: string;
  directPortalUrl: string;
  portalName: string;
  statusBadge: string;
  description: string;
  applicableCrops: string[];
  eligibility: string[];
  docsRequired: string[];
}

export const GOVT_SUBSIDY_SCHEMES: GovtSubsidyScheme[] = [
  {
    id: 'mahadbt_sheti',
    name: 'MahaDBT Farmer Welfare & Horticulture Scheme',
    localName: 'महाराष्ट्र महाडीबीटी शेती योजना (भाऊसाहेब फुंडकर फळबाग व ठिबक)',
    category: 'Horticulture & Orchards',
    subsidyPercent: '50% - 80% Direct Benefit',
    maxGrantINR: '₹1,60,000 / Acre + 50% Pond Grant',
    directPortalUrl: 'https://mahadbt.maharashtra.gov.in/farmer/login/login',
    portalName: 'mahadbt.maharashtra.gov.in',
    statusBadge: '🟢 Portal Live • 2026-27 DBT Applications Open',
    description: 'Comprehensive state subsidy for drip irrigation, sprinkler sets, fruit orchard tree planting (Bhausaheb Fundkar), polyhouse, and farm pond liners.',
    applicableCrops: ['Dragon Fruit', 'Grapes', 'Pomegranate', 'Walnut', 'Avocado', 'Exotic Vegetables'],
    eligibility: ['Maharashtra Registered Land Holder (7/12 & 8-A)', 'Aadhaar Linked Bank Account (NPCI Active)', 'Small & Marginal Farmer Bonus Available'],
    docsRequired: ['7/12 & 8-A Record Extract', 'Aadhaar Card copy', 'Bank Passbook copy', 'Micro-Irrigation Quotation Invoice'],
  },
  {
    id: 'midh_horticulture',
    name: 'Mission for Integrated Development of Horticulture (MIDH)',
    localName: 'राष्ट्रीय फलोत्पादन अभियान (MIDH / NHM अनुदान)',
    category: 'Horticulture & Orchards',
    subsidyPercent: '40% - 50% Capital Grant',
    maxGrantINR: '₹1,60,000 / Acre (Exotics) & ₹33.5L Cold Storage',
    directPortalUrl: 'https://midh.gov.in/',
    portalName: 'midh.gov.in',
    statusBadge: '🟢 Central Ministry Window Active',
    description: 'Central government capital subsidy for high-density perennial fruit orchards (Dragon Fruit trellis, Grafted Walnut, Avocado), post-harvest pack houses, and on-farm cold rooms.',
    applicableCrops: ['Kamalam (Dragon Fruit)', 'Grafted Walnut', 'Avocado', 'High-Density Grapes', 'Exotic Orchards'],
    eligibility: ['Minimum 0.5 Acre farm parcel', 'Adherence to certified planting material standards', 'Direct bank disbursement post-inspection'],
    docsRequired: ['GPS Field Tagged Coordinates', 'Nursery Plant Purchase Receipt', 'Soil & Water Testing Report', '7/12 Record'],
  },
  {
    id: 'pm_kusum_solar',
    name: 'PM-KUSUM Solar Agricultural Pump Scheme',
    localName: 'पीएम-कुसुम सौर कृषी पंप योजना (९०% शासकीय अनुदान)',
    category: 'Irrigation & Solar',
    subsidyPercent: '90% Total Subsidy (60% Central + 30% State)',
    maxGrantINR: '₹2,50,000 - ₹3,80,000 per Solar Pump',
    directPortalUrl: 'https://pmkusum.mnre.gov.in/',
    portalName: 'pmkusum.mnre.gov.in (MNRE & MSEDCL)',
    statusBadge: '🟢 Online Lotter & Registration Live',
    description: 'Provides 3 HP, 5 HP, and 7.5 HP off-grid DC solar submersible pumps for daytime irrigation with zero electricity bill charges. Farmer pays only 10% share.',
    applicableCrops: ['All Irrigated Crops', 'Horticulture', 'Sugarcane', 'Cotton', 'Cash Crops'],
    eligibility: ['Farmers with existing open well / borewell with water source', 'No existing grid power connection on the surveyed plot', '10% farmer share payment deposit'],
    docsRequired: ['7/12 Showing Well/Borewell Entry', 'No Objection Certificate (if shared well)', 'Aadhaar & Caste Certificate (if SC/ST 95% subsidy)'],
  },
  {
    id: 'pmksy_drip',
    name: 'PMKSY - Per Drop More Crop (Micro-Irrigation)',
    localName: 'प्रधानमंत्री कृषी सिंचन योजना (ठिबक व तुषार सिंचन)',
    category: 'Irrigation & Solar',
    subsidyPercent: '55% (Small Farmers) / 45% (Others)',
    maxGrantINR: 'Up to ₹55,000 / Hectare Drip Assistance',
    directPortalUrl: 'https://pmksy.gov.in/',
    portalName: 'pmksy.gov.in',
    statusBadge: '🟢 Direct DBT Benefit Active',
    description: 'Direct financial assistance for automated inline drip irrigation, button drippers, fertigation venturi injectors, and sand filters to save 60% water.',
    applicableCrops: ['Dragon Fruit', 'Sonaka Grapes', 'Pomegranate', 'Orchards & Vegetables'],
    eligibility: ['Valid water source and electricity or solar pump', 'BIS certified drip hardware installation through registered vendor'],
    docsRequired: ['7/12 Extract', 'Vendor Pre-Sanction Inspection Form', 'Bank Statement', 'Vendor Tax Invoice'],
  },
  {
    id: 'aif_nabard',
    name: 'Agriculture Infrastructure Fund (AIF)',
    localName: 'कृषी पायाभूत सुविधा निधी (AIF ३% व्याज सवलत)',
    category: 'Post-Harvest & Cold Chain',
    subsidyPercent: '3% Interest Subvention on Loans up to ₹2 Cr',
    maxGrantINR: 'Up to ₹2 Crore Credit with CGTMSE Cover',
    directPortalUrl: 'https://agriinfra.dac.gov.in/',
    portalName: 'agriinfra.dac.gov.in',
    statusBadge: '🟢 Direct Bank & NABARD Link Live',
    description: 'Financing facility for post-harvest farm gate infrastructure including primary sorting/grading units, solar cold storage, ripening chambers, and FPO aggregation centers.',
    applicableCrops: ['All Harvest Produce', 'FPO Clusters', 'Commercial Farming'],
    eligibility: ['Farmers, FPOs, Agri-entrepreneurs, and Cooperative societies', 'Project report for post-harvest or processing infrastructure'],
    docsRequired: ['Detailed Project Report (DPR)', 'Bank Loan In-principle Sanction', 'Land Ownership or Lease Agreement', 'PAN & Aadhaar'],
  },
  {
    id: 'smam_machinery',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    localName: 'कृषी यांत्रिकीकरण अभियान (ट्रॅक्टर व अवजारे अनुदान)',
    category: 'Farm Mechanization',
    subsidyPercent: '40% - 50% Subsidy on Equipment',
    maxGrantINR: 'Up to ₹1,25,000 for Tractors & Tillers',
    directPortalUrl: 'https://agrimachinery.nic.in/',
    portalName: 'agrimachinery.nic.in',
    statusBadge: '🟢 National Agri-Machinery Portal Open',
    description: 'Subsidies for power tillers, boom sprayers, rotavators, high-clearance vineyard tractors, laser levelers, and automated harvest platforms.',
    applicableCrops: ['Grapes', 'Dragon Fruit', 'Field Crops', 'Horticulture Orchards'],
    eligibility: ['Farmer holding cultivable land', 'Purchase from authorized tractor/implement manufacturers with test certificate'],
    docsRequired: ['7/12 & 8-A', 'Implement Proforma Invoice', 'Driving License (for tractor subsidy)', 'Aadhaar Card'],
  },
  {
    id: 'pmfby_crop_insurance',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    localName: 'प्रधानमंत्री पीक विमा योजना (१ रुपयात सर्वसमावेशक पीक विमा)',
    category: 'Insurance & Organic',
    subsidyPercent: '100% Premium Subsidy (Farmer pays ₹1 only)',
    maxGrantINR: 'Full Sum Insured Coverage against Climate Risk',
    directPortalUrl: 'https://pmfby.gov.in/',
    portalName: 'pmfby.gov.in',
    statusBadge: '🟢 Kharif & Rabi Crop Insurance Active',
    description: 'Comprehensive yield loss protection against hailstorms, unseasonal excess rain, drought, pest attacks, and localized post-harvest crop damage.',
    applicableCrops: ['Grapes', 'Pomegranate', 'Cotton', 'Soybean', 'Vegetables'],
    eligibility: ['All loanee and non-loanee farmers growing notified crops in notified areas', 'Application before notified seasonal cutoff date'],
    docsRequired: ['Sowing Certificate (पीक पेरा नोंद / ई-पीक पाहणी)', '7/12 Extract', 'Aadhaar Card', 'Bank Passbook'],
  },
  {
    id: 'pkvy_organic',
    name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    localName: 'परंपरागत कृषी विकास योजना (सेंद्रिय शेती अनुदान)',
    category: 'Insurance & Organic',
    subsidyPercent: '₹50,000 / Hectare Direct Financial Aid',
    maxGrantINR: '₹31,000 for Organic Inputs + ₹8,800 for Branding',
    directPortalUrl: 'https://pgsindia-ncof.gov.in/pkvy/index.aspx',
    portalName: 'pgsindia-ncof.gov.in / jaivikkheti.in',
    statusBadge: '🟢 PGS-India Organic Portal Live',
    description: 'Promotes organic farming through cluster formation and PGS certification. Provides direct funding for bio-fertilizers, vermicompost, botanical extracts, and organic packaging.',
    applicableCrops: ['Organic Dragon Fruit', 'Organic Grapes', 'Spices', 'Millets', 'Horticulture'],
    eligibility: ['Farmers forming a cluster of 20-50 farmers or individual cluster adoption', 'Commitment to 3-year organic conversion cycle'],
    docsRequired: ['Cluster Member Consent Form', 'Soil Baseline Health Card', '7/12 Land Documents'],
  },
];

export const CropYieldAnalyticsSection: React.FC<CropYieldAnalyticsSectionProps> = ({
  crops,
  currentLanguage,
  initialLandSizeAcres = 3,
  onSelectCrop,
  selectedCropId,
}) => {
  const [activeTab, setActiveTab] = useState<ChartViewType>('yield_profit');
  const [simulationAcres, setSimulationAcres] = useState<number>(initialLandSizeAcres || 3);
  const [activeCropIndex, setActiveCropIndex] = useState<number>(0);
  const [subsidyCategoryFilter, setSubsidyCategoryFilter] = useState<string>('All');
  const [subsidySearchQuery, setSubsidySearchQuery] = useState<string>('');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('mahadbt_sheti');

  // Synchronize initialLandSizeAcres if it changes
  React.useEffect(() => {
    if (initialLandSizeAcres && initialLandSizeAcres > 0) {
      setSimulationAcres(initialLandSizeAcres);
    }
  }, [initialLandSizeAcres]);

  // Selected crop computation
  const activeCrop = useMemo(() => {
    if (selectedCropId) {
      const found = crops.find((c) => c.id === selectedCropId);
      if (found) return found;
    }
    return crops[activeCropIndex] || crops[0] || null;
  }, [crops, selectedCropId, activeCropIndex]);

  // Filtered Government Subsidies
  const filteredGovtSchemes = useMemo(() => {
    return GOVT_SUBSIDY_SCHEMES.filter((scheme) => {
      const matchesCategory = subsidyCategoryFilter === 'All' || scheme.category === subsidyCategoryFilter;
      const matchesSearch =
        scheme.name.toLowerCase().includes(subsidySearchQuery.toLowerCase()) ||
        scheme.localName.toLowerCase().includes(subsidySearchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(subsidySearchQuery.toLowerCase()) ||
        scheme.applicableCrops.some((c) => c.toLowerCase().includes(subsidySearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [subsidyCategoryFilter, subsidySearchQuery]);

  const activeScheme = useMemo(() => {
    return GOVT_SUBSIDY_SCHEMES.find((s) => s.id === selectedSchemeId) || GOVT_SUBSIDY_SCHEMES[0];
  }, [selectedSchemeId]);

  // Dynamic estimated subsidy based on acres and active crop
  const estimatedSubsidyBreakdown = useMemo(() => {
    const acres = simulationAcres || 1;
    // Drip subsidy (approx 30k-45k/acre capped at 5 acres)
    const dripSubsidy = Math.round(Math.min(acres, 5) * 35000);
    // MIDH Horticulture Orchard subsidy (approx 80k-1.6L/acre)
    const orchardGrant = Math.round(Math.min(acres, 4) * 80000);
    // Solar pump one-time grant (90% covered approx 2.8L)
    const solarGrant = 280000;
    // Total estimated direct benefit
    const totalBenefitINR = dripSubsidy + orchardGrant + solarGrant;

    return {
      dripSubsidy,
      orchardGrant,
      solarGrant,
      totalBenefitINR,
      totalBenefitLakhs: (totalBenefitINR / 100000).toFixed(2),
    };
  }, [simulationAcres]);

  // Transform data for recharts
  const chartData = useMemo(() => {
    return crops.map((crop, index) => {
      const profitLakhs = parseFloat((crop.projectedProfitPerAcreINR / 100000).toFixed(2));
      const revenueLakhs = parseFloat((crop.projectedRevenuePerAcreINR / 100000).toFixed(2));
      const costLakhs = parseFloat((crop.inputCostPerAcreINR / 100000).toFixed(2));
      const profitMarginPercent = crop.projectedRevenuePerAcreINR > 0
        ? Math.round((crop.projectedProfitPerAcreINR / crop.projectedRevenuePerAcreINR) * 100)
        : 0;

      // Yield efficiency: profit per ton of yield
      const profitPerTonINR = crop.expectedYieldTonsPerAcre > 0
        ? Math.round(crop.projectedProfitPerAcreINR / crop.expectedYieldTonsPerAcre)
        : 0;

      // Short crop name for chart labels
      const shortName = crop.cropName.split(' ')[0] || crop.cropName;
      const displayName = currentLanguage === 'mr' && crop.localName
        ? crop.localName.split(' ')[0]
        : shortName;

      return {
        id: crop.id,
        index,
        fullCropName: crop.cropName,
        localName: crop.localName,
        name: displayName,
        variety: crop.variety,
        rank: crop.rank,
        yieldTons: crop.expectedYieldTonsPerAcre,
        profitLakhs,
        revenueLakhs,
        costLakhs,
        profitMarginPercent,
        roiPercent: crop.roiPercent,
        suitabilityScore: crop.suitabilityScore,
        harvestDurationDays: crop.harvestDurationDays,
        avgPricePerKg: crop.expectedPricePerKg.avg,
        profitPerTonINR,
        waterReq: crop.waterRequirement,
        category: crop.category,
      };
    });
  }, [crops, currentLanguage]);

  // Benchmarks
  const benchmarks = useMemo(() => {
    if (!crops.length) return null;

    const highestYield = [...crops].sort((a, b) => b.expectedYieldTonsPerAcre - a.expectedYieldTonsPerAcre)[0];
    const highestProfit = [...crops].sort((a, b) => b.projectedProfitPerAcreINR - a.projectedProfitPerAcreINR)[0];
    const highestRoi = [...crops].sort((a, b) => b.roiPercent - a.roiPercent)[0];
    const fastestHarvest = [...crops].sort((a, b) => a.harvestDurationDays - b.harvestDurationDays)[0];

    return {
      highestYield,
      highestProfit,
      highestRoi,
      fastestHarvest,
    };
  }, [crops]);

  if (!crops || crops.length === 0) {
    return null;
  }

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0F1411] border border-[#2C3631] p-3.5 rounded-2xl shadow-2xl text-xs space-y-2 min-w-[200px] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-[#2C3631] pb-1.5">
            <span className="font-bold text-[#E5E9E7] text-sm">
              {data.localName || data.fullCropName}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/30">
              #{data.rank} Rank
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between items-center text-[#8E9B94]">
              <span>{currentLanguage === 'mr' ? 'अपेक्षित उत्पादन:' : 'Expected Yield:'}</span>
              <span className="font-bold text-[#22C55E]">{data.yieldTons} Tons/Acre</span>
            </div>

            <div className="flex justify-between items-center text-[#8E9B94]">
              <span>{currentLanguage === 'mr' ? 'निव्वळ नफा (एकरी):' : 'Net Profit / Acre:'}</span>
              <span className="font-bold text-[#4ADE80]">₹{data.profitLakhs} Lakhs</span>
            </div>

            <div className="flex justify-between items-center text-[#8E9B94]">
              <span>{currentLanguage === 'mr' ? 'एकूण उत्पन्न:' : 'Gross Revenue:'}</span>
              <span className="font-bold text-[#C084FC]">₹{data.revenueLakhs} Lakhs</span>
            </div>

            <div className="flex justify-between items-center text-[#8E9B94]">
              <span>{currentLanguage === 'mr' ? 'उत्पादन खर्च:' : 'Input Cost:'}</span>
              <span className="font-bold text-[#FACC15]">₹{data.costLakhs} Lakhs</span>
            </div>

            <div className="flex justify-between items-center text-[#8E9B94] pt-1 border-t border-[#2C3631]/60">
              <span>{currentLanguage === 'mr' ? 'सरासरी बाजार भाव:' : 'Avg Mandi Price:'}</span>
              <span className="font-semibold text-[#FDE047]">₹{data.avgPricePerKg}/kg</span>
            </div>

            <div className="flex justify-between items-center text-[#8E9B94]">
              <span>{currentLanguage === 'mr' ? 'काढणी कालावधी:' : 'Harvest Cycle:'}</span>
              <span className="font-semibold text-[#C084FC]">{data.harvestDurationDays} Days</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="crop-yield-visual-analytics-section" className="bg-[#141A17] border border-[#2C3631] rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
      {/* Decorative Glows (Green & Purple subtle ambient) */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#22C55E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#A855F7]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2C3631] pb-5 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#4ADE80] text-xs font-bold tracking-wide">
              <BarChart3 className="w-3.5 h-3.5 text-[#22C55E]" />
              {currentLanguage === 'mr' ? 'रीचार्ट्स व्हिज्युअल अ‍ॅनालिटिक्स' : 'Visual Yield Intelligence'}
            </span>
            <span className="text-[11px] font-medium text-[#8E9B94] bg-[#0F1411] px-2.5 py-0.5 rounded-full border border-[#2C3631]">
              {crops.length} Recommended Cultivars
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#E5E9E7] tracking-tight flex items-center gap-2">
            {currentLanguage === 'mr'
              ? 'पीक उत्पादन व नफा विश्लेषण चार्ट (Yield Analytics)'
              : currentLanguage === 'hi'
              ? 'फसल पैदावार एवं मुनाफा विश्लेषण चार्ट (Visual Yield Analytics)'
              : 'Visual Crop Yield & Profitability Analytics'}
          </h2>

          <p className="text-xs sm:text-sm text-[#8E9B94] max-w-2xl">
            {currentLanguage === 'mr'
              ? 'मातीच्या गुणधर्मानुसार विविध पिकांचे प्रति एकर अपेक्षित उत्पादन (Tons), एकूण महसूल आणि निव्वळ नफ्याची परस्पर तुलना करा.'
              : 'Interactive visual benchmarks comparing expected harvest tonnage, production input costs, and net return margins across all recommended crops.'}
          </p>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-[#0F1411] p-1.5 rounded-2xl border border-[#2C3631] self-start lg:self-center overflow-x-auto max-w-full">
          {[
            {
              id: 'yield_profit' as ChartViewType,
              label: currentLanguage === 'mr' ? 'उत्पादन व नफा' : 'Yield & Profit',
              icon: TrendingUp,
              activeBg: 'bg-[#22C55E] text-[#0F1411]',
            },
            {
              id: 'cost_revenue' as ChartViewType,
              label: currentLanguage === 'mr' ? 'खर्च व महसूल' : 'Cost vs Revenue',
              icon: DollarSign,
              activeBg: 'bg-[#FACC15] text-[#0F1411]',
            },
            {
              id: 'cycle_efficiency' as ChartViewType,
              label: currentLanguage === 'mr' ? 'काढणी चक्र' : 'Harvest Cycle',
              icon: Calendar,
              activeBg: 'bg-[#A855F7] text-[#0F1411]',
            },
            {
              id: 'govt_subsidies' as ChartViewType,
              label: currentLanguage === 'mr' ? 'शासकीय योजना व अनुदान' : 'Govt Subsidies & Schemes',
              icon: Landmark,
              activeBg: 'bg-[#22C55E] text-[#0F1411]',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? `${tab.activeBg} shadow-md font-bold`
                    : 'text-[#8E9B94] hover:text-[#E5E9E7] hover:bg-[#1A221E]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analytics Canvas & Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left / Top: Interactive Recharts Visualization or Govt Subsidies Hub (8 cols on lg) */}
        <div className="lg:col-span-8 bg-[#0F1411] border border-[#2C3631] rounded-3xl p-4 sm:p-6 space-y-4">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#2C3631]">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#E5E9E7] flex items-center gap-2">
                {activeTab === 'yield_profit' && (
                  <>
                    <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                    <span>{currentLanguage === 'mr' ? 'अपेक्षित उत्पादन (Tons/Acre) वि. निव्वळ नफा (₹ Lakhs)' : 'Yield Output (Tons/Acre) vs Net Profit (₹ Lakhs)'}</span>
                  </>
                )}
                {activeTab === 'cost_revenue' && (
                  <>
                    <DollarSign className="w-4 h-4 text-[#FACC15]" />
                    <span>{currentLanguage === 'mr' ? 'एकरी उत्पादन खर्च वि. निव्वळ नफा विभागणी' : 'Input Cost vs Net Profit Margin Structure'}</span>
                  </>
                )}
                {activeTab === 'cycle_efficiency' && (
                  <>
                    <Calendar className="w-4 h-4 text-[#A855F7]" />
                    <span>{currentLanguage === 'mr' ? 'काढणी कालावधी (दिवस) वि. उत्पादन गती' : 'Harvest Turnaround Cycle (Days) vs Tonnage'}</span>
                  </>
                )}
                {activeTab === 'govt_subsidies' && (
                  <>
                    <Landmark className="w-4 h-4 text-[#22C55E]" />
                    <span>
                      {currentLanguage === 'mr' ? 'शासकीय कृषी योजना व थेट पोर्टल लिंक्स (Real-Time Subsidies)' : 'Live Government Subsidies & Direct Application Portals'}
                    </span>
                  </>
                )}
              </h3>
            </div>

            {/* Quick Crop Selector Pills (when on chart view) or Category Filter (when on subsidies view) */}
            {activeTab !== 'govt_subsidies' ? (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {crops.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveCropIndex(i);
                      if (onSelectCrop) onSelectCrop(c.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      (activeCrop?.id === c.id)
                        ? 'bg-[#22C55E] text-[#0F1411] font-bold'
                        : 'bg-[#1A221E] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631]'
                    }`}
                  >
                    {c.localName ? c.localName.split(' ')[0] : c.cropName.split(' ')[0]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['All', 'Horticulture & Orchards', 'Irrigation & Solar', 'Farm Mechanization', 'Post-Harvest & Cold Chain'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSubsidyCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      subsidyCategoryFilter === cat
                        ? 'bg-[#22C55E] text-[#0F1411] font-bold'
                        : 'bg-[#1A221E] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631]'
                    }`}
                  >
                    {cat === 'All' ? (currentLanguage === 'mr' ? 'सर्व योजना' : 'All Schemes') : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Canvas Body */}
          {activeTab === 'govt_subsidies' ? (
            <div className="space-y-3.5 pt-1">
              {/* Search & Status Info Bar */}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#8E9B94] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subsidySearchQuery}
                    onChange={(e) => setSubsidySearchQuery(e.target.value)}
                    placeholder={currentLanguage === 'mr' ? 'योजना, पीक किंवा अनुदान शोधा (उदा. MIDH, सोलर पंप, ठिबक)...' : 'Search schemes, subsidies, or crops (e.g., MIDH, Solar Pump, Drip)...'}
                    className="w-full bg-[#141A17] border border-[#2C3631] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E5E9E7] focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
                <span className="text-[11px] text-[#4ADE80] bg-[#22C55E]/10 border border-[#22C55E]/25 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  {filteredGovtSchemes.length} {currentLanguage === 'mr' ? 'अधिकृत पोर्टल लिंक्स उपलब्ध' : 'Verified Official Portals Active'}
                </span>
              </div>

              {/* Schemes Scrollable Cards List */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredGovtSchemes.map((scheme) => {
                  const isSelected = selectedSchemeId === scheme.id;
                  return (
                    <div
                      key={scheme.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-[#152219] border-[#22C55E]/60 ring-1 ring-[#22C55E]/30'
                          : 'bg-[#141A17] border-[#2C3631] hover:border-[#22C55E]/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30">
                              {scheme.category}
                            </span>
                            <span className="text-[10px] text-[#8E9B94] font-medium">
                              {scheme.statusBadge}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-[#E5E9E7]">
                            {currentLanguage === 'mr' ? scheme.localName : scheme.name}
                          </h4>
                          <p className="text-[11px] text-[#8E9B94] leading-relaxed">
                            {scheme.description}
                          </p>

                          {/* Key Specs Tags */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                            <span className="px-2 py-0.5 rounded-lg bg-[#0F1411] border border-[#2C3631] text-[#FACC15] font-bold flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              {scheme.subsidyPercent}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-[#0F1411] border border-[#2C3631] text-[#4ADE80] font-semibold">
                              Max: {scheme.maxGrantINR}
                            </span>
                          </div>
                        </div>

                        {/* Direct Action Link */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2C3631]">
                          <a
                            href={scheme.directPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22C55E] hover:bg-[#1ea750] text-[#0F1411] font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                          >
                            <span>{currentLanguage === 'mr' ? 'थेट पोर्टल लिंक उघडा' : 'Apply on Portal'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => setSelectedSchemeId(scheme.id)}
                            className="text-[10px] text-[#8E9B94] hover:text-[#E5E9E7] flex items-center gap-1 cursor-pointer"
                          >
                            <FileCheck className="w-3 h-3 text-[#22C55E]" />
                            <span>{isSelected ? (currentLanguage === 'mr' ? 'तपशील निवडले' : 'Selected') : (currentLanguage === 'mr' ? 'कागदपत्रे तपासा' : 'Check Docs')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Selected Scheme Docs Details Expandable Panel */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[#2C3631]/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] bg-[#0F1411] p-3 rounded-xl">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[#4ADE80] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {currentLanguage === 'mr' ? 'पात्रता निकष' : 'Eligibility Criteria'}
                            </span>
                            <ul className="space-y-0.5 text-[#8E9B94]">
                              {scheme.eligibility.map((el, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className="text-[#22C55E]">•</span>
                                  <span>{el}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[#FACC15] flex items-center gap-1">
                              <FileCheck className="w-3 h-3" />
                              {currentLanguage === 'mr' ? 'आवश्यक कागदपत्रे' : 'Required Documents'}
                            </span>
                            <ul className="space-y-0.5 text-[#8E9B94]">
                              {scheme.docsRequired.map((doc, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className="text-[#FACC15]">•</span>
                                  <span>{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full h-[320px] sm:h-[360px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'yield_profit' ? (
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload[0]) {
                        const clickedId = e.activePayload[0].payload.id;
                        const idx = crops.findIndex(c => c.id === clickedId);
                        if (idx >= 0) setActiveCropIndex(idx);
                        if (onSelectCrop) onSelectCrop(clickedId);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C3631" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#8E9B94"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#2C3631' }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#22C55E"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#2C3631' }}
                      tickFormatter={(v) => `${v}T`}
                      domain={[0, 'auto']}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#A855F7"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#2C3631' }}
                      tickFormatter={(v) => `₹${v}L`}
                      domain={[0, 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconType="circle"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="yieldTons"
                      name={currentLanguage === 'mr' ? 'उत्पादन (Tons/एकरी)' : 'Yield (Tons/Acre)'}
                      fill="#22C55E"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-yield-${index}`}
                          fill={activeCrop?.id === entry.id ? '#4ADE80' : '#22C55E'}
                        />
                      ))}
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="profitLakhs"
                      name={currentLanguage === 'mr' ? 'निव्वळ नफा (₹ Lakhs)' : 'Net Profit (₹ Lakhs)'}
                      stroke="#A855F7"
                      strokeWidth={3}
                      dot={{ fill: '#A855F7', r: 5, strokeWidth: 2, stroke: '#0F1411' }}
                      activeDot={{ r: 7, fill: '#C084FC' }}
                    />
                  </ComposedChart>
                ) : activeTab === 'cost_revenue' ? (
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload[0]) {
                        const clickedId = e.activePayload[0].payload.id;
                        const idx = crops.findIndex(c => c.id === clickedId);
                        if (idx >= 0) setActiveCropIndex(idx);
                        if (onSelectCrop) onSelectCrop(clickedId);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C3631" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#8E9B94"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#2C3631' }}
                    />
                    <YAxis
                      stroke="#8E9B94"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#2C3631' }}
                      tickFormatter={(v) => `₹${v}L`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                    <Bar
                      dataKey="costLakhs"
                      name={currentLanguage === 'mr' ? 'उत्पादन खर्च (₹ L)' : 'Input Cost (₹ L)'}
                      stackId="a"
                      fill="#FACC15"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={48}
                    />
                    <Bar
                      dataKey="profitLakhs"
                      name={currentLanguage === 'mr' ? 'निव्वळ नफा (₹ L)' : 'Net Profit (₹ L)'}
                      stackId="a"
                      fill="#22C55E"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                ) : (
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C3631" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#8E9B94"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#2C3631' }}
                    />
                    <YAxis
                      yAxisId="days"
                      orientation="left"
                      stroke="#FACC15"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#2C3631' }}
                      tickFormatter={(v) => `${v}d`}
                    />
                    <YAxis
                      yAxisId="yield"
                      orientation="right"
                      stroke="#22C55E"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#2C3631' }}
                      tickFormatter={(v) => `${v}T`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                    <Bar
                      yAxisId="days"
                      dataKey="harvestDurationDays"
                      name={currentLanguage === 'mr' ? 'काढणी चक्र (दिवस)' : 'Harvest Cycle (Days)'}
                      fill="#FACC15"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                    <Line
                      yAxisId="yield"
                      type="monotone"
                      dataKey="yieldTons"
                      name={currentLanguage === 'mr' ? 'उत्पादन (Tons)' : 'Yield Output (Tons)'}
                      stroke="#22C55E"
                      strokeWidth={3}
                      dot={{ fill: '#22C55E', r: 5, strokeWidth: 2, stroke: '#0F1411' }}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick Hint */}
          <div className="flex items-center justify-between text-[11px] text-[#8E9B94] pt-2 border-t border-[#2C3631]/60">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#22C55E]" />
              {activeTab === 'govt_subsidies'
                ? (currentLanguage === 'mr'
                  ? 'सर्व लिंक्स अधिकृत शासकीय संकेतस्थळांवर (MahaDBT, MIDH, PM-KUSUM) थेट जोडलेल्या आहेत.'
                  : 'All links connect directly to verified official government portals for instant application.')
                : (currentLanguage === 'mr'
                  ? 'कोणत्याही स्तंभावर क्लिक करून त्या पिकाचे सखोल गणित उजवीकडे तपासा.'
                  : 'Click any crop bar or pill to run live farm land acreage yield simulations.')}
            </span>
            <span className="font-medium text-[#4ADE80] hidden sm:inline">
              {activeTab === 'govt_subsidies' ? '🟢 Live DBT Portal Links' : `Active Focus: ${activeCrop?.localName || activeCrop?.cropName}`}
            </span>
          </div>
        </div>

        {/* Right / Bottom: Dynamic Acreage Yield / Subsidy Benefit Simulator (4 cols on lg) */}
        <div className="lg:col-span-4 bg-[#0F1411] border border-[#2C3631] rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C3631] pb-3">
              <div className="flex items-center gap-2">
                {activeTab === 'govt_subsidies' ? (
                  <Landmark className="w-4 h-4 text-[#22C55E]" />
                ) : (
                  <SlidersHorizontal className="w-4 h-4 text-[#22C55E]" />
                )}
                <h3 className="font-bold text-sm sm:text-base text-[#E5E9E7]">
                  {activeTab === 'govt_subsidies'
                    ? (currentLanguage === 'mr' ? 'शासकीय अनुदान कॅल्क्युलेटर' : 'Live Subsidy Benefit Calc')
                    : (currentLanguage === 'mr' ? 'एकरी उत्पादन कॅल्क्युलेटर' : 'Yield & Profit Simulator')}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30">
                Live Calc
              </span>
            </div>

            {/* Selected Crop Summary Tag */}
            {activeCrop && (
              <div className="bg-[#141A17] border border-[#2C3631] p-3 rounded-2xl flex items-center justify-between gap-2">
                <div className="truncate">
                  <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block font-semibold">
                    {currentLanguage === 'mr' ? 'निवडलेले पीक' : 'Selected Crop'}
                  </span>
                  <span className="font-serif font-bold text-[#E5E9E7] text-sm truncate block">
                    {activeCrop.localName || activeCrop.cropName}
                  </span>
                  <span className="text-[10px] text-[#8E9B94]">
                    Variety: {activeCrop.variety}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#4ADE80] font-bold block">
                    {activeCrop.suitabilityScore}% Fit
                  </span>
                  <span className="text-[10px] text-[#FACC15]">
                    ₹{activeCrop.expectedPricePerKg.avg}/kg
                  </span>
                </div>
              </div>
            )}

            {/* Interactive Farm Acreage Slider */}
            <div className="space-y-2 bg-[#141A17] p-3.5 rounded-2xl border border-[#2C3631]/60">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8E9B94] font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#22C55E]" />
                  {currentLanguage === 'mr' ? 'शेती क्षेत्र (एकर):' : 'Farm Acreage:'}
                </span>
                <span className="text-sm font-bold text-[#22C55E] bg-[#0F1411] px-2.5 py-0.5 rounded-lg border border-[#2C3631]">
                  {simulationAcres} {simulationAcres === 1 ? 'Acre' : 'Acres'}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={simulationAcres}
                onChange={(e) => setSimulationAcres(parseFloat(e.target.value) || 1)}
                className="w-full accent-[#22C55E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8E9B94]">
                <span>0.5 Ac</span>
                <span>5 Ac</span>
                <span>15 Ac</span>
                <span>25 Ac</span>
              </div>
            </div>

            {/* Computed Output Metrics */}
            {activeTab === 'govt_subsidies' ? (
              <div className="space-y-2 text-xs">
                {/* Total Direct Benefit Card */}
                <div className="bg-[#141A17] p-3.5 rounded-2xl border border-[#22C55E]/40 space-y-1 ring-1 ring-[#22C55E]/20">
                  <span className="text-[10px] text-[#4ADE80] uppercase tracking-wider block font-bold flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-[#22C55E]" />
                    {currentLanguage === 'mr' ? 'एकूण संभाव्य शासकीय अनुदान' : 'Total Direct Govt Subsidy'}
                  </span>
                  <span className="text-lg font-bold text-[#22C55E] block">
                    ₹{estimatedSubsidyBreakdown.totalBenefitLakhs} Lakhs
                  </span>
                  <span className="text-[9px] text-[#8E9B94]">
                    ({simulationAcres} Acres Combined Grants & Subsidies)
                  </span>
                </div>

                {/* Subsidies Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#141A17] p-2.5 rounded-xl border border-[#2C3631] space-y-0.5">
                    <span className="text-[9px] text-[#8E9B94] block">Drip Irrigation</span>
                    <span className="font-bold text-[#4ADE80]">₹{(estimatedSubsidyBreakdown.dripSubsidy / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="bg-[#141A17] p-2.5 rounded-xl border border-[#2C3631] space-y-0.5">
                    <span className="text-[9px] text-[#8E9B94] block">MIDH Orchard</span>
                    <span className="font-bold text-[#FACC15]">₹{(estimatedSubsidyBreakdown.orchardGrant / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="col-span-2 bg-[#141A17] p-2.5 rounded-xl border border-[#2C3631] flex items-center justify-between">
                    <span className="text-[10px] text-[#8E9B94]">PM-KUSUM Solar Pump</span>
                    <span className="font-bold text-[#C084FC]">₹2.80L (90% Paid)</span>
                  </div>
                </div>
              </div>
            ) : (
              activeCrop && (
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {/* 1. Total Harvest Tonnage */}
                  <div className="bg-[#141A17] p-3 rounded-2xl border border-[#22C55E]/40 space-y-1 ring-1 ring-[#22C55E]/20">
                    <span className="text-[10px] text-[#4ADE80] uppercase tracking-wider block font-semibold flex items-center gap-1">
                      <Scale className="w-3 h-3 text-[#22C55E]" />
                      {currentLanguage === 'mr' ? 'एकूण उत्पादन' : 'Total Harvest'}
                    </span>
                    <span className="text-base font-bold text-[#22C55E] block">
                      {(activeCrop.expectedYieldTonsPerAcre * simulationAcres).toFixed(1)} Tons
                    </span>
                    <span className="text-[9px] text-[#8E9B94]">
                      ({activeCrop.expectedYieldTonsPerAcre} T/Acre)
                    </span>
                  </div>

                  {/* 2. Total Net Profit */}
                  <div className="bg-[#141A17] p-3 rounded-2xl border border-[#22C55E]/40 space-y-1 ring-1 ring-[#22C55E]/20">
                    <span className="text-[10px] text-[#4ADE80] uppercase tracking-wider block font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#22C55E]" />
                      {currentLanguage === 'mr' ? 'निव्वळ नफा' : 'Total Net Profit'}
                    </span>
                    <span className="text-base font-bold text-[#4ADE80] block">
                      ₹{(((activeCrop.projectedProfitPerAcreINR * simulationAcres)) / 100000).toFixed(2)} Lakhs
                    </span>
                    <span className="text-[9px] text-[#8E9B94]">
                      ROI: {activeCrop.roiPercent}%
                    </span>
                  </div>

                  {/* 3. Gross Mandi Sales */}
                  <div className="bg-[#141A17] p-3 rounded-2xl border border-[#A855F7]/30 space-y-1">
                    <span className="text-[10px] text-[#C084FC] uppercase tracking-wider block font-semibold flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-[#A855F7]" />
                      {currentLanguage === 'mr' ? 'एकूण महसूल' : 'Gross Sales'}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#C084FC] block">
                      ₹{(((activeCrop.projectedRevenuePerAcreINR * simulationAcres)) / 100000).toFixed(2)} Lakhs
                    </span>
                    <span className="text-[9px] text-[#8E9B94]">
                      Mandi Realization
                    </span>
                  </div>

                  {/* 4. Total Production Expenses */}
                  <div className="bg-[#141A17] p-3 rounded-2xl border border-[#FACC15]/30 space-y-1">
                    <span className="text-[10px] text-[#FACC15] uppercase tracking-wider block font-semibold flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-[#FACC15]" />
                      {currentLanguage === 'mr' ? 'उत्पादन खर्च' : 'Input Cost'}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#FACC15] block">
                      ₹{(((activeCrop.inputCostPerAcreINR * simulationAcres)) / 100000).toFixed(2)} Lakhs
                    </span>
                    <span className="text-[9px] text-[#8E9B94]">
                      Drip, Fertilizer, Seed
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Quick Connect Action */}
          <div className="pt-2 border-t border-[#2C3631]">
            {activeTab === 'govt_subsidies' ? (
              <a
                href={activeScheme.directPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#22C55E] hover:bg-[#1ea750] text-[#0F1411] font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Landmark className="w-4 h-4" />
                <span>{currentLanguage === 'mr' ? 'MahaDBT / शासकीय पोर्टलवर जा' : 'Open Official Govt Portal Link'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              activeCrop && (
                <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 p-2.5 rounded-xl text-[11px] text-[#D4E4BC] flex items-center justify-between">
                  <span>
                    {activeCrop.matchedBuyerDemandsCount || 12} {currentLanguage === 'mr' ? 'खरेदीदार थेट तयार आहेत' : 'Buyers Ready on Platform'}
                  </span>
                  <span className="text-[#22C55E] font-bold">
                    ₹{activeCrop.expectedPricePerKg.avg}/kg
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Benchmarks & Efficiency Highlights Row */}
      {benchmarks && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 relative z-10">
          {/* 1. Highest Yield Output */}
          <div className="bg-[#0F1411] p-3.5 rounded-2xl border border-[#22C55E]/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block font-semibold">
                {currentLanguage === 'mr' ? 'सर्वोच्च उत्पादन क्षमता' : 'Peak Yield Potential'}
              </span>
              <span className="font-bold text-xs text-[#E5E9E7] truncate block">
                {benchmarks.highestYield.localName || benchmarks.highestYield.cropName}
              </span>
              <span className="text-[11px] font-bold text-[#22C55E]">
                {benchmarks.highestYield.expectedYieldTonsPerAcre} Tons/Acre
              </span>
            </div>
          </div>

          {/* 2. Highest Net Profit Realization */}
          <div className="bg-[#0F1411] p-3.5 rounded-2xl border border-[#22C55E]/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#4ADE80] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block font-semibold">
                {currentLanguage === 'mr' ? 'सर्वोच्च एकरी नफा' : 'Max Net Profit'}
              </span>
              <span className="font-bold text-xs text-[#E5E9E7] truncate block">
                {benchmarks.highestProfit.localName || benchmarks.highestProfit.cropName}
              </span>
              <span className="text-[11px] font-bold text-[#4ADE80]">
                ₹{(benchmarks.highestProfit.projectedProfitPerAcreINR / 100000).toFixed(2)} Lakhs/Acre
              </span>
            </div>
          </div>

          {/* 3. Highest Capital Return (ROI) */}
          <div className="bg-[#0F1411] p-3.5 rounded-2xl border border-[#FACC15]/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FACC15]/15 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block font-semibold">
                {currentLanguage === 'mr' ? 'सर्वोच्च भांडवली परतावा' : 'Top ROI Multiplier'}
              </span>
              <span className="font-bold text-xs text-[#E5E9E7] truncate block">
                {benchmarks.highestRoi.localName || benchmarks.highestRoi.cropName}
              </span>
              <span className="text-[11px] font-bold text-[#FACC15]">
                {benchmarks.highestRoi.roiPercent}% ROI
              </span>
            </div>
          </div>

          {/* 4. Fastest Harvest Cash-flow Turnaround */}
          <div className="bg-[#0F1411] p-3.5 rounded-2xl border border-[#A855F7]/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block font-semibold">
                {currentLanguage === 'mr' ? 'जलद काढणी चक्र' : 'Fastest Turnaround'}
              </span>
              <span className="font-bold text-xs text-[#E5E9E7] truncate block">
                {benchmarks.fastestHarvest.localName || benchmarks.fastestHarvest.cropName}
              </span>
              <span className="text-[11px] font-bold text-[#C084FC]">
                {benchmarks.fastestHarvest.harvestDurationDays} Days Cycle
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
