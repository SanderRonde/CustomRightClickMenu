/// <reference path="../../app/js/polyfills/map.ts" />
/// <reference path="../../app/js/polyfills/set.ts" />

// Borrowed from https://github.com/kelseasy/web-ext-types

// This Source Code Form is subject to the terms of the Mozilla Public
// license, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

interface CRMBrowserEvListener<T extends Function> {
    addListener: BrowserReturnValue<void>;
    removeListener: BrowserReturnValue<void>
    hasListener: BrowserReturnValue<boolean>;
}

/**
 * Data about a chrome request
 */
interface BrowserReturnRequest {
	/**
	 * The API it's using
	 */
	api: string,
	/**
	 * Arguments passed to the request
	 */
	chromeAPIArguments: {
		/**
		 * The type of argument
		 */
		type: 'fn'|'arg'|'return';
		/**
		 * The value of the argument
		 */
		val: any;
	}[],
	/**
	 * The type of this chrome request (if a special one
	 * that can not be made by the user themselves)
	 */
	type?: 'GM_download'|'GM_notification';
}

interface BrowserReturnValue<T> extends Function {
	/**
	 * A regular call with given arguments (functions can only be called once
	 * unless you use .persistent)
	 */
	(...params: any[]): BrowserReturnValue<T>;
	/**
	 * A regular call with given arguments (functions can only be called once
	 * unless you use .persistent)
	 */
	args: (...params: any[]) => BrowserReturnValue<T>;
	/**
	 * A regular call with given arguments (functions can only be called once
	 * unless you use .persistent)
	 */
	a: (...params: any[]) => BrowserReturnValue<T>;
	/**
	 * A persistent callback (that can be called multiple times)
	 */
	persistent: (...functions: Function[]) => BrowserReturnValue<T>;
	/**
	 * A persistent callback (that can be called multiple times)
	 */
	p: (...functions: Function[]) => BrowserReturnValue<T>;
	/**
	 * Sends the function and returns a promise that resolves with its result
	 */
	send: () => Promise<T>;
	/**
	 * Sends the function and returns a promise that resolves with its result
	 */
	s: () => Promise<T>;
	/**
	 * Info about the request itself
	 */
	request: BrowserReturnRequest;
}

type CRMBrowserListener<T> = CRMBrowserEvListener<(arg: T) => void>;

declare namespace crmbrowser.alarms {
    type Alarm = {
        name: string,
        scheduledTime: number,
        periodInMinutes?: number,
    };

    type When = {
        when?: number,
        periodInMinutes?: number,
    };
    type DelayInMinutes = {
        delayInMinutes?: number,
        periodInMinutes?: number,
    };
    function create(name?: string, alarmInfo?: When | DelayInMinutes): BrowserReturnValue<void>;
    function get(name?: string): BrowserReturnValue<Alarm|undefined>;
    function getAll(): BrowserReturnValue<Alarm[]>;
    function clear(name?: string): BrowserReturnValue<boolean>;
    function clearAll(): BrowserReturnValue<boolean>;

    const onAlarm: CRMBrowserListener<Alarm>;
}

declare namespace crmbrowser.bookmarks {
    type BookmarkTreeNodeUnmodifiable = "managed";
    type BookmarkTreeNodeType = "bookmark"|"folder"|"separator";
    type BookmarkTreeNode = {
        id: string,
        parentId?: string,
        index?: number,
        url?: string,
        title: string,
        dateAdded?: number,
        dateGroupModified?: number,
        unmodifiable?: BookmarkTreeNodeUnmodifiable,
        children?: BookmarkTreeNode[],
        type?: BookmarkTreeNodeType,
    };

    type CreateDetails = {
        parentId?: string,
        index?: number,
        title?: string,
        url?: string,
    };

    function create(bookmark: CreateDetails): BrowserReturnValue<BookmarkTreeNode>;
    function get(idOrIdList: string|string[]): BrowserReturnValue<BookmarkTreeNode[]>;
    function getChildren(id: string): BrowserReturnValue<BookmarkTreeNode[]>;
    function getRecent(numberOfItems: number): BrowserReturnValue<BookmarkTreeNode[]>;
    function getSubTree(id: string): BrowserReturnValue<[BookmarkTreeNode]>;
    function getTree(): BrowserReturnValue<[BookmarkTreeNode]>;

    type Destination = {
        parentId: string,
        index?: number,
    } | {
        index: number,
        parentId?: string,
    };
    function move(id: string, destination: Destination): BrowserReturnValue<BookmarkTreeNode>;
    function remove(id: string): BrowserReturnValue<void>;
    function removeTree(id: string): BrowserReturnValue<void>;
    function search(query: string|{
        query?: string,
        url?: string,
        title?: string,
    }): BrowserReturnValue<BookmarkTreeNode[]>;
    function update(id: string, changes: { title: string, url: string }): BrowserReturnValue<BookmarkTreeNode>;

    const onCreated: CRMBrowserEvListener<(id: string, bookmark: BookmarkTreeNode) => void>;
    const onRemoved: CRMBrowserEvListener<(id: string, removeInfo: {
        parentId: string,
        index: number,
        node: BookmarkTreeNode,
    }) => void>;
    const onChanged: CRMBrowserEvListener<(id: string, changeInfo: {
        title: string,
        url?: string,
    }) => void>;
    const onMoved: CRMBrowserEvListener<(id: string, moveInfo: {
        parentId: string,
        index: number,
        oldParentId: string,
        oldIndex: number,
    }) => void>;
}

declare namespace crmbrowser.browserAction {
    type ColorArray = [number, number, number, number];
    type ImageDataType = ImageData;

    function setTitle(details: { title: string, tabId?: number }): BrowserReturnValue<void>;
    function getTitle(details: { tabId?: number }): BrowserReturnValue<string>;

    type IconViaPath = {
        path: string | object,
        tabId?: number,
    };

    type IconViaImageData = {
        imageData: ImageDataType,
        tabId?: number,
    };
    function setIcon(details: IconViaPath | IconViaImageData): BrowserReturnValue<void>;
    function setPopup(details: { popup: string, tabId?: number }): BrowserReturnValue<void>;
    function getPopup(details: { tabId?: number }): BrowserReturnValue<string>;
    function openPopup(): BrowserReturnValue<void>;
    function setBadgeText(details: { text: string, tabId?: number }): BrowserReturnValue<void>;
    function getBadgeText(details: { tabId?: number }): BrowserReturnValue<string>;
    function setBadgeBackgroundColor(details: { color: string|ColorArray, tabId?: number }): BrowserReturnValue<void>;
    function getBadgeBackgroundColor(details: { tabId?: number }): BrowserReturnValue<ColorArray>;
    function enable(tabId?: number): BrowserReturnValue<void>;
    function disable(tabId?: number): BrowserReturnValue<void>;

