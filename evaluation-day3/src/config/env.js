import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = ['PORT', 'DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'ALLOWED_ORIGINS', 'NODE_ENV'];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is required but not set.`);
  }
});

const config = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET, 
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGINS,
  NODE_ENV: process.env.NODE_ENV,
};

export default config;