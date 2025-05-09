<template>
	<view class="activity-page">
		<!-- 搜索框 -->
		<view class="search-wrap">
			<u-search v-model="searchKeyword" placeholder="搜索活动名称" clearable @confirm="onSearch" @clear="onClear" />
		</view>

		<!-- 活动列表 -->
		<ActivityList :search-keyword="searchKeyword" />
	</view>
</template>

<script>
	import ActivityList from '@/components/ActivityList.vue'

	export default {
		components: {
			ActivityList
		},
		data() {
			return {
				searchKeyword: ''
			}
		},
		methods: {
			onSearch() {
				// 触发子组件重新渲染
			},
			onClear() {
				// 清空后自动重新渲染
			}
		}
	}
</script>

<style lang="scss" scoped>
	.activity-page {
		background: #f5f5f5;
		min-height: 100vh;
	}

	.search-wrap {
		padding: 16rpx 20rpx;
		background: #fff;

		.u-search {
			background: #f0f0f0;
			border-radius: 34rpx;
		}
	}
</style>