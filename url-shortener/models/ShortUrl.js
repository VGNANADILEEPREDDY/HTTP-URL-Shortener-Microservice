import mongoose from "mongoose";

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now }, // when the click happened
  referrer: { type: String, default: "unknown" }, // where the click came from
  ip: { type: String }, // IP address of the user
  geo: { type: String, default: "unknown" } // geo-location (can be enriched later)
});

const shortUrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true }, // full long URL
  shortcode: { type: String, required: true, unique: true }, // unique short code
  shortUrl: { type: String, required: true }, // full shortened URL (hostname + shortcode)
  expiry: { type: Date, required: true }, // expiry timestamp (ISO 8601)
  createdAt: { type: Date, default: Date.now }, // when created
  clicks: [clickSchema], // array of click events
  clickCount: { type: Number, default: 0 } // total clicks
});

export default mongoose.model("ShortUrl", shortUrlSchema);
