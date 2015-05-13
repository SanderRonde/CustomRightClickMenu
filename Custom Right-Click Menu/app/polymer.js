/*Majorly stripped from originals, license below*/
/*
Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

function ripplestuff(element, e, circleornot) {

	var elem = element;

	(function () {

		var cancelled = false;
		var waveMaxRadius;
		if (circleornot) {
			if ($(element).parent().attr("class") === "addmemes" || $(element).parent().attr("class") === "acceptupload" || $(element).parent().attr("class") === "declineupload" || $(element).parent().attr("class") === "fab") {
				waveMaxRadius = 19;
			}
			else {
				waveMaxRadius = 15;
			}
		}
		else {
			waveMaxRadius = 520;
		}

		//
		// INK EQUATIONS
		//
		function waveRadiusFn(touchDownMs, touchUpMs, anim) {
			// Convert from ms to s
			var touchDown = touchDownMs / 500;
			var touchUp = touchUpMs / 500;
			var totalElapsed = touchDown + touchUp;
			var ww = anim.width, hh = anim.height;
			// use diagonal size of container to avoid floating point math sadness
			var waveRadius = Math.min(Math.sqrt(ww * ww + hh * hh), waveMaxRadius) * 1.1 + 5;
			var duration = 1.1 - .2 * (waveRadius / waveMaxRadius);
			var tt = (totalElapsed / duration);

			var size = waveRadius * (1 - Math.pow(80, -tt));
			return Math.abs(size);
		}

		function waveOpacityFn(td, tu, anim) {
			// Convert from ms to s.
			var touchUp = tu / 1000;

			if (tu <= 0) {  // before touch up
				return anim.initialOpacity;
			}
			return Math.max(0, anim.initialOpacity - touchUp * anim.opacityDecayVelocity);
		}

		function waveOuterOpacityFn(td, tu, anim) {
			// Convert from ms to s.
			var touchDown = td / 1000;

			// Linear increase in background opacity, capped at the opacity
			// of the wavefront (waveOpacity).
			var outerOpacity = touchDown * 0.3;
			var waveOpacity = waveOpacityFn(td, tu, anim);
			return Math.max(0, Math.min(outerOpacity, waveOpacity));
		}

		// Determines whether the wave should be completely removed.
		function waveDidFinish(wave, radius, anim) {
			var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);

			// If the wave opacity is 0 and the radius exceeds the bounds
			// of the element, then this is finished.
			return waveOpacity < 0.01 && radius >= Math.min(wave.maxRadius, waveMaxRadius);
		};

		function waveAtMaximum(wave, radius, anim) {
			var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);

			return waveOpacity >= anim.initialOpacity && radius >= Math.min(wave.maxRadius, waveMaxRadius);
		}

		//
		// DRAWING
		//
		function drawRipple(ctx, x, y, radius, innerAlpha, outerAlpha) {
			// Only animate opacity and transform
			if (outerAlpha !== undefined) {
				ctx.bg.style.opacity = outerAlpha;
			}
			ctx.wave.style.opacity = innerAlpha;

			var s = radius / (ctx.containerSize / 2);
			var dx = x - (ctx.containerWidth / 2);
			var dy = y - (ctx.containerHeight / 2);

			ctx.wc.style.webkitTransform = "translate3d(" + dx + "px," + dy + "px,0)";
			ctx.wc.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";

			// 2d transform for safari because of border-radius and overflow:hidden clipping bug.
			// https://bugs.webkit.org/show_bug.cgi?id=98538
			ctx.wave.style.webkitTransform = "scale(" + s + "," + s + ")";
			ctx.wave.style.transform = "scale3d(" + s + "," + s + ",1)";
		}

		//
		// SETUP
		//
		function createWave(elem) {
			var elementStyle = window.getComputedStyle(elem);
			var fgColor = elementStyle.color;

			var inner = document.createElement("div");
			inner.style.backgroundColor = fgColor;
			inner.classList.add("wave");

			var outer = document.createElement("div");
			outer.classList.add("wave-container");
			outer.appendChild(inner);

			var container = $(elem).children(".waves")[0];
			container.appendChild(outer);

			$(elem).children(".bg").css("background-color", fgColor);

			var wave = {
				bg: $(elem).children(".bg")[0],
				wc: outer,
				wave: inner,
				waveColor: fgColor,
				maxRadius: 0,
				isMouseDown: false,
				mouseDownStart: 0.0,
				mouseUpStart: 0.0,
				tDown: 0,
				tUp: 0
			};
			return wave;
		}

		function removeWaveFromScope(scope, wave) {
			if (scope.waves) {
				var pos = scope.waves.indexOf(wave);
				scope.waves.splice(pos, 1);
				// FIXME cache nodes
				wave.wc.remove();
			}
		};

		// Shortcuts.
		var pow = Math.pow;
		var now = Date.now;
		if (window.performance && performance.now) {
			now = performance.now.bind(performance);
		}

		function cssColorWithAlpha(cssColor, alpha) {
			var parts = cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			if (typeof alpha == "undefined") {
				alpha = 1;
			}
			if (!parts) {
				return "rgba(255, 255, 255, " + alpha + ")";
			}
			return "rgba(" + parts[1] + ", " + parts[2] + ", " + parts[3] + ", " + alpha + ")";
		}

		function dist(p1, p2) {
			return Math.sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
		}

		function distanceFromPointToFurthestCorner(point, size) {
			var tlD = dist(point, { x: 0, y: 0 });
			var trD = dist(point, { x: size.w, y: 0 });
			var blD = dist(point, { x: 0, y: size.h });
			var brD = dist(point, { x: size.w, y: size.h });
			return Math.max(tlD, trD, blD, brD);
		}

		var obj = {

			/**
			 * The initial opacity set on the wave.
			 *
			 * @attribute initialOpacity
			 * @type number
			 * @default 0.25
			 */
			initialOpacity: 0.25,

			/**
			 * How fast (opacity per second) the wave fades out.
			 *
			 * @attribute opacityDecayVelocity
			 * @type number
			 * @default 0.8
			 */
			opacityDecayVelocity: 0.8,

			backgroundFill: true,
			pixelDensity: 2,

			eventDelegates: {
				down: "downAction",
				up: "upAction"
			},

			waves: [],

			ready: function () {
				this.waves = [];
			},

			downAction: function (e) {
				var wave = createWave(elem);

				cancelled = false;
				wave.isMouseDown = true;
				wave.tDown = 0.0;
				wave.tUp = 0.0;
				wave.mouseUpStart = 0.0;
				wave.mouseDownStart = now();

				var rect = elem.getBoundingClientRect();
				var width = rect.width;
				var height = rect.height;
				var touchX = e.pageX - rect.left;
				var touchY = e.pageY - rect.top;

				wave.startPosition = { x: touchX, y: touchY };

				if (elem.classList.contains("recenteringTouch")) {
					wave.endPosition = { x: width / 2, y: height / 2 };
					wave.slideDistance = dist(wave.startPosition, wave.endPosition);
				}
				wave.containerSize = Math.max(width, height);
				wave.containerWidth = width;
				wave.containerHeight = height;
				wave.maxRadius = distanceFromPointToFurthestCorner(wave.startPosition, { w: width, h: height });

				// The wave is circular so constrain its container to 1:1
				wave.wc.style.top = (wave.containerHeight - wave.containerSize) / 2 + "px";
				wave.wc.style.left = (wave.containerWidth - wave.containerSize) / 2 + "px";
				wave.wc.style.width = wave.containerSize + "px";
				wave.wc.style.height = wave.containerSize + "px";

				$(wave.wc).animate({
					opacity: 0
				}, 1000, function () {

					$(this).remove();

				});

				this.waves.push(wave);

				if (!this._loop) {
					this._loop = this.animate.bind(this, {
						width: width / 2,
						height: height / 2
					});
					requestAnimationFrame(this._loop);
				}
				// else there is already a rAF
			},

			cancel: function () {
				cancelled = true;
			},

			animate: function (ctx) {
				var shouldRenderNextFrame = false;

				var deleteTheseWaves = [];
				// The oldest wave's touch down duration
				var longestTouchDownDuration = 0;
				var longestTouchUpDuration = 0;
				// Save the last known wave color
				var lastWaveColor = null;
				// wave animation values
				var anim = {
					initialOpacity: this.initialOpacity,
					opacityDecayVelocity: this.opacityDecayVelocity,
					height: ctx.height,
					width: ctx.width
				}
				var i;
				var wave;
				for (i = 0; i < this.waves.length; i++) {
					wave = this.waves[i];
					if (wave.mouseDownStart > 0) {
						wave.tDown = now() - wave.mouseDownStart;
					}
					if (wave.mouseUpStart > 0) {
						wave.tUp = now() - wave.mouseUpStart;
					}

					// Determine how long the touch has been up or down.
					var tUp = wave.tUp;
					var tDown = wave.tDown;
					longestTouchDownDuration = Math.max(longestTouchDownDuration, tDown);
					longestTouchUpDuration = Math.max(longestTouchUpDuration, tUp);

					// Obtain the instantenous size and alpha of the ripple.
					var radius = waveRadiusFn(tDown, tUp, anim);
					var waveAlpha = waveOpacityFn(tDown, tUp, anim);
					lastWaveColor = wave.waveColor;

					// Position of the ripple.
					var x = wave.startPosition.x;
					var y = wave.startPosition.y;

					// Ripple gravitational pull to the center of the canvas.
					if (wave.endPosition) {

						// This translates from the origin to the center of the view  based on the max dimension of
						var translateFraction = Math.min(1, radius / wave.containerSize * 2 / Math.sqrt(2));

						x += translateFraction * (wave.endPosition.x - wave.startPosition.x);
						y += translateFraction * (wave.endPosition.y - wave.startPosition.y);
					}

					// If we do a background fill fade too, work out the correct color.
					var bgFillColor = null;
					var bgFillAlpha;
					if (elem.backgroundFill) {
						bgFillAlpha = waveOuterOpacityFn(tDown, tUp, anim);
						bgFillColor = cssColorWithAlpha(wave.waveColor, bgFillAlpha);
					}

					// Draw the ripple.
					drawRipple(wave, x, y, radius, waveAlpha, bgFillAlpha);

					// Determine whether there is any more rendering to be done.
					var maximumWave = waveAtMaximum(wave, radius, anim);
					var waveDissipated = waveDidFinish(wave, radius, anim);
					var shouldKeepWave = !waveDissipated || maximumWave;
					// keep rendering dissipating wave when at maximum radius on upAction
					var shouldRenderWaveAgain = wave.mouseUpStart ? !waveDissipated : !maximumWave;
					shouldRenderNextFrame = shouldRenderNextFrame || shouldRenderWaveAgain;
					if (!shouldKeepWave || cancelled) {
						deleteTheseWaves.push(wave);
					}
				}

				if (shouldRenderNextFrame) {
					requestAnimationFrame(this._loop);
				}

				for (i = 0; i < deleteTheseWaves.length; ++i) {
					wave = deleteTheseWaves[i];
					removeWaveFromScope(this, wave);
				}

				if (!this.waves.length && this._loop) {
					// clear the background color
					$(elem).children(".bg").css("background-color", null);
					this._loop = null;
				}
			}

		};

		obj.ready();
		obj.downAction(e);

	})();

}

