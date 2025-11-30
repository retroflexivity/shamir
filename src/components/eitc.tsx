import React from "react";
import { Header } from "./Header";
import { ImageCarousel } from "./ImageCarousel";
import type { Translations, Locale } from "../i18n/translations";

export interface EITCProps {
  locale?: Locale;
  translations?: Translations;
  currentPath?: string;
}

const EITC_LOGO_URL = '/images/2020/04/eitc-logo.jpg';

export function EITC({ 
  locale = 'ru', 
  translations,
  currentPath = '/eitc'
}: EITCProps) {
  const t = translations;
  if (!t) return null;

  const { eitcPageTitle, eitcPageSubtitle, eitcSections } = t;

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-16">
      <Header showBackButton={true} locale={locale} translations={t} currentPath={currentPath} />

      {/* Logo and Title Section */}
      <section className="my-8 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
        <div className="flex-shrink-0 w-full md:w-1/5 mb-4 md:mb-0">
          <img src={EITC_LOGO_URL} alt="EITC Logo" className="w-full max-w-[200px] object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-lightaccent dark:text-darkaccent mb-2 uppercase font-bold">
            {eitcPageTitle}
          </h1>
        </div>
      </section>

      {/* Content Sections in Grid Layout */}
      {eitcSections.map((section, sectionIndex) => {
        // Second section (index 1) has images on the right, others on the left
        const isSecondSection = sectionIndex === 1;
        const scrollInterval = sectionIndex === 0 ? 5000 : sectionIndex === 1 ? 4000 : 3000;
        
        return (
          <React.Fragment key={sectionIndex}>
            {sectionIndex > 0 && (
            <hr className="max-w-xl mx-auto my-12 border-lightfg/50 dark:border-darkfg/50 border"></hr>
            )}
            <section className="my-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
              {isSecondSection ? (
                <>
                  <div className="md:col-span-2 prose dark:prose-invert max-w-none">
                    {section.paragraphs.map((paragraph, paraIndex) => (
                      <p key={paraIndex} className="mb-4 text-base leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center">
                    <div className="sticky top-8 w-full">
                      <ImageCarousel 
                        images={section.images}
                        autoScrollInterval={scrollInterval}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-1 flex items-center justify-center">
                    <div className="sticky top-8 w-full">
                      <ImageCarousel 
                        images={section.images}
                        autoScrollInterval={scrollInterval}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 prose dark:prose-invert max-w-none">
                    {section.paragraphs.map((paragraph, paraIndex) => (
                      <p key={paraIndex} className="mb-4 text-base leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </section>
          </React.Fragment>
        );
      })}
    </div>
  );
}
