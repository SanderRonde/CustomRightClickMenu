var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var CRMAppElement;
(function (CRMAppElement) {
    window.runOrAddAsCallback = function (toRun, thisElement, params) {
        if (window.app.settings) {
            toRun.apply(thisElement, params);
        }
        else {
            window.app.addSettingsReadyCallback(toRun, thisElement, params);
        }
    };
    (function () {
        var animateExists = !!document.createElement('div').animate;
        var animatePolyFill = function (properties, options) {
            if (!properties[1]) {
                var skippedAnimation = {
                    currentTime: null,
                    play: function () { },
                    reverse: function () { },
                    cancel: function () { },
                    finish: function () { },
                    pause: function () { },
                    updatePlaybackRate: function (_playbackRate) { },
                    addEventListener: function (_type, _listener) { },
                    removeEventListener: function (_type, _listener) { },
                    dispatchEvent: function (_event) { return true; },
                    effect: null,
                    finished: Promise.resolve(skippedAnimation),
                    pending: false,
                    startTime: Date.now(),
                    id: '',
                    ready: Promise.resolve(skippedAnimation),
                    playState: 'finished',
                    playbackRate: 1.0,
                    timeline: {
                        currentTime: Date.now()
                    },
                    oncancel: null,
                    onfinish: null
                };
                return skippedAnimation;
            }
            var element = this;
            var direction = 'forwards';
            var state = {
                isPaused: false,
                currentProgress: 0,
                msRemaining: 0,
                finishedPromise: null,
                finishPromise: null,
                playbackRate: 1.0,
                playState: 'idle',
                iterations: 0
            };
            var returnVal = {
                play: function () {
                    state.playState = 'running';
                    state.iterations++;
                    state.finishedPromise = new Promise(function (resolve) {
                        state.finishPromise = resolve;
                    });
                    var duration = (options && options.duration) || 500;
                    if (state.isPaused) {
                        duration = state.msRemaining;
                    }
                    duration = duration / state.playbackRate;
                    $(element).stop().animate(properties[~~(direction === 'forwards')], {
                        duration: duration,
                        complete: function () {
                            state.playState = 'finished';
                            state.isPaused = false;
                            state.finishPromise && state.finishPromise(returnVal);
                            if (returnVal.onfinish) {
                                returnVal.onfinish.apply(returnVal, {
                                    currentTime: Date.now(),
                                    timelineTime: null
                                });
                            }
                        },
                        progress: function (_animation, progress, remainingMs) {
                            state.currentProgress = progress;
                            state.msRemaining = remainingMs;
                        }
                    });
                    state.isPaused = false;
                },
                reverse: function () {
                    direction = 'backwards';
                    this.play();
                },
                cancel: function () {
                    state.playState = 'idle';
                    $(element).stop();
                    state.isPaused = false;
                    var props = properties[~~(direction !== 'forwards')];
                    for (var prop in props) {
                        element.style[prop] = props[prop];
                    }
                    returnVal.oncancel && returnVal.oncancel.apply(returnVal, {
                        currentTime: Date.now(),
                        timelineTime: null
                    });
                },
                finish: function () {
                    state.isPaused = false;
                    $(element).stop().animate(properties[~~(direction === 'forwards')], {
                        duration: 0,
                        complete: function () {
                            state.playState = 'finished';
                            state.finishPromise && state.finishPromise(returnVal);
                            if (returnVal.onfinish) {
                                returnVal.onfinish.apply(returnVal, {
                                    currentTime: Date.now(),
                                    timelineTime: null
                                });
                            }
                        }
                    });
                },
                pause: function () {
                    state.playState = 'paused';
                    $(element).stop();
                    state.isPaused = true;
                },
                id: '',
                pending: false,
                currentTime: null,
                effect: {
                    getTiming: function () {
                        var duration = ((options && options.duration) || 500) / state.playbackRate;
                        return {
                            delay: 0,
                            direction: direction === 'forwards' ?
                                'normal' : 'reverse',
                            duration: duration,
                            easing: options.easing,
                            fill: options.fill
                        };
                    },
                    updateTiming: function (_timing) {
                    },
                    getComputedTiming: function () {
                        var duration = ((options && options.duration) || 500) / state.playbackRate;
                        return {
                            endTime: duration,
                            activeDuration: duration,
                            localTime: state.playState === 'running' ?
                                duration - state.msRemaining : null,
                            progress: state.playState === 'running' ?
                                state.currentProgress : null,
                            currentIteration: state.playState === 'running' ?
                                state.iterations : null
                        };
                    }
                },
                updatePlaybackRate: function (_playbackRate) { },
                addEventListener: function (_type, _listener) { },
                removeEventListener: function (_type, _listener) { },
                dispatchEvent: function (_event) { return true; },
                timeline: {
                    currentTime: null
                },
                startTime: Date.now(),
                ready: Promise.resolve(returnVal),
                playbackRate: null,
                playState: null,
                finished: null,
                oncancel: null,
                onfinish: null
            };
            Object.defineProperty(returnVal.timeline, 'currentTime', {
                get: function () {
                    return Date.now();
                }
            });
            Object.defineProperties(returnVal, {
                playbackRate: {
                    get: function () {
                        return state.playbackRate;
                    }
                },
                playState: {
                    get: function () {
                        return state.playState;
                    }
                },
                finished: {
                    get: function () {
                        return state.finishedPromise;
                    }
                }
            });
            $(this).animate(properties[1], options.duration, function () {
                if (returnVal.onfinish) {
                    returnVal.onfinish.apply({
                        effect: {
                            target: element
                        }
                    });
                }
            });
            return returnVal;
        };
        if (!animateExists) {
            HTMLElement.prototype.animate = animatePolyFill;
            HTMLElement.prototype.__isAnimationJqueryPolyfill = true;
        }
    })();
    var crmAppProperties = {
        settings: {
            type: Object,
            notify: true
        },
        onSettingsReadyCallbacks: {
            type: Array,
            value: []
        },
        crmTypes: Array,
        settingsJsonLength: {
            type: Number,
            notify: true,
            value: 0
        },
        globalExcludes: {
            type: Array,
            notify: true,
            value: []
        },
        versionUpdateTab: {
            type: Number,
            notify: true,
            value: 0,
            observer: 'versionUpdateChanged'
        }
    };
    var CA = (function () {
        function CA() {
        }
        CA._getRegisteredListener = function (element, eventType) {
            var listeners = this.listeners;
            if (!element || !('getAttribute' in element)) {
                return null;
            }
            return element
                .getAttribute("data-on-" + eventType);
        };
        CA.domListener = function (event) {
            var _this = this;
            var listeners = this.listeners;
            var fnName = window.app.util.iteratePath(event, function (element) {
                return _this._getRegisteredListener(element, event.type);
            });
            if (fnName) {
                if (fnName !== 'prototype' && fnName !== 'parent' && listeners[fnName]) {
                    var listener_1 = this.listeners[fnName];
                    listener_1.bind(listeners)(event, event.detail);
                }
                else {
                    console.warn.apply(console, this._logf("_createEventHandler", "listener method " + fnName + " not defined"));
                }
            }
            else {
                console.warn.apply(console, this._logf("_createEventHandler", "property data-on" + event.type + " not defined"));
            }
        };
        CA.getKeyBindingValue = function (binding) {
            return (window.app.settings &&
                window.app.settings.editor.keyBindings[binding.storageKey]) ||
                binding.defaultKey;
        };
        CA._currentItemIsCss = function (_item) {
            return (this.item && this.item.type === 'stylesheet');
        };
        CA._isDemo = function () {
            return location.href.indexOf('demo') > -1;
        };
        CA._onIsTest = function () {
            return new Promise(function (resolve) {
                if (location.href.indexOf('test') > -1) {
                    resolve(null);
                }
                else {
                    if (window.onIsTest === true) {
                        resolve(null);
                    }
                    else {
                        window.onIsTest = function () {
                            resolve(null);
                        };
                    }
                }
            });
        };
        CA._getPageTitle = function () {
            return this._isDemo() ?
                'Demo, actual right-click menu does NOT work in demo' :
                this.___("generic_appTitle");
        };
        CA._isOldChrome = function () {
            return this.getChromeVersion() < 30;
        };
        CA._getChromeAge = function () {
            return new Date().getUTCFullYear() - 2013;
        };
        CA._getString = function (str) {
            return str || '';
        };
        CA._isOfType = function (option, type) {
            return option.type === type;
        };
        CA.getChromeVersion = function () {
            if (BrowserAPI.getBrowser() === 'chrome') {
                return parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);
            }
            return 1000;
        };
        CA.generateCodeOptionsArray = function (settings) {
            if (!settings || typeof settings === 'string') {
                return [];
            }
            return Object.getOwnPropertyNames(settings).map(function (key) {
                if (key === '$schema') {
                    return null;
                }
                return {
                    key: key,
                    value: JSON.parse(JSON.stringify(settings[key]))
                };
            }).filter(function (item) { return item !== null; }).map(function (_a) {
                var key = _a.key, value = _a.value;
                if (value.type === 'choice') {
                    var choice = value;
                    if (typeof choice.selected !== 'number' ||
                        choice.selected > choice.values.length ||
                        choice.selected < 0) {
                        choice.selected = 0;
                    }
                }
                return {
                    key: key,
                    value: value
                };
            });
        };
        CA._isOnlyGlobalExclude = function () {
            return this.globalExcludes.length === 1;
        };
        ;
        CA._isVersionUpdateTabX = function (currentTab, desiredTab) {
            return currentTab === desiredTab;
        };
        ;
        CA._getUpdatedScriptString = function (updatedScript) {
            if (!updatedScript) {
                return 'Please ignore';
            }
            return this.___("crmApp_code_nodeUpdated", updatedScript.name, updatedScript.oldVersion, updatedScript.newVersion);
        };
        ;
        CA._getPermissionDescription = function () {
            return this.templates.getPermissionDescription;
        };
        ;
        CA._getNodeName = function (nodeId) {
            return window.app.nodesById.get(nodeId).name;
        };
        ;
        CA._getNodeVersion = function (nodeId) {
            return (window.app.nodesById.get(nodeId).nodeInfo &&
                window.app.nodesById.get(nodeId).nodeInfo.version) ||
                '1.0';
        };
        ;
        CA._placeCommas = function (num) {
            var split = this._reverseString(num.toString()).match(/[0-9]{1,3}/g);
            return this._reverseString(split.join(','));
        };
        ;
        CA._supportsStorageSync = function () {
            return 'sync' in BrowserAPI.getSrc().storage &&
                'get' in BrowserAPI.getSrc().storage.sync;
        };
        CA._getCRMInRMDisabledReason = function () {
            return this.___("crmApp_options_chromeLow", ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent) ?
                (~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] + '') :
                this.___("crmApp_options_notChrome"));
        };
        CA._getStorageSyncDisabledReason = function () {
            if (!this._supportsStorageSync()) {
                return this.___("crmApp_options_useStorageSyncDisabledUnavailable");
            }
            else {
                return this.___("crmApp_options_useStorageSyncDisabledTooBig");
            }
        };
        CA._getSettingsJsonLengthColor = function () {
            var red;
            var green;
            if (this.settingsJsonLength <= 51200) {
                green = 255;
                red = (this.settingsJsonLength / 51200) * 255;
            }
            else {
                red = 255;
                green = 255 - (((this.settingsJsonLength - 51200) / 51200) * 255);
            }
            red = Math.floor(red * 0.7);
            green = Math.floor(green * 0.7);
            return 'color: rgb(' + red + ', ' + green + ', 0);';
        };
        ;
        CA._findScriptsInSubtree = function (toFind, container) {
            if (toFind.type === 'script') {
                container.push(toFind);
            }
            else if (toFind.children) {
                for (var i = 0; i < toFind.children.length; i++) {
                    this._findScriptsInSubtree(toFind.children[i], container);
                }
            }
        };
        ;
        CA._runDialogsForImportedScripts = function (nodesToAdd, dialogs) {
            return __awaiter(this, void 0, void 0, function () {
                var script;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!dialogs[0]) return [3, 3];
                            script = dialogs.splice(0, 1)[0];
                            return [4, window.scriptEdit.openPermissionsDialog(script)];
                        case 1:
                            _a.sent();
                            return [4, this._runDialogsForImportedScripts(nodesToAdd, dialogs)];
                        case 2:
                            _a.sent();
                            return [3, 4];
                        case 3:
                            this._addImportedNodes(nodesToAdd);
                            _a.label = 4;
                        case 4: return [2];
                    }
                });
            });
        };
        ;
        CA._addImportedNodes = function (nodesToAdd) {
            var _this = this;
            if (!nodesToAdd[0]) {
                return false;
            }
            var toAdd = nodesToAdd.splice(0, 1)[0];
            this.util.treeForEach(toAdd, function (node) {
                node.id = _this.generateItemId();
                node.nodeInfo.source = 'local';
            });
            this.crm.add(toAdd);
            var scripts = [];
            this._findScriptsInSubtree(toAdd, scripts);
            this._runDialogsForImportedScripts(nodesToAdd, scripts);
            return true;
        };
        ;
        CA._reverseString = function (string) {
            return string.split('').reverse().join('');
        };
        ;
        CA._genRequestPermissionsHandler = function (overlayContainer, toRequest) {
            var _this = this;
            var fn = function () {
                var el, svg;
                var overlay = overlayContainer.overlay;
                overlay.style.maxHeight = 'initial!important';
                overlay.style.top = 'initial!important';
                overlay.removeEventListener('iron-overlay-opened', fn);
                $(window.app.util.getQuerySlot()(overlay, '.requestPermissionsShowBot')).off('click').on('click', function () {
                    el = $(this).parent().parent().children('.requestPermissionsPermissionBotCont')[0];
                    svg = $(this).find('.requestPermissionsSvg')[0];
                    if (svg.__rotated) {
                        window.setTransform(svg, 'rotate(90deg)');
                        svg.rotated = false;
                    }
                    else {
                        window.setTransform(svg, 'rotate(270deg)');
                        svg.rotated = true;
                    }
                    if (el.animation && el.animation.reverse) {
                        el.animation.reverse();
                    }
                    else {
                        el.animation = el.animate([{
                                height: '0'
                            }, {
                                height: el.scrollHeight + 'px'
                            }], {
                            duration: 250,
                            easing: 'linear',
                            fill: 'both'
                        });
                    }
                });
                $(_this.shadowRoot.querySelectorAll('#requestPermissionsShowOther')).off('click').on('click', function () {
                    var showHideSvg = this;
                    var otherPermissions = $(this).parent().parent().parent().children('#requestPermissionsOther')[0];
                    if (!otherPermissions.style.height || otherPermissions.style.height === '0px') {
                        $(otherPermissions).animate({
                            height: otherPermissions.scrollHeight + 'px'
                        }, 350, function () {
                            showHideSvg.children[0].style.display = 'none';
                            showHideSvg.children[1].style.display = 'block';
                        });
                    }
                    else {
                        $(otherPermissions).animate({
                            height: 0
                        }, 350, function () {
                            showHideSvg.children[0].style.display = 'block';
                            showHideSvg.children[1].style.display = 'none';
                        });
                    }
                });
                var permission;
                $(_this.shadowRoot.querySelectorAll('.requestPermissionButton')).off('click').on('click', function () {
                    permission = this.previousElementSibling.previousElementSibling.textContent;
                    var slider = this;
                    if (this.checked) {
                        try {
                            browserAPI.permissions.request({
                                permissions: [permission]
                            }).then(function (accepted) {
                                if (!accepted) {
                                    slider.checked = false;
                                }
                                else {
                                    browserAPI.storage.local.get().then(function (e) {
                                        var permissionsToRequest = e.requestPermissions;
                                        permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
                                        browserAPI.storage.local.set({
                                            requestPermissions: permissionsToRequest
                                        });
                                    });
                                }
                            });
                        }
                        catch (e) {
                            browserAPI.storage.local.get().then(function (e) {
                                var permissionsToRequest = e.requestPermissions;
                                permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
                                browserAPI.storage.local.set({
                                    requestPermissions: permissionsToRequest
                                });
                            });
                        }
                    }
                    else {
                        browserAPI.permissions.remove({
                            permissions: [permission]
                        }).then(function (removed) {
                            if (!removed) {
                                slider.checked = true;
                            }
                        });
                    }
                });
                $(_this.shadowRoot.querySelectorAll('#requestPermissionsAcceptAll')).off('click').on('click', function () {
                    browserAPI.permissions.request({
                        permissions: toRequest
                    }).then(function (accepted) {
                        if (accepted) {
                            browserAPI.storage.local.set({
                                requestPermissions: []
                            });
                            $('.requestPermissionButton.required').each(function () {
                                this.checked = true;
                            });
                        }
                    });
                });
            };
            return fn;
        };
        CA._requestPermissions = function (toRequest, force) {
            if (force === void 0) { force = false; }
            return __awaiter(this, void 0, void 0, function () {
                var i, index, allPermissions, allowed, _a, requested_1, other_1, requestPermissionsOther_1, overlayContainer_1, handler_1, interval_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            allPermissions = this.templates.getPermissions();
                            for (i = 0; i < toRequest.length; i++) {
                                index = allPermissions.indexOf(toRequest[i]);
                                if (index === -1) {
                                    toRequest.splice(index, 1);
                                    i--;
                                }
                                else {
                                    allPermissions.splice(index, 1);
                                }
                            }
                            browserAPI.storage.local.set({
                                requestPermissions: toRequest
                            });
                            if (!(toRequest.length > 0 || force)) return [3, 4];
                            if (!browserAPI.permissions) return [3, 2];
                            return [4, browserAPI.permissions.getAll()];
                        case 1:
                            _a = _b.sent();
                            return [3, 3];
                        case 2:
                            _a = {
                                permissions: []
                            };
                            _b.label = 3;
                        case 3:
                            allowed = _a;
                            requested_1 = [];
                            for (i = 0; i < toRequest.length; i++) {
                                requested_1.push({
                                    name: toRequest[i],
                                    description: this.templates.getPermissionDescription(toRequest[i]),
                                    toggled: false
                                });
                            }
                            other_1 = [];
                            for (i = 0; i < allPermissions.length; i++) {
                                other_1.push({
                                    name: allPermissions[i],
                                    description: this.templates.getPermissionDescription(allPermissions[i]),
                                    toggled: (allowed.permissions.indexOf(allPermissions[i]) > -1)
                                });
                            }
                            requestPermissionsOther_1 = this.$$('#requestPermissionsOther');
                            overlayContainer_1 = {
                                overlay: null
                            };
                            handler_1 = this._genRequestPermissionsHandler(overlayContainer_1, toRequest);
                            interval_1 = window.setInterval(function () {
                                try {
                                    var centerer = window.doc.requestPermissionsCenterer;
                                    var overlay_1 = overlayContainer_1.overlay =
                                        window.app.util.getQuerySlot()(centerer)[0];
                                    if (overlay_1.open) {
                                        window.clearInterval(interval_1);
                                        var innerOverlay_1 = window.app.util.getQuerySlot()(overlay_1)[0];
                                        window.app.$.requestedPermissionsTemplate.items = requested_1;
                                        window.app.$.requestedPermissionsOtherTemplate.items = other_1;
                                        overlay_1.addEventListener('iron-overlay-opened', handler_1);
                                        setTimeout(function () {
                                            var requestedPermissionsCont = innerOverlay_1.querySelector('#requestedPermissionsCont');
                                            var requestedPermissionsAcceptAll = innerOverlay_1.querySelector('#requestPermissionsAcceptAll');
                                            var requestedPermissionsType = innerOverlay_1.querySelector('.requestPermissionsType');
                                            if (requested_1.length === 0) {
                                                requestedPermissionsCont.style.display = 'none';
                                                requestPermissionsOther_1.style.height = (31 * other_1.length) + 'px';
                                                requestedPermissionsAcceptAll.style.display = 'none';
                                                requestedPermissionsType.style.display = 'none';
                                            }
                                            else {
                                                requestedPermissionsCont.style.display = 'block';
                                                requestPermissionsOther_1.style.height = '0';
                                                requestedPermissionsAcceptAll.style.display = 'block';
                                                requestedPermissionsType.style.display = 'block';
                                            }
                                            overlay_1.open();
                                        }, 0);
                                    }
                                }
                                catch (e) {
                                }
                            }, 100);
                            _b.label = 4;
                        case 4: return [2];
                    }
                });
            });
        };
        ;
        CA._transferCRMFromOld = function (openInNewTab, storageSource, method) {
            if (storageSource === void 0) { storageSource = localStorage; }
            if (method === void 0) { method = 2; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this._transferFromOld.transferCRMFromOld(openInNewTab, storageSource, method)];
                        case 1: return [2, _a.sent()];
                    }
                });
            });
        };
        ;
        CA.initCodeOptions = function (node) {
            var _this = this;
            this.$.codeSettingsDialog.item = node;
            this.$.codeSettingsNodeName.innerText = node.name;
            this.$.codeSettingsRepeat.items = this.generateCodeOptionsArray(node.value.options);
            this.$.codeSettingsNoItems["if"] = this.$.codeSettingsRepeat.items.length === 0;
            this.$.codeSettingsRepeat.render();
            this.async(function () {
                _this.$.codeSettingsDialog.fit();
                Array.prototype.slice.apply(_this.$.codeSettingsDialog.querySelectorAll('paper-dropdown-menu'))
                    .forEach(function (el) {
                    el.init();
                    el.updateSelectedContent();
                });
                _this.$.codeSettingsDialog.open();
            }, 250);
        };
        CA.versionUpdateChanged = function () {
            return __awaiter(this, void 0, void 0, function () {
                var versionUpdateDialog, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this._isVersionUpdateTabX(this.versionUpdateTab, 1)) return [3, 2];
                            versionUpdateDialog = this.$.versionUpdateDialog;
                            if (!!versionUpdateDialog.editorManager) return [3, 2];
                            _a = versionUpdateDialog;
                            return [4, this.$.tryOutEditor.create(this.$.tryOutEditor.EditorMode.JS, {
                                    value: '//some javascript code\nvar body = document.getElementById(\'body\');\nbody.style.color = \'red\';\n\n',
                                    language: 'javascript',
                                    theme: window.app.settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
                                    wordWrap: 'off',
                                    fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
                                    folding: true
                                })];
                        case 1:
                            _a.editorManager = _b.sent();
                            _b.label = 2;
                        case 2: return [2];
                    }
                });
            });
        };
        ;
        CA.generateItemId = function () {
            this._latestId = this._latestId || 0;
            this._latestId++;
            if (this.settings) {
                this.settings.latestId = this._latestId;
                window.app.upload();
            }
            return this._latestId;
        };
        ;
        CA.toggleShrinkTitleRibbon = function () {
            var viewportHeight = window.innerHeight;
            var $settingsCont = $(this.$$('#settingsContainer'));
            if (window.app.storageLocal.shrinkTitleRibbon) {
                $(window.doc.editorTitleRibbon).animate({
                    fontSize: '100%'
                }, 250);
                $(window.doc.editorCurrentScriptTitle).animate({
                    paddingTop: '4px',
                    paddingBottom: '4px'
                }, 250);
                $settingsCont.animate({
                    height: viewportHeight - 50
                }, 250, function () {
                    window.addCalcFn($settingsCont[0], 'height', '100vh - 66px');
                });
                window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(270deg)');
                window.doc.showHideToolsRibbonButton.classList.add('hidden');
            }
            else {
                $(window.doc.editorTitleRibbon).animate({
                    fontSize: '40%'
                }, 250);
                $(window.doc.editorCurrentScriptTitle).animate({
                    paddingTop: 0,
                    paddingBottom: 0
                }, 250);
                $settingsCont.animate({
                    height: viewportHeight - 18
                }, 250, function () {
                    window.addCalcFn($settingsCont[0], 'height', '100vh - -29px');
                });
                window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(90deg)');
                window.doc.showHideToolsRibbonButton.classList.remove('hidden');
            }
            window.app.storageLocal.shrinkTitleRibbon = !window.app.storageLocal.shrinkTitleRibbon;
            browserAPI.storage.local.set({
                shrinkTitleRibbon: window.app.storageLocal.shrinkTitleRibbon
            });
        };
        ;
        CA.addSettingsReadyCallback = function (callback, thisElement, params) {
            this.onSettingsReadyCallbacks.push({
                callback: callback,
                thisElement: thisElement,
                params: params
            });
        };
        ;
        CA.upload = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            this.uploading.upload(force);
            (function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, window.onExistsChain(window, 'app', 'settings', 'crm')];
                        case 1:
                            _a.sent();
                            this.updateCrmRepresentation(window.app.settings.crm);
                            return [2];
                    }
                });
            }); })();
        };
        CA.updateEditorZoom = function () {
            var prevStyle = document.getElementById('editorZoomStyle');
            prevStyle && prevStyle.remove();
            var styleEl = document.createElement('style');
            styleEl.id = 'editorZoomStyle';
            styleEl.innerText = ".CodeMirror, .CodeMirror-focused {\n\t\t\t\tfont-size: " + 1.25 * ~~window.app.settings.editor.zoom + "%!important;\n\t\t\t}";
            document.head.appendChild(styleEl);
        };
        ;
        CA._assertCRMNodeShape = function (node) {
            var changed = false;
            if (node.type !== 'menu') {
                return false;
            }
            if (!node.children) {
                node.children = [];
                changed = true;
            }
            for (var i = node.children.length - 1; i >= 0; i--) {
                if (!node.children[i]) {
                    node.children.splice(i, 1);
                    changed = true;
                }
            }
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var child = _a[_i];
                changed = this._assertCRMNodeShape(child) || changed;
            }
            return changed;
        };
        CA._assertCRMShape = function (crm) {
            var changed = false;
            for (var i = 0; i < crm.length; i++) {
                changed = this._assertCRMNodeShape(crm[i]) || changed;
            }
            if (changed) {
                window.app.upload();
            }
        };
        CA.updateCrmRepresentation = function (crm) {
            this._assertCRMShape(crm);
            this._setup.orderNodesById(crm);
            this.crm.buildNodePaths(crm);
        };
        CA.setLocal = function (key, value) {
            var _this = this;
            var _a;
            var obj = (_a = {},
                _a[key] = value,
                _a);
            browserAPI.storage.local.set(obj);
            browserAPI.storage.local.get().then(function (storageLocal) {
                _this.storageLocal = storageLocal;
                _this.upload();
                if (key === 'CRMOnPage' || key === 'editCRMInRM') {
                    window.doc.editCRMInRM.setCheckboxDisabledValue &&
                        window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal.CRMOnPage);
                    _this.pageDemo.create();
                }
            });
        };
        ;
        CA.refreshPage = function () {
            return __awaiter(this, void 0, void 0, function () {
                var dialog, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (window.app.item) {
                                dialog = window[window.app.item.type + 'Edit'];
                                dialog && dialog.cancel();
                            }
                            window.app.item = null;
                            window.app.settings = window.app.storageLocal = null;
                            window.app._settingsCopy = window.app._storageLocalCopy = null;
                            if (!window.Storages) return [3, 2];
                            window.Storages.clearStorages();
                            return [4, window.Storages.loadStorages()];
                        case 1:
                            _b.sent();
                            return [3, 4];
                        case 2: return [4, browserAPI.runtime.sendMessage({
                                type: '_resetSettings'
                            })];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4: return [4, this._setup.setupStorages()];
                        case 5:
                            _b.sent();
                            this._setup.initCheckboxes(window.app.storageLocal);
                            Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('default-link')).forEach(function (link) {
                                link.reset();
                            });
                            window.doc.URISchemeFilePath.value = 'C:\\files\\my_file.exe';
                            _a = window.doc.URISchemeSchemeName;
                            return [4, this.__async("crmApp_uriScheme_example")];
                        case 6:
                            _a.value = _b.sent();
                            Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('paper-dialog')).forEach(function (dialog) {
                                dialog.opened && dialog.close();
                            });
                            this.upload(true);
                            return [4, window.onExistsChain(window, 'app', 'settings', 'crm')];
                        case 7:
                            _b.sent();
                            return [2];
                    }
                });
            });
        };
        ;
        CA._codeStr = function (code) {
            return {
                content: code,
                isCode: true
            };
        };
        CA._logCode = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var currentWord = '';
            var logArgs = [];
            var styleArgs = [];
            var isEdge = BrowserAPI.getBrowser() === 'edge';
            for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
                var arg = args_1[_a];
                if (typeof arg === 'string') {
                    currentWord += arg;
                }
                else {
                    var content = arg.content;
                    if (isEdge) {
                        currentWord += arg;
                    }
                    else {
                        logArgs.push(currentWord + "%c" + content);
                        styleArgs.push('color: grey;font-weight: bold;');
                        currentWord = '%c';
                        styleArgs.push('color: white; font-weight: regular');
                    }
                }
            }
            if (currentWord.length > 0) {
                logArgs.push(currentWord);
            }
            console.log.apply(console, [logArgs.join(' ')].concat(styleArgs));
        };
        CA._getDotValue = function (source, index) {
            var indexes = index.split('.');
            var currentValue = source;
            for (var i = 0; i < indexes.length; i++) {
                if (indexes[i] in currentValue) {
                    currentValue = currentValue[indexes[i]];
                }
                else {
                    return undefined;
                }
            }
            return currentValue;
        };
        CA.dependencyMet = function (data, optionals) {
            if (data.dependency && !optionals[data.dependency]) {
                optionals[data.val] = false;
                return false;
            }
            return true;
        };
        CA._isDefined = function (data, value, optionals, errors) {
            if (value === undefined || value === null) {
                if (data.optional) {
                    optionals[data.val] = false;
                    return 'continue';
                }
                else {
                    errors.push({
                        err: "Value for " + data.val + " is not set"
                    });
                    return false;
                }
            }
            return true;
        };
        CA._typesMatch = function (data, value, errors) {
            var types = Array.isArray(data.type) ? data.type : [data.type];
            for (var i = 0; i < types.length; i++) {
                var type = types[i];
                if (type === 'array') {
                    if (typeof value === 'object' && Array.isArray(value)) {
                        return type;
                    }
                }
                if (typeof value === type) {
                    return type;
                }
            }
            errors.push({
                err: "Value for " + data.val + " is not of type " + types.join(' or ')
            });
            return null;
        };
        CA._checkNumberConstraints = function (data, value, errors) {
            if (data.min !== undefined) {
                if (data.min > value) {
                    errors.push({
                        err: "Value for " + data.val + " is smaller than " + data.min
                    });
                    return false;
                }
            }
            if (data.max !== undefined) {
                if (data.max < value) {
                    errors.push({
                        err: "Value for " + data.val + " is bigger than " + data.max
                    });
                    return false;
                }
            }
            return true;
        };
        CA._checkArrayChildType = function (data, value, forChild, errors) {
            var types = Array.isArray(forChild.type) ? forChild.type : [forChild.type];
            for (var i = 0; i < types.length; i++) {
                var type = types[i];
                if (type === 'array') {
                    if (Array.isArray(value)) {
                        return true;
                    }
                }
                else if (typeof value === type) {
                    return true;
                }
            }
            errors.push({
                err: "For not all values in the array " + data.val + " is the property " + forChild.val + " of type " + types.join(' or ')
            });
            return false;
        };
        CA._checkArrayChildrenConstraints = function (data, value, errors) {
            for (var i = 0; i < value.length; i++) {
                for (var j = 0; j < data.forChildren.length; j++) {
                    var forChild = data.forChildren[j];
                    var childValue = value[i][forChild.val];
                    if (childValue === undefined || childValue === null) {
                        if (!forChild.optional) {
                            errors.push({
                                err: "For not all values in the array " + data.val + " is the property " + forChild.val + " defined"
                            });
                            return false;
                        }
                    }
                    else if (!this._checkArrayChildType(data, childValue, forChild, errors)) {
                        return false;
                    }
                }
            }
            return true;
        };
        CA._checkConstraints = function (data, value, errors) {
            if (typeof value === 'number') {
                return this._checkNumberConstraints(data, value, errors);
            }
            if (Array.isArray(value) && data.forChildren) {
                return this._checkArrayChildrenConstraints(data, value, errors);
            }
            return true;
        };
        CA.typeCheck = function (source, toCheck, errors) {
            var optionals = {};
            for (var i = 0; i < toCheck.length; i++) {
                var config = toCheck[i];
                if (!this.dependencyMet(config, optionals)) {
                    continue;
                }
                var value = this._getDotValue(source, config.val);
                var isDefined = this._isDefined(config, value, optionals, errors);
                if (isDefined === true) {
                    var matchedType = this._typesMatch(config, value, errors);
                    if (matchedType) {
                        optionals[config.val] = true;
                        this._checkConstraints(config, value, errors);
                        continue;
                    }
                }
                else if (isDefined === 'continue') {
                    continue;
                }
                return false;
            }
            return true;
        };
        ;
        CA._checkLocalFormat = function () {
            var storage = window.app.storageLocal;
            var errors = [];
            this.typeCheck(storage, [{
                    val: 'libraries',
                    type: 'array',
                    forChildren: [{
                            val: 'code',
                            type: 'string'
                        }, {
                            val: 'name',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'url',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'ts',
                            type: 'object'
                        }]
                }, {
                    val: 'requestPermissions',
                    type: 'array'
                }, {
                    val: 'selectedCrmType',
                    type: 'array'
                }, {
                    val: 'jsLintGlobals',
                    type: 'array'
                }, {
                    val: 'globalExcludes',
                    type: 'array'
                }, {
                    val: 'resources',
                    type: 'object'
                }, {
                    val: 'nodeStorage',
                    type: 'object'
                }, {
                    val: 'resourceKeys',
                    type: 'array'
                }, {
                    val: 'urlDataPairs',
                    type: 'object'
                }, {
                    val: 'notFirstTime',
                    type: 'boolean'
                }, {
                    val: 'lastUpdatedAt',
                    type: 'string'
                }, {
                    val: 'authorName',
                    type: 'string'
                }, {
                    val: 'recoverUnsavedData',
                    type: 'boolean'
                }, {
                    val: 'CRMOnPage',
                    type: 'boolean'
                }, {
                    val: 'editCRMInRM',
                    type: 'boolean'
                }, {
                    val: 'useAsUserscriptInstaller',
                    type: 'boolean'
                }, {
                    val: "useAsUserstylesInstaller",
                    type: "boolean"
                }, {
                    val: 'hideToolsRibbon',
                    type: 'boolean'
                }, {
                    val: 'shrinkTitleRibbon',
                    type: 'boolean'
                }, {
                    val: 'showOptions',
                    type: 'boolean'
                }, {
                    val: 'catchErrors',
                    type: 'boolean'
                }, {
                    val: 'useStorageSync',
                    type: 'boolean'
                }, {
                    val: 'settingsVersionData',
                    type: 'object'
                }, {
                    val: 'addedPermissions',
                    type: 'array',
                    forChildren: [{
                            val: 'node',
                            type: ''
                        }, {
                            val: 'permissions',
                            type: 'array'
                        }]
                }, {
                    val: 'updatedScripts',
                    type: 'array',
                    forChildren: [{
                            val: 'name',
                            type: 'string'
                        }, {
                            val: 'oldVersion',
                            type: 'string'
                        }, {
                            val: 'newVersion',
                            type: 'string'
                        }]
                }, {
                    val: 'isTransfer',
                    type: 'boolean'
                }, {
                    val: 'upgradeErrors',
                    type: 'object',
                    optional: true
                }], errors);
            return errors;
        };
        CA._checkSyncFormat = function () {
            var storage = window.app.settings;
            var errors = [];
            this.typeCheck(storage, [{
                    val: 'errors',
                    type: 'object'
                }, {
                    val: 'settingsLastUpdatedAt',
                    type: ''
                }, {
                    val: 'crm',
                    type: 'array',
                    forChildren: [{
                            val: 'type',
                            type: 'string'
                        }, {
                            val: 'index',
                            type: '',
                            optional: true
                        }, {
                            val: 'isLocal',
                            type: 'boolean'
                        }, {
                            val: 'permissions',
                            type: 'array'
                        }, {
                            val: 'id',
                            type: ''
                        }, {
                            val: 'path',
                            type: 'array'
                        }, {
                            val: 'name',
                            type: 'string'
                        }, {
                            val: 'nodeInfo',
                            type: 'object'
                        }, {
                            val: 'triggers',
                            type: 'array'
                        }, {
                            val: 'onContentTypes',
                            type: 'array'
                        }, {
                            val: 'showOnSpecified',
                            type: 'boolean'
                        }]
                }, {
                    val: 'latestId',
                    type: ''
                }, {
                    val: 'rootName',
                    type: 'string'
                }, {
                    val: 'nodeStorageSync',
                    type: 'object'
                }, {
                    val: 'editor',
                    type: 'object'
                }, {
                    val: 'editor.theme',
                    type: 'string'
                }, {
                    val: 'editor.zoom',
                    type: 'string'
                }, {
                    val: 'editor.keyBindings',
                    type: 'object'
                }, {
                    val: 'editor.keyBindings.goToDef',
                    type: 'string'
                }, {
                    val: 'editor.keyBindings.rename',
                    type: 'string'
                }, {
                    val: 'editor.cssUnderlineDisabled',
                    type: 'boolean'
                }, {
                    val: 'editor.disabledMetaDataHighlight',
                    type: 'boolean'
                }], errors);
            return errors;
        };
        CA._checkFormat = function () {
            var errors = [];
            errors = this._checkLocalFormat().map(function (err) {
                err.storageType = 'local';
                return err;
            });
            errors = errors.concat(this._checkSyncFormat().map(function (err) {
                err.storageType = 'sync';
                return err;
            }));
            return errors;
        };
        CA._setupConsoleInterface = function () {
            var _this = this;
            window.consoleInfo = function () {
                _this._logCode('Edit local (not synchronized with your google account) settings as follows:');
                _this._logCode('	', _this._codeStr('window.app.storageLocal.<setting> = <value>;'));
                _this._logCode('	For example: ', _this._codeStr('window.app.storageLocal.hideToolsRibbon = false;'));
                _this._logCode('	To get the type formatting of local settings call ', _this._codeStr('window.getLocalFormat();'));
                _this._logCode('	To read the current settings just call ', _this._codeStr('window.app.storageLocal;'));
                _this._logCode('');
                _this._logCode('Edit synchronized settings as follows:');
                _this._logCode('	', _this._codeStr('window.app.settings.<setting> = <value>'));
                _this._logCode('	For example: ', _this._codeStr('window.app.settings.rootName = "ROOT";'));
                _this._logCode('	Or: ', _this._codeStr('window.app.settings.editor.theme = "white";'));
                _this._logCode('	To get the type formatting of local settings call ', _this._codeStr('window.getSyncFormat();'));
                _this._logCode('	To read the current settings just call ', _this._codeStr('window.app.settings;'));
                _this._logCode('');
                _this._logCode('Edit the CRM as follows:');
                _this._logCode('	', _this._codeStr('window.app.settings.crm[<index>].<property> = <value>'));
                _this._logCode('	For example: ', _this._codeStr('window.app.settings.crm[0].name = "MyName";'));
                _this._logCode('	To find the index either call ', _this._codeStr('window.app.settings.crm;'), ' or ', _this._codeStr('window.getIndexByName("<name>");'));
                _this._logCode('	To get the type formatting of a CRM node call ', _this._codeStr('window.getCRMFormat();'));
                _this._logCode('');
                _this._logCode('To force upload any changes you made call ', _this._codeStr('window.upload();'));
                _this._logCode('To look at the changes that were made call ', _this._codeStr('window.getChanges();'));
                _this._logCode('To check the format of your changes call ', _this._codeStr('window.checkFormat();'));
                _this._logCode('To upload changes you made if the format is correct call ', _this._codeStr('window.uploadIfCorrect();'));
            };
            window.getLocalFormat = function () {
                _this._logCode('Format can be found here https://github.com/SanderRonde/CustomRightClickMenu/blob/polymer-2/tools/definitions/crm.d.ts#L1148');
            };
            window.getSyncFormat = function () {
                _this._logCode('Format can be found here https://github.com/SanderRonde/CustomRightClickMenu/blob/polymer-2/tools/definitions/crm.d.ts#L1091');
            };
            window.getCRMFormat = function () {
                _this._logCode('Format can be found here https://github.com/SanderRonde/CustomRightClickMenu/blob/polymer-2/tools/definitions/crm.d.ts#L1103');
            };
            window.upload = window.app.upload;
            window.getChanges = function () {
                _this._logCode('Here are the changes that have been made. Keep in mind that this includes unuploaded changes the extension made.');
                _this._logCode('');
                var _a = _this.uploading.getChanges(false), hasLocalChanged = _a.hasLocalChanged, haveSettingsChanged = _a.haveSettingsChanged, localChanges = _a.localChanges, settingsChanges = _a.settingsChanges;
                if (!hasLocalChanged) {
                    _this._logCode('No changes to local storage were made');
                }
                else {
                    _this._logCode('The following changes to local storage were made');
                    for (var _i = 0, localChanges_1 = localChanges; _i < localChanges_1.length; _i++) {
                        var change = localChanges_1[_i];
                        _this._logCode('Key ', _this._codeStr(change.key), ' had value ', _this._codeStr(change.oldValue), ' and was changed to ', _this._codeStr(change.newValue));
                    }
                }
                _this._logCode('');
                if (!haveSettingsChanged) {
                    _this._logCode('No changes to synced storage were made');
                }
                else {
                    _this._logCode('The following changes to synced storage were made');
                    for (var _b = 0, settingsChanges_1 = settingsChanges; _b < settingsChanges_1.length; _b++) {
                        var change = settingsChanges_1[_b];
                        _this._logCode('Key ', _this._codeStr(change.key), ' had value ', _this._codeStr(change.oldValue), ' and was changed to ', _this._codeStr(change.newValue));
                    }
                }
            };
            window.checkFormat = function () {
                var errors = _this._checkFormat();
                if (errors.length === 0) {
                    _this._logCode('Format is correct!');
                }
                else {
                    for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
                        var err = errors_1[_i];
                        _this._logCode('Storage type: ', err.storageType, _this._codeStr(err.err));
                    }
                }
            };
            window.uploadIfCorrect = function () {
                if (_this._checkFormat().length === 0) {
                    window.app.upload();
                    _this._logCode('Successfully uploaded');
                }
                else {
                    _this._logCode('Did not upload because errors were found.');
                }
            };
        };
        CA.ready = function () {
            var _this = this;
            window.app = this;
            window.doc = window.app.$;
            this._setupConsoleInterface();
            browserAPI.runtime.onInstalled.addListener(function (details) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (!(details.reason === 'update')) return [3, 2];
                            _a = this.$.messageToast;
                            _b = this.___;
                            _c = ["crmApp_code_extensionUpdated"];
                            return [4, browserAPI.runtime.getManifest()];
                        case 1:
                            _a.text = _b.apply(this, _c.concat([(_d.sent()).version]));
                            this.$.messageToast.show();
                            _d.label = 2;
                        case 2: return [2];
                    }
                });
            }); });
            if (typeof localStorage === 'undefined') {
                browserAPI.runtime.onMessage.addListener(function (message, _sender, respond) {
                    if (message.type === 'idUpdate') {
                        _this._latestId = message.latestId;
                    }
                    respond(null);
                });
            }
            var controlPresses = 0;
            document.body.addEventListener('keyup', function (event) {
                if (event.key === 'Control') {
                    controlPresses++;
                    window.setTimeout(function () {
                        if (controlPresses >= 3) {
                            _this.listeners._toggleBugReportingTool();
                            controlPresses = 0;
                        }
                        else {
                            if (controlPresses > 0) {
                                controlPresses--;
                            }
                        }
                    }, 800);
                }
            });
            this._setup.setupLoadingBar().then(function () {
                _this._setup.setupStorages();
            });
            if (this._onIsTest()) {
                var dummyContainer = window.dummyContainer = document.createElement('div');
                dummyContainer.id = 'dummyContainer';
                dummyContainer.style.width = '100vw';
                dummyContainer.style.position = 'fixed';
                dummyContainer.style.top = '0';
                dummyContainer.style.zIndex = '999999999';
                dummyContainer.style.display = 'flex';
                dummyContainer.style.flexDirection = 'row';
                dummyContainer.style.justifyContent = 'space-between';
                document.body.appendChild(dummyContainer);
                var node = document.createElement('style');
                node.innerHTML = '#dummyContainer > * {\n' +
                    '	background-color: blue;\n' +
                    '}';
                document.head.appendChild(node);
            }
            this.show = false;
        };
        ;
        var _a, _b, _c, _d, _e;
        CA.is = 'crm-app';
        CA._log = [];
        CA.show = false;
        CA.item = null;
        CA._latestId = -1;
        CA.nodesById = new window.Map();
        CA.jsLintGlobals = [];
        CA.monacoStyleElement = null;
        CA.properties = crmAppProperties;
        CA._TernFile = (function () {
            function TernFile(name) {
                this.name = name;
            }
            return TernFile;
        }());
        CA._transferFromOld = (function () {
            function CRMAppTransferFromOld() {
            }
            CRMAppTransferFromOld._backupLocalStorage = function () {
                if (typeof localStorage === 'undefined' ||
                    (typeof window.indexedDB === 'undefined' && typeof window.webkitIndexedDB === 'undefined')) {
                    return;
                }
                var data = JSON.stringify(localStorage);
                var idb = window.indexedDB || window.webkitIndexedDB;
                var req = idb.open('localStorageBackup', 1);
                req.onerror = function () { console.log('Error backing up localStorage data'); };
                req.onupgradeneeded = function (event) {
                    var db = event.target.result;
                    var objectStore = db.createObjectStore('data', {
                        keyPath: 'id'
                    });
                    objectStore.add({
                        id: 0,
                        data: data
                    });
                };
            };
            CRMAppTransferFromOld._parseOldCRMNode = function (string, openInNewTab, method) {
                var node = {};
                var oldNodeSplit = string.split('%123');
                var name = oldNodeSplit[0];
                var type = oldNodeSplit[1].toLowerCase();
                var nodeData = oldNodeSplit[2];
                switch (type) {
                    case 'link':
                        var split = void 0;
                        if (nodeData.indexOf(', ') > -1) {
                            split = nodeData.split(', ');
                        }
                        else {
                            split = nodeData.split(',');
                        }
                        node = this.parent().templates.getDefaultLinkNode({
                            name: name,
                            id: this.parent().generateItemId(),
                            value: split.map(function (url) {
                                return {
                                    newTab: openInNewTab,
                                    url: url
                                };
                            })
                        });
                        break;
                    case 'divider':
                        node = this.parent().templates.getDefaultDividerNode({
                            name: name,
                            id: this.parent().generateItemId()
                        });
                        break;
                    case 'menu':
                        node = this.parent().templates.getDefaultMenuNode({
                            name: name,
                            id: this.parent().generateItemId(),
                            children: nodeData
                        });
                        break;
                    case 'script':
                        var scriptSplit = nodeData.split('%124');
                        var scriptLaunchMode = scriptSplit[0];
                        var scriptData = scriptSplit[1];
                        var triggers = void 0;
                        var launchModeString = scriptLaunchMode + '';
                        if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
                            triggers = launchModeString.split('1,')[1].split(',');
                            triggers = triggers.map(function (item) {
                                return {
                                    not: false,
                                    url: item.trim()
                                };
                            }).filter(function (item) {
                                return item.url !== '';
                            });
                            scriptLaunchMode = '2';
                        }
                        var id = this.parent().generateItemId();
                        node = this.parent().templates.getDefaultScriptNode({
                            name: name,
                            id: id,
                            triggers: triggers || [],
                            value: {
                                launchMode: parseInt(scriptLaunchMode, 10),
                                updateNotice: true,
                                oldScript: scriptData,
                                script: this.parent().legacyScriptReplace.convertScriptFromLegacy(scriptData, id, method)
                            }
                        });
                        break;
                }
                return node;
            };
            ;
            CRMAppTransferFromOld._assignParents = function (parent, nodes, index, amount) {
                for (; amount !== 0 && nodes[index.index]; index.index++, amount--) {
                    var currentNode = nodes[index.index];
                    if (currentNode.type === 'menu') {
                        var childrenAmount = ~~currentNode.children;
                        currentNode.children = [];
                        index.index++;
                        this._assignParents(currentNode.children, nodes, index, childrenAmount);
                        index.index--;
                    }
                    parent.push(currentNode);
                }
            };
            ;
            CRMAppTransferFromOld._chainPromise = function (promiseInitializers, index) {
                var _this = this;
                if (index === void 0) { index = 0; }
                return new Promise(function (resolve, reject) {
                    promiseInitializers[index]().then(function (value) {
                        if (index + 1 >= promiseInitializers.length) {
                            resolve(value);
                        }
                        else {
                            _this._chainPromise(promiseInitializers, index + 1).then(function (value) {
                                resolve(value);
                            }, function (err) {
                                reject(err);
                            });
                        }
                    }, function (err) {
                        reject(err);
                    });
                });
            };
            CRMAppTransferFromOld._execFile = function (path) {
                return __awaiter(this, void 0, void 0, function () {
                    var el;
                    return __generator(this, function (_a) {
                        el = document.createElement('script');
                        el.src = browserAPI.runtime.getURL(browserAPI.runtime.getURL(path));
                        document.body.appendChild(el);
                        return [2];
                    });
                });
            };
            CRMAppTransferFromOld._loadTernFiles = function () {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    var files = [
                        '/js/libraries/tern/walk.js',
                        '/js/libraries/tern/signal.js',
                        '/js/libraries/tern/acorn.js',
                        '/js/libraries/tern/tern.js',
                        '/js/libraries/tern/ternserver.js',
                        '/js/libraries/tern/def.js',
                        '/js/libraries/tern/comment.js',
                        '/js/libraries/tern/infer.js'
                    ];
                    _this._chainPromise(files.map(function (file) {
                        return function () {
                            return _this._execFile(file);
                        };
                    })).then(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, window.onExists('tern', window)];
                                case 1:
                                    _a.sent();
                                    resolve(null);
                                    return [2];
                            }
                        });
                    }); }, function (err) {
                        reject(err);
                    });
                });
            };
            CRMAppTransferFromOld.transferCRMFromOld = function (openInNewTab, storageSource, method) {
                return __awaiter(this, void 0, void 0, function () {
                    var i, amount, nodes, crm;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this._backupLocalStorage();
                                return [4, this._loadTernFiles()];
                            case 1:
                                _a.sent();
                                amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;
                                nodes = [];
                                for (i = 1; i < amount; i++) {
                                    nodes.push(this._parseOldCRMNode(storageSource.getItem(i), openInNewTab, method));
                                }
                                crm = [];
                                this._assignParents(crm, nodes, {
                                    index: 0
                                }, nodes.length);
                                return [2, crm];
                        }
                    });
                });
            };
            ;
            CRMAppTransferFromOld.parent = function () {
                return window.app;
            };
            return CRMAppTransferFromOld;
        }());
        CA._setup = (_a = (function () {
                function CRMAppSetup() {
                }
                CRMAppSetup._restoreUnsavedInstances = function (editingObj) {
                    return __awaiter(this, void 0, void 0, function () {
                        var crmItem, code, isTs, stopHighlighting, path, highlightItem, editor;
                        var _this = this;
                        return __generator(this, function (_a) {
                            crmItem = this.parent().nodesById.get(editingObj.id);
                            code = (crmItem.type === 'script' ? (editingObj.mode === 'main' ?
                                crmItem.value.script : crmItem.value.backgroundScript) :
                                (crmItem.value.stylesheet));
                            this.parent().listeners.iconSwitch(null, editingObj.crmType);
                            this.parent().$.keepChangesButton.addEventListener('click', function () {
                                window.app.uploading.createRevertPoint();
                                if (crmItem.type === 'script') {
                                    crmItem.value[(editingObj.mode === 'main' ?
                                        'script' : 'backgroundScript')] = editingObj.val;
                                }
                                else {
                                    crmItem.value.stylesheet = editingObj.val;
                                }
                                window.app.upload();
                                browserAPI.storage.local.set({
                                    editing: null
                                });
                                window.setTimeout(function () {
                                    editor.destroy();
                                }, 500);
                            });
                            this.parent().$.discardButton.addEventListener('click', function () {
                                browserAPI.storage.local.set({
                                    editing: null
                                });
                                window.setTimeout(function () {
                                    editor.destroy();
                                }, 500);
                            });
                            isTs = crmItem.type === 'script' &&
                                crmItem.value.ts && crmItem.value.ts.enabled;
                            stopHighlighting = function (element) {
                                var item = element.$$('.item');
                                item.animate([
                                    {
                                        opacity: '1'
                                    }, {
                                        opacity: '0.6'
                                    }
                                ], {
                                    duration: 250,
                                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                                }).onfinish = function () {
                                    item.style.opacity = '0.6';
                                    $(_this.parent().$$('.pageCont')).animate({
                                        backgroundColor: 'white'
                                    }, 200);
                                    Array.prototype.slice.apply(_this.parent().shadowRoot.querySelectorAll('.crmType')).forEach(function (crmType) {
                                        crmType.classList.add('dim');
                                    });
                                    var editCrmItems = window.app.editCRM.getItems();
                                    editCrmItems.forEach(function (el) {
                                        el.$$('.item').animate([{
                                                opacity: '0'
                                            }, {
                                                opacity: '1'
                                            }], {
                                            duration: 200
                                        }).onfinish = function () {
                                            document.body.style.pointerEvents = 'all';
                                        };
                                    });
                                    window.setTimeout(function () {
                                        window.doc.restoreChangesDialog.style.display = 'block';
                                    }, 200);
                                };
                            };
                            path = this.parent().nodesById.get(editingObj.id).path;
                            highlightItem = function () {
                                document.body.style.pointerEvents = 'none';
                                var columnConts = _this.parent().editCRM.$.CRMEditColumnsContainer.children;
                                var columnCont = columnConts[(path.length - 1)];
                                var paperMaterial = columnCont.querySelector('.paper-material');
                                var crmEditColumn = paperMaterial.querySelector('.CRMEditColumn');
                                var editCRMItems = crmEditColumn.querySelectorAll('edit-crm-item');
                                var crmElement = editCRMItems[path[path.length - 1]];
                                if (crmElement.$$('.item')) {
                                    crmElement.$$('.item').animate([{
                                            opacity: '0.6'
                                        }, {
                                            opacity: '1'
                                        }], {
                                        duration: 250,
                                        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                                    }).onfinish = function () {
                                        crmElement.$$('.item').style.opacity = '1';
                                    };
                                    setTimeout(function () {
                                        stopHighlighting(crmElement);
                                    }, 2000);
                                }
                                else {
                                    window.doc.restoreChangesDialog.style.display = 'block';
                                    $(_this.parent().shadowRoot.querySelectorAll('.pageCont')).animate({
                                        backgroundColor: 'white'
                                    }, 200);
                                    Array.prototype.slice.apply(_this.parent().shadowRoot.querySelectorAll('.crmType')).forEach(function (crmType) {
                                        crmType.classList.remove('dim');
                                    });
                                    var crmeditItemItems = window.app.editCRM.getItems().map(function (element) {
                                        return element.$$('.item');
                                    });
                                    $(crmeditItemItems).animate({
                                        opacity: 1
                                    }, 200, function () {
                                        document.body.style.pointerEvents = 'all';
                                    });
                                }
                            };
                            window.doc.highlightChangedScript.addEventListener('click', function () {
                                window.doc.restoreChangesDialog.style.display = 'none';
                                _this.parent().$$('.pageCont').style.backgroundColor = 'rgba(0,0,0,0.4)';
                                window.app.editCRM.getItems().forEach(function (element) {
                                    var item = element.$$('.item');
                                    item.style.opacity = '0.6';
                                });
                                Array.prototype.slice.apply(_this.parent().shadowRoot.querySelectorAll('.crmType')).forEach(function (crmType) {
                                    crmType.classList.add('dim');
                                });
                                setTimeout(function () {
                                    if (path.length === 1) {
                                        highlightItem();
                                    }
                                    else {
                                        var visible = true;
                                        for (var i = 1; i < path.length; i++) {
                                            if (window.app.editCRM.crm[i].indent.length !== path[i - 1]) {
                                                visible = false;
                                                break;
                                            }
                                        }
                                        if (!visible) {
                                            var popped = JSON.parse(JSON.stringify(path));
                                            popped.pop();
                                            window.app.editCRM.build({
                                                setItems: popped
                                            });
                                            setTimeout(highlightItem, 700);
                                        }
                                        else {
                                            highlightItem();
                                        }
                                    }
                                }, 500);
                            });
                            window.doc.restoreChangesDialog.open();
                            editor = null;
                            window.setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var me, type;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            me = window.doc.restoreChangesEditor;
                                            type = crmItem.type === 'script' ?
                                                (isTs ? me.EditorMode.TS_META : me.EditorMode.JS_META) :
                                                me.EditorMode.CSS_META;
                                            return [4, window.doc.restoreChangesEditor.createDiff([code, editingObj.val], type, {
                                                    wordWrap: 'off',
                                                    fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
                                                    folding: true
                                                })];
                                        case 1:
                                            editor = _a.sent();
                                            return [2];
                                    }
                                });
                            }); }, 1000);
                            return [2];
                        });
                    });
                };
                ;
                CRMAppSetup._bindListeners = function () {
                    if (this._listening)
                        return;
                    this._listening = true;
                    var urlInput = window.doc.addLibraryUrlInput;
                    var manualInput = window.doc.addLibraryManualInput;
                    window.doc.addLibraryUrlOption.addEventListener('change', function () {
                        manualInput.style.display = 'none';
                        urlInput.style.display = 'block';
                    });
                    window.doc.addLibraryManualOption.addEventListener('change', function () {
                        urlInput.style.display = 'none';
                        manualInput.style.display = 'block';
                    });
                    $('#addLibraryDialog').on('iron-overlay-closed', function () {
                        $(this).find('#addLibraryButton, #addLibraryConfirmAddition, #addLibraryDenyConfirmation').off('click');
                    });
                };
                ;
                CRMAppSetup._crmTypeNumberToArr = function (crmType) {
                    var arr = [false, false, false, false, false, false];
                    arr[crmType] = true;
                    return arr;
                };
                CRMAppSetup.setupStorages = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        function callback(items) {
                            parent.settings = items;
                            parent._settingsCopy = JSON.parse(JSON.stringify(items));
                            window.app.editCRM.$.rootCRMItem.updateName(items.rootName);
                            for (var i = 0; i < parent.onSettingsReadyCallbacks.length; i++) {
                                parent.onSettingsReadyCallbacks[i].callback.apply(parent.onSettingsReadyCallbacks[i].thisElement, parent.onSettingsReadyCallbacks[i].params);
                            }
                            parent.updateEditorZoom();
                            parent.updateCrmRepresentation(items.crm);
                            if (parent.settings.latestId) {
                                parent._latestId = items.latestId;
                            }
                            else {
                                parent._latestId = 0;
                            }
                            window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal
                                .CRMOnPage);
                            if (parent._isDemo()) {
                                window.doc.CRMOnPage.toggled = true;
                                window.app.setLocal('CRMOnPage', true);
                                window.doc.CRMOnPage.setCheckboxDisabledValue(true);
                                parent.pageDemo.create();
                            }
                            else {
                                storageLocal.CRMOnPage && parent.pageDemo.create();
                            }
                        }
                        var parent, storageLocal, editing_1, selected, versionData, toast;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    parent = this.parent();
                                    return [4, browserAPI.storage.local.get()];
                                case 1:
                                    storageLocal = _a.sent();
                                    Array.prototype.slice.apply(parent.shadowRoot.querySelectorAll('paper-toggle-option')).forEach(function (setting) {
                                        setting.init(storageLocal);
                                    });
                                    parent._setup._bindListeners();
                                    delete storageLocal.nodeStorage;
                                    if (!(storageLocal.requestPermissions && storageLocal.requestPermissions.length > 0)) return [3, 3];
                                    if (!browserAPI.permissions) return [3, 3];
                                    return [4, parent._requestPermissions(storageLocal.requestPermissions)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    if (storageLocal.editing) {
                                        editing_1 = storageLocal.editing;
                                        setTimeout(function () {
                                            var node = parent.nodesById.get(editing_1.id);
                                            var nodeCurrentCode = (node.type === 'script' ? node.value.script :
                                                node.value.stylesheet);
                                            if (nodeCurrentCode.trim() !== editing_1.val.trim()) {
                                                parent._setup._restoreUnsavedInstances(editing_1);
                                            }
                                            else {
                                                browserAPI.storage.local.set({
                                                    editing: null
                                                });
                                            }
                                        }, 2500);
                                    }
                                    if (storageLocal.selectedCrmType !== undefined) {
                                        selected = Array.isArray(storageLocal.selectedCrmType) ?
                                            storageLocal.selectedCrmType :
                                            this._crmTypeNumberToArr(storageLocal.selectedCrmType);
                                        parent.crmTypes = selected;
                                        parent._setup.switchToIcons(selected);
                                    }
                                    else {
                                        browserAPI.storage.local.set({
                                            selectedCrmType: [true, true, true, true, true, true]
                                        });
                                        parent.crmTypes = [true, true, true, true, true, true];
                                        parent._setup.switchToIcons([true, true, true, true, true, true]);
                                    }
                                    if (storageLocal.jsLintGlobals) {
                                        parent.jsLintGlobals = storageLocal.jsLintGlobals;
                                    }
                                    else {
                                        parent.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];
                                        browserAPI.storage.local.set({
                                            jsLintGlobals: parent.jsLintGlobals
                                        });
                                    }
                                    if (storageLocal.globalExcludes && storageLocal.globalExcludes.length > 1) {
                                        parent.globalExcludes = storageLocal.globalExcludes;
                                    }
                                    else {
                                        parent.globalExcludes = [''];
                                        browserAPI.storage.local.set({
                                            globalExcludes: parent.globalExcludes
                                        });
                                    }
                                    if (storageLocal.addedPermissions && storageLocal.addedPermissions.length > 0) {
                                        window.setTimeout(function () {
                                            window.doc.addedPermissionsTabContainer.tab = 0;
                                            window.doc.addedPermissionsTabContainer.maxTabs =
                                                storageLocal.addedPermissions.length;
                                            window.doc.addedPermissionsTabRepeater.items =
                                                storageLocal.addedPermissions;
                                            if (storageLocal.addedPermissions.length === 1) {
                                                window.doc.addedPermissionNextButton.querySelector('.next')
                                                    .style.display = 'none';
                                            }
                                            else {
                                                window.doc.addedPermissionNextButton.querySelector('.close')
                                                    .style.display = 'none';
                                            }
                                            window.doc.addedPermissionPrevButton.style.display = 'none';
                                            window.doc.addedPermissionsTabRepeater.render();
                                            window.doc.addedPermissionsDialog.open();
                                            browserAPI.storage.local.set({
                                                addedPermissions: null
                                            });
                                        }, 2500);
                                    }
                                    if (storageLocal.updatedNodes && storageLocal.updatedNodes.length > 0) {
                                        parent.$.scriptUpdatesToast.text = parent._getUpdatedScriptString(storageLocal.updatedNodes[0]);
                                        parent.$.scriptUpdatesToast.scripts = storageLocal.updatedNodes;
                                        parent.$.scriptUpdatesToast.index = 0;
                                        parent.$.scriptUpdatesToast.show();
                                        if (storageLocal.updatedNodes.length > 1) {
                                            parent.$.nextScriptUpdateButton.style.display = 'inline';
                                        }
                                        else {
                                            parent.$.nextScriptUpdateButton.style.display = 'none';
                                        }
                                        browserAPI.storage.local.set({
                                            updatedScripts: []
                                        });
                                        storageLocal.updatedNodes = [];
                                    }
                                    if (storageLocal.settingsVersionData && storageLocal.settingsVersionData.wasUpdated) {
                                        versionData = storageLocal.settingsVersionData;
                                        versionData.wasUpdated = false;
                                        browserAPI.storage.local.set({
                                            settingsVersionData: versionData
                                        });
                                        toast = window.doc.updatedSettingsToast;
                                        toast.text = this.parent().___("crmApp_code_settingsUpdated", new Date(versionData.latest.date).toLocaleDateString());
                                        toast.show();
                                    }
                                    if (storageLocal.isTransfer) {
                                        browserAPI.storage.local.set({
                                            isTransfer: false
                                        });
                                        window.app.$.stylesheetGif.src =
                                            window.app.$.stylesheetGif.getAttribute('data-src');
                                        window.doc.versionUpdateDialog.open();
                                    }
                                    parent.storageLocal = storageLocal;
                                    parent._storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
                                    if (storageLocal.useStorageSync && parent._supportsStorageSync()) {
                                        browserAPI.storage.sync.get().then(function (storageSync) {
                                            var sync = storageSync;
                                            var indexes = sync.indexes;
                                            if (indexes == null || indexes === -1 || indexes === undefined) {
                                                browserAPI.storage.local.set({
                                                    useStorageSync: false
                                                });
                                                callback(storageLocal.settings);
                                            }
                                            else {
                                                var settingsJsonArray_1 = [];
                                                var indexesLength = typeof indexes === 'number' ?
                                                    indexes : (Array.isArray(indexes) ?
                                                    indexes.length : 0);
                                                window.app.util.createArray(indexesLength).forEach(function (_, index) {
                                                    settingsJsonArray_1.push(sync["section" + index]);
                                                });
                                                var jsonString = settingsJsonArray_1.join('');
                                                parent.settingsJsonLength = jsonString.length;
                                                var settings = JSON.parse(jsonString);
                                                if (parent.settingsJsonLength >= 102400) {
                                                    window.app.$.useStorageSync.setCheckboxDisabledValue(true);
                                                }
                                                callback(settings);
                                            }
                                        });
                                    }
                                    else {
                                        parent.settingsJsonLength = JSON.stringify(storageLocal.settings || {}).length;
                                        if (!storageLocal.settings) {
                                            browserAPI.storage.local.set({
                                                useStorageSync: true
                                            });
                                            browserAPI.storage.sync.get().then(function (storageSync) {
                                                var sync = storageSync;
                                                var indexes = sync.indexes;
                                                var settingsJsonArray = [];
                                                var indexesLength = typeof indexes === 'number' ?
                                                    indexes : (Array.isArray(indexes) ?
                                                    indexes.length : 0);
                                                window.app.util.createArray(indexesLength).forEach(function (_, index) {
                                                    settingsJsonArray.push(sync["section" + index]);
                                                });
                                                var jsonString = settingsJsonArray.join('');
                                                parent.settingsJsonLength = jsonString.length;
                                                var settings = JSON.parse(jsonString);
                                                callback(settings);
                                            });
                                        }
                                        else {
                                            callback(storageLocal.settings);
                                        }
                                        if (!parent._supportsStorageSync() || parent.settingsJsonLength >= 102400) {
                                            window.app.$.useStorageSync.setCheckboxDisabledValue(true);
                                        }
                                    }
                                    return [2];
                            }
                        });
                    });
                };
                ;
                CRMAppSetup.setupLoadingBar = function () {
                    var _this = this;
                    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            window.splashScreen.done.then(function () {
                                window.setTimeout(function () {
                                    window.setTimeout(function () {
                                        window.setTimeout(function () {
                                            window.polymerElementsLoaded = true;
                                        }, 500);
                                        if (BrowserAPI.getBrowser() === 'edge') {
                                            console.log(_this.parent().___("crmApp_code_hiMessage"));
                                        }
                                        else {
                                            console.log("%c" + _this.parent().___("crmApp_code_hiMessage"), 'font-size:120%;font-weight:bold;');
                                        }
                                        console.log(_this.parent().___("crmApp_code_consoleInfo"));
                                    }, 200);
                                    window.CRMLoaded = window.CRMLoaded || {
                                        listener: null,
                                        register: function (fn) {
                                            fn();
                                        }
                                    };
                                    window.CRMLoaded.listener && window.CRMLoaded.listener();
                                    resolve(null);
                                }, 25);
                            });
                            return [2];
                        });
                    }); });
                };
                ;
                CRMAppSetup.initCheckboxes = function (defaultLocalStorage) {
                    Array.prototype.slice.apply(this.parent().shadowRoot.querySelectorAll('paper-toggle-option')).forEach(function (setting) {
                        setting.init && setting.init(defaultLocalStorage);
                    });
                };
                ;
                CRMAppSetup.orderNodesById = function (tree, root) {
                    if (root === void 0) { root = true; }
                    if (root) {
                        this.parent().nodesById.clear();
                    }
                    for (var i = 0; i < tree.length; i++) {
                        var node = tree[i];
                        this.parent().nodesById.set(node.id, node);
                        node.children && this.orderNodesById(node.children, false);
                    }
                };
                ;
                CRMAppSetup.switchToIcons = function (indexes) {
                    if (typeof indexes === 'number') {
                        var arr = [false, false, false, false, false, false];
                        arr[indexes] = true;
                        indexes = arr;
                    }
                    var i;
                    var element;
                    var crmTypes = this.parent().shadowRoot.querySelectorAll('.crmType');
                    for (i = 0; i < 6; i++) {
                        if (indexes[i]) {
                            element = crmTypes[i];
                            element.classList.add('toggled');
                        }
                    }
                    this.parent().crmTypes = indexes.slice();
                    this.parent().fire('crmTypeChanged', {});
                };
                ;
                CRMAppSetup.parent = function () {
                    return window.app;
                };
                return CRMAppSetup;
            }()),
            _a._listening = false,
            _a);
        CA.uploading = (_b = (function () {
                function CRMAppUploading() {
                }
                CRMAppUploading._areValuesDifferent = function (val1, val2) {
                    var obj1ValIsArray = Array.isArray(val1);
                    var obj2ValIsArray = Array.isArray(val2);
                    var obj1ValIsObjOrArray = typeof val1 === 'object';
                    var obj2ValIsObjOrArray = typeof val2 === 'object';
                    if (obj1ValIsObjOrArray) {
                        if (!obj2ValIsObjOrArray) {
                            return true;
                        }
                        else {
                            if (obj1ValIsArray) {
                                if (!obj2ValIsArray) {
                                    return true;
                                }
                                else {
                                    if (!this._parent().util.compareArray(val1, val2)) {
                                        return true;
                                    }
                                }
                            }
                            else {
                                if (obj2ValIsArray) {
                                    return true;
                                }
                                else {
                                    if (!this._parent().util.compareObj(val1, val2)) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    else if (val1 !== val2) {
                        return true;
                    }
                    return false;
                };
                ;
                CRMAppUploading._getObjDifferences = function (obj1, obj2, changes) {
                    for (var key in obj1) {
                        if (obj1.hasOwnProperty(key)) {
                            if (this._areValuesDifferent(obj1[key], obj2[key])) {
                                changes.push({
                                    oldValue: obj2[key],
                                    newValue: obj1[key],
                                    key: key
                                });
                            }
                        }
                    }
                    return changes.length > 0;
                };
                ;
                CRMAppUploading.getChanges = function (force, _a) {
                    var _b = _a === void 0 ? {
                        local: this._parent().storageLocal,
                        localCopy: this._parent()._storageLocalCopy,
                        sync: this._parent().settings,
                        syncCopy: this._parent()._settingsCopy
                    } : _a, _c = _b.local, local = _c === void 0 ? this._parent().storageLocal : _c, _d = _b.localCopy, localCopy = _d === void 0 ? this._parent()._storageLocalCopy : _d, _e = _b.sync, sync = _e === void 0 ? this._parent().settings : _e, _f = _b.syncCopy, syncCopy = _f === void 0 ? this._parent()._settingsCopy : _f;
                    var localChanges = [];
                    var settingsChanges = [];
                    var hasLocalChanged = this._getObjDifferences(local, force ? {} : localCopy, localChanges);
                    var haveSettingsChanged = this._getObjDifferences(sync, force ? {} : syncCopy, settingsChanges);
                    return {
                        hasLocalChanged: hasLocalChanged,
                        haveSettingsChanged: haveSettingsChanged,
                        localChanges: localChanges,
                        settingsChanges: settingsChanges
                    };
                };
                CRMAppUploading._updateCopies = function () {
                    this._parent()._storageLocalCopy =
                        JSON.parse(JSON.stringify(this._parent().storageLocal));
                    this._parent()._settingsCopy =
                        JSON.parse(JSON.stringify(this._parent().settings));
                };
                CRMAppUploading._uploadChanges = function (_a) {
                    var hasLocalChanged = _a.hasLocalChanged, haveSettingsChanged = _a.haveSettingsChanged, localChanges = _a.localChanges, settingsChanges = _a.settingsChanges;
                    if (hasLocalChanged || haveSettingsChanged) {
                        browserAPI.runtime.sendMessage({
                            type: 'updateStorage',
                            data: {
                                type: 'optionsPage',
                                localChanges: hasLocalChanged && localChanges,
                                settingsChanges: haveSettingsChanged && settingsChanges
                            }
                        });
                    }
                    this._parent().pageDemo.create();
                    this._updateCopies();
                };
                CRMAppUploading.upload = function (force) {
                    this._uploadChanges(this.getChanges(force));
                };
                ;
                CRMAppUploading.createRevertPoint = function (showToast, toastTime) {
                    if (showToast === void 0) { showToast = true; }
                    if (toastTime === void 0) { toastTime = 10000; }
                    if (showToast) {
                        window.app.util.showToast('Undo');
                        window.app.$.undoToast.duration = toastTime;
                        window.app.$.undoToast.show();
                    }
                    var revertPoint = {
                        local: JSON.parse(JSON.stringify(window.app.storageLocal)),
                        sync: JSON.parse(JSON.stringify(window.app.settings))
                    };
                    this._lastRevertPoint = revertPoint;
                    return revertPoint;
                };
                CRMAppUploading.showRevertPointToast = function (revertPoint, toastTime) {
                    if (toastTime === void 0) { toastTime = 10000; }
                    window.app.util.showToast('Undo');
                    window.app.$.undoToast.duration = toastTime;
                    window.app.$.undoToast.show();
                    this._lastRevertPoint = revertPoint;
                };
                CRMAppUploading.revert = function (revertPoint) {
                    if (revertPoint === void 0) { revertPoint = this._lastRevertPoint; }
                    window.app.$.undoToast.hide();
                    if (!this._lastRevertPoint)
                        return;
                    this._uploadChanges(this.getChanges(false, {
                        local: revertPoint.local,
                        localCopy: this._parent().storageLocal,
                        sync: revertPoint.sync,
                        syncCopy: this._parent().settings
                    }));
                    window.app.settings = revertPoint.sync;
                    window.app.updateCrmRepresentation(window.app.settings.crm);
                    window.app.editCRM.build();
                };
                CRMAppUploading._parent = function () {
                    return window.app;
                };
                return CRMAppUploading;
            }()),
            _b._lastRevertPoint = null,
            _b);
        CA.legacyScriptReplace = (_c = (function () {
                function LegacyScriptReplace() {
                }
                LegacyScriptReplace.generateScriptUpgradeErrorHandler = function (id) {
                    return function (oldScriptErrors, newScriptErrors, parseError) {
                        browserAPI.storage.local.get().then(function (keys) {
                            if (!keys.upgradeErrors) {
                                var val = {};
                                val[id] = {
                                    oldScript: oldScriptErrors,
                                    newScript: newScriptErrors,
                                    generalError: parseError
                                };
                                keys.upgradeErrors = val;
                                window.app.storageLocal.upgradeErrors = val;
                            }
                            keys.upgradeErrors[id] = window.app.storageLocal.upgradeErrors[id] = {
                                oldScript: oldScriptErrors,
                                newScript: newScriptErrors,
                                generalError: parseError
                            };
                            browserAPI.storage.local.set({ upgradeErrors: keys.upgradeErrors });
                        });
                    };
                };
                ;
                LegacyScriptReplace.convertScriptFromLegacy = function (script, id, method) {
                    var usedExecuteLocally = false;
                    var lineIndex = script.indexOf('/*execute locally*/');
                    if (lineIndex !== -1) {
                        script = script.replace('/*execute locally*/\n', '');
                        if (lineIndex === script.indexOf('/*execute locally*/')) {
                            script = script.replace('/*execute locally*/', '');
                        }
                        usedExecuteLocally = true;
                    }
                    try {
                        switch (method) {
                            case 0:
                                script = this.chromeCallsReplace.replace(script, this.generateScriptUpgradeErrorHandler(id));
                                break;
                            case 1:
                                script = usedExecuteLocally ?
                                    this.localStorageReplace.replaceCalls(script.split('\n')) : script;
                                break;
                            case 2:
                                var localStorageConverted = usedExecuteLocally ?
                                    this.localStorageReplace.replaceCalls(script.split('\n')) : script;
                                script = this.chromeCallsReplace.replace(localStorageConverted, this.generateScriptUpgradeErrorHandler(id));
                                break;
                        }
                    }
                    catch (e) {
                        return script;
                    }
                    return script;
                };
                return LegacyScriptReplace;
            }()),
            _c.localStorageReplace = (function () {
                function LogalStorageReplace() {
                }
                LogalStorageReplace.findExpression = function (expression, data, strToFind, onFind) {
                    if (!expression) {
                        return false;
                    }
                    switch (expression.type) {
                        case 'Identifier':
                            if (expression.name === strToFind) {
                                onFind(data, expression);
                                return true;
                            }
                            break;
                        case 'VariableDeclaration':
                            for (var i = 0; i < expression.declarations.length; i++) {
                                var declaration = expression.declarations[i];
                                if (declaration.init) {
                                    if (this.findExpression(declaration.init, data, strToFind, onFind)) {
                                        return true;
                                    }
                                }
                            }
                            break;
                        case 'MemberExpression':
                            data.isObj = true;
                            if (this.findExpression(expression.object, data, strToFind, onFind)) {
                                return true;
                            }
                            data.siblingExpr = expression.object;
                            data.isObj = false;
                            return this.findExpression(expression.property, data, strToFind, onFind);
                        case 'CallExpression':
                            if (expression.arguments && expression.arguments.length > 0) {
                                for (var i = 0; i < expression.arguments.length; i++) {
                                    if (this.findExpression(expression.arguments[i], data, strToFind, onFind)) {
                                        return true;
                                    }
                                }
                            }
                            if (expression.callee) {
                                return this.findExpression(expression.callee, data, strToFind, onFind);
                            }
                            break;
                        case 'AssignmentExpression':
                            return this.findExpression(expression.right, data, strToFind, onFind);
                        case 'FunctionExpression':
                        case 'FunctionDeclaration':
                            for (var i = 0; i < expression.body.body.length; i++) {
                                if (this.findExpression(expression.body.body[i], data, strToFind, onFind)) {
                                    return true;
                                }
                            }
                            break;
                        case 'ExpressionStatement':
                            return this.findExpression(expression.expression, data, strToFind, onFind);
                        case 'SequenceExpression':
                            for (var i = 0; i < expression.expressions.length; i++) {
                                if (this.findExpression(expression.expressions[i], data, strToFind, onFind)) {
                                    return true;
                                }
                            }
                            break;
                        case 'UnaryExpression':
                        case 'ConditionalExpression':
                            if (this.findExpression(expression.consequent, data, strToFind, onFind)) {
                                return true;
                            }
                            return this.findExpression(expression.alternate, data, strToFind, onFind);
                        case 'IfStatement':
                            if (this.findExpression(expression.consequent, data, strToFind, onFind)) {
                                return true;
                            }
                            if (expression.alternate) {
                                return this.findExpression(expression.alternate, data, strToFind, onFind);
                            }
                            break;
                        case 'LogicalExpression':
                        case 'BinaryExpression':
                            if (this.findExpression(expression.left, data, strToFind, onFind)) {
                                return true;
                            }
                            return this.findExpression(expression.right, data, strToFind, onFind);
                        case 'BlockStatement':
                            for (var i = 0; i < expression.body.length; i++) {
                                if (this.findExpression(expression.body[i], data, strToFind, onFind)) {
                                    return true;
                                }
                            }
                            break;
                        case 'ReturnStatement':
                            return this.findExpression(expression.argument, data, strToFind, onFind);
                        case 'ObjectExpressions':
                            for (var i = 0; i < expression.properties.length; i++) {
                                if (this.findExpression(expression.properties[i].value, data, strToFind, onFind)) {
                                    return true;
                                }
                            }
                            break;
                    }
                    return false;
                };
                LogalStorageReplace.getLineSeperators = function (lines) {
                    var index = 0;
                    var lineSeperators = [];
                    for (var i = 0; i < lines.length; i++) {
                        lineSeperators.push({
                            start: index,
                            end: index += lines[i].length + 1
                        });
                    }
                    return lineSeperators;
                };
                LogalStorageReplace.replaceCalls = function (lines) {
                    var file = new window.app._TernFile('[doc]');
                    file.text = lines.join('\n');
                    var srv = new window.CodeMirror.TernServer({
                        defs: []
                    });
                    window.tern.withContext(srv.cx, function () {
                        file.ast = window.tern.parse(file.text, srv.passes, {
                            directSourceFile: file,
                            allowReturnOutsideFunction: true,
                            allowImportExportEverywhere: true,
                            ecmaVersion: srv.ecmaVersion
                        });
                    });
                    var scriptExpressions = file.ast.body;
                    var script = file.text;
                    var persistentData = {
                        lines: lines,
                        lineSeperators: this.getLineSeperators(lines),
                        script: script
                    };
                    for (var i = 0; i < scriptExpressions.length; i++) {
                        var expression = scriptExpressions[i];
                        if (this.findExpression(expression, persistentData, 'localStorage', function (data, expression) {
                            data.script =
                                data.script.slice(0, expression.start) +
                                    'localStorageProxy' +
                                    data.script.slice(expression.end);
                            data.lines = data.script.split('\n');
                        })) {
                            return this.replaceCalls(persistentData.lines);
                        }
                    }
                    return persistentData.script;
                };
                return LogalStorageReplace;
            }()),
            _c.chromeCallsReplace = (function () {
                function ChromeCallsReplace() {
                }
                ChromeCallsReplace._isProperty = function (toCheck, prop) {
                    if (toCheck === prop) {
                        return true;
                    }
                    return toCheck.replace(/['|"|`]/g, '') === prop;
                };
                ChromeCallsReplace._getCallLines = function (lineSeperators, start, end) {
                    var line = {};
                    for (var i = 0; i < lineSeperators.length; i++) {
                        var sep = lineSeperators[i];
                        if (sep.start <= start) {
                            line.from = {
                                index: sep.start,
                                line: i
                            };
                        }
                        if (sep.end >= end) {
                            line.to = {
                                index: sep.end,
                                line: i
                            };
                            break;
                        }
                    }
                    return line;
                };
                ChromeCallsReplace._getFunctionCallExpressions = function (data) {
                    var index = data.parentExpressions.length - 1;
                    var expr = data.parentExpressions[index];
                    while (expr && expr.type !== 'CallExpression') {
                        expr = data.parentExpressions[--index];
                    }
                    return data.parentExpressions[index];
                };
                ChromeCallsReplace._getChromeAPI = function (expr, data) {
                    data.functionCall = data.functionCall.map(function (prop) {
                        return prop.replace(/['|"|`]/g, '');
                    });
                    var functionCall = data.functionCall;
                    functionCall = functionCall.reverse();
                    if (functionCall[0] === 'chrome') {
                        functionCall.splice(0, 1);
                    }
                    var argsStart = expr.callee.end;
                    var argsEnd = expr.end;
                    var args = data.persistent.script.slice(argsStart, argsEnd);
                    return {
                        call: functionCall.join('.'),
                        args: args
                    };
                };
                ChromeCallsReplace._getLineIndexFromTotalIndex = function (lines, line, index) {
                    for (var i = 0; i < line; i++) {
                        index -= lines[i].length + 1;
                    }
                    return index;
                };
                ChromeCallsReplace._replaceChromeFunction = function (data, expr, callLine) {
                    if (data.isReturn && !data.isValidReturn) {
                        return;
                    }
                    var lines = data.persistent.lines;
                    var i;
                    var chromeAPI = this._getChromeAPI(expr, data);
                    var firstLine = data.persistent.lines[callLine.from.line];
                    var lineExprStart = this._getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
                        expr.callee.start));
                    var lineExprEnd = this._getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, expr.callee.end);
                    var newLine = firstLine.slice(0, lineExprStart) +
                        ("window.crmAPI.chrome('" + chromeAPI.call + "')");
                    var lastChar = null;
                    while (newLine[(lastChar = newLine.length - 1)] === ' ') {
                        newLine = newLine.slice(0, lastChar);
                    }
                    if (newLine[(lastChar = newLine.length - 1)] === ';') {
                        newLine = newLine.slice(0, lastChar);
                    }
                    if (chromeAPI.args !== '()') {
                        var argsLines = chromeAPI.args.split('\n');
                        newLine += argsLines[0];
                        for (i = 1; i < argsLines.length; i++) {
                            lines[callLine.from.line + i] = argsLines[i];
                        }
                    }
                    if (data.isReturn) {
                        var lineRest = firstLine.slice(lineExprEnd + chromeAPI.args.split('\n')[0].length);
                        while (lineRest.indexOf(';') === 0) {
                            lineRest = lineRest.slice(1);
                        }
                        newLine += ".return(function(" + data.returnName + ") {" + lineRest;
                        var usesTabs = true;
                        var spacesAmount = 0;
                        for (var i_1 = 0; i_1 < data.persistent.lines.length; i_1++) {
                            if (data.persistent.lines[i_1].indexOf('	') === 0) {
                                usesTabs = true;
                                break;
                            }
                            else if (data.persistent.lines[i_1].indexOf('  ') === 0) {
                                var split = data.persistent.lines[i_1].split(' ');
                                for (var j = 0; j < split.length; j++) {
                                    if (split[j] === ' ') {
                                        spacesAmount++;
                                    }
                                    else {
                                        break;
                                    }
                                }
                                usesTabs = false;
                                break;
                            }
                        }
                        var indent;
                        if (usesTabs) {
                            indent = '	';
                        }
                        else {
                            indent = [];
                            indent[spacesAmount] = ' ';
                            indent = indent.join(' ');
                        }
                        var scopeLength = null;
                        var idx = null;
                        for (i = data.parentExpressions.length - 1; scopeLength === null && i !== 0; i--) {
                            if (data.parentExpressions[i].type === 'BlockStatement' ||
                                (data.parentExpressions[i].type === 'FunctionExpression' &&
                                    data.parentExpressions[i].body.type === 'BlockStatement')) {
                                scopeLength = this._getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, data.parentExpressions[i].end);
                                idx = 0;
                                while (scopeLength > 0) {
                                    scopeLength = this._getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (++idx), data.parentExpressions[i].end);
                                }
                                scopeLength = this._getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (idx - 1), data.parentExpressions[i].end);
                            }
                        }
                        if (idx === null) {
                            idx = (lines.length - callLine.from.line) + 1;
                        }
                        var indents = 0;
                        var newLineData = lines[callLine.from.line];
                        while (newLineData.indexOf(indent) === 0) {
                            newLineData = newLineData.replace(indent, '');
                            indents++;
                        }
                        var prevLine;
                        var indentArr = [];
                        indentArr[indents] = '';
                        var prevLine2 = indentArr.join(indent) + '}).send();';
                        var max = data.persistent.lines.length + 1;
                        for (i = callLine.from.line; i < callLine.from.line + (idx - 1); i++) {
                            lines[i] = indent + lines[i];
                        }
                        for (i = callLine.from.line + (idx - 1); i < max; i++) {
                            prevLine = lines[i];
                            lines[i] = prevLine2;
                            prevLine2 = prevLine;
                        }
                    }
                    else {
                        lines[callLine.from.line + (i - 1)] = lines[callLine.from.line + (i - 1)] + '.send();';
                        if (i === 1) {
                            newLine += '.send();';
                        }
                    }
                    lines[callLine.from.line] = newLine;
                    return;
                };
                ChromeCallsReplace._callsChromeFunction = function (callee, data, onError) {
                    data.parentExpressions.push(callee);
                    if (callee.arguments && callee.arguments.length > 0) {
                        for (var i = 0; i < callee.arguments.length; i++) {
                            if (this._findChromeExpression(callee.arguments[i], this
                                ._removeObjLink(data), onError)) {
                                return true;
                            }
                        }
                    }
                    if (callee.type !== 'MemberExpression') {
                        return this._findChromeExpression(callee, this._removeObjLink(data), onError);
                    }
                    if (callee.property) {
                        data.functionCall = data.functionCall || [];
                        data.functionCall.push(callee.property.name || callee.property.raw);
                    }
                    if (callee.object && callee.object.name) {
                        var isWindowCall = (this._isProperty(callee.object.name, 'window') &&
                            this._isProperty(callee.property.name || callee.property.raw, 'chrome'));
                        if (isWindowCall || this._isProperty(callee.object.name, 'chrome')) {
                            data.expression = callee;
                            var expr = this._getFunctionCallExpressions(data);
                            var callLines = this._getCallLines(data
                                .persistent
                                .lineSeperators, expr.start, expr.end);
                            if (data.isReturn && !data.isValidReturn) {
                                callLines.from.index = this._getLineIndexFromTotalIndex(data.persistent
                                    .lines, callLines.from.line, callLines.from.index);
                                callLines.to.index = this._getLineIndexFromTotalIndex(data.persistent
                                    .lines, callLines.to.line, callLines.to.index);
                                onError(callLines, data.persistent.passes);
                                return false;
                            }
                            if (!data.persistent.diagnostic) {
                                this._replaceChromeFunction(data, expr, callLines);
                            }
                            return true;
                        }
                    }
                    else if (callee.object) {
                        return this._callsChromeFunction(callee.object, data, onError);
                    }
                    return false;
                };
                ChromeCallsReplace._removeObjLink = function (data) {
                    var parentExpressions = data.parentExpressions || [];
                    var newObj = {};
                    for (var key in data) {
                        if (data.hasOwnProperty(key) &&
                            key !== 'parentExpressions' &&
                            key !== 'persistent') {
                            newObj[key] = data[key];
                        }
                    }
                    var newParentExpressions = [];
                    for (var i = 0; i < parentExpressions.length; i++) {
                        newParentExpressions.push(parentExpressions[i]);
                    }
                    newObj.persistent = data.persistent;
                    newObj.parentExpressions = newParentExpressions;
                    return newObj;
                };
                ChromeCallsReplace._findChromeExpression = function (expression, data, onError) {
                    data.parentExpressions = data.parentExpressions || [];
                    data.parentExpressions.push(expression);
                    switch (expression.type) {
                        case 'VariableDeclaration':
                            data.isValidReturn = expression.declarations.length === 1;
                            for (var i = 0; i < expression.declarations.length; i++) {
                                var declaration = expression.declarations[i];
                                if (declaration.init) {
                                    var decData = this._removeObjLink(data);
                                    var returnName = declaration.id.name;
                                    decData.isReturn = true;
                                    decData.returnExpr = expression;
                                    decData.returnName = returnName;
                                    if (this._findChromeExpression(declaration.init, decData, onError)) {
                                        return true;
                                    }
                                }
                            }
                            break;
                        case 'CallExpression':
                        case 'MemberExpression':
                            var argsTocheck = [];
                            if (expression.arguments && expression.arguments.length > 0) {
                                for (var i = 0; i < expression.arguments.length; i++) {
                                    if (expression.arguments[i].type !== 'MemberExpression' && expression.arguments[i].type !== 'CallExpression') {
                                        argsTocheck.push(expression.arguments[i]);
                                    }
                                    else {
                                        if (this._findChromeExpression(expression.arguments[i], this._removeObjLink(data), onError)) {
                                            return true;
                                        }
                                    }
                                }
                            }
                            data.functionCall = [];
                            if (expression.callee) {
                                if (this._callsChromeFunction(expression.callee, data, onError)) {
                                    return true;
                                }
                            }
                            for (var i = 0; i < argsTocheck.length; i++) {
                                if (this._findChromeExpression(argsTocheck[i], this._removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                            break;
                        case 'AssignmentExpression':
                            data.isReturn = true;
                            data.returnExpr = expression;
                            data.returnName = expression.left.name;
                            return this._findChromeExpression(expression.right, data, onError);
                        case 'FunctionExpression':
                        case 'FunctionDeclaration':
                            data.isReturn = false;
                            for (var i = 0; i < expression.body.body.length; i++) {
                                if (this._findChromeExpression(expression.body.body[i], this
                                    ._removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                            break;
                        case 'ExpressionStatement':
                            return this._findChromeExpression(expression.expression, data, onError);
                        case 'SequenceExpression':
                            data.isReturn = false;
                            var lastExpression = expression.expressions.length - 1;
                            for (var i = 0; i < expression.expressions.length; i++) {
                                if (i === lastExpression) {
                                    data.isReturn = true;
                                }
                                if (this._findChromeExpression(expression.expressions[i], this
                                    ._removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                            break;
                        case 'UnaryExpression':
                        case 'ConditionalExpression':
                            data.isValidReturn = false;
                            data.isReturn = true;
                            if (this._findChromeExpression(expression.consequent, this
                                ._removeObjLink(data), onError)) {
                                return true;
                            }
                            if (this._findChromeExpression(expression.alternate, this
                                ._removeObjLink(data), onError)) {
                                return true;
                            }
                            break;
                        case 'IfStatement':
                            data.isReturn = false;
                            if (this._findChromeExpression(expression.consequent, this
                                ._removeObjLink(data), onError)) {
                                return true;
                            }
                            if (expression.alternate &&
                                this._findChromeExpression(expression.alternate, this
                                    ._removeObjLink(data), onError)) {
                                return true;
                            }
                            break;
                        case 'LogicalExpression':
                        case 'BinaryExpression':
                            data.isReturn = true;
                            data.isValidReturn = false;
                            if (this._findChromeExpression(expression.left, this._removeObjLink(data), onError)) {
                                return true;
                            }
                            if (this._findChromeExpression(expression.right, this
                                ._removeObjLink(data), onError)) {
                                return true;
                            }
                            break;
                        case 'BlockStatement':
                            data.isReturn = false;
                            for (var i = 0; i < expression.body.length; i++) {
                                if (this._findChromeExpression(expression.body[i], this
                                    ._removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                            break;
                        case 'ReturnStatement':
                            data.isReturn = true;
                            data.returnExpr = expression;
                            data.isValidReturn = false;
                            return this._findChromeExpression(expression.argument, data, onError);
                        case 'ObjectExpressions':
                            data.isReturn = true;
                            data.isValidReturn = false;
                            for (var i = 0; i < expression.properties.length; i++) {
                                if (this._findChromeExpression(expression.properties[i].value, this
                                    ._removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                            break;
                    }
                    return false;
                };
                ChromeCallsReplace._generateOnError = function (container) {
                    return function (position, passes) {
                        if (!container[passes]) {
                            container[passes] = [position];
                        }
                        else {
                            container[passes].push(position);
                        }
                    };
                };
                ChromeCallsReplace._replaceChromeCalls = function (lines, passes, onError) {
                    var file = new window.app._TernFile('[doc]');
                    file.text = lines.join('\n');
                    var srv = new window.CodeMirror.TernServer({
                        defs: []
                    });
                    window.tern.withContext(srv.cx, function () {
                        file.ast = window.tern.parse(file.text, srv.passes, {
                            directSourceFile: file,
                            allowReturnOutsideFunction: true,
                            allowImportExportEverywhere: true,
                            ecmaVersion: srv.ecmaVersion
                        });
                    });
                    var scriptExpressions = file.ast.body;
                    var index = 0;
                    var lineSeperators = [];
                    for (var i = 0; i < lines.length; i++) {
                        lineSeperators.push({
                            start: index,
                            end: index += lines[i].length + 1
                        });
                    }
                    var script = file.text;
                    var persistentData = {
                        lines: lines,
                        lineSeperators: lineSeperators,
                        script: script,
                        passes: passes
                    };
                    var expression;
                    if (passes === 0) {
                        persistentData.diagnostic = true;
                        for (var i = 0; i < scriptExpressions.length; i++) {
                            expression = scriptExpressions[i];
                            this._findChromeExpression(expression, {
                                persistent: persistentData
                            }, onError);
                        }
                        persistentData.diagnostic = false;
                    }
                    for (var i = 0; i < scriptExpressions.length; i++) {
                        expression = scriptExpressions[i];
                        if (this._findChromeExpression(expression, {
                            persistent: persistentData
                        }, onError)) {
                            script = this._replaceChromeCalls(persistentData.lines.join('\n')
                                .split('\n'), passes + 1, onError);
                            break;
                        }
                    }
                    return script;
                };
                ChromeCallsReplace._removePositionDuplicates = function (arr) {
                    var jsonArr = [];
                    arr.forEach(function (item, index) {
                        jsonArr[index] = JSON.stringify(item);
                    });
                    jsonArr = jsonArr.filter(function (item, pos) {
                        return jsonArr.indexOf(item) === pos;
                    });
                    return jsonArr.map(function (item) {
                        return JSON.parse(item);
                    });
                };
                ChromeCallsReplace.replace = function (script, onError) {
                    var lineIndex = script.indexOf('/*execute locally*/');
                    if (lineIndex !== -1) {
                        script = script.replace('/*execute locally*/\n', '');
                        if (lineIndex === script.indexOf('/*execute locally*/')) {
                            script = script.replace('/*execute locally*/', '');
                        }
                    }
                    var errors = [];
                    try {
                        script = this._replaceChromeCalls(script.split('\n'), 0, this._generateOnError(errors));
                    }
                    catch (e) {
                        onError(null, null, true);
                        return script;
                    }
                    var firstPassErrors = errors[0];
                    var finalPassErrors = errors[errors.length - 1];
                    if (finalPassErrors) {
                        onError(this._removePositionDuplicates(firstPassErrors), this._removePositionDuplicates(finalPassErrors));
                    }
                    return script;
                };
                return ChromeCallsReplace;
            }()),
            _c);
        CA.listeners = (function () {
            function CRMAppListeners() {
            }
            CRMAppListeners.undo = function () {
                window.app.uploading.revert();
            };
            CRMAppListeners._toggleBugReportingTool = function () {
                window.errorReportingTool.toggleVisibility();
            };
            ;
            CRMAppListeners.toggleTypescript = function () {
                window.scriptEdit.toggleTypescript();
                window.app.$.editorTypescript.classList.toggle('active');
            };
            CRMAppListeners.toggleToolsRibbon = function () {
                var horizontalCenterer = window.crmEditPage.$.horizontalCenterer;
                var bcr = horizontalCenterer.getBoundingClientRect();
                var viewportWidth = bcr.width + 20;
                $(window.doc.editorToolsRibbonContainer).animate({
                    marginLeft: window.app.storageLocal.hideToolsRibbon ? '0' :
                        '-200px'
                }, {
                    duration: 250,
                    easing: $.bez([0.215, 0.610, 0.355, 1.000]),
                    step: function (now) {
                        window.doc.fullscreenEditorEditor.style.width =
                            viewportWidth - 200 - now + "px";
                        window.doc.fullscreenEditorEditor.style.marginLeft =
                            now + 200 + "px";
                        (window.scriptEdit || window.scriptEdit).getEditorInstance().editor.layout();
                    }
                });
                window.app.storageLocal.hideToolsRibbon = !window.app.storageLocal.hideToolsRibbon;
                window.app.upload();
            };
            ;
            CRMAppListeners.launchSearchWebsiteToolScript = function () {
                if (this.parent().item && this.parent().item.type === 'script' && window.scriptEdit) {
                    var paperSearchWebsiteDialog = this.parent().$.paperSearchWebsiteDialog;
                    paperSearchWebsiteDialog.init();
                    paperSearchWebsiteDialog.setOutputType('script');
                    paperSearchWebsiteDialog.show();
                }
            };
            ;
            CRMAppListeners.launchSearchWebsiteToolLink = function () {
                var paperSearchWebsiteDialog = this.parent().$.paperSearchWebsiteDialog;
                paperSearchWebsiteDialog.init();
                paperSearchWebsiteDialog.setOutputType('link');
                paperSearchWebsiteDialog.show();
            };
            ;
            CRMAppListeners.launchExternalEditorDialog = function () {
                if (!window.doc.externalEditorDialogTrigger.disabled) {
                    window.externalEditor.init();
                    window.externalEditor.editingCRMItem = window.codeEditBehavior.getActive().item;
                    window.externalEditor.setupExternalEditing();
                }
            };
            ;
            CRMAppListeners.runLint = function () {
                window.app.util.getDialog().getEditorInstance().runLinter();
            };
            ;
            CRMAppListeners.showCssTips = function () {
                window.doc.cssEditorInfoDialog.open();
            };
            ;
            CRMAppListeners.showManagePermissions = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!browserAPI.permissions) return [3, 2];
                                return [4, this.parent()._requestPermissions([], true)];
                            case 1:
                                _a.sent();
                                return [3, 3];
                            case 2:
                                window.app.util.showToast(this.parent().___("crmApp_code_permissionsNotSupported"));
                                _a.label = 3;
                            case 3: return [2];
                        }
                    });
                });
            };
            ;
            CRMAppListeners.iconSwitch = function (e, types) {
                var parentCrmTypes = this.parent().crmTypes;
                if (typeof parentCrmTypes === 'number') {
                    var arr = [false, false, false, false, false, false];
                    arr[parentCrmTypes] = true;
                    parentCrmTypes = arr;
                }
                else {
                    parentCrmTypes = parentCrmTypes.slice();
                }
                var selectedTypes = parentCrmTypes;
                if (Array.isArray(types)) {
                    for (var i = 0; i < 6; i++) {
                        var crmEl = this.parent().shadowRoot.querySelectorAll('.crmType')[i];
                        if (types[i]) {
                            crmEl.classList.add('toggled');
                        }
                        else {
                            crmEl.classList.remove('toggled');
                        }
                    }
                    selectedTypes = types.slice();
                }
                else {
                    var element = this.parent().util.findElementWithClassName(e, 'crmType');
                    var crmTypes = this.parent().shadowRoot.querySelectorAll('.crmType');
                    for (var i = 0; i < 6; i++) {
                        var crmEl = crmTypes[i];
                        if (crmEl === element) {
                            if (!selectedTypes[i]) {
                                crmEl.classList.add('toggled');
                            }
                            else {
                                crmEl.classList.remove('toggled');
                            }
                            selectedTypes[i] = !selectedTypes[i];
                        }
                    }
                }
                browserAPI.storage.local.set({
                    selectedCrmType: selectedTypes
                });
                for (var i = 0; i < 6; i++) {
                    if (this.parent().crmTypes[i] !== selectedTypes[i]) {
                        this.parent().fire('crmTypeChanged', {});
                        break;
                    }
                }
                this.parent().crmTypes = selectedTypes;
            };
            ;
            CRMAppListeners._getDownloadPermission = function (callback) {
                var _this = this;
                if (BrowserAPI.getSrc().downloads && BrowserAPI.getSrc().downloads.download) {
                    callback(true);
                    return;
                }
                if (!(BrowserAPI.getSrc().permissions)) {
                    window.app.util.showToast(this.parent().___("crmApp_code_downloadNotSupported"));
                    callback(false);
                    return;
                }
                browserAPI.permissions.contains({
                    permissions: ['downloads']
                }).then(function (granted) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (granted) {
                            callback(true);
                        }
                        else {
                            browserAPI.permissions.request({
                                permissions: ['downloads']
                            }).then(function (granted) {
                                browserAPI.downloads = browserAPI.downloads || BrowserAPI.getDownloadAPI();
                                callback(granted);
                            });
                        }
                        return [2];
                    });
                }); });
            };
            CRMAppListeners._generateRegexFile = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var filePath, schemeName, regFile;
                    var _this = this;
                    return __generator(this, function (_a) {
                        filePath = this.parent().$.URISchemeFilePath.$$('input').value.replace(/\\/g, '\\\\');
                        schemeName = this.parent().$.URISchemeSchemeName.$$('input').value;
                        regFile = [
                            'Windows Registry Editor Version 5.00',
                            '',
                            '[HKEY_CLASSES_ROOT\\' + schemeName + ']',
                            '@="URL:' + schemeName + ' Protocol"',
                            '"URL Protocol"=""',
                            '',
                            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
                            '',
                            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
                            '',
                            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
                            '@="\\"' + filePath + '\\""'
                        ].join('\n');
                        this._getDownloadPermission(function (allowed) {
                            if (allowed) {
                                if (browserAPI.downloads) {
                                    browserAPI.downloads.download({
                                        url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
                                        filename: schemeName + '.reg'
                                    });
                                }
                                else {
                                    window.app.util.showToast(_this.parent().___("crmApp_code_downloadNotSupported"));
                                }
                            }
                        });
                        return [2];
                    });
                });
            };
            ;
            CRMAppListeners.globalExcludeChange = function (e) {
                var input = this.parent().util.findElementWithTagname(e, 'paper-input');
                var excludeIndex = null;
                var allExcludes = document.getElementsByClassName('globalExcludeContainer');
                for (var i = 0; i < allExcludes.length; i++) {
                    if (allExcludes[i] === input.parentNode) {
                        excludeIndex = i;
                        break;
                    }
                }
                if (excludeIndex === null) {
                    return;
                }
                var value = input.$$('input').value;
                this.parent().globalExcludes[excludeIndex] = value;
                this.parent().set('globalExcludes', this.parent().globalExcludes);
                browserAPI.storage.local.set({
                    globalExcludes: this.parent().globalExcludes
                });
            };
            ;
            CRMAppListeners.removeGlobalExclude = function (e) {
                var node = this.parent().util.findElementWithTagname(e, 'paper-icon-button');
                var excludeIndex = null;
                var allExcludes = document.getElementsByClassName('globalExcludeContainer');
                for (var i = 0; i < allExcludes.length; i++) {
                    if (allExcludes[i] === node.parentNode) {
                        excludeIndex = i;
                        break;
                    }
                }
                if (excludeIndex === null) {
                    return;
                }
                this.parent().splice('globalExcludes', excludeIndex, 1);
            };
            ;
            CRMAppListeners.importData = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var dataString, data, overWriteImport, settingsArr, rows_1, LocalStorageWrapper, crm, e_1;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                dataString = this.parent().$.importSettingsInput.value;
                                if (!!this.parent().$.oldCRMImport.checked) return [3, 1];
                                data = void 0;
                                try {
                                    data = JSON.parse(dataString);
                                    this.parent().$.importSettingsError.style.display = 'none';
                                }
                                catch (e) {
                                    this.parent().$.importSettingsError.style.display = 'block';
                                    return [2];
                                }
                                window.app.uploading.createRevertPoint();
                                overWriteImport = this.parent().$.overWriteImport;
                                if (overWriteImport.checked && (data.local || data.storageLocal)) {
                                    this.parent().settings = data.nonLocal || this.parent().settings;
                                    this.parent().storageLocal = data.local || this.parent().storageLocal;
                                }
                                if (data.crm) {
                                    if (overWriteImport.checked) {
                                        this.parent().settings.crm = this.parent().util.crmForEach(data.crm, function (node) {
                                            node.id = _this.parent().generateItemId();
                                        });
                                    }
                                    else {
                                        this.parent()._addImportedNodes(data.crm);
                                    }
                                    this.parent().editCRM.build();
                                }
                                this.parent()._setup.initCheckboxes(this.parent().storageLocal);
                                this.parent().upload();
                                return [3, 6];
                            case 1:
                                _a.trys.push([1, 5, , 6]);
                                settingsArr = dataString.split('%146%');
                                if (!(settingsArr[0] === 'all')) return [3, 3];
                                this.parent().storageLocal.showOptions = settingsArr[2];
                                rows_1 = settingsArr.slice(6);
                                LocalStorageWrapper = (function () {
                                    function LocalStorageWrapper() {
                                    }
                                    LocalStorageWrapper.prototype.getItem = function (index) {
                                        if (index === 'numberofrows') {
                                            return '' + (rows_1.length - 1);
                                        }
                                        return rows_1[index];
                                    };
                                    return LocalStorageWrapper;
                                }());
                                window.app.uploading.createRevertPoint();
                                return [4, this.parent()._transferCRMFromOld(settingsArr[4], new LocalStorageWrapper())];
                            case 2:
                                crm = _a.sent();
                                this.parent().settings.crm = crm;
                                this.parent().editCRM.build();
                                this.parent()._setup.initCheckboxes(this.parent().storageLocal);
                                this.parent().upload();
                                return [3, 4];
                            case 3:
                                alert('This method of importing no longer works, please export all your settings instead');
                                _a.label = 4;
                            case 4: return [3, 6];
                            case 5:
                                e_1 = _a.sent();
                                this.parent().$.importSettingsError.style.display = 'block';
                                return [2];
                            case 6:
                                this.parent().util.showToast(this.parent().___("crmApp_code_importSuccess"));
                                return [2];
                        }
                    });
                });
            };
            ;
            CRMAppListeners.exportData = function () {
                var _this = this;
                var toExport = {};
                if (this.parent().$.exportCRM.checked) {
                    toExport.crm = JSON.parse(JSON.stringify(this.parent().settings.crm));
                    for (var i = 0; i < toExport.crm.length; i++) {
                        toExport.crm[i] = this.parent().editCRM.makeNodeSafe(toExport.crm[i]);
                    }
                }
                if (this.parent().$.exportSettings.checked) {
                    toExport.local = this.parent().storageLocal;
                    toExport.nonLocal = JSON.parse(JSON.stringify(this.parent().settings));
                    delete toExport.nonLocal.crm;
                }
                window.doc.exportSettingsSpinner.hide = false;
                window.setTimeout(function () {
                    _this.parent().$.exportSettingsOutput.value = JSON.stringify(toExport);
                    window.requestAnimationFrame(function () {
                        window.doc.exportSettingsSpinner.hide = true;
                    });
                }, 100);
            };
            ;
            CRMAppListeners.addGlobalExcludeField = function () {
                this.parent().push('globalExcludes', '');
            };
            ;
            CRMAppListeners._openLogging = function () {
                window.open(browserAPI.runtime.getURL('html/logging.html'), '_blank');
            };
            ;
            CRMAppListeners.hideGenericToast = function () {
                this.parent().$.messageToast.hide();
            };
            ;
            CRMAppListeners.nextUpdatedScript = function () {
                var index = this.parent().$.scriptUpdatesToast.index;
                this.parent().$.scriptUpdatesToast.text = this.parent()._getUpdatedScriptString(this.parent().$.scriptUpdatesToast.scripts[++index]);
                this.parent().$.scriptUpdatesToast.index = index;
                if (this.parent().$.scriptUpdatesToast.scripts.length - index > 1) {
                    this.parent().$.nextScriptUpdateButton.style.display = 'inline';
                }
                else {
                    this.parent().$.nextScriptUpdateButton.style.display = 'none';
                }
            };
            ;
            CRMAppListeners.hideScriptUpdatesToast = function () {
                this.parent().$.scriptUpdatesToast.hide();
            };
            ;
            CRMAppListeners._copyFromElement = function (target, button) {
                var snipRange = document.createRange();
                snipRange.selectNode(target);
                var selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(snipRange);
                try {
                    document.execCommand('copy');
                    button.icon = 'done';
                }
                catch (err) {
                    console.error(err);
                    button.icon = 'error';
                }
                this.parent().async(function () {
                    button.icon = 'content-copy';
                }, 1000);
                selection.removeAllRanges();
            };
            CRMAppListeners.copyExportDialogToClipboard = function () {
                this._copyFromElement(this.parent().$.exportJSONData, this.parent().$.dialogCopyButton);
            };
            ;
            CRMAppListeners.copyExportToClipboard = function () {
                this._copyFromElement(this.parent().$.exportSettingsOutput, this.parent().$.exportCopyButton);
            };
            CRMAppListeners.goNextVersionUpdateTab = function () {
                var _this = this;
                if (this.parent().versionUpdateTab === 4) {
                    this.parent().$.versionUpdateDialog.close();
                }
                else {
                    var nextTabIndex_1 = this.parent().versionUpdateTab + 1;
                    var tabs = document.getElementsByClassName('versionUpdateTab');
                    var selector_1 = tabs[nextTabIndex_1];
                    selector_1.style.height = 'auto';
                    var i = void 0;
                    for (i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = 'none';
                    }
                    var newHeight = $(selector_1).innerHeight();
                    for (i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = 'block';
                    }
                    selector_1.style.height = '0';
                    var newHeightPx_1 = newHeight + 'px';
                    var tabCont_1 = this.parent().$.versionUpdateTabSlider;
                    var currentHeight_1 = tabCont_1.getBoundingClientRect().height;
                    if (newHeight > currentHeight_1) {
                        tabCont_1.animate([
                            {
                                height: currentHeight_1 + 'px'
                            }, {
                                height: newHeightPx_1
                            }
                        ], {
                            duration: 500,
                            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                        }).onfinish = function () {
                            tabCont_1.style.height = newHeightPx_1;
                            selector_1.style.height = 'auto';
                            _this.parent().versionUpdateTab = nextTabIndex_1;
                        };
                    }
                    else {
                        selector_1.style.height = 'auto';
                        this.parent().versionUpdateTab = nextTabIndex_1;
                        setTimeout(function () {
                            tabCont_1.animate([
                                {
                                    height: currentHeight_1 + 'px'
                                }, {
                                    height: newHeightPx_1
                                }
                            ], {
                                duration: 500,
                                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                            }).onfinish = function () {
                                tabCont_1.style.height = newHeightPx_1;
                            };
                        }, 500);
                    }
                }
            };
            CRMAppListeners.goPrevVersionUpdateTab = function () {
                var _this = this;
                if (this.parent().versionUpdateTab !== 0) {
                    var prevTabIndex_1 = this.parent().versionUpdateTab - 1;
                    var tabs = document.getElementsByClassName('versionUpdateTab');
                    var selector_2 = tabs[prevTabIndex_1];
                    selector_2.style.height = 'auto';
                    var i = void 0;
                    for (i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = 'none';
                    }
                    var newHeight = $(selector_2).innerHeight();
                    for (i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = 'block';
                    }
                    selector_2.style.height = '0';
                    var newHeightPx_2 = newHeight + 'px';
                    var tabCont_2 = this.parent().$.versionUpdateTabSlider;
                    var currentHeight_2 = tabCont_2.getBoundingClientRect().height;
                    if (newHeight > currentHeight_2) {
                        tabCont_2.animate([{
                                height: currentHeight_2 + 'px'
                            }, {
                                height: newHeightPx_2
                            }], {
                            duration: 500,
                            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                        }).onfinish = function () {
                            tabCont_2.style.height = newHeightPx_2;
                            selector_2.style.height = 'auto';
                            _this.parent().versionUpdateTab = prevTabIndex_1;
                        };
                    }
                    else {
                        selector_2.style.height = 'auto';
                        this.parent().versionUpdateTab = prevTabIndex_1;
                        setTimeout(function () {
                            tabCont_2.animate([{
                                    height: currentHeight_2 + 'px'
                                }, {
                                    height: newHeightPx_2
                                }], {
                                duration: 500,
                                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                            }).onfinish = function () {
                                tabCont_2.style.height = newHeightPx_2;
                            };
                        }, 500);
                    }
                }
            };
            ;
            CRMAppListeners._applyAddedPermissions = function () {
                var _this = this;
                var panels = Array.prototype.slice.apply(window.doc.addedPermissionsTabContainer
                    .querySelectorAll('.nodeAddedPermissionsCont'));
                panels.forEach(function (panel) {
                    var node = _this.parent().nodesById
                        .get(~~panel.getAttribute('data-id'));
                    var permissions = Array.prototype.slice.apply(panel.querySelectorAll('paper-checkbox'))
                        .map(function (checkbox) {
                        if (checkbox.checked) {
                            return checkbox.getAttribute('data-permission');
                        }
                        return null;
                    }).filter(function (permission) {
                        return !!permission;
                    });
                    if (!Array.isArray(node.permissions)) {
                        node.permissions = [];
                    }
                    permissions.forEach(function (addedPermission) {
                        if (node.permissions.indexOf(addedPermission) === -1) {
                            node.permissions.push(addedPermission);
                        }
                    });
                });
                this.parent().upload();
            };
            ;
            CRMAppListeners.addedPermissionNext = function () {
                var cont = window.doc.addedPermissionsTabContainer;
                if (cont.tab === cont.maxTabs - 1) {
                    window.doc.addedPermissionsDialog.close();
                    this._applyAddedPermissions();
                    return;
                }
                if (cont.tab + 2 !== cont.maxTabs) {
                    window.doc.addedPermissionNextButton.querySelector('.close').style.display = 'none';
                    window.doc.addedPermissionNextButton.querySelector('.next').style.display = 'block';
                }
                else {
                    window.doc.addedPermissionNextButton.querySelector('.close').style.display = 'block';
                    window.doc.addedPermissionNextButton.querySelector('.next').style.display = 'none';
                }
                cont.style.marginLeft = (++cont.tab * -800) + 'px';
                window.doc.addedPermissionPrevButton.style.display = 'block';
            };
            ;
            CRMAppListeners.addedPermissionPrev = function () {
                var cont = window.doc.addedPermissionsTabContainer;
                cont.style.marginLeft = (--cont.tab * -800) + 'px';
                window.doc.addedPermissionPrevButton.style.display = (cont.tab === 0 ? 'none' : 'block');
            };
            ;
            CRMAppListeners._getCodeSettingsFromDialog = function () {
                var _this = this;
                var obj = {};
                Array.prototype.slice.apply(this.parent().shadowRoot.querySelectorAll('.codeSettingSetting'))
                    .forEach(function (element) {
                    var value;
                    var key = element.getAttribute('data-key');
                    var type = element.getAttribute('data-type');
                    var currentVal = _this.parent().$.codeSettingsDialog.item.value.options[key];
                    switch (type) {
                        case 'number':
                            value = _this.parent().templates.mergeObjects(currentVal, {
                                value: ~~element.querySelector('paper-input').value
                            });
                            break;
                        case 'string':
                            value = _this.parent().templates.mergeObjects(currentVal, {
                                value: element.querySelector('paper-input').value
                            });
                            break;
                        case 'color':
                            value = _this.parent().templates.mergeObjects(currentVal, {
                                value: element.querySelector('input').value
                            });
                            break;
                        case 'boolean':
                            value = _this.parent().templates.mergeObjects(currentVal, {
                                value: element.querySelector('paper-checkbox').checked
                            });
                            break;
                        case 'choice':
                            value = _this.parent().templates.mergeObjects(currentVal, {
                                selected: element.querySelector('paper-dropdown-menu').selected
                            });
                            break;
                        case 'array':
                            var arrayInput = element.querySelector('paper-array-input');
                            arrayInput.saveSettings();
                            var values = arrayInput.values;
                            if (currentVal.items === 'string') {
                                values = values.map(function (value) { return value + ''; });
                            }
                            else {
                                values = values.map(function (value) { return ~~value; });
                            }
                            value = _this.parent().templates.mergeObjects(currentVal, {
                                value: values
                            });
                            break;
                    }
                    obj[key] = value;
                });
                return obj;
            };
            CRMAppListeners.confirmCodeSettings = function () {
                this.parent().$.codeSettingsDialog.item.value.options = this._getCodeSettingsFromDialog();
                this.parent().upload();
            };
            CRMAppListeners.exitFullscreen = function () {
                window.app.util.getDialog().exitFullScreen();
            };
            CRMAppListeners.toggleFullscreenOptions = function () {
                var dialog = window.app.util.getDialog();
                dialog.toggleOptions();
            };
            CRMAppListeners.setThemeWhite = function () {
                window.app.util.getDialog().setThemeWhite();
            };
            CRMAppListeners.setThemeDark = function () {
                window.app.util.getDialog().setThemeDark();
            };
            CRMAppListeners.fontSizeChange = function () {
                window.app.async(function () {
                    window.app.util.getDialog().fontSizeChange();
                }, 0);
            };
            CRMAppListeners.jsLintGlobalsChange = function () {
                window.app.async(function () {
                    window.scriptEdit.jsLintGlobalsChange();
                }, 0);
            };
            CRMAppListeners.onKeyBindingKeyDown = function (e) {
                if (this.parent().item.type === 'script') {
                    window.scriptEdit.onKeyBindingKeyDown(e);
                }
            };
            CRMAppListeners.parent = function () {
                return window.app;
            };
            return CRMAppListeners;
        }());
        CA.templates = (function () {
            function CRMAppTemplates() {
            }
            CRMAppTemplates.mergeArrays = function (mainArray, additionArray) {
                for (var i = 0; i < additionArray.length; i++) {
                    if (mainArray[i] && typeof additionArray[i] === 'object' &&
                        mainArray[i] !== undefined && mainArray[i] !== null) {
                        if (Array.isArray(additionArray[i])) {
                            mainArray[i] = this.mergeArrays(mainArray[i], additionArray[i]);
                        }
                        else {
                            mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
                        }
                    }
                    else {
                        mainArray[i] = additionArray[i];
                    }
                }
                return mainArray;
            };
            ;
            CRMAppTemplates.mergeObjects = function (mainObject, additions) {
                for (var key in additions) {
                    if (additions.hasOwnProperty(key)) {
                        if (typeof additions[key] === 'object' &&
                            typeof mainObject[key] === 'object' &&
                            mainObject[key] !== undefined &&
                            mainObject[key] !== null) {
                            if (Array.isArray(additions[key])) {
                                mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
                            }
                            else {
                                mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
                            }
                        }
                        else {
                            mainObject[key] = additions[key];
                        }
                    }
                }
                return mainObject;
            };
            ;
            CRMAppTemplates.mergeArraysWithoutAssignment = function (mainArray, additionArray) {
                for (var i = 0; i < additionArray.length; i++) {
                    if (mainArray[i] && typeof additionArray[i] === 'object' &&
                        mainArray[i] !== undefined && mainArray[i] !== null) {
                        if (Array.isArray(additionArray[i])) {
                            this.mergeArraysWithoutAssignment(mainArray[i], additionArray[i]);
                        }
                        else {
                            this.mergeObjectsWithoutAssignment(mainArray[i], additionArray[i]);
                        }
                    }
                    else {
                        mainArray[i] = additionArray[i];
                    }
                }
            };
            CRMAppTemplates.mergeObjectsWithoutAssignment = function (mainObject, additions) {
                for (var key in additions) {
                    if (additions.hasOwnProperty(key)) {
                        if (typeof additions[key] === 'object' &&
                            mainObject[key] !== undefined &&
                            mainObject[key] !== null) {
                            if (Array.isArray(additions[key])) {
                                this.mergeArraysWithoutAssignment(mainObject[key], additions[key]);
                            }
                            else {
                                this.mergeObjectsWithoutAssignment(mainObject[key], additions[key]);
                            }
                        }
                        else {
                            mainObject[key] = additions[key];
                        }
                    }
                }
            };
            CRMAppTemplates.getDefaultNodeInfo = function (options) {
                if (options === void 0) { options = {}; }
                var defaultNodeInfo = {
                    permissions: [],
                    installDate: new Date().toLocaleDateString(),
                    lastUpdatedAt: Date.now(),
                    version: '1.0',
                    isRoot: false,
                    source: 'local'
                };
                return this.mergeObjects(defaultNodeInfo, options);
            };
            ;
            CRMAppTemplates.getDefaultLinkNode = function (options) {
                if (options === void 0) { options = {}; }
                var defaultNode = {
                    name: this.parent().___("crm_exampleLinkName"),
                    onContentTypes: [true, true, true, false, false, false],
                    type: 'link',
                    showOnSpecified: false,
                    nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                    triggers: [{
                            url: '*://*.example.com/*',
                            not: false
                        }],
                    isLocal: true,
                    value: [
                        {
                            newTab: true,
                            url: 'https://www.example.com'
                        }
                    ]
                };
                return this.mergeObjects(defaultNode, options);
            };
            ;
            CRMAppTemplates.getDefaultStylesheetValue = function (options) {
                if (options === void 0) { options = {}; }
                var value = {
                    stylesheet: [].join('\n'),
                    launchMode: 0,
                    toggle: false,
                    defaultOn: false,
                    options: {},
                    convertedStylesheet: null
                };
                return this.mergeObjects(value, options);
            };
            ;
            CRMAppTemplates.getDefaultScriptValue = function (options) {
                if (options === void 0) { options = {}; }
                var value = {
                    launchMode: 0,
                    backgroundLibraries: [],
                    libraries: [],
                    script: [].join('\n'),
                    backgroundScript: '',
                    metaTags: {},
                    options: {},
                    ts: {
                        enabled: false,
                        backgroundScript: {},
                        script: {}
                    }
                };
                return this.mergeObjects(value, options);
            };
            ;
            CRMAppTemplates.getDefaultScriptNode = function (options) {
                if (options === void 0) { options = {}; }
                var defaultNode = {
                    name: this.parent().___("crm_exampleScriptName"),
                    onContentTypes: [true, true, true, false, false, false],
                    type: 'script',
                    isLocal: true,
                    nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                    triggers: [
                        {
                            url: '*://*.example.com/*',
                            not: false
                        }
                    ],
                    value: this.getDefaultScriptValue(options.value)
                };
                return this.mergeObjects(defaultNode, options);
            };
            ;
            CRMAppTemplates.getDefaultStylesheetNode = function (options) {
                if (options === void 0) { options = {}; }
                var defaultNode = {
                    name: this.parent().___("crm_exampleStylesheetName"),
                    onContentTypes: [true, true, true, false, false, false],
                    type: 'stylesheet',
                    isLocal: true,
                    nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                    triggers: [
                        {
                            url: '*://*.example.com/*',
                            not: false
                        }
                    ],
                    value: this.getDefaultStylesheetValue(options.value)
                };
                return this.mergeObjects(defaultNode, options);
            };
            ;
            CRMAppTemplates.getDefaultDividerOrMenuNode = function (options, type) {
                if (options === void 0) { options = {}; }
                var defaultNode = {
                    name: type === 'menu' ?
                        this.parent().___("crm_exampleMenuName") :
                        this.parent().___("crm_exampleDividerName"),
                    type: type,
                    nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                    onContentTypes: [true, true, true, false, false, false],
                    isLocal: true,
                    value: null,
                    children: type === 'menu' ? [] : undefined
                };
                return this.mergeObjects(defaultNode, options);
            };
            ;
            CRMAppTemplates.getDefaultDividerNode = function (options) {
                if (options === void 0) { options = {}; }
                return this.getDefaultDividerOrMenuNode(options, 'divider');
            };
            ;
            CRMAppTemplates.getDefaultMenuNode = function (options) {
                if (options === void 0) { options = {}; }
                return this.getDefaultDividerOrMenuNode(options, 'menu');
            };
            ;
            CRMAppTemplates.getDefaultNodeOfType = function (type, options) {
                if (options === void 0) { options = {}; }
                switch (type) {
                    case 'link':
                        return this.getDefaultLinkNode(options);
                    case 'script':
                        return this.getDefaultScriptNode(options);
                    case 'divider':
                        return this.getDefaultDividerNode(options);
                    case 'menu':
                        return this.getDefaultMenuNode(options);
                    case 'stylesheet':
                        return this.getDefaultStylesheetNode(options);
                }
            };
            CRMAppTemplates.getPermissions = function () {
                return [
                    'alarms',
                    'activeTab',
                    'background',
                    'bookmarks',
                    'browsingData',
                    'clipboardRead',
                    'clipboardWrite',
                    'contentSettings',
                    'cookies',
                    'contentSettings',
                    'contextMenus',
                    'declarativeContent',
                    'desktopCapture',
                    'downloads',
                    'history',
                    'identity',
                    'idle',
                    'management',
                    'pageCapture',
                    'power',
                    'privacy',
                    'printerProvider',
                    'sessions',
                    'system.cpu',
                    'system.memory',
                    'system.storage',
                    'topSites',
                    'tabs',
                    'tabCapture',
                    'tts',
                    'webNavigation',
                    'webRequest',
                    'webRequestBlocking'
                ];
            };
            ;
            CRMAppTemplates.getScriptPermissions = function () {
                return [
                    'alarms',
                    'activeTab',
                    'background',
                    'bookmarks',
                    'browsingData',
                    'clipboardRead',
                    'clipboardWrite',
                    'contentSettings',
                    'cookies',
                    'contentSettings',
                    'contextMenus',
                    'declarativeContent',
                    'desktopCapture',
                    'downloads',
                    'history',
                    'identity',
                    'idle',
                    'management',
                    'pageCapture',
                    'power',
                    'privacy',
                    'printerProvider',
                    'sessions',
                    'system.cpu',
                    'system.memory',
                    'system.storage',
                    'topSites',
                    'tabs',
                    'tabCapture',
                    'tts',
                    'webNavigation',
                    'webRequest',
                    'webRequestBlocking',
                    'crmGet',
                    'crmWrite',
                    'crmRun',
                    'crmContextmenu',
                    'chrome',
                    'browser',
                    'GM_info',
                    'GM_deleteValue',
                    'GM_getValue',
                    'GM_listValues',
                    'GM_setValue',
                    'GM_getResourceText',
                    'GM_getResourceURL',
                    'GM_addStyle',
                    'GM_log',
                    'GM_openInTab',
                    'GM_registerMenuCommand',
                    'GM_setClipboard',
                    'GM_xmlhttpRequest',
                    'unsafeWindow'
                ];
            };
            ;
            CRMAppTemplates.getPermissionDescription = function (permission) {
                var descriptions = {
                    alarms: this.parent().___("permissions_alarms"),
                    activeTab: this.parent().___("permissions_activeTab"),
                    background: this.parent().___("permissions_background"),
                    bookmarks: this.parent().___("permissions_bookmarks"),
                    browsingData: this.parent().___("permissions_browsingData"),
                    clipboardRead: this.parent().___("permissions_clipboardRead"),
                    clipboardWrite: this.parent().___("permissions_clipboardWrite"),
                    cookies: this.parent().___("permissions_cookies"),
                    contentSettings: this.parent().___("permissions_contentSettings"),
                    contextMenus: this.parent().___("permissions_contextMenus"),
                    declarativeContent: this.parent().___("permissions_declarativeContent"),
                    desktopCapture: this.parent().___("permissions_desktopCapture"),
                    downloads: this.parent().___("permissions_downloads"),
                    history: this.parent().___("permissions_history"),
                    identity: this.parent().___("permissions_identity"),
                    idle: this.parent().___("permissions_idle"),
                    management: this.parent().___("permissions_management"),
                    notifications: this.parent().___("permissions_notifications"),
                    pageCapture: this.parent().___("permissions_pageCapture"),
                    power: this.parent().___("permissions_power"),
                    privacy: this.parent().___("permissions_privacy"),
                    printerProvider: this.parent().___("permissions_printerProvider"),
                    sessions: this.parent().___("permissions_sessions"),
                    "system.cpu": this.parent().___("permissions_systemcpu"),
                    "system.memory": this.parent().___("permissions_systemmemory"),
                    "system.storage": this.parent().___("permissions_systemstorage"),
                    topSites: this.parent().___("permissions_topSites"),
                    tabCapture: this.parent().___("permissions_tabCapture"),
                    tabs: this.parent().___("permissions_tabs"),
                    tts: this.parent().___("permissions_tts"),
                    webNavigation: this.parent().___("permissions_webNavigation") +
                        ' (https://developer.chrome.com/extensions/webNavigation)',
                    webRequest: this.parent().___("permissions_webRequest"),
                    webRequestBlocking: this.parent().___("permissions_webRequestBlocking"),
                    crmGet: this.parent().___("permissions_crmGet"),
                    crmWrite: this.parent().___("permissions_crmWrite"),
                    crmRun: this.parent().___("permissions_crmRun"),
                    crmContextmenu: this.parent().___("permissions_crmContextmenu"),
                    chrome: this.parent().___("permissions_chrome"),
                    browser: this.parent().___("permissions_browser"),
                    GM_addStyle: this.parent().___("permissions_GMAddStyle"),
                    GM_deleteValue: this.parent().___("permissions_GMDeleteValue"),
                    GM_listValues: this.parent().___("permissions_GMListValues"),
                    GM_addValueChangeListener: this.parent().___("permissions_GMAddValueChangeListener"),
                    GM_removeValueChangeListener: this.parent().___("permissions_GMRemoveValueChangeListener"),
                    GM_setValue: this.parent().___("permissions_GMSetValue"),
                    GM_getValue: this.parent().___("permissions_GMGetValue"),
                    GM_log: this.parent().___("permissions_GMLog"),
                    GM_getResourceText: this.parent().___("permissions_GMGetResourceText"),
                    GM_getResourceURL: this.parent().___("permissions_GMGetResourceURL"),
                    GM_registerMenuCommand: this.parent().___("permissions_GMRegisterMenuCommand"),
                    GM_unregisterMenuCommand: this.parent().___("permissions_GMUnregisterMenuCommand"),
                    GM_openInTab: this.parent().___("permissions_GMOpenInTab"),
                    GM_xmlhttpRequest: this.parent().___("permissions_GMXmlhttpRequest"),
                    GM_download: this.parent().___("permissions_GMDownload"),
                    GM_getTab: this.parent().___("permissions_GMGetTab"),
                    GM_saveTab: this.parent().___("permissions_GMSaveTab"),
                    GM_getTabs: this.parent().___("permissions_GMGetTabs"),
                    GM_notification: this.parent().___("permissions_GMNotification"),
                    GM_setClipboard: this.parent().___("permissions_GMSetClipboard"),
                    GM_info: this.parent().___("permissions_GMInfo"),
                    unsafeWindow: this.parent().___("permissions_unsafeWindow")
                };
                return descriptions[permission];
            };
            ;
            CRMAppTemplates.parent = function () {
                return window.app;
            };
            return CRMAppTemplates;
        }());
        CA.crm = (function () {
            function CRMAppCRMFunctions() {
            }
            CRMAppCRMFunctions.getI18NNodeType = function (nodeType) {
                switch (nodeType) {
                    case 'link':
                        return this._parent().___("crm_link");
                    case 'script':
                        return this._parent().___("crm_script");
                    case 'stylesheet':
                        return this._parent().___("crm_stylesheet");
                    case 'menu':
                        return this._parent().___("crm_menu");
                    case 'divider':
                        return this._parent().___("crm_divider");
                }
            };
            CRMAppCRMFunctions.lookup = function (path, returnArray) {
                if (returnArray === void 0) { returnArray = false; }
                var pathCopy = JSON.parse(JSON.stringify(path));
                if (returnArray) {
                    pathCopy.splice(pathCopy.length - 1, 1);
                }
                if (path.length === 0) {
                    return window.app.settings.crm;
                }
                if (path.length === 1) {
                    return (returnArray ? window.app.settings.crm : window.app.settings.crm[path[0]]);
                }
                var currentTree = window.app.settings.crm;
                var currentItem = null;
                var parent = null;
                for (var i = 0; i < path.length; i++) {
                    parent = currentTree;
                    if (i !== path.length - 1) {
                        currentTree = currentTree[path[i]].children;
                    }
                    else {
                        currentItem = currentTree[path[i]];
                    }
                }
                return (returnArray ? parent : currentItem);
            };
            ;
            CRMAppCRMFunctions._lookupId = function (id, returnArray, node) {
                var nodeChildren = node.children;
                if (nodeChildren) {
                    var el = void 0;
                    for (var i = 0; i < nodeChildren.length; i++) {
                        if (nodeChildren[i].id === id) {
                            return (returnArray ? nodeChildren : node);
                        }
                        el = this._lookupId(id, returnArray, nodeChildren[i]);
                        if (el) {
                            return el;
                        }
                    }
                }
                return null;
            };
            ;
            CRMAppCRMFunctions.lookupId = function (id, returnArray) {
                if (!returnArray) {
                    return window.app.nodesById.get(id);
                }
                var el;
                for (var i = 0; i < window.app.settings.crm.length; i++) {
                    if (window.app.settings.crm[i].id === id) {
                        return window.app.settings.crm;
                    }
                    el = this._lookupId(id, returnArray, window.app.settings.crm[i]);
                    if (el) {
                        return el;
                    }
                }
                return null;
            };
            ;
            CRMAppCRMFunctions.add = function (value, position) {
                if (position === void 0) { position = 'last'; }
                if (position === 'first') {
                    this._parent().settings.crm = this._parent().util.insertInto(value, this._parent().settings.crm, 0);
                }
                else if (position === 'last' || position === undefined) {
                    this._parent().settings.crm[this._parent().settings.crm.length] = value;
                }
                else {
                    this._parent().settings.crm = this._parent().util.insertInto(value, this._parent().settings.crm);
                }
                window.app.upload();
                window.app.editCRM.build({
                    setItems: window.app.editCRM.setMenus
                });
            };
            ;
            CRMAppCRMFunctions.move = function (toMove, target) {
                var toMoveContainer = this.lookup(toMove, true);
                var toMoveIndex = toMove[toMove.length - 1];
                var toMoveItem = toMoveContainer[toMoveIndex];
                var newTarget = this.lookup(target, true);
                var targetIndex = target[target.length - 1];
                var sameColumn = toMoveContainer === newTarget;
                if (sameColumn && toMoveIndex > targetIndex) {
                    this._parent().util.insertInto(toMoveItem, newTarget, targetIndex);
                    toMoveContainer.splice((~~toMoveIndex) + 1, 1);
                }
                else {
                    this._parent().util.insertInto(toMoveItem, newTarget, sameColumn ? targetIndex + 1 : targetIndex);
                    toMoveContainer.splice(toMoveIndex, 1);
                }
                window.app.upload();
                for (var i = 1; i <= window.app.editCRM.setMenus.length - 1; i++) {
                    var lookedup = this.lookup(window.app.editCRM.setMenus.slice(0, i), false);
                    if (!lookedup || lookedup.type !== 'menu') {
                        window.app.editCRM.setMenus = [-1];
                        break;
                    }
                }
                window.app.editCRM.build({
                    setItems: window.app.editCRM.setMenus,
                    quick: true
                });
            };
            ;
            CRMAppCRMFunctions.buildNodePaths = function (tree, currentPath) {
                if (currentPath === void 0) { currentPath = []; }
                for (var i = 0; i < tree.length; i++) {
                    var childPath = currentPath.concat([i]);
                    var node = tree[i];
                    node.path = childPath;
                    if (node.children) {
                        this.buildNodePaths(node.children, childPath);
                    }
                }
            };
            ;
            CRMAppCRMFunctions._parent = function () {
                return window.app;
            };
            return CRMAppCRMFunctions;
        }());
        CA.util = (_d = (function () {
                function CRMAppUtil() {
                }
                CRMAppUtil.iteratePath = function (e, condition) {
                    var index = 0;
                    var path = this.getPath(e);
                    var result = condition(path[index]);
                    while (path[index + 1] && result === null) {
                        result = condition(path[++index]);
                    }
                    return result;
                };
                CRMAppUtil.arraysOverlap = function (arr1, arr2) {
                    for (var i = 0; i < arr1.length; i++) {
                        if (arr1[i] && arr2[i]) {
                            return true;
                        }
                    }
                    return false;
                };
                CRMAppUtil.wait = function (time) {
                    return new Promise(function (resolve) {
                        window.setTimeout(function () {
                            resolve(null);
                        }, time);
                    });
                };
                CRMAppUtil.createArray = function (length) {
                    var arr = [];
                    for (var i = 0; i < length; i++) {
                        arr[i] = undefined;
                    }
                    return arr;
                };
                CRMAppUtil.getChromeVersion = function () {
                    return this.parent().getChromeVersion();
                };
                CRMAppUtil.xhr = function (path, local) {
                    return new Promise(function (resolve, reject) {
                        var xhr = new window.XMLHttpRequest();
                        xhr.open('GET', local ?
                            browserAPI.runtime.getURL(path) : path);
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === XMLHttpRequest.DONE) {
                                if (xhr.status === 200) {
                                    resolve(xhr.responseText);
                                }
                                else {
                                    reject(xhr.status);
                                }
                            }
                        };
                        xhr.send();
                    });
                };
                CRMAppUtil.showToast = function (text) {
                    var toast = window.app.$.messageToast;
                    toast.text = text;
                    toast.show();
                };
                CRMAppUtil.createElement = function (tagName, options, children) {
                    if (children === void 0) { children = []; }
                    var el = document.createElement(tagName);
                    options.id && (el.id = options.id);
                    options.classes && el.classList.add.apply(el.classList, options.classes);
                    for (var key in options.props || {}) {
                        el.setAttribute(key, options.props[key] + '');
                    }
                    options.onclick && el.addEventListener('click', function (e) {
                        options.onclick(el, e);
                    });
                    options.onhover && el.addEventListener('mouseenter', function (e) {
                        options.onhover(el, e);
                    });
                    options.onblur && el.addEventListener('mouseleave', function (e) {
                        options.onblur(el, e);
                    });
                    options.ref && options.ref(el);
                    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                        var child = children_1[_i];
                        if (typeof child === 'string') {
                            el.innerText = child;
                        }
                        else {
                            el.appendChild(child);
                        }
                    }
                    return el;
                };
                CRMAppUtil.createSVG = function (tag, options, children) {
                    if (children === void 0) { children = []; }
                    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
                    options.id && (el.id = options.id);
                    options.classes && el.classList.add.apply(el.classList, options.classes);
                    for (var key in options.props || {}) {
                        el.setAttributeNS(null, key, options.props[key] + '');
                    }
                    for (var _i = 0, children_2 = children; _i < children_2.length; _i++) {
                        var child = children_2[_i];
                        el.appendChild(child);
                    }
                    return el;
                };
                CRMAppUtil._toArray = function (iterable) {
                    var arr = [];
                    for (var i = 0; i < iterable.length; i++) {
                        arr.push(iterable[i]);
                    }
                    return arr;
                };
                CRMAppUtil._generatePathFrom = function (element) {
                    var path = [];
                    while (element) {
                        path.push(element);
                        element = element.parentElement;
                    }
                    path.push(document.documentElement, window);
                    return path;
                };
                CRMAppUtil.getPath = function (e) {
                    if ('path' in e && e.path) {
                        return this._toArray(e.path);
                    }
                    else if ('Aa' in e && e.Aa) {
                        return this._toArray(e.Aa);
                    }
                    return this._generatePathFrom(e.target);
                };
                CRMAppUtil.getDummy = function () {
                    if (this._dummy) {
                        return this._dummy;
                    }
                    this._dummy = document.createElement('div');
                    this.parent().appendChild(this._dummy);
                    return this._dummy;
                };
                CRMAppUtil.findElementWithTagname = function (event, tagName) {
                    return this.iteratePath(event, function (node) {
                        if (node && 'tagName' in node &&
                            node.tagName.toLowerCase() === tagName) {
                            return node;
                        }
                        return null;
                    });
                };
                CRMAppUtil.findElementWithClassName = function (event, className) {
                    return this.iteratePath(event, function (node) {
                        if (node && 'classList' in node &&
                            node.classList.contains(className)) {
                            return node;
                        }
                        return null;
                    });
                };
                ;
                CRMAppUtil.findElementWithId = function (event, id) {
                    return this.iteratePath(event, function (node) {
                        if (node && 'id' in node &&
                            node.id === id) {
                            return node;
                        }
                        return null;
                    });
                };
                CRMAppUtil.insertInto = function (toAdd, target, position) {
                    if (position === void 0) { position = null; }
                    if (position !== null) {
                        var temp1 = void 0, i = void 0;
                        var temp2 = toAdd;
                        for (i = position; i < target.length; i++) {
                            temp1 = target[i];
                            target[i] = temp2;
                            temp2 = temp1;
                        }
                        target[i] = temp2;
                    }
                    else {
                        target.push(toAdd);
                    }
                    return target;
                };
                ;
                CRMAppUtil.compareObj = function (firstObj, secondObj) {
                    if (!secondObj) {
                        return !firstObj;
                    }
                    if (!firstObj) {
                        return false;
                    }
                    for (var key in firstObj) {
                        if (firstObj.hasOwnProperty(key)) {
                            if (typeof firstObj[key] === 'object') {
                                if (typeof secondObj[key] !== 'object') {
                                    return false;
                                }
                                if (Array.isArray(firstObj[key])) {
                                    if (!Array.isArray(secondObj[key])) {
                                        return false;
                                    }
                                    if (!this.compareArray(firstObj[key], secondObj[key])) {
                                        return false;
                                    }
                                }
                                else if (Array.isArray(secondObj[key])) {
                                    return false;
                                }
                                else {
                                    if (!this.compareObj(firstObj[key], secondObj[key])) {
                                        return false;
                                    }
                                }
                            }
                            else if (firstObj[key] !== secondObj[key]) {
                                return false;
                            }
                        }
                    }
                    return true;
                };
                ;
                CRMAppUtil.compareArray = function (firstArray, secondArray) {
                    if (!firstArray !== !secondArray) {
                        return false;
                    }
                    else if (!firstArray || !secondArray) {
                        return false;
                    }
                    var firstLength = firstArray.length;
                    if (firstLength !== secondArray.length) {
                        return false;
                    }
                    var i;
                    for (i = 0; i < firstLength; i++) {
                        if (typeof firstArray[i] === 'object') {
                            if (typeof secondArray[i] !== 'object') {
                                return false;
                            }
                            if (Array.isArray(firstArray[i])) {
                                if (!Array.isArray(secondArray[i])) {
                                    return false;
                                }
                                if (!this.compareArray(firstArray[i], secondArray[i])) {
                                    return false;
                                }
                            }
                            else if (Array.isArray(secondArray[i])) {
                                return false;
                            }
                            else {
                                if (!this.compareObj(firstArray[i], secondArray[i])) {
                                    return false;
                                }
                            }
                        }
                        else if (firstArray[i] !== secondArray[i]) {
                            return false;
                        }
                    }
                    return true;
                };
                CRMAppUtil.treeForEach = function (node, fn) {
                    fn(node);
                    if (node.children) {
                        for (var i = 0; i < node.children.length; i++) {
                            this.treeForEach(node.children[i], fn);
                        }
                    }
                };
                CRMAppUtil.crmForEach = function (tree, fn) {
                    for (var i = 0; i < tree.length; i++) {
                        var node = tree[i];
                        if (node.type === 'menu' && node.children) {
                            this.crmForEach(node.children, fn);
                        }
                        fn(node);
                    }
                    return tree;
                };
                ;
                CRMAppUtil.getQuerySlot = function () {
                    return window.Polymer.PaperDropdownBehavior.querySlot;
                };
                CRMAppUtil.getDialog = function () {
                    return this.parent().item.type === 'script' ?
                        window.scriptEdit : window.stylesheetEdit;
                };
                CRMAppUtil.parent = function () {
                    return window.app;
                };
                return CRMAppUtil;
            }()),
            _d._dummy = null,
            _d);
        CA.pageDemo = (_e = (function () {
                function CRMAppPageDemo() {
                }
                CRMAppPageDemo._setContentTypeClasses = function (el, node) {
                    var contentTypes = node.onContentTypes;
                    for (var i = 0; i < contentTypes.length; i++) {
                        contentTypes[i] && el.classList.add("contentType" + i);
                    }
                };
                CRMAppPageDemo._editNodeFromClick = function (node) {
                    if (window.app.item) {
                        window.app.$.messageToast.text = this.parent().___("crmApp_code_alreadyEditingNode");
                        window.app.$.messageToast.show();
                    }
                    else {
                        var elements = window.app.editCRM.shadowRoot.querySelectorAll('edit-crm-item');
                        for (var i = 0; i < elements.length; i++) {
                            var element = elements[i];
                            if (element.item && element.item.id && element.item.id === node.id) {
                                element.openEditPage();
                                break;
                            }
                        }
                    }
                };
                CRMAppPageDemo._genDividerNode = function (node) {
                    var _this = this;
                    return this.parent().util.createElement('div', {
                        classes: ['contextMenuDivider'],
                        props: {
                            title: node.name
                        },
                        onclick: function () {
                            if (window.app.storageLocal.editCRMInRM) {
                                _this._editNodeFromClick(node);
                            }
                        }
                    });
                };
                CRMAppPageDemo._genLinkNode = function (node) {
                    var _this = this;
                    return this.parent().util.createElement('div', {
                        classes: ['contextMenuLink'],
                        onclick: function () {
                            if (window.app.storageLocal.editCRMInRM) {
                                _this._editNodeFromClick(node);
                            }
                            else {
                                node.value.forEach(function (link) {
                                    window.open(link.url, '_blank');
                                });
                            }
                        },
                        props: {
                            title: "Link node " + node.name
                        }
                    }, [
                        this.parent().util.createElement('div', {
                            classes: ['contextMenuLinkText']
                        }, [node.name])
                    ]);
                };
                CRMAppPageDemo._genScriptNode = function (node) {
                    var _this = this;
                    return this.parent().util.createElement('div', {
                        classes: ['contextMenuScript'],
                        onclick: function () {
                            if (window.app.storageLocal.editCRMInRM) {
                                _this._editNodeFromClick(node);
                            }
                            else {
                                window.app.$.messageToast.text = _this.parent().___("crmApp_code_wouldExecuteScript");
                                window.app.$.messageToast.show();
                            }
                        },
                        props: {
                            title: "Script node " + node.name
                        }
                    }, [
                        this.parent().util.createElement('div', {
                            classes: ['contextMenuScriptText']
                        }, [node.name])
                    ]);
                };
                CRMAppPageDemo._genStylesheetNode = function (node) {
                    var _this = this;
                    return this.parent().util.createElement('div', {
                        classes: ['contextMenuStylesheet'],
                        onclick: function () {
                            if (window.app.storageLocal.editCRMInRM) {
                                _this._editNodeFromClick(node);
                            }
                            else {
                                window.app.$.messageToast.text = _this.parent().___("crmApp_code_wouldExecuteStylesheet");
                                window.app.$.messageToast.show();
                            }
                        },
                        props: {
                            title: "Stylesheet node " + node.name
                        }
                    }, [
                        this.parent().util.createElement('div', {
                            classes: ['contextMenuStylesheetText']
                        }, [node.name])
                    ]);
                };
                CRMAppPageDemo._genMenuNode = function (node) {
                    var _this = this;
                    var timer = null;
                    var thisEl = null;
                    var container = null;
                    var childrenContainer = null;
                    return this.parent().util.createElement('div', {
                        classes: ['contextMenuMenu'],
                        ref: function (el) {
                            thisEl = el;
                        },
                        onclick: function () {
                            if (window.app.storageLocal.editCRMInRM) {
                                _this._editNodeFromClick(node);
                            }
                            else {
                                window.app.$.messageToast.text = _this.parent().___("crmApp_code_wouldExecuteStylesheet");
                                thisEl.parentElement.classList.add('forcedVisible');
                                timer && window.clearTimeout(timer);
                                timer = window.setTimeout(function () {
                                    thisEl.parentElement.classList.remove('forcedVisible');
                                    childrenContainer.classList.add('hidden');
                                    container.classList.remove('hover');
                                    timer = null;
                                }, 3000);
                            }
                        },
                        onhover: function (_el, e) {
                            if (!thisEl.parentElement.classList.contains('forcedVisible')) {
                                childrenContainer.classList.remove('hidden');
                                container.classList.add('hover');
                                e.stopPropagation();
                            }
                        },
                        onblur: function (_el, e) {
                            if (!thisEl.parentElement.classList.contains('forcedVisible')) {
                                childrenContainer.classList.add('hidden');
                                container.classList.remove('hover');
                                e.stopPropagation();
                            }
                        },
                        props: {
                            title: "Menu node " + node.name
                        }
                    }, [
                        this.parent().util.createElement('div', {
                            classes: ['contextMenuMenuContainer'],
                            ref: function (_container) {
                                container = _container;
                            }
                        }, [
                            this.parent().util.createElement('div', {
                                classes: ['contextMenuMenuText']
                            }, [node.name]),
                            this.parent().util.createElement('div', {
                                classes: ['contextMenuMenuArrow']
                            }, [
                                this.parent().util.createSVG('svg', {
                                    classes: ['contextMenuMenuArrowImage'],
                                    props: {
                                        width: '48',
                                        height: '48',
                                        viewBox: '0 0 48 48'
                                    }
                                }, [
                                    this.parent().util.createSVG('path', {
                                        props: {
                                            d: 'M16 10v28l22-14z'
                                        }
                                    })
                                ])
                            ])
                        ]),
                        this.parent().util.createElement('div', {
                            classes: ['contextMenuMenuSubmenu',
                                'contextMenuMenuChildren', 'hidden'],
                            ref: function (el) {
                                childrenContainer = el;
                            }
                        }, (node.children || []).map(function (childNode) { return _this._genNode(childNode); }))
                    ]);
                };
                CRMAppPageDemo._genNodeElement = function (node) {
                    switch (node.type) {
                        case 'divider':
                            return this._genDividerNode(node);
                        case 'link':
                            return this._genLinkNode(node);
                        case 'script':
                            return this._genScriptNode(node);
                        case 'stylesheet':
                            return this._genStylesheetNode(node);
                        case 'menu':
                            return this._genMenuNode(node);
                    }
                };
                CRMAppPageDemo._genNode = function (node) {
                    var el = this._genNodeElement(node);
                    el.classList.add('contextMenuNode');
                    if (window.app.storageLocal.editCRMInRM) {
                        el.classList.add('clickable');
                    }
                    this._setContentTypeClasses(el, node);
                    return el;
                };
                CRMAppPageDemo._genMenu = function () {
                    var root = document.createElement('div');
                    root.classList.add('contextMenuRoot', 'contextMenuMenuSubmenu', 'rootHidden');
                    var crm = window.app.settings.crm;
                    for (var _i = 0, crm_1 = crm; _i < crm_1.length; _i++) {
                        var node = crm_1[_i];
                        root.appendChild(this._genNode(node));
                    }
                    return root;
                };
                CRMAppPageDemo._setAllContentTypeClasses = function (el, op) {
                    var _a;
                    var arr = [
                        undefined, undefined, undefined, undefined, undefined, undefined
                    ];
                    (_a = el.classList)[op].apply(_a, arr.map(function (_item, i) { return "hidden" + i; }));
                    el.classList[op]('rootHidden');
                };
                CRMAppPageDemo._setMenuPosition = function (menu, e) {
                    menu.style.left = e.clientX + "px";
                    menu.classList.remove('rootHidden');
                    var bcr = menu.getBoundingClientRect();
                    menu.classList.add('rootHidden');
                    if (window.innerHeight > bcr.height + e.clientY) {
                        menu.style.top = e.clientY + "px";
                    }
                    else {
                        menu.style.top = e.clientY - bcr.height + "px";
                    }
                };
                CRMAppPageDemo._showMenu = function (menu, e) {
                    this._setMenuPosition(menu, e);
                    if (window.app.util.findElementWithId(e, 'mainCont')) {
                        for (var i = 0; i < 6; i++) {
                            if (window.app.crmTypes[i]) {
                                menu.classList.remove("hidden" + i);
                            }
                        }
                        menu.classList.remove('rootHidden');
                    }
                    else {
                        this._setAllContentTypeClasses(menu, 'remove');
                    }
                };
                CRMAppPageDemo._listen = function (event, handler) {
                    window.addEventListener(event, handler);
                    this._listeners.push({
                        event: event, handler: handler
                    });
                };
                CRMAppPageDemo._setListeners = function (menu) {
                    var _this = this;
                    this._listen('contextmenu', function (e) {
                        e.preventDefault();
                        _this._showMenu(menu, e);
                    });
                    this._listen('click', function () {
                        _this._setAllContentTypeClasses(menu, 'add');
                    });
                    this._listen('scroll', function () {
                        _this._setAllContentTypeClasses(menu, 'add');
                    });
                };
                CRMAppPageDemo._unsetListeners = function () {
                    this._listeners.forEach(function (_a) {
                        var event = _a.event, handler = _a.handler;
                        window.removeEventListener(event, handler);
                    });
                };
                CRMAppPageDemo._enable = function () {
                    this._root = this._genMenu();
                    this._setListeners(this._root);
                    this._setAllContentTypeClasses(this._root, 'add');
                    document.body.appendChild(this._root);
                };
                CRMAppPageDemo._disable = function () {
                    this._root.remove();
                    this._unsetListeners();
                    this._active = false;
                };
                CRMAppPageDemo.create = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (this._active) {
                                        this._disable();
                                    }
                                    if (!window.app.storageLocal.CRMOnPage) {
                                        return [2];
                                    }
                                    return [4, window.onExistsChain(window, 'app', 'settings', 'crm')];
                                case 1:
                                    _a.sent();
                                    this._active = true;
                                    this._enable();
                                    return [2];
                            }
                        });
                    });
                };
                CRMAppPageDemo.parent = function () {
                    return window.app;
                };
                return CRMAppPageDemo;
            }()),
            _e._active = false,
            _e._root = null,
            _e._listeners = [],
            _e);
        return CA;
    }());
    ;
    if (window.objectify) {
        window.register(CA);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(CA);
        });
    }
})(CRMAppElement || (CRMAppElement = {}));
