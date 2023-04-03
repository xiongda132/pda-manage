import { useHistory } from "react-router-dom";
import {
  NavBar,
  Grid,
  Button,
  Toast,
  Checkbox,
  List,
  Radio,
  Space,
} from "antd-mobile";
import styles from "./index.module.css";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { getMemberLogin } from "utils/auth";
import {
  getMember,
  switchMember,
  switchFileTable,
  switchLocation,
  saveWorkFlow,
  switchNode,
  switchWorkFlow,
  savaUnbindInfo,
} from "api/machine";
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

const { Group } = Radio;

const { Item } = Grid;

const ListItemWithCheckbox = ({ obj, setSeletedData }) => {
  const {
    gdhId,
    facilityCode,
    nbName,
    ReqName,
    nodeSecurity,
    currentPlace,
    detailNodeName,
    productionMember,
  } = obj;
  const checkboxRef = useRef(null);
  return (
    <List.Item
      prefix={
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            value={facilityCode}
            ref={checkboxRef}
            onChange={(e) => {
              console.log("e", e);
              setSeletedData((prev) => {
                let cur = [...prev];
                if (e) {
                  cur.push(facilityCode);
                } else {
                  cur = cur.filter((item) => facilityCode !== item);
                }
                return cur;
              });
            }}
          ></Checkbox>
        </div>
      }
      onClick={() => {
        checkboxRef.current.toggle();
      }}
      arrow={false}
    >
      <div className={styles.singleWrapper}>
        <Grid columns={24} gap={8}>
          <Item span={10}>工单号: {gdhId}</Item>
          <Item span={14}>设备编号: {facilityCode}</Item>
          <Item span={12}>内部名称: {nbName}</Item>
          <Item span={12}>需求名称: {ReqName}</Item>
          <Item span={12}>保密等级: {nodeSecurity}</Item>
          <Item span={12}>位置: {currentPlace}</Item>
          <Item span={12}>细化流程节点: {detailNodeName}</Item>
          <Item span={12}>生产人员: {productionMember}</Item>
        </Grid>
      </div>
    </List.Item>
  );
};

