'use server'

import fs from "node:fs";

import { Pokemon, PokemonStats } from '@/types';
import * as csv from "csv";
import OpenAI from "openai";
import { ResponseInput, Tool } from "openai/resources/responses/responses.mjs";
import { pokemonTypes } from "../components/utils/types";

const openai = new OpenAI({});


export async function findPokemon(): Promise<Pokemon> {
  try {

    return findNewPokemon();
  } catch (error) {
    console.error("Error generating Pokémon:", error);
    throw new Error("Failed to generate Pokémon");
  }
}
export async function findPokemon2(typelist:boolean[]): Promise<Pokemon> {
  try {

    return findNewPokemon2(typelist);
  } catch (error) {
    console.error("Error generating Pokémon:", error);
    throw new Error("Failed to generate Pokémon");
  }
}

// Helper function to generate random stats
function generateRandomStat(min = 30, max = 150): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function findNewPokemon(): Promise<Pokemon> {


  const types = ["Fire"];
  const stats: PokemonStats = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0
  };
  //const p = await getPokemon(types[0]);
  const tools:Array<Tool> = [{
    type: "function",
    name: "get_pokemon",
    description: "Get a list of Pokemons from the accurate pokemon database based on multiple criterias (it is not required to use them all at the same time): type of pokemon or generation",
    parameters: {
        type: "object",
        properties: {
            pokemontype: { 
              type: "string",
              enum:['All','Grass', 'Fire', 'Water', 'Bug', 'Normal', 'Poison', 'Electric', 'Ground',
                 'Fairy', 'Fighting', 'Psychic', 'Rock', 'Ghost', 'Ice', 'Dragon', 'Dark', 'Steel', 'Flying'],
              description : "Type of the pokemon you want to look for"
             },
            generation:{ 
              type: "integer",
              minimum:1,
              maximum:9,
              description : "Game generation of the pokemon you want to look for"
             }
        },
        required: ["pokemontype","generation"],
        additionalProperties: false
    },
    strict: true
  }];

  // Create name
  let prompt = `Generate the name of a new pokemon based on Fire type pokemons from generation 3 and 7,
              then generate a description for the pokemon that will have this name. 
              Add at the end of the output all the names of pokemons you got from the function call.
              The output must be in JSON format, with \"name\" for the name, \"description\" for the description 
              and \"pokemon_names\" for the list of pokemons.`;
  const input:ResponseInput = [
    {
        role: "user",
        content: prompt
      }
  ];

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input:input,
    tools: tools
  });
  for (let resp of response.output){
    if(resp.type=="function_call"){
      console.log("----------- function call -----------");
      const toolCall:any = resp;
      const args = JSON.parse(toolCall.arguments);
      const result = await getPokemon(args.pokemontype, args.generation); 

      input.push(toolCall);
      input.push({
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: result.toString()
      });
    }
  }
  const name = await openai.responses.create({
      model: "gpt-4.1",
      input,
      tools: tools,
      store: true,
  });

  console.log(name.output_text);
  const output = JSON.parse(name.output_text);
  
  // generer image du pokemon
  prompt = "Generate the image of the pokemon with this name,"+output.name+" and description :"+output.description+"\nuse the style and colors from those pokemons :"+output.pokemon_names;
  console.log(prompt);
  
  const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
  });
  console.log(image);
  let imageUrl = "";
  if(image.data && image.data.length>0){
    imageUrl = "data:image/png;base64,"+image.data[0].b64_json;
  }
  
  const pokemon = {name:output.name,types,stats,pokedexEntry:output.description,imageUrl:imageUrl};
  //console.log(pokemons);
  return pokemon;
}

