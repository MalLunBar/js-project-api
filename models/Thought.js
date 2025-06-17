import mongoose from "mongoose"

const thoughtSchema = new mongoose.Schema({

  message: String,
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
})

export const Thought = mongoose.model("Thought", thoughtSchema)