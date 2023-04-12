import { getUserToken } from "utils/auth";
// const baseUrl = `http://${sessionStorage.getItem("serverPort")}`;
// const token = getUserToken();

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
        // alert(JSON.stringify(res), "成功回调");
        // console.log(JSON.stringify(res));
        let resObj = res.json();

        // alert(JSON.stringify(resObj));
        resolve(resObj);
      })
      .catch((err) => {
        // alert(err, "内层错误回调");
        let err_ = {
          ...err,
          url: `http://${localStorage.getItem("serverPort")}` + api,
        };
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
    alert(JSON.stringify(err));
    return err;
  });
}

export function getRequest(api) {
  console.log("serverPort", localStorage.getItem("serverPort"));
  return new Promise((resolve, reject) => {
    fetch(`http://${localStorage.getItem("serverPort")}` + api, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        // alert("成功" + res);
        // console.log(res.body);
        // let resa = "{"a":"123"}";
        let resObj = res.json();

        // alert(JSON.stringify(resObj));
        resolve(resObj);
      })
      .catch((err) => {
        // alert(err, "内层错误回调");
        let err_ = {
          ...err,
          url: `http://${localStorage.getItem("serverPort")}` + api,
        };
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
    alert(JSON.stringify(err));
    return err;
  });
}
