import { CrmApp } from './crm-app';
export class CRMAppUploading {
	constructor(private _parent: CrmApp) { }
	public get parent() {
		return this._parent;
	}
	private _areValuesDifferent(val1: any[] | Object, val2: any[] | Object): boolean {
		//Array or object
		const obj1ValIsArray = Array.isArray(val1);
		let obj2ValIsArray = Array.isArray(val2);
		const obj1ValIsObjOrArray = typeof val1 === 'object';
		let obj2ValIsObjOrArray = typeof val2 === 'object';
		if (obj1ValIsObjOrArray) {
			//Array or object
			if (!obj2ValIsObjOrArray) {
				return true;
			}
			else {
				//Both objects or arrays
				//1 is an array
				if (obj1ValIsArray) {
					//2 is not an array
					if (!obj2ValIsArray) {
						return true;
					}
					else {
						//Both are arrays, compare them
						if (!this.parent.util.compareArray(val1 as any[], val2 as any[])) {
							//Changes have been found, also say the container arrays have changed
							return true;
						}
					}
				}
				else {
					//1 is not an array, check if 2 is
					if (obj2ValIsArray) {
						//2 is an array, changes
						return true;
					}
					else {
						//2 is also not an array, they are both objects
						if (!this.parent.util.compareObj(val1, val2)) {
							//Changes have been found, also say the container arrays have changed
							return true;
						}
					}
				}
			}
		}
		else if (val1 !== val2) {
			//They are both normal string//bool values, do a normal comparison
			return true;
		}
		return false;
	}
	;
	private _getObjDifferences<T, S>(obj1: {
		[key: string]: T;
		[key: number]: T;
	}, obj2: {
		[key: string]: S;
		[key: number]: S;
	}, changes: {
		oldValue: S;
		newValue: T;
		key: any;
	}[]): boolean {
		for (let key in obj1) {
			if (obj1.hasOwnProperty(key)) {
				if (this._areValuesDifferent(obj1[key], obj2[key])) {
					changes.push({
						oldValue: obj2[key],
						newValue: obj1[key],
						key: key
					});
				}
			}
		}
		return changes.length > 0;
	}
	;
	getChanges(force: boolean, { local = this.parent.storageLocal, localCopy = this.parent._storageLocalCopy, sync = this.parent.settings, syncCopy = this.parent._settingsCopy, }: {
		local?: CRM.StorageLocal;
		localCopy?: CRM.StorageLocal;
		sync?: CRM.SettingsStorage;
		syncCopy?: CRM.SettingsStorage;
	} = {
			local: this.parent.storageLocal,
			localCopy: this.parent._storageLocalCopy,
			sync: this.parent.settings,
			syncCopy: this.parent._settingsCopy,
		}): {
			hasLocalChanged: boolean;
			haveSettingsChanged: boolean;
			localChanges: any;
			settingsChanges: any;
		} {
		const localChanges: {
			oldValue: any;
			newValue: any;
			key: any;
		}[] = [];
		const settingsChanges: {
			oldValue: any;
			newValue: any;
			key: any;
		}[] = [];
		const hasLocalChanged = this._getObjDifferences(local, force ? {} : localCopy, localChanges);
		const haveSettingsChanged = this._getObjDifferences(sync, force ? {} : syncCopy, settingsChanges);
		return {
			hasLocalChanged,
			haveSettingsChanged,
			localChanges,
			settingsChanges
		};
	}
	private _updateCopies() {
		this.parent._storageLocalCopy =
			JSON.parse(JSON.stringify(this.parent.storageLocal));
		this.parent._settingsCopy =
			JSON.parse(JSON.stringify(this.parent.settings));
	}
	private _uploadChanges({ hasLocalChanged, haveSettingsChanged, localChanges, settingsChanges }: {
		hasLocalChanged: boolean;
		haveSettingsChanged: boolean;
		localChanges: any;
		settingsChanges: any;
	}) {
		if (hasLocalChanged || haveSettingsChanged) {
			//Changes occured
			browserAPI.runtime.sendMessage({
				type: 'updateStorage',
				data: {
					type: 'optionsPage',
					localChanges: hasLocalChanged && localChanges,
					settingsChanges: haveSettingsChanged && settingsChanges
				}
			});
		}
		this.parent.pageDemo.create();
		this._updateCopies();
	}
	upload(force: boolean) {
		//Send changes to background-page, background-page uploads everything
		//Compare storageLocal objects
		this._uploadChanges(this.getChanges(force));
	}
	;
	private _lastRevertPoint: {
		local: CRM.StorageLocal;
		sync: CRM.SettingsStorage;
	} = null;
	createRevertPoint(showToast: boolean = true, toastTime: number = 10000) {
		if (showToast) {
			window.app.util.showToast('Undo');
			window.app.$.undoToast.duration = toastTime;
			window.app.$.undoToast.show();
		}
		const revertPoint = {
			local: JSON.parse(JSON.stringify(window.app.storageLocal)),
			sync: JSON.parse(JSON.stringify(window.app.settings))
		};
		this._lastRevertPoint = revertPoint;
		return revertPoint;
	}
	showRevertPointToast(revertPoint: {
		local: CRM.StorageLocal;
		sync: CRM.SettingsStorage;
	}, toastTime: number = 10000) {
		window.app.util.showToast('Undo');
		window.app.$.undoToast.duration = toastTime;
		window.app.$.undoToast.show();
		this._lastRevertPoint = revertPoint;
	}
	revert(revertPoint: {
		local: CRM.StorageLocal;
		sync: CRM.SettingsStorage;
	} = this._lastRevertPoint) {
		// Hide the toast if it isn't hidden already
		window.app.$.undoToast.hide();
		if (!this._lastRevertPoint)
			return;
		this._uploadChanges(this.getChanges(false, {
			local: revertPoint.local,
			localCopy: this.parent.storageLocal,
			sync: revertPoint.sync,
			syncCopy: this.parent.settings
		}));
		window.app.settings = revertPoint.sync;
		window.app.updateCrmRepresentation(window.app.settings.crm);
		window.app.editCRM.build();
	}
}
