import fs from "fs";

const c = fs.readFileSync("d:/Work/Projects/HK/gofootball-ai/scripts/hkjc-main.js", "utf8");
const re = /\/-\/media\/Sites\/JCBW\/[^"'\\]+/gi;
const found = new Set();
let m;
while ((m = re.exec(c))) {
  const path = m[0];
  if (/football|tourn|team|flag|icon/i.test(path)) {
    found.add(path);
  }
}
[...found].sort().forEach((p) => console.log(p));
