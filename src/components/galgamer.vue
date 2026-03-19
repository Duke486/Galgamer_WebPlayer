<template>
  <div class="vn-shell">
    <div class="vn-stage">
      <div class="vn-stage__frame">
        <img
          v-if="showImageStage"
          :src="getImageUrl(imgname)"
          :alt="say || 'scene background'"
          class="vn-stage__media"
          @click="go"
        />
        <video
          v-else
          class="vn-stage__media"
          :src="getVidUrl(vidname)"
          autoplay
          playsinline
          @click="go"
        ></video>

        <div class="vn-stage__vignette"></div>

        <div v-if="!start" class="title-overlay">
          <div class="title-overlay__panel">
            <div class="title-overlay__subtitle">可重构的现代视觉小说引擎原型</div>
            <h1 class="title-overlay__title">Galgamer</h1>
            <p class="title-overlay__desc">
              保留当前剧情体验，同时逐步重写底层运行时、存档能力与界面系统。
            </p>
            <button class="title-overlay__action" @click="go">开始阅读</button>
          </div>
        </div>

        <transition name="fade-up">
          <div v-if="start && !vid" class="dialogue-layer">
            <div class="dialogue-box">
              <div class="dialogue-box__nameplate">{{ displayCharacter }}</div>
              <div class="dialogue-box__content">{{ say }}</div>
            </div>
          </div>
        </transition>

        <transition name="fade-up">
          <div v-if="choosing" class="choice-layer">
            <div class="choice-panel">
              <div class="choice-panel__title">{{ say }}</div>
              <button class="choice-panel__button" @click="chooseA">{{ buttonA }}</button>
              <button class="choice-panel__button" @click="chooseB">{{ buttonB }}</button>
            </div>
          </div>
        </transition>

        <div v-if="start" class="control-cluster">
          <button class="icon-btn icon-btn--primary" @click="go" :disabled="choosing" title="继续">
            <span class="mdi mdi-chevron-right"></span>
          </button>
          <button class="icon-btn" @click="toggleBacklog" title="回看">
            <span class="mdi mdi-text-box-search-outline"></span>
          </button>
          <button class="icon-btn" @click="saveProgress" title="存档">
            <span class="mdi mdi-content-save-outline"></span>
          </button>
          <button class="icon-btn" @click="loadProgress" title="读档">
            <span class="mdi mdi-folder-open-outline"></span>
          </button>
          <button class="icon-btn" @click="toggleMenu" title="菜单">
            <span class="mdi mdi-dots-horizontal-circle-outline"></span>
          </button>
        </div>

        <transition name="fade-soft">
          <div v-if="menuOpen" class="overlay-menu" @click.self="menuOpen = false">
            <div class="overlay-menu__panel">
              <div class="overlay-menu__title">系统菜单</div>
              <button class="overlay-menu__item" @click="saveProgress">
                <span class="mdi mdi-content-save-outline"></span>
                <span>保存进度</span>
              </button>
              <button class="overlay-menu__item" @click="loadProgress">
                <span class="mdi mdi-folder-open-outline"></span>
                <span>读取进度</span>
              </button>
              <button class="overlay-menu__item" @click="openBacklogFromMenu">
                <span class="mdi mdi-text-box-search-outline"></span>
                <span>回看记录</span>
              </button>
              <button class="overlay-menu__item overlay-menu__item--danger" @click="title">
                <span class="mdi mdi-keyboard-return"></span>
                <span>返回标题</span>
              </button>
            </div>
          </div>
        </transition>

        <transition name="fade-soft">
          <div v-if="backlogOpen" class="backlog-panel" @click.self="backlogOpen = false">
            <div class="backlog-panel__sheet">
              <div class="backlog-panel__header">
                <div>
                  <div class="backlog-panel__eyebrow">History Log</div>
                  <div class="backlog-panel__title">对话回看</div>
                </div>
                <button class="icon-btn icon-btn--sheet" @click="backlogOpen = false">
                  <span class="mdi mdi-close"></span>
                </button>
              </div>
              <div class="backlog-list">
                <div v-if="!historyEntries.length" class="backlog-empty">当前还没有可回看的内容。</div>
                <div v-for="entry in historyEntries" :key="entry.id" class="backlog-item">
                  <div class="backlog-item__speaker">{{ entry.speaker || '旁白' }}</div>
                  <div class="backlog-item__text">{{ entry.text }}</div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <audio v-if="voice" autoplay>
      <source :src="getVoiceUrl(voicename)" type="audio/mpeg" />
    </audio>

    <v-dialog v-model="ConfirmTitle" width="auto">
      <v-card max-width="420" title="回到标题" class="pa-4 rounded-xl">
        <v-card-text>
          确定要回到标题画面吗？当前未保存的进度会被重置。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="ConfirmTitle = false">取消</v-btn>
          <v-btn color="error" @click="restart">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbarOpen" timeout="2200" color="blue-grey-darken-4">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script>
