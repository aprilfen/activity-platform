<template>
  <div class="location-input">
    <el-autocomplete v-model="address" :fetch-suggestions="querySearch" placeholder="输入地址或点击地图选择" @select="handleSelect"
      clearable>
      <template #default="{ item }">
        <div class="address-item">
          <div class="name">{{ item.name }}</div>
          <div class="address">{{ item.address }}</div>
        </div>
      </template>
    </el-autocomplete>

    <div id="map-container" class="map-box"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import AMapLoader from '@amap/amap-jsapi-loader'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ address: '', lng: null, lat: null })
  }
})

const emit = defineEmits(['update:modelValue'])

const address = ref(props.modelValue.address)
let map = null
let marker = null
let AMapInstance = null  // 保存AMap实例
let geocoder = null      // 地理编码器实例
let autoComplete = null  // 自动完成实例

// 初始化地图和插件
const initMap = async () => {
  try {
    AMapInstance = await AMapLoader.load({
      key: "904ba4b1c7867974a56f6532848ccee7",
      version: "2.0",
      plugins: ['AMap.Geocoder', 'AMap.AutoComplete']
    })
    // 创建地图实例
    map = new AMapInstance.Map('map-container', {
      zoom: 13,
      center: [116.397428, 39.90923]
    })
      // 如果有有效坐标则使用
  if (props.lng && props.lat && !isNaN(props.lng) && !isNaN(props.lat)) {
    center = [Number(props.lng), Number(props.lat)]
  }
    // 初始化地理编码器
    geocoder = new AMapInstance.Geocoder({
      radius: 1000,
      city: "全国",
      extensions: "all"
    })

    // 初始化自动完成
    autoComplete = new AMapInstance.AutoComplete({
      city: '全国'
    })

    // 添加地图点击监听
    map.on('click', handleMapClick)

  } catch (error) {
    console.error('高德地图初始化失败:', error)
    ElMessage.error('地图加载失败，请稍后重试')
  }
}

// 地图点击处理
const handleMapClick = async (e) => {
  try {
    const { lng, lat } = e.lnglat

    const addr = await getAddressByLngLat(lng, lat)
    address.value = addr
    updateMarker(lng, lat)
    emitUpdate(addr, lng, lat)
  } catch (error) {
    console.log(error.message);

    ElMessage.error(error.message)
  }
}



// 更新标记点
const updateMarker = (lng, lat) => {
  if (marker) {
    map.remove(marker)
  }
  marker = new AMapInstance.Marker({
    position: [lng, lat],
    map: map
  })
  map.setCenter([lng, lat])
}

// 反向地理编码
const getAddressByLngLat = (lng, lat) => {
  return new Promise((resolve, reject) => {
    geocoder.getAddress([lng, lat], (status, result) => {
      if (status === 'complete' && result.regeocode) {
        resolve(result.regeocode.formattedAddress || formatAddress(result.regeocode))
      } else {
        reject(new Error(result.info || '地址解析失败'))
      }
    })
  })
}

// 地址格式化备用方案
const formatAddress = (regeocode) => {
  const comp = regeocode.addressComponent
  return [comp.province, comp.city, comp.district, comp.township, comp.street, comp.streetNumber]
    .filter(Boolean)
    .join('')
}

// 地址搜索建议
const querySearch = (queryString, cb) => {
  if (!queryString) return cb([])

  autoComplete.search(queryString, (status, result) => {
    if (status === 'complete') {
      const suggestions = result.tips.map(tip => ({
        ...tip,
        value: tip.address,
        name: tip.name,
        address: tip.address || ''
      }))
      cb(suggestions)
    } else {
      cb([])
    }
  })
}

// 选择建议项
const handleSelect = (item) => {
  geocoder.getLocation(item.address, (status, result) => {
    if (status === 'complete' && result.geocodes?.length) {
      const pos = result.geocodes[0].location
      if (!pos) {
        ElMessage.error('未找到坐标信息')
        return
      }
      address.value = item.address
      updateMarker(pos.lng, pos.lat)
      emitUpdate(item.address, pos.lng, pos.lat)
    } else {
      ElMessage.error(result?.info || '地址定位失败')
    }
  })
}

// 统一触发更新
const emitUpdate = (address, lng, lat) => {
  emit('update:modelValue', { address, lng, lat })
}

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  if (newVal.address !== address.value) {
    address.value = newVal.address
    if (newVal.lng && newVal.lat) {
      updateMarker(newVal.lng, newVal.lat)
    }
  }
})

onMounted(initMap)
</script>

<style scoped>
.map-box {
  height: 370px;
  width: 370px;
  margin-top: 10px;
}

.address-item .name {
  font-weight: bold;
}

.address-item .address {
  color: #666;
  font-size: 12px;
}
</style>