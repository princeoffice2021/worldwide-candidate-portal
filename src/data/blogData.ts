import { BlogArticle, BlogTopic, ArticleStatus } from '../types/blog';
import { api, getStoredAdminToken } from '../lib/apiClient';

export class BlogTopics {
  static readonly TOPICS: BlogTopic[] = [
    { 
      id: 'top-resume', 
      name: 'Resume & CV Writing', 
      slug: 'resume-cv-writing',
      description: 'Expert frameworks, formatting rules, ATS strategies, and real-world bullet-point samples.', 
      iconName: 'FileText',
      is_indexable: true
    },
    { 
      id: 'top-interview', 
      name: 'Interview Preparation', 
      slug: 'interview-preparation',
      description: 'Technical questions, behavioral response frameworks (STAR), and hiring manager expectations.', 
      iconName: 'HelpCircle',
      is_indexable: true
    },
    { 
      id: 'top-career-growth', 
      name: 'Career Progression', 
      slug: 'career-progression',
      description: 'Promotions, department transitions, leadership paths, and executive roadmap planning.', 
      iconName: 'TrendingUp',
      is_indexable: true
    },
    { 
      id: 'top-salary', 
      name: 'Salary & Compensation', 
      slug: 'salary-compensation',
      description: 'Global benchmark compensation bands, negotiation frameworks, and equity breakdowns.', 
      iconName: 'DollarSign',
      is_indexable: true
    },
    { 
      id: 'top-skills', 
      name: 'Skills & Certifications', 
      slug: 'skills-certifications',
      description: 'Crucial hard and soft competencies, international licenses, and certification paths.', 
      iconName: 'Award',
      is_indexable: true
    },
    { 
      id: 'top-workplace', 
      name: 'Workplace & Culture', 
      slug: 'workplace-culture',
      description: 'Onboarding, remote work etiquette, workplace safety, and team leadership best practices.', 
      iconName: 'Briefcase',
      is_indexable: true
    },
  ];
}