var callbacks = [];
var els = [];

function addcallbacktoslider(sliderelement, func) {

	callbacks[callbacks.length] = func;
	els[els.length] = sliderelement;

}

function changeInputTo(papersliderel, val) {

	for (var i = 0; i < callbacks.length; i++) {
		if (els[i] === papersliderel) {
			callbacks[i](val);
		}
	}
	var val2;
	if ($(this).attr("percentage")) {
		val2 = val + "%";
	}
	else {
		val2 = val;
	}

	$(papersliderel)
		.attr("value", val)
		.children("paper-input")
		.children("paper-input-decorator")
		.children("input")
		.attr("value", val2);

}

function switchKnobToPos(papersliderel, newpos, animate) {

	var widthToVal = parseInt($(papersliderel).attr("max"), 10) / (parseInt($(papersliderel).css("width"), 10) - 70);

	//Work out new value
	var newval = newpos * widthToVal;

	//Round new value to nearest whole number
	newval = Math.round(newval);

	if (newval > parseInt($(papersliderel).attr("max"), 10)) {

		changeToValue(papersliderel, parseInt($(papersliderel).attr("max"), 10), animate);

	}
	else if (newval < 0) {

		changeToValue(papersliderel, 0, animate);

	}
	else {

		changeToValue(papersliderel, newval, animate);

	}

}

