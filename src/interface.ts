
declare class Zip {};
import Entry from './Entry';
import Runner from './Runner';
import Task from './Task';

type EntrySet = Entry[];
type PromisedEntries = Promise<EntrySet>
type ResolvedEntrySet = Entry[];
type OneOrMore<T> = T | T[];
type TaskLike = TaskInterface | EntryLike[];
type TaskList = { [s: string]: TaskLike; };
type EntryResult = EntryLike | boolean | void;
type PromisedEntryResult = Promise<EntryResult>;
type GenericObject = { [key: string]: any };

type Content = string|Buffer|Zip;

type InputLike = Input|string;

interface TaskFactory {(runner: Runner, parent?: Task):void|TaskLike | Promise<TaskLike|void>}
interface Filter {(entry: Entry, runner: Runner):EntryResult|PromisedEntryResult}
interface Output {(entries: EntrySet, runner: Runner, task: Task):EntryLike[] | Promise<EntryLike[]> | void | boolean}
interface DynamicConfig {(parent: Task): GenericObject | void}

interface EntryLike {
    src?: string
    content?: Content
    dest?:string
}

interface Input {
    src?:OneOrMore<string>,
    ignore?:OneOrMore<string>,
    content?:string|Buffer,
    dest?:string,
    base?:string,
    filter?:Filter
}

interface TaskInterface {
    config?:GenericObject | DynamicConfig,
    dest?:string,
    base?:string, //shared base
    filter?:Filter,
    input?:OneOrMore<InputLike>,
    output?:Output,
    tasks?:TaskList,
    name?:string,
    parent?:Task,
    parallel?:boolean
}


export {
    Content,
    EntryLike,
    PromisedEntries,
    Input,
    PromisedEntryResult,
    ResolvedEntrySet,
    EntryResult,
    EntrySet,
    GenericObject,
    Filter,
    OneOrMore,
    InputLike,
    Output,
    TaskList,
    TaskLike,
    TaskInterface,
    TaskFactory
}