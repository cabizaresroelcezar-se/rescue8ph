/**
 * Single source of truth for verified company information.
 * Facts gathered from public sources, including:
 *  - facebook.com/rescue8tradingphils
 *  - worldplaces.me listing for Rescue 8 Trading Philippines, Inc.
 *  - LinkedIn (Allan Cabizares)
 * Update here when official facts change.
 */
export const site = {
  brand: {
    legalName: "Rescue 8 Trading Philippines, Inc.",
    shortName: "Rescue 8 Philippines",
    tagline: "EMS and Rescue Equipment",
    founded: "February 2012",
    registration: "DTI Registered",
  },

  contact: {
    address: {
      line1: "Unit G4 #65 Malac cor Gasan Street",
      line2: "Brgy Masambong, Quezon City, 1115 Metro Manila, Philippines",
    },
    phone: {
      label: "(02) 622-9565",
      tel: "+6326229565",
      mobile: "+639178946055",
    },
    email: "info@rescue8ph.com",
    hours: {
      weekday: "Monday–Friday  08:00–20:00",
      saturday: "Saturday  08:00–17:00",
      sunday: "Closed",
    },
    social: {
      facebook: "https://www.facebook.com/rescue8tradingphils",
    },
  },

  founder: {
    name: "Allan Cabizares",
    title: "Founder & Sole Proprietor",
    credentials: [
      "Emergency Medical Technician — UP-PGH, 2002",
      "International Trauma Life Support (ITLS) Advanced Provider Course Instructor",
      "Level 9 Instructor, American Safety & Health Institute (ASHI)",
      "Training Officer, Fire Emergency Paramedic Assistance Group (Quezon City)",
    ],
  },

  customerSegments: [
    { name: "Bureau of Fire Protection",         abbr: "BFP" },
    { name: "Philippine National Police",        abbr: "PNP" },
    { name: "Armed Forces of the Philippines",   abbr: "AFP" },
    { name: "Philippine Red Cross",              abbr: "PRC" },
    { name: "Local Government Units",            abbr: "LGUs" },
    { name: "Hospitals & Clinics",               abbr: "H&C" },
    { name: "Schools & Universities",            abbr: "S&U" },
    { name: "Private Companies & NGOs",          abbr: "PRV" },
  ],

  trainingPrograms: [
    { title: "CPR & First Aid",              blurb: "Adult, child, and infant CPR with AED, choking, bleeding control, and basic first response." },
    { title: "BLS for Healthcare Workers",   blurb: "Basic Life Support certification aligned with American Heart Association standards." },
    { title: "Stop the Bleed",               blurb: "National Stop the Bleed campaign — tourniquets, wound packing, pressure dressings." },
    { title: "Fire Extinguisher Training",   blurb: "Hands-on use of portable extinguishers, classes A through K, and evacuation drills." },
    { title: "Active Shooter / Workplace Violence", blurb: "Run-Hide-Fight framework, situational awareness, and emergency response coordination." },
    { title: "Shelter-in-Place, Evacuation & Weather/Natural Disaster", blurb: "Earthquake, typhoon, and flood response procedures for office and field teams." },
  ],

  stats: [
    { value: "13+",  label: "Years of Service",       sub: "DTI-registered since 2012" },
    { value: "8",    label: "Customer Segments",      sub: "Gov, military, civilian, NGO" },
    { value: "6",    label: "Training Programs",      sub: "ASHI-aligned curriculum" },
    { value: "100%", label: "Philippine Coverage",    sub: "Nationwide shipping" },
  ],
} as const;
