import { MessageHandling } from "./messagehandling.js";
import { CRMFunctions } from "./crmfunctions.js";
import { ModuleData } from "./moduleTypes";

export namespace CRMFunction {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	interface CRMParent<T> {
		children?: Array<T> | void;
	}

	type TypeCheckTypes = 'string' | 'function' | 'number' | 'object' | 'array' | 'boolean';

	interface TypeCheckConfig {
		val: string;
		type: TypeCheckTypes | Array<TypeCheckTypes>;
		optional?: boolean;
		forChildren?: Array<{
			val: string;
			type: TypeCheckTypes | Array<TypeCheckTypes>;
			optional?: boolean;
		}>;
		dependency?: string;
		min?: number;
		max?: number;
	}

	const enum TypecheckOptional {
		OPTIONAL = 1,
		REQUIRED = 0
	}

	type GetNodeFromIdCallback<T> = {
		run: (callback: (node: T) => void) => void;
	};

	export class Instance {
		constructor(public message: MessageHandling.CRMFunctionMessage, 
			public action: MessageHandling.CRMFunctionMessage['action']) {
				if (action === null) {
					return;
				}
				CRMFunctions[action](this);
			}

		respondSuccess(...args: Array<any>) {
			modules.APIMessaging.CRMMessage.respond(this.message, 'success', args);
			return true;
		}

		respondError(error: string) {
			modules.APIMessaging.CRMMessage.respond(this.message, 'error', error);
		}

		lookup<T>(path: Array<number>,
			data: Array<CRMParent<T>>): CRMParent<T> | boolean;
		lookup<T>(path: Array<number>, data: Array<CRMParent<T>>, hold: boolean):
			Array<CRMParent<T>> | CRMParent<T> | boolean | void;
		lookup<T>(path: Array<number>, data: Array<CRMParent<T>>,
			hold: boolean = false):
			Array<CRMParent<T>> | CRMParent<T> | boolean | void {
			if (path === null || typeof path !== 'object' || !Array.isArray(path)) {
				this.respondError('Supplied path is not of type array');
				return true;
			}
			const length = path.length - 1;
			for (let i = 0; i < length; i++) {
				const next = data[path[i]];
				if (data && next && next.children) {
					data = next.children;
				} else {
					return false;
				}
			}
			return (hold ? data : data[path[length]]) || false;
		}
		checkType(toCheck: any, type: TypeCheckTypes,
			name?: string,
			optional: TypecheckOptional = TypecheckOptional.REQUIRED,
			ifndef?: () => void,
			isArray: boolean = false, ifdef?: () => void) {
			if (toCheck === undefined || toCheck === null) {
				if (optional) {
					if (ifndef) {
						ifndef();
					}
					return true;
				} else {
					if (isArray) {
						this.respondError(`Not all values for ${name} are defined`);
					} else {
						this.respondError(`Value for ${name} is not defined`);
					}
					return false;
				}
			} else {
				if (type === 'array') {
					if (typeof toCheck !== 'object' || Array.isArray(toCheck)) {
						if (isArray) {
							this.respondError(`Not all values for ${name} are of type ${type},` +
								` they are instead of type ${typeof toCheck}`);
						} else {
							this.respondError(`Value for ${name} is not of type ${type},` +
								` it is instead of type ${typeof toCheck}`);
						}
						return false;
					}
				}
				if (typeof toCheck !== type) {
					if (isArray) {
						this.respondError(`Not all values for ${name} are of type ${type},` +
							` they are instead of type ${typeof toCheck}`);
					} else {
						this.respondError(`Value for ${name} is not of type ${type},` +
							` it is instead of type ${typeof toCheck}`);
					}
					return false;
				}
			}
			if (ifdef) {
				ifdef();
			}
			return true;
		}

