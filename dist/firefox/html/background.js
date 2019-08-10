/*!
 * Original can be found at https://github.com/SanderRonde/CustomRightClickMenu 
 * This code may only be used under the MIT style license found in the LICENSE.txt file 
**/
"use notstrict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function (e) {
  var r = e.babelHelpers = {};r["typeof"] = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
    return typeof e === "undefined" ? "undefined" : _typeof(e);
  } : function (e) {
    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e === "undefined" ? "undefined" : _typeof(e);
  }, r.classCallCheck = function (e, r) {
    if (!(e instanceof r)) throw new TypeError("Cannot call a class as a function");
  }, r.createClass = function () {
    function e(e, r) {
      for (var t = 0; t < r.length; t++) {
        var n = r[t];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
      }
    }return function (r, t, n) {
      return t && e(r.prototype, t), n && e(r, n), r;
    };
  }(), r.defineEnumerableProperties = function (e, r) {
    for (var t in r) {
      var n = r[t];n.configurable = n.enumerable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, t, n);
    }return e;
  }, r.defaults = function (e, r) {
    for (var t = Object.getOwnPropertyNames(r), n = 0; n < t.length; n++) {
      var o = t[n],
          i = Object.getOwnPropertyDescriptor(r, o);i && i.configurable && void 0 === e[o] && Object.defineProperty(e, o, i);
    }return e;
  }, r.defineProperty = function (e, r, t) {
    return r in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
  }, r["extends"] = Object.assign || function (e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = arguments[r];for (var n in t) {
        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
      }
    }return e;
  }, r.get = function e(r, t, n) {
    null === r && (r = Function.prototype);var o = Object.getOwnPropertyDescriptor(r, t);if (void 0 === o) {
      var i = Object.getPrototypeOf(r);return null === i ? void 0 : e(i, t, n);
    }if ("value" in o) return o.value;var a = o.get;if (void 0 !== a) return a.call(n);
  }, r.inherits = function (e, r) {
    if ("function" != typeof r && null !== r) throw new TypeError("Super expression must either be null or a function, not " + (typeof r === "undefined" ? "undefined" : _typeof(r)));e.prototype = Object.create(r && r.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), r && (Object.setPrototypeOf ? typeof Object['setPrototype' + 'Of'] === 'function'?Object['setPrototype' + 'Of'](e,r):e.__proto__ = r : e.__proto__ = r);
  }, r["instanceof"] = function (e, r) {
    return null != r && "undefined" != typeof Symbol && r[Symbol.hasInstance] ? r[Symbol.hasInstance](e) : e instanceof r;
  }, r.newArrowCheck = function (e, r) {
    if (e !== r) throw new TypeError("Cannot instantiate an arrow function");
  }, r.objectDestructuringEmpty = function (e) {
    if (null == e) throw new TypeError("Cannot destructure undefined");
  }, r.objectWithoutProperties = function (e, r) {
    var t = {};for (var n in e) {
      r.indexOf(n) >= 0 || Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    }return t;
  }, r.possibleConstructorReturn = function (e, r) {
    if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !r || "object" != (typeof r === "undefined" ? "undefined" : _typeof(r)) && "function" != typeof r ? e : r;
  }, r.set = function e(r, t, n, o) {
    var i = Object.getOwnPropertyDescriptor(r, t);if (void 0 === i) {
      var a = Object.getPrototypeOf(r);null !== a && e(a, t, n, o);
    } else if ("value" in i && i.writable) i.value = n;else {
      var u = i.set;void 0 !== u && u.call(o, n);
    }return n;
  }, r.slicedToArray = function () {
    function e(e, r) {
      var t = [],
          n = !0,
          o = !1,
          i = void 0;try {
        for (var a, u = e[Symbol.iterator](); !(n = (a = u.next()).done) && (t.push(a.value), !r || t.length !== r); n = !0) {}
      } catch (e) {
        o = !0, i = e;
      } finally {
        try {
          !n && u["return"] && u["return"]();
        } finally {
          if (o) throw i;
        }
      }return t;
    }return function (r, t) {
      if (Array.isArray(r)) return r;if (Symbol.iterator in Object(r)) return e(r, t);throw new TypeError("Invalid attempt to destructure non-iterable instance");
    };
  }(), r.taggedTemplateLiteral = function (e, r) {
    return Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
  }, r.temporalRef = function (e, r, t) {
    if (e === t) throw new ReferenceError(r + " is not defined - temporal dead zone");return e;
  }, r.temporalUndefined = {}, r.toArray = function (e) {
    return Array.isArray(e) ? e : Array.from(e);
  }, r.toConsumableArray = function (e) {
    if (Array.isArray(e)) {
      for (var r = 0, t = Array(e.length); r < e.length; r++) {
        t[r] = e[r];
      }return t;
    }return Array.from(e);
  };
}("undefined" == typeof global ? self : global);
'use notstrict';var MapIterator = function () {
  function e(e) {
    this._data = e, this._index = 0;
  }return e.prototype.next = function () {
    var e = this._data[this._index];return this._index++, e;
  }, e;
}(),
    MapPolyfill = function () {
  function e(t) {
    var s = this;if (this._data = [], !(this instanceof e)) throw new TypeError('Constructor requires new');if (t && !this._isIterable(t)) throw new TypeError('Passed value is not iterable');Object.defineProperty(this, 'size', { get: this._getSize }), t && Array.prototype.slice.apply(t).forEach(function (e) {
      var t = e[0],
          n = e[1];s.set(t, n);
    });
  }return e.prototype.clear = function () {
    for (; 0 < this._data.length;) {
      this._data.pop();
    }return this;
  }, e.prototype['delete'] = function (e) {
    if (void 0 === e) throw new Error('No key supplied');var t = this._get(e)[0];return -1 !== t && (this._data.splice(t, 1), !0);
  }, e.prototype.entries = function () {
    return new MapIterator(this._data);
  }, e.prototype.forEach = function (e, t) {
    var s = this;if (void 0 === e || 'function' !== typeof e) throw new Error('Please supply a function parameter');this._data.forEach(function (n) {
      var a = n[0],
          o = n[1];void 0 === t ? e(o, a, s) : e.apply(t, [o, a, s]);
    });
  }, e.prototype.get = function (e) {
    if (void 0 === e) throw new Error('No key supplied');return this._get(e)[1];
  }, e.prototype.has = function (e) {
    if (void 0 === e) throw new Error('No key supplied');return -1 !== this._get(e)[0];
  }, e.prototype.keys = function () {
    return new MapIterator(this._data.map(function (e) {
      var t = e[0];return t;
    }));
  }, e.prototype.set = function (e, t) {
    if (void 0 === e) throw new Error('No key supplied');if (void 0 === t) throw new Error('No value supplied');var s = this._get(e)[0];return -1 === s ? this._data.push([e, t]) : this._data[s] = [e, t], this;
  }, e.prototype.values = function () {
    return new MapIterator(this._data.map(function (e) {
      var t = e[0],
          s = e[1];return s;
    }));
  }, e.prototype._get = function (e) {
    for (var t = 0; t < this._data.length; t++) {
      var s = this._data[t],
          n = s[0],
          a = s[1];if (n === e && e !== NaN && n !== NaN) return [t, a];
    }return [-1, void 0];
  }, e.prototype._getSize = function () {
    return this._data.length;
  }, e.prototype._isIterable = function (e) {
    return Array.isArray(e) || 'string' === typeof e || e.toString() === Object.prototype.toString.call(function () {
      return arguments;
    });
  }, e;
}();window.Map = window.Map || MapPolyfill, 'use notstrict';var __extends = undefined && undefined.__extends || function () {
  var _e2 = function e(t, s) {
    return _e2 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (e, t) {
      e.__proto__ = t;
    } || function (e, t) {
      for (var s in t) {
        t.hasOwnProperty(s) && (e[s] = t[s]);
      }
    }, _e2(t, s);
  };return function (t, s) {
    function n() {
      this.constructor = t;
    }_e2(t, s), t.prototype = null === s ? Object.create(s) : (n.prototype = s.prototype, new n());
  };
}(),
    WeakMapPolyfill = function (e) {
  function t(t) {
    return e.call(this, t) || this;
  }return __extends(t, e), t;
}(MapPolyfill);window.WeakMap = window.WeakMap || WeakMapPolyfill, function (e, t, s) {
  t[e] = t[e] || s(), 'undefined' != typeof module && module.exports ? module.exports = t[e] : 'function' == typeof define && define.amd && define(function () {
    return t[e];
  });
}('Promise', 'undefined' == typeof global ? window : global, function () {
  'use notstrict';
  function e(e, t) {
    m.add(e, t), g || (g = u(m.drain));
  }function t(e) {
    var t = 'undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e),
        s;return null != e && ('object' == t || 'function' == t) && (s = e.then), 'function' == typeof s && s;
  }function s() {
    for (var e = 0; e < this.chain.length; e++) {
      n(this, 1 === this.state ? this.chain[e].success : this.chain[e].failure, this.chain[e]);
    }this.chain.length = 0;
  }function n(e, s, n) {
    var a, o;try {
      !1 === s ? n.reject(e.msg) : (a = !0 === s ? e.msg : s.call(void 0, e.msg), a === n.promise ? n.reject(TypeError('Promise-chain cycle')) : (o = t(a)) ? o.call(a, n.resolve, n.reject) : n.resolve(a));
    } catch (e) {
      n.reject(e);
    }
  }function a(n) {
    var r = this,
        i;if (!r.triggered) {
      r.triggered = !0, r.def && (r = r.def);try {
        (i = t(n)) ? e(function () {
          var e = new l(r);try {
            i.call(n, function () {
              a.apply(e, arguments);
            }, function () {
              o.apply(e, arguments);
            });
          } catch (t) {
            o.call(e, t);
          }
        }) : (r.msg = n, r.state = 1, 0 < r.chain.length && e(s, r));
      } catch (e) {
        o.call(new l(r), e);
      }
    }
  }function o(t) {
    var n = this;n.triggered || (n.triggered = !0, n.def && (n = n.def), n.msg = t, n.state = 2, 0 < n.chain.length && e(s, n));
  }function r(e, t, s, n) {
    for (var a = 0; a < t.length; a++) {
      (function (a) {
        e.resolve(t[a]).then(function (e) {
          s(a, e);
        }, n);
      })(a);
    }
  }function l(e) {
    this.def = e, this.triggered = !1;
  }function i(e) {
    this.promise = e, this.state = 0, this.triggered = !1, this.chain = [], this.msg = void 0;
  }function d(t) {
    if ('function' != typeof t) throw TypeError('Not a function');if (0 !== this.__NPO__) throw TypeError('Not a promise');this.__NPO__ = 1;var n = new i(this);this.then = function (t, a) {
      var r = { success: 'function' != typeof t || t, failure: 'function' == typeof a && a };return r.promise = new this.constructor(function (e, t) {
        if ('function' != typeof e || 'function' != typeof t) throw TypeError('Not a function');r.resolve = e, r.reject = t;
      }), n.chain.push(r), 0 !== n.state && e(s, n), r.promise;
    }, this['catch'] = function (e) {
      return this.then(void 0, e);
    };try {
      t.call(void 0, function (e) {
        a.call(n, e);
      }, function (e) {
        o.call(n, e);
      });
    } catch (e) {
      o.call(n, e);
    }
  }var c = Object.prototype.toString,
      u = 'undefined' == typeof setImmediate ? setTimeout : function (e) {
    return setImmediate(e);
  },
      p,
      g,
      m;try {
    Object.defineProperty({}, 'x', {}), p = function p(e, t, s, n) {
      return Object.defineProperty(e, t, { value: s, writable: !0, configurable: !1 !== n });
    };
  } catch (e) {
    p = function p(e, t, s) {
      return e[t] = s, e;
    };
  }m = function () {
    function e(e, t) {
      this.fn = e, this.self = t, this.next = void 0;
    }var t, s, n;return { add: function add(a, o) {
        n = new e(a, o), s ? s.next = n : t = n, s = n, n = void 0;
      }, drain: function drain() {
        var e = t;for (t = s = g = void 0; e;) {
          e.fn.call(e.self), e = e.next;
        }
      } };
  }();var h = p({}, 'constructor', d, !1);return d.prototype = h, p(h, '__NPO__', 0, !1), p(d, 'resolve', function (e) {
    var t = this;return e && 'object' == ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) && 1 === e.__NPO__ ? e : new t(function (t, s) {
      if ('function' != typeof t || 'function' != typeof s) throw TypeError('Not a function');t(e);
    });
  }), p(d, 'reject', function (e) {
    return new this(function (t, s) {
      if ('function' != typeof t || 'function' != typeof s) throw TypeError('Not a function');s(e);
    });
  }), p(d, 'all', function (e) {
    var t = this;return '[object Array]' == c.call(e) ? 0 === e.length ? t.resolve([]) : new t(function (s, n) {
      if ('function' != typeof s || 'function' != typeof n) throw TypeError('Not a function');var a = e.length,
          o = Array(a),
          l = 0;r(t, e, function (e, t) {
        o[e] = t, ++l === a && s(o);
      }, n);
    }) : t.reject(TypeError('Not an array'));
  }), p(d, 'race', function (e) {
    var t = this;return '[object Array]' == c.call(e) ? new t(function (s, n) {
      if ('function' != typeof s || 'function' != typeof n) throw TypeError('Not a function');r(t, e, function (e, t) {
        s(t);
      }, n);
    }) : t.reject(TypeError('Not an array'));
  }), d;
});var __extends = undefined && undefined.__extends || function () {
  var _e3 = function e(t, s) {
    return _e3 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (e, t) {
      e.__proto__ = t;
    } || function (e, t) {
      for (var s in t) {
        t.hasOwnProperty(s) && (e[s] = t[s]);
      }
    }, _e3(t, s);
  };return function (t, s) {
    function n() {
      this.constructor = t;
    }_e3(t, s), t.prototype = null === s ? Object.create(s) : (n.prototype = s.prototype, new n());
  };
}(),
    __assign = undefined && undefined.__assign || function () {
  return __assign = Object.assign || function (e) {
    for (var t = 1, a = arguments.length, n; t < a; t++) {
      for (var s in n = arguments[t], n) {
        Object.prototype.hasOwnProperty.call(n, s) && (e[s] = n[s]);
      }
    }return e;
  }, __assign.apply(this, arguments);
},
    __awaiter = undefined && undefined.__awaiter || function (e, t, s, n) {
  return new (s || (s = Promise))(function (a, o) {
    function r(e) {
      try {
        i(n.next(e));
      } catch (t) {
        o(t);
      }
    }function l(e) {
      try {
        i(n['throw'](e));
      } catch (t) {
        o(t);
      }
    }function i(e) {
      e.done ? a(e.value) : new s(function (t) {
        t(e.value);
      }).then(r, l);
    }i((n = n.apply(e, t || [])).next());
  });
},
    __generator = undefined && undefined.__generator || function (e, s) {
  function n(e) {
    return function (t) {
      return a([e, t]);
    };
  }function a(n) {
    if (r) throw new TypeError('Generator is already executing.');for (; o;) {
      try {
        if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
            i = n;break;case 4:
            return o.label++, { value: n[1], done: !1 };case 5:
            o.label++, l = n[1], n = [0];continue;case 7:
            n = o.ops.pop(), o.trys.pop();continue;default:
            if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
              o = 0;continue;
            }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
              o.label = n[1];break;
            }if (6 === n[0] && o.label < i[1]) {
              o.label = i[1], i = n;break;
            }if (i && o.label < i[2]) {
              o.label = i[2], o.ops.push(n);break;
            }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
      } catch (t) {
        n = [6, t], l = 0;
      } finally {
        r = i = 0;
      }
    }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
  }var o = { label: 0, sent: function sent() {
      if (1 & i[0]) throw i[1];return i[1];
    }, trys: [], ops: [] },
      r,
      l,
      i,
      d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
    return this;
  }), d;
},
    BrowserAPINS;if (function (e) {
  function t(e) {
    return !!h.runtime.lastError && (e(h.runtime.lastError), !0);
  }function s(e, t) {
    var s = t.resolve,
        n = t.reject,
        a = function a() {
      for (var t = [], a = 0; a < arguments.length; a++) {
        t[a] = arguments[a];
      }h.runtime.lastError ? n(new y(h.runtime.lastError, e)) : s(t[0]);
    };return a.__resolve = s, a.__reject = n, a.__stack = e, a;
  }function n(e) {
    return new Promise(function (t, n) {
      e(s(new Error(), { resolve: t, reject: n }));
    });
  }function a(e) {
    return { set: function set(t) {
        return n(function (s) {
          h.storage[e].set(t, s);
        });
      }, remove: function remove(s) {
        return n(function (n) {
          Array.isArray(s) ? Promise.all(s.map(function (s) {
            return new Promise(function (a) {
              h.storage[e].remove(s, function () {
                t(n.__reject) || a(null);
              });
            });
          })).then(n) : h.storage[e].remove(s, n);
        });
      }, clear: function clear() {
        return n(function (t) {
          h.storage[e].clear(t);
        });
      } };
  }function o(e) {
    if ('browser' === e) return f;if ('chrome' === e) return b;if ('undefined' === typeof location || 'undefined' === typeof location.host) return !1;throw new Error('Unsupported browser API support queried');
  }function r() {
    var e = window,
        t = !!e.opr && !!e.opr.addons || !!e.opera || 0 <= navigator.userAgent.indexOf(' OPR/');if ('undefined' !== typeof e.InstallTrigger) return 'firefox';if (e.StyleMedia) return 'edge';if (!t && o('chrome')) return 'chrome';if (t) return 'opera';if ('undefined' === typeof location || 'undefined' === typeof location.host) return 'node';throw new Error('Unsupported browser');
  }function l() {
    return x ? x : x = r();
  }function i() {
    return -1 === location.href.indexOf('backgroun');
  }function d() {
    return -1 < h.runtime.getManifest().short_name.indexOf('dev');
  }function c(e, t) {
    return e + '' === t + '';
  }function u(e, t, s) {
    for (var n = 0; n < e.length; n++) {
      var a = e[n],
          o = a.id,
          r = a.children;if (c(o, t)) return s(a, n, e), !0;if (r && u(r, t, s)) return !0;
    }return !1;
  }function p() {
    I._lastSpecialCall = null, I._currentContextMenu = [], I._activeTabs = [], I._executedScripts = [], I._fakeTabs = {}, I._activatedBackgroundPages = [], I._tabUpdateListeners = [];
  }function g() {
    return h.downloads ? { download: function download(e) {
        return v && (I._lastSpecialCall = { api: 'downloads.download', args: [e] }), n(function (t) {
          h.downloads.download(e, t);
        });
      } } : void 0;
  }var m = window,
      h = m.StyleMedia ? m.browser : m.chrome,
      y = function (e) {
    function t(t, s) {
      var n = t.message,
          a = s.stack,
          o = e.call(this, n) || this;return o.stack = a, o.message = n, o;
    }return __extends(t, e), t;
  }(Error),
      f = 'browser' in window,
      b = 'chrome' in window;e.isBrowserAPISupported = o;var x = null;e.getBrowser = l, e.getSrc = function () {
    return h;
  };var v = !1;e.resetLogData = p, e.enableLogging = function () {
    v || p(), v = !0;
  }, e.isLoggingEnabled = function () {
    return v;
  }, e.disableLogging = function () {
    v = !1, I._lastSpecialCall = null, I._currentContextMenu = null, I._activeTabs = null, I._executedScripts = null, I._fakeTabs = null, I._activatedBackgroundPages = null, I._tabUpdateListeners = null;
  };var I = { _lastSpecialCall: null, _currentContextMenu: null, _activeTabs: null, _executedScripts: null, _fakeTabs: null, _activatedBackgroundPages: null, _tabUpdateListeners: null, _clearExecutedScripts: function _clearExecutedScripts() {
      for (; I._executedScripts.pop();) {}
    } };e.getTestData = function () {
    return i() || d() ? I : void 0;
  }, e.getDownloadAPI = g, e.polyfill = h ? { commands: h.commands ? { getAll: function getAll() {
        return n(function (e) {
          h.commands.getAll(e);
        });
      }, onCommand: h.commands.onCommand } : void 0, contextMenus: h.contextMenus ? { create: function create(t, s) {
        var n = h.contextMenus.create(t, function () {
          s && (h.runtime.lastError ? (e.polyfill.runtime.lastError = h.runtime.lastError.message, s(), e.polyfill.runtime.lastError = null) : s());
        }),
            a = { id: n, createProperties: t, currentProperties: t, children: [] };return v && (t.parentId ? u(I._currentContextMenu, t.parentId, function (e) {
          e.children.push(a);
        }) : I._currentContextMenu.push(a)), Promise.resolve(n);
      }, update: function update(e, t) {
        return v && u(I._currentContextMenu, e, function (e) {
          var s = e.currentProperties;for (var n in t) {
            s[n] = t[n];
          }
        }), n(function (s) {
          h.contextMenus.update(e + '', t, function () {
            h.runtime.lastError ? h.contextMenus.update(~~e, t, s) : s();
          });
        });
      }, remove: function remove(e) {
        return v && u(I._currentContextMenu, e, function (e, t, s) {
          s.splice(t, 1);
        }), n(function (t) {
          h.contextMenus.remove(e + '', function () {
            h.runtime.lastError ? h.contextMenus.remove(~~e, t) : t();
          });
        });
      }, removeAll: function removeAll() {
        if (v) for (; I._currentContextMenu.length;) {
          I._currentContextMenu.pop();
        }return n(function (e) {
          var t = h.contextMenus.removeAll(function () {
            'edge' === l() && h.runtime.lastError && e.__resolve(void 0), h.runtime.lastError ? e.__reject(new y(h.runtime.lastError, e.__stack)) : e.__resolve(void 0);
          });t && 'undefined' !== typeof window && window.Promise && t instanceof window.Promise && t.then(e.__resolve, e.__reject);
        });
      } } : void 0, downloads: g(), extension: h.extension ? { isAllowedFileSchemeAccess: function isAllowedFileSchemeAccess() {
        return n(function (e) {
          h.extension.isAllowedFileSchemeAccess(e);
        });
      } } : void 0, i18n: h.i18n ? { getAcceptLanguages: function getAcceptLanguages() {
        return n(function (e) {
          h.i18n.getAcceptLanguages(e);
        });
      }, getMessage: function getMessage(e, t) {
        return h.i18n.getMessage(e, t);
      }, getUILanguage: function getUILanguage() {
        return h.i18n.getUILanguage();
      } } : void 0, notifications: h.notifications ? { onClicked: h.notifications.onClicked, onClosed: h.notifications.onClosed } : void 0, permissions: h.permissions ? { contains: function contains(e) {
        return n(function (t) {
          h.permissions.contains(e, t);
        });
      }, getAll: function getAll() {
        return n(function (e) {
          h.permissions.getAll(e);
        });
      }, request: function request(e) {
        return n(function (t) {
          h.permissions.request(e, t);
        });
      }, remove: function remove(e) {
        return n(function (t) {
          h.permissions.remove(e, t);
        });
      } } : void 0, runtime: h.runtime ? { connect: function connect(e, t) {
        return t ? h.runtime.connect(e, t) : e ? h.runtime.connect(e) : h.runtime.connect();
      }, getBackgroundPage: function getBackgroundPage() {
        return n(function (e) {
          h.runtime.getBackgroundPage(e);
        });
      }, getManifest: function getManifest() {
        return Promise.resolve(h.runtime.getManifest());
      }, getURL: function getURL(e) {
        return h.runtime.getURL(e);
      }, getPlatformInfo: function getPlatformInfo() {
        return n(function (e) {
          h.runtime.getPlatformInfo(e);
        });
      }, openOptionsPage: function openOptionsPage() {
        return n(function (t) {
          'edge' === e.getBrowser() ? e.polyfill.tabs.create({ url: e.polyfill.runtime.getURL('html/options.html') }).then(function () {
            t();
          }) : h.runtime.openOptionsPage(t);
        });
      }, reload: function reload() {
        return Promise.resolve(h.runtime.reload());
      }, sendMessage: function sendMessage(e, t, s) {
        return n(function (n) {
          s ? h.runtime.sendMessage(e, t, s, n) : t ? h.runtime.sendMessage(e, t, n) : h.runtime.sendMessage(e, n);
        });
      }, onInstalled: h.runtime.onInstalled, onConnectExternal: h.runtime.onConnectExternal, onConnect: h.runtime.onConnect, onMessage: h.runtime.onMessage, lastError: null, id: h.runtime.id } : void 0, storage: h.storage ? { local: __assign({}, a('local'), { get: function get(e) {
          return n(function (t) {
            e ? h.storage.local.get(e, t) : h.storage.local.get(t);
          });
        } }), sync: __assign({}, a('sync'), { get: function get(e) {
          return n(function (t) {
            e ? h.storage.sync.get(e, t) : h.storage.sync.get(t);
          });
        } }), onChanged: h.storage.onChanged } : void 0, tabs: h.tabs ? { create: function create(e) {
        return n(function (t) {
          h.tabs.create(e, function (s) {
            var n = s.id;v && I._activeTabs.push({ type: 'create', data: e, id: n }), t(s);
          });
        });
      }, get: function get(e) {
        return n(function (t) {
          h.tabs.get(e, t);
        });
      }, getCurrent: function getCurrent() {
        return n(function (e) {
          h.tabs.getCurrent(e);
        });
      }, captureVisibleTab: function captureVisibleTab(e, t) {
        return n(function (s) {
          t ? h.tabs.captureVisibleTab(e, t, s) : e ? h.tabs.captureVisibleTab(e, s) : h.tabs.captureVisibleTab(s);
        });
      }, update: function update(e, t) {
        return __awaiter(this, void 0, void 0, function () {
          var s = this;return __generator(this, function () {
            return [2, n(function (n) {
              return __awaiter(s, void 0, void 0, function () {
                return __generator(this, function () {
                  return t ? h.tabs.update(e, t, n) : h.tabs.update(e, n), v && I._activeTabs.push({ type: 'create', data: 'number' === typeof e ? t : e, id: 'number' === typeof e ? e : void 0 }), [2];
                });
              });
            })];
          });
        });
      }, query: function query(e) {
        return n(function (t) {
          h.tabs.query(e, t);
        });
      }, executeScript: function executeScript(e, t) {
        var s = this;return n(function (n) {
          return __awaiter(s, void 0, void 0, function () {
            var s, a, o;return __generator(this, function (r) {
              switch (r.label) {case 0:
                  return (t ? h.tabs.executeScript(e, t, n) : h.tabs.executeScript(e, n), s = 'number' === typeof e ? t : e, !s.code) ? [3, 4] : (a = void 0, 'number' !== typeof e) ? [3, 1] : (a = e, [3, 3]);case 1:
                  return [4, browserAPI.tabs.getCurrent()];case 2:
                  o = r.sent(), o && (a = o.id), r.label = 3;case 3:
                  v && I._executedScripts.push({ id: a, code: s.code }), r.label = 4;case 4:
                  return [2];}
            });
          });
        });
      }, sendMessage: function sendMessage(e, s) {
        return n(function (n) {
          var a = n.__resolve,
              o = n.__reject;h.tabs.sendMessage(e, s, function (e) {
            t(o) || a(e);
          });
        });
      }, onUpdated: h.tabs.onUpdated, onRemoved: h.tabs.onRemoved, onHighlighted: h.tabs.onHighlighted } : void 0, webRequest: h.webRequest ? { onBeforeRequest: h.webRequest.onBeforeRequest } : void 0 } : {};
}(BrowserAPINS || (BrowserAPINS = {})), window.BrowserAPIInstances = window.BrowserAPIInstances || [], window.BrowserAPIInstances.push(BrowserAPINS), !window.browserAPI || window.__isVirtual) {
  window.BrowserAPINS = window.BrowserAPI = BrowserAPINS, window.browserAPI = 'edge' !== BrowserAPINS.getBrowser() && window.browser ? window.browser : __assign({}, BrowserAPINS.polyfill, { __isProxied: !0 });var menusBrowserAPI = window.browserAPI;menusBrowserAPI.contextMenus ? !menusBrowserAPI.menus && (menusBrowserAPI.menus = menusBrowserAPI.contextMenus) : menusBrowserAPI.contextMenus = menusBrowserAPI.menus;
}var BrowserAPI = window.BrowserAPINS,
    browserAPI = window.browserAPI,
    __assign = undefined && undefined.__assign || function () {
  return __assign = Object.assign || function (e) {
    for (var t = 1, a = arguments.length, n; t < a; t++) {
      for (var s in n = arguments[t], n) {
        Object.prototype.hasOwnProperty.call(n, s) && (e[s] = n[s]);
      }
    }return e;
  }, __assign.apply(this, arguments);
},
    __awaiter = undefined && undefined.__awaiter || function (e, t, s, n) {
  return new (s || (s = Promise))(function (a, o) {
    function r(e) {
      try {
        i(n.next(e));
      } catch (t) {
        o(t);
      }
    }function l(e) {
      try {
        i(n['throw'](e));
      } catch (t) {
        o(t);
      }
    }function i(e) {
      e.done ? a(e.value) : new s(function (t) {
        t(e.value);
      }).then(r, l);
    }i((n = n.apply(e, t || [])).next());
  });
},
    __generator = undefined && undefined.__generator || function (e, s) {
  function n(e) {
    return function (t) {
      return a([e, t]);
    };
  }function a(n) {
    if (r) throw new TypeError('Generator is already executing.');for (; o;) {
      try {
        if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
            i = n;break;case 4:
            return o.label++, { value: n[1], done: !1 };case 5:
            o.label++, l = n[1], n = [0];continue;case 7:
            n = o.ops.pop(), o.trys.pop();continue;default:
            if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
              o = 0;continue;
            }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
              o.label = n[1];break;
            }if (6 === n[0] && o.label < i[1]) {
              o.label = i[1], i = n;break;
            }if (i && o.label < i[2]) {
              o.label = i[2], o.ops.push(n);break;
            }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
      } catch (t) {
        n = [6, t], l = 0;
      } finally {
        r = i = 0;
      }
    }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
  }var o = { label: 0, sent: function sent() {
      if (1 & i[0]) throw i[1];return i[1];
    }, trys: [], ops: [] },
      r,
      l,
      i,
      d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
    return this;
  }), d;
},
    _this = undefined;(function () {
  function e(e) {
    return 'undefined' === typeof e || null === e;
  }function t(e) {
    e.properties = e.properties || {}, e.properties.lang = { type: String, notify: !0, value: null }, e.properties.langReady = { type: Boolean, notify: !0, value: !1 };
  }function s(e, t) {
    var s = document.createElement('div');return s.style[e] = t, s.style[e] === t;
  }function n(e, t, s) {
    var n = null,
        a = { onfinish: null, oncancel: null, cancel: function cancel() {
        n && n.cancel(), this.oncancel && this.oncancel.apply(this, { currentTime: Date.now(), timelineTime: null });
      }, play: function play() {
        var a = this;n && n.cancel(), n = s(e, t, function () {
          a.onfinish && a.onfinish.apply(a, { currentTime: Date.now(), timelineTime: null });
        });
      }, reverse: function reverse() {
        var a = this;n && n.cancel(), n = s(t, e, function () {
          a.onfinish && a.onfinish.apply(a, { currentTime: Date.now(), timelineTime: null });
        });
      }, pause: function pause() {}, finish: function finish() {}, currentTime: 0, effect: { getTiming: function getTiming() {
          return { delay: 0, direction: 'normal', fill: 'both' };
        }, updateTiming: function updateTiming() {}, getComputedTiming: function getComputedTiming() {
          return { endTime: 0, activeDuration: 0, currentIteration: 0, localTime: 0, progress: null };
        } }, updatePlaybackRate: function updatePlaybackRate() {}, addEventListener: function addEventListener() {}, removeEventListener: function removeEventListener() {}, dispatchEvent: function dispatchEvent() {
        return !0;
      }, finished: Promise.resolve(a), pending: !1, startTime: Date.now(), id: '', ready: Promise.resolve(a), playState: 'finished', playbackRate: 1, timeline: { currentTime: Date.now() } };return s(e, t, function () {
      a.onfinish && a.onfinish.apply(a, { currentTime: Date.now(), timelineTime: null });
    }), a;
  }if (!window.onExists) {
    var a = function () {
      function e(e) {
        var t = this;this._val = null, this._state = 'pending', this._done = !1, this._resolveListeners = [], this._rejectListeners = [], e(function (e) {
          t._done || (t._done = !0, t._val = e, t._state = 'resolved', t._resolveListeners.forEach(function (t) {
            t(e);
          }));
        }, function (e) {
          t._done || (t._done = !0, t._val = e, t._state = 'rejected', t._rejectListeners.forEach(function (t) {
            t(e);
          }));
        });
      }return e.prototype.then = function (e, t) {
        return e ? (this._done && 'resolved' === this._state ? e(this._val) : this._resolveListeners.push(e), !t) ? this : (this._done && 'rejected' === this._state ? t(this._val) : this._rejectListeners.push(t), this) : this;
      }, e.chain = function (t) {
        return new e(function (s) {
          return t[0] ? void t[0]().then(function (n) {
            t[1] ? e.chain(t.slice(1)).then(function (e) {
              s(e);
            }) : s(n);
          }) : void s(null);
        });
      }, e;
    }();window.onExists = function (t, s) {
      s || (s = window);var n = window.Promise || a;return new n(function (n) {
        if (t in s && !e(s[t])) return void n(s[t]);var a = window.setInterval(function () {
          t in s && !e(s[t]) && (window.clearInterval(a), n(s[t]));
        }, 50);
      });
    };var o = function o(e) {
      var t = {};return Object.getOwnPropertyNames(e).forEach(function (s) {
        t[s] = e[s];
      }), t;
    },
        r = function () {
      var e = function () {
        function e() {
          var e = this,
              t;this._currentLangFile = null, this._lang = null, this._listeners = [], this._languageChangeListeners = [], this.ready = function () {
            return __awaiter(e, void 0, void 0, function () {
              var e = this,
                  t,
                  s;return __generator(this, function (n) {
                switch (n.label) {case 0:
                    return t = this, [4, this.fetchLang()];case 1:
                    return t._lang = n.sent(), s = this, [4, this.Files.loadLang(this._lang)];case 2:
                    return s._currentLangFile = n.sent(), this._listeners.forEach(function (t) {
                      t.langReady = !0, t.onLangChanged && t.onLangChanged.call(t, e._lang, null);
                    }), [2];}
              });
            });
          }(), this.Files = (t = function () {
            function e() {}return e._isWebPageEnv = function () {
              return 'http:' === location.protocol || 'https:' === location.protocol;
            }, e._loadFile = function (e) {
              var t = this;return new window.Promise(function (s, n) {
                var a = new window.XMLHttpRequest(),
                    o = t._isWebPageEnv() ? '../' + e : browserAPI.runtime.getURL(e);a.open('GET', o), a.onreadystatechange = function () {
                  a.readyState === window.XMLHttpRequest.DONE && (200 === a.status ? s(a.responseText) : n(new Error('Failed XHR')));
                }, a.send();
              });
            }, e._parseLang = function (e) {
              var t = JSON.parse(e),
                  s = {};for (var n in t) {
                if ('$schema' !== n && 'comments' !== n) {
                  var a = t[n],
                      o = [];for (var r in a.placeholders || {}) {
                    var l = a.placeholders[r].content;o.push({ index: o.length, content: l, expr: new RegExp('\\$' + r + '\\$', 'gi') });
                  }s[n] = { message: a.message || '{{' + n + '}}', placeholders: o };
                }
              }return s;
            }, e.loadLang = function (e) {
              return __awaiter(this, void 0, void 0, function () {
                var t, s, n;return __generator(this, function (a) {
                  switch (a.label) {case 0:
                      if (this._loadedLangs[e]) return [2, this._loadedLangs[e]];a.label = 1;case 1:
                      return a.trys.push([1, 3,, 4]), [4, this._loadFile('_locales/' + e + '/messages.json')];case 2:
                      return t = a.sent(), s = this._parseLang(t), this._loadedLangs[e] = s, [2, s];case 3:
                      throw n = a.sent(), n;case 4:
                      return [2];}
                });
              });
            }, e.getLangFile = function (e) {
              return this._loadedLangs[e];
            }, e;
          }(), t._loadedLangs = {}, t);
        }return e.prototype._getDefaultLang = function () {
          return __awaiter(this, void 0, void 0, function () {
            var t, s;return __generator(this, function (n) {
              switch (n.label) {case 0:
                  return [4, browserAPI.i18n.getAcceptLanguages()];case 1:
                  return (t = n.sent(), -1 < t.indexOf(e.DEFAULT_LANG)) ? [2, e.DEFAULT_LANG] : (s = t.filter(function (t) {
                    return -1 !== e.SUPPORTED_LANGS.indexOf(t);
                  }), [2, s[0] || e.DEFAULT_LANG]);}
            });
          });
        }, e.prototype.fetchLang = function () {
          return __awaiter(this, void 0, void 0, function () {
            var e, t;return __generator(this, function (s) {
              switch (s.label) {case 0:
                  return [4, window.onExists('browserAPI')];case 1:
                  return s.sent(), [4, browserAPI.storage.local.get('lang')];case 2:
                  return e = s.sent().lang, e ? [3, 4] : [4, this._getDefaultLang()];case 3:
                  return t = s.sent(), browserAPI.storage.local.set({ lang: t }), [2, t];case 4:
                  return [2, e];}
            });
          });
        }, e.prototype.getLang = function () {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function () {
              return this._lang ? [2, this._lang] : [2, this.fetchLang()];
            });
          });
        }, e.prototype.setLang = function (e) {
          return __awaiter(this, void 0, void 0, function () {
            var t = this,
                s;return __generator(this, function (n) {
              switch (n.label) {case 0:
                  return [4, this.getLang()];case 1:
                  return s = n.sent(), [4, browserAPI.storage.local.set({ lang: e })];case 2:
                  return n.sent(), this._listeners.forEach(function (t) {
                    return t.onLangChange && t.onLangChange.call(t, e, s);
                  }), this.ready = function () {
                    return __awaiter(t, void 0, void 0, function () {
                      var t = this,
                          n;return __generator(this, function (a) {
                        switch (a.label) {case 0:
                            return n = this, [4, this.Files.loadLang(e)];case 1:
                            return n._currentLangFile = a.sent(), this._listeners.forEach(function (n) {
                              t._lang = e, n.lang = e, n.langReady = !0, t._languageChangeListeners.forEach(function (e) {
                                return e();
                              }), t._listeners.forEach(function (t) {
                                return t.onLangChanged && t.onLangChanged.call(t, e, s);
                              });
                            }), [2];}
                      });
                    });
                  }(), [2];}
            });
          });
        }, e.prototype.langReady = function (e) {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function () {
              return [2, void 0 !== this.Files.getLangFile(e)];
            });
          });
        }, e.prototype._getMessage = function (t) {
          for (var s = [], n = 1; n < arguments.length; n++) {
            s[n - 1] = arguments[n];
          }var a = this._currentLangFile[t];if (!a) return '{{' + t + '}}';var o = a.message,
              r = a.placeholders,
              l = r.map(function (e) {
            return e.content;
          });if (!o) return '{{' + t + '}}';for (var d = function d(t) {
            var n = e.INDEX_REGEXPS[t];o = o.replace(n, s[t]), l = l.map(function (e) {
              return e.replace(n, s[t]);
            });
          }, c = 0; c < s.length; c++) {
            d(c);
          }for (var i = 0, u = r; i < u.length; i++) {
            var p = u[i],
                g = p.expr,
                m = p.index;o = o.replace(g, l[m]);
          }return o;
        }, e.prototype.__sync = function (e) {
          for (var t = [], s = 1; s < arguments.length; s++) {
            t[s - 1] = arguments[s];
          }return this._lang && this._currentLangFile ? this._getMessage.apply(this, [e].concat(t.map(function (e) {
            return e + '';
          }))) : '{{' + e + '}}';
        }, e.prototype.__ = function (e) {
          for (var t = [], s = 1; s < arguments.length; s++) {
            t[s - 1] = arguments[s];
          }return __awaiter(this, void 0, void 0, function () {
            var s;return __generator(this, function (n) {
              switch (n.label) {case 0:
                  return [4, this.ready];case 1:
                  return n.sent(), s = this._getMessage.apply(this, [e].concat(t.map(function (e) {
                    return e + '';
                  }))), [2, s];}
            });
          });
        }, e.prototype.addLoadListener = function (e) {
          -1 !== this._listeners.indexOf(e) || (this._listeners.push(e), this._lang && (e.lang = this._lang, this.Files.getLangFile(this._lang) && (e.langReady = !0)));
        }, e.prototype.addLanguageChangeListener = function (e) {
          this._languageChangeListeners.push(e);
        }, e.DEFAULT_LANG = 'en', e.SUPPORTED_LANGS = ['en'], e.INDEX_REGEXPS = [new RegExp(/\$1/g), new RegExp(/\$2/g), new RegExp(/\$3/g), new RegExp(/\$4/g), new RegExp(/\$5/g), new RegExp(/\$6/g), new RegExp(/\$7/g), new RegExp(/\$8/g), new RegExp(/\$9/g)], e;
      }(),
          t = new e(),
          s = t.__.bind(t),
          n = function n(e) {
        for (var t = [], n = 1; n < arguments.length; n++) {
          t[n - 1] = arguments[n];
        }return s.apply(void 0, [e].concat(t));
      };n.sync = t.__sync.bind(t), n.getLang = t.getLang.bind(t), n.setLang = t.setLang.bind(t), n.SUPPORTED_LANGS = e.SUPPORTED_LANGS, n.addListener = t.addLanguageChangeListener.bind(t), n.ready = function () {
        return t.ready;
      }, window.__ = n;var a = function () {
        function e() {}return e.__ = function (e, t, s) {
          for (var n = [], a = 3, o; a < arguments.length; a++) {
            n[a - 3] = arguments[a];
          }return this.instance.addLoadListener(this), (o = this.instance).__sync.apply(o, [s].concat(n));
        }, e.__exec = function (e, t, s) {
          for (var n = [], a = 3, o; a < arguments.length; a++) {
            n[a - 3] = arguments[a];
          }for (var r = [], l = 0, i; l < n.length; l++) {
            if (i = n[l], 'string' === typeof i) r.push(i);else if ('function' === typeof i) {
              var d = i.bind(this).apply(void 0, n.slice(l + 1, l + 1 + i.length));r.push(d);
            }
          }return this.instance.addLoadListener(this), (o = this.instance).__sync.apply(o, [s].concat(r));
        }, e.__async = function (e) {
          for (var t = [], s = 1, n; s < arguments.length; s++) {
            t[s - 1] = arguments[s];
          }return this.instance.addLoadListener(this), (n = this.instance).__.apply(n, [e].concat(t));
        }, e.___ = function (e) {
          for (var t = [], s = 1, n; s < arguments.length; s++) {
            t[s - 1] = arguments[s];
          }return this.instance.addLoadListener(this), (n = this.instance).__sync.apply(n, [e].concat(t));
        }, e.instance = t, e;
      }();return a;
    }(),
        l = function l(e) {
      var s = __assign({}, e, r),
          n = s.ready;t(s), window.Polymer(__assign({}, s, { ready: function ready() {
          this.classList.add('browser-' + BrowserAPI.getBrowser()), n && 'function' === typeof n && n.apply(this, []);
        } }));
    };window.withAsync = function (e, t) {
      return __awaiter(_this, void 0, void 0, function () {
        var s, n;return __generator(this, function (a) {
          switch (a.label) {case 0:
              return [4, e()];case 1:
              return s = a.sent(), [4, t()];case 2:
              return n = a.sent(), [4, s()];case 3:
              return a.sent(), [2, n];}
        });
      });
    }, window['with'] = function (e, t) {
      var s = e(),
          n = t();return s(), n;
    };var i = null,
        d = window.getComputedStyle && 'transform' in window.getComputedStyle(document.documentElement, '');window.setDisplayFlex = function (e) {
      null === i && (i = s('display', 'flex')), e.style.display = i ? 'flex' : '-webkit-flex';
    }, window.setTransform = function (e, t) {
      d ? e.style.transform = t : e.style.webkitTransform = t;
    }, window.animateTransform = function (e, t, s) {
      var a = t.from,
          o = t.propName,
          r = t.to,
          l = t.postfix;if (d && !e.__isAnimationJqueryPolyfill) return e.animate([{ transform: o + '(' + a + l + ')' }, { transform: o + '(' + r + l + ')' }], s);e.style.webkitTransform = o + '(' + a + l + ')';var i = document.createElement('div');return n('0px', '100px', function (t, n, d) {
        return i.style.height = t, $(i).animate({ height: n }, { duration: s.duration || 500, step: function step(t) {
            e.style.webkitTransform = o + '(' + (a + (r - a) / 100 * t) + l + ')';
          }, complete: function complete() {
            e.style.webkitTransform = o + '(' + n + l + ')', d();
          } }), { cancel: function cancel() {
            $(i).stop();
          } };
      });
    }, 'undefined' !== typeof Event && -1 === location.href.indexOf('background.html') && window.onExists('Promise').then(function () {
      window.onExists('Polymer').then(function () {
        window.objectify = o, window.register = l;var e = new Event('RegisterReady');window.dispatchEvent(e);
      });
    }), window.onExistsChain = function (e, t, s, n, o, r) {
      var l = window.Promise || a;return new l(function (i) {
        var d = e;a.chain([t, s, n, o, r].filter(function (e) {
          return !!e;
        }).map(function (e) {
          return function () {
            return new l(function (t) {
              window.onExists(e, d).then(function (e) {
                d = e, t(e);
              });
            });
          };
        })).then(function (e) {
          i(e);
        });
      });
    };
  }
})(), function (e, t) {
  'use notstrict';
  'object' === ('undefined' === typeof module ? 'undefined' : babelHelpers['typeof'](module)) && 'object' === babelHelpers['typeof'](module.exports) ? module.exports = e.document ? t(e, !0) : function (e) {
    if (!e.document) throw new Error('jQuery requires a window with a document');return t(e);
  } : t(e);
}('undefined' === typeof window ? undefined : window, function (e, t) {
  'use notstrict';
  function s(e, t, s) {
    t = t || de;var n = t.createElement('script'),
        a;if (n.text = e, s) for (a in _e) {
      s[a] && (n[a] = s[a]);
    }t.head.appendChild(n).parentNode.removeChild(n);
  }function n(e) {
    return null == e ? e + '' : 'object' === ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) || 'function' === typeof e ? he[ye.call(e)] || 'object' : 'undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e);
  }function a(e) {
    var t = !!e && 'length' in e && e.length,
        s = n(e);return Ie(e) || Se(e) ? !1 : 'array' === s || 0 === t || 'number' === typeof t && 0 < t && t - 1 in e;
  }function o(e, t) {
    return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase();
  }function r(e, t, s) {
    return Ie(t) ? Ce.grep(e, function (e, n) {
      return !!t.call(e, n, e) !== s;
    }) : t.nodeType ? Ce.grep(e, function (e) {
      return e === t !== s;
    }) : 'string' === typeof t ? Ce.filter(t, e, s) : Ce.grep(e, function (e) {
      return -1 < me.call(t, e) !== s;
    });
  }function l(e, t) {
    for (; (e = e[t]) && 1 !== e.nodeType;) {}return e;
  }function i(e) {
    var t = {};return Ce.each(e.match(je) || [], function (e, s) {
      t[s] = !0;
    }), t;
  }function d(e) {
    return e;
  }function c(e) {
    throw e;
  }function u(e, t, s, n) {
    var a;try {
      e && Ie(a = e.promise) ? a.call(e).done(t).fail(s) : e && Ie(a = e.then) ? a.call(e, t, s) : t.apply(void 0, [e].slice(n));
    } catch (e) {
      s.apply(void 0, [e]);
    }
  }function p() {
    de.removeEventListener('DOMContentLoaded', p), e.removeEventListener('load', p), Ce.ready();
  }function g(e, t) {
    return t.toUpperCase();
  }function m(e) {
    return e.replace(Be, 'ms-').replace(He, g);
  }function h() {
    this.expando = Ce.expando + h.uid++;
  }function y(e) {
    return 'true' === e || 'false' !== e && ('null' === e ? null : e === +e + '' ? +e : $e.test(e) ? JSON.parse(e) : e);
  }function f(e, t, s) {
    var n;if (void 0 === s && 1 === e.nodeType) if (n = 'data-' + t.replace(Xe, '-$&').toLowerCase(), s = e.getAttribute(n), 'string' === typeof s) {
      try {
        s = y(s);
      } catch (t) {}Ge.set(e, t, s);
    } else s = void 0;return s;
  }function b(e, t, s, n) {
    var a = 20,
        o = n ? function () {
      return n.cur();
    } : function () {
      return Ce.css(e, t, '');
    },
        r = o(),
        l = s && s[3] || (Ce.cssNumber[t] ? '' : 'px'),
        i = (Ce.cssNumber[t] || 'px' !== l && +r) && ze.exec(Ce.css(e, t)),
        d,
        c;if (i && i[3] !== l) {
      for (r /= 2, l = l || i[3], i = +r || 1; a--;) {
        Ce.style(e, t, i + l), 0 >= (1 - c) * (1 - (c = o() / r || 0.5)) && (a = 0), i /= c;
      }i *= 2, Ce.style(e, t, i + l), s = s || [];
    }return s && (i = +i || +r || 0, d = s[1] ? i + (s[1] + 1) * s[2] : +s[2], n && (n.unit = l, n.start = i, n.end = d)), d;
  }function x(e) {
    var t = e.ownerDocument,
        s = e.nodeName,
        n = Ze[s],
        a;return n ? n : (a = t.body.appendChild(t.createElement(s)), n = Ce.css(a, 'display'), a.parentNode.removeChild(a), 'none' === n && (n = 'block'), Ze[s] = n, n);
  }function v(e, t) {
    for (var s = [], n = 0, a = e.length, o, r; n < a; n++) {
      (r = e[n], !!r.style) && (o = r.style.display, t ? ('none' === o && (s[n] = We.get(r, 'display') || null, !s[n] && (r.style.display = '')), '' === r.style.display && Ye(r) && (s[n] = x(r))) : 'none' !== o && (s[n] = 'none', We.set(r, 'display', o)));
    }for (n = 0; n < a; n++) {
      null != s[n] && (e[n].style.display = s[n]);
    }return e;
  }function I(e, t) {
    var s;return s = 'undefined' === typeof e.getElementsByTagName ? 'undefined' === typeof e.querySelectorAll ? [] : e.querySelectorAll(t || '*') : e.getElementsByTagName(t || '*'), void 0 === t || t && o(e, t) ? Ce.merge([e], s) : s;
  }function S(e, t) {
    for (var s = 0, n = e.length; s < n; s++) {
      We.set(e[s], 'globalEval', !t || We.get(t[s], 'globalEval'));
    }
  }function _(e, t, s, a, o) {
    for (var r = t.createDocumentFragment(), d = [], c = 0, i = e.length, l, u, p, g, m, h; c < i; c++) {
      if (l = e[c], l || 0 === l) if ('object' === n(l)) Ce.merge(d, l.nodeType ? [l] : l);else if (!at.test(l)) d.push(t.createTextNode(l));else {
        for (u = u || r.appendChild(t.createElement('div')), p = (tt.exec(l) || ['', ''])[1].toLowerCase(), g = nt[p] || nt._default, u.innerHTML = g[1] + Ce.htmlPrefilter(l) + g[2], h = g[0]; h--;) {
          u = u.lastChild;
        }Ce.merge(d, u.childNodes), u = r.firstChild, u.textContent = '';
      }
    }for (r.textContent = '', c = 0; l = d[c++];) {
      if (a && -1 < Ce.inArray(l, a)) {
        o && o.push(l);continue;
      }if (m = Ce.contains(l.ownerDocument, l), u = I(r.appendChild(l), 'script'), m && S(u), s) for (h = 0; l = u[h++];) {
        st.test(l.type || '') && s.push(l);
      }
    }return r;
  }function k() {
    return !0;
  }function C() {
    return !1;
  }function M() {
    try {
      return de.activeElement;
    } catch (e) {}
  }function T(e, t, s, n, a, o) {
    var r, l;if ('object' === ('undefined' === typeof t ? 'undefined' : babelHelpers['typeof'](t))) {
      for (l in 'string' !== typeof s && (n = n || s, s = void 0), t) {
        T(e, l, s, n, t[l], o);
      }return e;
    }if (null == n && null == a ? (a = s, n = s = void 0) : null == a && ('string' === typeof s ? (a = n, n = void 0) : (a = n, n = s, s = void 0)), !1 === a) a = C;else if (!a) return e;return 1 === o && (r = a, a = function a(e) {
      return Ce().off(e), r.apply(this, arguments);
    }, a.guid = r.guid || (r.guid = Ce.guid++)), e.each(function () {
      Ce.event.add(this, t, a, n, s);
    });
  }function w(e, t) {
    return o(e, 'table') && o(11 === t.nodeType ? t.firstChild : t, 'tr') ? Ce(e).children('tbody')[0] || e : e;
  }function N(e) {
    return e.type = (null !== e.getAttribute('type')) + '/' + e.type, e;
  }function L(e) {
    return 'true/' === (e.type || '').slice(0, 5) ? e.type = e.type.slice(5) : e.removeAttribute('type'), e;
  }function E(e, t) {
    var s, n, a, o, r, l, i, d;if (1 === t.nodeType) {
      if (We.hasData(e) && (o = We.access(e), r = We.set(t, o), d = o.events, d)) for (a in delete r.handle, r.events = {}, d) {
        for (s = 0, n = d[a].length; s < n; s++) {
          Ce.event.add(t, a, d[a][s]);
        }
      }Ge.hasData(e) && (l = Ge.access(e), i = Ce.extend({}, l), Ge.set(t, i));
    }
  }function P(e, t) {
    var s = t.nodeName.toLowerCase();'input' === s && et.test(e.type) ? t.checked = e.checked : ('input' === s || 'textarea' === s) && (t.defaultValue = e.defaultValue);
  }function A(e, t, n, a) {
    t = pe.apply([], t);var o = 0,
        r = e.length,
        l = t[0],
        i = Ie(l),
        d,
        c,
        u,
        p,
        g,
        m;if (i || 1 < r && 'string' === typeof l && !ve.checkClone && ut.test(l)) return e.each(function (s) {
      var o = e.eq(s);i && (t[0] = l.call(this, s, o.html())), A(o, t, n, a);
    });if (r && (d = _(t, e[0].ownerDocument, !1, e, a), c = d.firstChild, 1 === d.childNodes.length && (d = c), c || a)) {
      for (u = Ce.map(I(d, 'script'), N), p = u.length; o < r; o++) {
        g = d, o !== r - 1 && (g = Ce.clone(g, !0, !0), p && Ce.merge(u, I(g, 'script'))), n.call(e[o], g, o);
      }if (p) for (m = u[u.length - 1].ownerDocument, Ce.map(u, L), o = 0; o < p; o++) {
        g = u[o], st.test(g.type || '') && !We.access(g, 'globalEval') && Ce.contains(m, g) && (g.src && 'module' !== (g.type || '').toLowerCase() ? Ce._evalUrl && Ce._evalUrl(g.src) : s(g.textContent.replace(pt, ''), m, g));
      }
    }return e;
  }function U(e, t, s) {
    for (var n = t ? Ce.filter(t, e) : e, a = 0, o; null != (o = n[a]); a++) {
      s || 1 !== o.nodeType || Ce.cleanData(I(o)), o.parentNode && (s && Ce.contains(o.ownerDocument, o) && S(I(o, 'script')), o.parentNode.removeChild(o));
    }return e;
  }function R(e, t, s) {
    var n = e.style,
        a,
        o,
        r,
        l;return s = s || mt(e), s && (l = s.getPropertyValue(t) || s[t], '' === l && !Ce.contains(e.ownerDocument, e) && (l = Ce.style(e, t)), !ve.pixelBoxStyles() && gt.test(l) && ht.test(t) && (a = n.width, o = n.minWidth, r = n.maxWidth, n.minWidth = n.maxWidth = n.width = l, l = s.width, n.width = a, n.minWidth = o, n.maxWidth = r)), void 0 === l ? l : l + '';
  }function D(e, t) {
    return { get: function get() {
        return e() ? void delete this.get : (this.get = t).apply(this, arguments);
      } };
  }function j(e) {
    if (e in It) return e;for (var t = e[0].toUpperCase() + e.slice(1), s = vt.length; s--;) {
      if (e = vt[s] + t, e in It) return e;
    }
  }function O(e) {
    var t = Ce.cssProps[e];return t || (t = Ce.cssProps[e] = j(e) || e), t;
  }function V(e, t, s) {
    var n = ze.exec(t);return n ? re(0, n[2] - (s || 0)) + (n[3] || 'px') : t;
  }function F(e, t, s, n, a, o) {
    var r = 'width' === t ? 1 : 0,
        l = 0,
        i = 0;if (s === (n ? 'border' : 'content')) return 0;for (; 4 > r; r += 2) {
      'margin' === s && (i += Ce.css(e, s + Je[r], !0, a)), n ? ('content' === s && (i -= Ce.css(e, 'padding' + Je[r], !0, a)), 'margin' !== s && (i -= Ce.css(e, 'border' + Je[r] + 'Width', !0, a))) : (i += Ce.css(e, 'padding' + Je[r], !0, a), 'padding' === s ? l += Ce.css(e, 'border' + Je[r] + 'Width', !0, a) : i += Ce.css(e, 'border' + Je[r] + 'Width', !0, a));
    }return !n && 0 <= o && (i += re(0, oe(e['offset' + t[0].toUpperCase() + t.slice(1)] - o - i - l - 0.5))), i;
  }function B(e, t, s) {
    var n = mt(e),
        a = R(e, t, n),
        o = 'border-box' === Ce.css(e, 'boxSizing', !1, n),
        r = o;if (gt.test(a)) {
      if (!s) return a;a = 'auto';
    }return r = r && (ve.boxSizingReliable() || a === e.style[t]), 'auto' !== a && (parseFloat(a) || 'inline' !== Ce.css(e, 'display', !1, n)) || (a = e['offset' + t[0].toUpperCase() + t.slice(1)], r = !0), a = parseFloat(a) || 0, a + F(e, t, s || (o ? 'border' : 'content'), r, n, a) + 'px';
  }function H(e, t, s, n, a) {
    return new H.prototype.init(e, t, s, n, a);
  }function q() {
    Ct && (!1 === de.hidden && e.requestAnimationFrame ? e.requestAnimationFrame(q) : e.setTimeout(q, Ce.fx.interval), Ce.fx.tick());
  }function W() {
    return e.setTimeout(function () {
      kt = void 0;
    }), kt = Date.now();
  }function G(e, t) {
    var s = 0,
        n = { height: e },
        a;for (t = t ? 1 : 0; 4 > s; s += 2 - t) {
      a = Je[s], n['margin' + a] = n['padding' + a] = e;
    }return t && (n.opacity = n.width = e), n;
  }function X(e, t, s) {
    for (var n = (z.tweeners[t] || []).concat(z.tweeners['*']), a = 0, o = n.length, r; a < o; a++) {
      if (r = n[a].call(s, t, e)) return r;
    }
  }function K(e, t) {
    var s, n, a, o, r;for (s in e) {
      if (n = m(s), a = t[n], o = e[s], Array.isArray(o) && (a = o[1], o = e[s] = o[0]), s !== n && (e[n] = o, delete e[s]), r = Ce.cssHooks[n], r && 'expand' in r) for (s in o = r.expand(o), delete e[n], o) {
        s in e || (e[s] = o[s], t[s] = a);
      } else t[n] = a;
    }
  }function z(e, t, s) {
    var n = 0,
        a = z.prefilters.length,
        o = Ce.Deferred().always(function () {
      delete r.elem;
    }),
        r = function r() {
      if (c) return !1;for (var t = kt || W(), s = re(0, l.startTime + l.duration - t), n = s / l.duration || 0, a = 1 - n, r = 0, i = l.tweens.length; r < i; r++) {
        l.tweens[r].run(a);
      }return (o.notifyWith(e, [l, a, s]), 1 > a && i) ? s : (i || o.notifyWith(e, [l, 1, 0]), o.resolveWith(e, [l]), !1);
    },
        l = o.promise({ elem: e, props: Ce.extend({}, t), opts: Ce.extend(!0, { specialEasing: {}, easing: Ce.easing._default }, s), originalProperties: t, originalOptions: s, startTime: kt || W(), duration: s.duration, tweens: [], createTween: function createTween(t, s) {
        var n = Ce.Tween(e, l.opts, t, s, l.opts.specialEasing[t] || l.opts.easing);return l.tweens.push(n), n;
      }, stop: function stop(t) {
        var s = 0,
            n = t ? l.tweens.length : 0;if (c) return this;for (c = !0; s < n; s++) {
          l.tweens[s].run(1);
        }return t ? (o.notifyWith(e, [l, 1, 0]), o.resolveWith(e, [l, t])) : o.rejectWith(e, [l, t]), this;
      } }),
        i = l.props,
        d,
        c;for (K(i, l.opts.specialEasing); n < a; n++) {
      if (d = z.prefilters[n].call(l, e, i, l.opts), d) return Ie(d.stop) && (Ce._queueHooks(l.elem, l.opts.queue).stop = d.stop.bind(d)), d;
    }return Ce.map(i, X, l), Ie(l.opts.start) && l.opts.start.call(e, l), l.progress(l.opts.progress).done(l.opts.done, l.opts.complete).fail(l.opts.fail).always(l.opts.always), Ce.fx.timer(Ce.extend(r, { elem: e, anim: l, queue: l.opts.queue })), l;
  }function J(e) {
    var t = e.match(je) || [];return t.join(' ');
  }function Y(e) {
    return e.getAttribute && e.getAttribute('class') || '';
  }function Q(e) {
    return Array.isArray(e) ? e : 'string' === typeof e ? e.match(je) || [] : [];
  }function Z(e, t, s, a) {
    if (Array.isArray(t)) Ce.each(t, function (t, n) {
      s || Dt.test(e) ? a(e, n) : Z(e + '[' + ('object' === ('undefined' === typeof n ? 'undefined' : babelHelpers['typeof'](n)) && null != n ? t : '') + ']', n, s, a);
    });else if (!s && 'object' === n(t)) for (var o in t) {
      Z(e + '[' + o + ']', t[o], s, a);
    } else a(e, t);
  }function ee(e) {
    return function (t, s) {
      'string' !== typeof t && (s = t, t = '*');var n = 0,
          a = t.toLowerCase().match(je) || [],
          o;if (Ie(s)) for (; o = a[n++];) {
        '+' === o[0] ? (o = o.slice(1) || '*', (e[o] = e[o] || []).unshift(s)) : (e[o] = e[o] || []).push(s);
      }
    };
  }function te(e, t, s, n) {
    function a(l) {
      var i;return o[l] = !0, Ce.each(e[l] || [], function (e, l) {
        var d = l(t, s, n);return 'string' !== typeof d || r || o[d] ? r ? !(i = d) : void 0 : (t.dataTypes.unshift(d), a(d), !1);
      }), i;
    }var o = {},
        r = e === Kt;return a(t.dataTypes[0]) || !o['*'] && a('*');
  }function se(e, t) {
    var s = Ce.ajaxSettings.flatOptions || {},
        n,
        a;for (n in t) {
      void 0 !== t[n] && ((s[n] ? e : a || (a = {}))[n] = t[n]);
    }return a && Ce.extend(!0, e, a), e;
  }function ne(e, t, s) {
    for (var n = e.contents, a = e.dataTypes, o, r, l, i; '*' === a[0];) {
      a.shift(), void 0 === o && (o = e.mimeType || t.getResponseHeader('Content-Type'));
    }if (o) for (r in n) {
      if (n[r] && n[r].test(o)) {
        a.unshift(r);break;
      }
    }if (a[0] in s) l = a[0];else {
      for (r in s) {
        if (!a[0] || e.converters[r + ' ' + a[0]]) {
          l = r;break;
        }i || (i = r);
      }l = l || i;
    }return l ? (l !== a[0] && a.unshift(l), s[l]) : void 0;
  }function ae(e, t, s, n) {
    var a = {},
        o = e.dataTypes.slice(),
        r,
        l,
        i,
        d,
        c;if (o[1]) for (i in e.converters) {
      a[i.toLowerCase()] = e.converters[i];
    }for (l = o.shift(); l;) {
      if (e.responseFields[l] && (s[e.responseFields[l]] = t), !c && n && e.dataFilter && (t = e.dataFilter(t, e.dataType)), c = l, l = o.shift(), l) if ('*' === l) l = c;else if ('*' !== c && c !== l) {
        if (i = a[c + ' ' + l] || a['* ' + l], !i) for (r in a) {
          if (d = r.split(' '), d[1] === l && (i = a[c + ' ' + d[0]] || a['* ' + d[0]], i)) {
            !0 === i ? i = a[r] : !0 !== a[r] && (l = d[0], o.unshift(d[1]));break;
          }
        }if (!0 !== i) if (i && e.throws) t = i(t);else try {
          t = i(t);
        } catch (t) {
          return { state: 'parsererror', error: i ? t : 'No conversion from ' + c + ' to ' + l };
        }
      }
    }return { state: 'success', data: t };
  }var oe = Math.ceil,
      re = Math.max,
      le = String.fromCharCode,
      ie = [],
      de = e.document,
      ce = Object.getPrototypeOf,
      ue = ie.slice,
      pe = ie.concat,
      ge = ie.push,
      me = ie.indexOf,
      he = {},
      ye = he.toString,
      fe = he.hasOwnProperty,
      be = fe.toString,
      xe = be.call(Object),
      ve = {},
      Ie = function Ie(e) {
    return 'function' === typeof e && 'number' !== typeof e.nodeType;
  },
      Se = function Se(e) {
    return null != e && e === e.window;
  },
      _e = { type: !0, src: !0, noModule: !0 },
      ke = '3.3.1',
      Ce = function e(t, s) {
    return new e.fn.init(t, s);
  },
      Me = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;Ce.fn = Ce.prototype = { jquery: ke, constructor: Ce, length: 0, toArray: function toArray() {
      return ue.call(this);
    }, get: function get(e) {
      return null == e ? ue.call(this) : 0 > e ? this[e + this.length] : this[e];
    }, pushStack: function pushStack(e) {
      var t = Ce.merge(this.constructor(), e);return t.prevObject = this, t;
    }, each: function each(e) {
      return Ce.each(this, e);
    }, map: function map(e) {
      return this.pushStack(Ce.map(this, function (t, s) {
        return e.call(t, s, t);
      }));
    }, slice: function slice() {
      return this.pushStack(ue.apply(this, arguments));
    }, first: function first() {
      return this.eq(0);
    }, last: function last() {
      return this.eq(-1);
    }, eq: function eq(e) {
      var t = this.length,
          s = +e + (0 > e ? t : 0);return this.pushStack(0 <= s && s < t ? [this[s]] : []);
    }, end: function end() {
      return this.prevObject || this.constructor();
    }, push: ge, sort: ie.sort, splice: ie.splice }, Ce.extend = Ce.fn.extend = function () {
    var e = arguments[0] || {},
        t = 1,
        s = arguments.length,
        n = !1,
        a,
        o,
        r,
        l,
        i,
        d;for ('boolean' === typeof e && (n = e, e = arguments[t] || {}, t++), 'object' === ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) || Ie(e) || (e = {}), t === s && (e = this, t--); t < s; t++) {
      if (null != (a = arguments[t])) for (o in a) {
        (r = e[o], l = a[o], e !== l) && (n && l && (Ce.isPlainObject(l) || (i = Array.isArray(l))) ? (i ? (i = !1, d = r && Array.isArray(r) ? r : []) : d = r && Ce.isPlainObject(r) ? r : {}, e[o] = Ce.extend(n, d, l)) : void 0 !== l && (e[o] = l));
      }
    }return e;
  }, Ce.extend({ expando: 'jQuery' + (ke + Math.random()).replace(/\D/g, ''), isReady: !0, error: function error(e) {
      throw new Error(e);
    }, noop: function noop() {}, isPlainObject: function isPlainObject(e) {
      var t, s;return e && '[object Object]' === ye.call(e) && ((t = ce(e), !!!t) || (s = fe.call(t, 'constructor') && t.constructor, 'function' === typeof s && be.call(s) === xe));
    }, isEmptyObject: function isEmptyObject(e) {
      for (var t in e) {
        return !1;
      }return !0;
    }, globalEval: function globalEval(e) {
      s(e);
    }, each: function each(e, t) {
      var s = 0,
          n;if (a(e)) for (n = e.length; s < n && !1 !== t.call(e[s], s, e[s]); s++) {} else for (s in e) {
        if (!1 === t.call(e[s], s, e[s])) break;
      }return e;
    }, trim: function trim(e) {
      return null == e ? '' : (e + '').replace(Me, '');
    }, makeArray: function makeArray(e, t) {
      var s = t || [];return null != e && (a(Object(e)) ? Ce.merge(s, 'string' === typeof e ? [e] : e) : ge.call(s, e)), s;
    }, inArray: function inArray(e, t, s) {
      return null == t ? -1 : me.call(t, e, s);
    }, merge: function merge(e, t) {
      for (var s = +t.length, n = 0, a = e.length; n < s; n++) {
        e[a++] = t[n];
      }return e.length = a, e;
    }, grep: function grep(e, t, s) {
      for (var n = [], a = 0, o = e.length, r; a < o; a++) {
        r = !t(e[a], a), r !== !s && n.push(e[a]);
      }return n;
    }, map: function map(e, t, s) {
      var n = 0,
          o = [],
          r,
          l;if (a(e)) for (r = e.length; n < r; n++) {
        l = t(e[n], n, s), null != l && o.push(l);
      } else for (n in e) {
        l = t(e[n], n, s), null != l && o.push(l);
      }return pe.apply([], o);
    }, guid: 1, support: ve }), 'function' === typeof Symbol && (Ce.fn[Symbol.iterator] = ie[Symbol.iterator]), Ce.each(['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error', 'Symbol'], function (e, t) {
    he['[object ' + t + ']'] = t.toLowerCase();
  });var Te = function (e) {
    function t(e, t, s, n) {
      var a = t && t.ownerDocument,
          o = t ? t.nodeType : 9,
          r,
          l,
          i,
          d,
          c,
          u,
          g;if (s = s || [], 'string' !== typeof e || !e || 1 !== o && 9 !== o && 11 !== o) return s;if (!n && ((t ? t.ownerDocument || t : _) !== be && fe(t), t = t || be, ve)) {
        if (11 !== o && (c = Q.exec(e))) if (!(r = c[1])) {
          if (c[2]) return U.apply(s, t.getElementsByTagName(e)), s;if ((r = c[3]) && ie.getElementsByClassName && t.getElementsByClassName) return U.apply(s, t.getElementsByClassName(r)), s;
        } else if (9 === o) {
          if (!(i = t.getElementById(r))) return s;if (i.id === r) return s.push(i), s;
        } else if (a && (i = a.getElementById(r)) && ke(t, i) && i.id === r) return s.push(i), s;if (ie.qsa && !w[e + ' '] && (!Ie || !Ie.test(e))) {
          if (1 !== o) a = t, g = e;else if ('object' !== t.nodeName.toLowerCase()) {
            for ((d = t.getAttribute('id')) ? d = d.replace(se, ne) : t.setAttribute('id', d = S), u = ue(e), l = u.length; l--;) {
              u[l] = '#' + d + ' ' + m(u[l]);
            }g = u.join(','), a = Z.test(e) && p(t.parentNode) || t;
          }if (g) try {
            return U.apply(s, a.querySelectorAll(g)), s;
          } catch (e) {} finally {
            d === S && t.removeAttribute('id');
          }
        }
      }return ge(e.replace(B, '$1'), t, s, n);
    }function s() {
      function e(s, n) {
        return t.push(s + ' ') > de.cacheLength && delete e[t.shift()], e[s + ' '] = n;
      }var t = [];return e;
    }function n(e) {
      return e[S] = !0, e;
    }function a(e) {
      var t = be.createElement('fieldset');try {
        return !!e(t);
      } catch (t) {
        return !1;
      } finally {
        t.parentNode && t.parentNode.removeChild(t), t = null;
      }
    }function o(e, t) {
      for (var s = e.split('|'), n = s.length; n--;) {
        de.attrHandle[s[n]] = t;
      }
    }function r(e, t) {
      var s = t && e,
          n = s && 1 === e.nodeType && 1 === t.nodeType && e.sourceIndex - t.sourceIndex;if (n) return n;if (s) for (; s = s.nextSibling;) {
        if (s === t) return -1;
      }return e ? 1 : -1;
    }function l(e) {
      return function (t) {
        var s = t.nodeName.toLowerCase();return 'input' === s && t.type === e;
      };
    }function d(e) {
      return function (t) {
        var s = t.nodeName.toLowerCase();return ('input' === s || 'button' === s) && t.type === e;
      };
    }function c(e) {
      return function (t) {
        return 'form' in t ? t.parentNode && !1 === t.disabled ? 'label' in t ? 'label' in t.parentNode ? t.parentNode.disabled === e : t.disabled === e : t.isDisabled === e || t.isDisabled !== !e && oe(t) === e : t.disabled === e : !!('label' in t) && t.disabled === e;
      };
    }function u(e) {
      return n(function (t) {
        return t = +t, n(function (s, n) {
          for (var a = e([], s.length, t), o = a.length, r; o--;) {
            s[r = a[o]] && (s[r] = !(n[r] = s[r]));
          }
        });
      });
    }function p(e) {
      return e && 'undefined' !== typeof e.getElementsByTagName && e;
    }function g() {}function m(e) {
      for (var t = 0, s = e.length, n = ''; t < s; t++) {
        n += e[t].value;
      }return n;
    }function h(e, t, s) {
      var n = t.dir,
          a = t.next,
          o = a || n,
          r = s && 'parentNode' === o,
          l = C++;return t.first ? function (t, s, a) {
        for (; t = t[n];) {
          if (1 === t.nodeType || r) return e(t, s, a);
        }return !1;
      } : function (t, s, i) {
        var d = [k, l],
            c,
            u,
            p;if (i) {
          for (; t = t[n];) {
            if ((1 === t.nodeType || r) && e(t, s, i)) return !0;
          }
        } else for (; t = t[n];) {
          if (1 === t.nodeType || r) if (p = t[S] || (t[S] = {}), u = p[t.uniqueID] || (p[t.uniqueID] = {}), a && a === t.nodeName.toLowerCase()) t = t[n] || t;else {
            if ((c = u[o]) && c[0] === k && c[1] === l) return d[2] = c[2];if (u[o] = d, d[2] = e(t, s, i)) return !0;
          }
        }return !1;
      };
    }function y(e) {
      return 1 < e.length ? function (t, s, n) {
        for (var a = e.length; a--;) {
          if (!e[a](t, s, n)) return !1;
        }return !0;
      } : e[0];
    }function f(e, s, n) {
      for (var a = 0, o = s.length; a < o; a++) {
        t(e, s[a], n);
      }return n;
    }function b(e, t, s, n, a) {
      for (var o = [], r = 0, l = e.length, i; r < l; r++) {
        (i = e[r]) && (!s || s(i, n, a)) && (o.push(i), null != t && t.push(r));
      }return o;
    }function x(e, t, s, a, o, r) {
      return a && !a[S] && (a = x(a)), o && !o[S] && (o = x(o, r)), n(function (n, r, l, d) {
        var c = [],
            u = [],
            p = r.length,
            g = n || f(t || '*', l.nodeType ? [l] : l, []),
            m = e && (n || !t) ? b(g, c, e, l, d) : g,
            h = s ? o || (n ? e : p || a) ? [] : r : m,
            y,
            x,
            i;if (s && s(m, h, l, d), a) for (y = b(h, u), a(y, [], l, d), x = y.length; x--;) {
          (i = y[x]) && (h[u[x]] = !(m[u[x]] = i));
        }if (!n) h = b(h === r ? h.splice(p, h.length) : h), o ? o(null, r, h, d) : U.apply(r, h);else if (o || e) {
          if (o) {
            for (y = [], x = h.length; x--;) {
              (i = h[x]) && y.push(m[x] = i);
            }o(null, h = [], y, d);
          }for (x = h.length; x--;) {
            (i = h[x]) && -1 < (y = o ? D(n, i) : c[x]) && (n[y] = !(r[y] = i));
          }
        }
      });
    }function v(e) {
      for (var t = e.length, s = de.relative[e[0].type], n = s || de.relative[' '], a = s ? 1 : 0, o = h(function (e) {
        return e === i;
      }, n, !0), r = h(function (e) {
        return -1 < D(i, e);
      }, n, !0), l = [function (e, t, n) {
        var a = !s && (n || t !== me) || ((i = t).nodeType ? o(e, t, n) : r(e, t, n));return i = null, a;
      }], i, d, c; a < t; a++) {
        if (d = de.relative[e[a].type]) l = [h(y(l), d)];else {
          if (d = de.filter[e[a].type].apply(null, e[a].matches), d[S]) {
            for (c = ++a; c < t && !de.relative[e[c].type]; c++) {}return x(1 < a && y(l), 1 < a && m(e.slice(0, a - 1).concat({ value: ' ' === e[a - 2].type ? '*' : '' })).replace(B, '$1'), d, a < c && v(e.slice(a, c)), c < t && v(e = e.slice(c)), c < t && m(e));
          }l.push(d);
        }
      }return y(l);
    }function I(e, s) {
      var a = 0 < s.length,
          o = 0 < e.length,
          r = function r(n, _r, l, d, c) {
        var u = 0,
            p = '0',
            i = n && [],
            g = [],
            m = me,
            h = n || o && de.find.TAG('*', c),
            y = k += null == m ? 1 : Math.random() || 0.1,
            f = h.length,
            x,
            v,
            I;for (c && (me = _r === be || _r || c); p !== f && null != (x = h[p]); p++) {
          if (o && x) {
            for (v = 0, _r || x.ownerDocument === be || (fe(x), l = !ve); I = e[v++];) {
              if (I(x, _r || be, l)) {
                d.push(x);break;
              }
            }c && (k = y);
          }a && ((x = !I && x) && u--, n && i.push(x));
        }if (u += p, a && p !== u) {
          for (v = 0; I = s[v++];) {
            I(i, g, _r, l);
          }if (n) {
            if (0 < u) for (; p--;) {
              i[p] || g[p] || (g[p] = P.call(d));
            }g = b(g);
          }U.apply(d, g), c && !n && 0 < g.length && 1 < u + s.length && t.uniqueSort(d);
        }return c && (k = y, me = m), i;
      };return a ? n(r) : r;
    }var S = 'sizzle' + 1 * new Date(),
        _ = e.document,
        k = 0,
        C = 0,
        M = s(),
        T = s(),
        w = s(),
        N = function N(e, t) {
      return e === t && (ye = !0), 0;
    },
        L = {}.hasOwnProperty,
        E = [],
        P = E.pop,
        A = E.push,
        U = E.push,
        R = E.slice,
        D = function D(e, t) {
      for (var s = 0, n = e.length; s < n; s++) {
        if (e[s] === t) return s;
      }return -1;
    },
        j = 'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped',
        O = '[\\x20\\t\\r\\n\\f]',
        V = '(?:\\\\.|[\\w-]|[^\\0-\\xa0])+',
        F = /[\x20\t\r\n\f]+/g,
        B = /^[\x20\t\r\n\f]+|((?:^|[^\\])(?:\\.)*)[\x20\t\r\n\f]+$/g,
        H = /^[\x20\t\r\n\f]*,[\x20\t\r\n\f]*/,
        q = /^[\x20\t\r\n\f]*([>+~]|[\x20\t\r\n\f])[\x20\t\r\n\f]*/,
        W = /=[\x20\t\r\n\f]*([^\]'"]*?)[\x20\t\r\n\f]*\]/g,
        G = /:((?:\\.|[\w-]|[^\0-\xa0])+)(?:\((('((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)")|((?:\\.|[^\\()[\]]|\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\0-\xa0])+)(?:[\x20\t\r\n\f]*([*^$|!~]?=)[\x20\t\r\n\f]*(?:'((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)"|((?:\\.|[\w-]|[^\0-\xa0])+))|)[\x20\t\r\n\f]*\])*)|.*)\)|)/,
        X = /^(?:\\.|[\w-]|[^\0-\xa0])+$/,
        K = { ID: /^#((?:\\.|[\w-]|[^\0-\xa0])+)/, CLASS: /^\.((?:\\.|[\w-]|[^\0-\xa0])+)/, TAG: /^((?:\\.|[\w-]|[^\0-\xa0])+|[*])/, ATTR: /^\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\0-\xa0])+)(?:[\x20\t\r\n\f]*([*^$|!~]?=)[\x20\t\r\n\f]*(?:'((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)"|((?:\\.|[\w-]|[^\0-\xa0])+))|)[\x20\t\r\n\f]*\]/, PSEUDO: /^:((?:\\.|[\w-]|[^\0-\xa0])+)(?:\((('((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)")|((?:\\.|[^\\()[\]]|\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\0-\xa0])+)(?:[\x20\t\r\n\f]*([*^$|!~]?=)[\x20\t\r\n\f]*(?:'((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)"|((?:\\.|[\w-]|[^\0-\xa0])+))|)[\x20\t\r\n\f]*\])*)|.*)\)|)/, CHILD: /^:(only|first|last|nth|nth-last)-(child|of-type)(?:\([\x20\t\r\n\f]*(even|odd|(([+-]|)(\d*)n|)[\x20\t\r\n\f]*(?:([+-]|)[\x20\t\r\n\f]*(\d+)|))[\x20\t\r\n\f]*\)|)/i, bool: /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i, needsContext: /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i },
        z = /^(?:input|select|textarea|button)$/i,
        J = /^h\d$/i,
        Y = /^[^{]+\{\s*\[native \w/,
        Q = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
        Z = /[+~]/,
        ee = /\\([\da-f]{1,6}[\x20\t\r\n\f]?|([\x20\t\r\n\f])|.)/ig,
        te = function te(e, t, s) {
      var n = '0x' + t - 65536;return n !== n || s ? t : 0 > n ? le(n + 65536) : le(55296 | n >> 10, 56320 | 1023 & n);
    },
        se = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
        ne = function ne(e, t) {
      return t ? '\0' === e ? "\uFFFD" : e.slice(0, -1) + '\\' + e.charCodeAt(e.length - 1).toString(16) + ' ' : '\\' + e;
    },
        ae = function ae() {
      fe();
    },
        oe = h(function (e) {
      return !0 === e.disabled && ('form' in e || 'label' in e);
    }, { dir: 'parentNode', next: 'legend' }),
        re,
        ie,
        de,
        ce,
        i,
        ue,
        pe,
        ge,
        me,
        he,
        ye,
        fe,
        be,
        xe,
        ve,
        Ie,
        Se,
        _e,
        ke;try {
      U.apply(E = R.call(_.childNodes), _.childNodes), E[_.childNodes.length].nodeType;
    } catch (t) {
      U = { apply: E.length ? function (e, t) {
          A.apply(e, R.call(t));
        } : function (e, t) {
          for (var s = e.length, n = 0; e[s++] = t[n++];) {}e.length = s - 1;
        } };
    }for (re in ie = t.support = {}, i = t.isXML = function (e) {
      var t = e && (e.ownerDocument || e).documentElement;return !!t && 'HTML' !== t.nodeName;
    }, fe = t.setDocument = function (e) {
      var t = e ? e.ownerDocument || e : _,
          s,
          n;return t !== be && 9 === t.nodeType && t.documentElement ? (be = t, xe = be.documentElement, ve = !i(be), _ !== be && (n = be.defaultView) && n.top !== n && (n.addEventListener ? n.addEventListener('unload', ae, !1) : n.attachEvent && n.attachEvent('onunload', ae)), ie.attributes = a(function (e) {
        return e.className = 'i', !e.getAttribute('className');
      }), ie.getElementsByTagName = a(function (e) {
        return e.appendChild(be.createComment('')), !e.getElementsByTagName('*').length;
      }), ie.getElementsByClassName = Y.test(be.getElementsByClassName), ie.getById = a(function (e) {
        return xe.appendChild(e).id = S, !be.getElementsByName || !be.getElementsByName(S).length;
      }), ie.getById ? (de.filter.ID = function (e) {
        var t = e.replace(ee, te);return function (e) {
          return e.getAttribute('id') === t;
        };
      }, de.find.ID = function (e, t) {
        if ('undefined' !== typeof t.getElementById && ve) {
          var s = t.getElementById(e);return s ? [s] : [];
        }
      }) : (de.filter.ID = function (e) {
        var t = e.replace(ee, te);return function (e) {
          var s = 'undefined' !== typeof e.getAttributeNode && e.getAttributeNode('id');return s && s.value === t;
        };
      }, de.find.ID = function (e, t) {
        if ('undefined' !== typeof t.getElementById && ve) {
          var s = t.getElementById(e),
              n,
              a,
              o;if (s) {
            if (n = s.getAttributeNode('id'), n && n.value === e) return [s];for (o = t.getElementsByName(e), a = 0; s = o[a++];) {
              if (n = s.getAttributeNode('id'), n && n.value === e) return [s];
            }
          }return [];
        }
      }), de.find.TAG = ie.getElementsByTagName ? function (e, t) {
        return 'undefined' === typeof t.getElementsByTagName ? ie.qsa ? t.querySelectorAll(e) : void 0 : t.getElementsByTagName(e);
      } : function (e, t) {
        var s = [],
            n = 0,
            a = t.getElementsByTagName(e),
            o;if ('*' === e) {
          for (; o = a[n++];) {
            1 === o.nodeType && s.push(o);
          }return s;
        }return a;
      }, de.find.CLASS = ie.getElementsByClassName && function (e, t) {
        if ('undefined' !== typeof t.getElementsByClassName && ve) return t.getElementsByClassName(e);
      }, Se = [], Ie = [], (ie.qsa = Y.test(be.querySelectorAll)) && (a(function (e) {
        xe.appendChild(e).innerHTML = '<a id=\'' + S + '\'></a><select id=\'' + S + '-\r\\\' msallowcapture=\'\'><option selected=\'\'></option></select>', e.querySelectorAll('[msallowcapture^=\'\']').length && Ie.push('[*^$]=' + O + '*(?:\'\'|"")'), e.querySelectorAll('[selected]').length || Ie.push('\\[' + O + '*(?:value|' + j + ')'), e.querySelectorAll('[id~=' + S + '-]').length || Ie.push('~='), e.querySelectorAll(':checked').length || Ie.push(':checked'), e.querySelectorAll('a#' + S + '+*').length || Ie.push('.#.+[+~]');
      }), a(function (e) {
        e.innerHTML = '<a href=\'\' disabled=\'disabled\'></a><select disabled=\'disabled\'><option/></select>';var t = be.createElement('input');t.setAttribute('type', 'hidden'), e.appendChild(t).setAttribute('name', 'D'), e.querySelectorAll('[name=d]').length && Ie.push('name' + O + '*[*^$|!~]?='), 2 !== e.querySelectorAll(':enabled').length && Ie.push(':enabled', ':disabled'), xe.appendChild(e).disabled = !0, 2 !== e.querySelectorAll(':disabled').length && Ie.push(':enabled', ':disabled'), e.querySelectorAll('*,:x'), Ie.push(',.*:');
      })), (ie.matchesSelector = Y.test(_e = xe.matches || xe.webkitMatchesSelector || xe.mozMatchesSelector || xe.oMatchesSelector || xe.msMatchesSelector)) && a(function (e) {
        ie.disconnectedMatch = _e.call(e, '*'), _e.call(e, '[s!=\'\']:x'), Se.push('!=', ':(' + V + ')(?:\\(((\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|' + ('\\[' + O + '*(' + V + ')(?:' + O + '*([*^$|!~]?=)' + O + '*(?:\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)"|(' + V + '))|)' + O + '*\\]') + ')*)|.*)\\)|)');
      }), Ie = Ie.length && new RegExp(Ie.join('|')), Se = Se.length && new RegExp(Se.join('|')), s = Y.test(xe.compareDocumentPosition), ke = s || Y.test(xe.contains) ? function (e, t) {
        var s = 9 === e.nodeType ? e.documentElement : e,
            n = t && t.parentNode;return e === n || !!(n && 1 === n.nodeType && (s.contains ? s.contains(n) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(n)));
      } : function (e, t) {
        if (t) for (; t = t.parentNode;) {
          if (t === e) return !0;
        }return !1;
      }, N = s ? function (e, t) {
        if (e === t) return ye = !0, 0;var s = !e.compareDocumentPosition - !t.compareDocumentPosition;return s ? s : (s = (e.ownerDocument || e) === (t.ownerDocument || t) ? e.compareDocumentPosition(t) : 1, 1 & s || !ie.sortDetached && t.compareDocumentPosition(e) === s ? e === be || e.ownerDocument === _ && ke(_, e) ? -1 : t === be || t.ownerDocument === _ && ke(_, t) ? 1 : he ? D(he, e) - D(he, t) : 0 : 4 & s ? -1 : 1);
      } : function (e, t) {
        if (e === t) return ye = !0, 0;var s = 0,
            n = e.parentNode,
            a = t.parentNode,
            o = [e],
            l = [t],
            i;if (!n || !a) return e === be ? -1 : t === be ? 1 : n ? -1 : a ? 1 : he ? D(he, e) - D(he, t) : 0;if (n === a) return r(e, t);for (i = e; i = i.parentNode;) {
          o.unshift(i);
        }for (i = t; i = i.parentNode;) {
          l.unshift(i);
        }for (; o[s] === l[s];) {
          s++;
        }return s ? r(o[s], l[s]) : o[s] === _ ? -1 : l[s] === _ ? 1 : 0;
      }, be) : be;
    }, t.matches = function (e, s) {
      return t(e, null, null, s);
    }, t.matchesSelector = function (e, s) {
      if ((e.ownerDocument || e) !== be && fe(e), s = s.replace(W, '=\'$1\']'), ie.matchesSelector && ve && !w[s + ' '] && (!Se || !Se.test(s)) && (!Ie || !Ie.test(s))) try {
        var n = _e.call(e, s);if (n || ie.disconnectedMatch || e.document && 11 !== e.document.nodeType) return n;
      } catch (t) {}return 0 < t(s, be, null, [e]).length;
    }, t.contains = function (e, t) {
      return (e.ownerDocument || e) !== be && fe(e), ke(e, t);
    }, t.attr = function (e, t) {
      (e.ownerDocument || e) !== be && fe(e);var s = de.attrHandle[t.toLowerCase()],
          n = s && L.call(de.attrHandle, t.toLowerCase()) ? s(e, t, !ve) : void 0;return void 0 === n ? ie.attributes || !ve ? e.getAttribute(t) : (n = e.getAttributeNode(t)) && n.specified ? n.value : null : n;
    }, t.escape = function (e) {
      return (e + '').replace(se, ne);
    }, t.error = function (e) {
      throw new Error('Syntax error, unrecognized expression: ' + e);
    }, t.uniqueSort = function (e) {
      var t = [],
          s = 0,
          n = 0,
          a;if (ye = !ie.detectDuplicates, he = !ie.sortStable && e.slice(0), e.sort(N), ye) {
        for (; a = e[n++];) {
          a === e[n] && (s = t.push(n));
        }for (; s--;) {
          e.splice(t[s], 1);
        }
      }return he = null, e;
    }, ce = t.getText = function (e) {
      var t = '',
          s = 0,
          n = e.nodeType,
          a;if (!n) for (; a = e[s++];) {
        t += ce(a);
      } else if (1 === n || 9 === n || 11 === n) {
        if ('string' === typeof e.textContent) return e.textContent;for (e = e.firstChild; e; e = e.nextSibling) {
          t += ce(e);
        }
      } else if (3 === n || 4 === n) return e.nodeValue;return t;
    }, de = t.selectors = { cacheLength: 50, createPseudo: n, match: K, attrHandle: {}, find: {}, relative: { ">": { dir: 'parentNode', first: !0 }, " ": { dir: 'parentNode' }, "+": { dir: 'previousSibling', first: !0 }, "~": { dir: 'previousSibling' } }, preFilter: { ATTR: function ATTR(e) {
          return e[1] = e[1].replace(ee, te), e[3] = (e[3] || e[4] || e[5] || '').replace(ee, te), '~=' === e[2] && (e[3] = ' ' + e[3] + ' '), e.slice(0, 4);
        }, CHILD: function CHILD(e) {
          return e[1] = e[1].toLowerCase(), 'nth' === e[1].slice(0, 3) ? (!e[3] && t.error(e[0]), e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * ('even' === e[3] || 'odd' === e[3])), e[5] = +(e[7] + e[8] || 'odd' === e[3])) : e[3] && t.error(e[0]), e;
        }, PSEUDO: function PSEUDO(e) {
          var t = !e[6] && e[2],
              s;return K.CHILD.test(e[0]) ? null : (e[3] ? e[2] = e[4] || e[5] || '' : t && G.test(t) && (s = ue(t, !0)) && (s = t.indexOf(')', t.length - s) - t.length) && (e[0] = e[0].slice(0, s), e[2] = t.slice(0, s)), e.slice(0, 3));
        } }, filter: { TAG: function TAG(e) {
          var t = e.replace(ee, te).toLowerCase();return '*' === e ? function () {
            return !0;
          } : function (e) {
            return e.nodeName && e.nodeName.toLowerCase() === t;
          };
        }, CLASS: function CLASS(e) {
          var t = M[e + ' '];return t || (t = new RegExp('(^|' + O + ')' + e + '(' + O + '|$)')) && M(e, function (e) {
            return t.test('string' === typeof e.className && e.className || 'undefined' !== typeof e.getAttribute && e.getAttribute('class') || '');
          });
        }, ATTR: function ATTR(e, s, n) {
          return function (a) {
            var o = t.attr(a, e);return null == o ? '!=' === s : !s || (o += '', '=' === s ? o === n : '!=' === s ? o !== n : '^=' === s ? n && 0 === o.indexOf(n) : '*=' === s ? n && -1 < o.indexOf(n) : '$=' === s ? n && o.slice(-n.length) === n : '~=' === s ? -1 < (' ' + o.replace(F, ' ') + ' ').indexOf(n) : '|=' === s && (o === n || o.slice(0, n.length + 1) === n + '-'));
          };
        }, CHILD: function CHILD(e, t, s, n, a) {
          var o = 'nth' !== e.slice(0, 3),
              r = 'last' !== e.slice(-4),
              l = 'of-type' === t;return 1 === n && 0 === a ? function (e) {
            return !!e.parentNode;
          } : function (t, s, i) {
            var d = o === r ? 'previousSibling' : 'nextSibling',
                c = t.parentNode,
                u = l && t.nodeName.toLowerCase(),
                p = !i && !l,
                g = !1,
                m,
                h,
                y,
                f,
                b,
                x;if (c) {
              if (o) {
                for (; d;) {
                  for (f = t; f = f[d];) {
                    if (l ? f.nodeName.toLowerCase() === u : 1 === f.nodeType) return !1;
                  }x = d = 'only' === e && !x && 'nextSibling';
                }return !0;
              }if (x = [r ? c.firstChild : c.lastChild], r && p) {
                for (f = c, y = f[S] || (f[S] = {}), h = y[f.uniqueID] || (y[f.uniqueID] = {}), m = h[e] || [], b = m[0] === k && m[1], g = b && m[2], f = b && c.childNodes[b]; f = ++b && f && f[d] || (g = b = 0) || x.pop();) {
                  if (1 === f.nodeType && ++g && f === t) {
                    h[e] = [k, b, g];break;
                  }
                }
              } else if (p && (f = t, y = f[S] || (f[S] = {}), h = y[f.uniqueID] || (y[f.uniqueID] = {}), m = h[e] || [], b = m[0] === k && m[1], g = b), !1 === g) for (; (f = ++b && f && f[d] || (g = b = 0) || x.pop()) && !((l ? f.nodeName.toLowerCase() === u : 1 === f.nodeType) && ++g && (p && (y = f[S] || (f[S] = {}), h = y[f.uniqueID] || (y[f.uniqueID] = {}), h[e] = [k, g]), f === t));) {}return g -= a, g === n || 0 === g % n && 0 <= g / n;
            }
          };
        }, PSEUDO: function PSEUDO(e, s) {
          var a = de.pseudos[e] || de.setFilters[e.toLowerCase()] || t.error('unsupported pseudo: ' + e),
              o;return a[S] ? a(s) : 1 < a.length ? (o = [e, e, '', s], de.setFilters.hasOwnProperty(e.toLowerCase()) ? n(function (e, t) {
            for (var n = a(e, s), o = n.length, r; o--;) {
              r = D(e, n[o]), e[r] = !(t[r] = n[o]);
            }
          }) : function (e) {
            return a(e, 0, o);
          }) : a;
        } }, pseudos: { not: n(function (e) {
          var t = [],
              s = [],
              a = pe(e.replace(B, '$1'));return a[S] ? n(function (e, t, s, n) {
            for (var o = a(e, null, n, []), r = e.length, l; r--;) {
              (l = o[r]) && (e[r] = !(t[r] = l));
            }
          }) : function (e, n, o) {
            return t[0] = e, a(t, null, o, s), t[0] = null, !s.pop();
          };
        }), has: n(function (e) {
          return function (s) {
            return 0 < t(e, s).length;
          };
        }), contains: n(function (e) {
          return e = e.replace(ee, te), function (t) {
            return -1 < (t.textContent || t.innerText || ce(t)).indexOf(e);
          };
        }), lang: n(function (e) {
          return X.test(e || '') || t.error('unsupported lang: ' + e), e = e.replace(ee, te).toLowerCase(), function (t) {
            var s;do {
              if (s = ve ? t.lang : t.getAttribute('xml:lang') || t.getAttribute('lang')) return s = s.toLowerCase(), s === e || 0 === s.indexOf(e + '-');
            } while ((t = t.parentNode) && 1 === t.nodeType);return !1;
          };
        }), target: function target(t) {
          var s = e.location && e.location.hash;return s && s.slice(1) === t.id;
        }, root: function root(e) {
          return e === xe;
        }, focus: function focus(e) {
          return e === be.activeElement && (!be.hasFocus || be.hasFocus()) && !!(e.type || e.href || ~e.tabIndex);
        }, enabled: c(!1), disabled: c(!0), checked: function checked(e) {
          var t = e.nodeName.toLowerCase();return 'input' === t && !!e.checked || 'option' === t && !!e.selected;
        }, selected: function selected(e) {
          return e.parentNode && e.parentNode.selectedIndex, !0 === e.selected;
        }, empty: function empty(e) {
          for (e = e.firstChild; e; e = e.nextSibling) {
            if (6 > e.nodeType) return !1;
          }return !0;
        }, parent: function parent(e) {
          return !de.pseudos.empty(e);
        }, header: function header(e) {
          return J.test(e.nodeName);
        }, input: function input(e) {
          return z.test(e.nodeName);
        }, button: function button(e) {
          var t = e.nodeName.toLowerCase();return 'input' === t && 'button' === e.type || 'button' === t;
        }, text: function text(e) {
          var t;return 'input' === e.nodeName.toLowerCase() && 'text' === e.type && (null == (t = e.getAttribute('type')) || 'text' === t.toLowerCase());
        }, first: u(function () {
          return [0];
        }), last: u(function (e, t) {
          return [t - 1];
        }), eq: u(function (e, t, s) {
          return [0 > s ? s + t : s];
        }), even: u(function (e, t) {
          for (var s = 0; s < t; s += 2) {
            e.push(s);
          }return e;
        }), odd: u(function (e, t) {
          for (var s = 1; s < t; s += 2) {
            e.push(s);
          }return e;
        }), lt: u(function (e, t, s) {
          for (var n = 0 > s ? s + t : s; 0 <= --n;) {
            e.push(n);
          }return e;
        }), gt: u(function (e, t, s) {
          for (var n = 0 > s ? s + t : s; ++n < t;) {
            e.push(n);
          }return e;
        }) } }, de.pseudos.nth = de.pseudos.eq, { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 }) {
      de.pseudos[re] = l(re);
    }for (re in { submit: !0, reset: !0 }) {
      de.pseudos[re] = d(re);
    }return g.prototype = de.filters = de.pseudos, de.setFilters = new g(), ue = t.tokenize = function (e, s) {
      var n = T[e + ' '],
          a,
          o,
          r,
          l,
          i,
          d,
          c;if (n) return s ? 0 : n.slice(0);for (i = e, d = [], c = de.preFilter; i;) {
        for (l in (!a || (o = H.exec(i))) && (o && (i = i.slice(o[0].length) || i), d.push(r = [])), a = !1, (o = q.exec(i)) && (a = o.shift(), r.push({ value: a, type: o[0].replace(B, ' ') }), i = i.slice(a.length)), de.filter) {
          (o = K[l].exec(i)) && (!c[l] || (o = c[l](o))) && (a = o.shift(), r.push({ value: a, type: l, matches: o }), i = i.slice(a.length));
        }if (!a) break;
      }return s ? i.length : i ? t.error(e) : T(e, d).slice(0);
    }, pe = t.compile = function (e, t) {
      var s = [],
          n = [],
          a = w[e + ' '],
          o;if (!a) {
        for (t || (t = ue(e)), o = t.length; o--;) {
          a = v(t[o]), a[S] ? s.push(a) : n.push(a);
        }a = w(e, I(n, s)), a.selector = e;
      }return a;
    }, ge = t.select = function (e, t, s, n) {
      var a = 'function' === typeof e && e,
          o = !n && ue(e = a.selector || e),
          r,
          l,
          i,
          d,
          c;if (s = s || [], 1 === o.length) {
        if (l = o[0] = o[0].slice(0), 2 < l.length && 'ID' === (i = l[0]).type && 9 === t.nodeType && ve && de.relative[l[1].type]) {
          if (t = (de.find.ID(i.matches[0].replace(ee, te), t) || [])[0], !t) return s;a && (t = t.parentNode), e = e.slice(l.shift().value.length);
        }for (r = K.needsContext.test(e) ? 0 : l.length; r-- && (i = l[r], !de.relative[d = i.type]);) {
          if ((c = de.find[d]) && (n = c(i.matches[0].replace(ee, te), Z.test(l[0].type) && p(t.parentNode) || t))) {
            if (l.splice(r, 1), e = n.length && m(l), !e) return U.apply(s, n), s;break;
          }
        }
      }return (a || pe(e, o))(n, t, !ve, s, !t || Z.test(e) && p(t.parentNode) || t), s;
    }, ie.sortStable = S.split('').sort(N).join('') === S, ie.detectDuplicates = !!ye, fe(), ie.sortDetached = a(function (e) {
      return 1 & e.compareDocumentPosition(be.createElement('fieldset'));
    }), a(function (e) {
      return e.innerHTML = '<a href=\'#\'></a>', '#' === e.firstChild.getAttribute('href');
    }) || o('type|href|height|width', function (e, t, s) {
      if (!s) return e.getAttribute(t, 'type' === t.toLowerCase() ? 1 : 2);
    }), ie.attributes && a(function (e) {
      return e.innerHTML = '<input/>', e.firstChild.setAttribute('value', ''), '' === e.firstChild.getAttribute('value');
    }) || o('value', function (e, t, s) {
      if (!s && 'input' === e.nodeName.toLowerCase()) return e.defaultValue;
    }), a(function (e) {
      return null == e.getAttribute('disabled');
    }) || o(j, function (e, t, s) {
      var n;if (!s) return !0 === e[t] ? t.toLowerCase() : (n = e.getAttributeNode(t)) && n.specified ? n.value : null;
    }), t;
  }(e);Ce.find = Te, Ce.expr = Te.selectors, Ce.expr[':'] = Ce.expr.pseudos, Ce.uniqueSort = Ce.unique = Te.uniqueSort, Ce.text = Te.getText, Ce.isXMLDoc = Te.isXML, Ce.contains = Te.contains, Ce.escapeSelector = Te.escape;var we = function we(e, t, s) {
    for (var n = []; (e = e[t]) && 9 !== e.nodeType;) {
      if (1 === e.nodeType) {
        if (void 0 !== s && Ce(e).is(s)) break;n.push(e);
      }
    }return n;
  },
      Ne = function Ne(e, t) {
    for (var s = []; e; e = e.nextSibling) {
      1 === e.nodeType && e !== t && s.push(e);
    }return s;
  },
      Le = Ce.expr.match.needsContext,
      Ee = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;Ce.filter = function (e, t, s) {
    var n = t[0];return s && (e = ':not(' + e + ')'), 1 === t.length && 1 === n.nodeType ? Ce.find.matchesSelector(n, e) ? [n] : [] : Ce.find.matches(e, Ce.grep(t, function (e) {
      return 1 === e.nodeType;
    }));
  }, Ce.fn.extend({ find: function find(e) {
      var t = this.length,
          s = this,
          n,
          a;if ('string' !== typeof e) return this.pushStack(Ce(e).filter(function () {
        for (n = 0; n < t; n++) {
          if (Ce.contains(s[n], this)) return !0;
        }
      }));for (a = this.pushStack([]), n = 0; n < t; n++) {
        Ce.find(e, s[n], a);
      }return 1 < t ? Ce.uniqueSort(a) : a;
    }, filter: function filter(e) {
      return this.pushStack(r(this, e || [], !1));
    }, not: function not(e) {
      return this.pushStack(r(this, e || [], !0));
    }, is: function is(e) {
      return !!r(this, 'string' === typeof e && Le.test(e) ? Ce(e) : e || [], !1).length;
    } });var Pe = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
      Ae = Ce.fn.init = function (e, t, s) {
    var n, a;if (!e) return this;if (s = s || Ue, 'string' === typeof e) {
      if (n = '<' === e[0] && '>' === e[e.length - 1] && 3 <= e.length ? [null, e, null] : Pe.exec(e), n && (n[1] || !t)) {
        if (n[1]) {
          if (t = t instanceof Ce ? t[0] : t, Ce.merge(this, Ce.parseHTML(n[1], t && t.nodeType ? t.ownerDocument || t : de, !0)), Ee.test(n[1]) && Ce.isPlainObject(t)) for (n in t) {
            Ie(this[n]) ? this[n](t[n]) : this.attr(n, t[n]);
          }return this;
        }return a = de.getElementById(n[2]), a && (this[0] = a, this.length = 1), this;
      }return !t || t.jquery ? (t || s).find(e) : this.constructor(t).find(e);
    }return e.nodeType ? (this[0] = e, this.length = 1, this) : Ie(e) ? void 0 === s.ready ? e(Ce) : s.ready(e) : Ce.makeArray(e, this);
  },
      Ue;Ae.prototype = Ce.fn, Ue = Ce(de);var Re = /^(?:parents|prev(?:Until|All))/,
      De = { children: !0, contents: !0, next: !0, prev: !0 };Ce.fn.extend({ has: function has(e) {
      var t = Ce(e, this),
          s = t.length;return this.filter(function () {
        for (var e = 0; e < s; e++) {
          if (Ce.contains(this, t[e])) return !0;
        }
      });
    }, closest: function closest(e, t) {
      var s = 0,
          n = this.length,
          a = [],
          o = 'string' !== typeof e && Ce(e),
          r;if (!Le.test(e)) for (; s < n; s++) {
        for (r = this[s]; r && r !== t; r = r.parentNode) {
          if (11 > r.nodeType && (o ? -1 < o.index(r) : 1 === r.nodeType && Ce.find.matchesSelector(r, e))) {
            a.push(r);break;
          }
        }
      }return this.pushStack(1 < a.length ? Ce.uniqueSort(a) : a);
    }, index: function index(e) {
      return e ? 'string' === typeof e ? me.call(Ce(e), this[0]) : me.call(this, e.jquery ? e[0] : e) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
    }, add: function add(e, t) {
      return this.pushStack(Ce.uniqueSort(Ce.merge(this.get(), Ce(e, t))));
    }, addBack: function addBack(e) {
      return this.add(null == e ? this.prevObject : this.prevObject.filter(e));
    } }), Ce.each({ parent: function parent(e) {
      var t = e.parentNode;return t && 11 !== t.nodeType ? t : null;
    }, parents: function parents(e) {
      return we(e, 'parentNode');
    }, parentsUntil: function parentsUntil(e, t, s) {
      return we(e, 'parentNode', s);
    }, next: function next(e) {
      return l(e, 'nextSibling');
    }, prev: function prev(e) {
      return l(e, 'previousSibling');
    }, nextAll: function nextAll(e) {
      return we(e, 'nextSibling');
    }, prevAll: function prevAll(e) {
      return we(e, 'previousSibling');
    }, nextUntil: function nextUntil(e, t, s) {
      return we(e, 'nextSibling', s);
    }, prevUntil: function prevUntil(e, t, s) {
      return we(e, 'previousSibling', s);
    }, siblings: function siblings(e) {
      return Ne((e.parentNode || {}).firstChild, e);
    }, children: function children(e) {
      return Ne(e.firstChild);
    }, contents: function contents(e) {
      return o(e, 'iframe') ? e.contentDocument : (o(e, 'template') && (e = e.content || e), Ce.merge([], e.childNodes));
    } }, function (e, t) {
    Ce.fn[e] = function (s, n) {
      var a = Ce.map(this, t, s);return 'Until' !== e.slice(-5) && (n = s), n && 'string' === typeof n && (a = Ce.filter(n, a)), 1 < this.length && (!De[e] && Ce.uniqueSort(a), Re.test(e) && a.reverse()), this.pushStack(a);
    };
  });var je = /[^\x20\t\r\n\f]+/g;Ce.Callbacks = function (e) {
    e = 'string' === typeof e ? i(e) : Ce.extend({}, e);var t = [],
        s = [],
        a = -1,
        o = function o() {
      for (u = u || e.once, c = l = !0; s.length; a = -1) {
        for (d = s.shift(); ++a < t.length;) {
          !1 === t[a].apply(d[0], d[1]) && e.stopOnFalse && (a = t.length, d = !1);
        }
      }e.memory || (d = !1), l = !1, u && (d ? t = [] : t = '');
    },
        r = { add: function add() {
        return t && (d && !l && (a = t.length - 1, s.push(d)), function s(a) {
          Ce.each(a, function (a, o) {
            Ie(o) ? (!e.unique || !r.has(o)) && t.push(o) : o && o.length && 'string' !== n(o) && s(o);
          });
        }(arguments), d && !l && o()), this;
      }, remove: function remove() {
        return Ce.each(arguments, function (e, s) {
          for (var n; -1 < (n = Ce.inArray(s, t, n));) {
            t.splice(n, 1), n <= a && a--;
          }
        }), this;
      }, has: function has(e) {
        return e ? -1 < Ce.inArray(e, t) : 0 < t.length;
      }, empty: function empty() {
        return t && (t = []), this;
      }, disable: function disable() {
        return u = s = [], t = d = '', this;
      }, disabled: function disabled() {
        return !t;
      }, lock: function lock() {
        return u = s = [], d || l || (t = d = ''), this;
      }, locked: function locked() {
        return !!u;
      }, fireWith: function fireWith(e, t) {
        return u || (t = t || [], t = [e, t.slice ? t.slice() : t], s.push(t), !l && o()), this;
      }, fire: function fire() {
        return r.fireWith(this, arguments), this;
      }, fired: function fired() {
        return !!c;
      } },
        l,
        d,
        c,
        u;return r;
  }, Ce.extend({ Deferred: function Deferred(t) {
      var s = [['notify', 'progress', Ce.Callbacks('memory'), Ce.Callbacks('memory'), 2], ['resolve', 'done', Ce.Callbacks('once memory'), Ce.Callbacks('once memory'), 0, 'resolved'], ['reject', 'fail', Ce.Callbacks('once memory'), Ce.Callbacks('once memory'), 1, 'rejected']],
          n = 'pending',
          a = { state: function state() {
          return n;
        }, always: function always() {
          return o.done(arguments).fail(arguments), this;
        }, "catch": function _catch(e) {
          return a.then(null, e);
        }, pipe: function pipe() {
          var e = arguments;return Ce.Deferred(function (t) {
            Ce.each(s, function (s, n) {
              var a = Ie(e[n[4]]) && e[n[4]];o[n[1]](function () {
                var e = a && a.apply(this, arguments);e && Ie(e.promise) ? e.promise().progress(t.notify).done(t.resolve).fail(t.reject) : t[n[0] + 'With'](this, a ? [e] : arguments);
              });
            }), e = null;
          }).promise();
        }, then: function then(t, n, a) {
          function o(t, s, n, a) {
            return function () {
              var l = this,
                  i = arguments,
                  u = function u() {
                var e, u;if (!(t < r)) {
                  if (e = n.apply(l, i), e === s.promise()) throw new TypeError('Thenable self-resolution');u = e && ('object' === ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) || 'function' === typeof e) && e.then, Ie(u) ? a ? u.call(e, o(r, s, d, a), o(r, s, c, a)) : (r++, u.call(e, o(r, s, d, a), o(r, s, c, a), o(r, s, d, s.notifyWith))) : (n !== d && (l = void 0, i = [e]), (a || s.resolveWith)(l, i));
                }
              },
                  p = a ? u : function () {
                try {
                  u();
                } catch (a) {
                  Ce.Deferred.exceptionHook && Ce.Deferred.exceptionHook(a, p.stackTrace), t + 1 >= r && (n !== c && (l = void 0, i = [a]), s.rejectWith(l, i));
                }
              };t ? p() : (Ce.Deferred.getStackHook && (p.stackTrace = Ce.Deferred.getStackHook()), e.setTimeout(p));
            };
          }var r = 0;return Ce.Deferred(function (e) {
            s[0][3].add(o(0, e, Ie(a) ? a : d, e.notifyWith)), s[1][3].add(o(0, e, Ie(t) ? t : d)), s[2][3].add(o(0, e, Ie(n) ? n : c));
          }).promise();
        }, promise: function promise(e) {
          return null == e ? a : Ce.extend(e, a);
        } },
          o = {};return Ce.each(s, function (e, t) {
        var r = t[2],
            l = t[5];a[t[1]] = r.add, l && r.add(function () {
          n = l;
        }, s[3 - e][2].disable, s[3 - e][3].disable, s[0][2].lock, s[0][3].lock), r.add(t[3].fire), o[t[0]] = function () {
          return o[t[0] + 'With'](this === o ? void 0 : this, arguments), this;
        }, o[t[0] + 'With'] = r.fireWith;
      }), a.promise(o), t && t.call(o, o), o;
    }, when: function when(e) {
      var t = arguments.length,
          s = t,
          n = Array(s),
          a = ue.call(arguments),
          o = Ce.Deferred(),
          r = function r(e) {
        return function (s) {
          n[e] = this, a[e] = 1 < arguments.length ? ue.call(arguments) : s, --t || o.resolveWith(n, a);
        };
      };if (1 >= t && (u(e, o.done(r(s)).resolve, o.reject, !t), 'pending' === o.state() || Ie(a[s] && a[s].then))) return o.then();for (; s--;) {
        u(a[s], r(s), o.reject);
      }return o.promise();
    } });var Oe = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;Ce.Deferred.exceptionHook = function (t, s) {
    e.console && e.console.warn && t && Oe.test(t.name) && e.console.warn('jQuery.Deferred exception: ' + t.message, t.stack, s);
  }, Ce.readyException = function (t) {
    e.setTimeout(function () {
      throw t;
    });
  };var Ve = Ce.Deferred();Ce.fn.ready = function (e) {
    return Ve.then(e)['catch'](function (e) {
      Ce.readyException(e);
    }), this;
  }, Ce.extend({ isReady: !1, readyWait: 1, ready: function ready(e) {
      (!0 === e ? ! --Ce.readyWait : !Ce.isReady) && (Ce.isReady = !0, !0 !== e && 0 < --Ce.readyWait || Ve.resolveWith(de, [Ce]));
    } }), Ce.ready.then = Ve.then, 'complete' !== de.readyState && ('loading' === de.readyState || de.documentElement.doScroll) ? (de.addEventListener('DOMContentLoaded', p), e.addEventListener('load', p)) : e.setTimeout(Ce.ready);var Fe = function e(t, s, a, o, r, l, d) {
    var c = 0,
        i = t.length,
        u = null == a;if ('object' === n(a)) for (c in r = !0, a) {
      e(t, s, c, a[c], !0, l, d);
    } else if (void 0 !== o && (r = !0, Ie(o) || (d = !0), u && (d ? (s.call(t, o), s = null) : (u = s, s = function s(e, t, _s) {
      return u.call(Ce(e), _s);
    })), s)) for (; c < i; c++) {
      s(t[c], a, d ? o : o.call(t[c], c, s(t[c], a)));
    }return r ? t : u ? s.call(t) : i ? s(t[0], a) : l;
  },
      Be = /^-ms-/,
      He = /-([a-z])/g,
      qe = function qe(e) {
    return 1 === e.nodeType || 9 === e.nodeType || !+e.nodeType;
  };h.uid = 1, h.prototype = { cache: function cache(e) {
      var t = e[this.expando];return t || (t = {}, qe(e) && (e.nodeType ? e[this.expando] = t : Object.defineProperty(e, this.expando, { value: t, configurable: !0 }))), t;
    }, set: function set(e, t, s) {
      var n = this.cache(e),
          a;if ('string' === typeof t) n[m(t)] = s;else for (a in t) {
        n[m(a)] = t[a];
      }return n;
    }, get: function get(e, t) {
      return void 0 === t ? this.cache(e) : e[this.expando] && e[this.expando][m(t)];
    }, access: function access(e, t, s) {
      return void 0 === t || t && 'string' === typeof t && void 0 === s ? this.get(e, t) : (this.set(e, t, s), void 0 === s ? t : s);
    }, remove: function remove(e, t) {
      var s = e[this.expando],
          n;if (void 0 !== s) {
        if (void 0 !== t) for (Array.isArray(t) ? t = t.map(m) : (t = m(t), t = (t in s) ? [t] : t.match(je) || []), n = t.length; n--;) {
          delete s[t[n]];
        }(void 0 === t || Ce.isEmptyObject(s)) && (e.nodeType ? e[this.expando] = void 0 : delete e[this.expando]);
      }
    }, hasData: function hasData(e) {
      var t = e[this.expando];return void 0 !== t && !Ce.isEmptyObject(t);
    } };var We = new h(),
      Ge = new h(),
      $e = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
      Xe = /[A-Z]/g;Ce.extend({ hasData: function hasData(e) {
      return Ge.hasData(e) || We.hasData(e);
    }, data: function data(e, t, s) {
      return Ge.access(e, t, s);
    }, removeData: function removeData(e, t) {
      Ge.remove(e, t);
    }, _data: function _data(e, t, s) {
      return We.access(e, t, s);
    }, _removeData: function _removeData(e, t) {
      We.remove(e, t);
    } }), Ce.fn.extend({ data: function data(e, t) {
      var s = this[0],
          n = s && s.attributes,
          a,
          o,
          r;if (void 0 === e) {
        if (this.length && (r = Ge.get(s), 1 === s.nodeType && !We.get(s, 'hasDataAttrs'))) {
          for (a = n.length; a--;) {
            n[a] && (o = n[a].name, 0 === o.indexOf('data-') && (o = m(o.slice(5)), f(s, o, r[o])));
          }We.set(s, 'hasDataAttrs', !0);
        }return r;
      }return 'object' === ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) ? this.each(function () {
        Ge.set(this, e);
      }) : Fe(this, function (t) {
        var n;return s && void 0 === t ? (n = Ge.get(s, e), void 0 !== n) ? n : (n = f(s, e), void 0 === n ? void 0 : n) : void this.each(function () {
          Ge.set(this, e, t);
        });
      }, null, t, 1 < arguments.length, null, !0);
    }, removeData: function removeData(e) {
      return this.each(function () {
        Ge.remove(this, e);
      });
    } }), Ce.extend({ queue: function queue(e, t, s) {
      var n;if (e) return t = (t || 'fx') + 'queue', n = We.get(e, t), s && (!n || Array.isArray(s) ? n = We.access(e, t, Ce.makeArray(s)) : n.push(s)), n || [];
    }, dequeue: function dequeue(e, t) {
      t = t || 'fx';var s = Ce.queue(e, t),
          n = s.length,
          a = s.shift(),
          o = Ce._queueHooks(e, t);'inprogress' === a && (a = s.shift(), n--), a && ('fx' === t && s.unshift('inprogress'), delete o.stop, a.call(e, function () {
        Ce.dequeue(e, t);
      }, o)), !n && o && o.empty.fire();
    }, _queueHooks: function _queueHooks(e, t) {
      var s = t + 'queueHooks';return We.get(e, s) || We.access(e, s, { empty: Ce.Callbacks('once memory').add(function () {
          We.remove(e, [t + 'queue', s]);
        }) });
    } }), Ce.fn.extend({ queue: function queue(e, t) {
      var s = 2;return 'string' !== typeof e && (t = e, e = 'fx', s--), arguments.length < s ? Ce.queue(this[0], e) : void 0 === t ? this : this.each(function () {
        var s = Ce.queue(this, e, t);Ce._queueHooks(this, e), 'fx' === e && 'inprogress' !== s[0] && Ce.dequeue(this, e);
      });
    }, dequeue: function dequeue(e) {
      return this.each(function () {
        Ce.dequeue(this, e);
      });
    }, clearQueue: function clearQueue(e) {
      return this.queue(e || 'fx', []);
    }, promise: function promise(e, t) {
      var s = 1,
          n = Ce.Deferred(),
          a = this,
          o = this.length,
          r = function r() {
        --s || n.resolveWith(a, [a]);
      },
          l;for ('string' !== typeof e && (t = e, e = void 0), e = e || 'fx'; o--;) {
        l = We.get(a[o], e + 'queueHooks'), l && l.empty && (s++, l.empty.add(r));
      }return r(), n.promise(t);
    } });var Ke = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
      ze = new RegExp('^(?:([+-])=|)(' + Ke + ')([a-z%]*)$', 'i'),
      Je = ['Top', 'Right', 'Bottom', 'Left'],
      Ye = function Ye(e, t) {
    return e = t || e, 'none' === e.style.display || '' === e.style.display && Ce.contains(e.ownerDocument, e) && 'none' === Ce.css(e, 'display');
  },
      Qe = function Qe(e, t, s, n) {
    var a = {},
        o,
        r;for (r in t) {
      a[r] = e.style[r], e.style[r] = t[r];
    }for (r in o = s.apply(e, n || []), t) {
      e.style[r] = a[r];
    }return o;
  },
      Ze = {};Ce.fn.extend({ show: function show() {
      return v(this, !0);
    }, hide: function hide() {
      return v(this);
    }, toggle: function toggle(e) {
      return 'boolean' === typeof e ? e ? this.show() : this.hide() : this.each(function () {
        Ye(this) ? Ce(this).show() : Ce(this).hide();
      });
    } });var et = /^(?:checkbox|radio)$/i,
      tt = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i,
      st = /^$|^module$|\/(?:java|ecma)script/i,
      nt = { option: [1, '<select multiple=\'multiple\'>', '</select>'], thead: [1, '<table>', '</table>'], col: [2, '<table><colgroup>', '</colgroup></table>'], tr: [2, '<table><tbody>', '</tbody></table>'], td: [3, '<table><tbody><tr>', '</tr></tbody></table>'], _default: [0, '', ''] };nt.optgroup = nt.option, nt.tbody = nt.tfoot = nt.colgroup = nt.caption = nt.thead, nt.th = nt.td;var at = /<|&#?\w+;/;(function () {
    var e = de.createDocumentFragment(),
        t = e.appendChild(de.createElement('div')),
        s = de.createElement('input');s.setAttribute('type', 'radio'), s.setAttribute('checked', 'checked'), s.setAttribute('name', 't'), t.appendChild(s), ve.checkClone = t.cloneNode(!0).cloneNode(!0).lastChild.checked, t.innerHTML = '<textarea>x</textarea>', ve.noCloneChecked = !!t.cloneNode(!0).lastChild.defaultValue;
  })();var ot = de.documentElement,
      rt = /^key/,
      lt = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
      it = /^([^.]*)(?:\.(.+)|)/;Ce.event = { global: {}, add: function add(s, e, n, a, o) {
      var r = We.get(s),
          l,
          i,
          d,
          c,
          u,
          t,
          p,
          g,
          m,
          h,
          y;if (r) for (n.handler && (l = n, n = l.handler, o = l.selector), o && Ce.find.matchesSelector(ot, o), n.guid || (n.guid = Ce.guid++), (c = r.events) || (c = r.events = {}), (i = r.handle) || (i = r.handle = function (t) {
        return 'undefined' !== typeof Ce && Ce.event.triggered !== t.type ? Ce.event.dispatch.apply(s, arguments) : void 0;
      }), e = (e || '').match(je) || [''], u = e.length; u--;) {
        (d = it.exec(e[u]) || [], m = y = d[1], h = (d[2] || '').split('.').sort(), !!m) && (p = Ce.event.special[m] || {}, m = (o ? p.delegateType : p.bindType) || m, p = Ce.event.special[m] || {}, t = Ce.extend({ type: m, origType: y, data: a, handler: n, guid: n.guid, selector: o, needsContext: o && Ce.expr.match.needsContext.test(o), namespace: h.join('.') }, l), (g = c[m]) || (g = c[m] = [], g.delegateCount = 0, (!p.setup || !1 === p.setup.call(s, a, h, i)) && s.addEventListener && s.addEventListener(m, i)), p.add && (p.add.call(s, t), !t.handler.guid && (t.handler.guid = n.guid)), o ? g.splice(g.delegateCount++, 0, t) : g.push(t), Ce.event.global[m] = !0);
      }
    }, remove: function remove(e, s, n, a, o) {
      var r = We.hasData(e) && We.get(e),
          l,
          i,
          d,
          c,
          u,
          t,
          p,
          g,
          m,
          h,
          y;if (r && (c = r.events)) {
        for (s = (s || '').match(je) || [''], u = s.length; u--;) {
          if (d = it.exec(s[u]) || [], m = y = d[1], h = (d[2] || '').split('.').sort(), !m) {
            for (m in c) {
              Ce.event.remove(e, m + s[u], n, a, !0);
            }continue;
          }for (p = Ce.event.special[m] || {}, m = (a ? p.delegateType : p.bindType) || m, g = c[m] || [], d = d[2] && new RegExp('(^|\\.)' + h.join('\\.(?:.*\\.|)') + '(\\.|$)'), i = l = g.length; l--;) {
            t = g[l], (o || y === t.origType) && (!n || n.guid === t.guid) && (!d || d.test(t.namespace)) && (!a || a === t.selector || '**' === a && t.selector) && (g.splice(l, 1), t.selector && g.delegateCount--, p.remove && p.remove.call(e, t));
          }i && !g.length && ((!p.teardown || !1 === p.teardown.call(e, h, r.handle)) && Ce.removeEvent(e, m, r.handle), delete c[m]);
        }Ce.isEmptyObject(c) && We.remove(e, 'handle events');
      }
    }, dispatch: function dispatch(e) {
      var t = Ce.event.fix(e),
          s = Array(arguments.length),
          n = (We.get(this, 'events') || {})[t.type] || [],
          a = Ce.event.special[t.type] || {},
          o,
          r,
          l,
          i,
          d,
          c;for (s[0] = t, o = 1; o < arguments.length; o++) {
        s[o] = arguments[o];
      }if (t.delegateTarget = this, !(a.preDispatch && !1 === a.preDispatch.call(this, t))) {
        for (c = Ce.event.handlers.call(this, t, n), o = 0; (i = c[o++]) && !t.isPropagationStopped();) {
          for (t.currentTarget = i.elem, r = 0; (d = i.handlers[r++]) && !t.isImmediatePropagationStopped();) {
            (!t.rnamespace || t.rnamespace.test(d.namespace)) && (t.handleObj = d, t.data = d.data, l = ((Ce.event.special[d.origType] || {}).handle || d.handler).apply(i.elem, s), void 0 !== l && !1 === (t.result = l) && (t.preventDefault(), t.stopPropagation()));
          }
        }return a.postDispatch && a.postDispatch.call(this, t), t.result;
      }
    }, handlers: function handlers(e, t) {
      var s = [],
          n = t.delegateCount,
          a = e.target,
          o,
          r,
          l,
          i,
          d;if (n && a.nodeType && !('click' === e.type && 1 <= e.button)) for (; a !== this; a = a.parentNode || this) {
        if (1 === a.nodeType && ('click' !== e.type || !0 !== a.disabled)) {
          for (i = [], d = {}, o = 0; o < n; o++) {
            r = t[o], l = r.selector + ' ', void 0 === d[l] && (d[l] = r.needsContext ? -1 < Ce(l, this).index(a) : Ce.find(l, this, null, [a]).length), d[l] && i.push(r);
          }i.length && s.push({ elem: a, handlers: i });
        }
      }return a = this, n < t.length && s.push({ elem: a, handlers: t.slice(n) }), s;
    }, addProp: function addProp(e, t) {
      Object.defineProperty(Ce.Event.prototype, e, { enumerable: !0, configurable: !0, get: Ie(t) ? function () {
          if (this.originalEvent) return t(this.originalEvent);
        } : function () {
          if (this.originalEvent) return this.originalEvent[e];
        }, set: function set(t) {
          Object.defineProperty(this, e, { enumerable: !0, configurable: !0, writable: !0, value: t });
        } });
    }, fix: function fix(e) {
      return e[Ce.expando] ? e : new Ce.Event(e);
    }, special: { load: { noBubble: !0 }, focus: { trigger: function trigger() {
          if (this !== M() && this.focus) return this.focus(), !1;
        }, delegateType: 'focusin' }, blur: { trigger: function trigger() {
          if (this === M() && this.blur) return this.blur(), !1;
        }, delegateType: 'focusout' }, click: { trigger: function trigger() {
          if ('checkbox' === this.type && this.click && o(this, 'input')) return this.click(), !1;
        }, _default: function _default(e) {
          return o(e.target, 'a');
        } }, beforeunload: { postDispatch: function postDispatch(e) {
          void 0 !== e.result && e.originalEvent && (e.originalEvent.returnValue = e.result);
        } } } }, Ce.removeEvent = function (e, t, s) {
    e.removeEventListener && e.removeEventListener(t, s);
  }, Ce.Event = function (e, t) {
    return this instanceof Ce.Event ? void (e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || void 0 === e.defaultPrevented && !1 === e.returnValue ? k : C, this.target = e.target && 3 === e.target.nodeType ? e.target.parentNode : e.target, this.currentTarget = e.currentTarget, this.relatedTarget = e.relatedTarget) : this.type = e, t && Ce.extend(this, t), this.timeStamp = e && e.timeStamp || Date.now(), this[Ce.expando] = !0) : new Ce.Event(e, t);
  }, Ce.Event.prototype = { constructor: Ce.Event, isDefaultPrevented: C, isPropagationStopped: C, isImmediatePropagationStopped: C, isSimulated: !1, preventDefault: function preventDefault() {
      var t = this.originalEvent;this.isDefaultPrevented = k, t && !this.isSimulated && t.preventDefault();
    }, stopPropagation: function stopPropagation() {
      var t = this.originalEvent;this.isPropagationStopped = k, t && !this.isSimulated && t.stopPropagation();
    }, stopImmediatePropagation: function stopImmediatePropagation() {
      var t = this.originalEvent;this.isImmediatePropagationStopped = k, t && !this.isSimulated && t.stopImmediatePropagation(), this.stopPropagation();
    } }, Ce.each({ altKey: !0, bubbles: !0, cancelable: !0, changedTouches: !0, ctrlKey: !0, detail: !0, eventPhase: !0, metaKey: !0, pageX: !0, pageY: !0, shiftKey: !0, view: !0, char: !0, charCode: !0, key: !0, keyCode: !0, button: !0, buttons: !0, clientX: !0, clientY: !0, offsetX: !0, offsetY: !0, pointerId: !0, pointerType: !0, screenX: !0, screenY: !0, targetTouches: !0, toElement: !0, touches: !0, which: function which(e) {
      var t = e.button;return null == e.which && rt.test(e.type) ? null == e.charCode ? e.keyCode : e.charCode : !e.which && void 0 !== t && lt.test(e.type) ? 1 & t ? 1 : 2 & t ? 3 : 4 & t ? 2 : 0 : e.which;
    } }, Ce.event.addProp), Ce.each({ mouseenter: 'mouseover', mouseleave: 'mouseout', pointerenter: 'pointerover', pointerleave: 'pointerout' }, function (e, t) {
    Ce.event.special[e] = { delegateType: t, bindType: t, handle: function handle(e) {
        var s = this,
            n = e.relatedTarget,
            a = e.handleObj,
            o;return n && (n === s || Ce.contains(s, n)) || (e.type = a.origType, o = a.handler.apply(this, arguments), e.type = t), o;
      } };
  }), Ce.fn.extend({ on: function on(e, t, s, n) {
      return T(this, e, t, s, n);
    }, one: function one(e, t, s, n) {
      return T(this, e, t, s, n, 1);
    }, off: function off(e, t, s) {
      var n, a;if (e && e.preventDefault && e.handleObj) return n = e.handleObj, Ce(e.delegateTarget).off(n.namespace ? n.origType + '.' + n.namespace : n.origType, n.selector, n.handler), this;if ('object' === ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e))) {
        for (a in e) {
          this.off(a, t, e[a]);
        }return this;
      }return (!1 === t || 'function' === typeof t) && (s = t, t = void 0), !1 === s && (s = C), this.each(function () {
        Ce.event.remove(this, e, s, t);
      });
    } });var dt = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,
      ct = /<script|<style|<link/i,
      ut = /checked\s*(?:[^=]|=\s*.checked.)/i,
      pt = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;Ce.extend({ htmlPrefilter: function htmlPrefilter(e) {
      return e.replace(dt, '<$1></$2>');
    }, clone: function clone(e, t, s) {
      var n = e.cloneNode(!0),
          a = Ce.contains(e.ownerDocument, e),
          o,
          r,
          l,
          i;if (!ve.noCloneChecked && (1 === e.nodeType || 11 === e.nodeType) && !Ce.isXMLDoc(e)) for (i = I(n), l = I(e), (o = 0, r = l.length); o < r; o++) {
        P(l[o], i[o]);
      }if (t) if (s) for (l = l || I(e), i = i || I(n), (o = 0, r = l.length); o < r; o++) {
        E(l[o], i[o]);
      } else E(e, n);return i = I(n, 'script'), 0 < i.length && S(i, !a && I(e, 'script')), n;
    }, cleanData: function cleanData(e) {
      for (var t = Ce.event.special, s = 0, n, a, o; void 0 !== (a = e[s]); s++) {
        if (qe(a)) {
          if (n = a[We.expando]) {
            if (n.events) for (o in n.events) {
              t[o] ? Ce.event.remove(a, o) : Ce.removeEvent(a, o, n.handle);
            }a[We.expando] = void 0;
          }a[Ge.expando] && (a[Ge.expando] = void 0);
        }
      }
    } }), Ce.fn.extend({ detach: function detach(e) {
      return U(this, e, !0);
    }, remove: function remove(e) {
      return U(this, e);
    }, text: function text(e) {
      return Fe(this, function (e) {
        return void 0 === e ? Ce.text(this) : this.empty().each(function () {
          (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && (this.textContent = e);
        });
      }, null, e, arguments.length);
    }, append: function append() {
      return A(this, arguments, function (e) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var t = w(this, e);t.appendChild(e);
        }
      });
    }, prepend: function prepend() {
      return A(this, arguments, function (e) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var t = w(this, e);t.insertBefore(e, t.firstChild);
        }
      });
    }, before: function before() {
      return A(this, arguments, function (e) {
        this.parentNode && this.parentNode.insertBefore(e, this);
      });
    }, after: function after() {
      return A(this, arguments, function (e) {
        this.parentNode && this.parentNode.insertBefore(e, this.nextSibling);
      });
    }, empty: function empty() {
      for (var e = 0, t; null != (t = this[e]); e++) {
        1 === t.nodeType && (Ce.cleanData(I(t, !1)), t.textContent = '');
      }return this;
    }, clone: function clone(e, t) {
      return e = null != e && e, t = null == t ? e : t, this.map(function () {
        return Ce.clone(this, e, t);
      });
    }, html: function html(e) {
      return Fe(this, function (e) {
        var t = this[0] || {},
            s = 0,
            n = this.length;if (void 0 === e && 1 === t.nodeType) return t.innerHTML;if ('string' === typeof e && !ct.test(e) && !nt[(tt.exec(e) || ['', ''])[1].toLowerCase()]) {
          e = Ce.htmlPrefilter(e);try {
            for (; s < n; s++) {
              t = this[s] || {}, 1 === t.nodeType && (Ce.cleanData(I(t, !1)), t.innerHTML = e);
            }t = 0;
          } catch (t) {}
        }t && this.empty().append(e);
      }, null, e, arguments.length);
    }, replaceWith: function replaceWith() {
      var e = [];return A(this, arguments, function (t) {
        var s = this.parentNode;0 > Ce.inArray(this, e) && (Ce.cleanData(I(this)), s && s.replaceChild(t, this));
      }, e);
    } }), Ce.each({ appendTo: 'append', prependTo: 'prepend', insertBefore: 'before', insertAfter: 'after', replaceAll: 'replaceWith' }, function (e, t) {
    Ce.fn[e] = function (e) {
      for (var s = [], n = Ce(e), a = n.length - 1, o = 0, r; o <= a; o++) {
        r = o === a ? this : this.clone(!0), Ce(n[o])[t](r), ge.apply(s, r.get());
      }return this.pushStack(s);
    };
  });var gt = new RegExp('^(' + Ke + ')(?!px)[a-z%]+$', 'i'),
      mt = function mt(t) {
    var s = t.ownerDocument.defaultView;return s && s.opener || (s = e), s.getComputedStyle(t);
  },
      ht = new RegExp(Je.join('|'), 'i');(function () {
    function t() {
      if (a) {
        n.style.cssText = 'position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0', a.style.cssText = 'position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%', ot.appendChild(n).appendChild(a);var t = e.getComputedStyle(a);o = '1%' !== t.top, d = 12 === s(t.marginLeft), a.style.right = '60%', i = 36 === s(t.right), r = 36 === s(t.width), a.style.position = 'absolute', l = 36 === a.offsetWidth || 'absolute', ot.removeChild(n), a = null;
      }
    }function s(e) {
      return Math.round(parseFloat(e));
    }var n = de.createElement('div'),
        a = de.createElement('div'),
        o,
        r,
        l,
        i,
        d;a.style && (a.style.backgroundClip = 'content-box', a.cloneNode(!0).style.backgroundClip = '', ve.clearCloneStyle = 'content-box' === a.style.backgroundClip, Ce.extend(ve, { boxSizingReliable: function boxSizingReliable() {
        return t(), r;
      }, pixelBoxStyles: function pixelBoxStyles() {
        return t(), i;
      }, pixelPosition: function pixelPosition() {
        return t(), o;
      }, reliableMarginLeft: function reliableMarginLeft() {
        return t(), d;
      }, scrollboxSize: function scrollboxSize() {
        return t(), l;
      } }));
  })();var yt = /^(none|table(?!-c[ea]).+)/,
      ft = /^--/,
      bt = { position: 'absolute', visibility: 'hidden', display: 'block' },
      xt = { letterSpacing: '0', fontWeight: '400' },
      vt = ['Webkit', 'Moz', 'ms'],
      It = de.createElement('div').style;Ce.extend({ cssHooks: { opacity: { get: function get(e, t) {
          if (t) {
            var s = R(e, 'opacity');return '' === s ? '1' : s;
          }
        } } }, cssNumber: { animationIterationCount: !0, columnCount: !0, fillOpacity: !0, flexGrow: !0, flexShrink: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0 }, cssProps: {}, style: function style(e, t, s, n) {
      if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
        var a = m(t),
            o = ft.test(t),
            r = e.style,
            l,
            i,
            d;if (o || (t = O(a)), d = Ce.cssHooks[t] || Ce.cssHooks[a], void 0 !== s) {
          if (i = 'undefined' === typeof s ? 'undefined' : babelHelpers['typeof'](s), 'string' === i && (l = ze.exec(s)) && l[1] && (s = b(e, t, l), i = 'number'), null == s || s !== s) return;'number' === i && (s += l && l[3] || (Ce.cssNumber[a] ? '' : 'px')), ve.clearCloneStyle || '' !== s || 0 !== t.indexOf('background') || (r[t] = 'inherit'), d && 'set' in d && void 0 === (s = d.set(e, s, n)) || (o ? r.setProperty(t, s) : r[t] = s);
        } else return d && 'get' in d && void 0 !== (l = d.get(e, !1, n)) ? l : r[t];
      }
    }, css: function css(e, t, s, n) {
      var a = m(t),
          o = ft.test(t),
          r,
          l,
          i;return o || (t = O(a)), i = Ce.cssHooks[t] || Ce.cssHooks[a], i && 'get' in i && (r = i.get(e, !0, s)), void 0 === r && (r = R(e, t, n)), 'normal' === r && t in xt && (r = xt[t]), '' === s || s ? (l = parseFloat(r), !0 === s || isFinite(l) ? l || 0 : r) : r;
    } }), Ce.each(['height', 'width'], function (e, t) {
    Ce.cssHooks[t] = { get: function get(e, s, n) {
        if (s) return !yt.test(Ce.css(e, 'display')) || e.getClientRects().length && e.getBoundingClientRect().width ? B(e, t, n) : Qe(e, bt, function () {
          return B(e, t, n);
        });
      }, set: function set(e, s, n) {
        var a = mt(e),
            o = 'border-box' === Ce.css(e, 'boxSizing', !1, a),
            r = n && F(e, t, n, o, a),
            l;return o && ve.scrollboxSize() === a.position && (r -= oe(e['offset' + t[0].toUpperCase() + t.slice(1)] - parseFloat(a[t]) - F(e, t, 'border', !1, a) - 0.5)), r && (l = ze.exec(s)) && 'px' !== (l[3] || 'px') && (e.style[t] = s, s = Ce.css(e, t)), V(e, s, r);
      } };
  }), Ce.cssHooks.marginLeft = D(ve.reliableMarginLeft, function (e, t) {
    if (t) return (parseFloat(R(e, 'marginLeft')) || e.getBoundingClientRect().left - Qe(e, { marginLeft: 0 }, function () {
      return e.getBoundingClientRect().left;
    })) + 'px';
  }), Ce.each({ margin: '', padding: '', border: 'Width' }, function (e, t) {
    Ce.cssHooks[e + t] = { expand: function expand(s) {
        for (var n = 0, a = {}, o = 'string' === typeof s ? s.split(' ') : [s]; 4 > n; n++) {
          a[e + Je[n] + t] = o[n] || o[n - 2] || o[0];
        }return a;
      } }, 'margin' !== e && (Ce.cssHooks[e + t].set = V);
  }), Ce.fn.extend({ css: function css(e, t) {
      return Fe(this, function (e, t, s) {
        var n = {},
            a = 0,
            o,
            r;if (Array.isArray(t)) {
          for (o = mt(e), r = t.length; a < r; a++) {
            n[t[a]] = Ce.css(e, t[a], !1, o);
          }return n;
        }return void 0 === s ? Ce.css(e, t) : Ce.style(e, t, s);
      }, e, t, 1 < arguments.length);
    } }), Ce.Tween = H, H.prototype = { constructor: H, init: function init(e, t, s, n, a, o) {
      this.elem = e, this.prop = s, this.easing = a || Ce.easing._default, this.options = t, this.start = this.now = this.cur(), this.end = n, this.unit = o || (Ce.cssNumber[s] ? '' : 'px');
    }, cur: function cur() {
      var e = H.propHooks[this.prop];return e && e.get ? e.get(this) : H.propHooks._default.get(this);
    }, run: function run(e) {
      var t = H.propHooks[this.prop],
          s;return this.pos = this.options.duration ? s = Ce.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : s = e, this.now = (this.end - this.start) * s + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), t && t.set ? t.set(this) : H.propHooks._default.set(this), this;
    } }, H.prototype.init.prototype = H.prototype, H.propHooks = { _default: { get: function get(e) {
        var t;return 1 !== e.elem.nodeType || null != e.elem[e.prop] && null == e.elem.style[e.prop] ? e.elem[e.prop] : (t = Ce.css(e.elem, e.prop, ''), t && 'auto' !== t ? t : 0);
      }, set: function set(e) {
        Ce.fx.step[e.prop] ? Ce.fx.step[e.prop](e) : 1 === e.elem.nodeType && (null != e.elem.style[Ce.cssProps[e.prop]] || Ce.cssHooks[e.prop]) ? Ce.style(e.elem, e.prop, e.now + e.unit) : e.elem[e.prop] = e.now;
      } } }, H.propHooks.scrollTop = H.propHooks.scrollLeft = { set: function set(e) {
      e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now);
    } }, Ce.easing = { linear: function linear(e) {
      return e;
    }, swing: function swing(e) {
      return 0.5 - Math.cos(e * Math.PI) / 2;
    }, _default: 'swing' }, Ce.fx = H.prototype.init, Ce.fx.step = {};var St = /^(?:toggle|show|hide)$/,
      _t = /queueHooks$/,
      kt,
      Ct;Ce.Animation = Ce.extend(z, { tweeners: { "*": [function (e, t) {
        var s = this.createTween(e, t);return b(s.elem, e, ze.exec(t), s), s;
      }] }, tweener: function tweener(e, t) {
      Ie(e) ? (t = e, e = ['*']) : e = e.match(je);for (var s = 0, n = e.length, a; s < n; s++) {
        a = e[s], z.tweeners[a] = z.tweeners[a] || [], z.tweeners[a].unshift(t);
      }
    }, prefilters: [function (e, t, s) {
      var n = this,
          a = {},
          o = e.style,
          r = e.nodeType && Ye(e),
          l = We.get(e, 'fxshow'),
          i,
          d,
          c,
          u,
          p,
          g,
          m,
          h;for (i in s.queue || (u = Ce._queueHooks(e, 'fx'), null == u.unqueued && (u.unqueued = 0, p = u.empty.fire, u.empty.fire = function () {
        u.unqueued || p();
      }), u.unqueued++, n.always(function () {
        n.always(function () {
          u.unqueued--, Ce.queue(e, 'fx').length || u.empty.fire();
        });
      })), t) {
        if (d = t[i], St.test(d)) {
          if (delete t[i], c = c || 'toggle' === d, d === (r ? 'hide' : 'show')) if ('show' === d && l && void 0 !== l[i]) r = !0;else continue;a[i] = l && l[i] || Ce.style(e, i);
        }
      }if (g = !Ce.isEmptyObject(t), g || !Ce.isEmptyObject(a)) for (i in ('width' in t || 'height' in t) && 1 === e.nodeType && (s.overflow = [o.overflow, o.overflowX, o.overflowY], m = l && l.display, null == m && (m = We.get(e, 'display')), h = Ce.css(e, 'display'), 'none' === h && (m ? h = m : (v([e], !0), m = e.style.display || m, h = Ce.css(e, 'display'), v([e]))), ('inline' === h || 'inline-block' === h && null != m) && 'none' === Ce.css(e, 'float') && (!g && (n.done(function () {
        o.display = m;
      }), null == m && (h = o.display, m = 'none' === h ? '' : h)), o.display = 'inline-block')), s.overflow && (o.overflow = 'hidden', n.always(function () {
        o.overflow = s.overflow[0], o.overflowX = s.overflow[1], o.overflowY = s.overflow[2];
      })), g = !1, a) {
        g || (l ? 'hidden' in l && (r = l.hidden) : l = We.access(e, 'fxshow', { display: m }), c && (l.hidden = !r), r && v([e], !0), n.done(function () {
          for (i in r || v([e]), We.remove(e, 'fxshow'), a) {
            Ce.style(e, i, a[i]);
          }
        })), g = X(r ? l[i] : 0, i, n), i in l || (l[i] = g.start, r && (g.end = g.start, g.start = 0));
      }
    }], prefilter: function prefilter(e, t) {
      t ? z.prefilters.unshift(e) : z.prefilters.push(e);
    } }), Ce.speed = function (e, t, s) {
    var n = e && 'object' === ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) ? Ce.extend({}, e) : { complete: s || !s && t || Ie(e) && e, duration: e, easing: s && t || t && !Ie(t) && t };return Ce.fx.off ? n.duration = 0 : 'number' !== typeof n.duration && (n.duration in Ce.fx.speeds ? n.duration = Ce.fx.speeds[n.duration] : n.duration = Ce.fx.speeds._default), (null == n.queue || !0 === n.queue) && (n.queue = 'fx'), n.old = n.complete, n.complete = function () {
      Ie(n.old) && n.old.call(this), n.queue && Ce.dequeue(this, n.queue);
    }, n;
  }, Ce.fn.extend({ fadeTo: function fadeTo(e, t, s, n) {
      return this.filter(Ye).css('opacity', 0).show().end().animate({ opacity: t }, e, s, n);
    }, animate: function animate(e, t, s, n) {
      var a = Ce.isEmptyObject(e),
          o = Ce.speed(t, s, n),
          r = function r() {
        var t = z(this, Ce.extend({}, e), o);(a || We.get(this, 'finish')) && t.stop(!0);
      };return r.finish = r, a || !1 === o.queue ? this.each(r) : this.queue(o.queue, r);
    }, stop: function stop(e, t, s) {
      var n = function n(e) {
        var t = e.stop;delete e.stop, t(s);
      };return 'string' !== typeof e && (s = t, t = e, e = void 0), t && !1 !== e && this.queue(e || 'fx', []), this.each(function () {
        var t = !0,
            a = null != e && e + 'queueHooks',
            o = Ce.timers,
            r = We.get(this);if (a) r[a] && r[a].stop && n(r[a]);else for (a in r) {
          r[a] && r[a].stop && _t.test(a) && n(r[a]);
        }for (a = o.length; a--;) {
          o[a].elem === this && (null == e || o[a].queue === e) && (o[a].anim.stop(s), t = !1, o.splice(a, 1));
        }(t || !s) && Ce.dequeue(this, e);
      });
    }, finish: function finish(e) {
      return !1 !== e && (e = e || 'fx'), this.each(function () {
        var t = We.get(this),
            s = t[e + 'queue'],
            n = t[e + 'queueHooks'],
            a = Ce.timers,
            o = s ? s.length : 0,
            r;for (t.finish = !0, Ce.queue(this, e, []), n && n.stop && n.stop.call(this, !0), r = a.length; r--;) {
          a[r].elem === this && a[r].queue === e && (a[r].anim.stop(!0), a.splice(r, 1));
        }for (r = 0; r < o; r++) {
          s[r] && s[r].finish && s[r].finish.call(this);
        }delete t.finish;
      });
    } }), Ce.each(['toggle', 'show', 'hide'], function (e, t) {
    var s = Ce.fn[t];Ce.fn[t] = function (e, n, a) {
      return null == e || 'boolean' === typeof e ? s.apply(this, arguments) : this.animate(G(t, !0), e, n, a);
    };
  }), Ce.each({ slideDown: G('show'), slideUp: G('hide'), slideToggle: G('toggle'), fadeIn: { opacity: 'show' }, fadeOut: { opacity: 'hide' }, fadeToggle: { opacity: 'toggle' } }, function (e, t) {
    Ce.fn[e] = function (e, s, n) {
      return this.animate(t, e, s, n);
    };
  }), Ce.timers = [], Ce.fx.tick = function () {
    var e = 0,
        t = Ce.timers,
        s;for (kt = Date.now(); e < t.length; e++) {
      s = t[e], s() || t[e] !== s || t.splice(e--, 1);
    }t.length || Ce.fx.stop(), kt = void 0;
  }, Ce.fx.timer = function (e) {
    Ce.timers.push(e), Ce.fx.start();
  }, Ce.fx.interval = 13, Ce.fx.start = function () {
    Ct || (Ct = !0, q());
  }, Ce.fx.stop = function () {
    Ct = null;
  }, Ce.fx.speeds = { slow: 600, fast: 200, _default: 400 }, Ce.fn.delay = function (t, s) {
    return t = Ce.fx ? Ce.fx.speeds[t] || t : t, s = s || 'fx', this.queue(s, function (s, n) {
      var a = e.setTimeout(s, t);n.stop = function () {
        e.clearTimeout(a);
      };
    });
  }, function () {
    var e = de.createElement('input'),
        t = de.createElement('select'),
        s = t.appendChild(de.createElement('option'));e.type = 'checkbox', ve.checkOn = '' !== e.value, ve.optSelected = s.selected, e = de.createElement('input'), e.value = 't', e.type = 'radio', ve.radioValue = 't' === e.value;
  }();var Mt = Ce.expr.attrHandle,
      Tt;Ce.fn.extend({ attr: function attr(e, t) {
      return Fe(this, Ce.attr, e, t, 1 < arguments.length);
    }, removeAttr: function removeAttr(e) {
      return this.each(function () {
        Ce.removeAttr(this, e);
      });
    } }), Ce.extend({ attr: function attr(e, t, s) {
      var n = e.nodeType,
          a,
          o;if (3 !== n && 8 !== n && 2 !== n) return 'undefined' === typeof e.getAttribute ? Ce.prop(e, t, s) : (1 === n && Ce.isXMLDoc(e) || (o = Ce.attrHooks[t.toLowerCase()] || (Ce.expr.match.bool.test(t) ? Tt : void 0)), void 0 !== s) ? null === s ? void Ce.removeAttr(e, t) : o && 'set' in o && void 0 !== (a = o.set(e, s, t)) ? a : (e.setAttribute(t, s + ''), s) : o && 'get' in o && null !== (a = o.get(e, t)) ? a : (a = Ce.find.attr(e, t), null == a ? void 0 : a);
    }, attrHooks: { type: { set: function set(e, t) {
          if (!ve.radioValue && 'radio' === t && o(e, 'input')) {
            var s = e.value;return e.setAttribute('type', t), s && (e.value = s), t;
          }
        } } }, removeAttr: function removeAttr(e, t) {
      var s = 0,
          n = t && t.match(je),
          a;if (n && 1 === e.nodeType) for (; a = n[s++];) {
        e.removeAttribute(a);
      }
    } }), Tt = { set: function set(e, t, s) {
      return !1 === t ? Ce.removeAttr(e, s) : e.setAttribute(s, s), s;
    } }, Ce.each(Ce.expr.match.bool.source.match(/\w+/g), function (e, t) {
    var s = Mt[t] || Ce.find.attr;Mt[t] = function (e, t, n) {
      var a = t.toLowerCase(),
          o,
          r;return n || (r = Mt[a], Mt[a] = o, o = null == s(e, t, n) ? null : a, Mt[a] = r), o;
    };
  });var wt = /^(?:input|select|textarea|button)$/i,
      Nt = /^(?:a|area)$/i;Ce.fn.extend({ prop: function prop(e, t) {
      return Fe(this, Ce.prop, e, t, 1 < arguments.length);
    }, removeProp: function removeProp(e) {
      return this.each(function () {
        delete this[Ce.propFix[e] || e];
      });
    } }), Ce.extend({ prop: function prop(e, t, s) {
      var n = e.nodeType,
          a,
          o;if (3 !== n && 8 !== n && 2 !== n) return 1 === n && Ce.isXMLDoc(e) || (t = Ce.propFix[t] || t, o = Ce.propHooks[t]), void 0 === s ? o && 'get' in o && null !== (a = o.get(e, t)) ? a : e[t] : o && 'set' in o && void 0 !== (a = o.set(e, s, t)) ? a : e[t] = s;
    }, propHooks: { tabIndex: { get: function get(e) {
          var t = Ce.find.attr(e, 'tabindex');return t ? parseInt(t, 10) : wt.test(e.nodeName) || Nt.test(e.nodeName) && e.href ? 0 : -1;
        } } }, propFix: { "for": 'htmlFor', "class": 'className' } }), ve.optSelected || (Ce.propHooks.selected = { get: function get(e) {
      var t = e.parentNode;return t && t.parentNode && t.parentNode.selectedIndex, null;
    }, set: function set(e) {
      var t = e.parentNode;t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex);
    } }), Ce.each(['tabIndex', 'readOnly', 'maxLength', 'cellSpacing', 'cellPadding', 'rowSpan', 'colSpan', 'useMap', 'frameBorder', 'contentEditable'], function () {
    Ce.propFix[this.toLowerCase()] = this;
  }), Ce.fn.extend({ addClass: function addClass(e) {
      var t = 0,
          s,
          n,
          a,
          o,
          r,
          l,
          i;if (Ie(e)) return this.each(function (t) {
        Ce(this).addClass(e.call(this, t, Y(this)));
      });if (s = Q(e), s.length) for (; n = this[t++];) {
        if (o = Y(n), a = 1 === n.nodeType && ' ' + J(o) + ' ', a) {
          for (l = 0; r = s[l++];) {
            0 > a.indexOf(' ' + r + ' ') && (a += r + ' ');
          }i = J(a), o !== i && n.setAttribute('class', i);
        }
      }return this;
    }, removeClass: function removeClass(e) {
      var t = 0,
          s,
          n,
          a,
          o,
          r,
          l,
          i;if (Ie(e)) return this.each(function (t) {
        Ce(this).removeClass(e.call(this, t, Y(this)));
      });if (!arguments.length) return this.attr('class', '');if (s = Q(e), s.length) for (; n = this[t++];) {
        if (o = Y(n), a = 1 === n.nodeType && ' ' + J(o) + ' ', a) {
          for (l = 0; r = s[l++];) {
            for (; -1 < a.indexOf(' ' + r + ' ');) {
              a = a.replace(' ' + r + ' ', ' ');
            }
          }i = J(a), o !== i && n.setAttribute('class', i);
        }
      }return this;
    }, toggleClass: function toggleClass(e, t) {
      var s = 'undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e),
          n = 'string' === s || Array.isArray(e);return 'boolean' === typeof t && n ? t ? this.addClass(e) : this.removeClass(e) : Ie(e) ? this.each(function (s) {
        Ce(this).toggleClass(e.call(this, s, Y(this), t), t);
      }) : this.each(function () {
        var t, a, o, r;if (n) for (a = 0, o = Ce(this), r = Q(e); t = r[a++];) {
          o.hasClass(t) ? o.removeClass(t) : o.addClass(t);
        } else (void 0 === e || 'boolean' === s) && (t = Y(this), t && We.set(this, '__className__', t), this.setAttribute && this.setAttribute('class', t || !1 === e ? '' : We.get(this, '__className__') || ''));
      });
    }, hasClass: function hasClass(e) {
      var t = 0,
          s,
          n;for (s = ' ' + e + ' '; n = this[t++];) {
        if (1 === n.nodeType && -1 < (' ' + J(Y(n)) + ' ').indexOf(s)) return !0;
      }return !1;
    } });var Lt = /\r/g;Ce.fn.extend({ val: function val(e) {
      var t = this[0],
          s,
          n,
          a;return arguments.length ? (a = Ie(e), this.each(function (t) {
        var n;1 !== this.nodeType || (n = a ? e.call(this, t, Ce(this).val()) : e, null == n ? n = '' : 'number' === typeof n ? n += '' : Array.isArray(n) && (n = Ce.map(n, function (e) {
          return null == e ? '' : e + '';
        })), s = Ce.valHooks[this.type] || Ce.valHooks[this.nodeName.toLowerCase()], (!s || !('set' in s) || void 0 === s.set(this, n, 'value')) && (this.value = n));
      })) : t ? (s = Ce.valHooks[t.type] || Ce.valHooks[t.nodeName.toLowerCase()], s && 'get' in s && void 0 !== (n = s.get(t, 'value'))) ? n : (n = t.value, 'string' === typeof n ? n.replace(Lt, '') : null == n ? '' : n) : void 0;
    } }), Ce.extend({ valHooks: { option: { get: function get(e) {
          var t = Ce.find.attr(e, 'value');return null == t ? J(Ce.text(e)) : t;
        } }, select: { get: function get(e) {
          var t = e.options,
              s = e.selectedIndex,
              n = 'select-one' === e.type,
              a = n ? null : [],
              r = n ? s + 1 : t.length,
              l,
              d,
              c;for (c = 0 > s ? r : n ? s : 0; c < r; c++) {
            if (d = t[c], (d.selected || c === s) && !d.disabled && (!d.parentNode.disabled || !o(d.parentNode, 'optgroup'))) {
              if (l = Ce(d).val(), n) return l;a.push(l);
            }
          }return a;
        }, set: function set(e, t) {
          for (var s = e.options, n = Ce.makeArray(t), a = s.length, o, r; a--;) {
            r = s[a], (r.selected = -1 < Ce.inArray(Ce.valHooks.option.get(r), n)) && (o = !0);
          }return o || (e.selectedIndex = -1), n;
        } } } }), Ce.each(['radio', 'checkbox'], function () {
    Ce.valHooks[this] = { set: function set(e, t) {
        if (Array.isArray(t)) return e.checked = -1 < Ce.inArray(Ce(e).val(), t);
      } }, ve.checkOn || (Ce.valHooks[this].get = function (e) {
      return null === e.getAttribute('value') ? 'on' : e.value;
    });
  }), ve.focusin = 'onfocusin' in e;var Et = /^(?:focusinfocus|focusoutblur)$/,
      Pt = function Pt(t) {
    t.stopPropagation();
  };Ce.extend(Ce.event, { trigger: function trigger(t, s, n, a) {
      var o = [n || de],
          r = fe.call(t, 'type') ? t.type : t,
          l = fe.call(t, 'namespace') ? t.namespace.split('.') : [],
          d,
          i,
          c,
          u,
          p,
          g,
          m,
          h;if ((i = h = c = n = n || de, 3 !== n.nodeType && 8 !== n.nodeType) && !Et.test(r + Ce.event.triggered) && (-1 < r.indexOf('.') && (l = r.split('.'), r = l.shift(), l.sort()), p = 0 > r.indexOf(':') && 'on' + r, t = t[Ce.expando] ? t : new Ce.Event(r, 'object' === ('undefined' === typeof t ? 'undefined' : babelHelpers['typeof'](t)) && t), t.isTrigger = a ? 2 : 3, t.namespace = l.join('.'), t.rnamespace = t.namespace ? new RegExp('(^|\\.)' + l.join('\\.(?:.*\\.|)') + '(\\.|$)') : null, t.result = void 0, t.target || (t.target = n), s = null == s ? [t] : Ce.makeArray(s, [t]), m = Ce.event.special[r] || {}, a || !m.trigger || !1 !== m.trigger.apply(n, s))) {
        if (!a && !m.noBubble && !Se(n)) {
          for (u = m.delegateType || r, Et.test(u + r) || (i = i.parentNode); i; i = i.parentNode) {
            o.push(i), c = i;
          }c === (n.ownerDocument || de) && o.push(c.defaultView || c.parentWindow || e);
        }for (d = 0; (i = o[d++]) && !t.isPropagationStopped();) {
          h = i, t.type = 1 < d ? u : m.bindType || r, g = (We.get(i, 'events') || {})[t.type] && We.get(i, 'handle'), g && g.apply(i, s), g = p && i[p], g && g.apply && qe(i) && (t.result = g.apply(i, s), !1 === t.result && t.preventDefault());
        }return t.type = r, a || t.isDefaultPrevented() || m._default && !1 !== m._default.apply(o.pop(), s) || !qe(n) || !p || !Ie(n[r]) || Se(n) || (c = n[p], c && (n[p] = null), Ce.event.triggered = r, t.isPropagationStopped() && h.addEventListener(r, Pt), n[r](), t.isPropagationStopped() && h.removeEventListener(r, Pt), Ce.event.triggered = void 0, c && (n[p] = c)), t.result;
      }
    }, simulate: function simulate(t, s, n) {
      var a = Ce.extend(new Ce.Event(), n, { type: t, isSimulated: !0 });Ce.event.trigger(a, null, s);
    } }), Ce.fn.extend({ trigger: function trigger(e, t) {
      return this.each(function () {
        Ce.event.trigger(e, t, this);
      });
    }, triggerHandler: function triggerHandler(e, t) {
      var s = this[0];if (s) return Ce.event.trigger(e, t, s, !0);
    } }), ve.focusin || Ce.each({ focus: 'focusin', blur: 'focusout' }, function (e, t) {
    var s = function s(e) {
      Ce.event.simulate(t, e.target, Ce.event.fix(e));
    };Ce.event.special[t] = { setup: function setup() {
        var n = this.ownerDocument || this,
            a = We.access(n, t);a || n.addEventListener(e, s, !0), We.access(n, t, (a || 0) + 1);
      }, teardown: function teardown() {
        var n = this.ownerDocument || this,
            a = We.access(n, t) - 1;a ? We.access(n, t, a) : (n.removeEventListener(e, s, !0), We.remove(n, t));
      } };
  });var At = e.location,
      Ut = Date.now(),
      Rt = /\?/;Ce.parseXML = function (t) {
    var s;if (!t || 'string' !== typeof t) return null;try {
      s = new e.DOMParser().parseFromString(t, 'text/xml');
    } catch (t) {
      s = void 0;
    }return (!s || s.getElementsByTagName('parsererror').length) && Ce.error('Invalid XML: ' + t), s;
  };var Dt = /\[\]$/,
      jt = /\r?\n/g,
      Ot = /^(?:submit|button|image|reset|file)$/i,
      Vt = /^(?:input|select|textarea|keygen)/i;Ce.param = function (e, t) {
    var n = [],
        s = function s(e, t) {
      var s = Ie(t) ? t() : t;n[n.length] = encodeURIComponent(e) + '=' + encodeURIComponent(null == s ? '' : s);
    },
        a;if (Array.isArray(e) || e.jquery && !Ce.isPlainObject(e)) Ce.each(e, function () {
      s(this.name, this.value);
    });else for (a in e) {
      Z(a, e[a], t, s);
    }return n.join('&');
  }, Ce.fn.extend({ serialize: function serialize() {
      return Ce.param(this.serializeArray());
    }, serializeArray: function serializeArray() {
      return this.map(function () {
        var e = Ce.prop(this, 'elements');return e ? Ce.makeArray(e) : this;
      }).filter(function () {
        var e = this.type;return this.name && !Ce(this).is(':disabled') && Vt.test(this.nodeName) && !Ot.test(e) && (this.checked || !et.test(e));
      }).map(function (e, t) {
        var s = Ce(this).val();return null == s ? null : Array.isArray(s) ? Ce.map(s, function (e) {
          return { name: t.name, value: e.replace(jt, '\r\n') };
        }) : { name: t.name, value: s.replace(jt, '\r\n') };
      }).get();
    } });var Ft = /%20/g,
      Bt = /#.*$/,
      Ht = /([?&])_=[^&]*/,
      qt = /^(.*?):[ \t]*([^\r\n]*)$/mg,
      Wt = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
      Gt = /^(?:GET|HEAD)$/,
      $t = /^\/\//,
      Xt = {},
      Kt = {},
      zt = '*/'.concat('*'),
      Jt = de.createElement('a');Jt.href = At.href, Ce.extend({ active: 0, lastModified: {}, etag: {}, ajaxSettings: { url: At.href, type: 'GET', isLocal: Wt.test(At.protocol), global: !0, processData: !0, async: !0, contentType: 'application/x-www-form-urlencoded; charset=UTF-8', accepts: { "*": zt, text: 'text/plain', html: 'text/html', xml: 'application/xml, text/xml', json: 'application/json, text/javascript' }, contents: { xml: /\bxml\b/, html: /\bhtml/, json: /\bjson\b/ }, responseFields: { xml: 'responseXML', text: 'responseText', json: 'responseJSON' }, converters: { "* text": String, "text html": !0, "text json": JSON.parse, "text xml": Ce.parseXML }, flatOptions: { url: !0, context: !0 } }, ajaxSetup: function ajaxSetup(e, t) {
      return t ? se(se(e, Ce.ajaxSettings), t) : se(Ce.ajaxSettings, e);
    }, ajaxPrefilter: ee(Xt), ajaxTransport: ee(Kt), ajax: function ajax(t, n) {
      function a(t, n, a, i) {
        var u = n,
            p,
            g,
            b,
            v,
            _;I || (I = !0, x && e.clearTimeout(x), h = void 0, f = i || '', m.readyState = 0 < t ? 4 : 0, p = 200 <= t && 300 > t || 304 === t, a && (v = ne(o, m, a)), v = ae(o, v, m, p), p ? (o.ifModified && (_ = m.getResponseHeader('Last-Modified'), _ && (Ce.lastModified[y] = _), _ = m.getResponseHeader('etag'), _ && (Ce.etag[y] = _)), 204 === t || 'HEAD' === o.type ? u = 'nocontent' : 304 === t ? u = 'notmodified' : (u = v.state, g = v.data, b = v.error, p = !b)) : (b = u, (t || !u) && (u = 'error', 0 > t && (t = 0))), m.status = t, m.statusText = (n || u) + '', p ? l.resolveWith(s, [g, u, m]) : l.rejectWith(s, [m, u, b]), m.statusCode(c), c = void 0, S && r.trigger(p ? 'ajaxSuccess' : 'ajaxError', [m, o, p ? g : b]), d.fireWith(s, [m, u]), S && (r.trigger('ajaxComplete', [m, o]), ! --Ce.active && Ce.event.trigger('ajaxStop')));
      }'object' === ('undefined' === typeof t ? 'undefined' : babelHelpers['typeof'](t)) && (n = t, t = void 0), n = n || {};var o = Ce.ajaxSetup({}, n),
          s = o.context || o,
          r = o.context && (s.nodeType || s.jquery) ? Ce(s) : Ce.event,
          l = Ce.Deferred(),
          d = Ce.Callbacks('once memory'),
          c = o.statusCode || {},
          u = {},
          p = {},
          g = 'canceled',
          m = { readyState: 0, getResponseHeader: function getResponseHeader(e) {
          var t;if (I) {
            if (!b) for (b = {}; t = qt.exec(f);) {
              b[t[1].toLowerCase()] = t[2];
            }t = b[e.toLowerCase()];
          }return null == t ? null : t;
        }, getAllResponseHeaders: function getAllResponseHeaders() {
          return I ? f : null;
        }, setRequestHeader: function setRequestHeader(e, t) {
          return null == I && (e = p[e.toLowerCase()] = p[e.toLowerCase()] || e, u[e] = t), this;
        }, overrideMimeType: function overrideMimeType(e) {
          return null == I && (o.mimeType = e), this;
        }, statusCode: function statusCode(e) {
          if (e) if (I) m.always(e[m.status]);else for (var t in e) {
            c[t] = [c[t], e[t]];
          }return this;
        }, abort: function abort(e) {
          var t = e || g;return h && h.abort(t), a(0, t), this;
        } },
          h,
          y,
          f,
          b,
          x,
          v,
          I,
          S,
          _,
          i;if (l.promise(m), o.url = ((t || o.url || At.href) + '').replace($t, At.protocol + '//'), o.type = n.method || n.type || o.method || o.type, o.dataTypes = (o.dataType || '*').toLowerCase().match(je) || [''], null == o.crossDomain) {
        v = de.createElement('a');try {
          v.href = o.url, v.href = v.href, o.crossDomain = Jt.protocol + '//' + Jt.host !== v.protocol + '//' + v.host;
        } catch (t) {
          o.crossDomain = !0;
        }
      }if (o.data && o.processData && 'string' !== typeof o.data && (o.data = Ce.param(o.data, o.traditional)), te(Xt, o, n, m), I) return m;for (_ in S = Ce.event && o.global, S && 0 === Ce.active++ && Ce.event.trigger('ajaxStart'), o.type = o.type.toUpperCase(), o.hasContent = !Gt.test(o.type), y = o.url.replace(Bt, ''), o.hasContent ? o.data && o.processData && 0 === (o.contentType || '').indexOf('application/x-www-form-urlencoded') && (o.data = o.data.replace(Ft, '+')) : (i = o.url.slice(y.length), o.data && (o.processData || 'string' === typeof o.data) && (y += (Rt.test(y) ? '&' : '?') + o.data, delete o.data), !1 === o.cache && (y = y.replace(Ht, '$1'), i = (Rt.test(y) ? '&' : '?') + '_=' + Ut++ + i), o.url = y + i), o.ifModified && (Ce.lastModified[y] && m.setRequestHeader('If-Modified-Since', Ce.lastModified[y]), Ce.etag[y] && m.setRequestHeader('If-None-Match', Ce.etag[y])), (o.data && o.hasContent && !1 !== o.contentType || n.contentType) && m.setRequestHeader('Content-Type', o.contentType), m.setRequestHeader('Accept', o.dataTypes[0] && o.accepts[o.dataTypes[0]] ? o.accepts[o.dataTypes[0]] + ('*' === o.dataTypes[0] ? '' : ', ' + zt + '; q=0.01') : o.accepts['*']), o.headers) {
        m.setRequestHeader(_, o.headers[_]);
      }if (o.beforeSend && (!1 === o.beforeSend.call(s, m, o) || I)) return m.abort();if (g = 'abort', d.add(o.complete), m.done(o.success), m.fail(o.error), h = te(Kt, o, n, m), !h) a(-1, 'No Transport');else {
        if (m.readyState = 1, S && r.trigger('ajaxSend', [m, o]), I) return m;o.async && 0 < o.timeout && (x = e.setTimeout(function () {
          m.abort('timeout');
        }, o.timeout));try {
          I = !1, h.send(u, a);
        } catch (t) {
          if (I) throw t;a(-1, t);
        }
      }return m;
    }, getJSON: function getJSON(e, t, s) {
      return Ce.get(e, t, s, 'json');
    }, getScript: function getScript(e, t) {
      return Ce.get(e, void 0, t, 'script');
    } }), Ce.each(['get', 'post'], function (e, t) {
    Ce[t] = function (e, s, n, a) {
      return Ie(s) && (a = a || n, n = s, s = void 0), Ce.ajax(Ce.extend({ url: e, type: t, dataType: a, data: s, success: n }, Ce.isPlainObject(e) && e));
    };
  }), Ce._evalUrl = function (e) {
    return Ce.ajax({ url: e, type: 'GET', dataType: 'script', cache: !0, async: !1, global: !1, throws: !0 });
  }, Ce.fn.extend({ wrapAll: function wrapAll(e) {
      var t;return this[0] && (Ie(e) && (e = e.call(this[0])), t = Ce(e, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && t.insertBefore(this[0]), t.map(function () {
        for (var e = this; e.firstElementChild;) {
          e = e.firstElementChild;
        }return e;
      }).append(this)), this;
    }, wrapInner: function wrapInner(e) {
      return Ie(e) ? this.each(function (t) {
        Ce(this).wrapInner(e.call(this, t));
      }) : this.each(function () {
        var t = Ce(this),
            s = t.contents();s.length ? s.wrapAll(e) : t.append(e);
      });
    }, wrap: function wrap(e) {
      var t = Ie(e);return this.each(function (s) {
        Ce(this).wrapAll(t ? e.call(this, s) : e);
      });
    }, unwrap: function unwrap(e) {
      return this.parent(e).not('body').each(function () {
        Ce(this).replaceWith(this.childNodes);
      }), this;
    } }), Ce.expr.pseudos.hidden = function (e) {
    return !Ce.expr.pseudos.visible(e);
  }, Ce.expr.pseudos.visible = function (e) {
    return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
  }, Ce.ajaxSettings.xhr = function () {
    try {
      return new e.XMLHttpRequest();
    } catch (t) {}
  };var Yt = { 0: 200, 1223: 204 },
      Qt = Ce.ajaxSettings.xhr();ve.cors = !!Qt && 'withCredentials' in Qt, ve.ajax = Qt = !!Qt, Ce.ajaxTransport(function (t) {
    var _s2, n;if (ve.cors || Qt && !t.crossDomain) return { send: function send(a, o) {
        var r = t.xhr(),
            l;if (r.open(t.type, t.url, t.async, t.username, t.password), t.xhrFields) for (l in t.xhrFields) {
          r[l] = t.xhrFields[l];
        }for (l in t.mimeType && r.overrideMimeType && r.overrideMimeType(t.mimeType), t.crossDomain || a['X-Requested-With'] || (a['X-Requested-With'] = 'XMLHttpRequest'), a) {
          r.setRequestHeader(l, a[l]);
        }_s2 = function s(e) {
          return function () {
            _s2 && (_s2 = n = r.onload = r.onerror = r.onabort = r.ontimeout = r.onreadystatechange = null, 'abort' === e ? r.abort() : 'error' === e ? 'number' === typeof r.status ? o(r.status, r.statusText) : o(0, 'error') : o(Yt[r.status] || r.status, r.statusText, 'text' !== (r.responseType || 'text') || 'string' !== typeof r.responseText ? { binary: r.response } : { text: r.responseText }, r.getAllResponseHeaders()));
          };
        }, r.onload = _s2(), n = r.onerror = r.ontimeout = _s2('error'), void 0 === r.onabort ? r.onreadystatechange = function () {
          4 === r.readyState && e.setTimeout(function () {
            _s2 && n();
          });
        } : r.onabort = n, _s2 = _s2('abort');try {
          r.send(t.hasContent && t.data || null);
        } catch (t) {
          if (_s2) throw t;
        }
      }, abort: function abort() {
        _s2 && _s2();
      } };
  }), Ce.ajaxPrefilter(function (e) {
    e.crossDomain && (e.contents.script = !1);
  }), Ce.ajaxSetup({ accepts: { script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript' }, contents: { script: /\b(?:java|ecma)script\b/ }, converters: { "text script": function textScript(e) {
        return Ce.globalEval(e), e;
      } } }), Ce.ajaxPrefilter('script', function (e) {
    void 0 === e.cache && (e.cache = !1), e.crossDomain && (e.type = 'GET');
  }), Ce.ajaxTransport('script', function (e) {
    if (e.crossDomain) {
      var t, _s3;return { send: function send(n, a) {
          t = Ce('<script>').prop({ charset: e.scriptCharset, src: e.url }).on('load error', _s3 = function s(e) {
            t.remove(), _s3 = null, e && a('error' === e.type ? 404 : 200, e.type);
          }), de.head.appendChild(t[0]);
        }, abort: function abort() {
          _s3 && _s3();
        } };
    }
  });var Zt = [],
      es = /(=)\?(?=&|$)|\?\?/;Ce.ajaxSetup({ jsonp: 'callback', jsonpCallback: function jsonpCallback() {
      var e = Zt.pop() || Ce.expando + '_' + Ut++;return this[e] = !0, e;
    } }), Ce.ajaxPrefilter('json jsonp', function (t, s, n) {
    var a = !1 !== t.jsonp && (es.test(t.url) ? 'url' : 'string' === typeof t.data && 0 === (t.contentType || '').indexOf('application/x-www-form-urlencoded') && es.test(t.data) && 'data'),
        o,
        r,
        l;if (a || 'jsonp' === t.dataTypes[0]) return o = t.jsonpCallback = Ie(t.jsonpCallback) ? t.jsonpCallback() : t.jsonpCallback, a ? t[a] = t[a].replace(es, '$1' + o) : !1 !== t.jsonp && (t.url += (Rt.test(t.url) ? '&' : '?') + t.jsonp + '=' + o), t.converters['script json'] = function () {
      return l || Ce.error(o + ' was not called'), l[0];
    }, t.dataTypes[0] = 'json', r = e[o], e[o] = function () {
      l = arguments;
    }, n.always(function () {
      void 0 === r ? Ce(e).removeProp(o) : e[o] = r, t[o] && (t.jsonpCallback = s.jsonpCallback, Zt.push(o)), l && Ie(r) && r(l[0]), l = r = void 0;
    }), 'script';
  }), ve.createHTMLDocument = function () {
    var e = de.implementation.createHTMLDocument('').body;return e.innerHTML = '<form></form><form></form>', 2 === e.childNodes.length;
  }(), Ce.parseHTML = function (e, t, s) {
    if ('string' !== typeof e) return [];'boolean' === typeof t && (s = t, t = !1);var n, a, o;return (t || (ve.createHTMLDocument ? (t = de.implementation.createHTMLDocument(''), n = t.createElement('base'), n.href = de.location.href, t.head.appendChild(n)) : t = de), a = Ee.exec(e), o = !s && [], a) ? [t.createElement(a[1])] : (a = _([e], t, o), o && o.length && Ce(o).remove(), Ce.merge([], a.childNodes));
  }, Ce.fn.load = function (e, t, s) {
    var n = this,
        a = e.indexOf(' '),
        o,
        r,
        l;return -1 < a && (o = J(e.slice(a)), e = e.slice(0, a)), Ie(t) ? (s = t, t = void 0) : t && 'object' === ('undefined' === typeof t ? 'undefined' : babelHelpers['typeof'](t)) && (r = 'POST'), 0 < n.length && Ce.ajax({ url: e, type: r || 'GET', dataType: 'html', data: t }).done(function (e) {
      l = arguments, n.html(o ? Ce('<div>').append(Ce.parseHTML(e)).find(o) : e);
    }).always(s && function (e, t) {
      n.each(function () {
        s.apply(this, l || [e.responseText, t, e]);
      });
    }), this;
  }, Ce.each(['ajaxStart', 'ajaxStop', 'ajaxComplete', 'ajaxError', 'ajaxSuccess', 'ajaxSend'], function (e, t) {
    Ce.fn[t] = function (e) {
      return this.on(t, e);
    };
  }), Ce.expr.pseudos.animated = function (e) {
    return Ce.grep(Ce.timers, function (t) {
      return e === t.elem;
    }).length;
  }, Ce.offset = { setOffset: function setOffset(e, t, s) {
      var n = Ce.css(e, 'position'),
          a = Ce(e),
          o = {},
          r,
          l,
          i,
          d,
          c,
          u,
          p;'static' === n && (e.style.position = 'relative'), c = a.offset(), i = Ce.css(e, 'top'), u = Ce.css(e, 'left'), p = ('absolute' === n || 'fixed' === n) && -1 < (i + u).indexOf('auto'), p ? (r = a.position(), d = r.top, l = r.left) : (d = parseFloat(i) || 0, l = parseFloat(u) || 0), Ie(t) && (t = t.call(e, s, Ce.extend({}, c))), null != t.top && (o.top = t.top - c.top + d), null != t.left && (o.left = t.left - c.left + l), 'using' in t ? t.using.call(e, o) : a.css(o);
    } }, Ce.fn.extend({ offset: function offset(e) {
      if (arguments.length) return void 0 === e ? this : this.each(function (t) {
        Ce.offset.setOffset(this, e, t);
      });var t = this[0],
          s,
          n;if (t) return t.getClientRects().length ? (s = t.getBoundingClientRect(), n = t.ownerDocument.defaultView, { top: s.top + n.pageYOffset, left: s.left + n.pageXOffset }) : { top: 0, left: 0 };
    }, position: function position() {
      if (this[0]) {
        var e = this[0],
            t = { top: 0, left: 0 },
            s,
            n,
            a;if ('fixed' === Ce.css(e, 'position')) n = e.getBoundingClientRect();else {
          for (n = this.offset(), a = e.ownerDocument, s = e.offsetParent || a.documentElement; s && (s === a.body || s === a.documentElement) && 'static' === Ce.css(s, 'position');) {
            s = s.parentNode;
          }s && s !== e && 1 === s.nodeType && (t = Ce(s).offset(), t.top += Ce.css(s, 'borderTopWidth', !0), t.left += Ce.css(s, 'borderLeftWidth', !0));
        }return { top: n.top - t.top - Ce.css(e, 'marginTop', !0), left: n.left - t.left - Ce.css(e, 'marginLeft', !0) };
      }
    }, offsetParent: function offsetParent() {
      return this.map(function () {
        for (var e = this.offsetParent; e && 'static' === Ce.css(e, 'position');) {
          e = e.offsetParent;
        }return e || ot;
      });
    } }), Ce.each({ scrollLeft: 'pageXOffset', scrollTop: 'pageYOffset' }, function (e, t) {
    var s = 'pageYOffset' === t;Ce.fn[e] = function (n) {
      return Fe(this, function (e, n, a) {
        var o;return Se(e) ? o = e : 9 === e.nodeType && (o = e.defaultView), void 0 === a ? o ? o[t] : e[n] : void (o ? o.scrollTo(s ? o.pageXOffset : a, s ? a : o.pageYOffset) : e[n] = a);
      }, e, n, arguments.length);
    };
  }), Ce.each(['top', 'left'], function (e, t) {
    Ce.cssHooks[t] = D(ve.pixelPosition, function (e, s) {
      if (s) return s = R(e, t), gt.test(s) ? Ce(e).position()[t] + 'px' : s;
    });
  }), Ce.each({ Height: 'height', Width: 'width' }, function (e, t) {
    Ce.each({ padding: 'inner' + e, content: t, "": 'outer' + e }, function (s, n) {
      Ce.fn[n] = function (a, o) {
        var r = arguments.length && (s || 'boolean' !== typeof a),
            l = s || (!0 === a || !0 === o ? 'margin' : 'border');return Fe(this, function (t, s, a) {
          var o;return Se(t) ? 0 === n.indexOf('outer') ? t['inner' + e] : t.document.documentElement['client' + e] : 9 === t.nodeType ? (o = t.documentElement, re(t.body['scroll' + e], o['scroll' + e], t.body['offset' + e], o['offset' + e], o['client' + e])) : void 0 === a ? Ce.css(t, s, l) : Ce.style(t, s, a, l);
        }, t, r ? a : void 0, r);
      };
    });
  }), Ce.each(['blur', 'focus', 'focusin', 'focusout', 'resize', 'scroll', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'change', 'select', 'submit', 'keydown', 'keypress', 'keyup', 'contextmenu'], function (e, t) {
    Ce.fn[t] = function (e, s) {
      return 0 < arguments.length ? this.on(t, null, e, s) : this.trigger(t);
    };
  }), Ce.fn.extend({ hover: function hover(e, t) {
      return this.mouseenter(e).mouseleave(t || e);
    } }), Ce.fn.extend({ bind: function bind(e, t, s) {
      return this.on(e, null, t, s);
    }, unbind: function unbind(e, t) {
      return this.off(e, null, t);
    }, delegate: function delegate(e, t, s, n) {
      return this.on(t, e, s, n);
    }, undelegate: function undelegate(e, t, s) {
      return 1 === arguments.length ? this.off(e, '**') : this.off(t, e || '**', s);
    } }), Ce.proxy = function (e, t) {
    var s, n, a;if ('string' === typeof t && (s = e[t], t = e, e = s), !!Ie(e)) return n = ue.call(arguments, 2), a = function a() {
      return e.apply(t || this, n.concat(ue.call(arguments)));
    }, a.guid = e.guid = e.guid || Ce.guid++, a;
  }, Ce.holdReady = function (e) {
    e ? Ce.readyWait++ : Ce.ready(!0);
  }, Ce.isArray = Array.isArray, Ce.parseJSON = JSON.parse, Ce.nodeName = o, Ce.isFunction = Ie, Ce.isWindow = Se, Ce.camelCase = m, Ce.type = n, Ce.now = Date.now, Ce.isNumeric = function (e) {
    var t = Ce.type(e);return ('number' === t || 'string' === t) && !isNaN(e - parseFloat(e));
  }, 'function' === typeof define && define.amd && define('jquery', [], function () {
    return Ce;
  });var ts = e.jQuery,
      ss = e.$;return Ce.noConflict = function (t) {
    return e.$ === Ce && (e.$ = ss), t && e.jQuery === Ce && (e.jQuery = ts), Ce;
  }, t || (e.jQuery = e.$ = Ce), Ce;
}), 'use notstrict', function (e) {
  e.stringify = function (e) {
    return JSON.stringify(e, function (e, t) {
      return t instanceof Function || 'function' == typeof t ? t.toString() : t instanceof RegExp ? '_PxEgEr_' + t : t;
    });
  }, e.parse = function (e, t) {
    var s = !!t && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;return JSON.parse(e, function (e, t) {
      var n;return 'string' == typeof t ? 8 > t.length ? t : (n = t.substring(0, 8), s && t.match(s) ? new Date(t) : 'function' === n ? eval('(' + t + ')') : '_PxEgEr_' === n ? eval(t.slice(8)) : t) : t;
    });
  }, e.clone = function (t, s) {
    return e.parse(e.stringify(t), s);
  };
}('undefined' === typeof exports ? window.jsonFn = {} : exports), !function (y) {
  'use notstrict';
  function b(e, s) {
    var n = (65535 & e) + (65535 & s);return (e >> 16) + (s >> 16) + (n >> 16) << 16 | 65535 & n;
  }function t(e, s) {
    return e << s | e >>> 32 - s;
  }function x(s, n, a, o, r, l) {
    return b(t(b(b(n, s), b(o, l)), r), a);
  }function r(e, s, n, a, r, l, i) {
    return x(s & n | ~s & a, e, s, r, l, i);
  }function o(e, s, t, n, a, r, l) {
    return x(s & n | t & ~n, e, s, a, r, l);
  }function u(e, s, t, n, a, o, r) {
    return x(s ^ t ^ n, e, s, a, o, r);
  }function c(e, s, t, n, a, r, l) {
    return x(t ^ (s | ~n), e, s, a, r, l);
  }function f(t, s) {
    t[s >> 5] |= 128 << s % 32, t[(s + 64 >>> 9 << 4) + 14] = s;var n = 1732584193,
        l = -271733879,
        p = -1732584194,
        g = 271733878,
        m,
        e,
        y,
        a,
        h;for (m = 0; m < t.length; m += 16) {
      e = n, y = l, a = p, h = g, n = r(n, l, p, g, t[m], 7, -680876936), g = r(g, n, l, p, t[m + 1], 12, -389564586), p = r(p, g, n, l, t[m + 2], 17, 606105819), l = r(l, p, g, n, t[m + 3], 22, -1044525330), n = r(n, l, p, g, t[m + 4], 7, -176418897), g = r(g, n, l, p, t[m + 5], 12, 1200080426), p = r(p, g, n, l, t[m + 6], 17, -1473231341), l = r(l, p, g, n, t[m + 7], 22, -45705983), n = r(n, l, p, g, t[m + 8], 7, 1770035416), g = r(g, n, l, p, t[m + 9], 12, -1958414417), p = r(p, g, n, l, t[m + 10], 17, -42063), l = r(l, p, g, n, t[m + 11], 22, -1990404162), n = r(n, l, p, g, t[m + 12], 7, 1804603682), g = r(g, n, l, p, t[m + 13], 12, -40341101), p = r(p, g, n, l, t[m + 14], 17, -1502002290), l = r(l, p, g, n, t[m + 15], 22, 1236535329), n = o(n, l, p, g, t[m + 1], 5, -165796510), g = o(g, n, l, p, t[m + 6], 9, -1069501632), p = o(p, g, n, l, t[m + 11], 14, 643717713), l = o(l, p, g, n, t[m], 20, -373897302), n = o(n, l, p, g, t[m + 5], 5, -701558691), g = o(g, n, l, p, t[m + 10], 9, 38016083), p = o(p, g, n, l, t[m + 15], 14, -660478335), l = o(l, p, g, n, t[m + 4], 20, -405537848), n = o(n, l, p, g, t[m + 9], 5, 568446438), g = o(g, n, l, p, t[m + 14], 9, -1019803690), p = o(p, g, n, l, t[m + 3], 14, -187363961), l = o(l, p, g, n, t[m + 8], 20, 1163531501), n = o(n, l, p, g, t[m + 13], 5, -1444681467), g = o(g, n, l, p, t[m + 2], 9, -51403784), p = o(p, g, n, l, t[m + 7], 14, 1735328473), l = o(l, p, g, n, t[m + 12], 20, -1926607734), n = u(n, l, p, g, t[m + 5], 4, -378558), g = u(g, n, l, p, t[m + 8], 11, -2022574463), p = u(p, g, n, l, t[m + 11], 16, 1839030562), l = u(l, p, g, n, t[m + 14], 23, -35309556), n = u(n, l, p, g, t[m + 1], 4, -1530992060), g = u(g, n, l, p, t[m + 4], 11, 1272893353), p = u(p, g, n, l, t[m + 7], 16, -155497632), l = u(l, p, g, n, t[m + 10], 23, -1094730640), n = u(n, l, p, g, t[m + 13], 4, 681279174), g = u(g, n, l, p, t[m], 11, -358537222), p = u(p, g, n, l, t[m + 3], 16, -722521979), l = u(l, p, g, n, t[m + 6], 23, 76029189), n = u(n, l, p, g, t[m + 9], 4, -640364487), g = u(g, n, l, p, t[m + 12], 11, -421815835), p = u(p, g, n, l, t[m + 15], 16, 530742520), l = u(l, p, g, n, t[m + 2], 23, -995338651), n = c(n, l, p, g, t[m], 6, -198630844), g = c(g, n, l, p, t[m + 7], 10, 1126891415), p = c(p, g, n, l, t[m + 14], 15, -1416354905), l = c(l, p, g, n, t[m + 5], 21, -57434055), n = c(n, l, p, g, t[m + 12], 6, 1700485571), g = c(g, n, l, p, t[m + 3], 10, -1894986606), p = c(p, g, n, l, t[m + 10], 15, -1051523), l = c(l, p, g, n, t[m + 1], 21, -2054922799), n = c(n, l, p, g, t[m + 8], 6, 1873313359), g = c(g, n, l, p, t[m + 15], 10, -30611744), p = c(p, g, n, l, t[m + 6], 15, -1560198380), l = c(l, p, g, n, t[m + 13], 21, 1309151649), n = c(n, l, p, g, t[m + 4], 6, -145523070), g = c(g, n, l, p, t[m + 11], 10, -1120210379), p = c(p, g, n, l, t[m + 2], 15, 718787259), l = c(l, p, g, n, t[m + 9], 21, -343485551), n = b(n, e), l = b(l, y), p = b(p, a), g = b(g, h);
    }return [n, l, p, g];
  }function i(e) {
    var s = '',
        n;for (n = 0; n < 32 * e.length; n += 8) {
      s += String.fromCharCode(255 & e[n >> 5] >>> n % 32);
    }return s;
  }function a(e) {
    var s = [],
        n;for (s[(e.length >> 2) - 1] = void 0, n = 0; n < s.length; n += 1) {
      s[n] = 0;
    }for (n = 0; n < 8 * e.length; n += 8) {
      s[n >> 5] |= (255 & e.charCodeAt(n / 8)) << n % 32;
    }return s;
  }function e(e) {
    return i(f(a(e), 8 * e.length));
  }function d(s, n) {
    var t = a(s),
        o = [],
        l = [],
        d,
        r;for (o[15] = l[15] = void 0, 16 < t.length && (t = f(t, 8 * s.length)), d = 0; 16 > d; d += 1) {
      o[d] = 909522486 ^ t[d], l[d] = 1549556828 ^ t[d];
    }return r = f(o.concat(a(n)), 512 + 8 * n.length), i(f(l.concat(r), 640));
  }function l(s) {
    var n = '0123456789abcdef',
        e = '',
        a,
        t;for (t = 0; t < s.length; t += 1) {
      a = s.charCodeAt(t), e += n.charAt(15 & a >>> 4) + n.charAt(15 & a);
    }return e;
  }function g(e) {
    return unescape(encodeURIComponent(e));
  }function h(t) {
    return e(g(t));
  }function m(e) {
    return l(h(e));
  }function p(e, s) {
    return d(g(e), g(s));
  }function s(e, s) {
    return l(p(e, s));
  }function n(e, n, t) {
    return n ? t ? p(n, e) : s(n, e) : t ? h(e) : m(e);
  }'object' == ('undefined' === typeof module ? 'undefined' : babelHelpers['typeof'](module)) && module.exports ? module.exports = n : y.md5 = n;
}(window), function () {
  'use notstrict';
  var e = Math.round,
      t = function t(e, _t2, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, _t2 || [])).next());
    });
  },
      s = function s(e, _s4) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = _s4.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      n;(function (e) {
    function n(t) {
      e.modules.globalObject.globals.availablePermissions = t.permissions;
    }function a(t) {
      for (var s = 0, n = e.modules.toExecuteNodes.always.documentStart, a; s < n.length; s++) {
        a = n[s].id, e.modules.CRMNodes.Running.executeNode(e.modules.crm.crmById.get(a), t);
      }for (var o = 0, r = e.modules.toExecuteNodes.onUrl.documentStart; o < r.length; o++) {
        var l = r[o],
            a = l.id,
            i = l.triggers;e.modules.URLParsing.matchesUrlSchemes(i, t.url) && e.modules.CRMNodes.Running.executeNode(e.modules.crm.crmById.get(a), t);
      }
    }function o(t, s) {
      return e.modules.storages.resources.get(s)[t] && e.modules.storages.resources.get(s)[t].matchesHashes ? e.modules.storages.urlDataPairs.get(e.modules.storages.resources.get(s)[t].sourceUrl).dataURI : null;
    }e.initModule = function (t) {
      e.modules = t;
    }, e.initGlobalFunctions = function () {
      function n(e) {
        return e.sort(function (e, t) {
          return new Date(e.timestamp).getTime() - new Date(t.timestamp).getTime();
        });
      }function a(e, t) {
        if ('' === t) return e;var s = new RegExp(t);return e.filter(function (e) {
          for (var t = 0; t < e.data.length; t++) {
            if ('function' !== typeof e.data[t] && 'object' !== babelHelpers['typeof'](e.data[t]) && s.test(e.data[t] + '')) return !0;
          }return !1;
        });
      }function o(t, s, o) {
        var r = [],
            l = e.modules.globalObject.globals.logging;if ('all' === t) for (var i in l) {
          l.hasOwnProperty(i) && 'filter' !== i && (r = r.concat(l[i].logMessages));
        } else {
          var d = l[t];r = d && d.logMessages || [];
        }return 'all' === s ? n(a(r, o)) : n(a(r.filter(function (e) {
          return e.tabId === s;
        }), o));
      }function r(e, t, s) {
        return this.id = 'ALL' === e || 0 === e ? 'all' : e, this.tab = 'ALL' === t || 0 === t ? 'all' : 'string' === typeof t && 'background' === t.toLowerCase() ? 0 : t, this.text = s ? s : '', o(this.id, this.tab, this.text);
      }var l = this,
          i = 'you can find it by calling window.getID("nodename") where nodename is the name of your node';window.debugNextScriptCall = function (t) {
        if (0 !== t && !t || 'number' !== typeof t) throw new Error('Please supply a valid node ID, ' + i);var s = e.modules.crm.crmByIdSafe.get(t);if (!s) throw new Error('There is no node with the node ID you supplied, ' + i);if ('script' !== s.type) throw new Error('The node you supplied is not of type script');console.log('Listening for next activation. Make sure the devtools of the tab on which you activate the script are open when you activate it'), -1 === e.modules.globalObject.globals.eventListeners.scriptDebugListeners.indexOf(t) && e.modules.globalObject.globals.eventListeners.scriptDebugListeners.push(t);
      }, window.debugBackgroundScript = function (t) {
        if (0 !== t && !t || 'number' !== typeof t) throw new Error('Please supply a valid node ID, ' + i);var s = e.modules.crm.crmByIdSafe.get(t);if (!s) throw new Error('There is no node with the node ID you supplied, ' + i);if ('script' !== s.type) throw new Error('The node you supplied is not of type script');if ('' === s.value.backgroundScript) throw new Error('Backgroundscript is empty (code is empty string)');e.modules.CRMNodes.Script.Background.createBackgroundPage(e.modules.crm.crmById.get(t), !0);
      }, window.getID = function (t) {
        t = t.toLowerCase();var s = [];e.modules.Util.iterateMap(e.modules.crm.crmById, function (e, n) {
          var a = n.name;a && ('script' !== n.type || t !== a.toLowerCase() || s.push({ id: e, node: n }));
        }), 0 === s.length ? window.logAsync(window.__('background_globalDeclarations_getID_noMatches')) : 1 === s.length ? window.logAsync(window.__('background_globalDeclarations_getID_oneMatch', s[0].id), s[0].node) : (window.logAsync(window.__('background_globalDeclarations_getID_multipleMatches')), s.forEach(function (e) {
          window.logAsync(window.__('crm_id') + ':', e.id, ', ' + window.__('crm_node') + ':', e.node);
        }));
      }, window.filter = function (t, s) {
        e.modules.globalObject.globals.logging.filter = { id: ~~t, tabId: s === void 0 ? null : ~~s };
      }, window._listenIds = function (t) {
        e.modules.Logging.Listeners.updateTabAndIdLists().then(function (s) {
          var n = s.ids;t(n), e.modules.listeners.ids.push(t);
        });
      }, window._listenTabs = function (t) {
        e.modules.Logging.Listeners.updateTabAndIdLists().then(function (s) {
          var n = s.tabs;t(n), e.modules.listeners.tabs.push(t);
        });
      }, window._listenLog = function (t, s) {
        var n = { id: 'all', tab: 'all', text: '', listener: t, update: function update(e, t, s) {
            return r.apply(n, [e, t, s]);
          }, index: e.modules.listeners.log.length };return s(n), e.modules.listeners.log.push(n), o('all', 'all', '');
      }, window._getIdsAndTabs = function (n, a, o) {
        return t(l, void 0, void 0, function () {
          var t, r;return s(this, function (s) {
            switch (s.label) {case 0:
                return t = o, r = { ids: e.modules.Logging.Listeners.getIds('background' === a ? 0 : a) }, [4, e.modules.Logging.Listeners.getTabs(n)];case 1:
                return t.apply(void 0, [(r.tabs = s.sent(), r)]), [2];}
          });
        });
      }, window._getCurrentTabIndex = function (t, s, n) {
        'background' === s ? n([0]) : n(e.modules.crmValues.tabData.get(s).nodes.get(t).map(function (e, t) {
          return t;
        }));
      };
    }, e.refreshPermissions = function () {
      return t(this, void 0, void 0, function () {
        var t, a, o;return s(this, function (s) {
          switch (s.label) {case 0:
              return window.chrome && window.chrome.permissions && (t = window.chrome.permissions, 'onRemoved' in t && 'onAdded' in t && (t.onRemoved.addListener(n), t.onAdded.addListener(n))), browserAPI.permissions ? [4, browserAPI.permissions.getAll()] : [3, 2];case 1:
              return o = s.sent(), [3, 3];case 2:
              o = { permissions: [] }, s.label = 3;case 3:
              return a = o, e.modules.globalObject.globals.availablePermissions = a.permissions, [2];}
        });
      });
    }, e.setHandlerFunction = function () {
      var n = this;window.createHandlerFunction = function (a) {
        return function (o) {
          return t(n, void 0, void 0, function () {
            var t, n, r, l, i, d;return s(this, function (s) {
              switch (s.label) {case 0:
                  return (t = e.modules.crmValues, n = t.tabData, r = t.nodeInstances, l = e.modules.Util.getLastItem(n.get(o.tabId).nodes.get(o.id)), !!l.port) ? [3, 1] : (e.modules.Util.compareArray(l.secretKey, o.key) && (delete l.secretKey, l.port = a, e.modules.Util.setMapDefault(r, o.id, new window.Map()), i = [], d = { id: o.tabId, tabIndex: n.get(o.tabId).nodes.get(o.id).length - 1 }, e.modules.Util.iterateMap(r.get(o.id), function (t) {
                    try {
                      n.get(t).nodes.get(o.id).forEach(function (s, n, a) {
                        t === o.tabId && n === a.length - 1 || (i.push({ id: t, tabIndex: n }), e.modules.Util.postMessage(s.port, { change: { type: 'added', value: d.id, tabIndex: d.tabIndex }, messageType: 'instancesUpdate' }));
                      });
                    } catch (s) {
                      r.get(o.id)['delete'](t);
                    }
                  }), e.modules.Util.setMapDefault(r.get(o.id), o.tabId, []), r.get(o.id).get(o.tabId).push({ hasHandler: !1 }), e.modules.Util.postMessage(a, { data: 'connected', instances: i, currentInstance: { id: d.id, tabIndex: d.tabIndex } })), [3, 3]);case 1:
                  return [4, e.modules.MessageHandling.handleCrmAPIMessage(o)];case 2:
                  s.sent(), s.label = 3;case 3:
                  return [2];}
            });
          });
        };
      };
    }, e.init = function () {
      function n(e) {
        var n = e.id;return t(this, void 0, void 0, function () {
          return s(this, function (e) {
            switch (e.label) {case 0:
                return [4, browserAPI.contextMenus.remove(n)['catch'](function () {})];case 1:
                return e.sent(), [2];}
          });
        });
      }function r(e, t) {
        for (var s = 0, n = e, a; s < n.length; s++) {
          a = n[s], a.enabled = t, a.children && r(a.children, t);
        }
      }function l(e, t) {
        for (var s in e) {
          if (e[s] && t[e[s].id]) return ~~s;
        }return Infinity;
      }function d(n, a, o) {
        return t(this, void 0, void 0, function () {
          var t, r, l;return s(this, function (s) {
            switch (s.label) {case 0:
                return t = a.id, a.enabled = !0, r = e.modules.crmValues.contextMenuInfoById.get(a.id).settings, a.node && 'stylesheet' === a.node.type && a.node.value.toggle && (r.checked = a.node.value.defaultOn), r.parentId = n, delete r.generatedId, [4, browserAPI.contextMenus.create(r)];case 1:
                return l = s.sent(), a.id = l, a.node && e.modules.crmValues.contextMenuIds.set(a.node.id, l), e.modules.crmValues.contextMenuInfoById.set(l, e.modules.crmValues.contextMenuInfoById.get(t)), e.modules.crmValues.contextMenuInfoById['delete'](t), e.modules.crmValues.contextMenuInfoById.get(l).enabled = !0, a.children ? [4, i(l, a.children, o)] : [3, 3];case 2:
                s.sent(), s.label = 3;case 3:
                return [2];}
          });
        });
      }function i(n, a, o) {
        return t(this, void 0, void 0, function () {
          var t, r, l;return s(this, function (s) {
            switch (s.label) {case 0:
                t = 0, r = a, s.label = 1;case 1:
                return t < r.length ? (l = r[t], (!o[l.id] || 'show' !== o[l.id].type) && o[l.id] ? [3, 3] : [4, d(n, l, o)]) : [3, 5];case 2:
                return s.sent(), [3, 4];case 3:
                e.modules.crmValues.contextMenuInfoById.get(l.id).enabled = !1, s.label = 4;case 4:
                return t++, [3, 1];case 5:
                return [2];}
          });
        });
      }function c(e, a, o) {
        return t(this, void 0, void 0, function () {
          var t, r, r, i, p, g, m, h;return s(this, function (s) {
            switch (s.label) {case 0:
                if (t = l(a, o), !(t < a.length)) return [3, 4];r = 0, s.label = 1;case 1:
                return r < t ? a[r].children && 0 < a[r].children.length ? [4, c(a[r].id, a[r].children, o)] : [3, 3] : [3, 4];case 2:
                s.sent(), s.label = 3;case 3:
                return r++, [3, 1];case 4:
                r = t, s.label = 5;case 5:
                return r < a.length ? o[a[r].id] ? 'hide' === o[a[r].id].type ? !1 === a[r].enabled ? [3, 20] : [4, u(a[r])] : [3, 7] : [3, 20] : [3, 21];case 6:
                return s.sent(), [3, 20];case 7:
                if (a[r].enabled) return [3, 20];i = [a[r]], p = r + 1, s.label = 8;case 8:
                return p < a.length ? o[a[p].id] ? 'hide' === o[a[p].id].type ? !1 === a[r].enabled ? [3, 15] : [4, u(a[p])] : [3, 10] : [3, 13] : [3, 16];case 9:
                return s.sent(), [3, 12];case 10:
                return i.push(a[p]), a[p].enabled ? [4, n(a[p])] : [3, 12];case 11:
                s.sent(), s.label = 12;case 12:
                return [3, 15];case 13:
                return a[p].enabled ? (i.push(a[p]), [4, n(a[p])]) : [3, 15];case 14:
                s.sent(), s.label = 15;case 15:
                return p++, [3, 8];case 16:
                g = 0, m = i, s.label = 17;case 17:
                return g < m.length ? (h = m[g], [4, d(e, h, o)]) : [3, 20];case 18:
                s.sent(), s.label = 19;case 19:
                return g++, [3, 17];case 20:
                return r++, [3, 5];case 21:
                return [2];}
          });
        });
      }function u(e) {
        return t(this, void 0, void 0, function () {
          return s(this, function (t) {
            switch (t.label) {case 0:
                return [4, n(e)];case 1:
                return t.sent(), e.enabled = !1, e.children && r(e.children, !1), [2];}
          });
        });
      }function p(e, t, s) {
        void 0 === t && (t = []), void 0 === s && (s = []);for (var n = 0; n < e.length; n++) {
          e[n] && ((e[n].enabled ? s : t).push(e[n]), p(e[n].children, t, s));
        }return { hiddenNodes: t, shownNodes: s };
      }function g(t, s) {
        return s.map(function (s) {
          var n = s.node,
              a = s.id;return null === n ? null : e.modules.crmValues.hideNodesOnPagesData.has(n.id) && e.modules.URLParsing.matchesUrlSchemes(e.modules.crmValues.hideNodesOnPagesData.get(n.id), t.url) ? { node: n, id: a, type: 'hide' } : null;
        }).filter(function (e) {
          return !!e;
        });
      }function m(t, s) {
        return s.map(function (s) {
          var n = s.node,
              a = s.id;return null === n ? null : e.modules.crmValues.hideNodesOnPagesData.has(n.id) && e.modules.URLParsing.matchesUrlSchemes(e.modules.crmValues.hideNodesOnPagesData.get(n.id), t.url) ? null : { node: n, id: a, type: 'show' };
        }).filter(function (e) {
          return !!e;
        }).filter(function (s) {
          var n = s.node;return !e.modules.crmValues.hideNodesOnPagesData.has(n.id) || !e.modules.URLParsing.matchesUrlSchemes(e.modules.crmValues.hideNodesOnPagesData.get(n.id), t.url);
        });
      }function h(t, s) {
        var n = e.modules.crmValues.nodeTabStatuses;return n.has(t) && n.get(t) ? n.get(t).tabs.has(s) && n.get(t).tabs.get(s) ? n.get(t).tabs.get(s).overrides : null : null;
      }function y() {
        return t(this, void 0, void 0, function () {
          var t, n;return s(this, function (s) {
            switch (s.label) {case 0:
                return [4, e.modules.Util.isTamperMonkeyEnabled()];case 1:
                return t = s.sent(), [4, e.modules.Util.isStylishInstalled()];case 2:
                return n = s.sent(), e.modules.storages.storageLocal && (e.modules.storages.storageLocal.useAsUserscriptInstaller = !t, e.modules.storages.storageLocal.useAsUserstylesInstaller = !n), browserAPI.storage.local.set({ useAsUserscriptInstaller: !t, useAsUserstylesInstaller: !n }), [2];}
          });
        });
      }function f() {
        return t(this, void 0, void 0, function () {
          return s(this, function (e) {
            switch (e.label) {case 0:
                return browserAPI.commands ? [4, browserAPI.commands.getAll()] : [3, 2];case 1:
                return [2, e.sent()];case 2:
                return [2, []];}
          });
        });
      }function b(e, t) {
        return void 0 === t && (t = []), 0 === e.length ? [t] : e.map(function (s, n) {
          var a = e.slice(0, n).concat(e.slice(n + 1)),
              o = t.concat([s]),
              r = b(a, o);return r;
        }).reduce(function (e, t) {
          return e.concat(t);
        }, []);
      }browserAPI.tabs.onUpdated.addListener(function (t, s, n) {
        s.status && 'loading' === s.status && s.url && e.modules.Util.canRunOnUrl(s.url) && a(n);
      }), browserAPI.tabs.onRemoved.addListener(function (t) {
        e.modules.Util.iterateMap(e.modules.crmValues.nodeTabStatuses, function (e, s) {
          s.tabs['delete'](t);
        });var s = [];e.modules.Util.iterateMap(e.modules.crmValues.nodeInstances, function (e, n) {
          n && n.has(t) && (s.push(e), n['delete'](t));
        });for (var n = 0; n < s.length; n++) {
          s[n].node && void 0 !== s[n].node.id && e.modules.crmValues.tabData.get(t).nodes.get(s[n].node.id).forEach(function (s) {
            e.modules.Util.postMessage(s.port, { change: { type: 'removed', value: t }, messageType: 'instancesUpdate' });
          });
        }e.modules.crmValues.tabData['delete'](t), e.modules.Logging.Listeners.updateTabAndIdLists();
      }), browserAPI.tabs.onHighlighted && browserAPI.tabs.onHighlighted.addListener(function (n) {
        return t(this, void 0, void 0, function () {
          var a = this,
              o,
              r,
              l,
              i,
              d,
              u,
              y,
              f;return s(this, function (b) {
            switch (b.label) {case 0:
                return o = n.tabIds[n.tabIds.length - 1], [4, browserAPI.tabs.get(o)['catch'](function (t) {
                  if (-1 < t.message.indexOf('No tab with id:')) {
                    if (1e3 < e.modules.storages.failedLookups.length) {
                      for (var s = 0; e.modules.storages.failedLookups.pop() && (s++, 500 !== s);) {}e.modules.storages.failedLookups.push('Cleaning up last 500 array items because size exceeded 1000...');
                    }e.modules.storages.failedLookups.push(o);
                  } else window.log(t.message);
                })];case 1:
                return (r = b.sent(), !r) ? [2] : (l = {}, i = p(e.modules.crmValues.contextMenuItemTree), d = i.shownNodes, u = i.hiddenNodes, g(r, d).concat(m(r, u)).forEach(function (e) {
                  var t = e.node,
                      s = e.id,
                      n = e.type;l[s] = { node: t, type: n };
                }), [4, c(e.modules.crmValues.rootId, e.modules.crmValues.contextMenuItemTree, l)]);case 2:
                return b.sent(), y = e.modules.crmValues.nodeTabStatuses, f = e.modules.crmValues.contextMenuIds, e.modules.Util.asyncIterateMap(y, function (n, r) {
                  var l = r.tabs,
                      i = r.defaultCheckedValue;return t(a, void 0, void 0, function () {
                    var t, a, r, d;return s(this, function (s) {
                      switch (s.label) {case 0:
                          return t = 'stylesheet' === e.modules.crm.crmById.get(n).type, a = l.get(o), r = t ? { checked: 'boolean' === typeof a ? a : i } : null, d = h(n, o), r || d ? [4, browserAPI.contextMenus.update(f.get(n), e.modules.Util.applyContextmenuOverride(r || {}, d || {}))['catch'](function (e) {
                            window.log(e.message);
                          })] : [2, !0];case 1:
                          return s.sent(), [2, void 0];}
                    });
                  });
                }), [2];}
          });
        });
      }), browserAPI.webRequest.onBeforeRequest.addListener(function (e) {
        var t = e.url.split('https://www.localhost.io/resource/')[1].split('/'),
            s = t[0],
            n = ~~t[1];return { redirectUrl: o(s, n) };
      }, { urls: ['https://www.localhost.io/resource/*'] }, ['blocking']), function () {
        var t = e.modules.globalObject.globals.eventListeners.notificationListeners;browserAPI.notifications && (browserAPI.notifications.onClicked.addListener(function (s) {
          var n = t.get(s);n && n.onClick !== void 0 && e.modules.globalObject.globals.sendCallbackMessage(n.tabId, n.tabIndex, n.id, { err: !1, args: [s], callbackId: n.onClick });
        }), browserAPI.notifications.onClosed.addListener(function (s, n) {
          var a = t.get(s);a && a.onDone !== void 0 && e.modules.globalObject.globals.sendCallbackMessage(a.tabId, a.tabIndex, a.id, { err: !1, args: [s, n], callbackId: a.onClick }), t['delete'](s);
        }));
      }(), function () {
        return t(this, void 0, void 0, function () {
          var e;return s(this, function (t) {
            switch (t.label) {case 0:
                return [4, y()];case 1:
                return t.sent(), window.chrome && window.chrome.management && (e = window.chrome.management, e.onInstalled.addListener(y), e.onEnabled.addListener(y), e.onUninstalled.addListener(y), e.onDisabled.addListener(y)), [2];}
          });
        });
      }(), function () {
        var n = this;if (browserAPI.commands) {
          var a = e.modules.globalObject.globals.eventListeners.shortcutListeners;browserAPI.commands.onCommand.addListener(function (e) {
            return t(n, void 0, void 0, function () {
              var t;return s(this, function (s) {
                switch (s.label) {case 0:
                    return [4, f()];case 1:
                    return t = s.sent(), t.forEach(function (t) {
                      if (t.name === e) {
                        var s = t.shortcut.toLowerCase(),
                            n = b(s.split('+'));n.forEach(function (e) {
                          var t = e.join('+');a.has(t) && a.get(t) && a.get(t).forEach(function (e) {
                            e.callback();
                          });
                        });
                      }
                    }), [2];}
              });
            });
          });
        }
      }(), function () {
        browserAPI.webRequest.onBeforeRequest.addListener(function (e) {
          return window.infoAsync(window.__('background_globalDeclarations_proxy_redirecting'), e), { redirectUrl: location.protocol + '//' + browserAPI.runtime.id + '/fonts/fonts.css' };
        }, { urls: ['*://fonts.googleapis.com/', '*://fonts.gstatic.com/'] });
      }();
    }, e.runAlwaysRunNodes = a, e.getResourceData = o, e.restoreOpenTabs = function () {
      return t(this, void 0, void 0, function () {
        var n = this,
            a;return s(this, function (o) {
          switch (o.label) {case 0:
              return [4, browserAPI.tabs.query({})];case 1:
              return a = o.sent(), 0 === a.length ? [2] : [4, window.Promise.all(a.map(function (a) {
                return t(n, void 0, void 0, function () {
                  var n = this,
                      o;return s(this, function (r) {
                    switch (r.label) {case 0:
                        return [4, Promise.race([e.modules.Util.iipe(function () {
                          return t(n, void 0, void 0, function () {
                            var t;return s(this, function (s) {
                              switch (s.label) {case 0:
                                  if (!e.modules.Util.canRunOnUrl(a.url)) return [3, 6];s.label = 1;case 1:
                                  return s.trys.push([1, 4,, 5]), [4, browserAPI.tabs.executeScript(a.id, { file: '/js/polyfills/browser.js' })];case 2:
                                  return s.sent(), [4, browserAPI.tabs.executeScript(a.id, { file: '/js/contentscript.js' })];case 3:
                                  return s.sent(), [2, 0];case 4:
                                  return t = s.sent(), [2, 1];case 5:
                                  return [3, 7];case 6:
                                  return [2, 2];case 7:
                                  return [2];}
                            });
                          });
                        }), new window.Promise(function (a) {
                          return t(n, void 0, void 0, function () {
                            return s(this, function (t) {
                              switch (t.label) {case 0:
                                  return [4, e.modules.Util.wait(2500)];case 1:
                                  return t.sent(), a(3), [2];}
                            });
                          });
                        })])];case 1:
                        return o = r.sent(), 0 === o ? window.logAsync(window.__('background_globalDeclarations_tabRestore_success', a.id)) : 1 === o ? window.logAsync(window.__('background_globalDeclarations_tabRestore_unknownError', a.id)) : 2 === o ? window.logAsync(window.__('background_globalDeclarations_tabRestore_ignored', a.id)) : 3 === o ? window.logAsync(window.__('background_globalDeclarations_tabRestore_frozen', a.id)) : void 0, [2];}
                  });
                });
              }))];case 2:
              return o.sent(), [2];}
        });
      });
    };
  })(n || (n = {}));var a = function a(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      o = function o(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      r;(function (e) {
    var t;(function (t) {
      function s(t, n, a) {
        var o = { type: n, callbackId: t.onFinish, messageType: 'callback', data: a };try {
          var r = e.modules.crmValues.tabData,
              l = r.get(t.tabId).nodes,
              i = l.get(t.id)[t.tabIndex].port;e.modules.Util.postMessage(i, o);
        } catch (n) {
          if ('Converting circular structure to JSON' === n.message) s(t, 'error', 'Converting circular structure to JSON, getting a response from this API will not work');else throw n;
        }
      }t.respond = s, t.sendMessage = function (t) {
        var n = t.data,
            a = e.modules.crmValues.tabData,
            o = a.get(n.toInstanceId),
            r = e.modules.crmValues.nodeInstances,
            l = r.get(n.id).get(n.toInstanceId);if (!(l && o && o.nodes.has(n.id))) s(t, 'error', 'instance no longer exists');else if (l[n.toTabIndex].hasHandler) {
          var i = o.nodes,
              d = i.get(n.id)[n.toTabIndex].port;e.modules.Util.postMessage(d, { messageType: 'instanceMessage', message: n.message }), s(t, 'success');
        } else s(t, 'error', 'no listener exists');
      }, t.changeStatus = function (t) {
        var s = e.modules.crmValues.nodeInstances,
            n = s.get(t.id).get(t.tabId);n[t.tabIndex].hasHandler = t.data.hasHandler;
      };
    })(t = e.Instances || (e.Instances = {}));
  })(r || (r = {})), function (e) {
    var t;(function (t) {
      t.send = function (t) {
        var s = t.message,
            n = t.response;e.modules.background.byId.get(t.id).post({ type: 'comm', message: { type: 'backgroundMessage', message: s, respond: n, tabId: t.tabId } });
      };
    })(t = e.BackgroundPageMessage || (e.BackgroundPageMessage = {}));
  }(r || (r = {})), function (e) {
    var t;(function (t) {
      t.listen = function (t) {
        return a(this, void 0, void 0, function () {
          var s, n;return o(this, function () {
            return s = t.data, n = e.modules.globalObject.globals.eventListeners, n.notificationListeners.set(s.notificationId, { id: s.id, tabId: s.tabId, tabIndex: s.tabIndex, notificationId: s.notificationId, onDone: s.onDone, onClick: s.onClick }), [2];
          });
        });
      };
    })(t = e.NotificationListener || (e.NotificationListener = {}));
  }(r || (r = {})), function (e) {
    function t(e) {
      return 'fetch' in window && void 0 !== window.fetch ? fetch(e).then(function (e) {
        return e.text();
      }) : new Promise(function (t, s) {
        var n = new window.XMLHttpRequest();n.open('GET', e), n.onreadystatechange = function () {
          4 === n.readyState && (200 <= n.status && 300 > n.status ? t(n.responseText) : s(n.status));
        }, n.send();
      });
    }function s(s) {
      var n = s.data.url;t(n).then(function (t) {
        e.modules.globalObject.globals.sendCallbackMessage(s.tabId, s.tabIndex, s.id, { err: !1, args: [!1, t], callbackId: s.data.onFinish });
      })['catch'](function (t) {
        e.modules.globalObject.globals.sendCallbackMessage(s.tabId, s.tabIndex, s.id, { err: !1, args: [!0, 'Failed with status ' + t], callbackId: s.data.onFinish });
      });
    }function n(t, n, r) {
      return a(this, void 0, void 0, function () {
        var a, l, i;return o(this, function (o) {
          switch (o.label) {case 0:
              return a = null, l = t.type, 'executeCRMCode' === l ? [3, 1] : 'getCRMHints' === l ? [3, 1] : 'createLocalLogVariable' === l ? [3, 1] : 'displayHints' === l ? [3, 2] : 'logCrmAPIValue' === l ? [3, 3] : 'resource' === l ? [3, 5] : 'anonymousLibrary' === l ? [3, 6] : 'updateStorage' === l ? [3, 7] : 'sendInstanceMessage' === l ? [3, 9] : 'sendBackgroundpageMessage' === l ? [3, 10] : 'respondToBackgroundMessage' === l ? [3, 11] : 'changeInstanceHandlerStatus' === l ? [3, 12] : 'addNotificationListener' === l ? [3, 13] : 'newTabCreated' === l ? [3, 15] : 'styleInstall' === l ? [3, 18] : 'updateStylesheet' === l ? [3, 20] : 'updateScripts' === l ? [3, 22] : 'installUserScript' === l ? [3, 24] : 'applyLocalStorage' === l ? [3, 26] : 'getStyles' === l ? [3, 27] : '_resetSettings' === l ? [3, 30] : 'fetch' === l ? [3, 32] : [3, 34];case 1:
              return e.modules.Logging.LogExecution.executeCRMCode(t.data, t.type), [3, 34];case 2:
              return e.modules.Logging.LogExecution.displayHints(t), [3, 34];case 3:
              return [4, e.modules.Logging.logHandler(t.data)];case 4:
              return o.sent(), [3, 34];case 5:
              return e.modules.Resources.Resource.handle(t.data), [3, 34];case 6:
              return e.modules.Resources.Anonymous.handle(t.data), [3, 34];case 7:
              return [4, e.modules.Storages.applyChanges(t.data)];case 8:
              return o.sent(), [3, 34];case 9:
              return e.Instances.sendMessage(t), [3, 34];case 10:
              return e.BackgroundPageMessage.send(t.data), [3, 34];case 11:
              return e.Instances.respond({ onFinish: t.data.response, tabIndex: t.data.tabIndex, id: t.data.id, tabId: t.data.tabId }, 'success', t.data.message), [3, 34];case 12:
              return e.Instances.changeStatus(t), [3, 34];case 13:
              return [4, e.NotificationListener.listen(t)];case 14:
              return o.sent(), [3, 34];case 15:
              return n && r ? (i = e.modules.crmValues.tabData.has(n.tab.id), e.modules.crmValues.tabData['delete'](n.tab.id), e.modules.crmValues.tabData.set(n.tab.id, { nodes: new window.Map(), libraries: new window.Map() }), [4, e.modules.CRMNodes.Running.executeScriptsForTab(n.tab.id, i)]) : [3, 17];case 16:
              a = o.sent(), o.label = 17;case 17:
              return [3, 34];case 18:
              return [4, e.modules.CRMNodes.Stylesheet.Installing.installStylesheet(t.data)];case 19:
              return o.sent(), [3, 34];case 20:
              return [4, e.modules.CRMNodes.Stylesheet.Updating.updateStylesheet(t.data.id)];case 21:
              return o.sent(), [3, 34];case 22:
              return [4, e.modules.CRMNodes.Script.Updating.updateScripts()];case 23:
              return a = o.sent(), [3, 34];case 24:
              return [4, e.modules.CRMNodes.Script.Updating.install(t.data)];case 25:
              return o.sent(), [3, 34];case 26:
              return localStorage.setItem(t.data.key, t.data.value), [3, 34];case 27:
              return n && r ? [4, e.modules.CRMNodes.Stylesheet.Installing.getInstalledStatus(t.data.url)] : [3, 29];case 28:
              a = o.sent(), o.label = 29;case 29:
              return [3, 34];case 30:
              return e.modules.Storages.clearStorages(), [4, e.modules.Storages.loadStorages()];case 31:
              return o.sent(), [3, 34];case 32:
              return [4, s(t)];case 33:
              o.sent(), o.label = 34;case 34:
              return r && r(a), [2];}
        });
      });
    }function r(e, t, s, a) {
      return n(e, t, s).then(function () {
        a && a(null);
      }), !0;
    }e.initModule = function (t) {
      e.modules = t;
    }, e.doFetch = t, e.backgroundFetch = s, e.handleRuntimeMessageInitial = r, e.handleCrmAPIMessage = function (t) {
      return a(this, void 0, void 0, function () {
        var s;return o(this, function (n) {
          switch (n.label) {case 0:
              return s = t.type, 'crmapi' === s ? [3, 1] : 'chrome' === s ? [3, 2] : 'browser' === s ? [3, 2] : [3, 4];case 1:
              return new e.modules.CRMAPICall.Instance(t, t.action), [3, 6];case 2:
              return [4, e.modules.BrowserHandler.handle(t)];case 3:
              return n.sent(), [3, 6];case 4:
              return [4, new Promise(function (e) {
                r(t, null, null, e);
              })];case 5:
              return n.sent(), [3, 6];case 6:
              return [2];}
        });
      });
    }, e.signalNewCRM = function () {
      return a(this, void 0, void 0, function () {
        var t, s;return o(this, function (n) {
          switch (n.label) {case 0:
              return [4, e.modules.CRMNodes.converToLegacy()];case 1:
              return t = n.sent(), s = e.modules.crmValues.tabData, e.modules.Util.iterateMap(s, function (s, n) {
                var a = n.nodes;e.modules.Util.iterateMap(a, function (s, n) {
                  n.forEach(function (n) {
                    if (n.usesLocalStorage && e.modules.crm.crmById.get(s).isLocal) try {
                      e.modules.Util.postMessage(n.port, { messageType: 'localStorageProxy', message: t });
                    } catch (t) {}
                  });
                });
              }), [2];}
        });
      });
    };
  }(r || (r = {}));var _l = function l() {
    return _l = Object.assign || function (e) {
      for (var t = 1, a = arguments.length, n; t < a; t++) {
        for (var s in n = arguments[t], n) {
          Object.prototype.hasOwnProperty.call(n, s) && (e[s] = n[s]);
        }
      }return e;
    }, _l.apply(this, arguments);
  },
      i = function i(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      d = function d(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      c;(function (e) {
    e.initModule = function (t, s) {
      e.modules = s;
    }, e._doesLibraryExist = function (t) {
      for (var s = 0, n = e.modules.storages.storageLocal.libraries, a; s < n.length; s++) {
        if (a = n[s].name, a.toLowerCase() === t.name.toLowerCase()) return a;
      }return !1;
    }, e._isAlreadyUsed = function (e, t) {
      for (var s = 0, n = e.value.libraries, a; s < n.length; s++) {
        if (a = n[s].name, a === (t.name || null)) return !0;
      }return !1;
    };
  })(c || (c = {})), function (e) {
    var t;(function (t) {
      function s(t, s, n, a, o) {
        o ? e.modules.Util.setMapDefault(e.modules.crmValues.contextMenuGlobalOverrides, t, {}) : e.modules.crmValues.nodeTabStatuses.has(t) ? e.modules.crmValues.nodeTabStatuses.get(t).tabs.has(s) ? !e.modules.crmValues.nodeTabStatuses.get(t).tabs.get(s).overrides && (e.modules.crmValues.nodeTabStatuses.get(t).tabs.get(s).overrides = {}) : e.modules.crmValues.nodeTabStatuses.get(t).tabs.set(s, { overrides: {} }) : e.modules.crmValues.nodeTabStatuses.set(t, { tabs: new window.Map([[s, { overrides: {} }]]) });var r = o ? e.modules.crmValues.contextMenuGlobalOverrides.get(t) : e.modules.crmValues.nodeTabStatuses.get(t).tabs.get(s).overrides;for (var l in n) {
          var i = l;r[i] = n[i];
        }var d = e.modules.crmValues.contextMenuIds.get(t);d && browserAPI.contextMenus.update(d, a)['catch'](function () {});
      }t.setType = function (e) {
        e.typeCheck([{ val: 'itemType', type: 'string' }, { val: 'allTabs', type: 'boolean', optional: !0 }], function () {
          var t = e.message.data,
              n = t.itemType,
              a = t.allTabs;return -1 === ['normal', 'checkbox', 'radio', 'separator'].indexOf(n) ? void e.respondError('Item type is not one of "normal", "checkbox", "radio" or"separator"') : void (s(e.message.id, e.message.tabId, { type: n }, { type: n }, void 0 !== a && a), e.respondSuccess(null));
        });
      }, t.setChecked = function (t) {
        t.typeCheck([{ val: 'checked', type: 'boolean' }, { val: 'allTabs', type: 'boolean', optional: !0 }], function () {
          var n = t.message.data,
              a = n.checked,
              o = n.allTabs,
              r = e.modules.crmValues.contextMenuGlobalOverrides.get(t.message.id),
              i = e.modules.crmValues.nodeTabStatuses.get(t.message.id) && e.modules.crmValues.nodeTabStatuses.get(t.message.id).tabs.get(t.message.tabId) && e.modules.crmValues.nodeTabStatuses.get(t.message.id).tabs.get(t.message.tabId).overrides || {},
              d = _l({}, r, i),
              c = 'checkbox' !== d.type && 'radio' !== d.type,
              u = _l({ checked: a }, c ? { type: 'checkbox' } : {});s(t.message.id, t.message.tabId, u, u, void 0 !== o && o), t.respondSuccess(null);
        });
      }, t.setContentTypes = function (e) {
        e.typeCheck([{ val: 'contentTypes', type: 'array' }, { val: 'allTabs', type: 'boolean', optional: !0 }], function () {
          for (var t = e.message.data, n = t.contentTypes, a = t.allTabs, o = void 0 !== a && a, r = ['page', 'link', 'selection', 'image', 'video', 'audio'], l = 0, i = n, d; l < i.length; l++) {
            if (d = i[l], -1 === r.indexOf(d)) return void e.respondError('Not all content types are one of "page", "link", "selection", "image", "video", "audio"');
          }s(e.message.id, e.message.tabId, { contentTypes: n }, { contexts: n }, o), e.respondSuccess(null);
        });
      }, t.setVisibility = function (t) {
        t.typeCheck([{ val: 'isVisible', type: 'boolean' }, { val: 'allTabs', type: 'boolean', optional: !0 }], function () {
          t.getNodeFromId(t.message.id).run(function (n) {
            var a = t.message.data,
                o = a.isVisible,
                r = a.allTabs;return 1 === n.value.launchMode || 2 === n.value.launchMode || 4 === n.value.launchMode ? void t.respondError('A node that is not shown by default can not change its hidden status') : void (s(t.message.id, t.message.tabId, { isVisible: o }, 'chrome' === BrowserAPI.getBrowser() && 62 <= e.modules.Util.getChromeVersion() ? { visible: o } : {}, void 0 !== r && r), t.respondSuccess(null));
          });
        });
      }, t.setDisabled = function (e) {
        e.typeCheck([{ val: 'isDisabled', type: 'boolean' }, { val: 'allTabs', type: 'boolean', optional: !0 }], function () {
          var t = e.message.data,
              n = t.isDisabled,
              a = t.allTabs;s(e.message.id, e.message.tabId, { isDisabled: n }, { enabled: !n }, void 0 !== a && a), e.respondSuccess(null);
        });
      }, t.setName = function (e) {
        e.checkPermissions(['crmContextmenu'], function () {
          e.typeCheck([{ val: 'name', type: 'string' }, { val: 'allTabs', type: 'boolean', optional: !0 }], function () {
            var t = e.message.data,
                n = t.name,
                a = t.allTabs;s(e.message.id, e.message.tabId, { name: n }, { title: n }, void 0 !== a && a), e.respondSuccess(null);
          });
        });
      }, t.resetName = function (e) {
        e.typeCheck([{ val: 'itemType', type: 'string' }, { val: 'allTabs', type: 'boolean', optional: !0 }], function () {
          e.getNodeFromId(e.message.data.nodeId).run(function (t) {
            var n = e.message.data.allTabs;s(e.message.id, e.message.tabId, { name: t.name }, { title: t.name }, void 0 !== n && n), e.respondSuccess(null);
          });
        });
      };
    })(t = e.contextMenuItem || (e.contextMenuItem = {}));
  }(c || (c = {})), function (e) {
    var t;(function (t) {
      t.getRootContextMenuId = function (t) {
        t.respondSuccess(e.modules.crmValues.rootId);
      }, t.getTree = function (t) {
        t.checkPermissions(['crmGet'], function () {
          t.respondSuccess(e.modules.crm.safeTree);
        });
      }, t.getSubTree = function (t) {
        t.checkPermissions(['crmGet'], function () {
          var s = t.message.data.nodeId;if ('number' === typeof s) {
            var n = e.modules.crm.crmByIdSafe.get(s);n ? t.respondSuccess([n]) : t.respondError('There is no node with id ' + s);
          } else t.respondError('No nodeId supplied');
        });
      }, t.getNode = function (t) {
        t.checkPermissions(['crmGet'], function () {
          var s = t.message.data.nodeId;if ('number' === typeof s) {
            var n = e.modules.crm.crmByIdSafe.get(s);n ? t.respondSuccess(n) : t.respondError('There is no node with id ' + s);
          } else t.respondError('No nodeId supplied');
        });
      }, t.getNodeIdFromPath = function (t) {
        t.checkPermissions(['crmGet'], function () {
          e.modules.CRMNodes.buildNodePaths(e.modules.crm.crmTree);var s = t.message.data.path,
              n = t.lookup(s, e.modules.crm.safeTree, !1);if (!0 === n) return !1;if (!1 === n) return t.respondError('Path does not return a valid value'), !1;var a = n;return t.respondSuccess(a.id), a.id;
        });
      }, t.queryCrm = function (t) {
        t.checkPermissions(['crmGet'], function () {
          t.typeCheck([{ val: 'query', type: 'object' }, { val: 'query.type', type: 'string', optional: !0 }, { val: 'query.inSubTree', type: 'number', optional: !0 }, { val: 'query.name', type: 'string', optional: !0 }], function (s) {
            var n = t.message.data.query,
                a = [];e.modules.Util.iterateMap(e.modules.crm.crmByIdSafe, function (e, t) {
              a.push(t);
            });var o = null;if (s['query.inSubTree']) {
              var r = t.getNodeFromId(n.inSubTree, !0, !0),
                  l = [];if (r) {
                l = r.children;
              }o = [], l.forEach(function (t) {
                e.modules.Util.flattenCrm(o, t);
              });
            }o = o || a;var i = o;s['query.type'] && (i = i.filter(function (e) {
              return e.type === n.type;
            })), s['query.name'] && (i = i.filter(function (e) {
              return e.name === n.name;
            })), i = i.filter(function (e) {
              return null !== e;
            }), t.respondSuccess(i);
          });
        });
      }, t.getParentNode = function (t) {
        t.checkPermissions(['crmGet'], function () {
          t.getNodeFromId(t.message.data.nodeId).run(function (s) {
            e.modules.CRMNodes.buildNodePaths(e.modules.crm.crmTree);var n = JSON.parse(JSON.stringify(s.path));if (n.pop(), 0 === n.length) t.respondSuccess(e.modules.crm.safeTree);else {
              var a = t.lookup(n, e.modules.crm.safeTree, !1);t.respondSuccess(a);
            }
          });
        });
      }, t.getNodeType = function (e) {
        e.checkPermissions(['crmGet'], function () {
          e.getNodeFromId(e.message.data.nodeId, !0).run(function (t) {
            e.respondSuccess(t.type);
          });
        });
      }, t.getNodeValue = function (e) {
        e.checkPermissions(['crmGet'], function () {
          e.getNodeFromId(e.message.data.nodeId, !0).run(function (t) {
            e.respondSuccess(t.value);
          });
        });
      }, t.createNode = function (t) {
        var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.typeCheck([{ val: 'options', type: 'object' }, { val: 'options.usesTriggers', type: 'boolean', optional: !0 }, { val: 'options.triggers', type: 'array', forChildren: [{ val: 'url', type: 'string' }], optional: !0 }, { val: 'options.linkData', type: 'array', forChildren: [{ val: 'url', type: 'string' }, { val: 'newTab', type: 'boolean', optional: !0 }], optional: !0 }, { val: 'options.scriptData', type: 'object', optional: !0 }, { dependency: 'options.scriptData', val: 'options.scriptData.script', type: 'string' }, { dependency: 'options.scriptData', val: 'options.scriptData.launchMode', type: 'number', optional: !0, min: 0, max: 3 }, { dependency: 'options.scriptData', val: 'options.scriptData.triggers', type: 'array', optional: !0, forChildren: [{ val: 'url', type: 'string' }] }, { dependency: 'options.scriptData', val: 'options.scriptData.libraries', type: 'array', optional: !0, forChildren: [{ val: 'name', type: 'string' }] }, { val: 'options.stylesheetData', type: 'object', optional: !0 }, { dependency: 'options.stylesheetData', val: 'options.stylesheetData.launchMode', type: 'number', min: 0, max: 3, optional: !0 }, { dependency: 'options.stylesheetData', val: 'options.stylesheetData.triggers', type: 'array', forChildren: [{ val: 'url', type: 'string' }], optional: !0 }, { dependency: 'options.stylesheetData', val: 'options.stylesheetData.toggle', type: 'boolean', optional: !0 }, { dependency: 'options.stylesheetData', val: 'options.stylesheetData.defaultOn', type: 'boolean', optional: !0 }, { val: 'options.value', type: 'object', optional: !0 }], function () {
            return i(s, void 0, void 0, function () {
              var s, n, a, o, r, i, c;return d(this, function (d) {
                switch (d.label) {case 0:
                    return [4, e.modules.Util.generateItemId()];case 1:
                    if (s = d.sent(), n = t.getNodeFromId(t.message.id, !1, !0), !n) return [2, !1];switch (a = n.nodeInfo, o = n.isLocal, r = _l({}, e.modules.CRMNodes.makeSafe(t.message.data.options), { id: s, isLocal: o, nodeInfo: a }), c = e.modules.constants.templates, t.message.data.options.type) {case 'script':
                        i = c.getDefaultScriptNode(r), i.type = 'script';break;case 'stylesheet':
                        i = c.getDefaultStylesheetNode(r), i.type = 'stylesheet';break;case 'menu':
                        i = c.getDefaultMenuNode(r), i.type = 'menu';break;case 'divider':
                        i = c.getDefaultDividerNode(r), i.type = 'divider';break;default:case 'link':
                        i = c.getDefaultLinkNode(r), i.type = 'link';}return [4, t.moveNode(i, t.message.data.options.position)];case 2:
                    return (i = d.sent()) ? [4, e.modules.CRMNodes.updateCrm([i.id])] : [3, 4];case 3:
                    return d.sent(), t.respondSuccess(t.getNodeFromId(i.id, !0, !0)), [3, 5];case 4:
                    t.respondError('Failed to place node'), d.label = 5;case 5:
                    return [2, !0];}
              });
            });
          });
        });
      }, t.copyNode = function (t) {
        var s = this;return t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.typeCheck([{ val: 'options', type: 'object' }, { val: 'options.name', type: 'string', optional: !0 }], function (n) {
            return t.getNodeFromId(t.message.data.nodeId, !0).run(function (a) {
              return i(s, void 0, void 0, function () {
                var s = this,
                    o,
                    r,
                    l,
                    c;return d(this, function (u) {
                  switch (u.label) {case 0:
                      return o = JSON.parse(JSON.stringify(a)), r = o, [4, e.modules.Util.generateItemId()];case 1:
                      return r.id = u.sent(), [4, e.modules.Util.crmForEachAsync(o.children || [], function (t) {
                        return i(s, void 0, void 0, function () {
                          var s;return d(this, function (n) {
                            switch (n.label) {case 0:
                                return s = t, [4, e.modules.Util.generateItemId()];case 1:
                                return s.id = n.sent(), delete t.storage, delete t.file, [2];}
                          });
                        });
                      })];case 2:
                      return u.sent(), l = t.getNodeFromId(t.message.id, !1, !0, !0), !0 === l.isLocal && !0 === a.isLocal ? (o.isLocal = !0, e.modules.Util.crmForEach(o.children || [], function (e) {
                        e.isLocal = !0;
                      })) : e.modules.Util.crmForEach(o.children || [], function (e) {
                        e.isLocal = !1;
                      }), o.nodeInfo = l.nodeInfo, delete o.storage, delete o.file, n['options.name'] && (o.name = t.message.data.options.name), [4, t.moveNode(o, t.message.data.options.position)];case 3:
                      return c = u.sent(), c && e.modules.CRMNodes.updateCrm([o.id]).then(function () {
                        t.respondSuccess(t.getNodeFromId(o.id, !0, !0));
                      }), [2, !0];}
                });
              });
            }), !0;
          });
        }), !0;
      }, t.moveNode = function (t) {
        var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.getNodeFromId(t.message.data.nodeId).run(function (n) {
            return i(s, void 0, void 0, function () {
              var s;return d(this, function (a) {
                switch (a.label) {case 0:
                    return e.modules.CRMNodes.buildNodePaths(e.modules.crm.crmTree), s = t.lookup(n.path, e.modules.crm.crmTree, !0), 'boolean' !== typeof s && s ? [4, t.moveNode(n, t.message.data.position, { children: s, id: n.id })] : (t.respondError('Something went wrong removing the source node'), [2]);case 1:
                    return (n = a.sent()) && e.modules.CRMNodes.updateCrm().then(function () {
                      t.respondSuccess(t.getNodeFromId(n.id, !0, !0));
                    }), [2];}
              });
            });
          });
        });
      }, t.deleteNode = function (t) {
        var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.getNodeFromId(t.message.data.nodeId).run(function (n) {
            return i(s, void 0, void 0, function () {
              var s;return d(this, function (a) {
                switch (a.label) {case 0:
                    return e.modules.CRMNodes.buildNodePaths(e.modules.crm.crmTree), s = t.lookup(n.path, e.modules.crm.crmTree, !0), s.splice(n.path[n.path.length - 1], 1), void 0 === e.modules.crmValues.contextMenuIds.get(n.id) ? [3, 3] : [4, browserAPI.contextMenus.remove(e.modules.crmValues.contextMenuIds.get(n.id))];case 1:
                    return a.sent(), [4, e.modules.CRMNodes.updateCrm([t.message.data.nodeId])];case 2:
                    return a.sent(), t.respondSuccess(!0), [3, 5];case 3:
                    return [4, e.modules.CRMNodes.updateCrm([t.message.data.nodeId])];case 4:
                    a.sent(), t.respondSuccess(!0), a.label = 5;case 5:
                    return [2];}
              });
            });
          });
        });
      }, t.editNode = function (t) {
        t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.typeCheck([{ val: 'options', type: 'object' }, { val: 'options.name', type: 'string', optional: !0 }, { val: 'options.type', type: 'string', optional: !0 }], function (s) {
            t.getNodeFromId(t.message.data.nodeId).run(function (n) {
              var a = t.message.data;if (s['options.type']) {
                if ('link' !== t.message.data.options.type && 'script' !== t.message.data.options.type && 'stylesheet' !== t.message.data.options.type && 'menu' !== t.message.data.options.type && 'divider' !== t.message.data.options.type) return t.respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider'), !1;var o = n.type.toLowerCase();n.type = t.message.data.options.type, 'menu' === o ? (n.menuVal = n.children, n.value = n[a.options.type + 'Val'] || {}) : (n[o + 'Val'] = n.value, n.value = n[a.options.type + 'Val'] || {}), 'menu' === n.type && (n.children = n.value || [], n.value = null);
              }return s['options.name'] && (n.name = t.message.data.options.name), e.modules.CRMNodes.updateCrm([t.message.id]).then(function () {
                t.respondSuccess(e.modules.Util.safe(n));
              }), !0;
            });
          });
        });
      }, t.getTriggers = function (e) {
        e.checkPermissions(['crmGet'], function () {
          e.getNodeFromId(e.message.data.nodeId).run(function (t) {
            e.respondSuccess(t.triggers);
          });
        });
      }, t.setTriggers = function (t) {
        var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.typeCheck([{ val: 'triggers', type: 'array', forChildren: [{ val: 'url', type: 'string' }] }], function () {
            t.getNodeFromId(t.message.data.nodeId).run(function (n) {
              return i(s, void 0, void 0, function () {
                var s, a, o, r, l, i, c, u, p, g, m, h, y;return d(this, function (d) {
                  switch (d.label) {case 0:
                      return s = t.message.data, a = s.triggers, n.showOnSpecified = !0, [4, e.modules.CRMNodes.updateCrm()];case 1:
                      if (d.sent(), o = [], e.modules.crmValues.hideNodesOnPagesData.set(n.id, []), ('script' === n.type || 'stylesheet' === n.type) && 2 === n.value.launchMode) {
                        for (r = 0, l = a; r < l.length; r++) {
                          if (i = l[r], c = e.modules.URLParsing.validatePatternUrl(i.url), !c) return t.respondSuccess('Triggers don\'t match URL scheme'), [2];
                        }
                      } else for (u = ('script' === n.type || 'stylesheet' === n.type) && 2 === n.value.launchMode, p = 0, g = a; p < g.length; p++) {
                        if (m = g[p], h = m.url, y = m.not, !e.modules.URLParsing.triggerMatchesScheme(h)) return t.respondError('Triggers don\'t match URL scheme'), [2];h = e.modules.URLParsing.prepareTrigger(h), u && (y ? e.modules.crmValues.hideNodesOnPagesData.get(n.id).push({ not: !1, url: h }) : o.push(h));
                      }return n.triggers = a, 0 === o.length && (o[0] = '<all_urls>'), e.modules.crmValues.contextMenuIds.has(n.id) ? [4, browserAPI.contextMenus.update(e.modules.crmValues.contextMenuIds.get(n.id), { documentUrlPatterns: o })] : [3, 3];case 2:
                      d.sent(), d.label = 3;case 3:
                      return [4, e.modules.CRMNodes.updateCrm()];case 4:
                      return d.sent(), t.respondSuccess(e.modules.Util.safe(n)), [2];}
                });
              });
            });
          });
        });
      }, t.getTriggerUsage = function (e) {
        e.checkPermissions(['crmGet'], function () {
          e.getNodeFromId(e.message.data.nodeId).run(function (t) {
            'menu' === t.type || 'link' === t.type || 'divider' === t.type ? e.respondSuccess(t.showOnSpecified) : e.respondError('Node is not of right type, can only be menu, link or divider');
          });
        });
      }, t.setTriggerUsage = function (t) {
        var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.typeCheck([{ val: 'useTriggers', type: 'boolean' }], function () {
            var n = t.message.data;t.getNodeFromId(t.message.data.nodeId).run(function (a) {
              return i(s, void 0, void 0, function () {
                return d(this, function (s) {
                  switch (s.label) {case 0:
                      return 'menu' !== a.type && 'link' !== a.type && 'divider' !== a.type ? [3, 3] : (a.showOnSpecified = n.useTriggers, [4, e.modules.CRMNodes.updateCrm()]);case 1:
                      return s.sent(), e.modules.crmValues.contextMenuIds.has(a.id) && browserAPI.contextMenus.update(e.modules.crmValues.contextMenuIds.get(a.id), { documentUrlPatterns: ['<all_urls>'] }), [4, e.modules.CRMNodes.updateCrm()];case 2:
                      return s.sent(), t.respondSuccess(e.modules.Util.safe(a)), [3, 4];case 3:
                      t.respondError('Node is not of right type, can only be menu, link or divider'), s.label = 4;case 4:
                      return [2];}
                });
              });
            });
          });
        });
      }, t.getContentTypes = function (e) {
        e.checkPermissions(['crmGet'], function () {
          e.getNodeFromId(e.message.data.nodeId).run(function (t) {
            e.respondSuccess(t.onContentTypes);
          });
        });
      }, t.setContentType = function (t) {
        var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.typeCheck([{ val: 'index', type: ['number', 'string'], min: 0, max: 5 }, { val: 'value', type: 'boolean' }], function () {
            var n = t.message.data,
                a = ['page', 'link', 'selection', 'image', 'video', 'audio'];if ('string' === typeof n.index) {
              if (-1 === a.indexOf(n.index)) return void t.respondError('Index is not in index array ([page, link, selection, image, video, audio])');n.index = a.indexOf(n.index);
            }t.getNodeFromId(t.message.data.nodeId).run(function (a) {
              return i(s, void 0, void 0, function () {
                return d(this, function (s) {
                  switch (s.label) {case 0:
                      return a.onContentTypes[n.index] = n.value, [4, e.modules.CRMNodes.updateCrm()];case 1:
                      return s.sent(), [4, browserAPI.contextMenus.update(e.modules.crmValues.contextMenuIds.get(a.id), { contexts: e.modules.CRMNodes.getContexts(a.onContentTypes) })];case 2:
                      return s.sent(), [4, e.modules.CRMNodes.updateCrm()];case 3:
                      return s.sent(), t.respondSuccess(a.onContentTypes), [2];}
                });
              });
            });
          });
        });
      }, t.setContentTypes = function (t) {
        var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.typeCheck([{ val: 'contentTypes', type: 'array' }], function () {
            t.getNodeFromId(t.message.data.nodeId).run(function (n) {
              return i(s, void 0, void 0, function () {
                var s, a, o, r, l, c;return d(this, function (i) {
                  switch (i.label) {case 0:
                      if (s = t.message.data, 6 !== s.contentTypes.length) return t.respondError('Content type array is not of length 6'), [2, !1];for (a = 0, o = s.contentTypes; a < o.length; a++) {
                        if (r = o[a], 'boolean' !== typeof r) return t.respondError('Not all values in array contentTypes are of type string'), [2, !1];
                      }for (c in l = [!1, !1, !1, !1, !1, !1], s.contentTypes) {
                        l[c] = s.contentTypes[c];
                      }return n.onContentTypes = l, [4, browserAPI.contextMenus.update(e.modules.crmValues.contextMenuIds.get(n.id), { contexts: e.modules.CRMNodes.getContexts(n.onContentTypes) })];case 1:
                      return i.sent(), [4, e.modules.CRMNodes.updateCrm()];case 2:
                      return i.sent(), t.respondSuccess(e.modules.Util.safe(n)), [2, !0];}
                });
              });
            });
          });
        });
      }, t.setLaunchMode = function (t) {
        var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
          t.typeCheck([{ val: 'launchMode', type: 'number', min: 0, max: 4 }], function () {
            t.getNodeFromId(t.message.data.nodeId).run(function (n) {
              return i(s, void 0, void 0, function () {
                var s;return d(this, function (a) {
                  switch (a.label) {case 0:
                      if (s = t.message.data, 'script' === n.type || 'stylesheet' === n.type) n.value.launchMode = s.launchMode;else return t.respondError('Node is not of type script or stylesheet'), [2, !1];return [4, e.modules.CRMNodes.updateCrm()];case 1:
                      return a.sent(), t.respondSuccess(e.modules.Util.safe(n)), [2, !0];}
                });
              });
            });
          });
        });
      }, t.getLaunchMode = function (e) {
        e.checkPermissions(['crmGet'], function () {
          e.getNodeFromId(e.message.data.nodeId).run(function (t) {
            'script' === t.type || 'stylesheet' === t.type ? e.respondSuccess(t.value.launchMode) : e.respondError('Node is not of type script or stylesheet');
          });
        });
      };
    })(t = e.crm || (e.crm = {}));
  }(c || (c = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        t.setStylesheet = function (t) {
          var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
            t.typeCheck([{ val: 'stylesheet', type: 'string' }], function () {
              t.getNodeFromId(t.message.data.nodeId).run(function (n) {
                return i(s, void 0, void 0, function () {
                  var s;return d(this, function (a) {
                    switch (a.label) {case 0:
                        return s = t.message.data.stylesheet, 'stylesheet' === n.type ? n.value.stylesheet = s : (n.stylesheetVal = n.stylesheetVal || e.modules.constants.templates.getDefaultStylesheetValue(), n.stylesheetVal.stylesheet = s), [4, e.modules.CRMNodes.updateCrm()];case 1:
                        return a.sent(), t.respondSuccess(e.modules.Util.safe(n)), [2, !0];}
                  });
                });
              });
            });
          });
        }, t.getStylesheet = function (e) {
          e.checkPermissions(['crmGet'], function () {
            e.getNodeFromId(e.message.data.nodeId, !0).run(function (t) {
              'stylesheet' === t.type ? e.respondSuccess(t.value.stylesheet) : t.stylesheetVal ? e.respondSuccess(t.stylesheetVal.stylesheet) : e.respondSuccess(void 0);
            });
          });
        };
      })(s = t.stylesheet || (t.stylesheet = {}));
    })(t = e.crm || (e.crm = {}));
  }(c || (c = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        t.getLinks = function (e) {
          e.checkPermissions(['crmGet'], function () {
            e.getNodeFromId(e.message.data.nodeId).run(function (t) {
              return 'link' === t.type ? e.respondSuccess(t.value) : e.respondSuccess(t.linkVal), !0;
            });
          });
        }, t.setLinks = function (t) {
          t.checkPermissions(['crmGet', 'crmWrite'], function () {
            t.typeCheck([{ val: 'items', type: ['object', 'array'], forChildren: [{ val: 'newTab', type: 'boolean', optional: !0 }, { val: 'url', type: 'string' }] }], function () {
              t.getNodeFromId(t.message.data.nodeId).run(function (s) {
                var n = t.message.data,
                    a = n.items;if (Array.isArray(a)) {
                  'link' !== s.type && (s.linkVal = s.linkVal || []), s.value = [];for (var o = 0, r = a, l; o < r.length; o++) {
                    l = r[o], l.newTab = !!l.newTab, 'link' === s.type ? s.value.push(l) : (s.linkVal = s.linkVal || [], s.linkVal.push(l));
                  }
                } else {
                  if (a.newTab = !!a.newTab, !a.url) return t.respondError('For not all values in the array items is the property url defined'), !1;'link' === s.type ? s.value = [a] : s.linkVal = [a];
                }return e.modules.CRMNodes.updateCrm().then(function () {
                  'link' === s.type ? t.respondSuccess(e.modules.Util.safe(s).value) : t.respondSuccess(e.modules.Util.safe(s).linkVal);
                }), !0;
              });
            });
          });
        }, t.push = function (t) {
          t.checkPermissions(['crmGet', 'crmWrite'], function () {
            t.typeCheck([{ val: 'items', type: ['object', 'array'], forChildren: [{ val: 'newTab', type: 'boolean', optional: !0 }, { val: 'url', type: 'string' }] }], function () {
              t.getNodeFromId(t.message.data.nodeId).run(function (s) {
                var n = t.message.data,
                    a = n.items;if (Array.isArray(a)) {
                  'link' !== s.type && (s.linkVal = s.linkVal || []);for (var o = 0, r = a, l; o < r.length; o++) {
                    l = r[o], l.newTab = !!l.newTab, 'link' === s.type ? s.value.push(l) : (s.linkVal = s.linkVal || [], s.linkVal.push(l));
                  }
                } else {
                  if (a.newTab = !!a.newTab, !a.url) return t.respondError('For not all values in the array items is the property url defined'), !1;'link' === s.type ? s.value.push(a) : (s.linkVal = s.linkVal || [], s.linkVal.push(a));
                }return e.modules.CRMNodes.updateCrm().then(function () {
                  'link' === s.type ? t.respondSuccess(e.modules.Util.safe(s).value) : t.respondSuccess(e.modules.Util.safe(s).linkVal);
                }), !0;
              });
            });
          });
        }, t.splice = function (t) {
          var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
            t.getNodeFromId(t.message.data.nodeId).run(function (n) {
              t.typeCheck([{ val: 'start', type: 'number' }, { val: 'amount', type: 'number' }], function () {
                return i(s, void 0, void 0, function () {
                  var s, a;return d(this, function (o) {
                    switch (o.label) {case 0:
                        return (s = t.message.data, 'link' !== n.type) ? [3, 2] : (a = n.value.splice(s.start, s.amount), [4, e.modules.CRMNodes.updateCrm()]);case 1:
                        return o.sent(), t.respondSuccess({ spliced: a, newArr: e.modules.Util.safe(n).value }), [3, 4];case 2:
                        return n.linkVal = n.linkVal || [], a = n.linkVal.splice(s.start, s.amount), [4, e.modules.CRMNodes.updateCrm()];case 3:
                        o.sent(), t.respondSuccess({ spliced: a, newArr: e.modules.Util.safe(n).linkVal }), o.label = 4;case 4:
                        return [2];}
                  });
                });
              });
            });
          });
        };
      })(s = t.link || (t.link = {}));
    })(t = e.crm || (e.crm = {}));
  }(c || (c = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        t.setScript = function (t) {
          var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
            t.typeCheck([{ val: 'script', type: 'string' }], function () {
              var n = t.message.data.script;t.getNodeFromId(t.message.data.nodeId).run(function (a) {
                return i(s, void 0, void 0, function () {
                  return d(this, function (s) {
                    switch (s.label) {case 0:
                        return 'script' === a.type ? a.value.script = n : (a.scriptVal = a.scriptVal || e.modules.constants.templates.getDefaultScriptValue(), a.scriptVal.script = n), [4, e.modules.CRMNodes.updateCrm()];case 1:
                        return s.sent(), t.respondSuccess(e.modules.Util.safe(a)), [2, !0];}
                  });
                });
              });
            });
          });
        }, t.getScript = function (e) {
          e.checkPermissions(['crmGet'], function () {
            e.getNodeFromId(e.message.data.nodeId, !0).run(function (t) {
              'script' === t.type ? e.respondSuccess(t.value.script) : t.scriptVal ? e.respondSuccess(t.scriptVal.script) : e.respondSuccess(void 0);
            });
          });
        }, t.setBackgroundScript = function (t) {
          var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
            t.typeCheck([{ val: 'script', type: 'string' }], function () {
              var n = t.message.data.script;t.getNodeFromId(t.message.data.nodeId).run(function (a) {
                return i(s, void 0, void 0, function () {
                  return d(this, function (s) {
                    switch (s.label) {case 0:
                        return 'script' === a.type ? a.value.backgroundScript = n : (a.scriptVal = a.scriptVal || e.modules.constants.templates.getDefaultScriptValue(), a.scriptVal.backgroundScript = n), [4, e.modules.CRMNodes.updateCrm([t.message.data.nodeId])];case 1:
                        return s.sent(), t.respondSuccess(e.modules.Util.safe(a)), [2, !0];}
                  });
                });
              });
            });
          });
        }, t.getBackgroundScript = function (t) {
          var s = this;t.checkPermissions(['crmGet'], function () {
            t.getNodeFromId(t.message.data.nodeId, !0).run(function (n) {
              return i(s, void 0, void 0, function () {
                var s, a;return d(this, function (o) {
                  switch (o.label) {case 0:
                      return 'script' === n.type ? (a = (s = t).respondSuccess, [4, e.modules.Util.getScriptNodeScript(n, 'background')]) : [3, 2];case 1:
                      return a.apply(s, [o.sent()]), [3, 3];case 2:
                      n.scriptVal ? t.respondSuccess(n.scriptVal.backgroundScript) : t.respondSuccess(void 0), o.label = 3;case 3:
                      return [2];}
                });
              });
            });
          });
        };
      })(s = t.script || (t.script = {}));
    })(t = e.crm || (e.crm = {}));
  }(c || (c = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        var s;(function (t) {
          t.push = function (t) {
            var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
              t.typeCheck([{ val: 'libraries', type: ['object', 'array'], forChildren: [{ val: 'name', type: 'string' }] }, { val: 'libraries.name', type: 'string', optional: !0 }], function () {
                return i(s, void 0, void 0, function () {
                  var s = this,
                      n;return d(this, function () {
                    return n = t.message.data, t.getNodeFromId(t.message.data.nodeId).run(function (a) {
                      return i(s, void 0, void 0, function () {
                        var s, o, r, l, i, c;return d(this, function (d) {
                          switch (d.label) {case 0:
                              if ('script' !== a.type) return t.respondError('Node is not of type script'), [2, !1];if (s = n.libraries, Array.isArray(s)) for (o = 0, r = s; o < r.length; o++) {
                                if (l = r[o], i = l.name, !(l.name = e._doesLibraryExist(l))) return t.respondError('Library ' + i + ' is not registered'), [2, !1];e._isAlreadyUsed(a, l) || a.value.libraries.push(l);
                              } else {
                                if (c = s.name, !(s.name = e._doesLibraryExist(s))) return t.respondError('Library ' + c + ' is not registered'), [2, !1];e._isAlreadyUsed(a, s) || a.value.libraries.push(s);
                              }return [4, e.modules.CRMNodes.updateCrm()];case 1:
                              return d.sent(), t.respondSuccess(e.modules.Util.safe(a).value.libraries), [2, !0];}
                        });
                      });
                    }), [2];
                  });
                });
              });
            });
          }, t.splice = function (t) {
            var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
              t.typeCheck([{ val: 'start', type: 'number' }, { val: 'amount', type: 'number' }], function () {
                t.getNodeFromId(t.message.data.nodeId).run(function (n) {
                  return i(s, void 0, void 0, function () {
                    var s, a, o, r, l;return d(this, function (i) {
                      switch (i.label) {case 0:
                          return (s = t.message.data, a = s.start, o = s.amount, 'script' !== n.type) ? [3, 2] : (r = n.value.libraries, l = r.splice(a, o), [4, e.modules.CRMNodes.updateCrm()]);case 1:
                          return i.sent(), t.respondSuccess({ spliced: l, newArr: r }), [3, 3];case 2:
                          t.respondError('Node is not of type script'), i.label = 3;case 3:
                          return [2, !0];}
                    });
                  });
                });
              });
            });
          };
        })(s = t.libraries || (t.libraries = {}));
      })(s = t.script || (t.script = {}));
    })(t = e.crm || (e.crm = {}));
  }(c || (c = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        var s;(function (t) {
          t.push = function (t) {
            var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
              t.typeCheck([{ val: 'libraries', type: ['object', 'array'], forChildren: [{ val: 'name', type: 'string' }] }, { val: 'libraries.name', type: 'string', optional: !0 }], function () {
                t.getNodeFromId(t.message.data.nodeId).run(function (n) {
                  return i(s, void 0, void 0, function () {
                    var s, a, o, r, l, i, c;return d(this, function (d) {
                      switch (d.label) {case 0:
                          if (s = t.message.data, 'script' !== n.type) return t.respondError('Node is not of type script'), [2, !1];if (a = s.libraries, Array.isArray(a)) for (o = 0, r = a; o < r.length; o++) {
                            if (l = r[o], i = l.name, !(l.name = e._doesLibraryExist(l))) return t.respondError('Library ' + i + ' is not registered'), [2, !1];e._isAlreadyUsed(n, l) || n.value.backgroundLibraries.push(l);
                          } else {
                            if (c = a.name, !(a.name = e._doesLibraryExist(a))) return t.respondError('Library ' + c + ' is not registered'), [2, !1];e._isAlreadyUsed(n, a) || n.value.backgroundLibraries.push(a);
                          }return [4, e.modules.CRMNodes.updateCrm()];case 1:
                          return d.sent(), t.respondSuccess(e.modules.Util.safe(n).value.backgroundLibraries), [2, !0];}
                    });
                  });
                });
              });
            });
          }, t.splice = function (t) {
            var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
              t.typeCheck([{ val: 'start', type: 'number' }, { val: 'amount', type: 'number' }], function () {
                var n = t.message.data,
                    a = n.start,
                    o = n.amount;t.getNodeFromId(t.message.data.nodeId).run(function (n) {
                  return i(s, void 0, void 0, function () {
                    var s, r;return d(this, function (l) {
                      switch (l.label) {case 0:
                          return 'script' === n.type ? (s = n.value.backgroundLibraries, r = s.splice(a, o), [4, e.modules.CRMNodes.updateCrm([t.message.data.nodeId])]) : [3, 2];case 1:
                          return l.sent(), t.respondSuccess({ spliced: r, newArr: s }), [3, 3];case 2:
                          t.respondError('Node is not of type script'), l.label = 3;case 3:
                          return [2, !0];}
                    });
                  });
                });
              });
            });
          };
        })(s = t.backgroundLibraries || (t.backgroundLibraries = {}));
      })(s = t.script || (t.script = {}));
    })(t = e.crm || (e.crm = {}));
  }(c || (c = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        t.getChildren = function (e) {
          e.checkPermissions(['crmGet'], function () {
            e.getNodeFromId(e.message.data.nodeId, !0).run(function (t) {
              'menu' === t.type ? e.respondSuccess(t.children) : e.respondError('Node is not of type menu');
            });
          });
        }, t.setChildren = function (t) {
          var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
            t.typeCheck([{ val: 'childrenIds', type: 'array' }], function () {
              t.getNodeFromId(t.message.data.nodeId, !0).run(function (n) {
                return i(s, void 0, void 0, function () {
                  var s, a, o, r, l, i, c, r, u, p, g;return d(this, function (d) {
                    switch (d.label) {case 0:
                        if (e.modules.CRMNodes.buildNodePaths(e.modules.crm.crmTree), s = t.message.data.childrenIds, 'menu' !== n.type) return t.respondError('Node is not of type menu'), [2, !1];for (a = 0, o = s; a < o.length; a++) {
                          if (r = o[a], 'number' !== typeof r) return t.respondError('Not all values in array childrenIds are of type number'), [2, !1];
                        }l = n.children.length, i = 0, c = s, d.label = 1;case 1:
                        return i < c.length ? (r = c[i], u = t.getNodeFromId(r, !1, !0), !u) ? [2, !1] : (p = t.lookup(u.path, e.modules.crm.crmTree, !0), 'boolean' !== typeof p && p ? [4, t.moveNode(u, { relation: 'lastChild', node: t.message.data.nodeId }, { children: p, id: u.id })] : (t.respondError('Something went wrong removing the source node'), [2, !1])) : [3, 4];case 2:
                        d.sent(), d.label = 3;case 3:
                        return i++, [3, 1];case 4:
                        return g = t.getNodeFromId(n.id, !1, !0, !0), g.children.splice(0, l), [4, e.modules.CRMNodes.updateCrm()];case 5:
                        return d.sent(), t.respondSuccess(g), [2, !0];}
                  });
                });
              });
            });
          });
        }, t.push = function (t) {
          var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
            t.typeCheck([{ val: 'childrenIds', type: 'array' }], function () {
              e.modules.CRMNodes.buildNodePaths(e.modules.crm.crmTree);var n = t.message.data.childrenIds;t.getNodeFromId(t.message.data.nodeId, !0).run(function (a) {
                return i(s, void 0, void 0, function () {
                  var s, o, r, l, i, r, c, u;return d(this, function (d) {
                    switch (d.label) {case 0:
                        for ('menu' !== a.type && t.respondError('Node is not of type menu'), s = 0, o = n; s < o.length; s++) {
                          if (r = o[s], 'number' !== typeof r) return t.respondError('Not all values in array childrenIds are of type number'), [2, !1];
                        }l = 0, i = n, d.label = 1;case 1:
                        return l < i.length ? (r = i[l], c = t.getNodeFromId(r, !1, !0), !c) ? [2, !1] : (u = t.lookup(c.path, e.modules.crm.crmTree, !0), 'boolean' !== typeof u && u ? [4, t.moveNode(c, { relation: 'lastChild', node: t.message.data.nodeId }, { children: u, id: c.id })] : (t.respondError('Something went wrong removing the source node'), [2, !1])) : [3, 4];case 2:
                        d.sent(), d.label = 3;case 3:
                        return l++, [3, 1];case 4:
                        return [4, e.modules.CRMNodes.updateCrm()];case 5:
                        return d.sent(), t.respondSuccess(t.getNodeFromId(a.id, !0, !0)), [2, !0];}
                  });
                });
              });
            });
          });
        }, t.splice = function (t) {
          var s = this;t.checkPermissions(['crmGet', 'crmWrite'], function () {
            t.typeCheck([{ val: 'start', type: 'number' }, { val: 'amount', type: 'number' }], function () {
              var n = t.message.data,
                  a = n.start,
                  o = n.amount;t.getNodeFromId(t.message.data.nodeId).run(function (n) {
                return i(s, void 0, void 0, function () {
                  var s, r, l;return d(this, function (i) {
                    switch (i.label) {case 0:
                        return 'menu' === n.type ? (s = n.children.splice(a, o), [4, e.modules.CRMNodes.updateCrm()]) : (t.respondError('Node is not of type menu'), [2, !1]);case 1:
                        return i.sent(), r = s.map(function (t) {
                          return e.modules.CRMNodes.makeSafe(t);
                        }), l = t.getNodeFromId(n.id, !0, !0).children, t.respondSuccess({ spliced: r, newArr: l }), [2, !0];}
                  });
                });
              });
            });
          });
        };
      })(s = t.menu || (t.menu = {}));
    })(t = e.crm || (e.crm = {}));
  }(c || (c = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        function s(e) {
          return i(this, void 0, void 0, function () {
            return d(this, function (t) {
              switch (t.label) {case 0:
                  return 0 === Object.getOwnPropertyNames(e).length ? [2, []] : [3, 1];case 1:
                  return e.all ? [4, browserAPI.tabs.query({})] : [3, 3];case 2:
                  return [2, t.sent()];case 3:
                  return !1 === e.all && delete e.all, [4, browserAPI.tabs.query(e)];case 4:
                  return [2, t.sent()];}
            });
          });
        }function n(e) {
          for (var t = [], s = [], n = 0, a = e; n < a.length; n++) {
            var o = a[n],
                r = o.id;-1 < s.indexOf(r) || (t.push(o), s.push(r));
          }return t;
        }function a(t, a, o) {
          return i(this, void 0, void 0, function () {
            var r, l, i, c;return d(this, function (d) {
              switch (d.label) {case 0:
                  return 'number' === typeof o.tabId && (o.tabId = [o.tabId]), r = o.tabId, delete o.tabId, [4, s(o)];case 1:
                  return l = d.sent() || [], [4, window.Promise.all((r || []).map(function (e) {
                    return browserAPI.tabs.get(e);
                  }))];case 2:
                  return (i = d.sent(), c = t.getNodeFromId(a, !1, !0), !c || 'script' !== c.type) ? [2] : (n(l.concat(i)).forEach(function (t) {
                    e.modules.CRMNodes.Script.Handler.createHandler(c)({ pageUrl: t.url, menuItemId: 0, editable: !1, modifiers: [] }, t, !0);
                  }), [2]);}
            });
          });
        }t.runScript = function (e) {
          var t = this;e.checkPermissions(['crmRun'], function () {
            e.typeCheck([{ val: 'id', type: 'number' }, { val: 'options', type: 'object' }, { val: 'options.all', type: 'boolean', optional: !0 }, { val: 'options.tabId', type: ['number', 'array'], optional: !0 }, { val: 'options.status', type: 'string', optional: !0 }, { val: 'options.lastFocusedWindow', type: 'boolean', optional: !0 }, { val: 'options.windowId', type: 'number', optional: !0 }, { val: 'options.windowType', type: 'string', optional: !0 }, { val: 'options.active', type: 'boolean', optional: !0 }, { val: 'options.index', type: 'number', optional: !0 }, { val: 'options.title', type: 'string', optional: !0 }, { val: 'options.url', type: ['string', 'array'], optional: !0 }, { val: 'options.currentWindow', type: 'boolean', optional: !0 }, { val: 'options.highlighted', type: 'boolean', optional: !0 }, { val: 'options.pinned', type: 'boolean', optional: !0 }, { val: 'options.audible', type: 'boolean', optional: !0 }, { val: 'options.muted', type: 'boolean', optional: !0 }, { val: 'options.tabId', type: ['number', 'array'], optional: !0 }], function () {
              return i(t, void 0, void 0, function () {
                var t, s, n;return d(this, function (o) {
                  switch (o.label) {case 0:
                      return t = e.message.data, s = t.options, n = t.id, 'number' === typeof s.tabId && (s.tabId = [s.tabId]), [4, a(e, n, s)];case 1:
                      return o.sent(), [2];}
                });
              });
            });
          });
        }, t.runSelf = function (e) {
          var t = this;e.checkPermissions(['crmRun'], function () {
            e.typeCheck([{ val: 'options', type: 'object' }, { val: 'options.all', type: 'boolean', optional: !0 }, { val: 'options.tabId', type: ['number', 'array'], optional: !0 }, { val: 'options.status', type: 'string', optional: !0 }, { val: 'options.lastFocusedWindow', type: 'boolean', optional: !0 }, { val: 'options.windowId', type: 'number', optional: !0 }, { val: 'options.windowType', type: 'string', optional: !0 }, { val: 'options.active', type: 'boolean', optional: !0 }, { val: 'options.index', type: 'number', optional: !0 }, { val: 'options.title', type: 'string', optional: !0 }, { val: 'options.url', type: ['string', 'array'], optional: !0 }, { val: 'options.currentWindow', type: 'boolean', optional: !0 }, { val: 'options.highlighted', type: 'boolean', optional: !0 }, { val: 'options.pinned', type: 'boolean', optional: !0 }, { val: 'options.audible', type: 'boolean', optional: !0 }, { val: 'options.muted', type: 'boolean', optional: !0 }, { val: 'options.tabId', type: ['number', 'array'], optional: !0 }], function () {
              return i(t, void 0, void 0, function () {
                var t;return d(this, function (s) {
                  switch (s.label) {case 0:
                      return t = e.message.data.options, 'number' === typeof t.tabId && (t.tabId = [t.tabId]), [4, a(e, e.message.id, t)];case 1:
                      return s.sent(), [2];}
                });
              });
            });
          });
        }, t.addKeyboardListener = function (t) {
          t.typeCheck([{ val: 'key', type: 'string' }], function () {
            var s = t.message.data,
                n = e.modules.globalObject.globals.eventListeners.shortcutListeners,
                a = s.key.toLowerCase();e.modules.Util.setMapDefault(n, a, []);var o = { shortcut: a, callback: function callback() {
                try {
                  t.respondSuccess();
                } catch (t) {
                  var e = n.get(a).indexOf(o);n.get(a).splice(e, 1);
                }
              } };n.get(a).push(o);
          });
        };
      })(s = t.background || (t.background = {}));
    })(t = e.crm || (e.crm = {}));
  }(c || (c = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        t.register = function (t) {
          var s = this;t.checkPermissions(['crmWrite'], function () {
            t.typeCheck([{ val: 'name', type: 'string' }, { val: 'url', type: 'string', optional: !0 }, { val: 'code', type: 'string', optional: !0 }, { val: 'ts', type: 'boolean', optional: !0 }], function (n) {
              return i(s, void 0, void 0, function () {
                var s, a, o, r, l, i, c, u, u;return d(this, function (d) {
                  switch (d.label) {case 0:
                      return s = t.message.data, a = s.name, o = s.url, r = s.ts, l = s.code, n.url ? o.indexOf('.js') === o.length - 3 ? [4, Promise.race([new Promise(function (t) {
                        e.modules.Util.xhr(o).then(function (e) {
                          t(e);
                        }, function (e) {
                          t(e);
                        });
                      }), new Promise(function (e) {
                        setTimeout(function () {
                          e(null);
                        }, 5e3);
                      })])] : [3, 7] : [3, 9];case 1:
                      return (c = d.sent(), null !== c) ? [3, 2] : (t.respondError('Request timed out'), [3, 6]);case 2:
                      return 'number' === typeof c ? (t.respondError('Request failed with status code ' + c), [3, 6]) : [3, 3];case 3:
                      return i = { name: a, code: c, url: o, ts: { enabled: !!r, code: {} } }, [4, e.modules.CRMNodes.TS.compileLibrary(i)];case 4:
                      return u = d.sent(), e.modules.storages.storageLocal.libraries.push(u), [4, browserAPI.storage.local.set({ libraries: e.modules.storages.storageLocal.libraries })];case 5:
                      d.sent(), t.respondSuccess(u), d.label = 6;case 6:
                      return [3, 8];case 7:
                      return t.respondError('No valid URL given'), [2, !1];case 8:
                      return [3, 13];case 9:
                      return n.code ? (i = { name: a, code: l, ts: { enabled: !!r, code: {} } }, [4, e.modules.CRMNodes.TS.compileLibrary(i)]) : [3, 12];case 10:
                      return u = d.sent(), e.modules.storages.storageLocal.libraries.push(u), [4, browserAPI.storage.local.set({ libraries: e.modules.storages.storageLocal.libraries })];case 11:
                      return d.sent(), t.respondSuccess(u), [3, 13];case 12:
                      return t.respondError('No URL or code given'), [2, !1];case 13:
                      return [2, !0];}
                });
              });
            });
          });
        };
      })(s = t.libraries || (t.libraries = {}));
    })(t = e.crm || (e.crm = {}));
  }(c || (c = {}));var u = function u(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      p = function p(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      g;(function (e) {
    var t;(function (t) {
      function s(t, s, n) {
        return t.args[0] && ('chrome' !== t.type || t.args[0].type === s) && ('browser' !== t.type || 'return' === t.args[0].type) ? !1 : (e.modules.APIMessaging.ChromeMessage.throwError(t, 'fn' === s ? 'First argument of ' + n + ' should be a function' : n + ' should have something to return to'), !0);
      }function n(t, s) {
        'browser' === t.type ? e.modules.APIMessaging.createReturn(t, t.args[0].val)(s[0]) : e.modules.APIMessaging.CRMMessage.respond(t, 'success', { callbackId: t.args[0].val, params: s });
      }function a() {
        return u(this, void 0, void 0, function () {
          return p(this, function (e) {
            switch (e.label) {case 0:
                return [4, browserAPI.runtime.getManifest()];case 1:
                return [2, e.sent()];}
          });
        });
      }function o(t, s) {
        if (1 < s.split('.').length) {
          t.args[0] && 'fn' === t.args[0].type || e.modules.APIMessaging.ChromeMessage.throwError(t, 'First argument should be a function');var n = s.split('.')[0];return -1 < ['onStartup', 'onInstalled', 'onSuspend', 'onSuspendCanceled', 'onUpdateAvailable', 'onRestartRequired'].indexOf(n) && n in browserAPI.runtime ? (browserAPI.runtime[n].addListener(function () {
            for (var s = [], n = 0; n < arguments.length; n++) {
              s[n] = arguments[n];
            }var a = Array.prototype.slice.apply(s);e.modules.APIMessaging.CRMMessage.respond(t, 'success', { callbackId: t.args[0].val, params: a });
          }), !0) : 'onMessage' === n ? (e.modules.APIMessaging.ChromeMessage.throwError(t, 'This method of listening to messages is not allowed, use crmAPI.comm instead'), !0) : n in browserAPI.runtime ? (e.modules.APIMessaging.ChromeMessage.throwError(t, 'You are not allowed to listen to given event'), !0) : (e.modules.APIMessaging.ChromeMessage.throwError(t, 'Given event is not supported on this platform'), !0);
        }return !1;
      }t.getBackgroundPage = function (e, t) {
        return !(console.warn('The ' + e.type + '.runtime.getBackgroundPage API should not be used'), !s(e, 'fn', t)) || (n(e, [{}]), !0);
      }, t.openOptionsPage = function (e, t) {
        return u(this, void 0, void 0, function () {
          return p(this, function (a) {
            switch (a.label) {case 0:
                return s(e, 'fn', t) ? [2, !0] : [4, browserAPI.runtime.openOptionsPage()];case 1:
                return a.sent(), e.args[0] && n(e, []), [2, !0];}
          });
        });
      }, t._getManifest = a, t.getManifest = function (t, n) {
        return !!s(t, 'return', n) || (a().then(function (s) {
          e.modules.APIMessaging.createReturn(t, t.args[0].val)(s);
        }), !0);
      }, t.getURL = function (t) {
        for (var s = [], n = [], a = 0; a < t.args.length; a++) {
          if ('return' === t.args[a].type) s.push(t.args[a].val);else if ('arg' === t.args[a].type) n.push(t.args[a].val);else return e.modules.APIMessaging.ChromeMessage.throwError(t, 'getURL should not have a function as an argument'), !0;
        }return (0 === s.length || 0 === n.length) && e.modules.APIMessaging.ChromeMessage.throwError(t, 'getURL should be a return function with at least one argument'), e.modules.APIMessaging.createReturn(t, s[0])(browserAPI.runtime.getURL(n[0])), !0;
      }, t.unaccessibleAPI = function (t) {
        return e.modules.APIMessaging.ChromeMessage.throwError(t, 'This API should not be accessed'), !0;
      }, t.reload = function () {
        return browserAPI.runtime.reload(), !0;
      }, t.restart = function () {
        if ('restart' in browserAPI.runtime) {
          var e = browserAPI.runtime;e.restart();
        }return !0;
      }, t.restartAfterDelay = function (t) {
        var s = [],
            n = [];if (!('restartAfterDelay' in browserAPI.runtime)) return e.modules.APIMessaging.ChromeMessage.throwError(t, 'restartAfterDelay is not supported on this platform'), !0;for (var a = 0; a < t.args.length; a++) {
          if ('fn' === t.args[a].type) s.push(t.args[a].val);else if ('arg' === t.args[a].type) n.push(t.args[a].val);else return e.modules.APIMessaging.ChromeMessage.throwError(t, 'restartAfterDelay should not have a return as an argument'), !0;
        }var o = browserAPI.runtime;return o.restartAfterDelay(n[0], function () {
          e.modules.APIMessaging.CRMMessage.respond(t, 'success', { callbackId: s[0], params: [] });
        }), !0;
      }, t.getPlatformInfo = function (e, t) {
        return u(this, void 0, void 0, function () {
          var a;return p(this, function (o) {
            switch (o.label) {case 0:
                return s(e, 'fn', t) ? [2, !0] : [4, browserAPI.runtime.getPlatformInfo()];case 1:
                return a = o.sent(), e.args[0] && n(e, [a]), [2, !0];}
          });
        });
      }, t.getPackageDirectoryEntry = function (t, a) {
        if (!('getPackageDirectoryEntry' in browserAPI.runtime)) return e.modules.APIMessaging.ChromeMessage.throwError(t, 'getPackageDirectoryEntry is not supported on this platform'), !1;if (s(t, 'fn', a)) return !0;var o = browserAPI.runtime;return o.getPackageDirectoryEntry(function (e) {
          t.args[0] && n(t, [e]);
        }), !0;
      }, t.check = function (e) {
        return u(this, void 0, void 0, function () {
          var s, n, a, r;return p(this, function (l) {
            switch (l.label) {case 0:
                return (s = e.api.split('.'), n = s[0], a = s[1], 'runtime' !== n) ? [2, !1] : (r = a, 'getBackgroundPage' === r ? [3, 1] : 'openOptionsPage' === r ? [3, 2] : 'getManifest' === r ? [3, 4] : 'getURL' === r ? [3, 5] : 'connect' === r ? [3, 6] : 'connectNative' === r ? [3, 6] : 'setUninstallURL' === r ? [3, 6] : 'sendNativeMessage' === r ? [3, 6] : 'requestUpdateCheck' === r ? [3, 6] : 'reload' === r ? [3, 7] : 'restart' === r ? [3, 8] : 'restartAfterDelay' === r ? [3, 9] : 'getPlatformInfo' === r ? [3, 10] : 'getPackageDirectoryEntry' === r ? [3, 12] : [3, 13]);case 1:
                return [2, t.getBackgroundPage(e, a)];case 2:
                return [4, t.openOptionsPage(e, a)];case 3:
                return [2, l.sent()];case 4:
                return [2, t.getManifest(e, a)];case 5:
                return [2, t.getURL(e)];case 6:
                return [2, t.unaccessibleAPI(e)];case 7:
                return [2, t.reload()];case 8:
                return [2, t.restart()];case 9:
                return [2, t.restartAfterDelay(e)];case 10:
                return [4, t.getPlatformInfo(e, a)];case 11:
                return [2, l.sent()];case 12:
                return [2, t.getPackageDirectoryEntry(e, a)];case 13:
                return [2, o(e, a)];}
          });
        });
      };
    })(t = e.ChromeAPIs || (e.ChromeAPIs = {}));
  })(g || (g = {})), function (e) {
    var t;(function (t) {
      function s(t) {
        var s = n(t),
            a = e.modules.crmValues.userAddedContextMenusById;return a.has(s) && a.get(s).sourceNodeId === t.id;
      }function n(e) {
        return e.args[0].val;
      }function a(t, s, n) {
        t.args[s] && ('browser' === t.type ? e.modules.APIMessaging.createReturn(t, t.args[s].val)(n[0]) : e.modules.APIMessaging.CRMMessage.respond(t, 'success', { callbackId: t.args[s].val, params: n }));
      }function o(t, s) {
        e.modules.APIMessaging.ChromeMessage.throwError(t, s, '');
      }function r(t) {
        return u(this, void 0, void 0, function () {
          var s, n, a, o, l, i, d;return p(this, function (c) {
            switch (c.label) {case 0:
                s = t.actualId, n = t.children, a = t.parent, o = t.generatedId, a.children.splice(a.children.indexOf(t), 1), e.modules.crmValues.userAddedContextMenusById['delete'](o), l = 0, i = n, c.label = 1;case 1:
                return l < i.length ? (d = i[l], [4, r(d)]) : [3, 4];case 2:
                c.sent(), c.label = 3;case 3:
                return l++, [3, 1];case 4:
                return [4, browserAPI.contextMenus.remove(s)];case 5:
                return c.sent(), [2];}
          });
        });
      }function l(t) {
        return u(this, void 0, void 0, function () {
          var l = this,
              i,
              d,
              c,
              g,
              m,
              m,
              h,
              y,
              f,
              b,
              x,
              v;return p(this, function (I) {
            switch (I.label) {case 0:
                return (i = t.api.split('.'), d = i[0], c = i[1], 'contextMenus' !== d && 'menus' !== d) ? [2, !1] : 'removeAll' === c ? (g = t.id, [4, e.modules.Util.filter(e.modules.crmValues.userAddedContextMenus, function (e) {
                  return u(l, void 0, void 0, function () {
                    var t;return p(this, function (s) {
                      switch (s.label) {case 0:
                          return t = e.sourceNodeId === g, [4, r(e)];case 1:
                          return s.sent(), [2, !t];}
                    });
                  });
                })]) : [3, 2];case 1:
                return I.sent(), a(t, 0, []), [3, 13];case 2:
                return 'remove' === c ? s(t) ? (m = n(t), [4, r(e.modules.crmValues.userAddedContextMenusById.get(m))]) : [3, 4] : [3, 6];case 3:
                return I.sent(), a(t, 1, []), [3, 5];case 4:
                o(t, 'Attempted to modify contextMenu item that was not created by this node'), I.label = 5;case 5:
                return [3, 13];case 6:
                return 'update' === c ? s(t) ? (m = n(t), [4, browserAPI.contextMenus.update(m, t.args[1].val)]) : [3, 8] : [3, 10];case 7:
                return I.sent(), a(t, 2, []), [3, 9];case 8:
                o(t, 'Attempted to modify contextMenu item that was not created by this node'), I.label = 9;case 9:
                return [3, 13];case 10:
                return 'create' === c ? (h = e.modules.crmValues.userAddedContextMenusById, y = t.args[0].val, f = y.parentId, f && h.has(f) && (y.parentId = h.get(f).actualId), [4, browserAPI.contextMenus.create(y, e.modules.CRMNodes.handleUserAddedContextMenuErrors)]) : [3, 12];case 11:
                return b = I.sent(), x = e.modules.Util.createUniqueNumber(), v = { sourceNodeId: t.id, actualId: b, generatedId: x, createProperties: y, children: [], parent: f ? h.get(f) : null }, e.modules.crmValues.userAddedContextMenus.push(v), h.set(x, v), f && h.get(f).children.push(v), [3, 13];case 12:
                return [2, !0];case 13:
                return [2, !1];}
          });
        });
      }t.check = function (e) {
        return u(this, void 0, void 0, function () {
          return p(this, function (t) {
            switch (t.label) {case 0:
                return [4, l(e)];case 1:
                return t.sent() ? [2, !0] : [2, !1];}
          });
        });
      };
    })(t = e.ForbiddenCalls || (e.ForbiddenCalls = {}));
  }(g || (g = {})), function (e) {
    function t(e) {
      return 'storage' !== e;
    }function s(t, s) {
      var n = e.modules.crm.crmById.get(t.id);if (!n.isLocal) {
        var a = -1 !== n.permissions.indexOf('chrome') || -1 !== n.permissions.indexOf('browser'),
            o;if (o = -1 !== n.permissions.indexOf(s), !a && !o) return e.modules.APIMessaging.ChromeMessage.throwError(t, 'Both permissions ' + t.type + ' and ' + s + ' not available to this script'), !1;if (!a) return e.modules.APIMessaging.ChromeMessage.throwError(t, 'Permission ' + t.type + ' not available to this script'), !1;if (!o) return e.modules.APIMessaging.ChromeMessage.throwError(t, 'Permission ' + s + ' not avilable to this script'), !1;
      }return !0;
    }function n(t) {
      return u(this, void 0, void 0, function () {
        return p(this, function (s) {
          switch (s.label) {case 0:
              return !/[a-zA-Z0-9]*/.test(t.api) ? (e.modules.APIMessaging.ChromeMessage.throwError(t, 'Passed API "' + t.api + '" is not alphanumeric.'), [2, !1]) : [3, 1];case 1:
              return [4, e.ForbiddenCalls.check(t)];case 2:
              return s.sent() ? [2, !1] : [3, 3];case 3:
              return [4, e.ChromeAPIs.check(t)];case 4:
              if (s.sent()) return [2, !1];if ('runtime.sendMessage' === t.api) return console.warn('The ' + t.type + '.runtime.sendMessage API is not meant to be used, use crmAPI.comm instead'), e.modules.APIMessaging.sendThroughComm(t), [2, !1];s.label = 5;case 5:
              return [2, !0];}
        });
      });
    }function a(t, s) {
      return function () {
        for (var n = [], a = 0; a < arguments.length; a++) {
          n[a] = arguments[a];
        }window.chrome && window.chrome.runtime && window.chrome.runtime.lastError ? e.modules.APIMessaging.CRMMessage.respond(t, 'success', { callbackId: s, lastError: window.chrome.runtime.lastError, params: n }) : e.modules.APIMessaging.CRMMessage.respond(t, 'success', { callbackId: s, params: n });
      };
    }e.initModule = function (t) {
      e.modules = t;
    }, e.handle = function (o) {
      return u(this, void 0, void 0, function () {
        var r, l, d, c, u, g, i, m, h, y, g, f;return p(this, function (p) {
          switch (p.label) {case 0:
              return [4, n(o)];case 1:
              return p.sent() ? (r = o.requestType || o.api.split('.')[0], !t(r)) ? (e.modules.APIMessaging.ChromeMessage.throwError(o, 'Permission ' + r + ' is not allowed for scripts, please use a CRM API replacemenet'), [2, !1]) : s(o, r) ? -1 === e.modules.constants.permissions.indexOf(r) ? (e.modules.APIMessaging.ChromeMessage.throwError(o, 'Permissions ' + r + ' is not available for use or does not exist.'), [2, !1]) : -1 === e.modules.globalObject.globals.availablePermissions.indexOf(r) ? (e.modules.APIMessaging.ChromeMessage.throwError(o, 'Permissions ' + r + ' not available to the extension, visit options page'), [4, browserAPI.storage.local.get()]) : [3, 4] : [2, !1] : [2, !1];case 2:
              return l = p.sent(), d = l.requestPermissions || [r], [4, browserAPI.storage.local.set({ requestPermissions: d })];case 3:
              return p.sent(), [2, !1];case 4:
              for (c = [], u = [], g = 0; g < o.args.length; g++) {
                switch (o.args[g].type) {case 'arg':
                    c.push(e.modules.Util.jsonFn.parse(o.args[g].val));break;case 'fn':
                    c.push(a(o, o.args[g].val));break;case 'return':
                    u.push(e.modules.APIMessaging.createReturn(o, o.args[g].val));}
              }p.label = 5;case 5:
              return p.trys.push([5, 11,, 12]), 'crmAPI' in window && window.crmAPI && '__isVirtual' in window ? [4, e.modules.Sandbox.sandboxVirtualChromeFunction(o.api, o.type, o.args)] : [3, 7];case 6:
              return y = p.sent(), [3, 8];case 7:
              y = e.modules.Sandbox.sandboxChrome(o.api, o.type, c), p.label = 8;case 8:
              return i = y, m = i.success, h = i.result, m ? e.modules.Util.isThennable(h) ? [4, h] : [3, 10] : (e.modules.APIMessaging.ChromeMessage.throwError(o, 'Passed API does not exist'), [2, !1]);case 9:
              h = p.sent(), p.label = 10;case 10:
              for (g = 0; g < u.length; g++) {
                u[g](h);
              }return 'browser' === o.type && e.modules.APIMessaging.CRMMessage.respond(o, 'success', h), [3, 12];case 11:
              return f = p.sent(), e.modules.APIMessaging.ChromeMessage.throwError(o, f.message, f.stack), [2, !1];case 12:
              return [2, !0];}
        });
      });
    };
  }(g || (g = {}));var m;(function (t) {
    var e;(function (e) {
      e.respond = function (s, e, n, a) {
        var o = { type: e, callbackId: s.onFinish, messageType: 'callback', data: 'error' === e || 'chromeError' === e ? { error: n, message: n, stackTrace: a, lineNumber: s.lineNumber } : n };try {
          var r = t.modules.crmValues.tabData,
              l = r.get(s.tabId).nodes,
              i = l.get(s.id)[s.tabIndex].port;t.modules.Util.postMessage(i, o);
        } catch (n) {
          if ('Converting circular structure to JSON' === n.message) t.CRMMessage.respond(s, 'error', 'Converting circular structure to JSON, this API will not work');else throw n;
        }
      };
    })(e = t.CRMMessage || (t.CRMMessage = {}));
  })(m || (m = {})), function (e) {
    var t;(function (t) {
      t.throwError = function (t, s, n) {
        if (console.warn('Error:', s), n) {
          var a = n.split('\n');a.forEach(function (e) {
            console.warn(e);
          });
        }e.CRMMessage.respond(t, 'chromeError', s, n);
      }, t.succeed = function (t, s) {
        e.CRMMessage.respond(t, 'success', s);
      };
    })(t = e.ChromeMessage || (e.ChromeMessage = {}));
  }(m || (m = {})), function (e) {
    e.initModule = function (t) {
      e.modules = t;
    }, e.createReturn = function (t, s) {
      return function (n) {
        e.CRMMessage.respond(t, 'success', { callbackId: s, params: [n] });
      };
    }, e.sendThroughComm = function (t) {
      var s = e.modules.crmValues.nodeInstances.get(t.id),
          n = [];e.modules.Util.iterateMap(s, function (e, t) {
        t.forEach(function (t, s) {
          n.push({ id: e, tabIndex: s, instance: t });
        });
      });for (var a = [], o = [], r = 0; r < t.args.length; r++) {
        'fn' === t.args[r].type ? o.push(t.args[r]) : 'arg' === t.args[r].type && (2 < a.length && 'string' === typeof a[0] && (a = a.slice(1)), a.push(t.args[r]));
      }0 < o.length && console.warn('Message responseCallbacks are not supported');for (var r = 0; r < n.length; r++) {
        var l = e.modules.crmValues.tabData,
            i = l.get(n[r].id).nodes,
            d = i.get(t.id)[n[r].tabIndex].port;e.modules.Util.postMessage(d, { messageType: 'instanceMessage', message: a[0] });
      }
    };
  }(m || (m = {}));var h = function h(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      y = function y(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      f;(function (e) {
    e.initModule = function (t) {
      e.modules = t;
    };var t = function () {
      function t(e, t) {
        if (this.message = e, this.action = t, null !== t) {
          for (var s = t.split('.'), n = c, a = 0, o = s, r; a < o.length; a++) {
            r = o[a], n = n[r];
          }n(this);
        }
      }return t.prototype.respondSuccess = function () {
        for (var t = [], s = 0; s < arguments.length; s++) {
          t[s] = arguments[s];
        }return e.modules.APIMessaging.CRMMessage.respond(this.message, 'success', t), !0;
      }, t.prototype.respondError = function (t) {
        e.modules.APIMessaging.CRMMessage.respond(this.message, 'error', t);
      }, t.prototype.lookup = function (e, t, s) {
        if (void 0 === s && (s = !1), null === e || 'object' !== ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) || !Array.isArray(e)) return this.respondError('Supplied path is not of type array'), !0;for (var n = e.length - 1, a = 0, o; a < n; a++) {
          if (o = t[e[a]], t && o && o.children) t = o.children;else return !1;
        }return s ? t || !1 : t[e[n]] || !1;
      }, t.prototype.checkType = function (e, t, s, n, a, o, r) {
        return (void 0 === n && (n = 0), void 0 === o && (o = !1), void 0 === e || null === e) ? n ? (a && a(), !0) : (o ? this.respondError('Not all values for ' + s + ' are defined') : this.respondError('Value for ' + s + ' is not defined'), !1) : 'array' === t && ('object' !== ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) || Array.isArray(e)) ? (o ? this.respondError('Not all values for ' + s + ' are of type ' + t + ',' + (' they are instead of type ' + ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)))) : this.respondError('Value for ' + s + ' is not of type ' + t + ',' + (' it is instead of type ' + ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)))), !1) : ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) === t ? (r && r(), !0) : (o ? this.respondError('Not all values for ' + s + ' are of type ' + t + ',' + (' they are instead of type ' + ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)))) : this.respondError('Value for ' + s + ' is not of type ' + t + ',' + (' it is instead of type ' + ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)))), !1);
      }, t.prototype.moveNode = function (s, n, a) {
        return h(this, void 0, void 0, function () {
          var o, r, l, d, c, u, p, g, m, h, f, b, x;return y(this, function (i) {
            switch (i.label) {case 0:
                if (o = this, r = JSON.parse(JSON.stringify(e.modules.crm.crmTree)), n = n || {}, !this.checkType(n, 'object', 'position')) return [2, !1];if (!this.checkType(n.node, 'number', 'node', 1, null, !1, function () {
                  l = o.getNodeFromId(n.node, !1, !0);
                })) return [2, !1];if (!this.checkType(n.relation, 'string', 'relation', 1)) return [2, !1];switch (l = l || e.modules.crm.crmTree, d = l === e.modules.crm.crmTree, n.relation) {case 'before':
                    c = t.MoveNode.before(d, s, l, this);break;case 'firstSibling':
                    c = t.MoveNode.firstSibling(d, s, l, this);break;case 'after':
                    c = t.MoveNode.after(d, s, l, this);break;case 'lastSibling':
                    c = t.MoveNode.lastSibling(d, s, l, this);break;case 'firstChild':
                    if (u = t.MoveNode.firstChild(d, s, l, this), p = u.success, g = u.target, c = g, !p) return [2, !1];break;default:case 'lastChild':
                    if (m = t.MoveNode.lastChild(d, s, l, this), h = m.success, f = m.target, c = f, !h) return [2, !1];}if (a && 0 !== c) for (b = !1, x = 0; x < a.children.length; x++) {
                  if (a.children[x].id === a.id) {
                    if (1 === c || 3 === c) {
                      a.children.splice(x, 1);break;
                    }if (2 === c) if (b) {
                      a.children.splice(x, 1);break;
                    } else b = !0;
                  }
                }return [4, e.modules.Storages.applyChanges({ type: 'optionsPage', settingsChanges: [{ key: 'crm', oldValue: r, newValue: JSON.parse(JSON.stringify(e.modules.crm.crmTree)) }] })];case 1:
                return i.sent(), [2, s];}
          });
        });
      }, t.prototype.getNodeFromId = function (t, s, n, a) {
        void 0 === s && (s = !1), void 0 === n && (n = !1), void 0 === a && (a = !1);var o = (s ? e.modules.crm.crmByIdSafe : e.modules.crm.crmById).get(t);return o ? n ? o : { run: function run(e) {
            e(o);
          } } : (this.respondError('There is no node with the id you supplied (' + t + ')'), !n && { run: function run() {} });
      }, t._getDotValue = function (e, t) {
        for (var s = t.split('.'), n = e, a = 0; a < s.length; a++) {
          if (s[a] in n) n = n[s[a]];else return;
        }return n;
      }, t.prototype.dependencyMet = function (e, t) {
        return e.dependency && !t[e.dependency] ? (t[e.val] = !1, !1) : !0;
      }, t.prototype._isDefined = function (e, t, s) {
        return void 0 === t || null === t ? e.optional ? (s[e.val] = !1, 'continue') : (this.respondError('Value for ' + e.val + ' is not set'), !1) : !0;
      }, t.prototype._typesMatch = function (e, t) {
        for (var s = Array.isArray(e.type) ? e.type : [e.type], n = 0, a; n < s.length; n++) {
          if (a = s[n], 'array' === a && 'object' === ('undefined' === typeof t ? 'undefined' : babelHelpers['typeof'](t)) && Array.isArray(t)) return a;if (('undefined' === typeof t ? 'undefined' : babelHelpers['typeof'](t)) === a) return a;
        }return this.respondError('Value for ' + e.val + ' is not of type ' + s.join(' or ')), null;
      }, t.prototype._checkNumberConstraints = function (e, t) {
        return void 0 !== e.min && e.min > t ? (this.respondError('Value for ' + e.val + ' is smaller than ' + e.min), !1) : void 0 !== e.max && e.max < t ? (this.respondError('Value for ' + e.val + ' is bigger than ' + e.max), !1) : !0;
      }, t.prototype._checkArrayChildType = function (e, t, s) {
        for (var n = Array.isArray(s.type) ? s.type : [s.type], a = 0, o; a < n.length; a++) {
          if (o = n[a], 'array' === o) {
            if (Array.isArray(t)) return !0;
          } else if (('undefined' === typeof t ? 'undefined' : babelHelpers['typeof'](t)) === o) return !0;
        }return this.respondError('For not all values in the array ' + e.val + ' is the property ' + s.val + ' of type ' + n.join(' or ')), !1;
      }, t.prototype._checkArrayChildrenConstraints = function (e, t) {
        for (var s = 0, n = t, a; s < n.length; s++) {
          a = n[s];for (var o = 0, r = e.forChildren; o < r.length; o++) {
            var l = r[o],
                i = a[l.val];if (void 0 === i || null === i) {
              if (!l.optional) return this.respondError('For not all values in the array ' + e.val + ' is the property ' + l.val + ' defined'), !1;
            } else if (!this._checkArrayChildType(e, i, l)) return !1;
          }
        }return !0;
      }, t.prototype._checkConstraints = function (e, t) {
        return 'number' === typeof t ? this._checkNumberConstraints(e, t) : Array.isArray(t) && e.forChildren ? this._checkArrayChildrenConstraints(e, t) : !0;
      }, t.prototype.isBackgroundPage = function () {
        var e = 0 === this.message.tabId;return e || this.respondError('Call source is not a backgroundpage'), e;
      }, t.prototype.typeCheck = function (e, s) {
        for (var n = {}, a = 0, o = e, r; a < o.length; a++) {
          if (r = o[a], !!this.dependencyMet(r, n)) {
            var l = t._getDotValue(this.message.data, r.val),
                i = this._isDefined(r, l, n);if (!0 === i) {
              var d = this._typesMatch(r, l);if (d) {
                n[r.val] = !0, this._checkConstraints(r, l);continue;
              }
            } else if ('continue' === i) continue;return !1;
          }
        }return s(n), !0;
      }, t.prototype.checkPermissions = function (t, s) {
        var n = [],
            a = !0,
            o;if (!(o = e.modules.crm.crmById.get(this.message.id))) return this.respondError('The node you are running this script from no longer exist, no CRM API calls are allowed'), !1;if (o.isLocal) s && s(n);else {
          var r = [];if (!o.permissions || e.modules.Util.compareArray(o.permissions, [])) 0 < t.length && (a = !1, r = t);else for (var l = 0, i = t, d; l < i.length; l++) {
            d = i[l], -1 === o.permissions.indexOf(d) && (a = !1, r.push(d));
          }if (!a) {
            if (1e3 < e.modules.storages.insufficientPermissions.length) {
              for (var c = 0; e.modules.storages.insufficientPermissions.pop() && (c++, 500 !== c);) {}e.modules.storages.insufficientPermissions.push('Cleaning up last 500 array items because size exceeded 1000...');
            }e.modules.storages.insufficientPermissions.push('Script id ' + this.message.id + ' asked for and was rejected permission' + (1 === r.length ? ' ' + r[0] : 's ' + r.join(', '))), this.respondError('Permission' + (1 === r.length ? ' ' + r[0] : 's ' + r.join(', ')) + ' are not available to this script.');
          } else s && s(n.filter(function (e) {
            return -1 !== o.permissions.indexOf(e);
          }));
        }return !0;
      }, t.MoveNode = function () {
        function t() {}return t._targetIndex = function (e, t) {
          for (var s = 0; s < e.length; s++) {
            if (e[s].id === t.id) return s;
          }return -1;
        }, t._genMoveTargetReturn = function (e, t) {
          return -1 === e ? 1 : t ? 3 : 2;
        }, t.before = function (t, s, n, a) {
          if (t) {
            var o = this._targetIndex(e.modules.crm.crmTree, s);return e.modules.Util.pushIntoArray(s, 0, e.modules.crm.crmTree), this._genMoveTargetReturn(o, !1);
          }var r = a.lookup(n.path, e.modules.crm.crmTree, !0),
              o = this._targetIndex(r, s);return e.modules.Util.pushIntoArray(s, n.path[n.path.length - 1], r), this._genMoveTargetReturn(o, n.path[n.path.length - 1] > o);
        }, t.firstSibling = function (t, s, n, a) {
          if (t) {
            var o = this._targetIndex(e.modules.crm.crmTree, s);return e.modules.Util.pushIntoArray(s, 0, e.modules.crm.crmTree), this._genMoveTargetReturn(o, !1);
          }var r = a.lookup(n.path, e.modules.crm.crmTree, !0),
              o = this._targetIndex(r, s);return e.modules.Util.pushIntoArray(s, 0, r), this._genMoveTargetReturn(o, !1);
        }, t.after = function (t, s, n, a) {
          if (t) {
            var o = this._targetIndex(e.modules.crm.crmTree, s);return e.modules.Util.pushIntoArray(s, e.modules.crm.crmTree.length, e.modules.crm.crmTree), this._genMoveTargetReturn(o, !0);
          }var r = a.lookup(n.path, e.modules.crm.crmTree, !0),
              o = this._targetIndex(r, s);return 0 < n.path.length ? (e.modules.Util.pushIntoArray(s, n.path[n.path.length - 1] + 1, r), this._genMoveTargetReturn(o, n.path[n.path.length - 1] >= o)) : 0;
        }, t.lastSibling = function (t, s, n, a) {
          if (t) {
            var o = this._targetIndex(e.modules.crm.crmTree, s);return e.modules.Util.pushIntoArray(s, e.modules.crm.crmTree.length, e.modules.crm.crmTree), this._genMoveTargetReturn(o, !0);
          }var r = a.lookup(n.path, e.modules.crm.crmTree, !0),
              o = this._targetIndex(r, s);return e.modules.Util.pushIntoArray(s, r.length, r), this._genMoveTargetReturn(o, !0);
        }, t.firstChild = function (t, s, n, a) {
          if (t) {
            var o = this._targetIndex(e.modules.crm.crmTree, s);return e.modules.Util.pushIntoArray(s, 0, e.modules.crm.crmTree), { success: !0, target: this._genMoveTargetReturn(o, !1) };
          }if ('menu' === n.type) {
            var r = n.children,
                o = this._targetIndex(r, s);return e.modules.Util.pushIntoArray(s, 0, r), { success: !0, target: this._genMoveTargetReturn(o, !1) };
          }return a.respondError('Supplied node is not of type "menu"'), { success: !1, target: 0 };
        }, t.lastChild = function (t, s, n, a) {
          if (t) {
            var o = this._targetIndex(e.modules.crm.crmTree, s);return e.modules.Util.pushIntoArray(s, e.modules.crm.crmTree.length, e.modules.crm.crmTree), { success: !0, target: this._genMoveTargetReturn(o, !0) };
          }if ('menu' === n.type) {
            var r = n.children,
                o = this._targetIndex(r, s);return e.modules.Util.pushIntoArray(s, r.length, r), { success: !0, target: this._genMoveTargetReturn(o, !0) };
          }return a.respondError('Supplied node is not of type "menu"'), { success: !1, target: 0 };
        }, t;
      }(), t;
    }();e.Instance = t;
  })(f || (f = {}));var b;(function (e) {
    function t(e) {
      if ('<all_urls>' === e) return '<all_urls>';try {
        var t = e.split('://'),
            s = t[0],
            n = t[1],
            a = n.split('/'),
            o = a[0],
            r = a.slice(1);return { scheme: s, host: o, path: r.join('/') };
      } catch (t) {
        return { scheme: '*', host: '*', path: '*', invalid: !0 };
      }
    }function s(e, t) {
      return !('*' !== e) || e === t;
    }function n(e, t) {
      if ('*' === e) return !0;if ('*' === e[0]) {
        var s = e.slice(2),
            n = t.indexOf(s);return n === t.length - s.length;
      }return e === t;
    }function a(e, t) {
      var s = e.split('*'),
          n = s.length;if (0 === n - 1) return e === t;if (0 !== t.indexOf(s[0])) return !1;t = t.slice(s[0].length);for (var a = 1; a < n; a++) {
        if (-1 === t.indexOf(s[a])) return !1;t = t.slice(s[a].length);
      }return !0;
    }e.initModule = function (t) {
      e.modules = t;
    }, e.triggerMatchesScheme = function (e) {
      var t = /(file:\/\/\/.*|(\*|http|https|file|ftp):\/\/(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(\/(.*))?|(<all_urls>))/;return t.test(e);
    }, e.prepareTrigger = function (e) {
      if ('<all_urls>' === e) return e;if ('' === e.replace(/\s/g, '')) return null;var t = e.split('//'),
          s;return 1 === t.length && (s = 'http://' + e, t[1] = t[0]), s = -1 === t[1].indexOf('/') ? e + '/' : e, s;
    }, e.urlMatchesPattern = function (e, o) {
      var r;try {
        r = t(o);
      } catch (t) {
        return !1;
      }if ('<all_urls>' === r) return !0;var l = r;return s(e.scheme, l.scheme) && n(e.host, l.host) && a(e.path, l.path);
    }, e.validatePatternUrl = function (s) {
      if (!s || 'string' !== typeof s) return null;s = s.trim();var n = t(s);if ('<all_urls>' === n) return { scheme: '*', host: '*', path: '*' };var a = n;if (a.invalid) return null;var o = e.modules.constants.validSchemes,
          r = o.indexOf(a.scheme);if (-1 === r) return null;var l = a.host.indexOf('*');if (-1 < l) {
        if (2 < a.host.split('*').length) return null;if (0 !== l || '.' !== a.host[1]) return null;if (1 < a.host.slice(2).split('/').length) return null;
      }return a;
    }, e.matchesUrlSchemes = function (s, n) {
      for (var a = !1, o = 0, r = s; o < r.length; o++) {
        var l = r[o],
            i = l.not,
            d = l.url;if (!(0 === d.indexOf('/') && e.modules.Util.endsWith(d, '/'))) try {
          var c = t(d);if ('<all_urls>' === c) {
            if (i) return !1;a = !0;continue;
          }var u = t(n);if (c.invalid || u.invalid) throw new Error('nomatch');if ('*' !== c.scheme && c.scheme !== u.scheme) throw new Error('nomatch');if (2 < c.host.split('.').length || 0 === c.host.indexOf('*.')) {
            var p = u.host;if (0 === p.indexOf('www.') && (p = p.slice(4)), 0 === c.host.indexOf('*.') && (c.host = c.host.slice(2), p = p.split('.').slice(-2).join('.')), '*' !== c.host && c.host !== p) throw new Error('nomatch');
          } else if ('*' !== c.host && c.host !== u.host.split('.').slice(-2).join('.')) throw new Error('nomatch');if ('*' !== c.path && !new RegExp('^' + c.path.replace(/\*/g, '(.*)') + '$').test(u.path)) throw new Error('nomatch');if (i) return !1;a = !0;
        } catch (t) {
          if (new RegExp('^' + d.replace(/\*/g, '(.*)') + '$').test(n)) {
            if (i) return !1;a = !0;
          }
        } else if (new RegExp(d.slice(1, d.length - 1)).test(n)) {
          if (i) return !1;a = !0;
        }
      }return a;
    };
  })(b || (b = {}));var x = function x(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      v = function v(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      I;(function (e) {
    var t;(function (t) {
      t.handle = function (t) {
        e.handle(t, t.name);
      };
    })(t = e.Resource || (e.Resource = {}));
  })(I || (I = {})), function (e) {
    var t;(function (t) {
      t.handle = function (t) {
        e.handle(t, t.url);
      };
    })(t = e.Anonymous || (e.Anonymous = {}));
  }(I || (I = {})), function (e) {
    function t(t, s, n) {
      if (e.modules.storages.urlDataPairs.get(s)) {
        var a = e.modules.storages.urlDataPairs.get(s);-1 === a.refs.indexOf(t) && a.refs.push(t), n(a.dataURI, a.dataString);
      } else e.modules.Util.convertFileToDataURI(s, function (a, o) {
        e.modules.storages.urlDataPairs.set(s, { dataURI: a, dataString: o, refs: [t] }), n(a, o);
      });
    }function s(e) {
      var t = [],
          s = e.split('#')[1];if (!s) return [];var n = s.split(/[,|;]/g);return n.forEach(function (e) {
        var s = e.split('=');t.push({ algorithm: s[0], hash: s[1] });
      }), t;
    }function n(e, t, s) {
      window.crypto.subtle.digest(e, t).then(function (e) {
        return String.fromCharCode.apply(null, e) === s.hash;
      });
    }function a(e) {
      for (var t = 0, s = 0; s < e.length; s++) {
        if (48 <= e.charCodeAt(s) && 57 >= e.charCodeAt(s)) {
          t = s;break;
        }
      }return e.slice(0, t).toUpperCase() + '-' + e.slice(t);
    }function o(t, s) {
      if (0 === t.length) return !0;var o = null;t = t.reverse();for (var r = 0, l = t; r < l.length; r++) {
        var i = l[r],
            d = i.algorithm,
            c = i.hash,
            u = d.toLowerCase();if (-1 !== e.modules.constants.supportedHashes.indexOf(u)) {
          o = { algorithm: u, hash: c };break;
        }
      }if (null === o) return !1;var p = new window.TextEncoder('utf-8').encode(s);switch (o.algorithm) {case 'md5':
          return window.md5(s) === o.hash;case 'sha1':case 'sha384':case 'sha512':
          n(a(o.algorithm), p, o);}return !1;
    }function r(n, a, r) {
      var l = s(a);window.navigator.onLine && t(r, a, function (t, s) {
        var i = e.modules.storages.resources;e.modules.Util.setMapDefault(i, r, {}), i.get(r)[n] = { name: n, sourceUrl: a, dataURI: t, dataString: s, hashes: l, matchesHashes: o(l, s), crmUrl: 'https://www.localhost.io/resource/' + r + '/' + n }, browserAPI.storage.local.set({ resources: e.modules.Util.fromMap(i), urlDataPairs: e.modules.Util.fromMap(e.modules.storages.urlDataPairs) });
      });for (var i = e.modules.storages.resourceKeys, d = 0, c = i, u; d < c.length; d++) {
        if (u = c[d], u.name === n && u.scriptId === r) return;
      }i.push({ name: n, sourceUrl: a, hashes: l, scriptId: r }), browserAPI.storage.local.set({ resourceKeys: i });
    }function l(t, s) {
      for (var n = 0; n < e.modules.storages.resourceKeys.length; n++) {
        if (e.modules.storages.resourceKeys[n].name === t && e.modules.storages.resourceKeys[n].scriptId === s) {
          e.modules.storages.resourceKeys.splice(n, 1);break;
        }
      }if (e.modules.storages.resources.has(s) && e.modules.storages.resources.get(s)[t] && e.modules.storages.resources.get(s)[t].sourceUrl) {
        var a = e.modules.storages.resources.get(s)[t].sourceUrl,
            o = e.modules.storages.urlDataPairs.get(a);o && (o.refs.splice(o.refs.indexOf(s), 1), 0 === o.refs.length && e.modules.storages.urlDataPairs['delete'](a)), e.modules.storages.resources && e.modules.storages.resources.has(s) && e.modules.storages.resources.get(s)[t] && delete e.modules.storages.resources.get(s)[t], browserAPI.storage.local.set({ resourceKeys: e.modules.storages.resourceKeys, resources: e.modules.Util.fromMap(e.modules.storages.resources), urlDataPairs: e.modules.Util.fromMap(e.modules.storages.urlDataPairs) });
      }
    }function i(t) {
      var s = e.modules.storages.resources;e.modules.Util.convertFileToDataURI(t.sourceUrl, function (n, a) {
        if (!(s.has(t.scriptId) && s.get(t.scriptId)[t.name]) || s.get(t.scriptId)[t.name].dataURI !== n) {
          var r = s.get(t.scriptId)[t.name];if (o(r.hashes, a)) {
            var l = e.modules.storages.urlDataPairs.get(t.sourceUrl);l.dataURI = n, l.dataString = a, browserAPI.storage.local.set({ resources: e.modules.Util.fromMap(s), urlDataPairs: e.modules.Util.fromMap(e.modules.storages.urlDataPairs) });
          }
        }
      });
    }function d(e) {
      var t = this;return function () {
        return x(t, void 0, void 0, function () {
          var t, s;return v(this, function (n) {
            switch (n.label) {case 0:
                return s = (t = window).info, [4, window.__('background_init_resourceUpdate')];case 1:
                return s.apply(t, [n.sent()]), i(e), [2];}
          });
        });
      };
    }e.initModule = function (t) {
      e.modules = t;
    }, e.handle = function (e, t) {
      switch (e.type) {case 'register':
          r(t, e.url, e.scriptId);break;case 'remove':
          l(t, e.scriptId);}
    }, e.updateResourceValues = function () {
      for (var t = e.modules.storages.resourceKeys, s = 0; s < t.length; s++) {
        setTimeout(d(t[s]), 1e3 * s);
      }
    };
  }(I || (I = {}));var _S = function S() {
    return _S = Object.assign || function (e) {
      for (var t = 1, a = arguments.length, n; t < a; t++) {
        for (var s in n = arguments[t], n) {
          Object.prototype.hasOwnProperty.call(n, s) && (e[s] = n[s]);
        }
      }return e;
    }, _S.apply(this, arguments);
  },
      _ = function _(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      k = function k(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      C;(function (e) {
    var t;(function (e) {
      var t;(function (e) {
        var t;(function (e) {
          var t;(function (t) {
            function s(e, t) {
              switch (e.type) {case 'Identifier':
                  if ('localStorage' === e.name) return t.script = t.script.slice(0, e.start) + 'localStorageProxy' + t.script.slice(e.end), t.lines = t.script.split('\n'), !0;break;case 'VariableDeclaration':
                  for (var n = 0, a; n < e.declarations.length; n++) {
                    if (a = e.declarations[n], a.init && s(a.init, t)) return !0;
                  }break;case 'MemberExpression':
                  return !!s(e.object, t) || s(e.property, t);case 'CallExpression':
                  if (e.arguments && 0 < e.arguments.length) for (var n = 0; n < e.arguments.length; n++) {
                    if (s(e.arguments[n], t)) return !0;
                  }if (e.callee) return s(e.callee, t);break;case 'AssignmentExpression':
                  return s(e.right, t);case 'FunctionExpression':case 'FunctionDeclaration':
                  for (var n = 0; n < e.body.body.length; n++) {
                    if (s(e.body.body[n], t)) return !0;
                  }break;case 'ExpressionStatement':
                  return s(e.expression, t);case 'SequenceExpression':
                  for (var n = 0; n < e.expressions.length; n++) {
                    if (s(e.expressions[n], t)) return !0;
                  }break;case 'UnaryExpression':case 'ConditionalExpression':
                  return !!s(e.consequent, t) || s(e.alternate, t);case 'IfStatement':
                  if (s(e.consequent, t)) return !0;if (e.alternate) return s(e.alternate, t);break;case 'LogicalExpression':case 'BinaryExpression':
                  return !!s(e.left, t) || s(e.right, t);case 'BlockStatement':
                  for (var n = 0; n < e.body.length; n++) {
                    if (s(e.body[n], t)) return !0;
                  }break;case 'ReturnStatement':
                  return s(e.argument, t);case 'ObjectExpressions':
                  for (var n = 0; n < e.properties.length; n++) {
                    if (s(e.properties[n].value, t)) return !0;
                  }}return !1;
            }function n(e) {
              for (var t = 0, s = [], n = 0; n < e.length; n++) {
                s.push({ start: t, end: t += e[n].length + 1 });
              }return s;
            }function a(t) {
              var o = new e.TernFile('[doc]');o.text = t.join('\n');var r = new window.CodeMirror.TernServer({ defs: [] });window.tern.withContext(r.cx, function () {
                o.ast = window.tern.parse(o.text, r.passes, { directSourceFile: o, allowReturnOutsideFunction: !0, allowImportExportEverywhere: !0, ecmaVersion: r.ecmaVersion });
              });for (var l = o.ast.body, d = o.text, c = { lines: t, lineSeperators: n(t), script: d }, u = 0, i; u < l.length; u++) {
                if (i = l[u], s(i, c)) return a(c.lines);
              }return c.script;
            }t.replaceCalls = a;
          })(t = e.LocalStorageReplace || (e.LocalStorageReplace = {}));
        })(t = e.LegacyScriptReplace || (e.LegacyScriptReplace = {}));
      })(t = e.TransferFromOld || (e.TransferFromOld = {}));
    })(t = e.SetupHandling || (e.SetupHandling = {}));
  })(C || (C = {})), function (e) {
    var t;(function (e) {
      var t;(function (e) {
        var t;(function (e) {
          var t;(function (t) {
            function s(e, t) {
              return !(e !== t) || e.replace(/['|"|`]/g, '') === t;
            }function n(e, t, s) {
              for (var n = {}, a = 0, o; a < e.length; a++) {
                if (o = e[a], o.start <= t && (n.from = { index: o.start, line: a }), o.end >= s) {
                  n.to = { index: o.end, line: a };break;
                }
              }return n;
            }function a(e) {
              for (var t = e.parentExpressions.length - 1, s = e.parentExpressions[t]; s && 'CallExpression' !== s.type;) {
                s = e.parentExpressions[--t];
              }return e.parentExpressions[t];
            }function o(e, t) {
              t.functionCall = t.functionCall.map(function (e) {
                return e.replace(/['|"|`]/g, '');
              });var s = t.functionCall;s = s.reverse(), 'chrome' === s[0] && s.splice(0, 1);var n = e.callee.end,
                  a = e.end,
                  o = t.persistent.script.slice(n, a);return { call: s.join('.'), args: o };
            }function r(e, t, s) {
              for (var n = 0; n < t; n++) {
                s -= e[n].length + 1;
              }return s;
            }function l(e, t, s) {
              if (!e.isReturn || e.isValidReturn) {
                for (var n = e.persistent.lines, a = o(t, e), l = e.persistent.lines[s.from.line], d = r(e.persistent.lines, s.from.line, e.returnExpr && e.returnExpr.start || t.callee.start), c = r(e.persistent.lines, s.from.line, t.callee.end), u = l.slice(0, d) + ('window.crmAPI.chrome(\'' + a.call + '\')'), p = null, g; ' ' === u[p = u.length - 1];) {
                  u = u.slice(0, p);
                }if (';' === u[p = u.length - 1] && (u = u.slice(0, p)), '()' !== a.args) {
                  var i = a.args.split('\n');for (u += i[0], g = 1; g < i.length; g++) {
                    n[s.from.line + g] = i[g];
                  }
                }if (e.isReturn) {
                  for (var m = l.slice(c + a.args.split('\n')[0].length); 0 === m.indexOf(';');) {
                    m = m.slice(1);
                  }u += '.return(function(' + e.returnName + ') {' + m;for (var h = !0, y = 0, f = 0; f < e.persistent.lines.length; f++) {
                    if (0 === e.persistent.lines[f].indexOf('\t')) {
                      h = !0;break;
                    } else if (0 === e.persistent.lines[f].indexOf('  ')) {
                      for (var b = e.persistent.lines[f].split(' '), x = 0; x < b.length && ' ' === b[x]; x++) {
                        y++;
                      }h = !1;break;
                    }
                  }var v;h ? v = '\t' : (v = [], v[y] = ' ', v = v.join(' '));var I = null,
                      S = null;for (g = e.parentExpressions.length - 1; null === I && 0 !== g; g--) {
                    if ('BlockStatement' === e.parentExpressions[g].type || 'FunctionExpression' === e.parentExpressions[g].type && 'BlockStatement' === e.parentExpressions[g].body.type) {
                      for (I = r(e.persistent.lines, s.from.line, e.parentExpressions[g].end), S = 0; 0 < I;) {
                        I = r(e.persistent.lines, s.from.line + ++S, e.parentExpressions[g].end);
                      }I = r(e.persistent.lines, s.from.line + (S - 1), e.parentExpressions[g].end);
                    }
                  }null === S && (S = n.length - s.from.line + 1);for (var _ = 0, k = n[s.from.line]; 0 === k.indexOf(v);) {
                    k = k.replace(v, ''), _++;
                  }var C = [],
                      M;C[_] = '';var T = C.join(v) + '}).send();',
                      w = e.persistent.lines.length + 1;for (g = s.from.line; g < s.from.line + (S - 1); g++) {
                    n[g] = v + n[g];
                  }for (g = s.from.line + (S - 1); g < w; g++) {
                    M = n[g], n[g] = T, T = M;
                  }
                } else n[s.from.line + (g - 1)] = n[s.from.line + (g - 1)] + '.send();', 1 === g && (u += '.send();');n[s.from.line] = u;
              }
            }function d(e, t, o) {
              if (t.parentExpressions.push(e), e.arguments && 0 < e.arguments.length) for (var p = 0; p < e.arguments.length; p++) {
                if (u(e.arguments[p], c(t), o)) return !0;
              }if ('MemberExpression' !== e.type) return u(e, c(t), o);if (e.property && (t.functionCall = t.functionCall || [], t.functionCall.push(e.property.name || e.property.raw)), e.object && e.object.name) {
                var i = s(e.object.name, 'window') && s(e.property.name || e.property.raw, 'chrome');if (i || s(e.object.name, 'chrome')) {
                  t.expression = e;var g = a(t),
                      m = n(t.persistent.lineSeperators, g.start, g.end);return t.isReturn && !t.isValidReturn ? (m.from.index = r(t.persistent.lines, m.from.line, m.from.index), m.to.index = r(t.persistent.lines, m.to.line, m.to.index), o(m, t.persistent.passes), !1) : (t.persistent.diagnostic || l(t, g, m), !0);
                }
              } else if (e.object) return d(e.object, t, o);return !1;
            }function c(e) {
              var t = e.parentExpressions || [],
                  s = {};for (var n in e) {
                e.hasOwnProperty(n) && 'parentExpressions' !== n && 'persistent' !== n && (s[n] = e[n]);
              }for (var a = [], o = 0; o < t.length; o++) {
                a.push(t[o]);
              }return s.persistent = e.persistent, s.parentExpressions = a, s;
            }function u(e, t, s) {
              switch (t.parentExpressions = t.parentExpressions || [], t.parentExpressions.push(e), e.type) {case 'VariableDeclaration':
                  t.isValidReturn = 1 === e.declarations.length;for (var n = 0, a; n < e.declarations.length; n++) {
                    if (a = e.declarations[n], a.init) {
                      var o = c(t),
                          r = a.id.name;if (o.isReturn = !0, o.returnExpr = e, o.returnName = r, u(a.init, o, s)) return !0;
                    }
                  }break;case 'CallExpression':case 'MemberExpression':
                  var l = [];if (e.arguments && 0 < e.arguments.length) for (var n = 0; n < e.arguments.length; n++) {
                    if ('MemberExpression' !== e.arguments[n].type && 'CallExpression' !== e.arguments[n].type) l.push(e.arguments[n]);else if (u(e.arguments[n], c(t), s)) return !0;
                  }if (t.functionCall = [], e.callee && d(e.callee, t, s)) return !0;for (var n = 0; n < l.length; n++) {
                    if (u(l[n], c(t), s)) return !0;
                  }break;case 'AssignmentExpression':
                  return t.isReturn = !0, t.returnExpr = e, t.returnName = e.left.name, u(e.right, t, s);case 'FunctionExpression':case 'FunctionDeclaration':
                  t.isReturn = !1;for (var n = 0; n < e.body.body.length; n++) {
                    if (u(e.body.body[n], c(t), s)) return !0;
                  }break;case 'ExpressionStatement':
                  return u(e.expression, t, s);case 'SequenceExpression':
                  t.isReturn = !1;for (var i = e.expressions.length - 1, n = 0; n < e.expressions.length; n++) {
                    if (n === i && (t.isReturn = !0), u(e.expressions[n], c(t), s)) return !0;
                  }break;case 'UnaryExpression':case 'ConditionalExpression':
                  if (t.isValidReturn = !1, t.isReturn = !0, u(e.consequent, c(t), s)) return !0;if (u(e.alternate, c(t), s)) return !0;break;case 'IfStatement':
                  if (t.isReturn = !1, u(e.consequent, c(t), s)) return !0;if (e.alternate && u(e.alternate, c(t), s)) return !0;break;case 'LogicalExpression':case 'BinaryExpression':
                  if (t.isReturn = !0, t.isValidReturn = !1, u(e.left, c(t), s)) return !0;if (u(e.right, c(t), s)) return !0;break;case 'BlockStatement':
                  t.isReturn = !1;for (var n = 0; n < e.body.length; n++) {
                    if (u(e.body[n], c(t), s)) return !0;
                  }break;case 'ReturnStatement':
                  return t.isReturn = !0, t.returnExpr = e, t.isValidReturn = !1, u(e.argument, t, s);case 'ObjectExpressions':
                  t.isReturn = !0, t.isValidReturn = !1;for (var n = 0; n < e.properties.length; n++) {
                    if (u(e.properties[n].value, c(t), s)) return !0;
                  }}return !1;
            }function i(e) {
              return function (t, s) {
                e[s] ? e[s].push(t) : e[s] = [t];
              };
            }function p(t, s, n) {
              var a = new e.TernFile('[doc]');a.text = t.join('\n');var o = new window.CodeMirror.TernServer({ defs: [] });window.tern.withContext(o.cx, function () {
                a.ast = window.tern.parse(a.text, o.passes, { directSourceFile: a, allowReturnOutsideFunction: !0, allowImportExportEverywhere: !0, ecmaVersion: o.ecmaVersion });
              });for (var r = a.ast.body, l = 0, d = [], c = 0; c < t.length; c++) {
                d.push({ start: l, end: l += t[c].length + 1 });
              }var i = a.text,
                  g = { lines: t, lineSeperators: d, script: i, passes: s },
                  m;if (0 === s) {
                g.diagnostic = !0;for (var c = 0; c < r.length; c++) {
                  m = r[c], u(m, { persistent: g }, n);
                }g.diagnostic = !1;
              }for (var c = 0; c < r.length; c++) {
                if (m = r[c], u(m, { persistent: g }, n)) {
                  i = p(g.lines.join('\n').split('\n'), s + 1, n);break;
                }
              }return i;
            }function g(e) {
              var t = [];return e.forEach(function (e, s) {
                t[s] = JSON.stringify(e);
              }), t = t.filter(function (e, s) {
                return t.indexOf(e) === s;
              }), t.map(function (e) {
                return JSON.parse(e);
              });
            }t.replace = function (e, t) {
              var s = e.indexOf('/*execute locally*/');-1 !== s && (e = e.replace('/*execute locally*/\n', ''), s === e.indexOf('/*execute locally*/') && (e = e.replace('/*execute locally*/', '')));var n = [];try {
                e = p(e.split('\n'), 0, i(n));
              } catch (s) {
                return t(null, null, !0), e;
              }var a = n[0],
                  o = n[n.length - 1];return o && t(g(a), g(o)), e;
            };
          })(t = e.ChromeCallsReplace || (e.ChromeCallsReplace = {}));
        })(t = e.LegacyScriptReplace || (e.LegacyScriptReplace = {}));
      })(t = e.TransferFromOld || (e.TransferFromOld = {}));
    })(t = e.SetupHandling || (e.SetupHandling = {}));
  }(C || (C = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        var s;(function (t) {
          function s(t) {
            var s = this;return function (n, a, o) {
              return _(s, void 0, void 0, function () {
                var s, r;return k(this, function (l) {
                  switch (l.label) {case 0:
                      return [4, browserAPI.storage.local.get()];case 1:
                      return s = l.sent().upgradeErrors, r = void 0 === s ? {} : s, r[t] = e.modules.storages.storageLocal.upgradeErrors[t] = { oldScript: n, newScript: a, generalError: o }, browserAPI.storage.local.set({ upgradeErrors: r }), [2];}
                });
              });
            };
          }var n = function () {
            return function (e) {
              this.name = e;
            };
          }();t.TernFile = n, t.generateScriptUpgradeErrorHandler = s, t.convertScriptFromLegacy = function (e, n, a) {
            var o = !1,
                r = e.indexOf('/*execute locally*/');-1 !== r && (e = e.replace('/*execute locally*/\n', ''), r === e.indexOf('/*execute locally*/') && (e = e.replace('/*execute locally*/', '')), o = !0);try {
              switch (a) {case 0:
                  e = t.ChromeCallsReplace.replace(e, s(n));break;case 1:
                  e = o ? t.LocalStorageReplace.replaceCalls(e.split('\n')) : e;break;case 2:
                  var l = o ? t.LocalStorageReplace.replaceCalls(e.split('\n')) : e;e = t.ChromeCallsReplace.replace(l, s(n));}
            } catch (t) {
              return e;
            }return e;
          };
        })(s = t.LegacyScriptReplace || (t.LegacyScriptReplace = {}));
      })(s = t.TransferFromOld || (t.TransferFromOld = {}));
    })(t = e.SetupHandling || (e.SetupHandling = {}));
  }(C || (C = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        function s() {
          if ('undefined' !== typeof localStorage && ('undefined' !== typeof window.indexedDB || 'undefined' !== typeof window.webkitIndexedDB)) {
            var e = JSON.stringify(localStorage),
                t = window.indexedDB || window.webkitIndexedDB,
                s = t.open('localStorageBackup', 1);s.onerror = function () {
              window.log('Error backing up localStorage data');
            }, s.onupgradeneeded = function (t) {
              var s = t.target.result,
                  n = s.createObjectStore('data', { keyPath: 'id' });n.add({ id: 0, data: e });
            };
          }
        }function n(t, s, n) {
          return _(this, void 0, void 0, function () {
            var a, o, r, l, i, d, c, u, p, g, m, h, y, f, b, x, v, I, S, _, C;return k(this, function (k) {
              switch (k.label) {case 0:
                  return o = t.split('%123'), r = o[0], l = o[1], i = o[2], d = l.toLowerCase(), 'link' === d ? [3, 1] : 'divider' === d ? [3, 3] : 'menu' === d ? [3, 5] : 'script' === d ? [3, 7] : [3, 9];case 1:
                  return c = void 0, c = -1 < i.indexOf(', ') ? i.split(', ') : i.split(','), p = (u = e.modules.constants.templates).getDefaultLinkNode, g = { name: r }, [4, e.modules.Util.generateItemId()];case 2:
                  return a = p.apply(u, [(g.id = k.sent(), g.value = c.map(function (e) {
                    return { newTab: s, url: e };
                  }), g)]), [3, 9];case 3:
                  return h = (m = e.modules.constants.templates).getDefaultDividerNode, y = { name: r }, [4, e.modules.Util.generateItemId()];case 4:
                  return a = h.apply(m, [(y.id = k.sent(), y.isLocal = !0, y)]), [3, 9];case 5:
                  return b = (f = e.modules.constants.templates).getDefaultMenuNode, x = { name: r }, [4, e.modules.Util.generateItemId()];case 6:
                  return a = b.apply(f, [(x.id = k.sent(), x.children = i, x.isLocal = !0, x)]), [3, 9];case 7:
                  return v = i.split('%124'), I = v[0], S = v[1], _ = void 0, '0' !== I && '2' !== I && (_ = I.split('1,')[1].split(','), _ = _.map(function (e) {
                    return { not: !1, url: e.trim() };
                  }).filter(function (e) {
                    return '' !== e.url;
                  }), I = '2'), [4, e.modules.Util.generateItemId()];case 8:
                  return C = k.sent(), a = e.modules.constants.templates.getDefaultScriptNode({ name: r, id: C, value: { launchMode: parseInt(I, 10), updateNotice: !0, oldScript: S, script: e.SetupHandling.TransferFromOld.LegacyScriptReplace.convertScriptFromLegacy(S, C, n) }, isLocal: !0 }), _ && (a.triggers = _), [3, 9];case 9:
                  return [2, a];}
            });
          });
        }function a(e, t, s, n) {
          for (; 0 !== n && t[s.index]; s.index++, n--) {
            var o = t[s.index];if ('menu' === o.type) {
              var r = ~~o.children;o.children = [], s.index++, a(o.children, t, s, r), s.index--;
            }e.push(o);
          }
        }t.transferCRMFromOld = function (t, o, r) {
          return void 0 === o && (o = localStorage), void 0 === r && (r = 2), _(this, void 0, void 0, function () {
            var l, d, c, i, u, p;return k(this, function (g) {
              switch (g.label) {case 0:
                  return s(), [4, e.SetupHandling.loadTernFiles()];case 1:
                  g.sent(), l = parseInt(o.getItem('numberofrows'), 10) + 1, d = [], c = 1, g.label = 2;case 2:
                  return c < l ? (u = (i = d).push, [4, n(o.getItem(c + ''), t, r)]) : [3, 5];case 3:
                  u.apply(i, [g.sent()]), g.label = 4;case 4:
                  return c++, [3, 2];case 5:
                  return p = [], a(p, d, { index: 0 }, d.length), [2, p];}
            });
          });
        };
      })(s = t.TransferFromOld || (t.TransferFromOld = {}));
    })(t = e.SetupHandling || (e.SetupHandling = {}));
  }(C || (C = {})), function (e) {
    var t;(function (t) {
      function s() {
        return _(this, void 0, void 0, function () {
          var t, s, a, o, r;return k(this, function (l) {
            switch (l.label) {case 0:
                return [4, n()];case 1:
                return t = l.sent(), s = window.md5(JSON.stringify(t)), [4, e.modules.Util.isTamperMonkeyEnabled()];case 2:
                return a = l.sent(), [4, e.modules.Util.isStylishInstalled()];case 3:
                return o = l.sent(), r = { requestPermissions: [], editing: null, selectedCrmType: [!0, !0, !0, !0, !0, !0], jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'], globalExcludes: [''], useStorageSync: !0, notFirstTime: !0 }, [4, browserAPI.runtime.getManifest()];case 4:
                return [2, [(r.lastUpdatedAt = l.sent().version, r.authorName = 'anonymous', r.showOptions = !0, r.recoverUnsavedData = !1, r.CRMOnPage = !1, r.editCRMInRM = !0, r.catchErrors = !0, r.useAsUserscriptInstaller = !a, r.useAsUserstylesInstaller = !o, r.hideToolsRibbon = !1, r.shrinkTitleRibbon = !1, r.libraries = [], r.settingsVersionData = { current: { hash: s, date: new Date().getTime() }, latest: { hash: s, date: new Date().getTime() }, wasUpdated: !1 }, r.nodeStorage = {}, r.resources = {}, r.resourceKeys = [], r.urlDataPairs = {}, r), t]];}
          });
        });
      }function n() {
        return _(this, void 0, void 0, function () {
          var t, s, n, a;return k(this, function (o) {
            switch (o.label) {case 0:
                return t = { editor: { keyBindings: { goToDef: 'Alt-.', rename: 'Ctrl-Q' }, cssUnderlineDisabled: !1, disabledMetaDataHighlight: !1, theme: 'dark', zoom: '100' } }, n = (s = e.modules.constants.templates).getDefaultLinkNode, a = {}, [4, e.modules.Util.generateItemId()];case 1:
                return [2, (t.crm = [n.apply(s, [(a.id = o.sent(), a.isLocal = !0, a)])], t.settingsLastUpdatedAt = new Date().getTime(), t.latestId = e.modules.globalObject.globals.latestId, t.rootName = 'Custom Menu', t.nodeStorageSync = {}, t)];}
          });
        });
      }function a(t) {
        return _(this, void 0, void 0, function () {
          var a = this,
              o,
              r,
              i,
              d,
              c,
              u,
              p;return k(this, function (g) {
            switch (g.label) {case 0:
                return window.localStorage.setItem('transferToVersion2', 'true'), o = { done: !1, onDone: null }, [4, s()];case 1:
                return r = g.sent()[0], browserAPI.storage.local.set(r), [4, function () {
                  return _(a, void 0, void 0, function () {
                    var t, s, n, a;return k(this, function (o) {
                      switch (o.label) {case 0:
                          return e.supportsStorageSync() ? [4, browserAPI.storage.sync.get()] : [2, {}];case 1:
                          return (t = o.sent(), !t) ? [2, {}] : (s = e.parseCutData(t), n = s.data, a = s.syncEnabled, a ? [2, n] : [2, {}]);}
                    });
                  });
                }()];case 2:
                return i = g.sent(), c = [{ crm: t }], [4, n()];case 3:
                return d = _S.apply(void 0, c.concat([g.sent(), i])), l(d), r.settingsVersionData.current.hash = r.settingsVersionData.latest.hash = window.md5(JSON.stringify(d)), r.settingsVersionData.current.date = r.settingsVersionData.latest.date = d.settingsLastUpdatedAt, 0 < Object.getOwnPropertyNames(i).length && (r.settingsVersionData.wasUpdated = !0), u = JSON.parse(JSON.stringify(r)), p = { settingsStorage: d, storageLocalCopy: u, chromeStorageLocal: r }, o.value = p, [2, p];}
          });
        });
      }function o() {
        return new Promise(function (t, s) {
          r(['/js/libraries/tern/walk.js', '/js/libraries/tern/signal.js', '/js/libraries/tern/acorn.js', '/js/libraries/tern/tern.js', '/js/libraries/tern/ternserver.js', '/js/libraries/tern/def.js', '/js/libraries/tern/comment.js', '/js/libraries/tern/infer.js'].map(function (t) {
            return function () {
              return e.modules.Util.execFile(t);
            };
          })).then(function () {
            t(null);
          }, function (e) {
            s(e);
          });
        });
      }function r(e, t) {
        return void 0 === t && (t = 0), new Promise(function (s, n) {
          e[t]().then(function (a) {
            t + 1 >= e.length ? s(a) : r(e, t + 1).then(function (e) {
              s(e);
            }, function (e) {
              n(e);
            });
          }, function (e) {
            n(e);
          });
        });
      }function l(t) {
        return _(this, void 0, void 0, function () {
          var s = this,
              n,
              a;return k(this, function (o) {
            switch (o.label) {case 0:
                return n = JSON.stringify(t), !(101400 <= n.length) && e.supportsStorageSync() ? [3, 5] : [4, browserAPI.storage.local.set({ useStorageSync: !1 })];case 1:
                return o.sent(), [4, browserAPI.storage.local.set({ settings: t })];case 2:
                return o.sent(), e.supportsStorageSync() ? [4, browserAPI.storage.sync.set({ indexes: -1 })] : [3, 4];case 3:
                o.sent(), o.label = 4;case 4:
                return [3, 8];case 5:
                return [4, browserAPI.storage.sync.clear()];case 6:
                return o.sent(), a = e.cutData(n), [4, browserAPI.storage.sync.set(a).then(function () {
                  browserAPI.storage.local.set({ settings: null });
                })['catch'](function (n) {
                  return _(s, void 0, void 0, function () {
                    return k(this, function (s) {
                      switch (s.label) {case 0:
                          return window.logAsync(window.__('background_storages_syncUploadError'), n), e.modules.storages.storageLocal.useStorageSync = !1, [4, browserAPI.storage.local.set({ useStorageSync: !1 })];case 1:
                          return s.sent(), [4, browserAPI.storage.local.set({ settings: t })];case 2:
                          return s.sent(), [4, browserAPI.storage.sync.set({ indexes: -1 })];case 3:
                          return s.sent(), [2];}
                    });
                  });
                })];case 7:
                o.sent(), o.label = 8;case 8:
                return [2];}
          });
        });
      }t.handleFirstRun = a, t.handleTransfer = function () {
        return _(this, void 0, void 0, function () {
          var e, s;return k(this, function (n) {
            switch (n.label) {case 0:
                return window.localStorage.setItem('transferToVersion2', 'true'), browserAPI.storage.local.set({ isTransfer: !0 }), window.CodeMirror && window.CodeMirror.TernServer ? [3, 2] : [4, new Promise(function (e) {
                  o().then(function () {
                    e(null);
                  }, function (e) {
                    window.log('Failed to load tern files', e);
                  });
                })];case 1:
                n.sent(), n.label = 2;case 2:
                return e = 'true' === window.localStorage.getItem('whatpage'), s = a, [4, t.TransferFromOld.transferCRMFromOld(e)];case 3:
                return [4, s.apply(void 0, [n.sent()])];case 4:
                return [2, n.sent()];}
          });
        });
      }, t.loadTernFiles = o;
    })(t = e.SetupHandling || (e.SetupHandling = {}));
  }(C || (C = {})), function (t) {
    function e() {
      return 'sync' in BrowserAPI.getSrc().storage && 'get' in BrowserAPI.getSrc().storage.sync;
    }function s(e, s) {
      var n = null;return t.modules.Util.crmForEach(s, function (t) {
        t.id === e && (n = t);
      }), n;
    }function n(e, s) {
      if (!e) {
        var n = [];return t.modules.Util.crmForEach(s, function (e) {
          n.push(e);
        }), { additions: n, removals: [], same: [] };
      }var o = [];t.modules.Util.crmForEach(e, function (e) {
        o.push(e.id);
      });var r = [];t.modules.Util.crmForEach(s, function (e) {
        r.push(e.id);
      });for (var l = [], i = [], d = [], c = 0, u = o, p; c < u.length; c++) {
        p = u[c], -1 === r.indexOf(p) && i.push(a(e, p));
      }for (var g = 0, m = r, h; g < m.length; g++) {
        h = m[g], -1 === o.indexOf(h) ? l.push(a(s, h)) : d.push(a(s, h));
      }return { additions: l, removals: i, same: d };
    }function a(e, t) {
      for (var s = 0, n = e, o; s < n.length; s++) {
        if (o = n[s], o.id === t) return o;if ('menu' === o.type && o.children) {
          var r = a(o.children, t);if (r) return r;
        }
      }return null;
    }function o(s) {
      return _(this, void 0, void 0, function () {
        var n = this,
            a,
            o;return k(this, function (l) {
          switch (l.label) {case 0:
              return a = JSON.stringify(t.modules.storages.settingsStorage), [4, browserAPI.storage.local.set({ settingsVersionData: { current: { hash: window.md5(a), date: new Date().getTime() }, latest: t.modules.storages.storageLocal.settingsVersionData.latest, wasUpdated: t.modules.storages.storageLocal.settingsVersionData.wasUpdated } })];case 1:
              return (l.sent(), t.modules.storages.storageLocal.useStorageSync && e()) ? [3, 7] : S ? (I = JSON.stringify(t.modules.storages.settingsStorage), [4, c(s)]) : [3, 5];case 2:
              return l.sent(), e() ? [4, browserAPI.storage.sync.set({ indexes: -1 })] : [3, 4];case 3:
              l.sent(), l.label = 4;case 4:
              return [2];case 5:
              return [4, browserAPI.storage.local.set({ settings: t.modules.storages.settingsStorage }).then(function () {
                return _(n, void 0, void 0, function () {
                  return k(this, function (t) {
                    switch (t.label) {case 0:
                        return [4, c(s)];case 1:
                        return t.sent(), e() ? [4, browserAPI.storage.sync.set({ indexes: -1 })] : [3, 3];case 2:
                        t.sent(), t.label = 3;case 3:
                        return [2];}
                  });
                });
              })['catch'](function (s) {
                window.logAsync(window.__('background_storages_localUploadError'), s), (-1 < s.message.indexOf('MAX_WRITE_OPERATIONS_PER_MINUTE') || -1 < s.message.indexOf('MAX_WRITE_OPERATIONS_PER_HOUR')) && (I = JSON.stringify(t.modules.storages.settingsStorage), S && window.clearTimeout(S), S = window.setTimeout(function () {
                  return _(n, void 0, void 0, function () {
                    return k(this, function (e) {
                      switch (e.label) {case 0:
                          return [4, browserAPI.storage.local.set({ settings: I })];case 1:
                          return e.sent(), I = null, S = null, [2];}
                    });
                  });
                }, -1 < s.message.indexOf('MAX_WRITE_OPERATIONS_PER_HOUR') ? 3600000 : 3600000));
              })];case 6:
              return l.sent(), [3, 13];case 7:
              return !(101400 <= a.length) && e() ? [3, 10] : [4, browserAPI.storage.local.set({ useStorageSync: !1 })];case 8:
              return l.sent(), [4, r('settings', s)];case 9:
              return l.sent(), [3, 13];case 10:
              return o = i(a), [4, browserAPI.storage.sync.clear()];case 11:
              return l.sent(), [4, browserAPI.storage.sync.set(o).then(function () {
                return _(n, void 0, void 0, function () {
                  return k(this, function (e) {
                    switch (e.label) {case 0:
                        return [4, c(s)];case 1:
                        return e.sent(), [4, browserAPI.storage.local.set({ settings: null })];case 2:
                        return e.sent(), [2];}
                  });
                });
              })['catch'](function (e) {
                return _(n, void 0, void 0, function () {
                  return k(this, function (n) {
                    switch (n.label) {case 0:
                        return window.logAsync(window.__('background_storages_syncUploadError'), e), t.modules.storages.storageLocal.useStorageSync = !1, [4, browserAPI.storage.local.set({ useStorageSync: !1 })];case 1:
                        return n.sent(), [4, r('settings', s)];case 2:
                        return n.sent(), [2];}
                  });
                });
              })];case 12:
              l.sent(), l.label = 13;case 13:
              return [2];}
        });
      });
    }function r(e, s, n) {
      return void 0 === n && (n = null), _(this, void 0, void 0, function () {
        var a, l, i;return k(this, function (d) {
          switch (d.label) {case 0:
              return a = e, 'local' === a ? [3, 1] : 'settings' === a ? [3, 7] : 'libraries' === a ? [3, 9] : [3, 10];case 1:
              return [4, browserAPI.storage.local.set(t.modules.storages.storageLocal)];case 2:
              d.sent(), l = 0, d.label = 3;case 3:
              return l < s.length ? 'useStorageSync' === s[l].key ? (i = s[l], [4, r('settings', [], i.newValue)]) : [3, 5] : [3, 6];case 4:
              d.sent(), d.label = 5;case 5:
              return l++, [3, 3];case 6:
              return [3, 10];case 7:
              return t.modules.storages.settingsStorage.settingsLastUpdatedAt = new Date().getTime(), null !== n && (t.modules.storages.storageLocal.useStorageSync = n), [4, o(s)];case 8:
              return d.sent(), [3, 10];case 9:
              return browserAPI.storage.local.set({ libraries: s }), [3, 10];case 10:
              return [2];}
        });
      });
    }function l(e, s, n, a) {
      return _(this, void 0, void 0, function () {
        var o, r, l, i, d;return k(this, function (c) {
          switch (c.label) {case 0:
              return r = (o = window).info, [4, window.__('background_storages_settingGlobalData')];case 1:
              return r.apply(o, [c.sent()]), t.modules.storages.storageLocal = e, t.modules.storages.settingsStorage = s, t.modules.storages.globalExcludes = u(n, 'globalExcludes', []).map(t.modules.URLParsing.validatePatternUrl).filter(function (e) {
                return null !== e;
              }), l = t.modules.Util.toMap, t.modules.storages.resources = l(u(n, 'resources', {})), t.modules.storages.nodeStorage = l(u(n, 'nodeStorage', {})), t.modules.storages.nodeStorageSync = l(u(s, 'nodeStorageSync', {})), t.modules.storages.resourceKeys = u(n, 'resourceKeys', []), t.modules.storages.urlDataPairs = l(u(n, 'urlDataPairs', {})), d = (i = window).info, [4, window.__('background_storages_buildingCrm')];case 2:
              return d.apply(i, [c.sent()]), [4, t.modules.CRMNodes.updateCRMValues()];case 3:
              return c.sent(), a && a(), [2];}
        });
      });
    }function i(e) {
      var t = {},
          s = e.match(/[\s\S]{1,5000}/g);return s.forEach(function (e, s) {
        t['section' + s] = e;
      }), t.indexes = s.length, t;
    }function d(e) {
      var s = e.indexes;if (-1 === s || null === s || s === void 0) return { syncEnabled: !1, data: null };var n = [],
          a = 'number' === typeof s ? s : Array.isArray(s) ? s.length : 0;t.modules.Util.createArray(a).forEach(function (t, s) {
        n.push(e['section' + s]);
      });var o = n.join('');return { syncEnabled: !0, data: JSON.parse(o) };
    }function c(e) {
      return _(this, void 0, void 0, function () {
        var s, n, a, o, r;return k(this, function (l) {
          switch (l.label) {case 0:
              s = 0, l.label = 1;case 1:
              return s < e.length ? 'crm' !== e[s].key && 'showOptions' !== e[s].key ? [3, 6] : [4, t.modules.CRMNodes.updateCRMValues()] : [3, 14];case 2:
              return l.sent(), t.modules.CRMNodes.TS.compileAllInTree(), [4, t.checkBackgroundPagesForChange({ change: e[s] })];case 3:
              return l.sent(), [4, t.modules.CRMNodes.buildPageCRM()];case 4:
              return l.sent(), [4, t.modules.MessageHandling.signalNewCRM()];case 5:
              return l.sent(), [3, 13];case 6:
              return 'latestId' === e[s].key ? (n = e[s], t.modules.globalObject.globals.latestId = n.newValue, browserAPI.runtime.sendMessage({ type: 'idUpdate', latestId: n.newValue })['catch'](function (e) {
                if ('Could not establish connection. Receiving end does not exist.' === e.message || 'The message port closed before a response was received.' === e.message) ;else throw e;
              }), [3, 13]) : [3, 7];case 7:
              return 'rootName' === e[s].key ? (a = e[s], [4, t.modules.Util.lock(0)]) : [3, 13];case 8:
              o = l.sent(), l.label = 9;case 9:
              return l.trys.push([9, 11,, 13]), [4, browserAPI.contextMenus.update(t.modules.crmValues.rootId, { title: a.newValue })];case 10:
              return l.sent(), o(), [3, 13];case 11:
              return r = l.sent(), o(), [4, t.modules.CRMNodes.buildPageCRM()];case 12:
              return l.sent(), [3, 13];case 13:
              return s++, [3, 1];case 14:
              return [2];}
        });
      });
    }function u(e, t, s) {
      var n;return e[t] ? e[t] : (browserAPI.storage.local.set((n = {}, n[t] = s, n)), s);
    }function p(e, t, s) {
      void 0 === s && (s = !1);for (var n = 0; n < t.length; n++) {
        if (s) {
          for (var a = t[n].key.split('.'), o = e, r = 0; r < a.length - 1; r++) {
            a[r] in o || (o[a[r]] = {}), o = o[a[r]];
          }o[a[n]] = t[n].newValue;
        } else e[t[n].key] = t[n].newValue;
      }
    }function g(e, s, n, a) {
      var o = t.modules.crm.crmById.get(e);o.storage = t.modules.storages.nodeStorage.get(e), browserAPI.storage.local.set({ nodeStorage: t.modules.Util.fromMap(t.modules.storages.nodeStorage) });var r = t.modules.crmValues.tabData;t.modules.Util.iterateMap(r, function (o, r) {
        var l = r.nodes;o !== s && l.has(e) && l.get(e).forEach(function (e) {
          e.port && t.modules.Util.postMessage(e.port, { changes: n, isSync: a, messageType: 'storageUpdate' });
        });
      });
    }function m(e) {
      var t = e.split('.'),
          s = t[0],
          n = t[1],
          a = t[2];return s = ~~s, n = ~~n, a = ~~a, { major: s, minor: n, patch: a };
    }function h(e, t) {
      var s = m(e),
          n = m(t);if (s.major > n.major) return -1;return s.major < n.major ? 1 : s.minor > n.minor ? -1 : s.minor < n.minor ? 1 : s.patch > n.patch ? -1 : s.patch < n.patch ? 1 : 0;
    }function y(e, t, s) {
      return 1 === h(e, s) && 1 === h(s, t);
    }function f(e) {
      var t = [!1, !1, !1, !1, !1, !1];return t[e] = !0, t;
    }function b(e, s) {
      return _(this, void 0, void 0, function () {
        var n = this,
            a,
            o,
            o;return k(this, function (r) {
          switch (r.label) {case 0:
              return a = { beforeSyncLoad: [], afterSyncLoad: [], afterSync: [] }, y(e, s, '2.0.4') && a.afterSync.push(function () {
                return _(n, void 0, void 0, function () {
                  var e = this;return k(this, function (s) {
                    switch (s.label) {case 0:
                        return [4, t.modules.Util.crmForEachAsync(t.modules.crm.crmTree, function (s) {
                          return _(e, void 0, void 0, function () {
                            var e, n, a, o, r;return k(this, function (l) {
                              switch (l.label) {case 0:
                                  return 'script' === s.type ? (e = s.value, [4, t.modules.Util.getScriptNodeScript(s)]) : [3, 3];case 1:
                                  return e.oldScript = l.sent(), n = t.SetupHandling.TransferFromOld.LegacyScriptReplace, a = s.value, r = (o = n.ChromeCallsReplace).replace, [4, t.modules.Util.getScriptNodeScript(s)];case 2:
                                  a.script = r.apply(o, [l.sent(), n.generateScriptUpgradeErrorHandler(s.id)]), l.label = 3;case 3:
                                  return s.isLocal && (s.nodeInfo.installDate = new Date().toLocaleDateString(), s.nodeInfo.lastUpdatedAt = Date.now(), s.nodeInfo.version = '1.0', s.nodeInfo.isRoot = !1, s.nodeInfo.source = 'local', s.onContentTypes[0] && s.onContentTypes[1] && s.onContentTypes[2] && !s.onContentTypes[3] && !s.onContentTypes[4] && !s.onContentTypes[5] && (s.onContentTypes = [!0, !0, !0, !0, !0, !0])), [2];}
                            });
                          });
                        })];case 1:
                        return s.sent(), [4, t.modules.CRMNodes.updateCrm()];case 2:
                        return s.sent(), [2];}
                  });
                });
              }), y(e, s, '2.0.11') ? [4, t.modules.Util.isTamperMonkeyEnabled()] : [3, 2];case 1:
              o = r.sent(), t.modules.storages.storageLocal.useAsUserscriptInstaller = !o, browserAPI.storage.local.set({ useAsUserscriptInstaller: !o }), r.label = 2;case 2:
              return y(e, s, '2.0.15') && (a.afterSyncLoad.push(function (e) {
                return e.rootName = 'Custom Menu', e;
              }), a.afterSync.push(function () {
                return _(n, void 0, void 0, function () {
                  return k(this, function (e) {
                    switch (e.label) {case 0:
                        return [4, t.uploadChanges('settings', [{ key: 'rootName', oldValue: void 0, newValue: 'Custom Menu' }])];case 1:
                        return e.sent(), [2];}
                  });
                });
              })), y(e, s, '2.1.0') && (a.beforeSyncLoad.push(function (e) {
                for (var t = e.libraries, s = 0, n = t, a; s < n.length; s++) {
                  a = n[s], a.ts = { enabled: !1, code: {} };
                }return browserAPI.storage.local.set({ libraries: t }), 'number' === typeof e.selectedCrmType && (e.selectedCrmType = f(e.selectedCrmType), browserAPI.storage.local.set({ selectedCrmType: e.selectedCrmType })), e.editing && 'number' === typeof e.editing.crmType && (e.editing.crmType = f(e.editing.crmType), browserAPI.storage.local.set({ editing: e.editing })), e;
              }), a.afterSync.push(function () {
                t.modules.Util.crmForEach(t.modules.crm.crmTree, function (e) {
                  ('script' === e.type || 'stylesheet' === e.type) && e.nodeInfo && e.nodeInfo.source && 'local' !== e.nodeInfo.source && (e.nodeInfo.source.autoUpdate = !0), 'script' === e.type && (e.value.ts = { enabled: !1, backgroundScript: {}, script: {} });
                });var e = ['var query;', 'var url = "LINK";', 'if (crmAPI.getSelection()) {', 'query = crmAPI.getSelection();', '} else {', 'query = window.prompt(\'Please enter a search query\');', '}', 'if (query) {', 'window.open(url.replace(/%s/g,query), \'_blank\');', '}'];t.modules.Util.crmForEach(t.modules.crm.crmTree, function (t) {
                  if ('script' === t.type) {
                    var s = t.value.script.split('\n');if (s.length !== e.length || s[0] !== e[0]) return;for (var n = 2; n < s.length; n++) {
                      if (s[n] !== e[n] && 8 !== n) return;
                    }if (-1 === s[1].indexOf('var url = "')) return;s[8] = 'window.open(url.replace(/%s/g,window.encodeURIComponent(query)), \'_blank\');', t.value.script = s.join('\n');
                  }
                }), t.modules.CRMNodes.updateCrm();
              })), y(e, s, '2.1.4') ? [4, t.modules.Util.isStylishInstalled()] : [3, 4];case 3:
              o = r.sent(), t.modules.storages.storageLocal && (t.modules.storages.storageLocal.useAsUserstylesInstaller = !o), browserAPI.storage.local.set({ useAsUserstylesInstaller: !o }), r.label = 4;case 4:
              return browserAPI.storage.local.set({ lastUpdatedAt: s }), [2, a];}
        });
      });
    }function x(e) {
      return _(this, void 0, void 0, function () {
        var s, n, a, o;return k(this, function (r) {
          switch (r.label) {case 0:
              return [4, browserAPI.runtime.getManifest()];case 1:
              return s = r.sent().version, localStorage.getItem('transferToVersion2') && e.lastUpdatedAt === s ? [2, { type: 'noChanges' }] : [3, 2];case 2:
              return localStorage.getItem('transferToVersion2') && e.lastUpdatedAt ? (window.logAsync(window.__('background_storages_upgrading', e.lastUpdatedAt, s)), [4, b(e.lastUpdatedAt, s)]) : [3, 4];case 3:
              return n = r.sent(), n.beforeSyncLoad.forEach(function (t) {
                e = t(e);
              }), [2, { type: 'upgradeVersion', afterSync: n.afterSync, afterSyncLoad: n.afterSyncLoad, storageLocal: e }];case 4:
              return window.localStorage.getItem('transferToVersion2') || void 0 === window.localStorage.getItem('numberofrows') || null === window.localStorage.getItem('numberofrows') ? [3, 5] : (window.log('Upgrading from version 1.0 to version 2.0'), [2, { type: 'firstTimeCallback', fn: t.SetupHandling.handleTransfer() }]);case 5:
              return o = (a = window).info, [4, window.__('background_storages_initializingFirst')];case 6:
              return o.apply(a, [r.sent()]), [2, { type: 'firstTimeCallback', fn: t.SetupHandling.handleFirstRun() }];}
        });
      });
    }function v(e, t) {
      var s = JSON.stringify(e),
          n = window.md5(s);t.settingsVersionData && t.settingsVersionData.current.hash !== n && browserAPI.storage.local.set({ settingsVersionData: { current: { hash: n, date: e.settingsLastUpdatedAt }, latest: { hash: n, date: e.settingsLastUpdatedAt }, wasUpdated: !0 } });
    }t.initModule = function (e) {
      t.modules = e;
    }, t.supportsStorageSync = e, t.checkBackgroundPagesForChange = function (e) {
      var a = e.change,
          o = e.toUpdate;return _(this, void 0, void 0, function () {
        var e = this,
            r,
            l,
            i,
            d,
            c,
            u,
            p;return k(this, function (g) {
          switch (g.label) {case 0:
              return o ? [4, o.map(function (s) {
                return new Promise(function (n) {
                  return _(e, void 0, void 0, function () {
                    return k(this, function (e) {
                      switch (e.label) {case 0:
                          return [4, t.modules.CRMNodes.Script.Background.createBackgroundPage(t.modules.crm.crmById.get(s))];case 1:
                          return e.sent(), n(null), [2];}
                    });
                  });
                });
              })] : [3, 2];case 1:
              g.sent(), g.label = 2;case 2:
              return a ? (r = n(a.oldValue, a.newValue), l = r.same, i = r.additions, d = r.removals, [4, window.Promise.all(l.map(function (n) {
                var o = n.id;return _(e, void 0, void 0, function () {
                  var e, n, r, l, i, d, c;return k(this, function (u) {
                    switch (u.label) {case 0:
                        return e = s(o, a.oldValue), n = t.modules.crm.crmById.get(o), r = s(o, a.newValue), 'script' === r.type && e && 'script' === e.type ? [4, window.Promise.all([t.modules.Util.getScriptNodeScript(e, 'background'), t.modules.Util.getScriptNodeScript(n, 'background'), t.modules.Util.getScriptNodeScript(r, 'background')])] : [3, 3];case 1:
                        return l = u.sent(), i = l[0], d = l[1], c = l[2], i === c && d === d ? [3, 3] : [4, t.modules.CRMNodes.Script.Background.createBackgroundPage(r)];case 2:
                        u.sent(), u.label = 3;case 3:
                        return [2];}
                  });
                });
              }).concat(i.map(function (s) {
                return _(e, void 0, void 0, function () {
                  return k(this, function (e) {
                    switch (e.label) {case 0:
                        return 'script' === s.type && s.value.backgroundScript && 0 < s.value.backgroundScript.length ? [4, t.modules.CRMNodes.Script.Background.createBackgroundPage(s)] : [3, 2];case 1:
                        e.sent(), e.label = 2;case 2:
                        return [2];}
                  });
                });
              })))]) : [2];case 3:
              for (g.sent(), c = 0, u = d; c < u.length; c++) {
                p = u[c], 'script' === p.type && p.value.backgroundScript && 0 < p.value.backgroundScript.length && t.modules.background.byId.has(p.id) && (t.modules.background.byId.get(p.id).terminate(), t.modules.background.byId['delete'](p.id));
              }return [2];}
        });
      });
    }, t.findNodeWithId = a;var I = null,
        S = null;t.uploadChanges = r, t.applyChanges = function (e) {
      return _(this, void 0, void 0, function () {
        var s, n, a;return k(this, function (o) {
          switch (o.label) {case 0:
              return s = e.type, 'optionsPage' === s ? [3, 1] : 'libraries' === s ? [3, 6] : 'nodeStorage' === s ? [3, 8] : [3, 13];case 1:
              return e.localChanges ? (p(t.modules.storages.storageLocal, e.localChanges), [4, r('local', e.localChanges)]) : [3, 3];case 2:
              o.sent(), o.label = 3;case 3:
              return e.settingsChanges ? (p(t.modules.storages.settingsStorage, e.settingsChanges), [4, r('settings', e.settingsChanges)]) : [3, 5];case 4:
              o.sent(), o.label = 5;case 5:
              return [3, 13];case 6:
              return [4, t.modules.CRMNodes.TS.compileAllLibraries(e.libraries)];case 7:
              return n = o.sent(), a = t.modules.storages.storageLocal.libraries, t.modules.storages.storageLocal.libraries = n, p(t.modules.storages.storageLocal, [{ key: 'libraries', newValue: n, oldValue: a }]), [3, 13];case 8:
              return t.modules.Util.setMapDefault(t.modules.storages.nodeStorage, e.id, {}), t.modules.Util.setMapDefault(t.modules.storages.nodeStorageSync, e.id, {}), e.isSync ? (p(t.modules.storages.nodeStorageSync.get(e.id), e.nodeStorageChanges, !0), t.modules.storages.settingsStorage.nodeStorageSync = t.modules.Util.fromMap(t.modules.storages.nodeStorageSync)) : (p(t.modules.storages.nodeStorage.get(e.id), e.nodeStorageChanges, !0), t.modules.storages.storageLocal.nodeStorage = t.modules.Util.fromMap(t.modules.storages.nodeStorage)), g(e.id, e.tabId, e.nodeStorageChanges, e.isSync), e.isSync ? [4, r('settings', [{ key: 'nodeStorageSync', newValue: t.modules.Util.fromMap(t.modules.storages.nodeStorageSync), oldValue: void 0 }])] : [3, 10];case 9:
              return o.sent(), [3, 12];case 10:
              return [4, r('local', [{ key: 'nodeStorage', newValue: t.modules.Util.fromMap(t.modules.storages.nodeStorage), oldValue: void 0 }])];case 11:
              o.sent(), o.label = 12;case 12:
              return [3, 13];case 13:
              return [2];}
        });
      });
    }, t.setStorages = l, t.cutData = i, t.parseCutData = d, t.loadStorages = function () {
      var t = this;return new Promise(function (s) {
        return _(t, void 0, void 0, function () {
          var t, n, a, o, r, i, c, u, p, g, m, h, y, f, b, I, m, S, _, C, M, T, w, N, L, M;return k(this, function (k) {
            switch (k.label) {case 0:
                return n = (t = window).info, [4, window.__('background_storages_loadingSync')];case 1:
                return n.apply(t, [k.sent()]), e() ? [4, browserAPI.storage.sync.get()] : [3, 3];case 2:
                return o = k.sent(), [3, 4];case 3:
                o = {}, k.label = 4;case 4:
                return a = o, i = (r = window).info, [4, window.__('background_storages_loadingLocal')];case 5:
                return i.apply(r, [k.sent()]), [4, browserAPI.storage.local.get()];case 6:
                return c = k.sent(), p = (u = window).info, [4, window.__('background_storages_checkingFirst')];case 7:
                return p.apply(u, [k.sent()]), [4, x(c)];case 8:
                return g = k.sent(), 'firstTimeCallback' === g.type ? [4, g.fn] : [3, 11];case 9:
                return m = k.sent(), [4, l(m.storageLocalCopy, m.settingsStorage, m.chromeStorageLocal, function () {
                  s(null);
                })];case 10:
                return k.sent(), [3, 22];case 11:
                return 'upgradeVersion' === g.type && (c = g.storageLocal), y = (h = window).info, [4, window.__('background_storages_parsingData')];case 12:
                return (y.apply(h, [k.sent()]), f = JSON.parse(JSON.stringify(c)), delete f.globalExcludes, b = void 0, !c.useStorageSync) ? [3, 16] : (I = d(a), m = I.data, S = I.syncEnabled, S ? [3, 14] : [4, browserAPI.storage.local.set({ useStorageSync: !1 })]);case 13:
                return k.sent(), b = c.settings, [3, 15];case 14:
                b = m, k.label = 15;case 15:
                return [3, 19];case 16:
                return c.settings ? [3, 18] : [4, browserAPI.storage.local.set({ useStorageSync: !0 })];case 17:
                return k.sent(), b = d(a).data, [3, 19];case 18:
                delete f.settings, b = c.settings, k.label = 19;case 19:
                if ('upgradeVersion' === g.type) for (_ = 0, C = g.afterSyncLoad; _ < C.length; _++) {
                  M = C[_], b = M(b);
                }return w = (T = window).info, [4, window.__('background_storages_checkingUpdates')];case 20:
                return w.apply(T, [k.sent()]), v(b, c), [4, l(f, b, c, function () {
                  s(null);
                })];case 21:
                if (k.sent(), 'upgradeVersion' === g.type) for (N = 0, L = g.afterSync; N < L.length; N++) {
                  M = L[N], M();
                }k.label = 22;case 22:
                return [2];}
          });
        });
      });
    }, t.clearStorages = function () {
      t.modules.storages.settingsStorage = null, t.modules.storages.storageLocal = null;
    }, t.getVersionDiff = h;
  }(C || (C = {}));var M = function M(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      T = function T(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      w;(function (e) {
    var t;(function (t) {
      t.executeCRMCode = function (t, s) {
        if (e.modules.crmValues.tabData.has(t.tab)) {
          var n = e.modules.crmValues.tabData,
              a = n.get(t.tab).nodes,
              o = a.get(t.id)[t.tabIndex].port;e.modules.Util.postMessage(o, { messageType: s, code: t.code, logCallbackIndex: t.logListener.index });
        }
      }, t.displayHints = function (t) {
        e.modules.listeners.log[t.data.callbackIndex].listener({ id: t.id, tabId: t.tabId, tabInstanceIndex: t.tabIndex, type: 'hints', suggestions: t.data.hints });
      };
    })(t = e.LogExecution || (e.LogExecution = {}));
  })(w || (w = {})), function (e) {
    var t;(function (t) {
      function s(t) {
        void 0 === t && (t = -1);var s = e.modules.crmValues.tabData,
            n = [];return e.modules.Util.iterateMap(s, function (s, a) {
          -1 !== t && t !== s || e.modules.Util.iterateMap(a.nodes, function (e) {
            -1 === n.indexOf(e) && n.push(e);
          });
        }), n.sort(function (e, t) {
          return e - t;
        }).map(function (t) {
          return { id: t, title: e.modules.crm.crmById.get(t).name };
        });
      }function n(t, s, n, a) {
        e.modules.Util.compareArray(t, s) || (n.forEach(function (e) {
          e(t);
        }), 'id' === a ? e.modules.listeners.idVals = t : e.modules.listeners.tabVals = t);
      }function a(t) {
        var s = this;return void 0 === t && (t = 0), new Promise(function (n) {
          return M(s, void 0, void 0, function () {
            var s = this,
                a,
                o,
                r;return T(this, function (l) {
              switch (l.label) {case 0:
                  return a = e.modules.crmValues.tabData, o = [], e.modules.Util.iterateMap(a, function (n, a) {
                    (a.nodes.get(t) || 0 === t) && (0 === n ? o.push(Promise.resolve({ id: 'background', title: 'background' })) : o.push(e.modules.Util.iipe(function () {
                      return M(s, void 0, void 0, function () {
                        var t;return T(this, function (s) {
                          switch (s.label) {case 0:
                              return [4, browserAPI.tabs.get(n)['catch'](function () {
                                e.modules.Util.removeTab(n);
                              })];case 1:
                              return t = s.sent(), t ? [2, { id: n, title: t.title }] : [2, null];}
                        });
                      });
                    })));
                  }), r = n, [4, Promise.all(o)];case 1:
                  return r.apply(void 0, [l.sent().filter(function (e) {
                    return null !== e;
                  })]), [2];}
            });
          });
        });
      }t.getIds = s, t.getTabs = a, t.updateTabAndIdLists = function () {
        return M(this, void 0, void 0, function () {
          var t, o, r;return T(this, function (l) {
            switch (l.label) {case 0:
                return t = e.modules.globalObject.globals.listeners, o = s(), n(o, t.idVals, t.ids, 'id'), [4, a()];case 1:
                return r = l.sent(), n(r, t.tabVals, t.tabs, 'tab'), [2, { ids: o, tabs: r }];}
          });
        });
      };
    })(t = e.Listeners || (e.Listeners = {}));
  }(w || (w = {})), function (e) {
    function t(t, s) {
      for (var n = [], a = 2; a < arguments.length; a++) {
        n[a - 2] = arguments[a];
      }var o = e.modules.globalObject.globals.logging.filter;null !== o.id && t === o.id && null !== o.tabId ? ('*' === s || s === o.tabId) && window.log.apply(console, n) : window.log.apply(console, n);
    }function s(t, s) {
      if (e.modules.globalObject.globals.logging[t]) e.modules.globalObject.globals.logging[t][s] || (e.modules.globalObject.globals.logging[t][s] = {});else {
        var n = { values: [], logMessages: [] };n[s] = {}, e.modules.globalObject.globals.logging[t] = n;
      }
    }function n(t) {
      e.modules.globalObject.globals.listeners.log.forEach(function (e) {
        var s = 'all' === e.id || ~~e.id === ~~t.id,
            n = 'all' === e.tab || 'background' === e.tab && e.tab === t.tabId || 'background' !== e.tab && ~~e.tab === ~~t.tabId;s && n && e.listener(t);
      });
    }function a(s) {
      return M(this, void 0, void 0, function () {
        var a, o, r, l, i;return T(this, function (d) {
          switch (d.label) {case 0:
              return a = {}, o = ['Log[src:', a, ']: '], r = { id: s.id, tabId: s.tabId, logId: s.logId, tabIndex: s.tabIndex, lineNumber: s.lineNumber || '?', timestamp: new Date().toLocaleString() }, [4, browserAPI.tabs.get(s.tabId)];case 1:
              return l = d.sent(), i = e.modules.constants.specialJSON.fromJSON(s.data), o = o.concat(i), t.bind(e.modules.globalObject, s.id, s.tabId).apply(e.modules.globalObject, o), a.id = s.id, a.tabId = s.tabId, a.tab = l, a.url = l.url, a.tabIndex = s.tabIndex, a.tabTitle = l.title, a.node = e.modules.crm.crmById.get(s.id), a.nodeName = a.node.name, r.tabTitle = l.title, r.nodeTitle = a.nodeName, r.data = i, e.modules.globalObject.globals.logging[s.id].logMessages.push(r), n(r), [2];}
        });
      });
    }e.initModule = function (t) {
      e.modules = t;
    }, e.log = t, e.backgroundPageLog = function (t, s) {
      for (var a = [], o = 2; o < arguments.length; o++) {
        a[o - 2] = arguments[o];
      }return M(this, void 0, void 0, function () {
        var o, r, l, i, d, c, u, p;return T(this, function (g) {
          switch (g.label) {case 0:
              return s = s || [void 0, void 0], r = {}, [4, window.__('background_logging_background')];case 1:
              return r.tabId = g.sent(), r.nodeTitle = e.modules.crm.crmById.get(t).name, [4, window.__('background_logging_backgroundPage')];case 2:
              return o = (r.tabTitle = g.sent(), r.data = a, r.lineNumber = s[0], r.logId = s[1], r.timestamp = new Date().toLocaleString(), r), l = { id: t }, [4, window.__('background_logging_backgroundPage')];case 3:
              return i = [g.sent() + ' [', l, ']: '].concat(a), c = (d = e.log).bind, u = [e.modules.globalObject, t], [4, window.__('background_logging_background')];case 4:
              for (p in c.apply(d, u.concat([g.sent()])).apply(e.modules.globalObject, i), o) {
                o.hasOwnProperty(p) && (l[p] = o[p]);
              }return e.modules.globalObject.globals.logging[t] = e.modules.globalObject.globals.logging[t] || { logMessages: [] }, e.modules.globalObject.globals.logging[t].logMessages.push(l), n(l), [2];}
        });
      });
    }, e.logHandler = function (t) {
      return M(this, void 0, void 0, function () {
        var n, o;return T(this, function (r) {
          switch (r.label) {case 0:
              return s(t.id, t.tabId), n = t.type, 'evalResult' === n ? [3, 1] : 'log' === n ? [3, 3] : [3, 3];case 1:
              return [4, browserAPI.tabs.get(t.tabId)];case 2:
              return o = r.sent(), e.modules.listeners.log[t.callbackIndex].listener({ id: t.id, tabId: t.tabId, tabInstanceIndex: t.tabIndex, nodeTitle: e.modules.crm.crmById.get(t.id).name, tabTitle: o.title, type: 'evalResult', lineNumber: t.lineNumber, timestamp: t.timestamp, val: 'success' === t.value.type ? { type: 'success', result: e.modules.constants.specialJSON.fromJSON(t.value.result) } : t.value }), [3, 5];case 3:
              return [4, a({ type: t.type, id: t.id, data: t.data, tabIndex: t.tabIndex, lineNumber: t.lineNumber, tabId: t.tabId, logId: t.logId, callbackIndex: t.callbackIndex, timestamp: t.type })];case 4:
              return r.sent(), [3, 5];case 5:
              return [2];}
        });
      });
    };
  }(w || (w = {}));var N = function () {
    function e(e, t, s, n, a) {
      var o = this;this.id = e, this.script = t, this.secretKey = n, this._getInstances = a, this.worker = new Worker('/js/sandbox.js'), this._callbacks = [], this._verified = !1, this._handler = window.createHandlerFunction({ postMessage: this._postMessage.bind(this) }), this.worker.addEventListener('message', function (t) {
        o._onMessage(t);
      }, !1), this.worker.postMessage({ type: 'init', id: e, script: t, libraries: s });
    }return e.prototype.post = function (e) {
      this.worker.postMessage(e);
    }, e.prototype.listen = function (e) {
      this._callbacks.push(e);
    }, e.prototype.terminate = function () {
      this.worker.terminate();
    }, e.prototype._onMessage = function (t) {
      var e = t.data;switch (e.type) {case 'handshake':case 'crmapi':
          this._verified || (window.backgroundPageLog(this.id, null, 'Ininitialized background page'), this.worker.postMessage({ type: 'verify', message: JSON.stringify({ instances: this._getInstances(), currentInstance: null }), key: this.secretKey.join('') + this.id + 'verified' }), this._verified = !0), this._verifyKey(e, this._handler);break;case 'log':
          window.backgroundPageLog.apply(window, [this.id, [e.lineNo, -1]].concat(JSON.parse(e.data)));}this._callbacks && (this._callbacks.forEach(function (t) {
        t(e);
      }), this._callbacks = []);
    }, e.prototype._postMessage = function (e) {
      this.worker.postMessage({ type: 'message', message: JSON.stringify(e), key: this.secretKey.join('') + this.id + 'verified' });
    }, e.prototype._verifyKey = function (e, t) {
      e.key.join('') === this.secretKey.join('') ? t(JSON.parse(e.data)) : window.backgroundPageLog(this.id, null, 'Tried to send an unauthenticated message');
    }, e;
  }(),
      L;(function (e) {
    function t(e, t, s) {
      return e.apply(t, s);
    }function s(e, t, s) {
      return new Promise(function (n) {
        if ('chrome' === t) try {
          var a = crmAPI.chrome(e);a.onError = function () {
            n({ success: !1, result: null });
          };for (var o = 0, r = s, l; o < r.length; o++) {
            switch (l = r[o], l.type) {case 'fn':
                a = a.persistent(l.val);break;case 'arg':
                a = a.args(l.val);break;case 'return':
                a = a['return'](l.val);}
          }a['return'](function (e) {
            n({ success: !0, result: e });
          }).send();
        } catch (t) {
          n({ success: !1, result: null });
        } else if ('browser' === t) try {
          for (var a = crmAPI.browser, i = e.split('.'), d = 0, c = i, u; d < c.length; d++) {
            u = c[d], a = a[u];
          }for (var p = a, g = 0, m = s, l; g < m.length; g++) {
            switch (l = m[g], l.type) {case 'fn':
                p = p.persistent(l.val);break;case 'arg':
                p = p.args(l.val);}
          }p.send().then(function (e) {
            n({ success: !0, result: e });
          }, function () {
            n({ success: !1, result: null });
          });
        } catch (t) {
          n({ success: !1, result: null });
        }
      });
    }e.sandbox = function (e, t, s, n, a, o) {
      o(new N(e, t, s, n, a));
    }, e.sandboxVirtualChromeFunction = s, e.sandboxChrome = function (e, n, a) {
      var o = {},
          r;r = 'browser' === n ? window.browserAPI : window.chrome;var l = e.split('.');try {
        for (var d = 0; d < l.length; d++) {
          o = r, r = r[l[d]];
        }
      } catch (t) {
        return { success: !1, result: null };
      }return r && 'function' === typeof r ? 'crmAPI' in window && window.crmAPI && '__isVirtual' in window ? { success: !0, result: s(e, n, a) } : { success: !0, result: t(r, o, a) } : { success: !1, result: null };
    };
  })(L || (L = {}));var E;(function (t) {
    t.initModule = function (e) {
      t.modules = e;
    }, t.globals = { latestId: 0, storages: { insufficientPermissions: [], settingsStorage: null, nodeStorageSync: null, globalExcludes: null, resourceKeys: null, urlDataPairs: null, storageLocal: null, failedLookups: [], nodeStorage: null, resources: null }, background: { byId: new window.Map() }, crm: { crmTree: [], crmById: new window.Map(), safeTree: [], crmByIdSafe: new window.Map() }, availablePermissions: [], crmValues: { tabData: new window.Map([[0, { nodes: new window.Map(), libraries: new window.Map() }]]), rootId: null, contextMenuIds: new window.Map(), nodeInstances: new window.Map(), contextMenuInfoById: new window.Map(), contextMenuItemTree: [], userAddedContextMenus: [], userAddedContextMenusById: new window.Map(), contextMenuGlobalOverrides: new window.Map(), hideNodesOnPagesData: new window.Map(), nodeTabStatuses: new window.Map() }, toExecuteNodes: { onUrl: { documentStart: [], documentEnd: [] }, always: { documentStart: [], documentEnd: [] } }, sendCallbackMessage: function sendCallbackMessage(s, n, a, e) {
        var o = { type: e.err ? 'error' : 'success', data: e.err ? e.errorMessage : e.args, callbackId: e.callbackId, messageType: 'callback' },
            r = t.globals.crmValues.tabData;try {
          t.modules.Util.postMessage(r.get(s).nodes.get(a)[n].port, o);
        } catch (l) {
          if ('Converting circular structure to JSON' === l.message) o.data = 'Converting circular structure to JSON, getting a response from this API will not work', o.type = 'error', t.modules.Util.postMessage(r.get(s).nodes.get(a)[n].port, o);else throw l;
        }
      }, eventListeners: { notificationListeners: new window.Map(), shortcutListeners: new window.Map(), scriptDebugListeners: [] }, logging: { filter: { id: null, tabId: null } }, constants: { supportedHashes: ['sha1', 'sha256', 'sha384', 'sha512', 'md5'], validSchemes: ['http', 'https', 'file', 'ftp', '*'], templates: { mergeArrays: function mergeArrays(e, t) {
            for (var s = 0; s < t.length; s++) {
              e[s] = e[s] && 'object' === babelHelpers['typeof'](t[s]) && 'object' === babelHelpers['typeof'](e[s]) && void 0 !== e[s] && null !== e[s] ? Array.isArray(t[s]) ? this.mergeArrays(e[s], t[s]) : this.mergeObjects(e[s], t[s]) : t[s];
            }return e;
          }, mergeObjects: function mergeObjects(e, t) {
            for (var s in t) {
              t.hasOwnProperty(s) && (e[s] = 'object' === babelHelpers['typeof'](t[s]) && 'object' === babelHelpers['typeof'](e[s]) && void 0 !== e[s] && null !== e[s] ? Array.isArray(t[s]) ? this.mergeArrays(e[s], t[s]) : this.mergeObjects(e[s], t[s]) : t[s]);
            }return e;
          }, getDefaultNodeInfo: function getDefaultNodeInfo(e) {
            void 0 === e && (e = {});var t = { permissions: [], installDate: new Date().toLocaleDateString(), lastUpdatedAt: Date.now(), version: '1.0', isRoot: !1, source: 'local' };return this.mergeObjects(t, e);
          }, getDefaultLinkNode: function getDefaultLinkNode(e) {
            void 0 === e && (e = {});var t = { name: 'My Link', onContentTypes: [!0, !0, !0, !1, !1, !1], type: 'link', showOnSpecified: !1, nodeInfo: this.getDefaultNodeInfo(e.nodeInfo), triggers: [{ url: '*://*.example.com/*', not: !1 }], isLocal: !1, value: [{ newTab: !0, url: 'https://www.example.com' }] };return this.mergeObjects(t, e);
          }, getDefaultStylesheetValue: function getDefaultStylesheetValue(e) {
            void 0 === e && (e = {});return this.mergeObjects({ stylesheet: '', launchMode: 0, toggle: !1, defaultOn: !1, options: {}, convertedStylesheet: null }, e);
          }, getDefaultScriptValue: function getDefaultScriptValue(e) {
            void 0 === e && (e = {});return this.mergeObjects({ launchMode: 0, backgroundLibraries: [], libraries: [], script: '', backgroundScript: '', metaTags: {}, options: {}, ts: { enabled: !1, backgroundScript: {}, script: {} } }, e);
          }, getDefaultScriptNode: function getDefaultScriptNode(e) {
            void 0 === e && (e = {});var t = { name: 'My Script', onContentTypes: [!0, !0, !0, !1, !1, !1], type: 'script', isLocal: !1, nodeInfo: this.getDefaultNodeInfo(e.nodeInfo), triggers: [{ url: '*://*.example.com/*', not: !1 }], value: this.getDefaultScriptValue(e.value) };return this.mergeObjects(t, e);
          }, getDefaultStylesheetNode: function getDefaultStylesheetNode(e) {
            void 0 === e && (e = {});var t = { name: 'My Stylesheet', onContentTypes: [!0, !0, !0, !1, !1, !1], type: 'stylesheet', isLocal: !0, nodeInfo: this.getDefaultNodeInfo(e.nodeInfo), triggers: [{ url: '*://*.example.com/*', not: !1 }], value: this.getDefaultStylesheetValue(e.value) };return this.mergeObjects(t, e);
          }, getDefaultDividerOrMenuNode: function getDefaultDividerOrMenuNode(e, t) {
            void 0 === e && (e = {});var s = { name: 'My ' + (t[0].toUpperCase() + t.slice(1)), type: t, nodeInfo: this.getDefaultNodeInfo(e.nodeInfo), onContentTypes: [!0, !0, !0, !1, !1, !1], isLocal: !0, value: null, showOnSpecified: !0, children: 'menu' === t ? [] : null, permissions: [] };return this.mergeObjects(s, e);
          }, getDefaultDividerNode: function getDefaultDividerNode(e) {
            return void 0 === e && (e = {}), this.getDefaultDividerOrMenuNode(e, 'divider');
          }, getDefaultMenuNode: function getDefaultMenuNode(e) {
            return void 0 === e && (e = {}), this.getDefaultDividerOrMenuNode(e, 'menu');
          }, globalObjectWrapperCode: function globalObjectWrapperCode(e, s, n, a, o) {
            return void 0 === o && (o = !0), o ? t.modules.Caches.cacheCall(this.globalObjectWrapperCode, arguments) : ('var ' + s + ' = (' + function (e) {
              var t;return t = function () {
                var t = {},
                    s = e.REPLACEName;for (var n in s) {
                  (function (n) {
                    'webkitStorageInfo' !== n && 'function' === typeof s[n] ? t[n] = function () {
                      return s[n].apply(s, arguments);
                    } : Object.defineProperty(t, n, { get: function get() {
                        return s[n] === s ? t : 'crmAPI' === n ? e.REPLACECrmAPI : 'browser' === n ? e.REPLACEBrowserVal : 'chrome' === n ? e.REPLACEChromeVal : s[n];
                      }, set: function set(e) {
                        t[n] = e;
                      } });
                  })(n);
                }return t;
              }();
            }.toString().replace(/\w+.REPLACEName/g, e).replace(/\w+.REPLACEChromeVal/g, n).replace(/\w+.REPLACEBrowserVal/g, a).replace(/\w+.REPLACECrmAPI/g, 'crmAPI').replace(/\var\s\w+;/g, 'var ' + s + ';').replace(/return \(\w+ = \(/g, 'return (' + s + ' = (') + ')()').replace(/\n/g, '');
          } }, specialJSON: { _regexFlagNames: ['global', 'multiline', 'sticky', 'unicode', 'ignoreCase'], _getRegexFlags: function _getRegexFlags(e) {
            var t = [];return this._regexFlagNames.forEach(function (s) {
              e[s] && ('sticky' === s ? t.push('y') : t.push(s[0]));
            }), t;
          }, _stringifyNonObject: function _stringifyNonObject(e) {
            if ('function' === typeof e) {
              var t = e.toString(),
                  s = this._fnRegex.exec(t);e = '__fn$(' + s[2] + '){' + s[10] + '}$fn__';
            } else e instanceof RegExp ? e = '__regexp$' + JSON.stringify({ regexp: e.source, flags: this._getRegexFlags(e) }) + '$regexp__' : e instanceof Date ? e = '__date$' + (e + '$date__') : 'string' === typeof e && (e = e.replace(/\$/g, '\\$'));return JSON.stringify(e);
          }, _fnRegex: /^(.|\s)*\(((\w+((\s*),?(\s*)))*)\)(\s*)(=>)?(\s*)\{((.|\n|\r)+)\}$/, _specialStringRegex: /^__(fn|regexp|date)\$((.|\n)+)\$\1__$/, _fnCommRegex: /^\(((\w+((\s*),?(\s*)))*)\)\{((.|\n|\r)+)\}$/, _parseNonObject: function _parseNonObject(e) {
            var t = JSON.parse(e);if ('string' === typeof t) {
              var s;if (s = this._specialStringRegex.exec(t)) {
                var n = s[2];switch (s[1]) {case 'fn':
                    var a = this._fnCommRegex.exec(n);return '' === a[1].trim() ? new Function(a[6]) : Function.apply(void 0, a[1].split(',').concat([a[6]]));case 'regexp':
                    var o = JSON.parse(n);return new RegExp(o.regexp, o.flags.join(''));case 'date':
                    return new Date();}
              } else return t.replace(/\\\$/g, '$');
            }return t;
          }, _iterate: function _iterate(e, t, s) {
            return Array.isArray(t) ? (e = e || [], t.forEach(function (t, n, a) {
              e[n] = s(t, n, a);
            })) : (e = e || {}, Object.getOwnPropertyNames(t).forEach(function (n) {
              e[n] = s(t[n], n, t);
            })), e;
          }, _isObject: function _isObject(e) {
            return e instanceof Date || e instanceof RegExp || e instanceof Function ? !1 : 'object' === ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) && !Array.isArray(e);
          }, _toJSON: function _toJSON(e, t, s, n) {
            var a = this;if (!(this._isObject(t) || Array.isArray(t))) return { refs: [], data: this._stringifyNonObject(t), rootType: 'normal' };if (-1 === n.originalValues.indexOf(t)) {
              var o = n.refs.length;n.refs[o] = e, n.paths[o] = s, n.originalValues[o] = t;
            }e = this._iterate(e, t, function (t, o) {
              if (!(a._isObject(t) || Array.isArray(t))) return a._stringifyNonObject(t);var r;if (-1 === (r = n.originalValues.indexOf(t))) {
                r = n.refs.length, e = Array.isArray(t) ? [] : {}, n.refs.push(null), n.paths[r] = s;var l = a._toJSON(e[o], t, s.concat(o), n);n.refs[r] = l.data, n.originalValues[r] = t;
              }return '__$' + r + '$__';
            });var r = Array.isArray(t);return r ? { refs: n.refs, data: e, rootType: 'array' } : { refs: n.refs, data: e, rootType: 'object' };
          }, toJSON: function toJSON(e, t) {
            var s = this;void 0 === t && (t = []);var n = [[]],
                a = [e];if (!(this._isObject(e) || Array.isArray(e))) return JSON.stringify({ refs: [], data: this._stringifyNonObject(e), rootType: 'normal', paths: [] });var o = Array.isArray(e) ? [] : {};return t.push(o), o = this._iterate(o, e, function (e, r) {
              if (!(s._isObject(e) || Array.isArray(e))) return s._stringifyNonObject(e);var l;if (-1 === (l = a.indexOf(e))) {
                l = t.length, t.push(null);var i = s._toJSON(o[r], e, [r], { refs: t, paths: n, originalValues: a }).data;a[l] = e, n[l] = [r], t[l] = i;
              }return '__$' + l + '$__';
            }), JSON.stringify({ refs: t, data: o, rootType: Array.isArray(e) ? 'array' : 'object', paths: n });
          }, _refRegex: /^__\$(\d+)\$__$/, _replaceRefs: function _replaceRefs(e, t) {
            var s = this;return this._iterate(e, e, function (e) {
              var n;if (n = s._refRegex.exec(e)) {
                var a = n[1],
                    o = t[~~a];return o.parsed ? o.ref : (o.parsed = !0, s._replaceRefs(o.ref, t));
              }return s._parseNonObject(e);
            }), e;
          }, fromJSON: function fromJSON(e) {
            var t = JSON.parse(e);t.refs = t.refs.map(function (e) {
              return { ref: e, parsed: !1 };
            });var s = t.refs;return 'normal' === t.rootType ? JSON.parse(t.data) : (s[0].parsed = !0, this._replaceRefs(s[0].ref, s));
          } }, contexts: ['page', 'link', 'selection', 'image', 'video', 'audio'], permissions: ['alarms', 'activeTab', 'background', 'bookmarks', 'browsingData', 'clipboardRead', 'clipboardWrite', 'contentSettings', 'cookies', 'contentSettings', 'contextMenus', 'declarativeContent', 'desktopCapture', 'downloads', 'history', 'identity', 'idle', 'management', 'notifications', 'pageCapture', 'power', 'printerProvider', 'privacy', 'sessions', 'system.cpu', 'system.memory', 'system.storage', 'tabs', 'topSites', 'tabCapture', 'tts', 'webNavigation', 'webRequest', 'webRequestBlocking'], tamperMonkeyExtensions: ['gcalenpjmijncebpfijmoaglllgpjagf', 'dhdgffkkebhmkfjojejmpbldmpobfkfo', 'a1ec3820-68cb-430c-8870-2c07ecc68ff6', '7b7e1485-191d-4cb7-91d9-b6121c1157fe', '23c311a8-060b-422e-a46e-80dd73308a3b'], stylishExtensions: ['fjnbnpbmkenffdnngjfgmeleoegfcffe', '220fd736-2425-4d0a-aa36-6015937215f1'] }, listeners: { idVals: [], tabVals: [], ids: [], tabs: [], log: [] } };
  })(E || (E = {}));var _P = function P() {
    return _P = Object.assign || function (e) {
      for (var t = 1, a = arguments.length, n; t < a; t++) {
        for (var s in n = arguments[t], n) {
          Object.prototype.hasOwnProperty.call(n, s) && (e[s] = n[s]);
        }
      }return e;
    }, _P.apply(this, arguments);
  },
      A = function A(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      U = function U(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      R;(function (e) {
    var t;(function (t) {
      var s;(function (t) {
        function s(t) {
          var s = t.tab,
              n = t.key,
              a = t.info,
              o = t.node,
              r = t.script,
              l = t.tabIndex,
              i = t.safeNode,
              d = t.indentUnit,
              c = t.contextData,
              u = t.greaseMonkeyData;return A(this, void 0, void 0, function () {
            var t, p, g, m;return U(this, function (h) {
              switch (h.label) {case 0:
                  return [4, e.modules.Util.getScriptNodeScript(o)];case 1:
                  return t = -1 < h.sent().indexOf('/*execute locally*/') && o.isLocal, p = e.modules.storages.storageLocal.catchErrors, g = [], BrowserAPI.isBrowserAPISupported('chrome') && g.push('chrome'), BrowserAPI.isBrowserAPISupported('browser') && g.push('browser'), m = -1 < e.modules.globalObject.globals.eventListeners.scriptDebugListeners.indexOf(o.id), m && e.modules.globalObject.globals.eventListeners.scriptDebugListeners.splice(e.modules.globalObject.globals.eventListeners.scriptDebugListeners.indexOf(o.id), 1), e.modules.Util.setMapDefault(e.modules.storages.nodeStorage, o.id, {}), e.modules.Util.setMapDefault(e.modules.storages.nodeStorageSync, o.id, {}), [2, [['var crmAPI = new (window._crmAPIRegistry.pop())(' + [i, o.id, s, a, n, e.modules.storages.nodeStorage.get(o.id), c, u, !1, o.value && o.value.options || {}, t, l, browserAPI.runtime.id, g.join(','), e.modules.storages.nodeStorageSync.get(o.id)].map(function (e) {
                    return void 0 === e ? JSON.stringify(null) : JSON.stringify(e);
                  }).join(', ') + ');'].join(', '), e.modules.constants.templates.globalObjectWrapperCode('window', 'windowWrapper', o.isLocal && BrowserAPI.isBrowserAPISupported('chrome') ? 'chrome' : 'void 0', o.isLocal && BrowserAPI.isBrowserAPISupported('browser') ? 'browser' : 'void 0'), '' + (p ? 'try {' : ''), 'function main(crmAPI, window, chrome, browser, menuitemid, parentmenuitemid, mediatype,linkurl, srcurl, pageurl, frameurl, frameid,selectiontext, editable, waschecked, checked) {', m ? 'debugger;' : '', r, '}', 'crmAPI.onReady(function() {main.apply(this, [crmAPI, windowWrapper, ' + (o.isLocal && BrowserAPI.isBrowserAPISupported('chrome') ? 'chrome' : 'void 0') + ', ' + (o.isLocal && BrowserAPI.isBrowserAPISupported('browser') ? 'browser' : 'void 0') + '].concat(' + JSON.stringify([a.menuItemId, a.parentMenuItemId, a.mediaType, a.linkUrl, a.srcUrl, a.pageUrl, a.frameUrl, a.frameId, a.selectionText, a.editable, a.wasChecked, a.checked]) + '))})', '' + (p ? ['} catch (error) {', d + 'if (crmAPI.debugOnError) {', '' + d + d + 'debugger;', d + '}', d + 'throw error;', '}'].join('\n') : '')].join('\n')];}
            });
          });
        }function n(t, s, n, a) {
          return A(this, void 0, void 0, function () {
            var o, r, l, d, i, c, u, p;return U(this, function (g) {
              switch (g.label) {case 0:
                  o = [], r = e.modules.storages.storageLocal.libraries, l = e.modules.storages.urlDataPairs, d = 0, g.label = 1;case 1:
                  if (!(d < n.value.libraries.length)) return [3, 9];if (i = void 0, !r) return [3, 7];c = 0, g.label = 2;case 2:
                  return c < r.length ? r[c].name === n.value.libraries[d].name ? (u = r[c], !(u.ts && u.ts.enabled)) ? [3, 4] : (p = {}, [4, e.modules.Util.getLibraryCode(u)]) : [3, 6] : [3, 7];case 3:
                  return i = (p.code = g.sent(), p), [3, 5];case 4:
                  i = u, g.label = 5;case 5:
                  return [3, 7];case 6:
                  return c++, [3, 2];case 7:
                  i || n.value.libraries[d].name || !l.get(n.value.libraries[d].url) || (i = { code: l.get(n.value.libraries[d].url).dataString }), i && o.push({ code: i.code, runAt: s }), g.label = 8;case 8:
                  return d++, [3, 1];case 9:
                  return a || o.push({ file: '/js/crmapi.js', runAt: s }), o.push({ code: t, runAt: s }), [2, o];}
            });
          });
        }function a(e) {
          return function (t) {
            return e[t] ? e[t][0] : void 0;
          };
        }function o(t) {
          var s = [],
              n = e.modules.storages.resources.get(t);if (!n) return [];for (var a in n) {
            n.hasOwnProperty(a) && s.push(n[a]);
          }return s;
        }function r(e, t) {
          var s = { code: t.code, file: t.file, runAt: 'document_idle' },
              n = t.runAt;return 'document_start' === n || 'document_end' === n || 'document_idle' === n ? s.runAt = n : window.logAsync(window.__('background_crm_invalidRunat', e + '', n)), s;
        }function l(t, s, n, a) {
          var o = this;a ? browserAPI.tabs.sendMessage(s, { type: 'runScript', data: { scripts: n } }) : e.modules.Util.promiseChain(n.map(function (e) {
            return function () {
              return A(o, void 0, void 0, function () {
                var n;return U(this, function (a) {
                  switch (a.label) {case 0:
                      return a.trys.push([0, 2,, 3]), [4, browserAPI.tabs.executeScript(s, r(t, e))['catch'](function (e) {
                        -1 === e.message.indexOf('Could not establish connection') && -1 === e.message.indexOf('closed') && window.logAsync(window.__('background_crm_executionFailed', s, t), e);
                      })];case 1:
                      return a.sent(), [3, 3];case 2:
                      return n = a.sent(), [3, 3];case 3:
                      return [2];}
                });
              });
            };
          }));
        }function i(t, s, n, r, l) {
          return A(this, void 0, void 0, function () {
            var i, d, c, u;return U(this, function (p) {
              switch (p.label) {case 0:
                  return i = (e.MetaTags.getMetaLines(s.value.script) || []).join('\n'), d = a(t), c = {}, u = { script: { author: d('author') || '', copyright: d('copyright'), description: d('description'), excludes: t.excludes, homepage: d('homepage'), icon: d('icon'), icon64: d('icon64'), includes: (t.includes || []).concat(t.include), lastUpdated: 0, matches: t.matches, isIncognito: l.incognito, downloadMode: 'browser', name: s.name, namespace: d('namespace'), options: { awareOfChrome: !0, compat_arrayleft: !1, compat_foreach: !1, compat_forvarin: !1, compat_metadata: !1, compat_prototypes: !1, compat_uW_gmonkey: !1, noframes: d('noframes'), override: { excludes: !0, includes: !0, orig_excludes: t.excludes, orig_includes: (t.includes || []).concat(t.include), use_excludes: r, use_includes: n } }, position: 1, resources: o(s.id), "run-at": t['run-at'] || t.run_at || 'document_end', system: !1, unwrap: !0, version: d('version') }, scriptMetaStr: i }, [4, e.modules.Util.getScriptNodeScript(s)];case 1:
                  return u.scriptSource = p.sent(), u.scriptUpdateURL = d('updateURL'), u.scriptWillUpdate = !0, u.scriptHandler = 'Custom Right-Click Menu', [4, browserAPI.runtime.getManifest()];case 2:
                  return [2, (c.info = (u.version = p.sent().version, u), c.resources = e.modules.storages.resources.get(s.id) || {}, c)];}
            });
          });
        }function d(e) {
          var t = [],
              s = [];if (e.triggers) for (var n = 0; n < e.triggers.length; n++) {
            e.triggers[n].not ? t.push(e.triggers[n].url) : s.push(e.triggers[n].url);
          }return { excludes: t, includes: s };
        }function c(t, s, n, a) {
          e.modules.Util.setMapDefault(e.modules.crmValues.tabData, t, { libraries: new window.Map(), nodes: new window.Map() }), e.modules.Util.setMapDefault(e.modules.crmValues.tabData.get(t).nodes, n, []), e.modules.crmValues.tabData.get(t).nodes.get(n).push({ secretKey: s, usesLocalStorage: -1 < a.indexOf('localStorageProxy') });
        }t.generateGreaseMonkeyData = i, t.getInExcludes = d, t.genTabData = c, t.createHandler = function (t) {
          var a = this;return function (o, r, u) {
            return void 0 === u && (u = !1), A(a, void 0, void 0, function () {
              var a = this,
                  p,
                  g,
                  m,
                  h,
                  y,
                  f,
                  b,
                  x,
                  v,
                  I,
                  S,
                  _,
                  k,
                  C;return U(this, function (M) {
                switch (M.label) {case 0:
                    p = [], g = !1;try {
                      p = e.modules.Util.createSecretKey();
                    } catch (t) {
                      g = t;
                    }return g ? (browserAPI.tabs.executeScript(r.id, { code: 'alert("Something went wrong very badly, please go to your Custom Right-Click Menu options page and remove any sketchy scripts.")' }).then(function () {
                      browserAPI.runtime.reload();
                    }), [3, 6]) : [3, 1];case 1:
                    return m = '\t', [4, window.Promise.all([e.modules.Util.iipe(function () {
                      return A(a, void 0, void 0, function () {
                        var e;return U(this, function (t) {
                          switch (t.label) {case 0:
                              return u ? [2, null] : [3, 1];case 1:
                              return [4, browserAPI.tabs.sendMessage(r.id, { type: 'getLastClickInfo' })];case 2:
                              return e = t.sent(), [2, e];}
                        });
                      });
                    }), e.modules.Util.iipe(function () {
                      return A(a, void 0, void 0, function () {
                        var s, n, a, o, l, c, u, p;return U(this, function (g) {
                          switch (g.label) {case 0:
                              return a = (n = e.MetaTags).getMetaTags, [4, e.modules.Util.getScriptNodeScript(t)];case 1:
                              return s = a.apply(n, [g.sent()]), o = s['run-at'] || s.run_at || 'document_end', o && Array.isArray(o) && (o = o[0]), l = d(t), c = l.excludes, u = l.includes, p = {}, [4, i(s, t, u, c, r)];case 2:
                              return [2, (p.greaseMonkeyData = g.sent(), p.runAt = o, p)];}
                        });
                      });
                    }), e.modules.Util.iipe(function () {
                      return A(a, void 0, void 0, function () {
                        return U(this, function (s) {
                          switch (s.label) {case 0:
                              return [4, e.modules.Util.getScriptNodeScript(t)];case 1:
                              return [2, s.sent().split('\n').map(function (e) {
                                return m + e;
                              }).join('\n')];}
                        });
                      });
                    }), e.modules.Util.iipe(function () {
                      return A(a, void 0, void 0, function () {
                        var s, n, a;return U(this, function (o) {
                          switch (o.label) {case 0:
                              return s = c, n = [r.id, p, t.id], [4, e.modules.Util.getScriptNodeScript(t)];case 1:
                              return s.apply(void 0, n.concat([o.sent()])), a = e.modules.crmValues.tabData.get(r.id).nodes.get(t.id).length - 1, e.modules.Logging.Listeners.updateTabAndIdLists(), [2, a];}
                        });
                      });
                    })])];case 2:
                    return h = M.sent(), y = h[0], f = h[1], b = f.greaseMonkeyData, x = f.runAt, v = h[2], I = h[3], S = e.makeSafe(t), S.permissions = t.permissions, [4, s({ node: t, safeNode: S, tab: r, info: o, key: p, contextData: y, greaseMonkeyData: b, indentUnit: m, script: v, tabIndex: I })];case 3:
                    return _ = M.sent(), [4, e.modules.Util.getScriptNodeScript(t)];case 4:
                    return k = -1 < M.sent().indexOf('unsafeWindow'), [4, n(_, x, t, k)];case 5:
                    C = M.sent(), l(t.id, r.id, C, k), M.label = 6;case 6:
                    return [2];}
              });
            });
          };
        };
      })(s = t.Handler || (t.Handler = {}));
    })(t = e.Script || (e.Script = {}));
  })(R || (R = {})), function (e) {
    var t;(function (t) {
      var s;(function (s) {
        function n(t) {
          return A(this, void 0, void 0, function () {
            var s, n, a, o, r, l, i, d, c;return U(this, function (u) {
              switch (u.label) {case 0:
                  s = [], n = [], a = e.modules.storages.storageLocal.libraries, o = e.modules.storages.urlDataPairs, r = 0, u.label = 1;case 1:
                  if (!(r < t.value.libraries.length)) return [3, 10];if (l = void 0, !a) return [3, 8];i = 0, u.label = 2;case 2:
                  return i < a.length ? a[i].name === t.value.libraries[r].name ? (d = a[i], !(d.ts && d.ts.enabled)) ? [3, 4] : (c = {}, [4, e.modules.Util.getLibraryCode(d)]) : [3, 6] : [3, 8];case 3:
                  return l = (c.code = u.sent(), c), [3, 5];case 4:
                  l = d, u.label = 5;case 5:
                  return [3, 8];case 6:
                  null === t.value.libraries[r].name && o.get(t.value.libraries[r].url) && (l = { code: o.get(t.value.libraries[r].url).dataString }), u.label = 7;case 7:
                  return i++, [3, 2];case 8:
                  l && (l.location ? s.push('/js/defaultLibraries/' + l.location) : n.push(l.code)), u.label = 9;case 9:
                  return r++, [3, 1];case 10:
                  return [2, { libraries: s, code: n }];}
            });
          });
        }function a(t, s, n) {
          var a = s.key,
              o = s.node,
              r = s.script,
              l = s.safeNode,
              i = s.indentUnit,
              d = s.greaseMonkeyData;return A(this, void 0, void 0, function () {
            var s, c, u;return U(this, function (p) {
              switch (p.label) {case 0:
                  return [4, e.modules.Util.getScriptNodeScript(o)];case 1:
                  return s = -1 < p.sent().indexOf('/*execute locally*/') && o.isLocal, c = e.modules.storages.storageLocal.catchErrors, u = [], BrowserAPI.isBrowserAPISupported('chrome') && u.push('chrome'), BrowserAPI.isBrowserAPISupported('browser') && u.push('browser'), e.modules.Util.setMapDefault(e.modules.storages.nodeStorage, o.id, {}), e.modules.Util.setMapDefault(e.modules.storages.nodeStorageSync, o.id, {}), [2, [t.join('\n'), ['var crmAPI = new (window._crmAPIRegistry.pop())(' + [l, o.id, { id: 0 }, {}, a, e.modules.storages.nodeStorage.get(o.id), null, d, !0, e.fixOptionsErrors(o.value && o.value.options || {}), s, 0, browserAPI.runtime.id, u.join(','), e.modules.storages.nodeStorageSync.get(o.id)].map(function (e) {
                    return void 0 === e ? JSON.stringify(null) : JSON.stringify(e);
                  }).join(', ') + ');'].join(', '), e.modules.constants.templates.globalObjectWrapperCode('self', 'selfWrapper', void 0, void 0), '' + (c ? 'try {' : ''), 'function main(crmAPI, self, menuitemid, parentmenuitemid, mediatype,' + (i + 'linkurl, srcurl, pageurl, frameurl, frameid,') + (i + 'selectiontext, editable, waschecked, checked) {'), n ? 'debugger;' : '', r, '}', 'window.crmAPI = self.crmAPI = crmAPI', 'crmAPI.onReady(function() {main(crmAPI, selfWrapper)});', '' + (c ? ['} catch (error) {', i + 'if (crmAPI.debugOnError) {', '' + i + i + 'debugger;', i + '}', i + 'throw error;', '}'].join('\n') : '')].join('\n')];}
            });
          });
        }function o(t) {
          return A(this, void 0, void 0, function () {
            var s, n;return U(this, function (a) {
              switch (a.label) {case 0:
                  return n = !t || 'script' !== t.type, n ? [3, 2] : [4, e.modules.Util.getScriptNodeScript(t, 'background')];case 1:
                  n = !a.sent(), a.label = 2;case 2:
                  return s = n, s ? [3, 4] : [4, e.modules.Util.getScriptNodeScript(t, 'background')];case 3:
                  s = '' === a.sent(), a.label = 4;case 4:
                  return s ? [2, !1] : [2, !0];}
            });
          });
        }function r(s, r) {
          return void 0 === r && (r = !1), A(this, void 0, void 0, function () {
            var l = this,
                i,
                d,
                c,
                u,
                p,
                g,
                m,
                h,
                y,
                f,
                b,
                x,
                v,
                I,
                S,
                _,
                k,
                C;return U(this, function (M) {
              switch (M.label) {case 0:
                  return [4, o(s)];case 1:
                  return M.sent() ? (i = !1, !e.modules.background.byId.has(s.id)) ? [3, 5] : (i = !0, c = (d = e.modules.Logging).backgroundPageLog, u = [s.id, null], [4, window.__('background_crm_restartingBackgroundPage')]) : [2];case 2:
                  return [4, c.apply(d, u.concat([M.sent()]))];case 3:
                  return M.sent(), e.modules.background.byId.get(s.id).terminate(), g = (p = e.modules.Logging).backgroundPageLog, m = [s.id, null], [4, window.__('background_crm_terminatedBackgroundPage')];case 4:
                  g.apply(p, m.concat([M.sent()])), M.label = 5;case 5:
                  e.modules.background.byId.has(s.id) && e.modules.background.byId.get(s.id).terminate(), e.modules.crmValues.tabData.has(0) && e.modules.crmValues.tabData.get(0).nodes.has(s.id) && e.modules.crmValues.tabData.get(0).nodes['delete'](s.id), h = [], y = !1;try {
                    h = e.modules.Util.createSecretKey();
                  } catch (t) {
                    y = t;
                  }if (y) throw window.logAsync(window.__('background_crm_setupError', s.id), y), y;return f = '\t', [4, window.Promise.all([e.modules.Util.iipe(function () {
                    return A(l, void 0, void 0, function () {
                      return U(this, function (e) {
                        switch (e.label) {case 0:
                            return [4, n(s)];case 1:
                            return [2, e.sent()];}
                      });
                    });
                  }), e.modules.Util.iipe(function () {
                    return A(l, void 0, void 0, function () {
                      return U(this, function (t) {
                        switch (t.label) {case 0:
                            return [4, e.modules.Util.getScriptNodeScript(s, 'background')];case 1:
                            return [2, t.sent().split('\n').map(function (e) {
                              return f + e;
                            }).join('\n')];}
                      });
                    });
                  }), e.modules.Util.iipe(function () {
                    return A(l, void 0, void 0, function () {
                      var n, a, o, r, l, i;return U(this, function (d) {
                        switch (d.label) {case 0:
                            return o = (a = e.MetaTags).getMetaTags, [4, e.modules.Util.getScriptNodeScript(s)];case 1:
                            return n = o.apply(a, [d.sent()]), r = t.Handler.getInExcludes(s), l = r.excludes, i = r.includes, [4, t.Handler.generateGreaseMonkeyData(n, s, i, l, { incognito: !1 })];case 2:
                            return [2, d.sent()];}
                      });
                    });
                  }), e.modules.Util.iipe(function () {
                    return A(l, void 0, void 0, function () {
                      var n, a, o;return U(this, function (r) {
                        switch (r.label) {case 0:
                            return a = (n = t.Handler).genTabData, o = [0, h, s.id], [4, e.modules.Util.getScriptNodeScript(s, 'background')];case 1:
                            return a.apply(n, o.concat([r.sent()])), e.modules.Logging.Listeners.updateTabAndIdLists(), [2];}
                      });
                    });
                  })])];case 6:
                  return b = M.sent(), x = b[0], v = x.code, I = x.libraries, S = b[1], _ = b[2], k = e.makeSafe(s), k.permissions = s.permissions, [4, a(v, { key: h, node: s, script: S, safeNode: k, indentUnit: f, greaseMonkeyData: _ }, r)];case 7:
                  return C = M.sent(), e.modules.Sandbox.sandbox(s.id, C, I, h, function () {
                    var t = [],
                        n = e.modules.crmValues.nodeInstances;e.modules.Util.setMapDefault(n, s.id, new window.Map());var a = n.get(s.id);return e.modules.Util.iterateMap(a, function (n) {
                      try {
                        e.modules.crmValues.tabData.get(n).nodes.get(s.id).forEach(function (s, a) {
                          e.modules.Util.postMessage(s.port, { messageType: 'dummy' }), t.push({ id: n, tabIndex: a });
                        });
                      } catch (t) {
                        a['delete'](n);
                      }
                    }), t;
                  }, function (t) {
                    e.modules.background.byId.set(s.id, t), i && e.modules.Logging.log(s.id, '*', 'Background page [' + s.id + ']: ', 'Restarted background page...');
                  }), [2];}
            });
          });
        }s.createBackgroundPage = r, s.createBackgroundPages = function () {
          return A(this, void 0, void 0, function () {
            var t = this;return U(this, function () {
              return e.modules.Util.asyncIterateMap(e.modules.crm.crmById, function (e, s) {
                return A(t, void 0, void 0, function () {
                  var e, t;return U(this, function (n) {
                    switch (n.label) {case 0:
                        return 'script' === s.type && 0 < s.value.backgroundScript.length ? o(s) ? (t = (e = window).info, [4, window.__('background_crm_createdBackgroundPage', s.id)]) : [3, 2] : [3, 4];case 1:
                        t.apply(e, [n.sent()]), n.label = 2;case 2:
                        return [4, r(s)];case 3:
                        n.sent(), n.label = 4;case 4:
                        return [2];}
                  });
                });
              }), [2];
            });
          });
        };
      })(s = t.Background || (t.Background = {}));
    })(t = e.Script || (e.Script = {}));
  }(R || (R = {})), function (e) {
    var t;(function (t) {
      function s(e) {
        for (var t = [], s = -1, n = -1, a = e.split('\n'), o = 0; o < a.length; o++) {
          -1 === s ? (-1 < a[o].indexOf('==UserScript==') || -1 < a[o].indexOf('==UserStyle==')) && (s = o) : (-1 < a[o].indexOf('==/UserScript==') || -1 < a[o].indexOf('==/UserStyle==')) && (n = o, t.push({ start: s, end: n }), s = -1, n = -1);
        }return t;
      }function n(t, a) {
        if (void 0 === a && (a = !0), a) return e.modules.Caches.cacheCall(n, arguments, !0);for (var o = s(t), r = [], l = t.split('\n'), d = 0, c = o; d < c.length; d++) {
          for (var u = c[d], p = u.start, g = u.end, m = p + 1; m < g; m++) {
            r.push(l[m]);
          }
        }return r;
      }t.getMetaIndexes = s, t.getMetaLines = n;var a = new window.Map();t.getMetaTags = function (e) {
        var t = window.md5(e);if (a.has(t)) return a.get(t);for (var s = n(e), o = {}, r = null, l = /@(\w+)(\s+)(.+)/, d = 0, i; d < s.length; d++) {
          if (i = s[d].match(l), i) {
            if (r) {
              var c = r.key,
                  u = r.value;o[c] = o[c] || [], o[c].push(u);
            }r = { key: i[1], value: i[3] };
          } else r.value += '\n' + s[d];
        }if (r) {
          var c = r.key,
              u = r.value;o[c] = o[c] || [], o[c].push(u);
        }return a.set(t, o), o;
      }, t.getMetaTag = function (e, t) {
        return t in e ? Array.isArray(e[t]) ? e[t][0] : e[t] : void 0;
      }, t.getlastMetaTagValue = function (e, t) {
        return e[t] && e[t][e[t].length - 1];
      };
    })(t = e.MetaTags || (e.MetaTags = {}));
  }(R || (R = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        function s(t) {
          return A(this, void 0, void 0, function () {
            var n, a, o;return U(this, function (r) {
              switch (r.label) {case 0:
                  if (n = e.modules.crm.crmById.get(t).children, !n) return [3, 4];a = 0, r.label = 1;case 1:
                  return a < n.length ? [4, s(n[a].id)] : [3, 4];case 2:
                  r.sent(), r.label = 3;case 3:
                  return a++, [3, 1];case 4:
                  return e.modules.background.byId.has(t) && (e.modules.background.byId.get(t).terminate(), e.modules.background.byId['delete'](t)), e.modules.crm.crmById['delete'](t), e.modules.crm.crmByIdSafe['delete'](t), o = e.modules.crmValues.contextMenuIds.get(t), void 0 === o || null === o ? [3, 6] : [4, browserAPI.contextMenus.remove(o)['catch'](function () {})];case 5:
                  r.sent(), r.label = 6;case 6:
                  return [2];}
            });
          });
        }function n(t, s) {
          if (s !== void 0 && null !== s) {
            for (var n = e.modules.storages.settingsStorage.crm, a = 0, o = s.slice(0, -1); a < o.length; a++) {
              var r = o[a],
                  l = n[r].children;if (!l) return;n = l;
            }n[e.modules.Util.getLastItem(s)] = t;
          } else e.modules.storages.settingsStorage.crm.push(t);
        }function a(t, s) {
          return e.MetaTags.getlastMetaTagValue(t, 'CRM_LaunchMode') ? e.MetaTags.getlastMetaTagValue(t, 'CRM_LaunchMode') : 0 === s.length ? 0 : 2;
        }function o(e) {
          var t = [],
              s = (e.includes || []).concat(e.include);s && (t = t.concat(s.map(function (e) {
            return { url: e, not: !1 };
          }).filter(function (e) {
            return !!e.url;
          })));var n = e.match;n && (t = t.concat(n.map(function (e) {
            return { url: e, not: !1 };
          }).filter(function (e) {
            return !!e.url;
          })));var o = e.exclude;return o && (t = t.concat(o.map(function (e) {
            return { url: e, not: !1 };
          }).filter(function (e) {
            return !!e.url;
          }))), t = t.filter(function (e, s) {
            return t.indexOf(e) === s;
          }), { triggers: t, launchMode: a(e, t) };
        }function r(t, s, n) {
          return A(this, void 0, void 0, function () {
            var a = this,
                o,
                r,
                l,
                d,
                c,
                i,
                u,
                p,
                g,
                m,
                h;return U(this, function (y) {
              switch (y.label) {case 0:
                  for (n.type = 'script', o = n, r = [], t.CRM_libraries && t.CRM_libraries.forEach(function (e) {
                    try {
                      r.push(JSON.parse(e));
                    } catch (t) {}
                  }), l = t.require || [], d = [], c = 0; c < l.length; c++) {
                    for (i = !1, u = 0; u < r.length; u++) {
                      if (r[u].url === l[c]) {
                        i = !0;break;
                      }
                    }i || d.push({ url: l[c], name: null });
                  }return d.forEach(function (t) {
                    e.modules.Resources.Anonymous.handle({ type: 'register', name: t.url, url: t.url, scriptId: o.id });
                  }), [4, browserAPI.storage.local.get('libraries')];case 1:
                  return p = y.sent().libraries, h = (m = p).concat, [4, Promise.all(r.map(function (t) {
                    var s = t.name,
                        n = t.url;return new Promise(function (t) {
                      return A(a, void 0, void 0, function () {
                        var a;return U(this, function (o) {
                          switch (o.label) {case 0:
                              return [4, e.modules.Util.xhr(n)['catch'](function () {
                                t(null);
                              })];case 1:
                              return a = o.sent(), a || t(null), t({ name: s, code: a, url: n, ts: { enabled: !1, code: {} } }), [2];}
                        });
                      });
                    });
                  }))];case 2:
                  return g = h.apply(m, [y.sent().filter(function (e) {
                    return !!e;
                  })]), [4, browserAPI.storage.local.set({ libraries: g })];case 3:
                  return y.sent(), [4, e.modules.Storages.applyChanges({ type: 'libraries', libraries: g })];case 4:
                  return y.sent(), r = r.concat(d), o.value = e.modules.constants.templates.getDefaultScriptValue({ script: s, libraries: r }), [2];}
            });
          });
        }function l(t, s, n) {
          n = n, n.type = 'stylesheet', n.value = { stylesheet: s, defaultOn: t.CRM_defaultOn = e.MetaTags.getlastMetaTagValue(t, 'CRM_defaultOn') || !1, toggle: t.CRM_toggle = e.MetaTags.getlastMetaTagValue(t, 'CRM_toggle') || !1, launchMode: 1, options: {}, convertedStylesheet: null };
        }function i(t, s, n) {
          return A(this, void 0, void 0, function () {
            return U(this, function (a) {
              switch (a.label) {case 0:
                  return e.MetaTags.getlastMetaTagValue(t, 'CRM_stylesheet') ? (l(t, s, n), [3, 3]) : [3, 1];case 1:
                  return [4, r(t, s, n)];case 2:
                  a.sent(), a.label = 3;case 3:
                  return [2];}
            });
          });
        }function d(t, s, n, a, r) {
          return A(this, void 0, void 0, function () {
            var l, d, c, u, p, g, m, h, y, f, b, x, v, I, S, _;return U(this, function (k) {
              switch (k.label) {case 0:
                  return (l = {}, d = !1, void 0 === r || null === r) ? [3, 1] : (d = !0, l.id = r, [3, 3]);case 1:
                  return c = l, [4, e.modules.Util.generateItemId()];case 2:
                  c.id = k.sent(), k.label = 3;case 3:
                  return 0 === Object.getOwnPropertyNames(t).length && (t = e.MetaTags.getMetaTags(s)), l.name = e.MetaTags.getlastMetaTagValue(t, 'name') || 'name', [4, i(t, s, l)];case 4:
                  if (k.sent(), u = o(t), p = u.launchMode, g = u.triggers, l.triggers = g, l.value.launchMode = p, m = e.MetaTags.getlastMetaTagValue(t, 'updateURL') || e.MetaTags.getlastMetaTagValue(t, 'downloadURL') || n, h = [], t.grant && (h = t.grant, h = h.splice(h.indexOf('none'), 1)), l.nodeInfo = { version: e.MetaTags.getlastMetaTagValue(t, 'version') || null, source: { updateURL: m || n, url: m || e.MetaTags.getlastMetaTagValue(t, 'namespace') || n, author: e.MetaTags.getlastMetaTagValue(t, 'author') || 'Anonymous', autoUpdate: !0 }, isRoot: !0, permissions: h, lastUpdatedAt: Date.now(), installDate: new Date().toLocaleDateString() }, d && (l.nodeInfo.installDate = e.modules.Util.accessPath(e.modules.crm.crmById.get(r), 'nodeInfo', 'installDate') || l.nodeInfo.installDate), e.MetaTags.getlastMetaTagValue(t, 'CRM_contentTypes')) try {
                    l.onContentTypes = JSON.parse(e.MetaTags.getlastMetaTagValue(t, 'CRM_contentTypes'));
                  } catch (t) {}return l.onContentTypes || (l.onContentTypes = [!0, !0, !0, !0, !0, !0]), l.permissions = a || [], t.resource && (y = t.resource, y.forEach(function (t) {
                    var s = t.split(/(\s*)/),
                        n = s[0],
                        a = s[1];e.modules.Resources.Resource.handle({ type: 'register', name: n, url: a, scriptId: l.id });
                  })), [4, browserAPI.storage.local.get()];case 5:
                  return f = k.sent().requestPermissions, b = void 0 === f ? [] : f, browserAPI.permissions ? [4, browserAPI.permissions.getAll()] : [3, 7];case 6:
                  return v = k.sent(), [3, 8];case 7:
                  v = { permissions: [] }, k.label = 8;case 8:
                  return x = v, I = x.permissions || [], S = b.concat(l.permissions).filter(function (e) {
                    return -1 === I.indexOf(e);
                  }).filter(function (e, t, s) {
                    return s.indexOf(e) === t;
                  }), browserAPI.storage.local.set({ requestPermissions: S }), l = 'script' === l.type ? e.modules.constants.templates.getDefaultScriptNode(l) : e.modules.constants.templates.getDefaultStylesheetNode(l), d ? (_ = e.modules.crm.crmById.get(r).path, [2, { node: l, path: _, oldNodeId: r }]) : [2, { node: l, path: null, oldNodeId: null }];return [2];}
            });
          });
        }function c(e) {
          var t = e.nodeInfo;return t && t.source && 'string' !== typeof t.source && (t.source.downloadURL || t.source.updateURL || t.source.url);
        }function u(t, s) {
          return A(this, void 0, void 0, function () {
            var n, a, o, r;return U(this, function (l) {
              switch (l.label) {case 0:
                  return n = t.map(function (t) {
                    var n = t.node,
                        a = n.id,
                        o = n.name,
                        r = n.nodeInfo,
                        l = e.modules.Storages.findNodeWithId(s, a);return { name: o, id: a, oldVersion: l && l.nodeInfo && l.nodeInfo.version || '', newVersion: r.version || '' };
                  }), [4, e.modules.Storages.uploadChanges('settings', [{ key: 'crm', oldValue: s, newValue: e.modules.storages.settingsStorage.crm }])];case 1:
                  return l.sent(), [4, browserAPI.storage.local.get()];case 2:
                  return a = l.sent().updatedNodes, o = void 0 === a ? [] : a, r = o.concat(n), browserAPI.storage.local.set({ updatedScripts: r }), [2, r];}
            });
          });
        }function p(t, s, n) {
          var a = this;return new Promise(function (o) {
            if (s && e.modules.Util.endsWith(s, '.user.js')) try {
              e.modules.Util.convertFileToDataURI(s, function (r, l) {
                return A(a, void 0, void 0, function () {
                  var a, r, i, c, u, p;return U(this, function (g) {
                    switch (g.label) {case 0:
                        return g.trys.push([0, 6,, 7]), a = e.MetaTags.getMetaTags(l), e.modules.Util.isNewer(a.version[0], t.nodeInfo.version) ? e.modules.Util.compareArray(t.nodeInfo.permissions, a.grant) || 1 === a.grant.length && 'none' === a.grant[0] ? [3, 3] : [4, browserAPI.storage.local.get()] : [3, 5];case 1:
                        return r = g.sent().addedPermissions, i = void 0 === r ? [] : r, i.push({ node: t.id, permissions: a.grant.filter(function (e) {
                            return -1 === t.nodeInfo.permissions.indexOf(e);
                          }) }), [4, browserAPI.storage.local.set({ addedPermissions: i })];case 2:
                        g.sent(), g.label = 3;case 3:
                        return u = (c = n).push, [4, d(a, l, s, t.permissions, t.id)];case 4:
                        u.apply(c, [g.sent()]), g.label = 5;case 5:
                        return [3, 7];case 6:
                        return p = g.sent(), window.logAsync(window.__('background_crm_updateDownload404', 'script', t.id, t.name)), [3, 7];case 7:
                        return o(null), [2];}
                  });
                });
              }, function () {
                window.logAsync(window.__('background_crm_updateDownload404', 'script', t.id, t.name)), o(null);
              });
            } catch (s) {
              window.logAsync(window.__('background_crm_updateDownload404', 'script', t.id, t.name)), o(null);
            }
          });
        }t.removeOldNode = s, t.registerNode = n, t.install = function (a) {
          return A(this, void 0, void 0, function () {
            var o, r, l, i, d, c;return U(this, function (u) {
              switch (u.label) {case 0:
                  return o = JSON.parse(JSON.stringify(e.modules.storages.settingsStorage.crm)), [4, t.installUserscript(a.metaTags, a.script, a.downloadURL, a.allowedPermissions)];case 1:
                  return (r = u.sent(), l = r.path, i = r.oldNodeId, d = r.node, !l) ? [3, 3] : (c = l, [4, s(i)]);case 2:
                  return u.sent(), n(d, c), [3, 4];case 3:
                  n(d), u.label = 4;case 4:
                  return [4, e.modules.Storages.uploadChanges('settings', [{ key: 'crm', oldValue: o, newValue: e.modules.storages.settingsStorage.crm }])];case 5:
                  return u.sent(), [2];}
            });
          });
        }, t.installUserscript = d, t.updateScripts = function () {
          return A(this, void 0, void 0, function () {
            var t = this,
                s,
                n;return U(this, function (a) {
              switch (a.label) {case 0:
                  return s = [], n = JSON.parse(JSON.stringify(e.modules.storages.settingsStorage.crm)), [4, Promise.all(e.modules.Util.mapToArr(e.modules.crm.crmById).map(function (e) {
                    var n = e[0],
                        a = e[1];return A(t, void 0, void 0, function () {
                      var e, t;return U(this, function (n) {
                        switch (n.label) {case 0:
                            return 'script' === a.type ? (e = a.nodeInfo && a.nodeInfo.isRoot, t = c(a), t && e && 'local' !== a.nodeInfo.source && a.nodeInfo.source.autoUpdate ? [4, p(a, t, s)] : [3, 2]) : [2];case 1:
                            n.sent(), n.label = 2;case 2:
                            return [2];}
                      });
                    });
                  }))];case 1:
                  return a.sent(), [4, u(s, n)];case 2:
                  return a.sent(), [2];}
            });
          });
        };
      })(s = t.Updating || (t.Updating = {}));
    })(t = e.Script || (e.Script = {}));
  }(R || (R = {})), function (e) {
    var t;(function (t) {
      function s(t) {
        if (-1 < e.modules.storages.globalExcludes.indexOf('<all_urls>')) return !0;for (var s = 0, n; s < e.modules.storages.globalExcludes.length; s++) {
          if (n = e.modules.storages.globalExcludes[s], n && e.modules.URLParsing.urlMatchesPattern(n, t)) return !0;
        }return !1;
      }function n(t, s) {
        'script' === t.type ? e.Script.Handler.createHandler(t)({ pageUrl: s.url, menuItemId: 0, editable: !1, modifiers: [] }, s, !0) : 'stylesheet' === t.type ? e.Stylesheet.createClickHandler(t)({ pageUrl: s.url, menuItemId: 0, editable: !1, modifiers: [] }, s) : 'link' === t.type && e.Link.createHandler(t)({ pageUrl: s.url, menuItemId: 0, editable: !1, modifiers: [] }, s);
      }t.urlIsGlobalExcluded = s, t.executeNode = n, t.executeScriptsForTab = function (t, a) {
        return A(this, void 0, void 0, function () {
          var o, r, l, i, d, c, u;return U(this, function (p) {
            switch (p.label) {case 0:
                return p.trys.push([0, 2,, 3]), [4, browserAPI.tabs.get(t)];case 1:
                if (o = p.sent(), o.url && e.modules.Util.canRunOnUrl(o.url) && (e.modules.crmValues.tabData.set(o.id, { libraries: new window.Map(), nodes: new window.Map() }), e.modules.Logging.Listeners.updateTabAndIdLists(), a && e.modules.GlobalDeclarations.runAlwaysRunNodes(o), !s(o.url))) {
                  for (r = e.modules.toExecuteNodes, l = r.onUrl.documentEnd.filter(function (t) {
                    var s = t.triggers;return e.modules.URLParsing.matchesUrlSchemes(s, o.url);
                  }), (i = 0, d = r.always.documentEnd.concat(l)); i < d.length; i++) {
                    c = d[i].id, n(e.modules.crm.crmById.get(c), o);
                  }return [2, { matched: 0 < l.length }];
                }return [3, 3];case 2:
                return u = p.sent(), console.log('Error while executing scripts for tab', u), [3, 3];case 3:
                return [2, { matched: !1 }];}
          });
        });
      };
    })(t = e.Running || (e.Running = {}));
  }(R || (R = {})), function (e) {
    var t;(function (e) {
      function t(e) {
        return -1 === e.indexOf('://') && (e = 'http://' + e), e;
      }function s(e, t) {
        return e.replace(/%s/g, t.selectionText || '');
      }e.createHandler = function (e) {
        return function (n, a) {
          for (var o = 0, r; o < e.value.length; o++) {
            e.value[o].newTab ? browserAPI.tabs.create({ windowId: a.windowId, url: s(t(e.value[o].url), n), openerTabId: a.id }) : r = e.value[o].url;
          }r && browserAPI.tabs.update(a.id, { url: s(t(r), n) });
        };
      };
    })(t = e.Link || (e.Link = {}));
  }(R || (R = {})), function (e) {
    var t;(function (t) {
      var s;(function (s) {
        function n(e) {
          var t = e.nodeInfo;return t && t.source && 'string' !== typeof t.source && (t.source.downloadURL || t.source.updateURL || t.source.url);
        }function a(s, n, a) {
          var o = this;return new Promise(function (r) {
            e.modules.Util.convertFileToDataURI(n, function (n, l) {
              return A(o, void 0, void 0, function () {
                var n, o, i, d, c;return U(this, function () {
                  try {
                    for (n = t.Installing.getUserstyleMeta(l), o = 0; o < n.sections.length; o++) {
                      (i = n.sections[o], d = e.Stylesheet.Installing.extractStylesheetData(i), c = !1, 'local' === s.nodeInfo.source || s.nodeInfo.source.sectionIndex === o) && (s.value.launchMode !== d.launchMode && (s.value.launchMode = d.launchMode, c = !0), e.modules.Util.compareArray(s.triggers, d.triggers) || (s.triggers = JSON.parse(JSON.stringify(d.triggers)), c = !0), s.value.stylesheet !== d.code && (s.value.stylesheet = d.code, c = !0), c && a.push({ node: s }));
                    }r(null);
                  } catch (t) {
                    r(null);
                  }return [2];
                });
              });
            }, function () {
              window.logAsync(window.__('background_crm_updateDownload404', 'stylesheet', s.id, s.name)), r(null);
            });
          });
        }function o(t, s) {
          return A(this, void 0, void 0, function () {
            var n, a, o, r;return U(this, function (l) {
              switch (l.label) {case 0:
                  return n = t.map(function (t) {
                    var n = t.node,
                        a = n.id,
                        o = n.name,
                        r = n.nodeInfo,
                        l = e.modules.Storages.findNodeWithId(s, a);return { name: o, id: a, oldVersion: e.modules.Util.accessPath(l, 'nodeInfo', 'version') || void 0, newVersion: r.version };
                  }), [4, e.modules.Storages.uploadChanges('settings', [{ key: 'crm', oldValue: s, newValue: e.modules.storages.settingsStorage.crm }])];case 1:
                  return l.sent(), [4, browserAPI.storage.local.get()];case 2:
                  return a = l.sent().updatedNodes, o = void 0 === a ? [] : a, r = o.concat(n), browserAPI.storage.local.set({ updatedScripts: r }), [2, r];}
            });
          });
        }s.getDownloadURL = n, s.updateStylesheet = function (t) {
          return A(this, void 0, void 0, function () {
            var s, a, o, r, l;return U(this, function (i) {
              switch (i.label) {case 0:
                  return s = e.modules.crm.crmById.get(t), a = n(s), [4, e.Stylesheet.Installing.getUserstyleMeta(a)];case 1:
                  return o = i.sent().sections['local' !== s.nodeInfo.source && s.nodeInfo.source.sectionIndex], r = e.Stylesheet.Installing.extractStylesheetData(o), l = JSON.parse(JSON.stringify(e.modules.storages.settingsStorage.crm)), s.value.launchMode = r.launchMode, s.triggers = JSON.parse(JSON.stringify(r.triggers)), s.value.stylesheet = r.code, [4, e.modules.Storages.uploadChanges('settings', [{ key: 'crm', oldValue: l, newValue: e.modules.storages.settingsStorage.crm }])];case 2:
                  return i.sent(), [2];}
            });
          });
        }, s.updateStylesheets = function () {
          return A(this, void 0, void 0, function () {
            var t = this,
                s,
                r;return U(this, function (l) {
              switch (l.label) {case 0:
                  return s = [], r = JSON.parse(JSON.stringify(e.modules.storages.settingsStorage.crm)), [4, Promise.all(e.modules.Util.mapToArr(e.modules.crm.crmById).map(function (e) {
                    var o = e[0],
                        r = e[1];return A(t, void 0, void 0, function () {
                      var e, t;return U(this, function (o) {
                        switch (o.label) {case 0:
                            return 'stylesheet' === r.type ? (e = r.nodeInfo && r.nodeInfo.isRoot, t = n(r), t && e && 'local' !== r.nodeInfo.source && r.nodeInfo.source.autoUpdate ? [4, a(r, t, s)] : [3, 2]) : [2];case 1:
                            o.sent(), o.label = 2;case 2:
                            return [2];}
                      });
                    });
                  }))];case 1:
                  return l.sent(), [4, o(s, r)];case 2:
                  return l.sent(), [2];}
            });
          });
        };
      })(s = t.Updating || (t.Updating = {}));
    })(t = e.Stylesheet || (e.Stylesheet = {}));
  }(R || (R = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        function s(e) {
          switch (e.type) {case 'array':
              return e.items;case 'boolean':case 'number':case 'string':case 'color':
              return e.value;case 'choice':
              return e.values[e.selected];}
        }function n(e, t, n) {
          for (var a; a = g.exec(t);) {
            var o = a[1];if (!(o in n)) window.logAsync(window.__('background_crm_optionNotFound', o, e)), t = t.replace(g, '/*[' + o + ']*/');else {
              var r = s(n[o]);t = t.replace(g, r);
            }
          }return t;
        }function a(e) {
          var t = e.replace(/\n/g, '').split(' '),
              s = t[0],
              n = t[1],
              a = t.slice(2),
              o = a.join(' ').trim(),
              r,
              l;if (0 === o.indexOf('"') || 0 === o.indexOf('\'')) {
            var i = o[0];r = o.slice(1, 1 + o.slice(1).indexOf(i));
          } else r = a[0];l = s.length + 1 + n.length + 1 + r.length + 2;var d = e.replace(/\n/g, '').slice(l).trim();return { type: s, name: n, label: r, defaultValue: d };
        }function o(e) {
          return 'text' === e ? 'string' : 'color' === e ? 'color' : 'checkbox' === e ? 'boolean' : 'select' === e ? 'choice' : '?';
        }function r(t, s) {
          var n = e.MetaTags.getMetaTags(t),
              r = (n['var'] || []).concat(n.advanced || []);if (0 === r.length) return null;var l = {},
              i;return r.forEach(function (e) {
            var t = a(e),
                n = t.type,
                r = t.name,
                d = t.label,
                c = t.defaultValue,
                u = _P({}, 'string' !== typeof s && s[r] || {}, { type: o(n), descr: d });switch (n) {case 'text':case 'color':case 'checkbox':
                i = 'string' !== typeof s && s[r], i && null === i.value && (u.value = c);break;case 'select':
                try {
                  var p = JSON.parse(c);l[r] = Array.isArray(c) ? _P({}, u, { values: c.map(function (e) {
                      return -1 < e.indexOf(':') ? e.split(':')[0] : e;
                    }), selected: 0 }) : _P({}, u, { values: Object.getOwnPropertyNames(p).map(function (e) {
                      return p[e];
                    }), selected: 0 });
                } catch (t) {
                  l[r] = _P({}, u, { values: [], selected: 0 });break;
                }}l[r] = u;
          }), l;
        }function l(t, s) {
          if ('less' === t || 'stylus' === t) return e.modules.Util.toArray(s || {}).map(function (e) {
            var t = e[0],
                s = e[1];switch (s.type) {case 'string':case 'color':case 'number':
                return { key: t, value: (null === s.value ? s.defaultValue : s.value) + '' };case 'boolean':
                return { key: t, value: s.value ? 'true' : 'false' };case 'array':
                return { key: t, value: (null === s.value ? s.defaultValue : s.value).join(' ') };case 'choice':
                return { key: t, value: s.values[s.selected || 0] + '' };}
          });if ('default' === t) e.modules.Util.toArray(s || {}).map(function (e) {
            var t = e[0],
                s = e[1];switch (s.type) {case 'string':case 'color':case 'number':case 'boolean':
                return { key: t, value: (null === s.value ? s.defaultValue : s.value) + '' };case 'array':
                return { key: t, value: (null === s.value ? s.defaultValue : s.value).join(' ') };case 'choice':
                return { key: t, value: s.values[s.selected || 0] + '' };}
          });else if ('uso' === t) return [];return [];
        }function i(e, t, s) {
          var n = r(e, t),
              a = l(s, n);return 'less' === s ? a.map(function (e) {
            var t = e.key,
                s = e.value;return '@' + t + ':\t' + s;
          }).join('\n') + '\n' + e : 'stylus' === s ? a.map(function (e) {
            var t = e.key,
                s = e.value;return t + ' = ' + s + ';';
          }).join('\n') + '\n' + e : 'default' === s ? ':root {\n' + a.map(function (e) {
            var t = e.key,
                s = e.value;return '\t--' + t + ': ' + s;
          }).join('\n') + '\n}\n' + e : e;
        }function d(e, t) {
          return new Promise(function (s) {
            window.less.Parser().parse(e, function (n, a) {
              n ? (window.logAsync(window.__('background_crm_cssCompileError', 'less', t) + ':', n.name, n.message), s(e)) : s(a.toCSS());
            });
          });
        }function c(e, t) {
          return new Promise(function (s) {
            window.stylus(e).render(function (n, a) {
              n ? (window.logAsync(window.__('background_crm_cssCompileError', 'stylus', t) + ':', n.name, n.message), s(e)) : s(a.trim());
            });
          });
        }function u(t, s, a, o) {
          return A(this, void 0, void 0, function () {
            return U(this, function (r) {
              switch (r.label) {case 0:
                  return 'less' === a ? [4, e.modules.Util.execFile('js/libraries/less.js', 'less')] : [3, 3];case 1:
                  return r.sent(), [4, d(t, s)];case 2:
                  return [2, r.sent()];case 3:
                  return 'stylus' === a ? [4, e.modules.Util.execFile('js/libraries/stylus.js', 'stylus')] : [3, 6];case 4:
                  return r.sent(), [4, c(t, s)];case 5:
                  return [2, r.sent()];case 6:
                  return 'uso' === a ? [2, n(s, t, o)] : [2, t];r.label = 7;case 7:
                  return [2];}
            });
          });
        }function p(t, s, n) {
          return A(this, void 0, void 0, function () {
            var a, o, r;return U(this, function (l) {
              switch (l.label) {case 0:
                  return a = e.MetaTags.getMetaTags(s), o = (a['var'] || []).concat(a.advanced || []), r = a.preprocessor && a.preprocessor[0] || (o.length ? 'uso' : 'default'), [4, u(i(s, n, r), t, r, n)];case 1:
                  return [2, l.sent()];}
            });
          });
        }var g = /\/\*\[\[((.)+)\]\]\*\//;t.getConvertedStylesheet = function (e) {
          return A(this, void 0, void 0, function () {
            var t, s;return U(this, function (n) {
              switch (n.label) {case 0:
                  return e.value.convertedStylesheet && e.value.convertedStylesheet.options === JSON.stringify(e.value.options) ? [2, e.value.convertedStylesheet.stylesheet] : (t = e.value, s = { options: JSON.stringify(e.value.options) }, [4, p(e.id, e.value.stylesheet, 'string' === typeof e.value.options ? {} : e.value.options)]);case 1:
                  return t.convertedStylesheet = (s.stylesheet = n.sent(), s), [2, e.value.convertedStylesheet.stylesheet];}
            });
          });
        };
      })(s = t.Options || (t.Options = {}));
    })(t = e.Stylesheet || (e.Stylesheet = {}));
  }(R || (R = {})), function (e) {
    var t;(function (t) {
      var s;(function (t) {
        function s(e) {
          var t = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g.exec(e);return [t[2] || '*', '://', t[4] && t[6] ? t[4] + t[6] : '*', t[7] || '/'].join('');
        }function n(t) {
          if (0 === t.domains.length && 0 === t.regexps.length && t.urlPrefixes.length && 0 === t.urls.length) return { launchMode: 1, triggers: [], code: t.code };var n = [];return t.domains.forEach(function (e) {
            n.push('*://' + e + '/*');
          }), t.regexps.forEach(function (e) {
            var t = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g.exec(e);n.push([t[2] ? -1 < t[2].indexOf('*') ? '*' : t[2] : '*', '://', t[4] && t[6] ? -1 < t[4].indexOf('*') || -1 < t[6].indexOf('*') ? '*' : t[4] + t[6] : '*', t[7] ? -1 < t[7].indexOf('*') ? '*' : t[7] : '*'].join(''));
          }), t.urlPrefixes.forEach(function (t) {
            e.modules.URLParsing.triggerMatchesScheme(t) ? n.push(t + '*') : n.push(s(t + '*'));
          }), t.urls.forEach(function (t) {
            e.modules.URLParsing.triggerMatchesScheme(t) ? n.push(t) : n.push(s(t));
          }), { launchMode: 2, triggers: n.map(function (e) {
              return { url: e, not: !1 };
            }), code: t.code };
        }function a(t, s) {
          if (s.version && t.nodeInfo.version) return 1 === e.modules.Storages.getVersionDiff(t.nodeInfo.version, s.version);for (var n = 0; n < s.sections.length; n++) {
            var a = s.sections[n],
                o = e.Stylesheet.Installing.extractStylesheetData(a);if (('local' === t.nodeInfo.source || t.nodeInfo.source.sectionIndex === n) && (t.value.launchMode !== o.launchMode || !e.modules.Util.compareArray(t.triggers, o.triggers) || t.value.stylesheet !== o.code)) return !0;
          }return !1;
        }function o(t) {
          return A(this, void 0, void 0, function () {
            var s = this,
                n,
                o,
                r,
                l;return U(this, function (i) {
              switch (i.label) {case 0:
                  n = [], i.label = 1;case 1:
                  return i.trys.push([1, 3,, 4]), [4, e.modules.Util.xhr(t)];case 2:
                  return o = i.sent(), [3, 4];case 3:
                  return r = i.sent(), [2, []];case 4:
                  return [4, c(o)];case 5:
                  return l = i.sent(), [4, e.modules.Util.crmForEachAsync(e.modules.crm.crmTree, function (e) {
                    return A(s, void 0, void 0, function () {
                      return U(this, function () {
                        return 'stylesheet' === e.type ? (e.nodeInfo && e.nodeInfo.source && 'local' !== e.nodeInfo.source && (e.nodeInfo.source.updateURL === t || e.nodeInfo.source.downloadURL === t) && (a(e, l) ? n.push({ node: e, state: 'updatable' }) : n.push({ node: e, state: 'installed' })), [2]) : [2];
                      });
                    });
                  })];case 6:
                  return i.sent(), [2, n];}
            });
          });
        }function r(e, t, s) {
          for (var n = 0; n < s.length; n++) {
            if (e[t + n] !== s[n]) return !1;
          }return !0;
        }function l(e) {
          for (var t = [], s = -1, n = -1, a = -1, o = 0, l = !0, d = 0, i; d < e.length; d++) {
            i = e[d], (r(e, d, '@-moz-document') || r(e, d, '@document')) && (-1 !== n && (s = d - 1, t.push({ start: n, end: s, firstBracket: a }), n = s = a = -1), o = 0, l = !0, d += '-' === e[d + 1] ? 14 : 9, n = d), 0 === o && !1 === l && (s = d, l = !0, t.push({ start: n, end: s, firstBracket: a }), n = s = a = -1), '{' === i ? (l = !1, -1 === a && (a = d), o += 1) : '}' === i && (o -= 1);
          }return t;
        }function i(e) {
          var t = /(.*)\(['"](.*)['"]\)/.exec(e);return t ? { fn: t[1], url: t[2] } : { fn: null, url: null };
        }function d(t) {
          var s = e.MetaTags.getMetaLines(t);return l(t).map(function (e) {
            for (var n = e.start, a = e.end, o = e.firstBracket, r = t.slice(n, o), l = 0 < s.length ? '/* ==UserStyle==\n' + s.map(function (e) {
              return '' + e;
            }).join('\n') + '\n==/UserStyle==*/' : '', d = { code: l + '\n' + t.slice(o + 1, a - 1), domains: [], regexps: [], urlPrefixes: [], urls: [] }, c = r.split(',').map(function (e) {
              return e.trim();
            }).map(function (e) {
              return i(e);
            }), u = 0, p = c; u < p.length; u++) {
              var g = p[u],
                  m = g.fn,
                  h = g.url;'url' === m ? d.urls.push(h) : 'url-prefix' === m ? d.urlPrefixes.push(h) : 'domain' === m ? d.domains.push(h) : 'regexp' === m ? d.regexps.push(h) : void 0;
            }return d;
          });
        }function c(t) {
          var s = !1;try {
            JSON.parse(t), s = !0;
          } catch (t) {}if (s) return JSON.parse(t);var n = e.MetaTags.getMetaTags(t);return { sections: d(t), md5Url: window.md5(t), name: e.MetaTags.getMetaTag(n, 'name') || 'Userstyle', originalMd5: window.md5(t), updateUrl: e.MetaTags.getMetaTag(n, 'updateURL') || e.MetaTags.getMetaTag(n, 'homepageURL') || void 0, url: e.MetaTags.getMetaTag(n, 'homepageURL'), version: e.MetaTags.getMetaTag(n, 'version'), author: e.MetaTags.getMetaTag(n, 'author') };
        }t.extractStylesheetData = n, t.getInstalledStatus = o, t.getUserstyleMeta = c, t.installStylesheet = function (t) {
          return A(this, void 0, void 0, function () {
            var s = this,
                a,
                r;return U(this, function (l) {
              switch (l.label) {case 0:
                  return a = c(t.code), [4, o(t.downloadURL)];case 1:
                  return 0 < l.sent().length ? [2] : [4, e.modules.Util.getMultipleItemIds(a.sections.length)];case 2:
                  return r = l.sent(), [4, e.modules.Util.promiseChain(a.sections.map(function (o, l) {
                    return function () {
                      return A(s, void 0, void 0, function () {
                        var s, i, d;return U(this, function (c) {
                          switch (c.label) {case 0:
                              return s = n(o), i = e.modules.constants.templates.getDefaultStylesheetNode({ isLocal: !1, name: t.name || a.name, nodeInfo: { version: '1.0.0', source: { updateURL: a.updateUrl, url: a.url, author: a.author || t.author, sectionIndex: l, downloadURL: t.downloadURL, autoUpdate: !0 }, permissions: [], installDate: new Date().toLocaleDateString() }, triggers: s.triggers, value: { launchMode: s.launchMode, stylesheet: s.code }, id: r[l] }), d = new e.modules.CRMAPICall.Instance(null, null), [4, d.moveNode(i, {})];case 1:
                              return c.sent(), [2];}
                        });
                      });
                    };
                  }))];case 3:
                  return l.sent(), [2];}
            });
          });
        };
      })(s = t.Installing || (t.Installing = {}));
    })(t = e.Stylesheet || (e.Stylesheet = {}));
  }(R || (R = {})), function (e) {
    var t;(function (t) {
      t.createToggleHandler = function (s) {
        var n = this;return function (a, o) {
          return A(n, void 0, void 0, function () {
            var n, r, l;return U(this, function (i) {
              switch (i.label) {case 0:
                  return (r = s.id + '' + o.id, !a.wasChecked) ? [3, 1] : (n = ['var nodes = Array.prototype.slice.apply(document.querySelectorAll(".styleNodes' + r + '")).forEach(function(node){', 'node.remove();', '});'].join(''), [3, 3]);case 1:
                  return [4, t.Options.getConvertedStylesheet(s)];case 2:
                  l = i.sent().replace(/[ |\n]/g, ''), n = ['var CRMSSInsert=document.createElement("style");', 'CRMSSInsert.className="styleNodes' + r + '";', 'CRMSSInsert.type="text/css";', 'CRMSSInsert.appendChild(document.createTextNode(' + JSON.stringify(l) + '));', 'document.head.appendChild(CRMSSInsert);'].join(''), i.label = 3;case 3:
                  return e.modules.crmValues.nodeTabStatuses.get(s.id).tabs.has(o.id) || e.modules.crmValues.nodeTabStatuses.get(s.id).tabs.set(o.id, {}), e.modules.crmValues.nodeTabStatuses.get(s.id).tabs.get(o.id).checked = a.checked, browserAPI.tabs.executeScript(o.id, { code: n, allFrames: !0 }), [2];}
            });
          });
        };
      }, t.createClickHandler = function (e) {
        var s = this;return function (n, a) {
          return A(s, void 0, void 0, function () {
            var s, n, o;return U(this, function (r) {
              switch (r.label) {case 0:
                  return s = e.id + '' + a.id, [4, t.Options.getConvertedStylesheet(e)];case 1:
                  return n = r.sent().replace(/[ |\n]/g, ''), o = ['(function() {', 'if (document.querySelector(".styleNodes' + s + '")) {', 'return false;', '}', 'var CRMSSInsert=document.createElement("style");', 'CRMSSInsert.classList.add("styleNodes' + s + '");', 'CRMSSInsert.type="text/css";', 'CRMSSInsert.appendChild(document.createTextNode(' + JSON.stringify(n) + '));', 'document.head.appendChild(CRMSSInsert);', '}());'].join(''), browserAPI.tabs.executeScript(a.id, { code: o, allFrames: !0 }), [2, e.value.stylesheet];}
            });
          });
        };
      };
    })(t = e.Stylesheet || (e.Stylesheet = {}));
  }(R || (R = {})), function (t) {
    var e;(function (e) {
      function s(e) {
        var s = [],
            n = t.modules.crm.crmById.get(e.id);if (t.modules.crmValues.contextMenuIds.get(e.id) && 'stylesheet' === n.type && 'stylesheet' === e.type && n.value.stylesheet !== e.value.stylesheet) {
          var a = t.modules.crmValues.nodeTabStatuses;t.modules.Util.iterateMap(a.get(e.id).tabs, function (e) {
            s.push({ id: e });
          });
        }return s;
      }function n(e) {
        var t = e.triggers,
            s = e.id;return { triggers: t, id: s };
      }function a(e, s) {
        'stylesheet' === e.type && e.value.toggle && e.value.defaultOn && (1 === s || 0 === s ? t.modules.toExecuteNodes.always.documentEnd.push(n(e)) : (2 === s || 3 === s) && t.modules.toExecuteNodes.onUrl.documentEnd.push(n(e)));
      }function o(e, s, n) {
        if (e.showOnSpecified && ('link' === e.type || 'divider' === e.type || 'menu' === e.type) || 3 === s) {
          n.documentUrlPatterns = [], t.modules.crmValues.hideNodesOnPagesData.set(e.id, []);for (var a = 0, o; a < e.triggers.length; a++) {
            o = t.modules.URLParsing.prepareTrigger(e.triggers[a].url), o && (e.triggers[a].not ? t.modules.crmValues.hideNodesOnPagesData.get(e.id).push({ not: !1, url: o }) : n.documentUrlPatterns.push(o));
          }
        }
      }function r(e, s) {
        switch (e.type) {case 'divider':
            s.type = 'separator';break;case 'link':
            s.onclick = t.Link.createHandler(e);break;case 'script':
            s.onclick = t.Script.Handler.createHandler(e);break;case 'stylesheet':
            e.value.toggle ? (s.type = 'checkbox', s.onclick = t.Stylesheet.createToggleHandler(e), s.checked = e.value.defaultOn) : s.onclick = t.Stylesheet.createClickHandler(e), t.modules.crmValues.nodeTabStatuses.set(e.id, { defaultCheckedValue: e.value.defaultOn, tabs: new window.Map() });}
      }function l(s, n, e) {
        return A(this, void 0, void 0, function () {
          var a = this,
              o;return U(this, function (r) {
            switch (r.label) {case 0:
                return s.documentUrlPatterns ? (window.logAsync(window.__('background_crm_contextmenuErrorRetry'), n), delete s.documentUrlPatterns, o = e, [4, browserAPI.contextMenus.create(s, function () {
                  return A(a, void 0, void 0, function () {
                    var s;return U(this, function (a) {
                      switch (a.label) {case 0:
                          return s = e, [4, browserAPI.contextMenus.create({ title: 'ERROR', onclick: t.createOptionsPageHandler() })];case 1:
                          return s.id = a.sent(), window.logAsync(window.__('background_crm_contextmenuError'), n), [2];}
                    });
                  });
                })]) : [3, 2];case 1:
                return o.id = r.sent(), [3, 3];case 2:
                window.logAsync(window.__('background_crm_contextmenuError'), n), r.label = 3;case 3:
                return [2];}
          });
        });
      }function i(e, t) {
        return A(this, void 0, void 0, function () {
          var s = this,
              n,
              a;return U(this, function (o) {
            switch (o.label) {case 0:
                return o.trys.push([0, 2,, 4]), n = t, [4, browserAPI.contextMenus.create(e, function () {
                  return A(s, void 0, void 0, function () {
                    var s;return U(this, function (n) {
                      switch (n.label) {case 0:
                          return window.chrome && window.chrome.runtime ? (s = window.chrome, s && s.runtime && s.runtime.lastError ? [4, l(e, s.runtime.lastError, t)] : [3, 2]) : [3, 3];case 1:
                          n.sent(), n.label = 2;case 2:
                          return [3, 5];case 3:
                          return browserAPI.runtime.lastError ? [4, l(e, browserAPI.runtime.lastError, t)] : [3, 5];case 4:
                          n.sent(), n.label = 5;case 5:
                          return [2];}
                    });
                  });
                })];case 1:
                return n.id = o.sent(), [3, 4];case 2:
                return a = o.sent(), [4, l(e, a, t)];case 3:
                return o.sent(), [3, 4];case 4:
                return [2];}
          });
        });
      }function d(e) {
        return t.modules.crmValues.contextMenuGlobalOverrides.get(e.id);
      }function c(e, s, n, l) {
        return A(this, void 0, void 0, function () {
          return U(this, function (c) {
            switch (c.label) {case 0:
                return a(e, s), o(e, s, n), r(e, n), t.modules.Util.applyContextmenuOverride(n, d(e)), [4, i(n, l)];case 1:
                return c.sent(), t.modules.crmValues.contextMenuInfoById.set(l.id, { settings: n, path: e.path, enabled: !1 }), [2];}
          });
        });
      }function u(e, s, a) {
        var o = n(e);s ? a ? t.modules.toExecuteNodes.always.documentStart.push(o) : t.modules.toExecuteNodes.always.documentEnd.push(o) : a ? t.modules.toExecuteNodes.onUrl.documentStart.push(o) : t.modules.toExecuteNodes.onUrl.documentEnd.push(o);
      }function p(e) {
        return A(this, void 0, void 0, function () {
          var s, n, a, o;return U(this, function (r) {
            switch (r.label) {case 0:
                return 'script' === e.type ? (a = (n = t.MetaTags).getMetaTags, [4, t.modules.Util.getScriptNodeScript(e)]) : [3, 2];case 1:
                return s = a.apply(n, [r.sent()]), o = s['run-at'] || s.run_at, Array.isArray(o) || (o = [o]), [2, 'document_start' === o[0]];case 2:
                return [2, !1];}
          });
        });
      }function g(e, t, s) {
        return A(this, void 0, void 0, function () {
          var n, a, o, r;return U(this, function (l) {
            switch (l.label) {case 0:
                return (n = ('script' === e.type || 'stylesheet' === e.type) && e.value.launchMode || 0, 1 !== n && 2 !== n) ? [3, 3] : (a = u, o = [e, 1 === n], r = 'stylesheet' === e.type, r ? [3, 2] : [4, p(e)]);case 1:
                r = l.sent(), l.label = 2;case 2:
                return a.apply(void 0, o.concat([r])), [3, 5];case 3:
                return 4 === n ? [3, 5] : [4, c(e, n, t, s)];case 4:
                l.sent(), l.label = 5;case 5:
                return [2];}
          });
        });
      }e.createNode = function (e, n) {
        return A(this, void 0, void 0, function () {
          var a, o, r, l, d, i, c, u, p;return U(this, function (m) {
            switch (m.label) {case 0:
                return a = s(e), o = { title: e.name, contexts: t.getContexts(e.onContentTypes), parentId: n }, r = { id: null }, [4, g(e, o, r)];case 1:
                if (m.sent(), l = r.id, 0 !== a.length) for (e = e, d = 0; d < a.length; d++) {
                  i = e.id + '' + a[d].id, c = 'var nodes = document.querySelectorAll(".styleNodes' + i + '");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}', u = e.value.stylesheet.replace(/[ |\n]/g, ''), c += 'var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes' + i + '";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode(' + JSON.stringify(u) + '));document.head.appendChild(CRMSSInsert);', browserAPI.tabs.executeScript(a[d].id, { code: c, allFrames: !0 }), p = t.modules.crmValues.nodeTabStatuses, p.get(e.id).tabs.get(a[d].id).checked = !0;
                }return [2, l];}
          });
        });
      };
    })(e = t.NodeCreation || (t.NodeCreation = {}));
  }(R || (R = {})), function (e) {
    var t;(function (t) {
      function s(t) {
        return A(this, void 0, void 0, function () {
          var s, n;return U(this, function (a) {
            switch (a.label) {case 0:
                return t.value.ts && t.value.ts.enabled ? (s = t.value.ts, [4, o(t.value.script, t.value.ts.script)]) : [3, 3];case 1:
                return s.script = a.sent(), n = t.value.ts, [4, o(e.modules.Util.getScriptNodeJS(t, 'background'), t.value.ts.backgroundScript)];case 2:
                n.backgroundScript = a.sent(), a.label = 3;case 3:
                return [2];}
          });
        });
      }function n(e) {
        return A(this, void 0, void 0, function () {
          var t;return U(this, function (s) {
            switch (s.label) {case 0:
                return e.ts && e.ts.enabled ? (t = e.ts, [4, o(e.code, e.ts.code)]) : [3, 2];case 1:
                t.code = s.sent(), s.label = 2;case 2:
                return [2, e];}
          });
        });
      }function a(e) {
        return A(this, void 0, void 0, function () {
          var t, n, o;return U(this, function (r) {
            switch (r.label) {case 0:
                t = e.length, n = 0, r.label = 1;case 1:
                return n < t ? (o = e[n], o ? 'script' === o.type ? [4, s(o)] : [3, 3] : [3, 5]) : [3, 6];case 2:
                return r.sent(), [3, 5];case 3:
                return 'menu' === o.type ? [4, a(o.children)] : [3, 5];case 4:
                r.sent(), r.label = 5;case 5:
                return n++, [3, 1];case 6:
                return [2];}
          });
        });
      }function o(e, t) {
        return A(this, void 0, void 0, function () {
          var s, n, a;return U(this, function (o) {
            switch (o.label) {case 0:
                return (s = t.sourceHash, n = window.md5(e), n === s) ? [3, 2] : (a = {}, [4, l(e)]);case 1:
                return [2, (a.compiled = o.sent(), a.sourceHash = n, a)];case 2:
                return [2, t];}
          });
        });
      }function r() {
        return window.module = { exports: {} }, Promise.resolve(function () {
          var e = window.module && window.module.exports;window.ts = window.ts || e, window.module = void 0;
        });
      }function l(t) {
        return A(this, void 0, void 0, function () {
          var s = this;return U(this, function () {
            return [2, new window.Promise(function (n) {
              return A(s, void 0, void 0, function () {
                var s = this;return U(this, function (a) {
                  switch (a.label) {case 0:
                      return [4, window.withAsync(r, function () {
                        return A(s, void 0, void 0, function () {
                          return U(this, function (t) {
                            switch (t.label) {case 0:
                                return [4, e.modules.Util.execFile('js/libraries/typescript.js', 'ts')];case 1:
                                return t.sent(), [2];}
                          });
                        });
                      })];case 1:
                      return a.sent(), n(window.ts.transpile(t, { module: window.ts.ModuleKind.None, target: 0, noLib: !0, noResolve: !0, suppressOutputPathCheck: !0 })), [2];}
                });
              });
            })];
          });
        });
      }t.compileAllInTree = function () {
        return A(this, void 0, void 0, function () {
          return U(this, function (t) {
            switch (t.label) {case 0:
                return [4, a(e.modules.crm.crmTree)];case 1:
                return t.sent(), [2];}
          });
        });
      }, t.compileNode = s, t.compileLibrary = n, t.compileAllLibraries = function (e) {
        return A(this, void 0, void 0, function () {
          var t, s, a;return U(this, function (o) {
            switch (o.label) {case 0:
                t = 0, s = e, o.label = 1;case 1:
                return t < s.length ? (a = s[t], [4, n(a)]) : [3, 4];case 2:
                o.sent(), o.label = 3;case 3:
                return t++, [3, 1];case 4:
                return [2, e];}
          });
        });
      };
    })(t = e.TS || (e.TS = {}));
  }(R || (R = {})), function (e) {
    function t() {
      return A(this, void 0, void 0, function () {
        var t = this,
            s;return U(this, function (n) {
          switch (n.label) {case 0:
              return s = JSON.stringify(e.modules.storages.settingsStorage.crm), [4, e.modules.Util.crmForEachAsync(e.modules.storages.settingsStorage.crm, function (s) {
                return A(t, void 0, void 0, function () {
                  var t;return U(this, function (n) {
                    switch (n.label) {case 0:
                        return s.id || 0 === s.id ? [3, 2] : (t = s, [4, e.modules.Util.generateItemId()]);case 1:
                        t.id = n.sent(), n.label = 2;case 2:
                        return [2];}
                  });
                });
              })];case 1:
              return n.sent(), [2, s !== JSON.stringify(e.modules.storages.settingsStorage.crm)];}
        });
      });
    }function s(e) {
      var t = !1;if ('menu' !== e.type) return !1;e.children || (e.children = [], t = !0);for (var n = e.children.length - 1; 0 <= n; n--) {
        e.children[n] || (e.children.splice(n, 1), t = !0);
      }for (var a = 0, o = e.children, r; a < o.length; a++) {
        r = o[a], t = s(r) || t;
      }return t;
    }function n(e) {
      for (var t = !1, n = 0; n < e.length; n++) {
        t = s(e[n]) || t;
      }return t;
    }function a() {
      return A(this, void 0, void 0, function () {
        var s;return U(this, function (a) {
          switch (a.label) {case 0:
              return [4, t()];case 1:
              return s = a.sent(), s = n(e.modules.storages.settingsStorage.crm) || s, e.modules.crm.crmTree = e.modules.storages.settingsStorage.crm, e.modules.crm.safeTree = x(e.modules.storages.settingsStorage.crm), g(e.modules.crm.crmTree), f(), s ? [4, e.modules.Storages.uploadChanges('settings', [{ key: 'crm', newValue: JSON.parse(JSON.stringify(e.modules.crm.crmTree)), oldValue: {} }])] : [3, 3];case 2:
              a.sent(), a.label = 3;case 3:
              return [2];}
        });
      });
    }function o(e) {
      var t = {};if (e.children) {
        var s = t;s.children = [];for (var n = 0; n < e.children.length; n++) {
          s.children[n] = o(e.children[n]);
        }t = s;
      }var a = p(e, t);return a(['id', 'path', 'type', 'name', 'value', 'linkVal', 'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo', 'triggers', 'onContentTypes', 'showOnSpecified']), t;
    }function r() {
      var e = window;if (e.chrome && e.chrome.runtime) {
        var t = e.chrome;t && t.runtime && t.runtime.lastError && window.logAsync(window.__('background_crm_userContextmenuError'), t.runtime.lastError);
      } else browserAPI.runtime.lastError && window.logAsync(window.__('background_crm_userContextmenuError'), browserAPI.runtime.lastError);
    }function l(t) {
      return A(this, void 0, void 0, function () {
        var s, n, a, o, i, d, c, u;return U(this, function (p) {
          switch (p.label) {case 0:
              s = e.modules.crmValues.userAddedContextMenusById, n = 0, a = t, p.label = 1;case 1:
              return n < a.length ? (o = a[n], i = o.children, d = o.createProperties, c = d.parentId, c && s.get(c) && (d.parentId = s.get(c).actualId), [4, browserAPI.contextMenus.create(d, r)]) : [3, 4];case 2:
              u = p.sent(), o.actualId = u, l(i), p.label = 3;case 3:
              return n++, [3, 1];case 4:
              return [2];}
        });
      });
    }function i() {
      return A(this, void 0, void 0, function () {
        return U(this, function () {
          return l(e.modules.crmValues.userAddedContextMenus), [2];
        });
      });
    }function d() {
      var t = this;return new Promise(function (s) {
        e.modules.crmValues.nodeTabStatuses = new window.Map(), browserAPI.contextMenus.removeAll().then(function () {
          return A(t, void 0, void 0, function () {
            var t = this,
                n,
                a,
                o;return U(this, function (r) {
              switch (r.label) {case 0:
                  return n = [], e.modules.Util.crmForEach(e.modules.crm.crmTree, function (e) {
                    n.push(e.onContentTypes || [!1, !1, !1, !1, !1, !1]);
                  }), [4, e.modules.Util.lock(0)];case 1:
                  return a = r.sent(), o = e.modules.crmValues, [4, browserAPI.contextMenus.create({ title: e.modules.storages.settingsStorage.rootName || 'Custom Menu', contexts: e.getJoinedContexts(n) })];case 2:
                  return o.rootId = r.sent(), a(), e.modules.toExecuteNodes = { onUrl: { documentStart: [], documentEnd: [] }, always: { documentStart: [], documentEnd: [] } }, e.modules.Util.promiseChain(e.modules.crm.crmTree.map(function (t, s) {
                    return function () {
                      return new Promise(function (n) {
                        h(t, e.modules.crmValues.rootId, [s], e.modules.crmValues.contextMenuItemTree).then(function (a) {
                          a && (e.modules.crmValues.contextMenuItemTree[s] = { index: s, node: t, id: a.id, enabled: !0, parentId: e.modules.crmValues.rootId, children: a.children, parentTree: e.modules.crmValues.contextMenuItemTree }), n(null);
                        });
                      });
                    };
                  })).then(function () {
                    i().then(function () {
                      return A(t, void 0, void 0, function () {
                        var t, n, a, o, r, l, i, d;return U(this, function (c) {
                          switch (c.label) {case 0:
                              return e.modules.storages.storageLocal.showOptions ? (t = e.modules.crmValues.contextMenuItemTree, n = t.length, a = t, o = n, r = { index: n }, [4, browserAPI.contextMenus.create({ type: 'separator', parentId: e.modules.crmValues.rootId })]) : [3, 3];case 1:
                              return a[o] = (r.id = c.sent(), r.enabled = !0, r.node = null, r.parentId = e.modules.crmValues.rootId, r.children = [], r.parentTree = t, r), l = t, i = n + 1, d = { index: n + 1 }, [4, browserAPI.contextMenus.create({ title: 'Options', onclick: m(), parentId: e.modules.crmValues.rootId })];case 2:
                              l[i] = (d.id = c.sent(), d.enabled = !0, d.node = null, d.parentId = e.modules.crmValues.rootId, d.children = [], d.parentTree = t, d), c.label = 3;case 3:
                              return s(null), [2];}
                        });
                      });
                    });
                  }), [2];}
            });
          });
        });
      });
    }function c(t) {
      return A(this, void 0, void 0, function () {
        var s, n, a;return U(this, function (o) {
          switch (o.label) {case 0:
              return s = t.type, 'divider' === s ? [3, 1] : 'link' === s ? [3, 2] : 'menu' === s ? [3, 3] : 'script' === s ? [3, 4] : 'stylesheet' === s ? [3, 6] : [3, 7];case 1:
              return [2, [t.name, 'Divider', ''].join('%123')];case 2:
              return [2, [t.name, 'Link', t.value.map(function (e) {
                return e.url;
              }).join(',')].join('%123')];case 3:
              return [2, [t.name, 'Menu', t.children.length].join('%123')];case 4:
              return n = [t.name, 'Script'], a = [t.value.launchMode], [4, e.modules.Util.getScriptNodeScript(t)];case 5:
              return [2, n.concat([a.concat([o.sent()]).join('%124')]).join('%123')];case 6:
              return [2, [t.name, 'Script', [t.value.launchMode, t.value.stylesheet].join('%124')].join('%123')];case 7:
              return [2];}
        });
      });
    }function u(e, t) {
      for (var s = 0, n; s < e.length; s++) {
        n = e[s], t.arr.push(n), 'menu' === n.type && n.children && u(n.children, t);
      }return t;
    }function p(e, t) {
      return function (s) {
        s.forEach(function (s) {
          s in e && ('object' === babelHelpers['typeof'](e[s]) ? t[s] = JSON.parse(JSON.stringify(e[s])) : t[s] = e[s]);
        });
      };
    }function g(e, t) {
      void 0 === t && (t = []);for (var s = 0; s < e.length; s++) {
        var n = t.concat([s]),
            a = e[s];a.path = n, a.children && g(a.children, n);
      }
    }function m() {
      return function () {
        browserAPI.runtime.openOptionsPage();
      };
    }function h(t, s, n, a) {
      return A(this, void 0, void 0, function () {
        var o, r, l, d, i, c;return U(this, function (u) {
          switch (u.label) {case 0:
              return [4, e.NodeCreation.createNode(t, s)];case 1:
              if (o = u.sent(), e.modules.crmValues.contextMenuIds.set(t.id, o), null === o) return [3, 6];if (r = [], !t.children) return [3, 5];l = 0, d = 0, u.label = 2;case 2:
              return d < t.children.length ? (i = JSON.parse(JSON.stringify(n)), i.push(l), [4, h(t.children[d], o, i, r)]) : [3, 5];case 3:
              c = u.sent(), c && (l++, c.index = d, c.parentId = o, c.node = t.children[d], c.parentTree = a, r.push(c)), u.label = 4;case 4:
              return d++, [3, 2];case 5:
              return e.modules.crmValues.contextMenuInfoById.get(o).path = n, [2, { id: o, path: n, enabled: !0, children: r }];case 6:
              return [2, null];}
        });
      });
    }function y(t, s) {
      if (void 0 === s && (s = !1), s ? e.modules.crm.crmByIdSafe.set(t.id, o(t)) : e.modules.crm.crmById.set(t.id, t), t.children && 0 < t.children.length) for (var n = 0; n < t.children.length; n++) {
        y(t.children[n], s);
      }
    }function f() {
      e.modules.crm.crmById = new window.Map(), e.modules.crm.crmByIdSafe = new window.Map();for (var t = 0; t < e.modules.crm.crmTree.length; t++) {
        y(e.modules.crm.crmTree[t]), y(e.modules.crm.safeTree[t], !0);
      }
    }function b(e) {
      if (e.children) {
        for (var t = [], s = 0; s < e.children.length; s++) {
          t.push(b(e.children[s]));
        }e.children = t;
      }return o(e);
    }function x(e) {
      for (var t = JSON.parse(JSON.stringify(e)), s = [], n = 0; n < t.length; n++) {
        s.push(b(t[n]));
      }return s;
    }e.initModule = function (t) {
      e.modules = t;
    }, e.updateCrm = function (t) {
      return A(this, void 0, void 0, function () {
        var s;return U(this, function (n) {
          switch (n.label) {case 0:
              return [4, e.modules.Storages.uploadChanges('settings', [{ key: 'crm', newValue: JSON.parse(JSON.stringify(e.modules.crm.crmTree)), oldValue: {} }])];case 1:
              return n.sent(), e.TS.compileAllInTree(), [4, a()];case 2:
              return n.sent(), [4, d()];case 3:
              return n.sent(), [4, e.modules.MessageHandling.signalNewCRM()];case 4:
              return n.sent(), s = t, s ? [4, e.modules.Storages.checkBackgroundPagesForChange({ toUpdate: t })] : [3, 6];case 5:
              s = n.sent(), n.label = 6;case 6:
              return [2];}
        });
      });
    }, e.updateCRMValues = a, e.makeSafe = o, e.handleUserAddedContextMenuErrors = r, e.addUserAddedContextMenuItems = i, e.buildPageCRM = d, e.getContexts = function (t) {
      for (var s = ['browser_action'], n = e.modules.constants.contexts, a = 0; 6 > a; a++) {
        t[a] && s.push(n[a]);
      }return t[0] && s.push('editable'), s;
    }, e.getJoinedContexts = function (t) {
      for (var s = { browser_action: !0 }, n = e.modules.constants.contexts, a = 0, o = t, r; a < o.length; a++) {
        r = o[a];for (var l = 0; 6 > l; l++) {
          r[l] && (s[n[l]] = !0);
        }r[0] && (s.editable = !0);
      }return Object.getOwnPropertyNames(s);
    }, e.converToLegacy = function () {
      return A(this, void 0, void 0, function () {
        var t, s, n, a, o;return U(this, function (r) {
          switch (r.label) {case 0:
              t = u(e.modules.crm.crmTree, { arr: [] }).arr, s = {}, n = 0, r.label = 1;case 1:
              return n < t.length ? (a = s, o = n, [4, c(t[n])]) : [3, 4];case 2:
              a[o] = r.sent(), r.label = 3;case 3:
              return n++, [3, 1];case 4:
              return s.customcolors = '0', s.firsttime = 'no', s.noBeatAnnouncement = 'true', s.numberofrows = t.length + '', s.optionson = e.modules.storages.storageLocal.showOptions.toString(), s.scriptoptions = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0', s.waitforsearch = 'false', s.whatpage = 'false', s.indexIds = JSON.stringify(t.map(function (e) {
                return e.id;
              })), [2, s];}
        });
      });
    }, e.fixOptionsErrors = function (e) {
      if ('string' === typeof e) return e;for (var t in e) {
        var s = e[t];if ('choice' === s.type) {
          var n = s;('number' !== typeof n.selected || n.selected > n.values.length || 0 > n.selected) && (n.selected = 0);
        }e[t] = s;
      }return e;
    }, e.buildNodePaths = g, e.createOptionsPageHandler = m;
  }(R || (R = {}));var D;(function (e) {
    function t(e, t) {
      for (var s in e) {
        if (e[s] !== t[s]) return !1;
      }return !0;
    }function s(e) {
      switch ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) {case 'boolean':case 'number':case 'string':case 'function':case 'symbol':case 'undefined':
          return { encoding: 1, val: e };case 'object':
          return { encoding: 0, val: JSON.stringify(e) };}
    }function n(e) {
      return 0 === e.encoding ? JSON.parse(e.val) : e.val;
    }function a(e, s) {
      if (!r.has(e)) return { found: !1, result: null };for (var a = r.get(e), o = 0, l = a; o < l.length; o++) {
        var i = l[o],
            d = i.args,
            c = i.result;if (d.length === s.length && t(d, s)) return { found: !0, result: n(c) };
      }return { found: !1, result: null };
    }function o(e, t, n) {
      var a = e.apply(void 0, t.concat([!1])),
          o = { args: t, result: n ? s(a) : { encoding: 2, val: a } };if (r.has(e)) {
        var l = r.get(e);l.push(o);
      } else r.set(e, [o]);return a;
    }e.initModule = function (t) {
      e.modules = t;
    };var r = new window.WeakMap();e.cacheCall = function (e, t, s) {
      void 0 === s && (s = !0);var n = e.length - 1,
          r = Array.prototype.slice.apply(t),
          l = r.slice(0, n),
          i = a(e, l),
          d = i.found,
          c = i.result;return d ? c : o(e, l, s);
    };
  })(D || (D = {}));var j = function j(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      O = function O(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      V;(function (e) {
    e.init = function () {
      var e = this;'undefined' === typeof location || 'undefined' === typeof location.host ? (window.log = function () {}, window.logAsync = function () {}, window.info = function () {}, window.infoAsync = function () {}, window.testLog = console.log.bind(console), window.Promise = Promise) : (window.log = console.log.bind(console), window.logAsync = function () {
        for (var t = [], s = 0; s < arguments.length; s++) {
          t[s] = arguments[s];
        }return j(e, void 0, void 0, function () {
          var e, s, n;return O(this, function (a) {
            switch (a.label) {case 0:
                return s = (e = console.log).apply, n = [console], [4, Promise.all(t)];case 1:
                return s.apply(e, n.concat([a.sent()])), [2];}
          });
        });
      }, window.location && window.location.hash && window.location.hash.indexOf('noBackgroundInfo') ? (window.info = function () {}, window.infoAsync = function () {}) : (window.info = console.log.bind(console), window.infoAsync = function () {
        for (var t = [], s = 0; s < arguments.length; s++) {
          t[s] = arguments[s];
        }return j(e, void 0, void 0, function () {
          var e, s, n;return O(this, function (a) {
            switch (a.label) {case 0:
                return s = (e = console.log).apply, n = [console], [4, Promise.all(t)];case 1:
                return s.apply(e, n.concat([a.sent()])), [2];}
          });
        });
      }));
    };
  })(V || (V = {}));var F = function F(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      B = function B(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      H;(function (t) {
    function s(e, t) {
      for (var a in e) {
        if (e.hasOwnProperty(a) && e[a] !== void 0) if ('object' === babelHelpers['typeof'](e[a])) {
          if ('object' !== babelHelpers['typeof'](t[a])) return !1;if (Array.isArray(e[a])) {
            if (!Array.isArray(t[a])) return !1;if (!n(e[a], t[a])) return !1;
          } else if (!s(e[a], t[a])) return !1;
        } else if (e[a] !== t[a]) return !1;
      }return !0;
    }function n(e, t) {
      if (!e && !t) return !1;if (!e || !t) return !0;var a = e.length;if (a !== t.length) return !1;for (var o = 0; o < a; o++) {
        if ('object' === babelHelpers['typeof'](e[o])) {
          if ('object' !== babelHelpers['typeof'](t[o])) return !1;if (Array.isArray(e[o])) {
            if (!Array.isArray(t[o])) return !1;if (!n(e[o], t[o])) return !1;
          } else if (!s(e[o], t[o])) return !1;
        } else if (e[o] !== t[o]) return !1;
      }return !0;
    }function a() {
      for (var t = [], s = 0; 25 > s; s++) {
        t[s] = e(100 * Math.random());
      }return h[t.join(',')] ? a() : (h[t.join(',')] = !0, t);
    }function o(e, t) {
      if (e.push(t), 'menu' === t.type && t.children) for (var s = 0, n = t.children, a; s < n.length; s++) {
        a = n[s], o(e, a);
      }
    }function r(e, t) {
      var s = !1;e.forEach(function (e, n) {
        s || t(n, e) && (s = !0);
      });
    }function l(e) {
      var t = [];return e.forEach(function (e, s) {
        t.push([s, e]);
      }), t;
    }function i(e, t, s) {
      return !e.has(t) && (e.set(t, s), !0);
    }function d(e, t) {
      return void 0 === t && (t = 'script'), 'background' === t ? e.value.backgroundScript : e.value.script;
    }function c(e) {
      var t = this;return new Promise(function (s) {
        return e[0] ? void e[0]().then(function (n) {
          return F(t, void 0, void 0, function () {
            return B(this, function (t) {
              switch (t.label) {case 0:
                  return e[1] ? [4, c(e.slice(1))] : [3, 2];case 1:
                  n = t.sent(), t.label = 2;case 2:
                  return s(n), [2];}
            });
          });
        }) : s(null);
      });
    }function u(e, t) {
      for (var s = 0, n = e, a; s < n.length; s++) {
        a = n[s], t(a) && u(a.children, t);
      }
    }function p(e) {
      return e && 'object' === ('undefined' === typeof e ? 'undefined' : babelHelpers['typeof'](e)) && 'function' === typeof e.then;
    }function g(e, t) {
      for (var s = 0, n = e, a; s < n.length; s++) {
        a = n[s], t(a), 'menu' === a.type && a.children && g(a.children, t);
      }
    }function m() {
      return 'chrome' === BrowserAPI.getBrowser() ? parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10) : 1e3;
    }t.initModule = function (e) {
      t.modules = e;
    }, t.jsonFn = { stringify: function stringify(e) {
        return JSON.stringify(e, function (e, t) {
          return t instanceof Function || 'function' === typeof t ? t.toString() : t instanceof RegExp ? '_PxEgEr_' + t : t;
        });
      }, parse: function parse(e, t) {
        var s = !!t && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;return JSON.parse(e, function (e, t) {
          if ('string' !== typeof t) return t;if (8 > t.length) return t;var n = t.substring(0, 8);return s && t.match(s) ? new Date(t) : 'function' === n ? new Function(t) : '_PxEgEr_' === n ? new RegExp(t.slice(8)) : t;
        });
      } }, t.compareArray = n, t.safe = function (e) {
      return t.modules.crm.crmByIdSafe.get(e.id);
    };var h = {};t.createSecretKey = a;var y = e(100 * Math.random());t.createUniqueNumber = function () {
      var t = e(100 * Math.random());return y += t, y;
    }, t.generateItemId = function () {
      return F(this, void 0, void 0, function () {
        return B(this, function (e) {
          switch (e.label) {case 0:
              return t.modules.globalObject.globals.latestId = t.modules.globalObject.globals.latestId || 0, t.modules.globalObject.globals.latestId++, t.modules.storages.settingsStorage ? [4, t.modules.Storages.applyChanges({ type: 'optionsPage', settingsChanges: [{ key: 'latestId', oldValue: t.modules.globalObject.globals.latestId - 1, newValue: t.modules.globalObject.globals.latestId }] })] : [3, 2];case 1:
              e.sent(), e.label = 2;case 2:
              return [2, t.modules.globalObject.globals.latestId];}
        });
      });
    }, t.getMultipleItemIds = function (e) {
      return F(this, void 0, void 0, function () {
        var s, n;return B(this, function (a) {
          switch (a.label) {case 0:
              for (t.modules.globalObject.globals.latestId = t.modules.globalObject.globals.latestId || 0, s = [], n = 0; n < e; n++) {
                t.modules.globalObject.globals.latestId++, s.push(t.modules.globalObject.globals.latestId);
              }return t.modules.storages.settingsStorage ? [4, t.modules.Storages.applyChanges({ type: 'optionsPage', settingsChanges: [{ key: 'latestId', oldValue: t.modules.globalObject.globals.latestId - e, newValue: t.modules.globalObject.globals.latestId }] })] : [3, 2];case 1:
              a.sent(), a.label = 2;case 2:
              return [2, s];}
        });
      });
    }, t.convertFileToDataURI = function (e, t, s) {
      var n = new window.XMLHttpRequest();n.responseType = 'blob', n.onload = function () {
        var e = [null, null],
            s = new FileReader();s.onloadend = function () {
          e[0] = s.result, e[1] && t(e[0], e[1]);
        }, s.readAsDataURL(n.response);var a = new FileReader();a.onloadend = function () {
          e[1] = a.result, e[0] && t(e[0], e[1]);
        }, a.readAsText(n.response);
      }, s && (n.onerror = s), n.open('GET', e), n.send();
    }, t.isNewer = function (e, t) {
      for (var s = e.split('.'), n = t.split('.'), a = Math.max(s.length, n.length), o = 0; o < a; o++) {
        var r = ~~s[o],
            l = ~~n[o];if (r > l) return !0;if (r < l) return !1;
      }return !1;
    }, t.pushIntoArray = function (e, t, s) {
      if (t === s.length) s[t] = e;else for (var n = s.length + 1, a = s[t], o = e, r = t; r < n; r++) {
        s[r] = o, o = a, a = s[r + 1];
      }return s;
    }, t.flattenCrm = o, t.iterateMap = r, t.mapToArr = l, t.asyncIterateMap = function (e, t) {
      return F(this, void 0, void 0, function () {
        var s, n, a, o, r;return B(this, function (i) {
          switch (i.label) {case 0:
              s = 0, n = l(e), i.label = 1;case 1:
              return s < n.length ? (a = n[s], o = a[0], r = a[1], [4, t(o, r)]) : [3, 4];case 2:
              if (i.sent()) return [2];i.label = 3;case 3:
              return s++, [3, 1];case 4:
              return [2];}
        });
      });
    }, t.setMapDefault = i, t.accessPath = function (e, t, s, n, a, o) {
      var r = e[t];if (r) {
        if (!s) return r;var l = r[s];if (l) {
          if (!n) return l;var i = l[n];if (i) {
            if (!a) return i;var d = i[a];if (d) {
              if (!o) return d;var c = d[o];return c ? c : void 0;
            }
          }
        }
      }
    }, t.toMap = function (e) {
      return new window.Map(Object.getOwnPropertyNames(e).map(function (t) {
        return [t, e[t]];
      }));
    }, t.fromMap = function (e) {
      var t = {};return e.forEach(function (e, s) {
        t[s] = e;
      }), t;
    }, t.toArray = function (e) {
      return Object.getOwnPropertyNames(e).map(function (t) {
        return [t, e[t]];
      });
    }, t.removeTab = function (e) {
      var s = t.modules.crmValues.nodeTabStatuses;r(s, function (t, s) {
        var n = s.tabs;n.has(e) && n['delete'](e);
      }), t.modules.crmValues.tabData['delete'](e);
    }, t.leftPad = function (e, t) {
      for (var s = '', n = 0; n < t; n++) {
        s += e;
      }return s;
    }, t.getLastItem = function (e) {
      return e[e.length - 1];
    }, t.endsWith = function (e, t) {
      return 0 === e.split('').reverse().join('').indexOf(t.split('').reverse().join(''));
    }, t.isTamperMonkeyEnabled = function () {
      return F(this, void 0, void 0, function () {
        return B(this, function () {
          return [2, new Promise(function (e) {
            window.chrome && window.chrome.management ? window.chrome.management.getAll(function (s) {
              var n = s.filter(function (e) {
                return -1 < t.modules.constants.tamperMonkeyExtensions.indexOf(e.id) && e.enabled;
              });e(0 < n.length);
            }) : e(!1);
          })];
        });
      });
    }, t.isStylishInstalled = function () {
      return F(this, void 0, void 0, function () {
        return B(this, function () {
          return [2, new Promise(function (e) {
            window.chrome && window.chrome.management ? window.chrome.management.getAll(function (s) {
              var n = s.filter(function (e) {
                return -1 < t.modules.constants.stylishExtensions.indexOf(e.id) && e.enabled;
              });e(0 < n.length);
            }) : e(!1);
          })];
        });
      });
    };var f = [];t.execFile = function (e, t) {
      return F(this, void 0, void 0, function () {
        var s;return B(this, function (n) {
          switch (n.label) {case 0:
              return -1 < f.indexOf(e) ? [2] : (s = document.createElement('script'), s.src = browserAPI.runtime.getURL(e), document.body.appendChild(s), f.push(e), t ? [4, window.onExists(t, window)] : [3, 2]);case 1:
              n.sent(), n.label = 2;case 2:
              return [2];}
        });
      });
    }, t.getScriptNodeJS = d, t.getScriptNodeScript = function (e, s) {
      return void 0 === s && (s = 'script'), F(this, void 0, void 0, function () {
        return B(this, function (n) {
          switch (n.label) {case 0:
              return e.value.ts && e.value.ts.enabled ? [4, t.modules.CRMNodes.TS.compileNode(e)] : [3, 2];case 1:
              return n.sent(), [2, 'background' === s ? e.value.ts.backgroundScript.compiled : e.value.ts.script.compiled];case 2:
              return [2, d(e, s)];}
        });
      });
    }, t.getLibraryCode = function (e) {
      return F(this, void 0, void 0, function () {
        var s;return B(this, function (n) {
          switch (n.label) {case 0:
              return e.ts && e.ts.enabled ? e.ts.code ? [2, e.ts.code.compiled] : [4, t.modules.CRMNodes.TS.compileLibrary(e)] : [3, 3];case 1:
              return [4, n.sent()];case 2:
              return s = n.sent().ts, [2, s.code.compiled];case 3:
              return [2, e.code];}
        });
      });
    };var b;t.canRunOnUrl = function (e) {
      return !e || t.modules.CRMNodes.Running.urlIsGlobalExcluded(e) || -1 !== e.indexOf('chrome://') || -1 !== e.indexOf('chrome-extension://') || -1 !== e.indexOf('about://') || -1 !== e.indexOf('chrome-devtools://') || -1 !== e.indexOf('view-source:') || -1 < e.indexOf('://chrome.google') && -1 < e.indexOf('/webstore') ? !1 : !!b || -1 === e.indexOf('file://');
    }, t.xhr = function (e, t) {
      return void 0 === t && (t = []), F(this, void 0, void 0, function () {
        return B(this, function () {
          return [2, new Promise(function (s, n) {
            var a = new window.XMLHttpRequest();a.open('GET', e), a.onreadystatechange = function () {
              a.readyState === window.XMLHttpRequest.LOADING && 0 < t.length && window.infoAsync.apply(console, t), a.readyState === window.XMLHttpRequest.DONE && (200 <= a.status && 300 > a.status ? s(a.responseText) : n(new Error('Failed XHR')));
            }, a.send();
          })];
        });
      });
    }, t.wait = function (e) {
      return new Promise(function (t) {
        window.setTimeout(function () {
          t(null);
        }, e);
      });
    }, t.iipe = function (e) {
      return e();
    }, t.createArray = function (e) {
      for (var t = [], s = 0; s < e; s++) {
        t[s] = void 0;
      }return t;
    }, t.promiseChain = c, t.postMessage = function (e, t) {
      e.postMessage(t);
    }, t.climbTree = u, t.isThennable = p, t.filter = function (e, t) {
      return F(this, void 0, void 0, function () {
        var s, n;return B(this, function (a) {
          switch (a.label) {case 0:
              s = 0, a.label = 1;case 1:
              return s < e.length ? (n = t(e[s]), p(n) ? [4, n] : [3, 3]) : [3, 5];case 2:
              n = a.sent(), a.label = 3;case 3:
              n || e.splice(s, 1), a.label = 4;case 4:
              return s++, [3, 1];case 5:
              return [2];}
        });
      });
    }, t.crmForEach = g, t.crmForEachAsync = function (e, t) {
      return F(this, void 0, void 0, function () {
        var s, n, a;return B(this, function (o) {
          switch (o.label) {case 0:
              s = 0, n = e, o.label = 1;case 1:
              return s < n.length ? (a = n[s], [4, t(a)]) : [3, 5];case 2:
              return o.sent(), 'menu' === a.type && a.children ? [4, g(a.children, t)] : [3, 4];case 3:
              o.sent(), o.label = 4;case 4:
              return s++, [3, 1];case 5:
              return [2];}
        });
      });
    }, t.getChromeVersion = m, t.applyContextmenuOverride = function (e, t) {
      t = t || {}, e = e || {};var s = t.type,
          n = t.checked,
          a = t.contentTypes,
          o = t.isVisible,
          r = t.isDisabled,
          l = t.name;return s && (e.type = s), 'boolean' === typeof n && (e.checked = n), a && (e.contexts = a), 'boolean' === typeof o && 'chrome' === BrowserAPI.getBrowser() && 62 <= m() && (e.visible = o), 'boolean' === typeof r && (e.enabled = !r), l && (e.title = l), e;
    };var x = new window.Map();t.lock = function (e) {
      i(x, e, Promise.resolve(null));var t = x.get(e),
          s = new Promise(function (e) {
        a = function a() {
          e(null);
        };
      }),
          n = new Promise(function (e) {
        s.then(function () {
          e(null);
        });
      }),
          a;return x.set(e, n), new Promise(function (e) {
        t.then(function () {
          e(a);
        });
      });
    };
  })(H || (H = {}));var _q = function q() {
    return _q = Object.assign || function (e) {
      for (var t = 1, a = arguments.length, n; t < a; t++) {
        for (var s in n = arguments[t], n) {
          Object.prototype.hasOwnProperty.call(n, s) && (e[s] = n[s]);
        }
      }return e;
    }, _q.apply(this, arguments);
  },
      W = function W(e, t, s, n) {
    return new (s || (s = Promise))(function (a, o) {
      function r(e) {
        try {
          i(n.next(e));
        } catch (t) {
          o(t);
        }
      }function l(e) {
        try {
          i(n['throw'](e));
        } catch (t) {
          o(t);
        }
      }function i(e) {
        e.done ? a(e.value) : new s(function (t) {
          t(e.value);
        }).then(r, l);
      }i((n = n.apply(e, t || [])).next());
    });
  },
      G = function G(e, s) {
    function n(e) {
      return function (t) {
        return a([e, t]);
      };
    }function a(n) {
      if (r) throw new TypeError('Generator is already executing.');for (; o;) {
        try {
          if (r = 1, l && (i = 2 & n[0] ? l['return'] : n[0] ? l['throw'] || ((i = l['return']) && i.call(l), 0) : l.next) && !(i = i.call(l, n[1])).done) return i;switch ((l = 0, i) && (n = [2 & n[0], i.value]), n[0]) {case 0:case 1:
              i = n;break;case 4:
              return o.label++, { value: n[1], done: !1 };case 5:
              o.label++, l = n[1], n = [0];continue;case 7:
              n = o.ops.pop(), o.trys.pop();continue;default:
              if ((i = o.trys, !(i = 0 < i.length && i[i.length - 1])) && (6 === n[0] || 2 === n[0])) {
                o = 0;continue;
              }if (3 === n[0] && (!i || n[1] > i[0] && n[1] < i[3])) {
                o.label = n[1];break;
              }if (6 === n[0] && o.label < i[1]) {
                o.label = i[1], i = n;break;
              }if (i && o.label < i[2]) {
                o.label = i[2], o.ops.push(n);break;
              }i[2] && o.ops.pop(), o.trys.pop();continue;}n = s.call(e, o);
        } catch (t) {
          n = [6, t], l = 0;
        } finally {
          r = i = 0;
        }
      }if (5 & n[0]) throw n[1];return { value: n[0] ? n[1] : void 0, done: !0 };
    }var o = { label: 0, sent: function sent() {
        if (1 & i[0]) throw i[1];return i[1];
      }, trys: [], ops: [] },
        r,
        l,
        i,
        d;return d = { next: n(0), "throw": n(1), "return": n(2) }, 'function' === typeof Symbol && (d[Symbol.iterator] = function () {
      return this;
    }), d;
  },
      X;(function (e) {
    function t(e) {
      p = e;
    }function s() {
      return 'undefined' === typeof location || 'undefined' === typeof location.host;
    }function a() {
      return W(this, void 0, void 0, function () {
        var e, t, n, a, o, r, l, i, d, c;return G(this, function (u) {
          switch (u.label) {case 0:
              return [4, browserAPI.runtime.getManifest()];case 1:
              return e = -1 < u.sent().short_name.indexOf('dev'), t = s() || e ? window : {}, n = E.globals, t.globals = n, a = n.crm, o = n.storages, r = n.crmValues, l = n.constants, i = n.listeners, d = n.background, c = n.toExecuteNodes, [2, { crm: a, storages: o, crmValues: r, constants: l, listeners: i, background: d, toExecuteNodes: c, globalObject: t }];}
        });
      });
    }function o() {
      return { APIMessaging: m, BrowserHandler: g, Caches: D, CRMNodes: R, CRMAPICall: f, CRMAPIFunctions: c, GlobalDeclarations: n, Logging: w, MessageHandling: r, Resources: I, Sandbox: L, Storages: C, URLParsing: b, Util: H };
    }function l() {
      return W(this, void 0, void 0, function () {
        var e;return G(this, function (t) {
          switch (t.label) {case 0:
              return e = [{}], [4, a()];case 1:
              return [2, _q.apply(void 0, e.concat([t.sent(), o()]))];}
        });
      });
    }function i() {
      return W(this, void 0, void 0, function () {
        var e;return G(this, function (s) {
          switch (s.label) {case 0:
              return [4, l()];case 1:
              return e = s.sent(), m.initModule(e), g.initModule(e), D.initModule(e), R.initModule(e), f.initModule(e), c.initModule(null, e), E.initModule(e), n.initModule(e), w.initModule(e), r.initModule(e), I.initModule(e), C.initModule(e), b.initModule(e), H.initModule(e), t(e), [2];}
        });
      });
    }function d() {
      return W(this, void 0, void 0, function () {
        var e = this,
            t,
            a,
            o,
            l;return G(this, function (i) {
          switch (i.label) {case 0:
              return V.init(), a = (t = window.console).group, [4, window.__('background_init_initialization')];case 1:
              return a.apply(t, [i.sent()]), l = (o = window.console).group, [4, window.__('background_init_storage')];case 2:
              return l.apply(o, [i.sent()]), [4, H.iipe(function () {
                return W(e, void 0, void 0, function () {
                  var e = this,
                      t,
                      a,
                      o,
                      l,
                      d,
                      c,
                      u,
                      g,
                      m,
                      h,
                      y,
                      f,
                      b,
                      x,
                      v,
                      S,
                      _,
                      k,
                      M,
                      T,
                      w,
                      N,
                      L,
                      E,
                      P,
                      A,
                      U,
                      D,
                      j,
                      O,
                      V,
                      i,
                      F,
                      B,
                      V;return G(this, function (H) {
                    switch (H.label) {case 0:
                        return [4, C.loadStorages()];case 1:
                        H.sent(), window.console.groupEnd(), H.label = 2;case 2:
                        return H.trys.push([2, 24,, 25]), p.globalObject.globals.latestId = p.storages.settingsStorage.latestId, a = (t = window).info, [4, window.__('background_init_registeringPermissionListeners')];case 3:
                        return a.apply(t, [H.sent()]), [4, n.refreshPermissions()];case 4:
                        return H.sent(), l = (o = window).info, [4, window.__('background_init_registeringHandler')];case 5:
                        return l.apply(o, [H.sent()]), n.setHandlerFunction(), browserAPI.runtime.onConnect.addListener(function (e) {
                          e.onMessage.addListener(window.createHandlerFunction(e));
                        }), browserAPI.runtime.onMessage.addListener(r.handleRuntimeMessageInitial), c = (d = window).info, [4, window.__('background_init_buildingCrm')];case 6:
                        return c.apply(d, [H.sent()]), [4, R.buildPageCRM()];case 7:
                        return H.sent(), g = (u = window).info, [4, window.__('background_init_compilingTs')];case 8:
                        return g.apply(u, [H.sent()]), [4, R.TS.compileAllInTree()];case 9:
                        return H.sent(), h = (m = window.console).groupCollapsed, [4, window.__('background_init_previousOpenTabs')];case 10:
                        return h.apply(m, [H.sent()]), [4, n.restoreOpenTabs()];case 11:
                        return H.sent(), window.console.groupEnd(), f = (y = window.console).groupCollapsed, [4, window.__('background_init_backgroundpages')];case 12:
                        return f.apply(y, [H.sent()]), [4, R.Script.Background.createBackgroundPages()];case 13:
                        return H.sent(), window.console.groupEnd(), x = (b = window).info, [4, window.__('background_init_registeringHandlers')];case 14:
                        return x.apply(b, [H.sent()]), n.init(), S = (v = window.console).group, [4, window.__('background_init_resources')];case 15:
                        return S.apply(v, [H.sent()]), k = (_ = window).info, [4, window.__('background_init_updatingResources')];case 16:
                        return k.apply(_, [H.sent()]), I.updateResourceValues(), T = (M = window).info, [4, window.__('background_init_updatingNodes')];case 17:
                        return T.apply(M, [H.sent()]), function () {
                          return W(e, void 0, void 0, function () {
                            return G(this, function (e) {
                              switch (e.label) {case 0:
                                  return [4, R.Script.Updating.updateScripts()];case 1:
                                  return e.sent(), [4, R.Stylesheet.Updating.updateStylesheets()];case 2:
                                  return e.sent(), [2];}
                            });
                          });
                        }(), window.setInterval(function () {
                          (function () {
                            return W(e, void 0, void 0, function () {
                              var e, t;return G(this, function (s) {
                                switch (s.label) {case 0:
                                    return t = (e = window).info, [4, window.__('background_init_updatingNodes')];case 1:
                                    return t.apply(e, [s.sent()]), [4, R.Script.Updating.updateScripts()];case 2:
                                    return s.sent(), [4, R.Stylesheet.Updating.updateStylesheets()];case 3:
                                    return s.sent(), [2];}
                              });
                            });
                          })();
                        }, 21600000), window.console.groupEnd(), N = (w = window.console).groupCollapsed, [4, window.__('background_init_debugging')];case 18:
                        return N.apply(w, [H.sent()]), E = (L = window).info, [4, window.__('background_init_debugInfo')];case 19:
                        return E.apply(L, [H.sent()]), A = (P = window).info, [4, window.__('background_init_invalidatedTabs')];case 20:
                        return A.apply(P, [H.sent(), p.storages.failedLookups]), D = (U = window).info, [4, window.__('background_init_insufficientPermissions')];case 21:
                        return D.apply(U, [H.sent(), p.storages.insufficientPermissions]), window.console.groupEnd(), O = (j = window).info, [4, window.__('background_init_registeringConsoleInterface')];case 22:
                        for (O.apply(j, [H.sent()]), n.initGlobalFunctions(), -1 < location.href.indexOf('test') && (p.globalObject.Storages = C), s() && (p.globalObject.TransferFromOld = C.SetupHandling.TransferFromOld), V = 0; 5 > V; V++) {
                          window.console.groupEnd();
                        }return F = (i = window).info, [4, window.__('background_init_done')];case 23:
                        return F.apply(i, [H.sent()]), s() || (window.log(''), window.logAsync(window.__('background_init_loggingExplanation', browserAPI.runtime.getURL('html/logging.html'))), window.logAsync(window.__('background_init_debugExplanation'))), [3, 25];case 24:
                        for (B = H.sent(), V = 0; 10 > V; V++) {
                          window.console.groupEnd();
                        }throw window.log(B), window.console.trace(), B;case 25:
                        return [2];}
                  });
                });
              })];case 3:
              return i.sent(), [2];}
        });
      });
    }function u() {
      window.logging = p.globalObject.globals.logging, window.backgroundPageLog = p.Logging.backgroundPageLog;
    }var p;e.init = function () {
      return W(this, void 0, void 0, function () {
        return G(this, function (e) {
          switch (e.label) {case 0:
              return [4, i()];case 1:
              return e.sent(), [4, p.globalObject.backgroundPageLoaded = d()];case 2:
              return e.sent(), u(), [2];}
        });
      });
    };
  })(X || (X = {})), function () {
    X.init();
  }();
}();