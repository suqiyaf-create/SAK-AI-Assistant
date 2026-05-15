import express from "express";
import path from "path";
import cors from "cors";
import axios from "axios";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "SAK AI", creator: "Suqiya" });
  });

  // Weather Proxy
  app.get("/api/weather/current", async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ detail: "City required" });

    try {
      // 1. Geocoding
      const geoRes = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
        params: { name: city, count: 1, language: "en", format: "json" }
      });
      const results = geoRes.data.results;
      if (!results || results.length === 0) {
        return res.status(404).json({ detail: `City not found: ${city}` });
      }
      const loc = results[0];
      const { latitude, longitude } = loc;

      // 2. Weather
      const weatherRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude, longitude,
          current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
          daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max",
          timezone: "auto",
          forecast_days: 7,
        }
      });

      res.json({
        location: {
          name: loc.name,
          country: loc.country,
          country_code: loc.country_code,
          admin1: loc.admin1,
          latitude, longitude,
          timezone: weatherRes.data.timezone,
        },
        current: weatherRes.data.current,
        daily: weatherRes.data.daily,
      });
    } catch (error: any) {
      console.error("Weather error:", error.message);
      res.status(502).json({ detail: "Weather API failed" });
    }
  });

  app.get("/api/weather/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json({ results: [] });

    try {
      const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
        params: { name: q, count: 8, language: "en", format: "json" }
      });
      const data = response.data.results || [];
      res.json({
        results: data.map((x: any) => ({
          name: x.name,
          country: x.country,
          country_code: x.country_code,
          admin1: x.admin1,
          latitude: x.latitude,
          longitude: x.longitude,
        }))
      });
    } catch (error) {
      res.json({ results: [] });
    }
  });

  // News Proxy
  app.get("/api/news", async (req, res) => {
    try {
      // Using okCloud news proxy (public service for demo feeds)
      const response = await axios.get("https://ok.surf/api/v1/cors/news-feed");
      res.json(response.data);
    } catch (error) {
      res.status(502).json({ detail: "News API failed" });
    }
  });

  // Quotes Proxy
  app.get("/api/quotes/random", async (req, res) => {
    try {
      const response = await axios.get("https://zenquotes.io/api/random");
      res.json(response.data);
    } catch (error) {
      res.status(502).json({ detail: "Quotes API failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
