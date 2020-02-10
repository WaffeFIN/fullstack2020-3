require('dotenv').config()

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

const Person = require('./models/person')

/// Routes

app.get('/', (req, res, next) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res, next) => {
    Person.find({}).then(people => {
        res.send(`<p>Phonebook has ${people.length} entries!</p><p>${new Date(Date.now())}</p>`)
    }).catch(error => next(error));
})

app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(people => {
      res.json(people.map(person => person.toJSON()))
    }).catch(error => next(error));
})

app.post('/api/persons', (req, res, next) => {
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
    Person.find({ name: req.body.name }).then(people => {
        if (people.length > 0) {
            return res.status(400).json({ 
              error: 'Person already exists' 
            })
        }
        const person = new Person({ ...req.body, id: id })
    
        person.save().then(response => {
            console.log(`Added ${req.body.name} number ${req.body.number} to phonebook!`);
            res.json(people.map(person => person.toJSON()))
        }).catch(error => next(error))
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
  
    const person = {
      name: body.name,
      number: body.number
    }
  
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
      .then(updated => {
        res.json(updated.toJSON())
      }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person.toJSON())
    } else {
      response.status(404).end() 
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id).then(result => {
        response.status(204).end()
    }).catch(error => next(error))
})

/// Error handling

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}

app.use(errorHandler)

/// Launch

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})