import { createRuntime, loadScenario } from '@/engine'

const scenario = loadScenario()
const SAVE_KEY = 'galgamer-webplayer-save'

export default {
  data() {
    return {
      scenario,
      runtime: createRuntime(scenario),
      start: false,
      vid: false,
      voice: false,
      choosing: false,
      ConfirmTitle: false,
      backlogOpen: false,
      menuOpen: false,
      snackbarOpen: false,
      snackbarText: '',
      imgname: scenario.meta.initialBackground,
      vidname: scenario.meta.initialVideo,
      voicename: '',
      buttonGo: '开始',
      buttonA: '',
      buttonB: '',
      character: '',
      say: '',
      historyEntries: [],
      variableCount: 0,
    }
  },
  computed: {
    showImageStage() {
      return !this.start || (!this.vid && this.start)
    },
    displayCharacter() {
      return this.character || '旁白'
    },
  },
  methods: {
    getImageUrl(name) {
      return new URL(`../assets/img/${name}`, import.meta.url).href
    },
    getVidUrl(name) {
      return new URL(`../assets/vid/${name}`, import.meta.url).href
    },
    getVoiceUrl(name) {
      return new URL(`../assets/voice/${name}`, import.meta.url).href
    },
    toast(text) {
      this.snackbarText = text
      this.snackbarOpen = true
    },
    syncFromRuntime(snapshot) {
      this.start = snapshot.started
      this.vid = Boolean(snapshot.video)
      this.voice = Boolean(snapshot.voice)
      this.choosing = Boolean(snapshot.currentChoice)
      this.imgname = snapshot.background || this.scenario.meta.initialBackground
      this.vidname = snapshot.video || this.scenario.meta.initialVideo
      this.voicename = snapshot.voice || ''
      this.character = snapshot.currentCommand?.speaker || ''
      this.say = snapshot.currentCommand?.text || ''
      this.buttonA = snapshot.currentChoice?.options?.[0]?.label || ''
      this.buttonB = snapshot.currentChoice?.options?.[1]?.label || ''
      this.buttonGo = snapshot.started ? '继续' : '开始'
      this.historyEntries = [...(snapshot.history || [])].reverse()
      this.variableCount = Object.keys(snapshot.variables || {}).length
    },
    go() {
      const snapshot = this.runtime.advance()
      this.syncFromRuntime(snapshot)
      if (snapshot.finished) {
        this.title()
      }
    },
    chooseA() {
      const option = this.runtime.snapshot().currentChoice?.options?.[0]
      if (!option || typeof option.target !== 'number') return
      this.syncFromRuntime(this.runtime.choose(option.target, option.effects || []))
    },
    chooseB() {
      const option = this.runtime.snapshot().currentChoice?.options?.[1]
      if (!option || typeof option.target !== 'number') return
      this.syncFromRuntime(this.runtime.choose(option.target, option.effects || []))
    },
    saveProgress() {
      if (!this.start) {
        this.toast('还没有开始阅读，暂时无法存档')
        return
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.runtime.snapshot()))
      this.menuOpen = false
      this.toast('进度已保存')
    },
    loadProgress() {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) {
        this.toast('没有找到可读取的存档')
        return
      }
      const parsed = JSON.parse(raw)
      this.syncFromRuntime(this.runtime.restore(parsed))
      this.menuOpen = false
      this.toast('已读取存档')
    },
    toggleBacklog() {
      this.backlogOpen = !this.backlogOpen
      this.menuOpen = false
    },
    openBacklogFromMenu() {
      this.menuOpen = false
      this.backlogOpen = true
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen
      this.backlogOpen = false
    },
    restart() {
      this.ConfirmTitle = false
      this.menuOpen = false
      this.backlogOpen = false
      this.syncFromRuntime(this.runtime.restart())
    },
    title() {
      this.ConfirmTitle = true
    },
  },
}
</script>

