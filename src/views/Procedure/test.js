export const accountObj = {
  status: true,
  data: {
    zjtzData: [
      {
        gdhId: `XB001S`,
        facilityCode: `202210130001`,
        nbName: `内部名称1`,
        ReqName: `需求名称1`,
        nodeSecurity: `密级1`,
        currentPlace: `位置1`,
        epcData: `12345678`,
        cardAmount: `1`,
        nodeAmount: `1`,
      },
      {
        gdhId: `XB001S`,
        facilityCode: `202210130002`,
        nbName: `内部名称2`,
        ReqName: `需求名称2`,
        nodeSecurity: `密级2`,
        currentPlace: `位置2`,
        cardAmount: `2`,
        nodeAmount: `2`,
      },
      {
        gdhId: `XB002S`,
        facilityCode: `202210130003`,
        nbName: `内部名称3`,
        ReqName: `需求名称4`,
        nodeSecurity: `密级3`,
        currentPlace: `位置3`,
        cardAmount: `3`,
        nodeAmount: `3`,
      },
      {
        gdhId: `XB002S`,
        facilityCode: `202210130004`,
        nbName: `内部名称4`,
        ReqName: `需求名称4`,
        nodeSecurity: `密级4`,
        currentPlace: `位置4`,
        cardAmount: `4`,
        nodeAmount: `4`,
        epcData: `87654321`,
      },
    ],
  },
};

export const memberObj = {
  status: true,
  data: {
    memberList: [
      {
        memberCode: "qwer",
        memberLogin: "rest",
        // memberLogin: "admin",
        memberName: "管理员",
        deptName: "总经办",
        deptCode: "1234",
      },
    ],
  },
};

export const locationObj = {
  status: true,
  data: {
    locationList: [
      {
        field0001: "位置1",
      },
      {
        field0001: "位置2",
      },
      {
        field0001: "位置3",
      },
      {
        field0001: "位置4",
      },
      {
        field0001: "位置5",
      },
    ],
  },
};

export const nodeObj = {
  status: true,
  data: {
    flowNodeForm: [
      {
        nbName: "内部名称1",
        nodeSort: "节点序号1",
        reNodeNumber: "细化节点序号1",
        lcProperty: "流程属性1",
        flowNodeName: "节点1",
        nodeSecurity: "男1",
        fourCode: "1",
        flowName: "流程名称1",
        detailNodeName: "细化流程节点1",
      },
      {
        nbName: "内部名称2",
        nodeSort: "节点序号2",
        reNodeNumber: "细化节点序号2",
        lcProperty: "流程属性2",
        flowNodeName: "节点2",
        nodeSecurity: "男2",
        fourCode: "2",
        flowName: "流程名称2",
        detailNodeName: "细化流程节点2",
      },
      {
        nbName: "内部名称3",
        nodeSort: "节点序号3",
        reNodeNumber: "细化节点序号3",
        lcProperty: "流程属性3",
        flowNodeName: "节点3",
        nodeSecurity: "男3",
        fourCode: "3",
        flowName: "流程名称2",
        detailNodeName: "细化流程节点2",
      },
    ],
  },
};
