// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const PORT = process.env.PORT || 8080;
// const MONGOURL = process.env.MONGOURL;

// app.use(express.json());

// // mongoose.connect(MONGOURL, {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // });

// mongoose.connect(MONGOURL)
//     .then(() => console.log("✅ MongoDB connected successfully"))
//     .catch((err) => console.error("❌ MongoDB connection error:", err));

// const userSchema = new mongoose.Schema({
//   username: String,
//   password: String,
// });

// const User = mongoose.model("User", userSchema);

// const taskSchema = new mongoose.Schema({
//   text: String,
//   status: String,
//   priority: String,
//   userId: mongoose.Schema.Types.ObjectId,
// });

// const Task = mongoose.model("Task", taskSchema);

// app.post("/register", async (req, res) => {
//   const { username, password } = req.body;
//   const hashed = await bcrypt(password, 10);
//   const user = new User({ username, password: hashed });
//   await user.save();
//   res.json({ message: "User has been registered" });
// });

// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;
//   const user = await User.findOne({ username });
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ message: "Invalid Credentials" });
//   }
//   const token = jwt.sign({ userId: user._id }, "secret", { expiresIn: "1h" });
//   res.json({ token });
// });
// const authMiddleware = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ message: "No token" });
//   try {
//     const decode = jwt.verify(token, "secret");
//     req.userId = decode.userId;
//     next();
//   } catch (e) {
//     res.status(401).json({ message: "Invalid Token" });
//   }
// };

// app.get("/task", authMiddleware, async (req, res) => {
//   const tasks = await Task.find({ userId: req.userId });
//   res.json(tasks);
// });

// app.post("/task", authMiddleware, async (req, res) => {
//   const tasks = new Task({ ...req.body, userId: req.userId });
//   await tasks.save();
// });

// //delete task request
// app.delete("/tasks:id", authMiddleware, async (req, res) => {
//   await Task.findOneAndDelete({ _id: req.params.id.userId });
//   res.json({ message: "Task deleted" });
// });

// //update status of the task
// app.patch("/tasks/:id/status", authMiddleware, async (req, res) => {
//   const { status } = req.body;
//   const task = await Task.findOneAndUpdate(
//     { _id: req.params.id, userId: req.userId },
//     { status },
//     { new: true }
//   );
//   if (!task) return res.status(404).json({ message: "Task not found" });
//   res.json(task);
// });
// // change priority of Task
// app.patch("/tasks/:id/priority", authMiddleware, async (req, res) => {
//   const { priority } = req.body;
//   const task = await Task.findByIdAndUpdate(
//     { _id: req.params.id, userId: userId },
//     { priority },
//     { new: true }
//   );
//   if (!task) return res.status(404).json({ message: "Task not found" });
//   res.json(task);
// });

// app.listen(PORT, () => console.log("Server is running on port:8080"));

const express = require("express");
const app = express();
const cors = require("cors");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const MONGOURL = process.env.MONGOURL;

app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);
app.get("/", (req, res) => {
  res.send("MERN ToDo Backend is running 🚀");
});

// mongoose.connect(MONGOURL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// replace <password> with your password, and <dbname> with your DB name
// const uri = "mongodb+srv://ghugeleenavijay28:Leena%402807@cluster0.xqtjxs.mongodb.net/<dbname>?retryWrites=true&w=majority";

mongoose
  .connect(MONGOURL)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const taskSchema = new mongoose.Schema({
  text: String,
  status: String,
  priority: String,
  userId: mongoose.Schema.Types.ObjectId,
});

const Task = mongoose.model("Task", taskSchema);

// app.post("/register", async (req, res) => {
//   const { username, password } = req.body;
//   const hashed = await bcrypt.hash(password, 10);
//   const user = new User({ username, password: hashed });
//   await user.save();
//   res.json({ message: "User has been registered" });
// });
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (await User.findOne({ username })) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.status(201).json({ message: "User has been registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
  const token = jwt.sign({ userId: user._id }, "secret", { expiresIn: "1h" });
  res.json({ token });
});
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decode = jwt.verify(token, "secret");
    req.userId = decode.userId;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

app.get("/tasks", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
});

// app.post("/task", authMiddleware, async (req, res) => {
//   const tasks = new Task({ ...req.body, userId: req.userId });
//   await tasks.save();
//   res.status(201).json(tasks);
// });
app.post("/tasks", authMiddleware, async (req, res) => {
  try {
    const task = new Task({ ...req.body, userId: req.userId });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding task" });
  }
});

//delete task request
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Task deleted" });
});

//update status of the task
app.patch("/tasks/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});
// change priority of Task
app.patch("/tasks/:id/priority", authMiddleware, async (req, res) => {
  const { priority } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { priority },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

app.listen(PORT, () => console.log(`Server is running on port:${PORT}`));
