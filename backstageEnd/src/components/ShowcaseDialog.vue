<template>
  <!-- 新增/编辑风采对话框 -->
  <el-dialog :model-value="visible" @update:modelValue="handleDialogUpdate" :title="dialogTitle" width="1000px">
    <el-form ref="formRef" :model="localForm" :rules="formRules" label-width="100px" label-position="right"
      size="large">
      <el-row :gutter="20">
        <!-- 左列 -->
        <el-col :span="12">
          <el-form-item label="标题" prop="title">
            <el-input v-model="localForm.title" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="副标题" prop="subtitle">
            <el-input v-model="localForm.subtitle" placeholder="请输入副标题" />
          </el-form-item>
        </el-col>

        <!-- 右列 -->
        <el-col :span="12">
          <el-form-item label="内容" prop="content">
            <el-input v-model="localForm.content" type="textarea" :rows="6" placeholder="请输入内容" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 图片上传 -->
      <el-form-item label="风采图片" prop="images">
        <el-upload action="#" list-type="picture-card" :auto-upload="false" :multiple="true" :limit="5"
          :on-exceed="handleExceed" :on-change="handleUpload" v-model:file-list="fileList" :on-remove="handleRemove">
          <el-icon>
            <Plus />
          </el-icon>
          <template #tip>
            <div class="el-upload__tip">
              最多上传5张图片，单张图片不超过5MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ confirmButtonText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// Props: visible 控制弹框，mode 决定新增/编辑，formData 传入编辑时初始数据
const props = defineProps({
  visible: Boolean,
  mode: {
    type: String,
    default: 'create'
  },
  formData: {
    type: Object,
    default: () => ({
      title: '',
      subtitle: '',
      content: '',
      images: []
    })
  }
})
const emit = defineEmits(['update:visible', 'submit'])
const apiBase = import.meta.env.VITE_BASE_URL || ''

// 表单 ref 和本地数据副本
const formRef = ref(null)
const localForm = reactive({
  title: '',
  subtitle: '',
  content: '',
  images: []
})
const fileList = ref([])

// 弹框标题和按钮文字
const dialogTitle = computed(() =>
  props.mode === 'edit' ? '编辑风采' : '新增风采'
)
const confirmButtonText = computed(() =>
  props.mode === 'edit' ? '保存' : '提交'
)

// 表单校验规则
const formRules = reactive({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  subtitle: [{ required: true, message: '请输入副标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  images: [
    {
      validator: (_, value, callback) => {
        if (!localForm.images.length) {
          callback(new Error('请至少上传一张图片'))
        } else if (localForm.images.length > 5) {
          callback(new Error('最多上传五张图片'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

// 同步 props.formData 到 localForm & fileList，当弹框打开或 formData 变化时
watch(
  () => props.visible,
  visible => {
    if (visible) {
      console.log(props.formData);

      // 复制字段
      Object.assign(localForm, props.formData)
      // 初始化 fileList
      fileList.value = (props.formData.images || []).map((path, idx) => ({
        uid: path,
        name: `Image-${idx + 1}`,
        status: 'finished',
        url: apiBase + path
      }))
      localForm.images = (props.formData.images || []).slice()
    }
  }
)

// 文件处理
const handleUpload = file => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.raw.type)) {
    ElMessage.error('仅支持JPG/PNG/GIF格式')
    return false
  }
  const maxSize = 5 * 1024 * 1024
  if (file.raw.size > maxSize) {
    ElMessage.error('单张图片大小不能超过5MB')
    return false
  }
  if (localForm.images.length >= 5) {
    ElMessage.warning('最多上传5张图片')
    return false
  }
  fileList.value.push(file)
  localForm.images.push(file.raw)
}
const handleExceed = () => ElMessage.warning('最多只能上传5张图片')
const handleRemove = file => {
  const idx = fileList.value.findIndex(f => f.uid === file.uid)
  if (idx !== -1) {
    fileList.value.splice(idx, 1)
    localForm.images.splice(idx, 1)
  }
}

// 关闭弹框，重置表单
const closeDialog = () => {
  emit('update:visible', false)
  fileList.value = []
  formRef.value?.resetFields()
}
const handleDialogUpdate = val => emit('update:visible', val)

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    // 将图片 File 或 URL 一并提交
    const submitData = {
      ...localForm,
      images: localForm.images
    }
    // 如果编辑模式，携带 id
    if (props.mode === 'edit' && props.formData._id) {
      submitData._id = props.formData._id
    }
    emit('submit', submitData)
    closeDialog()
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.cover-preview {
  width: 100%;
  height: 100%;
}
</style>