    const onClicked: CRMBrowserListener<crmbrowser.tabs.Tab>;
}

declare namespace crmbrowser.browsingData {
    type DataTypeSet = {
        cache?: boolean,
        cookies?: boolean,
        downloads?: boolean,
        fileSystems?: boolean,
        formData?: boolean,
        history?: boolean,
        indexedDB?: boolean,
        localStorage?: boolean,
        passwords?: boolean,
        pluginData?: boolean,
        serverBoundCertificates?: boolean,
        serviceWorkers?: boolean,
    };

    type DataRemovalOptions = {
        since?: number,
        originTypes?: { unprotectedWeb: boolean },
    };

    function remove(removalOptions: DataRemovalOptions, dataTypes: DataTypeSet): BrowserReturnValue<void>;
    function removeCache(removalOptions?: DataRemovalOptions): BrowserReturnValue<void>;
    function removeCookies(removalOptions: DataRemovalOptions): BrowserReturnValue<void>;
    function removeDownloads(removalOptions: DataRemovalOptions): BrowserReturnValue<void>;
    function removeFormData(removalOptions: DataRemovalOptions): BrowserReturnValue<void>;
    function removeHistory(removalOptions: DataRemovalOptions): BrowserReturnValue<void>;
    function removePasswords(removalOptions: DataRemovalOptions): BrowserReturnValue<void>;
    function removePluginData(removalOptions: DataRemovalOptions): BrowserReturnValue<void>;
    function settings(): BrowserReturnValue<{
        options: DataRemovalOptions,
        dataToRemove: DataTypeSet,
        dataRemovalPermitted: DataTypeSet,
    }>;
}

declare namespace crmbrowser.commands {
    type Command = {
        name?: string,
        description?: string,
        shortcut?: string,
    };

    function getAll(): BrowserReturnValue<Command[]>;

    const onCommand: CRMBrowserListener<string>;
}

declare namespace crmbrowser.contextMenus {
    type ContextType = "all" | "page" | "frame" | "page" | "link" | "editable" | "image" | "selection"
        | "video" | "audio" | "launcher" | "browser_action" | "page_action" | "password" | "tab";

    type ItemType = "normal" | "checkbox" | "radio" | "separator";

    type OnClickData = {
        menuItemId: number|string,
        modifiers: string[],
        editable: boolean,
        parentMenuItemId?: number|string,
        mediaType?: string,
        linkUrl?: string,
        srcUrl?: string,
        pageUrl?: string,
        frameUrl?: string,
        selectionText?: string,
        wasChecked?: boolean,
        checked?: boolean,
    };

    const ACTION_MENU_TOP_LEVEL_LIMIT: number;

    function create(createProperties: {
        type?: ItemType,
        id?: string,
        title?: string,
        checked?: boolean,
        command?: "_execute_crmbrowser_action" | "_execute_page_action" | "_execute_sidebar_action",
        contexts?: ContextType[],
        onclick?: (info: OnClickData, tab: crmbrowser.tabs.Tab) => void,
        parentId?: number|string,
        documentUrlPatterns?: string[],
        targetUrlPatterns?: string[],
        enabled?: boolean,
    }, callback?: () => void): BrowserReturnValue<number|string>;
    function update(id: number|string, updateProperties: {
        type?: ItemType,
        title?: string,
        checked?: boolean,
        contexts?: ContextType[],
        onclick?: (info: OnClickData, tab: crmbrowser.tabs.Tab) => void,
        parentId?: number|string,
        documentUrlPatterns?: string[],
        targetUrlPatterns?: string[],
        enabled?: boolean,
    }): BrowserReturnValue<void>;
    function remove(menuItemId: number|string): BrowserReturnValue<void>;
    function removeAll(): BrowserReturnValue<void>;

    const onClicked: CRMBrowserEvListener<(info: OnClickData, tab: crmbrowser.tabs.Tab) => void>;
}

declare namespace crmbrowser.contextualIdentities {
    type IdentityColor = "blue" | "turquoise" | "green" | "yellow" | "orange" | "red" | "pink" | "purple";
    type IdentityIcon = "fingerprint" | "briefcase" | "dollar" | "cart" | "circle";

    type ContextualIdentity = {
        cookieStoreId: string,
        color: IdentityColor,
        icon: IdentityIcon,
        name: string,
    };

    function create(details: {
        name: string,
        color: IdentityColor,
        icon: IdentityIcon,
    }): BrowserReturnValue<ContextualIdentity>;
    function get(cookieStoreId: string): BrowserReturnValue<ContextualIdentity|null>;
    function query(details: { name?: string }): BrowserReturnValue<ContextualIdentity[]>;
    function update(cookieStoreId: string, details: {
        name: string,
        color: IdentityColor,
        icon: IdentityIcon,
    }): BrowserReturnValue<ContextualIdentity>;
    function remove(cookieStoreId: string): BrowserReturnValue<ContextualIdentity|null>;
}

declare namespace crmbrowser.cookies {
    type Cookie = {
        name: string,
        value: string,
        domain: string,
        hostOnly: boolean,
        path: string,
        secure: boolean,
        httpOnly: boolean,
        session: boolean,
        expirationDate?: number,
        storeId: string,
    };

    type CookieStore = {
        id: string,
        tabIds: number[],
    };

    type OnChangedCause = "evicted" | "expired" | "explicit" | "expired_overwrite"| "overwrite";

    function get(details: { url: string, name: string, storeId?: string }): BrowserReturnValue<Cookie|null>;
    function getAll(details: {
        url?: string,
        name?: string,
        domain?: string,
        path?: string,
        secure?: boolean,
        session?: boolean,
        storeId?: string,
    }): BrowserReturnValue<Cookie[]>;
    function set(details: {
        url: string,
        name?: string,
        domain?: string,
        path?: string,
        secure?: boolean,
        httpOnly?: boolean,
        expirationDate?: number,
        storeId?: string,
    }): BrowserReturnValue<Cookie>;
    function remove(details: { url: string, name: string, storeId?: string }): BrowserReturnValue<Cookie|null>;
    function getAllCookieStores(): BrowserReturnValue<CookieStore[]>;

    const onChanged: CRMBrowserListener<{ removed: boolean, cookie: Cookie, cause: OnChangedCause }>;
}

declare namespace crmbrowser.devtools.inspectedWindow {
    const tabId: number;

    function eval(expression: string): BrowserReturnValue<[
        any,
        { isException: boolean, value: string } | { isError: boolean, code: string }
    ]>;

    function reload(reloadOptions?: {
        ignoreCache?: boolean,
        userAgent?: string,
        injectedScript?: string,
    }): BrowserReturnValue<void>;
}

