/**
 * Country Configuration for BiasMapper
 * 
 * Defines available countries/regions for secondary analysis
 * with their news outlets and regional characteristics.
 */

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  outlets: string[];
  description: string;
  language: string;
  region: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "pk",
    name: "Pakistan",
    flag: "🇵🇰",
    outlets: ["Dawn", "Geo News", "ARY News", "Express News", "Samaa", "Dunya News", "Hum News", "Pakistan Today"],
    description: "South Asian media landscape with diverse political perspectives",
    language: "ur,en",
    region: "South Asia"
  },
  {
    code: "us",
    name: "United States",
    flag: "🇺🇸",
    outlets: ["CNN", "Fox News", "MSNBC", "The New York Times", "Washington Post", "Wall Street Journal", "USA Today"],
    description: "American media with strong partisan divide between left and right",
    language: "en",
    region: "North America"
  },
  {
    code: "uk",
    name: "United Kingdom",
    flag: "🇬🇧",
    outlets: ["BBC", "The Guardian", "The Times", "Daily Mail", "The Telegraph", "The Independent", "Sky News"],
    description: "British media with established broadcast and print traditions",
    language: "en",
    region: "Europe"
  },
  {
    code: "in",
    name: "India",
    flag: "🇮🇳",
    outlets: ["Times of India", "NDTV", "The Hindu", "India Today", "Republic TV", "Aaj Tak", "Dainik Bhaskar"],
    description: "World's largest democracy with multilingual media ecosystem",
    language: "hi,en",
    region: "South Asia"
  },
  {
    code: "cn",
    name: "China",
    flag: "🇨🇳",
    outlets: ["Xinhua", "Global Times", "China Daily", "CCTV", "South China Morning Post"],
    description: "State-influenced media with controlled narrative framing",
    language: "zh,en",
    region: "East Asia"
  },
  {
    code: "ru",
    name: "Russia",
    flag: "🇷🇺",
    outlets: ["RT (Russia Today)", "TASS", "Sputnik", "Kommersant", "RBC"],
    description: "State-aligned media with strategic geopolitical messaging",
    language: "ru,en",
    region: "Eastern Europe"
  },
  {
    code: "de",
    name: "Germany",
    flag: "🇩🇪",
    outlets: ["Der Spiegel", "Deutsche Welle", "Frankfurter Allgemeine", "Bild", "Die Welt", "Süddeutsche Zeitung"],
    description: "European media with strong public broadcasting tradition",
    language: "de,en",
    region: "Europe"
  },
  {
    code: "fr",
    name: "France",
    flag: "🇫🇷",
    outlets: ["Le Monde", "Le Figaro", "France 24", "BFM TV", "Libération", "Les Echos"],
    description: "French media with intellectual and political diversity",
    language: "fr,en",
    region: "Europe"
  },
  {
    code: "ae",
    name: "UAE / Gulf",
    flag: "🇦🇪",
    outlets: ["Al Jazeera", "Gulf News", "Khaleej Times", "The National", "Arab News", "Al Arabiya"],
    description: "Middle Eastern media with regional geopolitical focus",
    language: "ar,en",
    region: "Middle East"
  },
  {
    code: "ir",
    name: "Iran",
    flag: "🇮🇷",
    outlets: ["Press TV", "IRNA", "Tasnim News", "Fars News", "Mehr News"],
    description: "State-controlled media with ideological messaging",
    language: "fa,en",
    region: "Middle East"
  },
  {
    code: "il",
    name: "Israel",
    flag: "🇮🇱",
    outlets: ["Haaretz", "The Jerusalem Post", "Times of Israel", "Ynet", "Israel Hayom"],
    description: "Israeli media with diverse political perspectives",
    language: "he,en",
    region: "Middle East"
  },
  {
    code: "br",
    name: "Brazil",
    flag: "🇧🇷",
    outlets: ["O Globo", "Folha de S.Paulo", "Estadão", "Veja", "Band", "Record TV"],
    description: "South American media with political polarization",
    language: "pt",
    region: "South America"
  },
  {
    code: "mx",
    name: "Mexico",
    flag: "🇲🇽",
    outlets: ["El Universal", "Reforma", "Milenio", "Televisa", "Excélsior", "La Jornada"],
    description: "Mexican media with focus on domestic politics and crime",
    language: "es",
    region: "North America"
  },
  {
    code: "jp",
    name: "Japan",
    flag: "🇯🇵",
    outlets: ["NHK", "The Yomiuri Shimbun", "The Asahi Shimbun", "Nikkei", "Mainichi Shimbun"],
    description: "Japanese media with established press clubs and traditions",
    language: "ja,en",
    region: "East Asia"
  },
  {
    code: "kr",
    name: "South Korea",
    flag: "🇰🇷",
    outlets: ["KBS", "Yonhap", "Chosun Ilbo", "JoongAng Daily", "Dong-a Ilbo", "Korean Herald"],
    description: "Korean media with focus on North Korea relations and technology",
    language: "ko,en",
    region: "East Asia"
  },
  {
    code: "au",
    name: "Australia",
    flag: "🇦🇺",
    outlets: ["ABC News", "The Sydney Morning Herald", "The Age", "News.com.au", "The Australian", "Sky News Australia"],
    description: "Australian media with concentrated ownership",
    language: "en",
    region: "Oceania"
  },
  {
    code: "ca",
    name: "Canada",
    flag: "🇨🇦",
    outlets: ["CBC", "The Globe and Mail", "Toronto Star", "National Post", "CTV News", "Global News"],
    description: "Canadian media with bilingual English-French landscape",
    language: "en,fr",
    region: "North America"
  },
  {
    code: "tr",
    name: "Turkey",
    flag: "🇹🇷",
    outlets: ["TRT World", "Anadolu Agency", "Hurriyet", "Sabah", "Cumhuriyet", "Milliyet"],
    description: "Turkish media with varying degrees of state influence",
    language: "tr,en",
    region: "Middle East/Europe"
  },
  {
    code: "eg",
    name: "Egypt",
    flag: "🇪🇬",
    outlets: ["Al Ahram", "Egypt Today", "Daily News Egypt", "Youm7", "Al-Masry Al-Youm"],
    description: "Egyptian media with state-influenced narratives",
    language: "ar,en",
    region: "North Africa"
  },
  {
    code: "za",
    name: "South Africa",
    flag: "🇿🇦",
    outlets: ["News24", "SABC", "Mail & Guardian", "TimesLIVE", "EWN", "Daily Maverick"],
    description: "African media with post-apartheid transformation focus",
    language: "en,zu",
    region: "Africa"
  },
  {
    code: "ng",
    name: "Nigeria",
    flag: "🇳🇬",
    outlets: ["Vanguard", "Punch", "The Nation", "Daily Trust", "Premium Times", "Channels TV"],
    description: "West African media with diverse ethnic and regional perspectives",
    language: "en",
    region: "Africa"
  },
  {
    code: "id",
    name: "Indonesia",
    flag: "🇮🇩",
    outlets: ["Kompas", "Detik", "Antara", "The Jakarta Post", "CNN Indonesia", "Tempo"],
    description: "Southeast Asian media with largest Muslim population",
    language: "id,en",
    region: "Southeast Asia"
  },
  {
    code: "it",
    name: "Italy",
    flag: "🇮🇹",
    outlets: ["RAI", "Corriere della Sera", "La Repubblica", "La Stampa", "Il Sole 24 Ore", "ANSA"],
    description: "Italian media with political fragmentation and broadcast dominance",
    language: "it,en",
    region: "Europe"
  },
  {
    code: "es",
    name: "Spain",
    flag: "🇪🇸",
    outlets: ["El País", "El Mundo", "ABC", "La Vanguardia", "RTVE", "El Confidencial"],
    description: "Spanish media with regional language diversity",
    language: "es,ca",
    region: "Europe"
  },
];

// International outlets (always shown)
export const INTERNATIONAL_OUTLETS = [
  "CNN",
  "BBC",
  "Reuters",
  "The Guardian",
  "Al Jazeera",
  "Fox News",
  "MSNBC",
  "Breitbart",
  "The New York Times",
  "Washington Post",
];

// Get outlets by country code
export function getOutletsByCountry(countryCode: string): string[] {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.outlets || [];
}

// Get country by code
export function getCountryByCode(code: string): CountryConfig | undefined {
  return COUNTRIES.find(c => c.code === code);
}

// Default country options for dropdown
export const COUNTRY_SELECT_OPTIONS = COUNTRIES.map(c => ({
  value: c.code,
  label: `${c.flag} ${c.name}`,
  region: c.region,
}));

// Countries grouped by region
export const COUNTRIES_BY_REGION = COUNTRIES.reduce((acc, country) => {
  if (!acc[country.region]) {
    acc[country.region] = [];
  }
  acc[country.region].push(country);
  return acc;
}, {} as Record<string, CountryConfig[]>);
