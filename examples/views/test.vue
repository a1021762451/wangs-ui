<template>
  <div class="process" ref="process" v-loading="processLoading">
    <div class="process_box">
      <div style="width: 100%; height: 100%">
        <div
          class="graph"
          style="margin: 0 auto; width: 100%; height: 100%"
          ref="graph"
        ></div>
      </div>
    </div>
    <div class="process__legend">
      <div class="legend" v-for="item in legend" :key="item.title">
        <span class="legend__desc" :style="item.style"></span>
        <span class="legend__title">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Graph } from '@antv/x6'
import data from './workflow'

const CELL_DEFAULT = 'default'
const CELL_DONE = 'done'
const CELL_DOING = 'doing'
const NEED_HANDLE_SHARP = ['custom-polygon', 'lane-rect']

export default {
  name: 'WorKflow',
  props: ['param', 'isTaskEnd'],
  data() {
    return {
      processLoading: false,
      graph: null,
      legend: [
        {
          title: '已完成',
          style: {
            color: '#16C123',
            background: '#f6ffed',
            border: '1px solid currentColor',
          },
        },
        {
          title: '进行中',
          style: {
            color: '#1c83f6',
            background: '#f0f7ff',
            border: '1px solid currentColor',
          },
        },
        {
          title: '未开始',
          style: {
            color: '#dddddd',
            background: '#efefef',
            border: '1px solid currentColor',
          },
        },
      ],
      cells: [],
      // 保存原始的label
      cellsOrginMap: new Map(),
    }
  },
  mounted() {
    // lane
    Graph.registerNode(
      'lane',
      {
        inherit: 'rect',
        markup: [
          {
            tagName: 'rect',
            selector: 'body',
          },
          {
            tagName: 'rect',
            selector: 'name-rect',
          },
          {
            tagName: 'text',
            selector: 'name-text',
          },
        ],
        attrs: {
          body: {
            fill: '#FFF',
            stroke: '#D9D9D9',
            strokeWidth: 1,
          },
          'name-rect': {
            // width: 280,
            refWidth: '100%',
            paddingLeft: 2,
            height: 30,
            fill: '#EDEDED',
            stroke: '#fff',
            strokeWidth: 1,
            x: -1,
          },
          'name-text': {
            ref: 'name-rect',
            refY: 0.5,
            refX: 0.5,
            textAnchor: 'middle',
            fontWeight: 'bold',
            fill: '#333',
            fontSize: 12,
          },
        },
      },
      true
    )

    //lane-rect
    Graph.registerNode(
      'lane-rect',
      {
        inherit: 'rect',
        width: 100,
        height: 60,
        attrs: {
          body: {
            stroke: '#dddddd',
            fill: '#4795a2',
          },
          text: {
            fontSize: 14,
            fill: '#fff',
          },
        },
      },
      true
    )
    // 边
    Graph.registerEdge(
      'lane-edge',
      {
        inherit: 'edge',
        attrs: {
          line: {
            targetMarker: 'block',
            stroke: '#5ab8f3',
            strokeWidth: 1,
          },
        },
        label: {
          attrs: {
            label: {
              fill: '#979797',
              fontSize: 12,
            },
          },
        },
      },
      true
    )
    Graph.registerNode(
      'custom-polygon',
      {
        inherit: 'polygon',
        width: 100,
        height: 50,
        attrs: {
          body: {
            stroke: '#dddddd',
            fill: '#4795a2',
            refPoints: '0,10 10,0 20,10 10,20',
          },
          text: {
            fontSize: 12,
            fill: '#fff',
          },
        },
      },
      true
    )

    const graph = new Graph({
      container: this.$refs.graph,
      autoResize: true,
      connecting: {
        router: 'orth',
      },
      interacting: {
        edgeMovable: false,
        nodeMovable: false,
      },
      translating: {
        restrict(cellView) {
          const cell = cellView.cell
          const parentId = cell.prop('parent')
          if (parentId) {
            const parentNode = graph.getCellById(parentId)
            if (parentNode) {
              return parentNode.getBBox().moveAndExpand({
                x: 0,
                y: 30,
                width: 0,
                height: -30,
              })
            }
          }
          return cell.getBBox()
        },
      },
    })
    this.graph = graph
    const cells = []
    data.forEach((item) => {
      if (item.shape === 'lane-edge') {
        cells.push(graph.createEdge(item))
      } else {
        cells.push(graph.createNode(item))
      }
    })
    // 保存原有数据
    this.cellsOrginMap = cells.reduce((pre, cur) => {
      if (NEED_HANDLE_SHARP.includes(cur.shape)) {
        const clone = cur.clone()
        clone.id = cur.id
        clone === cur.log
        pre.set(clone.id, clone)
      }
      return pre
    }, new Map())
    this.cells = cells
    this.graph.resetCells(cells)
    const resize = () => {
      console.count()
      this.$nextTick(() => {
        this.graph.zoomToFit({
          preserveAspectRatio: false,
          useCellGeometry: true,
          padding: {
            right: 20,
          },
        })
      })
    }
    const resizeObserver = new ResizeObserver((entries) => {
      setTimeout(resize, 100)
    })
    resizeObserver.observe(this.$refs.process)
    this.$once('hook:beforeDestroy', () => {
      resizeObserver.unobserve(this.$refs.process)
    })
  },
  methods: {
    getDefectFlowTime(data) {
      /*
        日志：
        finishedLog 已完成
        unFinishedLog：未完成
        缺陷：
        startDefect 启动缺陷
        defectConfirm 缺陷确认
        defectHandle 缺陷处理
        defectAcceptance 缺陷验收
        检修
        startRepair 启动检修
        startedRepair 已开工
        finishedRepair 已验收
        工作票
        createDefectTicket 缺陷生成工作票
        createRepairTicket 检修生成工作票
        startedTicket 已开工
        finishedTicket 已完工
       */
      this.processLoading = true
      getDefectFlowTime(data)
        .then((res) => {
          let data = res.data.data || []
          const handleData = (data) => {
            const createDefectTicket = data.find(
              (item) => item['createDefectTicket']
            )
            const createRepairTicket = data.find(
              (item) => item['createRepairTicket']
            )

            if (createDefectTicket || createRepairTicket) {
              const createDefectTicketIndex = data.findIndex(
                (item) => item['createDefectTicket']
              )
              const createRepairTicketIndex = data.findIndex(
                (item) => item['createRepairTicket']
              )
              const index =
                createDefectTicketIndex == -1
                  ? createRepairTicketIndex
                  : createDefectTicketIndex
              data[index] = {
                createTicket: createDefectTicket
                  ? createDefectTicket['createDefectTicket']
                  : createRepairTicket['createRepairTicket'],
              }
            }
            return data
          }
          data = handleData(data)
          this.graphFlowTime(data)
        })
        .finally(() => {
          this.$nextTick(() => {
            this.processLoading = false
          })
        })
    },
    getDefectFlowCount(data) {
      /*
        日志：
        finishedLog 已完成
        unFinishedLog：未完成
        缺陷：
        startDefect 启动缺陷
        defectConfirm 缺陷确认
        defectHandle 缺陷处理
        defectAcceptance 缺陷验收
        检修
        startRepair 启动检修
        startedRepair 已开工
        finishedRepair 已验收
        工作票
        createTicket 生成工作票
        startedTicket 已开工
        finishedTicket 已完工
       */
      this.processLoading = true
      getDefectFlowCount(data)
        .then((res) => {
          const data = res.data.data || {}
          this.graphFlowCount(data)
        })
        .finally(() => {
          this.$nextTick(() => {
            this.processLoading = false
          })
        })
    },
    graphFlowCount(data = {}) {
      this.cells = this.cells.map((cell) => {
        if (NEED_HANDLE_SHARP.includes(cell.shape)) {
          const orginCell = this.cellsOrginMap.get(cell.id)
          const orginLabel = orginCell.label
          const counter = data[cell.id]
          // debugger
          if (counter || counter == 0) {
            cell.label = `${orginLabel}(${counter})`
            // debugger
            this.changeCellStatus(cell)
            this.resizeCell(cell)
            return cell
          } else {
            // 其他单元恢复原有label
            cell.label = orginLabel
            this.changeCellStatus(cell)
            this.resizeCell(cell)
            return cell
          }
        } else {
          return cell
        }
      })
      this.graph.resetCells(this.cells)
    },
    changeCellStatus(cell, status = 'default') {
      const statusStyle = {
        done: {
          stroke: '#16C123',
        },
        default: {
          stroke: '#dddddd',
        },
        doing: {
          stroke: '#1c83f6',
        },
      }
      const { stroke } = statusStyle[status]
      cell.addTools([
        {
          name: 'boundary',
          args: {
            padding: 3,
            attrs: {
              stroke,
              'stroke-width': 2,
            },
          },
        },
      ])
      // const statusStyle = {
      //   done: {
      //     fill: "#f6ffed",
      //     stroke: "#16C123",
      //   },
      //   default: {
      //     fill: "#efefef",
      //     stroke: "#dddddd",
      //     textFill: "#262626",
      //   },
      //   doing: {
      //     fill: "#f0f7ff",
      //     stroke: "#1c83f6",
      //   },
      // };
      // const { fill, stroke, textFill } = statusStyle[status];
      // cell.setAttrs({
      //   body: { stroke, fill },
      //   text: { fill: textFill || stroke },
      // });
    },
    resizeCell(cell, width = 133, height = 30) {
      // const directionMap = {
      //   defectAcceptance: "left",
      //   ywg: "left",
      //   finishedTicket: "left",
      //   startedTicket: "left",
      // };
      // cell.resize(width, height, {
      //   direction: directionMap[cell.id] || "right",
      // });
    },
    graphFlowTime(data = {}) {
      const lastestCell = data[data.length - 1]
      this.cells = this.cells.map((cell) => {
        if (NEED_HANDLE_SHARP.includes(cell.shape)) {
          const orginCell = this.cellsOrginMap.get(cell.id)
          const orginLabel = orginCell.label
          const findData = data.find((item) => item[cell.id])
          if (!findData) {
            cell.label = orginLabel
            this.resizeCell(cell)
            this.changeCellStatus(cell)
            return cell
          }
          let timerDesc = findData[cell.id]

          if (timerDesc) {
            cell.label = (orginLabel || cell.label) + `\n${timerDesc}`
            if (lastestCell[cell.id] && !this.isTaskEnd) {
              this.changeCellStatus(cell, CELL_DOING)
            } else if (findData[cell.id]) {
              this.changeCellStatus(cell, CELL_DONE)
            } else {
              this.changeCellStatus(cell)
            }
            this.resizeCell(cell, 133)
            return cell
          } else {
            cell.label = orginLabel
            this.changeCellStatus(cell)
            this.resizeCell(cell)
            // 其他单元恢复原有label
            return cell
          }
        } else {
          return cell
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.process {
  position: relative;
  background-color: #ffffff;
  box-shadow: 1px 1px 5px #f4f5f9;
  padding: 0 10px;
  // margin: 0 10px;
  width: 100%;
}
.process_box {
  width: 100%;
  display: flex;
  height: 300px;
  // height: 800px;
}
.process__legend {
  position: absolute;
  bottom: 25px;
  left: 40px;
  z-index: 2;
}
.legend {
  &__title {
    font-size: 14px;
    font-weight: 400;
    color: #999999;
    margin-left: 5px;
  }
  &__desc {
    display: inline-block;
    width: 18px;
    height: 10px;
  }
}
</style>
