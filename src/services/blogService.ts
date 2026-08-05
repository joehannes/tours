import { apiGet, apiPut } from './apiClient';

type Locale = 'en' | 'es';

export interface RawBlogArticle {
  id?: string | number;
  title?: string | { en?: string; es?: string };
  tour?: string | { en?: string; es?: string };
  post?: string | { en?: string; es?: string };
  description?: string | { en?: string; es?: string };
  date?: string;
  language?: Locale;
  slug?: string;
  tags?: string[];
  visible?: boolean;
}

export interface BlogArticle {
  id: string;
  title: string;
  tour: string;
  post: string;
  date?: string;
  slug: string;
  locale: Locale;
  tags: string[];
  visible: boolean;
}

const getLocalizedValue = (value: unknown, locale: Locale): string => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'object' && value !== null) {
    const localeValue = (value as Record<string, unknown>)[locale];
    if (typeof localeValue === 'string' && localeValue.trim()) {
      return localeValue.trim();
    }

    const fallback = (value as Record<string, unknown>).en || (value as Record<string, unknown>).es;
    return typeof fallback === 'string' ? fallback.trim() : '';
  }

  return '';
};

const normalizeBlogArticle = (rawArticle: RawBlogArticle, locale: Locale): BlogArticle | null => {
  const title = getLocalizedValue(rawArticle.title, locale);
  const tour = getLocalizedValue(rawArticle.tour, locale);
  const post = getLocalizedValue(rawArticle.post || rawArticle.description, locale);
  const date = rawArticle.date?.trim();
  const id = String(rawArticle.id ?? `${title}-${tour}-${date || 'unknown'}`).trim();
  const slug = rawArticle.slug?.trim() || `${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`.replace(/(^-|-$)/g, '');
  const tags = Array.isArray(rawArticle.tags) ? rawArticle.tags : [];
  const visible = rawArticle.visible !== false; // Default to true

  if (!title || !post) {
    return null;
  }

  return {
    id,
    title,
    tour,
    post,
    date,
    slug: slug || id,
    locale,
    tags,
    visible,
  };
};

const findFirstArray = (data: unknown): unknown[] | undefined => {
  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data !== 'object' || data === null) {
    return undefined;
  }

  for (const value of Object.values(data as Record<string, unknown>)) {
    const found = findFirstArray(value);
    if (found) {
      return found;
    }
  }

  return undefined;
};

const extractRecord = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const recordData = (data as Record<string, unknown>).record ?? data;
    const arrayData = findFirstArray(recordData);
    return arrayData ?? [];
  }

  return [];
};

const fetchRawBlogArticles = async (locale: Locale): Promise<unknown[]> => {
  try {
    const data = await apiGet<unknown[]>('blog', { locale });
    return extractRecord(data);
  } catch (error) {
    console.warn('[Blog] API fetch failed:', error);
    return [];
  }
};

export const getBlogArticles = async (locale: Locale): Promise<BlogArticle[]> => {
  const rawArticles = await fetchRawBlogArticles(locale);

  return rawArticles
    .map((rawArticle) => normalizeBlogArticle(rawArticle as RawBlogArticle, locale))
    .filter((article): article is BlogArticle => article !== null);
};

export const saveBlogArticle = async (article: BlogArticle, locale: Locale): Promise<boolean> => {
  try {
    const rawArticles = await fetchRawBlogArticles(locale);
    
    // Check if article with this id already exists, update it or append
    const existingIndex = rawArticles.findIndex((r: any) => String(r.id) === article.id || r.slug === article.slug);
    
    const newRawArticle = {
      id: article.id,
      title: article.title,
      tour: article.tour,
      post: article.post,
      date: article.date,
      slug: article.slug,
      language: locale,
      tags: article.tags,
      visible: article.visible
    };

    if (existingIndex >= 0) {
      rawArticles[existingIndex] = newRawArticle;
    } else {
      rawArticles.unshift(newRawArticle); // prepend new articles
    }

    await apiPut<unknown>('blog', rawArticles, { locale });
    return true;
  } catch (error) {
    console.error('[Blog] Failed to save article:', error);
    return false;
  }
};

export const deleteBlogArticle = async (id: string, locale: Locale): Promise<boolean> => {
  try {
    const rawArticles = await fetchRawBlogArticles(locale);
    const existingIndex = rawArticles.findIndex((r: any) => String(r.id) === id);
    
    if (existingIndex >= 0) {
      rawArticles.splice(existingIndex, 1);
      await apiPut<unknown>('blog', rawArticles, { locale });
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Blog] Failed to delete article:', error);
    return false;
  }
};

export const toggleBlogArticleVisibility = async (id: string, locale: Locale): Promise<boolean> => {
  try {
    const rawArticles = await fetchRawBlogArticles(locale);
    const existingIndex = rawArticles.findIndex((r: any) => String(r.id) === id);
    
    if (existingIndex >= 0) {
      const article = rawArticles[existingIndex] as RawBlogArticle;
      article.visible = article.visible === false ? true : false;
      await apiPut<unknown>('blog', rawArticles, { locale });
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Blog] Failed to toggle article visibility:', error);
    return false;
  }
};
