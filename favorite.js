const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')

function renderMovieList(data) {
  let rawHtml = ''
  data.forEach((item) => {
    rawHtml += `<div class="col-sm-3">
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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = rawHtml
}

//modal的函式
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

//收藏功能: 移除資料
function removeFromFavorite(id) {
  //防止錯誤: 喜歡清單中如果沒有目標東西則結束函式 或 沒有東西也結束函式
  if (!movies || !movies.length) return
  //透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  //刪除該筆電影
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  //將畫面同步
  renderMovieList(movies)
}

//按鈕事件: 第一個按鈕功能: modal的製作。 第二個功能收藏"+"
dataPanel.addEventListener('click', function onClickPanel(event) {
  if (event.target.matches('.btn-show-movie')) {
    modalMovieList(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)

