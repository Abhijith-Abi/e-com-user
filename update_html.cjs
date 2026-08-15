const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /<meta property="og:image" content="\/og-image\.jpg">/g,
    '<meta property="og:image" content="/og-image.jpg">\n    <meta property="og:image:width" content="1024">\n    <meta property="og:image:height" content="571">'
);

html = html.replace(
    /<link rel="icon" type="image\/jpeg" href="\/favicon\.jpg" \/>/g,
    '<link rel="icon" type="image/jpeg" href="/favicon.jpg" />\n    <link rel="apple-touch-icon" href="/favicon.jpg" />'
);

fs.writeFileSync('index.html', html);
console.log('Updated index.html');
