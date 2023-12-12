/*
 * @Author: wanns 1021762451@qq.com
 * @Date: 2023-03-15 19:36:28
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-12-04 11:15:29
 * @FilePath: \ws-ui\examples\router\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/ws-table'
  },
  {
    path: '/ws-form',
    name: 'ws-form',
    component: () => import(/* webpackChunkName: "about" */ '../views/ws-form-test.vue')
  },
  {
    path: '/ws-table',
    name: 'ws-table',
    component: () => import(/* webpackChunkName: "about" */ '../views/ws-table-test.vue')
  },
  {
    path: '/ws-tree',
    name: 'ws-tree',
    component: () => import(/* webpackChunkName: "about" */ '../views/ws-tree-test.vue')
  },
  {
    path: '/ws-echarts',
    name: 'ws-echarts',
    component: () => import(/* webpackChunkName: "about" */ '../views/ws-echarts-test.vue')
  },
  {
    path: '/ws-checkbox',
    name: 'ws-checkbox',
    component: () => import(/* webpackChunkName: "about" */ '../views/ws-checkbox-test.vue')
  },
  {
    path: '/ws-tooltip',
    name: 'ws-tooltip',
    component: () => import(/* webpackChunkName: "about" */ '../views/ws-tooltip-test.vue')
  },
  {
    path: '/ws-select',
    name: 'ws-select',
    component: () => import(/* webpackChunkName: "about" */ '../views/ws-select-test.vue')
  },
  {
    path: '/ws-fold',
    name: 'ws-fold',
    component: () => import(/* webpackChunkName: "about" */ '../views/ws-fold-test.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import(/* webpackChunkName: "about" */ '../views/test.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
