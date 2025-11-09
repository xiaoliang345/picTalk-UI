<template>
  <div v-if="!comments || !comments.length" class="empty-comments">
    暂无评论
  </div>
  <div v-else class="comment-tree">
    <CommentNode v-for="comment in comments" :key="comment.id" :comment="comment" @fetchPost="emits('fetchPost')" />
  </div>
</template>

<script lang="ts" setup>
import CommentNode from './CommentNode.vue'

defineProps<{
  comments: API.Comment[]
}>()

const emits = defineEmits(["fetchPost"])
</script>

<style scoped>
.comment-tree {
  display: flex;
  flex-direction: column;
  /* gap: 12px; */
}

.empty-comments {
  color: rgba(0, 0, 0, 0.45);
  padding: 12px 0;
}
</style>
