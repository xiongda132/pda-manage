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
import { cardData } from "../CardManage/test";

const { Item } = Grid;
const { Group } = Radio;

const rankData = [
  { label: "请选择密级", value: "" },
  { label: "非密", value: "非密" },
  { label: "内部", value: "内部" },
  { label: "秘密", value: "秘密" },
  { label: "机密", value: "机密" },
  { label: "绝密", value: "绝密" },
];

const procedureData = [
  { label: "请选择工序", value: "" },
  { label: "整机", value: 1 },
  { label: "整机升级", value: 2 },
  { label: "常温", value: 3 },
  { label: "所检", value: 4 },
];

export default () => {
  const history = useHistory();
  const formRef = useRef(null);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [procedureData, setProcedureData] = useState([]);
  const [positionData, setPositionData] = useState([]);
  const [billNo, setBillNo] = useState([]);
  const [projectGroup, setProjectGroup] = useState([]);
  const depCodeRef = useRef(null);
  const zjtzDataRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [scanMode, setScanMode] = useState("");
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const [scanValue, setScanValue] = useState("");
  const [epcValue, setEpcValue] = useState("");
  const [flag, setFlag] = useState(false);
  const [machineInfo, setMachineInfo] = useState(null);
  const cardRef = useRef(null);
  const [card, setCard] = useState([]);
  const [radioValue, setRadioValue] = useState("");
  const [breakData, setBreakData] = useState([]);
  const [accountData, setAccountData] = useState([]);

  // const back = () => {
  //   history.go(-1);
  // };

  const onFinish = async (formObj) => {
    const workflowForm = [];
    const {
      gdhId,
      nbName,
      facilityCode,
      productionMember,
      procedureName,
      nodeSecurity,
      currentPlace,
      department,
      isBreak,
      breakMessage,
    } = Object.assign({}, formObj);
    const formData = {
      gdhId,
      facilityCode,
      nbName,
      nodeName: procedureName,
      nodeSecurity,
      currentPlace,
      department,
      productionMember,
      newDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      isBreak: isBreak ? "是" : "否",
      breakMessage,
    };
    workflowForm.push(formData);
    const { status } = await saveWorkFlow({ workflowForm });
    if (status) {
      Toast.show({
        icon: "success",
        content: "提交成功",
      });
    } else {
      Toast.show({
        icon: "fail",
        content: `提交失败`,
      });
    }
  };

  const handleSave = () => {
    Toast.show({
      icon: "success",
      content: "保存成功",
    });
  };

  const handleInput = (value) => {
    setCheckboxValue(value);
  };

  const inputChange = (e) => {
    console.log(e);
  };

  const getprojectGroup = async () => {
    const {
      status,
      data: { memberList },
    } = await switchMember();
    if (status) {
      const deptList = memberList.map((item) => ({
        label: item.deptName,
        value: item.deptName,
        // value: item.deptCode,
      }));
      deptList.unshift({ label: "请选择项目组", value: "" });
      setProjectGroup(deptList);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取节点信息失败",
      });
    }
  };

  const getProcedureData = async () => {
    const {
      status,
      data: { flowNodeForm },
    } = await switchNode();
    if (status) {
      const procedureData = flowNodeForm.map((item) => ({
        label: item.flowNodeName,
        value: item.flowNodeName,
        // value: item.nodeSort,
      }));
      console.log(procedureData);
      procedureData.unshift({ label: "请选择工序", value: "" });
      setProcedureData(procedureData);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取节点信息失败",
      });
    }
  };

  const getPositionData = async () => {
    const {
      status,
      data: { locationList },
    } = await switchLocation();
    if (status) {
      const data = locationList.map((item) => ({
        label: item.field0001,
        value: item.field0001,
      }));
      console.log(data);
      setPositionData(data);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取位置列表失败",
      });
    }
  };

  const getDefaultFields = async () => {
    const memberLogin = getMemberLogin();
    const {
      status,
      data: { memberList },
    } = await switchMember();
    if (status) {
      const { memberName } = memberList.find(
        (item) => item.memberCode === memberLogin
      );
      formRef.current.setFieldsValue({
        productionMember: memberName,
      });
    } else {
      Toast.show({
        icon: "fail",
        content: "获取操作人失败",
      });
    }
  };

  const getFlowInfo = async () => {
    const {
      status,
      data: { workflowForm },
    } = await switchWorkFlow();
    if (status) {
      let record = "";
      let facilityObj;
      if (scanMode === "qrcode") {
        facilityObj = workflowForm.filter(
          (item) => item.facilityCode === scanValue
        );
      }
      if (scanMode === "rfid") {
        console.log(zjtzDataRef.current);
        console.log("accountData", accountData);
        let facilityCode = zjtzDataRef.current.filter(
          (item) => item.epcData === epcValue
        )?.[0].facilityCode;
        if (facilityCode) {
          facilityObj = workflowForm.filter(
            (item) => item.facilityCode === facilityCode
          );
        } else {
          Toast.show({
            icon: "fail",
            content: "此epc没有对应的整机",
          });
        }
      }
      facilityObj
        .map((item) => ({
          testDate: item.testDate,
          nodeName: item.nodeName,
          productionMember: item.productionMember,
        }))
        .forEach((item) => {
          const { testDate, nodeName, productionMember } = item;
          record += testDate + " " + nodeName + " " + productionMember + "\n";
        });
      formRef.current.setFieldsValue({
        record,
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
        (item) => item.memberCode === memberLogin
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
          setAccountData(zjtzData);
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
          // getFlowInfo();
        }
        if (epcValue) {
          await getFileTableEpc(); //getFlowInfo()函数需要访问某些状态，等待这个函数设置所有状态后，再执行后续的调用
        }
        getprojectGroup();
        getProcedureData();
        getPositionData();
        getDefaultFields();
        getFlowInfo();
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

  const handleRadioChange = (value) => {
    setRadioValue(value);
  };
  useEffect(() => {
    if (radioValue) {
      getBreakInfo();
    }
  }, [radioValue]);

  const getBreakInfo = async () => {
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
        } = await switchFileTable(deptCode);
        if (status) {
          console.log(zjtzData, scanValue);
          const filterObj = zjtzData.find(
            (item) => item.facilityCode === scanValue
          );
          const {
            status,
            data: { cardMessageForm },
          } = cardData;
          if (status) {
            cardRef.current = cardMessageForm;
            let allObj;
            if (scanMode === "qrcode") {
              allObj = cardMessageForm.filter(
                (item) => item.facilityCode === scanValue
              );
            }
            if (scanMode === "rfid") {
              let facilityCode = zjtzDataRef.current.filter(
                (item) => item.epcData === epcValue
              )?.[0].facilityCode;
              if (facilityCode) {
                allObj = cardMessageForm.filter(
                  (item) => item.facilityCode === facilityCode
                );
              } else {
                Toast.show({
                  icon: "fail",
                  content: "此epc没有对应的板卡列表",
                });
              }
            }
            const cardList = [...new Set(allObj.map((item) => item.cardName))];
            const breakList = [];
            cardList.forEach((item1) => {
              const cardObj = allObj
                .filter((item2) => item2.cardName === item1 && item2.cardNumber)
                .map((item) => ({
                  label: item.cardNumber + item1,
                  value: item.cardNumber + item1,
                }));
              breakList.push(...cardObj);
            });
            breakList.unshift(
              { label: "请选择故障类型", value: "" },
              { label: "整机故障", value: "整机故障" }
            );
            setBreakData(breakList);
          } else {
            Toast.show({
              icon: "fail",
              content: "获取板卡信息失败",
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
  console.log("accountData", accountData);

  return (
    <>
      <div className={styles.procedureContainer}>
        <NavBar back="返回" onBack={back}>
          工序管理
        </NavBar>
        <div className={styles.procedureWrapper}>
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
            <div className={styles.procedureContent}>
              <Form
                ref={(r) => (formRef.current = r)}
                layout="horizontal"
                footer={
                  <Button
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    style={{ marginTop: "-20px" }}
                  >
                    提交
                  </Button>
                }
                onFinish={onFinish}
                mode="card"
              >
                <Form.Item label="工单号" name="gdhId">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="编码" name="facilityCode">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="内部名称" name="nbName">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="密级" name="nodeSecurity">
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
                <Form.Item
                  label="位置"
                  name="currentPlace"
                  style={{ display: "inline-block", minHeight: "50px" }}
                >
                  {!checkboxValue ? (
                    <select className={styles.select}>
                      {positionData.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <Input
                      placeholder="请输入位置..."
                      onChange={inputChange}
                      style={{ width: "103px" }}
                    />
                  )}
                </Form.Item>
                <Checkbox onChange={handleInput}>手动输入</Checkbox>
                <Form.Item label="项目组" name="department">
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
                <Form.Item label="流程节点" name="procedureName">
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
                <Form.Item label="负责人" name="productionMember">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="是否故障" name="isBreak">
                  <Radio.Group onChange={handleRadioChange}>
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
                </Form.Item>
                {radioValue ? (
                  <Form.Item label="故障选择" name="breakChoose">
                    <select className={styles.select}>
                      {breakData.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                ) : null}
                <Form.Item label="故障描述" name="breakMessage">
                  <TextArea placeholder="请输入描述..."></TextArea>
                </Form.Item>
                <Form.Item label="流程记录" name="record">
                  <TextArea placeholder="流程记录..." rows={3}></TextArea>
                </Form.Item>
              </Form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
