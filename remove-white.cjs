const sharp = require('sharp');

async function processImage() {
    try {
        const image = sharp('public/logo.jpg');
        const { width, height } = await image.metadata();

        // Convert to a raw pixel buffer
        const { data, info } = await image
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Iterate over the pixels and change white to transparent
        // White is roughly R > 240, G > 240, B > 240
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r > 240 && g > 240 && b > 240) {
                // Set alpha to 0 for white pixels
                data[i + 3] = 0;
            }
        }

        // Save the result as a PNG
        await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4,
            },
        }).toFile('public/logo.png');

        console.log('Successfully created logo.png');
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

processImage();
