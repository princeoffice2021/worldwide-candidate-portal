import { CareerGuide, ContentStatus } from '../types/career';
import { INDUSTRIES, DEPARTMENTS } from './categoriesData';
import { JOB_ROLES } from './jobRolesList';
import { SEED_ARTICLES, blogArticlesStore } from './blogData';
import { api } from '../lib/apiClient';

const LOCAL_STORAGE_CAREER_GUIDES_KEY = 'candidate_portal_career_guides_v2';

/**
 * INITIAL SEED PUBLISHED CAREER GUIDES
 * High-craft, genuine editorial career guides for landmark professions.
 */
export const INITIAL_PUBLISHED_GUIDES: CareerGuide[] = [
  {
    id: 'cg-staff-nurse',
    job_role_id: 'r_029',
    industry_id: 'ind_healthcare',
    department_id: 'dep_nursing',
    job_role_name: 'Staff Nurse',
    slug: 'staff-nurse',
    seo_title: 'Staff Nurse Career Guide: Skills, Duties, Education & Career Path',
    meta_description: 'Comprehensive career guide for Staff Nurses. Explore clinical responsibilities, required qualifications, nursing career progressions, and hiring outlook worldwide.',
    canonical_url: '/careers/staff-nurse',
    short_introduction: 'Staff Nurses are the vital heartbeat of healthcare facilities, providing hands-on clinical care, administering treatments, and advocating for patient well-being in hospital wards, clinics, and intensive care units.',
    overview: 'A Staff Nurse is a registered professional healthcare provider responsible for assessing patient symptoms, delivering prescribed therapies, operating life-monitoring equipment, and collaborating with physicians and surgical teams to deliver safe, evidence-based patient outcomes. Staff Nurses operate across medical-surgical wards, post-operative recovery, outpatient centers, and critical care units globally.',
    responsibilities: [
      'Conduct holistic patient health assessments, monitor vital signs, and maintain continuous charting of patient progress.',
      'Safely prepare, verify, and administer medications, intravenous (IV) infusions, and clinical treatments in compliance with physician orders.',
      'Operate and monitor essential medical machinery, including infusion pumps, oxygen delivery systems, and bedside cardiac monitors.',
      'Coordinate with multidisciplinary teams comprising doctors, pharmacists, physical therapists, and dietitians.',
      'Deliver clear post-discharge health education, wound management instructions, and medication timetables to patients and families.',
      'Enforce rigorous hospital infection control, sterile field maintenance, and hazardous waste disposal standards.'
    ],
    day_to_day_duties: [
      'Begin shift with a structured bedside handover (SBAR method) to review patient statuses.',
      'Perform hourly patient rounds, comfort checks, and vital sign logs.',
      'Dress surgical wounds, insert IV cannulas, and draw blood samples for pathology labs.',
      'Respond promptly to bedside call bells, emergency codes, and unexpected patient vitals deterioration.',
      'Document all administered medications, fluid balances, and doctor orders into the Electronic Health Records (EHR) system.'
    ],
    technical_skills: [
      'Vital Signs & Clinical Triage Assessment',
      'Intravenous (IV) Cannulation & Infusion Therapy',
      'Electronic Health Records (EHR / Epic / Cerner)',
      'Basic Life Support (BLS) & Advanced Cardiac Life Support (ACLS)',
      'Infection Prevention & Aseptic Wound Care',
      'Medication Dosage Calculation & Pharmacological Safety'
    ],
    soft_skills: [
      'Active Empathy & Patient Compassion',
      'Crisis Composure & Rapid Decision Making',
      'Clear Interprofessional Communication',
      'Keen Attention to Detail',
      'Time Management & Multi-Patient Prioritization'
    ],
    qualifications: [
      'Diploma in General Nursing & Midwifery (GNM) or Bachelor of Science in Nursing (B.Sc. Nursing)',
      'Active Registration / License with State or National Nursing Council',
      'Valid BLS (Basic Life Support) certification from recognized bodies (AHA / Equivalent)'
    ],
    education_requirements: 'A 3-year Diploma in Nursing (GNM) or 4-year accredited B.Sc. in Nursing degree is required. For international mobility (e.g. UK, USA, Gulf), passing NCLEX, NMC CBT/OSCE, or Prometric licensing exams is standard.',
    certifications: [
      'AHA Basic Life Support (BLS)',
      'Advanced Cardiovascular Life Support (ACLS)',
      'Pediatric Advanced Life Support (PALS)',
      'Infection Control Specialist (CIC) Certification'
    ],
    how_to_become: [
      'Complete high school with physics, chemistry, and biology (PCB) foundations.',
      'Enroll in an accredited nursing school or university program (B.Sc Nursing or GNM).',
      'Complete mandatory hospital clinical rotations across obstetrics, pediatrics, ICU, and surgical wards.',
      'Pass the National / State Board Licensure Examination to obtain a Registered Nurse (RN) license.',
      'Begin as a Graduate Staff Nurse in general hospital wards, progressing toward specialized clinical units.'
    ],
    entry_level_roles: [
      'Junior Staff Nurse',
      'Ward Floor Nurse',
      'Clinic Assistant Nurse'
    ],
    mid_level_roles: [
      'Senior Staff Nurse',
      'ICU / Critical Care Nurse',
      'Operation Theatre (OT) Nurse',
      'Nurse Preceptor'
    ],
    senior_level_roles: [
      'Nursing Supervisor / In-Charge',
      'Assistant Director of Nursing',
      'Nurse Educator / Clinical Specialist',
      'Hospital Matron / Chief Nursing Officer (CNO)'
    ],
    career_path_overview: 'Staff Nurses enjoy a well-structured progression from bedside ward care to specialized critical departments, clinical nursing management, healthcare administration, and academic nursing instruction.',
    work_environment: 'Staff Nurses primarily work in clean, fast-paced hospital wards, ambulatory surgical centers, outpatient clinics, and private nursing homes. Shifts often follow rotating 8-hour or 12-hour schedules, including night shifts, weekends, and on-call rotations.',
    hiring_industries: [
      'Healthcare & Hospitals',
      'Pharmaceuticals & Clinical Trials',
      'Domestic & Home Healthcare Services',
      'Government & Military Public Health Facilities',
      'Corporate Wellness & Occupational Health Centers'
    ],
    tools_and_technologies: [
      'Electronic Health Records (Epic, Cerner, Allscripts)',
      'Smart Infusion & Syringe Pumps',
      'Multi-Parameter Bedside Vital Monitors',
      'Automated External Defibrillators (AED)',
      'Glucometers, Pulse Oximeters & Digital Sphygmomanometers'
    ],
    salary_disclaimer: 'Salary varies by country, healthcare facility tier, years of clinical experience, shift allowances, and specialized unit certifications. Verified salary benchmarks will continue to expand as regional compensation reports are updated.',
    salary_factors: [
      'Geographic location and cost of living (e.g. Metropolitan tertiary hospitals vs. Rural health centers)',
      'Clinical specialty certifications (ICU, OT, and Dialysis typically earn premium differentials)',
      'Shift choices (Night shifts and holiday shifts often attract overtime and incentive allowances)',
      'Years of verified bedside clinical experience'
    ],
    job_outlook: 'The global demand for qualified nurses continues to experience historic growth driven by expanding healthcare infrastructure, aging populations worldwide, and international healthcare mobility across the Middle East, Europe, and North America.',
    interview_questions: [
      {
        question: 'How do you prioritize patient care when multiple patients have pressing needs simultaneously?',
        tip: 'Explain the ABC triage method (Airway, Breathing, Circulation) and mention communicating with ward colleagues for assistance.'
      },
      {
        question: 'Describe a situation where a patient vital sign abruptly deteriorated. What steps did you take?',
        tip: 'Structure your answer using the SBAR technique (Situation, Background, Assessment, Recommendation) and highlight fast team escalation.'
      },
      {
        question: 'How do you handle conflict or distress with a worried family member?',
        tip: 'Focus on active listening, empathy, remaining calm, and upholding strict patient privacy (HIPAA / data regulations).'
      }
    ],
    resume_tips: [
      'Highlight specific ward types worked (e.g., 30-bed Med-Surg, 12-bed Medical ICU, Dialysis).',
      'List all active nursing council license numbers and BLS/ACLS expiry dates prominently near the top.',
      'Quantify patient load managed per shift (e.g., "Managed acute care for 5-7 post-operative patients per 12-hour shift").',
      'Detail experience with specific EHR systems like Epic or Cerner.'
    ],
    related_skills: ['Vital Signs Assessment', 'IV Cannulation', 'EHR Documentation', 'BLS / ACLS', 'Medication Safety'],
    related_job_role_ids: ['r_030', 'r_031', 'r_032', 'r_033', 'r_034', 'r_035'],
    related_article_ids: ['art-001', 'art-002'],
    faq_items: [
      {
        id: 'faq-1',
        question: 'What is the primary difference between a Staff Nurse and a Registered Nurse (RN)?',
        answer: 'A Registered Nurse (RN) is the professional licensing credential, whereas a Staff Nurse is the job title assigned to an RN who delivers direct bedside patient care in a hospital ward or clinic.'
      },
      {
        id: 'faq-2',
        question: 'Can Staff Nurses work internationally in countries like UAE, UK, or USA?',
        answer: 'Yes. Qualified nurses can practice internationally by passing respective licensing exams such as Prometric (UAE/Saudi Arabia), NMC CBT & OSCE (UK), or NCLEX-RN (USA & Canada).'
      },
      {
        id: 'faq-3',
        question: 'What are the most in-demand nursing specialties?',
        answer: 'Critical Care (ICU), Operation Theatre (OT), Emergency Room (ER), Neonatal ICU (NICU), and Dialysis are among the highest-demand clinical nursing fields.'
      }
    ],
    content_status: 'published',
    published_at: '2026-08-01T00:00:00.000Z',
    last_updated: '2026-08-10',
    author_name: 'Dr. Sarah Jenkins, RN',
    editor_name: 'Candidate Portal Editorial Board',
    source_notes: 'Compiled from Global Nursing Council standards, AHA protocols, and hospital hiring specifications.'
  },
  {
    id: 'cg-software-developer',
    job_role_id: 'r_090',
    industry_id: 'ind_it',
    department_id: 'dep_software_dev',
    job_role_name: 'Software Developer',
    slug: 'software-developer',
    seo_title: 'Software Developer Career Guide: Skills, Qualifications & Roadmap',
    meta_description: 'Discover how to build a career as a Software Developer. Learn about core programming languages, software engineering principles, career pathways, and interview tips.',
    canonical_url: '/careers/software-developer',
    short_introduction: 'Software Developers design, build, test, and maintain digital applications and computer systems that power modern businesses, consumer platforms, and global cloud infrastructure.',
    overview: 'A Software Developer is an engineering professional who applies computational thinking, algorithmic logic, and programming languages to solve complex problems and build scalable software solutions. They work across the software development life cycle (SDLC)—from architectural planning and writing clean code to automated testing, deployment, and performance optimization.',
    responsibilities: [
      'Write clean, modular, testable, and maintainable source code across frontend, backend, or full-stack architectures.',
      'Collaborate with product managers, UI/UX designers, and QA engineers to translate user stories into robust technical implementations.',
      'Design and consume RESTful APIs, GraphQL endpoints, and database schemas.',
      'Debug application issues, resolve software defects, and refactor legacy codebases for enhanced performance.',
      'Participate in peer code reviews to maintain engineering quality, security standards, and documentation integrity.',
      'Configure CI/CD pipelines and monitor cloud application health in production environments.'
    ],
    day_to_day_duties: [
      'Participate in daily engineering standup meetings to synchronize sprint deliverables and flag blockers.',
      'Develop new application features according to technical specifications and UI designs.',
      'Write unit, integration, and end-to-end automated test suites.',
      'Review merge requests and provide constructive feedback to fellow software engineers.',
      'Monitor production logs, error reporting dashboards, and database query performance.'
    ],
    technical_skills: [
      'Core Programming Languages (JavaScript, TypeScript, Python, Java, C++, Go)',
      'Data Structures, Algorithms & Time Complexity (Big O)',
      'Relational & NoSQL Databases (PostgreSQL, MySQL, MongoDB, Redis)',
      'Version Control & Collaboration (Git, GitHub, GitLab)',
      'REST APIs, WebSockets & Microservices Architecture',
      'Cloud Platforms & Containers (AWS, GCP, Azure, Docker, Kubernetes)'
    ],
    soft_skills: [
      'Analytical Problem Solving',
      'Continuous Self-Directed Learning',
      'Clear Technical Communication',
      'Collaborative Team Mindset',
      'Product-Centric Thinking'
    ],
    qualifications: [
      'Bachelor’s Degree in Computer Science, Software Engineering, Information Technology, or equivalent practical experience',
      'Demonstrated portfolio of shipped software applications, GitHub repositories, or open-source contributions',
      'Familiarity with Agile / Scrum software delivery frameworks'
    ],
    education_requirements: 'A degree in Computer Science or related STEM disciplines is standard; however, self-taught developers and coding bootcamp graduates with strong portfolios and verified technical problem-solving capabilities are widely hired across the industry.',
    certifications: [
      'AWS Certified Developer / Solutions Architect',
      'Google Cloud Certified Associate Cloud Engineer',
      'Microsoft Certified: Azure Developer Associate',
      'Certified Kubernetes Application Developer (CKAD)'
    ],
    how_to_become: [
      'Master the foundational principles of computer science, data structures, and at least one core programming language.',
      'Build real-world projects such as full-stack web applications, APIs, and database-driven tools.',
      'Learn Git version control, testing methodologies, and collaborative software development practices.',
      'Prepare for technical interviews by practicing algorithmic challenges and system design fundamentals.',
      'Start in a Junior Developer role, learning under senior engineering mentors and contributing to production code.'
    ],
    entry_level_roles: [
      'Junior Software Developer',
      'Associate Engineer',
      'Software Engineering Intern'
    ],
    mid_level_roles: [
      'Software Developer / Engineer',
      'Full-Stack Developer',
      'Backend Engineer',
      'Frontend Specialist'
    ],
    senior_level_roles: [
      'Senior Software Engineer',
      'Staff Software Engineer',
      'Principal Engineer / Solutions Architect',
      'Engineering Manager / VP of Engineering / CTO'
    ],
    career_path_overview: 'Software Developers can advance along two distinct high-impact career tracks: the Individual Contributor (IC) track (Senior -> Staff -> Principal Architect) or the Engineering Management track (Team Lead -> Engineering Manager -> VP/CTO).',
    work_environment: 'Software Developers work in tech companies, enterprise corporations, digital agencies, and remote global startups. Work settings include office environments, hybrid setups, and 100% remote asynchronous team workflows.',
    hiring_industries: [
      'Information Technology & Software',
      'Accounting, Finance & Fintech',
      'Retail & E-commerce',
      'Healthcare & Digital Health',
      'Telecommunications & Cloud Services'
    ],
    tools_and_technologies: [
      'IDE / Code Editors (VS Code, IntelliJ, WebStorm)',
      'Containerization & Cloud (Docker, Kubernetes, AWS, GCP)',
      'CI/CD & DevOps (GitHub Actions, Jenkins, Terraform)',
      'Database Tools (PostgreSQL, Drizzle, Prisma, Redis)',
      'Project Tracking (Jira, Linear, Notion, Slack)'
    ],
    salary_disclaimer: 'Software developer compensation varies widely based on technology stack proficiency, seniority, geographic location, company scale, and remote work contracts. Verified compensation benchmarks will be updated as data becomes available.',
    salary_factors: [
      'Seniority level and proven architectural design capabilities',
      'Specialized stack demand (e.g. Distributed Systems, AI/ML engineering, Cloud Security)',
      'Company maturity (Early-stage startups with equity vs. Established tech corporations)',
      'Location and global hiring model (local employment vs. international remote contractor)'
    ],
    job_outlook: 'The global market for software developers remains exceptionally robust, driven by digital transformation across every industry, the expansion of cloud computing, and advancements in AI-assisted software ecosystems.',
    interview_questions: [
      {
        question: 'How do you approach debugging a high-impact intermittent bug in production?',
        tip: 'Detail your structured process: reproducing the issue, analyzing structured logs and APM metrics, isolating variables, writing a regression test, and deploying a validated fix.'
      },
      {
        question: 'Explain the difference between relational (SQL) and non-relational (NoSQL) databases with practical use cases.',
        tip: 'Discuss ACID compliance, schema rigidity, relationship complexity, and horizontal vs. vertical scalability.'
      },
      {
        question: 'How do you ensure your code remains maintainable and clean when building under tight deadlines?',
        tip: 'Mention adherence to SOLID principles, meaningful naming conventions, modular architecture, and avoiding premature optimization.'
      }
    ],
    resume_tips: [
      'Provide clickable links to your live projects, GitHub profile, and technical writing.',
      'Quantify your engineering impact (e.g. "Reduced API response times by 40% by implementing Redis caching and database indexing").',
      'List tech stacks in clearly organized categories (Languages, Frameworks, Cloud & Databases, Tools).',
      'Highlight collaborative experience with Agile methodologies and code review leadership.'
    ],
    related_skills: ['JavaScript / TypeScript', 'Python', 'System Architecture', 'SQL / NoSQL', 'Git & CI/CD', 'API Design'],
    related_job_role_ids: ['r_091', 'r_092', 'r_093', 'r_096', 'r_099'],
    related_article_ids: ['art-003'],
    faq_items: [
      {
        id: 'faq-1',
        question: 'What is the fastest way to get started as a Software Developer?',
        answer: 'Pick one versatile language (like Python or JavaScript/TypeScript), master basic data structures, and build 3 to 5 real full-stack web or CLI applications hosted on GitHub.'
      },
      {
        id: 'faq-2',
        question: 'Is a Computer Science degree strictly required to become a Software Developer?',
        answer: 'No. While a CS degree provides valuable theoretical foundations, thousands of developers build successful careers through coding bootcamps, online certifications, and proven project portfolios.'
      },
      {
        id: 'faq-3',
        question: 'What is the difference between a frontend, backend, and full-stack developer?',
        answer: 'Frontend developers build client-facing user interfaces and browser interactions; backend developers build servers, databases, and business logic; full-stack developers have the skills to work on both ends.'
      }
    ],
    content_status: 'published',
    published_at: '2026-08-02T00:00:00.000Z',
    last_updated: '2026-08-11',
    author_name: 'Alex Chen',
    editor_name: 'Candidate Portal Editorial Board',
    source_notes: 'Compiled from standard IEEE software engineering guidelines and global hiring frameworks.'
  },
  {
    id: 'cg-general-physician',
    job_role_id: 'r_001',
    industry_id: 'ind_healthcare',
    department_id: 'dep_doctors',
    job_role_name: 'General Physician',
    slug: 'general-physician',
    seo_title: 'General Physician Career Guide: Medical Training, Duties & Career Path',
    meta_description: 'Explore the medical career of a General Physician. Learn about primary care diagnosis, medical qualifications (MBBS/MD), clinical practice, and patient care.',
    canonical_url: '/careers/general-physician',
    short_introduction: 'General Physicians are primary care medical doctors who diagnose, manage, and treat a wide range of acute and chronic illnesses, acting as the primary entry point for patient healthcare.',
    overview: 'A General Physician (also known as an Internal Medicine Physician or Primary Care Doctor) provides comprehensive medical care to adult and adolescent patients. They perform physical examinations, order and interpret diagnostic investigations, formulate evidence-based treatment plans, and coordinate specialized referrals when required.',
    responsibilities: [
      'Evaluate patient medical histories, conduct comprehensive clinical physical examinations, and assess presenting symptoms.',
      'Order, analyze, and interpret diagnostic laboratory tests, imaging scans (X-rays, CT, MRI), and electrocardiograms (ECGs).',
      'Formulate therapeutic treatment plans, prescribe medications, and counsel patients on lifestyle and disease prevention.',
      'Manage long-term chronic conditions such as diabetes mellitus, hypertension, asthma, and cardiovascular disease.',
      'Collaborate with medical specialists, surgical teams, and tertiary care hospitals for complex case referrals.'
    ],
    day_to_day_duties: [
      'Conduct outpatient clinical consultations across routine, acute, and follow-up medical visits.',
      'Review daily lab pathology results and adjust patient prescription regimens.',
      'Perform hospital inpatient rounds for admitted patients under primary medical observation.',
      'Deliver emergency first-line medical resuscitation in acute triage situations.',
      'Document clinical findings, medical diagnoses (ICD-10), and treatment plans into electronic health records.'
    ],
    technical_skills: [
      'Clinical Diagnosis & Differential Diagnosis Formulation',
      'Chronic Disease Management (Hypertension, Diabetes, COPD)',
      'Diagnostic Lab & Imaging Interpretation',
      'Emergency Resuscitation & Pharmacotherapy',
      'Preventive Healthcare Counseling'
    ],
    soft_skills: [
      'Deep Clinical Empathy & Bedside Manner',
      'Active Patient Listening',
      'Ethical Medical Decision Making',
      'Clear Explanation of Complex Medical Conditions',
      'Collaborative Healthcare Team Leadership'
    ],
    qualifications: [
      'MBBS (Bachelor of Medicine, Bachelor of Surgery) or MD / DO degree from an accredited medical school',
      'Completion of compulsory rotating medical internship and clinical residency in Internal Medicine or Family Practice',
      'Active medical registration / license with the relevant National / State Medical Council'
    ],
    education_requirements: 'A 5.5-year MBBS degree followed by a 3-year MD/DNB in General Medicine or Family Medicine is typical. International licensure requires examinations such as USMLE (USA), PLAB (UK), or AMC (Australia).',
    certifications: [
      'Medical Council Permanent Registration',
      'Advanced Cardiac Life Support (ACLS)',
      'Board Certification in Internal Medicine / Family Medicine'
    ],
    how_to_become: [
      'Complete pre-medical secondary education with top grades in biology, physics, and chemistry.',
      'Pass national medical entrance examinations to gain admission to medical school.',
      'Complete the MBBS/MD curriculum, mastering anatomy, pathology, pharmacology, and clinical medicine.',
      'Fulfill 1 year of compulsory rotating clinical internship in recognized teaching hospitals.',
      'Complete post-graduate residency (MD/DNB) in General or Internal Medicine to practice as a certified physician.'
    ],
    entry_level_roles: [
      'Resident Medical Officer (RMO)',
      'Junior Resident (Internal Medicine)',
      'Primary Health Center Medical Officer'
    ],
    mid_level_roles: [
      'Consultant General Physician',
      'Internal Medicine Specialist',
      'Hospital Attending Physician'
    ],
    senior_level_roles: [
      'Senior Consultant Physician',
      'Head of Department (Internal Medicine)',
      'Medical Superintendent / Chief Medical Officer (CMO)'
    ],
    career_path_overview: 'General Physicians can practice in private clinics, multi-specialty hospitals, government health departments, or pursue super-specialization fellowships in Cardiology, Nephrology, Gastroenterology, or Oncology.',
    work_environment: 'General Physicians operate in hospital outpatient clinics, emergency rooms, private medical practices, and community health centers.',
    hiring_industries: [
      'Healthcare & Hospitals',
      'Government & Public Health Services',
      'Pharmaceuticals & Biotech Research',
      'Corporate Medical Services'
    ],
    tools_and_technologies: [
      'Stethoscopes, Otoscopes & Ophthalmoscopes',
      'Electronic Medical Records (EMR) Systems',
      'Point-of-Care Ultrasound (POCUS) & ECG Machines',
      'Digital Clinical Decision Support Tools (UpToDate, Medscape)'
    ],
    salary_disclaimer: 'Physician compensation varies widely by country, private vs. public sector, clinical setting, patient volume, and years of experience. Verified medical salary reports will continue to be added.',
    salary_factors: [
      'Type of practice (Private multi-specialty hospital, government hospital, or private clinic)',
      'Years of clinical post-graduate experience and regional reputation',
      'Patient consultation volume and inpatient admissions managed'
    ],
    job_outlook: 'The global outlook for General Physicians is exceptionally strong, with persistent shortages of primary care doctors reported in major international economies and developing nations alike.',
    interview_questions: [
      {
        question: 'How do you handle a diagnostic dilemma when patient symptoms do not clearly point to a single condition?',
        tip: 'Discuss your systematic approach: detailed history taking, targeted lab investigations, consulting evidence-based databases (UpToDate), and specialty referrals.'
      },
      {
        question: 'How do you motivate a patient with poorly controlled chronic diabetes to adhere to lifestyle changes?',
        tip: 'Emphasize motivational interviewing, realistic goal setting, patient education, and involving family support networks.'
      }
    ],
    resume_tips: [
      'List your medical council license numbers and post-graduate degree details at the top.',
      'Detail clinical procedural proficiencies (e.g. Lumbar puncture, Central line insertion, Endotracheal intubation).',
      'Mention any published clinical research or medical journal papers.'
    ],
    related_skills: ['Clinical Diagnosis', 'Internal Medicine', 'Patient Management', 'Emergency Care', 'Pharmacology'],
    related_job_role_ids: ['r_002', 'r_003', 'r_004', 'r_006', 'r_022'],
    related_article_ids: ['art-001'],
    faq_items: [
      {
        id: 'faq-1',
        question: 'What conditions does a General Physician treat?',
        answer: 'General Physicians treat everything from respiratory infections, fevers, and gastrointestinal illnesses to chronic conditions like hypertension, diabetes, thyroid disorders, and arthritis.'
      },
      {
        id: 'faq-2',
        question: 'When should a patient see a General Physician vs a Specialist?',
        answer: 'A General Physician is the recommended first step for undifferentiated symptoms, general health screenings, and overall wellness; they will coordinate referrals to sub-specialists if surgery or advanced interventions are required.'
      }
    ],
    content_status: 'published',
    published_at: '2026-08-03T00:00:00.000Z',
    last_updated: '2026-08-12',
    author_name: 'Dr. Sarah Jenkins, MD',
    editor_name: 'Candidate Portal Editorial Board',
    source_notes: 'Standard Medical Board & WHO clinical practice standards.'
  }
];

