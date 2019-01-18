

import * as Runner from '../Runner';
import * as path from 'path';

describe('glob-path', () => {

    it('evaluate-basic-glob', () => {

        const base = path.join(__dirname, 'content');
        const entries = Runner.getEntries({
                base,
                src: '**/*'
        });

        expect(entries.length).toBe(3);
        expect(entries[0].src).toBe('sub1/test3.txt');
        expect(entries[1].src).toBe('test1.txt');
        expect(entries[1].path).toBe(path.join(base, 'test1.txt'));

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