
const toCurrency = price => {
  return new Intl.NumberFormat('en-En', {
    currency: 'usd',
    style: 'currency'
  }).format(price)
}

document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(node.textContent)
})

let csrf;
const $cart = document.querySelector('#cart')

if ($cart) {
  $cart.addEventListener('click', event => {
    if (event.target.classList.contains('js-remove')) {
      const id = event.target.dataset.id
      if (!csrf) {
        csrf = event.target.dataset.csrf
      }

      fetch('/cart/remove/' + id, {
        method: 'delete',
        headers: {
          'X-CSRF-TOKEN': csrf
        }
      }).then(res => res.json())
        .then(cart => {
          if (cart.courses.length) {
            const html = cart.courses.map(c => {
              return `
              <tr>
              <td>${c.title}</td>
              <td>${c.count}</td>
              <td>
                <button
                  class="btn btn-primary js-remove"
                  data-id="${c.id}"
                >Delete</button>
              </td>
            </tr>
              `
            }).join('')
            $cart.querySelector('tbody').innerHTML = html
            $cart.querySelector('.price').textContent = toCurrency(cart.price)
          } else {
            $cart.innerHTML = '<p>The cart is empty</p>'
          }
        })
    }
  })
}

const toDate = date => {
  return new Intl.DateTimeFormat('en-En', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

document.querySelectorAll('.date').forEach(node => {
  node.textContent = toDate(node.textContent)
})

M.Tabs.init(document.querySelectorAll('.tabs'))