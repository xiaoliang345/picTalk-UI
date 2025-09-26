<template>
    <a-progress v-if="progress > 0" :percent="progress" :times="times" />
</template>
<script setup lang="ts">

interface Props {
    progress: number;
    times: number;
}

const props = defineProps<Props>()
</script>
<style scoped lang="scss"></style>
