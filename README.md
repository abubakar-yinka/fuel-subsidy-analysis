# Fuel Subsidy Research Analysis — Full-Stack Web Application

Automated Chapter 4 statistical analysis for the study: **"Perceived Effects of Fuel Subsidy Removal on Healthcare Delivery Among Health Workers in Prince Audu Abubakar University Teaching Hospital, Anyigba."**

## Project Structure

```
├── backend/                  # FastAPI + Pandas analysis engine
│   ├── main.py               # API endpoint & orchestration
│   ├── requirements.txt      # Python dependencies
│   └── analysis/             # Modular analysis pipeline
│       ├── ingestion.py      # Data loading, non-respondent separation, NaN fill
│       ├── imputation.py     # Proportional stochastic imputation
│       ├── demographics.py   # Frequency tables (Section A)
│       ├── likert.py         # Weighted means & decisions (Section C)
│       ├── boolean_agg.py    # Multi-select coping strategies (Section D)
│       ├── inferential.py    # Chi-square / Fisher's Exact tests
│       └── report.py         # Multi-sheet Excel report generation
├── frontend/                 # Next.js 16 + Tailwind + Recharts dashboard
│   ├── src/app/
│   │   ├── page.tsx          # Main orchestrator
│   │   ├── layout.tsx        # Root layout with SEO
│   │   ├── globals.css       # Premium dark theme
│   │   └── components/       # Dashboard visualization components
│   └── next.config.ts        # API proxy configuration
└── README.md                 # This file
```

## Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open the Dashboard
Navigate to **http://localhost:3000** and upload your KoboToolbox `.xlsx` export.

---

## Deploying to Render

Render supports deploying both the Python backend and the Next.js frontend as separate services from a single monorepo. Here's how:

### Step 1: Push to GitHub

```bash
cd "/Users/yinka/Documents/MBBS/COMUI/Research/Projects/Perceived Effects of Fuel Subsidy Removal"
git init
git add .
git commit -m "Initial commit: fuel subsidy research analysis app"
```

Create a new repository on GitHub (e.g., `fuel-subsidy-analysis`) and push:

```bash
git remote add origin https://github.com/<your-username>/fuel-subsidy-analysis.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy the Backend (Web Service)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `fuel-subsidy-api` |
| **Root Directory** | `backend` |
| **Runtime** | Python |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free (or Starter for better performance) |

4. Under **Environment Variables**, add:
   - No special env vars needed for this app

5. Click **Deploy Web Service**
6. Note the deployed URL (e.g., `https://fuel-subsidy-api.onrender.com`)

---

### Step 3: Deploy the Frontend (Static Site or Web Service)

#### Option A: Web Service (Recommended — supports SSR & API proxy)

1. Go to Render → **New** → **Web Service**
2. Connect the same GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `fuel-subsidy-dashboard` |
| **Root Directory** | `frontend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | Free (or Starter) |

4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://fuel-subsidy-api.onrender.com` (your backend URL from Step 2)

5. Click **Deploy Web Service**

#### Option B: Static Site (Simpler, but no API proxy)

1. Go to Render → **New** → **Static Site**
2. Configure:

| Setting | Value |
|---|---|
| **Name** | `fuel-subsidy-dashboard` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `out` |

> ⚠️ Static sites can't use the Next.js rewrite proxy. You'll need to update the frontend to call the backend URL directly.

---

### Step 4: Update Frontend to Use Production API URL

Before deploying, update `next.config.ts` to use the Render backend URL in production:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

Also update the **CORS origins** in `backend/main.py` to include your Render frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://fuel-subsidy-dashboard.onrender.com",  # ← Add your Render domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Step 5: Verify Deployment

1. Visit your frontend URL (e.g., `https://fuel-subsidy-dashboard.onrender.com`)
2. Upload the KoboToolbox `.xlsx` file
3. Verify all dashboard sections render correctly
4. Download the Excel report and verify contents

---

### Render-Specific Notes

| Topic | Detail |
|---|---|
| **Cold Starts** | Free-tier Render services spin down after 15 minutes of inactivity. The first request after a cold start takes 30–60 seconds. |
| **File Uploads** | Render supports file uploads via `multipart/form-data`. The free tier has a 100MB request body limit. |
| **Persistent Storage** | Not needed — this app processes everything in-memory. |
| **Custom Domain** | Available on paid plans. Go to your service → Settings → Custom Domain. |
| **Environment Vars** | Set via Render Dashboard → Your Service → Environment. |

---

## Analysis Pipeline

The backend processes the uploaded KoboToolbox dataset through this pipeline:

1. **Ingestion** → Read Excel, drop metadata columns, separate non-consent rows (2), fill NaN in boolean columns with 0.0
2. **Imputation** → Proportional stochastic imputation for any remaining missing demographic values (seed=42)
3. **Demographics** → Frequency counts and percentages for 6 variables (Section A)
4. **Knowledge** → Frequency counts for 3 awareness items (Section B)
5. **Likert Analysis** → Map SA→4, A→3, D→2, SD→1; weighted means; decision flags at 2.5 threshold (Section C)
6. **Coping Strategies** → Aggregate boolean sub-columns for 12 strategies across 3 categories (Section D)
7. **Inferential Statistics** → 9 chi-square tests: 3 Knowledge×Cadre + 6 Binarized Likert×Cadre
8. **Report Generation** → 6-sheet Excel workbook (Demographics, Knowledge, Likert, Coping, Chi-Square, Summary)

## Tech Stack

- **Backend:** Python 3.10+, FastAPI, Pandas, NumPy, SciPy 1.15.2, Openpyxl
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Recharts, Axios
