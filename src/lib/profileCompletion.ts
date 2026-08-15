import { Candidate } from '../types';

export interface CompletionBreakdown {
  totalPercentage: number;
  completedCount: number;
  totalSteps: number;
  sections: {
    name: string;
    isComplete: boolean;
    weight: number;
    description: string;
  }[];
  nextBestAction: {
    title: string;
    description: string;
    sectionKey: string;
  } | null;
}

export function calculateCandidateCompletion(candidate: Candidate | null | undefined): CompletionBreakdown {
  if (!candidate) {
    return {
      totalPercentage: 0,
      completedCount: 0,
      totalSteps: 8,
      sections: [],
      nextBestAction: {
        title: 'Create Candidate Profile',
        description: 'Add your basic professional identity to become searchable.',
        sectionKey: 'basic'
      }
    };
  }

  const sections = [
    {
      name: 'Basic Information & Name',
      key: 'basic',
      isComplete: Boolean(candidate.full_name && candidate.full_name.trim().length > 1),
      weight: 15,
      description: 'Your verified name and phone contact'
    },
    {
      name: 'Professional Headshot / Photo',
      key: 'photo',
      isComplete: Boolean(candidate.photo_url),
      weight: 10,
      description: 'A clean professional photo increases profile views by 3x'
    },
    {
      name: 'Industry & Job Role Taxonomy',
      key: 'taxonomy',
      isComplete: Boolean(candidate.industry_id && (candidate.job_role_id || candidate.custom_profession || candidate.skill_category)),
      weight: 15,
      description: 'Structured category classification for employer discovery'
    },
    {
      name: 'Worldwide Location',
      key: 'location',
      isComplete: Boolean(candidate.country && (candidate.admin_level_1 || candidate.admin_level_2 || candidate.village_or_town)),
      weight: 15,
      description: 'Country, State/Province, and City or Village'
    },
    {
      name: 'Experience & Work History',
      key: 'experience',
      isComplete: Boolean((candidate.work_experiences && candidate.work_experiences.length > 0) || (candidate.experience_years !== undefined && candidate.experience_years > 0)),
      weight: 15,
      description: 'Total experience years or structured past job entries'
    },
    {
      name: 'Skills & Competencies',
      key: 'skills',
      isComplete: Boolean(candidate.skills && candidate.skills.length >= 2),
      weight: 10,
      description: 'Add at least 2 relevant technical or functional skills'
    },
    {
      name: 'Languages & Education',
      key: 'education_languages',
      isComplete: Boolean((candidate.languages && candidate.languages.length > 0) || (candidate.education && candidate.education.length > 0)),
      weight: 10,
      description: 'Spoken languages or education/certifications'
    },
    {
      name: 'Professional Biography / Summary',
      key: 'bio',
      isComplete: Boolean(candidate.bio && candidate.bio.trim().length >= 20),
      weight: 10,
      description: 'A 2-3 sentence overview of your capabilities and background'
    },
    {
      name: 'Verified Resume / CV Document',
      key: 'resume',
      isComplete: Boolean((candidate.resume && candidate.resume.status === 'active') || candidate.has_resume),
      weight: 10,
      description: 'Upload your verified PDF resume for direct recruiter evaluation'
    }
  ];

  let totalWeightEarned = 0;
  let completedCount = 0;

  for (const s of sections) {
    if (s.isComplete) {
      totalWeightEarned += s.weight;
      completedCount++;
    }
  }

  // Find next best action
  const firstIncomplete = sections.find(s => !s.isComplete);
  let nextBestAction = null;

  if (firstIncomplete) {
    if (firstIncomplete.key === 'photo') {
      nextBestAction = {
        title: 'Upload Profile Photo',
        description: 'Add a friendly photo so employers recognize your profile faster (+10%).',
        sectionKey: 'photo'
      };
    } else if (firstIncomplete.key === 'skills') {
      nextBestAction = {
        title: 'Add Key Skills',
        description: 'List 2-5 technical or trade skills to match specific job filters (+10%).',
        sectionKey: 'skills'
      };
    } else if (firstIncomplete.key === 'education_languages') {
      nextBestAction = {
        title: 'Add Languages Spoken',
        description: 'Specify which languages you speak to qualify for multilingual jobs (+10%).',
        sectionKey: 'languages'
      };
    } else if (firstIncomplete.key === 'experience') {
      nextBestAction = {
        title: 'Add Work Experience',
        description: 'Add previous roles or employers to build trust with recruiters (+15%).',
        sectionKey: 'experience'
      };
    } else if (firstIncomplete.key === 'bio') {
      nextBestAction = {
        title: 'Write a Short Bio',
        description: 'Describe your background, specialty, and availability in your own words (+10%).',
        sectionKey: 'bio'
      };
    } else {
      nextBestAction = {
        title: `Complete ${firstIncomplete.name}`,
        description: firstIncomplete.description,
        sectionKey: firstIncomplete.key
      };
    }
  }

  return {
    totalPercentage: Math.min(100, totalWeightEarned),
    completedCount,
    totalSteps: sections.length,
    sections,
    nextBestAction
  };
}
