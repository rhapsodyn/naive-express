const http = require('http');

class RouterLayer {
    constructor(path, fn) {
        this.path = path;
        this.fn = fn;
    }

    handle(req, res, next, prefix) {
        let fn = this.fn;

        if (fn instanceof Application) {
            fn.handle(req, res, next, prefix);
        } else {
            fn(req, res, next);
        }
    }

    // match with startsWith
    match(req) {
        let source = this.path;
        let target = req.url;

        console.log(`to match: source= ${source} target= ${target}   ${target.startsWith(source)}`);

        return target.startsWith(source);
    }
}

class Request {
    constructor(req) {
        this.raw = req;
        this.prefix = '';
    }

    get originalUrl() {
        return this.raw.url;
    }

    // express-way url
    get url() {
        let rawUrl = this.raw.url;
        let pref = this.prefix;

        return rawUrl.substring(pref.length, rawUrl.length);
    }
}

class Response {
    constructor(res) {
        this.raw = res;
    }

    send(msg) {
        this.raw.end(msg + '\n');
    }
}

// router stack looks like this:
// root - handler - router - handler - 404
//                    |
//                  handler - handler - router - handler
//                                        |
//                                      handler
//
// go depth-first
class Application {
    constructor(name) {
        this.name = name;
        this.routerStack = [];
    }

    dispatch(req, res) {
        console.log(this.name + ' start to dispatch');

        let idx = 0;
        let stack = this.routerStack;

        function next() {
            if (idx < stack.length) {
                let layer = stack[idx++];

                if (layer.match(req)) {
                    // goto handler
                    layer.handle(req, res, next, layer.path);
                } else {
                    // try next
                    next();
                }
            }
        }

        next();
    }

    // works like a handler
    handle(req, res, next, prefix) {
        console.log(`go through root: ${this.name} with prefix: ${prefix}`);

        // routes deeper, prefix gets longer
        let oldPrefix = req.prefix;
        req.prefix += prefix;

        this.dispatch(req, res);

        // comes back
        req.prefix = oldPrefix;
        // and go on
        next();
    }

    // use a handler or another app
    use(path, fn) {
        if (!fn) {
            fn = path;
            // '' matchs every path
            path = '';
        }

        console.log(`new router: ${path} on: ${this.name}`);
        this.routerStack.push(new RouterLayer(path, fn));
    }

    listen(port) {
        // finalHandler
        this.routerStack.push(new RouterLayer('', (req, res) => {
            res.send('404');
        }));

        http.createServer((req, res) => {
            let reqwrapper = new Request(req);
            let reswrapper = new Response(res);

            this.dispatch(reqwrapper, reswrapper);
        }).listen(port);

        console.log('listening on: ' + port);
    }
}

module.exports = Application;