		private static readonly MoveNode = class MoveNode {
			static before(isRoot: boolean, node: CRM.Node, 
				removeOld: any | boolean, relativeNode: any,
				__this: Instance) {
					if (isRoot) {
						modules.Util.pushIntoArray(node, 0, modules.crm.crmTree);
						if (removeOld && modules.crm.crmTree === removeOld.children
						) {
							removeOld.index++;
						}
					} else {
						const parentChildren = __this.lookup(relativeNode.path, 
							modules.crm.crmTree, true) as Array<CRM.Node>;
						modules.Util.pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
						if (removeOld && parentChildren === removeOld.children) {
							removeOld.index++;
						}
					}
				}
			static firstSibling(isRoot: boolean, node: CRM.Node,
				removeOld: any | boolean, relativeNode: any,
				__this: Instance) {
					if (isRoot) {
						modules.Util.pushIntoArray(node, 0, modules.crm.crmTree);
						if (removeOld && modules.crm.crmTree === removeOld.children) {
							removeOld.index++;
						}
					} else {
						const parentChildren = __this.lookup((relativeNode as any).path, 
							modules.crm.crmTree, true) as Array<CRM.Node>;
						modules.Util.pushIntoArray(node, 0, parentChildren);
						if (removeOld && parentChildren === removeOld.children) {
							removeOld.index++;
						}
					}
				}
			static after(isRoot: boolean, node: CRM.Node, relativeNode: any, __this: Instance) {
				if (isRoot) {
					modules.Util.pushIntoArray(node, modules.crm.crmTree.length,
						modules.crm.crmTree);
				} else {
					const parentChildren = __this.lookup(relativeNode.path, 
						modules.crm.crmTree, true) as Array<CRM.Node>;
					if (relativeNode.path.length > 0) {
						modules.Util.pushIntoArray(node, 
							relativeNode.path[relativeNode.path.length - 1] + 1,
							parentChildren);
					}
				}
			}
			static lastSibling(isRoot: boolean, node: CRM.Node, relativeNode: any, __this: Instance) {
				if (isRoot) {
					modules.Util.pushIntoArray(node, modules.crm.crmTree.length,
						modules.crm.crmTree);
				} else {
					const parentChildren = __this.lookup((relativeNode as any).path, 
						modules.crm.crmTree, true) as Array<CRM.Node>;
					modules.Util.pushIntoArray(node, parentChildren.length, parentChildren);
				}
			}
			static firstChild(isRoot: boolean, node: CRM.Node, removeOld: any | boolean, relativeNode: any,
				__this: Instance) {
				if (isRoot) {
					modules.Util.pushIntoArray(node, 0, modules.crm.crmTree);
					if (removeOld && modules.crm.crmTree === removeOld.children) {
						removeOld.index++;
					}
				} else if ((relativeNode as CRM.Node).type === 'menu') {
					const { children } = relativeNode as CRM.MenuNode;
					modules.Util.pushIntoArray(node, 0, children);
					if (removeOld && children === removeOld.children) {
						removeOld.index++;
					}
				} else {
					__this.respondError('Supplied node is not of type "menu"');
					return false;
				}
				return true;
			}
			static lastChild(isRoot: boolean, node: CRM.Node, relativeNode: any, __this: Instance) {
				if (isRoot) {
					modules.Util.pushIntoArray(node, modules.crm.crmTree.length,
						modules.crm.crmTree);
				} else if ((relativeNode as CRM.MenuNode).type === 'menu') {
					const { children } = relativeNode as CRM.MenuNode;
					modules.Util.pushIntoArray(node, children.length, children);
				} else {
					__this.respondError('Supplied node is not of type "menu"');
					return false;
				}
				return true;
			}
		}
		moveNode(node: CRM.Node, position: {
			node?: number;
			relation?: 'firstChild' | 'firstSibling' | 'lastChild' | 'lastSibling' | 'before' |
			'after';
		}, removeOld: any | boolean = false): false | CRM.Node {
			const crmFunction = this;

			//Capture old CRM tree
			const oldCrmTree = JSON.parse(JSON.stringify(modules.crm.crmTree));

			//Put the node in the tree
			let relativeNode: Array<CRM.Node> | CRM.Node | false;
			position = position || {};

			if (!this.checkType(position, 'object', 'position')) {
				return false;
			}

			if (!this.checkType(position.node, 'number', 'node', TypecheckOptional.OPTIONAL, null, false, () => {
				relativeNode = crmFunction.getNodeFromId(position.node, false, true);
			})) {
				return false;
			}

			if (!relativeNode) {
				return false;
			}

			if (!this.checkType(position.relation, 'string', 'relation',
				TypecheckOptional.OPTIONAL)) {
				return false;
			}
			relativeNode = relativeNode || modules.crm.crmTree;

			const isRoot = relativeNode === modules.crm.crmTree;

			switch (position.relation) {
				case 'before':
					Instance.MoveNode.before(isRoot, node, removeOld, relativeNode, this);
					break;
				case 'firstSibling':
					Instance.MoveNode.firstSibling(isRoot, node, removeOld, relativeNode, this);
					break;
				case 'after':
					Instance.MoveNode.after(isRoot, node, relativeNode, this);
					break;
				case 'lastSibling':
					Instance.MoveNode.lastSibling(isRoot, node, relativeNode, this);
					break;
				case 'firstChild':
					if (!Instance.MoveNode.firstChild(isRoot, node, removeOld, relativeNode, this)) {
						return false;
					}
					break;
				default:
				case 'lastChild':
					if (!Instance.MoveNode.lastChild(isRoot, node, relativeNode, this)) {
						return false;
					}
					break;
			}

			if (removeOld) {
				removeOld.children.splice(removeOld.index, 1);
			}

			//Update settings
			modules.Storages.applyChanges({
				type: 'optionsPage',
				settingsChanges: [
					{
						key: 'crm',
						oldValue: oldCrmTree,
						newValue: JSON.parse(JSON.stringify(modules.crm.crmTree))
					}
				]
			});

			return node;
		}

