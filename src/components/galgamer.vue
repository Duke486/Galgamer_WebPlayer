<template>
    <span>&nbsp;</span>
    <div id="globe">

        <h1>GalGamer</h1>

        <div class="image-container">
            <img class="MainWindow" v-if="!start" :src="getImageUrl(imgname)" @click="go">
            <img class="MainWindow" v-if="!vid&&start" :src="getImageUrl(imgname)" @click="go">
            <video class="MainWindow" v-if="vid" :src="getVidUrl(vidname)" autoplay></video>
            <div v-if="!vid&&start" class="text-name">{{character}}</div>
            <div v-if="!vid&&start" class="text-say">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{say}}</div>
            <v-btn v-if="choosing" id="choiceA" @click="chooseA" rounded="xl" prepend-icon="mdi-grass" color="purple" width="20%" stacked>
                {{ buttonA }}
            </v-btn>
            <v-btn v-if="choosing" id="choiceB" @click="chooseB" rounded="xl" prepend-icon="mdi-flower-outline" color="orange" width="20%" stacked>
                {{ buttonB }}
            </v-btn>
        </div>
        <br>
        <div style="display: flex; justify-content: space-between; width: 100%;">
            <span v-if="!start">&nbsp;</span>
            <v-btn v-if="start" rounded="xl" @click="title" append-icon="" class="button-left">回到标题</v-btn>
            <v-btn v-if="!choosing" rounded="xl" @click="go" color="success" append-icon="mdi-arrow-right-bold-circle"
                class="button-right">{{ buttonGo }}</v-btn>
        </div>
        <audio v-if="voice" style="width: 1px;height: 1px;" controls="controls" autoplay="autoplay">
            <source :src="getVoiceUrl(voicename)" type="audio/mpeg" />
        </audio>

    </div>
    <v-dialog
      v-model="ConfirmTitle"
      width="auto"
    >
      <v-card
        max-width="400"
        prepend-icon="mdi-alert-decagram-outline"
        text="确定要回到标题画面吗？所有未保存的进度将丢失。"
        title="回到标题"
      >
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn
            
            text="取消"
            @click="ConfirmTitle = false"
          ></v-btn>
          <v-btn
            
            text="确定"
            color="error"
            @click="restart"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>

</template>

