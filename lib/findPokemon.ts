'use server'

import fs from "node:fs";

import { Pokemon, PokemonStats } from '@/types';
import * as csv from "csv";
import OpenAI from "openai";
import { ResponseInput, Tool } from "openai/resources/responses/responses.mjs";
import { pokemonTypes } from "../components/utils/types";

const openai = new OpenAI({});


export async function findPokemon(typelist:boolean[]): Promise<Pokemon> {
  try {

    return findNewPokemon(typelist);
  } catch (error) {
    console.error("Error generating Pokémon:", error);
    throw new Error("Failed to generate Pokémon");
  }
}

async function findNewPokemon(typelist:boolean[]): Promise<Pokemon> {

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
  for (const resp of response.output){
    if(resp.type=="function_call"){
      const toolCall:any = resp; //eslint-disable-line
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
  return pokemon;
}


async function getPokemon(type:string="Fire",generation:string): Promise<string[]>{
      return new Promise(resolve=>{
          const parser = csv.parse({ delimiter: "," }, function (err, data) {
              if (type === undefined && generation === undefined) {
                resolve([])
              } else if (type === undefined || type === 'All') {
                resolve(data.filter((d:string[])=>d[12]==generation));
              } else if (generation === undefined ||generation === 'All') {
                resolve(data.filter((d:string[])=>d[3]==type||d[4]==type));
              } else {
                resolve(data.filter((d:string[])=>(d[3]==type||d[4]==type)&&d[12]==generation));
              }
          });
          fs.createReadStream("./pokemon.csv").pipe(parser);
      });

}





