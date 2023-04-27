<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-04-20 12:15:36
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-04-25 14:55:11
-->
<template>
  <div class="ring">
    <div
      v-for="i in circleCount"
      :key="i"
      class="circle"
      :style="getCircleStyle(i)"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'test',
  data() {
    return {
      circleCount: 4, // 小圆数量
      circleRadius: 50, // 小圆半径
      ringRadius: 250, // 圆环半径
      centerX: 300, // 圆心X坐标
      centerY: 300, // 圆心Y坐标
    }
  },
  created() {
    const leftIp = {
      sourceStartIp: '13.17.10.9',
      sourceEndIp: '13.17.10.11',
      targetStartIp: '13.103.0.2',
      targetEndIp: '13.103.0.2',
    }
    const rightIp = {
      sourceStartIp: '13.17.10.9',
      sourceEndIp: '13.17.10.10',
      targetStartIp: '13.103.0.1',
      targetEndIp: '13.103.0.2',
    }
    this.compareIp(leftIp, rightIp)
  },
  methods: {
    circleClick(index) {
      console.log(index)
    },
    getCircleStyle(i) {
      let angle = (i / this.circleCount) * 2 * Math.PI - Math.PI / 2
      let x =
        this.centerX + Math.cos(angle) * this.ringRadius - this.circleRadius
      let y =
        this.centerY + Math.sin(angle) * this.ringRadius - this.circleRadius
      return {
        left: `${x}px`,
        top: `${y}px`,
      }
    },
    // 比较ip
    compareIp(leftIp = {}, rightIp = {}) {
      let leftCompareIp = []
      let rightCompareIp = []
      let leftList = this.getCompareIpList(leftIp)
      let rightList = this.getCompareIpList(rightIp)
      leftList.forEach((item) => {
        leftCompareIp.push(item)
        rightCompareIp.push(rightList.includes(item) ? item : '')
      })
      rightList.forEach((item, index) => {
        if (!leftCompareIp.includes(item)) {
          leftCompareIp.splice(index, 0, '')
          rightCompareIp.splice(index, 0, item)
        }
      })
      leftCompareIp = leftCompareIp.map((item, index) => {
        return item.split('-')
      })
      rightCompareIp = rightCompareIp.map((item, index) => {
        return item.split('-').reverse()
      })
      // console.log(leftList, rightList, 'leftList, rightList')
      console.log(leftCompareIp, rightCompareIp, 'leftCompareIp')
    },
    // 获取ip列表
    getCompareIpList(ip) {
      const list = []
      const { sourceStartIp, sourceEndIp, targetStartIp, targetEndIp } = ip
      const sourceStartIpArr = sourceStartIp.split('.').map(Number)
      const sourceEndIpArr = sourceEndIp.split('.').map(Number)
      const targetStartIpArr = targetStartIp.split('.').map(Number)
      const targetEndIpArr = targetEndIp.split('.').map(Number)
      for (let i = 0; i <= sourceStartIpArr.length - 1; i++) {}
      for (let i = sourceStartIpArr[3]; i <= sourceEndIpArr[3]; i++) {
        for (let j = targetStartIpArr[3]; j <= targetEndIpArr[3]; j++) {
          list.push(
            `${sourceStartIpArr[0]}.${sourceStartIpArr[1]}.${sourceStartIpArr[2]}.${i}-${targetStartIpArr[0]}.${targetStartIpArr[1]}.${targetStartIpArr[2]}.${j}`
          )
        }
      }
      return list
    },
    // getCompareIpList(ip) {
    //   const parseIp = (ip) => {
    //     return ip.split('.').map(Number)
    //   }

    //   const result = []

    //   const sourceStartIp = parseIp(ip.sourceStartIp)
    //   const sourceEndIp = parseIp(ip.sourceEndIp)
    //   const targetStartIp = parseIp(ip.targetStartIp)
    //   const targetEndIp = parseIp(ip.targetEndIp)

    //   const compareIp = (ip1, ip2, depth = 0) => {
    //     if (depth === ip1.length) {
    //       return 0
    //     } else if (ip1[depth] < ip2[depth]) {
    //       return -1
    //     } else if (ip1[depth] > ip2[depth]) {
    //       return 1
    //     } else {
    //       return compareIp(ip1, ip2, depth + 1)
    //     }
    //   }

    //   const traverseIp = (startIp, endIp, callback, depth = 0, ip = []) => {
    //     if (depth === startIp.length) {
    //       callback(ip)
    //     } else if (startIp[depth] === endIp[depth]) {
    //       ip.push(startIp[depth])
    //       traverseIp(startIp, endIp, callback, depth + 1, ip)
    //       ip.pop()
    //     } else {
    //       for (let i = startIp[depth]; i <= endIp[depth]; i++) {
    //         ip.push(i)
    //         traverseIp(startIp, endIp, callback, depth + 1, ip)
    //         ip.pop()
    //       }
    //     }
    //   }

    //   traverseIp(sourceStartIp, sourceEndIp, (sourceIp) => {
    //     traverseIp(targetStartIp, targetEndIp, (targetIp) => {
    //       if (compareIp(sourceIp, targetIp) === -1) {
    //         result.push(`${ipToString(sourceIp)}-${ipToString(targetIp)}`)
    //       }
    //     })
    //   })

    //   const ipToString = (ip) => {
    //     return ip.join('.')
    //   }

    //   console.log(result)
    // },
  },
}
</script>

<style scoped lang="less">
.ring {
  position: relative;
  width: 600px;
  height: 600px;
  border: 1px solid black;
  border-radius: 50%;
}

.circle {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: red;
}
</style>
