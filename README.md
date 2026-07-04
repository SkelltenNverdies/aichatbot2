# Qwen Chat - AI Assistant

Website AI chat modern dengan fitur multimodal (teks, gambar, dokumen) yang di-deploy ke Vercel.

## PENTING: Ganti API Key!

API key lama sudah bocor. Buat yang baru di Alibaba Cloud Model Studio.

## Quick Start

### Local Development
1. Install dependencies: npm install
2. Copy .env.example ke .env.local
3. Edit .env.local dengan API key Anda
4. Jalankan: npx vercel dev
5. Buka http://localhost:3000

### Deploy ke Vercel (Via GitHub)
1. Push project ini ke GitHub
2. Buka vercel.com/new
3. Import repository
4. Tambahkan Environment Variables:
   - QWEN_API_KEY = (API key baru Anda)
   - BASE_URL = https://848921.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1
5. Klik Deploy!

### Deploy ke Vercel (Via CLI)
1. Install: npm i -g vercel
2. Jalankan: vercel
3. Tambah env: vercel env add QWEN_API_KEY
4. Tambah env: vercel env add BASE_URL
5. Deploy prod: vercel --prod

## Struktur Folder
- public/        = Frontend (HTML, CSS, JS)
- api/chat.js    = Serverless function (proxy ke Qwen API)
- vercel.json    = Konfigurasi Vercel
- package.json   = Dependencies

## Fitur
- UI modern mirip chat.qwen.ai
- Upload gambar (analisis dengan Qwen-VL)
- Upload dokumen (TXT, MD, CODE, CSV, JSON, dll)
- Maksimal 5 file per pesan
- Riwayat chat tersimpan di localStorage
- Pilihan model (VL Max, VL Plus, Max, Plus, Turbo)
- Syntax highlighting untuk code blocks
- Responsive mobile
- Markdown rendering (bold, italic, code)
- Typing indicator

## Environment Variables
- QWEN_API_KEY: API key dari Alibaba Cloud
- BASE_URL: Endpoint API Anda

## Batasan Vercel Hobby Tier
- Max file upload: 4.5 MB
- Function timeout: 10-30 detik
- Jika butuh lebih, upgrade ke Vercel Pro
