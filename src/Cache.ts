import { GenericObject } from "./interface";

export default class Cache {

    data: GenericObject = {}

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
}