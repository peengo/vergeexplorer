module.exports = {
    apps: [{
        name: 'server',
        script: 'npm',

        args: 'start',
        instances: 4,
        autorestart: true,
        watch: false,
        max_memory_restart: '100M',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }]
};
