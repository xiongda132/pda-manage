let inventoryData = [];
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) {
    inventoryData.push({
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
    inventoryData.push({
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
const onePart = inventoryData
  .slice(0, 2)
  .map((item) => ({ ...item, checkId: "1" }));
const twoPart = inventoryData
  .slice(2, 4)
  .map((item) => ({ ...item, checkId: "2" }));
const threePart = inventoryData
  .slice(4)
  .map((item) => ({ ...item, checkId: "3" }));
inventoryData = [...onePart, ...twoPart, ...threePart];

export const Inventoryobj = {
  status: true,
  data: {
    checkList: inventoryData,
  },
};
