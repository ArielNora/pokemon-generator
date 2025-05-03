export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Pokemon {
  name: string;
  types: string[];
  stats: PokemonStats;
  pokedexEntry: string;
  imageUrl: string;
}