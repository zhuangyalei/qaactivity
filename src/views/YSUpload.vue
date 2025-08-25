<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, Loading, Uploader, Button } from 'vant'
import OSS from 'ali-oss'
import http from '../utils/http'

const isLoading = ref(true)
const isComplete = ref(false)
const isUploading = ref(false)

const getPreviewImport = async () => {
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025ysjs' })

  // 获取是否上传过问卷题目信息
  const postData = {
    head: { auth },
  }
  const res = (await http.post('/amtn-form/knowledge/questionBank/previewImport', postData)).data
  isLoading.value = false
  if (res.responseStatus.errorcode > 0) {
    return
  }
  if (res.data.length > 0) {
    isComplete.value = true
  }
}

onMounted(async () => {
  showRule()

  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025ysjs' })

  // 获取用户信息
  const postData = {
    head: { auth },
  }
  const res = (
    await http.post(import.meta.env.VITE_DOCTOR_API_URL + '/api/user/v3/getUserInfo', postData)
  ).data
  if (res.responseStatus.errorcode > 0) {
    return
  }
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
    }).then(() => {})
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

  getPreviewImport()
})

const afterRead = async (fileProxy: object) => {
  // console.log('file =>', fileProxy.file)

  const ossInfo = await (await fetch('//fed.liangyihui.net/get_sts_token_for_oss_upload')).json()
  const ossClient = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'oss-cn-hangzhou',
    // 填写Bucket名称。
    bucket: 'bosdev',
    // endpoint: 'devoss.liangyihui.net',
    // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
    accessKeyId: ossInfo.AccessKeyId,
    accessKeySecret: ossInfo.AccessKeySecret,
    // 从STS服务获取的安全令牌（SecurityToken）。
    stsToken: ossInfo.SecurityToken,
    // cname: true,
    refreshSTSToken: async () => {
      // 向您搭建的STS服务获取临时访问凭证。
      const info = await (await fetch('//fed.liangyihui.net/get_sts_token_for_oss_upload')).json()
      return {
        accessKeyId: info.AccessKeyId,
        accessKeySecret: info.AccessKeySecret,
        stsToken: info.SecurityToken,
      }
    },
    // 刷新临时访问凭证的时间间隔，单位为毫秒。
    refreshSTSTokenInterval: 900,
  })
  try {
    isUploading.value = true
    // 填写Object完整路径。Object完整路径中不能包含Bucket名称。
    // 您可以通过自定义文件名（例如exampleobject.txt）或文件完整路径（例如exampledir/exampleobject.txt）的形式实现将数据上传到当前Bucket或Bucket中的指定目录。
    // data对象可以自定义为file对象、Blob数据或者OSS Buffer。
    const options = {
      // meta: { temp: "demo" },
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    }

    const result = await ossClient.put(
      `/ys-xlsx/${new Date().getTime()}.xlsx`,
      fileProxy.file,
      options,
    )
    // console.log(result)
    const xlsxUrl = `https://devoss.liangyihui.net/${result.name}`
    // console.log('picUrl =>', picUrl)
    // showDialog({ message: 'picUrl =>' + picUrl })
    const excelImport = async (xlsxUrl: string) => {
      const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })
      const postData = {
        head: {
          auth,
        },
        data: { url: xlsxUrl },
      }
      const importRes = (await http.post('/amtn-form/knowledge/questionBank/importExcel', postData))
        .data
      console.log('importRes =>', importRes)
      // showDialog({ message: 'checkRes =>' + checkRes })
      if (importRes?.responseStatus?.errorcode === 0) {
        // 跳转去答题
        showDialog({
          title: `提示`,
          message: `问卷导入成功`,
        }).then(() => {
          isLoading.value = true
          getPreviewImport()
        })
      } else {
        showDialog({
          title: `上传失败`,
          // message: `问卷导入失败，请检查导入内容格式是否正确并修正后重新导入或联系客服处理`,
          message: importRes?.responseStatus?.message,
        }).then(() => {})
      }
      isUploading.value = false
    }
    excelImport(xlsxUrl)
  } catch (e) {
    isUploading.value = false
    console.log(e)
    // showDialog({ message: 'catch提示' })
  }
}

const showRule = () => {
  showDialog({
    title: '出题规则',
    message: `<div style='text-align:left;white-space:pre-line;'>1、出题人必须具有肺癌领域副主任医师及以上职称\n2、出题范围必须为肺癌领域相关知识点\n3、内容必须清晰无异议，答案有权威依据，题目难易程度分布均匀合理\n4、每人至少出30题\n5、请在2025年9月15日前完成，逾期题目作废</div>`,
    confirmButtonText: '我知道了',
    allowHtml: true,
  })
}
</script>

