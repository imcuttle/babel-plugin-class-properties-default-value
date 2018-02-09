/**
 * @file: index
 * @author: Cuttle Cong
 * @date: 2017/11/29
 * @description:
 */

const t = require('babel-core').types

function isConstType(type) {
  switch (type) {
    // X
    case 'Identifier':
    case 'StringLiteral':
    case 'NumericLiteral':
    // function () {}
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
    // <A/>
    case 'JSXElement':
      return true
  }
  return false
}

const findThisExpressionObject = {
  'FunctionExpression|ArrowFunctionExpression'(path) {
    path.skip()
  },
  ThisExpression(path, opt) {
    opt.result = path
    path.stop()
  }
}

function getCondPath(condType = 'in', data = {}) {
  const refNode = t.memberExpression(
    t.thisExpression(),
    t.identifier(data.name),
    data.computed
  )

  switch (condType) {
    // typeof this.a !== 'undefined' ? this.a : 2;
    case 'typeofUndefined':
      const typeOfThisVal = t.unaryExpression(
        'typeof',
        refNode,
        true
      )

      return t.conditionalExpression(
        t.binaryExpression(
          '!==',
          typeOfThisVal,
          t.stringLiteral('undefined')
        ),
        refNode,
        data.valueNode
      )
    // this.hasOwnProperty('a') ? this.a : 2;
    case 'hasOwnProperty':
      const hasOwnPropertyExpr = t.unaryExpression(
        'typeof',
        refNode,
        true
      )

      return t.conditionalExpression(
        t.callExpression(
          t.memberExpression(
            t.thisExpression(),
            t.identifier('hasOwnProperty'),
            false
          ),
          [data.computed ? t.identifier(data.name) : t.stringLiteral(data.name)]
        ),
        refNode,
        data.valueNode
      )
    // 'a' in this ? this.a : 2;
    case 'in':
      return t.conditionalExpression(
        t.binaryExpression(
          'in',
          data.computed ? t.identifier(data.name) : t.stringLiteral(data.name),
          t.thisExpression()
        ),
        refNode,
        data.valueNode
      )

    default:
      throw new Error('[ERROR]: not include condType in (in/typeofUndefined/hasOwnProperty): ' + condType)
  }

}

const classMethodTraverseObject = {
  ClassProperty(path, opt) {
    opt = Object.assign({
      effectDecorator: false,
      effectThisExpr: false,
      // ignorePrivate: false,
      condType: 'typeofUndefined'
    }, opt)

    path.skip()

    if (path.node.static) {
      return
    }
    if (
      // effectDecorator
      !opt.effectDecorator
      && path.node.decorators
      && !!path.node.decorators.length
    ) {
      return
    }

    const keyName = path.node.key.name
    const valuePath = path.get('value')
    if (isConstType(valuePath.type)) {
      valuePath.replaceWith(
        getCondPath(opt.condType, {
          computed: path.node.computed,
          valueNode: valuePath.node,
          name: keyName
        })
      )
    }
    else {
      const resultObj = { result: null }
      let hasThisExpression
      // effectThisExpr
      if (opt.effectThisExpr) {
        hasThisExpression = false
      }
      else {
        if (valuePath.type === 'ThisExpression') {
          hasThisExpression = true
        }
        else {
          valuePath.traverse(findThisExpressionObject, resultObj)
          hasThisExpression = !!resultObj.result
        }
      }

      // we think you want to regard it as an constant
      // when without ThisExpr
      if (!hasThisExpression) {
        valuePath.replaceWith(
          getCondPath(opt.condType, {
            computed: path.node.computed,
            valueNode: valuePath.node,
            name: keyName
          })
        )
      }
      // console.error(keyName, hasThisExpression, valuePath.type)
    }
  }
}

module.exports = function (babel) {
  return {
    inherits: require('babel-plugin-syntax-class-properties'),
    visitor: {
      /*ClassDeclaration*/
      ClassExpression(path, data) {
        // class Son { ... }
        path.skip()
        if (!path.node.superClass) {
          return
        }

        // Son extends Parent
        // ClassBody
        path.get('body').traverse(classMethodTraverseObject, data.opts)
      }
    }
  }
}
