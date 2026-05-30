const express = require("express");
require("dotenv").config();

const sql = require("mssql");
const multer = require("multer");

const bookRoutes = require("./routes/books");
// const { uploadImage } = require("./blob");
const { getPool } = require("./db");

const app = express();

app.use(express.json());

// Multer setup (MUST be before routes that use it)
const upload = multer({ storage: multer.memoryStorage() });

// routes
app.use("/api/books", bookRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "BookNook API is running"
  });
});

// -----------------------------
// COVER UPLOAD ROUTE
// -----------------------------
app.post("/api/books/:id/cover", upload.single("cover"), async (req, res) => {
  try {
    const file = req.file;
    const bookId = req.params.id;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Only image files allowed" });
    }

    const ext = file.originalname.split(".").pop();
    const fileName = `book-${bookId}-${Date.now()}.${ext}`;

    const imageUrl = await uploadImage(
      file.buffer,
      fileName,
      file.mimetype
    );

    const pool = await getPool();

    await pool.request()
      .input("id", sql.Int, bookId)
      .input("coverUrl", sql.NVarChar, imageUrl)
      .query("UPDATE Books SET CoverUrl=@coverUrl WHERE Id=@id");

    res.json({
      message: "Cover uploaded successfully",
      imageUrl
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// -----------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const { uploadImage } = require("./blob");