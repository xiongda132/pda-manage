import React, { useState, useEffect, useCallback } from "react";
import { NavBar, Space, Toast, Grid } from "antd-mobile";
import { LeftOutline } from "antd-mobile-icons";
import assetListData from "../../assetListData";

import style from "./index.module.css";
import { useHistory, useLocation } from "react-router-dom";

function getAssetList(assetId) {
  return new Promise((resole) => {
    setTimeout(() => {
      resole({
        code: 1,
        data: assetListData.find((asset) => asset.assetId === assetId),
      });
    }, 100);
  });
}

function AssetDetail({ assetId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState({});
  const history = useHistory();
  const location = useLocation();
  const refreshData = useCallback(async (assetId) => {
    const res = await getAssetList(assetId);
    if (res.code === 1) {
      setAsset(res.data);
      setLoading(false);
    } else {
      Toast.show({
        icon: "fail",
        content: "资产数据获取失败",
      });
    }
  }, []);

  const plusReady = useCallback(() => {
    const plus = window.plus || {};
    function back() {
      onClose();
      plus?.key.removeEventListener("backbutton", back);
    }
    plus?.key.addEventListener("backbutton", back);
  }, [history, location, onClose]);

  const initDevicePlus = useCallback(() => {
    if (window.plus) {
      plusReady();
    } else {
      document.addEventListener("plusready", plusReady, false);
    }
  }, [plusReady]);

  useEffect(() => {
    initDevicePlus();
    return () => {
      document.removeEventListener("plusReady", plusReady);
    };
  }, []);

  useEffect(() => {
    refreshData(assetId);
  }, [assetId, refreshData]);

  const handleBackAssetList = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className={style.container}>
      <NavBar
        backArrow={false}
        back={
          <Space onClick={handleBackAssetList} align="center">
            <LeftOutline
              style={{ verticalAlign: "middle" }}
              fontSize={28}
              color="white"
            />
            <span style={{ fontSize: 18, verticalAlign: "middle" }}>返回</span>
          </Space>
        }
      >
        资产详情
      </NavBar>

      <span className={style.assetName}>基本状况</span>
      {loading ? (
        <p style={{ textAlign: "center", marginTop: "40%", fontSize: "18px" }}>
          加载中......
        </p>
      ) : (
        <div
          style={{
            height: "calc(100% - 95px)",
          }}
          className={style.assetDetailContent}
        >
          <div>
            <span>产品编码</span>
            <span>{asset.assetId}</span>
          </div>
          <div>
            <span>规格型号</span>
            <span>{asset.spec}</span>
          </div>
          <div>
            <span>资产名称</span>
            <span>{asset.assetName}</span>
          </div>
          <div>
            <span>资产分类</span>
            <span>
              {asset.class1 + "-" + asset.class2 + "-" + asset.class3}
            </span>
          </div>
          <div>
            <span>资产状态</span>
            <span>{asset.status === 1 ? "在用" : "停用"}</span>
          </div>
          <div>
            <span>使用单位</span>
            <span>{asset.useOrgName}</span>
          </div>
          <div>
            <span>现存地点</span>
            <span>{asset.place}</span>
          </div>
          <div>
            <span>管理部门</span>
            <span>{asset.ownOrgName}</span>
          </div>
          <div>
            <span>责任人</span>
            <span>{asset.usePerson}</span>
          </div>
          <div>
            <span>生产厂家</span>
            <span>{asset.factory}</span>
          </div>
          <div>
            <span>来源</span>
            <span>{asset.from}</span>
          </div>
          <div>
            <span>资产原值</span>
            <span>{asset.oldNetValue}</span>
          </div>
          <div>
            <span>净值</span>
            <span>{asset.netValue}</span>
          </div>
          <div>
            <span>购置日期</span>
            <span>{asset.buyDate}</span>
          </div>
          <div>
            <span>入账日期</span>
            <span>{asset.addDate}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetDetail;
