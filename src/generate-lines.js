const CASES = {
  NoAxisOverlapping: 'NoAxisOverlapping',
  XAxisProjectionOverlapping: 'XAxisOverlapping',
  YAxisProjectionOverlapping: 'YAxisOverlapping',
  ElementOverlapping: 'ElementOverlapping'
}

/**
 * 计算两元素的重叠状态
 *
 * @param {TheElPosition} activeEl
 * @param {TheElPosition} theRelatedEl
 * @return {string}
 */
function computeOverlappingCase (activeEl, theRelatedEl) {
  // 计算距离，三种情况
  // 1. 两个元素在x，y轴上的投影没有重叠，只计算靠近的两条边的距离
  // 2. 两个元素在X或y轴的投影上有重叠，但是两元素本身没有重叠，
  // 若相对x有投影，要计算两个元素的垂直边的距离，若相对y有投影，要计算两元素水平边的距离
  // 3. 两元素本身有重叠，计算两元素四个边各自相对应的距离
  let theOverlappingCase = CASES.NoAxisOverlapping
  if (!theRelatedEl || !activeEl) {
    return null
  }
  // 判断情况
  // X轴投影重叠
  if (
    computeOverlappingSeg(
      [
        theRelatedEl.offsetLeft,
        theRelatedEl.offsetLeft + theRelatedEl.offsetWidth
      ],
      [activeEl.offsetLeft, activeEl.offsetLeft + activeEl.offsetWidth]
    ) !== null
  ) {
    theOverlappingCase = CASES.XAxisProjectionOverlapping
  }
  // Y轴投影重叠
  if (
    computeOverlappingSeg(
      [
        theRelatedEl.offsetTop,
        theRelatedEl.offsetTop + theRelatedEl.offsetHeight
      ],
      [activeEl.offsetTop, activeEl.offsetTop + activeEl.offsetHeight]
    ) !== null
  ) {
    if (theOverlappingCase === CASES.NoAxisOverlapping) {
      theOverlappingCase = CASES.YAxisProjectionOverlapping
    } else {
      theOverlappingCase = CASES.ElementOverlapping
    }
  }
  return theOverlappingCase
}

/**
 * 计算两条线段重叠的部分，有重叠返回重叠线段，没有重叠返回null
 * @param {[number, number]} seg1
 * @param {[number, number]} seg2
 * @return {[number, number]|null}
 */
const computeOverlappingSeg = (seg1, seg2) => {
  if (seg1[0] >= seg2[1] || seg1[1] <= seg2[0]) {
    return null
  }
  return [...seg1, ...seg2].sort((l, r) => l - r).slice(1, 3)
}

/**
 * 创建ElPosition
 * @class
 * @return {TheElPosition}
 */
function TheElPosition ({ offsetTop, offsetLeft, offsetWidth, offsetHeight }) {
  this.offsetTop = offsetTop
  this.offsetLeft = offsetLeft
  this.offsetWidth = offsetWidth
  this.offsetHeight = offsetHeight
  return this
}

/**
 * 辅助线
 * @class
 * @param {{left: Number, top: Number, lineLength: Number}} params
 * @return {Line}
 */
function Line ({ left, top, lineLength }) {
  this.left = left
  this.top = top
  this.lineLength = lineLength
  return this
}

/**
 * 创建lines
 *
 * @Class
 */
function LinesOfTwoRelatedEl () {
  /**  @type {Line[]} */
  this.ruleVLine = []
  /**  @type {Line[]} */
  this.ruleHLine = []
  /**  @type {Line[]} */
  this.dashedVLine = []
  /**  @type {Line[]} */
  this.dashedHLine = []

  return this
}

/**
 * 间距线
 */
function GapLinesOfTwoRelatedEl () {
  /**  @type {Line[]} */
  this.gapVLine = []
  /**  @type {Line[]} */
  this.gapHLine = []
}

/**
 * 无投影重叠的计算
 *
 * @param {TheElPosition} activeEl
 * @param {TheElPosition} theRelatedEl
 * @return {LinesOfTwoRelatedEl}
 */
