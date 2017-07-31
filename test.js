const App = require('./app');
const main = App('main');
const router = App('router');

function send(req, res) {
    res.send(`url: ${req.url} originalUrl: ${req.originalUrl} userData: ${req.userData}`);
}

main.use((req, res, next) => {
    next();
});

// main.use('/A', (req, res, next) => {
//     send(req, res);
// });

router.use((req, res, next) => {
    next();
});

router.use('/b', (req, res, next) => {
    req.userData = 'add on middleware';
    next();
});

router.use('/b/c', (req, res, next) => {
    send(req, res);
});

router.use('/c', (req, res, next) => {
    send(req, res);
});

main.use('/a', router);

main.listen(3000);