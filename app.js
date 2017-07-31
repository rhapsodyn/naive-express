const http = require('http');

class RouterLayer {
    constructor(path, fn) {
        this.path = path;
        this.fn = fn;

    }

    handle(req, res, next) {
        this.fn(req, res, next);

        return res.done;
    }

    match(path) {
        return true;
    }
}

class ReqWrapper {
    constructor(req) {
        this.raw = req;
    }

    get originalUrl() {

    }

    get url() {

    }
}

class ResWrapper {
    constructor(res) {
        this.raw = res;
        this.done = false;
    }

    send(msg) {
        this.done = true;
        this.raw.end(msg + '\n');
    }
}

function createApp(name) {
    let _routerStack = [];
    let _name = name;

    function dispatch(req, res) {
        let idx = 0;
        let done = _routerStack.length === 0;

        function next() {
            while (!done && idx < _routerStack.length - 1) {
                let layer = _routerStack[idx++];

                if (layer.match(resWrapper.url)) {
                    done = layer.handle(reqWrapper, resWrapper, next);
                }
            }
        }

        next();
    }

    let app = (req, res, next) => {
        console.log('go through root: ' + _name);
        next();

        dispatch(req, res);
    };

    app.use = (path, fn) => {
        if (!fn) {
            fn = path;
            path = '';
        }

        console.log(`new router: ${path} on: ${_name}`);
        _routerStack.push(new RouterLayer(path, fn));
    };

    app.listen = port => {
        http.createServer((req, res) => {
            let reqWrapper = new ReqWrapper(req);
            let resWrapper = new ResWrapper(res);

            dispatch(reqWrapper, resWrapper);
        }).listen(port);

        console.log('listening on: ' + port);
    };

    return app;
}

module.exports = createApp;