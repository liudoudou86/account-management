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
            <el-button type="primary" @click="buttonVisible = true">
              导入
            </el-button>
            <el-button type="primary" @click="exportFile"> 导出 </el-button>
            <el-button type="primary" @click="addAccount"> 添加账号 </el-button>
          </el-col>
        </el-row>
        <el-dialog v-model="buttonVisible" title="导入账号密码备份">
          <el-upload
            action=""
            accept=".xls, .XLS, .xlsx, .XLSX"
            :limit="1"
            :http-request="importFile"
          >
            <el-button type="primary"> 上传文件 </el-button>
            <template #tip>
              <div class="el-upload__tip">支持扩展名: .xls .xlsx</div>
            </template>
          </el-upload>
        </el-dialog>
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
import { read, writeFileXLSX, utils } from "xlsx";

export default {
  name: "popupView",
  data() {
    return {
      msg: "账号保险箱",
      inputSearch: "",
      tableData: [],
      inputValue: "",
      buttonVisible: false,
    };
  },
  mounted() {
    // 从本地localstorage遍历所有key和value
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      this.tableData.push(JSON.parse(window.localStorage.getItem(key)));
    }
  },
  methods: {
    async importFile(e) {
      const files = e.file;
      try {
        const newData = await this.excelToJson(files);
        // 将tags进行格式化处理
        newData.forEach((tagsFix) => {
          tagsFix.tags = [tagsFix.tags, tagsFix.tags_1, tagsFix.tags_2].filter(
            (tag) => tag !== undefined
          );
          delete tagsFix.tags_1;
          delete tagsFix.tags_2;
        });
        console.log("读取文件的内容为: " + JSON.stringify(newData));
        for (let i = 0; i < newData.length; i++) {
          let getUrl = newData[i].url;
          let getUsername = newData[i].username;
          let value = newData[i];
          let accout = getUrl + "_" + getUsername;
          window.localStorage.setItem(accout, JSON.stringify(value)); // 储存账号到本地
        }
        window.location.reload(); // 刷新页面
      } catch (err) {
        console.log("errorMessage: " + err);
      }
    },
    excelToJson(file) {
      // 异步读取文件
      return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = (ev) => {
          const data = ev.target.result;
          if (data === null) {
            return Promise.resolve([]);
          }
          const workBook = read(data, {
            type: "binary",
          });
          const workName = workBook.SheetNames[0];
          // 转换成json格式
          const workSheet = utils.sheet_to_json(workBook.Sheets[workName]);
          resolve(workSheet);
        };
        fileReader.readAsBinaryString(file);
      });
    },
    // 异步导出
    async exportFile() {
      // 将tableData转换为可用的数组
      const initData = JSON.parse(JSON.stringify(this.tableData));
      const newArr = initData.map((item) => {
        return item.tags;
      });
      const workSheet = utils.json_to_sheet(this.tableData);
      const workBook = utils.book_new();
      utils.book_append_sheet(workBook, workSheet, "Data");
      // 将转换之后的数组插入到已经生成的sheet内容中
      utils.sheet_add_aoa(workSheet, newArr, { origin: "E2" });
      // 将js对象直接导出
      await writeFileXLSX(workBook, "账号保险箱备份导出.xlsx");
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
      this.tableData.splice(index, 1);
      this.tableData.unshift(row);
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
