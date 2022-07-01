const request = require('supertest')
const app = require('../../src/app');




test('Deve criar user via SignUp', () => {
  return request(app).post('/auth/signup')
  .send({ name: 'walter', mail: `${Date.now()}@mail.com`, passwd: '123456'})
  .then((res) => {
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('walter');
    expect(res.body).toHaveProperty('mail');
    expect(res.body).not.toHaveProperty('passwd');
  });
});

test('Deve receber token no login', () => {
  const mail = `${Date.now()}@mail.com`;
  return app.services.user.save(
    { name: 'walter', mail, passwd: '123456'}
  ).then(() => request(app).post('/auth/signin')
      .send({ mail, passwd:'123456'}))
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
      });
});

test('Não deve auth com passwd wrong', () => {
   const mail = `${Date.now()}@mail.com`;
  return app.services.user.save(
    { name: 'walter', mail, passwd: '123456'}
  ).then(() => request(app).post('/auth/signin')
      .send({ mail, passwd:'654321'}))
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('usúario ou senha incorreta');
      });
});

test('Não deve auth com passwd wrong', () => {
  return request(app).post('/auth/signin')
      .send({ mail:'acessoNegado@mail.com', passwd:'654321'})
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('usúario ou senha incorreta');
      });
});

test('Não deve acessar rota sem token', () => {
  return request(app).get('/Safe/users')
    .then((res) => {
      expect(res.status).toBe(401)
    });
});