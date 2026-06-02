/**
 * PM2 Ecosystem Configuration for JiuSpeak BJJ Platform
 * Optimized for Ubuntu 24 production environment.
 */
module.exports = {
  apps: [
    {
      name: "jiuspeak-platform",
      script: "dist/server.cjs",
      instances: "max",       // Cluster mode to scale across all CPU cores
      exec_mode: "cluster",   // Cluster execution mode
      watch: false,           // Off in production to avoid random reloads
      max_memory_restart: "1G", // Auto-restart if memory leaks occur
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "logs/pm2-err.log",
      out_file: "logs/pm2-out.log",
      combine_logs: true,
      merge_logs: true
    }
  ]
};
