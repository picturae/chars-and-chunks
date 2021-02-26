import { dataLockBox } from '../src/dataLockBox'

describe('Context dependemt storage is volatile by design', function() {
  const dataItems = {}

  const itemBox = function(dataItem) {
    return {
      callback: dataItem.callback,
      description: dataItem.description,
    }
  }

  beforeEach(() => {
    document.body.innerHTML = '<header></header><main></main><footer></footer>'

    dataItems.Home = {
      match: 'Home',
      context: document.querySelector('header'),
      callback: function() {
        console.log("'Home' happend!")
      },
      description: "Logs the 'Home' event",
    }

    dataItems.Regex = {
      match: /\w{2,7}/,
      context: document.querySelector('main'),
      callback: function() {
        console.log("'Regex' happend!")
      },
      description: "Logs the 'Regex' event",
    }

    dataItems.F = {
      match: 'F',
      context: document.querySelector('footer'),
      callback: function() {
        console.log("'F' happend!")
      },
      description: "Logs the 'F' event",
    }
  })

  afterEach(() => {
    dataLockBox.reset()
    // destroy every spy
    jest.restoreAllMocks()
  })

  /* Test storage integrity */

  test('Stored data can be retrieved', () => {
    dataLockBox.store(dataItems.Home, itemBox(dataItems.Home))
    const handle = dataLockBox.retrieve({ entry: 'Home' })
    console.log('handle', handle)

    expect(handle.callback).toBe(dataItems.Home.callback)
    expect(handle.description).toBe(dataItems.Home.description)
  })

  test("Storing without 'match' property creates a key with value undefined", () => {
    let noMatchData = dataItems.Home
    delete noMatchData.match
    dataLockBox.store(noMatchData, itemBox(noMatchData))
    const noMatchHandle = dataLockBox.retrieve({ entry: noMatchData.match })

    expect(noMatchHandle.callback).toBe(dataItems.Home.callback)
    expect(noMatchHandle.description).toBe(dataItems.Home.description)
  })

  test("Storing without 'context' property is not allowed", () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    let noContextData = dataItems.Home
    delete noContextData.context
    dataLockBox.store(noContextData, itemBox(noContextData))

    expect(spyConsoleError).toHaveBeenCalled()
  })

  test('Overview creates an array of objects with a valid context', () => {
    dataLockBox.store(dataItems.Home, itemBox(dataItems.Home))
    dataLockBox.store(dataItems.Regex, itemBox(dataItems.Regex))
    dataLockBox.store(dataItems.F, itemBox(dataItems.F))

    dataLockBox.cleanup(dataItems.F.context)
    const records = dataLockBox.overview()

    expect(records.length).toBe(2)
  })

  test('A new page of interaction can be created and discarded', () => {
    dataLockBox.store(dataItems.Home, itemBox(dataItems.Home))
    dataLockBox.store(dataItems.Regex, itemBox(dataItems.Regex))
    const overview0 = dataLockBox.overview()
    dataLockBox.overlay()
    dataLockBox.store(dataItems.F, itemBox(dataItems.F))
    const overviewOverlay = dataLockBox.overview()
    dataLockBox.revive()
    const overviewWithdraw = dataLockBox.overview()

    expect(overview0.length).toBe(2)
    expect(overviewOverlay.length).toBe(1)
    expect(overviewWithdraw).toEqual(overview0)
  })

  test('Retrieve returns the box value of the entry', () => {
    dataLockBox.store(dataItems.Home, itemBox(dataItems.Home))
    const retrievedItem = dataLockBox.retrieve({ entry: 'Home' })

    expect(retrievedItem.callback).toEqual(dataItems.Home.callback)
    expect(retrievedItem.description).toEqual(dataItems.Home.description)
  })

  test('Cleanup invalidates any lock with that context as value', () => {
    dataLockBox.store(dataItems.Regex, itemBox(dataItems.Regex))
    dataLockBox.cleanup(dataItems.Regex.context)
    const retrievedItem = dataLockBox.retrieve({ entry: 'Regex' })

    expect(retrievedItem).toBeFalsy()
  })

  /* Mute / Free */

  test('A hotkey or barcode can temporarily be suppressed and then released again', () => {
    dataLockBox.store(dataItems.Home, itemBox(dataItems.Home))
    dataLockBox.mute('Home')
    const retrieveMute = dataLockBox.retrieve({ entry: 'Home' })

    expect(retrieveMute).toBeFalsy()

    dataLockBox.free('Home')
    const retrieveFree = dataLockBox.retrieve({ entry: 'Home' })

    expect(retrieveFree.callback).toEqual(dataItems.Home.callback)
  })

  test('A hotkey or barcode suppressed is tied to the data set (layer)', () => {
    dataLockBox.store(dataItems.Home, itemBox(dataItems.Home))
    dataLockBox.mute('Home')
    const retrieveMute = dataLockBox.retrieve({ entry: 'Home' })

    expect(retrieveMute).toBeFalsy()

    dataLockBox.overlay()
    dataLockBox.store(dataItems.Home, itemBox(dataItems.Home))
    const retrieveOverlay = dataLockBox.retrieve({ entry: 'Home' })

    expect(retrieveOverlay).toEqual(itemBox(dataItems.Home))

    dataLockBox.revive()
    const retrieveLater = dataLockBox.retrieve({ entry: 'Home' })

    expect(retrieveLater).toBeFalsy()
  })
})