<style scoped>
.vn-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(117, 147, 255, 0.18), transparent 32%),
    linear-gradient(180deg, #0a1020 0%, #10182a 50%, #0a0f18 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.vn-stage {
  width: min(100%, 1440px);
}

.vn-stage__frame {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: #0c1220;
  aspect-ratio: 16 / 9;
}

.vn-stage__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vn-stage__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(6, 10, 18, 0.38) 0%, rgba(6, 10, 18, 0.04) 22%, rgba(6, 10, 18, 0.08) 54%, rgba(6, 10, 18, 0.9) 100%),
    radial-gradient(circle at center, transparent 55%, rgba(0, 0, 0, 0.22) 100%);
}

.title-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: min(7vw, 72px);
  z-index: 3;
}

.title-overlay__panel {
  max-width: min(560px, 90%);
  padding: clamp(24px, 3.2vw, 40px);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(9, 15, 28, 0.58), rgba(9, 15, 28, 0.26));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

.title-overlay__subtitle {
  color: #b9caf8;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.title-overlay__title {
  margin: 10px 0 12px;
  color: white;
  font-size: clamp(42px, 5vw, 74px);
  line-height: 0.98;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.42);
}

.title-overlay__desc {
  margin: 0;
  color: rgba(238, 244, 255, 0.86);
  font-size: clamp(14px, 1.3vw, 18px);
  line-height: 1.8;
}

.title-overlay__action {
  margin-top: 22px;
  padding: 14px 22px;
  border-radius: 999px;
  border: none;
  color: #0f1730;
  font-weight: 700;
  background: linear-gradient(135deg, #e7ecff 0%, #9ab9ff 100%);
  box-shadow: 0 12px 28px rgba(84, 128, 255, 0.35);
}

.dialogue-layer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 24px 18px;
  z-index: 4;
}

.dialogue-box {
  position: relative;
  min-height: 180px;
  border-radius: 26px;
  padding: 54px 32px 30px;
  background:
    linear-gradient(180deg, rgba(18, 26, 42, 0.12), rgba(5, 9, 16, 0.74) 38%, rgba(6, 10, 18, 0.92) 100%);
  border: 1px solid rgba(255, 255, 255, 0.11);
  box-shadow:
    0 -12px 40px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.dialogue-box__nameplate {
  position: absolute;
  top: -22px;
  left: 28px;
  display: inline-flex;
  align-items: center;
  min-width: 138px;
  max-width: 340px;
  padding: 11px 20px 12px;
  border-radius: 16px 22px 16px 16px;
  background: linear-gradient(135deg, rgba(149, 183, 255, 0.98), rgba(94, 125, 228, 0.96));
  color: #ffffff;
  font-size: clamp(18px, 1.5vw, 26px);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.15),
    0 2px 10px rgba(28, 46, 122, 0.45);
  box-shadow:
    0 12px 26px rgba(55, 85, 196, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.dialogue-box__content {
  color: rgba(252, 253, 255, 0.98);
  font-size: clamp(20px, 1.62vw, 30px);
  line-height: 1.95;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: pre-wrap;
  text-shadow:
    -1px 0 rgba(5, 8, 14, 0.72),
    0 1px rgba(5, 8, 14, 0.72),
    1px 0 rgba(5, 8, 14, 0.72),
    0 -1px rgba(5, 8, 14, 0.72),
    0 3px 14px rgba(0, 0, 0, 0.34);
}

.choice-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  padding: 24px;
}

.choice-panel {
  width: min(760px, 100%);
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(13, 18, 33, 0.82), rgba(12, 18, 30, 0.66));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
}

