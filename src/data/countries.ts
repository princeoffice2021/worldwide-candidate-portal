import { CountryCode } from '../types';

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'IN', name: 'India', dial_code: '+91', flag: '🇮🇳', admin1_label: 'State / Union Territory', admin2_label: 'District / City', admin3_label: 'Tehsil / Taluka / Block' },
  { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸', admin1_label: 'State', admin2_label: 'County / Metro', admin3_label: 'City / Township' },
  { code: 'AE', name: 'United Arab Emirates', dial_code: '+971', flag: '🇦🇪', admin1_label: 'Emirate', admin2_label: 'City / Area', admin3_label: 'District' },
  { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦', admin1_label: 'Province / Region', admin2_label: 'Governorate / City', admin3_label: 'District' },
  { code: 'CA', name: 'Canada', dial_code: '+1', flag: '🇨🇦', admin1_label: 'Province / Territory', admin2_label: 'Regional Municipality / City', admin3_label: 'Township / Area' },
  { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧', admin1_label: 'Country / Region', admin2_label: 'County / Borough', admin3_label: 'Town / District' },
  { code: 'AU', name: 'Australia', dial_code: '+61', flag: '🇦🇺', admin1_label: 'State / Territory', admin2_label: 'Region / City', admin3_label: 'LGA / Suburb' },
  { code: 'NP', name: 'Nepal', dial_code: '+977', flag: '🇳🇵', admin1_label: 'Province', admin2_label: 'District', admin3_label: 'Municipality / Gaunpalika' },
  { code: 'PK', name: 'Pakistan', dial_code: '+92', flag: '🇵🇰', admin1_label: 'Province / Region', admin2_label: 'Division / District', admin3_label: 'Tehsil' },
  { code: 'BD', name: 'Bangladesh', dial_code: '+880', flag: '🇧🇩', admin1_label: 'Division', admin2_label: 'District', admin3_label: 'Upazila' },
  { code: 'QA', name: 'Qatar', dial_code: '+974', flag: '🇶🇦', admin1_label: 'Municipality', admin2_label: 'Zone / City', admin3_label: 'Area' },
  { code: 'KW', name: 'Kuwait', dial_code: '+965', flag: '🇰🇼', admin1_label: 'Governorate', admin2_label: 'Area / City', admin3_label: 'Block' },
  { code: 'OM', name: 'Oman', dial_code: '+968', flag: '🇴🇲', admin1_label: 'Governorate', admin2_label: 'Wilayat', admin3_label: 'Town' },
  { code: 'BH', name: 'Bahrain', dial_code: '+973', flag: '🇧🇭', admin1_label: 'Governorate', admin2_label: 'City / Area', admin3_label: 'Block' },
  { code: 'SG', name: 'Singapore', dial_code: '+65', flag: '🇸🇬', admin1_label: 'Region', admin2_label: 'Planning Area', admin3_label: 'Subzone' },
  { code: 'MY', name: 'Malaysia', dial_code: '+60', flag: '🇲🇾', admin1_label: 'State / Federal Territory', admin2_label: 'District', admin3_label: 'Mukim / Town' },
  { code: 'ZA', name: 'South Africa', dial_code: '+27', flag: '🇿🇦', admin1_label: 'Province', admin2_label: 'District Municipality', admin3_label: 'Local Municipality / Town' },
  { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪', admin1_label: 'Federal State (Bundesland)', admin2_label: 'District (Landkreis)', admin3_label: 'Municipality (Gemeinde)' },
  { code: 'FR', name: 'France', dial_code: '+33', flag: '🇫🇷', admin1_label: 'Region', admin2_label: 'Department', admin3_label: 'Commune / City' },
  { code: 'ES', name: 'Spain', dial_code: '+34', flag: '🇪🇸', admin1_label: 'Autonomous Community', admin2_label: 'Province', admin3_label: 'Municipality' },
  { code: 'IT', name: 'Italy', dial_code: '+39', flag: '🇮🇹', admin1_label: 'Region', admin2_label: 'Province / Metropolitan City', admin3_label: 'Comune' },
  { code: 'PH', name: 'Philippines', dial_code: '+63', flag: '🇵🇭', admin1_label: 'Region', admin2_label: 'Province / HUC', admin3_label: 'City / Municipality' },
  { code: 'LK', name: 'Sri Lanka', dial_code: '+94', flag: '🇱🇰', admin1_label: 'Province', admin2_label: 'District', admin3_label: 'DS Division' },
  { code: 'NZ', name: 'New Zealand', dial_code: '+64', flag: '🇳🇿', admin1_label: 'Region', admin2_label: 'Territorial Authority / City', admin3_label: 'Suburb / Locality' },
  { code: 'NG', name: 'Nigeria', dial_code: '+234', flag: '🇳🇬', admin1_label: 'State / FCT', admin2_label: 'LGA', admin3_label: 'Ward / Town' },
  { code: 'KE', name: 'Kenya', dial_code: '+254', flag: '🇰🇪', admin1_label: 'County', admin2_label: 'Sub-County', admin3_label: 'Ward / Location' },
  { code: 'BR', name: 'Brazil', dial_code: '+55', flag: '🇧🇷', admin1_label: 'State', admin2_label: 'Municipality', admin3_label: 'District / Neighborhood' },
];

// Sample cascading locations for high-density areas (with fallback manual input available for all)
export const SAMPLE_ADMIN1_DATA: Record<string, string[]> = {
  IN: [
    'Rajasthan', 'Punjab', 'Haryana', 'Delhi (UT)', 'Uttar Pradesh', 'Maharashtra', 
    'Gujarat', 'Madhya Pradesh', 'Bihar', 'West Bengal', 'Karnataka', 'Tamil Nadu', 
    'Telangana', 'Kerala', 'Andhra Pradesh', 'Assam', 'Himachal Pradesh', 'Jammu & Kashmir', 'Other State'
  ],
  US: [
    'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'Washington', 'Other State'
  ],
  AE: [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ],
  SA: [
    'Riyadh Region', 'Makkah Region', 'Eastern Province', 'Madinah Region', 'Asir Region', 'Tabuk Region', 'Qassim Region'
  ],
  CA: [
    'Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia'
  ],
  GB: [
    'Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire', 'Scotland', 'Wales', 'Northern Ireland'
  ],
  AU: [
    'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'ACT'
  ],
  NP: [
    'Bagmati Province', 'Koshi Province', 'Madhesh Province', 'Gandaki Province', 'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province'
  ],
  PK: [
    'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Azad Kashmir'
  ],
  BD: [
    'Dhaka Division', 'Chittagong Division', 'Rajshahi Division', 'Khulna Division', 'Sylhet Division', 'Rangpur Division', 'Barisal Division'
  ]
};

export const SAMPLE_ADMIN2_DATA: Record<string, Record<string, string[]>> = {
  IN: {
    'Rajasthan': ['Sri Ganganagar', 'Hanumangarh', 'Bikaner', 'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Alwar', 'Churu', 'Jhunjhunu', 'Nagaur', 'Barmer', 'Pali', 'Sikar', 'Other District'],
    'Punjab': ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Fazilka', 'Muktsar', 'Mohali (SAS Nagar)', 'Hoshiarpur', 'Gurdaspur', 'Other District'],
    'Haryana': ['Sirsa', 'Fatehabad', 'Hisar', 'Gurugram', 'Faridabad', 'Ambala', 'Karnal', 'Panipat', 'Rohtak', 'Other District'],
    'Delhi (UT)': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'South West Delhi']
  },
  AE: {
    'Dubai': ['Deira', 'Bur Dubai', 'Downtown Dubai', 'Jumeira', 'Al Quoz', 'Jebel Ali', 'International City', 'Dubai Silicon Oasis'],
    'Abu Dhabi': ['Abu Dhabi City', 'Al Ain', 'Al Dhafra', 'Mussafah'],
    'Sharjah': ['Sharjah City', 'Khor Fakkan', 'Kalba']
  },
  SA: {
    'Riyadh Region': ['Riyadh City', 'Al Kharj', 'Al Diriyah', 'Al Majmaah'],
    'Makkah Region': ['Jeddah', 'Makkah City', 'Taif', 'Rabigh'],
    'Eastern Province': ['Dammam', 'Khobar', 'Jubail', 'Al Ahsa']
  }
};
