import { printIfTrue, onTypeChange, freeze, __, renderable, twoWay } from '../../utils.js';
import { TemplateFn, CHANGE_TYPE } from '../../../modules/wclib/build/es/wclib.js';
import { render } from '../../../modules/lit-html/lit-html.js';
import { I18NKeys } from '../../../_locales/i18n-keys.js';
import { CrmApp } from './crm-app.js';

export const CrmAppHTML = new TemplateFn<CrmApp>(function (html, props, _theme, change) {
	return html`
		<div class="popupCont">
			<div id="fullscreenEditor">
				<div id="editorCurrentScriptTitle">
					<div id="showHideToolsRibbonCont">
						<paper-icon-button title="tools" id="showHideToolsRibbonButton" 
							icon="menu" @tap="${this.listeners.toggleToolsRibbon}">
						</paper-icon-button>							
					</div>
					<div id="editorTitleRibbon">
						<span id="ribbonScriptName" ?hidden="${!props.item || props.item.type !== 'script'}"></span>
						<span id="ribbonStylesheetName" ?hidden="${!props.item || props.item.type !== 'stylesheet'}"></span>
					</div>
					<div id="titleRibbonEnd">
						<div id="fullscreenEditorButtons">
							<div hidden="${props.item && props.item.type === 'stylesheet'}" title="Toggle typescript" id="editorTypescript" @tap="${this.listeners.toggleTypescript}">
								${__(change, I18NKeys.crmApp.ribbons.ts)}
							</div>
							<div title="Exit fullscreen" id="fullscreenEditorToggle" @tap="${this.listeners.exitFullscreen}">
								<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewbox="0 0 48 48">
									<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>
								</svg>
							</div>
							<div title="Toggle options" id="fullscreenEditorSettings" @tap="${this.listeners.toggleFullscreenOptions}">
								<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewbox="0 0 48 48">
									<path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97L9.9 10.1c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
								</svg>
							</div>
						</div>
						<div id="shrinkTitleRibbonButtonCont">
							<svg id="shrinkTitleRibbonButton" on-tap="toggleShrinkTitleRibbon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewbox="0 0 48 48"><path d="M16 10v28l22-14z" /></svg>
						</div>
					</div>
				</div>
				<div id="fullscreenEditorHorizontal">
					<div id="editorToolsRibbonContainer">
						<div id="editorToolsRibbon">
							<div @tap="${this.listeners.launchExternalEditorDialog}" class="ribbonTool" id="externalEditorDialogTrigger">Use External Editor</div>
							<paper-libraries-selector id="paperLibrariesSelector" class="ribbonTool jsTool" .usedlibraries="${props.item && props.item.type === 'script' ?
								props.item.value.libraries : []} "></paper-libraries-selector>
							<paper-get-page-properties id="paperGetPageProperties" class="ribbonTool jsTool"></paper-get-page-properties>
							<div @tap="${this.listeners.launchSearchWebsiteToolScript}" class="ribbonTool jsTool" id="paperSearchWebsitesToolTrigger">Search Website</div>
							<div @tap="${this.listeners.runLint}" class="ribbonTool" id="runCssLintButton">
								<span class="cssTool">
									${__(change, I18NKeys.crmApp.ribbons.tslint)}
								</span>
								<span class="jsTool">
									${__(change, I18NKeys.crmApp.ribbons.jslint)}
								</span>
							</div>
							<div @tap="${this.listeners.showCssTips}" class="ribbonTool cssTool" id="showCssTipsButton">
								${__(change, I18NKeys.crmApp.ribbons.info)}
							</div>
						</div>
					</div>
					<div id="fullscreenSettingsContainer">
						<div id="editorOptions">
							<div id="settingsPadding">
								<div class="editorSettingsTxt">
									${__(change, I18NKeys.crmApp.editor.settings.header)}
								</div>
								<div id="editorThemeSettingCont">
									<div id="editorThemeSettingTxt">${__(change, I18NKeys.crmApp.editor.settings.theme)}:</div>
									<div id="editorThemeSettingChoicesCont">
										<div id="editorThemeSettingWhite" @tap="${this.listeners.setThemeWhite}" class="editorThemeSetting"></div>
										<div id="editorThemeSettingDark" @tap="${this.listeners.setThemeDark}" class="editorThemeSetting"></div>
									</div>
								</div>
								<br />
								<div id="editorThemeFontSize">
									<paper-input on-change="domListener" @change="${this.listeners.fontSizeChange}" id="editorThemeFontSizeInput" type="number" always-float-label label="${__(change, I18NKeys.crmApp.editor.settings.fontsizePercentage)}">
										<div suffix>%</div>
									</paper-input>
								</div>
								<br />
								<div id="editorJSLintGlobals">
									<div id="editorJSLintGlobalsFlexCont">
										<paper-input on-keypress="domListener" @keypress="${this.listeners.jsLintGlobalsChange}" id="editorJSLintGlobalsInput" label="${__(change, I18NKeys.crmApp.editor.settings.jslintGlobals)}"  always-float-label></paper-input>
									</div>
								</div>
								<br />
								<br />
								<div id="keyBindingsText" class="editorSettingsTxt">${__(change, I18NKeys.crmApp.editor.settings.keybindings)}</div>
								<div id="keyBindingsContainer">
									<div id="keyBindingsTemplate">
										${renderable(this.keyBindingsSettings, (keyBindings) => {
											return keyBindings.map((keyBinding, index) => {
												return html`
													<div class="keyBinding">
														<div>
															<paper-input data-index="${index}" 
																@keydown="${this.listeners.onKeyBindingKeyDown}" 
																.label="${keyBinding.name}" 
																.value="${(this.settings && 
																	this.settings.editor.keyBindings[keyBinding.storageKey]) ||
																		keyBinding.defaultKey}" 
																class="keyBindingSettingKeyInput" 
																.always-float-label></paper-input>
														</div>
														<br />
													</div>`
											});
										})}
									</div>
								</div>
								<br id="afterEditorSettingsSpacing" /><br /><br />
							</div>
						</div>
					</div>
					<monaco-editor no-spinner id="fullscreenEditorEditor"></monaco-editor>
				</div>
			</div>
			<crm-edit-page id="editPage" item="${props.item}"></crm-edit-page>
		</div>
		<div class="backdropCont"></div>
		<div class="pageCont">
			<app-header-layout>
				<app-header slot="header" reveals effects="waterfall">
					<app-toolbar>
						<div main-title class="title">
							<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewbox="10000 5500 9000 10590" width="70px" height="70px" version="1.1" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
								xmlns:xlink="http://www.w3.org/1999/xlink">
								<defs>
									<style type="text/css">
										.fil5 {fill:white}
										.fil0 {fill:#3F51B5}
										.fil3 {fill:#4CAF50}
										.fil4 {fill:#AA00FF}
										.fil1 {fill:#F44336}
										.fil2 {fill:#FFC107}
									</style>
								</defs>
								<g id="Layer_x0020_1">
									<metadata id="CorelCorpID_0Corel-Layer"/>
									<g id="_592574224">
										<path class="fil0" d="M16886 12415l168 -169c63,-62 63,-164 0,-227l-947 -947 -569 222 1121 1121c62,62 164,62 227,0z"/>
										<path class="fil1" d="M15906 12225l168 -168c63,-63 63,-165 0,-227l-536 -536 -568 222 709 709c62,63 164,63 227,0z"/>
										<path class="fil2" d="M16095 13205l169 -168c62,-63 62,-165 0,-227l-1294 -1294 -293 114 -108 276 1299 1299c63,63 165,63 227,0z"/>
										<path class="fil3" d="M15115 13016l169 -169c62,-62 62,-164 0,-226l-715 -715 -223 568 542 542c63,62 165,62 227,0z"/>
										<path class="fil4" d="M15305 13996l168 -169c62,-62 62,-164 0,-226l-1127 -1127 -222 568 954 954c62,62 164,62 227,0z"/>
										<rect class="fil4" transform="matrix(0.515153 -0.515153 0.164098 0.164098 15404.8 14322.8)" width="767" height="2672" rx="220" ry="220"/>
										<rect class="fil3" transform="matrix(0.515153 -0.515153 -0.15801 -0.15801 15838.2 13965.6)" width="767" height="2672" rx="220" ry="220"/>
										<rect class="fil2" transform="matrix(0.515153 -0.515153 -0.264406 -0.264406 16826.3 14163.2)" width="767" height="2672" rx="220" ry="220"/>
										<rect class="fil1" transform="matrix(0.515153 -0.515153 -0.291735 -0.291735 16726.2 13272.5)" width="767" height="2672" rx="220" ry="220"/>
										<rect class="fil0" transform="matrix(0.515153 -0.515153 -0.139794 -0.139794 17657.4 13413.2)" width="767" height="2672" rx="220" ry="220"/>
										<rect class="fil2" transform="matrix(0.515153 -0.515153 -0.0972441 -0.0972441 17224.2 14561.1)" width="767" height="2672" rx="220" ry="220"/>
										<rect class="fil5" transform="matrix(0.457635 -0.457635 0.457635 0.457635 10474.2 7770.44)" width="767" height="2672" rx="220" ry="220"/>
										<rect class="fil5" x="12215" y="6895" width="497" height="1729" rx="142" ry="142"/>
										<rect class="fil5" transform="matrix(-1.71705E-14 0.647193 0.647193 1.71705E-14 9950.21 9159.86)" width="767" height="2672" rx="220" ry="220"/>
										<rect class="fil5" transform="matrix(0.457635 0.457635 -0.457635 0.457635 14071.1 7370.17)" width="767" height="2672" rx="220" ry="220"/>
										<rect class="fil5" transform="matrix(0.457635 0.457635 0.457635 -0.457635 10425.1 11016.2)" width="767" height="2672" rx="220" ry="220"/>
										<path class="fil5" d="M12638 9203l3531 1269c159,57 241,232 184,391 -32,90 -102,156 -186,185l-1490 582 -589 1504c-62,157 -239,234 -396,172 -85,-33 -147,-101 -176,-181l0 0 -1269 -3531c-57,-159 26,-334 184,-391 70,-25 143,-23 207,0z"/>
									</g>
								</g>
							</svg>
							<span>${onTypeChange(change, CHANGE_TYPE.LANG, this._getPageTitle)}</span>
						</div>
					</app-toolbar>
					${freeze(() => printIfTrue(
						this.getChromeVersion() < 30, html`
							<div class="badBrowserBanner">
								${__(change, I18NKeys.crmApp.header.oldChrome, new Date().getUTCFullYear() - 2013)}
							</div>`
						))}
				</app-header>
				<div class="container">
					<lang-selector></lang-selector>
					<br />
					<div class="customRightClickMenuConfig">
						<div id="crmEditPageTopTextContainer">
							<div class="bigTxt">
								${__(change, I18NKeys.crmApp.editcrm.editingCrm)}
							</div>
							<div id="crmTypeSelector">
								<div class="crmType pageType" title="${
										__(change, I18NKeys.crmApp.crmtype.toggle, 
											this.__(I18NKeys.crmApp.crmtype.regularWebpages))
									}"  @tap="${this.listeners.iconSwitch}">
									<paper-ripple></paper-ripple>
									<div class="crmTypeIcon">
										<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="80" height="80" viewbox="0 0 24 24">
											<path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
										</svg>
									</div>
									<div class="crmTypeTxt">
										${__(change, I18NKeys.crmTypes.webpages)}
									</div>
								</div>
								<div class="crmType linkType" title="${
									__(change, I18NKeys.crmApp.crmtype.toggle, 
										this.__(I18NKeys.crmTypes.weblinks))
								}" @tap="${this.listeners.iconSwitch}">
									<paper-ripple></paper-ripple>
									<div class="crmTypeIcon">
										<svg height="80" viewbox="0 0 24 24" width="80" xmlns="http://www.w3.org/2000/svg">
											<path d="M0 0h24v24H0z" fill="none" />
											<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
										</svg>
									</div>
									<div class="crmTypeTxt">
									${__(change, I18NKeys.crmTypes.weblinks)}
									</div>
								</div>
								<div class="crmType selectionType" title="${
									__(change, I18NKeys.crmApp.crmtype.toggle, 
										this.__(I18NKeys.crmApp.crmtype.selectedText))
								}" @tap="${this.listeners.iconSwitch}">
									<paper-ripple></paper-ripple>
									<div class="crmTypeIcon">
										<svg height="80" viewbox="0 0 24 24" width="80" xmlns="http://www.w3.org/2000/svg">
											<path d="M0 0h24v24H0z" fill="none" />
											<path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z" />
										</svg>
									</div>
									<div class="crmTypeTxt">
									${__(change, I18NKeys.crmTypes.selection)}
									</div>
								</div>
								<div class="crmType imageType" title="${
									__(change, I18NKeys.crmApp.crmtype.toggle, 
										this.__(I18NKeys.crmTypes.images))
								}" @tap="${this.listeners.iconSwitch}">
									<paper-ripple></paper-ripple>
									<div class="crmTypeIcon">
										<svg height="80" viewbox="0 0 24 24" width="80" xmlns="http://www.w3.org/2000/svg">
											<path d="M0 0h24v24H0z" fill="none" />
											<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
										</svg>
									</div>
									<div class="crmTypeTxt">
									${__(change, I18NKeys.crmTypes.images)}
									</div>
								</div>
								<div class="crmType videoType" title="${
									__(change, I18NKeys.crmApp.crmtype.toggle, 
										this.__(I18NKeys.crmTypes.videos))
								}" @tap="${this.listeners.iconSwitch}">
									<paper-ripple></paper-ripple>
									<div class="crmTypeIcon">
										<svg height="80" viewbox="0 0 24 24" width="80" xmlns="http://www.w3.org/2000/svg">
											<path d="M0 0h24v24H0z" fill="none" />
											<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
										</svg>
									</div>
									<div class="crmTypeTxt">
									${__(change, I18NKeys.crmTypes.videos)}
									</div>
								</div>
								<div class="crmType audioType" title="${
									__(change, I18NKeys.crmApp.crmtype.toggle, 
										this.__(I18NKeys.crmTypes.audio))
								}" @tap="${this.listeners.iconSwitch}">
									<paper-ripple></paper-ripple>
									<div class="crmTypeIcon">
										<svg height="80" viewbox="0 0 24 24" width="80" xmlns="http://www.w3.org/2000/svg">
											<path d="M0 0h24v24H0z" fill="none" />
											<path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
										</svg>
									</div>
									<div class="crmTypeTxt">
									${__(change, I18NKeys.crmTypes.audio)}
									</div>
								</div>
							</div>
						</div>
						<div class="customRightClickMenuEdit">
							<edit-crm id="editCrm"></edit-crm>
						</div>
					</div>
					<br /><br />
					<div class="optionsCont">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.options.header)}
						</div>
						<div class="options">
							<paper-toggle-option id="catchErrors">
								${__(change, I18NKeys.crmApp.options.catchErrors)}
							</paper-toggle-option>
							<paper-toggle-option id="showOptions">
								${__(change, I18NKeys.crmApp.options.showoptions)}
							</paper-toggle-option>
							<paper-toggle-option id="recoverUnsavedData">
								${__(change, I18NKeys.crmApp.options.recoverUnsavedData)}
							</paper-toggle-option>
							<paper-toggle-option id="CRMOnPage" showmessage disabledreason="${
								__(change, I18NKeys.crmApp.options.chromeLow,
									~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent) ? 
										(~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] + '') : 
											this.__(I18NKeys.crmApp.options.notChrome))
							}">
								${__(change, I18NKeys.crmApp.options.CRMOnPageOption)}
							</paper-toggle-option>
							<paper-toggle-option id="editCRMInRM" disabledreason="${__(change, I18NKeys.crmApp.options.chromeLow)}">
								${__(change, I18NKeys.crmApp.options.editCRMInRM)}
							</paper-toggle-option>
							<paper-toggle-option id="useStorageSync" disabledreason="${
								onTypeChange(change, CHANGE_TYPE.LANG, this._getStorageSyncDisabledReason)
							}">
								${__(change, I18NKeys.crmApp.options.useStorageSyncOption)}
								<span style="${renderable(this.settingsJsonLength, this._getSettingsJsonLengthColor)}">${
									renderable(this.settingsJsonLength, this._formatJSONLength)
								}</span>/102,400 bytes
							</paper-toggle-option>
							<paper-button @tap="${this.listeners.showManagePermissions}" raised class="blue">${__(change, I18NKeys.crmApp.options.managePermissions)}</paper-button>
						</div>
					</div>
					<br /><br />
					<div class="defaultCRMLinks">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.defaultLinks.header)}
						</div>
						<div class="defaultsDescr">
							${__(change, I18NKeys.crmApp.defaultLinks.description)}
						</div>
						<br />
						<div class="defaultLinks">
							<default-link href="http://www.google.com" default-name="Google"></default-link>
							<default-link href="http://www.facebook.com" default-name="Facebook"></default-link>
							<default-link href="http://www.twitter.com" default-name="Twitter"></default-link>
							<default-link href="http://www.youtube.com" default-name="Youtube"></default-link>
							<default-link href="http://www.yahoo.com" default-name="Yahoo"></default-link>
							<default-link href="http://www.wikipedia.org" default-name="Wikipedia"></default-link>
							<default-link href="http://www.amazon.com" default-name="Amazon"></default-link>
							<default-link href="http://www.ebay.com" default-name="Ebay"></default-link>
							<default-link href="http://www.reddit.com" default-name="Reddit"></default-link>
						</div>
					</div>
					<br /><br />
					<div class="defaultCRMSearchEngines">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.searchEngines.header)}
						</div>
						<div class="defaultsDescr">
							<echo-html html="${__(change, I18NKeys.crmApp.searchEngines.description)}"></echo-html>
						</div>
						<div class="defaultSearchEngines">
							<default-link search-engine href="https://www.google.com/search?q=%s" default-name="Search Google for %s"></default-link>
							<default-link search-engine href="https://en.wikipedia.org/w/index.php?title=Special:Search&search=%s" default-name="Search Wikipedia for %s"></default-link>
							<default-link search-engine href="https://www.youtube.com/results?search_query=%s" default-name="Search Youtube for %s"></default-link>
							<default-link search-engine href="https://www.amazon.com/s/?url=search-alias%3Daps&field-keywords=%s" default-name="Search Amazon for %s"></default-link>
						</div>
						<paper-button class="blue topoffset" id="removeButton" @tap="${this.listeners.launchSearchWebsiteToolLink}" raised>ADD CUSTOM WEBSITE</paper-button>
					</div>
					<br /><br />
					<div class="URIScheme">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.uriScheme.header)}
						</div>
						<div class="URISchemeDescr">
							<echo-html html="${__(change, I18NKeys.crmApp.uriScheme.description)}"></echo-html>
						</div>
						<div class="URISchemeGenerator">
							<paper-input id="URISchemeFilePath" label="${__(change, I18NKeys.crmApp.uriScheme.filePathLabel)}" value="C:\files\file.exe"></paper-input>
							<paper-input id="URISchemeSchemeName" pattern="(\w|\d|_|\.|-)*" auto-validate="true" error-message="${__(change, I18NKeys.crmApp.uriScheme.invalidScheme)}" label="${__(change, I18NKeys.crmApp.uriScheme.schemeNameLabel)}" value="${__(change, I18NKeys.crmApp.uriScheme.example)}"></paper-input>
							<animated-button cooldown raised class="blue topoffset" tap="domListener" @click="${this.listeners._generateRegexFile}" content="${__(change, I18NKeys.crmApp.uriScheme.generate)}"></animated-button>
						</div>
					</div>
					<br /><br />
					<div class="importSettingsCont">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.importing.header)}
						</div>
						<div class="importDescr">
							${__(change, I18NKeys.crmApp.importing.description)}
						</div>
						<div class="importSettings">
							<textarea rows="10" id="importSettingsInput" class="textarea" spellcheck="false" autocomplete="off"></textarea>
							<span id="importSettingsError">
								${__(change, I18NKeys.crmApp.importing.error)}
							</span>
						</div>
						<paper-checkbox title="${__(change, I18NKeys.crmApp.importing.overwriteTitle)}" checked id="overWriteImport">${__(change, I18NKeys.crmApp.importing.overwrite)}</paper-checkbox>
						<br />
						<animated-button class="blue" cooldown raised id="importButton" tap="domListener" @click="${this.listeners.importData}" content="${__(change, I18NKeys.crmApp.importing.import)}"></animated-button>
					</div>
					<br /><br />
					<div class="exportSettingsCont">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.exporting.header)}
						</div>
						<div class="exportDescr">
							${__(change, I18NKeys.crmApp.exporting.description)}
						</div>
						<div class="exportSettings">
							<center-element id="exportSettingsSpinner" nostyle hide>
								<div>
									<div class="exportSettingsSpinnerHorizontalCenterer">
										<paper-spinner active></paper-spinner>
									</div>
									<div>
										${__(change, I18NKeys.crmApp.exporting.waiting)}
									</div>
								</div>
							</center-element>
							<textarea rows="10" id="exportSettingsOutput" class="textarea" spellcheck="false" autocomplete="off"></textarea>
						</div>
						<paper-checkbox checked id="exportCRM">${__(change, I18NKeys.crmApp.exporting.exportCRM)}</paper-checkbox>
						<paper-checkbox checked id="exportSettings">${__(change, I18NKeys.crmApp.exporting.exportSettings)}</paper-checkbox>
						<paper-icon-button id="exportCopyButton" icon="content-copy" title="copy to clipboard" @tap="${this.listeners.copyExportToClipboard}"></paper-icon-button>
						<br/>
						<animated-button cooldown class="blue" raised id="exportButton" tap="domListener" @click="${this.listeners.exportData}" content="${__(change, I18NKeys.crmApp.exporting.export)}"></animated-button>
					</div>
					<br/><br/>
					<div class="helpCont">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.help.header)}
						</div>
						<div class="helpDescr">
							<echo-html html="${__(change, I18NKeys.crmApp.help.description)}"></echo-html>
						</div>
					</div>
					<br /><br />
					<div class="contactCont">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.contact.header)}
						</div>
						<div class="contactDescr">
							<echo-html html="${__(change, I18NKeys.crmApp.contact.description)}"></echo-html>
						</div>
					</div>
					<br /><br />
					<div class="bugReportingCont">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.bugs.header)}
						</div>
						<div class="bugReportingDescr">
							${__(change, I18NKeys.crmApp.bugs.description)}
						</div>
						<paper-button raised class="blue topoffset" @tap="${this.listeners._toggleBugReportingTool}">${__(change, I18NKeys.crmApp.bugs.toggle)}</paper-button>
					</div>
					<br /><br />
					<div class="globalExcludes">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.globalExcludes.header)}
						</div>
						<div class="globalExcludesDescr">
							${__(change, I18NKeys.crmApp.globalExcludes.description)}
							<a href="https://developer.chrome.com/extensions/match_patterns" rel="noopener" target="_blank">https://developer.chrome.com/extensions/match_patterns</a>
						</div>
						<div class="globalExcludesItems">
							${renderable(this.globalExcludes, (globalExcludes: string[]) => {
								return globalExcludes.map((globalExclude) => {
									return html`
										<div class="globalExcludeContainer">
											<paper-input on-change="domListener" @change="${this.listeners.globalExcludeChange}" 
												pattern="(file:///.*|(\*|http|https|file|ftp)://(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(/(.*))?|(<all_urls>))" 
												auto-validate="true" 
												label="${__(change, I18NKeys.crmApp.globalExcludes.patternLabel)}" 
												error-message="${__(change, I18NKeys.crmApp.globalExcludes.patternInvalid)}" 
												class="globalExcludeInput" value="${globalExclude}"></paper-input>
											<paper-icon-button ?hidden="${globalExcludes.length > 1}" 
												icon="clear" @tap="${this.listeners.removeGlobalExclude}"
												class="globalExcludeRemove" data-url="${globalExclude}"></paper-icon-button>
										</div>		
									`;
								});
							})}
							<paper-button raised class="blue topoffset" @tap="${this.listeners.addGlobalExcludeField}">
								${__(change, I18NKeys.generic.add)}
							</paper-button>
						</div>
					</div>
					<br /><br />
					<div class="loggingButtonCont">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.logging.header)}
						</div>
						<div class="loggingDescr">
							<echo-html html="${__(change, I18NKeys.crmApp.logging.description)}"></echo-html>
						</div>
						<paper-button class="blue topoffset" raised @tap="${this.listeners._openLogging}">${__(change, I18NKeys.crmApp.logging.logging)}</paper-button>
					</div>
					<br /><br />
					<div class="privacyPolicyCont">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.privacyPolicy.header)}
						</div>
						<div class="privacyPolicyDescr">
							<echo-html html="${__(change, I18NKeys.crmApp.privacyPolicy.description)}"></echo-html>
						</div>
					</div>
					<br/><br/>
					<div class="changelogCont">
						<div class="bigTxt">
							${__(change, I18NKeys.crmApp.changelog.changelog)}
						</div>
						<change-log></change-log>
					</div>
					<div class="trailingBrs">
						<br /><br /><br /><br /><br />
					</div>
				</div>
			</app-header-layout>
			<div id="dialogs">
				<!--Toasts-->
				<paper-toast id="messageToast" text="Please ignore this" duration="5000">
					<span class="toastLink" @tap="${this.listeners.hideGenericToast}" role="button">${__(change, I18NKeys.generic.dismiss)}</span>
				</paper-toast>
				<paper-toast id="undoToast" text="${__(change, I18NKeys.crmApp.toasts.revert)}">
					<span class="toastLink" @tap="${this.listeners.undo}" role="button">${__(change, I18NKeys.generic.undo)}</span>
				</paper-toast>
				<paper-toast data-element-type="ScriptUpdatesToast" id="scriptUpdatesToast" text="Please ignore this" duration="10000">
					<span id="nextScriptUpdateButton" class="toastLink" @tap="${this.listeners.nextUpdatedScript}" role="button">${__(change, I18NKeys.generic.next)}</span>
					<span class="toastLink" @tap="${this.listeners.hideScriptUpdatesToast}" role="button">${__(change, I18NKeys.generic.dismiss)}</span>
				</paper-toast>
				<paper-toast id="contentTypeToast" text="${__(change, I18NKeys.crmApp.toasts.contentType)}" duration="5000"></paper-toast>
				<paper-toast id="externalEditorErrorToast" text="Something went wrong connecting to the CRM App, make sure you have the app installed" duration="10000">
					<a class="toastLink" href="https://chrome.google.com/webstore/detail/crm-external-editor-app/hkjjmhkhhlmkflpihbikfpcojeofbjgn" rel="noopener" target="_blank">INSTALL</a>
					<span id="externalEditorTryAgainButton" role="button">RETRY</span>
				</paper-toast>
				<paper-toast id="externalEditorLocationToast" text="The file is located at...." duration="10000">
					<a href="file:///C:/" rel="noopener" target="_blank" id="externalEditoOpenLocationInBrowser" role="button">OPEN IN BROWSER</a>
				</paper-toast>
				<paper-toast id="storageExceededToast" text="${__(change, I18NKeys.crmApp.toasts.storageExceeded)}" duration="10000"></paper-toast>
				<paper-toast id="noErrorsFound" text="${__(change, I18NKeys.crmApp.toasts.noErrors)}" duration="3500"></paper-toast>
				<paper-toast id="acceptDownloadToast" text="${__(change, I18NKeys.crmApp.toasts.acceptDownload)}" duration="3500"></paper-toast>
				<paper-toast id="updatedSettingsToast" text="Settings were updated to those on xx-xx-xxxx" duration="5000"></paper-toast>
				<!--Dialogs-->
				<paper-dialog id="codeSettingsDialog" no-cancel-on-outside-click no-cancel-on-esc-key data-element-type="CodeSettingsDialog" with-backdrop entry-animation="scale-up-animation" exit-animation="fade-out-animation">
					<h2 id="codeSettingsTitle">${__(change, I18NKeys.crmApp.dialogs.codeSettings.changingOptions)} <span class="bold" id="codeSettingsNodeName"></span></h2>
					<div id="codeSettingsOptions">
						${renderable(this.codeSettingsNoItems, (isEmpty: boolean) => {
							return printIfTrue(isEmpty, html`<div>${__(change, I18NKeys.crmApp.dialogs.codeSettings.noOptions)}</div>`);
						})}
						${renderable(this.codeSettings, (codeSettings: {
							key: keyof CRM.Options;
							value: CRM.Options[keyof CRM.Options]
						}[]) => {
							return codeSettings.map((codeSetting) => {
								return html`
									<div class="codeSettingSetting" data-key="${codeSetting.key}" data-type="${codeSetting.value.type}">
										${printIfTrue(codeSetting.value.type === 'number', () => {
											const value = codeSetting.value as CRM.OptionNumber;
											return html`
												<span class="optionMetaDescr">${__(change, I18NKeys.crmApp.dialogs.codeSettings.numberInput)}</span>
												<paper-input type="number" placeholder="${value.descr || ''}"
													value="${twoWay(value.value, (newValue) => {
														value.value = newValue;
													})}" min="${value.minimum}"
													max="${value.maximum}"
													label="${codeSetting.key}"
													title="${value.descr || ''}"></paper-input>`;
										})}
										${printIfTrue(codeSetting.value.type === 'boolean', () => {
											const value = codeSetting.value as CRM.OptionCheckbox;
											return html`
												<span class="optionMetaDescr">${__(change, I18NKeys.crmApp.dialogs.codeSettings.booleanInput)}</span>
												<br><div class="optionPading"></div>
												<paper-checkbox checked="${twoWay(value.value, (newValue) => {
														value.value = newValue;
													})}">
													<span>
														<b>${codeSetting.key}</b>
														${value.descr ? html`<span> : <span>${value.descr}</span></span>` : ''}
													</span>
												</paper-checkbox>`;
										})}
										${printIfTrue(codeSetting.value.type === 'string', () => {
											const value = codeSetting.value as CRM.OptionString;
											return html`
												<span class="optionMetaDescr">${__(change, I18NKeys.crmApp.dialogs.codeSettings.textInput)}</span>
												<paper-input type="text" placeholder="${value.descr || ''}"
													value="${twoWay(value.value, (newValue) => {
														value.value = newValue;
													})}"
													maxlength="${value.maxLength}"
													label="${codeSetting.key}"
													pattern="${value.format}"
													title="${value.descr || ''}"></paper-input>
											`;
										})}
										${printIfTrue(codeSetting.value.type === 'color', () => {
											const value = codeSetting.value as CRM.OptionColorPicker;
											return html`
												<span class="optionMetaDescr">${__(change, I18NKeys.crmApp.dialogs.codeSettings.colorInput)}</span>
												<input type="color" placeholder="${value.descr || ''}"
													value="${twoWay(value.value, (newValue) => {
														value.value = newValue;
													})}"
													label="${codeSetting.key}"
													title="${value.descr || ''}"/>
											`;
										})}
										${printIfTrue(codeSetting.value.type === 'array', () => {
											const value = codeSetting.value as CRM.OptionArray;
											return html`
												<paper-array-input values="${twoWay(value.value, (newValue) => {
														value.value = newValue;
													})}" 
													max="${value.maxItems}"
													subtext="${value.descr}"
													title="${codeSetting.key}"
													type="${value.items}"></paper-array-input>
												<br>
											`;
										})}
										${printIfTrue(codeSetting.value.type === 'choice', () => {
											const value = codeSetting.value as CRM.OptionChoice;
											return html`
												<paper-dropdown-menu title="${value.descr || ''}" 
													label="${codeSetting.key}" indent="true" 
													fancylabel subtext="${value.descr || ''}"
													selected="${twoWay(value.selected, (newValue) => {
														value.selected = newValue;
													})}" dropdownraised>
													<paper-menu slot="menu" selected="${twoWay(value.selected, (newValue) => {
														value.selected = newValue;
													})}">
														<div slot="content">
															${value.values.map((codeSettingOption) => {
																return html`
																	<paper-item>
																		<div class="menuSelectedCheckmark">
																			<svg fill="#2699f4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewbox="0 0 48 48">
																				<path d="M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z"/>
																			</svg>
																		</div>
																		<span title="${codeSettingOption}" class="menuOptionName">${codeSettingOption}</span>
																	</paper-item>`
															})}
														</div>
													</paper-menu>
												</paper-dropdown-menu>
											`;
										})}
									</div>
									<br />`;
							});
						})}
					</div>
					<div class="buttons">
						<paper-button dialog-dismiss>${__(change, I18NKeys.generic.cancel)}</paper-button>
						<paper-button dialog-confirm @tap="${this.listeners.confirmCodeSettings}">${__(change, I18NKeys.generic.save)}</paper-button>
					</div>
				</paper-dialog>
				<paper-dialog no-cancel-on-outside-click no-cancel-on-esc-key id="restoreChangesDialog" with-backdrop entry-animation="scale-up-animation" exit-animation="fade-out-animation">
					<div id="restoreChangesMain">
						<h2>${__(change, I18NKeys.crmApp.dialogs.recoverUnsaved.header)}</h2>
						<span>${__(change, I18NKeys.crmApp.dialogs.recoverUnsaved.description)}</span>
						<div id="highlightChangedScript" class="restoreChangesOption">${__(change, I18NKeys.crmApp.dialogs.recoverUnsaved.whatNode)}</div>
					</div>
					<div id="restoreChangesHeader">
						<div class="halfDivider">
							<div class="half">
								<h2>${__(change, I18NKeys.crmApp.dialogs.recoverUnsaved.oldCode)}</h2>
							</div>
							<div class="half">
								<h2>${__(change, I18NKeys.crmApp.dialogs.recoverUnsaved.unsavedCode)}</h2>
							</div>
						</div>
					</div>
					<monaco-editor id="restoreChangesEditor"></monaco-editor>
					<div class="buttons">
						<paper-button id="discardButton" dialog-dismiss>${__(change, I18NKeys.generic.discard)}</paper-button>
						<paper-button id="keepChangesButton" dialog-confirm>${__(change, I18NKeys.crmApp.dialogs.recoverUnsaved.keepOld)}</paper-button>
					</div>
				</paper-dialog>
				<paper-dialog data-element-type="ChooseFileDialog" no-cancel-on-outside-click no-cancel-on-esc-key id="externalEditorChooseFile" with-backdrop entry-animation="scale-up-animation" exit-animation="fade-out-animation">
					<div id="chooseFileMainDialog">
						<h2>Choose the file you want to keep</h2>
						<monaco-editor id="chooseFileMerger"></monaco-editor>
						<div class="buttons">
							<paper-button class="closeChooseFileDialog">${__(change, I18NKeys.generic.cancel)}</paper-button>
							<paper-button id="chooseFileChooseCRM" dialog-confirm>Choose extension code</paper-button>
							<paper-button id="chooseFileChooseDisk" dialog-confirm>Choose code on disk</paper-button>
						</div>	
					</div>
				</paper-dialog>
				<paper-dialog no-cancel-on-esc-key with-backdrop id="addLibraryDialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
					<div id="addLibraryLoadingDialog">
						<div id="addLibraryLoadingDialogCenterer">
							<paper-spinner active></paper-spinner>
						</div>
					</div>
					<div id="addLibraryProcessContainer">
						<h2>${__(change, I18NKeys.crmApp.dialogs.addLibrary.header)}</h2>
						<paper-input error-message="${__(change, I18NKeys.crmApp.dialogs.addLibrary.noNameError)}" id="addedLibraryName" label="name"></paper-input>
						<paper-radio-group id="addLibraryRadios" selected="url">
							<paper-radio-button id="addLibraryUrlOption" name="url">${__(change, I18NKeys.crmApp.dialogs.addLibrary.urlInput)}</paper-radio-button>
							<paper-radio-button id="addLibraryManualOption" name="manual">${__(change, I18NKeys.crmApp.dialogs.addLibrary.codeInput)}</paper-radio-button>
						</paper-radio-group>
						<paper-input pattern="$a" id="addLibraryUrlInput" label="${__(change, I18NKeys.generic.url)}" error-message="${__(change, I18NKeys.crmApp.dialogs.addLibrary.urlError)}"></paper-input>
						<paper-textarea id="addLibraryManualInput" label="${__(change, I18NKeys.crmApp.dialogs.addLibrary.code)}"></paper-textarea>
						<br><br>
						<paper-checkbox id="addLibraryIsTS">${__(change, I18NKeys.crmApp.dialogs.addLibrary.usesTypescript)} <a rel="noopener" href="https://www.typescriptlang.org/" target="_blank">typescript</a></paper-checkbox>
						<div class="buttons">
							<paper-button dialog-dismiss>${__(change, I18NKeys.generic.cancel)}</paper-button>
							<paper-button id="addLibraryButton">${__(change, I18NKeys.generic.add)}</paper-button>
						</div>
					</div>
					<div id="addLibraryConfirmationContainer">
						<h2>${__(change, I18NKeys.crmApp.dialogs.addLibrary.isThisOkay)}</h2>
						<textarea id="addLibraryConfirmationInput"></textarea>
						<div class="buttons">
							<paper-button id="addLibraryDenyConfirmation">${__(change, I18NKeys.generic.no)}</paper-button>
							<paper-button id="addLibraryConfirmAddition">${__(change, I18NKeys.generic.yes)}</paper-button>
						</div>
					</div>
					<div id="addLibraryDialogSucces">
						<div id="addLibraryDialogSuccesCheckmark" class="checkmark"></div>
						<div id="addLibraryDialogSuccesText">${__(change, I18NKeys.crmApp.dialogs.addLibrary.added)}</div>
					</div>
				</paper-dialog>
				<paper-dialog with-backdrop id="cssEditorInfoDialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
					<h2>${__(change, I18NKeys.crmApp.dialogs.cssEditorInfo.header)}</h2>
					<br />
					${__(change, I18NKeys.crmApp.dialogs.cssEditorInfo.description)}
					<div class="buttons">
						<paper-button dialog-dismiss>${__(change, I18NKeys.generic.close)}</paper-button>
					</div>
				</paper-dialog>
				<center-element fullscreenoverlay id="exportCenterer">
					<paper-dialog with-backdrop id="exportDialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
						<h2>${__(change, I18NKeys.crmApp.dialogs.cssEditorInfo.header)}</h2>
						<div>
							${__(change, I18NKeys.crmApp.dialogs.cssEditorInfo.description)}
						</div>
						<div id="exportInputLine">
							<paper-input always-float-label id="exportAuthorName" label="${__(change, I18NKeys.crmApp.dialogs.exporting.authorName)}" placeholder="anonymous"></paper-input>
							<paper-icon-button id="dialogCopyButton" icon="content-copy" title="${__(change, I18NKeys.crmApp.dialogs.exporting.copyToClipboard)}" @tap="${this.listeners.copyExportDialogToClipboard}"></paper-icon-button>
						</div>
						<textarea class="paperTextArea" id="exportJSONData" rows="20" spellcheck="false" autocomplete="off"></textarea>
						<div class="buttons">
							<paper-button dialog-dismiss>${__(change, I18NKeys.generic.close)}</paper-button>
						</div>
					</paper-dialog>
				</center-element>
				<center-element fullscreenoverlay id="scriptPermissionsCenterer">
					<paper-dialog with-backdrop id="scriptPermissionDialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
						<br>
						<h2 class="requestPermissionsScriptName">
							Managing permisions for script "${props.item && props.item.name}"
						</h2>
						<div>
							${__(change, I18NKeys.crmApp.dialogs.permissions.description)}
						</div>
						<div class="scriptPermissionsContainer">
							<div class="scriptPermissionsUsedPermissionsTxt">
								${__(change, I18NKeys.crmApp.dialogs.permissions.usedPermissions)}
							</div>
							<div class="requestPermissionsPermissions">
								${renderable(this.scriptPermissions, (permissions) => {
									return permissions.map((permission) => {
										return html`
											<div class="requestPermissionsPermission">
												<div class="requestPermissionsPermissionTopCont" ?is-required="${permission.required}">
													<span class="requestPermissionName">${permission.name}</span>
													<div class="requestPermissionsShowBot">
														<svg class="requestPermissionsSvg" xmlns="http://www.w3.org/2000/svg" 
															width="25" height="25" viewbox="0 0 48 48"><path d="M16 10v28l22-14z" /></svg>
													</div>
													<paper-toggle-button class="scriptPermissionsToggle" 
														.checked="${permission.toggled}" ?ischecked="${permission.toggled}"></paper-toggle-button>
												</div>
												<div class="requestPermissionsPermissionBotCont">
													<span class="requestPermissionsDescription">
														<echo-html makelink .html="${permission.description}"></echo-html>
													</span>
												</div>
											</div>`;
									});
								})}
							</div>
						</div>
						<div class="buttons">
							<paper-button dialog-dismiss>${__(change, I18NKeys.generic.close)}</paper-button>
						</div>
					</paper-dialog>
				</center-element>
				<center-element fullscreenoverlay id="requestPermissionsCenterer">
					<paper-dialog no-cancel-on-outside-click no-cancel-on-esc-key with-backdrop id="requestPermissionsDialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
						<div>
							<h2 id="requestPermissionsHeader">${__(change, I18NKeys.crmApp.dialogs.requestPermissions.header)}</h2>
							<div id="requestPermissionsTxt">
								${__(change, I18NKeys.crmApp.dialogs.requestPermissions.description)}
							<br />
							<div class="requestPermissionsPermissions">
								<div id="requestedPermissionsCont">
									<div id="requestPermissionsAsked">
										<div class="requestPermissionsType">
											${__(change, I18NKeys.crmApp.dialogs.requestPermissions.required)} :
										</div>
										${renderable(this.requestedPermissions, (requestedPermissions) => {
											return requestedPermissions.map((requestedPermission) => {
												return html`
													<div class="requestPermissionsPermission">
														<div class="requestPermissionsPermissionTopCont">
															<span class="requestPermissionName">${requestedPermission.name}</span>
															<div class="requestPermissionsShowBot">
																<svg class="requestPermissionsSvg" xmlns="http://www.w3.org/2000/svg" 
																	width="25" height="25" 
																	viewbox="0 0 48 48"
																>
																	<path d="M16 10v28l22-14z" />
																</svg>
															</div>
															<paper-toggle-button class="requestPermissionButton required" 
																.checked="${requestedPermission.toggled}" ?ischecked="${requestedPermission.toggled}"></paper-toggle-button>
														</div>
														<div class="requestPermissionsPermissionBotCont">
															<span class="requestPermissionsDescription">${requestedPermission.description}</span>
														</div>
													</div>`;
											})
										})}
									</div>
									<div id="requestPermissionsLineCont">
										<div id="requestPermissionsSplitter"></div>
										<svg id="requestPermissionsShowOther" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewbox="0 0 48 48">
											<path d="M38 26H26v12h-4V26H10v-4h12V10h4v12h12v4z" />
											<line x1="10" y1="24" style="stroke: rgb(0, 0, 0); stroke-width: 5;" x2="38" y2="24" />
										</svg>
									</div>
								</div>
								<div id="requestPermissionsOther">
									<div class="requestPermissionsType">
										${__(change, I18NKeys.crmApp.dialogs.requestPermissions.others)} :
									</div>
									${renderable(this.requestedPermissionsOther, (otherPermissions) => {
										return otherPermissions.map((otherPermission) => {
											return html`
												<div class="requestPermissionsPermission">
													<div class="requestPermissionsPermissionTopCont">
														<span class="requestPermissionName">${otherPermission.name}</span>
														<div class="requestPermissionsShowBot">
															<svg class="requestPermissionsSvg" xmlns="http://www.w3.org/2000/svg" 
																	width="25" height="25" 
																	viewbox="0 0 48 48"
																>
																	<path d="M16 10v28l22-14z" />
																</svg>
															</div>
															<paper-toggle-button class="requestPermissionButton required" 
																.checked="${otherPermission.toggled}" ?ischecked="${otherPermission.toggled}"></paper-toggle-button>
													</div>
													<div class="requestPermissionsPermissionBotCont">
														<span class="requestPermissionsDescription">
															<echo-html makelink .html="${otherPermission.description}"></echo-html>
														</span>
													</div>
												</div>`;
										})
									})}
								</div>
							</div>
							<div class="buttons">
								<paper-button dialog-dismiss>${__(change, I18NKeys.generic.close)}</paper-button>
								<paper-button id="requestPermissionsAcceptAll">${__(change, I18NKeys.crmApp.dialogs.requestPermissions.acceptAll)}</paper-button>
							</div>
						</div>
					</paper-dialog>
				</center-element>
				<center-element fullscreenoverlay id="addedPermissionsCenterer">
					<paper-dialog with-backdrop id="addedPermissionsDialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
						<br>
						<div id="addedPermissionsTabContainer" data-element-type="AddedPermissionsTabContainer">
							${renderable(this.addedPermissions, (addedPermissions) => {
								return Promise.all(addedPermissions.map(async (addedPermission) => {
									return html`
										<div class="nodeAddedPermissionsCont" data-id="${addedPermission.node}">
											<h2 class="nodeAddedHeader">
												${__(change, I18NKeys.crmApp.dialogs.addedPermissions.header, 
													this.nodesById.get(addedPermission.node as CRM.GenericNodeId).name,
													(this.nodesById.get(addedPermission.node as CRM.GenericNodeId).nodeInfo &&
														this.nodesById.get(addedPermission.node as CRM.GenericNodeId).nodeInfo.version)) || '1.0'}
											</h2>
											<div class="nodeAddedPermissions">
												${await Promise.all(addedPermission.permissions.map(async (permission) => {
													return html`
														<div class="nodeAddedPermissionCont">
															<div class="nodeAddedPermissionTop">
																<div class="nodeAddedPermissionCheckbox">
																	<paper-checkbox 
																		data-permission="${permission}">
																		<b>${permission}</b>
																	</paper-checkbox>
																</div>
															</div>
															<div class="nodeAddedPermissionDescription">${
																await this.templates.getPermissionDescription(permission as CRM.Permission)
															}</div>
														</div>`;
												}))}
											</div>
										</div>`;
								}));
							})}
						</div>
						<div class="buttons">
							<paper-button
								id="addedPermissionPrevButton"
								@tap="${this.listeners.addedPermissionPrev}">${__(change, I18NKeys.generic.previous)}</paper-button>
							<paper-button id="addedPermissionNextButton" @tap="${this.listeners.addedPermissionNext}">
								<span class="close">${__(change, I18NKeys.generic.apply)}</span>
								<span class="next">${__(change, I18NKeys.generic.next)}</span>
							</paper-button>
						</div>
					</paper-dialog>
				</center-element>
				<paper-search-website-dialog id="paperSearchWebsiteDialog"></paper-search-website-dialog>
				<use-external-editor id="useExternalEditor"></use-external-editor>
			</div>
		</div>
	`
}, CHANGE_TYPE.PROP | CHANGE_TYPE.LANG, render);
