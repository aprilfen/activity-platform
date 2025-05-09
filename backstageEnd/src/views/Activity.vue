<template>
  <div class="main-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-input v-model="searchKeyword" placeholder="搜索活动名称" class="search-input" clearable />
      <el-select v-model="selectedStatus" placeholder="全部状态" clearable class="status-select">
        <el-option label="未开始" value="0" />
        <el-option label="进行中" value="1" />
        <el-option label="已结束" value="2" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <!-- 新增按钮 -->
      <div class="add-btn-container">
        <el-button round :icon="Plus" @click="showDialog">新增活动</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-table :data="paginatedData" style="width: 100%" height="30" class="data-table"
      :header-cell-style="{ background: '#f5f7fa' }" @sort-change="handleSortChange" :show-overflow-tooltip="true">
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="name" label="活动名称" align="center"></el-table-column>
      <el-table-column prop="location.address" label="活动地点" align="center"></el-table-column>
      <el-table-column prop="time" label="时间" sortable="custom" align="center"></el-table-column>
      <el-table-column prop="maxParticipants" label="人数" align="center"></el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType[row.status]" effect="dark">
            {{ statusMap[row.status] || '未知状态' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button text type="" @click="handleEdit(row)">编辑</el-button>
          <el-button text type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <el-pagination :current-page="currentPage" :page-sizes="[5, 10, 20]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="filteredData.length" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>

  <!-- 新增活动对话框 -->
  <AddActivity :visible="dialogVisible" @update:visible="val => dialogVisible = val" @submit="handleSubmit" />
  <EditActivity :visible="editDialogVisible" :form-data="selectedRow" @update:visible="val => editDialogVisible = val"
    @submit="payload => handleEditSubmit(payload)" />

</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import AddActivity from '@/components/AddActivity.vue'
import EditActivity from '@/components/EditActivity.vue'
import { getActivitiesList, createActivity, updateActivity, deleteActivity, getShowcaseList } from '@/api'

// 模拟数据
let mockData = ref()

getActivitiesList().then(res => {
  mockData.value = (res.data || [])
  console.log(res);

}).catch(err => {
  console.error('数据加载失败:', err)
  ElMessage.error('活动列表加载失败')
})

// 表单数据
const formData = reactive({
  name: '',
  time: '',
  location: {
    coordinates: [],
    address: ''
  },
  people: 1,
  volunteerHours: 0.5,
  contactPhone: '',
  summary: '',
  details: '',
  coverImage: null
})

// 对话框控制
const dialogVisible = ref(false)
const fileList = ref([])


// 状态映射
const statusMap = {
  0: '未开始',
  1: '进行中',
  2: '已结束'
}
const statusType = {
  0: 'info',
  1: 'success',
  2: 'danger'
}

// 搜索相关
const searchKeyword = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const sortParams = ref(null)

const editDialogVisible = ref(false)
const selectedRow = ref(null)

// 处理排序
const handleSortChange = ({ prop, order }) => {
  sortParams.value = { prop, order }
}

// 过滤和排序后的数据
const filteredData = computed(() => {
  // 安全访问源数据
  const sourceData = mockData.value || []

  // 过滤处理
  let data = sourceData.filter(item => {
    // 安全解构并设置默认值
    const {
      name = '',
      status = 0,
      time = ''
    } = item || {}

    // 状态类型转换
    const itemStatus = Number.isInteger(status) ? status : 0

    // 搜索匹配
    const matchSearch = name.toLowerCase().includes(searchKeyword.value.toLowerCase())

    // 状态匹配
    const matchStatus = selectedStatus.value === ''
      ? true
      : itemStatus === parseInt(selectedStatus.value)

    return matchSearch && matchStatus
  })

  // 安全排序
  if (sortParams.value?.prop === 'time') {
    data = [...data].sort((a, b) => {
      const timeA = new Date(a?.time || 0).getTime()
      const timeB = new Date(b?.time || 0).getTime()
      return sortParams.value.order === 'ascending' ? timeA - timeB : timeB - timeA
    })
  }

  return data
})

// 分页数据

const paginatedData = computed(() => {
  const source = Array.isArray(filteredData.value) ? filteredData.value : []
  const start = (currentPage.value - 1) * pageSize.value
  return source.slice(start, start + pageSize.value)
})

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 操作处理
const handleEdit = (row) => {
  selectedRow.value = { ...row } // 深拷贝数据
  editDialogVisible.value = true
}
// 删除处理
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除活动「${row.name}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    const loading = ElLoading.service({ lock: true })
    try {
      const res = await deleteActivity(row._id)
      mockData.value = mockData.value.filter(item => item._id !== row._id)
      ElMessage.success(res.message || '删除成功')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '删除失败'
      ElMessage.error(msg)
    } finally {
      loading.close()
    }
  }).catch(() => {
  })
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}


