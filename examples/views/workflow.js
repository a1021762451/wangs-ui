export default  [
  {
    "id": "1",
    "shape": "lane",
    "width": 280,
    "height": 300,
    "position": {
      "x": 0,
      "y": 0
    },
    "label": "日志"
  },
  {
    "id": "2",
    "shape": "lane",
    "width": 280,
    "height": 300,
    "position": {
      "x": 280,
      "y": 0
    },
    "label": "缺陷/消缺任务"
  },
  {
    "id": "2add",
    "shape": "lane",
    "width": 280,
    "height": 300,
    "position": {
      "x": 560,
      "y": 0
    },
    "label": ""
  },
  {
    "id": "3",
    "shape": "lane",
    "width": 280,
    "height": 300,
    "position": {
      "x": 840,
      "y": 0
    },
    "label": "检修"
  },
  {
    "id": "4",
    "shape": "lane",
    "width": 280,
    "height": 300,
    "position": {
      "x": 1120,
      "y": 0
    },
    "label": "工作票"
  },
  {
    "id": "4add",
    "shape": "lane",
    "width": 280,
    "height": 300,
    "position": {
      "x": 1400,
      "y": 0
    },
    "label": "缺陷"
  },
  // {
  //   "id": "creatLog",
  //   "shape": "custom-polygon",
  //   "width": 150,
  //   "height": 80,
  //   "position": {
  //     "x": 10,
  //     "y": 120
  //   },
  //   "attrs": {
  //     "body": {
  //       "refPoints": "0,10 10,0 20,10 10,20"
  //       }
  //   },
  //   "label": "新建日志",
  //   "parent": "1"
  // },
  {
    "id": "unFinishedLog",
    "shape": "custom-polygon",
    "width": 150,
    "height": 70,
    "position": {
      "x": 75,
      "y": 50
    },
    // "attrs": {
    //   "body": {
    //     "refPoints": "0,10 10,0 20,10 10,20"
    //     }
    // },
    "label": "未完成",
    "parent": "1"
  },
  // {
  //   "id": "finishedLog",
  //   "shape": "lane-rect",
  //   "width": 133,
  //   "height": 30,
  //   "position": {
  //     "x": 140,
  //     "y": 230
  //   },
  //   "label": "已完成",
  //   "parent": "1"
  // },
  {
    "id": "startDefect",
    "shape": "lane-rect",
    "width": 133,
    "height": 50,
    "position": {
      "x": 355,
      "y": 60
    },
    "label": "启动缺陷",
    "parent": "2"
  },
  {
    "id": "defectHandle",
    "shape": "lane-rect",
    "width": 133,
    "height": 50,
    "position": {
      "x": 355,
      "y": 160
    },
    "label": "缺陷处理",
    "parent": "2"
  },
  {
    "id": "dbd",
    "shape": "lane-rect",
    "width": 133,
    "height": 50,
    "position": {
      "x": 635,
      "y": 160
    },
    "label": "督办单",
    "parent": "2add"
  },
  {
    "id": "startRepair",
    "shape": "lane-rect",
    "width": 133,
    "height": 50,
    "position": {
      "x": 915,
      "y": 60
    },
    "label": "完工",
    "parent": "3"
  },
  {
    "id": "startedRepair",
    "shape": "lane-rect",
    "width": 133,
    "height": 50,
    "position": {
      "x": 915,
      "y": 160
    },
    "label": "开工",
    "parent": "3"
  },
  {
    "id": "startedRepair4",
    "shape": "lane-rect",
    "width": 133,
    "height": 50,
    "position": {
      "x": 1195,
      "y": 60
    },
    "label": "开工",
    "parent": "4"
  },
  {
    "id": "startRepair4",
    "shape": "lane-rect",
    "width": 133,
    "height": 50,
    "position": {
      "x": 1195,
      "y": 160
    },
    "label": "完工",
    "parent": "4"
  },
  // {
  //   "id": "finishedRepair",
  //   "shape": "lane-rect",
  //   "width": 133,
  //   "height": 30,
  //   "position": {
  //     "x": 880,
  //     "y": 50
  //   },
  //   "label": "已验收",
  //   "parent": "3"
  // },
  {
    "id": "createTicket",
    "shape": "lane-rect",
    "width": 133,
    "height": 50,
    "position": {
      "x": 1475,
      "y": 60
    },
    "label": "值班台归档",
    "parent": "4add"
  },
  {
    "id": "startedTicket",
    "shape": "lane-rect",
    "width": 133,
    "height": 50,
    "position": {
      "x": 1475,
      "y": 160
    },
    "label": "专责确认",
    "parent": "4add"
  },
  {
    "id": "116",
    "shape": "lane-edge",
    "source": "unFinishedLog",
    "target": "startDefect"
  },
  {
    "id": "117",
    "shape": "lane-edge",
    "source": "startDefect",
    "target": "defectHandle"
  },
  {
    "id": "118",
    "shape": "lane-edge",
    "source": "defectHandle",
    "target": "startedTicket",
    vertices: [
      // { x: 355, y:240 }, 
      { x: 1475, y:260 },
    ],
  },
  {
    "id": "119",
    "shape": "lane-edge",
    "source": "defectHandle",
    "target": "startedRepair",
    vertices: [
      // { x: 355, y:240 }, 
      { x: 915, y:240 },
    ],
  },
  {
    "id": "121",
    "shape": "lane-edge",
    "source": "defectHandle",
    "target": "dbd"
  },
  {
    "id": "121add",
    "shape": "lane-edge",
    "source": "dbd",
    "target": "startedRepair"
  },
  {
    "id": "326",
    "shape": "lane-edge",
    "source": "startedRepair",
    "target": "startRepair"
  },
  {
    "id": "327",
    "shape": "lane-edge",
    "source": "startRepair4",
    "target": "startedTicket"
  },
  {
    "id": "328",
    "shape": "lane-edge",
    "source": "startedTicket",
    "target": "createTicket"
  },
  {
    "id": "329",
    "shape": "lane-edge",
    "source": "startRepair",
    "target": "startedRepair4"
  },
  {
    "id": "333",
    "shape": "lane-edge",
    "source": "startedRepair4",
    "target": "startRepair4"
  },
]