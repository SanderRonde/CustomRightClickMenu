'use strict';

Polymer({
	is: 'crm-edit-page',

	behaviors: [Polymer.NeonAnimationRunnerBehavior],

	/**
	 * The item that was originally clicked on
	 * 
	 * @attribute clicksrc
	 * @type Element
	 * @default undefined
	 */
	clicksrc: undefined,

	/**
	 * Whether the item is a link
	 * 
	 * @attribute isLink
	 * @type Boolean
	 * @default false
	 */
	isLink: false,

	/**
	 * Whether the item is a script
	 * 
	 * @attribute isScript
	 * @type Boolean
	 * @default false
	 */
	isScript: false,

	/**
	 * Whether the item is a divider
	 * 
	 * @attribute isDivider
	 * @type Boolean
	 * @default false
	 */
	isDivider: false,

	/**
	 * Whether the item is a menu
	 * 
	 * @attribute isMenu
	 * @type Boolean
	 * @default false
	 */
	isMenu: false,

	/**
	 * Whether the item is a stylesheet
	 * 
	 * @attribute isStylesheet
	 * @type Boolean
	 * @default false
	 */
	isStylesheet: false,

	/**
	 * The link item
	 *
	 * @attribute linkItem
	 * @type Object
	 * @default {}
	 */
	linkItem: {},

	/**
	 * The script item
	 *
	 * @attribute scriptItem
	 * @type Object
	 * @default {}
	 */
	scriptItem: {},

	/**
	 * The divider item
	 *
	 * @attribute dividerItem
	 * @type Object
	 * @default {}
	 */
	dividerItem: {},

	/**
	 * The menu item
	 *
	 * @attribute menuItem
	 * @type Object
	 * @default {}
	 */
	menuItem: {},

	/**
     * Whether the page is opened
     * 
     * @attribute opened
     * @type Boolean
     * @default false
     */
	opened: false,

	/**
     * The overlay element associated with the current dialog
     * 
     * @attribute $overlayEl
     * @type Element
     * @default null
     */
	$overlayEl: null,

	/**
	 * The overlayEl animation
	 *
	 * @attribute overlayAnimation
	 * @type Animation
	 * @default null
	 */
	overlayAnimation: null,

	properties: {
		animationConfig: {
			value: function() {
				return {
					'entry': {
						name: 'scale-up-animation',
						node: this.$.overlayCont,
						duration: 300
					},
					'exit': {
						name: 'scale-down-animation',
						node: this.$.overlayCont,
						duration: 300
					}
				}
			}
		},
		/**
		 * The item to edit
		 * 
		 * @attribute item
		 * @type Object
		 * @default null
		 */
		item: {
			type: Object,
			value: null,
			notify: true
		},
		/**
		 * The nodeInfo to display
		 * 
		 * @attribute nodeInfo
		 * @type Object
		 * @default null
		 */
		nodeInfo: {
			type: Object,
			value: {},
			notify: true
		},
		/*
		 * Whether to hide the update message
		 * 
		 * @attribute hideUpdateMessage
		 * @type Boolean
		 * @default true
		 */
		hideUpdateMessage: {
			type: Boolean,
			value: true,
			notify: true
		}
	},

	listeners: {
		"neon-animation-finish": '_onNeonAnimationFinish'
	},

	isLocal: function (source) {
		if (!source) {
			return true;
		}
		return source === 'local';
	},

	nodeInfoExists: function(nodeInfo) {
		return !!nodeInfo;
	},

	hideNodeInfo: function (nodeInfo) {
		return !this.nodeInfoExists(nodeInfo) ||
			(this.isLocal(nodeInfo.source) && !this.hasInstallDate(nodeInfo));
	},

	hasInstallDate: function(nodeInfo) {
		return this.nodeInfoExists(nodeInfo) && !!nodeInfo.installDate;
	},

	_onNeonAnimationFinish: function () {
		if (!this.opened) {
			this.$overlayEl[0].style.display = 'none';
			this.$.overlayCont.style.display = 'none';
			document.body.style.overflow = 'auto';
			document.body.style.marginRight = 0;
			window.app.show = false;
			this.opened = false;
			window.app.item = null;
			this.unassignItems();
		}
	},

	unassignItems: function() {
		this.isLink = this.isScript = this.isStylesheet = this.isMenu = this.isDivider = false;
		this.linkItem = this.scriptItem = this.stylesheetItem = this.menuItem = this.dividerItem = {};
	},

	/**
	 * @param eventSourceElement - The element that was clicked on
	 */
	animateIn: function () {
		this.$overlayEl.css('display', 'block');
		(this.overlayAnimation && this.overlayAnimation.play()) || (this.overlayAnimation = this.$overlayEl[0].animate([
			{
				opacity: 0
			}, {
				opacity: 0.3
			}
		], {
			duration: 300,
			fill: 'both',
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		}));
			
		document.body.style.overflow = 'hidden';
		document.body.style.marginRight = '17px';
		app.show = true;
		this.opened = true;
		this.$.overlayCont.style.display = 'block';
		this.playAnimation('entry');
	},
	
	animateOut: function () {
		this.overlayAnimation.reverse();
		this.$overlayEl.off('click');
		this.playAnimation('exit');
		this.opened = false;
		document.body.parentNode.style.overflow = 'auto';
	},

	updateNodeInfo: function(obj, path) {
		path = path || 'nodeInfo';
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (typeof obj[key] === 'object') {
					this.updateNodeInfo(obj[key], path + '.' + key);
				}
				this.notifyPath(path + '.' + key, obj[key]);
			}
		}
	},

	updateName: function(value) {
		this.notifyPath('item.name', value);
	},

	showUpgradeNotice: function (hideUpdateMessage, node) {
		return !hideUpdateMessage && (node && node.type === 'script' && node.value && node.value.updateNotice);
	},

	getScriptUpdateStatus: function(node) {
		if (node) {
			if (window.app.storageLocal.upgradeErrors) {
				if (window.app.storageLocal.upgradeErrors[node.id]) {
					return 'Some errors have occurred in updating this script. Please resolve them by clicking the link and replace any chrome ' +
						'calls on error lines with their CRM API equivalent.';
				}
			}
			return 'No errors have been detected in updating this script but this is no guarantee it will work, be sure to test it at least once.';
		}
		return '';
	},

	hideUpdateMergeDialog: function () {
		var _this = this;
		if (this.showUpgradeNotice(this.hideUpdateMessage, this.item)) {
			var height = this.$.scriptUpdateNotice.getBoundingClientRect().height;
			var marginBot = '-' + height + 'px';
			this.$.scriptUpdateNotice.animate([
				{
					marginBottom: '0px'
				}, {
					marginBottom: marginBot
				}
			], {
				duration: 350,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				_this.$.scriptUpdateNotice.style.marginBottom = marginBot;
				_this.hideUpdateMessage = true;
			};
		}
		window.scriptEdit.newSettings.value.updateNotice = false;
	},

	showScriptUpdateDiff: function () {
		var _this = this;
		var oldScript = this.item.value.oldScript;
		var newScript = this.item.value.script;
		window.doc.externalEditorChooseFile.init(oldScript, newScript, function(result) {
			if (window.app.storageLocal.upgradeErrors) {
				delete window.app.storageLocal.upgradeErrors[_this.item.id];
			}
			window.scriptEdit.editor.setValue(result);
			setTimeout(function() {
				_this.hideUpdateMergeDialog();
			}, 250);
			chrome.storage.local.set({
				upgradeErrors: window.app.storageLocal.upgradeErrors || {}
			});
		}, true, window.app.storageLocal.upgradeErrors && window.app.storageLocal.upgradeErrors[this.item.id]);
		window.externalEditor.showMergeDialog(window.externalEditor, oldScript, newScript);
		window.doc.externalEditorChooseFile.open();
	},

	getInstallDateTextFormat: function() {
		var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

		if (window.Intl && typeof window.Intl === 'object' && this.nodeInfo) {
			var format = (new Date('1-13-2016').toLocaleDateString() === '1-13-2016' ? 'eu' : 'na');
			var date;
			if (format === 'eu') {
				date = this.nodeInfo.installDate.split('-');
				date = date[1] + '-' + date[0] + '-' + date[2];
			} else {
				date = this.nodeInfo.installDate;
			}
			date = new Date(date);
			return Math.floor(new Date(Date.now() - date.getMilliseconds()).getMilliseconds() / (1000 * 60 * 60 * 24)) + ' days ago';
		}
		return null;
	},

	ready: function () {
		$('.popupCont').click(function(e) {
			e.stopPropagation();
		});
		this.$overlayEl = $('.overlayCont');
		window.crmEditPage = this;
		this.isLink = this.isMenu = this.isScript = this.isDivider = false;
	},
	
	init: function() {
		var _this = this;
		var valueStorer = {};
		this.hideUpdateMessage = false;
		this.scriptItem = this.linkItem = this.dividerItem = this.menuItem = this.stylesheetItem = {};
		if ((valueStorer.isScript = this.item.type === 'script')) {
			this.scriptItem = this.item;
			valueStorer.isLink = valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
		} else if ((valueStorer.isLink = this.item.type === 'link')) {
			this.linkItem = this.item;
			valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
		} else if ((valueStorer.isStylesheet = this.item.type === 'stylesheet')) {
			this.stylesheetItem = this.item;
			valueStorer.isMenu = valueStorer.isDivider = false;
		} else if ((valueStorer.isMenu = this.item.type === 'menu')) {
			this.menuItem = this.item;
			valueStorer.isDivider = false;
		} else {
			valueStorer.isDivider = true;
			this.dividerItem = this.item;

		}
		setTimeout(function() {
			window.app.show = true;
			_this.isScript = valueStorer.isScript;
			_this.isLink = valueStorer.isLink;
			_this.isMenu = valueStorer.isMenu;
			_this.isDivider = valueStorer.isDivider;
			_this.isStylesheet = valueStorer.isStylesheet;
			$(_this).find('#editPageCont > :not([hidden])')[0].init();
			_this.animateIn();
		}, 300);
	}
});