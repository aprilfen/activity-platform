<template>
	<view class="detail-container" v-if="isLoaded">
		<!-- 头部轮播图 -->
		<u-swiper :list="swiperList" height="500" :autoplay="false" indicatorMode="line"
			indicatorActiveColor="#409EFF" />

		<!-- 内容区域 -->
		<view class="content-wrapper">
			<text class="title">{{ detail.title }}</text>
			<text class="subtitle">{{ detail.subtitle }}</text>
			<!-- <view class="meta">
				<text class="time">发布时间：{{ formatTime(detail.createdAt) }}</text>
			</view> -->
			<view class="content-text">
				<!-- ✅ 内容使用 rich-text 显示 HTML -->
				<rich-text v-if="detail.content" :nodes="detail.content"></rich-text>
				<text v-else style="color: #ccc;">暂无内容</text>
			</view>
		</view>

		<!-- 评论区 -->
		<view class="comment-section" v-if="detail.comments.length > 0">
			<view class="section-title">
				<text>全部评论（{{ detail.comments.length }}）</text>
			</view>
			<view v-for="(comment, index) in detail.comments" :key="index" class="comment-item">
				<u-avatar :src="comment.avatar || '/static/default-avatar.png'" size="40" />
				<view class="comment-content">
					<text class="author">{{ comment.author }}</text>
					<text class="text">{{ comment.content }}</text>
					<text class="comment-time">{{ formatCommentTime(comment.date) }}</text>
				</view>
			</view>
		</view>

		<!-- 无评论提示 -->
		<u-empty v-else mode="comment" icon="https://cdn.uviewui.com/uview/demo/empty/comment.png" marginTop="60"
			text="暂无评论" />
	</view>

	<!-- 加载中提示 -->
	<u-empty v-else mode="data" icon="https://cdn.uviewui.com/uview/demo/empty/data.png" text="正在加载风采内容..." marginTop="200" />
</template>

<script>
	import {
		getStyleDetail
	} from '@/common/api/showcase.js'
	import {
		BASE_URL
	} from '@/common/http.js'

	export default {
		data() {
			return {
				detail: {
					title: '',
					subtitle: '',
					content: '',
					createdAt: '',
					images: [],
					comments: []
				},
				isLoaded: false
			}
		},
		computed: {
			swiperList() {
				return this.detail.images ? this.detail.images.map(img => BASE_URL + img) : []
			}
		},
		onLoad(options) {
			if (options.id) this.loadDetail(options.id)
		},
		methods: {
			async loadDetail(id) {
				uni.showLoading({
					title: '加载中...'
				})
				try {
					const res = await getStyleDetail(id)
					this.detail = res || {}
					console.log(this.detail);
					// if (!this.detail.comments) this.detail.comments = []
					// if (!this.detail.images) this.detail.images = []
					this.isLoaded = true
				} catch (err) {
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},
			formatTime(ts) {
				if (!ts) return ''
				const date = new Date(ts)
				const pad = n => n.toString().padStart(2, '0')
				return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
			},
			formatCommentTime(dateStr) {
				return this.formatTime(new Date(dateStr))
			}
		}
	}
</script>

<style lang="scss" scoped>
	.detail-container {
		background: #fff;
		padding-bottom: 40rpx;

		.content-wrapper {
			padding: 32rpx;

			.title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				line-height: 1.4;
			}

			.subtitle {
				font-size: 28rpx;
				color: #666;
				margin: 20rpx 0;
				display: block;
			}

			.meta {
				margin-bottom: 24rpx;

				.time {
					font-size: 24rpx;
					color: #999;
				}
			}

			.content-text {
				font-size: 28rpx;
				color: #333;
				line-height: 1.8;
			}
		}

		.comment-section {
			padding: 0 32rpx;
			margin-top: 40rpx;

			.section-title {
				font-size: 32rpx;
				font-weight: bold;
				padding-bottom: 24rpx;
				border-bottom: 1rpx solid #eee;
			}

			.comment-item {
				display: flex;
				padding: 24rpx 0;
				border-bottom: 1rpx solid #f5f5f5;

				.comment-content {
					margin-left: 20rpx;
					flex: 1;

					.author {
						font-size: 28rpx;
						color: #409EFF;
						font-weight: 500;
					}

					.text {
						font-size: 26rpx;
						color: #333;
						margin: 12rpx 0;
						line-height: 1.6;
					}

					.comment-time {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
		}
	}
</style>