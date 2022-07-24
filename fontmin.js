var Fontmin = require("fontmin");
const FormData = require("form-data");
const { basename } = require("path");
const fs = require("fs");
const { fetch } = require("cross-fetch");
const { app } = require("electron");

const uploadFile = async (filePath, name) => {
  // here to upload your font files to CDN
  // const filePath = await uploadFile()
  // return filePath
};

const runFontMin = async (arg) => {
  const { path: filePath, name, useCdn = false, text } = JSON.parse(arg);
  const fileName = name.split(".")[0];
  const outputBaseDir = require("path").join(
    app.getPath("downloads"),
    "fontmin"
  );
  const outputDir = require("path").join(
    outputBaseDir,
    `${fileName}-${Date.now()}`
  );

  // const fileUrl = await uploadFiles(filePath);
  // console.log(fileUrl);
  const result = await new Promise((resolve) => {
    var fontminProcess = new Fontmin()
      .src(filePath)
      .use(
        Fontmin.glyph({
          text,
        })
      )
      .use(
        Fontmin.ttf2eot({
          clone: true,
        })
      )
      .use(
        Fontmin.ttf2woff({
          clone: true,
        })
      )
      .use(
        Fontmin.ttf2woff2({
          clone: true,
        })
      )
      .use(
        Fontmin.ttf2svg({
          clone: true,
        })
      )
      .use(
        Fontmin.css({
          base64: false,
        })
      )
      .dest(outputDir);

    fontminProcess.run(async function (err, files) {
      if (err) {
        resolve({
          status: "failed",
          data: {
            error: err,
          },
        });
      }

      // shell.openPath(outputDir);
      console.log(fs.readdirSync(outputDir));
      let css = fs.readFileSync(`${outputDir}/${fileName}.css`).toString();
      try {
        if (useCdn) {
          const outputFiles = fs.readdirSync(outputDir);
          const neededFiles = outputFiles.filter((name) => !/\.css/.test(name));
          const uploadPromises = neededFiles.map((name) => {
            return uploadFile(`${outputDir}/${name}`, name);
          });
          const result = await Promise.all(uploadPromises);

          neededFiles.forEach((name, index) => {
            console.log(name, result[index]);
            const reg = new RegExp(`url\\("${name}`, "g");
            css = css.replace(reg, `url("${result[index]}`);
          });
        }
      } catch (e) {}

      // => { contents: <Buffer 00 01 00 ...> }
      resolve({
        status: "success",
        data: {
          css,
          outputDir,
          outputBaseDir,
        },
      });
    });
  });
  return result;
};

module.exports = { runFontMin };
