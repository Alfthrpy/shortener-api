# Menggunakan image dasar Node.js
FROM node:18

# Mengatur direktori kerja di dalam container
WORKDIR /app

# Menyalin semua file aplikasi ke dalam container
COPY . .

# Menginstal semua dependensi
RUN npm install

# Mengatur variabel lingkungan (isi dengan .env)

# Mengekspos port yang digunakan aplikasi
EXPOSE 8080

# Menjalankan aplikasi
CMD ["npm", "run", "start"]
