/**
 * Utility functions for generating SEO slugs and formatting profile locations
 */

export function generateCandidateSlug(
  fullName: string,
  skill: string,
  locationOrCity?: string | null
): string {
  const cleanName = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  const cleanSkill = skill
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  const cleanLocation = locationOrCity
    ? locationOrCity
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    : '';

  const randomSuffix = Math.random().toString(36).substring(2, 6);

  const parts = [cleanSkill, cleanName, cleanLocation, randomSuffix].filter(Boolean);
  return parts.join('-');
}

export function formatFullLocation(c: {
  country?: string | null;
  admin_level_1?: string | null;
  admin_level_2?: string | null;
  village_or_town?: string | null;
  area_other?: string | null;
}): string {
  const segments: string[] = [];
  if (c.village_or_town) segments.push(c.village_or_town);
  if (c.admin_level_2) segments.push(c.admin_level_2);
  if (c.admin_level_1) segments.push(c.admin_level_1);
  if (c.country) segments.push(c.country);

  return segments.length > 0 ? segments.join(', ') : 'Location Not Specified';
}
