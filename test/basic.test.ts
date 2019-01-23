import * as Runner from '../src/Runner';
import * as path from 'path';

describe('basic', () => {

    /**
     * directly return an array of file entries from task entry
     */
    it('pure-entry-task', done => {

        const config = {
            tasks: {
                task1: [
                    {
                        src: 'test1.txt'
                    }
                ],
                task2: (runner: Runner.Runner) => [
                    {
                        src: 'test2.txt',
                        runner
                    }
                ]


            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.tasks.task1.length).toBe(1);
                expect(runner.tasks.task1[0]).toBeInstanceOf(Runner.Entry);
                expect(runner.tasks.task1[0].src).toBe('test1.txt');
                expect(runner.tasks.task2.length).toBe(1);
                expect(runner.tasks.task2[0].src).toBe('test2.txt');
                expect((<any>runner.tasks.task2[0]).runner).toBe(runner);
            }

        };
        const runner = new Runner.Runner(config)
        runner.run().then(runner => {


            done();

        });

    });

    /**
     * return a dynamic task json from a function
     */
    it('dynamic-task', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            tasks: {
                task1: (runner: Runner.Runner) => ({
                    input: {
                        base,
                        src: '**/*',
                    }
                })
            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.tasks.task1.length).toBe(3)
                expect(runner.tasks.task1[2].src).toBe('test2.txt')
            }

        }).then(runner => {

            done();

        });

    });

    /**
     * return a task via a promise
     */
    it('function-task-promise', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            tasks: {
                task1: (runner: Runner.Runner) => new Promise(res => res({
                    input: {
                        base,
                        src: '**/*'
                    }
                }))
            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.tasks.task1.length).toBe(3)
                expect(runner.tasks.task1[2].src).toBe('test2.txt')
            }

        }).then(runner => {

            done();

        });

    });

    /**
     * return nothing in task promise
     */
    it ('no-return-task', done => {

        const runner = new Runner.Runner({
            tasks: {
                test: () => Promise.resolve()
            }
        });

        runner.run().then(() => {
            done();
        });

    });



});

