module.exports = {
  type: "postgres",
  // database: "feleatest2",
  // username: "postgres",
  // password: "postgres",
  url: process.env.DATABASE_URL,
  logging: process.env.NODE_ENV === "dev",
  synchronize: process.env.NODE_ENV === "dev",
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