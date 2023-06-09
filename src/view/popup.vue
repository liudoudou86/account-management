<template>
  <div class="main_app">
    <el-container>
      <el-header>
        <h1>{{ msg }}</h1>
      </el-header>
      <el-main>
        <el-row class="row" justify="space-evenly">
          <el-col :span="15">
            <el-input
              v-model="inputSearch"
              placeholder="请输入标签"
              clearable
            />
          </el-col>
          <el-col :span="9">
            <el-button type="primary" @click="importFile()"> 导入 </el-button>
            <el-button type="primary" @click="exportFile()"> 导出 </el-button>
            <el-button type="primary" @click="addAccount()">
              添加账号
            </el-button>
          </el-col>
        </el-row>
        <el-table
          class="table"
          :default-sort="{ prop: 'index' }"
          :data="
            tableData.filter(
              (data) =>
                !inputSearch ||
                Object.keys(data.tags).some((key) =>
                  data.tags[key].includes(inputSearch)
                )
            )
          "
          border
          style="width: 100%"
          height="330"
          :header-cell-style="{ 'text-align': 'center' }"
        >
          <el-table-column
            prop="username"
            label="账号名称"
            align="left"
            width="180"
          />
          <el-table-column prop="tags" label="标签" align="left" width="310">
            <template v-slot="scope">
              <el-tag
                class="tag"
                v-for="(tag, index) in scope.row.tags"
                :key="index"
                effect="light"
                round
                closable
                :disable-transitions="false"
                @close="handleClose(scope.row, tag)"
              >
                {{ tag }}
              </el-tag>
              <el-input
                class="input"
                v-if="scope.row.inputVisible"
                v-model="inputValue"
                ref="inputRef"
                size="small"
                autofocus="autofocus"
                @keyup.enter="handleInputConfirm(scope.row)"
                @blur="hideInput(scope.row)"
              />
              <el-button v-else size="small" @click="showInput(scope.row)">
                + 新标签
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="220"
          >
            <template v-slot="scope">
              <el-button
                link
                type="primary"
                size="small"
                @click="loginAccount(scope.row)"
                >一键登录</el-button
              >
              <el-button
                link
                type="primary"
                size="small"
                @click="getTop(scope.row, scope.$index)"
                :disabled="scope.$index == 0"
                >置顶</el-button
              >
              <el-button
                link
                type="success"
                size="small"
                @click="setCopy(scope.row)"
                >复制</el-button
              >
              <el-button
                link
                type="danger"
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
import { writeFileXLSX, utils } from "xlsx";

export default {
  name: "popupView",
  data() {
    return {
      msg: "账号管理器",
      inputSearch: "",
      tableKey: [],
      tableData: [],
      inputValue: "",
    };
  },
  mounted() {
    // 从本地localstorage遍历所有key和value
    for (var i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      this.tableKey.push(key);
      this.tableData.push(JSON.parse(window.localStorage.getItem(key)));
    }
  },
  methods: {
    importFile() {
      console.log("看这里: " + JSON.stringify(this.tableKey));
      console.log("看那里: " + JSON.stringify(this.tableData));
    },
    exportFile() {
      // 转换为可使用的数组
      const fileData = Array.from(this.tableData);
      const workSheet = utils.json_to_sheet(fileData);
      const workBook = utils.book_new();
      utils.book_append_sheet(workBook, workSheet, "Sheet1");
      writeFileXLSX(workSheet, "账号密码备份.xlsx");
    },
    addAccount() {
      if (!window.localStorage) {
        alert("该浏览器不支持本地存储");
      } else {
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
              let accout = res.url + "_" + res.username;
              window.localStorage.setItem(accout, JSON.stringify(res)); // 储存账号到本地
              window.location.reload(); // 刷新页面
            });
          }
        );
      }
    },
    setCopy(row) {
      let content = "【账号】:" + row.username + "【密码】:" + row.password;
      // 将内容添加进系统剪贴板，完成一键复制
      navigator.clipboard
        .writeText(content)
        .then(() => {
          console.log("复制成功");
        })
        .catch((err) => {
          console.log("复制失败" + err);
        });
    },
    delAccount(row) {
      // 通过slot插槽的方式获取子组件的数据
      // console.log(JSON.stringify(e));
      let accout = row.url + "_" + row.username;
      window.localStorage.removeItem(accout); // 删除本地账号
      window.location.reload(); // 刷新页面
    },
    loginAccount(row) {
      chrome.tabs.query(
        // 获取当前tab
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          let message = {
            action: "InputAccountInfo",
            username: row.username,
            password: row.password,
          };
          // 与content进行通信
          chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
            console.log(res.msg);
          });
        }
      );
    },
    getTop(row, index) {
      this.tableData.splice(index, 1);
      this.tableData.unshift(row);
    },
    handleClose(row, tag) {
      // console.log(JSON.stringify(e.tags));
      let tagsArr = row.tags;
      let accout = row.url + "_" + row.username;
      tagsArr.splice(tagsArr.indexOf(tag), 1);
      for (var i = 0; i < tagsArr.length; i++) {
        if (tagsArr[i] === tag) {
          tagsArr.splice(i, 1);
          return tagsArr;
        }
      }
      // console.log(tagsArr);
      let value = {
        url: row.url,
        username: row.username,
        password: row.password,
        inputVisible: false,
        tags: tagsArr,
      };
      window.localStorage.setItem(accout, JSON.stringify(value)); // 储存账号到本地
      window.location.reload(); // 刷新页面
    },
    showInput(row) {
      let accout = row.url + "_" + row.username;
      let value = {
        url: row.url,
        username: row.username,
        password: row.password,
        inputVisible: true,
        tags: row.tags,
      };
      window.localStorage.setItem(accout, JSON.stringify(value)); // 添加tags到本地存储
      window.location.reload(); // 刷新页面
    },
    hideInput(row) {
      let accout = row.url + "_" + row.username;
      this.inputValue = "";
      let value = {
        url: row.url,
        username: row.username,
        password: row.password,
        inputVisible: false,
        tags: row.tags,
      };
      window.localStorage.setItem(accout, JSON.stringify(value)); // 添加tags到本地存储
      window.location.reload(); // 刷新页面
    },
    handleInputConfirm(row) {
      let inputValue = this.inputValue;
      let tagsArr = row.tags;
      let accout = row.url + "_" + row.username;
      if (inputValue) {
        tagsArr.push(inputValue);
        let value = {
          url: row.url,
          username: row.username,
          password: row.password,
          inputVisible: false,
          tags: tagsArr,
        };
        window.localStorage.setItem(accout, JSON.stringify(value)); // 添加tags到本地存储
        window.location.reload(); // 刷新页面
      }
      this.inputValue = "";
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
  width: 750px;
  height: 100%;
  .row {
    margin-bottom: 20px;
  }
  .row:last-child {
    margin-bottom: 0px;
  }
  .table {
    margin-top: 15px;
    .tag {
      margin-right: 5px;
    }
  }
}
</style>
