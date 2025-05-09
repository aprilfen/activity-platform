<template>
  <el-dialog :model-value="visible" @update:modelValue="val => $emit('update:visible', val)" title="编辑志愿活动"
    width="1000px">
    <el-form ref="formRef" :model="localFormData" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="活动名称" prop="name">
            <el-input v-model="localFormData.name" placeholder="请输入活动名称" />
          </el-form-item>
          <el-form-item label="活动时间" prop="time">
            <el-date-picker v-model="localFormData.time" type="datetime" placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm" />
          </el-form-item>
          <el-form-item label="活动地点" prop="location">
            <MapPicker v-model="localFormData.location" />
          </el-form-item>

        </el-col>
        <el-col :span="12">
          <el-form-item label="参与人数" prop="maxParticipants">
            <el-input-number v-model="localFormData.maxParticipants" :min="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="志愿工时" prop="volunteerHours">
            <el-input-number v-model="localFormData.volunteerHours" :min="0.5" :precision="2" :step="0.5"
              controls-position="right" />
          </el-form-item>
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="localFormData.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="活动简介" prop="summary">
            <el-input v-model="localFormData.summary" type="textarea" :rows="3" placeholder="请输入活动简介" />
          </el-form-item>
          <el-form-item label="详情介绍" prop="details">
            <el-input v-model="localFormData.details" type="textarea" :rows="3" placeholder="请输入活动详情" />
          </el-form-item>
          <el-form-item label="活动封面">
            <el-upload v-model:file-list="fileList" action="#" list-type="picture-card" :auto-upload="false"
              :on-change="handleFileChange">
              <img v-if="localFormData.coverImage" :src="localFormData.coverImage" class="cover-preview" />
              <el-icon v-else>
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="submitForm">保存修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { watch, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import MapPicker from './MapPicker.vue'


const props = defineProps({
  visible: Boolean,
  formData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'submit'])

// 表单数据初始化
const localFormData = ref({ ...props.formData })
const fileList = ref([])
const formRef = ref()

const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'


const handleFileChange = (file) => {
  // 更新预览数据
  if (file.raw) {
    localFormData.value.coverImage = URL.createObjectURL(file.raw)
  }
}

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  time: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  maxParticipants: [{ type: 'number', min: 1, message: '人数至少1人', trigger: 'blur' }],
  volunteerHours: [{ type: 'number', min: 0.5, message: '工时至少0.5小时', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入活动简介', trigger: 'change' }],
  details: [{ required: true, message: '请输入活动详情', trigger: 'change' }],
})


// 监听外部数据变化
watch(() => props.formData, (newVal) => {
  localFormData.value = { ...newVal }
  // 处理封面预览
  if (newVal.coverImage) {
    const fullImageUrl = newVal.coverImage.startsWith('http')
      ? newVal.coverImage
      : backendBase + newVal.coverImage

    fileList.value = [{ url: fullImageUrl }]
  }
})

// 提交处理
const submitForm = async () => {
  try {
    if (!formRef.value) {
      throw new Error('表单未正确初始化')
    }
    await formRef.value.validate()

    // 处理文件数据
    const coverFile = fileList.value[0]?.raw
    let coverImage = localFormData.value.coverImage

    // 如果有新上传文件
    if (coverFile) {
      // 这里应调用上传接口，示例使用假数据
      coverImage = await uploadCoverImage(coverFile) // 需实现上传逻辑
    }

    if (!localFormData.value._id) {
      throw new Error('缺失活动ID')
    }

    const submitData = {
      ...localFormData.value,
      coverImage,
      maxParticipants: Number(localFormData.value.maxParticipants),
      volunteerHours: Number(localFormData.value.volunteerHours),
      time: new Date(localFormData.value.time).toISOString()
    }

    emit('submit', submitData)
    emit('update:visible', false)

  } catch (error) {
    ElMessage.warning(error.message || '表单提交失败')
    console.error('详细错误:', error)
  }
}
</script>

<style>
.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>