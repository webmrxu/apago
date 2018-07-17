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
    currentTime: 0, // 当前视频播放的进度
    logoImg: 'https://www.apago.top/video/logos.png', // logo图片资源地址
    balloonImg: 'https://www.apago.top/examples/ball/balloon.png', 
    goldImg: 'https://www.apago.top/examples/gold/gold-s.png',
    
    // 以下为动画状态
    showTestButton: false,
    showGold: false, // 展示金币
    showBalloon: false, // 展示气球
    golds: [[100, 100, false]], // x , time: 开始落下时间, isShow: true展示

    showText: false // 以下为页面状态
  },
  canvasIdErrorCallback: function (e) {
    console.error('canvas画布启动失败：' + e.detail.errMsg)
  },
  videoBinderror: function(e) {
    console.error('视频播放错误' + e.detail.errMsg)
  },
  onReady: function () {
    /**
     * 页面初始化
     */
    this.initPage()
    /**
     * 页面资源加载
     */
    this.downlodFile()
    /**
     * 生成随机金币
     */
    this.generatorGolds()
  },
  generatorGolds: function() {
    // console.log(this.data.golds)
    let goldsNumber = 50 // 生成金币数量
    let golds = []
    for (let i = 0; i < goldsNumber; i++) {
      let randomX = Math.floor((Math.random() * this.data.screenWidth) + 1);
      let randomTime = Math.floor((Math.random() * 24) + 1);
      // console.log(randomX, randomTime)
      let goldItem = [randomX, randomTime, false]
      golds.push(goldItem)
    }
    this.setData({
      golds: golds
    })
  },
  bindtimeupdate: function(event) {
    /**
     * 视频播中放触发事件，获取视频播放信息，进度
     */
    let currentTIme = event.detail.currentTime.toFixed(1) * 1000;
    // 播放时间映射到动画
    this.timeMappingAnimation(currentTIme);
    // 保存动画播放时间
    this.setData({
      currentTime: currentTIme
    })
  },
  timeMappingAnimation: function (currentTime){
    /**
     * 视频播放时间映射到动画
     */
    let gapTimes = (currentTime - this.data.currentTime) / 100;
    for (let i = 0; i < gapTimes; i++) {
      let keyAnimation = 'videoMappingAnimation_' + (this.data.currentTime + i * 100)
      if (this[keyAnimation]) {
        let ani = this[keyAnimation]
        ani()
      }
    }
  },
  videoInit: function() {
    /**
     * 视频初始化，回到视频开始播放前状态
     */
    let ctx = wx.createContext();
    ctx.clearRect(0, 0, this.data.videoWidth, this.data.videoHeight);
    wx.drawCanvas({
      canvasId: 'canvas',
      actions: ctx.getActions()
    })

    this.setData({
      showText: false
    })
  },
  videoBindended: function() {
    /**
     * 视频播放到末尾时触发的事件
     * 视频循环时不会触发该事件
     */
    this.videoInit()
  },
  videoMappingAnimation_300: function() {
    /**
     * 以视频开始100 毫秒时，初始化状态
     */
    this.videoInit()
  },
  initPage: function() {
    /**
     * 获取视频组件上下文
     */
    this.videoContext = wx.createVideoContext('video')
    this.setData({
      videoContext: wx.createVideoContext('video')
    })
    // this.videoPlay()
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
    // let ctx = wx.createCanvasContext('canvas')
    // ctx.drawImage(this.data.balloonImg, 0, 0, this.data.balloonImg.width, this.data.balloonImg.height, 0, 0, 134.5, 182.5)
    // ctx.draw()
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

    wx.downloadFile({
      url: me.data.balloonImg,
      success: function (res) {
        if (res.statusCode === 200) {
          me.data.balloonImg = res.tempFilePath
        }
      },
      fail: () => { console.log('balloon 图片加载失败') }
    })

    wx.downloadFile({
      url: me.data.goldImg,
      success: function (res) {
        if (res.statusCode === 200) {
          me.data.goldImg = res.tempFilePath
        }
      },
      fail: () => { console.log('balloon 图片加载失败') }
    })
  },
  videoPlay: function() {
    this.videoContext.play()
  },
  videoBindplay: function() {
    /**
     * 视频开始播放时触发
     * 如果视频循环播放，只会在第一次循环时触发事件
     */
  },
  videoMappingAnimation_400: function () {
    let ctxSetting = {
      lineWidth: 5,
      centerX: this.data.videoWidth / 2,
      centerY: this.data.videoHeight / 2,
      fps: 24, // 动画帧数
      animationTime: 18 //视频的时长对应动画的时长， 单位为秒
    }
    // console.log(ctxSetting)
    let allTimes = ctxSetting.fps * ctxSetting.animationTime; //  定时器总执行次数
    let times = 0; // 当前定时器执行次数
    let timer = setInterval(() => {
      times = times + 1
      // 映射帧动画
      this.fpsMappingAnimation(ctxSetting, times)

      if (times == allTimes) {
        console.log('结束定时器')
        clearInterval(timer);
      }
    }, 1000 / ctxSetting.fps)
    let me = this
  },
  fpsMappingAnimation: function(setting, fps) {
    /**
     * 所有的canvas动画帧
     */
    let ctx = wx.createCanvasContext('canvas')
    ctx.clearRect(0, 0, this.data.videoWidth, this.data.videoHeight)
    /**
     * 配置所有动画
     */
    timeToAnimation.bind(this)(10, 12, coverLogo, ctx)
    timeToAnimation.bind(this)(2, 8, drawBalloon, ctx)
    timeToAnimation.bind(this)(6, 10, drawGold, ctx)

    ctx.draw()
    /**
     * 时间映射动画
     * @params start 开始时间，单位秒
     * @params end 结束时间，单位秒
     * @params animation 时间内对应的动画
     */
    function timeToAnimation(start, end, animation, ctx) {
      if (fps >= start * setting.fps && fps <= end * setting.fps) {
        animation.bind(this)(fps - start * setting.fps, (end - start) * setting.fps, ctx)
      }
    }

    function coverLogo(currentFps, allFps, ctx) {
      let x = this.data.videoWidth + 333 - currentFps * (this.data.videoHeight + 333) / allFps;
      ctx.beginPath();
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#fff'
      // 绘制二次贝塞尔曲线
      ctx.moveTo(x, 0)
      ctx.quadraticCurveTo(x - 400, this.data.videoHeight / 2, x, this.data.videoHeight);
      // // 绘制全屏
      ctx.lineTo(this.data.videoWidth, this.data.videoHeight);
      ctx.lineTo(this.data.videoWidth, 0);
      ctx.stroke();
      ctx.closePath();
      ctx.fill();
      // 绘制中行logo
      let textX = x + (this.data.screenWidth - 220) / 2 - 160;
      if (textX < 77.5) {
        ctx.drawImage(this.data.logoImg, 77.5, (this.data.screenHeight - 66) / 2);
      } else {
        ctx.drawImage(this.data.logoImg, textX, (this.data.screenHeight - 66) / 2);
      }
    }

    function drawGold(currentFps, allFps, ctx){
      // console.log(currentFps)
      this.data.golds.forEach((v, i) => {
        // [x , time , false]
        console.log(v[1])
        let drawTime = 2 // 下落时间：单位秒
        let top
        if (currentFps > v[1] && currentFps < drawTime * setting.fps+v[1]){
          top = this.easeIn(currentFps-v[1], 0, this.data.videoHeight, drawTime * setting.fps)
          console.log(top)
        }

        if (currentFps > drawTime * setting.fps + v[1]){
          top = this.easeIn(drawTime * setting.fps, 0, this.data.videoHeight, drawTime * setting.fps)
        }
        ctx.drawImage(this.data.goldImg, 0, 0, this.data.goldImg.width, this.data.goldImg.height, v[0], top, 16, 12.5)
      })
      

      
      

    }

    function drawBalloon(currentFps, allFps, ctx){
      let drawTime = 2 // 下落时间：单位秒
      let top
      if (currentFps < drawTime * setting.fps){
        top = this.easeIn(currentFps, 0, 200, drawTime * setting.fps)
        
      } else {
        top = this.easeIn(drawTime * setting.fps, 0, 200, drawTime * setting.fps)
      }
      ctx.drawImage(this.data.balloonImg, 0, 0, this.data.balloonImg.width, this.data.balloonImg.height, 0, top, 134.5, 182.5)
    }
  },
  easeIn: function (t, b, c, d) {
    return c * (t /= d) * t + b;
  }
})
