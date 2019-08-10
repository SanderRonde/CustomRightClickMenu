var LinkEditElement;
(function (LinkEditElement) {
    LinkEditElement.linkEditProperties = {
        item: {
            type: Object,
            value: {},
            notify: true
        }
    };
    var LE = (function () {
        function LE() {
        }
        LE.init = function () {
            this._init();
        };
        ;
        LE.ready = function () {
            window.linkEdit = this;
        };
        ;
        LE.saveChanges = function (resultStorage) {
            resultStorage.value = [];
            $(this.$.linksContainer).find('.linkChangeCont').each(function () {
                resultStorage.value.push({
                    'url': $(this).children('paper-input')[0].value,
                    'newTab': ($(this).children('paper-checkbox')[0].getAttribute('aria-checked') !== 'true')
                });
            });
        };
        ;
        LE.checkboxStateChange = function (e) {
            var checkbox = window.app.util.findElementWithTagname(e, 'paper-checkbox');
            $(this.$.linksContainer).find('paper-checkbox').each(function () {
                if (this !== checkbox) {
                    this.removeAttribute('checked');
                }
            });
        };
        ;
        LE.addLink = function () {
            window.linkEdit.push('newSettings.value', {
                url: 'https://www.example.com',
                newTab: true
            });
        };
        ;
        LE.toggleCheckbox = function (e) {
            $(window.app.util.findElementWithClassName(e, 'linkChangeCont'))
                .children('paper-checkbox').click();
        };
        LE.is = 'link-edit';
        LE.behaviors = [window.Polymer.NodeEditBehavior];
        LE.properties = LinkEditElement.linkEditProperties;
        return LE;
    }());
    LinkEditElement.LE = LE;
    if (window.objectify) {
        window.register(LE);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(LE);
        });
    }
})(LinkEditElement || (LinkEditElement = {}));
