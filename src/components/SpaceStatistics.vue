<template>
    <div class="space-statistics">
        <a-row :gutter="16">
            <!-- 空间使用情况 -->
            <a-col :span="publicStore.isMobile ? 24 : 6">
                <a-card title="空间使用情况" :bordered="false">
                    <div ref="spaceUsageChart" style="height: 300px"></div>
                </a-card>
            </a-col>

            <!-- 图片数量统计 -->
            <a-col :span="publicStore.isMobile ? 24 : 6">
                <a-card title="图片数量统计" :bordered="false">
                    <div ref="pictureCountChart" style="height: 300px"></div>
                </a-card>
            </a-col>

            <!-- 图片标签分布 -->
            <a-col :span="publicStore.isMobile ? 24 : 12">
                <a-card title="空间图片标签分布" :bordered="false">
                    <div ref="tagDistributionChart" style="height: 300px"></div>
                </a-card>
            </a-col>

            <!-- 图片分类分布 -->
            <a-col :span="publicStore.isMobile ? 24 : 12">
                <a-card title="空间图片分类分布" :bordered="false">
                    <div ref="categoryDistributionChart" style="height: 300px"></div>
                </a-card>
            </a-col>

            <!-- 空间图片大小分布 -->
            <a-col :span="publicStore.isMobile ? 24 : 12">
                <a-card title="空间图片分类分布" :bordered="false">
                    <div ref="spaceSizeAnalyzeChart" style="height: 300px"></div>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getSpaceCategoryAnalyzeUsingPost, getSpaceSizeAnalyzeUsingPost, getSpaceTagAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import * as echarts from 'echarts'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController';
import { usePublicStore } from '@/stores/publicStore';

const props = defineProps<{
    space: API.SpaceVO
}>()

const publicStore = usePublicStore()
const userStore = useUserStore()
const spaceUsageChart = ref<HTMLElement>()
const pictureCountChart = ref<HTMLElement>()
const tagDistributionChart = ref<HTMLElement>()
const categoryDistributionChart = ref<HTMLElement>()
const spaceSizeAnalyzeChart = ref<HTMLElement>()
let space = ref<API.SpaceVO>({}) //当前空间信息
let tagData = ref<API.SpaceTagAnalyzeResponse[]>([]) //标签和分类
let categoryData = ref<API.SpaceCategoryAnalyzeResponse[]>([]) //分类和标签
let spaceSizeAnalyzeData = ref<API.SpaceSizeAnalyzeResponse[]>([]) //空间大小统计

