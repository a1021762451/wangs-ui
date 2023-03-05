<template>
  <div style="width: 100%; height: 100%">
    <div
      v-show="!showEmpty"
      :id="echartsId"
      style="width: 100%; height: 100%"
    ></div>
    <el-empty v-show="showEmpty" :image-size="100"></el-empty>
  </div>
</template>

<script>
import { otherOptions, seriesConfig, commonOptions } from './echartsContant'
import { deepClone, deepMerge, getRandomId } from '../utils/util'
export default {
  name: 'renderEcharts',
  data() {
    return {
      echartsId: getRandomId(),
      myChart: {},
      options: {},
      showEmpty: true
    }
  },
  props: {
    echartsData: {
      type: Object,
      default() {
        return {}
      }
    },
    echarsType: {
      type: String,
      default: ''
    }
  },
  watch: {
    echartsData: {
      handler() {
        this.updateEcharts()
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 初始化
    init() {
      console.log(this.$echarts, 'this.echarts');
      // 基于准备好的dom，初始化echarts实例
      const echarts = this.$echarts || require('echarts')
      this.myChart = echarts.init(document.getElementById(this.echartsId))
      window.addEventListener('resize', () => {
        this.myChart.resize()
      })
      // 通用配置
      this.options = deepClone(commonOptions)
      // 合并通用配置和特殊配置
      this.echarsType &&
        (this.options = deepMerge(
          this.options,
          deepClone(otherOptions[this.echarsType])
        ))
      this.updateEcharts()
    },
    // 更新echarts视图
    updateEcharts() {
      // 合并所有配置
      let options = deepMerge(this.options, this.echartsData)
      // 按series类型type取出series通用配置
      let { series = [] } = this.echartsData
      series = series.map((item) => {
        return {
          ...seriesConfig[item.type] || {},
          ...item
        }
      })
      // 判断是否图表为空
      this.showEmpty = !Array.isArray(series) || !series.length
      this.myChart.setOption({ ...options, series })
      this.$nextTick(() => {
        this.myChart.resize()
      })
    }
  }
}
</script>

<style lang="less" scoped></style>
