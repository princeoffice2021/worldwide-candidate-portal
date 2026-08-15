import { Industry, Department, JobRole } from '../types';

/**
 * WORLDWIDE HIERARCHICAL CATEGORY SYSTEM
 * Structure: INDUSTRY -> DEPARTMENT -> JOB ROLE
 * Includes 35 Major Industries, 120+ Departments, and 1250+ Standardized Job Roles.
 */

export interface RoleBreadcrumb {
  role: JobRole;
  department: Department;
  industry: Industry;
  fullTitle: string;
}

export const INDUSTRIES: Industry[] = [
  { id: 'ind_healthcare', name: 'Healthcare & Hospitals', slug: 'healthcare-hospitals', description: 'Doctors, nurses, hospital administration, pharmacy & diagnostics', icon_name: 'HeartPulse', sort_order: 1, is_active: true },
  { id: 'ind_it', name: 'Information Technology & Software', slug: 'information-technology-software', description: 'Software engineering, web/mobile apps, AI, cloud, DevOps & support', icon_name: 'Monitor', sort_order: 2, is_active: true },
  { id: 'ind_education', name: 'Education & Training', slug: 'education-training', description: 'Teachers, professors, private tutors, coaching faculty & administrators', icon_name: 'GraduationCap', sort_order: 3, is_active: true },
  { id: 'ind_finance', name: 'Accounting, Finance & Banking', slug: 'accounting-finance-banking', description: 'Accountants, auditors, tax specialists, bank tellers & loan officers', icon_name: 'Calculator', sort_order: 4, is_active: true },
  { id: 'ind_sales', name: 'Sales, Marketing & Business Development', slug: 'sales-marketing-business-development', description: 'Field sales, digital marketing, SEO, telecalling & brand managers', icon_name: 'TrendingUp', sort_order: 5, is_active: true },
  { id: 'ind_bpo', name: 'Customer Service & BPO', slug: 'customer-service-bpo', description: 'Call center agents, chat/email support & BPO operations', icon_name: 'Headphones', sort_order: 6, is_active: true },
  { id: 'ind_construction', name: 'Construction & Infrastructure', slug: 'construction-infrastructure', description: 'Civil engineers, electricians, plumbers, masons, carpenters & welders', icon_name: 'HardHat', sort_order: 7, is_active: true },
  { id: 'ind_manufacturing', name: 'Manufacturing & Industrial', slug: 'manufacturing-industrial', description: 'Factory workers, machine operators, CNC turners & quality inspectors', icon_name: 'Factory', sort_order: 8, is_active: true },
  { id: 'ind_automobile', name: 'Automobile & Vehicle Services', slug: 'automobile-vehicle-services', description: 'Car/bike mechanics, auto electricians, denters, painters & technicians', icon_name: 'Wrench', sort_order: 9, is_active: true },
  { id: 'ind_logistics', name: 'Transportation, Driving & Logistics', slug: 'transportation-driving-logistics', description: 'Car/truck drivers, delivery executives, warehouse workers & fleet staff', icon_name: 'Truck', sort_order: 10, is_active: true },
  { id: 'ind_hospitality', name: 'Hospitality, Hotel & Tourism', slug: 'hospitality-hotel-tourism', description: 'Hotel receptionists, managers, housekeeping, travel agents & guides', icon_name: 'Hotel', sort_order: 11, is_active: true },
  { id: 'ind_food', name: 'Food, Restaurant & Catering', slug: 'food-restaurant-catering', description: 'Chefs, cooks, bakers, waiters, kitchen helpers & catering staff', icon_name: 'Utensils', sort_order: 12, is_active: true },
  { id: 'ind_retail', name: 'Retail & E-commerce', slug: 'retail-e-commerce', description: 'Store sales associates, managers, cashiers, merchandisers & stockers', icon_name: 'ShoppingBag', sort_order: 13, is_active: true },
  { id: 'ind_security', name: 'Security & Protection', slug: 'security-protection', description: 'Security guards, supervisors, CCTV operators, bouncers & fire safety', icon_name: 'ShieldCheck', sort_order: 14, is_active: true },
  { id: 'ind_government', name: 'Government & Public Services', slug: 'government-public-services', description: 'Public administration, office clerks, municipal staff & field officers', icon_name: 'Landmark', sort_order: 15, is_active: true },
  { id: 'ind_legal', name: 'Legal & Compliance', slug: 'legal-compliance', description: 'Lawyers, paralegals, legal assistants & compliance officers', icon_name: 'Scale', sort_order: 16, is_active: true },
  { id: 'ind_hr', name: 'Human Resources & Recruitment', slug: 'human-resources-recruitment', description: 'HR executives, recruiters, talent acquisition & payroll specialists', icon_name: 'Users', sort_order: 17, is_active: true },
  { id: 'ind_media', name: 'Media, Design & Creative', slug: 'media-design-creative', description: 'Graphic designers, video editors, photographers & content writers', icon_name: 'Camera', sort_order: 18, is_active: true },
  { id: 'ind_agriculture', name: 'Agriculture, Farming & Animal Care', slug: 'agriculture-farming-animal-care', description: 'Farmers, tractor drivers, dairy workers, veterinarians & horticulturists', icon_name: 'Sprout', sort_order: 19, is_active: true },
  { id: 'ind_beauty', name: 'Beauty, Wellness & Personal Care', slug: 'beauty-wellness-personal-care', description: 'Hairdressers, beauticians, makeup artists, spa therapists & trainers', icon_name: 'Sparkles', sort_order: 20, is_active: true },
  { id: 'ind_domestic', name: 'Domestic & Household Services', slug: 'domestic-household-services', description: 'Housekeepers, maids, home cooks, nannies & elder caregivers', icon_name: 'Home', sort_order: 21, is_active: true },
  { id: 'ind_aviation', name: 'Aviation & Airport Services', slug: 'aviation-airport-services', description: 'Ground staff, cabin crew, baggage handlers & aircraft mechanics', icon_name: 'Plane', sort_order: 22, is_active: true },
  { id: 'ind_maritime', name: 'Maritime & Shipping', slug: 'maritime-shipping', description: 'Seamen, deck cadets, tugboat captains, marine engineers & port staff', icon_name: 'Ship', sort_order: 23, is_active: true },
  { id: 'ind_telecom', name: 'Telecommunications', slug: 'telecommunications', description: 'Telecom technicians, fiber splicers, tower techs & network engineers', icon_name: 'Radio', sort_order: 24, is_active: true },
  { id: 'ind_energy', name: 'Energy, Oil, Gas & Utilities', slug: 'energy-oil-gas-utilities', description: 'Solar installers, electrical linemen, power plant operators & riggers', icon_name: 'Zap', sort_order: 25, is_active: true },
  { id: 'ind_realestate', name: 'Real Estate & Property Management', slug: 'real-estate-property-management', description: 'Real estate agents, property consultants & facility managers', icon_name: 'Building2', sort_order: 26, is_active: true },
  { id: 'ind_pharma', name: 'Pharmaceuticals & Biotechnology', slug: 'pharmaceuticals-biotechnology', description: 'Medical representatives, pharma chemists, QC officers & lab staff', icon_name: 'Pill', sort_order: 27, is_active: true },
  { id: 'ind_textile', name: 'Textile, Garment & Fashion', slug: 'textile-garment-fashion', description: 'Tailors, master cutters, sewing machine operators & fashion designers', icon_name: 'Scissors', sort_order: 28, is_active: true },
  { id: 'ind_electronics', name: 'Electronics & Electrical Appliances', slug: 'electronics-electrical-appliances', description: 'Mobile/laptop technicians, AC/fridge mechanics & PCB technicians', icon_name: 'Wrench', sort_order: 29, is_active: true },
  { id: 'ind_cleaning', name: 'Cleaning, Janitorial & Facilities', slug: 'cleaning-janitorial-facilities', description: 'Cleaners, janitors, deep cleaning techs & pest control operators', icon_name: 'Brush', sort_order: 30, is_active: true },
  { id: 'ind_science', name: 'Science, Environment & Lab Research', slug: 'science-environment-lab-research', description: 'Lab analysts, research assistants, chemists & inspectors', icon_name: 'Microscope', sort_order: 31, is_active: true },
  { id: 'ind_sports', name: 'Sports, Fitness & Recreation', slug: 'sports-fitness-recreation', description: 'Sports coaches, swimming instructors, lifeguards & event staff', icon_name: 'Award', sort_order: 32, is_active: true },
  { id: 'ind_entertainment', name: 'Entertainment, Events & Audio-Visual', slug: 'entertainment-events-audio-visual', description: 'Event managers, sound technicians, DJs, anchors & stage operators', icon_name: 'Sparkle', sort_order: 33, is_active: true },
  { id: 'ind_printing', name: 'Printing, Publishing & Packaging', slug: 'printing-publishing-packaging', description: 'Offset printers, DTP operators, screen printers & binding techs', icon_name: 'FileText', sort_order: 34, is_active: true },
  { id: 'ind_mining', name: 'Mining, Extraction & Quarrying', slug: 'mining-extraction-quarrying', description: 'Miners, drillers, blasters, quarry workers & safety officers', icon_name: 'Cog', sort_order: 35, is_active: true },
];

