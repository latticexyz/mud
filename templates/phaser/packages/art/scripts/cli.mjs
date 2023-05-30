import { existsSync, statSync, readdirSync, readFileSync, readFile, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import optimist from "optimist";
import chalk from "chalk";
const { yellowBright, redBright, white, magentaBright, greenBright } = chalk;
import texturePacker from "free-tex-packer-core";

import appInfo from "../package.json" assert { type: "json" };

function isExists(path) {
  return existsSync(path);
}

function fixPath(path) {
  return path.trim().split("\\").join("/");
}

function getNameFromPath(path) {
  return path.trim().split("/").pop();
}

function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

function isFolder(path) {
  if (isExists(path)) {
    return statSync(path).isDirectory();
  } else {
    path = fixPath(path);
    let name = getNameFromPath(path);
    let parts = name.split(".");
    return parts.length === 1;
  }
}

function getFolderFilesList(dir, base = "", list = []) {
  let files = readdirSync(dir);
  for (let file of files) {
    let p = resolve(dir, file);
    if (isFolder(p) && p.toUpperCase().indexOf("__MACOSX") < 0) {
      list = getFolderFilesList(p, base + file + "/", list);
    } else {
      list.push({
        name: (base ? base : "") + file,
        path: p,
      });
    }
  }

  return list;
}

function loadImages(images, files) {
  for (let image of images) {
    try {
      files.push({ path: image.name, contents: readFileSync(image.path) });
    } catch (e) {}
  }
}

// console.log(yellowBright("Free Texture Packer CLI v" + _version));
const argv = optimist.argv;

let projectPath = argv.project;
if (!projectPath) {
  console.log(redBright("Choose project, using --project argument"));
  process.exit();
}

readFile(projectPath, (err, content) => {
  if (err) {
    console.error(err.toString());
    return;
  }

  content = content.toString();
  let project = null;
  try {
    project = JSON.parse(content);
  } catch (e) {
    console.log(redBright("Unsupported project format " + projectPath));
    process.exit();
  }

  let outputPath = argv.output;

  if (!outputPath) {
    outputPath = project.savePath;
  }

  if (!outputPath) {
    outputPath = dirname(projectPath);
  }

  let files = [];

  loadImages(project.images, files);

  for (let folder of project.folders) {
    if (isExists(folder)) {
      let list = getFolderFilesList(folder, getNameFromPath(folder) + "/");
      loadImages(list, files);
    }
  }

  let options = project.packOptions;

  //Map exporters to core format
  if (options.exporter === "JSON (hash)") options.exporter = "JsonHash";
  if (options.exporter === "JSON (array)") options.exporter = "JsonArray";
  if (options.exporter === "XML") options.exporter = "XML";
  if (options.exporter === "css (modern)") options.exporter = "Css";
  if (options.exporter === "css (old)") options.exporter = "OldCss";
  if (options.exporter === "pixi.js") options.exporter = "Pixi";
  if (options.exporter === "Phaser (hash)") options.exporter = "PhaserHash";
  if (options.exporter === "Phaser (array)") options.exporter = "PhaserArray";
  if (options.exporter === "Phaser 3") options.exporter = "Phaser3";
  if (options.exporter === "Spine") options.exporter = "Spine";
  if (options.exporter === "cocos2d") options.exporter = "Cocos2d";
  if (options.exporter === "UnrealEngine") options.exporter = "Unreal";
  if (options.exporter === "Starling") options.exporter = "Starling";
  if (options.exporter === "Unity3D") options.exporter = "Unity3D";
  if (options.exporter === "Godot (atlas)") options.exporter = "GodotAtlas";
  if (options.exporter === "Godot (tileset)") options.exporter = "GodotTileset";

  if (options.exporter === "custom") {
    console.log(redBright("CLI does not support a custom exporter"));
    process.exit();
  }

  options.appInfo = appInfo;

  console.log(white("Start packing ") + magentaBright(projectPath));
  
  texturePacker(files, options, (f, error) => {
    if (error) {
      console.log(redBright(error));
      process.exit();
    }

    let outputJson = {
      meta: {
        app: "",
        version: "1.0.0",
      },
    };
    const textures = [];
    let lastImageName;
    for (const file of f) {
      if (file.name.includes(".json")) {
        const outJson = file.buffer.toString("utf-8", 0, file.buffer.length);
        const out = JSON.parse(outJson);
        textures.push(out.textures[0]);
        console.log(
          white("Adding to output json ") + greenBright(file.name)
        );
      } else {
        lastImageName = file.name;
        let out = resolve(outputPath, file.name);
        console.log(white("Writing ") + greenBright(out));
        writeFileSync(out, file.buffer);
      }
    }
    const fileName = lastImageName.split(".")[0];
    let jsonFileName;
    if (isNumeric(fileName[fileName.length - 1])) {
      console.log("multipart detected!!");
      jsonFileName = fileName.split("-")[0] + ".json";
    } else {
      jsonFileName = fileName + ".json";
    }
    const atlasJsonOut = resolve(outputPath, jsonFileName);
    // sort textures
    textures.sort((a, b) => a.image.localeCompare(b.image));
    outputJson.textures = textures;
    // add timestamp to atlas image to avoid browser cache
    outputJson.textures[0].image = "atlas.png?timestamp=" + Date.now();
    writeFileSync(
      atlasJsonOut,
      Buffer.from(JSON.stringify(outputJson, null, 4), "utf-8")
    );

    console.log(yellowBright("Done"));
  });
});
