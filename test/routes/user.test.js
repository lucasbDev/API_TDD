const request = require('supertest');

const app = require('../../src/app');

const jwt = require('jwt-simple');

const mail = `${Date.now()}@mail.com`

let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'user account', mail: `${Date.now()}@mail.com`, passwd: '123456'})
  user = { ...res[0]};
  user.token = jwt.encode(user, 'Segredo!');// criacção de user com token enviado
});


  test('deve listar users',  () => {
    const res =  request(app).get('/users')
      .set('authorization', `bearer ${user.token}`)
      .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      // expect(res.body[0]).toHaveProperty('name', 'john doe');
  });
});

test('deve inserir user', async ( ) => {

    const res = await request(app).post('/users')
      .send({ name: 'walter mitty', mail,passwd: '123456' })
      .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('walter mitty');
      expect(res.body).not.toHaveProperty('passwd');
  })
});

test('Deve criptografar a passwd', async () => {
  const res = await request(app).post('/users')
    .send({ name: 'walter mitty', mail:  `${Date.now()}@mail.com`,passwd: '123456' })
    .set('authorization', `bearer ${user.token}`)
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDb = await app.services.user.findOne({ id });
  expect(userDb.passwd).not.toBeUndefined();
  expect(userDb).not.toBe('123456');
})

test('não deve inserir user sem nome', () => {
  return request (app).post('/users')
  .send({ mail:'walter@mail.com', passwd: '123456'})
  .set('authorization', `bearer ${user.token}`)
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("nome é um campo obrigatório!");
  })
})

test('não deve inserir user sem email', async () => {
   const result =  await request (app).post('/users')
    .send({ name: 'walter mitty', passwd: '123456'})
    .set('authorization', `bearer ${user.token}`)
    expect(result.status).toBe(400);
    expect(result.body.error).toBe("email é um campo obrigatório!");
})

test('não deve inserir user sem senha', (done) => {
  request (app).post('/users')
  .send({ mail:'walter@mail.com',name: 'walter mitty'})
  .set('authorization', `bearer ${user.token}`)
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("senha é um campo obrigatório!")
    done();
  })
  .catch(err => done.fail(err))
})

// test('deve inserir user', async ( ) => {
    
//     const res = await request(app).post('/users')
//       .send({ name: 'walter mitty', mail,passwd: '123456' })
//     .then((res) => {
//     expect(res.status).toBe(400);
//     expect(res.body.error).toBe('esse email já  está vinculado a uma conta');
//   })
// });