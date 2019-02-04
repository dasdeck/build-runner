"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cache = /** @class */ (function () {
    function Cache() {
        this.data = {};
    }
    Cache.prototype.persistResult = function (key, getter) {
        var _this = this;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var cachedValue = this.get(key);
        if (typeof cachedValue === 'undefined') {
            return Promise.resolve(getter.apply(void 0, args)).then(function (val) { return _this.set(key, val); });
        }
        else {
            return Promise.resolve(cachedValue);
        }
    };
    Cache.prototype.get = function (key, value) {
        var cachedValue = this.data[key];
        return typeof cachedValue === 'undefined' ? value : cachedValue;
    };
    Cache.prototype.set = function (key, value) {
        this.data[key] = value;
        return value;
    };
    return Cache;
}());
exports.default = Cache;
