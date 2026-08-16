import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocationSelector } from '../components/LocationSelector';
import { CategorySelector } from '../components/CategorySelector';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { LocationHierarchy, WorkExperienceItem, EducationItem, LanguageItem, JobPreferences, PrivacySettings, ResumeDocument } from '../types';
import { GLOBAL_LANGUAGES, POPULAR_CURRENCIES, COMMON_SKILLS_SUGGESTIONS } from '../data/globalProfileOptions';
import { calculateCandidateCompletion } from '../lib/profileCompletion';
import { api } from '../lib/apiClient';
import { 
  Camera, 
  Save, 
  User, 
  Briefcase, 
  GraduationCap, 
  Languages, 
  FileText, 
  Shield, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle2,
  DollarSign,
  Globe,
  Settings,
  Link as LinkIcon,
  Eye,
  Download,
  Lock,
  ShieldCheck,
  Loader2
} from 'lucide-react';

interface ProfileSetupProps {
  onNavigate: (view: string) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onNavigate }) => {
  const { user, candidate, loading: authLoading, saveProfile } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      onNavigate('landing');
    }
  }, [authLoading, user, onNavigate]);

  // Active Tab for intuitive progressive disclosure
  const [activeTab, setActiveTab] = useState<'essential' | 'experience' | 'skills_education' | 'preferences_privacy'>('essential');

  // --- TAB 1: ESSENTIAL INFO ---
  const [fullName, setFullName] = useState<string>(candidate?.full_name || '');
  const [headline, setHeadline] = useState<string>(candidate?.headline || '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(candidate?.photo_url || null);
  const [gender, setGender] = useState<string>(candidate?.gender || '');

  const [categorySelection, setCategorySelection] = useState<{
    industry_id?: string | null;
    industry_name?: string | null;
    department_id?: string | null;
    department_name?: string | null;
    job_role_id?: string | null;
    job_role_name?: string | null;
    custom_profession?: string | null;
    display_label?: string;
  }>({
    industry_id: candidate?.industry_id || 'ind_healthcare',
    industry_name: candidate?.industry_name || 'Healthcare & Hospitals',
    department_id: candidate?.department_id || 'dep_nursing',
    department_name: candidate?.department_name || 'Nursing & Patient Care',
    job_role_id: candidate?.job_role_id || 'r_029',
    job_role_name: candidate?.job_role_name || candidate?.skill_category || 'Staff Nurse',
    custom_profession: candidate?.custom_profession || null,
    display_label: candidate?.custom_profession || candidate?.job_role_name || candidate?.skill_category || 'Staff Nurse',
  });

  const [experienceYears, setExperienceYears] = useState<number>(candidate?.experience_years || 0);
  const [experienceLabel, setExperienceLabel] = useState<string>(candidate?.experience_label || 'Fresher');

  const [location, setLocation] = useState<LocationHierarchy>({
    country: candidate?.country || 'India',
    country_code: candidate?.country_code || 'IN',
    admin_level_1: candidate?.admin_level_1 || 'Rajasthan',
    admin_level_1_type: candidate?.admin_level_1_type || 'State',
    admin_level_2: candidate?.admin_level_2 || 'Sri Ganganagar',
    admin_level_2_type: candidate?.admin_level_2_type || 'District',
    admin_level_3: candidate?.admin_level_3 || '',
    admin_level_3_type: candidate?.admin_level_3_type || 'Tehsil',
    village_or_town: candidate?.village_or_town || '',
    area_other: candidate?.area_other || '',
  });

  const [isAvailable, setIsAvailable] = useState<boolean>(
    candidate?.is_available !== undefined ? candidate.is_available : true
  );

  // Global Salary Handling
  const [salaryCurrency, setSalaryCurrency] = useState<string>('INR');
  const [salaryAmount, setSalaryAmount] = useState<string>('20,000');
  const [salaryPeriod, setSalaryPeriod] = useState<string>('month');

  const [bio, setBio] = useState<string>(candidate?.bio || '');

  // --- TAB 2: WORK EXPERIENCES ---
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceItem[]>(
    candidate?.work_experiences || []
  );

  // --- TAB 3: SKILLS, EDUCATION & LANGUAGES ---
  const [skills, setSkills] = useState<string[]>(candidate?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  
  const [educationList, setEducationList] = useState<EducationItem[]>(
    candidate?.education || []
  );

  const [languagesList, setLanguagesList] = useState<LanguageItem[]>(
    candidate?.languages || [{ language: 'English', proficiency: 'Conversational' }, { language: 'Hindi', proficiency: 'Native' }]
  );

  const [certifications, setCertifications] = useState<string[]>(
    candidate?.certifications || []
  );
  const [newCertInput, setNewCertInput] = useState<string>('');

  // --- TAB 4: PREFERENCES, RESUME & PRIVACY ---
  const [jobPreferences, setJobPreferences] = useState<JobPreferences>(
    candidate?.job_preferences || {
      employment_types: ['Full-Time'],
      workplace_type: 'Any',
      willing_to_relocate: true,
      notice_period_days: 0,
    }
  );

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(
    candidate?.privacy_settings || {
      profile_visibility: 'public',
      hide_phone_from_public: true,
      allow_employer_messages: true,
    }
  );

  const [resumeDoc, setResumeDoc] = useState<ResumeDocument | null>(
    candidate?.resume_document || null
  );
  const [portfolioUrl, setPortfolioUrl] = useState<string>(candidate?.portfolio_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState<string>(candidate?.linkedin_or_social || '');

  // Parse existing expected_salary string if present
  useEffect(() => {
    if (candidate?.expected_salary) {
      const match = candidate.expected_salary.match(/([^\d\s]+)?\s*([\d,]+)\s*\/\s*(\w+)/);
      if (match) {
        // match[2] is amount, match[3] is period
        setSalaryAmount(match[2]);
        setSalaryPeriod(match[3]);
      }
    }
  }, [candidate?.expected_salary]);

  // Sync state when candidate updates
  useEffect(() => {
    if (candidate) {
      if (candidate.full_name) setFullName(candidate.full_name);
      if (candidate.headline) setHeadline(candidate.headline);
      if (candidate.gender) setGender(candidate.gender);
      if (candidate.photo_url !== undefined) setPhotoUrl(candidate.photo_url);
      setCategorySelection({
        industry_id: candidate.industry_id || 'ind_healthcare',
        industry_name: candidate.industry_name || 'Healthcare & Hospitals',
        department_id: candidate.department_id || 'dep_nursing',
        department_name: candidate.department_name || 'Nursing & Patient Care',
        job_role_id: candidate.job_role_id || 'r_029',
        job_role_name: candidate.job_role_name || candidate.skill_category || 'Staff Nurse',
        custom_profession: candidate.custom_profession || null,
        display_label: candidate.custom_profession || candidate.job_role_name || candidate.skill_category || 'Staff Nurse',
      });
      if (candidate.experience_years !== undefined) setExperienceYears(candidate.experience_years);
      if (candidate.experience_label) setExperienceLabel(candidate.experience_label);
      if (candidate.country) {
        setLocation({
          country: candidate.country,
          country_code: candidate.country_code || 'IN',
          admin_level_1: candidate.admin_level_1 || '',
          admin_level_1_type: candidate.admin_level_1_type || 'State',
          admin_level_2: candidate.admin_level_2 || '',
          admin_level_2_type: candidate.admin_level_2_type || 'District',
          admin_level_3: candidate.admin_level_3 || '',
          admin_level_3_type: candidate.admin_level_3_type || 'Tehsil',
          village_or_town: candidate.village_or_town || '',
          area_other: candidate.area_other || '',
        });
      }
      if (candidate.is_available !== undefined) setIsAvailable(candidate.is_available);
      if (candidate.bio) setBio(candidate.bio);
      if (candidate.work_experiences) setWorkExperiences(candidate.work_experiences);
      if (candidate.education) setEducationList(candidate.education);
      if (candidate.skills) setSkills(candidate.skills);
      if (candidate.certifications) setCertifications(candidate.certifications);
      if (candidate.languages) setLanguagesList(candidate.languages);
      if (candidate.job_preferences) setJobPreferences(candidate.job_preferences);
      if (candidate.privacy_settings) setPrivacySettings(candidate.privacy_settings);
      if (candidate.resume_document) setResumeDoc(candidate.resume_document);
      if (candidate.portfolio_url) setPortfolioUrl(candidate.portfolio_url);
      if (candidate.linkedin_or_social) setLinkedinUrl(candidate.linkedin_or_social);
    }
  }, [candidate?.id]);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Live Completion Stats
  const completionStats = calculateCandidateCompletion({
    ...candidate,
    id: candidate?.id || 'temp',
    user_id: user?.id || 'temp',
    phone_number: user?.phone || '',
    full_name: fullName,
    photo_url: photoUrl,
    industry_id: categorySelection.industry_id,
    job_role_id: categorySelection.job_role_id,
    custom_profession: categorySelection.custom_profession,
    skill_category: categorySelection.display_label || 'Skilled',
    country: location.country,
    country_code: location.country_code,
    admin_level_1: location.admin_level_1,
    admin_level_2: location.admin_level_2,
    village_or_town: location.village_or_town,
    experience_years: experienceYears,
    experience_label: experienceLabel,
    is_available: isAvailable,
    bio: bio,
    skills: skills,
    languages: languagesList,
    work_experiences: workExperiences,
    education: educationList,
    profile_views: candidate?.profile_views || 0,
    slug: candidate?.slug || 'temp',
    created_at: '',
    updated_at: ''
  });

  // Handle Photo Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Resume Upload / Replace / Delete State
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false);
  const [isDeletingResume, setIsDeletingResume] = useState<boolean>(false);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState<string | null>(null);
  const [activeResume, setActiveResume] = useState<any>(candidate?.resume || null);
  const [resumeVisibility, setResumeVisibility] = useState<string>(
    candidate?.resume?.access_visibility || candidate?.privacy_settings?.resume_visibility || 'PRIVATE'
  );

  useEffect(() => {
    if (candidate?.resume) {
      setActiveResume(candidate.resume);
      setResumeVisibility(candidate.resume.access_visibility || candidate.privacy_settings?.resume_visibility || 'PRIVATE');
    }
  }, [candidate?.resume]);

  // Handle Real Resume Upload (PDF / DOC / DOCX < 5MB)
  const handleResumeSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeUploadError(null);
    setResumeUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';

    // Frontend validation
    const allowedExts = ['.pdf', '.doc', '.docx'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = allowedExts.some(ext => lowerName.endsWith(ext));

    if (!hasValidExt) {
      setResumeUploadError('Unsupported file type. Only PDF (recommended) or Word (.doc/.docx) documents are allowed.');
      return;
    }

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setResumeUploadError(`Resume must be ${MAX_SIZE_MB} MB or smaller. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`);
      return;
    }

    const candidateId = candidate?.id || user?.id;
    if (!candidateId) {
      setResumeUploadError('Please fill your basic profile info and save before attaching a resume.');
      return;
    }

    setIsUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('candidate_id', candidateId);
      formData.append('user_id', user?.id || '');
      formData.append('access_visibility', resumeVisibility);
      formData.append('full_name', fullName || 'Candidate');

      const res = await api.uploadResume(formData);
      if (res.success && res.data) {
        setActiveResume(res.data.resume);
        setResumeDoc({
          file_name: res.data.resume?.original_filename || file.name,
          file_size_bytes: res.data.resume?.file_size || file.size,
          uploaded_at: res.data.resume?.uploaded_at || new Date().toISOString(),
          mime_type: res.data.resume?.content_type || file.type || 'application/pdf'
        });
        setResumeUploadSuccess('Resume document uploaded and stored securely!');
      } else {
        setResumeUploadError(res.error || res.message || 'Failed to upload resume file.');
      }
    } catch (err: any) {
      setResumeUploadError(err.message || 'An unexpected error occurred during resume upload.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Handle Resume Deletion
  const handleDeleteResume = async () => {
    const candidateId = candidate?.id || user?.id;
    if (!candidateId) return;

    if (!window.confirm('Are you sure you want to delete your uploaded resume? This will remove employer access immediately.')) {
      return;
    }

    setIsDeletingResume(true);
    setResumeUploadError(null);
    setResumeUploadSuccess(null);

    try {
      const res = await api.deleteResume(candidateId);
      if (res.success) {
        setActiveResume(null);
        setResumeDoc(null);
        setResumeUploadSuccess('Resume deleted successfully. Recruiter access revoked.');
      } else {
        setResumeUploadError(res.message || 'Failed to delete resume.');
      }
    } catch (err: any) {
      setResumeUploadError(err.message || 'Failed to delete resume.');
    } finally {
      setIsDeletingResume(false);
    }
  };

  // Handle Resume Privacy Toggle
  const handleResumePrivacyChange = async (visibility: string) => {
    setResumeVisibility(visibility);
    setPrivacySettings(prev => ({
      ...prev,
      resume_visibility: visibility as any
    }));

    const candidateId = candidate?.id || user?.id;
    if (candidateId && activeResume) {
      try {
        await api.updateResumePrivacy(candidateId, visibility);
      } catch (err) {
        console.error('Failed to update resume privacy in background', err);
      }
    }
  };

  // Skill Tags Management
  const handleAddSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || newSkillInput).trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Work Experience Helpers
  const handleAddExperience = () => {
    const newExp: WorkExperienceItem = {
      id: 'exp_' + Date.now().toString(36),
      job_title: '',
      company_name: '',
      city: '',
      start_date: '',
      end_date: '',
      is_current: true,
      description: ''
    };
    setWorkExperiences([...workExperiences, newExp]);
  };

  const handleUpdateExperience = (index: number, fields: Partial<WorkExperienceItem>) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], ...fields };
    setWorkExperiences(updated);
  };

  const handleRemoveExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  // Education Helpers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: 'edu_' + Date.now().toString(36),
      degree_or_diploma: '',
      institution: '',
      field_of_study: '',
      completion_year: ''
    };
    setEducationList([...educationList, newEdu]);
  };

  const handleUpdateEducation = (index: number, fields: Partial<EducationItem>) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], ...fields };
    setEducationList(updated);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  // Language Helpers
  const handleAddLanguage = () => {
    setLanguagesList([...languagesList, { language: 'English', proficiency: 'Conversational' }]);
  };

  const handleUpdateLanguage = (index: number, fields: Partial<LanguageItem>) => {
    const updated = [...languagesList];
    updated[index] = { ...updated[index], ...fields };
    setLanguagesList(updated);
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguagesList(languagesList.filter((_, i) => i !== index));
  };

  // Save Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      setActiveTab('essential');
      return;
    }

    if (!location.country) {
      setErrorMessage('Please select your country.');
      setActiveTab('essential');
      return;
    }

    const mainCategoryTitle =
      categorySelection.custom_profession ||
      categorySelection.job_role_name ||
      'Skilled Professional';

    const formattedExpectedSalary = salaryAmount.trim() 
      ? `${salaryCurrency} ${salaryAmount.trim()}/${salaryPeriod}`
      : 'Negotiable';

    setLoading(true);
    const result = await saveProfile({
      full_name: fullName.trim(),
      headline: headline.trim() || null,
      gender: gender || null,
      photo_url: photoUrl,
      skill_category_id: categorySelection.job_role_id || '1',
      skill_category: mainCategoryTitle,
      industry_id: categorySelection.industry_id,
      industry_name: categorySelection.industry_name,
      department_id: categorySelection.department_id,
      department_name: categorySelection.department_name,
      job_role_id: categorySelection.job_role_id,
      job_role_name: categorySelection.job_role_name,
      custom_profession: categorySelection.custom_profession,
      experience_years: experienceYears,
      experience_label: experienceLabel,
      country: location.country,
      country_code: location.country_code,
      admin_level_1: location.admin_level_1,
      admin_level_1_type: location.admin_level_1_type,
      admin_level_2: location.admin_level_2,
      admin_level_2_type: location.admin_level_2_type,
      admin_level_3: location.admin_level_3,
      admin_level_3_type: location.admin_level_3_type,
      village_or_town: location.village_or_town,
      area_other: location.area_other,
      is_available: isAvailable,
      expected_salary: formattedExpectedSalary,
      bio: bio.trim(),
      
      // Phase 4 Structured Fields
      work_experiences: workExperiences,
      education: educationList,
      skills: skills,
      certifications: certifications,
      languages: languagesList,
      job_preferences: jobPreferences,
      privacy_settings: privacySettings,
      resume_document: resumeDoc,
      portfolio_url: portfolioUrl.trim() || null,
      linkedin_or_social: linkedinUrl.trim() || null,
    });
    setLoading(false);

    if (result.success) {
      onNavigate('dashboard');
    } else {
      setErrorMessage(result.message || 'Could not save profile. Please check all fields.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header & Completion Progress */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Worldwide Profile Builder
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
              {candidate ? 'Edit Professional Candidate Profile' : 'Setup Your Candidate Profile'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Complete your profile step-by-step to be discovered by global recruiters and direct employers.
            </p>
          </div>

          {/* Profile Strength Widget */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 min-w-[240px] shrink-0">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-300">Profile Strength</span>
              <span className={completionStats.totalPercentage >= 80 ? 'text-emerald-400' : 'text-blue-400'}>
                {completionStats.totalPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  completionStats.totalPercentage >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${completionStats.totalPercentage}%` }}
              />
            </div>
            {completionStats.nextBestAction && (
              <div className="mt-2 text-[10px] text-amber-300 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span className="truncate">Tip: {completionStats.nextBestAction.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('essential')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'essential'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Essential Info & Location</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'experience'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. Work Experience ({workExperiences.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills_education')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'skills_education'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>3. Skills & Education</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences_privacy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'preferences_privacy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>4. Resume & Privacy</span>
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: ESSENTIAL INFO & WORLDWIDE LOCATION */}
          {/* ========================================================= */}
          {activeTab === 'essential' && (
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
              
              {/* Photo & Name Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Photo Upload */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative group cursor-pointer">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Profile Preview"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-600 shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-blue-50 text-blue-600 border-2 border-dashed border-blue-300 flex flex-col items-center justify-center font-bold text-xs">
                        <User className="w-8 h-8 text-blue-600 mb-1" />
                        <span>Upload Photo</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer text-xs font-bold">
                      <Camera className="w-5 h-5 mr-1" />
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {photoError && <p className="text-[10px] text-red-600 font-bold mt-1">{photoError}</p>}
                  <span className="text-[10px] text-slate-500 mt-1">Photo (JPG/PNG &lt; 5MB)</span>
                </div>

                {/* Name & Headline */}
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Full Legal / Professional Name *
                      </label>
                      <VoiceInputButton
                        onTranscript={(text) => setFullName(fullName ? `${fullName} ${text}` : text)}
                        fieldLabel="Full Name"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Gonzalez, Ramesh Kumar, John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Professional Headline / Summary Line
                      </label>
                      <VoiceInputButton
                        onTranscript={(text) => setHeadline(headline ? `${headline} ${text}` : text)}
                        fieldLabel="Headline"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Experienced ICU Staff Nurse | 5+ Years in Critical Care"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Hierarchical Classification (Industry -> Department -> Job Role) */}
              <div className="space-y-4">
                <CategorySelector
                  value={categorySelection}
                  onChange={(sel) => setCategorySelection(sel)}
                />

                {/* Experience Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Total Experience Years *
                    </label>
                    <select
                      value={experienceLabel}
                      onChange={(e) => {
                        const val = e.target.value;
                        let yrs = 0;
                        if (val === '1 Year') yrs = 1;
                        else if (val === '2 Years') yrs = 2;
                        else if (val === '3 Years') yrs = 3;
                        else if (val === '5+ Years') yrs = 5;
                        else if (val === '10+ Years') yrs = 10;
                        setExperienceLabel(val);
                        setExperienceYears(yrs);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="Fresher">Fresher / Entry Level (&lt; 1 Year)</option>
                      <option value="1 Year">1 Year Experience</option>
                      <option value="2 Years">2 Years Experience</option>
                      <option value="3 Years">3 Years Experience</option>
                      <option value="5+ Years">5+ Years Experience</option>
                      <option value="10+ Years">10+ Years Experience</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Gender (Optional)
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary / Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Worldwide Location Hierarchy */}
              <div className="pt-2">
                <LocationSelector value={location} onChange={setLocation} />
              </div>

              {/* Availability & Worldwide Currency / Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Available for Work Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Current Job Availability
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAvailable(!isAvailable)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isAvailable ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isAvailable ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-extrabold ${isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {isAvailable ? '🟢 Available for Immediate Hire' : '⚪ Not Currently Seeking'}
                    </span>
                  </div>
                </div>

                {/* Worldwide Expected Salary (Currency + Amount + Period) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Expected Salary / Compensation
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <select
                      value={salaryCurrency}
                      onChange={(e) => setSalaryCurrency(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      {POPULAR_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="e.g. 25,000 or 3,500"
                      value={salaryAmount}
                      onChange={(e) => setSalaryAmount(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    />

                    <select
                      value={salaryPeriod}
                      onChange={(e) => setSalaryPeriod(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="month">/ month</option>
                      <option value="year">/ year</option>
                      <option value="hour">/ hour</option>
                      <option value="day">/ day</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Multilingual Bio */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Professional Bio / Summary (Any Language / Unicode preserved)
                  </label>
                  <VoiceInputButton
                    onTranscript={(text) => setBio(bio ? `${bio} ${text}` : text)}
                    fieldLabel="Biography"
                  />
                </div>
                <textarea
                  rows={3}
                  maxLength={600}
                  placeholder="Describe your background, specialty, previous accomplishments, or personal career goals in any language..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>Supports English, Hindi, Arabic, Spanish, Punjabi, French, etc.</span>
                  <span>{bio.length} / 600 characters</span>
                </div>
              </div>

              {/* Navigation button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('experience')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Continue to Work Experience &rarr;
                </button>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: WORK EXPERIENCES */}
          {/* ========================================================= */}
          {activeTab === 'experience' && (
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Work Experience Entries</h3>
                  <p className="text-xs text-slate-500">Add current or past employment history to build trust with employers.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              {workExperiences.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center space-y-3">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">No work experience entries added yet.</p>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    + Add First Work Role
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {workExperiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-700">Role #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Job Title *</label>
                          <input
                            type="text"
                            placeholder="e.g. Senior ICU Nurse"
                            value={exp.job_title}
                            onChange={(e) => handleUpdateExperience(idx, { job_title: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Company / Hospital / Employer *</label>
                          <input
                            type="text"
                            placeholder="e.g. Apollo Hospital"
                            value={exp.company_name}
                            onChange={(e) => handleUpdateExperience(idx, { company_name: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">City / Country</label>
                          <input
                            type="text"
                            placeholder="e.g. Dubai, UAE"
                            value={exp.city || ''}
                            onChange={(e) => handleUpdateExperience(idx, { city: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date</label>
                          <input
                            type="text"
                            placeholder="e.g. 2021-04 or 2021"
                            value={exp.start_date}
                            onChange={(e) => handleUpdateExperience(idx, { start_date: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date</label>
                          <input
                            type="text"
                            placeholder={exp.is_current ? 'Present' : 'e.g. 2024-01'}
                            disabled={exp.is_current}
                            value={exp.is_current ? '' : (exp.end_date || '')}
                            onChange={(e) => handleUpdateExperience(idx, { end_date: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`current_${idx}`}
                          checked={exp.is_current}
                          onChange={(e) => handleUpdateExperience(idx, { is_current: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`current_${idx}`} className="text-xs font-semibold text-slate-700">
                          I currently work here
                        </label>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Role Responsibilities / Highlights</label>
                        <textarea
                          rows={2}
                          placeholder="Managed critical care patients, coordinated with senior doctors, supervised 4 junior nurses..."
                          value={exp.description || ''}
                          onChange={(e) => handleUpdateExperience(idx, { description: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('essential')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('skills_education')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Continue to Skills & Education &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: SKILLS, EDUCATION & LANGUAGES */}
          {/* ========================================================= */}
          {activeTab === 'skills_education' && (
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
              
              {/* SECTION A: KEY SKILLS TAGS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Key Skills & Competencies</h3>
                    <p className="text-xs text-slate-500">Add technical skills, tools, or specializations to match specific employer searches.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Critical Care, BLS, Python, Forklift Operation..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Add Skill
                  </button>
                </div>

                {/* Selected Skills Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1.5"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-500 hover:text-red-600 font-bold ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No skills added yet. Add at least 2 skills for optimal discovery.</p>
                  )}
                </div>

                {/* Suggested Quick Add Skills */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Quick suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SKILLS_SUGGESTIONS.default.concat(COMMON_SKILLS_SUGGESTIONS.healthcare.slice(0, 3)).map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddSkill(sug)}
                        disabled={skills.includes(sug)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          skills.includes(sug)
                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION B: EDUCATION */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Education & Qualifications</h3>
                    <p className="text-xs text-slate-500">Add your degrees, diplomas, or trade certificates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                </div>

                {educationList.map((edu, idx) => (
                  <div key={edu.id || idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-700">Education #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Degree / Diploma / Certificate *</label>
                        <input
                          type="text"
                          placeholder="e.g. B.Sc in Nursing, High School Diploma"
                          value={edu.degree_or_diploma}
                          onChange={(e) => handleUpdateEducation(idx, { degree_or_diploma: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Institution / College / University *</label>
                        <input
                          type="text"
                          placeholder="e.g. University of Delhi, State Technical Institute"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(idx, { institution: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Field of Study</label>
                        <input
                          type="text"
                          placeholder="e.g. Nursing, Mechanical Engineering"
                          value={edu.field_of_study || ''}
                          onChange={(e) => handleUpdateEducation(idx, { field_of_study: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Year of Completion</label>
                        <input
                          type="text"
                          placeholder="e.g. 2020"
                          value={edu.completion_year || ''}
                          onChange={(e) => handleUpdateEducation(idx, { completion_year: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION C: GLOBAL LANGUAGES */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Languages Spoken</h3>
                    <p className="text-xs text-slate-500">Specify languages you can communicate in (crucial for multinational jobs).</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Language</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {languagesList.map((lang, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center space-x-2">
                      <select
                        value={lang.language}
                        onChange={(e) => handleUpdateLanguage(idx, { language: e.target.value })}
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 flex-1 outline-none"
                      >
                        {GLOBAL_LANGUAGES.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>

                      <select
                        value={lang.proficiency}
                        onChange={(e) => handleUpdateLanguage(idx, { proficiency: e.target.value as any })}
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Native">Native</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(idx)}
                        className="text-red-500 hover:text-red-700 p-1 font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('experience')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preferences_privacy')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Continue to Resume & Privacy &rarr;
                </button>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: JOB PREFERENCES, RESUME & PRIVACY */}
          {/* ========================================================= */}
          {activeTab === 'preferences_privacy' && (
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
              
              {/* SECTION A: RESUME DOCUMENT UPLOAD */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Resume / CV Document</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload your official PDF resume (up to 5 MB). Stored securely outside public directories.
                    </p>
                  </div>
                  {activeResume && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified Document Attached
                    </span>
                  )}
                </div>

                {/* Status Banners */}
                {resumeUploadSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{resumeUploadSuccess}</span>
                  </div>
                )}

                {resumeUploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-semibold">{resumeUploadError}</span>
                  </div>
                )}

                {/* Resume Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  {activeResume ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm shrink-0 border border-red-200 shadow-2xs">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-extrabold text-slate-900 block truncate max-w-xs sm:max-w-md">
                            {activeResume.original_filename || 'Candidate_Resume.pdf'}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-medium">
                              {activeResume.file_size ? `${(activeResume.file_size / 1024).toFixed(1)} KB` : 'PDF Document'}
                            </span>
                            <span>•</span>
                            <span>Uploaded {new Date(activeResume.uploaded_at || Date.now()).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 uppercase">{activeResume.content_type?.split('/')[1] || 'PDF'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* View in new tab */}
                        <a
                          href={`/api/candidates/${candidate?.id || user?.id}/resume/view?candidate_id=${candidate?.id || user?.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View PDF</span>
                        </a>

                        {/* Download button */}
                        <a
                          href={`/api/candidates/${candidate?.id || user?.id}/resume/download?candidate_id=${candidate?.id || user?.id}`}
                          download
                          className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Download</span>
                        </a>

                        {/* Replace button */}
                        <label className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-2xs">
                          {isUploadingResume ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Replace</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            disabled={isUploadingResume || isDeletingResume}
                            onChange={handleResumeSelect}
                            className="hidden"
                          />
                        </label>

                        {/* Delete button */}
                        <button
                          type="button"
                          disabled={isDeletingResume || isUploadingResume}
                          onClick={handleDeleteResume}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs font-bold px-2.5 py-2 rounded-xl border border-transparent hover:border-red-200 transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                        >
                          {isDeletingResume ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                      <div className="flex items-center space-x-3 text-slate-500">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-700 block">No Resume Document Attached</span>
                          <span className="text-[11px] text-slate-400">PDF, DOC, or DOCX formats up to 5 MB supported.</span>
                        </div>
                      </div>

                      <label className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 shadow-xs">
                        {isUploadingResume ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading & Storing File...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Upload Resume (PDF &lt; 5MB)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          disabled={isUploadingResume}
                          onChange={handleResumeSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Dedicated Resume Privacy Options */}
                  <div className="pt-3 border-t border-slate-200">
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>Resume Recruiter Access Setting</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <label 
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                          resumeVisibility === 'PRIVATE' 
                            ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500 text-blue-900' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="resume_vis_option"
                            value="PRIVATE"
                            checked={resumeVisibility === 'PRIVATE'}
                            onChange={() => handleResumePrivacyChange('PRIVATE')}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-extrabold">Private (Default)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 pl-5">
                          Only you can view or download. Direct recruiter access is blocked.
                        </p>
                      </label>

                      <label 
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                          resumeVisibility === 'ELIGIBLE_EMPLOYERS' 
                            ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500 text-blue-900' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="resume_vis_option"
                            value="ELIGIBLE_EMPLOYERS"
                            checked={resumeVisibility === 'ELIGIBLE_EMPLOYERS'}
                            onChange={() => handleResumePrivacyChange('ELIGIBLE_EMPLOYERS')}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-extrabold">Eligible Employers</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 pl-5">
                          Recruiters with active portal quota can view &amp; download your resume.
                        </p>
                      </label>

                      <label 
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                          resumeVisibility === 'EMPLOYER_REQUEST_REQUIRED' 
                            ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500 text-blue-900' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="resume_vis_option"
                            value="EMPLOYER_REQUEST_REQUIRED"
                            checked={resumeVisibility === 'EMPLOYER_REQUEST_REQUIRED'}
                            onChange={() => handleResumePrivacyChange('EMPLOYER_REQUEST_REQUIRED')}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-extrabold">Request Required</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 pl-5">
                          Recruiters must send an explicit access request before viewing.
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: PORTFOLIO & SOCIAL LINKS */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">Portfolio & Professional Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Portfolio / Personal Website</label>
                    <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs">
                      <Globe className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="url"
                        placeholder="https://myportfolio.com"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="bg-transparent text-slate-900 font-medium w-full outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">LinkedIn / Social Profile</label>
                    <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs">
                      <LinkIcon className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="bg-transparent text-slate-900 font-medium w-full outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: JOB WORKPLACE PREFERENCES */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Job & Workplace Preferences</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Workplace Arrangement</label>
                    <select
                      value={jobPreferences.workplace_type || 'Any'}
                      onChange={(e) => setJobPreferences({ ...jobPreferences, workplace_type: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="Any">Any (On-Site, Remote, or Hybrid)</option>
                      <option value="On-Site">On-Site Only</option>
                      <option value="Remote">Remote / Work-From-Home Only</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Notice Period</label>
                    <select
                      value={jobPreferences.notice_period_days || 0}
                      onChange={(e) => setJobPreferences({ ...jobPreferences, notice_period_days: parseInt(e.target.value, 10) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value={0}>Immediate Joiner (0 Days)</option>
                      <option value={15}>15 Days</option>
                      <option value={30}>30 Days (1 Month)</option>
                      <option value={60}>60 Days (2 Months)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="relocate_pref"
                    checked={jobPreferences.willing_to_relocate ?? true}
                    onChange={(e) => setJobPreferences({ ...jobPreferences, willing_to_relocate: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="relocate_pref" className="text-xs font-bold text-slate-800">
                    Willing to relocate for the right job opportunity (Domestic or Abroad)
                  </label>
                </div>
              </div>

              {/* SECTION D: PRIVACY & PHONE NUMBER PROTECTION */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Privacy & Visibility Controls</h3>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">Automated Phone Privacy Active</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Your direct phone number ({user?.phone}) is automatically masked (e.g. +91 ****** 1234) on public search. Only registered employers with active subscription unlocks can view your direct call/contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Profile Search Visibility</label>
                    <select
                      value={privacySettings.profile_visibility || 'public'}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, profile_visibility: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="public">Public & Searchable (Recommended)</option>
                      <option value="searchable_only">Searchable to Verified Employers Only</option>
                      <option value="private">Private (Only Accessible via Direct Link)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Navigation & Submit Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('skills_education')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  &larr; Back
                </button>
              </div>

            </div>
          )}

          {/* MASTER SAVE BUTTON */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Changes are saved to the centralized candidate database immediately.
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 px-8 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Saving Candidate Profile...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Candidate Profile</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
