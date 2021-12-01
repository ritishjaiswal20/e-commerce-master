///

const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
// const cartBtn = document.querySelector('.cart-btn');
const clearCartBtn = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products-center')
//cart
let cart = []
//butttons
let buttonsDOM = []

//getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json')
      let data = await result.json()
      let products = data.items
      products = products.map((item) => {
        const { title, price } = item.fields
        const { id } = item.sys
        const image = item.fields.image.fields.file.url
        return { title, price, id, image }
      })
      return products
    } catch (error) {
      console.log(error)
    }
  }
}
//Display products
class UI {
  displayProducts(products) {
    let result = ''
    products.forEach((product) => {
      result += `
          <!-- single product -->
              <article class="product">
                  <div class="img-container">
                      <img src=${product.image} alt="product" class="product-img">
                      <button class="bag-btn" data-id=${product.id}>
                          <i class="fas fa-shopping-cart"></i>
                          add to bag
                      </button>
                  </div>
                  <h3>${product.title}</h3>
                  <h4>${product.price}</h4>
              </article>
            <!-- end of single product -->
        `
    })
    productsDOM.innerHTML = result
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')]
    buttonsDOM = buttons
    buttons.forEach((button) => {
      let id = button.dataset.id
      let inCart = cart.find((item) => item.id === id)
      if (inCart) {
        button.innerText = 'In Cart'
        button.disabled = true
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = 'In Cart'
        event.target.disabled = true
        //get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 }

        //add product to cart
        cart = [...cart, cartItem]

        //save the cart in local storage
        Storage.saveCart(cart)
        //set cart values
        this.setCartValues(cart)
        //display cart item
        this.addCartItem(cartItem)
        //show the cart
        this.showCart()
      })
    })
  }
  setCartValues(cart) {
    let tempTotal = 0
    let itemsTotal = 0
    cart.map((item) => {
      tempTotal += item.price * item.amount
      itemsTotal += item.amount
    })
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
    cartItems.innerText = itemsTotal
  }
  addCartItem(item) {
    const div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = `
<img src=${item.image} alt="product">
                      <div>
                          <h4>${item.title}</h4>
                          <h5>$${item.price}</h5>
                          <span class="remove-item" data-id= ${item.id} >remove</span>
                      </div>
                      <div>
                          <i class="fas fa-chevron-up " data-id= ${item.id}></i>
                          <p class="item-amount">${item.amount}</p>
                          <i class="fas fa-chevron-down" data-id= ${item.id}></i>
                      </div>
`
    cartContent.appendChild(div)
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg')
    cartDOM.classList.add('showCart')
  }
  setupAPP() {
    cart = Storage.getCart()
    this.setCartValues(cart)
    this.populateCart(cart)
    cartBtn.addEventListener('click', this.showCart)
    closeCartBtn.addEventListener('click', this.hideCart)
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item))
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg')
    cartDOM.classList.remove('showCart')
  }
  cartLogic() {
    //clear cart button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart()
    })
    //cart functionality
    cartContent.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target
        let id = removeItem.dataset.id
        cartContent.removeChild(removeItem.parentElement.parentElement)
        this.removeItem(id)
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target
        let id = addAmount.dataset.id
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount + 1
        Storage.saveCart(cart)
        this.setCartValues(cart)
        addAmount.nextElementSibling.innerText = tempItem.amount
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target
        let id = lowerAmount.dataset.id
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount - 1
        if (tempItem.amount > 0) {
          Storage.saveCart(cart)
          this.setCartValues(cart)
          lowerAmount.previousElementSibling.innerText = tempItem.amount
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement)
          this.removeItem(id)
        }
      }
    })
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id)
    cartItems.forEach((id) => this.removeItem(id))
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart()
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id)
    this.setCartValues(cart)
    Storage.saveCart(cart)
    let button = this.getSingleButton(id)
    button.disabled = false
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id)
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products))
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'))
    return products.find((product) => product.id === id)
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : []
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI()
  const products = new Products()

  //setup application
  ui.setupAPP()

  //get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products)
      Storage.saveProducts(products)
    })
    .then(() => {
      ui.getBagButtons()
      ui.cartLogic()
    })
})

