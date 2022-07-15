
exports.seed = (knex) => {
 
    return knex('users').insert([
      {id: 10100, name: 'user #3', mail: 'user3@mail.com', passwd: '$2a$10$qM9CotNROTMZqjJMKlsVU.72xgF4t5l.iS8LLksYgidvA2vQW/L5y'},
      {id: 10101, name: 'user #4', mail: 'user4@mail.com', passwd: '$2a$10$qM9CotNROTMZqjJMKlsVU.72xgF4t5l.iS8LLksYgidvA2vQW/L5y'}
    ])
    .then(() => knex('accounts').insert([
      {id:10101, name: 'AccO #1', user_id: 10000},
      {id:10102, name: 'AccO #1', user_id: 10000},
      {id:10103, name: 'AccO #2', user_id: 10001},
      {id:10104, name: 'AccO #2', user_id: 10001},
    ]))
}