declare namespace crmbrowser.devtools.network {
    const onNavigated: CRMBrowserListener<string>;
}

declare namespace crmbrowser.devtools.panels {
    type ExtensionPanel = {
        onShown: CRMBrowserListener<Window>,
        onHidden: CRMBrowserListener<void>,
    };

    function create(title: string, iconPath: string, pagePath: string): BrowserReturnValue<ExtensionPanel>;
}

declare namespace crmbrowser.downloads {
    type FilenameConflictAction = "uniquify" | "overwrite" | "prompt";

    type InterruptReason = "FILE_FAILED" | "FILE_ACCESS_DENIED" | "FILE_NO_SPACE"
                         | "FILE_NAME_TOO_LONG" | "FILE_TOO_LARGE" | "FILE_VIRUS_INFECTED"
                         | "FILE_TRANSIENT_ERROR" | "FILE_BLOCKED" | "FILE_SECURITY_CHECK_FAILED"
                         | "FILE_TOO_SHORT"
                         | "NETWORK_FAILED" | "NETWORK_TIMEOUT" | "NETWORK_DISCONNECTED"
                         | "NETWORK_SERVER_DOWN" | "NETWORK_INVALID_REQUEST"
                         | "SERVER_FAILED" | "SERVER_NO_RANGE" | "SERVER_BAD_CONTENT"
                         | "SERVER_UNAUTHORIZED" | "SERVER_CERT_PROBLEM" | "SERVER_FORBIDDEN"
                         | "USER_CANCELED" | "USER_SHUTDOWN" | "CRASH";

    type DangerType = "file" | "url" | "content" | "uncommon" | "host" | "unwanted" | "safe"
                    | "accepted";

    type State = "in_progress" | "interrupted" | "complete";

    type DownloadItem = {
        id: number,
        url: string,
        referrer: string,
        filename: string,
        incognito: boolean,
        danger: string,
        mime: string,
        startTime: string,
        endTime?: string,
        estimatedEndTime?: string,
        state: string,
        paused: boolean,
        canResume: boolean,
        error?: string,
        bytesReceived: number,
        totalBytes: number,
        fileSize: number,
        exists: boolean,
        byExtensionId?: string,
        byExtensionName?: string,
    };

    type Delta<T> = {
        current?: T,
        previous?: T,
    };

    type StringDelta = Delta<string>;
    type DoubleDelta = Delta<number>;
    type BooleanDelta = Delta<boolean>;
    type DownloadTime = Date|string|number;

    type DownloadQuery = {
        query?: string[],
        startedBefore?: DownloadTime,
        startedAfter?: DownloadTime,
        endedBefore?: DownloadTime,
        endedAfter?: DownloadTime,
        totalBytesGreater?: number,
        totalBytesLess?: number,
        filenameRegex?: string,
        urlRegex?: string,
        limit?: number,
        orderBy?: string,
        id?: number,
        url?: string,
        filename?: string,
        danger?: DangerType,
        mime?: string,
        startTime?: string,
        endTime?: string,
        state?: State,
        paused?: boolean,
        error?: InterruptReason,
        bytesReceived?: number,
        totalBytes?: number,
        fileSize?: number,
        exists?: boolean,
    };

    function download(options: {
        url: string,
        filename?: string,
        conflictAction?: string,
        saveAs?: boolean,
        method?: string,
        headers?: { [key: string]: string },
        body?: string,
    }): BrowserReturnValue<number>;
    function search(query: DownloadQuery): BrowserReturnValue<DownloadItem[]>;
    function pause(downloadId: number): BrowserReturnValue<void>;
    function resume(downloadId: number): BrowserReturnValue<void>;
    function cancel(downloadId: number): BrowserReturnValue<void>;
    // unsupported: function getFileIcon(downloadId: number, options?: { size?: number }):
    //              BrowserReturnValue<string>;
    function open(downloadId: number): BrowserReturnValue<void>;
    function show(downloadId: number): BrowserReturnValue<void>;
    function showDefaultFolder(): BrowserReturnValue<void>;
    function erase(query: DownloadQuery): BrowserReturnValue<number[]>;
    function removeFile(downloadId: number): BrowserReturnValue<void>;
    // unsupported: function acceptDanger(downloadId: number): BrowserReturnValue<void>;
    // unsupported: function drag(downloadId: number): BrowserReturnValue<void>;
    // unsupported: function setShelfEnabled(enabled: boolean): BrowserReturnValue<void>;

    const onCreated: CRMBrowserListener<DownloadItem>;
    const onErased: CRMBrowserListener<number>;
    const onChanged: CRMBrowserListener<{
        id: number,
        url?: StringDelta,
        filename?: StringDelta,
        danger?: StringDelta,
        mime?: StringDelta,
        startTime?: StringDelta,
        endTime?: StringDelta,
        state?: StringDelta,
        canResume?: BooleanDelta,
        paused?: BooleanDelta,
        error?: StringDelta,
        totalBytes?: DoubleDelta,
        fileSize?: DoubleDelta,
        exists?: BooleanDelta,
    }>;
}

declare namespace crmbrowser.events {
    type UrlFilter = {
        hostContains?: string,
        hostEquals?: string,
        hostPrefix?: string,
        hostSuffix?: string,
        pathContains?: string,
        pathEquals?: string,
        pathPrefix?: string,
        pathSuffix?: string,
        queryContains?: string,
        queryEquals?: string,
        queryPrefix?: string,
        querySuffix?: string,
        urlContains?: string,
        urlEquals?: string,
        urlMatches?: string,
        originAndPathMatches?: string,
        urlPrefix?: string,
        urlSuffix?: string,
        schemes?: string[],
        ports?: Array<number|number[]>,
    };
}

declare namespace crmbrowser.extension {
    type ViewType = "tab" | "notification" | "popup";

    const lastError: string|null;
    const inIncognitoContext: boolean;

    function getURL(path: string): string;
    function getViews(fetchProperties?: { type?: ViewType, windowId?: number }): Window[];
    function getBackgroundPage(): Window;
    function isAllowedIncognitoAccess(): BrowserReturnValue<boolean>;
    function isAllowedFileSchemeAccess(): BrowserReturnValue<boolean>;
    // unsupported: events as they are deprecated
}

declare namespace crmbrowser.extensionTypes {
    type ImageFormat = "jpeg" | "png";
    type ImageDetails = {
        format: ImageFormat,
        quality: number,
    };
    type RunAt = "document_start" | "document_end" | "document_idle";
    type InjectDetails = {
        allFrames?: boolean,
        code?: string,
        file?: string,
        frameId?: number,
        matchAboutBlank?: boolean,
        runAt?: RunAt,
    };
    type InjectDetailsCSS = InjectDetails & { cssOrigin?: "user" | "author" };
}

