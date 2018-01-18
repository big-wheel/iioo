import chainCall from '../utils/decorator/chain-call'

const testUnits = () => {
  test('@chainCall in class definition', () => {
    @chainCall
    class MyNumber {
      divide() {}
      plus() {}
    }

    const num = new MyNumber()
    expect(num).toEqual(num.plus().divide())
  })

  test('@chainCall in member method', () => {
    class MyNumber {
      @chainCall
      divide() {}

      @chainCall
      plus() {
        return 223
      }

      pow() {
        return 2
      }
    }

    const num = new MyNumber()
    expect(num).toEqual(num.divide())
    expect(num).not.toEqual(num.plus())
    expect(num).not.toEqual(num.pow())
  })

}

describe('chainCall', testUnits)
