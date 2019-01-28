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

            expect(runner.entries._root.length).toBe(2);
            done();

        });


    });


    it('destination', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            base,
            input: {
                src: 'test1.txt',
                dest: 'dest'
            }
        }).then(runner => {

            expect(runner.entries._root[0].dest).toBe('dest/test1.txt')
            done();

        });

    });

    it('always have valid target', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            base,
            input: 'test1.txt'
        }).then(runner => {

            expect(runner.entries._root[0].dest).toBe('test1.txt')
            done();

        });

    });

});