const genLinesForNoAxisOverlapping = (
  activeEl,
  theRelatedEl,
  specificLinesContainer
) => {
  const lines = specificLinesContainer || new LinesOfTwoRelatedEl()
  const ruleValue = {
    top:
      activeEl.offsetTop - (theRelatedEl.offsetTop + theRelatedEl.offsetHeight),
    bottom: activeEl.offsetTop + activeEl.offsetHeight - theRelatedEl.offsetTop,
    left:
      activeEl.offsetLeft -
      (theRelatedEl.offsetLeft + theRelatedEl.offsetWidth),
    right: activeEl.offsetLeft + activeEl.offsetWidth - theRelatedEl.offsetLeft
  }
  // 找绝对距离最短的水平与垂直计算结果
  const horizontalLineFromLeftSide =
    Math.abs(ruleValue.left) < Math.abs(ruleValue.right)
  const verticalLineFromTopSide =
    Math.abs(ruleValue.top) < Math.abs(ruleValue.bottom)
  if (horizontalLineFromLeftSide) {
    // 从左侧边出发做辅助线
    lines.ruleHLine = [
      new Line({
        left: activeEl.offsetLeft - Math.abs(ruleValue.left),
        top: activeEl.offsetTop + activeEl.offsetHeight / 2,
        lineLength: Math.abs(ruleValue.left)
      })
    ]
  } else {
    // 从右侧边出发做辅助线
    lines.ruleHLine = [
      new Line({
        left: activeEl.offsetLeft + activeEl.offsetWidth,
        top: activeEl.offsetTop + activeEl.offsetHeight / 2,
        lineLength: Math.abs(ruleValue.right)
      })
    ]
  }
  if (verticalLineFromTopSide) {
    // 从上边出发
    lines.ruleVLine = [
      new Line({
        top: activeEl.offsetTop - Math.abs(ruleValue.top),
        left: activeEl.offsetLeft + activeEl.offsetWidth / 2,
        lineLength: Math.abs(ruleValue.top)
      })
    ]
  } else {
    // 从下边
    lines.ruleVLine = [
      new Line({
        top: activeEl.offsetTop + activeEl.offsetHeight,
        left: activeEl.offsetLeft + activeEl.offsetWidth / 2,
        lineLength: Math.abs(ruleValue.bottom)
      })
    ]
  }
  lines.ruleHLine.forEach((hl) => {
    lines.dashedVLine = [
      new Line({
        left: hl.left + (horizontalLineFromLeftSide ? 0 : hl.lineLength),
        top:
          hl.top -
          (verticalLineFromTopSide
            ? hl.top - (theRelatedEl.offsetTop + theRelatedEl.offsetHeight)
            : 0),
        lineLength: Math.abs(
          verticalLineFromTopSide
            ? hl.top - (theRelatedEl.offsetTop + theRelatedEl.offsetHeight)
            : hl.top - theRelatedEl.offsetTop
        )
      })
    ]
  })
  lines.ruleVLine.forEach((vl) => {
    lines.dashedHLine = [
      new Line({
        left:
          vl.left -
          (horizontalLineFromLeftSide
            ? vl.left - (theRelatedEl.offsetLeft + theRelatedEl.offsetWidth)
            : 0),
        top: vl.top + (verticalLineFromTopSide ? 0 : vl.lineLength),
        lineLength: Math.abs(
          horizontalLineFromLeftSide
            ? vl.left - (theRelatedEl.offsetLeft + theRelatedEl.offsetWidth)
            : vl.left - theRelatedEl.offsetLeft
        )
      })
    ]
  })
  return lines
}

/**
 * x投影重叠的计算
 *
 * @param {TheElPosition} activeEl
 * @param {TheElPosition} theRelatedEl
 * @return {LinesOfTwoRelatedEl}
 */
