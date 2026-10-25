/**
 * Alalay - Metro Manila Rail Transit Data
 * Fact-checked offline transit dataset covering:
 * - Active: LRT-1 (including Cavite Extension Phase 1 to Dr. Santos), LRT-2, MRT-3
 * - Under Construction: MRT-7 (Target: Q2 2027 partial / 2028 full), Metro Manila Subway MRT-9 (Target: Q1 2028 demo run / 2031-2032 full)
 *
 * Sources: DOTr, LRMC, LRTA, MRT-3 official directories.
 */

export interface Station {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  isInterchange?: boolean;
  interchangeWith?: string[];
  isExtension?: boolean;
  hasElevator?: boolean;
  notes?: string;
}

export interface TransitLine {
  id: string;
  name: string;
  shortName: string;
  operator: string;
  color: string;
  accentBg: string;
  badgeBorder: string;
  status: "Active" | "Under Construction";
  targetDate?: string;
  constructionNotice?: string;
  hotline: string;
  accessibilityNotice: string;
  terminalFrom: string;
  terminalTo: string;
  firstTrain: string;
  lastTrain: string;
  headwayMinutes: string;
  fareBeep: string;
  fareSJT: string;
  discountNote: string;
  stations: Station[];
}

export const TRANSIT_LINES: TransitLine[] = [
  {
    id: "lrt1",
    name: "LRT-1 (Green Line)",
    shortName: "LRT-1",
    operator: "Light Rail Manila Corporation (LRMC)",
    color: "#22c55e",
    accentBg: "#052e16",
    badgeBorder: "#16a34a",
    status: "Active",
    hotline: "(02) 5318-5777",
    accessibilityNotice: "Elevators available at designated stations per LRMC directory. For immediate on-ground assistance, ask Station Security or call LRMC at (02) 5318-5777.",
    terminalFrom: "Fernando Poe Jr. (Roosevelt)",
    terminalTo: "Dr. Santos (Cavite Extension)",
    firstTrain: "4:30 AM",
    lastTrain: "10:00 PM (Mon-Fri) / 9:30 PM (Weekends)",
    headwayMinutes: "3 - 5 mins",
    fareBeep: "₱15.00 - ₱45.00",
    fareSJT: "₱16.00 - ₱45.00",
    discountNote: "20% Discount for PWD, Senior & Student",
    stations: [
      { id: "lrt1-fpj", name: "Fernando Poe Jr. (Roosevelt)", city: "Quezon City", lat: 14.6575, lng: 121.0211, isInterchange: true, interchangeWith: ["EDSA Carousel Busway"], hasElevator: true },
      { id: "lrt1-balintawak", name: "Balintawak", city: "Quezon City", lat: 14.6574, lng: 121.0006, hasElevator: true },
      { id: "lrt1-monumento", name: "Monumento", city: "Caloocan", lat: 14.6542, lng: 120.9839, hasElevator: true, notes: "Northern Caloocan / Malabon hub" },
      { id: "lrt1-5thave", name: "5th Avenue", city: "Caloocan", lat: 14.6444, lng: 120.9835 },
      { id: "lrt1-rpapa", name: "R. Papa", city: "Manila", lat: 14.6360, lng: 120.9829 },
      { id: "lrt1-abad", name: "Abad Santos", city: "Manila", lat: 14.6305, lng: 120.9815 },
      { id: "lrt1-blumentritt", name: "Blumentritt", city: "Manila", lat: 14.6226, lng: 120.9831, isInterchange: true, interchangeWith: ["PNR Blumentritt"] },
      { id: "lrt1-tayuman", name: "Tayuman", city: "Manila", lat: 14.6167, lng: 120.9833, notes: "Near San Lazaro Hospital & SM San Lazaro" },
      { id: "lrt1-bambang", name: "Bambang", city: "Manila", lat: 14.6111, lng: 120.9822, notes: "Medical supply district" },
      { id: "lrt1-djose", name: "Doroteo Jose", city: "Manila", lat: 14.6053, lng: 120.9819, isInterchange: true, interchangeWith: ["LRT-2 Recto (Crosswalk bridge)"], hasElevator: true },
      { id: "lrt1-carriedo", name: "Carriedo", city: "Manila", lat: 14.5997, lng: 120.9814, notes: "Quiapo Church, Escolta & Chinatown" },
      { id: "lrt1-central", name: "Central Terminal", city: "Manila", lat: 14.5928, lng: 120.9817, isInterchange: true, interchangeWith: ["Pasig River Ferry", "Manila City Hall"], hasElevator: true },
      { id: "lrt1-un", name: "United Nations", city: "Manila", lat: 14.5826, lng: 120.9845, notes: "Rizal Park, NBI, Supreme Court & PGH" },
      { id: "lrt1-pfaura", name: "Pedro Gil", city: "Manila", lat: 14.5764, lng: 120.9880, notes: "UP Manila & Robinsons Manila" },
      { id: "lrt1-quirino", name: "Quirino", city: "Manila", lat: 14.5702, lng: 120.9915, notes: "Manila Zoo & Malate" },
      { id: "lrt1-vito", name: "Vito Cruz", city: "Manila", lat: 14.5633, lng: 120.9946, notes: "De La Salle University, CSB, St. Scholastica" },
      { id: "lrt1-gilpuyat", name: "Gil Puyat (Buendia)", city: "Pasay", lat: 14.5542, lng: 120.9972, isInterchange: true, interchangeWith: ["Provincial Bus Terminals (Laguna/Batangas)", "BGC / Makati Buses"] },
      { id: "lrt1-libertad", name: "Libertad", city: "Pasay", lat: 14.5477, lng: 120.9986 },
      { id: "lrt1-edsa", name: "EDSA", city: "Pasay", lat: 14.5386, lng: 121.0006, isInterchange: true, interchangeWith: ["MRT-3 Taft Avenue", "EDSA Carousel"], hasElevator: true },
      { id: "lrt1-baclaran", name: "Baclaran", city: "Pasay", lat: 14.5342, lng: 120.9983, notes: "Baclaran Church & Market" },
      // Cavite Extension Phase 1 (Opened Nov 2024 / Operating)
      { id: "lrt1-redemptorist", name: "Redemptorist - Aseana", city: "Parañaque", lat: 14.5244, lng: 120.9922, isExtension: true, hasElevator: true, notes: "Aseana City & Entertainment City" },
      { id: "lrt1-mia", name: "Manila International Airport (MIA)", city: "Parañaque", lat: 14.5126, lng: 120.9904, isExtension: true, hasElevator: true, notes: "Near NAIA Complex" },
      { id: "lrt1-pitx", name: "Asia World - PITX", city: "Parañaque", lat: 14.5098, lng: 120.9901, isInterchange: true, isExtension: true, interchangeWith: ["PITX Integrated Busway", "EDSA Carousel"], hasElevator: true },
      { id: "lrt1-ninoy", name: "Ninoy Aquino", city: "Parañaque", lat: 14.5002, lng: 120.9903, isExtension: true, hasElevator: true },
      { id: "lrt1-drsantos", name: "Dr. Santos (Sucat)", city: "Parañaque", lat: 14.4883, lng: 120.9905, isExtension: true, hasElevator: true, notes: "Southern Terminus at Sucat Road" },
    ],
  },
  {
    id: "mrt3",
    name: "MRT-3 (Yellow / EDSA Line)",
    shortName: "MRT-3",
    operator: "Department of Transportation (DOTr MRT-3)",
    color: "#eab308",
    accentBg: "#422006",
    badgeBorder: "#ca8a04",
    status: "Active",
    hotline: "(02) 8929-5347 loc. 2303",
    accessibilityNotice: "Elevators & escalators available across EDSA stations per DOTr MRT-3 directory. For priority boarding or elevator help, approach platform marshals or call (02) 8929-5347.",
    terminalFrom: "North Avenue",
    terminalTo: "Taft Avenue",
    firstTrain: "4:36 AM (North Ave) / 5:18 AM (Taft)",
    lastTrain: "10:10 PM (North Ave) / 10:45 PM (Taft)",
    headwayMinutes: "3.5 - 4 mins",
    fareBeep: "₱13.00 - ₱28.00",
    fareSJT: "₱13.00 - ₱28.00",
    discountNote: "20% Discount for PWD, Senior & Student",
    stations: [
      { id: "mrt3-north", name: "North Avenue", city: "Quezon City", lat: 14.6521, lng: 121.0322, isInterchange: true, interchangeWith: ["Trinoma / SM North", "EDSA Carousel", "Unified Grand Central"], hasElevator: true },
      { id: "mrt3-qave", name: "Quezon Avenue", city: "Quezon City", lat: 14.6428, lng: 121.0384, isInterchange: true, interchangeWith: ["Eton Centris", "EDSA Carousel"], hasElevator: true },
      { id: "mrt3-gma", name: "GMA - Kamuning", city: "Quezon City", lat: 14.6353, lng: 121.0433, notes: "GMA Network Center & Timog Ave" },
      { id: "mrt3-cubao", name: "Araneta Center - Cubao", city: "Quezon City", lat: 14.6195, lng: 121.0526, isInterchange: true, interchangeWith: ["LRT-2 Cubao (via Gateway Mall)", "Provincial Buses"], hasElevator: true },
      { id: "mrt3-santolan", name: "Santolan - Annapolis", city: "Quezon City / San Juan", lat: 14.6078, lng: 121.0564, notes: "Camp Aguinaldo & Camp Crame" },
      { id: "mrt3-ortigas", name: "Ortigas", city: "Mandaluyong", lat: 14.5878, lng: 121.0567, isInterchange: true, interchangeWith: ["SM Megamall", "Robinsons Galleria", "EDSA Carousel"], hasElevator: true },
      { id: "mrt3-shaw", name: "Shaw Boulevard", city: "Mandaluyong", lat: 14.5812, lng: 121.0536, notes: "Shangri-La Plaza & Greenfield District" },
      { id: "mrt3-boni", name: "Boni", city: "Mandaluyong", lat: 14.5739, lng: 121.0482, notes: "Robinsons Cybergate & Pioneer St" },
      { id: "mrt3-guadalupe", name: "Guadalupe", city: "Makati", lat: 14.5672, lng: 121.0456, isInterchange: true, interchangeWith: ["Pasig River Ferry", "Taguig / BGC Jeeps"], hasElevator: true },
      { id: "mrt3-buendia", name: "Buendia", city: "Makati", lat: 14.5543, lng: 121.0349, notes: "Makati CBD / Kalayaan Avenue" },
      { id: "mrt3-ayala", name: "Ayala", city: "Makati", lat: 14.5492, lng: 121.0280, isInterchange: true, interchangeWith: ["One Ayala Terminal", "BGC Bus", "EDSA Carousel"], hasElevator: true },
      { id: "mrt3-magallanes", name: "Magallanes", city: "Makati", lat: 14.5420, lng: 121.0195, isInterchange: true, interchangeWith: ["PNR EDSA Station", "SLEX PUVs"] },
      { id: "mrt3-taft", name: "Taft Avenue", city: "Pasay", lat: 14.5376, lng: 121.0014, isInterchange: true, interchangeWith: ["LRT-1 EDSA Station", "EDSA Carousel"], hasElevator: true },
    ],
  },
  {
    id: "lrt2",
    name: "LRT-2 (Purple Line)",
    shortName: "LRT-2",
    operator: "Light Rail Transit Authority (LRTA)",
    color: "#a855f7",
    accentBg: "#3b0764",
    badgeBorder: "#9333ea",
    status: "Active",
    hotline: "(02) 8647-3452 / 0917-3253452",
    accessibilityNotice: "Passenger Assistance Offices (PAO), tactile tiles & elevators provided per LRTA directory. For elevator or wheelchair escort, contact (02) 8647-3452 or talk to station tellers.",
    terminalFrom: "Recto",
    terminalTo: "Antipolo",
    firstTrain: "5:00 AM",
    lastTrain: "9:30 PM (Recto) / 9:00 PM (Antipolo)",
    headwayMinutes: "5 - 7 mins",
    fareBeep: "₱15.00 - ₱33.00",
    fareSJT: "₱16.00 - ₱33.00",
    discountNote: "20% Discount for PWD, Senior & Student",
    stations: [
      { id: "lrt2-recto", name: "Recto", city: "Manila", lat: 14.6035, lng: 120.9840, isInterchange: true, interchangeWith: ["LRT-1 Doroteo Jose", "University Belt"], hasElevator: true },
      { id: "lrt2-legarda", name: "Legarda", city: "Manila", lat: 14.6009, lng: 120.9926, notes: "Mendiola, San Beda, CEU & Malacañang" },
      { id: "lrt2-pureza", name: "Pureza", city: "Manila", lat: 14.6015, lng: 121.0051, isInterchange: true, interchangeWith: ["PUP Sta. Mesa", "PNR Santa Mesa"] },
      { id: "lrt2-vmapa", name: "V. Mapa", city: "Manila", lat: 14.6040, lng: 121.0171, notes: "SM City Sta. Mesa & UERM" },
      { id: "lrt2-jruiz", name: "J. Ruiz", city: "San Juan", lat: 14.6106, lng: 121.0261, notes: "San Juan City Hall & Pinaglabanan" },
      { id: "lrt2-gilmore", name: "Gilmore", city: "Quezon City", lat: 14.6135, lng: 121.0342, notes: "IT & Computer hardware district, St. Paul QC" },
      { id: "lrt2-betty", name: "Betty Go-Belmonte", city: "Quezon City", lat: 14.6186, lng: 121.0427 },
      { id: "lrt2-cubao", name: "Araneta Center - Cubao", city: "Quezon City", lat: 14.6225, lng: 121.0531, isInterchange: true, interchangeWith: ["MRT-3 Cubao", "Gateway Mall"], hasElevator: true },
      { id: "lrt2-anonas", name: "Anonas", city: "Quezon City", lat: 14.6281, lng: 121.0647, notes: "Near Project 4 & future Subway interchange" },
      { id: "lrt2-katipunan", name: "Katipunan", city: "Quezon City", lat: 14.6309, lng: 121.0728, notes: "Underground station. Ateneo, Miriam, UP Diliman" },
      { id: "lrt2-santolan", name: "Santolan", city: "Pasig / Marikina", lat: 14.6221, lng: 121.0858, hasElevator: true },
      { id: "lrt2-marikina", name: "Marikina - Pasig", city: "Marikina", lat: 14.6203, lng: 121.1001, isExtension: true, notes: "Robinsons Metro East & Sta. Lucia Mall", hasElevator: true },
      { id: "lrt2-antipolo", name: "Antipolo (Masinag)", city: "Antipolo, Rizal", lat: 14.6247, lng: 121.1213, isExtension: true, notes: "Eastern Terminus at Marcos Highway", hasElevator: true },
    ],
  },
  {
    id: "mrt7",
    name: "MRT-7 (Northeast Line)",
    shortName: "MRT-7",
    operator: "San Miguel Corporation (SMC) & DOTr",
    color: "#ef4444",
    accentBg: "#450a0a",
    badgeBorder: "#dc2626",
    status: "Under Construction",
    targetDate: "Target: Q2 2027 (Partial) / 2028 (Full)",
    constructionNotice: "UNDER CONSTRUCTION — DOTr targets Q2 2027 partial opening for first 12 stations (North Ave to Sacred Heart), and 2028 full completion to Tala & San Jose del Monte.",
    hotline: "DOTr Action Center: 8888",
    accessibilityNotice: "All 14 stations are designed with PWD ramps, elevators, and accessibility corridors as mandated by BP 344 (Accessibility Law).",
    terminalFrom: "Unified Grand Central Station (North Ave)",
    terminalTo: "San Jose del Monte (Bulacan)",
    firstTrain: "5:00 AM (Target)",
    lastTrain: "10:00 PM (Target)",
    headwayMinutes: "4 - 6 mins",
    fareBeep: "Distance-based (TBD upon opening)",
    fareSJT: "Distance-based (TBD upon opening)",
    discountNote: "20% Discount for PWD, Senior & Student",
    stations: [
      { id: "mrt7-unified", name: "Unified Grand Central Station", city: "Quezon City", lat: 14.6548, lng: 121.0315, isInterchange: true, interchangeWith: ["LRT-1", "MRT-3", "Metro Manila Subway"], hasElevator: true },
      { id: "mrt7-qmc", name: "Quezon Memorial Circle", city: "Quezon City", lat: 14.6515, lng: 121.0494, notes: "QC Hall & Elliptical Road" },
      { id: "mrt7-univeave", name: "University Avenue", city: "Quezon City", lat: 14.6545, lng: 121.0620, notes: "UP Diliman CP Garcia Gate" },
      { id: "mrt7-tsora", name: "Tandang Sora", city: "Quezon City", lat: 14.6653, lng: 121.0701, notes: "Commonwealth Avenue" },
      { id: "mrt7-dantonio", name: "Don Antonio", city: "Quezon City", lat: 14.6811, lng: 121.0820, notes: "Ever Gotesco Commonwealth" },
      { id: "mrt7-batasan", name: "Batasan", city: "Quezon City", lat: 14.6953, lng: 121.0967, notes: "House of Representatives" },
      { id: "mrt7-manggahan", name: "Manggahan", city: "Quezon City", lat: 14.7072, lng: 121.1011 },
      { id: "mrt7-dcarmen", name: "Doña Carmen", city: "Quezon City", lat: 14.7189, lng: 121.0962 },
      { id: "mrt7-regalado", name: "Regalado Highway", city: "Quezon City", lat: 14.7266, lng: 121.0855, notes: "Fairview Center Mall" },
      { id: "mrt7-mindanao", name: "Mindanao Avenue", city: "Quezon City", lat: 14.7350, lng: 121.0711, notes: "SM City Fairview & Robinsons Novaliches", hasElevator: true },
      { id: "mrt7-quirino", name: "Quirino", city: "Quezon City", lat: 14.7431, lng: 121.0682 },
      { id: "mrt7-sacred", name: "Sacred Heart", city: "Caloocan (North)", lat: 14.7578, lng: 121.0776, notes: "Last station of Phase 1 partial opening" },
      { id: "mrt7-tala", name: "Tala", city: "Caloocan (North)", lat: 14.7712, lng: 121.0841, notes: "Full opening segment (Target 2028)" },
      { id: "mrt7-sjdm", name: "San Jose del Monte", city: "SJDM, Bulacan", lat: 14.7924, lng: 121.0921, notes: "Northern Terminus (Target 2028)" },
    ],
  },
  {
    id: "mrt9",
    name: "Metro Manila Subway (MRT-9)",
    shortName: "Subway",
    operator: "Department of Transportation (DOTr)",
    color: "#06b6d4",
    accentBg: "#083344",
    badgeBorder: "#0891b2",
    status: "Under Construction",
    targetDate: "Target: Q1 2028 Demo Run / 2031-2032 Full",
    constructionNotice: "UNDER CONSTRUCTION — 33km underground rail system. DOTr targets Q1 2028 demo run (Valenzuela to Quirino Ave) and full completion to NAIA by ~2031–2032.",
    hotline: "DOTr Action Center: 8888",
    accessibilityNotice: "State-of-the-art barrier-free underground stations featuring dual elevators, level boarding, and PWD tactile surfaces throughout.",
    terminalFrom: "East Valenzuela Depot",
    terminalTo: "NAIA Terminal 3 (Pasay)",
    firstTrain: "5:00 AM (Target)",
    lastTrain: "11:00 PM (Target)",
    headwayMinutes: "3 - 5 mins",
    fareBeep: "Distance-based (TBD upon opening)",
    fareSJT: "Distance-based (TBD upon opening)",
    discountNote: "20% Discount for PWD, Senior & Student",
    stations: [
      { id: "subway-evalenzuela", name: "East Valenzuela (Depot)", city: "Valenzuela", lat: 14.6972, lng: 121.0022 },
      { id: "subway-quirinohwy", name: "Quirino Highway", city: "Quezon City", lat: 14.6781, lng: 121.0125 },
      { id: "subway-tsora", name: "Tandang Sora", city: "Quezon City", lat: 14.6644, lng: 121.0253 },
      { id: "subway-north", name: "North Avenue (Grand Central)", city: "Quezon City", lat: 14.6548, lng: 121.0315, isInterchange: true, interchangeWith: ["LRT-1", "MRT-3", "MRT-7"] },
      { id: "subway-qave", name: "Quezon Avenue", city: "Quezon City", lat: 14.6432, lng: 121.0381, isInterchange: true, interchangeWith: ["MRT-3 Quezon Ave"] },
      { id: "subway-eastave", name: "East Avenue", city: "Quezon City", lat: 14.6378, lng: 121.0494, notes: "Near East Ave Medical Center & Heart Center" },
      { id: "subway-anonas", name: "Anonas", city: "Quezon City", lat: 14.6284, lng: 121.0651, isInterchange: true, interchangeWith: ["LRT-2 Anonas"] },
      { id: "subway-aguinaldo", name: "Camp Aguinaldo", city: "Quezon City", lat: 14.6062, lng: 121.0632 },
      { id: "subway-ortigas", name: "Ortigas", city: "Pasig", lat: 14.5866, lng: 121.0641, notes: "Meralco Ave / Ortigas Center" },
      { id: "subway-shaw", name: "Shaw Boulevard", city: "Mandaluyong / Pasig", lat: 14.5772, lng: 121.0620 },
      { id: "subway-kalayaan", name: "Kalayaan Avenue", city: "Makati", lat: 14.5621, lng: 121.0543, notes: "Near BGC North" },
      { id: "subway-bgc", name: "BGC (High Street / Market Market)", city: "Taguig", lat: 14.5492, lng: 121.0556, notes: "Heart of Bonifacio Global City" },
      { id: "subway-lawton", name: "Lawton", city: "Taguig", lat: 14.5361, lng: 121.0422 },
      { id: "subway-senate", name: "Senate - DepEd", city: "Pasay / Taguig", lat: 14.5244, lng: 121.0311 },
      { id: "subway-naia3", name: "NAIA Terminal 3", city: "Pasay", lat: 14.5202, lng: 121.0152, isInterchange: true, interchangeWith: ["Ninoy Aquino International Airport T3"], hasElevator: true },
    ],
  },
];
