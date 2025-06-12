
import express from 'express'
import bcrypt from 'bcrypt-nodejs' // Use bcryptjs for compatibility?
import { User } from '../models/User.js'


const router = express.Router()

//Login endpoint actually "/users/login"
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.json({
      userId: user._id,
      accessToken: user.accessToken
    })
    //Maybe some error handeling here 
  } else {
    re.json({ notFound: true, message: "User not found or password is incorrect" })
  }
})
//Create a new user (registration endpoint actually "/users/signup")
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body
    const salt = bcrypt.genSaltSync()
    const user = new User({
      name,
      email,
      password: bcrypt.hashSync(password, salt) // Hash the password before saving
    })
    user.save()
    //If uer is OK 
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

export default router