const genLinesForXAxisProjectionOverlapping = (
  activeEl,
  theRelatedEl,
  specificLinesContainer
) => {
  const lines = specificLinesContainer || new LinesOfTwoRelatedEl()
  const overlappingSegment = computeOverlappingSeg(
    [activeEl.offsetLeft, activeEl.offsetLeft + activeEl.offsetWidth],
    [
      theRelatedEl.offsetLeft,
      theRelatedEl.offsetLeft + theRelatedEl.offsetWidth
    ]
  )
  const ruleValue = {
    top:
      activeEl.offsetTop - (theRelatedEl.offsetTop + theRelatedEl.offsetHeight),
    bottom: activeEl.offsetTop + activeEl.offsetHeight - theRelatedEl.offsetTop,
    left: activeEl.offsetLeft - theRelatedEl.offsetLeft,
    right:
      activeEl.offsetLeft +
      activeEl.offsetWidth -
      (theRelatedEl.offsetLeft + theRelatedEl.offsetWidth)
  }
  const isVerticalLineFromTop =
    Math.abs(ruleValue.top) < Math.abs(ruleValue.bottom)
  // 重叠部分的距离线
  lines.ruleVLine = [
    new Line({
      left: overlappingSegment.reduce((all, num) => all + num, 0) / 2,
      top: isVerticalLineFromTop
        ? activeEl.offsetTop - Math.abs(ruleValue.top)
        : activeEl.offsetTop + activeEl.offsetHeight,
      lineLength: Math.abs(
        isVerticalLineFromTop ? ruleValue.top : ruleValue.bottom
      )
    })
  ]
  if (ruleValue.left !== 0) {
    lines.ruleHLine.push(
      new Line({
        left:
          ruleValue.left > 0
            ? activeEl.offsetLeft - ruleValue.left
            : theRelatedEl.offsetLeft + ruleValue.left,
        top:
          ruleValue.left > 0
            ? activeEl.offsetTop + activeEl.offsetHeight / 2
            : theRelatedEl.offsetTop + theRelatedEl.offsetHeight / 2,
        lineLength: Math.abs(ruleValue.left)
      })
    )
  }
  if (ruleValue.right !== 0) {
    lines.ruleHLine.push(
      new Line({
        left:
          ruleValue.right < 0
            ? activeEl.offsetLeft + activeEl.offsetWidth
            : theRelatedEl.offsetLeft + theRelatedEl.offsetWidth,
        top:
          ruleValue.right < 0
            ? activeEl.offsetTop + activeEl.offsetHeight / 2
            : theRelatedEl.offsetTop + theRelatedEl.offsetHeight / 2,
        lineLength: Math.abs(ruleValue.right)
      })
    )
  }
  lines.ruleHLine.forEach((ruleLine, lineIndex) => {
    const lineName = ['left', 'right'][lineIndex]
    if (lineName === 'left') {
      const lineLength =
        Math.abs(isVerticalLineFromTop ? ruleValue.top : ruleValue.bottom) +
        (ruleValue.left > 0
          ? activeEl.offsetHeight
          : theRelatedEl.offsetHeight) /
          2
      lines.dashedVLine.push(
        new Line({
          left: ruleLine.left,
          top:
            ruleValue.left > 0
              ? isVerticalLineFromTop
                ? ruleLine.top - lineLength
                : ruleLine.top
              : isVerticalLineFromTop
                ? ruleLine.top
                : ruleLine.top - lineLength,
          lineLength
        })
      )
    }
    if (lineName === 'right') {
      const lineLength =
        Math.abs(isVerticalLineFromTop ? ruleValue.top : ruleValue.bottom) +
        (ruleValue.right > 0
          ? theRelatedEl.offsetHeight
          : activeEl.offsetHeight) /
          2
      lines.dashedVLine.push(
        new Line({
          left: ruleLine.left + ruleLine.lineLength,
          top:
            ruleValue.right > 0
              ? isVerticalLineFromTop
                ? ruleLine.top
                : ruleLine.top - lineLength
              : isVerticalLineFromTop
                ? ruleLine.top - lineLength
                : ruleLine.top,
          lineLength
        })
      )
    }
  })
  return lines
}

