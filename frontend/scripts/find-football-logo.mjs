import fs from "fs";

const c = fs.readFileSync("d:/Work/Projects/HK/gofootball-ai/scripts/hkjc-main.js", "utf8");
const re = /football[^"'\\]{0,40}logo[^"'\\]{0,40}/gi;
const s = new Set();
let m;
while ((m = re.exec(c))) s.add(m[0]);
[...s].forEach((x) => console.log(x));
