<template>
  <div>
    <div class="banner-container hidden-sm-and-down">
      <div class="banner-shadow"></div>
      <div class="banner-title">
        <div class="banner-title-text">
          <div class="banner-left">{{ $t(config.title) }}</div>
          <div class="banner-right">{{ $t(config.titleline) }}</div>
        </div>
      </div>
    </div>
    <img src="../../assets/ir_tar3_6.png" class="img-responsive hidden-sm-and-up" width="100%">
    <div class="banner-title-mobile hidden-sm-and-up">
      <div class="banner-left">{{ config.title }}</div>
    </div>
  </div>
</template>

<script>
import { config } from '@/mixins/config'

export default {
  name: 'banner',
  mixins: [ config ]
}
</script>

<style scoped>

.banner-container {
  background: rgb(26,116,176);
  background: linear-gradient(90deg, rgba(26,116,176,1) 30%, rgba(13,107,171,0.2) 68%, rgba(0,0,0,0) 68%), url(../../assets/ir_tar3_6.png) no-repeat scroll right top;
  box-shadow: 0 79px 40px -62px rgba(70, 70, 70, 0.4) inset, 0 -79px 40px -62px rgba(70, 70, 70, 0.4) inset;
  padding: 0;
  height: 175px;
  margin: auto;
}

div.banner-shadow {
  background: url(../../assets/banner-shadow.png) no-repeat scroll right top;
  background-size: 100% 100%;
  height: 175px;
  display: block;
  width: 68%;
}

div.banner-title {
  height: 175px;
  display: block;
  color: white;
  font-size: 16pt;
  line-height: 20pt;
  width: 68%;
  opacity: 0.7;
  filter: alpha(opacity=70);
  background: #0063a6;
  position: relative;
  top: -175px;
}

div.banner-title-text {
  padding: 0 11%;
  width: 740px;
  display: table-cell;
  vertical-align: middle;
  height: 175px;
}

.banner-left {
  width: 20%;
  padding-right: 10px;
  display: table-cell;
}

.banner-right {
  display: table-cell;
  padding-left: 10px;
  border-left: 1px solid white;
}

div.banner-title-mobile {
  display: block;
  color: white;
  font-size: 14pt;
  line-height: 16pt;
  width: 100%;
  opacity: 0.8;
  filter: alpha(opacity=80);
  background: #0063a6;
  padding: 6px 10px;
}

.img-responsive {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>