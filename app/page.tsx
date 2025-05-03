import PokemonGenerator from '@/components/PokemonGenerator';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">Pokémon Generator</h1>
        <p className="text-gray-600 text-center mb-8">Generate your own unique Pokémon using AI!</p>
        <PokemonGenerator />
      </div>
    </main>
  );
}