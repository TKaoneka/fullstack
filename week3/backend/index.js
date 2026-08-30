const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
    return res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = persons.find(p => p.id === id)
    if (person) {
        return res.json(person)
    } else {
        return res.status(404).end()
    }
})

app.get('/info', (req, res) => {
    const date = new Date()
    const count = persons.length
    return res.send(`<p>Phonebook has info for ${count} people</p>
        <p>${date}</p>`)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    persons = persons.filter(p => p.id !== id)
    return res.status(204).end()
})

const generateId = () => {
  const maxId = 1000000
  return String(Math.floor(Math.random() * maxId))
}

app.post('/api/persons', (req, res) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({ 
            error: 'name or number is missing' 
        })
    }

    const nameExists = persons.some(person => person.name.toLowerCase() === body.name.toLowerCase())
    if (nameExists) {
      return res.status(400).json({ 
        error: 'name must be unique' 
      })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    return res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})