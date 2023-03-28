import styles from "./index.module.css";
import LoginFormContent from "./components/LoginFormContent";

function Login() {
  return (
    <div className={styles.container}>
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