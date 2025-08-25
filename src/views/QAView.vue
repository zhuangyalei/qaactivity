<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  RadioGroup,
  Radio,
  Checkbox,
  CheckboxGroup,
  Slider,
  Rate,
  showDialog,
  Loading,
  showNotify,
} from 'vant'
import http from '../utils/http'

const qaTitle = ref('')
const welcomeMsg = ref('')
const qaId = ref(undefined)
const modules = ref([])
const isFinish = ref(true)
const sourtNums = ref([
  `<svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M128,24A104,104,0,1,0,232,128,104.2,104.2,0,0,0,128,24Zm12,152a8,8,0,0,1-16,0V98.9l-11.6,7.8a8,8,0,0,1-8.8-13.4l24-16a8.3,8.3,0,0,1,8.2-.4A8,8,0,0,1,140,84Z"/></svg>`,
  `<svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M128,24A104,104,0,1,0,232,128,104.2,104.2,0,0,0,128,24Zm24,144a8,8,0,0,1,0,16H104a7.3,7.3,0,0,1-2.5-.4A8,8,0,0,1,96,176a7.5,7.5,0,0,1,1.7-4.9l43.7-58.3A16,16,0,0,0,128,88a15.9,15.9,0,0,0-14.7,9.8,8,8,0,0,1-14.8-6.3,32,32,0,1,1,56,30.4l-.2.3L120,168Z"/></svg>`,
  `<svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M128,24A104,104,0,1,0,232,128,104.2,104.2,0,0,0,128,24Zm21.5,153.5a36.2,36.2,0,0,1-51,0,8.1,8.1,0,0,1,11.4-11.4A19.9,19.9,0,1,0,124,132a8.1,8.1,0,0,1-7.1-4.3,8,8,0,0,1,.5-8.3L136.6,92H104a8,8,0,0,1,0-16h48a8.1,8.1,0,0,1,7.1,4.3,8,8,0,0,1-.5,8.3l-21.1,30a37.9,37.9,0,0,1,12,7.9,36.2,36.2,0,0,1,0,51Z"/></svg>`,
  `<svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M128,24A104,104,0,1,0,232,128,104.2,104.2,0,0,0,128,24Zm28,152a8,8,0,0,1-16,0V152H100a8,8,0,0,1-6.5-3.4,7.9,7.9,0,0,1-1-7.3l24-68a8,8,0,0,1,15,5.4L111.3,136H140V112a8,8,0,0,1,16,0Z"/></svg>`,
  `<svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M128,24A104,104,0,1,0,232,128,104.2,104.2,0,0,0,128,24Zm-4.1,92a36,36,0,1,1-25.5,61.5,8,8,0,1,1,11.2-11.4,20.1,20.1,0,0,0,14.3,5.9,19.9,19.9,0,0,0,14.2-5.9,19.8,19.8,0,0,0,0-28.2,19.9,19.9,0,0,0-14.2-5.9,20.1,20.1,0,0,0-14.3,5.9,8,8,0,0,1-13.5-7l7.8-48.2a8,8,0,0,1,7.9-6.7H152a8,8,0,0,1,0,16H118.6l-4.1,25.2A37.3,37.3,0,0,1,123.9,116Z"/></svg>`,
  `<svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M148,144a20,20,0,1,1-20-20A20.1,20.1,0,0,1,148,144Zm84-16A104,104,0,1,1,128,24,104.2,104.2,0,0,1,232,128Zm-68,16a36,36,0,0,0-36-36h-1.8l16.7-27.9a8,8,0,1,0-13.8-8.2l-32.2,54-.3.6A36,36,0,1,0,164,144Z"/></svg>`,
  `<svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M128,24A104,104,0,1,0,232,128,104.2,104.2,0,0,0,128,24Zm31.6,62.5-32,96A7.9,7.9,0,0,1,120,188a7.3,7.3,0,0,1-2.5-.4,8,8,0,0,1-5.1-10.1L140.9,92H104a8,8,0,0,1,0-16h48a7.9,7.9,0,0,1,6.5,3.3A8.1,8.1,0,0,1,159.6,86.5Z"/></svg>`,
  `<svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M128,24A104,104,0,1,0,232,128,104.2,104.2,0,0,0,128,24Zm24,150a33.9,33.9,0,1,1-48-48,26.6,26.6,0,0,1,3.1-2.6l-.3-.2a29.9,29.9,0,0,1,0-42.4c11.3-11.3,31.1-11.3,42.4,0a29.9,29.9,0,0,1,0,42.4l-.3.2A26.6,26.6,0,0,1,152,126a33.8,33.8,0,0,1,0,48Z"/><path d="M137.9,111.9a14,14,0,1,0-19.8,0A14.3,14.3,0,0,0,137.9,111.9Z"/><path d="M128,132a18,18,0,0,0-12.7,30.7,18.4,18.4,0,0,0,25.4,0A18,18,0,0,0,128,132Z"/></svg>`,
  `<svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M148,112a20,20,0,1,1-20-20A20.1,20.1,0,0,1,148,112Zm84,16A104,104,0,1,1,128,24,104.2,104.2,0,0,1,232,128Zm-68-16a36,36,0,1,0-36,36h1.8l-16.7,27.9a8.1,8.1,0,0,0,2.8,11A8.7,8.7,0,0,0,120,188a8.1,8.1,0,0,0,6.9-3.9l32.2-54,.3-.5A36,36,0,0,0,164,112Z"/></svg>`,
])
const groupNums = ref([
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
])
const optionNums = ref([
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
])
const qTypes = ref(['单选题', '多选题', '排序题', '填空题'])
const route = useRoute()
const router = useRouter()
const PAGE_STATUS = {
  LOADING: 0,
  SUCCESS: 1,
  FAILURE: 2,
}
const QA_STATUS = {
  NOT_START: 0,
  IN_PROGRESS: 1,
  HAS_END: 2,
}
const pageStatus = ref(PAGE_STATUS.LOADING)
const isSubmitting = ref(false)
const qaStatus = ref(QA_STATUS.IN_PROGRESS)
const countdown = ref(0)
const countdownTimer = ref(null)
const COUNTDOWN_DURATION = 15 * 60 // 15分钟，单位秒