// 初始化图表
const initCharts = () => {
    if (!spaceUsageChart.value || !pictureCountChart.value ||
        !tagDistributionChart.value || !categoryDistributionChart.value ||
        !spaceSizeAnalyzeChart.value) {
        return
    }

    const spaceUsageInstance = echarts.init(spaceUsageChart.value)
    const pictureCountInstance = echarts.init(pictureCountChart.value)
    const tagDistributionInstance = echarts.init(tagDistributionChart.value)
    const categoryDistributionInstance = echarts.init(categoryDistributionChart.value)
    const spaceSizeAnalyzeInstance = echarts.init(spaceSizeAnalyzeChart.value)

    // 获取空间使用情况数据
    const fetchSpaceUsage = async () => {
        const data = space.value
        const usedSize = data.totalSize || 0
        const maxSize = data.maxSize || 0
        const usedCount = data.totalCount || 0
        const maxCount = data.maxCount || 0

        const percent = maxSize > 0 ? usedSize / maxSize : 0;
        let progressColor = '#43e97b'; // 默认绿色
        if (percent >= 0.6) {
            progressColor = '#ee6666'; // 红色
        } else if (percent >= 0.3) {
            progressColor = '#ffb300'; // 橙色
        }



        const percent2 = maxCount > 0 ? usedCount / maxCount : 0;
        let progressColor2 = '#43e97b'; // 默认绿色
        if (percent2 >= 0.6) {
            progressColor2 = '#ee6666'; // 红色
        } else if (percent2 >= 0.3) {
            progressColor2 = '#ffb300'; // 橙色
        }
        spaceUsageInstance.setOption({
            graphic: [{
                type: 'text',
                left: 'center',
                // top: '15%',
                style: {
                    text: `${(usedSize / 1024 / 1024).toFixed(1)}MB/${(maxSize / 1024 / 1024).toFixed(1)}MB`,
                    textAlign: 'center',
                    fill: 'black',
                    fontSize: 17,
                    lineHeight: 20
                }
            }],
            series: [{
                type: 'gauge',
                startAngle: 230,
                endAngle: -50,
                min: 0,
                max: maxSize,
                splitNumber: 0,
                radius: '75%',
                itemStyle: {
                    color: '#1890ff'
                },
                progress: {
                    show: true,
                    roundCap: true,
                    width: 18,
                    itemStyle: {
                        color: progressColor
                    }
                },
                pointer: {
                    show: false
                },
                axisLine: {
                    roundCap: true,
                    lineStyle: {
                        width: 18,
                        color: [[1, '#f0f0f0']]
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                detail: {
                    width: 50,
                    height: 14,
                    fontSize: 20,
                    color: '#1890ff',
                    offsetCenter: [0, '0%'],
                    formatter: function () {
                        return `${(usedSize / maxSize * 100).toFixed(1)}%`
                    }
                },
                data: [{
                    value: usedSize,
                    name: ''
                }]
            }]
        })

        pictureCountInstance.setOption({
            graphic: [{
                type: 'text',
                left: 'center',
                // top: '15%',
                style: {
                    text: `${usedCount}/${maxCount}(张)`,
                    textAlign: 'center',
                    fill: 'black',
                    fontSize: 17,
                    lineHeight: 20
                }
            }],
            series: [{
                type: 'gauge',
                startAngle: 230,
                endAngle: -50,
                min: 0,
                max: maxCount,
                splitNumber: 0,
                radius: '75%',
                itemStyle: {
                    color: '#1890ff'
                },
                progress: {
                    show: true,
                    roundCap: true,
                    width: 18,
                    itemStyle: {
                        color: progressColor2
                    }
                },
                pointer: {
                    show: false
                },
                axisLine: {
                    roundCap: true,
                    lineStyle: {
                        width: 18,
                        color: [[1, '#f0f0f0']]
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                detail: {
                    width: 50,
                    height: 14,
                    fontSize: 20,
                    color: '#1890ff',
                    offsetCenter: [0, '0%'],
                    formatter: function () {
                        return `${(usedCount / maxCount * 100).toFixed(1)}%`
                    }
                },
                data: [{
                    value: usedCount,
                    name: ''
                }]
            }]
        })
    }

    // 获取标签统计数据
    const fetchTagData = async () => {
        categoryDistributionInstance.setOption({
            title: {
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: '{b}: {c}张'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: categoryData.value.map(item => item.category),
                axisLabel: {
                    interval: 0,
                    rotate: 30,
                    color: '#666',
                    fontSize: 12
                },
                axisLine: {
                    lineStyle: {
                        color: '#ddd'
                    }
                },
                axisTick: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                name: '图片数量',
                nameTextStyle: {
                    color: '#666',
                    padding: [0, 0, 0, 40]
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#eee'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            series: [{
                type: 'bar',
                data: categoryData.value.map(item => item.count),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#83bff6' },
                        { offset: 0.5, color: '#188df0' },
                        { offset: 1, color: '#188df0' }
                    ]),
                    borderRadius: [4, 4, 0, 0]
                },
                barWidth: '50%',
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#2378f7' },
                            { offset: 0.7, color: '#2378f7' },
                            { offset: 1, color: '#83bff6' }
                        ])
                    }
                },
                animationDelay: function (idx: number) {
                    return idx * 100;
                }
            }],
            animationDuration: 1000,
            animationEasing: 'elasticOut'
        })
    }

    // 获取分类统计数据
    const fetchCategoryData = async () => {
        tagDistributionInstance.setOption({
            title: {
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: '{b}: {c}张'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: tagData.value.map(item => item.tag),
                axisLabel: {
                    interval: 0,
                    rotate: 30,
                    color: '#666',
                    fontSize: 12
                },
                axisLine: {
                    lineStyle: {
                        color: '#ddd'
                    }
                },
                axisTick: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                name: '图片数量',
                nameTextStyle: {
                    color: '#666',
                    padding: [0, 0, 0, 40]
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#eee'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            series: [{
                type: 'bar',
                data: tagData.value.map(item => item.count),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#83bff6' },
                        { offset: 0.5, color: '#188df0' },
                        { offset: 1, color: '#188df0' }
                    ]),
                    borderRadius: [4, 4, 0, 0]
                },
                barWidth: '50%',
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#2378f7' },
                            { offset: 0.7, color: '#2378f7' },
                            { offset: 1, color: '#83bff6' }
                        ])
                    }
                },
                animationDelay: function (idx: number) {
                    return idx * 100;
                }
            }],
            animationDuration: 1000,
            animationEasing: 'elasticOut'
        })
    }

    // 获取空间大小统计数据
    const fetchSpaceSizeData = async () => {
        spaceSizeAnalyzeInstance.setOption({
            title: {
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: { show: false }, // 不显示tooltip
            legend: {
                orient: 'vertical',
                left: "30px",
                top: 'middle',
                formatter: function (name: string) {
                    return name
                }
            },
            series: [{
                name: '图片大小分布',
                type: 'pie',
                radius: ['0%', '70%'],
                center: ['60%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'inside',
                    formatter: '{d}%', // 只显示百分比
                    fontSize: 16,
                    color: '#fff',
                    fontWeight: 'bold'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold'
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                data: spaceSizeAnalyzeData.value.map((item, index) => {
                    // 定义一组纯色
                    const colors = [
                        '#5470c6',
                        '#91cc75',
                        '#fac858',
                        '#ee6666',
                        '#73c0de',
                        '#3ba272',
                        '#fc8452',
                        '#9a60b4',
                        '#ea7ccc'
                    ]
                    return {
                        name: item.sizeRange || '未知',
                        value: item.count || 0,
                        itemStyle: {
                            color: colors[index % colors.length]
                        }
                    }
                })
            }]
        })
    }

    // 初始化数据
    fetchSpaceUsage()
    fetchCategoryData()
    fetchTagData()
    fetchSpaceSizeData()

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        spaceUsageInstance.resize()
        pictureCountInstance.resize()
        tagDistributionInstance.resize()
        categoryDistributionInstance.resize()
        spaceSizeAnalyzeInstance.resize()
    })
}

