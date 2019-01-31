

import * as Runner from '../src';
import * as path from 'path';

describe('glob-path', () => {

    it('evaluate-basic-glob', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({input:
            {
                base,
                src: '**/*'
        }}).then(({entries: {_root: entries}}) => {


            expect(entries.length).toBe(3);
            expect(entries[0].dest).toBe('sub1/test3.txt');
            expect(entries[1].dest).toBe('test1.txt');
            expect(entries[1].src).toBe(path.join(base, 'test1.txt'));
            done();
        });

    });

    it('evaluate-multi-glob', done => {

        Runner.run({
            input: {

                base: path.join(__dirname, 'content'),
                src: [
                    '*.txt',
                    'sub1/*.txt'
                ]
            }
        }).then(({entries: {_root: entries}}) => {

            expect(entries.length).toBe(3);
            done();
        });

    });

    it('evaluate-multi-glob-ignore', done => {

        Runner.run({
            input: {
                base: path.join(__dirname, 'content'),
                src: [
                    '*.txt',
                    'sub1/*.txt'
                ],
                ignore: 'test1.txt'
        }}).then(({entries: {_root: entries}}) => {
            expect(entries.length).toBe(2);
            done();
        })

    });

    it('evaluate-multi-glob-multi-ignore', done => {

        Runner.run({
            input: {
                base: path.join(__dirname, 'content'),
                src: [
                    '*.txt',
                    'sub1/*.txt'
                ],
                ignore: [
                    'test1.txt',
                    'test2.txt'
                ]
        }}).then(({entries: {_root: entries}}) => {

            expect(entries.length).toBe(1);
            done();

        });

    });

});