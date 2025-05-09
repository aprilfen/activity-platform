<template>
	<view class="detail-page">
		<!-- 封面 -->
		<view class="cover-wrap">
			<image :src="coverSrc" mode="aspectFill" class="cover-img" />
		</view>

		<!-- 信息卡片 -->
		<view class="info-card">
			<!-- 标题与副标题 -->
			<view class="header">
				<view class="title">{{ activity.name }}</view>
				<view class="subtitle" :number-of-lines="2">
					{{ activity.summary }}
				</view>
			</view>

			<!-- 活动时间 -->
			<view class="row">
				<text class="label">活动时间：</text>
				<text class="value">{{ formatDate(activity.time) }}</text>
			</view>
			<!-- 活动地点 -->
			<view class="row">
				<text class="label">活动地点：</text>
				<text class="value wrap">{{ activity.location.address }}</text>
				<u-icon name="map-fill" size="28" color="#990000" />
			</view>
			<!-- 参加人数 -->
			<view class="row">
				<text class="label">参加人数：</text>
				<text class="value">
					{{ participantsCount }}/{{ activity.maxParticipants || 0 }} 人
				</text>
			</view>
			<!-- 志愿工时 -->
			<view class="row">
				<text class="label">志愿工时：</text>
				<text class="value">{{ activity.volunteerHours || 0 }} 小时</text>
			</view>
		</view>

		<!-- 联系电话卡片 -->
		<view class="phone-card">
			<view class="row">
				<text class="label">联系电话：</text>
				<text class="value">{{ activity.contactPhone }}</text>
				<u-icon name="phone" size="30" color="#ff0000" />
			</view>
		</view>

		<!-- 详情介绍 -->
		<view class="detail-card">
			<view class="section-title">详情介绍</view>
			<view class="title">{{ activity.name }}</view>
			<view class="section-content">{{ activity.details }}</view>
		</view>

		<!-- 报名按钮 -->
		<view class="action-bar">
			<button @click="handleAction">
				<!-- 优先判断活动是否结束 -->
				{{ activity.isEnded
			      ? '活动已结束'
			      : activity.hasSignedUp
			        ? '已报名'
			        : '立即报名' }}
			</button>
		</view>
	</view>
</template>

<script>
	import {
		BASE_URL
	} from '@/common/http.js' // 导入后端基地址
	import {
		getActivityDetail,
		participateActivity
	} from '@/common/api/activity.js'
	import weappJwt from '@/js_sdk/t-jwt/JWT/weapp-jwt.js'

	export default {
		data() {
			return {
				baseURL: BASE_URL,
				activity: {
					coverImage: '',
					name: '',
					summary: '',
					details: '',
					time: '',
					location: {
						address: '',
						coordinates: [0, 0]
					},
					maxParticipants: 0,
					participants: [], // 后端返回的报名列表
					hasSignedUp: false, // 是否已报名
					isEnded: false // 是否已结束
				},
				isSigningUp: false
			}
		},

		computed: {
			// 参加人数
			participantsCount() {
				return this.activity.participants ?
					this.activity.participants.length :
					0
			},

			// 封面图完整 URL
			coverSrc() {
				const img = this.activity.coverImage || ''
				if (img.startsWith('http')) {
					return img
				}
				return img ?
					this.baseURL.replace(/\/$/, '') + (img.startsWith('/') ? img : '/' + img) :
					this.baseURL + '/images/activities/default.jpg'
			}
		},

		onLoad(options) {
			this.checkTokenAndFetch(options.id)
		},

		methods: {
			// 时间格式修改
			formatDate(dateStr) {
				const d = new Date(dateStr)
				const pad = n => (n < 10 ? '0' + n : n)
				return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
					`${pad(d.getHours())}:${pad(d.getMinutes())}`
			},
			  // 点击按钮时的统一入口
			    handleAction() {
			      if (this.activity.isEnded) {
			        uni.showToast({
			        	title: '活动已结束',
			        	icon: 'none'
			        })
			        return
			      }
			      if (!this.activity.hasSignedUp) {
			        // 未报名，执行报名
			        this.onSignUp()
			      }
			      // 已报名也不重复操作
			    },
			// token 验证
			checkTokenAndFetch(id) {
				const token = uni.getStorageSync('token')
				if (!token) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return uni.navigateTo({
						url: '/pages/mine/mine'
					})
				}
				try {
					const decoded = weappJwt(token)
					if (!decoded || decoded.exp * 1000 <= Date.now()) {
						throw new Error('登录已过期')
					}
				} catch (err) {
					uni.showToast({
						title: err.message || '登录已过期，请重新登录',
						icon: 'none'
					})
					return uni.navigateTo({
						url: '/pages/mine/mine'
					})
				}
				this.fetchDetail(id)
			},
			// 获取活动详情
			async fetchDetail(id) {
				try {
					const res = await getActivityDetail(id)
					if (res.code === 200) {
						this.activity = {
							...res.data,
							// 确保 participants 至少是数组
							participants: Array.isArray(res.data.participants) ?
								res.data.participants : []
						}
					} else {
						uni.showToast({
							title: res.error || res.msg || '获取详情失败',
							icon: 'none'
						})
					}
				} catch (err) {
					console.error(err)
					uni.showToast({
						title: err.message || '网络异常',
						icon: 'none'
					})
				}
			},
			// 报名
			async onSignUp() {
				if (this.activity.isEnded || this.activity.hasSignedUp) return

				this.isSigningUp = true
				try {
					await participateActivity(this.activity._id, {})
					uni.showToast({
						title: '报名成功',
						icon: 'success'
					})
					await this.fetchDetail(this.activity._id)
				} catch (err) {
					if (err.statusCode === 401) {
						uni.showToast({
							title: '登录已过期，请重新登录',
							icon: 'none'
						})
						return uni.navigateTo({
							url: '/pages/mine/mine'
						})
					}
					const text =
						err.error ||
						err.data?.error ||
						err.message ||
						'报名失败'
					uni.showToast({
						title: text,
						icon: 'none'
					})
				} finally {
					this.isSigningUp = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.detail-page {
		background: #f5f5f5;
		padding-bottom: 120rpx;
	}

	/* 封面图片 */
	.cover-wrap {
		width: 100%;
		height: 400rpx;
		overflow: hidden;
		border-radius: 0 0 32rpx 32rpx;

		.cover-img {
			width: 100%;
			height: 100%;
		}
	}

	/* 信息卡片 */
	.info-card {
		background: #fff;
		margin: -40rpx 0 24rpx;
		border-radius: 24rpx;
		padding: 32rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
		position: relative;
		z-index: 2;

		.title {
			font-size: 36rpx;
		}

		.subtitle {
			font-size: 28rpx;
		}
	}

	/* 联系电话卡片 */
	.phone-card {
		background: #fff;
		margin: 24rpx 0 24rpx;
		border-radius: 16rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

		.row {
			display: flex;
			align-items: center;
			gap: 16rpx;
		}
	}

	/* 详情卡片 */
	.detail-card {
		background: #fff;
		margin: 0 0 24rpx;
		border-radius: 16rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

		.section-content {
			font-size: 28rpx;
		}
	}

	/* 通用行样式 */
	.row {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.label {
			width: 140rpx;
			font-size: 26rpx;
			color: #666;
			flex-shrink: 0;
		}

		.value {
			flex: 1;
			font-size: 26rpx;
			color: #333;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24rpx;
		background: #fff;
		box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.08);
	}
</style>