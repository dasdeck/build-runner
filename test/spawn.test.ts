import runCli  from "../src/Cli";

describe('spawn', () => {

    it('concurrent-tasks', done => {


        runCli([__dirname + '/assets/timeIntensiveTasks']).then(res => done());

        done();

    });

});