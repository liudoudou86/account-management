console.log("读取DOM");
chrome.runtime.onMessage.addListener(
  //监听扩展程序进程或内容脚本发送的请求
  function (request, sender, sendResponse) {
    if (request.action === "GetAccountInfo") {
      sendResponse({
        username: document.querySelector('input[type="text"]').value,
        password: document.querySelector('input[type="password"]').value,
      });
    }
  }
);
