

# URL Shortener API

## Deskripsi
API ini menyediakan layanan untuk mempersingkat URL dan melacak statistik pengunjungnya. API ini memungkinkan pengguna untuk membuat, membaca, memperbarui, dan menghapus link pendek, serta mendapatkan statistik klik berdasarkan waktu tertentu. Data pengguna, link, dan statistik disimpan di database MongoDB menggunakan Mongoose.

## Fitur
### 1. User Management
- **Get All Users**: Mengambil semua data pengguna.
- **Get User by ID**: Mengambil data pengguna berdasarkan ID.
- **Create User**: Menambahkan pengguna baru.
- **Update User by ID**: Memperbarui data pengguna.
- **Delete User by ID**: Menghapus data pengguna berdasarkan ID.

### 2. Link Management
- **Create a New Short Link**: Membuat link pendek yang mengarahkan ke URL asli.
- **Get Link by ID**: Mengambil detail link berdasarkan ID.
- **Update Link by ID**: Memperbarui URL asli link yang sudah ada.
- **Delete Link by ID**: Menghapus link berdasarkan ID.

### 3. Link Redirection
- **Redirect Short Link**: Mengarahkan pengguna ke URL asli berdasarkan short ID.

### 4. Link Statistics
- **Get Link Stats**: Menampilkan jumlah klik pada link tertentu, dengan rincian harian, mingguan, dan bulanan.

## Teknologi
- **Node.js**: Platform server-side JavaScript.
- **Express.js**: Framework untuk membangun REST API.
- **MongoDB**: Database NoSQL untuk menyimpan data pengguna, link, dan statistik.
- **Mongoose**: Library ODM untuk menghubungkan Node.js dengan MongoDB.

## Setup dan Instalasi
1. **Clone repository**:
   ```bash
   git clone <URL_REPO>
   cd <NAMA_FOLDER>
   ```

2. **Instalasi dependensi**:
   ```bash
   npm install
   ```

3. **Setup konfigurasi**:
   Buat file `.env` di root proyek dan tambahkan variabel berikut:
   ```env
   MONGO_URI=<URL_MONGODB>
   PORT=3000
   ```

   Pastikan `<URL_MONGODB>` adalah koneksi string MongoDB Anda.

4. **Jalankan server**:
   ```bash
   npm start
   ```

## Penggunaan API
### Endpoints
#### 1. User Endpoints
- **GET /api/users**: Mengambil semua pengguna.
- **GET /api/users/:id**: Mengambil pengguna berdasarkan ID.
- **POST /api/users**: Membuat pengguna baru.
- **PUT /api/users/:id**: Memperbarui data pengguna berdasarkan ID.
- **DELETE /api/users/:id**: Menghapus pengguna berdasarkan ID.

#### 2. Link Endpoints
- **POST /api/shortener**: Membuat link pendek baru.
- **GET /api/shortener/:id**: Mengambil informasi link berdasarkan ID.
- **PUT /api/shortener/:id**: Memperbarui URL asli link berdasarkan ID.
- **DELETE /api/shortener/:id**: Menghapus link berdasarkan ID.

#### 3. Redirection Endpoint
- **GET /:shortId**: Mengarahkan pengguna ke URL asli berdasarkan `shortId`.

#### 4. Link Statistics Endpoints
- **GET /api/shortener/:id/stats**: Mengambil statistik klik pada link, termasuk data total, harian, mingguan, dan bulanan.

## Contoh Request dan Response
**POST /api/shortener**
```json
{
  "userId": "60c72b2f5f1b2c001c4a3e83",
  "originalUrl": "https://www.example.com"
}
```

**Response**
```json
{
  "message": "Short link created successfully",
  "link": {
    "id": "60d5f7c3f1b2c001c4a3e84",
    "originalUrl": "https://www.example.com",
    "shortUrl": "http://localhost:3000/60d5f7c3"
  }
}
```

## Penggunaan dan Pengelolaan Database
API ini menggunakan MongoDB untuk menyimpan data. Pastikan Anda memiliki koneksi MongoDB yang aktif, apakah itu lokal atau menggunakan layanan cloud seperti MongoDB Atlas.

## Keamanan
- Validasi input dilakukan di server untuk mencegah data tidak valid.
- Pastikan untuk menggunakan autentikasi dan otorisasi di endpoints yang memerlukan akses pengguna.

