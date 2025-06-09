import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
import dotenv from "dotenv"

import thoughtsData from "./data.json"

dotenv.config()

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/thoughts"
mongoose.connect(mongoUrl)

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

const thoughtSchema = new mongoose.Schema({

  message: String,
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})
//Här lägg
const Thought = mongoose.model("Thought", thoughtSchema)

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await Thought.deleteMany({})
    thoughtsData.forEach(thought => {
      new Thought(thought).save()
    })
  }
  seedDatabase()
}

// Start defining your routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Welcome to the Happy Thoughts API",
    endpoints: endpoints
  })
})

//endpoint for getting all thoughts 
app.get("/thoughts", async (req, res) => {
  const { likes, minLikes } = req.query

  const query = {}

  //Make sure there is error handelning when parameter is not a number 

  if (likes !== undefined) {
    const numLikes = +likes
    if (isNaN(numLikes)) {
      return res.status(400).json({ error: "Query parameter 'likes' must be a number." })
    }
    query.hearts = numLikes
  }

  if (minLikes !== undefined) {
    const numMinLikes = +minLikes
    if (isNaN(numMinLikes)) {
      return res.status(400).json({ error: "Query parameter 'likes' must be a number." })
    }
    query.hearts = { $gte: numMinLikes }
  }

  try {
    const filteredThoughts = await Thought.find(query)

    if (filteredThoughts.length === 0) {
      return res.status(404).json({
        success: false,
        response: [],
        message: "No thougth found for that query. Please try another one"
      })
    }
    res.status(200).json({
      success: true,
      response: filteredThoughts
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "Server error! Failed to fetch thoughts."
    })
  }
})

// endpoint for getting one thought
app.get("/thoughts/:id", async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      response: [],
      message: "Invalid id"
    })
  }

  try {
    const thought = await Thought.findById(id)

    if (!thought) {
      return res.status(404).json({
        success: false,
        response: [],
        message: "No thougth found"
      })
    }

    res.status(200).json({
      success: true,
      response: thought
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "Server error! Failed to fetch thoughts."
    })
  }
})

//endpoint for deleting a thought
app.delete("/thoughts/:id", async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      response: [],
      message: "Could not delete! Invalid id"
    })
  }

  try {
    const thought = await Thought.findByIdAndDelete(id)

    if (!thought) {
      return res.status(404).json({
        success: false,
        response: [],
        message: "No thougth found"
      })
    }

    res.status(200).json({
      success: true,
      response: thought,
      message: "Was successfully deleted"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "Server error! Failed to fetch thoughts."
    })
  }
})

app.post("/thoughts", async (req, res) => {
  const { message } = req.body

  try {
    const newThought = await new Thought({ message }).save()
    console.log("Created thought:", newThought)

    res.status(201).json({
      success: true,
      response: newThought,
      message: "Thought was successfully created"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "Couldn't create thought"
    })
  }
})

app.patch("/thoughts/:id", async (req, res) => {
  const { id } = req.params
  const { newhearts } = req.body

  try {
    const thought = await Thought.findByIdAndUpdate(id, { hearts: newhearts }, { new: true })
    if (!thought) {
      return res.status(404).json({
        success: false,
        message: "Thought not found"
      })
    }
    res.status(200).json({
      success: true,
      response: thought
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update Likes",
      response: error
    })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
