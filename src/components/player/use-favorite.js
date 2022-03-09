import {
  useStore
} from "vuex";
import {
  computed
} from "vue";
import {
  FAVORITE_KEY
} from "../../assets/js/constant";
import {
  save, remove
} from "../../assets/js/array-store";
export default function () {
  const maxLen = 100
  const store = useStore()
  const favoriteList = computed(() => {
    return store.state.favoriteList
  })

  function getFavoriteIcon(song) {
    return isFavorite(song) ? 'icon-favorite' : "icon-not-favorite"
  }

  function toggleFavorite(song) {
    let list
    if (isFavorite(song)) {
      list = remove(FAVORITE_KEY, compare)
    } else {
      list = save(song, FAVORITE_KEY, compare, maxLen)
    }

    store.commit("setFavoriteList", list)

    function compare(item) {
      return item.id == song.id
    }
  }

  function isFavorite(song) {
    return favoriteList.value.findIndex((item) => {
      return song.id === item.id
    }) > -1
  }

  return {
    getFavoriteIcon,
    toggleFavorite
  }
}
