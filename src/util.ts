interface LazyPromise<T=any> {():Promise<T>}

function resolver(promises: LazyPromise[], parallel?:boolean):Promise<any> {

    if (parallel) {
        const unwrapped = promises.map(f => f());
        return Promise.all(unwrapped);
    } else {
        return promises.reduce((current, next) => current.then(next), Promise.resolve())
    }
}

export {
    resolver
}