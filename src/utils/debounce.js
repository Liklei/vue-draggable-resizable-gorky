/*
* debounce
* func [funtion] 需要防抖的函数
* timeout [number] 毫秒，防抖期限值
*/
export function debounce (func, timeout = 50) {
  let timer
  return () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(func, timeout)
  }
}
