import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { NavBar, ImageViewer, Toast } from "antd-mobile";
import { useHistory, useLocation } from "react-router-dom";
import { pdaConfig, pdaStart, padStop, queryPdaData } from "api/pda";
import dayjs from "dayjs";

import assetListData from "./assetList";
import styles from "./index.module.css";

const { Multi } = ImageViewer;

export default () => {
  const [visible, setVisible] = useState(false);
  const multiRef = useRef();
  const history = useHistory();
  const location = useLocation()
  const back = () => {
    history.go(-1);
  };

  const plusReady = useCallback(() => {
    const plus = window.plus || {};
    function back() {
      history.go(-1);
      plus?.key.removeEventListener("backbutton", back);
    }
    plus?.key.addEventListener("backbutton", back);
  }, [history, location]);

  const initDevicePlus = useCallback(() => {
    if (window.plus) {
      plusReady();
    } else {
      document.addEventListener("plusready", plusReady, false);
    }
  }, [plusReady]);

  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));

  const [pdaReady, setPdaReady] = useState(false);
  const initPda = useCallback(async () => {
    const pdaConfigRes = await pdaConfig({
      scanType: 0,
      rfidReadpower: 15,
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

  // const queryInterval = async () => {
  //   const queryRes = await queryPdaData();
  //   queryRes.data = [
  //     {
  //       EPC: "7777",
  //       TID: "7777",
  //       User: "77777",
  //       RSSI: "77777",
  //       times: "2",
  //       rate: "777777",
  //       ante: "1",
  //       writeTime: "2020-03-14 15:35:11",
  //     },
  //     {
  //       EPC: "202212200043",
  //       TID: "88888888",
  //       User: "88888888",
  //       RSSI: "88888888",
  //       times: "1",
  //       rate: "88888888",
  //       ante: "1",
  //       writeTime: "2020-04-14 15:35:11",
  //     },
  //   ];
  //   console.log(queryRes.data[queryRes.data.length - 1]);
  //   const filterData = gangmubanAssetList.filter(
  //     (item) => item.epc === queryRes.data[queryRes.data.length - 1].EPC
  //   );
  //   setViewData(filterData[0]);

  //   setIsScan(true);
  // };

  useEffect(() => {
    initPda();
    initDevicePlus();
    return () => {
      padStop({
        endTime: configTime.current,
      });
      document.removeEventListener("plusReady", plusReady);
    };
  }, [initPda, initDevicePlus]);

  const curAssetEpcList = useMemo(
    () => assetListData.map(({ epc }) => epc),
    []
  );

  const timer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [latestEpc, setLatestEpc] = useState(null);
  const refreshData = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    const res = await queryPdaData({
      startTime: configTime.current,
    });
    if (res.code === 1) {
      const scanAssetEpcList =
        res.data.filter(({ epc }) => {
          return curAssetEpcList.indexOf(epc) !== -1;
        }) || [];
      const latestEpc = scanAssetEpcList.reverse()[0];
      if (
        latestEpc &&
        latestEpc.epc &&
        curAssetEpcList.indexOf(latestEpc.epc) !== -1
      ) {
        setLatestEpc(latestEpc.epc);
        setLoading(false);
      }
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    } else {
      // setLoading(false);
      // setLatestEpc("202212200044");
      // console.log("res", res);
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

  const curAsset = useMemo(() => {
    if (!latestEpc) return { images: [] };
    const curAsset = assetListData.find(({ epc }) => epc === latestEpc) || {};
    return { ...curAsset };
  }, [latestEpc]);

  return (
    <>
      <div style={{ height: "100vh" }}>
        <NavBar back="返回" onBack={back}>
          混凝土标构件展示
        </NavBar>
        {!loading ? (
          <div style={{ height: "calc(100% - 45px)", overflow: "scroll" }}>
            <div className={styles.title}>{curAsset.assetName}</div>
            <div className={styles.outside}>
              <div className={styles.detail}>产品详情:</div>
              <div className={styles.inside}>{curAsset.desc}</div>
            </div>
            <div className={styles.show}>
              <div className={styles.image}>展示图:</div>
              {curAsset.images.map((item, index) => (
                <img
                  key={item}
                  src={item}
                  width="100%"
                  onClick={() => {
                    setVisible(true);
                    multiRef.current.swipeTo(index);
                  }}
                ></img>
              ))}
              <Multi
                images={curAsset.images}
                visible={visible}
                ref={multiRef}
                onClose={() => {
                  setVisible(false);
                }}
              />
            </div>
          </div>
        ) : (
          <div className={styles.loading}>等待扫描...</div>
        )}
      </div>
    </>
  );
};
