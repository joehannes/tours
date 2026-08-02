import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { MdTour, MdEvent } from 'react-icons/md';
import { useBrand } from '../contexts/BrandContext';
import { useI18n } from '../contexts/I18nContext';
import { useBlog } from '../contexts/BlogContext';
import { generateBlogPageMeta, generateBlogListStructuredData } from '../utils/seoHelpers';

const renderPostContent = (post: string) =>
  post
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => {
      const isFirst = index === 0;
      return (
        <p
          key={`${index}-${paragraph.substring(0, 20)}`}
          className={`leading-relaxed font-['Poppins',sans-serif] whitespace-pre-line ${
            isFirst
              ? 'text-xl md:text-2xl text-slate-800 font-medium mb-8 border-l-4 border-teal-500 pl-4 md:pl-6 italic'
              : 'text-lg text-slate-700 mb-6'
          }`}
        >
          {paragraph}
        </p>
      );
    });

const Blog = () => {
  const { locale } = useI18n();
  const { brandSettings } = useBrand();
  const { blogArticles, loading, error } = useBlog();
  const articles = blogArticles[locale] ?? [];

  useEffect(() => {
    const pageTitle = `${locale === 'es' ? 'Blog' : 'Blog'} | ${brandSettings.brandName}`;
    const pageDescription =
      locale === 'es'
        ? 'Blog de viajes y tours en Punta Cana. Descubre historias, tips de viaje y guías sobre excursiones en República Dominicana.'
        : 'Travel and tour blog in Punta Cana. Discover travel stories, tips, and guides about excursions in the Dominican Republic.';

    generateBlogPageMeta(pageTitle, pageDescription, window.location.href);

    if (articles.length > 0) {
      generateBlogListStructuredData(
        locale === 'es' ? 'Blog de Tours' : 'Blog',
        pageDescription,
        articles
      );
    }

    return () => {
      document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        if (script.textContent?.includes('Blog')) {
          script.remove();
        }
      });
    };
  }, [locale, brandSettings.brandName, articles]);

  return (
    <div className="bg-gradient-to-b from-white via-cyan-50/30 to-orange-50/30 py-16 md:py-24">
      <div className="section-shell">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold text-slate-900 md:text-6xl font-['Playfair_Display',serif] tracking-tight relative inline-block">
            <span className="relative z-10">
              <FormattedMessage id="blog.title" defaultMessage="Blog" />
            </span>
            <span className="absolute inset-x-0 -bottom-2 h-3 bg-teal-500/20 rounded-full blur-sm"></span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-600 font-['Poppins',sans-serif] leading-relaxed mt-4">
            <FormattedMessage id="blog.description" values={{ brand: brandSettings.brandName }} />
          </p>
        </div>

        {loading ? (
          <div className="grid min-h-[40vh] place-items-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
              <div className="text-slate-600 font-medium font-['Poppins',sans-serif]">Loading blog articles...</div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 md:p-12 shadow-sm max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="mb-4 text-xl font-bold text-red-900">Unable to load blog content</h3>
            <div className="mb-6 text-sm text-red-800 space-y-3 font-['Poppins',sans-serif] leading-relaxed">
              <p><strong>Status:</strong> Blog articles failed to load.</p>
              <p><strong>Possible causes:</strong></p>
              <ul className="list-inside list-disc space-y-1.5 pl-2 text-xs">
                <li>Blog bin IDs not configured in Cloudflare Pages environment variables</li>
                <li>JSONBin API key not set or invalid</li>
                <li>CORS blocking direct JSONBin requests (use Cloudflare Functions endpoint)</li>
                <li>Network connectivity issue</li>
              </ul>
            </div>
            <p className="text-xs text-red-600 font-medium">Check browser console (F12) for detailed error logs starting with [Blog]</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-12 text-center text-slate-700 shadow-sm max-w-xl mx-auto backdrop-blur-md">
            <p className="text-lg font-medium">
              <FormattedMessage id="blog.noArticles" defaultMessage="No articles available yet. Please check back soon." />
            </p>
            <p className="mt-4 text-xs text-slate-400">If blog should have content, verify VITE_JSONBIN_BLOG_EN and VITE_JSONBIN_BLOG_ES environment variables are set.</p>
          </div>
        ) : (
          <div className="grid gap-12 max-w-4xl mx-auto">
            {articles.map((article, idx) => {
              const swayClass = `animate-wave-sway-${(idx % 10) + 1}`;
              const radiusClass = idx % 2 === 0 ? 'rounded-[36px_16px_32px_20px]' : 'rounded-[20px_36px_24px_32px]';
              return (
                <article
                  key={article.id}
                  id={article.slug}
                  className={`glass-card ${radiusClass} ${swayClass} p-6 md:p-12 transition-all duration-500 hover:scale-[1.015] shadow-[0_24px_70px_rgba(4,19,29,0.15),0_0_35px_rgba(13,148,136,0.12)] border border-white/60`}
                >
                  <header className="mb-8 border-b border-slate-200/50 pb-6">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 font-['Playfair_Display',serif] tracking-tight leading-tight mb-5">
                      {article.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-['Poppins',sans-serif]">
                      {article.tour && (
                        <span className="inline-flex items-center gap-1.5 rounded-[16px_6px_14px_8px] bg-gradient-to-r from-teal-500/15 to-cyan-500/15 px-4 py-1.5 font-semibold text-teal-800 shadow-sm border border-teal-500/20">
                          <MdTour className="h-4 w-4 text-teal-600" />
                          <FormattedMessage id="blog.relatedTourLabel" defaultMessage="Related tour" />: {article.tour}
                        </span>
                      )}
                      {article.date && (
                        <span className="inline-flex items-center gap-1.5 rounded-[14px_6px_12px_8px] bg-white/90 px-4 py-1.5 font-medium text-slate-700 border border-slate-200/50 shadow-sm">
                          <MdEvent className="h-4 w-4 text-teal-600" />
                          <time dateTime={article.date}>
                            {article.date}
                          </time>
                        </span>
                      )}
                    </div>
                  </header>
                  <div className="prose prose-slate max-w-none font-['Poppins',sans-serif]">
                    {renderPostContent(article.post)}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
