export var APIMessaging;
(function (APIMessaging) {
    var CRMMessage;
    (function (CRMMessage) {
        function respond(message, type, data, stackTrace) {
            var msg = {
                type: type,
                callbackId: message.onFinish,
                messageType: 'callback'
            };
            msg.data = (type === 'error' || type === 'chromeError' ? {
                error: data,
                message: data,
                stackTrace: stackTrace,
                lineNumber: message.lineNumber
            } : data);
            try {
                var tabData = APIMessaging.modules.crmValues.tabData;
                var nodes = tabData.get(message.tabId).nodes;
                var port = nodes.get(message.id)[message.tabIndex].port;
                APIMessaging.modules.Util.postMessage(port, msg);
            }
            catch (e) {
                if (e.message === 'Converting circular structure to JSON') {
                    APIMessaging.CRMMessage.respond(message, 'error', 'Converting circular structure to JSON, this API will not work');
                }
                else {
                    throw e;
                }
            }
        }
        CRMMessage.respond = respond;
    })(CRMMessage = APIMessaging.CRMMessage || (APIMessaging.CRMMessage = {}));
})(APIMessaging || (APIMessaging = {}));
(function (APIMessaging) {
    var ChromeMessage;
    (function (ChromeMessage) {
        function throwError(message, error, stackTrace) {
            console.warn('Error:', error);
            if (stackTrace) {
                var stacktraceSplit = stackTrace.split('\n');
                stacktraceSplit.forEach(function (line) {
                    console.warn(line);
                });
            }
            APIMessaging.CRMMessage.respond(message, 'chromeError', error, stackTrace);
        }
        ChromeMessage.throwError = throwError;
        function succeed(message, result) {
            APIMessaging.CRMMessage.respond(message, 'success', result);
        }
        ChromeMessage.succeed = succeed;
    })(ChromeMessage = APIMessaging.ChromeMessage || (APIMessaging.ChromeMessage = {}));
})(APIMessaging || (APIMessaging = {}));
(function (APIMessaging) {
    function initModule(_modules) {
        APIMessaging.modules = _modules;
    }
    APIMessaging.initModule = initModule;
    function createReturn(message, callbackIndex) {
        return function (result) {
            APIMessaging.CRMMessage.respond(message, 'success', {
                callbackId: callbackIndex,
                params: [result]
            });
        };
    }
    APIMessaging.createReturn = createReturn;
    function sendThroughComm(message) {
        var instancesObj = APIMessaging.modules.crmValues.nodeInstances.get(message.id);
        var instancesArr = [];
        APIMessaging.modules.Util.iterateMap(instancesObj, function (tabId, tabInstance) {
            tabInstance.forEach(function (tabIndexInstance, index) {
                instancesArr.push({
                    id: tabId,
                    tabIndex: index,
                    instance: tabIndexInstance
                });
            });
        });
        var args = [];
        var fns = [];
        for (var i = 0; i < message.args.length; i++) {
            if (message.args[i].type === 'fn') {
                fns.push(message.args[i]);
            }
            else if (message.args[i].type === 'arg') {
                if (args.length > 2 && typeof args[0] === 'string') {
                    args = args.slice(1);
                }
                args.push(message.args[i]);
            }
        }
        if (fns.length > 0) {
            console.warn('Message responseCallbacks are not supported');
        }
        for (var i = 0; i < instancesArr.length; i++) {
            var tabData = APIMessaging.modules.crmValues.tabData;
            var nodes = tabData.get(instancesArr[i].id).nodes;
            var port = nodes.get(message.id)[instancesArr[i].tabIndex].port;
            APIMessaging.modules.Util.postMessage(port, {
                messageType: 'instanceMessage',
                message: args[0]
            });
        }
    }
    APIMessaging.sendThroughComm = sendThroughComm;
})(APIMessaging || (APIMessaging = {}));
