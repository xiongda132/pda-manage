import { request } from "./request";

export function pdaConfig(params = {}) {
  return request("/v1/system/config/set", {
    scanType: 1,
    rfidReadpower: 30,
    rfidWritepower: 10,
    ...params,
  });
}

export function pdaStart(params = {}) {
  return request("/v1/rfid/start", {
    startTime: "2022-12-09 11:11:11:123",
    ...params,
  });
}

export function padStop(params = {}) {
  return request("/v1/rfid/stop", {
    endTime: "2022-12-09 11:11:11:123",
    ...params,
  });
}

export function queryPdaData(params = {}) {
  return request("/v1/rfid/query", {
    startTime: "2021-06-15 14:16:13",
    rows: 1000,
    ...params,
  });
}

export function pdaSingle(params = {}) {
  return request("/v1/rfid/read/single", {
    ...params,
  });
}

export function scanStart(params = {}) {
  return request("/v1/scan/start", {
    startTime: "2022-12-09 11:11:11:123",
    ...params,
  });
}

export function scanStop(params = {}) {
  return request("/v1/scan/stop", {
    endTime: "2022-12-09 11:11:11:123",
    ...params,
  });
}

export function scanQuery(params = {}) {
  return request("/v1/scan/get", {
    startTime: "2021-06-15 14:16:13",
    ...params,
  });
}
