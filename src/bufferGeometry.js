import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import * as dat from 'dat.gui';

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

const event = {}
event.onLoad = () => {
  console.log('加载完成')
}
event.onProgress = (url, cur, total) => {
  console.log('当前地址:', url)
  console.log('当前位置:', cur)
  console.log('总数:', total)
}
event.onError = () => {
  console.log('加载失败')
}
// 纹理加载进度情况
const manager = new THREE.LoadingManager(event.onLoad, event.onProgress, event.onError)

// 导入纹理
const textureLoader = new THREE.TextureLoader(manager)
const texture = textureLoader.load('./textures/door/color.jpg')

// 透明贴图
const alphaTexure = textureLoader.load('./textures/door/alpha.jpg')

// 环境遮挡贴图
const aoTexture = textureLoader.load('./textures/door/ambientOcclusion.jpg')

// 置换贴图
// 置换贴图要设置顶点数量还要配合displacementScale使用
const doorHeightTexture = textureLoader.load('./textures/door/height.jpg')

// 粗糙度贴图
const doorRoughnessTexture = textureLoader.load('./textures/door/roughness.jpg')

// 金属贴图
const doorMetalnessTexture = textureLoader.load('./textures/door/metalness.jpg')

// 法线贴图
const normalTexture = textureLoader.load('./textures/door/normal.jpg')

// 创建几何体
// 透明纹理要设置 alphaMap 和 transparnet 
const geometry = new THREE.BoxGeometry(1, 1, 1, 100, 100, 100)
const material = new THREE.MeshStandardMaterial({ 
  color: '#ffff00',
  // map: doorColorTexture 
  map: texture,
  alphaMap: alphaTexure,
  transparent: true,
  // 默认只渲染一面
  side: THREE.DoubleSide,
  // 环境遮挡贴图
  aoMap: aoTexture,
  // 环境遮挡贴图强度
  aoMapIntensity: 1,
  // 置换贴图
  displacementMap: doorHeightTexture,
  displacementScale: 0.05,
  // 粗糙度
  roughness: 1,
  roughnessMap: doorRoughnessTexture,
  // 金属度
  metalness: 1,
  metalnessMap: doorMetalnessTexture,
  // 法线贴图
  normalMap: normalTexture,
})
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// 环境遮挡贴图需要设置第二组uv 
geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2)) 

// 创建标准网络材质需要配合光照物理效果
// 环境光
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light)

// 直线光
const directionLight = new THREE.DirectionalLight(0xffffff, 1)
// 设置平行光位置
directionLight.position.set(10, 10, 10)

scene.add(directionLight)

const planeGeometry = new THREE.PlaneBufferGeometry(1, 1, 200, 200)
const plane = new THREE.Mesh(planeGeometry, material)
plane.position.x = 2;
scene.add(plane)

planeGeometry.setAttribute('uv2', new THREE.BufferAttribute(planeGeometry.attributes.uv.array, 2))

// 初始化渲染器
const renderer = new THREE.WebGLRenderer()
// 设置渲染器大小
renderer.setSize(WIDTH, HEIGHT)
// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement)

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

function animate(time) {
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