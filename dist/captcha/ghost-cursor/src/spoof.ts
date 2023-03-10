import { ElementHandle, Page, BoundingBox } from 'puppeteer'
import { Vector, bezierCurve, direction, magnitude, origin, overshoot } from './math'
export { default as installMouseHelper } from './mouse-helper'

interface BoxOptions { readonly paddingPercentage: number }
interface MoveOptions extends BoxOptions { readonly iframe?: string, readonly waitForIframe?: boolean, readonly waitForSelector: boolean }
interface ClickOptions extends MoveOptions { readonly waitForClick: number }
export interface GhostCursor {
  toggleRandomMove: (random: boolean) => void
  click: (selector?: string | ElementHandle, options?: ClickOptions) => Promise<void>
  move: (selector: string | ElementHandle, options?: MoveOptions) => Promise<void>
  moveTo: (destination: Vector) => Promise<void>
}

// Define some missing (hidden) types in Puppeteer
declare module 'puppeteer' {
  interface Page {
    _client: {
      send: (name: string, params: {}) => Promise<any>
    }
  }

  interface Target {
    _targetId: string
  }

  interface ElementHandle {
    _remoteObject: {
      objectId: string
    }
  }

  interface ExecutionContext {
    frame: () => Frame
  }
}

// Helper function to wait a specified number of milliseconds
const delay = async (ms: number): Promise<void> => await new Promise(resolve => setTimeout(resolve, ms))

/**
 * Calculate the amount of time needed to move from (x1, y1) to (x2, y2)
 * given the width of the element being clicked on
 * https://en.wikipedia.org/wiki/Fitts%27s_law
 */
const fitts = (distance: number, width: number): number => {
  const a = 0
  const b = 2
  const id = Math.log2(distance / width + 1)
  return a + b * id
}

// Get a random point on a box
const getRandomBoxPoint = ({ x, y, width, height }: BoundingBox, options?: BoxOptions): Vector => {
  let paddingWidth = 0; let paddingHeight = 0

  if (options?.paddingPercentage !== undefined && options?.paddingPercentage > 0 && options?.paddingPercentage < 100) {
    paddingWidth = width * options.paddingPercentage / 100
    paddingHeight = height * options.paddingPercentage / 100
  }

  return {
    x: x + (paddingWidth / 2) + Math.random() * (width - paddingWidth),
    y: y + (paddingHeight / 2) + Math.random() * (height - paddingHeight)
  }
}

// Get a random point on a browser window
export const getRandomPagePoint = async (page: Page): Promise<Vector> => {
  const targetId: string = page.target()._targetId
  const window = await page._client.send('Browser.getWindowForTarget', { targetId })
  return getRandomBoxPoint({ x: origin.x, y: origin.y, width: window.bounds.width, height: window.bounds.height })
}

// Using this method to get correct position of Inline elements (elements like <a>)
const getElementBox = async (page: Page, element: ElementHandle, relativeToMainFrame: boolean = true): Promise<BoundingBox | null> => {
  if (element._remoteObject.objectId === undefined) {
    return null
  }
  let quads
  try {
    quads = await page._client.send('DOM.getContentQuads', {
      objectId: element._remoteObject.objectId
    })
  } catch (_) {
    console.debug('Quads not found, trying regular boundingBox')
    return await element.boundingBox()
  }
  const elementBox = {
    x: quads.quads[0][0],
    y: quads.quads[0][1],
    width: quads.quads[0][4] - quads.quads[0][0],
    height: quads.quads[0][5] - quads.quads[0][1]
  }

  if (elementBox === null) {
    return null
  }
  if (!relativeToMainFrame) {
    const elementFrame = element.executionContext().frame()
    const iframes = await elementFrame.parentFrame()?.$x('//iframe')
    let frame: ElementHandle | undefined
    if (iframes != null) {
      for (const iframe of iframes) {
        if ((await iframe.contentFrame()) === elementFrame) frame = iframe
      }
    }
    if (frame !== undefined) {
      const boundingBox = await frame.boundingBox()
      elementBox.x = boundingBox !== null ? elementBox.x - boundingBox.x : elementBox.x
      elementBox.y = boundingBox !== null ? elementBox.y - boundingBox.y : elementBox.y
    }
  }
  return elementBox
}

export function path (point: Vector, target: Vector, spreadOverride?: number)
export function path (point: Vector, target: BoundingBox, spreadOverride?: number)
export function path (start: Vector, end: BoundingBox | Vector, spreadOverride?: number): Vector[] {
  const defaultWidth = 100
  const minSteps = 25
  const width = 'width' in end ? end.width : defaultWidth
  const curve = bezierCurve(start, end, spreadOverride)
  const length = curve.length() * 0.8
  const baseTime = Math.random() * minSteps
  const steps = Math.ceil((Math.log2(fitts(length, width) + 1) + baseTime) * 3)
  const re = curve.getLUT(steps)
  return clampPositive(re)
}

