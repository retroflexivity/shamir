import * as React from "react"
import { cn } from "../../lib/utils"
import type { Article } from "../types"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-card text-card-foreground shadow-sm", className)}
    {...props}
  />
))
Card.displayName = "Card"
export { Card }

export interface ArticleCardProps {
  article: Article;
  href?: string;
}

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

export function ArticleCard({ article, href }: ArticleCardProps) {
  const linkHref = href || (article.slug ? `/${article.slug}` : '#');
  
  return (
    <a
      href={linkHref}
      className="block"
    >
      <Card className="article-card group relative h-72 sm:h-72 md:h-80 lg:h-96 overflow-hidden bg-darkbg transition p-0 flex cursor-pointer">
        {article.image && (
          <div className="absolute inset-0">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover object-center transition scale-105 grayscale group-hover:grayscale-0 brightness-[0.4] group-hover:brightness-[0.6]" />
            <div className="absolute inset-0 bg-darkbg mix-blend-screen opacity-50 group-hover:opacity-0 transition-opacity" />
          </div>
        )}
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-5">
          <h2 className="font-bold text-white/90 [text-shadow:_0_2px_8px_rgb(0_0_0_/_0.6),_0_1px_4px_rgb(0_0_0_/_0.8)] text-xl mb-1 line-clamp-6 uppercase break-words">{article.title}</h2>
          <div className="mb-2 flex flex-wrap gap-1 text-darkfg [text-shadow:_0_1px_6px_rgb(0_0_0_/_0.6),_0_1px_3px_rgb(0_0_0_/_0.8)]">
            {
              (article.tags||[]).join(" · ")
            }
          </div>
          <div className="text-xs text-darkfg/70 mb-1 [text-shadow:_0_1px_6px_rgb(0_0_0_/_0.6),_0_1px_3px_rgb(0_0_0_/_0.8)]">{formatDate(article.date)}</div>
        </div>
      </Card>
    </a>
  );
}
