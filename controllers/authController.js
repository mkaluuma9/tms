const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db.json');

// Helper function to read db.json
const readDb = () => JSON.parse(fs.readFileSync(dbPath));

// Helper function to write to db.json
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Register user
const registerUser = async (req, res) => {
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
};

// Update user
const updateUser = async (req, res) => {
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
};

// Delete user
const deleteUser = (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const userIndex = db.users.findIndex(user => user.id == id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  db.users.splice(userIndex, 1);
  writeDb(db);

  res.status(200).json({ message: 'User deleted successfully' });
};

module.exports = {
  registerUser,
  updateUser,
  deleteUser
};