///

const countdown = document.querySelector('.countdown')

// Set Launch Date (ms)
const launchDate = new Date('Jan 1, 2022 13:00:00').getTime()

// Update every second
const intvl = setInterval(() => {
  // Get todays date and time (ms)
  const now = new Date().getTime()

  // Distance from now and the launch date (ms)
  const distance = launchDate - now

  // Time calculation
  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  // Display result
  countdown.innerHTML = `
  <div>${days}<span>Days</span></div> 
  <div>${hours}<span>Hours</span></div>
  <div>${mins}<span>Minutes</span></div>
  <div>${seconds}<span>Seconds</span></div>
  `

  // If launch date is reached
  if (distance < 0) {
    // Stop countdown
    clearInterval(intvl)
    // Style and output text
    countdown.style.color = '#17a2b8'
    countdown.innerHTML = 'Launched!'
  }
}, 1000)

// coming sonn end

const counters = document.querySelectorAll('.counter')
const speed = 500 // The lower the slower

counters.forEach((counter) => {
  const updateCount = () => {
    const target = +counter.getAttribute('data-target')
    const count = +counter.innerText

    // Lower inc to slow and higher to slow
    const inc = target / speed

    // console.log(inc);
    // console.log(count);

    // Check if target is reached
    if (count < target) {
      // Add inc to count and output in counter
      counter.innerText = count + inc
      // Call function every ms
      setTimeout(updateCount, 1)
    } else {
      counter.innerText = target
    }
  }

  updateCount()
})

let sliderImages = document.querySelectorAll('.slide'),
  arrowLeft = document.querySelector('#arrow-left'),
  arrowRight = document.querySelector('#arrow-right'),
  current = 0

// Clear all images
function reset() {
  for (let i = 0; i < sliderImages.length; i++) {
    sliderImages[i].style.display = 'none'
  }
}

// Init slider
function startSlide() {
  reset()
  sliderImages[0].style.display = 'block'
}

// Show prev
function slideLeft() {
  reset()
  sliderImages[current - 1].style.display = 'block'
  current--
}

// Show next
function slideRight() {
  reset()
  sliderImages[current + 1].style.display = 'block'
  current++
}

// Left arrow click
arrowLeft.addEventListener('click', function () {
  if (current === 0) {
    current = sliderImages.length
  }
  slideLeft()
})

// Right arrow click
arrowRight.addEventListener('click', function () {
  if (current === sliderImages.length - 1) {
    current = -1
  }
  slideRight()
})

startSlide()

class TypeWriter {
  constructor(txtElement, words, wait = 3000) {
    this.txtElement = txtElement
    this.words = words
    this.txt = ''
    this.wordIndex = 0
    this.wait = parseInt(wait, 10)
    this.type()
    this.isDeleting = false
  }

  type() {
    // Current index of word
    const current = this.wordIndex % this.words.length
    // Get full text of current word
    const fullTxt = this.words[current]

    // Check if deleting
    if (this.isDeleting) {
      // Remove char
      this.txt = fullTxt.substring(0, this.txt.length - 1)
    } else {
      // Add char
      this.txt = fullTxt.substring(0, this.txt.length + 1)
    }

    // Insert txt into element
    this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`

    // Initial Type Speed
    let typeSpeed = 300

    if (this.isDeleting) {
      typeSpeed /= 2
    }

    // If word is complete
    if (!this.isDeleting && this.txt === fullTxt) {
      // Make pause at end
      typeSpeed = this.wait
      // Set delete to true
      this.isDeleting = true
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false
      // Move to next word
      this.wordIndex++
      // Pause before start typing
      typeSpeed = 500
    }

    setTimeout(() => this.type(), typeSpeed)
  }
}

// Init On DOM Load
document.addEventListener('DOMContentLoaded', init)

// Init App
function init() {
  const txtElement = document.querySelector('.txt-type')
  const words = JSON.parse(txtElement.getAttribute('data-words'))
  const wait = txtElement.getAttribute('data-wait')
  // Init TypeWriter
  new TypeWriter(txtElement, words, wait)
}
