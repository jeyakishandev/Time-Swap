export default () => ({
  port: parseInt(process.env.BACKEND_PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET || undefined,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  database: {
    url: process.env.DATABASE_URL || undefined,
  },
  nodeEnv: process.env.NODE_ENV || 'development',
});
