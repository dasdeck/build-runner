import * as Runner from '../src/Runner';
import * as path from 'path';

describe('tasklist', () => {


    it('serial-process-tasks', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            tasks: {
                task1: {
                    input: {
                        base,
                        src: 'test1.txt',
                    }
                },

                task2: {
                    input: {
                        base,
                        src: 'test2.txt',
                    }
                }
            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.tasks.task1[0].src).toBe('test1.txt')
                expect(runner.tasks.task2[0].src).toBe('test2.txt')
            }

        }).then(runner => {

            done();

        });

    });

    it('wait-for-filtered-entries', done => {

        const base = path.join(__dirname, 'content');
        const runner = new Runner.Runner({
            tasks: {

                test: {
                    base,
                    input: 'test1.txt'
                },

                test2: {
                    output(entries: any, runner: Runner.Runner) {
                        // expect(runner.tasks.test.length).toBe(1);
                    }
                }
            }
        });

        runner.run().then(runner => {
            expect(runner.tasks.test.length).toBe(1);
            done();
        });

    });

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

    it('test-parralel', done => {

        const res: string[] = [];
        function push(letter: string) {
            res.push(letter);
            return letter;
        }

        const tasks = [
            () => new Promise(res => setImmediate(() => res(push('a')))),
            () => new Promise(res => res(push('b')))
        ];

        Runner.resolver(tasks, true).then(() => {
            expect(res.length).toBe(2);
            expect(res[0]).toBe('b');
            expect(res[1]).toBe('a');
            done();
        })
    });


    it('test-serial', done => {

        const res: string[] = [];
        function push(letter: string) {
            res.push(letter);
            return letter;
        }

        const tasks = [
            () => new Promise(res => setImmediate(() => res(push('a')))),
            () => new Promise(res => res(push('b')))
        ];

        Runner.resolver(tasks, false).then(() => {
            expect(res.length).toBe(2);
            expect(res[0]).toBe('a');
            expect(res[1]).toBe('b');
            done();
        })
    });


});