		getNodeFromId(id: number, makeSafe: true, synchronous: true, _forceValid: true): CRM.SafeNode;
		getNodeFromId(id: number, makeSafe: true, synchronous: true, _forceValid: boolean): CRM.SafeNode | false;
		getNodeFromId(id: number, makeSafe: true, synchronous: true): CRM.SafeNode | false;
		getNodeFromId(id: number, makeSafe: true, synchronous: false): GetNodeFromIdCallback<CRM.SafeNode>;
		getNodeFromId(id: number, makeSafe: false, synchronous: true, _forceValid: true): CRM.Node;
		getNodeFromId(id: number, makeSafe: false, synchronous: true, _forceValid: boolean): CRM.Node | false;
		getNodeFromId(id: number, makeSafe: false, synchronous: true): CRM.Node | false;
		getNodeFromId(id: number, makeSafe: false, synchronous: false): GetNodeFromIdCallback<CRM.SafeNode>;
		getNodeFromId(id: number, makeSafe: boolean, synchronous: boolean): GetNodeFromIdCallback<CRM.Node>|GetNodeFromIdCallback<CRM.SafeNode> | CRM.Node | CRM.SafeNode | false;
		getNodeFromId(id: number, makeSafe: boolean, synchronous: true, _forceValid: true): CRM.Node | CRM.SafeNode;
		getNodeFromId(id: number, makeSafe: boolean, synchronous: true, _forceValid: boolean): CRM.Node | CRM.SafeNode | false;
		getNodeFromId(id: number, makeSafe: boolean, synchronous: true): CRM.Node | CRM.SafeNode | false;
		getNodeFromId(id: number, makeSafe: boolean, synchronous: false): GetNodeFromIdCallback<CRM.Node>|GetNodeFromIdCallback<CRM.SafeNode>;
		getNodeFromId(id: number, makeSafe: boolean): GetNodeFromIdCallback<CRM.Node>|GetNodeFromIdCallback<CRM.SafeNode>;
		getNodeFromId(id: number, makeSafe: true): GetNodeFromIdCallback<CRM.SafeNode>;
		getNodeFromId(id: number, makeSafe: false): GetNodeFromIdCallback<CRM.Node>;
		getNodeFromId(id: number): GetNodeFromIdCallback<CRM.Node>;
		getNodeFromId(id: number, makeSafe: boolean = false, synchronous: boolean = false, _forceValid = false):
			GetNodeFromIdCallback<CRM.Node> | GetNodeFromIdCallback<CRM.SafeNode> | CRM.Node | CRM.SafeNode | false {
			const node = (makeSafe ? modules.crm.crmByIdSafe : modules.crm.crmById)[id];
			if (node) {
				if (synchronous) {
					return node;
				}
				return {
					run(callback: (node: CRM.SafeNode) => void) {
						callback(node);
					}
				};
			} else {
				this.respondError(`There is no node with the id you supplied (${id})`);
				if (synchronous) {
					return false;
				}
				return {
					run: () => { }
				};
			}
		};

		private static _getDotValue<T extends {
			[key: string]: T | U
		}, U>(source: T, index: string): U {
			const indexes = index.split('.');
			let currentValue: T | U = source;
			for (let i = 0; i < indexes.length; i++) {
				if (indexes[i] in (currentValue as any)) {
					currentValue = (currentValue as T)[indexes[i]];
				} else {
					return undefined;
				}
			}
			return currentValue as U;
		}

		private dependencyMet(data: TypeCheckConfig, optionals: {
			[key: string]: any;
			[key: number]: any;
		}): boolean {
			if (data.dependency && !optionals[data.dependency]) {
				optionals[data.val] = false;
				return false;
			}
			return true;
		}

		private _isDefined(data: TypeCheckConfig, value: any, optionals: {
			[key: string]: any;
			[key: number]: any;
		}): boolean | 'continue' {
			//Check if it's defined
			if (value === undefined || value === null) {
				if (data.optional) {
					optionals[data.val] = false;
					return 'continue';
				} else {
					this.respondError(`Value for ${data.val} is not set`);
					return false;
				}
			}
			return true;
		}

		private _typesMatch(data: TypeCheckConfig, value: any): string {
			const types = Array.isArray(data.type) ? data.type : [data.type];
			for (let i = 0; i < types.length; i++) {
				const type = types[i];
				if (type === 'array') {
					if (typeof value === 'object' && Array.isArray(value)) {
						return type;
					}
				}
				if (typeof value === type) {
					return type;
				}
			}
			this.respondError(`Value for ${data.val} is not of type ${types.join(' or ')}`);
			return null;
		}

