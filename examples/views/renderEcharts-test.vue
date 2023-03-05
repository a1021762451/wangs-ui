<template>
  <div style="height: 300px; width: 600px">
    <renderEcharts :echartsData="echartsData"></renderEcharts>
  </div>
</template>

<script>
export default {
  name: 'renderEcharts-test',
  data() {
    return {
      echartsData: {
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [120, 200, 150, 80, 70, 110, 130],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)'
            }
          }
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
