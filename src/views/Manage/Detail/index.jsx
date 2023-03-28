import {
  NavBar,
  Grid,
  Button,
  Toast,
  Picker,
  Space,
  Checkbox,
  TextArea,
  Form,
  Input,
  Radio,
} from "antd-mobile";
import { useHistory } from "react-router-dom";
import styles from "./index.module.css";
import { useEffect, useState, useRef } from "react";

const { Item } = Grid;

const rankData = [
  { label: "请选择密级", value: "" },
  { label: "密级1", value: 1 },
  { label: "密级2", value: 2 },
  { label: "密级3", value: 3 },
];

const positionData = [
  { label: "请选择位置", value: "" },
  { label: "位置1", value: 1 },
  { label: "位置2", value: 2 },
  { label: "位置3", value: 3 },
  { label: "位置4", value: 4 },
];

const procedureData = [
  { label: "请选择工序", value: "" },
  { label: "整机", value: 1 },
  { label: "整机升级", value: 2 },
  { label: "常温", value: 3 },
  { label: "所检", value: 4 },
];

const projectData = [
  { label: "请选择项目组", value: "" },
  { label: "项目组1", value: 1 },
  { label: "项目组2", value: 2 },
  { label: "项目组3", value: 3 },
];

const machineData = [
  {
    id: 1,
    billNo: "202210130001",
    code: "202210130001",
    major: "张三",
    model: "XB001S",
    name: "测试产品",
    rank: "",
    position: "",
    procedure: "",
    isFault: "false",
    description: "",
    record:
      "2022.10.13 14:10:40 张三  整机\n2022.10.13 14:20:40 张三  整机升级\n2022.10.13 14:30:40 张三  整机调测\n2022.10.13 14:40:40 张三  常温\n2022.10.13 14:45:40 张三  整机\n",
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

export default ({ id, onClose }) => {
  const history = useHistory();

  const formRef = useRef(null);
  const [checkboxValue, setCheckboxValue] = useState(false);

  const back = () => {
    history.go(-1);
  };

  const onFinish = (formObj) => {
    const cloneObj = Object.assign({}, formObj); //浅拷贝, 接口实参
    console.log(cloneObj);
    const res = {};
    res.code = 1;
    if (res.code === 1) {
      Toast.show({
        icon: "success",
        content: "提交成功",
      });
    } else {
      Toast.show({
        icon: "fail",
        content: `${res.message}`,
      });
    }
  };

  const getProcedureObj = () => {
    const procedureObj = {
      billNo: "202210130001",
      code: "202210130001",
      name: "测试产品",
      major: "张三",
      completedPro:
        "2022.10.13 14:10:40 张三  整机\n2022.10.13 14:20:40 张三  整机升级\n2022.10.13 14:30:40 张三  整机调测\n2022.10.13 14:40:40 张三  常温\n2022.10.13 14:45:40 张三  整机\n",
    };
  };

  const handleSave = () => {
    Toast.show({
      icon: "success",
      content: "保存成功",
    });
  };

  const getPositionData = async (id) => {
    const res = await getMachineInfo(id);
    if (res.code === 1) {
      formRef.current.setFieldsValue(res.data);
    }
  };

  const handleChange = (value) => {
    setCheckboxValue(value);
  };

  const inputChange = (e) => {
    console.log(e);
  };

  useEffect(() => {
    getProcedureObj();
  }, []);

  useEffect(() => {
    getPositionData(id);
  }, [id]);

  return (
    <>
      <div className={styles.procedureContainer}>
        <NavBar back="返回" onBack={back}>
          工序管理
        </NavBar>
        <div className={styles.procedureWrapper}>
          <div className={styles.procedureContent}>
            <Form
              ref={(r) => (formRef.current = r)}
              layout="horizontal"
              footer={
                <Button
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  style={{ marginTop: "-20px" }}
                >
                  提交
                </Button>
              }
              onFinish={onFinish}
              mode="card"
            >
              {/* 不需要添加value、onChange来同步值, 由Form元素自动同步 */}
              <Form.Item label="工单号" name="billNo">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="编码" name="code">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="名称" name="name">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="密级" name="rank">
                <select className={styles.select}>
                  {rankData.map((item) => {
                    return (
                      <option key={item.label} value={item.value}>
                        {item.label}
                      </option>
                    );
                  })}
                </select>
              </Form.Item>
              <Form.Item
                label="位置"
                name="position"
                style={{ display: "inline-block", minHeight: "50px" }}
              >
                {!checkboxValue ? (
                  <select className={styles.select}>
                    {positionData.map((item) => {
                      return (
                        <option key={item.label} value={item.value}>
                          {item.label}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <Input
                    placeholder="请输入位置..."
                    onChange={inputChange}
                    style={{ width: "103px" }}
                  />
                )}
              </Form.Item>
              <Checkbox onChange={handleChange}>手动输入</Checkbox>
              <Form.Item label="项目组" name="group">
                <select className={styles.select}>
                  {projectData.map((item) => {
                    return (
                      <option key={item.label} value={item.value}>
                        {item.label}
                      </option>
                    );
                  })}
                </select>
              </Form.Item>
              <Form.Item label="流程节点" name="procedure">
                <select className={styles.select}>
                  {procedureData.map((item) => {
                    return (
                      <option key={item.label} value={item.value}>
                        {item.label}
                      </option>
                    );
                  })}
                </select>
              </Form.Item>
              <Form.Item label="负责人" name="major">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="是否故障" name="isFault">
                <Radio.Group>
                  <Radio value="true">是</Radio>
                  <Radio value="false">否</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="故障描述" name="description">
                <TextArea placeholder="请输入描述..."></TextArea>
              </Form.Item>
              <Form.Item label="流程记录" name="record">
                <TextArea placeholder="流程记录..." rows={3}></TextArea>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};
