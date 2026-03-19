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
        <div class="vn-stage__topbar">
          <div class="vn-stage__titleblock">
            <div class="vn-stage__eyebrow">Galgamer WebPlayer</div>
            <div class="vn-stage__title">{{ scenario.meta.title }}</div>
          </div>
          <button v-if="start" class="overlay-chip" @click="title">返回标题</button>
        </div>

        <div v-if="!start" class="title-overlay">
          <div class="title-overlay__panel">
            <div class="title-overlay__subtitle">可重构的现代视觉小说引擎原型</div>
            <h1 class="title-overlay__title">Galgamer</h1>
            <p class="title-overlay__desc">
              保留当前剧情体验，同时逐步重写底层运行时与界面系统。
            </p>
            <button class="title-overlay__action" @click="go">开始阅读</button>
          </div>
        </div>

        <transition name="fade-up">
          <div v-if="start && !vid" class="dialogue-layer">
            <div class="dialogue-box">
              <div class="dialogue-box__nameplate">{{ character || '旁白' }}</div>
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

        <div class="control-cluster">
          <button class="cluster-btn cluster-btn--primary" @click="go" :disabled="choosing">
            {{ buttonGo }}
          </button>
          <button class="cluster-btn" @click="title" v-if="start">菜单</button>
        </div>

        <div class="status-ribbon" v-if="start">
          <span>{{ vid ? '演出中' : choosing ? '分支选择' : '阅读中' }}</span>
          <span>历史 {{ historyCount }}</span>
          <span>变量 {{ variableCount }}</span>
        </div>
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
  </div>
</template>

<script>
import { createRuntime, loadScenario } from '@/engine'

const scenario = loadScenario()

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
      imgname: scenario.meta.initialBackground,
      vidname: scenario.meta.initialVideo,
      voicename: '',
      buttonGo: '开始',
      buttonA: '',
      buttonB: '',
      character: '',
      say: '',
      historyCount: 0,
      variableCount: 0,
    }
  },
  computed: {
    showImageStage() {
      return !this.start || (!this.vid && this.start)
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
      this.historyCount = snapshot.history?.length || 0
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
    restart() {
      this.ConfirmTitle = false
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
    linear-gradient(180deg, rgba(6, 10, 18, 0.55) 0%, rgba(6, 10, 18, 0.05) 22%, rgba(6, 10, 18, 0.08) 54%, rgba(6, 10, 18, 0.78) 100%),
    radial-gradient(circle at center, transparent 55%, rgba(0, 0, 0, 0.22) 100%);
}

.vn-stage__topbar {
  position: absolute;
  top: 20px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 4;
}

.vn-stage__eyebrow {
  color: rgba(219, 232, 255, 0.82);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.vn-stage__title {
  margin-top: 6px;
  color: white;
  font-size: clamp(22px, 2.2vw, 34px);
  font-weight: 700;
  text-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
}

.overlay-chip {
  background: rgba(9, 14, 24, 0.54);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 10px 16px;
  backdrop-filter: blur(10px);
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
  padding: 0 24px 22px;
  z-index: 4;
}

.dialogue-box {
  position: relative;
  min-height: 164px;
  border-radius: 24px;
  padding: 40px 28px 28px;
  background: linear-gradient(180deg, rgba(8, 14, 24, 0.15), rgba(6, 10, 18, 0.78));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(10px);
}

.dialogue-box__nameplate {
  position: absolute;
  top: -18px;
  left: 24px;
  padding: 10px 18px;
  min-width: 120px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(125, 160, 255, 0.95), rgba(85, 115, 220, 0.95));
  color: white;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 10px 26px rgba(64, 99, 214, 0.32);
}

.dialogue-box__content {
  color: rgba(248, 251, 255, 0.96);
  font-size: clamp(17px, 1.4vw, 24px);
  line-height: 1.9;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  white-space: pre-wrap;
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
  width: min(720px, 100%);
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(13, 18, 33, 0.8), rgba(12, 18, 30, 0.62));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
}

.choice-panel__title {
  color: white;
  font-size: clamp(18px, 1.6vw, 28px);
  font-weight: 700;
  margin-bottom: 16px;
}

.choice-panel__button {
  width: 100%;
  display: block;
  text-align: left;
  padding: 16px 18px;
  margin-top: 12px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(246, 249, 255, 0.96);
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
  right: 24px;
  bottom: 28px;
  display: flex;
  gap: 10px;
  z-index: 6;
}

.cluster-btn {
  min-width: 92px;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(11, 16, 27, 0.72);
  color: white;
  font-weight: 700;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.24);
}

.cluster-btn--primary {
  background: linear-gradient(135deg, rgba(133, 176, 255, 0.95), rgba(92, 126, 235, 0.95));
  color: white;
}

.cluster-btn:disabled {
  opacity: 0.4;
}

.status-ribbon {
  position: absolute;
  right: 24px;
  top: 92px;
  display: flex;
  gap: 10px;
  z-index: 4;
  flex-wrap: wrap;
}

.status-ribbon span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(8, 14, 24, 0.44);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(238, 243, 255, 0.85);
  font-size: 12px;
  backdrop-filter: blur(10px);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.24s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

@media (max-width: 900px) {
  .vn-shell {
    padding: 12px;
  }

  .vn-stage__frame {
    aspect-ratio: 9 / 16;
    border-radius: 22px;
  }

  .vn-stage__topbar,
  .dialogue-layer,
  .choice-layer {
    padding-left: 14px;
    padding-right: 14px;
  }

  .control-cluster {
    right: 14px;
    bottom: 18px;
  }

  .dialogue-box {
    min-height: 180px;
    padding: 42px 18px 22px;
  }

  .dialogue-box__content {
    font-size: 16px;
    line-height: 1.7;
  }
}
</style>
