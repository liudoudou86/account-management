console.log("content读取DOM");

// 定义全局变量
var usernameInput = document.querySelector('input[type="text"]');
var passwordInput = document.querySelector('input[type="password"]');
// 此处为了兼容多种类型的按钮
var submit =
  document.querySelector('button[type="button"]') ||
  document.querySelector('button[type="submit"]');
// 通过添加EventTarget方法监听事件处理
var evt = new Event("input", {
  bubbles: true,
});

chrome.runtime.onMessage.addListener(
  // 监听扩展程序发送的请求
  function (request, sender, sendResponse) {
    if (request.action === "GetAccountInfo") {
      sendResponse({
        username: usernameInput.value,
        password: passwordInput.value,
        inputVisible: false,
        tags: [],
      });
    }
    if (request.action === "InputAccountInfo") {
      usernameInput.value = request.username;
      usernameInput.dispatchEvent(evt);
      // console.log(usernameInput.value);
      passwordInput.value = request.password;
      passwordInput.dispatchEvent(evt);
      // console.log(passwordInput.value);
      submit.click();
      sendResponse({
        msg: "回调成功",
      });
    }
  }
);
