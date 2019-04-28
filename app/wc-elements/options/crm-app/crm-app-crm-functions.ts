import { I18NKeys } from '../../../_locales/i18n-keys.js';
import { CrmApp } from './crm-app';
export class CRMAppCRMFunctions {
	constructor(private _parent: CrmApp) { }
	public get parent() {
		return this._parent;
	}
	getI18NNodeType(nodeType: CRM.NodeType) {
		switch (nodeType) {
			case 'link':
				return this.parent.___(I18NKeys.crm.link);
			case 'script':
				return this.parent.___(I18NKeys.crm.script);
			case 'stylesheet':
				return this.parent.___(I18NKeys.crm.stylesheet);
			case 'menu':
				return this.parent.___(I18NKeys.crm.menu);
			case 'divider':
				return this.parent.___(I18NKeys.crm.divider);
		}
	}
	lookup(path: number[], returnArray?: boolean): CRM.Node | CRM.Node[];
	lookup(path: number[], returnArray: false): CRM.Node;
	lookup(path: number[], returnArray: true): CRM.Node[];
	lookup(path: number[]): CRM.Node;
	lookup(path: number[], returnArray: boolean = false): CRM.Node | CRM.Node[] {
		const pathCopy = JSON.parse(JSON.stringify(path));
		if (returnArray) {
			pathCopy.splice(pathCopy.length - 1, 1);
		}
		if (path.length === 0) {
			return window.app.settings.crm;
		}
		if (path.length === 1) {
			return (returnArray ? window.app.settings.crm : window.app.settings.crm[path[0]]);
		}
		let currentTree = window.app.settings.crm;
		let currentItem: CRM.Node = null;
		let parent: CRM.Node[] = null;
		for (let i = 0; i < path.length; i++) {
			parent = currentTree;
			if (i !== path.length - 1) {
				currentTree = currentTree[path[i]].children as CRM.Node[];
			}
			else {
				currentItem = currentTree[path[i]];
			}
		}
		return (returnArray ? parent : currentItem);
	}
	;
	private _lookupId(id: CRM.GenericNodeId, returnArray: boolean, node: CRM.Node): CRM.Node[] | CRM.Node | void;
	private _lookupId(id: CRM.GenericNodeId, returnArray: false, node: CRM.Node): CRM.Node;
	private _lookupId(id: CRM.GenericNodeId, returnArray: true, node: CRM.Node): CRM.Node[];
	private _lookupId(id: CRM.GenericNodeId, returnArray: boolean, node: CRM.Node): CRM.Node[] | CRM.Node | void {
		const nodeChildren = node.children;
		if (nodeChildren) {
			let el;
			for (let i = 0; i < nodeChildren.length; i++) {
				if (nodeChildren[i].id === id) {
					return (returnArray ? nodeChildren : node);
				}
				el = this._lookupId(id, returnArray, nodeChildren[i]);
				if (el) {
					return el;
				}
			}
		}
		return null;
	}
	;
	lookupId(id: CRM.GenericNodeId, returnArray: boolean): CRM.Node[] | CRM.Node;
	lookupId(id: CRM.GenericNodeId, returnArray: true): CRM.Node[];
	lookupId(id: CRM.GenericNodeId, returnArray: false): CRM.Node;
	lookupId(id: CRM.GenericNodeId, returnArray: boolean): CRM.Node[] | CRM.Node {
		if (!returnArray) {
			return window.app.nodesById.get(id);
		}
		let el;
		for (let i = 0; i < window.app.settings.crm.length; i++) {
			if (window.app.settings.crm[i].id === id) {
				return window.app.settings.crm;
			}
			el = this._lookupId(id, returnArray, window.app.settings.crm[i]);
			if (el) {
				return el;
			}
		}
		return null;
	}
	;
    /**
        * Adds value to the CRM
        */
	add<T extends CRM.Node>(value: T, position: string = 'last') {
		if (position === 'first') {
			this.parent.settings.crm = this.parent.util.insertInto(value, this.parent.settings.crm, 0);
		}
		else if (position === 'last' || position === undefined) {
			this.parent.settings.crm[this.parent.settings.crm.length] = value;
		}
		else {
			this.parent.settings.crm = this.parent.util.insertInto(value, this.parent.settings.crm);
		}
		window.app.upload();
		window.app.editCRM.build({
			setItems: window.app.editCRM.setMenus
		});
	}
	;
    /**
        * Moves a value in the CRM from one place to another
        */
	move(toMove: number[], target: number[]) {
		const toMoveContainer = this.lookup(toMove, true);
		let toMoveIndex = toMove[toMove.length - 1];
		const toMoveItem = toMoveContainer[toMoveIndex];
		const newTarget = this.lookup(target, true);
		const targetIndex = target[target.length - 1];
		const sameColumn = toMoveContainer === newTarget;
		if (sameColumn && toMoveIndex > targetIndex) {
			this.parent.util.insertInto(toMoveItem, newTarget, targetIndex);
			toMoveContainer.splice((~~toMoveIndex) + 1, 1);
		}
		else {
			this.parent.util.insertInto(toMoveItem, newTarget, sameColumn ? targetIndex + 1 : targetIndex);
			toMoveContainer.splice(toMoveIndex, 1);
		}
		window.app.upload();
		//Check if setMenus are still valid
		for (let i = 1; i <= window.app.editCRM.setMenus.length - 1; i++) {
			const lookedup = this.lookup(window.app.editCRM.setMenus.slice(0, i), false);
			if (!lookedup || lookedup.type !== 'menu') {
				window.app.editCRM.setMenus = [-1];
				break;
			}
		}
		window.app.editCRM.build({
			setItems: window.app.editCRM.setMenus,
			quick: true
		});
	}
	;
	buildNodePaths(tree: CRM.Tree, currentPath: number[] = []) {
		for (let i = 0; i < tree.length; i++) {
			const childPath = currentPath.concat([i]);
			const node = tree[i];
			node.path = childPath;
			if (node.children) {
				this.buildNodePaths(node.children, childPath);
			}
		}
	}
	;
}
