const assetList = [
  {
    assetName: "圆柱模板",
    assetId: "86.122.2 SX-XYGS-009-26-QL-010-SBGC-008-TL-002-ZL4",
    epc: "202212200046",
    imageCount: 4,
    desc: "模板名称	圆柱模板\n工业互联网标识码	86.122.2 SX-XYGS-009-26-QL-010-SBGC-008-TL-002-ZL3\n由国家工信部授权工业互联网标识解析二级节点（太原）签发\n规格型号	柱径φ1.4m\n详细参数:\n模板重量	1.5吨\n流转次数	2次\nA/B面	　\n设计图纸	　\n合格证 \n检验员	李霖\n仓储位置 	产业园模板仓库A 区001 位\n生产商： 	山西路桥模板科技有限公司",
  },
];

assetList.forEach((item) => {
  const images = [];
  const { imageCount, epc } = item;
  for (let i = 0; i < imageCount; i++) {
    const img = require(`./images/${epc} (${i + 1}).png`);
    images.push(img);
  }
  item["images"] = images;
});

export default assetList;
