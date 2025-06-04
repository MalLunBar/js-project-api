import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
import dotenv from "dotenv"

import thoughtsData from "./data.json"

dotenv.config() 

//variable to not modify the original data
let thoughts = [...thoughtsData]

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/thoughts"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise
//Fortsätt här och ändra local host namn sen 


// Start defining your routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Welcome to the Happy Thoughts API",
    endpoints: endpoints
  })
})



//endpoint for getting all thoughts
app.get("/thoughts", (req, res) => {

  let filteredThoughts = thoughts

  //show hearts with more than 0 likes
  if (req.query.minHearts !== undefined) {
    const minHearts = +req.query.minHearts
    filteredThoughts = filteredThoughts.filter(thought => thought.hearts > minHearts)
  }

  res.json(filteredThoughts)
})

//endpoint for getting one thought
app.get("/thoughts/:id", (req, res) => {

  const thought = thoughts.find(thought => thought._id === req.params.id)

  if (!thought) {
    return res.status(404).json({ error: "Thought not found" })
  }
  res.json(thought)
})


//endpoint for deleting a thought
//returns -1 if thought doesnt exist
app.delete("/thoughts/:id", (req, res) => {
  const index = thoughts.findIndex(thought => thought._id === req.params.id)

  if (index == -1) {
    return res.status(404).json({ error: "thought dosnt exist" })
  }

  const deletedThought = thoughts.splice(index, 1)[0]
  res.json({ message: "Thought deleted", deletedThought })
})


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
