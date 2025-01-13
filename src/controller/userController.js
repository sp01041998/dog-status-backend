const User = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const savedListModel = require("../model/savedListModel")
const mongoose = require('mongoose');

exports.createUser = async (req, res) => {
  const { name = '', email = '', password = '' } = req?.body || {};
  console.log("i am getting called")
  console.log(name, email, password)

  try {
    if (!name) {
      return res.status(400).send({ status: false, message: 'Name is required field' });
    }
    if (!email) {
      return res.status(400).send({ status: false, message: 'email is required field' });
    }
    if (!password) {
      return res.status(400).send({ status: false, message: 'Password is required field' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ status: false, message: 'User already exists with this email' });
    }
    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("user created successfully")
    return res.status(201).send({
      status: true,
      message: 'User created successfully',
      data: {
        name: newUser.name,
        email: newUser.email,
      },
    });

  } catch (error) {
    console.log(error?.message || error);
    res.status(error?.statusCode || 500).send({
      state: false,
      message: error?.message || 'Internal server error',
    });
  }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)
    if (!email || !password) {
        return res.status(400).send({ status: false, message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send({ status: false, message: 'Invalid email or password.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).send({ status: false, message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log("user logged in successfully", token)
        return res.status(200).send({
            status: true,
            message: 'Login successful.',
            data: { token, userId: user._id, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: false, message: 'Server error. Please try again.' });
    }
};

exports.createUserList = async (req, res) => {
  try {
      const { savedImages, listName } = req.body;
      const userId = req.userId;

      if (!userId || !Array.isArray(savedImages)) {
          return res.status(400).json({ message: 'User ID and saved images are required' });
      }

      console.log(userId, savedImages, listName);

      // Create a new saved list document using the savedListModel (renamed to avoid conflict)
      const newSavedList = new savedListModel({
          userId,
          savedImages,
          listName
      });

      // Save the new saved list
      const savedListDoc = await newSavedList.save();

      return res.status(201).json({
          message: 'Saved list created successfully',
          savedList: savedListDoc // Return the saved list document
      });
  } catch (error) {
      console.error('Error creating user list:', error);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getSavedList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.userId;
    let query = { userId, isDeleted : false };
    if (listId) {
      query._id = listId;
    }

    const savedLists = await savedListModel.find(query)
      .populate('savedImages', 'imageUrl imageName statusCode')
      .exec();
    if (savedLists.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Saved list(s) not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Saved list(s) fetched successfully',
      data: savedLists
    });
  } catch (error) {
    console.error('Error fetching saved list:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteSavedList = async (req, res) => {
  try {
    const { listId } = req.params
    const userId = req.userId

    if (!listId) {
      return res.status(400).json({ message: "List ID is required." });
    }
    const result = await savedListModel.findOneAndUpdate(
       {_id : listId},
      { isDeleted: true },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "List not found." });
    }

    const savedLists = await savedListModel.find({userId, isDeleted : false})
      .populate('savedImages', 'imageUrl imageName statusCode')
      .exec();

      // if (savedLists.length === 0) {
      //   return res.status(404).json({
      //     status: 'error',
      //     message: 'Saved list(s) not found'
      //   });
      // }
  
      return res.status(200).json({
        status: 'success',
        message: 'Saved list(s) fetched successfully',
        data: savedLists
      });
    // return res.status(200).json({ message: "List marked as deleted successfully.", data: result });
  } catch (error) {
    console.error("Error deleting saved list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getListData = async(req, res) => {
  try{
    const {listId = ''} = req?.params || {}

    const listData = await savedListModel.findOne({_id : listId, isDeleted : false}).populate('savedImages', 'imageUrl imageName statusCode').exec();
    if(!listData){
      return res.status(404).json({ message: "List not found." });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Saved list(s) fetched successfully',
      data: listData
    });
  }catch(error){
    console.error("Error fetching saved list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

exports.removeImageFromList = async (req, res) => {
  const { listId, imageId } = req.params;

  try {
    const savedList = await savedListModel.findOne({ _id: listId, isDeleted: false });

    if (!savedList) {
      return res.status(404).json({ message: 'Saved list not found' });
    }
    savedList.savedImages = savedList.savedImages.filter(
      (image) => image.toString() !== imageId
    );

    await savedList.save();

    const newList = await savedListModel.findOne({ _id: listId, isDeleted: false }).populate('savedImages', 'imageUrl imageName statusCode').exec();



    return res.status(200).json({
      status: 'success',
      message: 'Saved list(s) fetched successfully',
      data: newList
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error removing image from the list' });
  }
};