/**
 * y投影重叠的计算
 *
 * @param {TheElPosition} activeEl
 * @param {TheElPosition} theRelatedEl
 * @return {LinesOfTwoRelatedEl}
 */
const genLinesForYAxisProjectionOverlapping = (
  activeEl,
  theRelatedEl,
  specificLinesContainer
) => {
  const lines = specificLinesContainer || new LinesOfTwoRelatedEl()
  const overlappingSegment = computeOverlappingSeg(
    [activeEl.offsetTop, activeEl.offsetTop + activeEl.offsetHeight],
    [theRelatedEl.offsetTop, theRelatedEl.offsetTop + theRelatedEl.offsetHeight]
  )
  const ruleValue = {
    top: activeEl.offsetTop - theRelatedEl.offsetTop,
    bottom:
      activeEl.offsetTop +
      activeEl.offsetHeight -
      (theRelatedEl.offsetTop + theRelatedEl.offsetHeight),
    left:
      activeEl.offsetLeft -
      (theRelatedEl.offsetLeft + theRelatedEl.offsetWidth),
    right: activeEl.offsetLeft + activeEl.offsetWidth - theRelatedEl.offsetLeft
  }
  const isHorizontalLineFromLeft =
    Math.abs(ruleValue.left) < Math.abs(ruleValue.right)
  // 重叠部分的距离线
  if (
    Math.abs(isHorizontalLineFromLeft ? ruleValue.left : ruleValue.right) !== 0
  ) {
    lines.ruleHLine = [
      new Line({
        top: overlappingSegment.reduce((all, num) => all + num, 0) / 2,
        left: isHorizontalLineFromLeft
          ? activeEl.offsetLeft - Math.abs(ruleValue.left)
          : activeEl.offsetLeft + activeEl.offsetWidth,
        lineLength: Math.abs(
          isHorizontalLineFromLeft ? ruleValue.left : ruleValue.right
        )
      })
    ]
  }
  if (ruleValue.top !== 0) {
    lines.ruleVLine.push(
      new Line({
        top:
          ruleValue.top > 0
            ? activeEl.offsetTop - ruleValue.top
            : theRelatedEl.offsetTop + ruleValue.top,
        left:
          ruleValue.top > 0
            ? activeEl.offsetLeft + activeEl.offsetWidth / 2
            : theRelatedEl.offsetLeft + theRelatedEl.offsetWidth / 2,
        lineLength: Math.abs(ruleValue.top)
      })
    )
  }
  if (ruleValue.bottom !== 0) {
    lines.ruleVLine.push(
      new Line({
        top:
          ruleValue.bottom < 0
            ? activeEl.offsetTop + activeEl.offsetHeight
            : theRelatedEl.offsetTop + theRelatedEl.offsetHeight,
        left:
          ruleValue.bottom < 0
            ? activeEl.offsetLeft + activeEl.offsetWidth / 2
            : theRelatedEl.offsetLeft + theRelatedEl.offsetWidth / 2,
        lineLength: Math.abs(ruleValue.bottom)
      })
    )
  }
  lines.ruleVLine.forEach((ruleLine, lineIndex) => {
    const lineName = ['top', 'bottom'][lineIndex]
    if (lineName === 'top') {
      const lineLength =
        Math.abs(isHorizontalLineFromLeft ? ruleValue.left : ruleValue.right) +
        (ruleValue.top > 0 ? activeEl.offsetWidth : theRelatedEl.offsetWidth) /
          2
      lines.dashedHLine.push(
        new Line({
          top: ruleLine.top,
          left:
            ruleValue.top > 0
              ? isHorizontalLineFromLeft
                ? ruleLine.left - lineLength
                : ruleLine.left
              : isHorizontalLineFromLeft
                ? ruleLine.left
                : ruleLine.left - lineLength,
          lineLength
        })
      )
    }
    if (lineName === 'bottom') {
      const lineLength =
        Math.abs(isHorizontalLineFromLeft ? ruleValue.left : ruleValue.right) +
        (ruleValue.bottom > 0
          ? theRelatedEl.offsetWidth
          : activeEl.offsetWidth) /
          2
      lines.dashedHLine.push(
        new Line({
          top: ruleLine.top + ruleLine.lineLength,
          left:
            ruleValue.bottom > 0
              ? isHorizontalLineFromLeft
                ? ruleLine.left
                : ruleLine.left - lineLength
              : isHorizontalLineFromLeft
                ? ruleLine.left - lineLength
                : ruleLine.left,
          lineLength
        })
      )
    }
  })
  return lines
}

