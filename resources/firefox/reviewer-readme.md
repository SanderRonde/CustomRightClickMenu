The github repo can be found at https://github.com/SanderRonde/CustomRightClickMenu/

The addon's source code can be found in the app/ directory. The app/bower_components/ directory contains a lot of bower packages and as such will probably generate a lot of errors. However, not all files from this directory are actually included into the built code.

Building the addon:
You can build the addon by installing the dependencies (yarn install --ignore-engines ) and then running the build command (yarn build). The addon will then be in the dist/firefox/ directory.

Testing the app:
If you want to test the app while still having access to unobfuscated source code, you can run "yarn install --ignore-engines --force && tsc && gulp prepareForHotReload". If you then load everything in the app/ directory into the browser as an addon, you can test the addon with its original source code, making debugging and seeing what code does what a little bit easier.


## Regarding the use of eval
The use of eval basically comes down to one major reason. The use of this extension (partially) is to run scripts on webpages. This of course requires the use of eval if the to-run code has to be wrapped in an API (which it is). This is the reason in `app/js/sandbox.ts`. In `app/js/crmapi.ts`, inputted code can be run in the script's context, which requires eval as well. In `app/js/polyfills/es-loader.ts`, eval is used to check whether classes are supported. Any other files containing eval don't make it to the final build so they won't do any harm (test files etc).

## Used libraries and their sources
Anything in app/bower_components is downloaded straight from the source. The versions, source code URL and everything should be listed in the respective package.json files.

| Filepath | source code | release file |
|---|---|---|
|app/js/libraries/jquery/jquery-2.0.3.js | https://github.com/jquery/jquery | https://code.jquery.com/jquery-2.0.3.js |
|app/js/libraries/jquery/jquery-ui.min.js | https://github.com/jquery/jquery-ui/releases/tag/1.11.2 | https://jqueryui.com/resources/download/jquery-ui-1.11.2.zip |
|app/js/libraries/jquery/jquery.bez.js | https://github.com/rdallasgray/bez | https://raw.githubusercontent.com/rdallasgray/bez/master/src/jquery.bez.js |
|app/js/libraries/jquery/jquery.color-2.1.2.min.js | jquery-color | http://code.jquery.com/color/jquery.color-2.1.2.min.js |
|app/js/libraries/jquery/jquery.requestAnimationFrame.min.js | https://github.com/gnarf/jquery-requestAnimationFrame | https://github.com/gnarf/jquery-requestAnimationFrame/releases/tag/0.1.2 |
|app/js/libraries/react/react-dom.js | https://github.com/facebook/react/ | https://github.com/facebook/react/releases/tag/v15.3.1 |
|app/js/libraries/react/react.js | https://github.com/facebook/react/ | https://github.com/facebook/react/releases/tag/v15.3.1 |
|app/js/libraries/tern/acorn.js | https://github.com/acornjs/acorn | http://ternjs.net/node_modules/acorn/dist/acorn.js |
|app/js/libraries/tern/comment.js | https://github.com/ternjs/tern | http://ternjs.net/plugin/doc_comment.js |
|app/js/libraries/tern/def.js | https://github.com/ternjs/tern | http://ternjs.net/lib/def.js |
|app/js/libraries/tern/infer.js | https://github.com/ternjs/tern | http://ternjs.net/lib/infer.js |
|app/js/libraries/tern/signal.js | https://github.com/ternjs/tern | http://ternjs.net/lib/signal.js |
|app/js/libraries/tern/tern.js | https://github.com/ternjs/tern | https://codemirror.net/addon/tern/tern.js |
|app/js/libraries/tern/ternserver.js | https://github.com/ternjs/tern | http://ternjs.net/lib/tern.js |
|app/js/libraries/tern/walk.js | https://github.com/acornjs/acorn | http://ternjs.net/node_modules/acorn/dist/walk.js |
|app/js/libraries/csslint.js | https://github.com/CSSLint/csslint | https://github.com/CSSLint/csslint/releases/tag/v1.0.5 | https://github.com/douglascrockford/JSLint | https://github.com/douglascrockford/JSLint |
| app/js/libraries/jsonfn.js | https://github.com/vkiryukhin/jsonfn | https://github.com/vkiryukhin/jsonfn |
| app/js/libraries/sortable.js | https://github.com/RubaXa/Sortable | https://github.com/RubaXa/Sortable/releases/tag/1.4.0 (slightly modified to work with shadow roots) |
| resources/buildresources/less.min.js | https://github.com/less/less.js | https://github.com/less/less.js/releases/tag/v3.7.0 |
| resources/buildresources/stylus.min.js | https://github.com/less/less.js/releases/tag/v3.7.0 | http://stylus-lang.com/try/stylus.min.js |

## Remote scripts
No remote scripts are loaded in this extension. The firefox review system flagged docs/theme/partia/analytics.hbs as a file that loads remote files but it doesn't make it into the extension as it just hosts the demo website.

## Creating DOM from strings
For all files that exist outside of the app/ directory, the same goes as above. These files don't make it into the final build. 
Apart from that, all data is properly sanitized before being inserted into the innerHTML. Since there is no data from external sources there's not really any danger for unsanitized data unless the user themselves do it.