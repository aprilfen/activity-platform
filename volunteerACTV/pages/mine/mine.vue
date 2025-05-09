<template>
	<view class="page-mine">
		<!-- 头部区域 -->
		<view class="header" @click="!isLogged && showLoginModal()">
			<view class="avatar-wrapper">
				<image :src="isLogged ? userInfo.avatar : '/static/tabbar/wode1.png'" class="avatar"
					mode="aspectFill" />
			</view>
			<view class="text-area">
				<view v-if="!isLogged" class="login-text">点击登录/注册</view>
				<view v-else class="user-info">
					<view class="name-row">
						<text class="name">{{ userInfo.name }}</text>
						<text class="sex">{{ userInfo.sex }}</text>
					</view>
					<text class="phone">{{ userInfo.phone }}</text>
				</view>
			</view>
		</view>

		<!-- 登录弹窗 -->
		<u-modal :show="showLogin" title="用户登录" :asyncClose="true" @confirm="doLogin" @cancel="handleCancelLogin"
			@close="handleCancelLogin" :showCancelButton="true">
			<view class="login-content">
				<u-input v-model="loginForm.username" placeholder="请输入用户名" clearable border="none" class="input-item">
					<template #prefix>
						<u-icon name="account" size="20" color="#999" />
					</template>
				</u-input>

				<u-input v-model="loginForm.password" placeholder="请输入密码" password clearable border="none"
					class="input-item">
					<template #prefix>
						<u-icon name="lock" size="20" color="#999" />
					</template>
				</u-input>

				<view class="code-wrapper">
					<u-input v-model="loginForm.code" placeholder="验证码" border="none" class="code-input">
						<template #prefix>
							<u-icon name="lock" size="20" color="#999" />
						</template>
					</u-input>
					<image :src="captcha.img" class="captcha-img" mode="widthFix" @click="loadCaptcha" />
				</view>
			</view>
		</u-modal>

		<!-- 功能卡片 -->
		<view class="card-container" v-if="isLogged">
			<view class="card-grid">
				<view class="card-item" v-for="(c, i) in cards" :key="i">
					<view class="card-icon" :style="{ backgroundColor: colors[i] }">
						<u-icon :name="c.icon" size="32" color="#fff" />
					</view>
					<view class="card-content">
						<text class="value">{{ c.value }}</text>
						<text class="label">{{ c.label }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		getVerificationCode,
		loginWithEncryptedData,
		getKey
	} from '@/common/api/auth.js'
	import RSAencrypt from '@/public/index.js'
	import weappJwt from '@/js_sdk/t-jwt/JWT/weapp-jwt.js'

	export default {
		data() {
			return {
				isLogged: false, // 登录状态
				showLogin: false, // 控制登录弹窗显示
				loginForm: {
					username: '522122200009237439', // 学号或用户名
					password: 'Cheng201005', // 密码
					imgkey: '', // 验证码 key
					code: '' // 验证码
				},
				captcha: {
					img: '', // 验证码图片
					imgkey: '' // 验证码 key
				},
				userInfo: {
					avatar: '',
					name: '',
					sex: '',
					phone: '',
					age: 0,
					address: '',
					username: '',
					email: '',
					duration: 0, // 志愿时长
					activities: 0, // 志愿活动数
					groups: [], // 所属团体列表
					training: 0 // 培训时长
				}
			}
		},
		computed: {
			// 四张信息卡：志愿时长、活动数、团体数、培训时长
			cards() {
				return [{
						label: '志愿时长',
						value: this.userInfo.duration,
						icon: 'clock'
					},
					{
						label: '志愿活动',
						value: this.userInfo.activities,
						icon: 'list'
					},
					{
						label: '志愿团体',
						value: this.userInfo.groups.length,
						icon: 'plus-people-fill'
					},
					{
						label: '培训时长',
						value: this.userInfo.training,
						icon: 'share'
					}
				]
			}
		},

		// 页面加载时恢复本地登录状态
		onLoad() {
			this.restoreLoginState()
		},
		onShow() {
			this.restoreLoginState()
		},

		methods: {
			// 从本地存储恢复登录状态和用户信息
			restoreLoginState() {
				const token = uni.getStorageSync('token')
				const storedUser = uni.getStorageSync('userInfo')
				if (token && storedUser) {
					try {
						const decoded = weappJwt(token)
						if (decoded && decoded.exp * 1000 > Date.now()) {
							this.isLogged = true
							if (storedUser) {
								this.userInfo = storedUser
							}
							return
						}
					} catch {}
				}
				// 未登录或已过期：清理并重置
				uni.removeStorageSync('token')
				uni.removeStorageSync('userInfo')
				this.isLogged = false
				// 清空 userInfo，保持界面一致
				this.userInfo = {
					avatar: '',
					name: '',
					sex: '',
					phone: '',
					age: 0,
					address: '',
					username: '',
					email: '',
					duration: 0,
					activities: 0,
					groups: [],
					training: 0
				}
			},

			// 打开登录弹窗并加载验证码
			showLoginModal() {
				this.showLogin = true
				this.loadCaptcha()
			},

			// 取消登录：隐藏弹窗
			handleCancelLogin() {
				this.showLogin = false
			},

			// 拉取验证码
			async loadCaptcha() {
				try {
					const keyRes = await getKey()
					const emptyData = RSAencrypt('{}', keyRes.data)
					const capRes = await getVerificationCode(emptyData)
					if (capRes.code === 200) {
						this.captcha.img = capRes.data.img
						this.captcha.imgkey = capRes.data.imgkey
						this.loginForm.imgkey = capRes.data.imgkey
					}
				} catch {
					uni.showToast({
						title: '验证码加载失败',
						icon: 'none'
					})
				}
			},

			// 登录表单校验
			validateForm() {
				if (!this.loginForm.username.trim()) {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					})
					return false
				}
				if (!this.loginForm.password) {
					uni.showToast({
						title: '请输入密码',
						icon: 'none'
					})
					return false
				}
				if (!this.loginForm.code) {
					uni.showToast({
						title: '请输入验证码',
						icon: 'none'
					})
					return false
				}
				return true
			},

			// 执行登录
			async doLogin() {
				if (!this.validateForm()) return

				try {
					// 获取公钥并加密表单
					const keyRes = await getKey()
					const encrypted = await RSAencrypt(
						JSON.stringify(this.loginForm),
						keyRes.data
					)
					// 登录请求
					const res = await loginWithEncryptedData(encrypted)
					if (res.code === 200) {
						this.handleLoginSuccess(res)
					} else {
						this.handleLoginError(res.msg)
					}
				} catch (err) {
					console.error(err)
					this.handleLoginError('网络异常')
				}
			},

			// 登录成功后处理
			handleLoginSuccess(res) {
				uni.setStorageSync('token', res.token)
				const d = res.data

				this.userInfo = {
					avatar: d.cardUrl,
					name: d.realName,
					sex: d.sex,
					phone: d.phone,
					age: d.age,
					address: d.address,
					username: d.username,
					email: d.email,
					duration: Number(d.totalHours) || 0,
					activities: Number(d.training) || 0,
					groups: d.groups.split(',') || [], // 假设后端返回 groups
					training: Number(d.training) || 0
				}
				uni.setStorageSync('userInfo', this.userInfo)
				this.isLogged = true
				this.showLogin = false
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				})
			},

			// 登录失败后处理
			handleLoginError(msg) {
				uni.showToast({
					title: msg || '登录失败',
					icon: 'none'
				})
				this.loadCaptcha()
			},
			logout() {
				uni.removeStorageSync('token')
				uni.removeStorageSync('userInfo')
				this.isLogged = false
				uni.showToast({
					title: '已退出登录',
					icon: 'success'
				})
			}

		}
	}
