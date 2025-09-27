module.exports = {
  apps: [
    {
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '128M',
      name: 'hyuil',
      script: './dist/app.js',
      wait_ready: true,
    },
  ],
};
