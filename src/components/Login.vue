<template>
  <v-container class="fill-height">
    <v-row class="justify-center align-center">
      <div>
        <div class="text-center">
          <h1>{{ title }}</h1>
        </div><br>
        <div v-if="!logged">
          
          <v-text-field clearable v-model="UserName" label="用户名" prepend-icon="mdi-account" style="width: 300px;"
            placeholder="请输入您的账号ID">
          </v-text-field>
          <v-text-field clearable v-model="Password" label="密码" prepend-icon="mdi-key" style="width: 300px;"
            type="password">
          </v-text-field>
          <div class="text-center"><v-btn @click="login" color="primary" 
          append-icon="mdi-login" rounded="lg">
              登&nbsp录</v-btn></div>
        </div>
        <div v-else class="text-center">
          <v-btn @click="ConfirmLogout =true" color="error" append-icon="mdi-logout" rounded="lg">
            注销</v-btn>
        </div>


        <v-dialog
      v-model="wrong"
      width="auto"
    >
      <v-card
        max-width="400"
        prepend-icon="mdi-alert"
        text="请检查您的账号和密码是否正确。"
        title="认证失败"
      >
        <template v-slot:actions>
          <v-btn
            class="ms-auto"
            text="确定"
            @click="wrong = false"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="ConfirmLogout"
      width="auto"
    >
      <v-card
        max-width="400"
        prepend-icon="mdi-alert-decagram-outline"
        text="确定要离开吗？所有未保存的更改将失效。"
        title="注销"
      >
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn
            
            text="取消"
            @click="ConfirmLogout = false"
          ></v-btn>
          <v-btn
            
            text="确定"
            color="error"
            @click="logout"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>


      </div>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      title: '后台登录',
      logged: false,
      UserName: '',
      Password: '',
      wrong: false,
      ConfirmLogout: false
    }
  },
  methods: {
    login() {
      if (this.UserName === 'admin' && this.Password === 'admin') {
        this.logged = true
        this.title = `欢迎您,${this.UserName}`;
        this.UserName = ''
        this.Password = ''
      } else {
        this.wrong = true
        this.Password = ''
      }
    },
    logout() {
      this.logged = false
      this.title = '后台登录'
      this.ConfirmLogout = false
    }
  }
}
</script>