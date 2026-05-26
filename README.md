# go/ | luqmannor.com URL Shortener

A premium, glassmorphic URL Shortener application built with React, TypeScript, Tailwind CSS v4, and Framer Motion, deployed on the Cloudflare Edge network using Workers and KV Storage.

## 🌎 Live Links

* **Production URL:** [https://go.luqmannor.com](https://go.luqmannor.com)
* **Pages Mirror:** [https://url-shortener-8uj.pages.dev](https://url-shortener-8uj.pages.dev)
* **Worker API:** [https://url-shortener.hakimnoralahyadi.workers.dev](https://url-shortener.hakimnoralahyadi.workers.dev)

---

## 🔑 Access Control Notice

To shorten links, an admin password is required to authenticate write operations. If you would like access to this tool, please email the administrator to request the password:

📬 **Email:** [hakimnoralahyadi@gmail.com](mailto:hakimnoralahyadi@gmail.com)

---

## ⚡ Architecture Overview

1. **Vite Single-File Frontend:** The React UI compiles into a single self-contained HTML page (with inlined CSS and JS bundles) to ensure it can be served efficiently by the Worker at the root path `/`.
2. **CDN Edge-Level Redirects:** Requests matching `go.luqmannor.com/slug` are intercepted at the Cloudflare Edge network and instantly redirected (`302 Found`) using the Worker's connection to KV namespaces, avoiding any page load flash.
3. **KV Metadata & Stats:** Each shortened link maintains click tracking and creation timestamps saved directly in Cloudflare KV storage.

---

## 💻 Development & Deployment

### 1. Build the Frontend
Compile and package the React site assets into a single inlined HTML file:
```bash
npm run build --prefix site
```

### 2. Inline HTML into Worker
Run the compiler script in the root directory to Base64 encode the HTML bundle and inject it into `worker/index.js` as the `ADMIN_HTML_B64` variable:
```bash
node build-worker.js
```

### 3. Deploy to Cloudflare Workers
Deploy the updated worker script with the routes configuration to Cloudflare:
```bash
npx wrangler deploy --cwd worker
```
