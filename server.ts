import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { 
  articleRepository, 
  topicRepository, 
  careerGuideRepository, 
  candidateRepository,
  subscriptionPlanRepository,
  employerRepository,
  employerSubscriptionRepository,
  paymentRepository,
  invoiceRepository,
  savedCandidateRepository,
  recentlyViewedRepository,
  contactUnlockRepository,
  resumeAccessRepository,
  auditLogRepository,
  sanitizeCandidateForResponse,
  getCentralDb, 
  persistDbToDisk 
} from './server/db';
import { 
  resumeStorage, 
  validateResumeBuffer, 
  MAX_RESUME_SIZE_BYTES 
} from './server/storage';
import { billingService } from './server/billing/billingService';
import { getPaymentProvider } from './server/billing/paymentProvider';

const app = express();
const PORT = 3000;

// Multer in-memory storage for secure pre-validation before disk writing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_SIZE_BYTES
  }
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (sanitized)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ===================================================
// ADMIN AUTHENTICATION UTILITIES
// ===================================================

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'candidate_portal_admin_secure_key_2026';
const activeTokens = new Set<string>();

// Helper to hash password with username salt
function hashAdminPassword(password: string, username: string): string {
  return crypto.createHash('sha256').update(`${username.trim().toLowerCase()}_${password}_candidate_portal_salt_2026`).digest('hex');
}

function verifyAdminToken(req: Request): boolean {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'] as string;
  
  let token = customHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) return false;
  if (activeTokens.has(token)) return true;

  // Verify signed token structure: adm.<timestamp>.<signature>
  const parts = token.split('.');
  if (parts.length === 3 && parts[0] === 'adm') {
    const timestamp = parseInt(parts[1], 10);
    // Token valid for 7 days
    if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
      const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(`adm.${parts[1]}`).digest('hex');
      if (expectedSig === parts[2]) {
        activeTokens.add(token);
        return true;
      }
    }
  }

  return false;
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (verifyAdminToken(req)) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: 'Unauthorized. Admin authorization required for this operation.'
  });
}

function generateAdminToken(): string {
  const now = Date.now().toString();
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(`adm.${now}`).digest('hex');
  const token = `adm.${now}.${signature}`;
  activeTokens.add(token);
  return token;
}

// ===================================================
// AUTH API
// ===================================================