function changeToValue(papersliderel, val, animate) {

	if (val > parseInt($(papersliderel).attr("max"), 10)) {
		val = parseInt($(papersliderel).attr("max"), 10);
	}
	else if (val < 0) {
		val = 0;
	}

	var widthToVal = parseInt($(papersliderel).attr("max"), 10) / (parseInt($(papersliderel).css("width"), 10) - 70);

	changeInputTo(papersliderel, Math.round(val));

	if (animate) {


		$(papersliderel)
			.children(".sliderContainer")
			.children(".bar-container")
			.children("paper-progress")
			.children(".progressContainer")
			.children(".progress")
			.animate({
				width: val / widthToVal
			}, 20);

		$(papersliderel)
			.children(".sliderContainer")
			.children(".sliderKnob")
			.animate({
				left: val / widthToVal
			}, 20);

	}
	else {

		$(papersliderel)
			.children(".sliderContainer")
			.children(".bar-container")
			.children("paper-progress")
			.children(".progressContainer")
			.children(".progress")
			.css("width", val / widthToVal);

		$(papersliderel)
			.children(".sliderContainer")
			.children(".sliderKnob")
			.css("left", val / widthToVal);

	}

}

function updateslider(slider) {
	changeToValue(slider[0], slider.attr("value"), false);
}

