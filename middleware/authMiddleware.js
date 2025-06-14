import { User } from '../models/User.js'

export const authenticateUser = async (req, res, next) => {
  
  
  const user = await User.findOne({ accessToken: req.headers.authorization })
  if (user) {
    req.user = user
    next()
  } else {
    res.status(401).json({
      success: false,
      loggedOut: true,
      message: "Unauthorized! Please provide a valid access token."
    })
  }
}



// export const authenticateUser = async (req, res, next) => {
//   try {
//     const user = await User.findOne({
//       accessToken: req.header("Authorization"),
//     });
//     if (user) {
//       req.user = user;
//       next();
//     } else {
//       res.status(401).json({
//         message: "Authentication missing or invalid.",
//         loggedOut: true,
//       });
//     }
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: err.message });
//   }
// };