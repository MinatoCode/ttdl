const axios = require("axios");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url)
    return res.status(400).json({ success: false, error: "Missing TikTok URL" });

  if (url.includes("/a/") || url.includes("/m/"))
    return res.json({ success: false, error: "Invalid TikTok URL. /a/ or /m/ not allowed." });

  try {
    // Manually encode form data
    const formData = `id=${encodeURIComponent(url)}&locale=en&tt=RmJ4d1M3&debug=ab=0&loc=NP`;

    const response = await axios.post("https://ssstik.io/abc?url=dl", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
        "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Hx-Request": "true",
        "Hx-Current-Url": "https://ssstik.io/",
        "Hx-Target": "target",
        "Hx-Trigger": "_gcaptcha_pt",
        "Origin": "https://ssstik.io",
        "Referer": "https://ssstik.io/",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/137 Mobile Safari/537.36",
        // Add cookies if you have any, e.g.
        //
        "Cookie": "_ga=GA1.1.768944148.1763344707; _gads=ID=..."
      },
      timeout: 8000
    });

    const html = response.data || "";

    // Extract tikcdn.io/ssstik URLs
    const matches = (html.match(/https:\/\/tikcdn\.io\/ssstik\/[^\s"<]+/g) || [])
      .filter(u => !u.includes("/a/") && !u.includes("/m/"));

    if (!matches.length)
      return res.json({ success: false, error: "No clean tikcdn.io URL found" });

    return res.json({ success: true, url: matches[0] });

  } catch (e) {
    return res.json({ success: false, error: "Request failed or blocked by Cloudflare" });
  }
};
