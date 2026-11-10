# ❄️ Cold Chain AI v2.0

> AI-powered real-time cold chain logistics monitoring and management platform

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Django](https://img.shields.io/badge/Django-5.0-green?style=flat-square&logo=django)
![Flask](https://img.shields.io/badge/Flask-3.0-blue?style=flat-square&logo=flask)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat-square&logo=docker)
![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-purple?style=flat-square&logo=google)
![Llama](https://img.shields.io/badge/Llama-3.3_70B-orange?style=flat-square)
![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple?style=flat-square&logo=ethereum)

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Django API | http://localhost:8000 |
| Flask ML | http://localhost:5000 |

**Demo credentials:**
- Admin: `admin@coldchain.com` / `admin123`
- Viewer: `viewer@coldchain.com` / `viewer123`

---

## ✨ Features

### 🌍 Real-time Global Tracking
- Interactive 3D globe built with Three.js
- 85 shipments across 15 logistics hubs on 6 continents
- Live shipment routes with colored arcs by status
- Particle field with 3000 floating points

### 🌡️ Cold Chain Monitoring
- Real-time temperature telemetry (2°C - 8°C compliance)
- WebSocket updates every 10 seconds via Django Channels
- Automatic alert generation on temperature excursion
- Live TEMPERATURE EXCURSIONS feed on dashboard

### 🤖 ARIA Voice Assistant
- Bilingual AI assistant (Hindi + English auto-detection)
- Powered by Llama 3.3 70B via Groq + LangChain memory
- Voice commands: navigate, query, update shipments
- Continuous conversation mode with auto-listen
- Fallback to Gemini 2.0 Flash if Groq unavailable

### 🧠 AI & Machine Learning
- **Gemini 2.0 Flash** — Risk analysis and shipment alerts
- **Llama 3.3 70B** — Voice assistant and fleet analysis
- **LangChain** — Conversation memory and orchestration
- **Flask ML Service** — 5 prediction models:
  - Spoilage risk prediction
  - ETA accuracy forecasting
  - Anomaly detection (Isolation Forest)
  - Demand forecasting (LSTM)
  - Route optimization

### ⛓️ Blockchain Verification
- Every delivery recorded on Ethereum Sepolia testnet
- Shipment ID encoded in transaction calldata
- Etherscan links for verification
- No smart contract needed — pure calldata proof

### 📊 Analytics Dashboard
- 6 Recharts visualizations
- Shipment volume trends (7 days)
- Temperature compliance monitoring (24h)
- Fleet health radar chart
- Route performance bar charts

### 🎯 Special Features
- **Cinematic intro** — Scan line + typing animation on load
- **War Room mode** — Fullscreen command center
- **Cursor trail** — Cyan particle effect
- **Keyboard shortcuts** — Press ? to see all
- **PDF export** — Individual shipment reports
- **CRUD operations** — Create, edit, delete shipments
- **Dark/sci-fi HUD** — Corner brackets, scanlines

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | React framework with SSR |
| TypeScript 5.7 | Type safety |
| Three.js | 3D globe visualization |
| Framer Motion | Animations and transitions |
| Tailwind CSS v4 | Styling |
| Recharts | Data visualization |
| Leaflet.js | World map |
| jsPDF | PDF report generation |
| LangChain + Groq | Voice AI orchestration |

### Backend
| Technology | Purpose |
|---|---|
| Django 5 + DRF | REST API |
| Django Channels | WebSocket real-time updates |
| Daphne | ASGI server |
| PostgreSQL 16 | Primary database |
| Redis 7 | WebSocket channel layer |

### ML Service
| Technology | Purpose |
|---|---|
| Flask 3 | ML microservice |
| scikit-learn | ML models |
| TensorFlow | LSTM demand forecasting |
| Gunicorn | Production WSGI server |

### AI Models
| Model | Provider | Purpose |
|---|---|---|
| Gemini 2.0 Flash | Google AI | Risk analysis, alerts |
| Llama 3.3 70B | Groq (free) | Voice assistant |
| LangChain | Open source | Memory, orchestration |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Multi-service containerization |
| Ethereum Sepolia | Blockchain testnet |
| Ethers.js v6 | Blockchain interaction |

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Rajiv6165/Cold-Chain-AI.git
cd Cold-Chain-AI

# Copy environment template
cp .env.example .env

# Add your API keys to .env
# GEMINI_API_KEY=your_key (get free at aistudio.google.com)
# GROQ_API_KEY=your_key (get free at console.groq.com)

# Start all services
docker-compose up --build
```

Open http://localhost:3000

### Environment Variables

Create a `.env` file in the project root:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Database
POSTGRES_DB=coldchain
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Optional - Blockchain (uses mock hashes if not set)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
SEPOLIA_PRIVATE_KEY=0x_your_wallet_private_key
```

### Seed Database

```bash
docker-compose exec backend python manage.py seed_shipments
```

---

## 📁 Project Structure
cold-chain-v2/
├── frontend/                 # Next.js 15 application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── dashboard/   # Main dashboard
│   │   │   ├── login/       # Authentication
│   │   │   └── api/         # API proxy routes
│   │   ├── components/
│   │   │   ├── three/       # Three.js 3D globe
│   │   │   ├── effects/     # Animations, voice, cursor
│   │   │   └── dashboard/   # Dashboard components
│   │   └── hooks/           # Custom React hooks
│   └── Dockerfile
├── backend/                  # Django REST API
│   ├── core/                # Django settings + ASGI
│   ├── shipments/           # Shipments app + WebSockets
│   └── Dockerfile
├── ml_service/              # Flask ML microservice
│   ├── routes/              # ML prediction endpoints
│   ├── app.py               # Flask application
│   └── Dockerfile
├── docker-compose.yml       # Multi-service orchestration
└── .env.example             # Environment template

---

## 🎯 API Endpoints

### Django REST API (port 8000)
GET  /api/shipments/          # List all shipments
GET  /api/shipments/stats/    # Fleet statistics
POST /api/shipments/create/   # Create shipment
PATCH /api/shipments/{id}/edit/   # Update shipment
DELETE /api/shipments/{id}/delete/ # Delete shipment
POST /api/shipments/update/   # Update status
GET  /api/health/             # Health check
POST /api/ai/langchain/       # LangChain fleet analysis
WS   /ws/shipments/           # WebSocket real-time feed

### Flask ML Service (port 5000)
GET  /ml/health                    # Service health
POST /ml/predict/spoilage          # Spoilage prediction
POST /ml/predict/eta               # ETA prediction
POST /ml/detect/anomaly            # Anomaly detection
GET  /ml/forecast/demand           # Demand forecasting
POST /ml/optimize/route            # Route optimization

---

## 🎮 Usage Guide

### Voice Assistant (ARIA)
Click the 🎤 microphone button or the floating orb.

Example commands:
English: "How many alerts are there?"
Hindi:   "Kitne shipments alert mein hain?"
English: "Show me the map"
Hindi:   "Map dikhao"
English: "Mark LOG-100046 as delivered"
English: "What is the fleet health?"

### Keyboard Shortcuts
Press `?` anywhere on the dashboard to see all shortcuts.

| Key | Action |
|---|---|
| ? | Show shortcuts |
| D | Dashboard |
| M | Map View |
| A | Analytics |
| L | ML Insights |
| Esc | Close panels |

### War Room Mode
Click "WAR ROOM" in the header for fullscreen command center mode.

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### 3D Globe
![Globe](docs/screenshots/globe.png)

### ARIA Voice Assistant
![ARIA](docs/screenshots/aria.png)

### Analytics
![Analytics](docs/screenshots/analytics.png)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | React framework with SSR |
| TypeScript 5.7 | Type safety |
| Three.js | 3D globe visualization |
| Framer Motion | Animations and transitions |
| Tailwind CSS v4 | Styling |
| Recharts | Data visualization |
| Leaflet.js | World map |
| jsPDF | PDF report generation |
| LangChain + Groq | Voice AI orchestration |

### Backend
| Technology | Purpose |
|---|---|
| Django 5 + DRF | REST API |
| Django Channels | WebSocket real-time updates |
| Daphne | ASGI server |
| PostgreSQL 16 | Primary database |
| Redis 7 | WebSocket channel layer |

### ML Service
| Technology | Purpose |
|---|---|
| Flask 3 | ML microservice |
| scikit-learn | ML models |
| TensorFlow | LSTM demand forecasting |
| Gunicorn | Production WSGI server |

### AI Models
| Model | Provider | Purpose |
|---|---|---|
| Gemini 2.0 Flash | Google AI | Risk analysis, alerts |
| Llama 3.3 70B | Groq (free) | Voice assistant |
| LangChain | Open source | Memory, orchestration |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Multi-service containerization |
| Ethereum Sepolia | Blockchain testnet |
| Ethers.js v6 | Blockchain interaction |

---

## 🤝 Contributing

This is an MCA Final Year Project. Feel free to fork and build upon it.

---

## 📄 License

MIT License — feel free to use for educational purposes.

---

## 👨💻 Author

**Rajiv N Thakker**
- GitHub: [@Rajiv6165](https://github.com/Rajiv6165)
- Project: MCA Final Year — Cold Chain Logistics

---

*Built with ❤️ using Next.js, Django, Flask, Three.js, 
Gemini AI, Llama 3.3, LangChain, and Ethereum*
