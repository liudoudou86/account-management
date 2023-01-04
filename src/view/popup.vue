<template>
  <div class="main_app">
    <el-container>
      <el-header>
        <h1>{{ msg }}</h1>
      </el-header>
      <el-main>
        <el-row :gutter="10">
          <el-col><el-input v-model="input" placeholder="请输入" /></el-col>
          <el-col>
            <el-button type="primary" round>添加账号密码</el-button>
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
    };
  },
  methods: {
    test() {
      console.log(this.input);
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
  margin-top: 10px;
  position: relative;
  width: 300px;
  height: 500px;
  .el-row {
    margin-top: 10px;
  }
}
</style>
