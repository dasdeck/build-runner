import {EntrySet, EntryLike, GenericObject, Content, InputLike, Input} from './interface';
import Entry from './Entry';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs';
import { ensureArray } from './util';
import * as micromatch from 'micromatch';

declare abstract class AdmZipEntry {
    entryName: string
    abstract getData():Buffer
    wrapper: ZipEntry
}

// type AdvancedEntrySet = EntrySet & {glob: Function};
type EntryMap = GenericObject<Entry>;


export class ZipEntry extends Entry {

    _entry: AdmZipEntry
    _data?: Buffer
    _content?: Content
    _src: string

    constructor (data: EntryLike, entry: AdmZipEntry) {
        super(data);
        this._entry = entry || (data as ZipEntry)._entry;

        this._src = this._entry.entryName;

        if (!this._entry) {
            throw new Error('Wrapper entries need an AdmZip entry' + JSON.stringify(this));
        }

        this._entry.wrapper = this;

    }

    isConnected() {
        return this._entry.wrapper === this;
    }

    get content(): Content {
        if (this._content) {
            return this._content;

        } else if (!this._data) {
            this._data = this._entry.getData();
        }
        return this._data;
    }

    set content(content: Content) {
        this._content = content;
    }

    loadContent(encoding: string = 'utf8'): String {
        return this.content.toString(encoding);
    }

    set src(val) {

    }

    get src(): string {
        return this._src;
    }

    get dest() {
        return this._entry.entryName;
    }

    set dest(val) {
        if (this._entry) {
            this._entry.entryName = val;
        }
    }

}
export default class Zip extends Entry {

    content?: AdmZip
    _entries: EntryMap = {}

    constructor(data?: EntryLike, options: GenericObject = {}) {
        super(data || {content: '', dest: 'zip'});

        if (this.content instanceof Array) {
            this.setEntries(this.content);
            delete this.content;
        }
    }

    get baseZip(): AdmZip {

        if (!this.content && this.src) {
            this.content = new AdmZip(this.src);
            delete this.src;
        } else if (this.content instanceof Buffer) {
            this.content = new AdmZip(this.content);
        } else if (!this.content) {
            this.content = new AdmZip();
        }
        return this.content;
    }


    setEntry(entry: Entry, replace = true) {
        if (!entry.dest) {
            throw new Error('entries need a target!');
        }

        if (!replace && this._entries[entry.dest]) {
            throw new Error("entry already assigned");
        }

        this._entries[entry.dest] = entry;
    }

    get entries(): EntrySet {

        const base = this.baseZip.getEntries().reduce((map: EntryMap, e: any) => {

            const entry = e.wrapper || new ZipEntry({src: 'src'}, e as AdmZipEntry);
            map[entry.dest] = entry;
            return map;

        }, {});

        const map = Object.assign({}, base, this._entries);
        const res = Object.keys(map).map(name => map[name]);
        return res;

    }

    withMatchMapping(map: GenericObject<string>):Zip {

        const content = Object.keys(map).reduce((content: EntrySet, match: string) => {
            const dest = map[match];
            return this.entries.reduce((content: EntrySet, entry: Entry) => {
                const remapped = entry.match(match, (match: string) => entry.withDest(dest, match));
                if (remapped) {
                    content.push(remapped);
                }
                return content;
            }, content);

        }, []);

        return new Zip({content});
    }

    withInputMapping(map: Input[]):Zip {

        const content = map.reduce((entries: EntrySet, input:Input) => {
            const src = ensureArray(input.src);
            const base = input.base || '';
            const dest = input.dest || '';
            return src.reduce((entries, src) => {
                const matchingEntries = this.glob(path.join(base, src || ''))
                    .map((entry:Entry) => entry.with({dest: path.join(dest, entry.dest.substr(base.length))}));
                return entries.concat(matchingEntries);
            }, entries);

        }, []);

        return new Zip({content});
    }

    glob(pattern: string) {
        return this.entries.filter((entry:Entry) => micromatch([entry.dest], pattern));
    }

    set entries(entries: EntrySet) {
        this.setEntries(entries);
    }

    setEntries(entries: EntrySet) {
        entries.forEach(entry => this.setEntry(entry));
    }

    extractAllTo(dest: string, overwrite?: boolean ) {
        this.toAdm().extractAllTo(dest, overwrite);
    }

    writeZip(p: string) {
        this.toAdm().writeZip(p);
    }

    toBuffer():Buffer {
        return this.toAdm().toBuffer();
    }

    toAdm(): AdmZip {

        const zip = new AdmZip;

        this.entries.forEach(entry => {

            if (entry.content) {

                if (entry.content instanceof Buffer) {
                    if (entry.content.length) {
                        zip.addFile(entry.dest, entry.content);
                    }
                } else if (entry.content instanceof Zip) {
                    zip.addFile(entry.dest, entry.content.toAdm().toBuffer());
                } else if (typeof entry.content === 'string') {
                    zip.addFile(entry.dest, Buffer.from(entry.content));
                }
            } else if (entry.src) {

                if (path.basename(entry.src) !== path.basename(entry.dest)) {
                    // write content manually to account for renamed entry
                    zip.addFile(entry.dest, fs.readFileSync(entry.src));
                } else {
                    zip.addLocalFile(entry.src, path.dirname(entry.dest));
                }

            }

        });

        return zip;
    }


}