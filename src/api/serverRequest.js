import { getUserToken } from "utils/auth";
const baseUrl = window.g.testURL;
const token = getUserToken();

export function request(api, params) {
  return new Promise((resolve, reject) => {
    fetch(baseUrl + api + `?token=${token || ""}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
      .then((res) => resolve(res.json()))
      .catch((err) => {
        reject(err);
      });
  }).catch((error) => ({ code: -1, message: error.message }));
}

export function getRequest(api) {
  return new Promise((resolve, reject) => {
    fetch(baseUrl + api, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.json()))
      .catch((err) => {
        reject(err);
      });
  }).catch((error) => ({ code: -1, message: error.message }));
}
