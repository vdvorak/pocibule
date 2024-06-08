import './style.css'

const COLORS = {
  YELLOW: '#ffeb3b',
  GREEN: '#aeea00',
  BLUE: '#80deea',
  ORANGE: '#ff9e00',
}

let LAST_BOARD_ID = 0
let LAST_COLUMN_ID = 0
let LAST_NODE_ID = 0
let boards = {}
let TEXTURE = './public/vite.svg'

function save() {
  localStorage.setItem(
    'data',
    JSON.stringify({
      boards,
      LAST_BOARD_ID,
      LAST_COLUMN_ID,
      LAST_NODE_ID,
    })
  )
}

function load() {
  const data = JSON.parse(localStorage.getItem('data'))
  boards = data?.boards || {}
  LAST_BOARD_ID = data?.LAST_BOARD_ID || 0
  LAST_COLUMN_ID = data?.LAST_COLUMN_ID || 0
  LAST_NODE_ID = data?.LAST_NODE_ID || 0
}

load()

function addBoard(title, colWidth = 300) {
  const id = `b${LAST_BOARD_ID++}`
  boards[id] = {
    title,
    id,
    colWidth,
    cols: {},
    nodes: {},
  }

  return id
}

function addColumn(boardId, title) {
  const id = `${boardId}-c${LAST_COLUMN_ID++}`
  boards[boardId].cols[id] = {
    boardId,
    id,
    title,
    index: Object.keys(boards[boardId].cols).length + 1,
  }

  return id
}

function addNode(boardId, title = 'New node', color = COLORS.YELLOW) {
  const id = `${boardId}-n${LAST_NODE_ID++}`
  boards[boardId].nodes[id] = {
    boardId,
    id,
    title,
    posX: 20,
    posY: 20,
    color,
  }

  return id
}

function createBoard(board) {
  const boardElement = document.createElement('div')
  const imgElement = document.createElement('img')

  boardElement.id = board.id
  boardElement.classList.add('board')
  boardElement.style.backgroundImage = `url(${TEXTURE})`
  boardElement.append(...Object.values(board.cols).map(createColumn))
  boardElement.append(...Object.values(board.nodes).map(createNode))

  boardElement.addEventListener('dragover', dragOver, false)
  boardElement.addEventListener('drop', drop, false)

  return boardElement
}

function createColumn(col) {
  const colElement = document.createElement('div')
  colElement.id = col.id
  colElement.classList.add('col')

  const headerElement = document.createElement('div')
  headerElement.classList.add('colHeader')
  headerElement.innerText = col.title

  const bodyElement = document.createElement('div')
  bodyElement.classList.add('colBody')

  colElement.append(headerElement, bodyElement)

  return colElement
}

function createNode(node) {
  const nodeElement = document.createElement('div')
  const valueElement = document.createElement('div')

  nodeElement.id = node.id
  nodeElement.draggable = true
  nodeElement.classList.add('node')
  nodeElement.style.background = node.color
  nodeElement.style.left = node.posX + 'px'
  nodeElement.style.top = node.posY + 'px'

  nodeElement.addEventListener('dragstart', (e) => dragStart(node, e), false)

  valueElement.innerText = node.title
  nodeElement.appendChild(valueElement)

  return nodeElement
}

function dragStart(node, event) {
  const style = window.getComputedStyle(event.target, null)

  const x = parseInt(style.getPropertyValue('left'), 10) - event.clientX
  const y = parseInt(style.getPropertyValue('top'), 10) - event.clientY

  node.posX = x
  node.posY = y
  event.dataTransfer.setData('text/plain', JSON.stringify(node))
}

function dragOver(event) {
  event.preventDefault()
  return false
}

function drop(event) {
  const oldNode = JSON.parse(event.dataTransfer.getData('text/plain'))
  const node = boards[oldNode.boardId].nodes[oldNode.id]

  const nodeElement = document.getElementById(node.id)

  const x = event.clientX + parseInt(node.posX, 10)
  const y = event.clientY + parseInt(node.posY, 10)

  node.posX = x
  node.posY = y

  nodeElement.style.left = x + 'px'
  nodeElement.style.top = y + 'px'

  event.preventDefault()
  save()
  return false
}

document.querySelector('#app').append(...Object.values(boards).map(createBoard))