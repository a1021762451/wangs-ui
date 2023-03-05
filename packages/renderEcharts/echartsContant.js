import { generateColor } from '../utils/util'

// 通用配置
export const commonOptions = {
  title: {
    left: 'center',
    textStyle: {
      fontSize: 12
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    }
  },
  legend: {
    orient: 'horizontal',
    type: 'scroll'
  }
  // color: Array.from(new Array(30)).map((item) => generateColor()),
}

// 基础通用配置，依据不同类型，增加的通用配置 --- 使用这个配置最好series的type是一中类型
export const otherOptions = {
  pie: {
    legend: {
      orient: 'vertical',
      right: 0,
      top: '10%'
    }
  },
  bar3D: {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      show: false
    },
    xAxis3D: {
      type: 'category',
      axisLabel: {
        interval: 0
      },
      nameGap: 35
    },
    yAxis3D: {
      type: 'category',
      nameGap: 75
    },
    zAxis3D: {
      type: 'value',
      nameGap: 45
    },
    grid3D: {
      boxWidth: 350,
      viewControl: {
        beta: 5,
        projection: 'perspective', // 先设置为这个perspective
        distance: 250 //默认缩放比例
      },
      light: {
        main: {
          intensity: 1.2,
          shadow: true
        },
        ambient: {
          intensity: 0.3
        }
      }
    }
  }
}

// series通用配置
export const seriesConfig = {
  pie: {
    type: 'pie',
    radius: '45%',
    center: ['25%', '50%'],
    showEmptyCircle: false,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  },
  bar3D: {
    type: 'bar3D',
    shading: 'realistic',
    label: {
      fontSize: 16,
      borderWidth: 1
    },
    emphasis: {
      label: {
        fontSize: 20,
        color: '#900'
      },
      itemStyle: {
        color: '#900'
      }
    }
  }
}

// 多种颜色
export const colorsMap = Array.from(new Array(30)).map((item) =>
  generateColor()
)
