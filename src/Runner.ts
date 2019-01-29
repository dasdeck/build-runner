import * as glob from 'glob';
import * as path from 'path';
import * as request from 'request-promise-native';
import {resolver} from './util';
import Entry from './Entry';
import Task from './Task';
import {TaskLike, EntrySet, PromisedEntries, ResolvedEntrySet, PromisedEntryResult, Input, InputLike, EntryResult} from './interface';


export default class Runner {
    entries: { [s: string]: ResolvedEntrySet; } = {}
    tasks: { [s: string]: Task; } = {}
    config: any = {}

    constructor(config: any = {}) {
        this.config = config;
    }

    startTask(task: Task) {
        this.tasks[task.name] = task;
    }

    endTask(task: Task) {

    }


    log(...args: any) {
        if (this.config.verbose) {
            console.log(...args);
        }
    }
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

function resolvePath(src: string, input: Input, task: Task = new Task(new Runner(), {})): PromisedEntries {

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

function getEntries(input: InputLike, task?: Task): PromisedEntries {

    if (typeof input === 'string') {

        return resolvePath(input, {}, task);

    } else if (input instanceof Array) {

            return Promise.all(input.map((input: InputLike) => getEntries(input, task))).then(sets => sets.reduce((res, set) => res.concat(set)));

    } else {

        const src: string[] = input.src ? (input.src instanceof Array ? input.src : [input.src]) : [];
        return Promise.all(src.map(src => resolvePath(src, input, task))).then(sets => sets.reduce((res, set) => res.concat(set)))

    }

}

function filterInput(input: InputLike, task: Task, runner: Runner = new Runner(task)):PromisedEntries {
    const entries = getEntries(input, task);
    return filterEntries(entries, input, task, runner);

}


function resolveTasks(parent: Task, runner: Runner): PromisedEntries {
    if (parent.tasks) {
        return resolver(Object.keys(parent.tasks).map(name => () => evaluateTask(parent.tasks ? parent.tasks[name] : {}, runner, parent, name)), parent.parallel)
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
            throw `Error in task ${task.name}.filter : ${err}`
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

function evaluateTask(taskl: TaskLike, runner: Runner, parent?: Task, name?:string):PromisedEntries {

    if (taskl instanceof Array) {

        runner.log('starting task:' + name);
        return evaluateEntries(taskl.map(data => new Entry(data)), new Task(runner, {}, name, parent), runner, name);

    } else if (taskl instanceof Function) {

        return Promise.resolve(taskl(runner)).then(res => res && evaluateTask(res, runner, parent, name));

    } else if (taskl) {

        const task:Task = taskl instanceof Task ?  taskl : new Task(runner, taskl, name, parent);

        runner.startTask(task);

        return resolveTasks(task, runner).then(() => {

            const inputs = task.input instanceof Array ? task.input : task.input && [task.input] || [];

            return Promise.all(inputs.map(input => filterInput(input, task, runner)))
            .then(inputsSets => inputsSets.reduce((res, set) => res.concat(set), []))
            .then(entries => evaluateEntries(entries, task, runner, name));

        });

    }

    return Promise.resolve([])

}

function run(task:TaskLike, config:any = {}, runner: Runner = new Runner(config)):Promise<Runner> {

    return evaluateTask(task, runner, undefined, '_root').then(() => runner);
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