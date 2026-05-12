import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import posthog from "posthog-js";
import "./index.css";
import App from "./App.jsx";

posthog.init("phc_D5q6CxVUZwGU6kkrhVjq7ZHcbjqRqV49YnSD2NSzPhUb", {
  api_host: "https://us.i.posthog.com",
  // Pageviews fired manually in App.jsx to handle HashRouter + search-param changes correctly
  capture_pageview: false,
  capture_pageleave: true,
  autocapture: true,
  enable_heatmaps: true, // visual heatmaps + scroll depth
  rageclick: true, // default true, explicit for clarity
  capture_dead_clicks: true, // default true, explicit for clarity
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
