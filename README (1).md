# World Happiness Index 2015 — DSC327 Terminal Project

An interactive web-based data visualization dashboard built with **D3.js v7**, exploring the World Happiness Report 2015 dataset (158 countries).

## Project Structure

```
happiness-viz/
├── index.html       ← Main dashboard page
├── style.css        ← Styles (dark theme, responsive layout)
├── main.js          ← All D3.js visualization code
├── data/
│   └── 2015.csv     ← World Happiness Report 2015 dataset
└── README.md
```

## Visualizations

| Chart | Type | Interaction |
|---|---|---|
| Top 20 Happiest Countries | Horizontal Bar Chart | Hover tooltips, animated entry |
| Happiness vs Factor | Scatter Plot + Trend Line | Dynamic X-axis (dropdown), hover tooltips |
| What Drives Happiness? | Donut Chart | Hover to expand slice + see % share |
| Happiness by Region | Strip Plot | Hover tooltips, median line per region |

## Interactions

- **Region filter** — filter all charts to one world region
- **Factor dropdown** — change the scatter plot's X-axis (GDP, Family, Health, Freedom, Trust, Generosity)
- **Hover tooltips** — every dot/bar shows country name, rank, score, and factor value

## How to Run Locally

> You need a local server because D3 loads the CSV with `fetch`. Opening `index.html` directly will give a CORS error.

### Option A — VS Code Live Server (recommended)
1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

### Option B — Python
```bash
cd happiness-viz
python -m http.server 8000
# Open http://localhost:8000
```

### Option C — Node.js
```bash
npx serve .
```

## Hosting on GitHub Pages

1. Push this folder to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Your site will be live at `https://<username>.github.io/<repo-name>/`

## Dataset

- **Source:** World Happiness Report 2015 (via Kaggle)
- **Rows:** 158 countries
- **Columns:** Country, Region, Happiness Rank, Happiness Score, GDP per Capita, Family, Health (Life Expectancy), Freedom, Trust (Government Corruption), Generosity, Dystopia Residual

## Technologies

- D3.js v7 (CDN)
- Vanilla HTML/CSS/JS — no build step required
- Google Fonts: Playfair Display + DM Sans
