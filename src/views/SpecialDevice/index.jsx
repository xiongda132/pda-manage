import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { NavBar, ImageViewer, Toast } from "antd-mobile";
import { useHistory } from "react-router-dom";
import { pdaConfig, pdaStart, padStop, queryPdaData } from "api/pda";
import dayjs from "dayjs";

import styles from "./index.module.css";
import assetListData from "./assetList";

const { Multi } = ImageViewer;

export default () => {
  const [visible, setVisible] = useState(false);
  const multiRef = useRef();
  const history = useHistory();
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
  }, [history]);

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

  // console.log("curAssetEpcList", curAssetEpcList);
  const timer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [latestEpc, setLatestEpc] = useState(null);
  // const [testData, setTestData] = useState([]);
  const refreshData = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    const res = await queryPdaData({
      startTime: configTime.current,
    });
    if (res.code === 1) {
      // console.log("scan", res.data.map(({ epc }) => epc));

      const curEpcList = [];
      const scanAssetEpcList =
        res.data.filter((item) => {
          const { epc } = item;
          if (curAssetEpcList.indexOf(epc) !== -1) {
            // curEpcList.push(item);
            return true;
          }
          return false;
        }) || [];
      // setTestData(curEpcList);
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
      // setLatestEpc("20221220005099");
      // console.log("res", res);
      if (timer.current !== null) {
        timer.current = setTimeout(refreshData, 200);
      }
    }
  }, [curAssetEpcList]);

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
          特种设备展示
        </NavBar>
        {!loading ? (
          <div style={{ height: "calc(100% - 45px)", overflow: "scroll" }}>
            {/*             <div className={styles.testContainer}>
              {testData.map((item, index) => {
                return <div key={index}>{JSON.stringify(item)}</div>;
              })}
            </div> */}

            <div className={styles.title}>{curAsset.assetName}</div>
            <div className={styles.outside}>
              <div className={styles.detail}>概述:</div>
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