$("body").mousemove(function (e) {

	$("paper-slider").each(function () {

		if ($(this).attr("dragging") === "true") {

			var newpos = e.clientX;
			if (newpos > this.getBoundingClientRect().left + (parseInt($(this).css("width"), 10) - 70)) {

				changeToValue(this, parseInt($(this).attr("max"), 10));

			}
			else if (newpos < this.getBoundingClientRect().left) {

				changeToValue(this, 0);

			}
			else {

				switchKnobToPos(this, e.clientX - $(this).children(".sliderContainer").children(".bar-container")[0].getBoundingClientRect().left, false);

			}

		}

	});

})
.mouseup(function () {

	$(".sliderKnob").each(function () {

		$(this)
			.children(".sliderKnobInner")
			.animate({
				width: "12px",
				height: "12px"
			}, 100);

	});

	$("paper-slider").each(function () {

		$(this).attr("dragging", false);

		if ($(this).attr("value") !== "-1") {

			//Switch the knob to the closest position
			changeToValue(this, Math.round(parseInt($(this).attr("value"), 10)), false);

		}

	});

})
.click(function () {

	$("paper-input").each(function () {

		var focusedUnderline = $(this).children("paper-input-decorator").children(".underline").children(".focusedUnderline");

		if (focusedUnderline.css("width") !== "0px" && focusedUnderline.css("width") !== "0" && focusedUnderline.css("width") !== 0) {
			focusedUnderline.stop().animate({
				width: "0px"
			}, 300);
		}

	});

});

function paperButtonMousedown(e) {
	/// <summary>
	/// The onclick for the paper-button
	/// </summary>
	/// <param name="e">Mouse-down-event</param>
	$(this).children("paper-ripple").each(function () {
		ripplestuff(this, e, false);
	});
}

function paperCheckboxMousedown() {
	/// <summary>
	/// The onmousedown handler for the paper-checkbox
	/// </summary>
	if ($(this).attr("on") === "true") {
		$(this)
			.children(".checkboxContainer")
			.children("paper-ripple")
			.css("color", "#5a5f5a");
		$(this)
			.children(".checkboxcontainer")
			.children(".checkbox")
			.animate({
				backgroundColor: "rgba(0,0,0,0)",
				borderColor: "#5a5a5a"
			}, 50);
		$(this)
			.children(".checkboxcontainer")
			.children(".checkbox")
			.children(".checkmark")
			.css("display", "none");
		$(this).attr("on", "false");
	}
	else {
		$(this)
			.children(".checkboxContainer")
			.children("paper-ripple")
			.css("color", "#B2DFDB");
		$(this)
			.children(".checkboxcontainer")
			.children(".checkbox")
			.animate({
				backgroundColor: "#009688",
				borderColor: "#009688"
			}, 50);
		$(this)
			.children(".checkboxcontainer")
			.children(".checkbox")
			.children(".checkmark")
			.css("display", "block")
			.css("-webkit-animation", "checkmark-expand 140ms ease-out forwards");
		$(this).attr("on", "true");
	}

	ripplestuff($(this).children(".checkboxcontainer").children("paper-ripple")[0], "", true);
}

