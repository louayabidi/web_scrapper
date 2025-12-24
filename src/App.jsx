import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, FileJson, Table, Copy, Zap, Brain, Search } from 'lucide-react';

export default function AdvancedWebScraper() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('items');

  const scrape = async () => {
    if (!url) {
      setError('Enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      let allItems = [];
      let currentUrl = url;

      for (let page = 1; page <= 5; page++) { // Safety limit: 5 pages max
        let html = '';
        try {
          const res = await fetch(currentUrl);
          if (res.ok) html = await res.text();
        } catch {}

        if (!html) {
          const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(currentUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(currentUrl)}`,
          ];
          for (const p of proxies) {
            try {
              const res = await fetch(p);
              if (res.ok) {
                html = await res.text();
                break;
              }
            } catch {}
          }
        }

        if (!html) break;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract ALL links with text
        const links = Array.from(doc.querySelectorAll('a[href]'))
          .map(a => ({ text: a.textContent.trim(), href: a.href }))
          .filter(l => l.text && l.text.length > 5);

        // Extract items with prices
        const pageItems = links.map(l => {
          // Generalized price detection
          const priceMatch = l.text.match(/(\d{1,3}(?:[.,]\d{3})*(?:\.\d{1,2})?)\s*([$€£¥A-Za-z]*)/i);
          if (!priceMatch) return null;

          return {
            name: l.text.replace(/\d+[.,]?\d*\s*[$€£¥A-Za-z]+.*/g, '').trim(),
            price: parseFloat(priceMatch[1].replace(/,/g, '')),
            currency: priceMatch[2] || 'Unknown',
            url: l.href.startsWith('http') ? l.href : new URL(l.href, currentUrl).href,
          };
        }).filter(i => i && i.name && i.price);

        allItems = [...allItems, ...pageItems];

        // Find next page link
        const nextBtn = Array.from(doc.querySelectorAll('a'))
          .find(a => 
            a.textContent.toLowerCase().includes('next') || 
            a.getAttribute('aria-label')?.toLowerCase().includes('next') ||
            a.href?.includes('page=') || a.href?.includes('pg=')
          );

        currentUrl = nextBtn ? new URL(nextBtn.href, currentUrl).href : null;
        if (!currentUrl) break;
      }

      setData({ items: allItems, total: allItems.length });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data?.items?.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.price?.toString().includes(search)
  ) || [];

  const exportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scraped-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!data?.items?.length) return;
    let csv = 'name,price,currency,url\n';
    data.items.forEach(i => {
      csv += `"${i.name.replace(/"/g, '""')}","${i.price || ''}","${i.currency || ''}","${i.url}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scraped-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h1 className="text-4xl font-bold mb-2">Universal Web Scraper</h1>
          <p className="text-gray-400">Works on SHEIN, Jumia, Amazon, any site</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 mb-6">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.shein.com/Men-c-2026.html..."
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
          />
          <button
            onClick={scrape}
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {loading ? 'Scraping all pages...' : 'Scrape All'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                {data.total} Items Found
              </h2>
              <div className="flex gap-3">
                <button onClick={exportJSON} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <FileJson size={18} /> JSON
                </button>
                <button onClick={exportCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2">
                  <Table size={18} /> CSV
                </button>
                <button onClick={() => navigator.clipboard.writeText(JSON.stringify(data))} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
                  <Copy size={18} /> Copy
                </button>
              </div>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or price..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.length > 0 ? (
                filtered.map((item, i) => (
                  <div key={i} className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 hover:border-purple-500 transition-all">
                    <h3 className="font-bold mb-3 text-lg line-clamp-2">{item.name}</h3>
                    <p className="text-xl font-semibold text-green-400 mb-2">
                      {item.price} {item.currency || 'Unknown'}
                    </p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline text-sm block truncate">
                      {item.url.slice(0, 60)}...
                    </a>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-400 py-10">No items match your search</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}