import * as Runner from '../src/Runner';
import * as path from 'path';

describe('tasklist', () => {

    it('serial-processing-of-sub-tasks', done => {

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
                expect(runner.entries.task1[0].dest).toBe('test1.txt')
                expect(runner.entries.task2[0].dest).toBe('test2.txt')
            }

        }).then(runner => {

            done();

        });

    });


});

