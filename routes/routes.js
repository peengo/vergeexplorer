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

const buildRoutes = app => {
    for (const route of routes) {
        app.use(`/${route}`, require(`./${route}`));
    }
};

module.exports = buildRoutes;