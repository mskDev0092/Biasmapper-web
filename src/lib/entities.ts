export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  country?: string;
  region?: string;
  affiliation?: string;
  ideology?: string;
  description?: string;
}

export type EntityType = 
  | 'country' 
  | 'organization' 
  | 'bureaucracy' 
  | 'political_party'
  | 'politician'
  | 'scientist'
  | 'philosopher'
  | 'religious'
  | 'academic'
  | 'media'
  | 'other';

export const ENTITIES: Entity[] = [
  // Countries
  { id: 'us', name: 'United States', type: 'country', region: 'North America', ideology: 'varied' },
  { id: 'cn', name: 'China', type: 'country', region: 'East Asia', ideology: 'communist' },
  { id: 'ru', name: 'Russia', type: 'country', region: 'Eastern Europe', ideology: 'hybrid' },
  { id: 'gb', name: 'United Kingdom', type: 'country', region: 'Europe', ideology: 'democracy' },
  { id: 'in', name: 'India', type: 'country', region: 'South Asia', ideology: 'democracy' },
  { id: 'pk', name: 'Pakistan', type: 'country', region: 'South Asia', ideology: 'democracy' },
  { id: 'jp', name: 'Japan', type: 'country', region: 'East Asia', ideology: 'democracy' },
  { id: 'de', name: 'Germany', type: 'country', region: 'Europe', ideology: 'democracy' },
  { id: 'fr', name: 'France', type: 'country', region: 'Europe', ideology: 'democracy' },
  { id: 'il', name: 'Israel', type: 'country', region: 'Middle East', ideology: 'democracy' },
  { id: 'ir', name: 'Iran', type: 'country', region: 'Middle East', ideology: 'theocracy' },
  { id: 'sa', name: 'Saudi Arabia', type: 'country', region: 'Middle East', ideology: 'monarchy' },
  { id: 'ua', name: 'Ukraine', type: 'country', region: 'Eastern Europe', ideology: 'democracy' },
  { id: 'br', name: 'Brazil', type: 'country', region: 'South America', ideology: 'democracy' },
  { id: 'au', name: 'Australia', type: 'country', region: 'Oceania', ideology: 'democracy' },

  // International Organizations
  { id: 'org_un', name: 'United Nations', type: 'organization', country: 'international', description: 'Intergovernmental org' },
  { id: 'org_nato', name: 'NATO', type: 'organization', country: 'international', description: 'Military alliance' },
  { id: 'org_eu', name: 'European Union', type: 'organization', country: 'international', description: 'Political union' },
  { id: 'org_who', name: 'WHO', type: 'organization', country: 'international', description: 'Health agency' },
  { id: 'org_wto', name: 'WTO', type: 'organization', country: 'international', description: 'Trade organization' },
  { id: 'org_oecd', name: 'OECD', type: 'organization', country: 'international', description: 'Economic cooperation' },
  { id: 'org_g7', name: 'G7', type: 'organization', country: 'international', description: 'Major economies' },
  { id: 'org_brics', name: 'BRICS', type: 'organization', country: 'international', description: 'Emerging economies' },
  { id: 'org_opec', name: 'OPEC', type: 'organization', country: 'international', description: 'Oil producers' },
  { id: 'org_unhcr', name: 'UNHCR', type: 'organization', country: 'international', description: 'Refugee agency' },
  { id: 'org_red_cross', name: 'Red Cross/Crescent', type: 'organization', country: 'international', description: 'Humanitarian' },
  { id: 'org_amnesty', name: 'Amnesty International', type: 'organization', country: 'international', description: 'Human rights' },
  { id: 'org_hrw', name: 'Human Rights Watch', type: 'organization', country: 'international', description: 'Human rights' },
  { id: 'org_greenpeace', name: 'Greenpeace', type: 'organization', country: 'international', description: 'Environmental' },
  { id: 'org_transparency', name: 'Transparency International', type: 'organization', country: 'international', description: 'Anti-corruption' },

  // Think Tanks / Policy Institutes
  { id: 'policy_cfr', name: 'Council on Foreign Relations', type: 'organization', country: 'us', description: 'Foreign policy' },
  { id: 'policy_brookings', name: 'Brookings Institution', type: 'organization', country: 'us', description: 'Policy think tank' },
  { id: 'policy_carnegie', name: 'Carnegie Endowment', type: 'organization', country: 'us', description: 'Peace foundation' },
  { id: 'policy_heritage', name: 'Heritage Foundation', type: 'organization', country: 'us', description: 'Conservative think tank' },
  { id: 'policy_cato', name: 'Cato Institute', type: 'organization', country: 'us', description: 'Libertarian think tank' },
  { id: 'policy_chatham', name: 'Chatham House', type: 'organization', country: 'gb', description: 'International affairs' },
  { id: 'policy_fert', name: 'FRIDE', type: 'organization', country: 'eu', description: 'European think tank' },

  // Media Outlets
  { id: 'media_cnn', name: 'CNN', type: 'media', country: 'us', description: 'News network' },
  { id: 'media_fox', name: 'Fox News', type: 'media', country: 'us', description: 'News network' },
  { id: 'media_nyt', name: 'New York Times', type: 'media', country: 'us', description: 'Newspaper' },
  { id: 'media_wapo', name: 'Washington Post', type: 'media', country: 'us', description: 'Newspaper' },
  { id: 'media_bbc', name: 'BBC', type: 'media', country: 'gb', description: 'Public broadcaster' },
  { id: 'media_guardian', name: 'The Guardian', type: 'media', country: 'gb', description: 'Newspaper' },
  { id: 'media_rt', name: 'RT', type: 'media', country: 'ru', description: 'State media' },
  { id: 'media_xinhua', name: 'Xinhua', type: 'media', country: 'cn', description: 'State media' },
  { id: 'media_aljaz', name: 'Al Jazeera', type: 'media', country: 'qa', description: 'News network' },

  // Political Parties
  { id: 'party_dem_us', name: 'Democratic Party (US)', type: 'political_party', country: 'us', ideology: 'progressive' },
  { id: 'party_gop_us', name: 'Republican Party (US)', type: 'political_party', country: 'us', ideology: 'conservative' },
  { id: 'party_labour_gb', name: 'Labour Party (UK)', type: 'political_party', country: 'gb', ideology: 'left' },
  { id: 'party_tories_gb', name: 'Conservative Party (UK)', type: 'political_party', country: 'gb', ideology: 'right' },
  { id: 'party_cdu', name: 'CDU (Germany)', type: 'political_party', country: 'de', ideology: 'center-right' },
  { id: 'party_spd', name: 'SPD (Germany)', type: 'political_party', country: 'de', ideology: 'center-left' },
  { id: 'party_bjp', name: 'BJP (India)', type: 'political_party', country: 'in', ideology: 'right' },
  { id: 'party_cong', name: 'Congress Party (India)', type: 'political_party', country: 'in', ideology: 'center-left' },
  { id: 'party_pti', name: 'PTI (Pakistan)', type: 'political_party', country: 'pk', ideology: 'conservative' },
  { id: 'party_ppp', name: 'PPP (Pakistan)', type: 'political_party', country: 'pk', ideology: 'center-left' },

  // Politicians
  { id: 'pol_trump', name: 'Donald Trump', type: 'politician', country: 'us', affiliation: 'Republican' },
  { id: 'pol_biden', name: 'Joe Biden', type: 'politician', country: 'us', affiliation: 'Democratic' },
  { id: 'pol_putin', name: 'Vladimir Putin', type: 'politician', country: 'ru' },
  { id: 'pol_xi', name: 'Xi Jinping', type: 'politician', country: 'cn' },
  { id: 'pol_modi', name: 'Narendra Modi', type: 'politician', country: 'in', affiliation: 'BJP' },
  { id: 'pol_khan_pti', name: 'Imran Khan', type: 'politician', country: 'pk', affiliation: 'PTI' },
  { id: 'pol_macron', name: 'Emmanuel Macron', type: 'politician', country: 'fr' },
  { id: 'pol_scholz', name: 'Olaf Scholz', type: 'politician', country: 'de' },
  { id: 'pol_sunak', name: 'Rishi Sunak', type: 'politician', country: 'gb' },
  { id: 'pol_trudeau', name: 'Justin Trudeau', type: 'politician', country: 'ca' },
  { id: 'pol_bibi', name: 'Benjamin Netanyahu', type: 'politician', country: 'il' },

  // Scientists
  { id: 'sci_tyson', name: 'Neil deGrasse Tyson', type: 'scientist', country: 'us', description: 'Astrophysicist' },
  { id: 'sci_hawking', name: 'Stephen Hawking', type: 'scientist', country: 'gb', description: 'Physicist' },
  { id: 'sci_tyson_a', name: 'Carl Sagan', type: 'scientist', country: 'us', description: 'Astronomer' },
  { id: 'sci_gates', name: 'Bill Gates', type: 'scientist', country: 'us', description: 'Tech/Philanthropy' },
  { id: 'sci_atwood', name: 'Margaret Atwood', type: 'scientist', country: 'ca', description: 'Climate activist' },
  { id: 'sci_lovelock', name: 'James Lovelock', type: 'scientist', country: 'gb', description: 'Climate scientist' },
  { id: 'sci_gore', name: 'Al Gore', type: 'scientist', country: 'us', description: 'Climate activist' },

  // Philosophers / Intellectuals
  { id: 'phil_harris', name: 'Sam Harris', type: 'philosopher', country: 'us', description: 'Public intellectual' },
  { id: 'phil_peterson', name: 'Jordan Peterson', type: 'philosopher', country: 'ca', description: 'Psychologist' },
  { id: 'phil_noam', name: 'Noam Chomsky', type: 'philosopher', country: 'us', description: 'Linguist/Activist' },
  { id: 'phil_gray', name: 'John Gray', type: 'philosopher', country: 'gb', description: 'Philosopher' },
  { id: 'phil_taibbi', name: 'Matt Taibbi', type: 'philosopher', country: 'us', description: 'Journalist' },
  { id: 'phil_glen', name: 'James Glen', type: 'philosopher', country: 'us', description: 'Tech critic' },

  // Religious Figures
  { id: 'rel_pope', name: 'Pope Francis', type: 'religious', country: 'va', description: 'Catholic leader' },
  { id: 'rel_dalai', name: 'Dalai Lama', type: 'religious', country: 'cn', description: 'Buddhist leader' },
  { id: 'rel_erdo', name: 'Patriarch Bartholomew', type: 'religious', country: 'gr', description: 'Orthodox leader' },
  { id: 'rel_gafb', name: 'Grand Imam Al-Azhar', type: 'religious', country: 'eg', description: 'Sunni leader' },
  { id: 'rel_rashid', name: 'Sheikh Ahmed Toufiq', type: 'religious', country: 'ma', description: 'Religious scholar' },

  // Academics
  { id: 'acad_yuan', name: 'Jeffrey Sachs', type: 'academic', country: 'us', description: 'Economist' },
  { id: 'acad_stiglitz', name: 'Joseph Stiglitz', type: 'academic', country: 'us', description: 'Economist' },
  { id: 'acad_branko', name: 'Branko Milanovic', type: 'academic', country: 'rs', description: 'Economist' },
  { id: 'acad_fukuyama', name: 'Francis Fukuyama', type: 'academic', country: 'us', description: 'Political scientist' },
  { id: 'acad_mearsheimer', name: 'John Mearsheimer', type: 'academic', country: 'us', description: 'Political scientist' },
  { id: 'acad_walt', name: 'Stephen Walt', type: 'academic', country: 'us', description: 'International relations' },
  { id: 'acad_moon', name: 'John Moon', type: 'academic', country: 'kr', description: 'Foreign minister' },

  // Bureaucracies / Departments
  { id: 'bur_state', name: 'US State Department', type: 'bureaucracy', country: 'us' },
  { id: 'bur_pentagon', name: 'Pentagon', type: 'bureaucracy', country: 'us' },
  { id: 'bur_cia', name: 'CIA', type: 'bureaucracy', country: 'us' },
  { id: 'bur_fbi', name: 'FBI', type: 'bureaucracy', country: 'us' },
  { id: 'bur_nsc', name: 'National Security Council', type: 'bureaucracy', country: 'us' },
  { id: 'bur_eu_comm', name: 'European Commission', type: 'bureaucracy', country: 'eu' },
  { id: 'bur_un_dpko', name: 'UN Peacekeeping', type: 'bureaucracy', country: 'international' },
  { id: 'bur_nato_mil', name: 'NATO Military', type: 'bureaucracy', country: 'international' },
];

export function getEntitiesByType(type: EntityType): Entity[] {
  return ENTITIES.filter(e => e.type === type);
}

export function getEntitiesByCountry(countryCode: string): Entity[] {
  return ENTITIES.filter(e => e.country === countryCode);
}

export function searchEntities(query: string, limit = 20): Entity[] {
  const q = query.toLowerCase();
  return ENTITIES.filter(e => 
    e.name.toLowerCase().includes(q) || 
    e.id.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function getEntityById(id: string): Entity | undefined {
  return ENTITIES.find(e => e.id === id);
}

export const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: 'country', label: 'Countries' },
  { value: 'organization', label: 'Organizations & NGOs' },
  { value: 'political_party', label: 'Political Parties' },
  { value: 'politician', label: 'Politicians' },
  { value: 'scientist', label: 'Scientists & Researchers' },
  { value: 'philosopher', label: 'Philosophers & Intellectuals' },
  { value: 'religious', label: 'Religious Leaders' },
  { value: 'academic', label: 'Academics' },
  { value: 'media', label: 'Media Outlets' },
  { value: 'bureaucracy', label: 'Bureaucracies & Agencies' },
  { value: 'other', label: 'Other Entities' },
];