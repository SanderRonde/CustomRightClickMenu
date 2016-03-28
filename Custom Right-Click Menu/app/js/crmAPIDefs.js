window.crmAPIDefs = {
	"!name": "crmAPI",
	"crmAPI": {
		"stackTraces": {
			"!type": "bool",
			"!doc": "When true, shows stacktraces on error in the console of the page the script runs on, true by default.",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js"
		},
		"errors": {
			"!type": "bool",
			"!doc": "If true, throws an error when one of your crmAPI calls is incorrect (such as a type mismatch or any other fail). True by default.",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js"
		},
		"comm": {
			"!doc": "The communications API used to communicate with other scripts and other instances",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"getInstances": {
				"!type": "fn() -> [instance]",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Returns all instances running in other tabs, these instances can be passed to the .comm.sendMessage function to send a message to them, you can also call instance.sendMessage on them"
			},
			"sendMessage": {
				"!type": "fn(instance: instance, message: ?, callback: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Sends a message to given instance"
			},
			"addListener": {
				"!type": "fn(listener: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Adds a listener for any comm-messages sent from other instances of this script"
			},
			"removeListener": {
				"!type": "fn(listener: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Adds a listener for any comm-messages sent from other instances of this script"
			}
		},
		"storage": {
			"!doc": "The storage API used to store and retrieve data for this script",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"get": {
				"!type": "fn(keyPath?: string|array) -> any",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the value at given key, if no key is given returns the entire storage object"
			},
			"set": {
				"!type": "fn(keyPath: string|array, value: any)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Sets the data at given key to given value"
			},
			"remove": {
				"!type": "fn(keyPath: string|array)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Deletes the data at given key given value"
			},
			"onChange": {
				"!type": "fn(keyPath: string|array)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Deletes the data at given key given value",
				"addListener": {
					"!type": "fn(listener: function, key?: string)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Adds an onchange listener for the storage, listens for a key if given"
				},
				"removeListener": {
					"!type": "fn(listener: function, key?: string)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Removes ALL listeners with given listener (function) as the listener, if key is given also checks that they have that key"
				}
			}
		},
		"getSelection": {
			"!type": "fn() -> string",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"!doc": "Gets the current text selection"
		},
		"getClickInfo": {
			"!type": "fn() -> ?",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"!doc": "Returns any data about the click on the page, check (https://developer.chrome.com/extensions/contextMenus#method-create) for more info of what can be returned."
		},
		"getTabInfo": {
			"!type": "fn() -> ?",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"!doc": "Gets any info about the current tab/window"
		},
		"getNode": {
			"!type": "fn() -> ?",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"!doc": "Gets the current node"
		},
		"crm": {
			"!doc": "The crm API, used to make changes to the crm, some API calls may require permissions crmGet and crmWrite",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"getTree": {
				"!type": "fn(callback: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the CRM tree from the tree's root - requires permission \"crmGet\""
			},
			"getSubTree": {
				"!type": "fn(nodeId: number, callback: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the CRM's tree from either the root or from the node with ID nodeId - requires permission \"crmGet\""
			},
			"getNode": {
				"!type": "fn(callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the node with ID nodeId - requires permission \"crmGet\""
			},
			"getNodeIdFromPath": {
				"!type": "fn(path: [number], callback: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets a node's ID from a path to the node - requires permission \"crmGet\""
			},
			"queryCrm": {
				"!type": "fn(callback: crmCallback, query: ?, callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Queries the CRM for any items matching your query - requires permission \"crmGet\""
			},
			"getParentNode": {
				"!type": "fn(nodeId: number, callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the parent of the node with ID nodeId - requires permission \"crmGet\""
			},
			"getChildren": {
				"!type": "fn(nodeId: number, callback: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the children of the node with ID nodeId - requires permission \"crmGet\""
			},
			"getNodeType": {
				"!type": "fn(nodeId: number, callback: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the type of node with ID nodeId - requires permission \"crmGet\""
			},
			"getNodeValue": {
				"!type": "fn(nodeId: number, callback: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the value of node with ID nodeId - requires permission \"crmGet\""
			},
			"createNode": {
				"!type": "fn(options: ?, callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Creates a node with the given options - requires permission \"crmGet\" and \"crmWrite\""
			},
			"copyNode": {
				"!type": "fn(nodeId: number, options: ?, callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Copies given node, - requires permission \"crmGet\" and \"crmWrite\" WARNNG: following properties are not copied: file, storage, id, permissions, nodeInfo Full permissions rights only if both the to be cloned and the script executing this have full rights"
			},
			"moveNode": {
				"!type": "fn(nodeId: number, position?: ?, callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Moves given node to position specified in \"position\" - requires permission \"crmGet\" and \"crmWrite\""
			},
			"deleteNode": {
				"!type": "fn(nodeId: number, callback: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Deletes given node - requires permission \"crmGet\" and \"crmWrite\""
			},
			"editNode": {
				"!type": "fn(nodeId: number, options: ?, callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Edits given settings of the node - requires permission \"crmGet\" and \"crmWrite\""
			},
			"getTriggers": {
				"!type": "fn(nodeId: number, callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the triggers for given node - requires permission \"crmGet\""
			},
			"setTriggers": {
				"!type": "fn(nodeId: number, triggers: [?], callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Sets the triggers for given node - requires permissions \"crmGet\" and \"crmSet\""
			},
			"stylesheet": {
				"!doc": "All functions related specifically to the stylesheet type",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"getTriggerUsage": {
					"!type": "fn(nodeId: number, callback: crmCallback)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Gets the trigger' usage for given node (true - it's being used, or false), only works on link, menu and divider - requires permission \"crmGet\""
				},
				"setTriggerUsage": {
					"!type": "fn(nodeId: number, useTriggers: bool, callback: crmCallback)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Sets the usage of triggers for given node, only works on link, menu and divider - requires permissions \"crmGet\" and \"crmSet\""
				}
			},
			"getContentTypes": {
				"!type": "fn(nodeId: number, callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Gets the content types for given node - requires permission \"crmGet\""
			},
			"setContentType": {
				"!type": "fn(nodeId: number, index: number, value: bool, callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Sets the content type at index \"index\" to given value \"value\"- requires permissions \"crmGet\" and \"crmWrite\""
			},
			"setContentTypes": {
				"!type": "fn(nodeId: number, contentTypes: [string], callback: crmCallback)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Sets the content types to given contentTypes array - requires permissions \"crmGet\" and \"crmWrite\""
			},
			"link": {
				"!doc": "All functions related specifically to the link type",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"getLinks": {
					"!type": "fn(nodeId: number, callback: function)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Gets the links of the node with ID nodeId - requires permission \"crmGet\""
				},
				"push": {
					"!type": "fn(nodeId: number, items: [?]|?, callback: functon)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Pushes given items into the array of URLs of node with ID nodeId - requires permission \"crmGet\" and \"crmWrite\""
				},
				"splice": {
					"!type": "fn(nodeId: number, start: nunber, amount: nunber, callback: function)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Splices the array of URLs of node with ID nodeId. Start at \"start\" and splices \"amount\" items (just like array.splice) and returns them as an array in the callback function - requires permission \"crmGet\" and \"crmWrite\""
				}
			},
			"script": {
				"!doc": "All functions related specifically to the script type",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"setLaunchMode": {
					"!type": "fn(nodeId: number, launchMode: number, callback: crmCallback)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Sets the launch mode of node with ID nodeId to \"launchMode\" - requires permission \"crmGet\" and \"crmWrite\""
				},
				"getLaunchMode": {
					"!type": "fn(nodeId: number, callback: function)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Gets the launchMode of the node with ID nodeId - requires permission \"crmGet\""
				},
				"libraries": {
					"!doc": "All functions related specifically to the script's libraries",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"push": {
						"!type": "fn(nodeId: number, libraries: [?]|?, callback: function)",
						"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
						"!doc": "Pushes given libraries to the node with ID nodeId's libraries array, make sure to register them first or an error is thrown - requires permission \"crmGet\" and \"crmWrite\""
					},
					"splice": {
						"!type": "fn(nodeId: number, start: nunber, amount: nunber, callback: function)",
						"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
						"!doc": "Splices the array of libraries of node with ID nodeId. Start at \"start\" and splices \"amount\" items (just like array.splice) and returns them as an array in the callback function - requires permission \"crmGet\" and \"crmWrite\""
					}
				},
				"setScript": {
					"!type": "fn(nodeId: number, value: string, callback: crmCallback)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Sets the script of node with ID nodeId to value \"script\" - requires permission \"crmGet\" and \"crmWrite\""
				},
				"getScript": {
					"!type": "fn(nodeId: number, callback: function)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Gets the value of the script - requires permission \"crmGet\""
				}
			},
			"menu": {
				"!doc": "All functions related specifically to the menu type",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"getChildren": {
					"!type": "fn(nodeId: number, callback: crmCallback)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Gets the children of the node with ID nodeId - requires permission \"crmGet\""
				},
				"setChildren": {
					"!type": "fn(nodeId: number, childrenIds: [number], callback: crmCallback)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Sets the children of node with ID nodeId to the nodes with IDs childrenIds - requires permission \"crmGet\" and \"crmWrite\""
				},
				"push": {
					"!type": "fn(nodeId: number, childrenIds: [number], callback: crmCallback)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Pushes the nodes with IDs childrenIds to the node with ID nodeId - requires permission \"crmGet\" and \"crmWrit\""
				},
				"splice": {
					"!type": "fn(nodeId: number, start: number, amount: number, callback: function)",
					"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
					"!doc": "Splices the children of the node with ID nodeId, starting at \"start\" and splicing \"amount\" items, the removed items will be put in the root of the tree instead - requires permission \"crmGet\" and \"crmWrite\""
				}
			}
		},
		"libraries": {
			"!doc": "The libraries API used to register libraries, requires permission crmWrite",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"register": {
				"!type": "fn(name: string, options: ?, callback: function)",
				"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
				"!doc": "Registers a library with name \"name\", requires permission \"crmWrite\""
			}
		},
		"chrome": {
			"!type": "fn(api: string) -> ?",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"!doc": "Calls the chrome API given in the \"API\" parameter. Due to some issues with the chrome message passing API it is not possible to pass messages and preserve scope. This could be fixed in other ways but unfortunately chrome.tabs.executeScript (what is used to execute scripts on the page) runs in a sandbox and does not allow you to access a lot. As a solution to this there are a few types of functions you can chain-call on the crmAPI.chrome(API) object: args: uses given arguments as arguments for the API in order specified. WARNING this can NOT be a function, for functions refer to the other two types. fn: a function that will preserve scope but is not passed to the chrome API itself. Instead a placeholder is passed that will take any arguments the chrome API passes to it and calls your fn function, that you can use with local scope, with a container argument. Keep in mind that there is no conection between your function and the chrome API, the chrome API only sees a placeholder function with which it can do nothing so don't use this as say a forEach handler. return: a function that is called with the value that the chrome API returned. This can be used for APIs that don't use callbacks and instead just return values such as chrome.runtime.getURL(). This just like fn returns a container argument for all diferent values where \"APIVal\" is the value the API returned instead of APIArgs being used. send: executes the request Examples: - For a function that uses callback, this is NOT the actual use of the chrome.runtime.getPlatformInfo API crmAPI.chrome('runtime.getPlatformInfo').args({ message: 'hello' }).fn(function(result1, resul2) { console.log(result1); console.log(result2); }).args(parameter).args(parameter1, parameter2).fn(function(result) { console.log(result); }).send(); - - For a function that returns a value, this is NOT how to actually use the chrome.runtime.getUrl API crmAPI.chrome('runtime.getURL').args('url.html').args(parameter).fn(function(result) { console.log(result); }).return(function(result) { console.log(result); }).send(); - - Actual real-use examples crmAPI.chrome('tabs.create').args(properties).fn(function(result) { console.log(result); }).send(); crmAPI.chrome('runtime.getUrl').args(path).return(function(result) { console.log(result); }).send(); Requires permission \"chrome\" and the permission of the the API, so chrome.bookmarks requires permission \"bookmarks\", chrome.alarms requires \"alarms\""
		},
		"GM": {
			"!doc": "The GM API that fills in any APIs that GreaseMonkey uses and points them to their CRM counterparts",
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"GM_info": {
				"!type": "fn() -> ?",
				"!url": "https://tampermonkey.net/documentation.php#GM_info",
				"!doc": "Returns any info about the script"
			},
			"GM_getValue": {
				"!type": "fn(name: string, defaultValue?: any) -> any",
				"!url": "https://tampermonkey.net/documentation.php#GM_getValue",
				"!doc": "This method retrieves a value that was set with GM_setValue. See GM_setValue for details on the storage of these values."
			},
			"GM_setValue": {
				"!type": "fn(name: string, value: any)",
				"!url": "https://tampermonkey.net/documentation.php#GM_setValue",
				"!doc": "This method allows user script authors to persist simple values across page-loads."
			},
			"GM_deleteValue": {
				"!type": "fn(name: string)",
				"!url": "https://tampermonkey.net/documentation.php#GM_deleteValue",
				"!doc": "This method deletes an existing name / value pair from storage."
			},
			"GM_listValues": {
				"!type": "fn() -> [string]",
				"!url": "https://tampermonkey.net/documentation.php#GM_listValues",
				"!doc": "This method retrieves an array of storage keys that this script has stored."
			},
			"GM_getResourceURL": {
				"!type": "fn(name: string) -> string",
				"!url": "https://tampermonkey.net/documentation.php#GM_getResourceURL",
				"!doc": "Gets the resource URL for given resource name"
			},
			"GM_getResourceString": {
				"!type": "fn(name: string) -> string",
				"!url": "https://tampermonkey.net/documentation.php#GM_getResourceString",
				"!doc": "Gets the resource string for given resource name"
			},
			"GM_addStyle": {
				"!type": "fn(css: string)",
				"!url": "https://tampermonkey.net/documentation.php#GM_addStyle",
				"!doc": "This method adds a string of CSS to the document. It creates a new <style> element, adds the given CSS to it, and inserts it into the <head>."
			},
			"GM_log": {
				"!type": "fn(any: any)",
				"!url": "https://tampermonkey.net/documentation.php#GM_log",
				"!doc": "Logs to the console"
			},
			"GM_openInTab": {
				"!type": "fn(url: string)",
				"!url": "https://tampermonkey.net/documentation.php#GM_openInTab",
				"!doc": "Open specified URL in a new tab, open_in_background is not available here since that not possible in chrome"
			},
			"GM_registerMenuCommand": {
				"!type": "fn(ignoredArguments: any)",
				"!url": "https://tampermonkey.net/documentation.php#GM_registerMenuCommand",
				"!doc": "This is only here to prevent errors from occuring when calling any of these functions, this function does nothing"
			},
			"GM_unregisterMenuCommand": {
				"!type": "fn(ignoredArguments: any)",
				"!url": "https://tampermonkey.net/documentation.php#GM_unregisterMenuCommand",
				"!doc": "This is only here to prevent errors from occuring when calling any of these functions, this function does nothing"
			},
			"GM_setClipboard": {
				"!type": "fn(ignoredArguments: any)",
				"!url": "https://tampermonkey.net/documentation.php#GM_setClipboard",
				"!doc": "This is only here to prevent errors from occuring when calling any of these functions, this function does nothing"
			},
			"GM_xmlhttpRequest": {
				"!type": "fn(options: ?)",
				"!url": "https://tampermonkey.net/documentation.php#GM_xmlhttpRequest",
				"!doc": "Sends an xmlhttpRequest with given parameters"
			},
			"GM_addValueChangeListener": {
				"!type": "fn(name: string, callback: function) -> number",
				"!url": "https://tampermonkey.net/documentation.php#GM_addValueChangeListener",
				"!doc": "Adds a change listener to the storage and returns the listener ID. 'name' is the name of the observed variable. The 'remote' argument of the callback function shows whether this value was modified from the instance of another tab (true) or within this script instance (false). Therefore this functionality can be used by scripts of different browser tabs to communicate with each other."
			},
			"GM_removeValueChangeListener": {
				"!type": "fn(listenerId: number)",
				"!url": "https://tampermonkey.net/documentation.php#GM_removeValueChangeListener",
				"!doc": "Removes a change listener by its ID."
			},
			"GM_download": {
				"!type": "fn(detailsOrUrl: string|?, name: string)",
				"!url": "https://tampermonkey.net/documentation.php#GM_GM_download",
				"!doc": "Downloads the file at given URL"
			},
			"GM_getTab": {
				"!type": "fn(callback: function)",
				"!url": "https://tampermonkey.net/documentation.php#GM_getTab",
				"!doc": "Please use the comms API instead of this one"
			},
			"GM_getTabs": {
				"!type": "fn(callback: function)",
				"!url": "https://tampermonkey.net/documentation.php#GM_getTabs",
				"!doc": "Please use the comms API instead of this one"
			},
			"GM_saveTab": {
				"!type": "fn(ignoredArguments: any)",
				"!url": "https://tampermonkey.net/documentation.php#GM_saveTab",
				"!doc": "Please use the comms API instead of this one, this one does nothing"
			},
			"unsafeWindow": {
				"!doc": "The unsafeWindow object provides full access to the pages javascript functions and variables.",
				"!url": "https://tampermonkey.net/documentation.php#unsafeWindow"
			},
			"GM_notification": {
				"!type": "fn(text: string, title: string, image: string, onclick: function)",
				"!url": "https://tampermonkey.net/documentation.php#GM_notification",
				"!doc": "Shows a HTML5 Desktop notification and/or highlight the current tab."
			},
			"GM_installScript": {
				"!type": "fn(ignoredArguments: any)",
				"!url": "https://tampermonkey.net/documentation.php#GM_installScript",
				"!doc": "THIS FUNCTION DOES NOT WORK AND IS DEPRECATED"
			}
		}
	},
	"!define": {
		"crmNode": {
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"id": "number",
			"index": "number",
			"name": "string",
			"type": "string",
			"children": "CrmAPIInit~[crmNode]",
			"nodeInfo": "?",
			"path": "[number]",
			"onContentTypes": "[bool]",
			"permissions": "[string]",
			"url": "string",
			"triggers": "[?]",
			"linkVal": "CrmAPIInit~linkVal",
			"scriptVal": "CrmAPIInit~scriptVal",
			"menuVal": "[?]"
		},
		"linkVal": {
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"value": "[?]",
			"showOnSpecified": "bool",
			"!proto": "CrmAPIInit~crmNode"
		},
		"scriptVal": {
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"value": "?",
			"libraries": "[?]",
			"!proto": "CrmAPIInit~crmNode"
		},
		"stylesheetVal": {
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"value": "?",
			"!proto": "CrmAPIInit~crmNode"
		},
		"menuVal": {
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"showOnSpecified": "bool",
			"!proto": "CrmAPIInit~crmNode"
		},
		"dividerVal": {
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"showOnSpecified": "bool",
			"!proto": "CrmAPIInit~crmNode"
		},
		"crmCallback": {
			"!url": "https://github.com/SanderRonde/CustomRightClickMenu/blob/master/Custom%20Right-Click%20Menu/app/js/crmapi.js",
			"node": "CrmAPIInit~crmNode"
		}
	}
}
