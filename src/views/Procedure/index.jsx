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
} from "antd-mobile";
import { useHistory } from "react-router-dom";
import styles from "./index.module.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { pdaConfig, pdaStart, padStop, queryPdaData } from "api/pda";
import dayjs from "dayjs";
import { getLocation } from "api/machine";
import { getMemberLogin, getMember } from "api/machine";

const { Item } = Grid;

const rankData = [
  { label: "请选择密级", value: "" },
  { label: "非密", value: 1 },
  { label: "内部", value: 2 },
  { label: "秘密", value: 3 },
  { label: "机密", value: 4 },
  { label: "绝密", value: 5 },
];

export default () => {
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const history = useHistory();
  const formRef = useRef(null);
  const [billNo, setBillNo] = useState([]);
  const [projectGroup, setProjectGroup] = useState([]);
  const [procedureData, setProcedureData] = useState([]);
  const [positionData, setPositionData] = useState([]);
  const [detailVis, setDetailVis] = useState(false);
  const [deptCode, setDeptCode] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);

  // const [deviceList, setDeviceList] = useState([]);

  const onFinish = (formObj) => {
    const cloneObj = Object.assign({}, formObj); //浅拷贝, 接口实参
    const res = {};
    res.code = 1;
    if (res.code === 1) {
      Toast.show({
        icon: "success",
        content: "提交成功",
      });
    } else {
      Toast.show({
        icon: "fail",
        content: `${res.message}`,
      });
    }
  };

  const getBillNo = async () => {
    const billNos = [
      { label: "请选择工单", value: "" },
      { label: "工单1", value: "1" },
      { label: "工单2", value: "2" },
      { label: "工单3", value: "3" },
    ];
    setBillNo(billNos);
    // const memberLogin = getMemberLogin();
    // const res = await getMember();
    // if (res.status) {
    //   const { deptCode } = res.data.memberList.find(
    //     (item) => item.memberLogin === memberLogin
    //   );
    //   setDeptCode(deptCode);
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "获取部门信息失败",
    //   });
    // }
  };

  const getprojectGroup = async () => {
    const projectGroup = [
      { label: "请选择项目组", value: "" },
      { label: "项目组1", value: "1" },
      { label: "项目组2", value: "2" },
      { label: "项目组3", value: "3" },
    ];
    setProjectGroup(projectGroup);
  };

  const getProcedureData = () => {
    const procedureData = [
      { label: "请选择工序", value: "" },
      { label: "整机", value: 1 },
      { label: "整机升级", value: 2 },
      { label: "整机调测", value: 3 },
      { label: "常温", value: 4 },
      { label: "所检", value: 5 },
      { label: "试验", value: 6 },
      { label: "军检(军品)", value: 7 },
      { label: "恢复出厂", value: 8 },
      { label: "注正式参数", value: 9 },
    ];
    setProcedureData(procedureData);
  };

  const getPositionData = async () => {
    const positionData = [
      { field0001: "请选择位置", value: "" },
      { field0001: "位置1", value: 1 },
      { field0001: "位置2", value: 2 },
      { field0001: "位置3", value: 3 },
      { field0001: "位置4", value: 4 },
    ];
    setPositionData(positionData);
    // const res = await getLocation();
    // if (res.status) {
    //   const data = res.data.locationList.map((item) => ({
    //     label: item.field0001,
    //     value: item.field0001,
    //   }));
    //   setPositionData(data);
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "获取位置信息失败",
    //   });
    // }
  };

  const getDefaultFields = () => {
    formRef.current.setFieldsValue({
      innerName: "内部名称",
      operator: "张三",
    });
  };

  const handleSave = () => {
    Toast.show({
      icon: "success",
      content: "保存成功",
    });
  };
  const [pdaReady, setPdaReady] = useState(false);
  const initPda = useCallback(async () => {
    const pdaConfigRes = await pdaConfig({
      scanType: 0,
      rfidReadpower: 10,
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
    // initDevicePlus();
    return () => {
      const plus = window.plus || {};
      padStop({
        endTime: configTime.current,
      });
      // document.removeEventListener("plusReady", plusReady);
      // plus?.key.removeEventListener("backbutton", back);
    };
  }, [initPda /* initDevicePlus */]);

  const timer = useRef(null);
  const [loading, setLoading] = useState(true);
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
    getBillNo();
    getprojectGroup();
    getProcedureData();
    getPositionData();
    getDefaultFields();
  }, []);

  const inputChange = (e) => {
    console.log(e);
  };
  const handleChange = (value) => {
    setCheckboxValue(value);
  };

  return (
    <>
      <div className={styles.procedureContainer}>
        <NavBar back="返回" onBack={back}>
          整机批量流程管理
        </NavBar>
        <div className={styles.procedureWrapper}>
          <div className={styles.center}>
            <div className={styles.procedureContent}>
              <div id="procedure">
                <Form
                  ref={(r) => (formRef.current = r)}
                  layout="horizontal"
                  footer={
                    <Button type="submit" color="primary" size="large" block>
                      提交
                    </Button>
                  }
                  onFinish={onFinish}
                  mode="card"
                >
                  <Form.Item label="工单号" name="billNo" s>
                    <select className={styles.select}>
                      {billNo.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                  <Form.Item label="内部名称" name="innerName">
                    <Input readOnly />
                  </Form.Item>
                  <Form.Item label="项目组" name="projectGroup">
                    <select className={styles.select}>
                      {projectGroup.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                  <Form.Item label="操作人" name="operator">
                    <Input readOnly />
                  </Form.Item>
                  <Form.Item label="当前位置" name="field0001">
                    {!checkboxValue ? (
                      <select className={styles.select}>
                        {positionData.map((item) => {
                          return (
                            <option key={item.field0001} value={item.value}>
                              {item.field0001}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <Input
                        placeholder="请输入位置..."
                        onChange={inputChange}
                        style={{ width: "103px", height: "20.67px" }}
                      />
                    )}
                  </Form.Item>
                  <Checkbox onChange={handleChange}>手动输入</Checkbox>

                  <Form.Item label="涉密等级" name="rank">
                    <select className={styles.select}>
                      {rankData.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                  <Form.Item label="流程节点" name="node">
                    <select className={styles.select}>
                      {procedureData.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                </Form>
              </div>

              <div className={styles.listAndAmount}>
                <span className={styles.machineList}>整机列表</span>
                <span className={styles.amount}>数量: {epcList?.length}</span>
              </div>
              {loading ? (
                <p className={styles.waitScan}>等待扫描...</p>
              ) : (
                <div className={styles.list}>
                  {epcList.map((item) => {
                    return (
                      <div key={item} className={styles.listItem}>
                        <Grid columns={24} gap={8}>
                          <Item span={15} style={{ lineHeight: "35px" }}>
                            设备编号: {item}
                          </Item>
                        </Grid>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
