'use client';

import { useState } from 'react';
import PokemonDisplay from './PokemonDisplay';
import { generatePokemon } from '@/lib/generatePokemon';
import { findPokemon } from '@/lib/findPokemon';
import { Pokemon } from '@/types';

export default function PokemonGenerator() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePokemon = async () => {
    try {
      setLoading(true);
      setError(null);
      const newPokemon = await generatePokemon();
      setPokemon(newPokemon);
    } catch (err) {
      console.error('Error generating pokemon:', err);
      setError('Failed to generate Pokémon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFindPokemon = async () => {
    try {
      setLoading2(true);
      setError(null);
      const newPokemon = await findPokemon();
      console.log(newPokemon);
      setPokemon(newPokemon);
    } catch (err) {
      console.error('Error finding pokemon:', err);
      setError('Failed to find Pokémon. Please try again.');
    } finally {
      setLoading2(false);
    }
  };
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <button
          onClick={handleGeneratePokemon}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Pokémon'}
        </button>
        <button
          onClick={handleFindPokemon}
          disabled={loading2}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading2 ? 'Finding...' : 'Find Pokémon'}
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