.choice-panel__title {
  color: white;
  font-size: clamp(18px, 1.6vw, 28px);
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.35);
}

.choice-panel__button {
  width: 100%;
  display: block;
  text-align: left;
  padding: 17px 20px;
  margin-top: 12px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(246, 249, 255, 0.97);
  font-size: 17px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, rgba(77, 103, 179, 0.52), rgba(95, 142, 255, 0.18));
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.choice-panel__button:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(96, 129, 223, 0.74), rgba(137, 182, 255, 0.24));
  border-color: rgba(255, 255, 255, 0.24);
}

.control-cluster {
  position: absolute;
  right: 18px;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 6;
}

.icon-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: rgba(246, 249, 255, 0.88);
  font-size: 22px;
  text-shadow:
    0 2px 12px rgba(0, 0, 0, 0.55),
    0 0 18px rgba(120, 158, 255, 0.18);
  transition: transform 0.16s ease, color 0.16s ease, opacity 0.16s ease;
}

.icon-btn:hover {
  transform: translateY(-1px) scale(1.05);
  color: #ffffff;
}

.icon-btn--primary {
  color: rgba(186, 211, 255, 0.98);
  font-size: 30px;
}

.icon-btn--sheet {
  color: rgba(244, 247, 255, 0.8);
  background: transparent;
}

.icon-btn:disabled {
  opacity: 0.38;
}

.overlay-menu,
.backlog-panel {
  position: absolute;
  inset: 0;
  z-index: 7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(7, 10, 18, 0.24);
  backdrop-filter: blur(6px);
}

.overlay-menu__panel,
.backlog-panel__sheet {
  width: min(520px, 100%);
  border-radius: 24px;
  padding: 24px;
  background: linear-gradient(180deg, rgba(12, 17, 31, 0.88), rgba(10, 14, 24, 0.82));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 54px rgba(0, 0, 0, 0.32);
}

.overlay-menu__title,
.backlog-panel__title {
  color: white;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.overlay-menu__item {
  width: 100%;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(247, 249, 255, 0.96);
}

.overlay-menu__item--danger {
  color: #ffd4d4;
}

.backlog-panel__sheet {
  width: min(860px, 100%);
  max-height: min(76vh, 860px);
  display: flex;
  flex-direction: column;
}

.backlog-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.backlog-panel__eyebrow {
  color: rgba(176, 194, 255, 0.8);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.backlog-list {
  overflow: auto;
  padding-right: 4px;
}

.backlog-empty {
  color: rgba(232, 238, 255, 0.66);
  padding: 18px 2px;
}

.backlog-item {
  padding: 14px 2px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.backlog-item__speaker {
  color: #aecaFF;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.backlog-item__text {
  color: rgba(249, 251, 255, 0.94);
  font-size: 17px;
  line-height: 1.85;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.22);
}

.fade-up-enter-active,
.fade-up-leave-active,
.fade-soft-enter-active,
.fade-soft-leave-active {
  transition: all 0.22s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.fade-soft-enter-from,
.fade-soft-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .vn-shell {
    padding: 12px;
  }

  .vn-stage__frame {
    aspect-ratio: 9 / 16;
    border-radius: 22px;
  }

  .dialogue-layer,
  .choice-layer,
  .overlay-menu,
  .backlog-panel {
    padding: 14px;
  }

  .dialogue-box {
    min-height: 200px;
    padding: 50px 18px 24px;
  }

  .dialogue-box__nameplate {
    left: 18px;
    min-width: 110px;
    font-size: 18px;
  }

  .dialogue-box__content {
    font-size: 18px;
    line-height: 1.8;
  }

  .control-cluster {
    right: 12px;
    bottom: 16px;
    gap: 6px;
  }

  .icon-btn {
    width: 34px;
    height: 34px;
    font-size: 20px;
  }

  .icon-btn--primary {
    font-size: 28px;
  }
}
</style>
