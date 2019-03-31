// import { LocaleSpec } from '../i18n';

interface I18NMessage {
	message: string;
	description?: string;
	placeholders?: {
		[key: string]: {
			content: string;
			example?: string;
		}
	}
}

type I18NRoot = {
	[key: string]: I18NRoot|I18NMessage;
}

export const Messages: I18NRoot = {
	app_title: {
		message: "Custom Right-Click Menu",
		description: "The name of the extension"
	},
	langs: {
		en: {
			message: "English",
			description: "The english language"
		},
		selector: {
			current: {
				message: "current",
				description: "Word to signal this is the currently selected item, example: \"english, current\""
			},
			clickToChangeLanguage: {
				message: "Click here to change your language",
				description: "Used for a button that will allow you to change your language on click"
			},
			requestLanguage: {
				message: "Request a language or consider translating into yours",
				description: "Requesting a new language and/or translating into your native one"
			}
		}
	},
	crm_app: {
		editcrm: {
			editingCrm: {
				message: "Editing the CRM",
				description: "Title for edit-crm section"
			}
		},
		ribbons: {
			ts: {
				message: "TS",
				description: "The typescript icon"
			},
			tslint: {
				message: "Run TSLint",
				description: "Runs the TSLint checker"
			},
			jslint: {
				message: "Run JSLint",
				description: "Runs the JSLint checker"
			},
			info: {
				message: "Info",
				description: "An info button"
			}
		},
		editor: {
			settings: {
				header: {
					message: "Editor Settings",
					description: "Title header for the settings for the CRM editor"
				},
				theme: {
					message: "Theme",
					description: "The theme setting's name"
				},
				fontsizePercentage: {
					message: "Font size %",
					description: "The font size option with a % behind it"
				},
				jslintGlobals: {
					message: "Comma separated list of JSLint globals",
					description: "Description of the jslint globals option which requires a comma separated list of global values"
				},
				keybindings: {
					message: "Key Bindings",
					description: "The key bindings option"
				}
			}
		},
		header: {
			oldChrome: {
				message: "You are using a very old version of Chrome ($version$ years old). Some features may perform worse or not at all. Please consider updating your chrome",
				description: "Description telling the user that their chrome version is $version$ years old and that it might not work that well and they should consider updating.",
				placeholders: {
					version: {
						content: "$1",
						example: "6"
					}
				}
			}
		},
		crmtype: {
			toggle: {
				message: "Toggle showing items that are visible when right-clicking on $contenttype$",
				description: "Clicking this button will toggle visibility of given content-type",
				placeholders: {
					contenttype: {
						content: "$1",
						example: "regular webpages, web links, selected"
					}
				}
			},
			regularWebpages: {
				message: "regular webpages",
				description: "A longer description for webpages"
			},
			webpages: {
				message: "Webpages",
				description: "A short description for webpages"
			},
			weblinks: {
				message: "weblinks",
				description: "A short description for weblinks (HTML anchor elements)"
			},
			selectedText: {
				message: "selected text",
				description: "A short description selected text (a selection)"
			},
			selection: {
				message: "selection",
				description: "A short description for a block of selected text"
			},
			images: {
				message: "images",
				description: "A description for images/pictures"
			},
			videos: {
				message: "videos",
				description: "A description for videos"
			},
			audio: {
				message: "audio",
				description: "A description for audio elements (music, mp3 etc)"
			}
		},
		options: {
			header: {
				message: "Options",
				description: "The options section's header"
			},
			catchErrors: {
				message: "Catch errors in scripts and log them. If off, allows for easier debugging using your browser's \"pause on exceptions\", if on, allows for custom handling.",
				description: "See message"
			},
			showoptions: {
				message: "Show options link in right-click menu",
				description: "The option to show the \"options\" link to the options page in the right-click menu"
			},
			recoverUnsavedData: {
				message: "Prompt you with an option to recover your unsaved script after you close a script/stylesheet without hitting the \"save\" or \"exit\" button.",
				description: "See message"
			},
			CRMOnPage: {
				disabled: {
					message: "Can't disable demo contextmenu in demo mode",
					description: "Reason the CRMOnPage options is disabled"
				},
				option: {
					message: "Use your custom right-click menu on this page as a preview instead of your browser's regular one.",
					description: "See message"
				}
			},
			useStorageSync: {
				disabled: {
					unavailable: {
						message: "Syncing is not available in your browser",
						description: "Reason the useStorageSync option is disabled. Reason is because the browser.storage.sync API is not available in the user's browser"
					},
					tooBig: {
						message: "Amount of data is too big to sync",
						description: "Reason the useStorageSync option is disabled. Reason is because the sync storage is full"
					}
				},
				option: {
					message: "Sync your storage across all browser instances signed in to this account using browser storage sync. Turning this on will limit your total CRM size (including scripts, excluding libraries) to a total of 102,400 bytes. Currently using",
					description: "See message"
				}
			},
			editCRMInRM: {
				message: "Edit the custom right-click Menu by clicking on the respective elements when right-clicking on this page",
				description: "See message"
			},
			bytes: {
				message: "bytes",
				description: "The bytes unit. Example: 10000 {bytes}"
			}
		}
	}
}