declare namespace crmbrowser.history {
    type TransitionType = "link" | "typed" | "auto_bookmark" | "auto_subframe" | "manual_subframe"
                        | "generated" | "auto_toplevel" | "form_submit" | "reload" | "keyword"
                        | "keyword_generated";

    type HistoryItem = {
        id: string,
        url?: string,
        title?: string,
        lastVisitTime?: number,
        visitCount?: number,
        typedCount?: number,
    };

    type VisitItem = {
        id: string,
        visitId: string,
        VisitTime?: number,
        refferingVisitId: string,
        transition: TransitionType,
    };

    function search(query: {
        text: string,
        startTime?: number|string|Date,
        endTime?: number|string|Date,
        maxResults?: number,
    }): BrowserReturnValue<HistoryItem[]>;

    function getVisits(details: { url: string }): BrowserReturnValue<VisitItem[]>;

    function addUrl(details: {
        url: string,
        title?: string,
        transition?: TransitionType,
        visitTime?: number|string|Date,
    }): BrowserReturnValue<void>;

    function deleteUrl(details: { url: string }): BrowserReturnValue<void>;

    function deleteRange(range: {
        startTime: number|string|Date,
        endTime: number|string|Date,
    }): BrowserReturnValue<void>;

    function deleteAll(): BrowserReturnValue<void>;

    const onVisited: CRMBrowserListener<HistoryItem>;

    // TODO: Ensure that urls is not `urls: [string]` instead
    const onVisitRemoved: CRMBrowserListener<{ allHistory: boolean, urls: string[] }>;
}

declare namespace crmbrowser.i18n {
    type LanguageCode = string;

    function getAcceptLanguages(): BrowserReturnValue<LanguageCode[]>;

    function getMessage(messageName: string, substitutions?: string|string[]): string;

    function getUILanguage(): LanguageCode;

    function detectLanguage(text: string): BrowserReturnValue<{
        isReliable: boolean,
        languages: { language: LanguageCode, percentage: number }[],
    }>;
}

declare namespace crmbrowser.identity {
    function getRedirectURL(): string;
    function launchWebAuthFlow(details: { url: string, interactive: boolean }): BrowserReturnValue<string>;
}

declare namespace crmbrowser.idle {
    type IdleState = "active" | "idle" /* unsupported: | "locked" */;

    function queryState(detectionIntervalInSeconds: number): BrowserReturnValue<IdleState>;
    function setDetectionInterval(intervalInSeconds: number): BrowserReturnValue<void>;

    const onStateChanged: CRMBrowserListener<IdleState>;
}

declare namespace crmbrowser.management {
    type ExtensionInfo = {
        description: string,
        // unsupported: disabledReason: string,
        enabled: boolean,
        homepageUrl: string,
        hostPermissions: string[],
        icons: { size: number, url: string }[],
        id: string,
        installType: "admin" | "development" | "normal" | "sideload" | "other";
        mayDisable: boolean,
        name: string,
        // unsupported: offlineEnabled: boolean,
        optionsUrl: string,
        permissions: string[],
        shortName: string,
        // unsupported: type: string,
        updateUrl: string,
        version: string,
        // unsupported: versionName: string,
    };

    function getSelf(): BrowserReturnValue<ExtensionInfo>;
    function uninstallSelf(options: { showConfirmDialog: boolean, dialogMessage: string }): BrowserReturnValue<void>;
}

declare namespace crmbrowser.notifications {
    type TemplateType = "basic" /* | "image" | "list" | "progress" */;

    type NotificationOptions = {
        type: TemplateType,
        message: string,
        title: string,
        iconUrl?: string,
    };

    function create(id: string|null, options: NotificationOptions): BrowserReturnValue<string>;

    function clear(id: string): BrowserReturnValue<boolean>;

    function getAll(): BrowserReturnValue<{ [key: string]: NotificationOptions }>;

    const onClosed: CRMBrowserListener<string>;

    const onClicked: CRMBrowserListener<string>;
}

declare namespace crmbrowser.omnibox {
    type OnInputEnteredDisposition = "currentTab" | "newForegroundTab" | "newBackgroundTab";
    type SuggestResult = {
        content: string,
        description: string,
    };

    function setDefaultSuggestion(suggestion: { description: string }): BrowserReturnValue<void>;

    const onInputStarted: CRMBrowserListener<void>;
    const onInputChanged:
        CRMBrowserEvListener<(text: string, suggest: (arg: SuggestResult[]) => void) => void>;
    const onInputEntered:
        CRMBrowserEvListener<(text: string, disposition: OnInputEnteredDisposition) => void>;
    const onInputCancelled: CRMBrowserListener<void>;
}

declare namespace crmbrowser.pageAction {
    type ImageDataType = ImageData;

    function show(tabId: number): BrowserReturnValue<void>;

    function hide(tabId: number): BrowserReturnValue<void>;

    function setTitle(details: { tabId: number, title: string }): BrowserReturnValue<void>;

    function getTitle(details: { tabId: number }): BrowserReturnValue<string>;

    function setIcon(details: {
        tabId: number,
        path?: string|object,
        imageData?: ImageDataType,
    }): BrowserReturnValue<void>;

    function setPopup(details: { tabId: number, popup: string }): BrowserReturnValue<void>;

    function getPopup(details: { tabId: number }): BrowserReturnValue<string>;

    const onClicked: CRMBrowserListener<crmbrowser.tabs.Tab>;
}

declare namespace crmbrowser.permissions {
    type Permission = "activeTab" | "alarms" |
        "bookmarks" | "browsingData" | "browserSettings" |
        "contextMenus" | "contextualIdentities" | "cookies" |
        "downloads" | "downloads.open" |
        "find" | "geolocation" | "history" |
        "identity" | "idle" |
        "management" | "menus" |
        "nativeMessaging" | "notifications" |
        "pkcs11" | "privacy" | "proxy" |
        "sessions" | "storage" |
        "tabs" | "theme" | "topSites" |
        "webNavigation" | "webRequest" | "webRequestBlocking";

    type Permissions = {
        origins?: string[],
        permissions?: Permission[]
    };

    function contains(permissions: Permissions): BrowserReturnValue<boolean>;

    function getAll(): BrowserReturnValue<Permissions>;

    function remove(permissions: Permissions): BrowserReturnValue<boolean>;

    function request(permissions: Permissions): BrowserReturnValue<boolean>;

    // Not yet support in Edge and Firefox:
    // const onAdded: CRMBrowserListener<Permissions>;
    // const onRemoved: CRMBrowserListener<Permissions>;
}

declare namespace crmbrowser.runtime {
    const lastError: string | null;
    const id: string;

