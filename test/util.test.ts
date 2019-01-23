import {resolver} from '../src/util';

describe('util', () => {

    it('test-parralel-function', done => {

        const res: string[] = [];
        function push(letter: string) {
            res.push(letter);
            return letter;
        }

        const tasks = [
            () => new Promise(res => setImmediate(() => res(push('a')))),
            () => new Promise(res => res(push('b')))
        ];

        resolver(tasks, true).then(() => {
            expect(res.length).toBe(2);
            expect(res[0]).toBe('b');
            expect(res[1]).toBe('a');
            done();
        })
    });


    it('test-serial-function', done => {

        const res: string[] = [];
        function push(letter: string) {
            res.push(letter);
            return letter;
        }

        const tasks = [
            () => new Promise(res => setImmediate(() => res(push('a')))),
            () => new Promise(res => res(push('b')))
        ];

        resolver(tasks, false).then(() => {
            expect(res.length).toBe(2);
            expect(res[0]).toBe('a');
            expect(res[1]).toBe('b');
            done();
        })
    });

});