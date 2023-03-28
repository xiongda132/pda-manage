import { request, getRequest } from "./serverRequest";
import { getUserToken } from "utils/auth";
const token = getUserToken();

export const getToken = (userName, passWord) => {
  return getRequest(`/seeyon/rest/token/${userName}/${passWord}`);
};

export const getFileTable = (params) => {
  return request("/seeyon/rest/api/dataInfo/filetable", {
    ...params,
  });
};

export const getDataInfo = () => {
  return getRequest("/seeyon/rest/api/dataInfo/card");
};

export const getWorkFlow = () => {
  return getRequest("/seeyon/rest/api/dataInfo/workFlow");
};

export const getNode = () => {
  return getRequest("/seeyon/rest/api/dataInfo/node");
};

export const getMember = () => {
  return getRequest(`/seeyon/rest/api/findMember?token=${token}`);
};

export const getLocation = () => {
  return getRequest(`/seeyon/rest/api/synlocation?token=${token}`);
};

export const getInventoryInfo = (params) => {
  return request("seeyon/rest/api/syncheck", {
    ...params,
  });
};

export const savaInventoryInfo = (params) => {
  return request("/seeyon/rest/api/checkResult", {
    ...params,
  });
};

export const saveCardInfo = (params) => {
  return request("/seeyon/rest/api/saveCard", {
    ...params,
  });
};

export const saveWorkFlow = (params) => {
  return request("/seeyon/rest/api/saveWorkFlow", {
    ...params,
  });
};

export const saveNode = (params) => {
  return request("/seeyon/rest/api/saveNode", {
    ...params,
  });
};

export const saveLedger = (params) => {
  return request("/seeyon/rest/api/saveLedger", {
    ...params,
  });
};

// const machineApi = {
//   getToken,
//   getFileTable,
//   getDataInfo,
//   getWorkFlow,
//   getNode,
//   saveFileTable,
//   saveCardInfo,
//   saveWorkFlow,
//   saveNode,
// };