export const SEED_ARTICLES: BlogArticle[] = [
  {
    id: 'art-001',
    slug: 'staff-nurse-career-guide',
    title: 'Staff Nurse Career Guide: Key Responsibilities, Skills, and Global Hiring Outlook',
    excerpt: 'Comprehensive guide for Registered & Staff Nurses looking to excel in hospital wards, ICUs, and private healthcare centers worldwide.',
    featured_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Dr. Sarah Jenkins, RN',
    author_role: 'Global Healthcare Talent Specialist',
    published_at: '2026-08-01',
    status: 'published',
    meta_title: 'Staff Nurse Career Guide | Skills, Duties & Salary | Candidate Portal',
    meta_description: 'Discover how to advance your career as a Staff Nurse. Learn about core ward duties, essential clinical skills, certifications, and global job demand.',
    industry_id: 'ind_healthcare',
    department_id: 'dep_nursing',
    job_role_id: 'r_029',
    tags: ['Healthcare', 'Nursing', 'Career Guides', 'Clinical Skills', 'Interview Tips'],
    is_featured: true,
    read_time: '6 min read',
    key_takeaways: [
      'Staff Nurses remain among the most in-demand professionals across hospitals in India, UAE, KSA, UK, and North America.',
      'Core clinical skills include patient monitoring, medication administration, triage, and infection control.',
      'Candidates with active BLS/ACLS certifications and valid nursing council registrations receive 3x more employer viewings.'
    ],
    responsibilities: [
      'Administer medications, IV fluids, and treatments as prescribed by attending physicians.',
      'Monitor patient vital signs, log progress reports, and escalate critical status changes immediately.',
      'Coordinate patient admissions, discharges, and post-operative recovery procedures.',
      'Maintain strict sterile standards and adhere to hospital infection prevention guidelines.',
      'Provide compassionate emotional support and clear medical guidance to patients and family members.'
    ],
    required_skills: [
      'Patient Triage & Vital Signs Monitoring',
      'Medication & IV Therapy Administration',
      'Electronic Health Records (EHR) Documentation',
      'Emergency Resuscitation (BLS / ACLS)',
      'Infection Control Protocols',
      'Empathetic Patient Communication'
    ],
    salary_range: '$24,000 - $75,000 / year (varies by region & experience)',
    interview_questions: [
      {
        question: 'How do you handle a sudden deterioration in a patient condition under high ward pressure?',
        tip: 'Structure your answer using the ABCDE assessment (Airway, Breathing, Circulation, Disability, Exposure). Emphasize fast escalation and calm execution.'
      },
      {
        question: 'Describe a time when a patient or family member was upset. How did you de-escalate?',
        tip: 'Highlight active listening, maintaining professional empathy, and adhering strictly to hospital safety and patient privacy policy.'
      }
    ],
    content: `
### Introduction

Staff Nurses serve as the frontline backbone of healthcare institutions globally. From acute hospital wards and surgical recovery units to outpatient clinics and specialized care centers, qualified nurses are essential for delivering safe, high-quality care.

With the expansion of healthcare infrastructure across Asia, the Middle East, Europe, and North America, registered staff nurses with proven clinical experience continue to see robust international career opportunities.

---

### Core Clinical Duties & Daily Workflow

A Staff Nurse balances direct patient intervention with systematic medical record management:

1. **Direct Patient Assessment**: Conducting initial physical assessments, monitoring cardiac monitors, and recording vital metrics systematically.
2. **Treatment Administration**: Safely preparing dosages, operating infusion pumps, administering blood products, and tracking drug interactions.
3. **Multidisciplinary Collaboration**: Liaising with doctors, surgeons, pharmacists, and physiotherapists during morning grand rounds.
4. **Patient Education**: Explaining post-surgical home care, wound dressing, and dietary restrictions prior to discharge.

---

### Key Certifications and Qualifications

To work as a recognized Staff Nurse, candidate profiles must typically highlight:

- **Degree/Diploma**: B.Sc Nursing, General Nursing & Midwifery (GNM), or Associate Degree in Nursing (ADN).
- **Licensing**: Valid registration with national or state Nursing Councils (e.g., Indian Nursing Council, DHA/HAAD in UAE, Saudi Commission SCFHS, NMC UK, NCLEX-RN for USA/Canada).
- **Life Support Certifications**: Basic Life Support (BLS) and Advanced Cardiovascular Life Support (ACLS).

---

### Career Progression & Growth Paths

Nursing offers clear career advancement avenues:

- **Junior Staff Nurse** (0–2 years): Foundational ward management and patient care.
- **Senior Staff Nurse / Charge Nurse** (3–6 years): Unit leadership, shift oversight, and junior nurse mentorship.
- **Nurse Manager / Ward Supervisor** (7+ years): Administrative budgeting, staffing schedules, and quality assurance.
- **Specialization**: Transitioning to ICU / CCU, Operating Theatre (OT), Pediatric Care, or Oncology Nursing.
`
  },
  {
    id: 'art-002',
    slug: 'frontend-developer-skills-career-guide',
    title: 'Frontend Developer Career Guide: Essential Technical Skills, Frameworks & Salary Insights',
    excerpt: 'Master modern React, TypeScript, Tailwind CSS, and performance optimization to build high-demand web apps and land remote or global software roles.',
    featured_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Alex Rivera',
    author_role: 'Senior Principal Software Engineer',
    published_at: '2026-08-04',
    status: 'published',
    meta_title: 'Frontend Developer Career Guide | React, TypeScript & Hiring Standards',
    meta_description: 'Complete guide for Frontend Developers. Learn in-demand skills like React, TypeScript, responsive UI engineering, state management, and interview preparation.',
    industry_id: 'ind_it_tech',
    department_id: 'dep_software_dev',
    job_role_id: 'r_090',
    tags: ['IT & Software', 'Software Development', 'Frontend', 'Skills & Training', 'Career Guides'],
    is_featured: true,
    read_time: '7 min read',
    key_takeaways: [
      'TypeScript proficiency has transitioned from an optional perk to a mandatory requirement for mid and senior frontend developer positions.',
      'Employers prioritize candidate portfolios demonstrating real-world state management, API integration, and clean accessibility (WCAG).',
      'Demonstrating understanding of build tools (Vite, Next.js) and component performance tuning significantly boosts candidate response rates.'
    ],
    responsibilities: [
      'Translate UI/UX wireframes into responsive, pixel-perfect, accessible React components.',
      'Architect robust client-side state architectures and handle asynchronous REST/GraphQL API streams.',
      'Optimize Web Vitals, code-splitting, bundle sizes, and image assets for lightning-fast page loading.',
      'Implement automated unit and integration testing using Vitest, Jest, or React Testing Library.',
      'Collaborate with backend engineers to establish clean schema contracts and API proxies.'
    ],
    required_skills: [
      'React 18 / 19 & Next.js App Router',
      'Strict TypeScript & ES6+ JavaScript',
      'Tailwind CSS & Modern Utility Styling',
      'Client State Management (Zustand, React Query, Redux)',
      'REST & GraphQL API Integration',
      'Web Performance & Core Web Vitals Optimization'
    ],
    salary_range: '$35,000 - $130,000 / year (varies by remote status & geography)',
    interview_questions: [
      {
        question: 'How do you prevent unnecessary re-renders in a complex React component tree?',
        tip: 'Discuss React.memo, useMemo, useCallback, lifting state down, and keeping state localized rather than global.'
      },
      {
        question: 'Explain the difference between client-side rendering (CSR), server-side rendering (SSR), and static site generation (SSG).',
        tip: 'Outline the tradeoffs in initial load time, SEO indexing, server cost, and interactive dynamic updates.'
      }
    ],
    content: `
### The Evolving Role of Frontend Developers

Frontend engineering in 2026 demands far more than basic HTML and CSS styling. Modern web applications function as full-fledged software clients operating inside the browser.

Employers worldwide seek engineers who combine deep design system sensitivity with rigorous software architecture skills, including TypeScript type safety, state synchronization, and security best practices.

---

### Core Tech Stack Requirements

To stand out in candidate searches, frontend profiles should demonstrate proficiency across three core pillars:

#### 1. Core Frameworks & Types
- **React**: Functional components, custom hooks, context, and modern concurrency features.
- **TypeScript**: Strict interfaces, generics, type narrowing, and utility types (Omit, Pick, Partial).

#### 2. Layout & Styling Systems
- **Tailwind CSS**: Utility-first architecture, responsive breakpoints, dark mode, and fluid typography.
- **Component Systems**: Radix UI, Headless UI, Shadcn/UI for accessible component primitives.

#### 3. State & Data Fetching
- **Server State**: React Query / TanStack Query for caching, optimistic updates, and automatic re-fetching.
- **Client State**: Zustand or Redux Toolkit for complex UI workflows.

---

### Building an Employer-Attracting Portfolio

When publishing your profile on global candidate platforms:

- Include links to live web deployments rather than raw code repositories alone.
- Highlight performance benchmarks (e.g. 95+ Lighthouse score).
- Describe real problem-solving: *"Reduced bundle size by 40% using dynamic imports and optimized SVG icons."*
`
  },
  {
    id: 'art-003',
    slug: 'accountant-career-guide-responsibilities-skills',
    title: 'Accountant Career Guide: Essential Duties, Tax Compliance, and Global Financial Skills',
    excerpt: 'Detailed roadmap for accountants and financial officers covering general ledger, tax compliance, QuickBooks, Tally, and audit preparation.',
    featured_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Rajesh Sharma, FCA',
    author_role: 'Senior Financial Consultant & CPA Trainer',
    published_at: '2026-08-05',
    status: 'published',
    meta_title: 'Accountant Career Guide | General Ledger, Tax & Audit Skills',
    meta_description: 'Discover how to grow your career as an Accountant. Learn about general ledger management, GST/VAT tax filings, financial reporting, and ERP software.',
    industry_id: 'ind_finance_banking',
    department_id: 'dep_accounting',
    job_role_id: 'r_147',
    tags: ['Finance & Banking', 'Accounting & Audit', 'Taxation', 'Career Guides', 'Salary & Compensation'],
    is_featured: false,
    read_time: '5 min read',
    key_takeaways: [
      'Accountants with hands-on experience in cloud ERP software (QuickBooks, Zoho Books, SAP, Tally Prime) command top hiring preference.',
      'Knowledge of local tax frameworks (e.g. GST in India, Corporate Tax & VAT in UAE, IRS guidelines in USA) is a primary selection filter for employers.',
      'Maintaining precise trial balances and automated bank reconciliation skills cuts month-end closing times dramatically.'
    ],
    responsibilities: [
      'Maintain day-to-day general ledger journal entries, accounts payable (AP), and accounts receivable (AR).',
      'Prepare month-end financial statements, profit & loss (P&L) balance sheets, and cash flow reports.',
      'File timely statutory tax returns including GST, VAT, corporate tax, and payroll withholdings.',
      'Perform daily/weekly bank reconciliations and track outstanding invoice aging schedules.',
      'Assist external auditors during financial year-end statutory compliance audits.'
    ],
    required_skills: [
      'Financial Statement Preparation (P&L, Balance Sheet)',
      'Tally Prime, QuickBooks Online & SAP FI/CO',
      'GST / VAT / Corporate Tax Return Filing',
      'Accounts Payable (AP) & Accounts Receivable (AR)',
      'Bank Reconciliation & Cash Flow Management',
      'Advanced MS Excel (Pivot Tables, VLOOKUP, XLOOKUP)'
    ],
    salary_range: '$20,000 - $60,000 / year (varies by qualification & country)',
    interview_questions: [
      {
        question: 'What are the three main financial statements and how do they connect to each other?',
        tip: 'Explain how Net Income flows from Income Statement to Retained Earnings on the Balance Sheet, and drives Cash Flow from Operations.'
      },
      {
        question: 'How do you ensure 100% tax compliance during rapid company expansion?',
        tip: 'Discuss automated ERP tax engines, regular internal reconciliation checks, and staying updated with statutory tax notices.'
      }
    ],
    content: `
### Overview of the Accounting Profession

Accounting remains one of the most stable and ubiquitous professions across every commercial industry. Whether serving small businesses, multinational corporations, or specialized accounting firms, qualified accountants play a vital role in maintaining financial integrity and compliance.

---

### Core Areas of Competency

1. **General Ledger & Journal Entries**: Ensuring double-entry book-keeping compliance for every transaction.
2. **Taxation & Statutory Filings**: Managing GST/VAT returns, withholding taxes, and corporate income tax schedules accurately before statutory deadlines.
3. **Payroll & Vendor Settlement**: Processing employee salaries, reimbursement claims, and managing supplier payment terms efficiently.
4. **Audit Readiness**: Maintaining orderly physical and digital vouchers, invoice copies, and supporting tax exemption certificates.

---

### Key Financial Software Tools

Employers actively filter candidate profiles by software expertise:

- **SME Software**: Tally Prime, QuickBooks Online, Zoho Books.
- **Enterprise ERPs**: SAP ERP (FI/CO module), Oracle Financials Cloud, Microsoft Dynamics 365.
- **Data Analytics**: Advanced MS Excel (Power Query, XLOOKUP, Data Validation).
`
  },
  {
    id: 'art-004',
    slug: 'site-engineer-construction-career-guide',
    title: 'Site Engineer Career Guide: Civil Engineering Duties, Quality Control & Project Safety',
    excerpt: 'Essential practical guide for Civil Site Engineers overseeing structural execution, concrete quality checks, contractor supervision, and safety standards.',
    featured_image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Eng. David Miller, M.Sc Civil',
    author_role: 'Infrastructure Project Manager',
    published_at: '2026-08-06',
    status: 'published',
    meta_title: 'Site Engineer Career Guide | Civil Supervision & Site Safety',
    meta_description: 'Master civil site engineering duties. Learn about structural drawings execution, concrete slump testing, bar bending schedules, and worker safety.',
    industry_id: 'ind_construction',
    department_id: 'dep_civil_eng',
    job_role_id: 'r_060',
    tags: ['Construction & Real Estate', 'Civil Engineering', 'Site Engineering', 'Career Guides', 'Skills & Training'],
    is_featured: false,
    read_time: '6 min read',
    key_takeaways: [
      'Site engineers bridge the gap between architectural blueprints and physical site construction execution.',
      'Supervising sub-contractor daily progress and enforcing strict site safety (OSHA/HSE) prevents costly rework and accidents.',
      'Mastery of Bar Bending Schedules (BBS) and material estimation is key to controlling site budget overruns.'
    ],
    responsibilities: [
      'Interpret structural CAD drawings and ensure precise layout marking on site using total station survey equipment.',
      'Supervise daily casting of concrete columns, beams, slabs, and perform slump and cube testing.',
      'Prepare detailed Bar Bending Schedules (BBS) for steel reinforcement verification.',
      'Coordinate with MEP (Mechanical, Electrical, Plumbing) engineers to embed conduits prior to slab pours.',
      'Enforce zero-compromise site safety standards, mandatory PPE compliance, and daily toolbox talks.'
    ],
    required_skills: [
      'Structural Blueprint & CAD Drawing Interpretation',
      'Total Station & Leveling Surveying',
      'Concrete Quality Testing & Slump Verification',
      'Bar Bending Schedule (BBS) Preparation',
      'Sub-contractor Labor Management',
      'HSE / OSHA Site Safety Compliance'
    ],
    salary_range: '$22,000 - $65,000 / year (varies by project scale & country)',
    interview_questions: [
      {
        question: 'What immediate steps do you take if a concrete batch fails the slump test on site?',
        tip: 'State that you reject the batch immediately, log the non-conformance report (NCR), inform the batching plant, and prevent pour initiation.'
      }
    ],
    content: `
### Role of the Civil Site Engineer

Site Engineers are responsible for translating technical designs into durable, safe physical structures on site. They manage day-to-day ground operations, supervise construction workers, inspect structural reinforcement, and ensure projects progress on schedule and within budget.

---

### Daily Responsibilities on Construction Sites

1. **Morning Briefing & Planning**: Setting daily targets for mason teams, steel fixers, and equipment operators.
2. **Quality Inspections**: Checking shuttering alignment, rebar spacing, cover block placement, and lap lengths against structural drawings.
3. **Material Reconciliation**: Tracking cement bags, steel tonnage, sand, and aggregate consumption against estimated quantities.
4. **Site Safety Management**: Conducting daily hazard reviews, ensuring harness usage during elevated work, and maintaining clear access walkways.
`
  },
  {
    id: 'art-005',
    slug: 'heavy-driver-logistics-career-guide',
    title: 'Heavy Vehicle Driver Guide: Commercial Licensing, Safety, and Global Logistics Jobs',
    excerpt: 'Comprehensive guide for trailer drivers, heavy equipment operators, and logistics transport drivers working across international supply chains.',
    featured_image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Tariq Al-Mansoor',
    author_role: 'Fleet Operations Director',
    published_at: '2026-08-07',
    status: 'published',
    meta_title: 'Heavy Vehicle Driver Guide | Commercial License & Fleet Safety',
    meta_description: 'Learn how heavy trailer and truck drivers build successful careers in commercial transport, long-haul logistics, and fleet operations worldwide.',
    industry_id: 'ind_logistics_supply',
    department_id: 'dep_transportation',
    job_role_id: 'r_215',
    tags: ['Logistics & Supply Chain', 'Transportation', 'Heavy Driver', 'Career Guides'],
    is_featured: false,
    read_time: '4 min read',
    key_takeaways: [
      'Heavy commercial drivers holding valid GCC or international heavy transport licenses enjoy consistent global demand.',
      'Clean driving records, defensive driving credentials, and GPS route navigation skills are top employer prerequisites.',
      'Routine pre-trip vehicle safety inspection (brakes, tires, cargo lashing) ensures road safety and prevents fleet breakdowns.'
    ],
    responsibilities: [
      'Safely operate heavy multi-axle trucks, semi-trailers, and container haulers across long-haul routes.',
      'Perform thorough pre-trip and post-trip vehicle safety inspections including pneumatic brake systems and tire pressure.',
      'Verify container load distribution, secure cargo straps/chains, and inspect delivery manifests.',
      'Utilize digital fleet telemetry and GPS logging tools to maintain route schedules and rest hours compliance.'
    ],
    required_skills: [
      'Valid Commercial Heavy Vehicle Driver License (Heavy Trailer / Multi-Axle)',
      'Defensive Driving & Highway Safety Rules',
      'Pre-Trip Vehicle Mechanical & Brake Inspections',
      'Cargo Securing & Weight Distribution Knowledge',
      'GPS Route Navigation & Telemetry Logging'
    ],
    salary_range: '$18,000 - $55,000 / year (varies by region & long-haul routes)',
    interview_questions: [
      {
        question: 'How do you ensure heavy cargo is safely secured before starting a long highway journey?',
        tip: 'Detail checking load center of gravity, applying heavy-duty ratchet straps or chains, and performing secondary tension checks after initial 50 km.'
      }
    ],
    content: `
### Global Demand for Commercial Heavy Drivers

Commercial transport drivers form the vital circulatory system of international trade, transporting raw materials, industrial machinery, goods containers, and consumer merchandise daily.

With the expansion of port logistics hubs and highway corridors across GCC nations, North America, and Europe, certified heavy vehicle drivers remain in high demand.

---

### Essential License & Safety Standards

- **Licensing**: Valid Heavy Transport License (HTV / Heavy Trailer Class).
- **Vehicle Operation**: Reversing trailer units into tight loading bays, handling heavy gear splitters, and operating retarder brakes safely on descents.
- **Safety First**: Zero-tolerance for distracted driving, maintaining mandatory rest breaks, and adhering strictly to highway speed governors.
`
  },
  {
    id: 'art-006',
    slug: 'electrician-career-guide-technical-skills',
    title: 'Electrician Career Guide: Technical Installation, Wiring Safety, and Trade Certification',
    excerpt: 'Practical career guide for industrial, commercial, and residential electricians covering conduit wiring, breaker panels, testing meters, and safety codes.',
    featured_image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Marcus Vance, Master Electrician',
    author_role: 'Technical Vocational Instructor',
    published_at: '2026-08-08',
    status: 'published',
    meta_title: 'Electrician Career Guide | Wiring, Breaker Panels & Electrical Safety',
    meta_description: 'Complete guide for industrial and residential electricians. Master single/three-phase wiring, circuit breaker panel installation, testing meters, and safety standards.',
    industry_id: 'ind_construction',
    department_id: 'dep_electrical_eng',
    job_role_id: 'r_065',
    tags: ['Trades', 'Electrical', 'Electrician', 'Installation', 'Skills & Training', 'Career Guides'],
    is_featured: false,
    read_time: '5 min read',
    key_takeaways: [
      'Electricians with expertise in single-phase and three-phase power distribution are vital across residential, commercial, and factory settings.',
      'Mastery of electrical schematic diagrams, multimeter testing, and Lockout/Tagout (LOTO) safety procedures is critical.',
      'Growth opportunities include transitioning to Electrical Supervisor, Solar PV Technician, or Automation Specialist.'
    ],
    responsibilities: [
      'Install electrical conduit pipes, cable trays, and pull wiring according to MEP technical schematics.',
      'Assemble distribution boards (DB), main switchgear panels, circuit breakers, and earthing protection systems.',
      'Test electrical circuits for continuity, voltage levels, insulation resistance, and proper earthing using calibrated multimeters and megohmmeters.',
      'Troubleshoot electrical faults, blown fuses, motor starter issues, and short circuits systematically.',
      'Adhere strictly to National Electrical Codes (NEC / BS 7671) and Lockout/Tagout (LOTO) safety standards.'
    ],
    required_skills: [
      'Single-Phase & Three-Phase Electrical Wiring',
      'Distribution Board (DB) & Breaker Panel Dressing',
      'Electrical Schematic & Single Line Diagram (SLD) Reading',
      'Multimeter & Megger Insulation Testing',
      'Lockout / Tagout (LOTO) Safety Procedures'
    ],
    salary_range: '$18,000 - $58,000 / year (varies by region & industrial specialization)',
    interview_questions: [
      {
        question: 'Explain the Lockout/Tagout (LOTO) procedure before working on an industrial switchboard.',
        tip: 'Detail identifying power sources, isolating switches, applying physical padlocks and safety tags, and verifying zero voltage presence with a calibrated meter.'
      }
    ],
    content: `
### Overview of Electrical Skilled Trade

Electricians play an indispensable role in powering homes, commercial towers, manufacturing facilities, and public infrastructure. From initial rough-in conduit wiring to final switchboard commissioning, certified electricians ensure safe electrical power delivery.

---

### Core Areas of Technical Mastery

1. **Wiring & Conduit Layout**: Bending PVC/GI conduits, installing heavy cable trays, and pulling armored power cables safely.
2. **Distribution & Protection**: Dressing DB panels cleanly, sizing Miniature Circuit Breakers (MCB), Residual Current Devices (RCD/ELCB), and earthing pits.
3. **Maintenance & Diagnostics**: Isolating short circuits, replacing faulty contactors, and inspecting motor control centers (MCC).
`
  }
];

