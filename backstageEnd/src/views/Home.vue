<template>
  <el-container>
    <el-header class="custom-header">
      <div class="header-left" /> 
      <div class="header-title">志愿者服务平台</div>
      <div class="header-user">{{ username }}</div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <Aside></Aside>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Aside from '@/components/Aside.vue'
const username = ref('')
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  username.value = user?.username || '未登录'
})
</script>

<style scoped>
.el-header,
.el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}
.custom-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 26px;
  font-weight: bold;
  color: #303133;
  letter-spacing: 1px;
}

.header-user {
  font-size: 18px;
  color: #606266;
}

.header-left {
  width: 120px; /* 和右侧对齐用的占位块 */
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  line-height: 200px;
}



.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  line-height: 160px;
  height: calc(100vh - 60px);
  padding: 0 !important;
}
</style>