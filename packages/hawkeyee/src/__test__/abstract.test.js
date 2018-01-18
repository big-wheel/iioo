import abstract from '../utils/decorator/abstract'

const testUnits = () => {
  test('@abstract in class definition', () => {
    @abstract
    class MyNumber {
      divide() {}
      plus() {}
    }

    expect(() => new MyNumber().divide()).toThrow(/abstract/)
    expect(() => new MyNumber().plus()).toThrow(/abstract/)
  })

  test('@abstract in member method', () => {
    class MyNumber {
      @abstract
      divide() {}

      @abstract
      plus() {}

      pow() {
        return 2
      }
    }
    expect(() => new MyNumber().divide()).toThrow(/abstract/)
    expect(() => new MyNumber().plus()).toThrow(/abstract/)
    expect(new MyNumber().pow()).toEqual(2)
  })

  test('@abstract in error use', () => {
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      class MyNumber {
        @abstract
        divide = 2

        pow() {
          return 2
        }
      }
    }).toThrow(Error)


  })
}

describe('abstract', () => {
  if (typeof Reflect !== 'undefined') {
    describe('abstract in the env has Reflect', testUnits)
  }

  global.Reflect = undefined
  describe('abstract in the env hasn\'t Reflect', testUnits)
})
