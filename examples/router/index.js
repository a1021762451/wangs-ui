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
    path: '/renderButtons',
    name: 'renderButtons',
    component: () => import(/* webpackChunkName: "about" */ '../views/renderButtons-test.vue')
  },
  {
    path: '/renderForm',
    name: 'renderForm',
    component: () => import(/* webpackChunkName: "about" */ '../views/renderForm-test.vue')
  },
  {
    path: '/renderTable',
    name: 'renderTable',
    component: () => import(/* webpackChunkName: "about" */ '../views/renderTable-test.vue')
  },
  {
    path: '/renderTree',
    name: 'renderTree',
    component: () => import(/* webpackChunkName: "about" */ '../views/renderTree-test.vue')
  },
  {
    path: '/renderEcharts',
    name: 'renderEcharts',
    component: () => import(/* webpackChunkName: "about" */ '../views/renderEcharts-test.vue')
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
