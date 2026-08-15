/**
 * SEO Document & JSON-LD Structured Data Management
 */

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  schemaJson?: object | object[];
}

export function updateDocumentSEO({
  title,
  description,
  canonical,
  noIndex = false,
  ogImage,
  schemaJson
}: SEOConfig) {
  if (typeof document === 'undefined') return;

  // Title
  document.title = title;

  // Description Meta
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // Robots Meta
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');

  // Open Graph Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);

  // Open Graph Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', description);

  // Open Graph Image
  if (ogImage) {
    let ogImg = document.querySelector('meta[property="og:image"]');
    if (!ogImg) {
      ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      document.head.appendChild(ogImg);
    }
    ogImg.setAttribute('content', ogImage);
  }

  // Canonical Link
  let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  const fullCanonical = canonical
    ? `${window.location.origin}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
    : window.location.href;
  linkCanonical.setAttribute('href', fullCanonical);

  // Structured Data (JSON-LD)
  const existingScript = document.getElementById('structured-data-json-ld');
  if (existingScript) {
    existingScript.remove();
  }

  if (schemaJson) {
    const script = document.createElement('script');
    script.id = 'structured-data-json-ld';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaJson);
    document.head.appendChild(script);
  }
}
