"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var Entry = /** @class */ (function () {
    function Entry(data) {
        if (data instanceof Entry) {
            throw 'do not create entry from entry (yet)';
        }
        Object.assign(this, data);
    }
    Object.defineProperty(Entry.prototype, "target", {
        get: function () {
            return path.join(this.dest || '', this.src || '');
        },
        enumerable: true,
        configurable: true
    });
    Entry.forceEntry = function (data) {
        if (data instanceof Entry) {
            return data;
        }
        else if (typeof data === 'object') {
            return new Entry(data);
        }
    };
    Entry.prototype.loadContent = function (encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        if (this.path && fs.existsSync(this.path)) {
            this.content = fs.readFileSync(this.path, encoding);
            return this.content;
        }
    };
    return Entry;
}());
exports.default = Entry;
