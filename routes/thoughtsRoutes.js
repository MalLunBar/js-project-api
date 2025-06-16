import express from 'express'
import mongoose from 'mongoose'
import { Thought } from '../models/Thought.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()
// Get all thoughts


//endpoint actually "/thoughts" 
router.get("/", async (req, res) => {
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

// endpoint for getting one thought actually "/thoughts/:id"
router.get("/:id", async (req, res) => {
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



// endpoint for creating a thought actually "/thoughts"
router.post("/", authenticateUser, async (req, res) => {
  const { message } = req.body
  console.log("req.user:", req.user)
  try {
    const newThought = await new Thought({
      message,
      user: req.user._id
    }).save()
    console.log("Created thought:", newThought)

    res.status(201).json({
      success: true,
      response: newThought,
      message: "Thought was successfully created"
    })
  } catch (error) {
    console.log("POST error", error)
    res.status(500).json({
      success: false,
      response: error,
      message: "Couldn't create thought"
    })
  }
})



//delete a thought endpoint actually "/thoughts/:id"
router.delete("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      response: [],
      message: "Could not delete! Invalid id"
    })
  }

  try {
    //Check if this message really belong to the user thats logged in
    const thought = await Thought.findByIdAndDelete({
      _id: id,
      user: req.user._id
    })

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


// endpoint for liking a thought actually "/thoughts/:id/like"
router.patch("/:id/like", async (req, res) => {
  const { id } = req.params

  try {
    const thought = await Thought.findByIdAndUpdate({
      _id: id,
      user: req.user._id
    }, { $inc: { hearts: 1 } }, { new: true, runValidators: true })

    if (!thought) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Thought not found"
      })
    }
    res.status(200).json({
      success: true,
      response: thought,
      message: "Updated"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "Server Error! Failed to update Likes",

    })
  }
})



//for updating a thought message (actuallt "/thoughts/:id/edit")
router.patch("/:id/edit", authenticateUser, async (req, res) => {
  const { id } = req.params
  const { message: newMessage } = req.body
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      response: [],
      message: "Invalid id"
    })
  }

  try {
    const thought = await Thought.findByIdAndUpdate(id, { message: newMessage }, { new: true, runValidators: true })

    if (!thought) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Thought not found"
      })
    }
    res.status(200).json({
      success: true,
      response: thought,
      message: "Updated"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "Server Error! Failed to update Message",

    })
  }
})

export default router