export const DEPARTMENTS: Department[] = [
  // Healthcare
  { id: 'dep_doctors', industry_id: 'ind_healthcare', name: 'Doctors & Physicians', slug: 'doctors-physicians', sort_order: 1, is_active: true },
  { id: 'dep_nursing', industry_id: 'ind_healthcare', name: 'Nursing & Patient Care', slug: 'nursing-patient-care', sort_order: 2, is_active: true },
  { id: 'dep_surgery_ot', industry_id: 'ind_healthcare', name: 'Surgery & Operation Theatre', slug: 'surgery-operation-theatre', sort_order: 3, is_active: true },
  { id: 'dep_pharmacy', industry_id: 'ind_healthcare', name: 'Pharmacy & Medical Stores', slug: 'pharmacy-medical-stores', sort_order: 4, is_active: true },
  { id: 'dep_lab_diagnostics', industry_id: 'ind_healthcare', name: 'Laboratory & Diagnostics', slug: 'laboratory-diagnostics', sort_order: 5, is_active: true },
  { id: 'dep_radiology', industry_id: 'ind_healthcare', name: 'Radiology & Medical Imaging', slug: 'radiology-imaging', sort_order: 6, is_active: true },
  { id: 'dep_emergency_ambulance', industry_id: 'ind_healthcare', name: 'Emergency & Ambulance Services', slug: 'emergency-ambulance', sort_order: 7, is_active: true },
  { id: 'dep_hospital_admin', industry_id: 'ind_healthcare', name: 'Hospital Administration & Billing', slug: 'hospital-administration-billing', sort_order: 8, is_active: true },
  { id: 'dep_physiotherapy', industry_id: 'ind_healthcare', name: 'Physiotherapy & Rehabilitation', slug: 'physiotherapy-rehabilitation', sort_order: 9, is_active: true },
  { id: 'dep_dental', industry_id: 'ind_healthcare', name: 'Dental Care & Surgery', slug: 'dental-care-surgery', sort_order: 10, is_active: true },
  { id: 'dep_eye_care', industry_id: 'ind_healthcare', name: 'Eye Care & Optometry', slug: 'eye-care-optometry', sort_order: 11, is_active: true },
  { id: 'dep_nutrition', industry_id: 'ind_healthcare', name: 'Nutrition & Dietetics', slug: 'nutrition-dietetics', sort_order: 12, is_active: true },

  // IT
  { id: 'dep_software_dev', industry_id: 'ind_it', name: 'Software Engineering', slug: 'software-engineering', sort_order: 1, is_active: true },
  { id: 'dep_web_mobile', industry_id: 'ind_it', name: 'Web & Mobile Development', slug: 'web-mobile-development', sort_order: 2, is_active: true },
  { id: 'dep_ui_ux', industry_id: 'ind_it', name: 'UI/UX & Product Design', slug: 'ui-ux-design', sort_order: 3, is_active: true },
  { id: 'dep_data_ai', industry_id: 'ind_it', name: 'Data Science, AI & Machine Learning', slug: 'data-science-ai', sort_order: 4, is_active: true },
  { id: 'dep_cloud_cyber', industry_id: 'ind_it', name: 'Cloud Computing & Cybersecurity', slug: 'cloud-cybersecurity', sort_order: 5, is_active: true },
  { id: 'dep_devops_infra', industry_id: 'ind_it', name: 'DevOps & Systems Administration', slug: 'devops-systems-admin', sort_order: 6, is_active: true },
  { id: 'dep_database_admin', industry_id: 'ind_it', name: 'Database Administration', slug: 'database-administration', sort_order: 7, is_active: true },
  { id: 'dep_qa_testing', industry_id: 'ind_it', name: 'QA & Software Testing', slug: 'qa-software-testing', sort_order: 8, is_active: true },
  { id: 'dep_it_support', industry_id: 'ind_it', name: 'IT Support & Hardware Tech', slug: 'it-support-hardware', sort_order: 9, is_active: true },
  { id: 'dep_tech_product_mgt', industry_id: 'ind_it', name: 'Tech & Product Management', slug: 'tech-product-management', sort_order: 10, is_active: true },

  // Education
  { id: 'dep_school_teaching', industry_id: 'ind_education', name: 'School Education & Teaching', slug: 'school-education-teaching', sort_order: 1, is_active: true },
  { id: 'dep_higher_edu', industry_id: 'ind_education', name: 'College & Higher Education', slug: 'college-higher-education', sort_order: 2, is_active: true },
  { id: 'dep_coaching_tutoring', industry_id: 'ind_education', name: 'Coaching & Private Tutoring', slug: 'coaching-private-tutoring', sort_order: 3, is_active: true },
  { id: 'dep_special_edu', industry_id: 'ind_education', name: 'Special Education', slug: 'special-education', sort_order: 4, is_active: true },
  { id: 'dep_edu_admin', industry_id: 'ind_education', name: 'School & College Administration', slug: 'school-college-administration', sort_order: 5, is_active: true },
  { id: 'dep_academic_support', industry_id: 'ind_education', name: 'Academic Support & Library', slug: 'academic-support-library', sort_order: 6, is_active: true },

  // Finance
  { id: 'dep_accounting', industry_id: 'ind_finance', name: 'General Accounting & Bookkeeping', slug: 'accounting-bookkeeping', sort_order: 1, is_active: true },
  { id: 'dep_taxation', industry_id: 'ind_finance', name: 'Taxation & GST Compliance', slug: 'taxation-gst-compliance', sort_order: 2, is_active: true },
  { id: 'dep_auditing', industry_id: 'ind_finance', name: 'Auditing & Controls', slug: 'auditing-controls', sort_order: 3, is_active: true },
  { id: 'dep_banking', industry_id: 'ind_finance', name: 'Banking Operations & Loans', slug: 'banking-operations-loans', sort_order: 4, is_active: true },
  { id: 'dep_insurance', industry_id: 'ind_finance', name: 'Insurance & Claims', slug: 'insurance-claims', sort_order: 5, is_active: true },
  { id: 'dep_finance_invest', industry_id: 'ind_finance', name: 'Investment & Financial Analysis', slug: 'investment-financial-analysis', sort_order: 6, is_active: true },
  { id: 'dep_payroll', industry_id: 'ind_finance', name: 'Payroll & Invoicing', slug: 'payroll-invoicing', sort_order: 7, is_active: true },

  // Sales
  { id: 'dep_direct_sales', industry_id: 'ind_sales', name: 'Direct & Field Sales', slug: 'direct-field-sales', sort_order: 1, is_active: true },
  { id: 'dep_biz_dev', industry_id: 'ind_sales', name: 'Business Development', slug: 'business-development', sort_order: 2, is_active: true },
  { id: 'dep_digital_mkt', industry_id: 'ind_sales', name: 'Digital Marketing & SEO', slug: 'digital-marketing-seo', sort_order: 3, is_active: true },
  { id: 'dep_social_content', industry_id: 'ind_sales', name: 'Social Media & Content Creation', slug: 'social-media-content', sort_order: 4, is_active: true },
  { id: 'dep_brand_ad', industry_id: 'ind_sales', name: 'Brand & Advertising', slug: 'brand-advertising', sort_order: 5, is_active: true },
  { id: 'dep_telemarketing', industry_id: 'ind_sales', name: 'Telemarketing & Inside Sales', slug: 'telemarketing-inside-sales', sort_order: 6, is_active: true },

  // BPO
  { id: 'dep_call_center', industry_id: 'ind_bpo', name: 'Call Center & Voice Support', slug: 'call-center-voice-support', sort_order: 1, is_active: true },
  { id: 'dep_non_voice', industry_id: 'ind_bpo', name: 'Chat, Email & Non-Voice Support', slug: 'chat-email-support', sort_order: 2, is_active: true },
  { id: 'dep_tech_support', industry_id: 'ind_bpo', name: 'Technical Customer Support', slug: 'technical-customer-support', sort_order: 3, is_active: true },
  { id: 'dep_bpo_ops', industry_id: 'ind_bpo', name: 'BPO Operations & Quality', slug: 'bpo-operations-quality', sort_order: 4, is_active: true },

  // Construction
  { id: 'dep_civil_const', industry_id: 'ind_construction', name: 'Civil Engineering & Construction', slug: 'civil-engineering-construction', sort_order: 1, is_active: true },
  { id: 'dep_electrical_const', industry_id: 'ind_construction', name: 'Electrical Wiring & Contracting', slug: 'electrical-wiring-contracting', sort_order: 2, is_active: true },
  { id: 'dep_plumbing_pipe', industry_id: 'ind_construction', name: 'Plumbing & Pipefitting', slug: 'plumbing-pipefitting', sort_order: 3, is_active: true },
  { id: 'dep_carpentry', industry_id: 'ind_construction', name: 'Carpentry & Furniture Work', slug: 'carpentry-furniture-work', sort_order: 4, is_active: true },
  { id: 'dep_painting_finish', industry_id: 'ind_construction', name: 'Painting & Surface Finishing', slug: 'painting-surface-finishing', sort_order: 5, is_active: true },
  { id: 'dep_welding_fab', industry_id: 'ind_construction', name: 'Welding & Metal Fabrication', slug: 'welding-metal-fabrication', sort_order: 6, is_active: true },
  { id: 'dep_masonry_tile', industry_id: 'ind_construction', name: 'Masonry, Tiling & Flooring', slug: 'masonry-tiling-flooring', sort_order: 7, is_active: true },
  { id: 'dep_heavy_equip', industry_id: 'ind_construction', name: 'Heavy Machinery & Earthmovers', slug: 'heavy-machinery-earthmovers', sort_order: 8, is_active: true },
  { id: 'dep_safety_site', industry_id: 'ind_construction', name: 'Site Safety & Store Management', slug: 'site-safety-store-management', sort_order: 9, is_active: true },
  { id: 'dep_arch_design', industry_id: 'ind_construction', name: 'Architecture & CAD Drafting', slug: 'architecture-cad-drafting', sort_order: 10, is_active: true },

  // Manufacturing
  { id: 'dep_production_assembly', industry_id: 'ind_manufacturing', name: 'Production & Assembly Line', slug: 'production-assembly-line', sort_order: 1, is_active: true },
  { id: 'dep_machine_ops', industry_id: 'ind_manufacturing', name: 'Machinery & CNC Operation', slug: 'machinery-cnc-operation', sort_order: 2, is_active: true },
  { id: 'dep_quality_mfg', industry_id: 'ind_manufacturing', name: 'Quality Inspection & Control', slug: 'quality-inspection-control', sort_order: 3, is_active: true },
  { id: 'dep_packaging_mfg', industry_id: 'ind_manufacturing', name: 'Packaging & Box Labeling', slug: 'packaging-box-labeling', sort_order: 4, is_active: true },
  { id: 'dep_mfg_maint', industry_id: 'ind_manufacturing', name: 'Industrial Maintenance & Fitting', slug: 'industrial-maintenance-fitting', sort_order: 5, is_active: true },
  { id: 'dep_factory_mgt', industry_id: 'ind_manufacturing', name: 'Factory Floor Operations', slug: 'factory-floor-operations', sort_order: 6, is_active: true },

  // Automobile
  { id: 'dep_auto_repair', industry_id: 'ind_automobile', name: 'Auto Mechanical Repair', slug: 'auto-mechanical-repair', sort_order: 1, is_active: true },
  { id: 'dep_auto_electrical', industry_id: 'ind_automobile', name: 'Auto Electrical & AC Repair', slug: 'auto-electrical-ac', sort_order: 2, is_active: true },
  { id: 'dep_body_paint', industry_id: 'ind_automobile', name: 'Denting, Painting & Detailing', slug: 'denting-painting-detailing', sort_order: 3, is_active: true },
  { id: 'dep_vehicle_sales', industry_id: 'ind_automobile', name: 'Vehicle Inspection & Tyres', slug: 'vehicle-inspection-tyres', sort_order: 4, is_active: true },

  // Logistics
  { id: 'dep_driving_personal', industry_id: 'ind_logistics', name: 'Personal & Taxi Driving', slug: 'personal-taxi-driving', sort_order: 1, is_active: true },
  { id: 'dep_driving_heavy', industry_id: 'ind_logistics', name: 'Commercial Truck & Bus Driving', slug: 'commercial-truck-bus-driving', sort_order: 2, is_active: true },
  { id: 'dep_delivery_courier', industry_id: 'ind_logistics', name: 'Delivery, Rider & Courier', slug: 'delivery-rider-courier', sort_order: 3, is_active: true },
  { id: 'dep_warehouse_ops', industry_id: 'ind_logistics', name: 'Warehouse Operations & Stocking', slug: 'warehouse-operations-stocking', sort_order: 4, is_active: true },
  { id: 'dep_logistics_fleet', industry_id: 'ind_logistics', name: 'Logistics, Fleet & Dispatch', slug: 'logistics-fleet-dispatch', sort_order: 5, is_active: true },

  // Hospitality
  { id: 'dep_hotel_mgt', industry_id: 'ind_hospitality', name: 'Hotel & Resort Management', slug: 'hotel-resort-management', sort_order: 1, is_active: true },
  { id: 'dep_front_office', industry_id: 'ind_hospitality', name: 'Front Desk & Guest Relations', slug: 'front-desk-guest-relations', sort_order: 2, is_active: true },
  { id: 'dep_housekeeping_hotel', industry_id: 'ind_hospitality', name: 'Hotel Housekeeping & Laundry', slug: 'hotel-housekeeping-laundry', sort_order: 3, is_active: true },
  { id: 'dep_tourism_travel', industry_id: 'ind_hospitality', name: 'Tour Operations & Travel Services', slug: 'tour-operations-travel', sort_order: 4, is_active: true },

  // Food & Restaurant
  { id: 'dep_culinary_chefs', industry_id: 'ind_food', name: 'Chefs & Kitchen Culinary Staff', slug: 'chefs-kitchen-culinary', sort_order: 1, is_active: true },
  { id: 'dep_bakery', industry_id: 'ind_food', name: 'Baking & Confectionery', slug: 'baking-confectionery', sort_order: 2, is_active: true },
  { id: 'dep_dining_service', industry_id: 'ind_food', name: 'Dining Service, Waiters & Captains', slug: 'dining-service-waiters', sort_order: 3, is_active: true },
  { id: 'dep_catering_bar', industry_id: 'ind_food', name: 'Catering, Bartending & Baristas', slug: 'catering-bartending-baristas', sort_order: 4, is_active: true },

  // Retail
  { id: 'dep_retail_sales', industry_id: 'ind_retail', name: 'Retail Store Sales & Promotion', slug: 'retail-store-sales', sort_order: 1, is_active: true },
  { id: 'dep_cashiering', industry_id: 'ind_retail', name: 'Cashiering & Billing Counters', slug: 'cashiering-billing-counters', sort_order: 2, is_active: true },
  { id: 'dep_visual_mchd', industry_id: 'ind_retail', name: 'Merchandising & Store Inventory', slug: 'merchandising-store-inventory', sort_order: 3, is_active: true },
  { id: 'dep_ecom_fulfillment', industry_id: 'ind_retail', name: 'E-commerce Order Fulfillment', slug: 'ecommerce-order-fulfillment', sort_order: 4, is_active: true },

  // Security
  { id: 'dep_physical_security', industry_id: 'ind_security', name: 'Physical Guarding & Bouncers', slug: 'physical-guarding-bouncers', sort_order: 1, is_active: true },
  { id: 'dep_surveillance', industry_id: 'ind_security', name: 'CCTV Surveillance & Fire Safety', slug: 'cctv-surveillance-fire-safety', sort_order: 2, is_active: true },

  // Government
  { id: 'dep_admin_clerical_gov', industry_id: 'ind_government', name: 'Public Administration & Office Services', slug: 'public-administration-office', sort_order: 1, is_active: true },

  // Legal
  { id: 'dep_legal_practice', industry_id: 'ind_legal', name: 'Legal Practice & Litigation', slug: 'legal-practice-litigation', sort_order: 1, is_active: true },
  { id: 'dep_paralegal_corporate', industry_id: 'ind_legal', name: 'Paralegal & Corporate Compliance', slug: 'paralegal-corporate-compliance', sort_order: 2, is_active: true },

  // HR
  { id: 'dep_recruitment', industry_id: 'ind_hr', name: 'Talent Acquisition & Recruitment', slug: 'talent-acquisition-recruitment', sort_order: 1, is_active: true },
  { id: 'dep_hr_ops', industry_id: 'ind_hr', name: 'HR Operations, Payroll & Training', slug: 'hr-operations-payroll-training', sort_order: 2, is_active: true },

  // Media
  { id: 'dep_visual_graphics', industry_id: 'ind_media', name: 'Graphic Design & Visual Arts', slug: 'graphic-design-visual-arts', sort_order: 1, is_active: true },
  { id: 'dep_video_photo', industry_id: 'ind_media', name: 'Video Editing & Photography', slug: 'video-editing-photography', sort_order: 2, is_active: true },
  { id: 'dep_content_writing', industry_id: 'ind_media', name: 'Content Writing & Copywriting', slug: 'content-writing-copywriting', sort_order: 3, is_active: true },

  // Agriculture
  { id: 'dep_crop_farming', industry_id: 'ind_agriculture', name: 'Crop Farming & Cultivation', slug: 'crop-farming-cultivation', sort_order: 1, is_active: true },
  { id: 'dep_livestock_dairy', industry_id: 'ind_agriculture', name: 'Dairy Farming & Livestock', slug: 'dairy-farming-livestock', sort_order: 2, is_active: true },
  { id: 'dep_farm_machinery', industry_id: 'ind_agriculture', name: 'Farm Tractors & Equipment', slug: 'farm-tractors-equipment', sort_order: 3, is_active: true },
  { id: 'dep_vet_animal', industry_id: 'ind_agriculture', name: 'Veterinary & Animal Care', slug: 'veterinary-animal-care', sort_order: 4, is_active: true },

  // Beauty
  { id: 'dep_hair_styling', industry_id: 'ind_beauty', name: 'Hair Care & Barbershop', slug: 'hair-care-barbershop', sort_order: 1, is_active: true },
  { id: 'dep_makeup_skincare', industry_id: 'ind_beauty', name: 'Beautician & Makeup Artistry', slug: 'beautician-makeup-artistry', sort_order: 2, is_active: true },
  { id: 'dep_spa_fitness', industry_id: 'ind_beauty', name: 'Spa, Massage & Fitness Training', slug: 'spa-massage-fitness', sort_order: 3, is_active: true },

  // Domestic
  { id: 'dep_housekeeping_home', industry_id: 'ind_domestic', name: 'Home Housekeeping & Cleaning', slug: 'home-housekeeping-cleaning', sort_order: 1, is_active: true },
  { id: 'dep_home_cooking', industry_id: 'ind_domestic', name: 'Private Home Cooking & Meals', slug: 'private-home-cooking', sort_order: 2, is_active: true },
  { id: 'dep_caregiving_home', industry_id: 'ind_domestic', name: 'Nannies, Childcare & Elder Care', slug: 'nannies-childcare-elder-care', sort_order: 3, is_active: true },

  // Aviation
  { id: 'dep_airport_ops', industry_id: 'ind_aviation', name: 'Airport Ground Operations', slug: 'airport-ground-operations', sort_order: 1, is_active: true },
  { id: 'dep_cabin_crew', industry_id: 'ind_aviation', name: 'Cabin Crew & Flight Attendants', slug: 'cabin-crew-flight-attendants', sort_order: 2, is_active: true },
  { id: 'dep_aircraft_maint', industry_id: 'ind_aviation', name: 'Aircraft Engineering & Avionics', slug: 'aircraft-engineering-avionics', sort_order: 3, is_active: true },

  // Maritime
  { id: 'dep_vessel_deck', industry_id: 'ind_maritime', name: 'Seamen & Deck Operations', slug: 'seamen-deck-operations', sort_order: 1, is_active: true },
  { id: 'dep_marine_engine', industry_id: 'ind_maritime', name: 'Marine Engineering & Port Logistics', slug: 'marine-engineering-port', sort_order: 2, is_active: true },

  // Telecom
  { id: 'dep_telecom_field', industry_id: 'ind_telecom', name: 'Telecom Field Installation & Splicing', slug: 'telecom-field-installation', sort_order: 1, is_active: true },

  // Energy
  { id: 'dep_solar_renewables', industry_id: 'ind_energy', name: 'Solar Installation & Clean Energy', slug: 'solar-installation-clean-energy', sort_order: 1, is_active: true },
  { id: 'dep_utilities_oil', industry_id: 'ind_energy', name: 'Power Line, Water, Oil & Gas', slug: 'power-water-oil-gas', sort_order: 2, is_active: true },

  // Real Estate
  { id: 'dep_property_sales', industry_id: 'ind_realestate', name: 'Property Sales & Advisory', slug: 'property-sales-advisory', sort_order: 1, is_active: true },
  { id: 'dep_facility_mgt', industry_id: 'ind_realestate', name: 'Facility & Property Operations', slug: 'facility-property-operations', sort_order: 2, is_active: true },

  // Pharma
  { id: 'dep_pharma_mfg', industry_id: 'ind_pharma', name: 'Pharma Manufacturing & QC/QA', slug: 'pharma-manufacturing-qc-qa', sort_order: 1, is_active: true },
  { id: 'dep_pharma_sales', industry_id: 'ind_pharma', name: 'Medical Representative & Detailing', slug: 'medical-representative-detailing', sort_order: 2, is_active: true },

  // Textile
  { id: 'dep_tailoring', industry_id: 'ind_textile', name: 'Custom Tailoring & Stitching', slug: 'custom-tailoring-stitching', sort_order: 1, is_active: true },
  { id: 'dep_garment_mfg', industry_id: 'ind_textile', name: 'Garment Manufacturing & Cutting', slug: 'garment-manufacturing-cutting', sort_order: 2, is_active: true },

  // Electronics
  { id: 'dep_appliance_repair', industry_id: 'ind_electronics', name: 'Electronics, Mobile & Appliance Repair', slug: 'electronics-mobile-appliance-repair', sort_order: 1, is_active: true },

  // Cleaning
  { id: 'dep_cleaning_services', industry_id: 'ind_cleaning', name: 'Janitorial & Deep Cleaning Services', slug: 'janitorial-deep-cleaning', sort_order: 1, is_active: true },
  { id: 'dep_pest_control', industry_id: 'ind_cleaning', name: 'Pest Control Operations', slug: 'pest-control-operations', sort_order: 2, is_active: true },

  // Science
  { id: 'dep_research_lab', industry_id: 'ind_science', name: 'Scientific Research & Lab Testing', slug: 'scientific-research-lab-testing', sort_order: 1, is_active: true },

  // Sports
  { id: 'dep_sports_coaching', industry_id: 'ind_sports', name: 'Sports Coaching & Aquatics', slug: 'sports-coaching-aquatics', sort_order: 1, is_active: true },

  // Entertainment
  { id: 'dep_events_staging', industry_id: 'ind_entertainment', name: 'Event Staging, Sound & Lighting', slug: 'event-staging-sound-lighting', sort_order: 1, is_active: true },

  // Printing
  { id: 'dep_printing_ops', industry_id: 'ind_printing', name: 'Press Printing & DTP Operations', slug: 'press-printing-dtp', sort_order: 1, is_active: true },

  // Mining
  { id: 'dep_mining_ops', industry_id: 'ind_mining', name: 'Mining Operations & Heavy Drilling', slug: 'mining-operations-drilling', sort_order: 1, is_active: true },
];

/**
 * HELPER QUERY FUNCTIONS FOR HIERARCHICAL CLASSIFICATION
 */
export { JOB_ROLES } from './jobRolesList';
import { JOB_ROLES } from './jobRolesList';

export function getIndustryById(industryId: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.id === industryId || i.slug === industryId);
}

export function getDepartmentById(deptId: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === deptId || d.slug === deptId);
}

export function getDepartmentsByIndustryId(industryId: string): Department[] {
  return DEPARTMENTS.filter((d) => d.industry_id === industryId);
}

export function getRolesByDepartmentId(deptId: string): JobRole[] {
  return JOB_ROLES.filter((r) => r.department_id === deptId);
}

export function getRolesByIndustryId(industryId: string): JobRole[] {
  return JOB_ROLES.filter((r) => r.industry_id === industryId);
}

export function getRoleById(roleId: string): JobRole | undefined {
  return JOB_ROLES.find((r) => r.id === roleId || r.slug === roleId);
}

export function searchRoles(query: string, maxResults = 50): JobRole[] {
  if (!query || !query.trim()) return JOB_ROLES.slice(0, maxResults);
  const q = query.toLowerCase().trim();
  return JOB_ROLES.filter((r) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q)).slice(0, maxResults);
}

