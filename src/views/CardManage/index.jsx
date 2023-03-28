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
  // pdaStart,
  // padStop,
  // queryPdaData,
} from "api/pda";
import dayjs from "dayjs";

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
  const [machineInfo, setMachineInfo] = useState(machineData[0]);
  const history = useHistory();
  const [cardInfo, setCardInfo] = useState([]);
  const [isScan, setIsScan] = useState(false);
  const [epcList, setEpcList] = useState([1, 2, 3]);
  const [loading, setLoading] = useState(true);
  const [scanMode, setScanMode] = useState("");
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const [qrCodeVal, setQrCodeVal] = useState("");

  const handleSave = () => {
    Toast.show({
      icon: "success",
      content: "保存信息成功",
    });
    setCardInfo([]);
    setIsScan(false);
  };

  const addTag = (tag, index) => {
    console.log(tag, index);
    setMachineInfo({
      ...machineInfo,
      card: [
        {
          ...machineInfo.card[index],
          codeList: [...machineInfo.card[index].codeList, tag],
        },
        ...machineInfo.card.filter((tags, indexs) => {
          return indexs !== index;
        }),
      ],
    });
  };

  const deleteTag = (itemIndex, index) => {
    console.log(itemIndex, index);
    setMachineInfo({
      ...machineInfo,
      card: [
        {
          ...machineInfo.card[index],
          codeList: [
            ...machineInfo.card[index].codeList.filter(
              (item, index) => index !== itemIndex
            ),
          ],
        },
        ...machineInfo.card.filter((tags, indexs) => {
          return indexs !== index;
        }),
      ],
    });
  };

  const clickTag = (item) => {
    console.log(item);
  };

  const handleChange = (e) => {
    setScanMode(e);
  };

  const [pdaReady, setPdaReady] = useState(false);
  // const initPda = useCallback(async () => {
  //   const pdaConfigRes = await pdaConfig({
  //     scanType: 0,
  //     rfidReadpower: 30,
  //   });
  //   if (pdaConfigRes.code === 1) {
  //     const pdaStartRes = await pdaStart({
  //       startTime: configTime.current,
  //     });
  //     console.log(pdaStartRes);
  //     if (pdaStartRes.code === 1) {
  //       console.log("初始化RFID扫描成功");
  //     } else {
  //       Toast.show({
  //         icon: "fail",
  //         content: "启动失败, " + pdaStartRes.msg,
  //       });
  //     }
  //   } else {
  //     Toast.show({
  //       icon: "fail",
  //       content: "参数配置失败, " + pdaConfigRes.msg,
  //     });
  //   }
  // }, []);

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
    // initPda();
    // initQrcode();
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
        setQrCodeVal(res.scancode);
        setPdaReady(false); //状态改变, 自行清理已存在的定时器
      }
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    } else {
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    }
  }, []);

  const timer = useRef(null);
  useEffect(() => {
    if (pdaReady) {
      console.log("后执行");
      timer.current = 0;
      refreshData();
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [pdaReady]);

  useEffect(() => {
    if (scanMode === "qrcode") {
      initQrcode();
    }
  }, [scanMode]);

  // useEffect(() => {
  //   if (qrCodeVal) {
  //     const data =
  //   }
  // }, [qrCodeVal]);

  return (
    <>
      <div className={styles.cardContainer}>
        <NavBar back="返回" onBack={back}>
          板卡管理
        </NavBar>
        <div className={styles.mainContainer}>
          {loading ? (
            <div className={styles.scanQrcode}>
              请选择扫描模后, 进行扫描...
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
                    <Item span={13}>需求名称: {machineInfo?.rqName}</Item>
                    <Item span={11}>涉密等级: {machineInfo?.rank}</Item>
                    <Item span={13}>
                      生产人员: {machineInfo?.productionPerson}
                    </Item>
                    <Item span={11}>位置: {machineInfo?.position}</Item>
                    <Item span={24}>epc: {machineInfo?.epc}</Item>
                  </Grid>
                </div>
              </div>
              <div className={styles.listContainer}>
                <div className={styles.listAndAmount}>
                  <span className={styles.cardList}>板卡列表</span>
                  <span className={styles.amount}>
                    数量: {machineInfo.card?.length}
                  </span>
                  <Button
                    className={styles.save}
                    color="primary"
                    onClick={handleSave}
                  >
                    保存信息
                  </Button>
                </div>
                <div className={styles.listContent}>
                  {machineInfo.card.map((item, index) => {
                    return (
                      <div key={item.name} className={styles.cardInfo}>
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
