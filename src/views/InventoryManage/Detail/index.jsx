import styles from "./index.module.css";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { NavBar, Grid, Button, Toast, Input, Form } from "antd-mobile";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";
import { pdaConfig, pdaStart, padStop, queryPdaData } from "api/pda";
import { saveGzCheck } from "api/machine";
import { getLocalStorage, setLocalStorage } from "utils/auth";

const { Item } = Grid;

const InventoryItem = ({ item, positionData, setPreData }) => {
  const {
    gzCode,
    gzName,
    gzState,
    checkState,
    version,
    usefulLife,
    currentPosition,
  } = item;
  const formRef = useRef(null);
  const setDefaultValue = () => {
    formRef.current.setFieldsValue({
      gzCode,
      gzName,
      gzState,
      usefulLife,
      version,
      currentPosition,
    });
  };

  const handleInput = () => {
    setPreData((prev) => {
      const cur = [...prev];
      cur.forEach((item) => {
        if (item.gzCode === gzCode) {
          item.version = formRef.current.getFieldValue("version");
        }
      });
      return cur;
    });
  };

  const handlePosition = (e) => {
    setPreData((prev) => {
      const cur = [...prev];
      cur.forEach((item) => {
        if (item.gzCode === gzCode) {
          item.currentPosition = e.target.value;
        }
      });
      return cur;
    });
  };
  useEffect(() => {
    setDefaultValue();
  }, []);
  return (
    <div
      key={gzCode}
      className={styles.inventoryInfo}
      style={{
        background:
          checkState === "已盘"
            ? "rgba(0, 191, 191, .76)"
            : "rgba(242, 242, 242, .87)",
        position: "relative",
      }}
    >
      <div id="inventoryManage" style={{ overflow: "hidden" }}>
        {/* 形成bfc，解决上下外边距重叠现象 */}
        {/* id用于保持个性样式, 不影响其他界面 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "5px",
          }}
        >
          <Button
            style={{
              background:
                checkState === "已盘"
                  ? "rgba(0, 191, 191, .76)"
                  : "rgba(170, 170, 170, .87)",
              color: "#ffffff",
              borderColor: "#ffffff",
            }}
          >
            {checkState}
          </Button>
        </div>
        <Form
          ref={(r) => (formRef.current = r)}
          layout="horizontal"
          mode="card"
        >
          <Form.Item label="工装编码" name="gzCode">
            <Input readOnly />
          </Form.Item>
          <Form.Item label="工装名称" name="gzState">
            <Input readOnly />
          </Form.Item>
          <Form.Item label="软件版本" name="version">
            <Input placeholder="请输入版本..." onChange={handleInput} />
          </Form.Item>
          <Form.Item label="当前位置" name="currentPosition">
            <select onChange={handlePosition}>
              {positionData.map((item) => {
                return (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </Form.Item>
          <Form.Item label="工装状态" name="gzState">
            <Input readOnly />
          </Form.Item>
          <Form.Item label="有效期" name="usefulLife">
            <Input readOnly />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ({
  id,
  inventoryData,
  detailVis,
  setDetailVis,
  inventoryList,
  positionData,
}) => {
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const history = useHistory();
  const [predata, setPreData] = useState(() =>
    inventoryData.filter((item) => item.checkId === id)
  );

  const handleSave = async () => {
    const checkListMap = predata.map(
      ({
        gzName,
        currentPosition,
        gzState,
        gzCode,
        version,
        checkId,
        usefulLife,
        checkState,
      }) => ({
        gzName,
        currentPosition,
        gzState,
        gzCode,
        version,
        checkId,
        usefulLife,
        checkState,
      })
    );

    //本地逻辑, 对操作数据进行存储
    if (getLocalStorage("inventoryManageUpload")) {
      const inventoryManageUpload = [
        ...getLocalStorage("inventoryManageUpload"),
      ];
      inventoryManageUpload.push(...checkListMap);
      setLocalStorage("inventoryManageUpload", inventoryManageUpload);
    } else {
      setLocalStorage("inventoryManageUpload", checkListMap);
    }

    console.log(predata);
    //本地逻辑，对已保存的接口数据修改状态
    if (getLocalStorage("inventoryManage")) {
      let checkListRes = { ...getLocalStorage("inventoryManage") };
      checkListRes.data.forEach((item) => {
        predata.forEach((item2) => {
          if (item.gzCode === item2.gzCode) {
            item.version = item2.version;
            item.currentPosition = item2.currentPosition;
            item.checkState = item2.checkState;
          }
        });
      });
      setLocalStorage("inventoryManage", checkListRes);
    }

    Toast.show({
      icon: "success",
      content: "盘点完成",
    });
  };

  const inventoryDetail = useMemo(() => {
    return inventoryList.filter((item) => item.id === id)?.[0];
  }, [id, inventoryList]);

  const [pdaReady, setPdaReady] = useState(false);
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
      if (pdaStartRes.code === 1) {
        setPdaReady(true);
        console.log("初始化PDA成功");
        Toast.show({
          icon: "success",
          content: "请开始扫描",
        });
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
    if (detailVis) {
      console.log("关闭详情");
      setDetailVis(false);
    } else {
      console.log("返回主页");
      history.push("/");
      plus?.key.removeEventListener("backbutton", back);
    }
  }, []);

  const plusReady = useCallback(() => {
    const plus = window.plus || {};
    function back() {
      if (detailVis) {
        console.log("关闭详情");
        setDetailVis(false);
      } else {
        console.log("返回主页");
        history.push("/");
        plus?.key.removeEventListener("backbutton", back);
      }
    }
    plus?.key.addEventListener("backbutton", back);
  }, [history, detailVis]);

  const initDevicePlus = useCallback(() => {
    if (window.plus) {
      plusReady();
    } else {
      document.addEventListener("plusready", plusReady, false);
    }
  }, [plusReady]);

  useEffect(() => {
    initPda();
    initDevicePlus();
    return () => {
      const plus = window.plus || {};
      padStop({
        endTime: configTime.current,
      });
      document.removeEventListener("plusReady", plusReady);
      plus?.key.removeEventListener("backbutton", back);
    };
  }, [initPda, initDevicePlus]);

  const timer = useRef(null);
  // const [loading, setLoading] = useState(true);
  const [epcList, setEpcList] = useState([]);
  console.log(epcList);
  const refreshData = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    const res = await queryPdaData({
      startTime: configTime.current,
    });
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
      // setLoading(false);
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    } else {
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    }
  }, []);

  useEffect(() => {
    if (pdaReady) {
      timer.current = 0;
      refreshData();
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [pdaReady, refreshData]);

  useEffect(() => {
    if (epcList.length) {
      setPreData((pre) => {
        let cur = [...pre];
        epcList.forEach((item1) => {
          cur.forEach((item2, _, arr) => {
            if (item1 === item2.epcData && item2.checkState === "未盘") {
              //根据epc字段， 其他处可能不同
              item2.checkState = "已盘";
            }
          });
        });
        return cur;
      });
    }
  }, [epcList]);

  const inventoryAmount = useMemo(() => {
    return predata.filter((item) => item.checkState === "已盘").length;
  }, [predata]);

  console.log("predata", predata);

  const handleUpload = async () => {
    if (getLocalStorage("inventoryManageUpload")) {
      const data = getLocalStorage("inventoryManageUpload");
      const res = await saveGzCheck({ data });
      if (res.status) {
        Toast.show({
          icon: "success",
          content: "上传盘点管理信息成功",
        });
        localStorage.removeItem("inventoryManageUpload");
      } else {
        Toast.show({
          icon: "fail",
          content: "上传盘点管理信息失败",
        });
      }
    } else {
      Toast.show({
        icon: "fail",
        content: "没有可上传的数据",
      });
    }
  };

  return (
    <>
      <div className={styles.cardContainer}>
        <NavBar back="返回" onBack={back}>
          盘点单明细
        </NavBar>
        <div className={styles.mainContainer}>
          <div className={styles.machineContainer}>
            <div className={styles.machineInfo}>盘点单详情</div>
            <div className={styles.machineContent}>
              <Grid columns={24} gap={8}>
                <Item span={24}>盘点单号: {inventoryDetail?.id}</Item>
                <Item span={24}>盘点时间: {configTime.current}</Item>
                <Item span={10}>
                  盘点数据: {inventoryAmount} / {predata.length}
                </Item>
                <Item span={7}>
                  <Button color="success" onClick={handleUpload}>
                    盘点上传
                  </Button>
                </Item>
                <Item span={7}>
                  <Button color="primary" onClick={handleSave}>
                    盘点保存
                  </Button>
                </Item>
              </Grid>
            </div>
          </div>
          <div className={styles.listContent}>
            {predata.map((item) => (
              <InventoryItem
                item={item}
                positionData={positionData}
                setPreData={setPreData}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
