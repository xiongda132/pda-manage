import React, { useState, useEffect, useCallback, useRef } from "react";
import { NavBar, Space, Toast, Grid } from "antd-mobile";
import { LeftOutline } from "antd-mobile-icons";
import { useHistory } from "react-router-dom";

import dayjs from "dayjs";

import AssetDetail from "./conponents/AssetDetail";
import assetListData from "./assetListData";

import { pdaConfig, pdaStart, padStop, queryPdaData } from "api/pda";

import style from "./index.module.css";
import { useMemo } from "react";

function AssetView() {
  const configTime = useRef(dayjs().format("YYYY-MM-DD HH:mm:ss"));

  const history = useHistory();
  const handleBackMainPage = useCallback(() => {
    history.push("/");
  }, [history]);

  const [detailVis, setDetailVis] = useState(false);
  const [curAssetId, setAssetId] = useState(null);
  const handleViewAssetDetail = useCallback((assetId) => {
    setAssetId(assetId);
    setDetailVis(true);
  }, []);
  const handleCloseDetail = useCallback(() => {
    setDetailVis(false);
    setAssetId(null);
  }, []);

  const [pdaReady, setPdaReady] = useState(false);
  const initPda = useCallback(async () => {
    const pdaConfigRes = await pdaConfig({
      scanType: 0,
      rfidReadpower: 30,
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
  const refreshData = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    const res = await queryPdaData({
      startTime: configTime.current,
    });
    // console.log("res", res);
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

  const viewAssetList = useMemo(() => {
    return assetListData.filter(({ epc }) => epcList.indexOf(epc) !== -1);
  }, [epcList]);

  return (
    <div className={style.container}>
      <NavBar
        backArrow={false}
        back={
          <Space onClick={handleBackMainPage} align="center">
            <LeftOutline
              style={{ verticalAlign: "middle" }}
              fontSize={24}
              color="white"
            />
            <span style={{ fontSize: 16, verticalAlign: "middle" }}>返回</span>
          </Space>
        }
      >
        资产展示
      </NavBar>

      <div className={style.titleContainer}>
        <span className={style.assetTitle}>资产列表</span>
        <span className={style.assetCount}>数量:{viewAssetList.length}</span>
      </div>
      <div
        className={style.assetListContent}
        id="assetListScrollContainer"
        style={{
          height: "calc(100% - 90px)",
        }}
      >
        {loading ? (
          <p
            style={{ textAlign: "center", marginTop: "40%", fontSize: "20px" }}
          >
            等待扫描...
          </p>
        ) : (
          viewAssetList.map((asset, index) => {
            const { assetName, assetId, spec, status, ownOrgName } = asset;
            return (
              <div key={index}>
                <Grid columns={24} gap={8}>
                  <Grid.Item span={14}>产品编码: {assetId}</Grid.Item>
                  <Grid.Item span={10}>资产名称: {assetName}</Grid.Item>
                  <Grid.Item span={14}>规格型号: {spec}</Grid.Item>
                  <Grid.Item span={10}>
                    资产状态: {status === 1 ? "在用" : "停用"}
                  </Grid.Item>
                  <Grid.Item span={16}>使用单位: {ownOrgName}</Grid.Item>
                  <Grid.Item span={8}>
                    <span
                      onClick={handleViewAssetDetail.bind(null, assetId)}
                      className={style.viewDetail}
                    >
                      查看详情
                    </span>
                  </Grid.Item>
                </Grid>
              </div>
            );
          })
        )}
      </div>

      <div
        style={{
          display: detailVis ? "inline-block" : "none",
        }}
        className={style.assetDetailContainer}
      >
        {detailVis && (
          <AssetDetail assetId={curAssetId} onClose={handleCloseDetail} />
        )}
      </div>
    </div>
  );
}

export default AssetView;