// 根据id获取空间
async function getSpaceById() {
    const res = await getSpaceVoByIdUsingGet({ id: userStore.showSpaceId })
    if (res.data.code == 200) {
        space.value = res.data.data ?? {}
    }
}

// 获取空间标签统计数据
async function getSpaceTagAnalyze() {
    const res = await getSpaceTagAnalyzeUsingPost({
        spaceId: userStore.showSpaceId,
    })
    if (res.data.code == 200) {
        tagData.value = res.data.data ?? []
        console.log(tagData.value);

    }
}

// 获取空间分类统计数据
async function getSpaceCategoryAnalyze() {
    const res = await getSpaceCategoryAnalyzeUsingPost({
        spaceId: userStore.showSpaceId,
    })
    if (res.data.code == 200) {
        categoryData.value = res.data.data ?? []
        categoryData.value = categoryData.value.filter(item => {
            if (item.category != null && item.category != '') return true;
            return false;
        })

    }
}

// 获取空间大小统计数据
async function getSpaceSizeAnalyze() {
    const res = await getSpaceSizeAnalyzeUsingPost({
        spaceId: userStore.showSpaceId,
    })
    if (res.data.code == 200) {
        spaceSizeAnalyzeData.value = res.data.data ?? []
        spaceSizeAnalyzeData.value = spaceSizeAnalyzeData.value.filter(item => item.count != 0)
    }
}

onMounted(async () => {
    await getSpaceById()
    await getSpaceTagAnalyze()
    await getSpaceCategoryAnalyze()
    await getSpaceSizeAnalyze()
    initCharts()
});
</script>

<style scoped lang="less">
.space-statistics {

    :deep(.space-title) {
        flex-wrap: wrap;
    }

    :deep(.ant-card-head) {
        border: 1px solid #f0f0f0;
    }

    :deep(.ant-card) {
        margin-bottom: 16px;
    }
}
</style>
