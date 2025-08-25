import { createRouter, createWebHistory } from 'vue-router'
import QAView from '../views/QAView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: QAView,
      meta: { title: '填写问卷' },
    },
    {
      path: '/qa',
      name: 'qa',
      component: () => import('../views/QAView.vue'),
      meta: { title: '填写问卷' },
    },
    {
      path: '/qa/:id',
      name: 'qa_with_id',
      component: () => import('../views/QAView.vue'),
      meta: { title: '填写问卷' },
    },
    {
      path: '/ds/:qaId/:fillId',
      name: 'ds',
      component: () => import('../views/DigitalSignatureView.vue'),
      meta: { title: '签署姓名' },
    },
    {
      path: '/camera',
      name: 'camera',
      component: () => import('../views/CameraView.vue'),
      meta: { title: '面部识别' },
    },
    {
      path: '/agreement-preview',
      name: 'agreement-preview',
      component: () => import('../views/AgreementPreviewView.vue'),
      meta: { title: '预览协议' },
    },
    {
      path: '/signed-agreement-preview/:qaId',
      name: 'signed-agreement-preview',
      component: () => import('../views/SignedAgreementPreviewView.vue'),
      meta: { title: '查看已签署协议' },
    },
    {
      path: '/mine',
      name: 'mine',
      component: () => import('../views/MineView.vue'),
      meta: { title: '问卷列表' },
    },
    {
      path: '/qrcode',
      name: 'qrcode',
      component: () => import('../views/QrCodeView.vue'),
      meta: { title: '扫码参与' },
    },
    {
      path: '/yshome',
      name: 'yshome',
      component: () => import('../views/YSHome.vue'),
      meta: { title: '2025中青年医师知识竞赛活动首页' },
    },
    {
      path: '/ysupload',
      name: 'ysupload',
      component: () => import('../views/YSUpload.vue'),
      meta: { title: '中青年医师知识竞赛题目上传' },
    },
    {
      path: '/ysreview',
      name: 'ysreview',
      component: () => import('../views/YSReview.vue'),
      meta: { title: '中青年医师知识竞赛题目审核' },
    },
    {
      path: '/ysanswer',
      name: 'ysanswer',
      component: () => import('../views/YSAnswer.vue'),
      meta: { title: '中青年医师知识竞赛' },
    },
  ],
})

router.beforeEach((to, from) => {
  // console.log('to =>', to)
  // console.log('from =>', from)
  if (window.ISPC && to.path !== '/qrcode' && to.path.indexOf('/ys') === -1) {
    router.replace({
      name: 'qrcode',
      params: {},
    })
  }
})

router.afterEach(async (to /* , from */) => {
  if (to?.meta?.title) {
    document.title = to?.meta?.title as string
  }
})

export default router
