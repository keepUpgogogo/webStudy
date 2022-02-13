// createWebHistory为创建history模式的路由 createWebHashHistory创建hash模式的路由
import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import Recommand from '@/views/recommend'
import Search from '@/views/search'
import Singer from '@/views/singer'
import Toplist from '@/views/top-list'
const routes = [
  // 当访问根路径时，默认转到/recommend路径
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    component: Recommand
  },
  {
    path: '/search',
    component: Search
  },
  {
    path: '/singer',
    component: Singer
  },
  {
    path: '/top-list',
    component: Toplist
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router
