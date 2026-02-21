// Misinformation engine - generates consistent fake data
const POKEMON_TYPES = [
  'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison',
  'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon',
  'Dark', 'Steel', 'Fairy', 'Normal'
];

const LOCATIONS = [
  'Misty Caverns', 'Thunderpeak Mountain', 'Coral Reef Shores',
  'Whispering Forest', 'Crystal Lake', 'Volcanic Ridge',
  'Moonlit Meadow', 'Shadow Valley', 'Starfall Plateau',
  'Emerald Jungle', 'Frozen Tundra', 'Desert Oasis',
  'Haunted Ruins', 'Sky Pillar', 'Deep Ocean Trench'
];

const HABITATS = [
  'Underground caves', 'Dense forests', 'Open grasslands',
  'Mountain peaks', 'Freshwater lakes', 'Coastal regions',
  'Volcanic areas', 'Frozen wastelands', 'Urban areas',
  'Swamplands', 'Desert dunes', 'Coral reefs'
];

const SIZES = [
  'Tiny (< 0.3m)', 'Small (0.3-0.6m)', 'Medium (0.6-1.2m)',
  'Large (1.2-2.0m)', 'Very Large (2.0-3.5m)', 'Gigantic (> 3.5m)'
];

// Deterministic hash for consistent fake data per user+post combo
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getRandomFromArray<T>(arr: T[], hash: number, offset: number = 0): T {
  return arr[(hash + offset) % arr.length];
}

export function generateFakeData(userId: string, postId: string, realData: {
  pokemon_type: string;
  sighting_location: string;
  habitat?: string | null;
  pokemon_size?: string | null;
}) {
  const hash = simpleHash(userId + postId);

  // Make sure fake data is different from real data
  let fakeType = getRandomFromArray(POKEMON_TYPES, hash, 1);
  if (fakeType === realData.pokemon_type) {
    fakeType = getRandomFromArray(POKEMON_TYPES, hash, 3);
  }

  let fakeLocation = getRandomFromArray(LOCATIONS, hash, 2);
  if (fakeLocation === realData.sighting_location) {
    fakeLocation = getRandomFromArray(LOCATIONS, hash, 5);
  }

  let fakeHabitat = getRandomFromArray(HABITATS, hash, 4);
  if (fakeHabitat === realData.habitat) {
    fakeHabitat = getRandomFromArray(HABITATS, hash, 7);
  }

  let fakeSize = getRandomFromArray(SIZES, hash, 3);
  if (fakeSize === realData.pokemon_size) {
    fakeSize = getRandomFromArray(SIZES, hash, 6);
  }

  return {
    fake_pokemon_type: fakeType,
    fake_sighting_location: fakeLocation,
    fake_habitat: fakeHabitat,
    fake_pokemon_size: fakeSize,
  };
}
