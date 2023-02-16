import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import * as dat from 'dat.gui';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const gui = new dat.GUI()

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight

// 创建场景
const scene = new THREE.Scene()

// 创建相机
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 1, 1000)

// 设置相机位置
camera.position.set(0, 0, 10)

// 将相机添加到场景
scene.add(camera)

const param = {
  count: 10000,
  size: 0.1,
  radius: 5,
  branch: 10,
  color: '#ff6030',
  endColor: '#1b3984',
  rotateScale: .3
}

const centerColor =  new THREE.Color(param.color)
const endColor = new THREE.Color(param.endColor)

// generateGalaxy
let geometry = null
let material = null

const generateGalaxy = () => {
  const positions = new Float32Array(param.count * 3)
  const colors = new Float32Array(param.count * 3) 
  geometry = new THREE.BufferGeometry()

  for (let i = 0; i < param.count; i++) {
    // 当前的点应该在那一条分支上
    const branchAngle = (i % param.branch) * ((2 * Math.PI) / param.branch)

    // 当前点距圆心的位置
    const distance = Math.random() * param.radius * Math.pow(Math.random(), 3)
    const current = i * 3

    const randomX = (Math.pow(Math.random() * 2 - 1, 3) * (param.radius - distance)) / 5
    const randomY = (Math.pow(Math.random() * 2 - 1, 3) * (param.radius - distance)) / 5
    const randomZ = (Math.pow(Math.random() * 2 - 1, 3) * (param.radius - distance)) / 5

    positions[current] = Math.sin(branchAngle + distance * param.rotateScale) * distance + randomX
    positions[current + 1] = 0 + randomY 
    positions[current + 2] = Math.cos(branchAngle + distance * param.rotateScale) * distance + randomZ

    // 混合颜色
    const mixColor = centerColor.clone()
    mixColor.lerp(endColor, distance / param.radius)

    colors[current] = mixColor.r
    colors[current + 1] = mixColor.g
    colors[current + 2] = mixColor.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // 载入纹理
  const textureLoader = new THREE.TextureLoader()
  const pointTexture = textureLoader.load('./textures/particles/1.png')

  material = new THREE.PointsMaterial({
    // color: new THREE.Color(param.color),
    size: param.size,
    // 相机深度而衰减
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.ActiveBlending,
    map: pointTexture,
    alphaMap: pointTexture,
    transparent: true,
    vertexColors: true
  })

  const point = new THREE.Points(geometry, material)
  scene.add(point)
}

generateGalaxy()

// 创建标准网络材质需要配合光照物理效果
// 环境光
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light)

// 直线光
const directionLight = new THREE.DirectionalLight(0xffffff, .5)
// 设置平行光位置
directionLight.position.set(5, 5, 5)
// 光开启投影
directionLight.castShadow = true
// 设置投影模糊度
directionLight.radius = 20
// 设置阴影贴图分辨率
directionLight.shadow.mapSize.set(2048, 2048)

// 设置平行光投射相机的属性
directionLight.shadow.camera.near = 0.5
directionLight.shadow.camera.far = 500
directionLight.shadow.camera.top = 5
directionLight.shadow.camera.bottom = -5
directionLight.shadow.camera.left = -5
directionLight.shadow.camera.right = 5
scene.add(directionLight)

// 初始化渲染器
const renderer = new THREE.WebGLRenderer()
// 设置渲染器大小
renderer.setSize(WIDTH, HEIGHT)
// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement)

// 渲染器开启阴影计算
renderer.shadowMap.enabled = true
// renderer.render(scene, camera)
 
// 轨道控制器 可以使得相机围绕物体360度运动
const controls = new OrbitControls(camera, renderer.domElement)
// 设置控制器阻尼，让动画更有真实性
controls.enableDamping = true
// controls.update()

// 添加坐标轴辅助器
// The X axis is red. The Y axis is green. The Z axis is blue.
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

window.addEventListener('dblclick', ()=> {
  if (!document.fullscreenElement) {
    renderer.domElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
})

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  // 使用渲染器 通过相机 将场景渲染出来
  renderer.render(scene, camera)
}

animate()

// 监听页面变化， 更新渲染画面
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth  / window.innerHeight
  // 更新摄像机投影矩阵
  camera.updateProjectionMatrix()
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 设置渲染器像素比
  renderer.setPixelRatio(window.devicePixelRatio)
})