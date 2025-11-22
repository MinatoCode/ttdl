const axios = require("axios");
const qs = require("qs");

module.exports = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ success: false, error: "Missing TikTok URL" });
    }

    // Reject /a/ or /m/ TikTok URLs
    if (url.includes("/a/") || url.includes("/m/")) {
      return res.json({
        success: false,
        error: "Invalid TikTok URL. Do NOT use /a/ or /m/ links."
      });
    }

    // Cookies (remove cf_clearance)
    const COOKIE = `_ga=GA1.1.768944148.1763344707; _gads=34b638ed348fc436;`;

    const data = qs.stringify({
      id: url,
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

    const response = await axios(config);
    const html = response.data;

    // Extract ALL tikcdn.io/ssstik URLs
    const regex = /(https:\/\/tikcdn\.io\/ssstik\/[^\s"<]+)/g;
    const allMatches = html.match(regex);

    if (!allMatches) {
      return res.json({ success: false, error: "No tikcdn.io URL found" });
    }

    // Filter out /a/ and /m/
    const cleanURLs = allMatches.filter(u => !u.includes("/a/") && !u.includes("/m/"));

    if (cleanURLs.length === 0) {
      return res.json({
        success: false,
        error: "Only /a/ or /m/ formats found. No clean URL available."
      });
    }

    return res.json({ success: true, author : ""MinatoCode", url: cleanURLs[0] });

  } catch (err) {
    return res.json({ success: false, author: "MinatoCode", error: err.message });
  }
};
                      
