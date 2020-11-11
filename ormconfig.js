module.exports = {
  type: "postgres",
  // database: "felea",
  // username: "postgres",
  // password: "postgres",
  url: process.env.DATABASE_URL,
  logging: true,
  synchronize: true,
  ssl: {
    rejectUnauthorized: false
  },
  entities: [
    "dist/entities/**/*.js"
  ],
  migrations: [
    "dist/database/migrations/**/*.js"
  ],
  cli: {
    entitiesDir: "src/entities",
    migrationsDir: "src/database/migrations"
  }
}