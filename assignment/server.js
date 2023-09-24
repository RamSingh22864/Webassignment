const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://ram:22864@cluster0.e0cgxai.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define MongoDB Schema for User
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', UserSchema);

// Define CRUD Routes and Authentication Routes
// Implement your CRUD and authentication logic here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




// User Registration (Signup)
app.post('/signup', [
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ], async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    // Check if the user already exists
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
  
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
  
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    // Create a new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
  
    res.status(201).json({ message: 'User registered successfully' });
  });
  
  // User Login
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    // Find the user in the database
    const user = await User.findOne({ username });
  
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
  
    res.status(200).json({ token });
  });


  // Create an Item (POST)
app.post('/items', async (req, res) => {
    try {
      const { name, description } = req.body;
      const newItem = new Item({ name, description });
      await newItem.save();
      res.status(201).json(newItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  // Get All Items (GET)
  app.get('/items', async (req, res) => {
    try {
      const items = await Item.find();
      res.status(200).json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  // Get Single Item by ID (GET)
  app.get('/items/:id', async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.status(200).json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  // Update an Item by ID (PUT)
  app.put('/items/:id', async (req, res) => {
    try {
      const { name, description } = req.body;
      const updatedItem = await Item.findByIdAndUpdate(
        req.params.id,
        { name, description },
        { new: true }
      );
      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  // Delete an Item by ID (DELETE)
  app.delete('/items/:id', async (req, res) => {
    try {
      const deletedItem = await Item.findByIdAndRemove(req.params.id);
      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  