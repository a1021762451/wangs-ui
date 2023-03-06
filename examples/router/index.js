import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "about" */ '../views/index.vue')
  },
  {
    path: '/ws-buttons',
    name: 'ws-buttons',
    component: () => import(/* webpackChunkName: "about" */ '../views/ws-buttons-test.vue')
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
