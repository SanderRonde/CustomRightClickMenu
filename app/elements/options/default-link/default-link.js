var DefaultLinkElement;
(function (DefaultLinkElement) {
    DefaultLinkElement.defaultLinkProperties = {
        searchEngine: {
            type: Boolean,
            notify: true,
            value: false
        },
        href: {
            type: String,
            notify: true
        },
        defaultName: {
            type: String,
            notify: true
        }
    };
    var DL = (function () {
        function DL() {
        }
        DL.onClick = function () {
            var link = this.href;
            var name = this.$.input.$$('input').value;
            window.app.uploading.createRevertPoint();
            window.app.crm.add(window.app.templates.getDefaultLinkNode({
                id: window.app.generateItemId(),
                name: name,
                value: [{
                        url: link,
                        newTab: true
                    }]
            }));
        };
        ;
        DL.reset = function () {
            this.$.input.value = this.defaultName;
        };
        DL.is = 'default-link';
        DL.properties = DefaultLinkElement.defaultLinkProperties;
        return DL;
    }());
    DefaultLinkElement.DL = DL;
    if (window.objectify) {
        window.register(DL);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(DL);
        });
    }
})(DefaultLinkElement || (DefaultLinkElement = {}));
