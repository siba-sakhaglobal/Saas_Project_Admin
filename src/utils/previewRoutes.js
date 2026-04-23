const DEFAULT_FRONTEND_BASE_URL = 'http://localhost:3000';

// Map of known slugs that have dedicated routes in the public site
export const HARDCODED_PAGE_ROUTES = {
  home: '/',
  about: '/about',
  programs: '/programs',
  donations: '/donations',
  blogs: '/blogs',
  contact: '/contact',
  gallery: '/gallery',
  events: '/events',
  career: '/career',
  volunteer: '/volunteer',
  organ: '/organ',
  shop: '/shop',
  'media-center': '/media-center',
  'press-releases': '/press-releases',
  'aahwahan-patrika': '/aahwahan-patrika',
  'corporate-csr': '/corporate-csr',
  plantation: '/plantation',
  'about-us': '/about-us',
  organization: '/organization',
  blog: '/blog',
  'get-involved': '/get-involved',
  products: '/products'
};

const stripTrailingSlashes = (value = '') => value.replace(/\/+$/, '');
const ensureLeadingSlash = (value = '') => (value.startsWith('/') ? value : '/' + value);

const resolveFrontendBaseUrl = () => {
  const envUrl = process.env.REACT_APP_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return stripTrailingSlashes(envUrl);
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // When running the admin on the default 3001 port, the public site runs on 3000.
    if (port === '3001') {
      return protocol + '//' + hostname + ':3000';
    }

    if (port) {
      return protocol + '//' + hostname + ':' + port;
    }

    return protocol + '//' + hostname;
  }

  return DEFAULT_FRONTEND_BASE_URL;
};

export const buildPreviewUrl = (slug) => {
  const baseUrl = stripTrailingSlashes(resolveFrontendBaseUrl());
  const normalizedSlug = slug?.trim();
  const targetPath = normalizedSlug ? (HARDCODED_PAGE_ROUTES[normalizedSlug] || '/page/' + normalizedSlug) : '/';
  const safePath = ensureLeadingSlash(targetPath);

  try {
    return new URL(safePath, baseUrl + '/').toString();
  } catch (error) {
    console.error('Failed to compose preview URL', { baseUrl, safePath, error });
    return baseUrl + safePath;
  }
};

export default buildPreviewUrl;
