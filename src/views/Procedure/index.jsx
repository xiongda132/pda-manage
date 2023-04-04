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
import {
  getMember,
  switchMember,
  switchFileTable,
  switchLocation,
  saveWorkFlow,
  switchNode,
} from "api/machine";
import {
  getMemberLogin,
  getLocalStorage,
  setLocalStorage,
  getDeptName,
  getMemberName,
} from "utils/auth";
import { nodeObj } from "./test";

const { Item } = Grid;

const rankData = [
  { label: "请选择密级", value: "" },
  { label: "非密", value: "非密" },
  { label: "内部", value: "内部" },
  { label: "秘密", value: "秘密" },
  { label: "机密", value: "机密" },
  { label: "绝密", value: "绝密" },
];

export default () => {
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const history = useHistory();
  const formRef = useRef(null);
  const [detailVis, setDetailVis] = useState(false);
  const [deptCode, setDeptCode] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [procedureData, setProcedureData] = useState([]);
  const [positionData, setPositionData] = useState([]);
  const [billNo, setBillNo] = useState([]);
  const [projectGroup, setProjectGroup] = useState([]);
  const depCodeRef = useRef(null);
  const zjtzDataRef = useRef(null);
  const billRef = useRef(null);
  // const [deptName, setDeptName] = useState(getDeptName());

  const onFinish = async (formObj) => {
    const {
      nbName,
      procedureName,
      productionMember,
      nodeSec,
      location,
      gdhId,
    } = Object.assign({}, formObj);
    const workflowForm = epcList.map((item) => ({
      facilityCode: item,
      nbName,
      nodeName: procedureName,
      productionMember: getMemberLogin(),
      nodeSec,
      location,
      gdhId,
    }));

    //本地逻辑, 对操作数据进行存储
    if (getLocalStorage("workflowFormUpload")) {
      const workflowUpload = [...getLocalStorage("workflowFormUpload")];
      workflowUpload.push(...workflowForm);
      setLocalStorage("workflowFormUpload", workflowUpload);
    } else {
      setLocalStorage("workflowFormUpload", workflowForm);
    }

    // const { status } = await saveWorkFlow({ workflowForm });
    // if (status) {
    //   Toast.show({
    //     icon: "success",
    //     content: "提交成功",
    //   });
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: `提交失败`,
    //   });
    // }
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
            // 根据设备编号筛选某个工单下的epc列表
            const zjtzObj = zjtzDataRef.current.find(
              (item) => item.gdhId === billRef.current && item.epcData === epc
            );
            if (zjtzObj) {
              newEpcList.unshift(zjtzObj.facilityCode);
            } else {
              Toast.show({
                content: "epc不属于此工单或未绑定整机",
              });
            }
            // newEpcList.unshift(epc);
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

  const getBillNo = async () => {
    //本地逻辑
    const {
      status,
      data: { zjtzData },
    } = getLocalStorage("zjtzData");
    if (status) {
      zjtzDataRef.current = zjtzData;
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
    //       zjtzDataRef.current = zjtzData;
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

  const getprojectGroup = () => {
    formRef.current.setFieldsValue({
      projectGroup: getDeptName(),
    });
    // const memberLogin = getMemberLogin();
    // const {
    //   status,
    //   data: { memberList },
    // } = await switchMember();
    // if (status) {
    //   const projectGroup = memberList.find(
    //     (item) => item.memberCode === memberLogin
    //   );
    //   if (projectGroup) {
    //     formRef.current.setFieldsValue({
    //       projectGroup: projectGroup.deptName,
    //     });
    //   } else {
    //     Toast.show({
    //       icon: "fail",
    //       content: "未匹配到项目组信息",
    //     });
    //   }
    //   const deptList = memberList.map((item) => ({
    //     label: item.deptName,
    //     value: item.deptCode,
    //   }));
    //   deptList.unshift({ label: "请选择项目组", value: "" });
    //   setProjectGroup(deptList);
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "获取节点信息失败",
    //   });
    // }
  };

  const getProcedureData = (nbName) => {
    //本地逻辑
    // const {
    //   status,
    //   data: { flowNodeForm },
    // } = getLocalStorage("flowNodeForm");
    //在线逻辑
    // const {
    //   status,
    //   data: { flowNodeForm },
    // } = await switchNode();
    // const {
    //   status,
    //   data: { zjtzData },
    // } = getLocalStorage("zjtzData");
    // if (status) {
    // const { nbName } = zjtzData.find(
    //   (item) => item.gdhId === billRef.current
    // );
    const {
      status,
      data: { flowNodeForm },
    } = getLocalStorage("flowNodeForm");
    if (status) {
      const filterNodeForm = flowNodeForm.filter(
        (item) => item.nbName === nbName
      );
      const procedureData = filterNodeForm.map((item) => ({
        label: item.flowNodeName,
        value: item.nodeSort,
      }));
      procedureData.unshift({ label: "请选择工序", value: "" });
      setProcedureData(procedureData);
    }
    // }

    //   const procedureData = flowNodeForm.map((item) => ({
    //     label: item.flowNodeName,
    //     value: item.nodeSort,
    //   }));
    //   procedureData.unshift({ label: "请选择工序", value: "" });
    //   setProcedureData(procedureData);
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "获取节点信息失败",
    //   });
    // }
  };

  const getPositionData = async () => {
    //本地逻辑
    const {
      status,
      data: { locationList },
    } = getLocalStorage("locationList");

    //在线逻辑
    // const {
    //   status,
    //   data: { locationList },
    // } = await switchLocation();
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

  const getDefaultFields = async () => {
    formRef.current.setFieldsValue({
      productionMember: getMemberName(),
    });
    // const memberLogin = getMemberLogin();
    // const {
    //   status,
    //   data: { memberList },
    // } = await switchMember();
    // if (status) {
    //   const { memberName } = memberList.find(
    //     (item) => item.memberCode === memberLogin
    //   );
    //   formRef.current.setFieldsValue({
    //     productionMember: memberName,
    //   });
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "获取操作人失败",
    //   });
    // }
  };

  useEffect(() => {
    getBillNo();
    getprojectGroup();
    // getProcedureData();
    getPositionData();
    getDefaultFields();
  }, []);

  const inputChange = (e) => {
    console.log(e);
  };
  const handleChange = (value) => {
    setCheckboxValue(value);
  };
  const handleBillChange = (e) => {
    if (e.target.value) {
      billRef.current = e.target.value;
      const nbName = zjtzDataRef.current.find(
        (item) => item.gdhId === e.target.value
      ).nbName;
      formRef.current.setFieldsValue({
        nbName,
      });
      getProcedureData(nbName);
    } else {
      formRef.current.setFieldsValue({
        nbName: "无",
      });
    }
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
                  <Form.Item label="工单号" name="gdhId">
                    <select
                      className={styles.select}
                      onChange={handleBillChange}
                    >
                      {billNo.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                  <Form.Item label="内部名称" name="nbName">
                    <Input readOnly />
                  </Form.Item>
                  <Form.Item label="项目组" name="projectGroup">
                    <Input readOnly />
                    {/* <select className={styles.select}>
                      {projectGroup.map((item) => {
                        return (
                          <option key={item.label} value={item.value}>
                            {item.label}
                          </option>
                        );
                      })}
                    </select> */}
                  </Form.Item>
                  <Form.Item label="操作人" name="productionMember">
                    <Input readOnly />
                  </Form.Item>
                  <Form.Item label="当前位置" name="location">
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
                        style={{ width: "103px", height: "20.67px" }}
                      />
                    )}
                  </Form.Item>
                  <Checkbox onChange={handleChange}>手动输入</Checkbox>

                  <Form.Item label="涉密等级" name="nodeSec">
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
