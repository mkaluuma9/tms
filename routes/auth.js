const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const router = express.Router();
const dbPath = path.join(__dirname, '../db.json');

// Helper function to read db.json
const readDb = () => JSON.parse(fs.readFileSync(dbPath));

// Helper function to write to db.json
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// User registration
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role, departmentId, levelId } = req.body;
  const db = readDb();

  if (db.users.find(user => user.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: db.users.length + 1,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    departmentId,
    levelId,
    image: req.file ? req.file.path : '',
    tasks: []
  };

  db.users.push(newUser);
  writeDb(db);

  res.status(201).json({ message: 'User registered successfully' });
});

// Update user
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, role, departmentId, levelId } = req.body;
  const db = readDb();
  const userIndex = db.users.findIndex(user => user.id == id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (password) {
    db.users[userIndex].password = await bcrypt.hash(password, 10);
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    firstName: firstName || db.users[userIndex].firstName,
    lastName: lastName || db.users[userIndex].lastName,
    email: email || db.users[userIndex].email,
    role: role || db.users[userIndex].role,
    departmentId: departmentId || db.users[userIndex].departmentId,
    levelId: levelId || db.users[userIndex].levelId,
    image: req.file ? req.file.path : db.users[userIndex].image
  };

  writeDb(db);
  res.status(200).json({ message: 'User updated successfully' });
});

// Delete user
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const userIndex = db.users.findIndex(user => user.id == id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  db.users.splice(userIndex, 1);
  writeDb(db);

  res.status(200).json({ message: 'User deleted successfully' });
});

router.get('/users', (req, res) => {
    try {
      const db = readDb();
      const users = db.users;
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  });


  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const db = readDb();
      const user = db.users.find(user => user.email === email);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
  
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error in login:', error); // Detailed error logging
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  

module.exports = router;
