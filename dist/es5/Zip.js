"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Entry_1 = require("./Entry");
var AdmZip = require("adm-zip");
var path = require("path");
var fs = require("fs");
var AdmWrapperEntry = /** @class */ (function (_super) {
    __extends(AdmWrapperEntry, _super);
    function AdmWrapperEntry(data, entry) {
        var _this = _super.call(this, data) || this;
        _this._entry = entry || data._entry;
        if (!_this._entry) {
            throw 'Wrapper entries need an AdmZip entry';
        }
        _this._entry.wrapper = _this;
        return _this;
    }
    AdmWrapperEntry.prototype.isConnected = function () {
        return this._entry.wrapper === this;
    };
    Object.defineProperty(AdmWrapperEntry.prototype, "content", {
        get: function () {
            if (this._content) {
                return this._content;
            }
            else if (!this._data) {
                this._data = this._entry.getData();
            }
            return this._data;
        },
        set: function (content) {
            this._content = content;
        },
        enumerable: true,
        configurable: true
    });
    AdmWrapperEntry.prototype.loadContent = function (encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return this.content.toString(encoding);
    };
    Object.defineProperty(AdmWrapperEntry.prototype, "dest", {
        get: function () {
            return this._entry.entryName;
        },
        set: function (val) {
            if (this._entry) {
                this._entry.entryName = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    return AdmWrapperEntry;
}(Entry_1.default));
var Zip = /** @class */ (function (_super) {
    __extends(Zip, _super);
    function Zip(data) {
        var _this = _super.call(this, data || { dest: 'zip' }) || this;
        _this._entries = {};
        if (_this.content instanceof Array) {
            _this.setEntries(_this.content);
            delete _this.content;
        }
        return _this;
    }
    Object.defineProperty(Zip.prototype, "baseZip", {
        get: function () {
            if (!this.content && this.src) {
                this.content = new AdmZip(this.src);
                delete this.src;
            }
            else if (this.content instanceof Buffer) {
                this.content = new AdmZip(this.content);
            }
            else if (!this.content) {
                this.content = new AdmZip();
            }
            return this.content;
        },
        enumerable: true,
        configurable: true
    });
    Zip.prototype.setEntry = function (entry, replace) {
        if (replace === void 0) { replace = true; }
        if (!entry.dest) {
            throw 'entries need a target!';
        }
        if (!replace && this._entries[entry.dest]) {
            throw "entry already assigned";
        }
        this._entries[entry.dest] = entry;
    };
    Object.defineProperty(Zip.prototype, "entries", {
        get: function () {
            var base = this.baseZip.getEntries().reduce(function (map, e) {
                var entry = e.wrapper || new AdmWrapperEntry({ src: 'src' }, e);
                map[entry.dest] = entry;
                return map;
            }, {});
            var map = Object.assign({}, base, this._entries);
            return Object.keys(map).map(function (name) { return map[name]; });
        },
        enumerable: true,
        configurable: true
    });
    Zip.prototype.setEntries = function (entries) {
        var _this = this;
        entries.forEach(function (entry) { return _this.setEntry(entry); });
    };
    Zip.prototype.extractAllTo = function (dest, overwrite) {
        this.toAdm().extractAllTo(dest, overwrite);
    };
    Zip.prototype.writeZip = function (p) {
        this.toAdm().writeZip(p);
    };
    Zip.prototype.toBuffer = function () {
        return this.toAdm().toBuffer();
    };
    Zip.prototype.toAdm = function () {
        var zip = new AdmZip;
        this.entries.forEach(function (entry) {
            if (entry.content) {
                if (entry.content instanceof Buffer) {
                    if (entry.content.length) {
                        zip.addFile(entry.dest, entry.content);
                    }
                }
                else if (entry.content instanceof Zip) {
                    zip.addFile(entry.dest, entry.content.toAdm().toBuffer());
                }
                else if (typeof entry.content === 'string') {
                    zip.addFile(entry.dest, Buffer.from(entry.content));
                }
            }
            else if (entry.src) {
                if (path.basename(entry.src) !== path.basename(entry.dest)) {
                    // write content manually to account for renamed entry
                    zip.addFile(entry.dest, fs.readFileSync(entry.src));
                }
                else {
                    zip.addLocalFile(entry.src, path.dirname(entry.dest));
                }
            }
        });
        return zip;
    };
    return Zip;
}(Entry_1.default));
exports.default = Zip;
