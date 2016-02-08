# tr-create

This project is focused mainly on angularjs projects using [angular-translate](https://github.com/angular-translate/angular-translate).

### Instalation

```bash
$ npm install -g tr-create
```

### The Idea
Sometimes we are focused on the implementation and not on the copy text. We don't want our HTML/CSS/JS work to be bothered with the creation of the translate files for different languages. So we leave "Lorem ipsum" text or in my case "\_\_text to be translated later\_\_".

After the work is done, we run that script and it:

* creates JSON files for translations (`en.json` or `es.json`) - if your JSON exists, we will merge the new content with the old one and will replace the existing file with the fresh content.
* creates HTML file with `{{ 'global.someText' | translate }}` placeholder instead of `__some text__`

### Usage
```bash
$ tr-create -s untranslated.html -t translated.html -l langs/en.json
```

### Example:
`untranslated.html` content:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
</head>
<body>
<div>__Please translate me__</div>
<h1>__I need a translation__</h1>
<p>__Please somebody to translate this text__</p>
</body>
</html>
```

execute:

```bash
tr-create -s untranslated.html
```
By default it will create:

* `en.json`:

```json
{
  "pleaseTranslateMe": "__Please translate me__",
  "iNeedATranslation": "__I need a translation__",
  "pleaseSomebodyToTranslateThisText": "__Please somebody to translate this text__"
}
```
* `untranslated_tr.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
</head>
<body>
<div>{{'global.pleaseTranslateMe' | translate }}</div>
<h1>{{'global.iNeedATranslation' | translate }}</h1>
<p>{{'global.pleaseSomebodyToTranslateThisText' | translate }}</p>
</body>
</html>
```

### Options
```bash
exmpale
tr-create -s [html_source_file] -l [language_json_file] -n [name_space]

-s,  --source
HTML file containig __text to translate__ dummy text

-n,  --name-space
Name space to be used in HTML translations: {{ 'nameSpace.textToBeTranslated' | translate }}

-l, --lang
Which file do you want to create for language?

-ol, --only-language
Create only a language without HTML file

-t, --target-html
HTML file to be created with translation placeholders. If not specified we will create a new one with sufix.

-h, --help
Prints this help
```

### MIT License

### Contribute
If you have an idea or special needs that this tool doesn't cover don't hesitate to fork and add the needed feature. There is only one requirement - use ES6 and babel.