# task-trackr-api

A minimal Node.js + Express API for the Task Trackr app.

Quick start

```bash
cd task-trackr-api
# install runtime deps
npm install express cors helmet morgan dotenv mongoose
# install dev tool
npm install --save-dev nodemon

# run in development (auto-restart)
npm run dev

# or run production
npm start
```

Endpoints

- `GET /` — basic service info
- `GET /health` — health check

Environment

Copy `.env.sample` to `.env` and adjust `PORT` and `MONGODB_URI` as needed.
