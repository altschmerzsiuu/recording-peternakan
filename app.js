const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Konfigurasi database PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rfid_db',
  password: 'postgres',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint untuk menerima UID dari RFID (menyimpan data)
app.post('/rfid', async (req, res) => {
    const { rfid_code, nama, info_tambahan } = req.body;

    // Validasi input
    if (!rfid_code || !nama) {
        return res.status(400).json({ message: 'RFID code dan nama wajib diisi!' });
    }

    try {
        // Cek apakah RFID sudah ada di database
        const checkQuery = 'SELECT * FROM livestock_records WHERE rfid_code = $1';
        const checkResult = await pool.query(checkQuery, [rfid_code]);

        if (checkResult.rowCount > 0) {
            return res.status(400).json({ message: 'RFID sudah ada di database!' });
        }

        // Ambil ID maksimum saat ini
        const maxIdQuery = 'SELECT MAX(id) AS max_id FROM livestock_records;';
        const maxIdResult = await pool.query(maxIdQuery);
        const nextId = (maxIdResult.rows[0].max_id || 0) + 1;

        // Sisipkan data baru dengan ID yang berurutan
        const query = `
            INSERT INTO livestock_records (id, rfid_code, nama, info_tambahan)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [nextId, rfid_code, nama, info_tambahan];
        const result = await pool.query(query, values);

        // Respon jika berhasil
        res.status(201).json({
            message: 'Data berhasil disimpan!',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error saat menyimpan data:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// Endpoint untuk membaca daftar ternak (Read)
app.get('/livestock', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM livestock_records');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data.' });
    }
});

// Endpoint untuk mencari ternak berdasarkan RFID
app.get('/livestock/:rfidCode', async (req, res) => {
    const { rfidCode } = req.params;
    try {
        const result = await pool.query('SELECT * FROM livestock_records WHERE rfid_code = $1', [rfidCode]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ternak tidak ditemukan!' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data.' });
    }
});


// Endpoint untuk menghapus ternak berdasarkan ID (Delete)
app.delete('/livestock/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM livestock_records WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ternak tidak ditemukan!' });
        }
        res.status(200).json({ message: 'Ternak berhasil dihapus!' });
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus data.' });
    }
});

// Endpoint untuk memperbarui data ternak berdasarkan ID (Update)
app.put('/livestock/:id', async (req, res) => {
    const { id } = req.params;
    const { rfid_code, nama, info_tambahan } = req.body;
  
    if (!rfid_code || !nama) {
        return res.status(400).json({ message: 'RFID code dan nama wajib diisi!' });
    }
  
    try {
        const result = await pool.query(
            'UPDATE livestock_records SET rfid_code = $1, nama = $2, info_tambahan = $3 WHERE id = $4 RETURNING *',
            [rfid_code, nama, info_tambahan, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ternak tidak ditemukan!' });
        }
        res.status(200).json({
            message: 'Data ternak berhasil diperbarui!',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data.' });
    }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});