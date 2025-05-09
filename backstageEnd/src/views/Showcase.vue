<template>
  <div class="main-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-input v-model="searchKeyword" placeholder="搜索标题" class="search-input" clearable />
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>

      <!-- 新增按钮 -->
      <div class="add-btn-container">
        <el-button round :icon="Plus" @click="showDialog">新增风采</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-table :data="tableData" style="width: 100%" class="data-table" :header-cell-style="{ background: '#f5f7fa' }"
      @sort-change="handleSortChange" v-loading="loading">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="title" label="标题" align="center" show-overflow-tooltip />
      <el-table-column prop="subtitle" label="副标题" align="center" show-overflow-tooltip />
      <el-table-column label="评论数" align="center" width="120">
        <template #default="{ row }">
          {{ row.comments?.length || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button text @click="handleEdit(row)">编辑</el-button>
          <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper" :total="totalCount" @size-change="loadData"
        @current-change="loadData" />
    </div>
  </div>

  <!-- 新增/编辑对话框 -->
  <ShowcaseDialog v-model:visible="dialogVisible" :mode="dialogMode" :formData="currentFormData"
    @submit="handleDialogSubmit" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import ShowcaseDialog from '@/components/ShowcaseDialog.vue'
import {
  getShowcaseList,
  createShowcase,
  updateShowcase,
  deleteShowcase
} from '@/api'

// 数据相关
const tableData = ref([])
const loading = ref(false)
const totalCount = ref(0)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索参数
const searchKeyword = ref('')
const sortParams = ref(null)

// 对话框控制
const dialogVisible = ref(false)
const dialogMode = ref('create')
const currentFormData = ref({
  title: '',
  subtitle: '',
  content: '',
  images: []
})

// 初始化加载数据
onMounted(() => {
  loadData()
})

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value.trim()
    }

    const res = await getShowcaseList(params)
    tableData.value = res.data || []
    totalCount.value = res.pagination?.total || 0
  } catch (error) {
    ElMessage.error('数据加载失败: ' + (error.message || error))
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 处理排序
const handleSortChange = ({ prop, order }) => {
  sortParams.value = { prop, order }
  loadData()
}

// 打开对话框
const showDialog = () => {
  dialogMode.value = 'create'
  currentFormData.value = {
    title: '',
    subtitle: '',
    content: '',
    images: []
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {

  dialogMode.value = 'edit'
  currentFormData.value = {
    _id: row._id,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    images: Array.isArray(row.images) ? [...row.images] : []
  }
  dialogVisible.value = true

}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除《${row.title}》？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    loading.value = true
    await deleteShowcase(row._id)
    ElMessage.success('删除成功')
    await loadData()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 处理对话框提交
const handleDialogSubmit = async (formData) => {
  const fd = new FormData()
  fd.append('title', formData.title)
  fd.append('subtitle', formData.subtitle || '')
  fd.append('content', formData.content)
  formData.images.forEach(img => {
    // 如果是 File 对象，则上传；否则后台接口支持接受 URL 或跳过
    if (img instanceof File) {
      fd.append('images', img)
    }
  })

  try {
    loading.value = true
    if (dialogMode.value === 'create') {
      await createShowcase(fd)
      ElMessage.success('新增风采成功')
    } else {
      // 编辑模式，URL：PATCH /api/showcase/:id
      await updateShowcase(formData._id, fd)
      ElMessage.success('更新风采成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error(err.response?.data?.error || err.message || '操作失败')
  } finally {
    loading.value = false
  }


}

// 分页数据计算
const paginatedData = computed(() => {
  return tableData.value.map(item => ({
    ...item,
    createdAt: formatDate(item.createdAt)
  }))
})
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