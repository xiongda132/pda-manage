import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import useAuth from "../../auth/useAuth";

export default () => {
  const history = useHistory();
  const auth = useAuth();
  const onClick = () => {
    history.go(-1);
  };
  useEffect(() => {
    const getData = async () => {
      const res = await axios.post(
        "http://47.94.5.22:6302/supoin/api/archive/inventory/getCheckList"
      );
      console.log(res);
      //   auth.download().setData(res.data.data);
      sessionStorage.setItem("downloadData", JSON.stringify(res.data.data));
    };
    getData();
    console.log(auth.download().returnData());
  }, []);
  return (
    <>
      这是下载页<button onClick={onClick}>回到之前页面</button>
    </>
  );
};
