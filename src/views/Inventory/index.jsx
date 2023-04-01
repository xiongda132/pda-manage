import styles from "./index.module.css";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { NavBar, Grid, Button, Toast } from "antd-mobile";
import { useHistory } from "react-router-dom";
import Detail from "./Detail";
import {
  getMember,
  getInventoryInfo,
  switchInventoryInfo,
  switchMember,
} from "api/machine";
import { getMemberLogin } from "utils/auth";

const { Item } = Grid;

export default () => {
  const [inventoryList, setInventoryList] = useState([]);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [billNo, setBillNo] = useState(null);
  const [detailVis, setDetailVis] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [memberCode, setMemberCode] = useState("");
  const memberCodeRef = useRef("");

  const back = () => {
    history.go(-1);
  };

  const getData = async () => {
    const {
      status,
      data: { checkList },
    } = await switchInventoryInfo({ memberCode: memberCodeRef.current });
    if (status) {
      setInventoryData(checkList);
    } else {
      Toast.show({
        icon: "fail",
        content: "获取盘点信息失败",
      });
    }
    const checkArr = [...new Set(checkList.map((item) => item.checkId))].map(
      (item) => ({ id: item })
    );
    setInventoryList(checkArr);
    setIsLoading(false);
  };

  const viewDetail = (id) => {
    setBillNo(id);
    setDetailVis(true);
  };

  const handleClose = useCallback(() => {
    setBillNo(null);
    setDetailVis(false);
  }, []);

  const getMemberInfo = async () => {
    const memberLogin = getMemberLogin();
    const {
      status,
      data: { memberList },
    } = await switchMember();
    if (status) {
      const { memberCode } = memberList.find(
        (item) => item.memberCode === memberLogin
      );
      memberCodeRef.current = memberCode;
    } else {
      Toast.show({
        icon: "fail",
        content: "获取人员信息失败",
      });
    }
  };

  useEffect(() => {
    getMemberInfo();
    getData();
  }, []);

  return (
    <>
      <div className={styles.inventoryContainer}>
        <NavBar back="返回" onBack={back}>
          盘点管理
        </NavBar>
        <div className={styles.listAndAmount}>
          <span className={styles.machineList}>盘点单列表</span>
          <span className={styles.amount}>数量: {inventoryList.length}</span>
        </div>
        <div className={styles.listContainer}>
          {inventoryList.map((item) => {
            const { id, theme } = item;
            return (
              <div key={id} className={styles.listItem}>
                <Grid columns={24} gap={8}>
                  <Item span={13} style={{ lineHeight: "35px" }}>
                    盘点单号: {id}
                  </Item>
                  <Item span={11}>
                    <Button
                      className={styles.viewDetail}
                      onClick={() => viewDetail(id)}
                    >
                      进入盘点单
                    </Button>
                  </Item>
                </Grid>
              </div>
            );
          })}
        </div>

        <div
          className={styles.detail}
          style={{ display: detailVis ? "block" : "none" }}
        >
          {detailVis && (
            <Detail
              id={billNo}
              onClose={handleClose}
              inventoryList={inventoryList}
              inventoryData={inventoryData}
              detailVis={detailVis}
              setDetailVis={setDetailVis}
              memberCode={memberCode}
            />
          )}
        </div>
      </div>
    </>
  );
};
