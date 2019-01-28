import * as glob from 'glob';
import * as path from 'path';
import * as request from 'request-promise-native';
import {resolver} from './util';
import Entry, {EntryLike} from './Entry';

type EntrySet = Entry[];
type PromisedEntries = Promise<EntrySet>
type ResolvedEntrySet = Entry[];
type OneOrMore<T> = T | T[];
type TaskLike = Task | Function | any[];
type TaskList = { [s: string]: TaskLike; };
type EntryResult = EntryLike | boolean | void;
type PromisedEntryResult = Promise<EntryResult>;
export default class Runner {
    entries: { [s: string]: ResolvedEntrySet; } = {}
    config: Task

    constructor(task: Task = {}) {
        this.config = task || {};
    }

    run(): Promise<Runner> {
        return run(this.config, this.config, this);
    }
}

interface Filter {(entry: Entry, runner: Runner):EntryResult|PromisedEntryResult}
interface Output {(entries: EntrySet, runner: Runner, task: Task):EntryLike[] | Promise<EntryLike[]> | void | boolean}

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

    (src: string, input: Input, task: Task): PromisedEntryResult[]|void => {
        if (src.indexOf('http') === 0) {
            return [request(src, {encoding: null}).then((content:string|Buffer) => {
                return {content, src};
            })]
        }
    },

    (src: string, input: Input, task: Task): EntryResult[] => {
        const base = input.base || task.base || '';
        const ignore = input.ignore instanceof Array ? input.ignore : (input.ignore && [input.ignore]);
        return glob.sync(src, {ignore, nodir: true, cwd: base}).map(dest => ({dest, src: path.join(base, dest)}));
    }
]

function resolvePath(src: string, input: Input, task: Task): PromisedEntries {

    for (const i in pathResolvers) {
        const resolver = pathResolvers[i];
        const res = resolver(src, input, task);

        if (res) {
            const base = input.base || task.base;
            const dest = input.dest || task.dest;
            return Promise.resolve(res).then(res => Promise.all(res)).then(res => res.map((data: any) => new Entry(data).inDest(dest))).catch(err => {
                throw `error in task ${task.name}.input : ${err}`;
            });
        }
    }

    return Promise.resolve([]);

}

function getEntries(input: InputLike, task: Task = {}): PromisedEntries {

        if (typeof input === 'string') {

            return resolvePath(input, {}, task);

        } else if (input instanceof Array) {

             return Promise.all(input.map((input: InputLike) => getEntries(input, task))).then(sets => sets.reduce((res, set) => res.concat(set)));

        } else {

            const src: string[] = input.src ? (input.src instanceof Array ? input.src : [input.src]) : [];
            return Promise.all(src.map(src => resolvePath(src, input, task))).then(sets => sets.reduce((res, set) => res.concat(set)))

        }

}

function filterInput(input: InputLike, task: Task = {}, runner: Runner = new Runner):PromisedEntries {
    const entries = getEntries(input, task);
    return filterEntries(entries, input, task, runner);

}


function resolveTasks(tasks?: TaskList, runner?: Runner, name?:string, parallel:boolean = false): PromisedEntries {
    if (tasks) {
        return resolver(Object.keys(tasks).map(name => () => evaluateTask(tasks[name], runner, name)), parallel)
    } else {
        return Promise.resolve([]);
    }
}

function logEntries(entries: ResolvedEntrySet, runner: Runner, name?: string): void {
    name = name || `task${Object.keys(runner.entries).length}`;
    runner.entries[name] = entries;
}

function outputEntries(entries: ResolvedEntrySet, task: Task, runner: Runner): PromisedEntries {

    return Promise.resolve(entries).then(entries => {


        if (task.output) {

            const res = task.output(entries, runner, task);

            if (res === true || typeof res === 'undefined') {
                return entries;
            } else if(res) {
                return Promise.resolve(res).then(res => <Entry[]>res.map(Entry.forceEntry).filter(v => v));
            } else {
                return [];
            }
        } else {
            return entries;
        }
    }).catch(err => {

        throw `Error in task ${task.name}.output : ${err}`;

    })
}

function filterEntries(entries: PromisedEntries, input:InputLike, task: Task, runner:Runner):PromisedEntries {

    const filter = typeof input !== 'string' && input.filter || task.filter;

    if (filter) {

        return <PromisedEntries>Promise.resolve(entries).then(entries => Promise.all(entries.map(entry => {

            const res = filter(entry, runner);

            if (res === true || typeof res === 'undefined') {
                return entry;
            } else if (res) {
                return Promise.resolve(res).then(Entry.forceEntry);
            }

        })).then(res => res.filter(v => v))).catch(err => {
            throw `Error in task ${task.name}.filter`
        });

    } else {
        return entries;
    }

}

function evaluateEntries(entries: EntrySet, task:Task, runner:Runner, name?: string):PromisedEntries {
    return Promise.all(entries).then(entries => outputEntries(entries, task, runner)).then((entries: any[]) => {

        if(entries.find(entry => entry instanceof Promise)) {
            throw 'entry should be resolved before logging';
        }

        logEntries(entries, runner, name);
        return entries;
    });
}

function evaluateTask(task: TaskLike, runner: Runner = new Runner, name?:string):PromisedEntries {


    if (task instanceof Array) {
        return evaluateEntries(task.map(data => new Entry(data)), {}, runner, name);

    } else if (task instanceof Function) {
        return Promise.resolve(task(runner)).then(res => res && evaluateTask(res, runner, name));
    } else {

        task.name = task.name || name || '_root';

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