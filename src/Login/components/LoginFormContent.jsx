import { memo } from "react";
import { Form, Input, Button } from "antd-mobile";
import styles from "./index.module.css";
import { useHistory, useLocation } from "react-router-dom";
import useAuth from "../../auth/useAuth";
const { Item } = Form;

const LoginFormContent = () => {
  let history = useHistory();
  let location = useLocation();
  let auth = useAuth();

  const onFinish = (values) => {
    console.log(values);
    let { from } = location.state || { from: { pathname: "/" } };
    auth.login(values, () => {
      history.replace(from);
    });
  };

  return (
    <div className={styles.container}>
      <Form
        initialValues={{
          userId: "rest",
          pwd: "4420c0f0-7789-464a-9269-ab075b8164b3",
        }}
        onFinish={onFinish}
        layout="horizontal"
        style={{ "--prefix-width": "3.5em" }}
      >
        <Item label="账号" name="userId">
          <Input placeholder="请输入账号"></Input>
        </Item>
        <Item label="密码" name="pwd">
          <Input placeholder="请输入密码" type="password"></Input>
        </Item>
        <Item>
          <Button className={styles.loginBtn} color="primary" type="submit">
            登录
          </Button>
        </Item>
      </Form>
    </div>
  );
};

export default memo(LoginFormContent);
