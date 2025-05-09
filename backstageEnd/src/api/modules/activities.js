import { get, post, patch,del } from '@/api/utils/request'

// 获取列表
export const getActivitiesList = data => get('/activities', data)

// 增加活动
export const createActivity = (formData) => {
  const fd = new FormData()

  // 追加普通字段
  const baseFields = [
    'name', 'time', 'maxParticipants',
    'volunteerHours', 'contactPhone', 
    'summary', 'details'
  ]

  baseFields.forEach(field => {
    fd.append(field, formData[field])
  })

  // 处理嵌套的 location 字段
  if (formData.location) {
    const { address, lng, lat } = formData.location
    fd.append('location[address]', address)
    fd.append('location[lng]', lng)
    fd.append('location[lat]', lat)
  }

  // 处理文件字段
  if (formData.coverImage) {
    fd.append('coverImage', formData.coverImage.raw || formData.coverImage)
  }

  return post('/activities', fd, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 更新活动接口
export const updateActivity = (id, formData) => {
  // 处理文件上传
  if (formData.coverImage instanceof File || formData.coverImage?.raw) {
    const fd = new FormData()
    
    // 添加文件
    fd.append('coverImage', 
      formData.coverImage.raw || formData.coverImage
    )
    
    // 添加其他字段
    const allowedFields = [
      'name', 'summary', 'details', 'time', 'location',
      'maxParticipants', 'volunteerHours', 'contactPhone'
    ]
    
    allowedFields.forEach(key => {
      fd.append(key, formData[key])
    })

    return patch(`/activities/${id}`, fd)
  }

  // 普通更新
  return patch(`/activities/${id}`, formData)
}
export const deleteActivity = (id) => {
  return del(`/activities/${id}`)
}
