
declare class Zip {};
import Entry from '../Entry';
import Runner from '../Runner';
import Task from '../Task';

type EntrySet = Entry[];
type PromisedEntries = Promise<EntrySet>
type ResolvedEntrySet = Entry[];
type OneOrMore<T> = T | T[];
type TaskLike = TaskInterface | Function | any[];
type TaskList = { [s: string]: TaskLike; };
type EntryResult = EntryLike | boolean | void;
type PromisedEntryResult = Promise<EntryResult>;

type Content = string|Buffer|Zip;

type InputLike = Input|string;

interface Filter {(entry: Entry, runner: Runner):EntryResult|PromisedEntryResult}
interface Output {(entries: EntrySet, runner: Runner, task: Task):EntryLike[] | Promise<EntryLike[]> | void | boolean}

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
    config?:any,
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
    Filter,
    OneOrMore,
    InputLike,
    Output,
    TaskList,
    TaskLike,
    TaskInterface
}