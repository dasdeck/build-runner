import * as Runner from '../src/Runner';
import * as path from 'path';


describe('filter', () => {

    it('promised-filter-result', done => {

        Runner.filterInput({
            base: path.join(__dirname, 'content'),
            src: 'test1.txt',
            filter: (entry: Runner.Entry) => new Promise(res => res(entry))
        }).then((entries: Runner.Entry[]) => {

            expect(entries[0].dest).toBe('test1.txt');
            done();

        });

    });

    it('ensure-entry-objects-after-filtering', done => {
        Runner.filterInput({
            base: path.join(__dirname, 'content'),
            src: 'test1.txt',
            filter: (entry: Runner.Entry) => ({...entry, src: 'renamed.txt'})
        }).then((entries: Runner.Entry[]) => {

            expect(entries[0]).toBeInstanceOf(Runner.Entry);
            done();

        });
    });

    it('change-name', done => {

        Runner.filterInput({
            base: path.join(__dirname, 'content'),
            src: 'test1.txt',
            filter: (entry: Runner.Entry) => new Runner.Entry({...entry, dest: 'renamed.txt'})
        }).then((entries: Runner.Entry[]) => {

            expect(entries[0].dest).toBe('renamed.txt');
            done();

        });
    })

    it('filter-out-entry', done => {

        Runner.filterInput({
            base: path.join(__dirname, 'content'),
            src: 'test1.txt',
            filter: (entry: Runner.Entry) => false
        }).then((entries: Runner.Entry[]) => {

            expect(entries.length).toBe(0);
            done();

        });
    });

    it('task-filter', done => {
        Runner.run({
            input: {
                base: path.join(__dirname, 'content'),
                src: [
                    'test1.txt',
                    'test2.txt'
                ]
            },
            filter: (entry: Runner.Entry) => entry.dest == 'test1.txt'
        }).then((runner: Runner.Runner) => {

            expect(runner.entries._root.length).toBe(1);
            done();

        });
    });


});