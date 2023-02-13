import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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

// 创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1)
// 创建材质
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
// 根据几何体材质创建物体
const cube = new THREE.Mesh(geometry, material)
// 修改物体的位置
// cube.position.set(5, 0, 0)
// cube.position.x = 3
// 缩放
// cube.scale.set(3, 2, 1)
// cube.scale.x = 5
// 旋转 Math.PI = 180
// cube.rotation.set(Math.PI / 4, 0 , 0)

// 往场景添加物体
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
// controls.update()

// 添加坐标轴辅助器
// The X axis is red. The Y axis is green. The Z axis is blue.
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

function animate(time) {
  const t = (time / 1000) % 5
  cube.position.x = t * 1
  requestAnimationFrame(animate)
  // controls.update()
  // 使用渲染器 通过相机 将场景渲染出来
  renderer.render(scene, camera)
}

animate()