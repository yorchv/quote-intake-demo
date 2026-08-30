import sharp from 'sharp';

await sharp('public/social-preview.svg').png({ compressionLevel: 9 }).toFile('public/social-preview.png');
await sharp('public/social-square.svg').png({ compressionLevel: 9 }).toFile('public/social-square.png');
await sharp('public/social-story.svg').png({ compressionLevel: 9 }).toFile('public/social-story.png');
await sharp('public/favicon.svg').resize(32, 32).png().toFile('public/favicon-32x32.png');
await sharp('public/favicon.svg').resize(180, 180).png().toFile('public/apple-touch-icon.png');
