import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import * as request from 'request-promise-native';

class Entry {

    path?: string
    src?: string
    content?: string|Buffer

    constructor(data: any) {
        Object.assign(this, data);
    }

    loadContent(encoding = 'utf8'): any {
        if (this.path && fs.existsSync(this.path)) {
            this.content = fs.readFileSync(this.path, encoding);
            return this.content
        }
    }
}

type EntrySet = (Entry|Promise<Entry>)[];
type ResolvedEntrySet = Entry[];
interface LazyPrimise<T=any> {():Promise<T>}
type OneOrMore<T> = T | T[];


class Runner {
    tasks: any = {}
    config: Task

    constructor(task: Task = {}) {
        this.config = task || {};
    }

    run(): Promise<Runner> {
        return run(this.config, this.config, this);
    }
}

interface Filter {(entry: Entry, runner: Runner):Entry|boolean|undefined|Promise<Entry|boolean|void>}
interface Output {(entries: ResolvedEntrySet, runner: Runner):EntrySet|Promise<EntrySet>|void}

interface Input {
    src?:OneOrMore<string>,
    ignore?:OneOrMore<string>,
    content?:string|Buffer,
    dest?:string,
    base?:string,
    filter?:Filter
}

type InputLike = Input|string;

interface Task {
    base?:string, //shared base
    filter?:Filter,
    input?:OneOrMore<InputLike>,
    output?:Output,
    tasks?:any,
    name?:string,
    parallel?:boolean
}

function globSources(src: string, config: any, base: string = ''): EntrySet {

    if (src.indexOf('http') === 0) {
        return [request(src, {encoding: null}).then((content:any) => new Entry({content}))]
    } else {
        return glob.sync(src, {...config, nodir: true, cwd: base}).map(src => new Entry({src, path: path.join(base, src)}));
    }
}
function getEntries(input: InputLike, task: Task = {}): EntrySet {

        if (typeof input === 'string') {

            return globSources(input, {}, task.base);

        } else if (input instanceof Array) {

            return input.reduce((res: EntrySet, input: InputLike) => res.concat(getEntries(input, task)), []);

        } else {

            const base = input.base || task.base || '';
            const src = input.src instanceof Array ? input.src : [input.src];
            const ignore = input.ignore instanceof Array ? input.ignore : (input.ignore && [input.ignore]);
            return src.reduce((res: EntrySet, src: any) => res.concat(globSources(src, {ignore}, base)), []);

        }

}

function filterInput(input: InputLike, task: Task = {}, runner: Runner = new Runner):Promise<ResolvedEntrySet> {
    const entries = getEntries(input, task);
    return filterEntries(entries, input, task, runner);

}

function resolver(promises: LazyPrimise[], parallel?:boolean):Promise<any> {

    if (parallel) {
        return Promise.all(promises.map(f => f()));
    } else {
        return promises.reduce((current, next) => current.then(next), Promise.resolve())
    }
}

function resolveTasks(tasks?: any, runner?: Runner, name?:string, parallel:boolean = false): Promise<any> {
    if (tasks) {
        return resolver(Object.keys(tasks).map(name => () => evaluateTask(tasks[name], runner, name)), parallel)
    } else {
        return Promise.resolve();
    }
}

function logEntries(entries: EntrySet, runner: Runner, name?: string): void {
    name = name || `task${Object.keys(runner.tasks).length}`;
    runner.tasks[name] = entries;
}

function processEntries(entries: ResolvedEntrySet, task: Task, runner: Runner): EntrySet|Promise<EntrySet> {
    if (task.output) {
        const res = task.output(entries, runner);
        if (typeof res === 'undefined') {
            return entries;
        } else {
            return res;
        }
    } else {
        return entries
    }
}

function filterEntries(entries: EntrySet, input:InputLike, task: Task, runner:Runner):Promise<ResolvedEntrySet> {

    if (typeof input === 'string') {
        return Promise.all(entries);
    }

    return <Promise<ResolvedEntrySet>>Promise.all(entries).then(entries => Promise.all(entries.map(entry => {

        const filter = input.filter || task.filter;
        if (filter) {
            const res = filter(entry, runner);

            if(typeof res === 'undefined') {
                return entry;
            } else {
                return res;
            }

        } else {
            return entry;
        }

    }).filter(v => v)));

}

function evaluateEntries(entries: EntrySet, task:Task, runner:Runner, name?: string):Promise<EntrySet> {
    return Promise.all(entries).then(entries => processEntries(entries, task, runner)).then(entries => {
        logEntries(entries, runner, name);
        return entries;
    });
}

function evaluateTask(task: Task, runner: Runner = new Runner, name?:string):Promise<EntrySet> {

    if (task instanceof Array) {
        return evaluateEntries(task, task, runner, name);

    } else if (task instanceof Function) {
        return Promise.resolve(task(runner)).then(res => res && evaluateTask(res, runner, name));
    }


    return resolveTasks(task.tasks, runner, name, task.parallel).then(() => {

        const inputs = task.input instanceof Array ? task.input : task.input && [task.input] || [];

        return Promise.all(inputs.map(input => filterInput(input, task, runner)))
        .then(inputsSets => inputsSets.reduce((res, set) => res.concat(set), []))
        .then(entries => evaluateEntries(entries, task, runner, name))


    });

}

function run(task:Task, config?:object, runner: Runner = new Runner(config || task)):Promise<Runner> {
    return evaluateTask(task, runner, '_root').then(() => runner);
}

export {
    run,
    Runner,
    getEntries,
    filterInput,
    evaluateTask,
    Entry,
    resolver
}