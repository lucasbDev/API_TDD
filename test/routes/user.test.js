const request = require('supertest');

const app = require('../../src/app');

  test('deve listar users',  () => {
    const res =  request(app).get('/users')
      .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      // expect(res.body[0]).toHaveProperty('name', 'john doe');
  });
});
test('deve inserir user', async ( ) => {
    const mail = `${Date()}@mail.com`
    const res = await request(app).post('/users')
      .send({ name: 'walter mitty', mail,passwd: '123456' })
    .then((res) => {
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('walter mitty');
  })
});