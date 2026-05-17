// Minimal configuration
module.exports = {
  db: {
    host: 'localhost',
    user: 'behealthy',
    password: 'Ofakim123?',
    database: 'BeHealthyDB'
  },
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'replace_this_with_env_secret'
};
