export function setAuthentication(isAuthenticated) {
  sessionStorage.setItem("isAuthenticated", isAuthenticated);
}

export function getAuthentication() {
  return sessionStorage.getItem("isAuthenticated");
}

export const setUserToken = (token) => {
  return sessionStorage.setItem("token", token);
};

export const getUserToken = (token) => {
  return sessionStorage.getItem("token");
};

export const setMemberLogin = (member) => {
  return sessionStorage.setItem("memberLogin", member);
};

export const getMemberLogin = () => {
  return sessionStorage.getItem("memberLogin");
};

export const setDeptCode = (deptCode) => {
  return sessionStorage.setItem("deptCode", deptCode);
};

export const getDeptCode = () => {
  return sessionStorage.getItem("deptCode");
};

export const setDeptName = (deptName) => {
  return sessionStorage.setItem("deptName", deptName);
};

export const getDeptName = () => {
  return sessionStorage.getItem("deptName");
};

export const setMemberName = (memberName) => {
  return sessionStorage.setItem("memberName", memberName);
};

export const getMemberName = () => {
  return sessionStorage.getItem("memberName");
};

export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};
