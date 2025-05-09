<template>
  <el-menu class="menu-container" mode="vertical" :default-active="$route.path" active-text-color="#409EFF">
    <el-menu-item index="/activities">
      <router-link to="/activities">志愿活动</router-link>
    </el-menu-item>
    <el-menu-item index="/showcase">
      <router-link to="/showcase">活动风采</router-link>
    </el-menu-item>
  </el-menu>
</template>

<script setup>

</script>

<style scoped>
.menu-container {
  width: 200px;
  height: calc(100vh - 60px);
  background-color: #f5f7fa;
  border-right: solid 1px #e6e6e6;
  padding-top: 30px;
}

.menu-container :deep(.el-menu-item a) {
  color: #606266;
  text-decoration: none;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.menu-container .el-menu-item.is-active {
  background-color: #e6f1ff !important;
}

.menu-container .el-menu-item.is-active :deep(a) {
  color: #409EFF !important;
}

.el-menu-item:hover {
  background-color: #e6f1ff !important;
}
</style>