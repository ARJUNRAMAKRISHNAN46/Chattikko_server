import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { userName, email, password, confirmPassword, gender } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password doesn't match" });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const boyProfilePhoto = `https://avatar.iran.liara.run/public/boy?userName=${userName}`;
    const girlProfilePhoto = `https://avatar.iran.liara.run/public/girld?userName=${userName}`;

    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      profilePhoto: gender === "male" ? boyProfilePhoto : girlProfilePhoto,
      gender,
    });

    if (newUser) {
      await generateTokenAndSetCookie(newUser?._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser?._id,
        userName: newUser?.userName,
        email: newUser?.email,
        profilePhoto: newUser?.profilePhoto,
        gender,
      });
    } else {
      res.status(400).json({
        error: "Invalid user data",
      });
    }
  } catch (error) {
    console.log("Error in signup controller", error?.message);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User?.findOne({ email });
    const isPasswordCorrect = await bcrypt?.compare(
      password,
      user?.password || ""
    );
    console.log("🚀 ~ login ~ password:", password, user?.password);

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }

    generateTokenAndSetCookie(user?._id, res);

    res.status(200).json({
      _id: user?._id,
      userName: user?.userName,
      email: user?.email,
      profilePhoto: user?.profilePhoto,
    });
  } catch (error) {
    console.log("Error in login controller", error?.message);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Error in logout controller : ", error?.message);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
