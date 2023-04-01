import { request, getRequest } from "./serverRequest";
import { getUserToken } from "utils/auth";
import { accountObj, memberObj } from "views/TagBind/test";
import { locationObj, nodeObj } from "views/Procedure/test";
import { Inventoryobj } from "views/Inventory/test";
import { workFlow } from "views/Manage/test";
// const token = getUserToken();
const isDev = false;

export const getToken = async (userName, passWord) => {
  return await getRequest(
    `/seeyon/rest/token/rest/4420c0f0-7789-464a-9269-ab075b8164b3`
  );
};

export const getFileTable = (params) => {
  return request("/seeyon/rest/api/dataInfo/filetable", {
    ...params,
  });
};

export const getDataInfo = () => {
  return getRequest("/seeyon/rest/api/dataInfo/card");
};

export const getWorkFlow = (params) => {
  return request("/seeyon/rest/api/dataInfo/workFlow", {
    ...params,
  });
};

export const getNode = () => {
  return getRequest("/seeyon/rest/api/dataInfo/node");
};

export const getMember = () => {
  return getRequest(`/seeyon/rest/api/findMember?token=${getUserToken()}`);
};

export const getLocation = () => {
  return getRequest(`/seeyon/rest/api/synlocation?token=${getUserToken()}`);
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

export const savaUnbindInfo = (params) => {
  return request("/seeyon/rest/api/unbind", {
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

export const switchFileTable = (deptCode) => {
  if (isDev) {
    return accountObj;
  } else {
    if (localStorage.getItem("serverPort")) {
      return getFileTable(deptCode);
    }
  }
};

export const switchMember = () => {
  if (isDev) {
    return memberObj;
  } else {
    if (localStorage.getItem("serverPort")) {
      return getMember();
    }
  }
};

export const switchToken = async (userName, passWord) => {
  if (isDev) {
    return {
      bindingUser: null,
      userName: userName,
      id: "77b8dd8a-052e-48db-ba0e-8d499883485e",
    };
  } else {
    if (localStorage.getItem("serverPort")) {
      return await getToken(userName, passWord);
    }
  }
};

export const switchInventoryInfo = (params) => {
  if (isDev) {
    return Inventoryobj;
  } else {
    if (localStorage.getItem("serverPort")) {
      return getInventoryInfo(params);
    }
  }
};

export const switchLocation = () => {
  if (isDev) {
    return locationObj;
  } else {
    if (localStorage.getItem("serverPort")) {
      return getLocation();
    }
  }
};

export const switchNode = () => {
  if (isDev) {
    return nodeObj;
  } else {
    if (localStorage.getItem("serverPort")) {
      return getNode();
    }
  }
};

export const switchWorkFlow = (params) => {
  if (isDev) {
    return workFlow;
  } else {
    if (localStorage.getItem("serverPort")) {
      return getWorkFlow(params);
    }
  }
};