/**
 * Helper to build a clean default draft template for any of the 1,000+ roles
 */
export function buildDraftCareerGuideForRole(
  roleId: string,
  roleName: string,
  slug: string,
  industryId: string,
  departmentId: string
): CareerGuide {
  const ind = INDUSTRIES.find(i => i.id === industryId);
  const dep = DEPARTMENTS.find(d => d.id === departmentId);

  return {
    id: `cg-${slug}`,
    job_role_id: roleId,
    industry_id: industryId,
    department_id: departmentId,
    job_role_name: roleName,
    slug: slug,
    seo_title: `${roleName} Career Guide: Skills, Qualifications & Opportunities`,
    meta_description: `Learn about the ${roleName} role in ${dep?.name || 'this field'}. Explore core responsibilities, required skills, qualifications, and career opportunities.`,
    canonical_url: `/careers/${slug}`,
    short_introduction: `${roleName} professionals play an essential role within the ${dep?.name || 'industry'} sector of ${ind?.name || 'the workforce'}.`,
    overview: `A ${roleName} is a specialist in ${dep?.name || 'their field'}, responsible for executing core tasks, collaborating with team members, and upholding professional standards in ${ind?.name || 'their industry'}.`,
    responsibilities: [
      `Execute specialized ${roleName} duties according to industry best practices and organizational procedures.`,
      `Collaborate with cross-functional teams and department supervisors to achieve operational milestones.`,
      `Maintain quality, safety, and compliance standards within the work environment.`,
      `Document work outputs, report progress, and resolve day-to-day challenges.`
    ],
    day_to_day_duties: [
      `Review daily objectives and prioritize key tasks for the work shift.`,
      `Perform hands-on technical or operational tasks relevant to the ${roleName} discipline.`,
      `Coordinate with colleagues and stakeholders to ensure smooth project delivery.`
    ],
    technical_skills: [
      `${roleName} Specialized Practices`,
      'Quality Control & Safety Standards',
      'Operational Tools & Software',
      'Documentation & Reporting'
    ],
    soft_skills: [
      'Problem Solving',
      'Effective Communication',
      'Team Collaboration',
      'Attention to Detail',
      'Time Management'
    ],
    qualifications: [
      `Relevant diploma, vocational certification, or degree related to ${dep?.name || roleName}`,
      'Demonstrated practical experience or apprenticeship in the field',
      'Mandatory safety or occupational licenses where applicable'
    ],
    education_requirements: `Formal education or vocational training in ${dep?.name || 'the relevant discipline'} is generally preferred by employers.`,
    certifications: [
      'Industry-Standard Professional Certification',
      'Workplace Health & Safety Compliance'
    ],
    how_to_become: [
      `Obtain prerequisite foundational education or technical schooling in ${dep?.name || 'the field'}.`,
      `Acquire practical training through internships, apprenticeships, or entry-level roles.`,
      `Earn relevant industry certifications to validate your skills.`,
      `Build a verified professional profile to connect with hiring employers.`
    ],
    entry_level_roles: [
      `Junior ${roleName}`,
      `Assistant ${roleName}`,
      'Trainee / Apprentice'
    ],
    mid_level_roles: [
      roleName,
      `Senior ${roleName}`,
      'Specialist Technician'
    ],
    senior_level_roles: [
      `Lead ${roleName}`,
      `${dep?.name || 'Department'} Supervisor / Manager`,
      'Director / Head of Operations'
    ],
    career_path_overview: `${roleName} professionals have opportunities for steady advancement from entry-level apprenticeships to senior specialist, team lead, and managerial positions.`,
    work_environment: `Standard work settings for ${roleName} professionals depend on the specific employer, including on-site facilities, client locations, and field operations.`,
    hiring_industries: [
      ind?.name || 'Primary Industry',
      'Commercial & Corporate Enterprises',
      'Public & Private Sector Organizations'
    ],
    tools_and_technologies: [
      'Specialized Industry Tools & Equipment',
      'Digital Workflow & Management Software',
      'Safety Gear & Protective Equipment'
    ],
    salary_disclaimer: 'Salary varies by country, employer, years of experience, and specialized certifications. Verified salary benchmarks will be added as data becomes available.',
    salary_factors: [
      'Geographic location and local cost of living',
      'Years of hands-on experience and verified credentials',
      'Employer scale and project complexity'
    ],
    job_outlook: `Demand for skilled ${roleName} professionals remains positive across growing infrastructure, commercial, and industrial markets worldwide.`,
    interview_questions: [
      {
        question: `What experience do you have in performing core ${roleName} duties?`,
        tip: 'Provide concrete examples of projects completed, tools mastered, and challenges successfully resolved.'
      },
      {
        question: 'How do you ensure safety and accuracy in your daily work?',
        tip: 'Emphasize strict adherence to checklists, standard operating procedures, and double-checking outputs.'
      }
    ],
    resume_tips: [
      `List your ${roleName} qualifications, certifications, and technical skills clearly.`,
      'Highlight specific achievements and equipment/software competencies.',
      'Include verified phone contact information for employer inquiries.'
    ],
    related_skills: ['Technical Problem Solving', 'Operational Safety', 'Workflow Management'],
    related_job_role_ids: [],
    related_article_ids: [],
    faq_items: [
      {
        id: 'faq-1',
        question: `What does a ${roleName} do?`,
        answer: `A ${roleName} performs specialized tasks within ${dep?.name || 'their field'}, ensuring high quality and operational standards for their employer.`
      },
      {
        id: 'faq-2',
        question: `What qualifications are required to become a ${roleName}?`,
        answer: `Most employers look for a combination of relevant vocational or academic education, practical experience, and occupational certifications.`
      }
    ],
    content_status: 'draft',
    published_at: null,
    last_updated: new Date().toISOString().split('T')[0],
    author_name: 'Candidate Portal Editorial Board',
    editor_name: 'Editorial Team',
    source_notes: 'Initial standard framework template.'
  };
}

