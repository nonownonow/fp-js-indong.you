import * as x from '../src/ch5'
// when use esm library, _ dosn't work as partial, because it is proxy instance
// so I import partial-js module as _ using commonjs type
const _ = require('partial-js')
const expect = require('expect')
describe(`ch5`, () => {
  const products = [
    { id: 1, name: '후드 집업', discounted_price: 6000, price: 10000 },
    { id: 2, name: '코잼 후드티', discounted_price: 8000, price: 8000 },
    { id: 3, name: 'A1 반팔티', discounted_price: 6000, price: 6000 },
    { id: 4, name: '코잼 반팔티', discounted_price: 5000, price: 6000 }
  ]
  describe(`_.go`, () => {
    it(`with anonymous function`, () => {
      expect(_.go(10,
        a => a * 10,
        a => a - 50,
        a => a + 10
      )).toBe(60)
    })
    it('send multiple parameter by using _.mr', () => {
      expect(_.go(
        10,
        a => _.mr(a * 10, 50),
        (a, b) => a - b,
        a => a + 10
      )).toBe(60)
      expect(_.go(
        _.mr(2, 3),
        (a, b) => a + b,
        a => a * a
      )).toBe(25)
    })
  })
  describe('_.pipe', () => {
    it('_.pipe', () => {
      function add (a, b) {
        return _.mr(a + b)
      }
      function square (a) {
        return a * a
      }
      expect(_.pipe(add, square)(1, 2)).toBe(9)
    })
  })
  describe('5.1.4 compose with partially curring function', () => {
    it('c5-6', () => {
      expect(_.go(
        products,
        _.filter(v => v.discounted_price < v.price),
        _.sortBy('discounted_price'),
        _.first,
        _.val('name')
      )).toBe('코잼 반팔티')
    })
    it('c5-8 compose with _.go', () => {
      expect(_.go(
        products,
        _.reject(v => v.discounted_price < v.price),
        _.sortBy('discounted_price'),
        _.first,
        _.val('id')
      )).toBe(3)
      expect(_.go(
        products,
        _.filter(v => v.discounted_price < v.price),
        _.sortBy('discounted_price'),
        _.last,
        _.val('name')
      )).toBe('후드 집업')
      expect(_.go(
        products,
        _.filter(v => v.discounted_price < v.price),
        _.min(v => v.discounted_price - v.price),
        _.val('name')
      )).toBe('후드 집업')
    })
  })
  describe('5.1.5 create helper function by using pipline', () => {
    it('5-9', () => {
      expect(_.go(
        products,
        _.filter(v => v.discounted_price < v.price),
        // _.map(v => _.go(v, _.idtt, _.pick(['id', 'name']), _.values))
        _.map(__(_.idtt, _.pick(['id', 'name']), _.values))
      )).toEqual([[1, '후드 집업'], [4, '코잼 반팔티']])
    })
    it('5-12', async () => {
      function add (a, b, next) {
        setTimeout(() => {
          next(a + b)
        }, 10)
      }
      function sub (a, b, next) {
        setTimeout(() => {
          next(a - b)
        }, 15)
      }
      function mul (a, b, next) {
        setTimeout(() => {
          next(a * b)
        }, 5)
      }

      expect(await _.go(
        _.mr(5, 10),
        _.callback((a, b, next) => add(a, b, next)),
        _.callback((a, next) => sub(a, 10, next)),
        _.callback((a, next) => mul(a, 10, next))
      )).toBe(50)
      expect(await _.go(
        _.mr(5, 10),
        _.callback(
          add,
          _(sub, _, 10),
          _(mul, 10)
        )
      )).toBe(50)
    })
    it('test', async () => {
      var add = _.callback(function (a, b, next) {
        setTimeout(function () {
          next(a + b)
        }, 10)
      })

      var sub = _.callback(function (a, b, next) {
        setTimeout(function () {
          next(a - b)
        }, 10)
      })

      var mul = _.callback(function (a, b, next) {
        setTimeout(function () {
          next(a * b)
        }, 10)
      })
      expect(await _.go(
        _.mr(5, 10),
        add,
        _(sub, _, 10),
        _(mul, 10)
      )).toBe(50)
    })
  })
  describe('5.1.7 to stopping in the middle and exiting', () => {
    it('5-16 to exiting from pipeline', () => {
      expect(_.go(
        null,
        () => 1,
        () => 2,
        _.stop,
        () => 3,
        () => 4
      )).toBe(2)
    })
    it('5-18 _.map', async () => {
      expect(_.map([1, 2, 3], v => v)).toEqual([1, 2, 3])
      expect(await _.map([1, 2, 3], v => new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(v)
        }, 10)
      }))).toEqual([1, 2, 3])
    })
    it('5-19 compose through sync function and async function by using pipelinee', async () => {
      function promiseFn (v) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(v)
          }, 10)
        })
      }
      function callbackFn (v, next) {
        setTimeout(() => {
          next(v)
        })
      }
      expect(await _.go(
        [1, 2, 3],
        v => v,
        promiseFn,
        _.callback(callbackFn)
      )).toEqual([1, 2, 3])
    })
    function is_1_async (a) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(a == 1), 10)
      })
    }
    function is_2_async (a) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(a == 2), 10)
      })
    }
    it('5-25 _.if().else_if().else', async () => {
      const testFn = _.if(
        is_1_async, _.constant('1입니다')
      ).else_if(
        is_2_async, _.constant('2입니다')
      ).else(
        _.constant('1도 아니고 2도 아닙니다.')
      )
      expect(await testFn(2)).toBe('2입니다')
    })
    it('5-26 use _.if with _.constant, arrow function, _.go', async () => {
      const test5 =
        _.if(is_1_async, _.constant('is 1'))
          .else_if(is_2_async, _.constant('is 2'))
          .else(_.constant('isnt 1 and isnt 2'))
      expect(await test5(1)).toEqual('is 1')
      expect(await _.go(
        3,
        _.if(is_1_async, _.c('is 1'))
          .else_if(is_2_async, _.c('is 2'))
          .else(_.c('isnt 1 and isnt 2'))
      )).toBe('isnt 1 and isnt 2')
    })
    it('5-28', () => {
      function mult (a, b) {
        return a * b
      }
      const mult_all = _.map(function () {
        return _.reduce(_.initial(arguments, 2), mult)
      })
      const mult_all2 = _.map(__(
        _.args,
        _.initial(2),
        _.reduce(mult)
      ))
      expect(mult_all(10, 10, 2, [1, 2, 3])).toEqual([200, 400, 600])
      expect(mult_all2(10, 10, 2, [1, 2, 3])).toEqual([200, 400, 600])
    })
    it('5-29', () => {
      const res = _.go(
        _.mr(10, 5),
        _.all(
          (a, b) => a + b,
          (a, b) => a - b,
          (a, b) => a * b
        )
        // (...args) => _.toArray(args)
      )
      expect(res).toEqual([15, 5, 50])
      // expect(toArray(res)).toEqual([15, 5, 50])
      expect(_.go(
        _.mr(10, 5),
        _.spread(
          a => a * a,
          b => b * b
        ),
        toArray
      )).toEqual([100, 25])
      expect(_.go(
        10,
        _.all(
          a => a + 5,
          a => a - 5,
          a => a * 5
        ),
        _.spread(
          a => a + 1,
          b => b + 2,
          c => c + 3
        ),
        toArray
      ))
    })
    it('5-30', async () => {
      expect(await _.go(
        10,
        _.all(
          function (a) {
            return new Promise((resolve) => {
              setTimeout(function () {
                resolve(a + 5)
              }, 20)
            })
          },
          function (a) { return a - 5 },
          function (a) { return a * 5 }
        ),
        _.spread(
          function (a) { return a + 1 },
          _.callback(function (a, next) {
            setTimeout(() => {
              next(a + 1)
            }, 20)
          }),
          function (a) { return a + 3 }
        ),

        toArray
      )).toEqual([16, 6, 53])
    })
  })
  describe('5.4.1 pipeline2', () => {
    describe('5.4.1 use this in _.go', () => {
      it('5-32 _.go.call', () => {
        const user = { name: 'Cojamm' }
        _.go.call(user,
          32,
          function (age) { this.age = age },
          function () { this.job = 'Rapper' }
        )
        expect(user).toEqual({ name: 'Cojamm', age: 32, job: 'Rapper' })
      })
      it('5-33 _.indent', () => {
        const spy = expect.createSpy().andReturn('hi')
        const spy2 = expect.createSpy()
        const f1 = _.indent(
          spy,
          spy2
        )
        f1(1, 2)
        expect(spy.calls[0].context).toIncludeKeys(['parent', 'arguments'])
        expect(toArray(...spy.calls[0].context['arguments'])).toEqual([1, 2])
        expect(spy2.calls[0].arguments).toEqual('hi')
      })
    })
  })
  describe('5.6.5 collecting and filtering', () => {
    const users = [
      { id: 1, name: 'id' },
      { id: 3, name: 'bj' },
      { id: 6, name: 'pj' }
    ]
    const users2 = [
      { id: 1, name: 'id', age: 33 },
      { id: 2, name: 'bj', age: 33 },
      { id: 3, name: 'pj', age: 29 },
      { id: 4, name: 'pj', age: 27 }
    ]
    it('5-58 map and pluck', () => {
      expect(x.pluck(users, 'id')).toEqual([1, 3, 6])
    })
    it('5-60 filter', () => {
      expect(x.reject(users, v => v.id < 5)).toEqual([{ id: 6, name: 'pj' }])
    })
    it('5-61 difference, compact', () => {
      expect(x.difference([1, 2, 1, 0, 3, 1, 4], [0, 1])).toEqual([2, 3, 4])
      expect(x.compact([0, 1, false, 2, '', 3])).toEqual([1, 2, 3])
    })
    it('5-62 group_by', () => {
      expect(x.group_by(users2, u => u.age)).toEqual({
        27: [{ id: 4, name: 'pj', age: 27 }],
        29: [{ id: 3, name: 'pj', age: 29 }],
        33: [
          { id: 1, name: 'id', age: 33 },
          { id: 2, name: 'bj', age: 33 }
        ]
      })
    })
    it('5-63 some', () => {
      expect(x.some([0, 0, 1, 0, 2])).toBe(true)
      expect(x.some([0, 0, 1, 0, 2], v => v > 2)).toBe(false)
    })
    const list = [1, 2, 3, 4, 5, 6]
    it('5-68 strict execution: map->filter', () => {
      expect(_.go(list,
        _.map(v => v * v),
        _.filter(v => v < 20)
      )).toEqual([1, 4, 9, 16])
    })
    it('5-69 lazy execution 3: L.map->L.filter', () => {
      expect(_.go(list,
        L.map(v => v * v),
        L.filter(v => v < 20),
        L.loop((r, v) => r.concat(v), [])
        // L.map(v => v)
      )).toEqual([1, 4, 9, 16])
    })
  })
})

function toArray (...res) {
  return Array.prototype.slice.call(res)
}
