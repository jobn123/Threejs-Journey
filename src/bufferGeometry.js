import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import * as dat from 'dat.gui';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// 设置灯光与阴影
// 1 材质要满足能够对光照有反应
// 2 设置渲染器开启阴影计算 renderer.shadow.enabled = true
// 3 设置光照投射阴影 directionalLight.castShadow = true
// 4 设置物体投射阴影 sphere.castshadow = true
// 5 设置物体接收阴影 plane.receiveShadow = true

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

const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20)
const material = new THREE.MeshStandardMaterial({
  // metalness: 0.7,
  // roughness: 0.1,
  // envMap 会覆盖scene.environment
  // envMap: envMapTexture 
})
const mesh = new THREE.Mesh(sphereGeometry, material)
mesh.castShadow = true
scene.add(mesh)

const planeGeometry = new THREE.PlaneBufferGeometry( 10, 10 );
const plane = new THREE.Mesh( planeGeometry, material );
plane.position.set(0, -1, 0);
plane.rotation.x = -Math.PI / 2
plane.receiveShadow = true
scene.add( plane );

// 创建标准网络材质需要配合光照物理效果
// 环境光
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light)

// 直线光
const directionLight = new THREE.DirectionalLight(0xffffff, 1)
// 设置平行光位置
directionLight.position.set(10, 10, 10)
directionLight.castShadow = true
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