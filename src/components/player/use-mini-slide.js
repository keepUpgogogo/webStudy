import {
  useStore
} from "vuex";
import {
  computed,
  watch,
  ref,
  onMounted,
  onUnmounted,
  nextTick
} from "vue";
import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

BScroll.use(Slide)
export default function () {
  const sliderWrapperRef = ref(null)
  const slider = ref(null)

  const store = useStore()
  const fullScreen = computed(() => store.state.fullScreen)
  const playlist = computed(() => store.state.playlist)
  const currentIndex = computed(() => store.state.currentIndex)

  const sliderShow = computed(() => {
    return !fullScreen.value && !!playlist.value
  })

  onMounted(() => {
    let sliderVal
    watch(sliderShow, async (nweSliderShow) => {
      if (nweSliderShow) {
        await nextTick()
        if (!sliderVal) {
          sliderVal = slider.value = new BScroll(sliderWrapperRef.value, {
            click: true,
            scrollX: true,
            scrollY: false,
            momentum: false,
            bounce: false,
            probeType: 2,
            slide: {
              autoplay: false,
              loop: true
            }
          })
          sliderVal.goToPage(currentIndex.value, 0, 0)
        } else {
          sliderVal.refresh()
        }

        sliderVal.on('slidePageChanged', ({pageX}) => {
          store.commit('setCurrentIndex', pageX)
          store.commit('setPlayingState', true)
        })
        sliderVal.goToPage(currentIndex.value, 0, 0)
      }

    })

    watch(currentIndex, (newIndex) => {

      if (sliderVal && sliderShow.value) {
        sliderVal.goToPage(newIndex, 0, 0)
      }
    })
    watch(playlist,async(newList)=>{
      if(sliderVal&&sliderShow.value &&newList.length){
        await nextTick
        sliderVal.refresh()
      }
    })
  })

  onUnmounted(() => {
    let sliderVal = slider.value
    if (sliderVal) {
      sliderVal.destroy()
    }
  })

  return {
    sliderWrapperRef,
    slider
  }
}
