import { createApp } from "vue";
import App from "../view/popup.vue";
// 增加elementplus组件 - 全部引入
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

const app = createApp(App);

app.use(ElementPlus);
app.mount("#app");
