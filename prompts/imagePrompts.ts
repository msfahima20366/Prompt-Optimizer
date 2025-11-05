export const IMAGE_STYLES = [
    'Photorealistic',
    'Anime',
    'Fantasy Art',
    'Sci-Fi',
    'Cyberpunk',
    'Steampunk',
    'Watercolor',
    'Pixel Art',
    'Low Poly',
    'Surrealism',
    'Minimalist',
    'Art Deco',
    'Impressionism',
    'Concept Art',
    'Synthwave',
    'Cinematic',
    'Cartoon',
    'Abstract',
    'Graffiti',
    'Oil Painting',
    'Pencil Sketch',
];

export const ARTISTS = [
    'Greg Rutkowski',
    'Artgerm',
    'Alphonse Mucha',
    'Wassily Kandinsky',
    'H.R. Giger',
    'Hayao Miyazaki',
    'Frida Kahlo',
    'Banksy',
    'Vincent van Gogh',
    'Leonardo da Vinci',
    'Salvador Dalí',
];

export const LIGHTING = [
    'Cinematic Lighting',
    'Studio Lighting',
    'Soft Light',
    'Hard Light',
    'Rim Light',
    'Volumetric Lighting',
    'Natural Light',
    'Golden Hour',
    'Blue Hour',
    'Neon',
    'Backlight',
    'Dramatic Lighting',
];

// FIX: Split COMPOSITION into CAMERA_LENSES and CAMERA_ANGLES, and export all three.
export const CAMERA_LENSES = [
    'Wide-Angle',
    'Telephoto',
    'Macro',
    'Fisheye',
    'Tilt-Shift',
];

export const CAMERA_ANGLES = [
    'Eye-Level Shot',
    'Low-Angle Shot',
    'High-Angle Shot',
    'Bird\'s-Eye View',
    'Close-Up',
    'Medium Shot',
    'Long Shot',
];

export const COMPOSITION = [
    ...CAMERA_LENSES,
    ...CAMERA_ANGLES,
];

export const DETAILS = [
    '8K',
    '4K',
    'Highly Detailed',
    'Intricate Details',
    'Hyperrealistic',
    'Sharp Focus',
    'Shallow Depth of Field',
    'Octane Render',
    'Unreal Engine',
    'V-Ray',
    'Trending on ArtStation',
];

export const ADJECTIVES = [
    'Beautiful', 'Gloomy', 'Surreal', 'Epic', 'Vibrant', 'Dark', 'Mysterious', 'Whimsical', 'Serene', 'Chaotic'
];

export const VERBS = [
    'Standing', 'Flying', 'Exploding', 'Glowing', 'Melting', 'Running', 'Sleeping', 'Dancing', 'Dreaming'
];

export const NOUNS = [
    'Castle', 'Forest', 'Spaceship', 'Mountain', 'Ocean', 'City', 'Robot', 'Dragon', 'Wizard', 'Garden'
];
