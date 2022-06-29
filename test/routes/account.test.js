const request = require('supertest');
const jwt = require('jwt-simple');
const app = require ('../../src/app');


const MAIN_ROUTE =  '/accounts';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'user account', mail: `${Date.now()}@mail.com`, passwd: '123456'})
  user = { ...res[0]};
  user.token = jwt.encode(user, 'Segredo!');
});


test('Deve inserir conta corretamente', (done) => {
  request(app).post(MAIN_ROUTE)
  .send({ name: 'lucas', user_id: user.id })
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
    .send({ user_id: user.id})
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('é obrigatório o preenchimento do campo nome!')
    })
})

test('Deve listar todas as contas', () => {
  app.db('accounts')
    .insert({ name: 'teste tes', user_id: user.id })
    .then(() => request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.lenght).toBeGreaterThan(0);
    });
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
   
  test('Deve atalizar uma conta', ( ) => {
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

test('devo remover uma conta', ( ) => {
  return app.db('accounts')
    .insert({ name: 'acc teste', user_id: user.id }, ['id'])
    .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});