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
        line1: "156B Wayan St. Brgy. Masambong",
        line2: "Quezon City, Quezon City, Philippines, 1115",
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
          instagram: "https://www.instagram.com/",
        },
  },

  founder: {
      name: "Allan Cabizares",
      title: "Founder & Sole Proprietor",
      credentials: [
        "Emergency medical services practitioner based in Quezon City",
        "Founder of Rescue 8 Trading Philippines, Inc. since 2012",
        "Equipment supplier and training provider for first responders, LGUs, and private companies",
      ],
    },

  customerSegments: [
      { name: "Local Government Units",            abbr: "LGUs" },
      { name: "Hospitals & Clinics",               abbr: "H&C" },
      { name: "Schools & Universities",            abbr: "S&U" },
      { name: "Private Companies & NGOs",          abbr: "PRV" },
    ],

  trainingPrograms: [
      { title: "CPR & First Aid",              blurb: "Hands-on adult, child, and infant CPR with AED, choking response, bleeding control, and basic first response." },
      { title: "First Aid Basics",             blurb: "Foundational first-aid skills for workplaces, schools, and community responders." },
      { title: "Stop the Bleed",               blurb: "Tourniquets, wound packing, and pressure dressings for severe bleeding emergencies." },
      { title: "Fire Extinguisher Training",   blurb: "Hands-on use of portable extinguishers, fire classes, and evacuation drills." },
      { title: "Disaster Preparedness",        blurb: "Earthquake, typhoon, and flood response procedures for office and field teams." },
      { title: "Workplace Safety & Response",  blurb: "Evacuation, shelter-in-place, and emergency coordination for office and industrial sites." },
    ],

  stats: [
      { value: "13+",  label: "Years of Service",       sub: "DTI-registered since 2012" },
      { value: "4",    label: "Customer Segments",      sub: "LGUs, hospitals, schools, private" },
      { value: "6",    label: "Training Programs",      sub: "CPR, first-aid, safety and more" },
    { value: "100%", label: "Philippine Coverage",    sub: "Nationwide shipping" },
  ],
} as const;
