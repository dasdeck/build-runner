"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var extglob_1 = require("extglob");
var util_1 = require("./util");
var util_2 = require("util");
;
var Entry = /** @class */ (function () {
    function Entry(data) {
        // if (data instanceof Entry) {
        //     throw new Error('do not create entry from entry (yet)');
        // }
        this.dest = '';
        if (!data.src && util_1.isUndefined(data.content)) {
            throw new Error('who needs entries without source nor content?');
        }
        if (!data.dest && data.src) {
            this.dest = data.src;
            // throw 'entry needs a dest';
        }
        Object.assign(this, data);
    }
    Entry.forceEntry = function (data, prototype) {
        if (prototype === void 0) { prototype = Entry; }
        if (data instanceof Entry) {
            return data;
        }
        else if (typeof data === 'object') {
            return new prototype(data);
        }
    };
    Entry.prototype.getData = function () {
        return {
            src: this.src,
            dest: this.dest,
            content: this.content
        };
    };
    Entry.prototype.match = function (pattern, callback) {
        var res = extglob_1.capture(pattern, this.src || this.dest);
        if (res && res.length) {
            if (util_1.isFunction(callback)) {
                return callback(res[0]);
            }
            return res[0];
        }
        return false;
    };
    Entry.prototype.withDest = function (dest) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (util_1.isFunction(dest)) {
            dest = dest(this.dest);
        }
        if (util_2.isString(dest)) {
            dest = path.join.apply(path, [dest].concat(args));
            return this.with({ dest: dest });
        }
        if (dest.dest) {
            var map_1 = dest.dest;
            var base_1 = dest.base || '';
            var srcs = Object.keys(map_1);
            return srcs.reduce(function (result, src) {
                return result || _this.match(path.join(base_1, src), function (match) {
                    return _this.withDest(path.join(map_1[src], match));
                });
            }, null) || this;
        }
        return this;
    };
    Entry.prototype.with = function (data) {
        if (data === void 0) { data = {}; }
        if (util_1.isFunction(data)) {
            data = data(this);
        }
        return new this.constructor(__assign({}, this, data));
    };
    Entry.prototype.withContent = function (content) {
        return this.with({ content: util_1.isFunction(content) ? content(this.loadContent()) : content });
    };
    Entry.prototype.inDest = function (dest) {
        if (dest) {
            return this.withDest(dest, this.dest);
        }
        else {
            return this;
        }
    };
    Entry.prototype.loadContent = function (encoding, override) {
        if (encoding === void 0) { encoding = 'utf8'; }
        if (override === void 0) { override = false; }
        if ((!this.content || override) && this.src && fs.existsSync(this.src)) {
            this.content = fs.readFileSync(this.src, encoding);
        }
        return this.content;
    };
    return Entry;
}());
exports.default = Entry;