/**
 * 计算水平间距线，两个元素必须仅有y轴投影
 *
 * @param {TheElPosition} activeEl
 * @param {TheElPosition} theRelatedEl
 * @return {GapLinesOfTwoRelatedEl}
 */
const genGapLinesForHorizontalDir = (
  activeEl,
  theRelatedEl,
  specificLinesContainer
) => {
  /** @constant {GapLinesOfTwoRelatedEl} lines */
  const lines = specificLinesContainer || new GapLinesOfTwoRelatedEl()
  const overlappingCase = computeOverlappingCase(activeEl, theRelatedEl)
  if (overlappingCase !== CASES.YAxisProjectionOverlapping) {
    lines.gapHLine = []
    return lines
  }
  // 用数组的顺序表示两元素在布局中的左右关系，0下标的元素在左边，1下标的元素在右边
  const twoEL = [activeEl, theRelatedEl]
  if (activeEl.offsetLeft > theRelatedEl.offsetLeft) {
    twoEL.reverse()
  }
  const overlappingSegment = computeOverlappingSeg(
    [activeEl.offsetTop, activeEl.offsetTop + activeEl.offsetHeight],
    [theRelatedEl.offsetTop, theRelatedEl.offsetTop + theRelatedEl.offsetHeight]
  )
  lines.gapHLine = [
    new Line({
      left: twoEL[0].offsetLeft + twoEL[0].offsetWidth,
      top: overlappingSegment.reduce((all, num) => all + num, 0) / 2,
      lineLength:
        twoEL[1].offsetLeft - (twoEL[0].offsetLeft + twoEL[0].offsetWidth)
    })
  ]
  return lines
}

/**
 * 计算垂直间距线
 *
 * @param {TheElPosition} activeEl
 * @param {TheElPosition} theRelatedEl
 * @return {GapLinesOfTwoRelatedEl}
 */
const genGapLinesForVerticalDir = (
  activeEl,
  theRelatedEl,
  specificLinesContainer
) => {
  /** @constant {GapLinesOfTwoRelatedEl} lines */
  const lines = specificLinesContainer || new GapLinesOfTwoRelatedEl()
  const overlappingCase = computeOverlappingCase(activeEl, theRelatedEl)
  if (overlappingCase !== CASES.XAxisProjectionOverlapping) {
    lines.gapVLine = []
    return lines
  }
  // 用数组的顺序表示两元素在布局中的上下关系，0下标的元素在上，1下标的元素在下边
  const twoEL = [activeEl, theRelatedEl]
  if (activeEl.offsetTop > theRelatedEl.offsetTop) {
    twoEL.reverse()
  }
  const overlappingSegment = computeOverlappingSeg(
    [activeEl.offsetLeft, activeEl.offsetLeft + activeEl.offsetWidth],
    [
      theRelatedEl.offsetLeft,
      theRelatedEl.offsetLeft + theRelatedEl.offsetWidth
    ]
  )
  lines.gapVLine = [
    new Line({
      top: twoEL[0].offsetTop + twoEL[0].offsetHeight,
      left: overlappingSegment.reduce((all, num) => all + num, 0) / 2,
      lineLength:
        twoEL[1].offsetTop - (twoEL[0].offsetTop + twoEL[0].offsetHeight)
    })
  ]
  return lines
}

/**
 * 获取元素的位置
 * @param {HTMLElement} theSrcEl
 * @returns {TheElPosition}
 */
