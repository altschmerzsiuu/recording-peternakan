// // Mengambil elemen dari HTML
// const addForm = document.getElementById('add-form');
// const rfidCodeInput = document.getElementById('rfid_code');
// const namaInput = document.getElementById('nama');
// const infoTambahanInput = document.getElementById('info_tambahan');
// const livestockList = document.getElementById('livestock-list');

// // Fungsi untuk menambah ternak
// addForm.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const rfid_code = rfidCodeInput.value;
//     const nama = namaInput.value;
//     const info_tambahan = infoTambahanInput.value;

//     console.log('Data yang dikirim:', { rfid_code, nama, info_tambahan }); // Log input untuk debugging

//     const response = await fetch('http://localhost:3000/rfid', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ rfid_code, nama, info_tambahan }),
//     });

//     const data = await response.json();
//     if (response.ok) {
//         alert('Ternak berhasil ditambahkan!');
//         fetchLivestock(); // Memuat ulang daftar ternak
//     } else {
//         alert('Gagal menambahkan ternak: ' + data.message);
//     }
// });

// // Fungsi untuk menampilkan daftar ternak
// async function fetchLivestock() {
//     const response = await fetch('http://localhost:3000/livestock');
//     const data = await response.json();

//     console.log('Data ternak yang diterima:', data); // Tambahkan log ini untuk memeriksa data yang diterima

//     livestockList.innerHTML = ''; // Clear daftar ternak
//     if (data.length === 0) {
//         livestockList.innerHTML = '<li>Tidak ada data ternak.</li>';
//     } else {
//         data.forEach(item => {
//             const li = document.createElement('li');
//             li.innerHTML = `
//                 <strong>${item.nama}</strong> (RFID: ${item.rfid_code})<br>
//                 Info: ${item.info_tambahan || 'Tidak ada info tambahan'}<br>
//                 <button onclick="deleteLivestock(${item.id})">Hapus</button>
//             `;
//             livestockList.appendChild(li);
//         });
//     }
// }

// // Fungsi untuk menghapus ternak
// async function deleteLivestock(id) {
//     const response = await fetch(`http://localhost:3000/livestock/${id}`, {
//         method: 'DELETE',
//     });
//     const data = await response.json();
//     if (response.ok) {
//         alert('Ternak berhasil dihapus!');
//         fetchLivestock(); // Memuat ulang daftar ternak
//     } else {
//         alert('Gagal menghapus ternak: ' + data.message);
//     }
// }

// // Muat daftar ternak saat pertama kali halaman dibuka
// fetchLivestock();


// Mengambil elemen dari HTML
const addForm = document.getElementById('add-form');
const rfidCodeInput = document.getElementById('rfid_code');
const namaInput = document.getElementById('nama');
const infoTambahanInput = document.getElementById('info_tambahan');
const livestockList = document.getElementById('livestock-list');
const rfidSearchInput = document.getElementById('rfid_search_input'); // input untuk pencarian RFID
const searchButton = document.getElementById('search_button'); // tombol untuk pencarian
const infoDiv = document.getElementById('livestock-info'); // Div untuk menampilkan info ternak

// Fungsi untuk menambah ternak
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rfid_code = rfidCodeInput.value;
    const nama = namaInput.value;
    const info_tambahan = infoTambahanInput.value;

    console.log('Data yang dikirim:', { rfid_code, nama, info_tambahan }); // Log input untuk debugging

    const response = await fetch('http://localhost:3000/rfid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rfid_code, nama, info_tambahan }),
    });

    const data = await response.json();
    if (response.ok) {
        alert('Ternak berhasil ditambahkan!');
        fetchLivestock(); // Memuat ulang daftar ternak
    } else {
        alert('Gagal menambahkan ternak: ' + data.message);
    }
});

// Fungsi untuk menampilkan daftar ternak
async function fetchLivestock() {
    const response = await fetch('http://localhost:3000/livestock');
    const data = await response.json();

    console.log('Data ternak yang diterima:', data); // Tambahkan log ini untuk memeriksa data yang diterima

    livestockList.innerHTML = ''; // Clear daftar ternak
    if (data.length === 0) {
        livestockList.innerHTML = '<li>Tidak ada data ternak.</li>';
    } else {
        data.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${item.nama}</strong> (RFID: ${item.rfid_code})<br>
                Info: ${item.info_tambahan || 'Tidak ada info tambahan'}<br>
                <button onclick="deleteLivestock(${item.id})">Hapus</button>
            `;
            livestockList.appendChild(li);
        });
    }
}

// Fungsi untuk menghapus ternak
async function deleteLivestock(id) {
    const response = await fetch(`http://localhost:3000/livestock/${id}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    if (response.ok) {
        alert('Ternak berhasil dihapus!');
        fetchLivestock(); // Memuat ulang daftar ternak
    } else {
        alert('Gagal menghapus ternak: ' + data.message);
    }
}

// Fungsi untuk mencari ternak berdasarkan RFID ID
async function fetchLivestockByRFID(rfidCode) {
    const response = await fetch(`http://localhost:3000/livestock/${rfidCode}`);
    
    // Menambahkan pengecekan status response
    if (!response.ok) {
        infoDiv.innerHTML = 'Gagal mengambil data dari server.';
        return;
    }
    
    const data = await response.json();

    // Mengecek apakah data yang diterima valid
    if (data && data.rfid_code) {
        infoDiv.innerHTML = `
            <strong>Nama: ${data.nama}</strong><br>
            RFID: ${data.rfid_code}<br>
            Info: ${data.info_tambahan || 'Tidak ada info tambahan'}
        `;
    } else {
        infoDiv.innerHTML = 'Ternak tidak ditemukan.';
    }
}

// Event listener untuk tombol pencarian RFID
searchButton.addEventListener('click', () => {
    const rfidCode = rfidSearchInput.value.trim(); // Pastikan RFID ID tidak kosong atau hanya spasi
    if (rfidCode) {
        fetchLivestockByRFID(rfidCode);
    } else {
        alert('Masukkan RFID ID untuk mencari data.');
    }
});

// Muat daftar ternak saat pertama kali halaman dibuka
fetchLivestock();
