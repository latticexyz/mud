import { renderFile } from "ejs";
import { writeFileSync } from "fs";
import { extname, basename, join, dirname } from "node:path/posix";

function renderEjsToSol(file: string, data: object) {
  renderFile(file, data, {}, (err, str) => {
    if (err) throw err;
    const solFile = basename(file, extname(file)) + ".sol";
    const outFullPath = join(dirname(file), solFile);
    writeFileSync(outFullPath, str);
    console.log(`generated: ${outFullPath}`);
  });
}

renderEjsToSol("src/tightcoder/DecodeSlice.ejs", {});
renderEjsToSol("src/tightcoder/EncodeArray.ejs", {});
renderEjsToSol("test/tightcoder/TightCoderAuto.t.ejs", {});
