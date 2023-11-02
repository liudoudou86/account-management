<template>
  <div>
    <el-table
      class="table"
      :default-sort="{ prop: 'index' }"
      :data="
        tableDataUAT.filter(
          (data) =>
            !sendData ||
            Object.keys(data.tags).some((key) =>
              data.tags[key].includes(sendData)
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
        width="200"
      />
      <el-table-column prop="tags" label="标签" align="left" width="300">
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
      <el-table-column fixed="right" label="操作" align="center" width="210">
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
  </div>
</template>

<script>
export default {
  name: "UAT",
  props: ["sendData"], // 接收父组件传递的数据
  data() {
    return {
      rawTableData: [],
      tableDataUAT: [],
      inputValue: "",
      activeName: "UAT",
    };
  },
  mounted() {
    // 从本地localstorage遍历所有key和value
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      this.rawTableData.push(JSON.parse(window.localStorage.getItem(key)));
    }
    console.log("rawTableData", this.rawTableData);
    this.tableDataUAT = this.rawTableData.filter(
      (item) => item.environment === "UAT"
    );
    console.log("tableDataUAT", this.tableDataUAT);
  },
  methods: {
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
        (tab) => {
          let message = { action: "GetCurrentUrl" };
          // 与content进行通信
          chrome.tabs.sendMessage(tab[0].id, message, (res) => {
            let currentUrl = res.url;
            let rowUrl = row.url;
            if (currentUrl.includes(rowUrl)) {
              chrome.tabs.query(
                // 获取当前tab
                {
                  active: true,
                  currentWindow: true,
                },
                (tab) => {
                  let message = {
                    action: "InputAccountInfo",
                    username: row.username,
                    password: row.password,
                  };
                  // 与content进行通信
                  chrome.tabs.sendMessage(tab[0].id, message, (res) => {
                    console.log(res.msg);
                  });
                }
              );
            } else {
              chrome.tabs.create({ url: row.url }, async (tab) => {
                await chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  // 通过args给func传参
                  args: [row],
                  func: (row) => {
                    // 增加延迟输入
                    setTimeout(() => {
                      // 定义全局变量
                      let usernameInput =
                        document.querySelector('input[type="text"]') ||
                        document.querySelector('input[name="username"]');
                      let passwordInput =
                        document.querySelector('input[type="password"]') ||
                        document.querySelector('input[name="password"]');
                      // 此处为了兼容多种类型的按钮
                      let submit =
                        document.querySelector('button[type="button"]') ||
                        document.querySelector('button[type="submit"]');
                      // 通过添加EventTarget方法监听事件处理
                      let evt = new Event("input", {
                        bubbles: true,
                      });
                      usernameInput.value = row.username;
                      usernameInput.dispatchEvent(evt);
                      passwordInput.value = row.password;
                      passwordInput.dispatchEvent(evt);
                      submit.click();
                    }, 3000);
                  },
                });
              });
            }
          });
        }
      );
    },
    getTop(row, index) {
      this.tableDataUAT.splice(index, 1);
      this.tableDataUAT.unshift(row);
    },
    handleClose(row, tag) {
      // console.log(JSON.stringify(e.tags));
      let tagsArr = row.tags;
      let accout = row.url + "_" + row.username;
      tagsArr.splice(tagsArr.indexOf(tag), 1);
      for (let i = 0; i < tagsArr.length; i++) {
        if (tagsArr[i] === tag) {
          tagsArr.splice(i, 1);
          return tagsArr;
        }
      }
      let value = {
        url: row.url,
        username: row.username,
        password: row.password,
        inputVisible: false,
        environment: this.activeName,
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
        environment: this.activeName,
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
        environment: this.activeName,
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
          environment: this.activeName,
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
.table {
  margin-top: 15px;
  .tag {
    margin-right: 5px;
  }
}
</style>
