<template>
  <div class="player">
    <div class="normal-player" v-show="fullScreen">
      <div class="background">
        <img :src="currentSong.pic" />
      </div>
      <div class="top"></div>
      <div class="bottom">
        <div class="operators">
          <div class="icon i-left">
            <i @click="changeMode" :class="modeIcon"></i>
          </div>
          <div class="icon i-left" :class="disableCls">
            <i class="icon-prev" @click="prev"></i>
          </div>
          <div class="icon i-center" :class="disableCls">
            <i :class="playIcon" @click="togglePlay"></i>
          </div>
          <div class="icon i-right" :class="disableCls">
            <i class="icon-next" @click="next"></i>
          </div>
          <div class="icon i-right">
            <i class="icon-not-favorite"></i>
          </div>
        </div>
      </div>
      <div class="top">
        <!-- 返回箭头 -->
        <div class="back" @click="goback">
          <i class="icon-back"></i>
        </div>
        <!-- 标题 -->
        <h1 class="title">{{ currentSong.name }}</h1>
        <h2 class="subtitle">{{ currentSong.singer }}</h2>
      </div>
    </div>
    <!-- @pause原生DOM事件 -->
    <audio
      ref="audioRef"
      @pause="pause"
      @canplay="ready"
      @error="error"
    ></audio>
  </div>
</template>

<script>
import { computed, watch, ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import useMode from "./use-mode";
export default {
  name: "player",
  setup() {
    //常量
    const audioRef = ref(null);
    const store = useStore();
    const songReady = ref(false);
    const { modeIcon,changeMode } = useMode();
    // 计算属性
    //全屏播放属性
    const fullScreen = computed(() => {
      return store.state.fullScreen;
    });
    //拿到当前播放歌曲
    const currentSong = computed(() => {
      return store.getters.currentSong;
    });
    //获取播放状态
    const playing = computed(() => {
      return store.state.playing;
    });
    //设置播放按钮的css样式
    const playIcon = computed(() => {
      return playing.value ? "icon-pause" : "icon-play";
    });
    //拿到当前播放歌曲索引
    const currentIndex = computed(() => {
      return store.state.currentIndex;
    });
    //拿到播放列表
    const playList = computed(() => {
      return store.state.playlist;
    });
    const disableCls = computed(() => {
      return songReady.value ? "" : "disable";
    });
    //监视属性
    //监视当前播放歌曲的变化
    watch(currentSong, (newSong) => {
      songReady.value = false;
      if (!newSong.id || !newSong.url) {
        return;
      }
      const audioEl = audioRef.value;
      audioEl.src = newSong.url;
      audioEl.play();
    });
    //监视暂停或者播放
    watch(playing, (newPlaying) => {
      const audioEl = audioRef.value;
      if (!songReady.value) return;
      newPlaying ? audioEl.play() : audioEl.pause();
    });

    //methods
    //播放开关
    function togglePlay() {
      if (!songReady.value) return;
      store.commit("setPlayingState", !playing.value);
    }
    //退出全屏播放
    function goback() {
      store.commit("setFullScreen", false);
    }
    function pause() {
      store.commit("setPlayingState", false);
    }
    //播放前一首
    function prev() {
      const list = playList.value;
      if (!list.length || !songReady.value) return;
      if (list.length == 1) {
        loop();
        return;
      }
      let index = currentIndex.value - 1;
      if (index === -1) {
        index = list.length - 1;
      }
      store.commit("setCurrentIndex", index);
      if (!playing.value) {
        store.commit("setPlayingState", true);
      }
    }
    //播放下一首
    function next() {
      const list = playList.value;
      if (!list.length) return;
      if (list.length == 1 || !songReady.value) {
        loop();
        return;
      }
      let index = currentIndex.value + 1;
      if (index === list.length) {
        index = 0;
      }
      store.commit("setCurrentIndex", index);
      if (!playing.value) {
        store.commit("setPlayingState", true);
      }
    }
    //循环播放
    function loop() {
      const audioEl = audioRef.value;
      //audioEl.currentTime返回音频播放位置(s)
      audioEl.currentTime = 0;
      audioEl.play();
    }
    function ready() {
      if (songReady.value) return;
      songReady.value = true;
    }
    function error() {
      songReady.value = true;
    }

    return {
      fullScreen,
      currentSong,
      audioRef,
      goback,
      playIcon,
      togglePlay,
      pause,
      prev,
      next,
      ready,
      disableCls,
      error,
      //mode
      modeIcon,
      changeMode
    };
  },
};
</script>

<style lang="scss" scoped>
.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);

      img {
        width: 100%;
        height: 100%;
      }
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
      }
      .icon-back {
        display: block;
        padding: 9px;
        font-size: $font-size-large-x;
        color: $color-theme;
        transform: rotate(-90deg);
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            img {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }
            .playing {
              animation: rotate 20s linear infinite;
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
            &.current {
              color: $color-text;
            }
          }
          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;
          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;
        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 40px;
          line-height: 30px;
          width: 40px;
          &.time-l {
            text-align: left;
          }
          &.time-r {
            text-align: right;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
          i {
            font-size: 30px;
          }
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .i-right {
          text-align: left;
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }
    &.normal-enter-active,
    &.normal-leave-active {
      transition: all 0.6s;
      .top,
      .bottom {
        transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1);
      }
    }
    &.normal-enter-from,
    &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0);
      }
      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }
}
</style>
