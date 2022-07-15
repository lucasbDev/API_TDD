const request = require('supertest');
const jwt = require('jwt-simple');
const app = require ('../../src/app');


const MAIN_ROUTE =  '/Safe/accounts';
let user;
let user2;

beforeEach(async () => {
  const res = await app.services.user.save({ name: 'user account', mail: `${Date.now()}@mail.com`, passwd: '123456'})
  user = { ...res[0]};
  user.token = jwt.encode(user, 'Segredo!');
  const res2 = await app.services.user.save({ name: 'user account #2', mail: `${Date.now()}@mail.com`, passwd: '123456' })
  user2 = { ...res2[0]};
});


test('Deve inserir conta corretamente', (done) => {
  request(app).post(MAIN_ROUTE)
  .send({ name: 'lucas'})
  .set('authorization', `bearer ${user.token}`)
  .then((result) => {
    expect(result.status).toBe(201)
    expect(result.body.name).toBe('lucas')
    done();
  })
   .catch(err => done.fail(err))
});

test('não deve inserir user sem nome', ( ) => {
  return request(app).post(MAIN_ROUTE)
    .send({ })
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('é obrigatório o preenchimento do campo nome!')
    })
})

test('não deve inserir conta de nome duplicado', () => {
  return app.db('accounts').insert({ name: 'user duplicado', user_id: user.id })
    .then(() => request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'user duplicado'}))
  .then((res) => {
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Esse nome já está vinculado a uma conta')
  });

})

test('deve retornar apenas uma conta', async() => {
  await app.db('transactions').del()
  await app.db('transfers').del()
  await app.db('accounts').del()
  return app.db('accounts').insert([
    { name:'user account #1', user_id: user.id },
    { name: 'user account #2', user_id: user2.id },
  ]).then(() => request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('user account #1');
  }));
});

test('Deve retornar uma conta por Id', () => {
  return app.db('accounts')
  .insert({name: 'test t', user_id:user.id},['id']) //especificou o id como campo retornado
  .then(tes => request(app).get(`${MAIN_ROUTE}/${tes[0].id}`).set('authorization', `bearer ${user.token}`))
  .then((res) => {
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('test t');
    expect(res.body.user_id).toBe(user.id);
  });
});


  test('não deve retornar uma conta de outro usúario', () => {
    return app.db('accounts')
    .insert({ name: 'acc user #2', user_id: user2.id }, ['id'])//retorna o ID
    .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
       .set('authorization', `bearer ${user.token}`))
    .then((res) => {
        expect(res.status).toBe(403)
        expect(res.body.error).toBe('recurso negado')
    });
  });
   
  test('Deve atualizar uma conta', ( ) => {
  return app.db('accounts')
  .insert({name: 'test test', user_id:user.id},['id'])
  .then(tes => request(app).put(`${MAIN_ROUTE}/${tes[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .send({ name: 'teste'}))//metodo PUT para atualizar
   //nome atualizado
  .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe( 'teste' );
  });
});

  test('não deve alterar uma conta de outro usúario', () => {
    return app.db('accounts')
    .insert({ name: 'acc user #2', user_id: user2.id }, ['id'])//retorna o ID
    .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
       .send({ name: 'acc update'})
       .set('authorization', `bearer ${user.token}`))
    .then((res) => {
        expect(res.status).toBe(403)
        expect(res.body.error).toBe('recurso negado')
    });
  });


test('devo remover uma conta', ( ) => {
  return app.db('accounts')
    .insert({ name: 'acc teste', user_id: user.id }, ['id'])
    .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

 test('não deve remover uma conta de outro usúario', () => {
    return app.db('accounts')
    .insert({ name: 'acc user #2', user_id: user2.id }, ['id'])//retorna o ID
    .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
       .set('authorization', `bearer ${user.token}`))
    .then((res) => {
        expect(res.status).toBe(403)
        expect(res.body.error).toBe('recurso negado')
    });
  });