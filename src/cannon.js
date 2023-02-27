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

// 创建物理世界
const world = new CANNON.World()
world.gravity.set(0, -9.8, 0)

// 设置物体材质
const cubeWorldMaterial = new CANNON.Material('cube')
const cubeArr = []
function createCube() {
  // 添加小球和平面
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
  const cubeMaterial = new THREE.MeshStandardMaterial()
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.castShadow = true
  scene.add(cube)

  // 创建物理世界小球
  const cubeShape = new CANNON.Box(new CANNON.Vec3(.5, .5, .5))

  // 创建物理世界物体
  const cubeBody = new CANNON.Body({
    shape: cubeShape,
    position: new CANNON.Vec3(0, 0, 0),
    // 小球质量
    mass: 1,
    // 物体材质
    material: cubeWorldMaterial
  })

  // 施加力的大小 方向 位置
  cubeBody.applyLocalForce(
    new CANNON.Vec3(180, 0, 0), // 施加力的大小和位置
    new CANNON.Vec3(0, 0, 0) // 施加力所在的方向
  )
  // 将物体添加到物理世界
  world.addBody(cubeBody)

  // 监听碰撞事件
  function HitEvent(e) {
    // 获取碰撞强度
    // 可以添加击打音效
    // const impactStrength = e.contact.getImpactVelocityAlongNormal()
    // console.log(impactStrength)
  }
  cubeBody.addEventListener('collide', HitEvent)
  cubeArr.push({
    mesh: cube,
    body: cubeBody,
  })
}

window.addEventListener('click', createCube)
createCube()

const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial())
floor.position.y = -5
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)


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
  cubeWorldMaterial,
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

// 设置世界碰撞的默认材料,如果材料没有设置,都用这个
world.defaultContactMaterial = defaultContactMaterial

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
  // cube.position.copy(cubeBody.position)
  cubeArr.forEach((item) => {
    item.mesh.position.copy(item.body.position)
    // 设置渲染物体跟随物理的物体旋转
    item.mesh.quaternion.copy(item.body.quaternion)
  })

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