/**
 * Storage & Query Layer for Career Guides
 */
class CareerGuidesStore {
  private guidesMap: Map<string, CareerGuide> = new Map();

  constructor() {
    this.initStore();
    if (typeof window !== 'undefined') {
      this.syncWithServer();
    }
  }

  public async syncWithServer(): Promise<void> {
    try {
      const remoteGuides = await api.getCareerGuides();
      if (remoteGuides && remoteGuides.length > 0) {
        remoteGuides.forEach(g => {
          if (g && g.slug) {
            this.guidesMap.set(g.slug, g);
          }
        });
      }
    } catch (e) {
      console.warn('Error syncing career guides with server:', e);
    }
  }

  private initStore() {
    // Load published seed guides first
    INITIAL_PUBLISHED_GUIDES.forEach(g => {
      this.guidesMap.set(g.slug, g);
    });

    // Check localStorage for any edited/new guides saved by Admin
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_CAREER_GUIDES_KEY);
        if (stored) {
          const parsed: CareerGuide[] = JSON.parse(stored);
          parsed.forEach(g => {
            if (g && g.slug) {
              this.guidesMap.set(g.slug, g);
            }
          });
        }
      } catch (e) {
        console.warn('Error reading career guides from localStorage', e);
      }
    }
  }

  public getAll(): CareerGuide[] {
    return Array.from(this.guidesMap.values());
  }

  public getBySlug(slug: string): CareerGuide | null {
    if (this.guidesMap.has(slug)) {
      return this.guidesMap.get(slug)!;
    }

    // Try finding in existing JOB_ROLES by slug
    const matchingRole = JOB_ROLES.find(r => r.slug === slug);
    if (matchingRole) {
      const draft = buildDraftCareerGuideForRole(
        matchingRole.id,
        matchingRole.name,
        matchingRole.slug,
        matchingRole.industry_id,
        matchingRole.department_id
      );
      return draft;
    }

    return null;
  }

  public getByRoleId(roleId: string): CareerGuide | null {
    for (const guide of this.guidesMap.values()) {
      if (guide.job_role_id === roleId) {
        return guide;
      }
    }

    const matchingRole = JOB_ROLES.find(r => r.id === roleId);
    if (matchingRole) {
      return buildDraftCareerGuideForRole(
        matchingRole.id,
        matchingRole.name,
        matchingRole.slug,
        matchingRole.industry_id,
        matchingRole.department_id
      );
    }

    return null;
  }

  public save(guide: CareerGuide): void {
    guide.last_updated = new Date().toISOString().split('T')[0];
    if (guide.content_status === 'published' && !guide.published_at) {
      guide.published_at = new Date().toISOString();
    }

    this.guidesMap.set(guide.slug, guide);

    if (typeof window !== 'undefined') {
      try {
        const allGuides = Array.from(this.guidesMap.values());
        localStorage.setItem(LOCAL_STORAGE_CAREER_GUIDES_KEY, JSON.stringify(allGuides));
      } catch (e) {
        console.error('Error saving career guide to localStorage', e);
      }
    }

    // Persist to centralized server in background
    api.saveAdminCareerGuide(guide).catch(err => {
      console.warn('Failed to persist career guide to server:', err);
    });
  }

  public async saveAsync(guide: CareerGuide): Promise<{ success: boolean; guide?: CareerGuide; error?: string }> {
    this.save(guide);
    return api.saveAdminCareerGuide(guide);
  }

  public getStats() {
    const allGuides = this.getAll();
    const publishedCount = allGuides.filter(g => g.content_status === 'published').length;
    const partialCount = allGuides.filter(g => g.content_status === 'partial').length;
    const draftCount = allGuides.filter(g => g.content_status === 'draft').length;

    return {
      totalIndustries: INDUSTRIES.length,
      totalDepartments: DEPARTMENTS.length,
      totalJobRoles: JOB_ROLES.length,
      publishedGuides: publishedCount,
      partialGuides: partialCount,
      draftGuides: draftCount + (JOB_ROLES.length - allGuides.length),
      recentUpdates: allGuides
        .sort((a, b) => (b.last_updated > a.last_updated ? 1 : -1))
        .slice(0, 5)
    };
  }
}

