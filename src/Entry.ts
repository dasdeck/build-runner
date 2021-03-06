import * as path from 'path';
import * as fs from 'fs';

import {Content, EntryLike} from './interface';



export default class Entry implements EntryLike {

    src?: string
    content?: Content
    dest:string = ''

    constructor(data: EntryLike) {
        if (data instanceof Entry) {
            throw 'do not create entry from entry (yet)';
        }

        if (!data.src && !data.content) {
            throw 'who needs entries without source nor content?'
        }

        if (!data.dest && data.src) {
            this.dest = data.src;
            // throw 'entry needs a dest';
        }
        Object.assign(this, data);

    }

    static forceEntry(data?: any): Entry | void {

        if (data instanceof Entry) {
            return data;
        } else if (typeof data === 'object') {
            return new Entry(data);
        }
    }

    inDest(dest?: string): Entry {
        if (dest) {
            return new Entry({...this, dest: path.join(dest, this.dest || '')})
        } else {
            return this;
        }
    }

    loadContent(encoding = 'utf8'): Content | void {
        if (this.src && fs.existsSync(this.src)) {
            this.content = fs.readFileSync(this.src, encoding);
            return this.content
        }
    }
}