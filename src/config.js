module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "https://codeful.vercel.app",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://postgres@localhost/codeful",
  JWT_SECRET: process.env.JWT_SECRET || "codeful-jwt",
};
