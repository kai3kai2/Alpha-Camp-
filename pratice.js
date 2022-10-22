const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const MOVIES_PAGE = 12

// 新增變數: 初始當前頁面設定為 1 
let nowPage = 1

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// 新增變數: 點擊切換畫面按鈕標籤
const changeModeButton = document.querySelector('#change-mode')


// 修改: 渲染電影到畫面，偵測當前id的 mode 並導入相應的模板。
function renderMovieList(data) {
  // 第一個: Card 模板，避免畫面殘留先清空畫面
  if (dataPanel.dataset.mode === 'card-mode') {
    let rawHtml = ''

    data.forEach((item) => {
      rawHtml += `<div class="col-sm-3" id="img-movies">
      <div class="mb-2">
        <div class="card" style="width: 18rem;">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="Movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer text-muted">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
        </div>
      </div>
    </div>`
    })
    // 渲染畫面
    dataPanel.innerHTML = rawHtml

    // 第二個: list 模板，避免畫面殘留先清空畫面
  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHtml = ''

    data.forEach((item) => {
      rawHtml +=
        `<div class="col-12" id="list-movies">
        <div class="border-top  pt-3 pb-4 d-flex justify-content-between">
          <h6 class="card-title" style="font-size: 18px; font-weight: bold;">
            ${item.title}
          </h6>
          <div style="padding-right: 23%">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
              data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>`
    })
    // 渲染畫面
    dataPanel.innerHTML = rawHtml
  }
}


// 新增: 改變 id 標籤函式，當前頁面
function changeMoviesMode(mode) {
  if (dataPanel.dataset.mode === 'card-list') return
  dataPanel.dataset.mode = mode
}


// 新增: 切換畫面的按鈕監聽器： 用card-mode/ list-mode 渲染畫面，先改變標籤後渲染畫面，畫面會導向的分頁器畫面
changeModeButton.addEventListener('click', function onClickPanel(event) {

  if (event.target.matches('#card-mode')) {
    changeMoviesMode('card-mode')
    renderMovieList(getMoviePage(nowPage))

  } else if (event.target.matches('#list-mode')) {
    changeMoviesMode('list-mode')
    renderMovieList(getMoviePage(nowPage))
  }
})

// 分頁器功能製作: 切割成12部電影畫面
function getMoviePage(page) {

  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PAGE

  // 切割資料
  return movies.slice(startIndex, startIndex + MOVIES_PAGE)
}


// 分頁器畫面內容製作
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  // 渲染頁數的畫面
  paginator.innerHTML = rawHTML
}


// 製作分頁器的事件監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {

  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)

  // 修改: 避免頁面因為點擊切換畫面的按鈕而回到第一頁，改成導向當前頁面
  nowPage = page
  renderMovieList(getMoviePage(nowPage))
})


// modal的函式
function modalMovieList(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImg = document.querySelector('#modal-movie-image')
  const modalDate = document.querySelector('#movie-modal-release_date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = `release_date: ${data.release_date}`
    modalDescription.innerText = data.description
    modalImg.innerHTML = `<img
                src="${POSTER_URL + data.image}"
                alt="movie-poster" id="img-fluid">`
  })
}

// 收藏功能: 存取資料
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  // 錯誤: 檢視有無重複的電影在清單裡， 否則跳出警告。
  if (list.some((movie) => movie.id === id)) {
    alert('收藏清單裡有重複的電影')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


// 按鈕事件監聽器: 第一個按鈕功能: 點擊more跳出相應modal。 第二個功能:點擊 "+" 收藏
dataPanel.addEventListener('click', function onClickPanel(event) {
  if (event.target.matches('.btn-show-movie')) {
    modalMovieList(Number(event.target.dataset.id))

  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


// 搜尋功能: 按下sumbit 事件監聽器
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {

  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter(movies =>
    movies.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  renderPaginator(filteredMovies.length)

  // 修改: 預設顯示第 1 頁的搜尋結果
  nowPage = 1
  renderMovieList(getMoviePage(nowPage))
})


// 電影的API
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)

  // 修改: 當前頁面
  renderMovieList(getMoviePage(nowPage))

}).catch((error) => {
  console.log(error)
})

