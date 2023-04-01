const baseUrl = window.g.pdaURL;

export function request(api, params) {
  return new Promise((resole, reject) => {
    fetch(baseUrl + api, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
      .then((res) => resole(res.json()))
      .catch((err) => {
        reject(err);
      });
  }).catch((error) => ({ code: -1, message: error.message }));
}
