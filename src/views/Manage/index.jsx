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
import {
  getMemberLogin,
  getDeptName,
  getLocalStorage,
  getMemberName,
  setLocalStorage,
} from "utils/auth";
import {
  getMember,
  switchMember,
  switchFileTable,
  switchLocation,
  saveWorkFlow,
  switchNode,
  switchWorkFlow,
  switchCard,
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
  const [deptName, setDeptName] = useState(getDeptName());
  const flowNodeNameRef = useRef(null);
  const breakDataRef = useRef(null);
  const flowNodeFormRef = useRef(null);

  // const back = () => {
  //   history.go(-1);
  // };

  const onFinish = async (formObj) => {
    // alert("执行了点击")
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
    console.log("productionMember", productionMember);
    //根据细化节点确认节点名称
    const findNodeName = flowNodeFormRef.current.find(
      (item) => item.detailNodeName === procedureName
    );

    const formData = {
      gdhId,
      facilityCode,
      nbName,
      // nodeName: flowNodeNameRef.current,
      nodeName: findNodeName?.flowNodeName ? findNodeName?.flowNodeName : "",
      detailNodeName: procedureName,
      nodeSecurity,
      location: currentPlace,
      department,
      productionMember: getMemberLogin(),
      newDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      isBreak: isBreak ? "是" : "否",
      breakMessage,
    };
    workflowForm.push(formData);

    //保存后显示流程信息
    let getCurNodeInfo = formRef.current.getFieldValue("record");
    getCurNodeInfo +=
      dayjs().format("YYYY-MM-DD HH:mm:ss") +
      " " +
      procedureName +
      " " +
      productionMember +
      "\n";
    formRef.current.setFieldsValue({
      record: getCurNodeInfo,
    });

    //本地逻辑, 对操作数据进行存储
    if (getLocalStorage("workflowFormUpload")) {
      const workflowFormUpload = [...getLocalStorage("workflowFormUpload")];
      workflowFormUpload.push(...workflowForm);
      setLocalStorage("workflowFormUpload", workflowFormUpload);
    } else {
      setLocalStorage("workflowFormUpload", workflowForm);
    }

    //本地逻辑， 对接口数据进行修改
    if (getLocalStorage("workflowForm")) {
      let workflowFormRes = { ...getLocalStorage("workflowForm") };
      workflowFormRes.data.workflowForm.push({
        detailNodeName: procedureName,
        errorDes: breakMessage,
        facilityCode,
        gdhId,
        isBreak: isBreak ? "是" : "否",
        location: currentPlace,
        nbName,
        // nodeSec: nodeSecurity,
        nodeSecurity, //统一修改密级字段
        productionMember,
        newDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });
      setLocalStorage("workflowForm", workflowFormRes);
    } else {
      setLocalStorage("workflowForm", workflowForm);
    }

    //对生成流程推进表进行修改
    // if (breakDataRef.current.includes("整机故障")) {

    // } else {
    if (getLocalStorage("cardMessageForm")) {
      const cardMessageFormArr = [
        ...getLocalStorage("cardMessageForm").data.cardMessageForm,
      ];
      const breakDataMap = breakDataRef.current?.map((item) => ({
        cardName: item.split(" ")?.[1],
        cardNumber: item.split(" ")[0],
      }));
      if (breakDataMap.length) {
        cardMessageFormArr.forEach((item) => {
          breakDataMap.forEach((item2) => {
            if (
              item2.cardName === item.cardName &&
              item2.cardNumber === item.cardNumber
            ) {
              console.log(`改变了${item.cardName}的${item.cardNumber}`);
              item.isCardBreak = "是";
              item.errorDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
            }
          });
        });
        setLocalStorage("cardMessageForm", {
          status: getLocalStorage("cardMessageForm").status,
          data: {
            cardMessageForm: cardMessageFormArr,
          },
        });
      }
    }
    // }

    //对本地板卡上传进行修改
    if (getLocalStorage("cardMessageFormUpload")) {
      const cardMessageFormArr = [...getLocalStorage("cardMessageFormUpload")];
      const breakDataMap = breakDataRef.current?.map((item) => ({
        cardName: item.split(" ")?.[1],
        cardNumber: item.split(" ")[0],
      }));
      if (breakDataMap.length) {
        cardMessageFormArr.forEach((item) => {
          breakDataMap.forEach((item2) => {
            if (
              item2.cardName === item.cardName &&
              item2.cardNumber === item.cardNumber
            ) {
              console.log(`改变了${item.cardName}的${item.cardNumber}`);
              item.isCardBreak = "是";
              item.errorDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
            }
          });
        });
        setLocalStorage("cardMessageFormUpload", cardMessageFormArr);
      }
    }

    Toast.show({
      icon: "success",
      content: "保存成功",
    });
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
    formRef.current.setFieldsValue({
      projectGroup: deptName,
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
    // const deptList = memberList.map((item) => ({
    //   label: item.deptName,
    //   value: item.deptName,
    //   value: item.deptCode,
    // }));
    // deptList.unshift({ label: "请选择项目组", value: "" });
    // setProjectGroup(deptList);
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "获取节点信息失败",
    //   });
    // }
  };
  const getProcedureData = (workFlowName) => {
    const {
      status,
      data: { flowNodeForm },
    } = getLocalStorage("flowNodeForm");
    if (status) {
      flowNodeFormRef.current = flowNodeForm;
      const filterNodeForm = flowNodeForm.filter(
        (item) => item.flowName === workFlowName
      );
      const procedureData = filterNodeForm.map((item) => ({
        label: item.detailNodeName,
        value: item.detailNodeName,
      }));
      const detailNodeNameMap = [
        ...new Set(procedureData.map((item) => item.label)),
      ].map((item) => ({
        label: item,
        value: item,
      })); //容错

      //节点名称， 上传时使用
      flowNodeNameRef.current = [
        ...new Set(filterNodeForm.map((item) => item.flowNodeName)),
      ]?.[0];
      procedureData.unshift({ label: "请选择工序", value: "" });
      setProcedureData(detailNodeNameMap);
    }
    // const {
    //   status,
    //   data: { flowNodeForm },
    // } = getLocalStorage("flowNodeForm");
    // if (status) {
    //   const filterNodeForm = flowNodeForm.filter(
    //     (item) => item.nbName === nbName
    //   );
    //   const procedureData = filterNodeForm.map((item) => ({
    //     label: item.detailNodeName,
    //     value: item.detailNodeName,
    //   }));
    //   const detailNodeNameMap = [
    //     ...new Set(procedureData.map((item) => item.detailNodeName)),
    //   ].map((item) => ({
    //     label: item,
    //     value: item,
    //   }));
    //   procedureData.unshift({ label: "请选择工序", value: "" });
    //   setProcedureData(detailNodeNameMap);
    // }
  };

  // const getProcedureData = async () => {
  //   // const {
  //   //   status,
  //   //   data: { flowNodeForm },
  //   // } = getLocalStorage("flowNodeForm");
  //   // if (status) {

  //   //   const filterNodeForm = flowNodeForm.filter(
  //   //     (item) => item.nbName === nbName
  //   //   );
  //   //   const procedureData = filterNodeForm.map((item) => ({
  //   //     label: item.flowNodeName,
  //   //     value: item.nodeSort,
  //   //   }));
  //   //   procedureData.unshift({ label: "请选择工序", value: "" });
  //   //   setProcedureData(procedureData);
  //   // } else {
  //   //   Toast.show({
  //   //     icon: "fail",
  //   //     content: "获取节点信息失败",
  //   //   });
  //   // }

  //   const {
  //     status,
  //     data: { flowNodeForm },
  //   } = getLocalStorage("flowNodeForm");
  //   if (status) {
  //     const procedureData = flowNodeForm.map((item) => ({
  //       label: item.flowNodeName,
  //       value: item.flowNodeName,
  //       // value: item.nodeSort,
  //     }));
  //     console.log(procedureData);
  //     procedureData.unshift({ label: "请选择工序", value: "" });
  //     setProcedureData(procedureData);
  //   } else {
  //     Toast.show({
  //       icon: "fail",
  //       content: "获取节点信息失败",
  //     });
  //   }
  // };

  const getPositionData = async () => {
    const {
      status,
      data: { locationList },
    } = getLocalStorage("locationList");
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

  const getFlowInfo = async () => {
    const {
      status,
      data: { workflowForm },
    } = getLocalStorage("workflowForm");
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
          newDate: item.newDate,
          detailNodeName: item.detailNodeName,
          productionMember: item.productionMember,
        }))
        .forEach((item) => {
          const { newDate, detailNodeName, productionMember } = item;
          record +=
            newDate + " " + detailNodeName + " " + productionMember + "\n";
        });
      formRef.current.setFieldsValue({
        record,
      });
    }
  };

  const getFileTable = async () => {
    const {
      status,
      data: { zjtzData },
    } = getLocalStorage("zjtzData");
    if (status) {
      zjtzDataRef.current = zjtzData;
      const filterObj = zjtzData.find(
        (item) => item.facilityCode === scanValue
      );
      const {
        facilityCode,
        nbName,
        gdhId,
        projectTeam,
        nodeName,
        detailNodeName,
        currentPlace,
        nodeSecurity,
        productionMember,
        workFlowName,
      } = filterObj;

      console.log("formRef.current", formRef.current);
      formRef.current.setFieldsValue({
        facilityCode,
        nbName,
        gdhId,
        department: deptName || projectTeam, //待确认
        procedureName: detailNodeName,
        currentPlace: currentPlace ? currentPlace : "",
        nodeSecurity, //初始节点密级
        productionMember,
      });
      getProcedureData(workFlowName);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取本地台账信息失败",
      });
    }

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
    //       // zjtzDataRef.current = zjtzData;
    //       const filterObj = zjtzData.find(
    //         (item) => item.facilityCode === scanValue
    //       );
    //       const {
    //         facilityCode,
    //         nbName,
    //         gdhId,
    //         projectTeam,
    //         nodeName,
    //         currentPlace,
    //         nodeSecurity,
    //         productionMember,
    //       } = filterObj;
    //       console.log("formRef.current", formRef.current);
    //       formRef.current.setFieldsValue({
    //         facilityCode,
    //         nbName,
    //         gdhId,
    //         department: deptName || projectTeam, //待确认
    //         procedureName: nodeName,
    //         currentPlace: currentPlace ? currentPlace : "",
    //         nodeSecurity,
    //         productionMember,
    //       });
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

  const getFileTableEpc = async () => {
    const {
      status,
      data: { zjtzData },
    } = getLocalStorage("zjtzData");
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
          detailNodeName,
          currentPlace,
          nodeSecurity,
          productionMember,
          workFlowName,
        } = filterObj;
        console.log("formRef.current", formRef.current);
        formRef.current.setFieldsValue({
          facilityCode,
          nbName,
          gdhId,
          department: projectTeam,
          procedureName: detailNodeName,
          currentPlace: currentPlace ? currentPlace : "",
          nodeSecurity, //同上
          productionMember,
          department: projectTeam,
        });
        getProcedureData(workFlowName);
      }
    } else {
      Toast.show({
        icon: "fail",
        content: "获取本地台账信息失败",
      });
    }

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
    //       setAccountData(zjtzData);
    //       console.log("zjtzDataRef.current", zjtzDataRef.current);
    //       console.log(zjtzData, epcValue);
    //       const filterObj = zjtzData.find((item) => item.epcData === epcValue);
    //       if (!filterObj) {
    //         Toast.show({
    //           icon: "fail",
    //           content: "epc未绑定整机",
    //         });
    //       } else {
    //         const {
    //           facilityCode,
    //           nbName,
    //           gdhId,
    //           projectTeam,
    //           nodeName,
    //           currentPlace,
    //           nodeSecurity,
    //           productionMember,
    //         } = filterObj;
    //         console.log("formRef.current", formRef.current);
    //         formRef.current.setFieldsValue({
    //           facilityCode,
    //           nbName,
    //           gdhId,
    //           department: projectTeam,
    //           procedureName: nodeName,
    //           currentPlace: currentPlace ? currentPlace : "",
    //           nodeSecurity,
    //           productionMember,
    //           department: projectTeam,
    //         });
    //       }
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

  useEffect(() => {
    if (scanValue) {
      setLoading(false);
    }
  }, [scanValue]);

  useEffect(() => {
    const func = async () => {
      if (!loading) {
        if (scanValue) {
          await getFileTable();
          // getFlowInfo();
        }
        if (epcValue) {
          await getFileTableEpc(); //getFlowInfo()函数需要访问某些状态，等待这个函数设置所有状态后，再执行后续的调用
        }
        getprojectGroup();
        // getProcedureData();
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
    const {
      status,
      data: { zjtzData },
    } = getLocalStorage("zjtzData");
    if (status) {
      console.log(zjtzData, scanValue);
      const filterObj = zjtzData.find(
        (item) => item.facilityCode === scanValue
      );
      const {
        status,
        data: { cardMessageForm },
      } = getLocalStorage("cardMessageForm");
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
              label: item.cardNumber + " " + item1,
              value: item.cardNumber + " " + item1,
            }));
          breakList.push(...cardObj);
        });
        breakList.unshift(
          // { label: "请选择故障类型", value: "" },
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
    //       console.log(zjtzData, scanValue);
    //       const filterObj = zjtzData.find(
    //         (item) => item.facilityCode === scanValue
    //       );
    //       const {
    //         status,
    //         data: { cardMessageForm },
    //       } = await switchCard({ deptCode });
    //       if (status) {
    //         cardRef.current = cardMessageForm;
    //         let allObj;
    //         if (scanMode === "qrcode") {
    //           allObj = cardMessageForm.filter(
    //             (item) => item.facilityCode === scanValue
    //           );
    //         }
    //         if (scanMode === "rfid") {
    //           let facilityCode = zjtzDataRef.current.filter(
    //             (item) => item.epcData === epcValue
    //           )?.[0].facilityCode;
    //           if (facilityCode) {
    //             allObj = cardMessageForm.filter(
    //               (item) => item.facilityCode === facilityCode
    //             );
    //           } else {
    //             Toast.show({
    //               icon: "fail",
    //               content: "此epc没有对应的板卡列表",
    //             });
    //           }
    //         }
    //         const cardList = [...new Set(allObj.map((item) => item.cardName))];
    //         const breakList = [];
    //         cardList.forEach((item1) => {
    //           const cardObj = allObj
    //             .filter((item2) => item2.cardName === item1 && item2.cardNumber)
    //             .map((item) => ({
    //               label: item.cardNumber + item1,
    //               value: item.cardNumber + item1,
    //             }));
    //           breakList.push(...cardObj);
    //         });
    //         breakList.unshift(
    //           { label: "请选择故障类型", value: "" },
    //           { label: "整机故障", value: "整机故障" }
    //         );
    //         setBreakData(breakList);
    //       } else {
    //         Toast.show({
    //           icon: "fail",
    //           content: "获取板卡信息失败",
    //         });
    //       }
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
  console.log("accountData", accountData);

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
            nodeSecurity,
          });
        } else {
          formRef.current.setFieldsValue({
            nodeSecurity: "",
          });
        }
      }
    }
  };

  const handleBreakChoose = (list) => {
    breakDataRef.current = [...list];
  };

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
                <Form.Item label="细化流程节点" name="procedureName">
                  <select
                    className={styles.select}
                    onChange={handledetailNodeChange}
                  >
                    {procedureData.map((item) => {
                      return (
                        <option key={item.label} value={item.value}>
                          {item.label}
                        </option>
                      );
                    })}
                  </select>
                </Form.Item>
                <Form.Item label="操作人" name="productionMember">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="是否故障" name="isBreak">
                  <Radio.Group onChange={handleRadioChange}>
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
                </Form.Item>
                {/* {radioValue ? (
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
                ) : null} */}
                {radioValue ? (
                  <Form.Item label="故障选择" name="breakChoose">
                    <Checkbox.Group onChange={handleBreakChoose}>
                      {breakData.map((item) => (
                        <Checkbox key={item.value} value={item.value}>
                          {item.label}
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                  </Form.Item>
                ) : null}
                <Form.Item label="故障描述" name="breakMessage">
                  <TextArea placeholder="请输入描述..."></TextArea>
                </Form.Item>
                <div id="record">
                  <Form.Item label="流程记录" name="record">
                    <TextArea placeholder="流程记录..." rows={3}></TextArea>
                  </Form.Item>
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