const getElPosition = (theSrcEl) => {
  const leftTop = theSrcEl.style.transform
    ? (theSrcEl.style.transform
      .match(/^translate\((\d+)px,\s(\d+)px\)$/) || [0, 0, 0])
      .slice(1)
    : [theSrcEl.offsetLeft, theSrcEl.offsetTop]
  const theSrcElPosition = {
    offsetHeight: theSrcEl.offsetHeight,
    offsetWidth: theSrcEl.offsetWidth,
    offsetLeft: parseInt(leftTop[0]),
    offsetTop: parseInt(leftTop[1])
  }
  return theSrcElPosition
}

/**
 * 某一个元素附属的辅助线信息
 * @class
 * @return {ActiveElLineStore}
 */
function ActiveElLineStore () {
  this.lines = new LinesOfTwoRelatedEl()
  this.gapLines = new GapLinesOfTwoRelatedEl()
  this.activeElPosition = null
  this.targetElPosition = null
  return this
}

/**
 * 获取两元素的位置关系
 * @returns {string}
 */
ActiveElLineStore.prototype.getCurrentOverlappingCase = function () {
  const theRelatedEl = this.targetElPosition
  const activeEl = this.activeElPosition
  return computeOverlappingCase(activeEl, theRelatedEl)
}

/**
 * 存储管理
 * @class
 * @return {ActiveElMapLinesManager}
 */
function ActiveElMapLinesManager () {
  this.cachedActiveEls = new WeakMap()
  return this
}

/**
 * 获取目标元素距离最近的间距线
 * @param {HTMLElement} targetEl 目标元素
 * @param {[]HTMLElement} allEls 所有元素
 * @returns {
 *  {
 *    gapHLine: Line
 *    gapVLine: Line
 *    gapEl: Element
 *  }
 * }
 */
ActiveElMapLinesManager.prototype.getMostCloseGapLineOfEl = function (targetEl, allEls) {
  const excludeEls = [targetEl]
  const targetElCachedLines = this.cachedActiveEls.get(targetEl)
  const includeEls = allEls.filter(el => !excludeEls.includes(el))
  return includeEls.reduce((ret, el) => {
    const curGapLines = targetElCachedLines.get(el).gapLines
    const curGap = {
      gapHLine: curGapLines.gapHLine[0],
      gapVLine: curGapLines.gapVLine[0]
    }
    if (ret === null) {
      return curGap
    }
    if (curGap.gapHLine && (!ret.gapHLine || ret.gapHLine.lineLength > curGap.gapHLine.lineLength)) {
      ret.gapHLine = curGap.gapHLine
    }
    if (curGap.gapVLine && (!ret.gapVLine || ret.gapVLine.lineLength > curGap.gapVLine.lineLength)) {
      ret.gapVLine = curGap.gapVLine
    }
    ret['gapEl'] = el
    return ret
  }, null)
}

/**
 * 获取匹配距离值的间距线
 * @param {number} gapValue 距离值
 * @param {[]HTMLElement} allEls 所有元素
 * @param {number} tolerance 所有元素
 * @returns {
 *  {
 *    gapHLine: [],
 *    gapVLine: []
 *  }
 * }
 */
ActiveElMapLinesManager.prototype.getMatchedGaps = function (gapValue, allEls, tolerance = 2) {
  let timer = null
  // 计算最近的值
  return new Promise((resolve, reject) => {
    if (timer) return
    timer = setTimeout(() => {
      const walked = new WeakSet()
      const ret = {
        gapHLine: [],
        gapVLine: []
      }
      allEls.forEach((el) => {
        const curElLines = this.cachedActiveEls.get(el)
        walked.add(el)
        allEls.forEach(el => {
          if (!walked.has(el)) {
            const lines = curElLines.get(el)
            const HLine = lines.gapLines.gapHLine[0]
            const VLine = lines.gapLines.gapVLine[0]
            if (HLine && Math.abs(HLine.lineLength - gapValue) < tolerance) {
              ret.gapHLine.push(HLine)
            }
            if (VLine && Math.abs(VLine.lineLength - gapValue) < tolerance) {
              ret.gapVLine.push(VLine)
            }
          }
        })
      })
      clearTimeout(timer)
      resolve(ret)
    }, 100)
  })
}