    type Port = {
        name: string,
        disconnect(): BrowserReturnValue<void>,
        error: object,
        onDisconnect: {
            addListener(cb: (port: Port) => void): BrowserReturnValue<void>,
            removeListener(): BrowserReturnValue<void>,
        },
        onMessage: {
            addListener(cb: (message: object) => void): BrowserReturnValue<void>,
            removeListener(): BrowserReturnValue<void>,
        },
        postMessage(message: object): BrowserReturnValue<void>,
        sender?: runtime.MessageSender,
    };

    type MessageSender = {
        tab?: crmbrowser.tabs.Tab,
        frameId?: number,
        id?: string,
        url?: string,
        tlsChannelId?: string,
    };

    type PlatformOs =  "mac" | "win" | "android" | "cros" | "linux" | "openbsd";
    type PlatformArch =  "arm" | "x86-32" | "x86-64";
    type PlatformNaclArch = "arm" | "x86-32" | "x86-64";

    type PlatformInfo = {
        os: PlatformOs,
        arch: PlatformArch,
    };

    // type RequestUpdateCheckStatus = "throttled" | "no_update" | "update_available";
    type OnInstalledReason = "install" | "update" | "chrome_update" | "shared_module_update";
    type OnRestartRequiredReason = "app_update" | "os_update" | "periodic";

    function getBackgroundPage(): BrowserReturnValue<Window>;
    function openOptionsPage(): BrowserReturnValue<void>;

    // TODO: Explicitly expose every property of the manifest
    function getManifest(): object;
    function getURL(path: string): string;
    function setUninstallURL(url: string): BrowserReturnValue<void>;
    function reload(): BrowserReturnValue<void>;
    // Will not exist: https://bugzilla.mozilla.org/show_bug.cgi?id=1314922
    // function RequestUpdateCheck(): BrowserReturnValue<RequestUpdateCheckStatus>;
    function connect(
        extensionId?: string,
        connectInfo?: { name?: string, includeTlsChannelId?: boolean }
    ): Port;
    function connectNative(application: string): Port;

    function sendMessage<T = any, U = any>(
        message: T
    ): BrowserReturnValue<U>;
    function sendMessage<T = any, U = any>(
        message: T,
        options: { includeTlsChannelId?: boolean, toProxyScript?: boolean }
    ): BrowserReturnValue<U>;
    function sendMessage<T = any, U = any>(
        extensionId: string,
        message: T,
    ): BrowserReturnValue<U>;
    function sendMessage<T = any, U = any>(
        extensionId: string,
        message: T,
        options?: { includeTlsChannelId?: boolean, toProxyScript?: boolean }
    ): BrowserReturnValue<U>;

    function sendNativeMessage(
        application: string,
        message: object
    ): BrowserReturnValue<object|void>;
    function getPlatformInfo(): BrowserReturnValue<PlatformInfo>;
    function getBrowserInfo(): BrowserReturnValue<{
        name: string,
        vendor: string,
        version: string,
        buildID: string,
    }>;
    // Unsupported: https://bugzilla.mozilla.org/show_bug.cgi?id=1339407
    // function getPackageDirectoryEntry(): BrowserReturnValue<any>;

    const onStartup: CRMBrowserListener<void>;
    const onInstalled: CRMBrowserListener<{
        reason: OnInstalledReason,
        previousVersion?: string,
        id?: string,
    }>;
    // Unsupported
    // const onSuspend: CRMBrowserListener<void>;
    // const onSuspendCanceled: CRMBrowserListener<void>;
    // const onBrowserUpdateAvailable: CRMBrowserListener<void>;
    // const onRestartRequired: CRMBrowserListener<OnRestartRequiredReason>;
    const onUpdateAvailable: CRMBrowserListener<{ version: string }>;
    const onConnect: CRMBrowserListener<Port>;

    const onConnectExternal: CRMBrowserListener<Port>;

    type onMessagePromise = (
        message: object,
        sender: MessageSender,
        sendResponse: (response: object) => boolean
    ) => BrowserReturnValue<void>;

    type onMessageBool = (
        message: object,
        sender: MessageSender,
        sendResponse: (response: object) => BrowserReturnValue<void>
    ) => boolean;

    type onMessageVoid = (
        message: object,
        sender: MessageSender,
        sendResponse: (response: object) => BrowserReturnValue<void>
    ) => void;

    type onMessageEvent = onMessagePromise | onMessageBool | onMessageVoid;
    const onMessage: CRMBrowserEvListener<onMessageEvent>;

    const onMessageExternal: CRMBrowserEvListener<onMessageEvent>;
}

declare namespace crmbrowser.sessions{
    type Filter = { maxResults?: number }

    type Session = {
        lastModified: number,
        tab: crmbrowser.tabs.Tab,
        window: crmbrowser.windows.Window
    }

    const MAX_SESSION_RESULTS: number

    function getRecentlyClosed(filter?: Filter): BrowserReturnValue<Session[]>

    function restore(sessionId: string): BrowserReturnValue<Session>

    function setTabValue(tabId: number, key: string, value: string|object): BrowserReturnValue<void>

    function getTabValue(tabId: number, key: string): BrowserReturnValue<void|string|object>

    function removeTabValue(tabId: number, key: string): BrowserReturnValue<void>

    function setWindowValue(windowId: number, key: string, value: string|object): BrowserReturnValue<void>

    function getWindowValue(windowId: number, key: string): BrowserReturnValue<void|string|object>

    function removeWindowValue(windowId: number, key: string): BrowserReturnValue<void>

    const onChanged: CRMBrowserEvListener<()=>void>

}

declare namespace crmbrowser.sidebarAction {
    type ImageDataType = ImageData;

    function setPanel(details: { panel: string, tabId?: number }): BrowserReturnValue<void>;

    function getPanel(details: { tabId?: number }): BrowserReturnValue<string>;

    function setTitle(details: { title: string, tabId?: number }): BrowserReturnValue<void>;

    function getTitle(details: { tabId?: number }): BrowserReturnValue<string>;

    type IconViaPath = {
        path: string | { [index: number]: string },
        tabId?: number,
    };

    type IconViaImageData = {
        imageData: ImageDataType | { [index: number]: ImageDataType },
        tabId?: number,
    };

    function setIcon(details: IconViaPath | IconViaImageData): BrowserReturnValue<void>;

    function open(): BrowserReturnValue<void>;

    function close(): BrowserReturnValue<void>;
}

declare namespace crmbrowser.storage {

    // Non-firefox implementations don't accept all these types
    type StorageValue =
        string |
        number |
        boolean |
        null |
        undefined |
        RegExp |
        ArrayBuffer |
        Uint8ClampedArray |
        Uint8Array |
        Uint16Array |
        Uint32Array |
        Int8Array |
        Int16Array |
        Int32Array |
        Float32Array |
        Float64Array |
        DataView |
        StorageArray |
        StorageMap |
        StorageSet |
        StorageObject;

