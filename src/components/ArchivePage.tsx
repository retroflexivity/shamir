import React, { useState, useMemo, useEffect } from "react";
import { Input } from "./ui/input";
import { Badge, Tag } from "./ui/badge";
import { ArticleCard } from "./ui/card";
import { Header } from "./Header";
import type { Article } from "./types";

export interface ArchivePageProps {
  articles: Article[];
  initialTag?: string;
}

const priorityTags : Set<string> = new Set([
  'Деятельность',
  'Проекты',
  'Исследования',
  'Выставки'
])

export function ArchivePage({ articles, initialTag }: ArchivePageProps) {
  const allTags = useMemo(() =>
    Array.from(new Set(articles.flatMap(a => a.tags || [])))
  , [articles]);
  const [searchValue, setSearchValue] = useState("");
  
  // Always start with empty set to avoid hydration mismatch
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const normalize = (text: string) => text.toLowerCase().replace(/ё/g, "е");

  // Set tag from prop or URL after mount (client-side only)
  useEffect(() => {
    const tag = (initialTag && initialTag.trim() !== '') 
      ? initialTag 
      : (() => {
          const params = new URLSearchParams(window.location.search);
          const urlTag = params.get('tag');
          return urlTag ? decodeURIComponent(urlTag) : null;
        })();
    
    if (tag) {
      setSelectedTags(new Set([tag]));
    }
  }, [initialTag]);

  // Update selected tags when URL changes (e.g., from back/forward navigation)
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tag = params.get('tag');
      if (tag) {
        setSelectedTags(new Set([decodeURIComponent(tag)]));
      } else {
        setSelectedTags(new Set());
      }
    };
    
    // Listen for back/forward navigation
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

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

  function clearTags() {
    setSelectedTags(new Set());
  }

  return (
    <div className="mx-auto text-lightfg dark:text-darkfg">
      <div className="mx-8">
        <Header showBackButton={true}/>
      </div>
      <div id="articles" className="flex flex-col items-center gap-6 px-4 mt-10">
        <h1 className="text-3xl font-bold mb-4">Архив</h1>
        <Input
          className="w-full max-w-xl focus:max-w-2xl light text-center text-xl transition-all duration-300 ease-in-out"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Искать"
          id="search-input"
        />
        <div
          id="tag-list"
          className="flex h-14 flex-nowrap overflow-x-auto whitespace-nowrap gap-x-2 px-1 pb-6 w-full scrollbar-thin scrollbar-thumb-gray-300 no-scrollbar"
        >
          {selectedTags.size > 0 && (
            <>
              <Badge
                className="px-3 py-1 shadow-md inset-shadow-xl cursor-pointer rounded-full transition hover:bg-lightfg dark:hover:bg-darkfg hover:text-lightbg dark:hover:text-darkbg"
                onClick={clearTags}
              >
                ✕ 
              </Badge>
              <div className="w-px mx-1 border-l border-lightfg/40 dark:border-darkfg/40"></div>
            </>
          )}
          {sortedTags.map(tag => {
            const isSelected = selectedTags.has(tag);
            const isCompatible = isTagCompatible(tag);
            const isIncompatible = !isSelected && !isCompatible;
            
            return (
              <Tag
                key={tag}
                data-tag={tag}
                isSelected={isSelected}
                isIncompatible={isIncompatible}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Tag>
            );
          })}
        </div>
      </div>
      <div id="article-grid" className="grid mb-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filtered.map((article, i) => (
          <ArticleCard key={article.title + i} article={article} />
        ))}
      </div>
      <footer className="pb-10 px-4 text-center">
        <hr className="max-w-xl mx-auto my-12 border-lightfg dark:border-darkfg"></hr>
        <h2 className="text-xl mb-4">Общество Шамир</h2>
        <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="text-lg underline">Связаться с нами:</h3>
            <p>
              <a href="mailto:shamir@shamir.lv">
                shamir@shamir.lv
              </a>
            </p>
            <p>
              Shamir Society<br />
              Turgeneva 2<br />
              Riga, LV-1050<br />
              Latvia
            </p>
          </div>
          <div>
            <h3 className="text-lg underline">Пожертвовать:</h3>
            <p>
              Shamir Society<br />
              Reg Nr 40008083814<br />
              SEB Banka<br />
              SWIFT UNLALV2X<br />
              LV64UNLA0050020638195 (EUR)
            </p>
            <p className="mt-4">PayPal: rgm@rgm.lv</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
