import BScroll from '@better-scroll/core'
import ObserveDOM from '@better-scroll/observe-dom'
import {
  onMounted,
  onUnmounted,
  ref
} from 'vue'
BScroll.use(ObserveDOM)
export default function (wrapperRef, options) {
  const scroll = ref(null)
  onMounted(() => {
    scroll.value = new BScroll(wrapperRef.value, {
      observeDOM: true,
      ...options
    })
  })
  onUnmounted(() => {
    scroll.value.destroy()
  })
}
