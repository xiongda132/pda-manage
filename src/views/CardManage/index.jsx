import styles from "./index.module.css";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { NavBar, Grid, Button, Toast, Radio, Space } from "antd-mobile";
import { useHistory } from "react-router-dom";
import Tags from "./components/Tags";
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
import {
  getFileTable,
  getMember,
  saveLedger,
  switchFileTable,
  switchMember,
  saveCardInfo,
  switchCard,
} from "api/machine";
import { getMemberLogin, getLocalStorage, setLocalStorage } from "utils/auth";
import { cardData } from "./test";

const { Item } = Grid;
const { Group } = Radio;

const machineData = [
  {
    gdhId: "XB001S",
    facilityCode: "202303230001",
    nbName: "测试产品1",
    rqName: "需求名称1",
    rank: "密级1",
    productionPerson: "张三",
    position: "位置1",
    epc: "12345678",
    card: [
      {
        name: "1号板卡",
        codeList: [
          { id: "00000001", text: "00000001" },
          { id: "00000002", text: "00000002" },
          { id: "00000003", text: "00000003" },
          { id: "00000004", text: "00000004" },
        ],
      },
      {
        name: "2号板卡",
        codeList: [{ id: "00000001", text: "00000001" }],
      },
      {
        name: "3号板卡",
        codeList: [],
      },
    ],
  },
];

const cardList = [
  {
    number: 1,
    name: "板卡1",
    detail: "1号板卡",
  },
  {
    number: 2,
    name: "板卡2",
    detail: "2号板卡",
  },
  {
    number: 3,
    name: "板卡3",
    detail: "3号板卡",
  },
  {
    number: 4,
    name: "板卡4",
    detail: "4号板卡",
  },
  {
    number: 5,
    name: "板卡5",
    detail: "5号板卡",
  },
  {
    number: 6,
    name: "板卡6",
    detail: "6号板卡",
  },
  {
    number: 7,
    name: "板卡7",
    detail: "7号板卡",
  },
  {
    number: 8,
    name: "板卡8",
    detail: "8号板卡",
  },
  {
    number: 9,
    name: "板卡9",
    detail: "9号板卡",
  },
  {
    number: 10,
    name: "板卡10",
    detail: "10号板卡",
  },
  {
    number: 11,
    name: "板卡11",
    detail: "11号板卡",
  },
  {
    number: 12,
    name: "板卡12",
    detail: "12号板卡",
  },
];

const getMachineInfo = (id) => {
  return new Promise((resolve, reject) => {
    resolve({
      code: 1,
      data: machineData.find((item) => item.id === id),
    });
  });
};

const getCardInfo = () => {
  return new Promise((resolve, reject) => {
    resolve({
      code: 1,
      data: cardList,
    });
  });
};

