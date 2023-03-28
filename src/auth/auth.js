import { setAuthentication } from "../utils/auth";
import { Toast } from "antd-mobile";
// import axios from "axios";
import { getToken } from "api/machine";
import { setUserToken, setMemberLogin } from "utils/auth";

let downloadData = [];

const authActions = {
  async login(params, cb) {
    try {
      const { tenantId, userId, pwd } = params;
      const { id } = await getToken(userId, pwd);
      console.log(id);
      // const { id } = {
      //   bindingUser: null,
      //   userName: userId,
      //   id: "77b8dd8a-052e-48db-ba0e-8d499883485e",
      // };
      if (id) {
        setUserToken(id);
        setMemberLogin(userId);
        setAuthentication("1");
        Toast.show({
          content: "登录成功",
          position: "top",
        });
        cb();
      } else {
        Toast.show({
          content: "登录失败",
        });
      }
    } catch (e) {
      Toast.show({
        content: "登录失败",
      });
    }
  },
  logout(cb) {
    setAuthentication("0");
    cb();
  },
  getData() {
    const returnData = () => {
      return downloadData;
    };
    const setData = (newData) => {
      downloadData = newData;
    };
    return {
      returnData,
      setData,
    };
  },
};

export default authActions;
