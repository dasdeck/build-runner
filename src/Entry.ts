import * as path from 'path';
import * as fs from 'fs';

import {Content, EntryLike, GenericObject, Class} from './interface';
import {isFunction, isUndefined} from './util';


export default class Entry implements EntryLike {

    src?: string
    content?: Content
    dest:string = ''

    constructor(data: EntryLike) {

        if (data instanceof Entry) {
            throw new Error('do not create entry from entry (yet)');
        }

        if (!data.src && isUndefined(data.content)) {
            throw new Error('who needs entries without source nor content?');
        }

        if (!data.dest && data.src) {
            this.dest = data.src;
            // throw 'entry needs a dest';
        }
        Object.assign(this, data);

    }

    static forceEntry(data?: any, prototype: Class = Entry): Entry | void {

        if (data instanceof Entry) {
            return data;
        } else if (typeof data === 'object') {
            return new prototype(data);
        }
    }

    getData(): GenericObject {
        return {
            src: this.src,
            dest: this.dest,
            content: this.content
        }
    }


    with(data: Function | GenericObject = {}):Entry {

        if (isFunction(data)) {
            data = data(this);
        }

        return new (this.constructor as any)({...this, ...data});

    }

    withContent(content: Function | Content): Entry {
        return this.with({content: isFunction(content) ? content(this.loadContent()) : content})
    }

    inDest(dest?: string): Entry {
        if (dest) {
            return this.with({dest: path.join(dest, this.dest || '')});
        } else {
            return this;
        }
    }



    loadContent(encoding: string | null = 'utf8', override: boolean = false): Content | void {
        if ((!this.content || override) && this.src && fs.existsSync(this.src)) {
            this.content = fs.readFileSync(this.src, encoding);
        }
        return this.content
    }
}