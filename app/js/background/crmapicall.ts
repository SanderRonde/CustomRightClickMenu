import { MessageHandling } from "./messagehandling.js";
import { CRMAPIFunctions } from "./crmapifunctions.js";
import { ModuleData } from "./moduleTypes";

export namespace CRMAPICall {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	interface CRMParent<T> {
		children?: T[] | void;
	}

	type TypeCheckTypes = 'string' | 'function' | 'number' | 'object' | 'array' | 'boolean';

	interface TypeCheckConfig {
		val: string;
		type: TypeCheckTypes | TypeCheckTypes[];
		optional?: boolean;
		forChildren?: {
			val: string;
			type: TypeCheckTypes | TypeCheckTypes[];
			optional?: boolean;
		}[];
		dependency?: string;
		min?: number;
		max?: number;
	}

	const enum TypecheckOptional {
		OPTIONAL = 1,
		REQUIRED = 0
	}

	const enum MoveTarget {
		NOT_PLACED,
		NOT_SAME_TREE,
		SAME_TREE_PLACED_BEFORE,
		SAME_TREE_PLACED_AFTER
	}

	type GetNodeFromIdCallback<T> = {
		run: (callback: (node: T) => void) => void;
	};

	export class Instance {
		constructor(public message: MessageHandling.CRMAPICallMessage, 
			public action: MessageHandling.CRMAPICallMessage['action']) {
				if (action === null) {
					return;
				}
				const parts = action.split('.');
				let current: any = CRMAPIFunctions;
				for (const part of parts) {
					current = current[part as keyof typeof current];
				}
				current(this);
			}

		respondSuccess(...args: any[]) {
			modules.APIMessaging.CRMMessage.respond(this.message, 'success', args);
			return true;
		}

		respondError(error: string) {
			modules.APIMessaging.CRMMessage.respond(this.message, 'error', error);
		}

