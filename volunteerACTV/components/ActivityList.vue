<template>
	<view class="activity-list">
		<!-- 分类 Tabs -->
		<u-tabs :list="tabList" :scrollable="false" :current="activeIndex" @click="onTabClick" class="tabs" />

		<!-- 滚动列表 -->
		<scroll-view class="scroll" scroll-y @scrolltolower="loadMore" :lower-threshold="50">
			<!-- 空状态 -->
			<view v-if="filteredActivities.length === 0 && status === 'nomore'" class="empty-wrap">
				<u-empty image-size="normal" text="暂无活动" />
			</view>

			<!-- 卡片列表 -->
			<view v-else class="grid">
				<view v-for="item in filteredActivities" :key="item._id" class="card" @click="goDetail(item._id)">
					<image :src="BASE_URL + item.coverImage" mode="aspectFill" class="cover" />
					<view class="info">
						<text class="name">{{ item.name }}</text>

						<view class="meta">
							<text class="summary">{{ item.summary }}</text>

							<view class="participants">
								<text>{{ item.currentParticipants != null ? item.currentParticipants : item.participants.length }}/{{ item.maxParticipants || 0 }}</text>
								<text class="date">{{ formatDate(item.time) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多/无更多提示 -->
			<view class="loadmore-wrap">
				<u-loadmore v-if="displayedStatus" :status="displayedStatus" />
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		fetchActivities,
		getActivityDetail
	} from '@/common/api/activity.js'
	import {
		BASE_URL
	} from '@/common/http.js'
	import weappJwt from '@/js_sdk/t-jwt/JWT/weapp-jwt.js'

	export default {
		name: 'ActivityList',
		props: {
			searchKeyword: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				BASE_URL,
				allActivities: [],
				page: 1,
				limit: 10,
				status: 'loadmore', // loadmore | loading | nomore | ''
				noMoreVisible: false,
				tabList: [{
						name: '全部',
						status: 'all'
					},
					{
						name: '进行中',
						status: 'ongoing'
					},
					{
						name: '已结束',
						status: 'ended'
					}
				],
				activeIndex: 0
			}
		},
		computed: {
			// 过滤后数组
			filteredActivities() {
				const tabStatus = this.tabList[this.activeIndex].status
				let list = []
				if (tabStatus === 'all') {
					list = this.allActivities
				} else if (tabStatus === 'ongoing') {
					// 包括报名时间内和进行中的活动
					list = this.allActivities.filter(a => a.status !== 2)
				} else if (tabStatus === 'ended') {
					list = this.allActivities.filter(a => a.status === 2)
				}
				if (!this.searchKeyword) return list
				const kw = this.searchKeyword.toLowerCase()
				return list.filter(a => a.name.toLowerCase().includes(kw))
			},
			// 控制显示 u-loadmore 状态
			displayedStatus() {
				if (this.status === 'loading' || this.status === 'loadmore') {
					return this.status
				}
				if (this.status === 'nomore' && this.noMoreVisible && this.filteredActivities.length > 0) {
					return 'nomore'
				}
				return ''
			}
		},
		created() {
			this.loadData()
		},
		methods: {
			onTabClick(tab) {
				const idx = this.tabList.findIndex(t => t.name === tab.name)
				if (idx < 0) return
				this.activeIndex = idx
				this.resetAndLoad()
			},
			async loadData() {
				if (this.status === 'nomore') return
				this.status = 'loading'
				try {
					const res = await fetchActivities({
						page: this.page,
						limit: this.limit
					})
					const list = res.data || []
					if (list.length < this.limit) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
					this.allActivities = this.page === 1 ? list : this.allActivities.concat(list)
					this.noMoreVisible = this.page > 1
				} catch (error) {
					uni.showToast({
						title: error.message || '加载失败',
						icon: 'none'
					})
				}
			},
			resetAndLoad() {
				this.page = 1
				this.allActivities = []
				this.status = 'loadmore'
				this.noMoreVisible = false
				this.loadData()
			},
			formatDate(val) {
				let d = val && val.$date ? val.$date : val
				d = new Date(d)
				const pad = n => String(n).padStart(2, '0')
				return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
			},
			async goDetail(id) {
				const token = uni.getStorageSync('token')
				console.log(token);
				if (!token) {
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none',
						duration: 1000,
						success() {
							setTimeout(() => {
								uni.removeStorageSync('token')
								uni.switchTab({
									url: '/pages/mine/mine'
								})
							}, 1000)
						}
					})
					return
				}
				try {
					const res = weappJwt(token)
					console.log(res);
					if (!res.remoteToken) throw new Error('Token 无效')
				} catch (err) {
					console.log(err);
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none',
						duration: 1000,
						success() {
							setTimeout(() => {
								uni.removeStorageSync('token')
								uni.switchTab({
									url: '/pages/mine/mine'
								})
							}, 1000)
						}
					})
					return
				}
				uni.navigateTo({
					url: `/pages/activity/detail?id=${id}`
				})
			}
		},
		watch: {
			searchKeyword() {
				this.resetAndLoad()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.activity-list {
		display: flex;
		flex-direction: column;
		height: 100%;

		.tabs {
			width: 100%;
			background: #fff;
		}

		.scroll {
			flex: 1;
		}

		.empty-wrap {
			padding: 60rpx;
			text-align: center;
		}

		.grid {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			padding: 16rpx;
			margin: 10rpx 24rpx;
		}

		.card {
			width: 45%;
			background: #fff;
			border-radius: 12rpx;
			overflow: hidden;
			margin-bottom: 25rpx;
			box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
		}

		.cover {
			width: 100%;
			height: 250rpx;
		}

		.info {
			padding: 16rpx;
		}

		.title {
			font-size: 26rpx;
			color: #333;
			margin-bottom: 8rpx;
		}

		.meta {
			font-size: 22rpx;
			color: #666;
			margin-bottom: 8rpx;

			.summary {
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 1;
				-webkit-box-orient: vertical;
			}
		}

		.meta .time,
		.meta .location {
			display: block;
		}

		.participants {
			display: flex;
			justify-content: space-between;
			font-size: 24rpx;
			color: #999;
		}

		.participants .current {
			color: #E53E3E;
			font-weight: bold;
		}

		.loadmore-wrap {
			padding: 16rpx;
			text-align: center;
		}
	}
</style>