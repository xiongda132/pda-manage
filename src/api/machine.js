import { request, getRequest } from "./serverRequest";
import { getUserToken } from "utils/auth";
import { accountObj, memberObj } from "views/TagBind/test";
import { locationObj, nodeObj } from "views/Procedure/test";
import { Inventoryobj } from "views/Inventory/test";
import { workFlow } from "views/Manage/test";
import { cardData } from "views/CardManage/test";
// const token = getUserToken();
const isDev = false;
// const isDev = true;

export const getToken = (userName, password) => {
  return request(
    "/seeyon/rest/token", {
      userName,
      password
    }
  );
};

export const getFileTable = (params) => {
  return request("/seeyon/rest/api/dataInfo/filetable", {
    ...params,
  });
};

export const getDataInfo = (params) => {
  return request(`/seeyon/rest/api/dataInfo/card`, {
    ...params,
  });
};

export const getWorkFlow = (params) => {
  return request("/seeyon/rest/api/dataInfo/workFlow", {
    ...params,
  });
};

export const getNode = () => {
  return request(`/seeyon/rest/api/dataInfo/node`);
};

export const getMember = () => {
  return getRequest(`/seeyon/rest/api/findMember?token=${getUserToken()}`);
};

export const getLocation = () => {
  return getRequest(`/seeyon/rest/api/synlocation?token=${getUserToken()}`);
};

/* 台账相关获取接口 */
export const getGzCheck = () => {
  return getRequest(`/seeyon/rest/api/gzCheck?token=${getUserToken()}`);
};

export const getAccount = () => {
  return getRequest(`/seeyon/rest/api/syngz?token=${getUserToken()}`);
};
/*  */

export const getInventoryInfo = (params) => {
  return request("/seeyon/rest/api/syncheck", {
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

export const saveReturnTable = (params) => {
  return request("/seeyon/rest/api/saveReturnTable", {
    ...params,
  });
};

export const saveBorrowTable = (params) => {
  return request("/seeyon/rest/api/saveBorrowTable", {
    ...params,
  });
};

export const saveGzCheck = (params) => {
  return request("/seeyon/rest/api/gzcheckResult", {
    ...params,
  });
};

export const saveAccountData = (params) => {
  return request("/seeyon/rest/api/updateGzData", {
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

export const switchToken = (userName, passWord) => {
  if (isDev) {
    return {
      bindingUser: null,
      userName: userName,
      id: "77b8dd8a-052e-48db-ba0e-8d499883485e",
    };
  } else {
    if (localStorage.getItem("serverPort")) {
      return getToken(userName, passWord);
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

export const switchCard = (params) => {
  if (isDev) {
    return cardData;
  } else {
    if (localStorage.getItem("serverPort")) {
      return getDataInfo(params);
    }
  }
};
