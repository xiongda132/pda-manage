import { getUserToken } from "utils/auth";
// const baseUrl = `http://${sessionStorage.getItem("serverPort")}`;
const token = getUserToken();

export function request(api, params) {
  console.log(localStorage.getItem("serverPort"));
  return new Promise((resolve, reject) => {
    fetch(
      `http://${localStorage.getItem("serverPort")}` +
        api +
        `?token=${token || ""}`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }
    )
      .then((res) => resolve(res.json()))
      .catch((err) => {
        reject(err);
      });
  }).catch((error) => ({
    code: -1,
    message: error.message,
    url: `http://${localStorage.getItem("serverPort")}` + api,
  }));
}

export function getRequest(api) {
  console.log(localStorage.getItem("serverPort"));
  return new Promise((resolve, reject) => {
    fetch(`http://${localStorage.getItem("serverPort")}` + api, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.json()))
      .catch((err) => {
        reject(err);
      });
  }).catch((error) => ({
    code: -1,
    message: error.message,
    url: `http://${localStorage.getItem("serverPort")}` + api,
  }));
}