    // The Index signature makes casting to/from classes or interfaces a pain.
    // Custom types are OK.
    interface StorageObject {
        [key: string]: StorageValue;
    }
    // These have to be interfaces rather than types to avoid a circular
    // definition of StorageValue
    interface StorageArray extends Array<StorageValue> {}
    interface StorageMap extends Map<StorageValue,StorageValue> {}
    interface StorageSet extends Set<StorageValue> {}

    interface Get {
        (keys?: string|string[]|null): BrowserReturnValue<StorageObject>;
        /* <T extends StorageObject>(keys: T): BrowserReturnValue<{[K in keyof T]: T[K]}>; */
        <T extends StorageObject>(keys: T): BrowserReturnValue<T>;
    }

    type StorageArea = {
        get: Get,
        // unsupported: getBytesInUse: (keys: string|string[]|null) => BrowserReturnValue<number>,
        set: (keys: StorageObject) => BrowserReturnValue<void>,
        remove: (keys: string|string[]) => BrowserReturnValue<void>,
        clear: () => BrowserReturnValue<void>,
    };

    type StorageChange = {
        oldValue?: any,
        newValue?: any,
    };

    const sync: StorageArea;
    const local: StorageArea;
    // unsupported: const managed: StorageArea;

    type ChangeDict = { [field: string]: StorageChange };
    type StorageName = "sync"|"local" /* |"managed" */;

    const onChanged: CRMBrowserEvListener<(changes: ChangeDict, areaName: StorageName) => void>;
}

declare namespace crmbrowser.tabs {
    type MutedInfoReason = "capture" | "extension" | "user";
    type MutedInfo = {
        muted: boolean,
        extensionId?: string,
        reason: MutedInfoReason,
    };
    // TODO: Specify PageSettings properly.
    type PageSettings = object;
    type Tab = {
        active: boolean,
        audible?: boolean,
        autoDiscardable?: boolean,
        cookieStoreId?: string,
        discarded?: boolean,
        favIconUrl?: string,
        height?: number,
        highlighted: boolean,
        id?: number,
        incognito: boolean,
        index: number,
        isArticle: boolean,
        isInReaderMode: boolean,
        lastAccessed: number,
        mutedInfo?: MutedInfo,
        openerTabId?: number,
        pinned: boolean,
        selected: boolean,
        sessionId?: string,
        status?: string,
        title?: string,
        url?: string,
        width?: number,
        windowId: number,
    };

    type TabStatus = "loading" | "complete";
    type WindowType = "normal" | "popup" | "panel" | "devtools";
    type ZoomSettingsMode = "automatic" | "disabled" | "manual";
    type ZoomSettingsScope = "per-origin" | "per-tab";
    type ZoomSettings = {
        defaultZoomFactor?: number,
        mode?: ZoomSettingsMode,
        scope?: ZoomSettingsScope,
    };

    const TAB_ID_NONE: number;

    function connect(tabId: number, connectInfo?: { name?: string, frameId?: number }): crmbrowser.runtime.Port;
    function create(createProperties: {
        active?: boolean,
        cookieStoreId?: string,
        index?: number,
        openerTabId?: number,
        pinned?: boolean,
        // deprecated: selected: boolean,
        url?: string,
        windowId?: number,
    }): BrowserReturnValue<Tab>;
    function captureVisibleTab(
        windowId?: number,
        options?: crmbrowser.extensionTypes.ImageDetails
    ): BrowserReturnValue<string>;
    function detectLanguage(tabId?: number): BrowserReturnValue<string>;
    function duplicate(tabId: number): BrowserReturnValue<Tab>;
    function executeScript(
        tabId: number|undefined,
        details: crmbrowser.extensionTypes.InjectDetails
    ): BrowserReturnValue<object[]>;
    function get(tabId: number): BrowserReturnValue<Tab>;
    // deprecated: function getAllInWindow(): x;
    function getCurrent(): BrowserReturnValue<Tab>;
    // deprecated: function getSelected(windowId?: number): BrowserReturnValue<browser.tabs.Tab>;
    function getZoom(tabId?: number): BrowserReturnValue<number>;
    function getZoomSettings(tabId?: number): BrowserReturnValue<ZoomSettings>;
    // unsupported: function highlight(highlightInfo: {
    //     windowId?: number,
    //     tabs: number[]|number,
    // }): BrowserReturnValue<browser.windows.Window>;
    function insertCSS(tabId: number|undefined, details: crmbrowser.extensionTypes.InjectDetailsCSS): BrowserReturnValue<void>;
    function removeCSS(tabId: number|undefined, details: crmbrowser.extensionTypes.InjectDetails): BrowserReturnValue<void>;
    function move(tabIds: number|number[], moveProperties: {
        windowId?: number,
        index: number,
    }): BrowserReturnValue<Tab|Tab[]>;
    function print(): BrowserReturnValue<void>;
    function printPreview(): BrowserReturnValue<void>;
    function query(queryInfo: {
        active?: boolean,
        audible?: boolean,
        // unsupported: autoDiscardable?: boolean,
        cookieStoreId?: string,
        currentWindow?: boolean,
        discarded?: boolean,
        highlighted?: boolean,
        index?: number,
        muted?: boolean,
        lastFocusedWindow?: boolean,
        pinned?: boolean,
        status?: TabStatus,
        title?: string,
        url?: string|string[],
        windowId?: number,
        windowType?: WindowType,
    }): BrowserReturnValue<Tab[]>;
    function reload(tabId?: number, reloadProperties?: { bypassCache?: boolean }): BrowserReturnValue<void>;
    function remove(tabIds: number|number[]): BrowserReturnValue<void>;
    function saveAsPDF(pageSettings: PageSettings): BrowserReturnValue<
        'saved' |
        'replaced' |
        'canceled' |
        'not_saved' |
        'not_replaced'
    >;
    function sendMessage<T = any, U = object>(tabId: number, message: T, options?: { frameId?: number }): BrowserReturnValue<U|void>;
    // deprecated: function sendRequest(): x;
    function setZoom(tabId: number|undefined, zoomFactor: number): BrowserReturnValue<void>;
    function setZoomSettings(tabId: number|undefined, zoomSettings: ZoomSettings): BrowserReturnValue<void>;
    function update(tabId: number|undefined, updateProperties: {
        active?: boolean,
        // unsupported: autoDiscardable?: boolean,
        // unsupported: highlighted?: boolean,
        loadReplace?: boolean,
        muted?: boolean,
        openerTabId?: number,
        pinned?: boolean,
        // deprecated: selected?: boolean,
        url?: string,
    }): BrowserReturnValue<Tab>;

