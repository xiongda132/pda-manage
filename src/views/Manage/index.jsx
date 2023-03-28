import styles from "./index.module.css";
import { useCallback, useEffect, useState } from "react";
import { NavBar, Grid, Button, Toast } from "antd-mobile";
import { useHistory } from "react-router-dom";
import Detail from "./Detail";

const { Item } = Grid;

export default () => {
  const [positionData, setPositionData] = useState([]);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [positionId, setPositionId] = useState(null);
  const [isShowDetail, setIsShowDetail] = useState(false);

  const back = () => {
    history.go(-1);
  };

  const getData = () => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        id: i + 1,
        name: `板卡${i + 1}`,
        model: `模型${i + 1}`,
      });
    }
    setPositionData(data);
    setIsLoading(false);
  };

  const viewDetail = (id) => {
    setPositionId(id);
    setIsShowDetail(true);
  };

  const handleClose = useCallback(() => {
    setPositionId(null);
    setIsShowDetail(false);
  }, []);

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <div className={styles.cardContainer}>
        <NavBar back="返回" onBack={back}>
          工序管理
        </NavBar>
        <div className={styles.listAndAmount}>
          <span className={styles.machineList}>工序列表</span>
          <span className={styles.amount}>数量: {positionData.length}</span>
        </div>
        <div className={styles.listContainer}>
          {isLoading ? (
            <p className={styles.waitScan}>等待扫描...</p>
          ) : (
            positionData.map((item) => {
              const { id, name, model } = item;
              return (
                <div key={item.id} className={styles.listItem}>
                  <Grid columns={24} gap={8}>
                    <Item span={12}>标识码: {id}</Item>
                    <Item span={12}>名称: {name}</Item>
                    <Item span={12}>类型: {model}</Item>
                    <Item span={12}>
                      <Button
                        className={styles.viewDetail}
                        onClick={() => viewDetail(id)}
                      >
                        查看详情
                      </Button>
                    </Item>
                  </Grid>
                </div>
              );
            })
          )}
        </div>

        <div
          className={styles.detail}
          style={{ display: isShowDetail ? "block" : "none" }}
        >
          {isShowDetail && <Detail id={positionId} onClose={handleClose} />}
        </div>
      </div>
    </>
  );
};
