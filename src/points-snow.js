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
camera.position.set(0, 0, 40)

// 将相机添加到场景
scene.add(camera)

const particiesGeometry = new THREE.BufferGeometry()
const COUNT = 5000

const positions = new Float32Array(COUNT * 3)
// const colors = new Float32Array(COUNT * 3)

for(let i = 0; i < COUNT * 3; i++) {
  positions[i] = (Math.random() -  .5) * 60
  // colors[i] = 0x00ffff
}

particiesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
// 要想生效需要设置vertexColors
// particiesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// 设置点材质
const pointsMaterial = new THREE.PointsMaterial()
pointsMaterial.size = 1
pointsMaterial.color.set('#fff')
// 相机深度而衰减
pointsMaterial.sizeAttenuation = true
// pointsMaterial.vertexColors = true

// 载入纹理
const textureLoader = new THREE.TextureLoader()
const pointTexture = textureLoader.load('./textures/particles/snow.png')

// 设置纹理
pointsMaterial.map = pointTexture
pointsMaterial.alphaMap = pointTexture
pointsMaterial.transparent = true
// 渲染材质是否对深度缓冲区有任何影响
pointsMaterial.depthWrite = false
// 设置材质叠加模式
pointsMaterial.blending = THREE.AdditiveBlending

const points = new THREE.Points(particiesGeometry, pointsMaterial)
scene.add(points)

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

const clock = new THREE.Clock()

function animate() {
  const time = clock.getElapsedTime()

  points.rotation.x = time * .1
  points.rotation.y = time * .05

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