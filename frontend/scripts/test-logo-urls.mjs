const urls = [
  "https://consvc.hkjc.com/football/info/logo/team/50002214.png",
  "https://consvc.hkjc.com/football/info/logo/tournament/50069839.png",
  "https://consvc.hkjc.com/-/media/Sites/JCBW/Football Tournament Icon/51450089",
  "https://consvc.hkjc.com/-/media/Sites/JCBW/Football%20Tournament%20Icon/51450089",
  "https://consvc.hkjc.com/-/media/Sites/JCBW/Football Tournament Icon/51450089.png",
  "https://consvc.hkjc.com/-/media/Sites/JCBW/Football Tournament Icon/BD2",
  "https://consvc.hkjc.com/-/media/Sites/JCBW/Football Tournament Icon/BD2.png",
  "https://football.hkjc.com/football/info/logo/team/50002214.png",
  "https://common.hkjc.com/football/info/logo/team/50002214.png",
  "https://consvc.hkjc.com/-/media/Sites/JCBW/football/team/50002214.png",
  "https://consvc.hkjc.com/-/media/Sites/JCBW/Football/team/50002214.png",
  "https://consvc.hkjc.com/-/media/Sites/JCBW/Football Team Icon/50002214",
  "https://consvc.hkjc.com/-/media/Sites/JCBW/Football Team Icon/50002214.png",
];

const headers = {
  Referer: "https://bet.hkjc.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

for (const url of urls) {
  try {
    const res = await fetch(url, { headers });
    const buf = Buffer.from(await res.arrayBuffer());
    const magic = buf.slice(0, 8).toString("hex");
    const preview = buf.slice(0, 40).toString("utf8").replace(/\s+/g, " ");
    console.log(
      `${res.status} ${res.headers.get("content-type")?.slice(0, 30)} magic=${magic} len=${buf.length}`,
      "\n ",
      url,
      "\n ",
      preview.slice(0, 60),
      "\n",
    );
  } catch (e) {
    console.log("ERR", url, e.message);
  }
}
