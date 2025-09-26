<template>
  <div id="basiclayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <a-layout-sider v-show="!publicStore.isFold" class="sider" ref="siderRef">
          <sider></sider>
        </a-layout-sider>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <!-- 折叠按钮 -->
      <a-button ref="collapsedBtn" v-show="publicStore.isMobile" class="collapsed-button" type="primary"
        style="margin-bottom: 16px" @click="toggleCollapsed">
        <MenuFoldOutlined v-if="publicStore.isFold" />
        <MenuUnfoldOutlined v-else />

      </a-button>

    </a-layout>
  </div>
</template>

<script setup lang="ts">
//@ts-ignore
import GlobalHeader from '@/components/GlobalHeader.vue'
import Sider from '@/components/Sider.vue'
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
import { usePublicStore } from '@/stores/publicStore';

const publicStore = usePublicStore();
const siderRef = ref(null);
const collapsedBtn = ref(null);

const toggleCollapsed = () => {
  publicStore.isFold = !publicStore.isFold;
};

const changeFold = () => {
  nextTick(() => {
    const sider = document.querySelector('.ant-layout-sider');
    if (publicStore.isFold) {
      sider.style.minWidth = '0px';
      sider.style.width = '0px';
      collapsedBtn.value.$el.style.left = '0px';
    } else {
      sider.style.minWidth = '200px';
      sider.style.width = '200px';
      collapsedBtn.value.$el.style.left = '200px';
    }
  })
}

const handleResize = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'windows phone', 'mobile'];

  // 检测是否包含移动端关键词
  let flag = mobileKeywords.some(keyword => userAgent.includes(keyword));
  if (flag || window.innerWidth < 500) {
    publicStore.isMobile = true;
  } else {
    publicStore.isMobile = false;
  }
  publicStore.isFold = publicStore.isMobile;
  changeFold();
}

watch(() => publicStore.isFold, (newValue) => {
  console.log("页面跳转，折叠状态改变", newValue);
  changeFold()
})

window.addEventListener('resize', () => {
  handleResize()
})

onMounted(() => {
  handleResize()
})
</script>

<style scoped lang="less">
#basiclayout {

  .header {
    padding: 0px 20px;
    background-color: white;
  }

  :deep(.ant-layout-sider) {
    background: white;
  }

  :deep(.ant-layout-sider-trigger) {
    position: absolute;
    top: 0;
    color: black;
    background-color: white;
  }

  .content {
    margin: 15px;
    padding: 20px;
    background: white;
    border-radius: 10px;

    .sider {
      text-align: center;
      line-height: 120px;
      color: #fff;
      background-color: #3ba0e9;
    }
  }

  .footer {
    width: 100%;
    background-color: #efefef;
    text-align: center;
  }
}

@media (max-width: 500px) {
  #basiclayout {

    .content {
      margin: 10px 7px;
    }

    .collapsed-button {
      position: absolute;
      top: 70px;
      left: 200px;
      z-index: 100;
      transition: all 0.2s;
    }

    :deep(.ant-layout-sider) {
      position: absolute;
      z-index: 100;
      // height: 100vh;
      transition: all 0.2s;
    }
  }
}
</style>
