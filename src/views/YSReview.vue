<script setup lang="ts">
import { onMounted, ref } from 'vue'
// 引入 Vant 组件
import { RadioGroup, Radio, CheckboxGroup, Checkbox, showToast } from 'vant'
import http from '../utils/http'

const drawId = ref('')
const isLoading = ref(true)

// 题目数据
const questions = ref([])

const draw = async () => {
  isLoading.value = true
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025ysjs' })

  const postData = {
    head: { auth },
  }
  const res = (await http.post('/amtn-form/knowledge/questionDraw/draw', postData)).data
  drawId.value = res.data.drawId
  questions.value = res.data.questions
  questions.value.forEach(q => {
    q.answer = q.answer.map((item, idx) => ({
      name: item,
      letter: String.fromCharCode(65 + idx)
    }))
  })
  isLoading.value = false
}

const onAudit = async (q) => {
  console.log('审核', q)
  q.auditStatus = q.auditStatus === 1 ? 0 : 1
}

const onSubmit = async () => {
  console.log('提交')
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025ysjs' })

  const questionsList = questions.value.map(q => ({
    questionId: q.questionId,
    auditStatus: q.auditStatus == 1 ? 1 : 2,
  }))
  const postData = {
    head: { auth },
    data: {
      drawId: drawId.value,
      questions: questionsList,
    }
  }
  const res = (await http.post('/amtn-form/knowledge/questionDraw/audit', postData)).data
  if (res.responseStatus.errorcode == 100408) {
    showToast(res.responseStatus.message)
  }
}


onMounted(() => {
  console.log('页面已挂载，准备抽题');
  draw()
  console.log('onMounted')
})
</script>

<template>
  <main class="page">
    <!-- 顶部KV大图Banner -->
    <div class="kv-banner">
      <img class="kv-img"
        src="https://rs-os-lyh-dt-publicread-picture-bosmetadata-prod.liangyihui.net/document_N/YsLyB4GcBQf60fm4PRb1cFfMzUmIoWsg9rhcv8GF5R211s6v6LakjN-VprjaYVk5/XSpASPAwsmtNmqFHUPkI2CKHP1ZjQ4io.jpg"
        alt="KV" />
      <!-- 流光动效层 -->
      <div class="kv-glow"></div>
    </div>
    <!-- 内容卡片悬浮区 -->
    <div class="container card-float animate-fade-in">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <div class="loading-text">
            <span class="loading-dots">正在加载题目</span>
          </div>
        </div>
      </div>
      <div v-else v-for="(q, qIdx) in questions" :key="qIdx" class="question-block">
        <div class="question-title">{{ q.question }}</div>
        <div class="options">
          <!-- 单选题 -->
          <div style="pointer-events: none;" v-if="!q.type">
            <RadioGroup v-model="q.correctAnswer[0]" direction="vertical">
              <Radio icon-size="18px" v-for="(opt, optIdx) in q.answer" :key="optIdx" :name="opt.letter"
                :checked-color="'#4f8cff'">
                {{ opt.name }}
              </Radio>
            </RadioGroup>
          </div>
          <!-- 多选题 -->
          <div style="pointer-events: none;" v-else-if="q.type">
            <CheckboxGroup v-model="q.correctAnswer" direction="vertical">
              <Checkbox shape="square" icon-size="18px" v-for="(opt, optIdx) in q.answer" :key="optIdx"
                :name="opt.letter" :checked-color="'#4f8cff'">
                {{ opt.name }}
              </Checkbox>
            </CheckboxGroup>
          </div>
        </div>
        <!-- INSERT_YOUR_CODE -->
        <div class="review-actions" style="margin-top: 16px; display: flex; gap: 12px;">
          <button :class="['audit-btn', q.auditStatus === 1 ? 'audit-passed' : 'audit-not-passed']" @click="onAudit(q)">
            {{ q.auditStatus === 1 ? '已通过' : '未通过' }}
          </button>
        </div>
      </div>
    </div>
    <!-- 悬浮底部提交按钮 -->
    <div class="submit-bar">
      <div class="submit-btn" @click="onSubmit">提交</div>
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

