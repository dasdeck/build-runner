import {capture} from 'extglob';

describe('extglob', () => {

    it('capture', () => {


        expect(capture('test/(test1.*)', 'test/test1.txt', {})[0]).toBe('test1.txt');
        expect(capture('/Users/jms/runner/test/content/(test.*)', '/Users/jms/runner/test/content/test1.txt', {})[0]).toBe('test1.txt');

    })

});
