

import * as Runner from '../src/Runner';
import * as path from 'path';

describe('glob-path', () => {

    it('evaluate-basic-glob', done => {

        const base = path.join(__dirname, 'content');
        Runner.getEntries({
                base,
                src: '**/*'
        }).then(entries => {


            expect(entries.length).toBe(3);
            expect(entries[0].src).toBe('sub1/test3.txt');
            expect(entries[1].src).toBe('test1.txt');
            expect(entries[1].path).toBe(path.join(base, 'test1.txt'));
            done();
        });

    });

    it('evaluate-multi-glob', done => {

        Runner.getEntries({
                base: path.join(__dirname, 'content'),
                src: [
                    '*.txt',
                    'sub1/*.txt'
                ]
        }).then(entries => {

            expect(entries.length).toBe(3);
            done();
        });

    });

    it('evaluate-multi-glob-ignore', done => {

        Runner.getEntries({
                base: path.join(__dirname, 'content'),
                src: [
                    '*.txt',
                    'sub1/*.txt'
                ],
                ignore: 'test1.txt'
        }).then(entries => {
            expect(entries.length).toBe(2);
            done();
        })

    });

    it('evaluate-multi-glob-multi-ignore', done => {

        Runner.getEntries({
                base: path.join(__dirname, 'content'),
                src: [
                    '*.txt',
                    'sub1/*.txt'
                ],
                ignore: [
                    'test1.txt',
                    'test2.txt'
                ]
        }).then(entries => {

            expect(entries.length).toBe(1);
            done();

        });

    });

});