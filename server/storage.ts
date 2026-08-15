import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB configurable limit
export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const RESUME_STORAGE_DIR = path.join(process.cwd(), 'data', 'resumes');

// Ensure local storage directory exists
if (!fs.existsSync(RESUME_STORAGE_DIR)) {
  try {
    fs.mkdirSync(RESUME_STORAGE_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create resume storage directory:', err);
  }
}

export interface StoredResumeResult {
  storage_key: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  detectedMimeType?: string;
}

/**
 * Validates file buffer magic bytes against expected MIME signatures.
 */
export function validateResumeBuffer(buffer: Buffer, originalFilename: string, claimedMimeType?: string): ValidationResult {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, errorMessage: 'Uploaded file is empty.' };
  }

  if (buffer.length > MAX_RESUME_SIZE_BYTES) {
    return { 
      isValid: false, 
      errorMessage: `Resume must be ${MAX_RESUME_SIZE_BYTES / (1024 * 1024)} MB or smaller.` 
    };
  }

  const ext = path.extname(originalFilename || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      errorMessage: 'Invalid file extension. Only PDF, DOC, and DOCX files are supported.'
    };
  }

  // Magic bytes check
  // PDF: %PDF- (hex: 25 50 44 46 2D)
  const isPdf = buffer.length >= 5 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46 && buffer[4] === 0x2D;
  // DOCX: PK.. (hex: 50 4B 03 04)
  const isDocx = buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
  // DOC: (hex: D0 CF 11 E0)
  const isDoc = buffer.length >= 4 && buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0;

  if (ext === '.pdf' && !isPdf) {
    return {
      isValid: false,
      errorMessage: 'File content does not match a valid PDF document.'
    };
  }

  if (ext === '.docx' && !isDocx) {
    return {
      isValid: false,
      errorMessage: 'File content does not match a valid DOCX document.'
    };
  }

  if (ext === '.doc' && !isDoc && !isPdf) {
    return {
      isValid: false,
      errorMessage: 'File content does not match a valid DOC document.'
    };
  }

  let finalMime = claimedMimeType || 'application/octet-stream';
  if (isPdf) finalMime = 'application/pdf';
  else if (isDocx) finalMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  else if (isDoc) finalMime = 'application/msword';

  return {
    isValid: true,
    detectedMimeType: finalMime
  };
}

/**
 * Storage Abstraction Layer
 * Currently operates on secure server filesystem (outside public static directories).
 * Can be swapped with S3 / Cloud Object Storage adapter without changing domain logic.
 */
export const resumeStorage = {
  /**
   * Saves a validated resume file buffer to server storage.
   */
  async save(
    candidateId: string, 
    buffer: Buffer, 
    originalFilename: string, 
    mimeType: string
  ): Promise<StoredResumeResult> {
    const ext = path.extname(originalFilename || '').toLowerCase() || '.pdf';
    // Generate secure, unguessable storage key
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeCandidateId = candidateId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const storageKey = `res_${safeCandidateId}_${Date.now()}_${randomHex}${ext}`;

    const targetFilePath = path.join(RESUME_STORAGE_DIR, storageKey);

    // Verify no directory traversal
    if (!targetFilePath.startsWith(RESUME_STORAGE_DIR)) {
      throw new Error('Invalid storage path.');
    }

    await fs.promises.writeFile(targetFilePath, buffer);

    return {
      storage_key: storageKey,
      original_filename: path.basename(originalFilename),
      content_type: mimeType,
      file_size: buffer.length,
      uploaded_at: new Date().toISOString()
    };
  },

  /**
   * Retrieves the physical absolute path for authorized streaming.
   */
  getFilePath(storageKey: string): string | null {
    if (!storageKey) return null;
    const safeKey = path.basename(storageKey);
    const targetFilePath = path.join(RESUME_STORAGE_DIR, safeKey);

    // Path traversal guard
    if (!targetFilePath.startsWith(RESUME_STORAGE_DIR)) {
      return null;
    }

    if (!fs.existsSync(targetFilePath)) {
      return null;
    }

    return targetFilePath;
  },

  /**
   * Reads the file buffer directly.
   */
  async getBuffer(storageKey: string): Promise<Buffer | null> {
    const filePath = this.getFilePath(storageKey);
    if (!filePath) return null;
    try {
      return await fs.promises.readFile(filePath);
    } catch {
      return null;
    }
  },

  /**
   * Deletes a resume file from storage.
   */
  async delete(storageKey: string): Promise<boolean> {
    const filePath = this.getFilePath(storageKey);
    if (!filePath) return false;
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch (err) {
      console.warn('Failed to unlink resume file:', err);
      return false;
    }
  },

  /**
   * Checks if file exists on disk.
   */
  exists(storageKey: string): boolean {
    const filePath = this.getFilePath(storageKey);
    return filePath !== null && fs.existsSync(filePath);
  }
};
