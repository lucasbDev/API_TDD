const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE =  '/Safe/balance';
const ROUTE =  '/Safe/transactions';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMTAwIiwibmFtZSI6InVzZXIgIzMiLCJtYWlsIjoidXNlcjNAbWFpbCJ9.-v-CmZ_rRH8KOMfxaITYwTmQF74CmeAoDXwTtl8K9TM'

beforeAll(async () => {
  await app.db.seed.run();
})

describe('Ao calcular o salto do usuário...', () => {
  test('Deve retornar apenas as contas com alguma tansação', () => {
    return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });
  })
  test('Deve adicionar valores na entrada', () => {
    return request(app).post(ROUTE)
      .send({ description: '1', date: new Date(), ammount: 100, type: 'I', acc_id: 10100, status: true})
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toBe(10100);
          expect(res.body[0].sum).toBe('100.00');
      });
    });
  })
  test('Deve subtrair valores na saída', () => {
    return request(app).post(ROUTE)
      .send({ description: '1', date: new Date(), ammount: 200, type: 'O', acc_id: 10100, status: true})
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toBe(10100);
          expect(res.body[0].sum).toBe('-100.00');
      });
    });
  })
  test('Não deve considerar transações pendentes', () => {
    return request(app).post(ROUTE)
      .send({ description: '1', date: new Date(), ammount: 100, type: 'I', acc_id: 10100, status: false})
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toBe(10100);
          expect(res.body[0].sum).toBe('100.00');
      });
    });
  })
})