export default () => {
  const history = useHistory();
  const [product, setProduct] = useState([]);
  const depCodeRef = useRef(null);
  const zjtzDataRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [scanMode, setScanMode] = useState("");
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const [scanValue, setScanValue] = useState([]);
  const [epcValue, setEpcValue] = useState("");
  const formRef = useRef(null);
  const [flag, setFlag] = useState(false);
  const [seletedData, setSeletedData] = useState([]);

  const handleUnbind = async () => {
    console.log("seletedData", seletedData);
    const unbindList = seletedData?.map((item) => ({
      facilityCode: item,
    }));
    const { status, msg } = await savaUnbindInfo({ unbindList });
    if (status) {
      Toast.show({
        icon: "success",
        content: msg,
      });
    } else {
      Toast.show({
        icon: "fail",
        content: msg,
      });
    }
  };

  const getFileTable = async () => {
    const memberLogin = getMemberLogin();
    const {
      status,
      data: { memberList },
    } = await switchMember();
    if (status) {
      const { deptCode } = memberList.find(
        (item) => item.memberCode === memberLogin
      );
      if (deptCode) {
        depCodeRef.current = deptCode;
        sessionStorage.setItem("deptCode", deptCode);
        const {
          status,
          data: { zjtzData },
        } = await switchFileTable({ deptCode });
        if (status) {
          zjtzDataRef.current = zjtzData; //保存接口数据
        } else {
          Toast.show({
            icon: "fail",
            content: "获取整机台账信息失败",
          });
        }
      }
    } else {
      Toast.show({
        icon: "fail",
        content: "获取部门信息失败",
      });
    }
  };

  const getFileTableEpc = async () => {
    const memberLogin = getMemberLogin();
    const {
      status,
      data: { memberList },
    } = await switchMember();
    if (status) {
      const { deptCode } = memberList.find(
        (item) => item.memberCode === memberLogin
      );
      if (deptCode) {
        depCodeRef.current = deptCode;
        sessionStorage.setItem("deptCode", deptCode);
        const {
          status,
          data: { zjtzData },
        } = await switchFileTable({ deptCode });
        if (status) {
          zjtzDataRef.current = zjtzData;
          // setAccountData(zjtzData);
          console.log("zjtzDataRef.current", zjtzDataRef.current);
          console.log(zjtzData, epcValue);
          const filterObj = zjtzData.find((item) => item.epcData === epcValue);
          if (!filterObj) {
            Toast.show({
              icon: "fail",
              content: "epc未绑定整机",
            });
          } else {
            const {
              facilityCode,
              nbName,
              gdhId,
              projectTeam,
              nodeName,
              currentPlace,
              nodeSecurity,
              productionMember,
            } = filterObj;
            console.log("formRef.current", formRef.current);
            formRef.current.setFieldsValue({
              facilityCode,
              nbName,
              gdhId,
              department: projectTeam,
              procedureName: nodeName,
              currentPlace: currentPlace ? currentPlace : "",
              nodeSecurity,
              productionMember,
              department: projectTeam,
            });
          }
        } else {
          Toast.show({
            icon: "fail",
            content: "获取整机台账信息失败",
          });
        }
      }
    } else {
      Toast.show({
        icon: "fail",
        content: "获取部门信息失败",
      });
    }
  };

  const handleChange = (mode) => {
    setScanMode(mode);
    setPdaReady(false);
    setPdaReadyEpc(false);
  };

  const [pdaReady, setPdaReady] = useState(false);
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

  useEffect(() => {
    initDevicePlus();
    getFileTable();
    return () => {
      console.log("执行了qrcode的停止");
      const plus = window.plus || {};
      scanStop({
        endTime: configTime.current,
      });
      document.removeEventListener("plusReady", plusReady);
      plus?.key.removeEventListener("backbutton", back);
    };
  }, []);

  const refreshData = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    const res = await scanQuery({
      startTime: configTime.current,
    });
    console.log(res);
    if (res.code === 1) {
      if (res.scancode) {
        console.log("scancode", res.scancode);
        // if (!flag) {
        console.log("此次扫描值为", res.scancode);
        setScanValue((preQrcodeList) => {
          const newQrcodeList = [...preQrcodeList];
          if (!newQrcodeList.includes(res.scancode)) {
            newQrcodeList.unshift(res.scancode);
          }
          return newQrcodeList;
        });
        setLoading(false);
        // } else {
        //   console.log("走了模式2");
        //   setQrCodeVal(res.scancode);
        // }
      }
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    } else {
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    }
  }, [flag]);

  const refreshEpcData = useCallback(async () => {
    if (timerEpc.current) clearTimeout(timerEpc.current);
    const res = await queryPdaData({
      startTime: configTime.current,
    });
    console.log(res);
    if (res.code === 1) {
      const curEpcList = res.data.map(({ epc }) => epc);
      setScanValue((preEpcList) => {
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
  useEffect(() => {
    if (pdaReady) {
      timer.current = 0;
      refreshData();
    }
    return () => {
      console.log("退出停止");
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [pdaReady /* refreshData */]);

  const [pdaReadyEpc, setPdaReadyEpc] = useState(false);
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

  const viewList = useMemo(() => {
    if (scanMode === "qrcode") {
      return zjtzDataRef.current?.filter(
        ({ facilityCode }) => scanValue.indexOf(facilityCode) !== -1
      );
    }
    if (scanMode === "rfid") {
      return zjtzDataRef.current?.filter(
        ({ epcData }) => scanValue.indexOf(epcData) !== -1
      );
    }
  }, [scanValue]);

  return (
    <>
      <div className={styles.unbindContainer}>
        <NavBar back="返回" onBack={back}>
          批量解绑
        </NavBar>
        {loading ? (
          <div className={styles.scanQrcode}>
            请选择扫描模式, 进行扫描...
            <Group onChange={handleChange}>
              <Space>
                <Radio value="qrcode">二维码</Radio>
                <Radio value="rfid">RFID</Radio>
              </Space>
            </Group>
          </div>
        ) : (
          <div className={styles.unbindWrapper}>
            <div className={styles.buttonWrapper}>
              <Button
                className={styles.buttonStyle}
                color="primary"
                size="large"
                onClick={handleUnbind}
                style={{
                  visibility: viewList.length ? "visible" : "hidden",
                }} /* 其他方案opacity、display */
              >
                解绑
              </Button>
            </div>
            <div className={styles.listAndAmount}>
              <span className={styles.productList}>产品列表</span>
              <span className={styles.amount}>数量: {viewList.length}</span>
            </div>
            <div className={styles.productList}>
              <Checkbox.Group /* onChange={handleChange} */>
                <List>
                  {viewList.map((item) => (
                    <ListItemWithCheckbox
                      key={item.facilityCode}
                      obj={item}
                      setSeletedData={setSeletedData}
                    />
                  ))}
                </List>
              </Checkbox.Group>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