async function findNewPokemon2(typelist:boolean[]): Promise<Pokemon> {


  pokemonTypes;
  const filteredTypes = pokemonTypes.filter((item,index)=>{
    return typelist[index]
  });

  
  const stats: PokemonStats = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0
  };

  //const p = await getPokemon(types[0]);
  const tools:Array<Tool> = [{
    type: "function",
    name: "get_pokemon",
    description: "Get a list of Pokemons from the accurate pokemon database based on multiple criterias (it is not required to use them all at the same time): type of pokemon or generation, can be \"All\" which means all types",
    parameters: {
        type: "object",
        properties: {
            pokemontype: { 
              type: "string",
              enum:['All','Grass', 'Fire', 'Water', 'Bug', 'Normal', 'Poison', 'Electric', 'Ground',
                 'Fairy', 'Fighting', 'Psychic', 'Rock', 'Ghost', 'Ice', 'Dragon', 'Dark', 'Steel', 'Flying'],
              description : "Type of the pokemon you want to look for"
             },
            generation:{ 
              type: "string",
              enum:['All','1','2','3','4','5','6','7','8','9'],
              description : "Game generation of the pokemon you want to look for,from generation 1 to 9, can be \"All\" which means all generations"
             }
        },
        required: ["pokemontype","generation"],
        additionalProperties: false
    },
    strict: true
  }];

  // Create name
  const secondType = filteredTypes.length===2 ? `and ${filteredTypes[1]} type pokemons` : ``;

  let prompt = `Generate the name of a new pokemon based on ${filteredTypes[0]} type pokemons ${secondType} from all generations,
              then generate a description for the pokemon that will have this name. 
              Add at the end of the output all the names of pokemons you got from the function call.
              The output must be in JSON format, with \"name\" for the name, \"description\" for the description 
              and \"pokemon_names\" for the list of pokemons.`;

  
  const input:ResponseInput = [
    {
        role: "user",
        content: prompt
      }
  ];

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input:input,
    tools: tools
  });
  for (let resp of response.output){
    if(resp.type=="function_call"){
      const toolCall:any = resp;
      const args = JSON.parse(toolCall.arguments);
      const result = await getPokemon(args.pokemontype, args.generation); 

      input.push(toolCall);
      input.push({
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: result.toString()
      });
    }
  }
  const name = await openai.responses.create({
      model: "gpt-4.1",
      input,
      tools: tools,
      store: true,
  });

  const output = JSON.parse(name.output_text);
  
  // generer image du pokemon
  prompt = "Generate the image of the pokemon with this name,"+output.name+" and description :"+output.description+"\nuse the style and colors from those pokemons :"+output.pokemon_names+"\nThe image should only have the pokemon, nothing else";
  
  const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
  });
  
  let imageUrl = "";
  if(image.data && image.data.length>0){
    imageUrl = "data:image/png;base64,"+image.data[0].b64_json;
  }
  
  const pokemon = {name:output.name,types:filteredTypes,stats,pokedexEntry:output.description,imageUrl:imageUrl};
  //console.log(pokemons);
  return pokemon;
}


async function getPokemon(type:string="Fire",generation:string): Promise<string[]>{
    //type needs an uppercase

    
      return new Promise(resolve=>{
          const results:string[] = [];
          const parser = csv.parse({ delimiter: "," }, function (err, data) {
              if (type === undefined && generation === undefined) {
                // rien
                resolve([])
              } else if (type === undefined || type === 'All') {
                //cherche generation
                resolve(data.filter((d:string[])=>d[12]==generation));
              } else if (generation === undefined ||generation === 'All') {
                //cherche type
                resolve(data.filter((d:string[])=>d[3]==type||d[4]==type));
              } else {
                //cherche type et generation
                resolve(data.filter((d:string[])=>(d[3]==type||d[4]==type)&&d[12]==generation));
              }
          });
          //parser.on("end", function () {resolve(results)});
          fs.createReadStream("./pokemon.csv").pipe(parser);
      });

}

/*
Fonction getPokemon
deux paramètres possibles, peut faire l'un, l'autre ou les deux
None par défaut
dans la fonction :
si None sur type > recherche generation
si None sur generation > recherche type
sinon > recherche sur les deux
renvoie une liste des noms des pokemon trouvés
*/


async function getWeather(latitude:string, longitude:string) {
    console.log('TOOl was called');  
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
    
    const data = await response.json();
    return data.current.temperature_2m;
}






