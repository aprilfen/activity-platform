import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      children: [
        {
          path: 'activities',               
          name: 'activities',
          component: () => import('@/views/Activity.vue')
        },

        {
          path: 'showcase',   
          name: 'showcase',
          component: () => import('@/views/Showcase.vue')
        }
      ]
      
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    }
  ],
})
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 未登录跳转 login
  if (to.path !== '/login' && !token) {
    return next('/login')
  }

  // 已登录，判断 token 是否过期
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1]
      const payload = JSON.parse(atob(payloadBase64))
      const isExpired = payload.exp * 1000 < Date.now()

      if (isExpired) {
        localStorage.clear()
        return next('/login')
      }
    } catch (e) {
      console.warn('无效的 token 格式', e)
      localStorage.clear()
      return next('/login')
    }
  }

  next()
})

export default router
