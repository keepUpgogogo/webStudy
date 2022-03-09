<template>
  <div class="player" v-show="playList.length">
    <div class="normal-player" v-show="fullScreen">
      <div class="background">
        <img :src="currentSong.pic" />
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
      <div
        class="middle"
        @touchstart.prevent="onMiddleTouchStart"
        @touchmove.prevent="onMiddleTouchMove"
        @touchend.prevent="onMiddleTouchEnd"
      >
        <!-- cd -->
        <div class="middle-l" :style="middleLStyle">
          <div class="cd-wrapper">
            <div class="cd" ref="cdRef">
              <img
                :src="currentSong.pic"
                class="image"
                :class="cdCls"
                ref="cdImageRef"
              />
            </div>
          </div>
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{ playingLyric }}</div>
          </div>
        </div>
        <!-- 歌词部分 -->
        <scroll class="middle-r" ref="lyricScrollRef" :style="middleRStyle">
          <div class="lyric-wrapper">
            <div v-if="currentLyric" ref="lyricListRef">
              <p
                class="text"
                :class="{ current: currentLineNum === index }"
                v-for="(line, index) in currentLyric.lines"
                :key="line.num"
              >
                {{ line.txt }}
              </p>
            </div>
            <div class="pure-music" v-show="pureMusicLyric">
              <p>{{ pureMusicLyric }}</p>
            </div>
          </div>
        </scroll>
      </div>

      <div class="bottom">
        <div class="dot-wrapper">
          <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
          <span class="dot" :class="{ active: currentShow === 'lyric' }"></span>
        </div>
        <div class="progress-wrapper">
          <span class="time time-l">{{ formatTime(currentTime) }}</span>
          <div class="progress-bar-wrapper">
            <progress-bar
              :progress="progress"
              @progress-changing="onProgressChanging"
              @progress-changed="onProgressChanged"
            ></progress-bar>
          </div>
          <span class="time time-r">{{
            formatTime(currentSong.duration)
          }}</span>
        </div>
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
            <i
              @click="toggleFavorite(currentSong)"
              :class="getFavoriteIcon(currentSong)"
            ></i>
          </div>
        </div>
      </div>
    </div>
    <mini-player :progress="progress" :toggle-play="togglePlay"></mini-player>
    <!-- @pause原生DOM事件 -->
    <audio
      ref="audioRef"
      @pause="pause"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
import { computed, watch, ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import useMode from "./use-mode";
import useFavorite from "./use-favorite";
import progressBar from "./progress-bar.vue";
import { formatTime } from "@/assets/js/util";
import { PLAY_MODE } from "@/assets/js/constant";
import useCd from "./use-cd";
import useLyric from "./use-lyric";
import scroll from "@/components/base/scroll/scroll";
import useMiddleInteractive from "./use-middle-interactive";
import MiniPlayer from "./mini-player.vue";
export default {
  name: "player",
  components: { progressBar, scroll, MiniPlayer },
  setup() {
    //常量
    const audioRef = ref(null);
    const store = useStore();
    const songReady = ref(false);
    const currentTime = ref(0);
    let onprogresschanging = false;

    //hooks
    const { modeIcon, changeMode } = useMode();
    const { getFavoriteIcon, toggleFavorite } = useFavorite();
    const { cdCls, cdRef, cdImageRef } = useCd();
    const {
      currentLyric,
      currentLineNum,
      playLyric,
      lyricScrollRef,
      lyricListRef,
      stopLyric,
      pureMusicLyric,
      playingLyric,
    } = useLyric({
      songReady,
      currentTime,
    });
    const {
      currentShow,
      middleLStyle,
      middleRStyle,
      onMiddleTouchStart,
      onMiddleTouchMove,
      onMiddleTouchEnd,
    } = useMiddleInteractive();

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
    const progress = computed(() => {
      return currentTime.value / currentSong.value.duration;
    });
    const playMode = computed(() => {
      return store.state.playMode;
    });

    //监视属性
    //监视当前播放歌曲的变化
    watch(currentSong, (newSong) => {
      songReady.value = false;
      currentTime.value = 0;
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
      if (newPlaying) {
        audioEl.play();
        playLyric();
      } else {
        audioEl.pause();
        stopLyric();
      }
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
      store.commit("setPlayingState", true);
    }
    function ready() {
      if (songReady.value) return;
      songReady.value = true;
      playLyric();
    }
    function error() {
      songReady.value = true;
    }
    function updateTime(e) {
      if (onprogresschanging) return;
      currentTime.value = e.target.currentTime;
    }
    function onProgressChanging(progress) {
      onprogresschanging = true;
      currentTime.value = currentSong.value.duration * progress;
      playLyric();
      stopLyric();
    }
    function onProgressChanged(progress) {
      onprogresschanging = false;
      audioRef.value.currentTime = currentTime.value =
        currentSong.value.duration * progress;
      if (!playing.value) store.commit("setPlayingState", true);
      playLyric();
    }
    function end() {
      currentTime.value = 0;
      if (playMode.value === PLAY_MODE.loop) {
        loop();
      } else {
        next();
      }
    }

    return {
      playList,
      currentTime,
      progress,
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
      formatTime,
      updateTime,
      //mode
      modeIcon,
      changeMode,
      //favorite
      getFavoriteIcon,
      toggleFavorite,
      onProgressChanging,
      onProgressChanged,
      end,
      //use-cd
      cdCls,
      cdRef,
      cdImageRef,
      //use-lyric
      currentLyric,
      currentLineNum,
      lyricScrollRef,
      lyricListRef,
      pureMusicLyric,
      playingLyric,
      //useMiddleInteractive
      currentShow,
      middleLStyle,
      middleRStyle,
      onMiddleTouchStart,
      onMiddleTouchMove,
      onMiddleTouchEnd,
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
