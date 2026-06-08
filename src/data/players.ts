import playerData from '../assets/players/playerData.json';

export type AbilityScores = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

export type Player = {
  name: string;
  race: string;
  class: string;
  subclass: string;
  level: number;
  portrait: string;
  abilityScores: AbilityScores;
  characterInfo: string;
  slug: string;
  portraitSrc: string;
};

const portraitFiles = import.meta.glob('../assets/players/images/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const players: Player[] = playerData.map((player) => ({
  ...player,
  slug: slugify(player.name),
  portraitSrc: portraitFiles[`../assets/players/images/${player.portrait}`],
}));

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
