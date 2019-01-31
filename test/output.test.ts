import * as Runner from '../src/Runner';
import * as path from 'path';

describe('output', () => {

    it('change-entries-in-output', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            input: {
                base,
                src: '**/*',
                filter: (entry: Runner.Entry) => new Promise(res => res(entry))
            },
            output: (entries:Runner.Entry[]) => entries.filter((entry: Runner.Entry) => !entry.dest || !entry.dest.includes('sub1'))
        }).then(({entries:{_root:entries}}) => {

            expect(entries.length).toBe(2);
            expect(entries[0].dest).toBe('test1.txt');
            expect(entries[0].src).toBe(path.join(base, 'test1.txt'));
            done();
        });

    });

    it('ensure-entries-are-of-type-entry-after-output', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            input: {
                base,
                src: '**/*'
            },
            output: (entries:Runner.Entry[]) => [{content: 'cont', dest: 'test'}]
        }).then(({entries:{_root:entries}}) => {

            expect(entries[0]).toBeInstanceOf(Runner.Entry);
            done();
        });

        done();

    });

    it('task-has-entries-and-sub-entries', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({

            tasks: {
                task1: {
                    input: {
                        base,
                        src: '**/*'
                    }
                }
            },

            output: (entries, runner, task) => {
                expect(task.subEntries.length).not.toBe(0);
                expect(task.entries.length).toBe(0);
                return task.subEntries;
            }
        }).then(({entries:{_root:entries}}) => {

            expect(entries[0]).toBeInstanceOf(Runner.Entry);
            done();
        });

        done();

    });

});