/**
 * 计算所有有垂直/水平投影关系的元素彼此间的间距
 * @param {HTMLElement[]} allEls 所有元素
 * @param {HTMLElement|undefined} theActiveEl 被移动的元素
 */
ActiveElMapLinesManager.prototype.computeGapLines = function (
  allEls
) {
  /**
   * 计算间距线
   * @param {HTMLElement} activeEl
   * @param {HTMLElement} theRelatedEl
   * @returns
  */
  const computeGap = (activeEl, theRelatedEl) => {
    if (!activeEl || !theRelatedEl) {
      return new ActiveElLineStore()
    }
    if (!this.cachedActiveEls.get(activeEl)) {
      this.cachedActiveEls.set(activeEl, new WeakMap())
    }
    const subMap = this.cachedActiveEls.get(activeEl)
    if (!subMap.get(theRelatedEl)) {
      subMap.set(theRelatedEl, new ActiveElLineStore())
    }
    /** @type {ActiveElLineStore} store */
    const store = subMap.get(theRelatedEl)
    store.activeElPosition = getElPosition(activeEl)
    store.targetElPosition = getElPosition(theRelatedEl)
    // 计算水平方向上的距离线
    genGapLinesForHorizontalDir(
      store.activeElPosition,
      store.targetElPosition,
      store.gapLines
    )
    // 计算垂直方向上的距离线
    genGapLinesForVerticalDir(
      store.activeElPosition,
      store.targetElPosition,
      store.gapLines
    )
  }
  allEls.forEach((activeEl, outIndex) => {
    let loopCount = 1
    while (outIndex + loopCount < allEls.length) {
      const theRelatedEl = allEls[outIndex + loopCount]
      computeGap(activeEl, theRelatedEl)
      computeGap(theRelatedEl, activeEl)
      loopCount += 1
    }
  })
}

/**
 * 计算主要辅助线
 * @param {HTMLElement} activeEl 活动元素
 * @param {HTMLElement} theRelatedEl 相对元素
 * @returns
 */
ActiveElMapLinesManager.prototype.computeLines = function (
  activeEl,
  theRelatedEl
) {
  console.log('computeLines', activeEl, theRelatedEl)
  if (!activeEl || !theRelatedEl) {
    return new ActiveElLineStore()
  }
  if (!this.cachedActiveEls.get(activeEl)) {
    this.cachedActiveEls.set(activeEl, new WeakMap())
  }
  const subMap = this.cachedActiveEls.get(activeEl)
  if (!subMap.get(theRelatedEl)) {
    subMap.set(theRelatedEl, new ActiveElLineStore())
  }
  /** @type {ActiveElLineStore} store */
  const store = subMap.get(theRelatedEl)
  store.activeElPosition = getElPosition(activeEl)
  store.targetElPosition = getElPosition(theRelatedEl)
  const overlappingCase = store.getCurrentOverlappingCase()
  store.lines = new LinesOfTwoRelatedEl()
  if (overlappingCase === CASES.NoAxisOverlapping) {
    genLinesForNoAxisOverlapping(
      store.activeElPosition,
      store.targetElPosition,
      store.lines
    )
  }
  if (overlappingCase === CASES.XAxisProjectionOverlapping) {
    genLinesForXAxisProjectionOverlapping(
      store.activeElPosition,
      store.targetElPosition,
      store.lines
    )
  }
  if (overlappingCase === CASES.YAxisProjectionOverlapping) {
    genLinesForYAxisProjectionOverlapping(
      store.activeElPosition,
      store.targetElPosition,
      store.lines
    )
  }
  return store.lines
}

export default {
  LinesOfTwoRelatedEl,
  ActiveElMapLinesManager
}
