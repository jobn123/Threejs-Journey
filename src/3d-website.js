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
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 300)

// 设置相机位置
camera.position.set(0, 0, 18)

// 将相机添加到场景
scene.add(camera)

const cubeGeometry = new THREE.BoxBufferGeometry(2, 2, 2)
const material = new THREE.MeshBasicMaterial({
  color: '#fff',
  wireframe: true
})
const redMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000'
})
const cubeArr = []
const cubeGroup = new THREE.Group()
// 创建立方体
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    for (let k = 0; k < 5; k++) {
      const cube = new THREE.Mesh(cubeGeometry, material)
      cube.position.set(i * 2 - 5, j * 2 - 5, k * 2 -5)
      cubeGroup.add(cube)
      cubeArr.push(cube)
    }
  }
}

scene.add(cubeGroup)

// 创建三角形
let triangle;
const triangleGroup = new THREE.Group()
for(let i = 0; i < 50; i++) {
  const geometry = new THREE.BufferGeometry()
  const positionArray = new Float32Array(9)
  // 每个三角形需要三个顶点，每个顶点需要三个坐标
  for(let j = 0; j < 9; j++) {
    positionArray[j] = Math.random() * 10 - 5
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
  const color = new THREE.Color(Math.random(), Math.random(), Math.random())
  const material = new THREE.MeshBasicMaterial({ 
    color, 
    transparent: true, 
    opacity: .5,
    side: THREE.DoubleSide 
  })
  triangle = new THREE.Mesh(geometry, material)
  triangleGroup.add(triangle)
}

triangleGroup.position.y = -30
scene.add(triangleGroup)

// 生成星系
const param = {
  count: 2000,
  size: 0.4,
  radius: 8,
  branch: 8,
  color: '#ff6030',
  endColor: '#1b3984',
  rotateScale: .3
}

const centerColor =  new THREE.Color(param.color)
const endColor = new THREE.Color(param.endColor)

// generateGalaxy
let geometry = null
let pointMaterial = null
const pointGroup = new THREE.Group()
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

  pointMaterial = new THREE.PointsMaterial({
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

  const point = new THREE.Points(geometry, pointMaterial)
  pointGroup.add(point)
  // scene.add(point)
}

pointGroup.position.y = -60
// pointGroup.scale = 4
scene.add(pointGroup)

generateGalaxy()

const animateGroup = [cubeGroup, triangleGroup, pointGroup]
// 创建投射光线对象
const raycaster = new THREE.Raycaster()

// 鼠标位置的对象
const mouse  =  new THREE.Vector2()

// 监听鼠标位置
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) - .5
  mouse.y = (event.clientY / window.innerHeight) -.5
})

// 初始化渲染器
// 渲染器透明
const renderer = new THREE.WebGLRenderer({ alpha: true })
// 设置渲染器大小
renderer.setSize(WIDTH, HEIGHT)
// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement)

// 渲染器开启阴影计算
renderer.shadowMap.enabled = true

// renderer.render(scene, camera)

const clock = new THREE.Clock()

gsap.to(cubeGroup.rotation, {
  x: '+=' + Math.PI * 2,
  y: '-=' + Math.PI * 2,
  duration: 10,
  repeat: -1,
  yoyo: true,
  easing: 'power2.inOut',
})

gsap.to(triangleGroup.rotation, {
  x: '+=' + Math.PI,
  z: '-=' + Math.PI,
  duration: 5,
  repeat: -1,
  yoyo: true,
  easing: 'power2.inOut',
})

gsap.to(pointGroup.rotation, {
  z: '+=' + Math.PI,
  y: '-=' + Math.PI,
  duration: 6,
  repeat: -1,
  yoyo: true,
  easing: 'power2.inOut',
})

function animate() {
  // const time = clock.getElapsedTime()
  const deltaTime = clock.getDelta()
  // cubeGroup.rotation.x = time * .3
  // cubeGroup.rotation.y = time * .3

  // triangleGroup.rotation.x = time * .3
  // triangleGroup.rotation.y = time * .3

  // pointGroup.rotation.x = time * .3
  // pointGroup.rotation.y = time * .3

  // 根据当前滚动的scrollY 设置相机移动位置
  camera.position.y = -(window.scrollY / window.innerHeight) * 30
  // 物体水平晃动
  camera.position.x += (mouse.x * 10 - camera.position.x) * deltaTime * 5

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

// 监听页面滚动
// 设置当前页
let currentPage = 0
window.addEventListener('scroll', () => {
  const newPage = Math.round(window.scrollY / window.innerHeight)
  if (newPage !== currentPage) {
    currentPage = newPage
    gsap.to(animateGroup[currentPage].rotation, {
      x: '+=' + Math.PI,
      y: '-=' + Math.PI,
      duration: 3
    })

    // 移动标题
    gsap.fromTo(`.page${currentPage} h1`, {
      x: -300
    }, {
      x: 0,
      rotation: "+=" + 360,
      duration: 1
    })

    gsap.fromTo(`.page${currentPage} h3`, {
      opacity: 0,
      y: -20,
    }, {
      opacity: 1,
      y: 0,
      delay: .5,
      duration: 1
    })
    console.log('页面发生改变, 当前页面是:', newPage)
  }
})