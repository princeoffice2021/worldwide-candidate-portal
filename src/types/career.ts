/**
 * SEO Career Content Engine Data Types
 */

export type ContentStatus = 'draft' | 'partial' | 'published';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface InterviewQuestionItem {
  question: string;
  tip: string;
}

export interface CareerPathLevel {
  title: string;
  experience_range: string;
  description: string;
  typical_titles?: string[];
}

export interface CareerGuide {
  id: string;
  job_role_id: string;
  industry_id: string;
  department_id: string;
  job_role_name: string;
  slug: string;
  
  // SEO Meta
  seo_title: string;
  meta_description: string;
  canonical_url?: string;
  og_image?: string;
  no_index?: boolean;

  // Header & Overview
  short_introduction: string;
  overview: string;

  // Responsibilities
  responsibilities: string[];
  day_to_day_duties: string[];

  // Skills
  technical_skills: string[];
  soft_skills: string[];

  // Qualifications & How to Become
  qualifications: string[];
  education_requirements: string;
  certifications: string[];
  how_to_become: string[];

  // Career Path
  entry_level_roles?: string[];
  mid_level_roles?: string[];
  senior_level_roles?: string[];
  career_path_overview?: string;

  // Environment & Hiring
  work_environment: string;
  hiring_industries: string[];
  tools_and_technologies: string[];

  // Salary Guidance (Realistic & Neutral, no fake numbers)
  salary_disclaimer: string;
  salary_factors?: string[];

  // Hiring Outlook & Interview Prep
  job_outlook: string;
  interview_questions: InterviewQuestionItem[];
  resume_tips: string[];

  // Interlinking & Taxonomies
  related_skills?: string[];
  related_job_role_ids?: string[];
  related_article_ids?: string[];
  faq_items: FAQItem[];

  // Publication & Workflow
  content_status: ContentStatus;
  published_at?: string | null;
  last_updated: string;
  author_name: string;
  editor_name?: string;
  source_notes?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'super_admin';
  name: string;
  last_login?: string;
}
