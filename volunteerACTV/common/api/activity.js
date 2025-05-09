// common/api/activity.js
import request from '@/common/http.js'

/**
 * 获取活动列表（分页）
 * @param {Object} params
 *   - page  页码，默认 1
 *   - limit 每页条数，默认 10
 */
export function fetchActivities(params = {}) {
	return request({
		url: '/api/activities',
		method: 'GET',
		data: {
			page: params.page || 1,
			limit: params.limit || 10
		}
	})
}

/**
 * 获取单个活动详情
 * @param {String} id 活动 ID
 */
export function getActivityDetail(id) {
	return request({
		url: `/api/activities/${id}`,
		method: 'GET'
	})
}


/**
 * 报名参加活动
 * @param {String} id 活动 ID
 * @param {Object} participant { name, phone }
 */
export function participateActivity(id, participant) {
	return request({
		url: `/api/activities/${id}/participate`,
		method: 'POST',
		data: participant
	})
}

/**
 * 获取已报名的活动列表
 * @param {String} volId 志愿者 ID
 */
export function fetchRegisteredActivities() {
	return request({
		url: `/api/activities/registered`,
		method: 'GET'
	})
}

/**
 * 签到接口（基于坐标）
 * @param {String} id 活动 ID
 * @param {Object} params
 *   - vol_id {String} 志愿者 ID
 *   - lng    {Number} 当前经度
 *   - lat    {Number} 当前纬度
 */
export function checkinActivity(id, params) {
	return request({
		url: `/api/activities/${id}/checkin`,
		method: 'PATCH',
		data: {
			vol_id: params.vol_id,
			lng: params.lng,
			lat: params.lat
		}
	})
}