<template>
  <main class="page">
    <!-- 顶部KV大图Banner -->
    <div class="kv-banner">
      <img
        class="kv-img"
        src="https://rs-os-lyh-dt-publicread-picture-bosmetadata-prod.liangyihui.net/document_N/YsLyB4GcBQf60fm4PRb1cFfMzUmIoWsg9rhcv8GF5R211s6v6LakjN-VprjaYVk5/XSpASPAwsmtNmqFHUPkI2CKHP1ZjQ4io.jpg"
        alt="KV"
      />
      <!-- 流光动效层 -->
      <div class="kv-glow"></div>
    </div>
    <!-- 内容卡片悬浮区 -->
    <div class="container card-float animate-fade-in">
      <div class="header">
        <div class="title">中青年医师知识竞赛题目上传</div>
        <div class="subtitle">请上传Excel文件导入试题到知识竞赛题库</div>
      </div>
      <div class="content" v-if="!isLoading">
        <div v-if="isComplete" class="complete-state">
          <div class="complete-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="complete-text">
            <div class="complete-title">上传完成</div>
            <div class="complete-desc">感谢您的参与，试题将在审核通过后纳入知识竞赛题库</div>
          </div>
        </div>
        <div v-else class="upload-area">
          <div class="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                fill="currentColor"
              />
              <path
                d="M7 14L12 9L17 14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 9V21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="upload-text">
            <div class="upload-title">上传Excel文件</div>
            <div class="upload-desc">
              支持 .xlsx 格式文件，请确保文件格式正确
              <a
                href="https://devoss.liangyihui.net/ys-templete/2025%E4%B8%AD%E9%9D%92%E5%B9%B4%E5%8C%BB%E5%B8%88%E7%9F%A5%E8%AF%86%E7%AB%9E%E8%B5%9B%E8%AF%95%E9%A2%98%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx"
                download
                class="template-download-link"
                >模板下载</a
              >
            </div>
          </div>
          <Uploader
            max-count="1"
            result-type="file"
            :after-read="afterRead"
            accept="xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            class="uploader"
          >
            <Button
              icon="plus"
              type="primary"
              v-bind="isUploading ? { loading: '' } : {}"
              loading-text="上传中..."
              class="upload-button neon-btn"
            >
              选择Excel文件
            </Button>
          </Uploader>
        </div>
      </div>
      <div class="loading-state" v-if="isLoading">
        <Loading size="36px" vertical>加载中...</Loading>
      </div>
    </div>
    <!-- 背景科技感粒子/流光层，可后续扩展 -->
    <div class="rule-fab" @click="showRule">
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="3" fill="#4f8cff" />
        <rect x="7" y="6" width="10" height="2" rx="1" fill="#fff" />
        <rect x="7" y="10" width="10" height="2" rx="1" fill="#fff" />
        <rect x="7" y="14" width="6" height="2" rx="1" fill="#fff" />
      </svg>
    </div>
  </main>
</template>

<style scoped lang="less">
.page {
  margin: -20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 100%);
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
}

