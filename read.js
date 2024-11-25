const fs = require("fs");
const path = require("path");
const delLog = require("./del-log.js");
// 文件路径
const delLogByFile = (filePath) => {
  // 读取文件内容
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }
    const modifiedData = delLog(data);

    // 保存修改后的内容到文件
    fs.writeFile(filePath, modifiedData, "utf8", (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
    });
  });
};

// 递归遍历文件夹
function traverseFolder(folder) {
  fs.readdir(folder, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${folder}:`, err);
      return;
    }

    files.forEach((file) => {
      if (file === "node_modules") {
        return;
      }
      const fullPath = path.join(folder, file);
      fs.stat(fullPath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats of ${fullPath}:`, err);
          return;
        }
        if (stats.isDirectory()) {
          // 如果是文件夹，递归遍历
          traverseFolder(fullPath);
        } else {
          // 如果是文件
          delLogByFile(fullPath);
        }
      });
    });
  });
}

// 定义要遍历的文件夹路径
const folderPath = path.join(__dirname, "src");

// 开始遍历文件夹
traverseFolder(folderPath);
