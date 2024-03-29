export default {
  arrayMove (arr, oldIndex, newIndex) {
    if (newIndex >= arr.length) {
      let k = newIndex - arr.length + 1
      while (k--) {
        arr.push(undefined)
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0])
    return arr // for testing, arr was modified inplace
  },
  duplicate (arr, e) {
    const i = arr.indexOf(e)
    const e2 = JSON.parse(JSON.stringify(e))
    arr.splice(i + 1, 0, e2)
    return e2
  },
  remove (arr, e) {
    const i = arr.indexOf(e)
    arr.splice(i, 1)
  },
  moveUp (arr, e) {
    const i = arr.indexOf(e)
    if (i - 1 >= 0) {
      this.arrayMove(arr, i, i - 1)
    }
  },
  moveDown (arr, e) {
    const i = arr.indexOf(e)
    if (i + 1 <= arr.length) {
      this.arrayMove(arr, i, i + 1)
    }
  }
}
