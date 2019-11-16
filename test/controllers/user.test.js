import request from 'supertest';
import { expect } from 'chai';

import User from '../../src/api/components/user/user.model';
import server from '../../src/api/server';
import { UserBuilder } from '../data-builders';

const prefix = '/api';

describe(`${prefix}/users`, () => {
  before(() => User.deleteMany());
  after(() => User.deleteMany());

  describe('GET /', () => {
    it('should return all users', async () => {
      const res = await request(server).get(`${prefix}/users`);

      expect(res.status).to.equal(200);
    });
  });

  describe('POST /', () => {
    it('should return 400 when the body doesn\'t have name, email and password', async () => {
      const { status } = await request(server)
        .post(`${prefix}/users`);

      expect(status).to.equals(400);
    });

    it('should return a array with keys field and error when the body doesn\'t have name, email and password', async () => {
      const { body } = await request(server)
        .post(`${prefix}/users`);


      expect(body).to.be.an('array');
      expect(body.length).to.equal(3);
      expect(body[0]).to.have.property('field');
      expect(body[0]).to.have.property('error');
      expect(body[1]).to.have.property('field');
      expect(body[1]).to.have.property('error');
      expect(body[2]).to.have.property('field');
      expect(body[2]).to.have.property('error');
    });

    it('should return a array with key field filled by email when email is invalid', async () => {
      const emailInvalid = UserBuilder.emailInvalid();

      const { body } = await request(server)
        .post(`${prefix}/users`)
        .send(emailInvalid);

      const errorEmail = () => body.find((error) => error.field === 'email');

      expect(body).to.be.an('array');
      expect(errorEmail().field).to.equal('email');
    });

    it('should return a user when the all request body is valid', async () => {
      const newUser = UserBuilder.randomUserInfo();

      const { status, body } = await request(server)
        .post(`${prefix}/users`)
        .send(newUser);

      expect(status).to.equal(201);
      expect(body).to.have.property('_id');
      expect(body).to.have.property('name', newUser.name);
      expect(body).to.have.property('email', newUser.email.toLowerCase());
      expect(body).to.not.have.property('password');
    });
  });
});
