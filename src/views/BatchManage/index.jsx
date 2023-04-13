import {
  NavBar,
  Grid,
  Button,
  Toast,
  Picker,
  Space,
  Checkbox,
  TextArea,
  Form,
  Input,
  Radio,
  List,
} from "antd-mobile";
import { useHistory } from "react-router-dom";
import styles from "./index.module.css";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { pdaConfig, pdaStart, padStop, queryPdaData } from "api/pda";
import dayjs from "dayjs";
import { saveAccountData } from "api/machine";
import { getLocalStorage, setLocalStorage } from "utils/auth";
// import { nodeObj } from "./test";
import { DatePicker } from "antd";

const { Item } = Grid;

const ListItemWithCheckbox = ({ obj, setSeletedData }) => {
  const { gzName, currentPosition, gzState, gzCode, version, usefulLife } = obj;
  const checkboxRef = useRef(null);
  useEffect(() => {
    checkboxRef.current.check();
  }, []);
  return (
    <List.Item
      prefix={
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            // value={gzCode}
            ref={checkboxRef}
            onChange={(e) => {
              setSeletedData((prev) => {
                let cur = [...prev];
                if (e) {
                  cur.push(gzCode);
                } else {
                  cur = cur.filter((item) => gzCode !== item);
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
          <Item span={12}>工装编码: {gzCode}</Item>
          <Item span={12}>工装名称: {gzName}</Item>
          <Item span={12}>软件版本: {version}</Item>
          <Item span={12}>当前位置: {currentPosition}</Item>
          <Item span={12}>工装状态: {gzState}</Item>
          <Item span={12}>有效期: {usefulLife}</Item>
        </Grid>
      </div>
    </List.Item>
  );
};

export default () => {
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const history = useHistory();
  const formRef = useRef(null);
  const [detailVis, setDetailVis] = useState(false);
  const [positionData, setPositionData] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const gzDataRef = useRef([]);
  const [seletedData, setSeletedData] = useState([]);

  const onFinish = (formObj) => {
    if (!gzList.length) {
      return Toast.show({
        icon: "fail",
        content: "请扫描工装",
      });
    }
    if (!seletedData.length) {
      return Toast.show({
        icon: "fail",
        content: "请选择工装",
      });
    }
    const { currentPosition, gzState, version, usefulLife } = Object.assign(
      {},
      formObj
    );
    const gzData = gzList.map((item) => ({
      gzName: item.gzName,
      currentPosition,
      gzState,
      gzCode: item.gzCode,
      version,
      usefulLife: usefulLife.format("YYYY-MM-DD"),
    }));

    //修改本地批量管理数据
    if (getLocalStorage("batchManage")) {
      const batchManageRes = { ...getLocalStorage("batchManage") };
      batchManageRes.data.forEach((item) => {
        gzData.forEach((item2) => {
          if (item.gzCode === item2.gzCode) {
            item.currentPosition = item2.currentPosition;
            item.gzState = item2.gzState;
            item.version = item2.version;
            item.usefulLife = item2.usefulLife;
          }
        });
      });
      setLocalStorage("batchManage", batchManageRes);
    } else {
      Toast.show({
        icon: "fail",
        content: "请下载工装信息",
      });
    }

    //增加本地批量管理上传数据
    if (getLocalStorage("batchManageUpload")) {
      const batchManageUpload = [...getLocalStorage("batchManageUpload")];
      batchManageUpload.push(...gzData);
    } else {
      setLocalStorage("batchManageUpload", gzData);
    }

    Toast.show({
      icon: "success",
      content: "保存完成",
    });
  };

  const uploadData = async () => {
    if (getLocalStorage("batchManageUpload")) {
      const data = getLocalStorage("batchManageUpload");
      const res = await saveAccountData({ data });
      if (res.status) {
        Toast.show({
          icon: "success",
          content: "上传工装信息成功",
        });
        localStorage.removeItem("batchManageUpload"); //避免多次上传
      } else {
        Toast.show({
          icon: "fail",
          content: "上传工装信息失败",
        });
      }
    } else {
      Toast.show({
        icon: "fail",
        content: "没有可上传的信息",
      });
    }
  };

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
  const [loading, setLoading] = useState(true);
  const [epcList, setEpcList] = useState([]);

  const refreshData = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
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
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    } else {
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    }
  }, []);

  const gzList = useMemo(() => {
    return gzDataRef.current.filter(({ epcData }) => epcList.includes(epcData));
  }, [epcList]);

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

  const getGzData = () => {
    const { status, data } = getLocalStorage("batchManage");
    if (status) {
      gzDataRef.current = data;
    }
  };

  const getPositionData = () => {
    const {
      status,
      data: { locationList },
    } = getLocalStorage("locationList");
    if (status) {
      const data = locationList.map((item) => ({
        label: item.field0001,
        value: item.field0001,
      }));
      data.unshift({ label: "请选择位置", value: "" });
      setPositionData(data);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取位置列表失败",
      });
    }
  };

  const getStatusInfo = () => {
    const statusList = [
      {
        label: "正常",
        value: "正常",
      },
      {
        label: "维修中",
        value: "维修中",
      },
      {
        label: "待报废",
        value: "待报废",
      },
      {
        label: "报废",
        value: "报废",
      },
    ];
    statusList.unshift({ label: "请选择状态", value: "" });
    setStatusList(statusList);
  };

  useEffect(() => {
    getGzData();
    getPositionData();
    getStatusInfo();
  }, []);

  return (
    <>
      <div className={styles.gzContainer}>
        <NavBar back="返回" onBack={back}>
          工装批量管理
        </NavBar>
        <div className={styles.gzWrapper}>
          <div className={styles.center}>
            <div className={styles.gzContent}>
              <div id="procedure">
                {/* id用于保持样式 */}
                <Form
                  ref={(r) => (formRef.current = r)}
                  layout="horizontal"
                  footer={
                    <div>
                      <Button
                        color="success"
                        size="large"
                        width="50%"
                        style={{ display: "inline-block", width: "49%" }}
                        onClick={uploadData}
                      >
                        上传
                      </Button>
                      <Button
                        type="submit"
                        color="primary"
                        size="large"
                        style={{
                          display: "inline-block",
                          width: "49%",
                          marginLeft: "2%",
                        }}
                      >
                        保存
                      </Button>
                    </div>
                  }
                  onFinish={onFinish}
                  mode="card"
                >
                  <Form.Item label="位置信息" name="currentPosition">
                    <select
                      className={styles.select}
                      // onChange={handlePositionChange}
                    >
                      {positionData.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                  <Form.Item label="状态信息" name="gzState">
                    <select className={styles.select}>
                      {statusList.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                  <Form.Item label="软件版本" name="version">
                    <Input placeholder="请输入版本..." />
                  </Form.Item>
                  <Form.Item label="有效期" name="usefulLife">
                    <DatePicker />
                  </Form.Item>
                </Form>
              </div>
              <div className={styles.listAndAmount}>
                <span className={styles.gzList}>工装列表</span>
                <span className={styles.amount}>数量: {gzList?.length}</span>
              </div>
              {loading ? (
                <p className={styles.waitScan}>等待扫描...</p>
              ) : (
                <div className={styles.list}>
                  <Checkbox.Group>
                    <List>
                      {gzList.map((item) => (
                        <ListItemWithCheckbox
                          key={item.gzCode}
                          obj={item}
                          setSeletedData={setSeletedData}
                        />
                      ))}
                    </List>
                  </Checkbox.Group>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
