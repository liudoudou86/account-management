<template>
  <div class="main_app">
    <el-container>
      <el-header>
        <h1>{{ msg }}</h1>
      </el-header>
      <el-main>
        <el-row :gutter="10" justify="space-evenly">
          <el-col :span="14">
            <el-input v-model="input" placeholder="请输入标签" />
          </el-col>
          <el-col :span="3">
            <el-button type="success"> 导入 </el-button>
          </el-col>
          <el-col :span="3">
            <el-button type="success"> 导出 </el-button>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addAccount()">
              添加账号
            </el-button>
          </el-col>
        </el-row>
        <el-table class="table" :data="tableData" border style="width: 100%">
          <el-table-column
            prop="username"
            label="账号名称"
            align="center"
            width="170"
          />
          <el-table-column prop="tag" label="标签" align="center" width="160">
            <el-tag
              class="tag"
              v-for="tag in tags"
              :key="tag.name"
              effect="Plain"
            >
              {{ tag.name }}
            </el-tag>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="230"
          >
            <template v-slot="scope">
              <el-button
                link
                type="primary"
                size="small"
                @click="login(scope.row)"
                >一键登录</el-button
              >
              <el-button link type="primary" size="small">编辑标签</el-button>
              <el-button link type="primary" size="small">置顶</el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="delAccount(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
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
      tableData: [],
      tags: [{ name: "测试环境" }, { name: "管理员" }],
    };
  },
  mounted() {
    // 从本地localstorage遍历所有key和value
    for (var i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      // console.log(key);
      this.tableData.push(JSON.parse(window.localStorage.getItem(key)));
    }
  },
  methods: {
    addAccount() {
      chrome.tabs.query(
        // 获取当前tab
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          let message = { action: "GetAccountInfo" };
          // 与content进行通信
          chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
            // console.log(res);
            let accout = res.username;
            window.localStorage.setItem(accout, JSON.stringify(res)); // 储存账号到本地
            window.location.reload(); // 刷新页面
          });
        }
      );
    },
    login(e) {
      chrome.tabs.query(
        // 获取当前tab
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          let message = {
            action: "InputAccountInfo",
            username: e.username,
            password: e.password,
          };
          // 与content进行通信
          chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
            console.log(res.msg);
          });
        }
      );
    },
    delAccount(e) {
      // 通过slot插槽的方式获取子组件的数据
      // console.log(JSON.stringify(e));
      window.localStorage.removeItem(e.username); // 删除本地账号
      window.location.reload(); // 刷新页面
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
  width: 600px;
  height: 100%;
  .table {
    margin-top: 15px;
    .tag {
      margin-left: 5px;
    }
  }
}
</style>
