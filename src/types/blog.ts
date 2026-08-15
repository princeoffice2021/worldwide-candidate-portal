export type ArticleStatus = 'published' | 'draft' | 'in_review';

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author_name: string;
  author_role: string;
  published_at: string;
  last_updated?: string;
  updated_at?: string;
  created_at?: string;
  status: ArticleStatus;
  meta_title: string;
  meta_description: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  industry_id?: string;
  department_id?: string;
  job_role_id?: string;
  topic_ids?: string[];
  tags: string[];
  is_featured?: boolean;
  is_indexable?: boolean;
  read_time: string;
  key_takeaways?: string[];
  responsibilities?: string[];
  required_skills?: string[];
  salary_range?: string;
  interview_questions?: { question: string; tip: string }[];
  faqs?: { question: string; answer: string }[];
}

export interface BlogTopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  seo_title?: string;
  meta_description?: string;
  is_indexable?: boolean;
  created_at?: string;
  updated_at?: string;
}

