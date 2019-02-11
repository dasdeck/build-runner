import {run, Runner, Zip, Entry} from '../src';
import * as path from 'path';
import { fips } from 'crypto';

describe('zip', () => {

    it('auto-create-zip', done => {

        const res: string[] = [];
        function push(letter: string) {
            res.push(letter);
            return letter;
        }

        const tasks = {
            name: 'zip',
            input: path.join(__dirname, 'assets', '*.zip')
        };

        run(tasks).then((runner: Runner) => {

            expect(runner.entries.zip[0]).toBeInstanceOf(Zip);
            done();
        })
    });


    it('alter-zip', done => {

        const zip = new Zip({src: path.join(__dirname, 'assets', 'test.txt.zip')});

        expect(zip.entries.length).toBe(1);

        zip.setEntry(new Entry({dest: 'test2.txt', content: 'someText'}));

        expect(zip.entries.length).toBe(2);

        done();

    })

    it('alter-content-in-zip', done => {

        const zip = new Zip({src: path.join(__dirname, 'assets', 'test.txt.zip')});

        zip.entries[0].content = (zip.entries[0].loadContent('utf8') as String).replace('test', 'tested');

        const reopenedZip = new Zip({content: zip.toBuffer()});

        expect(reopenedZip.entries[0].loadContent()).toBe('tested');

        done();

    });


});