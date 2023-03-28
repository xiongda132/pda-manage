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