</script>

<style lang="scss" scoped>
	.page-mine {
		background: #f8f8f8;
		min-height: 100vh;

		.header {
			background: linear-gradient(135deg, #f14e44, #ff6b6b);
			padding: 80rpx 40rpx 120rpx;
			display: flex;
			align-items: center;
			border-radius: 0 0 40rpx 40rpx;
			box-shadow: 0 8rpx 24rpx rgba(241, 78, 68, 0.2);

			.avatar-wrapper {
				width: 140rpx;
				height: 140rpx;
				border-radius: 50%;
				overflow: hidden;
				border: 4rpx solid rgba(255, 255, 255, 0.3);
				background: #fff;
			}

			.text-area {
				margin-left: 40rpx;
				flex: 1;

				.login-text {
					color: #fff;
					font-size: 40rpx;
					font-weight: 500;
					letter-spacing: 2rpx;
				}

				.user-info {
					.name-row {
						display: flex;
						align-items: baseline;
						margin-bottom: 16rpx;

						.name {
							color: #fff;
							font-size: 44rpx;
							font-weight: bold;
							margin-right: 24rpx;
						}

						.sex {
							color: rgba(255, 255, 255, 0.9);
							font-size: 32rpx;
						}
					}

					.phone {
						color: rgba(255, 255, 255, 0.9);
						font-size: 32rpx;
					}
				}
			}
		}

		.login-content {
			padding: 0 40rpx;

			.input-item {
				margin-bottom: 40rpx;
				background: #f8f8f8;
				border-radius: 16rpx;
				padding: 24rpx 32rpx;
			}

			.code-wrapper {
				display: flex;
				align-items: center;
				gap: 24rpx;

				.code-input {
					flex: 1;
				}

				.captcha-img {
					width: 240rpx;
					height: 80rpx;
					border-radius: 12rpx;
					border: 1rpx solid #eee;
				}
			}
		}

		.card-container {
			padding: 0 40rpx 40rpx;
			margin-top: -60rpx;

			.card-grid {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 40rpx;

				.card-item {
					background: #fff;
					border-radius: 24rpx;
					padding: 40rpx;
					box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
					display: flex;
					align-items: center;

					.card-icon {
						width: 100rpx;
						height: 100rpx;
						border-radius: 24rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 32rpx;
					}

					.card-content {
						flex: 1;

						.value {
							display: block;
							font-size: 44rpx;
							color: #333;
							font-weight: bold;
							margin-bottom: 12rpx;
						}

						.label {
							font-size: 28rpx;
							color: #666;
						}
					}
				}
			}
		}
	}

	/* uView 2.x 弹窗样式覆盖 */
	::v-deep .u-modal {
		&__content {
			padding: 40rpx 0 0 !important;
		}

		&__footer {
			padding: 40rpx 0 !important;
		}

		.u-input {
			margin: 10rpx 0;
		}

		.u-modal__button-group {
			.u-button {
				height: 100rpx !important;
				font-size: 32rpx !important;
			}
		}

	}
</style>