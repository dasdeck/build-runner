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
var Entry = /** @class */ (function () {
    function Entry(data) {
        this.dest = '';
        if (data instanceof Entry) {
            throw 'do not create entry from entry (yet)';
        }
        if (!data.src && !data.content) {
            throw 'who needs entries without source nor content?';
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
    Entry.prototype.clone = function (data) {
        if (data === void 0) { data = {}; }
        return new this.constructor(__assign({}, this, data));
    };
    Entry.prototype.inDest = function (dest) {
        if (dest) {
            return this.clone({ dest: path.join(dest, this.dest || '') });
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