.container {

  .question-block {
    margin: 10px 0 24px 0;
    padding: 0 24px;
  }

  .question-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .option-label {
    display: flex;
    align-items: center;
    font-size: 16px;
    cursor: pointer;

    input {
      margin-right: 8px;
    }
  }
}

@main-color: #4f8cff;
@main-color2: #667eea;

.question-block {
  margin: 32px 0 24px 0;
  padding: 0 24px;
}

.question-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0; // 由分割线控制间距
}

.van-radio,
.van-checkbox {
  position: relative;
  padding: 10px 0 10px 2px;
  min-height: 36px;
  align-items: center;
  font-size: 16px;
  background: transparent;
  transition: background 0.2s;
  cursor: pointer;
}

// 分割线
.van-radio:not(:last-child)::after,
.van-checkbox:not(:last-child)::after {
  content: '';
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: #e5e7eb; // 浅灰色
  margin-left: 2px;
}

// hover 效果
.van-radio:hover,
.van-checkbox:hover {
  background: #f0f6ff;
  color: #4f8cff;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.option-label {
  display: flex;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 6px;
  position: relative;
  user-select: none;

  input[type="radio"],
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .custom-radio,
  .custom-checkbox {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    box-sizing: border-box;
    background: #fff;
    border: 2px solid @main-color;
    border-radius: 50%;
    transition: border-color 0.2s, box-shadow 0.2s;
    position: relative;
  }

  .custom-checkbox {
    border-radius: 4px;
  }

  /* 选中时的样式 */
  input[type="radio"]:checked+.custom-radio {
    border-color: @main-color2;
    box-shadow: 0 0 0 2px fade(@main-color2, 20%);
  }

  input[type="radio"]:checked+.custom-radio::after {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    background: @main-color2;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
  }

  input[type="checkbox"]:checked+.custom-checkbox {
    border-color: @main-color2;
    box-shadow: 0 0 0 2px fade(@main-color2, 20%);
    background: @main-color2;
  }

  input[type="checkbox"]:checked+.custom-checkbox::after {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-left: 2px solid #fff;
    border-bottom: 2px solid #fff;
    position: absolute;
    left: 3px;
    top: 1px;
    height: 8px;
    width: 4px;
    transform: rotate(-45deg);
  }

  .option-text {
    transition: color 0.2s;
    padding-left: 2px;
  }

  input[type="radio"]:checked~.option-text,
  input[type="checkbox"]:checked~.option-text {
    color: @main-color2;
    font-weight: 600;
  }
}

/* Vant 多选框左侧选择框改为正方形 */
.van-checkbox__icon .van-icon,
.van-checkbox__icon .van-icon--checked {
  border-radius: 4px !important;
  width: 22px !important;
  height: 22px !important;
  min-width: 22px !important;
  min-height: 22px !important;
  line-height: 22px !important;
  font-size: 18px !important;
}

.card-float,
.container {
  max-height: 60vh;
  overflow-y: auto;
  overscroll-behavior: contain;

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
  -ms-overflow-style: none;
}

