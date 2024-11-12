type Option = Record<string, number | string> | string[] | string;

export interface Template {
    id: number;
    game: string;
    options: { [key: string]: Option };
}

export interface GameConfig {
  id: number;
  game: string;
  weight: number;
  state: 'alpha'|'beta'|'stable'
}
