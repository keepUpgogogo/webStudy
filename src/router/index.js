// createWebHistory为创建history模式的路由 createWebHashHistory创建hash模式的路由
import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import Recommand from '@/views/recommend'
import Search from '@/views/search'
import Singer from '@/views/singer'
import Toplist from '@/views/top-list'
import singerDetail from "@/views/singer-detail"
import Album from '@/views/album'
import TopDetail from "@/views/top-detail"
import UserCenter from "@/views/user-center"

const routes = [
  // 当访问根路径时，默认转到/recommend路径
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    component: Recommand,
    children: [{
      path: ':id',
      component: Album,
    }]
  },
  {
    path: '/search',
    component: Search,
    children: [{
      path: ':id',
      component: singerDetail
    }]
  },
  {
    path: '/singer',
    component: Singer,
    children: [{
      path: ':id',
      component: singerDetail,
    }]
  },
  {
    path: '/top-list',
    component: Toplist,
    children: [{
      path: ':id',
      component: TopDetail,
    }]
  },
  {
    path: '/user',
    components: {
      user: UserCenter
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router
