const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t = require("@babel/types");


const delUnusedVar = function (sourceCode) {
  // 解析源代码生成 AST
  const ast = parser.parse(sourceCode, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  var visitor = {
    VariableDeclarator(path) {
      var binding = path.scope.getBinding(path.node.id.name);
      //变量被修改过
      if (!binding || binding.constantViolations.length > 0) {
      console.log('变量被修改过:',path.node.id.name);
        return;
      }
      
      //变量没有被使用过
      if (binding.referencePaths.length == 0) {
        console.log("已删除变量：", path.node.id.name);
        path.remove();
      }else {
      console.log('name:',path.node.id.name);
      }
    },
  };
  traverse(ast, visitor);
  return generator(ast).code;
};

const delLog = (sourceCode) => {
  // 解析源代码生成 AST
  const ast = parser.parse(sourceCode, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  // 遍历 AST，并移除所有的 console.log
  traverse(ast, {
    CallExpression(path) {
      if (
        path.node.callee.type === "MemberExpression" &&
        path.node.callee.object.name === "console" &&
        path.node.callee.property.name === "log"
      ) {
        const parent = path.findParent(
          (p) =>
            t.isCatchClause(p) ||
            (t.isCallExpression(p) && p.node.callee.property.name === "catch")
        );
        // console.log(parent);
        if (!parent) {
          // Remove console.log if not inside a catch block
          path.remove(); // 移除 console.log 调用节点
        }
      }
    },
  });

  // 使用 escodegen 重新生成优化后的代码
  const optimizedCode = generator(ast);
  return optimizedCode.code;
};

let text = `import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Styles from '../../utils/styles';
import PageTop from '../../components/page-top';
import {SafeAreaView} from 'react-native-safe-area-context';

/**
 * 描述：模板页面
 * 创建：pengpeng
 * 组织：安洁利
 * 时间：2022-08-04 14:08
 **/

export default class TempPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={Styles.safe_container}>
        <View style={Styles.container}>
          <PageTop
            goBack={this.props.navigation.goBack}
            {...this.props}
            title="模板页面"
            isSafeView={true}
          />
        </View>
      </SafeAreaView>
    );
  }
}

`;
// console.log(delLog(text));
console.log(delUnusedVar(text));
