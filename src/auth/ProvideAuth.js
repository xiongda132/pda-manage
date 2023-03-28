import authContext from "./authContext";
import authActions from "./auth";

function useProvideAuth() {
  const login = (params, cb) => {
    return authActions.login(params, cb);
  };

  const logout = (cb) => {
    return authActions.logout(cb);
  };

  const download = () => {
    return authActions.getData();
  };

  return {
    login,
    logout,
    download,
  };
}

function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export default ProvideAuth;