@media (max-width: 600px) {

  .card-float,
  .container {
    max-height: 70vh;
    padding-bottom: 25px;
    -webkit-overflow-scrolling: touch;
  }
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  padding: 12px 16px 18px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-bar .submit-btn {
  width: auto;
  min-width: 180px;
  font-size: 20px;
  height: 52px;
  border-radius: 26px;
  padding: 0 48px;
  background: linear-gradient(135deg, #667eea 0%, #4f8cff 50%, #667eea 100%);
  color: #fff;
  box-shadow:
    0 6px 24px #4f8cff55,
    0 2px 12px #fff8,
    0 0 0 2px rgba(255, 255, 255, 0.1);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
  cursor: pointer;
  line-height: 52px;
  text-align: center;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  user-select: none;
  position: relative;
  overflow: hidden;

  /* 内部光效 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.8s ease;
  }

  &:hover::before {
    left: 100%;
  }
}

.submit-bar .submit-btn:hover,
.submit-bar .submit-btn:active,
.submit-bar .submit-btn:focus {
  background: linear-gradient(135deg, #4f8cff 0%, #667eea 50%, #4f8cff 100%);
  box-shadow:
    0 12px 40px #4f8cff66,
    0 4px 16px #fff8,
    0 0 0 3px rgba(255, 255, 255, 0.15);
  transform: translateY(-3px) scale(1.02);
}

/* 审核按钮样式 - 与主KV风格统一 */
.audit-btn {
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px) saturate(1.1);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  letter-spacing: 0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  /* 光晕动效 */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 14px;
    padding: 2px;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: subtract;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  /* 内部光效 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);

    &::before {
      opacity: 1;
    }

    &::after {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px) scale(1.01);
  }
}

/* 已通过状态样式 - 使用主KV蓝紫色调 */
.audit-passed {
  background: linear-gradient(135deg,
      rgba(79, 140, 255, 0.95) 0%,
      rgba(102, 126, 234, 0.95) 50%,
      rgba(79, 140, 255, 0.95) 100%);
  color: #fff;
  box-shadow:
    0 4px 20px rgba(79, 140, 255, 0.35),
    0 1px 3px rgba(255, 255, 255, 0.4) inset;

  &:hover {
    background: linear-gradient(135deg,
        rgba(102, 126, 234, 0.98) 0%,
        rgba(79, 140, 255, 0.98) 50%,
        rgba(102, 126, 234, 0.98) 100%);
    box-shadow:
      0 8px 32px rgba(79, 140, 255, 0.45),
      0 2px 8px rgba(255, 255, 255, 0.25) inset;
  }
}

/* 未通过状态样式 - 使用主KV色调的较暗版本 */
.audit-not-passed {
  background: linear-gradient(135deg,
      rgba(165, 180, 252, 0.75) 0%,
      rgba(180, 202, 254, 0.75) 50%,
      rgba(224, 231, 255, 0.75) 100%);
  color: rgba(107, 114, 128, 0.7);
  box-shadow:
    0 4px 20px rgba(165, 180, 252, 0.25),
    0 1px 3px rgba(255, 255, 255, 0.6) inset;
  border: 1.5px solid rgba(224, 231, 255, 0.8);

  &:hover {
    background: linear-gradient(135deg,
        rgba(180, 202, 254, 0.85) 0%,
        rgba(165, 180, 252, 0.85) 50%,
        rgba(180, 202, 254, 0.85) 100%);
    box-shadow:
      0 8px 32px rgba(165, 180, 252, 0.4),
      0 2px 8px rgba(255, 255, 255, 0.4) inset;
    color: rgba(107, 114, 128, 0.85);
  }
}

/* 响应式优化 */
@media (max-width: 600px) {
  .audit-btn {
    padding: 8px 0;
    font-size: 13px;
    border-radius: 10px;

    &::before {
      border-radius: 12px;
    }
  }
}

/* 自定义Loading样式 - 与主KV风格统一 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 60px 20px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #4f8cff;
  animation-duration: 2s;
  width: 80px;
  height: 80px;
}

.spinner-ring:nth-child(2) {
  border-right-color: #667eea;
  animation-duration: 1.5s;
  animation-direction: reverse;
  width: 60px;
  height: 60px;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #a5b4fc;
  animation-duration: 1s;
  width: 40px;
  height: 40px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  text-align: center;
}

.loading-dots {
  font-size: 18px;
  font-weight: 600;
  color: #4f8cff;
  background: linear-gradient(90deg, #667eea 0%, #4f8cff 50%, #667eea 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  animation: loadingText 1.5s ease-in-out infinite;
  position: relative;

  &::after {
    content: '...';
    position: absolute;
    animation: dots 1.5s infinite;
  }
}

@keyframes loadingText {

  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes dots {

  0%,
  20% {
    content: '';
  }

  40% {
    content: '.';
  }

  60% {
    content: '..';
  }

  80%,
  100% {
    content: '...';
  }
}

/* 移动端loading适配 */
@media (max-width: 600px) {
  .loading-container {
    min-height: 250px;
    padding: 40px 20px;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
  }

  .spinner-ring:nth-child(1) {
    width: 60px;
    height: 60px;
  }

  .spinner-ring:nth-child(2) {
    width: 45px;
    height: 45px;
  }

  .spinner-ring:nth-child(3) {
    width: 30px;
    height: 30px;
  }

  .loading-dots {
    font-size: 16px;
  }
}
</style>
