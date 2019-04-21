interface I18NMessage {
	message: string;
	description?: string;
	placeholders?: {
		[key: string]: {
			example?: string;
			content: string;
		}
	}
}
export type LocaleSpec = {
	"generic": {
		"appTitle": I18NMessage,
		"add": I18NMessage,
		"dismiss": I18NMessage,
		"undo": I18NMessage,
		"next": I18NMessage,
		"back": I18NMessage,
		"confirm": I18NMessage,
		"previous": I18NMessage,
		"cancel": I18NMessage,
		"save": I18NMessage,
		"discard": I18NMessage,
		"no": I18NMessage,
		"yes": I18NMessage,
		"close": I18NMessage,
		"apply": I18NMessage,
		"all_capital": I18NMessage,
		"tab": I18NMessage,
		"tabIndex": I18NMessage,
		"url": I18NMessage
	},
	"crmTypes": {
		"webpages": I18NMessage,
		"weblinks": I18NMessage,
		"selection": I18NMessage,
		"images": I18NMessage,
		"videos": I18NMessage,
		"audio": I18NMessage
	},
	"crm": {
		"link": I18NMessage,
		"script": I18NMessage,
		"stylesheet": I18NMessage,
		"menu": I18NMessage,
		"divider": I18NMessage,
		"exampleLinkName": I18NMessage,
		"exampleStylesheetName": I18NMessage,
		"exampleScriptName": I18NMessage,
		"exampleDividerName": I18NMessage,
		"exampleMenuName": I18NMessage,
		"node": I18NMessage,
		"id": I18NMessage,
		"idCapital": I18NMessage
	},
	"permissions": {
		"alarms": I18NMessage,
		"activeTab": I18NMessage,
		"background": I18NMessage,
		"bookmarks": I18NMessage,
		"browsingData": I18NMessage,
		"clipboardRead": I18NMessage,
		"clipboardWrite": I18NMessage,
		"cookies": I18NMessage,
		"contentSettings": I18NMessage,
		"contextMenus": I18NMessage,
		"declarativeContent": I18NMessage,
		"desktopCapture": I18NMessage,
		"downloads": I18NMessage,
		"history": I18NMessage,
		"identity": I18NMessage,
		"idle": I18NMessage,
		"management": I18NMessage,
		"notifications": I18NMessage,
		"pageCapture": I18NMessage,
		"power": I18NMessage,
		"privacy": I18NMessage,
		"printerProvider": I18NMessage,
		"sessions": I18NMessage,
		"systemcpu": I18NMessage,
		"systemmemory": I18NMessage,
		"systemstorage": I18NMessage,
		"topSites": I18NMessage,
		"tabCapture": I18NMessage,
		"tabs": I18NMessage,
		"tts": I18NMessage,
		"webNavigation": I18NMessage,
		"webRequest": I18NMessage,
		"webRequestBlocking": I18NMessage,
		"crmGet": I18NMessage,
		"crmWrite": I18NMessage,
		"crmRun": I18NMessage,
		"crmContextmenu": I18NMessage,
		"chrome": I18NMessage,
		"browser": I18NMessage,
		"GMAddStyle": I18NMessage,
		"GMDeleteValue": I18NMessage,
		"GMListValues": I18NMessage,
		"GMAddValueChangeListener": I18NMessage,
		"GMRemoveValueChangeListener": I18NMessage,
		"GMSetValue": I18NMessage,
		"GMGetValue": I18NMessage,
		"GMLog": I18NMessage,
		"GMGetResourceText": I18NMessage,
		"GMGetResourceURL": I18NMessage,
		"GMRegisterMenuCommand": I18NMessage,
		"GMUnregisterMenuCommand": I18NMessage,
		"GMOpenInTab": I18NMessage,
		"GMXmlhttpRequest": I18NMessage,
		"GMDownload": I18NMessage,
		"GMGetTab": I18NMessage,
		"GMSaveTab": I18NMessage,
		"GMGetTabs": I18NMessage,
		"GMNotification": I18NMessage,
		"GMSetClipboard": I18NMessage,
		"GMInfo": I18NMessage,
		"unsafeWindow": I18NMessage
	},
	"langs": {
		"languages": {
			"en": I18NMessage
		},
		"selector": {
			"current": I18NMessage,
			"clickToChangeLanguage": I18NMessage,
			"requestLanguage": I18NMessage
		}
	},
	"crmApp": {
		"editcrm": {
			"editingCrm": I18NMessage
		},
		"ribbons": {
			"ts": I18NMessage,
			"tslint": I18NMessage,
			"jslint": I18NMessage,
			"info": I18NMessage
		},
		"editor": {
			"settings": {
				"header": I18NMessage,
				"theme": I18NMessage,
				"fontsizePercentage": I18NMessage,
				"jslintGlobals": I18NMessage,
				"keybindings": I18NMessage
			}
		},
		"header": {
			"oldChrome": I18NMessage
		},
		"crmtype": {
			"toggle": I18NMessage,
			"regularWebpages": I18NMessage,
			"selectedText": I18NMessage
		},
		"options": {
			"header": I18NMessage,
			"catchErrors": I18NMessage,
			"showoptions": I18NMessage,
			"recoverUnsavedData": I18NMessage,
			"CRMOnPageDisabled": I18NMessage,
			"CRMOnPageOption": I18NMessage,
			"chromeLow": I18NMessage,
			"notChrome": I18NMessage,
			"useStorageSyncDisabledUnavailable": I18NMessage,
			"useStorageSyncDisabledTooBig": I18NMessage,
			"useStorageSyncOption": I18NMessage,
			"editCRMInRM": I18NMessage,
			"bytes": I18NMessage,
			"managePermissions": I18NMessage
		},
		"defaultLinks": {
			"header": I18NMessage,
			"description": I18NMessage
		},
		"searchEngines": {
			"header": I18NMessage,
			"description": I18NMessage
		},
		"uriScheme": {
			"header": I18NMessage,
			"description": I18NMessage,
			"filePathLabel": I18NMessage,
			"invalidScheme": I18NMessage,
			"schemeNameLabel": I18NMessage,
			"example": I18NMessage,
			"generate": I18NMessage
		},
		"importing": {
			"header": I18NMessage,
			"description": I18NMessage,
			"error": I18NMessage,
			"overwrite": I18NMessage,
			"overwriteTitle": I18NMessage,
			"legacy": I18NMessage,
			"legacyTitle": I18NMessage,
			"import": I18NMessage
		},
		"exporting": {
			"header": I18NMessage,
			"description": I18NMessage,
			"waiting": I18NMessage,
			"exportCRM": I18NMessage,
			"exportSettings": I18NMessage,
			"export": I18NMessage
		},
		"help": {
			"header": I18NMessage,
			"description": I18NMessage
		},
		"contact": {
			"header": I18NMessage,
			"description": I18NMessage
		},
		"bugs": {
			"header": I18NMessage,
			"description": I18NMessage,
			"toggle": I18NMessage
		},
		"globalExcludes": {
			"header": I18NMessage,
			"description": I18NMessage,
			"patternLabel": I18NMessage,
			"patternInvalid": I18NMessage
		},
		"logging": {
			"header": I18NMessage,
			"description": I18NMessage,
			"logging": I18NMessage
		},
		"privacyPolicy": {
			"header": I18NMessage,
			"description": I18NMessage
		},
		"changelog": {
			"changelog": I18NMessage
		},
		"toasts": {
			"revert": I18NMessage,
			"contentType": I18NMessage,
			"storageExceeded": I18NMessage,
			"noErrors": I18NMessage,
			"acceptDownload": I18NMessage
		},
		"dialogs": {
			"codeSettings": {
				"changingOptions": I18NMessage,
				"noOptions": I18NMessage,
				"numberInput": I18NMessage,
				"booleanInput": I18NMessage,
				"textInput": I18NMessage,
				"colorInput": I18NMessage
			},
			"recoverUnsaved": {
				"header": I18NMessage,
				"description": I18NMessage,
				"whatNode": I18NMessage,
				"oldCode": I18NMessage,
				"unsavedCode": I18NMessage,
				"keepOld": I18NMessage
			},
			"addLibrary": {
				"header": I18NMessage,
				"noNameError": I18NMessage,
				"urlInput": I18NMessage,
				"codeInput": I18NMessage,
				"code": I18NMessage,
				"urlError": I18NMessage,
				"usesTypescript": I18NMessage,
				"isThisOkay": I18NMessage,
				"added": I18NMessage
			},
			"cssEditorInfo": {
				"header": I18NMessage,
				"description": I18NMessage
			},
			"exporting": {
				"header": I18NMessage,
				"description": I18NMessage,
				"copyToClipboard": I18NMessage,
				"authorName": I18NMessage
			},
			"permissions": {
				"description": I18NMessage,
				"usedPermissions": I18NMessage
			},
			"requestPermissions": {
				"header": I18NMessage,
				"description": I18NMessage,
				"required": I18NMessage,
				"others": I18NMessage,
				"acceptAll": I18NMessage
			},
			"addedPermissions": {
				"header": I18NMessage
			}
		},
		"code": {
			"nodeUpdated": I18NMessage,
			"extensionUpdated": I18NMessage,
			"settingsUpdated": I18NMessage,
			"hiMessage": I18NMessage,
			"consoleInfo": I18NMessage,
			"permissionsNotSupported": I18NMessage,
			"downloadNotSupported": I18NMessage,
			"importSuccess": I18NMessage,
			"alreadyEditingNode": I18NMessage,
			"wouldExecuteScript": I18NMessage,
			"wouldExecuteStylesheet": I18NMessage
		}
	},
	"background": {
		"crm": {
			"invalidRunat": I18NMessage,
			"executionFailed": I18NMessage,
			"setupError": I18NMessage,
			"updateDownload404": I18NMessage,
			"optionNotFound": I18NMessage,
			"cssCompileError": I18NMessage,
			"contextmenuErrorRetry": I18NMessage,
			"contextmenuError": I18NMessage,
			"userContextmenuError": I18NMessage,
			"createdBackgroundPage": I18NMessage,
			"restartingBackgroundPage": I18NMessage,
			"terminatedBackgroundPage": I18NMessage
		},
		"globalDeclarations": {
			"getID": {
				"noMatches": I18NMessage,
				"oneMatch": I18NMessage,
				"multipleMatches": I18NMessage
			},
			"tabRestore": {
				"success": I18NMessage,
				"unknownError": I18NMessage,
				"ignored": I18NMessage,
				"frozen": I18NMessage
			},
			"proxy": {
				"redirecting": I18NMessage
			}
		},
		"init": {
			"loggingExplanation": I18NMessage,
			"debugExplanation": I18NMessage,
			"registeringPermissionListeners": I18NMessage,
			"registeringHandler": I18NMessage,
			"buildingCrm": I18NMessage,
			"compilingTs": I18NMessage,
			"registeringHandlers": I18NMessage,
			"updatingResources": I18NMessage,
			"updatingNodes": I18NMessage,
			"debugInfo": I18NMessage,
			"invalidatedTabs": I18NMessage,
			"insufficientPermissions": I18NMessage,
			"registeringConsoleInterface": I18NMessage,
			"done": I18NMessage,
			"resourceUpdate": I18NMessage,
			"initialization": I18NMessage,
			"storage": I18NMessage,
			"resources": I18NMessage,
			"previousOpenTabs": I18NMessage,
			"backgroundpages": I18NMessage,
			"debugging": I18NMessage
		},
		"storages": {
			"syncUploadError": I18NMessage,
			"localUploadError": I18NMessage,
			"upgrading": I18NMessage,
			"settingGlobalData": I18NMessage,
			"buildingCrm": I18NMessage,
			"loadingSync": I18NMessage,
			"loadingLocal": I18NMessage,
			"checkingFirst": I18NMessage,
			"parsingData": I18NMessage,
			"checkingUpdates": I18NMessage,
			"initializingFirst": I18NMessage
		},
		"logging": {
			"background": I18NMessage,
			"backgroundPage": I18NMessage
		}
	},
	"install": {
		"confirm": {
			"installed": I18NMessage,
			"description": I18NMessage,
			"author": I18NMessage,
			"source": I18NMessage,
			"permissions": I18NMessage,
			"permissionInfo": I18NMessage,
			"allow": I18NMessage,
			"noneRequired": I18NMessage,
			"none": I18NMessage,
			"toggleAll": I18NMessage,
			"allowAccept": I18NMessage,
			"install": I18NMessage,
			"notAsking": I18NMessage
		},
		"error": {
			"notFound1": I18NMessage,
			"notFound2": I18NMessage
		},
		"page": {
			"fetching": I18NMessage,
			"failedXhr": I18NMessage,
			"installing": I18NMessage
		}
	},
	"logging": {
		"filter": I18NMessage,
		"description": I18NMessage,
		"lines": I18NMessage,
		"runningCodeNotPossible": I18NMessage,
		"storeAsLocal": I18NMessage,
		"logThis": I18NMessage,
		"copyAsJson": I18NMessage,
		"copyPath": I18NMessage,
		"clearConsole": I18NMessage,
		"tabClosed": I18NMessage,
		"somethingWentWrong": I18NMessage,
		"logs": I18NMessage
	},
	"util": {
		"errorReportingTool": {
			"finish": I18NMessage,
			"title": I18NMessage,
			"description": I18NMessage,
			"bugreportInfo": I18NMessage,
			"pageCapture": I18NMessage,
			"reportingBug": I18NMessage,
			"suggestingFeature": I18NMessage,
			"submit": I18NMessage,
			"messagePlaceholder": I18NMessage,
			"titlePlaceholder": I18NMessage
		}
	},
	"options": {
		"nodeEditBehavior": {
			"globPattern": I18NMessage,
			"matchPattern": I18NMessage
		},
		"crmEditPage": {
			"createdBy": I18NMessage,
			"installedFrom": I18NMessage,
			"createdByYou": I18NMessage,
			"hasAllPermissions": I18NMessage,
			"createdOn": I18NMessage,
			"installedOn": I18NMessage
		},
		"defaultLink": {
			"name": I18NMessage
		},
		"editCrm": {
			"empty": I18NMessage,
			"addHere": I18NMessage,
			"addNodeType": I18NMessage,
			"select": I18NMessage,
			"exportSelected": I18NMessage,
			"removeSelected": I18NMessage,
			"menuRemoveWarning": I18NMessage,
			"dragInfo": I18NMessage,
			"typeInfo": I18NMessage,
			"editInfo": I18NMessage,
			"menuInfo": I18NMessage,
			"editItem": I18NMessage,
			"addFail": I18NMessage
		},
		"editCrmItem": {
			"changeType": I18NMessage,
			"dragNode": I18NMessage,
			"clickToShowChildren": I18NMessage,
			"clickToShowXChildren": I18NMessage,
			"clickToShowChild": I18NMessage,
			"rootName": I18NMessage,
			"clickToEditRoot": I18NMessage,
			"nodeHidden": I18NMessage,
			"clickToEdit": I18NMessage
		},
		"tools": {
			"paperGetPageProperties": {
				"selection": I18NMessage,
				"host": I18NMessage,
				"path": I18NMessage,
				"protocol": I18NMessage,
				"width": I18NMessage,
				"height": I18NMessage,
				"scrolled": I18NMessage,
				"title": I18NMessage,
				"clickedElement": I18NMessage
			},
			"paperLibrariesSelector": {
				"libraryInfo": I18NMessage,
				"libraries": I18NMessage,
				"anonymous": I18NMessage,
				"addOwn": I18NMessage,
				"xhrFailedMsg": I18NMessage,
				"xhrFailed": I18NMessage,
				"nameTaken": I18NMessage,
				"nameMissing": I18NMessage,
				"editing": I18NMessage,
				"pleaseUpdate": I18NMessage
			},
			"paperSearchWebsiteDialog": {
				"title": I18NMessage,
				"description": I18NMessage,
				"inputOne": I18NMessage,
				"inputDefault": I18NMessage,
				"chooseDefault": I18NMessage,
				"try": I18NMessage,
				"manualInput": I18NMessage,
				"findingSearchURL": I18NMessage,
				"chooseFromList": I18NMessage,
				"goToWebsite": I18NMessage,
				"clickOmnibar": I18NMessage,
				"pasteHere": I18NMessage,
				"invalidInput": I18NMessage,
				"process": I18NMessage,
				"processedTitle": I18NMessage,
				"choose": I18NMessage,
				"confirmTitle": I18NMessage,
				"searchQuery": I18NMessage,
				"query": I18NMessage,
				"testURL": I18NMessage,
				"howOpenTitle": I18NMessage,
				"newTab": I18NMessage,
				"currentTab": I18NMessage,
				"added": I18NMessage,
				"enterSearchQuery": I18NMessage,
				"selectSomething": I18NMessage
			}
		},
		"editPages": {
			"generic": {
				"name": I18NMessage,
				"contentType": I18NMessage,
				"contentTypeTitle": I18NMessage,
				"showOnSpecified": I18NMessage,
				"showOn": I18NMessage,
				"regexDescr": I18NMessage,
				"not": I18NMessage,
				"matchPattern": I18NMessage,
				"invalidURLPattern": I18NMessage,
				"changeType": I18NMessage
			},
			"link": {
				"linkLabel": I18NMessage,
				"currentTab": I18NMessage
			},
			"metadata": {
				"name": I18NMessage,
				"namespace": I18NMessage,
				"version": I18NMessage,
				"author": I18NMessage,
				"description": I18NMessage,
				"homepage": I18NMessage,
				"homepageURL": I18NMessage,
				"website": I18NMessage,
				"source": I18NMessage,
				"icon": I18NMessage,
				"iconURL": I18NMessage,
				"defaulticon": I18NMessage,
				"icon64": I18NMessage,
				"icon64URL": I18NMessage,
				"updateURL": I18NMessage,
				"downloadURL": I18NMessage,
				"supportURL": I18NMessage,
				"include": I18NMessage,
				"match": I18NMessage,
				"exclude": I18NMessage,
				"require": I18NMessage,
				"resource": I18NMessage,
				"connect": I18NMessage,
				"runAt": I18NMessage,
				"grant": I18NMessage,
				"noframes": I18NMessage,
				"CRMContentTypes": I18NMessage,
				"CRMLaunchMode": I18NMessage,
				"CRMStylesheet": I18NMessage,
				"CRMToggle": I18NMessage,
				"CRMDefaultOn": I18NMessage,
				"CRMLibraries": I18NMessage,
				"license": I18NMessage,
				"preprocessor": I18NMessage,
				"var": I18NMessage
			},
			"monaco": {
				"startTagUserscript": I18NMessage,
				"endTagUserscript": I18NMessage,
				"startTagUserstyle": I18NMessage,
				"endTagUserstyle": I18NMessage,
				"scriptStart": I18NMessage,
				"scriptEnd": I18NMessage,
				"styleStart": I18NMessage,
				"styleEnd": I18NMessage,
				"metaKey": I18NMessage,
				"disableMeta": I18NMessage,
				"enableMeta": I18NMessage,
				"keyDescription": I18NMessage,
				"keyDescriptionUnknown": I18NMessage,
				"valueForKey": I18NMessage,
				"disableUnderline": I18NMessage,
				"enableUnderline": I18NMessage,
				"optionName": I18NMessage,
				"numberOption": I18NMessage,
				"minValue": I18NMessage,
				"maxValue": I18NMessage,
				"descr": I18NMessage,
				"defaultValue": I18NMessage,
				"value": I18NMessage,
				"valueExpanded": I18NMessage,
				"stringOption": I18NMessage,
				"maxLength": I18NMessage,
				"format": I18NMessage,
				"choiceOption": I18NMessage,
				"selected": I18NMessage,
				"values": I18NMessage,
				"colorOption": I18NMessage,
				"booleanOption": I18NMessage,
				"arrayOption": I18NMessage,
				"maxItems": I18NMessage,
				"items": I18NMessage,
				"lintingDisabled": I18NMessage,
				"monacoError": I18NMessage
			},
			"script": {
				"autoUpdate": I18NMessage,
				"permissions": I18NMessage,
				"manage": I18NMessage,
				"script": I18NMessage,
				"docs": I18NMessage,
				"scriptMain": I18NMessage,
				"scriptBackground": I18NMessage,
				"scriptOptions": I18NMessage,
				"scriptLibraries": I18NMessage,
				"showBackgroundLibs": I18NMessage,
				"crmNode": I18NMessage,
				"userScript": I18NMessage
			},
			"code": {
				"triggers": I18NMessage,
				"triggerOnClick": I18NMessage,
				"triggerAlways": I18NMessage,
				"triggerSpecified": I18NMessage,
				"triggerShowOnSpecified": I18NMessage,
				"triggerDisabled": I18NMessage,
				"showOn": I18NMessage,
				"executeOn": I18NMessage,
				"triggerInfo": I18NMessage,
				"backgroundInfo": I18NMessage,
				"optionsInfo": I18NMessage,
				"settings": I18NMessage,
				"theme": I18NMessage,
				"fontSize": I18NMessage,
				"globals": I18NMessage,
				"keyBindings": I18NMessage,
				"goToDef": I18NMessage,
				"rename": I18NMessage,
				"exportAs": I18NMessage
			},
			"stylesheet": {
				"togglable": I18NMessage,
				"onByDefault": I18NMessage,
				"toggleInfo": I18NMessage,
				"stylesheet": I18NMessage,
				"optionsInfo": I18NMessage,
				"stylusInfo": I18NMessage
			}
		},
		"typeSwitcher": {
			"title": I18NMessage
		}
	}
}