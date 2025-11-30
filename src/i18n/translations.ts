export type Locale = 'ru' | 'lv' | 'en';

export const defaultLocale: Locale = 'ru';
export const locales: Locale[] = ['ru', 'lv', 'en'];

export const localeNames: Record<Locale, string> = {
  ru: 'Русский',
  lv: 'Latviešu',
  en: 'English',
};

export interface EITCSection {
  images: string[];
  paragraphs: string[];
}

export interface Translations {
  // Header
  backToHome: string;
  
  // Home page
  homeTitle: string;
  aboutText1: string;
  aboutText2: string;
  visitMuseum: string;
  supportMemory: string;
  allNews: string;
  publications: string;
  publicationsText1: string;
  publicationsText2: string;
  publicationsText3: string;
  publicationsText4: string;
  publicationsText5: string;
  publicationsText6: string;
  publicationsText7: string;
  publicationsText8: string;
  publicationsText9: string;
  publicationsTooltip: string;
  shopLink: string;
  eitcTitle: string;
  eitcSubtitle: string;
  eitcLearnMore: string;
  contactUs: string;
  donate: string;
  footerTitle: string;
  
  // Archive page
  archive: string;
  search: string;
  
  // Sections
  education: string;
  educationSubtitle: string;
  exhibitions: string;
  exhibitionsSubtitle: string;
  concerts: string;
  concertsSubtitle: string;
  
  // EITC page
  eitcPageTitle: string;
  eitcPageTitle: string;
  eitcSections: EITCSection[];
}

