<template>
    <v-container id="globe" class="pa-4 main-container">
        <v-fade-transition>
            <v-card class="mx-auto" max-width="1200" elevation="3">
                <v-card-title class="text-h3 font-weight-bold text-center py-4">
                    GalGamer
                </v-card-title>

                <v-card-text class="image-container position-relative">
                    <v-img
                        v-if="!start || (!vid && start)"
                        :src="getImageUrl(imgname)"
                        @click="go"
                        class="MainWindow rounded-lg"
                        cover
                    ></v-img>
                    <video
                        v-if="vid"
                        class="MainWindow rounded-lg"
                        :src="getVidUrl(vidname)"
                        autoplay
                    ></video>
                    
                    <v-slide-y-transition>
                        <v-sheet
                            v-if="!vid && start"
                            class="text-overlay pa-4 rounded-lg"
                            height="140"
                        >
                            <div class="text-h5 font-weight-bold text-white mb-2 px-4">{{character || '　'}}</div>
                            <div class="text-body-1 text-white px-6 pb-2">{{say}}</div>
                        </v-sheet>
                    </v-slide-y-transition>

                    <v-row v-if="choosing" justify="center" align="center" class="choice-buttons">
                        <v-col cols="12" class="text-center mb-4">
                            <div class="choice-title text-h5 text-white mb-8">{{say}}</div>
                        </v-col>
                        <v-col cols="5">
                            <v-btn
                                id="choiceA"
                                @click="chooseA"
                                rounded="xl"
                                prepend-icon="mdi-grass"
                                color="purple"
                                size="large"
                                block
                                elevation="2"
                                class="text-subtitle-1"
                            >
                                {{ buttonA }}
                            </v-btn>
                        </v-col>
                        <v-col cols="5">
                            <v-btn
                                id="choiceB"
                                @click="chooseB"
                                rounded="xl"
                                prepend-icon="mdi-flower-outline"
                                color="orange"
                                size="large"
                                block
                                elevation="2"
                                class="text-subtitle-1"
                            >
                                {{ buttonB }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-spacer v-if="!start"></v-spacer>
                    <v-btn
                        v-if="start"
                        rounded="xl"
                        @click="title"
                        color="error"
                        variant="outlined"
                        prepend-icon="mdi-keyboard-return"
                    >
                        回到标题
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                        v-if="!choosing"
                        rounded="xl"
                        @click="go"
                        class="next-btn"
                        append-icon="mdi-arrow-right-bold-circle"
                        size="large"
                    >
                        {{ buttonGo }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-fade-transition>

        <audio v-if="voice" style="width: 1px;height: 1px;" controls="controls" autoplay="autoplay">
            <source :src="getVoiceUrl(voicename)" type="audio/mpeg" />
        </audio>

        <v-dialog v-model="ConfirmTitle" width="auto">
            <v-card
                max-width="400"
                prepend-icon="mdi-alert-decagram-outline"
                title="回到标题"
                class="pa-4"
            >
                <v-card-text>
                    确定要回到标题画面吗？所有未保存的进度将丢失。
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        variant="text"
                        @click="ConfirmTitle = false"
                    >
                        取消
                    </v-btn>
                    <v-btn
                        color="error"
                        @click="restart"
                    >
                        确定
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import gameData from '../assets/game1.json'

export default {
    data() {
        return {
            start: false,
            vid: false,
            voice: false,
            choosing:false,
            ConfirmTitle:false,
            imgname: 'poster.png',
            vidname: 'M1.mp4',
            voicename: '',
            index: 0,

            buttonGo: '开始',
            buttonA:'',
            buttonB:'',
            indexA: 0,
            indexB: 0,
            character: '',
            say: '',

            plot: gameData.plot,
            choose: gameData.choices
        };
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
        go() {
            if (this.start === false) {//进入游戏
                this.start = true;
                this.buttonGo = '前进';
                console.log('已开始');
            }
            if (this.index === this.plot.length) {this.title();return;}

            console.log(this.index, this.plot[this.index]);
            if (true&&this.plot[this.index].character === 'vid') {
                this.vid = true;
                this.vidname = this.plot[this.index].vision;
                this.index++;
                return;
            }else if(this.plot[this.index].character === 'jump'){
                this.index = parseInt(this.plot[this.index].say);
            }

            this.vid = false;
            if (this.plot[this.index].vision.length) {
                this.imgname = this.plot[this.index].vision;
            }
            if (this.plot[this.index].voice.length) {
                this.voice = true;
                this.voicename = this.plot[this.index].voice;
            } else { this.voice = false; }
            this.character = this.plot[this.index].character;
            this.say = this.plot[this.index].say;

            if (this.plot[this.index].character === 'choose') {
                for (let i = 0; i < this.choose.length; i++) {
                    if (this.choose[i].question === this.plot[this.index].say) {
                        this.buttonA = this.choose[i].A;
                        this.buttonB = this.choose[i].B;
                        this.indexA = this.choose[i].indexA;
                        this.indexB = this.choose[i].indexB;
                        break;
                    }
                    if(i===this.choose.length-1){
                        alert("未找到对应的分支选项");
                    }
                }
                this.choosing=true;
            }

            this.index++;
        },
        chooseA(){
            this.index=this.indexA;
            this.choosing=false;
            this.go();
        },
        chooseB(){
            this.index=this.indexB;
            this.choosing=false;
            this.go();
        },
        restart(){
            this.ConfirmTitle = false;
            this.buttonGo = '开始';
            this.imgname = 'poster.png';
            this.index = 0;
            this.start = false;
            this.choosing = false;
            this.vid = false;
            console.log('已结束，重置游戏');
        },
        title(){
            this.ConfirmTitle=true;
        }
    },
};
</script>

<style scoped>
.main-container {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
    min-height: 100vh;
}

.image-container {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.MainWindow {
    width: 100%;
    height: auto;
    max-height: 70vh;
    object-fit: contain;
}

.text-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 16px;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.1) 10%,
        rgba(0, 0, 0, 0.3) 25%,
        rgba(0, 0, 0, 0.5) 40%,
        rgba(0, 0, 0, 0.7) 60%,
        rgba(0, 0, 0, 0.8) 100%
    );
    backdrop-filter: blur(2px);
    overflow-y: auto;
}

.next-btn {
    background-color: rgba(76, 175, 80, 0.1) !important;
    color: #4CAF50 !important;
}

.next-btn:hover {
    background-color: rgba(76, 175, 80, 0.2) !important;
}

.choice-buttons {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 800px;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.4) 30%,
        rgba(0, 0, 0, 0.4) 70%,
        rgba(0, 0, 0, 0) 100%
    );
    padding: 2rem;
}

.choice-title {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
