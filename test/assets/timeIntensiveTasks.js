const oneSecondTask = {
    spawn: true,
    output: () => {

        const end = performance.now() + 1000;
        while (performance.now() < end) {
            //
        }

    }

};

module.exports = {
    tasks: [
        oneSecondTask,
        oneSecondTask,
        oneSecondTask,
        oneSecondTask,
        oneSecondTask,
        oneSecondTask
    ]
};