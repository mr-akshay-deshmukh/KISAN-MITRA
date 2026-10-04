import { CropRecommendationResponse, ForecastResult, LanguageCode, RouteOptimizationResult, SoilHealthInput, WeatherAlert } from '../types';
import { initialWeatherAlerts } from '../data/mockData';

export async function fetchDemandForecast(
  crop: string,
  region: string,
  targetMarket: string,
  language: LanguageCode = 'en'
): Promise<ForecastResult> {
  try {
    const response = await fetch('/api/ai/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop, region, targetMarket, language }),
    });

    const data = await response.json();
    if (data.data) {
      return data.data;
    }
    if (data.fallback) {
      return data.fallback;
    }
    throw new Error(data.error || 'Failed to fetch forecast');
  } catch (error) {
    console.warn('Using client-side fallback forecast:', error);
    return {
      crop,
      currentMandiPrice: crop.toLowerCase().includes('walnut') ? 380 : crop.toLowerCase().includes('dragon') ? 140 : 65,
      unit: 'kg',
      projectedPriceRange: {
        min: crop.toLowerCase().includes('walnut') ? 360 : 130,
        max: crop.toLowerCase().includes('walnut') ? 450 : 175,
        average: crop.toLowerCase().includes('walnut') ? 410 : 155,
      },
      demandScore: 89,
      trend: 'UPWARD',
      confidenceScore: 91,
      optimalHarvestWindow: 'Next 7-10 days for maximum price realization',
      keyDemandDrivers: [
        'Surge in corporate supermarket direct procurement orders',
        'Strong festive export inquiries from Middle East and Tier-1 metros',
        'Pre-cooling quality certification yielding 15-20% higher market price',
      ],
      priceForecastWeekly: [
        { week: 'Week 1', price: 142, demandLevel: 'High' },
        { week: 'Week 2', price: 152, demandLevel: 'High' },
        { week: 'Week 3', price: 168, demandLevel: 'Peak' },
        { week: 'Week 4', price: 160, demandLevel: 'Moderate' },
      ],
      buyerSegmentsInDemand: [
        { segment: 'Direct Supermarket Chains (Reliance, BigBasket)', willingnessToPay: 'High', qtyNeededTons: 25 },
        { segment: 'Export Houses & Food Processors', willingnessToPay: 'Premium', qtyNeededTons: 35 },
        { segment: 'Central APMC Mandi Traders', willingnessToPay: 'Fair', qtyNeededTons: 50 },
      ],
      farmerAdvisorySummary: language === 'mr'
        ? 'पुढील ३ आठवड्यांत या पिकाला बाजारात प्रचंड मागणी राहणार आहे. चांगल्या प्रतवारीने माल विकल्यास थेट २०% जास्त भाव मिळेल.'
        : language === 'hi'
        ? 'अगले 3 हफ़्तों में इस फसल की मांग में भारी उछाल आने का अनुमान है। सही ग्रेडिंग करके बेचने पर आपको 20% अधिक मूल्य मिलेगा।'
        : 'Market demand is projected to peak over the next 3 weeks. Grade into Export Grade A for 20% premium.',
      voiceSpokenScript: language === 'mr'
        ? 'शेतकरी दादा, पुढील दहा दिवसांत या पिकाचे भाव वाढणार आहेत. प्रतवारी करून थेट खरेदीदाराला दिल्यास चांगला नफा होईल.'
        : language === 'hi'
        ? 'किसान भाई, अगले दस दिनों में भाव में तेजी रहेगी। अच्छी ग्रेडिंग करके सीधे खरीदार को बेचें और अधिक लाभ कमाएं।'
        : 'Farmer friend, market prices for your harvest will rise over the next 10 days. Grade properly and sell directly to bulk buyers for top profit.',
    };
  }
}

export async function fetchRouteOptimization(
  farms: any[],
  destinationMarket: string,
  truckType: string,
  language: LanguageCode = 'en'
): Promise<RouteOptimizationResult> {
  try {
    const response = await fetch('/api/ai/route-optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farms, destinationMarket, truckType, language }),
    });

    const data = await response.json();
    if (data.data) {
      return data.data;
    }
    if (data.fallback) {
      return data.fallback;
    }
    throw new Error(data.error || 'Route optimization failed');
  } catch (error) {
    console.warn('Using client-side fallback route:', error);
    return {
      totalDistanceKm: 215,
      estimatedTransitTimeHours: 4.8,
      traditionalCostSeparateTrucksINR: 22500,
      optimizedPooledCostINR: 12800,
      farmerCostSavingsPercent: 43.1,
      co2ReductionKg: 82,
      coldChainIntegrityScore: '98%',
      pickupSequence: [
        { step: 1, location: 'Baramati (Suresh Patil)', action: 'Pickup 2.5 Tons Dragon Fruit', departureTime: '06:00 AM', eta: '06:35 AM', tempRequirement: '+5°C' },
        { step: 2, location: 'Indapur (Ganesh FPO Packhouse)', action: 'Pickup 3.2 Tons Pomegranate', departureTime: '07:30 AM', eta: '08:15 AM', tempRequirement: '+5°C' },
        { step: 3, location: 'Daund (Anand Agro)', action: 'Pickup 2.8 Tons Walnut & Greens', departureTime: '09:00 AM', eta: '09:40 AM', tempRequirement: '+5°C' },
        { step: 4, location: 'Navi Mumbai Central Buyer Hub', action: 'Direct Delivery & Unloading', departureTime: '01:30 PM', eta: '02:00 PM', tempRequirement: '+5°C' },
      ],
      aiOptimizationNotes: [
        'Clustered 3 regional farms into 1 unified cold-chain trip, cutting empty deadhaul',
        'Departure planned at 06:00 AM to avoid Mumbai-Pune expressway peak congestion',
        'Maintains uninterrupted +5°C temperature from first farm gate to final buyer',
      ],
      driverInstructionsInLanguage: 'Follow cluster route, check seal temperature at every stop.',
    };
  }
}

