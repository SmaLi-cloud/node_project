const esprima = require("esprima");
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");

// // 解析 JavaScript 代码为 AST
// const code = `const foo = () => { console.log("foo is called"); }
//               const bar = () => { console.log("bar is called"); }
//               bar();`;

// const ast = esprima.parseScript(code);

const code = fs.readFileSync("react-test.js", "utf8");
// 解析 React 代码
const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["jsx"]
});

// 记录所有的函数定义
const functionDefinitions = new Set();
// ast.program.body.forEach((node) => {
//   if (node.type === "VariableDeclaration") {
//     node.declarations.forEach((declaration) => {
//       if (
//         declaration.init &&
//         declaration.init.type === "ArrowFunctionExpression"
//       ) {
//         functionDefinitions.add(declaration.id.name);
//       }
//     });
//   }
// });

const exportDefaultDeclaration = ast.program.body.find(node => {
  return node.type === "ExportDefaultDeclaration";
});
if (exportDefaultDeclaration) {
  // 检查 ExportDefaultDeclaration 的 declaration 属性是否是一个函数定义
  if (exportDefaultDeclaration.declaration.type === "FunctionDeclaration") {
    exportDefaultDeclaration.declaration.body.body.forEach(node => {
      if (node.type === "VariableDeclaration") {
        node.declarations.forEach(declaration => {
          if (declaration.init && declaration.init.type === "ArrowFunctionExpression") {
            functionDefinitions.add(declaration.id.name);
          }
        });
      }
    });
  }
}

// 找到所有的函数调用并从定义中删除已被调用的函数
const functionCalls = new Set();
function findFunctionCalls(node) {
  if (node.type === "CallExpression" && node.callee.type === "Identifier") {
    functionCalls.add(node.callee.name);
  }
  if (node.type === "MemberExpression" && node.object.type === "Identifier") {
    functionCalls.add(node.object.name);
  }
  for (const key in node) {
    if (node.hasOwnProperty(key) && typeof node[key] === "object" && node[key] !== null) {
      findFunctionCalls(node[key]);
    }
  }
}
if (exportDefaultDeclaration) {
  findFunctionCalls(exportDefaultDeclaration.declaration.body);
}
// 找出未被调用的函数
const unusedFunctions = [...functionDefinitions].filter(func => !functionCalls.has(func));

// 输出未被调用的函数