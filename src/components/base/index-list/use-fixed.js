import {
  ref,
  watch,
  nextTick,
  computed
} from 'vue'

export default function useFixed(props) {
  //拿到DOM节点
  const groupRef = ref(null)
  //存储各标题节点的高度
  const listHeights = ref([])
  //拿到节点的垂直偏移量
  const scrollY = ref(0)
  //得到应该显示的标题节点索引
  const currentIndex = ref(0)
  const TITLE_HEIGHT = 30
  //底部表标题距离顶部的距离
  const distance = ref(0)

  //得到应该显示的标题
  const fixedTitle = computed(() => {
    if (scrollY.value < 0) return ''
    const currentGroup = props.data[currentIndex.value]
    return currentGroup ? currentGroup.title : ''
  })

  //监视原始数据，动态获取高度
  watch(() => props.data, async () => {
    await nextTick()
    calculate()
  })

  
  //拿到每个标题分类元素的高度
  function calculate() {
    //拿到所有的标题节点
    const list = groupRef.value.children
    const listHeightsVal = listHeights.value
    let height = 0

    listHeightsVal.length = 0
    listHeightsVal.push(height)

    for (let i = 0; i < list.length; i++) {
      height += list[i].clientHeight
      listHeightsVal.push(height)
    }
  }
  //滑动时计算应该显示表题元素的索引
  watch(scrollY, (newY) => {
    const listHeightsVal = listHeights.value
    for (let i = 0; i < listHeightsVal.length - 1; i++) {
      const heightTop = listHeightsVal[i]
      const heightBottom = listHeightsVal[i + 1]
      if (newY >= heightTop && newY <= heightBottom) {
        currentIndex.value = i
        distance.value = heightBottom - newY
      }
    }
  })

  //css效果
  const fixedStyle = computed(() => {
    const distanceVal = distance.value
    const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0
    return {
      transform: `translate3d(0,${diff}px,0)`
    }
  })
  


  function onScroll(pos) {
    scrollY.value = -pos.y
  }

  return {
    groupRef,
    onScroll,
    fixedTitle,
    fixedStyle,
    currentIndex
  }
}
