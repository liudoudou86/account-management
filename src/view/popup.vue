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
        <el-tabs
          v-model="activeName"
          class="demo-tabs"
          type="border-card"
          stretch="true"
          @tab-click="datafilter"
        >
          <el-tab-pane label="【STG环境】" name="STG">
            <STG
              v-if="activeName == 'STG'"
              ref="STG"
              :sendData="inputSearch"
            ></STG>
          </el-tab-pane>
          <el-tab-pane label="【UAT环境】" name="UAT">
            <UAT
              v-if="activeName == 'UAT'"
              ref="UAT"
              :sendData="inputSearch"
            ></UAT>
          </el-tab-pane>
          <el-tab-pane label="【ETC环境】" name="ETC">
            <ETC
              v-if="activeName == 'ETC'"
              ref="ETC"
              :sendData="inputSearch"
            ></ETC>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { read, writeFileXLSX, utils } from "xlsx";
import STG from "./stg";
import UAT from "./uat";
import ETC from "./etc";

export default {
  name: "popupView",
  // 引入子组件
  components: {
    STG,
    UAT,
    ETC,
  },
  data() {
    return {
      msg: "账号保险箱",
      rawTableData: [],
      inputSearch: "",
      inputValue: "",
      buttonVisible: false,
      activeName: "STG",
    };
  },
  mounted() {
    // 从本地localstorage遍历所有key和value
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      this.rawTableData.push(JSON.parse(window.localStorage.getItem(key)));
    }
    console.log("rawTableData", this.rawTableData);
  },
  methods: {
    // TODO 目标: 维持退出的标签页
    datafilter(tab) {
      console.log("当前标签页", tab.paneName);
    },
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
      // 将rawTableData转换为可用的数组
      const initData = JSON.parse(JSON.stringify(this.rawTableData));
      console.log(initData);
      const newArr = initData.map((item) => {
        return item.tags;
      });
      const workSheet = utils.json_to_sheet(this.rawTableData);
      const workBook = utils.book_new();
      utils.book_append_sheet(workBook, workSheet, "Data");
      // 将转换之后的数组插入到已经生成的sheet内容中
      utils.sheet_add_aoa(workSheet, newArr, { origin: "F2" });
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
            let message = {
              action: "GetAccountInfo",
              activeName: this.activeName,
            };
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
  width: 780px;
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