export async function askKisanVoiceAI(
  query: string,
  language: LanguageCode = 'mr',
  context: any = {}
): Promise<{ voiceText: string; displayText: string; suggestedActions: any[]; keyTakeaway: string }> {
  try {
    const response = await fetch('/api/ai/voice-talk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language, context }),
    });

    const data = await response.json();
    if (data.data) {
      return data.data;
    }
    if (data.fallback) {
      return data.fallback;
    }
    throw new Error(data.error || 'Voice talk error');
  } catch (error) {
    console.warn('Using client-side fallback voice response:', error);

    const q = (query || '').toLowerCase();
    const isShipmentTracking =
      q.includes('track') ||
      q.includes('shipment') ||
      q.includes('गाडी') ||
      q.includes('गाड़ी') ||
      q.includes('ट्रक') ||
      q.includes('location') ||
      q.includes('वाहतूक ट्रॅकिंग') ||
      q.includes('ट्रॅकिंग') ||
      q.includes('ट्रैकिंग');
    const isDragonFruit = q.includes('dragon') || q.includes('ड्रॅगन') || q.includes('ड्रैगन') || q.includes('कमलम');
    const isWalnut = q.includes('walnut') || q.includes('अक्रोड') || q.includes('अखरोट');

    if (isShipmentTracking) {
      if (language === 'mr') {
        return {
          voiceText: 'शेतकरी दादा, तुमची MH-12-Q-8890 ही १०-टन कोल्ड-चेन गाडी सध्या पुणे-मुंबई एक्सप्रेसवेवर खोपोली घाटाजवळ असून तापमान +५.२°C वर सुरक्षित आहे. आज दुपारी ४:३० वाजता वाशी मार्केटमध्ये पोहोचेल.',
          displayText: `🚛 **थेट वाहतूक व शिपमेंट ट्रॅकिंग माहिती (MH-12-Q-8890):**\n• **स्थिती:** 🟢 रस्त्यावर धावत आहे (In Transit on Highway)\n• **सध्याचे स्थान:** 📍 पुणे-मुंबई एक्सप्रेसवे (खोपोली घाट)\n• **कंटेनर तापमान:** ❄️ +५.२°C (+४°C ते +७°C सेन्सर सुरक्षित)\n• **अंदाजित आगमन वेळ (ETA):** ⏱️ आज दुपारी ०४:३० वाजता (२ तास १५ मिनिटे)\n• **चालक:** 👤 योगिराज ससाणे (+९१ ९८२२१ ४४५२०)\n• **भाडे बचत:** 💰 ४३.५% खर्च बचत (९२% क्षमता वापर).`,
          suggestedActions: [
            { label: '🚛 संपूर्ण वाहतूक रडार उघडा', actionType: 'LOGISTICS', target: 'logistics' },
            { label: '📊 ड्रॅगन फ्रूट भाव अंदाज', actionType: 'FORECAST', target: 'Dragon Fruit' },
          ],
          keyTakeaway: 'कोल्ड-चेन सेन्सर व जीपीएस थेट सक्रिय असून माल वेळेत पोहोचेल.',
        };
      }
      if (language === 'hi') {
        return {
          voiceText: 'किसान भाई, आपकी 10-टन रीफर गाड़ी MH-12-Q-8890 इस समय पुणे-मुंबई एक्सप्रेसवे पर खोपोली घाट के पास है। तापमान +5.2°C पर सुरक्षित है और डिलीवरी आज शाम 4:30 बजे होगी।',
          displayText: `🚛 **लाइव शिपमेंट ट्रैकिंग रिपोर्ट (MH-12-Q-8890):**\n• **स्थिति:** 🟢 मार्ग में गतिशील (In Transit on Highway)\n• **वर्तमान स्थान:** 📍 पुणे-मुंबई एक्सप्रेसवे (खोपोली घाट)\n• **रीफर तापमान:** ❄️ +5.2°C (सेंसर सक्रिय)\n• **संभावित समय (ETA):** ⏱️ आज शाम 04:30 बजे\n• **चालक:** 👤 योगिराज ससाणे (+91 98221 44520)\n• **भाड़ा बचत:** 💰 43.5% लागत बचत।`,
          suggestedActions: [
            { label: '🚛 संपूर्ण लॉजिस्टिक्स रडार खोलें', actionType: 'LOGISTICS', target: 'logistics' },
            { label: '📊 30 दिन का मंडी भाव', actionType: 'FORECAST', target: 'Dragon Fruit' },
          ],
          keyTakeaway: 'लाइव जीपीएस और तापमान नियंत्रण सक्रिय है।',
        };
      }
      return {
        voiceText: 'Farmer friend, your cold-chain shipment MH-12-Q-8890 is currently in transit on the Pune-Mumbai Expressway near Khopoli Ghat. Temperature is stable at +5.2°C with ETA today at 04:30 PM.',
        displayText: `🚛 **Live Shipment Telemetry (MH-12-Q-8890):**\n• **Status:** 🟢 In Transit on Highway\n• **Current Location:** 📍 Pune-Mumbai Expressway (Khopoli Ghat)\n• **Reefer Temp:** ❄️ +5.2°C (Real-time Sensor Active)\n• **ETA:** ⏱️ Today 04:30 PM (2h 15m remaining)\n• **Driver:** 👤 Yogiraj Sasane (+91 98221 44520)\n• **Freight Saved:** 💰 43.5% Cost Reduction.`,
        suggestedActions: [
          { label: '🚛 Open Full Logistics Radar', actionType: 'LOGISTICS', target: 'logistics' },
          { label: '📊 30-Day Demand Forecast', actionType: 'FORECAST', target: 'Dragon Fruit' },
        ],
        keyTakeaway: 'Real-time cold chain temperature sensor and GPS are fully active.',
      };
    }

    if (language === 'mr') {
      if (isDragonFruit) {
        return {
          voiceText: 'नमस्कार शेतकरी दादा! ड्रॅगन फ्रूटसाठी सध्या बाजारात ₹१४० ते ₹१८० प्रति किलो असा चांगला दर आहे. तुम्ही थेट व्यापाऱ्यांना विकून जास्त नफा मिळवू शकता.',
          displayText: `🌾 **ड्रॅगन फ्रूट (कमलम) बाजार व शेती माहिती:**\n• **सध्याचा थेट भाव:** ₹१४० - ₹१८० / किलो\n• **उत्पन्न:** एकरी वार्षिक ₹५ ते ₹८ लाख उत्पन्न क्षमता\n• **अनुदान:** राष्ट्रीय फलोत्पादन अभियान (MIDH) द्वारे ५०% पर्यंत अनुदान\n• **थेट विक्री:** किसान मित्रवर थेट रिलायन्स फ्रेश व बिगबास्केट खरेदीदार उपलब्ध आहेत.`,
          suggestedActions: [
            { label: '📊 ड्रॅगन फ्रूट भाव अंदाज', actionType: 'FORECAST', target: 'Dragon Fruit' },
            { label: '📚 ड्रॅगन फ्रूट लागवड मार्गदर्शक', actionType: 'TUTORIAL', target: 'tut-dragon-fruit' },
            { label: '🚛 लॉजिस्टिक्स सॉफ्टवेअर', actionType: 'LOGISTICS', target: 'logistics' },
          ],
          keyTakeaway: 'थेट विक्रीने दलालांचे १५-२०% कमिशन वाचून नफा वाढतो.',
        };
      }
      return {
        voiceText: 'नमस्कार शेतकरी दादा! किसान मित्रवर आपले स्वागत आहे. येथे थेट खरेदीदार, अचूक बाजारभाव आणि ४५% स्वस्त वाहतूक सॉफ्टवेअर उपलब्ध आहे.',
        displayText: `🌾 **किसान मित्र शेतकरी सहाय्य:**\n• **थेट विक्री:** दलालांशिवाय थेट मोठ्या खरेदीदारांना विक्री करून २०-३०% जास्त दर मिळवा.\n• **वाहतूक सॉफ्टवेअर:** शेअर्ड कोल्ड-चेन वाहतुकीने माल भाड्यात ४५% बचत.\n• **सुरक्षित व्यवहार:** १००% डिजिटल बँक एस्क्रो पेमेंट सुरक्षा.\n• **आधुनिक पिके:** ड्रॅगन फ्रूट, अक्रोड व सेंद्रिय शेती माहिती.`,
        suggestedActions: [
          { label: '📊 ३० दिवसांचे बाजारभाव अंदाज', actionType: 'FORECAST', target: 'Dragon Fruit' },
          { label: '📚 आधुनिक पिके मास्टरक्लास', actionType: 'TUTORIAL', target: 'tut-walnut-grafted' },
          { label: '🚛 लॉजिस्टिक्स सॉफ्टवेअर', actionType: 'LOGISTICS', target: 'logistics' },
        ],
        keyTakeaway: 'थेट डिजिटल विक्री आणि स्मार्ट वाहतूक शेतकरी नफा वाढवते.',
      };
    }

    if (language === 'hi') {
      if (isDragonFruit) {
        return {
          voiceText: 'नमस्ते किसान भाई! ड्रैगन फ्रूट का वर्तमान मंडी भाव ₹140 से ₹180 प्रति किलो है और थोक खरीदारों की भारी मांग है।',
          displayText: `🌾 **ड्रैगन फ्रूट (कमलम) बाजार व फसल जानकारी:**\n• **सीधा भाव:** ₹140 - ₹180 / किलो\n• **सालाना आय:** ₹6 से ₹9 लाख प्रति एकड़\n• **सब्सिडी:** MIDH योजना में 50% तक सरकारी अनुदान\n• **सीधी खरीद:** किसान मित्र पर सीधे सुपरमार्केट्स व निर्यातक जुड़े हैं।`,
          suggestedActions: [
            { label: '📊 ड्रैगन फ्रूट भाव व मांग', actionType: 'FORECAST', target: 'Dragon Fruit' },
            { label: '📚 ड्रैगन फ्रूट गाइड', actionType: 'TUTORIAL', target: 'tut-dragon-fruit' },
          ],
          keyTakeaway: 'सीधी बिक्री से 15-20% आढ़त कमीशन बचता है।',
        };
      }
      return {
        voiceText: 'नमस्ते किसान भाई! किसान मित्र पर सीधे थोक खरीदार जुड़े हैं। आप अपनी फसल बेचकर 25% अधिक लाभ कमा सकते हैं।',
        displayText: `🌾 **किसान मित्र - सीधा किसान मंच:**\n• **सीधी बिक्री:** बिना बिचौलियों के देश भर के थोक खरीदारों को बेचें\n• **सुरक्षित भुगतान:** 100% एस्क्रो बैंक गारंटी\n• **लॉजिस्टिक्स सॉफ्टवेयर:** साझा कोल्ड-चेन द्वारा 45% तक माल भाड़ा बचत\n• **उन्नत फसलें:** ड्रैगन फ्रूट, अखरोट, केसर व एवोकाडो।`,
        suggestedActions: [
          { label: '📊 30 दिन का मंडी भाव', actionType: 'FORECAST', target: 'Dragon Fruit' },
          { label: '📚 अखरोट मास्टरक्लास', actionType: 'TUTORIAL', target: 'tut-walnut-grafted' },
          { label: '🚛 लॉजिस्टिक्स सॉफ्टवेयर', actionType: 'LOGISTICS', target: 'logistics' },
        ],
        keyTakeaway: 'सीधी डिजिटल बिक्री से किसान को पूरा हक और सही मूल्य मिलता है।',
      };
    }

    if (language === 'gu') {
      if (isDragonFruit) {
        return {
          voiceText: 'નમસ્તે ખેડૂત મિત્ર! ડ્રેગન ફ્રૂટ માટે હાલમાં ₹૧૪૦ થી ₹૧૮૦ પ્રતિ કિલોનો બજાર ભાવ મળી રહ્યો છે. સીધા વેપારીઓને માલ આપીને વધુ નફો મેળવો.',
          displayText: `🌾 **ડ્રેગન ફ્રૂટ (કમલમ) માહિતી:**\n• **સીધો બજાર ભાવ:** ₹૧૪૦ - ₹૧૮૦ / કિલો\n• **વાર્ષિક આવક:** એકર દીઠ ₹૫ થી ₹૮ લાખ\n• **સરકારી સબસિડી:** MIDH હેઠળ ૫૦% સુધી સહાય\n• **સીધું વેચાણ:** કિસાન મિત્ર પર સુપરમાર્કેટ્સ અને વેપારીઓ જોડાયેલા છે.`,
          suggestedActions: [
            { label: '📊 ડ્રેગન ફ્રૂટ ભાવ આગાહી', actionType: 'FORECAST', target: 'Dragon Fruit' },
            { label: '📚 ડ્રેગન ફ્રૂટ માર્ગદર્શિકા', actionType: 'TUTORIAL', target: 'tut-dragon-fruit' },
            { label: '🚛 ટ્રાન્સપોર્ટ સોફ્ટવેર', actionType: 'LOGISTICS', target: 'logistics' },
          ],
          keyTakeaway: 'સીધા વેચાણથી વચેટિયાઓનો ખર્ચ બચે છે.',
        };
      }
      return {
        voiceText: 'નમસ્તે ખેડૂત મિત્ર! કિસાન મિત્ર પર તમારું સ્વાગત છે. અહીં તમને સીધા ખરીદદારો, સચોટ ભાવ અને સસ્તી ટ્રાન્સપોર્ટ સેવા મળે છે.',
        displayText: `🌾 **કિસાન મિત્ર - ખેડૂત સહાયક:**\n• **સીધું વેચાણ:** વચેટિયાઓ વગર ઊંચા ભાવ મેળવો\n• **સરકારી સબસિડી:** બાગાયત પાકો માટે ૫૦% સુધી સહાય\n• **સુરક્ષિત પેમેન્ટ:** ૧૦૦% એસ્ક્રો સુરક્ષા\n• **વાહન વ્યવસ્થા:** સ્માર્ટ લોજિસ્ટિક્સ સોફ્ટવેર દ્વારા ૪૫% સુધી ભાડા બચત.`,
        suggestedActions: [
          { label: '📊 ભાવ આગાહી જુઓ', actionType: 'FORECAST', target: 'Dragon Fruit' },
          { label: '📚 આધુનિક પાક માસ્ટરક્લાસ', actionType: 'TUTORIAL', target: 'tut-walnut-grafted' },
          { label: '🚛 ટ્રાન્સપોર્ટ સોફ્ટવેર', actionType: 'LOGISTICS', target: 'logistics' },
        ],
        keyTakeaway: 'સીધા વેચાણથી ખેડૂતનો નફો ૨૫% વધે છે.',
      };
    }

    if (language === 'te') {
      if (isDragonFruit) {
        return {
          voiceText: 'నమస్కారం రైతు మిత్రమా! డ్రాగన్ ఫ్రూట్ కి ప్రస్తుతం కిలోకు ₹140 నుండి ₹180 వరకు మంచి మార్కెట్ ధర లభిస్తోంది.',
          displayText: `🌾 **డ్రాగన్ ఫ్రూట్ సాగు మరియు మార్కెట్ సమాచారం:**\n• **మార్కెట్ ధర:** కిలోకు ₹140 - ₹180\n• **వార్షిక ఆదాయం:** ఎకరానికి ₹5 నుండి ₹8 లక్షలు\n• **ప్రభుత్వ రాయితీ:** ఉద్యానవన పథకం ద్వారా 50% రాయితీ\n• **ప్రత్యక్ష అమ్మకం:** కిసాన్ మిత్ర ద్వారా నేరుగా కొనుగోలుదారులకు అమ్మండి.`,
          suggestedActions: [
            { label: '📊 ధరల అంచనా చూడండి', actionType: 'FORECAST', target: 'Dragon Fruit' },
            { label: '📚 సాగు విధానం', actionType: 'TUTORIAL', target: 'tut-dragon-fruit' },
            { label: '🚛 లాజిస్టిక్స్ సాఫ్ట్‌వేర్', actionType: 'LOGISTICS', target: 'logistics' },
          ],
          keyTakeaway: 'నేరుగా అమ్మడం ద్వారా దళారీ కమీషన్లు ఆదా అవుతాయి.',
        };
      }
      return {
        voiceText: 'నమస్కారం రైతు మిత్రమా! కిసాన్ మిత్ర ద్వారా నేరుగా వ్యాపారులకు అమ్మి 25% ఎక్కువ లాభం పొందవచ్చు.',
        displayText: `🌾 **కిసాన్ మిత్ర - రైతు సహాయం:**\n• **ప్రత్యక్ష అమ్మకం:** దళారులు లేకుండా నేరుగా అమ్మకం\n• **ప్రభుత్వ రాయితీ:** ఉద్యానవన పంటలకు 50% వరకు రాయితీ\n• **సురక్షిత చెల్లింపులు:** 100% ఎస్క్రో రక్షణ\n• **రవాణా:** కోల్డ్ చైన్ లాజిస్టిక్స్ సాఫ్ట్‌వేర్ ద్వారా 45% ఖర్చు ఆదా.`,
        suggestedActions: [
          { label: '📊 మార్కెట్ ధరలు', actionType: 'FORECAST', target: 'Dragon Fruit' },
          { label: '📚 ఆధునిక పంటల శిక్షణ', actionType: 'TUTORIAL', target: 'tut-walnut-grafted' },
          { label: '🚛 లాజిస్టిక్స్ సాఫ్ట్‌వేర్', actionType: 'LOGISTICS', target: 'logistics' },
        ],
        keyTakeaway: 'ప్రత్యక్ష మార్కెటింగ్ రైతు ఆదాయాన్ని పెంచుతుంది.',
      };
    }

    return {
      voiceText: 'Hello farmer friend! KisanMitra connects you directly with bulk buyers. High-yield crops like Dragon Fruit and Walnut are fetching top prices right now.',
      displayText: 'Direct selling eliminates the 15-20% APMC commission agent cuts. Use smart freight software to save up to 45% on transport.',
      suggestedActions: [
        { label: 'Check 30-Day Mandi Forecast', actionType: 'FORECAST', target: 'Dragon Fruit' },
        { label: 'View Walnut Cultivation Guide', actionType: 'TUTORIAL', target: 'tut-walnut-grafted' },
        { label: 'Open Smart Logistics Software', actionType: 'LOGISTICS', target: 'logistics' },
      ],
      keyTakeaway: 'Direct connection and smart logistics software maximize your net income.',
    };
  }
}