export const careerGuidesStore = new CareerGuidesStore();

/**
 * Calculates Content Completeness percentage for Admin Editor
 */
export function calculateGuideCompleteness(guide: Partial<CareerGuide>): {
  percentage: number;
  sections: { name: string; complete: boolean; partial?: boolean }[];
} {
  const sections = [
    {
      name: 'Overview & Intro',
      complete: Boolean(guide.short_introduction && guide.overview && guide.short_introduction.length > 30)
    },
    {
      name: 'Responsibilities',
      complete: Boolean(guide.responsibilities && guide.responsibilities.length >= 3)
    },
    {
      name: 'Day-to-Day Duties',
      complete: Boolean(guide.day_to_day_duties && guide.day_to_day_duties.length >= 2)
    },
    {
      name: 'Technical & Soft Skills',
      complete: Boolean(
        guide.technical_skills && guide.technical_skills.length >= 3 &&
        guide.soft_skills && guide.soft_skills.length >= 2
      )
    },
    {
      name: 'Qualifications & How to Become',
      complete: Boolean(
        guide.qualifications && guide.qualifications.length >= 1 &&
        guide.how_to_become && guide.how_to_become.length >= 2
      )
    },
    {
      name: 'Career Progression',
      complete: Boolean(
        guide.entry_level_roles?.length || guide.senior_level_roles?.length
      )
    },
    {
      name: 'Work Environment & Tools',
      complete: Boolean(guide.work_environment && guide.tools_and_technologies?.length)
    },
    {
      name: 'Interview Questions',
      complete: Boolean(guide.interview_questions && guide.interview_questions.length >= 2)
    },
    {
      name: 'Resume Tips & Outlook',
      complete: Boolean(guide.resume_tips && guide.resume_tips.length >= 2 && guide.job_outlook)
    },
    {
      name: 'FAQ Items',
      complete: Boolean(guide.faq_items && guide.faq_items.length >= 2)
    },
    {
      name: 'SEO Metadata',
      complete: Boolean(guide.seo_title && guide.meta_description && guide.meta_description.length >= 40)
    }
  ];

  const completedCount = sections.filter(s => s.complete).length;
  const percentage = Math.round((completedCount / sections.length) * 100);

  return { percentage, sections };
}

