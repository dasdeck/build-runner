import * as Runner from '../src';
import * as path from 'path';


describe('filter', () => {

    it('promised-filter-result', done => {

        Runner.run({
            input: {
                base: path.join(__dirname, 'content'),
                src: 'test1.txt',
                filter: (entry: Runner.Entry) => new Promise(res => res(entry))
            }
        }).then((runner: Runner.Runner) => {

            expect(runner.entries._root[0].dest).toBe('test1.txt');
            done();

        });

    });

    it('ensure-entry-objects-after-filtering', done => {
        Runner.run({input: {
            base: path.join(__dirname, 'content'),
            src: 'test1.txt',
            filter: (entry: Runner.Entry) => ({...entry, src: 'renamed.txt'})
        }}).then((runner:Runner.Runner) => {

            expect(runner.entries._root[0]).toBeInstanceOf(Runner.Entry);
            done();

        });
    });

    it('change-name', done => {

        Runner.run({input: {
            base: path.join(__dirname, 'content'),
            src: 'test1.txt',
            filter: (entry: Runner.Entry) => new Runner.Entry({...entry, dest: 'renamed.txt'})
        }}).then((runner: Runner.Runner) => {

            expect(runner.entries._root[0].dest).toBe('renamed.txt');
            done();

        });
    })

    it('filter-out-entry', done => {

        Runner.run({
            input: {
            base: path.join(__dirname, 'content'),
            src: 'test1.txt',
            filter: (entry: Runner.Entry) => false
        }}).then((runner: Runner.Runner) => {

            expect(runner.entries._root.length).toBe(0);
            done();

        });
    });

    it('task-wide-filter', done => {
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