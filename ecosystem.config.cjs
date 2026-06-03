module.exports = {
  apps: [
    {
      name: "jiuspeak-tatame",
      script: "./dist/server.cjs",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000
      },
      // Redirect PM2 console outputs to consolidate with our professional Winston setup
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-app.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
