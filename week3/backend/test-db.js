require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log('1. Connection string found:', url ? 'YES' : 'NO')
console.log('2. Attempting connection to MongoDB Atlas...')

mongoose.connect(url, { family: 4, serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('3. Connected successfully!')
    const Person = mongoose.model('Person', new mongoose.Schema({ name: String, number: String }))
    
    console.log('4. Executing Person.find({})...')
    return Person.find({})
  })
  .then(persons => {
    console.log('5. Found persons:', persons)
    mongoose.connection.close()
    process.exit(0)
  })
  .catch(err => {
    console.error('ERROR ENCOUNTERED:', err.message)
    process.exit(1)
  })
