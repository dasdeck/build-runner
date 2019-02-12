import {LoggerConfig} from './interface';

export default class Logger {
    log: Function = () => {}
    info: Function = () => {}
    warn: Function = () => {}
    error: Function = () => {}
    logLevels: string[] = ['log', 'info', 'warn', 'error']

    constructor(config: LoggerConfig = {}) {
        this.logLevels.forEach((name, i:number) => {
            if (i < (config.level || 0)) {
                (this as any)[name] = (console as any)[name];
            }
        });

        if (config.level as number >= 10) {
            Error.stackTraceLimit = Infinity;
        }
    }
}