

import * as Runner from '../src/Runner';
import * as path from 'path';

describe('glob-path', () => {

    it('evaluate-basic-glob', done => {

        const base = path.join(__dirname, 'content');
        Promise.all(Runner.getEntries({
                base,
                src: '**/*'
        })).then(entries => {


            expect(entries.length).toBe(3);
            expect(entries[0].src).toBe('sub1/test3.txt');
            expect(entries[1].src).toBe('test1.txt');
            expect(entries[1].path).toBe(path.join(base, 'test1.txt'));
            done();
        });

    });

    it('evaluate-multi-glob', () => {

        const entries = Runner.getEntries({
                base: path.join(__dirname, 'content'),
                src: [
                    '*.txt',
                    'sub1/*.txt'
                ]
        });

        expect(entries.length).toBe(3);

    });

    it('evaluate-multi-glob-ignore', () => {

        const entries = Runner.getEntries({
                base: path.join(__dirname, 'content'),
                src: [
                    '*.txt',
                    'sub1/*.txt'
                ],
                ignore: 'test1.txt'
        });

        expect(entries.length).toBe(2);

    });

    it('evaluate-multi-glob-multi-ignore', () => {

        const entries = Runner.getEntries({
                base: path.join(__dirname, 'content'),
                src: [
                    '*.txt',
                    'sub1/*.txt'
                ],
                ignore: [
                    'test1.txt',
                    'test2.txt'
                ]
        });

        expect(entries.length).toBe(1);

    });

});