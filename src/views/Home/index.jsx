import { useHistory, Link, useLocation } from "react-router-dom";
import styles from "./index.module.css";
import { Toast, reduceMotion, Button } from "antd-mobile";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import downloadSvg from "./svg/download.svg";
import scanSvg from "./svg/scan.svg";
import uploadSvg from "./svg/upload.svg";
import specialDevice from "./svg/specialDevice.svg";
import useAuth from "../../auth/useAuth";

const CLogin = (props) => {
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const auth = useAuth();

  const back = useCallback(() => {
    const plus = window.plus || {};
    console.log("退出登录");
    console.log(location, "location");
    history.push("/login");
    plus?.key.removeEventListener("backbutton", back);
  }, [location]);

  const plusReady = useCallback(() => {
    const plus = window.plus || {};
    function back() {
      console.log("退出登录");
      history.push("/login");
      plus?.key.removeEventListener("backbutton", back);
    }
    plus?.key.addEventListener("backbutton", back);
  }, [history, location]);

  const initDevicePlus = useCallback(() => {
    if (window.plus) {
      plusReady();
    } else {
      document.addEventListener("plusready", plusReady, false);
    }
  }, [plusReady]);

  useEffect(() => {
    initDevicePlus();
    return () => {
      const plus = window.plus || {};
      document.removeEventListener("plusReady", plusReady);
      plus?.key.removeEventListener("backbutton", back);
    };
  }, [initDevicePlus]);

  const handleTagBind = () => {
    history.push("/tagBind");
  };
  const handleCardManage = () => {
    history.push("/cardManage");
  };

  const handleProcedure = () => {
    history.push("/procedure");
  };

  const handleManage = () => {
    history.push("/manage");
  };

  const handleReturnToWarehouse = () => {
    history.push("/returnToWarehouse");
  };

  const handleLend = () => {
    history.push("/lend");
  };

  const handleInventory = () => {
    history.push("/inventory");
  };

  const handleUnbind = () => {
    history.push("/unbind");
  };

  const handleDataSync = () => {
    history.push("/dataSync");
  };

  const getData = async () => {
    const res = await axios.post(
      "http://47.94.5.22:6302/supoin/api/archive/inventory/getCheckList"
    );
    if (res.status === 200) {
      sessionStorage.setItem("downloadData", JSON.stringify(res.data.data));
      Toast.show({
        icon: "success",
        content: "下载成功",
      });
      setOpen(false);
    } else {
      Toast.show({
        icon: "fail",
        content: "下载失败",
      });
    }
  };

  const logout = () => {
    auth.logout(() => {
      history.push("/login");
      sessionStorage.clear();
      Toast.show("退出成功");
    });
  };
  // const handleOk = () => {
  //   getData();
  // };

  // const handleSpecialDevice = () => {
  //   history.push("/specialDevice");
  // };

  const borrowAndReturn = () => {
    history.push("/borrowAndReturn");
  };

  const batchManage = () => {
    history.push("/batchManage");
  };

  const inventoryManage = () => {
    history.push("/inventoryManage");
  };

  useEffect(() => {
    reduceMotion();
  }, []);
  return (
    <>
      <div style={{ height: "100vh" }}>
        <div className={styles.inventory}>
          整机及工装管理系统
          <Button
            style={{
              position: "absolute",
              right: 0,
              background: "#2AADEE",
            }}
            onClick={logout}
            color="primary"
          >
            注销
          </Button>
        </div>
        <div className={styles.content}>
          <div className={styles.dataSync} onClick={handleDataSync}>
            数据同步
          </div>
          <div className={styles.machineBox}>
            <div className={styles.machine}>整机管理</div>
            <div className={styles.machineContent}>
              <div>
                <div onClick={handleTagBind}>标签绑定</div>
              </div>
              <div>
                <div onClick={handleCardManage}>板卡管理</div>
              </div>
              <div>
                <div onClick={handleProcedure}>整机批量</div>
              </div>
              <div>
                <div onClick={handleManage}>流程管理</div>
              </div>
              <div>
                <div onClick={handleInventory}>盘点管理</div>
              </div>
              <div>
                <div onClick={handleUnbind}>批量解绑</div>
              </div>
            </div>
          </div>
          <div className={styles.toolBox}>
            <div className={styles.tool}>工装管理</div>
            <div className={styles.toolContent}>
              <div>
                <div onClick={borrowAndReturn}>借用归还</div>
              </div>
              <div>
                <div onClick={batchManage}>批量管理</div>
              </div>
              <div>
                <div onClick={inventoryManage}>盘点管理</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CLogin;
