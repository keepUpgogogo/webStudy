import {
  useStore
} from "vuex"
import {
  computed,
  ref,
  watch
} from "vue"
export default function useCd() {
  const store = useStore()
  const cdRef = ref(null)
  const cdImageRef = ref(null)
  const playing = computed(() => {
    return store.state.playing
  })
  const cdCls = computed(() => {
    return playing.value ? 'playing' : ''
  })

  watch(playing, (newPlaying) => {
    if (!newPlaying) {
      syncTransform(cdRef.value, cdImageRef.value)
    }
  })

  function syncTransform(wrapper, inner) {
    const innerStyle = getComputedStyle(inner).transform
    wrapper.style.transform += innerStyle
  }
  return {
    cdCls,
    cdRef,
    cdImageRef
  }
}
