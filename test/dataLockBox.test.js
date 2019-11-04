import { dataLockBox } from '../src/dataLockBox'

describe('Context dependemt storage is volatile by design', function() {
  let dataItems = {}

  const nodeIsAttached = function(node) {
    return node && node.getRootNode() instanceof Document
  }

  beforeEach(() => {
    document.body.innerHTML = '<header></header><main></main><footer></footer>'

    dataItems.Home = {
      entry: 'Home',
      context: document.querySelector('header'),
      box: {
        callback: function() {
          console.log("'Home' happend!")
        },
        comment: "Logs the 'Home' event",
      },
    }

    dataItems.Regex = {
      entry: /\w{2,7}/,
      context: document.querySelector('main'),
      box: {
        callback: function() {
          console.log("'Regex' happend!")
        },
        comment: "Logs the 'Regex' event",
      },
    }

    dataItems.F = {
      entry: 'F',
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
    const HomeItemHandle = dataLockBox.retrieve({ entry: dataItems.Home.entry })

    expect(HomeItemHandle).toBe(dataItems.Home.box)
  })

  test('Stored data can not be retrieved when the context is invalid', () => {
    dataLockBox.store(dataItems.Home)
    dataItems.Home.context.remove()
    const HomeItemHandle = dataLockBox.retrieve(
      { entry: dataItems.Home.entry },
      nodeIsAttached,
    )

    expect(HomeItemHandle).toBe(undefined)
  })

  test("Storing without 'entry' property creates a key with value undefined", () => {
    let noEntryData = dataItems.Home
    delete noEntryData.entry
    dataLockBox.store(noEntryData)
    const noEntryHandle = dataLockBox.retrieve({ entry: noEntryData.entry })

    expect(noEntryHandle).toBe(noEntryData.box)
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
    const noBoxHandle = dataLockBox.retrieve({ entry: noBoxData.entry })

    expect(noBoxHandle).toBe(undefined)
  })

  test('Overview creates an array of objects with a valid context', () => {
    dataLockBox.store(dataItems.Home)
    dataLockBox.store(dataItems.Regex)
    dataLockBox.store(dataItems.F)

    dataItems.F.context.remove()
    const records = dataLockBox.overview(nodeIsAttached)

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
})