export const translations: Record<Locale, Translations> = {
  ru: {
    backToHome: '← Вернуться на главную',
    homeTitle: 'Главная',
    aboutText1: 'Больше двадцати лет мы сохраняем и исследуем память об истории евреев Латвии.',
    aboutText2: 'Основная деятельность Шамира сейчас — музей Рижского гетто. А это сайт-архив, где можно узнать о наших прошлых проектах.',
    visitMuseum: 'На сайт музея Рижского гетто',
    supportMemory: 'Поддержать память жертв Холокоста',
    allNews: 'Все новости в архиве',
    publications: 'Публикации',
    publicationsText1: 'нами',
    publicationsText2: 'издано',
    publicationsText3: 'книг,',
    publicationsText4: 'каталогов,',
    publicationsText5: 'календарей',
    publicationsText6: 'на',
    publicationsText7: 'языках,',
    publicationsText8: 'которые можно',
    publicationsText9: 'приобрести в',
    publicationsTooltip: 'русском, латышском, английском, немецком, испанском, французском и иврите.',
    shopLink: 'нашем магазине',
    eitcTitle: 'Европейский международный центр толерантности',
    eitcSubtitle: 'Сохраняем память',
    eitcLearnMore: 'Узнать больше',
    contactUs: 'Связаться с нами:',
    donate: 'Пожертвовать:',
    footerTitle: 'Общество Шамир',
    archive: 'Архив',
    search: 'Искать',
    education: 'Образование',
    educationSubtitle: 'Более 2000 участников, включая школьников и студентов',
    exhibitions: 'Выставки',
    exhibitionsSubtitle: 'В музее Рижского гетто и не только',
    concerts: 'Концерты',
    concertsSubtitle: 'Концерты и фестивали еврейской музыки',
    eitcPageTitle: 'Европейский международный центр толерантности',
    eitcSections: [
      {
        images: [
          'http://shamir.lv/wp-content/uploads/2020/04/2017.04.27.Hol-Jipsy_002-1024x680.jpg',
          'http://shamir.lv/wp-content/uploads/2020/04/2.jpg',
        ],
        paragraphs: [
          'Когда мы говорим о Холокосте, то перед глазами встают ужасные картины, известные нам по воспоминаниям очевидцев — газовые камеры, крематории, лагеря смерти… Но ведь Холокост не начинался с геноцида, он не начинался с гетто и расовых законов и даже не с прихода к власти Гитлера в 1933 году. Он начинался с общественных акций молодой тогда нацистской партии, с марширующих молодчиков со свастиками на рукавах, с хулиганских нападений на евреев, наконец с издания с виду безобидной книжки под названием «Майн Кампф».',
          'Времена изменились, но мир переживает похожие события. Радикалы хотят видеть Европу близкой к той, какой ее хотел видеть Гитлер — без евреев, мусульман, без демократии и намека на толерантность. Их всех объединяет одно — нетерпимость к «другим», ненависть к инакомыслящим, отрицание закона и прав человека.',
        ],
      },
      {
        images: [
          'http://shamir.lv/wp-content/uploads/2020/04/IMG_5350.jpg',
          'http://shamir.lv/wp-content/uploads/2020/04/IMG_5242.jpg',
          'http://shamir.lv/wp-content/uploads/2020/04/IMG_5226.jpg',
        ],
        paragraphs: [
          'Все это происходит в Европе, еще совсем недавно считавшейся самым стабильным и безопасным континентом, в Европе, сказавшей себе еще в далеком 1945 г. слова NEVER MORE (НИКОГДА БОЛЬШЕ), и сделавшей их своим политическим лозунгом применительно к любой человеконенавистнической идеологии. Теперь здесь снова убивают и калечат людей по одному единственному мотиву — мотиву ненависти.',
          'Все это говорит о том, что нам пора переходить к изучению истории Холокоста не только как академической, но и научно-практической дисциплины, призванной объяснить, что может, а что не может себе позволить демократическое обществосегодня. Мы должны подумать о том, что не так в Европе, что нужно сделать, чтобы исчезли предпосылки для ненависти, чтобы толерантность снова стала основой европейской жизни?',
        ],
      },
      {
        images: [
          'http://shamir.lv/wp-content/uploads/2020/04/2017.05.14.Hol-Gipsy_028-1024x794.jpg',
        ],
        paragraphs: [
          'Для этого мы должны дополнить академические исследования истории Европы 3040-х гг. исследованиями современного состояния европейского общества.',
          'Каждая европейская страна имеет свою специфику, но проблемы ненависти — это системные проблемы, которые имеют общие черты, характерные для всей Европы. Исходя из этого, Правление Балтийского центра толерантности совместно с Обществом «Шамир», Музеем Рижского гетто и Европейским центром развития демократии приняло решение о преобразовании Балтийского центра толерантности в Европейский центр толерантности.',
          'Задачами Центра толерантности стало осуществление фундаментальных научных исследований и просветительской деятельности, связанной с историей Холокоста и современными проблемами толерантности, а также содействие диалогу между народами с целью предотвращения конфликтов.',
          'То, что Европейский центр толерантности начал свою работу в Латвии, знаменательно. Ведь Латвия пережила две оккупации, Холокост и несколько волн депортаций. Сегодня Латвия — это независимое демократическое государство, которое не раз заявляло о своей приверженности европейским ценностям. И весьма симптоматично, что именно здесь создан Европейский центр толерантности, в создание которого внесли свою лепту европейские эксперты, имеющие высокую научную репутацию исследователей Холокоста и современных форм радикализма, а также религиозные и общественные деятели.',
        ],
      },
    ],
  },
  lv: {
    backToHome: '← Atgriezties uz sākumlapu',
    homeTitle: 'Sākums',
    aboutText1: 'Vairāk nekā divdesmit gadus mēs saglabājam un pētām ebreju vēsturi Latvijā.',
    aboutText2: 'Šamīra galvenā darbība tagad ir Rīgas geto muzejs. Šis ir arhīva vietne, kur var uzzināt par mūsu pagātnes projektiem.',
    visitMuseum: 'Uz Rīgas geto muzeja vietni',
    supportMemory: 'Atbalstīt Holokausta upuru piemiņu',
    allNews: 'Visas ziņas arhīvā',
    publications: 'Publikācijas',
    publicationsText1: 'mums',
    publicationsText2: 'izdots',
    publicationsText3: 'grāmatu,',
    publicationsText4: 'katalogu,',
    publicationsText5: 'kalendāru',
    publicationsText7: 'valodās,',
    publicationsText8: 'kurus var',
    publicationsText9: 'iegādāties',
    publicationsTooltip: 'krievu, latviešu, angļu, vācu, spāņu, franču un ebreju.',
    shopLink: 'mūsu veikalā',
    eitcTitle: 'Eiropas starptautiskais tolerances centrs',
    eitcSubtitle: 'Glābājam atmiņu',
    eitcLearnMore: 'Uzzināt vairāk',
    contactUs: 'Sazināties ar mums:',
    donate: 'Ziedot:',
    footerTitle: 'Šamīra biedrība',
    archive: 'Arhīvs',
    search: 'Meklēt',
    education: 'Izglītība',
    educationSubtitle: 'Vairāk nekā 2000 dalībnieku, ieskaitot skolēnus un studentus',
    exhibitions: 'Izstādes',
    exhibitionsSubtitle: 'Rīgas geto muzejā un ne tikai',
    concerts: 'Koncerti',
    concertsSubtitle: 'Koncerti un ebreju mūzikas festivāli',
    eitcPageTitle: 'Eiropas starptautiskais tolerances centrs',
    eitcSections: [
      {
        images: [
          'http://shamir.lv/wp-content/uploads/2020/04/2017.04.27.Hol-Jipsy_002-1024x680.jpg',
          'http://shamir.lv/wp-content/uploads/2020/04/2.jpg',
        ],
        paragraphs: [
          'Kad runājam par holokaustu, mūsu acu priekšā uzaust biedējošas ainas, kuras mums zināmas no aculiecinieku atmiņām – gāzes kameras, krematorijas, nāves nometnes… Taču holokausts nesākās ar genocīdu, tas nesākās ar geto un rasu likumiem, pat ne ar Hitlera nākšanu pie varas 1933.gadā. Tas sākās ar tolaik vēl jaunās nacistu partijas sabiedriskajām akcijām, ar soļojošiem slepkavām ar svastikām uz piedurknēm, ar huligāniskiem uzbrukumiem ebrejiem, un visbeidzot ar škietami nevainīgas grāmatiņas izdošanu zem nosaukuma "Mana cīņa".',
          'Laiki ir izmainījušies, šobrīd pasaule piedzīvo līdzīgus notikumus. Radikāļi vēlas redzēt Eiropu, kas izskatītos līdzīga tai, kādu to vēlējās redzēt Hitlers – bez ebrejiem, musulmaņiem, bez demokrārtijas un atsaukšanās uz toleranci. Viņus visus vieno viens motīvs — neiecietība pret "citādajiem", naids pret citādi domājošajiem, likuma un cilvēktiesību noliegšana.',
        ],
      },
      {
        images: [
          'http://shamir.lv/wp-content/uploads/2020/04/IMG_5350.jpg',
          'http://shamir.lv/wp-content/uploads/2020/04/IMG_5242.jpg',
          'http://shamir.lv/wp-content/uploads/2020/04/IMG_5226.jpg',
        ],
        paragraphs: [
          'Tas viss notiek Eiropā, kura vēl pavisam nesen tika uzskatīta par visstabilāko un drošāko kontinentu – Eiropā, kura vēl tālajā 1945.gadā izteica vārdus NEVER MORE (NEKAD VAIRS), padarot tos par savu politisko lozungu, kuru attiecināja to uz jebkuru cilvēku nīstošo ideoloģiju. Tagad šeit atkal nogalina cilvēkus pēc viena vienīga motīva – naida motīva.',
          'Tas viss liecina, ka mums pienācis laiks pāriet pie holokausta vēstures apguves ne tikai no akadēmiskā, bet arī zinātniski-praktiskā aspekta, kuras mērķis ir izskaidrot, kas ir pieļaujams un kas nav pieļaujams demokrātiskā sabiedrībā mūsdienās. Mums jāapdomā, kas Eiropā ir nogājis greizi un kas būtu jādara, lai izzustu priekšnosacījumi naidam un tolerance no jauna kļūtu par pamatu eiropieša dzīvei? Tādēļ akadēmiskie pētījumi par Eiropu 30-40-jos gados mums jāpapildina ar pētījumiem par mūsdienu Eiropas sabiedrības stāvokli.',
        ],
      },
      {
        images: [
          'http://shamir.lv/wp-content/uploads/2020/04/2017.05.14.Hol-Gipsy_028-1024x794.jpg',
        ],
        paragraphs: [
          'Katrai Eiropas valstij ir sava specifika, taču neiecietības problemātika — tās ir sistemātiskas problēmas, kurām ir kopīgas iezīmes, kas raksturīgas visai Eiropai. Ņemot to vērā, Baltijas tolerances centra valde sadarbībā ar biedrību "Šamir", Rīgas geto un holokausta muzejs Latvijā un Eiropas demokrātijas attīstības centrs ir pieņēmis lēmumu par Baltijas tolerances centra pārveidošanu Eiropas tolerances centrā.',
          'Tolerances centra uzdevumos ietilpst fundamentālu zinātnisku pētījumu veikšana un izglītojošais darbs, kas saistīts ar holokausta vēsturi un mūsdienu tolerances problēmām, kā arī dialoga veicināšanai starp tautām ar mērķi novērst konfliktus.',
          'Eiropas tolerances centra darbības uzsākšana Latvijā ir ļoti svarīgs notikums. Latvija savulaik ir piedzīvojusi divas okupācijas, holokaustu un vairākus deportāciju viļņus. Šodien Latvija – tā ir neatkarīga demokrātiska valsts, kura ne vienu vien reizi ir paziņojusi par savu piesaisti eiropejiskām vērtībām. Simptomātiski, ka tieši šeit ir tapis Eiropas tolerances centrs, kura izveidošanā savu ieguldījumu snieguši Eiropas eksperti ar augstu holokausta un moderno radikālisma izpausmju pētniecības zinātnisko reputāciju, kā arī reliģiskie un sabiedriskie darbinieki.',
        ],
      },
    ],
  },
  en: {
    backToHome: '← Back to home',
    homeTitle: 'Home',
    aboutText1: 'For more than twenty years, we have been preserving and researching the history of Jews in Latvia.',
    aboutText2: 'Shamir\'s main activity now is the Riga Ghetto Museum. This is an archive site where you can learn about our past projects.',
    visitMuseum: 'Visit the Riga Ghetto Museum website',
    supportMemory: 'Support the memory of Holocaust victims',
    allNews: 'All news in the archive',
    publications: 'Publications',
    publicationsText1: 'we have',
    publicationsText2: 'published',
    publicationsText3: 'books,',
    publicationsText4: 'catalogs,',
    publicationsText5: 'calendars',
    publicationsText6: 'in',
    publicationsText7: 'languages,',
    publicationsText8: 'which can be',
    publicationsText9: 'purchased',
    publicationsTooltip: 'Russian, Latvian, English, German, Spanish, French, and Hebrew.',
    shopLink: 'our shop',
    eitcTitle: 'European International Tolerance Center',
    eitcSubtitle: 'Protecting the memory',
    eitcLearnMore: 'Learn more',
    contactUs: 'Contact us:',
    donate: 'Donate:',
    footerTitle: 'Shamir Society',
    archive: 'Archive',
    search: 'Search',
    education: 'Education',
    educationSubtitle: 'More than 2000 participants, including schoolchildren and students',
    exhibitions: 'Exhibitions',
    exhibitionsSubtitle: 'At the Riga Ghetto Museum and beyond',
    concerts: 'Concerts',
    concertsSubtitle: 'Concerts and festivals of Jewish music',
    eitcPageTitle: 'European international tolerance center',
    eitcSections: [
      {
        images: [
          'http://shamir.lv/wp-content/uploads/2020/04/2017.04.27.Hol-Jipsy_002-1024x680.jpg',
          'http://shamir.lv/wp-content/uploads/2020/04/2.jpg',
        ],
        paragraphs: [
          'While talking of Holocaust, we imagine terrible picture, made known to us by eyewitnesses – the gas chambers, crematories, death camps … But the Holocaust did not start with the genocide, it did not begin with the ghettos and racial discrimination, not even with Hitler rising to power in 1933. It started with public activities of the young Nazi party, with marching thugs with swastikas on their sleeves, with vandal attacks on Jews, and finally with publication of seemingly harmless book called "Mein Kampf."',
          'Times have changed, but the world is going through similar event. Radical extremists want to see Europe Hitler\'s way – free of Jews, Muslims, with no democracy and tolerance. They are all united by the same passion – intolerance of "other," hatred of dissidents, disclaiming law and human rights.',
        ],
      },
      {
        images: [
          'http://shamir.lv/wp-content/uploads/2020/04/IMG_5350.jpg',
          'http://shamir.lv/wp-content/uploads/2020/04/IMG_5242.jpg',
          'http://shamir.lv/wp-content/uploads/2020/04/IMG_5226.jpg',
        ],
        paragraphs: [
          'This is happening in Europe, just recently considered the most stable and secure continent, in Europe, who declared back in 1945 NEVER AGAIN, and making it political slogan in relation to any extremist ideology. But people are getting killed here again based on one single motive – hate.',
          'Obviously, we should proceed with study of Holocaust history not only as academic discipline, but scientific and practical, aiming to clarify boundaries of democratic society. We have to identify what is wrong in Europe, what we have to do though preconditions for hatred would vanish, though tolerance would become the basis of European life again. To make this happen, we have to complete academic studies of European history of years 30-40 as well as modern studies of European society.',
        ],
      },
      {
        images: [
          'http://shamir.lv/wp-content/uploads/2020/04/2017.05.14.Hol-Gipsy_028-1024x794.jpg',
        ],
        paragraphs: [
          'Each European country has its own identity, but the problem of hate – is systemic problem. It has common features typical for the whole Europe. Based on this Board of the Baltic Center of tolerance, together with the Association "Shamir", Museum of the Riga ghetto and the European Centre for Democracy Development decided to expend the Baltic Center of tolerance in European Center of tolerance.',
          'Main goals of the Centre are fundamental scientific researches and educational activities related to the history of the Holocaust and contemporary issues of tolerance, to contributing to the dialogue between nations in order to prevent conflicts.',
          'In fact, it is remarkable that the European Centre of Tolerance started its work in Latvia. After all, Latvia has experienced two occupation, the Holocaust, and several series of deportations. Today, Latvia – is an independent democratic state, which has repeatedly proved its commitment to European values. And quite symptomatic that the European Centre of Tolerance set up here, European experts with the highest academic reputation in Holocaust researches and contemporary forms of radicalism contributing in its development as well as religious and community leaders.',
        ],
      },
    ],
  },
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations[defaultLocale];
}
