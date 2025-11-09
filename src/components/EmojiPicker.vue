<template>
  <a-popover :open="open" :trigger="trigger" :placement="placement" @update:open="onOpenChange">
    <template #content>
      <div class="emoji-picker">
        <span v-for="emoji in emojis" :key="emoji" class="emoji-item" @click="handleSelect(emoji)" @mousedown.prevent>
          {{ emoji }}
        </span>
      </div>
    </template>
    <SmileOutlined :style="iconStyleComputed" />
  </a-popover>

</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { SmileOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  emojis: {
    type: Array as () => string[],
    default: () => [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
      '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
      '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
      '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
      '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
      '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
      '👍', '👎', '👏', '🙌', '🤝', '🙏', '💪', '🎉',
      '❤️', '💔', '💕', '💖', '💗', '💙', '💚', '💛'
    ],
  },
  open: {
    type: Boolean as () => boolean | undefined,
    default: undefined,
  },
  placement: {
    type: String,
    default: 'bottomLeft',
  },
  trigger: {
    type: [String, Array] as () => string | string[],
    default: 'click',
  },
  iconStyle: {
    type: [String, Object] as () => string | Record<string, string | number>,
    default: () => ({ fontSize: '18px', color: 'rgba(0,0,0,0.45)', cursor: 'pointer' }),
  },
})

const emit = defineEmits<{
  (e: 'select', emoji: string): void
  (e: 'update:open', value: boolean): void
}>()

const iconStyleComputed = computed(() => props.iconStyle)

function handleSelect(emoji: string) {
  emit('select', emoji)
  emit('update:open', false)
}

function onOpenChange(val: boolean) {
  emit('update:open', val)
}
</script>

<style scoped>
.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  max-width: 225px;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
}

.emoji-picker>* {
  min-width: 0;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  text-align: center;
}

.emoji-item:hover {
  background: #f0f0f0;
  transform: scale(1.2);
}
</style>
