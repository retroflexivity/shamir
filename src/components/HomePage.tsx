import React, { useMemo } from "react";
import { ArticleCard } from "./ui/card";
import { Header } from "./Header";
import type { Article } from "./types";
import logoSvg from "../assets/logo.svg?raw";

export interface HomePageProps {
  articles: Article[];
}

const projectLinks: {href: string, label: string}[] = [
  { href: "http://shamir.lv/%D0%BA%D0%BD%D0%B8%D0%B3%D0%B8/", label: "Наши публикации" },
  { href: "https://www.rglhm.lv/", label: "Музей Рижского гетто" },
  { href: "http://shamir.lv/eitc-2/", label: "Центр толерантности" },
];

const sections = new Map([
  ['publications', { title: 'Публикации', tag: 'Деятельность' }],
  ['projects', { title: 'Проекты', tag: 'Проекты' }],
  ['exhibitions', { title: 'Выставки', tag: 'Выставки' }],
  ['concerts', { title: 'Концерты', tag: 'Концерты' }],
]);

export function HomePage({ articles }: HomePageProps) {
  // Get articles for each section
  const sectionArticles = useMemo(() => {
    const result = new Map<string, Article[]>();
    
    sections.forEach((section, key) => {
      const filtered = articles
        .filter(article => (article.tags || []).includes(section.tag))
        .sort((a, b) => {
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
        })
        .slice(0, 4); // Get only first 4
      result.set(key, filtered);
    });
    
    return result;
  }, [articles]);

  return (
    <div className="mx-auto text-lightfg dark:text-darkfg">
      <div className="mx-8">
        <Header/>
      </div>
      <div id="logo"
        className="flex justify-center items-center mt-10 mb-10 text-lightaccent dark:text-darkaccent [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-80"
        dangerouslySetInnerHTML={{ __html: logoSvg }}
        aria-label="Shamir Association Riga Ghetto and Latvia Holocaust Museum Logo"
      />
      <div id="about" className="flex flex-col items-center gap-2 mb-10">
        <div className="mx-8 text-center font-serif text-lightaccent dark:text-darkaccent mb-4">
          <p className="text-2xl">Больше двадцати лет мы сохраняем и исследуем память об истории евреев Латвии.</p>
          <p className="text-xl">Основная деятельность Шамира сейчас — музей Рижского гетто. А это сайт-архив, где можно узнать о наших прошлых проектах.</p>
        </div>
        <div className="text-xl grid grid-cols-1 sm:grid-cols-3 gap-10 px-4 max-w-100">
          {projectLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="btn btn-lg w-full text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <hr className="max-w-xl mx-auto my-16 border-lightfg dark:border-darkfg"></hr>
      
      {Array.from(sections.entries()).map(([key, section]) => {
        const sectionArticlesList = sectionArticles.get(key) || [];
        
        return (
          <div key={key} className="mb-16 px-4">
            <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold">{section.title}</h2>
              <a
                href={`/archive?tag=${encodeURIComponent(section.tag)}`}
                className="btn"
              >
                Все {section.title.toLowerCase()} →
              </a>
            </div>
            <div className="grid mb-0 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
              {sectionArticlesList.map((article, i) => (
                <ArticleCard key={article.title + i} article={article} />
              ))}
            </div>
          </div>
        );
      })}
      
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