const LOCAL_STORAGE_BLOG_ARTICLES_KEY = 'candidate_portal_blog_articles_v2';
const LOCAL_STORAGE_BLOG_TOPICS_KEY = 'candidate_portal_blog_topics_v2';

class BlogArticlesStore {
  private articles: BlogArticle[] = [];
  private topics: BlogTopic[] = [];
  private listeners: Set<() => void> = new Set();
  private isSyncing = false;

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      this.syncWithServer();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error('Listener error:', e); }
    });
  }

  public async syncWithServer(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Fetch centralized topics
      const remoteTopics = await api.getTopics();
      if (remoteTopics && remoteTopics.length > 0) {
        this.topics = remoteTopics;
        this.persistTopics();
      }

      // 2. Fetch centralized articles
      const hasAdminToken = Boolean(getStoredAdminToken());
      let remoteArticles: BlogArticle[] = [];
      
      if (hasAdminToken) {
        try {
          const res = await api.getAdminArticles('all');
          remoteArticles = res.articles;
        } catch {
          const res = await api.getArticles({ limit: 100 });
          remoteArticles = res.articles;
        }
      } else {
        const res = await api.getArticles({ limit: 100 });
        remoteArticles = res.articles;
      }

      if (remoteArticles && remoteArticles.length > 0) {
        const articleMap = new Map<string, BlogArticle>();
        this.articles.forEach(a => articleMap.set(a.id, a));
        remoteArticles.forEach(a => articleMap.set(a.id, a));
        this.articles = Array.from(articleMap.values());
        this.persistArticles();
        this.notify();
      }
    } catch (e) {
      console.warn('Central database synchronization warning:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  private init() {
    // Load Topics
    try {
      const savedTopics = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_BLOG_TOPICS_KEY) : null;
      if (savedTopics) {
        this.topics = JSON.parse(savedTopics);
      } else {
        this.topics = [...BlogTopics.TOPICS];
      }
    } catch {
      this.topics = [...BlogTopics.TOPICS];
    }

    // Load Articles
    try {
      const savedArticles = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_BLOG_ARTICLES_KEY) : null;
      if (savedArticles) {
        const parsed: BlogArticle[] = JSON.parse(savedArticles);
        // Merge seed articles with saved ones to preserve new default data
        const idMap = new Map<string, BlogArticle>();
        SEED_ARTICLES.forEach(a => idMap.set(a.id, a));
        parsed.forEach(a => idMap.set(a.id, a));
        this.articles = Array.from(idMap.values());
      } else {
        this.articles = [...SEED_ARTICLES];
        this.persistArticles();
      }
    } catch {
      this.articles = [...SEED_ARTICLES];
    }
  }

  private persistArticles() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_BLOG_ARTICLES_KEY, JSON.stringify(this.articles));
      }
    } catch (e) {
      console.warn('Failed to save blog articles to localStorage', e);
    }
  }

  private persistTopics() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_BLOG_TOPICS_KEY, JSON.stringify(this.topics));
      }
    } catch (e) {
      console.warn('Failed to save blog topics to localStorage', e);
    }
  }

  public getAll(): BlogArticle[] {
    return [...this.articles];
  }

  public getPublished(): BlogArticle[] {
    return this.articles.filter(a => a.status === 'published');
  }

  public getById(id: string): BlogArticle | undefined {
    return this.articles.find(a => a.id === id);
  }

  public getBySlug(slug: string): BlogArticle | undefined {
    return this.articles.find(a => a.slug === slug);
  }

  public save(article: BlogArticle): BlogArticle {
    const existingIndex = this.articles.findIndex(a => a.id === article.id || a.slug === article.slug);
    const updated: BlogArticle = {
      ...article,
      updated_at: new Date().toISOString().split('T')[0]
    };

    if (existingIndex >= 0) {
      this.articles[existingIndex] = updated;
    } else {
      this.articles.unshift(updated);
    }

    this.persistArticles();
    this.notify();

    // Persist to centralized backend in background
    if (existingIndex >= 0) {
      api.updateAdminArticle(updated.id, updated).catch(err => {
        console.warn('Background article update error:', err);
      });
    } else {
      api.createAdminArticle(updated).catch(err => {
        console.warn('Background article create error:', err);
      });
    }

    return updated;
  }

  public async saveAsync(article: Partial<BlogArticle>): Promise<{ success: boolean; article?: BlogArticle; error?: string }> {
    try {
      const isExisting = article.id && this.articles.some(a => a.id === article.id);
      let result: { success: boolean; article?: BlogArticle; error?: string };

      if (isExisting && article.id) {
        result = await api.updateAdminArticle(article.id, article);
      } else {
        result = await api.createAdminArticle(article);
      }

      if (result.success && result.article) {
        const idx = this.articles.findIndex(a => a.id === result.article!.id);
        if (idx >= 0) {
          this.articles[idx] = result.article;
        } else {
          this.articles.unshift(result.article);
        }
        this.persistArticles();
        this.notify();
      }

      return result;
    } catch (err: any) {
      const fallbackArticle = article as BlogArticle;
      this.save(fallbackArticle);
      return { success: true, article: fallbackArticle };
    }
  }

  public async updateStatusAsync(id: string, status: ArticleStatus): Promise<{ success: boolean; article?: BlogArticle; error?: string }> {
    try {
      const result = await api.updateAdminArticleStatus(id, status);
      if (result.success && result.article) {
        const idx = this.articles.findIndex(a => a.id === id);
        if (idx >= 0) {
          this.articles[idx] = result.article;
        }
        this.persistArticles();
        this.notify();
      }
      return result;
    } catch (err: any) {
      const art = this.getById(id);
      if (art) {
        art.status = status;
        this.save(art);
      }
      return { success: true, article: art };
    }
  }

  public delete(id: string): boolean {
    const initialLength = this.articles.length;
    this.articles = this.articles.filter(a => a.id !== id);
    if (this.articles.length !== initialLength) {
      this.persistArticles();
      this.notify();
      api.deleteAdminArticle(id).catch(err => {
        console.warn('Centralized delete error:', err);
      });
      return true;
    }
    return false;
  }

  public async deleteAsync(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await api.deleteAdminArticle(id);
      if (res.success) {
        this.articles = this.articles.filter(a => a.id !== id);
        this.persistArticles();
        this.notify();
      }
      return res;
    } catch (err: any) {
      this.delete(id);
      return { success: true };
    }
  }

  public getTopics(): BlogTopic[] {
    return [...this.topics];
  }

  public saveTopic(topic: BlogTopic): BlogTopic {
    const idx = this.topics.findIndex(t => t.id === topic.id);
    if (idx >= 0) {
      this.topics[idx] = topic;
    } else {
      this.topics.push(topic);
    }
    this.persistTopics();
    this.notify();
    return topic;
  }

  public deleteTopic(topicId: string): boolean {
    const initialLength = this.topics.length;
    this.topics = this.topics.filter(t => t.id !== topicId);
    if (this.topics.length !== initialLength) {
      this.persistTopics();
      this.notify();
      return true;
    }
    return false;
  }

  public getRelated(
    industryId?: string, 
    departmentId?: string, 
    jobRoleId?: string, 
    currentArticleId?: string, 
    limit = 3
  ): BlogArticle[] {
    const published = this.getPublished().filter(a => a.id !== currentArticleId);
    
    // Score each published article based on hierarchical match specificity:
    // Priority 1: Exact Job Role match (score: 100)
    // Priority 2: Department match (score: 50)
    // Priority 3: Industry match (score: 10)
    const scored = published.map(art => {
      let score = 0;
      if (jobRoleId && (art.job_role_id === jobRoleId || art.tags?.some(t => t.toLowerCase() === jobRoleId.toLowerCase()))) {
        score += 100;
      }
      if (departmentId && art.department_id === departmentId) {
        score += 50;
      }
      if (industryId && art.industry_id === industryId) {
        score += 10;
      }
      return { article: art, score };
    }).filter(item => item.score > 0);

    // Sort descending by score to ensure Role > Department > Industry priority
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(item => item.article);
  }

  public getStats() {
    const total = this.articles.length;
    const published = this.articles.filter(a => a.status === 'published').length;
    const inReview = this.articles.filter(a => a.status === 'in_review').length;
    const drafts = this.articles.filter(a => a.status === 'draft').length;
    const featured = this.articles.filter(a => a.is_featured).length;

    return {
      total,
      published,
      inReview,
      drafts,
      featured,
      topicsCount: this.topics.length
    };
  }
}

export const blogArticlesStore = new BlogArticlesStore();

