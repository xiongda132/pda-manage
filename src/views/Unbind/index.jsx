import { useHistory } from "react-router-dom";
import {
  NavBar,
  Grid,
  Button,
  Toast,
  Checkbox,
  List,
} from "antd-mobile";
import styles from "./index.module.css";
import { useEffect, useState, useRef } from "react";

const { Item } = Grid;

const ListItemWithCheckbox = ({ obj }) => {
  const { code, major, model, name, rank, position } = obj;
  const checkboxRef = useRef(null);
  return (
    <List.Item
      prefix={
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox value={code} ref={checkboxRef}></Checkbox>
        </div>
      }
      onClick={() => {
        checkboxRef.current.toggle();
      }}
      arrow={false}
    >
      <div className={styles.singleWrapper}>
        <Grid columns={24} gap={8}>
          <Item span={15}>产品编码: {code}</Item>
          <Item span={9}>负责人: {major}</Item>
          <Item span={15}>规格型号: {model}</Item>
          <Item span={9}>名称: {name}</Item>
          <Item span={15}>保密等级: {rank}</Item>
          <Item span={9}>位置: {position}</Item>
        </Grid>
      </div>
    </List.Item>
  );
};

export default () => {
  const history = useHistory();
  const [product, setProduct] = useState([]);
  const back = () => {
    history.go(-1);
  };

  const getProductInfo = () => {
    const productData = [
      {
        code: "202210130001",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130002",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130003",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130004",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130005",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130006",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130007",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130008",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "202210130009",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
      {
        code: "2022101300010",
        major: "张三",
        model: "HXB87234",
        name: "测试产品",
        rank: "密级1",
        position: "位置1",
      },
    ];
    setTimeout(() => {
      setProduct(productData);
    }, 1 * 1000);
  };

  const handleUnbind = () => {
    Toast.show({
      icon: "success",
      content: "解绑成功",
    });
  };

  const handleChange = (list) => {
    console.log(list);
  };

  useEffect(() => {
    getProductInfo();
  }, []);

  return (
    <>
      <div className={styles.unbindContainer}>
        <NavBar back="返回" onBack={back}>
          批量解绑
        </NavBar>
        <div className={styles.unbindWrapper}>
          <div className={styles.buttonWrapper}>
            <Button
              className={styles.buttonStyle}
              color="primary"
              size="large"
              onClick={handleUnbind}
              style={{
                visibility: product.length ? "visible" : "hidden",
              }} /* 其他方案opacity、display */
            >
              解绑
            </Button>
          </div>
          <div className={styles.listAndAmount}>
            <span className={styles.productList}>产品列表</span>
            <span className={styles.amount}>数量: {product.length}</span>
          </div>
          <div className={styles.productList}>
            <Checkbox.Group onChange={handleChange}>
              <List>
                {product.map((item) => (
                  <ListItemWithCheckbox key={item.code} obj={item} />
                ))}
              </List>
            </Checkbox.Group>
          </div>
        </div>
      </div>
    </>
  );
};
