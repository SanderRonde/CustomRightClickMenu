"use strict";
var Promise = (function () {
    function Promise(_initializer) {
        this._listeners = [];
        this._async = [];
        this._caught = false;
        this._rejectListeners = [];
        this._status = 'pending';
    }
    Promise.prototype.then = function (_onfulfilled, _onrejected) {
        return this;
    };
    Promise.prototype["catch"] = function (_onrejected) {
        return this;
    };
    Promise.all = function (values) {
        var rejected = false;
        return new Promise(function (resolve, reject) {
            var promises = Array.prototype.slice.apply(values).map(function (promise) {
                return {
                    done: false,
                    promise: promise
                };
            });
            if (promises.length === 0) {
                resolve([]);
            }
            else {
                promises.forEach(function (obj) {
                    obj.promise.then(function (result) {
                        obj.done = true;
                        obj.result = result;
                        if (rejected) {
                            return;
                        }
                        if (promises.filter(function (listPromise) {
                            return !listPromise.done;
                        }).length === 0) {
                            resolve(promises.map(function (listPromise) {
                                return listPromise.result;
                            }));
                        }
                    }, function (reason) {
                        reject(reason);
                    });
                });
            }
        });
    };
    Promise.race = function (values) {
        return new Promise(function (resolve, reject) {
            Array.prototype.slice.apply(values).map(function (promise) {
                promise.then(function (result) {
                    resolve(result);
                }, function (reason) {
                    reject(reason);
                });
            });
        });
    };
    Promise.resolve = function (value) {
        return new Promise(function (resolve) {
            resolve(value);
        });
    };
    Promise.reject = function (reason) {
        return new Promise(function (_resolve, reject) {
            reject(reason);
        });
    };
    return Promise;
}());
