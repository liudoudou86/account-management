console.log("content读取DOM");

chrome.runtime.onMessage.addListener(
  // 监听扩展程序发送的请求
  function (request, sender, sendResponse) {
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
    if (request.action === "GetCurrentUrl") {
      sendResponse({
        url: window.location.href,
      });
    }
    if (request.action === "GetAccountInfo") {
      sendResponse({
        url: window.location.href,
        username: usernameInput.value,
        password: passwordInput.value,
        inputVisible: false,
        environment: request.activeName,
        tags: [],
      });
    }
    if (request.action === "InputAccountInfo") {
      usernameInput.value = request.username;
      usernameInput.dispatchEvent(evt);
      passwordInput.value = request.password;
      passwordInput.dispatchEvent(evt);
      submit.click();
      sendResponse({
        msg: "登录成功",
      });
    }
  }
);
