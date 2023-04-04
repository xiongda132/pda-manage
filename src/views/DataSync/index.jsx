import {
  NavBar,
  Toast,
  Button,
  Grid,
  Input,
  // ImageViewer,
  // Picker,
  // Tag,
  // Space,
} from "antd-mobile";
import { useHistory, useLocation } from "react-router-dom";
import {
  getFileTable,
  getMember,
  saveLedger,
  saveWorkFlow,
  savaInventoryInfo,
  savaUnbindInfo,
  saveCardInfo,
  switchFileTable,
  switchMember,
  switchCard,
  switchLocation,
  switchWorkFlow,
  switchNode,
  switchInventoryInfo,
} from "api/machine";
import {
  getMemberLogin,
  getDeptCode,
  setLocalStorage,
  getLocalStorage,
} from "utils/auth";
import { useState } from "react";
import styles from "./index.module.css";

export default () => {
  const history = useHistory();
  const [deptCode, setDeptCode] = useState(getDeptCode());
  const handleBackMainPage = () => {
    history.push("/");
  };

  //下载整机台账主表信息
  const getFileTable = async () => {
    const res = await switchFileTable({ deptCode });
    // const {
    //   status,
    //   data: { zjtzData },
    // } = await switchFileTable({ deptCode });
    if (res.status) {
      Toast.show({
        icon: "success",
        content: "获取整机台账信息成功",
      });
      setLocalStorage("zjtzData", res);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取整机台账信息失败",
      });
    }
  };

  //下载板卡明细表信息
  const getCard = async () => {
    const res = await switchCard({ deptCode });
    // const {
    //   status,
    //   data: { cardMessageForm },
    // } = await switchCard({ deptCode });
    if (res.status) {
      Toast.show({
        icon: "success",
        content: "获取板卡信息成功",
      });
      setLocalStorage("cardMessageForm", res);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取板卡信息失败",
      });
    }
  };

  //下载位置信息
  const getLocation = async () => {
    const res = await switchLocation({ deptCode });
    // const {
    //   status,
    //   data: { locationList },
    // } = await switchLocation({ deptCode });
    if (res.status) {
      Toast.show({
        icon: "success",
        content: "获取位置信息成功",
      });
      setLocalStorage("locationList", res);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取位置信息失败",
      });
    }
  };

  //下载生产流程推进记录表信息
  const getWorkFlow = async () => {
    const res = await switchWorkFlow({ deptCode });
    // const {
    //   status,
    //   data: { workflowForm },
    // } = await switchWorkFlow({ deptCode });
    if (res.status) {
      Toast.show({
        icon: "success",
        content: "获取生产流程推进记录表信息成功",
      });
      setLocalStorage("workflowForm", res);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取生产流程推进记录表信息失败",
      });
    }
  };

  //下载内部名称关联流程节点档案表信息
  const getNode = async () => {
    const res = await switchNode({ deptCode });
    // const {
    //   status,
    //   data: { flowNodeForm },
    // } = await switchNode({ deptCode });
    if (res.status) {
      Toast.show({
        icon: "success",
        content: "获取内部名称关联流程节点档案表信息成功",
      });
      setLocalStorage("flowNodeForm", res);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取内部名称关联流程节点档案表信息失败",
      });
    }
  };

  //下载盘点信息
  const getInventoryInfo = async () => {
    const res = await switchInventoryInfo({ memberCode: getMemberLogin() });
    // const {
    //   status,
    //   data: { checkList },
    // } = await switchInventoryInfo({ deptCode });
    if (res.status) {
      Toast.show({
        icon: "success",
        content: "获取盘点信息成功",
      });
      setLocalStorage("checkList", res);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取盘点信息失败",
      });
    }
  };

  //下载所有数据
  const hanldeDownLoad = async () => {
    await getFileTable();
    await getCard();
    await getLocation();
    await getWorkFlow();
    await getNode();
    await getInventoryInfo();
    Toast.show({
      icon: "success",
      content: "下载已完成",
    });
  };

  //上传绑定信息
  const zjtzDataUpload = async () => {
    const zjtzData = getLocalStorage("zjtzDataUpload");
    if (zjtzData) {
      const { status } = await saveLedger({ zjtzData });
      if (status) {
        Toast.show({
          icon: "success",
          content: "上传绑定数据成功",
        });
      } else {
        Toast.show({
          icon: "fail",
          content: "上传绑定数据失败",
        });
      }
    }
  };

  //上传板卡信息
  // const { status } = await saveCardInfo({ cardMessageForm });
  // if (status) {
  //   Toast.show({
  //     icon: "success",
  //     content: "保存信息成功",
  //   });
  // } else {
  //   Toast.show({
  //     icon: "fail",
  //     content: "保存信息失败",
  //   });
  // }
  const cardMessageFormUpload = async () => {
    const cardMessageForm = getLocalStorage("cardMessageFormUpload");
    if (cardMessageForm) {
      const { status } = await saveCardInfo({ cardMessageForm });
      if (status) {
        Toast.show({
          icon: "success",
          content: "上传板卡信息成功",
        });
      } else {
        Toast.show({
          icon: "fail",
          content: "上传板卡信息失败",
        });
      }
    }
  };

  //上传整机批量流程信息
  const workFlowUpload = async () => {
    const workflowForm = getLocalStorage("workflowFormUpload");
    if (workflowForm) {
      const { status } = await saveWorkFlow({ workflowForm });
      if (status) {
        Toast.show({
          icon: "success",
          content: "上传整机批量成功",
        });
      } else {
        Toast.show({
          icon: "fail",
          content: "上传整机批量失败",
        });
      }
    }
  };

  //上传盘点信息
  const inventoryUpload = async () => {
    const checkList = getLocalStorage("inventoryDataUpload");
    if (checkList) {
      const { status } = await savaInventoryInfo({ checkList });
      if (status) {
        Toast.show({
          icon: "success",
          content: "上传盘点信息成功",
        });
      } else {
        Toast.show({
          icon: "fail",
          content: "上传盘点信息失败",
        });
      }
    }
  };

  //上传解绑信息
  const unBindUpload = async () => {
    const unbindList = getLocalStorage("unbindListUpload");
    if (unbindList) {
      const { status } = await savaUnbindInfo({ unbindList });
      if (status) {
        Toast.show({
          icon: "success",
          content: "上传解绑信息成功",
        });
      } else {
        Toast.show({
          icon: "fail",
          content: "上传解绑信息失败",
        });
      }
    }
  };

  //上传所有数据
  const hanldeUpLoad = async () => {
    await zjtzDataUpload();
    await cardMessageFormUpload();
    await workFlowUpload();
    await inventoryUpload();
    await unBindUpload();
    Toast.show({
      icon: "success",
      content: "上传已完成",
    });
  };

  return (
    <>
      <div style={{ height: "100vh" }}>
        <NavBar back="返回" onBack={handleBackMainPage}>
          数据同步
        </NavBar>
        <div className={styles.content}>
          <div className={styles.operate}>
            <div className={styles.downLoad} onClick={hanldeDownLoad}>
              数据一键下载
            </div>
            <div className={styles.upLoad} onClick={hanldeUpLoad}>
              数据一键上传
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