/**
 * Returns breadcrumb path for a given role
 */
export function getBreadcrumbsForRole(roleIdOrSlug: string) {
  const role = JOB_ROLES.find(r => r.id === roleIdOrSlug || r.slug === roleIdOrSlug);
  if (!role) return null;

  const department = DEPARTMENTS.find(d => d.id === role.department_id);
  const industry = INDUSTRIES.find(i => i.id === role.industry_id);

  return {
    role,
    department,
    industry
  };
}

/**
 * Retrieves related roles from the same department or industry
 */
export function getRelatedJobRoles(roleId: string, limit = 6) {
  const role = JOB_ROLES.find(r => r.id === roleId);
  if (!role) return [];

  // First try sister roles in same department
  const sameDeptRoles = JOB_ROLES.filter(r => r.department_id === role.department_id && r.id !== role.id);
  if (sameDeptRoles.length >= limit) {
    return sameDeptRoles.slice(0, limit);
  }

  // Next add sister roles from same industry
  const sameIndustryRoles = JOB_ROLES.filter(
    r => r.industry_id === role.industry_id && r.department_id !== role.department_id && r.id !== role.id
  );

  return [...sameDeptRoles, ...sameIndustryRoles].slice(0, limit);
}

/**
 * Retrieves related blog articles for a job role or department
 */
export function getRelatedBlogArticles(industryId?: string, departmentId?: string, jobRoleId?: string) {
  return blogArticlesStore.getRelated(industryId, departmentId, jobRoleId);
}
