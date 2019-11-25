import { dataLockBox } from '../src/dataLockBox'

describe('Context dependemt storage is volatile by design', function() {
  let dataItems = {}

  beforeEach(() => {
    document.body.innerHTML = '<header></header><main></main><footer></footer>'

    dataItems.Home = {
      match: 'Home',
      context: document.querySelector('header'),
      box: {
        callback: function() {
          console.log("'Home' happend!")
        },
        comment: "Logs the 'Home' event",
      },
    }

    dataItems.Regex = {
      match: /\w{2,7}/,
      context: document.querySelector('main'),
      box: {
        callback: function() {
          console.log("'Regex' happend!")
        },
        comment: "Logs the 'Regex' event",
      },
    }

    dataItems.F = {
      match: 'F',
      context: document.querySelector('footer'),
      box: {
        callback: function() {
          console.log("'F' happend!")
        },
        comment: "Logs the 'F' event",
      },
    }
  })

  afterEach(() => {
    dataLockBox.reset()
    // destroy every spy
    jest.restoreAllMocks()
  })

  /* Test storoga integrity */

  test('Stored data can be retrieved', () => {
    dataLockBox.store(dataItems.Home)
    const HomeItemHandle = dataLockBox.retrieve({ entry: dataItems.Home.match })

    expect(HomeItemHandle).toBe(dataItems.Home.box)
  })

  test("Storing without 'match' property creates a key with value undefined", () => {
    let noMatchData = dataItems.Home
    delete noMatchData.match
    dataLockBox.store(noMatchData)
    const noMatchHandle = dataLockBox.retrieve({ entry: noMatchData.match })

    expect(noMatchHandle).toBe(noMatchData.box)
  })

  test("Storing without 'context' property is not allowed", () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    let noContextData = dataItems.Home
    delete noContextData.context
    dataLockBox.store(noContextData)

    expect(spyConsoleError).toHaveBeenCalled()
  })

  test("Storing without 'box' property stores a record with value undefined", () => {
    let noBoxData = dataItems.Home
    delete noBoxData.box
    dataLockBox.store(noBoxData)
    const noBoxHandle = dataLockBox.retrieve({ entry: noBoxData.match })

    expect(noBoxHandle).toBe(undefined)
  })

  test('Overview creates an array of objects with a valid context', () => {
    dataLockBox.store(dataItems.Home)
    dataLockBox.store(dataItems.Regex)
    dataLockBox.store(dataItems.F)

    dataLockBox.cleanup(dataItems.F.context)
    const records = dataLockBox.overview()

    expect(records.length).toBe(2)
  })

  test('A new page of interaction can be created and discarded', () => {
    dataLockBox.store(dataItems.Home)
    dataLockBox.store(dataItems.Regex)
    const overview0 = dataLockBox.overview()
    dataLockBox.overlay()
    dataLockBox.store(dataItems.F)
    const overviewOverlay = dataLockBox.overview()
    dataLockBox.revive()
    const overviewWithdraw = dataLockBox.overview()

    expect(overview0.length).toBe(2)
    expect(overviewOverlay.length).toBe(1)
    expect(overviewWithdraw).toEqual(overview0)
  })

  test('Retrieve returns the box value of the entry', () => {
    dataLockBox.store(dataItems.Home)
    const retrievedItem = dataLockBox.retrieve({ entry: 'Home' })

    expect(dataItems.Home.box).toEqual(retrievedItem)
  })

  test('Cleanup invalidates any lock with that context as value', () => {
    dataLockBox.store(dataItems.Regex)
    dataLockBox.cleanup(dataItems.Regex.context)
    const retrievedItem = dataLockBox.retrieve({ entry: 'Regex' })

    expect(retrievedItem).toEqual(undefined)
  })
})
