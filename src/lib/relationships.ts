export interface CountryRelation {
  friends: string[];
  foes: string[];
}

export const COUNTRY_RELATIONSHIPS: Record<string, CountryRelation> = {
  us: { friends: ['gb', 'ca', 'au', 'jp'], foes: ['ru', 'cn', 'ir'] },
  cn: { friends: ['ru', 'pk', 'kp'], foes: ['us', 'jp', 'in'] },
  ru: { friends: ['cn', 'ir'], foes: ['us', 'gb'] },
  gb: { friends: ['us', 'au', 'ca'], foes: [] },
  in: { friends: ['ru'], foes: ['cn', 'pk'] },
  pk: { friends: ['cn'], foes: ['in'] },
  jp: { friends: ['us'], foes: ['cn', 'ru'] },
  au: { friends: ['us', 'gb'], foes: [] },
  ca: { friends: ['us', 'gb'], foes: [] },
  de: { friends: ['fr', 'it'], foes: [] },
  fr: { friends: ['de'], foes: [] },
  ir: { friends: ['ru', 'cn'], foes: ['us', 'il'] },
  il: { friends: ['us'], foes: ['ir'] },
};

export function getCountryRelation(code: string): CountryRelation | undefined {
  return COUNTRY_RELATIONSHIPS[code];
}

export function isFriend(source: string, target: string): boolean {
  const rel = COUNTRY_RELATIONSHIPS[source];
  return rel?.friends.includes(target) ?? false;
}

export function isFoe(source: string, target: string): boolean {
  const rel = COUNTRY_RELATIONSHIPS[source];
  return rel?.foes.includes(target) ?? false;
}