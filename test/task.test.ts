import * as Runner from '../src';
import * as path from 'path';
import { EntrySet, TaskFactory, TaskInterface } from '../src/interface';

const base = path.join(__dirname, 'content');

describe('basic', () => {

    let tmp: any;
    let mockTask: TaskFactory;
    let mockRequire: Function;

    beforeAll(() => {
        tmp = Runner.Runner.prototype.loadConfig;
    });
    beforeEach(() => {

        mockTask = jest.fn(() => ({}));
        mockRequire = jest.fn((path:string):TaskInterface|TaskFactory => {
            return mockTask
        });

        Runner.Runner.prototype.loadConfig = mockRequire as any;
    });

    afterAll(() => {
        Runner.Runner.prototype.loadConfig = tmp;
    });

    it('reference-task-config', done => {


        Runner.run({
            config: {
                testRoot: 2
            },
            tasks: {
                task: ['test', {test: 1}]
            }
        }).then((runner:Runner.Runner) => {
            expect(mockTask).toBeCalledWith({test: 1, testRoot: 2}, runner, runner.tasks._root);
            expect(mockRequire).toHaveBeenCalledWith('test');
            done();
        });


    });

    it('use-task-name-from-reference', done => {

        Runner.run({
            config: {
                testRoot: 2
            },
            tasks: [
                './test'
            ]
        }).then((runner:Runner.Runner) => {
            expect(mockTask).toBeCalledWith({testRoot: 2}, runner, runner.tasks._root);
            expect(mockRequire).toHaveBeenCalledWith('./test');
            expect(runner.tasks.test).not.toBeUndefined();
            done();
        });

    });

    it('reference-task-short', done => {

        Runner.run({
            tasks: {
                task: 'test'
            }
        }).then(() => {

            expect(mockRequire).toHaveBeenCalledWith('test');
            done();
        });


    });

    /**
     * return a dynamic task json from a function
     * @deprecated
     */
    it('dynamic-task', done => {

        Runner.run({
            tasks: {
                task1: () => ({
                    input: {
                        base,
                        src: '**/*',
                    }
                })
            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.entries.task1.length).toBe(3)
                expect(runner.entries.task1[2].dest).toBe('test2.txt')
            }

        }).then(() => {

            done();

        });

    });

    /**
     * return a task via a promise
     */
    it('return-promised-task', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            tasks: {
                task1: () => new Promise(res => res({
                    input: {
                        base,
                        src: '**/*'
                    }
                }))
            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.entries.task1.length).toBe(3)
                expect(runner.entries.task1[2].dest).toBe('test2.txt')
            }

        }).then(() => {

            done();

        });

    });

    /**
     * return nothing in task promise
     */
    it ('no-return-task', done => {

        Runner.run({
            tasks: {
                test: () => Promise.resolve()
            }
        }).then(() => {
            done();
        });

    });

    it ('full-name', done => {

        Runner.run({
            name: 'parent',
            tasks: {
                test: () => Promise.resolve({}),
            },
            output(e: EntrySet, r: Runner.Runner, t: Runner.Task) {
                expect(r.tasks.test.fullName).toBe('parent.test');
            }
        }).then(() => {
            done();
        });

    });

    it ('custom-name', done => {

        Runner.run({
            tasks: {
                t1: {
                    base,
                    name: 'task1',
                    input: '**/*'
                }
            }
        }).then(runner => {
            expect(runner.tasks.task1).not.toBeUndefined();
            expect(runner.entries.task1).not.toBeUndefined();
            done();
        });

    });



});