// 计算倒计时显示文本
const countdownText = computed(() => {
  if (countdown.value <= 0) return '提交'
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} 后可提交`
})

// 保存倒计时状态到本地存储
const saveCountdownState = () => {
  if (qaId.value) {
    localStorage.setItem(`qa_countdown_${qaId.value}`, countdown.value.toString())
  }
}

// 从本地存储加载倒计时状态
const loadCountdownState = () => {
  if (qaId.value) {
    const savedCountdown = localStorage.getItem(`qa_countdown_${qaId.value}`)
    if (savedCountdown) {
      countdown.value = parseInt(savedCountdown)
    } else {
      countdown.value = COUNTDOWN_DURATION
    }
  }
}

// 开始倒计时
const startCountdown = () => {
  if (countdownTimer.value) return

  countdownTimer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
      saveCountdownState()
    } else {
      clearInterval(countdownTimer.value)
      countdownTimer.value = null
    }
  }, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// 在组件卸载时清理定时器
onUnmounted(() => {
  stopCountdown()
})

onMounted(async () => {
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })
  qaId.value = route.params.id ? parseInt(route.params.id) : undefined

  // 获取用户信息
  const userInfoPostData = {
    head: { auth },
  }
  const userInfoRes = (await http.post('/amtn-form/user/getUserInfo', userInfoPostData)).data
  // 是否录入过人脸
  // const hasFace = false
  const hasFace = userInfoRes?.data?.faceUrl?.length > 0
  // 是否完善过信息
  // const infoFilled = false
  const infoFilled = userInfoRes?.data?.name?.length > 0
  if (!infoFilled) {
    // 跳转去完善信息
    const redirect_uri = encodeURIComponent(location.href)
    location.replace(import.meta.env.VITE_EDIT_INFO_URL + '/?redirect_uri=' + redirect_uri)
    return
  }
  if (!hasFace) {
    // 跳转去录入人脸
    router.replace({ name: 'camera', query: { qaId: qaId.value } })
    return
  }

  // 获取问卷详情
  const qaDetailPostData = {
    head: {
      auth,
    },
    data: {
      id: qaId.value,
    },
  }
  const qaDetailRes = (await http.post('/amtn-form/form/getFormDetail', qaDetailPostData)).data
  if (qaDetailRes.responseStatus.errorcode > 0) {
    pageStatus.value = PAGE_STATUS.FAILURE
    return
  }
  // status: 0 未开始 1 进行中 2 已结束
  qaStatus.value = qaDetailRes?.data?.status

  // qaStatus.value = 2
  // if (qaStatus.value === QA_STATUS.NOT_START) {
  //   pageStatus.value = PAGE_STATUS.FAILURE
  // }
  pageStatus.value = PAGE_STATUS.SUCCESS
  // pageStatus.value = PAGE_STATUS.FAILURE

  qaId.value = qaDetailRes.data.id
  qaTitle.value = qaDetailRes.data.name
  welcomeMsg.value = qaDetailRes.data.welcomeMsg
  isFinish.value = qaDetailRes.data.isFinish === 1
  qaDetailRes.data.modules.forEach((m) => {
    m.questions.forEach((q) => {
      // q.type 0 单选 1 多选 2 排序 3 填空（包含多项全部必填填空）
      if (q.type === 0) {
        for (let i = 0; i < q.answers.length; i++) {
          const a = q.answers[i]
          if (a.checked === 1) {
            q.checked = i
            break
          }
        }
      } else if (q.type === 1) {
        const checked = []
        for (let i = 0; i < q.answers.length; i++) {
          const a = q.answers[i]
          if (a.checked === 1) {
            checked.push(i)
          }
        }
        q.checked = checked
      } else if (q.type === 3) {
        if (q.answers) {
          for (let i = 0; i < q.answers.length; i++) {
            const a = q.answers[i]
            if (q.answerTotal > 0 && !a.content) {
              a.content = 0
            } else if (a.answerRange?.type === 'num' && parseInt(a.content) >= 0) {
              a.content = parseInt(a.content)
            }
          }
        }
      }
    })
  })
  modules.value = qaDetailRes.data.modules
  // console.log('modules =>', modules)
  // TODO: 已提交问卷但未电子签名，应该提示去电子签名
  // TODO: 已结束禁止重复作答，仅可查看电子签名
  // if (!fillId) {

  // }
  // isFinish
  // 【进行中】: status 1 && isFinish 0 【暂存】、【提交】    status 1 && isFinish 1【已成功参加，查看协议】
  // 【已结束】: status 2 && isFinish 0【已结束，未成功参加】   status 2 && isFinish 1【已成功参加，查看协议】
  // 【未开始】: 【问卷尚未开始收集，敬请期待】

  // qaStatus.value = 2
  // isFinish.value = false
  if (
    isFinish.value ||
    qaStatus.value === QA_STATUS.HAS_END ||
    qaStatus.value === QA_STATUS.NOT_START
  ) {
    document.title = '问卷预览'
  }

  // 在问卷可作答状态下加载并开始倒计时
  // if (qaStatus.value === QA_STATUS.IN_PROGRESS && !isFinish.value) {
  //   loadCountdownState()
  //   startCountdown()
  // }
})

const sortItemClick = (aItem: object, aIdx: number, answers: object) => {
  answers.splice(aIdx, 1) // 先把点击的元素移除
  aItem.checked = !aItem.checked ? 1 : 0
  let checkedIdx = 0
  for (; checkedIdx < answers.length; checkedIdx++) {
    const a = answers[checkedIdx]
    if (!a.checked) {
      break
    }
    // else {
    //   a.answerNo = checkedIdx + 1
    // }
  }
  answers.splice(checkedIdx, 0, aItem) // 添加到指定位置
  if (aItem.checked && checkedIdx + 1 == answers.length - 1) {
    const lastNum = answers.length - 1
    answers[lastNum].checked = 1
    // answers[lastNum].answerNo = lastNum + 1
  }

  for (let i = 0; i < answers.length; i++) {
    answers[i].answerNo = i + 1
  }
}

const inputClick = ($event, aItem, aIdx, qItem) => {
  // console.log('aItem =>', aItem)
  // console.log('aIdx =>', aIdx)
  // console.log('qItem =>', qItem)
  // console.log('qItem.checked =>', qItem.checked)
  // console.log('qItem.checked.indexOf(3) =>', qItem.checked.indexOf(3))
  // 单选选项带填空
  if (qItem.type === 0 && qItem.checked === aIdx) {
    $event.preventDefault()
    $event.stopPropagation()
  }
  // 多选选项带填空
  if (qItem.type === 1 && qItem.checked && qItem.checked.indexOf(aIdx) > -1) {
    $event.preventDefault()
    $event.stopPropagation()
  }
  // 排序选项带填空
  if (qItem.type === 2 && aItem.checked === 1) {
    $event.preventDefault()
    $event.stopPropagation()
  }
  // 填空题
  if (qItem.type === 3) {
  }
}

const radioGroupChange = (name, qItem) => {
  // name<number>: 0, 1, 2, 3 ...
  // console.log('name =>', name)
  // console.log('name =>', typeof name)
  // console.log('qItem =>', qItem)
  for (let i = 0; i < qItem.answers.length; i++) {
    const a = qItem.answers[i]
    a.checked = name === i ? 1 : 0
    if (a.type === 1 && i != name) {
      a.content = ''
    }
  }
}

const checkboxGroupChange = (names, qItem) => {
  // console.log('names =>', names)
  // console.log('qItem =>', qItem)
  for (let i = 0; i < qItem.answers.length; i++) {
    const a = qItem.answers[i]
    a.checked = names && names.indexOf(i) > -1 ? 1 : 0
    if (
      names &&
      names.length &&
      a.type === 1 &&
      names.indexOf(i) === -1 &&
      a.content &&
      a.content.length
    ) {
      a.content = ''
    }
  }
  // console.log('aIdx =>', aIdx)
}

const sliderChange = (value, aItem, qItem) => {
  // console.log('value =>', value)
  // console.log('aItem =>', aItem)
  // console.log('qItem.answers =>', qItem.answers)
  if (qItem.type === 3 && qItem.answerTotal > 10) {
    const total = qItem.answers.reduce((pre, cur) => {
      pre += cur.content
      return pre
    }, 0)
    if (total > qItem.answerTotal) {
      aItem.content = value - (total - qItem.answerTotal)
      showNotify({ type: 'warning', message: `总和不可超过${qItem.answerTotal}` })
    }
  }
  // for (let i = 0; i < qItem.answers.length; i++) {
  //   const a = qItem.answers[i]
  //   a.content = value
  // }
}

const saveClick = async () => {
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })
  const postData = {
    head: {
      auth,
    },
    data: {
      id: qaId.value,
      name: qaTitle.value,
      modules: modules.value,
    },
  }
  if (isSubmitting.value) return
  isSubmitting.value = true
  const saveRes = (await http.post('/amtn-form/form/submitForm', postData)).data
  isSubmitting.value = false
  // console.log('saveRes =>', saveRes)
  if (saveRes?.responseStatus?.errorcode === 0) {
    // 成功通知
    showNotify({ type: 'success', message: '保存成功' })
  } else {
    // 失败通知
    showNotify({ type: 'danger', message: '保存失败' })
  }
}

const submitClick = async () => {
  // 如果倒计时未结束，不允许提交
  if (countdown.value > 0) {
    showNotify({ type: 'warning', message: '请等待倒计时结束后再提交' })
    return
  }

  // 检查是否都已作答
  for (let i = 0; i < modules.value.length; i++) {
    const m = modules.value[i]
    for (let j = 0; j < m.questions.length; j++) {
      const q = m.questions[j]
      let checked = false
      let sortedCount = 0
      for (let k = 0; k < q.answers.length; k++) {
        const a = q.answers[k]
        if (q.type === 2) {
          if (a.checked === 1) {
            sortedCount++;
          }
          if (!a.checked) {
            // 排序题有一个选项未排序则终止
            // document
            //   ?.getElementById(`question-${q.questionNo}`)
            //   ?.scrollIntoView({ behavior: 'smooth' })
            // showDialog({
            //   title: `第${q.questionNo}题未作答`,
            //   message: `请点击第${q.questionNo}题的选项进行排序`,
            // }).then(() => {})
            // return
          } else if (a.checked === 1 && a.type === 1 && !a.content && k !== q.answers.length - 1) {
            // 非最后一项带填空但未填写内容则终止
            document
              ?.getElementById(`question-${q.questionNo}`)
              ?.scrollIntoView({ behavior: 'smooth' })
            showDialog({
              title: `第${q.questionNo}题未完成`,
              message: `请填写第${q.questionNo}题的填空内容`,
            }).then(() => {})
            return
          }
        } else if ((q.type === 0 || q.type === 1) && a.checked === 1) {
          // 单选、多选题
          checked = true
          if (a.type === 1 && !a.content) {
            // 带填空但未填写内容则终止
            document
              ?.getElementById(`question-${q.questionNo}`)
              ?.scrollIntoView({ behavior: 'smooth' })
            showDialog({
              title: `第${q.questionNo}题未作答`,
              message: `请填写第${q.questionNo}题的填空内容`,
            }).then(() => {})
            return
          }
        } else if (q.type === 3) {
          // 填空
          // 滑块百分比题
          if (
            q.answerTotal > 0 ||
            (q.answers[0]?.answerRange?.type === 'num' && q.answers[0]?.answerRange?.max > 10)
          ) {
            const total = q.answers.reduce((pre, cur) => {
              pre += cur.content
              return pre
            }, 0)
            if (total <= 0) {
              document
                ?.getElementById(`question-${q.questionNo}`)
                ?.scrollIntoView({ behavior: 'smooth' })
              showDialog({
                title: `第${q.questionNo}题未完成`,
                message: `请拖拽第${q.questionNo}题各选项的滑块填写百分比`,
              }).then(() => {})
              return
            }
            // if (total > q.answers[0]?.answerRange?.max) {
            //   document
            //     ?.getElementById(`question-${q.questionNo}`)
            //     ?.scrollIntoView({ behavior: 'smooth' })
            //   showDialog({
            //     title: `请认真作答第${q.questionNo}题`,
            //     message: `总和不可超过${q.answers[0]?.answerRange?.max}`,
            //   }).then(() => {})
            //   return
            // }
            // if (!a.content) {
            //   document
            //     ?.getElementById(`question-${q.questionNo}`)
            //     ?.scrollIntoView({ behavior: 'smooth' })
            //   showDialog({
            //     title: `第${q.questionNo}题未完成`,
            //     message: `请拖拽第${q.questionNo}题第${k + 1}项的滑块填写百分比`,
            //   }).then(() => {})
            //   return
            // }
          }
          // 评分题
          if (
            !q.answerTotal &&
            q.answers[0]?.answerRange?.type === 'num' &&
            q.answers[0]?.answerRange?.end <= 10
          ) {
            if (!a.content || a.content < 1) {
              document
                ?.getElementById(`question-${q.questionNo}`)
                ?.scrollIntoView({ behavior: 'smooth' })
              showDialog({
                title: `第${q.questionNo}题未完成`,
                message: `请对第${q.questionNo}题第${k + 1}项进行评分`,
              }).then(() => {})
              return
            }
            // console.log('q.answers =>', q.answers)
            // for (let i = 0; i < q.answers.length; i++) {
            //   const a = q.answers[i]
            //   if (!a.content || a.content < 1) {
            //     document
            //       ?.getElementById(`question-${q.questionNo}`)
            //       ?.scrollIntoView({ behavior: 'smooth' })
            //     showDialog({
            //       title: `第${q.questionNo}题未完成`,
            //       message: `请对第${q.questionNo}题第${i + 1}项进行评分`,
            //     }).then(() => {})
            //     return
            //   }
            // }
          }
          // 纯填空题
          if (!q.answerTotal && q.answers[0]?.answerRange?.type === 'text') {
            if (!a.content) {
              document
                ?.getElementById(`question-${q.questionNo}`)
                ?.scrollIntoView({ behavior: 'smooth' })
              showDialog({
                title: `第${q.questionNo}题未完成`,
                message: `请填写第${q.questionNo}题第${k + 1}项的填空内容`,
              }).then(() => {})
              return
            }
            // for (let i = 0; i < q.answers.length; i++) {
            //   const a = q.answers[i]
            //   if (!a.content) {
            //     document
            //       ?.getElementById(`question-${q.questionNo}`)
            //       ?.scrollIntoView({ behavior: 'smooth' })
            //     showDialog({
            //       title: `第${q.questionNo}题未完成`,
            //       message: `请填写第${q.questionNo}题第${i + 1}项的填空内容`,
            //     }).then(() => {})
            //     return
            //   }
            // }
          }
        }
      }
      if ((q.type === 0 || q.type === 1) && !checked) {
        // 单选、多选题一项都未选择则终止
        document.getElementById(`question-${q.questionNo}`).scrollIntoView({ behavior: 'smooth' })
        showDialog({
          title: `第${q.questionNo}题未作答`,
          message: `请阅读第${q.questionNo}题的问题并做出您的选择`,
        }).then(() => {})
        return
      } else if (q.type === 2) {
        // 排序题少于2项则终止
        if (sortedCount < 2) {
          document
            ?.getElementById(`question-${q.questionNo}`)
            ?.scrollIntoView({ behavior: 'smooth' })
          showDialog({
            title: `第${q.questionNo}题未完成`,
            message: `请点击至少2项或2项以上的选项进行排序`,
          }).then(() => {})
          return
        }
      }
    }
  }

  // 提交
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })
  const postData = {
    head: {
      auth,
    },
    data: {
      id: qaId.value,
      name: qaTitle.value,
      modules: modules.value,
    },
  }
  if (isSubmitting.value) return
  isSubmitting.value = true
  const submitRes = (await http.post('/amtn-form/form/submitForm', postData)).data
  isSubmitting.value = false
  // console.log('submitRes =>', submitRes)
  if (submitRes?.responseStatus?.errorcode === 0) {
    showDialog({
      title: `提交成功`,
      message: `问卷已成功提交，去签署协议`,
      confirmButtonText: '电子签名',
    }).then(() => {
      // 预览协议
      router.push({
        name: 'agreement-preview',
        params: {
          // qaId: qaId.value
        },
      })
    })
  } else {
    // 失败通知
    showNotify({ type: 'danger', message: '问卷提交失败' })
  }
}

// 查看已签署的协议
const seeAgreementClick = async () => {
  router.push({
    name: 'signed-agreement-preview',
    params: {
      qaId: qaId.value,
    },
  })
}
</script>

<template>
  <main class="page">
    <div class="title" v-if="qaTitle && pageStatus === PAGE_STATUS.SUCCESS">{{ qaTitle }}</div>
    <div
      class="desc"
      v-if="welcomeMsg && pageStatus === PAGE_STATUS.SUCCESS"
      v-html="welcomeMsg"
    ></div>
    <div
      class="list"
      v-if="modules.length && pageStatus === PAGE_STATUS.SUCCESS"
      :style="{
        'pointer-events':
          isFinish || qaStatus === QA_STATUS.HAS_END || qaStatus === QA_STATUS.NOT_START
            ? 'none'
            : 'inherit',
      }"
    >
      <div class="group" v-for="(mo, mIdx) in modules" :key="mIdx">
        <div class="g-title" v-if="mo.module">
          {{ `${groupNums[mo.moduleNo - 1]}、${mo.module}` }}
        </div>
        <div class="questions">
          <div
            class="question"
            v-for="(qItem, qIdx) in mo.questions"
            :key="qIdx"
            :id="'question-' + qItem.questionNo"
          >
            <div
              class="q-title"
              v-html="
                `${qItem.questionNo}. ${qItem.question}<span class='q-type' style='word-break:keep-all;color:#95a5a6;font-size:14px;padding:2px 8px;background:#ecf0f1;border-radius:4px;'>[${qTypes[qItem.type]}]</span>`
              "
            ></div>
            <RadioGroup
              v-model="qItem.checked"
              v-if="qItem.type === 0"
              icon-size="16px"
              @change="(name) => radioGroupChange(name, qItem)"
            >
              <Radio
                v-for="(aItem, aIdx) in qItem.answers"
                :key="aIdx"
                :name="aIdx"
                style="padding: 4px 0"
              >
                {{ `${optionNums[aItem.answerNo - 1]}. ${aItem.answer.split('<<<>>>')[0]}` }}
                <input
                  class="input"
                  v-model="aItem.content"
                  label="文本"
                  v-if="aItem.type === 1"
                  @click="inputClick($event, aItem, aIdx, qItem)"
                />
                {{ aItem.answer.split('<<<>>>')[1] || '' }}
              </Radio>
            </RadioGroup>
            <CheckboxGroup
              v-model="qItem.checked"
              shape="square"
              v-if="qItem.type === 1"
              icon-size="16px"
              @change="(names) => checkboxGroupChange(names, qItem)"
            >
              <Checkbox
                v-for="(aItem, aIdx) in qItem.answers"
                :key="aIdx"
                :name="aIdx"
                style="padding: 4px 0"
              >
                {{ `${optionNums[aItem.answerNo - 1]}. ${aItem.answer.split('<<<>>>')[0]}` }}
                <input
                  class="input"
                  v-model="aItem.content"
                  label="文本"
                  v-if="aItem.type === 1"
                  @click="inputClick($event, aItem, aIdx, qItem)"
                />
                {{ aItem.answer.split('<<<>>>')[1] || '' }}
              </Checkbox>
            </CheckboxGroup>
            <div class="sorts" v-if="qItem.type === 2">
              <div
                class="sort"
                v-for="(aItem, aIdx) in qItem.answers"
                :key="aIdx"
                :name="aIdx"
                @click.prevent="sortItemClick(aItem, aIdx, qItem.answers)"
              >
                <!-- <span class="sort-idx" v-if="aItem.checked === 1">
                  <svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M128,24A104,104,0,1,0,232,128,104.2,104.2,0,0,0,128,24Zm12,152a8,8,0,0,1-16,0V98.9l-11.6,7.8a8,8,0,0,1-8.8-13.4l24-16a8.3,8.3,0,0,1,8.2-.4A8,8,0,0,1,140,84Z"/></svg>
                </span> -->
                <span class="sort-idx" v-if="aItem.checked === 1" v-html="sourtNums[aIdx]"></span>
                <span class="sort-unchecked" v-if="!aItem.checked"></span>
                <span class="sort-item">{{ `${aItem.answer.split('<<<>>>')[0]}` }}</span>
                <input
                  class="input"
                  v-model="aItem.content"
                  label="文本"
                  v-if="aItem.type === 1"
                  @click="inputClick($event, aItem, aIdx, qItem)"
                />
              </div>
            </div>
            <!-- type === 3 填空题 包含多项全部必填填空/滑块样式填空/评分样式填空 -->
            <div class="blanks" v-if="qItem.type === 3">
              <!-- 百分比滑块题 -->
              <div
                v-if="
                  qItem.answerTotal > 0 ||
                  (qItem?.answers &&
                    qItem?.answers[0]?.answerRange?.type === 'num' &&
                    qItem?.answers[0]?.answerRange?.max > 10)
                "
              >
                <div class="blank" v-for="(aItem, aIdx) in qItem.answers" :key="aIdx" :name="aIdx">
                  <div class="blank-content">
                    <span class="blank-left">{{ `${aItem.answer.split('<<<>>>')[0]}` }}</span>
                    <span class="blank-middle">{{
                      `（ ${aItem.content || aItem.content === 0 ? aItem.content : ''} ）`
                    }}</span>
                    <span class="blank-right" v-if="aItem.answer.split('<<<>>>').length > 1">{{
                      `${aItem.answer.split('<<<>>>')[1]}`
                    }}</span>
                  </div>
                  <div style="margin: 12px 0 20px">
                    <Slider
                      v-model="aItem.content"
                      @change="(value) => sliderChange(value, aItem, qItem)"
                    />
                  </div>
                </div>
                <div class="slider-total" v-if="qItem.answerTotal > 0">
                  合计:
                  {{ qItem?.answers?.reduce((pre, cur) => pre + cur.content, 0) }} （总和不超过{{
                    qItem?.answerTotal
                  }}）
                </div>
              </div>
              <!-- 1-5/1-10分打分题 -->
              <div
                v-if="
                  !qItem.answerTotal &&
                  qItem.answers &&
                  qItem.answers[0]?.answerRange?.type === 'num' &&
                  qItem.answers[0]?.answerRange?.end <= 10
                "
              >
                <div class="blank" v-for="(aItem, aIdx) in qItem.answers" :key="aIdx" :name="aIdx">
                  <div class="blank-content">
                    <span class="blank-left">{{ `${aItem.answer.split('<<<>>>')[0]}` }}</span>
                    <span class="blank-middle">{{
                      `（ ${aItem.content || aItem.content === 0 ? aItem.content : ''} ）`
                    }}</span>
                    <span class="blank-right" v-if="aItem.answer.split('<<<>>>').length > 1">{{
                      `${aItem.answer.split('<<<>>>')[1]}`
                    }}</span>
                  </div>
                  <div style="margin: 0 0 6px">
                    <Rate
                      v-model="aItem.content"
                      :size="25"
                      color="#ffd21e"
                      void-icon="star"
                      void-color="#eee"
                      :count="aItem.answerRange.end"
                    />
                  </div>
                </div>
              </div>
              <!-- 纯填空题 -->
              <div
                v-if="
                  !qItem.answerTotal &&
                  qItem.answers &&
                  qItem.answers[0]?.answerRange?.type === 'text'
                "
              >
                <div class="blank" v-for="(aItem, aIdx) in qItem.answers" :key="aIdx" :name="aIdx">
                  <div class="blank-content">
                    <span class="blank-left">{{ `${aItem.answer.split('<<<>>>')[0]}` }}</span>
                    <input
                      class="input"
                      v-model="aItem.content"
                      label="文本"
                      v-if="aItem.type === 1"
                      @click="inputClick($event, aItem, aIdx, qItem)"
                    />
                    <span class="blank-right" v-if="aItem.answer.split('<<<>>>').length > 1">{{
                      `${aItem.answer.split('<<<>>>')[1]}`
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- // 【进行中】: status 1 && isFinish 0 【暂存】、【提交】    status 1 && isFinish 1【已成功参加，查看协议】
    // 【已结束】: status 2 && isFinish 0【已结束，未成功参加】   status 2 && isFinish 1【已成功参加，查看协议】
    // 【未开始】: 【问卷尚未开始收集，敬请期待】 -->
    <div
      class="bottom"
      v-show="pageStatus === PAGE_STATUS.SUCCESS && qaStatus === QA_STATUS.IN_PROGRESS && !isFinish"
    >
      <div class="save" @click.prevent="saveClick">暂存</div>
      <div class="commit" @click.prevent="submitClick">提交</div>
      <!-- <div class="commit" @click.prevent="submitClick" :class="{ disabled: countdown > 0 }">
        {{ countdownText }}
      </div> -->
    </div>
    <div class="bottom" v-show="pageStatus === PAGE_STATUS.SUCCESS && isFinish">
      <div class="see-agreement" @click.prevent="seeAgreementClick">已成功参加,查看协议</div>
    </div>
    <div
      class="bottom"
      v-show="pageStatus === PAGE_STATUS.SUCCESS && qaStatus === QA_STATUS.HAS_END && !isFinish"
    >
      <div class="has-end">问卷收集已结束,您未成功参加</div>
    </div>
    <div
      class="bottom"
      v-show="pageStatus === PAGE_STATUS.SUCCESS && qaStatus === QA_STATUS.NOT_START"
    >
      <div class="not-start">问卷尚未开始收集,敬请期待</div>
    </div>
    <div class="page-loading" v-show="pageStatus === PAGE_STATUS.LOADING">
      <Loading size="36px" vertical>加载中...</Loading>
    </div>
    <div class="page-loading" v-show="isSubmitting">
      <Loading size="36px" vertical>处理中...</Loading>
    </div>
    <div class="page-empty" v-show="pageStatus === PAGE_STATUS.FAILURE">问卷尚未开放，敬请期待</div>
  </main>
</template>

<style scoped lang="less">
.page {
  margin: -20px;
}
.title {
  padding: 0 16px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  line-height: 56px;
  // padding: 20px 0;
  position: relative;
  margin-top: 20px;
  margin-bottom: 24px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 2px;
  }
}
.desc {
  padding: 0 18px 12px;
  color: #454556;
  font-weight: 500;
  font-size: 16px;
  text-align: justify;
}
.list {
  color: #2c3e50;
  padding: 0 16px 24px;

  .group {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .g-title {
      color: #2c3e50;
      font-size: 20px;
      font-weight: 600;
      line-height: 36px;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 4px solid #3498db;
    }

    .questions {
      .question {
        padding: 16px;
        background: #f8fafc;
        border-radius: 12px;
        margin-bottom: 16px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .q-title {
          color: #2c3e50;
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          margin-bottom: 12px;

          .q-type {
            word-break: keep-all;
            color: #95a5a6;
            font-size: 14px;
            // margin-left: 8px;
            padding: 2px 8px;
            background: #ecf0f1;
            border-radius: 4px;
          }
        }

        .input {
          flex-grow: 1;
          height: 19px;
          font-size: 14px;
          display: inline-block;
          outline: none;
          border: none;
          border-bottom: 1px solid #e5e5e8;
          padding: 0 4px;
          margin-left: 8px;
          transition: all 0.3s ease;
          background-color: rgba(255, 255, 255, 0);
          width: 40%;
          border-radius: unset;

          &:focus {
            border-color: #3498db;
          }
        }

        .sorts {
          .sort {
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 4px 0;
            // background: #ffffff;
            // border-radius: 8px;
            // margin-bottom: 8px;
            transition: all 0.3s ease;

            &:hover {
              background: #f1f5f9;
            }

            .sort-idx {
              // display: inline-flex;
              // align-items: center;
              // justify-content: center;
              color: #3498db;
              width: 20px;
              height: 20px;
              background: #ebf5ff;
              border-radius: 50%;
              margin-right: 5px;
              margin-left: -1px;
            }

            .sort-unchecked {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 1px solid rgb(199, 200, 203);
              margin-right: 8px;
            }

            .sort-item {
              // margin-left: 8px;
              // flex: 1;
              font-size: 15px;
              color: #2c3e50;
            }
          }
        }
      }
      :last-child {
        margin-bottom: 0;
      }
    }
  }
}
.bottom {
  position: sticky;
  bottom: 20px;
  width: 100%;
  padding: 0 16px;
  // background: linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 100%);
  // backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  z-index: 100;
}
.save {
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc((100% - 12px) * 0.333333333);
  height: 48px;
  border-radius: 24px;
  // border: 2px solid #e5e5e8;
  // background-color: white;
  color: #95a5a6;
  // text-align: center;
  // line-height: 44px;
  font-size: 16px;
  // font-weight: 400;
  transition: all 0.3s ease;

  // &:hover {
  //   border-color: #3498db;
  //   color: #3498db;
  // }

  font-weight: 400;
  flex: 1;
  color: #454556;
  background: #ffffff;
  border: 1px solid #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);

  &:hover {
    color: #ffffff;
    background: #3498db;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(52, 152, 219, 0.1);
  }
}
.commit {
  width: calc((100% - 12px) * 0.666666666);
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  color: #fff;
  text-align: center;
  line-height: 48px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(52, 152, 219, 0.3);
  }

  &.disabled {
    background: linear-gradient(90deg, #95a5a6, #7f8c8d);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(149, 165, 166, 0.2);

    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(149, 165, 166, 0.2);
    }
  }
}

.see-agreement {
  width: 100%;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  color: #fff;
  text-align: center;
  line-height: 48px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(52, 152, 219, 0.3);
  }
}

.has-end,
.not-start {
  width: 100%;
  height: 48px;
  border-radius: 24px;
  // background: #f1f5f9;
  // color: #95a5a6;
  // text-align: center;
  // line-height: 48px;
  font-size: 16px;
  // font-weight: 500;

  font-weight: 400;
  color: #454556;
  background: #ffffff;
  border: 1px solid #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ffffff;
    background: #3498db;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(52, 152, 219, 0.1);
  }
}

.page-loading {
  // height: 200px;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.van-loading__text) {
    color: #3498db;
    font-size: 16px;
    margin-top: 12px;
  }
}

.page-empty {
  height: calc(100vh - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  color: #95a5a6;
  background: #f8fafc;
  border-radius: 16px;
  margin: 20px;
}
</style>
