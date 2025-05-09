<template>
	<view class="style-list">
		<scroll-view scroll-y class="scroll-view" @scrolltolower="loadMore" :lower-threshold="50">
			<!-- 双列网格布局 -->
			<view class="grid">
				<view v-for="item in list" :key="item._id" class="card" @click="goDetail(item._id)">
					<image :src="getImageUrl(item.images[0])" mode="aspectFill" class="cover"
						@error="handleImageError" />
					<view class="content">
						<text class="title">{{ item.title }}</text>
						<text class="subtitle">{{ item.subtitle }}</text>
						<view class="meta">
							<u-icon name="chat" size="28" color="#999"></u-icon>
							<text class="comment-count">{{ item.comments.length }}</text>
							<text class="time">{{ formatTime(item.createdAt) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<u-loadmore :status="loadStatus" :load-text="{
          loadmore: '上拉加载更多',
          loading: '加载中...',
          nomore: '没有更多了'
        }" />

			<!-- 空状态 -->
			<u-empty v-if="showEmpty" mode="list" icon="http://cdn.uviewui.com/uview/empty/list.png" marginTop="100" />
		</scroll-view>
	</view>
</template>

<script>
	import {
		fetchStyles
	} from '@/common/api/showcase.js'
	import {
		BASE_URL
	} from '@/common/http.js'

	export default {
		data() {
			return {
				BASE_URL,
				list: [],
				page: 1,
				limit: 10,
				loadStatus: 'loadmore',
				total: 0
			}
		},
		computed: {
			showEmpty() {
				return this.list.length === 0 && this.loadStatus === 'nomore'
			}
		},
		onLoad() {
			this.loadData()
		},
		methods: {
			// 获取图片地址
			getImageUrl(imgPath) {
				if (!imgPath) return '/static/default-image.png'
				return imgPath.startsWith('http') ? imgPath : BASE_URL + imgPath
			},

			// 加载数据
			async loadData() {
				if (this.loadStatus === 'nomore') return
				this.loadStatus = 'loading'

				try {
					const res = await fetchStyles({
						page: this.page,
						limit: this.limit
					})

					// 兼容三种常见接口结构
					let newList = []
					if (Array.isArray(res.data)) { // 结构1：直接返回数组
						newList = res.data
					} else if (res.data?.data) { // 结构2：标准分页格式
						newList = Array.isArray(res.data.data) ? res.data.data : []
						this.total = res.data.pagination?.total || 0
					} else if (res.data?.list) { // 结构3：自定义列表字段
						newList = Array.isArray(res.data.list) ? res.data.list : []
					}

					this.list = [...this.list, ...newList]

					if (newList.length < this.limit) {
						this.loadStatus = 'nomore'
					} else {
						this.loadStatus = 'loadmore'
						this.page++
					}
				} catch (e) {
					console.error('加载失败:', e)
					this.loadStatus = 'loadmore'
					uni.showToast({
						title: '数据加载失败',
						icon: 'none'
					})
				}
			},

			// 加载更多
			loadMore() {
				if (this.loadStatus === 'loadmore') this.loadData()
			},

			// 时间格式化
			formatTime(timestamp) {
				const date = new Date(timestamp)
				const pad = n => n.toString().padStart(2, '0')
				return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`
			},

			// 跳转详情
			goDetail(id) {
				uni.navigateTo({
					 url: '/pages/style/detail?id=' + id
				})
			},

			// 图片加载失败处理
			handleImageError(e) {
				// console.error('图片加载失败:', e.detail.errMsg)
				// e.target.src = '/static/default-image.png'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.style-list {
		min-height: 100vh;
		background: #f5f7fa;

		.scroll-view {
			height: calc(100vh - var(--window-top));
			padding: 20rpx;
			box-sizing: border-box;
		}

		.grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 20rpx;
		}

		.card {
			background: #fff;
			border-radius: 16rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		}

		.cover {
			width: 100%;
			height: 320rpx;
			background: #f8f9fa;
		}

		.content {
			padding: 24rpx;

			.title {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
				line-height: 1.4;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.subtitle {
				font-size: 24rpx;
				color: #666;
				margin: 12rpx 0;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.meta {
				display: flex;
				align-items: center;
				font-size: 22rpx;
				color: #999;

				.comment-count {
					margin: 0 8rpx;
				}

				.time {
					margin-left: auto;
				}
			}
		}
	}
</style>