.kv-banner {
  width: 100vw;
  min-height: 340px;
  max-height: 400px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #b4cafe 0%, #e0e7ff 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1;
  -webkit-mask-image: linear-gradient(to top, transparent 5px, #0a2a5e 100px);
  mask-image: linear-gradient(to top, transparent 5px, #0a2a5e 100px);
  mask-size: cover;
  -webkit-mask-size: cover;
  .kv-img {
    width: 100vw;
    min-height: 340px;
    max-height: 400px;
    object-fit: cover;
    filter: drop-shadow(0 8px 32px #a5b4fc88) brightness(1.05);
    // border-bottom-left-radius: 40px;
    // border-bottom-right-radius: 40px;
    box-shadow: 0 8px 32px #a5b4fc55;
    animation: fadeInKV 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .kv-glow {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 80px;
    background: radial-gradient(ellipse at center, #a5b4fc88 0%, transparent 80%);
    filter: blur(16px);
    pointer-events: none;
    z-index: 2;
    animation: kvGlowMove 3s infinite alternate ease-in-out;
  }
}

@keyframes fadeInKV {
  from {
    opacity: 0;
    transform: translateY(-40px) scale(1.05);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes kvGlowMove {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.card-float {
  position: relative;
  top: 30px;
  margin-bottom: -80px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.85);
  box-shadow:
    0 12px 48px 0 #a5b4fc55,
    0 1.5px 8px #fff8;
  border-radius: 32px;
  backdrop-filter: blur(16px) saturate(1.2);
  border: 1.5px solid #e0e7ff;
  max-width: 520px;
  width: 92vw;
  animation: floatUp 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fadeInCard 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeInCard {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.header {
  padding: 48px 36px 28px;
  text-align: center;
  background: transparent;
  color: #2c3e50;
  position: relative;
  .title {
    font-size: 30px;
    font-weight: 800;
    margin-bottom: 10px;
    letter-spacing: 2px;
    // text-shadow:
    //   0 2px 8px #a5b4fc33,
    //   0 1px 0 #fff;
    background: linear-gradient(90deg, #667eea 0%, #4f8cff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle {
    font-size: 16px;
    opacity: 0.92;
    line-height: 1.5;
    color: #4f8cff;
    font-weight: 500;
    text-shadow: 0 1px 4px #a5b4fc22;
  }
}

.content {
  padding: 36px 32px 32px;
}

.complete-state {
  text-align: center;
  padding: 24px 0 12px;
  .complete-icon {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 28px;
    box-shadow: 0 4px 24px #2ecc7133;
    svg {
      width: 48px;
      height: 48px;
      color: white;
    }
  }
  .complete-text {
    .complete-title {
      font-size: 22px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 8px;
    }
    .complete-desc {
      font-size: 15px;
      color: #7f8c8d;
      line-height: 1.5;
    }
  }
}

.upload-area {
  text-align: center;
  padding: 24px 0 12px;
  .upload-icon {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #4f8cff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 28px;
    box-shadow: 0 4px 24px #667eea33;
    svg {
      width: 48px;
      height: 48px;
      color: white;
    }
  }
  .upload-text {
    margin-bottom: 36px;
    .upload-title {
      font-size: 22px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 8px;
    }
    .upload-desc {
      font-size: 15px;
      color: #4f8cff;
      line-height: 1.5;
      font-weight: 500;
      .template-download-link {
        color: #3b82f6;
        font-weight: bold;
        text-decoration: underline;
        margin-left: 2px;
        transition: color 0.2s;
        cursor: pointer;
        &:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
      }
    }
  }
  .uploader {
    display: inline-block;
  }
  .upload-button.neon-btn {
    height: 52px;
    padding: 0 38px;
    border-radius: 26px;
    font-size: 18px;
    font-weight: 600;
    background: linear-gradient(90deg, #667eea 0%, #4f8cff 100%);
    border: none;
    box-shadow:
      0 6px 24px #4f8cff44,
      0 1.5px 8px #fff8;
    color: #fff;
    transition:
      all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.2s;
    position: relative;
    overflow: hidden;
    outline: none;
    &:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow:
        0 10px 32px #4f8cff66,
        0 2px 12px #fff8;
      background: linear-gradient(90deg, #4f8cff 0%, #667eea 100%);
    }
    &::after {
      content: '';
      position: absolute;
      left: -60%;
      top: 0;
      width: 60%;
      height: 100%;
      background: linear-gradient(120deg, #fff8 0%, #fff2 100%);
      filter: blur(8px);
      opacity: 0.7;
      transform: skewX(-20deg);
      animation: btnShine 2.2s infinite linear;
    }
  }
}
@keyframes btnShine {
  0% {
    left: -60%;
  }
  100% {
    left: 120%;
  }
}

.loading-state {
  padding: 60px 30px;
  text-align: center;
  :deep(.van-loading__text) {
    color: #667eea;
    font-size: 16px;
    margin-top: 12px;
  }
}

.rule-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 4px 16px #4f8cff44;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  border: 2px solid #4f8cff;
  &:hover {
    box-shadow: 0 8px 32px #4f8cff66;
    transform: scale(1.08);
  }
  svg {
    display: block;
    width: 24px;
    height: 24px;
  }
}

// 响应式设计
@media (max-width: 600px) {
  .kv-banner {
    min-height: 180px;
    max-height: 220px;
    -webkit-mask-image: linear-gradient(to top, transparent 5px, #0a2a5e 100px);
    mask-image: linear-gradient(to top, transparent 5px, #0a2a5e 100px);
    mask-size: cover;
    -webkit-mask-size: cover;
    .kv-img {
      min-height: 180px;
      max-height: 220px;
      // border-bottom-left-radius: 20px;
      // border-bottom-right-radius: 20px;
    }
  }
  .card-float {
    top: 30px;
    margin-bottom: -40px;
    border-radius: 18px;
    max-width: 98vw;
    padding: 0;
  }
  .header {
    padding: 28px 12px 16px;
    .title {
      font-size: 20px;
    }
    .subtitle {
      font-size: 13px;
    }
  }
  .content {
    padding: 18px 8px 16px;
  }
  .complete-state,
  .upload-area {
    .complete-icon,
    .upload-icon {
      width: 54px;
      height: 54px;
      margin-bottom: 14px;
      svg {
        width: 28px;
        height: 28px;
      }
    }
    .complete-text .complete-title,
    .upload-text .upload-title {
      font-size: 15px;
    }
    .complete-text .complete-desc,
    .upload-text .upload-desc {
      font-size: 12px;
    }
  }
  .upload-button.neon-btn {
    height: 40px;
    padding: 0 16px;
    font-size: 14px;
  }
}
</style>
