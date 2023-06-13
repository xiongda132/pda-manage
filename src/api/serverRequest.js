import { getUserToken } from "utils/auth";
// const baseUrl = `http://${sessionStorage.getItem("serverPort")}`;
// const token = getUserToken();

function downloadTxtFile(content) {
  const text =
    typeof content === "object" ? JSON.stringify(content) : String(content);

  // 创建一个 Blob 对象
  const blob = new Blob([text], { type: "text/plain" });

  // 创建一个 URL 对象
  const url = URL.createObjectURL(blob);

  // 创建一个 <a> 元素，并设置其属性
  const link = document.createElement("a");
  link.href = url;
  link.download = "example.txt"; // 设置下载的文件名

  // 将 <a> 元素添加到文档中
  document.body.appendChild(link);

  // 模拟点击链接进行下载
  link.click();

  // 清理资源
  URL.revokeObjectURL(url);

  // 移除 <a> 元素
  document.body.removeChild(link);
}

export function request(api, params) {
  console.log(localStorage.getItem("serverPort"));
  console.log("params", params);
  return new Promise((resolve, reject) => {
    fetch(
      `http://${localStorage.getItem("serverPort")}` +
        api +
        `?token=${getUserToken() || ""}`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }
    )
      .then((res) => {
        // console.log("res", res);
        // alert(JSON.stringify(res), "成功回调");
        // console.log(JSON.stringify(res));
        let resObj = res.json();
        // downloadTxtFile(res);
        // alert(JSON.stringify(resObj));
        resolve(resObj);
        return res.text();
      })
      .then((r) => {
        console.log("r", r);
      })
      .catch((err) => {
        // alert(err, "内层错误回调");
        let err_ = {
          ...err,
          url: `http://${localStorage.getItem("serverPort")}` + api,
        };
        // console.log("2");
        // downloadTxtFile(err);
        // alert(JSON.stringify(err_));
        reject(err_);
      });
  }).catch((error) => {
    // alert(error, "外层错误回调");
    let err = {
      code: -1,
      message: error.message,
      url: `http://${localStorage.getItem("serverPort")}` + api,
    };
    // console.log("1");
    // downloadTxtFile(error);
    alert(JSON.stringify(err));
    return err;
  });
}

export function getRequest(api) {
  console.log("登錄調用");
  console.log("serverPort", localStorage.getItem("serverPort"));
  return new Promise((resolve, reject) => {
    fetch(`http://${localStorage.getItem("serverPort")}` + api, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        // alert("成功" + res);
        // console.log(res.body);
        // let resa = "{"a":"123"}";
        // downloadTxtFile(await res.json());
        let resText = await res.text();
        // downloadTxtFile(resText);
        // let resObj = res.json();
        alert(JSON.stringify(`状态码${res.status}`));
        alert(JSON.stringify("后端返回"+ resText));
        resolve(JSON.parse(resText));
      })
      .catch((err) => {
        console.log("内层错误回调", err);
        let err_ = {
          ...err,
          url: `http://${localStorage.getItem("serverPort")}` + api,
        };
        // alert(JSON.stringify(err));
        reject(err_);
      });
  }).catch((error) => {
    // alert("外层错误回调");
    let err = {
      code: -1,
      message: error.message,
      url: `http://${localStorage.getItem("serverPort")}` + api,
    };
    alert(JSON.stringify(error));
    return error;
  });
}
