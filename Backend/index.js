/**
 * Server Entry Point
 * Starts the layered monolith application
 */

const app = require("./src/app");
const config = require("./src/config/environment");
const { testConnection } = require("./src/config/database");
const logger = require("./src/shared/utils/logger.util");
const { startReminderScheduler } = require('./src/shared/jobs/reminder.job');

// Test database connection before starting server
const startServer = async () => {
  try {
    // Test database connection
    logger.info("Testing database connection...");
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error("Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Start Express server
    const server = app.listen(config.PORT, () => {
      logger.info("=".repeat(60));
      logger.info(`🏥 Se7ety Healthcare API - Layered Monolith`);
      logger.info("=".repeat(60));
      logger.info(`✅ Server running on http://localhost:${config.PORT}`);
      logger.info(`📋 Environment: ${config.NODE_ENV}`);
      logger.info(`🔗 API Base: ${config.API_PREFIX}/${config.API_VERSION}`);
      logger.info("=".repeat(60));
      logger.info(`📍 Health Check: http://localhost:${config.PORT}/health`);
      logger.info(
        `📍 API Root: http://localhost:${config.PORT}${config.API_PREFIX}/${config.API_VERSION}`
      );
      logger.info("=".repeat(60));
      logger.info(`🔐 Auth: ${config.API_PREFIX}/${config.API_VERSION}/auth`);
      logger.info(
        `📅 Appointments: ${config.API_PREFIX}/${config.API_VERSION}/appointments`
      );
      logger.info(
        `👨‍⚕️ Doctors: ${config.API_PREFIX}/${config.API_VERSION}/doctors`
      );
      logger.info("=".repeat(60));

      // Start background reminder scheduler after server is up
      startReminderScheduler();
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
};

// Start the server
startServer();
