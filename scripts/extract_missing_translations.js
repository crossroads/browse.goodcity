require('babel-core/register')();

const fs          = require('fs');
const { join }    = require('path');

const output	  = join(__dirname, 'missing_translations.csv');
const input	    = join(__dirname, '../app/locales/zh/translations.js');
const localeZH	= require(input);

function search(obj, rows = [], prefix = '') {
  for (let key in obj) {
    let val   = obj[key];
    let path	= prefix ? `${prefix}.${key}` : key;

    if (typeof val === 'string') {
      const isTranslated = !!val.match(/[\u3400-\u9FBF]/);
      if (!isTranslated) {
        rows.push({
          key: path,
          text: val
        });
      }
    } else if (typeof val === 'object') {
      search(val, rows, path);
    }
  }
  return rows;
}

const rows = [{ key: 'KEY', text: 'TEXT'}, ...search(localeZH)];

if (rows.length === 1) {
  console.log('There are no missing translations');
  process.exit(0);
}

const csv   = rows.map(({key, text}) => `"${key}","${text}"`).join('\n');
fs.writeFileSync(output, csv);
console.log(`--> Generated ${output}`);