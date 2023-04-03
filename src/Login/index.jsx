import styles from "./index.module.css";
import LoginFormContent from "./components/LoginFormContent";
import { SetOutline } from "antd-mobile-icons";
import { Modal, Input } from "antd-mobile";
import { useRef } from "react";
import { InputNumber } from "antd";

function Login() {
  const serverPort = useRef(null);
  const readPower = useRef(null);
  const handleChange = (value) => {
    serverPort.current = value;
  };
  const getServerPort = () => {
    if (localStorage.getItem("serverPort")) {
      return localStorage.getItem("serverPort");
    } else {
      return "未设置";
    }
  };

  const getReadPower = () => {
    if (localStorage.getItem("readPower")) {
      return localStorage.getItem("readPower");
    } else {
      return "10";
    }
  };

  const handlePower = (value) => {
    console.log(value);
    readPower.current = value;
  };

  const handleClick = () => {
    Modal.confirm({
      title: "设置服务及端口",
      content: (
        <div>
          当前地址: {getServerPort()}
          <Input onChange={handleChange} placeholder="请输入地址..." />
          <br />
          当前RFID读取功率: {getReadPower()} (范围: 5 ~ 33)
          <div>
            <Input onChange={handlePower} placeholder="请输入功率..." />
          </div>
        </div>
      ),
      onConfirm: async () => {
        if (serverPort.current) {
          localStorage.setItem("serverPort", serverPort.current);
        }
        if (readPower.current) {
          const max = 33;
          const min = 5;
          if (readPower.current > 33) {
            return localStorage.setItem("readPower", max);
          } else if (readPower.current < 5) {
            return localStorage.setItem("readPower", min);
          }
          localStorage.setItem("readPower", readPower.current);
        }
      },
    });
  };

  return (
    <div className={styles.container}>
      <SetOutline
        style={{ position: "absolute", top: "5px", right: "5px" }}
        onClick={handleClick}
      />
      <div className={styles.centerForm}>
        <div className={styles.CenterTitle}>
          {/* <div className={styles.logo}></div> */}
          <div className={styles.title}>{"整机及工装管理系统"}</div>
        </div>
        <LoginFormContent />
      </div>
    </div>
  );
}

export default Login;
