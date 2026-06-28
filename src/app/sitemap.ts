import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Use environment variable or fallback to production URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://universechain.online';
  
  // Define all public static routes
  const routes = ['', '/about', '/contact', '/help-support', '/terms', '/privacy', '/disclaimer'];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
