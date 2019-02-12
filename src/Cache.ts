import { GenericObject, Content } from "./interface";
import * as path from 'path';
import * as fs from "fs-extra";
import { md5, walkDirSync } from "./util";
import { Zip } from ".";
import { isUndefined } from "util";

interface CacheConfig {
    dir?: string
}
export default class Cache {

    private data: GenericObject = {}
    private config: CacheConfig;

    constructor(config: CacheConfig = {}) {
        this.config = config;
    }

    clear() {
        fs.removeSync(this.dir);
    }

    persistSource(src: string, getter?: Function): Promise<string[]> {
        const cachedValue = this.get(src);

        if (typeof cachedValue === 'undefined') {
            return Promise.resolve(getter && getter()).then(content => this.write(src, content)).then(() => this.get(src) || []);
        } else {
            return Promise.resolve(cachedValue);
        }
    }

    persistResult(src: string, getter: Function): Promise<any> {

        const cachedValue = this.get(src);

        if (typeof cachedValue === 'undefined') {
            return Promise.resolve(getter()).then(val => this.set(src, val))
        } else {
            return Promise.resolve(cachedValue);
        }

    }

    get defaultDir() {
        return path.join(process.cwd(), '.cache');
    }

    get dir():string {
        return this.config.dir || this.defaultDir
    }

    get(src: string, value?: any) {

        let cachedValue = this.data[src];

        if (isUndefined(cachedValue)) {
            cachedValue = this.load(src);
        }
        return isUndefined(cachedValue) ? value : cachedValue;

    }

    set(src: string, value: any): any {

        this.data[src] = value;
        return this.get(src);

    }

    getCachePathFor(src: string) {
        return path.join(this.dir, md5(src));
    }

    write(src: string, content?: Content) {

        const cache = this.getCachePathFor(src);

        if (isUndefined(content)) {
            content = fs.readFileSync(src);
        }

        if(src.endsWith('.zip')) {
            new Zip({content}).extractAllTo(cache);
        } else {
            fs.ensureFileSync(cache);
            fs.writeFileSync(cache, content);
        }
    }

    load(src: string):string[]|void {
        const p = this.getCachePathFor(src);
        if (fs.existsSync(p)) {
            this.data[src] = walkDirSync(p);
            return this.get(src);
        }
    }

}