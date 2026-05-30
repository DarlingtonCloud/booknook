const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../db');

// GET all books
router.get('/', async (req, res) => {
  const pool = await getPool();
  const result = await pool.request().query("SELECT * FROM Books");
  res.json(result.recordset);
});

// ADD book
router.post('/', async (req, res) => {
  const { title, author } = req.body;

  const pool = await getPool();
  const result = await pool.request()
    .input('title', sql.NVarChar, title)
    .input('author', sql.NVarChar, author)
    .query(`
      INSERT INTO Books (Title, Author, Status)
      OUTPUT INSERTED.*
      VALUES (@title, @author, 'To Read')
    `);

  res.status(201).json(result.recordset[0]);
});

// GET one book
router.get('/:id', async (req, res) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('id', sql.Int, req.params.id)
    .query("SELECT * FROM Books WHERE Id = @id");

  if (!result.recordset.length) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(result.recordset[0]);
});

// UPDATE book
router.put('/:id', async (req, res) => {
  const { title, author, status } = req.body;

  const pool = await getPool();

  const result = await pool.request()
    .input('id', sql.Int, req.params.id)
    .input('title', sql.NVarChar, title)
    .input('author', sql.NVarChar, author)
    .input('status', sql.NVarChar, status)
    .query(`
      UPDATE Books
      SET Title=@title, Author=@author, Status=@status
      OUTPUT INSERTED.*
      WHERE Id=@id
    `);

  res.json(result.recordset[0]);
});

// DELETE book
router.delete('/:id', async (req, res) => {
  const pool = await getPool();

  await pool.request()
    .input('id', sql.Int, req.params.id)
    .query("DELETE FROM Books WHERE Id=@id");

  res.status(204).send();
});

module.exports = router;