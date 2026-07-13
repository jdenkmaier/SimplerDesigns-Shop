import HTML from './page-cart.html';

export default class PageCart {
    constructor(args) {
        args.target.innerHTML = HTML;

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (cart.length === 0) {
            args.target.querySelector('#cartList').innerHTML = '<p class="text-muted">Dein Warenkorb ist leer.</p>';
        } else {
            let html = '';
            for (let i = 0; i < cart.length; i++) {
                const item = cart[i];
                html += `
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <img src="${args.app.apiUrl}shop/article/${item.articleId}/thumbnail"
                             style="height:60px; width:60px; object-fit:cover;"
                             onerror="this.style.display='none'">
                        <span>${item.name} — ${item.price} €</span>
                        <button class="btn btn-secondary btn-sm" data-index="${i}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>`;
            }
            args.target.querySelector('#cartList').innerHTML = html;

            //Eventlistener für die Entfernen-Buttons
            args.target.querySelectorAll('[data-index]').forEach(btn => {
                btn.addEventListener('click', () => {
                    args.app.removeFromCart(Number(btn.dataset.index));
                    location.reload();
                });
            });

            let total = 0;
            for (const item of cart) {
                total = total + item.price;
            }
            args.target.querySelector('#cartTotal').innerText = total.toFixed(2);
        }
    }
}
