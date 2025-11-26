import React, { useMemo } from "react";
import { ArticleCard } from "./ui/card";
import { Header } from "./Header";
import { Tooltip } from "./ui/tooltip";
import type { Article } from "./types";
import logoSvg from "../assets/logo.svg?raw";

export interface HomePageProps {
  articles: Article[];
}

const projectLinks: {href: string, label: string}[] = [
  { href: "https://www.rglhm.lv/", label: "На сайт музея Рижского гетто" },
  { href: "https://www.zahor.lv/", label: "Поддержать память жертв Холокоста" },
];

const sections = new Map([
  ['education', { title: 'Образование', subtitle: 'Более 2000 участников, включая школьников и студентов', tag: 'Образование' }],
  ['exhibitions', { title: 'Выставки', subtitle: 'В музее Рижского гетто и не только', tag: 'Выставки' }],
  ['concerts', { title: 'Концерты', subtitle: 'Концерты и фестивали еврейской музыки', tag: 'Концерты' }],
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
      <div id="about" className="flex flex-col items-center gap-2 mb-16">
        <div className="sm:mx-8 md:mx-16 text-center font-serif text-lightaccent dark:text-darkaccent mb-6">
          <p className="text-2xl">Больше двадцати лет мы сохраняем и исследуем память об истории евреев Латвии.</p>
          <p className="text-xl mb-0">Основная деятельность Шамира сейчас — музей Рижского гетто. А это сайт-архив, где можно узнать о наших прошлых проектах.</p>
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
          <a href="/archive" className="text-xl underline">Все новости в архиве</a>
        </div>
      </div>
      
      <section key="publications" className="home-section">
          <header>
            <h2 className="mb-3">Публикации</h2>
          </header>

          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="flex flex-wrap items-center justify-center gap-5">
              <span className="text-3xl">нами<br/>издано</span>
              <span className="text-7xl font-sans">51</span>
              <span className="max-w-xs text-xl leading-tight">книг,<br/>каталогов,<br/>календарей</span>
            </div>
            <div>
              <Tooltip className="flex flex-wrap items-center justify-center gap-4" content="русском, латышском, английском, немецком, испанском, французском и иврите.">
                <span className="text-xl underline decoration-dotted">на</span>
                <span className="text-8xl font-sans">7</span>
                <span className="text-xl underline decoration-dotted">языках,</span>
              </Tooltip>
            </div>
            <div className="max-w-xs text-xl leading-tight">которые можно<br/>приобрести в<br/><a href="https://shamirshop.lv" className="underline">нашем магазине</a></div>
          </div>
      </section>


      {Array.from(sections.entries()).map(([key, section]) => {
        const sectionArticlesList = sectionArticles.get(key) || [];
        
        return (
          <section key={key} className="home-section">
            <a href={`/archive?tag=${encodeURIComponent(section.tag)}`}>
              <header>
                <h2>{section.title}</h2>
                <a
                  href={`/archive?tag=${encodeURIComponent(section.tag)}`}
                  className="btn min-w-16"
                >
                  →
                </a>
              </header>
            </a>
            <p className="subtitle">{section.subtitle}</p>
            <div className="article-grid">
              {sectionArticlesList.map((article, i) => (
                <ArticleCard key={article.title + i} article={article} />
              ))}
            </div>
          </section>
        );
      })}

      <section key="eitc" className="home-section">
        <a href="http://shamir.lv/eitc-2/">
          <header>
            <h2>Европейский международный центр толерантности</h2>
            <a href="http://shamir.lv/eitc-2/" className="btn">Узнать больше</a>
          </header>
        </a>
        <p className="subtitle">Подзаголовок о Центре толерантности</p>
        <div className="image-grid">
          <img src="http://shamir.lv/wp-content/uploads/2020/04/2017.04.27.Hol-Jipsy_002-1024x680.jpg" alt="" />
          <img src="http://shamir.lv/wp-content/uploads/2020/04/IMG_5226.jpg" alt="" />
          <img src="http://shamir.lv/wp-content/uploads/2020/04/2017.05.14.Hol-Gipsy_028-1024x794.jpg" alt="" />
        </div>
      </section>
      
      <footer className="pb-10 px-4 text-center">
        <hr className="max-w-xl mx-auto my-12 border-lightfg dark:border-darkfg"></hr>
        <h3 className="mb-4">Общество Шамир</h3>
        <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2">
          <div>
            <h4>Связаться с нами:</h4>
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
            <h4>Пожертвовать:</h4>
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
