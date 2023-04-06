import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  pdaConfig,
  scanStart,
  scanStop,
  scanQuery,
  pdaSingle,
  pdaStart,
  padStop,
  queryPdaData,
} from "api/pda";
import dayjs from "dayjs";
import styles from "./index.module.css";
import {
  getFileTable,
  getMember,
  saveLedger,
  switchFileTable,
  switchMember,
} from "api/machine";
import { getMemberLogin, getLocalStorage, setLocalStorage } from "utils/auth";
import { accountObj, memberObj } from "./test";

const { Item } = Grid;

export default () => {
  const [billNo, setBillNo] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrCodeVal, setQrCodeVal] = useState("");
  const [epcCodeVal, setEpcCodeVal] = useState("");
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const history = useHistory();
  const qrRef = useRef(null);
  const epcRef = useRef(null);
  const depCodeRef = useRef(null);
  const [scanMode, setScanMode] = useState("");
  const valueRef = useRef("");

  const handleBackMainPage = () => {
    history.push("/");
  };

  const getBillNo = async () => {
    //本地逻辑
    const {
      status,
      data: { zjtzData },
    } = getLocalStorage("zjtzData");
    if (status) {
      const gdhList = [...new Set(zjtzData.map((item) => item.gdhId))].map(
        (item) => ({ label: item, value: item })
      );
      const data = [...gdhList];
      data.unshift({ label: "请选择工单", value: "" });
      setBillNo(data);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取整机台账信息失败",
      });
    }

    //在线逻辑
    // const memberLogin = getMemberLogin();
    // const {
    //   status,
    //   data: { memberList },
    // } = await switchMember();
    // if (status) {
    //   const { deptCode } = memberList.find(
    //     (item) => item.memberCode === memberLogin
    //   );
    //   if (deptCode) {
    //     depCodeRef.current = deptCode;
    //     sessionStorage.setItem("deptCode", deptCode);
    //     const {
    //       status,
    //       data: { zjtzData },
    //     } = await switchFileTable({ deptCode });
    //     if (status) {
    //       const gdhList = [...new Set(zjtzData.map((item) => item.gdhId))].map(
    //         (item) => ({ label: item, value: item })
    //       );
    //       const data = [...gdhList];
    //       data.unshift({ label: "请选择工单", value: "" });
    //       setBillNo(data);
    //     } else {
    //       Toast.show({
    //         icon: "fail",
    //         content: "获取整机台账信息失败",
    //       });
    //     }
    //   }
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "获取部门信息失败",
    //   });
    // }
  };

  const handleCancel = () => {
    if (epcCodeVal || qrCodeVal) {
      setEpcCodeVal("");
      setQrCodeVal("");
      setPdaReady(true);
      setPdaReadyEpc(false);
      setScanMode("qrcode");
      setTimeout(() => {
        qrRef.current.focus();
      }, 0);
      Toast.show({
        content: "请重新扫码",
      });
    } else {
      Toast.show({
        content: "绑定过程才能进行取消",
      });
      qrRef.current.focus();
    }
  };

  const codeList = useMemo(
    () => machineList.map((item) => item.facilityCode),
    [machineList]
  );

  const handleBind = async () => {
    console.log(machineList.length);
    if (!machineList.length) {
      return Toast.show({
        content: "请选择工单",
      });
    }
    if (!qrCodeVal) {
      return Toast.show({
        content: "请扫描二维码",
      });
    }
    if (!epcCodeVal) {
      return Toast.show({
        content: "请扫描epc",
      });
    }
    if (!codeList.includes(qrCodeVal)) {
      return Toast.show({
        content: "整机不属于此工单",
      });
    }
    const dataMap = [...machineList];
    dataMap.forEach((item, index, arr) => {
      if (item.facilityCode === qrCodeVal) {
        arr.splice(index, 1);
        arr.unshift({
          gdhId: item.gdhId,
          facilityCode: item.facilityCode,
          nbName: item.nbName,
          ReqName: item.ReqName,
          nodeSecurity: item.nodeSecurity,
          currentPlace: item.currentPlace,
          epcData: epcCodeVal,
          bindState: "已绑",
          cardAmount: item.cardAmount,
          nodeAmount: item.nodeAmount,
        });
      }
    });
    const zjtzData = [];
    dataMap.forEach((item) => {
      if (item.bindState === "已绑") {
        zjtzData.push({
          facilityCode: item.facilityCode,
          epcData: item.epcData,
        });
      }
    });
    Toast.show({
      icon: "success",
      content: "已绑定",
    });

    //本地逻辑, 获取本地数据进行更新
    if (getLocalStorage("zjtzData")) {
      let zjtzDataRes = { ...getLocalStorage("zjtzData") };
      zjtzDataRes.data.zjtzData.forEach((item) => {
        if (item.facilityCode === qrCodeVal) {
          item.epcData = epcCodeVal;
        }
      });
      setLocalStorage("zjtzData", zjtzDataRes);
    }

    //本地逻辑, 对操作数据进行存储
    if (getLocalStorage("zjtzDataUpload")) {
      const zjtzDataUpload = [...getLocalStorage("zjtzDataUpload")];
      zjtzDataUpload.push({
        facilityCode: qrCodeVal,
        epcData: epcCodeVal,
      });
      setLocalStorage("zjtzDataUpload", zjtzDataUpload);
    } else {
      setLocalStorage("zjtzDataUpload", zjtzData);
    }

    // 删除本地缓存的解绑数据
    if (getLocalStorage("unbindListUpload")) {
      const unbindListUpload = [...getLocalStorage("unbindListUpload")];
      if (unbindListUpload.length > 0) {
        unbindListUpload.forEach((item, index, arr) => {
          if (item.facilityCode === qrCodeVal) {
            arr.splice(index, 1);
          }
        });
      }
      setLocalStorage("unbindListUpload", unbindListUpload);
    }

    //在线逻辑
    // const { status } = await saveLedger({ zjtzData });
    // if (status) {
    //   Toast.show({
    //     icon: "success",
    //     content: "上传成功",
    //   });
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "上传失败",
    //   });
    // }
    setMachineList(dataMap);
    setEpcCodeVal("");
    setQrCodeVal("");
    setPdaReadyEpc(false); //关闭epc轮询
    setPdaReady(true); //开启qrcode轮询
    setScanMode("qrcode");
    setTimeout(() => {
      qrRef.current.focus();
    }, 0);
  };

  //点击读取epc逻辑
  // const handleScan = async () => {
  //   if (!epcCodeVal && !qrCodeVal) {
  //     return Toast.show({
  //       content: "绑定过程才能进行取消",
  //     });
  //   }
  //   const res = await pdaSingle({
  //     address: "2", //默认
  //     blockCount: "2", //epc长度/4
  //     password: "", //默认
  //   });
  //   console.log(res);
  //   if (res.code === 1) {
  //     if (res.epc) {
  //       setEpcCodeVal(res.epc);
  //     }
  //   } else {
  //     Toast.show({
  //       icon: "fail",
  //       content: "扫描epc失败",
  //     });
  //   }
  // };

  const handleChange = async (e) => {
    const {
      target: { value },
    } = e;
    valueRef.current = value;

    //本地逻辑
    const {
      status,
      data: { zjtzData },
    } = getLocalStorage("zjtzData");

    //在线逻辑
    // const {
    //   status,
    //   data: { zjtzData },
    // } = await switchFileTable({ deptCode: depCodeRef.current });
    if (status) {
      const machineList = zjtzData
        .filter((item) => item.gdhId === value)
        .map((item) => ({
          ...item,
          bindState: item.epcData ? "已绑" : "未绑",
        }));
      setMachineList(machineList);
      setPdaReady(true);
      setLoading(true);
      qrRef.current.focus();
    } else {
      Toast.show({
        icon: "fail",
        content: "获取整机信息失败",
      });
    }
    // getMachineList();
    // qrRef.current.focus();
  };

  useEffect(() => {
    getBillNo();
  }, []);

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
    Toast.show({
      content: "请选择工单",
    });
  };

  useEffect(() => {
    // initPda();
    initQrcode();
    initDevicePlus();
    initTip();
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
  const refreshEpcData = useCallback(async () => {
    if (timerEpc.current) clearTimeout(timerEpc.current);
    const res = await queryPdaData({
      startTime: configTime.current,
    });
    console.log(res);
    if (res.code === 1) {
      const curEpcList = res.data.map(({ epc }) => epc);
      if (curEpcList.length > 1) {
        Toast.show({
          content: "扫到了多个epc",
        });
      } else if (curEpcList.length === 1) {
        setEpcCodeVal(curEpcList?.[0]);
      }
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

  //根据已扫qrcode状态, 进行下一步聚焦,
  useEffect(() => {
    if (qrCodeVal) {
      epcRef.current.focus();
    }
  }, [qrCodeVal]);

  useEffect(() => {
    if (scanMode === "qrcode") {
      initQrcode();
    } else if (scanMode === "rfid") {
      initPda();
    }
  }, [scanMode]);

  const bindAmount = useMemo(() => {
    return machineList.filter((item) => item.epcData)?.length;
  }, [machineList]);

  return (
    <>
      <div style={{ height: "100vh" }}>
        <NavBar back="返回" onBack={handleBackMainPage}>
          标签绑定
        </NavBar>
        <div className={styles.body}>
          <div className={styles.top}>
            <div className={styles.bill}>工单</div>
            <select
              name="select"
              className={styles.select}
              onChange={handleChange}
            >
              {billNo.map((item) => {
                return (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </div>
          <div className={styles.detailsBox}>
            <div className={styles.details}>绑定明细</div>
            <div className={styles.code}>
              编码: &nbsp;
              <Input
                ref={(r) => (qrRef.current = r)}
                placeholder="请扫描二维码..."
                style={{ display: "inline-block", width: "80%" }}
                value={qrCodeVal}
              />
            </div>
            <div>
              epc: &nbsp;
              <Input
                ref={(r) => (epcRef.current = r)}
                placeholder="请扫描epc..."
                style={{ display: "inline-block", width: "80%" }}
                value={epcCodeVal}
              />
              {/* <Button style={{ width: "30%" }} onClick={handleScan}>
                读取epc
              </Button> */}
            </div>
            <div className={styles.buttonStyle}>
              <Button
                color="primary"
                style={{ width: "30%" }}
                onClick={handleBind}
              >
                绑定
              </Button>
              <Button style={{ width: "30%" }} onClick={handleCancel}>
                取消
              </Button>
            </div>
          </div>
          {loading && (
            <div className={styles.bottom}>
              <div className={styles.listAndAmount}>
                <span className={styles.machineList}>整机列表</span>
                <div>
                  <span className={styles.amount}>
                    总数量: {machineList?.length}
                  </span>
                  <span className={styles.amount}>绑定数量: {bindAmount}</span>
                </div>
              </div>
              <div className={styles.listContent}>
                {machineList.map((item, index) => {
                  const {
                    gdhId,
                    facilityCode,
                    nbName,
                    ReqName,
                    nodeSecurity,
                    currentPlace,
                    epcData,
                    bindState,
                    cardAmount,
                    nodeAmount,
                  } = item;
                  return (
                    <div key={index} className={styles.listItem}>
                      <Grid columns={24} gap={8}>
                        <Item span={24}>工单号: {gdhId}</Item>
                        <Item span={24}>设备编号: {facilityCode}</Item>
                        <Item span={12}>内部名称: {nbName}</Item>
                        <Item span={12}>需求名称: {ReqName}</Item>
                        <Item span={12}>涉密等级: {nodeSecurity}</Item>
                        <Item span={12}>位置: {currentPlace}</Item>
                        <Item span={12}>板卡数量: {cardAmount}</Item>
                        <Item span={12}>节点数量: {nodeAmount}</Item>
                        <Item span={18}>EPC信息: {epcData || "无"}</Item>
                        <Item span={6}>
                          <div
                            style={{
                              background: epcData ? "#00bfbf" : "#f35b5b",
                              textAlign: "center",
                              padding: "7px 0px",
                            }}
                          >
                            {epcData ? "已绑" : "未绑"}
                          </div>
                        </Item>
                      </Grid>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
