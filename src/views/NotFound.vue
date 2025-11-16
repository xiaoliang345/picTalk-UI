<template>
  <div id="not-found">
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404 - 页面未找到</h1>
        <p class="description">哎呀！看起来您遇到了一个神秘的数字序列。</p>

        <div class="number-sequence-container">
          <img src="../assets/404.png" alt="数字序列" class="number-sequence" />
        </div>

        <p class="subtext">我们找不到您要找的页面，但这里有一些有趣的东西可以思考。</p>

        <div class="actions">
          <router-link to="/" class="home-button">返回首页</router-link>
          <button @click="contactSupport" class="contact-button">联系支持</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { notification } from 'ant-design-vue'

const [api, contextHolder] = notification.useNotification();
const openNotification = () => {
  notification.open({
    message: '信息提示',
    description:
      '请发送邮件到3457674636@qq.com以获取帮助',
  });
};

const contactSupport = () => {
  // 这里可以添加联系支持的功能
  openNotification()
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  /* padding: 20px; */
}

.not-found-content {
  max-width: 800px;
  text-align: center;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #dc3545;
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.description {
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 30px;
}

.number-sequence-container {
  max-width: 500px;
  margin: 30px 0;
  overflow-x: auto;
  background-color: #f1f1f1;
  padding: 15px;
  border-radius: 5px;
}

.number-sequence {
  max-width: 100%;
  height: auto;
  display: block;
}

.subtext {
  font-size: 1rem;
  color: #6c757d;
  margin: 30px 0;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.home-button,
.contact-button {
  padding: 12px 24px;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.home-button {
  background-color: #0d6efd;
  color: white;
  border: none;
  text-decoration: none;
}

.home-button:hover {
  background-color: #0b5ed7;
}

.contact-button {
  background-color: transparent;
  color: #0d6efd;
  border: 1px solid #0d6efd;
}

.contact-button:hover {
  background-color: #e7f1ff;
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 20px;
  }

  h1 {
    font-size: 2rem;
  }

  .description {
    font-size: 1rem;
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }

  .home-button,
  .contact-button {
    width: 100%;
  }
}
</style>