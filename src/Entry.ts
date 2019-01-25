import * as path from 'path';
import * as fs from 'fs';

declare class Zip {};
type Content = string|Buffer|Zip;
export default class Entry {

    path?: string
    src?: string
    content?: Content
    dest?:string

    constructor(data: object) {
        if (data instanceof Entry) {
            throw 'do not create entry from entry (yet)';
        }
        Object.assign(this, data);
    }

    get target(): string {
        return path.join(this.dest || '', this.src || '');
    }

    static forceEntry(data?: any): Entry | void {

        if (data instanceof Entry) {
            return data;
        } else if (typeof data === 'object') {
            return new Entry(data);
        }
    }

    loadContent(encoding = 'utf8'): Content | void {
        if (this.path && fs.existsSync(this.path)) {
            this.content = fs.readFileSync(this.path, encoding);
            return this.content
        }
    }
}