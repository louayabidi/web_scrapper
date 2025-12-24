# AI Web Scraper Pro

A powerful, free, client-side web scraping tool built with **React** + **Vite** and **Tailwind CSS**.  
Extract product data (name, price, discount, category, images) from any e-commerce website (Jumia, SHEIN, Amazon, etc.) with intelligent cleaning, deduplication, and export to JSON/CSV.

> **Status:** In active development — full version with multi-page scraping, AI categorization, dynamic content support (Playwright backend), and better proxy rotation coming soon!

## Features (Current)

- Client-side scraping (no server required)
- Generalized extraction — works on any site with product links
- Smart price detection (handles $, €, £, Dhs, etc.)
- Clean name extraction (removes price/discount from titles)
- Basic category detection (shoes, clothing, appliances...)
- Search & filter results in beautiful dashboard view
- Export to JSON & CSV
- Dark/Light theme toggle
- Mobile-responsive design

## Demo

Live demo coming soon!  
Stay tuned — deployment on Vercel/Netlify in progress.


## Tech Stack

- React (Vite)
- Tailwind CSS
- Lucide Icons
- DOMParser for HTML parsing
- Proxy rotation for CORS bypass

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ai-web-scraper-pro.git

# Go to project directory
cd ai-web-scraper-pro

# Install dependencies
npm install

# Start development server
npm run dev
