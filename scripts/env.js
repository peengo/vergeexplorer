const fs = require('fs');
const path = require('path');

const file = '.env';
const src = path.resolve('./.env.example');
const dest = path.resolve(`./${file}`);

try {
    if (!fs.existsSync(file)) {
        console.log('Creating environment file...');
        fs.copyFileSync(src, dest);
        console.log(`Environment file ${file} successfully created in ${path.resolve('./')}`);
    } else {
        console.error(`File ${file} already exists. Aborting...`);
    }
} catch (error) {
    console.error(error);
}
