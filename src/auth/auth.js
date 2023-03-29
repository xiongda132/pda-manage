import { setAuthentication } from "../utils/auth";
import { Toast } from "antd-mobile";
// import axios from "axios";
import { getToken, switchToken } from "api/machine";
import { setUserToken, setMemberLogin } from "utils/auth";

let downloadData = [];

const authActions = {
  async login(params, cb) {
    try {
      const { tenantId, userId, pwd } = params;
      const { id } = await switchToken(userId, pwd);
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
