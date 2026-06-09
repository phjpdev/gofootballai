const headers = {
  "Content-Type": "application/json",
  Referer: "https://bet.hkjc.com/",
  sc_apikey: "{FF2309B7-E8BB-49B2-82A7-36AE0B48F171}",
  "User-Agent": "Mozilla/5.0",
};

const query = `{
  item(path: "/sitecore/content/Sites/JCBW/Football Tournament Icon", language: "en") {
    id
    name
    children {
      id
      name
      ... on Item {
        field(name: "nameProfileId") { value }
        field(name: "Tournament Code") { value }
        field(name: "Image") { ... on ImageField { src alt } }
        field(name: "Icon") { ... on ImageField { src alt } }
        field(name: "icon") { ... on ImageField { src alt } }
      }
    }
  }
}`;

const res = await fetch("https://consvc.hkjc.com/JCBW/api/graph", {
  method: "POST",
  headers,
  body: JSON.stringify({ query }),
});
const json = await res.json();
console.log(JSON.stringify(json, null, 2).slice(0, 8000));

if (json.data?.item?.children?.length) {
  const child = json.data.item.children[0];
  console.log("\nFirst child fields:", JSON.stringify(child, null, 2));
}
