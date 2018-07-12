//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    fps: 24, // 动画帧
    screenWidth: 0, // 屏幕宽度
    screenHeight: 0, // 屏幕高度
    videoWidth: 0, // video 元素宽度，对应canvas元素宽度
    videoHeight: 0, // video 元素高度，对应canvas元素高度
    videoContext: {},
    currentTime: 0,
    logoImg: 'https://www.apago.top/video/logos.png'
  },
  canvasIdErrorCallback: function (e) {
    console.error('canvas画布启动失败：' + e.detail.errMsg)
  },
  onReady: function () {
    /**
     * 页面初始化
     */
    this.initPage()
    /**
     * 页面元素事件绑定
     */
    this.bindEvent()
    /**
     * 页面资源加载
     */
    this.downlodFile()

    console.log(this)
  },
  bindtimeupdate: function(event) {
    /**
     * 视频播放触发事件，获取视频播放信息，进度
     */
    let currentTIme = event.detail.currentTime.toFixed(1) * 1000;
    // 播放时间映射到动画
    this.timeMappingAnimation(currentTIme);
    // 保存动画播放时间
    this.setData({
      currentTime: currentTIme
    })
    // pageObj.currentTime = currentTIme;
  },
  timeMappingAnimation: function (currentTime){
    /**
     * 视频播放时间映射到动画
     */
    let gapTimes = (currentTime - this.data.currentTime) / 100;
    for (let i = 0; i < gapTimes; i++) {
      let keyAnimation = 'animation_' + (this.data.currentTime + i * 100)
      if (this[keyAnimation]) {
        let ani = this[keyAnimation]
        ani()
      }
    }
  },
  animation_7000: function() {
    let ctxSetting = {
      lineWidth: 5,
      centerX: this.data.videoWidth / 2,
      centerY: this.data.videoHeight / 2,
      fillStyle: '#fff', // 填充颜色
      strokeStyle: '#fff', // 描边颜色
      fps: 24, // 动画帧数
      animationTime: 2 //动画时长，单位 秒
    }
    // console.log(ctxSetting)
    let allTimes = ctxSetting.fps * ctxSetting.animationTime; //  定时器总执行次数
    let times = 0; // 当前定时器执行次数
    let timer = setInterval(() => {
      times = times + 1;
      let x = this.data.videoWidth + 333 - times * (this.data.videoHeight + 333) / allTimes;
      animationFps(x, ctxSetting.centerY);
      if (times == allTimes) {
        clearInterval(timer);
      }
    }, 1000 / ctxSetting.fps)
    let me = this
    function animationFps(x, y) {
      let ctx = wx.createContext()
      ctx.clearRect(0, 0, me.data.videoWidth, me.data.videoHeight);
      ctx.beginPath();
      ctx.fillStyle = ctxSetting.fillStyle;
      ctx.strokeStyle = ctxSetting.strokeStyle;

      // 画圈
      // ctx.arc(x, y, pageObj.screenHeight/2, 0.5*Math.PI, 1.5*Math.PI);
      // 绘制二次贝塞尔曲线
      ctx.moveTo(x, 0)
      ctx.quadraticCurveTo(x - 400, y, x, me.data.videoHeight);
      // 绘制全屏
      ctx.lineTo(me.data.videoWidth, me.data.videoHeight);
      ctx.lineTo(me.data.videoWidth, 0);
      ctx.stroke();
      ctx.closePath();
      ctx.fill();
      // 绘制中行logo
      let textX = x + (me.data.screenWidth - 220) / 2 - 160;
      if (textX < 77.5) {
        ctx.drawImage(me.data.logoImg, 77.5, (me.data.screenHeight - 66) / 2);
      } else {
        ctx.drawImage(me.data.logoImg, textX, (me.data.screenHeight - 66) / 2);
      }
      // ctx.drawImage(me.data.logoImg, 77.5, (me.data.screenHeight - 66) / 2);
      
      wx.drawCanvas({
        canvasId: 'canvas',
        actions: ctx.getActions()
      })
    }

    // let context = wx.createContext()
    // context.beginPath(0)
    // context.arc(150, 50, 5, 0, Math.PI * 2)
    // context.setFillStyle('#f46a64')
    // context.setStrokeStyle('rgba(1,1,1,0)')
    // context.fill()
    // context.stroke()

    // wx.drawCanvas({
    //   canvasId: 'canvas',
    //   actions: context.getActions()
    // })
  },
  bindEvent: function() {
    // this.videoContext
  },
  initPage: function() {
    /**
     * 获取视频组件上下文
     */
    this.videoContext = wx.createVideoContext('video')
    this.setData({
      videoContext: wx.createVideoContext('video')
    })
    this.videoContext.play()
    /**
     * 获取窗口的宽度和高度
     */
    wx.getSystemInfo({
      success: (system) => {
        this.setData({
          screenWidth: system.windowWidth,
          screenHeight: system.windowHeight
        })
      }
    })
    /**
     * 获取视频元素的宽度和高度
     */
    let query = wx.createSelectorQuery().select('#video').boundingClientRect()
    query.exec((res) => {
      this.setData({
        videoWidth: res[0].width,
        videoHeight: res[0].height
      })
    })
    
  },
  downlodFile: function() {
    let me = this
    wx.downloadFile({
      url: me.data.logoImg,
      success: function (res) {
        if (res.statusCode === 200) {
          me.data.logoImg = res.tempFilePath
        }
      },
      fail: () => {console.log('logo 图片加载失败')}
    })
  }
})