    const onActivated: CRMBrowserListener<{ tabId: number, windowId: number }>;
    const onAttached: CRMBrowserEvListener<(tabId: number, attachInfo: {
        newWindowId: number,
        newPosition: number,
    }) => void>;
    const onCreated: CRMBrowserListener<Tab>;
    const onDetached: CRMBrowserEvListener<(tabId: number, detachInfo: {
        oldWindowId: number,
        oldPosition: number,
    }) => void>;
    const onHighlighted: CRMBrowserListener<{ windowId: number, tabIds: number[] }>;
    const onMoved: CRMBrowserEvListener<(tabId: number, moveInfo: {
        windowId: number,
        fromIndex: number,
        toIndex: number,
    }) => void>;
    const onRemoved: CRMBrowserEvListener<(tabId: number, removeInfo: {
        windowId: number,
        isWindowClosing: boolean,
    }) => void>;
    const onReplaced: CRMBrowserEvListener<(addedTabId: number, removedTabId: number) => void>;
    const onUpdated: CRMBrowserEvListener<(tabId: number, changeInfo: {
        audible?: boolean,
        discarded?: boolean,
        favIconUrl?: string,
        mutedInfo?: MutedInfo,
        pinned?: boolean,
        status?: string,
        title?: string,
        url?: string,
    }, tab: Tab) => void>;
    const onZoomChanged: CRMBrowserListener<{
        tabId: number,
        oldZoomFactor: number,
        newZoomFactor: number,
        zoomSettings: ZoomSettings,
    }>;
}

declare namespace crmbrowser.topSites {
    type MostVisitedURL = {
        title: string,
        url: string,
    };
    function get(): BrowserReturnValue<MostVisitedURL[]>;
}

declare namespace crmbrowser.webNavigation {
    type TransitionType = "link" | "auto_subframe" | "form_submit" | "reload";
                        // unsupported: | "typed" | "auto_bookmark" | "manual_subframe"
                        //              | "generated" | "start_page" | "keyword"
                        //              | "keyword_generated";

    type TransitionQualifier = "client_redirect" | "server_redirect" | "forward_back";
                               // unsupported: "from_address_bar";

    function getFrame(details: {
        tabId: number,
        processId: number,
        frameId: number,
    }): BrowserReturnValue<{ errorOccured: boolean, url: string, parentFrameId: number }>;

    function getAllFrames(details: { tabId: number }): BrowserReturnValue<{
        errorOccured: boolean,
        processId: number,
        frameId: number,
        parentFrameId: number,
        url: string,
    }[]>;

    interface NavListener<T> {
        addListener: (callback: (arg: T) => void, filter?: {
            url: crmbrowser.events.UrlFilter[],
        }) => void;
        removeListener: (callback: (arg: T) => void) => void;
        hasListener: (callback: (arg: T) => void) => boolean;
    }

    type DefaultNavListener = NavListener<{
        tabId: number,
        url: string,
        processId: number,
        frameId: number,
        timeStamp: number,
    }>;

    type TransitionNavListener = NavListener<{
        tabId: number,
        url: string,
        processId: number,
        frameId: number,
        timeStamp: number,
        transitionType: TransitionType,
        transitionQualifiers: TransitionQualifier[],
    }>;

    const onBeforeNavigate: NavListener<{
        tabId: number,
        url: string,
        processId: number,
        frameId: number,
        parentFrameId: number,
        timeStamp: number,
    }>;

    const onCommitted: TransitionNavListener;

    const onCreatedNavigationTarget: NavListener<{
        sourceFrameId: number,
        // Unsupported: sourceProcessId: number,
        sourceTabId: number,
        tabId: number,
        timeStamp: number,
        url: string,
        windowId: number,
    }>;

    const onDOMContentLoaded: DefaultNavListener;

    const onCompleted: DefaultNavListener;

    const onErrorOccurred: DefaultNavListener; // error field unsupported

    const onReferenceFragmentUpdated: TransitionNavListener;

    const onHistoryStateUpdated: TransitionNavListener;
}

declare namespace crmbrowser.webRequest {
    type ResourceType = "main_frame" | "sub_frame" | "stylesheet" | "script" | "image" | "object"
                      | "xmlhttprequest" | "xbl" | "xslt" | "ping" | "beacon" | "xml_dtd" | "font"
                      | "media" | "websocket" | "csp_report" | "imageset" | "web_manifest"
                      | "other";

    type RequestFilter = {
        urls: string[],
        types?: ResourceType[],
        tabId?: number,
        windowId?: number,
    };

    type StreamFilter = {
        onstart: (event: any) => void;
        ondata: (event: { data: ArrayBuffer }) => void;
        onstop: (event: any) => void;
        onerror: (event: any) => void;

        close(): BrowserReturnValue<void>;
        disconnect(): BrowserReturnValue<void>;
        resume(): BrowserReturnValue<void>;
        suspend(): BrowserReturnValue<void>;
        write(data: Uint8Array | ArrayBuffer): BrowserReturnValue<void>;

        error: string;
        status: "uninitialized" | "transferringdata" | "finishedtransferringdata" | "suspended" | "closed" | "disconnected" | "failed";
    }

    type HttpHeaders = ({ name: string, binaryValue: number[], value?: string }
                        | { name: string, value: string, binaryValue?: number[] })[];

    type BlockingResponse = {
        cancel?: boolean,
        redirectUrl?: string,
        requestHeaders?: HttpHeaders,
        responseHeaders?: HttpHeaders,
        // unsupported: authCredentials?: { username: string, password: string },
    };

    type UploadData = {
        bytes?: ArrayBuffer,
        file?: string,
    };

    const MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES: number;

    function handlerBehaviorChanged(): BrowserReturnValue<void>;

    // TODO: Enforce the return result of the addListener call in the contract
    //       Use an intersection type for all the default properties
    interface ReqListener<T, U> {
        addListener: (
            callback: (arg: T) => void,
            filter: RequestFilter,
            extraInfoSpec?: Array<U>,
        ) => BlockingResponse|BrowserReturnValue<BlockingResponse>;
        removeListener: (callback: (arg: T) => void) => void;
        hasListener: (callback: (arg: T) => void) => boolean;
    }

    const onBeforeRequest: ReqListener<{
        requestId: string,
        url: string,
        method: string,
        frameId: number,
        parentFrameId: number,
        requestBody?: {
            error?: string,
            formData?: { [key: string]: string[] },
            raw?: UploadData[],
        },
        tabId: number,
        type: ResourceType,
        timeStamp: number,
        originUrl: string,
    }, "blocking"|"requestBody">;

