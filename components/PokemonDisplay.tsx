import { Pokemon } from '@/types';
import Image from 'next/image';

export default function PokemonDisplay({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div className="bg-gray-100 rounded-xl p-6 shadow-inner">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col items-center">
          <div className="bg-white rounded-full p-4 shadow-md mb-4">
            <div className="w-64 h-64 relative overflow-hidden">
              {pokemon.imageUrl ? (
                <Image
                  src={pokemon.imageUrl}
                  alt={pokemon.name}
                  fill
                  className="object-contain rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full ">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">{pokemon.name}</h2>

          <div className="flex gap-2 mb-4">
            {pokemon.types.map((type, index) => (
              <span
                key={index}
                className={`type-${type.toLowerCase()} text-white px-3 py-1 rounded-full text-sm font-medium`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Pokédex Entry</h3>
            <p className="bg-white p-4 rounded-lg shadow-sm text-gray-700 italic">
              {pokemon.pokedexEntry}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}