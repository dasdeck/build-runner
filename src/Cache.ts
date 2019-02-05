import { GenericObject } from "./interface";
import * as path from 'path';
import * as fs from "fs";

interface CacheConfig {
    dir: string
}
export default class Cache {

    private data: GenericObject = {}
    private config: CacheConfig;

    constructor(config = {dir: path.join(process.cwd(), '.cache')}) {
        this.config = config;
    }

    persistResult(key: string, getter: Function, ...args: any): Promise<any> {

        const cachedValue = this.get(key);

        if (typeof cachedValue === 'undefined') {
            return Promise.resolve(getter(...args)).then(val => this.set(key, val))
        } else {
            return Promise.resolve(cachedValue);
        }


    }

    get(key: string, value?: any) {
        const cachedValue = this.data[key];
        return typeof cachedValue === 'undefined' ? value : cachedValue;
    }

    set(key: string, value: any): any {
        this.data[key] = value;
        return value;
    }

    store() {

    }

    restore() {
        if (fs.existsSync(this.config.dir)) {

        }
    }
}