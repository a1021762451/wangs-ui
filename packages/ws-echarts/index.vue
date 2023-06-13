<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-04-23 16:45:34
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-06-09 09:20:40
-->
<template>
  <div style="width: 100%; height: 100%">
    <div
      v-show="!showEmpty"
      :id="echartsId"
      style="width: 100%; height: 100%"
    ></div>
    <el-empty v-show="showEmpty" v-bind="$attrs"></el-empty>
  </div>
</template>

<script>
import { getRandomId } from '../utils/util'
export default {
  name: 'ws-echarts',
  data() {
    return {
      echartsId: getRandomId(),
      myChart: {},
      showEmpty: true
    }
  },
  props: {
    options: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  watch: {
    options: {
      handler() {
        this.updateEcharts()
      }
      // immediate: true
    }
  },
  mounted() {
    this.init()
    this.myChart.on('click', (params) => {
      console.log('this.myChart.on', params);
      this.$emit('echartsClick', params)
    })
  },
  methods: {
    // 初始化
    init() {
      // myChart.hideLoading()
      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById(this.echartsId))
      window.addEventListener('resize', () => {
        this.myChart.resize()
      })
      this.updateEcharts()
    },
    // 更新echarts视图
    updateEcharts() {
      // 判断是否图表为空
      const { series } = this.options
      this.showEmpty = !Array.isArray(series) || !series.length
      this.myChart.setOption(this.options)
      this.$nextTick(() => {
        this.myChart.resize()
      })
    },
    chartLoading() {
      this.myChart.showLoading({
        text: '加载中...',
        color: '#808080',
        textColor: '#000',
        maskColor: 'rgba(255, 255, 255, 0.5)',
        zlevel: 0
      })
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-empty {
  padding: 0;
  justify-content: center;
  height: 100%;
}
</style>
