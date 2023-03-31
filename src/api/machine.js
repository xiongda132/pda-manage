import { request, getRequest } from "./serverRequest";
import { getUserToken } from "utils/auth";
import { accountObj, memberObj } from "views/TagBind/test";
import { locationObj, nodeObj } from "views/Procedure/test";
import { Inventoryobj } from "views/Inventory/test";
import { workFlow } from "views/Manage/test";
const token = getUserToken();
const serverPort = sessionStorage.getItem("serverPort");

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

export const getWorkFlow = (params) => {
  return request("/seeyon/rest/api/dataInfo/workFlow", {
    ...params,
  });
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

export const switchFileTable = (deptCode) => {
  if (serverPort) {
    return getFileTable(deptCode);
  } else {
    return accountObj;
  }
};

export const switchMember = () => {
  if (serverPort) {
    return getMember();
  } else {
    return memberObj;
  }
};

export const switchToken = (userName, passWord) => {
  if (serverPort) {
    return getToken(userName, passWord);
  } else {
    return {
      bindingUser: null,
      userName: userName,
      id: "77b8dd8a-052e-48db-ba0e-8d499883485e",
    };
  }
};

export const switchInventoryInfo = (params) => {
  if (serverPort) {
    return getInventoryInfo(params);
  } else {
    return Inventoryobj;
  }
};

export const switchLocation = () => {
  if (serverPort) {
    return getLocation();
  } else {
    return locationObj;
  }
};

export const switchNode = () => {
  if (serverPort) {
    return getNode();
  } else {
    return nodeObj;
  }
};

export const switchWorkFlow = (params) => {
  if (serverPort) {
    return getWorkFlow(params);
  } else {
    return workFlow;
  }
};
