<template>
  <div class="main_app">
    <el-container>
      <el-header>
        <h1>{{ msg }}</h1>
      </el-header>
      <el-main>
        <el-row :gutter="5" justify="space-between">
          <el-col :span="16">
            <el-input v-model="input" placeholder="请输入标签" />
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="addAccount()">添加账号</el-button>
          </el-col>
        </el-row>
        <el-row :gutter="5" class="card-header" justify="space-between">
          <el-col :span="8">
            <span>账户: {{ Uname }}</span>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" text>一键登录</el-button>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" text>编辑标签</el-button>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" text>置顶</el-button>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" text>删除</el-button>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "popupView",
  data() {
    return {
      msg: "测试账号管理插件",
      input: "",
      Uname: "",
    };
  },
  methods: {
    addAccount() {
      chrome.tabs.query(
        //获取当前tab
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          let message = { action: "GetAccountInfo" };
          //向tab发送请求
          chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
            console.log("用户名：" + res.username);
            console.log("密码：" + res.password);
            this.Uname = res.username;
          });
        }
      );
    },
  },
};
</script>

<style lang="less" scoped>
.main_app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 5px;
  position: relative;
  width: 530px;
  height: 100%;
  .card-header {
    margin-top: 10px;
  }
}
</style>
