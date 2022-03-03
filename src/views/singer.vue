<template>
  <index-list
    :data="singers"
    class="singer"
    v-loading="!singers.length"
    @select="selectSinger"
  ></index-list>
  <!-- 路由的动态载入 -->
  <router-view v-slot="{ Component }">
    <transition appear name="slide">
      <component :is="Component" :data="selectedSinger" />
    </transition>
  </router-view>
</template>

<script>
import storage from "good-storage";
import { SINGER_KEY } from "@/assets/js/constant";
import { getSingerList } from "@/service/singer";
import indexList from "@/components/base/index-list/index-list";
export default {
  name: "singer",
  components: { indexList },
  data() {
    return {
      singers: [],
      selectedSinger: null,
    };
  },
  async created() {
    const result = await getSingerList();
    this.singers = result.singers;
  },
  methods: {
    selectSinger(singer) {
      this.selectedSinger = singer;
      this.cacheSinger(singer);
      this.$router.push({
        path: `/Singer/${singer.mid}/`,
      });
    },
    cacheSinger(singer) {
      storage.session.set(SINGER_KEY, singer);
    },
  },
};
</script>

<style lang='scss' scoped>
.singer {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
}
</style>