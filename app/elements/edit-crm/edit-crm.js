/// <reference path="../../../tools/definitions/crmapp.d.ts" />
var editCrmProperties = {
    crm: {
        type: Array,
        value: [],
        notify: true
    },
    crmLoading: {
        type: Boolean,
        value: false,
        notify: true
    },
    crmEmpty: {
        type: Boolean,
        value: true,
        notify: true,
        computed: '_isCrmEmpty(crm, crmLoading)'
    },
    /**
     * Whether the user is currently selecting nodes to remove
     *
     * @attribute isSelecting
     * @type Boolean
     * @default false
     */
    isSelecting: {
        type: Boolean,
        value: false,
        notify: true
    },
    /**
     * Whether the user is adding a node
     *
     * @attribute isAdding
     * @type Boolean
     * @default false
     */
    isAdding: {
        type: Boolean,
        value: false,
        notify: true
    }
};
var EC = (function () {
    function EC() {
    }
    EC.firstCRMColumn = function () {
        return (this.firstCRMColumnEl || (this.firstCRMColumnEl = window.app.editCRM.children[1].children[2]));
    };
    ;
    EC._isColumnEmpty = function (column) {
        return column.list.length === 0 && !this.isAdding;
    };
    ;
    EC._isCrmEmpty = function (crm, crmLoading) {
        return !crmLoading && crm.length === 0;
    };
    ;
    EC._getAriaLabel = function (item) {
        return 'Edit item "' + item.name + '"';
    };
    ;
    /**
     * Gets the columns in this crm-edit element
     */
    EC.getColumns = function () {
        //Check if the nodes still exist 
        if (this.columns && document.contains(this.columns[0])) {
            return this.columns;
        }
        return (this.columns = Array.prototype.slice.apply(this.$['mainCont'].children).filter(function (element) {
            return element.classList.contains('CRMEditColumnCont');
        }));
    };
    ;
    /**
     * Gets the column with given index
     */
    EC.getColumn = function (index) {
        return this.getColumns()[index];
    };
    ;
    /**
     * Gets the current column
     */
    EC.getCurrentColumn = function (element) {
        var fillerIndex = (element._filler && element._filler.column);
        if (typeof fillerIndex !== 'number') {
            fillerIndex = null;
        }
        return this.getColumn((fillerIndex === null || fillerIndex === undefined ?
            element.parentNode.index :
            fillerIndex));
    };
    ;
    /**
     * Gets the next column
     */
    EC.getNextColumn = function (element) {
        var fillerIndex = (element._filler && element._filler.column);
        if (typeof fillerIndex !== 'number') {
            fillerIndex = null;
        }
        return this.getColumn((fillerIndex === null ?
            element.parentNode.index + 1 :
            fillerIndex + 1));
    };
    ;
    /**
     * Gets the previous column
     */
    EC.getPrevColumn = function (element) {
        var fillerIndex = (element._filler && element._filler.column);
        if (typeof fillerIndex !== 'number') {
            fillerIndex = null;
        }
        return this.getColumn((fillerIndex === null ?
            element.parentNode.index - 1 :
            fillerIndex - 1));
    };
    ;
    /**
     * Gets the edit-crm-item nodes in the given colume
     */
    EC.getEditCrmItems = function (column, includeTemplate) {
        if (includeTemplate === void 0) { includeTemplate = false; }
        return $(column)
            .children('paper-material')
            .children('.CRMEditColumn')
            .children(!includeTemplate ? 'edit-crm-item' : undefined)
            .toArray();
    };
    ;
    EC.getCurrentTypeIndex = function (path) {
        var i;
        var hiddenNodes = {};
        for (i = 0; i < window.app.settings.crm.length; i++) {
            this.isNodeVisible(hiddenNodes, window.app.settings.crm[i], window.app.crmType);
        }
        var items = $($(window.app.editCRM.$['mainCont']).children('.CRMEditColumnCont')[path.length - 1]).children('paper-material').children('.CRMEditColumn')[0].children;
        var index = path[path.length - 1];
        for (i = 0; i < items.length; i++) {
            if (items[i].item && items[i].item.id && hiddenNodes[items[i].item.id]) {
                index--;
            }
        }
        return index;
    };
    ;
    /**
     * Gets the last menu of the list.
     *
     * @param list - The list.
     * @param hidden - The hidden nodes
     *
     * @return The last menu on the given list.
     */
    EC.getLastMenu = function (list, hidden) {
        var lastMenu = -1;
        var lastFilledMenu = -1;
        //Find last menu to auto-expand
        if (list) {
            list.forEach(function (item, index) {
                if ((item.type === 'menu' || (window.app.shadowStart && item.menuVal)) && !hidden[item.id]) {
                    lastMenu = index;
                    item.children = item.children || [];
                    if (item.children.length > 0) {
                        lastFilledMenu = index;
                    }
                }
            });
            if (lastFilledMenu !== -1) {
                return lastFilledMenu;
            }
        }
        return lastMenu;
    };
    ;
    /**
     * Returns whether the node is visible or not (1 if it's visible)
     */
    EC.isNodeVisible = function (result, node, showContentType) {
        var length;
        if (node.children && node.children.length > 0) {
            length = node.children.length;
            for (var i = 0; i < length; i++) {
                this.isNodeVisible(result, node.children[i], showContentType);
            }
        }
        if (!node.onContentTypes[showContentType]) {
            result[node.id] = true;
            return 0;
        }
        return 1;
    };
    ;
    EC.getIndent = function (data, lastMenu, hiddenNodes) {
        var i;
        var length = data.length - 1;
        var visibleIndent = lastMenu;
        for (i = 0; i < length; i++) {
            if (hiddenNodes[data[i].id]) {
                visibleIndent--;
            }
        }
        return visibleIndent;
    };
    ;
    /**
     * Builds crm edit object.
     *
     * @param setMenus - An array of menus that are set to be opened (by user input).
     *
     * @return the CRM edit object
     */
    EC.buildCRMEditObj = function (setMenus) {
        var column;
        var indent;
        var path = [];
        var columnCopy;
        var columnNum = 0;
        var lastMenu = -2;
        var indentTop = 0;
        var crmEditObj = [];
        var newSetMenus = [];
        var list = window.app.settings.crm;
        var setMenusLength = setMenus.length;
        var showContentTypes = window.app.crmType;
        //Hide all nodes that should be hidden
        var hiddenNodes = {};
        var shown = 0;
        for (var i = 0; i < list.length; i++) {
            shown += this.isNodeVisible(hiddenNodes, list[i], showContentTypes);
        }
        if (shown || this.isAdding) {
            while (lastMenu !== -1) {
                if (setMenusLength > columnNum && !hiddenNodes[list[setMenus[columnNum]].id]) {
                    lastMenu = setMenus[columnNum];
                }
                else {
                    lastMenu = this.getLastMenu(list, hiddenNodes);
                }
                newSetMenus[columnNum] = lastMenu;
                indent = this.getIndent(list, lastMenu, hiddenNodes);
                var columnIndent = [];
                columnIndent[indentTop - 1] = undefined;
                column = {
                    indent: columnIndent,
                    menuPath: path.concat(lastMenu),
                    list: list,
                    index: columnNum,
                    shadow: window.app.shadowStart && window.app.shadowStart <= columnNum
                };
                if (lastMenu !== -1) {
                    indentTop += indent;
                    list.forEach(function (item) {
                        item.expanded = false;
                    });
                    var lastNode = list[lastMenu];
                    lastNode.expanded = true;
                    if (window.app.shadowStart && lastNode.menuVal) {
                        list = lastNode.menuVal;
                    }
                    else {
                        list = list[lastMenu].children;
                    }
                }
                column.list.map(function (currentVal, index) {
                    currentVal.path = [];
                    path.forEach(function (item, pathIndex) {
                        currentVal.path[pathIndex] = item;
                    });
                    currentVal.index = index;
                    currentVal.isPossibleAddLocation = false;
                    currentVal.path.push(index);
                    return currentVal;
                });
                columnCopy = column.list.filter(function (item) {
                    return !hiddenNodes[item.id];
                });
                column.list = columnCopy;
                path.push(lastMenu);
                crmEditObj.push(column);
                columnNum++;
            }
        }
        this.columns = null;
        return {
            crm: crmEditObj,
            setMenus: newSetMenus
        };
    };
    ;
    /**
     * Builds the crm object
     *
     * @param setItems - Set choices for menus by the user
     * @param quick - Do it quicker than normal
     * @param superquick - Don't show a loading image and do it immediately
     *
     * @return The object to be sent to Polymer
     */
    EC.build = function (setItems, quick, superquick) {
        if (quick === void 0) { quick = false; }
        if (superquick === void 0) { superquick = false; }
        var _this = this;
        setItems = setItems || [];
        var obj = this.buildCRMEditObj(setItems);
        this.setMenus = obj.setMenus;
        var crmBuilder = obj.crm;
        //Get the highest column's height and apply it to the element to prevent
        //the page from going and shrinking quickly
        var hight;
        var highest = 0;
        crmBuilder.forEach(function (column) {
            hight = column.indent.length + column.list.length;
            hight > highest && (highest = hight);
        });
        this.$['mainCont'].style.minHeight = (highest * 50) + 'px';
        this.crm = [];
        if (this.currentTimeout !== null) {
            window.clearTimeout(this.currentTimeout);
        }
        this.crmLoading = true;
        this.columns = null;
        function func() {
            _this.crm = crmBuilder;
            _this.notifyPath('crm', _this.crm);
            _this.currentTimeout = null;
            setTimeout(function () {
                _this.crmLoading = false;
                var els = document.getElementsByTagName('edit-crm-item');
                for (var i = 0; i < els.length; i++) {
                    els[i].update();
                }
                setTimeout(function () {
                    window.app.pageDemo.create();
                }, 0);
            }, 50);
        }
        if (superquick) {
            func();
        }
        else {
            this.currentTimeout = window.setTimeout(func, quick ? 150 : 1000);
        }
        return crmBuilder;
    };
    ;
    EC.ready = function () {
        var _this = this;
        window.app.editCRM = this;
        window.app.addEventListener('crmTypeChanged', function () {
            _this._typeChanged();
        });
        this._typeChanged(true);
    };
    ;
    EC.addToPosition = function (e) {
        var index = 0;
        var node = e.path[index];
        while (node.classList.contains('addingItemPlaceholder') === false) {
            index++;
            node = e.path[index];
        }
        this.addItem(JSON.parse(node.getAttribute('data-path')));
        this.isAdding = false;
    };
    ;
    EC.cancelAdding = function () {
        if (this.isAdding) {
            this.isAdding = false;
            this.build(this.setItems, false, true);
        }
    };
    ;
    EC.toggleAddState = function () {
        if (!this.isAdding) {
            this.isSelecting && this.cancelSelecting();
            this.isAdding = true;
            this.build(this.setItems, false, true);
        }
        else {
            this.cancelAdding();
        }
    };
    ;
    EC.addItem = function (path) {
        var newItem = window.app.templates.getDefaultLinkNode({
            id: window.app.generateItemId()
        });
        var container = window.app.crm.lookup(path, true);
        container.push(newItem);
        window.app.editCRM.build(window.app.editCRM.setMenus, false, true);
        window.app.upload();
    };
    ;
    EC.getSelected = function () {
        var selected = [];
        var editCrmItems = document.getElementsByTagName('edit-crm-item');
        var i;
        for (i = 0; i < editCrmItems.length; i++) {
            if (editCrmItems[i].classList.contains('highlighted')) {
                selected.push(editCrmItems[i].item.id);
            }
        }
        return selected;
    };
    ;
    EC.makeNodeSafe = function (node) {
        var newNode = {};
        node.type && (newNode.type = node.type);
        node.name && (newNode.name = node.name);
        node.value && (newNode.value = node.value);
        node.linkVal && (newNode.linkVal = node.linkVal);
        node.menuVal && (newNode.menuVal = node.menuVal);
        if (node.children) {
            newNode.children = [];
            for (var i = 0; i < node.children.length; i++) {
                newNode.children[i] = this.makeNodeSafe(node.children[i]);
            }
        }
        node.nodeInfo && (newNode.nodeInfo = node.nodeInfo);
        node.triggers && (newNode.triggers = node.triggers);
        node.scriptVal && (newNode.scriptVal = node.scriptVal);
        node.stylesheetVal && (newNode.stylesheetVal = node.stylesheetVal);
        node.onContentTypes && (newNode.onContentTypes = node.onContentTypes);
        node.showOnSpecified && (newNode.showOnSpecified = node.showOnSpecified);
        return newNode;
    };
    ;
    EC.extractUniqueChildren = function (node, toExportIds, results) {
        if (toExportIds.indexOf(node.id) > -1) {
            results.push(node);
        }
        else {
            for (var i = 0; node.children && i < node.children.length; i++) {
                this.extractUniqueChildren(node.children[i], toExportIds, results);
            }
        }
    };
    ;
    EC.changeAuthor = function (node, authorName) {
        node.nodeInfo.source.author = authorName;
        for (var i = 0; node.children && i < node.children.length; i++) {
            this.changeAuthor(node.children[i], authorName);
        }
    };
    ;
    EC.crmExportNameChange = function (node, author) {
        if (author) {
            node.nodeInfo && node.nodeInfo.source && (node.nodeInfo.source.author = author);
        }
        return JSON.stringify(node);
    };
    ;
    EC.getMetaIndexes = function (script) {
        var metaStart = -1;
        var metaEnd = -1;
        var lines = script.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (metaStart !== -1) {
                if (lines[i].indexOf('==/UserScript==') > -1) {
                    metaEnd = i;
                    break;
                }
            }
            else if (lines[i].indexOf('==UserScript==') > -1) {
                metaStart = i;
            }
        }
        return {
            start: metaStart,
            end: metaEnd
        };
    };
    ;
    EC.getMetaLines = function (script) {
        var metaIndexes = this.getMetaIndexes(script);
        if (metaIndexes.start === -1) {
            return null;
        }
        var metaStart = metaIndexes.start;
        var metaEnd = metaIndexes.end;
        var startPlusOne = metaStart + 1;
        var lines = script.split('\n');
        var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));
        return metaLines;
    };
    ;
    EC.getMetaTags = function (script) {
        var metaLines = this.getMetaLines(script);
        var metaTags = {};
        var regex = new RegExp(/@(\w+)(\s+)(.+)/);
        var regexMatches;
        for (var i = 0; i < metaLines.length; i++) {
            regexMatches = metaLines[i].match(regex);
            if (regexMatches) {
                metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
                metaTags[regexMatches[1]].push(regexMatches[3]);
            }
        }
        return metaTags;
    };
    ;
    EC.setMetaTagIfSet = function (metaTags, metaTagKey, nodeKey, node) {
        if (node && node[nodeKey]) {
            if (Array.isArray(node[nodeKey])) {
                metaTags[metaTagKey] = node[nodeKey];
            }
            else {
                metaTags[metaTagKey] = [node[nodeKey]];
            }
        }
    };
    ;
    EC.getUserscriptString = function (node, author) {
        var i;
        var code = (node.type === 'script' ? node.value.script : node.value.stylesheet);
        var codeSplit = code.split('\n');
        var metaIndexes = this.getMetaIndexes(code);
        var metaTags = {};
        if (metaIndexes.start !== -1) {
            //Remove metaLines
            codeSplit.splice(metaIndexes.start, (metaIndexes.end - metaIndexes.start) + 1);
            metaTags = this.getMetaTags(code);
        }
        this.setMetaTagIfSet(metaTags, 'name', 'name', node);
        author = (metaTags['nodeInfo'] && JSON.parse(metaTags['nodeInfo'][0]).author) || author || 'anonymous';
        var authorArr = [];
        if (!Array.isArray(author)) {
            authorArr = [author];
        }
        metaTags['author'] = authorArr;
        this.setMetaTagIfSet(metaTags, 'downloadURL', 'url', node.nodeInfo.source);
        this.setMetaTagIfSet(metaTags, 'version', 'version', node.nodeInfo);
        metaTags['CRM_contentTypes'] = [JSON.stringify(node.onContentTypes)];
        this.setMetaTagIfSet(metaTags, 'grant', 'permissions', node);
        var matches = [];
        var excludes = [];
        for (i = 0; i < node.triggers.length; i++) {
            if (node.triggers[i].not) {
                excludes.push(node.triggers[i].url);
            }
            else {
                matches.push(node.triggers[i].url);
            }
        }
        metaTags['match'] = matches;
        metaTags['exclude'] = excludes;
        this.setMetaTagIfSet(metaTags, 'CRM_launchMode', 'launchMode', node.value);
        if (node.type === 'script' && node.value.libraries) {
            metaTags['require'] = [];
            for (i = 0; i < node.value.libraries.length; i++) {
                //Turn into requires
                if (node.value.libraries[i].location) {
                    switch (node.value.libraries[i].location) {
                        case 'jquery.js':
                            metaTags['require'].push('https://code.jquery.com/jquery-2.1.4.min.js');
                            break;
                        case 'angular.js':
                            metaTags['require'].push('https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.7/angular.min.js');
                            break;
                        case 'mooTools.js':
                            metaTags['require'].push('https://cdnjs.cloudlare.com/ajax/libs/mootools/1.5.2/mootools-core.min.js');
                            break;
                        case 'yui.js':
                            metaTags['require'].push('https://cdnjs.cloudlare.com/ajax/libs/yui/3.18.1/yui/yui-min.js');
                            break;
                        case 'jqlite':
                            metaTags['require'].push('https://raw.githubusercontent.com/jstools/jqlite/master/jqlite.min.js');
                            break;
                    }
                }
                else {
                    metaTags['require'].push(node.value.libraries[i].url);
                }
            }
        }
        if (node.type === 'stylesheet') {
            metaTags['CRM_stylesheet'] = ['true'];
            this.setMetaTagIfSet(metaTags, 'CRM_toggle', 'toggle', node.value);
            this.setMetaTagIfSet(metaTags, 'CRM_defaultOn', 'defaultOn', node.value);
            //Convert stylesheet to GM API stylesheet insertion
            var stylesheetCode = codeSplit.join('\n');
            codeSplit = ['GM_addStyle(\'', stylesheetCode.replace(/\n/g, ''), '\');'];
        }
        var metaLines = [];
        for (var metaKey in metaTags) {
            if (metaTags.hasOwnProperty(metaKey)) {
                for (i = 0; i < metaTags[metaKey].length; i++) {
                    metaLines.push('// @' + metaKey + '	' + metaTags[metaKey][i]);
                }
            }
        }
        var newScript = '// ==UserScript==\n';
        newScript += metaLines.join('\n');
        newScript += '// ==/UserScript==\n';
        newScript += codeSplit.join('\n');
        return newScript;
    };
    ;
    EC.generateDocumentRule = function (node) {
        var rules = node.triggers.map(function (trigger) {
            if (trigger.url.indexOf('*') === -1) {
                return 'url(' + trigger + ')';
            }
            else {
                var schemeAndDomainPath = trigger.url.split('://');
                var scheme = schemeAndDomainPath[0];
                var domainPath = schemeAndDomainPath.slice(1).join('://');
                var domainAndPath = domainPath.split('/');
                var domain = domainAndPath[0];
                var path = domainAndPath.slice(1).join('/');
                var schemeWildCard = scheme.indexOf('*') > -1;
                var domainWildcard = domain.indexOf('*') > -1;
                var pathWildcard = path.indexOf('*') > -1;
                if (~~schemeWildCard + ~~domainWildcard + ~~pathWildcard > 1 ||
                    domainWildcard || schemeWildCard) {
                    //Use regex
                    return 'regexp("' +
                        trigger.url
                            .replace(/\*/, '.*')
                            .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
                        '")';
                }
                else {
                    return 'url-prefix(' + scheme + '://' + domain + ')';
                }
            }
        });
        var match;
        var indentation;
        var lines = node.value.stylesheet.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if ((match = /(\s+)(\w+)/.exec(lines[i]))) {
                indentation = match[1];
                break;
            }
        }
        indentation = indentation || '	';
        return '@-moz-document ' + rules.join(', ') + ' {' +
            lines.map(function (line) {
                return indentation + line;
            }).join('\n') +
            '}';
    };
    ;
    EC.getExportString = function (node, type, author) {
        switch (type) {
            case 'Userscript':
                return this.getUserscriptString(node, author);
            case 'Userstyle':
                //Turn triggers into @document rules
                if (node.value.launchMode === 0 || node.value.launchMode === 1) {
                    //On clicking
                    return node.value.stylesheet;
                }
                else {
                    return this.generateDocumentRule(node);
                }
            default:
            case 'CRM':
                return this.crmExportNameChange(node, author);
        }
    };
    ;
    EC.exportSingleNode = function (exportNode, exportType) {
        var _this = this;
        var textArea = $('#exportJSONData')[0];
        textArea.value = this.getExportString(exportNode, exportType, null);
        $('#exportAuthorName')[0].value =
            (exportNode.nodeInfo && exportNode.nodeInfo.source && exportNode.nodeInfo.source.author) || 'anonymous';
        $('#exportAuthorName').on('change', function () {
            var author = this.value;
            chrome.storage.local.set({
                authorName: author
            });
            var data;
            data = _this.getExportString(exportNode, exportType, author);
            textArea.value = data;
        });
        $('#exportDialog')[0].open();
        setTimeout(function () {
            textArea.focus();
            textArea.select();
        }, 150);
    };
    ;
    EC.exportGivenNodes = function (exports) {
        var _this = this;
        var safeExports = [];
        for (var i = 0; i < exports.length; i++) {
            safeExports[i] = this.makeNodeSafe(exports[i]);
        }
        var data = {
            crm: safeExports
        };
        var textarea = $('#exportJSONData')[0];
        function authorNameChange(event) {
            var author = event.target.value;
            chrome.storage.local.set({
                authorName: author
            });
            for (var j = 0; j < safeExports.length; j++) {
                _this.changeAuthor(safeExports[j], author);
            }
            var dataJson = JSON.stringify({
                crm: safeExports
            });
            textarea.value = dataJson;
        }
        $('#exportAuthorName').on('change', authorNameChange);
        textarea.value = JSON.stringify(data);
        $('#exportDialog')[0].open();
        setTimeout(function () {
            textarea.focus();
            textarea.select();
        }, 150);
        if (window.app.storageLocal.authorName) {
            authorNameChange({
                target: {
                    value: window.app.storageLocal.authorName
                }
            });
        }
    };
    ;
    EC.exportGivenNodeIDs = function (toExport, exportType) {
        if (exportType === void 0) { exportType = 'CRM'; }
        var exports = [];
        for (var i = 0; i < window.app.settings.crm.length; i++) {
            this.extractUniqueChildren(window.app.settings.crm[i], toExport, exports);
        }
        this.exportGivenNodes(exports);
    };
    ;
    EC.exportSelected = function () {
        var toExport = this.getSelected();
        this.exportGivenNodeIDs(toExport);
    };
    ;
    EC.cancelSelecting = function () {
        var _this = this;
        var editCrmItems = document.getElementsByTagName('edit-crm-item');
        //Select items
        for (var i = 0; i < editCrmItems.length; i++) {
            editCrmItems[i].classList.remove('selecting');
            editCrmItems[i].classList.remove('highlighted');
        }
        setTimeout(function () {
            _this.isSelecting = false;
        }, 150);
    };
    ;
    EC.removeSelected = function () {
        var j;
        var arr;
        var toRemove = this.getSelected();
        for (var i = 0; i < toRemove.length; i++) {
            arr = window.app.crm.lookupId(toRemove[i], true);
            if (!arr) {
                continue;
            }
            for (j = 0; j < arr.length; j++) {
                if (arr[j].id === toRemove[i]) {
                    arr.splice(j, 1);
                }
            }
        }
        window.app.upload();
        this.build(null, true, false);
        this.isSelecting = false;
    };
    ;
    EC.selectItems = function () {
        var _this = this;
        var editCrmItems = document.getElementsByTagName('edit-crm-item');
        //Select items
        for (var i = 0; i < editCrmItems.length; i++) {
            editCrmItems[i].classList.add('selecting');
        }
        setTimeout(function () {
            _this.isSelecting = true;
        }, 150);
    };
    ;
    EC.getCRMElementFromPath = function (path, showPath) {
        if (showPath === void 0) { showPath = false; }
        var i;
        for (i = 0; i < path.length - 1; i++) {
            if (this.setMenus[i] !== path[i]) {
                if (showPath) {
                    this.build(path, false, true);
                    break;
                }
                else {
                    return null;
                }
            }
        }
        var cols = this.$['mainCont'].children;
        var row = cols[path.length + 1].children;
        for (i = 0; i < row.length; i++) {
            if (row[i].tagName === 'PAPER-MATERIAL') {
                row = row[i].children[0].children;
                break;
            }
        }
        for (i = 0; i < row.length; i++) {
            if (window.app.compareArray(row[i].item.path, path)) {
                return row[i];
            }
        }
        return null;
    };
    ;
    EC._typeChanged = function (quick) {
        if (quick === void 0) { quick = false; }
        for (var i = 0; i < 6; i++) {
            window.app.editCRM.classList[(i === window.app.crmType ? 'add' : 'remove')](window.app.pageDemo.getCrmTypeFromNumber(i));
        }
        window.runOrAddAsCallback(window.app.editCRM.build, window.app.editCRM, (quick ? [null, true] : []));
    };
    return EC;
}());
EC.is = 'edit-crm';
/**
 * The currently used timeout for settings the crm
 */
EC.currentTimeout = null;
/**
 * The currently used set menus
 */
EC.setMenus = [];
/**
 * The element used to display drag area
 */
EC.dragAreaEl = null;
/**
 * The coordinates of the location the user started dragging
 *
 * @attribute dragAreaPos
 * @type Object
 * @default null
 */
EC.dragAreaPos = null;
/**
 * The handler for scrolling the body
 *
 * @attribute scrollHandler
 * @type Function
 * @default null
 */
EC.scrollHandler = null;
/**
 * The leftmost CRM column for getting scroll from the left
 */
EC.firstCRMColumnEl = null;
/**
 * A list of selected nodes
 */
EC.selectedElements = [];
/**
 * A list of all the column elements
 */
EC.columns = [];
EC.properties = editCrmProperties;
EC.listeners = {
    'crmTypeChanged': '_typeChanged'
};
Polymer(EC);
