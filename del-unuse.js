const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const {exec} = require('child_process');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
// AST语法树去除console.log
const delLog = sourceCode => {
  // 解析源代码生成 AST
  const ast = parser.parse(sourceCode, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  // 遍历 AST，并移除所有的 console.log
  traverse(ast, {
    CallExpression(path) {
      if (
        path.node.callee.type === 'MemberExpression' &&
        path.node.callee.object.name === 'console' &&
        path.node.callee.property.name === 'log'
      ) {
        path.remove(); // 移除 console.log 调用节点
      }
    },
  });

  // 使用 escodegen 重新生成优化后的代码
  const optimizedCode = generator(ast);
  return optimizedCode.code;
};
// AST语法树去除未使用的引用
function removeUnusedImports(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['js', 'jsx'],
  });
  traverse(ast, {
    ImportDeclaration(path) {
      let specifiers = path.node.specifiers;
      if (specifiers.length === 0) {
        path.remove();
      } else {
        let length = specifiers.length;
        let count = 0;
        let delSpec = new Set();
        specifiers.forEach(specifier => {
          const localName = specifier.local.name;
          let bindings = path.scope.bindings[localName];
          if (localName === 'React') {
            // 跳过React
            return;
          }
          if (!bindings.referenced) {
            delSpec.add(localName);
            count++;
          }
        });
        if (!delSpec.size) {
          return;
        }
        if (count === length) {
          path.remove();
          return;
        }
        path.get('specifiers').forEach(spec => {
          if (delSpec.has(spec.node.local.name)) {
            spec.remove();
          }
        });
      }
    },
  });

  const {code: modifiedCode} = generator(ast);
  fs.writeFileSync(filePath, modifiedCode, 'utf8');
}

// 文件路径
const removeLogs = filePath => {
  // 读取文件内容
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    const modifiedData = delLog(data);
    // 保存修改后的内容到文件
    fs.writeFile(filePath, modifiedData, 'utf8', err => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      exec('npx eslint --fix ' + filePath, (error, stdout, stderr) => {
        if (error) {
          console.error(`执行命令出错：${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`命令输出错误：${stderr}`);
          return;
        }
        console.log(`命令执行成功，输出：${stdout}`);
      });
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

    files.forEach(file => {
      if (file === 'node_modules') {
        return;
      }
      const fullPath = path.join(folder, file);
      fs.stat(fullPath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats of ${fullPath}:`, err);
          return;
        }
        // 如果是文件夹，递归遍历
        if (stats.isDirectory()) {
          const basename = path.basename(fullPath);
          if (['component', 'components'].includes(basename)) {
            return;
          }
          traverseFolder(fullPath);
        } else {
          // 如果是文件
          if (path.extname(fullPath) === '.js') {
            removeUnusedImports(fullPath);
            removeLogs(fullPath);
          }
        }
      });
    });
  });
}

const currentDir = path.dirname(__dirname);
const folderPath = path.join(currentDir, 'pages/test-page');
// 开始遍历文件夹
traverseFolder(folderPath);
