<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-05 17:52:05
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-06-14 14:14:11
-->
<template>
  <div style="height: 90vh; width: 90vw">
    <ws-echarts :options="options" :imageSize="40"></ws-echarts>
  </div>
</template>

<script>
export default {
  name: 'ws-echarts-test',
  data() {
    return {
      options: {
        series: [
          {
            name: 'Pressure',
            type: 'gauge',
            radius: '70%',
            startAngle: 200,
            endAngle: -20,
            center: ['50%', '60%'],
            itemStyle: {
              color: '#FFAB91',
            },
            pointer: {
              show: false,
            },
            progress: {
              show: true,
              width: 10,
            },
            detail: {
              formatter: '{value} %',
              fontSize: 13,
              offsetCenter: [0, '-10%'],
            },
            axisTick: {
              distance: -13,
              splitNumber: 5,
              length: 4,
              lineStyle: {
                color: '#999',
              },
            },
            splitLine: {
              distance: -16,
              length: 6,
              lineStyle: {
                color: '#999',
                width: 2,
              },
            },
            axisLabel: {
              distance: -4,
              color: '#999',
              fontSize: 8,
            },
            title: {
              offsetCenter: [0, '70%'],
              fontSize: 12,
              fontWeight: 'bold',
            },
            data: [
              {
                value: 50,
                name: '资产接入率',
              },
            ],
          },
        ],
      },
    }
  },
}
</script>

<style lang="less" scoped></style>