    const onBeforeSendHeaders: ReqListener<{
        requestId: string,
        url: string,
        method: string,
        frameId: number,
        parentFrameId: number,
        tabId: number,
        type: ResourceType,
        timeStamp: number,
        originUrl: string,
        requestHeaders?: HttpHeaders,
    }, "blocking"|"requestHeaders">;

    const onSendHeaders: ReqListener<{
        requestId: string,
        url: string,
        method: string,
        frameId: number,
        parentFrameId: number,
        tabId: number,
        type: ResourceType,
        timeStamp: number,
        originUrl: string,
        requestHeaders?: HttpHeaders,
    }, "requestHeaders">;

    const onHeadersReceived: ReqListener<{
        requestId: string,
        url: string,
        method: string,
        frameId: number,
        parentFrameId: number,
        tabId: number,
        type: ResourceType,
        timeStamp: number,
        originUrl: string,
        statusLine: string,
        responseHeaders?: HttpHeaders,
        statusCode: number,
    }, "blocking"|"responseHeaders">;

    const onAuthRequired: ReqListener<{
        requestId: string,
        url: string,
        method: string,
        frameId: number,
        parentFrameId: number,
        tabId: number,
        type: ResourceType,
        timeStamp: number,
        scheme: string,
        realm?: string,
        challenger: { host: string, port: number },
        isProxy: boolean,
        responseHeaders?: HttpHeaders,
        statusLine: string,
        statusCode: number,
    }, "blocking"|"responseHeaders">;

    const onResponseStarted: ReqListener<{
        requestId: string,
        url: string,
        method: string,
        frameId: number,
        parentFrameId: number,
        tabId: number,
        type: ResourceType,
        timeStamp: number,
        originUrl: string,
        ip?: string,
        fromCache: boolean,
        statusLine: string,
        responseHeaders?: HttpHeaders,
        statusCode: number,
    }, "responseHeaders">;

    const onBeforeRedirect: ReqListener<{
        requestId: string,
        url: string,
        method: string,
        frameId: number,
        parentFrameId: number,
        tabId: number,
        type: ResourceType,
        timeStamp: number,
        originUrl: string,
        ip?: string,
        fromCache: boolean,
        statusCode: number,
        redirectUrl: string,
        statusLine: string,
        responseHeaders?: HttpHeaders,
    }, "responseHeaders">;

    const onCompleted: ReqListener<{
        requestId: string,
        url: string,
        method: string,
        frameId: number,
        parentFrameId: number,
        tabId: number,
        type: ResourceType,
        timeStamp: number,
        originUrl: string,
        ip?: string,
        fromCache: boolean,
        statusCode: number,
        statusLine: string,
        responseHeaders?: HttpHeaders,
    }, "responseHeaders">;

    const onErrorOccurred: ReqListener<{
        requestId: string,
        url: string,
        method: string,
        frameId: number,
        parentFrameId: number,
        tabId: number,
        type: ResourceType,
        timeStamp: number,
        originUrl: string,
        ip?: string,
        fromCache: boolean,
        error: string,
    }, void>;

    function filterResponseData(requestId: string): StreamFilter;
}

declare namespace crmbrowser.windows {
    type WindowType = "normal" | "popup" | "panel" | "devtools";

    type WindowState = "normal" | "minimized" | "maximized" | "fullscreen" | "docked";

    type Window = {
        id?: number,
        focused: boolean,
        top?: number,
        left?: number,
        width?: number,
        height?: number,
        tabs?: crmbrowser.tabs.Tab[],
        incognito: boolean,
        type?: WindowType,
        state?: WindowState,
        alwaysOnTop: boolean,
        sessionId?: string,
    };

    type CreateType = "normal" | "popup" | "panel" | "detached_panel";

    const WINDOW_ID_NONE: number;

    const WINDOW_ID_CURRENT: number;

    function get(windowId: number, getInfo?: {
        populate?: boolean,
        windowTypes?: WindowType[],
    }): BrowserReturnValue<crmbrowser.windows.Window>;

    function getCurrent(getInfo?: {
        populate?: boolean,
        windowTypes?: WindowType[],
    }): BrowserReturnValue<crmbrowser.windows.Window>;

    function getLastFocused(getInfo?: {
        populate?: boolean,
        windowTypes?: WindowType[],
    }): BrowserReturnValue<crmbrowser.windows.Window>;

    function getAll(getInfo?: {
        populate?: boolean,
        windowTypes?: WindowType[],
    }): BrowserReturnValue<crmbrowser.windows.Window[]>;

    // TODO: url and tabId should be exclusive
    function create(createData?: {
        url?: string|string[],
        tabId?: number,
        left?: number,
        top?: number,
        width?: number,
        height?: number,
        // unsupported: focused?: boolean,
        incognito?: boolean,
        type?: CreateType,
        state?: WindowState,
    }): BrowserReturnValue<crmbrowser.windows.Window>;

    function update(windowId: number, updateInfo: {
        left?: number,
        top?: number,
        width?: number,
        height?: number,
        focused?: boolean,
        drawAttention?: boolean,
        state?: WindowState,
    }): BrowserReturnValue<crmbrowser.windows.Window>;

    function remove(windowId: number): BrowserReturnValue<void>;

    const onCreated: CRMBrowserListener<crmbrowser.windows.Window>;

    const onRemoved: CRMBrowserListener<number>;

    const onFocusChanged: CRMBrowserListener<number>;
}

declare namespace crmbrowser.theme {

    type Theme = {
        images: ThemeImages,
        colors: ThemeColors,
        properties?: ThemeProperties,
    };

    type ThemeImages = {
        headerURL: string,
        theme_frame?: string,
        additional_backgrounds?: string[],
    };

    type ThemeColors = {
        accentcolor: string,
        textcolor: string,
        frame?: [number, number, number],
        tab_text?: [number, number, number],
        toolbar?: string,
        toolbar_text?: string,
        toolbar_field?: string,
        toolbar_field_text?: string,
    };

    type ThemeProperties = {
        additional_backgrounds_alignment: Alignment[],
        additional_backgrounds_tiling: Tiling[],
    }

    type Alignment =
        | 'bottom' | 'center' | 'left' | 'right' | 'top'
        | 'center bottom' | 'center center' | 'center top'
        | 'left bottom' | 'left center' | 'left top'
        | 'right bottom' | 'right center' | 'right top';

    type Tiling = 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';

    function getCurrent(): BrowserReturnValue<Theme>;
    function getCurrent(windowId: number): BrowserReturnValue<Theme>;
    function update(theme: Theme): BrowserReturnValue<void>;
    function update(windowId: number, theme: Theme): BrowserReturnValue<void>;
    function reset(): BrowserReturnValue<void>;
    function reset(windowId: number): BrowserReturnValue<void>;
}