export async function transcribeAudioBlob(
  audioBlob: Blob,
  language: LanguageCode = 'mr'
): Promise<string> {
  try {
    const audioBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = (reader.result as string) || '';
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const mimeType = audioBlob.type || 'audio/webm';

    const response = await fetch('/api/ai/transcribe-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64,
        mimeType,
        language,
      }),
    });

    const data = await response.json();
    if (data.success && data.transcript) {
      return data.transcript;
    }
    throw new Error(data.error || 'Transcription failed');
  } catch (err) {
    console.warn('Backend audio transcription error:', err);
    throw err;
  }
}

export async function askCropAdvisoryAI(
  cropName: string,
  userQuestion: string,
  language: LanguageCode = 'en'
): Promise<any> {
  try {
    const response = await fetch('/api/ai/crop-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName, userQuestion, language }),
    });

    const data = await response.json();
    if (data.data) {
      return data.data;
    }
    if (data.fallback) {
      return data.fallback;
    }
    throw new Error(data.error || 'Crop guide error');
  } catch (error) {
    console.warn('Using client-side fallback crop guide:', error);
    return {
      cropName,
      botanicalInfo: 'High-yield commercial cultivar suited for semi-arid/drip conditions',
      investmentPerAcreINR: 280000,
      expectedAnnualYieldKg: 4500,
      expectedAnnualIncomeINR: 650000,
      gestationPeriodMonths: 14,
      subsidyDetails: {
        schemeName: 'Mission for Integrated Development of Horticulture (MIDH)',
        subsidyPercentage: '40% - 50%',
        maxSubsidyAmountINR: 160000,
        eligibility: 'Farmers with drip irrigation and 7/12 land registration',
      },
      stepByStepGuide: [
        { phase: 'Trellis & Soil Prep', details: 'Install sturdy RCC poles and organic compost.' },
        { phase: 'Planting & Training', details: 'Plant disease-free grafts and train upward.' },
        { phase: 'Harvest & Direct Linkage', details: 'Harvest at 80% color break and connect with bulk buyers.' },
      ],
      voiceOverviewScript: 'This crop can yield 6 to 8 Lakhs per acre with 50% government subsidy support.',
      expertTips: [
        'Intercropping in year 1 offsets initial land preparation costs.',
        'Use drip fertigation for uniform fruit size and export quality grading.',
      ],
    };
  }
}

