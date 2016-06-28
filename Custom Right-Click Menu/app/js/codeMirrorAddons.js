// CodeMirror, copyright (c) by Marijn Haverbeke and others 
// Distributed under an MIT license: http://codemirror.net/LICENSE
(function(exports, module, global) {
	!function(e) {
		typeof exports == "object" && typeof module == "object" ? e(require("../../lib/codemirror")) : typeof define == "function" && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? (window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e]) : window.codeMirrorToLoad = { toLoad: [e] };
	}(function(e) {
		"use strict";
		function t(e, t, r) {
			var n = e.docs[t];
			n ? r(R(e, n)) : e.options.getFile ? e.options.getFile(t, r) : r(null )
		}
		function r(e, t, r) {
			var n, o, i;
			for (n in e.docs)
				if (o = e.docs[n],
				o.doc == t)
					return o;
			if (!r)
				for (i = 0; ; ++i)
					if (n = "[doc" + (i || "") + "]",
					!e.docs[n]) {
						r = n;
						break
					}
			return e.addDoc(r, t)
		}
		function n(t, n) {
			return "string" == typeof n ? t.docs[n] : (n instanceof e && (n = n.getDoc()),
			n instanceof e.Doc ? r(t, n) : void 0)
		}
		function o(e, t, n) {
			var o, s, a = r(e, t), l = e.cachedArgHints;
			l && l.doc == t && N(l.start, n.to) <= 0 && (e.cachedArgHints = null ),
			o = a.changed,
			null  == o && (a.changed = o = {
				from: n.from.line,
				to: n.from.line
			}),
			s = n.from.line + (n.text.length - 1),
			n.from.line < o.to && (o.to = o.to - (n.to.line - s)),
			s >= o.to && (o.to = s + 1),
			o.from > n.from.line && (o.from = n.from.line),
			t.lineCount() > L && n.to - o.from > 100 && setTimeout(function() {
				a.changed && a.changed.to - a.changed.from > 100 && i(e, a)
			}, 200)
		}
		function i(e, t) {
			e.server.request({
				files: [{
					type: "full",
					name: t.name,
					text: R(e, t)
				}]
			}, function(e) {
				e ? window.console.error(e) : t.changed = null 
			})
		}
		function s(t, r, n) {
			t.request(r, {
				type: "completions",
				types: !0,
				docs: !0,
				urls: !0
			}, function(o, i) {
				var s, l, c, p, h;
				if (o)
					return k(t, r, o);
				var d = []
				, u = ""
				, f = i.start
				, m = i.end;
				for ('["' == r.getRange(C(f.line, f.ch - 2), f) && '"]' != r.getRange(m, C(m.line, m.ch + 2)) && (u = '"]'),
				s = 0; s < i.completions.length; ++s)
					l = i.completions[s],
					c = a(l.type),
					i.guess && (c += " " + _ + "guess"),
					d.push({
						text: l.name + u,
						displayText: l.displayName || l.name,
						className: c,
						data: l
					});
				p = {
					from: f,
					to: m,
					list: d
				},
				h = null ,
				e.on(p, "close", function() {
					E(h)
				}),
				e.on(p, "update", function() {
					E(h)
				}),
				e.on(p, "select", function(e, r) {
					E(h);
					var n = t.options.completionTip ? t.options.completionTip(e.data) : e.data.doc;
					n && (h = j(r.parentNode.getBoundingClientRect().right + window.pageXOffset, r.getBoundingClientRect().top + window.pageYOffset, n),
					h.className += " " + _ + "hint-doc")
				}),
				n(p)
			})
		}
		function a(e) {
			var t;
			return t = "?" == e ? "unknown" : "number" == e || "string" == e || "bool" == e ? e : /^fn\(/.test(e) ? "fn" : /^\[/.test(e) ? "array" : "object",
			_ + "completion " + _ + "completion-" + t
		}
		function l(e, t, r, n, o) {
			e.request(t, n, function(r, n) {
				var i, s;
				return r ? k(e, t, r) : (e.options.typeTip ? i = e.options.typeTip(n) : (i = x("span", null , x("strong", null , n.type || "not found")),
				n.doc && i.appendChild(document.createTextNode(" — " + n.doc)),
				n.url && (i.appendChild(document.createTextNode(" ")),
				s = i.appendChild(x("a", null , "[docs]")),
				s.href = n.url,
				s.target = "_blank")),
				O(t, i, e),
				void (o && o()))
			}, r)
		}
		function c(t, r) {
			var n, o, i, s, a, l, c, d, u, f, m, g;
			if (A(t),
			!r.somethingSelected() && (n = r.getTokenAt(r.getCursor()).state,
			o = e.innerMode(r.getMode(), n),
			"javascript" == o.mode.name) && (i = o.state.lexical,
			"call" == i.info)) {
				a = i.pos || 0,
				l = r.getOption("tabSize");
				for (var y = r.getCursor().line, b = Math.max(0, y - 9), v = !1; y >= b; --y) {
					for (c = r.getLine(y),
					d = 0,
					u = 0; f = c.indexOf("	", u),
					-1 != f; )
						d += l - (f + d) % l - 1,
						u = f + 1;
					if (s = i.column - d,
					"(" == c.charAt(s)) {
						v = !0;
						break
					}
				}
				if (v) {
					if (m = C(y, s),
					g = t.cachedArgHints,
					g && g.doc == r.getDoc() && 0 == N(m, g.start))
						return p(t, r, a);
					t.request(r, {
						type: "type",
						preferFunction: !0,
						end: m
					}, function(e, n) {
						!e && n.type && /^fn\(/.test(n.type) && (t.cachedArgHints = {
							start: u,
							type: h(n.type),
							name: n.exprName || n.name || "fn",
							guess: n.guess,
							doc: r.getDoc()
						},
						p(t, r, a))
					})
				}
			}
		}
		function p(e, t, r) {
			var n, o, i;
			A(e);
			var s = e.cachedArgHints
			, a = s.type
			, l = x("span", s.guess ? _ + "fhint-guess" : null , x("span", _ + "fname", s.name), "(");
			for (n = 0; n < a.args.length; ++n)
				n && l.appendChild(document.createTextNode(", ")),
				o = a.args[n],
				l.appendChild(x("span", _ + "farg" + (n == r ? " " + _ + "farg-current" : ""), o.name || "?")),
				"?" != o.type && (l.appendChild(document.createTextNode(": ")),
				l.appendChild(x("span", _ + "type", o.type)));
			l.appendChild(document.createTextNode(a.rettype ? ") -> " : ")")),
			a.rettype && l.appendChild(x("span", _ + "type", a.rettype)),
			i = t.cursorCoords(null , "page"),
			e.activeArgHints = j(i.right + 1, i.bottom, l)
		}
		function h(e) {
			function t(t) {
				for (var r, n = 0, o = i; ; ) {
					if (r = e.charAt(i),
					t.test(r) && !n)
						return e.slice(o, i);
					/[{\[\(]/.test(r) ? ++n : /[}\]\)]/.test(r) && --n,
					++i
				}
			}
			var r, n, o = [], i = 3;
			if (")" != e.charAt(i))
				for (; r = e.slice(i).match(/^([^, \(\[\{]+): /),
				r && (i += r[0].length,
				r = r[1]),
				o.push({
					name: r,
					type: t(/[\),]/)
				}),
				")" != e.charAt(i); )
					i += 2;
			return n = e.slice(i).match(/^\) -> (.*)$/),
			{
				args: o,
				rettype: n && n[1]
			}
		}
		function d(e, t) {
			function n(n) {
				var o = {
					type: "definition",
					variable: n || null 
				}
				, i = r(e, t.getDoc());
				e.server.request(w(e, i, o), function(r, n) {
					if (r)
						return k(e, t, r);
					if (!n.file && n.url)
						return void window.open(n.url);
					if (n.file) {
						var o, s = e.docs[n.file];
						if (s && (o = m(s.doc, n)))
							return e.jumpStack.push({
								file: i.name,
								start: t.getCursor("from"),
								end: t.getCursor("to")
							}),
							void f(e, i, s, o.start, o.end)
					}
					k(e, t, "Could not find a definition.")
				})
			}
			g(t) ? n() : T(t, "Jump to variable", function(e) {
				e && n(e)
			})
		}
		function u(e, t) {
			var n = e.jumpStack.pop()
			, o = n && e.docs[n.file];
			o && f(e, r(e, t.getDoc()), o, n.start, n.end)
		}
		function f(e, t, r, n, o) {
			r.doc.setSelection(n, o),
			t != r && e.options.switchToDoc && (A(e),
			e.options.switchToDoc(r.name, r.doc))
		}
		function m(e, t) {
			for (var r, n, o, i, s, a, l = t.context.slice(0, t.contextOffset).split("\n"), c = t.start.line - (l.length - 1), p = C(c, (1 == l.length ? t.start.ch : e.getLine(c).length) - l[0].length), h = e.getLine(c).slice(p.ch), d = c + 1; d < e.lineCount() && h.length < t.context.length; ++d)
				h += "\n" + e.getLine(d);
			if (h.slice(0, t.context.length) == t.context)
				return t;
			for (r = e.getSearchCursor(t.context, 0, !1),
			o = 1 / 0; r.findNext(); )
				i = r.from(),
				s = 1e4 * Math.abs(i.line - p.line),
				s || (s = Math.abs(i.ch - p.ch)),
				o > s && (n = i,
				o = s);
			return n ? (1 == l.length ? n.ch += l[0].length : n = C(n.line + (l.length - 1), l[l.length - 1].length),
			a = t.start.line == t.end.line ? C(n.line, n.ch + (t.end.ch - t.start.ch)) : C(n.line + (t.end.line - t.start.line), t.end.ch),
			{
				start: n,
				end: a
			}) : null 
		}
		function g(e) {
			var t = e.getCursor("end")
			, r = e.getTokenAt(t);
			return r.start < t.ch && "comment" == r.type ? !1 : /[\w)\]]/.test(e.getLine(t.line).slice(Math.max(t.ch - 1, 0), t.ch + 1))
		}
		function y(e, t) {
			var r = t.getTokenAt(t.getCursor());
			return /\w/.test(r.string) ? void T(t, "New name for " + r.string, function(r) {
				e.request(t, {
					type: "rename",
					newName: r,
					fullDocs: !0
				}, function(r, n) {
					return r ? k(e, t, r) : void v(e, n.changes)
				})
			}) : k(e, t, "Not at a variable")
		}
		function b(e, t) {
			var n = r(e, t.doc).name;
			e.request(t, {
				type: "refs"
			}, function(r, o) {
				var i, s, a, l;
				if (r)
					return k(e, t, r);
				for (i = [],
				s = 0,
				a = 0; a < o.refs.length; a++)
					l = o.refs[a],
					l.file == n && (i.push({
						anchor: l.start,
						head: l.end
					}),
					N(s, l.start) >= 0 && N(s, l.end) <= 0 && (s = i.length - 1));
				t.setSelections(i, s)
			})
		}
		function v(e, t) {
			for (var r, n, o, i, s, a = Object.create(null ), l = 0; l < t.length; ++l)
				s = t[l],
				(a[s.file] || (a[s.file] = [])).push(s);
			for (r in a)
				if (n = e.docs[r],
				o = a[r],
				n)
					for (o.sort(function(e, t) {
						return N(t.start, e.start)
					}),
					i = "*rename" + ++z,
					l = 0; l < o.length; ++l)
						s = o[l],
						n.doc.replaceRange(s.text, s.start, s.end, i)
		}
		function w(e, t, r, n) {
			var o, i, s, a = [], l = 0, c = !r.fullDocs;
			c || delete r.fullDocs,
			"string" == typeof r && (r = {
				type: r
			}),
			r.lineCharPositions = !0,
			null  == r.end && (r.end = n || t.doc.getCursor("end"),
			t.doc.somethingSelected() && (r.start = t.doc.getCursor("start"))),
			o = r.start || r.end,
			t.changed ? t.doc.lineCount() > L && c !== !1 && t.changed.to - t.changed.from < 100 && t.changed.from <= o.line && t.changed.to > r.end.line ? (a.push(S(t, o, r.end)),
			r.file = "#0",
			l = a[0].offsetLines,
			null  != r.start && (r.start = C(r.start.line - l, r.start.ch)),
			r.end = C(r.end.line - l, r.end.ch)) : (a.push({
				type: "full",
				name: t.name,
				text: R(e, t)
			}),
			r.file = t.name,
			t.changed = null ) : r.file = t.name;
			for (i in e.docs)
				s = e.docs[i],
				s.changed && s != t && (a.push({
					type: "full",
					name: s.name,
					text: R(e, s)
				}),
				s.changed = null );
			return {
				query: r,
				files: a
			}
		}
		function S(t, r, n) {
			for (var o, i, s, a, l, c, p = t.doc, h = null , d = null , u = 4, f = r.line - 1, m = Math.max(0, f - 50); f >= m; --f)
				o = p.getLine(f),
				i = o.search(/\bfunction\b/),
				0 > i || (a = e.countColumn(o, null , u),
				null  != h && a >= h) || (h = a,
				d = f);
			if (null  == d && (d = m),
			s = Math.min(p.lastLine(), n.line + 20),
			null  == h || h == e.countColumn(p.getLine(r.line), null , u))
				c = s;
			else
				for (c = n.line + 1; s > c && (a = e.countColumn(p.getLine(c), null , u),
				!(h >= a)); ++c)
					;
			return l = C(d, 0),
			{
				type: "part",
				name: t.name,
				offsetLines: l.line,
				text: p.getRange(l, C(c, 0))
			}
		}
		function x(e, t) {
			var r, n, o = document.createElement(e);
			for (t && (o.className = t),
			r = 2; r < arguments.length; ++r)
				n = arguments[r],
				"string" == typeof n && (n = document.createTextNode(n)),
				o.appendChild(n);
			return o
		}
		function T(e, t, r) {
			e.openDialog ? e.openDialog(t + ": <input type=text>", r) : r(prompt(t, ""))
		}
		function O(t, r, n) {
			function o() {
				c = !0,
				l || i()
			}
			function i() {
				t.state.ternTooltip = null ,
				a.parentNode && (t.off("cursorActivity", i),
				t.off("blur", i),
				t.off("scroll", i),
				M(a))
			}
			var s, a, l, c;
			t.state.ternTooltip && E(t.state.ternTooltip),
			s = t.cursorCoords(),
			a = t.state.ternTooltip = j(s.right + 1, s.bottom, r),
			l = !1,
			c = !1,
			e.on(a, "mousemove", function() {
				l = !0
			}),
			e.on(a, "mouseout", function(t) {
				e.contains(a, t.relatedTarget || t.toElement) || (c ? i() : l = !1)
			}),
			setTimeout(o, n.options.hintDelay ? n.options.hintDelay : 1700),
			t.on("cursorActivity", i),
			t.on("blur", i),
			t.on("scroll", i)
		}
		function j(e, t, r) {
			var n = x("div", _ + "tooltip", r);
			return n.style.left = e + "px",
			n.style.top = t + "px",
			document.body.appendChild(n),
			n
		}
		function E(e) {
			var t = e && e.parentNode;
			t && t.removeChild(e)
		}
		function M(e) {
			e.style.opacity = "0",
			setTimeout(function() {
				E(e)
			}, 1100)
		}
		function k(e, t, r) {
			e.options.showError ? e.options.showError(t, r) : O(t, String(r), e)
		}
		function A(e) {
			e.activeArgHints && (E(e.activeArgHints),
			e.activeArgHints = null )
		}
		function R(e, t) {
			var r = t.doc.getValue();
			return e.options.fileFilter && (r = e.options.fileFilter(r, t.name, t.doc)),
			r
		}
		function D(e) {
			function r(e, t) {
				t && (e.id = ++n,
				o[n] = t),
				i.postMessage(e)
			}
			var n, o, i = e.worker = new Worker(e.options.workerScript);
			i.postMessage({
				type: "init",
				defs: e.options.defs,
				plugins: e.options.plugins,
				scripts: e.options.workerDeps
			}),
			n = 0,
			o = {},
			i.onmessage = function(n) {
				var i = n.data;
				"getFile" == i.type ? t(e, i.name, function(e, t) {
					r({
						type: "getFile",
						err: String(e),
						text: t,
						id: i.id
					})
				}) : "debug" == i.type ? window.console.log(i.message) : i.id && o[i.id] && (o[i.id](i.err, i.body),
				delete o[i.id])
			}
			,
			i.onerror = function(e) {
				for (var t in o)
					o[t](e);
				o = {}
			}
			,
			this.addFile = function(e, t) {
				r({
					type: "add",
					name: e,
					text: t
				})
			}
			,
			this.delFile = function(e) {
				r({
					type: "del",
					name: e
				})
			}
			,
			this.request = function(e, t) {
				r({
					type: "req",
					body: e
				}, t)
			}
		}
		var z, N;
		e.TernServer = function(e) {
			var r, n = this;
			this.options = e || {},
			r = this.options.plugins || (this.options.plugins = {}),
			r.doc_comment || (r.doc_comment = !0),
			this.docs = Object.create(null ),
			this.server = this.options.useWorker ? new D(this) : new window.tern.Server({
				getFile: function(e, r) {
					return t(n, e, r)
				},
				async: !0,
				defs: this.options.defs || [],
				plugins: r
			}),
			this.trackChange = function(e, t) {
				o(n, e, t)
			}
			,
			this.cachedArgHints = null ,
			this.activeArgHints = null ,
			this.jumpStack = [],
			this.getHint = function(e, t) {
				return s(n, e, t)
			}
			,
			this.getHint.async = !0
		}
		,
		e.TernServer.prototype = {
			addDoc: function(t, r) {
				var n = {
					doc: r,
					name: t,
					changed: null 
				};
				return this.server.addFile(t, R(this, n)),
				e.on(r, "change", this.trackChange),
				this.docs[t] = n
			},
			delDoc: function(t) {
				var r = n(this, t);
				r && (e.off(r.doc, "change", this.trackChange),
				delete this.docs[r.name],
				this.server.delFile(r.name))
			},
			hideDoc: function(e) {
				A(this);
				var t = n(this, e);
				t && t.changed && i(this, t)
			},
			complete: function(e) {
				e.showHint({
					hint: this.getHint
				})
			},
			showType: function(e, t, r) {
				l(this, e, t, "type", r)
			},
			showDocs: function(e, t, r) {
				l(this, e, t, "documentation", r)
			},
			updateArgHints: function(e) {
				c(this, e)
			},
			jumpToDef: function(e) {
				d(this, e)
			},
			jumpBack: function(e) {
				u(this, e)
			},
			rename: function(e) {
				y(this, e)
			},
			selectName: function(e) {
				b(this, e)
			},
			request: function(e, t, n, o) {
				var i, s = this, a = r(this, e.getDoc()), l = w(this, a, t, o), c = l.query && this.options.queryOptions && this.options.queryOptions[l.query.type];
				if (c)
					for (i in c)
						l.query[i] = c[i];
				this.server.request(l, function(e, r) {
					!e && s.options.responseFilter && (r = s.options.responseFilter(a, t, l, e, r)),
					n(e, r)
				})
			},
			destroy: function() {
				this.worker && (this.worker.terminate(),
				this.worker = null )
			}
		};
		var C = e.Pos
		, _ = "CodeMirror-Tern-"
		, L = 250;
		z = 0,
		N = e.cmpPos
	}),
	function(e) {
		"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] }
	}(function(e) {
		"use strict";
		function t(e, t) {
			this.cm = e,
			this.options = this.buildOptions(t),
			this.widget = null ,
			this.debounce = 0,
			this.tick = 0,
			this.startPos = this.cm.getCursor(),
			this.startLen = this.cm.getLine(this.startPos.line).length;
			var r = this;
			e.on("cursorActivity", this.activityFunc = function() {
				r.cursorActivity()
			}
			)
		}
		function r(e) {
			return "string" == typeof e ? e : e.text
		}
		function n(e, t) {
			function r(e, r) {
				var n;
				n = "string" != typeof r ? function(e) {
					return r(e, t)
				}
				: i.hasOwnProperty(r) ? i[r] : r,
				a[e] = n
			}
			var n, o, i = {
				Up: function() {
					t.moveFocus(-1)
				},
				Down: function() {
					t.moveFocus(1)
				},
				PageUp: function() {
					t.moveFocus(-t.menuSize() + 1, !0)
				},
				PageDown: function() {
					t.moveFocus(t.menuSize() - 1, !0)
				},
				Home: function() {
					t.setFocus(0)
				},
				End: function() {
					t.setFocus(t.length - 1)
				},
				Enter: t.pick,
				Tab: t.pick,
				Esc: t.close
			}, s = e.options.customKeys, a = s ? {} : i;
			if (s)
				for (o in s)
					s.hasOwnProperty(o) && r(o, s[o]);
			if (n = e.options.extraKeys)
				for (o in n)
					n.hasOwnProperty(o) && r(o, n[o]);
			return a
		}
		function o(e, t) {
			for (; t && t != e; ) {
				if ("LI" === t.nodeName.toUpperCase() && t.parentNode == e)
					return t;
				t = t.parentNode
			}
		}
		function i(t, i) {
			var s, a, l, h, d, u, f, m, g, y, b, v;
			this.completion = t,
			this.data = i,
			this.picked = !1;
			var w = this
			, S = t.cm
			, x = this.hints = document.createElement("ul");
			for (x.className = "CodeMirror-hints",
			this.selectedHint = i.selectedHint || 0,
			s = i.list,
			a = 0; a < s.length; ++a) {
				var T = x.appendChild(document.createElement("li"))
				, O = s[a]
				, j = c + (a != this.selectedHint ? "" : " " + p);
				null  != O.className && (j = O.className + " " + j),
				T.className = j,
				O.render ? O.render(T, i, O) : T.appendChild(document.createTextNode(O.displayText || r(O))),
				T.hintId = a
			}
			var E = S.cursorCoords(t.options.alignWithWord ? i.from : null )
			, M = E.left
			, k = E.bottom
			, A = !0;
			return x.style.left = M + "px",
			x.style.top = k + "px",
			l = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
			h = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
			(t.options.container || document.body).appendChild(x),
			d = x.getBoundingClientRect(),
			u = d.bottom - h,
			u > 0 && (f = d.bottom - d.top,
			m = E.top - (E.bottom - d.top),
			m - f > 0 ? (x.style.top = (k = E.top - f) + "px",
			A = !1) : f > h && (x.style.height = h - 5 + "px",
			x.style.top = (k = E.bottom - d.top) + "px",
			g = S.getCursor(),
			i.from.ch != g.ch && (E = S.cursorCoords(g),
			x.style.left = (M = E.left) + "px",
			d = x.getBoundingClientRect()))),
			y = d.right - l,
			y > 0 && (d.right - d.left > l && (x.style.width = l - 5 + "px",
			y -= d.right - d.left - l),
			x.style.left = (M = E.left - y) + "px"),
			S.addKeyMap(this.keyMap = n(t, {
				moveFocus: function(e, t) {
					w.changeActive(w.selectedHint + e, t)
				},
				setFocus: function(e) {
					w.changeActive(e)
				},
				menuSize: function() {
					return w.screenAmount()
				},
				length: s.length,
				close: function() {
					t.close()
				},
				pick: function() {
					w.pick()
				},
				data: i
			})),
			t.options.closeOnUnfocus && (S.on("blur", this.onBlur = function() {
				b = setTimeout(function() {
					t.close()
				}, 100)
			}
			),
			S.on("focus", this.onFocus = function() {
				clearTimeout(b)
			}
			)),
			v = S.getScrollInfo(),
			S.on("scroll", this.onScroll = function() {
				var e = S.getScrollInfo()
				, r = S.getWrapperElement().getBoundingClientRect()
				, n = k + v.top - e.top
				, o = n - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
				return A || (o += x.offsetHeight),
				o <= r.top || o >= r.bottom ? t.close() : (x.style.top = n + "px",
				void (x.style.left = M + v.left - e.left + "px"))
			}
			),
			e.on(x, "dblclick", function(e) {
				var t = o(x, e.target || e.srcElement);
				t && null  != t.hintId && (w.changeActive(t.hintId),
				w.pick())
			}),
			e.on(x, "click", function(e) {
				var r = o(x, e.target || e.srcElement);
				r && null  != r.hintId && (w.changeActive(r.hintId),
				t.options.completeOnSingleClick && w.pick())
			}),
			e.on(x, "mousedown", function() {
				setTimeout(function() {
					S.focus()
				}, 20)
			}),
			e.signal(i, "select", s[0], x.firstChild),
			!0
		}
		var s, a, l, c = "CodeMirror-hint", p = "CodeMirror-hint-active";
		e.showHint = function(e, t, r) {
			var n, o;
			if (console.log(arguments),
			!t)
				return e.showHint(r);
			if (r && r.async && (t.async = !0),
			n = {
				hint: t
			},
			r)
				for (o in r)
					n[o] = r[o];
			return e.showHint(n)
		}
		,
		e.defineExtension("showHint", function(r) {
			if (!(this.listSelections().length > 1 || this.somethingSelected())) {
				this.state.completionActive && this.state.completionActive.close();
				var n = this.state.completionActive = new t(this,r);
				n.options.hint && (e.signal(this, "startCompletion", this),
				n.update(!0))
			}
		}),
		s = window.requestAnimationFrame || function(e) {
			return setTimeout(e, 1e3 / 60)
		}
		,
		a = window.cancelAnimationFrame || clearTimeout,
		t.prototype = {
			close: function() {
				this.active() && (this.cm.state.completionActive = null ,
				this.tick = null ,
				this.cm.off("cursorActivity", this.activityFunc),
				this.widget && this.data && e.signal(this.data, "close"),
				this.widget && this.widget.close(),
				e.signal(this.cm, "endCompletion", this.cm))
			},
			active: function() {
				return this.cm.state.completionActive == this
			},
			pick: function(t, n) {
				var o = t.list[n];
				o.hint ? o.hint(this.cm, t, o) : this.cm.replaceRange(r(o), o.from || t.from, o.to || t.to, "complete"),
				e.signal(t, "pick", o),
				this.close()
			},
			cursorActivity: function() {
				var e, t, r;
				this.debounce && (a(this.debounce),
				this.debounce = 0),
				e = this.cm.getCursor(),
				t = this.cm.getLine(e.line),
				e.line != this.startPos.line || t.length - e.ch != this.startLen - this.startPos.ch || e.ch < this.startPos.ch || this.cm.somethingSelected() || e.ch && this.options.closeCharacters.test(t.charAt(e.ch - 1)) ? this.close() : (r = this,
				this.debounce = s(function() {
					r.update()
				}),
				this.widget && this.widget.disable())
			},
			update: function(e) {
				if (null  != this.tick)
					if (this.options.hint.async) {
						var t = ++this.tick
						, r = this;
						this.options.hint(this.cm, function(n) {
							r.tick == t && r.finishUpdate(n, e)
						}, this.options)
					} else
						this.finishUpdate(this.options.hint(this.cm, this.options), e)
			},
			finishUpdate: function(t, r) {
				this.data && e.signal(this.data, "update"),
				t && this.data && e.cmpPos(t.from, this.data.from) && (t = null ),
				this.data = t;
				var n = this.widget && this.widget.picked || r && this.options.completeSingle;
				this.widget && this.widget.close(),
				t && t.list.length && (n && 1 == t.list.length ? this.pick(t, 0) : (this.widget = new i(this,t),
				e.signal(t, "shown")))
			},
			buildOptions: function(e) {
				var t = this.cm.options.hintOptions
				, r = {};
				for (var n in l)
					r[n] = l[n];
				if (t)
					for (n in t)
						void 0 !== t[n] && (r[n] = t[n]);
				if (e)
					for (n in e)
						void 0 !== e[n] && (r[n] = e[n]);
				return r
			}
		},
		i.prototype = {
			close: function() {
				if (this.completion.widget == this) {
					this.completion.widget = null ,
					this.hints.parentNode.removeChild(this.hints),
					this.completion.cm.removeKeyMap(this.keyMap);
					var e = this.completion.cm;
					this.completion.options.closeOnUnfocus && (e.off("blur", this.onBlur),
					e.off("focus", this.onFocus)),
					e.off("scroll", this.onScroll)
				}
			},
			disable: function() {
				this.completion.cm.removeKeyMap(this.keyMap);
				var e = this;
				this.keyMap = {
					Enter: function() {
						e.picked = !0
					}
				},
				this.completion.cm.addKeyMap(this.keyMap)
			},
			pick: function() {
				this.completion.pick(this.data, this.selectedHint)
			},
			changeActive: function(t, r) {
				if (t >= this.data.list.length ? t = r ? this.data.list.length - 1 : 0 : 0 > t && (t = r ? 0 : this.data.list.length - 1),
				this.selectedHint != t) {
					var n = this.hints.childNodes[this.selectedHint];
					n.className = n.className.replace(" " + p, ""),
					n = this.hints.childNodes[this.selectedHint = t],
					n.className += " " + p,
					n.offsetTop < this.hints.scrollTop ? this.hints.scrollTop = n.offsetTop - 3 : n.offsetTop + n.offsetHeight > this.hints.scrollTop + this.hints.clientHeight && (this.hints.scrollTop = n.offsetTop + n.offsetHeight - this.hints.clientHeight + 3),
					e.signal(this.data, "select", this.data.list[this.selectedHint], n)
				}
			},
			screenAmount: function() {
				return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1
			}
		},
		e.registerHelper("hint", "auto", function(t, r) {
			var n, o, i, s = t.getHelpers(t.getCursor(), "hint");
			if (s.length) {
				for (o = 0; o < s.length; o++)
					if (i = s[o](t, r),
					i && i.list.length)
						return i
			} else if (n = t.getHelper(t.getCursor(), "hintWords")) {
				if (n)
					return e.hint.fromList(t, {
						words: n
					})
			} else if (e.hint.anyword)
				return e.hint.anyword(t, r)
		}),
		e.registerHelper("hint", "fromList", function(t, r) {
			var n, o, i, s, a, l = t.getCursor(), c = t.getTokenAt(l), p = e.Pos(l.line, c.end);
			for (c.string && /\w/.test(c.string[c.string.length - 1]) ? (n = c.string,
			o = e.Pos(l.line, c.start)) : (n = "",
			o = p),
			i = [],
			s = 0; s < r.words.length; s++)
				a = r.words[s],
				a.slice(0, n.length) == n && i.push(a);
			return i.length ? {
				list: i,
				from: o,
				to: p
			} : void 0
		}),
		e.commands.autocomplete = e.showHint,
		l = {
			hint: e.hint.auto,
			completeSingle: !0,
			alignWithWord: !0,
			closeCharacters: /[\s()\[\]{};:>,]/,
			closeOnUnfocus: !0,
			completeOnSingleClick: !1,
			container: null ,
			customKeys: null ,
			extraKeys: null 
		},
		e.defineOption("hintOptions", null )
	}),
	function(e) {
		if ("object" == typeof exports && "undefined" != typeof module)
			module.exports = e();
		else if ("function" == typeof define && define.amd)
			define([], e),'defined'
		else {
			var t;
			t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this,
			window.acorn = e()
		}
	}(function() {
		return function e(t, r, n) {
			function o(s, a) {
				var l, c, p;
				if (!r[s]) {
					if (!t[s]) {
						if (l = "function" == typeof require && require,
						!a && l)
							return l(s, !0);
						if (i)
							return i(s, !0);
						throw c = new Error("Cannot find module '" + s + "'"),
						c.code = "MODULE_NOT_FOUND",
						c
					}
					p = r[s] = {
						exports: {}
					},
					t[s][0].call(p.exports, function(e) {
						var r = t[s][1][e];
						return o(r ? r : e)
					}, p, p.exports, e, t, r, n)
				}
				return r[s].exports
			}
			for (var i = "function" == typeof require && require, s = 0; s < n.length; s++)
				o(n[s]);
			return o
		}({
			1: [function(e, t, r) {
				"use strict";
				function n(e, t) {
					var r = s(t, e)
					, n = r.pos
					, o = r.options.locations && r.curPosition();
					return r.nextToken(),
					r.parseTopLevel(r.options.program || r.startNodeAt(n, o))
				}
				function o(e, t, r) {
					var n = s(r, e, t);
					return n.nextToken(),
					n.parseExpression()
				}
				function i(e, t) {
					return s(t, e)
				}
				function s(e, t) {
					return new f(g(e),String(t))
				}
				var a, l, c, p, h, d;
				r.parse = n,
				r.parseExpressionAt = o,
				r.tokenizer = i,
				r.__esModule = !0;
				var u = e("./state")
				, f = u.Parser
				, m = e("./options")
				, g = m.getOptions;
				e("./parseutil"),
				e("./statement"),
				e("./lval"),
				e("./expression"),
				r.Parser = u.Parser,
				r.plugins = u.plugins,
				r.defaultOptions = m.defaultOptions,
				a = e("./location"),
				r.SourceLocation = a.SourceLocation,
				r.getLineInfo = a.getLineInfo,
				r.Node = e("./node").Node,
				l = e("./tokentype"),
				r.TokenType = l.TokenType,
				r.tokTypes = l.types,
				c = e("./tokencontext"),
				r.TokContext = c.TokContext,
				r.tokContexts = c.types,
				p = e("./identifier"),
				r.isIdentifierChar = p.isIdentifierChar,
				r.isIdentifierStart = p.isIdentifierStart,
				r.Token = e("./tokenize").Token,
				h = e("./whitespace"),
				r.isNewLine = h.isNewLine,
				r.lineBreak = h.lineBreak,
				r.lineBreakG = h.lineBreakG,
				d = "1.2.2",
				r.version = d
			}
			, {
				"./expression": 6,
				"./identifier": 7,
				"./location": 8,
				"./lval": 9,
				"./node": 10,
				"./options": 11,
				"./parseutil": 12,
				"./state": 13,
				"./statement": 14,
				"./tokencontext": 15,
				"./tokenize": 16,
				"./tokentype": 17,
				"./whitespace": 19
			}],
			2: [function(e, t) {
				t.exports = "function" == typeof Object.create ? function(e, t) {
					e.super_ = t,
					e.prototype = Object.create(t.prototype, {
						constructor: {
							value: e,
							enumerable: !1,
							writable: !0,
							configurable: !0
						}
					})
				}
				: function(e, t) {
					e.super_ = t;
					var r = function() {}
					;
					r.prototype = t.prototype,
					e.prototype = new r,
					e.prototype.constructor = e
				}
			}
			, {}],
			3: [function(e, t) {
				function r() {
					var e, t, r;
					if (!s) {
						for (s = !0,
						t = i.length; t; ) {
							for (e = i,
							i = [],
							r = -1; ++r < t; )
								e[r]();
							t = i.length
						}
						s = !1
					}
				}
				function n() {}
				var o = t.exports = {}
				, i = []
				, s = !1;
				o.nextTick = function(e) {
					i.push(e),
					s || setTimeout(r, 0)
				}
				,
				o.title = "browser",
				o.browser = !0,
				o.env = {},
				o.argv = [],
				o.version = "",
				o.versions = {},
				o.on = n,
				o.addListener = n,
				o.once = n,
				o.off = n,
				o.removeListener = n,
				o.removeAllListeners = n,
				o.emit = n,
				o.binding = function() {
					throw new Error("process.binding is not supported")
				}
				,
				o.cwd = function() {
					return "/"
				}
				,
				o.chdir = function() {
					throw new Error("process.chdir is not supported")
				}
				,
				o.umask = function() {
					return 0
				}
			}
			, {}],
			4: [function(e, t) {
				t.exports = function(e) {
					return e && "object" == typeof e && "function" == typeof e.copy && "function" == typeof e.fill && "function" == typeof e.readUInt8
				}
			}
			, {}],
			5: [function(e, t, r) {
				(function(t, n) {
					function o(e, t) {
						var n = {
							seen: [],
							stylize: s
						};
						return arguments.length >= 3 && (n.depth = arguments[2]),
						arguments.length >= 4 && (n.colors = arguments[3]),
						m(t) ? n.showHidden = t : t && r._extend(n, t),
						S(n.showHidden) && (n.showHidden = !1),
						S(n.depth) && (n.depth = 2),
						S(n.colors) && (n.colors = !1),
						S(n.customInspect) && (n.customInspect = !0),
						n.colors && (n.stylize = i),
						l(n, e, n.depth)
					}
					function i(e, t) {
						var r = o.styles[t];
						return r ? "[" + o.colors[r][0] + "m" + e + "[" + o.colors[r][1] + "m" : e
					}
					function s(e) {
						return e
					}
					function a(e) {
						var t = {};
						return e.forEach(function(e) {
							t[e] = !0
						}),
						t
					}
					function l(e, t, n) {
						var o, i, s, m, g, y, b;
						if (e.customInspect && t && E(t.inspect) && t.inspect !== r.inspect && (!t.constructor || t.constructor.prototype !== t))
							return o = t.inspect(n, e),
							v(o) || (o = l(e, o, n)),
							o;
						if (i = c(e, t))
							return i;
						if (s = Object.keys(t),
						m = a(s),
						e.showHidden && (s = Object.getOwnPropertyNames(t)),
						j(t) && (s.indexOf("message") >= 0 || s.indexOf("description") >= 0))
							return p(t);
						if (0 === s.length) {
							if (E(t))
								return g = t.name ? ": " + t.name : "",
								e.stylize("[Function" + g + "]", "special");
							if (x(t))
								return e.stylize(RegExp.prototype.toString.call(t), "regexp");
							if (O(t))
								return e.stylize(Date.prototype.toString.call(t), "date");
							if (j(t))
								return p(t)
						}
						var w = ""
						, S = !1
						, T = ["{", "}"];
						return f(t) && (S = !0,
						T = ["[", "]"]),
						E(t) && (y = t.name ? ": " + t.name : "",
						w = " [Function" + y + "]"),
						x(t) && (w = " " + RegExp.prototype.toString.call(t)),
						O(t) && (w = " " + Date.prototype.toUTCString.call(t)),
						j(t) && (w = " " + p(t)),
						0 !== s.length || S && 0 != t.length ? 0 > n ? x(t) ? e.stylize(RegExp.prototype.toString.call(t), "regexp") : e.stylize("[Object]", "special") : (e.seen.push(t),
						b = S ? h(e, t, n, m, s) : s.map(function(r) {
							return d(e, t, n, m, r, S)
						}),
						e.seen.pop(),
						u(b, w, T)) : T[0] + w + T[1]
					}
					function c(e, t) {
						if (S(t))
							return e.stylize("undefined", "undefined");
						if (v(t)) {
							var r = "'" + JSON.stringify(t).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
							return e.stylize(r, "string")
						}
						return b(t) ? e.stylize("" + t, "number") : m(t) ? e.stylize("" + t, "boolean") : g(t) ? e.stylize("null", "null") : void 0
					}
					function p(e) {
						return "[" + Error.prototype.toString.call(e) + "]"
					}
					function h(e, t, r, n, o) {
						for (var i = [], s = 0, a = t.length; a > s; ++s)
							i.push(D(t, String(s)) ? d(e, t, r, n, String(s), !0) : "");
						return o.forEach(function(o) {
							o.match(/^\d+$/) || i.push(d(e, t, r, n, o, !0))
						}),
						i
					}
					function d(e, t, r, n, o, i) {
						var s, a, c;
						if (c = Object.getOwnPropertyDescriptor(t, o) || {
							value: t[o]
						},
						c.get ? a = c.set ? e.stylize("[Getter/Setter]", "special") : e.stylize("[Getter]", "special") : c.set && (a = e.stylize("[Setter]", "special")),
						D(n, o) || (s = "[" + o + "]"),
						a || (e.seen.indexOf(c.value) < 0 ? (a = g(r) ? l(e, c.value, null ) : l(e, c.value, r - 1),
						a.indexOf("\n") > -1 && (a = i ? a.split("\n").map(function(e) {
							return "  " + e
						}).join("\n").substr(2) : "\n" + a.split("\n").map(function(e) {
							return "   " + e
						}).join("\n"))) : a = e.stylize("[Circular]", "special")),
						S(s)) {
							if (i && o.match(/^\d+$/))
								return a;
							s = JSON.stringify("" + o),
							s.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (s = s.substr(1, s.length - 2),
							s = e.stylize(s, "name")) : (s = s.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"),
							s = e.stylize(s, "string"))
						}
						return s + ": " + a
					}
					function u(e, t, r) {
						var n = 0
						, o = e.reduce(function(e, t) {
							return n++,
							t.indexOf("\n") >= 0 && n++,
							e + t.replace(/\u001b\[\d\d?m/g, "").length + 1
						}, 0);
						return o > 60 ? r[0] + ("" === t ? "" : t + "\n ") + " " + e.join(",\n  ") + " " + r[1] : r[0] + t + " " + e.join(", ") + " " + r[1]
					}
					function f(e) {
						return Array.isArray(e)
					}
					function m(e) {
						return "boolean" == typeof e
					}
					function g(e) {
						return null  === e
					}
					function y(e) {
						return null  == e
					}
					function b(e) {
						return "number" == typeof e
					}
					function v(e) {
						return "string" == typeof e
					}
					function w(e) {
						return "symbol" == typeof e
					}
					function S(e) {
						return void 0 === e
					}
					function x(e) {
						return T(e) && "[object RegExp]" === k(e)
					}
					function T(e) {
						return "object" == typeof e && null  !== e
					}
					function O(e) {
						return T(e) && "[object Date]" === k(e)
					}
					function j(e) {
						return T(e) && ("[object Error]" === k(e) || e instanceof Error)
					}
					function E(e) {
						return "function" == typeof e
					}
					function M(e) {
						return null  === e || "boolean" == typeof e || "number" == typeof e || "string" == typeof e || "symbol" == typeof e || "undefined" == typeof e
					}
					function k(e) {
						return Object.prototype.toString.call(e)
					}
					function A(e) {
						return 10 > e ? "0" + e.toString(10) : e.toString(10)
					}
					function R() {
						var e = new Date
						, t = [A(e.getHours()), A(e.getMinutes()), A(e.getSeconds())].join(":");
						return [e.getDate(), C[e.getMonth()], t].join(" ")
					}
					function D(e, t) {
						return Object.prototype.hasOwnProperty.call(e, t)
					}
					var z, N, C, _ = /%[sdj%]/g;
					r.format = function(e) {
						var t, r, n;
						if (!v(e)) {
							for (t = [],
							r = 0; r < arguments.length; r++)
								t.push(o(arguments[r]));
							return t.join(" ")
						}
						var r = 1
						, i = arguments
						, s = i.length
						, a = String(e).replace(_, function(e) {
							if ("%%" === e)
								return "%";
							if (r >= s)
								return e;
							switch (e) {
							case "%s":
								return String(i[r++]);
							case "%d":
								return Number(i[r++]);
							case "%j":
								try {
									return JSON.stringify(i[r++])
								} catch (t) {
									return "[Circular]"
								}
							default:
								return e
							}
						});
						for (n = i[r]; s > r; n = i[++r])
							a += g(n) || !T(n) ? " " + n : " " + o(n);
						return a
					}
					,
					r.deprecate = function(e, o) {
						function i() {
							if (!s) {
								if (t.throwDeprecation)
									throw new Error(o);
								t.traceDeprecation ? console.trace(o) : console.error(o),
								s = !0
							}
							return e.apply(this, arguments)
						}
						if (S(n.process))
							return function() {
								return r.deprecate(e, o).apply(this, arguments)
							}
							;
						if (t.noDeprecation === !0)
							return e;
						var s = !1;
						return i
					}
					,
					z = {},
					r.debuglog = function(e) {
						if (S(N) && (N = t.env.NODE_DEBUG || ""),
						e = e.toUpperCase(),
						!z[e])
							if (new RegExp("\\b" + e + "\\b","i").test(N)) {
								var n = t.pid;
								z[e] = function() {
									var t = r.format.apply(r, arguments);
									console.error("%s %d: %s", e, n, t)
								}
							} else
								z[e] = function() {}
								;
						return z[e]
					}
					,
					r.inspect = o,
					o.colors = {
						bold: [1, 22],
						italic: [3, 23],
						underline: [4, 24],
						inverse: [7, 27],
						white: [37, 39],
						grey: [90, 39],
						black: [30, 39],
						blue: [34, 39],
						cyan: [36, 39],
						green: [32, 39],
						magenta: [35, 39],
						red: [31, 39],
						yellow: [33, 39]
					},
					o.styles = {
						special: "cyan",
						number: "yellow",
						"boolean": "yellow",
						undefined: "grey",
						"null": "bold",
						string: "green",
						date: "magenta",
						regexp: "red"
					},
					r.isArray = f,
					r.isBoolean = m,
					r.isNull = g,
					r.isNullOrUndefined = y,
					r.isNumber = b,
					r.isString = v,
					r.isSymbol = w,
					r.isUndefined = S,
					r.isRegExp = x,
					r.isObject = T,
					r.isDate = O,
					r.isError = j,
					r.isFunction = E,
					r.isPrimitive = M,
					r.isBuffer = e("./support/isBuffer"),
					C = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
					r.log = function() {
						console.log("%s - %s", R(), r.format.apply(r, arguments))
					}
					,
					r.inherits = e("inherits"),
					r._extend = function(e, t) {
						if (!t || !T(t))
							return e;
						for (var r = Object.keys(t), n = r.length; n--; )
							e[r[n]] = t[r[n]];
						return e
					}
				}
				).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
			}
			, {
				"./support/isBuffer": 4,
				_process: 3,
				inherits: 2
			}],
			6: [function(e) {
				"use strict";
				var t, r = e("./tokentype").types, n = e("./state").Parser, o = e("./identifier").reservedWords, i = e("./util").has, s = n.prototype;
				s.checkPropClash = function(e, t) {
					var r, n, o, s, a;
					if (!(this.options.ecmaVersion >= 6)) {
						switch (r = e.key,
						n = void 0,
						r.type) {
						case "Identifier":
							n = r.name;
							break;
						case "Literal":
							n = String(r.value);
							break;
						default:
							return
						}
						o = e.kind || "init",
						s = void 0,
						i(t, n) ? (s = t[n],
						a = "init" !== o,
						(!(this.strict || a) || !s[o]) && a ^ s.init || this.raise(r.start, "Redefinition of property")) : s = t[n] = {
							init: !1,
							get: !1,
							set: !1
						},
						s[o] = !0
					}
				}
				,
				s.parseExpression = function(e, t) {
					var n, o = this.start, i = this.startLoc, s = this.parseMaybeAssign(e, t);
					if (this.type === r.comma) {
						for (n = this.startNodeAt(o, i),
						n.expressions = [s]; this.eat(r.comma); )
							n.expressions.push(this.parseMaybeAssign(e, t));
						return this.finishNode(n, "SequenceExpression")
					}
					return s
				}
				,
				s.parseMaybeAssign = function(e, t, n) {
					var o, i, s, a, l;
					return this.type == r._yield && this.inGenerator ? this.parseYield() : (o = void 0,
					t ? o = !1 : (t = {
						start: 0
					},
					o = !0),
					i = this.start,
					s = this.startLoc,
					(this.type == r.parenL || this.type == r.name) && (this.potentialArrowAt = this.start),
					a = this.parseMaybeConditional(e, t),
					n && (a = n.call(this, a, i, s)),
					this.type.isAssign ? (l = this.startNodeAt(i, s),
					l.operator = this.value,
					l.left = this.type === r.eq ? this.toAssignable(a) : a,
					t.start = 0,
					this.checkLVal(a),
					this.next(),
					l.right = this.parseMaybeAssign(e),
					this.finishNode(l, "AssignmentExpression")) : (o && t.start && this.unexpected(t.start),
					a))
				}
				,
				s.parseMaybeConditional = function(e, t) {
					var n, o = this.start, i = this.startLoc, s = this.parseExprOps(e, t);
					return t && t.start ? s : this.eat(r.question) ? (n = this.startNodeAt(o, i),
					n.test = s,
					n.consequent = this.parseMaybeAssign(),
					this.expect(r.colon),
					n.alternate = this.parseMaybeAssign(e),
					this.finishNode(n, "ConditionalExpression")) : s
				}
				,
				s.parseExprOps = function(e, t) {
					var r = this.start
					, n = this.startLoc
					, o = this.parseMaybeUnary(t);
					return t && t.start ? o : this.parseExprOp(o, r, n, -1, e)
				}
				,
				s.parseExprOp = function(e, t, n, o, i) {
					var s, a, l, c, p = this.type.binop;
					return Array.isArray(t) && this.options.locations && void 0 === i && (i = o,
					o = n,
					n = t[1],
					t = t[0]),
					null  != p && (!i || this.type !== r._in) && p > o ? (s = this.startNodeAt(t, n),
					s.left = e,
					s.operator = this.value,
					a = this.type,
					this.next(),
					l = this.start,
					c = this.startLoc,
					s.right = this.parseExprOp(this.parseMaybeUnary(), l, c, p, i),
					this.finishNode(s, a === r.logicalOR || a === r.logicalAND ? "LogicalExpression" : "BinaryExpression"),
					this.parseExprOp(s, t, n, o, i)) : e
				}
				,
				s.parseMaybeUnary = function(e) {
					var t, n;
					if (this.type.prefix)
						return n = this.startNode(),
						t = this.type === r.incDec,
						n.operator = this.value,
						n.prefix = !0,
						this.next(),
						n.argument = this.parseMaybeUnary(),
						e && e.start && this.unexpected(e.start),
						t ? this.checkLVal(n.argument) : this.strict && "delete" === n.operator && "Identifier" === n.argument.type && this.raise(n.start, "Deleting local variable in strict mode"),
						this.finishNode(n, t ? "UpdateExpression" : "UnaryExpression");
					var o = this.start
					, i = this.startLoc
					, s = this.parseExprSubscripts(e);
					if (e && e.start)
						return s;
					for (; this.type.postfix && !this.canInsertSemicolon(); )
						n = this.startNodeAt(o, i),
						n.operator = this.value,
						n.prefix = !1,
						n.argument = s,
						this.checkLVal(s),
						this.next(),
						s = this.finishNode(n, "UpdateExpression");
					return s
				}
				,
				s.parseExprSubscripts = function(e) {
					var t = this.start
					, r = this.startLoc
					, n = this.parseExprAtom(e);
					return e && e.start ? n : this.parseSubscripts(n, t, r)
				}
				,
				s.parseSubscripts = function(e, t, n, o) {
					var i;
					for (Array.isArray(t) && this.options.locations && void 0 === o && (o = n,
					n = t[1],
					t = t[0]); ; )
						if (this.eat(r.dot))
							i = this.startNodeAt(t, n),
							i.object = e,
							i.property = this.parseIdent(!0),
							i.computed = !1,
							e = this.finishNode(i, "MemberExpression");
						else if (this.eat(r.bracketL))
							i = this.startNodeAt(t, n),
							i.object = e,
							i.property = this.parseExpression(),
							i.computed = !0,
							this.expect(r.bracketR),
							e = this.finishNode(i, "MemberExpression");
						else if (!o && this.eat(r.parenL))
							i = this.startNodeAt(t, n),
							i.callee = e,
							i.arguments = this.parseExprList(r.parenR, !1),
							e = this.finishNode(i, "CallExpression");
						else {
							if (this.type !== r.backQuote)
								return e;
							i = this.startNodeAt(t, n),
							i.tag = e,
							i.quasi = this.parseTemplate(),
							e = this.finishNode(i, "TaggedTemplateExpression")
						}
				}
				,
				s.parseExprAtom = function(e) {
					var t, n, o = void 0, i = this.potentialArrowAt == this.start;
					switch (this.type) {
					case r._this:
					case r._super:
						return t = this.type === r._this ? "ThisExpression" : "Super",
						o = this.startNode(),
						this.next(),
						this.finishNode(o, t);
					case r._yield:
						this.inGenerator && this.unexpected();
					case r.name:
						var s = this.start
						, a = this.startLoc
						, l = this.parseIdent(this.type !== r.name);
						return i && !this.canInsertSemicolon() && this.eat(r.arrow) ? this.parseArrowExpression(this.startNodeAt(s, a), [l]) : l;
					case r.regexp:
						return n = this.value,
						o = this.parseLiteral(n.value),
						o.regex = {
							pattern: n.pattern,
							flags: n.flags
						},
						o;
					case r.num:
					case r.string:
						return this.parseLiteral(this.value);
					case r._null:
					case r._true:
					case r._false:
						return o = this.startNode(),
						o.value = this.type === r._null ? null  : this.type === r._true,
						o.raw = this.type.keyword,
						this.next(),
						this.finishNode(o, "Literal");
					case r.parenL:
						return this.parseParenAndDistinguishExpression(i);
					case r.bracketL:
						return o = this.startNode(),
						this.next(),
						this.options.ecmaVersion >= 7 && this.type === r._for ? this.parseComprehension(o, !1) : (o.elements = this.parseExprList(r.bracketR, !0, !0, e),
						this.finishNode(o, "ArrayExpression"));
					case r.braceL:
						return this.parseObj(!1, e);
					case r._function:
						return o = this.startNode(),
						this.next(),
						this.parseFunction(o, !1);
					case r._class:
						return this.parseClass(this.startNode(), !1);
					case r._new:
						return this.parseNew();
					case r.backQuote:
						return this.parseTemplate();
					default:
						this.unexpected()
					}
				}
				,
				s.parseLiteral = function(e) {
					var t = this.startNode();
					return t.value = e,
					t.raw = this.input.slice(this.start, this.end),
					this.next(),
					this.finishNode(t, "Literal")
				}
				,
				s.parseParenExpression = function() {
					this.expect(r.parenL);
					var e = this.parseExpression();
					return this.expect(r.parenR),
					e
				}
				,
				s.parseParenAndDistinguishExpression = function(e) {
					var t, n, o, i = this.start, s = this.startLoc, a = void 0;
					if (this.options.ecmaVersion >= 6) {
						if (this.next(),
						this.options.ecmaVersion >= 7 && this.type === r._for)
							return this.parseComprehension(this.startNodeAt(i, s), !0);
						for (var l = this.start, c = this.startLoc, p = [], h = !0, d = {
							start: 0
						}, u = void 0, f = void 0; this.type !== r.parenR; ) {
							if (h ? h = !1 : this.expect(r.comma),
							this.type === r.ellipsis) {
								u = this.start,
								p.push(this.parseParenItem(this.parseRest()));
								break
							}
							this.type !== r.parenL || f || (f = this.start),
							p.push(this.parseMaybeAssign(!1, d, this.parseParenItem))
						}
						if (t = this.start,
						n = this.startLoc,
						this.expect(r.parenR),
						e && !this.canInsertSemicolon() && this.eat(r.arrow))
							return f && this.unexpected(f),
							this.parseParenArrowList(i, s, p);
						p.length || this.unexpected(this.lastTokStart),
						u && this.unexpected(u),
						d.start && this.unexpected(d.start),
						p.length > 1 ? (a = this.startNodeAt(l, c),
						a.expressions = p,
						this.finishNodeAt(a, "SequenceExpression", t, n)) : a = p[0]
					} else
						a = this.parseParenExpression();
					return this.options.preserveParens ? (o = this.startNodeAt(i, s),
					o.expression = a,
					this.finishNode(o, "ParenthesizedExpression")) : a
				}
				,
				s.parseParenItem = function(e) {
					return e
				}
				,
				s.parseParenArrowList = function(e, t, r) {
					return this.parseArrowExpression(this.startNodeAt(e, t), r)
				}
				,
				t = [],
				s.parseNew = function() {
					var e, n, o = this.startNode(), i = this.parseIdent(!0);
					return this.options.ecmaVersion >= 6 && this.eat(r.dot) ? (o.meta = i,
					o.property = this.parseIdent(!0),
					"target" !== o.property.name && this.raise(o.property.start, "The only valid meta property for new is new.target"),
					this.finishNode(o, "MetaProperty")) : (e = this.start,
					n = this.startLoc,
					o.callee = this.parseSubscripts(this.parseExprAtom(), e, n, !0),
					o.arguments = this.eat(r.parenL) ? this.parseExprList(r.parenR, !1) : t,
					this.finishNode(o, "NewExpression"))
				}
				,
				s.parseTemplateElement = function() {
					var e = this.startNode();
					return e.value = {
						raw: this.input.slice(this.start, this.end),
						cooked: this.value
					},
					this.next(),
					e.tail = this.type === r.backQuote,
					this.finishNode(e, "TemplateElement")
				}
				,
				s.parseTemplate = function() {
					var e, t = this.startNode();
					for (this.next(),
					t.expressions = [],
					e = this.parseTemplateElement(),
					t.quasis = [e]; !e.tail; )
						this.expect(r.dollarBraceL),
						t.expressions.push(this.parseExpression()),
						this.expect(r.braceR),
						t.quasis.push(e = this.parseTemplateElement());
					return this.next(),
					this.finishNode(t, "TemplateLiteral")
				}
				,
				s.parseObj = function(e, t) {
					var n = this.startNode()
					, o = !0
					, i = {};
					for (n.properties = [],
					this.next(); !this.eat(r.braceR); ) {
						if (o)
							o = !1;
						else if (this.expect(r.comma),
						this.afterTrailingComma(r.braceR))
							break;
						var s = this.startNode()
						, a = void 0
						, l = void 0
						, c = void 0;
						this.options.ecmaVersion >= 6 && (s.method = !1,
						s.shorthand = !1,
						(e || t) && (l = this.start,
						c = this.startLoc),
						e || (a = this.eat(r.star))),
						this.parsePropertyName(s),
						this.parsePropertyValue(s, e, a, l, c, t),
						this.checkPropClash(s, i),
						n.properties.push(this.finishNode(s, "Property"))
					}
					return this.finishNode(n, e ? "ObjectPattern" : "ObjectExpression")
				}
				,
				s.parsePropertyValue = function(e, t, n, i, s, a) {
					this.eat(r.colon) ? (e.value = t ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(!1, a),
					e.kind = "init") : this.options.ecmaVersion >= 6 && this.type === r.parenL ? (t && this.unexpected(),
					e.kind = "init",
					e.method = !0,
					e.value = this.parseMethod(n)) : this.options.ecmaVersion >= 5 && !e.computed && "Identifier" === e.key.type && ("get" === e.key.name || "set" === e.key.name) && this.type != r.comma && this.type != r.braceR ? ((n || t) && this.unexpected(),
					e.kind = e.key.name,
					this.parsePropertyName(e),
					e.value = this.parseMethod(!1)) : this.options.ecmaVersion >= 6 && !e.computed && "Identifier" === e.key.type ? (e.kind = "init",
					t ? ((this.isKeyword(e.key.name) || this.strict && (o.strictBind(e.key.name) || o.strict(e.key.name)) || !this.options.allowReserved && this.isReservedWord(e.key.name)) && this.raise(e.key.start, "Binding " + e.key.name),
					e.value = this.parseMaybeDefault(i, s, e.key)) : this.type === r.eq && a ? (a.start || (a.start = this.start),
					e.value = this.parseMaybeDefault(i, s, e.key)) : e.value = e.key,
					e.shorthand = !0) : this.unexpected()
				}
				,
				s.parsePropertyName = function(e) {
					if (this.options.ecmaVersion >= 6) {
						if (this.eat(r.bracketL))
							return e.computed = !0,
							e.key = this.parseMaybeAssign(),
							this.expect(r.bracketR),
							e.key;
						e.computed = !1
					}
					return e.key = this.type === r.num || this.type === r.string ? this.parseExprAtom() : this.parseIdent(!0)
				}
				,
				s.initFunction = function(e) {
					e.id = null ,
					this.options.ecmaVersion >= 6 && (e.generator = !1,
					e.expression = !1)
				}
				,
				s.parseMethod = function(e) {
					var t, n = this.startNode();
					return this.initFunction(n),
					this.expect(r.parenL),
					n.params = this.parseBindingList(r.parenR, !1, !1),
					t = void 0,
					this.options.ecmaVersion >= 6 ? (n.generator = e,
					t = !0) : t = !1,
					this.parseFunctionBody(n, t),
					this.finishNode(n, "FunctionExpression")
				}
				,
				s.parseArrowExpression = function(e, t) {
					return this.initFunction(e),
					e.params = this.toAssignableList(t, !0),
					this.parseFunctionBody(e, !0),
					this.finishNode(e, "ArrowFunctionExpression")
				}
				,
				s.parseFunctionBody = function(e, t) {
					var n, o, i, s = t && this.type !== r.braceL;
					if (s)
						e.body = this.parseMaybeAssign(),
						e.expression = !0;
					else {
						var a = this.inFunction
						, l = this.inGenerator
						, c = this.labels;
						this.inFunction = !0,
						this.inGenerator = e.generator,
						this.labels = [],
						e.body = this.parseBlock(!0),
						e.expression = !1,
						this.inFunction = a,
						this.inGenerator = l,
						this.labels = c
					}
					if (this.strict || !s && e.body.body.length && this.isUseStrict(e.body.body[0])) {
						for (n = {},
						o = this.strict,
						this.strict = !0,
						e.id && this.checkLVal(e.id, !0),
						i = 0; i < e.params.length; i++)
							this.checkLVal(e.params[i], !0, n);
						this.strict = o
					}
				}
				,
				s.parseExprList = function(e, t, n, o) {
					for (var i = [], s = !0; !this.eat(e); ) {
						if (s)
							s = !1;
						else if (this.expect(r.comma),
						t && this.afterTrailingComma(e))
							break;
						i.push(n && this.type === r.comma ? null  : this.type === r.ellipsis ? this.parseSpread(o) : this.parseMaybeAssign(!1, o))
					}
					return i
				}
				,
				s.parseIdent = function(e) {
					var t = this.startNode();
					return e && "never" == this.options.allowReserved && (e = !1),
					this.type === r.name ? (!e && (!this.options.allowReserved && this.isReservedWord(this.value) || this.strict && o.strict(this.value) && (this.options.ecmaVersion >= 6 || -1 == this.input.slice(this.start, this.end).indexOf("\\"))) && this.raise(this.start, "The keyword '" + this.value + "' is reserved"),
					t.name = this.value) : e && this.type.keyword ? t.name = this.type.keyword : this.unexpected(),
					this.next(),
					this.finishNode(t, "Identifier")
				}
				,
				s.parseYield = function() {
					var e = this.startNode();
					return this.next(),
					this.type == r.semi || this.canInsertSemicolon() || this.type != r.star && !this.type.startsExpr ? (e.delegate = !1,
					e.argument = null ) : (e.delegate = this.eat(r.star),
					e.argument = this.parseMaybeAssign()),
					this.finishNode(e, "YieldExpression")
				}
				,
				s.parseComprehension = function(e, t) {
					for (e.blocks = []; this.type === r._for; ) {
						var n = this.startNode();
						this.next(),
						this.expect(r.parenL),
						n.left = this.parseBindingAtom(),
						this.checkLVal(n.left, !0),
						this.expectContextual("of"),
						n.right = this.parseExpression(),
						this.expect(r.parenR),
						e.blocks.push(this.finishNode(n, "ComprehensionBlock"))
					}
					return e.filter = this.eat(r._if) ? this.parseParenExpression() : null ,
					e.body = this.parseExpression(),
					this.expect(t ? r.parenR : r.bracketR),
					e.generator = t,
					this.finishNode(e, "ComprehensionExpression")
				}
			}
			, {
				"./identifier": 7,
				"./state": 13,
				"./tokentype": 17,
				"./util": 18
			}],
			7: [function(e, t, r) {
				"use strict";
				function n(e) {
					function t(e) {
						if (1 == e.length)
							return r += "return str === " + JSON.stringify(e[0]) + ";";
						r += "switch(str){";
						for (var t = 0; t < e.length; ++t)
							r += "case " + JSON.stringify(e[t]) + ":";
						r += "return true}return false;"
					}
					var r, n, o, i, s;
					e = e.split(" "),
					r = "",
					n = [];
					e: for (i = 0; i < e.length; ++i) {
						for (o = 0; o < n.length; ++o)
							if (n[o][0].length == e[i].length) {
								n[o].push(e[i]);
								continue e
							}
						n.push([e[i]])
					}
					if (n.length > 3) {
						for (n.sort(function(e, t) {
							return t.length - e.length
						}),
						r += "switch(str.length){",
						i = 0; i < n.length; ++i)
							s = n[i],
							r += "case " + s[0].length + ":",
							t(s);
						r += "}"
					} else
						t(e);
					return new Function("str",r)
				}
				function o(e, t) {
					for (var r = 65536, n = 0; n < t.length; n += 2) {
						if (r += t[n],
						r > e)
							return !1;
						if (r += t[n + 1],
						r >= e)
							return !0
					}
				}
				function i(e, t) {
					return 65 > e ? 36 === e : 91 > e ? !0 : 97 > e ? 95 === e : 123 > e ? !0 : 65535 >= e ? e >= 170 && f.test(String.fromCharCode(e)) : t === !1 ? !1 : o(e, p)
				}
				function s(e, t) {
					return 48 > e ? 36 === e : 58 > e ? !0 : 65 > e ? !1 : 91 > e ? !0 : 97 > e ? 95 === e : 123 > e ? !0 : 65535 >= e ? e >= 170 && m.test(String.fromCharCode(e)) : t === !1 ? !1 : o(e, p) || o(e, h)
				}
				var a, l, c, p, h;
				r.isIdentifierStart = i,
				r.isIdentifierChar = s,
				r.__esModule = !0,
				a = {
					3: n("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile"),
					5: n("class enum extends super const export import"),
					6: n("enum await"),
					strict: n("implements interface let package private protected public static yield"),
					strictBind: n("eval arguments")
				},
				r.reservedWords = a,
				l = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this",
				c = {
					5: n(l),
					6: n(l + " let const class extends export import yield super")
				},
				r.keywords = c;
				var d = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢲऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞭꞰꞱꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭟꭤꭥꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ"
				, u = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣤ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏ᦰ-ᧀᧈᧉ᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︭︳︴﹍-﹏０-９＿"
				, f = ""
				, m = "";
				d = u = null ,
				p = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 99, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 98, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 955, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 38, 17, 2, 24, 133, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 32, 4, 287, 47, 21, 1, 2, 0, 185, 46, 82, 47, 21, 0, 60, 42, 502, 63, 32, 0, 449, 56, 1288, 920, 104, 110, 2962, 1070, 13266, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 16481, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 1340, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 16355, 541],
				h = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 16, 9, 83, 11, 168, 11, 6, 9, 8, 2, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 316, 19, 13, 9, 214, 6, 3, 8, 112, 16, 16, 9, 82, 12, 9, 9, 535, 9, 20855, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 4305, 6, 792618, 239]
			}
			, {}],
			8: [function(e, t, r) {
				"use strict";
				function n(e, t) {
					for (var r, n = 1, o = 0; ; ) {
						if (a.lastIndex = o,
						r = a.exec(e),
						!(r && r.index < t))
							return new l(n,t - o);
						++n,
						o = r.index + r[0].length
					}
				}
				var o, i = function(e, t) {
					if (!(e instanceof t))
						throw new TypeError("Cannot call a class as a function")
				}
				;
				r.getLineInfo = n,
				r.__esModule = !0;
				{
					var s = e("./state").Parser
					, a = e("./whitespace").lineBreakG
					, l = (e("util").deprecate,
					r.Position = function() {
						function e(t, r) {
							i(this, e),
							this.line = t,
							this.column = r
						}
						return e.prototype.offset = function(t) {
							return new e(this.line,this.column + t)
						}
						,
						e
					}());
					r.SourceLocation = function c(e, t, r) {
						i(this, c),
						this.start = t,
						this.end = r,
						null  !== e.sourceFile && (this.source = e.sourceFile)
					}
				}
				o = s.prototype,
				o.raise = function(e, t) {
					var r, o = n(this.input, e);
					throw t += " (" + o.line + ":" + o.column + ")",
					r = new SyntaxError(t),
					r.pos = e,
					r.loc = o,
					r.raisedAt = this.pos,
					r
				}
				,
				o.curPosition = function() {
					return new l(this.curLine,this.pos - this.lineStart)
				}
				,
				o.markPosition = function() {
					return this.options.locations ? [this.start, this.startLoc] : this.start
				}
			}
			, {
				"./state": 13,
				"./whitespace": 19,
				util: 5
			}],
			9: [function(e) {
				"use strict";
				var t = e("./tokentype").types
				, r = e("./state").Parser
				, n = e("./identifier").reservedWords
				, o = e("./util").has
				, i = r.prototype;
				i.toAssignable = function(e, t) {
					var r, n;
					if (this.options.ecmaVersion >= 6 && e)
						switch (e.type) {
						case "Identifier":
						case "ObjectPattern":
						case "ArrayPattern":
						case "AssignmentPattern":
							break;
						case "ObjectExpression":
							for (e.type = "ObjectPattern",
							r = 0; r < e.properties.length; r++)
								n = e.properties[r],
								"init" !== n.kind && this.raise(n.key.start, "Object pattern can't contain getter or setter"),
								this.toAssignable(n.value, t);
							break;
						case "ArrayExpression":
							e.type = "ArrayPattern",
							this.toAssignableList(e.elements, t);
							break;
						case "AssignmentExpression":
							"=" === e.operator ? e.type = "AssignmentPattern" : this.raise(e.left.end, "Only '=' operator can be used for specifying default value.");
							break;
						case "ParenthesizedExpression":
							e.expression = this.toAssignable(e.expression, t);
							break;
						case "MemberExpression":
							if (!t)
								break;
						default:
							this.raise(e.start, "Assigning to rvalue")
						}
					return e
				}
				,
				i.toAssignableList = function(e, t) {
					var r, n, o, i, s = e.length;
					for (s && (r = e[s - 1],
					r && "RestElement" == r.type ? --s : r && "SpreadElement" == r.type && (r.type = "RestElement",
					n = r.argument,
					this.toAssignable(n, t),
					"Identifier" !== n.type && "MemberExpression" !== n.type && "ArrayPattern" !== n.type && this.unexpected(n.start),
					--s)),
					o = 0; s > o; o++)
						i = e[o],
						i && this.toAssignable(i, t);
					return e
				}
				,
				i.parseSpread = function(e) {
					var t = this.startNode();
					return this.next(),
					t.argument = this.parseMaybeAssign(e),
					this.finishNode(t, "SpreadElement")
				}
				,
				i.parseRest = function() {
					var e = this.startNode();
					return this.next(),
					e.argument = this.type === t.name || this.type === t.bracketL ? this.parseBindingAtom() : this.unexpected(),
					this.finishNode(e, "RestElement")
				}
				,
				i.parseBindingAtom = function() {
					if (this.options.ecmaVersion < 6)
						return this.parseIdent();
					switch (this.type) {
					case t.name:
						return this.parseIdent();
					case t.bracketL:
						var e = this.startNode();
						return this.next(),
						e.elements = this.parseBindingList(t.bracketR, !0, !0),
						this.finishNode(e, "ArrayPattern");
					case t.braceL:
						return this.parseObj(!0);
					default:
						this.unexpected()
					}
				}
				,
				i.parseBindingList = function(e, r, n) {
					for (var o, i, s = [], a = !0; !this.eat(e); )
						if (a ? a = !1 : this.expect(t.comma),
						r && this.type === t.comma)
							s.push(null );
						else {
							if (n && this.afterTrailingComma(e))
								break;
							if (this.type === t.ellipsis) {
								o = this.parseRest(),
								this.parseBindingListItem(o),
								s.push(o),
								this.expect(e);
								break
							}
							i = this.parseMaybeDefault(this.start, this.startLoc),
							this.parseBindingListItem(i),
							s.push(i)
						}
					return s
				}
				,
				i.parseBindingListItem = function(e) {
					return e
				}
				,
				i.parseMaybeDefault = function(e, r, n) {
					if (Array.isArray(e) && this.options.locations && void 0 === noCalls && (n = r,
					r = e[1],
					e = e[0]),
					n = n || this.parseBindingAtom(),
					!this.eat(t.eq))
						return n;
					var o = this.startNodeAt(e, r);
					return o.operator = "=",
					o.left = n,
					o.right = this.parseMaybeAssign(),
					this.finishNode(o, "AssignmentPattern")
				}
				,
				i.checkLVal = function(e, t, r) {
					var i, s;
					switch (e.type) {
					case "Identifier":
						this.strict && (n.strictBind(e.name) || n.strict(e.name)) && this.raise(e.start, (t ? "Binding " : "Assigning to ") + e.name + " in strict mode"),
						r && (o(r, e.name) && this.raise(e.start, "Argument name clash in strict mode"),
						r[e.name] = !0);
						break;
					case "MemberExpression":
						t && this.raise(e.start, (t ? "Binding" : "Assigning to") + " member expression");
						break;
					case "ObjectPattern":
						for (i = 0; i < e.properties.length; i++)
							this.checkLVal(e.properties[i].value, t, r);
						break;
					case "ArrayPattern":
						for (i = 0; i < e.elements.length; i++)
							s = e.elements[i],
							s && this.checkLVal(s, t, r);
						break;
					case "AssignmentPattern":
						this.checkLVal(e.left, t, r);
						break;
					case "RestElement":
						this.checkLVal(e.argument, t, r);
						break;
					case "ParenthesizedExpression":
						this.checkLVal(e.expression, t, r);
						break;
					default:
						this.raise(e.start, (t ? "Binding" : "Assigning to") + " rvalue")
					}
				}
			}
			, {
				"./identifier": 7,
				"./state": 13,
				"./tokentype": 17,
				"./util": 18
			}],
			10: [function(e, t, r) {
				"use strict";
				var n = function(e, t) {
					if (!(e instanceof t))
						throw new TypeError("Cannot call a class as a function")
				}
				;
				r.__esModule = !0;
				var o = e("./state").Parser
				, i = e("./location").SourceLocation
				, s = o.prototype
				, a = r.Node = function l() {
					n(this, l)
				}
				;
				s.startNode = function() {
					var e = new a;
					return e.start = this.start,
					this.options.locations && (e.loc = new i(this,this.startLoc)),
					this.options.directSourceFile && (e.sourceFile = this.options.directSourceFile),
					this.options.ranges && (e.range = [this.start, 0]),
					e
				}
				,
				s.startNodeAt = function(e, t) {
					var r = new a;
					return Array.isArray(e) && this.options.locations && void 0 === t && (t = e[1],
					e = e[0]),
					r.start = e,
					this.options.locations && (r.loc = new i(this,t)),
					this.options.directSourceFile && (r.sourceFile = this.options.directSourceFile),
					this.options.ranges && (r.range = [e, 0]),
					r
				}
				,
				s.finishNode = function(e, t) {
					return e.type = t,
					e.end = this.lastTokEnd,
					this.options.locations && (e.loc.end = this.lastTokEndLoc),
					this.options.ranges && (e.range[1] = this.lastTokEnd),
					e
				}
				,
				s.finishNodeAt = function(e, t, r, n) {
					return e.type = t,
					Array.isArray(r) && this.options.locations && void 0 === n && (n = r[1],
					r = r[0]),
					e.end = r,
					this.options.locations && (e.loc.end = n),
					this.options.ranges && (e.range[1] = r),
					e
				}
			}
			, {
				"./location": 8,
				"./state": 13
			}],
			11: [function(e, t, r) {
				"use strict";
				function n(e) {
					var t = {};
					for (var r in c)
						t[r] = e && s(e, r) ? e[r] : c[r];
					return a(t.onToken) && function() {
						var e = t.onToken;
						t.onToken = function(t) {
							return e.push(t)
						}
					}(),
					a(t.onComment) && (t.onComment = o(t, t.onComment)),
					t
				}
				function o(e, t) {
					return function(r, n, o, i, s, a) {
						var c = {
							type: r ? "Block" : "Line",
							value: n,
							start: o,
							end: i
						};
						e.locations && (c.loc = new l(this,s,a)),
						e.ranges && (c.range = [o, i]),
						t.push(c)
					}
				}
				r.getOptions = n,
				r.__esModule = !0;
				var i = e("./util")
				, s = i.has
				, a = i.isArray
				, l = e("./location").SourceLocation
				, c = {
					ecmaVersion: 5,
					sourceType: "script",
					onInsertedSemicolon: null ,
					onTrailingComma: null ,
					allowReserved: !0,
					allowReturnOutsideFunction: !1,
					allowImportExportEverywhere: !1,
					allowHashBang: !1,
					locations: !1,
					onToken: null ,
					onComment: null ,
					ranges: !1,
					program: null ,
					sourceFile: null ,
					directSourceFile: null ,
					preserveParens: !1,
					plugins: {}
				};
				r.defaultOptions = c
			}
			, {
				"./location": 8,
				"./util": 18
			}],
			12: [function(e) {
				"use strict";
				var t = e("./tokentype").types
				, r = e("./state").Parser
				, n = e("./whitespace").lineBreak
				, o = r.prototype;
				o.isUseStrict = function(e) {
					return this.options.ecmaVersion >= 5 && "ExpressionStatement" === e.type && "Literal" === e.expression.type && "use strict" === e.expression.value
				}
				,
				o.eat = function(e) {
					return this.type === e ? (this.next(),
					!0) : !1
				}
				,
				o.isContextual = function(e) {
					return this.type === t.name && this.value === e
				}
				,
				o.eatContextual = function(e) {
					return this.value === e && this.eat(t.name)
				}
				,
				o.expectContextual = function(e) {
					this.eatContextual(e) || this.unexpected()
				}
				,
				o.canInsertSemicolon = function() {
					return this.type === t.eof || this.type === t.braceR || n.test(this.input.slice(this.lastTokEnd, this.start))
				}
				,
				o.insertSemicolon = function() {
					return this.canInsertSemicolon() ? (this.options.onInsertedSemicolon && this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc),
					!0) : void 0
				}
				,
				o.semicolon = function() {
					this.eat(t.semi) || this.insertSemicolon() || this.unexpected()
				}
				,
				o.afterTrailingComma = function(e) {
					return this.type == e ? (this.options.onTrailingComma && this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc),
					this.next(),
					!0) : void 0
				}
				,
				o.expect = function(e) {
					this.eat(e) || this.unexpected()
				}
				,
				o.unexpected = function(e) {
					this.raise(null  != e ? e : this.start, "Unexpected token")
				}
			}
			, {
				"./state": 13,
				"./tokentype": 17,
				"./whitespace": 19
			}],
			13: [function(e, t, r) {
				"use strict";
				function n(e, t, r) {
					this.options = e,
					this.sourceFile = this.options.sourceFile || null ,
					this.isKeyword = a[this.options.ecmaVersion >= 6 ? 6 : 5],
					this.isReservedWord = s[this.options.ecmaVersion],
					this.input = t,
					this.loadPlugins(this.options.plugins),
					r ? (this.pos = r,
					this.lineStart = Math.max(0, this.input.lastIndexOf("\n", r)),
					this.curLine = this.input.slice(0, this.lineStart).split(c).length) : (this.pos = this.lineStart = 0,
					this.curLine = 1),
					this.type = l.eof,
					this.value = null ,
					this.start = this.end = this.pos,
					this.startLoc = this.endLoc = null ,
					this.lastTokEndLoc = this.lastTokStartLoc = null ,
					this.lastTokStart = this.lastTokEnd = this.pos,
					this.context = this.initialContext(),
					this.exprAllowed = !0,
					this.strict = this.inModule = "module" === this.options.sourceType,
					this.potentialArrowAt = -1,
					this.inFunction = this.inGenerator = !1,
					this.labels = [],
					0 === this.pos && this.options.allowHashBang && "#!" === this.input.slice(0, 2) && this.skipLineComment(2)
				}
				var o;
				r.Parser = n,
				r.__esModule = !0;
				var i = e("./identifier")
				, s = i.reservedWords
				, a = i.keywords
				, l = e("./tokentype").types
				, c = e("./whitespace").lineBreak;
				n.prototype.extend = function(e, t) {
					this[e] = t(this[e])
				}
				,
				o = {},
				r.plugins = o,
				n.prototype.loadPlugins = function(e) {
					var t, n;
					for (t in e) {
						if (n = r.plugins[t],
						!n)
							throw new Error("Plugin '" + t + "' not found");
						n(this, e[t])
					}
				}
			}
			, {
				"./identifier": 7,
				"./tokentype": 17,
				"./whitespace": 19
			}],
			14: [function(e) {
				"use strict";
				var t, r, n, o = e("./tokentype").types, i = e("./state").Parser, s = e("./whitespace").lineBreak, a = i.prototype;
				a.parseTopLevel = function(e) {
					var t, r = !0;
					for (e.body || (e.body = []); this.type !== o.eof; )
						t = this.parseStatement(!0, !0),
						e.body.push(t),
						r && this.isUseStrict(t) && this.setStrict(!0),
						r = !1;
					return this.next(),
					this.options.ecmaVersion >= 6 && (e.sourceType = this.options.sourceType),
					this.finishNode(e, "Program")
				}
				,
				t = {
					kind: "loop"
				},
				r = {
					kind: "switch"
				},
				a.parseStatement = function(e, t) {
					var r, n, i = this.type, s = this.startNode();
					switch (i) {
					case o._break:
					case o._continue:
						return this.parseBreakContinueStatement(s, i.keyword);
					case o._debugger:
						return this.parseDebuggerStatement(s);
					case o._do:
						return this.parseDoStatement(s);
					case o._for:
						return this.parseForStatement(s);
					case o._function:
						return !e && this.options.ecmaVersion >= 6 && this.unexpected(),
						this.parseFunctionStatement(s);
					case o._class:
						return e || this.unexpected(),
						this.parseClass(s, !0);
					case o._if:
						return this.parseIfStatement(s);
					case o._return:
						return this.parseReturnStatement(s);
					case o._switch:
						return this.parseSwitchStatement(s);
					case o._throw:
						return this.parseThrowStatement(s);
					case o._try:
						return this.parseTryStatement(s);
					case o._let:
					case o._const:
						e || this.unexpected();
					case o._var:
						return this.parseVarStatement(s, i);
					case o._while:
						return this.parseWhileStatement(s);
					case o._with:
						return this.parseWithStatement(s);
					case o.braceL:
						return this.parseBlock();
					case o.semi:
						return this.parseEmptyStatement(s);
					case o._export:
					case o._import:
						return this.options.allowImportExportEverywhere || (t || this.raise(this.start, "'import' and 'export' may only appear at the top level"),
						this.inModule || this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'")),
						i === o._import ? this.parseImport(s) : this.parseExport(s);
					default:
						return r = this.value,
						n = this.parseExpression(),
						i === o.name && "Identifier" === n.type && this.eat(o.colon) ? this.parseLabeledStatement(s, r, n) : this.parseExpressionStatement(s, n)
					}
				}
				,
				a.parseBreakContinueStatement = function(e, t) {
					var r, n, i = "break" == t;
					for (this.next(),
					this.eat(o.semi) || this.insertSemicolon() ? e.label = null  : this.type !== o.name ? this.unexpected() : (e.label = this.parseIdent(),
					this.semicolon()),
					r = 0; r < this.labels.length; ++r)
						if (n = this.labels[r],
						null  == e.label || n.name === e.label.name) {
							if (null  != n.kind && (i || "loop" === n.kind))
								break;
							if (e.label && i)
								break
						}
					return r === this.labels.length && this.raise(e.start, "Unsyntactic " + t),
					this.finishNode(e, i ? "BreakStatement" : "ContinueStatement")
				}
				,
				a.parseDebuggerStatement = function(e) {
					return this.next(),
					this.semicolon(),
					this.finishNode(e, "DebuggerStatement")
				}
				,
				a.parseDoStatement = function(e) {
					return this.next(),
					this.labels.push(t),
					e.body = this.parseStatement(!1),
					this.labels.pop(),
					this.expect(o._while),
					e.test = this.parseParenExpression(),
					this.options.ecmaVersion >= 6 ? this.eat(o.semi) : this.semicolon(),
					this.finishNode(e, "DoWhileStatement")
				}
				,
				a.parseForStatement = function(e) {
					var r, n, i, s;
					return this.next(),
					this.labels.push(t),
					this.expect(o.parenL),
					this.type === o.semi ? this.parseFor(e, null ) : this.type === o._var || this.type === o._let || this.type === o._const ? (r = this.startNode(),
					n = this.type,
					this.next(),
					this.parseVar(r, !0, n),
					this.finishNode(r, "VariableDeclaration"),
					!(this.type === o._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) || 1 !== r.declarations.length || n !== o._var && r.declarations[0].init ? this.parseFor(e, r) : this.parseForIn(e, r)) : (i = {
						start: 0
					},
					s = this.parseExpression(!0, i),
					this.type === o._in || this.options.ecmaVersion >= 6 && this.isContextual("of") ? (this.toAssignable(s),
					this.checkLVal(s),
					this.parseForIn(e, s)) : (i.start && this.unexpected(i.start),
					this.parseFor(e, s)))
				}
				,
				a.parseFunctionStatement = function(e) {
					return this.next(),
					this.parseFunction(e, !0)
				}
				,
				a.parseIfStatement = function(e) {
					return this.next(),
					e.test = this.parseParenExpression(),
					e.consequent = this.parseStatement(!1),
					e.alternate = this.eat(o._else) ? this.parseStatement(!1) : null ,
					this.finishNode(e, "IfStatement")
				}
				,
				a.parseReturnStatement = function(e) {
					return this.inFunction || this.options.allowReturnOutsideFunction || this.raise(this.start, "'return' outside of function"),
					this.next(),
					this.eat(o.semi) || this.insertSemicolon() ? e.argument = null  : (e.argument = this.parseExpression(),
					this.semicolon()),
					this.finishNode(e, "ReturnStatement")
				}
				,
				a.parseSwitchStatement = function(e) {
					var t, n, i;
					for (this.next(),
					e.discriminant = this.parseParenExpression(),
					e.cases = [],
					this.expect(o.braceL),
					this.labels.push(r); this.type != o.braceR; )
						this.type === o._case || this.type === o._default ? (i = this.type === o._case,
						t && this.finishNode(t, "SwitchCase"),
						e.cases.push(t = this.startNode()),
						t.consequent = [],
						this.next(),
						i ? t.test = this.parseExpression() : (n && this.raise(this.lastTokStart, "Multiple default clauses"),
						n = !0,
						t.test = null ),
						this.expect(o.colon)) : (t || this.unexpected(),
						t.consequent.push(this.parseStatement(!0)));
					return t && this.finishNode(t, "SwitchCase"),
					this.next(),
					this.labels.pop(),
					this.finishNode(e, "SwitchStatement")
				}
				,
				a.parseThrowStatement = function(e) {
					return this.next(),
					s.test(this.input.slice(this.lastTokEnd, this.start)) && this.raise(this.lastTokEnd, "Illegal newline after throw"),
					e.argument = this.parseExpression(),
					this.semicolon(),
					this.finishNode(e, "ThrowStatement")
				}
				,
				n = [],
				a.parseTryStatement = function(e) {
					if (this.next(),
					e.block = this.parseBlock(),
					e.handler = null ,
					this.type === o._catch) {
						var t = this.startNode();
						this.next(),
						this.expect(o.parenL),
						t.param = this.parseBindingAtom(),
						this.checkLVal(t.param, !0),
						this.expect(o.parenR),
						t.guard = null ,
						t.body = this.parseBlock(),
						e.handler = this.finishNode(t, "CatchClause")
					}
					return e.guardedHandlers = n,
					e.finalizer = this.eat(o._finally) ? this.parseBlock() : null ,
					e.handler || e.finalizer || this.raise(e.start, "Missing catch or finally clause"),
					this.finishNode(e, "TryStatement")
				}
				,
				a.parseVarStatement = function(e, t) {
					return this.next(),
					this.parseVar(e, !1, t),
					this.semicolon(),
					this.finishNode(e, "VariableDeclaration")
				}
				,
				a.parseWhileStatement = function(e) {
					return this.next(),
					e.test = this.parseParenExpression(),
					this.labels.push(t),
					e.body = this.parseStatement(!1),
					this.labels.pop(),
					this.finishNode(e, "WhileStatement")
				}
				,
				a.parseWithStatement = function(e) {
					return this.strict && this.raise(this.start, "'with' in strict mode"),
					this.next(),
					e.object = this.parseParenExpression(),
					e.body = this.parseStatement(!1),
					this.finishNode(e, "WithStatement")
				}
				,
				a.parseEmptyStatement = function(e) {
					return this.next(),
					this.finishNode(e, "EmptyStatement")
				}
				,
				a.parseLabeledStatement = function(e, t, r) {
					for (var n, i = 0; i < this.labels.length; ++i)
						this.labels[i].name === t && this.raise(r.start, "Label '" + t + "' is already declared");
					return n = this.type.isLoop ? "loop" : this.type === o._switch ? "switch" : null ,
					this.labels.push({
						name: t,
						kind: n
					}),
					e.body = this.parseStatement(!0),
					this.labels.pop(),
					e.label = r,
					this.finishNode(e, "LabeledStatement")
				}
				,
				a.parseExpressionStatement = function(e, t) {
					return e.expression = t,
					this.semicolon(),
					this.finishNode(e, "ExpressionStatement")
				}
				,
				a.parseBlock = function(e) {
					var t, r = this.startNode(), n = !0, i = void 0;
					for (r.body = [],
					this.expect(o.braceL); !this.eat(o.braceR); )
						t = this.parseStatement(!0),
						tern,
						r.body.push(t),
						n && e && this.isUseStrict(t) && (i = this.strict,
						this.setStrict(this.strict = !0)),
						n = !1;
					return i === !1 && this.setStrict(!1),
					this.finishNode(r, "BlockStatement")
				}
				,
				a.parseFor = function(e, t) {
					return e.init = t,
					this.expect(o.semi),
					e.test = this.type === o.semi ? null  : this.parseExpression(),
					this.expect(o.semi),
					e.update = this.type === o.parenR ? null  : this.parseExpression(),
					this.expect(o.parenR),
					e.body = this.parseStatement(!1),
					this.labels.pop(),
					this.finishNode(e, "ForStatement")
				}
				,
				a.parseForIn = function(e, t) {
					var r = this.type === o._in ? "ForInStatement" : "ForOfStatement";
					return this.next(),
					e.left = t,
					e.right = this.parseExpression(),
					this.expect(o.parenR),
					e.body = this.parseStatement(!1),
					this.labels.pop(),
					this.finishNode(e, r)
				}
				,
				a.parseVar = function(e, t, r) {
					for (e.declarations = [],
					e.kind = r.keyword; ; ) {
						var n = this.startNode();
						if (this.parseVarId(n),
						this.eat(o.eq) ? n.init = this.parseMaybeAssign(t) : r !== o._const || this.type === o._in || this.options.ecmaVersion >= 6 && this.isContextual("of") ? "Identifier" == n.id.type || t && (this.type === o._in || this.isContextual("of")) ? n.init = null  : this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value") : this.unexpected(),
						e.declarations.push(this.finishNode(n, "VariableDeclarator")),
						!this.eat(o.comma))
							break
					}
					return e
				}
				,
				a.parseVarId = function(e) {
					e.id = this.parseBindingAtom(),
					this.checkLVal(e.id, !0)
				}
				,
				a.parseFunction = function(e, t, r) {
					return this.initFunction(e),
					this.options.ecmaVersion >= 6 && (e.generator = this.eat(o.star)),
					(t || this.type === o.name) && (e.id = this.parseIdent()),
					this.parseFunctionParams(e),
					this.parseFunctionBody(e, r),
					this.finishNode(e, t ? "FunctionDeclaration" : "FunctionExpression")
				}
				,
				a.parseFunctionParams = function(e) {
					this.expect(o.parenL),
					e.params = this.parseBindingList(o.parenR, !1, !1)
				}
				,
				a.parseClass = function(e, t) {
					var r, n, i, s;
					for (this.next(),
					this.parseClassId(e, t),
					this.parseClassSuper(e),
					r = this.startNode(),
					n = !1,
					r.body = [],
					this.expect(o.braceL); !this.eat(o.braceR); )
						if (!this.eat(o.semi)) {
							var a = this.startNode()
							, l = this.eat(o.star)
							, c = this.type === o.name && "static" === this.value;
							this.parsePropertyName(a),
							a["static"] = c && this.type !== o.parenL,
							a["static"] && (l && this.unexpected(),
							l = this.eat(o.star),
							this.parsePropertyName(a)),
							a.kind = "method",
							a.computed || (i = a.key,
							s = !1,
							l || "Identifier" !== i.type || this.type === o.parenL || "get" !== i.name && "set" !== i.name || (s = !0,
							a.kind = i.name,
							i = this.parsePropertyName(a)),
							a["static"] || ("Identifier" !== i.type || "constructor" !== i.name) && ("Literal" !== i.type || "constructor" !== i.value) || (n && this.raise(i.start, "Duplicate constructor in the same class"),
							s && this.raise(i.start, "Constructor can't have get/set modifier"),
							l && this.raise(i.start, "Constructor can't be a generator"),
							a.kind = "constructor",
							n = !0)),
							this.parseClassMethod(r, a, l)
						}
					return e.body = this.finishNode(r, "ClassBody"),
					this.finishNode(e, t ? "ClassDeclaration" : "ClassExpression")
				}
				,
				a.parseClassMethod = function(e, t, r) {
					t.value = this.parseMethod(r),
					e.body.push(this.finishNode(t, "MethodDefinition"))
				}
				,
				a.parseClassId = function(e, t) {
					e.id = this.type === o.name ? this.parseIdent() : t ? this.unexpected() : null 
				}
				,
				a.parseClassSuper = function(e) {
					e.superClass = this.eat(o._extends) ? this.parseExprSubscripts() : null 
				}
				,
				a.parseExport = function(e) {
					if (this.next(),
					this.eat(o.star))
						return this.expectContextual("from"),
						e.source = this.type === o.string ? this.parseExprAtom() : this.unexpected(),
						this.semicolon(),
						this.finishNode(e, "ExportAllDeclaration");
					if (this.eat(o._default)) {
						var t = this.parseMaybeAssign()
						, r = !0;
						return ("FunctionExpression" == t.type || "ClassExpression" == t.type) && (r = !1,
						t.id && (t.type = "FunctionExpression" == t.type ? "FunctionDeclaration" : "ClassDeclaration")),
						e.declaration = t,
						r && this.semicolon(),
						this.finishNode(e, "ExportDefaultDeclaration")
					}
					return this.shouldParseExportStatement() ? (e.declaration = this.parseStatement(!0),
					e.specifiers = [],
					e.source = null ) : (e.declaration = null ,
					e.specifiers = this.parseExportSpecifiers(),
					e.source = this.eatContextual("from") ? this.type === o.string ? this.parseExprAtom() : this.unexpected() : null ,
					this.semicolon()),
					this.finishNode(e, "ExportNamedDeclaration")
				}
				,
				a.shouldParseExportStatement = function() {
					return this.type.keyword
				}
				,
				a.parseExportSpecifiers = function() {
					var e, t = [], r = !0;
					for (this.expect(o.braceL); !this.eat(o.braceR); ) {
						if (r)
							r = !1;
						else if (this.expect(o.comma),
						this.afterTrailingComma(o.braceR))
							break;
						e = this.startNode(),
						e.local = this.parseIdent(this.type === o._default),
						e.exported = this.eatContextual("as") ? this.parseIdent(!0) : e.local,
						t.push(this.finishNode(e, "ExportSpecifier"))
					}
					return t
				}
				,
				a.parseImport = function(e) {
					return this.next(),
					this.type === o.string ? (e.specifiers = n,
					e.source = this.parseExprAtom(),
					e.kind = "") : (e.specifiers = this.parseImportSpecifiers(),
					this.expectContextual("from"),
					e.source = this.type === o.string ? this.parseExprAtom() : this.unexpected()),
					this.semicolon(),
					this.finishNode(e, "ImportDeclaration")
				}
				,
				a.parseImportSpecifiers = function() {
					var e, t = [], r = !0;
					if (this.type === o.name && (e = this.startNode(),
					e.local = this.parseIdent(),
					this.checkLVal(e.local, !0),
					t.push(this.finishNode(e, "ImportDefaultSpecifier")),
					!this.eat(o.comma)))
						return t;
					if (this.type === o.star)
						return e = this.startNode(),
						this.next(),
						this.expectContextual("as"),
						e.local = this.parseIdent(),
						this.checkLVal(e.local, !0),
						t.push(this.finishNode(e, "ImportNamespaceSpecifier")),
						t;
					for (this.expect(o.braceL); !this.eat(o.braceR); ) {
						if (r)
							r = !1;
						else if (this.expect(o.comma),
						this.afterTrailingComma(o.braceR))
							break;
						e = this.startNode(),
						e.imported = this.parseIdent(!0),
						e.local = this.eatContextual("as") ? this.parseIdent() : e.imported,
						this.checkLVal(e.local, !0),
						t.push(this.finishNode(e, "ImportSpecifier"))
					}
					return t
				}
			}
			, {
				"./state": 13,
				"./tokentype": 17,
				"./whitespace": 19
			}],
			15: [function(e, t, r) {
				"use strict";
				var n, o = function(e, t) {
					if (!(e instanceof t))
						throw new TypeError("Cannot call a class as a function")
				}
				;
				r.__esModule = !0;
				var i = e("./state").Parser
				, s = e("./tokentype").types
				, a = e("./whitespace").lineBreak
				, l = r.TokContext = function p(e, t, r, n) {
					o(this, p),
					this.token = e,
					this.isExpr = t,
					this.preserveSpace = r,
					this.override = n
				}
				, c = {
					b_stat: new l("{",!1),
					b_expr: new l("{",!0),
					b_tmpl: new l("${",!0),
					p_stat: new l("(",!1),
					p_expr: new l("(",!0),
					q_tmpl: new l("`",!0,!0,function(e) {
						return e.readTmplToken()
					}
					),
					f_expr: new l("function",!0)
				};
				r.types = c,
				n = i.prototype,
				n.initialContext = function() {
					return [c.b_stat]
				}
				,
				n.braceIsBlock = function(e) {
					var t = void 0;
					return e === s.colon && "{" == (t = this.curContext()).token ? !t.isExpr : e === s._return ? a.test(this.input.slice(this.lastTokEnd, this.start)) : e === s._else || e === s.semi || e === s.eof ? !0 : e == s.braceL ? this.curContext() === c.b_stat : !this.exprAllowed
				}
				,
				n.updateContext = function(e) {
					var t = void 0
					, r = this.type;
					r.keyword && e == s.dot ? this.exprAllowed = !1 : (t = r.updateContext) ? t.call(this, e) : this.exprAllowed = r.beforeExpr
				}
				,
				s.parenR.updateContext = s.braceR.updateContext = function() {
					if (1 == this.context.length)
						return void (this.exprAllowed = !0);
					var e = this.context.pop();
					e === c.b_stat && this.curContext() === c.f_expr ? (this.context.pop(),
					this.exprAllowed = !1) : this.exprAllowed = e === c.b_tmpl ? !0 : !e.isExpr
				}
				,
				s.braceL.updateContext = function(e) {
					this.context.push(this.braceIsBlock(e) ? c.b_stat : c.b_expr),
					this.exprAllowed = !0
				}
				,
				s.dollarBraceL.updateContext = function() {
					this.context.push(c.b_tmpl),
					this.exprAllowed = !0
				}
				,
				s.parenL.updateContext = function(e) {
					var t = e === s._if || e === s._for || e === s._with || e === s._while;
					this.context.push(t ? c.p_stat : c.p_expr),
					this.exprAllowed = !0
				}
				,
				s.incDec.updateContext = function() {}
				,
				s._function.updateContext = function() {
					this.curContext() !== c.b_stat && this.context.push(c.f_expr),
					this.exprAllowed = !1
				}
				,
				s.backQuote.updateContext = function() {
					this.curContext() === c.q_tmpl ? this.context.pop() : this.context.push(c.q_tmpl),
					this.exprAllowed = !1
				}
			}
			, {
				"./state": 13,
				"./tokentype": 17,
				"./whitespace": 19
			}],
			16: [function(e, t, r) {
				"use strict";
				function n(e) {
					return 65535 >= e ? String.fromCharCode(e) : String.fromCharCode((e - 65536 >> 10) + 55296, (e - 65536 & 1023) + 56320)
				}
				var o, i, s = function(e, t) {
					if (!(e instanceof t))
						throw new TypeError("Cannot call a class as a function")
				}
				;
				r.__esModule = !0;
				var a = e("./identifier")
				, l = a.isIdentifierStart
				, c = a.isIdentifierChar
				, p = e("./tokentype")
				, h = p.types
				, d = p.keywords
				, u = e("./state").Parser
				, f = e("./location").SourceLocation
				, m = e("./whitespace")
				, g = m.lineBreak
				, y = m.lineBreakG
				, b = m.isNewLine
				, v = m.nonASCIIwhitespace
				, w = r.Token = function O(e) {
					s(this, O),
					this.type = e.type,
					this.value = e.value,
					this.start = e.start,
					this.end = e.end,
					e.options.locations && (this.loc = new f(e,e.startLoc,e.endLoc)),
					e.options.ranges && (this.range = [e.start, e.end])
				}
				, S = u.prototype
				, x = "undefined" != typeof Packages;
				S.next = function() {
					this.options.onToken && this.options.onToken(new w(this)),
					this.lastTokEnd = this.end,
					this.lastTokStart = this.start,
					this.lastTokEndLoc = this.endLoc,
					this.lastTokStartLoc = this.startLoc,
					this.nextToken()
				}
				,
				S.getToken = function() {
					return this.next(),
					new w(this)
				}
				,
				"undefined" != typeof Symbol && (S[Symbol.iterator] = function() {
					var e = this;
					return {
						next: function() {
							var t = e.getToken();
							return {
								done: t.type === h.eof,
								value: t
							}
						}
					}
				}
				),
				S.setStrict = function(e) {
					if (this.strict = e,
					this.type === h.num || this.type === h.string) {
						if (this.pos = this.start,
						this.options.locations)
							for (; this.pos < this.lineStart; )
								this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1,
								--this.curLine;
						this.nextToken()
					}
				}
				,
				S.curContext = function() {
					return this.context[this.context.length - 1]
				}
				,
				S.nextToken = function() {
					var e = this.curContext();
					return e && e.preserveSpace || this.skipSpace(),
					this.start = this.pos,
					this.options.locations && (this.startLoc = this.curPosition()),
					this.pos >= this.input.length ? this.finishToken(h.eof) : e.override ? e.override(this) : void this.readToken(this.fullCharCodeAtPos())
				}
				,
				S.readToken = function(e) {
					return l(e, this.options.ecmaVersion >= 6) || 92 === e ? this.readWord() : this.getTokenFromCode(e)
				}
				,
				S.fullCharCodeAtPos = function() {
					var e, t = this.input.charCodeAt(this.pos);
					return 55295 >= t || t >= 57344 ? t : (e = this.input.charCodeAt(this.pos + 1),
					(t << 10) + e - 56613888)
				}
				,
				S.skipBlockComment = function() {
					var e, t = this.options.onComment && this.options.locations && this.curPosition(), r = this.pos, n = this.input.indexOf("*/", this.pos += 2);
					if (-1 === n && this.raise(this.pos - 2, "Unterminated comment"),
					this.pos = n + 2,
					this.options.locations)
						for (y.lastIndex = r,
						e = void 0; (e = y.exec(this.input)) && e.index < this.pos; )
							++this.curLine,
							this.lineStart = e.index + e[0].length;
					this.options.onComment && this.options.onComment(!0, this.input.slice(r + 2, n), r, this.pos, t, this.options.locations && this.curPosition())
				}
				,
				S.skipLineComment = function(e) {
					for (var t = this.pos, r = this.options.onComment && this.options.locations && this.curPosition(), n = this.input.charCodeAt(this.pos += e); this.pos < this.input.length && 10 !== n && 13 !== n && 8232 !== n && 8233 !== n; )
						++this.pos,
						n = this.input.charCodeAt(this.pos);
					this.options.onComment && this.options.onComment(!1, this.input.slice(t + e, this.pos), t, this.pos, r, this.options.locations && this.curPosition())
				}
				,
				S.skipSpace = function() {
					for (var e, t; this.pos < this.input.length; )
						if (e = this.input.charCodeAt(this.pos),
						32 === e)
							++this.pos;
						else if (13 === e)
							++this.pos,
							t = this.input.charCodeAt(this.pos),
							10 === t && ++this.pos,
							this.options.locations && (++this.curLine,
							this.lineStart = this.pos);
						else if (10 === e || 8232 === e || 8233 === e)
							++this.pos,
							this.options.locations && (++this.curLine,
							this.lineStart = this.pos);
						else if (e > 8 && 14 > e)
							++this.pos;
						else if (47 === e)
							if (t = this.input.charCodeAt(this.pos + 1),
							42 === t)
								this.skipBlockComment();
							else {
								if (47 !== t)
									break;
								this.skipLineComment(2)
							}
						else if (160 === e)
							++this.pos;
						else {
							if (!(e >= 5760 && v.test(String.fromCharCode(e))))
								break;
							++this.pos
						}
				}
				,
				S.finishToken = function(e, t) {
					this.end = this.pos,
					this.options.locations && (this.endLoc = this.curPosition());
					var r = this.type;
					this.type = e,
					this.value = t,
					this.updateContext(r)
				}
				,
				S.readToken_dot = function() {
					var e, t = this.input.charCodeAt(this.pos + 1);
					return t >= 48 && 57 >= t ? this.readNumber(!0) : (e = this.input.charCodeAt(this.pos + 2),
					this.options.ecmaVersion >= 6 && 46 === t && 46 === e ? (this.pos += 3,
					this.finishToken(h.ellipsis)) : (++this.pos,
					this.finishToken(h.dot)))
				}
				,
				S.readToken_slash = function() {
					var e = this.input.charCodeAt(this.pos + 1);
					return this.exprAllowed ? (++this.pos,
					this.readRegexp()) : 61 === e ? this.finishOp(h.assign, 2) : this.finishOp(h.slash, 1)
				}
				,
				S.readToken_mult_modulo = function(e) {
					var t = this.input.charCodeAt(this.pos + 1);
					return 61 === t ? this.finishOp(h.assign, 2) : this.finishOp(42 === e ? h.star : h.modulo, 1)
				}
				,
				S.readToken_pipe_amp = function(e) {
					var t = this.input.charCodeAt(this.pos + 1);
					return t === e ? this.finishOp(124 === e ? h.logicalOR : h.logicalAND, 2) : 61 === t ? this.finishOp(h.assign, 2) : this.finishOp(124 === e ? h.bitwiseOR : h.bitwiseAND, 1)
				}
				,
				S.readToken_caret = function() {
					var e = this.input.charCodeAt(this.pos + 1);
					return 61 === e ? this.finishOp(h.assign, 2) : this.finishOp(h.bitwiseXOR, 1)
				}
				,
				S.readToken_plus_min = function(e) {
					var t = this.input.charCodeAt(this.pos + 1);
					return t === e ? 45 == t && 62 == this.input.charCodeAt(this.pos + 2) && g.test(this.input.slice(this.lastTokEnd, this.pos)) ? (this.skipLineComment(3),
					this.skipSpace(),
					this.nextToken()) : this.finishOp(h.incDec, 2) : 61 === t ? this.finishOp(h.assign, 2) : this.finishOp(h.plusMin, 1)
				}
				,
				S.readToken_lt_gt = function(e) {
					var t = this.input.charCodeAt(this.pos + 1)
					, r = 1;
					return t === e ? (r = 62 === e && 62 === this.input.charCodeAt(this.pos + 2) ? 3 : 2,
					61 === this.input.charCodeAt(this.pos + r) ? this.finishOp(h.assign, r + 1) : this.finishOp(h.bitShift, r)) : 33 == t && 60 == e && 45 == this.input.charCodeAt(this.pos + 2) && 45 == this.input.charCodeAt(this.pos + 3) ? (this.inModule && this.unexpected(),
					this.skipLineComment(4),
					this.skipSpace(),
					this.nextToken()) : (61 === t && (r = 61 === this.input.charCodeAt(this.pos + 2) ? 3 : 2),
					this.finishOp(h.relational, r))
				}
				,
				S.readToken_eq_excl = function(e) {
					var t = this.input.charCodeAt(this.pos + 1);
					return 61 === t ? this.finishOp(h.equality, 61 === this.input.charCodeAt(this.pos + 2) ? 3 : 2) : 61 === e && 62 === t && this.options.ecmaVersion >= 6 ? (this.pos += 2,
					this.finishToken(h.arrow)) : this.finishOp(61 === e ? h.eq : h.prefix, 1)
				}
				,
				S.getTokenFromCode = function(e) {
					switch (e) {
					case 46:
						return this.readToken_dot();
					case 40:
						return ++this.pos,
						this.finishToken(h.parenL);
					case 41:
						return ++this.pos,
						this.finishToken(h.parenR);
					case 59:
						return ++this.pos,
						this.finishToken(h.semi);
					case 44:
						return ++this.pos,
						this.finishToken(h.comma);
					case 91:
						return ++this.pos,
						this.finishToken(h.bracketL);
					case 93:
						return ++this.pos,
						this.finishToken(h.bracketR);
					case 123:
						return ++this.pos,
						this.finishToken(h.braceL);
					case 125:
						return ++this.pos,
						this.finishToken(h.braceR);
					case 58:
						return ++this.pos,
						this.finishToken(h.colon);
					case 63:
						return ++this.pos,
						this.finishToken(h.question);
					case 96:
						if (this.options.ecmaVersion < 6)
							break;
						return ++this.pos,
						this.finishToken(h.backQuote);
					case 48:
						var t = this.input.charCodeAt(this.pos + 1);
						if (120 === t || 88 === t)
							return this.readRadixNumber(16);
						if (this.options.ecmaVersion >= 6) {
							if (111 === t || 79 === t)
								return this.readRadixNumber(8);
							if (98 === t || 66 === t)
								return this.readRadixNumber(2)
						}
					case 49:
					case 50:
					case 51:
					case 52:
					case 53:
					case 54:
					case 55:
					case 56:
					case 57:
						return this.readNumber(!1);
					case 34:
					case 39:
						return this.readString(e);
					case 47:
						return this.readToken_slash();
					case 37:
					case 42:
						return this.readToken_mult_modulo(e);
					case 124:
					case 38:
						return this.readToken_pipe_amp(e);
					case 94:
						return this.readToken_caret();
					case 43:
					case 45:
						return this.readToken_plus_min(e);
					case 60:
					case 62:
						return this.readToken_lt_gt(e);
					case 61:
					case 33:
						return this.readToken_eq_excl(e);
					case 126:
						return this.finishOp(h.prefix, 1)
					}
					this.raise(this.pos, "Unexpected character '" + n(e) + "'")
				}
				,
				S.finishOp = function(e, t) {
					var r = this.input.slice(this.pos, this.pos + t);
					return this.pos += t,
					this.finishToken(e, r)
				}
				,
				o = !1;
				try {
					new RegExp("￿","u"),
					o = !0
				} catch (T) {}
				S.readRegexp = function() {
					for (var e, t, r, n, i, s, a = void 0, l = void 0, c = this.pos; ; ) {
						if (this.pos >= this.input.length && this.raise(c, "Unterminated regular expression"),
						e = this.input.charAt(this.pos),
						g.test(e) && this.raise(c, "Unterminated regular expression"),
						a)
							a = !1;
						else {
							if ("[" === e)
								l = !0;
							else if ("]" === e && l)
								l = !1;
							else if ("/" === e && !l)
								break;
							a = "\\" === e
						}
						++this.pos
					}
					if (t = this.input.slice(c, this.pos),
					++this.pos,
					r = this.readWord1(),
					n = t,
					r && (i = /^[gmsiy]*$/,
					this.options.ecmaVersion >= 6 && (i = /^[gmsiyu]*$/),
					i.test(r) || this.raise(c, "Invalid regular expression flag"),
					r.indexOf("u") >= 0 && !o && (n = n.replace(/\\u([a-fA-F0-9]{4})|\\u\{([0-9a-fA-F]+)\}|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x"))),
					s = null ,
					!x) {
						try {
							new RegExp(n)
						} catch (p) {
							p instanceof SyntaxError && this.raise(c, "Error parsing regular expression: " + p.message),
							this.raise(p)
						}
						try {
							s = new RegExp(t,r)
						} catch (d) {}
					}
					return this.finishToken(h.regexp, {
						pattern: t,
						flags: r,
						value: s
					})
				}
				,
				S.readInt = function(e, t) {
					for (var r, n, o = this.pos, i = 0, s = 0, a = null  == t ? 1 / 0 : t; a > s && (r = this.input.charCodeAt(this.pos),
					n = void 0,
					n = r >= 97 ? r - 87 : r >= 65 ? r - 55 : r >= 48 && 57 >= r ? r - 48 : 1 / 0,
					!(n >= e)); ++s)
						++this.pos,
						i = i * e + n;
					return this.pos === o || null  != t && this.pos - o !== t ? null  : i
				}
				,
				S.readRadixNumber = function(e) {
					this.pos += 2;
					var t = this.readInt(e);
					return null  == t && this.raise(this.start + 2, "Expected number in radix " + e),
					l(this.fullCharCodeAtPos()) && this.raise(this.pos, "Identifier directly after number"),
					this.finishToken(h.num, t)
				}
				,
				S.readNumber = function(e) {
					var t, r, n, o = this.pos, i = !1, s = 48 === this.input.charCodeAt(this.pos);
					return e || null  !== this.readInt(10) || this.raise(o, "Invalid number"),
					46 === this.input.charCodeAt(this.pos) && (++this.pos,
					this.readInt(10),
					i = !0),
					t = this.input.charCodeAt(this.pos),
					(69 === t || 101 === t) && (t = this.input.charCodeAt(++this.pos),
					(43 === t || 45 === t) && ++this.pos,
					null  === this.readInt(10) && this.raise(o, "Invalid number"),
					i = !0),
					l(this.fullCharCodeAtPos()) && this.raise(this.pos, "Identifier directly after number"),
					r = this.input.slice(o, this.pos),
					n = void 0,
					i ? n = parseFloat(r) : s && 1 !== r.length ? /[89]/.test(r) || this.strict ? this.raise(o, "Invalid number") : n = parseInt(r, 8) : n = parseInt(r, 10),
					this.finishToken(h.num, n)
				}
				,
				S.readCodePoint = function() {
					var e = this.input.charCodeAt(this.pos)
					, t = void 0;
					return 123 === e ? (this.options.ecmaVersion < 6 && this.unexpected(),
					++this.pos,
					t = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos),
					++this.pos,
					t > 1114111 && this.unexpected()) : t = this.readHexChar(4),
					t
				}
				,
				S.readString = function(e) {
					for (var t, r = "", n = ++this.pos; this.pos >= this.input.length && this.raise(this.start, "Unterminated string constant"),
					t = this.input.charCodeAt(this.pos),
					t !== e; )
						92 === t ? (r += this.input.slice(n, this.pos),
						r += this.readEscapedChar(),
						n = this.pos) : (b(t) && this.raise(this.start, "Unterminated string constant"),
						++this.pos);
					return r += this.input.slice(n, this.pos++),
					this.finishToken(h.string, r)
				}
				,
				S.readTmplToken = function() {
					for (var e, t = "", r = this.pos; ; ) {
						if (this.pos >= this.input.length && this.raise(this.start, "Unterminated template"),
						e = this.input.charCodeAt(this.pos),
						96 === e || 36 === e && 123 === this.input.charCodeAt(this.pos + 1))
							return this.pos === this.start && this.type === h.template ? 36 === e ? (this.pos += 2,
							this.finishToken(h.dollarBraceL)) : (++this.pos,
							this.finishToken(h.backQuote)) : (t += this.input.slice(r, this.pos),
							this.finishToken(h.template, t));
						92 === e ? (t += this.input.slice(r, this.pos),
						t += this.readEscapedChar(),
						r = this.pos) : b(e) ? (t += this.input.slice(r, this.pos),
						++this.pos,
						13 === e && 10 === this.input.charCodeAt(this.pos) ? (++this.pos,
						t += "\n") : t += String.fromCharCode(e),
						this.options.locations && (++this.curLine,
						this.lineStart = this.pos),
						r = this.pos) : ++this.pos
					}
				}
				,
				S.readEscapedChar = function() {
					var e = this.input.charCodeAt(++this.pos)
					, t = /^[0-7]+/.exec(this.input.slice(this.pos, this.pos + 3));
					for (t && (t = t[0]); t && parseInt(t, 8) > 255; )
						t = t.slice(0, -1);
					if ("0" === t && (t = null ),
					++this.pos,
					t)
						return this.strict && this.raise(this.pos - 2, "Octal literal in strict mode"),
						this.pos += t.length - 1,
						String.fromCharCode(parseInt(t, 8));
					switch (e) {
					case 110:
						return "\n";
					case 114:
						return "\r";
					case 120:
						return String.fromCharCode(this.readHexChar(2));
					case 117:
						return n(this.readCodePoint());
					case 116:
						return "	";
					case 98:
						return "\b";
					case 118:
						return "";
					case 102:
						return "\f";
					case 48:
						return "\x00";
					case 13:
						10 === this.input.charCodeAt(this.pos) && ++this.pos;
					case 10:
						return this.options.locations && (this.lineStart = this.pos,
						++this.curLine),
						"";
					default:
						return String.fromCharCode(e)
					}
				}
				,
				S.readHexChar = function(e) {
					var t = this.readInt(16, e);
					return null  === t && this.raise(this.start, "Bad character escape sequence"),
					t
				}
				,
				S.readWord1 = function() {
					var e, t, r;
					i = !1;
					for (var o = "", s = !0, a = this.pos, p = this.options.ecmaVersion >= 6; this.pos < this.input.length; ) {
						if (e = this.fullCharCodeAtPos(),
						c(e, p))
							this.pos += 65535 >= e ? 1 : 2;
						else {
							if (92 !== e)
								break;
							i = !0,
							o += this.input.slice(a, this.pos),
							t = this.pos,
							117 != this.input.charCodeAt(++this.pos) && this.raise(this.pos, "Expecting Unicode escape sequence \\uXXXX"),
							++this.pos,
							r = this.readCodePoint(),
							(s ? l : c)(r, p) || this.raise(t, "Invalid Unicode escape"),
							o += n(r),
							a = this.pos
						}
						s = !1
					}
					return o + this.input.slice(a, this.pos)
				}
				,
				S.readWord = function() {
					var e = this.readWord1()
					, t = h.name;
					return (this.options.ecmaVersion >= 6 || !i) && this.isKeyword(e) && (t = d[e]),
					this.finishToken(t, e)
				}
			}
			, {
				"./identifier": 7,
				"./location": 8,
				"./state": 13,
				"./tokentype": 17,
				"./whitespace": 19
			}],
			17: [function(e, t, r) {
				"use strict";
				function n(e, t) {
					return new i(e,{
						beforeExpr: !0,
						binop: t
					})
				}
				function o(e) {
					var t = void 0 === arguments[1] ? {} : arguments[1];
					t.keyword = e,
					s[e] = p["_" + e] = new i(e,t)
				}
				var i, s, a = function(e, t) {
					if (!(e instanceof t))
						throw new TypeError("Cannot call a class as a function")
				}
				;
				r.__esModule = !0,
				i = r.TokenType = function h(e) {
					var t = void 0 === arguments[1] ? {} : arguments[1];
					a(this, h),
					this.label = e,
					this.keyword = t.keyword,
					this.beforeExpr = !!t.beforeExpr,
					this.startsExpr = !!t.startsExpr,
					this.isLoop = !!t.isLoop,
					this.isAssign = !!t.isAssign,
					this.prefix = !!t.prefix,
					this.postfix = !!t.postfix,
					this.binop = t.binop || null ,
					this.updateContext = null 
				}
				;
				var l = {
					beforeExpr: !0
				}
				, c = {
					startsExpr: !0
				}
				, p = {
					num: new i("num",c),
					regexp: new i("regexp",c),
					string: new i("string",c),
					name: new i("name",c),
					eof: new i("eof"),
					bracketL: new i("[",{
						beforeExpr: !0,
						startsExpr: !0
					}),
					bracketR: new i("]"),
					braceL: new i("{",{
						beforeExpr: !0,
						startsExpr: !0
					}),
					braceR: new i("}"),
					parenL: new i("(",{
						beforeExpr: !0,
						startsExpr: !0
					}),
					parenR: new i(")"),
					comma: new i(",",l),
					semi: new i(";",l),
					colon: new i(":",l),
					dot: new i("."),
					question: new i("?",l),
					arrow: new i("=>",l),
					template: new i("template"),
					ellipsis: new i("...",l),
					backQuote: new i("`",c),
					dollarBraceL: new i("${",{
						beforeExpr: !0,
						startsExpr: !0
					}),
					eq: new i("=",{
						beforeExpr: !0,
						isAssign: !0
					}),
					assign: new i("_=",{
						beforeExpr: !0,
						isAssign: !0
					}),
					incDec: new i("++/--",{
						prefix: !0,
						postfix: !0,
						startsExpr: !0
					}),
					prefix: new i("prefix",{
						beforeExpr: !0,
						prefix: !0,
						startsExpr: !0
					}),
					logicalOR: n("||", 1),
					logicalAND: n("&&", 2),
					bitwiseOR: n("|", 3),
					bitwiseXOR: n("^", 4),
					bitwiseAND: n("&", 5),
					equality: n("==/!=", 6),
					relational: n("</>", 7),
					bitShift: n("<</>>", 8),
					plusMin: new i("+/-",{
						beforeExpr: !0,
						binop: 9,
						prefix: !0,
						startsExpr: !0
					}),
					modulo: n("%", 10),
					star: n("*", 10),
					slash: n("/", 10)
				};
				r.types = p,
				s = {},
				r.keywords = s,
				o("break"),
				o("case", l),
				o("catch"),
				o("continue"),
				o("debugger"),
				o("default"),
				o("do", {
					isLoop: !0
				}),
				o("else", l),
				o("finally"),
				o("for", {
					isLoop: !0
				}),
				o("function", c),
				o("if"),
				o("return", l),
				o("switch"),
				o("throw", l),
				o("try"),
				o("var"),
				o("let"),
				o("const"),
				o("while", {
					isLoop: !0
				}),
				o("with"),
				o("new", {
					beforeExpr: !0,
					startsExpr: !0
				}),
				o("this", c),
				o("super", c),
				o("class"),
				o("extends", l),
				o("export"),
				o("import"),
				o("yield", {
					beforeExpr: !0,
					startsExpr: !0
				}),
				o("null", c),
				o("true", c),
				o("false", c),
				o("in", {
					beforeExpr: !0,
					binop: 7
				}),
				o("instanceof", {
					beforeExpr: !0,
					binop: 7
				}),
				o("typeof", {
					beforeExpr: !0,
					prefix: !0,
					startsExpr: !0
				}),
				o("void", {
					beforeExpr: !0,
					prefix: !0,
					startsExpr: !0
				}),
				o("delete", {
					beforeExpr: !0,
					prefix: !0,
					startsExpr: !0
				})
			}
			, {}],
			18: [function(e, t, r) {
				"use strict";
				function n(e) {
					return "[object Array]" === Object.prototype.toString.call(e)
				}
				function o(e, t) {
					return Object.prototype.hasOwnProperty.call(e, t)
				}
				r.isArray = n,
				r.has = o,
				r.__esModule = !0
			}
			, {}],
			19: [function(e, t, r) {
				"use strict";
				function n(e) {
					return 10 === e || 13 === e || 8232 === e || 8233 == e
				}
				var o, i, s;
				r.isNewLine = n,
				r.__esModule = !0,
				o = /\r\n?|\n|\u2028|\u2029/,
				r.lineBreak = o,
				i = new RegExp(o.source,"g"),
				r.lineBreakG = i,
				s = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/,
				r.nonASCIIwhitespace = s
			}
			, {}]
		}, {}, [1])(1)
	}),
	function(e) {
		if ("object" == typeof exports && "undefined" != typeof module)
			module.exports = e();
		else if ("function" == typeof define && define.amd)
			define([], e);
		else {
			var t;
			t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this,
			(t.acorn || (t.acorn = {})).loose = e()
		}
	}(function() {
		return function e(t, r, n) {
			function o(s, a) {
				var l, c, p;
				if (!r[s]) {
					if (!t[s]) {
						if (l = "function" == typeof require && require,
						!a && l)
							return l(s, !0);
						if (i)
							return i(s, !0);
						throw c = new Error("Cannot find module '" + s + "'"),
						c.code = "MODULE_NOT_FOUND",
						c
					}
					p = r[s] = {
						exports: {}
					},
					t[s][0].call(p.exports, function(e) {
						var r = t[s][1][e];
						return o(r ? r : e)
					}, p, p.exports, e, t, r, n)
				}
				return r[s].exports
			}
			for (var i = "function" == typeof require && require, s = 0; s < n.length; s++)
				o(n[s]);
			return o
		}({
			1: [function(e, t, r) {
				"use strict";
				function n(e, t) {
					var r = new a(e,t);
					return r.next(),
					r.parseTopLevel()
				}
				var o = function(e) {
					return e && e.__esModule ? e : {
						"default": e
					}
				}
				;
				r.parse_dammit = n,
				r.__esModule = !0;
				var i = o(e(".."))
				, s = e("./state")
				, a = s.LooseParser;
				e("./tokenize"),
				e("./parseutil"),
				e("./statement"),
				e("./expression"),
				r.LooseParser = s.LooseParser,
				i.defaultOptions.tabSize = 4,
				i.parse_dammit = n,
				i.LooseParser = a
			}
			, {
				"..": 2,
				"./expression": 3,
				"./parseutil": 4,
				"./state": 5,
				"./statement": 6,
				"./tokenize": 7
			}],
			2: [function(e, t) {
				"use strict";
				t.exports = "undefined" != typeof acorn || true ? window.acorn : e("./acorn")
			}
			, {}],
			3: [function(e) {
				"use strict";
				var t = e("./state").LooseParser
				, r = e("./parseutil").isDummy
				, n = e("..").tokTypes
				, o = t.prototype;
				o.checkLVal = function(e, t) {
					if (!e)
						return e;
					switch (e.type) {
					case "Identifier":
						return e;
					case "MemberExpression":
						return t ? this.dummyIdent() : e;
					case "ParenthesizedExpression":
						return e.expression = this.checkLVal(e.expression, t),
						e;
					case "ObjectPattern":
					case "ArrayPattern":
					case "RestElement":
					case "AssignmentPattern":
						if (this.options.ecmaVersion >= 6)
							return e;
					default:
						return this.dummyIdent()
					}
				}
				,
				o.parseExpression = function(e) {
					var t, r = this.storeCurrentPos(), o = this.parseMaybeAssign(e);
					if (this.tok.type === n.comma) {
						for (t = this.startNodeAt(r),
						t.expressions = [o]; this.eat(n.comma); )
							t.expressions.push(this.parseMaybeAssign(e));
						return this.finishNode(t, "SequenceExpression")
					}
					return o
				}
				,
				o.parseParenExpression = function() {
					this.pushCx(),
					this.expect(n.parenL);
					var e = this.parseExpression();
					return this.popCx(),
					this.expect(n.parenR),
					e
				}
				,
				o.parseMaybeAssign = function(e) {
					var t, r = this.storeCurrentPos(), o = this.parseMaybeConditional(e);
					return this.tok.type.isAssign ? (t = this.startNodeAt(r),
					t.operator = this.tok.value,
					t.left = this.tok.type === n.eq ? this.toAssignable(o) : this.checkLVal(o),
					this.next(),
					t.right = this.parseMaybeAssign(e),
					this.finishNode(t, "AssignmentExpression")) : o
				}
				,
				o.parseMaybeConditional = function(e) {
					var t, r = this.storeCurrentPos(), o = this.parseExprOps(e);
					return this.eat(n.question) ? (t = this.startNodeAt(r),
					t.test = o,
					t.consequent = this.parseMaybeAssign(),
					t.alternate = this.expect(n.colon) ? this.parseMaybeAssign(e) : this.dummyIdent(),
					this.finishNode(t, "ConditionalExpression")) : o
				}
				,
				o.parseExprOps = function(e) {
					var t = this.storeCurrentPos()
					, r = this.curIndent
					, n = this.curLineStart;
					return this.parseExprOp(this.parseMaybeUnary(e), t, -1, e, r, n)
				}
				,
				o.parseExprOp = function(e, t, r, o, i, s) {
					var a, l, c;
					return this.curLineStart != s && this.curIndent < i && this.tokenStartsLine() ? e : (a = this.tok.type.binop,
					null  != a && (!o || this.tok.type !== n._in) && a > r ? (l = this.startNodeAt(t),
					l.left = e,
					l.operator = this.tok.value,
					this.next(),
					this.curLineStart != s && this.curIndent < i && this.tokenStartsLine() ? l.right = this.dummyIdent() : (c = this.storeCurrentPos(),
					l.right = this.parseExprOp(this.parseMaybeUnary(o), c, a, o, i, s)),
					this.finishNode(l, /&&|\|\|/.test(l.operator) ? "LogicalExpression" : "BinaryExpression"),
					this.parseExprOp(l, t, r, o, i, s)) : e)
				}
				,
				o.parseMaybeUnary = function(e) {
					var t, r, o, i;
					if (this.tok.type.prefix)
						return i = this.startNode(),
						t = this.tok.type === n.incDec,
						i.operator = this.tok.value,
						i.prefix = !0,
						this.next(),
						i.argument = this.parseMaybeUnary(e),
						t && (i.argument = this.checkLVal(i.argument)),
						this.finishNode(i, t ? "UpdateExpression" : "UnaryExpression");
					if (this.tok.type === n.ellipsis)
						return i = this.startNode(),
						this.next(),
						i.argument = this.parseMaybeUnary(e),
						this.finishNode(i, "SpreadElement");
					for (r = this.storeCurrentPos(),
					o = this.parseExprSubscripts(); this.tok.type.postfix && !this.canInsertSemicolon(); )
						i = this.startNodeAt(r),
						i.operator = this.tok.value,
						i.prefix = !1,
						i.argument = this.checkLVal(o),
						this.next(),
						o = this.finishNode(i, "UpdateExpression");
					return o
				}
				,
				o.parseExprSubscripts = function() {
					var e = this.storeCurrentPos();
					return this.parseSubscripts(this.parseExprAtom(), e, !1, this.curIndent, this.curLineStart)
				}
				,
				o.parseSubscripts = function(e, t, r, o, i) {
					for (var s; ; ) {
						if (this.curLineStart != i && this.curIndent <= o && this.tokenStartsLine()) {
							if (this.tok.type != n.dot || this.curIndent != o)
								return e;
							--o
						}
						if (this.eat(n.dot))
							s = this.startNodeAt(t),
							s.object = e,
							s.property = this.curLineStart != i && this.curIndent <= o && this.tokenStartsLine() ? this.dummyIdent() : this.parsePropertyAccessor() || this.dummyIdent(),
							s.computed = !1,
							e = this.finishNode(s, "MemberExpression");
						else if (this.tok.type == n.bracketL)
							this.pushCx(),
							this.next(),
							s = this.startNodeAt(t),
							s.object = e,
							s.property = this.parseExpression(),
							s.computed = !0,
							this.popCx(),
							this.expect(n.bracketR),
							e = this.finishNode(s, "MemberExpression");
						else if (r || this.tok.type != n.parenL) {
							if (this.tok.type != n.backQuote)
								return e;
							s = this.startNodeAt(t),
							s.tag = e,
							s.quasi = this.parseTemplate(),
							e = this.finishNode(s, "TaggedTemplateExpression")
						} else
							s = this.startNodeAt(t),
							s.callee = e,
							s.arguments = this.parseExprList(n.parenR),
							e = this.finishNode(s, "CallExpression")
					}
				}
				,
				o.parseExprAtom = function() {
					var e, t, o, i, s, a, l, c = void 0;
					switch (this.tok.type) {
					case n._this:
					case n._super:
						return e = this.tok.type === n._this ? "ThisExpression" : "Super",
						c = this.startNode(),
						this.next(),
						this.finishNode(c, e);
					case n.name:
						return t = this.storeCurrentPos(),
						o = this.parseIdent(),
						this.eat(n.arrow) ? this.parseArrowExpression(this.startNodeAt(t), [o]) : o;
					case n.regexp:
						return c = this.startNode(),
						i = this.tok.value,
						c.regex = {
							pattern: i.pattern,
							flags: i.flags
						},
						c.value = i.value,
						c.raw = this.input.slice(this.tok.start, this.tok.end),
						this.next(),
						this.finishNode(c, "Literal");
					case n.num:
					case n.string:
						return c = this.startNode(),
						c.value = this.tok.value,
						c.raw = this.input.slice(this.tok.start, this.tok.end),
						this.next(),
						this.finishNode(c, "Literal");
					case n._null:
					case n._true:
					case n._false:
						return c = this.startNode(),
						c.value = this.tok.type === n._null ? null  : this.tok.type === n._true,
						c.raw = this.tok.type.keyword,
						this.next(),
						this.finishNode(c, "Literal");
					case n.parenL:
						return s = this.storeCurrentPos(),
						this.next(),
						a = this.parseExpression(),
						this.expect(n.parenR),
						this.eat(n.arrow) ? this.parseArrowExpression(this.startNodeAt(s), a.expressions || (r(a) ? [] : [a])) : (this.options.preserveParens && (l = this.startNodeAt(s),
						l.expression = a,
						a = this.finishNode(l, "ParenthesizedExpression")),
						a);
					case n.bracketL:
						return c = this.startNode(),
						c.elements = this.parseExprList(n.bracketR, !0),
						this.finishNode(c, "ArrayExpression");
					case n.braceL:
						return this.parseObj();
					case n._class:
						return this.parseClass();
					case n._function:
						return c = this.startNode(),
						this.next(),
						this.parseFunction(c, !1);
					case n._new:
						return this.parseNew();
					case n._yield:
						return c = this.startNode(),
						this.next(),
						this.semicolon() || this.canInsertSemicolon() || this.tok.type != n.star && !this.tok.type.startsExpr ? (c.delegate = !1,
						c.argument = null ) : (c.delegate = this.eat(n.star),
						c.argument = this.parseMaybeAssign()),
						this.finishNode(c, "YieldExpression");
					case n.backQuote:
						return this.parseTemplate();
					default:
						return this.dummyIdent()
					}
				}
				,
				o.parseNew = function() {
					var e, t = this.startNode(), r = this.curIndent, o = this.curLineStart, i = this.parseIdent(!0);
					return this.options.ecmaVersion >= 6 && this.eat(n.dot) ? (t.meta = i,
					t.property = this.parseIdent(!0),
					this.finishNode(t, "MetaProperty")) : (e = this.storeCurrentPos(),
					t.callee = this.parseSubscripts(this.parseExprAtom(), e, !0, r, o),
					t.arguments = this.tok.type == n.parenL ? this.parseExprList(n.parenR) : [],
					this.finishNode(t, "NewExpression"))
				}
				,
				o.parseTemplateElement = function() {
					var e = this.startNode();
					return e.value = {
						raw: this.input.slice(this.tok.start, this.tok.end),
						cooked: this.tok.value
					},
					this.next(),
					e.tail = this.tok.type === n.backQuote,
					this.finishNode(e, "TemplateElement")
				}
				,
				o.parseTemplate = function() {
					var e, t = this.startNode();
					for (this.next(),
					t.expressions = [],
					e = this.parseTemplateElement(),
					t.quasis = [e]; !e.tail; )
						this.next(),
						t.expressions.push(this.parseExpression()),
						this.expect(n.braceR) ? e = this.parseTemplateElement() : (e = this.startNode(),
						e.value = {
							cooked: "",
							raw: ""
						},
						e.tail = !0),
						t.quasis.push(e);
					return this.expect(n.backQuote),
					this.finishNode(t, "TemplateLiteral")
				}
				,
				o.parseObj = function() {
					var e, t, o, i = this.startNode();
					for (i.properties = [],
					this.pushCx(),
					e = this.curIndent + 1,
					t = this.curLineStart,
					this.eat(n.braceL),
					this.curIndent + 1 < e && (e = this.curIndent,
					t = this.curLineStart); !this.closes(n.braceR, e, t); ) {
						var s = this.startNode()
						, a = void 0
						, l = void 0;
						this.options.ecmaVersion >= 6 && (l = this.storeCurrentPos(),
						s.method = !1,
						s.shorthand = !1,
						a = this.eat(n.star)),
						this.parsePropertyName(s),
						r(s.key) ? (r(this.parseMaybeAssign()) && this.next(),
						this.eat(n.comma)) : (this.eat(n.colon) ? (s.kind = "init",
						s.value = this.parseMaybeAssign()) : this.options.ecmaVersion >= 6 && (this.tok.type === n.parenL || this.tok.type === n.braceL) ? (s.kind = "init",
						s.method = !0,
						s.value = this.parseMethod(a)) : this.options.ecmaVersion >= 5 && "Identifier" === s.key.type && !s.computed && ("get" === s.key.name || "set" === s.key.name) && this.tok.type != n.comma && this.tok.type != n.braceR ? (s.kind = s.key.name,
						this.parsePropertyName(s),
						s.value = this.parseMethod(!1)) : (s.kind = "init",
						this.options.ecmaVersion >= 6 ? this.eat(n.eq) ? (o = this.startNodeAt(l),
						o.operator = "=",
						o.left = s.key,
						o.right = this.parseMaybeAssign(),
						s.value = this.finishNode(o, "AssignmentExpression")) : s.value = s.key : s.value = this.dummyIdent(),
						s.shorthand = !0),
						i.properties.push(this.finishNode(s, "Property")),
						this.eat(n.comma))
					}
					return this.popCx(),
					this.eat(n.braceR) || (this.last.end = this.tok.start,
					this.options.locations && (this.last.loc.end = this.tok.loc.start)),
					this.finishNode(i, "ObjectExpression")
				}
				,
				o.parsePropertyName = function(e) {
					if (this.options.ecmaVersion >= 6) {
						if (this.eat(n.bracketL))
							return e.computed = !0,
							e.key = this.parseExpression(),
							void this.expect(n.bracketR);
						e.computed = !1
					}
					var t = this.tok.type === n.num || this.tok.type === n.string ? this.parseExprAtom() : this.parseIdent();
					e.key = t || this.dummyIdent()
				}
				,
				o.parsePropertyAccessor = function() {
					return this.tok.type === n.name || this.tok.type.keyword ? this.parseIdent() : void 0
				}
				,
				o.parseIdent = function() {
					var e, t = this.tok.type === n.name ? this.tok.value : this.tok.type.keyword;
					return t ? (e = this.startNode(),
					this.next(),
					e.name = t,
					this.finishNode(e, "Identifier")) : this.dummyIdent()
				}
				,
				o.initFunction = function(e) {
					e.id = null ,
					e.params = [],
					this.options.ecmaVersion >= 6 && (e.generator = !1,
					e.expression = !1)
				}
				,
				o.toAssignable = function(e, t) {
					var r, n;
					if (this.options.ecmaVersion >= 6 && e)
						switch (e.type) {
						case "ObjectExpression":
							for (e.type = "ObjectPattern",
							r = e.properties,
							n = 0; n < r.length; n++)
								this.toAssignable(r[n].value, t);
							break;
						case "ArrayExpression":
							e.type = "ArrayPattern",
							this.toAssignableList(e.elements, t);
							break;
						case "SpreadElement":
							e.type = "RestElement",
							e.argument = this.toAssignable(e.argument, t);
							break;
						case "AssignmentExpression":
							e.type = "AssignmentPattern"
						}
					return this.checkLVal(e, t)
				}
				,
				o.toAssignableList = function(e, t) {
					for (var r = 0; r < e.length; r++)
						e[r] = this.toAssignable(e[r], t);
					return e
				}
				,
				o.parseFunctionParams = function(e) {
					return e = this.parseExprList(n.parenR),
					this.toAssignableList(e, !0)
				}
				,
				o.parseMethod = function(e) {
					var t = this.startNode();
					return this.initFunction(t),
					t.params = this.parseFunctionParams(),
					t.generator = e || !1,
					t.expression = this.options.ecmaVersion >= 6 && this.tok.type !== n.braceL,
					t.body = t.expression ? this.parseMaybeAssign() : this.parseBlock(),
					this.finishNode(t, "FunctionExpression")
				}
				,
				o.parseArrowExpression = function(e, t) {
					return this.initFunction(e),
					e.params = this.toAssignableList(t, !0),
					e.expression = this.tok.type !== n.braceL,
					e.body = e.expression ? this.parseMaybeAssign() : this.parseBlock(),
					this.finishNode(e, "ArrowFunctionExpression")
				}
				,
				o.parseExprList = function(e, t) {
					var o;
					this.pushCx();
					var i = this.curIndent
					, s = this.curLineStart
					, a = [];
					for (this.next(); !this.closes(e, i + 1, s); )
						if (this.eat(n.comma))
							a.push(t ? null  : this.dummyIdent());
						else {
							if (o = this.parseMaybeAssign(),
							r(o)) {
								if (this.closes(e, i, s))
									break;
								this.next()
							} else
								a.push(o);
							this.eat(n.comma)
						}
					return this.popCx(),
					this.eat(e) || (this.last.end = this.tok.start,
					this.options.locations && (this.last.loc.end = this.tok.loc.start)),
					a
				}
			}
			, {
				"..": 2,
				"./parseutil": 4,
				"./state": 5
			}],
			4: [function(e, t, r) {
				"use strict";
				function n(e) {
					return "✖" == e.name
				}
				r.isDummy = n,
				r.__esModule = !0;
				var o = e("./state").LooseParser
				, i = e("..")
				, s = i.Node
				, a = i.SourceLocation
				, l = i.lineBreak
				, c = i.isNewLine
				, p = i.tokTypes
				, h = o.prototype;
				h.startNode = function() {
					var e = new s;
					return e.start = this.tok.start,
					this.options.locations && (e.loc = new a(this.toks,this.tok.loc.start)),
					this.options.directSourceFile && (e.sourceFile = this.options.directSourceFile),
					this.options.ranges && (e.range = [this.tok.start, 0]),
					e
				}
				,
				h.storeCurrentPos = function() {
					return this.options.locations ? [this.tok.start, this.tok.loc.start] : this.tok.start
				}
				,
				h.startNodeAt = function(e) {
					var t = new s;
					return this.options.locations ? (t.start = e[0],
					t.loc = new a(this.toks,e[1]),
					e = e[0]) : t.start = e,
					this.options.directSourceFile && (t.sourceFile = this.options.directSourceFile),
					this.options.ranges && (t.range = [e, 0]),
					t
				}
				,
				h.finishNode = function(e, t) {
					return e.type = t,
					e.end = this.last.end,
					this.options.locations && (e.loc.end = this.last.loc.end),
					this.options.ranges && (e.range[1] = this.last.end),
					e
				}
				,
				h.dummyIdent = function() {
					var e = this.startNode();
					return e.name = "✖",
					this.finishNode(e, "Identifier")
				}
				,
				h.eat = function(e) {
					return this.tok.type === e ? (this.next(),
					!0) : !1
				}
				,
				h.isContextual = function(e) {
					return this.tok.type === p.name && this.tok.value === e
				}
				,
				h.eatContextual = function(e) {
					return this.tok.value === e && this.eat(p.name)
				}
				,
				h.canInsertSemicolon = function() {
					return this.tok.type === p.eof || this.tok.type === p.braceR || l.test(this.input.slice(this.last.end, this.tok.start))
				}
				,
				h.semicolon = function() {
					return this.eat(p.semi)
				}
				,
				h.expect = function(e) {
					var t, r;
					if (this.eat(e))
						return !0;
					for (t = 1; 2 >= t; t++)
						if (this.lookAhead(t).type == e) {
							for (r = 0; t > r; r++)
								this.next();
							return !0
						}
				}
				,
				h.pushCx = function() {
					this.context.push(this.curIndent)
				}
				,
				h.popCx = function() {
					this.curIndent = this.context.pop()
				}
				,
				h.lineEnd = function(e) {
					for (; e < this.input.length && !c(this.input.charCodeAt(e)); )
						++e;
					return e
				}
				,
				h.indentationAfter = function(e) {
					for (var t, r = 0; ; ++e)
						if (t = this.input.charCodeAt(e),
						32 === t)
							++r;
						else {
							if (9 !== t)
								return r;
							r += this.options.tabSize
						}
				}
				,
				h.closes = function(e, t, r, n) {
					return this.tok.type === e || this.tok.type === p.eof ? !0 : r != this.curLineStart && this.curIndent < t && this.tokenStartsLine() && (!n || this.nextLineStart >= this.input.length || this.indentationAfter(this.nextLineStart) < t)
				}
				,
				h.tokenStartsLine = function() {
					for (var e, t = this.tok.start - 1; t >= this.curLineStart; --t)
						if (e = this.input.charCodeAt(t),
						9 !== e && 32 !== e)
							return !1;
					return !0
				}
			}
			, {
				"..": 2,
				"./state": 5
			}],
			5: [function(e, t, r) {
				"use strict";
				function n(e, t) {
					if (this.toks = i(e, t),
					this.options = this.toks.options,
					this.input = this.toks.input,
					this.tok = this.last = {
						type: a.eof,
						start: 0,
						end: 0
					},
					this.options.locations) {
						var r = this.toks.curPosition();
						this.tok.loc = new s(this.toks,r,r)
					}
					this.ahead = [],
					this.context = [],
					this.curIndent = 0,
					this.curLineStart = 0,
					this.nextLineStart = this.lineEnd(this.curLineStart) + 1
				}
				r.LooseParser = n,
				r.__esModule = !0;
				var o = e("..")
				, i = o.tokenizer
				, s = o.SourceLocation
				, a = o.tokTypes
			}
			, {
				"..": 2
			}],
			6: [function(e) {
				"use strict";
				var t = e("./state").LooseParser
				, r = e("./parseutil").isDummy
				, n = e("..")
				, o = n.getLineInfo
				, i = n.tokTypes
				, s = t.prototype;
				s.parseTopLevel = function() {
					var e = this.startNodeAt(this.options.locations ? [0, o(this.input, 0)] : 0);
					for (e.body = []; this.tok.type !== i.eof; )
						e.body.push(this.parseStatement());
					return this.last = this.tok,
					this.options.ecmaVersion >= 6 && (e.sourceType = this.options.sourceType),
					this.finishNode(e, "Program")
				}
				,
				s.parseStatement = function() {
					var e, t, n, o, s, a, l, c, p, h = this.tok.type, d = this.startNode();
					switch (h) {
					case i._break:
					case i._continue:
						return this.next(),
						e = h === i._break,
						this.semicolon() || this.canInsertSemicolon() ? d.label = null  : (d.label = this.tok.type === i.name ? this.parseIdent() : null ,
						this.semicolon()),
						this.finishNode(d, e ? "BreakStatement" : "ContinueStatement");
					case i._debugger:
						return this.next(),
						this.semicolon(),
						this.finishNode(d, "DebuggerStatement");
					case i._do:
						return this.next(),
						d.body = this.parseStatement(),
						d.test = this.eat(i._while) ? this.parseParenExpression() : this.dummyIdent(),
						this.semicolon(),
						this.finishNode(d, "DoWhileStatement");
					case i._for:
						return this.next(),
						this.pushCx(),
						this.expect(i.parenL),
						this.tok.type === i.semi ? this.parseFor(d, null ) : this.tok.type === i._var || this.tok.type === i._let || this.tok.type === i._const ? (t = this.parseVar(!0),
						1 !== t.declarations.length || this.tok.type !== i._in && !this.isContextual("of") ? this.parseFor(d, t) : this.parseForIn(d, t)) : (n = this.parseExpression(!0),
						this.tok.type === i._in || this.isContextual("of") ? this.parseForIn(d, this.toAssignable(n)) : this.parseFor(d, n));
					case i._function:
						return this.next(),
						this.parseFunction(d, !0);
					case i._if:
						return this.next(),
						d.test = this.parseParenExpression(),
						d.consequent = this.parseStatement(),
						d.alternate = this.eat(i._else) ? this.parseStatement() : null ,
						this.finishNode(d, "IfStatement");
					case i._return:
						return this.next(),
						this.eat(i.semi) || this.canInsertSemicolon() ? d.argument = null  : (d.argument = this.parseExpression(),
						this.semicolon()),
						this.finishNode(d, "ReturnStatement");
					case i._switch:
						for (o = this.curIndent,
						s = this.curLineStart,
						this.next(),
						d.discriminant = this.parseParenExpression(),
						d.cases = [],
						this.pushCx(),
						this.expect(i.braceL),
						a = void 0; !this.closes(i.braceR, o, s, !0); )
							this.tok.type === i._case || this.tok.type === i._default ? (l = this.tok.type === i._case,
							a && this.finishNode(a, "SwitchCase"),
							d.cases.push(a = this.startNode()),
							a.consequent = [],
							this.next(),
							a.test = l ? this.parseExpression() : null ,
							this.expect(i.colon)) : (a || (d.cases.push(a = this.startNode()),
							a.consequent = [],
							a.test = null ),
							a.consequent.push(this.parseStatement()));
						return a && this.finishNode(a, "SwitchCase"),
						this.popCx(),
						this.eat(i.braceR),
						this.finishNode(d, "SwitchStatement");
					case i._throw:
						return this.next(),
						d.argument = this.parseExpression(),
						this.semicolon(),
						this.finishNode(d, "ThrowStatement");
					case i._try:
						return this.next(),
						d.block = this.parseBlock(),
						d.handler = null ,
						this.tok.type === i._catch && (c = this.startNode(),
						this.next(),
						this.expect(i.parenL),
						c.param = this.toAssignable(this.parseExprAtom(), !0),
						this.expect(i.parenR),
						c.guard = null ,
						c.body = this.parseBlock(),
						d.handler = this.finishNode(c, "CatchClause")),
						d.finalizer = this.eat(i._finally) ? this.parseBlock() : null ,
						d.handler || d.finalizer ? this.finishNode(d, "TryStatement") : d.block;
					case i._var:
					case i._let:
					case i._const:
						return this.parseVar();
					case i._while:
						return this.next(),
						d.test = this.parseParenExpression(),
						d.body = this.parseStatement(),
						this.finishNode(d, "WhileStatement");
					case i._with:
						return this.next(),
						d.object = this.parseParenExpression(),
						d.body = this.parseStatement(),
						this.finishNode(d, "WithStatement");
					case i.braceL:
						return this.parseBlock();
					case i.semi:
						return this.next(),
						this.finishNode(d, "EmptyStatement");
					case i._class:
						return this.parseClass(!0);
					case i._import:
						return this.parseImport();
					case i._export:
						return this.parseExport();
					default:
						return p = this.parseExpression(),
						r(p) ? (this.next(),
						this.tok.type === i.eof ? this.finishNode(d, "EmptyStatement") : this.parseStatement()) : h === i.name && "Identifier" === p.type && this.eat(i.colon) ? (d.body = this.parseStatement(),
						d.label = p,
						this.finishNode(d, "LabeledStatement")) : (d.expression = p,
						this.semicolon(),
						this.finishNode(d, "ExpressionStatement"))
					}
				}
				,
				s.parseBlock = function() {
					var e, t, r = this.startNode();
					for (this.pushCx(),
					this.expect(i.braceL),
					e = this.curIndent,
					t = this.curLineStart,
					r.body = []; !this.closes(i.braceR, e, t, !0); )
						r.body.push(this.parseStatement());
					return this.popCx(),
					this.eat(i.braceR),
					this.finishNode(r, "BlockStatement")
				}
				,
				s.parseFor = function(e, t) {
					return e.init = t,
					e.test = e.update = null ,
					this.eat(i.semi) && this.tok.type !== i.semi && (e.test = this.parseExpression()),
					this.eat(i.semi) && this.tok.type !== i.parenR && (e.update = this.parseExpression()),
					this.popCx(),
					this.expect(i.parenR),
					e.body = this.parseStatement(),
					this.finishNode(e, "ForStatement")
				}
				,
				s.parseForIn = function(e, t) {
					var r = this.tok.type === i._in ? "ForInStatement" : "ForOfStatement";
					return this.next(),
					e.left = t,
					e.right = this.parseExpression(),
					this.popCx(),
					this.expect(i.parenR),
					e.body = this.parseStatement(),
					this.finishNode(e, r)
				}
				,
				s.parseVar = function(e) {
					var t, r = this.startNode();
					r.kind = this.tok.type.keyword,
					this.next(),
					r.declarations = [];
					do
						t = this.startNode(),
						t.id = this.options.ecmaVersion >= 6 ? this.toAssignable(this.parseExprAtom(), !0) : this.parseIdent(),
						t.init = this.eat(i.eq) ? this.parseMaybeAssign(e) : null ,
						r.declarations.push(this.finishNode(t, "VariableDeclarator"));
					while (this.eat(i.comma));return r.declarations.length || (t = this.startNode(),
					t.id = this.dummyIdent(),
					r.declarations.push(this.finishNode(t, "VariableDeclarator"))),
					e || this.semicolon(),
					this.finishNode(r, "VariableDeclaration")
				}
				,
				s.parseClass = function(e) {
					var t, n, o, s, a = this.startNode();
					for (this.next(),
					a.id = this.tok.type === i.name ? this.parseIdent() : e ? this.dummyIdent() : null ,
					a.superClass = this.eat(i._extends) ? this.parseExpression() : null ,
					a.body = this.startNode(),
					a.body.body = [],
					this.pushCx(),
					t = this.curIndent + 1,
					n = this.curLineStart,
					this.eat(i.braceL),
					this.curIndent + 1 < t && (t = this.curIndent,
					n = this.curLineStart); !this.closes(i.braceR, t, n); )
						if (!this.semicolon()) {
							if (o = this.startNode(),
							s = void 0,
							this.options.ecmaVersion >= 6 && (o["static"] = !1,
							s = this.eat(i.star)),
							this.parsePropertyName(o),
							r(o.key)) {
								r(this.parseMaybeAssign()) && this.next(),
								this.eat(i.comma);
								continue
							}
							"Identifier" !== o.key.type || o.computed || "static" !== o.key.name || this.tok.type == i.parenL || this.tok.type == i.braceL ? o["static"] = !1 : (o["static"] = !0,
							s = this.eat(i.star),
							this.parsePropertyName(o)),
							this.options.ecmaVersion >= 5 && "Identifier" === o.key.type && !o.computed && ("get" === o.key.name || "set" === o.key.name) && this.tok.type !== i.parenL && this.tok.type !== i.braceL ? (o.kind = o.key.name,
							this.parsePropertyName(o),
							o.value = this.parseMethod(!1)) : (o.kind = o.computed || o["static"] || s || ("Identifier" !== o.key.type || "constructor" !== o.key.name) && ("Literal" !== o.key.type || "constructor" !== o.key.value) ? "method" : "constructor",
							o.value = this.parseMethod(s)),
							a.body.body.push(this.finishNode(o, "MethodDefinition"))
						}
					return this.popCx(),
					this.eat(i.braceR) || (this.last.end = this.tok.start,
					this.options.locations && (this.last.loc.end = this.tok.loc.start)),
					this.semicolon(),
					this.finishNode(a.body, "ClassBody"),
					this.finishNode(a, e ? "ClassDeclaration" : "ClassExpression")
				}
				,
				s.parseFunction = function(e, t) {
					return this.initFunction(e),
					this.options.ecmaVersion >= 6 && (e.generator = this.eat(i.star)),
					this.tok.type === i.name ? e.id = this.parseIdent() : t && (e.id = this.dummyIdent()),
					e.params = this.parseFunctionParams(),
					e.body = this.parseBlock(),
					this.finishNode(e, t ? "FunctionDeclaration" : "FunctionExpression")
				}
				,
				s.parseExport = function() {
					var e, t = this.startNode();
					if (this.next(),
					this.eat(i.star))
						return t.source = this.eatContextual("from") ? this.parseExprAtom() : null ,
						this.finishNode(t, "ExportAllDeclaration");
					if (this.eat(i._default)) {
						if (e = this.parseMaybeAssign(),
						e.id)
							switch (e.type) {
							case "FunctionExpression":
								e.type = "FunctionDeclaration";
								break;
							case "ClassExpression":
								e.type = "ClassDeclaration"
							}
						return t.declaration = e,
						this.semicolon(),
						this.finishNode(t, "ExportDefaultDeclaration")
					}
					return this.tok.type.keyword ? (t.declaration = this.parseStatement(),
					t.specifiers = [],
					t.source = null ) : (t.declaration = null ,
					t.specifiers = this.parseExportSpecifierList(),
					t.source = this.eatContextual("from") ? this.parseExprAtom() : null ,
					this.semicolon()),
					this.finishNode(t, "ExportNamedDeclaration")
				}
				,
				s.parseImport = function() {
					var e, t = this.startNode();
					return this.next(),
					this.tok.type === i.string ? (t.specifiers = [],
					t.source = this.parseExprAtom(),
					t.kind = "") : (e = void 0,
					this.tok.type === i.name && "from" !== this.tok.value && (e = this.startNode(),
					e.local = this.parseIdent(),
					this.finishNode(e, "ImportDefaultSpecifier"),
					this.eat(i.comma)),
					t.specifiers = this.parseImportSpecifierList(),
					t.source = this.eatContextual("from") ? this.parseExprAtom() : null ,
					e && t.specifiers.unshift(e)),
					this.semicolon(),
					this.finishNode(t, "ImportDeclaration")
				}
				,
				s.parseImportSpecifierList = function() {
					var e, t = [];
					if (this.tok.type === i.star)
						e = this.startNode(),
						this.next(),
						this.eatContextual("as") && (e.local = this.parseIdent()),
						t.push(this.finishNode(e, "ImportNamespaceSpecifier"));
					else {
						var r = this.curIndent
						, n = this.curLineStart
						, o = this.nextLineStart;
						for (this.pushCx(),
						this.eat(i.braceL),
						this.curLineStart > o && (o = this.curLineStart); !this.closes(i.braceR, r + (this.curLineStart <= o ? 1 : 0), n); ) {
							if (e = this.startNode(),
							this.eat(i.star))
								this.eatContextual("as") && (e.local = this.parseIdent()),
								this.finishNode(e, "ImportNamespaceSpecifier");
							else {
								if (this.isContextual("from"))
									break;
								e.imported = this.parseIdent(),
								e.local = this.eatContextual("as") ? this.parseIdent() : e.imported,
								this.finishNode(e, "ImportSpecifier")
							}
							t.push(e),
							this.eat(i.comma)
						}
						this.eat(i.braceR),
						this.popCx()
					}
					return t
				}
				,
				s.parseExportSpecifierList = function() {
					var e, t = [], r = this.curIndent, n = this.curLineStart, o = this.nextLineStart;
					for (this.pushCx(),
					this.eat(i.braceL),
					this.curLineStart > o && (o = this.curLineStart); !this.closes(i.braceR, r + (this.curLineStart <= o ? 1 : 0), n) && !this.isContextual("from"); )
						e = this.startNode(),
						e.local = this.parseIdent(),
						e.exported = this.eatContextual("as") ? this.parseIdent() : e.local,
						this.finishNode(e, "ExportSpecifier"),
						t.push(e),
						this.eat(i.comma);
					return this.eat(i.braceR),
					this.popCx(),
					t
				}
			}
			, {
				"..": 2,
				"./parseutil": 4,
				"./state": 5
			}],
			7: [function(e) {
				"use strict";
				function t(e) {
					return 14 > e && e > 8 || 32 === e || 160 === e || i(e)
				}
				var r = e("..")
				, n = r.tokTypes
				, o = r.Token
				, i = r.isNewLine
				, s = r.SourceLocation
				, a = r.getLineInfo
				, l = r.lineBreakG
				, c = e("./state").LooseParser
				, p = c.prototype;
				p.next = function() {
					if (this.last = this.tok,
					this.tok = this.ahead.length ? this.ahead.shift() : this.readToken(),
					this.tok.start >= this.nextLineStart) {
						for (; this.tok.start >= this.nextLineStart; )
							this.curLineStart = this.nextLineStart,
							this.nextLineStart = this.lineEnd(this.curLineStart) + 1;
						this.curIndent = this.indentationAfter(this.curLineStart)
					}
				}
				,
				p.readToken = function() {
					for (var e, r; ; )
						try {
							return this.toks.next(),
							this.toks.type === n.dot && "." === this.input.substr(this.toks.end, 1) && this.options.ecmaVersion >= 6 && (this.toks.end++,
							this.toks.type = n.ellipsis),
							new o(this.toks)
						} catch (l) {
							if (!(l instanceof SyntaxError))
								throw l;
							var c = l.message
							, p = l.raisedAt
							, h = !0;
							if (/unterminated/i.test(c))
								if (p = this.lineEnd(l.pos + 1),
								/string/.test(c))
									h = {
										start: l.pos,
										end: p,
										type: n.string,
										value: this.input.slice(l.pos + 1, p)
									};
								else if (/regular expr/i.test(c)) {
									e = this.input.slice(l.pos, p);
									try {
										e = new RegExp(e)
									} catch (l) {}
									h = {
										start: l.pos,
										end: p,
										type: n.regexp,
										value: e
									}
								} else
									h = /template/.test(c) ? {
										start: l.pos,
										end: p,
										type: n.template,
										value: this.input.slice(l.pos, p)
									} : !1;
							else if (/invalid (unicode|regexp|number)|expecting unicode|octal literal|is reserved|directly after number|expected number in radix/i.test(c))
								for (; p < this.input.length && !t(this.input.charCodeAt(p)); )
									++p;
							else if (/character escape|expected hexadecimal/i.test(c))
								for (; p < this.input.length && (r = this.input.charCodeAt(p++),
								34 !== r && 39 !== r && !i(r)); )
									;
							else if (/unexpected character/i.test(c))
								p++,
								h = !1;
							else {
								if (!/regular expression/i.test(c))
									throw l;
								h = !0
							}
							if (this.resetTo(p),
							h === !0 && (h = {
								start: p,
								end: p,
								type: n.name,
								value: "✖"
							}),
							h)
								return this.options.locations && (h.loc = new s(this.toks,a(this.input, h.start),a(this.input, h.end))),
								h
						}
				}
				,
				p.resetTo = function(e) {
					var t, r;
					if (this.toks.pos = e,
					t = this.input.charAt(e - 1),
					this.toks.exprAllowed = !t || /[\[\{\(,;:?\/*=+\-~!|&%^<>]/.test(t) || /[enwfd]/.test(t) && /\b(keywords|case|else|return|throw|new|in|(instance|type)of|delete|void)$/.test(this.input.slice(e - 10, e)),
					this.options.locations)
						for (this.toks.curLine = 1,
						this.toks.lineStart = l.lastIndex = 0,
						r = void 0; (r = l.exec(this.input)) && r.index < e; )
							++this.toks.curLine,
							this.toks.lineStart = r.index + r[0].length
				}
				,
				p.lookAhead = function(e) {
					for (; e > this.ahead.length; )
						this.ahead.push(this.readToken());
					return this.ahead[e - 1]
				}
			}
			, {
				"..": 2,
				"./state": 5
			}]
		}, {}, [1])(1)
	}),
	function(e) {
		if ("object" == typeof exports && "undefined" != typeof module)
			module.exports = e();
		else if ("function" == typeof define && define.amd)
			define([], e);
		else {
			var t;
			t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this,
			(t.acorn || (t.acorn = {})).walk = e()
		}
	}(function() {
		return function e(t, r, n) {
			function o(s, a) {
				var l, c, p;
				if (!r[s]) {
					if (!t[s]) {
						if (l = "function" == typeof require && require,
						!a && l)
							return l(s, !0);
						if (i)
							return i(s, !0);
						throw c = new Error("Cannot find module '" + s + "'"),
						c.code = "MODULE_NOT_FOUND",
						c
					}
					p = r[s] = {
						exports: {}
					},
					t[s][0].call(p.exports, function(e) {
						var r = t[s][1][e];
						return o(r ? r : e)
					}, p, p.exports, e, t, r, n)
				}
				return r[s].exports
			}
			for (var i = "function" == typeof require && require, s = 0; s < n.length; s++)
				o(n[s]);
			return o
		}({
			1: [function(e, t, r) {
				"use strict";
				function n(e, t, n, o) {
					n || (n = r.base),
					function i(e, r, o) {
						var s = o || e.type
						, a = t[s];
						n[s](e, r, i),
						a && a(e, r)
					}(e, o)
				}
				function o(e, t, n, o) {
					n || (n = r.base),
					o || (o = []),
					function i(e, r, o) {
						var s = o || e.type
						, a = t[s];
						e != r[r.length - 1] && (r = r.slice(),
						r.push(e)),
						n[s](e, r, i),
						a && a(e, r)
					}(e, o)
				}
				function i(e, t, n, o) {
					var i = n ? r.make(n, o) : o;
					!function s(e, t, r) {
						i[r || e.type](e, t, s)
					}(e, t)
				}
				function s(e) {
					return "string" == typeof e ? function(t) {
						return t == e
					}
					: e ? e : function() {
						return !0
					}
				}
				function a(e, t, n, o, i, a) {
					o = s(o),
					i || (i = r.base);
					try {
						!function c(e, r, s) {
							var a = s || e.type;
							if ((null  == t || e.start <= t) && (null  == n || e.end >= n) && i[a](e, r, c),
							o(a, e) && (null  == t || e.start == t) && (null  == n || e.end == n))
								throw new f(e,r)
						}(e, a)
					} catch (l) {
						if (l instanceof f)
							return l;
						throw l
					}
				}
				function l(e, t, n, o, i) {
					n = s(n),
					o || (o = r.base);
					try {
						!function l(e, r, i) {
							var s = i || e.type;
							if (!(e.start > t || e.end < t || (o[s](e, r, l),
							!n(s, e))))
								throw new f(e,r)
						}(e, i)
					} catch (a) {
						if (a instanceof f)
							return a;
						throw a
					}
				}
				function c(e, t, n, o, i) {
					n = s(n),
					o || (o = r.base);
					try {
						!function l(e, r, i) {
							if (!(e.end < t)) {
								var s = i || e.type;
								if (e.start >= t && n(s, e))
									throw new f(e,r);
								o[s](e, r, l)
							}
						}(e, i)
					} catch (a) {
						if (a instanceof f)
							return a;
						throw a
					}
				}
				function p(e, t, n, o, i) {
					n = s(n),
					o || (o = r.base);
					var a = void 0;
					return function l(e, r, i) {
						if (!(e.start > t)) {
							var s = i || e.type;
							e.end <= t && (!a || a.node.end < e.end) && n(s, e) && (a = new f(e,r)),
							o[s](e, r, l)
						}
					}(e, i),
					a
				}
				function h(e, t) {
					var n, o;
					t || (t = r.base),
					n = {};
					for (o in t)
						n[o] = t[o];
					for (o in e)
						n[o] = e[o];
					return n
				}
				function d(e, t, r) {
					r(e, t)
				}
				function u() {}
				var f, m, g = function(e, t) {
					if (!(e instanceof t))
						throw new TypeError("Cannot call a class as a function")
				}
				;
				r.simple = n,
				r.ancestor = o,
				r.recursive = i,
				r.findNodeAt = a,
				r.findNodeAround = l,
				r.findNodeAfter = c,
				r.findNodeBefore = p,
				r.make = h,
				r.__esModule = !0,
				f = function y(e, t) {
					g(this, y),
					this.node = e,
					this.state = t
				}
				,
				m = {},
				r.base = m,
				m.Program = m.BlockStatement = function(e, t, r) {
					for (var n = 0; n < e.body.length; ++n)
						r(e.body[n], t, "Statement")
				}
				,
				m.Statement = d,
				m.EmptyStatement = u,
				m.ExpressionStatement = m.ParenthesizedExpression = function(e, t, r) {
					return r(e.expression, t, "Expression")
				}
				,
				m.IfStatement = function(e, t, r) {
					r(e.test, t, "Expression"),
					r(e.consequent, t, "Statement"),
					e.alternate && r(e.alternate, t, "Statement")
				}
				,
				m.LabeledStatement = function(e, t, r) {
					return r(e.body, t, "Statement")
				}
				,
				m.BreakStatement = m.ContinueStatement = u,
				m.WithStatement = function(e, t, r) {
					r(e.object, t, "Expression"),
					r(e.body, t, "Statement")
				}
				,
				m.SwitchStatement = function(e, t, r) {
					var n, o, i;
					for (r(e.discriminant, t, "Expression"),
					n = 0; n < e.cases.length; ++n)
						for (o = e.cases[n],
						o.test && r(o.test, t, "Expression"),
						i = 0; i < o.consequent.length; ++i)
							r(o.consequent[i], t, "Statement")
				}
				,
				m.ReturnStatement = m.YieldExpression = function(e, t, r) {
					e.argument && r(e.argument, t, "Expression")
				}
				,
				m.ThrowStatement = m.SpreadElement = m.RestElement = function(e, t, r) {
					return r(e.argument, t, "Expression")
				}
				,
				m.TryStatement = function(e, t, r) {
					r(e.block, t, "Statement"),
					e.handler && r(e.handler.body, t, "ScopeBody"),
					e.finalizer && r(e.finalizer, t, "Statement")
				}
				,
				m.WhileStatement = m.DoWhileStatement = function(e, t, r) {
					r(e.test, t, "Expression"),
					r(e.body, t, "Statement")
				}
				,
				m.ForStatement = function(e, t, r) {
					e.init && r(e.init, t, "ForInit"),
					e.test && r(e.test, t, "Expression"),
					e.update && r(e.update, t, "Expression"),
					r(e.body, t, "Statement")
				}
				,
				m.ForInStatement = m.ForOfStatement = function(e, t, r) {
					r(e.left, t, "ForInit"),
					r(e.right, t, "Expression"),
					r(e.body, t, "Statement")
				}
				,
				m.ForInit = function(e, t, r) {
					"VariableDeclaration" == e.type ? r(e, t) : r(e, t, "Expression")
				}
				,
				m.DebuggerStatement = u,
				m.FunctionDeclaration = function(e, t, r) {
					return r(e, t, "Function")
				}
				,
				m.VariableDeclaration = function(e, t, r) {
					for (var n, o = 0; o < e.declarations.length; ++o)
						n = e.declarations[o],
						n.init && r(n.init, t, "Expression")
				}
				,
				m.Function = function(e, t, r) {
					return r(e.body, t, "ScopeBody")
				}
				,
				m.ScopeBody = function(e, t, r) {
					return r(e, t, "Statement")
				}
				,
				m.Expression = d,
				m.ThisExpression = m.Super = m.MetaProperty = u,
				m.ArrayExpression = m.ArrayPattern = function(e, t, r) {
					for (var n, o = 0; o < e.elements.length; ++o)
						n = e.elements[o],
						n && r(n, t, "Expression")
				}
				,
				m.ObjectExpression = m.ObjectPattern = function(e, t, r) {
					for (var n = 0; n < e.properties.length; ++n)
						r(e.properties[n], t)
				}
				,
				m.FunctionExpression = m.ArrowFunctionExpression = m.FunctionDeclaration,
				m.SequenceExpression = m.TemplateLiteral = function(e, t, r) {
					for (var n = 0; n < e.expressions.length; ++n)
						r(e.expressions[n], t, "Expression")
				}
				,
				m.UnaryExpression = m.UpdateExpression = function(e, t, r) {
					r(e.argument, t, "Expression")
				}
				,
				m.BinaryExpression = m.AssignmentExpression = m.AssignmentPattern = m.LogicalExpression = function(e, t, r) {
					r(e.left, t, "Expression"),
					r(e.right, t, "Expression")
				}
				,
				m.ConditionalExpression = function(e, t, r) {
					r(e.test, t, "Expression"),
					r(e.consequent, t, "Expression"),
					r(e.alternate, t, "Expression")
				}
				,
				m.NewExpression = m.CallExpression = function(e, t, r) {
					if (r(e.callee, t, "Expression"),
					e.arguments)
						for (var n = 0; n < e.arguments.length; ++n)
							r(e.arguments[n], t, "Expression")
				}
				,
				m.MemberExpression = function(e, t, r) {
					r(e.object, t, "Expression"),
					e.computed && r(e.property, t, "Expression")
				}
				,
				m.ExportNamedDeclaration = m.ExportDefaultDeclaration = function(e, t, r) {
					return r(e.declaration, t)
				}
				,
				m.ImportDeclaration = function(e, t, r) {
					for (var n = 0; n < e.specifiers.length; n++)
						r(e.specifiers[n], t)
				}
				,
				m.ImportSpecifier = m.ImportDefaultSpecifier = m.ImportNamespaceSpecifier = m.Identifier = m.Literal = u,
				m.TaggedTemplateExpression = function(e, t, r) {
					r(e.tag, t, "Expression"),
					r(e.quasi, t)
				}
				,
				m.ClassDeclaration = m.ClassExpression = function(e, t, r) {
					e.superClass && r(e.superClass, t, "Expression");
					for (var n = 0; n < e.body.body.length; n++)
						r(e.body.body[n], t)
				}
				,
				m.MethodDefinition = m.Property = function(e, t, r) {
					e.computed && r(e.key, t, "Expression"),
					r(e.value, t, "Expression")
				}
				,
				m.ComprehensionExpression = function(e, t, r) {
					for (var n = 0; n < e.blocks.length; n++)
						r(e.blocks[n].right, t, "Expression");
					r(e.body, t, "Expression")
				}
			}
			, {}]
		}, {}, [1])(1)
	}),
	function() {
		Object.create = Object.create || function() {
			function e() {}
			var t, r;
			return {
				__proto__: null 
			} instanceof Object ? (t = document.body.appendChild(document.createElement("iframe")),
			t.src = "javascript:",
			r = t.contentWindow.Object.prototype,
			delete r.hasOwnProperty,
			delete r.isPrototypeOf,
			delete r.propertyIsEnumerable,
			delete r.valueOf,
			delete r.toString,
			delete r.toLocaleString,
			delete r.constructor,
			function(t) {
				return e.prototype = t || r,
				new e
			}
			) : function(e) {
				return {
					__proto__: e
				}
			}
		}();
		var e = Array.prototype;
		e.some = e.some || function(e) {
			for (var t = 0; t < this.length; ++t)
				if (e(this[t], t))
					return !0
		}
		,
		e.forEach = e.forEach || function(e) {
			for (var t = 0; t < this.length; ++t)
				e(this[t], t)
		}
		,
		e.indexOf = e.indexOf || function(e, t) {
			for (var r = t || 0; r < this.length; ++r)
				if (this[r] === e)
					return r;
			return -1
		}
		,
		e.lastIndexOf = e.lastIndexOf || function(e, t) {
			for (var r = null  == t ? this.length - 1 : t; r >= 0; ++r)
				if (this[r] === e)
					return r;
			return -1
		}
		,
		e.map = e.map || function(e) {
			for (var t = [], r = 0; r < this.length; ++r)
				t.push(e(this[r], r));
			return t
		}
		,
		Array.isArray = Array.isArray || function(e) {
			return "[object Array]" == Object.prototype.toString.call(e)
		}
		,
		String.prototype.trim = String.prototype.trim || function() {
			for (var e = 0, t = this.length; /\s/.test(this.charAt(e)); )
				++e;
			for (; /\s/.test(this.charAt(t - 1)); )
				--t;
			return this.slice(e, t)
		}
		,
		window.JSON || function() {
			function e(e) {
				var t, r, n, o = "json" == e;
				if (o || "json-stringify" == e || "json-parse" == e) {
					if ("json-stringify" == e || o) {
						if (t = "function" == typeof j.stringify && g) {
							(n = function() {
								return 1
							}
							).toJSON = n;
							try {
								t = "0" === j.stringify(0) && "0" === j.stringify(new Number) && '""' == j.stringify(new String) && j.stringify(T) === w && j.stringify(w) === w && j.stringify() === w && "1" === j.stringify(n) && "[1]" == j.stringify([n]) && "[null]" == j.stringify([w]) && "null" == j.stringify(x) && "[null,null,null]" == j.stringify([w, T, x]) && '{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}' == j.stringify({
									A: [n, S, !1, x, "\x00\b\n\f\r	"]
								}) && "1" === j.stringify(x, n) && "[\n 1,\n 2\n]" == j.stringify([1, 2], x, 1) && '"-271821-04-20T00:00:00.000Z"' == j.stringify(new Date(-864e13)) && '"+275760-09-13T00:00:00.000Z"' == j.stringify(new Date(864e13)) && '"-000001-01-01T00:00:00.000Z"' == j.stringify(new Date(-621987552e5)) && '"1969-12-31T23:59:59.999Z"' == j.stringify(new Date(-1))
							} catch (i) {
								t = !1
							}
						}
						if (!o)
							return t
					}
					if ("json-parse" == e || o) {
						if ("function" == typeof j.parse)
							try {
								if (0 === j.parse("0") && !j.parse(!1) && (n = j.parse('{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'),
								r = 5 == n.a.length && 1 == n.a[0])) {
									try {
										r = !j.parse('"	"')
									} catch (s) {}
									if (r)
										try {
											r = 1 != j.parse("01")
										} catch (a) {}
								}
							} catch (l) {
								r = !1
							}
						if (!o)
							return r
					}
					return t && r
				}
			}
			var t, r, n, o, i, s, a, l, c, p, h, d, u, f, m, g, y, b, v, w = void 0, S = !0, x = null , T = {}.toString, O = "function" == typeof define && define.c, j = !O && "object" == typeof exports && exports;
			j || O ? "object" == typeof JSON && JSON ? O ? j = JSON : (j.stringify = JSON.stringify,
			j.parse = JSON.parse) : O && (j = this.JSON = {}) : j = this.JSON || (this.JSON = {}),
			g = new Date(-0xc782b5b800cec);
			try {
				g = -109252 == g.getUTCFullYear() && 0 === g.getUTCMonth() && 1 == g.getUTCDate() && 10 == g.getUTCHours() && 37 == g.getUTCMinutes() && 6 == g.getUTCSeconds() && 708 == g.getUTCMilliseconds()
			} catch (E) {}
			e("json") || (g || (y = Math.floor,
			b = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
			v = function(e, t) {
				return b[t] + 365 * (e - 1970) + y((e - 1969 + (t = +(t > 1))) / 4) - y((e - 1901 + t) / 100) + y((e - 1601 + t) / 400)
			}
			),
			(t = {}.hasOwnProperty) || (t = function(e) {
				var r, n = {};
				return (n.__proto__ = x,
				n.__proto__ = {
					toString: 1
				},
				n).toString != T ? t = function(e) {
					var t = this.__proto__
					, e = e in (this.__proto__ = x,
					this);
					return this.__proto__ = t,
					e
				}
				: (r = n.constructor,
				t = function(e) {
					var t = (this.constructor || r).prototype;
					return e in this && !(e in t && this[e] === t[e])
				}
				),
				n = x,
				t.call(this, e)
			}
			),
			r = function(e, r) {
				var n, o, i, s = 0;
				(n = function() {
					this.valueOf = 0
				}
				).prototype.valueOf = 0,
				o = new n;
				for (i in o)
					t.call(o, i) && s++;
				n = o = x,
				s ? s = 2 == s ? function(e, r) {
					var n = {}
					, o = "[object Function]" == T.call(e);
					for (var i in e)
						o && "prototype" == i || t.call(n, i) || !(n[i] = 1) || !t.call(e, i) || r(i)
				}
				: function(e, r) {
					var n, o, i = "[object Function]" == T.call(e);
					for (n in e)
						i && "prototype" == n || !t.call(e, n) || (o = "constructor" === n) || r(n);
					(o || t.call(e, n = "constructor")) && r(n)
				}
				: (o = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"],
				s = function(e, r) {
					var n = "[object Function]" == T.call(e);
					for (var i in e)
						n && "prototype" == i || !t.call(e, i) || r(i);
					for (n = o.length; i = o[--n]; t.call(e, i) && r(i))
						;
				}
				),
				s(e, r)
			}
			,
			e("json-stringify") || (n = {
				"\\": "\\\\",
				'"': '\\"',
				"\b": "\\b",
				"\f": "\\f",
				"\n": "\\n",
				"\r": "\\r",
				"	": "\\t"
			},
			o = function(e, t) {
				return ("000000" + (t || 0)).slice(-e)
			}
			,
			i = function(e) {
				for (var t, r = '"', i = 0; t = e.charAt(i); i++)
					r += '\\"\b\f\n\r	'.indexOf(t) > -1 ? n[t] : n[t] = " " > t ? "\\u00" + o(2, t.charCodeAt(0).toString(16)) : t;
				return r + '"'
			}
			,
			s = function(e, n, a, l, c, p, h) {
				var d, u, f, m, g, b, O, j, E, M = n[e];
				if ("object" == typeof M && M)
					if (d = T.call(M),
					"[object Date]" != d || t.call(M, "toJSON"))
						"function" == typeof M.toJSON && ("[object Number]" != d && "[object String]" != d && "[object Array]" != d || t.call(M, "toJSON")) && (M = M.toJSON(e));
					else if (M > -1 / 0 && 1 / 0 > M) {
						if (v) {
							for (f = y(M / 864e5),
							d = y(f / 365.2425) + 1970 - 1; v(d + 1, 0) <= f; d++)
								;
							for (u = y((f - v(d, 0)) / 30.42); v(d, u + 1) <= f; u++)
								;
							f = 1 + f - v(d, u),
							m = (M % 864e5 + 864e5) % 864e5,
							g = y(m / 36e5) % 24,
							b = y(m / 6e4) % 60,
							O = y(m / 1e3) % 60,
							m %= 1e3
						} else
							d = M.getUTCFullYear(),
							u = M.getUTCMonth(),
							f = M.getUTCDate(),
							g = M.getUTCHours(),
							b = M.getUTCMinutes(),
							O = M.getUTCSeconds(),
							m = M.getUTCMilliseconds();
						M = (0 >= d || d >= 1e4 ? (0 > d ? "-" : "+") + o(6, 0 > d ? -d : d) : o(4, d)) + "-" + o(2, u + 1) + "-" + o(2, f) + "T" + o(2, g) + ":" + o(2, b) + ":" + o(2, O) + "." + o(3, m) + "Z"
					} else
						M = x;
				if (a && (M = a.call(n, e, M)),
				M === x)
					return "null";
				if (d = T.call(M),
				"[object Boolean]" == d)
					return "" + M;
				if ("[object Number]" == d)
					return M > -1 / 0 && 1 / 0 > M ? "" + M : "null";
				if ("[object String]" == d)
					return i(M);
				if ("object" == typeof M) {
					for (e = h.length; e--; )
						if (h[e] === M)
							throw TypeError();
					if (h.push(M),
					j = [],
					n = p,
					p += c,
					"[object Array]" == d) {
						for (u = 0,
						e = M.length; e > u; E || (E = S),
						u++)
							d = s(u, M, a, l, c, p, h),
							j.push(d === w ? "null" : d);
						e = E ? c ? "[\n" + p + j.join(",\n" + p) + "\n" + n + "]" : "[" + j.join(",") + "]" : "[]"
					} else
						r(l || M, function(e) {
							var t = s(e, M, a, l, c, p, h);
							t !== w && j.push(i(e) + ":" + (c ? " " : "") + t),
							E || (E = S)
						}),
						e = E ? c ? "{\n" + p + j.join(",\n" + p) + "\n" + n + "}" : "{" + j.join(",") + "}" : "{}";
					return h.pop(),
					e
				}
			}
			,
			j.stringify = function(e, t, r) {
				var n, o, i, a, l, c;
				if ("function" == typeof t || "object" == typeof t && t)
					if ("[object Function]" == T.call(t))
						o = t;
					else if ("[object Array]" == T.call(t))
						for (i = {},
						a = 0,
						l = t.length; l > a; c = t[a++],
						("[object String]" == T.call(c) || "[object Number]" == T.call(c)) && (i[c] = 1))
							;
				if (r)
					if ("[object Number]" == T.call(r)) {
						if ((r -= r % 1) > 0)
							for (n = "",
							r > 10 && (r = 10); n.length < r; n += " ")
								;
					} else
						"[object String]" == T.call(r) && (n = r.length <= 10 ? r : r.slice(0, 10));
				return s("", (c = {},
				c[""] = e,
				c), o, i, n, "", [])
			}
			),
			e("json-parse") || (a = String.fromCharCode,
			l = {
				"\\": "\\",
				'"': '"',
				"/": "/",
				b: "\b",
				t: "	",
				n: "\n",
				f: "\f",
				r: "\r"
			},
			c = function() {
				throw f = m = x,
				SyntaxError()
			}
			,
			p = function() {
				for (var e, t, r, n, o, i = m, s = i.length; s > f; )
					if (e = i.charAt(f),
					"	\r\n ".indexOf(e) > -1)
						f++;
					else {
						if ("{}[]:,".indexOf(e) > -1)
							return f++,
							e;
						if ('"' == e) {
							for (t = "@",
							f++; s > f; )
								if (e = i.charAt(f),
								" " > e)
									c();
								else if ("\\" == e)
									if (e = i.charAt(++f),
									'\\"/btnfr'.indexOf(e) > -1)
										t += l[e],
										f++;
									else if ("u" == e) {
										for (r = ++f,
										n = f + 4; n > f; f++)
											e = i.charAt(f),
											e >= "0" && "9" >= e || e >= "a" && "f" >= e || e >= "A" && "F" >= e || c();
										t += a("0x" + i.slice(r, f))
									} else
										c();
								else {
									if ('"' == e)
										break;
									t += e,
									f++
								}
							if ('"' == i.charAt(f))
								return f++,
								t
						} else {
							if (r = f,
							"-" == e && (o = S,
							e = i.charAt(++f)),
							e >= "0" && "9" >= e) {
								for ("0" == e && (e = i.charAt(f + 1),
								e >= "0" && "9" >= e) && c(); s > f && (e = i.charAt(f),
								e >= "0" && "9" >= e); f++)
									;
								if ("." == i.charAt(f)) {
									for (n = ++f; s > n && (e = i.charAt(n),
									e >= "0" && "9" >= e); n++)
										;
									n == f && c(),
									f = n
								}
								if (e = i.charAt(f),
								"e" == e || "E" == e) {
									for (e = i.charAt(++f),
									("+" == e || "-" == e) && f++,
									n = f; s > n && (e = i.charAt(n),
									e >= "0" && "9" >= e); n++)
										;
									n == f && c(),
									f = n
								}
								return +i.slice(r, f)
							}
							if (o && c(),
							"true" == i.slice(f, f + 4))
								return f += 4,
								S;
							if ("false" == i.slice(f, f + 5))
								return f += 5,
								!1;
							if ("null" == i.slice(f, f + 4))
								return f += 4,
								x
						}
						c()
					}
				return "$"
			}
			,
			h = function(e) {
				var t, r;
				if ("$" == e && c(),
				"string" == typeof e) {
					if ("@" == e.charAt(0))
						return e.slice(1);
					if ("[" == e) {
						for (t = []; e = p(),
						"]" != e; r || (r = S))
							r && ("," == e ? (e = p(),
							"]" == e && c()) : c()),
							"," == e && c(),
							t.push(h(e));
						return t
					}
					if ("{" == e) {
						for (t = {}; e = p(),
						"}" != e; r || (r = S))
							r && ("," == e ? (e = p(),
							"}" == e && c()) : c()),
							("," == e || "string" != typeof e || "@" != e.charAt(0) || ":" != p()) && c(),
							t[e.slice(1)] = h(p());
						return t
					}
					c()
				}
				return e
			}
			,
			u = function(e, t, r) {
				r = d(e, t, r),
				r === w ? delete e[t] : e[t] = r
			}
			,
			d = function(e, t, n) {
				var o, i = e[t];
				if ("object" == typeof i && i)
					if ("[object Array]" == T.call(i))
						for (o = i.length; o--; )
							u(i, o, n);
					else
						r(i, function(e) {
							u(i, e, n)
						});
				return n.call(e, t, i)
			}
			,
			j.parse = function(e, t) {
				var r, n;
				return f = 0,
				m = e,
				r = h(p()),
				"$" != p() && c(),
				f = m = x,
				t && "[object Function]" == T.call(t) ? d((n = {},
				n[""] = r,
				n), "", t) : r
			}
			)),
			O && define(function() {
				return j
			})
		}()
	}(),
	function(e, t) {
		return "object" == typeof exports && "object" == typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : void t((e.tern || (e.tern = {})).signal = {})
	}(this, function(e) {
		function t(e, t) {
			var r = this._handlers || (this._handlers = Object.create(null ));
			(r[e] || (r[e] = [])).push(t)
		}
		function r(e, t) {
			var r, n = this._handlers && this._handlers[e];
			if (n)
				for (r = 0; r < n.length; ++r)
					if (n[r] == t) {
						n.splice(r, 1);
						break
					}
		}
		function n(e, t, r, n, o) {
			var i, s = this._handlers && this._handlers[e];
			if (s)
				for (i = 0; i < s.length; ++i)
					s[i].call(this, t, r, n, o)
		}
		e.mixin = function(e) {
			return e.on = t,
			e.off = r,
			e.signal = n,
			e
		}
	}),
	/**
	 * @param {?} dataAndEvents
	 * @param {?} mod
	 * @return {?}
	 */
	function (e, t) {
		return "object" == typeof exports && "object" == typeof module ? t(exports, require("./infer"), require("./signal"), require("acorn"), require("acorn/dist/walk")) : "function" == typeof define && define.amd ? define(["exports", "./infer", "./signal", "acorn/dist/acorn", "acorn/dist/walk"], t) : (void t(e.tern || (e.tern = {}), window.tern, window.tern.signal, window.acorn, window.acorn.walk))
	}(this, function (exports, infer, signal, dataAndEvents, walk) {
	/**
	 * @param {string} name
	 * @param {Object} parentDir
	 * @return {undefined}
	 */
		window.TernFile = window.File = function File(name, parentDir) {
			/** @type {string} */
			this.name = name;
			/** @type {Object} */
			this.parent = parentDir;
			/** @type {null} */
			this.scope = this.text = this.ast = this.lineOffsets = null;
		}

		/**
		 * @param {Object} file
		 * @param {string} text
		 * @param {Element} srv
		 * @return {undefined}
		 */
	function callback(file, text, srv) {
		file.text = srv.options.stripCRs ? text.replace(/\r\n/g, "\n") : text;
		infer.withContext(srv.cx, function() {
		file.ast = infer.parse(file.text, srv.passes, {
			directSourceFile : file,
			allowReturnOutsideFunction : true,
			allowImportExportEverywhere : true,
			ecmaVersion : srv.options.ecmaVersion
		});
		});
		/** @type {null} */
		file.lineOffsets = null;
	}
	/**
	 * @param {Element} srv
	 * @param {Object} data
	 * @param {Function} callback
	 * @return {?}
	 */
	function doRequest(srv, data, callback) {
		var query;
		var files;
		var f;
		var file;
		var recurring;
		var queryType;
		if (data.query && !type.hasOwnProperty(data.query.type)) {
		return callback("No query type '" + data.query.type + "' defined");
		}
		query = data.query;
		if (!query) {
		callback(null, {});
		}
		files = data.files || [];
		if (files.length) {
		++srv.uses;
		}
		/** @type {number} */
		f = 0;
		for (;f < files.length;++f) {
		file = files[f];
		if ("delete" == file.type) {
			srv.delFile(file.name);
		} else {
			ensureFile(srv, file.name, null, "full" == file.type ? file.text : null);
		}
		}
		if (recurring = "number" == typeof data.timeout ? [data.timeout] : null, !query) {
		return void analyzeAll(srv, recurring, function() {
		});
		}
		if (queryType = type[query.type], queryType.takesFile) {
		if ("string" != typeof query.file) {
			return callback(".query.file must be a string");
		}
		if (!/^#/.test(query.file)) {
			ensureFile(srv, query.file, null);
		}
		}
		analyzeAll(srv, recurring, function(basis) {
		/**
		 * @return {?}
		 */
		function compile() {
			var result;
			try {
			result = queryType.run(srv, query, file);
			} catch (e) {
			return srv.options.debug && ("TernError" != e.name && console.error(e.stack)), callback(e);
			}
			callback(null, result);
		}
		if (basis) {
			return callback(basis);
		}
		var file = queryType.takesFile && resolveFile(srv, files, query.file);
		return queryType.fullFile && "part" == file.type ? callback("Can't run a " + query.type + " query on a file fragment") : void infer.withContext(srv.cx, recurring ? function() {
			infer.withTimeout(recurring[0], compile);
		} : compile);
		});
	}
	/**
	 * @param {Object} srv
	 * @param {Object} file
	 * @return {?}
	 */
	function analyzeFile(srv, file) {
		return infer.withContext(srv.cx, function () {
		file.scope = srv.cx.topScope;
		srv.signal("beforeLoad", file);
		infer.analyze(file.ast, file.name, file.scope, srv.passes);
		srv.signal("afterLoad", file);
		}), file;
	}
	/**
	 * @param {Element} srv
	 * @param {string} name
	 * @param {string} data
	 * @param {string} text
	 * @return {?}
	 */
	function ensureFile(srv, name, data, text) {
		var view;
		var file = srv.findFile(name);
		return file ? (null != text && (file.scope && (srv.needsPurge.push(name), file.scope = null), callback(file, text, srv)), void(log(srv, file.parent) > log(srv, data) && (file.parent = data, file.excluded && (file.excluded = null)))) : (view = new File(name, data), srv.files.push(view), srv.fileMap[name] = view, void(null != text ? callback(view, text, srv) : srv.options.async ? (srv.startAsyncAction(), srv.options.getFile(name, function(err, message) {
		callback(view, message || "", srv);
		srv.finishAsyncAction(err);
		})) : callback(view, srv.options.getFile(name) || "", srv)));
	}
	/**
	 * @param {Object} srv
	 * @param {?} recurring
	 * @param {Function} deepDataAndEvents
	 * @return {undefined}
	 */
	function waitOnFetch(srv, recurring, deepDataAndEvents) {
		var timer;
		/**
		 * @return {undefined}
		 */
		var done = function() {
		srv.off("everythingFetched", done);
		clearTimeout(timer);
		analyzeAll(srv, recurring, deepDataAndEvents);
		};
		srv.on("everythingFetched", done);
		/** @type {number} */
		timer = setTimeout(done, srv.options.fetchTimeout);
	}
	/**
	 * @param {Object} srv
	 * @param {?} recurring
	 * @param {Function} deepDataAndEvents
	 * @return {?}
	 */
	function analyzeAll(srv, recurring, deepDataAndEvents) {
		var r20;
		var i;
		var id;
		var files;
		var f;
		var file;
		var d;
		if (srv.pending) {
		return waitOnFetch(srv, recurring, deepDataAndEvents);
		}
		if (r20 = srv.fetchError) {
		return srv.fetchError = null, deepDataAndEvents(r20);
		}
		if (srv.needsPurge.length > 0) {
		infer.withContext(srv.cx, function() {
			infer.purge(srv.needsPurge);
			/** @type {number} */
			srv.needsPurge.length = 0;
		});
		}
		/** @type {boolean} */
		i = true;
		/** @type {number} */
		id = 0;
		for (;id < srv.files.length;) {
		/** @type {Array} */
		files = [];
		for (;id < srv.files.length;++id) {
			file = srv.files[id];
			if (null == file.text) {
			/** @type {boolean} */
			i = false;
			} else {
			if (!(null != file.scope)) {
				if (!file.excluded) {
				files.push(file);
				}
			}
			}
		}
		files.sort(function(result, output) {
			return log(srv, result.parent) - log(srv, output.parent);
		});
		/** @type {number} */
		f = 0;
		for (;f < files.length;f++) {
			file = files[f];
			if (file.parent && !cb(srv, file)) {
			/** @type {boolean} */
			file.excluded = true;
			} else {
			if (recurring) {
				/** @type {number} */
				d = +new Date;
				infer.withTimeout(recurring[0], function() {
				analyzeFile(srv, file);
				});
				recurring[0] -= +new Date - d;
			} else {
				analyzeFile(srv, file);
			}
			}
		}
		}
		if (i) {
		deepDataAndEvents();
		} else {
		waitOnFetch(srv, recurring, deepDataAndEvents);
		}
	}
	/**
	 * @param {string} str
	 * @return {?}
	 */
	function firstLine(str) {
		var attrIndex = str.indexOf("\n");
		return 0 > attrIndex ? str : str.slice(0, attrIndex);
	}
	/**
	 * @param {Array} line
	 * @param {string} file
	 * @param {number} near
	 * @return {?}
	 */
	function findMatchingPosition(line, file, near) {
		var found;
		/** @type {number} */
		var next = Math.max(0, near - 500);
		/** @type {null} */
		var closest = null;
		if (!/^\s*$/.test(line)) {
		for (;found = file.indexOf(line, next), !(0 > found || found > near + 500);) {
			if (null == closest || Math.abs(closest - near) > Math.abs(found - near)) {
			closest = found;
			}
			next = found + line.length;
		}
		}
		return closest;
	}
	/**
	 * @param {number} s
	 * @return {?}
	 */
	function scopeDepth(s) {
		/** @type {number} */
		var i = 0;
		for (;s;++i, s = s.prev) {
		}
		return i;
	}
	/**
	 * @param {string} msg
	 * @return {?}
	 */
	function ternError(msg) {
		/** @type {Error} */
		var err = new Error(msg);
		return err.name = "TernError", err;
	}
	/**
	 * @param {Object} srv
	 * @param {?} files
	 * @param {string} name
	 * @return {?}
	 */
	function resolveFile(srv, files, name) {
		var file;
		var realFile;
		var offset;
		var playing = name.match(/^#(\d+)$/);
		if (!playing) {
		return srv.findFile(name);
		}
		if (file = files[playing[1]], !file || "delete" == file.type) {
		throw ternError("Reference to unknown file " + name);
		}
		if ("full" == file.type) {
		return srv.findFile(file.name);
		}
		realFile = file.backing = srv.findFile(file.name);
		offset = file.offset;
		if (file.offsetLines) {
		offset = {
			line : file.offsetLines,
			ch : 0
		};
		}
		file.offset = offset = resolvePos(realFile, null == file.offsetLines ? file.offset : {
		line : file.offsetLines,
		ch : 0
		}, true);
		var node;
		var orig;
		var line = firstLine(file.text);
		var foundPos = findMatchingPosition(line, realFile.text, offset);
		var pos = null == foundPos ? Math.max(0, realFile.text.lastIndexOf("\n", offset)) : foundPos;
		return infer.withContext(srv.cx, function() {
		var text;
		var m;
		var max;
		var index;
		var a;
		var newInner;
		var prop;
		var inner;
		var fOld;
		var fNew;
		var i;
		var l;
		if (infer.purge(file.name, pos, pos + file.text.length), text = file.text, (m = text.match(/(?:"([^"]*)"|([\w$]+))\s*:\s*function\b/)) && (max = walk.findNodeAround(file.backing.ast, pos, "ObjectExpression"), max && (max.node.objType && (node = {
			type : max.node.objType,
			prop : m[2] || m[1]
		}))), foundPos && (m = line.match(/^(.*?)\bfunction\b/))) {
			index = m[1].length;
			/** @type {string} */
			a = "";
			/** @type {number} */
			i = 0;
			for (;index > i;++i) {
			a += " ";
			}
			text = a + text.slice(index);
			/** @type {boolean} */
			orig = true;
		}
		var scopeStart = infer.scopeAt(realFile.ast, pos, realFile.scope);
		var scopeEnd = infer.scopeAt(realFile.ast, pos + text.length, realFile.scope);
		var scope = file.scope = scopeDepth(scopeStart) < scopeDepth(scopeEnd) ? scopeEnd : scopeStart;
		file.ast = infer.parse(text, srv.passes, {
			directSourceFile : file,
			allowReturnOutsideFunction : true
		});
		infer.analyze(file.ast, file.name, scope, srv.passes);
		e: {
			if (node || orig) {
			if (newInner = infer.scopeAt(file.ast, line.length, scopeStart), !newInner.fnType) {
				break e;
			}
			if (node) {
				prop = node.type.getProp(node.prop);
				prop.addType(newInner.fnType);
			} else {
				if (orig) {
				if (inner = infer.scopeAt(realFile.ast, pos + line.length, realFile.scope), inner == scopeStart || !inner.fnType) {
					break e;
				}
				if (fOld = inner.fnType, fNew = newInner.fnType, !fNew || fNew.name != fOld.name && fOld.name) {
					break e;
				}
				/** @type {number} */
				i = 0;
				/** @type {number} */
				l = Math.min(fOld.args.length, fNew.args.length);
				for (;l > i;++i) {
					fOld.args[i].propagate(fNew.args[i]);
				}
				fOld.self.propagate(fNew.self);
				fNew.retval.propagate(fOld.retval);
				}
			}
			}
		}
		}), file;
	}
	/**
	 * @param {?} node
	 * @return {?}
	 */
	function g(node) {
		/** @type {number} */
		var t = 0;
		return walk.simple(node, {
		/**
		 * @return {undefined}
		 */
		Expression : function() {
			++t;
		}
		}), t;
	}
	/**
	 * @param {?} srv
	 * @param {(Object|string)} obj
	 * @return {?}
	 */
	function log(srv, obj) {
		/** @type {number} */
		var n = 0;
		for (;obj;) {
		obj = srv.findFile(obj).parent;
		++n;
		}
		return n;
	}
	/**
	 * @param {Array} base
	 * @param {Object} obj
	 * @return {?}
	 */
	function next(base, obj) {
		for (;;) {
		var option = base.findFile(obj.parent);
		if (!option.parent) {
			break;
		}
		obj = option;
		}
		return obj.name;
	}
	/**
	 * @param {Array} data
	 * @param {Error} result
	 * @return {?}
	 */
	function cb(data, result) {
		var id = next(data, result);
		var a = g(result.ast);
		var b = data.budgets[id];
		return null == b && (b = data.budgets[id] = data.options.dependencyBudget), a > b ? false : (data.budgets[id] = b - a, true);
	}
	/**
	 * @param {number} val
	 * @return {?}
	 */
	function isPosition(val) {
		return "number" == typeof val || "object" == typeof val && ("number" == typeof val.line && "number" == typeof val.ch);
	}
	/**
	 * @param {Object} doc
	 * @return {?}
	 */
	function invalidDoc(doc) {
		var i;
		var file;
		if (doc.query) {
		if ("string" != typeof doc.query.type) {
			return ".query.type must be a string";
		}
		if (doc.query.start && !isPosition(doc.query.start)) {
			return ".query.start must be a position";
		}
		if (doc.query.end && !isPosition(doc.query.end)) {
			return ".query.end must be a position";
		}
		}
		if (doc.files) {
		if (!Array.isArray(doc.files)) {
			return "Files property must be an array";
		}
		/** @type {number} */
		i = 0;
		for (;i < doc.files.length;++i) {
			if (file = doc.files[i], "object" != typeof file) {
			return ".files[n] must be objects";
			}
			if ("string" != typeof file.name) {
			return ".files[n].name must be a string";
			}
			if ("delete" != file.type) {
			if ("string" != typeof file.text) {
				return ".files[n].text must be a string";
			}
			if ("part" == file.type) {
				if (!isPosition(file.offset) && "number" != typeof file.offsetLines) {
				return ".files[n].offset must be a position";
				}
			} else {
				if ("full" != file.type) {
				return'.files[n].type must be "full" or "part"';
				}
			}
			}
		}
		}
	}
	/**
	 * @param {Object} file
	 * @param {number} line
	 * @return {?}
	 */
	function findLineStart(file, line) {
		var text = file.text;
		var configList = file.lineOffsets || (file.lineOffsets = [0]);
		/** @type {number} */
		var name = 0;
		/** @type {number} */
		var curLine = 0;
		/** @type {number} */
		var i = Math.min(Math.floor(line / offsetSkipLines), configList.length - 1);
		name = configList[i];
		/** @type {number} */
		curLine = i * offsetSkipLines;
		for (;line > curLine;) {
		if (++curLine, name = text.indexOf("\n", name) + 1, 0 === name) {
			return null;
		}
		if (curLine % offsetSkipLines == 0) {
			configList.push(name);
		}
		}
		return name;
	}
	/**
	 * @param {Object} file
	 * @param {?} pos
	 * @return {?}
	 */
	function asLineChar(file, pos) {
		var codeSegments;
		var text;
		var line;
		var lineStart;
		var i;
		var lineEnd;
		if (!file) {
		return{
			line : 0,
			ch : 0
		};
		}
		codeSegments = file.lineOffsets || (file.lineOffsets = [0]);
		text = file.text;
		/** @type {number} */
		i = codeSegments.length - 1;
		for (;i >= 0;--i) {
		if (codeSegments[i] <= pos) {
			/** @type {number} */
			line = i * offsetSkipLines;
			lineStart = codeSegments[i];
		}
		}
		for (;lineEnd = text.indexOf("\n", lineStart), !(lineEnd >= pos || 0 > lineEnd);) {
		lineStart = lineEnd + 1;
		++line;
		}
		return{
		line : line,
		ch : pos - lineStart
		};
	}
	/**
	 * @param {Object} obj
	 * @return {?}
	 */
	function hasKey(obj) {
		var prop;
		for (prop in obj) {
		if (null == obj[prop]) {
			delete obj[prop];
		}
		}
		return obj;
	}
	/**
	 * @param {Object} obj
	 * @param {string} prop
	 * @param {string} val
	 * @return {undefined}
	 */
	function maybeSet(obj, prop, val) {
		if (null != val) {
		/** @type {string} */
		obj[prop] = val;
		}
	}
	/**
	 * @param {string} name
	 * @param {string} text
	 * @return {?}
	 */
	function element(name, text) {
		if ("string" != typeof name) {
		name = name.name;
		text = text.name;
		}
		/** @type {boolean} */
		var input = /^[A-Z]/.test(name);
		/** @type {boolean} */
		var code = /^[A-Z]/.test(text);
		return input == code ? text > name ? -1 : name == text ? 0 : 1 : input ? 1 : -1;
	}
	/**
	 * @param {Object} node
	 * @param {number} start
	 * @param {number} end
	 * @return {?}
	 */
	function isStringAround(node, start, end) {
		return "Literal" == node.type && ("string" == typeof node.value && (node.start == start - 1 && node.end <= end + 1));
	}
	/**
	 * @param {string} config
	 * @param {?} end
	 * @return {?}
	 */
	function replace(config, end) {
		var item;
		/** @type {number} */
		var i = 0;
		for (;i < config.properties.length;i++) {
		if (item = config.properties[i], item.key.start <= end && item.key.end >= end) {
			return item;
		}
		}
	}
	/**
	 * @param {Object} srv
	 * @param {string} query
	 * @param {Object} file
	 * @return {?}
	 */
	function findCompletions(srv, query, file) {
		/**
		 * @param {string} prop
		 * @param {?} obj
		 * @param {number} recurring
		 * @param {Function} indexOf
		 * @return {undefined}
		 */
		function gather(prop, obj, recurring, indexOf) {
		if (!((c || query.omitObjectPrototype !== false) && (obj == srv.cx.protos.Object && !temp) || (query.filter !== false && (temp && 0 !== (query.caseInsensitive ? prop.toLowerCase() : prop).indexOf(temp)) || object && object.props[prop]))) {
			var dontCloseTags = oldSizzle(query, found, prop, obj && obj.props[prop], recurring);
			if (indexOf) {
			if (dontCloseTags) {
				if ("string" != typeof dontCloseTags) {
				indexOf(dontCloseTags);
				}
			}
			}
		}
		}
		var v;
		var data;
		var temp;
		var found;
		var object;
		var key;
		var tp;
		var _ref5;
		var self;
		var memberExpr;
		var c;
		var node;
		var parent;
		var template;
		var offset;
		var src;
		var prop;
		if (null == query.end) {
		throw ternError("missing .query.end field");
		}
		if (srv.passes.completion) {
		/** @type {number} */
		v = 0;
		for (;v < srv.passes.completion.length;v++) {
			if (data = srv.passes.completion[v](file, query)) {
			return data;
			}
		}
		}
		var pos = resolvePos(file, query.end);
		var wordEnd = pos;
		var text = file.text;
		for (;pos && dataAndEvents.isIdentifierChar(text.charCodeAt(pos - 1));) {
		--pos;
		}
		if (query.expandWordForward !== false) {
		for (;wordEnd < text.length && dataAndEvents.isIdentifierChar(text.charCodeAt(wordEnd));) {
			++wordEnd;
		}
		}
		if (temp = text.slice(pos, wordEnd), found = [], query.caseInsensitive && (temp = temp.toLowerCase()), self = infer.findExpressionAround(file.ast, null, pos, file.scope), self && (node = self.node, "MemberExpression" == node.type && node.object.end < pos ? memberExpr = self : isStringAround(node, pos, wordEnd) ? (parent = infer.parentNode(node, file.ast), "MemberExpression" == parent.type && (parent.property == node && (memberExpr = {
		node : parent,
		state : self.state
		}))) : "ObjectExpression" == node.type && (template = replace(node, wordEnd), template ? (c = self, prop = _ref5 = template.key.name) : temp || (/:\s*$/.test(file.text.slice(0, pos)) || (c = self, prop = _ref5 = true)))), c) {
		tp = infer.typeFromContext(file.ast, c);
		object = c.node.objType;
		} else {
		if (memberExpr) {
			prop = memberExpr.node.property;
			prop = "Literal" == prop.type ? prop.value.slice(1) : prop.name;
			memberExpr.node = memberExpr.node.object;
			tp = infer.expressionType(memberExpr);
		} else {
			if ("." == text.charAt(pos - 1)) {
			/** @type {number} */
			offset = pos - 1;
			for (;offset && ("." == text.charAt(offset - 1) || dataAndEvents.isIdentifierChar(text.charCodeAt(offset - 1)));) {
				offset--;
			}
			src = text.slice(offset, pos - 1);
			if (src) {
				tp = infer.def.parsePath(src, file.scope).getObjType();
				prop = temp;
			}
			}
		}
		}
		if (null != prop) {
		if (srv.cx.completingProperty = prop, tp && infer.forAllPropertiesOf(tp, gather), !found.length && (query.guess !== false && (tp && (tp.guessProperties && tp.guessProperties(function(p, walkers, recurring) {
			if (p != prop) {
			if ("\u2716" != p) {
				gather(p, walkers, recurring);
			}
			}
		})))), !found.length && (temp.length >= 2 && query.guess !== false)) {
			for (prop in srv.cx.props) {
			gather(prop, srv.cx.props[prop][0], 0);
			}
		}
		/** @type {string} */
		key = "memberCompletion";
		} else {
		infer.forAllLocalsAt(file.ast, pos, file.scope, gather);
		if (query.includeKeywords) {
			asserterNames.forEach(function(p) {
			gather(p, null, 0, function(prev) {
				/** @type {boolean} */
				prev.isKeyword = true;
			});
			});
		}
		/** @type {string} */
		key = "variableCompletion";
		}
		return srv.passes[key] && srv.passes[key].forEach(function(fail) {
		fail(file, pos, wordEnd, gather);
		}), query.sort !== false && found.sort(element), srv.cx.completingProperty = null, {
		start : outputPos(query, file, pos),
		end : outputPos(query, file, wordEnd),
		isProperty : !!prop,
		isObjectKey : !!_ref5,
		completions : found
		};
	}
	/**
	 * @param {Object} srv
	 * @param {string} query
	 * @return {?}
	 */
	function findProperties(srv, query) {
		var prefix = query.prefix;
		/** @type {Array} */
		var buffer = [];
		var buf;
		for (buf in srv.cx.props) {
		if (!("<i>" == buf)) {
			if (!(prefix && 0 !== buf.indexOf(prefix))) {
			buffer.push(buf);
			}
		}
		}
		return query.sort !== false && buffer.sort(element), {
		completions : buffer
		};
	}
	/**
	 * @param {Object} file
	 * @param {Object} query
	 * @param {boolean} deepDataAndEvents
	 * @return {?}
	 */
	function parse(file, query, deepDataAndEvents) {
		var expr = findExpr(file, query, deepDataAndEvents);
		if (expr) {
		return expr;
		}
		throw ternError("No expression at the given position.");
	}
	/**
	 * @param {?} type
	 * @return {?}
	 */
	function append(type) {
		return type && ((type = type.getType()) && type instanceof infer.Obj) ? type : null;
	}
	/**
	 * @param {Element} srv
	 * @param {Object} query
	 * @param {?} file
	 * @param {Object} c
	 * @return {?}
	 */
	function update(srv, query, file, c) {
		var result;
		var level;
		var pair;
		var name;
		var s;
		var scope;
		if (c && (infer.resetGuessing(), result = infer.expressionType(c)), srv.passes.typeAt && (level = resolvePos(file, query.end), srv.passes.typeAt.forEach(function(f) {
		result = f(file, level, c, result);
		})), !result) {
		throw ternError("No type found at the given position.");
		}
		return "ObjectExpression" == c.node.type && (null != query.end && ((pair = replace(c.node, resolvePos(file, query.end))) && (name = pair.key.name, s = append(infer.typeFromContext(file.ast, c)), s && s.hasProp(name) ? result = s.hasProp(name) : (scope = append(result), scope && (scope.hasProp(name) && (result = scope.hasProp(name))))))), result;
	}
	/**
	 * @param {Element} srv
	 * @param {Object} query
	 * @param {?} file
	 * @return {?}
	 */
	var findTypeAt = window.ternFindTypeAt = function(srv, query, file) {
		var exprName;
		var result;
		var expr = findExpr(file, query);
		var data = update(srv, query, file, expr);
		var type = data;
		if (data = query.preferFunction ? data.getFunctionType() || data.getType() : data.getType(), expr && ("Identifier" == expr.node.type ? exprName = expr.node.name : "MemberExpression" != expr.node.type || (expr.node.computed || (exprName = expr.node.property.name))), null != query.depth && "number" != typeof query.depth) {
		throw ternError(".query.depth must be a number");
		}
		return result = {
		guess : infer.didGuess(),
		type : infer.toString(type, query.depth),
		name : data && data.name,
		exprName : exprName
		}, data && storeTypeDocs(query, data, result), !result.doc && (type.doc && (result.doc = escape(query, type.doc))), hasKey(result);
	}
	/**
	 * @param {string} str
	 * @param {string} cssText
	 * @return {?}
	 */
	function escape(str, cssText) {
		var rule;
		var regex;
		var found;
		return cssText ? "full" == str.docFormat ? cssText : (rule = /.\n[\s@\n]/.exec(cssText), rule && (cssText = cssText.slice(0, rule.index + 1)), cssText = cssText.replace(/\n\s*/g, " "), cssText.length < 100 ? cssText : (regex = /[\.!?] [A-Z]/g, regex.lastIndex = 80, found = regex.exec(cssText), found && (cssText = cssText.slice(0, found.index + 1)), cssText)) : null;
	}
	/**
	 * @param {Element} cmd
	 * @param {string} id
	 * @param {?} callback
	 * @return {?}
	 */
	function run(cmd, id, callback) {
		var d = findExpr(callback, id);
		var type = update(cmd, id, callback, d);
		var result = {
		url : type.url,
		doc : escape(id, type.doc),
		type : infer.toString(type)
		};
		var element = type.getType();
		return element && storeTypeDocs(id, element, result), hasKey(result);
	}
	/**
	 * @param {string} query
	 * @param {Object} type
	 * @param {Object} out
	 * @return {undefined}
	 */
	function storeTypeDocs(query, type, out) {
		if (!out.url) {
		out.url = type.url;
		}
		if (!out.doc) {
		out.doc = escape(query, type.doc);
		}
		if (!out.origin) {
		out.origin = type.origin;
		}
		var ctor;
		var boring = infer.cx().protos;
		if (!out.url) {
		if (!out.doc) {
			if (type.proto) {
			if (ctor = type.proto.hasCtor) {
				if (type.proto != boring.Object) {
				if (type.proto != boring.Function) {
					if (type.proto != boring.Array) {
					out.url = ctor.url;
					out.doc = escape(query, ctor.doc);
					}
				}
				}
			}
			}
		}
		}
	}
	/**
	 * @param {Element} srv
	 * @param {string} query
	 * @param {?} file
	 * @return {?}
	 */
	function findDef(srv, query, file) {
		var span;
		var result;
		var i;
		var tp;
		var cxStart;
		var expr = findExpr(file, query);
		var data = update(srv, query, file, expr);
		if (infer.didGuess()) {
		return{};
		}
		if (span = getSpan(data), result = {
		url : data.url,
		doc : escape(query, data.doc),
		origin : data.origin
		}, data.types) {
		/** @type {number} */
		i = data.types.length - 1;
		for (;i >= 0;--i) {
			tp = data.types[i];
			storeTypeDocs(query, tp, result);
			if (!span) {
			span = getSpan(tp);
			}
		}
		}
		if (span && span.node) {
		var spanFile = span.node.sourceFile || srv.findFile(span.origin);
		var start = outputPos(query, spanFile, span.node.start);
		var end = outputPos(query, spanFile, span.node.end);
		result.start = start;
		result.end = end;
		result.file = span.origin;
		/** @type {number} */
		cxStart = Math.max(0, span.node.start - 50);
		/** @type {number} */
		result.contextOffset = span.node.start - cxStart;
		result.context = spanFile.text.slice(cxStart, cxStart + 50);
		} else {
		if (span) {
			result.file = span.origin;
			storeSpan(srv, query, span, result);
		}
		}
		return hasKey(result);
	}
	/**
	 * @param {Object} srv
	 * @param {Object} query
	 * @param {Object} file
	 * @param {Object} expr
	 * @param {string} checkShadowing
	 * @return {?}
	 */
	function findRefsToVariable(srv, query, file, expr, checkShadowing) {
		/**
		 * @param {Object} file
		 * @return {?}
		 */
		function storeRef(file) {
		return function(node, selection) {
			var s;
			var $;
			if (checkShadowing) {
			/** @type {number} */
			s = selection;
			for (;s != scope;s = s.prev) {
				if ($ = s.hasProp(checkShadowing)) {
				throw ternError("Renaming `" + name + "` to `" + checkShadowing + "` would make a variable at line " + (asLineChar(file, node.start).line + 1) + " point to the definition at line " + (asLineChar(file, $.name.start).line + 1));
				}
			}
			}
			refs.push({
			file : file.name,
			start : outputPos(query, file, node.start),
			end : outputPos(query, file, node.end)
			});
		};
		}
		var type;
		var refs;
		var prev;
		var i;
		var cur;
		var name = expr.node.name;
		var scope = expr.state;
		for (;scope && !(name in scope.props);scope = scope.prev) {
		}
		if (!scope) {
		throw ternError("Could not find a definition for " + name + " " + !!srv.cx.topScope.props.x);
		}
		if (refs = [], scope.originNode) {
		if (type = "local", checkShadowing) {
			prev = scope.prev;
			for (;prev && !(checkShadowing in prev.props);prev = prev.prev) {
			}
			if (prev) {
			infer.findRefs(scope.originNode, scope, checkShadowing, prev, function(node) {
				throw ternError("Renaming `" + name + "` to `" + checkShadowing + "` would shadow the definition used at line " + (asLineChar(file, node.start).line + 1));
			});
			}
		}
		infer.findRefs(scope.originNode, scope, name, scope, storeRef(file));
		} else {
		/** @type {string} */
		type = "global";
		/** @type {number} */
		i = 0;
		for (;i < srv.files.length;++i) {
			cur = srv.files[i];
			infer.findRefs(cur.ast, cur.scope, name, scope, storeRef(cur));
		}
		}
		return{
		refs : refs,
		type : type,
		name : name
		};
	}
	/**
	 * @param {Object} srv
	 * @param {Object} query
	 * @param {?} expr
	 * @param {?} prop
	 * @return {?}
	 */
	function findRefsToProperty(srv, query, expr, prop) {
		/**
		 * @param {?} file
		 * @return {?}
		 */
		function storeRef(file) {
		return function(node) {
			refs.push({
			file : file.name,
			start : outputPos(query, file, node.start),
			end : outputPos(query, file, node.end)
			});
		};
		}
		var refs;
		var i;
		var cur;
		var objType = infer.expressionType(expr).getObjType();
		if (!objType) {
		throw ternError("Couldn't determine type of base object.");
		}
		/** @type {Array} */
		refs = [];
		/** @type {number} */
		i = 0;
		for (;i < srv.files.length;++i) {
		cur = srv.files[i];
		infer.findPropRefs(cur.ast, cur.scope, objType, prop.name, storeRef(cur));
		}
		return{
		refs : refs,
		name : prop.name
		};
	}
	/**
	 * @param {Object} srv
	 * @param {Object} query
	 * @param {Object} file
	 * @return {?}
	 */
	function findRefs(srv, query, file) {
		var property;
		var LEVEL_LIST;
		var i;
		var o;
		var expr = parse(file, query, true);
		if (expr && "Identifier" == expr.node.type) {
		return findRefsToVariable(srv, query, file, expr);
		}
		if (expr && ("MemberExpression" == expr.node.type && !expr.node.computed)) {
		return property = expr.node.property, expr.node = expr.node.object, findRefsToProperty(srv, query, expr, property);
		}
		if (expr && "ObjectExpression" == expr.node.type) {
		LEVEL_LIST = resolvePos(file, query.end);
		/** @type {number} */
		i = 0;
		for (;i < expr.node.properties.length;++i) {
			if (o = expr.node.properties[i].key, o.start <= LEVEL_LIST && o.end >= LEVEL_LIST) {
			return findRefsToProperty(srv, query, expr, o);
			}
		}
		}
		throw ternError("Not at a variable or property name.");
	}
	/**
	 * @param {Object} srv
	 * @param {Object} query
	 * @param {Object} file
	 * @return {?}
	 */
	function buildRename(srv, query, file) {
		var data;
		var result;
		var codeSegments;
		var eventPath;
		var i;
		var cur;
		if ("string" != typeof query.newName) {
		throw ternError(".query.newName should be a string");
		}
		if (data = parse(file, query), !data || "Identifier" != data.node.type) {
		throw ternError("Not at a variable.");
		}
		result = findRefsToVariable(srv, query, file, data, query.newName);
		codeSegments = result.refs;
		delete result.refs;
		result.files = srv.files.map(function(unused) {
		return unused.name;
		});
		/** @type {Array} */
		eventPath = result.changes = [];
		/** @type {number} */
		i = 0;
		for (;i < codeSegments.length;++i) {
		cur = codeSegments[i];
		/** @type {string} */
		cur.text = query.newName;
		eventPath.push(cur);
		}
		return result;
	}
	/**
	 * @param {Object} srv
	 * @return {?}
	 */
	function listFiles(srv) {
		return{
		files : srv.files.map(function(unused) {
			return unused.name;
		})
		};
	}
	var iterable;
	var type;
	var Type;
	var offsetSkipLines;
	var resolvePos;
	var outputPos;
	var asserterNames;
	var oldSizzle;
	var findExpr;
	var getSpan;
	var storeSpan;
	/** @type {Object} */
	var plugins = Object.create(null);
	/**
	 * @param {string} name
	 * @param {?} init
	 * @return {undefined}
	 */
	exports.registerPlugin = function(name, init) {
		plugins[name] = init;
	};
	iterable = exports.defaultOptions = {
		debug : false,
		async : false,
		/**
		 * @param {string} keepData
		 * @param {Function} successCallback
		 * @return {undefined}
		 */
		getFile : function(keepData, successCallback) {
		if (this.async) {
			successCallback(null, null);
		}
		},
		defs : [],
		plugins : {},
		fetchTimeout : 1E3,
		dependencyBudget : 2E4,
		reuseInstances : true,
		stripCRs : false,
		ecmaVersion : 6
	};
	type = {
		completions : {
		takesFile : true,
		/** @type {function (Object, string, Object): ?} */
		run : findCompletions
		},
		properties : {
		/** @type {function (Object, string): ?} */
		run : findProperties
		},
		type : {
		takesFile : true,
		/** @type {function (Element, Object, ?): ?} */
		run : findTypeAt
		},
		documentation : {
		takesFile : true,
		/** @type {function (Element, string, ?): ?} */
		run : run
		},
		definition : {
		takesFile : true,
		/** @type {function (Element, string, ?): ?} */
		run : findDef
		},
		refs : {
		takesFile : true,
		fullFile : true,
		/** @type {function (Object, Object, Object): ?} */
		run : findRefs
		},
		rename : {
		takesFile : true,
		fullFile : true,
		/** @type {function (Object, Object, Object): ?} */
		run : buildRename
		},
		files : {
		/** @type {function (Object): ?} */
		run : listFiles
		}
	};
	/**
	 * @param {?} name
	 * @param {?} old
	 * @return {undefined}
	 */
	exports.defineQueryType = function(name, old) {
		type[name] = old;
	};
	/**
	 * @param {?} pos
	 * @return {?}
	 */
	window.File.prototype.asLineChar = function(pos) {
		return asLineChar(this, pos);
	};
	/** @type {function (Object): undefined} */
	Type = exports.Server = function(options) {
		var key;
		var plugin;
		var init;
		var type;
		/** @type {null} */
		this.cx = null;
		this.options = options || {};
		for (key in iterable) {
		if (!options.hasOwnProperty(key)) {
			options[key] = iterable[key];
		}
		}
		/** @type {Object} */
		this.handlers = Object.create(null);
		/** @type {Array} */
		this.files = [];
		/** @type {Object} */
		this.fileMap = Object.create(null);
		/** @type {Array} */
		this.needsPurge = [];
		/** @type {Object} */
		this.budgets = Object.create(null);
		/** @type {number} */
		this.uses = 0;
		/** @type {number} */
		this.pending = 0;
		/** @type {null} */
		this.asyncError = null;
		/** @type {Object} */
		this.passes = Object.create(null);
		this.defs = options.defs.slice(0);
		for (plugin in options.plugins) {
		if (options.plugins.hasOwnProperty(plugin) && (plugin in plugins && (init = plugins[plugin](this, options.plugins[plugin]), init && (init.defs && (init.loadFirst ? this.defs.unshift(init.defs) : this.defs.push(init.defs))), init && init.passes))) {
			for (type in init.passes) {
			if (init.passes.hasOwnProperty(type)) {
				(this.passes[type] || (this.passes[type] = [])).push(init.passes[type]);
			}
			}
		}
		}
		this.reset();
	};
	Type.prototype = signal.mixin({
		/**
		 * @param {string} name
		 * @param {string} text
		 * @param {(Array|string)} data
		 * @return {undefined}
		 */
		addFile : function(name, text, data) {
		if (!!data) {
			if (!(data in this.fileMap)) {
			/** @type {null} */
			data = null;
			}
		}
		ensureFile(this, name, data, text);
		},
		/**
		 * @param {string} name
		 * @return {undefined}
		 */
		delFile : function(name) {
		var file = this.findFile(name);
		if (file) {
			this.needsPurge.push(file.name);
			this.files.splice(this.files.indexOf(file), 1);
			delete this.fileMap[name];
		}
		},
		/**
		 * @return {undefined}
		 */
		reset : function() {
		var i;
		var f;
		this.signal("reset");
		this.cx = new infer.Context(this.defs, this);
		/** @type {number} */
		this.uses = 0;
		/** @type {Object} */
		this.budgets = Object.create(null);
		/** @type {number} */
		i = 0;
		for (;i < this.files.length;++i) {
			f = this.files[i];
			/** @type {null} */
			f.scope = null;
		}
		},
		/**
		 * @param {Object} doc
		 * @param {?} func
		 * @return {?}
		 */
		request: function (doc, func) {
		var self;
		var data = invalidDoc(doc);
		return data ? func(data) : (self = this, void doRequest(this, doc, function(name, i) {
			func(name, i);
			if (self.uses > 40) {
			self.reset();
			analyzeAll(self, null, function() {
			});
			}
		}));
		},
		/**
		 * @param {string} name
		 * @return {?}
		 */
		findFile : function(name) {
		return this.fileMap[name];
		},
		/**
		 * @param {?} callback
		 * @return {undefined}
		 */
		flush : function(callback) {
		var cx = this.cx;
		analyzeAll(this, null, function(err) {
			return err ? callback(err) : void infer.withContext(cx, callback);
		});
		},
		/**
		 * @return {undefined}
		 */
		startAsyncAction : function() {
		++this.pending;
		},
		/**
		 * @param {?} err
		 * @return {undefined}
		 */
		finishAsyncAction : function(err) {
		if (err) {
			this.asyncError = err;
		}
		if (0 == --this.pending) {
			this.signal("everythingFetched");
		}
		}
	});
	/** @type {number} */
	offsetSkipLines = 25;
	/** @type {function (Object, number, ?): ?} */
	resolvePos = exports.resolvePos = function(file, pos, dataAndEvents) {
		if ("number" != typeof pos) {
		var lineStart = findLineStart(file, pos.line);
		if (null == lineStart) {
			if (!dataAndEvents) {
			throw ternError("File doesn't contain a line " + pos.line);
			}
			pos = file.text.length;
		} else {
			pos = lineStart + pos.ch;
		}
		}
		if (pos > file.text.length) {
		if (!dataAndEvents) {
			throw ternError("Position " + pos + " is outside of file.");
		}
		pos = file.text.length;
		}
		return pos;
	};
	/** @type {function (string, Object, ?): ?} */
	outputPos = exports.outputPos = function(query, file, pos) {
		if (query.lineCharPositions) {
		var out = asLineChar(file, pos);
		return "part" == file.type && (out.line += null != file.offsetLines ? file.offsetLines : asLineChar(file.backing, file.offset).line), out;
		}
		return pos + ("part" == file.type ? file.offset : 0);
	};
	/** @type {Array.<string>} */
	asserterNames = "break do instanceof typeof case else new var catch finally return void continue for switch while debugger function this with default if throw delete in try".split(" ");
	/** @type {function (string, Array, string, Object, number): ?} */
	oldSizzle = exports.addCompletion = function(query, items, key, val, depth) {
		var item;
		var self;
		var type;
		var opt_name = query.types || (query.docs || (query.urls || query.origins));
		var name = opt_name || query.depths;
		/** @type {number} */
		var i = 0;
		for (;i < items.length;++i) {
		if (item = items[i], (name ? item.name : item) == key) {
			return;
		}
		}
		return self = name ? {
		name : key
		} : key, items.push(self), val && (opt_name && (infer.resetGuessing(), type = val.getType(), self.guess = infer.didGuess(), query.types && (self.type = infer.toString(val)), query.docs && maybeSet(self, "doc", escape(query, val.doc || type && type.doc)), query.urls && maybeSet(self, "url", val.url || type && type.url), query.origins && maybeSet(self, "origin", val.origin || type && type.origin))), query.depths && (self.depth = depth || 0), self;
	};
	/** @type {function (Object, ?, Node): ?} */
	findExpr = exports.findQueryExpr = function(file, query, dataAndEvents) {
		var state_READY;
		if (null == query.end) {
		throw ternError("missing .query.end field");
		}
		if (query.variable) {
		return state_READY = infer.scopeAt(file.ast, resolvePos(file, query.end), file.scope), {
			node : {
			type : "Identifier",
			name : query.variable,
			start : query.end,
			end : query.end + 1
			},
			state : state_READY
		};
		}
		var start = query.start && resolvePos(file, query.start);
		var end = resolvePos(file, query.end);
		var item = infer.findExpressionAt(file.ast, start, end, file.scope);
		return item ? item : (item = infer.findExpressionAround(file.ast, start, end, file.scope), item && ("ObjectExpression" == item.node.type || (dataAndEvents || ((null == start ? end : start) - item.node.start < 20 || item.node.end - end < 20))) ? item : null);
	};
	/** @type {function (?): ?} */
	getSpan = exports.getSpan = function(obj) {
		if (obj.origin) {
		if (obj.originNode) {
			var node = obj.originNode;
			return/^Function/.test(node.type) && (node.id && (node = node.id)), {
			origin : obj.origin,
			node : node
			};
		}
		if (obj.span) {
			return{
			origin : obj.origin,
			span : obj.span
			};
		}
		}
	};
	/** @type {function (?, string, Object, ?): undefined} */
	storeSpan = exports.storeSpan = function(srv, query, span, target) {
		var regExpResultArray;
		var file;
		target.origin = span.origin;
		if (span.span) {
		/** @type {(Array.<string>|null)} */
		regExpResultArray = /^(\d+)\[(\d+):(\d+)\]-(\d+)\[(\d+):(\d+)\]$/.exec(span.span);
		/** @type {(number|{ch: number, line: number})} */
		target.start = query.lineCharPositions ? {
			line : Number(regExpResultArray[2]),
			ch : Number(regExpResultArray[3])
		} : Number(regExpResultArray[1]);
		/** @type {(number|{ch: number, line: number})} */
		target.end = query.lineCharPositions ? {
			line : Number(regExpResultArray[5]),
			ch : Number(regExpResultArray[6])
		} : Number(regExpResultArray[4]);
		} else {
		file = srv.findFile(span.origin);
		target.start = outputPos(query, file, span.node.start);
		target.end = outputPos(query, file, span.node.end);
		}
	};
	/** @type {string} */
	exports.version = "0.13.1";
	}),
	function(e) {
		return "object" == typeof exports && "object" == typeof module ? exports.init = e : "function" == typeof define && define.amd ? define({
			init: e
		}) : void (window.tern.def = {
			init: e
		})
	}(function(e, t) {
		"use strict";
		function r(e, t) {
			return Object.prototype.hasOwnProperty.call(e, t)
		}
		function n(e, t, r) {
			return e.call ? e(t, r) : e
		}
		function o(e, r) {
			if ("!ret" == r) {
				if (e.retval)
					return e.retval;
				var n = new t.AVal;
				return e.propagate(new t.IsCallee(t.ANull,[],null ,n)),
				n
			}
			return e.getProp(r)
		}
		function i(e, r, o) {
			return function(i, s) {
				for (var a = [], l = 0; l < r.length; l++)
					a.push(n(r[l], i, s));
				return new t.Fn(e,t.ANull,a,n(o, i, s))
			}
		}
		function s(e) {
			return function(r, o) {
				for (var i = new t.AVal, s = 0; s < e.length; s++)
					n(e[s], r, o).propagate(i);
				return i.maxWeight = 1e5,
				i
			}
		}
		function a(e) {
			return function(r, n) {
				return new t.Arr(e(r, n))
			}
		}
		function l(e, r, n, o) {
			var i, s = new E(e,null ,n,o).parseType(!1, r, !0);
			if (/^fn\(/.test(e))
				for (i = 0; i < s.args.length; ++i)
					(function(e) {
						var r = s.args[e];
						r instanceof t.Fn && r.args && r.args.length && c(s, function(n, o) {
							var i = o[e];
							i && i.propagate(new t.IsCallee(t.cx().topScope,r.args,null ,t.ANull))
						})
					})(i);
			return s
		}
		function c(e, t, r) {
			var n = e.computeRet
			, o = e.retval;
			e.computeRet = function(e, i, s) {
				var a = t(e, i, s)
				, l = n ? n(e, i, s) : o;
				return r ? a : l
			}
		}
		function p(e) {
			var t = Object.create(e.prototype);
			return t.props = Object.create(null ),
			t.isShell = !0,
			t
		}
		function h(e) {
			if (!e["!type"] || /^(fn\(|\[)/.test(e["!type"]))
				return !1;
			for (var t in e)
				if ("!type" != t && "!doc" != t && "!url" != t && "!span" != t && "!data" != t)
					return !1;
			return !0
		}
		function d(e, n, o) {
			var i, s, a, l;
			if (!e) {
				if (i = n["!type"]) {
					if (/^fn\(/.test(i)) {
						e = p(t.Fn);
					} else {
						if ("[" != i.charAt(0)) {
							throw new Error("Invalid !type spec: " + i);
						}
						e = p(t.Arr)
					}
				} else {
					e = n["!stdProto"] ? t.cx().protos[n["!stdProto"]] : p(t.Obj);
				}
				e.name = o
			}
			for (s in n)
				if (r(n, s) && 33 != s.charCodeAt(0)) {
					if (a = n[s],
					"string" == typeof a || h(a))
						continue;l = e.defProp(s),
					d(l.getObjType(), a, o ? o + "." + s : s).propagate(l)
				}
			return e
		}
		function u(e, n, o) {
			var i, s, a, c, p;
			if (e.isShell && (delete e.isShell,
			i = n["!type"],
			i ? l(i, o, e) : (s = n["!proto"] && l(n["!proto"]),
			t.Obj.call(e, s instanceof t.Obj ? s : !0, o))),
			a = n["!effects"],
			a && e instanceof t.Fn)
				for (c = 0; c < a.length; ++c)
					y(a[c], e);
			f(n, e);
			for (p in n)
				if (r(n, p) && 33 != p.charCodeAt(0)) {
					var d = n[p]
					, m = e.defProp(p)
					, g = o ? o + "." + p : p;
					if ("string" == typeof d)
						m.isEmpty() && l(d, g).propagate(m);
					else {
						if (h(d)) {
							if (!m.isEmpty())
								continue;l(d["!type"], g, null , !0).propagate(m)
						} else
							u(m.getObjType(), d, g);
						d["!doc"] && (m.doc = d["!doc"]),
						d["!url"] && (m.url = d["!url"]),
						d["!span"] && (m.span = d["!span"])
					}
				}
			return e
		}
		function f(e, t) {
			e["!doc"] && (t.doc = e["!doc"]),
			e["!url"] && (t.url = e["!url"]),
			e["!span"] && (t.span = e["!span"]),
			e["!data"] && (t.metaData = e["!data"])
		}
		function m(e, r) {
			var n, o = t.cx().parent, i = o && o.passes && o.passes[e];
			if (i)
				for (n = 0; n < i.length; n++)
					i[n](r)
		}
		function g(e, r) {
			var n, o, i, s = t.cx();
			if (t.addOrigin(s.curOrigin = e["!name"] || "env#" + s.origins.length),
			s.localDefs = s.definitions[s.curOrigin] = Object.create(null ),
			m("preLoadDef", e),
			d(r, e),
			n = e["!define"]) {
				for (o in n)
					i = n[o],
					s.localDefs[o] = "string" == typeof i ? v(i) : d(null , i, o);
				for (o in n)
					i = n[o],
					"string" != typeof i && u(s.localDefs[o], n[o], o)
			}
			u(r, e),
			m("postLoadDef", e),
			s.curOrigin = s.localDefs = null 
		}
		var y, b, v, w, S, x, T, O, j, E = e.TypeParser = function(e, t, r, n) {
			this.pos = t || 0,
			this.spec = e,
			this.base = r,
			this.forceNew = n
		}
		;
		return E.prototype = {
			eat: function(e) {
				return (1 == e.length ? this.spec.charAt(this.pos) == e : this.spec.indexOf(e, this.pos) == this.pos) ? (this.pos += e.length,
				!0) : void 0
			},
			word: function(e) {
				for (var t, r = "", e = e || /[\w$]/; (t = this.spec.charAt(this.pos)) && e.test(t); )
					r += t,
					++this.pos;
				return r
			},
			error: function() {
				throw new Error("Unrecognized type spec: " + this.spec + " (at " + this.pos + ")")
			},
			parseFnType: function(e, r, n) {
				var o, s, a, l, c, p, h, d, u, f = [], m = [], g = !1;
				if (!this.eat(")"))
					for (o = 0; ; ++o)
						if (s = this.spec.indexOf(": ", this.pos),
						-1 != s && (a = this.spec.slice(this.pos, s),
						/^[$\w?]+$/.test(a) ? this.pos = s + 2 : a = null ),
						m.push(a),
						l = this.parseType(e),
						l.call && (g = !0),
						f.push(l),
						!this.eat(", ")) {
							this.eat(")") || this.error();
							break
						}
				return this.eat(" -> ") ? (u = this.pos,
				c = this.parseType(!0),
				c.call && !g && (p = c,
				c = t.ANull,
				h = u)) : c = t.ANull,
				g ? i(r, f, c) : (n && (d = this.base) ? t.Fn.call(this.base, r, t.ANull, f, m, c) : d = new t.Fn(r,t.ANull,f,m,c),
				p && (d.computeRet = p),
				null  != h && (d.computeRetSource = this.spec.slice(h, this.pos)),
				d)
			},
			parseType: function(e, r, n) {
				var o, i, a, l, c, p = this.parseTypeMaybeProp(e, r, n);
				if (!this.eat("|"))
					return p;
				for (o = [p],
				i = p.call; a = this.parseTypeMaybeProp(e, r, n),
				o.push(a),
				a.call && (i = !0),
				this.eat("|"); )
					;
				if (i)
					return s(o);
				for (l = new t.AVal,
				c = 0; c < o.length; c++)
					o[c].propagate(l);
				return l.maxWeight = 1e5,
				l
			},
			parseTypeMaybeProp: function(e, t, r) {
				for (var n = this.parseTypeInner(e, t, r); e && this.eat("."); )
					n = this.extendWithProp(n);
				return n
			},
			extendWithProp: function(e) {
				var t = this.word(/[\w<>$!]/) || this.error();
				return e.apply ? function(r, n) {
					return o(e(r, n), t)
				}
				: o(e, t)
			},
			parseTypeInner: function(e, r, n) {
				var o, i, s, l, c;
				return this.eat("fn(") ? this.parseFnType(e, r, n) : this.eat("[") ? (o = this.parseType(e),
				this.eat("]") || this.error(),
				o.call ? a(o) : n && this.base ? (t.Arr.call(this.base, o),
				this.base) : new t.Arr(o)) : this.eat("+") ? (i = this.word(/[\w$<>\.!]/),
				s = v(i + ".prototype"),
				s instanceof t.Obj || (s = v(i)),
				s instanceof t.Obj ? e && this.eat("[") ? this.parsePoly(s) : n && this.forceNew ? new t.Obj(s) : t.getInstance(s) : s) : e && this.eat("!") ? (l = this.word(/\d/),
				l ? (l = Number(l),
				function(e, r) {
					return r[l] || t.ANull
				}
				) : this.eat("this") ? function(e) {
					return e
				}
				: this.eat("custom:") ? (c = this.word(/[\w$]/),
				w[c] || function() {
					return t.ANull
				}
				) : this.fromWord("!" + this.word(/[\w$<>\.!]/))) : this.eat("?") ? t.ANull : this.fromWord(this.word(/[\w$<>\.!`]/))
			},
			fromWord: function(e) {
				var r = t.cx();
				switch (e) {
				case "number":
					return r.num;
				case "string":
					return r.str;
				case "bool":
					return r.bool;
				case "<top>":
					return r.topScope
				}
				return r.localDefs && e in r.localDefs ? r.localDefs[e] : v(e)
			},
			parsePoly: function(e) {
				var r, n, o, i = "<i>";
				return (r = this.spec.slice(this.pos).match(/^\s*(\w+)\s*=\s*/)) && (i = r[1],
				this.pos += r[0].length),
				n = this.parseType(!0),
				this.eat("]") || this.error(),
				n.call ? function(r, o) {
					var s = new t.Obj(e);
					return n(r, o).propagate(s.defProp(i)),
					s
				}
				: (o = new t.Obj(e),
				n.propagate(o.defProp(i)),
				o)
			}
		},
		y = e.parseEffect = function(e, r) {
			var o, i, s, a, l, p, h;
			if (0 == e.indexOf("propagate "))
				l = new E(e,10),
				i = l.parseType(!0),
				l.eat(" ") || l.error(),
				s = l.parseType(!0),
				c(r, function(e, t) {
					n(i, e, t).propagate(n(s, e, t))
				});
			else if (0 == e.indexOf("call ")) {
				var d = 5 == e.indexOf("and return ", 5)
				, l = new E(e,d ? 16 : 5)
				, u = l.parseType(!0)
				, f = null 
				, m = [];
				for (l.eat(" this=") && (f = l.parseType(!0)); l.eat(" "); )
					m.push(l.parseType(!0));
				c(r, function(e, r) {
					for (var o, i = n(u, e, r), s = f ? n(f, e, r) : t.ANull, a = [], l = 0; l < m.length; ++l)
						a.push(n(m[l], e, r));
					return o = d ? new t.AVal : t.ANull,
					i.propagate(new t.IsCallee(s,a,null ,o)),
					o
				}, d)
			} else if (o = e.match(/^custom (\S+)\s*(.*)/))
				a = w[o[1]],
				a && c(r, o[2] ? a(o[2]) : a);
			else {
				if (0 != e.indexOf("copy "))
					throw new Error("Unknown effect type: " + e);
				l = new E(e,5),
				p = l.parseType(!0),
				l.eat(" "),
				h = l.parseType(!0),
				c(r, function(e, r) {
					var o = n(p, e, r)
					, i = n(h, e, r);
					o.forAllProps(function(e, r, n) {
						n && "<i>" != e && i.propagate(new t.PropHasSubset(e,r))
					})
				})
			}
		}
		,
		v = e.parsePath = function(e, r) {
			var n, o, i, s, a, l, c, p, h = t.cx(), d = h.paths[e], u = e;
			if (null  != d)
				return d;
			if (h.paths[e] = t.ANull,
			n = r || b || h.topScope,
			h.localDefs)
				for (o in h.localDefs)
					if (0 == e.indexOf(o)) {
						if (e == o)
							return h.paths[e] = h.localDefs[e];
						if ("." == e.charAt(o.length)) {
							n = h.localDefs[o],
							e = e.slice(o.length + 1);
							break
						}
					}
			for (i = e.split("."),
			s = 0; s < i.length && n != t.ANull; ++s)
				a = i[s],
				"!" == a.charAt(0) ? "!proto" == a ? n = n instanceof t.Obj && n.proto || t.ANull : (l = n.getFunctionType(),
				l ? "!ret" == a ? n = l.retval && l.retval.getType(!1) || t.ANull : (c = l.args && l.args[Number(a.slice(1))],
				n = c && c.getType(!1) || t.ANull) : n = t.ANull) : n instanceof t.Obj && (p = "prototype" == a && n instanceof t.Fn ? n.getProp(a) : n.props[a],
				n = !p || p.isEmpty() ? t.ANull : p.types[0]);
			return h.paths[u] = n == t.ANull ? null  : n,
			n
		}
		,
		e.load = function(e, r) {
			r || (r = t.cx().topScope);
			var n = b;
			b = r;
			try {
				g(e, r)
			} finally {
				b = n
			}
		}
		,
		e.parse = function(e, r, n) {
			var o = t.cx();
			r && (o.origin = r,
			o.localDefs = o.definitions[r]);
			try {
				return "string" == typeof e ? l(e, n) : u(d(null , e, n), e, n)
			} finally {
				r && (o.origin = o.localDefs = null )
			}
		}
		,
		w = Object.create(null ),
		t.registerFunction = function(e, t) {
			w[e] = t
		}
		,
		S = t.constraint({
			construct: function(e, t, r) {
				this.created = e,
				this.target = t,
				this.spec = r
			},
			addType: function(e) {
				var r, n, o, i, s, a;
				if (e instanceof t.Obj && this.created++ < 5) {
					if (r = new t.Obj(e),
					n = this.spec,
					n instanceof t.AVal && (n = n.getObjType(!1)),
					n instanceof t.Obj)
						for (o in n.props)
							i = n.props[o].types[0],
							s = r.defProp(o),
							i && i instanceof t.Obj && i.props.value && (a = i.props.value.getType(!1),
							a && s.addType(a));
					this.target.addType(r)
				}
			}
		}),
		t.registerFunction("Object_create", function(e, r, n) {
			if (n && n.length && "Literal" == n[0].type && null  == n[0].value)
				return new t.Obj;
			var o = new t.AVal;
			return r[0] && r[0].propagate(new S(0,o,r[1])),
			o
		}),
		x = t.constraint({
			construct: function(e) {
				this.target = e
			},
			addType: function(e) {
				e instanceof t.Obj && (e.hasProp("value") ? e.getProp("value").propagate(this.target) : e.hasProp("get") && e.getProp("get").propagate(new t.IsCallee(t.ANull,[],null ,this.target)))
			}
		}),
		t.registerFunction("Object_defineProperty", function(e, r, n) {
			if (n && n.length >= 3 && "Literal" == n[1].type && "string" == typeof n[1].value) {
				var o = r[0]
				, i = new t.AVal;
				o.propagate(new t.PropHasSubset(n[1].value,i,n[1])),
				r[2].propagate(new x(i))
			}
			return t.ANull
		}),
		t.registerFunction("Object_defineProperties", function(e, r, n) {
			if (r.length >= 2) {
				var o = r[0];
				r[1].forAllProps(function(e, r, i) {
					if (i) {
						var s = new t.AVal;
						o.propagate(new t.PropHasSubset(e,s,n && n[1])),
						r.propagate(new x(s))
					}
				})
			}
			return t.ANull
		}),
		T = t.constraint({
			construct: function(e, t, r) {
				this.self = e,
				this.args = t,
				this.target = r
			},
			addType: function(e) {
				if (e instanceof t.Fn) {
					this.target.addType(new t.Fn(e.name,t.ANull,e.args.slice(this.args.length),e.argNames.slice(this.args.length),e.retval)),
					this.self.propagate(e.self);
					for (var r = 0; r < Math.min(e.args.length, this.args.length); ++r)
						this.args[r].propagate(e.args[r])
				}
			}
		}),
		t.registerFunction("Function_bind", function(e, r) {
			if (!r.length)
				return t.ANull;
			var n = new t.AVal;
			return e.propagate(new T(r[0],r.slice(1),n)),
			n
		}),
		t.registerFunction("Array_ctor", function(e, r) {
			var n, o, i = new t.Arr;
			if (1 != r.length || !r[0].hasType(t.cx().num))
				for (n = i.getProp("<i>"),
				o = 0; o < r.length; ++o)
					r[o].propagate(n);
			return i
		}),
		t.registerFunction("Promise_ctor", function(e, r, n) {
			var o, i;
			if (r.length < 1)
				return t.ANull;
			var s = new t.Obj(t.cx().definitions.ecma6["Promise.prototype"])
			, a = s.defProp("value", n && n[0])
			, l = new t.AVal;
			return l.propagate(a),
			o = new t.Fn("execute",t.ANull,[l],["value"],t.ANull),
			i = t.cx().definitions.ecma6.promiseReject,
			r[0].propagate(new t.IsCallee(t.ANull,[o, i],null ,t.ANull)),
			s
		}),
		O = t.constraint({
			construct: function(e) {
				this.output = e
			},
			addType: function(e) {
				e.constructor == t.Obj && "Promise" == e.name && e.hasProp("value") ? e.getProp("value").propagate(this.output) : e.propagate(this.output)
			}
		}),
		j = 50,
		t.registerFunction("Promise_then", function(e, r, n) {
			var o, i, s = r.length && r[0].getFunctionType();
			return s ? (o = new t.Obj(t.cx().definitions.ecma6["Promise.prototype"]),
			i = o.defProp("value", n && n[0]),
			s.retval.isEmpty() && e.hasProp("value") && e.getProp("value").propagate(i, j),
			s.retval.propagate(new O(i)),
			o) : e
		}),
		e
	}),
	window.jqueryDefs = {
		"!name": "jQuery",
		"!define": {
			offset: {
				top: "number",
				left: "number"
			},
			keyvalue: {
				name: "string",
				value: "string"
			}
		},
		jQuery: {
			"!type": "fn(selector: string, context?: frameElement) -> jQuery.fn",
			"!url": "http://api.jquery.com/jquery/",
			"!doc": "Return a collection of matched elements either found in the DOM based on passed argument(s) or created by passing an HTML string.",
			fn: {
				add: {
					"!type": "fn(selector: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/add/",
					"!doc": "Add elements to the set of matched elements."
				},
				addBack: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/addBack/",
					"!doc": "Add the previous set of elements on the stack to the current set, optionally filtered by a selector."
				},
				addClass: {
					"!type": "fn(className: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/addClass/",
					"!doc": "Adds the specified class(es) to each of the set of matched elements."
				},
				after: {
					"!type": "fn(content: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/after/",
					"!doc": "Insert content, specified by the parameter, after each element in the set of matched elements."
				},
				ajaxComplete: {
					"!type": "fn(handler: fn(event: +jQuery.Event, req: +XMLHttpRequest)) -> jQuery.fn",
					"!url": "http://api.jquery.com/ajaxComplete/",
					"!doc": "Register a handler to be called when Ajax requests complete. This is an AjaxEvent."
				},
				ajaxError: {
					"!type": "fn(handler: fn(event: +jQuery.Event, req: +XMLHttpRequest)) -> jQuery.fn",
					"!url": "http://api.jquery.com/ajaxError/",
					"!doc": "Register a handler to be called when Ajax requests complete with an error. This is an Ajax Event."
				},
				ajaxSend: {
					"!type": "fn(handler: fn(event: +jQuery.Event, req: +XMLHttpRequest)) -> jQuery.fn",
					"!url": "http://api.jquery.com/ajaxSend/",
					"!doc": "Attach a function to be executed before an Ajax request is sent. This is an Ajax Event."
				},
				ajaxStart: {
					"!type": "fn(handler: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/ajaxStart/",
					"!doc": "Register a handler to be called when the first Ajax request begins. This is an Ajax Event."
				},
				ajaxStop: {
					"!type": "fn(handler: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/ajaxStop/",
					"!doc": "Register a handler to be called when all Ajax requests have completed. This is an Ajax Event."
				},
				ajaxSuccess: {
					"!type": "fn(handler: fn(event: +jQuery.Event, req: +XMLHttpRequest)) -> jQuery.fn",
					"!url": "http://api.jquery.com/ajaxSuccess/",
					"!doc": ""
				},
				andSelf: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/andSelf/",
					"!doc": "Attach a function to be executed whenever an Ajax request completes successfully. This is an Ajax Event."
				},
				animate: {
					"!type": "fn(properties: ?, duration?: number, easing?: string, complete?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/animate/",
					"!doc": "Perform a custom animation of a set of CSS properties."
				},
				append: {
					"!type": "fn(content: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/append/",
					"!doc": "Insert content, specified by the parameter, to the end of each element in the set of matched elements."
				},
				appendTo: {
					"!type": "fn(target: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/appendTo/",
					"!doc": "Insert every element in the set of matched elements to the end of the target."
				},
				attr: {
					"!type": "fn(name: string, value?: string) -> string",
					"!url": "http://api.jquery.com/attr/",
					"!doc": "Get the value of an attribute for the first element in the set of matched elements or set one or more attributes for every matched element."
				},
				before: {
					"!type": "fn(content: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/before/",
					"!doc": "Insert content, specified by the parameter, before each element in the set of matched elements."
				},
				bind: {
					"!type": "fn(eventType: string, handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/bind/",
					"!doc": "Attach a handler to an event for the elements."
				},
				blur: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/blur/",
					"!doc": "Bind an event handler to the 'blur' JavaScript event, or trigger that event on an element."
				},
				change: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/change/",
					"!doc": "Bind an event handler to the 'change' JavaScript event, or trigger that event on an element."
				},
				children: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/children/",
					"!doc": "Get the children of each element in the set of matched elements, optionally filtered by a selector."
				},
				click: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/click/",
					"!doc": "Bind an event handler to the 'click' JavaScript event, or trigger that event on an element."
				},
				clone: {
					"!type": "fn(dataAndEvents?: bool, deep?: bool) -> jQuery.fn",
					"!url": "http://api.jquery.com/clone/",
					"!doc": "Create a deep copy of the set of matched elements."
				},
				closest: {
					"!type": "fn(selector: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/closest/",
					"!doc": "For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree."
				},
				contents: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/contents/",
					"!doc": "Get the children of each element in the set of matched elements, including text and comment nodes."
				},
				context: {
					"!type": "fn() -> +Element",
					"!url": "http://api.jquery.com/context/",
					"!doc": "The DOM node context originally passed to jQuery(); if none was passed then context will likely be the document."
				},
				css: {
					"!type": "fn(name: string, value?: string) -> string",
					"!url": "http://api.jquery.com/css/",
					"!doc": "Get the value of a style property for the first element in the set of matched elements or set one or more CSS properties for every matched element."
				},
				data: {
					"!type": "fn(key: string, value?: ?) -> !1",
					"!url": "http://api.jquery.com/data/",
					"!doc": "Store arbitrary data associated with the matched elements or return the value at the named data store for the first element in the set of matched elements."
				},
				dblclick: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/dblclick/",
					"!doc": "Bind an event handler to the 'dblclick' JavaScript event, or trigger that event on an element."
				},
				delay: {
					"!type": "fn(duration: number, queue?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/delay/",
					"!doc": "Set a timer to delay execution of subsequent items in the queue."
				},
				delegate: {
					"!type": "fn(selector: string, eventType: string, handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/delegate/",
					"!doc": "Attach a handler to one or more events for all elements that match the selector, now or in the future, based on a specific set of root elements."
				},
				dequeue: {
					"!type": "fn(queue?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/dequeue/",
					"!doc": "Execute the next function on the queue for the matched elements."
				},
				detach: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/detach/",
					"!doc": "Remove the set of matched elements from the DOM."
				},
				die: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/die/",
					"!doc": "Remove event handlers previously attached using .live() from the elements."
				},
				each: {
					"!type": "fn(callback: fn(i: number, element: +Element)) -> jQuery.fn",
					"!url": "http://api.jquery.com/each/",
					"!doc": "Iterate over a jQuery object, executing a function for each matched element."
				},
				empty: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/empty/",
					"!doc": "Remove all child nodes of the set of matched elements from the DOM."
				},
				end: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/end/",
					"!doc": "End the most recent filtering operation in the current chain and return the set of matched elements to its previous state."
				},
				eq: {
					"!type": "fn(i: number) -> jQuery.fn",
					"!url": "http://api.jquery.com/eq/",
					"!doc": "Reduce the set of matched elements to the one at the specified index."
				},
				error: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/error/",
					"!doc": "Bind an event handler to the 'error' JavaScript event."
				},
				fadeIn: {
					"!type": "fn(duration?: number, complete?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/fadeIn/",
					"!doc": "Display the matched elements by fading them to opaque."
				},
				fadeOut: {
					"!type": "fn(duration?: number, complete?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/fadeOut/",
					"!doc": "Hide the matched elements by fading them to transparent."
				},
				fadeTo: {
					"!type": "fn(duration: number, opacity: number, complete?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/fadeTo/",
					"!doc": "Adjust the opacity of the matched elements."
				},
				fadeToggle: {
					"!type": "fn(duration?: number, easing?: string, complete?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/fadeToggle/",
					"!doc": "Display or hide the matched elements by animating their opacity."
				},
				filter: {
					"!type": "fn(selector: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/filter/",
					"!doc": "Reduce the set of matched elements to those that match the selector or pass the function's test."
				},
				find: {
					"!type": "fn(selector: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/find/",
					"!doc": "Get the descendants of each element in the current set of matched elements, filtered by a selector, jQuery object, or element."
				},
				finish: {
					"!type": "fn(queue?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/finish/",
					"!doc": "Stop the currently-running animation, remove all queued animations, and complete all animations for the matched elements."
				},
				first: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/first/",
					"!doc": "Reduce the set of matched elements to the first in the set."
				},
				focusin: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/focusin/",
					"!doc": "Bind an event handler to the 'focusin' event."
				},
				focusout: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/focusout/",
					"!doc": "Bind an event handler to the 'focusout' JavaScript event."
				},
				get: {
					"!type": "fn(i: number) -> +Element",
					"!url": "http://api.jquery.com/get/",
					"!doc": "Retrieve the DOM elements matched by the jQuery object."
				},
				has: {
					"!type": "fn(selector: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/has/",
					"!doc": "Reduce the set of matched elements to those that have a descendant that matches the selector or DOM element."
				},
				hasClass: {
					"!type": "fn(className: string) -> bool",
					"!url": "http://api.jquery.com/hasClass/",
					"!doc": "Determine whether any of the matched elements are assigned the given class."
				},
				height: {
					"!type": "fn() -> number",
					"!url": "http://api.jquery.com/height/",
					"!doc": "Get the current computed height for the first element in the set of matched elements or set the height of every matched element."
				},
				hide: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/hide/",
					"!doc": "Hide the matched elements."
				},
				hover: {
					"!type": "fn(fnOver: fn(+jQuery.Event), fnOut?: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/hover/",
					"!doc": "Bind one or two handlers to the matched elements, to be executed when the mouse pointer enters and leaves the elements."
				},
				html: {
					"!type": "fn() -> string",
					"!url": "http://api.jquery.com/html/",
					"!doc": "Get the HTML contents of the first element in the set of matched elements or set the HTML contents of every matched element."
				},
				index: {
					"!type": "fn(selector?: string) -> number",
					"!url": "http://api.jquery.com/index/",
					"!doc": "Search for a given element from among the matched elements."
				},
				innerHeight: {
					"!type": "fn() -> number",
					"!url": "http://api.jquery.com/innerHeight/",
					"!doc": "Get the current computed height for the first element in the set of matched elements, including padding but not border."
				},
				innerWidth: {
					"!type": "fn() -> number",
					"!url": "http://api.jquery.com/innerWidth/",
					"!doc": "Get the current computed width for the first element in the set of matched elements, including padding but not border."
				},
				insertAfter: {
					"!type": "fn(target: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/insertAfter/",
					"!doc": "Insert every element in the set of matched elements after the target."
				},
				insertBefore: {
					"!type": "fn(target: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/insertBefore/",
					"!doc": "Insert every element in the set of matched elements before the target."
				},
				is: {
					"!type": "fn(selector: ?) -> bool",
					"!url": "http://api.jquery.com/is/",
					"!doc": "Check the current matched set of elements against a selector, element, or jQuery object and return true if at least one of these elements matches the given arguments."
				},
				jquery: {
					"!type": "string",
					"!url": "http://api.jquery.com/jquery-2/",
					"!doc": "A string containing the jQuery version number."
				},
				keydown: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/keydown/",
					"!doc": "Bind an event handler to the 'keydown' JavaScript event, or trigger that event on an element."
				},
				keypress: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/keypress/",
					"!doc": "Bind an event handler to the 'keypress' JavaScript event, or trigger that event on an element."
				},
				keyup: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/keyup/",
					"!doc": "Bind an event handler to the 'keyup' JavaScript event, or trigger that event on an element."
				},
				last: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/last/",
					"!doc": "Reduce the set of matched elements to the final one in the set."
				},
				length: {
					"!type": "number",
					"!url": "http://api.jquery.com/length/",
					"!doc": "The number of elements in the jQuery object."
				},
				live: {
					"!type": "fn(selector: string, handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/live/",
					"!doc": "Attach an event handler for all elements which match the current selector, now and in the future."
				},
				load: {
					"!type": "fn(handler: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/load/",
					"!doc": "Load data from the server and place the returned HTML into the matched element."
				},
				map: {
					"!type": "fn(callback: fn(i: number, element: +Element)) -> jQuery.fn",
					"!url": "http://api.jquery.com/map/",
					"!doc": "Pass each element in the current matched set through a function, producing a new jQuery object containing the return values."
				},
				mousedown: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/mousedown/",
					"!doc": "Bind an event handler to the 'mousedown' JavaScript event, or trigger that event on an element."
				},
				mouseenter: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/mouseenter/",
					"!doc": "Bind an event handler to be fired when the mouse enters an element, or trigger that handler on an element."
				},
				mouseleave: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/mouseleave/",
					"!doc": "Bind an event handler to be fired when the mouse leaves an element, or trigger that handler on an element."
				},
				mousemove: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/mousemouve/",
					"!doc": "Bind an event handler to the 'mousemove' JavaScript event, or trigger that event on an element."
				},
				mouseout: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/mouseout/",
					"!doc": "Bind an event handler to the 'mouseout' JavaScript event, or trigger that event on an element."
				},
				mouseover: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/mouseover/",
					"!doc": "Bind an event handler to the 'mouseover' JavaScript event, or trigger that event on an element."
				},
				mouseup: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/mouseup/",
					"!doc": "Bind an event handler to the 'mouseup' JavaScript event, or trigger that event on an element."
				},
				next: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/next/",
					"!doc": "Get the immediately following sibling of each element in the set of matched elements. If a selector is provided, it retrieves the next sibling only if it matches that selector."
				},
				nextAll: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/nextAll/",
					"!doc": "Get all following siblings of each element in the set of matched elements, optionally filtered by a selector."
				},
				nextUntil: {
					"!type": "fn(selector?: string, filter?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/nextUntil/",
					"!doc": "Get all following siblings of each element up to but not including the element matched by the selector, DOM node, or jQuery object passed."
				},
				not: {
					"!type": "fn(selector: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/not/",
					"!doc": "Remove elements from the set of matched elements."
				},
				off: {
					"!type": "fn(events: string, selector?: string, handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/off/",
					"!doc": "Remove an event handler."
				},
				offset: {
					"!type": "fn() -> offset",
					"!url": "http://api.jquery.com/offset/",
					"!doc": "Get the current coordinates of the first element, or set the coordinates of every element, in the set of matched elements, relative to the document."
				},
				offsetParent: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/offsetParent/",
					"!doc": "Get the closest ancestor element that is positioned."
				},
				on: {
					"!type": "fn(events: string, handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/on/",
					"!doc": "Attach an event handler function for one or more events to the selected elements."
				},
				one: {
					"!type": "fn(events: string, data?: ?, handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/one/",
					"!doc": "Attach a handler to an event for the elements. The handler is executed at most once per element."
				},
				outerHeight: {
					"!type": "fn(includeMargin?: bool) -> number",
					"!url": "http://api.jquery.com/outerHeight/",
					"!doc": "Get the current computed height for the first element in the set of matched elements, including padding, border, and optionally margin. Returns an integer (without 'px') representation of the value or null if called on an empty set of elements."
				},
				outerWidth: {
					"!type": "fn(includeMargin?: bool) -> number",
					"!url": "http://api.jquery.com/outerWidth/",
					"!doc": "Get the current computed width for the first element in the set of matched elements, including padding and border."
				},
				parent: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/parent/",
					"!doc": "Get the parent of each element in the current set of matched elements, optionally filtered by a selector."
				},
				parents: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/parents/",
					"!doc": "Get the ancestors of each element in the current set of matched elements, optionally filtered by a selector."
				},
				parentsUntil: {
					"!type": "fn(selector?: string, filter?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/parentsUntil/",
					"!doc": "Get the ancestors of each element in the current set of matched elements, up to but not including the element matched by the selector, DOM node, or jQuery object."
				},
				position: {
					"!type": "fn() -> offset",
					"!url": "http://api.jquery.com/position/",
					"!doc": "Get the current coordinates of the first element in the set of matched elements, relative to the offset parent."
				},
				prepend: {
					"!type": "fn(content: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/prepend/",
					"!doc": "Insert content, specified by the parameter, to the beginning of each element in the set of matched elements."
				},
				prependTo: {
					"!type": "fn(target: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/prependTo/",
					"!doc": "Insert every element in the set of matched elements to the beginning of the target."
				},
				prev: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/prev/",
					"!doc": "Get the immediately preceding sibling of each element in the set of matched elements, optionally filtered by a selector."
				},
				prevAll: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/prevAll/",
					"!doc": "Get all preceding siblings of each element in the set of matched elements, optionally filtered by a selector."
				},
				prevUntil: {
					"!type": "fn(selector?: string, filter?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/prevUntil/",
					"!doc": "Get all preceding siblings of each element up to but not including the element matched by the selector, DOM node, or jQuery object."
				},
				promise: {
					"!type": "fn(type?: string, target: ?) -> +jQuery.Promise",
					"!url": "http://api.jquery.com/promise/",
					"!doc": "Return a Promise object to observe when all actions of a certain type bound to the collection, queued or not, have finished."
				},
				prop: {
					"!type": "fn(name: string, value?: string) -> string",
					"!url": "http://api.jquery.com/prop/",
					"!doc": "Get the value of a property for the first element in the set of matched elements or set one or more properties for every matched element."
				},
				pushStack: {
					"!type": "fn(elements: [+Element]) -> jQuery.fn",
					"!url": "http://api.jquery.com/pushStack/",
					"!doc": "Add a collection of DOM elements onto the jQuery stack."
				},
				queue: {
					"!type": "fn(queue?: string) -> [?]",
					"!url": "http://api.jquery.com/queue/",
					"!doc": "Show or manipulate the queue of functions to be executed on the matched elements."
				},
				ready: {
					"!type": "fn(fn: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/ready/",
					"!doc": "Specify a function to execute when the DOM is fully loaded."
				},
				remove: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/remove/",
					"!doc": "Remove the set of matched elements from the DOM."
				},
				removeAttr: {
					"!type": "fn(attrName: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/removeAttr/",
					"!doc": "Remove an attribute from each element in the set of matched elements."
				},
				removeClass: {
					"!type": "fn(className?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/removeClass/",
					"!doc": "Remove a single class, multiple classes, or all classes from each element in the set of matched elements."
				},
				removeData: {
					"!type": "fn(name?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/removeData/",
					"!doc": "Remove a previously-stored piece of data."
				},
				removeProp: {
					"!type": "fn(propName: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/removeProp/",
					"!doc": "Remove a property for the set of matched elements."
				},
				replaceAll: {
					"!type": "fn(target: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/replaceAll/",
					"!doc": "Replace each target element with the set of matched elements."
				},
				replaceWith: {
					"!type": "fn(newContent: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/replaceWith/",
					"!doc": "Replace each element in the set of matched elements with the provided new content and return the set of elements that was removed."
				},
				resize: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/resize/",
					"!doc": "Bind an event handler to the 'resize' JavaScript event, or trigger that event on an element."
				},
				scroll: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/scroll/",
					"!doc": "Bind an event handler to the 'scroll' JavaScript event, or trigger that event on an element."
				},
				scrollLeft: {
					"!type": "number",
					"!url": "http://api.jquery.com/scrollLeft/",
					"!doc": "Get the current horizontal position of the scroll bar for the first element in the set of matched elements or set the horizontal position of the scroll bar for every matched element."
				},
				scrollTop: {
					"!type": "number",
					"!url": "http://api.jquery.com/scrollTop/",
					"!doc": "Get the current vertical position of the scroll bar for the first element in the set of matched elements or set the vertical position of the scroll bar for every matched element."
				},
				select: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/select/",
					"!doc": "Bind an event handler to the 'select' JavaScript event, or trigger that event on an element."
				},
				selector: {
					"!type": "string",
					"!url": "http://api.jquery.com/selector/",
					"!doc": "A selector representing selector passed to jQuery(), if any, when creating the original set."
				},
				serialize: {
					"!type": "fn() -> string",
					"!url": "http://api.jquery.com/serialize/",
					"!doc": "Encode a set of form elements as a string for submission."
				},
				serializeArray: {
					"!type": "fn() -> [keyvalue]",
					"!url": "http://api.jquery.com/serializeArray/",
					"!doc": "Encode a set of form elements as an array of names and values."
				},
				show: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/show/",
					"!doc": "Display the matched elements."
				},
				siblings: {
					"!type": "fn(selector?: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/siblings/",
					"!doc": "Get the siblings of each element in the set of matched elements, optionally filtered by a selector."
				},
				size: {
					"!type": "fn() -> number",
					"!url": "http://api.jquery.com/size/",
					"!doc": "Return the number of elements in the jQuery object."
				},
				slice: {
					"!type": "fn(start: number, end?: number) -> jQuery.fn",
					"!url": "http://api.jquery.com/slice/",
					"!doc": "Reduce the set of matched elements to a subset specified by a range of indices."
				},
				slideDown: {
					"!type": "fn(duration?: number, complete?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/slideDown/",
					"!doc": "Display the matched elements with a sliding motion."
				},
				slideToggle: {
					"!type": "fn(duration?: number, complete?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/slideToggle/",
					"!doc": "Display or hide the matched elements with a sliding motion."
				},
				slideUp: {
					"!type": "fn(duration?: number, complete?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/slideUp/",
					"!doc": "Hide the matched elements with a sliding motion."
				},
				stop: {
					"!type": "fn(clearQueue?: bool, jumpToEnd?: bool) -> jQuery.fn",
					"!url": "http://api.jquery.com/stop/",
					"!doc": "Stop the currently-running animation on the matched elements."
				},
				submit: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/submit/",
					"!doc": "Bind an event handler to the 'submit' JavaScript event, or trigger that event on an element."
				},
				text: {
					"!type": "fn() -> string",
					"!url": "http://api.jquery.com/text/",
					"!doc": "Get the combined text contents of each element in the set of matched elements, including their descendants, or set the text contents of the matched elements."
				},
				toArray: {
					"!type": "fn() -> [+Element]",
					"!url": "http://api.jquery.com/toArray/",
					"!doc": "Retrieve all the DOM elements contained in the jQuery set, as an array."
				},
				toggle: {
					"!type": "fn(duration?: number, complete?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/toggle/",
					"!doc": "Display or hide the matched elements."
				},
				toggleClass: {
					"!type": "fn(className: string) -> jQuery.fn",
					"!url": "http://api.jquery.com/toggleClass/",
					"!doc": "Add or remove one or more classes from each element in the set of matched elements, depending on either the class's presence or the value of the switch argument."
				},
				trigger: {
					"!type": "fn(eventType: string, params: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/trigger/",
					"!doc": "Execute all handlers and behaviors attached to the matched elements for the given event type."
				},
				triggerHandler: {
					"!type": "fn(eventType: string, params: ?) -> ?",
					"!url": "http://api.jquery.com/triggerHandler/",
					"!doc": "Execute all handlers attached to an element for an event."
				},
				unbind: {
					"!type": "fn(eventType?: string, handler?: fn()) -> jQuery.fn",
					"!url": "http://api.jquery.com/unbind/",
					"!doc": "Remove a previously-attached event handler from the elements."
				},
				undelegate: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/undelegate/",
					"!doc": "Remove a handler from the event for all elements which match the current selector, based upon a specific set of root elements."
				},
				unload: {
					"!type": "fn(handler: fn(+jQuery.Event)) -> jQuery.fn",
					"!url": "http://api.jquery.com/unload/",
					"!doc": "Bind an event handler to the 'unload' JavaScript event."
				},
				unwrap: {
					"!type": "fn() -> jQuery.fn",
					"!url": "http://api.jquery.com/unwrap/",
					"!doc": "Remove the parents of the set of matched elements from the DOM, leaving the matched elements in their place."
				},
				val: {
					"!type": "fn() -> string",
					"!url": "http://api.jquery.com/val/",
					"!doc": "Get the current value of the first element in the set of matched elements or set the value of every matched element."
				},
				width: {
					"!type": "fn() -> number",
					"!url": "http://api.jquery.com/width/",
					"!doc": "Get the current computed width for the first element in the set of matched elements or set the width of every matched element."
				},
				wrap: {
					"!type": "fn(wrappingElement: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/wrap/",
					"!doc": "Wrap an HTML structure around each element in the set of matched elements."
				},
				wrapAll: {
					"!type": "fn(wrappingElement: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/wrapAll/",
					"!doc": "Wrap an HTML structure around all elements in the set of matched elements."
				},
				wrapInner: {
					"!type": "fn(wrappingElement: ?) -> jQuery.fn",
					"!url": "http://api.jquery.com/wrapInner/",
					"!doc": "Wrap an HTML structure around the content of each element in the set of matched elements."
				},
				slice: {
					"!type": "fn(start: number, end: number) -> jQuery.fn",
					"!url": "http://api.jquery.com/slice/",
					"!doc": "Reduce the set of matched elements to a subset specified by a range of indices."
				},
				push: {
					"!type": "Array.prototype.push",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/push",
					"!doc": "Mutates an array by appending the given elements and returning the new length of the array."
				},
				sort: {
					"!type": "Array.prototype.sort",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/sort",
					"!doc": "Sorts the elements of an array in place and returns the array."
				},
				splice: {
					"!type": "Array.prototype.splice",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/splice",
					"!doc": "Changes the content of an array, adding new elements while removing old elements."
				}
			},
			ajax: {
				"!type": "fn(url: string, settings: ?) -> +jQuery.jqXHR",
				"!url": "http://api.jquery.com/jquery.ajax/",
				"!doc": "Perform an asynchronous HTTP (Ajax) request."
			},
			ajaxPrefilter: {
				"!type": "fn(dataTypes?: string, handler: fn(options: ?, originalOptions: ?, req: +XMLHttpRequest))",
				"!url": "http://api.jquery.com/jquery.ajaxPrefilter/",
				"!doc": "Handle custom Ajax options or modify existing options before each request is sent and before they are processed by $.ajax()."
			},
			ajaxSetup: {
				"!type": "fn(options: ?)",
				"!url": "http://api.jquery.com/jquery.ajaxSetup/",
				"!doc": "Set default values for future Ajax requests. Its use is not recommended."
			},
			ajaxTransport: {
				"!type": "fn(dataType: string, handler: fn(options: ?, originalOptions: ?, req: +XMLHttpRequest))",
				"!url": "http://api.jquery.com/jquery.ajaxTransport/",
				"!doc": "Creates an object that handles the actual transmission of Ajax data."
			},
			Callbacks: {
				"!type": "fn(flags: string) -> +jQuery.Callbacks",
				"!url": "http://api.jquery.com/jquery.Callbacks/",
				"!doc": "A multi-purpose callbacks list object that provides a powerful way to manage callback lists.",
				prototype: {
					add: {
						"!type": "fn(callbacks: ?) -> +jQuery.Callbacks",
						"!url": "http://api.jquery.com/callbacks.add/",
						"!doc": "Add a callback or a collection of callbacks to a callback list."
					},
					disable: {
						"!type": "fn() -> +jQuery.Callbacks",
						"!url": "http://api.jquery.com/callbacks.disable/",
						"!doc": "Disable a callback list from doing anything more."
					},
					disabled: {
						"!type": "fn() -> bool",
						"!url": "http://api.jquery.com/callbacks.disabled/",
						"!doc": "Determine if the callbacks list has been disabled."
					},
					empty: {
						"!type": "fn() -> +jQuery.Callbacks",
						"!url": "http://api.jquery.com/callbacks.empty/",
						"!doc": "Remove all of the callbacks from a list."
					},
					fire: {
						"!type": "fn(arguments: ?) -> +jQuery.Callbacks",
						"!url": "http://api.jquery.com/callbacks.fire/",
						"!doc": "Call all of the callbacks with the given arguments"
					},
					fired: {
						"!type": "fn() -> bool",
						"!url": "http://api.jquery.com/callbacks.fired/",
						"!doc": "Determine if the callbacks have already been called at least once."
					},
					fireWith: {
						"!type": "fn(context?: ?, args?: ?) -> +jQuery.Callbacks",
						"!url": "http://api.jquery.com/callbacks.fireWith/",
						"!doc": "Call all callbacks in a list with the given context and arguments."
					},
					has: {
						"!type": "fn(callback: fn()) -> bool",
						"!url": "http://api.jquery.com/callbacks.has/",
						"!doc": "Determine whether a supplied callback is in a list."
					},
					lock: {
						"!type": "fn() -> +jQuery.Callbacks",
						"!url": "http://api.jquery.com/callbacks.lock/",
						"!doc": "Lock a callback list in its current state."
					},
					locked: {
						"!type": "fn() -> bool",
						"!url": "http://api.jquery.com/callbacks.locked/",
						"!doc": "Determine if the callbacks list has been locked."
					},
					remove: {
						"!type": "fn(callbacks: ?) -> +jQuery.Callbacks",
						"!url": "http://api.jquery.com/callbacks.remove/",
						"!doc": "Remove a callback or a collection of callbacks from a callback list."
					}
				}
			},
			contains: {
				"!type": "fn(container: +Element, contained: +Element) -> bool",
				"!url": "http://api.jquery.com/jquery.contains/",
				"!doc": "Check to see if a DOM element is a descendant of another DOM element."
			},
			cssHooks: {
				"!type": "?",
				"!url": "http://api.jquery.com/cssHooks/",
				"!doc": "Hook directly into jQuery to override how particular CSS properties are retrieved or set, normalize CSS property naming, or create custom properties."
			},
			data: {
				"!type": "fn(element: +Element, key: string, value: ?) -> !2",
				"!url": "http://api.jquery.com/jquery.data/",
				"!doc": "Store arbitrary data associated with the specified element and/or return the value that was set."
			},
			Event: {
				"!type": "fn(type: ?, props?: ?) -> +jQuery.Event",
				"!url": "http://api.jquery.com/category/events/event-object/",
				"!doc": "The jQuery.Event constructor is exposed and can be used when calling trigger. The new operator is optional.",
				prototype: {
					currentTarget: {
						"!type": "+Element",
						"!url": "http://api.jquery.com/event.currentTarget/",
						"!doc": "The current DOM element within the event bubbling phase."
					},
					data: {
						"!type": "?",
						"!url": "http://api.jquery.com/event.data/",
						"!doc": "An optional object of data passed to an event method when the current executing handler is bound."
					},
					delegateTarget: {
						"!type": "+Element",
						"!url": "http://api.jquery.com/event.delegateTarget/",
						"!doc": "The element where the currently-called jQuery event handler was attached."
					},
					isDefaultPrevented: {
						"!type": "fn() -> bool",
						"!url": "http://api.jquery.com/event.isDefaultPrevented/",
						"!doc": "Returns whether event.preventDefault() was ever called on this event object."
					},
					isImmediatePropagationStopped: {
						"!type": "fn() -> bool",
						"!url": "http://api.jquery.com/event.isImmediatePropagationStopped/",
						"!doc": "Returns whether event.stopImmediatePropagation() was ever called on this event object."
					},
					isPropagationStopped: {
						"!type": "fn() -> bool",
						"!url": "http://api.jquery.com/event.isPropagationStopped/",
						"!doc": "Returns whether event.stopPropagation() was ever called on this event object."
					},
					metaKey: {
						"!type": "bool",
						"!url": "http://api.jquery.com/event.metaKey/",
						"!doc": "Indicates whether the META key was pressed when the event fired."
					},
					namespace: {
						"!type": "string",
						"!url": "http://api.jquery.com/event.namespace/",
						"!doc": "The namespace specified when the event was triggered."
					},
					pageX: {
						"!type": "number",
						"!url": "http://api.jquery.com/event.pageX/",
						"!doc": "The mouse position relative to the left edge of the document."
					},
					pageY: {
						"!type": "number",
						"!url": "http://api.jquery.com/event.pageY/",
						"!doc": "The mouse position relative to the top edge of the document."
					},
					preventDefault: {
						"!type": "fn()",
						"!url": "http://api.jquery.com/event.preventDefault/",
						"!doc": "If this method is called, the default action of the event will not be triggered."
					},
					relatedTarget: {
						"!type": "+Element",
						"!url": "http://api.jquery.com/event.relatedTarget/",
						"!doc": "The other DOM element involved in the event, if any."
					},
					result: {
						"!type": "?",
						"!url": "http://api.jquery.com/event.result/",
						"!doc": "The last value returned by an event handler that was triggered by this event, unless the value was undefined."
					},
					stopImmediatePropagation: {
						"!type": "fn()",
						"!url": "http://api.jquery.com/event.stopImmediatePropagation/",
						"!doc": "Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree."
					},
					stopPropagation: {
						"!type": "fn()",
						"!url": "http://api.jquery.com/event.stopPropagation/",
						"!doc": "Prevents the event from bubbling up the DOM tree, preventing any parent handlers from being notified of the event."
					},
					target: {
						"!type": "+Element",
						"!url": "http://api.jquery.com/event.target/",
						"!doc": "The DOM element that initiated the event."
					},
					timeStamp: {
						"!type": "number",
						"!url": "http://api.jquery.com/event.timeStamp/",
						"!doc": "The difference in milliseconds between the time the browser created the event and January 1, 1970."
					},
					type: {
						"!type": "string",
						"!url": "http://api.jquery.com/event.type/",
						"!doc": "Describes the nature of the event."
					},
					which: {
						"!type": "number",
						"!url": "http://api.jquery.com/event.which/",
						"!doc": "For key or mouse events, this property indicates the specific key or button that was pressed."
					}
				}
			},
			Deferred: {
				"!type": "fn(beforeStart?: fn(deferred: +jQuery.Deferred)) -> +jQuery.Deferred",
				"!url": "http://api.jquery.com/jQuery.Deferred/",
				"!doc": "A constructor function that returns a chainable utility object with methods to register multiple callbacks into callback queues, invoke callback queues, and relay the success or failure state of any synchronous or asynchronous function.",
				prototype: {
					always: {
						"!type": "fn(callback: fn()) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.always/",
						"!doc": "Add handlers to be called when the Deferred object is either resolved or rejected."
					},
					done: {
						"!type": "fn(callback: fn()) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.done/",
						"!doc": "Add handlers to be called when the Deferred object is resolved."
					},
					fail: {
						"!type": "fn(callback: fn()) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.fail/",
						"!doc": "Add handlers to be called when the Deferred object is rejected."
					},
					isRejected: {
						"!type": "fn() -> bool",
						"!url": "http://api.jquery.com/deferred.isRejected/",
						"!doc": "Determine whether a Deferred object has been rejected."
					},
					isResolved: {
						"!type": "fn() -> bool",
						"!url": "http://api.jquery.com/deferred.isResolved/",
						"!doc": "Determine whether a Deferred object has been resolved."
					},
					notify: {
						"!type": "fn(args?: ?) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.notify/",
						"!doc": "Call the progressCallbacks on a Deferred object with the given args."
					},
					notifyWith: {
						"!type": "fn(context?: ?, args?: ?) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.notifyWith/",
						"!doc": "Call the progressCallbacks on a Deferred object with the given context and args."
					},
					pipe: {
						"!type": "fn(doneFilter?: fn(), failFilter?: fn()) -> +jQuery.Promise",
						"!url": "http://api.jquery.com/deferred.pipe/",
						"!doc": "Utility method to filter and/or chain Deferreds."
					},
					progress: {
						"!type": "fn(callback: fn()) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.progress/",
						"!doc": "Add handlers to be called when the Deferred object generates progress notifications."
					},
					promise: {
						"!type": "fn(target: ?) -> +jQuery.Promise",
						"!url": "http://api.jquery.com/deferred.promise/",
						"!doc": "Return a Deferred's Promise object."
					},
					reject: {
						"!type": "fn(args?: ?) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.reject/",
						"!doc": "Reject a Deferred object and call any failCallbacks with the given args."
					},
					rejectWith: {
						"!type": "fn(context?: ?, args?: ?) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.rejectWith/",
						"!doc": "Reject a Deferred object and call any failCallbacks with the given context and args."
					},
					resolve: {
						"!type": "fn(args?: ?) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.resolve/",
						"!doc": "Resolve a Deferred object and call any doneCallbacks with the given args."
					},
					resolveWith: {
						"!type": "fn(context?: ?, args?: ?) -> +jQuery.Deferred",
						"!url": "http://api.jquery.com/deferred.resolveWith/",
						"!doc": "Resolve a Deferred object and call any doneCallbacks with the given context and args."
					},
					state: {
						"!type": "fn() -> string",
						"!url": "http://api.jquery.com/deferred.state/",
						"!doc": "Determine the current state of a Deferred object."
					},
					then: {
						"!type": "fn(doneFilter: fn(), failFilter?: fn(), progressFilter?: fn()) -> +jQuery.Promise",
						"!url": "http://api.jquery.com/deferred.then/",
						"!doc": "Add handlers to be called when the Deferred object is resolved, rejected, or still in progress."
					}
				}
			},
			Promise: {
				"!url": "http://api.jquery.com/jQuery.Deferred/",
				"!doc": "A constructor function that returns a chainable utility object with methods to register multiple callbacks into callback queues, invoke callback queues, and relay the success or failure state of any synchronous or asynchronous function.",
				prototype: {
					always: "fn(callback: fn()) -> +jQuery.Promise",
					done: "fn(callback: fn()) -> +jQuery.Promise",
					fail: "fn(callback: fn()) -> +jQuery.Promise",
					isRejected: "fn() -> bool",
					isResolved: "fn() -> bool",
					pipe: "fn(doneFilter?: fn(), failFilter?: fn()) -> +jQuery.Promise",
					promise: "fn(target: ?) -> +jQuery.Deferred",
					state: "fn() -> string",
					then: "fn(doneFilter: fn(), failFilter?: fn(), progressFilter?: fn()) -> +jQuery.Promise"
				}
			},
			jqXHR: {
				prototype: {
					always: "fn(callback: fn()) -> +jQuery.jqXHR",
					done: "fn(callback: fn()) -> +jQuery.jqXHR",
					fail: "fn(callback: fn()) -> +jQuery.jqXHR",
					isRejected: "fn() -> bool",
					isResolved: "fn() -> bool",
					pipe: "fn(doneFilter?: fn(), failFilter?: fn()) -> +jQuery.Promise",
					promise: "fn(target: ?) -> +jQuery.Promise",
					state: "fn() -> string",
					then: "fn(doneFilter: fn(), failFilter?: fn(), progressFilter?: fn()) -> +jQuery.Promise",
					readyState: "number",
					status: "number",
					statusText: "string",
					responseText: "string",
					responseXML: "string",
					setRequestHeader: "fn(name: string, val: string)",
					getAllResponseHeader: "fn() ->",
					getResponseHeader: "fn() ->",
					statusCode: "fn() -> number",
					abort: "fn()"
				}
			},
			dequeue: {
				"!type": "fn(queue?: string) -> jQuery.fn",
				"!url": "http://api.jquery.com/jQuery.dequeue/",
				"!doc": "Execute the next function on the queue for the matched elements."
			},
			each: {
				"!type": "fn(collection: ?, callback: fn(i: number, elt: ?)) -> !0",
				"!effects": ["call !1 number !0.<i>"],
				"!url": "http://api.jquery.com/jQuery.each/",
				"!doc": "A generic iterator function, which can be used to seamlessly iterate over both objects and arrays. Arrays and array-like objects with a length property (such as a function's arguments object) are iterated by numeric index, from 0 to length-1. Other objects are iterated via their named properties."
			},
			error: "fn(message: string)",
			extend: {
				"!type": "fn(target: ?, source: ?) -> !0",
				"!effects": ["copy !1 !0"]
			},
			fx: {
				"!type": "fn(elem: +Element, options: ?, prop: string, end?: number, easing?: bool)",
				interval: {
					"!type": "number",
					"!url": "http://api.jquery.com/jquery.fx.interval",
					"!doc": "The rate (in milliseconds) at which animations fire."
				},
				off: {
					"!type": "bool",
					"!url": "http://api.jquery.com/jquery.fx.off",
					"!doc": "Globally disable all animations."
				},
				speeds: {
					slow: "number",
					fast: "number",
					_default: "number"
				},
				stop: "fn()",
				tick: "fn()",
				start: "fn()"
			},
			get: {
				"!type": "fn(url: string, data?: ?, success: fn(data: string, textStatus: string, req: +XMLHttpRequest), dataType?: string) -> +jQuery.jqXHR",
				"!url": "http://api.jquery.com/jquery.get/",
				"!doc": "Load data from the server using a HTTP GET request."
			},
			getJSON: {
				"!type": "fn(url: string, data?: ?, success: fn(data: ?, textStatus: string, req: +XMLHttpRequest)) -> +jQuery.jqXHR",
				"!url": "http://api.jquery.com/jquery.getJSON/",
				"!doc": "Load JSON-encoded data from the server using a GET HTTP request."
			},
			getScript: {
				"!type": "fn(url: string, success?: fn(script: string, textStatus: string, req: +XMLHttpRequest)) -> +jQuery.jqXHR",
				"!url": "http://api.jquery.com/jquery.getScript/",
				"!doc": "Load a JavaScript file from the server using a GET HTTP request, then execute it."
			},
			globalEval: {
				"!type": "fn(code: string)",
				"!url": "http://api.jquery.com/jquery.globalEval/",
				"!doc": "Execute some JavaScript code globally."
			},
			grep: {
				"!type": "fn(array: [?], filter: fn(elt: ?, i: number), invert?: bool) -> !0",
				"!effects": ["call !1 !0.<i> number"],
				"!url": "http://api.jquery.com/jquery.grep/",
				"!doc": "Finds the elements of an array which satisfy a filter function. The original array is not affected."
			},
			hasData: {
				"!type": "fn(element: +Element) -> bool",
				"!url": "http://api.jquery.com/jquery.hasData/",
				"!doc": "Determine whether an element has any jQuery data associated with it."
			},
			holdReady: {
				"!type": "fn(hold: bool)",
				"!url": "http://api.jquery.com/jquery.holdReady/",
				"!doc": "Holds or releases the execution of jQuery's ready event."
			},
			inArray: {
				"!type": "fn(value: ?, array: [?], from?: number) -> number",
				"!url": "http://api.jquery.com/jquery.inArray/",
				"!doc": "Search for a specified value within an array and return its index (or -1 if not found)."
			},
			isArray: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "http://api.jquery.com/jquery.isArray/",
				"!doc": "Determine whether the argument is an array."
			},
			isEmptyObject: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "http://api.jquery.com/jquery.isEmptyObject/",
				"!doc": "Check to see if an object is empty (contains no enumerable properties)."
			},
			isFunction: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "http://api.jquery.com/jquery.isFunction/",
				"!doc": "Determine if the argument passed is a Javascript function object."
			},
			isNumeric: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "http://api.jquery.com/jquery.isNumeric/",
				"!doc": "Determines whether its argument is a number."
			},
			isPlainObject: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "http://api.jquery.com/jquery.isPlainObject/",
				"!doc": "Check to see if an object is a plain object (created using '{}' or 'new Object')."
			},
			isWindow: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "http://api.jquery.com/jquery.isWindow/",
				"!doc": "Determine whether the argument is a window."
			},
			isXMLDoc: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "http://api.jquery.com/jquery.isXMLDoc/",
				"!doc": "Check to see if a DOM node is within an XML document (or is an XML document)."
			},
			isFunction: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "http://api.jquery.com/jquery.isFunction/",
				"!doc": ""
			},
			makeArray: {
				"!type": "fn(obj: ?) -> [!0.<i>]",
				"!url": "http://api.jquery.com/jquery.makeArray/",
				"!doc": "Convert an array-like object into a true JavaScript array."
			},
			map: {
				"!type": "fn(array: [?], callback: fn(element: ?, i: number) -> ?) -> [!1.!ret]",
				"!effects": ["call !1 !0.<i> number"],
				"!url": "http://api.jquery.com/jquery.map/",
				"!doc": "Translate all items in an array or object to new array of items."
			},
			merge: {
				"!type": "fn(first: [?], second: [?]) -> !0",
				"!url": "http://api.jquery.com/jquery.merge/",
				"!doc": "Merge the contents of two arrays together into the first array."
			},
			noConflict: {
				"!type": "fn(removeAll?: bool) -> jQuery",
				"!url": "http://api.jquery.com/jquery.noConflict/",
				"!doc": "Relinquish jQuery's control of the $ variable."
			},
			noop: {
				"!type": "fn()",
				"!url": "http://api.jquery.com/jquery.noop/",
				"!doc": "An empty function."
			},
			now: {
				"!type": "fn() -> number",
				"!url": "http://api.jquery.com/jquery.now/",
				"!doc": "Return a number representing the current time."
			},
			param: {
				"!type": "fn(obj: ?) -> string",
				"!url": "http://api.jquery.com/jquery.param/",
				"!doc": "Create a serialized representation of an array or object, suitable for use in a URL query string or Ajax request."
			},
			parseHTML: {
				"!type": "fn(data: string, context?: +Element, keepScripts?: bool) -> [+Element]",
				"!url": "http://api.jquery.com/jquery.parseHTML/",
				"!doc": "Parses a string into an array of DOM nodes."
			},
			parseJSON: {
				"!type": "fn(json: string) -> ?",
				"!url": "http://api.jquery.com/jquery.parseJSON/",
				"!doc": "Takes a well-formed JSON string and returns the resulting JavaScript object."
			},
			parseXML: {
				"!type": "fn(xml: string) -> +XMLDocument",
				"!url": "http://api.jquery.com/jquery.parseXML/",
				"!doc": "Parses a string into an XML document."
			},
			post: {
				"!type": "fn(url: string, data?: ?, success: fn(data: string, textStatus: string, req: +XMLHttpRequest), dataType?: string) -> +jQuery.jqXHR",
				"!url": "http://api.jquery.com/jquery.post/",
				"!doc": "Load data from the server using a HTTP POST request."
			},
			proxy: {
				"!type": "fn(function: fn(), context: ?) -> fn()",
				"!url": "http://api.jquery.com/jquery.proxy/",
				"!doc": "Takes a function and returns a new one that will always have a particular context."
			},
			queue: {
				"!type": "fn(element: +Element, queue?: string) -> [?]",
				"!url": "http://api.jquery.com/jquery.queue/",
				"!doc": "Show or manipulate the queue of functions to be executed on the matched element."
			},
			removeData: {
				"!type": "fn(element: +Element, name?: string)",
				"!url": "http://api.jquery.com/jquery.removeData/",
				"!doc": ""
			},
			sub: {
				"!type": "fn() -> jQuery",
				"!url": "http://api.jquery.com/jquery.sub/",
				"!doc": "Remove a previously-stored piece of data."
			},
			support: {
				"!url": "http://api.jquery.com/jquery.support/",
				"!doc": "A collection of properties that represent the presence of different browser features or bugs. Primarily intended for jQuery's internal use; specific properties may be removed when they are no longer needed internally to improve page startup performance.",
				getSetAttribute: "bool",
				leadingWhitespace: "bool",
				tbody: "bool",
				htmlSerialize: "bool",
				style: "bool",
				hrefNormalized: "bool",
				opacity: "bool",
				cssFloat: "bool",
				checkOn: "bool",
				optSelected: "bool",
				enctype: "bool",
				html5Clone: "bool",
				boxModel: "bool",
				deleteExpando: "bool",
				noCloneEvent: "bool",
				inlineBlockNeedsLayout: "bool",
				shrinkWrapBlocks: "bool",
				reliableMarginRight: "bool",
				boxSizingReliable: "bool",
				pixelPosition: "bool",
				noCloneChecked: "bool",
				optDisabled: "bool",
				input: "bool",
				radioValue: "bool",
				appendChecked: "bool",
				checkClone: "bool",
				clearCloneStyle: "bool",
				reliableHiddenOffsets: "bool",
				boxSizing: "bool",
				doesNotIncludeMarginInBodyOffset: "bool",
				cors: "bool",
				ajax: "bool"
			},
			trim: {
				"!type": "fn(str: string) -> string",
				"!url": "http://api.jquery.com/jquery.trim/",
				"!doc": "Remove the whitespace from the beginning and end of a string."
			},
			type: {
				"!type": "fn(obj: ?) -> string",
				"!url": "http://api.jquery.com/jquery.type/",
				"!doc": "Determine the internal JavaScript [[Class]] of an object."
			},
			unique: {
				"!type": "fn(array: [?]) -> !0",
				"!url": "http://api.jquery.com/jquery.unique/",
				"!doc": "Sorts an array of DOM elements, in place, with the duplicates removed. Note that this only works on arrays of DOM elements, not strings or numbers."
			},
			when: {
				"!type": "fn(deferred: +jQuery.Deferred) -> +jQuery.Promise",
				"!url": "http://api.jquery.com/jquery.when/",
				"!doc": "Provides a way to execute callback functions based on one or more objects, usually Deferred objects that represent asynchronous events."
			}
		},
		$: "jQuery"
	},
	window.browserDefs = {
		"!name": "browser",
		location: {
			assign: {
				"!type": "fn(url: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "Load the document at the provided URL."
			},
			replace: {
				"!type": "fn(url: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "Replace the current document with the one at the provided URL. The difference from the assign() method is that after using replace() the current page will not be saved in session history, meaning the user won't be able to use the Back button to navigate to it."
			},
			reload: {
				"!type": "fn()",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "Reload the document from the current URL. forceget is a boolean, which, when it is true, causes the page to always be reloaded from the server. If it is false or not specified, the browser may reload the page from its cache."
			},
			origin: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "The origin of the URL."
			},
			hash: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "The part of the URL that follows the # symbol, including the # symbol."
			},
			search: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "The part of the URL that follows the ? symbol, including the ? symbol."
			},
			pathname: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "The path (relative to the host)."
			},
			port: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "The port number of the URL."
			},
			hostname: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "The host name (without the port number or square brackets)."
			},
			host: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "The host name and port number."
			},
			protocol: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "The protocol of the URL."
			},
			href: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
				"!doc": "The entire URL."
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.location",
			"!doc": "Returns a location object with information about the current location of the document. Assigning to the location property changes the current page to the new address."
		},
		Node: {
			"!type": "fn()",
			prototype: {
				parentElement: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.parentElement",
					"!doc": "Returns the DOM node's parent Element, or null if the node either has no parent, or its parent isn't a DOM Element."
				},
				textContent: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.textContent",
					"!doc": "Gets or sets the text content of a node and its descendants."
				},
				baseURI: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.baseURI",
					"!doc": "The absolute base URI of a node or null if unable to obtain an absolute URI."
				},
				localName: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.localName",
					"!doc": "Returns the local part of the qualified name of this node."
				},
				prefix: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.prefix",
					"!doc": "Returns the namespace prefix of the specified node, or null if no prefix is specified. This property is read only."
				},
				namespaceURI: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.namespaceURI",
					"!doc": "The namespace URI of the node, or null if the node is not in a namespace (read-only). When the node is a document, it returns the XML namespace for the current document."
				},
				ownerDocument: {
					"!type": "+Document",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.ownerDocument",
					"!doc": "The ownerDocument property returns the top-level document object for this node."
				},
				attributes: {
					"!type": "+NamedNodeMap",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.attributes",
					"!doc": "A collection of all attribute nodes registered to the specified node. It is a NamedNodeMap,not an Array, so it has no Array methods and the Attr nodes' indexes may differ among browsers."
				},
				nextSibling: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.nextSibling",
					"!doc": "Returns the node immediately following the specified one in its parent's childNodes list, or null if the specified node is the last node in that list."
				},
				previousSibling: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.previousSibling",
					"!doc": "Returns the node immediately preceding the specified one in its parent's childNodes list, null if the specified node is the first in that list."
				},
				lastChild: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.lastChild",
					"!doc": "Returns the last child of a node."
				},
				firstChild: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.firstChild",
					"!doc": "Returns the node's first child in the tree, or null if the node is childless. If the node is a Document, it returns the first node in the list of its direct children."
				},
				childNodes: {
					"!type": "+NodeList",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.childNodes",
					"!doc": "Returns a collection of child nodes of the given element."
				},
				parentNode: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.parentNode",
					"!doc": "Returns the parent of the specified node in the DOM tree."
				},
				nodeType: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.nodeType",
					"!doc": "Returns an integer code representing the type of the node."
				},
				nodeValue: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.nodeValue",
					"!doc": "Returns or sets the value of the current node."
				},
				nodeName: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.nodeName",
					"!doc": "Returns the name of the current node as a string."
				},
				tagName: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.nodeName",
					"!doc": "Returns the name of the current node as a string."
				},
				insertBefore: {
					"!type": "fn(newElt: +Element, before: +Element) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.insertBefore",
					"!doc": "Inserts the specified node before a reference element as a child of the current node."
				},
				replaceChild: {
					"!type": "fn(newElt: +Element, oldElt: +Element) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.replaceChild",
					"!doc": "Replaces one child node of the specified element with another."
				},
				removeChild: {
					"!type": "fn(oldElt: +Element) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.removeChild",
					"!doc": "Removes a child node from the DOM. Returns removed node."
				},
				appendChild: {
					"!type": "fn(newElt: +Element) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.appendChild",
					"!doc": "Adds a node to the end of the list of children of a specified parent node. If the node already exists it is removed from current parent node, then added to new parent node."
				},
				hasChildNodes: {
					"!type": "fn() -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.hasChildNodes",
					"!doc": "Returns a Boolean value indicating whether the current Node has child nodes or not."
				},
				cloneNode: {
					"!type": "fn(deep: bool) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.cloneNode",
					"!doc": "Returns a duplicate of the node on which this method was called."
				},
				normalize: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.normalize",
					"!doc": 'Puts the specified node and all of its subtree into a "normalized" form. In a normalized subtree, no text nodes in the subtree are empty and there are no adjacent text nodes.'
				},
				isSupported: {
					"!type": "fn(features: string, version: number) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.isSupported",
					"!doc": "Tests whether the DOM implementation implements a specific feature and that feature is supported by this node."
				},
				hasAttributes: {
					"!type": "fn() -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.hasAttributes",
					"!doc": "Returns a boolean value of true or false, indicating if the current element has any attributes or not."
				},
				lookupPrefix: {
					"!type": "fn(uri: string) -> string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.lookupPrefix",
					"!doc": "Returns the prefix for a given namespaceURI if present, and null if not. When multiple prefixes are possible, the result is implementation-dependent."
				},
				isDefaultNamespace: {
					"!type": "fn(uri: string) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.isDefaultNamespace",
					"!doc": "Accepts a namespace URI as an argument and returns true if the namespace is the default namespace on the given node or false if not."
				},
				lookupNamespaceURI: {
					"!type": "fn(uri: string) -> string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.lookupNamespaceURI",
					"!doc": "Takes a prefix and returns the namespaceURI associated with it on the given node if found (and null if not). Supplying null for the prefix will return the default namespace."
				},
				addEventListener: {
					"!type": "fn(type: string, listener: fn(e: +Event), capture: bool)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/EventTarget.addEventListener",
					"!doc": "Registers a single event listener on a single target. The event target may be a single element in a document, the document itself, a window, or an XMLHttpRequest."
				},
				removeEventListener: {
					"!type": "fn(type: string, listener: fn(), capture: bool)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/EventTarget.removeEventListener",
					"!doc": "Allows the removal of event listeners from the event target."
				},
				isSameNode: {
					"!type": "fn(other: +Node) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.isSameNode",
					"!doc": "Tests whether two nodes are the same, that is they reference the same object."
				},
				isEqualNode: {
					"!type": "fn(other: +Node) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.isEqualNode",
					"!doc": "Tests whether two nodes are equal."
				},
				compareDocumentPosition: {
					"!type": "fn(other: +Node) -> number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.compareDocumentPosition",
					"!doc": "Compares the position of the current node against another node in any other document."
				},
				contains: {
					"!type": "fn(other: +Node) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Node.contains",
					"!doc": "Indicates whether a node is a descendent of a given node."
				},
				dispatchEvent: {
					"!type": "fn(event: +Event) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/EventTarget.dispatchEvent",
					"!doc": "Dispatches an event into the event system. The event is subject to the same capturing and bubbling behavior as directly dispatched events."
				},
				ELEMENT_NODE: "number",
				ATTRIBUTE_NODE: "number",
				TEXT_NODE: "number",
				CDATA_SECTION_NODE: "number",
				ENTITY_REFERENCE_NODE: "number",
				ENTITY_NODE: "number",
				PROCESSING_INSTRUCTION_NODE: "number",
				COMMENT_NODE: "number",
				DOCUMENT_NODE: "number",
				DOCUMENT_TYPE_NODE: "number",
				DOCUMENT_FRAGMENT_NODE: "number",
				NOTATION_NODE: "number",
				DOCUMENT_POSITION_DISCONNECTED: "number",
				DOCUMENT_POSITION_PRECEDING: "number",
				DOCUMENT_POSITION_FOLLOWING: "number",
				DOCUMENT_POSITION_CONTAINS: "number",
				DOCUMENT_POSITION_CONTAINED_BY: "number",
				DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: "number"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Node",
			"!doc": "A Node is an interface from which a number of DOM types inherit, and allows these various types to be treated (or tested) similarly."
		},
		Element: {
			"!type": "fn()",
			prototype: {
				"!proto": "Node.prototype",
				getAttribute: {
					"!type": "fn(name: string) -> string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getAttribute",
					"!doc": 'Returns the value of the named attribute on the specified element. If the named attribute does not exist, the value returned will either be null or "" (the empty string).'
				},
				setAttribute: {
					"!type": "fn(name: string, value: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.setAttribute",
					"!doc": "Adds a new attribute or changes the value of an existing attribute on the specified element."
				},
				removeAttribute: {
					"!type": "fn(name: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.removeAttribute",
					"!doc": "Removes an attribute from the specified element."
				},
				getAttributeNode: {
					"!type": "fn(name: string) -> +Attr",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getAttributeNode",
					"!doc": "Returns the specified attribute of the specified element, as an Attr node."
				},
				getElementsByTagName: {
					"!type": "fn(tagName: string) -> +NodeList",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getElementsByTagName",
					"!doc": "Returns a list of elements with the given tag name. The subtree underneath the specified element is searched, excluding the element itself. The returned list is live, meaning that it updates itself with the DOM tree automatically. Consequently, there is no need to call several times element.getElementsByTagName with the same element and arguments."
				},
				getElementsByTagNameNS: {
					"!type": "fn(ns: string, tagName: string) -> +NodeList",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getElementsByTagNameNS",
					"!doc": "Returns a list of elements with the given tag name belonging to the given namespace."
				},
				getAttributeNS: {
					"!type": "fn(ns: string, name: string) -> string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getAttributeNS",
					"!doc": 'Returns the string value of the attribute with the specified namespace and name. If the named attribute does not exist, the value returned will either be null or "" (the empty string).'
				},
				setAttributeNS: {
					"!type": "fn(ns: string, name: string, value: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.setAttributeNS",
					"!doc": "Adds a new attribute or changes the value of an attribute with the given namespace and name."
				},
				removeAttributeNS: {
					"!type": "fn(ns: string, name: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.removeAttributeNS",
					"!doc": "removeAttributeNS removes the specified attribute from an element."
				},
				getAttributeNodeNS: {
					"!type": "fn(ns: string, name: string) -> +Attr",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getAttributeNodeNS",
					"!doc": "Returns the Attr node for the attribute with the given namespace and name."
				},
				hasAttribute: {
					"!type": "fn(name: string) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.hasAttribute",
					"!doc": "hasAttribute returns a boolean value indicating whether the specified element has the specified attribute or not."
				},
				hasAttributeNS: {
					"!type": "fn(ns: string, name: string) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.hasAttributeNS",
					"!doc": "hasAttributeNS returns a boolean value indicating whether the current element has the specified attribute."
				},
				focus: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.focus",
					"!doc": "Sets focus on the specified element, if it can be focused."
				},
				blur: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.blur",
					"!doc": "The blur method removes keyboard focus from the current element."
				},
				scrollIntoView: {
					"!type": "fn(top: bool)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.scrollIntoView",
					"!doc": "The scrollIntoView() method scrolls the element into view."
				},
				scrollByLines: {
					"!type": "fn(lines: number)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/window.scrollByLines",
					"!doc": "Scrolls the document by the given number of lines."
				},
				scrollByPages: {
					"!type": "fn(pages: number)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/window.scrollByPages",
					"!doc": "Scrolls the current document by the specified number of pages."
				},
				getElementsByClassName: {
					"!type": "fn(name: string) -> +NodeList",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.getElementsByClassName",
					"!doc": "Returns a set of elements which have all the given class names. When called on the document object, the complete document is searched, including the root node. You may also call getElementsByClassName on any element; it will return only elements which are descendants of the specified root element with the given class names."
				},
				querySelector: {
					"!type": "fn(selectors: string) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Element.querySelector",
					"!doc": "Returns the first element that is a descendent of the element on which it is invoked that matches the specified group of selectors."
				},
				querySelectorAll: {
					"!type": "fn(selectors: string) -> +NodeList",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Element.querySelectorAll",
					"!doc": "Returns a non-live NodeList of all elements descended from the element on which it is invoked that match the specified group of CSS selectors."
				},
				getClientRects: {
					"!type": "fn() -> [+ClientRect]",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getClientRects",
					"!doc": "Returns a collection of rectangles that indicate the bounding rectangles for each box in a client."
				},
				getBoundingClientRect: {
					"!type": "fn() -> +ClientRect",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getBoundingClientRect",
					"!doc": "Returns a text rectangle object that encloses a group of text rectangles."
				},
				setAttributeNode: {
					"!type": "fn(attr: +Attr) -> +Attr",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.setAttributeNode",
					"!doc": "Adds a new Attr node to the specified element."
				},
				removeAttributeNode: {
					"!type": "fn(attr: +Attr) -> +Attr",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.removeAttributeNode",
					"!doc": "Removes the specified attribute from the current element."
				},
				setAttributeNodeNS: {
					"!type": "fn(attr: +Attr) -> +Attr",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.setAttributeNodeNS",
					"!doc": "Adds a new namespaced attribute node to an element."
				},
				insertAdjacentHTML: {
					"!type": "fn(position: string, text: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.insertAdjacentHTML",
					"!doc": "Parses the specified text as HTML or XML and inserts the resulting nodes into the DOM tree at a specified position. It does not reparse the element it is being used on and thus it does not corrupt the existing elements inside the element. This, and avoiding the extra step of serialization make it much faster than direct innerHTML manipulation."
				},
				children: {
					"!type": "+HTMLCollection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Element.children",
					"!doc": "Returns a collection of child elements of the given element."
				},
				childElementCount: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Element.childElementCount",
					"!doc": "Returns the number of child elements of the given element."
				},
				className: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.className",
					"!doc": "Gets and sets the value of the class attribute of the specified element."
				},
				style: {
					cssText: "string",
					alignmentBaseline: "string",
					background: "string",
					backgroundAttachment: "string",
					backgroundClip: "string",
					backgroundColor: "string",
					backgroundImage: "string",
					backgroundOrigin: "string",
					backgroundPosition: "string",
					backgroundPositionX: "string",
					backgroundPositionY: "string",
					backgroundRepeat: "string",
					backgroundRepeatX: "string",
					backgroundRepeatY: "string",
					backgroundSize: "string",
					baselineShift: "string",
					border: "string",
					borderBottom: "string",
					borderBottomColor: "string",
					borderBottomLeftRadius: "string",
					borderBottomRightRadius: "string",
					borderBottomStyle: "string",
					borderBottomWidth: "string",
					borderCollapse: "string",
					borderColor: "string",
					borderImage: "string",
					borderImageOutset: "string",
					borderImageRepeat: "string",
					borderImageSlice: "string",
					borderImageSource: "string",
					borderImageWidth: "string",
					borderLeft: "string",
					borderLeftColor: "string",
					borderLeftStyle: "string",
					borderLeftWidth: "string",
					borderRadius: "string",
					borderRight: "string",
					borderRightColor: "string",
					borderRightStyle: "string",
					borderRightWidth: "string",
					borderSpacing: "string",
					borderStyle: "string",
					borderTop: "string",
					borderTopColor: "string",
					borderTopLeftRadius: "string",
					borderTopRightRadius: "string",
					borderTopStyle: "string",
					borderTopWidth: "string",
					borderWidth: "string",
					bottom: "string",
					boxShadow: "string",
					boxSizing: "string",
					captionSide: "string",
					clear: "string",
					clip: "string",
					clipPath: "string",
					clipRule: "string",
					color: "string",
					colorInterpolation: "string",
					colorInterpolationFilters: "string",
					colorProfile: "string",
					colorRendering: "string",
					content: "string",
					counterIncrement: "string",
					counterReset: "string",
					cursor: "string",
					direction: "string",
					display: "string",
					dominantBaseline: "string",
					emptyCells: "string",
					enableBackground: "string",
					fill: "string",
					fillOpacity: "string",
					fillRule: "string",
					filter: "string",
					"float": "string",
					floodColor: "string",
					floodOpacity: "string",
					font: "string",
					fontFamily: "string",
					fontSize: "string",
					fontStretch: "string",
					fontStyle: "string",
					fontVariant: "string",
					fontWeight: "string",
					glyphOrientationHorizontal: "string",
					glyphOrientationVertical: "string",
					height: "string",
					imageRendering: "string",
					kerning: "string",
					left: "string",
					letterSpacing: "string",
					lightingColor: "string",
					lineHeight: "string",
					listStyle: "string",
					listStyleImage: "string",
					listStylePosition: "string",
					listStyleType: "string",
					margin: "string",
					marginBottom: "string",
					marginLeft: "string",
					marginRight: "string",
					marginTop: "string",
					marker: "string",
					markerEnd: "string",
					markerMid: "string",
					markerStart: "string",
					mask: "string",
					maxHeight: "string",
					maxWidth: "string",
					minHeight: "string",
					minWidth: "string",
					opacity: "string",
					orphans: "string",
					outline: "string",
					outlineColor: "string",
					outlineOffset: "string",
					outlineStyle: "string",
					outlineWidth: "string",
					overflow: "string",
					overflowWrap: "string",
					overflowX: "string",
					overflowY: "string",
					padding: "string",
					paddingBottom: "string",
					paddingLeft: "string",
					paddingRight: "string",
					paddingTop: "string",
					page: "string",
					pageBreakAfter: "string",
					pageBreakBefore: "string",
					pageBreakInside: "string",
					pointerEvents: "string",
					position: "string",
					quotes: "string",
					resize: "string",
					right: "string",
					shapeRendering: "string",
					size: "string",
					speak: "string",
					src: "string",
					stopColor: "string",
					stopOpacity: "string",
					stroke: "string",
					strokeDasharray: "string",
					strokeDashoffset: "string",
					strokeLinecap: "string",
					strokeLinejoin: "string",
					strokeMiterlimit: "string",
					strokeOpacity: "string",
					strokeWidth: "string",
					tabSize: "string",
					tableLayout: "string",
					textAlign: "string",
					textAnchor: "string",
					textDecoration: "string",
					textIndent: "string",
					textLineThrough: "string",
					textLineThroughColor: "string",
					textLineThroughMode: "string",
					textLineThroughStyle: "string",
					textLineThroughWidth: "string",
					textOverflow: "string",
					textOverline: "string",
					textOverlineColor: "string",
					textOverlineMode: "string",
					textOverlineStyle: "string",
					textOverlineWidth: "string",
					textRendering: "string",
					textShadow: "string",
					textTransform: "string",
					textUnderline: "string",
					textUnderlineColor: "string",
					textUnderlineMode: "string",
					textUnderlineStyle: "string",
					textUnderlineWidth: "string",
					top: "string",
					unicodeBidi: "string",
					unicodeRange: "string",
					vectorEffect: "string",
					verticalAlign: "string",
					visibility: "string",
					whiteSpace: "string",
					width: "string",
					wordBreak: "string",
					wordSpacing: "string",
					wordWrap: "string",
					writingMode: "string",
					zIndex: "string",
					zoom: "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.style",
					"!doc": "Returns an object that represents the element's style attribute."
				},
				classList: {
					"!type": "+DOMTokenList",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.classList",
					"!doc": "Returns a token list of the class attribute of the element."
				},
				contentEditable: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Element.contentEditable",
					"!doc": "Indicates whether or not the element is editable."
				},
				firstElementChild: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Element.firstElementChild",
					"!doc": "Returns the element's first child element or null if there are no child elements."
				},
				lastElementChild: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Element.lastElementChild",
					"!doc": "Returns the element's last child element or null if there are no child elements."
				},
				nextElementSibling: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Element.nextElementSibling",
					"!doc": "Returns the element immediately following the specified one in its parent's children list, or null if the specified element is the last one in the list."
				},
				previousElementSibling: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Element.previousElementSibling",
					"!doc": "Returns the element immediately prior to the specified one in its parent's children list, or null if the specified element is the first one in the list."
				},
				tabIndex: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.tabIndex",
					"!doc": "Gets/sets the tab order of the current element."
				},
				title: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.title",
					"!doc": "Establishes the text to be displayed in a 'tool tip' popup when the mouse is over the displayed node."
				},
				width: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.offsetWidth",
					"!doc": "Returns the layout width of an element."
				},
				height: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.offsetHeight",
					"!doc": "Height of an element relative to the element's offsetParent."
				},
				getContext: {
					"!type": "fn(id: string) -> CanvasRenderingContext2D",
					"!url": "https://developer.mozilla.org/en/docs/DOM/HTMLCanvasElement",
					"!doc": "DOM canvas elements expose the HTMLCanvasElement interface, which provides properties and methods for manipulating the layout and presentation of canvas elements. The HTMLCanvasElement interface inherits the properties and methods of the element object interface."
				},
				supportsContext: "fn(id: string) -> bool",
				oncopy: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.oncopy",
					"!doc": "The oncopy property returns the onCopy event handler code on the current element."
				},
				oncut: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.oncut",
					"!doc": "The oncut property returns the onCut event handler code on the current element."
				},
				onpaste: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onpaste",
					"!doc": "The onpaste property returns the onPaste event handler code on the current element."
				},
				onbeforeunload: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/HTML/Element/body",
					"!doc": "The HTML <body> element represents the main content of an HTML document. There is only one <body> element in a document."
				},
				onfocus: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onfocus",
					"!doc": "The onfocus property returns the onFocus event handler code on the current element."
				},
				onblur: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onblur",
					"!doc": "The onblur property returns the onBlur event handler code, if any, that exists on the current element."
				},
				onchange: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onchange",
					"!doc": "The onchange property sets and returns the onChange event handler code for the current element."
				},
				onclick: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onclick",
					"!doc": "The onclick property returns the onClick event handler code on the current element."
				},
				ondblclick: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.ondblclick",
					"!doc": "The ondblclick property returns the onDblClick event handler code on the current element."
				},
				onmousedown: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onmousedown",
					"!doc": "The onmousedown property returns the onMouseDown event handler code on the current element."
				},
				onmouseup: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onmouseup",
					"!doc": "The onmouseup property returns the onMouseUp event handler code on the current element."
				},
				onmousewheel: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Mozilla_event_reference/wheel",
					"!doc": "The wheel event is fired when a wheel button of a pointing device (usually a mouse) is rotated. This event deprecates the legacy mousewheel event."
				},
				onmouseover: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onmouseover",
					"!doc": "The onmouseover property returns the onMouseOver event handler code on the current element."
				},
				onmouseout: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onmouseout",
					"!doc": "The onmouseout property returns the onMouseOut event handler code on the current element."
				},
				onmousemove: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onmousemove",
					"!doc": "The onmousemove property returns the mousemove event handler code on the current element."
				},
				oncontextmenu: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/window.oncontextmenu",
					"!doc": 'An event handler property for right-click events on the window. Unless the default behavior is prevented, the browser context menu will activate. Note that this event will occur with any non-disabled right-click event and does not depend on an element possessing the "contextmenu" attribute.'
				},
				onkeydown: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onkeydown",
					"!doc": "The onkeydown property returns the onKeyDown event handler code on the current element."
				},
				onkeyup: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onkeyup",
					"!doc": "The onkeyup property returns the onKeyUp event handler code for the current element."
				},
				onkeypress: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onkeypress",
					"!doc": "The onkeypress property sets and returns the onKeyPress event handler code for the current element."
				},
				onresize: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onresize",
					"!doc": "onresize returns the element's onresize event handler code. It can also be used to set the code to be executed when the resize event occurs."
				},
				onscroll: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.onscroll",
					"!doc": "The onscroll property returns the onScroll event handler code on the current element."
				},
				ondragstart: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DragDrop/Drag_Operations",
					"!doc": "The following describes the steps that occur during a drag and drop operation."
				},
				ondragover: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Mozilla_event_reference/dragover",
					"!doc": "The dragover event is fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds)."
				},
				ondragleave: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Mozilla_event_reference/dragleave",
					"!doc": "The dragleave event is fired when a dragged element or text selection leaves a valid drop target."
				},
				ondragenter: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Mozilla_event_reference/dragenter",
					"!doc": "The dragenter event is fired when a dragged element or text selection enters a valid drop target."
				},
				ondragend: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Mozilla_event_reference/dragend",
					"!doc": "The dragend event is fired when a drag operation is being ended (by releasing a mouse button or hitting the escape key)."
				},
				ondrag: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Mozilla_event_reference/drag",
					"!doc": "The drag event is fired when an element or text selection is being dragged (every few hundred milliseconds)."
				},
				offsetTop: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.offsetTop",
					"!doc": "Returns the distance of the current element relative to the top of the offsetParent node."
				},
				offsetLeft: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.offsetLeft",
					"!doc": "Returns the number of pixels that the upper left corner of the current element is offset to the left within the offsetParent node."
				},
				offsetHeight: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.offsetHeight",
					"!doc": "Height of an element relative to the element's offsetParent."
				},
				offsetWidth: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.offsetWidth",
					"!doc": "Returns the layout width of an element."
				},
				scrollTop: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.scrollTop",
					"!doc": "Gets or sets the number of pixels that the content of an element is scrolled upward."
				},
				scrollLeft: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.scrollLeft",
					"!doc": "Gets or sets the number of pixels that an element's content is scrolled to the left."
				},
				scrollHeight: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.scrollHeight",
					"!doc": "Height of the scroll view of an element; it includes the element padding but not its margin."
				},
				scrollWidth: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.scrollWidth",
					"!doc": "Read-only property that returns either the width in pixels of the content of an element or the width of the element itself, whichever is greater."
				},
				clientTop: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.clientTop",
					"!doc": "The width of the top border of an element in pixels. It does not include the top margin or padding. clientTop is read-only."
				},
				clientLeft: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.clientLeft",
					"!doc": "The width of the left border of an element in pixels. It includes the width of the vertical scrollbar if the text direction of the element is right-to-left and if there is an overflow causing a left vertical scrollbar to be rendered. clientLeft does not include the left margin or the left padding. clientLeft is read-only."
				},
				clientHeight: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.clientHeight",
					"!doc": "Returns the inner height of an element in pixels, including padding but not the horizontal scrollbar height, border, or margin."
				},
				clientWidth: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.clientWidth",
					"!doc": "The inner width of an element in pixels. It includes padding but not the vertical scrollbar (if present, if rendered), border or margin."
				},
				innerHTML: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.innerHTML",
					"!doc": "Sets or gets the HTML syntax describing the element's descendants."
				},
				createdCallback: {
					"!type": "fn()",
					"!url": "http://w3c.github.io/webcomponents/spec/custom/index.html#dfn-created-callback",
					"!doc": "This callback is invoked after custom element instance is created and its definition is registered. The actual timing of this callback is defined further in this specification."
				},
				attachedCallback: {
					"!type": "fn()",
					"!url": "http://w3c.github.io/webcomponents/spec/custom/index.html#dfn-entered-view-callback",
					"!doc": "Unless specified otherwise, this callback must be enqueued whenever custom element is inserted into a document and this document has a browsing context."
				},
				detachedCallback: {
					"!type": "fn()",
					"!url": "http://w3c.github.io/webcomponents/spec/custom/index.html#dfn-left-view-callback",
					"!doc": "Unless specified otherwise, this callback must be enqueued whenever custom element is removed from the document and this document has a browsing context."
				},
				attributeChangedCallback: {
					"!type": "fn()",
					"!url": "http://w3c.github.io/webcomponents/spec/custom/index.html#dfn-attribute-changed-callback",
					"!doc": "Unless specified otherwise, this callback must be enqueued whenever custom element's attribute is added, changed or removed."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Element",
			"!doc": "Represents an element in an HTML or XML document."
		},
		Text: {
			"!type": "fn()",
			prototype: {
				"!proto": "Node.prototype",
				wholeText: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Text.wholeText",
					"!doc": "Returns all text of all Text nodes logically adjacent to the node.  The text is concatenated in document order.  This allows you to specify any text node and obtain all adjacent text as a single string."
				},
				splitText: {
					"!type": "fn(offset: number) -> +Text",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Text.splitText",
					"!doc": "Breaks the Text node into two nodes at the specified offset, keeping both nodes in the tree as siblings."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Text",
			"!doc": "In the DOM, the Text interface represents the textual content of an Element or Attr.  If an element has no markup within its content, it has a single child implementing Text that contains the element's text.  However, if the element contains markup, it is parsed into information items and Text nodes that form its children."
		},
		Document: {
			"!type": "fn()",
			prototype: {
				"!proto": "Node.prototype",
				activeElement: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.activeElement",
					"!doc": "Returns the currently focused element, that is, the element that will get keystroke events if the user types any. This attribute is read only."
				},
				compatMode: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.compatMode",
					"!doc": "Indicates whether the document is rendered in Quirks mode or Strict mode."
				},
				designMode: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.designMode",
					"!doc": "Can be used to make any document editable, for example in a <iframe />:"
				},
				dir: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Document.dir",
					"!doc": "This property should indicate and allow the setting of the directionality of the text of the document, whether left to right (default) or right to left."
				},
				height: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.height",
					"!doc": "Returns the height of the <body> element of the current document."
				},
				width: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.width",
					"!doc": "Returns the width of the <body> element of the current document in pixels."
				},
				characterSet: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.characterSet",
					"!doc": "Returns the character encoding of the current document."
				},
				readyState: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.readyState",
					"!doc": 'Returns "loading" while the document is loading, "interactive" once it is finished parsing but still loading sub-resources, and "complete" once it has loaded.'
				},
				location: {
					"!type": "location",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.location",
					"!doc": "Returns a Location object, which contains information about the URL of the document and provides methods for changing that URL."
				},
				lastModified: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.lastModified",
					"!doc": "Returns a string containing the date and time on which the current document was last modified."
				},
				head: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.head",
					"!doc": "Returns the <head> element of the current document. If there are more than one <head> elements, the first one is returned."
				},
				body: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.body",
					"!doc": "Returns the <body> or <frameset> node of the current document."
				},
				cookie: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.cookie",
					"!doc": "Get and set the cookies associated with the current document."
				},
				URL: "string",
				domain: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.domain",
					"!doc": "Gets/sets the domain portion of the origin of the current document, as used by the same origin policy."
				},
				referrer: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.referrer",
					"!doc": "Returns the URI of the page that linked to this page."
				},
				title: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.title",
					"!doc": "Gets or sets the title of the document."
				},
				defaultView: {
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.defaultView",
					"!doc": "In browsers returns the window object associated with the document or null if none available."
				},
				documentURI: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.documentURI",
					"!doc": "Returns the document location as string. It is read-only per DOM4 specification."
				},
				xmlStandalone: "bool",
				xmlVersion: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.xmlVersion",
					"!doc": 'Returns the version number as specified in the XML declaration (e.g., <?xml version="1.0"?>) or "1.0" if the declaration is absent.'
				},
				xmlEncoding: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Document.xmlEncoding",
					"!doc": "Returns the encoding as determined by the XML declaration. Should be null if unspecified or unknown."
				},
				inputEncoding: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.inputEncoding",
					"!doc": "Returns a string representing the encoding under which the document was parsed (e.g. ISO-8859-1)."
				},
				documentElement: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.documentElement",
					"!doc": "Read-only"
				},
				implementation: {
					hasFeature: "fn(feature: string, version: number) -> bool",
					createDocumentType: {
						"!type": "fn(qualifiedName: string, publicId: string, systemId: string) -> +Node",
						"!url": "https://developer.mozilla.org/en/docs/DOM/DOMImplementation.createDocumentType",
						"!doc": "Returns a DocumentType object which can either be used with DOMImplementation.createDocument upon document creation or they can be put into the document via Node.insertBefore() or Node.replaceChild(): http://www.w3.org/TR/DOM-Level-3-Cor...l#ID-B63ED1A31 (less ideal due to features not likely being as accessible: http://www.w3.org/TR/DOM-Level-3-Cor...createDocument ). In any case, entity declarations and notations will not be available: http://www.w3.org/TR/DOM-Level-3-Cor...-createDocType   "
					},
					createHTMLDocument: {
						"!type": "fn(title: string) -> +Document",
						"!url": "https://developer.mozilla.org/en/docs/DOM/DOMImplementation.createHTMLDocument",
						"!doc": "This method (available from document.implementation) creates a new HTML document."
					},
					createDocument: {
						"!type": "fn(namespaceURI: string, qualifiedName: string, type: +Node) -> +Document",
						"!url": "https://developer.mozilla.org/en-US/docs/DOM/DOMImplementation.createHTMLDocument",
						"!doc": "This method creates a new HTML document."
					},
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.implementation",
					"!doc": "Returns a DOMImplementation object associated with the current document."
				},
				doctype: {
					"!type": "+Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.doctype",
					"!doc": "Returns the Document Type Declaration (DTD) associated with current document. The returned object implements the DocumentType interface. Use DOMImplementation.createDocumentType() to create a DocumentType."
				},
				open: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.open",
					"!doc": "The document.open() method opens a document for writing."
				},
				close: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.close",
					"!doc": "The document.close() method finishes writing to a document, opened with document.open()."
				},
				write: {
					"!type": "fn(html: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.write",
					"!doc": "Writes a string of text to a document stream opened by document.open()."
				},
				writeln: {
					"!type": "fn(html: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.writeln",
					"!doc": "Writes a string of text followed by a newline character to a document."
				},
				clear: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.clear",
					"!doc": "In recent versions of Mozilla-based applications as well as in Internet Explorer and Netscape 4 this method does nothing."
				},
				hasFocus: {
					"!type": "fn() -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.hasFocus",
					"!doc": "Returns a Boolean value indicating whether the document or any element inside the document has focus. This method can be used to determine whether the active element in a document has focus."
				},
				createElement: {
					"!type": "fn(tagName: string) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createElement",
					"!doc": "Creates the specified element."
				},
				createElementNS: {
					"!type": "fn(ns: string, tagName: string) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createElementNS",
					"!doc": "Creates an element with the specified namespace URI and qualified name."
				},
				createDocumentFragment: {
					"!type": "fn() -> +DocumentFragment",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createDocumentFragment",
					"!doc": "Creates a new empty DocumentFragment."
				},
				createTextNode: {
					"!type": "fn(content: string) -> +Text",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createTextNode",
					"!doc": "Creates a new Text node."
				},
				createComment: {
					"!type": "fn(content: string) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createComment",
					"!doc": "Creates a new comment node, and returns it."
				},
				createCDATASection: {
					"!type": "fn(content: string) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createCDATASection",
					"!doc": "Creates a new CDATA section node, and returns it. "
				},
				createProcessingInstruction: {
					"!type": "fn(content: string) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createProcessingInstruction",
					"!doc": "Creates a new processing instruction node, and returns it."
				},
				createAttribute: {
					"!type": "fn(name: string) -> +Attr",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createAttribute",
					"!doc": "Creates a new attribute node, and returns it."
				},
				createAttributeNS: {
					"!type": "fn(ns: string, name: string) -> +Attr",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Attr",
					"!doc": "This type represents a DOM element's attribute as an object. In most DOM methods, you will probably directly retrieve the attribute as a string (e.g., Element.getAttribute(), but certain functions (e.g., Element.getAttributeNode()) or means of iterating give Attr types."
				},
				importNode: {
					"!type": "fn(node: +Node, deep: bool) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.importNode",
					"!doc": "Creates a copy of a node from an external document that can be inserted into the current document."
				},
				getElementById: {
					"!type": "fn(id: string) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.getElementById",
					"!doc": "Returns a reference to the element by its ID."
				},
				getElementsByTagName: {
					"!type": "fn(tagName: string) -> +NodeList",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.getElementsByTagName",
					"!doc": "Returns a NodeList of elements with the given tag name. The complete document is searched, including the root node. The returned NodeList is live, meaning that it updates itself automatically to stay in sync with the DOM tree without having to call document.getElementsByTagName again."
				},
				getElementsByTagNameNS: {
					"!type": "fn(ns: string, tagName: string) -> +NodeList",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.getElementsByTagNameNS",
					"!doc": "Returns a list of elements with the given tag name belonging to the given namespace. The complete document is searched, including the root node."
				},
				createEvent: {
					"!type": "fn(type: string) -> +Event",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createEvent",
					"!doc": "Creates an event of the type specified. The returned object should be first initialized and can then be passed to element.dispatchEvent."
				},
				createRange: {
					"!type": "fn() -> +Range",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createRange",
					"!doc": "Returns a new Range object."
				},
				evaluate: {
					"!type": "fn(expr: ?) -> +XPathResult",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.evaluate",
					"!doc": "Returns an XPathResult based on an XPath expression and other given parameters."
				},
				execCommand: {
					"!type": "fn(cmd: string)",
					"!url": "https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla#Executing_Commands",
					"!doc": "Run command to manipulate the contents of an editable region."
				},
				queryCommandEnabled: {
					"!type": "fn(cmd: string) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document",
					"!doc": "Returns true if the Midas command can be executed on the current range."
				},
				queryCommandIndeterm: {
					"!type": "fn(cmd: string) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document",
					"!doc": "Returns true if the Midas command is in a indeterminate state on the current range."
				},
				queryCommandState: {
					"!type": "fn(cmd: string) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document",
					"!doc": "Returns true if the Midas command has been executed on the current range."
				},
				queryCommandSupported: {
					"!type": "fn(cmd: string) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.queryCommandSupported",
					"!doc": "Reports whether or not the specified editor query command is supported by the browser."
				},
				queryCommandValue: {
					"!type": "fn(cmd: string) -> string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document",
					"!doc": "Returns the current value of the current range for Midas command."
				},
				getElementsByName: {
					"!type": "fn(name: string) -> +HTMLCollection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.getElementsByName",
					"!doc": "Returns a list of elements with a given name in the HTML document."
				},
				elementFromPoint: {
					"!type": "fn(x: number, y: number) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.elementFromPoint",
					"!doc": "Returns the element from the document whose elementFromPoint method is being called which is the topmost element which lies under the given point.  To get an element, specify the point via coordinates, in CSS pixels, relative to the upper-left-most point in the window or frame containing the document."
				},
				getSelection: {
					"!type": "fn() -> +Selection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.getSelection",
					"!doc": "The DOM getSelection() method is available on the Window and Document interfaces."
				},
				adoptNode: {
					"!type": "fn(node: +Node) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.adoptNode",
					"!doc": "Adopts a node from an external document. The node and its subtree is removed from the document it's in (if any), and its ownerDocument is changed to the current document. The node can then be inserted into the current document."
				},
				createTreeWalker: {
					"!type": "fn(root: +Node, mask: number) -> ?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createTreeWalker",
					"!doc": "Returns a new TreeWalker object."
				},
				createExpression: {
					"!type": "fn(text: string) -> ?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createExpression",
					"!doc": "This method compiles an XPathExpression which can then be used for (repeated) evaluations."
				},
				createNSResolver: {
					"!type": "fn(node: +Node)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.createNSResolver",
					"!doc": "Creates an XPathNSResolver which resolves namespaces with respect to the definitions in scope for a specified node."
				},
				scripts: {
					"!type": "+HTMLCollection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Document.scripts",
					"!doc": "Returns a list of the <script> elements in the document. The returned object is an HTMLCollection."
				},
				plugins: {
					"!type": "+HTMLCollection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.plugins",
					"!doc": "Returns an HTMLCollection object containing one or more HTMLEmbedElements or null which represent the <embed> elements in the current document."
				},
				embeds: {
					"!type": "+HTMLCollection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.embeds",
					"!doc": "Returns a list of the embedded OBJECTS within the current document."
				},
				anchors: {
					"!type": "+HTMLCollection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.anchors",
					"!doc": "Returns a list of all of the anchors in the document."
				},
				links: {
					"!type": "+HTMLCollection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.links",
					"!doc": "The links property returns a collection of all AREA elements and anchor elements in a document with a value for the href attribute. "
				},
				forms: {
					"!type": "+HTMLCollection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.forms",
					"!doc": "Returns a collection (an HTMLCollection) of the form elements within the current document."
				},
				styleSheets: {
					"!type": "+HTMLCollection",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.styleSheets",
					"!doc": "Returns a list of stylesheet objects for stylesheets explicitly linked into or embedded in a document."
				},
				currentScript: {
					"!type": "+Node",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/API/document.currentScript",
					"!doc": "Returns the <script> element whose script is currently being processed."
				},
				registerElement: {
					"!type": "fn(type: string, options?: ?)",
					"!url": "http://w3c.github.io/webcomponents/spec/custom/#extensions-to-document-interface-to-register",
					"!doc": "The registerElement method of the Document interface provides a way to register a custom element and returns its custom element constructor."
				},
				getElementsByClassName: "Element.prototype.getElementsByClassName",
				querySelector: "Element.prototype.querySelector",
				querySelectorAll: "Element.prototype.querySelectorAll"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/document",
			"!doc": "Each web page loaded in the browser has its own document object. This object serves as an entry point to the web page's content (the DOM tree, including elements such as <body> and <table>) and provides functionality global to the document (such as obtaining the page's URL and creating new elements in the document)."
		},
		document: {
			"!type": "+Document",
			"!url": "https://developer.mozilla.org/en/docs/DOM/document",
			"!doc": "Each web page loaded in the browser has its own document object. This object serves as an entry point to the web page's content (the DOM tree, including elements such as <body> and <table>) and provides functionality global to the document (such as obtaining the page's URL and creating new elements in the document)."
		},
		XMLDocument: {
			"!type": "fn()",
			prototype: "Document.prototype",
			"!url": "https://developer.mozilla.org/en/docs/Parsing_and_serializing_XML",
			"!doc": "The Web platform provides the following objects for parsing and serializing XML:"
		},
		HTMLElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement"
		},
		HTMLAnchorElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement"
		},
		HTMLAreaElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLAreaElement"
		},
		HTMLAudioElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement"
		},
		HTMLBaseElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLBaseElement"
		},
		HTMLBodyElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLBodyElement"
		},
		HTMLBRElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLBRElement"
		},
		HTMLButtonElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement"
		},
		HTMLCanvasElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement"
		},
		HTMLDataElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDataElement"
		},
		HTMLDataListElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDataListElement"
		},
		HTMLDivElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement"
		},
		HTMLDListElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDListElement"
		},
		HTMLDocument: {
			"!type": "Document",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDocument"
		},
		HTMLEmbedElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLEmbedElement"
		},
		HTMLFieldSetElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement"
		},
		HTMLFormControlsCollection: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormControlsCollection"
		},
		HTMLFormElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement"
		},
		HTMLHeadElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLHeadElement"
		},
		HTMLHeadingElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLHeadingElement"
		},
		HTMLHRElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLHRElement"
		},
		HTMLHtmlElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLHtmlElement"
		},
		HTMLIFrameElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement"
		},
		HTMLImageElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement"
		},
		HTMLInputElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement"
		},
		HTMLKeygenElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLKeygenElement"
		},
		HTMLLabelElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement"
		},
		HTMLLegendElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLLegendElement"
		},
		HTMLLIElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLLIElement"
		},
		HTMLLinkElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement"
		},
		HTMLMapElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLMapElement"
		},
		HTMLMediaElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement"
		},
		HTMLMetaElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLMetaElement"
		},
		HTMLMeterElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLMeterElement"
		},
		HTMLModElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLModElement"
		},
		HTMLObjectElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement"
		},
		HTMLOListElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLOListElement"
		},
		HTMLOptGroupElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptGroupElement"
		},
		HTMLOptionElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement"
		},
		HTMLOptionsCollection: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionsCollection"
		},
		HTMLOutputElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLOutputElement"
		},
		HTMLParagraphElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLParagraphElement"
		},
		HTMLParamElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLParamElement"
		},
		HTMLPreElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLPreElement"
		},
		HTMLProgressElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLProgressElement"
		},
		HTMLQuoteElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLQuoteElement"
		},
		HTMLScriptElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement"
		},
		HTMLSelectElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement"
		},
		HTMLSourceElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLSourceElement"
		},
		HTMLSpanElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLSpanElement"
		},
		HTMLStyleElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLStyleElement"
		},
		HTMLTableCaptionElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCaptionElement"
		},
		HTMLTableCellElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement"
		},
		HTMLTableColElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableColElement"
		},
		HTMLTableDataCellElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableDataCellElement"
		},
		HTMLTableElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement"
		},
		HTMLTableHeaderCellElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableHeaderCellElement"
		},
		HTMLTableRowElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement"
		},
		HTMLTableSectionElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement"
		},
		HTMLTextAreaElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement"
		},
		HTMLTimeElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTimeElement"
		},
		HTMLTitleElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTitleElement"
		},
		HTMLTrackElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTrackElement"
		},
		HTMLUListElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLUListElement"
		},
		HTMLUnknownElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLUnknownElement"
		},
		HTMLVideoElement: {
			"!type": "Element",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement"
		},
		Attr: {
			"!type": "fn()",
			prototype: {
				isId: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Attr",
					"!doc": "This type represents a DOM element's attribute as an object. In most DOM methods, you will probably directly retrieve the attribute as a string (e.g., Element.getAttribute(), but certain functions (e.g., Element.getAttributeNode()) or means of iterating give Attr types."
				},
				name: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Attr",
					"!doc": "This type represents a DOM element's attribute as an object. In most DOM methods, you will probably directly retrieve the attribute as a string (e.g., Element.getAttribute(), but certain functions (e.g., Element.getAttributeNode()) or means of iterating give Attr types."
				},
				value: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Attr",
					"!doc": "This type represents a DOM element's attribute as an object. In most DOM methods, you will probably directly retrieve the attribute as a string (e.g., Element.getAttribute(), but certain functions (e.g., Element.getAttributeNode()) or means of iterating give Attr types."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Attr",
			"!doc": "This type represents a DOM element's attribute as an object. In most DOM methods, you will probably directly retrieve the attribute as a string (e.g., Element.getAttribute(), but certain functions (e.g., Element.getAttributeNode()) or means of iterating give Attr types."
		},
		NodeList: {
			"!type": "fn()",
			prototype: {
				length: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.length",
					"!doc": "Returns the number of items in a NodeList."
				},
				item: {
					"!type": "fn(i: number) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/NodeList.item",
					"!doc": "Returns a node from a NodeList by index."
				},
				"<i>": "+Element"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/NodeList",
			"!doc": "NodeList objects are collections of nodes returned by getElementsByTagName, getElementsByTagNameNS, Node.childNodes, querySelectorAll, getElementsByClassName, etc."
		},
		HTMLCollection: {
			"!type": "fn()",
			prototype: {
				length: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/HTMLCollection",
					"!doc": "The number of items in the collection."
				},
				item: {
					"!type": "fn(i: number) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/HTMLCollection",
					"!doc": "Returns the specific node at the given zero-based index into the list. Returns null if the index is out of range."
				},
				namedItem: {
					"!type": "fn(name: string) -> +Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/HTMLCollection",
					"!doc": "Returns the specific node whose ID or, as a fallback, name matches the string specified by name. Matching by name is only done as a last resort, only in HTML, and only if the referenced element supports the name attribute. Returns null if no node exists by the given name."
				},
				"<i>": "+Element"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/HTMLCollection",
			"!doc": "HTMLCollection is an interface representing a generic collection of elements (in document order) and offers methods and properties for traversing the list."
		},
		NamedNodeMap: {
			"!type": "fn()",
			prototype: {
				length: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/NamedNodeMap",
					"!doc": "The number of items in the map."
				},
				getNamedItem: {
					"!type": "fn(name: string) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/NamedNodeMap",
					"!doc": "Gets a node by name."
				},
				setNamedItem: {
					"!type": "fn(node: +Node) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/NamedNodeMap",
					"!doc": "Adds (or replaces) a node by its nodeName."
				},
				removeNamedItem: {
					"!type": "fn(name: string) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/NamedNodeMap",
					"!doc": "Removes a node (or if an attribute, may reveal a default if present)."
				},
				item: {
					"!type": "fn(i: number) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/NamedNodeMap",
					"!doc": "Returns the item at the given index (or null if the index is higher or equal to the number of nodes)."
				},
				getNamedItemNS: {
					"!type": "fn(ns: string, name: string) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/NamedNodeMap",
					"!doc": "Gets a node by namespace and localName."
				},
				setNamedItemNS: {
					"!type": "fn(node: +Node) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/NamedNodeMap",
					"!doc": "Adds (or replaces) a node by its localName and namespaceURI."
				},
				removeNamedItemNS: {
					"!type": "fn(ns: string, name: string) -> +Node",
					"!url": "https://developer.mozilla.org/en/docs/DOM/NamedNodeMap",
					"!doc": "Removes a node (or if an attribute, may reveal a default if present)."
				},
				"<i>": "+Node"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/NamedNodeMap",
			"!doc": "A collection of nodes returned by Element.attributes (also potentially for DocumentType.entities, DocumentType.notations). NamedNodeMaps are not in any particular order (unlike NodeList), although they may be accessed by an index as in an array (they may also be accessed with the item() method). A NamedNodeMap object are live and will thus be auto-updated if changes are made to their contents internally or elsewhere."
		},
		DocumentFragment: {
			"!type": "fn()",
			prototype: {
				"!proto": "Node.prototype"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/document.createDocumentFragment",
			"!doc": "Creates a new empty DocumentFragment."
		},
		DOMTokenList: {
			"!type": "fn()",
			prototype: {
				length: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/DOMTokenList",
					"!doc": "The amount of items in the list."
				},
				item: {
					"!type": "fn(i: number) -> string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/DOMTokenList",
					"!doc": "Returns an item in the list by its index."
				},
				contains: {
					"!type": "fn(token: string) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/DOMTokenList",
					"!doc": "Return true if the underlying string contains token, otherwise false."
				},
				add: {
					"!type": "fn(token: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/DOMTokenList",
					"!doc": "Adds token to the underlying string."
				},
				remove: {
					"!type": "fn(token: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/DOMTokenList",
					"!doc": "Remove token from the underlying string."
				},
				toggle: {
					"!type": "fn(token: string) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/DOMTokenList",
					"!doc": "Removes token from string and returns false. If token doesn't exist it's added and the function returns true."
				},
				"<i>": "string"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/DOMTokenList",
			"!doc": "This type represents a set of space-separated tokens. Commonly returned by HTMLElement.classList, HTMLLinkElement.relList, HTMLAnchorElement.relList or HTMLAreaElement.relList. It is indexed beginning with 0 as with JavaScript arrays. DOMTokenList is always case-sensitive."
		},
		XPathResult: {
			"!type": "fn()",
			prototype: {
				boolValue: "bool",
				invalidIteratorState: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/Introduction_to_using_XPath_in_JavaScript",
					"!doc": "This document describes the interface for using XPath in JavaScript internally, in extensions, and from websites. Mozilla implements a fair amount of the DOM 3 XPath. Which means that XPath expressions can be run against both HTML and XML documents."
				},
				numberValue: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/XPathResult",
					"!doc": "Refer to nsIDOMXPathResult for more detail."
				},
				resultType: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/document.evaluate",
					"!doc": "Returns an XPathResult based on an XPath expression and other given parameters."
				},
				singleNodeValue: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/Introduction_to_using_XPath_in_JavaScript",
					"!doc": "This document describes the interface for using XPath in JavaScript internally, in extensions, and from websites. Mozilla implements a fair amount of the DOM 3 XPath. Which means that XPath expressions can be run against both HTML and XML documents."
				},
				snapshotLength: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/XPathResult",
					"!doc": "Refer to nsIDOMXPathResult for more detail."
				},
				stringValue: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/Introduction_to_using_XPath_in_JavaScript",
					"!doc": "This document describes the interface for using XPath in JavaScript internally, in extensions, and from websites. Mozilla implements a fair amount of the DOM 3 XPath. Which means that XPath expressions can be run against both HTML and XML documents."
				},
				iterateNext: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/Introduction_to_using_XPath_in_JavaScript",
					"!doc": "This document describes the interface for using XPath in JavaScript internally, in extensions, and from websites. Mozilla implements a fair amount of the DOM 3 XPath. Which means that XPath expressions can be run against both HTML and XML documents."
				},
				snapshotItem: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en-US/docs/XPathResult#snapshotItem()"
				},
				ANY_TYPE: "number",
				NUMBER_TYPE: "number",
				STRING_TYPE: "number",
				BOOL_TYPE: "number",
				UNORDERED_NODE_ITERATOR_TYPE: "number",
				ORDERED_NODE_ITERATOR_TYPE: "number",
				UNORDERED_NODE_SNAPSHOT_TYPE: "number",
				ORDERED_NODE_SNAPSHOT_TYPE: "number",
				ANY_UNORDERED_NODE_TYPE: "number",
				FIRST_ORDERED_NODE_TYPE: "number"
			},
			"!url": "https://developer.mozilla.org/en/docs/XPathResult",
			"!doc": "Refer to nsIDOMXPathResult for more detail."
		},
		ClientRect: {
			"!type": "fn()",
			prototype: {
				top: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getClientRects",
					"!doc": "Top of the box, in pixels, relative to the viewport."
				},
				left: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getClientRects",
					"!doc": "Left of the box, in pixels, relative to the viewport."
				},
				bottom: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getClientRects",
					"!doc": "Bottom of the box, in pixels, relative to the viewport."
				},
				right: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/element.getClientRects",
					"!doc": "Right of the box, in pixels, relative to the viewport."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.getClientRects",
			"!doc": "Returns a collection of rectangles that indicate the bounding rectangles for each box in a client."
		},
		Event: {
			"!type": "fn()",
			prototype: {
				stopPropagation: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.stopPropagation",
					"!doc": "Prevents further propagation of the current event."
				},
				preventDefault: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.preventDefault",
					"!doc": "Cancels the event if it is cancelable, without stopping further propagation of the event."
				},
				initEvent: {
					"!type": "fn(type: string, bubbles: bool, cancelable: bool)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.initEvent",
					"!doc": "The initEvent method is used to initialize the value of an event created using document.createEvent."
				},
				stopImmediatePropagation: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.stopImmediatePropagation",
					"!doc": "Prevents other listeners of the same event to be called."
				},
				type: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/API/event.type",
					"!doc": "Returns a string containing the type of event."
				},
				NONE: "number",
				CAPTURING_PHASE: "number",
				AT_TARGET: "number",
				BUBBLING_PHASE: "number",
				MOUSEDOWN: "number",
				MOUSEUP: "number",
				MOUSEOVER: "number",
				MOUSEOUT: "number",
				MOUSEMOVE: "number",
				MOUSEDRAG: "number",
				CLICK: "number",
				DBLCLICK: "number",
				KEYDOWN: "number",
				KEYUP: "number",
				KEYPRESS: "number",
				DRAGDROP: "number",
				FOCUS: "number",
				BLUR: "number",
				SELECT: "number",
				CHANGE: "number",
				target: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/EventTarget",
					"!doc": "An EventTarget is a DOM interface implemented by objects that can receive DOM events and have listeners for them. The most common EventTargets are DOM elements, although other objects can be EventTargets too, for example document, window, XMLHttpRequest, and others."
				},
				relatedTarget: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.relatedTarget",
					"!doc": "Identifies a secondary target for the event."
				},
				pageX: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.pageX",
					"!doc": "Returns the horizontal coordinate of the event relative to whole document."
				},
				pageY: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.pageY",
					"!doc": "Returns the vertical coordinate of the event relative to the whole document."
				},
				clientX: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.clientX",
					"!doc": "Returns the horizontal coordinate within the application's client area at which the event occurred (as opposed to the coordinates within the page). For example, clicking in the top-left corner of the client area will always result in a mouse event with a clientX value of 0, regardless of whether the page is scrolled horizontally."
				},
				clientY: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.clientY",
					"!doc": "Returns the vertical coordinate within the application's client area at which the event occurred (as opposed to the coordinates within the page). For example, clicking in the top-left corner of the client area will always result in a mouse event with a clientY value of 0, regardless of whether the page is scrolled vertically."
				},
				keyCode: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.keyCode",
					"!doc": "Returns the Unicode value of a non-character key in a keypress event or any key in any other type of keyboard event."
				},
				charCode: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.charCode",
					"!doc": "Returns the Unicode value of a character key pressed during a keypress event."
				},
				which: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.which",
					"!doc": "Returns the numeric keyCode of the key pressed, or the character code (charCode) for an alphanumeric key pressed."
				},
				button: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.button",
					"!doc": "Indicates which mouse button caused the event."
				},
				shiftKey: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.shiftKey",
					"!doc": "Indicates whether the SHIFT key was pressed when the event fired."
				},
				ctrlKey: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.ctrlKey",
					"!doc": "Indicates whether the CTRL key was pressed when the event fired."
				},
				altKey: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.altKey",
					"!doc": "Indicates whether the ALT key was pressed when the event fired."
				},
				metaKey: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.metaKey",
					"!doc": "Indicates whether the META key was pressed when the event fired."
				},
				returnValue: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/window.onbeforeunload",
					"!doc": "An event that fires when a window is about to unload its resources. The document is still visible and the event is still cancelable."
				},
				cancelBubble: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/event.cancelBubble",
					"!doc": "bool is the boolean value of true or false."
				},
				dataTransfer: {
					dropEffect: {
						"!type": "string",
						"!url": "https://developer.mozilla.org/en/docs/DragDrop/DataTransfer",
						"!doc": "The actual effect that will be used, and should always be one of the possible values of effectAllowed."
					},
					effectAllowed: {
						"!type": "string",
						"!url": "https://developer.mozilla.org/en/docs/DragDrop/Drag_Operations",
						"!doc": "Specifies the effects that are allowed for this drag."
					},
					files: {
						"!type": "+FileList",
						"!url": "https://developer.mozilla.org/en/docs/DragDrop/DataTransfer",
						"!doc": "Contains a list of all the local files available on the data transfer."
					},
					types: {
						"!type": "[string]",
						"!url": "https://developer.mozilla.org/en-US/docs/DragDrop/DataTransfer",
						"!doc": "Holds a list of the format types of the data that is stored for the first item, in the same order the data was added. An empty list will be returned if no data was added."
					},
					addElement: {
						"!type": "fn(element: +Element)",
						"!url": "https://developer.mozilla.org/en/docs/DragDrop/DataTransfer",
						"!doc": "Set the drag source."
					},
					clearData: {
						"!type": "fn(type?: string)",
						"!url": "https://developer.mozilla.org/en/docs/DragDrop/Drag_Operations",
						"!doc": "Remove the data associated with a given type."
					},
					getData: {
						"!type": "fn(type: string) -> string",
						"!url": "https://developer.mozilla.org/en/docs/DragDrop/Drag_Operations",
						"!doc": "Retrieves the data for a given type, or an empty string if data for that type does not exist or the data transfer contains no data."
					},
					setData: {
						"!type": "fn(type: string, data: string)",
						"!url": "https://developer.mozilla.org/en/docs/DragDrop/Drag_Operations",
						"!doc": "Set the data for a given type."
					},
					setDragImage: {
						"!type": "fn(image: +Element)",
						"!url": "https://developer.mozilla.org/en/docs/DragDrop/Drag_Operations",
						"!doc": "Set the image to be used for dragging if a custom one is desired."
					},
					"!url": "https://developer.mozilla.org/en/docs/DragDrop/DataTransfer",
					"!doc": "This object is available from the dataTransfer property of all drag events. It cannot be created separately."
				}
			},
			"!url": "https://developer.mozilla.org/en-US/docs/DOM/event",
			"!doc": "The DOM Event interface is accessible from within the handler function, via the event object passed as the first argument."
		},
		TouchEvent: {
			"!type": "fn()",
			prototype: "Event.prototype",
			"!url": "https://developer.mozilla.org/en/docs/DOM/Touch_events",
			"!doc": "In order to provide quality support for touch-based user interfaces, touch events offer the ability to interpret finger activity on touch screens or trackpads."
		},
		WheelEvent: {
			"!type": "fn()",
			prototype: "Event.prototype",
			"!url": "https://developer.mozilla.org/en/docs/DOM/WheelEvent",
			"!doc": "The DOM WheelEvent represents events that occur due to the user moving a mouse wheel or similar input device."
		},
		MouseEvent: {
			"!type": "fn()",
			prototype: "Event.prototype",
			"!url": "https://developer.mozilla.org/en/docs/DOM/MouseEvent",
			"!doc": "The DOM MouseEvent represents events that occur due to the user interacting with a pointing device (such as a mouse). It's represented by the nsINSDOMMouseEvent interface, which extends the nsIDOMMouseEvent interface."
		},
		KeyboardEvent: {
			"!type": "fn()",
			prototype: "Event.prototype",
			"!url": "https://developer.mozilla.org/en/docs/DOM/KeyboardEvent",
			"!doc": "KeyboardEvent objects describe a user interaction with the keyboard. Each event describes a key; the event type (keydown, keypress, or keyup) identifies what kind of activity was performed."
		},
		HashChangeEvent: {
			"!type": "fn()",
			prototype: "Event.prototype",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onhashchange",
			"!doc": "The hashchange event fires when a window's hash changes."
		},
		ErrorEvent: {
			"!type": "fn()",
			prototype: "Event.prototype",
			"!url": "https://developer.mozilla.org/en/docs/DOM/DOM_event_reference/error",
			"!doc": "The error event is fired whenever a resource fails to load."
		},
		CustomEvent: {
			"!type": "fn()",
			prototype: "Event.prototype",
			"!url": "https://developer.mozilla.org/en/docs/DOM/Event/CustomEvent",
			"!doc": "The DOM CustomEvent are events initialized by an application for any purpose."
		},
		BeforeLoadEvent: {
			"!type": "fn()",
			prototype: "Event.prototype",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window",
			"!doc": "This section provides a brief reference for all of the methods, properties, and events available through the DOM window object. The window object implements the Window interface, which in turn inherits from the AbstractView interface. Some additional global functions, namespaces objects, and constructors, not typically associated with the window, but available on it, are listed in the JavaScript Reference."
		},
		WebSocket: {
			"!type": "fn(url: string)",
			prototype: {
				close: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/WebSockets_reference/CloseEvent",
					"!doc": "A CloseEvent is sent to clients using WebSockets when the connection is closed. This is delivered to the listener indicated by the WebSocket object's onclose attribute."
				},
				send: {
					"!type": "fn(data: string)",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/WebSockets_reference/WebSocket",
					"!doc": "The WebSocket object provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection."
				},
				binaryType: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/WebSockets_reference/WebSocket",
					"!doc": "The WebSocket object provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection."
				},
				bufferedAmount: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/Writing_WebSocket_client_applications",
					"!doc": "WebSockets is a technology that makes it possible to open an interactive communication session between the user's browser and a server. Using a WebSocket connection, Web applications can perform real-time communication instead of having to poll for changes back and forth."
				},
				extensions: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/WebSockets_reference/WebSocket",
					"!doc": "The WebSocket object provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection."
				},
				onclose: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/WebSockets_reference/CloseEvent",
					"!doc": "A CloseEvent is sent to clients using WebSockets when the connection is closed. This is delivered to the listener indicated by the WebSocket object's onclose attribute."
				},
				onerror: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/Writing_WebSocket_client_applications",
					"!doc": "WebSockets is a technology that makes it possible to open an interactive communication session between the user's browser and a server. Using a WebSocket connection, Web applications can perform real-time communication instead of having to poll for changes back and forth."
				},
				onmessage: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/WebSockets_reference/WebSocket",
					"!doc": "The WebSocket object provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection."
				},
				onopen: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/WebSockets_reference/WebSocket",
					"!doc": "The WebSocket object provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection."
				},
				protocol: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets",
					"!doc": "WebSockets is an advanced technology that makes it possible to open an interactive communication session between the user's browser and a server. With this API, you can send messages to a server and receive event-driven responses without having to poll the server for a reply."
				},
				url: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/WebSockets/Writing_WebSocket_client_applications",
					"!doc": "WebSockets is a technology that makes it possible to open an interactive communication session between the user's browser and a server. Using a WebSocket connection, Web applications can perform real-time communication instead of having to poll for changes back and forth."
				},
				CONNECTING: "number",
				OPEN: "number",
				CLOSING: "number",
				CLOSED: "number"
			},
			"!url": "https://developer.mozilla.org/en/docs/WebSockets",
			"!doc": "WebSockets is an advanced technology that makes it possible to open an interactive communication session between the user's browser and a server. With this API, you can send messages to a server and receive event-driven responses without having to poll the server for a reply."
		},
		Worker: {
			"!type": "fn(scriptURL: string)",
			prototype: {
				postMessage: {
					"!type": "fn(message: ?)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Worker",
					"!doc": "Sends a message to the worker's inner scope. This accepts a single parameter, which is the data to send to the worker. The data may be any value or JavaScript object handled by the structured clone algorithm, which includes cyclical references."
				},
				terminate: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Worker",
					"!doc": "Immediately terminates the worker. This does not offer the worker an opportunity to finish its operations; it is simply stopped at once."
				},
				onmessage: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Worker",
					"!doc": "An event listener that is called whenever a MessageEvent with type message bubbles through the worker. The message is stored in the event's data member."
				},
				onerror: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Worker",
					"!doc": "An event listener that is called whenever an ErrorEvent with type error bubbles through the worker."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Worker",
			"!doc": "Workers are background tasks that can be easily created and can send messages back to their creators. Creating a worker is as simple as calling the Worker() constructor, specifying a script to be run in the worker thread."
		},
		localStorage: {
			setItem: {
				"!type": "fn(name: string, value: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Storage",
				"!doc": "Store an item in storage."
			},
			getItem: {
				"!type": "fn(name: string) -> string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Storage",
				"!doc": "Retrieve an item from storage."
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Storage",
			"!doc": "The DOM Storage mechanism is a means through which string key/value pairs can be securely stored and later retrieved for use."
		},
		sessionStorage: {
			setItem: {
				"!type": "fn(name: string, value: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Storage",
				"!doc": "Store an item in storage."
			},
			getItem: {
				"!type": "fn(name: string) -> string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Storage",
				"!doc": "Retrieve an item from storage."
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Storage",
			"!doc": "This is a global object (sessionStorage) that maintains a storage area that's available for the duration of the page session. A page session lasts for as long as the browser is open and survives over page reloads and restores. Opening a page in a new tab or window will cause a new session to be initiated."
		},
		FileList: {
			"!type": "fn()",
			prototype: {
				length: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileList",
					"!doc": "A read-only value indicating the number of files in the list."
				},
				item: {
					"!type": "fn(i: number) -> +File",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileList",
					"!doc": "Returns a File object representing the file at the specified index in the file list."
				},
				"<i>": "+File"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/FileList",
			"!doc": 'An object of this type is returned by the files property of the HTML input element; this lets you access the list of files selected with the <input type="file"> element. It\'s also used for a list of files dropped into web content when using the drag and drop API.'
		},
		File: {
			"!type": "fn()",
			prototype: {
				"!proto": "Blob.prototype",
				fileName: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/File.fileName",
					"!doc": "Returns the name of the file. For security reasons the path is excluded from this property."
				},
				fileSize: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/File.fileSize",
					"!doc": "Returns the size of a file in bytes."
				},
				lastModifiedDate: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/File.lastModifiedDate",
					"!doc": "Returns the last modified date of the file. Files without a known last modified date use the current date instead."
				},
				name: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/File.name",
					"!doc": "Returns the name of the file. For security reasons, the path is excluded from this property."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/File",
			"!doc": "The File object provides information about -- and access to the contents of -- files. These are generally retrieved from a FileList object returned as a result of a user selecting files using the input element, or from a drag and drop operation's DataTransfer object."
		},
		Blob: {
			"!type": "fn(parts: [?], properties?: ?)",
			prototype: {
				size: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Blob",
					"!doc": "The size, in bytes, of the data contained in the Blob object. Read only."
				},
				type: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Blob",
					"!doc": "An ASCII-encoded string, in all lower case, indicating the MIME type of the data contained in the Blob. If the type is unknown, this string is empty. Read only."
				},
				slice: {
					"!type": "fn(start: number, end?: number, type?: string) -> +Blob",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Blob",
					"!doc": "Returns a new Blob object containing the data in the specified range of bytes of the source Blob."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Blob",
			"!doc": "A Blob object represents a file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system."
		},
		FileReader: {
			"!type": "fn()",
			prototype: {
				abort: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Aborts the read operation. Upon return, the readyState will be DONE."
				},
				readAsArrayBuffer: {
					"!type": "fn(blob: +Blob)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Starts reading the contents of the specified Blob, producing an ArrayBuffer."
				},
				readAsBinaryString: {
					"!type": "fn(blob: +Blob)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Starts reading the contents of the specified Blob, producing raw binary data."
				},
				readAsDataURL: {
					"!type": "fn(blob: +Blob)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Starts reading the contents of the specified Blob, producing a data: url."
				},
				readAsText: {
					"!type": "fn(blob: +Blob, encoding?: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Starts reading the contents of the specified Blob, producing a string."
				},
				EMPTY: "number",
				LOADING: "number",
				DONE: "number",
				error: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "The error that occurred while reading the file. Read only."
				},
				readyState: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Indicates the state of the FileReader. This will be one of the State constants. Read only."
				},
				result: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "The file's contents. This property is only valid after the read operation is complete, and the format of the data depends on which of the methods was used to initiate the read operation. Read only."
				},
				onabort: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Called when the read operation is aborted."
				},
				onerror: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Called when an error occurs."
				},
				onload: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Called when the read operation is successfully completed."
				},
				onloadend: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Called when the read is completed, whether successful or not. This is called after either onload or onerror."
				},
				onloadstart: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Called when reading the data is about to begin."
				},
				onprogress: {
					"!type": "?",
					"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
					"!doc": "Called periodically while the data is being read."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/FileReader",
			"!doc": "The FileReader object lets web applications asynchronously read the contents of files (or raw data buffers) stored on the user's computer, using File or Blob objects to specify the file or data to read. File objects may be obtained from a FileList object returned as a result of a user selecting files using the <input> element, from a drag and drop operation's DataTransfer object, or from the mozGetAsFile() API on an HTMLCanvasElement."
		},
		URL: {
			createObjectURL: {
				"!type": "fn(blob: +Blob) -> string",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL",
				"!doc": "The URL.createObjectURL() static method creates a DOMString containing an URL representing the object given in parameter."
			},
			revokeObjectURL: {
				"!type": "fn(string)",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/API/URL.revokeObjectURL",
				"!doc": "The URL.revokeObjectURL() static method releases an existing object URL which was previously created by calling window.URL.createObjectURL()."
			}
		},
		Range: {
			"!type": "fn()",
			prototype: {
				collapsed: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.collapsed",
					"!doc": "Returns a boolean indicating whether the range's start and end points are at the same position."
				},
				commonAncestorContainer: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.commonAncestorContainer",
					"!doc": "Returns the deepest Node that contains the  startContainer and  endContainer Nodes."
				},
				endContainer: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.endContainer",
					"!doc": "Returns the Node within which the Range ends."
				},
				endOffset: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.endOffset",
					"!doc": "Returns a number representing where in the  endContainer the Range ends."
				},
				startContainer: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.startContainer",
					"!doc": "Returns the Node within which the Range starts."
				},
				startOffset: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.startOffset",
					"!doc": "Returns a number representing where in the startContainer the Range starts."
				},
				setStart: {
					"!type": "fn(node: +Element, offset: number)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.setStart",
					"!doc": "Sets the start position of a Range."
				},
				setEnd: {
					"!type": "fn(node: +Element, offset: number)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.setEnd",
					"!doc": "Sets the end position of a Range."
				},
				setStartBefore: {
					"!type": "fn(node: +Element)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.setStartBefore",
					"!doc": "Sets the start position of a Range relative to another Node."
				},
				setStartAfter: {
					"!type": "fn(node: +Element)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.setStartAfter",
					"!doc": "Sets the start position of a Range relative to a Node."
				},
				setEndBefore: {
					"!type": "fn(node: +Element)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.setEndBefore",
					"!doc": "Sets the end position of a Range relative to another Node."
				},
				setEndAfter: {
					"!type": "fn(node: +Element)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.setEndAfter",
					"!doc": "Sets the end position of a Range relative to another Node."
				},
				selectNode: {
					"!type": "fn(node: +Element)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.selectNode",
					"!doc": "Sets the Range to contain the Node and its contents."
				},
				selectNodeContents: {
					"!type": "fn(node: +Element)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.selectNodeContents",
					"!doc": "Sets the Range to contain the contents of a Node."
				},
				collapse: {
					"!type": "fn(toStart: bool)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.collapse",
					"!doc": "Collapses the Range to one of its boundary points."
				},
				cloneContents: {
					"!type": "fn() -> +DocumentFragment",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.cloneContents",
					"!doc": "Returns a DocumentFragment copying the Nodes of a Range."
				},
				deleteContents: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.deleteContents",
					"!doc": "Removes the contents of a Range from the Document."
				},
				extractContents: {
					"!type": "fn() -> +DocumentFragment",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.extractContents",
					"!doc": "Moves contents of a Range from the document tree into a DocumentFragment."
				},
				insertNode: {
					"!type": "fn(node: +Element)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.insertNode",
					"!doc": "Insert a node at the start of a Range."
				},
				surroundContents: {
					"!type": "fn(node: +Element)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.surroundContents",
					"!doc": "Moves content of a Range into a new node, placing the new node at the start of the specified range."
				},
				compareBoundaryPoints: {
					"!type": "fn(how: number, other: +Range) -> number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.compareBoundaryPoints",
					"!doc": "Compares the boundary points of two Ranges."
				},
				cloneRange: {
					"!type": "fn() -> +Range",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.cloneRange",
					"!doc": "Returns a Range object with boundary points identical to the cloned Range."
				},
				detach: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/range.detach",
					"!doc": "Releases a Range from use to improve performance. This lets the browser choose to release resources associated with this Range. Subsequent attempts to use the detached range will result in a DOMException being thrown with an error code of INVALID_STATE_ERR."
				},
				END_TO_END: "number",
				END_TO_START: "number",
				START_TO_END: "number",
				START_TO_START: "number"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/range.detach",
			"!doc": "Releases a Range from use to improve performance. This lets the browser choose to release resources associated with this Range. Subsequent attempts to use the detached range will result in a DOMException being thrown with an error code of INVALID_STATE_ERR."
		},
		XMLHttpRequest: {
			"!type": "fn()",
			prototype: {
				abort: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "Aborts the request if it has already been sent."
				},
				getAllResponseHeaders: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "Returns all the response headers as a string, or null if no response has been received. Note: For multipart requests, this returns the headers from the current part of the request, not from the original channel."
				},
				getResponseHeader: {
					"!type": "fn(header: string) -> string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "Returns the string containing the text of the specified header, or null if either the response has not yet been received or the header doesn't exist in the response."
				},
				open: {
					"!type": "fn(method: string, url: string, async?: bool, user?: string, password?: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "Initializes a request."
				},
				overrideMimeType: {
					"!type": "fn(type: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "Overrides the MIME type returned by the server."
				},
				send: {
					"!type": "fn(data?: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "Sends the request. If the request is asynchronous (which is the default), this method returns as soon as the request is sent. If the request is synchronous, this method doesn't return until the response has arrived."
				},
				setRequestHeader: {
					"!type": "fn(header: string, value: string)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "Sets the value of an HTTP request header.You must call setRequestHeader() after open(), but before send()."
				},
				onreadystatechange: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "A JavaScript function object that is called whenever the readyState attribute changes."
				},
				readyState: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "The state of the request. (0=unsent, 1=opened, 2=headers_received, 3=loading, 4=done)"
				},
				response: {
					"!type": "+Document",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": 'The response entity body according to responseType, as an ArrayBuffer, Blob, Document, JavaScript object (for "json"), or string. This is null if the request is not complete or was not successful.'
				},
				responseText: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "The response to the request as text, or null if the request was unsuccessful or has not yet been sent."
				},
				responseType: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "Can be set to change the response type."
				},
				responseXML: {
					"!type": "+Document",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "The response to the request as a DOM Document object, or null if the request was unsuccessful, has not yet been sent, or cannot be parsed as XML or HTML."
				},
				status: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": "The status of the response to the request. This is the HTTP result code"
				},
				statusText: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
					"!doc": 'The response string returned by the HTTP server. Unlike status, this includes the entire text of the response message ("200 OK", for example).'
				},
				timeout: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest/Synchronous_and_Asynchronous_Requests",
					"!doc": "The number of milliseconds a request can take before automatically being terminated. A value of 0 (which is the default) means there is no timeout."
				},
				UNSENT: "number",
				OPENED: "number",
				HEADERS_RECEIVED: "number",
				LOADING: "number",
				DONE: "number"
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/XMLHttpRequest",
			"!doc": "XMLHttpRequest is a JavaScript object that was designed by Microsoft and adopted by Mozilla, Apple, and Google. It's now being standardized in the W3C. It provides an easy way to retrieve data at a URL. Despite its name, XMLHttpRequest can be used to retrieve any type of data, not just XML, and it supports protocols other than HTTP (including file and ftp)."
		},
		DOMParser: {
			"!type": "fn()",
			prototype: {
				parseFromString: {
					"!type": "fn(data: string, mime: string) -> +Document",
					"!url": "https://developer.mozilla.org/en/docs/DOM/DOMParser",
					"!doc": "DOMParser can parse XML or HTML source stored in a string into a DOM Document. DOMParser is specified in DOM Parsing and Serialization."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/DOMParser",
			"!doc": "DOMParser can parse XML or HTML source stored in a string into a DOM Document. DOMParser is specified in DOM Parsing and Serialization."
		},
		FormData: {
			"!type": "fn()",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData",
			prototype: {
				append: {
					"!type": "fn(name: string, value: ?, filename: string)",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData/append",
					"!doc": "Appends a new value onto an existing key inside a FormData object, or adds the key if it does not already exist."
				},
				"delete": {
					"!type": "fn(name: string)",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData/delete",
					"!doc": "Deletes a key/value pair from a FormData object."
				},
				get: {
					"!type": "fn(name: string)",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData/get",
					"!doc": "Returns the first value associated with a given key from within a FormData object."
				},
				getAll: {
					"!type": "fn(name: string)",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData/getAll",
					"!doc": "Returns an array of all the values associated with a given key from within a FormData."
				},
				has: {
					"!type": "fn(name: string)",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData/has",
					"!doc": "Returns a boolean stating whether a FormData object contains a certain key/value pair."
				},
				set: {
					"!type": "fn(name: string, value: ?, filename: string)",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData/set",
					"!doc": "Sets a new value for an existing key inside a FormData object, or adds the key/value if it does not already exist."
				}
			}
		},
		Selection: {
			"!type": "fn()",
			prototype: {
				anchorNode: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/anchorNode",
					"!doc": "Returns the node in which the selection begins."
				},
				anchorOffset: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/anchorOffset",
					"!doc": "Returns the number of characters that the selection's anchor is offset within the anchorNode."
				},
				focusNode: {
					"!type": "+Element",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/focusNode",
					"!doc": "Returns the node in which the selection ends."
				},
				focusOffset: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/focusOffset",
					"!doc": "Returns the number of characters that the selection's focus is offset within the focusNode. "
				},
				isCollapsed: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/isCollapsed",
					"!doc": "Returns a boolean indicating whether the selection's start and end points are at the same position."
				},
				rangeCount: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/rangeCount",
					"!doc": "Returns the number of ranges in the selection."
				},
				getRangeAt: {
					"!type": "fn(i: number) -> +Range",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/getRangeAt",
					"!doc": "Returns a range object representing one of the ranges currently selected."
				},
				collapse: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/collapse",
					"!doc": "Collapses the current selection to a single point. The document is not modified. If the content is focused and editable, the caret will blink there."
				},
				extend: {
					"!type": "fn(node: +Element, offset: number)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/extend",
					"!doc": "Moves the focus of the selection to a specified point. The anchor of the selection does not move. The selection will be from the anchor to the new focus regardless of direction."
				},
				collapseToStart: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/collapseToStart",
					"!doc": "Collapses the selection to the start of the first range in the selection.  If the content of the selection is focused and editable, the caret will blink there."
				},
				collapseToEnd: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/collapseToEnd",
					"!doc": "Collapses the selection to the end of the last range in the selection.  If the content the selection is in is focused and editable, the caret will blink there."
				},
				selectAllChildren: {
					"!type": "fn(node: +Element)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/selectAllChildren",
					"!doc": "Adds all the children of the specified node to the selection. Previous selection is lost."
				},
				addRange: {
					"!type": "fn(range: +Range)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/addRange",
					"!doc": "Adds a Range to a Selection."
				},
				removeRange: {
					"!type": "fn(range: +Range)",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/removeRange",
					"!doc": "Removes a range from the selection."
				},
				removeAllRanges: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/removeAllRanges",
					"!doc": "Removes all ranges from the selection, leaving the anchorNode and focusNode properties equal to null and leaving nothing selected. "
				},
				deleteFromDocument: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/deleteFromDocument",
					"!doc": "Deletes the actual text being represented by a selection object from the document's DOM."
				},
				containsNode: {
					"!type": "fn(node: +Element) -> bool",
					"!url": "https://developer.mozilla.org/en/docs/DOM/Selection/containsNode",
					"!doc": "Indicates if the node is part of the selection."
				}
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Selection",
			"!doc": "Selection is the class of the object returned by window.getSelection() and other methods. It represents the text selection in the greater page, possibly spanning multiple elements, when the user drags over static text and other parts of the page. For information about text selection in an individual text editing element."
		},
		console: {
			error: {
				"!type": "fn(text: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/console.error",
				"!doc": "Outputs an error message to the Web Console."
			},
			info: {
				"!type": "fn(text: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/console.info",
				"!doc": "Outputs an informational message to the Web Console."
			},
			log: {
				"!type": "fn(text: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/console.log",
				"!doc": "Outputs a message to the Web Console."
			},
			warn: {
				"!type": "fn(text: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/console.warn",
				"!doc": "Outputs a warning message to the Web Console."
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/console",
			"!doc": "The console object provides access to the browser's debugging console. The specifics of how it works vary from browser to browser, but there is a de facto set of features that are typically provided."
		},
		top: {
			"!type": "<top>",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.top",
			"!doc": "Returns a reference to the topmost window in the window hierarchy."
		},
		parent: {
			"!type": "<top>",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.parent",
			"!doc": "A reference to the parent of the current window or subframe."
		},
		window: {
			"!type": "<top>",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window",
			"!doc": "The window object represents a window containing a DOM document."
		},
		opener: {
			"!type": "<top>",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.opener",
			"!doc": "Returns a reference to the window that opened this current window."
		},
		self: {
			"!type": "<top>",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.self",
			"!doc": "Returns an object reference to the window object. "
		},
		devicePixelRatio: "number",
		name: {
			"!type": "string",
			"!url": "https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/Function/name",
			"!doc": "The name of the function."
		},
		closed: {
			"!type": "bool",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.closed",
			"!doc": "This property indicates whether the referenced window is closed or not."
		},
		pageYOffset: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.scrollY",
			"!doc": "Returns the number of pixels that the document has already been scrolled vertically."
		},
		pageXOffset: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.scrollX",
			"!doc": "Returns the number of pixels that the document has already been scrolled vertically."
		},
		scrollY: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.scrollY",
			"!doc": "Returns the number of pixels that the document has already been scrolled vertically."
		},
		scrollX: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.scrollX",
			"!doc": "Returns the number of pixels that the document has already been scrolled vertically."
		},
		screenTop: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.top",
			"!doc": "Returns the distance in pixels from the top side of the current screen."
		},
		screenLeft: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.left",
			"!doc": "Returns the distance in pixels from the left side of the main screen to the left side of the current screen."
		},
		screenY: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/event.screenY",
			"!doc": "Returns the vertical coordinate of the event within the screen as a whole."
		},
		screenX: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/event.screenX",
			"!doc": "Returns the horizontal coordinate of the event within the screen as a whole."
		},
		innerWidth: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.innerWidth",
			"!doc": "Width (in pixels) of the browser window viewport including, if rendered, the vertical scrollbar."
		},
		innerHeight: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.innerHeight",
			"!doc": "Height (in pixels) of the browser window viewport including, if rendered, the horizontal scrollbar."
		},
		outerWidth: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.outerWidth",
			"!doc": "window.outerWidth gets the width of the outside of the browser window. It represents the width of the whole browser window including sidebar (if expanded), window chrome and window resizing borders/handles."
		},
		outerHeight: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.outerHeight",
			"!doc": "window.outerHeight gets the height in pixels of the whole browser window."
		},
		frameElement: {
			"!type": "+Element",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.frameElement",
			"!doc": "Returns the element (such as <iframe> or <object>) in which the window is embedded, or null if the window is top-level."
		},
		crypto: {
			getRandomValues: {
				"!type": "fn([number])",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.crypto.getRandomValues",
				"!doc": "This methods lets you get cryptographically random values."
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.crypto.getRandomValues",
			"!doc": "This methods lets you get cryptographically random values."
		},
		navigator: {
			appName: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.navigator.appName",
				"!doc": 'Returns the name of the browser. The HTML5 specification also allows any browser to return "Netscape" here, for compatibility reasons.'
			},
			appVersion: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.navigator.appVersion",
				"!doc": 'Returns the version of the browser as a string. It may be either a plain version number, like "5.0", or a version number followed by more detailed information. The HTML5 specification also allows any browser to return "4.0" here, for compatibility reasons.'
			},
			language: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.navigator.language",
				"!doc": "Returns a string representing the language version of the browser."
			},
			platform: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.navigator.platform",
				"!doc": "Returns a string representing the platform of the browser."
			},
			plugins: {
				"!type": "[?]",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.navigator.plugins",
				"!doc": "Returns a PluginArray object, listing the plugins installed in the application."
			},
			userAgent: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.navigator.userAgent",
				"!doc": "Returns the user agent string for the current browser."
			},
			vendor: {
				"!type": "string",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.navigator.vendor",
				"!doc": "Returns the name of the browser vendor for the current browser."
			},
			javaEnabled: {
				"!type": "bool",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.navigator.javaEnabled",
				"!doc": "This method indicates whether the current browser is Java-enabled or not."
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.navigator",
			"!doc": "Returns a reference to the navigator object, which can be queried for information about the application running the script."
		},
		history: {
			state: {
				"!type": "?",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Manipulating_the_browser_history",
				"!doc": "The DOM window object provides access to the browser's history through the history object. It exposes useful methods and properties that let you move back and forth through the user's history, as well as -- starting with HTML5 -- manipulate the contents of the history stack."
			},
			length: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Manipulating_the_browser_history",
				"!doc": "The DOM window object provides access to the browser's history through the history object. It exposes useful methods and properties that let you move back and forth through the user's history, as well as -- starting with HTML5 -- manipulate the contents of the history stack."
			},
			go: {
				"!type": "fn(delta: number)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.history",
				"!doc": "Returns a reference to the History object, which provides an interface for manipulating the browser session history (pages visited in the tab or frame that the current page is loaded in)."
			},
			forward: {
				"!type": "fn()",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Manipulating_the_browser_history",
				"!doc": "The DOM window object provides access to the browser's history through the history object. It exposes useful methods and properties that let you move back and forth through the user's history, as well as -- starting with HTML5 -- manipulate the contents of the history stack."
			},
			back: {
				"!type": "fn()",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Manipulating_the_browser_history",
				"!doc": "The DOM window object provides access to the browser's history through the history object. It exposes useful methods and properties that let you move back and forth through the user's history, as well as -- starting with HTML5 -- manipulate the contents of the history stack."
			},
			pushState: {
				"!type": "fn(data: ?, title: string, url?: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Manipulating_the_browser_history",
				"!doc": "The DOM window object provides access to the browser's history through the history object. It exposes useful methods and properties that let you move back and forth through the user's history, as well as -- starting with HTML5 -- manipulate the contents of the history stack."
			},
			replaceState: {
				"!type": "fn(data: ?, title: string, url?: string)",
				"!url": "https://developer.mozilla.org/en/docs/DOM/Manipulating_the_browser_history",
				"!doc": "The DOM window object provides access to the browser's history through the history object. It exposes useful methods and properties that let you move back and forth through the user's history, as well as -- starting with HTML5 -- manipulate the contents of the history stack."
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/Manipulating_the_browser_history",
			"!doc": "The DOM window object provides access to the browser's history through the history object. It exposes useful methods and properties that let you move back and forth through the user's history, as well as -- starting with HTML5 -- manipulate the contents of the history stack."
		},
		screen: {
			availWidth: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.availWidth",
				"!doc": "Returns the amount of horizontal space in pixels available to the window."
			},
			availHeight: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.availHeight",
				"!doc": "Returns the amount of vertical space available to the window on the screen."
			},
			availTop: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.availTop",
				"!doc": "Specifies the y-coordinate of the first pixel that is not allocated to permanent or semipermanent user interface features."
			},
			availLeft: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.availLeft",
				"!doc": "Returns the first available pixel available from the left side of the screen."
			},
			pixelDepth: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.pixelDepth",
				"!doc": "Returns the bit depth of the screen."
			},
			colorDepth: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.colorDepth",
				"!doc": "Returns the color depth of the screen."
			},
			width: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.width",
				"!doc": "Returns the width of the screen."
			},
			height: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen.height",
				"!doc": "Returns the height of the screen in pixels."
			},
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.screen",
			"!doc": "Returns a reference to the screen object associated with the window."
		},
		postMessage: {
			"!type": "fn(message: string, targetOrigin: string)",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.postMessage",
			"!doc": "window.postMessage, when called, causes a MessageEvent to be dispatched at the target window when any pending script that must be executed completes (e.g. remaining event handlers if window.postMessage is called from an event handler, previously-set pending timeouts, etc.). The MessageEvent has the type message, a data property which is set to the value of the first argument provided to window.postMessage, an origin property corresponding to the origin of the main document in the window calling window.postMessage at the time window.postMessage was called, and a source property which is the window from which window.postMessage is called. (Other standard properties of events are present with their expected values.)"
		},
		close: {
			"!type": "fn()",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.close",
			"!doc": "Closes the current window, or a referenced window."
		},
		blur: {
			"!type": "fn()",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.blur",
			"!doc": "The blur method removes keyboard focus from the current element."
		},
		focus: {
			"!type": "fn()",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.focus",
			"!doc": "Sets focus on the specified element, if it can be focused."
		},
		onload: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onload",
			"!doc": "An event handler for the load event of a window."
		},
		onunload: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onunload",
			"!doc": "The unload event is raised when the window is unloading its content and resources. The resources removal is processed after the unload event occurs."
		},
		onscroll: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onscroll",
			"!doc": "Specifies the function to be called when the window is scrolled."
		},
		onresize: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onresize",
			"!doc": "An event handler for the resize event on the window."
		},
		ononline: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/document.ononline",
			"!doc": '"online" event is fired when the browser switches between online and offline mode.'
		},
		onoffline: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/Online_and_offline_events",
			"!doc": "Some browsers implement Online/Offline events from the WHATWG Web Applications 1.0 specification."
		},
		onmousewheel: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/DOM_event_reference/mousewheel",
			"!doc": "The DOM mousewheel event is fired asynchronously when mouse wheel or similar device is operated. It's represented by the MouseWheelEvent interface."
		},
		onmouseup: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onmouseup",
			"!doc": "An event handler for the mouseup event on the window."
		},
		onmouseover: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.onmouseover",
			"!doc": "The onmouseover property returns the onMouseOver event handler code on the current element."
		},
		onmouseout: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.onmouseout",
			"!doc": "The onmouseout property returns the onMouseOut event handler code on the current element."
		},
		onmousemove: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.onmousemove",
			"!doc": "The onmousemove property returns the mousemove event handler code on the current element."
		},
		onmousedown: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onmousedown",
			"!doc": "An event handler for the mousedown event on the window."
		},
		onclick: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.onclick",
			"!doc": "The onclick property returns the onClick event handler code on the current element."
		},
		ondblclick: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.ondblclick",
			"!doc": "The ondblclick property returns the onDblClick event handler code on the current element."
		},
		onmessage: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/Worker",
			"!doc": "Dedicated Web Workers provide a simple means for web content to run scripts in background threads.  Once created, a worker can send messages to the spawning task by posting messages to an event handler specified by the creator."
		},
		onkeyup: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.onkeyup",
			"!doc": "The onkeyup property returns the onKeyUp event handler code for the current element."
		},
		onkeypress: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.onkeypress",
			"!doc": "The onkeypress property sets and returns the onKeyPress event handler code for the current element."
		},
		onkeydown: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onkeydown",
			"!doc": "An event handler for the keydown event on the window."
		},
		oninput: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/DOM_event_reference/input",
			"!doc": "The DOM input event is fired synchronously when the value of an <input> or <textarea> element is changed. Additionally, it's also fired on contenteditable editors when its contents are changed. In this case, the event target is the editing host element. If there are two or more elements which have contenteditable as true, \"editing host\" is the nearest ancestor element whose parent isn't editable. Similarly, it's also fired on root element of designMode editors."
		},
		onpopstate: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onpopstate",
			"!doc": "An event handler for the popstate event on the window."
		},
		onhashchange: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onhashchange",
			"!doc": "The hashchange event fires when a window's hash changes."
		},
		onfocus: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.onfocus",
			"!doc": "The onfocus property returns the onFocus event handler code on the current element."
		},
		onblur: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.onblur",
			"!doc": "The onblur property returns the onBlur event handler code, if any, that exists on the current element."
		},
		onerror: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onerror",
			"!doc": "An event handler for runtime script errors."
		},
		ondrop: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/drop",
			"!doc": "The drop event is fired when an element or text selection is dropped on a valid drop target."
		},
		ondragstart: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/dragstart",
			"!doc": "The dragstart event is fired when the user starts dragging an element or text selection."
		},
		ondragover: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/dragover",
			"!doc": "The dragover event is fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds)."
		},
		ondragleave: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/dragleave",
			"!doc": "The dragleave event is fired when a dragged element or text selection leaves a valid drop target."
		},
		ondragenter: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/dragenter",
			"!doc": "The dragenter event is fired when a dragged element or text selection enters a valid drop target."
		},
		ondragend: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/dragend",
			"!doc": "The dragend event is fired when a drag operation is being ended (by releasing a mouse button or hitting the escape key)."
		},
		ondrag: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/drag",
			"!doc": "The drag event is fired when an element or text selection is being dragged (every few hundred milliseconds)."
		},
		oncontextmenu: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.oncontextmenu",
			"!doc": 'An event handler property for right-click events on the window. Unless the default behavior is prevented, the browser context menu will activate (though IE8 has a bug with this and will not activate the context menu if a contextmenu event handler is defined). Note that this event will occur with any non-disabled right-click event and does not depend on an element possessing the "contextmenu" attribute.'
		},
		onchange: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/element.onchange",
			"!doc": "The onchange property sets and returns the onChange event handler code for the current element."
		},
		onbeforeunload: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onbeforeunload",
			"!doc": "An event that fires when a window is about to unload its resources. The document is still visible and the event is still cancelable."
		},
		onabort: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.onabort",
			"!doc": "An event handler for abort events sent to the window."
		},
		getSelection: {
			"!type": "fn() -> +Selection",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.getSelection",
			"!doc": "Returns a selection object representing the range of text selected by the user. "
		},
		alert: {
			"!type": "fn(message: string)",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.alert",
			"!doc": "Display an alert dialog with the specified content and an OK button."
		},
		confirm: {
			"!type": "fn(message: string) -> bool",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.confirm",
			"!doc": "Displays a modal dialog with a message and two buttons, OK and Cancel."
		},
		prompt: {
			"!type": "fn(message: string, value: string) -> string",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.prompt",
			"!doc": "Displays a dialog with a message prompting the user to input some text."
		},
		scrollBy: {
			"!type": "fn(x: number, y: number)",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.scrollBy",
			"!doc": "Scrolls the document in the window by the given amount."
		},
		scrollTo: {
			"!type": "fn(x: number, y: number)",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.scrollTo",
			"!doc": "Scrolls to a particular set of coordinates in the document."
		},
		scroll: {
			"!type": "fn(x: number, y: number)",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.scroll",
			"!doc": "Scrolls the window to a particular place in the document."
		},
		setTimeout: {
			"!type": "fn(f: fn(), ms: number) -> number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.setTimeout",
			"!doc": "Calls a function or executes a code snippet after specified delay."
		},
		clearTimeout: {
			"!type": "fn(timeout: number)",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.clearTimeout",
			"!doc": "Clears the delay set by window.setTimeout()."
		},
		setInterval: {
			"!type": "fn(f: fn(), ms: number) -> number",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.setInterval",
			"!doc": "Calls a function or executes a code snippet repeatedly, with a fixed time delay between each call to that function."
		},
		clearInterval: {
			"!type": "fn(interval: number)",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.clearInterval",
			"!doc": "Cancels repeated action which was set up using setInterval."
		},
		atob: {
			"!type": "fn(encoded: string) -> string",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.atob",
			"!doc": "Decodes a string of data which has been encoded using base-64 encoding."
		},
		btoa: {
			"!type": "fn(data: string) -> string",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.btoa",
			"!doc": "Creates a base-64 encoded ASCII string from a string of binary data."
		},
		addEventListener: {
			"!type": "fn(type: string, listener: fn(e: +Event), capture: bool)",
			"!url": "https://developer.mozilla.org/en/docs/DOM/EventTarget.addEventListener",
			"!doc": "Registers a single event listener on a single target. The event target may be a single element in a document, the document itself, a window, or an XMLHttpRequest."
		},
		removeEventListener: {
			"!type": "fn(type: string, listener: fn(), capture: bool)",
			"!url": "https://developer.mozilla.org/en/docs/DOM/EventTarget.removeEventListener",
			"!doc": "Allows the removal of event listeners from the event target."
		},
		dispatchEvent: {
			"!type": "fn(event: +Event) -> bool",
			"!url": "https://developer.mozilla.org/en/docs/DOM/EventTarget.dispatchEvent",
			"!doc": "Dispatches an event into the event system. The event is subject to the same capturing and bubbling behavior as directly dispatched events."
		},
		getComputedStyle: {
			"!type": "fn(node: +Element, pseudo?: string) -> Element.prototype.style",
			"!url": "https://developer.mozilla.org/en/docs/DOM/window.getComputedStyle",
			"!doc": "Gives the final used values of all the CSS properties of an element."
		},
		CanvasRenderingContext2D: {
			canvas: "+Element",
			width: "number",
			height: "number",
			commit: "fn()",
			save: "fn()",
			restore: "fn()",
			currentTransform: "?",
			scale: "fn(x: number, y: number)",
			rotate: "fn(angle: number)",
			translate: "fn(x: number, y: number)",
			transform: "fn(a: number, b: number, c: number, d: number, e: number, f: number)",
			setTransform: "fn(a: number, b: number, c: number, d: number, e: number, f: number)",
			resetTransform: "fn()",
			globalAlpha: "number",
			globalCompositeOperation: "string",
			imageSmoothingEnabled: "bool",
			strokeStyle: "string",
			fillStyle: "string",
			createLinearGradient: "fn(x0: number, y0: number, x1: number, y1: number) -> ?",
			createPattern: "fn(image: ?, repetition: string) -> ?",
			shadowOffsetX: "number",
			shadowOffsetY: "number",
			shadowBlur: "number",
			shadowColor: "string",
			clearRect: "fn(x: number, y: number, w: number, h: number)",
			fillRect: "fn(x: number, y: number, w: number, h: number)",
			strokeRect: "fn(x: number, y: number, w: number, h: number)",
			fillRule: "string",
			fill: "fn()",
			beginPath: "fn()",
			stroke: "fn()",
			clip: "fn()",
			resetClip: "fn()",
			fillText: "fn(text: string, x: number, y: number, maxWidth: number)",
			strokeText: "fn(text: string, x: number, y: number, maxWidth: number)",
			measureText: "fn(text: string) -> ?",
			drawImage: "fn(image: ?, dx: number, dy: number)",
			createImageData: "fn(sw: number, sh: number) -> ?",
			getImageData: "fn(sx: number, sy: number, sw: number, sh: number) -> ?",
			putImageData: "fn(imagedata: ?, dx: number, dy: number)",
			lineWidth: "number",
			lineCap: "string",
			lineJoin: "string",
			miterLimit: "number",
			setLineDash: "fn(segments: [number])",
			getLineDash: "fn() -> [number]",
			lineDashOffset: "number",
			font: "string",
			textAlign: "string",
			textBaseline: "string",
			direction: "string",
			closePath: "fn()",
			moveTo: "fn(x: number, y: number)",
			lineTo: "fn(x: number, y: number)",
			quadraticCurveTo: "fn(cpx: number, cpy: number, x: number, y: number)",
			bezierCurveTo: "fn(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number)",
			arcTo: "fn(x1: number, y1: number, x2: number, y2: number, radius: number)",
			rect: "fn(x: number, y: number, w: number, h: number)",
			arc: "fn(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: bool)",
			ellipse: "fn(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise: bool)"
		}
	},
	window.ecma5 = {
		"!name": "ecma5",
		"!define": {
			"Error.prototype": "Error.prototype"
		},
		Infinity: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Infinity",
			"!doc": "A numeric value representing infinity."
		},
		undefined: {
			"!type": "?",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/undefined",
			"!doc": "The value undefined."
		},
		NaN: {
			"!type": "number",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/NaN",
			"!doc": "A value representing Not-A-Number."
		},
		Object: {
			"!type": "fn()",
			getPrototypeOf: {
				"!type": "fn(obj: ?) -> ?",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/getPrototypeOf",
				"!doc": "Returns the prototype (i.e. the internal prototype) of the specified object."
			},
			create: {
				"!type": "fn(proto: ?) -> !custom:Object_create",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create",
				"!doc": "Creates a new object with the specified prototype object and properties."
			},
			defineProperty: {
				"!type": "fn(obj: ?, prop: string, desc: ?) -> !custom:Object_defineProperty",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty",
				"!doc": "Defines a new property directly on an object, or modifies an existing property on an object, and returns the object. If you want to see how to use the Object.defineProperty method with a binary-flags-like syntax, see this article."
			},
			defineProperties: {
				"!type": "fn(obj: ?, props: ?) -> !custom:Object_defineProperties",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty",
				"!doc": "Defines a new property directly on an object, or modifies an existing property on an object, and returns the object. If you want to see how to use the Object.defineProperty method with a binary-flags-like syntax, see this article."
			},
			getOwnPropertyDescriptor: {
				"!type": "fn(obj: ?, prop: string) -> ?",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor",
				"!doc": "Returns a property descriptor for an own property (that is, one directly present on an object, not present by dint of being along an object's prototype chain) of a given object."
			},
			keys: {
				"!type": "fn(obj: ?) -> [string]",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys",
				"!doc": "Returns an array of a given object's own enumerable properties, in the same order as that provided by a for-in loop (the difference being that a for-in loop enumerates properties in the prototype chain as well)."
			},
			getOwnPropertyNames: {
				"!type": "fn(obj: ?) -> [string]",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames",
				"!doc": "Returns an array of all properties (enumerable or not) found directly upon a given object."
			},
			seal: {
				"!type": "fn(obj: ?)",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/seal",
				"!doc": "Seals an object, preventing new properties from being added to it and marking all existing properties as non-configurable. Values of present properties can still be changed as long as they are writable."
			},
			isSealed: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/isSealed",
				"!doc": "Determine if an object is sealed."
			},
			freeze: {
				"!type": "fn(obj: ?) -> !0",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/freeze",
				"!doc": "Freezes an object: that is, prevents new properties from being added to it; prevents existing properties from being removed; and prevents existing properties, or their enumerability, configurability, or writability, from being changed. In essence the object is made effectively immutable. The method returns the object being frozen."
			},
			isFrozen: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/isFrozen",
				"!doc": "Determine if an object is frozen."
			},
			preventExtensions: {
				"!type": "fn(obj: ?)",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions",
				"!doc": "Prevents new properties from ever being added to an object."
			},
			isExtensible: {
				"!type": "fn(obj: ?) -> bool",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible",
				"!doc": "The Object.isExtensible() method determines if an object is extensible (whether it can have new properties added to it)."
			},
			prototype: {
				"!stdProto": "Object",
				toString: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/toString",
					"!doc": "Returns a string representing the object."
				},
				toLocaleString: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/toLocaleString",
					"!doc": "Returns a string representing the object. This method is meant to be overriden by derived objects for locale-specific purposes."
				},
				valueOf: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/valueOf",
					"!doc": "Returns the primitive value of the specified object"
				},
				hasOwnProperty: {
					"!type": "fn(prop: string) -> bool",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/hasOwnProperty",
					"!doc": "Returns a boolean indicating whether the object has the specified property."
				},
				propertyIsEnumerable: {
					"!type": "fn(prop: string) -> bool",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable",
					"!doc": "Returns a Boolean indicating whether the specified property is enumerable."
				},
				isPrototypeOf: {
					"!type": "fn(obj: ?) -> bool",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isPrototypeOf",
					"!doc": "Tests for an object in another object's prototype chain."
				}
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object",
			"!doc": "Creates an object wrapper."
		},
		Function: {
			"!type": "fn(body: string) -> fn()",
			prototype: {
				"!stdProto": "Function",
				apply: {
					"!type": "fn(this: ?, args: [?])",
					"!effects": ["call and return !this this=!0 !1.<i> !1.<i> !1.<i>"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/apply",
					"!doc": "Calls a function with a given this value and arguments provided as an array (or an array like object)."
				},
				call: {
					"!type": "fn(this: ?, args?: ?) -> !this.!ret",
					"!effects": ["call and return !this this=!0 !1 !2 !3 !4"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/call",
					"!doc": "Calls a function with a given this value and arguments provided individually."
				},
				bind: {
					"!type": "fn(this: ?, args?: ?) -> !custom:Function_bind",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind",
					"!doc": "Creates a new function that, when called, has its this keyword set to the provided value, with a given sequence of arguments preceding any provided when the new function was called."
				},
				prototype: "?"
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function",
			"!doc": "Every function in JavaScript is actually a Function object."
		},
		Array: {
			"!type": "fn(size: number) -> !custom:Array_ctor",
			isArray: {
				"!type": "fn(value: ?) -> bool",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/isArray",
				"!doc": "Returns true if an object is an array, false if it is not."
			},
			prototype: {
				"!stdProto": "Array",
				length: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/length",
					"!doc": "An unsigned, 32-bit integer that specifies the number of elements in an array."
				},
				concat: {
					"!type": "fn(other: [?]) -> !this",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/concat",
					"!doc": "Returns a new array comprised of this array joined with other array(s) and/or value(s)."
				},
				join: {
					"!type": "fn(separator?: string) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/join",
					"!doc": "Joins all elements of an array into a string."
				},
				splice: {
					"!type": "fn(pos: number, amount: number)",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/splice",
					"!doc": "Changes the content of an array, adding new elements while removing old elements."
				},
				pop: {
					"!type": "fn() -> !this.<i>",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/pop",
					"!doc": "Removes the last element from an array and returns that element."
				},
				push: {
					"!type": "fn(newelt: ?) -> number",
					"!effects": ["propagate !0 !this.<i>"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/push",
					"!doc": "Mutates an array by appending the given elements and returning the new length of the array."
				},
				shift: {
					"!type": "fn() -> !this.<i>",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/shift",
					"!doc": "Removes the first element from an array and returns that element. This method changes the length of the array."
				},
				unshift: {
					"!type": "fn(newelt: ?) -> number",
					"!effects": ["propagate !0 !this.<i>"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/unshift",
					"!doc": "Adds one or more elements to the beginning of an array and returns the new length of the array."
				},
				slice: {
					"!type": "fn(from: number, to?: number) -> !this",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/slice",
					"!doc": "Returns a shallow copy of a portion of an array."
				},
				reverse: {
					"!type": "fn()",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/reverse",
					"!doc": "Reverses an array in place.  The first array element becomes the last and the last becomes the first."
				},
				sort: {
					"!type": "fn(compare?: fn(a: ?, b: ?) -> number)",
					"!effects": ["call !0 !this.<i> !this.<i>"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/sort",
					"!doc": "Sorts the elements of an array in place and returns the array."
				},
				indexOf: {
					"!type": "fn(elt: ?, from?: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf",
					"!doc": "Returns the first index at which a given element can be found in the array, or -1 if it is not present."
				},
				lastIndexOf: {
					"!type": "fn(elt: ?, from?: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/lastIndexOf",
					"!doc": "Returns the last index at which a given element can be found in the array, or -1 if it is not present. The array is searched backwards, starting at fromIndex."
				},
				every: {
					"!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> bool",
					"!effects": ["call !0 this=!1 !this.<i> number"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/every",
					"!doc": "Tests whether all elements in the array pass the test implemented by the provided function."
				},
				some: {
					"!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> bool",
					"!effects": ["call !0 this=!1 !this.<i> number"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/some",
					"!doc": "Tests whether some element in the array passes the test implemented by the provided function."
				},
				filter: {
					"!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> !this",
					"!effects": ["call !0 this=!1 !this.<i> number"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter",
					"!doc": "Creates a new array with all elements that pass the test implemented by the provided function."
				},
				forEach: {
					"!type": "fn(f: fn(elt: ?, i: number), context?: ?)",
					"!effects": ["call !0 this=!1 !this.<i> number"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach",
					"!doc": "Executes a provided function once per array element."
				},
				map: {
					"!type": "fn(f: fn(elt: ?, i: number) -> ?, context?: ?) -> [!0.!ret]",
					"!effects": ["call !0 this=!1 !this.<i> number"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map",
					"!doc": "Creates a new array with the results of calling a provided function on every element in this array."
				},
				reduce: {
					"!type": "fn(combine: fn(sum: ?, elt: ?, i: number) -> ?, init?: ?) -> !0.!ret",
					"!effects": ["call !0 !1 !this.<i> number"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/Reduce",
					"!doc": "Apply a function against an accumulator and each value of the array (from left-to-right) as to reduce it to a single value."
				},
				reduceRight: {
					"!type": "fn(combine: fn(sum: ?, elt: ?, i: number) -> ?, init?: ?) -> !0.!ret",
					"!effects": ["call !0 !1 !this.<i> number"],
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/ReduceRight",
					"!doc": "Apply a function simultaneously against two values of the array (from right-to-left) as to reduce it to a single value."
				}
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array",
			"!doc": "The JavaScript Array global object is a constructor for arrays, which are high-level, list-like objects."
		},
		String: {
			"!type": "fn(value: ?) -> string",
			fromCharCode: {
				"!type": "fn(code: number) -> string",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/fromCharCode",
				"!doc": "Returns a string created by using the specified sequence of Unicode values."
			},
			prototype: {
				"!stdProto": "String",
				length: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/String/length",
					"!doc": "Represents the length of a string."
				},
				"<i>": "string",
				charAt: {
					"!type": "fn(i: number) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/charAt",
					"!doc": "Returns the specified character from a string."
				},
				charCodeAt: {
					"!type": "fn(i: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/charCodeAt",
					"!doc": "Returns the numeric Unicode value of the character at the given index (except for unicode codepoints > 0x10000)."
				},
				indexOf: {
					"!type": "fn(char: string, from?: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/indexOf",
					"!doc": "Returns the index within the calling String object of the first occurrence of the specified value, starting the search at fromIndex,\nreturns -1 if the value is not found."
				},
				lastIndexOf: {
					"!type": "fn(char: string, from?: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/lastIndexOf",
					"!doc": "Returns the index within the calling String object of the last occurrence of the specified value, or -1 if not found. The calling string is searched backward, starting at fromIndex."
				},
				substring: {
					"!type": "fn(from: number, to?: number) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/substring",
					"!doc": "Returns a subset of a string between one index and another, or through the end of the string."
				},
				substr: {
					"!type": "fn(from: number, length?: number) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/substr",
					"!doc": "Returns the characters in a string beginning at the specified location through the specified number of characters."
				},
				slice: {
					"!type": "fn(from: number, to?: number) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/slice",
					"!doc": "Extracts a section of a string and returns a new string."
				},
				trim: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/Trim",
					"!doc": "Removes whitespace from both ends of the string."
				},
				toUpperCase: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toUpperCase",
					"!doc": "Returns the calling string value converted to uppercase."
				},
				toLowerCase: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toLowerCase",
					"!doc": "Returns the calling string value converted to lowercase."
				},
				toLocaleUpperCase: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase",
					"!doc": "Returns the calling string value converted to upper case, according to any locale-specific case mappings."
				},
				toLocaleLowerCase: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase",
					"!doc": "Returns the calling string value converted to lower case, according to any locale-specific case mappings."
				},
				split: {
					"!type": "fn(pattern: string) -> [string]",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/split",
					"!doc": "Splits a String object into an array of strings by separating the string into substrings."
				},
				concat: {
					"!type": "fn(other: string) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/concat",
					"!doc": "Combines the text of two or more strings and returns a new string."
				},
				localeCompare: {
					"!type": "fn(other: string) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/localeCompare",
					"!doc": "Returns a number indicating whether a reference string comes before or after or is the same as the given string in sort order."
				},
				match: {
					"!type": "fn(pattern: +RegExp) -> [string]",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/match",
					"!doc": "Used to retrieve the matches when matching a string against a regular expression."
				},
				replace: {
					"!type": "fn(pattern: string|+RegExp, replacement: string) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/replace",
					"!doc": "Returns a new string with some or all matches of a pattern replaced by a replacement.  The pattern can be a string or a RegExp, and the replacement can be a string or a function to be called for each match."
				},
				search: {
					"!type": "fn(pattern: +RegExp) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/search",
					"!doc": "Executes the search for a match between a regular expression and this String object."
				}
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String",
			"!doc": "The String global object is a constructor for strings, or a sequence of characters."
		},
		Number: {
			"!type": "fn(value: ?) -> number",
			MAX_VALUE: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/MAX_VALUE",
				"!doc": "The maximum numeric value representable in JavaScript."
			},
			MIN_VALUE: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/MIN_VALUE",
				"!doc": "The smallest positive numeric value representable in JavaScript."
			},
			POSITIVE_INFINITY: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/POSITIVE_INFINITY",
				"!doc": "A value representing the positive Infinity value."
			},
			NEGATIVE_INFINITY: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/NEGATIVE_INFINITY",
				"!doc": "A value representing the negative Infinity value."
			},
			prototype: {
				"!stdProto": "Number",
				toString: {
					"!type": "fn(radix?: number) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toString",
					"!doc": "Returns a string representing the specified Number object"
				},
				toFixed: {
					"!type": "fn(digits: number) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed",
					"!doc": "Formats a number using fixed-point notation"
				},
				toExponential: {
					"!type": "fn(digits: number) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toExponential",
					"!doc": "Returns a string representing the Number object in exponential notation"
				},
				toPrecision: {
					"!type": "fn(digits: number) -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toPrecision",
					"!doc": "The toPrecision() method returns a string representing the number to the specified precision."
				}
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number",
			"!doc": "The Number JavaScript object is a wrapper object allowing you to work with numerical values. A Number object is created using the Number() constructor."
		},
		Boolean: {
			"!type": "fn(value: ?) -> bool",
			prototype: {
				"!stdProto": "Boolean"
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Boolean",
			"!doc": "The Boolean object is an object wrapper for a boolean value."
		},
		RegExp: {
			"!type": "fn(source: string, flags?: string)",
			prototype: {
				"!stdProto": "RegExp",
				exec: {
					"!type": "fn(input: string) -> [string]",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec",
					"!doc": "Executes a search for a match in a specified string. Returns a result array, or null."
				},
				test: {
					"!type": "fn(input: string) -> bool",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/test",
					"!doc": "Executes the search for a match between a regular expression and a specified string. Returns true or false."
				},
				global: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp",
					"!doc": "Creates a regular expression object for matching text with a pattern."
				},
				ignoreCase: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp",
					"!doc": "Creates a regular expression object for matching text with a pattern."
				},
				multiline: {
					"!type": "bool",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/multiline",
					"!doc": "Reflects whether or not to search in strings across multiple lines.\n"
				},
				source: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/source",
					"!doc": "A read-only property that contains the text of the pattern, excluding the forward slashes.\n"
				},
				lastIndex: {
					"!type": "number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/lastIndex",
					"!doc": "A read/write integer property that specifies the index at which to start the next match."
				}
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp",
			"!doc": "Creates a regular expression object for matching text with a pattern."
		},
		Date: {
			"!type": "fn(ms: number)",
			parse: {
				"!type": "fn(source: string) -> +Date",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/parse",
				"!doc": "Parses a string representation of a date, and returns the number of milliseconds since January 1, 1970, 00:00:00 UTC."
			},
			UTC: {
				"!type": "fn(year: number, month: number, date: number, hour?: number, min?: number, sec?: number, ms?: number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/UTC",
				"!doc": "Accepts the same parameters as the longest form of the constructor, and returns the number of milliseconds in a Date object since January 1, 1970, 00:00:00, universal time."
			},
			now: {
				"!type": "fn() -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/now",
				"!doc": "Returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC."
			},
			prototype: {
				toUTCString: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toUTCString",
					"!doc": "Converts a date to a string, using the universal time convention."
				},
				toISOString: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toISOString",
					"!doc": "JavaScript provides a direct way to convert a date object into a string in ISO format, the ISO 8601 Extended Format."
				},
				toDateString: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toDateString",
					"!doc": "Returns the date portion of a Date object in human readable form in American English."
				},
				toTimeString: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toTimeString",
					"!doc": "Returns the time portion of a Date object in human readable form in American English."
				},
				toLocaleDateString: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toLocaleDateString",
					"!doc": "Converts a date to a string, returning the \"date\" portion using the operating system's locale's conventions.\n"
				},
				toLocaleTimeString: {
					"!type": "fn() -> string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString",
					"!doc": 'Converts a date to a string, returning the "time" portion using the current locale\'s conventions.'
				},
				getTime: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTime",
					"!doc": "Returns the numeric value corresponding to the time for the specified date according to universal time."
				},
				getFullYear: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getFullYear",
					"!doc": "Returns the year of the specified date according to local time."
				},
				getYear: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getYear",
					"!doc": "Returns the year in the specified date according to local time."
				},
				getMonth: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getMonth",
					"!doc": "Returns the month in the specified date according to local time."
				},
				getUTCMonth: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCMonth",
					"!doc": "Returns the month of the specified date according to universal time.\n"
				},
				getDate: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getDate",
					"!doc": "Returns the day of the month for the specified date according to local time."
				},
				getUTCDate: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCDate",
					"!doc": "Returns the day (date) of the month in the specified date according to universal time.\n"
				},
				getDay: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getDay",
					"!doc": "Returns the day of the week for the specified date according to local time."
				},
				getUTCDay: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCDay",
					"!doc": "Returns the day of the week in the specified date according to universal time.\n"
				},
				getHours: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getHours",
					"!doc": "Returns the hour for the specified date according to local time."
				},
				getUTCHours: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCHours",
					"!doc": "Returns the hours in the specified date according to universal time.\n"
				},
				getMinutes: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getMinutes",
					"!doc": "Returns the minutes in the specified date according to local time."
				},
				getUTCMinutes: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date",
					"!doc": "Creates JavaScript Date instances which let you work with dates and times."
				},
				getSeconds: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getSeconds",
					"!doc": "Returns the seconds in the specified date according to local time."
				},
				getUTCSeconds: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCSeconds",
					"!doc": "Returns the seconds in the specified date according to universal time.\n"
				},
				getMilliseconds: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getMilliseconds",
					"!doc": "Returns the milliseconds in the specified date according to local time."
				},
				getUTCMilliseconds: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCMilliseconds",
					"!doc": "Returns the milliseconds in the specified date according to universal time.\n"
				},
				getTimezoneOffset: {
					"!type": "fn() -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset",
					"!doc": "Returns the time-zone offset from UTC, in minutes, for the current locale."
				},
				setTime: {
					"!type": "fn(date: +Date) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setTime",
					"!doc": "Sets the Date object to the time represented by a number of milliseconds since January 1, 1970, 00:00:00 UTC.\n"
				},
				setFullYear: {
					"!type": "fn(year: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setFullYear",
					"!doc": "Sets the full year for a specified date according to local time.\n"
				},
				setUTCFullYear: {
					"!type": "fn(year: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCFullYear",
					"!doc": "Sets the full year for a specified date according to universal time.\n"
				},
				setMonth: {
					"!type": "fn(month: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setMonth",
					"!doc": "Set the month for a specified date according to local time."
				},
				setUTCMonth: {
					"!type": "fn(month: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCMonth",
					"!doc": "Sets the month for a specified date according to universal time.\n"
				},
				setDate: {
					"!type": "fn(day: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setDate",
					"!doc": "Sets the day of the month for a specified date according to local time."
				},
				setUTCDate: {
					"!type": "fn(day: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCDate",
					"!doc": "Sets the day of the month for a specified date according to universal time.\n"
				},
				setHours: {
					"!type": "fn(hour: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setHours",
					"!doc": "Sets the hours for a specified date according to local time, and returns the number of milliseconds since 1 January 1970 00:00:00 UTC until the time represented by the updated Date instance."
				},
				setUTCHours: {
					"!type": "fn(hour: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCHours",
					"!doc": "Sets the hour for a specified date according to universal time.\n"
				},
				setMinutes: {
					"!type": "fn(min: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setMinutes",
					"!doc": "Sets the minutes for a specified date according to local time."
				},
				setUTCMinutes: {
					"!type": "fn(min: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCMinutes",
					"!doc": "Sets the minutes for a specified date according to universal time.\n"
				},
				setSeconds: {
					"!type": "fn(sec: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setSeconds",
					"!doc": "Sets the seconds for a specified date according to local time."
				},
				setUTCSeconds: {
					"!type": "fn(sec: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCSeconds",
					"!doc": "Sets the seconds for a specified date according to universal time.\n"
				},
				setMilliseconds: {
					"!type": "fn(ms: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setMilliseconds",
					"!doc": "Sets the milliseconds for a specified date according to local time.\n"
				},
				setUTCMilliseconds: {
					"!type": "fn(ms: number) -> number",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCMilliseconds",
					"!doc": "Sets the milliseconds for a specified date according to universal time.\n"
				}
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date",
			"!doc": "Creates JavaScript Date instances which let you work with dates and times."
		},
		Error: {
			"!type": "fn(message: string)",
			prototype: {
				name: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error/name",
					"!doc": "A name for the type of error."
				},
				message: {
					"!type": "string",
					"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error/message",
					"!doc": "A human-readable description of the error."
				}
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error",
			"!doc": "Creates an error object."
		},
		SyntaxError: {
			"!type": "fn(message: string)",
			prototype: "Error.prototype",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/SyntaxError",
			"!doc": "Represents an error when trying to interpret syntactically invalid code."
		},
		ReferenceError: {
			"!type": "fn(message: string)",
			prototype: "Error.prototype",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/ReferenceError",
			"!doc": "Represents an error when a non-existent variable is referenced."
		},
		URIError: {
			"!type": "fn(message: string)",
			prototype: "Error.prototype",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/URIError",
			"!doc": "Represents an error when a malformed URI is encountered."
		},
		EvalError: {
			"!type": "fn(message: string)",
			prototype: "Error.prototype",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/EvalError",
			"!doc": "Represents an error regarding the eval function."
		},
		RangeError: {
			"!type": "fn(message: string)",
			prototype: "Error.prototype",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RangeError",
			"!doc": "Represents an error when a number is not within the correct range allowed."
		},
		TypeError: {
			"!type": "fn(message: string)",
			prototype: "Error.prototype",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/TypeError",
			"!doc": "Represents an error an error when a value is not of the expected type."
		},
		parseInt: {
			"!type": "fn(string: string, radix?: number) -> number",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/parseInt",
			"!doc": "Parses a string argument and returns an integer of the specified radix or base."
		},
		parseFloat: {
			"!type": "fn(string: string) -> number",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/parseFloat",
			"!doc": "Parses a string argument and returns a floating point number."
		},
		isNaN: {
			"!type": "fn(value: number) -> bool",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/isNaN",
			"!doc": "Determines whether a value is NaN or not. Be careful, this function is broken. You may be interested in ECMAScript 6 Number.isNaN."
		},
		isFinite: {
			"!type": "fn(value: number) -> bool",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/isFinite",
			"!doc": "Determines whether the passed value is a finite number."
		},
		eval: {
			"!type": "fn(code: string) -> ?",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/eval",
			"!doc": "Evaluates JavaScript code represented as a string."
		},
		encodeURI: {
			"!type": "fn(uri: string) -> string",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURI",
			"!doc": 'Encodes a Uniform Resource Identifier (URI) by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character (will only be four escape sequences for characters composed of two "surrogate" characters).'
		},
		encodeURIComponent: {
			"!type": "fn(uri: string) -> string",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent",
			"!doc": 'Encodes a Uniform Resource Identifier (URI) component by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character (will only be four escape sequences for characters composed of two "surrogate" characters).'
		},
		decodeURI: {
			"!type": "fn(uri: string) -> string",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/decodeURI",
			"!doc": "Decodes a Uniform Resource Identifier (URI) previously created by encodeURI or by a similar routine."
		},
		decodeURIComponent: {
			"!type": "fn(uri: string) -> string",
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/decodeURIComponent",
			"!doc": "Decodes a Uniform Resource Identifier (URI) component previously created by encodeURIComponent or by a similar routine."
		},
		Math: {
			E: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/E",
				"!doc": "The base of natural logarithms, e, approximately 2.718."
			},
			LN2: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LN2",
				"!doc": "The natural logarithm of 2, approximately 0.693."
			},
			LN10: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LN10",
				"!doc": "The natural logarithm of 10, approximately 2.302."
			},
			LOG2E: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LOG2E",
				"!doc": "The base 2 logarithm of E (approximately 1.442)."
			},
			LOG10E: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LOG10E",
				"!doc": "The base 10 logarithm of E (approximately 0.434)."
			},
			SQRT1_2: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/SQRT1_2",
				"!doc": "The square root of 1/2; equivalently, 1 over the square root of 2, approximately 0.707."
			},
			SQRT2: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/SQRT2",
				"!doc": "The square root of 2, approximately 1.414."
			},
			PI: {
				"!type": "number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/PI",
				"!doc": "The ratio of the circumference of a circle to its diameter, approximately 3.14159."
			},
			abs: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/abs",
				"!doc": "Returns the absolute value of a number."
			},
			cos: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/cos",
				"!doc": "Returns the cosine of a number."
			},
			sin: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/sin",
				"!doc": "Returns the sine of a number."
			},
			tan: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/tan",
				"!doc": "Returns the tangent of a number."
			},
			acos: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/acos",
				"!doc": "Returns the arccosine (in radians) of a number."
			},
			asin: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/asin",
				"!doc": "Returns the arcsine (in radians) of a number."
			},
			atan: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/atan",
				"!doc": "Returns the arctangent (in radians) of a number."
			},
			atan2: {
				"!type": "fn(y: number, x: number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/atan2",
				"!doc": "Returns the arctangent of the quotient of its arguments."
			},
			ceil: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/ceil",
				"!doc": "Returns the smallest integer greater than or equal to a number."
			},
			floor: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/floor",
				"!doc": "Returns the largest integer less than or equal to a number."
			},
			round: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/round",
				"!doc": "Returns the value of a number rounded to the nearest integer."
			},
			exp: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/exp",
				"!doc": "Returns Ex, where x is the argument, and E is Euler's constant, the base of the natural logarithms."
			},
			log: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/log",
				"!doc": "Returns the natural logarithm (base E) of a number."
			},
			sqrt: {
				"!type": "fn(number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/sqrt",
				"!doc": "Returns the square root of a number."
			},
			pow: {
				"!type": "fn(number, number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/pow",
				"!doc": "Returns base to the exponent power, that is, baseexponent."
			},
			max: {
				"!type": "fn(number, number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/max",
				"!doc": "Returns the largest of zero or more numbers."
			},
			min: {
				"!type": "fn(number, number) -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/min",
				"!doc": "Returns the smallest of zero or more numbers."
			},
			random: {
				"!type": "fn() -> number",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random",
				"!doc": "Returns a floating-point, pseudo-random number in the range [0, 1) that is, from 0 (inclusive) up to but not including 1 (exclusive), which you can then scale to your desired range."
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math",
			"!doc": "A built-in object that has properties and methods for mathematical constants and functions."
		},
		JSON: {
			parse: {
				"!type": "fn(json: string) -> ?",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/parse",
				"!doc": "Parse a string as JSON, optionally transforming the value produced by parsing."
			},
			stringify: {
				"!type": "fn(value: ?) -> string",
				"!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify",
				"!doc": "Convert a value to JSON, optionally replacing values if a replacer function is specified, or optionally including only the specified properties if a replacer array is specified."
			},
			"!url": "https://developer.mozilla.org/en-US/docs/JSON",
			"!doc": "JSON (JavaScript Object Notation) is a data-interchange format.  It closely resembles a subset of JavaScript syntax, although it is not a strict subset. (See JSON in the JavaScript Reference for full details.)  It is useful when writing any kind of JavaScript-based application, including websites and browser extensions.  For example, you might store user information in JSON format in a cookie, or you might store extension preferences in JSON in a string-valued browser preference."
		}
	},
	window.ecma6 = {
		"!name": "ecma6",
		"!define": {
			"Promise.prototype": {
				"catch": {
					"!doc": "The catch() method returns a Promise and deals with rejected cases only. It behaves the same as calling Promise.prototype.then(undefined, onRejected).",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch",
					"!type": "fn(onRejected: fn(reason: ?)) -> !this"
				},
				then: {
					"!doc": "The then() method returns a Promise. It takes two arguments, both are callback functions for the success and failure cases of the Promise.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then",
					"!type": "fn(onFulfilled: fn(value: ?), onRejected: fn(reason: ?)) -> !custom:Promise_then",
					"!effects": ["call !0 !this.value"]
				}
			},
			promiseReject: {
				"!type": "fn(reason: ?)"
			}
		},
		Array: {
			from: {
				"!type": "fn(arrayLike: [], mapFn?: fn(), thisArg?: ?) -> !custom:Array_ctor",
				"!doc": "The Array.from() method creates a new Array instance from an array-like or iterable object.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from"
			},
			of: {
				"!type": "fn(elementN: ?) -> !custom:Array_ctor",
				"!doc": "The Array.of() method creates a new Array instance with a variable number of arguments, regardless of number or type of the arguments.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of"
			},
			prototype: {
				copyWithin: {
					"!type": "fn(target: number, start: number, end?: number) -> !custom:Array_ctor",
					"!doc": "The copyWithin() method copies the sequence of array elements within the array to the position starting at target. The copy is taken from the index positions of the second and third arguments start and end. The end argument is optional and defaults to the length of the array.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin"
				},
				entries: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The entries() method returns a new Array Iterator object that contains the key/value pairs for each index in the array.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/entries"
				},
				fill: {
					"!type": "fn(value: ?, start?: number, end?: number)",
					"!doc": "The fill() method fills all the elements of an array from a start index to an end index with a static value.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill"
				},
				find: {
					"!type": "fn(callback: fn(element: ?, index: number, array: []), thisArg?: ?) -> ?",
					"!doc": "The find() method returns a value in the array, if an element in the array satisfies the provided testing function. Otherwise undefined is returned.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find"
				},
				findIndex: {
					"!type": "fn(callback: fn(element: ?, index: number, array: []), thisArg?: ?) -> number",
					"!doc": "The findIndex() method returns an index in the array, if an element in the array satisfies the provided testing function. Otherwise -1 is returned.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex"
				},
				keys: {
					"!type": "fn() -> !custom:Array_ctor",
					"!doc": "The keys() method returns a new Array Iterator that contains the keys for each index in the array.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys"
				},
				values: {
					"!type": "fn() -> !custom:Array_ctor",
					"!doc": "The values() method returns a new Array Iterator object that contains the values for each index in the array.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/values"
				}
			}
		},
		ArrayBuffer: {
			"!type": "fn(length: number)",
			"!doc": "The ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer. You can not directly manipulate the contents of an ArrayBuffer; instead, you create one of the typed array objects or a DataView object which represents the buffer in a specific format, and use that to read and write the contents of the buffer.",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer",
			isView: {
				"!type": "fn(arg: ?) -> bool",
				"!doc": "The ArrayBuffer.isView() method returns true if arg is a view one of the ArrayBuffer views, such as typed array objects or a DataView; false otherwise.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView"
			},
			transfer: {
				"!type": "fn(oldBuffer: ?, newByteLength: ?)",
				"!doc": "The static ArrayBuffer.transfer() method returns a new ArrayBuffer whose contents are taken from the oldBuffer's data and then is either truncated or zero-extended by newByteLength. If newByteLength is undefined, the byteLength of the oldBuffer is used. This operation leaves oldBuffer in a detached state.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer"
			},
			prototype: {
				byteLength: {
					"!type": "number",
					"!doc": "The byteLength accessor property represents the length of an ArrayBuffer in bytes.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/byteLength"
				},
				slice: {
					"!type": "fn(begin: number, end?: number) -> +ArrayBuffer",
					"!doc": "The slice() method returns a new ArrayBuffer whose contents are a copy of this ArrayBuffer's bytes from begin, inclusive, up to end, exclusive.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/slice"
				}
			}
		},
		DataView: {
			"!type": "fn(buffer: +ArrayBuffer, byteOffset?: number, byteLength?: number)",
			"!doc": "The DataView view provides a low-level interface for reading data from and writing it to an ArrayBuffer.",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView",
			prototype: {
				buffer: {
					"!type": "+ArrayBuffer",
					"!doc": "The buffer accessor property represents the ArrayBuffer referenced by the DataView at construction time.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/buffer"
				},
				byteLength: {
					"!type": "number",
					"!doc": "The byteLength accessor property represents the length (in bytes) of this view from the start of its ArrayBuffer.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/byteLength"
				},
				byteOffset: {
					"!type": "number",
					"!doc": "The byteOffset accessor property represents the offset (in bytes) of this view from the start of its ArrayBuffer.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/byteOffset"
				},
				getFloat32: {
					"!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
					"!doc": "The getFloat32() method gets a signed 32-bit integer (float) at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getFloat32"
				},
				getFloat64: {
					"!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
					"!doc": "The getFloat64() method gets a signed 64-bit float (double) at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getFloat64"
				},
				getInt16: {
					"!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
					"!doc": "The getInt16() method gets a signed 16-bit integer (short) at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt16"
				},
				getInt32: {
					"!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
					"!doc": "The getInt32() method gets a signed 32-bit integer (long) at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt32"
				},
				getInt8: {
					"!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
					"!doc": "The getInt8() method gets a signed 8-bit integer (byte) at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt8"
				},
				getUint16: {
					"!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
					"!doc": "The getUint16() method gets an unsigned 16-bit integer (unsigned short) at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint16"
				},
				getUint32: {
					"!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
					"!doc": "The getUint32() method gets an unsigned 32-bit integer (unsigned long) at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint32"
				},
				getUint8: {
					"!type": "fn(byteOffset: number) -> number",
					"!doc": "The getUint8() method gets an unsigned 8-bit integer (unsigned byte) at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint8"
				},
				setFloat32: {
					"!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
					"!doc": "The setFloat32() method stores a signed 32-bit integer (float) value at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setFloat32"
				},
				setFloat64: {
					"!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
					"!doc": "The setFloat64() method stores a signed 64-bit integer (double) value at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setFloat64"
				},
				setInt16: {
					"!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
					"!doc": "The setInt16() method stores a signed 16-bit integer (short) value at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt16"
				},
				setInt32: {
					"!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
					"!doc": "The setInt32() method stores a signed 32-bit integer (long) value at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt32"
				},
				setInt8: {
					"!type": "fn(byteOffset: number, value: number)",
					"!doc": "The setInt8() method stores a signed 8-bit integer (byte) value at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt8"
				},
				setUint16: {
					"!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
					"!doc": "The setUint16() method stores an unsigned 16-bit integer (unsigned short) value at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setUint16"
				},
				setUint32: {
					"!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
					"!doc": "The setUint32() method stores an unsigned 32-bit integer (unsigned long) value at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setUint32"
				},
				setUint8: {
					"!type": "fn(byteOffset: number, value: number)",
					"!doc": "The setUint8() method stores an unsigned 8-bit integer (byte) value at the specified byte offset from the start of the DataView.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setUint8"
				}
			}
		},
		Float32Array: {
			"!type": "fn(length: number)",
			"!doc": "The Float32Array typed array represents an array of 32-bit floating point numbers (corresponding to the C float data type) in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array",
			prototype: {
				"!proto": "TypedArray.prototype"
			},
			length: "TypedArray.length",
			BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
			name: "TypedArray.name",
			from: "TypedArray.from",
			of: "TypedArray.of"
		},
		Float64Array: {
			"!type": "fn(length: number)",
			"!doc": "The Float64Array typed array represents an array of 64-bit floating point numbers (corresponding to the C double data type) in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array",
			prototype: {
				"!proto": "TypedArray.prototype"
			},
			length: "TypedArray.length",
			BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
			name: "TypedArray.name",
			from: "TypedArray.from",
			of: "TypedArray.of"
		},
		Int16Array: {
			"!type": "fn(length: number)",
			"!doc": "The Int16Array typed array represents an array of twos-complement 16-bit signed integers in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array",
			prototype: {
				"!proto": "TypedArray.prototype"
			},
			length: "TypedArray.length",
			BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
			name: "TypedArray.name",
			from: "TypedArray.from",
			of: "TypedArray.of"
		},
		Int32Array: {
			"!type": "fn(length: number)",
			"!doc": "The Int32Array typed array represents an array of twos-complement 32-bit signed integers in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array",
			prototype: {
				"!proto": "TypedArray.prototype"
			},
			length: "TypedArray.length",
			BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
			name: "TypedArray.name",
			from: "TypedArray.from",
			of: "TypedArray.of"
		},
		Int8Array: {
			"!type": "fn(length: number)",
			"!doc": "The Int8Array typed array represents an array of twos-complement 8-bit signed integers. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array",
			prototype: {
				"!proto": "TypedArray.prototype"
			},
			length: "TypedArray.length",
			BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
			name: "TypedArray.name",
			from: "TypedArray.from",
			of: "TypedArray.of"
		},
		Map: {
			"!type": "fn(iterable?: [])",
			"!doc": "The Map object is a simple key/value map. Any value (both objects and primitive values) may be used as either a key or a value.",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
			prototype: {
				clear: {
					"!type": "fn()",
					"!doc": "The clear() method removes all elements from a Map object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear"
				},
				"delete": {
					"!type": "fn(key: ?)",
					"!doc": "The delete() method removes the specified element from a Map object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete"
				},
				entries: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The entries() method returns a new Iterator object that contains the [key, value] pairs for each element in the Map object in insertion order.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries"
				},
				forEach: {
					"!type": "fn(callback: fn(value: ?, key: ?, map: +Map), thisArg?: ?)",
					"!effects": ["call !0 this=!1 !this.<i> number !this"],
					"!doc": "The forEach() method executes a provided function once per each key/value pair in the Map object, in insertion order.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach"
				},
				get: {
					"!type": "fn(key: ?) -> !this.<i>",
					"!doc": "The get() method returns a specified element from a Map object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get"
				},
				has: {
					"!type": "fn(key: ?) -> bool",
					"!doc": "The has() method returns a boolean indicating whether an element with the specified key exists or not.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has"
				},
				keys: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The keys() method returns a new Iterator object that contains the keys for each element in the Map object in insertion order.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys"
				},
				set: {
					"!type": "fn(key: ?, value: ?) -> !this",
					"!doc": "The set() method adds a new element with a specified key and value to a Map object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set"
				},
				size: {
					"!type": "number",
					"!doc": "The size accessor property returns the number of elements in a Map object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size"
				},
				values: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The values() method returns a new Iterator object that contains the values for each element in the Map object in insertion order.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values"
				},
				"prototype[@@iterator]": {
					"!type": "fn()",
					"!doc": "The initial value of the @@iterator property is the same function object as the initial value of the entries property.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@iterator"
				}
			}
		},
		Math: {
			acosh: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.acosh() function returns the hyperbolic arc-cosine of a number, that is",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acosh"
			},
			asinh: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.asinh() function returns the hyperbolic arcsine of a number, that is",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/asinh"
			},
			atanh: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.atanh() function returns the hyperbolic arctangent of a number, that is",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atanh"
			},
			cbrt: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.cbrt() function returns the cube root of a number, that is",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cbrt"
			},
			clz32: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.clz32() function returns the number of leading zero bits in the 32-bit binary representation of a number.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32"
			},
			cosh: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.cosh() function returns the hyperbolic cosine of a number, that can be expressed using the constant e:",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cosh"
			},
			expm1: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.expm1() function returns ex - 1, where x is the argument, and e the base of the natural logarithms.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/expm1"
			},
			fround: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.fround() function returns the nearest single precision float representation of a number.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround"
			},
			hypot: {
				"!type": "fn(value: number) -> number",
				"!doc": "The Math.hypot() function returns the square root of the sum of squares of its arguments, that is",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot"
			},
			imul: {
				"!type": "fn(a: number, b: number) -> number",
				"!doc": "The Math.imul() function returns the result of the C-like 32-bit multiplication of the two parameters.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul"
			},
			log10: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.log10() function returns the base 10 logarithm of a number, that is",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log10"
			},
			log1p: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.log1p() function returns the natural logarithm (base e) of 1 + a number, that is",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log1p"
			},
			log2: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.log2() function returns the base 2 logarithm of a number, that is",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log2"
			},
			sign: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.sign() function returns the sign of a number, indicating whether the number is positive, negative or zero.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign"
			},
			sinh: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.sinh() function returns the hyperbolic sine of a number, that can be expressed using the constant e:",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sinh"
			},
			tanh: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.tanh() function returns the hyperbolic tangent of a number, that is",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tanh"
			},
			trunc: {
				"!type": "fn(x: number) -> number",
				"!doc": "The Math.trunc() function returns the integral part of a number by removing any fractional digits. It does not round any numbers. The function can be expressed with the floor() and ceil() function:",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc"
			}
		},
		Number: {
			EPSILON: {
				"!type": "number",
				"!doc": "The Number.EPSILON property represents the difference between one and the smallest value greater than one that can be represented as a Number.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON"
			},
			MAX_SAFE_INTEGER: {
				"!type": "number",
				"!doc": "The Number.MAX_SAFE_INTEGER constant represents the maximum safe integer in JavaScript (253 - 1).",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER"
			},
			MIN_SAFE_INTEGER: {
				"!type": "number",
				"!doc": "The Number.MIN_SAFE_INTEGER constant represents the minimum safe integer in JavaScript (-(253 - 1)).",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_SAFE_INTEGER"
			},
			isFinite: {
				"!type": "fn(testValue: ?) -> bool",
				"!doc": "The Number.isFinite() method determines whether the passed value is finite.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite"
			},
			isInteger: {
				"!type": "fn(testValue: ?) -> bool",
				"!doc": "The Number.isInteger() method determines whether the passed value is an integer.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger"
			},
			isNaN: {
				"!type": "fn(testValue: ?) -> bool",
				"!doc": "The Number.isNaN() method determines whether the passed value is NaN. More robust version of the original global isNaN().",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN"
			},
			isSafeInteger: {
				"!type": "fn(testValue: ?) -> bool",
				"!doc": "The Number.isSafeInteger() method determines whether the provided value is a number that is a safe integer. A safe integer is an integer that",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger"
			},
			parseFloat: {
				"!type": "fn(string: string) -> number",
				"!doc": "The Number.parseFloat() method parses a string argument and returns a floating point number. This method behaves identically to the global function parseFloat() and is part of ECMAScript 6 (its purpose is modularization of globals).",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat"
			},
			parseInt: {
				"!type": "fn(string: string, radix?: number) -> number",
				"!doc": "The Number.parseInt() method parses a string argument and returns an integer of the specified radix or base. This method behaves identically to the global function parseInt() and is part of ECMAScript 6 (its purpose is modularization of globals).",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseInt"
			}
		},
		Object: {
			assign: {
				"!type": "fn(target: ?, sources: ?) -> ?",
				"!doc": "The Object.assign() method is used to copy the values of all enumerable own properties from one or more source objects to a target object. It will return the target object.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign"
			},
			getOwnPropertySymbols: {
				"!type": "fn(obj: ?) -> [?]",
				"!doc": "The Object.getOwnPropertySymbols() method returns an array of all symbol properties found directly upon a given object.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols"
			},
			is: {
				"!type": "fn(value1: ?, value2: ?) -> bool",
				"!doc": "The Object.is() method determines whether two values are the same value.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is"
			},
			setPrototypeOf: {
				"!type": "fn(obj: ?, prototype: ?)",
				"!doc": "The Object.setPrototype() method sets the prototype (i.e., the internal [[Prototype]] property) of a specified object to another object or null.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf"
			}
		},
		Promise: {
			"!type": "fn(executor: fn(resolve: fn(value: ?), reject: promiseReject)) -> !custom:Promise_ctor",
			"!doc": "The Promise object is used for deferred and asynchronous computations. A Promise is in one of the three states:",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
			all: {
				"!type": "fn(iterable: [+Promise]) -> !0.<i>",
				"!doc": "The Promise.all(iterable) method returns a promise that resolves when all of the promises in the iterable argument have resolved.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all"
			},
			race: {
				"!type": "fn(iterable: [+Promise]) -> !0.<i>",
				"!doc": "The Promise.race(iterable) method returns a promise that resolves or rejects as soon as one of the promises in the iterable resolves or rejects, with the value or reason from that promise.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race"
			},
			reject: {
				"!type": "fn(reason: ?) -> !this",
				"!doc": "The Promise.reject(reason) method returns a Promise object that is rejected with the given reason.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject"
			},
			resolve: {
				"!type": "fn(value: ?) -> +Promise[value=!0]",
				"!doc": "The Promise.resolve(value) method returns a Promise object that is resolved with the given value. If the value is a thenable (i.e. has a then method), the returned promise will 'follow' that thenable, adopting its eventual state; otherwise the returned promise will be fulfilled with the value.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve"
			},
			prototype: "Promise.prototype"
		},
		Proxy: {
			"!type": "fn(target: ?, handler: ?)",
			"!doc": "The Proxy object is used to define the custom behavior in JavaScript fundamental operation (e.g. property lookup, assignment, enumeration, function invocation, etc).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy",
			revocable: {
				"!doc": "The Proxy.revocable() method is used to create a revocable Proxy object.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable"
			}
		},
		RegExp: {
			prototype: {
				flags: {
					"!type": "string",
					"!doc": "The flags property returns a string consisting of the flags of the current regular expression object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/flags"
				},
				sticky: {
					"!type": "bool",
					"!doc": "The sticky property reflects whether or not the search is sticky (searches in strings only from the index indicated by the lastIndex property of this regular expression). sticky is a read-only property of an individual regular expression object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky"
				}
			}
		},
		Set: {
			"!type": "fn(iterable: [?])",
			"!doc": "The Set object lets you store unique values of any type, whether primitive values or object references.",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set",
			length: {
				"!type": "number",
				"!doc": "The value of the length property is 1."
			},
			prototype: {
				add: {
					"!type": "fn(value: ?) -> !this",
					"!doc": "The add() method appends a new element with a specified�value to the end of a Set object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/add"
				},
				clear: {
					"!type": "fn()",
					"!doc": "The clear() method removes all elements from a Set object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/clear"
				},
				"delete": {
					"!type": "fn(value: ?) -> bool",
					"!doc": "The delete() method removes the specified element from a Set object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/delete"
				},
				entries: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The entries() method returns a new Iterator object that contains an array of [value, value] for each element in the Set object, in insertion order. For Set objects there is no key like in Map objects. However, to keep the API similar to the Map object, each entry has the same value for its key and value here, so that an array [value, value] is returned.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/entries"
				},
				forEach: {
					"!type": "fn(callback: fn(value: ?, value2: ?, set: +Set), thisArg?: ?)",
					"!effects": ["call !0 this=!1 !this.<i> number !this"]
				},
				has: {
					"!type": "fn(value: ?) -> bool",
					"!doc": "The has() method returns a boolean indicating whether an element with the specified value exists in a Set object or not.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/has"
				},
				keys: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The values() method returns a new Iterator object that contains the values for each element in the Set object in insertion order.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/keys"
				},
				size: {
					"!type": "number",
					"!doc": "The size accessor property returns the number of elements in a Set object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/size"
				},
				values: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The values() method returns a new Iterator object that contains the values for each element in the Set object in insertion order.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/values"
				},
				"prototype[@@iterator]": {
					"!type": "fn()",
					"!doc": "The initial value of the @@iterator property is the same function object as the initial value of the values property.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/@@iterator"
				}
			}
		},
		String: {
			fromCodePoint: {
				"!type": "fn(num1: ?) -> string",
				"!doc": "The static String.fromCodePoint() method returns a string created by using the specified sequence of code points.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint"
			},
			raw: {
				"!type": "fn(callSite: ?, substitutions: ?, templateString: ?) -> string",
				"!doc": "The static String.raw() method is a tag function of template strings, like the r prefix in Python or the @ prefix in C# for string literals, this function is used to get the raw string form of template strings.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw"
			},
			prototype: {
				codePointAt: {
					"!type": "fn(pos: number) -> number",
					"!doc": "The codePointAt() method returns a non-negative integer that is the UTF-16 encoded code point value.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt"
				},
				endsWith: {
					"!type": "fn(searchString: string, position?: number) -> bool",
					"!doc": "The endsWith() method determines whether a string ends with the characters of another string, returning true or false as appropriate.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith"
				},
				includes: {
					"!type": "fn(searchString: string, position?: number) -> bool",
					"!doc": "The includes() method determines whether one string may be found within another string, returning true or false as appropriate.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/contains"
				},
				normalize: {
					"!type": "fn(form: string) -> string",
					"!doc": "The normalize() method returns the Unicode Normalization Form of a given string (if the value isn't a string, it will be converted to one first).",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize"
				},
				repeat: {
					"!type": "fn(count: number) -> string",
					"!doc": "The repeat() method constructs and returns a new string which contains the specified number of copies of the string on which it was called, concatenated together.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat"
				},
				startsWith: {
					"!type": "fn(searchString: string, position?: number) -> bool",
					"!doc": "The startsWith() method determines whether a string begins with the characters of another string, returning true or false as appropriate.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith"
				}
			}
		},
		Symbol: {
			"!type": "fn(description?: string)",
			"!doc": "A symbol is a unique and immutable data type and may be used as an identifier for object properties. The symbol object is an implicit object wrapper for the symbol primitive data type.",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol",
			"for": {
				"!type": "fn(key: string) -> +Symbol",
				"!doc": "The Symbol.for(key) method searches for existing symbols in a runtime-wide symbol registry with the given key and returns it if found. Otherwise a new symbol gets created in the global symbol registry with this key.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for"
			},
			keyFor: {
				"!type": "fn(sym: +Symbol) -> +Symbol",
				"!doc": "The Symbol.keyFor(sym) method retrieves a shared symbol key from the global symbol registry for the given symbol.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/keyFor"
			},
			prototype: {
				toString: {
					"!type": "fn() -> string",
					"!doc": "The toString() method returns a string representing the specified Symbol object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toString"
				},
				valueOf: {
					"!type": "fn() -> ?",
					"!doc": "The valueOf() method returns the primitive value of a Symbol object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/valueOf"
				}
			}
		},
		TypedArray: {
			"!type": "fn(length: number)",
			"!doc": "A TypedArray object describes an array-like view of an underlying binary data buffer. There is no global property named TypedArray, nor is there a directly visible TypedArray constructor.  Instead, there are a number of different global properties, whose values are typed array constructors for specific element types, listed below. On the following pages you will find common properties and methods that can be used with any typed array containing elements of any type.",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray",
			BYTES_PER_ELEMENT: {
				"!type": "number",
				"!doc": "The TypedArray.BYTES_PER_ELEMENT property represents the size in bytes of each element in an typed array.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/BYTES_PER_ELEMENT"
			},
			length: {
				"!type": "number",
				"!doc": "The length accessor property represents the length (in elements) of a typed array.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/length"
			},
			name: {
				"!type": "string",
				"!doc": "The TypedArray.name property represents a string value of the typed array constructor name.",
				"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/name"
			},
			prototype: {
				buffer: {
					"!type": "+ArrayBuffer",
					"!doc": "The buffer accessor property represents the ArrayBuffer referenced by a TypedArray at construction time.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/buffer"
				},
				byteLength: {
					"!type": "number",
					"!doc": "The byteLength accessor property represents the length (in bytes) of a typed array from the start of its ArrayBuffer.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/byteLength"
				},
				byteOffset: {
					"!type": "number",
					"!doc": "The byteOffset accessor property represents the offset (in bytes) of a typed array from the start of its ArrayBuffer.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/byteOffset"
				},
				copyWithin: {
					"!type": "fn(target: number, start: number, end?: number) -> ?",
					"!doc": "The copyWithin() method copies the sequence of array elements within the array to the position starting at target. The copy is taken from the index positions of the second and third arguments start and end. The end argument is optional and defaults to the length of the array. This method has the same algorithm as Array.prototype.copyWithin. TypedArray is one of the typed array types here.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/copyWithin"
				},
				entries: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The entries() method returns a new Array Iterator object that contains the key/value pairs for each index in the array.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/entries"
				},
				every: {
					"!type": "fn(callback: fn(currentValue: ?, index: number, array: +TypedArray) -> bool, thisArg?: ?) -> bool",
					"!effects": ["call !0 this=!1 !this.<i> number !this"],
					"!doc": "The every() method tests whether all elements in the typed array pass the test implemented by the provided function. This method has the same algorithm as Array.prototype.every(). TypedArray is one of the typed array types here.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/every"
				},
				fill: {
					"!type": "fn(value: ?, start?: number, end?: number)",
					"!doc": "The fill() method fills all the elements of a typed array from a start index to an end index with a static value. This method has the same algorithm as Array.prototype.fill(). TypedArray is one of the typed array types here.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/fill"
				},
				filter: {
					"!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> !this",
					"!effects": ["call !0 this=!1 !this.<i> number"],
					"!doc": "Creates a new array with all of the elements of this array for which the provided filtering function returns true. See also Array.prototype.filter().",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/filter"
				},
				find: {
					"!type": "fn(callback: fn(element: ?, index: number, array: +TypedArray) -> bool, thisArg?: ?) -> ?",
					"!effects": ["call !0 this=!1 !this.<i> number !this"],
					"!doc": "The find() method returns a value in the typed array, if an element satisfies the provided testing function. Otherwise undefined is returned. TypedArray is one of the typed array types here.\nSee also the findIndex() method, which returns the index of a found element in the typed array instead of its value.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/find"
				},
				findIndex: {
					"!type": "fn(callback: fn(element: ?, index: number, array: +TypedArray) -> bool, thisArg?: ?) -> number",
					"!effects": ["call !0 this=!1 !this.<i> number !this"],
					"!doc": "The findIndex() method returns an index in the typed array, if an element in the typed array satisfies the provided testing function. Otherwise -1 is returned.\nSee also the find() method, which returns the value of a found element in the typed array instead of its index.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/findIndex"
				},
				forEach: {
					"!type": "fn(callback: fn(value: ?, key: ?, array: +TypedArray), thisArg?: ?)",
					"!effects": ["call !0 this=!1 !this.<i> number !this"],
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/forEach"
				},
				includes: {
					"!type": "fn(searchElement: ?, fromIndex?: number) -> bool",
					"!doc": "The includes() method determines whether a typed array includes a certain element, returning true or false as appropriate. This method has the same algorithm as Array.prototype.includes(). TypedArray is one of the typed array types here.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/includes"
				},
				indexOf: {
					"!type": "fn(searchElement: ?, fromIndex?: number) -> number",
					"!doc": "The indexOf() method returns the first index at which a given element can be found in the typed array, or -1 if it is not present. This method has the same algorithm as Array.prototype.indexOf(). TypedArray is one of the typed array types here.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/indexOf"
				},
				join: {
					"!type": "fn(separator?: string) -> string",
					"!doc": "The join() method joins all elements of an array into a string. This method has the same algorithm as Array.prototype.join(). TypedArray is one of the typed array types here.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/join"
				},
				keys: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The keys() method returns a new Array Iterator object that contains the keys for each index in the array.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/keys"
				},
				lastIndexOf: {
					"!type": "fn(searchElement: ?, fromIndex?: number) -> number",
					"!doc": "The lastIndexOf() method returns the last index at which a given element can be found in the typed array, or -1 if it is not present. The typed array is searched backwards, starting at fromIndex. This method has the same algorithm as Array.prototype.lastIndexOf(). TypedArray is one of the typed array types here.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/lastIndexOf"
				},
				length: {
					"!type": "number",
					"!doc": "Returns the number of elements hold in the typed array. Fixed at construction time and thus read only.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/length"
				},
				map: {
					"!type": "fn(f: fn(elt: ?, i: number) -> ?, context?: ?) -> [!0.!ret]",
					"!effects": ["call !0 this=!1 !this.<i> number"],
					"!doc": "Creates a new array with the results of calling a provided function on every element in this array. See also Array.prototype.map().",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/map"
				},
				reduce: {
					"!type": "fn(combine: fn(sum: ?, elt: ?, i: number) -> ?, init?: ?) -> !0.!ret",
					"!effects": ["call !0 !1 !this.<i> number"],
					"!doc": "Apply a function against an accumulator and each value of the array (from left-to-right) as to reduce it to a single value. See also Array.prototype.reduce().",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/reduce"
				},
				reduceRight: {
					"!type": "fn(combine: fn(sum: ?, elt: ?, i: number) -> ?, init?: ?) -> !0.!ret",
					"!effects": ["call !0 !1 !this.<i> number"],
					"!doc": "Apply a function against an accumulator and each value of the array (from right-to-left) as to reduce it to a single value. See also Array.prototype.reduceRight().",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/reduceRight"
				},
				reverse: {
					"!type": "fn()",
					"!doc": "The reverse() method reverses a typed array in place. The first typed array element becomes the last and the last becomes the first. This method has the same algorithm as Array.prototype.reverse(). TypedArray is one of the typed array types here.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/reverse"
				},
				set: {
					"!type": "fn(array: [?], offset?: ?)",
					"!doc": "The set() method stores multiple values in the typed array, reading input values from a specified array.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/set"
				},
				slice: {
					"!type": "fn(from: number, to?: number) -> !this",
					"!type": "Extracts a section of an array and returns a new array. See also Array.prototype.slice().",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice"
				},
				some: {
					"!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> bool",
					"!effects": ["call !0 this=!1 !this.<i> number"],
					"!doc": "The some() method tests whether some element in the typed array passes the test implemented by the provided function. This method has the same algorithm as Array.prototype.some(). TypedArray is one of the typed array types here.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/some"
				},
				sort: {
					"!type": "fn(compare?: fn(a: ?, b: ?) -> number)",
					"!effects": ["call !0 !this.<i> !this.<i>"],
					"!doc": "Sorts the elements of an array in place and returns the array. See also Array.prototype.sort().",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/sort"
				},
				subarray: {
					"!type": "fn(begin?: number, end?: number) -> +TypedArray",
					"!doc": "The subarray() method returns a new TypedArray on the same ArrayBuffer store and with the same element types as for this TypedArray object. The begin offset is inclusive and the end offset is exclusive. TypedArray is one of the typed array types.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray"
				},
				values: {
					"!type": "fn() -> TODO_ITERATOR",
					"!doc": "The values() method returns a new Array Iterator object that contains the values for each index in the array.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/values"
				},
				"prototype[@@iterator]": {
					"!type": "fn()",
					"!doc": "The initial value of the @@iterator property is the same function object as the initial value of the values property.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/@@iterator"
				}
			}
		},
		Uint16Array: {
			"!type": "fn()",
			"!doc": "The Uint16Array typed array represents an array of 16-bit unsigned integers in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array",
			length: "TypedArray.length",
			BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
			name: "TypedArray.name",
			from: "TypedArray.from",
			of: "TypedArray.of",
			prototype: {
				"!proto": "TypedArray.prototype"
			}
		},
		Uint32Array: {
			"!type": "fn()",
			"!doc": "The Uint32Array typed array represents an array of 32-bit unsigned integers in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array",
			length: "TypedArray.length",
			BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
			name: "TypedArray.name",
			from: "TypedArray.from",
			of: "TypedArray.of",
			prototype: {
				"!proto": "TypedArray.prototype"
			}
		},
		Uint8Array: {
			"!type": "fn()",
			"!doc": "The Uint8Array typed array represents an array of 8-bit unsigned integers. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
			length: "TypedArray.length",
			BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
			name: "TypedArray.name",
			from: "TypedArray.from",
			of: "TypedArray.of",
			prototype: {
				"!proto": "TypedArray.prototype"
			}
		},
		Uint8ClampedArray: {
			"!type": "fn()",
			"!doc": "The Uint8ClampedArray typed array represents an array of 8-bit unsigned integers clamped to 0-255. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray",
			length: "TypedArray.length",
			BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
			name: "TypedArray.name",
			from: "TypedArray.from",
			of: "TypedArray.of",
			prototype: {
				"!proto": "TypedArray.prototype"
			}
		},
		WeakMap: {
			"!type": "fn(iterable: [?])",
			"!doc": "The WeakMap object is a collection of key/value pairs in which the keys are objects and the values can be arbitrary values.",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap",
			prototype: {
				"delete": {
					"!type": "fn(key: ?) -> bool",
					"!doc": "The delete() method removes the specified element from a WeakMap object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/delete"
				},
				get: {
					"!type": "fn(key: ?) !this.<i>",
					"!doc": "The get() method returns a specified element from a WeakMap object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/get"
				},
				has: {
					"!type": "fn(key: ?) -> bool",
					"!doc": "The has() method returns a boolean indicating whether an element with the specified key exists in the WeakMap object or not.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/has"
				},
				set: {
					"!type": "fn(key: ?, value: ?)",
					"!doc": "The set() method adds a new element with a specified key and value to a WeakMap object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/set"
				}
			}
		},
		WeakSet: {
			"!type": "fn(iterable: [?])",
			"!doc": "The WeakSet object lets you store weakly held objects in a collection.",
			"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet",
			prototype: {
				add: {
					"!type": "fn(value: ?)",
					"!doc": "The add() method appends a new object to the end of a WeakSet object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet/add"
				},
				"delete": {
					"!type": "fn(value: ?) -> bool",
					"!doc": "The delete() method removes the specified element from a WeakSet object.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet/delete"
				},
				has: {
					"!type": "fn(value: ?) -> bool",
					"!doc": "The has() method returns a boolean indicating whether an object exists in a WeakSet or not.",
					"!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet/has"
				}
			}
		}
	},
	function(e) {
		return "object" == typeof exports && "object" == typeof module ? e(exports) : "function" == typeof define && define.amd ? define(["exports"], e) : void e(window.tern.comment || (window.tern.comment = {}))
	}(function(e) {
		function t(e) {
			return 14 > e && e > 8 || 32 === e || 160 === e
		}
		function r(e, r) {
			for (; r > 0; --r) {
				var n = e.charCodeAt(r - 1);
				if (10 == n)
					break;
				if (!t(n))
					return !1
			}
			return !0
		}
		e.commentsBefore = function(e, n) {
			var o, i, s, a, l, c = null , p = 0;
			e: for (; n > 0; )
				if (i = e.charCodeAt(n - 1),
				10 == i)
					for (l = --n,
					s = !1; l > 0; --l) {
						if (i = e.charCodeAt(l - 1),
						47 == i && 47 == e.charCodeAt(l - 2)) {
							if (!r(e, l - 2))
								break e;
							a = e.slice(l, n),
							!p && o ? c[0] = a + "\n" + c[0] : (c || (c = [])).unshift(a),
							o = !0,
							p = 0,
							n = l - 2;
							break
						}
						if (10 == i) {
							if (!s && ++p > 1)
								break e;
							break
						}
						s || t(i) || (s = !0)
					}
				else if (47 == i && 42 == e.charCodeAt(n - 2)) {
					for (l = n - 2; l > 1; --l)
						if (42 == e.charCodeAt(l - 1) && 47 == e.charCodeAt(l - 2)) {
							if (!r(e, l - 2))
								break e;
							(c || (c = [])).unshift(e.slice(l, n - 2)),
							o = !1,
							p = 0;
							break
						}
					n = l - 2
				} else {
					if (!t(i))
						break;
					--n
				}
			return c
		}
		,
		e.commentAfter = function(e, r) {
			for (var n, o, i; r < e.length; ) {
				if (n = e.charCodeAt(r),
				47 == n) {
					if (o = e.charCodeAt(r + 1),
					47 == o)
						i = e.indexOf("\n", r + 2);
					else {
						if (42 != o)
							return;
						i = e.indexOf("*/", r + 2)
					}
					return e.slice(r + 2, 0 > i ? e.length : i)
				}
				t(n) && ++r
			}
		}
		,
		e.ensureCommentsBefore = function(t, r) {
			return r.hasOwnProperty("commentsBefore") ? r.commentsBefore : r.commentsBefore = e.commentsBefore(t, r.start)
		}
	}),
	function(e, t) {
		return "object" == typeof exports && "object" == typeof module ? t(exports, require("acorn"), require("acorn/dist/acorn_loose"), require("acorn/dist/walk"), require("./def"), require("./signal")) : "function" == typeof define && define.amd ? define(["exports", "acorn/dist/acorn", "acorn/dist/acorn_loose", "acorn/dist/walk", "./def", "./signal"], t) : void t(e.tern || (e.tern = {}), window.acorn, window.acorn, window.acorn.walk, window.tern.def, window.tern.signal)
	}(this, function(e, t, r, n, o, i) {
		"use strict";
		function s(e, t) {
			var r, n = Object.create(e);
			if (t)
				for (r in t)
					n[r] = t[r];
			return n
		}
		function a(e, t, r) {
			var n = e.getType(!1)
			, o = t.getType(!1);
			return n && o ? l(n, o, r) : !0
		}
		function l(e, t, r) {
			var n, o, i;
			if (!e || r >= 5)
				return t;
			if (!e || e == t || !t)
				return e;
			if (e.constructor != t.constructor)
				return !1;
			if (e.constructor != L) {
				if (e.constructor == C) {
					var s = 0
					, c = 0
					, p = 0;
					for (i in e.props)
						s++,
						i in t.props && a(e.props[i], t.props[i], r + 1) && p++;
					for (i in t.props)
						c++;
					return s && c && p < Math.max(s, c) / 2 ? !1 : s > c ? e : t
				}
				return e.constructor == _ && e.args.length == t.args.length && e.args.every(function(e, n) {
					return a(e, t.args[n], r + 1)
				}) && a(e.retval, t.retval, r + 1) && a(e.self, t.self, r + 1) ? e : !1
			}
			return n = e.getProp("<i>").getType(!1),
			n && (o = t.getProp("<i>").getType(!1),
			o && !l(n, o, r + 1)) ? void 0 : t
		}
		function c(e) {
			for (var t, r, n, o, i, s, a = 0, l = 0, c = 0, p = null , h = 0; h < e.length; ++h)
				if (o = e[h],
				o instanceof L)
					++a;
				else if (o instanceof _)
					++l;
				else if (o instanceof C)
					++c;
				else if (o instanceof N) {
					if (p && o.name != p.name)
						return null ;
					p = o
				}
			if (t = (a && 1) + (l && 1) + (c && 1) + (p && 1),
			t > 1)
				return null ;
			if (p)
				return p;
			for (r = 0,
			n = null ,
			h = 0; h < e.length; ++h) {
				if (o = e[h],
				i = 0,
				a)
					i = o.getProp("<i>").isEmpty() ? 1 : 2;
				else if (l) {
					for (i = 1,
					s = 0; s < o.args.length; ++s)
						o.args[s].isEmpty() || ++i;
					o.retval.isEmpty() || ++i
				} else
					c && (i = o.name ? 100 : 2);
				i >= r && (r = i,
				n = o)
			}
			return n
		}
		function p(e, t) {
			P.disabledComputing = {
				fn: e,
				prev: P.disabledComputing
			};
			var r = t();
			return P.disabledComputing = P.disabledComputing.prev,
			r
		}
		function h(e, t) {
			var r = P.props[e] || (P.props[e] = []);
			r.push(t)
		}
		function d(e) {
			return P.props[e]
		}
		function u(t) {
			var r;
			if (P.workList)
				return t(P.workList);
			var n = []
			, o = 0
			, i = P.workList = function(e, t, r) {
				o < U - q * n.length && n.push(e, t, r, o)
			}
			, s = t(i);
			for (r = 0; r < n.length; r += 4) {
				if (I && +new Date >= I)
					throw new e.TimedOut;
				o = n[r + 3] + 1,
				n[r + 1].addType(n[r], n[r + 2])
			}
			return P.workList = null ,
			s
		}
		function f(e, t) {
			e.fnType && (e.fnType.instantiateScore = (e.fnType.instantiateScore || 0) + t)
		}
		function m(e, t) {
			try {
				return n.simple(e, {
					Expression: function() {
						if (--t <= 0)
							throw F
					}
				}),
				!0
			} catch (r) {
				if (r == F)
					return !1;
				throw r
			}
		}
		function g(e, t) {
			var r = t.fnType.instantiateScore;
			return !P.disabledComputing && r && t.fnType.args.length && m(e, 5 * r) ? (f(t.prev, r / 2),
			y(e, t),
			!0) : void (t.fnType.instantiateScore = null )
		}
		function y(e, t) {
			for (var r = t.fnType, o = 0; o < r.args.length; ++o)
				r.args[o] = new pt;
			r.self = new pt,
			r.computeRet = function(o, i) {
				return p(r, function() {
					var s, a, l, c, p, h, d = P.curOrigin;
					P.curOrigin = r.origin,
					s = new W(t.prev),
					s.originNode = t.originNode;
					for (a in t.props)
						for (l = s.defProp(a, t.props[a].originNode),
						h = 0; h < i.length; ++h)
							r.argNames[h] == a && h < i.length && i[h].propagate(l);
					for (c = r.argNames.length != i.length ? r.argNames.slice(0, i.length) : r.argNames; c.length < i.length; )
						c.push("?");
					if (s.fnType = new _(r.name,o,i,c,tt),
					s.fnType.originNode = r.originNode,
					r.arguments)
						for (p = s.fnType.arguments = new pt,
						s.defProp("arguments").addType(new L(p)),
						h = 0; h < i.length; ++h)
							i[h].propagate(p);
					return e.body.scope = s,
					n.recursive(e.body, s, null , G),
					n.recursive(e.body, s, null , H),
					P.curOrigin = d,
					s.fnType.retval
				})
			}
		}
		function b(e) {
			function t(e, r, n) {
				var o, i, s, a, l;
				if (!(n > 3) && e.forward)
					for (o = 0; o < e.forward.length; ++o)
						if (i = e.forward[o].propagatesTo()) {
							if (s = r,
							i instanceof pt)
								a = i;
							else {
								if (!(i.target instanceof pt))
									continue;s += i.pathExt,
								a = i.target
							}
							if (a == p)
								return s;
							if (l = t(a, s, n + 1))
								return l
						}
			}
			var r, n, i, s, a, l, c = e.fnType, p = c.retval;
			if (p != tt) {
				for (!p.isEmpty() && (r = p.getType()) instanceof L && (p = n = r.getProp("<i>")),
				i = t(c.self, "!this", 0),
				s = 0; !i && s < c.args.length; ++s)
					i = t(c.args[s], "!" + s, 0);
				if (i)
					return n && (i = "[" + i + "]"),
					a = new o.TypeParser(i),
					l = a.parseType(!0),
					c.computeRet = l.apply ? l : function() {
						return l
					}
					,
					c.computeRetSource = i,
					!0
			}
		}
		function v(e, t) {
			return e.defProp(t.name, t)
		}
		function w(e) {
			return "Identifier" == e.type ? e.name : "AssignmentPattern" == e.type ? w(e.left) : "__"
		}
		function S(e, t, r) {
			var n = e.property;
			return e.computed ? "Literal" == n.type && "string" == typeof n.value ? n.value : (r && M(n, t, r, tt),
			"<i>") : n.name
		}
		function x(e) {
			switch (e) {
			case "+":
			case "-":
			case "~":
				return P.num;
			case "!":
				return P.bool;
			case "typeof":
				return P.str;
			case "void":
			case "delete":
				return tt
			}
		}
		function T(e) {
			switch (e) {
			case "==":
			case "!=":
			case "===":
			case "!==":
			case "<":
			case ">":
			case ">=":
			case "<=":
			case "in":
			case "instanceof":
				return !0
			}
		}
		function O(e) {
			if (e.regex)
				return bt(P.protos.RegExp);
			switch (typeof e.value) {
			case "boolean":
				return P.bool;
			case "number":
				return P.num;
			case "string":
				return P.str;
			case "object":
			case "function":
				return e.value ? bt(P.protos.RegExp) : tt
			}
		}
		function j(e) {
			return function(t, r, n, o, i) {
				var s = e(t, r, n, i);
				return o && s.propagate(o),
				s
			}
		}
		function E(e) {
			return function(t, r, n, o, i) {
				return o || (o = new pt),
				e(t, r, n, o, i),
				o
			}
		}
		function M(e, t, r, n, o) {
			var i = J[e.type];
			return i ? i(e, t, r, n, o) : tt
		}
		function k(e, t) {
			var r, n = e && e[t], o = Array.prototype.slice.call(arguments, 2);
			if (n)
				for (r = 0; r < n.length; ++r)
					n[r].apply(null , o)
		}
		function A(e, t, r) {
			var n = Array.isArray(e);
			return n && 1 == e.length && (e = e[0],
			n = !1),
			n ? null  == r ? function(t) {
				return e.indexOf(t.origin) > -1
			}
			: function(n, o) {
				return o && o.start >= t && o.end <= r && e.indexOf(n.origin) > -1
			}
			: null  == r ? function(t) {
				return t.origin == e
			}
			: function(n, o) {
				return o && o.start >= t && o.end <= r && n.origin == e
			}
		}
		function R(e) {
			var t, r, n;
			if (Y = !0,
			t = d(e))
				for (r = 0; r < t.length; ++r)
					if (n = t[r].getProp(e),
					!n.isEmpty())
						return n;
			return tt
		}
		function D(e, t) {
			var r = Q[e.type];
			return r ? r(e, t) : tt
		}
		var z, N, C, _, L, P, I, U, q, W, F, G, J, H, B, Q, V, X, Y, $, K, Z, et = e.toString = function(e, t, r) {
			return !e || e == r || t && -3 > t ? "?" : e.toString(t, r)
		}
		, tt = e.ANull = i.mixin({
			addType: function() {},
			propagate: function() {},
			getProp: function() {
				return tt
			},
			forAllProps: function() {},
			hasType: function() {
				return !1
			},
			isEmpty: function() {
				return !0
			},
			getFunctionType: function() {},
			getObjType: function() {},
			getType: function() {},
			gatherProperties: function() {},
			propagatesTo: function() {},
			typeHint: function() {},
			propHint: function() {},
			toString: function() {
				return "?"
			}
		}), rt = 100, nt = 90, ot = 10, it = 6, st = 6, at = 90, lt = 2, ct = 4, pt = e.AVal = function() {
			this.types = [],
			this.forward = null ,
			this.maxWeight = 0
		}
		;
		pt.prototype = s(tt, {
			addType: function(e, t) {
				if (t = t || rt,
				this.maxWeight < t) {
					if (this.maxWeight = t,
					1 == this.types.length && this.types[0] == e)
						return;
					this.types.length = 0
				} else if (this.maxWeight > t || this.types.indexOf(e) > -1)
					return;
				this.signal("addType", e),
				this.types.push(e);
				var r = this.forward;
				r && u(function(n) {
					for (var o = 0; o < r.length; ++o)
						n(e, r[o], t)
				})
			},
			propagate: function(e, t) {
				if (!(e == tt || e instanceof jt && this.forward && this.forward.length > 2)) {
					t && t != rt && (e = new Ot(e,t)),
					(this.forward || (this.forward = [])).push(e);
					var r = this.types;
					r.length && u(function(n) {
						for (var o = 0; o < r.length; ++o)
							n(r[o], e, t)
					})
				}
			},
			getProp: function(e) {
				if ("__proto__" == e || "✖" == e)
					return tt;
				var t = (this.props || (this.props = Object.create(null )))[e];
				return t || (t = this.props[e] = new pt,
				this.propagate(new dt(e,t))),
				t
			},
			forAllProps: function(e) {
				this.propagate(new ft(e))
			},
			hasType: function(e) {
				return this.types.indexOf(e) > -1
			},
			isEmpty: function() {
				return 0 === this.types.length
			},
			getFunctionType: function() {
				for (var e = this.types.length - 1; e >= 0; --e)
					if (this.types[e] instanceof _)
						return this.types[e]
			},
			getObjType: function() {
				for (var e, t = null , r = this.types.length - 1; r >= 0; --r)
					if (e = this.types[r],
					e instanceof C) {
						if (e.name)
							return e;
						t || (t = e)
					}
				return t
			},
			getType: function(e) {
				return 0 === this.types.length && e !== !1 ? this.makeupType() : 1 === this.types.length ? this.types[0] : c(this.types)
			},
			toString: function(e, t) {
				if (0 == this.types.length)
					return et(this.makeupType(), e, t);
				if (1 == this.types.length)
					return et(this.types[0], e, t);
				var r = z(this.types);
				return r.length > 2 ? "?" : r.map(function(r) {
					return et(r, e, t)
				}).join("|")
			},
			makeupPropType: function(e) {
				var t, r, n, o, i = this.propertyName, s = e.proto && e.proto.hasProp(i);
				if (s && (t = s.getType()))
					return t;
				if ("<i>" != i) {
					if (r = e.hasProp("<i>"))
						return r.getType()
				} else if (e.props["<i>"] != this)
					for (n in e.props)
						if (o = e.props[n],
						!o.isEmpty())
							return o.getType()
			},
			makeupType: function() {
				var e, t, r, n, o, i, s, a, l, p = this.propertyOf && this.makeupPropType(this.propertyOf);
				if (p)
					return p;
				if (!this.forward)
					return null ;
				for (i = this.forward.length - 1; i >= 0; --i)
					if (e = this.forward[i].typeHint(),
					e && !e.isEmpty())
						return Y = !0,
						e;
				for (t = Object.create(null ),
				r = null ,
				i = 0; i < this.forward.length; ++i)
					a = this.forward[i].propHint(),
					a && "length" != a && "<i>" != a && "✖" != a && a != P.completingProperty && (t[a] = !0,
					r = a);
				if (!r)
					return null ;
				if (n = d(r)) {
					o = [];
					e: for (i = 0; i < n.length; ++i) {
						s = n[i];
						for (a in t)
							if (!s.hasProp(a))
								continue e;
						s.hasCtor && (s = bt(s)),
						o.push(s)
					}
					if (l = c(o))
						return Y = !0,
						l
				}
			},
			typeHint: function() {
				return this.types.length ? this.getType() : null 
			},
			propagatesTo: function() {
				return this
			},
			gatherProperties: function(e, t) {
				for (var r = 0; r < this.types.length; ++r)
					this.types[r].gatherProperties(e, t)
			},
			guessProperties: function(e) {
				var t, r, n;
				if (this.forward)
					for (t = 0; t < this.forward.length; ++t)
						r = this.forward[t].propHint(),
						r && e(r, null , 0);
				n = this.makeupType(),
				n && n.gatherProperties(e)
			}
		}),
		z = e.simplifyTypes = function(e) {
			var t, r, n, o, i = [];
			e: for (t = 0; t < e.length; ++t) {
				for (r = e[t],
				n = 0; n < i.length; n++)
					if (o = l(r, i[n], 0)) {
						i[n] = o;
						continue e
					}
				i.push(r)
			}
			return i
		}
		;
		var ht = e.constraint = function(e) {
			var t, r = function() {
				this.origin = P.curOrigin,
				this.construct.apply(this, arguments)
			}
			;
			r.prototype = Object.create(tt);
			for (t in e)
				e.hasOwnProperty(t) && (r.prototype[t] = e[t]);
			return r
		}
		, dt = ht({
			construct: function(e, t) {
				this.prop = e,
				this.target = t
			},
			addType: function(e, t) {
				e.getProp && e.getProp(this.prop).propagate(this.target, t)
			},
			propHint: function() {
				return this.prop
			},
			propagatesTo: function() {
				return "<i>" != this.prop && /[^\w_]/.test(this.prop) ? void 0 : {
					target: this.target,
					pathExt: "." + this.prop
				}
			}
		})
		, ut = e.PropHasSubset = ht({
			construct: function(e, t, r) {
				this.prop = e,
				this.type = t,
				this.originNode = r
			},
			addType: function(e, t) {
				if (e instanceof C) {
					var r = e.defProp(this.prop, this.originNode);
					r.origin || (r.origin = this.origin),
					this.type.propagate(r, t)
				}
			},
			propHint: function() {
				return this.prop
			}
		})
		, ft = ht({
			construct: function(e) {
				this.c = e
			},
			addType: function(e) {
				e instanceof C && e.forAllProps(this.c)
			}
		})
		, mt = e.IsCallee = ht({
			construct: function(e, t, r, n) {
				this.self = e,
				this.args = t,
				this.argNodes = r,
				this.retval = n,
				this.disabled = P.disabledComputing
			},
			addType: function(e, t) {
				var r, n, o, i;
				if (e instanceof _) {
					for (r = 0; r < this.args.length; ++r)
						r < e.args.length && this.args[r].propagate(e.args[r], t),
						e.arguments && this.args[r].propagate(e.arguments, t);
					if (this.self.propagate(e.self, this.self == P.topScope ? at : t),
					n = e.computeRet)
						for (o = this.disabled; o; o = o.prev)
							(o.fn == e || e.originNode && o.fn.originNode == e.originNode) && (n = null );
					n ? (i = P.disabledComputing,
					P.disabledComputing = this.disabled,
					n(this.self, this.args, this.argNodes).propagate(this.retval, t),
					P.disabledComputing = i) : e.retval.propagate(this.retval, t)
				}
			},
			typeHint: function() {
				for (var e = [], t = 0; t < this.args.length; ++t)
					e.push("?");
				return new _(null ,this.self,this.args,e,tt)
			},
			propagatesTo: function() {
				return {
					target: this.retval,
					pathExt: ".!ret"
				}
			}
		})
		, gt = ht({
			construct: function(e, t, r, n) {
				this.propName = e,
				this.args = t,
				this.argNodes = r,
				this.retval = n,
				this.disabled = P.disabledComputing
			},
			addType: function(e, t) {
				var r = new mt(e,this.args,this.argNodes,this.retval);
				r.disabled = this.disabled,
				e.getProp(this.propName).propagate(r, t)
			},
			propHint: function() {
				return this.propName
			}
		})
		, yt = e.IsCtor = ht({
			construct: function(e, t) {
				this.target = e,
				this.noReuse = t
			},
			addType: function(e, t) {
				e instanceof _ && (P.parent && !P.parent.options.reuseInstances && (this.noReuse = !0),
				e.getProp("prototype").propagate(new vt(this.noReuse ? !1 : e,this.target), t))
			}
		})
		, bt = e.getInstance = function(e, t) {
			var r, n, o;
			if (t === !1)
				return new C(e);
			for (t || (t = e.hasCtor),
			e.instances || (e.instances = []),
			r = 0; r < e.instances.length; ++r)
				if (n = e.instances[r],
				n.ctor == t)
					return n.instance;
			return o = new C(e,t && t.name),
			o.origin = e.origin,
			e.instances.push({
				ctor: t,
				instance: o
			}),
			o
		}
		, vt = e.IsProto = ht({
			construct: function(e, t) {
				this.ctor = e,
				this.target = t
			},
			addType: function(e) {
				e instanceof C && ((this.count = (this.count || 0) + 1) > 8 || this.target.addType(e == P.protos.Array ? new L : bt(e, this.ctor)))
			}
		})
		, wt = ht({
			construct: function(e) {
				this.fn = e
			},
			addType: function(e) {
				if (e instanceof C && !e.hasCtor) {
					e.hasCtor = this.fn;
					var t = new Tt(e,this.fn);
					t.addType(this.fn),
					e.forAllProps(function(e, r, n) {
						n && r.propagate(t)
					})
				}
			}
		})
		, St = ht({
			construct: function(e, t) {
				this.other = e,
				this.target = t
			},
			addType: function(e, t) {
				e == P.str ? this.target.addType(P.str, t) : e == P.num && this.other.hasType(P.num) && this.target.addType(P.num, t)
			},
			typeHint: function() {
				return this.other
			}
		})
		, xt = e.IfObj = ht({
			construct: function(e) {
				this.target = e
			},
			addType: function(e, t) {
				e instanceof C && this.target.addType(e, t)
			},
			propagatesTo: function() {
				return this.target
			}
		})
		, Tt = ht({
			construct: function(e, t) {
				this.obj = e,
				this.ctor = t
			},
			addType: function(e) {
				e instanceof _ && e.self && e.self.addType(bt(this.obj, this.ctor), ct)
			}
		})
		, Ot = ht({
			construct: function(e, t) {
				this.inner = e,
				this.weight = t
			},
			addType: function(e, t) {
				this.inner.addType(e, Math.min(t, this.weight))
			},
			propagatesTo: function() {
				return this.inner.propagatesTo()
			},
			typeHint: function() {
				return this.inner.typeHint()
			},
			propHint: function() {
				return this.inner.propHint()
			}
		})
		, jt = e.Type = function() {}
		;
		jt.prototype = s(tt, {
			constructor: jt,
			propagate: function(e, t) {
				e.addType(this, t)
			},
			hasType: function(e) {
				return e == this
			},
			isEmpty: function() {
				return !1
			},
			typeHint: function() {
				return this
			},
			getType: function() {
				return this
			}
		}),
		N = e.Prim = function(e, t) {
			this.name = t,
			this.proto = e
		}
		,
		N.prototype = s(jt.prototype, {
			constructor: N,
			toString: function() {
				return this.name
			},
			getProp: function(e) {
				return this.proto.hasProp(e) || tt
			},
			gatherProperties: function(e, t) {
				this.proto && this.proto.gatherProperties(e, t)
			}
		}),
		C = e.Obj = function(e, t) {
			if (this.props || (this.props = Object.create(null )),
			this.proto = e === !0 ? P.protos.Object : e,
			e && !t && e.name && !(this instanceof _)) {
				var r = /^(.*)\.prototype$/.exec(this.proto.name);
				r && (t = r[1])
			}
			this.name = t,
			this.maybeProps = null ,
			this.origin = P.curOrigin
		}
		,
		C.prototype = s(jt.prototype, {
			constructor: C,
			toString: function(e) {
				var t, r, n;
				if (null  == e && (e = 0),
				0 >= e && this.name)
					return this.name;
				t = [],
				r = !1;
				for (n in this.props)
					if ("<i>" != n) {
						if (t.length > 5) {
							r = !0;
							break
						}
						t.push(e ? n + ": " + et(this.props[n], e - 1, this) : n)
					}
				return t.sort(),
				r && t.push("..."),
				"{" + t.join(", ") + "}"
			},
			hasProp: function(e, t) {
				var r, n = this.props[e];
				if (t !== !1)
					for (r = this.proto; r && !n; r = r.proto)
						n = r.props[e];
				return n
			},
			defProp: function(e, t) {
				var r, n = this.hasProp(e, !1);
				return n ? (t && !n.originNode && (n.originNode = t),
				n) : "__proto__" == e || "✖" == e ? tt : (r = this.maybeProps && this.maybeProps[e],
				r ? (delete this.maybeProps[e],
				this.maybeUnregProtoPropHandler()) : (r = new pt,
				r.propertyOf = this,
				r.propertyName = e),
				this.props[e] = r,
				r.originNode = t,
				r.origin = P.curOrigin,
				this.broadcastProp(e, r, !0),
				r)
			},
			getProp: function(e) {
				var t, r = this.hasProp(e, !0) || this.maybeProps && this.maybeProps[e];
				return r ? r : "__proto__" == e || "✖" == e ? tt : (t = this.ensureMaybeProps()[e] = new pt,
				t.propertyOf = this,
				t.propertyName = e,
				t)
			},
			broadcastProp: function(e, t, r) {
				var n, o;
				if (r && (this.signal("addProp", e, t),
				this instanceof W || h(e, this)),
				this.onNewProp)
					for (n = 0; n < this.onNewProp.length; ++n)
						o = this.onNewProp[n],
						o.onProtoProp ? o.onProtoProp(e, t, r) : o(e, t, r)
			},
			onProtoProp: function(e, t) {
				var r = this.maybeProps && this.maybeProps[e];
				r && (delete this.maybeProps[e],
				this.maybeUnregProtoPropHandler(),
				this.proto.getProp(e).propagate(r)),
				this.broadcastProp(e, t, !1)
			},
			ensureMaybeProps: function() {
				return this.maybeProps || (this.proto && this.proto.forAllProps(this),
				this.maybeProps = Object.create(null )),
				this.maybeProps
			},
			removeProp: function(e) {
				var t = this.props[e];
				delete this.props[e],
				this.ensureMaybeProps()[e] = t,
				t.types.length = 0
			},
			forAllProps: function(e) {
				var t, r;
				for (this.onNewProp || (this.onNewProp = [],
				this.proto && this.proto.forAllProps(this)),
				this.onNewProp.push(e),
				t = this; t; t = t.proto)
					for (r in t.props)
						e.onProtoProp ? e.onProtoProp(r, t.props[r], t == this) : e(r, t.props[r], t == this)
			},
			maybeUnregProtoPropHandler: function() {
				if (this.maybeProps) {
					for (var e in this.maybeProps)
						return;
					this.maybeProps = null 
				}
				!this.proto || this.onNewProp && this.onNewProp.length || this.proto.unregPropHandler(this)
			},
			unregPropHandler: function(e) {
				for (var t = 0; t < this.onNewProp.length; ++t)
					if (this.onNewProp[t] == e) {
						this.onNewProp.splice(t, 1);
						break
					}
				this.maybeUnregProtoPropHandler()
			},
			gatherProperties: function(e, t) {
				for (var r in this.props)
					"<i>" != r && e(r, this, t);
				this.proto && this.proto.gatherProperties(e, t + 1)
			},
			getObjType: function() {
				return this
			}
		}),
		_ = e.Fn = function(e, t, r, n, o) {
			C.call(this, P.protos.Function, e),
			this.self = t,
			this.args = r,
			this.argNames = n,
			this.retval = o
		}
		,
		_.prototype = s(C.prototype, {
			constructor: _,
			toString: function(e) {
				var t, r, n;
				for (null  == e && (e = 0),
				t = "fn(",
				r = 0; r < this.args.length; ++r)
					r && (t += ", "),
					n = this.argNames[r],
					n && "?" != n && (t += n + ": "),
					t += e > -3 ? et(this.args[r], e - 1, this) : "?";
				return t += ")",
				this.retval.isEmpty() || (t += " -> " + (e > -3 ? et(this.retval, e - 1, this) : "?")),
				t
			},
			getProp: function(e) {
				var t, r;
				return "prototype" == e ? (t = this.hasProp(e, !1),
				t || (t = this.defProp(e),
				r = new C(!0,this.name && this.name + ".prototype"),
				r.origin = this.origin,
				t.addType(r, ot)),
				t) : C.prototype.getProp.call(this, e)
			},
			defProp: function(e, t) {
				if ("prototype" == e) {
					var r = this.hasProp(e, !1);
					return r ? r : (r = C.prototype.defProp.call(this, e, t),
					r.origin = this.origin,
					r.propagate(new wt(this)),
					r)
				}
				return C.prototype.defProp.call(this, e, t)
			},
			getFunctionType: function() {
				return this
			}
		}),
		L = e.Arr = function(e) {
			C.call(this, P.protos.Array);
			var t = this.defProp("<i>");
			e && e.propagate(t)
		}
		,
		L.prototype = s(C.prototype, {
			constructor: L,
			toString: function(e) {
				return null  == e && (e = 0),
				"[" + (e > -3 ? et(this.getProp("<i>"), e - 1, this) : "?") + "]"
			}
		}),
		e.Context = function(t, r) {
			this.parent = r,
			this.props = Object.create(null ),
			this.protos = Object.create(null ),
			this.origins = [],
			this.curOrigin = "ecma5",
			this.paths = Object.create(null ),
			this.definitions = Object.create(null ),
			this.purgeGen = 0,
			this.workList = null ,
			this.disabledComputing = null ,
			e.withContext(this, function() {
				if (P.protos.Object = new C(null ,"Object.prototype"),
				P.topScope = new W,
				P.topScope.name = "<top>",
				P.protos.Array = new C(!0,"Array.prototype"),
				P.protos.Function = new _("Function.prototype",tt,[],[],tt),
				P.protos.Function.proto = P.protos.Object,
				P.protos.RegExp = new C(!0,"RegExp.prototype"),
				P.protos.String = new C(!0,"String.prototype"),
				P.protos.Number = new C(!0,"Number.prototype"),
				P.protos.Boolean = new C(!0,"Boolean.prototype"),
				P.str = new N(P.protos.String,"string"),
				P.bool = new N(P.protos.Boolean,"bool"),
				P.num = new N(P.protos.Number,"number"),
				P.curOrigin = null ,
				t)
					for (var e = 0; e < t.length; ++e)
						o.load(t[e])
			})
		}
		,
		e.Context.prototype.startAnalysis = function() {
			this.disabledComputing = this.workList = null 
		}
		,
		P = null ,
		e.cx = function() {
			return P
		}
		,
		e.withContext = function (e, t) {
			var r = P;
			P = e;
			try {
				return t()
			} finally {
				P = r
			}
		}
		,
		e.TimedOut = function() {
			this.message = "Timed out",
			this.stack = (new Error).stack
		}
		,
		e.TimedOut.prototype = Object.create(Error.prototype),
		e.TimedOut.prototype.name = "infer.TimedOut",
		e.withTimeout = function(e, t) {
			var r = +new Date + e
			, n = I;
			if (n && r > n)
				return t();
			I = r;
			try {
				return t()
			} finally {
				I = n
			}
		}
		,
		e.addOrigin = function(e) {
			P.origins.indexOf(e) < 0 && P.origins.push(e)
		}
		,
		U = 20,
		q = 1e-4,
		W = e.Scope = function(e) {
			C.call(this, e || !0),
			this.prev = e
		}
		,
		W.prototype = s(C.prototype, {
			constructor: W,
			defVar: function(e, t) {
				for (var r, n = this; ; n = n.proto) {
					if (r = n.props[e])
						return r;
					if (!n.prev)
						return n.defProp(e, t)
				}
			}
		}),
		F = {},
		G = n.make({
			Function: function(e, t, r) {
				var n, o, i, s, a, l = e.body.scope = new W(t);
				for (l.originNode = e,
				n = [],
				o = [],
				i = 0; i < e.params.length; ++i)
					s = e.params[i],
					o.push(w(s)),
					n.push(v(l, s));
				l.fnType = new _(e.id && e.id.name,new pt,n,o,tt),
				l.fnType.originNode = e,
				e.id && (a = "FunctionDeclaration" == e.type,
				v(a ? t : l, e.id)),
				r(e.body, l, "ScopeBody")
			},
			TryStatement: function(e, t, r) {
				var n, o;
				r(e.block, t, "Statement"),
				e.handler && (n = v(t, e.handler.param),
				r(e.handler.body, t, "ScopeBody"),
				o = P.definitions.ecma5,
				o && n.isEmpty() && bt(o["Error.prototype"]).propagate(n, st)),
				e.finalizer && r(e.finalizer, t, "Statement")
			},
			VariableDeclaration: function(e, t, r) {
				for (var n, o = 0; o < e.declarations.length; ++o)
					n = e.declarations[o],
					"Identifier" == n.id.type && v(t, n.id),
					n.init && r(n.init, t, "Expression")
			}
		}),
		J = {
			ArrayExpression: j(function(e, t, r) {
				for (var n, o = new pt, i = 0; i < e.elements.length; ++i)
					n = e.elements[i],
					n && M(n, t, r, o);
				return new L(o)
			}),
			ObjectExpression: j(function(e, t, r, n) {
				var o, i, s, n, a, l, c = e.objType = new C(!0,n);
				for (c.originNode = e,
				o = 0; o < e.properties.length; ++o)
					i = e.properties[o],
					s = i.key,
					"✖" != i.value.name && ("Identifier" == s.type ? n = s.name : "string" == typeof s.value && (n = s.value),
					n && "set" != i.kind ? (l = a = c.defProp(n, s),
					l.initializer = !0,
					"get" == i.kind && (a = new mt(c,[],null ,l))) : a = tt,
					M(i.value, t, r, a, n),
					"FunctionExpression" == i.value.type && i.value.body.scope.fnType.self.addType(c, lt));
				return c
			}),
			FunctionExpression: j(function(e, t, r, n) {
				var o = e.body.scope
				, i = o.fnType;
				return n && !i.name && (i.name = n),
				r(e.body, t, "ScopeBody"),
				g(e, o) || b(o),
				e.id && o.getProp(e.id.name).addType(i),
				i
			}),
			SequenceExpression: j(function(e, t, r) {
				for (var n = 0, o = e.expressions.length - 1; o > n; ++n)
					M(e.expressions[n], t, r, tt);
				return M(e.expressions[o], t, r)
			}),
			UnaryExpression: j(function(e, t, r) {
				return M(e.argument, t, r, tt),
				x(e.operator)
			}),
			UpdateExpression: j(function(e, t, r) {
				return M(e.argument, t, r, tt),
				P.num
			}),
			BinaryExpression: j(function(e, t, r) {
				var n, o, i;
				return "+" == e.operator ? (n = M(e.left, t, r),
				o = M(e.right, t, r),
				n.hasType(P.str) || o.hasType(P.str) ? P.str : n.hasType(P.num) && o.hasType(P.num) ? P.num : (i = new pt,
				n.propagate(new St(o,i)),
				o.propagate(new St(n,i)),
				i)) : (M(e.left, t, r, tt),
				M(e.right, t, r, tt),
				T(e.operator) ? P.bool : P.num)
			}),
			AssignmentExpression: j(function(e, t, r) {
				var n, o, i, s, a;
				if ("MemberExpression" == e.left.type ? (i = S(e.left, t, r),
				"Identifier" == e.left.object.type && (o = e.left.object.name + "." + i)) : o = w(e.left),
				"=" != e.operator && "+=" != e.operator ? (M(e.right, t, r, tt),
				n = P.num) : n = M(e.right, t, r, null , o),
				"MemberExpression" == e.left.type) {
					if (s = M(e.left.object, t, r),
					"prototype" == i && f(t, 20),
					"<i>" == i) {
						var l = e.left.property.name
						, c = t.props[l]
						, p = c && c.iteratesOver;
						if (p)
							return f(t, 20),
							a = "MemberExpression" == e.right.type && e.right.computed && e.right.property.name == l,
							p.forAllProps(function(e, t, r) {
								r && "prototype" != e && "<i>" != e && s.propagate(new ut(e,a ? t : tt))
							}),
							n
					}
					s.propagate(new ut(i,n,e.left.property)),
					"FunctionExpression" == e.right.type && s.propagate(e.right.body.scope.fnType.self, lt)
				} else
					"Identifier" == e.left.type && n.propagate(t.defVar(e.left.name, e.left));
				return n
			}),
			LogicalExpression: E(function(e, t, r, n) {
				M(e.left, t, r, n),
				M(e.right, t, r, n)
			}),
			ConditionalExpression: E(function(e, t, r, n) {
				M(e.test, t, r, tt),
				M(e.consequent, t, r, n),
				M(e.alternate, t, r, n)
			}),
			NewExpression: E(function(e, t, r, n, o) {
				var i, s, a, l;
				for (("Identifier" == e.callee.type && e.callee.name in t.props && f(t, 20),
				i = 0,
				s = [])
					; i < e.arguments.length; ++i)
						s.push(M(e.arguments[i], t, r));
					a = M(e.callee, t, r),
					l = new pt,
					a.propagate(new yt(l,o && /\.prototype$/.test(o))),
					l.propagate(n, nt),
					a.propagate(new mt(l,s,e.arguments,new xt(n)))
				}),
				CallExpression: E(function(e, t, r, n) {
					for (var o, i, s, a, l = 0, c = []; l < e.arguments.length; ++l)
						c.push(M(e.arguments[l], t, r));
					"MemberExpression" == e.callee.type ? (o = M(e.callee.object, t, r),
					i = S(e.callee, t, r),
					("call" == i || "apply" == i) && t.fnType && t.fnType.args.indexOf(o) > -1 && f(t, 30),
					o.propagate(new gt(i,c,e.arguments,n))) : (s = M(e.callee, t, r),
					t.fnType && t.fnType.args.indexOf(s) > -1 && f(t, 30),
					a = s.getFunctionType(),
					a && a.instantiateScore && t.fnType && f(t, a.instantiateScore / 5),
					s.propagate(new mt(P.topScope,c,e.arguments,n)))
				}),
				MemberExpression: E(function(e, t, r, n) {
					var o, i = S(e, t), s = M(e.object, t, r), a = s.getProp(i);
					return "<i>" != i || (o = M(e.property, t, r),
					o.hasType(P.num)) ? void a.propagate(n) : a.propagate(n, it)
				}),
				Identifier: j(function(e, t) {
					return "arguments" != e.name || !t.fnType || e.name in t.props || t.defProp(e.name, t.fnType.originNode).addType(new L(t.fnType.arguments = new pt)),
					t.getProp(e.name)
				}),
				ThisExpression: j(function(e, t) {
					return t.fnType ? t.fnType.self : P.topScope
				}),
				Literal: j(function(e) {
					return O(e)
				})
			},
			H = n.make({
				Expression: function(e, t, r) {
					M(e, t, r, tt)
				},
				FunctionDeclaration: function(e, t, r) {
					var n, o = e.body.scope, i = o.fnType;
					r(e.body, t, "ScopeBody"),
					g(e, o) || b(o),
					n = t.getProp(e.id.name),
					n.addType(i)
				},
				VariableDeclaration: function(e, t, r) {
					for (var n, o, i = 0; i < e.declarations.length; ++i)
						n = e.declarations[i],
						"Identifier" == n.id.type ? (o = t.getProp(n.id.name),
						n.init && M(n.init, t, r, o, n.id.name)) : n.init && M(n.init, t, r, tt)
				},
				ReturnStatement: function(e, t, r) {
					if (e.argument) {
						var n = tt;
						t.fnType && (t.fnType.retval == tt && (t.fnType.retval = new pt),
						n = t.fnType.retval),
						M(e.argument, t, r, n)
					}
				},
				ForInStatement: function(e, t, r) {
					var n, o = M(e.right, t, r);
					("Identifier" == e.right.type && e.right.name in t.props || "MemberExpression" == e.right.type && "prototype" == e.right.property.name) && (f(t, 5),
					"Identifier" == e.left.type ? n = e.left.name : "VariableDeclaration" == e.left.type && "Identifier" == e.left.declarations[0].id.type && (n = e.left.declarations[0].id.name),
					n && n in t.props && (t.getProp(n).iteratesOver = o)),
					r(e.body, t, "Statement")
				},
				ScopeBody: function(e, t, r) {
					r(e, e.scope || t)
				}
			}),
			B = e.parse = function (e, n, o) {
				var i, s, a;
				if (n && n.preParse)
					for (s = 0; s < n.preParse.length; s++)
						a = n.preParse[s](e, o),
						"string" == typeof a && (e = a);
				try {
					i = t.parse(e, o)
				} catch (l) {
					i = r.parse_dammit(e, o)
				}
				return k(n, "postParse", i, e),
				i
			}
			,
			e.analyze = function(t, r, o, i) {
				"string" == typeof t && (t = B(t)),
				r || (r = "file#" + P.origins.length),
				e.addOrigin(P.curOrigin = r),
				o || (o = P.topScope),
				P.startAnalysis(),
				n.recursive(t, o, null , G),
				k(i, "preInfer", t, o),
				n.recursive(t, o, null , H),
				k(i, "postInfer", t, o),
				P.curOrigin = null 
			}
			,
			e.purge = function(e, t, r) {
				var n, o, i, s, a, l = A(e, t, r);
				++P.purgeGen,
				P.topScope.purge(l);
				for (n in P.props) {
					for (o = P.props[n],
					i = 0; i < o.length; ++i)
						s = o[i],
						a = s.props[n],
						(!a || l(a, a.originNode)) && o.splice(i--, 1);
					o.length || delete P.props[n]
				}
			}
			,
			pt.prototype.purge = function(e) {
				var t, r, n;
				if (this.purgeGen != P.purgeGen) {
					for (this.purgeGen = P.purgeGen,
					r = 0; r < this.types.length; ++r)
						t = this.types[r],
						e(t, t.originNode) ? this.types.splice(r--, 1) : t.purge(e);
					if (this.types.length || (this.maxWeight = 0),
					this.forward)
						for (r = 0; r < this.forward.length; ++r)
							n = this.forward[r],
							e(n) ? (this.forward.splice(r--, 1),
							this.props && (this.props = null )) : n.purge && n.purge(e)
				}
			}
			,
			tt.purge = function() {}
			,
			C.prototype.purge = function(e) {
				var t, r;
				if (this.purgeGen == P.purgeGen)
					return !0;
				this.purgeGen = P.purgeGen;
				for (t in this.props)
					r = this.props[t],
					e(r, r.originNode) && this.removeProp(t),
					r.purge(e)
			}
			,
			_.prototype.purge = function(e) {
				if (!C.prototype.purge.call(this, e)) {
					this.self.purge(e),
					this.retval.purge(e);
					for (var t = 0; t < this.args.length; ++t)
						this.args[t].purge(e)
				}
			}
			,
			Q = {
				ArrayExpression: function(e, t) {
					for (var r, n = new pt, o = 0; o < e.elements.length; ++o)
						r = e.elements[o],
						r && D(r, t).propagate(n);
					return new L(n)
				},
				ObjectExpression: function(e) {
					return e.objType
				},
				FunctionExpression: function(e) {
					return e.body.scope.fnType
				},
				SequenceExpression: function(e, t) {
					return D(e.expressions[e.expressions.length - 1], t)
				},
				UnaryExpression: function(e) {
					return x(e.operator)
				},
				UpdateExpression: function() {
					return P.num
				},
				BinaryExpression: function(e, t) {
					if (T(e.operator))
						return P.bool;
					if ("+" == e.operator) {
						var r = D(e.left, t)
						, n = D(e.right, t);
						if (r.hasType(P.str) || n.hasType(P.str))
							return P.str
					}
					return P.num
				},
				AssignmentExpression: function(e, t) {
					return D(e.right, t)
				},
				LogicalExpression: function(e, t) {
					var r = D(e.left, t);
					return r.isEmpty() ? D(e.right, t) : r
				},
				ConditionalExpression: function(e, t) {
					var r = D(e.consequent, t);
					return r.isEmpty() ? D(e.alternate, t) : r
				},
				NewExpression: function(e, t) {
					var r = D(e.callee, t).getFunctionType()
					, n = r && r.getProp("prototype").getObjType();
					return n ? bt(n, r) : tt
				},
				CallExpression: function(e, t) {
					var r, n, o, i = D(e.callee, t).getFunctionType();
					if (!i)
						return tt;
					if (i.computeRet) {
						for (r = 0,
						n = []; r < e.arguments.length; ++r)
							n.push(D(e.arguments[r], t));
						return o = tt,
						"MemberExpression" == e.callee.type && (o = D(e.callee.object, t)),
						i.computeRet(o, n, e.arguments)
					}
					return i.retval
				},
				MemberExpression: function(e, t) {
					var r = S(e, t)
					, n = D(e.object, t).getType();
					return n ? n.getProp(r) : "<i>" == r ? tt : R(r)
				},
				Identifier: function(e, t) {
					return t.hasProp(e.name) || tt
				},
				ThisExpression: function(e, t) {
					return t.fnType ? t.fnType.self : P.topScope
				},
				Literal: function(e) {
					return O(e)
				}
			},
			V = e.searchVisitor = n.make({
				Function: function(e, t, r) {
					var n, o = e.body.scope;
					for (e.id && r(e.id, o),
					n = 0; n < e.params.length; ++n)
						r(e.params[n], o);
					r(e.body, o, "ScopeBody")
				},
				TryStatement: function(e, t, r) {
					e.handler && r(e.handler.param, t),
					n.base.TryStatement(e, t, r)
				},
				VariableDeclaration: function(e, t, r) {
					for (var n, o = 0; o < e.declarations.length; ++o)
						n = e.declarations[o],
						r(n.id, t),
						n.init && r(n.init, t, "Expression")
				},
				Property: function(e, t, r) {
					e.computed && r(e.key, t, "Expression"),
					e.key != e.value && r(e.value, t, "Expression")
				}
			}),
			e.fullVisitor = n.make({
				MemberExpression: function(e, t, r) {
					r(e.object, t, "Expression"),
					r(e.property, t, e.computed ? "Expression" : null )
				},
				ObjectExpression: function(e, t, r) {
					for (var n = 0; n < e.properties.length; ++n)
						r(e.properties[n].value, t, "Expression"),
						r(e.properties[n].key, t)
				}
			}, V),
			e.findExpressionAt = function(e, t, r, o, i) {
				var s = i || function(e, t) {
					return "Identifier" == t.type && "✖" == t.name ? !1 : Q.hasOwnProperty(t.type)
				}
				;
				return n.findNodeAt(e, t, r, s, V, o || P.topScope)
			}
			,
			e.findExpressionAround = function(e, t, r, o, i) {
				var s = i || function(e, r) {
					return null  != t && r.start > t ? !1 : "Identifier" == r.type && "✖" == r.name ? !1 : Q.hasOwnProperty(r.type)
				}
				;
				return n.findNodeAround(e, r, s, V, o || P.topScope)
			}
			,
			e.expressionType = function(e) {
				return D(e.node, e.state)
			}
			,
			e.parentNode = function(e, t) {
				function r(t, i, s) {
					if (t.start <= e.start && t.end >= e.end) {
						var a = o[o.length - 1];
						if (t == e)
							throw {
								found: a
							};
						a != t && o.push(t),
						n.base[s || t.type](t, i, r),
						a != t && o.pop()
					}
				}
				var o = [];
				try {
					r(t, null )
				} catch (i) {
					if (i.found)
						return i.found;
					throw i
				}
			}
			,
			X = {
				ArrayExpression: function(e, t, r) {
					return r(e, !0).getProp("<i>")
				},
				ObjectExpression: function(e, t, r) {
					for (var n, o = 0; o < e.properties.length; ++o)
						if (n = t.properties[o],
						n.value == t)
							return r(e, !0).getProp(n.key.name)
				},
				UnaryExpression: function(e) {
					return x(e.operator)
				},
				UpdateExpression: function() {
					return P.num
				},
				BinaryExpression: function(e) {
					return T(e.operator) ? P.bool : P.num
				},
				AssignmentExpression: function(e, t, r) {
					return r(e.left)
				},
				LogicalExpression: function(e, t, r) {
					return r(e, !0)
				},
				ConditionalExpression: function(e, t, r) {
					return e.consequent == t || e.alternate == t ? r(e, !0) : void 0
				},
				NewExpression: function(e, t, r) {
					return this.CallExpression(e, t, r)
				},
				CallExpression: function(e, t, r) {
					for (var n, o, i = 0; i < e.arguments.length; i++)
						if (n = e.arguments[i],
						n == t) {
							if (o = r(e.callee).getFunctionType(),
							o instanceof _)
								return o.args[i];
							break
						}
				},
				ReturnStatement: function(e, t, r) {
					var o, i = n.findNodeAround(t.sourceFile.ast, t.start, "Function");
					return i && (o = "FunctionExpression" == i.node.type ? r(i.node, !0).getFunctionType() : i.node.body.scope.fnType) ? o.retval.getType() : void 0
				},
				VariableDeclaration: function(e, t, r) {
					for (var n, o = 0; o < e.declarations.length; o++)
						if (n = e.declarations[o],
						n.init == t)
							return r(n.id)
				}
			},
			e.typeFromContext = function(t, r) {
				var n, o = e.parentNode(r.node, t), i = null ;
				return X.hasOwnProperty(o.type) && (n = X[o.type],
				i = n && n(o, r.node, function(n, o) {
					var i = {
						node: n,
						state: r.state
					}
					, s = o ? e.typeFromContext(t, i) : e.expressionType(i);
					return s || tt
				})),
				i || e.expressionType(r)
			}
			,
			Y = !1,
			e.resetGuessing = function(e) {
				Y = e
			}
			,
			e.didGuess = function() {
				return Y
			}
			,
			e.forAllPropertiesOf = function(e, t) {
				e.gatherProperties(t, 0)
			}
			,
			$ = n.make({}, V),
			e.findRefs = function(e, t, r, o, i) {
				$.Identifier = function(e, t) {
					if (e.name == r)
						for (var n = t; n; n = n.prev)
							if (n == o && i(e, t),
							r in n.props)
								return
				}
				,
				n.recursive(e, t, null , $)
			}
			,
			K = n.make({
				Function: function(e, t, r) {
					r(e.body, e.body.scope, "ScopeBody")
				}
			}),
			e.findPropRefs = function(e, t, r, o, i) {
				n.simple(e, {
					MemberExpression: function(e, t) {
						e.computed || e.property.name != o || D(e.object, t).getType() == r && i(e.property)
					},
					ObjectExpression: function(e, t) {
						if (D(e, t).getType() == r)
							for (var n = 0; n < e.properties.length; ++n)
								e.properties[n].key.name == o && i(e.properties[n].key)
					}
				}, K, t)
			}
			,
			Z = e.scopeAt = function (e, t, r) {
				console.trace();

				var o = n.findNodeAround(e, t, function (e, t) {
					return "ScopeBody" == e && t.scope
				});
				return o ? o.node.scope : r || P.topScope
			}
			,
			e.forAllLocalsAt = function(e, t, r, n) {
				var o = Z(e, t, r);
				o.gatherProperties(n, 0)
			}
			,
			o = e.def = o.init({}, e)
		}),
		function(e) {
			return "object" == typeof exports && "object" == typeof module ? e(require("../lib/infer"), require("../lib/tern"), require("../lib/comment"), require("acorn"), require("acorn/dist/walk")) : "function" == typeof define && define.amd ? define(["../lib/infer", "../lib/tern", "../lib/comment", "acorn/dist/acorn", "acorn/dist/walk"], e) : void e(window.tern, window.tern, window.tern.comment, window.acorn, window.acorn.walk)
		}(function(e, t, r, n, o) {
			"use strict";
			function i(e, t) {
				function n(e) {
					r.ensureCommentsBefore(t, e)
				}
				o.simple(e, {
					VariableDeclaration: n,
					FunctionDeclaration: n,
					AssignmentExpression: function(e) {
						"=" == e.operator && n(e)
					},
					ObjectExpression: function(e) {
						for (var t = 0; t < e.properties.length; ++t)
							n(e.properties[t])
					},
					CallExpression: function(e) {
						s(e) && n(e)
					}
				})
			}
			function s(e) {
				return "MemberExpression" == e.callee.type && "Object" == e.callee.object.name && "defineProperty" == e.callee.property.name && e.arguments.length >= 3 && "string" == typeof e.arguments[1].value
			}
			function a(t, r) {
				v(t.sourceFile.text, r),
				o.simple(t, {
					VariableDeclaration: function(e, t) {
						e.commentsBefore && p(e, e.commentsBefore, t, t.getProp(e.declarations[0].id.name))
					},
					FunctionDeclaration: function(e, t) {
						e.commentsBefore && p(e, e.commentsBefore, t, t.getProp(e.id.name), e.body.scope.fnType)
					},
					AssignmentExpression: function(t, r) {
						t.commentsBefore && p(t, t.commentsBefore, r, e.expressionType({
							node: t.left,
							state: r
						}))
					},
					ObjectExpression: function(e, t) {
						for (var r, n = 0; n < e.properties.length; ++n)
							r = e.properties[n],
							r.commentsBefore && p(r, r.commentsBefore, t, e.objType.getProp(r.key.name))
					},
					CallExpression: function(t, r) {
						var n, o;
						t.commentsBefore && s(t) && (n = e.expressionType({
							node: t.arguments[0],
							state: r
						}).getObjType(),
						n && n instanceof e.Obj && (o = n.props[t.arguments[1].value],
						o && p(t, t.commentsBefore, r, o)))
					}
				}, e.searchVisitor, r)
			}
			function l(t) {
				var r, n = t["!typedef"], o = e.cx(), i = t["!name"];
				if (n)
					for (r in n)
						o.parent.jsdocTypedefs[r] = g(e.def.parse(n[r], i, r), r)
			}
			function c(e) {
				for (var t, r, n, o, i = 1; i < e.length; i++)
					if (r = e[i],
					n = r.match(/^[\s\*]*/)[0],
					n != r)
						if (null  == t)
							t = n;
						else {
							for (o = 0; o < t.length && t.charCodeAt(o) == n.charCodeAt(o); )
								++o;
							o < t.length && (t = t.slice(0, o))
						}
				for (e = e.map(function(e, r) {
					var n, o;
					if (e = e.replace(/\s+$/, ""),
					0 == r && null  != t)
						for (n = 0; n < t.length; n++)
							if (o = e.indexOf(t.slice(n)),
							0 == o)
								return e.slice(t.length - n);
					return null  == t || 0 == r ? e.replace(/^[\s\*]*/, "") : e.length < t.length ? "" : e.slice(t.length)
				}); e.length && !e[e.length - 1]; )
					e.pop();
				for (; e.length && !e[0]; )
					e.shift();
				return e
			}
			function p(t, r, n, o, i) {
				var s, a, l;
				for (b(t, n, o, r),
				s = e.cx(),
				!i && o instanceof e.AVal && o.types.length && (i = o.types[o.types.length - 1],
				i instanceof e.Obj && i.origin == s.curOrigin && !i.doc || (i = null )),
				a = r.length - 1; a >= 0; a--)
					if (l = c(r[a].split(/\r\n?|\n/)).join("\n")) {
						o instanceof e.AVal && (o.doc = l),
						i && (i.doc = l);
						break
					}
			}
			function h(e, t) {
				for (; /\s/.test(e.charAt(t)); )
					++t;
				return t
			}
			function d(e) {
				if (!n.isIdentifierStart(e.charCodeAt(0)))
					return !1;
				for (var t = 1; t < e.length; t++)
					if (!n.isIdentifierChar(e.charCodeAt(t)))
						return !1;
				return !0
			}
			function u(e, t, r, n) {
				for (var o, i, s, a, l = [], c = [], p = !1, u = !0; r = h(t, r),
				!u || t.charAt(r) != n; u = !1) {
					if (o = t.indexOf(":", r),
					0 > o || (i = t.slice(r, o),
					!d(i)) || (l.push(i),
					r = o + 1,
					s = f(e, t, r),
					!s))
						return null ;
					if (r = s.end,
					p = p || s.madeUp,
					c.push(s.type),
					r = h(t, r),
					a = t.charAt(r),
					++r,
					a == n)
						break;
					if ("," != a)
						return null 
				}
				return {
					labels: l,
					types: c,
					end: r,
					madeUp: p
				}
			}
			function f(t, r, n) {
				for (var o, i, s, a = !1, l = !1; ; ) {
					if (i = m(t, r, n),
					!i)
						return null ;
					if (l = l || i.madeUp,
					a ? i.type.propagate(a) : o = i.type,
					n = h(r, i.end),
					"|" != r.charAt(n))
						break;
					n++,
					a || (a = new e.AVal,
					o.propagate(a),
					o = a)
				}
				return s = !1,
				"=" == r.charAt(n) && (++n,
				s = !0),
				{
					type: o,
					end: n,
					isOptional: s,
					madeUp: l
				}
			}
			function m(t, r, o) {
				var i, s, a, l, c, p, d, m, y, b, v, w, S, x;
				if (o = h(r, o),
				s = !1,
				r.indexOf("function(", o) == o) {
					if (a = u(t, r, o + 9, ")"),
					l = e.ANull,
					!a)
						return null ;
					if (o = h(r, a.end),
					":" == r.charAt(o)) {
						if (++o,
						c = f(t, r, o + 1),
						!c)
							return null ;
						o = c.end,
						l = c.type,
						s = c.madeUp
					}
					i = new e.Fn(null ,e.ANull,a.types,a.labels,l)
				} else if ("[" == r.charAt(o)) {
					if (v = f(t, r, o + 1),
					!v || (o = h(r, v.end),
					s = v.madeUp,
					"]" != r.charAt(o)))
						return null ;
					++o,
					i = new e.Arr(v.type)
				} else if ("{" == r.charAt(o)) {
					if (p = u(t, r, o + 1, "}"),
					!p)
						return null ;
					for (i = new e.Obj(!0),
					d = 0; d < p.types.length; ++d)
						m = i.defProp(p.labels[d]),
						m.initializer = !0,
						p.types[d].propagate(m);
					o = p.end,
					s = p.madeUp
				} else if ("(" == r.charAt(o)) {
					if (v = f(t, r, o + 1),
					!v || (o = h(r, v.end),
					")" != r.charAt(o)))
						return null ;
					++o,
					i = v.type
				} else {
					if (y = o,
					!n.isIdentifierStart(r.charCodeAt(o)))
						return null ;
					for (; n.isIdentifierChar(r.charCodeAt(o)); )
						++o;
					if (y == o)
						return null ;
					if (b = r.slice(y, o),
					/^(number|integer)$/i.test(b))
						i = e.cx().num;
					else if (/^bool(ean)?$/i.test(b))
						i = e.cx().bool;
					else if (/^string$/i.test(b))
						i = e.cx().str;
					else if (/^(null|undefined)$/i.test(b))
						i = e.ANull;
					else if (/^array$/i.test(b)) {
						if (v = null ,
						"." == r.charAt(o) && "<" == r.charAt(o + 1)) {
							if (w = f(t, r, o + 2),
							!w || (o = h(r, w.end),
							s = w.madeUp,
							">" != r.charAt(o++)))
								return null ;
							v = w.type
						}
						i = new e.Arr(v)
					} else if (/^object$/i.test(b)) {
						if (i = new e.Obj(!0),
						"." == r.charAt(o) && "<" == r.charAt(o + 1)) {
							if (S = f(t, r, o + 2),
							!S || (o = h(r, S.end),
							s = s || S.madeUp,
							"," != r.charAt(o++)) || (x = f(t, r, o),
							!x) || (o = h(r, x.end),
							s = S.madeUp || x.madeUp,
							">" != r.charAt(o++)))
								return null ;
							x.type.propagate(i.defProp("<i>"))
						}
					} else {
						for (; 46 == r.charCodeAt(o) || n.isIdentifierChar(r.charCodeAt(o)); )
							++o;
						var T, O = r.slice(y, o), j = e.cx(), E = j.parent && j.parent.jsdocTypedefs;
						E && O in E ? i = E[O] : (T = e.def.parsePath(O, t).getObjType()) ? i = g(T, O) : (j.jsdocPlaceholders || (j.jsdocPlaceholders = Object.create(null )),
						i = O in j.jsdocPlaceholders ? j.jsdocPlaceholders[O] : j.jsdocPlaceholders[O] = new e.Obj(null ,O),
						s = !0)
					}
				}
				return {
					type: i,
					end: o,
					madeUp: s
				}
			}
			function g(t, r) {
				if (t instanceof e.Fn && /^[A-Z]/.test(r)) {
					var n = t.getProp("prototype").getObjType();
					if (n instanceof e.Obj)
						return e.getInstance(n)
				}
				return t
			}
			function y(e, t, r) {
				var n, o;
				return r = h(t, r || 0),
				"{" != t.charAt(r) ? null  : (n = f(e, t, r + 1),
				n ? (o = h(t, n.end),
				"}" != t.charAt(o) ? null  : (n.end = o + 1,
				n)) : null )
			}
			function b(e, t, r, n) {
				for (var o, i, s, a, l, c, p, h, d, u, m, g = 0; g < n.length; ++g)
					for (o = n[g],
					i = /(?:\n|$|\*)\s*@(type|param|arg(?:ument)?|returns?|this)\s+(.*)/g; s = i.exec(o); )
						if ("this" == s[1] && (m = f(t, s[2], 0)))
							u = m,
							d = !0;
						else if (m = y(t, s[2]))
							switch (d = !0,
							s[1]) {
							case "returns":
							case "return":
								h = m;
								break;
							case "type":
								c = m;
								break;
							case "param":
							case "arg":
							case "argument":
								if (a = s[2].slice(m.end).match(/^\s*(\[?)\s*([^\]\s=]+)\s*(?:=[^\]]+\s*)?(\]?).*/),
								!a)
									continue;l = a[2] + (m.isOptional || "[" === a[1] && "]" === a[3] ? "?" : ""),
								(p || (p = Object.create(null )))[l] = m
							}
				d && S(c, u, p, h, e, r)
			}
			function v(t, r) {
				for (var n, o, i, s = e.cx(), a = /\s@typedef\s+(.*)/g; n = a.exec(t); )
					o = y(r, n[1]),
					i = o && n[1].slice(o.end).match(/^\s*(\S+)/),
					i && (s.parent.jsdocTypedefs[i[1]] = o.type)
			}
			function w(t, r) {
				var n = e.cx().parent._docComment.weight;
				t.type.propagate(r, n || (t.madeUp ? x : void 0))
			}
			function S(t, r, n, o, i, s) {
				var a, l, c, p, h;
				if ("VariableDeclaration" == i.type ? (l = i.declarations[0],
				l.init && "FunctionExpression" == l.init.type && (a = l.init.body.scope.fnType)) : "FunctionDeclaration" == i.type ? a = i.body.scope.fnType : "AssignmentExpression" == i.type ? "FunctionExpression" == i.right.type && (a = i.right.body.scope.fnType) : "CallExpression" == i.type || "FunctionExpression" == i.value.type && (a = i.value.body.scope.fnType),
				a && (n || o || r)) {
					if (n)
						for (c = 0; c < a.argNames.length; ++c)
							p = a.argNames[c],
							h = n[p],
							!h && (h = n[p + "?"]) && (a.argNames[c] += "?"),
							h && w(h, a.args[c]);
					o && (a.retval == e.ANull && (a.retval = new e.AVal),
					w(o, a.retval)),
					r && w(r, a.self)
				} else
					t && w(t, s)
			}
			var x = 1
			, T = 101;
			t.registerPlugin("doc_comment", function(e, t) {
				return e.jsdocTypedefs = Object.create(null ),
				e.on("reset", function() {
					e.jsdocTypedefs = Object.create(null )
				}),
				e._docComment = {
					weight: t && t.strong ? T : void 0,
					fullDocs: t && t.fullDocs
				},
				{
					passes: {
						postParse: i,
						postInfer: a,
						postLoadDef: l
					}
				}
			})
		}),
		function(e, t) {
			return "object" == typeof exports && "object" == typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : void t((e.tern || (e.tern = {})).signal = {})
		}(this, function(e) {
			function t(e, t) {
				var r = this._handlers || (this._handlers = Object.create(null ));
				(r[e] || (r[e] = [])).push(t)
			}
			function r(e, t) {
				var r, n = this._handlers && this._handlers[e];
				if (n)
					for (r = 0; r < n.length; ++r)
						if (n[r] == t) {
							n.splice(r, 1);
							break
						}
			}
			function n(e, t, r, n, o) {
				var i, s = this._handlers && this._handlers[e];
				if (s)
					for (i = 0; i < s.length; ++i)
						s[i].call(this, t, r, n, o)
			}
			e.mixin = function(e) {
				return e.on = t,
				e.off = r,
				e.signal = n,
				e
			}
		}),
		function (e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			function t(e, t, n, o) {
				var i = e.getLineHandle(t.line)
				, l = t.ch - 1
				, c = l >= 0 && a[i.text.charAt(l)] || a[i.text.charAt(++l)];
				if (!c)
					return null ;
				var p = ">" == c.charAt(1) ? 1 : -1;
				if (n && p > 0 != (l == t.ch))
					return null ;
				var h = e.getTokenTypeAt(s(t.line, l + 1))
				, d = r(e, s(t.line, l + (p > 0 ? 1 : 0)), p, h || null , o);
				return null  == d ? null  : {
					from: s(t.line, l),
					to: d && d.pos,
					match: d && d.ch == c.charAt(0),
					forward: p > 0
				}
			}
			function r(e, t, r, n, o) {
				for (var i = o && o.maxScanLineLength || 1e4, l = o && o.maxScanLines || 1e3, c = [], p = o && o.bracketRegex ? o.bracketRegex : /[(){}[\]]/, h = r > 0 ? Math.min(t.line + l, e.lastLine() + 1) : Math.max(e.firstLine() - 1, t.line - l), d = t.line; d != h; d += r) {
					var u = e.getLine(d);
					if (u) {
						var f = r > 0 ? 0 : u.length - 1
						, m = r > 0 ? u.length : -1;
						if (!(u.length > i))
							for (d == t.line && (f = t.ch - (0 > r ? 1 : 0)); f != m; f += r) {
								var g = u.charAt(f);
								if (p.test(g) && (void 0 === n || e.getTokenTypeAt(s(d, f + 1)) == n)) {
									var y = a[g];
									if (">" == y.charAt(1) == r > 0)
										c.push(g);
									else {
										if (!c.length)
											return {
												pos: s(d, f),
												ch: g
											};
										c.pop()
									}
								}
							}
					}
				}
				return d - r == (r > 0 ? e.lastLine() : e.firstLine()) ? !1 : null 
			}
			function n(e, r, n) {
				for (var o = e.state.matchBrackets.maxHighlightLineLength || 1e3, a = [], l = e.listSelections(), c = 0; c < l.length; c++) {
					var p = l[c].empty() && t(e, l[c].head, !1, n);
					if (p && e.getLine(p.from.line).length <= o) {
						var h = p.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
						a.push(e.markText(p.from, s(p.from.line, p.from.ch + 1), {
							className: h
						})),
						p.to && e.getLine(p.to.line).length <= o && a.push(e.markText(p.to, s(p.to.line, p.to.ch + 1), {
							className: h
						}))
					}
				}
				if (a.length) {
					i && e.state.focused && e.focus();
					var d = function() {
						e.operation(function() {
							for (var e = 0; e < a.length; e++)
								a[e].clear()
						})
					}
					;
					if (!r)
						return d;
					setTimeout(d, 800)
				}
			}
			function o(e) {
				e.operation(function() {
					l && (l(),
					l = null ),
					l = n(e, !1, e.state.matchBrackets)
				})
			}
			var i = /MSIE \d/.test(navigator.userAgent) && (null  == document.documentMode || document.documentMode < 8)
			, s = e.Pos
			, a = {
				"(": ")>",
				")": "(<",
				"[": "]>",
				"]": "[<",
				"{": "}>",
				"}": "{<"
			}
			, l = null ;
			e.defineOption("matchBrackets", !1, function(t, r, n) {
				n && n != e.Init && t.off("cursorActivity", o),
				r && (t.state.matchBrackets = "object" == typeof r ? r : {},
				t.on("cursorActivity", o))
			}),
			e.defineExtension("matchBrackets", function() {
				n(this, !0)
			}),
			e.defineExtension("findMatchingBracket", function(e, r, n) {
				return t(this, e, r, n)
			}),
			e.defineExtension("scanForBracket", function(e, t, n, o) {
				return r(this, e, t, n, o)
			})
		}),
		function(e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			"use strict";
			function t(e, t) {
				return "string" == typeof e ? e = new RegExp(e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),t ? "gi" : "g") : e.global || (e = new RegExp(e.source,e.ignoreCase ? "gi" : "g")),
				{
					token: function(t) {
						e.lastIndex = t.pos;
						var r = e.exec(t.string);
						return r && r.index == t.pos ? (t.pos += r[0].length,
						"searching") : void (r ? t.pos = r.index : t.skipToEnd())
					}
				}
			}
			function r() {
				this.posFrom = this.posTo = this.lastQuery = this.query = null ,
				this.overlay = null 
			}
			function n(e) {
				return e.state.search || (e.state.search = new r)
			}
			function o(e) {
				return "string" == typeof e && e == e.toLowerCase()
			}
			function i(e, t, r) {
				return e.getSearchCursor(t, r, o(t))
			}
			function s(e, t, r, n) {
				e.openDialog(t, n, {
					value: r,
					selectValueOnOpen: !0,
					closeOnEnter: !1,
					onClose: function() {
						u(e)
					}
				})
			}
			function a(e, t, r, n, o) {
				e.openDialog ? e.openDialog(t, o, {
					value: n,
					selectValueOnOpen: !0
				}) : o(prompt(r, n))
			}
			function l(e, t, r, n) {
				e.openConfirm ? e.openConfirm(t, n) : confirm(r) && n[0]()
			}
			function c(e) {
				var t = e.match(/^\/(.*)\/([a-z]*)$/);
				if (t)
					try {
						e = new RegExp(t[1],-1 == t[2].indexOf("i") ? "" : "i")
					} catch (r) {}
				return ("string" == typeof e ? "" == e : e.test("")) && (e = /x^/),
				e
			}
			function p(e, r, n) {
				r.queryText = n,
				r.query = c(n),
				e.removeOverlay(r.overlay, o(r.query)),
				r.overlay = t(r.query, o(r.query)),
				e.addOverlay(r.overlay),
				e.showMatchesOnScrollbar && (r.annotate && (r.annotate.clear(),
				r.annotate = null ),
				r.annotate = e.showMatchesOnScrollbar(r.query, o(r.query)))
			}
			function h(t, r) {
				var o = n(t);
				if (o.query)
					return d(t, r);
				var a = t.getSelection() || o.lastQuery;
				s(t, m, a, function(r, n, s, a) {
					if (e.e_stop(n),
					a) {
						if (a.clear)
							u(t);
						else if (a.reverse)
							d(t, !0);
						else if (a.replaceOne) {
							var l = a.replaceString
							, c = i(t, r, t.getCursor())
							, h = function(e) {
								c.replace("string" == typeof r ? l : l.replace(/\$(\d)/g, function(t, r) {
									return e[r]
								})),
								d(t, a.reverseReplace)
							}
							, f = function() {
								var e = t.getSelection(c.from(), c.to());
								e !== r && (d(t, !1),
								c.findNext(),
								t.getSelection(c.from(), c.to()),
								c = i(t, r, t.getCursor()),
								e = t.getSelection(c.from(), c.to())),
								c.findNext(),
								c.findPrevious(),
								t.getSelection(c.from(), c.to()),
								t.scrollIntoView({
									from: c.from(),
									to: c.to()
								}),
								r && (l = l || "",
								h(!1))
							}
							;
							f()
						} else if (a.replaceAll) {
							var l = a.replaceString;
							t.operation(function() {
								for (var e = i(t, r); e.findNext(); )
									if ("string" != typeof r) {
										var n = t.getRange(e.from(), e.to()).match(r);
										e.replace(l.replace(/\$(\d)/g, function(e, t) {
											return n[t]
										}))
									} else
										e.replace(l)
							})
						}
					} else {
						if (!r)
							return;
						r != o.queryText && p(t, o, r),
						s && d(t, n.shiftKey)
					}
				})
			}
			function d(t, r) {
				t.operation(function() {
					var o = n(t)
					, s = i(t, o.query, r ? o.posFrom : o.posTo);
					(s.find(r) || (s = i(t, o.query, r ? e.Pos(t.lastLine()) : e.Pos(t.firstLine(), 0)),
					s.find(r))) && (t.setSelection(s.from(), s.to()),
					t.scrollIntoView({
						from: s.from(),
						to: s.to()
					}, 20),
					o.posFrom = s.from(),
					o.posTo = s.to())
				})
			}
			function u(e) {
				e.operation(function() {
					var t = n(e);
					t.lastQuery = t.query,
					t.query && (t.query = t.queryText = null ,
					e.removeOverlay(t.overlay),
					t.annotate && (t.annotate.clear(),
					t.annotate = null ))
				})
			}
			function f(e, t) {
				if (!e.getOption("readOnly")) {
					var r = e.getSelection() || n(e).lastQuery;
					a(e, g, "Replace:", r, function(r) {
						r && (r = c(r),
						a(e, y, "Replace with:", "", function(n) {
							if (t)
								e.operation(function() {
									for (var t = i(e, r); t.findNext(); )
										if ("string" != typeof r) {
											var o = e.getRange(t.from(), t.to()).match(r);
											t.replace(n.replace(/\$(\d)/g, function(e, t) {
												return o[t]
											}))
										} else
											t.replace(n)
								});
							else {
								u(e);
								var o = i(e, r, e.getCursor())
								, s = function() {
									var t, n = o.from();
									!(t = o.findNext()) && (o = i(e, r),
									!(t = o.findNext()) || n && o.from().line == n.line && o.from().ch == n.ch) || (e.setSelection(o.from(), o.to()),
									e.scrollIntoView({
										from: o.from(),
										to: o.to()
									}),
									l(e, b, "Replace?", [function() {
										a(t)
									}
									, s]))
								}
								, a = function(e) {
									o.replace("string" == typeof r ? n : n.replace(/\$(\d)/g, function(t, r) {
										return e[r]
									})),
									s()
								}
								;
								s()
							}
						}))
					})
				}
			}
			var m = 'Search: <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint">(Use /re/ syntax for regexp search)</span>'
			, g = 'Replace: <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint">(Use /re/ syntax for regexp search)</span>'
			, y = 'With: <input type="text" style="width: 10em" class="CodeMirror-search-field"/>'
			, b = "Replace? <button>Yes</button> <button>No</button> <button>Stop</button>";
			e.commands.find = function(e) {
				u(e),
				console.log(e),
				h(e)
			}
			,
			e.commands.findPersistent = function(e) {
				u(e),
				h(e, !1, !0)
			}
			,
			e.commands.findNext = h,
			e.commands.findPrev = function(e) {
				h(e, !0)
			}
			,
			e.commands.clearSearch = u,
			e.commands.replace = f,
			e.commands.replaceAll = function(e) {
				f(e, !0)
			}
		}),
		function(e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			"use strict";
			function t(e, t, o, i) {
				if (this.atOccurrence = !1,
				this.doc = e,
				null  == i && "string" == typeof t && (i = !1),
				o = o ? e.clipPos(o) : n(0, 0),
				this.pos = {
					from: o,
					to: o
				},
				"string" != typeof t)
					t.global || (t = new RegExp(t.source,t.ignoreCase ? "ig" : "g")),
					this.matches = function(r, o) {
						if (r) {
							t.lastIndex = 0;
							for (var i, s, a = e.getLine(o.line).slice(0, o.ch), l = 0; ; ) {
								t.lastIndex = l;
								var c = t.exec(a);
								if (!c)
									break;
								if (i = c,
								s = i.index,
								l = i.index + (i[0].length || 1),
								l == a.length)
									break
							}
							var p = i && i[0].length || 0;
							p || (0 == s && 0 == a.length ? i = void 0 : s != e.getLine(o.line).length && p++)
						} else {
							t.lastIndex = o.ch;
							var a = e.getLine(o.line)
							, i = t.exec(a)
							, p = i && i[0].length || 0
							, s = i && i.index;
							s + p == a.length || p || (p = 1)
						}
						return i && p ? {
							from: n(o.line, s),
							to: n(o.line, s + p),
							match: i
						} : void 0
					}
					;
				else {
					var s = t;
					i && (t = t.toLowerCase());
					var a = i ? function(e) {
						return e.toLowerCase()
					}
					: function(e) {
						return e
					}
					, l = t.split("\n");
					if (1 == l.length)
						this.matches = t.length ? function(o, i) {
							if (o) {
								var l = e.getLine(i.line).slice(0, i.ch)
								, c = a(l)
								, p = c.lastIndexOf(t);
								if (p > -1)
									return p = r(l, c, p),
									{
										from: n(i.line, p),
										to: n(i.line, p + s.length)
									}
							} else {
								var l = e.getLine(i.line).slice(i.ch)
								, c = a(l)
								, p = c.indexOf(t);
								if (p > -1)
									return p = r(l, c, p) + i.ch,
									{
										from: n(i.line, p),
										to: n(i.line, p + s.length)
									}
							}
						}
						: function() {}
						;
					else {
						var c = s.split("\n");
						this.matches = function(t, r) {
							var o = l.length - 1;
							if (t) {
								if (r.line - (l.length - 1) < e.firstLine())
									return;
								if (a(e.getLine(r.line).slice(0, c[o].length)) != l[l.length - 1])
									return;
								for (var i = n(r.line, c[o].length), s = r.line - 1, p = o - 1; p >= 1; --p,
								--s)
									if (l[p] != a(e.getLine(s)))
										return;
								var h = e.getLine(s)
								, d = h.length - c[0].length;
								if (a(h.slice(d)) != l[0])
									return;
								return {
									from: n(s, d),
									to: i
								}
							}
							if (!(r.line + (l.length - 1) > e.lastLine())) {
								var h = e.getLine(r.line)
								, d = h.length - c[0].length;
								if (a(h.slice(d)) == l[0]) {
									for (var u = n(r.line, d), s = r.line + 1, p = 1; o > p; ++p,
									++s)
										if (l[p] != a(e.getLine(s)))
											return;
									if (a(e.getLine(s).slice(0, c[o].length)) == l[o])
										return {
											from: u,
											to: n(s, c[o].length)
										}
								}
							}
						}
					}
				}
			}
			function r(e, t, r) {
				if (e.length == t.length)
					return r;
				for (var n = Math.min(r, e.length); ; ) {
					var o = e.slice(0, n).toLowerCase().length;
					if (r > o)
						++n;
					else {
						if (!(o > r))
							return n;
						--n
					}
				}
			}
			var n = e.Pos;
			t.prototype = {
				findNext: function() {
					return this.find(!1)
				},
				findPrevious: function() {
					return this.find(!0)
				},
				find: function(e) {
					function t(e) {
						var t = n(e, 0);
						return r.pos = {
							from: t,
							to: t
						},
						r.atOccurrence = !1,
						!1
					}
					for (var r = this, o = this.doc.clipPos(e ? this.pos.from : this.pos.to); ; ) {
						if (this.pos = this.matches(e, o))
							return this.atOccurrence = !0,
							this.pos.match || !0;
						if (e) {
							if (!o.line)
								return t(0);
							o = n(o.line - 1, this.doc.getLine(o.line - 1).length)
						} else {
							var i = this.doc.lineCount();
							if (o.line == i - 1)
								return t(i);
							o = n(o.line + 1, 0)
						}
					}
				},
				from: function() {
					return this.atOccurrence ? this.pos.from : void 0
				},
				to: function() {
					return this.atOccurrence ? this.pos.to : void 0
				},
				replace: function(t, r) {
					if (this.atOccurrence) {
						var o = e.splitLines(t);
						this.doc.replaceRange(o, this.pos.from, this.pos.to, r),
						this.pos.to = n(this.pos.from.line + o.length - 1, o[o.length - 1].length + (1 == o.length ? this.pos.from.ch : 0))
					}
				}
			},
			e.defineExtension("getSearchCursor", function(e, r, n) {
				return new t(this.doc,e,r,n)
			}),
			e.defineDocExtension("getSearchCursor", function(e, r, n) {
				return new t(this,e,r,n)
			}),
			e.defineExtension("selectMatches", function(t, r) {
				for (var n = [], o = this.getSearchCursor(t, this.getCursor("from"), r); o.findNext() && !(e.cmpPos(o.to(), this.getCursor("to")) > 0); )
					n.push({
						anchor: o.from(),
						head: o.to()
					});
				n.length && this.setSelections(n, 0)
			})
		}),
		function(e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			"use strict";
			function t(t, r, n) {
				function o(t) {
					var r = e.wheelEventPixels(t)["horizontal" == i.orientation ? "x" : "y"]
					, n = i.pos;
					i.moveTo(i.pos + r),
					i.pos != n && e.e_preventDefault(t)
				}
				this.orientation = r,
				this.scroll = n,
				this.screen = this.total = this.size = 1,
				this.pos = 0,
				this.node = document.createElement("div"),
				this.node.className = t + "-" + r,
				this.inner = this.node.appendChild(document.createElement("div"));
				var i = this;
				e.on(this.inner, "mousedown", function(t) {
					function r() {
						e.off(document, "mousemove", n),
						e.off(document, "mouseup", r)
					}
					function n(e) {
						return 1 != e.which ? r() : void i.moveTo(a + (e[o] - s) * (i.total / i.size))
					}
					if (1 == t.which) {
						e.e_preventDefault(t);
						var o = "horizontal" == i.orientation ? "pageX" : "pageY"
						, s = t[o]
						, a = i.pos;
						e.on(document, "mousemove", n),
						e.on(document, "mouseup", r)
					}
				}),
				e.on(this.node, "click", function(t) {
					e.e_preventDefault(t);
					var r, n = i.inner.getBoundingClientRect();
					r = "horizontal" == i.orientation ? t.clientX < n.left ? -1 : t.clientX > n.right ? 1 : 0 : t.clientY < n.top ? -1 : t.clientY > n.bottom ? 1 : 0,
					i.moveTo(i.pos + r * i.screen)
				}),
				e.on(this.node, "mousewheel", o),
				e.on(this.node, "DOMMouseScroll", o)
			}
			function r(e, r, n) {
				this.addClass = e,
				this.horiz = new t(e,"horizontal",n),
				r(this.horiz.node),
				this.vert = new t(e,"vertical",n),
				r(this.vert.node),
				this.width = null 
			}
			t.prototype.moveTo = function(e, t) {
				0 > e && (e = 0),
				e > this.total - this.screen && (e = this.total - this.screen),
				e != this.pos && (this.pos = e,
				this.inner.style["horizontal" == this.orientation ? "left" : "top"] = e * (this.size / this.total) + "px",
				t !== !1 && this.scroll(e, this.orientation))
			}
			;
			var n = 10;
			t.prototype.update = function(e, t, r) {
				this.screen = t,
				this.total = e,
				this.size = r;
				var o = this.screen * (this.size / this.total);
				n > o && (this.size -= n - o,
				o = n),
				this.inner.style["horizontal" == this.orientation ? "width" : "height"] = o + "px",
				this.inner.style["horizontal" == this.orientation ? "left" : "top"] = this.pos * (this.size / this.total) + "px"
			}
			,
			r.prototype.update = function(e) {
				if (null  == this.width) {
					var t = window.getComputedStyle ? window.getComputedStyle(this.horiz.node) : this.horiz.node.currentStyle;
					t && (this.width = parseInt(t.height))
				}
				var r = this.width || 0
				, n = e.scrollWidth > e.clientWidth + 1
				, o = e.scrollHeight > e.clientHeight + 1;
				return this.vert.node.style.display = o ? "block" : "none",
				this.horiz.node.style.display = n ? "block" : "none",
				o && (this.vert.update(e.scrollHeight, e.clientHeight, e.viewHeight - (n ? r : 0)),
				this.vert.node.style.display = "block",
				this.vert.node.style.bottom = n ? r + "px" : "0"),
				n && (this.horiz.update(e.scrollWidth, e.clientWidth, e.viewWidth - (o ? r : 0) - e.barLeft),
				this.horiz.node.style.right = o ? r + "px" : "0",
				this.horiz.node.style.left = e.barLeft + "px"),
				{
					right: o ? r : 0,
					bottom: n ? r : 0
				}
			}
			,
			r.prototype.setScrollTop = function(e) {
				this.vert.moveTo(e, !1)
			}
			,
			r.prototype.setScrollLeft = function(e) {
				this.horiz.moveTo(e, !1)
			}
			,
			r.prototype.clear = function() {
				var e = this.horiz.node.parentNode;
				e.removeChild(this.horiz.node),
				e.removeChild(this.vert.node)
			}
			,
			e.scrollbarModel.simple = function(e, t) {
				return new r("CodeMirror-simplescroll",e,t)
			}
			,
			e.scrollbarModel.overlay = function(e, t) {
				return new r("CodeMirror-overlayscroll",e,t)
			}
		}),
		function(e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			"use strict";
			function t(e, t) {
				function r(e) {
					clearTimeout(n.doRedraw),
					n.doRedraw = setTimeout(function() {
						n.redraw()
					}, e)
				}
				this.cm = e,
				this.options = t,
				this.buttonHeight = t.scrollButtonHeight || e.getOption("scrollButtonHeight"),
				this.annotations = [],
				this.doRedraw = this.doUpdate = null ,
				this.div = e.getWrapperElement().appendChild(document.createElement("div")),
				this.div.style.cssText = "position: absolute; right: 0; top: 0; z-index: 7; pointer-events: none",
				this.computeScale();
				var n = this;
				e.on("refresh", this.resizeHandler = function() {
					clearTimeout(n.doUpdate),
					n.doUpdate = setTimeout(function() {
						n.computeScale() && r(20)
					}, 100)
				}
				),
				e.on("markerAdded", this.resizeHandler),
				e.on("markerCleared", this.resizeHandler),
				t.listenForChanges !== !1 && e.on("change", this.changeHandler = function() {
					r(250)
				}
				)
			}
			e.defineExtension("annotateScrollbar", function(e) {
				return "string" == typeof e && (e = {
					className: e
				}),
				new t(this,e)
			}),
			e.defineOption("scrollButtonHeight", 0),
			t.prototype.computeScale = function() {
				var e = this.cm
				, t = (e.getWrapperElement().clientHeight - e.display.barHeight - 2 * this.buttonHeight) / e.heightAtLine(e.lastLine() + 1, "local");
				return t != this.hScale ? (this.hScale = t,
				!0) : void 0
			}
			,
			t.prototype.update = function(e) {
				this.annotations = e,
				this.redraw()
			}
			,
			t.prototype.redraw = function(e) {
				function t(e, t) {
					if (l != e.line && (l = e.line,
					c = r.getLineHandle(l)),
					s && c.height > a)
						return r.charCoords(e, "local")[t ? "top" : "bottom"];
					var n = r.heightAtLine(c, "local");
					return n + (t ? 0 : c.height)
				}
				e !== !1 && this.computeScale();
				var r = this.cm
				, n = this.hScale
				, o = document.createDocumentFragment()
				, i = this.annotations
				, s = r.getOption("lineWrapping")
				, a = s && 1.5 * r.defaultTextHeight()
				, l = null 
				, c = null ;
				if (r.display.barWidth)
					for (var p, h = 0; h < i.length; h++) {
						for (var d = i[h], u = p || t(d.from, !0) * n, f = t(d.to, !1) * n; h < i.length - 1 && (p = t(i[h + 1].from, !0) * n,
						!(p > f + .9)); )
							d = i[++h],
							f = t(d.to, !1) * n;
						if (f != u) {
							var m = Math.max(f - u, 3)
							, g = o.appendChild(document.createElement("div"));
							g.style.cssText = "position: absolute; right: 0px; width: " + Math.max(r.display.barWidth - 1, 2) + "px; top: " + (u + this.buttonHeight) + "px; height: " + m + "px",
							g.className = this.options.className
						}
					}
				this.div.textContent = "",
				this.div.appendChild(o)
			}
			,
			t.prototype.clear = function() {
				this.cm.off("refresh", this.resizeHandler),
				this.cm.off("markerAdded", this.resizeHandler),
				this.cm.off("markerCleared", this.resizeHandler),
				this.changeHandler && this.cm.off("change", this.changeHandler),
				this.div.parentNode.removeChild(this.div)
			}
		}),
		function(e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			"use strict";
			function t(e, t, r, n) {
				this.cm = e,
				this.options = n;
				var o = {
					listenForChanges: !1
				};
				for (var i in n)
					o[i] = n[i];
				o.className || (o.className = "CodeMirror-search-match"),
				this.annotation = e.annotateScrollbar(o),
				this.query = t,
				this.caseFold = r,
				this.gap = {
					from: e.firstLine(),
					to: e.lastLine() + 1
				},
				this.matches = [],
				this.update = null ,
				this.findMatches(),
				this.annotation.update(this.matches);
				var s = this;
				e.on("change", this.changeHandler = function(e, t) {
					s.onChange(t)
				}
				)
			}
			function r(e, t, r) {
				return t >= e ? e : Math.max(t, e + r)
			}
			e.defineExtension("showMatchesOnScrollbar", function(e, r, n) {
				return "string" == typeof n && (n = {
					className: n
				}),
				n || (n = {}),
				new t(this,e,r,n)
			});
			var n = 1e3;
			t.prototype.findMatches = function() {
				if (this.gap) {
					for (var t = 0; t < this.matches.length; t++) {
						var r = this.matches[t];
						if (r.from.line >= this.gap.to)
							break;
						r.to.line >= this.gap.from && this.matches.splice(t--, 1)
					}
					for (var o = this.cm.getSearchCursor(this.query, e.Pos(this.gap.from, 0), this.caseFold), i = this.options && this.options.maxMatches || n; o.findNext(); ) {
						var r = {
							from: o.from(),
							to: o.to()
						};
						if (r.from.line >= this.gap.to)
							break;
						if (this.matches.splice(t++, 0, r),
						this.matches.length > i)
							break
					}
					this.gap = null 
				}
			}
			,
			t.prototype.onChange = function(t) {
				var n = t.from.line
				, o = e.changeEnd(t).line
				, i = o - t.to.line;
				if (this.gap ? (this.gap.from = Math.min(r(this.gap.from, n, i), t.from.line),
				this.gap.to = Math.max(r(this.gap.to, n, i), t.from.line)) : this.gap = {
					from: t.from.line,
					to: o + 1
				},
				i)
					for (var s = 0; s < this.matches.length; s++) {
						var a = this.matches[s]
						, l = r(a.from.line, n, i);
						l != a.from.line && (a.from = e.Pos(l, a.from.ch));
						var c = r(a.to.line, n, i);
						c != a.to.line && (a.to = e.Pos(c, a.to.ch))
					}
				clearTimeout(this.update);
				var p = this;
				this.update = setTimeout(function() {
					p.updateAfterChange()
				}, 250)
			}
			,
			t.prototype.updateAfterChange = function() {
				this.findMatches(),
				this.annotation.update(this.matches)
			}
			,
			t.prototype.clear = function() {
				this.cm.off("change", this.changeHandler),
				this.annotation.clear()
			}
		}),
		function(e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			function t() {
				m.style.transform = "rotate(90deg)",
				M.reverse()
			}
			function r() {
				m.style.transform = "rotate(-90deg)",
				M.reverse()
			}
			function n() {
				h ? r() : t(),
				h = !h
			}
			function o() {
				null  === d.parentNode.parentNode && ($(d).appendTo(window.scriptEdit.editor.display.wrapper)),
				h && (M.reverse(),
				h = !1),
				setTimeout(function() {
					d.style.display = "block",
					R.play(),
					m.style.transform = "rotate(-90deg)"
				}, 250)
			}
			function i() {
				h ? k.play() : A.play(),
				setTimeout(function() {
					window.scriptEdit.editor.focus(),
					p("", {}, !1, {
						clear: !0
					})
				}, 250)
			}
			function s(e) {
				setTimeout(function() {
					p(g.value, e, 13 === e.keyCode)
				}, 0)
			}
			function a(e) {
				switch (e.keyCode) {
				case 27:
					i()
				}
			}
			function l(e) {
				switch (e.keyCode) {
				case 13:
					p(g.value, e, !1, {
						replaceString: T.value,
						replaceOne: !0,
						reverseReplace: e.shiftKey
					})
				}
			}
			function c() {
				null  === d.parentNode.parentNode && ($(d).appendTo(scriptEdit.editor.display.wrapper)),
				h || (M.reverse(),
				h = !0),
				setTimeout(function() {
					d.style.display = "block",
					D.play(),
					m.style.transform = "rotate(90deg)"
				}, 250)
			}
			function createElement(tag, elClass, attributes, content) {
				var el = document.createElement(tag);
				if (elClass) {
				el.classList.add(elClass);
				}
				if (attributes) {
					for (var attrKey in attributes) {
						el.setAttribute(attrKey, attributes[attrKey]);
					}
				}
				if (content) {
					if (typeof content === 'string') {
						el.innerHTML = content;
					} else {
						for (var i = 0; i < content.length; i++) {
							el.appendChild(content[i]);
						}	
					}
				}
				return el;
			}
			var u, f, m, g, y, b, v, w, S, x, T, O, j, E;
			var d = createElement('div', 'codeMirrorSearchDialog', {
				style: 'display: none;'
			}, [
				(u = createElement('div', 'codeMirrorSearchDialogSearchCont', null, [
					(f = createElement('div', 'codeMirrorSearchDialogArrow', null, [
						(m = createElement('svg', null, {
							width: '20',
							height: '20',
							xmlns: 'http://www.w3.org/2000/svg',
							viewBox: '0 0 48 48'
						}, [
							createElement('path', null, {
								d: 'M16 10v28l22-14z'
							})
						]))
					])),
					(g = createElement('paper-input', null, {
						'no-label-float': '',
						label: 'find'
					})),
					(y = createElement('div', 'codeMirrorSearchDialogButtons', null, [
						(b = createElement('paper-button', null, {
							raised: ''
						}, 'next')),
						( v = createElement('paper-button', null, {
							raised: ''
						}, 'previous'))
					])),
					(w = createElement('div', 'codeMirrorCloseDialogButtonCont', null, [
						(S = createElement('paper-icon-button', 'codeMirrorCloseDialogButton', {
							icon: 'close'
						}, [
							createElement('svg', null, {
								viewBox: '0 0 24 24',
								width: '24',
								height: '24',
								xmlns: 'http://www.w3.org/2000/svg'
							}, [
								createElement('path', null, {
									d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
								}), 
								createElement('path', null, {
									d: 'M0 0h24v24H0z',
									fill: 'none'
								})]
							)]))
					]))
				])),
				(x = createElement('div', 'codeMirrorSearchDialogReplaceCont', null, [
					(T = createElement('div', null, {
						'no-label-float': '',
						label: "replace'"
					})),
					(O = createElement('div', 'codeMirrorSearchDialogReplaceButtons', null, [
						(j = createElement('paper-button', null, {
							raised: ''
						}, 'replace')),
						(E = createElement('paper-button', null, {
							raised: ''
						}, 'replace all'))
					]))
				]))
			]);
			
			var p, h = !1;
			
			window.searchDialog = d;
			var M = d.animate([{
				marginBottom: 0
			}, {
				marginBottom: "-45px"
			}], {
				duration: 250
			});
			M.onfinish = function() {
				d.style.marginBottom = h ? 0 : "-45px"
			}
			;
			var k = d.animate([{
				marginBottom: 0
			}, {
				marginBottom: "-85px"
			}], {
				duration: 250
			});
			k.onfinish = function() {
				d.style.marginBottom = "-85px",
				d.style.display = "none"
			}
			;
			var A = d.animate([{
				marginBottom: "-45px"
			}, {
				marginBottom: "-85px"
			}], {
				duration: 250
			});
			A.onfinish = function() {
				d.style.marginBottom = "-85px",
				d.style.display = "none"
			}
			;
			var R = d.animate([{
				marginBottom: "-85px"
			}, {
				marginBottom: "-45px"
			}], {
				duration: 250
			});
			R.onfinish = function() {
				d.style.marginBottom = "-45px"
			}
			;
			var D = d.animate([{
				marginBottom: "-85px"
			}, {
				marginBottom: 0
			}], {
				duration: 250
			});
			D.onfinish = function() {
				d.style.marginBottom = 0
			}
			,
			d.style.marginBottom = "-45px",
			m.addEventListener("click", n),
			S.addEventListener("click", i),
			g.addEventListener("keydown", s),
			g.addEventListener("keyup", a),
			T.addEventListener("keyup", l),
			b.addEventListener("click", function() {
				p(g.value, {}, !0)
			}),
			v.addEventListener("click", function() {
				p(g.value, {}, !0, {
					reverse: !0
				})
			}),
			j.addEventListener("click", function(e) {
				p(g.value, {}, !1, {
					replaceString: T.value,
					replaceOne: !0,
					reverseReplace: e.shiftKey
				})
			}),
			E.addEventListener("click", function() {
				p(g.value, {}, !1, {
					replaceString: T.value,
					replaceAll: !0
				})
			});
			var z;
			e.defineExtension("openDialog", function(e, t) {
				p = t,
				g.value = "",
				e.indexOf("Replace") > -1 ? c() : o(),
				z || (z = $(g).find("input")[0],
				z.setAttribute("tabindex", "1"),
				$(T).find("input")[0].setAttribute("tabindex", "1")),
				setTimeout(function() {
					z.focus()
				}, 250)
			})
		});
	!function (e) {
		var fn = function (cm) {
			e(cm, window.diff_match_patch);
		}
		"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror, window.diff_match_patch) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(fn) : window.codeMirrorToLoad.toLoad = [fn] : window.codeMirrorToLoad = { toLoad: [fn] };
		}(function(e, t) {
			"use strict";
			function r(e, t) {
				this.mv = e,
				this.type = t,
				this.classes = "left" == t ? {
					chunk: "CodeMirror-merge-l-chunk",
					start: "CodeMirror-merge-l-chunk-start",
					end: "CodeMirror-merge-l-chunk-end",
					insert: "CodeMirror-merge-l-inserted",
					del: "CodeMirror-merge-l-deleted",
					connect: "CodeMirror-merge-l-connect"
				} : {
					chunk: "CodeMirror-merge-r-chunk",
					start: "CodeMirror-merge-r-chunk-start",
					end: "CodeMirror-merge-r-chunk-end",
					insert: "CodeMirror-merge-r-inserted",
					del: "CodeMirror-merge-r-deleted",
					connect: "CodeMirror-merge-r-connect"
				}
			}
			function i(t) {
				t.diffOutOfDate && (t.diff = w(t.orig.getValue(), t.edit.getValue()),
				t.chunks = y(t.diff),
				t.diffOutOfDate = !1,
				e.signal(t.edit, "updateDiff", t.diff))
			}
			function o(e) {
				function t(t) {
					j = !0,
					h = !1,
					"full" == t && (e.svg && N(e.svg),
					e.copyButtons && N(e.copyButtons),
					c(e.edit, a.marked, e.classes),
					c(e.orig, s.marked, e.classes),
					a.from = a.to = s.from = s.to = 0),
					i(e),
					e.showDifferences && (f(e.edit, e.diff, a, DIFF_INSERT, e.classes),
					f(e.orig, e.diff, s, DIFF_DELETE, e.classes)),
					d(e),
					"align" == e.mv.options.connect && v(e),
					j = !1
				}
				function r(t) {
					j || (e.dealigned = !0,
					o(t))
				}
				function o(e) {
					j || h || (clearTimeout(l),
					e === !0 && (h = !0),
					l = setTimeout(t, e === !0 ? 20 : 250))
				}
				function n(t, i) {
					e.diffOutOfDate || (e.diffOutOfDate = !0,
					a.from = a.to = s.from = s.to = 0),
					r(i.text.length - 1 != i.to.line - i.from.line)
				}
				var l, a = {
					from: 0,
					to: 0,
					marked: []
				}, s = {
					from: 0,
					to: 0,
					marked: []
				}, h = !1;
				return e.edit.on("change", n),
				e.orig.on("change", n),
				e.edit.on("markerAdded", r),
				e.edit.on("markerCleared", r),
				e.orig.on("markerAdded", r),
				e.orig.on("markerCleared", r),
				e.edit.on("viewportChange", function() {
					o(!1)
				}),
				e.orig.on("viewportChange", function() {
					o(!1)
				}),
				t(),
				t
			}
			function n(e) {
				e.edit.on("scroll", function() {
					l(e, DIFF_INSERT) && d(e)
				}),
				e.orig.on("scroll", function() {
					l(e, DIFF_DELETE) && d(e)
				})
			}
			function l(e, t) {
				if (e.diffOutOfDate)
					return !1;
				if (!e.lockScroll)
					return !0;
				var r, i, o = +new Date;
				if (t == DIFF_INSERT ? (r = e.edit,
				i = e.orig) : (r = e.orig,
				i = e.edit),
				r.state.scrollSetBy == e && (r.state.scrollSetAt || 0) + 50 > o)
					return !1;
				var n = r.getScrollInfo();
				if ("align" == e.mv.options.connect)
					m = n.top;
				else {
					var l, s, c = .5 * n.clientHeight, f = n.top + c, h = r.lineAtHeight(f, "local"), d = L(e.chunks, h, t == DIFF_INSERT), u = a(r, t == DIFF_INSERT ? d.edit : d.orig), g = a(i, t == DIFF_INSERT ? d.orig : d.edit), v = (f - u.top) / (u.bot - u.top), m = g.top - c + v * (g.bot - g.top);
					if (m > n.top && (s = n.top / c) < 1)
						m = m * s + n.top * (1 - s);
					else if ((l = n.height - n.clientHeight - n.top) < c) {
						var p = i.getScrollInfo()
						, k = p.height - p.clientHeight - m;
						k > l && (s = l / c) < 1 && (m = m * s + (p.height - p.clientHeight - l) * (1 - s))
					}
				}
				return i.scrollTo(n.left, m),
				i.state.scrollSetAt = o,
				i.state.scrollSetBy = e,
				!0
			}
			function a(e, t) {
				var r = t.after;
				return null  == r && (r = e.lastLine() + 1),
				{
					top: e.heightAtLine(t.before || 0, "local"),
					bot: e.heightAtLine(r, "local")
				}
			}
			function s(e, t, r) {
				e.lockScroll = t,
				t && 0 != r && l(e, DIFF_INSERT) && d(e),
				e.lockButton.innerHTML = t ? "⇛⇚" : "⇛&nbsp;&nbsp;⇚"
			}
			function c(t, r, i) {
				for (var o = 0; o < r.length; ++o) {
					var n = r[o];
					n instanceof e.TextMarker ? n.clear() : n.parent && (t.removeLineClass(n, "background", i.chunk),
					t.removeLineClass(n, "background", i.start),
					t.removeLineClass(n, "background", i.end))
				}
				r.length = 0
			}
			function f(e, t, r, i, o) {
				var n = e.getViewport();
				e.operation(function() {
					r.from == r.to || n.from - r.to > 20 || r.from - n.to > 20 ? (c(e, r.marked, o),
					h(e, t, i, r.marked, n.from, n.to, o),
					r.from = n.from,
					r.to = n.to) : (n.from < r.from && (h(e, t, i, r.marked, n.from, r.from, o),
					r.from = n.from),
					n.to > r.to && (h(e, t, i, r.marked, r.to, n.to, o),
					r.to = n.to))
				})
			}
			function h(e, t, r, i, o, n, l) {
				function a(t, r) {
					for (var a = Math.max(o, t), s = Math.min(n, r), c = a; s > c; ++c) {
						var f = e.addLineClass(c, "background", l.chunk);
						c == t && e.addLineClass(f, "background", l.start),
						c == r - 1 && e.addLineClass(f, "background", l.end),
						i.push(f)
					}
					t == r && a == r && s == r && i.push(a ? e.addLineClass(a - 1, "background", l.end) : e.addLineClass(a, "background", l.start))
				}
				for (var s = W(0, 0), c = W(o, 0), f = e.clipPos(W(n - 1)), h = r == DIFF_DELETE ? l.del : l.insert, d = 0, u = 0; u < t.length; ++u) {
					var g = t[u]
					, v = g[0]
					, m = g[1];
					if (v == DIFF_EQUAL) {
						var p = s.line + (M(t, u) ? 0 : 1);
						x(s, m);
						var k = s.line + (D(t, u) ? 1 : 0);
						k > p && (u && a(d, p),
						d = k)
					} else if (v == r) {
						var C = x(s, m, !0)
						, T = R(c, s)
						, F = B(f, C);
						V(T, F) || i.push(e.markText(T, F, {
							className: h
						})),
						s = C
					}
				}
				d <= s.line && a(d, s.line + 1)
			}
			function d(e) {
				if (e.showDifferences) {
					if (e.svg) {
						N(e.svg);
						var t = e.gap.offsetWidth;
						_(e.svg, "width", t, "height", e.gap.offsetHeight)
					}
					e.copyButtons && N(e.copyButtons);
					for (var r = e.edit.getViewport(), i = e.orig.getViewport(), o = e.edit.getScrollInfo().top, n = e.orig.getScrollInfo().top, l = 0; l < e.chunks.length; l++) {
						var a = e.chunks[l];
						a.editFrom <= r.to && a.editTo >= r.from && a.origFrom <= i.to && a.origTo >= i.from && k(e, a, n, o, t)
					}
				}
			}
			function u(e, t) {
				for (var r = 0, i = 0, o = 0; o < t.length; o++) {
					var n = t[o];
					if (n.editTo > e && n.editFrom <= e)
						return null ;
					if (n.editFrom > e)
						break;
					r = n.editTo,
					i = n.origTo
				}
				return i + (e - r)
			}
			function g(e, t) {
				for (var r = [], i = 0; i < e.chunks.length; i++) {
					var o = e.chunks[i];
					r.push([o.origTo, o.editTo, t ? u(o.editTo, t.chunks) : null ])
				}
				if (t)
					for (var i = 0; i < t.chunks.length; i++) {
						for (var o = t.chunks[i], n = 0; n < r.length; n++) {
							var l = r[n];
							if (l[1] == o.editTo) {
								n = -1;
								break
							}
							if (l[1] > o.editTo)
								break
						}
						n > -1 && r.splice(n - 1, 0, [u(o.editTo, e.chunks), o.editTo, o.origTo])
					}
				return r
			}
			function v(e, t) {
				if (e.dealigned || t) {
					if (!e.orig.curOp)
						return e.orig.operation(function() {
							v(e, t)
						});
					e.dealigned = !1;
					var r = e.mv.left == e ? e.mv.right : e.mv.left;
					r && (i(r),
					r.dealigned = !1);
					for (var o = g(e, r), n = e.mv.aligners, l = 0; l < n.length; l++)
						n[l].clear();
					n.length = 0;
					var a = [e.orig, e.edit]
					, s = [];
					r && a.push(r.orig);
					for (var l = 0; l < a.length; l++)
						s.push(a[l].getScrollInfo().top);
					for (var c = 0; c < o.length; c++)
						m(a, o[c], n);
					for (var l = 0; l < a.length; l++)
						a[l].scrollTo(null , s[l])
				}
			}
			function m(e, t, r) {
				for (var i = 0, o = [], n = 0; n < e.length; n++)
					if (null  != t[n]) {
						var l = e[n].heightAtLine(t[n], "local");
						o[n] = l,
						i = Math.max(i, l)
					}
				for (var n = 0; n < e.length; n++)
					if (null  != t[n]) {
						var a = i - o[n];
						a > 1 && r.push(p(e[n], t[n], a))
					}
			}
			function p(e, t, r) {
				var i = !0;
				t > e.lastLine() && (t--,
				i = !1);
				var o = document.createElement("div");
				return o.className = "CodeMirror-merge-spacer",
				o.style.height = r + "px",
				o.style.minWidth = "1px",
				e.addLineWidget(t, o, {
					height: r,
					above: i
				})
			}
			function k(e, t, r, i, o) {
				var n = "left" == e.type
				, l = e.orig.heightAtLine(t.origFrom, "local") - r;
				if (e.svg) {
					var a = l
					, s = e.edit.heightAtLine(t.editFrom, "local") - i;
					if (n) {
						var c = a;
						a = s,
						s = c
					}
					var f = e.orig.heightAtLine(t.origTo, "local") - r
					, h = e.edit.heightAtLine(t.editTo, "local") - i;
					if (n) {
						var c = f;
						f = h,
						h = c
					}
					var d = " C " + o / 2 + " " + s + " " + o / 2 + " " + a + " " + (o + 2) + " " + a
					, u = " C " + o / 2 + " " + f + " " + o / 2 + " " + h + " -1 " + h;
					_(e.svg.appendChild(document.createElementNS(z, "path")), "d", "M -1 " + s + d + " L " + (o + 2) + " " + f + u + " z", "class", e.classes.connect)
				}
				if (e.copyButtons) {
					var g = e.copyButtons.appendChild(O("div", "left" == e.type ? "⇝" : "⇜", "CodeMirror-merge-copy"))
					, v = e.mv.options.allowEditingOriginals;
					if (g.title = v ? "Push to left" : "Revert chunk",
					g.chunk = t,
					g.style.top = l + "px",
					v) {
						var m = e.orig.heightAtLine(t.editFrom, "local") - i
						, p = e.copyButtons.appendChild(O("div", "right" == e.type ? "⇝" : "⇜", "CodeMirror-merge-copy-reverse"));
						p.title = "Push to right",
						p.chunk = {
							editFrom: t.origFrom,
							editTo: t.origTo,
							origFrom: t.editFrom,
							origTo: t.editTo
						},
						p.style.top = m + "px",
						"right" == e.type ? p.style.left = "2px" : p.style.right = "2px"
					}
				}
			}
			function C(e, t, r, i) {
				e.diffOutOfDate || t.replaceRange(r.getRange(W(i.origFrom, 0), W(i.origTo, 0)), W(i.editFrom, 0), W(i.editTo, 0))
			}
			function T(t) {
				var r = t.lockButton = O("div", null , "CodeMirror-merge-scrolllock");
				r.title = "Toggle locked scrolling";
				var i = O("div", [r], "CodeMirror-merge-scrolllock-wrap");
				e.on(r, "click", function() {
					s(t, !t.lockScroll)
				});
				var o = [i];
				if (t.mv.options.revertButtons !== !1 && (t.copyButtons = O("div", null , "CodeMirror-merge-copybuttons-" + t.type),
				e.on(t.copyButtons, "click", function(e) {
					var r = e.target || e.srcElement;
					if (r.chunk)
						return "CodeMirror-merge-copy-reverse" == r.className ? void C(t, t.orig, t.edit, r.chunk) : void C(t, t.edit, t.orig, r.chunk)
				}),
				o.unshift(t.copyButtons)),
				"align" != t.mv.options.connect) {
					var n = document.createElementNS && document.createElementNS(z, "svg");
					n && !n.createSVGRect && (n = null ),
					t.svg = n,
					n && o.push(n)
				}
				return t.gap = O("div", o, "CodeMirror-merge-gap")
			}
			function F(e) {
				return "string" == typeof e ? e : e.getValue()
			}
			function w(e, t) {
				var r = Q.diff_main(e, t);
				Q.diff_cleanupSemantic(r);
				for (var i = 0; i < r.length; ++i) {
					var o = r[i];
					o[1] ? i && r[i - 1][0] == o[0] && (r.splice(i--, 1),
					r[i][1] += o[1]) : r.splice(i--, 1)
				}
				return r
			}
			function y(e) {
				for (var t = [], r = 0, i = 0, o = W(0, 0), n = W(0, 0), l = 0; l < e.length; ++l) {
					var a = e[l]
					, s = a[0];
					if (s == DIFF_EQUAL) {
						var c = M(e, l) ? 0 : 1
						, f = o.line + c
						, h = n.line + c;
						x(o, a[1], null , n);
						var d = D(e, l) ? 1 : 0
						, u = o.line + d
						, g = n.line + d;
						u > f && (l && t.push({
							origFrom: i,
							origTo: h,
							editFrom: r,
							editTo: f
						}),
						r = u,
						i = g)
					} else
						x(s == DIFF_INSERT ? o : n, a[1])
				}
				return (r <= o.line || i <= n.line) && t.push({
					origFrom: i,
					origTo: n.line + 1,
					editFrom: r,
					editTo: o.line + 1
				}),
				t
			}
			function D(e, t) {
				if (t == e.length - 1)
					return !0;
				var r = e[t + 1][1];
				return 1 == r.length || 10 != r.charCodeAt(0) ? !1 : t == e.length - 2 ? !0 : (r = e[t + 2][1],
				r.length > 1 && 10 == r.charCodeAt(0))
			}
			function M(e, t) {
				if (0 == t)
					return !0;
				var r = e[t - 1][1];
				return 10 != r.charCodeAt(r.length - 1) ? !1 : 1 == t ? !0 : (r = e[t - 2][1],
				10 == r.charCodeAt(r.length - 1))
			}
			function L(e, t, r) {
				for (var i, o, n, l, a = 0; a < e.length; a++) {
					var s = e[a]
					, c = r ? s.editFrom : s.origFrom
					, f = r ? s.editTo : s.origTo;
					null  == o && (c > t ? (o = s.editFrom,
					l = s.origFrom) : f > t && (o = s.editTo,
					l = s.origTo)),
					t >= f ? (i = s.editTo,
					n = s.origTo) : t >= c && (i = s.editFrom,
					n = s.origFrom)
				}
				return {
					edit: {
						before: i,
						after: o
					},
					orig: {
						before: n,
						after: l
					}
				}
			}
			function I(e, t, r) {
				function i() {
					n.clear(),
					e.removeLineClass(t, "wrap", "CodeMirror-merge-collapsed-line")
				}
				e.addLineClass(t, "wrap", "CodeMirror-merge-collapsed-line");
				var o = document.createElement("span");
				o.className = "CodeMirror-merge-collapsed-widget",
				o.title = "Identical text collapsed. Click to expand.";
				var n = e.markText(W(t, 0), W(r - 1), {
					inclusiveLeft: !0,
					inclusiveRight: !0,
					replacedWith: o,
					clearOnEnter: !0
				});
				return o.addEventListener("click", i),
				{
					mark: n,
					clear: i
				}
			}
			function b(e, t) {
				function r() {
					for (var e = 0; e < i.length; e++)
						i[e].clear()
				}
				for (var i = [], o = 0; o < t.length; o++) {
					var n = t[o]
					, l = I(n.cm, n.line, n.line + e);
					i.push(l),
					l.mark.on("clear", r)
				}
				return i[0].mark
			}
			function E(e, t, r, i) {
				for (var o = 0; o < e.chunks.length; o++)
					for (var n = e.chunks[o], l = n.editFrom - t; l < n.editTo + t; l++) {
						var a = l + r;
						a >= 0 && a < i.length && (i[a] = !1)
					}
			}
			function S(e, t) {
				"number" != typeof t && (t = 2);
				for (var r = [], i = e.editor(), o = i.firstLine(), n = o, l = i.lastLine(); l >= n; n++)
					r.push(!0);
				e.left && E(e.left, t, o, r),
				e.right && E(e.right, t, o, r);
				for (var a = 0; a < r.length; a++)
					if (r[a]) {
						for (var s = a + o, c = 1; a < r.length - 1 && r[a + 1]; a++,
						c++)
							;
						if (c > t) {
							var f = [{
								line: s,
								cm: i
							}];
							e.left && f.push({
								line: u(s, e.left.chunks),
								cm: e.left.orig
							}),
							e.right && f.push({
								line: u(s, e.right.chunks),
								cm: e.right.orig
							});
							var h = b(c, f);
							e.options.onCollapse && e.options.onCollapse(e, s, c, h)
						}
					}
			}
			function O(e, t, r, i) {
				var o = document.createElement(e);
				if (r && (o.className = r),
				i && (o.style.cssText = i),
				"string" == typeof t)
					o.appendChild(document.createTextNode(t));
				else if (t)
					for (var n = 0; n < t.length; ++n)
						o.appendChild(t[n]);
				return o
			}
			function N(e) {
				for (var t = e.childNodes.length; t > 0; --t)
					e.removeChild(e.firstChild)
			}
			function _(e) {
				for (var t = 1; t < arguments.length; t += 2)
					e.setAttribute(arguments[t], arguments[t + 1])
			}
			function A(e, t) {
				t || (t = {});
				for (var r in e)
					e.hasOwnProperty(r) && (t[r] = e[r]);
				return t
			}
			function x(e, t, r, i) {
				for (var o = r ? W(e.line, e.ch) : e, n = 0; ; ) {
					var l = t.indexOf("\n", n);
					if (-1 == l)
						break;
					++o.line,
					i && ++i.line,
					n = l + 1
				}
				return o.ch = (n ? 0 : o.ch) + (t.length - n),
				i && (i.ch = (n ? 0 : i.ch) + (t.length - n)),
				o
			}
			function B(e, t) {
				return (e.line - t.line || e.ch - t.ch) < 0 ? e : t
			}
			function R(e, t) {
				return (e.line - t.line || e.ch - t.ch) > 0 ? e : t
			}
			function V(e, t) {
				return e.line == t.line && e.ch == t.ch
			}
			function H(e, t, r) {
				for (var i = e.length - 1; i >= 0; i--) {
					var o = e[i]
					, n = (r ? o.origTo : o.editTo) - 1;
					if (t > n)
						return n
				}
			}
			function P(e, t, r) {
				for (var i = 0; i < e.length; i++) {
					var o = e[i]
					, n = r ? o.origFrom : o.editFrom;
					if (n > t)
						return n
				}
			}
			function U(t, r) {
				var o = null 
				, n = t.state.diffViews
				, l = t.getCursor().line;
				if (n)
					for (var a = 0; a < n.length; a++) {
						var s = n[a]
						, c = t == s.orig;
						i(s);
						var f = 0 > r ? H(s.chunks, l, c) : P(s.chunks, l, c);
						null  == f || null  != o && !(0 > r ? f > o : o > f) || (o = f)
					}
				return null  == o ? e.Pass : void t.setCursor(o, 0)
			}
			var W = e.Pos
			, z = "http://www.w3.org/2000/svg";
			r.prototype = {
				constructor: r,
				init: function(t, r, i) {
					this.edit = this.mv.edit,
					(this.edit.state.diffViews || (this.edit.state.diffViews = [])).push(this),
					this.orig = e(t, A({
						value: r,
						readOnly: !this.mv.options.allowEditingOriginals
					}, A(i))),
					this.orig.state.diffViews = [this],
					this.diff = w(F(r), F(i.value)),
					this.chunks = y(this.diff),
					this.diffOutOfDate = this.dealigned = !1,
					this.showDifferences = i.showDifferences !== !1,
					this.forceUpdate = o(this),
					s(this, !0, !1),
					n(this)
				},
				setShowDifferences: function(e) {
					e = e !== !1,
					e != this.showDifferences && (this.showDifferences = e,
					this.forceUpdate("full"))
				}
			};
			var j = !1
			, q = e.MergeView = function(t, i) {
				if (!(this instanceof q))
					return new q(t,i);
				this.options = i;
				var o = i.origLeft
				, n = null  == i.origRight ? i.orig : i.origRight
				, l = null  != o
				, a = null  != n
				, s = 1 + (l ? 1 : 0) + (a ? 1 : 0)
				, c = []
				, f = this.left = null 
				, h = this.right = null 
				, u = this;
				if (l) {
					f = this.left = new r(this,"left");
					var g = O("div", null , "CodeMirror-merge-pane");
					c.push(g),
					c.push(T(f))
				}
				var m = O("div", null , "CodeMirror-merge-pane");
				if (c.push(m),
				a) {
					h = this.right = new r(this,"right"),
					c.push(T(h));
					var p = O("div", null , "CodeMirror-merge-pane");
					c.push(p)
				}
				(a ? p : m).className += " CodeMirror-merge-pane-rightmost",
				c.push(O("div", null , null , "height: 0; clear: both;"));
				var k = this.wrap = t.appendChild(O("div", c, "CodeMirror-merge CodeMirror-merge-" + s + "pane"));
				this.edit = e(m, A(i)),
				f && f.init(g, o, i),
				h && h.init(p, n, i),
				i.collapseIdentical && (j = !0,
				this.editor().operation(function() {
					S(u, i.collapseIdentical)
				}),
				j = !1),
				"align" == i.connect && (this.aligners = [],
				v(this.left || this.right, !0));
				var C = function() {
					f && d(f),
					h && d(h)
				}
				;
				e.on(window, "resize", C);
				var F = setInterval(function() {
					for (var t = k.parentNode; t && t != document.body; t = t.parentNode)
						;
					t || (clearInterval(F),
					e.off(window, "resize", C))
				}, 5e3)
			}
			;
			q.prototype = {
				constuctor: q,
				editor: function() {
					return this.edit
				},
				rightOriginal: function() {
					return this.right && this.right.orig
				},
				leftOriginal: function() {
					return this.left && this.left.orig
				},
				setShowDifferences: function(e) {
					this.right && this.right.setShowDifferences(e),
					this.left && this.left.setShowDifferences(e)
				},
				rightChunks: function() {
					return this.right ? (i(this.right),
					this.right.chunks) : void 0
				},
				leftChunks: function() {
					return this.left ? (i(this.left),
					this.left.chunks) : void 0
				}
			};
			var Q = new t;
			e.commands.goNextDiff = function(e) {
				return U(e, 1)
			}
			,
			e.commands.goPrevDiff = function(e) {
				return U(e, -1)
			}
		});
		!function(e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			"use strict";
			function n(e) {
				var n = "object" == typeof window.app.jsLintGlobals ? window.app.jsLintGlobals : [];
				n.push.apply(n, v);
				var o = jslint(e, {}, n)
				, t = o.warnings;
				return t
			}
			function o(n, o) {
				function t(n) {
					return a.parentNode ? (a.style.top = Math.max(0, n.clientY - a.offsetHeight - 5) + "px",
					void (a.style.left = n.clientX + 5 + "px")) : e.off(document, "mousemove", t)
				}
				var a = document.createElement("div");
				return a.className = "CodeMirror-lint-tooltip",
				a.appendChild(o.cloneNode(!0)),
				document.body.appendChild(a),
				e.on(document, "mousemove", t),
				t(n),
				null  != a.style.opacity && (a.style.opacity = 1),
				a
			}
			function t(e) {
				e.parentNode && e.parentNode.removeChild(e)
			}
			function a(e) {
				e.parentNode && (null  == e.style.opacity && t(e),
				e.style.opacity = 0,
				setTimeout(function() {
					t(e)
				}, 600))
			}
			function r(n, t, r) {
				function i() {
					e.off(r, "mouseout", i),
					s && (a(s),
					s = null )
				}
				var s = o(n, t)
				, l = setInterval(function() {
					if (s)
						for (var e = r; ; e = e.parentNode) {
							if (e && 11 == e.nodeType && (e = e.host),
							e == document.body)
								return;
							if (!e) {
								i();
								break
							}
						}
					return s ? void 0 : clearInterval(l)
				}, 400);
				e.on(r, "mouseout", i)
			}
			function i(e, n, o) {
				this.marked = [],
				this.options = n,
				this.timeout = null ,
				this.hasGutter = o,
				this.onMouseOver = function(n) {
					g(e, n)
				}
			}
			function s(e, n) {
				return n instanceof Function ? {
					getAnnotations: n
				} : (n && n !== !0 || (n = {}),
				n)
			}
			function l(e) {
				var n = e.state.lint;
				n.hasGutter && e.clearGutter(h);
				for (var o = 0; o < n.marked.length; ++o)
					n.marked[o].clear();
				n.marked.length = 0
			}
			function c(n, o, t, a) {
				var i = document.createElement("div")
				, s = i;
				return i.className = "CodeMirror-lint-marker-warning",
				t && (s = i.appendChild(document.createElement("div")),
				s.className = "CodeMirror-lint-marker-multiple"),
				0 != a && e.on(s, "mouseover", function(e) {
					r(e, n, s)
				}),
				i
			}
			function u(e) {
				for (var n = [], o = 0; o < e.length; ++o) {
					var t = e[o]
					, a = t.line;
					(n[a] || (n[a] = [])).push(t)
				}
				return n
			}
			function d(e) {
				var n = document.createElement("div");
				return n.className = "CodeMirror-lint-message-warning",
				n.appendChild(document.createTextNode(e.message)),
				n
			}
			function m(n) {
				var o = n.state.lint
				, t = o.options
				, a = t.options || t
				, r = t.getAnnotations || n.getHelper(e.Pos(0, 0), "lint");
				r && (t.async || r.async ? r(n.getValue(), p, a, n) : p(n, r(n.getValue(), a, n)))
			}
			function p(e, n) {
				l(e);
				for (var o = e.state.lint, t = o.options, a = u(n), r = 0; r < a.length; ++r) {
					var i = a[r];
					if (i) {
						for (var s = o.hasGutter && document.createDocumentFragment(), m = 0; m < i.length; ++m) {
							var p = i[m];
							t.formatAnnotation && (p = t.formatAnnotation(p)),
							o.hasGutter && s.appendChild(d(p)),
							p.to && o.marked.push(e.markText(p.from, p.to, {
								className: "CodeMirror-lint-mark-warning",
								__annotation: p
							}))
						}
						o.hasGutter && e.setGutterMarker(r, h, c(s, "warning", i.length > 1, o.options.tooltips))
					}
				}
				t.onUpdateLinting && t.onUpdateLinting(n, a, e)
			}
			function f(e, n) {
				var o = n.target || n.srcElement;
				r(n, d(e), o)
			}
			function g(e, n) {
				var o = n.target || n.srcElement;
				if (/\bCodeMirror-lint-mark-/.test(o.className))
					for (var t = o.getBoundingClientRect(), a = (t.left + t.right) / 2, r = (t.top + t.bottom) / 2, i = e.findMarksAt(e.coordsChar({
						left: a,
						top: r
					}, "client")), s = 0; s < i.length; ++s) {
						var l = i[s].__annotation;
						if (l)
							return f(l, n)
					}
			}
			function css(n) {
				for (var r = [], i = CSSLint.verify(n, CSSLint.getRules()).messages, t = 0; t < i.length; t++)
					r.push({
						code: i[t].rule.id,
						column: i[t].col,
						line: i[t].line,
						message: i[t].message,
						name: "JSLintError"
					});
				return r
			}
			var h = "CodeMirror-lint-markers"
			, v = ["chrome", "crmAPI", "$", "top", "location", "document", "window", "external", "chrome", "key", "items", "speechSynthesis", "caches", "localStorage", "sessionStorage", "webkitStorageInfo", "indexedDB", "webkitIndexedDB", "crypto", "applicationCache", "performance", "styleMedia", "defaultstatus", "defaultStatus", "screenTop", "screenLeft", "clientInformation", "console", "devicePixelRatio", "outerHeight", "outerWidth", "screenY", "screenX", "pageYOffset", "scrollY", "pageXOffset", "scrollX", "innerHeight", "innerWidth", "screen", "CSS", "navigator", "frameElement", "parent", "opener", "length", "frames", "closed", "status", "toolbar", "statusbar", "scrollbars", "personalbar", "menubar", "locationbar", "history", "name", "self", "ondeviceorientation", "ondevicemotion", "postMessage", "blur", "focus", "close", "onautocompleteerror", "onautocomplete", "onunload", "onstorage", "onpopstate", "onpageshow", "onpagehide", "ononline", "onoffline", "onmessage", "onlanguagechange", "onhashchange", "onbeforeunload", "onwaiting", "onvolumechange", "ontoggle", "ontimeupdate", "onsuspend", "onsubmit", "onstalled", "onshow", "onselect", "onseeking", "onseeked", "onscroll", "onresize", "onreset", "onratechange", "onprogress", "onplaying", "onplay", "onpause", "onmousewheel", "onmouseup", "onmouseover", "onmouseout", "onmousemove", "onmouseleave", "onmouseenter", "onmousedown", "onloadstart", "onloadedmetadata", "onloadeddata", "onload", "onkeyup", "onkeypress", "onkeydown", "oninvalid", "oninput", "onfocus", "onerror", "onended", "onemptied", "ondurationchange", "ondrop", "ondragstart", "ondragover", "ondragleave", "ondragenter", "ondragend", "ondrag", "ondblclick", "oncuechange", "oncontextmenu", "onclose", "onclick", "onchange", "oncanplaythrough", "oncanplay", "oncancel", "onblur", "onabort", "onwheel", "onwebkittransitionend", "onwebkitanimationstart", "onwebkitanimationiteration", "onwebkitanimationend", "ontransitionend", "onsearch", "onanimationstart", "onanimationiteration", "onanimationend", "stop", "open", "alert", "confirm", "prompt", "print", "requestAnimationFrame", "cancelAnimationFrame", "captureEvents", "releaseEvents", "getComputedStyle", "matchMedia", "moveTo", "moveBy", "resizeTo", "resizeBy", "getSelection", "find", "getMatchedCSSRules", "webkitRequestAnimationFrame", "webkitCancelAnimationFrame", "webkitCancelRequestAnimationFrame", "btoa", "atob", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "scroll", "scrollTo", "scrollBy", "TEMPORARY", "PERSISTENT", "fetch", "webkitRequestFileSystem", "webkitResolveLocalFileSystemURL", "openDatabase", "addEventListener", "removeEventListener", "dispatchEvent"];
			e.registerHelper("lint", "javascript", n);
			e.registerHelper("lint", "css", css),
			e.defineOption("lint", !1, function(n, o, t) {
				if (t && t != e.Init && (l(n),
				e.off(n.getWrapperElement(), "mouseover", n.state.lint.onMouseOver),
				clearTimeout(n.state.lint.timeout),
				delete n.state.lint),
				o) {
					for (var a = n.getOption("gutters"), r = !1, c = 0; c < a.length; ++c)
						a[c] == h && (r = !0);
					var u = n.state.lint = new i(n,s(n, o),r);
					0 != u.options.tooltips && e.on(n.getWrapperElement(), "mouseover", u.onMouseOver)
				}
			}),
			e.defineExtension("performLint", function() {
				this.state.lint && m(this)
			})
		});
		!function(e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			"use strict";
			function t(e) {
				for (var t = {}, r = 0; r < e.length; ++r)
					t[e[r]] = !0;
				return t
			}
			function r(e, t) {
				for (var r, o = !1; null  != (r = e.next()); ) {
					if (o && "/" == r) {
						t.tokenize = null ;
						break
					}
					o = "*" == r
				}
				return ["comment", "comment"]
			}
			e.defineMode("css", function(t, r) {
				function o(e, t) {
					return h = t,
					e
				}
				function a(e, t) {
					var r = e.next();
					if (f[r]) {
						var a = f[r](e, t);
						if (a !== !1)
							return a
					}
					return "@" == r ? (e.eatWhile(/[\w\\\-]/),
					o("def", e.current())) : "=" == r || ("~" == r || "|" == r) && e.eat("=") ? o(null , "compare") : '"' == r || "'" == r ? (t.tokenize = i(r),
					t.tokenize(e, t)) : "#" == r ? (e.eatWhile(/[\w\\\-]/),
					o("atom", "hash")) : "!" == r ? (e.match(/^\s*\w*/),
					o("keyword", "important")) : /\d/.test(r) || "." == r && e.eat(/\d/) ? (e.eatWhile(/[\w.%]/),
					o("number", "unit")) : "-" !== r ? /[,+>*\/]/.test(r) ? o(null , "select-op") : "." == r && e.match(/^-?[_a-z][_a-z0-9-]*/i) ? o("qualifier", "qualifier") : /[:;{}\[\]\(\)]/.test(r) ? o(null , r) : "u" == r && e.match(/rl(-prefix)?\(/) || "d" == r && e.match("omain(") || "r" == r && e.match("egexp(") ? (e.backUp(1),
					t.tokenize = n,
					o("property", "word")) : /[\w\\\-]/.test(r) ? (e.eatWhile(/[\w\\\-]/),
					o("property", "word")) : o(null , null ) : /[\d.]/.test(e.peek()) ? (e.eatWhile(/[\w.%]/),
					o("number", "unit")) : e.match(/^-[\w\\\-]+/) ? (e.eatWhile(/[\w\\\-]/),
					e.match(/^\s*:/, !1) ? o("variable-2", "variable-definition") : o("variable-2", "variable")) : e.match(/^\w+-/) ? o("meta", "meta") : void 0
				}
				function i(e) {
					return function(t, r) {
						for (var a, i = !1; null  != (a = t.next()); ) {
							if (a == e && !i) {
								")" == e && t.backUp(1);
								break
							}
							i = !i && "\\" == a
						}
						return (a == e || !i && ")" != e) && (r.tokenize = null ),
						o("string", "string")
					}
				}
				function n(e, t) {
					return e.next(),
					t.tokenize = e.match(/\s*[\"\')]/, !1) ? null  : i(")"),
					o(null , "(")
				}
				function l(e, t, r) {
					this.type = e,
					this.indent = t,
					this.prev = r
				}
				function s(e, t, r, o) {
					return e.context = new l(r,t.indentation() + (o === !1 ? 0 : g),e.context),
					r
				}
				function c(e) {
					return e.context.prev && (e.context = e.context.prev),
					e.context.type
				}
				function d(e, t, r) {
					return _[r.context.type](e, t, r)
				}
				function p(e, t, r, o) {
					for (var a = o || 1; a > 0; a--)
						r.context = r.context.prev;
					return d(e, t, r)
				}
				function u(e) {
					var t = e.current().toLowerCase();
					b = K.hasOwnProperty(t) ? "atom" : j.hasOwnProperty(t) ? "keyword" : "variable"
				}
				var m = r;
				r.propertyKeywords || (r = e.resolveMode("text/css")),
				r.inline = m.inline;
				var h, b, g = t.indentUnit, f = r.tokenHooks, y = r.documentTypes || {}, w = r.mediaTypes || {}, k = r.mediaFeatures || {}, v = r.mediaValueKeywords || {}, x = r.propertyKeywords || {}, z = r.nonStandardPropertyKeywords || {}, q = r.fontProperties || {}, P = r.counterDescriptors || {}, j = r.colorKeywords || {}, K = r.valueKeywords || {}, B = r.allowNested, T = r.supportsAtComponent === !0, _ = {};
				return _.top = function(e, t, r) {
					if ("{" == e)
						return s(r, t, "block");
					if ("}" == e && r.context.prev)
						return c(r);
					if (T && /@component/.test(e))
						return s(r, t, "atComponentBlock");
					if (/^@(-moz-)?document$/.test(e))
						return s(r, t, "documentTypes");
					if (/^@(media|supports|(-moz-)?document|import)$/.test(e))
						return s(r, t, "atBlock");
					if (/^@(font-face|counter-style)/.test(e))
						return r.stateArg = e,
						"restricted_atBlock_before";
					if (/^@(-(moz|ms|o|webkit)-)?keyframes$/.test(e))
						return "keyframes";
					if (e && "@" == e.charAt(0))
						return s(r, t, "at");
					if ("hash" == e)
						b = "builtin";
					else if ("word" == e)
						b = "tag";
					else {
						if ("variable-definition" == e)
							return "maybeprop";
						if ("interpolation" == e)
							return s(r, t, "interpolation");
						if (":" == e)
							return "pseudo";
						if (B && "(" == e)
							return s(r, t, "parens")
					}
					return r.context.type
				}
				,
				_.block = function(e, t, r) {
					if ("word" == e) {
						var o = t.current().toLowerCase();
						return x.hasOwnProperty(o) ? (b = "property",
						"maybeprop") : z.hasOwnProperty(o) ? (b = "string-2",
						"maybeprop") : B ? (b = t.match(/^\s*:(?:\s|$)/, !1) ? "property" : "tag",
						"block") : (b += " error",
						"maybeprop")
					}
					return "meta" == e ? "block" : B || "hash" != e && "qualifier" != e ? _.top(e, t, r) : (b = "error",
					"block")
				}
				,
				_.maybeprop = function(e, t, r) {
					return ":" == e ? s(r, t, "prop") : d(e, t, r)
				}
				,
				_.prop = function(e, t, r) {
					if (";" == e)
						return c(r);
					if ("{" == e && B)
						return s(r, t, "propBlock");
					if ("}" == e || "{" == e)
						return p(e, t, r);
					if ("(" == e)
						return s(r, t, "parens");
					if ("hash" != e || /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/.test(t.current())) {
						if ("word" == e)
							u(t);
						else if ("interpolation" == e)
							return s(r, t, "interpolation")
					} else
						b += " error";
					return "prop"
				}
				,
				_.propBlock = function(e, t, r) {
					return "}" == e ? c(r) : "word" == e ? (b = "property",
					"maybeprop") : r.context.type
				}
				,
				_.parens = function(e, t, r) {
					return "{" == e || "}" == e ? p(e, t, r) : ")" == e ? c(r) : "(" == e ? s(r, t, "parens") : "interpolation" == e ? s(r, t, "interpolation") : ("word" == e && u(t),
					"parens")
				}
				,
				_.pseudo = function(e, t, r) {
					return "word" == e ? (b = "variable-3",
					r.context.type) : d(e, t, r)
				}
				,
				_.documentTypes = function(e, t, r) {
					return "word" == e && y.hasOwnProperty(t.current()) ? (b = "tag",
					r.context.type) : _.atBlock(e, t, r)
				}
				,
				_.atBlock = function(e, t, r) {
					if ("(" == e)
						return s(r, t, "atBlock_parens");
					if ("}" == e || ";" == e)
						return p(e, t, r);
					if ("{" == e)
						return c(r) && s(r, t, B ? "block" : "top");
					if ("word" == e) {
						var o = t.current().toLowerCase();
						b = "only" == o || "not" == o || "and" == o || "or" == o ? "keyword" : w.hasOwnProperty(o) ? "attribute" : k.hasOwnProperty(o) ? "property" : v.hasOwnProperty(o) ? "keyword" : x.hasOwnProperty(o) ? "property" : z.hasOwnProperty(o) ? "string-2" : K.hasOwnProperty(o) ? "atom" : j.hasOwnProperty(o) ? "keyword" : "error"
					}
					return r.context.type
				}
				,
				_.atComponentBlock = function(e, t, r) {
					return "}" == e ? p(e, t, r) : "{" == e ? c(r) && s(r, t, B ? "block" : "top", !1) : ("word" == e && (b = "error"),
					r.context.type)
				}
				,
				_.atBlock_parens = function(e, t, r) {
					return ")" == e ? c(r) : "{" == e || "}" == e ? p(e, t, r, 2) : _.atBlock(e, t, r)
				}
				,
				_.restricted_atBlock_before = function(e, t, r) {
					return "{" == e ? s(r, t, "restricted_atBlock") : "word" == e && "@counter-style" == r.stateArg ? (b = "variable",
					"restricted_atBlock_before") : d(e, t, r)
				}
				,
				_.restricted_atBlock = function(e, t, r) {
					return "}" == e ? (r.stateArg = null ,
					c(r)) : "word" == e ? (b = "@font-face" == r.stateArg && !q.hasOwnProperty(t.current().toLowerCase()) || "@counter-style" == r.stateArg && !P.hasOwnProperty(t.current().toLowerCase()) ? "error" : "property",
					"maybeprop") : "restricted_atBlock"
				}
				,
				_.keyframes = function(e, t, r) {
					return "word" == e ? (b = "variable",
					"keyframes") : "{" == e ? s(r, t, "top") : d(e, t, r)
				}
				,
				_.at = function(e, t, r) {
					return ";" == e ? c(r) : "{" == e || "}" == e ? p(e, t, r) : ("word" == e ? b = "tag" : "hash" == e && (b = "builtin"),
					"at")
				}
				,
				_.interpolation = function(e, t, r) {
					return "}" == e ? c(r) : "{" == e || ";" == e ? p(e, t, r) : ("word" == e ? b = "variable" : "variable" != e && "(" != e && ")" != e && (b = "error"),
					"interpolation")
				}
				,
				{
					startState: function(e) {
						return {
							tokenize: null ,
							state: r.inline ? "block" : "top",
							stateArg: null ,
							context: new l(r.inline ? "block" : "top",e || 0,null )
						}
					},
					token: function(e, t) {
						if (!t.tokenize && e.eatSpace())
							return null ;
						var r = (t.tokenize || a)(e, t);
						return r && "object" == typeof r && (h = r[1],
						r = r[0]),
						b = r,
						t.state = _[t.state](h, e, t),
						b
					},
					indent: function(e, t) {
						var r = e.context
						, o = t && t.charAt(0)
						, a = r.indent;
						return "prop" != r.type || "}" != o && ")" != o || (r = r.prev),
						r.prev && ("}" != o || "block" != r.type && "top" != r.type && "interpolation" != r.type && "restricted_atBlock" != r.type ? (")" == o && ("parens" == r.type || "atBlock_parens" == r.type) || "{" == o && ("at" == r.type || "atBlock" == r.type)) && (a = Math.max(0, r.indent - g),
						r = r.prev) : (r = r.prev,
						a = r.indent)),
						a
					},
					electricChars: "}",
					blockCommentStart: "/*",
					blockCommentEnd: "*/",
					fold: "brace"
				}
			});
			var o = ["domain", "regexp", "url", "url-prefix"]
			, a = t(o)
			, i = ["all", "aural", "braille", "handheld", "print", "projection", "screen", "tty", "tv", "embossed"]
			, n = t(i)
			, l = ["width", "min-width", "max-width", "height", "min-height", "max-height", "device-width", "min-device-width", "max-device-width", "device-height", "min-device-height", "max-device-height", "aspect-ratio", "min-aspect-ratio", "max-aspect-ratio", "device-aspect-ratio", "min-device-aspect-ratio", "max-device-aspect-ratio", "color", "min-color", "max-color", "color-index", "min-color-index", "max-color-index", "monochrome", "min-monochrome", "max-monochrome", "resolution", "min-resolution", "max-resolution", "scan", "grid", "orientation", "device-pixel-ratio", "min-device-pixel-ratio", "max-device-pixel-ratio", "pointer", "any-pointer", "hover", "any-hover"]
			, s = t(l)
			, c = ["landscape", "portrait", "none", "coarse", "fine", "on-demand", "hover", "interlace", "progressive"]
			, d = t(c)
			, p = ["align-content", "align-items", "align-self", "alignment-adjust", "alignment-baseline", "anchor-point", "animation", "animation-delay", "animation-direction", "animation-duration", "animation-fill-mode", "animation-iteration-count", "animation-name", "animation-play-state", "animation-timing-function", "appearance", "azimuth", "backface-visibility", "background", "background-attachment", "background-clip", "background-color", "background-image", "background-origin", "background-position", "background-repeat", "background-size", "baseline-shift", "binding", "bleed", "bookmark-label", "bookmark-level", "bookmark-state", "bookmark-target", "border", "border-bottom", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width", "border-collapse", "border-color", "border-image", "border-image-outset", "border-image-repeat", "border-image-slice", "border-image-source", "border-image-width", "border-left", "border-left-color", "border-left-style", "border-left-width", "border-radius", "border-right", "border-right-color", "border-right-style", "border-right-width", "border-spacing", "border-style", "border-top", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width", "border-width", "bottom", "box-decoration-break", "box-shadow", "box-sizing", "break-after", "break-before", "break-inside", "caption-side", "clear", "clip", "color", "color-profile", "column-count", "column-fill", "column-gap", "column-rule", "column-rule-color", "column-rule-style", "column-rule-width", "column-span", "column-width", "columns", "content", "counter-increment", "counter-reset", "crop", "cue", "cue-after", "cue-before", "cursor", "direction", "display", "dominant-baseline", "drop-initial-after-adjust", "drop-initial-after-align", "drop-initial-before-adjust", "drop-initial-before-align", "drop-initial-size", "drop-initial-value", "elevation", "empty-cells", "fit", "fit-position", "flex", "flex-basis", "flex-direction", "flex-flow", "flex-grow", "flex-shrink", "flex-wrap", "float", "float-offset", "flow-from", "flow-into", "font", "font-feature-settings", "font-family", "font-kerning", "font-language-override", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-synthesis", "font-variant", "font-variant-alternates", "font-variant-caps", "font-variant-east-asian", "font-variant-ligatures", "font-variant-numeric", "font-variant-position", "font-weight", "grid", "grid-area", "grid-auto-columns", "grid-auto-flow", "grid-auto-position", "grid-auto-rows", "grid-column", "grid-column-end", "grid-column-start", "grid-row", "grid-row-end", "grid-row-start", "grid-template", "grid-template-areas", "grid-template-columns", "grid-template-rows", "hanging-punctuation", "height", "hyphens", "icon", "image-orientation", "image-rendering", "image-resolution", "inline-box-align", "justify-content", "left", "letter-spacing", "line-break", "line-height", "line-stacking", "line-stacking-ruby", "line-stacking-shift", "line-stacking-strategy", "list-style", "list-style-image", "list-style-position", "list-style-type", "margin", "margin-bottom", "margin-left", "margin-right", "margin-top", "marker-offset", "marks", "marquee-direction", "marquee-loop", "marquee-play-count", "marquee-speed", "marquee-style", "max-height", "max-width", "min-height", "min-width", "move-to", "nav-down", "nav-index", "nav-left", "nav-right", "nav-up", "object-fit", "object-position", "opacity", "order", "orphans", "outline", "outline-color", "outline-offset", "outline-style", "outline-width", "overflow", "overflow-style", "overflow-wrap", "overflow-x", "overflow-y", "padding", "padding-bottom", "padding-left", "padding-right", "padding-top", "page", "page-break-after", "page-break-before", "page-break-inside", "page-policy", "pause", "pause-after", "pause-before", "perspective", "perspective-origin", "pitch", "pitch-range", "play-during", "position", "presentation-level", "punctuation-trim", "quotes", "region-break-after", "region-break-before", "region-break-inside", "region-fragment", "rendering-intent", "resize", "rest", "rest-after", "rest-before", "richness", "right", "rotation", "rotation-point", "ruby-align", "ruby-overhang", "ruby-position", "ruby-span", "shape-image-threshold", "shape-inside", "shape-margin", "shape-outside", "size", "speak", "speak-as", "speak-header", "speak-numeral", "speak-punctuation", "speech-rate", "stress", "string-set", "tab-size", "table-layout", "target", "target-name", "target-new", "target-position", "text-align", "text-align-last", "text-decoration", "text-decoration-color", "text-decoration-line", "text-decoration-skip", "text-decoration-style", "text-emphasis", "text-emphasis-color", "text-emphasis-position", "text-emphasis-style", "text-height", "text-indent", "text-justify", "text-outline", "text-overflow", "text-shadow", "text-size-adjust", "text-space-collapse", "text-transform", "text-underline-position", "text-wrap", "top", "transform", "transform-origin", "transform-style", "transition", "transition-delay", "transition-duration", "transition-property", "transition-timing-function", "unicode-bidi", "vertical-align", "visibility", "voice-balance", "voice-duration", "voice-family", "voice-pitch", "voice-range", "voice-rate", "voice-stress", "voice-volume", "volume", "white-space", "widows", "width", "word-break", "word-spacing", "word-wrap", "z-index", "clip-path", "clip-rule", "mask", "enable-background", "filter", "flood-color", "flood-opacity", "lighting-color", "stop-color", "stop-opacity", "pointer-events", "color-interpolation", "color-interpolation-filters", "color-rendering", "fill", "fill-opacity", "fill-rule", "image-rendering", "marker", "marker-end", "marker-mid", "marker-start", "shape-rendering", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-rendering", "baseline-shift", "dominant-baseline", "glyph-orientation-horizontal", "glyph-orientation-vertical", "text-anchor", "writing-mode"]
			, u = t(p)
			, m = ["scrollbar-arrow-color", "scrollbar-base-color", "scrollbar-dark-shadow-color", "scrollbar-face-color", "scrollbar-highlight-color", "scrollbar-shadow-color", "scrollbar-3d-light-color", "scrollbar-track-color", "shape-inside", "searchfield-cancel-button", "searchfield-decoration", "searchfield-results-button", "searchfield-results-decoration", "zoom"]
			, h = t(m)
			, b = ["font-family", "src", "unicode-range", "font-variant", "font-feature-settings", "font-stretch", "font-weight", "font-style"]
			, g = t(b)
			, f = ["additive-symbols", "fallback", "negative", "pad", "prefix", "range", "speak-as", "suffix", "symbols", "system"]
			, y = t(f)
			, w = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"]
			, k = t(w)
			, v = ["above", "absolute", "activeborder", "additive", "activecaption", "afar", "after-white-space", "ahead", "alias", "all", "all-scroll", "alphabetic", "alternate", "always", "amharic", "amharic-abegede", "antialiased", "appworkspace", "arabic-indic", "armenian", "asterisks", "attr", "auto", "avoid", "avoid-column", "avoid-page", "avoid-region", "background", "backwards", "baseline", "below", "bidi-override", "binary", "bengali", "blink", "block", "block-axis", "bold", "bolder", "border", "border-box", "both", "bottom", "break", "break-all", "break-word", "bullets", "button", "button-bevel", "buttonface", "buttonhighlight", "buttonshadow", "buttontext", "calc", "cambodian", "capitalize", "caps-lock-indicator", "caption", "captiontext", "caret", "cell", "center", "checkbox", "circle", "cjk-decimal", "cjk-earthly-branch", "cjk-heavenly-stem", "cjk-ideographic", "clear", "clip", "close-quote", "col-resize", "collapse", "column", "column-reverse", "compact", "condensed", "contain", "content", "content-box", "context-menu", "continuous", "copy", "counter", "counters", "cover", "crop", "cross", "crosshair", "currentcolor", "cursive", "cyclic", "dashed", "decimal", "decimal-leading-zero", "default", "default-button", "destination-atop", "destination-in", "destination-out", "destination-over", "devanagari", "disc", "discard", "disclosure-closed", "disclosure-open", "document", "dot-dash", "dot-dot-dash", "dotted", "double", "down", "e-resize", "ease", "ease-in", "ease-in-out", "ease-out", "element", "ellipse", "ellipsis", "embed", "end", "ethiopic", "ethiopic-abegede", "ethiopic-abegede-am-et", "ethiopic-abegede-gez", "ethiopic-abegede-ti-er", "ethiopic-abegede-ti-et", "ethiopic-halehame-aa-er", "ethiopic-halehame-aa-et", "ethiopic-halehame-am-et", "ethiopic-halehame-gez", "ethiopic-halehame-om-et", "ethiopic-halehame-sid-et", "ethiopic-halehame-so-et", "ethiopic-halehame-ti-er", "ethiopic-halehame-ti-et", "ethiopic-halehame-tig", "ethiopic-numeric", "ew-resize", "expanded", "extends", "extra-condensed", "extra-expanded", "fantasy", "fast", "fill", "fixed", "flat", "flex", "flex-end", "flex-start", "footnotes", "forwards", "from", "geometricPrecision", "georgian", "graytext", "groove", "gujarati", "gurmukhi", "hand", "hangul", "hangul-consonant", "hebrew", "help", "hidden", "hide", "higher", "highlight", "highlighttext", "hiragana", "hiragana-iroha", "horizontal", "hsl", "hsla", "icon", "ignore", "inactiveborder", "inactivecaption", "inactivecaptiontext", "infinite", "infobackground", "infotext", "inherit", "initial", "inline", "inline-axis", "inline-block", "inline-flex", "inline-table", "inset", "inside", "intrinsic", "invert", "italic", "japanese-formal", "japanese-informal", "justify", "kannada", "katakana", "katakana-iroha", "keep-all", "khmer", "korean-hangul-formal", "korean-hanja-formal", "korean-hanja-informal", "landscape", "lao", "large", "larger", "left", "level", "lighter", "line-through", "linear", "linear-gradient", "lines", "list-item", "listbox", "listitem", "local", "logical", "loud", "lower", "lower-alpha", "lower-armenian", "lower-greek", "lower-hexadecimal", "lower-latin", "lower-norwegian", "lower-roman", "lowercase", "ltr", "malayalam", "match", "matrix", "matrix3d", "media-controls-background", "media-current-time-display", "media-fullscreen-button", "media-mute-button", "media-play-button", "media-return-to-realtime-button", "media-rewind-button", "media-seek-back-button", "media-seek-forward-button", "media-slider", "media-sliderthumb", "media-time-remaining-display", "media-volume-slider", "media-volume-slider-container", "media-volume-sliderthumb", "medium", "menu", "menulist", "menulist-button", "menulist-text", "menulist-textfield", "menutext", "message-box", "middle", "min-intrinsic", "mix", "mongolian", "monospace", "move", "multiple", "myanmar", "n-resize", "narrower", "ne-resize", "nesw-resize", "no-close-quote", "no-drop", "no-open-quote", "no-repeat", "none", "normal", "not-allowed", "nowrap", "ns-resize", "numbers", "numeric", "nw-resize", "nwse-resize", "oblique", "octal", "open-quote", "optimizeLegibility", "optimizeSpeed", "oriya", "oromo", "outset", "outside", "outside-shape", "overlay", "overline", "padding", "padding-box", "painted", "page", "paused", "persian", "perspective", "plus-darker", "plus-lighter", "pointer", "polygon", "portrait", "pre", "pre-line", "pre-wrap", "preserve-3d", "progress", "push-button", "radial-gradient", "radio", "read-only", "read-write", "read-write-plaintext-only", "rectangle", "region", "relative", "repeat", "repeating-linear-gradient", "repeating-radial-gradient", "repeat-x", "repeat-y", "reset", "reverse", "rgb", "rgba", "ridge", "right", "rotate", "rotate3d", "rotateX", "rotateY", "rotateZ", "round", "row", "row-resize", "row-reverse", "rtl", "run-in", "running", "s-resize", "sans-serif", "scale", "scale3d", "scaleX", "scaleY", "scaleZ", "scroll", "scrollbar", "se-resize", "searchfield", "searchfield-cancel-button", "searchfield-decoration", "searchfield-results-button", "searchfield-results-decoration", "semi-condensed", "semi-expanded", "separate", "serif", "show", "sidama", "simp-chinese-formal", "simp-chinese-informal", "single", "skew", "skewX", "skewY", "skip-white-space", "slide", "slider-horizontal", "slider-vertical", "sliderthumb-horizontal", "sliderthumb-vertical", "slow", "small", "small-caps", "small-caption", "smaller", "solid", "somali", "source-atop", "source-in", "source-out", "source-over", "space", "space-around", "space-between", "spell-out", "square", "square-button", "start", "static", "status-bar", "stretch", "stroke", "sub", "subpixel-antialiased", "super", "sw-resize", "symbolic", "symbols", "table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row", "table-row-group", "tamil", "telugu", "text", "text-bottom", "text-top", "textarea", "textfield", "thai", "thick", "thin", "threeddarkshadow", "threedface", "threedhighlight", "threedlightshadow", "threedshadow", "tibetan", "tigre", "tigrinya-er", "tigrinya-er-abegede", "tigrinya-et", "tigrinya-et-abegede", "to", "top", "trad-chinese-formal", "trad-chinese-informal", "translate", "translate3d", "translateX", "translateY", "translateZ", "transparent", "ultra-condensed", "ultra-expanded", "underline", "up", "upper-alpha", "upper-armenian", "upper-greek", "upper-hexadecimal", "upper-latin", "upper-norwegian", "upper-roman", "uppercase", "urdu", "url", "var", "vertical", "vertical-text", "visible", "visibleFill", "visiblePainted", "visibleStroke", "visual", "w-resize", "wait", "wave", "wider", "window", "windowframe", "windowtext", "words", "wrap", "wrap-reverse", "x-large", "x-small", "xor", "xx-large", "xx-small"]
			, x = t(v)
			, z = o.concat(i).concat(l).concat(c).concat(p).concat(m).concat(w).concat(v);
			e.registerHelper("hintWords", "css", z),
			e.defineMIME("text/css", {
				documentTypes: a,
				mediaTypes: n,
				mediaFeatures: s,
				mediaValueKeywords: d,
				propertyKeywords: u,
				nonStandardPropertyKeywords: h,
				fontProperties: g,
				counterDescriptors: y,
				colorKeywords: k,
				valueKeywords: x,
				tokenHooks: {
					"/": function(e, t) {
						return e.eat("*") ? (t.tokenize = r,
						r(e, t)) : !1
					}
				},
				name: "css"
			}),
			e.defineMIME("text/x-scss", {
				mediaTypes: n,
				mediaFeatures: s,
				mediaValueKeywords: d,
				propertyKeywords: u,
				nonStandardPropertyKeywords: h,
				colorKeywords: k,
				valueKeywords: x,
				fontProperties: g,
				allowNested: !0,
				tokenHooks: {
					"/": function(e, t) {
						return e.eat("/") ? (e.skipToEnd(),
						["comment", "comment"]) : e.eat("*") ? (t.tokenize = r,
						r(e, t)) : ["operator", "operator"]
					},
					":": function(e) {
						return e.match(/\s*\{/) ? [null , "{"] : !1
					},
					$: function(e) {
						return e.match(/^[\w-]+/),
						e.match(/^\s*:/, !1) ? ["variable-2", "variable-definition"] : ["variable-2", "variable"]
					},
					"#": function(e) {
						return e.eat("{") ? [null , "interpolation"] : !1
					}
				},
				name: "css",
				helperType: "scss"
			}),
			e.defineMIME("text/x-less", {
				mediaTypes: n,
				mediaFeatures: s,
				mediaValueKeywords: d,
				propertyKeywords: u,
				nonStandardPropertyKeywords: h,
				colorKeywords: k,
				valueKeywords: x,
				fontProperties: g,
				allowNested: !0,
				tokenHooks: {
					"/": function(e, t) {
						return e.eat("/") ? (e.skipToEnd(),
						["comment", "comment"]) : e.eat("*") ? (t.tokenize = r,
						r(e, t)) : ["operator", "operator"]
					},
					"@": function(e) {
						return e.eat("{") ? [null , "interpolation"] : e.match(/^(charset|document|font-face|import|(-(moz|ms|o|webkit)-)?keyframes|media|namespace|page|supports)\b/, !1) ? !1 : (e.eatWhile(/[\w\\\-]/),
						e.match(/^\s*:/, !1) ? ["variable-2", "variable-definition"] : ["variable-2", "variable"])
					},
					"&": function() {
						return ["atom", "atom"]
					}
				},
				name: "css",
				helperType: "less"
			}),
			e.defineMIME("text/x-gss", {
				documentTypes: a,
				mediaTypes: n,
				mediaFeatures: s,
				propertyKeywords: u,
				nonStandardPropertyKeywords: h,
				fontProperties: g,
				counterDescriptors: y,
				colorKeywords: k,
				valueKeywords: x,
				supportsAtComponent: !0,
				tokenHooks: {
					"/": function(e, t) {
						return e.eat("*") ? (t.tokenize = r,
						r(e, t)) : !1
					}
				},
				name: "css",
				helperType: "gss"
			})
		});
		!function(e) {
			"object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : window.CodeMirror ? e(window.CodeMirror) : window.codeMirrorToLoad ? window.codeMirrorToLoad.toLoad ? window.codeMirrorToLoad.toLoad.push(e) : window.codeMirrorToLoad.toLoad = [e] : window.codeMirrorToLoad = { toLoad: [e] };
		}(function(e) {
			"use strict";
			var r = {
				link: 1,
				visited: 1,
				active: 1,
				hover: 1,
				focus: 1,
				"first-letter": 1,
				"first-line": 1,
				"first-child": 1,
				before: 1,
				after: 1,
				lang: 1
			};
			e.registerHelper("hint", "css", function(t) {
				function o(e) {
					for (var r in e)
						c && 0 != r.lastIndexOf(c, 0) || l.push(r)
				}
				var s = t.getCursor()
				, i = t.getTokenAt(s)
				, n = e.innerMode(t.getMode(), i.state);
				if ("css" == n.mode.name) {
					if ("keyword" == i.type && 0 == "!important".indexOf(i.string))
						return {
							list: ["!important"],
							from: e.Pos(s.line, i.start),
							to: e.Pos(s.line, i.end)
						};
					var a = i.start
					, d = s.ch
					, c = i.string.slice(0, d - a);
					/[^\w$_-]/.test(c) && (c = "",
					a = d = s.ch);
					var f = e.resolveMode("text/css")
					, l = []
					, p = n.state.state;
					return "pseudo" == p || "variable-3" == i.type ? o(r) : "block" == p || "maybeprop" == p ? o(f.propertyKeywords) : "prop" == p || "parens" == p || "at" == p || "params" == p ? (o(f.valueKeywords),
					o(f.colorKeywords)) : ("media" == p || "media_parens" == p) && (o(f.mediaTypes),
					o(f.mediaFeatures)),
					l.length ? {
						list: l,
						from: e.Pos(s.line, a),
						to: e.Pos(s.line, d)
					} : void 0
				}
			})
		});
		
		
		// jslint.js
		// 2015-08-20
		// Copyright (c) 2015 Douglas Crockford  (www.JSLint.com)
		
		// Permission is hereby granted, free of charge, to any person obtaining a copy
		// of this software and associated documentation files (the "Software"), to deal
		// in the Software without restriction, including without limitation the rights
		// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		// copies of the Software, and to permit persons to whom the Software is
		// furnished to do so, subject to the following conditions:
		
		// The above copyright notice and this permission notice shall be included in
		// all copies or substantial portions of the Software.
		
		// The Software shall be used for Good, not Evil.
		
		// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		// SOFTWARE.
		var jslint = function() {
			"use strict";
			function e() {
				return Object.create(null )
			}
			function n(e, n, i) {
				n.forEach(function(n) {
					e[n] = i
				})
			}
			function i(e) {
				return e >= "a" && "z￿" >= e || e >= "A" && "Z￿" >= e
			}
			function t(e, n) {
				return e.replace(Cn, function(e, i) {
					var t = n[i];
					return void 0 !== t ? t : e
				})
			}
			function r(e) {
				return void 0 === e && (e = wn),
				"(string)" === e.id || "(number)" === e.id ? String(e.value) : e.id
			}
			function a(e) {
				return void 0 === e && (e = wn),
				e.line + _n
			}
			function s(e) {
				return void 0 === e && (e = wn),
				e.from + _n
			}
			function o(e, n, i, r, a, s, o) {
				var d = {
					name: "JSLintError",
					column: i,
					line: n,
					code: e
				};
				return void 0 !== r && (d.a = r),
				void 0 !== a && (d.b = a),
				void 0 !== s && (d.c = s),
				void 0 !== o && (d.d = o),
				d.message = t(Tn[e] || e, d),
				Rn.push(d),
				"number" == typeof kn.maxerr && Rn.length === kn.maxerr ? c("too_many", n, i) : d
			}
			function c(e, n, i, t, r, a, s) {
				throw o(e, n, i, t, r, a, s)
			}
			function d(e, n, i, t, a, s) {
				return void 0 === n && (n = wn),
				void 0 === n.warning ? (n.warning = o(e, n.line, n.from, i || r(n), t, a, s),
				n.warning) : void 0
			}
			function u(e, n, i, t, r, a) {
				throw void 0 === n && (n = wn),
				n.warning = void 0,
				d(e, n, i, t, r, a)
			}
			function p(t) {
				function a() {
					var e;
					return N = 0,
					j += 1,
					S = yn[j],
					void 0 !== S && (e = S.search(Xn),
					e >= 0 && (kn.white || o("use_spaces", j, e + 1),
					S = S.replace(Xn, " ")),
					e = S.search(Ln),
					e >= 0 && o("unsafe", j, N + e, "U+" + S.charCodeAt(e).toString(16)),
					kn.maxlen && kn.maxlen < S.length ? o("too_long", j, S.length) : kn.white || " " !== S.slice(-1) || o("unexpected_trailing_space", j, S.length - 1)),
					S
				}
				function s() {
					$ = $.slice(0, -1)
				}
				function p(e) {
					return void 0 !== e && k !== e ? c("expected_a_b", j, N, e, k) : (S ? (k = S.charAt(0),
					S = S.slice(1),
					$ += k) : (k = "",
					$ += " "),
					N += 1,
					k)
				}
				function f() {
					return $ ? (k = $.slice(-1),
					S = k + S,
					N -= 1,
					s()) : k = "",
					k
				}
				function l(e, n) {
					var i = S.match(e);
					return i ? (k = i[1],
					N += k.length,
					S = i[2],
					$ += k) : (k = "",
					n || o("expected_digits_after_a", j, N, $)),
					k.length
				}
				function _(e) {
					switch (p("\\")) {
					case "\\":
					case "'":
					case '"':
					case "/":
					case ":":
					case "=":
					case "|":
					case "b":
					case "f":
					case "n":
					case "r":
					case "t":
					case " ":
						break;
					case "u":
						if ("{" === p("u"))
							return l(ti) > 5 && o("too_many_digits", j, N - 1),
							kn.es6 || o("es6", j, N),
							void ("}" !== p() && c("expected_a_before_b", j, N, "}", k));
						f(),
						l(ti, !0) < 4 && o("expected_four_digits", j, N - 1);
						break;
					case "":
						return c("unclosed_string", j, N);
					default:
						e && e.indexOf(k) < 0 && o("unexpected_a_after_b", j, N, k, "\\")
					}
					p()
				}
				function x(e, n, i) {
					var t = {
						id: e,
						identifier: !!i,
						from: A,
						thru: N,
						line: j
					};
					return jn.push(t),
					"(comment)" !== e && (pn = !1),
					void 0 !== n && (t.value = n),
					O.line !== j || O.thru !== A || "(comment)" !== e && "(regexp)" !== e && "/" !== e || "(comment)" !== O.id && "(regexp)" !== O.id || d("expected_space_a_b", t, r(O), r(t)),
					"." === O.id && "(number)" === e && d("expected_a_before_b", O, "0", "."),
					"." === I.id && t.identifier && (t.dot = !0),
					O = t,
					"(comment)" !== O.id && (I = O),
					t
				}
				function b(i, t) {
					var r = t.match(ei);
					if (r) {
						var a, s = r[1], o = r[2];
						switch (i.directive) {
						case "jslint":
							switch (a = zn[s],
							typeof a) {
							case "boolean":
								switch (o) {
								case "true":
								case "":
								case void 0:
									kn[s] = !0;
									break;
								case "false":
									kn[s] = !1;
									break;
								default:
									d("bad_option_a", i, s + ":" + o)
								}
								break;
							case "number":
								isFinite(+o) ? kn[s] = +o : d("bad_option_a", i, s + ":" + o);
								break;
							case "object":
								kn[s] = !0,
								n(un, a, !1);
								break;
							default:
								d("bad_option_a", i, s)
							}
							break;
						case "property":
							void 0 === On && (On = e()),
							On[s] = !0;
							break;
						case "global":
							o && d("bad_option_a", i, s + ":" + o),
							un[s] = !1,
							gn = i
						}
						return b(i, r[3])
					}
					return t ? u("bad_directive_a", i, t) : void 0
				}
				function v(e) {
					var n = x("(comment)", e);
					Array.isArray(e) && (e = e.join(" ")),
					!kn.devel && Vn.test(e) && d("todo_comment", n);
					var i = e.match(Yn);
					return i && (pn ? (n.directive = i[1],
					b(n, i[2])) : o("misplaced_directive_a", j, A, i[1])),
					n
				}
				function m() {
					function n() {
						switch (k) {
						case "?":
						case "*":
						case "+":
							p();
							break;
						case "{":
							0 === l(ii, !0) && o("expected_a", j, N, "0"),
							"," === p() && (l(ii, !0),
							p()),
							p("}");
							break;
						default:
							return
						}
						"?" === k && p("?")
					}
					function t() {
						switch (k) {
						case "\\":
							return _(),
							!0;
						case "[":
						case "]":
						case "/":
						case "^":
						case "-":
						case "|":
						case "":
							return !1;
						case "`":
							return En && o("unexpected_a", j, N, "`"),
							p(),
							!0;
						case " ":
							return o("expected_a_before_b", j, N, "\\", " "),
							p(),
							!0;
						default:
							return p(),
							!0
						}
					}
					function r() {
						return t() ? "-" !== k || (p("-"),
						t()) ? r() : c("unexpected_a", j, N - 1, "-") : void 0
					}
					function a() {
						p("["),
						"^" === k && p("^"),
						r(),
						p("]")
					}
					function d() {
						function e() {
							if (p("("),
							"?" === k)
								switch (p("?"),
								k) {
								case ":":
								case "=":
								case "!":
									p();
									break;
								default:
									p(":")
								}
							else
								":" === k && o("expected_a_before_b", j, N, "?", ":");
							d(),
							p(")")
						}
						function i() {
							switch (k) {
							case "[":
								return a(),
								!0;
							case "\\":
								return _("BbDdSsWw^${}[]().|*+?"),
								!0;
							case "(":
								return e(),
								!0;
							case "/":
							case "|":
							case "]":
							case ")":
							case "}":
							case "{":
							case "?":
							case "+":
							case "*":
							case "":
								return !1;
							case "`":
								En && o("unexpected_a", j, N, "`");
								break;
							case " ":
								o("expected_a_before_b", j, N, "\\", " ")
							}
							return p(),
							!0
						}
						function t(e) {
							return i() ? (n(),
							t(!0)) : void (e || o("expected_regexp_factor_a", j, N, k))
						}
						return t(),
						"|" === k ? (p("|"),
						d()) : void 0
					}
					var u, b, v = !1;
					$ = "",
					p(),
					"=" === k && o("expected_a_before_b", j, N, "\\", "="),
					d(),
					s(),
					b = $,
					p("/");
					var m = {
						g: !0,
						i: !0,
						m: !0,
						u: v,
						y: kn.es6
					}
					, h = e();
					return function y() {
						return i(k) ? (m[k] !== !0 && o("unexpected_a", j, N, k),
						m[k] = !1,
						h[k] = !0,
						p(),
						y()) : void 0
					}(),
					v && !h.u && o("expected_a_before_b", j, N, "u", k),
					f(),
					"/" === k || "*" === k ? c("unexpected_a", j, A, k) : (u = x("(regexp)", k),
					u.flag = h,
					u.value = b,
					u)
				}
				function h(e) {
					var n;
					return $ = "",
					p(),
					function i() {
						switch (k) {
						case e:
							return s(),
							n = x("(string)", $),
							n.quote = e,
							n;
						case "\\":
							_();
							break;
						case "":
							return c("unclosed_string", j, N);
						case "`":
							En && o("unexpected_a", j, N, "`"),
							p("`");
							break;
						default:
							p()
						}
						return i()
					}()
				}
				function y() {
					"." === k && (l(ii),
					p()),
					("E" === k || "e" === k) && (p(),
					"+" !== k && "-" !== k && f(),
					l(ii),
					p())
				}
				function g() {
					if ("0" === $)
						switch (p()) {
						case ".":
							y();
							break;
						case "b":
							l(ai),
							p();
							break;
						case "o":
							l(ri),
							p();
							break;
						case "x":
							l(ti),
							p()
						}
					else
						p(),
						y();
					return k >= "0" && "9" >= k || k >= "a" && "z" >= k || k >= "A" && "Z" >= k ? c("unexpected_a_after_b", j, N - 1, $.slice(-1), $.slice(0, -1)) : (f(),
					x("(number)", $))
				}
				function w() {
					var e, n, i, t, r = 0, s = 0;
					if (!S)
						return S = a(),
						A = 0,
						void 0 === S ? En ? c("unclosed_mega", U, E) : x("(end)") : w();
					if (A = N,
					i = S.match(ni),
					!i)
						return c("unexpected_char_a", j, N, S.charAt(0));
					if ($ = i[1],
					N += $.length,
					S = i[5],
					i[2])
						return w();
					if (i[3])
						return x($, void 0, !0);
					if (i[4])
						return g($);
					switch ($) {
					case "'":
					case '"':
						return h($);
					case "`":
						return En ? c("expected_a_b", j, N, "}", "`") : ($ = "",
						E = A,
						U = j,
						En = !0,
						x("`"),
						A += 1,
						function p() {
							var e = S.search(si);
							return 0 > e ? ($ += S + "\n",
							void 0 === a() ? c("unclosed_mega", U, E) : p()) : ($ += S.slice(0, e),
							N += e,
							S = S.slice(e),
							x("(string)", $).quote = "`",
							$ = "",
							"$" === S.charAt(0) ? (N += 2,
							x("${"),
							S = S.slice(2),
							function n() {
								var e = w().id;
								return "{" === e ? c("expected_a_b", j, N, "}", "{") : "}" !== e ? n() : void 0
							}(),
							p()) : void 0)
						}(),
						S = S.slice(1),
						N += 1,
						En = !1,
						x("`"));
					case "//":
						return $ = S,
						S = "",
						t = v($),
						En && d("unexpected_comment", t, "`"),
						t;
					case "/*":
						return e = [],
						"/" === S.charAt(0) && o("unexpected_a", j, N + r, "/"),
						function f() {
							if (S > "") {
								if (r = S.search(Gn),
								r >= 0)
									return;
								s = S.search(Kn),
								s >= 0 && o("nested_comment", j, N + s)
							}
							return e.push(S),
							S = a(),
							void 0 === S ? c("unclosed_comment", j, N) : f()
						}(),
						$ = S.slice(0, r),
						s = $.search(Qn),
						s >= 0 && o("nested_comment", j, N + s),
						e.push($),
						N += r + 2,
						S = S.slice(r + 2),
						v(e);
					case "/":
						if (I.identifier) {
							if (!I.dot)
								switch (I.id) {
								case "return":
									return m();
								case "(begin)":
								case "case":
								case "delete":
								case "in":
								case "instanceof":
								case "new":
								case "typeof":
								case "void":
								case "yield":
									return t = m(),
									u("unexpected_a", t)
								}
						} else {
							if (n = I.id.charAt(I.id.length - 1),
							"(,=:?[".indexOf(n) >= 0)
								return m();
							if ("!&|{};~+-*%/^<>".indexOf(n) >= 0)
								return t = m(),
								d("wrap_regexp", t),
								t
						}
						"/" === S.charAt(0) && (N += 1,
						S = S.slice(1),
						$ = "/=",
						o("unexpected_a", j, N, "/="))
					}
					return x($)
				}
				yn = Array.isArray(t) ? t : t.split(Jn),
				jn = [];
				for (var k, A, E, U, $, S, N = 0, j = -1, O = vn, I = vn; ; )
					if ("(end)" === w().id)
						break
			}
			function f(e) {
				var n = e.id;
				if ("(string)" === n) {
					if (n = e.value,
					!Pn.test(n))
						return n;
					if (!Hn.test(n))
						return n;
					d("unexpected_quotes_a", e)
				} else if (!e.identifier)
					return u("expected_identifier_a", e);
				return "number" == typeof An[n] ? An[n] += 1 : (void 0 !== On ? On[n] !== !0 && d("unregistered_property_a", e) : e.identifier && Mn.test(n) && d("bad_property_a", e),
				An[n] = 1),
				n
			}
			function l() {
				var e = jn[Nn];
				return Nn += 1,
				"(comment)" !== e.id || hn ? e : l()
			}
			function _() {
				var e = Nn
				, n = l(!0);
				return Nn = e,
				n
			}
			function x(e, n) {
				return Sn.identifier && "function" !== Sn.id ? ui = Sn.id : "(string)" === Sn.id && Pn.test(Sn.value) && (ui = Sn.value),
				void 0 !== e && wn.id !== e ? void 0 === n ? u("expected_a_b", wn, e, r()) : u("expected_a_b_from_c_d", wn, e, r(n), a(n), r(wn)) : (Sn = wn,
				wn = l(),
				void ("(end)" === wn.id && (Nn -= 1)))
			}
			function b() {
				function n() {
					var n = wn
					, i = e();
					x("{"),
					"}" !== wn.id && !function t() {
						return '"' !== wn.quote && d("unexpected_a", wn, wn.quote),
						x("(string)"),
						void 0 !== i[Sn.value] ? d("duplicate_a", Sn) : "__proto__" === Sn.value ? d("bad_property_name_a", Sn) : i[Sn.value] = Sn,
						x(":"),
						b(),
						"," === wn.id ? (x(","),
						t()) : void 0
					}(),
					x("}", n)
				}
				function i() {
					var e = wn;
					x("["),
					"]" !== wn.id && !function n() {
						return b(),
						"," === wn.id ? (x(","),
						n()) : void 0
					}(),
					x("]", e)
				}
				switch (wn.id) {
				case "{":
					n();
					break;
				case "[":
					i();
					break;
				case "true":
				case "false":
				case "null":
					x();
					break;
				case "(number)":
					di.test(wn.value) || d("unexpected_a"),
					x();
					break;
				case "(string)":
					'"' !== wn.quote && d("unexpected_a", wn, wn.quote),
					x();
					break;
				case "-":
					x("-"),
					x("(number)");
					break;
				default:
					u("unexpected_a")
				}
			}
			function v(e, n, i) {
				var t = e.id;
				if (void 0 !== $n[t] && "ignore" !== t)
					d("reserved_a", e);
				else {
					var r = xn.context[t];
					r ? d("redefinition_a_b", e, e.id, r.line + _n) : (Un.forEach(function(e) {
						var n = e.context[t];
						void 0 !== n && (r = n)
					}),
					r && ("ignore" === t ? "variable" === r.role && d("unexpected_a", e) : "exception" === n && "exception" === r.role || "parameter" === n || "function" === n || d("redefinition_a_b", e, e.id, r.line + _n)),
					xn.context[t] = e,
					e.dead = !0,
					e["function"] = xn,
					e.init = !1,
					e.role = n,
					e.used = 0,
					e.writable = !i)
				}
			}
			function m(e, n) {
				var i, t;
				if (n || x(),
				t = $n[Sn.id],
				void 0 !== t && void 0 !== t.nud)
					i = t.nud();
				else {
					if (!Sn.identifier)
						return u("unexpected_a", Sn);
					i = Sn,
					i.arity = "variable"
				}
				return function r() {
					return t = $n[wn.id],
					void 0 !== t && void 0 !== t.led && e < t.lbp ? (x(),
					i = t.led(i),
					r()) : void 0
				}(),
				i
			}
			function h() {
				var e, n = wn;
				switch (n.free = !0,
				x("("),
				e = m(0),
				x(")"),
				e.wrapped === !0 && d("unexpected_a", n),
				e.id) {
				case "?":
				case "~":
				case "&":
				case "|":
				case "^":
				case "<<":
				case ">>":
				case ">>>":
				case "+":
				case "-":
				case "*":
				case "/":
				case "%":
				case "typeof":
				case "(number)":
				case "(string)":
					d("unexpected_a", e)
				}
				return e
			}
			function y(e) {
				return "(regexp)" === e.id || "{" === e.id || "=>" === e.id || "function" === e.id || "[" === e.id && "unary" === e.arity
			}
			function g(e, n) {
				if (e === n)
					return !0;
				if (Array.isArray(e))
					return Array.isArray(n) && e.length === n.length && e.every(function(e, i) {
						return g(e, n[i])
					});
				if (Array.isArray(n))
					return !1;
				if ("(number)" === e.id && "(number)" === n.id)
					return e.value === n.value;
				var i, t;
				if ("(string)" === e.id ? i = e.value : "`" === e.id && e.constant && (i = e.value[0]),
				"(string)" === n.id ? t = n.value : "`" === n.id && n.constant && (t = n.value[0]),
				"string" == typeof i)
					return i === t;
				if (y(e) || y(n))
					return !1;
				if (e.arity === n.arity && e.id === n.id) {
					if ("." === e.id)
						return g(e.expression, n.expression) && g(e.name, n.name);
					switch (e.arity) {
					case "unary":
						return g(e.expression, n.expression);
					case "binary":
						return "(" !== e.id && g(e.expression[0], n.expression[0]) && g(e.expression[1], n.expression[1]);
					case "ternary":
						return g(e.expression[0], n.expression[0]) && g(e.expression[1], n.expression[1]) && g(e.expression[2], n.expression[2]);
					case "function":
					case "regexp":
						return !1;
					default:
						return !0
					}
				}
				return !1
			}
			function w() {
				";" === wn.id ? x(";") : o("expected_a_b", Sn.line, Sn.thru, ";", r(wn)),
				ui = "anonymous"
			}
			function k() {
				var e, n, i, t;
				if (x(),
				Sn.identifier && ":" === wn.id)
					switch (n = Sn,
					"ignore" === n.id && d("unexpected_a", n),
					x(":"),
					wn.id) {
					case "do":
					case "for":
					case "switch":
					case "while":
						return v(n, "label", !0),
						n.init = !0,
						n.dead = !1,
						i = k(),
						i.label = n,
						i.statement = !0,
						i;
					default:
						x(),
						d("unexpected_label_a", n)
					}
				return e = Sn,
				e.statement = !0,
				t = $n[e.id],
				void 0 !== t && void 0 !== t.fud ? (t.disrupt = !1,
				t.statement = !0,
				i = t.fud()) : (i = m(0, !0),
				!i.wrapped || "(" === i.id && "function" === i.expression[0].id || d("unexpected_a", e),
				w()),
				void 0 !== n && (n.dead = !0),
				i
			}
			function A() {
				var e = [];
				return function n(i) {
					var t;
					switch (wn.id) {
					case "}":
					case "case":
					case "default":
					case "else":
					case "(end)":
						break;
					default:
						return t = k(),
						e.push(t),
						i && d("unreachable_a", t),
						n(t.disrupt)
					}
				}(!1),
				e
			}
			function E(e) {
				xn === vn && d("unexpected_at_top_level_a", e)
			}
			function U(e) {
				cn !== vn && d("misplaced_a", e)
			}
			function $(e) {
				var n, i;
				return "naked" !== e && x("{"),
				i = Sn,
				i.arity = "statement",
				i.body = "body" === e,
				i.body && Un.length <= 1 && !vn.strict && ("(string)" === wn.id || "use strict" === wn.value ? (wn.statement = !0,
				xn.strict = !0,
				x("(string)"),
				x(";")) : d("expected_a_before_b", wn, "`" === wn.id ? "'" : "use strict", r(wn))),
				n = A(),
				i.block = n,
				0 === n.length ? (kn.devel || "ignore" === e || d("empty_block", i),
				i.disrupt = !1) : i.disrupt = n[n.length - 1].disrupt,
				x("}"),
				i
			}
			function S(e) {
				return "." === e.id || "[" === e.id && "binary" === e.arity || "variable" === e.arity ? !0 : (d("bad_assignment_a", e),
				!1)
			}
			function N(e, n) {
				var i = e.id;
				return e.identifier || "binary" === e.arity && ("." === i || "(" === i || "[" === i) ? !0 : (d("unexpected_a", n),
				!1)
			}
			function j(n, i) {
				var t = $n[n];
				return void 0 === t && (t = e(),
				t.id = n,
				t.lbp = i || 0,
				$n[n] = t),
				t
			}
			function O(e) {
				var n = j(e, 20);
				return n.led = function(n) {
					var i, t = Sn;
					switch (t.arity = "assignment",
					i = m(19),
					"=" === e && "variable" === n.arity ? (t.names = n,
					t.expression = i) : t.expression = [n, i],
					i.arity) {
					case "assignment":
					case "pre":
					case "post":
						d("unexpected_a", i)
					}
					return !kn.es6 || "unary" !== n.arity || "[" !== n.id && "{" !== n.id ? S(n) : d("expected_a_before_b", n, "const", n.id),
					t
				}
				,
				n
			}
			function I(e, n, i) {
				var t = j(e);
				return t.nud = "function" == typeof i ? i : function() {
					return Sn.constant = !0,
					void 0 !== i && (Sn.value = i),
					Sn
				}
				,
				t.type = n,
				t.value = i,
				t
			}
			function q(e, n, i) {
				var t = j(e, n);
				return t.led = function(e) {
					var t = Sn;
					return t.arity = "binary",
					void 0 !== i ? i(e) : (t.expression = [e, m(n)],
					t)
				}
				,
				t
			}
			function R(e) {
				var n = j(e, 150);
				return n.led = function(e) {
					return Sn.expression = e,
					Sn.arity = "post",
					S(Sn.expression),
					Sn
				}
				,
				n
			}
			function z(e) {
				var n = j(e);
				return n.nud = function() {
					var e = Sn;
					return e.arity = "pre",
					e.expression = m(150),
					S(e.expression),
					e
				}
				,
				n
			}
			function B(e, n) {
				var i = j(e);
				return i.nud = function() {
					var e = Sn;
					return e.arity = "unary",
					"function" == typeof n ? n() : (e.expression = m(150),
					e)
				}
				,
				i
			}
			function D(e, n) {
				var i = j(e);
				return i.fud = function() {
					return Sn.arity = "statement",
					n()
				}
				,
				i
			}
			function F(e, n) {
				var i = j(e, 30);
				return i.led = function(e) {
					var i = Sn
					, t = m(20);
					return x(n),
					Sn.arity = "ternary",
					i.arity = "ternary",
					i.expression = [e, t, m(10)],
					i
				}
				,
				i
			}
			function W() {
				var e = Sn;
				return kn.es6 || d("es6", e),
				e.value = [],
				e.expression = [],
				"`" !== wn.id && !function n() {
					return x("(string)"),
					e.value.push(Sn),
					"${" === wn.id ? (x("${"),
					e.expression.push(m(0)),
					x("}"),
					n()) : void 0
				}(),
				x("`"),
				e
			}
			function Z(e, n) {
				var i, t = !1;
				if ("{" === wn.id) {
					if (kn.es6 || d("es6"),
					i = wn,
					i.names = [],
					x("{"),
					n.push("{"),
					function r() {
						var e = wn;
						return e.identifier ? (f(e),
						x(),
						n.push(e.id),
						":" !== wn.id || (x(":"),
						x(),
						Sn.label = e,
						e = Sn,
						e.identifier) ? (i.names.push(e),
						"," === wn.id ? (x(","),
						n.push(", "),
						r()) : void 0) : u("expected_identifier_a")) : u("expected_identifier_a")
					}(),
					e.push(i),
					x("}"),
					n.push("}"),
					"," === wn.id)
						return x(","),
						n.push(", "),
						Z(e, n)
				} else if ("[" === wn.id) {
					if (kn.es6 || d("es6"),
					i = wn,
					i.names = [],
					x("["),
					n.push("[]"),
					function a() {
						var e = wn;
						return e.identifier ? (x(),
						i.names.push(e),
						"," === wn.id ? (x(","),
						a()) : void 0) : u("expected_identifier_a")
					}(),
					e.push(i),
					x("]"),
					"," === wn.id)
						return x(","),
						n.push(", "),
						Z(e, n)
				} else {
					if ("..." === wn.id && (kn.es6 || d("es6"),
					t = !0,
					n.push("..."),
					x("...")),
					!wn.identifier)
						return u("expected_identifier_a");
					if (i = wn,
					e.push(i),
					x(),
					n.push(i.id),
					t)
						i.ellipsis = !0;
					else if ("=" === wn.id && (kn.es6 || d("es6"),
					x("="),
					i.expression = m(0)),
					"," === wn.id)
						return x(","),
						n.push(", "),
						Z(e, n)
				}
			}
			function T() {
				var e = []
				, n = ["("];
				return ")" !== wn.id && "(end)" !== wn.id && Z(e, n),
				x(")"),
				n.push(")"),
				[e, n.join("")]
			}
			function C(n) {
				var i;
				if (void 0 === n)
					if (n = Sn,
					"statement" === n.arity) {
						if (!wn.identifier)
							return u("expected_identifier_a", wn);
						i = wn,
						v(i, "variable", !0),
						n.name = i,
						i.init = !0,
						i.calls = e(),
						x()
					} else
						void 0 === i && (wn.identifier ? (i = wn,
						n.name = i,
						x()) : n.name = ui);
				else
					i = n.name;
				n.level = xn.level + 1,
				En && d("unexpected_a", n),
				xn.loop > 0 && d("function_in_loop", n),
				n.context = e(),
				n.loop = 0,
				n["switch"] = 0,
				Un.push(xn),
				bn.push(n),
				xn = n,
				"statement" !== n.arity && i && (v(i, "function", !0),
				i.dead = !1,
				i.init = !0,
				i.used = 1),
				x("("),
				Sn.free = !1,
				Sn.arity = "function";
				var t = T();
				return xn.parameters = t[0],
				xn.signature = t[1],
				xn.parameters.forEach(function r(e) {
					e.identifier ? v(e, "parameter", !1) : e.names.forEach(r)
				}),
				n.block = $("body"),
				"statement" === n.arity && wn.line === Sn.line ? u("unexpected_a", wn) : (("." === wn.id || "[" === wn.id) && d("unexpected_a"),
				xn = Un.pop(),
				n)
			}
			function J(n) {
				x("=>");
				var i = Sn;
				return i.arity = "binary",
				i.name = "=>",
				i.level = xn.level + 1,
				bn.push(i),
				xn.loop > 0 && d("function_in_loop", i),
				i.context = e(),
				i.loop = 0,
				i["switch"] = 0,
				Un.push(xn),
				xn = i,
				i.parameters = n[0],
				i.signature = n[1],
				i.parameters.forEach(function(e) {
					v(e, "parameter", !0)
				}),
				kn.es6 || d("es6", i),
				"{" === wn.id ? (d("expected_a_b", i, "function", "=>"),
				i.block = $("body")) : i.expression = m(0),
				xn = Un.pop(),
				i
			}
			function L() {
				var e = Sn
				, n = "const" === e.id;
				return e.names = [],
				n ? kn.es6 || d("es6", e) : void 0 === qn ? (qn = e.id,
				kn.es6 || "var" === qn || d("es6", e)) : e.id !== qn && d("expected_a_b", e, qn, e.id),
				xn["switch"] > 0 && d("var_switch", e),
				xn.loop > 0 && "var" === e.id && d("var_loop", e),
				function i() {
					if ("{" === wn.id && "var" !== e.id) {
						var t = wn;
						t.names = [],
						x("{"),
						function s() {
							if (!wn.identifier)
								return u("expected_identifier_a", wn);
							var e = wn;
							if (f(e),
							x(),
							":" === wn.id) {
								if (x(":"),
								!wn.identifier)
									return u("expected_identifier_a", wn);
								wn.label = e,
								t.names.push(wn),
								v(wn, "variable", n),
								x()
							} else
								t.names.push(e),
								v(e, "variable", n);
							return "," === wn.id ? (x(","),
							s()) : void 0
						}(),
						x("}"),
						x("="),
						t.expression = m(0),
						e.names.push(t)
					} else if ("[" === wn.id && "var" !== e.id) {
						var r = wn;
						r.names = [],
						x("["),
						function o() {
							var n;
							if ("..." === wn.id && (n = !0,
							x("...")),
							!wn.identifier)
								return u("expected_identifier_a", wn);
							var i = wn;
							if (x(),
							r.names.push(i),
							v(i, "variable", "const" === e.id),
							n)
								i.ellipsis = !0;
							else if ("," === wn.id)
								return x(","),
								o()
						}(),
						x("]"),
						x("="),
						r.expression = m(0),
						e.names.push(r)
					} else {
						if (!wn.identifier)
							return u("expected_identifier_a", wn);
						var a = wn;
						x(),
						"ignore" === a.id && d("unexpected_a", a),
						v(a, "variable", n),
						("=" === wn.id || n) && (x("="),
						a.expression = m(0),
						a.init = !0),
						e.names.push(a)
					}
					return "," === wn.id ? (x(","),
					i()) : void 0
				}(),
				e.open = e.names.length > 1 && e.line !== e.names[1].line,
				w(),
				e
			}
			function P(n) {
				return function(i, t, r) {
					var a, s = n[i];
					"string" != typeof t && (r = t,
					t = "(all)"),
					void 0 === s && (s = e(),
					n[i] = s),
					a = s[t],
					void 0 === a && (a = [],
					s[t] = a),
					a.push(r)
				}
			}
			function M(e) {
				return function(n) {
					var i, t = e[n.arity];
					void 0 !== t && (i = t[n.id],
					void 0 !== i && i.forEach(function(e) {
						return e(n)
					}),
					i = t["(all)"],
					void 0 !== i && i.forEach(function(e) {
						return e(n)
					}))
				}
			}
			function H(e) {
				if (e)
					if (Array.isArray(e))
						e.forEach(H);
					else {
						switch (xi(e),
						H(e.expression),
						"function" === e.id && G(e.block),
						e.arity) {
						case "post":
						case "pre":
							d("unexpected_a", e);
							break;
						case "statement":
						case "assignment":
							d("unexpected_statement_a", e)
						}
						bi(e)
					}
			}
			function G(e) {
				if (e)
					if (Array.isArray(e))
						e.forEach(G);
					else {
						switch (xi(e),
						H(e.expression),
						e.arity) {
						case "statement":
						case "assignment":
							break;
						case "binary":
							"(" !== e.id && d("unexpected_expression_a", e);
							break;
						default:
							d("unexpected_expression_a", e)
						}
						G(e.block),
						G(e["else"]),
						bi(e)
					}
			}
			function K(e) {
				if ("variable" === e.arity) {
					var n = xn.context[e.id];
					if (void 0 === n) {
						if (Un.forEach(function(i) {
							var t = i.context[e.id];
							void 0 !== t && "label" !== t.role && (n = t)
						}),
						void 0 === n) {
							if (void 0 === un[e.id])
								return void d("undeclared_a", e);
							n = {
								dead: !1,
								"function": vn,
								id: e.id,
								init: !0,
								role: "variable",
								used: 0,
								writable: !1
							},
							vn.context[e.id] = n
						}
						n.closure = !0,
						xn.context[e.id] = n
					} else
						"label" === n.role && d("label_a", e);
					return n.dead && d("out_of_scope_a", e),
					n
				}
			}
			function Q(e) {
				e.init = !0,
				e.dead = !1,
				cn.live.push(e)
			}
			function V(e) {
				switch ("statement" === e.arity && cn.body !== !0 && d("unexpected_a", e),
				Un.push(xn),
				dn.push(cn),
				xn = e,
				cn = e,
				e.live = [],
				"object" == typeof e.name && (e.name.dead = !1,
				e.name.init = !0),
				e.extra) {
				case "get":
					0 !== e.parameters.length && d("bad_get", e);
					break;
				case "set":
					1 !== e.parameters.length && d("bad_set", e)
				}
				e.parameters.forEach(function(e) {
					H(e.expression),
					"{" === e.id || "[" === e.id ? e.names.forEach(Q) : (e.dead = !1,
					e.init = !0)
				})
			}
			function X(e) {
				kn.bitwise || Dn[e.id] !== !0 || d("unexpected_a", e),
				"(" === e.id || "&&" === e.id || "||" === e.id || "=" === e.id || !Array.isArray(e.expression) || 2 !== e.expression.length || Wn[e.expression[0].id] !== !0 && Wn[e.expression[1].id] !== !0 || d("unexpected_a", e)
			}
			function Y() {
				cn.live.forEach(function(e) {
					e.dead = !0
				}),
				delete cn.live,
				cn = dn.pop()
			}
			function en(e) {
				void 0 !== e.expression && (H(e.expression),
				"{" === e.id || "[" === e.id ? e.names.forEach(Q) : e.init = !0),
				e.dead = !1,
				cn.live.push(e)
			}
			function nn(e) {
				e.names.forEach(en)
			}
			function tn(e) {
				var n = K(e);
				return void 0 !== n && n.writable ? void (n.init = !0) : void d("bad_assignment_a", e)
			}
			function rn(e) {
				return delete xn.loop,
				delete xn["switch"],
				xn = Un.pop(),
				e.wrapped && d("unexpected_parens", e),
				Y()
			}
			function an(e) {
				Object.keys(e.context).forEach(function(n) {
					if ("ignore" !== n) {
						var i = e.context[n];
						i["function"] === e && (0 === i.used ? d("unused_a", i) : i.init || d("uninitialized_a", i))
					}
				})
			}
			function sn() {
				(gn === !0 || kn.node) && an(vn),
				bn.forEach(an)
			}
			function on() {
				function e(e) {
					d("expected_a_at_b_c", p, r(p), _n + e, s(p))
				}
				function n(n) {
					var i = x + n;
					return p.from !== i ? e(i) : void 0
				}
				function i() {
					(_.line !== p.line || _.thru !== p.from) && d("unexpected_space_a_b", p, r(_), r(p))
				}
				function t() {
					if (_.line === p.line)
						_.thru !== p.from && 0 === b && d("unexpected_space_a_b", p, r(_), r(p));
					else if (v) {
						var n = l ? x : x + 8;
						p.from < n && e(n)
					} else
						p.from !== x + 8 && e(x + 8)
				}
				function a() {
					(_.line !== p.line || _.thru + 1 !== p.from) && d("expected_space_a_b", p, r(_), r(p))
				}
				function o() {
					_.line === p.line ? _.thru + 1 !== p.from && 0 === b && d("expected_space_a_b", p, r(_), r(p)) : l ? p.from < x && e(x) : p.from !== x + 8 && e(x + 8)
				}
				function c() {
					var e = m.length;
					e > 0 && (x -= 4 * e),
					m = ""
				}
				var u, p, f = "(end)", l = !1, _ = vn, x = 0, b = 0, v = !0, m = "";
				Un = [],
				jn.forEach(function(s) {
					if (p = s,
					"(comment)" === p.id || "(end)" === p.id)
						b += 1;
					else {
						var h = Fn[_.id];
						if ("string" == typeof h)
							h !== p.id ? (Un.push({
								closer: f,
								free: l,
								margin: x,
								open: v,
								qmark: m
							}),
							m = "",
							f = h,
							_.line !== p.line ? (l = ")" === f && _.free,
							v = !0,
							x += 4,
							"label" === p.role ? 0 !== p.from && e(0) : p["switch"] ? (c(),
							n(-4)) : n(0)) : ((p.statement || "label" === p.role) && d("expected_line_break_a_b", p, r(_), r(p)),
							l = !1,
							v = !1,
							i())) : _.line === p.line ? t() : n(0);
						else if (p.id === f) {
							var y = Un.pop();
							x = y.margin,
							v && ";" !== p.id ? n(0) : i(),
							f = y.closer,
							l = y.free,
							v = y.open,
							m = y.qmark
						} else
							p["switch"] ? (c(),
							n(-4)) : "label" === p.role ? 0 !== p.from && e(0) : "," === _.id ? (c(),
							!v || (l || "]" === f) && _.line === p.line ? o() : n(0)) : "ternary" === p.arity ? ("?" === p.id ? (x += 4,
							m += "?") : (u = m.match(oi),
							m = u[1] + ":",
							x -= 4 * u[2].length),
							n(0)) : "..." === _.id || "," === p.id || ";" === p.id || ":" === p.id || "binary" === p.arity && ("(" === p.id || "[" === p.id) || "function" === p.arity && "function" !== _.id ? i() : "." === _.id ? i() : "." === p.id ? _.line === p.line ? t() : (ci.test(m) || (m += ".",
							x += 4),
							n(0)) : ";" === _.id ? (c(),
							v ? n(0) : o()) : "ternary" === _.arity || "case" === _.id || "catch" === _.id || "else" === _.id || "finally" === _.id || "while" === _.id || "catch" === p.id || "else" === p.id || "finally" === p.id || "while" === p.id && !p.statement || ")" === _.id && "{" === p.id ? a() : p.statement === !0 ? v ? n(0) : o() : "var" === _.id || "const" === _.id || "let" === _.id ? (Un.push({
								closer: f,
								free: l,
								margin: x,
								open: v,
								qmark: m
							}),
							f = ";",
							l = !1,
							v = _.open,
							m = "",
							v ? (x += 4,
							n(0)) : a()) : Bn[_.id] === !0 || Bn[p.id] === !0 || "binary" === _.arity && ("+" === _.id || "-" === _.id) || "binary" === p.arity && ("+" === p.id || "-" === p.id) || "function" === _.id || ":" === _.id || (_.identifier || "(string)" === _.id || "(number)" === _.id) && (p.identifier || "(string)" === p.id || "(number)" === p.id) || "statement" === _.arity && ";" !== p.id ? o() : "unary" === _.arity && i();
						b = 0,
						delete _.calls,
						delete _.dead,
						delete _.free,
						delete _.init,
						delete _.open,
						delete _.used,
						_ = p
					}
				})
			}
			var cn, dn, un, pn, fn, ln, _n, xn, bn, vn, mn, hn, yn, gn, wn, kn, An, En, Un, $n, Sn, Nn, jn, On, In, qn, Rn, zn = {
				bitwise: !0,
				browser: ["Audio", "clearInterval", "clearTimeout", "document", "event", "FormData", "frames", "history", "Image", "localStorage", "location", "name", "navigator", "Option", "screen", "sessionStorage", "setInterval", "setTimeout", "Storage", "XMLHttpRequest"],
				couch: ["emit", "getRow", "isArray", "log", "provides", "registerType", "require", "send", "start", "sum", "toJSON"],
				devel: ["alert", "confirm", "console", "Debug", "opera", "prompt", "WSH"],
				es6: ["ArrayBuffer", "DataView", "Float32Array", "Float64Array", "Generator", "GeneratorFunction", "Int8Array", "Int16Array", "Int32Array", "Intl", "Map", "Promise", "Proxy", "Reflect", "Set", "Symbol", "System", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "WeakSet"],
				eval: !0,
				"for": !0,
				fudge: !0,
				maxerr: 1e4,
				maxlen: 1e4,
				node: ["Buffer", "clearImmediate", "clearInterval", "clearTimeout", "console", "exports", "global", "module", "process", "require", "setImmediate", "setInterval", "setTimeout", "__dirname", "__filename"],
				"this": !0,
				white: !0
			}, Bn = {
				"!=": !0,
				"!==": !0,
				"%": !0,
				"%=": !0,
				"^": !0,
				"^=": !0,
				"&": !0,
				"&=": !0,
				"&&": !0,
				"*": !0,
				"*=": !0,
				"-=": !0,
				"+=": !0,
				"=": !0,
				"=>": !0,
				"==": !0,
				"===": !0,
				"|": !0,
				"|=": !0,
				"||": !0,
				"<": !0,
				"<=": !0,
				"<<": !0,
				"<<=": !0,
				">": !0,
				">=": !0,
				">>": !0,
				">>=": !0,
				">>>": !0,
				">>>=": !0
			}, Dn = {
				"~": !0,
				"^": !0,
				"^=": !0,
				"&": !0,
				"&=": !0,
				"|": !0,
				"|=": !0,
				"<<": !0,
				"<<=": !0,
				">>": !0,
				">>=": !0,
				">>>": !0,
				">>>=": !0
			}, Fn = {
				"(": ")",
				"[": "]",
				"{": "}",
				"${": "}"
			}, Wn = {
				"!=": !0,
				"!==": !0,
				"==": !0,
				"===": !0,
				"<": !0,
				"<=": !0,
				">": !0,
				">=": !0
			}, Zn = ["Array", "Boolean", "Date", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "Error", "EvalError", "Function", "isFinite", "isNaN", "JSON", "Math", "Number", "Object", "parseInt", "parseFloat", "RangeError", "ReferenceError", "RegExp", "String", "SyntaxError", "TypeError", "URIError"], Tn = {
				and: "The '&&' subexpression should be wrapped in parens.",
				bad_assignment_a: "Bad assignment to '{a}'.",
				bad_character_number_a: "Bad character code: '{a}'",
				bad_directive_a: "Bad directive '{a}'.",
				bad_get: "A get function takes no parameters.",
				bad_module_name_a: "Bad module name '{a}'.",
				bad_option_a: "Bad option '{a}'.",
				bad_property_a: "Bad property name '{a}'.",
				bad_set: "A set function takes one parameter.",
				duplicate_a: "Duplicate '{a}'.",
				empty_block: "Empty block.",
				es6: "Unexpected ES6 feature.",
				expected_a_at_b_c: "Expected '{a}' at column {b}, not column {c}.",
				expected_a_b: "Expected '{a}' and instead saw '{b}'.",
				expected_a_b_from_c_d: "Expected '{a}' to match '{b}' from line {c} and instead saw '{d}'.",
				expected_a_before_b: "Expected '{a}' before '{b}'.",
				expected_digits_after_a: "Expected digits after '{a}'.",
				expected_four_digits: "Expected four digits after '\\u'.",
				expected_identifier_a: "Expected an identifier and instead saw '{a}'.",
				expected_line_break_a_b: "Expected a line break between '{a}' and '{b}'.",
				expected_regexp_factor_a: "Expected a regexp factor and instead saw '{a}'.",
				expected_space_a_b: "Expected one space between '{a}' and '{b}'.",
				expected_statements_a: "Expected statements before '{a}'.",
				expected_string_a: "Expected a string and instead saw '{a}'.",
				expected_type_string_a: "Expected a type string and instead saw '{a}'.",
				function_in_loop: "Don't make functions within a loop.",
				infix_in: "Unexpected 'in'. Compare with undefined, or use the hasOwnProperty method instead.",
				isNaN: "Use the isNaN function to compare with NaN.",
				label_a: "'{a}' is a statement label.",
				misplaced_a: "Place '{a}' at the outermost level.",
				misplaced_directive_a: "Place the '/*{a}*/' directive before the first statement.",
				naked_block: "Naked block.",
				nested_comment: "Nested comment.",
				not_label_a: "'{a}' is not a label.",
				out_of_scope_a: "'{a}' is out of scope.",
				redefinition_a_b: "Redefinition of '{a}' from line {b}.",
				reserved_a: "Reserved name '{a}'.",
				slash_equal: "A regular expression literal can be confused with '/='.",
				subscript_a: "['{a}'] is better written in dot notation.",
				todo_comment: "Unexpected TODO comment.",
				too_long: "Line too long.",
				too_many: "Too many warnings.",
				unclosed_comment: "Unclosed comment.",
				unclosed_mega: "Unclosed mega literal.",
				unclosed_string: "Unclosed string.",
				undeclared_a: "Undeclared '{a}'.",
				unexpected_a: "Unexpected '{a}'.",
				unexpected_a_after_b: "Unexpected '{a}' after '{b}'.",
				unexpected_at_top_level_a: "Unexpected '{a}' at top level.",
				unexpected_char_a: "Unexpected character '{a}'.",
				unexpected_comment: "Unexpected comment.",
				unexpected_directive_a: "When using modules, don't use directive '/*{a}'.",
				unexpected_expression_a: "Unexpected expression '{a}' in statement position.",
				unexpected_label_a: "Unexpected label '{a}'.",
				unexpected_quotes_a: "Quotes are not needed around '{a}'.",
				unexpected_parens: "Don't wrap function literals in parens.",
				unexpected_space_a_b: "Unexpected space between '{a}' and '{b}'.",
				unexpected_statement_a: "Unexpected statement '{a}' in expression position.",
				unexpected_trailing_space: "Unexpected trailing space.",
				unexpected_typeof_a: "Unexpected 'typeof'. Use '===' to compare directly with {a}.",
				uninitialized_a: "Uninitialized '{a}'.",
				unreachable_a: "Unreachable '{a}'.",
				unregistered_property_a: "Unregistered property name '{a}'.",
				unsafe: "Unsafe character '{a}'.",
				unused_a: "Unused '{a}'.",
				use_spaces: "Use spaces, not tabs.",
				var_loop: "Don't declare variables in a loop.",
				var_switch: "Don't declare variables in a switch.",
				weird_condition_a: "Weird condition '{a}'.",
				weird_expression_a: "Weird expression '{a}'.",
				weird_loop: "Weird loop.",
				weird_relation_a: "Weird relation '{a}'.",
				wrap_immediate: "Wrap an immediate function invocation in parentheses to assist the reader in understanding that the expression is the result of a function, and not the function itself.",
				wrap_regexp: "Wrap this regexp in parens to avoid confusion."
			}, Cn = /\{([^{}]*)\}/g, Jn = /\n|\r\n?/, Ln = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/, Pn = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/, Mn = /^_|\$|Sync$|_$/, Hn = /[a-zA-Z0-9]/, Gn = /\*\//, Kn = /\/\*/, Qn = /\/\*|\/$/, Vn = /\b(?:todo|TO\s?DO|HACK)\b/, Xn = /\t/g, Yn = /^(jslint|property|global)\s*(.*)$/, ei = /^([a-zA-Z$_][a-zA-Z0-9$_]*)\s*(?::\s*(true|false|[0-9]+)\s*)?(?:,\s*)?(.*)$/, ni = /^((\s+)|([a-zA-Z_$][a-zA-Z0-9_$]*)|[(){}\[\]\?,:;'"~`]|=(?:==?|>)?|\.+|\/[=*\/]?|\*[\/=]?|\+(?:=|\++)?|-(?:=|-+)?|[\^%]=?|&[&=]?|\|[\|=]?|>{1,3}=?|<<?=?|!={0,2}|(0|[1-9][0-9]*))(.*)$/, ii = /^([0-9]+)(.*)$/, ti = /^([0-9a-fA-F]+)(.*)$/, ri = /^([0-7]+)(.*)$/, ai = /^([01]+)(.*)$/, si = /`|\$\{/, oi = /^(.*)\?([:.]*)$/, ci = /\.$/, di = /^-?\d+(?:\.\d*)?(?:e[\-+]?\d+)?$/i, ui = "anonymous";
			$n = e(),
			j("}"),
			j(")"),
			j("]"),
			j(","),
			j(";"),
			j(":"),
			j("*/"),
			j("await"),
			j("case"),
			j("catch"),
			j("class"),
			j("default"),
			j("else"),
			j("enum"),
			j("finally"),
			j("implements"),
			j("interface"),
			j("package"),
			j("private"),
			j("protected"),
			j("public"),
			j("static"),
			j("super"),
			j("void"),
			j("yield"),
			I("(number)", "number"),
			I("(regexp)", "regexp"),
			I("(string)", "string"),
			I("arguments", "object", function() {
				return d("unexpected_a", Sn),
				Sn
			}),
			I("eval", "function", function() {
				return kn.eval ? "(" !== wn.id && d("expected_a_before_b", wn, "(", r()) : d("unexpected_a", Sn),
				Sn
			}),
			I("false", "boolean", !1),
			I("ignore", "undefined", function() {
				return d("unexpected_a", Sn),
				Sn
			}),
			I("Infinity", "number", 1 / 0),
			I("NaN", "number", 0 / 0),
			I("null", "null", null ),
			I("this", "object", function() {
				return kn["this"] || d("unexpected_a", Sn),
				Sn
			}),
			I("true", "boolean", !0),
			I("undefined", "undefined"),
			O("="),
			O("+="),
			O("-="),
			O("*="),
			O("/="),
			O("%="),
			O("&="),
			O("|="),
			O("^="),
			O("<<="),
			O(">>="),
			O(">>>="),
			q("||", 40),
			q("&&", 50),
			q("|", 70),
			q("^", 80),
			q("&", 90),
			q("==", 100),
			q("===", 100),
			q("!=", 100),
			q("!==", 100),
			q("<", 110),
			q(">", 110),
			q("<=", 110),
			q(">=", 110),
			q("in", 110),
			q("instanceof", 110),
			q("<<", 120),
			q(">>", 120),
			q(">>>", 120),
			q("+", 130),
			q("-", 130),
			q("*", 140),
			q("/", 140),
			q("%", 140),
			q("(", 160, function(e) {
				var n, i = Sn;
				return "function" !== e.id && N(e, i),
				i.free = !1,
				i.expression = [e],
				e.identifier && (e["new"] ? e.id.charAt(0) > "Z" || "Boolean" === e.id || "Number" === e.id || "String" === e.id || "Symbol" === e.id && kn.es6 ? d("unexpected_a", e, "new") : "Function" === e.id ? kn.eval || d("unexpected_a", e, "new Function") : "Array" === e.id ? d("expected_a_b", e, "[]", "new Array") : "Object" === e.id && d("expected_a_b", e, "Object.create(null)", "new Object") : (e.id.charAt(0) >= "A" && e.id.charAt(0) <= "Z" && "Boolean" !== e.id && "Number" !== e.id && "String" !== e.id && "Symbol" !== e.id && d("expected_a_before_b", e, "new", r(e)),
				"statement" === xn.arity && (xn.name.calls[e.id] = e))),
				")" !== wn.id && !function t() {
					return n = m(10),
					i.expression.push(n),
					"," === wn.id ? (x(","),
					t()) : void 0
				}(),
				x(")", i),
				2 === i.expression.length && (n.wrapped === !0 && d("unexpected_a", i),
				"(" === n.id && (n.wrapped = !0)),
				i
			}),
			q(".", 170, function(e) {
				var n = Sn
				, i = wn;
				return "(string)" === e.id && "indexOf" === i.id || "[" === e.id && ("concat" === i.id || "forEach" === i.id) || "+" === e.id && "slice" === i.id || "(regexp)" === e.id && ("exec" === i.id || "test" === i.id) || N(e, n),
				i.identifier || u("expected_identifier_a"),
				x(),
				f(i),
				n.name = i,
				n.expression = e,
				n
			}),
			q("[", 170, function(e) {
				var n = Sn
				, i = m(0);
				return "(string)" === i.id && Pn.test(i.value) ? (d("subscript_a", i),
				f(i)) : "`" === i.id && d("unexpected_a", i),
				N(e, n),
				n.expression = [e, i],
				x("]"),
				n
			}),
			q("=>", 170, function(e) {
				return u("expected_a_before_b", e, "(", r(e))
			}),
			q("`", 160, function(e) {
				var n = W();
				return N(e, n),
				n.expression = [e].concat(n.expression),
				n
			}),
			R("++"),
			R("--"),
			z("++"),
			z("--"),
			B("+"),
			B("-"),
			B("~"),
			B("!"),
			B("!!"),
			B("[", function() {
				var e = Sn;
				return e.expression = [],
				"]" !== wn.id && !function n() {
					return e.expression.push(m(10)),
					"," === wn.id ? (x(","),
					n()) : void 0
				}(),
				x("]"),
				e
			}),
			B("/=", function() {
				u("expected_a_b", Sn, "/\\=", "/=")
			}),
			B("=>", function() {
				return u("expected_a_before_b", Sn, "()", "=>")
			}),
			B("new", function() {
				var e = Sn;
				return wn["new"] = !0,
				e.expression = m(150),
				"(" !== e.expression.id && d("expected_a_before_b", wn, "()", r(wn)),
				e
			}),
			B("typeof"),
			B("void", function() {
				var e = Sn;
				return d("unexpected_a", e),
				e.expression = m(0),
				e
			}),
			B("function", C),
			B("(", function() {
				var e, n = Sn, i = _().id;
				return ")" === wn.id || "..." === wn.id || wn.identifier && ("," === i || "=" === i) ? (n.free = !1,
				J(T())) : (n.free = !0,
				e = m(0),
				e.wrapped === !0 && d("unexpected_a", n),
				e.wrapped = !0,
				x(")", n),
				"=>" === wn.id ? "variable" !== e.arity ? u("expected_identifier_a", e) : (n.expression = [e],
				J([n.expression, "(" + e.id + ")"])) : e)
			}),
			B("`", W),
			B("{", function() {
				var n = Sn
				, i = e();
				return n.expression = [],
				"}" !== wn.id && !function t() {
					var e, a, s = !0, o = wn;
					if (x(),
					"get" !== o.id && "set" !== o.id || !wn.identifier || (s = o.id,
					o = wn,
					x()),
					e = f(o),
					i[e] === !0 ? d("duplicate_a", o) : "get" === i[e] && "set" !== s && d("expected_a_before_b", o, "set", r(o)),
					i[e] = "get" === s ? "get" : !0,
					o.identifier) {
						switch (wn.id) {
						case "}":
						case ",":
							kn.es6 ? s !== !0 && x(":") : d("es6"),
							o.arity = "variable",
							a = o;
							break;
						case "(":
							kn.es6 || "string" == typeof s || d("es6"),
							a = C({
								arity: "unary",
								from: o.from,
								id: "function",
								line: o.line,
								name: o,
								thru: o.from
							}, o);
							break;
						default:
							x(":"),
							a = m(0)
						}
						a.label = o,
						"string" == typeof s && (a.extra = s),
						n.expression.push(a)
					} else
						x(":"),
						a = m(0),
						a.label = o,
						n.expression.push(a);
					return "," === wn.id ? (x(","),
					t()) : void 0
				}(),
				x("}"),
				n
			}),
			D(";", function() {
				return d("unexpected_a", Sn),
				Sn
			}),
			D("{", function() {
				return d("naked_block", Sn),
				$("naked")
			}),
			D("break", function() {
				var e, n = Sn;
				return xn.loop < 1 && xn["switch"] < 1 && d("unexpected_a", n),
				n.disrupt = !0,
				wn.identifier && Sn.line === wn.line && (e = xn.context[wn.id],
				void 0 === e || "label" !== e.role || e.dead ? d(void 0 !== e && e.dead ? "out_of_scope_a" : "not_label_a") : e.used += 1,
				n.label = wn,
				x()),
				x(";"),
				n
			}),
			D("const", L),
			D("continue", function() {
				var e = Sn;
				return xn.loop < 1 && d("unexpected_a", e),
				E(e),
				e.disrupt = !0,
				d("unexpected_a", e),
				x(";"),
				e
			}),
			D("debugger", function() {
				var e = Sn;
				return kn.devel || d("unexpected_a", e),
				w(),
				e
			}),
			D("delete", function() {
				var e = Sn
				, n = m(0);
				return ("." !== n.id && "[" !== n.id || "binary" !== n.arity) && u("expected_a_b", n, ".", r(n)),
				e.expression = n,
				w(),
				e
			}),
			D("do", function() {
				var e = Sn;
				return E(e),
				xn.loop += 1,
				e.block = $(),
				x("while"),
				e.expression = h(),
				w(),
				e.block.disrupt === !0 && d("weird_loop", e),
				xn.loop -= 1,
				e
			}),
			D("export", function() {
				var e = Sn;
				return ln && d("es6", e),
				kn.es6 || d("es6", e),
				"object" == typeof gn && d("unexpected_directive_a", gn, gn.directive),
				gn = !0,
				x("default"),
				e.expression = m(0),
				w(),
				e
			}),
			D("for", function() {
				var e, n = Sn;
				return kn["for"] || d("unexpected_a", n),
				E(n),
				xn.loop += 1,
				x("("),
				Sn.free = !0,
				";" === wn.id ? u("expected_a_b", n, "while (", "for (;") : "var" === wn.id || "let" === wn.id || "const" === wn.id ? u("unexpected_a") : (e = m(0),
				"in" === e.id ? ("variable" !== e.expression[0].arity && d("bad_assignment_a", e.expression[0]),
				n.name = e.expression[0],
				n.expression = e.expression[1],
				d("expected_a_b", n, "Object.keys", "for in")) : (n.initial = e,
				x(";"),
				n.expression = m(0),
				x(";"),
				n.inc = m(0),
				"++" === n.inc.id && d("expected_a_b", n.inc, "+= 1", "++")),
				x(")"),
				n.block = $(),
				n.block.disrupt === !0 && d("weird_loop", n),
				xn.loop -= 1,
				n)
			}),
			D("function", C),
			D("if", function() {
				var e, n = Sn;
				return n.expression = h(),
				n.block = $(),
				"else" === wn.id && (x("else"),
				e = Sn,
				n["else"] = "if" === wn.id ? k() : $(),
				n.block.disrupt === !0 && (n["else"].disrupt === !0 ? n.disrupt = !0 : d("unexpected_a", e))),
				n
			}),
			D("import", function() {
				var e = Sn;
				if (kn.es6 ? "object" == typeof gn && d("unexpected_directive_a", gn, gn.directive) : d("es6", e),
				gn = !0,
				!wn.identifier)
					return u("expected_identifier_a");
				var n = wn;
				return x(),
				"ignore" === n.id && d("unexpected_a", n),
				v(n, "variable", !0),
				x("from"),
				x("(string)"),
				e["import"] = Sn,
				e.name = n,
				Pn.test(Sn.value) || d("bad_module_name_a", Sn),
				mn.push(Sn.value),
				w(),
				e
			}),
			D("let", L),
			D("return", function() {
				var e = Sn;
				return E(e),
				e.disrupt = !0,
				";" !== wn.id && e.line === wn.line && (e.expression = m(10)),
				x(";"),
				e
			}),
			D("switch", function() {
				var e, n, i = [], t = [], a = !0, s = Sn;
				return E(s),
				xn["switch"] += 1,
				x("("),
				Sn.free = !0,
				s.expression = m(0),
				s.block = t,
				x(")"),
				x("{"),
				function o() {
					var s = wn;
					return s.arity = "statement",
					s.expression = [],
					function c() {
						x("case"),
						Sn["switch"] = !0;
						var e = m(0);
						return i.some(function(n) {
							return g(n, e)
						}) && d("unexpected_a", e),
						i.push(e),
						s.expression.push(e),
						x(":"),
						"case" === wn.id ? c() : void 0
					}(),
					n = A(),
					n.length < 1 ? void d("expected_statements_a") : (s.block = n,
					t.push(s),
					e = n[n.length - 1],
					e.disrupt ? "break" === e.id && void 0 === e.label && (a = !1) : d("expected_a_before_b", wn, "break;", r(wn)),
					"case" === wn.id ? o() : void 0)
				}(),
				i = void 0,
				"default" === wn.id ? (x("default"),
				Sn["switch"] = !0,
				x(":"),
				s["else"] = A(),
				s["else"].length < 1 ? (d("expected_statements_a"),
				a = !1) : a = a && s["else"][s["else"].length - 1].disrupt) : a = !1,
				x("}", s),
				xn["switch"] -= 1,
				s.disrupt = a,
				s
			}),
			D("throw", function() {
				var e = Sn;
				return e.disrupt = !0,
				e.expression = m(10),
				w(),
				e
			}),
			D("try", function() {
				var e, n, i = !1, t = Sn;
				if (t.block = $(),
				n = t.block.disrupt,
				"catch" === wn.id) {
					var a = "ignore";
					if (i = !0,
					e = wn,
					t["catch"] = e,
					x("catch"),
					x("("),
					!wn.identifier)
						return u("expected_identifier_a", wn);
					"ignore" !== wn.id && (a = void 0,
					e.name = wn,
					v(wn, "exception", !0)),
					x(),
					x(")"),
					e.block = $(a),
					e.block.disrupt !== !0 && (n = !1)
				}
				return "finally" === wn.id && (i = !0,
				x("finally"),
				t["else"] = $(),
				n = t["else"].disrupt),
				t.disrupt = n,
				i || d("expected_a_before_b", wn, "catch", r(wn)),
				t
			}),
			D("var", L),
			D("while", function() {
				var e = Sn;
				return E(e),
				xn.loop += 1,
				e.expression = h(),
				e.block = $(),
				e.block.disrupt === !0 && d("weird_loop", e),
				xn.loop -= 1,
				e
			}),
			D("with", function() {
				u("unexpected_a", Sn)
			}),
			F("?", ":");
			var pi = e()
			, fi = e()
			, li = P(fi)
			, _i = P(pi)
			, xi = M(fi)
			, bi = M(pi);
			return li("assignment", X),
			li("binary", X),
			li("binary", function(e) {
				if (Wn[e.id] === !0) {
					var n = e.expression[0]
					, i = e.expression[1];
					if ("NaN" === n.id || "NaN" === i.id)
						d("isNaN", e);
					else if ("typeof" === n.id)
						if ("(string)" !== i.id)
							"typeof" !== i.id && d("expected_string_a", i);
						else {
							var t = i.value;
							"symbol" === t ? kn.es6 || d("es6", i, t) : "null" === t || "undefined" === t ? d("unexpected_typeof_a", i, t) : "boolean" !== t && "function" !== t && "number" !== t && "object" !== t && "string" !== t && d("expected_type_string_a", i, t)
						}
				}
			}),
			li("binary", "==", function(e) {
				d("expected_a_b", e, "===", "==")
			}),
			li("binary", "!=", function(e) {
				d("expected_a_b", e, "!==", "!=")
			}),
			li("binary", "=>", V),
			li("binary", "||", function(e) {
				e.expression.forEach(function(e) {
					"&&" !== e.id || e.wrapped || d("and", e)
				})
			}),
			li("binary", "(", function(e) {
				var n = e.expression[0];
				if (n.identifier && void 0 === xn.context[n.id] && "object" == typeof xn.name) {
					var i = xn.name["function"];
					if (i) {
						var t = i.context[n.id];
						void 0 !== t && t.dead && t["function"] === i && void 0 !== t.calls && void 0 !== t.calls[xn.name.id] && (t.dead = !1)
					}
				}
			}),
			li("binary", "in", function(e) {
				d("infix_in", e)
			}),
			li("statement", "{", function(e) {
				dn.push(cn),
				cn = e,
				e.live = []
			}),
			li("statement", "for", function(e) {
				if (void 0 !== e.name) {
					var n = K(e.name);
					void 0 !== n && (n.init = !0,
					n.writable || d("bad_assignment_a", e.name))
				}
				G(e.initial)
			}),
			li("statement", "function", V),
			li("unary", "~", X),
			li("unary", "function", V),
			li("variable", function(e) {
				var n = K(e);
				void 0 !== n && (e.variable = n,
				n.used += 1)
			}),
			_i("assignment", function(e) {
				if ("=" === e.id)
					void 0 !== e.names && (Array.isArray(e.names) ? e.names.forEach(tn) : tn(e.names));
				else {
					var n = e.expression[0];
					"variable" === n.arity && (n.variable && n.variable.writable === !0 || d("bad_assignment_a", n))
				}
			}),
			_i("binary", function(e) {
				switch (Wn[e.id] && (y(e.expression[0]) || y(e.expression[1]) || g(e.expression[0], e.expression[1]) || e.expression[0].constant === !0 && e.expression[1].constant === !0) && d("weird_relation_a", e),
				e.id) {
				case "=>":
				case "(":
					break;
				case ".":
					"RegExp" === e.expression.id && d("weird_expression_a", e);
					break;
				default:
					e.expression[0].constant === !0 && e.expression[1].constant === !0 && (e.constant = !0)
				}
			}),
			_i("binary", "&&", function(e) {
				(y(e.expression[0]) || g(e.expression[0], e.expression[1]) || e.expression[0].constant === !0 || e.expression[1].constant === !0) && d("weird_condition_a", e)
			}),
			_i("binary", "||", function(e) {
				(y(e.expression[0]) || g(e.expression[0], e.expression[1]) || e.expression[0].constant === !0) && d("weird_condition_a", e)
			}),
			_i("binary", "=>", rn),
			_i("binary", "(", function(e) {
				e.wrapped || "function" !== e.expression[0].id || d("wrap_immediate", e)
			}),
			_i("binary", "[", function(e) {
				"RegExp" === e.expression[0].id && d("weird_expression_a", e),
				y(e.expression[1]) && d("weird_expression_a", e.expression[1])
			}),
			_i("statement", "{", Y),
			_i("statement", "const", nn),
			_i("statement", "export", U),
			_i("statement", "for", function(e) {
				G(e.inc)
			}),
			_i("statement", "function", rn),
			_i("statement", "import", function(e) {
				var n = e.name;
				return n.init = !0,
				n.dead = !1,
				cn.live.push(n),
				U(e)
			}),
			_i("statement", "let", nn),
			_i("statement", "try", function(e) {
				if (void 0 !== e["catch"]) {
					var n = e["catch"].name;
					if (void 0 !== n) {
						var i = xn.context[n.id];
						i.dead = !1,
						i.init = !0
					}
					G(e["catch"].block)
				}
			}),
			_i("statement", "var", nn),
			_i("ternary", function(e) {
				y(e.expression[0]) || e.expression[0].constant === !0 || g(e.expression[1], e.expression[2]) ? d("unexpected_a", e) : g(e.expression[0], e.expression[1]) ? d("expected_a_b", e, "||", "?") : g(e.expression[0], e.expression[2]) ? d("expected_a_b", e, "&&", "?") : "true" === e.expression[1].id && "false" === e.expression[2].id ? d("expected_a_b", e, "!!", "?") : "false" === e.expression[1].id && "true" === e.expression[2].id && d("expected_a_b", e, "!", "?")
			}),
			_i("unary", function(e) {
				switch (e.id) {
				case "[":
				case "{":
				case "function":
				case "new":
					break;
				case "`":
					e.expression.every(function(e) {
						return e.constant
					}) && (e.constant = !0);
					break;
				default:
					e.expression.constant === !0 && (e.constant = !0)
				}
			}),
			_i("unary", "function", rn),
			function(i, t, r) {
				try {
					Rn = [],
					kn = t || e(),
					ui = "anonymous",
					dn = [],
					un = e(),
					pn = !0,
					fn = !0,
					ln = !0,
					_n = kn.fudge ? 1 : 0,
					bn = [],
					vn = {
						id: "(global)",
						body: !0,
						context: e(),
						from: 0,
						level: 0,
						line: 0,
						live: [],
						loop: 0,
						"switch": 0,
						thru: 0
					},
					cn = vn,
					xn = vn,
					mn = [],
					hn = !1,
					En = !1,
					gn = !1,
					wn = vn,
					An = e(),
					Un = [],
					On = void 0,
					Sn = vn,
					Nn = 0,
					qn = void 0,
					n(un, Zn, !1),
					void 0 !== r && n(un, r, !1),
					Object.keys(kn).forEach(function(e) {
						if (kn[e] === !0) {
							var i = zn[e];
							Array.isArray(i) && n(un, i, !1)
						}
					}),
					p(i),
					x(),
					"{" === jn[0].id || "[" === jn[0].id ? (hn = !0,
					In = b(),
					x("(end)")) : (kn.browser ? ";" === wn.id && x(";") : "(string)" === wn.id && "use strict" === wn.value && (x("(string)"),
					x(";"),
					vn.strict = !0),
					In = A(),
					x("(end)"),
					xn = vn,
					G(In),
					sn(),
					kn.white || on()),
					fn = !1
				} catch (a) {
					"JSLintError" !== a.name && Rn.push(a)
				}
				return {
					edition: "2015-08-20",
					functions: bn,
					global: vn,
					id: "(JSLint)",
					imports: mn,
					json: hn,
					lines: yn,
					module: gn === !0,
					ok: 0 === Rn.length && !fn,
					option: kn,
					property: An,
					stop: fn,
					tokens: jn,
					tree: In,
					warnings: Rn.sort(function(e, n) {
						return e.line - n.line || e.column - n.column
					})
				}
			}
		}();
		
		/*!
	CSSLint
	Copyright (c) 2015 Nicole Sullivan and Nicholas C. Zakas. All rights reserved.
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the 'Software'), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/
		var exports = exports || {}
		, CSSLint = function() {
			/*!
	Parser-Lib
	Copyright (c) 2009-2011 Nicholas C. Zakas. All rights reserved.
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/
			function i(n, t) {
				"use strict";
				this.messages = [];
				this.stats = [];
				this.lines = n;
				this.ruleset = t
			}
			var t = {}, r, n;
			return function() {
				function u() {
					this._listeners = {}
				}
				function i(n) {
					this._input = n.replace(/\n\r?/g, "\n");
					this._line = 1;
					this._col = 1;
					this._cursor = 0
				}
				function f(n, t, i) {
					this.col = i;
					this.line = t;
					this.message = n
				}
				function n(n, t, i, r) {
					this.col = i;
					this.line = t;
					this.text = n;
					this.type = r
				}
				function r(n, t) {
					this._reader = n ? new i(n.toString()) : null ;
					this._token = null ;
					this._tokenData = t;
					this._lt = [];
					this._ltIndex = 0;
					this._ltIndexCache = []
				}
				u.prototype = {
					constructor: u,
					addListener: function(n, t) {
						this._listeners[n] || (this._listeners[n] = []);
						this._listeners[n].push(t)
					},
					fire: function(n) {
						var i, t, r;
						if (typeof n == "string" && (n = {
							type: n
						}),
						typeof n.target != "undefined" && (n.target = this),
						typeof n.type == "undefined")
							throw new Error("Event object missing 'type' property.");
						if (this._listeners[n.type])
							for (i = this._listeners[n.type].concat(),
							t = 0,
							r = i.length; t < r; t++)
								i[t].call(this, n)
					},
					removeListener: function(n, t) {
						var r, i, u;
						if (this._listeners[n])
							for (r = this._listeners[n],
							i = 0,
							u = r.length; i < u; i++)
								if (r[i] === t) {
									r.splice(i, 1);
									break
								}
					}
				};
				i.prototype = {
					constructor: i,
					getCol: function() {
						return this._col
					},
					getLine: function() {
						return this._line
					},
					eof: function() {
						return this._cursor == this._input.length
					},
					peek: function(n) {
						var t = null ;
						return n = typeof n == "undefined" ? 1 : n,
						this._cursor < this._input.length && (t = this._input.charAt(this._cursor + n - 1)),
						t
					},
					read: function() {
						var n = null ;
						return this._cursor < this._input.length && (this._input.charAt(this._cursor) == "\n" ? (this._line++,
						this._col = 1) : this._col++,
						n = this._input.charAt(this._cursor++)),
						n
					},
					mark: function() {
						this._bookmark = {
							cursor: this._cursor,
							line: this._line,
							col: this._col
						}
					},
					reset: function() {
						this._bookmark && (this._cursor = this._bookmark.cursor,
						this._line = this._bookmark.line,
						this._col = this._bookmark.col,
						delete this._bookmark)
					},
					readTo: function(n) {
						for (var t = "", i; t.length < n.length || t.lastIndexOf(n) != t.length - n.length; )
							if (i = this.read(),
							i)
								t += i;
							else
								throw new Error('Expected "' + n + '" at line ' + this._line + ", col " + this._col + ".");
						return t
					},
					readWhile: function(n) {
						for (var i = "", t = this.read(); t !== null  && n(t); )
							i += t,
							t = this.read();
						return i
					},
					readMatch: function(n) {
						var i = this._input.substring(this._cursor)
						, t = null ;
						return typeof n == "string" ? i.indexOf(n) === 0 && (t = this.readCount(n.length)) : n instanceof RegExp && n.test(i) && (t = this.readCount(RegExp.lastMatch.length)),
						t
					},
					readCount: function(n) {
						for (var t = ""; n--; )
							t += this.read();
						return t
					}
				};
				f.prototype = new Error;
				n.fromToken = function(t) {
					return new n(t.value,t.startLine,t.startCol)
				}
				;
				n.prototype = {
					constructor: n,
					valueOf: function() {
						return this.toString()
					},
					toString: function() {
						return this.text
					}
				};
				r.createTokenData = function(n) {
					var r = []
					, u = {}
					, t = n.concat([])
					, i = 0
					, f = t.length + 1;
					for (t.UNKNOWN = -1,
					t.unshift({
						name: "EOF"
					}); i < f; i++)
						r.push(t[i].name),
						t[t[i].name] = i,
						t[i].text && (u[t[i].text] = i);
					return t.name = function(n) {
						return r[n]
					}
					,
					t.type = function(n) {
						return u[n]
					}
					,
					t
				}
				;
				r.prototype = {
					constructor: r,
					match: function(n, t) {
						n instanceof Array || (n = [n]);
						for (var r = this.get(t), i = 0, u = n.length; i < u; )
							if (r == n[i++])
								return !0;
						return this.unget(),
						!1
					},
					mustMatch: function(n) {
						var t;
						if (n instanceof Array || (n = [n]),
						!this.match.apply(this, arguments)) {
							t = this.LT(1);
							throw new f("Expected " + this._tokenData[n[0]].name + " at line " + t.startLine + ", col " + t.startCol + ".",t.startLine,t.startCol);
						}
					},
					advance: function(n, t) {
						while (this.LA(0) !== 0 && !this.match(n, t))
							this.get();
						return this.LA(0)
					},
					get: function(n) {
						var r = this._tokenData, f = this._reader, u = 0, e = r.length, i, t;
						if (this._lt.length && this._ltIndex >= 0 && this._ltIndex < this._lt.length) {
							for (u++,
							this._token = this._lt[this._ltIndex++],
							t = r[this._token.type]; t.channel !== undefined && n !== t.channel && this._ltIndex < this._lt.length; )
								this._token = this._lt[this._ltIndex++],
								t = r[this._token.type],
								u++;
							if ((t.channel === undefined || n === t.channel) && this._ltIndex <= this._lt.length)
								return this._ltIndexCache.push(u),
								this._token.type
						}
						return i = this._getToken(),
						i.type > -1 && !r[i.type].hide && (i.channel = r[i.type].channel,
						this._token = i,
						this._lt.push(i),
						this._ltIndexCache.push(this._lt.length - this._ltIndex + u),
						this._lt.length > 5 && this._lt.shift(),
						this._ltIndexCache.length > 5 && this._ltIndexCache.shift(),
						this._ltIndex = this._lt.length),
						t = r[i.type],
						t && (t.hide || t.channel !== undefined && n !== t.channel) ? this.get(n) : i.type
					},
					LA: function(n) {
						var t = n, i;
						if (n > 0) {
							if (n > 5)
								throw new Error("Too much lookahead.");
							while (t)
								i = this.get(),
								t--;
							while (t < n)
								this.unget(),
								t++
						} else if (n < 0)
							if (this._lt[this._ltIndex + n])
								i = this._lt[this._ltIndex + n].type;
							else
								throw new Error("Too much lookbehind.");
						else
							i = this._token.type;
						return i
					},
					LT: function(n) {
						return this.LA(n),
						this._lt[this._ltIndex + n - 1]
					},
					peek: function() {
						return this.LA(1)
					},
					token: function() {
						return this._token
					},
					tokenName: function(n) {
						return n < 0 || n > this._tokenData.length ? "UNKNOWN_TOKEN" : this._tokenData[n].name
					},
					tokenType: function(n) {
						return this._tokenData[n] || -1
					},
					unget: function() {
						if (this._ltIndexCache.length)
							this._ltIndex -= this._ltIndexCache.pop(),
							this._token = this._lt[this._ltIndex - 1];
						else
							throw new Error("Too much lookahead.");
					}
				};
				t.util = {
					StringReader: i,
					SyntaxError: f,
					SyntaxUnit: n,
					EventTarget: u,
					TokenStreamBase: r
				}
			}(),
			function() {
				function l(n, t, i) {
					SyntaxUnit.call(this, n, t, i, Parser.COMBINATOR_TYPE);
					this.type = "unknown";
					/^\s+$/.test(n) ? this.type = "descendant" : n == ">" ? this.type = "child" : n == "+" ? this.type = "adjacent-sibling" : n == "~" && (this.type = "sibling")
				}
				function y(n, t) {
					SyntaxUnit.call(this, "(" + n + (t !== null  ? ":" + t : "") + ")", n.startLine, n.startCol, Parser.MEDIA_FEATURE_TYPE);
					this.name = n;
					this.value = t
				}
				function p(n, t, i, r, u) {
					SyntaxUnit.call(this, (n ? n + " " : "") + (t ? t : "") + (t && i.length > 0 ? " and " : "") + i.join(" and "), r, u, Parser.MEDIA_QUERY_TYPE);
					this.modifier = n;
					this.mediaType = t;
					this.features = i
				}
				function Parser(n) {
					it.call(this);
					this.options = n || {};
					this._tokenStream = null 
				}
				function a(n, t, i, r) {
					SyntaxUnit.call(this, n, i, r, Parser.PROPERTY_NAME_TYPE);
					this.hack = t
				}
				function w(n, t, i) {
					SyntaxUnit.call(this, n.join(" "), t, i, Parser.PROPERTY_VALUE_TYPE);
					this.parts = n
				}
				function e(n) {
					this._i = 0;
					this._parts = n.parts;
					this._marks = [];
					this.value = n
				}
				function o(text, line, col) {
					SyntaxUnit.call(this, text, line, col, Parser.PROPERTY_VALUE_PART_TYPE);
					this.type = "unknown";
					var temp;
					if (/^([+\-]?[\d\.]+)([a-z]+)$/i.test(text)) {
						this.type = "dimension";
						this.value = +RegExp.$1;
						this.units = RegExp.$2;
						switch (this.units.toLowerCase()) {
						case "em":
						case "rem":
						case "ex":
						case "px":
						case "cm":
						case "mm":
						case "in":
						case "pt":
						case "pc":
						case "ch":
						case "vh":
						case "vw":
						case "vmax":
						case "vmin":
							this.type = "length";
							break;
						case "deg":
						case "rad":
						case "grad":
							this.type = "angle";
							break;
						case "ms":
						case "s":
							this.type = "time";
							break;
						case "hz":
						case "khz":
							this.type = "frequency";
							break;
						case "dpi":
						case "dpcm":
							this.type = "resolution"
						}
					} else
						/^([+\-]?[\d\.]+)%$/i.test(text) ? (this.type = "percentage",
						this.value = +RegExp.$1) : /^([+\-]?\d+)$/i.test(text) ? (this.type = "integer",
						this.value = +RegExp.$1) : /^([+\-]?[\d\.]+)$/i.test(text) ? (this.type = "number",
						this.value = +RegExp.$1) : /^#([a-f0-9]{3,6})/i.test(text) ? (this.type = "color",
						temp = RegExp.$1,
						temp.length == 3 ? (this.red = parseInt(temp.charAt(0) + temp.charAt(0), 16),
						this.green = parseInt(temp.charAt(1) + temp.charAt(1), 16),
						this.blue = parseInt(temp.charAt(2) + temp.charAt(2), 16)) : (this.red = parseInt(temp.substring(0, 2), 16),
						this.green = parseInt(temp.substring(2, 4), 16),
						this.blue = parseInt(temp.substring(4, 6), 16))) : /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i.test(text) ? (this.type = "color",
						this.red = +RegExp.$1,
						this.green = +RegExp.$2,
						this.blue = +RegExp.$3) : /^rgb\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i.test(text) ? (this.type = "color",
						this.red = +RegExp.$1 * 255 / 100,
						this.green = +RegExp.$2 * 255 / 100,
						this.blue = +RegExp.$3 * 255 / 100) : /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/i.test(text) ? (this.type = "color",
						this.red = +RegExp.$1,
						this.green = +RegExp.$2,
						this.blue = +RegExp.$3,
						this.alpha = +RegExp.$4) : /^rgba\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d\.]+)\s*\)/i.test(text) ? (this.type = "color",
						this.red = +RegExp.$1 * 255 / 100,
						this.green = +RegExp.$2 * 255 / 100,
						this.blue = +RegExp.$3 * 255 / 100,
						this.alpha = +RegExp.$4) : /^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i.test(text) ? (this.type = "color",
						this.hue = +RegExp.$1,
						this.saturation = +RegExp.$2 / 100,
						this.lightness = +RegExp.$3 / 100) : /^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d\.]+)\s*\)/i.test(text) ? (this.type = "color",
						this.hue = +RegExp.$1,
						this.saturation = +RegExp.$2 / 100,
						this.lightness = +RegExp.$3 / 100,
						this.alpha = +RegExp.$4) : /^url\(["']?([^\)"']+)["']?\)/i.test(text) ? (this.type = "uri",
						this.uri = RegExp.$1) : /^([^\(]+)\(/i.test(text) ? (this.type = "function",
						this.name = RegExp.$1,
						this.value = text) : /^["'][^"']*["']/.test(text) ? (this.type = "string",
						this.value = eval(text)) : Colors[text.toLowerCase()] ? (this.type = "color",
						temp = Colors[text.toLowerCase()].substring(1),
						this.red = parseInt(temp.substring(0, 2), 16),
						this.green = parseInt(temp.substring(2, 4), 16),
						this.blue = parseInt(temp.substring(4, 6), 16)) : /^[\,\/]$/.test(text) ? (this.type = "operator",
						this.value = text) : /^[a-z\-_\u0080-\uFFFF][a-z0-9\-_\u0080-\uFFFF]*$/i.test(text) && (this.type = "identifier",
						this.value = text)
				}
				function b(n, t, i) {
					SyntaxUnit.call(this, n.join(" "), t, i, Parser.SELECTOR_TYPE);
					this.parts = n;
					this.specificity = v.calculate(this)
				}
				function s(n, t, i, r, u) {
					SyntaxUnit.call(this, i, r, u, Parser.SELECTOR_PART_TYPE);
					this.elementName = n;
					this.modifiers = t
				}
				function u(n, t, i, r) {
					SyntaxUnit.call(this, n, i, r, Parser.SELECTOR_SUB_PART_TYPE);
					this.type = t;
					this.args = []
				}
				function v(n, t, i, r) {
					this.a = n;
					this.b = t;
					this.c = i;
					this.d = r
				}
				function d(n) {
					return n !== null  && st.test(n)
				}
				function g(n) {
					return n !== null  && /\d/.test(n)
				}
				function k(n) {
					return n !== null  && /\s/.test(n)
				}
				function ft(n) {
					return n !== null  && ht.test(n)
				}
				function nt(n) {
					return n !== null  && /[a-z_\u0080-\uFFFF\\]/i.test(n)
				}
				function et(n) {
					return n !== null  && (nt(n) || /[0-9\-\\]/.test(n))
				}
				function ot(n) {
					return n !== null  && (nt(n) || /\-\\/.test(n))
				}
				function ct(n, t) {
					for (var i in t)
						t.hasOwnProperty(i) && (n[i] = t[i]);
					return n
				}
				function h(t) {
					rt.call(this, t, n)
				}
				function r(n, t, i) {
					this.col = i;
					this.line = t;
					this.message = n
				}
				var it = t.util.EventTarget, rt = t.util.TokenStreamBase, lt = t.util.StringReader, f = t.util.SyntaxError, SyntaxUnit = t.util.SyntaxUnit, Colors = {
					aliceblue: "#f0f8ff",
					antiquewhite: "#faebd7",
					aqua: "#00ffff",
					aquamarine: "#7fffd4",
					azure: "#f0ffff",
					beige: "#f5f5dc",
					bisque: "#ffe4c4",
					black: "#000000",
					blanchedalmond: "#ffebcd",
					blue: "#0000ff",
					blueviolet: "#8a2be2",
					brown: "#a52a2a",
					burlywood: "#deb887",
					cadetblue: "#5f9ea0",
					chartreuse: "#7fff00",
					chocolate: "#d2691e",
					coral: "#ff7f50",
					cornflowerblue: "#6495ed",
					cornsilk: "#fff8dc",
					crimson: "#dc143c",
					cyan: "#00ffff",
					darkblue: "#00008b",
					darkcyan: "#008b8b",
					darkgoldenrod: "#b8860b",
					darkgray: "#a9a9a9",
					darkgrey: "#a9a9a9",
					darkgreen: "#006400",
					darkkhaki: "#bdb76b",
					darkmagenta: "#8b008b",
					darkolivegreen: "#556b2f",
					darkorange: "#ff8c00",
					darkorchid: "#9932cc",
					darkred: "#8b0000",
					darksalmon: "#e9967a",
					darkseagreen: "#8fbc8f",
					darkslateblue: "#483d8b",
					darkslategray: "#2f4f4f",
					darkslategrey: "#2f4f4f",
					darkturquoise: "#00ced1",
					darkviolet: "#9400d3",
					deeppink: "#ff1493",
					deepskyblue: "#00bfff",
					dimgray: "#696969",
					dimgrey: "#696969",
					dodgerblue: "#1e90ff",
					firebrick: "#b22222",
					floralwhite: "#fffaf0",
					forestgreen: "#228b22",
					fuchsia: "#ff00ff",
					gainsboro: "#dcdcdc",
					ghostwhite: "#f8f8ff",
					gold: "#ffd700",
					goldenrod: "#daa520",
					gray: "#808080",
					grey: "#808080",
					green: "#008000",
					greenyellow: "#adff2f",
					honeydew: "#f0fff0",
					hotpink: "#ff69b4",
					indianred: "#cd5c5c",
					indigo: "#4b0082",
					ivory: "#fffff0",
					khaki: "#f0e68c",
					lavender: "#e6e6fa",
					lavenderblush: "#fff0f5",
					lawngreen: "#7cfc00",
					lemonchiffon: "#fffacd",
					lightblue: "#add8e6",
					lightcoral: "#f08080",
					lightcyan: "#e0ffff",
					lightgoldenrodyellow: "#fafad2",
					lightgray: "#d3d3d3",
					lightgrey: "#d3d3d3",
					lightgreen: "#90ee90",
					lightpink: "#ffb6c1",
					lightsalmon: "#ffa07a",
					lightseagreen: "#20b2aa",
					lightskyblue: "#87cefa",
					lightslategray: "#778899",
					lightslategrey: "#778899",
					lightsteelblue: "#b0c4de",
					lightyellow: "#ffffe0",
					lime: "#00ff00",
					limegreen: "#32cd32",
					linen: "#faf0e6",
					magenta: "#ff00ff",
					maroon: "#800000",
					mediumaquamarine: "#66cdaa",
					mediumblue: "#0000cd",
					mediumorchid: "#ba55d3",
					mediumpurple: "#9370d8",
					mediumseagreen: "#3cb371",
					mediumslateblue: "#7b68ee",
					mediumspringgreen: "#00fa9a",
					mediumturquoise: "#48d1cc",
					mediumvioletred: "#c71585",
					midnightblue: "#191970",
					mintcream: "#f5fffa",
					mistyrose: "#ffe4e1",
					moccasin: "#ffe4b5",
					navajowhite: "#ffdead",
					navy: "#000080",
					oldlace: "#fdf5e6",
					olive: "#808000",
					olivedrab: "#6b8e23",
					orange: "#ffa500",
					orangered: "#ff4500",
					orchid: "#da70d6",
					palegoldenrod: "#eee8aa",
					palegreen: "#98fb98",
					paleturquoise: "#afeeee",
					palevioletred: "#d87093",
					papayawhip: "#ffefd5",
					peachpuff: "#ffdab9",
					peru: "#cd853f",
					pink: "#ffc0cb",
					plum: "#dda0dd",
					powderblue: "#b0e0e6",
					purple: "#800080",
					red: "#ff0000",
					rosybrown: "#bc8f8f",
					royalblue: "#4169e1",
					saddlebrown: "#8b4513",
					salmon: "#fa8072",
					sandybrown: "#f4a460",
					seagreen: "#2e8b57",
					seashell: "#fff5ee",
					sienna: "#a0522d",
					silver: "#c0c0c0",
					skyblue: "#87ceeb",
					slateblue: "#6a5acd",
					slategray: "#708090",
					slategrey: "#708090",
					snow: "#fffafa",
					springgreen: "#00ff7f",
					steelblue: "#4682b4",
					tan: "#d2b48c",
					teal: "#008080",
					thistle: "#d8bfd8",
					tomato: "#ff6347",
					turquoise: "#40e0d0",
					violet: "#ee82ee",
					wheat: "#f5deb3",
					white: "#ffffff",
					whitesmoke: "#f5f5f5",
					yellow: "#ffff00",
					yellowgreen: "#9acd32",
					activeBorder: "Active window border.",
					activecaption: "Active window caption.",
					appworkspace: "Background color of multiple document interface.",
					background: "Desktop background.",
					buttonface: "The face background color for 3-D elements that appear 3-D due to one layer of surrounding border.",
					buttonhighlight: "The color of the border facing the light source for 3-D elements that appear 3-D due to one layer of surrounding border.",
					buttonshadow: "The color of the border away from the light source for 3-D elements that appear 3-D due to one layer of surrounding border.",
					buttontext: "Text on push buttons.",
					captiontext: "Text in caption, size box, and scrollbar arrow box.",
					graytext: "Grayed (disabled) text. This color is set to #000 if the current display driver does not support a solid gray color.",
					greytext: "Greyed (disabled) text. This color is set to #000 if the current display driver does not support a solid grey color.",
					highlight: "Item(s) selected in a control.",
					highlighttext: "Text of item(s) selected in a control.",
					inactiveborder: "Inactive window border.",
					inactivecaption: "Inactive window caption.",
					inactivecaptiontext: "Color of text in an inactive caption.",
					infobackground: "Background color for tooltip controls.",
					infotext: "Text color for tooltip controls.",
					menu: "Menu background.",
					menutext: "Text in menus.",
					scrollbar: "Scroll bar gray area.",
					threeddarkshadow: "The color of the darker (generally outer) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
					threedface: "The face background color for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
					threedhighlight: "The color of the lighter (generally outer) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
					threedlightshadow: "The color of the darker (generally inner) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
					threedshadow: "The color of the lighter (generally inner) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
					window: "Window background.",
					windowframe: "Window frame.",
					windowtext: "Text in windows."
				}, ut, c, n, tt, i;
				l.prototype = new SyntaxUnit;
				l.prototype.constructor = l;
				y.prototype = new SyntaxUnit;
				y.prototype.constructor = y;
				p.prototype = new SyntaxUnit;
				p.prototype.constructor = p;
				Parser.DEFAULT_TYPE = 0;
				Parser.COMBINATOR_TYPE = 1;
				Parser.MEDIA_FEATURE_TYPE = 2;
				Parser.MEDIA_QUERY_TYPE = 3;
				Parser.PROPERTY_NAME_TYPE = 4;
				Parser.PROPERTY_VALUE_TYPE = 5;
				Parser.PROPERTY_VALUE_PART_TYPE = 6;
				Parser.SELECTOR_TYPE = 7;
				Parser.SELECTOR_PART_TYPE = 8;
				Parser.SELECTOR_SUB_PART_TYPE = 9;
				Parser.prototype = function() {
					var r = new it, t, i = {
						constructor: Parser,
						DEFAULT_TYPE: 0,
						COMBINATOR_TYPE: 1,
						MEDIA_FEATURE_TYPE: 2,
						MEDIA_QUERY_TYPE: 3,
						PROPERTY_NAME_TYPE: 4,
						PROPERTY_VALUE_TYPE: 5,
						PROPERTY_VALUE_PART_TYPE: 6,
						SELECTOR_TYPE: 7,
						SELECTOR_PART_TYPE: 8,
						SELECTOR_SUB_PART_TYPE: 9,
						_stylesheet: function() {
							var t = this._tokenStream, e, i, r;
							for (this.fire("startstylesheet"),
							this._charset(),
							this._skipCruft(); t.peek() == n.IMPORT_SYM; )
								this._import(),
								this._skipCruft();
							while (t.peek() == n.NAMESPACE_SYM)
								this._namespace(),
								this._skipCruft();
							for (r = t.peek(); r > n.EOF; ) {
								try {
									switch (r) {
									case n.MEDIA_SYM:
										this._media();
										this._skipCruft();
										break;
									case n.PAGE_SYM:
										this._page();
										this._skipCruft();
										break;
									case n.FONT_FACE_SYM:
										this._font_face();
										this._skipCruft();
										break;
									case n.KEYFRAMES_SYM:
										this._keyframes();
										this._skipCruft();
										break;
									case n.VIEWPORT_SYM:
										this._viewport();
										this._skipCruft();
										break;
									case n.UNKNOWN_SYM:
										if (t.get(),
										this.options.strict)
											throw new f("Unknown @ rule.",t.LT(0).startLine,t.LT(0).startCol);
										else {
											for (this.fire({
												type: "error",
												error: null ,
												message: "Unknown @ rule: " + t.LT(0).value + ".",
												line: t.LT(0).startLine,
												col: t.LT(0).startCol
											}),
											e = 0; t.advance([n.LBRACE, n.RBRACE]) == n.LBRACE; )
												e++;
											while (e)
												t.advance([n.RBRACE]),
												e--
										}
										break;
									case n.S:
										this._readWhitespace();
										break;
									default:
										if (!this._ruleset())
											switch (r) {
											case n.CHARSET_SYM:
												i = t.LT(1);
												this._charset(!1);
												throw new f("@charset not allowed here.",i.startLine,i.startCol);
											case n.IMPORT_SYM:
												i = t.LT(1);
												this._import(!1);
												throw new f("@import not allowed here.",i.startLine,i.startCol);
											case n.NAMESPACE_SYM:
												i = t.LT(1);
												this._namespace(!1);
												throw new f("@namespace not allowed here.",i.startLine,i.startCol);
											case n.URL:
												i = t.LT(1);
												this._url();
												break;
											case n.URLEND:
												this._urlend();
												break;
											default:
												t.get();
												this._unexpectedToken(t.token())
											}
									}
								} catch (u) {
									if (u instanceof f && !this.options.strict)
										this.fire({
											type: "error",
											error: u,
											message: u.message,
											line: u.line,
											col: u.col
										});
									else
										throw u;
								}
								r = t.peek()
							}
							r != n.EOF && this._unexpectedToken(t.token());
							this.fire("endstylesheet")
						},
						_charset: function(t) {
							var i = this._tokenStream, r, u, f, e;
							i.match(n.CHARSET_SYM) && (f = i.token().startLine,
							e = i.token().startCol,
							this._readWhitespace(),
							i.mustMatch(n.STRING),
							u = i.token(),
							r = u.value,
							this._readWhitespace(),
							i.mustMatch(n.SEMICOLON),
							t !== !1 && this.fire({
								type: "charset",
								charset: r,
								line: f,
								col: e
							}))
						},
						_import: function(t) {
							var i = this._tokenStream, u, r, f = [];
							i.mustMatch(n.IMPORT_SYM);
							r = i.token();
							this._readWhitespace();
							i.mustMatch([n.STRING, n.URI]);
							u = i.token().value.replace(/^(?:url\()?["']?([^"']+?)["']?\)?$/, "$1");
							this._readWhitespace();
							f = this._media_query_list();
							i.mustMatch(n.SEMICOLON);
							this._readWhitespace();
							t !== !1 && this.fire({
								type: "import",
								uri: u,
								media: f,
								line: r.startLine,
								col: r.startCol
							})
						},
						_namespace: function(t) {
							var i = this._tokenStream, r, u, f, e;
							i.mustMatch(n.NAMESPACE_SYM);
							r = i.token().startLine;
							u = i.token().startCol;
							this._readWhitespace();
							i.match(n.IDENT) && (f = i.token().value,
							this._readWhitespace());
							i.mustMatch([n.STRING, n.URI]);
							e = i.token().value.replace(/(?:url\()?["']([^"']+)["']\)?/, "$1");
							this._readWhitespace();
							i.mustMatch(n.SEMICOLON);
							this._readWhitespace();
							t !== !1 && this.fire({
								type: "namespace",
								prefix: f,
								uri: e,
								line: r,
								col: u
							})
						},
						_media: function() {
							var t = this._tokenStream, i, r, u;
							for (t.mustMatch(n.MEDIA_SYM),
							i = t.token().startLine,
							r = t.token().startCol,
							this._readWhitespace(),
							u = this._media_query_list(),
							t.mustMatch(n.LBRACE),
							this._readWhitespace(),
							this.fire({
								type: "startmedia",
								media: u,
								line: i,
								col: r
							}); ; )
								if (t.peek() == n.PAGE_SYM)
									this._page();
								else if (t.peek() == n.FONT_FACE_SYM)
									this._font_face();
								else if (t.peek() == n.VIEWPORT_SYM)
									this._viewport();
								else if (!this._ruleset())
									break;
							t.mustMatch(n.RBRACE);
							this._readWhitespace();
							this.fire({
								type: "endmedia",
								media: u,
								line: i,
								col: r
							})
						},
						_media_query_list: function() {
							var t = this._tokenStream
							, i = [];
							for (this._readWhitespace(),
							(t.peek() == n.IDENT || t.peek() == n.LPAREN) && i.push(this._media_query()); t.match(n.COMMA); )
								this._readWhitespace(),
								i.push(this._media_query());
							return i
						},
						_media_query: function() {
							var t = this._tokenStream
							, f = null 
							, r = null 
							, i = null 
							, u = [];
							if (t.match(n.IDENT) && (r = t.token().value.toLowerCase(),
							r != "only" && r != "not" ? (t.unget(),
							r = null ) : i = t.token()),
							this._readWhitespace(),
							t.peek() == n.IDENT ? (f = this._media_type(),
							i === null  && (i = t.token())) : t.peek() == n.LPAREN && (i === null  && (i = t.LT(1)),
							u.push(this._media_expression())),
							f === null  && u.length === 0)
								return null ;
							for (this._readWhitespace(); t.match(n.IDENT); )
								t.token().value.toLowerCase() != "and" && this._unexpectedToken(t.token()),
								this._readWhitespace(),
								u.push(this._media_expression());
							return new p(r,f,u,i.startLine,i.startCol)
						},
						_media_type: function() {
							return this._media_feature()
						},
						_media_expression: function() {
							var t = this._tokenStream, u = null , i, r = null ;
							return t.mustMatch(n.LPAREN),
							u = this._media_feature(),
							this._readWhitespace(),
							t.match(n.COLON) && (this._readWhitespace(),
							i = t.LT(1),
							r = this._expression()),
							t.mustMatch(n.RPAREN),
							this._readWhitespace(),
							new y(u,r ? new SyntaxUnit(r,i.startLine,i.startCol) : null )
						},
						_media_feature: function() {
							var t = this._tokenStream;
							return t.mustMatch(n.IDENT),
							SyntaxUnit.fromToken(t.token())
						},
						_page: function() {
							var t = this._tokenStream, r, u, i = null , f = null ;
							t.mustMatch(n.PAGE_SYM);
							r = t.token().startLine;
							u = t.token().startCol;
							this._readWhitespace();
							t.match(n.IDENT) && (i = t.token().value,
							i.toLowerCase() === "auto" && this._unexpectedToken(t.token()));
							t.peek() == n.COLON && (f = this._pseudo_page());
							this._readWhitespace();
							this.fire({
								type: "startpage",
								id: i,
								pseudo: f,
								line: r,
								col: u
							});
							this._readDeclarations(!0, !0);
							this.fire({
								type: "endpage",
								id: i,
								pseudo: f,
								line: r,
								col: u
							})
						},
						_margin: function() {
							var r = this._tokenStream, n, t, i = this._margin_sym();
							return i ? (n = r.token().startLine,
							t = r.token().startCol,
							this.fire({
								type: "startpagemargin",
								margin: i,
								line: n,
								col: t
							}),
							this._readDeclarations(!0),
							this.fire({
								type: "endpagemargin",
								margin: i,
								line: n,
								col: t
							}),
							!0) : !1
						},
						_margin_sym: function() {
							var t = this._tokenStream;
							return t.match([n.TOPLEFTCORNER_SYM, n.TOPLEFT_SYM, n.TOPCENTER_SYM, n.TOPRIGHT_SYM, n.TOPRIGHTCORNER_SYM, n.BOTTOMLEFTCORNER_SYM, n.BOTTOMLEFT_SYM, n.BOTTOMCENTER_SYM, n.BOTTOMRIGHT_SYM, n.BOTTOMRIGHTCORNER_SYM, n.LEFTTOP_SYM, n.LEFTMIDDLE_SYM, n.LEFTBOTTOM_SYM, n.RIGHTTOP_SYM, n.RIGHTMIDDLE_SYM, n.RIGHTBOTTOM_SYM]) ? SyntaxUnit.fromToken(t.token()) : null 
						},
						_pseudo_page: function() {
							var t = this._tokenStream;
							return t.mustMatch(n.COLON),
							t.mustMatch(n.IDENT),
							t.token().value
						},
						_font_face: function() {
							var t = this._tokenStream, i, r;
							t.mustMatch(n.FONT_FACE_SYM);
							i = t.token().startLine;
							r = t.token().startCol;
							this._readWhitespace();
							this.fire({
								type: "startfontface",
								line: i,
								col: r
							});
							this._readDeclarations(!0);
							this.fire({
								type: "endfontface",
								line: i,
								col: r
							})
						},
						_viewport: function() {
							var t = this._tokenStream, i, r;
							t.mustMatch(n.VIEWPORT_SYM);
							i = t.token().startLine;
							r = t.token().startCol;
							this._readWhitespace();
							this.fire({
								type: "startviewport",
								line: i,
								col: r
							});
							this._readDeclarations(!0);
							this.fire({
								type: "endviewport",
								line: i,
								col: r
							})
						},
						_url: function() {
							var t = this._tokenStream, r, i, u, f;
							u = t.token().startLine;
							f = t.token().startCol;
							t.mustMatch(n.URL);
							this._readWhitespace();
							t.mustMatch(n.STRING);
							i = t.token();
							r = i.value;
							this._readWhitespace();
							t.mustMatch(n.SEMICOLON)
						},
						_urlend: function() {
							var t = this._tokenStream, r, i, u, f;
							u = t.token().startLine;
							f = t.token().startCol;
							t.mustMatch(n.URLEND);
							this._readWhitespace();
							t.mustMatch(n.STRING);
							i = t.token();
							r = i.value;
							this._readWhitespace();
							t.mustMatch(n.SEMICOLON)
						},
						_operator: function(t) {
							var i = this._tokenStream
							, r = null ;
							return (i.match([n.SLASH, n.COMMA]) || t && i.match([n.PLUS, n.STAR, n.MINUS])) && (r = i.token(),
							this._readWhitespace()),
							r ? o.fromToken(r) : null 
						},
						_combinator: function() {
							var i = this._tokenStream, r = null , t;
							return i.match([n.PLUS, n.GREATER, n.TILDE]) && (t = i.token(),
							r = new l(t.value,t.startLine,t.startCol),
							this._readWhitespace()),
							r
						},
						_unary_operator: function() {
							var t = this._tokenStream;
							return t.match([n.MINUS, n.PLUS]) ? t.token().value : null 
						},
						_property: function() {
							var i = this._tokenStream, f = null , u = null , r, t, e, o;
							return i.peek() == n.STAR && this.options.starHack && (i.get(),
							t = i.token(),
							u = t.value,
							e = t.startLine,
							o = t.startCol),
							i.match(n.IDENT) && (t = i.token(),
							r = t.value,
							r.charAt(0) == "_" && this.options.underscoreHack && (u = "_",
							r = r.substring(1)),
							f = new a(r,u,e || t.startLine,o || t.startCol),
							this._readWhitespace()),
							f
						},
						_ruleset: function() {
							var u = this._tokenStream, r, t;
							try {
								t = this._selectors_group()
							} catch (i) {
								if (i instanceof f && !this.options.strict) {
									if (this.fire({
										type: "error",
										error: i,
										message: i.message,
										line: i.line,
										col: i.col
									}),
									r = u.advance([n.RBRACE]),
									r != n.RBRACE)
										throw i;
								} else
									throw i;
								return !0
							}
							return t && (this.fire({
								type: "startrule",
								selectors: t,
								line: t[0].line,
								col: t[0].col
							}),
							this._readDeclarations(!0),
							this.fire({
								type: "endrule",
								selectors: t,
								line: t[0].line,
								col: t[0].col
							})),
							t
						},
						_selectors_group: function() {
							var r = this._tokenStream, i = [], t;
							if (t = this._selector(),
							t !== null )
								for (i.push(t); r.match(n.COMMA); )
									this._readWhitespace(),
									t = this._selector(),
									t !== null  ? i.push(t) : this._unexpectedToken(r.LT(1));
							return i.length ? i : null 
						},
						_selector: function() {
							var r = this._tokenStream
							, n = []
							, t = null 
							, i = null 
							, u = null ;
							if (t = this._simple_selector_sequence(),
							t === null )
								return null ;
							n.push(t);
							do
								if (i = this._combinator(),
								i !== null )
									n.push(i),
									t = this._simple_selector_sequence(),
									t === null  ? this._unexpectedToken(r.LT(1)) : n.push(t);
								else if (this._readWhitespace())
									u = new l(r.token().value,r.token().startLine,r.token().startCol),
									i = this._combinator(),
									t = this._simple_selector_sequence(),
									t === null  ? i !== null  && this._unexpectedToken(r.LT(1)) : (i !== null  ? n.push(i) : n.push(u),
									n.push(t));
								else
									break;
							while (1);return new b(n,n[0].line,n[0].col)
						},
						_simple_selector_sequence: function() {
							var t = this._tokenStream, i = null , o = [], f = "", h = [function() {
								return t.match(n.HASH) ? new u(t.token().value,"id",t.token().startLine,t.token().startCol) : null 
							}
							, this._class, this._attrib, this._pseudo, this._negation], e = 0, a = h.length, r = null , c, l;
							for (c = t.LT(1).startLine,
							l = t.LT(1).startCol,
							i = this._type_selector(),
							i || (i = this._universal()),
							i !== null  && (f += i); ; ) {
								if (t.peek() === n.S)
									break;
								while (e < a && r === null )
									r = h[e++].call(this);
								if (r === null ) {
									if (f === "")
										return null ;
									break
								} else
									e = 0,
									o.push(r),
									f += r.toString(),
									r = null 
							}
							return f !== "" ? new s(i,o,f,c,l) : null 
						},
						_type_selector: function() {
							var i = this._tokenStream
							, n = this._namespace_prefix()
							, t = this._element_name();
							return t ? (n && (t.text = n + t.text,
							t.col -= n.length),
							t) : (n && (i.unget(),
							n.length > 1 && i.unget()),
							null )
						},
						_class: function() {
							var i = this._tokenStream, t;
							return i.match(n.DOT) ? (i.mustMatch(n.IDENT),
							t = i.token(),
							new u("." + t.value,"class",t.startLine,t.startCol - 1)) : null 
						},
						_element_name: function() {
							var i = this._tokenStream, t;
							return i.match(n.IDENT) ? (t = i.token(),
							new u(t.value,"elementName",t.startLine,t.startCol)) : null 
						},
						_namespace_prefix: function() {
							var t = this._tokenStream
							, i = "";
							return (t.LA(1) === n.PIPE || t.LA(2) === n.PIPE) && (t.match([n.IDENT, n.STAR]) && (i += t.token().value),
							t.mustMatch(n.PIPE),
							i += "|"),
							i.length ? i : null 
						},
						_universal: function() {
							var r = this._tokenStream, t = "", i;
							return i = this._namespace_prefix(),
							i && (t += i),
							r.match(n.STAR) && (t += "*"),
							t.length ? t : null 
						},
						_attrib: function() {
							var i = this._tokenStream, t = null , f, r;
							return i.match(n.LBRACKET) ? (r = i.token(),
							t = r.value,
							t += this._readWhitespace(),
							f = this._namespace_prefix(),
							f && (t += f),
							i.mustMatch(n.IDENT),
							t += i.token().value,
							t += this._readWhitespace(),
							i.match([n.PREFIXMATCH, n.SUFFIXMATCH, n.SUBSTRINGMATCH, n.EQUALS, n.INCLUDES, n.DASHMATCH]) && (t += i.token().value,
							t += this._readWhitespace(),
							i.mustMatch([n.IDENT, n.STRING]),
							t += i.token().value,
							t += this._readWhitespace()),
							i.mustMatch(n.RBRACKET),
							new u(t + "]","attribute",r.startLine,r.startCol)) : null 
						},
						_pseudo: function() {
							var t = this._tokenStream, i = null , r = ":", f, e;
							return t.match(n.COLON) && (t.match(n.COLON) && (r += ":"),
							t.match(n.IDENT) ? (i = t.token().value,
							f = t.token().startLine,
							e = t.token().startCol - r.length) : t.peek() == n.FUNCTION && (f = t.LT(1).startLine,
							e = t.LT(1).startCol - r.length,
							i = this._functional_pseudo()),
							i && (i = new u(r + i,"pseudo",f,e))),
							i
						},
						_functional_pseudo: function() {
							var i = this._tokenStream
							, t = null ;
							return i.match(n.FUNCTION) && (t = i.token().value,
							t += this._readWhitespace(),
							t += this._expression(),
							i.mustMatch(n.RPAREN),
							t += ")"),
							t
						},
						_expression: function() {
							for (var i = this._tokenStream, t = ""; i.match([n.PLUS, n.MINUS, n.DIMENSION, n.NUMBER, n.STRING, n.IDENT, n.LENGTH, n.FREQ, n.ANGLE, n.TIME, n.RESOLUTION, n.SLASH]); )
								t += i.token().value,
								t += this._readWhitespace();
							return t.length ? t : null 
						},
						_negation: function() {
							var t = this._tokenStream, e, o, i = "", r, f = null ;
							return t.match(n.NOT) && (i = t.token().value,
							e = t.token().startLine,
							o = t.token().startCol,
							i += this._readWhitespace(),
							r = this._negation_arg(),
							i += r,
							i += this._readWhitespace(),
							t.match(n.RPAREN),
							i += t.token().value,
							f = new u(i,"not",e,o),
							f.args.push(r)),
							f
						},
						_negation_arg: function() {
							for (var i = this._tokenStream, o = [this._type_selector, this._universal, function() {
								return i.match(n.HASH) ? new u(i.token().value,"id",i.token().startLine,i.token().startCol) : null 
							}
							, this._class, this._attrib, this._pseudo], t = null , r = 0, h = o.length, f = i.LT(1).startLine, e = i.LT(1).startCol; r < h && t === null ; )
								t = o[r].call(this),
								r++;
							return t === null  && this._unexpectedToken(i.LT(1)),
							t.type == "elementName" ? new s(t,[],t.toString(),f,e) : new s(null ,[t],t.toString(),f,e)
						},
						_declaration: function() {
							var u = this._tokenStream
							, t = null 
							, i = null 
							, f = null 
							, e = null 
							, r = "";
							if (t = this._property(),
							t !== null ) {
								u.mustMatch(n.COLON);
								this._readWhitespace();
								i = this._expr();
								i && i.length !== 0 || this._unexpectedToken(u.LT(1));
								f = this._prio();
								r = t.toString();
								(this.options.starHack && t.hack == "*" || this.options.underscoreHack && t.hack == "_") && (r = t.text);
								try {
									this._validateProperty(r, i)
								} catch (o) {
									e = o
								}
								return this.fire({
									type: "property",
									property: t,
									value: i,
									important: f,
									line: t.line,
									col: t.col,
									invalid: e
								}),
								!0
							}
							return !1
						},
						_prio: function() {
							var t = this._tokenStream
							, i = t.match(n.IMPORTANT_SYM);
							return this._readWhitespace(),
							i
						},
						_expr: function(n) {
							var u = this._tokenStream
							, t = []
							, i = null 
							, r = null ;
							if (i = this._term(n),
							i !== null ) {
								t.push(i);
								do
									if (r = this._operator(n),
									r && t.push(r),
									i = this._term(n),
									i === null )
										break;
									else
										t.push(i);
								while (1)
							}
							return t.length > 0 ? new w(t,t[0].line,t[0].col) : null 
						},
						_term: function(t) {
							var i = this._tokenStream, u = null , r = null , h = null , f, e, s;
							return u = this._unary_operator(),
							u !== null  && (e = i.token().startLine,
							s = i.token().startCol),
							i.peek() == n.IE_FUNCTION && this.options.ieFilters ? (r = this._ie_function(),
							u === null  && (e = i.token().startLine,
							s = i.token().startCol)) : t && i.match([n.LPAREN, n.LBRACE, n.LBRACKET]) ? (f = i.token(),
							h = f.endChar,
							r = f.value + this._expr(t).text,
							u === null  && (e = i.token().startLine,
							s = i.token().startCol),
							i.mustMatch(n.type(h)),
							r += h,
							this._readWhitespace()) : i.match([n.NUMBER, n.PERCENTAGE, n.LENGTH, n.ANGLE, n.TIME, n.FREQ, n.STRING, n.IDENT, n.URI, n.UNICODE_RANGE]) ? (r = i.token().value,
							u === null  && (e = i.token().startLine,
							s = i.token().startCol),
							this._readWhitespace()) : (f = this._hexcolor(),
							f === null  ? (u === null  && (e = i.LT(1).startLine,
							s = i.LT(1).startCol),
							r === null  && (r = i.LA(3) == n.EQUALS && this.options.ieFilters ? this._ie_function() : this._function())) : (r = f.value,
							u === null  && (e = f.startLine,
							s = f.startCol))),
							r !== null  ? new o(u !== null  ? u + r : r,e,s) : null 
						},
						_function: function() {
							var t = this._tokenStream, i = null , u = null , r;
							if (t.match(n.FUNCTION)) {
								if (i = t.token().value,
								this._readWhitespace(),
								u = this._expr(!0),
								i += u,
								this.options.ieFilters && t.peek() == n.EQUALS)
									do
										for (this._readWhitespace() && (i += t.token().value),
										t.LA(0) == n.COMMA && (i += t.token().value),
										t.match(n.IDENT),
										i += t.token().value,
										t.match(n.EQUALS),
										i += t.token().value,
										r = t.peek(); r != n.COMMA && r != n.S && r != n.RPAREN; )
											t.get(),
											i += t.token().value,
											r = t.peek();
									while (t.match([n.COMMA, n.S]));t.match(n.RPAREN);
								i += ")";
								this._readWhitespace()
							}
							return i
						},
						_ie_function: function() {
							var t = this._tokenStream, i = null , r;
							if (t.match([n.IE_FUNCTION, n.FUNCTION])) {
								i = t.token().value;
								do
									for (this._readWhitespace() && (i += t.token().value),
									t.LA(0) == n.COMMA && (i += t.token().value),
									t.match(n.IDENT),
									i += t.token().value,
									t.match(n.EQUALS),
									i += t.token().value,
									r = t.peek(); r != n.COMMA && r != n.S && r != n.RPAREN; )
										t.get(),
										i += t.token().value,
										r = t.peek();
								while (t.match([n.COMMA, n.S]));t.match(n.RPAREN);
								i += ")";
								this._readWhitespace()
							}
							return i
						},
						_hexcolor: function() {
							var r = this._tokenStream, t = null , i;
							if (r.match(n.HASH)) {
								if (t = r.token(),
								i = t.value,
								!/#[a-f0-9]{3,6}/i.test(i))
									throw new f("Expected a hex color but found '" + i + "' at line " + t.startLine + ", col " + t.startCol + ".",t.startLine,t.startCol);
								this._readWhitespace()
							}
							return t
						},
						_keyframes: function() {
							var t = this._tokenStream, i, r, u, f = "";
							for (t.mustMatch(n.KEYFRAMES_SYM),
							i = t.token(),
							/^@\-([^\-]+)\-/.test(i.value) && (f = RegExp.$1),
							this._readWhitespace(),
							u = this._keyframe_name(),
							this._readWhitespace(),
							t.mustMatch(n.LBRACE),
							this.fire({
								type: "startkeyframes",
								name: u,
								prefix: f,
								line: i.startLine,
								col: i.startCol
							}),
							this._readWhitespace(),
							r = t.peek(); r == n.IDENT || r == n.PERCENTAGE; )
								this._keyframe_rule(),
								this._readWhitespace(),
								r = t.peek();
							this.fire({
								type: "endkeyframes",
								name: u,
								prefix: f,
								line: i.startLine,
								col: i.startCol
							});
							this._readWhitespace();
							t.mustMatch(n.RBRACE)
						},
						_keyframe_name: function() {
							var t = this._tokenStream;
							return t.mustMatch([n.IDENT, n.STRING]),
							SyntaxUnit.fromToken(t.token())
						},
						_keyframe_rule: function() {
							var t = this._tokenStream
							, n = this._key_list();
							this.fire({
								type: "startkeyframerule",
								keys: n,
								line: n[0].line,
								col: n[0].col
							});
							this._readDeclarations(!0);
							this.fire({
								type: "endkeyframerule",
								keys: n,
								line: n[0].line,
								col: n[0].col
							})
						},
						_key_list: function() {
							var i = this._tokenStream
							, t = [];
							for (t.push(this._key()),
							this._readWhitespace(); i.match(n.COMMA); )
								this._readWhitespace(),
								t.push(this._key()),
								this._readWhitespace();
							return t
						},
						_key: function() {
							var t = this._tokenStream, i;
							if (t.match(n.PERCENTAGE))
								return SyntaxUnit.fromToken(t.token());
							if (t.match(n.IDENT)) {
								if (i = t.token(),
								/from|to/i.test(i.value))
									return SyntaxUnit.fromToken(i);
								t.unget()
							}
							this._unexpectedToken(t.LT(1))
						},
						_skipCruft: function() {
							while (this._tokenStream.match([n.S, n.CDO, n.CDC]))
								;
						},
						_readDeclarations: function(t, i) {
							var u = this._tokenStream, e;
							this._readWhitespace();
							t && u.mustMatch(n.LBRACE);
							this._readWhitespace();
							try {
								for (; ; ) {
									if (!u.match(n.SEMICOLON) && (!i || !this._margin()))
										if (this._declaration()) {
											if (!u.match(n.SEMICOLON))
												break
										} else
											break;
									this._readWhitespace()
								}
								u.mustMatch(n.RBRACE);
								this._readWhitespace()
							} catch (r) {
								if (r instanceof f && !this.options.strict) {
									if (this.fire({
										type: "error",
										error: r,
										message: r.message,
										line: r.line,
										col: r.col
									}),
									e = u.advance([n.SEMICOLON, n.RBRACE]),
									e == n.SEMICOLON)
										this._readDeclarations(!1, i);
									else if (e != n.RBRACE)
										throw r;
								} else
									throw r;
							}
						},
						_readWhitespace: function() {
							for (var t = this._tokenStream, i = ""; t.match(n.S); )
								i += t.token().value;
							return i
						},
						_unexpectedToken: function(n) {
							throw new f("Unexpected token '" + n.value + "' at line " + n.startLine + ", col " + n.startCol + ".",n.startLine,n.startCol);
						},
						_verifyEnd: function() {
							this._tokenStream.LA(1) != n.EOF && this._unexpectedToken(this._tokenStream.LT(1))
						},
						_validateProperty: function(n, t) {
							tt.validate(n, t)
						},
						parse: function(t) {
							this._tokenStream = new h(t,n);
							this._stylesheet()
						},
						parseStyleSheet: function(n) {
							return this.parse(n)
						},
						parseMediaQuery: function(t) {
							this._tokenStream = new h(t,n);
							var i = this._media_query();
							return this._verifyEnd(),
							i
						},
						parsePropertyValue: function(t) {
							this._tokenStream = new h(t,n);
							this._readWhitespace();
							var i = this._expr();
							return this._readWhitespace(),
							this._verifyEnd(),
							i
						},
						parseRule: function(t) {
							this._tokenStream = new h(t,n);
							this._readWhitespace();
							var i = this._ruleset();
							return this._readWhitespace(),
							this._verifyEnd(),
							i
						},
						parseSelector: function(t) {
							this._tokenStream = new h(t,n);
							this._readWhitespace();
							var i = this._selector();
							return this._readWhitespace(),
							this._verifyEnd(),
							i
						},
						parseStyleAttribute: function(t) {
							t += "}";
							this._tokenStream = new h(t,n);
							this._readDeclarations()
						}
					};
					for (t in i)
						i.hasOwnProperty(t) && (r[t] = i[t]);
					return r
				}();
				ut = {
					"align-items": "flex-start | flex-end | center | baseline | stretch",
					"align-content": "flex-start | flex-end | center | space-between | space-around | stretch",
					"align-self": "auto | flex-start | flex-end | center | baseline | stretch",
					"-webkit-align-items": "flex-start | flex-end | center | baseline | stretch",
					"-webkit-align-content": "flex-start | flex-end | center | space-between | space-around | stretch",
					"-webkit-align-self": "auto | flex-start | flex-end | center | baseline | stretch",
					"alignment-adjust": "auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical | <percentage> | <length>",
					"alignment-baseline": "baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical",
					animation: 1,
					"animation-delay": {
						multi: "<time>",
						comma: !0
					},
					"animation-direction": {
						multi: "normal | alternate",
						comma: !0
					},
					"animation-duration": {
						multi: "<time>",
						comma: !0
					},
					"animation-fill-mode": {
						multi: "none | forwards | backwards | both",
						comma: !0
					},
					"animation-iteration-count": {
						multi: "<number> | infinite",
						comma: !0
					},
					"animation-name": {
						multi: "none | <ident>",
						comma: !0
					},
					"animation-play-state": {
						multi: "running | paused",
						comma: !0
					},
					"animation-timing-function": 1,
					"-moz-animation-delay": {
						multi: "<time>",
						comma: !0
					},
					"-moz-animation-direction": {
						multi: "normal | alternate",
						comma: !0
					},
					"-moz-animation-duration": {
						multi: "<time>",
						comma: !0
					},
					"-moz-animation-iteration-count": {
						multi: "<number> | infinite",
						comma: !0
					},
					"-moz-animation-name": {
						multi: "none | <ident>",
						comma: !0
					},
					"-moz-animation-play-state": {
						multi: "running | paused",
						comma: !0
					},
					"-ms-animation-delay": {
						multi: "<time>",
						comma: !0
					},
					"-ms-animation-direction": {
						multi: "normal | alternate",
						comma: !0
					},
					"-ms-animation-duration": {
						multi: "<time>",
						comma: !0
					},
					"-ms-animation-iteration-count": {
						multi: "<number> | infinite",
						comma: !0
					},
					"-ms-animation-name": {
						multi: "none | <ident>",
						comma: !0
					},
					"-ms-animation-play-state": {
						multi: "running | paused",
						comma: !0
					},
					"-webkit-animation-delay": {
						multi: "<time>",
						comma: !0
					},
					"-webkit-animation-direction": {
						multi: "normal | alternate",
						comma: !0
					},
					"-webkit-animation-duration": {
						multi: "<time>",
						comma: !0
					},
					"-webkit-animation-fill-mode": {
						multi: "none | forwards | backwards | both",
						comma: !0
					},
					"-webkit-animation-iteration-count": {
						multi: "<number> | infinite",
						comma: !0
					},
					"-webkit-animation-name": {
						multi: "none | <ident>",
						comma: !0
					},
					"-webkit-animation-play-state": {
						multi: "running | paused",
						comma: !0
					},
					"-o-animation-delay": {
						multi: "<time>",
						comma: !0
					},
					"-o-animation-direction": {
						multi: "normal | alternate",
						comma: !0
					},
					"-o-animation-duration": {
						multi: "<time>",
						comma: !0
					},
					"-o-animation-iteration-count": {
						multi: "<number> | infinite",
						comma: !0
					},
					"-o-animation-name": {
						multi: "none | <ident>",
						comma: !0
					},
					"-o-animation-play-state": {
						multi: "running | paused",
						comma: !0
					},
					appearance: "icon | window | desktop | workspace | document | tooltip | dialog | button | push-button | hyperlink | radio-button | checkbox | menu-item | tab | menu | menubar | pull-down-menu | pop-up-menu | list-menu | radio-group | checkbox-group | outline-tree | range | field | combo-box | signature | password | normal | none | inherit",
					azimuth: function(n) {
						var f = !1, u = !1, t;
						if (i.isAny(n, "<angle> | leftwards | rightwards | inherit") || (i.isAny(n, "behind") && (f = !0,
						u = !0),
						i.isAny(n, "left-side | far-left | left | center-left | center | center-right | right | far-right | right-side") && (u = !0,
						f || i.isAny(n, "behind"))),
						n.hasNext())
							if (t = n.next(),
							u)
								throw new r("Expected end of value but found '" + t + "'.",t.line,t.col);
							else
								throw new r("Expected (<'azimuth'>) but found '" + t + "'.",t.line,t.col);
					},
					"backface-visibility": "visible | hidden",
					background: 1,
					"background-attachment": {
						multi: "<attachment>",
						comma: !0
					},
					"background-clip": {
						multi: "<box>",
						comma: !0
					},
					"background-color": "<color> | inherit",
					"background-image": {
						multi: "<bg-image>",
						comma: !0
					},
					"background-origin": {
						multi: "<box>",
						comma: !0
					},
					"background-position": {
						multi: "<bg-position>",
						comma: !0
					},
					"background-repeat": {
						multi: "<repeat-style>"
					},
					"background-size": {
						multi: "<bg-size>",
						comma: !0
					},
					"baseline-shift": "baseline | sub | super | <percentage> | <length>",
					behavior: 1,
					binding: 1,
					bleed: "<length>",
					"bookmark-label": "<content> | <attr> | <string>",
					"bookmark-level": "none | <integer>",
					"bookmark-state": "open | closed",
					"bookmark-target": "none | <uri> | <attr>",
					border: "<border-width> || <border-style> || <color>",
					"border-bottom": "<border-width> || <border-style> || <color>",
					"border-bottom-color": "<color> | inherit",
					"border-bottom-left-radius": "<x-one-radius>",
					"border-bottom-right-radius": "<x-one-radius>",
					"border-bottom-style": "<border-style>",
					"border-bottom-width": "<border-width>",
					"border-collapse": "collapse | separate | inherit",
					"border-color": {
						multi: "<color> | inherit",
						max: 4
					},
					"border-image": 1,
					"border-image-outset": {
						multi: "<length> | <number>",
						max: 4
					},
					"border-image-repeat": {
						multi: "stretch | repeat | round",
						max: 2
					},
					"border-image-slice": function(n) {
						var u = !1, f = !1, e = 0, t;
						for (i.isAny(n, "fill") && (f = !0,
						u = !0); n.hasNext() && e < 4; ) {
							if (u = i.isAny(n, "<number> | <percentage>"),
							!u)
								break;
							e++
						}
						if (f ? u = !0 : i.isAny(n, "fill"),
						n.hasNext())
							if (t = n.next(),
							u)
								throw new r("Expected end of value but found '" + t + "'.",t.line,t.col);
							else
								throw new r("Expected ([<number> | <percentage>]{1,4} && fill?) but found '" + t + "'.",t.line,t.col);
					},
					"border-image-source": "<image> | none",
					"border-image-width": {
						multi: "<length> | <percentage> | <number> | auto",
						max: 4
					},
					"border-left": "<border-width> || <border-style> || <color>",
					"border-left-color": "<color> | inherit",
					"border-left-style": "<border-style>",
					"border-left-width": "<border-width>",
					"border-radius": function(n) {
						for (var f = !1, e = !1, u = 0, o = 8, t; n.hasNext() && u < o; ) {
							if (f = i.isAny(n, "<length> | <percentage> | inherit"),
							!f)
								if (n.peek() == "/" && u > 0 && !e)
									e = !0,
									o = u + 5,
									n.next();
								else
									break;
							u++
						}
						if (n.hasNext())
							if (t = n.next(),
							f)
								throw new r("Expected end of value but found '" + t + "'.",t.line,t.col);
							else
								throw new r("Expected (<'border-radius'>) but found '" + t + "'.",t.line,t.col);
					},
					"border-right": "<border-width> || <border-style> || <color>",
					"border-right-color": "<color> | inherit",
					"border-right-style": "<border-style>",
					"border-right-width": "<border-width>",
					"border-spacing": {
						multi: "<length> | inherit",
						max: 2
					},
					"border-style": {
						multi: "<border-style>",
						max: 4
					},
					"border-top": "<border-width> || <border-style> || <color>",
					"border-top-color": "<color> | inherit",
					"border-top-left-radius": "<x-one-radius>",
					"border-top-right-radius": "<x-one-radius>",
					"border-top-style": "<border-style>",
					"border-top-width": "<border-width>",
					"border-width": {
						multi: "<border-width>",
						max: 4
					},
					bottom: "<margin-width> | inherit",
					"-moz-box-align": "start | end | center | baseline | stretch",
					"-moz-box-decoration-break": "slice |clone",
					"-moz-box-direction": "normal | reverse | inherit",
					"-moz-box-flex": "<number>",
					"-moz-box-flex-group": "<integer>",
					"-moz-box-lines": "single | multiple",
					"-moz-box-ordinal-group": "<integer>",
					"-moz-box-orient": "horizontal | vertical | inline-axis | block-axis | inherit",
					"-moz-box-pack": "start | end | center | justify",
					"-webkit-box-align": "start | end | center | baseline | stretch",
					"-webkit-box-decoration-break": "slice |clone",
					"-webkit-box-direction": "normal | reverse | inherit",
					"-webkit-box-flex": "<number>",
					"-webkit-box-flex-group": "<integer>",
					"-webkit-box-lines": "single | multiple",
					"-webkit-box-ordinal-group": "<integer>",
					"-webkit-box-orient": "horizontal | vertical | inline-axis | block-axis | inherit",
					"-webkit-box-pack": "start | end | center | justify",
					"box-shadow": function(n) {
						var t;
						if (i.isAny(n, "none")) {
							if (n.hasNext()) {
								t = n.next();
								throw new r("Expected end of value but found '" + t + "'.",t.line,t.col);
							}
						} else
							tt.multiProperty("<shadow>", n, !0, Infinity)
					},
					"box-sizing": "content-box | border-box | inherit",
					"break-after": "auto | always | avoid | left | right | page | column | avoid-page | avoid-column",
					"break-before": "auto | always | avoid | left | right | page | column | avoid-page | avoid-column",
					"break-inside": "auto | avoid | avoid-page | avoid-column",
					"caption-side": "top | bottom | inherit",
					clear: "none | right | left | both | inherit",
					clip: 1,
					color: "<color> | inherit",
					"color-profile": 1,
					"column-count": "<integer> | auto",
					"column-fill": "auto | balance",
					"column-gap": "<length> | normal",
					"column-rule": "<border-width> || <border-style> || <color>",
					"column-rule-color": "<color>",
					"column-rule-style": "<border-style>",
					"column-rule-width": "<border-width>",
					"column-span": "none | all",
					"column-width": "<length> | auto",
					columns: 1,
					content: 1,
					"counter-increment": 1,
					"counter-reset": 1,
					crop: "<shape> | auto",
					cue: "cue-after | cue-before | inherit",
					"cue-after": 1,
					"cue-before": 1,
					cursor: 1,
					direction: "ltr | rtl | inherit",
					display: "inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | grid | inline-grid | none | inherit | -moz-box | -moz-inline-block | -moz-inline-box | -moz-inline-grid | -moz-inline-stack | -moz-inline-table | -moz-grid | -moz-grid-group | -moz-grid-line | -moz-groupbox | -moz-deck | -moz-popup | -moz-stack | -moz-marker | -webkit-box | -webkit-inline-box | -ms-flexbox | -ms-inline-flexbox | flex | -webkit-flex | inline-flex | -webkit-inline-flex",
					"dominant-baseline": 1,
					"drop-initial-after-adjust": "central | middle | after-edge | text-after-edge | ideographic | alphabetic | mathematical | <percentage> | <length>",
					"drop-initial-after-align": "baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical",
					"drop-initial-before-adjust": "before-edge | text-before-edge | central | middle | hanging | mathematical | <percentage> | <length>",
					"drop-initial-before-align": "caps-height | baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical",
					"drop-initial-size": "auto | line | <length> | <percentage>",
					"drop-initial-value": "initial | <integer>",
					elevation: "<angle> | below | level | above | higher | lower | inherit",
					"empty-cells": "show | hide | inherit",
					filter: 1,
					fit: "fill | hidden | meet | slice",
					"fit-position": 1,
					flex: "<flex>",
					"flex-basis": "<width>",
					"flex-direction": "row | row-reverse | column | column-reverse",
					"flex-flow": "<flex-direction> || <flex-wrap>",
					"flex-grow": "<number>",
					"flex-shrink": "<number>",
					"flex-wrap": "nowrap | wrap | wrap-reverse",
					"-webkit-flex": "<flex>",
					"-webkit-flex-basis": "<width>",
					"-webkit-flex-direction": "row | row-reverse | column | column-reverse",
					"-webkit-flex-flow": "<flex-direction> || <flex-wrap>",
					"-webkit-flex-grow": "<number>",
					"-webkit-flex-shrink": "<number>",
					"-webkit-flex-wrap": "nowrap | wrap | wrap-reverse",
					"-ms-flex": "<flex>",
					"-ms-flex-align": "start | end | center | stretch | baseline",
					"-ms-flex-direction": "row | row-reverse | column | column-reverse | inherit",
					"-ms-flex-order": "<number>",
					"-ms-flex-pack": "start | end | center | justify",
					"-ms-flex-wrap": "nowrap | wrap | wrap-reverse",
					float: "left | right | none | inherit",
					"float-offset": 1,
					font: 1,
					"font-family": 1,
					"font-size": "<absolute-size> | <relative-size> | <length> | <percentage> | inherit",
					"font-size-adjust": "<number> | none | inherit",
					"font-stretch": "normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded | inherit",
					"font-style": "normal | italic | oblique | inherit",
					"font-variant": "normal | small-caps | inherit",
					"font-weight": "normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit",
					"grid-cell-stacking": "columns | rows | layer",
					"grid-column": 1,
					"grid-columns": 1,
					"grid-column-align": "start | end | center | stretch",
					"grid-column-sizing": 1,
					"grid-column-span": "<integer>",
					"grid-flow": "none | rows | columns",
					"grid-layer": "<integer>",
					"grid-row": 1,
					"grid-rows": 1,
					"grid-row-align": "start | end | center | stretch",
					"grid-row-span": "<integer>",
					"grid-row-sizing": 1,
					"hanging-punctuation": 1,
					height: "<margin-width> | <content-sizing> | inherit",
					"hyphenate-after": "<integer> | auto",
					"hyphenate-before": "<integer> | auto",
					"hyphenate-character": "<string> | auto",
					"hyphenate-lines": "no-limit | <integer>",
					"hyphenate-resource": 1,
					hyphens: "none | manual | auto",
					icon: 1,
					"image-orientation": "angle | auto",
					"image-rendering": 1,
					"image-resolution": 1,
					"inline-box-align": "initial | last | <integer>",
					"justify-content": "flex-start | flex-end | center | space-between | space-around",
					"-webkit-justify-content": "flex-start | flex-end | center | space-between | space-around",
					left: "<margin-width> | inherit",
					"letter-spacing": "<length> | normal | inherit",
					"line-height": "<number> | <length> | <percentage> | normal | inherit",
					"line-break": "auto | loose | normal | strict",
					"line-stacking": 1,
					"line-stacking-ruby": "exclude-ruby | include-ruby",
					"line-stacking-shift": "consider-shifts | disregard-shifts",
					"line-stacking-strategy": "inline-line-height | block-line-height | max-height | grid-height",
					"list-style": 1,
					"list-style-image": "<uri> | none | inherit",
					"list-style-position": "inside | outside | inherit",
					"list-style-type": "disc | circle | square | decimal | decimal-leading-zero | lower-roman | upper-roman | lower-greek | lower-latin | upper-latin | armenian | georgian | lower-alpha | upper-alpha | none | inherit",
					margin: {
						multi: "<margin-width> | inherit",
						max: 4
					},
					"margin-bottom": "<margin-width> | inherit",
					"margin-left": "<margin-width> | inherit",
					"margin-right": "<margin-width> | inherit",
					"margin-top": "<margin-width> | inherit",
					mark: 1,
					"mark-after": 1,
					"mark-before": 1,
					marks: 1,
					"marquee-direction": 1,
					"marquee-play-count": 1,
					"marquee-speed": 1,
					"marquee-style": 1,
					"max-height": "<length> | <percentage> | <content-sizing> | none | inherit",
					"max-width": "<length> | <percentage> | <content-sizing> | none | inherit",
					"min-height": "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit",
					"min-width": "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit",
					"move-to": 1,
					"nav-down": 1,
					"nav-index": 1,
					"nav-left": 1,
					"nav-right": 1,
					"nav-up": 1,
					opacity: "<number> | inherit",
					order: "<integer>",
					"-webkit-order": "<integer>",
					orphans: "<integer> | inherit",
					outline: 1,
					"outline-color": "<color> | invert | inherit",
					"outline-offset": 1,
					"outline-style": "<border-style> | inherit",
					"outline-width": "<border-width> | inherit",
					overflow: "visible | hidden | scroll | auto | inherit",
					"overflow-style": 1,
					"overflow-wrap": "normal | break-word",
					"overflow-x": 1,
					"overflow-y": 1,
					padding: {
						multi: "<padding-width> | inherit",
						max: 4
					},
					"padding-bottom": "<padding-width> | inherit",
					"padding-left": "<padding-width> | inherit",
					"padding-right": "<padding-width> | inherit",
					"padding-top": "<padding-width> | inherit",
					page: 1,
					"page-break-after": "auto | always | avoid | left | right | inherit",
					"page-break-before": "auto | always | avoid | left | right | inherit",
					"page-break-inside": "auto | avoid | inherit",
					"page-policy": 1,
					pause: 1,
					"pause-after": 1,
					"pause-before": 1,
					perspective: 1,
					"perspective-origin": 1,
					phonemes: 1,
					pitch: 1,
					"pitch-range": 1,
					"play-during": 1,
					"pointer-events": "auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit",
					position: "static | relative | absolute | fixed | inherit",
					"presentation-level": 1,
					"punctuation-trim": 1,
					quotes: 1,
					"rendering-intent": 1,
					resize: 1,
					rest: 1,
					"rest-after": 1,
					"rest-before": 1,
					richness: 1,
					right: "<margin-width> | inherit",
					rotation: 1,
					"rotation-point": 1,
					"ruby-align": 1,
					"ruby-overhang": 1,
					"ruby-position": 1,
					"ruby-span": 1,
					size: 1,
					speak: "normal | none | spell-out | inherit",
					"speak-header": "once | always | inherit",
					"speak-numeral": "digits | continuous | inherit",
					"speak-punctuation": "code | none | inherit",
					"speech-rate": 1,
					src: 1,
					stress: 1,
					"string-set": 1,
					"table-layout": "auto | fixed | inherit",
					"tab-size": "<integer> | <length>",
					target: 1,
					"target-name": 1,
					"target-new": 1,
					"target-position": 1,
					"text-align": "left | right | center | justify | inherit",
					"text-align-last": 1,
					"text-decoration": 1,
					"text-emphasis": 1,
					"text-height": 1,
					"text-indent": "<length> | <percentage> | inherit",
					"text-justify": "auto | none | inter-word | inter-ideograph | inter-cluster | distribute | kashida",
					"text-outline": 1,
					"text-overflow": 1,
					"text-rendering": "auto | optimizeSpeed | optimizeLegibility | geometricPrecision | inherit",
					"text-shadow": 1,
					"text-transform": "capitalize | uppercase | lowercase | none | inherit",
					"text-wrap": "normal | none | avoid",
					top: "<margin-width> | inherit",
					"-ms-touch-action": "auto | none | pan-x | pan-y",
					"touch-action": "auto | none | pan-x | pan-y",
					transform: 1,
					"transform-origin": 1,
					"transform-style": 1,
					transition: 1,
					"transition-delay": 1,
					"transition-duration": 1,
					"transition-property": 1,
					"transition-timing-function": 1,
					"unicode-bidi": "normal | embed | isolate | bidi-override | isolate-override | plaintext | inherit",
					"user-modify": "read-only | read-write | write-only | inherit",
					"user-select": "none | text | toggle | element | elements | all | inherit",
					"vertical-align": "auto | use-script | baseline | sub | super | top | text-top | central | middle | bottom | text-bottom | <percentage> | <length>",
					visibility: "visible | hidden | collapse | inherit",
					"voice-balance": 1,
					"voice-duration": 1,
					"voice-family": 1,
					"voice-pitch": 1,
					"voice-pitch-range": 1,
					"voice-rate": 1,
					"voice-stress": 1,
					"voice-volume": 1,
					volume: 1,
					"white-space": "normal | pre | nowrap | pre-wrap | pre-line | inherit | -pre-wrap | -o-pre-wrap | -moz-pre-wrap | -hp-pre-wrap",
					"white-space-collapse": 1,
					widows: "<integer> | inherit",
					width: "<length> | <percentage> | <content-sizing> | auto | inherit",
					"word-break": "normal | keep-all | break-all",
					"word-spacing": "<length> | normal | inherit",
					"word-wrap": "normal | break-word",
					"writing-mode": "horizontal-tb | vertical-rl | vertical-lr | lr-tb | rl-tb | tb-rl | bt-rl | tb-lr | bt-lr | lr-bt | rl-bt | lr | rl | tb | inherit",
					"z-index": "<integer> | auto | inherit",
					zoom: "<number> | <percentage> | normal"
				};
				a.prototype = new SyntaxUnit;
				a.prototype.constructor = a;
				a.prototype.toString = function() {
					return (this.hack ? this.hack : "") + this.text
				}
				;
				w.prototype = new SyntaxUnit;
				w.prototype.constructor = w;
				e.prototype.count = function() {
					return this._parts.length
				}
				;
				e.prototype.isFirst = function() {
					return this._i === 0
				}
				;
				e.prototype.hasNext = function() {
					return this._i < this._parts.length
				}
				;
				e.prototype.mark = function() {
					this._marks.push(this._i)
				}
				;
				e.prototype.peek = function(n) {
					return this.hasNext() ? this._parts[this._i + (n || 0)] : null 
				}
				;
				e.prototype.next = function() {
					return this.hasNext() ? this._parts[this._i++] : null 
				}
				;
				e.prototype.previous = function() {
					return this._i > 0 ? this._parts[--this._i] : null 
				}
				;
				e.prototype.restore = function() {
					this._marks.length && (this._i = this._marks.pop())
				}
				;
				o.prototype = new SyntaxUnit;
				o.prototype.constructor = o;
				o.fromToken = function(n) {
					return new o(n.value,n.startLine,n.startCol)
				}
				;
				c = {
					":first-letter": 1,
					":first-line": 1,
					":before": 1,
					":after": 1
				};
				c.ELEMENT = 1;
				c.CLASS = 2;
				c.isElement = function(n) {
					return n.indexOf("::") === 0 || c[n.toLowerCase()] == c.ELEMENT
				}
				;
				b.prototype = new SyntaxUnit;
				b.prototype.constructor = b;
				s.prototype = new SyntaxUnit;
				s.prototype.constructor = s;
				u.prototype = new SyntaxUnit;
				u.prototype.constructor = u;
				v.prototype = {
					constructor: v,
					compare: function(n) {
						for (var i = ["a", "b", "c", "d"], t = 0, r = i.length; t < r; t++) {
							if (this[i[t]] < n[i[t]])
								return -1;
							if (this[i[t]] > n[i[t]])
								return 1
						}
						return 0
					},
					valueOf: function() {
						return this.a * 1e3 + this.b * 100 + this.c * 10 + this.d
					},
					toString: function() {
						return this.a + "," + this.b + "," + this.c + "," + this.d
					}
				};
				v.calculate = function(n) {
					function o(n) {
						var i, f, h, l, s = n.elementName ? n.elementName.text : "", t;
						for (s && s.charAt(s.length - 1) != "*" && u++,
						i = 0,
						h = n.modifiers.length; i < h; i++) {
							t = n.modifiers[i];
							switch (t.type) {
							case "class":
							case "attribute":
								r++;
								break;
							case "id":
								e++;
								break;
							case "pseudo":
								c.isElement(t.text) ? u++ : r++;
								break;
							case "not":
								for (f = 0,
								l = t.args.length; f < l; f++)
									o(t.args[f])
							}
						}
					}
					for (var i, e = 0, r = 0, u = 0, t = 0, f = n.parts.length; t < f; t++)
						i = n.parts[t],
						i instanceof s && o(i);
					return new v(0,e,r,u)
				}
				;
				var st = /^[0-9a-fA-F]$/
				, ht = /\n|\r\n|\r|\f/;
				h.prototype = ct(new rt, {
					_getToken: function() {
						for (var f = this._reader, u = null , i = f.getLine(), r = f.getCol(), t = f.read(); t; ) {
							switch (t) {
							case "/":
								u = f.peek() == "*" ? this.commentToken(t, i, r) : this.charToken(t, i, r);
								break;
							case "|":
							case "~":
							case "^":
							case "$":
							case "*":
								u = f.peek() == "=" ? this.comparisonToken(t, i, r) : this.charToken(t, i, r);
								break;
							case '"':
							case "'":
								u = this.stringToken(t, i, r);
								break;
							case "#":
								u = et(f.peek()) ? this.hashToken(t, i, r) : this.charToken(t, i, r);
								break;
							case ".":
								u = g(f.peek()) ? this.numberToken(t, i, r) : this.charToken(t, i, r);
								break;
							case "-":
								u = f.peek() == "-" ? this.htmlCommentEndToken(t, i, r) : nt(f.peek()) ? this.identOrFunctionToken(t, i, r) : this.charToken(t, i, r);
								break;
							case "!":
								u = this.importantToken(t, i, r);
								break;
							case "@":
								u = this.atRuleToken(t, i, r);
								break;
							case ":":
								u = this.notToken(t, i, r);
								break;
							case "<":
								u = this.htmlCommentStartToken(t, i, r);
								break;
							case "U":
							case "u":
								if (f.peek() == "+") {
									u = this.unicodeRangeToken(t, i, r);
									break
								}
							default:
								u = g(t) ? this.numberToken(t, i, r) : k(t) ? this.whitespaceToken(t, i, r) : ot(t) ? this.identOrFunctionToken(t, i, r) : this.charToken(t, i, r)
							}
							break
						}
						return u || t !== null  || (u = this.createToken(n.EOF, null , i, r)),
						u
					},
					createToken: function(n, t, i, r, u) {
						var f = this._reader;
						return u = u || {},
						{
							value: t,
							type: n,
							channel: u.channel,
							endChar: u.endChar,
							hide: u.hide || !1,
							startLine: i,
							startCol: r,
							endLine: f.getLine(),
							endCol: f.getCol()
						}
					},
					atRuleToken: function(t, i, r) {
						var f = t, e = this._reader, u = n.CHAR, o;
						return e.mark(),
						o = this.readName(),
						f = t + o,
						u = n.type(f.toLowerCase()),
						(u == n.CHAR || u == n.UNKNOWN) && (f.length > 1 ? u = n.UNKNOWN_SYM : (u = n.CHAR,
						f = t,
						e.reset())),
						this.createToken(u, f, i, r)
					},
					charToken: function(t, i, r) {
						var u = n.type(t)
						, f = {};
						return u == -1 ? u = n.CHAR : f.endChar = n[u].endChar,
						this.createToken(u, t, i, r, f)
					},
					commentToken: function(t, i, r) {
						var f = this._reader
						, u = this.readComment(t);
						return this.createToken(n.COMMENT, u, i, r)
					},
					comparisonToken: function(t, i, r) {
						var f = this._reader
						, u = t + f.read()
						, e = n.type(u) || n.CHAR;
						return this.createToken(e, u, i, r)
					},
					hashToken: function(t, i, r) {
						var f = this._reader
						, u = this.readName(t);
						return this.createToken(n.HASH, u, i, r)
					},
					htmlCommentStartToken: function(t, i, r) {
						var u = this._reader
						, f = t;
						return u.mark(),
						f += u.readCount(3),
						f == "<!--" ? this.createToken(n.CDO, f, i, r) : (u.reset(),
						this.charToken(t, i, r))
					},
					htmlCommentEndToken: function(t, i, r) {
						var u = this._reader
						, f = t;
						return u.mark(),
						f += u.readCount(2),
						f == "-->" ? this.createToken(n.CDC, f, i, r) : (u.reset(),
						this.charToken(t, i, r))
					},
					identOrFunctionToken: function(t, i, r) {
						var e = this._reader
						, u = this.readName(t)
						, f = n.IDENT;
						return e.peek() == "(" ? (u += e.read(),
						u.toLowerCase() == "url(" ? (f = n.URI,
						u = this.readURI(u),
						u.toLowerCase() == "url(" && (f = n.FUNCTION)) : f = n.FUNCTION) : e.peek() == ":" && u.toLowerCase() == "progid" && (u += e.readTo("("),
						f = n.IE_FUNCTION),
						this.createToken(f, u, i, r)
					},
					importantToken: function(t, i, r) {
						var f = this._reader, o = t, s = n.CHAR, e, u;
						for (f.mark(),
						u = f.read(); u; ) {
							if (u == "/") {
								if (f.peek() != "*")
									break;
								else if (e = this.readComment(u),
								e === "")
									break
							} else if (k(u))
								o += u + this.readWhitespace();
							else if (/i/i.test(u)) {
								e = f.readCount(8);
								/mportant/i.test(e) && (o += u + e,
								s = n.IMPORTANT_SYM);
								break
							} else
								break;
							u = f.read()
						}
						return s == n.CHAR ? (f.reset(),
						this.charToken(t, i, r)) : this.createToken(s, o, i, r)
					},
					notToken: function(t, i, r) {
						var u = this._reader
						, f = t;
						return u.mark(),
						f += u.readCount(4),
						f.toLowerCase() == ":not(" ? this.createToken(n.NOT, f, i, r) : (u.reset(),
						this.charToken(t, i, r))
					},
					numberToken: function(t, i, r) {
						var f = this._reader, e = this.readNumber(t), u, o = n.NUMBER, s = f.peek();
						return ot(s) ? (u = this.readName(f.read()),
						e += u,
						o = /^em$|^ex$|^px$|^gd$|^rem$|^vw$|^vh$|^vmax$|^vmin$|^ch$|^cm$|^mm$|^in$|^pt$|^pc$/i.test(u) ? n.LENGTH : /^deg|^rad$|^grad$/i.test(u) ? n.ANGLE : /^ms$|^s$/i.test(u) ? n.TIME : /^hz$|^khz$/i.test(u) ? n.FREQ : /^dpi$|^dpcm$/i.test(u) ? n.RESOLUTION : n.DIMENSION) : s == "%" && (e += f.read(),
						o = n.PERCENTAGE),
						this.createToken(o, e, i, r)
					},
					stringToken: function(t, i, r) {
						for (var h = t, o = t, f = this._reader, s = t, e = n.STRING, u = f.read(); u; ) {
							if (o += u,
							u == h && s != "\\")
								break;
							if (ft(f.peek()) && u != "\\") {
								e = n.INVALID;
								break
							}
							s = u;
							u = f.read()
						}
						return u === null  && (e = n.INVALID),
						this.createToken(e, o, i, r)
					},
					unicodeRangeToken: function(t, i, r) {
						var u = this._reader, f = t, e, o = n.CHAR;
						return u.peek() == "+" && (u.mark(),
						f += u.read(),
						f += this.readUnicodeRangePart(!0),
						f.length == 2 ? u.reset() : (o = n.UNICODE_RANGE,
						f.indexOf("?") == -1 && u.peek() == "-" && (u.mark(),
						e = u.read(),
						e += this.readUnicodeRangePart(!1),
						e.length == 1 ? u.reset() : f += e))),
						this.createToken(o, f, i, r)
					},
					whitespaceToken: function(t, i, r) {
						var f = this._reader
						, u = t + this.readWhitespace();
						return this.createToken(n.S, u, i, r)
					},
					readUnicodeRangePart: function(n) {
						for (var i = this._reader, r = "", t = i.peek(); d(t) && r.length < 6; )
							i.read(),
							r += t,
							t = i.peek();
						if (n)
							while (t == "?" && r.length < 6)
								i.read(),
								r += t,
								t = i.peek();
						return r
					},
					readWhitespace: function() {
						for (var n = this._reader, i = "", t = n.peek(); k(t); )
							n.read(),
							i += t,
							t = n.peek();
						return i
					},
					readNumber: function(n) {
						for (var t = this._reader, r = n, u = n == ".", i = t.peek(); i; ) {
							if (g(i))
								r += t.read();
							else if (i == ".")
								if (u)
									break;
								else
									u = !0,
									r += t.read();
							else
								break;
							i = t.peek()
						}
						return r
					},
					readString: function() {
						for (var t = this._reader, r = t.read(), i = r, u = r, n = t.peek(); n; ) {
							if (n = t.read(),
							i += n,
							n == r && u != "\\")
								break;
							if (ft(t.peek()) && n != "\\") {
								i = "";
								break
							}
							u = n;
							n = t.peek()
						}
						return n === null  && (i = ""),
						i
					},
					readURI: function(n) {
						var i = this._reader
						, r = n
						, u = ""
						, t = i.peek();
						for (i.mark(); t && k(t); )
							i.read(),
							t = i.peek();
						for (u = t == "'" || t == '"' ? this.readString() : this.readURL(),
						t = i.peek(); t && k(t); )
							i.read(),
							t = i.peek();
						return u === "" || t != ")" ? (r = n,
						i.reset()) : r += u + i.read(),
						r
					},
					readURL: function() {
						for (var n = this._reader, t = "", i = n.peek(); /^[!#$%&\\*-~]$/.test(i); )
							t += n.read(),
							i = n.peek();
						return t
					},
					readName: function(n) {
						for (var t = this._reader, r = n || "", i = t.peek(); ; )
							if (i == "\\")
								r += this.readEscape(t.read()),
								i = t.peek();
							else if (i && et(i))
								r += t.read(),
								i = t.peek();
							else
								break;
						return r
					},
					readEscape: function(n) {
						var r = this._reader
						, i = n || ""
						, u = 0
						, t = r.peek();
						if (d(t))
							do
								i += r.read(),
								t = r.peek();
							while (t && d(t) && ++u < 6);return i.length == 3 && /\s/.test(t) || i.length == 7 || i.length == 1 ? r.read() : t = "",
						i + t
					},
					readComment: function(n) {
						var i = this._reader
						, r = n || ""
						, t = i.read();
						if (t == "*") {
							while (t) {
								if (r += t,
								r.length > 2 && t == "*" && i.peek() == "/") {
									r += i.read();
									break
								}
								t = i.read()
							}
							return r
						}
						return ""
					}
				});
				n = [{
					name: "CDO"
				}, {
					name: "CDC"
				}, {
					name: "S",
					whitespace: !0
				}, {
					name: "COMMENT",
					comment: !0,
					hide: !0,
					channel: "comment"
				}, {
					name: "INCLUDES",
					text: "~="
				}, {
					name: "DASHMATCH",
					text: "|="
				}, {
					name: "PREFIXMATCH",
					text: "^="
				}, {
					name: "SUFFIXMATCH",
					text: "$="
				}, {
					name: "SUBSTRINGMATCH",
					text: "*="
				}, {
					name: "STRING"
				}, {
					name: "IDENT"
				}, {
					name: "HASH"
				}, {
					name: "IMPORT_SYM",
					text: "@import"
				}, {
					name: "PAGE_SYM",
					text: "@page"
				}, {
					name: "MEDIA_SYM",
					text: "@media"
				}, {
					name: "FONT_FACE_SYM",
					text: "@font-face"
				}, {
					name: "CHARSET_SYM",
					text: "@charset"
				}, {
					name: "NAMESPACE_SYM",
					text: "@namespace"
				}, {
					name: "VIEWPORT_SYM",
					text: ["@viewport", "@-ms-viewport"]
				}, {
					name: "URL",
					text: ["@url"]
				}, {
					name: "URLEND",
					text: ["@urlend"]
				}, {
					name: "UNKNOWN_SYM"
				}, {
					name: "KEYFRAMES_SYM",
					text: ["@keyframes", "@-webkit-keyframes", "@-moz-keyframes", "@-o-keyframes"]
				}, {
					name: "IMPORTANT_SYM"
				}, {
					name: "LENGTH"
				}, {
					name: "ANGLE"
				}, {
					name: "TIME"
				}, {
					name: "FREQ"
				}, {
					name: "DIMENSION"
				}, {
					name: "PERCENTAGE"
				}, {
					name: "NUMBER"
				}, {
					name: "URI"
				}, {
					name: "FUNCTION"
				}, {
					name: "UNICODE_RANGE"
				}, {
					name: "INVALID"
				}, {
					name: "PLUS",
					text: "+"
				}, {
					name: "GREATER",
					text: ">"
				}, {
					name: "COMMA",
					text: ","
				}, {
					name: "TILDE",
					text: "~"
				}, {
					name: "NOT"
				}, {
					name: "TOPLEFTCORNER_SYM",
					text: "@top-left-corner"
				}, {
					name: "TOPLEFT_SYM",
					text: "@top-left"
				}, {
					name: "TOPCENTER_SYM",
					text: "@top-center"
				}, {
					name: "TOPRIGHT_SYM",
					text: "@top-right"
				}, {
					name: "TOPRIGHTCORNER_SYM",
					text: "@top-right-corner"
				}, {
					name: "BOTTOMLEFTCORNER_SYM",
					text: "@bottom-left-corner"
				}, {
					name: "BOTTOMLEFT_SYM",
					text: "@bottom-left"
				}, {
					name: "BOTTOMCENTER_SYM",
					text: "@bottom-center"
				}, {
					name: "BOTTOMRIGHT_SYM",
					text: "@bottom-right"
				}, {
					name: "BOTTOMRIGHTCORNER_SYM",
					text: "@bottom-right-corner"
				}, {
					name: "LEFTTOP_SYM",
					text: "@left-top"
				}, {
					name: "LEFTMIDDLE_SYM",
					text: "@left-middle"
				}, {
					name: "LEFTBOTTOM_SYM",
					text: "@left-bottom"
				}, {
					name: "RIGHTTOP_SYM",
					text: "@right-top"
				}, {
					name: "RIGHTMIDDLE_SYM",
					text: "@right-middle"
				}, {
					name: "RIGHTBOTTOM_SYM",
					text: "@right-bottom"
				}, {
					name: "RESOLUTION",
					state: "media"
				}, {
					name: "IE_FUNCTION"
				}, {
					name: "CHAR"
				}, {
					name: "PIPE",
					text: "|"
				}, {
					name: "SLASH",
					text: "/"
				}, {
					name: "MINUS",
					text: "-"
				}, {
					name: "STAR",
					text: "*"
				}, {
					name: "LBRACE",
					endChar: "}",
					text: "{"
				}, {
					name: "RBRACE",
					text: "}"
				}, {
					name: "LBRACKET",
					endChar: "]",
					text: "["
				}, {
					name: "RBRACKET",
					text: "]"
				}, {
					name: "EQUALS",
					text: "="
				}, {
					name: "COLON",
					text: ":"
				}, {
					name: "SEMICOLON",
					text: ";"
				}, {
					name: "LPAREN",
					endChar: ")",
					text: "("
				}, {
					name: "RPAREN",
					text: ")"
				}, {
					name: "DOT",
					text: "."
				}],
				function() {
					var u = [], r = {}, t, f, i;
					for (n.UNKNOWN = -1,
					n.unshift({
						name: "EOF"
					}),
					t = 0,
					f = n.length; t < f; t++)
						if (u.push(n[t].name),
						n[n[t].name] = t,
						n[t].text)
							if (n[t].text instanceof Array)
								for (i = 0; i < n[t].text.length; i++)
									r[n[t].text[i]] = t;
							else
								r[n[t].text] = t;
					n.name = function(n) {
						return u[n]
					}
					;
					n.type = function(n) {
						return r[n] || -1
					}
				}();
				tt = {
					validate: function(n, t) {
						var f = n.toString().toLowerCase()
						, o = t.parts
						, u = new e(t)
						, i = ut[f];
						if (i)
							typeof i != "number" && (typeof i == "string" ? i.indexOf("||") > -1 ? this.groupProperty(i, u) : this.singleProperty(i, u, 1) : i.multi ? this.multiProperty(i.multi, u, i.comma, i.max || Infinity) : typeof i == "function" && i(u));
						else if (f.indexOf("-") !== 0)
							throw new r("Unknown property '" + n + "'.",n.line,n.col);
					},
					singleProperty: function(n, t, u) {
						for (var e = !1, o = t.value, s = 0, f; t.hasNext() && s < u; ) {
							if (e = i.isAny(t, n),
							!e)
								break;
							s++
						}
						if (e) {
							if (t.hasNext()) {
								f = t.next();
								throw new r("Expected end of value but found '" + f + "'.",f.line,f.col);
							}
						} else if (t.hasNext() && !t.isFirst()) {
							f = t.peek();
							throw new r("Expected end of value but found '" + f + "'.",f.line,f.col);
						} else
							throw new r("Expected (" + n + ") but found '" + o + "'.",o.line,o.col);
					},
					multiProperty: function(n, t, u, f) {
						for (var o = !1, s = t.value, h = 0, e; t.hasNext() && !o && h < f; )
							if (i.isAny(t, n))
								if (h++,
								t.hasNext()) {
									if (u)
										if (t.peek() == ",")
											e = t.next();
										else
											break
								} else
									o = !0;
							else
								break;
						if (o) {
							if (t.hasNext()) {
								e = t.next();
								throw new r("Expected end of value but found '" + e + "'.",e.line,e.col);
							}
						} else if (t.hasNext() && !t.isFirst()) {
							e = t.peek();
							throw new r("Expected end of value but found '" + e + "'.",e.line,e.col);
						} else if (e = t.previous(),
						u && e == ",")
							throw new r("Expected end of value but found '" + e + "'.",e.line,e.col);
						else
							throw new r("Expected (" + n + ") but found '" + s + "'.",s.line,s.col);
					},
					groupProperty: function(n, t) {
						for (var o = !1, s = t.value, c = n.split("||").length, f = {
							count: 0
						}, h = !1, e, u; t.hasNext() && !o; )
							if (e = i.isAnyOfGroup(t, n),
							e)
								if (f[e])
									break;
								else
									f[e] = 1,
									f.count++,
									h = !0,
									f.count != c && t.hasNext() || (o = !0);
							else
								break;
						if (o) {
							if (t.hasNext()) {
								u = t.next();
								throw new r("Expected end of value but found '" + u + "'.",u.line,u.col);
							}
						} else if (h && t.hasNext()) {
							u = t.peek();
							throw new r("Expected end of value but found '" + u + "'.",u.line,u.col);
						} else
							throw new r("Expected (" + n + ") but found '" + s + "'.",s.line,s.col);
					}
				};
				r.prototype = new Error;
				i = {
					isLiteral: function(n, t) {
						for (var e = n.text.toString().toLowerCase(), u = t.split(" | "), r = !1, i = 0, f = u.length; i < f && !r; i++)
							e == u[i].toLowerCase() && (r = !0);
						return r
					},
					isSimple: function(n) {
						return !!this.simple[n]
					},
					isComplex: function(n) {
						return !!this.complex[n]
					},
					isAny: function(n, t) {
						for (var u = t.split(" | "), r = !1, i = 0, f = u.length; i < f && !r && n.hasNext(); i++)
							r = this.isType(n, u[i]);
						return r
					},
					isAnyOfGroup: function(n, t) {
						for (var r = t.split(" || "), u = !1, i = 0, f = r.length; i < f && !u; i++)
							u = this.isType(n, r[i]);
						return u ? r[i - 1] : !1
					},
					isType: function(n, t) {
						var r = n.peek()
						, i = !1;
						return t.charAt(0) != "<" ? (i = this.isLiteral(r, t),
						i && n.next()) : this.simple[t] ? (i = this.simple[t](r),
						i && n.next()) : i = this.complex[t](n),
						i
					},
					simple: {
						"<absolute-size>": function(n) {
							return i.isLiteral(n, "xx-small | x-small | small | medium | large | x-large | xx-large")
						},
						"<attachment>": function(n) {
							return i.isLiteral(n, "scroll | fixed | local")
						},
						"<attr>": function(n) {
							return n.type == "function" && n.name == "attr"
						},
						"<bg-image>": function(n) {
							return this["<image>"](n) || this["<gradient>"](n) || n == "none"
						},
						"<gradient>": function(n) {
							return n.type == "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?(?:repeating\-)?(?:radial\-|linear\-)?gradient/i.test(n)
						},
						"<box>": function(n) {
							return i.isLiteral(n, "padding-box | border-box | content-box")
						},
						"<content>": function(n) {
							return n.type == "function" && n.name == "content"
						},
						"<relative-size>": function(n) {
							return i.isLiteral(n, "smaller | larger")
						},
						"<ident>": function(n) {
							return n.type == "identifier"
						},
						"<length>": function(n) {
							return n.type == "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?calc/i.test(n) ? !0 : n.type == "length" || n.type == "number" || n.type == "integer" || n == "0"
						},
						"<color>": function(n) {
							return n.type == "color" || n == "transparent"
						},
						"<number>": function(n) {
							return n.type == "number" || this["<integer>"](n)
						},
						"<integer>": function(n) {
							return n.type == "integer"
						},
						"<line>": function(n) {
							return n.type == "integer"
						},
						"<angle>": function(n) {
							return n.type == "angle"
						},
						"<uri>": function(n) {
							return n.type == "uri"
						},
						"<image>": function(n) {
							return this["<uri>"](n)
						},
						"<percentage>": function(n) {
							return n.type == "percentage" || n == "0"
						},
						"<border-width>": function(n) {
							return this["<length>"](n) || i.isLiteral(n, "thin | medium | thick")
						},
						"<border-style>": function(n) {
							return i.isLiteral(n, "none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset")
						},
						"<content-sizing>": function(n) {
							return i.isLiteral(n, "fill-available | -moz-available | -webkit-fill-available | max-content | -moz-max-content | -webkit-max-content | min-content | -moz-min-content | -webkit-min-content | fit-content | -moz-fit-content | -webkit-fit-content")
						},
						"<margin-width>": function(n) {
							return this["<length>"](n) || this["<percentage>"](n) || i.isLiteral(n, "auto")
						},
						"<padding-width>": function(n) {
							return this["<length>"](n) || this["<percentage>"](n)
						},
						"<shape>": function(n) {
							return n.type == "function" && (n.name == "rect" || n.name == "inset-rect")
						},
						"<time>": function(n) {
							return n.type == "time"
						},
						"<flex-grow>": function(n) {
							return this["<number>"](n)
						},
						"<flex-shrink>": function(n) {
							return this["<number>"](n)
						},
						"<width>": function(n) {
							return this["<margin-width>"](n)
						},
						"<flex-basis>": function(n) {
							return this["<width>"](n)
						},
						"<flex-direction>": function(n) {
							return i.isLiteral(n, "row | row-reverse | column | column-reverse")
						},
						"<flex-wrap>": function(n) {
							return i.isLiteral(n, "nowrap | wrap | wrap-reverse")
						}
					},
					complex: {
						"<bg-position>": function(n) {
							for (var o = this, t = !1, r = "<percentage> | <length>", u = "left | right", f = "top | bottom", e = 0, s = function() {
								return n.hasNext() && n.peek() != ","
							}
							; n.peek(e) && n.peek(e) != ","; )
								e++;
							return e < 3 ? i.isAny(n, u + " | center | " + r) ? (t = !0,
							i.isAny(n, f + " | center | " + r)) : i.isAny(n, f) && (t = !0,
							i.isAny(n, u + " | center")) : i.isAny(n, u) ? i.isAny(n, f) ? (t = !0,
							i.isAny(n, r)) : i.isAny(n, r) && (i.isAny(n, f) ? (t = !0,
							i.isAny(n, r)) : i.isAny(n, "center") && (t = !0)) : i.isAny(n, f) ? i.isAny(n, u) ? (t = !0,
							i.isAny(n, r)) : i.isAny(n, r) && (i.isAny(n, u) ? (t = !0,
							i.isAny(n, r)) : i.isAny(n, "center") && (t = !0)) : i.isAny(n, "center") && i.isAny(n, u + " | " + f) && (t = !0,
							i.isAny(n, r)),
							t
						},
						"<bg-size>": function(n) {
							var u = this
							, t = !1
							, r = "<percentage> | <length> | auto";
							return i.isAny(n, "cover | contain") ? t = !0 : i.isAny(n, r) && (t = !0,
							i.isAny(n, r)),
							t
						},
						"<repeat-style>": function(n) {
							var t = !1, u = "repeat | space | round | no-repeat", r;
							return n.hasNext() && (r = n.next(),
							i.isLiteral(r, "repeat-x | repeat-y") ? t = !0 : i.isLiteral(r, u) && (t = !0,
							n.hasNext() && i.isLiteral(n.peek(), u) && n.next())),
							t
						},
						"<shadow>": function(n) {
							var r = !1
							, t = 0
							, u = !1
							, f = !1;
							if (n.hasNext()) {
								for (i.isAny(n, "inset") && (u = !0),
								i.isAny(n, "<color>") && (f = !0); i.isAny(n, "<length>") && t < 4; )
									t++;
								n.hasNext() && (f || i.isAny(n, "<color>"),
								u || i.isAny(n, "inset"));
								r = t >= 2 && t <= 4
							}
							return r
						},
						"<x-one-radius>": function(n) {
							var t = !1
							, r = "<length> | <percentage> | inherit";
							return i.isAny(n, r) && (t = !0,
							i.isAny(n, r)),
							t
						},
						"<flex>": function(n) {
							var u, t = !1;
							if (i.isAny(n, "none | inherit") ? t = !0 : i.isType(n, "<flex-grow>") ? n.peek() ? i.isType(n, "<flex-shrink>") ? t = n.peek() ? i.isType(n, "<flex-basis>") : !0 : i.isType(n, "<flex-basis>") && (t = n.peek() === null ) : t = !0 : i.isType(n, "<flex-basis>") && (t = !0),
							!t) {
								u = n.peek();
								throw new r("Expected (none | [ <flex-grow> <flex-shrink>? || <flex-basis> ]) but found '" + n.value.text + "'.",u.line,u.col);
							}
							return t
						}
					}
				};
				t.css = {
					Colors: Colors,
					Combinator: l,
					Parser: Parser,
					PropertyName: a,
					PropertyValue: w,
					PropertyValuePart: o,
					MediaFeature: y,
					MediaQuery: p,
					Selector: b,
					SelectorPart: s,
					SelectorSubPart: u,
					Specificity: v,
					TokenStream: h,
					Tokens: n,
					ValidationError: r
				}
			}(),
			function() {
				for (var n in t)
					exports[n] = t[n]
			}(),
			r = function() {
				"use strict";
				function n(t, r, u, f) {
					function s(t, u) {
						var h, l, v, a, y;
						if (t === null )
							return null ;
						if (u == 0 || typeof t != "object")
							return t;
						if (n.__isArray(t))
							h = [];
						else if (n.__isRegExp(t))
							h = new RegExp(t.source,i(t)),
							t.lastIndex && (h.lastIndex = t.lastIndex);
						else if (n.__isDate(t))
							h = new Date(t.getTime());
						else {
							if (c && Buffer.isBuffer(t))
								return h = new Buffer(t.length),
								t.copy(h),
								h;
							typeof f == "undefined" ? (l = Object.getPrototypeOf(t),
							h = Object.create(l)) : (h = Object.create(f),
							l = f)
						}
						if (r) {
							if (v = e.indexOf(t),
							v != -1)
								return o[v];
							e.push(t);
							o.push(h)
						}
						for (a in t)
							(l && (y = Object.getOwnPropertyDescriptor(l, a)),
							y && y.set == null ) || (h[a] = s(t[a], u - 1));
						return h
					}
					var h;
					typeof r == "object" && (u = r.depth,
					f = r.prototype,
					h = r.filter,
					r = r.circular);
					var e = []
					, o = []
					, c = typeof Buffer != "undefined";
					return typeof r == "undefined" && (r = !0),
					typeof u == "undefined" && (u = Infinity),
					s(t, u)
				}
				function t(n) {
					return Object.prototype.toString.call(n)
				}
				function r(n) {
					return typeof n == "object" && t(n) === "[object Date]"
				}
				function u(n) {
					return typeof n == "object" && t(n) === "[object Array]"
				}
				function f(n) {
					return typeof n == "object" && t(n) === "[object RegExp]"
				}
				function i(n) {
					var t = "";
					return n.global && (t += "g"),
					n.ignoreCase && (t += "i"),
					n.multiline && (t += "m"),
					t
				}
				return n.clonePrototype = function(n) {
					if (n === null )
						return null ;
					var t = function() {}
					;
					return t.prototype = n,
					new t
				}
				,
				n.__objToStr = t,
				n.__isDate = r,
				n.__isArray = u,
				n.__isRegExp = f,
				n.__getRegExpFlags = i,
				n
			}(),
			typeof module == "object" && module.exports && (module.exports = r),
			n = function() {
				"use strict";
				function o(n, t) {
					var i, r = n && n.match(e), u = r && r[1];
					return u && (i = {
						"true": 2,
						"": 1,
						"false": 0,
						"2": 2,
						"1": 1,
						"0": 0
					},
					u.toLowerCase().split(",").forEach(function(n) {
						var r = n.split(":")
						, u = r[0] || ""
						, f = r[1] || "";
						t[u.trim()] = i[f.trim()]
					})),
					t
				}
				var u = []
				, f = []
				, e = /\/\*csslint([^\*]*)\*\//
				, n = new t.util.EventTarget;
				return n.version = "@VERSION@",
				n.addRule = function(n) {
					u.push(n);
					u[n.id] = n
				}
				,
				n.clearRules = function() {
					u = []
				}
				,
				n.getRules = function() {
					return [].concat(u).sort(function(n, t) {
						return n.id > t.id ? 1 : 0
					})
				}
				,
				n.getRuleset = function() {
					for (var n = {}, t = 0, i = u.length; t < i; )
						n[u[t++].id] = 1;
					return n
				}
				,
				n.addFormatter = function(n) {
					f[n.id] = n
				}
				,
				n.getFormatter = function(n) {
					return f[n]
				}
				,
				n.format = function(n, t, i, r) {
					var u = this.getFormatter(i)
					, f = null ;
					return u && (f = u.startFormat(),
					f += u.formatResults(n, t, r || {}),
					f += u.endFormat()),
					f
				}
				,
				n.hasFormat = function(n) {
					return f.hasOwnProperty(n)
				}
				,
				n.verify = function(n, f) {
					var h = 0, s, a, c, v = new t.css.Parser({
						starHack: !0,
						ieFilters: !0,
						underscoreHack: !0,
						strict: !1
					});
					a = n.replace(/\n\r?/g, "$split$").split("$split$");
					f || (f = this.getRuleset());
					e.test(n) && (f = r(f),
					f = o(n, f));
					s = new i(a,f);
					f.errors = 2;
					for (h in f)
						f.hasOwnProperty(h) && f[h] && u[h] && u[h].init(v, s);
					try {
						v.parse(n)
					} catch (l) {
						s.error("Fatal error, cannot continue: " + l.message, l.line, l.col, {})
					}
					return c = {
						messages: s.messages,
						stats: s.stats,
						ruleset: s.ruleset
					},
					c.messages.sort(function(n, t) {
						return n.rollup && !t.rollup ? 1 : !n.rollup && t.rollup ? -1 : n.line - t.line
					}),
					c
				}
				,
				n
			}(),
			i.prototype = {
				constructor: i,
				error: function(n, t, i, r) {
					"use strict";
					this.messages.push({
						type: "error",
						line: t,
						col: i,
						message: n,
						evidence: this.lines[t - 1],
						rule: r || {}
					})
				},
				warn: function(n, t, i, r) {
					"use strict";
					this.report(n, t, i, r)
				},
				report: function(n, t, i, r) {
					"use strict";
					this.messages.push({
						type: this.ruleset[r.id] === 2 ? "error" : "warning",
						line: t,
						col: i,
						message: n,
						evidence: this.lines[t - 1],
						rule: r
					})
				},
				info: function(n, t, i, r) {
					"use strict";
					this.messages.push({
						type: "info",
						line: t,
						col: i,
						message: n,
						evidence: this.lines[t - 1],
						rule: r
					})
				},
				rollupError: function(n, t) {
					"use strict";
					this.messages.push({
						type: "error",
						rollup: !0,
						message: n,
						rule: t
					})
				},
				rollupWarn: function(n, t) {
					"use strict";
					this.messages.push({
						type: "warning",
						rollup: !0,
						message: n,
						rule: t
					})
				},
				stat: function(n, t) {
					"use strict";
					this.stats[n] = t
				}
			},
			n._Reporter = i,
			n.Util = {
				mix: function(n, t) {
					"use strict";
					for (var i in t)
						t.hasOwnProperty(i) && (n[i] = t[i]);
					return i
				},
				indexOf: function(n, t) {
					"use strict";
					if (n.indexOf)
						return n.indexOf(t);
					for (var i = 0, r = n.length; i < r; i++)
						if (n[i] === t)
							return i;
					return -1
				},
				forEach: function(n, t) {
					"use strict";
					if (n.forEach)
						return n.forEach(t);
					for (var i = 0, r = n.length; i < r; i++)
						t(n[i], i, n)
				}
			},
			n.addRule({
				id: "adjoining-classes",
				name: "Disallow adjoining classes",
				desc: "Don't use adjoining classes.",
				browsers: "IE6",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("startrule", function(r) {
						for (var c = r.selectors, s, u, l, h, e, o, f = 0; f < c.length; f++)
							for (s = c[f],
							e = 0; e < s.parts.length; e++)
								if (u = s.parts[e],
								u.type === n.SELECTOR_PART_TYPE)
									for (h = 0,
									o = 0; o < u.modifiers.length; o++)
										l = u.modifiers[o],
										l.type === "class" && h++,
										h > 1 && t.report("Don't use adjoining classes.", u.line, u.col, i)
					})
				}
			}),
			n.addRule({
				id: "box-model",
				name: "Beware of broken box size",
				desc: "Don't use width or height when using padding or border.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					function r() {
						i = {};
						o = !1
					}
					function u() {
						var n, r;
						if (!o) {
							if (i.height)
								for (n in e)
									e.hasOwnProperty(n) && i[n] && (r = i[n].value,
									n === "padding" && r.parts.length === 2 && r.parts[0].value === 0 || t.report("Using height with " + n + " can sometimes make elements larger than you expect.", i[n].line, i[n].col, s));
							if (i.width)
								for (n in f)
									f.hasOwnProperty(n) && i[n] && (r = i[n].value,
									n === "padding" && r.parts.length === 2 && r.parts[1].value === 0 || t.report("Using width with " + n + " can sometimes make elements larger than you expect.", i[n].line, i[n].col, s))
						}
					}
					var s = this, f = {
						border: 1,
						"border-left": 1,
						"border-right": 1,
						padding: 1,
						"padding-left": 1,
						"padding-right": 1
					}, e = {
						border: 1,
						"border-bottom": 1,
						"border-top": 1,
						padding: 1,
						"padding-bottom": 1,
						"padding-top": 1
					}, i, o = !1;
					n.addListener("startrule", r);
					n.addListener("startfontface", r);
					n.addListener("startpage", r);
					n.addListener("startpagemargin", r);
					n.addListener("startkeyframerule", r);
					n.addListener("startviewport", r);
					n.addListener("property", function(n) {
						var t = n.property.text.toLowerCase();
						e[t] || f[t] ? /^0\S*$/.test(n.value) || t === "border" && n.value.toString() === "none" || (i[t] = {
							line: n.property.line,
							col: n.property.col,
							value: n.value
						}) : /^(width|height)/i.test(t) && /^(length|percentage)/.test(n.value.parts[0].type) ? i[t] = 1 : t === "box-sizing" && (o = !0)
					});
					n.addListener("endrule", u);
					n.addListener("endfontface", u);
					n.addListener("endpage", u);
					n.addListener("endpagemargin", u);
					n.addListener("endkeyframerule", u);
					n.addListener("endviewport", u)
				}
			}),
			n.addRule({
				id: "box-sizing",
				name: "Disallow use of box-sizing",
				desc: "The box-sizing properties isn't supported in IE6 and IE7.",
				browsers: "IE6, IE7",
				tags: ["Compatibility"],
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("property", function(n) {
						var r = n.property.text.toLowerCase();
						r === "box-sizing" && t.report("The box-sizing property isn't supported in IE6 and IE7.", n.line, n.col, i)
					})
				}
			}),
			n.addRule({
				id: "bulletproof-font-face",
				name: "Use the bulletproof @font-face syntax",
				desc: "Use the bulletproof @font-face syntax to avoid 404's in old IE (http://www.fontspring.com/blog/the-new-bulletproof-font-face-syntax).",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var o = this, i = !1, r = !0, u = !1, f, e;
					n.addListener("startfontface", function() {
						i = !0
					});
					n.addListener("property", function(n) {
						var s, t, o;
						i && (s = n.property.toString().toLowerCase(),
						t = n.value.toString(),
						f = n.line,
						e = n.col,
						s === "src" && (o = /^\s?url\(['"].+\.eot\?.*['"]\)\s*format\(['"]embedded-opentype['"]\).*$/i,
						!t.match(o) && r ? (u = !0,
						r = !1) : t.match(o) && !r && (u = !1)))
					});
					n.addListener("endfontface", function() {
						i = !1;
						u && t.report("@font-face declaration doesn't follow the fontspring bulletproof syntax.", f, e, o)
					})
				}
			}),
			n.addRule({
				id: "compatible-vendor-prefixes",
				name: "Require compatible vendor prefixes",
				desc: "Include all compatible vendor prefixes to reach a wider range of users.",
				browsers: "All",
				init: function(t, i) {
					"use strict";
					var a = this, r, u, f, o, h, s, c, e = !1, v = Array.prototype.push, l = [];
					r = {
						animation: "webkit moz",
						"animation-delay": "webkit moz",
						"animation-direction": "webkit moz",
						"animation-duration": "webkit moz",
						"animation-fill-mode": "webkit moz",
						"animation-iteration-count": "webkit moz",
						"animation-name": "webkit moz",
						"animation-play-state": "webkit moz",
						"animation-timing-function": "webkit moz",
						appearance: "webkit moz",
						"border-end": "webkit moz",
						"border-end-color": "webkit moz",
						"border-end-style": "webkit moz",
						"border-end-width": "webkit moz",
						"border-image": "webkit moz o",
						"border-radius": "webkit",
						"border-start": "webkit moz",
						"border-start-color": "webkit moz",
						"border-start-style": "webkit moz",
						"border-start-width": "webkit moz",
						"box-align": "webkit moz ms",
						"box-direction": "webkit moz ms",
						"box-flex": "webkit moz ms",
						"box-lines": "webkit ms",
						"box-ordinal-group": "webkit moz ms",
						"box-orient": "webkit moz ms",
						"box-pack": "webkit moz ms",
						"box-sizing": "webkit moz",
						"box-shadow": "webkit moz",
						"column-count": "webkit moz ms",
						"column-gap": "webkit moz ms",
						"column-rule": "webkit moz ms",
						"column-rule-color": "webkit moz ms",
						"column-rule-style": "webkit moz ms",
						"column-rule-width": "webkit moz ms",
						"column-width": "webkit moz ms",
						hyphens: "epub moz",
						"line-break": "webkit ms",
						"margin-end": "webkit moz",
						"margin-start": "webkit moz",
						"marquee-speed": "webkit wap",
						"marquee-style": "webkit wap",
						"padding-end": "webkit moz",
						"padding-start": "webkit moz",
						"tab-size": "moz o",
						"text-size-adjust": "webkit ms",
						transform: "webkit moz ms o",
						"transform-origin": "webkit moz ms o",
						transition: "webkit moz o",
						"transition-delay": "webkit moz o",
						"transition-duration": "webkit moz o",
						"transition-property": "webkit moz o",
						"transition-timing-function": "webkit moz o",
						"user-modify": "webkit moz",
						"user-select": "webkit moz ms",
						"word-break": "epub ms",
						"writing-mode": "epub ms"
					};
					for (f in r)
						if (r.hasOwnProperty(f)) {
							for (o = [],
							h = r[f].split(" "),
							s = 0,
							c = h.length; s < c; s++)
								o.push("-" + h[s] + "-" + f);
							r[f] = o;
							v.apply(l, o)
						}
					t.addListener("startrule", function() {
						u = []
					});
					t.addListener("startkeyframes", function(n) {
						e = n.prefix || !0
					});
					t.addListener("endkeyframes", function() {
						e = !1
					});
					t.addListener("property", function(t) {
						var i = t.property;
						n.Util.indexOf(l, i.text) > -1 && (e && typeof e == "string" && i.text.indexOf("-" + e + "-") === 0 || u.push(i))
					});
					t.addListener("endrule", function() {
						if (u.length) {
							for (var f = {}, s, t, v, h, l, o, y, p, e = 0, c = u.length; e < c; e++) {
								s = u[e];
								for (t in r)
									r.hasOwnProperty(t) && (v = r[t],
									n.Util.indexOf(v, s.text) > -1 && (f[t] || (f[t] = {
										full: v.slice(0),
										actual: [],
										actualNodes: []
									}),
									n.Util.indexOf(f[t].actual, s.text) === -1 && (f[t].actual.push(s.text),
									f[t].actualNodes.push(s))))
							}
							for (t in f)
								if (f.hasOwnProperty(t) && (h = f[t],
								l = h.full,
								o = h.actual,
								l.length > o.length))
									for (e = 0,
									c = l.length; e < c; e++)
										y = l[e],
										n.Util.indexOf(o, y) === -1 && (p = o.length === 1 ? o[0] : o.length === 2 ? o.join(" and ") : o.join(", "),
										i.report("The property " + y + " is compatible with " + p + " and should be included as well.", h.actualNodes[0].line, h.actualNodes[0].col, a))
						}
					})
				}
			}),
			n.addRule({
				id: "display-property-grouping",
				name: "Require properties appropriate for display",
				desc: "Certain properties shouldn't be used with certain display property values.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					function i(n, i, u) {
						r[n] && (typeof e[n] != "string" || r[n].value.toLowerCase() !== e[n]) && t.report(u || n + " can't be used with display: " + i + ".", r[n].line, r[n].col, o)
					}
					function u() {
						r = {}
					}
					function f() {
						var n = r.display ? r.display.value : null ;
						if (n)
							switch (n) {
							case "inline":
								i("height", n);
								i("width", n);
								i("margin", n);
								i("margin-top", n);
								i("margin-bottom", n);
								i("float", n, "display:inline has no effect on floated elements (but may be used to fix the IE6 double-margin bug).");
								break;
							case "block":
								i("vertical-align", n);
								break;
							case "inline-block":
								i("float", n);
								break;
							default:
								n.indexOf("table-") === 0 && (i("margin", n),
								i("margin-left", n),
								i("margin-right", n),
								i("margin-top", n),
								i("margin-bottom", n),
								i("float", n))
							}
					}
					var o = this, e = {
						display: 1,
						float: "none",
						height: 1,
						width: 1,
						margin: 1,
						"margin-left": 1,
						"margin-right": 1,
						"margin-bottom": 1,
						"margin-top": 1,
						padding: 1,
						"padding-left": 1,
						"padding-right": 1,
						"padding-bottom": 1,
						"padding-top": 1,
						"vertical-align": 1
					}, r;
					n.addListener("startrule", u);
					n.addListener("startfontface", u);
					n.addListener("startkeyframerule", u);
					n.addListener("startpagemargin", u);
					n.addListener("startpage", u);
					n.addListener("startviewport", u);
					n.addListener("property", function(n) {
						var t = n.property.text.toLowerCase();
						e[t] && (r[t] = {
							value: n.value.text,
							line: n.property.line,
							col: n.property.col
						})
					});
					n.addListener("endrule", f);
					n.addListener("endfontface", f);
					n.addListener("endkeyframerule", f);
					n.addListener("endpagemargin", f);
					n.addListener("endpage", f);
					n.addListener("endviewport", f)
				}
			}),
			n.addRule({
				id: "duplicate-background-images",
				name: "Disallow duplicate background images",
				desc: "Every background-image should be unique. Use a common class for e.g. sprites.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = {};
					n.addListener("property", function(n) {
						var o = n.property.text, f = n.value, u, e;
						if (o.match(/background/i))
							for (u = 0,
							e = f.parts.length; u < e; u++)
								f.parts[u].type === "uri" && (typeof i[f.parts[u].uri] == "undefined" ? i[f.parts[u].uri] = n : t.report("Background image '" + f.parts[u].uri + "' was used multiple times, first declared at line " + i[f.parts[u].uri].line + ", col " + i[f.parts[u].uri].col + ".", n.line, n.col, r))
					})
				}
			}),
			n.addRule({
				id: "duplicate-properties",
				name: "Disallow duplicate properties",
				desc: "Duplicate properties must appear one after the other.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					function i() {
						r = {}
					}
					var f = this, r, u;
					n.addListener("startrule", i);
					n.addListener("startfontface", i);
					n.addListener("startpage", i);
					n.addListener("startpagemargin", i);
					n.addListener("startkeyframerule", i);
					n.addListener("startviewport", i);
					n.addListener("property", function(n) {
						var e = n.property
						, i = e.text.toLowerCase();
						r[i] && (u !== i || r[i] === n.value.text) && t.report("Duplicate property '" + n.property + "' found.", n.line, n.col, f);
						r[i] = n.value.text;
						u = i
					})
				}
			}),
			n.addRule({
				id: "empty-rules",
				name: "Disallow empty rules",
				desc: "Rules without any properties specified should be removed.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = 0;
					n.addListener("startrule", function() {
						i = 0
					});
					n.addListener("property", function() {
						i++
					});
					n.addListener("endrule", function(n) {
						var u = n.selectors;
						i === 0 && t.report("Rule is empty.", u[0].line, u[0].col, r)
					})
				}
			}),
			n.addRule({
				id: "errors",
				name: "Parsing Errors",
				desc: "This rule looks for recoverable syntax errors.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("error", function(n) {
						t.error(n.message, n.line, n.col, i)
					})
				}
			}),
			n.addRule({
				id: "fallback-colors",
				name: "Require fallback colors",
				desc: "For older browsers that don't support RGBA, HSL, or HSLA, provide a fallback color.",
				browsers: "IE6,IE7,IE8",
				init: function(n, t) {
					"use strict";
					function i() {
						e = {};
						r = null 
					}
					var u = this, r, f = {
						color: 1,
						background: 1,
						"border-color": 1,
						"border-top-color": 1,
						"border-right-color": 1,
						"border-bottom-color": 1,
						"border-left-color": 1,
						border: 1,
						"border-top": 1,
						"border-right": 1,
						"border-bottom": 1,
						"border-left": 1,
						"background-color": 1
					}, e;
					n.addListener("startrule", i);
					n.addListener("startfontface", i);
					n.addListener("startpage", i);
					n.addListener("startpagemargin", i);
					n.addListener("startkeyframerule", i);
					n.addListener("startviewport", i);
					n.addListener("property", function(n) {
						var h = n.property
						, o = h.text.toLowerCase()
						, e = n.value.parts
						, i = 0
						, s = ""
						, c = e.length;
						if (f[o])
							while (i < c)
								e[i].type === "color" && ("alpha" in e[i] || "hue" in e[i] ? (/([^\)]+)\(/.test(e[i]) && (s = RegExp.$1.toUpperCase()),
								r && r.property.text.toLowerCase() === o && r.colorType === "compat" || t.report("Fallback " + o + " (hex or RGB) should precede " + s + " " + o + ".", n.line, n.col, u)) : n.colorType = "compat"),
								i++;
						r = n
					})
				}
			}),
			n.addRule({
				id: "floats",
				name: "Disallow too many floats",
				desc: "This rule tests if the float property is used too many times",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = 0;
					n.addListener("property", function(n) {
						n.property.text.toLowerCase() === "float" && n.value.text.toLowerCase() !== "none" && i++
					});
					n.addListener("endstylesheet", function() {
						t.stat("floats", i);
						i >= 10 && t.rollupWarn("Too many floats (" + i + "), you're probably using them for layout. Consider using a grid system instead.", r)
					})
				}
			}),
			n.addRule({
				id: "font-faces",
				name: "Don't use too many web fonts",
				desc: "Too many different web fonts in the same stylesheet.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = 0;
					n.addListener("startfontface", function() {
						i++
					});
					n.addListener("endstylesheet", function() {
						i > 5 && t.rollupWarn("Too many @font-face declarations (" + i + ").", r)
					})
				}
			}),
			n.addRule({
				id: "font-sizes",
				name: "Disallow too many font sizes",
				desc: "Checks the number of font-size declarations.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = 0;
					n.addListener("property", function(n) {
						n.property.toString() === "font-size" && i++
					});
					n.addListener("endstylesheet", function() {
						t.stat("font-sizes", i);
						i >= 10 && t.rollupWarn("Too many font-size declarations (" + i + "), abstraction needed.", r)
					})
				}
			}),
			n.addRule({
				id: "gradients",
				name: "Require all gradient definitions",
				desc: "When using a vendor-prefixed gradient, make sure to use them all.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var r = this, i;
					n.addListener("startrule", function() {
						i = {
							moz: 0,
							webkit: 0,
							oldWebkit: 0,
							o: 0
						}
					});
					n.addListener("property", function(n) {
						/\-(moz|o|webkit)(?:\-(?:linear|radial))\-gradient/i.test(n.value) ? i[RegExp.$1] = 1 : /\-webkit\-gradient/i.test(n.value) && (i.oldWebkit = 1)
					});
					n.addListener("endrule", function(n) {
						var u = [];
						i.moz || u.push("Firefox 3.6+");
						i.webkit || u.push("Webkit (Safari 5+, Chrome)");
						i.oldWebkit || u.push("Old Webkit (Safari 4+, Chrome)");
						i.o || u.push("Opera 11.1+");
						u.length && u.length < 4 && t.report("Missing vendor-prefixed CSS gradients for " + u.join(", ") + ".", n.selectors[0].line, n.selectors[0].col, r)
					})
				}
			}),
			n.addRule({
				id: "import",
				name: "Disallow @import",
				desc: "Don't use @import, use <link> instead.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("import", function(n) {
						t.report("@import prevents parallel downloads, use <link> instead.", n.line, n.col, i)
					})
				}
			}),
			n.addRule({
				id: "important",
				name: "Disallow !important",
				desc: "Be careful when using !important declaration",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = 0;
					n.addListener("property", function(n) {
						n.important === !0 && (i++,
						t.report("Use of !important", n.line, n.col, r))
					});
					n.addListener("endstylesheet", function() {
						t.stat("important", i);
						i >= 10 && t.rollupWarn("Too many !important declarations (" + i + "), try to use less than 10 to avoid specificity issues.", r)
					})
				}
			}),
			n.addRule({
				id: "known-properties",
				name: "Require use of known properties",
				desc: "Properties should be known (listed in CSS3 specification) or be a vendor-prefixed property.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("property", function(n) {
						n.invalid && t.report(n.invalid.message, n.line, n.col, i)
					})
				}
			}),
			n.addRule({
				id: "order-alphabetical",
				name: "Alphabetical order",
				desc: "Assure properties are in alphabetical order",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var f = this, u, i = function() {
						u = []
					}
					, r = function(n) {
						var i = u.join(",")
						, r = u.sort().join(",");
						i !== r && t.report("Rule doesn't have all its properties in alphabetical ordered.", n.line, n.col, f)
					}
					;
					n.addListener("startrule", i);
					n.addListener("startfontface", i);
					n.addListener("startpage", i);
					n.addListener("startpagemargin", i);
					n.addListener("startkeyframerule", i);
					n.addListener("startviewport", i);
					n.addListener("property", function(n) {
						var t = n.property.text
						, i = t.toLowerCase().replace(/^-.*?-/, "");
						u.push(i)
					});
					n.addListener("endrule", r);
					n.addListener("endfontface", r);
					n.addListener("endpage", r);
					n.addListener("endpagemargin", r);
					n.addListener("endkeyframerule", r);
					n.addListener("endviewport", r)
				}
			}),
			n.addRule({
				id: "outline-none",
				name: "Disallow outline: none",
				desc: "Use of outline: none or outline: 0 should be limited to :focus rules.",
				browsers: "All",
				tags: ["Accessibility"],
				init: function(n, t) {
					"use strict";
					function r(n) {
						i = n.selectors ? {
							line: n.line,
							col: n.col,
							selectors: n.selectors,
							propCount: 0,
							outline: !1
						} : null 
					}
					function u() {
						i && i.outline && (i.selectors.toString().toLowerCase().indexOf(":focus") === -1 ? t.report("Outlines should only be modified using :focus.", i.line, i.col, f) : i.propCount === 1 && t.report("Outlines shouldn't be hidden unless other visual changes are made.", i.line, i.col, f))
					}
					var f = this, i;
					n.addListener("startrule", r);
					n.addListener("startfontface", r);
					n.addListener("startpage", r);
					n.addListener("startpagemargin", r);
					n.addListener("startkeyframerule", r);
					n.addListener("startviewport", r);
					n.addListener("property", function(n) {
						var r = n.property.text.toLowerCase()
						, t = n.value;
						i && (i.propCount++,
						r === "outline" && (t.toString() === "none" || t.toString() === "0") && (i.outline = !0))
					});
					n.addListener("endrule", u);
					n.addListener("endfontface", u);
					n.addListener("endpage", u);
					n.addListener("endpagemargin", u);
					n.addListener("endkeyframerule", u);
					n.addListener("endviewport", u)
				}
			}),
			n.addRule({
				id: "overqualified-elements",
				name: "Disallow overqualified elements",
				desc: "Don't use classes or IDs with elements (a.foo or a#foo).",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = {};
					n.addListener("startrule", function(u) {
						for (var l = u.selectors, c, f, e, s, h, o = 0; o < l.length; o++)
							for (c = l[o],
							s = 0; s < c.parts.length; s++)
								if (f = c.parts[s],
								f.type === n.SELECTOR_PART_TYPE)
									for (h = 0; h < f.modifiers.length; h++)
										e = f.modifiers[h],
										f.elementName && e.type === "id" ? t.report("Element (" + f + ") is overqualified, just use " + e + " without element name.", f.line, f.col, r) : e.type === "class" && (i[e] || (i[e] = []),
										i[e].push({
											modifier: e,
											part: f
										}))
					});
					n.addListener("endstylesheet", function() {
						for (var n in i)
							i.hasOwnProperty(n) && i[n].length === 1 && i[n][0].part.elementName && t.report("Element (" + i[n][0].part + ") is overqualified, just use " + i[n][0].modifier + " without element name.", i[n][0].part.line, i[n][0].part.col, r)
					})
				}
			}),
			n.addRule({
				id: "qualified-headings",
				name: "Disallow qualified headings",
				desc: "Headings should not be qualified (namespaced).",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("startrule", function(r) {
						for (var s = r.selectors, o, u, f, e = 0; e < s.length; e++)
							for (o = s[e],
							f = 0; f < o.parts.length; f++)
								u = o.parts[f],
								u.type === n.SELECTOR_PART_TYPE && u.elementName && /h[1-6]/.test(u.elementName.toString()) && f > 0 && t.report("Heading (" + u.elementName + ") should not be qualified.", u.line, u.col, i)
					})
				}
			}),
			n.addRule({
				id: "regex-selectors",
				name: "Disallow selectors that look like regexs",
				desc: "Selectors that look like regular expressions are slow and should be avoided.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("startrule", function(r) {
						for (var c = r.selectors, h, f, u, o, s, e = 0; e < c.length; e++)
							for (h = c[e],
							o = 0; o < h.parts.length; o++)
								if (f = h.parts[o],
								f.type === n.SELECTOR_PART_TYPE)
									for (s = 0; s < f.modifiers.length; s++)
										u = f.modifiers[s],
										u.type === "attribute" && /([\~\|\^\$\*]=)/.test(u) && t.report("Attribute selectors with " + RegExp.$1 + " are slow!", u.line, u.col, i)
					})
				}
			}),
			n.addRule({
				id: "rules-count",
				name: "Rules Count",
				desc: "Track how many rules there are.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = 0;
					n.addListener("startrule", function() {
						i++
					});
					n.addListener("endstylesheet", function() {
						t.stat("rule-count", i)
					})
				}
			}),
			n.addRule({
				id: "selector-max-approaching",
				name: "Warn when approaching the 4095 selector limit for IE",
				desc: "Will warn when selector count is >= 3800 selectors.",
				browsers: "IE",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = 0;
					n.addListener("startrule", function(n) {
						i += n.selectors.length
					});
					n.addListener("endstylesheet", function() {
						i >= 3800 && t.report("You have " + i + " selectors. Internet Explorer supports a maximum of 4095 selectors per stylesheet. Consider refactoring.", 0, 0, r)
					})
				}
			}),
			n.addRule({
				id: "selector-max",
				name: "Error when past the 4095 selector limit for IE",
				desc: "Will error when selector count is > 4095.",
				browsers: "IE",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = 0;
					n.addListener("startrule", function(n) {
						i += n.selectors.length
					});
					n.addListener("endstylesheet", function() {
						i > 4095 && t.report("You have " + i + " selectors. Internet Explorer supports a maximum of 4095 selectors per stylesheet. Consider refactoring.", 0, 0, r)
					})
				}
			}),
			n.addRule({
				id: "selector-newline",
				name: "Disallow new-line characters in selectors",
				desc: "New-line characters in selectors are usually a forgotten comma and not a descendant combinator.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					function r(n) {
						for (var f, u, e, o, s, a, v, h, y, c = n.selectors, r = 0, l = c.length; r < l; r++)
							for (f = c[r],
							u = 0,
							o = f.parts.length; u < o; u++)
								for (e = u + 1; e < o; e++)
									s = f.parts[u],
									a = f.parts[e],
									v = s.type,
									h = s.line,
									y = a.line,
									v === "descendant" && y > h && t.report("newline character found in selector (forgot a comma?)", h, c[r].parts[0].col, i)
					}
					var i = this;
					n.addListener("startrule", r)
				}
			}),
			n.addRule({
				id: "shorthand",
				name: "Require shorthand properties",
				desc: "Use shorthand properties where possible.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					function s() {
						f = {}
					}
					function h(n) {
						var r, u, o, e;
						for (r in i)
							if (i.hasOwnProperty(r)) {
								for (e = 0,
								u = 0,
								o = i[r].length; u < o; u++)
									e += f[i[r][u]] ? 1 : 0;
								e === i[r].length && t.report("The properties " + i[r].join(", ") + " can be replaced by " + r + ".", n.line, n.col, c)
							}
					}
					var c = this, r, u, e, o = {}, f, i = {
						margin: ["margin-top", "margin-bottom", "margin-left", "margin-right"],
						padding: ["padding-top", "padding-bottom", "padding-left", "padding-right"]
					};
					for (r in i)
						if (i.hasOwnProperty(r))
							for (u = 0,
							e = i[r].length; u < e; u++)
								o[i[r][u]] = r;
					n.addListener("startrule", s);
					n.addListener("startfontface", s);
					n.addListener("property", function(n) {
						var t = n.property.toString().toLowerCase();
						o[t] && (f[t] = 1)
					});
					n.addListener("endrule", h);
					n.addListener("endfontface", h)
				}
			}),
			n.addRule({
				id: "star-property-hack",
				name: "Disallow properties with a star prefix",
				desc: "Checks for the star property hack (targets IE6/7)",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("property", function(n) {
						var r = n.property;
						r.hack === "*" && t.report("Property with star prefix found.", n.property.line, n.property.col, i)
					})
				}
			}),
			n.addRule({
				id: "text-indent",
				name: "Disallow negative text-indent",
				desc: "Checks for text indent less than -99px",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					function u() {
						i = !1;
						r = "inherit"
					}
					function f() {
						i && r !== "ltr" && t.report("Negative text-indent doesn't work well with RTL. If you use text-indent for image replacement explicitly set direction for that item to ltr.", i.line, i.col, e)
					}
					var e = this, i, r;
					n.addListener("startrule", u);
					n.addListener("startfontface", u);
					n.addListener("property", function(n) {
						var t = n.property.toString().toLowerCase()
						, u = n.value;
						t === "text-indent" && u.parts[0].value < -99 ? i = n.property : t === "direction" && u.toString() === "ltr" && (r = "ltr")
					});
					n.addListener("endrule", f);
					n.addListener("endfontface", f)
				}
			}),
			n.addRule({
				id: "underscore-property-hack",
				name: "Disallow properties with an underscore prefix",
				desc: "Checks for the underscore property hack (targets IE6)",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("property", function(n) {
						var r = n.property;
						r.hack === "_" && t.report("Property with underscore prefix found.", n.property.line, n.property.col, i)
					})
				}
			}),
			n.addRule({
				id: "unique-headings",
				name: "Headings should only be defined once",
				desc: "Headings should be defined only once.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var r = this
					, i = {
						h1: 0,
						h2: 0,
						h3: 0,
						h4: 0,
						h5: 0,
						h6: 0
					};
					n.addListener("startrule", function(n) {
						for (var s = n.selectors, o, u, h, e, f = 0; f < s.length; f++)
							if (o = s[f],
							u = o.parts[o.parts.length - 1],
							u.elementName && /(h[1-6])/i.test(u.elementName.toString())) {
								for (e = 0; e < u.modifiers.length; e++)
									if (u.modifiers[e].type === "pseudo") {
										h = !0;
										break
									}
								h || (i[RegExp.$1]++,
								i[RegExp.$1] > 1 && t.report("Heading (" + u.elementName + ") has already been defined.", u.line, u.col, r))
							}
					});
					n.addListener("endstylesheet", function() {
						var n, u = [];
						for (n in i)
							i.hasOwnProperty(n) && i[n] > 1 && u.push(i[n] + " " + n + "s");
						u.length && t.rollupWarn("You have " + u.join(", ") + " defined in this stylesheet.", r)
					})
				}
			}),
			n.addRule({
				id: "universal-selector",
				name: "Disallow universal selector",
				desc: "The universal selector (*) is known to be slow.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("startrule", function(n) {
						for (var e = n.selectors, f, r, u = 0; u < e.length; u++)
							f = e[u],
							r = f.parts[f.parts.length - 1],
							r.elementName === "*" && t.report(i.desc, r.line, r.col, i)
					})
				}
			}),
			n.addRule({
				id: "unqualified-attributes",
				name: "Disallow unqualified attribute selectors",
				desc: "Unqualified attribute selectors are known to be slow.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("startrule", function(r) {
						for (var s = r.selectors, o, u, h, e, f = 0; f < s.length; f++)
							if (o = s[f],
							u = o.parts[o.parts.length - 1],
							u.type === n.SELECTOR_PART_TYPE)
								for (e = 0; e < u.modifiers.length; e++)
									h = u.modifiers[e],
									h.type !== "attribute" || u.elementName && u.elementName !== "*" || t.report(i.desc, u.line, u.col, i)
					})
				}
			}),
			n.addRule({
				id: "vendor-prefix",
				name: "Require standard property with vendor prefix",
				desc: "When using a vendor-prefixed property, make sure to include the standard one.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					function r() {
						i = {};
						e = 1
					}
					function u() {
						var e, r, h, u, n, s = [];
						for (e in i)
							o[e] && s.push({
								actual: e,
								needed: o[e]
							});
						for (r = 0,
						h = s.length; r < h; r++)
							u = s[r].needed,
							n = s[r].actual,
							i[u] ? i[u][0].pos < i[n][0].pos && t.report("Standard property '" + u + "' should come after vendor-prefixed property '" + n + "'.", i[n][0].name.line, i[n][0].name.col, f) : t.report("Missing standard property '" + u + "' to go along with '" + n + "'.", i[n][0].name.line, i[n][0].name.col, f)
					}
					var f = this, i, e, o = {
						"-webkit-border-radius": "border-radius",
						"-webkit-border-top-left-radius": "border-top-left-radius",
						"-webkit-border-top-right-radius": "border-top-right-radius",
						"-webkit-border-bottom-left-radius": "border-bottom-left-radius",
						"-webkit-border-bottom-right-radius": "border-bottom-right-radius",
						"-o-border-radius": "border-radius",
						"-o-border-top-left-radius": "border-top-left-radius",
						"-o-border-top-right-radius": "border-top-right-radius",
						"-o-border-bottom-left-radius": "border-bottom-left-radius",
						"-o-border-bottom-right-radius": "border-bottom-right-radius",
						"-moz-border-radius": "border-radius",
						"-moz-border-radius-topleft": "border-top-left-radius",
						"-moz-border-radius-topright": "border-top-right-radius",
						"-moz-border-radius-bottomleft": "border-bottom-left-radius",
						"-moz-border-radius-bottomright": "border-bottom-right-radius",
						"-moz-column-count": "column-count",
						"-webkit-column-count": "column-count",
						"-moz-column-gap": "column-gap",
						"-webkit-column-gap": "column-gap",
						"-moz-column-rule": "column-rule",
						"-webkit-column-rule": "column-rule",
						"-moz-column-rule-style": "column-rule-style",
						"-webkit-column-rule-style": "column-rule-style",
						"-moz-column-rule-color": "column-rule-color",
						"-webkit-column-rule-color": "column-rule-color",
						"-moz-column-rule-width": "column-rule-width",
						"-webkit-column-rule-width": "column-rule-width",
						"-moz-column-width": "column-width",
						"-webkit-column-width": "column-width",
						"-webkit-column-span": "column-span",
						"-webkit-columns": "columns",
						"-moz-box-shadow": "box-shadow",
						"-webkit-box-shadow": "box-shadow",
						"-moz-transform": "transform",
						"-webkit-transform": "transform",
						"-o-transform": "transform",
						"-ms-transform": "transform",
						"-moz-transform-origin": "transform-origin",
						"-webkit-transform-origin": "transform-origin",
						"-o-transform-origin": "transform-origin",
						"-ms-transform-origin": "transform-origin",
						"-moz-box-sizing": "box-sizing",
						"-webkit-box-sizing": "box-sizing"
					};
					n.addListener("startrule", r);
					n.addListener("startfontface", r);
					n.addListener("startpage", r);
					n.addListener("startpagemargin", r);
					n.addListener("startkeyframerule", r);
					n.addListener("startviewport", r);
					n.addListener("property", function(n) {
						var t = n.property.text.toLowerCase();
						i[t] || (i[t] = []);
						i[t].push({
							name: n.property,
							value: n.value,
							pos: e++
						})
					});
					n.addListener("endrule", u);
					n.addListener("endfontface", u);
					n.addListener("endpage", u);
					n.addListener("endpagemargin", u);
					n.addListener("endkeyframerule", u);
					n.addListener("endviewport", u)
				}
			}),
			n.addRule({
				id: "zero-units",
				name: "Disallow units for 0 values",
				desc: "You don't need to specify units when a value is 0.",
				browsers: "All",
				init: function(n, t) {
					"use strict";
					var i = this;
					n.addListener("property", function(n) {
						for (var u = n.value.parts, r = 0, f = u.length; r < f; )
							(u[r].units || u[r].type === "percentage") && u[r].value === 0 && u[r].type !== "time" && t.report("Values of 0 shouldn't have units specified.", u[r].line, u[r].col, i),
							r++
					})
				}
			}),
			function() {
				"use strict";
				var t = function(n) {
					return !n || n.constructor !== String ? "" : n.replace(/[\"&><]/g, function(n) {
						switch (n) {
						case '"':
							return "&quot;";
						case "&":
							return "&amp;";
						case "<":
							return "&lt;";
						case ">":
							return "&gt;"
						}
					})
				}
				;
				n.addFormatter({
					id: "checkstyle-xml",
					name: "Checkstyle XML format",
					startFormat: function() {
						return '<?xml version="1.0" encoding="utf-8"?><checkstyle>'
					},
					endFormat: function() {
						return "<\/checkstyle>"
					},
					readError: function(n, i) {
						return '<file name="' + t(n) + '"><error line="0" column="0" severty="error" message="' + t(i) + '"><\/error><\/file>'
					},
					formatResults: function(i, r) {
						var f = i.messages
						, u = []
						, e = function(n) {
							return !n || !("name" in n) ? "" : "net.csslint." + n.name.replace(/\s/g, "")
						}
						;
						return f.length > 0 && (u.push('<file name="' + r + '">'),
						n.Util.forEach(f, function(n) {
							n.rollup || u.push('<error line="' + n.line + '" column="' + n.col + '" severity="' + n.type + '" message="' + t(n.message) + '" source="' + e(n.rule) + '"/>')
						}),
						u.push("<\/file>")),
						u.join("")
					}
				})
			}(),
			n.addFormatter({
				id: "compact",
				name: "Compact, 'porcelain' format",
				startFormat: function() {
					"use strict";
					return ""
				},
				endFormat: function() {
					"use strict";
					return ""
				},
				formatResults: function(t, i, r) {
					"use strict";
					var e = t.messages, u = "", f;
					return (r = r || {},
					f = function(n) {
						return n.charAt(0).toUpperCase() + n.slice(1)
					}
					,
					e.length === 0) ? r.quiet ? "" : i + ": Lint Free!" : (n.Util.forEach(e, function(n) {
						u += n.rollup ? i + ": " + f(n.type) + " - " + n.message + "\n" : i + ": line " + n.line + ", col " + n.col + ", " + f(n.type) + " - " + n.message + " (" + n.rule.id + ")\n"
					}),
					u)
				}
			}),
			n.addFormatter({
				id: "csslint-xml",
				name: "CSSLint XML format",
				startFormat: function() {
					"use strict";
					return '<?xml version="1.0" encoding="utf-8"?><csslint>'
				},
				endFormat: function() {
					"use strict";
					return "<\/csslint>"
				},
				formatResults: function(t, i) {
					"use strict";
					var f = t.messages
					, r = []
					, u = function(n) {
						return !n || n.constructor !== String ? "" : n.replace(/\"/g, "'").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
					}
					;
					return f.length > 0 && (r.push('<file name="' + i + '">'),
					n.Util.forEach(f, function(n) {
						n.rollup ? r.push('<issue severity="' + n.type + '" reason="' + u(n.message) + '" evidence="' + u(n.evidence) + '"/>') : r.push('<issue line="' + n.line + '" char="' + n.col + '" severity="' + n.type + '" reason="' + u(n.message) + '" evidence="' + u(n.evidence) + '"/>')
					}),
					r.push("<\/file>")),
					r.join("")
				}
			}),
			n.addFormatter({
				id: "junit-xml",
				name: "JUNIT XML format",
				startFormat: function() {
					"use strict";
					return '<?xml version="1.0" encoding="utf-8"?><testsuites>'
				},
				endFormat: function() {
					"use strict";
					return "<\/testsuites>"
				},
				formatResults: function(n, t) {
					"use strict";
					var r = n.messages
					, i = []
					, u = {
						error: 0,
						failure: 0
					}
					, e = function(n) {
						return !n || !("name" in n) ? "" : "net.csslint." + n.name.replace(/\s/g, "")
					}
					, f = function(n) {
						return !n || n.constructor !== String ? "" : n.replace(/\"/g, "'").replace(/</g, "&lt;").replace(/>/g, "&gt;")
					}
					;
					return r.length > 0 && (r.forEach(function(n) {
						var t = n.type === "warning" ? "error" : n.type;
						n.rollup || (i.push('<testcase time="0" name="' + e(n.rule) + '">'),
						i.push("<" + t + ' message="' + f(n.message) + '"><![CDATA[' + n.line + ":" + n.col + ":" + f(n.evidence) + "]\]><\/" + t + ">"),
						i.push("<\/testcase>"),
						u[t] += 1)
					}),
					i.unshift('<testsuite time="0" tests="' + r.length + '" skipped="0" errors="' + u.error + '" failures="' + u.failure + '" package="net.csslint" name="' + t + '">'),
					i.push("<\/testsuite>")),
					i.join("")
				}
			}),
			n.addFormatter({
				id: "lint-xml",
				name: "Lint XML format",
				startFormat: function() {
					"use strict";
					return '<?xml version="1.0" encoding="utf-8"?><lint>'
				},
				endFormat: function() {
					"use strict";
					return "<\/lint>"
				},
				formatResults: function(t, i) {
					"use strict";
					var f = t.messages
					, r = []
					, u = function(n) {
						return !n || n.constructor !== String ? "" : n.replace(/\"/g, "'").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
					}
					;
					return f.length > 0 && (r.push('<file name="' + i + '">'),
					n.Util.forEach(f, function(n) {
						n.rollup ? r.push('<issue severity="' + n.type + '" reason="' + u(n.message) + '" evidence="' + u(n.evidence) + '"/>') : r.push('<issue line="' + n.line + '" char="' + n.col + '" severity="' + n.type + '" reason="' + u(n.message) + '" evidence="' + u(n.evidence) + '"/>')
					}),
					r.push("<\/file>")),
					r.join("")
				}
			}),
			n.addFormatter({
				id: "text",
				name: "Plain Text",
				startFormat: function() {
					"use strict";
					return ""
				},
				endFormat: function() {
					"use strict";
					return ""
				},
				formatResults: function(t, i, r) {
					"use strict";
					var e = t.messages, u = "", f, o;
					return (r = r || {},
					e.length === 0) ? r.quiet ? "" : "\n\ncsslint: No errors in " + i + "." : (u = "\n\ncsslint: There ",
					u += e.length === 1 ? "is 1 problem" : "are " + e.length + " problems",
					u += " in " + i + ".",
					f = i.lastIndexOf("/"),
					o = i,
					f === -1 && (f = i.lastIndexOf("\\")),
					f > -1 && (o = i.substring(f + 1)),
					n.Util.forEach(e, function(n, t) {
						u = u + "\n\n" + o;
						n.rollup ? (u += "\n" + (t + 1) + ": " + n.type,
						u += "\n" + n.message) : (u += "\n" + (t + 1) + ": " + n.type + " at line " + n.line + ", col " + n.col,
						u += "\n" + n.message,
						u += "\n" + n.evidence)
					}),
					u)
				}
			}),
			n
		}();
}.apply(window));