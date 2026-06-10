import fs from "fs";

const c = fs.readFileSync("d:/Work/Projects/HK/gofootball-ai/scripts/hkjc-main.js", "utf8");
const re = /sitecore\/content\/Sites\/JCBW\/[^"'\\]{5,80}/g;
const s = new Set();
let m;
while ((m = re.exec(c))) s.add(m[0]);
[...s]
  .filter((x) => /football|Football|tourn|Tourn|team|Team|icon|Icon/i.test(x))
  .forEach((x) => console.log(x));
