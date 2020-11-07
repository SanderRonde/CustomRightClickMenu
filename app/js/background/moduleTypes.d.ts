/// <reference path="../shared.ts" />
/// <reference path="../background/sharedTypes.d.ts"/>
import { GlobalDeclarations } from './global-declarations.js';
import { MessageHandling } from './messagehandling.js';
import { Sandbox, SandboxWorker } from './sandbox.js';
import { BrowserHandler } from './browserhandler.js';
import { CRMAPIFunctions } from './crmapifunctions';
import { APIMessaging } from './api-messaging.js';
import { CRMAPICall } from './crmapicall.js';
import { URLParsing } from './urlparsing.js';
import { Resources } from './resources.js';
import { Storages } from './storages.js';
import { Logging } from './logging.js';
import { CRMNodes } from './crm.js';
import { Caches } from './cache.js';
import { Util } from './util.js';
import {
	BGCRM,
	BGStorages,
	BGCRMValues,
	BGConstants,
	BGListeners,
	BGBackground,
	BGToExecute,
	GlobalObject,
} from './sharedTypes.js';

export interface StorageModules {
	crm: BGCRM;
	storages: BGStorages;
	crmValues: BGCRMValues;
	constants: BGConstants;
	listeners: BGListeners;
	background: BGBackground;
	toExecuteNodes: BGToExecute;
	globalObject: GlobalObject;
}

export interface Modules {
	APIMessaging: typeof APIMessaging;
	BrowserHandler: typeof BrowserHandler;
	Caches: typeof Caches;
	CRMNodes: typeof CRMNodes;
	CRMAPICall: typeof CRMAPICall;
	CRMAPIFunctions: typeof CRMAPIFunctions;
	GlobalDeclarations: typeof GlobalDeclarations;
	Logging: typeof Logging;
	MessageHandling: typeof MessageHandling;
	Resources: typeof Resources;
	Sandbox: typeof Sandbox;
	Storages: typeof Storages;
	URLParsing: typeof URLParsing;
	Util: typeof Util;
}

export type ModuleData = StorageModules & Modules;