<script>
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

            plot: [
                {
                    character: 'vid',
                    say: '',
                    vision: 'M1.mp4',
                    voice: '',
                },
                {
                    character: '',
                    say: '今天也是自己一个人去上学',
                    vision: '001.png',
                    voice: '',
                },
                {character: '',
                    say: '自从父母到外地办厂子之后，我就一个人留在武汉的家里',
                    vision: '',
                    voice: '',
                },
                {
                    character: '大爷',
                    say: '哦，这不是邱诚吗',
                    vision: '',
                    voice: '0001.mp3',
                },
                {
                    character: '邱诚',
                    say: '早上好啊，爷爷',
                    vision: '',
                    voice: '',
                },
                {
                    character: '大爷',
                    say: '真巧啊。啊，对了，刚才还碰到那丫头呢，我还提到你呢',
                    vision: '',
                    voice: '0002.mp3',
                },

                {
                    character: '邱诚',
                    say: '啊······爷爷，我还着急上学，先走了啊',
                    vision: '',
                    voice: '',
                },
                
                {
                    character: '大爷',
                    say: '哦，不急不急，路上注意车啊',
                    vision: '',
                    voice: '0003.mp3',
                },
                
                {
                    character: '',
                    say: '我继续向小区门口走去',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '那个身影是······',
                    vision: '002.png',
                    voice: '',
                },
                {
                    character: '邱诚',
                    say: '墨！······',
                    vision: '',
                    voice: '',
                },
                {
                    character: '墨小菊',
                    say: '啊',
                    vision: '003.png',
                    voice: '0004.mp3',
                },
                {
                    character: '',
                    say: '一不留神，就喊出来了',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '发生了那种事，她现在应该不想看到我吧',
                    vision: '',
                    voice: '',
                },
                {
                    character: '墨小菊',
                    say: '......',
                    vision: '004.png',
                    voice: '',
                },
                {
                    character: '',
                    say: '她走掉了，果然啊',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '任由双脚走着，等我回过神来的时候，已经到学校门口了',
                    vision: '005.png',
                    voice: '',
                },
                {
                    character: '',
                    say: '今天公布分班榜，我从普通班转到了艺术班，尽管家里人都反对就是了',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '不知道会遇到怎样的同学啊······',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '来到教室，一位紫发的女孩子已经坐在邻座了',
                    vision: '006.png',
                    voice: '',
                },
                {
                    character: '',
                    say: '坐在最后排吗？应该跟我一样是新生吧',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '分班表上的新生只有两个，一个是我，另一个人好像叫 文芷',
                    vision: '',
                    voice: '',
                },
                {
                    character: '邱诚',
                    say: '你好，请问你是，文芷吗',
                    vision: '',
                    voice: '',
                },
                {
                    character: '文芷',
                    say: '啊',
                    vision: '007.png',
                    voice: '0005.mp3',
                },
                {
                    character: '邱诚',
                    say: '抱歉抱歉，我可能认错人了',
                    vision: '',
                    voice: '',
                },
                {
                    character: '文芷',
                    say: '为什么······',
                    vision: '008.png',
                    voice: '0006.mp3',
                },
                {
                    character: '',
                    say: '好奇怪的女生,以后能好好相处吗...',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '开学第一天在忙碌中度过，不知不觉都傍晚了',
                    vision: '009.png',
                    voice: '',
                },
                {
                    character: '丁老师',
                    say: '好了，以上就是秋季运动会的大致安排',
                    vision: '',
                    voice: '',
                },
                {
                    character: '丁老师',
                    say: '我们作为艺术班，一定要做好宣传工作',
                    vision: '',
                    voice: '',
                },
                {
                    character: '丁老师',
                    say: '这次运动会会有省里的领导来视察，必须认真对待',
                    vision: '',
                    voice: '',
                },
                {
                    character: '丁老师',
                    say: '好了，散会。同学们回家吧',
                    vision: '',
                    voice: '',
                },
                {
                    character: '文芷',
                    say: '盯————',
                    vision: '010.png',
                    voice: '',
                },
                {
                    character: '邱诚',
                    say: '怎么了吗',
                    vision: '',
                    voice: '',
                },
                {
                    character: '文芷',
                    say: '我只是在想，你的画，是怎样的呢',
                    vision: '',
                    voice: '0007.mp3',
                },
                {
                    character: '邱诚',
                    say: '我的画？为什么会关心这个呢',
                    vision: '',
                    voice: '',
                },
                {
                    character: '文芷',
                    say: '啊。只是，想看看你的画而已，稍微，有点兴趣······',
                    vision: '',
                    voice: '0008.mp3',
                },
                {
                    character: '',
                    say: '刚见面就要看画的人，应该很少见吧',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '不过拒绝人家感觉有点过意不去，她也没有什么恶意',
                    vision: '',
                    voice: '',
                },
                {
                    character: '邱诚',
                    say: '好吧，明天我带来几张给你看',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '走进小区，打开家门，回到我的房间里',
                    vision: '011.png',
                    voice: '',
                },
                {
                    character: '',
                    say: '书桌上是为新学期准备的素描本',
                    vision: '',
                    voice: '',
                },
                {
                    character: '邱诚',
                    say: '今天画点什么记录一下吧',
                    vision: '',
                    voice: '',
                },
                {
                    character: 'choose',
                    say: '要画什么呢',
                    vision: '012.png',
                    voice: '',
                },
                {
                    character: '邱诚',
                    say: '那个新来的文芷，有点让人在意',
                    vision: '014.png',
                    voice: '',
                },
                {
                    character: 'jump',
                    say: '48',
                    vision: '',
                    voice: '',
                },
                {
                    character: '邱诚',
                    say: '小菊今早的样子，有点让人在意',
                    vision: '013.png',
                    voice: '',
                },
                {
                    character: 'jump',
                    say: '48',
                    vision: '',
                    voice: '',
                },
                {
                    character: '',
                    say: '有些困了，今天就先睡吧',
                    vision: '',
                    voice: '',
                },
                {
                    character: 'vid',
                    say: '',
                    vision: '0001.mp4',
                    voice: '',
                },
            ],
            choose:[//使用问题处的台词作为索引
                {
                    question: '要画什么呢',
                    A: '文芷的身影',
                    indexA:44,
                    B:'墨小菊的身影',
                    indexB:46,
                }
            ]

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
@import '../styles/webgalgamer.css';

</style>