function sliderKnobMousedown() {
	/// <summary>
	/// The mousedown handler for the slider-knob
	/// </summary>
	$(this).parent().parent().attr("dragging", true);
	$(this)
		.children(".sliderKnobInner")
		.animate({
			width: "32px",
			height: "32px"
		}, 100);
}

function barContainerMousedown() {
	/// <summary>
	/// The mousedown handler for the bar-container
	/// </summary>
	$(this).attr("mousedown", "true");
	var elem = this;
	setTimeout(function () {

		if ($(elem).attr("mousedown") === "true") {

			$(elem).parent().parent().attr("dragging", true);
			$(elem)
				.parent()
				.children(".sliderKnob")
				.children(".sliderKnobInner")
				.animate({
					width: "32px",
					height: "32px"
				}, 100);

		}

	}, 20);

	var left = $(this)[0].getBoundingClientRect().left;

	//Off the knob
	//Switch knob to that position
	switchKnobToPos($(this).parent().parent()[0], (e.clientX - left), true);
}

function barContainerMouseUp() {
	/// <summary>
	/// The mouse-up event handler for the bar-container element
	/// </summary>
	$(this).attr("mousedown", "false");
}

function paperInputDecoratorOnFocus(element) {
	/// <summary>
	/// The onfocus handler for the paper-input-decorator element
	/// </summary>
	var elem;
	if (element !== undefined) {
		elem = element;
	}
	else {
		elem = this;
	}
	$(elem)
		.children(".underline")
		.children(".focusedUnderline")
		.animate({
			width: $(this).parent().width()
		}, 50);

}

function paperInputDecoratorOnBlur(element) {
	/// <summary>
	/// The onBlur handler for the paper-input-decorator element
	/// </summary>
	var elem;
	if (element !== undefined) {
		elem = element;
	}
	else {
		elem = this;
	}
	$(elem)
		.children(".underline")
		.children(".focusedUnderline")
		.animate({
			width: 0
		}, 50);

}

function paperInputDecoratorOnKeypress(e) {
	/// <summary>
	/// The onkeypress handler for the paper-input-decorator element
	/// </summary>
	/// <param name="e">Keypress Event</param>
	if (e.which === 40 || e.which === 37) {
		changeToValue($(this).parent().parent()[0], $(this).parent().parent().attr("value") - 1);
	}
	else if (e.which === 38 || e.which === 39) {
		changeToValue(parseInt($(this).parent().parent()[0], $(this).parent().parent().attr("value"), 10) + 1);
	}
}

function paperInputOnclick(e) {
	/// <summary>
	/// The onclick handler for the paper-input element
	/// </summary>
	/// <param name="e">The click event</param>
	if (!$(this).attr("disabled")) {
		e.stopPropagation();

		var focusedUnderline = $(this).children("paper-input-decorator").children(".underline").children(".focusedUnderline");
		var input = $(this).children("paper-input-decorator").children(".actualinput");

		input.focus();
		focusedUnderline.animate({
			width: focusedUnderline.parent().children(".unfocused-underline").css("width")
		}, 300);

		var elem = this;
		$("paper-input").each(function() {
			if (this !== elem) {
				var focusedUnderline = $(this).children("paper-input-decorator").children(".underline").children(".focusedUnderline");
				focusedUnderline.animate({
					width: "0px"
				}, 300);
			}
		});
	}
}

function generalInputFocusHandler(elem) {
	if (!$(elem).attr("disabled")) {
		var focusedUnderline = $(elem).children("paper-input-decorator").children(".underline").children(".focusedUnderline");

		focusedUnderline.stop().animate({
			width: focusedUnderline.parent().children(".unfocused-underline").css("width")
		}, 300);

		$("paper-input").each(function () {
			if (this !== elem[0]) {
				var underline = $(this).children("paper-input-decorator").children(".underline").children(".focusedUnderline");
				underline.stop().animate({
					width: "0px"
				}, 300);
			}
		});
	}
}

function inputFocus() {
	var elem = $(this).parent().parent();
	generalInputFocusHandler(elem);
}

