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
        let resObj = res.json();

        // alert(JSON.stringify(resObj));
        resolve(resObj);
      })
      .catch((err) => {
        let err_ = {
          ...err,
          url: `http://${localStorage.getItem("serverPort")}` + api,
        };
        // alert(JSON.stringify(err_));
        reject(err_);
      });
  }).catch((error) => {
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
        let resObj = res.json();

        // alert(JSON.stringify(resObj));
        resolve(resObj);
      })
      .catch((err) => {
        let err_ = {
          ...err,
          url: `http://${localStorage.getItem("serverPort")}` + api,
        };
        // alert(JSON.stringify(err_));
        reject(err_);
      });
  }).catch((error) => {
    let err = {
      code: -1,
      message: error.message,
      url: `http://${localStorage.getItem("serverPort")}` + api,
    };
    alert(JSON.stringify(err));
    return err;
  });
}
