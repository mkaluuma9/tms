const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const multer = require('multer');
const path = require('path');
require('dotenv').config();




const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
console.log('JWT Secret:', process.env.JWT_SECRET);
const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use('/auth', upload.single('image'), authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
