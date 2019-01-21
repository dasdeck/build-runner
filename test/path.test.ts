import * as Runner from '../src/Runner';
import * as path from 'path';

describe('basic', () => {

    it('shared-base', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            base,
            input: [
                'test1.txt',
                {src: 'test2.txt'}
            ]
        }).then(runner => {

            expect(runner.tasks._root.length).toBe(2);
            done();

        });


    });

    it('string-input', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            base,
            input: 'test1.txt'
        }).then(runner => {

            expect(runner.tasks._root[0].src).toBe('test1.txt')
            done();

        });

    });

});

