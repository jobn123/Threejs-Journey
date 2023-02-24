import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui';
import * as CANNON from 'cannon-es';

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight

// 创建场景
const scene = new THREE.Scene()

// 创建相机
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 300)

// 设置相机位置
camera.position.set(0, 0, 18)

// 将相机添加到场景
scene.add(camera)

// 添加小球和平面
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial()
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphereMesh.castShadow = true
scene.add(sphereMesh)

const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial())
floor.position.y = -5
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)

// 创建物理世界
const world = new CANNON.World()
world.gravity.set(0, -9.8, 0)
// 创建物理世界小球
const sphereShape = new CANNON.Sphere(1)

// 设置物体材质
const sphereWorldMaterial = new CANNON.Material('sphere')

// 创建物理世界物体
const sphereBody = new CANNON.Body({
  shape: sphereShape,
  position: new CANNON.Vec3(0, 0, 0),
  // 小球质量
  mass: 1,
  // 物体材质
  material: sphereWorldMaterial
})
// 将物体添加到物理世界
world.addBody(sphereBody)

// 监听碰撞事件
function HitEvent(e) {
  // 获取碰撞强度
  // 可以添加击打音效
  const impactStrength = e.contact.getImpactVelocityAlongNormal()
  console.log(impactStrength)
}
sphereBody.addEventListener('collide', HitEvent)

// 创建物理世界地面
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
const floorWorldMaterial = new CANNON.Material('floor')
floorBody.material = floorWorldMaterial
// 质量为0时,可以使得物体保持不动
floorBody.mass = 0
floorBody.addShape(floorShape)
// 设置地面位置
floorBody.position.set(0, -5, 0)
// 旋转地面位置
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(floorBody)

// 设置两种材质碰撞的参数
const defaultContactMaterial = new CANNON.ContactMaterial(
  sphereMaterial,
  floorWorldMaterial,
  {
    // 摩擦力
    friction: 0.1,
    // 弹性
    restitution: 0.7
  }
)
// 将关联材质添加到物理世界
world.addContactMaterial(defaultContactMaterial)

// 添加环境光 平行光
const ambientLight = new THREE.AmbientLight(0xffffff, .5)
scene.add(ambientLight)
const directionLight = new THREE.DirectionalLight(0xffffff, .5)
directionLight.castShadow = true
scene.add(directionLight)

// 初始化渲染器
// 渲染器透明
const renderer = new THREE.WebGLRenderer({ alpha: true })
// 设置渲染器大小
renderer.setSize(WIDTH, HEIGHT)
// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement)

// 轨道控制器 可以使得相机围绕物体360度运动
const controls = new OrbitControls(camera, renderer.domElement)
// 设置控制器阻尼，让动画更有真实性
controls.enableDamping = true

// 添加坐标轴辅助器
// The X axis is red. The Y axis is green. The Z axis is blue.
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

// 渲染器开启阴影计算
renderer.shadowMap.enabled = true

// renderer.render(scene, camera)

const clock = new THREE.Clock()


function animate() {
  // const time = clock.getElapsedTime()
  const deltaTime = clock.getDelta()

  // 更新物理引擎世界的物体
  world.step(1 / 60, deltaTime)
  sphereMesh.position.copy(sphereBody.position)

  requestAnimationFrame(animate)
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