		lookup<T>(path: number[],
			data: CRMParent<T>[]): T | boolean;
		lookup<T>(path: number[], data: CRMParent<T>[], hold: true):
			T[] | boolean | void;
		lookup<T>(path: number[], data: CRMParent<T>[], hold: false):
			T | boolean | void;
		lookup<T>(path: number[], data: CRMParent<T>[],
			hold: boolean = false):
			T | T[] | boolean | void {
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
				if (hold) {
					return (data as T[]) || false;
				} else {
					return (data[path[length]] as T) || false;
				}
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
			private static _targetIndex(tree: CRM.Node[], node: CRM.Node) {
				for (let i = 0; i < tree.length; i++) {
					if (tree[i].id === node.id) {
						return i
					}
				}
				return -1;
			}

			private static _genMoveTargetReturn(index: number, placedAfter: boolean): MoveTarget {
				if (index !== -1) {
					if (placedAfter) {
						return MoveTarget.SAME_TREE_PLACED_AFTER;
					}
					return MoveTarget.SAME_TREE_PLACED_BEFORE;
				}
				return MoveTarget.NOT_SAME_TREE;
			}

			static before(isRoot: boolean, node: CRM.Node, relativeNode: any,
				__this: Instance): MoveTarget {
					if (isRoot) {
						const targetIndex = this._targetIndex(modules.crm.crmTree, node);
						modules.Util.pushIntoArray(node, 0, modules.crm.crmTree);
						return this._genMoveTargetReturn(targetIndex, false);
					} else {
						const parentChildren = __this.lookup(relativeNode.path, 
							modules.crm.crmTree, true) as CRM.Node[];
						const targetIndex = this._targetIndex(parentChildren, node);
						modules.Util.pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
						return this._genMoveTargetReturn(targetIndex, 
							relativeNode.path[relativeNode.path.length - 1] > targetIndex);
					}
				}
			static firstSibling(isRoot: boolean, node: CRM.Node, relativeNode: any,
				__this: Instance): MoveTarget {
					if (isRoot) {
						const targetIndex = this._targetIndex(modules.crm.crmTree, node);
						modules.Util.pushIntoArray(node, 0, modules.crm.crmTree);
						return this._genMoveTargetReturn(targetIndex, false);
					} else {
						const parentChildren = __this.lookup((relativeNode as any).path, 
							modules.crm.crmTree, true) as CRM.Node[];
						const targetIndex = this._targetIndex(parentChildren, node);
						modules.Util.pushIntoArray(node, 0, parentChildren);
						return this._genMoveTargetReturn(targetIndex, false);
					}
				}
			static after(isRoot: boolean, node: CRM.Node, relativeNode: any, __this: Instance): MoveTarget {
				if (isRoot) {
					const targetIndex = this._targetIndex(modules.crm.crmTree, node);
					modules.Util.pushIntoArray(node, modules.crm.crmTree.length,
						modules.crm.crmTree);
					return this._genMoveTargetReturn(targetIndex, true);
				} else {
					const parentChildren = __this.lookup(relativeNode.path, 
						modules.crm.crmTree, true) as CRM.Node[];
					const targetIndex = this._targetIndex(parentChildren, node);
					if (relativeNode.path.length > 0) {
						modules.Util.pushIntoArray(node, 
							relativeNode.path[relativeNode.path.length - 1] + 1,
							parentChildren);
						return this._genMoveTargetReturn(targetIndex, 
							relativeNode.path[relativeNode.path.length - 1] >= targetIndex);
					}
					return MoveTarget.NOT_PLACED;
				}
			}
			static lastSibling(isRoot: boolean, node: CRM.Node, relativeNode: any, __this: Instance): MoveTarget {
				if (isRoot) {
					const targetIndex = this._targetIndex(modules.crm.crmTree, node);
					modules.Util.pushIntoArray(node, modules.crm.crmTree.length,
						modules.crm.crmTree);
					return this._genMoveTargetReturn(targetIndex, true);
				} else {
					const parentChildren = __this.lookup((relativeNode as any).path, 
					modules.crm.crmTree, true) as CRM.Node[];
					const targetIndex = this._targetIndex(parentChildren, node);
					modules.Util.pushIntoArray(node, parentChildren.length, parentChildren);
					return this._genMoveTargetReturn(targetIndex, true);
				}
			}
			static firstChild(isRoot: boolean, node: CRM.Node, relativeNode: any,
				__this: Instance): {
					target: MoveTarget;
					success: boolean;
				} {
					if (isRoot) {
						const targetIndex = this._targetIndex(modules.crm.crmTree, node);
						modules.Util.pushIntoArray(node, 0, modules.crm.crmTree);
						return {
							success: true,
							target: this._genMoveTargetReturn(targetIndex, false)
						}
					} else if ((relativeNode as CRM.Node).type === 'menu') {
						const { children } = relativeNode as CRM.MenuNode;
						const targetIndex = this._targetIndex(children, node);
						modules.Util.pushIntoArray(node, 0, children);
						return {
							success: true,
							target: this._genMoveTargetReturn(targetIndex, false)
						}
					} else {
						__this.respondError('Supplied node is not of type "menu"');
						return {
							success: false,
							target: MoveTarget.NOT_PLACED
						}
					}
				}
			static lastChild(isRoot: boolean, node: CRM.Node, relativeNode: any, __this: Instance): {
				target: MoveTarget;
				success: boolean;
			} {
				if (isRoot) {
					const targetIndex = this._targetIndex(modules.crm.crmTree, node);
					modules.Util.pushIntoArray(node, modules.crm.crmTree.length,
						modules.crm.crmTree);
					return {
						success: true,
						target: this._genMoveTargetReturn(targetIndex, true)
					}
				} else if ((relativeNode as CRM.MenuNode).type === 'menu') {
					const { children } = relativeNode as CRM.MenuNode;
					const targetIndex = this._targetIndex(children, node);
					modules.Util.pushIntoArray(node, children.length, children);
					return {
						success: true,
						target: this._genMoveTargetReturn(targetIndex, true)
					}
				} else {
					__this.respondError('Supplied node is not of type "menu"');
					return {
						success: false,
						target: MoveTarget.NOT_PLACED
					}
				}
			}
		}
		async moveNode(node: CRM.Node, position: {
			node?: number;
			relation?: 'firstChild' | 'firstSibling' | 'lastChild' | 'lastSibling' | 'before' |
			'after';
		}, removeOld?: {
			children: CRM.Node[];
			id: number;
		}): Promise<false | CRM.Node> {
			const crmFunction = this;

			//Capture old CRM tree
			const oldCrmTree = JSON.parse(JSON.stringify(modules.crm.crmTree));

			//Put the node in the tree
			let relativeNode: CRM.Node[] | CRM.Node | false;
			position = position || {};

			if (!this.checkType(position, 'object', 'position')) {
				return false;
			}

			if (!this.checkType(position.node, 'number', 'node', TypecheckOptional.OPTIONAL, null, false, () => {
				relativeNode = crmFunction.getNodeFromId(position.node, false, true);
			})) {
				return false;
			}

			if (!this.checkType(position.relation, 'string', 'relation',
				TypecheckOptional.OPTIONAL)) {
				return false;
			}
			relativeNode = relativeNode || modules.crm.crmTree;

			const isRoot = relativeNode === modules.crm.crmTree;

			let target: MoveTarget;
			switch (position.relation) {
				case 'before':
					target = Instance.MoveNode.before(isRoot, node, relativeNode, this);
					break;
				case 'firstSibling':
					target = Instance.MoveNode.firstSibling(isRoot, node, relativeNode, this);
					break;
				case 'after':
					target = Instance.MoveNode.after(isRoot, node, relativeNode, this);
					break;
				case 'lastSibling':
					target = Instance.MoveNode.lastSibling(isRoot, node, relativeNode, this);
					break;
				case 'firstChild':
					const { 
						success: successFirstChild, 
						target: targetFirstChild 
					} = Instance.MoveNode.firstChild(isRoot, node, relativeNode, this);
					target = targetFirstChild;
					if (!successFirstChild) {
						return false;
					}
					break;
				default:
				case 'lastChild':
					const { 
						success: successLastChild, 
						target: targetLastChild 
					} = Instance.MoveNode.lastChild(isRoot, node, relativeNode, this);
					target = targetLastChild;
					if (!successLastChild) {
						return false;
					}
					break;
			}

			if (removeOld && target !== MoveTarget.NOT_PLACED) {
				let foundFirst: boolean = false;
				for (let i = 0; i < removeOld.children.length; i++) {
					if (removeOld.children[i].id === removeOld.id) {
						if (target === MoveTarget.NOT_SAME_TREE ||
							target === MoveTarget.SAME_TREE_PLACED_AFTER) {
								removeOld.children.splice(i, 1);
								break;
							}
						if (target === MoveTarget.SAME_TREE_PLACED_BEFORE) {
							if (foundFirst) {
								removeOld.children.splice(i, 1);
								break;		
							} else {
								foundFirst = true;
							}
						}
					}
				}
			}

			//Update settings
			await modules.Storages.applyChanges({
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
			type: TypeCheckTypes | TypeCheckTypes[];
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
		}>(data: TypeCheckConfig, values: T[]): boolean {
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

		typeCheck(toCheck: TypeCheckConfig[], callback: (optionals?: {
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

		checkPermissions(toCheck: CRM.Permission[],
			callback?: (optional: any) => void) {
				const optional: any[] = [];
				let permitted = true;
				let node: CRM.Node;
				if (!(node = modules.crm.crmById[this.message.id])) {
					this.respondError('The node you are running this script from no longer exist, no CRM API calls are allowed');
					return false;
				}

				if (node.isLocal) {
					callback && callback(optional);
				} else {
					let notPermitted: CRM.Permission[] = [];
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