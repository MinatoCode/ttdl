const axios = require("axios");
const qs = require("qs");

// Replace with your own cookie if needed
const COOKIE = `_ga=GA1.1.768944148.1763344707; _gads=34b638ed348fc436;`;

// Maximum number of retries
const MAX_RETRIES = 5;

// Function to fetch clean TikTok URL with retry logic
async function fetchTikTokURL(config, attempt = 1) {
    try {
        const response = await axios(config);
        const html = response.data;

        // Extract all TikTok download URLs
        const regex = /(https:\/\/tikcdn\.io\/ssstik\/[^\s"<]+)/g;
        const allMatches = html.match(regex);

        if (!allMatches) throw new Error("❌ No tikcdn.io URL found!");

        // Filter out /a/ and /m/ URLs
        const cleanURLs = allMatches.filter(url => !url.includes("/a/") && !url.includes("/m/"));

        if (cleanURLs.length === 0) throw new Error("❌ Only /a/ or /m/ formats found. No clean URL available.");

        return cleanURLs[0];
    } catch (err) {
        if (attempt < MAX_RETRIES) {
            // Wait 500ms before retrying to avoid rapid-fire requests
            await new Promise(resolve => setTimeout(resolve, 500));
            return fetchTikTokURL(config, attempt + 1);
        } else {
            throw err;
        }
    }
}

module.exports = async function handler(req, res) {
    const TIKTOK_URL = req.query.url;

    if (!TIKTOK_URL) {
        return res.status(400).json({ error: "❌ Provide a TikTok URL" });
    }

    // Reject URLs that have /a/ or /m/ at TikTok level
    if (TIKTOK_URL.includes("/a/") || TIKTOK_URL.includes("/m/")) {
        return res.status(400).json({ error: "❌ Do NOT use /a/ or /m/ TikTok links." });
    }

    const data = qs.stringify({
        id: TIKTOK_URL,
        locale: "en",
        tt: "RmJ4d1M3",
        debug: "ab=0&loc=NP"
    });

    const config = {
        method: "post",
        url: "https://ssstik.io/abc?url=dl",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": COOKIE,
            "Hx-Request": "true",
            "Hx-Current-Url": "https://ssstik.io/",
            "Referer": "https://ssstik.io/",
            "User-Agent": "Mozilla/5.0"
        },
        data
    };

    try {
        const cleanURL = await fetchTikTokURL(config);
        return res.status(200).json({ url: cleanURL });
    } catch (err) {
        return res.status(500).json({ error: "❌ Failed after multiple attempts: " + err.message });
    }
};
            
