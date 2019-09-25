module.exports = {
    apps: [{
        name: 'server',
        script: './index.js',
        instances: 0,
        autorestart: true,
        max_memory_restart: '100M',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }, {
        name: 'sync',
        script: './scripts/sync.js',
        instances: 1,
        autorestart: true,
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }]
};
