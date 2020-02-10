const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const morgan = require('morgan')

morgan.token('body', function (req, res) { return JSON.stringify(req.body) });
app.use(morgan(
    ':method :url :status :response-time ms :: :body'
))

app.use(express.json())

app.use(express.static('build'))

let persons = [
    {
      id: 1,
      name: "Pelle peloton",
      number: "040-2131231",
    },
    {
      id: 2,
      name: "ASD peloton",
      number: "040-1861237",
    },
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has ${persons.length} entries!</p><p>${new Date(Date.now())}</p>`)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.post('/api/persons', (req, res) => {
    if (!req.body.name) {
      return res.status(400).json({ 
        error: 'No name' 
      })
    }
    if (!req.body.number) {
      return res.status(400).json({ 
        error: 'No number' 
      })
    }

    const id = Math.floor(Math.random() * 16 * 1024 * 1024)
    const person = { ...req.body, id: id }
    if (persons.reduce((value, p) => value || person.name === p.name, false)) {
      return res.status(400).json({ 
        error: 'Person already exists' 
      })
    }
    console.log(`Added ${person}`)
    persons.push(person)

    res.json(person)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.send()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})