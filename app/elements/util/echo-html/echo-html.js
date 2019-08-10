var EchoHtmlElement;
(function (EchoHtmlElement) {
    EchoHtmlElement.echoHtmlProperties = {
        html: {
            type: String,
            value: '',
            observer: 'htmlChanged'
        },
        makelink: {
            type: Boolean,
            value: false
        },
        inline: {
            type: Boolean,
            value: false
        }
    };
    var EH = (function () {
        function EH() {
        }
        EH._stampHtml = function (html) {
            this.$.content.innerHTML = html;
        };
        ;
        EH._makeLinksFromHtml = function (html) {
            html = html && html.replace(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g, '<a rel="noopener" target="_blank" href="$1" title="">$1</a>');
            return html;
        };
        ;
        EH.htmlChanged = function () {
            var html = this.html;
            if (this.makelink) {
                html = this._makeLinksFromHtml(html);
            }
            this._stampHtml(html);
        };
        ;
        EH.ready = function () {
            this.htmlChanged();
            if (this.inline) {
                this.$.content.classList.add('inline');
            }
        };
        EH.is = 'echo-html';
        EH.properties = EchoHtmlElement.echoHtmlProperties;
        return EH;
    }());
    EchoHtmlElement.EH = EH;
    if (window.objectify) {
        window.register(EH);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(EH);
        });
    }
})(EchoHtmlElement || (EchoHtmlElement = {}));
