import request from '@/common/http.js'

// 获取采风列表
export const fetchStyles = (params = {}) => {
  return request({
    url: '/api/showcase',
    method: 'GET',
    data: {
      page: params.page || 1,
      limit: params.limit || 10
    }
  })
}

// 获取采风详情
export const getStyleDetail = (id) => {
  return request({
    url: `/api/showcase/${id}`,
    method: 'GET'
  })
}