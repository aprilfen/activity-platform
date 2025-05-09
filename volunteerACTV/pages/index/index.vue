<template>
	<view class="home">
		<!-- 轮播图（保持不变） -->
		<u-swiper class="home-swiper" :list="swiperList" indicator indicator-dots autoplay interval="3000"
			duration="500" height="400" indicator-color="rgba(255,255,255,0.5)" active-indicator-color="#FFFFFF" />

		<!-- 功能图标 -->
		<view class="func-list">
			<view v-for="(item, idx) in funcList" :key="idx" class="func-item" :style="{ backgroundColor: item.color }"
				@click="onItemClick(item)">
				<image :src="item.icon" class="icon" mode="widthFix" />
				<view class="label">{{ item.label }}</view>
			</view>
		</view>

		<!-- 志愿者注册  -->
		<view class="reg-card" @click="goPage('/pages/register/volunteer')">
			<image src="/static/image/rgin.png" class="reg-icon" mode="widthFix" />
			<view class="reg-text">
				<view class="reg-label">志愿者登录</view>
				<view class="reg-subtitle">登录，开启公益之旅</view>
			</view>
		</view>

		<!-- 底部 Banner -->
		<view class="banner-wrap">
			<image class="banner-img" src="/static/image/poster.jpg" mode="widthFix" />
		</view>
		<!-- 活动组件 -->
		<view class="page">
			<ActivityList />
		</view>
	</view>
</template>

<script>
	import ActivityList from '@/components/ActivityList.vue'
	export default {
		data() {
			return {
				swiperList: [
					'/static/image/1.jpg',
					'/static/image/2.jpg',
					'/static/image/3.jpg'
				],
				funcList: [{
						icon: '/static/image/czzyw.png',
						label: '中国志愿者网',
						color: '#FFE4E1',
						link: 'https://mp.weixin.qq.com/...中国志愿者网公众号链接...'
					},
					{
						icon: '/static/image/logo.png',
						label: '梓云志愿者',
						color: '#E6F7FF',
						link: 'https://mp.weixin.qq.com/...梓云志愿者公众号链接...'
					},
					{
						icon: '/static/image/new.png',
						label: '最新活动',
						color: '#FFF4E6',
						link: '/pages/activity/activity'
					},
					{
						icon: '/static/image/rank.png',
						label: '积分排名',
						color: '#E8F5E9',
						link: '/pages/rank/index'
					}
				],
				tabPages: [
					'/pages/activity/activity',
					'/pages/rank/index'
				]
			};
		},
		methods: {
			onItemClick(item) {
				if (item.link.startsWith('http')) {
					this.openLink(item.link);
				} else {
					this.goPage(item.link);
				}
			},
			openLink(url) {
				uni.navigateTo({
					url: `/pages/webview/index?url=${encodeURIComponent(url)}`
				});
			},
			goPage(path) {
				if (this.tabPages.includes(path)) {
					uni.switchTab({
						url: path
					});
				} else {
					uni.navigateTo({
						url: path
					});
				}
			}
		},
		components: {
			ActivityList
		}
	};
</script>

<style lang="scss" scoped>
	.home {
		background: #f5f5f5;

		.home-swiper {
			width: 100%;
			margin-bottom: 20rpx;
		}

		/* 一行四个，不换行 */
		.func-list {
			display: flex;
			justify-content: space-between;
			padding: 0 20rpx;
			flex-wrap: nowrap;
			margin-bottom: 30rpx;
			padding: 30rpx;
			background-color: #ffffff;

			.func-item {
				width: 130rpx;
				height: 130rpx;
				border-radius: 20rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				.icon {
					width: 80rpx;
					height: 80rpx;
				}
				.label {
					margin-top: 10rpx;
					font-size: 18rpx;
					color: #333;
				}
			}
		}





		

		/* 注册卡片 */
		.reg-card {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			background: #fff;
			padding: 30rpx;
			height: 45rpx;
		}

		.reg-icon {
			width: 150rpx;
			height: 150rpx;
			margin-right: 50rpx;
			padding-left: 30rpx;
		}

		.reg-text {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		.reg-label {
			font-size: 24rpx;
			color: #333;
			text-align: center;
		}

		.reg-subtitle {
			margin-top: 8rpx;
			font-size: 18rpx;
			color: #888;
			text-align: center;
		}

		.banner-wrap {
			padding: 20 20rpx;
			width: 100%;
			height: 160rpx;
			overflow: hidden;
			border-radius: 8rpx;

			.banner-img {
				width: 100%;
				transform: translateY(-60rpx)
			}
		}
	}
</style>