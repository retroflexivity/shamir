import React, { useMemo } from "react";
import { ArticleCard, ImageCard } from "./ui/card";
import { Header } from "./Header";
import { Tooltip } from "./ui/tooltip";
import type { Article } from "./types";
import type { Translations, Locale } from "../i18n/translations";
import { getLocalizedPath } from "../i18n/utils";
import logoSvg from "../assets/logo.svg?raw";

export interface HomePageProps {
  articles: Article[];
  locale?: Locale;
  translations?: Translations;
  currentPath?: string;
}

function getProjectLinks(t: Translations): {href: string, label: string}[] {
  return [
    { href: "https://www.rglhm.lv/", label: t.visitMuseum },
    { href: "https://www.zahor.lv/", label: t.supportMemory },
  ];
}

function getSections(t: Translations): Map<string, { title: string; subtitle: string; tag: string }> {
  return new Map([
    ['education', { title: t.education, subtitle: t.educationSubtitle, tag: t.education }],
    ['exhibitions', { title: t.exhibitions, subtitle: t.exhibitionsSubtitle, tag: t.exhibitions }],
    ['concerts', { title: t.concerts, subtitle: t.concertsSubtitle, tag: t.concerts }],
  ]);
}

export function HomePage({ articles, locale = 'ru', translations, currentPath = '/' }: HomePageProps) {
  const t = translations;
  if (!t) {
    // Fallback if translations not provided
    return <div>Loading...</div>;
  }

  const projectLinks = getProjectLinks(t);
  const sections = getSections(t);
  
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
  }, [articles, sections]);

  const archivePath = getLocalizedPath('/archive', locale);
  const eitcPath = getLocalizedPath('/eitc', locale);

  return (
    <div className="mx-auto text-lightfg dark:text-darkfg">
      <div className="mx-8">
        <Header locale={locale} translations={t} currentPath={currentPath} />
      </div>
      <div id="logo"
        className="flex justify-center items-center mt-10 mb-10 text-lightaccent dark:text-darkaccent [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-80"
        dangerouslySetInnerHTML={{ __html: logoSvg }}
        aria-label="Shamir Association Riga Ghetto and Latvia Holocaust Museum Logo"
      />
      <div id="about" className="flex flex-col items-center gap-2 mb-16">
        <div className="sm:mx-8 md:mx-16 text-center font-serif text-lightaccent dark:text-darkaccent shine-light dark:shine-dark mb-6">
          <p className="text-2xl">{t.aboutText1}</p>
          <p className="text-xl mb-0">{t.aboutText2}</p>
        </div>
        <div className="text-xl grid gap-10 px-4 mb-6">
          {projectLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="btn btn-lg text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div>
          <a href={archivePath} className="text-xl underline">{t.allNews}</a>
        </div>
      </div>
      
      <section key="publications" className="home-section">
          <header>
            <h2 className="mb-3">{t.publications}</h2>
          </header>

          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="flex flex-wrap items-center justify-center gap-5">
              <span className="text-3xl">{t.publicationsText1}<br/>{t.publicationsText2}</span>
              <span className="text-7xl font-sans">51</span>
              <span className="max-w-xs text-xl leading-tight">{t.publicationsText3}<br/>{t.publicationsText4}<br/>{t.publicationsText5}</span>
            </div>
            <div>
              <Tooltip className="flex flex-wrap items-center justify-center gap-4" content={t.publicationsTooltip}>
                <span className="text-xl underline decoration-dotted">{t.publicationsText6}</span>
                <span className="text-8xl font-sans">7</span>
                <span className="text-xl underline decoration-dotted">{t.publicationsText7}</span>
              </Tooltip>
            </div>
            <div className="max-w-xs text-xl leading-tight">{t.publicationsText8}<br/>{t.publicationsText9}<br/><a href="https://shamirshop.lv" className="underline">{t.shopLink}</a></div>
          </div>
      </section>


      {Array.from(sections.entries()).map(([key, section]) => {
        const sectionArticlesList = sectionArticles.get(key) || [];
        const archiveTagPath = `${archivePath}?tag=${encodeURIComponent(section.tag)}`;
        
        return (
          <section key={key} className="home-section">
            <a href={archiveTagPath}>
              <header>
                <h2>{section.title}</h2>
                <a
                  href={archiveTagPath}
                  className="btn min-w-16"
                >
                  →
                </a>
              </header>
            </a>
            <p className="subtitle">{section.subtitle}</p>
            <div className="article-grid">
              {sectionArticlesList.map((article, i) => (
                <ArticleCard key={article.title + i} article={article} locale={locale} />
              ))}
            </div>
          </section>
        );
      })}

      <section key="eitc" className="home-section">
        <a href={eitcPath}>
          <header>
            <h2>{t.eitcTitle}</h2>
            <a href={eitcPath} className="btn">{t.eitcLearnMore}</a>
          </header>
        </a>
        <p className="subtitle">{t.eitcSubtitle}</p>
        <div className="image-grid">
            <ImageCard src="/images/2020/04/2017.04.27.Hol-Jipsy_002-1024x680.jpg" alt="eitc 1" />
            <ImageCard src="/images/2020/04/IMG_5226.jpg" alt="eitc 2" />
            <ImageCard src="/images/2020/04/2017.05.14.Hol-Gipsy_028-1024x794.jpg" alt="eitc 3" />
        </div>
      </section>
      
      <footer className="pb-10 px-4 text-center">
        <hr className="max-w-xl mx-auto my-12 border-lightfg dark:border-darkfg"></hr>
        <h3 className="mb-4">{t.footerTitle}</h3>
        <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2">
          <div>
            <h4>{t.contactUs}</h4>
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
            <h4>{t.donate}</h4>
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
