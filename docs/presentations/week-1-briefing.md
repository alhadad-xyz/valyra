# Week 1 Kickoff Briefing: Project Valyra

---

## Slide 1: Introduction
**Title:** Project Valyra: Autonomous M&A Agent Marketplace  
**Subtitle:** Kickoff Week 1 - Hackathon Sprint  
**Visual:** Logo Valyra & Hackathon Banner

### Narasi (Bahasa Indonesia)
> "Selamat pagi tim. Selamat datang di minggu pertama Sprint Hackathon kita untuk Project Valyra.
>
> Valyra adalah sebuah marketplace otonom untuk Merger & Akuisisi (M&A) yang didukung oleh AI Agents. Tujuan kita dalam 5 minggu ini adalah membangun platform di mana AI Agents dapat melakukan valuasi, negosiasi, dan eksekusi pembelian bisnis secara on-chain.
> 
> Minggu ini adalah minggu fondasi. Kita akan menyiapkan semua infrastruktur dasar agar kita bisa bergerak cepat di minggu-minggu berikutnya. Mari kita lihat peran masing-masing dan apa yang harus diselesaikan minggu ini."

---

## Slide 2: Team Roles & Structure
**Title:** Team Roles & Responsibilities  
**Visual:** Organization Chart / Role Table

*   **Smart Contract Engineer:** Solidity, Foundry, Base Mainnet.
*   **Frontend & Product:** Next.js, Design System, Mobile-first.
*   **Backend & DevOps:** Python/FastAPI, AI Agents, Infrastructure.

### Narasi (Bahasa Indonesia)
> "Kita memiliki struktur tim yang jelas untuk memastikan efisiensi.
>
> **Smart Contract Engineer** akan fokus pada keamanan dan logika on-chain menggunakan Foundry. Targetnya adalah deployment di Base Mainnet.
>
> **Frontend & Product Engineer** bertanggung jawab atas pengalaman pengguna, membangun dApp yang mobile-first dengan Next.js, dan memastikan Design System yang konsisten.
>
> **Backend & DevOps Engineer** akan menangani logika 'off-chain', API untuk AI Agents, dan infrastruktur database.
>
> Ingat, kita menggunakan Monorepo. Kunci keberhasilan kita adalah komunikasi yang lancar antar role ini, terutama saat *sync* ABI dan API."

---

## Slide 3: Technical Architecture Brief
**Title:** Architecture & Monorepo Workflow  
**Visual:** Diagram Monorepo (Contracts -> Sync Script -> Web/Backend)

*   **Repo:** Single Git Repository (Monorepo).
*   **Sync:** `sync-abis.sh` script is critical.
*   **Stack:** Base (L2), Next.js, FastAPI, AgentKit.

### Narasi (Bahasa Indonesia)
> "Sedikit teknis mengenai cara kerja kita. Kita menggunakan Monorepo untuk menghindari 'neraka versi'.
>
> Hal yang paling kritis adalah **Sinkronisasi ABI**. Setiap kali Smart Contract di-update, engineer harus menjalankan script `sync-abis.sh`. Ini akan otomatis menyalin ABI terbaru ke frontend dan backend.
>
> Jangan pernah push kode frontend yang menggunakan kontrak baru tanpa ABI yang sudah di-sync. Ini akan mencegah aplikasi kita *break* saat testing."

---

## Slide 4: Week 1 Sprint Backlog - Smart Contract
**Title:** Role: Smart Contract Engineer - Week 1 Goals
**Focus:** Foundation & Marketplace Skeleton

*   **Key Tasks:**
    *   Set up Foundry & Base Sepolia (#3, #4)
    *   Implement `MarketplaceV1` skeleton (#5)
    *   Create `createListing()` function (#6)
    *   Seller Stake logic (#7) & Genesis Seller events (#8)

### Narasi (Bahasa Indonesia)
> "Masuk ke Sprint Backlog Minggu ke-1.
>
> Untuk **Smart Contract**, fokus utama adalah Skeleton Marketplace. Kita butuh fungsi dasar `createListing` agar user bisa mulai membuat listing bisnis.
>
> Selain itu, fitur unik kita, 'Genesis Seller Staking', harus mulai dikerjakan logikanya. Pastikan environment Foundry sudah siap dan terkoneksi ke Base Sepolia. Events juga sangat penting untuk diemit agar Backend bisa mulai indexing data."

---

## Slide 5: Week 1 Sprint Backlog - Frontend
**Title:** Role: Frontend - Week 1 Goals
**Focus:** Design System & Setup

*   **Key Tasks:**
    *   Create Figma Project: "Valyra Design System" (#36)
    *   Set up Design Tokens (Tailwind/CSS) (#37)
    *   Initial Next.js Setup & Scaffold

### Narasi (Bahasa Indonesia)
> "Untuk **Frontend**, minggu ini adalah tentang visual dan standar.
>
> Tugas utamanya adalah menyelesaikan Figma untuk Design System. Kita tidak ingin desain yang 'belang-belang'. Tentukan warna, tipografi, dan komponen dasar sekarang.
>
> Setelah Figma siap, terjemahkan langsung ke dalam kode sebagai Design Tokens. Ini akan mempercepat development UI di minggu ke-2 dan ke-3."

---

## Slide 6: Week 1 Sprint Backlog - Backend
**Title:** Role: Backend - Week 1 Goals
**Focus:** Database & Infrastructure

*   **Key Tasks:**
    *   Design Schema: `listings`, `offers`, `escrows`, `users` (#76)
    *   Setup Arweave Wallet & IPFS Gateway (#75)
    *   Create Alembic Migrations (#77)
    *   Implement Row Level Security (RLS) policies (#78)

### Narasi (Bahasa Indonesia)
> "Terakhir, untuk **Backend**. Minggu ini kita harus mengunci skema database.
>
> Tabel `listings`, `offers`, dan `escrows` harus didesain dengan matang untuk mendukung fitur on-chain nantinya.
>
> Jangan lupa setup infrastruktur pendukung seperti Arweave untuk penyimpanan file terdesentralisasi. Dan yang krusial, Row Level Security (RLS) harus diterapkan sejak awal untuk keamanan data user. Migrasi database harus rapi menggunakan Alembic."

---

## Slide 7: Closing & Next Steps
**Title:** Let's Build!
**Visual:** Rocket Launch

*   **Action Items:**
    *   Check your assigned issues on GitHub.
    *   Join the daily standup.
    *   Sync strictly in the Monorepo.

### Narasi (Bahasa Indonesia)
> "Oke, itu saja untuk briefing minggu ini.
>
> Silakan cek GitHub Issues masing-masing, pindahkan status ke 'In Progress' jika sudah mulai mengerjakan. Jangan lupa Daily Standup setiap jam 9 pagi.
>
> Mari kita bangun Valyra dan menangkan Hackathon ini. Selamat bekerja!"
