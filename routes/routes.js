const routes = [
    'info',
    'latest',
    'block',
    'tx',
    'richlist',
    'peers',
    'address',
    'search'
];

const buildRoutes = router => {
    for (const route of routes) {
        router.use(`/${route}`, require(`./${route}`).routes());
    }
};

module.exports = buildRoutes;
