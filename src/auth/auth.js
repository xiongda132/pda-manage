import { setAuthentication } from "../utils/auth";
import { Toast } from "antd-mobile";
// import axios from "axios";
import { getToken, switchToken, switchMember } from "api/machine";
import {
  setUserToken,
  setMemberLogin,
  getMemberLogin,
  setDeptCode,
  setDeptName,
  setMemberName,
} from "utils/auth";

let downloadData = [];

const getTip = async () => {
  const memberLogin = getMemberLogin();
  console.log("memberLogin", memberLogin);
  const {
    status,
    data: { memberList },
  } = await switchMember();

  if (status) {
    const { deptCode, deptName, memberName } = memberList.find(
      (item) => item.memberCode === memberLogin
    );
    if (deptCode) {
      setDeptCode(deptCode);
      setDeptName(deptName);
      setMemberName(memberName);
      alert(`登录id为${memberLogin}; \n部门代码为${deptCode}`);
    } else {
      alert(`部门代码为空`);
    }
  } else {
    Toast.show({
      icon: "fail",
      content: "获取部门信息失败",
    });
  }
};

const authActions = {
  async login(params, cb) {
    try {
      const { tenantId, userId, pwd } = params;
      console.log(userId, pwd);
      // console.log("接口前");
      const res = await switchToken(userId, pwd);
      //  alert(JSON.stringify(res));
      // console.log("接口后", res);
      // alert(JSON.stringify(res));
      // Toast.show({
      //   content: `${JSON.stringify(res)}`,
      //   position: "top",
      // });
      let id = res.id;
      if (id) {
        setUserToken(id);
        setAuthentication("1");
        setMemberLogin(userId);
        getTip();
        // Toast.show({
        //   content: "登录成功",
        //   position: "top",
        // });
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
