# Custom Right-Click Menu
Custom Right-Click Menu for Chrome

#Installing from repo
Clone the repo, run npm install and run the grunt "build" task, load the extension into chrome from the "build" folder

#Installing from the chrome web store
The extension can be found here https://chrome.google.com/webstore/detail/custom-right-click-menu/onnbmgmepodkilcbdodhfepllfmafmlj
Keep in mind this version is version 1.1 and this is the repo containg version 2.0
It's probably going to take a while to complete this version since i'm doing this on the side next to university and university projects.

#Description
Create your own entry in the right-click menu. Add custom scripts, links, submenus or custom CSS in your right-click menu and
do anything you want all from your right-click menu. 

#Custom CSS
Apply custom CSS styles on the current page based on the page you're visiting. Make them always apply or only when you toggle them on.
Create comprehensive changes using a CSS editor with lots of features in the application or simply use your editor by using the 
CRM External App (https://github.com/SanderRonde/CRM-External-Editor-App).

#Custom Javascript
Run your own javscript snippets on the current page or simply use ones that someone else wrote by sharing them. You can also write 
the javascript in the extension itself or use your own editor with (https://github.com/SanderRonde/CRM-External-Editor-App).
Apart from using standard javascript you can also access the Custom Right-Click Menu's own APIs allowing you to extend the menu
programmatically which simplifies creating self-contained snippets or sub-menus of course featuring a permissions system for any
external snippets to make sure they don't spam your menu with copies. Next to this you can access almost every single chrome API
without having to go through the hassle of creating a chrome extension specifically for it. This allows you to easily increase your
productivity by for example automatically creating bookmarks, managing your tabs or even setting alarms. If you're using chromeOS 
this becomes even better since then you can even change things like your wallpaper and things about your system itself.
Apart from creating your own javascript snippets you can use other people's snippets and share your own. Using a very secure system
that allows you to manage a snippet's permissions no harm can be done. 

#Custom Menus
Create your own menus that are relevant for their own situations. For example, create a menu that lists all frequently used search
engines and allows you to add one using a javascript snippet. Making menus and changing where they are visible allows you to make
a specific right-click menu for every page and re-use other menus, even being able to show different menu items based on the content
you clicked on (page, link, selection, image, video or audio).

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
