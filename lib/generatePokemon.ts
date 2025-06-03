'use server'


import { Pokemon, PokemonStats } from '@/types';

import OpenAI from "openai";
const openai = new OpenAI({});


export async function generatePokemon(): Promise<Pokemon> {
  try {

    return generateNewPokemon();
  } catch (error) {
    console.error("Error generating Pokémon:", error);
    throw new Error("Failed to generate Pokémon");
  }
}

// Helper function to generate random stats
function generateRandomStat(min = 30, max = 150): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function generateNewPokemon(): Promise<Pokemon> {

  const allTypes = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
    'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

  // Generate random types (1 or 2)
  const typeCount = Math.random() > 0.5 ? 2 : 1;
  const shuffledTypes = [...allTypes].sort(() => 0.5 - Math.random());
  const types = shuffledTypes.slice(0, typeCount);

  // Random stats
  const stats: PokemonStats = {
    hp: generateRandomStat(50, 150),
    attack: generateRandomStat(),
    defense: generateRandomStat(),
    specialAttack: generateRandomStat(),
    specialDefense: generateRandomStat(),
    speed: generateRandomStat()
  };

  const input = "";

  if (typeCount == 2){
    var prompt = "Write a name for a Pokemon with two types: "+types[0]+" and "+types[1]+
    ", please only respond with the name";
  }
  else {
    var prompt = "Write a name for a Pokemon with one type: "+types[0]+
    ", please only respond with the name";
  }

  // Create name
  const name = await openai.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  if (typeCount == 2){
    var prompt = "Write a description for a Pokemon named "+name.output_text +" with two types: "+types[0]+
    " and "+types[1]+", please only respond with the description";
  }
  else {
    var prompt = "Write a description for a Pokemon named "+name.output_text +" with one type: "+types[0]+
    ", please only respond with the description";
  }

  // Create description
  const desc = await openai.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });
  

  if (typeCount == 2){
    var prompt = "Generate a Pokemon named "+name.output_text +" with two types: "+types[0]+
    " and "+types[1]+", with this description: "+desc.output_text
    +". only the pokemon should be on the image, no types or description or name, with a white background and no shadows on the floor";
  }
  else {
    var prompt = "Generate a Pokemon named "+name.output_text +" with one type: "+types[0]+
    ", based on this description: "+desc.output_text
    +". only the pokemon should be on the image, no types or description or name, with a white background and no shadows on the floor";
  }

  
  const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
  });

  const imageUrl = "data:image/png;base64,"+result.data[0].b64_json;

  return {
    name: name.output_text,
    types,
    stats,
    pokedexEntry: desc.output_text,
    imageUrl
  };
}


