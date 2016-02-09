import fs from 'fs'
import path from 'path'
import filendir from 'filendir'
import _ from 'lodash'
import mediator from './mediator'

function trCreate() {

  return {
    findText: function(htmlContent) {
      let a = /_{2,4}\s?[\w\s?\.]+\s?_{2,3}?/gim

      // get the sentences
      let sentences = htmlContent
        .split('\n')
        .reduce((all, item) => {
          let res = item.match(a)
          if (res && res.length > 0)
            return all.concat(res)
          else
            return all
        }, [])

      return sentences
    },

    createKeyValue: function(sentences) {

      let translations = sentences
        .reduce((all, item) => {
          let key = item
            .toLowerCase()
            .replace(/_{2,}/g, '')
            .trim()
            .replace(/\s(\w)/g, function(g) {
              let index = Array.prototype.slice.call(arguments, -2)[0]
              
              // we don't want our camelCase to start with lowercase.
              if (index > 0) {
                return g
                  .toUpperCase()
              } else {
                return g
              }
            })
            .replace(/\W/g, '')

          let result = all
          result[key] = item
          return result
        }, {})

      return translations
    },

    createJSON: function(fileNames, translations, cb) {

      function createFile(fileName, cb) {
        // if the file name is without extension we make it a JSON.
        if (path.extname(fileName) === '') {
          fileName += '.json'
        }
        
        // If the file exist we will merge it content with the new one.
        let stats
        try {
          stats = fs.statSync(fileName)
        } catch(e) {

        }

        let mergedTrasnlations = _.extend({}, translations)

        let oldContent
        let contentObject
        // if yes, take the content, make it an object, append to it
        if (stats && stats.isFile()) {
          oldContent = fs.readFileSync(fileName, 'utf8')


          contentObject = JSON.parse(oldContent)
          mergedTrasnlations = _.extend({}, contentObject, translations)

          // notify the user.
          mediator.emit('langExists', fileName);
        }

        filendir.writeFile(fileName, JSON.stringify(mergedTrasnlations, null, 2), () => {
          cb()
        })
      }

      var files = fileNames.split(',');
      var fileToCreateCount = files.length;

      files.forEach(function(fileName, index) {
        createFile(fileName, function() {
          if (index === fileToCreateCount - 1) {
            cb();
          }
        })
      }); 
    }
  }
}

module.exports = trCreate