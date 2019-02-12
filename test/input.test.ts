import * as Runner from '../src/Runner';
import * as path from 'path';

describe('input', () => {

    it('http-input', done => {

        const config = {
            input: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'
        }

        Runner.run(config).then(runner => {
            expect(runner.entries._root[0].loadContent(null)).toBeInstanceOf(Buffer);
            done();
        });

    });

    it('dest-map', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            base,
            input: {
                src: '*.txt',
                dest: {
                    '(test.*)': 'dest',
                    '(test1.*)': 'dest1',

                }
            }
        }).then(runner => {

            expect(runner.entries._root[0].dest).toBe('dest1/test1.txt')
            expect(runner.entries._root[1].dest).toBe('test2.txt')
            done();

        });

    });

    it('string-input', done => {

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