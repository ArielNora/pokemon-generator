'use client';

import { useState } from 'react';
import PokemonDisplay from './PokemonDisplay';
import { findPokemon } from '@/lib/findPokemon';
import { Pokemon } from '@/types';
import { pokemonTypes } from "./utils/types";

export default function PokemonGenerator() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkedState, setCheckedState] = useState(
    new Array(pokemonTypes.length).fill(false)
  );
  const handleOnChange = (position:number) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);
  }


  const handleGeneratePokemon = async () => {
    try {
      setLoading(true);
      setError(null);
      const newPokemon = await findPokemon(checkedState);
      setPokemon(newPokemon);
    } catch (err) {
      console.error('Error generating pokemon:', err);
      setError('Failed to generate Pokémon. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-8">
      <div className="text-center">
        Choose one or two types !
      </div>
      <div >
        {pokemonTypes.map((name, index) => {
        const line = (index%6)==5;
        const disabled = checkedState.filter((state) =>  state).length>=2;
        return (
          <div className="inline-block w-1/6" key={index}>
            <input 
              key={index}
              type="checkbox" 
              id={`type-${index}`} 
              name={name} 
              value={name} 
              onChange={() => handleOnChange(index)}
              disabled={disabled && !checkedState[index]}/>
            <label htmlFor={`type-${index}`}>{` ${name} `}</label>
            {line && <br />}
          </div>
        );
        })}
      </div>
        
      
      <div className="flex justify-center">
        
          
        <button
          onClick={handleGeneratePokemon}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Pokémon'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {pokemon && <PokemonDisplay pokemon={pokemon} />}
    </div>
  );
}