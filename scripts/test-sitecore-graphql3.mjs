const headers = {
  "Content-Type": "application/json",
  Referer: "https://bet.hkjc.com/",
  sc_apikey: "{FF2309B7-E8BB-49B2-82A7-36AE0B48F171}",
  "User-Agent": "Mozilla/5.0",
};

const paths = [
  "/sitecore/content/Sites/JCBW",
  "/sitecore/content/Sites/JCBW/Football Tournament Icon",
  "/sitecore/content/Sites/JCBW/Product Menu/Football",
];

for (const lang of ["en", "en-US", "zh-HK", "zh-CN"]) {
  for (const path of paths) {
    const query = `{ item(path: "${path}", language: "${lang}") { id name children { id name } } }`;
    const res = await fetch("https://consvc.hkjc.com/JCBW/api/graph", {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    const item = json.data?.item;
    if (item) {
      console.log(`\nFOUND lang=${lang} path=${path}`);
      console.log("name:", item.name, "children:", item.children?.length ?? 0);
      item.children?.slice(0, 10).forEach((c) => console.log(" -", c.name));
    }
  }
}
