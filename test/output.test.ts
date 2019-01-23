import * as Runner from '../src/Runner';
import * as path from 'path';

describe('output', () => {

    it('change-entries-in-output', done => {

        const base = path.join(__dirname, 'content');
        Runner.evaluateTask({
            input: {
                base,
                src: '**/*',
                filter: (entry: Runner.Entry) => new Promise(res => res(entry))
            },
            output: (entries:Runner.Entry[]) => entries.filter((entry: Runner.Entry) => !entry.src || !entry.src.includes('sub1'))
        }).then((entries: any[]) => {

            expect(entries.length).toBe(2);
            expect(entries[0].src).toBe('test1.txt');
            expect(entries[0].path).toBe(path.join(base, 'test1.txt'));
            done();
        });

    });

    it('ensure-entries-are-of-type-entry-after-output', done => {

        const base = path.join(__dirname, 'content');
        Runner.evaluateTask({
            input: {
                base,
                src: '**/*'
            },
            output: (entries:Runner.Entry[]) => [{src: 'test'}]
        }).then((entries: any[]) => {

            expect(entries[0]).toBeInstanceOf(Runner.Entry);
            done();
        });

        done();

    });

    it('promise-entries-in-output', done => {

        done();

    });


});