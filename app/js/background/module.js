"use strict";
exports.__esModule = true;
var CRMBGModule = (function () {
    function CRMBGModule(_globalObject, _modules) {
        this._globalObject = _globalObject;
        this._modules = _modules;
        var _a = _globalObject.globals, storages = _a.storages, background = _a.background, crm = _a.crm, crmValues = _a.crmValues, toExecuteNodes = _a.toExecuteNodes, constants = _a.constants, listeners = _a.listeners;
        this._crm = crm;
        this._storages = storages;
        this._crmValues = crmValues;
        this._constants = constants;
        this._listeners = listeners;
        this._background = background;
        this._toExecuteNodes = toExecuteNodes;
    }
    return CRMBGModule;
}());
exports.CRMBGModule = CRMBGModule;
