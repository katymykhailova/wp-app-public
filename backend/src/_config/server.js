export default {
  port: process.env.PORT || 3200,
  nodeEnv: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,
  isDev:
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test",
};
