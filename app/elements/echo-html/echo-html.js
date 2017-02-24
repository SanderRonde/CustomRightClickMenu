"use strict";
var echoHtmlProperties = {
    html: {
        type: String,
        value: '',
        observer: 'htmlChanged'
    },
    makelink: {
        type: Boolean,
        value: false
    }
};
var EH = (function () {
    function EH() {
    }
    EH.stampHtml = function (html) {
        this.innerHTML = html;
    };
    ;
    EH.makeLinksFromHtml = function (html) {
        html = html && html.replace(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g, '<a target="_blank" href="$1" title="">$1</a>');
        return html;
    };
    ;
    EH.htmlChanged = function () {
        var html = this.html;
        if (this.makelink) {
            html = this.makeLinksFromHtml(html);
        }
        this.stampHtml(html);
    };
    ;
    EH.ready = function () {
        this.htmlChanged();
    };
    return EH;
}());
EH.is = 'echo-html';
EH.properties = echoHtmlProperties;
Polymer(EH);
