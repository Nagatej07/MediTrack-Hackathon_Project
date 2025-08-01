const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./server/routes/authRoutes");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');

// Config
dotenv.config();
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());                          
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use("/api", authRoutes);


// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected", process.env.MONGO_URI))
  .catch((err) => console.error("MongoDB Error:", err));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
