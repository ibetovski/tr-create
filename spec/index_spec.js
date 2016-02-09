var TrCreate = require('../dist/tr-create')
var expect = require('chai').expect
var mock = require('mock-fs')
var fs = require('fs')

var trCreate = TrCreate();

describe('Parse', function() {

  beforeEach(function() {
    mock({})
  })

  describe('Content finder', function() {
    it('should find 2 sentences', function() {
      var content = "<div>__Please translate me__</div>\n" +
        "<p>__for translation__</p>\n" +
        "<p>not for translation</p>\n"
        expect(trCreate.findText(content).length).to.equal(2)
    })

    it('should find 2 sentences in the same line', function() {
      var content = "<div>__Please translate me__</div><p>__for translation__</p>"
        expect(trCreate.findText(content).length).to.equal(2)
    })

    it('should return nothing if no items', function() {
      var content = "<div>Please translate me</div>"
        expect(trCreate.findText(content).length).to.equal(0)
    })

    it('should find text with many underscores and spaces', function() {
      var content = "<div>________       Please translate me         ______</div>"
        expect(trCreate.findText(content).length).to.equal(1)
    })
  })

  describe('JSON', function() {
    it('should remove dots from the keys', function() {
      var sentences = [
        "__!?Come on.'__"
      ]

      var result = trCreate.createKeyValue(sentences)
      expect("comeOn" in result).to.be.ok
    })

    it('should leave the original text in the value', function() {
      var sentences = [
        "__!?Come on.'__"
      ]

      var result = trCreate.createKeyValue(sentences)
      expect(result['comeOn']).to.equal(sentences[0])
    })

    it('should work with spaces and many underscores', function() {
      var sentences = [
        "____  camel case key _____"
      ]

      var result = trCreate.createKeyValue(sentences)
      expect("camelCaseKey" in result).to.be.ok
    })
  })

  describe('FS JSON', function() {
    afterEach(function() {
      mock.restore();
    })

    it('should append content to the existing one', function(done) {
      mock({'en.json': '{"dodo": "Dodo"}'})

      trCreate = TrCreate()

      var fileName = 'en.json'
      var content = {"camelCase": "__camelCase__"};
      trCreate.createJSON(fileName, content, function() {
        fs.readFile('en.json', 'utf8', function(err, data) {
          expect(JSON.parse(data)).to.deep.equal({
            "dodo": "Dodo",
            "camelCase": "__camelCase__"
          })

          done()
        })
      })
    })

    it('should create JSON with deep path if doesn\'t exist', function(done) {
      trCreate = TrCreate()

      var fileName = 'deep/path/en.json'
      var content = {"camelCase": "__camelCase__"}
      trCreate.createJSON(fileName, content, function() {
        fs.readFile('deep/path/en.json', 'utf8', function(err, data) {
          expect(JSON.parse(data)).to.deep.equal({
            "camelCase": "__camelCase__"
          })

          done()
        })
      })
    });

    it('should create multiple JSON files', function(done) {
      trCreate = TrCreate()

      var fileName = 'en.json,es.json,de.json'
      var content = {"camelCase": "__camelCase__"}
      trCreate.createJSON(fileName, content, function() {
        expect(JSON.parse(fs.readFileSync('en.json', 'utf8'))).to.deep.equal({"camelCase": "__camelCase__"})
        expect(JSON.parse(fs.readFileSync('es.json', 'utf8'))).to.deep.equal({"camelCase": "__camelCase__"})
        expect(JSON.parse(fs.readFileSync('de.json', 'utf8'))).to.deep.equal({"camelCase": "__camelCase__"})
        done()
      })
    });

    it('should work with wrong separators', function(done) {
      trCreate = TrCreate()

      var fileName = 'en.json,,,es.json,,,'
      var content = {"camelCase": "__camelCase__"}
      trCreate.createJSON(fileName, content, function() {
        expect(JSON.parse(fs.readFileSync('en.json', 'utf8'))).to.deep.equal({"camelCase": "__camelCase__"})
        expect(JSON.parse(fs.readFileSync('es.json', 'utf8'))).to.deep.equal({"camelCase": "__camelCase__"})
        done()
      })
    });

    it('should append to different contents', function(done) {
      trCreate = TrCreate()

      mock({
        'en.json': '{"bar": "bar"}',
        'es.json': '{"foo": "foo"}',
      })

      var fileNames = 'en.json,,,es.json,,,'
      var content = {"camelCase": "__camelCase__"}
      trCreate.createJSON(fileNames, content, function() {
        expect(JSON.parse(fs.readFileSync('en.json', 'utf8'))).to.deep.equal({"bar": "bar", "camelCase": "__camelCase__"})
        expect(JSON.parse(fs.readFileSync('es.json', 'utf8'))).to.deep.equal({"foo": "foo", "camelCase": "__camelCase__"})
        done()
      })
    });

    it('should create multiple files without extension', function(done) {
      trCreate = TrCreate()

      var fileNames = 'en,es'
      var content = {"camelCase": "__camelCase__"}
      trCreate.createJSON(fileNames, content, function() {
        expect(JSON.parse(fs.readFileSync('en.json', 'utf8'))).to.deep.equal({"camelCase": "__camelCase__"})
        expect(JSON.parse(fs.readFileSync('es.json', 'utf8'))).to.deep.equal({"camelCase": "__camelCase__"})
        done()
      })
    });
  })
})