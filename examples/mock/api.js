/*
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-11-22 14:42:44
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-11-22 15:47:26
 */
import request from '../request'
export function getTableData (data) {
  return request({
      url: '/data/getTableData',
      method: 'post',
      data
  })
}
export function getSelectData (data) {
  return request({
      url: '/data/getSelectData',
      method: 'post',
      data
  })
}