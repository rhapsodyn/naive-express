const App = require('./app');
const main = new App('main');
const router1 = new App('router1');
const router2 = new App('router2');
const router3 = new App('router3');

function send(req, res, next) {
    // no next
    res.send(`url: ${req.url} \n originalUrl: ${req.originalUrl} \n userData: ${req.userData}`);
}

// main
main.use((req, res, next) => {
    next();
});

main.use('/A', send);

// router1
router1.use((req, res, next) => {
    next();
});

router1.use('/b', (req, res, next) => {
    req.userData = 'add on middleware';
    next();
});

router1.use('/b/c', send);

router1.use('/c', send);

// router2
router2.use('/d', send);

// router3
router3.use('/e', send);

// router3 on router1
router1.use('/3', router3);
// router1 on main
main.use('/1', router1);
// router2 on main
main.use('/2', router2);

main.listen(3000);