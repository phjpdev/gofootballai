const headers = {
  "Content-Type": "application/json",
  Referer: "https://bet.hkjc.com/",
  sc_apikey: "{FF2309B7-E8BB-49B2-82A7-36AE0B48F171}",
  "User-Agent": "Mozilla/5.0",
};

const queries = [
  `{
    item(path: "/sitecore/content/Sites/JCBW/Football Tournament Icon", language: "en") {
      id
      name
      children {
        results {
          id
          name
          ... on Item {
            field(name: "nameProfileId") { value }
            field(name: "Image") { ... on ImageField { src alt } }
            field(name: "icon") { ... on ImageField { src alt } }
          }
        }
      }
    }
  }`,
  `{
    search(
      rootItem: "/sitecore/content/Sites/JCBW/Football Tournament Icon"
      fieldsEqual: [{ name: "nameProfileId", value: "51450089" }]
      language: "en"
    ) {
      results {
        id
        name
        path
        ... on Item {
          field(name: "nameProfileId") { value }
          field(name: "Image") { ... on ImageField { src alt } }
        }
      }
    }
  }`,
];

for (const query of queries) {
  console.log("\n=== QUERY ===\n", query.slice(0, 120), "...\n");
  const res = await fetch("https://consvc.hkjc.com/JCBW/api/graph", {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  console.log(res.status, text.slice(0, 3000));
}