		private _checkNumberConstraints(data: TypeCheckConfig, value: number): boolean {
			if (data.min !== undefined) {
				if (data.min > value) {
					this.respondError(`Value for ${data.val} is smaller than ${data.min}`);
					return false;
				}
			}
			if (data.max !== undefined) {
				if (data.max < value) {
					this.respondError(`Value for ${data.val} is bigger than ${data.max}`);
					return false;
				}
			}
			return true;
		}

		private _checkArrayChildType(data: TypeCheckConfig, value: any, forChild: {
			val: string;
			type: TypeCheckTypes | Array<TypeCheckTypes>;
			optional?: boolean;
		}): boolean {
			const types = Array.isArray(forChild.type) ? forChild.type : [forChild.type]
			for (let i = 0; i < types.length; i++) {
				const type = types[i];
				if (type === 'array') {
					if (Array.isArray(value)) {
						return true;
					}
				} else if (typeof value === type) {
					return true;
				}
			}
			this.respondError(`For not all values in the array ${data.val} is the property ${
				forChild.val} of type ${types.join(' or ')}`);
			return false;
		}

		private _checkArrayChildrenConstraints<T extends {
			[key: string]: any;
		}>(data: TypeCheckConfig, values: Array<T>): boolean {
			for (const value of values) {
				for (const forChild of data.forChildren) {
					const childValue = value[forChild.val];

					//Check if it's defined
					if (childValue === undefined || childValue === null) {
						if (!forChild.optional) {
							this.respondError(`For not all values in the array ${data.val} is the property ${forChild.val} defined`);
							return false;
						}
					} else if (!this._checkArrayChildType(data, childValue, forChild)) {
						return false;
					}
				}
			}
			return true;
		}

		private _checkConstraints(data: TypeCheckConfig, value: any, optionals: {
			[key: string]: any;
			[key: number]: any;
		}): boolean {
			if (typeof value === 'number') {
				return this._checkNumberConstraints(data, value);
			}
			if (Array.isArray(value) && data.forChildren) {
				return this._checkArrayChildrenConstraints(data, value);
			}
			return true;
		}

		isBackgroundPage() {
			const isBackground = this.message.tabId === 0;
			if (!isBackground) {
				this.respondError('Call source is not a backgroundpage');
			}
			return isBackground;
		}

		typeCheck(toCheck: Array<TypeCheckConfig>, callback: (optionals?: {
			[key: string]: any;
		}) => void) {
			const optionals: {
				[key: string]: any;
				[key: number]: any;
			} = {};
			for (const data of toCheck) {
				//Skip if dependency not met
				if (!this.dependencyMet(data, optionals)) {
					continue;
				}

				const value = Instance._getDotValue(this.message.data, data.val);
				//Check if it's defined
				const isDefined = this._isDefined(data, value, optionals);
				if (isDefined === true) {
					const matchedType = this._typesMatch(data, value);
					if (matchedType) {
						optionals[data.val] = true;
						this._checkConstraints(data, value, optionals);
						continue;
					}
				} else if (isDefined === 'continue') {
					continue;
				}
				return false;
			}
			callback(optionals);
			return true;
		};

		checkPermissions(toCheck: Array<CRM.Permission>,
			callback?: (optional: any) => void) {
				const optional: Array<any> = [];
				let permitted = true;
				let node: CRM.Node;
				if (!(node = modules.crm.crmById[this.message.id])) {
					this.respondError('The node you are running this script from no longer exist, no CRM API calls are allowed');
					return false;
				}

				if (node.isLocal) {
					callback && callback(optional);
				} else {
					let notPermitted: Array<CRM.Permission> = [];
					if (!node.permissions || modules.Util.compareArray(node.permissions, [])) {
						if (toCheck.length > 0) {
							permitted = false;
							notPermitted = toCheck;
						}
					} else {
						for (const toCheckItem of toCheck) {
							if (node.permissions.indexOf(toCheckItem) === -1) {
								permitted = false;
								notPermitted.push(toCheckItem);
							}
						}
					}

					if (!permitted) {
						modules.storages.insufficientPermissions.push(
							`Script id ${this.message.id} asked for and was rejected permission${
								notPermitted.length === 1 ?
									` ${notPermitted[0]}` : `s ${notPermitted.join(', ')}`
							}`
						);
						this.respondError(`Permission${notPermitted.length === 1 ?
							` ${notPermitted[0]}` : `s ${notPermitted.join(', ')}`
						} are not available to this script.`);
					} else {
						callback && callback(optional.filter((item) => {
							return node.permissions.indexOf(item) !== -1
						}));
					}
				}
				return true;
			};
	}
}