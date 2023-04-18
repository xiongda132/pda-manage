import dayjs from "dayjs";
import { useRef } from "react";

const CInput = ({ value, onChange }) => {
  const inputRef = useRef(null);
  const onchange = () => {
    onChange(dayjs(inputRef.current.value));
  };
  return (
    <>
      <input
        ref={(r) => {
          inputRef.current = r;
        }}
        // defaultValue={dayjs().format("YYYY-MM-DD")}
        type="date"
        value={value?.format("YYYY-MM-DD")}
        onChange={onchange}
      />
    </>
  );
};

export default CInput;
