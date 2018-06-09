# Custom Right-Click Menu - Create your own context menu

Create your own entry in the right-click menu. Add custom scripts, links, sub-menus or custom CSS in your right-click menu and
do anything you want all from your right-click menu. Featuring full GreaseMonkey compatibility for userscripts and Stylish compatibility for userstyles.

[![Join the chat at https://gitter.im/SanderRonde/CustomRightClickMenu](https://badges.gitter.im/SanderRonde/CustomRightClickMenu.svg)](https://gitter.im/SanderRonde/CustomRightClickMenu?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/SanderRonde/CustomRightClickMenu.svg?branch=polymer-2)](https://travis-ci.org/SanderRonde/CustomRightClickMenu)
[![Tested with BrowserStack](http://i.imgur.com/3Mi2Fja.png)](https://www.browserstack.com/)

## Demo

A demo can be found over [here](https://sanderronde.github.io/CustomRightClickMenu/demo/). This demo does of course not offer
full functionality as it has no access to your actual browser APIs, but it does give a good view of the interface, a little bit of
a context menu demo on-page and access to settings.

![example](https://github.com/SanderRonde/CustomRightClickMenu/blob/master/store_images/screenshot1.png)

## About

### Custom CSS

Apply custom CSS styles on the current page based on the page you're visiting. Make them always apply or only when you toggle them on.
Create comprehensive changes using a CSS editor with lots of features in the application or simply use your editor by using the
CRM External App ([source](https://github.com/SanderRonde/CRM-External-Editor-App), [app](https://chrome.google.com/webstore/detail/crm-external-editor-app/hkjjmhkhhlmkflpihbikfpcojeofbjgn) (chrome only)).
If you want you can also download userstyles from [userstyles.org](https://userstyles.org/) and you can even export your stylesheets
as userstyles.

### Custom Javascript

Run your own javascript scripts on the current page or simply use ones that someone else wrote by sharing them. You can also write
the javascript in the extension itself or use your own editor with the external editor app ([source](https://github.com/SanderRonde/CRM-External-Editor-App), [app](https://chrome.google.com/webstore/detail/crm-external-editor-app/hkjjmhkhhlmkflpihbikfpcojeofbjgn) (chrome only)).
You can also write [TypeScript](typescriptlang.org), which is compiled in the extension.
Apart from using standard javascript APIs, you can also access the Custom Right-Click Menu's own APIs.
These allow you to extend the menu through your own code, which simplifies creating self-contained scripts or sub-menus. 
Of course featuring a permissions system for any external scripts to make sure they don't spam your menu with copies or
 run unauthorized scripts. Next to this you can access almost every single browser API
without having to go through the hassle of creating a browser extension specifically for it. This allows you to easily increase your
productivity by for example automatically creating bookmarks, managing your tabs or even setting alarms. If you're using chromeOS
this becomes even better since then you can even change things like your wallpaper and things about the system itself.
Apart from creating your own scripts you can use other people's scripts and share your own. Using a very secure system
that allows you to manage a script's permissions no harm can be done.

### Custom Menus

Create your own menus that are relevant for their own situations. For example, create a menu that lists all frequently used search
engines and allows you to add one using a javascript snippet. Making menus and changing where they are visible allows you to make
a specific right-click menu for every page and re-use other menus, even being able to show different menu items based on the content
you clicked on (page, link, selection, image, video or audio).

## Installing

### Installing from your browser's web store

[Chrome Webstore](https://chrome.google.com/webstore/detail/custom-right-click-menu/onnbmgmepodkilcbdodhfepllfmafmlj)

### Installing from repo

Clone the repo, run `[yarn](https://yarnpkg.com)` to install dependencies and run `yarn build` to build. Load the dist that matches your browser from dist/{browser}.

## Developing Scripts

You can develop scripts inside the extension and outside of it. Editing inside the extension features code completion in the [Monaco Editor](https://microsoft.github.io/monaco-editor/) on both the [CRM API](http://sanderronde.github.io/CustomRightClickMenu/documentation) and regular browser functions. You can edit outside of the extension using your favorite editor while still having type hinting by using the type definition file. You can build these typescript definitions file by cloning the repo, installing all dependencies and running `gulp genDefs`. The file will then be in /dist/defs/. Alternatively, you can find the documentation for the CRM API [online](https://sanderronde.github.io/CustomRightClickMenu/documentation).

The CRM API allows you to edit the current state of the context menu right from a running script. This allows you to do things like create an "add website to menu" button, removing or adding subsections in a menu or even communicating with other running scripts. By also using a background script (which runs at all times and uses the same permissions/API), you can do pretty much everything a browser extension could. The CRM API also features full compatibility with the [GreaseMonkey API](https://wiki.greasespot.net/Greasemonkey_Manual:API), so you can use all userscripts. By using the CRM API you can do anything a regular browser extension also can. You can even [run this extension in itself](https://github.com/SanderRonde/CustomRightClickMenu/tree/crm-meta) (given a fast enough browser).

Entering fullscreen mode brings up a hamburger menu on the left (see the image below) that allows access to the tools ribbon, containing features like using the external editor, adding (your own) libraries, easy search script generation or JSLint.

![fullscreen editor](https://github.com/SanderRonde/CustomRightClickMenu/blob/polymer-2/store_images/screenshot3.png)

## Contributing

If you want to contribute but don't know how to code, you can become a beta tester. If you want to join, send me an email at [awsdfgvhbjn@gmail.com](mailto:awsdfgvhbjn@gmail.com).
To install the extension for contributing, simply clone this repo, run `[yarn](https://yarnpkg.com) && gulp prepareForHotReload`. This allows you to hot reload any changes by reloading the extension in your browser. Load the extension into your browser from the "app/" folder and you're done. Note that the background page uses modules and as such will only work in chrome >= 66 when hot reloading.
Run the `gulp updateTsIdMaps && tsc -w` command in order to compile any typescript files in the app/ directory as they are changed. You should be able to have your changes in the app folder be reflected to live instantly by hitting `ctrl/cmd + r` on the options page or clicking "reload" on your browser's extension page.

Tests can be built by running the `yarn pretest` command. `yarn test` will fail generally because by default, browser tests are done remotely on Browserstack which requires an access key. To do the browser tests locally, run a Selenium driver instance of the browser you want to test and run `yarn test-local`. You can run the unit tests (not in a browser environment) locally without a selenium instance by running `yarn test:global`.

 Building isn't really necessary as long as you don't need to export the files as it basically only minifies and removes unnecessary files.

## License

```text
The MIT License (MIT)

Copyright (c) 2015 Sander Ronde

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
