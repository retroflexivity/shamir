import React, { useMemo } from "react";
import { marked } from "marked";
import { Header } from "./Header";
import type { Article } from "./types";
import type { Translations, Locale } from "../i18n/translations";
import { getLocalizedPath } from "../i18n/utils";

export interface ArticlePageProps {
  article: Article;
  locale?: Locale;
  translations?: Translations;
}

export function ArticlePage({ article, locale = 'ru', translations }: ArticlePageProps) {
  const t = translations;
  const currentPath = article.slug ? getLocalizedPath(`/${article.slug}`, locale) : '/';
  function formatDate(dt: Date | string | undefined): string {
    if (!dt) return "";
    if (typeof dt === "string") {
      const d = new Date(dt);
      if (!isNaN(d as any)) return d.toLocaleDateString("en-GB");
      return dt;
    }
    if (dt instanceof Date) return dt.toLocaleDateString("en-GB");
    return "";
  }

  const renderedBody = useMemo(() => {
    if (!article.body) return "";
    let html = marked.parse(article.body);
    
    // Process HTML to group consecutive images into a flex row
    // First, handle paragraphs with multiple images on the same line (most common case)
    html = html.replace(
      /<p>((?:\s*<img[^>]*>\s*){2,})<\/p>/gi,
      (match, imagesContent) => {
        const imgMatches = imagesContent.match(/<img[^>]*>/gi);
        if (!imgMatches || imgMatches.length < 2) return match;
        
        const wrappedImages = imgMatches.map((img) => {
          return `<div class="image-grid-item">${img}</div>`;
        }).join('');
        
        return `<div class="image-grid my-6 flex flex-wrap gap-4">${wrappedImages}</div>`;
      }
    );
    
    // Handle paragraphs with images wrapped in links
    html = html.replace(
      /<p>((?:\s*(?:<a[^>]*>\s*)?<img[^>]*>\s*(?:<\/a>)?\s*){2,})<\/p>/gi,
      (match, imagesContent) => {
        // Skip if already processed
        if (match.includes('image-grid')) return match;
        
        const imgMatches = imagesContent.match(/<img[^>]*>/gi);
        if (!imgMatches || imgMatches.length < 2) return match;
        
        // Extract full image elements (with links if present)
        const imageElements = imagesContent.match(/(?:<a[^>]*>\s*)?<img[^>]*>\s*(?:<\/a>)?/gi) || [];
        
        const wrappedImages = imageElements.map((elem) => {
          return `<div class="image-grid-item">${elem.trim()}</div>`;
        }).join('');
        
        return `<div class="image-grid my-6 flex flex-wrap gap-4">${wrappedImages}</div>`;
      }
    );
    
    // Handle multiple consecutive paragraphs, each with a single image
    html = html.replace(
      /(<p>\s*(?:<a[^>]*>)?\s*<img[^>]*>\s*(?:<\/a>)?\s*<\/p>\s*){2,}/gi,
      (match) => {
        // Skip if already processed
        if (match.includes('image-grid')) return match;
        
        const imgMatches = match.match(/<img[^>]*>/gi);
        if (!imgMatches || imgMatches.length < 2) return match;
        
        // Extract full paragraph content (with links if present)
        const paragraphMatches = match.match(/<p>\s*(?:<a[^>]*>)?\s*<img[^>]*>\s*(?:<\/a>)?\s*<\/p>/gi);
        if (!paragraphMatches) return match;
        
        const wrappedImages = paragraphMatches.map((para) => {
          const content = para.replace(/<\/?p>/gi, '').trim();
          return `<div class="image-grid-item">${content}</div>`;
        }).join('');
        
        return `<div class="image-grid my-6 flex flex-wrap gap-4">${wrappedImages}</div>`;
      }
    );
    
    return html;
  }, [article.body]);

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-16">
      <Header showBackButton={true} locale={locale} translations={t} currentPath={currentPath} />

      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          className="mb-4 max-h-80 max-w-[50%] object-cover md:float-right md:ml-10 md:w-auto"
        />
      )}

      <div className="font-sans mb-2 gap-1">
        {
          (article.tags||[]).join(" · ")
        }
      </div>
      <h1 
        className="text-2xl md:text-3xl lg:text-4xl text-lightaccent dark:text-darkaccent mb-4 uppercase hyphens-auto"
      >
        {article.title}
      </h1>
      {article.date && (
        <div className="text-sm font-sans mb-8">
          {formatDate(article.date)}
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none">
        {renderedBody && (
          <div
            className="leading-relaxed [&_.image-grid]:!my-8 [&_.image-grid]:!flex [&_.image-grid]:!flex-wrap [&_.image-grid]:!gap-4 [&_.image-grid-item]:!flex-shrink-0 [&_.image-grid-item]:!overflow-hidden [&_.image-grid-item]:!rounded-lg [&_.image-grid-item_img]:!h-80 [&_.image-grid-item_img]:!w-auto [&_.image-grid-item_img]:!object-contain [&_.image-grid-item_a]:!block [&_.image-grid-item_a]:!inline-block"
            dangerouslySetInnerHTML={{ __html: renderedBody }}
          />
        )}
      </div>
    </div>
  );
}
