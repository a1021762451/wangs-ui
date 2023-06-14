<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-04-23 16:45:34
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-06-14 14:16:52
-->
<template>
  <div style="width: 100%; height: 100%">
    <div
      v-show="!showEmpty"
      style="width: 100%; height: 100%"
      :id="echartsId"
    ></div>
    <el-empty
      v-if="showEmpty"
      style="width: 100%; height: 100%"
      v-bind="$attrs"
    ></el-empty>
  </div>
</template>

<script>
import { getRandomId } from '../utils/util'
export default {
  name: 'ws-echarts',
  data() {
    return {
      myChart: {},
      showEmpty: false,
    }
  },
  props: {
    options: {
      type: Object,
      default() {
        return {}
      },
    },
    echartsId: {
      type: String,
      default: getRandomId(),
    },
  },
  watch: {
    options: {
      handler() {
        this.updateEcharts()
      },
    },
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeEcharts)
  },
  methods: {
    // echarts示例自适应
    resizeEcharts() {
      this.myChart.resize()
    },
    // 初始化
    init() {
      // myChart.hideLoading()
      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById(this.echartsId))
      this.updateEcharts()
      window.addEventListener('resize', this.resizeEcharts)
      this.myChart.on('click', (params) => {
        console.log('this.myChart.on', params)
        this.$emit('echartsClick', params)
      })
    },
    // 更新echarts视图
    updateEcharts() {
      // 判断是否图表为空
      const { series } = this.options
      this.showEmpty = this.judgeEmpty(series)
      this.myChart.setOption(this.options)
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
    chartLoading() {
      this.myChart.showLoading({
        text: '加载中...',
        color: '#808080',
        textColor: '#000',
        maskColor: 'rgba(255, 255, 255, 0.5)',
        zlevel: 0,
      })
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .el-empty {
  padding: 0;
  justify-content: center;
  height: 100%;
}
</style>
