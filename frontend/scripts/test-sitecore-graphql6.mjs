const headers = {
  "Content-Type": "application/json",
  Referer: "https://bet.hkjc.com/",
  sc_apikey: "{FF2309B7-E8BB-49B2-82A7-36AE0B48F171}",
  "User-Agent": "Mozilla/5.0",
};

const query = `{
  item(path: "/sitecore/content/Sites/JCBW/Universal Football Tournament Info/Int_Tournament BD2", language: "en-US") {
    id
    name
    fields {
      name
      value
      ... on ImageField {
        src
        alt
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
console.log(JSON.stringify(json, null, 2));
