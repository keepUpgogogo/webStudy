<template>
  <index-list
    :data="singers"
    class="singer"
    v-loading="!singers.length"
    @select="selectSinger"
  ></index-list>
  <router-view :singer="selectedSinger"></router-view>
</template>

<script>
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
      this.$router.push({
        path: `/Singer/${singer.mid}/`,
      });
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