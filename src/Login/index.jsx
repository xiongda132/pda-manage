import styles from "./index.module.css";
import LoginFormContent from "./components/LoginFormContent";
import { SetOutline } from "antd-mobile-icons";
import { Modal, Input } from "antd-mobile";
import { useRef } from "react";

function Login() {
  const serverPort = useRef(null);
  const handleChange = (value) => {
    serverPort.current = value;
  };
  const handleClick = () => {
    Modal.confirm({
      title: "设置服务及端口",
      content: (
        <div>
          <Input onChange={handleChange} placeholder="请输入..." />
        </div>
      ),
      onConfirm: async () => {
        if (serverPort.current) {
          sessionStorage.setItem("serverPort", serverPort.current);
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
