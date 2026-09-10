const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// O Railway injeta a variável DATABASE_URL automaticamente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


pool.query(`
  CREATE TABLE IF NOT EXISTS sementes (
    semente_id INTEGER PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error('Erro ao criar tabela', err));

app.get('/api/sementes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sementes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

app.post('/api/sementes', async (req, res) => {
  const { semente_id, nome, cargo, telefone } = req.body;
  try {
    await pool.query(
      'INSERT INTO sementes (semente_id, nome, cargo, telefone) VALUES ($1, $2, $3, $4)',
      [semente_id, nome, cargo, telefone]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === '23505') { 
      res.status(409).json({ error: 'Semente já apadrinhada.' });
    } else {
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));