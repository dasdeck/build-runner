import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import * as request from 'request-promise-native';

class Entry {

    path?: string
    src?: string
    content?: string|Buffer
    dest?:string

    constructor(data: object) {
        Object.assign(this, data);
    }

    get target(): string {
        return path.join(this.dest || '', this.src || '');
    }

    loadContent(encoding = 'utf8'): string | Buffer | void {
        if (this.path && fs.existsSync(this.path)) {
            this.content = fs.readFileSync(this.path, encoding);
            return this.content
        }
    }
}

type EntrySet = (Entry | Promise<Entry>)[];
type ResolvedEntrySet = Entry[];
type OneOrMore<T> = T | T[];
type TaskLike = Task | Function | any[];
type TaskList = { [s: string]: TaskLike; }

class Runner {
    tasks: { [s: string]: ResolvedEntrySet; } = {}
    config: Task

    constructor(task: Task = {}) {
        this.config = task || {};
    }

    run(): Promise<Runner> {
        return run(this.config, this.config, this);
    }
}

interface LazyPrimise<T=any> {():Promise<T>}
interface Filter {(entry: Entry, runner: Runner):object|Entry|boolean|undefined|Promise<Entry|boolean|void>}
interface Output {(entries: ResolvedEntrySet, runner: Runner, task: Task):EntrySet|Promise<EntrySet>|void}

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
    dest?:string,
    base?:string, //shared base
    filter?:Filter,
    input?:OneOrMore<InputLike>,
    output?:Output,
    tasks?:TaskList,
    name?:string,
    parallel?:boolean
}

const pathResolvers = [

    (src: string, input: Input, task: Task): object[]|void => {
        if (src.indexOf('http') === 0) {
            return [request(src, {encoding: null}).then((content:string|Buffer) => ({content}))]
        }
    },

    (src: string, input: Input, task: Task): object[] => {
        const base = input.base || task.base || '';
        const ignore = input.ignore instanceof Array ? input.ignore : (input.ignore && [input.ignore]);
        return glob.sync(src, {ignore, nodir: true, cwd: base}).map(src => ({src, path: path.join(base, src)}));
    }
]

function resolvePath(src: string, input: Input, task: Task): EntrySet {

    for (const i in pathResolvers) {
        const resolver = pathResolvers[i];
        const res = resolver(src, input, task);
        if (res) {
            const base = input.base || task.base;
            const dest = input.dest || task.dest;
            return res.map(data => data instanceof Promise ?
                data.then(data => new Entry({src, base, dest, ...data})) :
                new Entry({src, base, dest, ...data}));
        }
    }

    return [];

}

function getEntries(input: InputLike, task: Task = {}): EntrySet {

        if (typeof input === 'string') {

            return resolvePath(input, {}, task);

        } else if (input instanceof Array) {

            return input.reduce((res: EntrySet, input: InputLike) => res.concat(getEntries(input, task)), []);

        } else {

            const src: string[] = input.src ? (input.src instanceof Array ? input.src : [input.src]) : [];
            return src.reduce((res: EntrySet, src: string) => res.concat(resolvePath(src, input, task)), []);

        }

}

function filterInput(input: InputLike, task: Task = {}, runner: Runner = new Runner):Promise<ResolvedEntrySet> {
    const entries = getEntries(input, task);
    return filterEntries(entries, input, task, runner);

}

function resolver(promises: LazyPrimise[], parallel?:boolean):Promise<any> {

    if (parallel) {
        const unwrapped = promises.map(f => f());
        return Promise.all(unwrapped);
    } else {
        return promises.reduce((current, next) => current.then(next), Promise.resolve())
    }
}

function resolveTasks(tasks?: TaskList, runner?: Runner, name?:string, parallel:boolean = false): Promise<void> {
    if (tasks) {
        return resolver(Object.keys(tasks).map(name => () => evaluateTask(tasks[name], runner, name)), parallel)
    } else {
        return Promise.resolve();
    }
}

function logEntries(entries: ResolvedEntrySet, runner: Runner, name?: string): void {
    name = name || `task${Object.keys(runner.tasks).length}`;
    runner.tasks[name] = entries;
}

function processEntries(entries: ResolvedEntrySet, task: Task, runner: Runner): EntrySet|Promise<EntrySet> {
    if (task.output) {
        const res = task.output(entries, runner, task);
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
            } else if (typeof res === 'object') {
                if (!(res instanceof Promise) && !(res instanceof Entry)) {
                    return new Entry(res);
                } else {
                    return res;
                }
            } else {
                return res;
            }

        } else {
            return entry;
        }

    }).filter(v => v)));

}

function evaluateEntries(entries: EntrySet, task:Task, runner:Runner, name?: string):Promise<EntrySet> {
    return Promise.all(entries).then(entries => processEntries(entries, task, runner)).then((entries: any[]) => {

        if(entries.find(entry => entry instanceof Promise)) {
            throw 'entry should be resoved before logging';
        }

        logEntries(entries, runner, name);
        return entries;
    });
}

function evaluateTask(task: TaskLike, runner: Runner = new Runner, name?:string):Promise<EntrySet> {

    if (task instanceof Array) {
        return evaluateEntries(task, {}, runner, name);

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