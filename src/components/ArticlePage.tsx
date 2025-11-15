import React, { useMemo } from "react";
import { marked } from "marked";
import { Badge } from "./ui/badge";
import { Article } from "./HomePage";

export interface ArticlePageProps {
  article: Article;
}

export function ArticlePage({ article }: ArticlePageProps) {
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
    return marked.parse(article.body);
  }, [article.body]);

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-16 py-8">
      <div className="mb-6 hidden sm:block">
        <a
          href="/"
          className="btn w-auto"
        >
          ← Вернуться на главную
        </a>
      </div>

      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          className="mb-4 max-h-80 object-cover md:float-right md:ml-10 md:w-auto"
        />
      )}

      <div className="mb-2 gap-1">
        {
          (article.tags||[]).join(" · ")
        }
      </div>
      <h1 
        className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-4 uppercase hyphens-auto"
        lang="ru"
      >
        {article.title}
      </h1>
      {article.date && (
        <div className="text-sm mb-8">
          {formatDate(article.date)}
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none">
        {renderedBody && (
          <div
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderedBody }}
          />
        )}
      </div>
    </div>
  );
}
