const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', name: 'Superuser', passwordHash })

    await user.save()
  })

  test('creation fails with status 400 if username is missing or under 3 characters', async () => {

    const newUser = {
      username: 'fo',
      name: 'Short Username',
      password: 'validpassword'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('username'))

  })

  test('creation fails with status 400 if password is missing or under 3 characters', async () => {

    const newUser = {
      username: 'validuser',
      name: 'Short Password',
      password: '12'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('password'))
  })

  test('creation fails with status 400 if username is not unique', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'root',
      name: 'Duplicate Root',
      password: 'validpassword'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.ok(result.body.error.includes('expected `username` to be unique'))

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

test('users are returned with their created blogs populated', async () => {
  const response = await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const users = response.body
  assert.ok(Array.isArray(users[0].blogs))
})

  after(async () => {
    await mongoose.connection.close()
  })
})