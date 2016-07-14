# Custom Right-Click Menu - Create your own context menu

[![Join the chat at https://gitter.im/SanderRonde/CustomRightClickMenu](https://badges.gitter.im/SanderRonde/CustomRightClickMenu.svg)](https://gitter.im/SanderRonde/CustomRightClickMenu?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/SanderRonde/CustomRightClickMenu.svg?branch=master)](https://travis-ci.org/SanderRonde/CustomRightClickMenu)

---

Create your own entry in the right-click menu. Add custom scripts, links, submenus or custom CSS in your right-click menu and
do anything you want all from your right-click menu. Featuring full GreaseMonkey compatability for userscripts.

###Custom CSS
Apply custom CSS styles on the current page based on the page you're visiting. Make them always apply or only when you toggle them on.
Create comprehensive changes using a CSS editor with lots of features in the application or simply use your editor by using the
CRM External App ([source](https://github.com/SanderRonde/CRM-External-Editor-App), [app](https://chrome.google.com/webstore/detail/crm-external-editor-app/hkjjmhkhhlmkflpihbikfpcojeofbjgn)).

###Custom Javascript
Run your own javscript scripts on the current page or simply use ones that someone else wrote by sharing them. You can also write
the javascript in the extension itself or use your own editor with the external editor app ([source](https://github.com/SanderRonde/CRM-External-Editor-App), [app](https://chrome.google.com/webstore/detail/crm-external-editor-app/hkjjmhkhhlmkflpihbikfpcojeofbjgn)).
Apart from using standard javascript you can also access the Custom Right-Click Menu's own APIs allowing you to extend the menu
programmatically which simplifies creating self-contained scripts or sub-menus of course featuring a permissions system for any
external scripts to make sure they don't spam your menu with copies. Next to this you can access almost every single chrome API
without having to go through the hassle of creating a chrome extension specifically for it. This allows you to easily increase your
productivity by for example automatically creating bookmarks, managing your tabs or even setting alarms. If you're using chromeOS
this becomes even better since then you can even change things like your wallpaper and things about your system itself.
Apart from creating your own scripts you can use other people's scripts and share your own. Using a very secure system
that allows you to manage a script's permissions no harm can be done.

###Custom Menus
Create your own menus that are relevant for their own situations. For example, create a menu that lists all frequently used search
engines and allows you to add one using a javascript snippet. Making menus and changing where they are visible allows you to make
a specific right-click menu for every page and re-use other menus, even being able to show different menu items based on the content
you clicked on (page, link, selection, image, video or audio).

#Installing

##Installing from the chrome web store
The new (beta) version can be found [here](https://chrome.google.com/webstore/detail/custom-right-click-menu/fenehceojjegleckckhppcckanifnajg). The version that is in the old branch, aka the live version can be found [here](https://chrome.google.com/webstore/detail/custom-right-click-menu/onnbmgmepodkilcbdodhfepllfmafmlj).

##Installing from repo
Clone the repo, run npm install and run the grunt "build" task, load the extension into chrome from the "build/" folder.

#Developing Scripts
You can develop scripts both inside the extension and outside of it. By using the [external editor](https://chrome.google.com/webstore/detail/crm-external-editor-app/hkjjmhkhhlmkflpihbikfpcojeofbjgn) you can edit in your preferred editor while still having the changes sync up to the extension. Editing inside the extension features code completion by [CodeMirror](https://codemirror.net/) and [Tern](http://ternjs.net/) on both the [CRM API](http://sanderronde.github.io/CustomRightClickMenu/) and regular browser functions.

The CRM API allows you to edit the current state of the context menu right from a running script. This allows you to do things like create an "add website to menu" button, removing or adding subsections in a menu or even communicating with other running scripts. By also using a background script (which runs at all times and uses the same permissions/API), you can do pretty much everything a chrome extension could. The CRM API also features full compatability with the [GreaseMonkey API](https://wiki.greasespot.net/Greasemonkey_Manual:API), so you can use all userscripts.

There is a typescript definition file available for the CRM API over [here](https://github.com/SanderRonde/CustomRightClickMenu/tree/master/Custom%20Right-Click%20Menu/app/js/crmapi.ts) and you can find both an in-extension and [online](sanderronde.github.io/CustomRightClickMenu/) version of the documentation. The in-extension version can be found by going to /html/crmAPIDocs.html or by hitting the "go to definition" key in the CodeMirror editor.

#Contributing
To install the extension for contributing, simply clone this repo, run npm install, and load the extension into chrome from the "app/" folder. You should be able to have your changes in the app folder be reflected to live instantly by hitting `ctrl/cmd + r` on the options page. Building isn't really nessecary as long as you don't need to export the files as it basically only compresses and removes unnessecary files.

#License
```
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
