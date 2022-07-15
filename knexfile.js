module.exports = {
  test: {
    client: 'pg',
    version: '9.6',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'psswd',
      database: 'test'
    },
    migrations: {
        directory:'src/migrations',
    },
    seeds: {
        directory:'src/seeds',
    },
  },
};