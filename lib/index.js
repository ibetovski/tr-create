#!/usr/bin/env node

// expect source:target:language_target

import fs from 'fs';
import minimist from 'minimist';
import colors from 'colors';
import filendir from 'filendir';
import {Logme} from 'logme';
const logme = new Logme({
  theme: 'socket.io'
});



const argv = minimist(process.argv.slice(2));

// options:
let options = {};
options.sourceFile = argv.s || argv.source || null;
options.nameSpace = argv.n || argv['name-space'] || null;
options.lang = argv.l || argv.lang || 'en.json';
options.onlyLanguage = argv.ol || argv['only-language'] || null;
options.targetHtml = argv.t || argv['target-html'] || null;
options.help = argv.h || argv.help || null;

const helpText = {
  'exmpale': 'tr-create -s [' + 'html_source_file'.bold + '] -l [' + 'language_json_file'.bold + '] -n [' + 'name_space'.bold + ']',
  '-s,  --source': 'HTML file containig __text to translate__ dummy text',
  '-n,  --name-space': 'Name space to be used in HTML translations: {{ \'nameSpace.textToBeTranslated\' | translate }}' ,
  '-l, --lang' : 'Which file do you want to create for language?',
  '-ol, --only-language' : 'Create only a language without HTML file',
  '-t, --target-html' : 'HTML file to be created with translation placeholders. If not specified we will create a new one with sufix.',
  '-h, --help': 'Prints this help'
}

let outputHelp = Object.keys(helpText)
  .map((command) => {
    return command.bold + '\n' + helpText[command] + '\n';
  })
  .join('\n')

let args = process.argv.slice(2);
let file = options.sourceFile;
let nameSpace = args[1];

if (options.help) {
  console.log(outputHelp);
  process.exit(0);
}

if (!options.sourceFile) {
  logme.error('Please specify source file. For more information check -h');
  process.exit(0);
}

// read the HTML file.
fs.readFile(file, 'utf8', (error, fileData) => {
  let a = /_{2,4}[\w\s?\.]+_{2,3}?/im;

  // get the sentences
  let sentences = fileData
      .split('\n')
      .filter(item => {
        if (a.exec(item))
          return item;
      })
      .map(item => {
        let res = a.exec(item);

        return res[0];
      });

  // prepare JSON result.
  let translations = sentences
    .reduce((all, item) => {
      let text = item
        .toLowerCase()
        .replace(/_{2,3}/g, '')
        .replace(/\s(\w)/g, function(g) {
          
          return g
            .replace(' ', '')
            .toUpperCase();
        })

      let result = all;
      result[text] = item
      return result;
    }, {})

  // create translation file.
  filendir.writeFile(options.lang, JSON.stringify(translations, null, 2), () => {

    if (!options.onlyLanguage) {

      // if the user hasn't provided nameSpace, use the one from the file name.
      if (!options.nameSpace) {
        logme.info('--name-space hasn\'t been provided so we will use HTML file name.')
        options.nameSpace = options.sourceFile.split('.')[0];
      }

      // If no target HTML specified use the same name with sufix.
      if (!options.targetHtml) {
        options.targetHtml = options.sourceFile.replace('.html', '_tr.html')
        logme.info('--target-html hasn\'t been provided so we will create ' + options.targetHtml)
      }
      
      Object
        .keys(translations)
        .forEach((key) => {
          fileData = fileData
            .replace(translations[key], '{{\'' + options.nameSpace + '.' + key + '\' | translate }}')
        })

      // create new html file with translations.
      filendir.writeFile(options.targetHtml, fileData, () => {
        logme.info('Done!'.green);
        process.exit(0);
      });
    } else {
      logme.info('Done!'.green);
      process.exit(0);
    }

  });

});