# AutoApex — Automotive Parts & Accessories E-Commerce Platform

A production-grade, full-stack automotive e-commerce platform built with React 19, TypeScript, Tailwind CSS, Express, and Vite. Features vehicle fitment filtering, real-time shipment tracking, GST-compliant PDF invoice downloads, intelligent AI recommendations, and an administrative control panel.

---

## 🚀 Quick Deployment Guide

### Step 1: Upload to GitHub

1. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name your repository (e.g., `autoapex-ecommerce`)
   - Choose **Public** or **Private**
   - **Do NOT** initialize with a README, .gitignore, or license (these are already configured in this repo)
   - Click **Create repository**

2. **Connect and push your code**:
   Open your terminal in this project directory and run:
   ```bash
   # Add your GitHub repository as the origin remote
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/autoapex-ecommerce.git

   # Push the main branch
   git push -u origin main
   ```

*(Tip: If you use the GitHub CLI, you can simply run `gh repo create autoapex-ecommerce --public --source=. --remote=origin --push`)*

---

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** → **Project**.
3. Import your newly created GitHub repository (`autoapex-ecommerce`).
4. **Project Settings** on Vercel will automatically detect the configuration from `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables** (Optional):
   - Add `JWT_SECRET` (e.g., any secure random string)
   - Add any Gemini / API keys if needed
6. Click **Deploy**.

Your app and serverless API endpoints will be live with full routing and SSL!

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start the full-stack development server (Express + Vite)
npm run dev

# Build for production
npm run build

# Type check
npm run lint
```

Server runs on `http://localhost:3000`.

---

## 📦 Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Backend / API**: Express.js, JWT, bcryptjs, Vercel Serverless (`/api`)
- **PDF Generation**: jsPDF (GST invoices, itemized tax breakdowns, automated pagination)
- **Deployment**: Vercel & GitHub Actions ready
