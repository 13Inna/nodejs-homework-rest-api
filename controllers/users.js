const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");

const path = require("path");
const fs = require("fs/promises");

require("dotenv").config();
const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");


const register = async(req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({...req.body,
    password: hashPassword,avatarURL,
  });
  res.status(201).json({
    email: newUser.email,
    password: newUser.password,
  });
}

const login = async(req, res)=> {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findOneAndUpdate(user._id, { token });
  res.status(200).json({
    data: {
      token,
      user: { email: user.email, subscription: user.subscription },
    },
  });
}
 

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};


const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "No Content",
  });
};

const updateAvatar = async(req, res)=> {
    const {_id: userId} = req.user;
    const {path: tempUpload, originalname} = req.file;
    const filename = `${userId}_${originalname}`;
    const resultUpload = path.resolve(avatarsDir, filename);
    try {
    const avatar = await Jimp.read(tempUpload);
    await avatar.resize(250, 250).writeAsync(tempUpload);
  
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(userId, {avatarURL});

    res.status(200).json({
      avatarURL,
    });
  } catch (error) {
    await fs.unlink(tempUpload);
    throw HttpError(401, "Not authorized");
  }
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
};