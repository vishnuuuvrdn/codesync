import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


//register
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,

      email,

      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created",

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//login
export const loginUser = async (req, res) => {
  try {
    const {email, password} = req.body;

    if(!email || !password){
      res.status(400).json({
        message : "Email and Password required!"
      })
    }

    const user = await User.findOne({email});

    if(!user){
      res.status(404).json({
        message : "User Not Found!"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
      res.status(401).json({
        message : "Invalid password!"
      })
    }


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE});

    res.cookie("token", token, {httpOnly:true});

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })

  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
};