
import * as Runner from '../src/Runner';
import * as path from 'path';
/**
 * miscelenious test to for cross checking or buck fixing
 */


describe('misc', () => {

    it('wait-for-filtered-entries', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            tasks: {

                test: {
                    base,
                    input: 'test1.txt'
                },

                test2: {
                    output(entries: any, runner: Runner.Runner) {
                        expect(runner.entries.test.length).toBe(1);
                    }
                }
            }
        }).then(runner => {
            expect(runner.entries.test.length).toBe(1);
            done();
        });

    });

    it('filter-promised-input', done => {

        Runner.run({
            input: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
            filter: (entry: Runner.Entry) => ({...entry, src: 'test'})
        }).then((runner: Runner.Runner) => {

            expect(runner.entries._root.length).toBe(1);
            expect(runner.entries._root[0].src).toBe('test');
            done();

        });
    });

});