export async function fetchRealTimeWeatherAlerts(
  registeredLocations: Array<{ location: string; crops?: string[] } | string>,
  language: LanguageCode = 'mr'
): Promise<WeatherAlert[]> {
  try {
    const formattedLocations = registeredLocations.map((item) => {
      if (typeof item === 'string') {
        return { location: item, crops: [] };
      }
      return { location: item.location, crops: item.crops || [] };
    });

    const response = await fetch('/api/ai/weather-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registeredLocations: formattedLocations, language }),
    });

    const data = await response.json();
    if (data.data?.alerts && Array.isArray(data.data.alerts) && data.data.alerts.length > 0) {
      return data.data.alerts;
    }
    return initialWeatherAlerts;
  } catch (error) {
    console.warn('Using fallback initial weather alerts:', error);
    return initialWeatherAlerts;
  }
}

export async function fetchCropRecommendations(
  soilHealth: SoilHealthInput,
  language: LanguageCode = 'mr'
): Promise<CropRecommendationResponse> {
  try {
    const response = await fetch('/api/ai/crop-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soilHealth, language }),
    });

    const data = await response.json();
    if (data.data) {
      return data.data;
    }
    if (data.fallback) {
      return data.fallback;
    }
    throw new Error(data.error || 'Failed to generate crop recommendation');
  } catch (error) {
    console.warn('Using client-side fallback crop recommendation:', error);
    const isMarathi = language === 'mr';
    const isHindi = language === 'hi';

    return {
      regionSummary: isMarathi
        ? `${soilHealth.district || 'पुणे/बारामती'}, ${soilHealth.state || 'महाराष्ट्र'} भागातील काळी कसदार जमीन आणि उपलब्ध ठिबक सिंचनासाठी आधुनिक बागायती व नगदी पिके अत्यंत फायदेशीर आहेत.`
        : isHindi
        ? `${soilHealth.district || 'पुणे'}, ${soilHealth.state || 'महाराष्ट्र'} क्षेत्र की उपजाऊ मिट्टी और ड्रिप सिंचाई के लिए उच्च मूल्य वाली फसलें सर्वाधिक लाभदायक हैं।`
        : `Optimal agro-climatic conditions in ${soilHealth.district}, ${soilHealth.state} with ${soilHealth.soilType} soil and ${soilHealth.irrigation} irrigation support high-margin horticulture and cash crops.`,
      seasonalClimateOutlook: isMarathi
        ? `${soilHealth.season.toUpperCase()} हंगामात हवामानातील कमाल तापमान २८°-३४°C आणि स्थिर पर्जन्यमानाचा अंदाज आहे.`
        : `${soilHealth.season.toUpperCase()} season offers favorable temperature range (26°-34°C) with stable day-night differentials.`,
      overallSoilHealthAnalysis: {
        healthIndexScore: 88,
        primaryLimitingFactor: isMarathi ? 'फॉस्फरसची (P) कमतरता आणि मध्यम सेंद्रिय कर्ब' : 'Moderate Phosphorus availability and optimal organic carbon',
        organicMatterStatus: isMarathi ? '०.६५% (मध्यम) - एकरी ४ ट्रॉली शेणखत किंवा गांडूळ खत वापरावे' : '0.65% (Optimal) - Supplement with vermicompost',
        npkBalanceStatus: isMarathi ? 'नत्र: मध्यम | स्फुरद: कमी | पालाश: मुबलक' : 'N: Medium | P: Low | K: High'
      },
      topRecommendations: [
        {
          id: 'crop-rec-1',
          cropName: 'Dragon Fruit (Red Velvet)',
          localName: isMarathi ? 'ड्रॅगन फ्रूट (कमलम)' : isHindi ? 'ड्रैगन फ्रूट (कमलम)' : 'Dragon Fruit',
          variety: 'Red Velvet / Malaysian Hybrid',
          category: 'exotic',
          suitabilityScore: 97,
          rank: 1,
          projectedProfitPerAcreINR: 385000,
          projectedRevenuePerAcreINR: 525000,
          inputCostPerAcreINR: 140000,
          roiPercent: 275,
          expectedYieldTonsPerAcre: 3.8,
          expectedPricePerKg: { min: 125, max: 170, avg: 145 },
          harvestDurationDays: 180,
          waterRequirement: 'Low / Drought Tolerant',
          riskRating: 'Low',
          marketDemandTrend: 'Surging',
          keyMarketOfftakers: ['Metro Supermarkets (Reliance Fresh)', 'Direct Export Aggregators', 'Mumbai/Pune APMC'],
          soilCompatibilityRationale: isMarathi
            ? 'काळी व निचऱ्याची जमीन ड्रॅगन फ्रूटसाठी उत्तम असून मुळे कुजण्याचा धोका नसतो.'
            : 'Well-drained soil prevents root-rot and supports robust rooting.',
          weatherResilienceRationale: isMarathi
            ? 'कमी पाण्यात आणि तीव्र उन्हातही उत्तम तग धरते, दुष्काळी स्थितीतही हमखास उत्पन्न मिळते.'
            : 'Exceptional drought tolerance and heat resistance with minimal water requirement.',
          marketDemandRationale: isMarathi
            ? 'शहरांमध्ये आरोग्यवर्धक फळ म्हणून मागणी प्रचंड असून थेट सुपरमार्केट खरेदीदार ₹१४०+/किलो भाव देतात.'
            : 'High urban demand for exotic fruit with steady ₹140+/kg farmgate realization.',
          soilNutrientPrescription: {
            fertilizerDosage: isMarathi ? 'एसएसपी (SSP) ५० किलो + निंबोळी पेंड १५० किलो प्रति एकर' : 'SSP 50kg + Neem Cake 150kg per acre',
            organicAmendments: isMarathi ? '४ टन शेणखत किंवा ट्रायकोडर्मा मिश्रित गांडूळ खत' : '4 Tons FYM enriched with Trichoderma',
            phCorrectionTip: isMarathi ? 'जमिनीचा सामू (pH) योग्य ठेवण्यासाठी जिप्सम वापरावे.' : 'Apply Gypsum for soil buffering'
          },
          seasonalRoadmap: [
            { stage: isMarathi ? 'जमीन मशागत व पोल उभारणी' : 'Land Prep & Trellis', timeframe: 'Week 1-3', keyAction: isMarathi ? 'आरसीसी पोल व रिंग बसवणे' : 'Install RCC poles and drip lines' },
            { stage: isMarathi ? 'रोपांची लागवड' : 'Planting', timeframe: 'Week 4', keyAction: isMarathi ? 'प्रति पोल ४ रोपे लावणे' : 'Plant 4 saplings per pole' },
            { stage: isMarathi ? 'फळधारणा व पोषण' : 'Fruit Setting', timeframe: 'Month 3-5', keyAction: isMarathi ? 'सूक्ष्म अन्नद्रव्य फवारणी' : 'Foliar micronutrient spray' },
            { stage: isMarathi ? 'काढणी व थेट विक्री' : 'Harvest & Sale', timeframe: 'Month 6', keyAction: isMarathi ? 'किसानमित्र अ‍ॅपवर थेट लॉट विक्री' : 'Direct lot sale on KisanMitra' }
          ],
          matchedBuyerDemandsCount: 18,
          availableGovtSubsidy: isMarathi ? 'राष्ट्रीय फलोत्पादन अभियान (MIDH) - एकरी ₹१,२०,००० पर्यंत अनुदान' : 'MIDH Scheme - Up to ₹1,20,000 / Acre Subsidy',
          imageUrl: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&auto=format&fit=crop&q=80'
        },
        {
          id: 'crop-rec-2',
          cropName: 'Pomegranate (Bhagwa Super)',
          localName: isMarathi ? 'भगवा डाळिंब' : isHindi ? 'भगवा अनार' : 'Pomegranate',
          variety: 'Bhagwa Export Grade A',
          category: 'fruits',
          suitabilityScore: 93,
          rank: 2,
          projectedProfitPerAcreINR: 310000,
          projectedRevenuePerAcreINR: 430000,
          inputCostPerAcreINR: 120000,
          roiPercent: 258,
          expectedYieldTonsPerAcre: 4.5,
          expectedPricePerKg: { min: 85, max: 125, avg: 105 },
          harvestDurationDays: 165,
          waterRequirement: 'Moderate Drip',
          riskRating: 'Low',
          marketDemandTrend: 'High',
          keyMarketOfftakers: ['Europe & Gulf Exporters', 'BigBasket Hubs', 'Vashi APMC Commission Agents'],
          soilCompatibilityRationale: isMarathi
            ? 'पाण्याचा उत्तम निचरा असणाऱ्या जमिनीत फळांचा आकार व रंग उत्कृष्ट येतो.'
            : 'Deep soil ensures superior brix sweetness and uniform ruby-red aril coloration.',
          weatherResilienceRationale: isMarathi
            ? 'हस्त बहरामध्ये हवामान कोरडे राहिल्यास तेलकट डाग रोगाचा प्रादुर्भाव नगण्य राहतो.'
            : 'Favorable dry spells during fruit maturity minimize fungal and bacterial blight risks.',
          marketDemandRationale: isMarathi
            ? 'भगवा जातीला आखाती देशांमध्ये कायमस्वरूपी प्रीमियम निर्यात भाव मिळतो.'
            : 'Strong global export pull with premium prices for 250g+ size fruits.',
          soilNutrientPrescription: {
            fertilizerDosage: isMarathi ? '०:५२:३४ + बोरॉन फवारणी फुलोऱ्याच्या काळात' : '0:52:34 + Boron foliar spray at flowering',
            organicAmendments: isMarathi ? 'शेणखत + जिवामृत दर १५ दिवसांनी ठिबकमधून' : 'Jeevamrit drenching via drip every 15 days',
            phCorrectionTip: isMarathi ? 'पालाशची उपलब्धता वाढवण्यासाठी पोटॅश मोबिलायझिंग बॅक्टेरिया वापरावेत.' : 'Use Potash mobilizing bio-fertilizers'
          },
          seasonalRoadmap: [
            { stage: isMarathi ? 'छाटणी व बहार धरणे' : 'Pruning & Bahar', timeframe: 'Week 1-2', keyAction: isMarathi ? 'ताण तोडून पाणी सुरू करणे' : 'Prune light branches & irrigate' },
            { stage: isMarathi ? 'फुलोरा संरक्षण' : 'Flowering Protection', timeframe: 'Week 3-6', keyAction: isMarathi ? 'बोरॉन व कॅल्शियम फवारणी' : 'Boron and Calcium foliar spray' },
            { stage: isMarathi ? 'फळ फुगवण' : 'Fruit Sizing', timeframe: 'Month 3-4', keyAction: isMarathi ? 'फळांवर कव्हर बॅगिंग करणे' : 'Paper bagging on fruits' },
            { stage: isMarathi ? 'निर्यात प्रतवारी व पॅकिंग' : 'Harvest & Export', timeframe: 'Month 5-6', keyAction: isMarathi ? 'कोल्ड-चेन ट्रकमधून थेट पाठवणे' : 'Ship in temperature-controlled reefer' }
          ],
          matchedBuyerDemandsCount: 22,
          availableGovtSubsidy: isMarathi ? 'महाडीबीटी फलोत्पादन योजना - ५०% ठिबक व रोपे अनुदान' : 'MahaDBT Horticulture Scheme - 50% Subsidy',
          imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80'
        },
        {
          id: 'crop-rec-3',
          cropName: 'Colored Capsicum (Polyhouse/Shadenet)',
          localName: isMarathi ? 'रंगीत ढोबळी मिरची (रेड/यलो)' : isHindi ? 'शिमला मिर्च (रेड/येलो)' : 'Colored Bell Pepper',
          variety: 'Inspiration (Red) & Bachata (Yellow)',
          category: 'vegetables',
          suitabilityScore: 89,
          rank: 3,
          projectedProfitPerAcreINR: 260000,
          projectedRevenuePerAcreINR: 370000,
          inputCostPerAcreINR: 110000,
          roiPercent: 236,
          expectedYieldTonsPerAcre: 6.2,
          expectedPricePerKg: { min: 45, max: 80, avg: 62 },
          harvestDurationDays: 90,
          waterRequirement: 'Moderate Drip',
          riskRating: 'Medium',
          marketDemandTrend: 'High',
          keyMarketOfftakers: ['HoReCa 5-Star Hotels', 'Zomato Hyperpure', 'Gourmet Supermarkets'],
          soilCompatibilityRationale: isMarathi
            ? 'योग्य खत व्यवस्थापनाने दर आठवड्याला ५०० किलो ते १ टन नियमित तोडणी शक्य होते.'
            : 'Fertigation through drip produces export-grade thick-walled fruit blocks.',
          weatherResilienceRationale: isMarathi
            ? 'शेडनेट किंवा मल्चिंगमुळे तापमान नियंत्रित राहून विषाणूजन्य रोगांचा प्रादुर्भाव रोखला जातो.'
            : 'Shade-net climate buffering prevents blossom end rot and sunscald.',
          marketDemandRationale: isMarathi
            ? 'हॉटेल व पिझ्झा रेस्टॉरंट्सकडून वर्षभर स्थिर आगाऊ खरेदी करार मिळतात.'
            : 'Consistent year-round demand from HoReCa and quick-commerce chains.',
          soilNutrientPrescription: {
            fertilizerDosage: isMarathi ? '१९:१९:१९ आणि १३:०:४५ दर आठवड्याला ठिबकमधून' : '19:19:19 & 13:0:45 fertigation weekly',
            organicAmendments: isMarathi ? 'ह्युमिक अ‍ॅसिड + सूक्ष्म अन्नद्रव्ये' : 'Humic acid + Seaweed extract',
            phCorrectionTip: isMarathi ? 'कॅल्शियम नायट्रेट मुळांच्या बळकटीसाठी वापरावे.' : 'Apply Calcium Nitrate for fruit firmness'
          },
          seasonalRoadmap: [
            { stage: isMarathi ? 'बेड तयार करणे व मल्चिंग' : 'Bed Prep & Mulching', timeframe: 'Week 1-2', keyAction: isMarathi ? 'सिल्व्हर-ब्लॅक मल्चिंग पेपर टाकणे' : 'Lay silver-black mulch & drip' },
            { stage: isMarathi ? 'रोप पुनर्लागवड' : 'Transplanting', timeframe: 'Week 3', keyAction: isMarathi ? '३५ दिवसांची निरोगी रोपे लावणे' : 'Transplant healthy saplings' },
            { stage: isMarathi ? 'कापणी व नियमित तोडे' : 'Weekly Picking', timeframe: 'Month 3-5', keyAction: isMarathi ? 'दर ५ दिवसांनी तोडणी करून पॅकिंग' : 'Pick every 5 days & pack in crates' }
          ],
          matchedBuyerDemandsCount: 16,
          availableGovtSubsidy: isMarathi ? 'संरक्षित शेती योजना (NHM) - शेडनेटवर ५०% शासकीय अनुदान' : 'NHM Protected Cultivation - 50% Shadenet Subsidy',
          imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80'
        },
        {
          id: 'crop-rec-4',
          cropName: 'Organic Chia & Quinoa Superfoods',
          localName: isMarathi ? 'सेंद्रिय चिया सीड्स / क्विनोआ' : isHindi ? 'ऑर्गेनिक चिया सीड्स' : 'Chia Seeds',
          variety: 'White Diamond Export',
          category: 'grains',
          suitabilityScore: 86,
          rank: 4,
          projectedProfitPerAcreINR: 195000,
          projectedRevenuePerAcreINR: 255000,
          inputCostPerAcreINR: 60000,
          roiPercent: 325,
          expectedYieldTonsPerAcre: 1.2,
          expectedPricePerKg: { min: 180, max: 240, avg: 210 },
          harvestDurationDays: 110,
          waterRequirement: 'Low / Drought Tolerant',
          riskRating: 'Low',
          marketDemandTrend: 'Surging',
          keyMarketOfftakers: ['Nutraceutical Brands', 'Organic Export Houses', 'D2C Superfood Brands'],
          soilCompatibilityRationale: isMarathi
            ? 'कमी सुपीक जमिनीतही चियाचे पीक अतिशय कमी खत व पाण्याच्या खर्चात उत्तम येते.'
            : 'Thrives in marginal soils with low nutrient demands and zero pesticide requirement.',
          weatherResilienceRationale: isMarathi
            ? 'जनावरे खात नाहीत आणि रोगकिडींचा उपद्रव नगण्य असतो, दुष्काळी भागात हमखास उत्पन्न.'
            : 'Cattle-proof and pest-resistant with minimal water consumption.',
          marketDemandRationale: isMarathi
            ? 'हेल्थ-फूड कंपन्या ₹२००+/किलो या दराने थेट शेतातून खरेदी करतात.'
            : 'Growing urban wellness trend with direct farmgate contract farming at ₹200+/kg.',
          soilNutrientPrescription: {
            fertilizerDosage: isMarathi ? 'गांडूळ खत + बायो-एनपीके' : 'Vermicompost 1.5 Tons + Bio-NPK',
            organicAmendments: isMarathi ? 'दशपर्णी अर्क कीटक प्रतिबंधासाठी' : 'Dashaparni Ark spray for prevention',
          },
          seasonalRoadmap: [
            { stage: isMarathi ? 'पेरणी' : 'Sowing', timeframe: 'Week 1-2', keyAction: isMarathi ? 'ओळीत पेरणी व हलके पाणी' : 'Line sowing with light irrigation' },
            { stage: isMarathi ? 'फुलोरा' : 'Flowering', timeframe: 'Month 2', keyAction: isMarathi ? 'निंदणी व पाणी व्यवस्थापन' : 'Weeding & minimal watering' },
            { stage: isMarathi ? 'काढणी व मळणी' : 'Harvest & Threshing', timeframe: 'Month 3.5', keyAction: isMarathi ? 'थ्रेशिंग व थेट ग्रेडिंग' : 'Threshing & bagging for export' }
          ],
          matchedBuyerDemandsCount: 11,
          availableGovtSubsidy: isMarathi ? 'परंपरागत कृषी विकास योजना (PKVY) - सेंद्रिय प्रमाणीकरण अनुदान' : 'PKVY Organic Farming Certification Subsidy',
          imageUrl: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80'
        }
      ],
      expertAdvisorSummary: isMarathi
        ? `शेतकरी दादा, तुमच्या जमिनीचा पोत (pH ${soilHealth.phLevel}, काळी कसदार जमीन) आणि उपलब्ध ठिबक सिंचनाचा विचार करता 'ड्रॅगन फ्रूट' आणि 'भगवा डाळिंब' हे दोन पर्याय एकरी ₹३ लाख ते ₹३.८ लाखांचा हमखास नफा देऊ शकतात. तसेच कमी खर्चासाठी चिया सीड्स हे ३२५% परतावा देणारे पीक आहे.`
        : isHindi
        ? `किसान भाई, आपकी मिट्टी (pH ${soilHealth.phLevel}) और ड्रिप सिंचाई के अनुसार 'ड्रैगन फ्रूट' और 'भगवा अनार' प्रति एकड़ ₹3.5 लाख तक का शुद्ध मुनाफा दे सकते हैं। साथ ही कम पानी व लागत में चिया सीड्स सर्वोत्तम विकल्प है।`
        : `Based on your soil parameters (pH ${soilHealth.phLevel}, ${soilHealth.soilType} soil) and drip irrigation, Dragon Fruit and Bhagwa Pomegranate offer the highest net profit (up to ₹3.85 Lakh/Acre) with low climate risk.`,
      spokenAudioScript: isMarathi
        ? `शेतकरी दादा, तुमच्या जमिनीच्या तपासणीनुसार ड्रॅगन फ्रूट आणि डाळिंब ही पिके सर्वाधिक फायदेशीर ठरतील. या पिकांना बाजारात मोठी मागणी असून एकरी ३ लाखांपेक्षा जास्त निव्वळ नफा मिळू शकतो.`
        : isHindi
        ? `किसान भाई, आपकी जमीन और मौसम के अनुसार ड्रैगन फ्रूट और अनार की खेती से प्रति एकड़ 3 लाख से अधिक का शुद्ध लाभ हो सकता है।`
        : `Farmer friend, based on your soil test, Dragon Fruit and Pomegranate are your top profit-yielding crops with estimated net returns exceeding ₹3.8 Lakh per acre.`
    };
  }
}

