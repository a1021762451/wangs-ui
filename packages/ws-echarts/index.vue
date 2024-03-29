<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-04-23 16:45:34
 * @LastEditors: wang shuai
 * @LastEditTime: 2024-02-29 14:23:42
-->
<template>
  <div class="ws-echarts" v-resize="resizeEcharts">
    <div class="echarts-container" v-show="!emptyCondition" :id="chartId"></div>
    <el-empty
      class="echarts-empty"
      v-if="emptyCondition"
      v-bind="$attrs"
    ></el-empty>
  </div>
</template>

<script>
import { getRandomId, vResize } from '../utils/util'
export default {
  name: 'ws-echarts',
  data() {
    return {
      myChart: {},
      showEmpty: false,
    }
  },
  props: {
    // 图表配置
    options: {
      type: Object,
      default() {
        return {}
      },
    },
    // 图表id， 随机
    echartsId: {
      type: String,
      default: '',
    },
    // 是否允许显示空组件
    isShowEmpty: {
      type: Boolean,
      default: true,
    },
    // 图表监听事件
    eventsList: {
      type: Array,
      default: () => [],
    },
    // 图表触发的事件
    actionsList: {
      type: Array,
      default: () => [],
    },
    // setOption的第二个参数,为真配置不合并
    notMerge: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    options: {
      handler() {
        this.updateEcharts()
      },
    },
  },
  computed: {
    chartId() {
      return this.echartsId || getRandomId()
    },
    emptyCondition() {
      return this.isShowEmpty && this.showEmpty
    },
  },
  directives: {
    resize: vResize,
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    // window.removeEventListener('resize', this.resizeEcharts)
  },
  methods: {
    // 初始化
    init() {
      // myChart.hideLoading()
      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById(this.chartId))
      // 用于获取echarts实例
      this.$emit('init', this.myChart)
      this.updateEcharts()
      // 监听窗口变化，自适应图表
      // window.addEventListener('resize', this.resizeEcharts)
      // 监听点击事件
      this.myChart.on('click', (params) => {
        this.$emit('click', params)
      })
      // 监听的事件
      this.eventsList.forEach((item) => {
        const { type, handler } = item
        this.myChart.on(type, handler)
      })
      // 默认触发的事件
      this.actionsList.forEach((action) => {
        this.myChart.dispatchAction(action)
      })
    },
    // echarts示例自适应
    resizeEcharts(size = {}) {
      if (!this.myChart) return
      this.myChart.resize()
    },
    // 更新echarts视图
    updateEcharts() {
      // 判断是否图表为空
      this.showEmpty = this.judgeEmpty()
      this.myChart.setOption(this.options, this.notMerge)
      this.$nextTick(this.resizeEcharts)
    },
    // 判断图表是否为空
    judgeEmpty() {
      const { dataset, series } = this.options
      if (dataset && dataset.source && dataset.source.length > 0) {
        return false
      }
      if (
        series &&
        series.length > 0 &&
        series.some((item) => {
          return item.data && item.data.length
        })
      ) {
        return false
      }
      return true
    },
    // chartLoading() {
    //   this.myChart.showLoading({
    //     text: '加载中...',
    //     color: '#808080',
    //     textColor: '#000',
    //     maskColor: 'rgba(255, 255, 255, 0.5)',
    //     zlevel: 0,
    //   })
    // },
  },
}
</script>

<style lang="less" scoped>
.el-empty {
  padding: 0;
  justify-content: center;
}
.ws-echarts,
.echarts-container,
.echarts-empty {
  width: 100%;
  height: 100%;
}
</style>
