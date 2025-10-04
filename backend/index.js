const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load DB config from environment variables (you’ll set these in the deployment settings)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// API endpoint: get all clips
app.get("/api/clips", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM clips ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("DB get error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// API endpoint: post a clip
app.post("/api/clips", async (req, res) => {
  const { title, url, description } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: "title and url are required" });
  }
  try {
    await db.query(
      "INSERT INTO clips (title, url, description) VALUES (?, ?, ?)",
      [title, url, description]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DB insert error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Serve static frontend
app.use("/", express.static(path.join(__dirname, "../public")));

// If no route matched, send index.html (optional if you want SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port", port);
});
