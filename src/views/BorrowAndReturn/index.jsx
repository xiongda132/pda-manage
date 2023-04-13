import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { NavBar, Toast, Button, Grid, Input } from "antd-mobile";
import { useHistory } from "react-router-dom";
import {
  pdaConfig,
  scanStart,
  scanStop,
  scanQuery,
  pdaStart,
  padStop,
  queryPdaData,
} from "api/pda";
import dayjs from "dayjs";
import styles from "./index.module.css";
import { saveReturnTable } from "api/machine";
import { getLocalStorage } from "utils/auth";

const { Item } = Grid;

export default () => {
  const [loading, setLoading] = useState(false);
  const [qrCodeVal, setQrCodeVal] = useState("");
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const history = useHistory();
  const qrRef = useRef(null);
  const [scanMode, setScanMode] = useState("");

  const handleBackMainPage = () => {
    history.push("/");
  };

  const [pdaReady, setPdaReady] = useState(false);
  //初始化二维码扫描
  const initQrcode = useCallback(async () => {
    const pdaConfigRes = await pdaConfig({
      scanType: 1,
      scanOpen: 1,
      scanOutputMode: 2,
      scanEndEvent: 3,
    });
    if (pdaConfigRes.code === 1) {
      const pdaStartRes = await scanStart({
        startTime: configTime.current,
      });
      console.log(pdaStartRes);
      if (pdaStartRes.code === 1) {
        console.log("初始化二维码扫描成功");
        setPdaReady(true);
      } else {
        Toast.show({
          icon: "fail",
          content: "启动失败, " + pdaStartRes.msg,
        });
      }
    } else {
      Toast.show({
        icon: "fail",
        content: "参数配置失败, " + pdaConfigRes.msg,
      });
    }
  }, []);

  //初始化epc扫描
  const initPda = useCallback(async () => {
    const pdaConfigRes = await pdaConfig({
      scanType: 0,
      rfidReadpower: localStorage.getItem("readPower")
        ? localStorage.getItem("readPower")
        : 10,
    });
    if (pdaConfigRes.code === 1) {
      const pdaStartRes = await pdaStart({
        startTime: configTime.current,
      });
      console.log(pdaStartRes);
      if (pdaStartRes.code === 1) {
        console.log("初始化RFID扫描成功");
        setPdaReadyEpc(true);
      } else {
        Toast.show({
          icon: "fail",
          content: "启动失败, " + pdaStartRes.msg,
        });
      }
    } else {
      Toast.show({
        icon: "fail",
        content: "参数配置失败, " + pdaConfigRes.msg,
      });
    }
  }, []);

  const back = useCallback(() => {
    const plus = window.plus || {};
    history.push("/");
    plus?.key.removeEventListener("backbutton", back);
  }, []);

  const plusReady = useCallback(() => {
    const plus = window.plus || {};
    function back() {
      history.push("/");
      plus?.key.removeEventListener("backbutton", back);
    }
    plus?.key.addEventListener("backbutton", back);
  }, []);

  const initDevicePlus = useCallback(() => {
    if (window.plus) {
      plusReady();
    } else {
      document.addEventListener("plusready", plusReady, false);
    }
  }, []);

  const initTip = () => {
    qrRef.current.focus();
    Toast.show({
      content: "请扫描仓库二维码",
    });
  };

  const gzDataRef = useRef([]);
  const getGzData = () => {
    const { status, data } = getLocalStorage("batchManage");
    if (status) {
      gzDataRef.current = data;
    }
  };

  useEffect(() => {
    initQrcode();
    initDevicePlus();
    initTip();
    getGzData();
    return () => {
      console.log("执行了qrcode的停止");
      const plus = window.plus || {};
      scanStop({
        endTime: configTime.current,
      });
      padStop({
        endTime: configTime.current,
      });
      document.removeEventListener("plusReady", plusReady);
      plus?.key.removeEventListener("backbutton", back);
    };
  }, []);

  //二维码扫描轮询
  const refreshData = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    const res = await scanQuery({
      startTime: configTime.current,
    });
    console.log(res);
    if (res.code === 1) {
      if (res.scancode) {
        console.log("scancode", res.scancode);
        setQrCodeVal(res.scancode);
        setPdaReady(false); //状态改变, 自行清理已存在的定时器
        setScanMode("rfid");
      }
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    } else {
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    }
  }, []);

  //epc扫描
  const [epcList, setEpcList] = useState([]);
  const refreshEpcData = useCallback(async () => {
    if (timerEpc.current) clearTimeout(timerEpc.current);
    const res = await queryPdaData({
      startTime: configTime.current,
    });
    console.log(res);
    if (res.code === 1) {
      const curEpcList = res.data.map(({ epc }) => epc);
      setEpcList((preEpcList) => {
        const newEpcList = [...preEpcList];
        curEpcList.forEach((epc) => {
          if (newEpcList.indexOf(epc) === -1) {
            newEpcList.unshift(epc);
          }
        });
        return newEpcList;
      });
      setLoading(false);
      if (timerEpc.current !== null) {
        timerEpc.current = setTimeout(refreshEpcData, 200);
      }
    } else {
      if (timerEpc.current !== null) {
        timerEpc.current = setTimeout(refreshEpcData, 200);
      }
    }
  }, []);

  const timer = useRef(null);
  //启动和停止二维码扫描轮询的副作用
  useEffect(() => {
    if (pdaReady) {
      // console.log("后执行");
      timer.current = 0;
      refreshData();
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [pdaReady]);

  const [pdaReadyEpc, setPdaReadyEpc] = useState(false);

  // 启动和停止epc扫描轮询的副作用
  const timerEpc = useRef(null);
  useEffect(() => {
    if (pdaReadyEpc) {
      timerEpc.current = 0;
      refreshEpcData();
    }
    return () => {
      if (timerEpc.current) {
        clearTimeout(timerEpc.current);
        timerEpc.current = null;
      }
    };
  }, [pdaReadyEpc]);

  useEffect(() => {
    if (scanMode === "qrcode") {
      initQrcode();
    } else if (scanMode === "rfid") {
      initPda();
    }
  }, [scanMode]);

  const handleSave = async () => {
    if (!qrCodeVal) {
      return Toast.show({
        icon: "fail",
        content: "请扫描仓库二维码",
      });
    }
    if (gzList.length) {
      const data = gzList.map((item) => ({
        name: item.gzName,
        code: item.gzCode,
        version: item.version,
        state: item.gzState,
        usefulLife: item.usefulLife,
        remarks: "",
      }));
      const res = await saveReturnTable({ data });
      if (res.status) {
        Toast.show({
          icon: "success",
          content: "上传成功",
        });
      } else {
        Toast.show({
          icon: "fail",
          content: "上传失败",
        });
      }
    } else {
      Toast.show({
        icon: "fail",
        content: "请扫描工装",
      });
    }
  };

  const gzList = useMemo(() => {
    return gzDataRef.current.filter(({ epcData }) => epcList.includes(epcData));
  }, [epcList]);

  return (
    <>
      <div style={{ height: "100vh" }}>
        <NavBar back="返回" onBack={handleBackMainPage}>
          借用归还
        </NavBar>
        <div className={styles.body}>
          <div className={styles.top}></div>
          <div className={styles.detailsBox}>
            <div className={styles.details}>仓库信息</div>
            <div className={styles.code}>
              二维码: &nbsp;
              <Input
                ref={(r) => (qrRef.current = r)}
                placeholder="请扫描二维码..."
                style={{ display: "inline-block", width: "30%" }}
                value={qrCodeVal}
              />
            </div>
            <div className={styles.buttonStyle}>
              <Button
                color="primary"
                style={{ width: "30%" }}
                onClick={handleSave}
              >
                保存上传
              </Button>
            </div>
          </div>
          <div className={styles.listAndAmount}>
            <span className={styles.gzList}>工装列表</span>
            <span className={styles.amount}>数量: {gzList?.length}</span>
          </div>
          {loading ? (
            <p className={styles.waitScan}>等待扫描...</p>
          ) : (
            <div className={styles.list}>
              {gzList.map((item, index) => {
                const {
                  gzName,
                  currentPosition,
                  gzState,
                  gzCode,
                  version,
                  usefulLife,
                } = item;
                return (
                  <div key={index} className={styles.listItem}>
                    <Grid columns={24} gap={8}>
                      <Item span={12}>工装编码: {gzCode}</Item>
                      <Item span={12}>工装状态: {gzState}</Item>
                      <Item span={12}>工装名称: {gzName}</Item>
                      <Item span={12}>软件版本: {version}</Item>
                      <Item span={12}>有效期: {usefulLife}</Item>
                      {/* <Item span={12}>固有位置: {}</Item> */}
                      <Item span={12}>当前位置: {currentPosition}</Item>
                    </Grid>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
