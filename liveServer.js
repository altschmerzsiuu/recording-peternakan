const express = require('express');
const { Client } = require('pg'); // PostgreSQL client
const app = express();
const port = 3002;
const cors = require('cors');


app.use(cors()); // Mengizinkan CORS untuk semua origin
app.use(express.json()); // Ini wajib ditambahkan - Middleware untuk meng-handle request body dalam format JSON
app.use(express.static('public')); // Mengonfigurasi untuk melayani file dari folder 'public'


// Koneksi ke PostgreSQL
const client = new Client({
    user: 'postgres',  // Ganti dengan username PostgreSQL Anda
    host: 'localhost',
    database: 'rfid_db',  // Ganti dengan nama database Anda
    password: 'postgres',  // Ganti dengan password PostgreSQL Anda
});
client.connect();

// Endpoint untuk mengambil jumlah ternak
app.get('/api/getLivestockCount', async (req, res) => {
    try {
      const result = await client.query('SELECT COUNT(*) FROM livestock_records');
      console.log(result);  // Debug untuk melihat hasil query
      const count = result.rows[0].count;
      res.json({ count });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching livestock count');
    }
});

// Endpoint untuk memperbarui status ternak
app.post('/api/updateLivestockStatus', async (req, res) => {
    try {
        const { livestockId, newStatus } = req.body; // Mengambil data dari body request

        // Debug: Periksa data yang diterima
        console.log('Request body:', req.body);

        // Lakukan update status ternak di database PostgreSQL
        const result = await client.query(
            'UPDATE livestock_records SET status = $1 WHERE id = $2 RETURNING *',
            [newStatus, livestockId]
        );
        
        if (result.rowCount > 0) {
            res.json({ message: 'Status ternak berhasil diperbarui!' });
        } else {
            console.log('Ternak tidak ditemukan dengan ID:', livestockId);
            res.status(404).json({ message: 'Ternak tidak ditemukan' });
        }
    } catch (err) {
        console.error('Error updating livestock status:', err); // Tambahkan log error
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui status ternak' });
    }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
