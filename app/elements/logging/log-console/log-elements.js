var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
window.logElements = (function () {
    function getTag(item, parent, additionalProps) {
        if (additionalProps === void 0) { additionalProps = {}; }
        if (additionalProps['isEval']) {
            return React.createElement(EvalElement, __assign({}, additionalProps, { parent: parent, value: item }));
        }
        if (item === null || item === undefined) {
            return React.createElement(StringElement, __assign({}, additionalProps, { parent: parent, value: item }));
        }
        switch (typeof item) {
            case 'function':
                return React.createElement(FunctionElement, __assign({}, additionalProps, { parent: parent, value: item }));
            case 'object':
                return React.createElement(ObjectElement, __assign({}, additionalProps, { parent: parent, value: item }));
            case 'string':
            default:
                return React.createElement(StringElement, __assign({}, additionalProps, { parent: parent, value: item }));
        }
    }
    var LogElement = (function (_super) {
        __extends(LogElement, _super);
        function LogElement(props) {
            return _super.call(this, props) || this;
        }
        LogElement.prototype.showContextMenu = function (e) {
            window.logConsole.initContextMenu(this, e);
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        return LogElement;
    }(React.Component));
    var EvalElement = (function (_super) {
        __extends(EvalElement, _super);
        function EvalElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EvalElement.prototype.componentDidMount = function () {
            if (this.props.hasResult) {
                this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
            }
        };
        EvalElement.prototype.isLine = function () {
            return true;
        };
        EvalElement.prototype.render = function () {
            return (React.createElement("div", { ref: "cont", className: "evalElementContainer" },
                React.createElement("div", { className: "evalElementCommand" },
                    React.createElement("div", { className: "evalElementCommandPrefix" }, ">"),
                    React.createElement("div", { className: "evalElementCommandValue" }, this.props.value.code)),
                React.createElement("div", { className: "evalElementStatus" }, (this.props.value.hasResult ?
                    React.createElement("div", { className: "evalElementReturn" },
                        React.createElement("div", { className: "evalElementReturnPrefix" }, "<"),
                        React.createElement("div", { className: "evalElementReturnValue" }, getTag(this.props.value.result, this)))
                    :
                        React.createElement("paper-spinner", { className: "tinySpinner", active: true })))));
        };
        return EvalElement;
    }(LogElement));
    var StringElement = (function (_super) {
        __extends(StringElement, _super);
        function StringElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StringElement.prototype.componentDidMount = function () {
            if (!this.props.noListener) {
                this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
            }
        };
        StringElement.prototype.render = function () {
            var type = typeof this.props.value;
            var value;
            if (this.props.value === null || this.props.value === undefined) {
                value = this.props.value + '';
            }
            else {
                value = JSON.stringify(this.props.value);
            }
            return React.createElement("div", { ref: "cont", className: "stringElementValue", type: type }, value + ' ');
            ;
        };
        return StringElement;
    }(LogElement));
    ;
    var fnRegex = /^(.+)\{((.|\s|\n|\r)+)\}$/;
    var FunctionElement = (function (_super) {
        __extends(FunctionElement, _super);
        function FunctionElement(props) {
            return _super.call(this, props) || this;
        }
        FunctionElement.prototype.expand = function () {
            this.refs.arrow.classList.toggle('toggled');
            this.refs.expandedElements.classList.toggle('visible');
        };
        FunctionElement.prototype.componentDidMount = function () {
            this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
        };
        FunctionElement.prototype.render = function () {
            var fn = this.props.value.toString();
            var fnMatch = fnRegex.exec(fn);
            var functionPrefix = fnMatch[1];
            var functionText = fnMatch[2];
            var functionKeywordIndex = functionPrefix.indexOf('function') || 0;
            var expandClick = this.expand.bind(this);
            return (React.createElement("div", { ref: "cont", className: "functionElementCont" },
                React.createElement("div", { className: "functionElement" },
                    React.createElement("div", { className: "functionElementPreviewArea" },
                        React.createElement("div", { ref: "arrow", className: "objectElementExpandArrow", onClick: expandClick },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 48 48" },
                                React.createElement("path", { d: "M16 10v28l22-14z" }))),
                        React.createElement("div", { className: "functionElementPreview" },
                            React.createElement("div", { className: "functionElementPrefixCont" },
                                React.createElement("div", { className: "functionElementPrefix" },
                                    React.createElement("span", { className: "functionElementKeyword" }, "function"),
                                    React.createElement("span", null, ' ' + this.props.value.name + '()'))))),
                    React.createElement("div", { ref: "expandedElements", className: "functionElementExpanded" },
                        React.createElement("div", { className: "functionElementExpandedContent" },
                            React.createElement("div", { className: "functionElementPrefixCont" }, functionPrefix.indexOf('=>') > -1 ?
                                React.createElement("div", { className: "functionElementPrefix" }, "functionPrefix") : React.createElement("div", { className: "functionElementPrefix" },
                                React.createElement("span", null, functionPrefix.slice(0, functionKeywordIndex)),
                                React.createElement("span", { className: "functionElementKeyword" }, "function"),
                                React.createElement("span", null, functionPrefix.slice(functionKeywordIndex + 8) + '{'))),
                            React.createElement("div", { className: "functionElementValue" }, functionText),
                            React.createElement("span", null, "}"))))));
        };
        return FunctionElement;
    }(LogElement));
    function getKeyValuePairs(item, deep) {
        if (deep === void 0) { deep = false; }
        if (Array.isArray(item)) {
            return item.map(function (value, index) {
                return {
                    index: index,
                    value: value
                };
            });
        }
        else {
            var props = Object.getOwnPropertyNames(item).map(function (key) {
                if (key === '__proto__' && item[key] === null) {
                    return null;
                }
                else if (key !== '__parent') {
                    return {
                        index: key,
                        value: item[key]
                    };
                }
                return null;
            }).filter(function (pair) {
                return pair !== null;
            });
            if (deep && Object.getOwnPropertyNames(item).indexOf('__proto__') === -1) {
                props.push({
                    index: '__proto__',
                    value: Object.getPrototypeOf(item)
                });
            }
            return props;
        }
    }
    var ObjectElement = (function (_super) {
        __extends(ObjectElement, _super);
        function ObjectElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ObjectElement.prototype.expand = function () {
            var _this = this;
            if (!this.props.expanded && !this.props.renderedExpanded) {
                this.props.renderedExpanded = true;
                var expandedElements_1 = [];
                var pairs = getKeyValuePairs(this.props.value, true);
                var lastElementIndex_1 = pairs.length - 1;
                pairs.forEach(function (item, i) {
                    expandedElements_1.push(React.createElement("div", { className: "expandedObjectElement" },
                        React.createElement("div", { className: "expandedObjectElementIndex" },
                            item.index,
                            ":"),
                        React.createElement("div", { className: "expandedObjectElementValue" }, getTag(item.value, _this, {
                            isProto: item.index === '__proto__'
                        })),
                        i < lastElementIndex_1 ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                });
                this.props.expandedElements = expandedElements_1;
                this.setState({
                    expanded: true
                });
            }
            this.refs.arrow.classList.toggle('toggled');
            this.refs.expandedElements.classList.toggle('visible');
        };
        ObjectElement.prototype.componentDidMount = function () {
            this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
        };
        ObjectElement.prototype.render = function () {
            var dataType = Array.isArray(this.props.value) ? 'arr' : 'object';
            var expandClick = this.expand.bind(this);
            var dataPairs = getKeyValuePairs(this.props.value);
            var lastElIndex = dataPairs.length - 1;
            var isExpandable = dataType === 'object' ||
                dataPairs.length >= 10 ||
                dataPairs.filter(function (pair) {
                    return typeof pair.value === 'object';
                }).length > 0;
            var overflows = (dataType === 'object' && dataPairs.length > 3) ||
                (dataType === 'arr' && dataPairs.length > 10);
            var nonOverflowItems = dataPairs.slice(0, (this.props.isProto ? 0 :
                dataType === 'object' ? 3 : 10));
            if (overflows) {
                nonOverflowItems.push({
                    overflow: true
                });
            }
            return (React.createElement("div", { ref: "cont", className: "objectElementCont" },
                React.createElement("div", { className: "objectElementPreviewArea" },
                    React.createElement("div", { ref: "arrow", className: "objectElementExpandArrow", hidden: !isExpandable, onClick: expandClick },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 48 48" },
                            React.createElement("path", { d: "M16 10v28l22-14z" }))),
                    React.createElement("div", { className: "objectElementPreviewCont" },
                        React.createElement("span", null, dataType === 'arr' ? '[' : '{'),
                        nonOverflowItems.map(function (item, i) {
                            var index = item.index;
                            var data = item.value;
                            if (typeof data === 'object') {
                                if (Array.isArray(data)) {
                                    return (React.createElement("span", { className: "objectElementValueCont" },
                                        dataType === 'object' ? React.createElement("span", { className: "objectElementKey" },
                                            index,
                                            ":") : null,
                                        React.createElement("span", { className: "specialArrayElement" }, "Array"),
                                        i < lastElIndex ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                                    ;
                                }
                                else {
                                    return (React.createElement("span", { className: "objectElementValueCont" },
                                        dataType === 'object' ? React.createElement("span", { className: "objectElementKey" },
                                            index,
                                            ":") : null,
                                        React.createElement("span", { className: "specialArrayElement" }, "Object"),
                                        i < lastElIndex ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                                    ;
                                }
                            }
                            else if (typeof data === 'function') {
                                return (React.createElement("span", { className: "objectElementValueCont" },
                                    dataType === 'object' ? React.createElement("span", { className: "objectElementKey" },
                                        index,
                                        ":") : null,
                                    React.createElement("span", { className: "specialArrayElement" }, "Function"),
                                    i < lastElIndex ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                                ;
                            }
                            else if (item.overflow) {
                                return (React.createElement("span", { className: "objectElementValueCont" },
                                    React.createElement("span", { className: "specialArrayElement" }, "...")));
                                ;
                            }
                            return (React.createElement("span", { className: "objectElementValueCont" },
                                dataType === 'object' ? React.createElement("span", { className: "objectElementKey" },
                                    index,
                                    ":") : null,
                                React.createElement(StringElement, { noListener: "true", value: data }),
                                i < lastElIndex ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                            ;
                        }, this),
                        React.createElement("span", null, dataType === 'arr' ? ']' : '}'))),
                React.createElement("div", { ref: "expandedElements", className: "objectElementExpanded" }, this.props.expandedElements)));
            ;
        };
        return ObjectElement;
    }(LogElement));
    var LogSource = (function (_super) {
        __extends(LogSource, _super);
        function LogSource(props) {
            return _super.call(this, props) || this;
        }
        LogSource.prototype.takeToTab = function () {
            return __awaiter(this, void 0, void 0, function () {
                var tab, chromeTabs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(this.props.line.tabId === 'background')) return [3, 1];
                            window.logConsole.$.genericToast.text = 'Can\'t open a background page';
                            window.logConsole.$.genericToast.show();
                            return [3, 4];
                        case 1: return [4, browserAPI.tabs.get(~~this.props.line.tabId)["catch"](function () {
                                window.logConsole.$.genericToast.text = 'Tab has been closed';
                                window.logConsole.$.genericToast.show();
                            })];
                        case 2:
                            tab = _a.sent();
                            if (!tab) {
                                return [2];
                            }
                            if (!('highlight' in browserAPI.tabs)) return [3, 4];
                            chromeTabs = browserAPI.tabs;
                            if (!chromeTabs.highlight) {
                                return [2];
                            }
                            return [4, chromeTabs.highlight({
                                    windowId: tab.windowId,
                                    tabs: tab.index
                                }, function () {
                                    if (window.chrome.runtime.lastError) {
                                        console.log(window.chrome.runtime.lastError);
                                        console.log('Something went wrong highlighting the tab');
                                    }
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2];
                    }
                });
            });
        };
        LogSource.prototype.getLineNumber = function () {
            return (this.props.line.lineNumber && this.props.line.lineNumber.trim()) || '?';
        };
        LogSource.prototype.listenClick = function (fn) {
            return function (target) {
                if (target !== null) {
                    target.addEventListener('click', fn);
                }
            };
        };
        LogSource.prototype.render = function () {
            return (React.createElement("div", { className: "lineSource" },
                React.createElement("span", { className: "lineSourceIdCont", title: "Node name: " + this.props.line.nodeTitle },
                    "[id-",
                    React.createElement("span", { className: "lineSourceId" }, this.props.line.id),
                    "]"),
                React.createElement("span", { className: "lineSourceTabCont" },
                    "[",
                    React.createElement("span", { ref: this.listenClick(this.takeToTab.bind(this)), className: "lineSourceTabsInner", title: "Tab name: " + this.props.line.tabTitle + ", instance: " + (this.props.line.tabInstanceIndex || 0), tabIndex: 1 },
                        "tab-",
                        React.createElement("span", { className: "lineSourceTab" }, this.props.line.tabId),
                        ":",
                        this.props.line.tabInstanceIndex || 0),
                    "]"),
                React.createElement("span", { title: "Log source file and line number", className: "lineSourceLineCont" },
                    "@",
                    React.createElement("span", { className: "lineSourceLineNumber" }, this.getLineNumber()))));
        };
        return LogSource;
    }(React.Component));
    var LogLine = (function (_super) {
        __extends(LogLine, _super);
        function LogLine(props) {
            return _super.call(this, props) || this;
        }
        LogLine.prototype.isLine = function () {
            return true;
        };
        LogLine.prototype.takeToTab = function () {
            return __awaiter(this, void 0, void 0, function () {
                var tab, chromeTabs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, browserAPI.tabs.get(~~this.props.line.tabId)["catch"](function () {
                                window.logConsole.$.genericToast.text = 'Tab has been closed';
                                window.logConsole.$.genericToast.show();
                            })];
                        case 1:
                            tab = _a.sent();
                            if (!tab) {
                                return [2];
                            }
                            if (!('highlight' in browserAPI.tabs)) return [3, 3];
                            chromeTabs = browserAPI.tabs;
                            if (!chromeTabs.highlight) {
                                return [2];
                            }
                            return [4, chromeTabs.highlight({
                                    windowId: tab.windowId,
                                    tabs: tab.index
                                }, function () {
                                    if (window.chrome.runtime.lastError) {
                                        console.log(window.chrome.runtime.lastError);
                                        console.log('Something went wrong highlighting the tab');
                                    }
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2];
                    }
                });
            });
        };
        LogLine.prototype.render = function () {
            var _this = this;
            return (React.createElement("div", { "data-error": this.props.line.isError, className: "logLine" },
                React.createElement("div", { className: "lineData" },
                    React.createElement("div", { className: "lineTimestamp" }, this.props.line.timestamp),
                    React.createElement("div", { className: "lineContent" }, this.props.value.map(function (value) {
                        return getTag(value, _this, {
                            isEval: _this.props.line.isEval
                        });
                    }))),
                React.createElement(LogSource, { line: this.props.line })));
        };
        return LogLine;
    }(React.Component));
    var LogLineContainer = (function (_super) {
        __extends(LogLineContainer, _super);
        function LogLineContainer(props) {
            return _super.call(this, props) || this;
        }
        LogLineContainer.prototype.add = function (lineData, line) {
            if (lineData === void 0) { lineData = []; }
            this.setState({
                lines: this.state.lines.concat([{
                        data: lineData,
                        line: line
                    }])
            });
            this.props.logConsole.set('lines', this.state.lines.length);
        };
        LogLineContainer.prototype.popEval = function () {
            var lines = this.state.lines.reverse();
            var popped = null;
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].line.isEval) {
                    popped = lines.splice(i, 1);
                    break;
                }
            }
            if (popped) {
                this.setState({
                    lines: lines.reverse()
                });
                this.props.logConsole.set('lines', this.state.lines.length);
            }
            return popped[0];
        };
        LogLineContainer.prototype.clear = function () {
            this.setState({
                lines: []
            });
            this.props.logConsole.set('lines', this.state.lines.length);
        };
        LogLineContainer.prototype.render = function () {
            var children = [];
            this.state = this.state || {
                lines: []
            };
            for (var i = 0; i < this.state.lines.length; i++) {
                children.push(React.createElement(LogLine, { value: this.state.lines[i].data, line: this.state.lines[i].line }));
            }
            return (React.createElement("div", { className: "logLines" }, children));
        };
        return LogLineContainer;
    }(React.Component));
    return {
        logLines: LogLineContainer
    };
})();
