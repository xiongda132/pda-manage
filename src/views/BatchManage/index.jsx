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
// import { nodeObj } from "./test";
import { DatePicker } from "antd";

const { Item } = Grid;

// const rankData = [
//   { label: "请选择密级", value: "" },
//   { label: "非密", value: "非密" },
//   { label: "内部", value: "内部" },
//   { label: "秘密", value: "秘密" },
//   { label: "机密", value: "机密" },
//   { label: "绝密", value: "绝密" },
// ];

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
  const flowNodeNameRef = useRef(null);
  // const [deptName, setDeptName] = useState(getDeptName());

  const onFinish = async (formObj) => {
    const {
      nbName,
      procedureName,
      // productionMember,
      nodeSecurity,
      currentPlace,
      gdhId,
    } = Object.assign({}, formObj);
    const workflowForm = epcList.map((item) => ({
      facilityCode: item.facilityCode,
      nbName,
      detailNodeName: procedureName,
      productionMember: getMemberLogin(), //使用登录账号
      nodeSecurity,
      location: currentPlace,
      gdhId,
      newDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      nodeName: flowNodeNameRef.current,
    }));

    //本地逻辑, 对操作数据进行存储
    if (getLocalStorage("workflowFormUpload")) {
      const workflowUpload = [...getLocalStorage("workflowFormUpload")];
      workflowUpload.push(...workflowForm);
      setLocalStorage("workflowFormUpload", workflowUpload);
    } else {
      setLocalStorage("workflowFormUpload", workflowForm);
    }

    //本地逻辑， 对接口数据进行修改
    if (getLocalStorage("workflowForm")) {
      let workflowFormRes = { ...getLocalStorage("workflowForm") };
      workflowFormRes.data.workflowForm.push(...workflowForm);
      setLocalStorage("workflowForm", workflowFormRes);
    } else {
      setLocalStorage("workflowForm", workflowForm);
    }
    Toast.show({
      icon: "success",
      content: "保存完成",
    });
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
  console.log(epcList);
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
          if (newEpcList.map((item) => item.epc).indexOf(epc) === -1) {
            // 根据设备编号筛选某个工单下的epc列表
            const zjtzObj = zjtzDataRef.current.find(
              (item) => item.gdhId === billRef.current && item.epcData === epc
            );
            if (zjtzObj) {
              newEpcList.unshift({
                facilityCode: zjtzObj.facilityCode,
                epc: zjtzObj.epcData,
              });
            } else {
              Toast.show({
                content: "epc不属于此工单或未绑定整机",
              });
            }
            // newEpcList.unshift(epc);
          }
        });
        // console.log("newEpcList", newEpcList);
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

  // const getBillNo = async () => {
  //   //本地逻辑
  //   const {
  //     status,
  //     data: { zjtzData },
  //   } = getLocalStorage("zjtzData");
  //   if (status) {
  //     zjtzDataRef.current = zjtzData;
  //     const gdhList = [...new Set(zjtzData.map((item) => item.gdhId))].map(
  //       (item) => ({ label: item, value: item })
  //     );
  //     const data = [...gdhList];
  //     data.unshift({ label: "请选择工单", value: "" });
  //     setBillNo(data);
  //   } else {
  //     Toast.show({
  //       icon: "fail",
  //       content: "获取整机台账信息失败",
  //     });
  //   }

  //   //在线逻辑
  //   // const memberLogin = getMemberLogin();
  //   // const {
  //   //   status,
  //   //   data: { memberList },
  //   // } = await switchMember();
  //   // if (status) {
  //   //   const { deptCode } = memberList.find(
  //   //     (item) => item.memberCode === memberLogin
  //   //   );
  //   //   if (deptCode) {
  //   //     depCodeRef.current = deptCode;
  //   //     sessionStorage.setItem("deptCode", deptCode);
  //   //     const {
  //   //       status,
  //   //       data: { zjtzData },
  //   //     } = await switchFileTable({ deptCode });
  //   //     if (status) {
  //   //       zjtzDataRef.current = zjtzData;
  //   //       const gdhList = [...new Set(zjtzData.map((item) => item.gdhId))].map(
  //   //         (item) => ({ label: item, value: item })
  //   //       );
  //   //       const data = [...gdhList];
  //   //       data.unshift({ label: "请选择工单", value: "" });
  //   //       setBillNo(data);
  //   //     } else {
  //   //       Toast.show({
  //   //         icon: "fail",
  //   //         content: "获取整机台账信息失败",
  //   //       });
  //   //     }
  //   //   }
  //   // } else {
  //   //   Toast.show({
  //   //     icon: "fail",
  //   //     content: "获取部门信息失败",
  //   //   });
  //   // }
  // };

  // const getprojectGroup = () => {
  //   formRef.current.setFieldsValue({
  //     projectGroup: getDeptName(),
  //   });
  //   // const memberLogin = getMemberLogin();
  //   // const {
  //   //   status,
  //   //   data: { memberList },
  //   // } = await switchMember();
  //   // if (status) {
  //   //   const projectGroup = memberList.find(
  //   //     (item) => item.memberCode === memberLogin
  //   //   );
  //   //   if (projectGroup) {
  //   //     formRef.current.setFieldsValue({
  //   //       projectGroup: projectGroup.deptName,
  //   //     });
  //   //   } else {
  //   //     Toast.show({
  //   //       icon: "fail",
  //   //       content: "未匹配到项目组信息",
  //   //     });
  //   //   }
  //   //   const deptList = memberList.map((item) => ({
  //   //     label: item.deptName,
  //   //     value: item.deptCode,
  //   //   }));
  //   //   deptList.unshift({ label: "请选择项目组", value: "" });
  //   //   setProjectGroup(deptList);
  //   // } else {
  //   //   Toast.show({
  //   //     icon: "fail",
  //   //     content: "获取节点信息失败",
  //   //   });
  //   // }
  // };

  const getProcedureData = (workFlowName) => {
    const {
      status,
      data: { flowNodeForm },
    } = getLocalStorage("flowNodeForm");
    if (status) {
      const filterNodeForm = flowNodeForm.filter(
        (item) => item.flowName === workFlowName
      );

      //获取默认密级
      const getDefaultSecurity = filterNodeForm?.[0].nodeSecurity;
      formRef.current.setFieldsValue({
        nodeSecurity: getDefaultSecurity,
      });

      const procedureData = filterNodeForm.map((item) => ({
        label: item.detailNodeName,
        value: item.detailNodeName,
      }));
      const detailNodeNameMap = [
        ...new Set(procedureData.map((item) => item.label)),
      ].map((item) => ({
        label: item,
        value: item,
      })); //容错去重

      //节点名称， 上传时使用
      flowNodeNameRef.current = [
        ...new Set(filterNodeForm.map((item) => item.flowNodeName)),
      ]?.[0];
      procedureData.unshift({ label: "请选择工序", value: "" });
      setProcedureData(detailNodeNameMap);
    }
  };

  // const getPositionData = async () => {
  //   //本地逻辑
  //   const {
  //     status,
  //     data: { locationList },
  //   } = getLocalStorage("locationList");

  //   //在线逻辑
  //   // const {
  //   //   status,
  //   //   data: { locationList },
  //   // } = await switchLocation();
  //   if (status) {
  //     const data = locationList.map((item) => ({
  //       label: item.field0001,
  //       value: item.field0001,
  //     }));
  //     data.unshift({ label: "请选择位置", value: "" });
  //     setPositionData(data);
  //   } else {
  //     Toast.show({
  //       icon: "fail",
  //       content: "获取位置列表失败",
  //     });
  //   }
  // };

  // const getDefaultFields = async () => {
  //   /* const defaultnodeName =  */ formRef.current.setFieldsValue({
  //     productionMember: getMemberName(),
  //   });

  //   // const memberLogin = getMemberLogin();
  //   // const {
  //   //   status,
  //   //   data: { memberList },
  //   // } = await switchMember();
  //   // if (status) {
  //   //   const { memberName } = memberList.find(
  //   //     (item) => item.memberCode === memberLogin
  //   //   );
  //   //   formRef.current.setFieldsValue({
  //   //     productionMember: memberName,
  //   //   });
  //   // } else {
  //   //   Toast.show({
  //   //     icon: "fail",
  //   //     content: "获取操作人失败",
  //   //   });
  //   // }
  // };

  useEffect(() => {
    // getBillNo();
    // getprojectGroup();
    // getProcedureData();
    // getPositionData();
    // getDefaultFields();
  }, []);

  const inputChange = (e) => {
    console.log(e);
  };
  const handleChange = (value) => {
    setCheckboxValue(value);
  };
  const handlePositionChange = (e) => {
    if (e.target.value) {
      billRef.current = e.target.value;
      const { nbName, workFlowName } = zjtzDataRef.current.find(
        (item) => item.gdhId === e.target.value
      );
      formRef.current.setFieldsValue({
        nbName,
      });
      getProcedureData(workFlowName);
    } else {
      formRef.current.setFieldsValue({
        nbName: "无",
      });
    }
  };

  const handledetailNodeChange = (e) => {
    if (e.target.value) {
      const {
        status,
        data: { flowNodeForm },
      } = getLocalStorage("flowNodeForm");
      if (status) {
        const { nodeSecurity } = flowNodeForm.find(
          (item) => item.detailNodeName === e.target.value
        );
        if (nodeSecurity) {
          formRef.current.setFieldsValue({
            nodeSecurity: nodeSecurity,
          });
        } else {
          formRef.current.setFieldsValue({
            nodeSecurity: "",
          });
        }
      }
    }
  };

  const handleStateChange = (e) => {
    console.log(e);
  };

  const handleDatePicker = (e) => {
    console.log(e);
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
                  <Form.Item label="位置信息" name="currentPosition">
                    <select
                      className={styles.select}
                      onChange={handlePositionChange}
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
                  <Form.Item label="状态信息" name="gzState">
                    <select
                      className={styles.select}
                      onChange={handleStateChange}
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
                  <Form.Item label="软件版本" name="version">
                    <Input
                      placeholder="请输入版本..."
                      onChange={inputChange}
                    />
                  </Form.Item>
                  <Form.Item label="有效期" name="usefulLife">
                    <DatePicker onChange={handleDatePicker} />
                  </Form.Item>
                </Form>
              </div>

              <div className={styles.listAndAmount}>
                <span className={styles.machineList}>工装列表</span>
                <span className={styles.amount}>数量: {epcList?.length}</span>
              </div>
              {loading ? (
                <p className={styles.waitScan}>等待扫描...</p>
              ) : (
                <div className={styles.list}>
                  {epcList.map((item) => {
                    return (
                      <div key={item.facilityCode} className={styles.listItem}>
                        <Grid columns={24} gap={8}>
                          <Item span={15} style={{ lineHeight: "35px" }}>
                            设备编号: {item.facilityCode}
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
