<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Overlay } from 'vant'
const show = ref(true)
</script>

<template>
  <main class="page">
    <div class="container">
      <div class="wrapper">
        <img
          class="qrcode"
          src="https://rs-os-lyh-dt-publicread-picture-bosmetadata-prod.liangyihui.net/boss-upload/tWXL4ZW-g6KQkd5fms1DUw/3ky96ax67xJdsneK.png"
        />
        <div class="desc">请使用手机扫码参与问卷调研</div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="less">
.page {
  margin: -20px;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  .container {
    background: var(--van-overlay-background);
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;

    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .qrcode {
      width: 60vw;
      height: 60vw;
      width: 240px;
      height: 240px;
      border-radius: 8px;
      background-color: #fff;
    }
    .desc {
      color: white;
      font-size: 16px;
      padding: 8px;
    }
  }
}
</style>
