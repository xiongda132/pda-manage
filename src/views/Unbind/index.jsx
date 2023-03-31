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
import { useEffect, useState, useRef, useCallback } from "react";
import { getMemberLogin } from "utils/auth";
import {
  getMember,
  switchMember,
  switchFileTable,
  switchLocation,
  saveWorkFlow,
  switchNode,
  switchWorkFlow,
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

const ListItemWithCheckbox = ({ obj }) => {
  const { code, major, model, name, rank, position } = obj;
  const checkboxRef = useRef(null);
  return (
    <List.Item
      prefix={
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox value={code} ref={checkboxRef}></Checkbox>
        </div>
      }
      onClick={() => {
        checkboxRef.current.toggle();
      }}
      arrow={false}
    >
      <div className={styles.singleWrapper}>
        <Grid columns={24} gap={8}>
          <Item span={15}>产品编码: {code}</Item>
          <Item span={9}>负责人: {major}</Item>
          <Item span={15}>规格型号: {model}</Item>
          <Item span={9}>名称: {name}</Item>
          <Item span={15}>保密等级: {rank}</Item>
          <Item span={9}>位置: {position}</Item>
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
  const [scanValue, setScanValue] = useState("");
  const [epcValue, setEpcValue] = useState("");
  const formRef = useRef(null);
  const [flag, setFlag] = useState(false);

  // const back = () => {
  //   history.go(-1);
  // };

  const getProductInfo = () => {
    const productData = [
      {
        code: "202210130001",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130002",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130003",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130004",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130005",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130006",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130007",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130008",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130009",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "2022101300010",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
    ];
    setTimeout(() => {
      setProduct(productData);
    }, 1 * 1000);
  };

  const handleUnbind = () => {
    Toast.show({
      icon: "success",
      content: "解绑成功",
    });
  };

  // const handleChange = (list) => {
  //   console.log(list);
  // };

  useEffect(() => {
    getProductInfo();
  }, []);

  const getFileTable = async () => {
    const memberLogin = getMemberLogin();
    const {
      status,
      data: { memberList },
    } = await switchMember();
    if (status) {
      const { deptCode } = memberList.find(
        (item) => item.memberLogin === memberLogin
      );
      if (deptCode) {
        depCodeRef.current = deptCode;
        sessionStorage.setItem("deptCode", deptCode);
        const {
          status,
          data: { zjtzData },
        } = await switchFileTable(deptCode);
        if (status) {
          // zjtzDataRef.current = zjtzData;
          const filterObj = zjtzData.find(
            (item) => item.facilityCode === scanValue
          );
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
        (item) => item.memberLogin === memberLogin
      );
      if (deptCode) {
        depCodeRef.current = deptCode;
        sessionStorage.setItem("deptCode", deptCode);
        const {
          status,
          data: { zjtzData },
        } = await switchFileTable(deptCode);
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

  useEffect(() => {
    if (scanValue) {
      setLoading(false);
    }
  }, [scanValue]);

  useEffect(() => {
    const func = async () => {
      if (!loading) {
        if (scanValue) {
          getFileTable();
        }
        if (epcValue) {
          getFileTableEpc();
        }
      }
    };
    func();
  }, [loading]);

  // useEffect(() => {
  //   if (accountData.length) {
  //     getFlowInfo();
  //   }
  // }, [accountData.length]);

  useEffect(() => {
    console.log(epcValue);
    if (epcValue) {
      setLoading(false);
    }
  }, [epcValue]);

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
      rfidReadpower: 10,
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
        if (!flag) {
          console.log("走了模式1");
          setScanValue(res.scancode);
        } else {
          console.log("走了模式2");
          // setQrCodeVal(res.scancode);
        }
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
      const epcData = res.data.map(({ epc }) => epc);
      console.log("scancode", res.scancode);
      if (epcData.length > 1) {
        Toast.show({
          icon: "fail",
          content: "扫描到了多个epc",
        });
      } else {
        if (epcData.length === 1) {
          Toast.show({
            icon: "fail",
            content: "扫描到了1个epc",
          });
          setEpcValue(epcData[0]);
        }
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
  }, [pdaReady, refreshData]);

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
                  visibility: product.length ? "visible" : "hidden",
                }} /* 其他方案opacity、display */
              >
                解绑
              </Button>
            </div>
            <div className={styles.listAndAmount}>
              <span className={styles.productList}>产品列表</span>
              <span className={styles.amount}>数量: {product.length}</span>
            </div>
            <div className={styles.productList}>
              <Checkbox.Group onChange={handleChange}>
                <List>
                  {product.map((item) => (
                    <ListItemWithCheckbox key={item.code} obj={item} />
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
