const request = require ('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/Safe/transactions';
let user;
let user2;
let accUser;
let accUser2;

beforeAll(async () => {
  await app.db('transactions').del()
  await app.db('accounts').del()
  await app.db('users').del()
  const users = await app.db('users').insert([
    {name: 'user #1', mail: 'user@mail.com', passwd: '$2a$10$qM9CotNROTMZqjJMKlsVU.72xgF4t5l.iS8LLksYgidvA2vQW/L5y'},
    {name: 'user #2', mail: 'user2@mail.com', passwd: '$2a$10$qM9CotNROTMZqjJMKlsVU.72xgF4t5l.iS8LLksYgidvA2vQW/L5y'}
  ], '*'); //retorna todos os usuários
  [user, user2] = users;
  delete user.passwd;
  user.token = jwt.encode(user, 'Segredo!');/* passando payload */
  const accs = await app.db('accounts').insert([
    {name: 'Acc #1', user_id: user.id},
    {name: 'Acc #2', user_id: user2.id},
  ], '*');
  [accUser, accUser2] = accs;
});


test('Deve listar as transações de um usúario', () => {
  return app.db('transactions').insert ([
    { description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id },
    { description: 'T2', date: new Date(), ammount: 300, type: 'O', acc_id: accUser2.id },
  ]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('T1');
    }));
});

test( 'Deve inserir uma transação com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send( { description: 'New T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
      expect(res.body.ammount).toBe('100.00');
  });
});

test( 'Deve inserir uma transação com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send( { description: 'New T1', date: new Date(), ammount: 100, type: 'O', acc_id: accUser.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
      expect(res.body.ammount).toBe('-100.00');
  });
});

test( 'Transações de entrada devem ser positivas', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send( { description: 'New T1', date: new Date(), ammount: -100, type: 'I', acc_id: accUser.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
      expect(res.body.ammount).toBe('100.00');
  });
});

test( 'Transações de saída devem ser negativas', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send( { description: 'New T1', date: new Date(), ammount: 100, type: 'O', acc_id: accUser.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
      expect(res.body.ammount).toBe('-100.00');
  });
});

// test( 'Não deve inserir uma transação sem descrição', () => {
//   return request(app).post(MAIN_ROUTE)
//     .set('authorization', `bearer ${user.token}`)
//      .send( {  date: new Date(), ammount: 100, type: 'O', acc_id: accUser.id })
//     .then((res) => {
//       expect(res.status).toBe(400);
//       expect(res.body.error).toBe('Descrição é um campo obrigatório')  
//   });
// });

describe('Inserção de transação inválida', () => {

  let validTransaction;
  beforeAll(() => {
    validTransaction = { description: 'New T1', date: 
    new Date(), ammount: 100, type: 'O', acc_id: accUser.id };
  });

  const template = (newData, errorMenssage) => {
      return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({... validTransaction, ...newData})
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.error).toBe(errorMenssage)  
        });
    };
    test('Não deve inserir transação sem descrição', () => template({description: null}, 'Descrição é um campo obrigatório'));
});



test( 'Deve retornar uma transação por ID', () => {
  return app.db('transactions').insert(
     { description: 'T ID', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'],
  ).then(trans  =>  request(app).get(`${MAIN_ROUTE}/${trans[0].id}`)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(trans[0].id);
      expect(res.body.description).toBe('T ID');
  }));
});


test('Deve alterar uma transação', () => {
  return app.db('transactions').insert(
     { description: 'To Update', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'],
  ).then(trans  =>  request(app).put(`${MAIN_ROUTE}/${trans[0].id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({ description: 'Update'})
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Update');
  }));
});

test('Deve remover uma transação', () => {
  return app.db('transactions').insert(
     { description: 'remove', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'],
  ).then(trans  =>  request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(204);
  }));
});

test('Não deve remover uma transação de outro usuário', () => {
  return app.db('transactions').insert(
     { description: 'remove', date: new Date(), ammount: 100, type: 'I', acc_id: accUser2.id }, ['id'],
  ).then(trans  =>  request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('recurso negado');
  }));
});

test('Não deve remover uma conta de outro usuário', () => {
  return app.db('transactions').insert(
     { description: 'remove', date: new Date(), ammount: 100, type: 'I', acc_id: accUser2.id }, ['id'],
  ).then(() =>  request(app).delete(`/Safe/accounts/${accUser.id}`)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Essa conta possui transações associadas');
    }));
});




/*
tst
reqtest
estatus
body
*/