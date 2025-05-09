<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">Login</h2>
      <el-form :model="form" ref="formRef" class="login-form" label-width="0px">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" size="large" class="login-input" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" class="login-input" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="handleLogin"
            :loading="loading"
            class="login-btn"
          >登 录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({ username: '', password: '' })
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await login(form.value)
    const { token, user } = res
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    ElMessage.success('登录成功')
    router.push('/activities')
  } catch (err) {
    ElMessage.error(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e0eafc, #cfdef3);
}

.login-box {
  width: 480px;
  padding: 50px 60px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(6px);
}

.login-title {
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 40px;
}

.rounded-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  background-color: #f6f9fe;
  border: 1px solid #dcdfe6;
}

/* 登录按钮样式 */
.login-btn {
  width: 100%;
  border-radius: 10px;
  background-image: linear-gradient(to right, #6fb1fc, #4364f7);
  border: none;
  color: white;
  font-weight: 500;
}
</style>