export default () => {
  const [machineInfo, setMachineInfo] = useState(null);
  const history = useHistory();
  const [cardInfo, setCardInfo] = useState([]);
  const [isScan, setIsScan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanMode, setScanMode] = useState("");
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const [qrCodeVal, setQrCodeVal] = useState("");
  const depCodeRef = useRef();
  const [card, setCard] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scanValue, setScanValue] = useState("");
  const [epcValue, setEpcValue] = useState("");
  const [flag, setFlag] = useState(false);
  const cardRef = useRef(null);
  const zjtzDataRef = useRef(null);

  const getFileTable = async () => {
    const {
      status,
      data: { zjtzData },
    } = getLocalStorage("zjtzData");
    if (status) {
      const filterObj = zjtzData.find(
        (item) => item.facilityCode === scanValue
      );
      const {
        status,
        data: { cardMessageForm },
      } = getLocalStorage("cardMessageForm");
      if (status) {
        cardRef.current = cardMessageForm;
        const allObj = cardMessageForm.filter(
          (item) => item.facilityCode === scanValue
        );
        const cardList = [...new Set(allObj.map((item) => item.cardName))];
        const card = [];
        cardList.forEach((item1) => {
          //cardNumber为空返回空数组
          const cardObj = allObj
            .filter((item2) => item2.cardName === item1 && item2.cardNumber)
            .map((item) => ({
              id: item.cardNumber,
              text: item.cardNumber,
              className: item.isCardBreak === "是" ? styles.break : "",
            }));
          card.push({
            name: item1,
            codeList: cardObj,
          });
        });
        setFlag(true);
        setLoading(false);
        setCard(card);
        setMachineInfo(filterObj);
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
  };

  const getFileTableEpc = async () => {
    const {
      status,
      data: { zjtzData },
    } = getLocalStorage("zjtzData");
    if (status) {
      console.log(zjtzData, epcValue);
      zjtzDataRef.current = zjtzData;
      const filterObj = zjtzData.find((item) => item.epcData === epcValue);
      if (!filterObj) {
        Toast.show({
          icon: "fail",
          content: "epc未绑定整机",
        });
      } else {
        const {
          status,
          data: { cardMessageForm },
        } = getLocalStorage("cardMessageForm");
        if (status) {
          cardRef.current = cardMessageForm;
          console.log(cardRef.current);
          const allObj = cardMessageForm.filter(
            (item) => item.facilityCode === filterObj.facilityCode
          );
          const cardList = [...new Set(allObj.map((item) => item.cardName))];
          const card = [];
          cardList.forEach((item1) => {
            const cardObj = allObj
              .filter((item2) => item2.cardName === item1 && item2.cardNumber)
              .map((item) => ({
                id: item.cardNumber,
                text: item.cardNumber,
                className: item.isCardBreak === "是" ? styles.break : "",
              }));
            card.push({
              name: item1,
              codeList: cardObj,
            });
          });
          setPdaReadyEpc(false);
          setScanMode("qrcode");
          setFlag(true);
          setLoading(false);
          setCard(card);
          setMachineInfo(filterObj);
        } else {
          Toast.show({
            icon: "fail",
            content: "获取板卡信息失败",
          });
        }
      }
    } else {
      Toast.show({
        icon: "fail",
        content: "获取整机台账信息失败",
      });
    }
  };

  useEffect(() => {
    console.log(scanValue);
    if (scanValue) {
      getFileTable();
    }
  }, [scanValue]);

  useEffect(() => {
    console.log(epcValue);
    if (epcValue) {
      getFileTableEpc();
    }
  }, [epcValue]);

  const handleSave = async () => {
    const cardMap = [...card];
    const cardMessageForm = [];
    console.log(cardRef.current);
    cardMap.forEach((item1) => {
      if (item1.codeList.length) {
        item1.codeList.forEach((item2) => {
          console.log(item2.text);
          cardMessageForm.push({
            dataId: cardRef.current.find(
              (item) => item.cardNumber === item2.text
            ).dataId,
            cardName: item1.name,
            cardNumber: item2.text,
            nbName: cardRef.current.find((item) => item.cardName === item1.name)
              .nbName,
            facilityCode: cardRef.current.find(
              (item) => item.cardName === item1.name
            ).facilityCode,
            cardBreakMessage: cardRef.current.find(
              (item) => item.cardNumber === item2.text
            )
              ? cardRef.current.find((item) => item.cardNumber === item2.text)
                  .cardBreakMessage
              : "",
            errorDate: cardRef.current.find(
              (item) => item.cardNumber === item2.text
            )
              ? cardRef.current.find((item) => item.cardNumber === item2.text)
                  .errorDate
              : "",
            isCardBreak: cardRef.current.find(
              (item) => item.cardNumber === item2.text
            )
              ? cardRef.current.find((item) => item.cardNumber === item2.text)
                  .isCardBreak
              : "否",
            gdhId: cardRef.current.find((item) => item.cardName === item1.name)
              .gdhId,
          });
        });
      } else {
        cardMessageForm.push({
          dataId: "",
          cardName: item1.name,
          cardNumber: "",
          nbName: cardRef.current.find((item) => item.cardName === item1.name)
            .nbName,
          facilityCode: cardRef.current.find(
            (item) => item.cardName === item1.name
          ).facilityCode,
          cardBreakMessage: "",
          errorDate: "",
          isCardBreak: "",
          gdhId: cardRef.current.find((item) => item.cardName === item1.name)
            .gdhId,
        });
      }
    });
    console.log(cardMessageForm);

    //本地逻辑, 对操作数据进行存储
    if (getLocalStorage("cardMessageFormUpload")) {
      const cardMessageFormUpload = [
        ...getLocalStorage("cardMessageFormUpload"),
      ];
      cardMessageFormUpload.push(...cardMessageForm);
      setLocalStorage("cardMessageFormUpload", cardMessageFormUpload);
    } else {
      setLocalStorage("cardMessageFormUpload", cardMessageForm);
    }

    //本地逻辑，对本地接口数据进行修改
    if (getLocalStorage("cardMessageForm")) {
      let cardMessageFormRes = { ...getLocalStorage("cardMessageForm") };
      if (scanValue) {
        cardMessageFormRes.data.cardMessageForm.forEach((item, index, arr) => {
          if (item.facilityCode === scanValue) {
            arr.splice(index, 1);
          }
        });
        cardMessageFormRes.data.cardMessageForm.unshift(...cardMessageForm);

      } else if (epcValue) {
        const { facilityCode } = zjtzDataRef.current.find(
          (item) => item.epcData === epcValue
        );
        cardMessageFormRes.data.cardMessageForm.forEach((item, index, arr) => {
          if (item.facilityCode === facilityCode) {
            arr.splice(index, 1);
          }
        });
        cardMessageFormRes.data.cardMessageForm.unshift(...cardMessageForm);
      }
      setLocalStorage("cardMessageForm", cardMessageFormRes);
    }

    // const { status } = await saveCardInfo({ cardMessageForm });
    // if (status) {
    //   Toast.show({
    //     icon: "success",
    //     content: "保存信息成功",
    //   });
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "保存信息失败",
    //   });
    // }
    // setCardInfo([]);
    // setIsScan(false);
  };

  const addTag = (tag, index) => {
    console.log(tag, index);
    const cardList = [...card];
    cardList[index].codeList.push(tag);
    setCard([...cardList]);
  };

  const deleteTag = (itemIndex, index) => {
    console.log(itemIndex, index);
    const cardList = [...card];
    cardList[index].codeList = cardList[index].codeList.filter(
      (item, indexs) => indexs !== itemIndex
    );
    setCard([...cardList]);
  };

  const clickTag = (item) => {
    console.log(item);
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
          setQrCodeVal(res.scancode);
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

  useEffect(() => {
    if (qrCodeVal) {
      const tag = { id: qrCodeVal, text: qrCodeVal };
      addTag(tag, currentIndex);
    }
  }, [qrCodeVal]);

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
      <div className={styles.cardContainer}>
        <NavBar back="返回" onBack={back}>
          板卡管理
        </NavBar>
        <div className={styles.mainContainer}>
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
            <div>
              <div className={styles.machineContainer}>
                <div className={styles.machineInfo}>整机信息</div>
                <div className={styles.machineContent}>
                  <Grid columns={24} gap={8}>
                    <Item span={24}>工单号: {machineInfo?.gdhId}</Item>
                    <Item span={13}>设备编号: {machineInfo?.facilityCode}</Item>
                    <Item span={11}>内部名称: {machineInfo?.nbName}</Item>
                    <Item span={13}>需求名称: {machineInfo?.ReqName}</Item>
                    <Item span={11}>涉密等级: {machineInfo?.nodeSecurity}</Item>
                    {/* <Item span={13}>
                      生产人员: {machineInfo?.productionPerson}
                    </Item> */}
                    <Item span={13}>位置: {machineInfo?.currentPlace}</Item>
                    <Item span={11}>epc: {machineInfo?.epcData}</Item>
                  </Grid>
                </div>
              </div>
              <div className={styles.listContainer}>
                <div className={styles.listAndAmount}>
                  <span className={styles.cardList}>板卡列表</span>
                  <span className={styles.amount}>数量: {card?.length}</span>
                  <Button
                    className={styles.save}
                    color="primary"
                    onClick={handleSave}
                  >
                    保存信息
                  </Button>
                </div>
                <div className={styles.listContent}>
                  {card?.map((item, index) => {
                    return (
                      <div
                        key={item.name}
                        className={
                          currentIndex === index
                            ? styles.heightLight
                            : styles.cardInfo
                        }
                        onClick={() => {
                          setCurrentIndex(index);
                        }}
                      >
                        <Grid columns={24} gap={8}>
                          <Item span={24}>板卡名称: {item?.name}</Item>
                          <Item span={24}>
                            板卡编号个数: {item?.codeList.length}
                          </Item>
                          <Item span={24}>
                            <Tags
                              index={index}
                              tags={item.codeList}
                              addTag={addTag}
                              deleteTag={deleteTag}
                              clickTag={clickTag}
                            ></Tags>
                          </Item>
                        </Grid>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
