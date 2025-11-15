import React, { useState, useMemo } from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

export interface Article {
  title: string;
  image?: string;
  tags?: string[];
  date?: Date | string;
  body?: string;
  slug?: string;
}

export interface HomePageProps {
  articles: Article[];
}

const projectLinks: {href: string, label: string}[] = [
  { href: "http://shamir.lv/%D0%BA%D0%BD%D0%B8%D0%B3%D0%B8/", label: "Наши публикации" },
  { href: "https://www.rglhm.lv/", label: "Музей рижского гетто" },
  { href: "http://shamir.lv/eitc-2/", label: "Центр толерантности" },
];

const priorityTags : Set<string> = new Set([
  'Деятельность',
  'Проекты',
  'Исследования',
  'Выставки'
])

export function HomePage({ articles }: HomePageProps) {
  const allTags = useMemo(() =>
    Array.from(new Set(articles.flatMap(a => a.tags || [])))
  , [articles]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const normalize = (text: string) => text.toLowerCase().replace(/ё/g, "е");

  // Check if a tag is compatible with currently selected tags
  // A tag is compatible if there exists at least one article that has both the tag and all selected tags
  const isTagCompatible = useMemo(() => {
    const compatibilityMap = new Map<string, boolean>();
    
    if (selectedTags.size === 0) {
      // If no tags are selected, all tags are compatible
      allTags.forEach(tag => compatibilityMap.set(tag, true));
    } else {
      allTags.forEach(tag => {
        // Check if there's at least one article that has both this tag and all selected tags
        const isCompatible = articles.some(article => {
          const articleTags = article.tags || [];
          return articleTags.includes(tag) && 
                 [...selectedTags].every(selectedTag => articleTags.includes(selectedTag));
        });
        compatibilityMap.set(tag, isCompatible);
      });
    }
    
    return (tag: string) => compatibilityMap.get(tag) ?? false;
  }, [articles, selectedTags, allTags]);

  // Count articles per tag
  const tagArticleCounts = useMemo(() => {
    return new Map(allTags.map(tag => [tag, articles.reduce((n, a) => ((a.tags || []).includes(tag) ? n+1 : n), 0)]))
  }, [articles, allTags]);

  const preSortedTags = allTags.toSorted(
    (a: string, b: string) => (tagArticleCounts.get(b) || 0)
                            - (tagArticleCounts.get(a) || 0)
                            + (priorityTags.has(b) ? 1000 : 0)
                            + (priorityTags.has(a) ? -1000 : 0)
    
  )

  // Sort tags: selected first, compatible second, incompatible last
  // Within each group, sort by number of associated articles (descending)
  const sortedTags = useMemo(() => {
    const selected: string[] = [];
    const compatible: string[] = [];
    const incompatible: string[] = [];
    
    preSortedTags.forEach(tag => {
      if (selectedTags.has(tag)) {
        selected.push(tag);
      } else if (isTagCompatible(tag)) {
        compatible.push(tag);
      } else {
        incompatible.push(tag);
      }
    });
    
    return [...selected, ...compatible, ...incompatible];
  }, [allTags, selectedTags, isTagCompatible, tagArticleCounts]);

  const filtered = useMemo(() => {
    const filteredArticles = articles.filter(article => {
      const matchText = normalize(article.title).includes(normalize(searchValue));
      // const matchTag = selectedTags.size === 0 || (article.tags||[]).some(tag => selectedTags.has(tag));
      const matchTag = selectedTags.size === 0 || [...selectedTags].every(tag => (article.tags||[]).includes(tag));
      return matchText && matchTag;
    });

    // Sort by date (newest first)
    return filteredArticles.sort((a, b) => {
      const getDateValue = (dt: Date | string | undefined): number => {
        if (!dt) return 0;
        if (typeof dt === "string") {
          const d = new Date(dt);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        }
        if (dt instanceof Date) return dt.getTime();
        return 0;
      };

      const dateA = getDateValue(a.date);
      const dateB = getDateValue(b.date);
      return dateB - dateA; // Descending order (newest first)
    });
  }, [articles, searchValue, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set((isTagCompatible(tag)) ? prev : null)
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
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

  return (
    <div className="mx-auto text-gray-900 dark:text-gray-200">
      <div id="logo" className="flex justify-center items-center mt-20 mb-20">
        <img
          src="src/assets/logo.svg"
          alt="Shamir Association Riga Ghetto and Latvia Holocaust Museum Logo"
          className="max-w-[320px] w-full"
        />
      </div>
      <div id="about" className="text-lg flex flex-col items-center gap-2 mb-10">
        <p className="mb-5">
          Больше двадцати лет мы сохраняем и исследуем память об истории евреев Латвии.
        </p>
        <div className="text-xl grid grid-cols-1 sm:grid-cols-3 gap-10 px-4 max-w-100">
          {projectLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="btn btn-lg light w-full text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <hr className="max-w-xl mx-auto my-16"></hr>
      <div id="articles" className="flex flex-col items-center gap-6 mb-6 px-4">
        <Input
          className="w-full max-w-xl focus:max-w-2xl light text-center text-xl transition-all duration-300 ease-in-out"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Искать"
          id="search-input"
        />
        <div
          id="tag-list"
          className="flex flex-nowrap overflow-x-auto whitespace-nowrap gap-x-2 px-1 w-full scrollbar-thin scrollbar-thumb-gray-300 no-scrollbar"
        >
          {sortedTags.map(tag => {
            const isSelected = selectedTags.has(tag);
            const isCompatible = isTagCompatible(tag);
            const isIncompatible = !isSelected && !isCompatible;
            
            return (
              <Badge
                key={tag}
                data-tag={tag}
                className={
                  'px-3 py-1 cursor-pointer rounded-full transition ' +
                  (isSelected
                    ? 'bg-gray-600 dark:bg-gray-200 text-gray-200 dark:text-gray-600'
                    : isIncompatible
                    ? 'text-gray-900 dark:text-gray-200 hover:bg-gray-600 hover:text-gray-200 dark:hover:bg-gray-200 dark:hover:text-gray-600 opacity-40'
                    : 'text-gray-900 dark:text-gray-200 hover:bg-gray-600 hover:text-gray-200 dark:hover:bg-gray-200 dark:hover:text-gray-600'
                  )
                }
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
      <div id="article-grid" className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((article, i) => (
          <a
            key={article.title + i}
            href={article.slug ? `/${article.slug}` : '#'}
            className="block"
          >
            <Card className="article-card group relative h-72 sm:h-72 md:h-80 lg:h-96 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition p-0 flex cursor-pointer">
              {article.image && (
                <div className="absolute inset-0">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover object-center transition scale-105 brightness-[1] dark:brightness-[0.35] grayscale group-hover:grayscale-0 group-hover:brightness-100 dark:group-hover:brightness-[0.6]" />
                </div>
              )}
              <div className="relative z-10 w-full h-full flex flex-col justify-end p-5">
                <h2 className="font-bold text-gray-900 dark:text-white outline-solid drop-shadow-[0_2px_2px_rgba(0,0,0,1)] text-xl mb-1 line-clamp-6 uppercase break-words">{article.title}</h2>
                <div className="mb-2 flex flex-wrap gap-1 text-gray-900 dark:text-white">
                  {
                    // (article.tags||[]).map(t =>
                    //     <Badge key={t} className="bg-black/50 px-2 py-0.5 text-xs">{t}</Badge>
                    // )
                    (article.tags||[]).join(" · ")
                  }
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">{formatDate(article.date)}</div>
                {
                  // article.body && (
                  //   <div className="text-sm text-white/90 opacity-90 line-clamp-2">
                  //     {article.body.slice(0, 150).replace(/\n+/g, ' ')}{article.body.length > 150 ? '…' : ''}
                  //   </div>
                  // )
                }
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
