const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date()}@mail.com`

  test('deve listar users',  () => {
    const res =  request(app).get('/users')
      .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      // expect(res.body[0]).toHaveProperty('name', 'john doe');
  });
});

test('deve inserir user', async ( ) => {

    const res = await request(app).post('/users')
      .send({ name: 'walter mitty', mail,passwd: '123456' })
    .then((res) => {
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('walter mitty');
  })
});

test('não deve inserir user sem nome', () => {
  return request (app).post('/users')
  .send({ mail:'walter@mail.com', passwd: '123456'})
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("nome é um campo obrigatório!");
  })
})

test('não deve inserir user sem email', async () => {
   const result =  await request (app).post('/users')
     .send({ name: 'walter mitty', passwd: '123456'});
    expect(result.status).toBe(400);
    expect(result.body.error).toBe("email é um campo obrigatório!");
})

test('não deve inserir user sem senha', (done) => {
  request (app).post('/users')
  .send({ mail:'walter@mail.com',name: 'walter mitty'})
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("senha é um campo obrigatório!")
    done();
  })
  .catch(err => done.fail(err))
})

test('deve inserir user', async ( ) => {
    
    const res = await request(app).post('/users')
      .send({ name: 'walter mitty', mail,passwd: '123456' })
    .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('esse email já  está vinculado a uma conta');
  })
});