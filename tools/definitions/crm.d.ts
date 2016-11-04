type CRMPermission = 'crmGet' | 'crmWrite' | 'chrome';

interface CRMNodeInfo {
	installDate?: string;
	isRoot?: boolean;
	permissions: Array<CRMPermission|string>;
	source: {
		updateURL?: string;
		downloadURL?: string;
		url?: string;
		author?: string;
	};
	version?: string;
	lastUpdatedAt?: string;
}

declare enum CRMLaunchMode {
	RUN_ON_CLICKING = 0,
	ALWAYS_RUN = 1,
	RUN_ON_SPECIFIED = 2,
	SHOW_ON_SPECIFIED = 3,
	DISABLED = 4
}

declare enum TypecheckOptional {
	OPTIONAL = 1,
	REQUIRED = 0
}

/**
 * True means show on given type. ['page','link','selection','image','video','audio']
 */
type CRMContentTypes = [boolean, boolean, boolean, boolean, boolean, boolean];

interface CRMTrigger {
	/**
	 * 	The URL of the site on which to run,
	 * 	if launchMode is 2 aka run on specified pages can be any of these
	 * 	https://wiki.greasespot.net/Include_and_exclude_rules
	 * 	otherwise the url should match this pattern, even when launchMode does not exist on the node (links etc) 
	 * 	https://developer.chrome.com/extensions/match_patterns
	 */
	url: string;
	/**
	 * If true, does NOT run on given site
	 *
	 * @type {boolean}
	 */
	not: boolean;
}

type CRMTriggers = Array<CRMTrigger>;

interface CRMLibrary {
	name: string;
}

type MetaTags = { [key: string]: Array<string|number> };

type NodeType = 'script'|'link'|'divider'|'menu'|'stylesheet';

interface SafeCRMBaseNode {
	id: number;
	index?: number;
	path: Array<number>;
	name: string;
	type: NodeType;
	nodeInfo: CRMNodeInfo;
	storage: any;
	onContentTypes: CRMContentTypes;
	permissions: Array<CRMPermission>;
	triggers: CRMTriggers;
	value?: any;
}

interface CRMBaseNode extends SafeCRMBaseNode {
	index?: number;
	isLocal?: boolean;
	children?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
}

interface ScriptVal {
	launchMode: CRMLaunchMode;
	script: string;
	backgroundScript: string;
	metaTags: MetaTags;
	libraries: Array<CRMLibrary>;
	backgroundLibraries: Array<CRMLibrary>;
}

interface StylesheetVal {
	launchMode: CRMLaunchMode;
	stylesheet: string;
	toggle: boolean;
	defaultOn: boolean;
}

interface LinkNodeLink {
	url: string;
	newTab: boolean;
}

type LinkVal = Array<LinkNodeLink>

interface PassiveCRMNode extends CRMBaseNode {
	showOnSpecified: boolean;
	isLocal: boolean;
	children: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
}

interface ScriptNode extends CRMBaseNode {
	type: NodeType;
	value: ScriptVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	stylesheetVal?: StylesheetVal;
}

interface StylesheetNode extends CRMBaseNode {
	type: NodeType;
	value: StylesheetVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
}

interface LinkNode extends PassiveCRMNode {
	value: LinkVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface MenuNode extends PassiveCRMNode {
	children: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface DividerNode extends PassiveCRMNode {
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface SafeScriptNode extends SafeCRMBaseNode {
	type: NodeType;
	value: ScriptVal;
	menuVal?: Array<SafeCRMNode>;
	linkVal?: LinkVal;
	stylesheetVal?: StylesheetVal;
}

interface SafeStylesheetNode extends SafeCRMBaseNode {
	type: NodeType;
	value: StylesheetVal;
	menuVal?: Array<SafeCRMNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
}

interface SafePassiveCRMNode extends SafeCRMBaseNode {
	showOnSpecified: boolean;
}

interface SafeLinkNode extends SafePassiveCRMNode {
	value: LinkVal;
	menuVal?: Array<SafeCRMNode>;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface SafeMenuNode extends SafePassiveCRMNode {
	children: Array<SafeCRMNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface SafeDividerNode extends SafePassiveCRMNode {
	menuVal?: Array<SafeCRMNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

type SafeCRMNode = SafeDividerNode | SafeMenuNode | SafeLinkNode | SafeStylesheetNode | SafeScriptNode;

interface PartialCRMBaseNode {
	showOnSpecified?: boolean;
	isLocal?: boolean;
	children?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	id?: number;
	index?: number;
	path?: Array<number>;
	name?: string;
	type?: NodeType;
	nodeInfo?: CRMNodeInfo;
	storage?: any;
	onContentTypes?: CRMContentTypes;
	permissions?: Array<CRMPermission|string>;
	triggers?: CRMTriggers;
	value?: any;
}

interface PartialPassiveCRMNode extends PartialCRMBaseNode {
	index?: number;
	isLocal?: boolean;
	children?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
}

interface PartialScriptNode extends PartialCRMBaseNode {
	type?: NodeType;
	value?: ScriptVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	stylesheetVal?: StylesheetVal;
}

interface PartialStylesheetNode extends PartialCRMBaseNode {
	type?: NodeType;
	value?: StylesheetVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
}

interface PartialLinkNode extends PartialPassiveCRMNode {
	value?: LinkVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface PartialMenuNode extends PartialPassiveCRMNode {
	children?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface PartialDividerNode extends PartialPassiveCRMNode {
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

type PartialCRMNode = PartialDividerNode | PartialMenuNode | PartialLinkNode |
	PartialStylesheetNode | PartialScriptNode;

type CRM = Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;