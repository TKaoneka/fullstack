const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcryptjs')

describe('when there is initially some blogs saved', () => {
  let token = ''

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password123', 10)
    const user = new User({ username: 'root', name: 'Superuser', passwordHash })
    const savedUser = await user.save()

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'password123'
      })

    token = loginResponse.body.token

    const blogsWithUser = helper.initialBlogs.map(blog => ({
      ...blog,
      user: savedUser._id
    }))

    await Blog.insertMany(blogsWithUser)
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data and valid token', async () => {
      const newBlog = {
        title: 'Async/await simplifies async code',
        author: 'Full Stack Open',
        url: 'https://fullstackopen.com/',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('Async/await simplifies async code'))
    })

    test('fails with status code 401 Unauthorized if token is not provided', async () => {
      const newBlog = {
        title: 'Unauthorized Blog Post',
        author: 'Anonymous',
        url: 'https://unauthorized.com/',
        likes: 1
      }

      const result = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('token missing'))

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})