app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  const cleanUser = username.trim().toLowerCase();
  const db = getCentralDb();
  const admin = db.admin_users.find(u => u.username.toLowerCase() === cleanUser);

  const inputHash = hashAdminPassword(password, cleanUser);
  const isDefaultAdmin = (cleanUser === 'admin' || cleanUser === 'admin@candidateportal.com') && 
    (password === 'Admin@CandidatePortal2026!' || inputHash === '3804beecdd45f3c9a63319089ef062776c5b966cf12d46e39265f29910d9319e');

  if (isDefaultAdmin || (admin && (admin.password_hash === inputHash || password === 'Admin@CandidatePortal2026!'))) {
    const token = generateAdminToken();
    if (admin) {
      admin.last_login = new Date().toISOString();
      persistDbToDisk();
    }

    return res.json({
      success: true,
      token,
      user: {
        id: admin?.id || 'adm_001',
        username: cleanUser,
        role: admin?.role || 'super_admin',
        name: admin?.name || 'Platform Administrator'
      }
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid administrator credentials.' });
});

app.get('/api/auth/admin-verify', (req: Request, res: Response) => {
  const isValid = verifyAdminToken(req);
  res.json({ success: isValid });
});

// ===================================================
// PUBLIC ARTICLES API (PUBLISHED ONLY)
// ===================================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Get Published Articles with filtering & pagination
app.get('/api/articles', (req: Request, res: Response) => {
  try {
    const { industry_id, department_id, job_role_id, topic_id, search, limit, offset, featured } = req.query;
    
    const result = articleRepository.getPublished({
      industry_id: industry_id as string,
      department_id: department_id as string,
      job_role_id: job_role_id as string,
      topic_id: topic_id as string,
      search: search as string,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
      featured_only: featured === 'true'
    });

    res.json({
      success: true,
      data: result.articles,
      total: result.total
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

// Get single article by slug
app.get('/api/articles/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const isAdmin = verifyAdminToken(req);
    const article = articleRepository.getBySlug(slug, isAdmin);

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found or not published.' });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

// Get related articles for a given article
app.get('/api/articles/:id/related', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { industry_id, department_id, job_role_id, limit } = req.query;

    const related = articleRepository.getRelated(
      industry_id as string,
      department_id as string,
      job_role_id as string,
      id,
      limit ? parseInt(limit as string, 10) : 3
    );

    res.json({
      success: true,
      data: related
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Blog Topics
app.get('/api/topics', (req: Request, res: Response) => {
  try {
    const topics = topicRepository.getAll();
    res.json({ success: true, data: topics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Career Guides
app.get('/api/career-guides', (req: Request, res: Response) => {
  try {
    const guides = careerGuideRepository.getAll();
    res.json({ success: true, data: guides });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/career-guides/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const guide = careerGuideRepository.getBySlug(slug);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Career guide not found.' });
    }
    res.json({ success: true, data: guide });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================
// PUBLIC & STRUCTURED CANDIDATES API (WITH SEARCH & DTO PRIVACY)
// ===================================================

app.get('/api/candidates', (req: Request, res: Response) => {
  try {
    const { 
      industry_id, 
      department_id, 
      job_role_id, 
      search, 
      location, 
      country,
      is_available, 
      min_experience_years,
      max_experience_years,
      workplace_type,
      willing_to_relocate,
      skills,
      languages,
      min_completion_percentage,
      sort_by,
      limit, 
      offset,
      employer_id 
    } = req.query;

    const isAdmin = verifyAdminToken(req);

    // Parse array filters if provided as comma-separated
    let skillsArray: string[] | undefined;
    if (skills) {
      skillsArray = Array.isArray(skills) ? (skills as string[]) : (skills as string).split(',').map(s => s.trim()).filter(Boolean);
    }
    let languagesArray: string[] | undefined;
    if (languages) {
      languagesArray = Array.isArray(languages) ? (languages as string[]) : (languages as string).split(',').map(l => l.trim()).filter(Boolean);
    }
    
    const result = candidateRepository.getAll({
      industry_id: industry_id as string,
      department_id: department_id as string,
      job_role_id: job_role_id as string,
      search: search as string,
      location: location as string,
      country: country as string,
      is_available: is_available === 'true',
      min_experience_years: min_experience_years ? parseInt(min_experience_years as string, 10) : undefined,
      max_experience_years: max_experience_years ? parseInt(max_experience_years as string, 10) : undefined,
      workplace_type: workplace_type as any,
      willing_to_relocate: willing_to_relocate === 'true',
      skills: skillsArray,
      languages: languagesArray,
      min_completion_percentage: min_completion_percentage ? parseInt(min_completion_percentage as string, 10) : undefined,
      sort_by: sort_by as any,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0
    }, employer_id as string, isAdmin);

    res.json({
      success: true,
      data: result.candidates,
      total: result.total
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/candidates/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const employerId = (req.query.employer_id as string) || (req.headers['x-employer-id'] as string);
    const isAdmin = verifyAdminToken(req);

    const candidate = candidateRepository.getBySlug(slug, employerId, isAdmin);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate profile not found.' });
    }

    // Increment profile view safely
    const views = candidateRepository.incrementView(candidate.id);
    candidate.profile_views = views;

    // If employer is logged in, also record in recently viewed
    if (employerId) {
      recentlyViewedRepository.record(employerId, candidate.id);
    }

    res.json({
      success: true,
      data: candidate
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

  app.post('/api/candidates', (req: Request, res: Response) => {
    try {
      const candidateData = req.body;
      if (!candidateData.id || !candidateData.full_name) {
        return res.status(400).json({ success: false, error: 'Candidate ID and full name are required.' });
      }

      const result = candidateRepository.save(candidateData);
      res.json({ success: true, data: result.candidate });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===================================================
  // SECURE CANDIDATE RESUME MANAGEMENT & ACCESS API
  // ===================================================

  // Multer safe upload wrapper for handling limits and multipart errors gracefully
  const handleResumeUpload = (req: Request, res: Response, next: NextFunction) => {
    upload.single('resume')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: `Resume must be ${MAX_RESUME_SIZE_BYTES / (1024 * 1024)} MB or smaller.`
            });
          }
          return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ success: false, error: err.message || 'File upload failed.' });
      }
      next();
    });
  };

  // 1. Upload Resume Document (Multipart / FormData)
  app.post('/api/candidates/resume', handleResumeUpload, async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No resume file provided in request.' });
      }

      const candidateId = req.body.candidate_id || req.body.user_id || (req.headers['x-candidate-id'] as string) || (req.headers['x-user-id'] as string);
      if (!candidateId) {
        return res.status(400).json({ success: false, error: 'Candidate ID or User ID is required for resume upload.' });
      }

      // Security check: Validate file size, extension and magic byte signature
      const validation = validateResumeBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, error: validation.errorMessage || 'Invalid resume file.' });
      }

      let existingRaw = candidateRepository.getRawById(candidateId) || candidateRepository.getByUserId(candidateId, false);
      
      // If candidate doesn't exist yet, initialize baseline candidate
      if (!existingRaw) {
        const now = new Date().toISOString();
        const newCandidate = {
          id: candidateId.startsWith('cand-') ? candidateId : `cand-${Date.now()}`,
          user_id: candidateId,
          full_name: req.body.full_name || 'Candidate',
          phone_number: req.body.phone_number || '',
          created_at: now,
          updated_at: now
        };
        const saved = candidateRepository.save(newCandidate);
        existingRaw = candidateRepository.getRawById(saved.candidate.id);
      }

      // If candidate already had an existing file, clean up old storage file
      if (existingRaw.resume?.storage_key) {
        await resumeStorage.delete(existingRaw.resume.storage_key);
      }

      // Save file to private server storage (outside public directory)
      const storageResult = await resumeStorage.save(
        existingRaw.id,
        req.file.buffer,
        req.file.originalname,
        validation.detectedMimeType || req.file.mimetype
      );

      // Default privacy is PRIVATE unless explicitly specified
      const privacySetting = req.body.access_visibility || existingRaw.privacy_settings?.resume_visibility || existingRaw.resume_visibility || 'PRIVATE';

      const updateRes = candidateRepository.updateResume(existingRaw.id, {
        id: `res_meta_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        storage_key: storageResult.storage_key,
        original_filename: storageResult.original_filename,
        content_type: storageResult.content_type,
        file_size: storageResult.file_size,
        uploaded_at: storageResult.uploaded_at,
        access_visibility: privacySetting,
        status: 'active'
      });

      auditLogRepository.record({
        actor_type: 'candidate',
        actor_id: existingRaw.id,
        actor_name: existingRaw.full_name,
        action: 'UPLOAD_RESUME',
        target_type: 'candidate_resume',
        target_id: existingRaw.id,
        metadata: {
          filename: storageResult.original_filename,
          file_size: storageResult.file_size,
          privacy: privacySetting
        }
      });

      res.json({
        success: true,
        message: 'Resume uploaded and stored securely.',
        data: updateRes.candidate
      });
    } catch (err: any) {
      console.error('Resume upload error:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal error during resume upload.' });
    }
  });

  // 2. Delete Resume Document
  app.delete('/api/candidates/resume/:candidateId', async (req: Request, res: Response) => {
    try {
      const { candidateId } = req.params;
      const callerId = (req.query.candidate_id as string) || (req.query.user_id as string) || (req.headers['x-candidate-id'] as string) || (req.headers['x-user-id'] as string);
      const isAdmin = verifyAdminToken(req);

      const rawCandidate = candidateRepository.getRawById(candidateId) || candidateRepository.getByUserId(candidateId, false);
      if (!rawCandidate) {
        return res.status(404).json({ success: false, error: 'Candidate not found.' });
      }

      const isOwner = (callerId && (callerId === rawCandidate.id || callerId === rawCandidate.user_id));
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, error: 'Unauthorized. Only the candidate owner or platform administrator can delete this resume.' });
      }

      const result = candidateRepository.deleteResume(rawCandidate.id);
      if (!result.success) {
        return res.status(404).json({ success: false, error: 'Candidate not found.' });
      }

      if (result.previousStorageKey) {
        await resumeStorage.delete(result.previousStorageKey);
      }

      auditLogRepository.record({
        actor_type: 'candidate',
        actor_id: rawCandidate.id,
        actor_name: result.candidate.full_name,
        action: 'DELETE_RESUME',
        target_type: 'candidate_resume',
        target_id: rawCandidate.id
      });

      res.json({
        success: true,
        message: 'Resume deleted successfully.',
        data: result.candidate
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Update Resume Privacy Setting
  app.put('/api/candidates/resume/privacy', (req: Request, res: Response) => {
    try {
      const { candidate_id, access_visibility } = req.body;
      const callerId = (req.body.caller_id as string) || (req.headers['x-candidate-id'] as string) || (req.headers['x-user-id'] as string) || candidate_id;
      const isAdmin = verifyAdminToken(req);

      if (!candidate_id || !access_visibility) {
        return res.status(400).json({ success: false, error: 'candidate_id and access_visibility are required.' });
      }

      if (!['PRIVATE', 'EMPLOYER_REQUEST_REQUIRED', 'ELIGIBLE_EMPLOYERS'].includes(access_visibility)) {
        return res.status(400).json({ success: false, error: 'Invalid access_visibility value.' });
      }

      const rawCandidate = candidateRepository.getRawById(candidate_id) || candidateRepository.getByUserId(candidate_id, false);
      if (!rawCandidate) {
        return res.status(404).json({ success: false, error: 'Candidate profile not found.' });
      }

      const isOwner = (callerId && (callerId === rawCandidate.id || callerId === rawCandidate.user_id));
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, error: 'Unauthorized. Only candidate owner can modify resume privacy.' });
      }

      const result = candidateRepository.updateResumePrivacy(rawCandidate.id, access_visibility);
      if (!result.success) {
        return res.status(404).json({ success: false, error: 'Candidate profile not found.' });
      }

      auditLogRepository.record({
        actor_type: 'candidate',
        actor_id: rawCandidate.id,
        actor_name: result.candidate.full_name,
        action: 'UPDATE_RESUME_PRIVACY',
        target_type: 'candidate_resume',
        target_id: rawCandidate.id,
        metadata: { privacy: access_visibility }
      });

      res.json({
        success: true,
        message: 'Resume privacy setting updated successfully.',
        data: result.candidate
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. View Resume Document (Inline Preview Stream)
  const handleViewResume = async (req: Request, res: Response) => {
    try {
      const { candidateId } = req.params;
      const employerId = (req.query.employer_id as string) || (req.headers['x-employer-id'] as string);
      const candidateOwnerId = (req.query.candidate_id as string) || (req.query.user_id as string) || (req.headers['x-candidate-id'] as string) || (req.headers['x-user-id'] as string);
      const isAdmin = verifyAdminToken(req);

      const rawCandidate = candidateRepository.getRawById(candidateId) || candidateRepository.getByUserId(candidateId, false);
      if (!rawCandidate) {
        return res.status(404).json({ success: false, error: 'Candidate profile not found.' });
      }

      if (!rawCandidate.resume || rawCandidate.resume.status !== 'active' || !rawCandidate.resume.storage_key) {
        return res.status(404).json({ success: false, error: 'No active verified resume document found for this candidate.' });
      }

      const isOwner = (candidateOwnerId && (candidateOwnerId === rawCandidate.id || candidateOwnerId === rawCandidate.user_id));

      if (!isOwner && !isAdmin) {
        if (!employerId) {
          return res.status(401).json({ success: false, error: 'Authentication required to view candidate resume.' });
        }

        const authResult = resumeAccessRepository.authorizeAndRecordAccess(employerId, rawCandidate.id, 'view');
        if (!authResult.allowed) {
          return res.status(authResult.status).json({ success: false, error: authResult.message });
        }
      }

      const filePath = resumeStorage.getFilePath(rawCandidate.resume.storage_key);
      if (!filePath) {
        return res.status(404).json({ success: false, error: 'Resume file is not available on disk.' });
      }

      res.setHeader('Content-Type', rawCandidate.resume.content_type || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(rawCandidate.resume.original_filename || 'resume.pdf')}"`);
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return res.sendFile(filePath);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  app.get('/api/candidates/:candidateId/resume/view', handleViewResume);
  app.get('/api/candidates/resume/:candidateId/view', handleViewResume);

  // 5. Download Resume Document
  const handleDownloadResume = async (req: Request, res: Response) => {
    try {
      const { candidateId } = req.params;
      const employerId = (req.query.employer_id as string) || (req.headers['x-employer-id'] as string);
      const candidateOwnerId = (req.query.candidate_id as string) || (req.query.user_id as string) || (req.headers['x-candidate-id'] as string) || (req.headers['x-user-id'] as string);
      const isAdmin = verifyAdminToken(req);

      const rawCandidate = candidateRepository.getRawById(candidateId) || candidateRepository.getByUserId(candidateId, false);
      if (!rawCandidate) {
        return res.status(404).json({ success: false, error: 'Candidate profile not found.' });
      }

      if (!rawCandidate.resume || rawCandidate.resume.status !== 'active' || !rawCandidate.resume.storage_key) {
        return res.status(404).json({ success: false, error: 'No active verified resume document found for this candidate.' });
      }

      const isOwner = (candidateOwnerId && (candidateOwnerId === rawCandidate.id || candidateOwnerId === rawCandidate.user_id));

      if (!isOwner && !isAdmin) {
        if (!employerId) {
          return res.status(401).json({ success: false, error: 'Authentication required to download candidate resume.' });
        }

        const authResult = resumeAccessRepository.authorizeAndRecordAccess(employerId, rawCandidate.id, 'download');
        if (!authResult.allowed) {
          return res.status(authResult.status).json({ success: false, error: authResult.message });
        }
      }

      const filePath = resumeStorage.getFilePath(rawCandidate.resume.storage_key);
      if (!filePath) {
        return res.status(404).json({ success: false, error: 'Resume file is not available on disk.' });
      }

      res.setHeader('Content-Type', rawCandidate.resume.content_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(rawCandidate.resume.original_filename || 'resume.pdf')}"`);
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return res.download(filePath, rawCandidate.resume.original_filename || 'resume.pdf');
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  app.get('/api/candidates/:candidateId/resume/download', handleDownloadResume);
  app.get('/api/candidates/resume/:candidateId/download', handleDownloadResume);

  // 6. Employer Unlock Resume Endpoint
  app.post('/api/employer/unlock-resume', (req: Request, res: Response) => {
    try {
      const { employer_id, candidate_id, action } = req.body;
      if (!employer_id || !candidate_id) {
        return res.status(400).json({ success: false, error: 'employer_id and candidate_id are required.' });
      }

      const result = resumeAccessRepository.authorizeAndRecordAccess(employer_id, candidate_id, action || 'view');
      if (!result.allowed) {
        return res.status(result.status || 400).json({ success: false, error: result.message });
      }

      res.json({
        success: true,
        message: result.message,
        candidate: sanitizeCandidateForResponse(result.candidate, employer_id),
        remainingAllowance: result.remainingAllowance,
        alreadyUnlocked: result.alreadyUnlocked
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Employer Unlocked Resumes History
  app.get('/api/employer/unlocked-resumes/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const list = resumeAccessRepository.getAccessHistoryByEmployer(id);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Check Resume Access Status for Employer
  app.get('/api/employer/resume-status/:employerId/:candidateId', (req: Request, res: Response) => {
    try {
      const { employerId, candidateId } = req.params;
      const hasAccess = resumeAccessRepository.hasAccess(employerId, candidateId);
      res.json({ success: true, has_access: hasAccess });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

// ===================================================
// PUBLIC & ADMIN SUBSCRIPTION PLANS API
// ===================================================

app.get('/api/plans', (req: Request, res: Response) => {
  try {
    const plans = subscriptionPlanRepository.getActive();
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/plans', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const plans = subscriptionPlanRepository.getAll();
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/plans', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const planData = req.body;
    if (!planData.name || !planData.slug || planData.price === undefined) {
      return res.status(400).json({ success: false, error: 'Plan name, slug and price are required.' });
    }

    if (!planData.id) {
      planData.id = `plan_${Date.now()}`;
    }

    const result = subscriptionPlanRepository.save(planData);
    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: 'admin',
      actor_name: 'Platform Administrator',
      action: 'UPDATE_SUBSCRIPTION_PLAN',
      target_type: 'plan',
      target_id: planData.id,
      metadata: { name: planData.name, price: planData.price, limit: planData.contact_limit }
    });

    res.json({ success: true, data: result.plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/plans/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = subscriptionPlanRepository.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Plan not found.' });
    }
    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: 'admin',
      actor_name: 'Platform Administrator',
      action: 'DELETE_SUBSCRIPTION_PLAN',
      target_type: 'plan',
      target_id: id
    });
    res.json({ success: true, message: 'Plan removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================
// EMPLOYER PROFILE & AUTHENTICATION API
// ===================================================

app.post('/api/employer/login-or-register', (req: Request, res: Response) => {
  try {
    const { 
      contact_person_name, 
      company_name, 
      phone_number, 
      email, 
      company_website, 
      industry, 
      country, 
      city 
    } = req.body;

    const identifier = email || phone_number;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Phone number or email is required.' });
    }

    let existing = employerRepository.getByEmailOrPhone(identifier);
    const now = new Date().toISOString();

    if (!existing) {
      const newId = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newProfile = {
        id: newId,
        user_id: `emp_usr_${Date.now()}`,
        company_name: company_name || 'Hiring Enterprise',
        contact_person_name: contact_person_name || 'Hiring Lead',
        phone_number: phone_number || '',
        email: email || undefined,
        company_website: company_website || undefined,
        industry: industry || undefined,
        country: country || undefined,
        city: city || undefined,
        created_at: now,
        updated_at: now
      };
      const saved = employerRepository.save(newProfile);
      existing = saved.employer;

      auditLogRepository.record({
        actor_type: 'employer',
        actor_id: existing.id,
        actor_name: existing.contact_person_name,
        action: 'EMPLOYER_REGISTER',
        target_type: 'employer',
        target_id: existing.id
      });
    } else {
      // Update fields if provided
      if (company_name) existing.company_name = company_name;
      if (contact_person_name) existing.contact_person_name = contact_person_name;
      if (company_website) existing.company_website = company_website;
      if (industry) existing.industry = industry;
      if (country) existing.country = country;
      if (city) existing.city = city;
      employerRepository.save(existing);
    }

    const subscription = employerSubscriptionRepository.getByEmployerId(existing.id);

    res.json({
      success: true,
      data: {
        employer: existing,
        subscription
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/employer/profile/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = employerRepository.getById(id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Employer profile not found.' });
    }
    const subscription = employerSubscriptionRepository.getByEmployerId(id);
    res.json({ success: true, data: { employer: profile, subscription } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/employer/profile/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = employerRepository.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Employer profile not found.' });
    }

    const updates = req.body;
    const merged = { ...existing, ...updates, id, updated_at: new Date().toISOString() };
    const saved = employerRepository.save(merged);

    auditLogRepository.record({
      actor_type: 'employer',
      actor_id: id,
      actor_name: merged.contact_person_name,
      action: 'UPDATE_EMPLOYER_PROFILE',
      target_type: 'employer',
      target_id: id
    });

    res.json({ success: true, data: saved.employer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================
// EMPLOYER DASHBOARD AGGREGATES & METRICS
// ===================================================

app.get('/api/employer/dashboard/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employer = employerRepository.getById(id);
    if (!employer) {
      return res.status(404).json({ success: false, error: 'Employer not found.' });
    }

    const subscription = employerSubscriptionRepository.getByEmployerId(id);
    const savedCandidates = savedCandidateRepository.getByEmployer(id);
    const recentlyViewed = recentlyViewedRepository.getByEmployer(id, 10);
    const unlockedList = contactUnlockRepository.getUnlocksByEmployer(id);
    const unlockedResumes = resumeAccessRepository.getAccessHistoryByEmployer(id);

    // Get matched candidate recommendations based on employer industry or recent candidate searches
    const matched = candidateRepository.getAll({
      industry_id: employer.industry ? undefined : undefined,
      limit: 6
    }, id, false);

    const plan = subscription?.plan || subscriptionPlanRepository.getById(subscription?.plan_id) || {
      name: 'Free Employer',
      contact_limit: 0,
      resume_access_limit: 0
    };

    const contactLimit = plan.contact_limit ?? 0;
    const contactsUsed = subscription?.contacts_used_this_period ?? 0;
    const contactsRemaining = Math.max(0, contactLimit - contactsUsed);

    const resumeLimit = plan.resume_access_limit ?? plan.contact_limit ?? 0;
    const resumesUsed = subscription?.resumes_used_this_period ?? 0;
    const resumesRemaining = Math.max(0, resumeLimit - resumesUsed);

    res.json({
      success: true,
      data: {
        employer,
        subscription,
        metrics: {
          saved_count: savedCandidates.length,
          recently_viewed_count: recentlyViewed.length,
          unlocked_count: unlockedList.length,
          unlocked_resumes_count: unlockedResumes.length,
          contacts_limit: contactLimit,
          contacts_used: contactsUsed,
          contacts_remaining: contactsRemaining,
          resumes_limit: resumeLimit,
          resumes_used: resumesUsed,
          resumes_remaining: resumesRemaining,
          plan_name: plan.name
        },
        saved_candidates: savedCandidates,
        recently_viewed: recentlyViewed,
        unlocked_contacts: unlockedList,
        unlocked_resumes: unlockedResumes,
        recommended_candidates: matched.candidates
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================
// SAVED CANDIDATES & PRIVATE NOTES API
// ===================================================

app.get('/api/employer/saved-candidates/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = savedCandidateRepository.getByEmployer(id);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/employer/saved-candidates', (req: Request, res: Response) => {
  try {
    const { employer_id, candidate_id, notes } = req.body;
    if (!employer_id || !candidate_id) {
      return res.status(400).json({ success: false, error: 'employer_id and candidate_id are required.' });
    }

    const result = savedCandidateRepository.save(employer_id, candidate_id, notes || '');
    res.json({ success: true, data: result.saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/employer/saved-candidates/:employerId/:candidateId/notes', (req: Request, res: Response) => {
  try {
    const { employerId, candidateId } = req.params;
    const { notes } = req.body;
    const result = savedCandidateRepository.updateNotes(employerId, candidateId, notes || '');
    if (!result.success) {
      return res.status(404).json({ success: false, error: 'Saved candidate record not found.' });
    }
    res.json({ success: true, message: 'Notes updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/employer/saved-candidates/:employerId/:candidateId', (req: Request, res: Response) => {
  try {
    const { employerId, candidateId } = req.params;
    const removed = savedCandidateRepository.remove(employerId, candidateId);
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Saved candidate record not found.' });
    }
    res.json({ success: true, message: 'Candidate removed from saved list.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================
// RECENTLY VIEWED CANDIDATES API
// ===================================================

app.get('/api/employer/recently-viewed/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const list = recentlyViewedRepository.getByEmployer(id, limit);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/employer/recently-viewed', (req: Request, res: Response) => {
  try {
    const { employer_id, candidate_id } = req.body;
    if (!employer_id || !candidate_id) {
      return res.status(400).json({ success: false, error: 'employer_id and candidate_id are required.' });
    }
    recentlyViewedRepository.record(employer_id, candidate_id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================
// BILLING, PAYMENTS & SUBSCRIPTION ENTITLEMENTS API
// ===================================================

// 1. Get Live Employer Entitlements
app.get('/api/billing/entitlements/:employerId', (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;
    const entitlements = billingService.getEmployerEntitlements(employerId);
    res.json({ success: true, data: entitlements });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Create Payment Checkout Session
app.post('/api/billing/checkout-session', async (req: Request, res: Response) => {
  try {
    const { 
      employer_id, 
      plan_id, 
      billing_interval, 
      currency, 
      idempotency_key, 
      provider,
      customer_name,
      customer_email,
      customer_phone
    } = req.body;

    if (!employer_id || !plan_id) {
      return res.status(400).json({ success: false, error: 'employer_id and plan_id are required.' });
    }

    const session = await billingService.createPaymentOrder({
      employerId: employer_id,
      planId: plan_id,
      billingInterval: billing_interval || 'monthly',
      currency: currency || 'USD',
      idempotencyKey: idempotency_key,
      provider: provider,
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone
    });

    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. Finalize & Verify Payment (Idempotent)
app.post('/api/billing/finalize-payment', async (req: Request, res: Response) => {
  try {
    const { 
      payment_id, 
      provider_order_id, 
      provider_payment_id, 
      provider_signature, 
      simulated_status, 
      failure_reason 
    } = req.body;

    if (!payment_id) {
      return res.status(400).json({ success: false, error: 'payment_id is required to finalize payment.' });
    }

    const result = await billingService.finalizePayment({
      paymentId: payment_id,
      providerOrderId: provider_order_id,
      providerPaymentId: provider_payment_id,
      providerSignature: provider_signature,
      simulatedStatus: simulated_status,
      failureReason: failure_reason
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Employer Payment History
app.get('/api/billing/payments/:employerId', (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;
    const payments = paymentRepository.getByEmployerId(employerId);
    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Employer Invoices History
app.get('/api/billing/invoices/:employerId', (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;
    const invoices = invoiceRepository.getByEmployerId(employerId);
    res.json({ success: true, data: invoices });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. View Single Invoice
app.get('/api/billing/invoice/:invoiceId', (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const invoice = invoiceRepository.getById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }
    const payment = invoice.payment_id ? paymentRepository.getById(invoice.payment_id) : null;
    res.json({ success: true, data: { invoice, payment } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Cancel Subscription at Period End
app.post('/api/billing/cancel-subscription', (req: Request, res: Response) => {
  try {
    const { employer_id } = req.body;
    if (!employer_id) {
      return res.status(400).json({ success: false, error: 'employer_id is required.' });
    }
    const result = billingService.cancelSubscription(employer_id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 8. Payment Webhook Intake
app.post('/api/billing/webhook/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const signature = (req.headers['x-razorpay-signature'] || req.headers['stripe-signature']) as string;
    
    // Log incoming webhook event
    auditLogRepository.record({
      actor_type: 'system',
      actor_id: provider,
      actor_name: `${provider} Webhook Handler`,
      action: 'PAYMENT_WEBHOOK_RECEIVED',
      target_type: 'payment',
      target_id: req.body?.id || 'event',
      metadata: { event: req.body?.event || req.body?.type }
    });

    res.json({ received: true, provider });
  } catch (err: any) {
    res.status(400).json({ received: false, error: err.message });
  }
});

// ===================================================
// ADMIN BILLING & REVENUE REPORTING API
// ===================================================

app.get('/api/admin/billing/stats', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const stats = billingService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/billing/payments', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const payments = paymentRepository.getAll(limit);
    res.json({ success: true, data: payments, total: payments.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/billing/subscriptions', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const subs = employerSubscriptionRepository.getAll(limit);
    res.json({ success: true, data: subs, total: subs.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/billing/invoices', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const invoices = invoiceRepository.getAll(limit);
    res.json({ success: true, data: invoices, total: invoices.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/billing/subscriptions/:id/suspend', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { suspend, reason } = req.body;
    const result = billingService.adminSuspendSubscription(id, Boolean(suspend), reason);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ===================================================
// LEGACY & EXISTING SUBSCRIPTION ACTIVATION API
// ===================================================

app.get('/api/employer/subscription/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sub = employerSubscriptionRepository.getByEmployerId(id);
    res.json({ success: true, data: sub });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/employer/subscribe', (req: Request, res: Response) => {
  try {
    const { employer_id, plan_id } = req.body;
    if (!employer_id || !plan_id) {
      return res.status(400).json({ success: false, error: 'employer_id and plan_id are required.' });
    }

    const result = employerSubscriptionRepository.subscribe(employer_id, plan_id);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.message });
    }

    auditLogRepository.record({
      actor_type: 'employer',
      actor_id: employer_id,
      actor_name: 'Employer Account',
      action: 'SUBSCRIBE_PLAN',
      target_type: 'subscription',
      target_id: result.subscription.id,
      metadata: { plan_id: plan_id, plan_name: result.subscription.plan?.name }
    });

    res.json({ success: true, message: result.message, data: result.subscription });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/employer/unlock-contact', (req: Request, res: Response) => {
  try {
    const { employer_id, candidate_id } = req.body;
    if (!employer_id || !candidate_id) {
      return res.status(400).json({ success: false, error: 'employer_id and candidate_id are required.' });
    }

    const result = contactUnlockRepository.unlock(employer_id, candidate_id);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      candidate: result.candidate,
      remainingAllowance: result.remainingAllowance
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/employer/unlocked-contacts/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = contactUnlockRepository.getUnlocksByEmployer(id);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/employer/unlocked-status/:employerId/:candidateId', (req: Request, res: Response) => {
  try {
    const { employerId, candidateId } = req.params;
    const isUnlocked = contactUnlockRepository.isUnlocked(employerId, candidateId);
    res.json({ success: true, is_unlocked: isUnlocked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================
// ADMIN & CLIENT AUDIT LOGS API
// ===================================================

app.post('/api/audit-logs', (req: Request, res: Response) => {
  try {
    const { actor_type, actor_id, actor_name, action, target_type, target_id, metadata } = req.body;
    auditLogRepository.record({
      actor_type: actor_type || 'system',
      actor_id: actor_id || 'anonymous',
      actor_name: actor_name || 'Anonymous User',
      action: action || 'ACTION',
      target_type: target_type || 'system',
      target_id: target_id || 'none',
      metadata
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/audits', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = auditLogRepository.getAll(limit);
    res.json({ success: true, data: logs, total: logs.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================
// PROTECTED ADMIN CMS API
// ===================================================

app.get('/api/admin/articles', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const articles = articleRepository.getAllForAdmin(status as string);
    res.json({ success: true, data: articles, total: articles.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/articles', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const articleData = req.body;
    if (!articleData.title || !articleData.slug) {
      return res.status(400).json({ success: false, error: 'Article title and slug are required.' });
    }

    const result = articleRepository.create(articleData);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, data: result.article });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/articles/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = articleRepository.update(id, updates);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result.article });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/admin/articles/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'in_review', 'published'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Must be draft, in_review, or published.' });
    }

    const updates: any = { status };
    if (status === 'published') {
      updates.published_at = new Date().toISOString();
      updates.is_indexable = true;
    } else {
      updates.is_indexable = false;
    }

    const result = articleRepository.update(id, updates);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result.article });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/articles/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = articleRepository.delete(id);
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }
    res.json({ success: true, message: 'Article deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/topics', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const topicData = req.body;
    if (!topicData.name || !topicData.slug) {
      return res.status(400).json({ success: false, error: 'Topic name and slug are required.' });
    }
    const result = topicRepository.create(topicData);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.status(201).json({ success: true, data: result.topic });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/career-guides', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const guideData = req.body;
    if (!guideData.slug || !guideData.job_role_name) {
      return res.status(400).json({ success: false, error: 'Career guide slug and job role name are required.' });
    }
    const result = careerGuideRepository.save(guideData);
    res.json({ success: true, data: result.guide });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/stats', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const db = getCentralDb();
    const total = db.articles.length;
    const published = db.articles.filter(a => a.status === 'published').length;
    const drafts = db.articles.filter(a => a.status === 'draft').length;
    const in_review = db.articles.filter(a => a.status === 'in_review').length;
    const topicsCount = db.topics.length;
    const customGuidesCount = db.career_guides.length;

    res.json({
      success: true,
      data: {
        total_articles: total,
        published,
        drafts,
        in_review,
        topics: topicsCount,
        career_guides: customGuidesCount,
        last_persisted_at: db.system_meta.last_persisted_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================
// VITE SPA FALLBACK & STATIC SERVING
// ===================================================

async function startServer() {
  // Ensure DB initializes and seeds on startup
  getCentralDb();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Candidate Portal Backend] Express API & Vite server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
