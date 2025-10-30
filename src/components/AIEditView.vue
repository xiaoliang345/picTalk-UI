<template>
    <div id="AIEditView">
        <a-list :grid="{ gutter: 10, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }" :data-source="data">
            <template #renderItem="{ item }">
                <a-list-item>
                    <a-card :title="item.title">
                        <div style="text-align: center;">
                            <img :src="item.url" alt="" style="width: 80%;"></img>
                        </div>
                    </a-card>
                </a-list-item>
            </template>
        </a-list>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';


const props = defineProps({
    AIEditViewData: {
        type: Array,
        default: () => []
    }
})

const data = ref(props.AIEditViewData);

watch(() => props.AIEditViewData, (newVal) => {
    data.value = newVal;
}, { immediate: true, deep: true });
</script>

<style lang="less" scoped>
#AIEditView {
    // display: flex;
    // justify-content: space-around;

    :deep(.ant-list-item) {
        padding: 10px !important;
    }

    :deep(.ant-card-body) {
        padding: 10px !important;
    }
}
</style>