const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { Client } = require('pg'); // PostgreSQL client

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Konfigurasi Serial Port
const port = new SerialPort({
  path: 'COM4', // Sesuaikan dengan port yang benar
  baudRate: 9600,
});
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Inisialisasi PostgreSQL client
const client = new Client({
  user: 'postgres',  // Ganti dengan username PostgreSQL Anda
  host: 'localhost',
  database: 'rfid_db',  // Ganti dengan nama database Anda
  password: 'postgres',  // Ganti dengan password PostgreSQL Anda
  port: 5432, // Port default PostgreSQL
});
client.connect()
  .then(() => console.log('Connected to PostgreSQL database.'))
  .catch((err) => console.error('Error connecting to PostgreSQL:', err));

// Fungsi untuk menghilangkan spasi dan karakter yang tidak perlu dari UID RFID
function formatRfidId(id) {
  return id.replace(/\s+/g, '').toUpperCase(); // Hapus spasi dan pastikan huruf besar
}

// Endpoint untuk menerima data dari RFID dan mengirimkan informasi hewan
app.post('/scan', async (req, res) => {
  const { rfid } = req.body;
  console.log(`RFID data received: ${rfid}`);

  // Format RFID yang diterima
  const formattedRfid = formatRfidId(rfid);

  try {
    // Query untuk mendapatkan informasi hewan berdasarkan RFID
    const result = await client.query('SELECT * FROM livestock_records WHERE rfid_code = $1', [formattedRfid]);

    if (result.rows.length > 0) {
      // Jika ditemukan, kirim data hewan
      res.status(200).send({ message: 'RFID data received successfully!', animal: result.rows[0] });
    } else {
      res.status(404).send({ message: 'RFID not found in the database.' });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).send({ message: 'Internal server error.' });
  }
});

// Endpoint untuk mendapatkan data RFID yang terakhir dibaca
let rfidData = ''; // Variabel untuk menyimpan RFID yang terakhir dibaca

app.get('/get-rfid', (req, res) => {
  res.json({ rfid: rfidData }); // Kirimkan data RFID yang terakhir dibaca
});

// Baca data dari Arduino via Serial Port
parser.on('data', async (data) => {
  let rfid = data.replace('RFID Tag UID:', '').trim(); // Hapus label dan spasi ekstra
  console.log(`RFID UID: ${rfid}`);

  // Format UID RFID yang diterima
  rfid = formatRfidId(rfid);
  rfidData = rfid; // Simpan UID terakhir untuk endpoint

  try {
    // Cek apakah RFID sudah ada di database untuk menghindari duplikasi
    const existing = await client.query('SELECT * FROM livestock_records WHERE rfid_code = $1', [rfid]);
    if (existing.rows.length === 0) {
      await client.query('INSERT INTO livestock_records (rfid_code) VALUES ($1)', [rfid]);
      console.log('RFID saved to database:', rfid);
    } else {
      console.log('RFID already exists in database:', rfid);
    }
  } catch (error) {
    console.error('Error saving RFID to database:', error);
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
