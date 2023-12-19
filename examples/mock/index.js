/*
 * @Description:
 * @Author: wang shuai
 * @Date: 2023-11-22 14:25:16
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-11-22 15:58:50
 */
// 引用 Mock
const Mock = require('mockjs')
// 模拟延迟
Mock.setup({
  timeout: '200-500', // 设置延迟时间范围，单位是毫秒
})

// 获取表格数据
Mock.mock('/data/getTableData', 'post', {
  // 属性 list 的值是一个数组，随机生成 1 到 10 个元素
  'list|1-10': [
    {
      // 属性 id 是一个自增数，起始值为 1，每次增 1
      plantName: '四号机组',
      testInput: '3',
      testAdjust: '宽度宽度宽度宽度宽度宽度',
      testSelect: '',
      testMinDatetime: '',
      testMaxDatetime: '',
      testTime: '',
      testFormatter: '内容',
      id: '4',
      age: 48,
    },
  ],
  code: 0,
  message: 'ok',
})
// 获取表格数据
Mock.mock('/data/getSelectData', 'post', {
  // 属性 list 的值是一个数组，随机生成 1 到 10 个元素
  'list|10': [
    {
      label: '@cname',
      value: '@name',
    },
  ],
  code: 0,
  message: 'ok',
})