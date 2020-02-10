const mongoose = require("mongoose")

if ( process.argv.length <3 ) {
	console.log("Give MongoDB password as an argument")
	process.exit(1)
}

const password = process.argv[2]

const url = process.env.MONGODB_URI || `mongodb+srv://fullstack-waffe:${password}@clusteroids-5rclt.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

console.log("connecting to", url)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log("connected to MongoDB")
	})
	.catch((error) => {
		console.log("error connecting to MongoDB:", error.message)
	})

const personSchema = new mongoose.Schema({
	name: String,
	number: String
})

const Person = mongoose.model("Person", personSchema)

//module.exports = mongoose.model("Person", personSchema)

if ( process.argv.length === 3 ) {

	Person.find({}).then(result => {
		console.log("Phonebook:")
		result.forEach(person => {
			console.log(`${person.name}\t${person.number}`)
		})
		mongoose.connection.close()
	})

} else if ( process.argv.length === 5 ) {

	const person = new Person({
		name: process.argv[3],
		number: process.argv[4]
	})

	person.save().then(() => {
		console.log(`Added ${process.argv[3]} number ${process.argv[4]} to phonebook!`)
		mongoose.connection.close()
	})

} else {
	console.log("?????")
	mongoose.connection.close()
}