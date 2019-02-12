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


});