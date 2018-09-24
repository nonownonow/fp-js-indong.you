import * as x from '../src/ch2/ch2'
import * as _ from 'underscore'

describe('ch2 - to deep dive in', () => {
  describe('object and brackets', () => {
    it('key/value', () => {
      expect(x.obj).toEqual({ a: 1, b: 2, c: 3, d: 4, 'e e': 5, f: 6, 'true': true, 3: '3' })
    })
    it('function as object', () => {
      expect(x.objFunction.a + x.objFunction.b).toBe(3)
      expect(x.objFunction.c).toBe(3)
    })
    it('ar as object', () => {
      expect(x.arr.a).toBe(1)
      expect(x.arr.length).toBe(2)
      expect(x.obj13.length).toBe(11)
      expect(x.obj13[4]).toBeUndefined()
    })
    it('delete key of object', () => {
      expect(x.obj14).toEqual({})
      const pushFn = Array.prototype.push
      delete Array.prototype.push
      expect(() => x.obj13.push(1)).toThrow()
      Array.prototype.push = pushFn
    })
    xit('compare inserting speed of array', () => {
      function insertByUsingPush (testSize) {
        const arrTest = []
        for (let i = 0; i < testSize; i++) {
          arrTest.push(i)
        }
      }
      function insertByUsingIndex (testSize) {
        const arrTest = []
        for (let i = 0; i < testSize; i++) {
          arrTest[i] = i
        }
      }
      function insertByUsingIndex2 (testSize) {
        const arrTest = []
        arrTest.length = testSize
        for (let i = 0; i < testSize; i++) {
          arrTest[i] = i
        }
      }
      function insertByUsingIndex3 (testSize) {
        const arrTest = new Array(testSize)
        for (let i = 0; i < testSize; i++) {
          arrTest[i] = i
        }
      }
      console.log(Array.apply(null, { length: 3 }))
      console.log(Array(...[,, ]))
      const testSize = 100000
      console.log(x.measureTime(insertByUsingPush, testSize))
      console.log(x.measureTime(insertByUsingIndex, testSize))
      console.log(x.measureTime(insertByUsingIndex2, testSize))
      console.log(x.measureTime(insertByUsingIndex3, testSize))
    })
  })
  describe('define function', () => {
    it('3type of to define function', () => {
      expect(x.fn1()).toBe('fn')
      expect(x.fn2()).toBe('fn2')
      expect(x.method.fn3()).toBe('fn3')
    })
    it('hoisting', () => {
      expect(x.hoisting()).toBe('hoisting')
      expect(() => x.hoisting2()).toThrow(/is not a function/)
    })
    it('iif - immediately-invoked function', () => {
      let i = 0
      while (i < x.iifs.length) {
        expect(x.iifs[i]).toEqual(`iif${i}`)
        i++
      }
      expect(x.iifObj.sum()).toBe(3)
      expect(x.iifCall).toEqual([1, 2])
    })
    describe(`2.2.5 - Is there any problem using 'new Function' or 'eval'`, () => {
      it(`create function by using 'new Function' and 'eval'`, () => {
        expect(x.evalFn()).toBe('eval')
        expect(x.literalFn(1, 2)).toBe(3)
      })
      it(`create simple string arrow function`, () => {
        expect(x.L('n=>n*10')(1)).toBe(10)
        expect(x.L('a,b=>a*b')(2, 3)).toBe(6)
      })
      xit(`test performance of literal arrow function and anonymous function`, () => {
        const a = x.measureTime_perfomance(1000000)(function (v) { return v })
        const b = x.measureTime_perfomance(1000000)(x.L('n=>n'))
        expect(a).toBeLessThan(b)
        const arr = Array(1000000)
        console.time('function literal')
        _.map(arr, function (v, i) {
          return i * 2
        })
        console.timeEnd('function literal')
        console.time('function literal2')
        _.map(arr, x.L('v,i=>i*2'))
        console.timeEnd('function literal2')
        const time3 = x.measureTime(() => {
          _.map(arr, eval(`x.L("v,i=>i*2")`))
        })
        console.log(time3)
        console.time('eval4')
        _.map(arr, (v, i) => ((v, i) => i * 2)(v, i))
        console.timeEnd('eval4')
        console.time('eval5')
        _.map(arr, (v, i) => x.L('v,i=>i*2')(v, i))
        console.timeEnd('eval5')
      })
    })
  })
  describe('execute function and parameter and dot', () => {})
  describe('if else || && conditional ternary operator', () => {})
  describe('parentheses of function execution', () => {})
  describe('arrow function', () => {})
})