import {Entry} from '../src/index';

describe('entry', () => {

    /**
     * lazy load a file's content
     */
    it('with-content', () => {

        const e = new Entry({dest: 'tmp', content: 'test'});

        expect(e.withContent((c:string) => c.replace('test', 'tested')).content).toBe('tested');
        expect(e.withContent('tested').content).toBe('tested');
        expect(e.withContent((c:string) => c + 'ed').content).toBe('tested');

    });


    it('with-dest', () => {

        const e = new Entry({src:'test/path/test.txt', dest: 'test/path/test.txt', content: 'test'});

        expect(e.withDest(dest => dest.substr(5)).dest).toBe('path/test.txt');

    });

    it('match', () => {

        const e = new Entry({src:'test/path/test.txt', dest: 'tmp', content: 'test'});

        expect(e.match('**/path/(*.txt)')).toBe('test.txt');
        expect(e.match('**/path/(*.txt)', (match:string) => e.withDest('new', 'dest', match)).dest).toBe('new/dest/test.txt');

    });


});