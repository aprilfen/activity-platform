<!-- pages/checkin/index.vue -->
<template>
	<view class="container">
		<!-- 已报名活动列表 -->
		<view v-if="activities.length">
			<view class="item" v-for="act in activities" :key="act._id">
				<view class="info">
					<text class="title">{{ act.name }}</text>
					<text class="time">{{ formatTime(act.time) }}</text>
				</view>
				<button class="btn" :disabled="isChecked(act)" @click="handleCheckin(act._id)">
					{{ isChecked(act) ? '已签到' : '签到' }}
				</button>
			</view>
		</view>
		<view v-else class="no-data">暂无已报名活动</view>
	</view>
</template>

<script>
	import {
		fetchRegisteredActivities,
		checkinActivity
	} from '@/common/api/activity.js'
	import weappJwt from '@/js_sdk/t-jwt/JWT/weapp-jwt.js'

	export default {
		data() {
			return {
				volId: '', // 从 JWT 解出的志愿者 ID
				activities: [] // 已报名活动列表
			}
		},

		// 每次页面显示时，都验证登录态并加载列表
		onShow() {
			const token = uni.getStorageSync('token')
			if (!token) {
				// 无 token：提示后跳转登录
				uni.showToast({
					title: '请先登录',
					icon: 'none',
					duration: 1000,
					success() {
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/mine/mine'
							})
						}, 1000)
					}
				})
				return
			}

			// 尝试解码 JWT 拿到 volunteerId
			let payload = {}
			try {
				payload = weappJwt(token)
			} catch (e) {
				console.error('JWT 解码失败', e)
			}
			this.volId = payload.vol_id || ''
			console.log(payload);
			if (!this.volId) {
				// 解不出 ID：清 token 再跳登录
				uni.showToast({
					title: '登录状态异常，请重新登录',
					icon: 'none',
					duration: 1500,
					success() {
						setTimeout(() => {
							uni.removeStorageSync('token')
							uni.switchTab({
								url: '/pages/mine/mine'
							})
						}, 1500)
					}
				})
				return
			}

			// 登录检查通过，加载已报名活动
			this.loadRegistered()
		},

		methods: {
			// 格式化时间
			formatTime(val) {
				if (!val) return ''
				const s = val.replace('T', ' ')
				return s.length > 16 ? s.substr(0, 16) : s
			},

			// 加载已报名活动列表
			async loadRegistered() {
				try {
					const res = await fetchRegisteredActivities()
					// 兼容不同响应结构
					this.activities = Array.isArray(res.data) ?
						res.data :
						Array.isArray(res.data.data) ?
						res.data.data : []
				} catch (e) {
					console.error('loadRegistered error:', e)
					uni.showToast({
						title: '获取列表失败',
						icon: 'none'
					})
				}
			},

			// 判断该活动是否已签到
			isChecked(act) {
				return (act.participants || []).some(
					p => p.vol_id === this.volId && p.checkedIn
				)
			},

			// 签到入口：权限检查
			handleCheckin(activityId) {
				uni.showLoading({
					title: '签到中...'
				})
				uni.getSetting({
					success: res => {
						if (!res.authSetting['scope.userLocation']) {
							uni.authorize({
								scope: 'scope.userLocation',
								success: () => this.doGetLocation(activityId),
								fail: () => {
									uni.hideLoading()
									uni.showModal({
										title: '权限请求',
										content: '需要地理位置权限才能签到，请前往设置打开',
										showCancel: false,
										success() {
											uni.openSetting()
										}
									})
								}
							})
						} else {
							this.doGetLocation(activityId)
						}
					},
					fail: err => {
						console.error('getSetting fail:', err)
						uni.hideLoading()
						uni.showToast({
							title: '权限检查失败',
							icon: 'none'
						})
					}
				})
			},

			// 获取位置并调用签到接口
			doGetLocation(activityId) {
				uni.getLocation({
					type: 'wgs84',
					success: async ({
						latitude,
						longitude
					}) => {
						try {
							await checkinActivity(activityId, {
								vol_id: this.volId,
								lng: longitude,
								lat: latitude
							})
							uni.showToast({
								title: '签到成功',
								icon: 'success'
							})
							this.loadRegistered()
						} catch (err) {
							console.error('checkinActivity error:', err)
							uni.showToast({
								title: err.data?.error || err.message || '签到失败',
								icon: 'none'
							})
						} finally {
							uni.hideLoading()
						}
					},
					fail: err => {
						console.error('getLocation fail:', err)
						uni.hideLoading()
						uni.showModal({
							title: '获取定位失败',
							content: '请检查定位权限',
							showCancel: false
						})
					}
				})
			}
		}
	}
</script>

<style scoped>
	.container {
		padding: 10px;
		background-color: #f5f7fa;
	}

	.item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px;
		background: #fff;
		border-radius: 8px;
		margin-bottom: 12px;
	}

	.info {
		flex: 1;
	}

	.title {
		font-weight: bold;
	}

	.time {
		color: #888;
		font-size: 12px;
		margin-top: 4px;
	}

	.btn {
		padding: 6px 12px;
		background: #409EFF;
		color: #fff;
		border: none;
		border-radius: 4px;
	}

	.btn:disabled {
		background: #ccc;
	}

	.no-data {
		text-align: center;
		color: #999;
		margin-top: 20px;
	}
</style>