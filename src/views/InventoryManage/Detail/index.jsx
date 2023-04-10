import styles from "./index.module.css";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { NavBar, Grid, Button, Toast } from "antd-mobile";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";
import { pdaConfig, pdaStart, padStop, queryPdaData } from "api/pda";
import { savaInventoryInfo } from "api/machine";
import { getLocalStorage, setLocalStorage } from "utils/auth";

const { Item } = Grid;

export default ({
  id,
  inventoryData,
  detailVis,
  setDetailVis,
  inventoryList,
  memberCode,
}) => {
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const history = useHistory();
  const [predata, setPreData] = useState(() =>
    inventoryData.filter((item) => item.checkId === id)
  );
  console.log("predata", predata);

  const handleSave = async () => {
    const checkListMap = predata.map((item) => ({
      checkId: item.checkId,
      facilityCode: item.facilityCode,
      memberCode,
      checkResult: item.state,
      newDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      // flag: item.flag ? true : false
    }));

    //扫前和扫后相加的已盘数据
    const checkList = checkListMap.filter(
      (item) => item.checkResult === "已盘" /* && item.flag */
    );

    console.log("checkList", checkList);

    //后续对匹配的设备编码进行修改
    const facilityCodeList = checkList.map((item) => item.facilityCode);

    //本地逻辑, 对操作数据进行存储
    if (getLocalStorage("inventoryDataUpload")) {
      const inventoryDataUpload = [...getLocalStorage("inventoryDataUpload")];
      inventoryDataUpload.push(...checkList);
      setLocalStorage("inventoryDataUpload", inventoryDataUpload);
    } else {
      setLocalStorage("inventoryDataUpload", checkList);
    }

    //本地逻辑，对已保存的接口数据修改状态
    if (getLocalStorage("checkList")) {
      let checkListRes = { ...getLocalStorage("checkList") };
      checkListRes.data.checkList.forEach((item) => {
        facilityCodeList.forEach((item2) => {
          if (item.facilityCode === item2) {
            item.state = "已盘";
          }
        });
      });
      setLocalStorage("checkList", checkListRes);
    }

    Toast.show({
      icon: "success",
      content: "盘点完成",
    });
    // const res = await savaInventoryInfo({ checkList });
    // if (res.status) {
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

  // const scanList = useMemo(() => {
  //   return inventoryData.filter((item) => epcList.indexOf(item.RFID) !== -1);
  // }, [epcList]);
  // 非必要，若是盘点数据之外的epc，在遍历中不不会被筛选，不修改任何状态

  useEffect(() => {
    if (epcList.length) {
      setPreData((pre) => {
        let cur = [...pre];
        epcList.forEach((item1) => {
          cur.forEach((item2, _, arr) => {
            if (item1 === item2.RFID && item2.state === "未盘") {
              item2.state = "已盘";
              // item2.flag = true;
            }
            //"epc对应的设备编码不在盘点单中"的逻辑处理
            // const rfidList = arr.map(({ RFID }) => RFID);
            // if (!rfidList.includes(item1)) {
            //   const epcObj = notBelongToBill(item1);
            //   if (epcObj) {
            //     arr.push(epcObj);
            //     Toast.show({
            //       content: `${epcObj.facilityCode}不在盘点单中`,
            //     });
            //   } else {
            //     Toast.show({
            //       content: `epc未绑定主机`,
            //     });
            //   }
            // }
          });
        });
        return cur;
      });
    }
  }, [epcList]);

  
  // const notBelongToBill = (epc) => {
  //   const zjtzDataRes = getLocalStorage("zjtzData");
  //   const epcObj = zjtzDataRes.data.zjtzData.find(
  //     (item) => item.epcData === epc
  //   );
  //   return epcObj;
  // };

  const inventoryAmount = useMemo(() => {
    return predata.filter((item) => item.state === "已盘").length;
  }, [predata]);

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
                <Item span={17}>
                  盘点数据: {inventoryAmount} / {predata.length}
                </Item>
                <Item span={7}>
                  <Button color="primary" onClick={handleSave}>
                    盘点结束
                  </Button>
                </Item>
              </Grid>
            </div>
          </div>
          <div className={styles.listContent}>
            {predata?.map((item) => {
              const {
                facilityCode,
                gdhId,
                place,
                plateNumber,
                ReqName,
                productionMember,
                security,
                state,
                detailNodeName,
              } = item;
              return (
                <div
                  key={item.facilityCode}
                  className={styles.inventoryInfo}
                  style={{
                    background:
                      state === "已盘"
                        ? "rgba(0, 191, 191, .76)"
                        : "rgba(242, 242, 242, .87)",
                  }}
                >
                  <Grid columns={24} gap={10} style={{ position: "relative" }}>
                    <Item span={12}>工单号: {gdhId}</Item>
                    <Item span={12}>设备编号: {facilityCode}</Item>
                    <Item span={12}>铭牌编号: {plateNumber}</Item>
                    <Item span={12}>需求名称: {ReqName}</Item>
                    <Item span={12}>保密等级: {security}</Item>
                    <Item span={12}>位置: {place}</Item>
                    <Item span={12}>细化流程节点: {detailNodeName}</Item>
                    <Item span={12}>生产人员: {productionMember}</Item>
                    <Button
                      className={styles.statusButton}
                      style={{
                        background:
                          state === "已盘"
                            ? "rgba(0, 191, 191, .76)"
                            : "rgba(170, 170, 170, .87)",
                        color: "#ffffff",
                        borderColor: "#ffffff",
                      }}
                    >
                      {state}
                    </Button>
                  </Grid>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
