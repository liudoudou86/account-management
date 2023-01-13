console.log("content读取DOM");

// 定义全局变量
let usernameInput = document.querySelector('input[type="text"]');
let passwordInput = document.querySelector('input[type="password"]');
let submit = document.querySelector("button");
// 通过添加EventTarget方法监听事件处理
let evt = new Event("input", {
  bubbles: true,
});

chrome.runtime.onMessage.addListener(
  // 监听扩展程序发送的请求
  function (request, sender, sendResponse) {
    if (request.action === "GetAccountInfo") {
      sendResponse({
        username: usernameInput.value,
        password: passwordInput.value,
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
