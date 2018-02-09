# babel-plugin-class-properties-default-value

The plugin for transform properties of class **which has parent class**.

## Why need this

When we use Babel to support [class properties](https://babeljs.io/docs/plugins/transform-class-properties/).
Let's see the follow case: 
```javascript
class P {
  value = 'value In P'
  constructor(obj) {
    Object.assign(this, obj)
  }
}
class S extends P {
  val = 'value in S'
}

console.log(new S({ val: 'cus' }).val) // what should be printed? 
```

I think the printed val should be 'cus' at first.
But actually, It's 'value in S'.

the above code will transform to the follow code by [transform class properties](https://babeljs.io/docs/plugins/transform-class-properties/).

```javascript
class P {
  constructor(obj) {
    this.value = 'value In P'
    Object.assign(this, obj)
  }
}
class S extends P {
  constructor(...args) {
    // After called super() that We can use this expression 
    super(...args)
    this.val = 'value in S'
  }
}
console.log(new S({ val: 'cus' }).val)
```

`super(...args)` meaning call the constructor of P and after called it `val === 'cus'`.
Unfortunately, `this.val = 'value in S'` causes the shit happening.
And this is ES6 inheritance's standard.

So if I want to regard `'value in S'` as DEFAULT VALUE by this way.

```javascript
class S extends P {
  constructor(...args) {
    // After called super() that We can use this expression 
    super(...args)
    this.val = this.hasOwnProperty('val') ? this.val : 'value in S'
  }
}
```

## Options

- condType (default: 'typeofUndefined')  'typeofUndefined' | 'in' | 'hasOwnProperty'  
  - 'typeofUndefined'  
     this.val = typeof this.val !== 'undefined' ? this.val : 'value in S'
  - 'in'  
     this.val = 'val' in this ? this.val : 'value in S'
  - 'hasOwnProperty'  
     this.val = this.hasOwnProperty('val') ? this.val : 'value in S'
    
- effectThisExpr (default: false)  
  Whether effecting the work on this expression  
  `false` will ignore `this.val = this.abc`

- onlyEffectConst (default: false)  
  Whether effecting the constant only  
  `true` will ignore options.effectThisExpr, only effect constant expressions

- effectDecorator (default: false)  
  Whether effecting the work on decorator  
  `false` will ignore `@decorator this.val = 'val'`

## Note

```json5
{
  "plugins": [
    // NOTE: the order is important
    "class-properties-default-value",
    "transform-class-properties"
  ]
}
```
