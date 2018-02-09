/**
 * @file: index
 * @author: Cuttle Cong
 * @date: 2017/11/29
 * @description:
 */

var babel = require('babel-core')
var fs = require('fs')

var codeText = fs.readFileSync(__dirname + '/fixture/code.js').toString()

var options = {
  presets: [
    // require.resolve('babel-preset-es2015'),
    // require.resolve('babel-preset-react'),
    // require.resolve('babel-preset-stage-0'),
  ],
  plugins: [
    [require.resolve('../lib/'), {
      effectDecorator: true,
      effectThisExpr: true,
      condType: 'in',
      // condType: 'typeofUndefined'
    }],
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-decorators-legacy'),
    // require.resolve('babel-plugin-transform-decorators-legacy'),
  ]
}

var ret = babel.transform(codeText, options)

console.log(ret.code)
