import mongoose from "mongoose"
import crypto from "crypto"


// Create a schema for the users
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,

  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }, // Passwords should be hashed in a real application
  accessToken: {
    type: String,
    default: crypto.randomBytes(128).toString("hex")
  } // Generate a random access token

})

export const User = mongoose.model("User", userSchema)
