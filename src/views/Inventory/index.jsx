import styles from "./index.module.css";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { NavBar, Grid, Button, Toast } from "antd-mobile";
import { useHistory } from "react-router-dom";
import Detail from "./Detail";
import { getMember, getInventoryInfo } from "api/machine";
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
    let data = [];
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        data.push({
          gdhId: `2023032${i + 1}`,
          RFID: `2023032${i + 1}`,
          facilityCode: `设备编号${i + 1}`,
          ReqName: `需求名称${i + 1}`,
          inner: `内部名称${i + 1}`,
          nodeName: `流程节点${i + 1}`,
          security: "非密",
          productionMember: "夏芬",
          plateNumber: `铭牌编号${i + 1}`,
          place: `位置${i + 1}`,
          detailNodeName: `XB00${i + 1}S`,
          state: "已盘",
        });
      } else {
        data.push({
          gdhId: `2023032${i + 1}`,
          RFID: `2023032${i + 1}`,
          facilityCode: `设备编号${i + 1}`,
          ReqName: `需求名称${i + 1}`,
          inner: `内部名称${i + 1}`,
          nodeName: `流程节点${i + 1}`,
          security: "非密",
          productionMember: "夏芬",
          plateNumber: `铭牌编号${i + 1}`,
          place: `位置${i + 1}`,
          detailNodeName: `XB00${i + 1}S`,
          state: "未盘",
        });
      }
    }
    const onePart = data.slice(0, 2).map((item) => ({ ...item, checkId: "1" }));
    const twoPart = data.slice(2, 4).map((item) => ({ ...item, checkId: "2" }));
    const threePart = data.slice(4).map((item) => ({ ...item, checkId: "3" }));
    data = [...onePart, ...twoPart, ...threePart]; //从后端拿到的数据
    // const res = await getInventoryInfo({ memberCodeRef.current });
    // if (res.status) {
    //   setInventoryData(res.data.checkList);
    // } else {
    //   Toast.show({
    //     icon: "fail",
    //     content: "获取盘点信息失败",
    //   });
    // }
    setInventoryData(data);
    const checkArr = [...new Set(data.map((item) => item.checkId))].map(
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
    const res = await getMember();
    if (res.status) {
      const { memberCode } = res.data.memberList.find(
        (item) => item.memberLogin === memberLogin
      );
      memberCodeRef.current = memberCode;
      // setMemberCode(memberCode);
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
