export const GLOBAL_LANGUAGES = [
  'English',
  'Hindi',
  'Punjabi',
  'Urdu',
  'Bengali',
  'Arabic',
  'Spanish',
  'French',
  'German',
  'Mandarin Chinese',
  'Japanese',
  'Russian',
  'Portuguese',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Malayalam',
  'Kannada',
  'Tagalog / Filipino',
  'Vietnamese',
  'Indonesian',
  'Turkish',
  'Italian',
  'Korean',
  'Swahili',
  'Nepali',
  'Sinhala',
  'Thai',
  'Dutch'
];

export const POPULAR_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', label: '₹ (INR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', label: '$ (USD)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', label: 'AED' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)', label: 'SAR' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', label: '€ (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', label: '£ (GBP)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', label: 'CA$ (CAD)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AUD)', label: 'AU$ (AUD)' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar (SGD)', label: 'SG$ (SGD)' },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal (QAR)', label: 'QAR' },
  { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar (KWD)', label: 'KWD' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial (OMR)', label: 'OMR' }
];

export const COMMON_SKILLS_SUGGESTIONS: Record<string, string[]> = {
  default: [
    'Communication',
    'Customer Service',
    'Problem Solving',
    'Teamwork',
    'Time Management',
    'Microsoft Excel',
    'Attention to Detail'
  ],
  healthcare: [
    'Patient Care',
    'BLS / ACLS Safety',
    'Medication Administration',
    'Vital Signs Monitoring',
    'Electronic Health Records (EHR)',
    'IV Cannulation',
    'Wound Dressing',
    'Emergency Triage'
  ],
  it: [
    'JavaScript / TypeScript',
    'React.js',
    'Node.js',
    'Python',
    'SQL / Databases',
    'AWS / Cloud Computing',
    'Docker & CI/CD',
    'Git Version Control',
    'API Integration',
    'IT Troubleshooting'
  ],
  construction: [
    'Electrical Wiring',
    'Lockout / Tagout (LOTO)',
    'Plumbing & Pipefitting',
    'Welding (MIG/TIG/ARC)',
    'HVAC Maintenance',
    'Blueprint Reading',
    'Power Tool Safety',
    'Masonry & Finishing'
  ],
  logistics: [
    'Commercial Driving',
    'Heavy Vehicle Navigation',
    'Warehouse Operations',
    'Inventory Management',
    'Forklift Operation',
    'Route Optimization',
    'Fleet Maintenance',
    'Dispatching'
  ],
  manufacturing: [
    'CNC Machine Operation',
    'Quality Control / Inspection',
    'Preventative Maintenance',
    'Assembly Line',
    'Lean Manufacturing / 5S',
    'Mechanical Troubleshooting'
  ],
  hospitality: [
    'Guest Relations',
    'Food Safety & Hygiene',
    'Culinary Skills',
    'POS Systems',
    'Housekeeping Operations',
    'Event Coordination',
    'Barista & Beverage Prep'
  ],
  education: [
    'Curriculum Planning',
    'Classroom Management',
    'Online Teaching Tools',
    'Student Assessment',
    'Special Education Support',
    'Parent-Teacher Communication'
  ]
};
