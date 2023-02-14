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

// 导入纹理
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('./textures/minecraft.png')

// 设置纹理算法
// https://threejs.org/docs/index.html?q=texture#api/en/textures/Texture.magFilter
texture.minFilter = THREE.NearestFilter
texture.magFilter = THREE.NearestFilter

// 设置纹理偏移
// doorColorTexture.offset.x = 0.5
// doorColorTexture.offset.set(0.5, 0.5)
// 设置纹理旋转的原点
// doorColorTexture.center.set(0.5, 0.5)
// 设置纹理旋转
// doorColorTexture.rotation = Math.PI / 4
// 设置纹理重复
// 水平重复两次 垂直重复三次
// doorColorTexture.repeat.set(2, 3)
// 设置纹理重复模式
// doorColorTexture.wrapS = THREE.MirroredRepeatWrapping
// doorColorTexture.wrapT = THREE.RepeatWrapping

// 创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ 
  color: '#ffff00',
  // map: doorColorTexture 
  map: texture
})
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

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