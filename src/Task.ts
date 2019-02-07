

import {TaskInterface, Filter, OneOrMore, InputLike, Output, TaskList, EntrySet, GenericObject, DynamicConfig} from './interface';
import {Runner} from '.';
import { isString } from 'util';
import { performance } from 'perf_hooks';
export default class Task implements TaskInterface {

    _config?:GenericObject | DynamicConfig
    dest?:string
    _base?:string //shared base
    filter?:Filter
    input?:OneOrMore<InputLike>
    output?:Output
    tasks:TaskList = {}
    name:string
    parent?:Task
    parallel?:boolean
    runner: Runner
    entries: EntrySet = []
    subTasks: GenericObject<Task> = {}
    cache?: boolean|string
    startTime: number = 0

    constructor(runner: Runner, data: TaskInterface, name: string|number = '_root', parent?: Task) {

        this.runner = runner;
        this.name = typeof name === "number" ? `task${name + 1}` : name;
        this.parent = parent;

        Object.assign(this, data);

    }

    start(runner: Runner) {
        this.runner = runner;
        this.runner.startTask(this);
        this.startTime = performance.now();
        this.runner.logger.log('starting task:', this.fullName);
    }

    end() {
        const time = Math.round(performance.now() - this.startTime) / 1000;
        this.runner.logger.log('ending task:', this.fullName, `: ${time} sec.`);
        return this.entries;
    }

    get fullName(): string {
        return (this.parent && (this.parent.fullName + '.') || '')  + this.name;
    }

    set base(base: string) {
        this._base = base;
    }

    get base(): string {
        return this._base || this.config.base;
    }

    set config(conf: GenericObject) {
        this._config = conf;
    }

    get cacheKey() {
        return this.cache && (this.fullName + (isString(this.cache) ? `.${this.cache}` : '')) || '';
    }

    storeCache() {
        if (this.cache) {
            this.runner.cache.set(this.cacheKey, this.entries);
        }
    }

    restoreCache() {
        const entries = this.runner.cache.get(this.cacheKey);
        if (entries) {
            this.runner.logger.log('restored from cache:', this.fullName);
            this.entries = entries;
            Object.keys(this.subTasks).forEach(name => this.subTasks[name].restoreCache());
            return true;
        }
    }

    get config(): GenericObject {

        const parentConfig = this.parent && this.parent.config || this.runner._config || {};

        let config = this._config;
        if (typeof config === 'function') {
            const res = (config as DynamicConfig)(this.parent);
            if (res) {
                config = res;
            }
        }

        return Object.assign({}, parentConfig, config);

    }

    get subEntries(): EntrySet {
        return Object.keys(this.subTasks).reduce((res: EntrySet, name) => res.concat(this.subTasks[name].entries), [])
    }
}