function stopEventPropagation(e) {
	e.stopPropagation();
}

function handlePaperInputClick(e) {
	stopEventPropagation(e);
	$(this).find(".actualinput").focus();
}

function removeBinds(container) {
	/// <summary>
	/// Removes all previous onclicks, onmousedowns etc from paper-elements
	/// </summary>
	container.find("paper-button")
		.off("mousedown", paperButtonMousedown);
	container.find("paper-checkbox")
		.off("mousedown", paperCheckboxMousedown);
	container.find(".sliderKnob")
		.off("mousedown", sliderKnobMousedown);
	container.find(".bar-cofftainer")
		.off("mousedown", barContainerMousedown)
		.off("mouseup", barContainerMouseUp);
	container.find("paper-input-decorator")
		.off("focus", paperInputDecoratorOnFocus)
		.off("blur", paperInputDecoratorOnBlur)
		.off("keypress", paperInputDecoratorOnKeypress);
	container.find("paper-input[disabled]")
		.css("cursor", "default")
		.children("paper-input-decorator")
		.css("cursor", "default")
		.children("input")
		.css("cursor", "default");
	container.find(".actualinput")
		.off("focus", inputFocus);
	container.find("paper-input")
		.off("click", handlePaperInputClick);
}

function bindPaperEls(container) {
	/// <summary>
	/// Binds all paper-elements
	/// </summary>
	container.find("paper-button")
		.on("mousedown", paperButtonMousedown)
		.on("mousedown", "e", paperButtonMousedown);
	container.find("paper-checkbox")
		.on("mousedown", paperCheckboxMousedown)
		.each(function () {
			if ($(this).attr("on") === "true") {
				if ($(this).children(".checkboxContainer").children("paper-ripple").css("color") !== "#B2DFDB") {
					$(this)
						.children(".checkboxContainer")
						.children("paper-ripple")
						.css("color", "#B2DFDB");
					$(this)
						.children(".checkboxcontainer")
						.children(".checkbox")
						.animate({
							backgroundColor: "#009688",
							borderColor: "#009688"
						}, 50);
					$(this)
						.children(".checkboxcontainer")
						.children(".checkbox")
						.children(".checkmark")
						.css("display", "block")
						.css("-webkit-animation", "checkmark-expand 140ms ease-out forwards");
				}
			}
		});
	container.find(".sliderKnob")
		.on("mousedown", sliderKnobMousedown);
	container.find(".bar-container")
		.each(function () {

			var paperslider = $(this).parent().parent()[0];
			if ($(paperslider).attr("value") != undefined) {
				var val = parseInt($(paperslider).attr("value"), 10);
				changeToValue(paperslider, val);
			}

		})
		.on("mousedown", barContainerMousedown)
		.on("mouseup", barContainerMouseUp);
	container.find("paper-input-decorator")
		.on("focus", paperInputDecoratorOnFocus)
		.on("blur", paperInputDecoratorOnBlur)
		.on("keypress", paperInputDecoratorOnKeypress);
	container.find("paper-slider")
		.each(function () {
			if (!$(this).attr("value") || $(this).attr("value") === "NaN") {
				$(this).attr("value", (parseInt($(this).attr("min"), 10) + parseInt($(this).attr("max"), 10)) / 2);
			}
			//Initialize
			updateslider($(this));
		});
	container.find(".actualinput")
		.on("focus", inputFocus);
	container.find("paper-input")
		.each(function () {
			$(this).find(".actualinput").attr("value", $(this).parent().attr("value"));
		})
		.on("click", handlePaperInputClick);

	container.find("multiline-paper-input")
		.on("click", paperInputOnclick);

	container.find("multiline-paper-input textarea")
		.on("focus", function() {
			paperInputDecoratorOnFocus($(this).parent()[0]);
		})
		.on("blur", function() {
			paperInputDecoratorOnBlur($(this).parent()[0]);
		});
}

function bindstuff(container) {
	/// <summary>
	/// Binds all onclicks for sliderKnobs, bar-containers, paper-input-decorators, papersliders, paper-buttons, paper-checkboxes and paper-inputs (and removes previous if nessecary)
	/// </summary>

	if (container === undefined) {
		container = $("body");
	}
	removeBinds(container);
	bindPaperEls(container);
}