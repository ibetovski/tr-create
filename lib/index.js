#!/usr/bin/env node

// expect source:target:language_target

import fs from 'fs'
import minimist from 'minimist'
import colors from 'colors'
import filendir from 'filendir'
import {Logme} from 'logme'
const logme = new Logme({
  theme: 'socket.io'
})

import TrCreate from './tr-create'

import _ from 'lodash'
import mediator from './mediator'

const argv = minimist(process.argv.slice(2))

if (argv.o) {
  logme.error('There is no ' + '-o'.bold + ' option. Did you mean --ol?')
  process.exit(0)
}

// options:
let options = {}
options.sourceFile = argv.s || argv.source || null
options.replaceOldHtml = argv.r || argv.replace || null
options.nameSpace = argv.n || argv['name-space'] || null
options.lang = argv.l || argv.lang || 'en.json'
options.onlyLanguage = argv.ol || argv['only-language'] || null
options.targetHtml = argv.t || argv['target-html'] || null
options.help = argv.h || argv.help || null


const trCreate = TrCreate(options)

const helpText = {
  'exmpale': 'tr-create -s [' + 'html_source_file'.bold + '] -l [' + 'language_json_file'.bold + '] -n [' + 'name_space'.bold + ']',
  '-s,  --source': 'HTML file containig __text to translate__ dummy text',
  '-r,  --replace': 'Replace the existing HTML with translations content',
  '-n,  --name-space': 'Name space to be used in HTML translations: {{ \'nameSpace.textToBeTranslated\' | translate }}' ,
  '-l, --lang' : `Comma separated JSON file name for the languages.
  You can provide full path if you need.
  JSON extension will be added automatically if omitted\nExample:
  -l langs/en.json,langs/es.json
  -l en,es`,
  '--ol, --only-language' : 'Create only a language without HTML file',
  '-t, --target-html' : 'HTML file to be created with translation placeholders. If not specified we will create a new one with sufix.',
  '-h, --help': 'Prints this help'
}

let outputHelp = Object.keys(helpText)
  .map((command) => {
    return command.bold + '\n' + helpText[command] + '\n'
  })
  .join('\n')

let args = process.argv.slice(2)
let file = options.sourceFile
let nameSpace = args[1]

if (options.help) {
  console.log(outputHelp)
  process.exit(0)
}

if (!options.sourceFile) {
  logme.error('Please specify source file. For more information check -h')
  process.exit(0)
}

// read the HTML file.
fs.readFile(file, 'utf8', (error, fileData) => {
  let a = /_{2,4}[\w\s?\.]+_{2,3}?/im

  // get the sentences
  let sentences = trCreate.findText(fileData)

  // prepare JSON result.
  let translations = trCreate.createKeyValue(sentences)

  // If the file exist we will merge it content with the new one.
  trCreate.createJSON(options.lang, translations, () => {

    if (!options.onlyLanguage) {

      // if the user hasn't provided nameSpace, use the one from the file name.
      if (!options.nameSpace) {
        mediator.emit('noNameSpace')
        options.nameSpace = options.sourceFile.split('.')[0]
      }

      // If no target HTML specified use the same name with sufix.
      if (!options.targetHtml && !options.replaceOldHtml) {
        options.targetHtml = options.sourceFile.replace('.html', '_tr.html')
        mediator.emit('noTargetHtml', options.targetHtml)
      } else if (options.replaceOldHtml) {

        mediator.emit('replaceHtml', options.sourceFile)
        options.targetHtml = options.sourceFile
      }
      
      Object
        .keys(translations)
        .forEach((key) => {
          fileData = fileData
            .replace(translations[key], '{{\'' + options.nameSpace + '.' + key + '\' | translate }}')
        })

      // create new html file with translations.
      filendir.writeFile(options.targetHtml, fileData, () => {
        mediator.emit('done')
        process.exit(0)
      })
    } else {
      mediator.emit('done')
      process.exit(0)
    }

  })

})

mediator.on('langExists', fileName => logme.info('JSON: ' + fileName + ' exists so we will merge it\'s content with the new one.'))
mediator.on('replaceHtml', fileName => logme.info('HTML: ' + fileName + ' was replaced with fresh content'))
mediator.on('noNameSpace', () =>  logme.info('HTML: --name-space hasn\'t been provided so we will use HTML file name.'))
mediator.on('noTargetHtml', fileName =>  logme.info('HTML: --target-html hasn\'t been provided so we will create ' + fileName))
mediator.on('done', () =>  logme.info('Done'.green))

