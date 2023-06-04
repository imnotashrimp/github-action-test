const fs = require('fs');
const ignore = require('ignore');

const fileContents = fs.readFileSync('./.auto-approve', 'utf8');
const ig = ignore().add(fileContents);

fs.writeFileSync('./auto-approve.json', JSON.stringify(ig));
