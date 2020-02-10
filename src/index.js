/// Requirements

const dotenv = require("dotenv")
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")

dotenv.config()
const Person = require("./models/person")

/// Setup

const app = express()
app.use(cors())

morgan.token("body", function (req) { return JSON.stringify(req.body) })
app.use(morgan(
	":method :url :status :response-time ms :: :body"
))

app.use(express.json())
app.use(express.static("build"))

/// Routes

app.get("/", (req, res) => {
	res.send("<h1>Hello World!</h1>")
})

app.get("/info", (req, res, next) => {
	Person.find({}).then(people => {
		res.send(`<p>Phonebook has ${people.length} entries!</p><p>${new Date(Date.now())}</p>`)
	}).catch(error => next(error))
})

app.get("/api/persons", (req, res, next) => {
	Person.find({}).then(people => {
		res.json(people.map(person => person.toJSON()))
	}).catch(error => next(error))
})

app.post("/api/persons", (req, res, next) => {
	const body = req.body

	const person = new Person({
		name: body.name,
		number: body.number
	})

	person.save()
		.then(p => p.toJSON())
		.then(p => {
			res.json(p)
		})
		.catch(error => next(error))
})

app.put("/api/persons/:id", (req, res, next) => {
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

app.get("/api/persons/:id", (request, response, next) => {
	Person.findById(request.params.id).then(person => {
		if (person) {
			response.json(person.toJSON())
		} else {
			response.status(404).end()
		}
	}).catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
	Person.findByIdAndRemove(request.params.id).then(() => {
		response.status(204).end()
	}).catch(error => next(error))
})

/// Error handling

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === "CastError' && error.kind == 'ObjectId") {
		return response.status(400).send({ error: "malformatted id" })
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

/// Launch

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})