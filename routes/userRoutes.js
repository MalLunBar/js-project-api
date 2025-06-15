
import express from 'express'
import bcrypt from 'bcryptjs'// Use bcryptjs for compatibility?
import { User } from '../models/User.js'


const router = express.Router()

//Create a new user (registration endpoint actually "/users/signup")
router.post("/signup", async (req, res) => {
  try {
    const { name, password } = req.body
    //make sure email is lowercase 
    const email = req.body.email.trim().toLowerCase()
    const salt = bcrypt.genSaltSync()
    const user = new User({
      name,
      email,
      password: bcrypt.hashSync(password, salt) // Hash the password before saving
    })
    //await to not send response before database finished saving 
    await user.save()

    res.status(201).json({
      success: true,
      message: "User created successfully",
      id: user._id,
      accessToken: user.accessToken

    })

  } catch (error) {
    res.status(400).json({
      success: false,
      response: error,
      message: "Failed to create user. Please check your input."
    })
  }
})

//Login endpoint actually "/users/login"
router.post("/login", async (req, res) => {
  //make sure email is lowercase 
  const email = req.body.email.trim().toLowerCase()
  const user = await User.findOne({ email })

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.status(200).json({
      success: true,
      accessToken: user.accessToken,
      userId: user._id,
      message: "Login successful",
    })
  } else {
    //Login failed
    res.status(401).json({
      success: false,
      message: "User not found or password is incorrect",
    });
  }
})


export default router