// 显示对话框
const showDialog = () => {
  dialogVisible.value = true
  // 安全重置表单
  Object.keys(formData).forEach(key => {
    if (key === 'people') formData[key] = 1
    else if (key === 'hours') formData[key] = 1.0
    else if (key !== 'cover') formData[key] = ''
  })
  fileList.value = []
}

// 处理新增表单提交
const handleSubmit = async (formData) => {
  let loading = null
  try {
    loading = ElLoading.service({ lock: true })

    // 添加请求数据校验
    if (!formData.time) {
      throw new Error('活动时间不能为空')
    }
    const res = await createActivity(formData)

    // 严格校验响应数据
    if (!res?.data) {
      throw new Error(res.data)
    }

    mockData.value.unshift({
      ...res.data,
      status: res.data.status || 0,
      location: res.data.location.address || '待补充'
    })

    ElMessage.success('创建成功')
  } catch (error) {
    // 明确错误类型处理
    if (error.response?.status === 400) {
      const errors = error.response.data?.errors || []
      errors.forEach(e => {
        ElMessage.error(`${e.field}: ${e.message}`)
      })
    } else {
      ElMessage.error(error.message)
    }
  } finally {
    loading?.close()
  }
}


// 处理编辑提交
const handleEditSubmit = async (formData) => {
  let loading = null;

  try {
    loading = ElLoading.service({ lock: true })

    // 数据转换
    const submitData = {
      ...formData,
      maxParticipants: Number(formData.maxParticipants),
      volunteerHours: Number(formData.volunteerHours),
      time: new Date(formData.time).toISOString(),
      status: formData.status.toString()
    }
    delete submitData._id // 移除 _id
    console.log(submitData);

    const res = await updateActivity(formData._id, submitData)

    console.log(res);

    // 更新本地数据
    const index = mockData.value.findIndex(item => item._id === formData._id)
    if (index !== -1) {
      mockData.value.splice(index, 1, {
        ...res,
        // 保持与本地数据结构一致
        _id: res._id || formData._id,
        status: res.status || 0
      })
    }


  } catch (error) {
    console.log(error);
    handleUpdateError(error)
  } finally {
    loading?.close()
  }
}

// 错误处理函数
const handleUpdateError = (error) => {
  if (error.response?.data?.errors) {
    error.response.data.errors.forEach(err => {
      ElMessage.error(`${err.field}: ${err.message}`)
    })
  } else {
    ElMessage.error(error.message || '更新失败')
  }
}

</script>

<style scoped>
.main-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-input {
  width: 200px;
}

.status-select {
  width: 120px;
}

.data-table {
  flex: 1;
  overflow: auto;
}

.el-tooltip__popper {
  max-width: 20%;
}

.el-tooltip__popper,
.el-tooltip__popper.is-dark {
  background: #f5f5f5 !important;
  color: #303133 !important;
}

.pagination-container {
  margin-top: auto;
  padding: 16px 0;
  background: #fff;
  border-top: 1px solid #ebeef5;
}

.el-button--text {
  margin-left: 10px;
  padding: 0 8px;
}
</style>