const clampPositive = (vectors: Vector[]): Vector[] => {
  const clamp0 = (elem: number): number => Math.max(0, elem)
  return vectors.map(vector => {
    return {
      x: clamp0(vector.x),
      y: clamp0(vector.y)
    }
  })
}

const overshootThreshold = 500
const shouldOvershoot = (a: Vector, b: Vector): boolean => magnitude(direction(a, b)) > overshootThreshold

export const createCursor = (page: Page, start: Vector = origin, performRandomMoves: boolean = false): GhostCursor => {
  // this is kind of arbitrary, not a big fan but it seems to work
  const overshootSpread = 10
  const overshootRadius = 120
  let previous: Vector = start

  // Initial state: mouse is not moving
  let moving: boolean = false

  // Move the mouse over a number of vectors
  const tracePath = async (vectors: Iterable<Vector>, abortOnMove: boolean = false): Promise<void> => {
    for (const v of vectors) {
      try {
        // In case this is called from random mouse movements and the users wants to move the mouse, abort
        if (abortOnMove && moving) {
          return
        }
        await delay(Math.random() * 25)
        await page.mouse.move(v.x, v.y)
        previous = v
      } catch (error) {
        // Exit function if the browser is no longer connected
        if (!page.browser().isConnected()) return

        console.debug('Warning: could not move mouse, error message:', error)
      }
    }
  }

  // Start random mouse movements. Function recursively calls itself
  const randomMove = async (): Promise<void> => {
    try {
      if (!moving) {
        const rand = await getRandomPagePoint(page)
        await tracePath(path(previous, rand), true)
        previous = rand
      }
      await delay(Math.random() * 2000) // wait max 2 seconds
      randomMove().then(_ => { }, _ => { }) // fire and forget, recursive function
    } catch (_) {
      console.debug('Warning: stopping random mouse movements')
    }
  }

  const actions: GhostCursor = {
    toggleRandomMove (random: boolean): void {
      moving = !random
    },

    async click (selector?: string | ElementHandle, options?: ClickOptions): Promise<void> {

      actions.toggleRandomMove(false)

      if (selector !== undefined) {
        await actions.move(selector, options)
        actions.toggleRandomMove(false)
      }

      try {
        await page.mouse.down()
        if (options?.waitForClick !== undefined) {
          await delay(options.waitForClick)
        }
        await page.mouse.up()
      } catch (error) {
        console.debug('Warning: could not click mouse, error message:', error)
      }

      await delay(Math.random() * 2000)
      actions.toggleRandomMove(true)
    },
    async move (selector: string | ElementHandle, options: MoveOptions): Promise<void> {
      actions.toggleRandomMove(false)
      let elem: ElementHandle | null = null
      if (typeof selector === 'string') {
          let frame = page
          
          if (options.iframe) {
            if (options.waitForIframe) {
                await page.waitForSelector(options.iframe);
            }
            const contentIframe = await page.$(options.iframe);
            const contentFrame = await contentIframe?.contentFrame();
            frame = contentFrame;
          }

          if (options.waitForSelector) {
              await frame.waitForSelector(selector);
          }
          
          elem = await frame.$(selector);

      } else {
        elem = selector
      }

      // Make sure the object is in view
      if (elem._remoteObject?.objectId !== undefined) {
        try {
          await page._client.send('DOM.scrollIntoViewIfNeeded', {
            objectId: elem._remoteObject.objectId
          })
        } catch (_) { // use regular JS scroll method as a fallback
          await elem.evaluate(e => e.scrollIntoView())
        }
      }
      const box = await getElementBox(page, elem, true)
      if (box === null) {
        throw new Error("Could not find the dimensions of the element you're clicking on, this might be a bug?")
      }
      const { height, width } = box
      const destination = getRandomBoxPoint(box, options)
      const dimensions = { height, width }
      const overshooting = false
      const to = overshooting ? overshoot(destination, overshootRadius) : destination
      await tracePath(path(previous, to))

      if (overshooting) {
        const correction = path(to, { ...dimensions, ...destination }, overshootSpread)

        await tracePath(correction)
      }
      previous = destination

      actions.toggleRandomMove(true)
    },
    async moveTo (destination: Vector): Promise<void> {
      actions.toggleRandomMove(false)
      await tracePath(path(previous, destination))
      actions.toggleRandomMove(true)
    }
  }

  // Start random mouse movements. Do not await the promise but return immediately
  if (performRandomMoves) randomMove().then(_ => { }, _ => { })

  return actions
}
