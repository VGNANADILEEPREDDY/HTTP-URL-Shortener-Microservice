import express from "express";
import ShortUrl from "../models/ShortUrl.js";
import { nanoid } from "nanoid";

const router = express.Router();

// Create Short URL (API + HTML form)
router.post("/shorturls", async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    if (!url) {
      // If request is from a form, render error page
      if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
        return res.send("<h2>❌ URL is required!</h2><a href='/'>Go Back</a>");
      }
      return res.status(400).json({ error: "URL is required" });
    }

    const code = shortcode || nanoid(6);
    const expiry = new Date(Date.now() + validity * 60 * 1000);
    const shortLink = `${req.protocol}://${req.get("host")}/${code}`;

    const shortUrl = new ShortUrl({
      originalUrl: url,
      shortcode: code,
      shortUrl: shortLink,
      expiry,
    });

    await shortUrl.save();

    // Check if request is form submission or API
    if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
      return res.render("success", { shortLink, expiry: expiry.toISOString() });
    }

    res.status(201).json({
      shortLink,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Redirect + Track Clicks
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const shortUrl = await ShortUrl.findOne({ shortcode: code });

    if (!shortUrl) return res.status(404).send("Shortcode not found");
    if (shortUrl.expiry < new Date()) return res.status(410).send("Link expired");

    shortUrl.clicks.push({
      referrer: req.get("referer") || "direct",
      ip: req.ip,
      geo: "unknown", // can integrate geo lookup later
    });
    shortUrl.clickCount = (shortUrl.clickCount || 0) + 1;
    await shortUrl.save();

    res.redirect(shortUrl.originalUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send("Internal server error");
  }
});

// Stats for a shortcode (API + EJS page)
router.get("/shorturls/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const shortUrl = await ShortUrl.findOne({ shortcode: code });

    if (!shortUrl) return res.status(404).send("Shortcode not found");

    // Render EJS stats page
    res.render("stats", {
      originalUrl: shortUrl.originalUrl,
      shortUrl: shortUrl.shortUrl,
      createdAt: shortUrl.createdAt,
      expiry: shortUrl.expiry,
      totalClicks: shortUrl.clickCount || 0,
      clicks: shortUrl.clicks,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).send("Internal server error");
  }
});

export default router;
