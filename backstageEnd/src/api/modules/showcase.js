import { get, post, patch,del } from '@/api/utils/request'
// 获取列表
export const getShowcaseList = data => get('/showcase', data)

/**
 * 创建活动风采
 * @param {FormData} formData 包含以下字段：
 * - title: string 必填
 * - subtitle: string 可选
 * - content: string 必填
 * - images: File[] 至少1个文件
 */
export const createShowcase = data => post('/showcase', data, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

/**
 * 更新活动风采
 * @param {string} id 活动ID
 * @param {object} data 更新数据（支持部分更新）
 */
export const updateShowcase = (id, data) => patch(`/showcase/${id}`, data)

/**
 * 删除活动风采
 * @param {string} id 活动ID
 */
export const deleteShowcase = id => del(`/showcase/${id}`)
