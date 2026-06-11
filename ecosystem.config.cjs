module.exports = {
  apps: [
    {
      name: "jiuspeak-bjj-production",
      script: "./dist/server.cjs",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      combine_logs: true,
      merge_logs: true,
      listen_timeout: 8000,
      kill_timeout: 4000,
      wait_ready: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000
    }
  ]
};
