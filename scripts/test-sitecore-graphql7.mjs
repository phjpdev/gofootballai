const headers = {
  "Content-Type": "application/json",
  Referer: "https://bet.hkjc.com/",
  sc_apikey: "{FF2309B7-E8BB-49B2-82A7-36AE0B48F171}",
  "User-Agent": "Mozilla/5.0",
};

const query = `{
  item(path: "/sitecore/content/Sites/JCBW", language: "en-US") {
    children {
      name
    }
  }
}`;

const res = await fetch("https://consvc.hkjc.com/JCBW/api/graph", {
  method: "POST",
  headers,
  body: JSON.stringify({ query }),
});
const children = (await res.json()).data?.item?.children ?? [];
children
  .filter((c) => /team|icon|tourn|football/i.test(c.name))
  .forEach((c) => console.log(c.name));
