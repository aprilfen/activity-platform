<template>
  <!-- 新增活动对话框 -->
  <el-dialog :model-value="visible" @update:modelValue="handleDialogUpdate" title="新增志愿活动" width="1000px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right" size="large">
      <el-row :gutter="20">
        <!-- 左列 -->
        <el-col :span="12">
          <el-form-item label="活动名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入活动名称" />
          </el-form-item>
          <el-form-item label="活动时间" prop="time">
            <el-date-picker v-model="formData.time" type="datetime" placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm" />
          </el-form-item>
          <el-form-item label="活动地点" prop="location">
            <MapPicker v-model="formData.location" />
          </el-form-item>
          
        </el-col>

        <!-- 右列 -->
        <el-col :span="12">
          <el-form-item label="参与人数" prop="maxParticipants">
            <el-input-number v-model="formData.maxParticipants" :min="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="志愿工时" prop="volunteerHours">
            <el-input-number v-model="formData.volunteerHours" :min="0.5" :precision="2" :step="0.5"
              controls-position="right" />
          </el-form-item>
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="活动简介" prop="summary">
            <el-input v-model="formData.summary" type="textarea" maxlength="200" show-word-limit :rows="3"
              placeholder="请输入活动简介" />
          </el-form-item>
          <el-form-item label="详情介绍" prop="details">
            <el-input v-model="formData.details" type="textarea" :rows="4" placeholder="请输入活动详情" />
          </el-form-item>
          <el-form-item label="活动封面" prop="coverImage">
            <el-upload action="#" list-type="picture-card" :auto-upload="false" :on-change="handleUpload"
              :file-list="fileList">
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup>
import MapPicker from './MapPicker.vue'
import { ref, reactive } from 'vue'

// 对话框控制
const formRef = ref()
const fileList = ref([])

// 表单数据
const formData = reactive({
  name: '',
  time: '',
  location: {
    address: '',
    coordinates: []
  },
  maxParticipants: 1,
  volunteerHours: 0.5,
  contactPhone: '',
  summary: '',
  details: '',
  coverImage: null,
  status: '0',

})


const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:visible', 'submit'])

// 对话框状态更新
const handleDialogUpdate = (newValue) => {
  emit('update:visible', newValue)
}



// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  time: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  maxParticipants: [{ type: 'number', min: 1, message: '人数至少1人', trigger: 'blur' }],
  volunteerHours: [{ type: 'number', min: 0.5, message: '工时至少0.5小时', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入活动简介', trigger: 'change' }],
  details: [{ required: true, message: '请输入活动详情', trigger: 'change' }],

})


// 处理文件上传
const handleUpload = (file) => {
  formData.coverImage = file.raw
}


// 关闭对话框
const closeDialog = () => {
  emit('update:visible', false)
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()

    // 转换时间格式
    const submitData = {
      ...formData,
      time: new Date(formData.time).toISOString(),
      maxParticipants: Number(formData.maxParticipants),
      volunteerHours: Number(formData.volunteerHours)
    }

    emit('submit', submitData)
    closeDialog()
  } catch (error) {
    // 优化错误定位
    if (error?.fields) {
      const firstError = Object.keys(error.fields)[0]
      const el = document.querySelector(`[prop="${firstError}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

</script>

<style scoped></style>