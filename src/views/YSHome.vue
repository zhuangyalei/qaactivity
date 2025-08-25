<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, Loading } from 'vant'
import http from '../utils/http'

// const route = useRoute()
const router = useRouter()
const isLoading = ref(true)

onMounted(async () => {
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025ysjs' })

  // 获取用户信息
  const postData = {
    head: { auth },
  }

  const res = (
    await http.post(import.meta.env.VITE_DOCTOR_API_URL + '/api/user/v3/getUserInfo', postData)
  ).data
  isLoading.value = false
  if (res.responseStatus.errorcode > 0) {
    return
  }
  // console.log('res =>', res)
  const {
    level,
    userInfo: { userType, realName },
    idCards: [idCard1, idCard2],
    professionInfo: { companyInfo: { companyName, deptName, deptTitle } = {} },
  } = res
  if (level === 2 && userType !== 1) {
    // 提示仅限医务工作者参与
    showDialog({
      title: `提示`,
      message: `本活动仅限受邀医务工作者参与，您的身份不符合参与条件，如您确需参与请与客服联系`,
      beforeClose: () => false,
      confirmButtonDisabled: true,
    }).then(() => { })
    return
  }
  if (
    userType !== 1 ||
    !realName ||
    !idCard1 ||
    !idCard2 ||
    !companyName ||
    !deptName ||
    !deptTitle
  ) {
    showDialog({
      title: `提示`,
      message: `本活动仅限受邀认证医务工作者参与，请您提交认证资料后再参与活动`,
    }).then(() => {
      const redirect_uri = encodeURIComponent(location.href)
      location.replace(import.meta.env.VITE_AUTHENTICATION_URL + '/?redirect_uri=' + redirect_uri)
    })
    return
  }
  // console.log('userType =>', userType)
  // console.log('realName =>', realName)
  // console.log('idCard1 =>', idCard1)
  // console.log('idCard2 =>', idCard2)
  // console.log('companyName =>', companyName)
  // console.log('deptName =>', deptName)
  // console.log('deptTitle =>', deptTitle)
})

const itemClick = (item) => {
  if (item.status === 0) {
    showDialog({
      title: `提示`,
      message: `活动尚未开始,敬请耐心等待`,
    }).then(() => { })
    return
  }
  if (item.id === 'upload' && item.status === 2) {
    showDialog({
      title: `提示`,
      message: `试题收集已结束`,
    }).then(() => { })
    return
  }
  if (item.id === 'upload') {
    router.push({
      name: 'ysupload',
      params: {},
    })
    return
  }
  if (item.id === 'review') {
    router.push({
      name: 'ysreview',
      params: {},
    })
    return
  }
}
</script>

<template>
  <main class="page">
    <div class="container">
      <div class="header">
        <div class="title">2025年中青年医师知识竞赛</div>
        <div class="subtitle">欢迎参与医学知识竞赛，展现您的专业能力</div>
      </div>

      <div class="content">
        <div class="entry-list">
          <div class="entry-item" @click="itemClick({ id: 'upload', status: 1 })">
            <div class="entry-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <div class="entry-content">
              <div class="entry-title">题目上传</div>
              <div class="entry-desc">仅限受邀专家上传试题</div>
            </div>
            <div class="entry-arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <div class="entry-item" @click="itemClick({ id: 'review', status: 1 })">
            <div class="entry-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="entry-content">
              <div class="entry-title">题目审核</div>
              <div class="entry-desc">仅限受邀专家对上传题目进行审核</div>
            </div>
            <div class="entry-arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <div class="entry-item" @click="itemClick({ id: 'participate', status: 0 })">
            <div class="entry-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
                <path d="M19 21L21 19L19 17M5 3L3 5L5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="entry-content">
              <div class="entry-title">参加答题</div>
              <div class="entry-desc">欢迎参与2025年中青年医师知识竞赛</div>
            </div>
            <div class="entry-arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="less">
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: -20px;
}

.container {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  padding: 40px 30px 30px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .subtitle {
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.4;
  }
}

.content {
  padding: 30px;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #667eea;
  }

  &:active {
    transform: translateY(0);
  }
}

.entry-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
}

.entry-content {
  flex: 1;
  min-width: 0;
}

.entry-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1.3;
}

.entry-desc {
  font-size: 13px;
  color: #7f8c8d;
  line-height: 1.4;
}

.entry-arrow {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  flex-shrink: 0;
  transition: all 0.3s ease;

  svg {
    width: 16px;
    height: 16px;
    color: #95a5a6;
    transition: all 0.3s ease;
  }
}

.entry-item:hover .entry-arrow {
  background: #667eea;

  svg {
    color: white;
    transform: translateX(2px);
  }
}

// 响应式设计
@media (max-width: 480px) {
  .page {
    padding: 16px;
  }

  .container {
    border-radius: 20px;
  }

  .header {
    padding: 30px 24px 24px;

    .title {
      font-size: 22px;
    }

    .subtitle {
      font-size: 13px;
    }
  }

  .content {
    padding: 24px;
  }

  .entry-item {
    padding: 16px;
  }

  .entry-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .entry-title {
    font-size: 15px;
  }

  .entry-desc {
    font-size: 12px;
  }
}
</style>
