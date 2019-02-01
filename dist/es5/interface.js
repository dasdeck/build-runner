"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var Logger = /** @class */ (function () {
    function Logger(config) {
        if (config === void 0) { config = {}; }
        var _this = this;
        this.log = function () { };
        this.info = function () { };
        this.warn = function () { };
        this.error = function () { };
        this.logLevels = ['log', 'info', 'warn', 'error'];
        this.logLevels.forEach(function (name, i) {
            if (i < (config.level || 0)) {
                _this[name] = console[name];
            }
        });
    }
    return Logger;
}());
exports.Logger = Logger;
