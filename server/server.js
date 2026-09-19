const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const interactionRoutes = require("./routes/interactionRoutes");
const matchRoutes = require("./routes/matchRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const safetyRoutes = require("./routes/safetyRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

connectDB();

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(helmet());

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/safety", safetyRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "OK",
    message: "Connectly API is running",
  });
});

app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  return res.status(500).json({
    message: "Internal server error",
  });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_user", (userId) => {
    if (!userId) return;

    socket.join(`user:${userId}`);

    console.log(`Socket ${socket.id} joined user:${userId}`);
  });

  socket.on("leave_user", (userId) => {
    if (!userId) return;

    socket.leave(`user:${userId}`);
  });

  socket.on("join_match", (matchId) => {
    if (!matchId) return;

    socket.join(`match:${matchId}`);

    console.log(`Socket ${socket.id} joined match:${matchId}`);
  });

  socket.on("leave_match", (matchId) => {
    if (!matchId) return;

    socket.leave(`match:${matchId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
