"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webdriver = require("selenium-webdriver");
function getCapabilities() {
    return new webdriver.Capabilities({});
}
exports.getCapabilities = getCapabilities;
