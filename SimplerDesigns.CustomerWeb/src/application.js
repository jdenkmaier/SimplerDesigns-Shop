import './../css/app.css';
import './../css/custom-style.css';


import MainNav              from './navigation/main-nav.js';
import Footer               from './navigation/footer.js';
import NewsletterBanner     from './navigation/newsletter-banner.js';
import PageMain             from "./page-main.js";
import PageLogin            from "./page-login.js";
import PageRegister         from "./page-register.js";
import PageAccount          from "./page-account.js";
import PageClothes           from './page-clothes.js';
import PageAccessories       from './page-accessories.js';
import PageArticle          from './page-article.js';
import PageCart             from './page-cart.js';
import PageCheckout         from './page-checkout.js';

export default class Application {
    //=================================================================================================================
    // private vars
    //=================================================================================================================
    // Use relative API paths so webpack-dev-server can proxy requests during local development.
    #apiUrl = 'http://localhost:5000/';

    #header = null;
    #main = null;
    #footer = null;
    #user = null;
    #nav = null;

    //=================================================================================================================
    constructor() {
        // ----------------------------
        this.#header = document.querySelector('header');
        this.#main = document.querySelector('main');
        this.#footer = document.querySelector('footer');
        
        // ----------------------------
        window.addEventListener( 'hashchange', (e) => {
            this.#navigate(e.target.location.hash);
        } );

        // ----------------------------
        //Lädt User aus LocalStorage, falls vorhanden
        const saved = localStorage.getItem('user');
        if (saved) this.#user = JSON.parse(saved);

        this.#navigate(location.hash || '#main');

        
    }

    //====================================================================================
    // private methods
    //====================================================================================
    #navigate(l) {
        this.#footer.innerHTML = '';
        this.#main.innerHTML = '';

        this.#nav = new MainNav({
            target: this.#header,
            user: this.#user
        });

        let parts = l.split('?');
        let hash = parts[0];
        let pars = parts[1];

        let args = {
            app: this,
            target: this.#main
        };

        const searchParams = new URLSearchParams(pars);
        for (const [key, value] of searchParams) args[key] = value;

        switch(hash) {
            case '#login':
                new PageLogin(args);
                break;
            case '#registrieren':
                new PageRegister(args);
                break;
            case '#account':
                new PageAccount(args);
                break;
            case '#clothes':
                new PageClothes(args);
                break;
            case '#accessories':
                new PageAccessories(args);
                break;
            case '#article':
                new PageArticle(args);
                break;
            case '#cart':
                new PageCart(args);
                break;
            case '#checkout':
                new PageCheckout(args);
                break;

            default:
                new PageMain(args);
                break;
        }

        new NewsletterBanner({ target: this.#footer });
        new Footer({ target: this.#footer });
    }

    //=================================================================================================================
    // public properties
    //=================================================================================================================
    get header() {
        return this.#header;
    }

    get main() {
        return this.#main;
    }

    get footer() {
        return this.#footer;
    }

    get nav() {
        return this.#nav;
    }

    get apiUrl() {
        return this.#apiUrl;
    }

    get user() {
        return this.#user;
    }

    set user(v) {
        this.#user = v;
        if (this.#nav) this.#nav.user = v;
    }


  //=================================================================================================================
  // public methods
  //=================================================================================================================
  apiGet(controller, successCallback, errorCallback) {
    fetch(this.#apiUrl + controller,{
        method: 'GET',
        credentials: 'include',
        cache: 'no-cache',
    }).then((r) => {
      if (r.status == 200) return r.json();
      else throw new Error(r.status + ' ' + r.statusText);
    })
    .then(successCallback)
    .catch(errorCallback);
  }

  apiSet(controller, successCallback, errorCallback, id, dataObject) {

    let b = null;
    let h = null;
    if (dataObject) {
        b = JSON.stringify(dataObject);
    } 

    fetch(this.#apiUrl + controller + (id ? '/' + id : ''), {
        credentials: 'include',
        method: id ? 'PUT' : 'POST',
        body: b,
        cache: 'no-cache',
        headers: {
            'content-type': 'application/json'
        }
    })
    .then((r) => {
      if (r.status == 200) return r.json();
      else if (r.status == 401) throw r.json();
      else throw new Error(r.status + ' ' + r.statusText);
    })
    .then(successCallback)
    .catch(errorCallback);
  }

  apiDelete(controller, successCallback, errorCallback, id) {
    if (id) {
        fetch(this.#apiUrl + controller + '/' + id, {
            credentials: 'include',
            method: 'DELETE',
        })
        .then((r) => {
            if (r.status == 200) return r.json();
            else throw new Error(r.status + ' ' + r.statusText);
        })
        .then(successCallback)
        .catch(errorCallback);
    } else {
        fetch(this.#apiUrl + controller, {
            credentials: 'include',
            method: 'DELETE',
        })
        .then((r) => {
            if (r.status == 200) return r.json();
            else throw new Error(r.status + ' ' + r.statusText);
        })
        .then(successCallback)
        .catch(errorCallback);
    }
  }


  //---------------------------

  renderArticleGrid(container, endpoint) {
        this.apiGet(endpoint, (articleList) => {
            let html = '';
            //erstellt Artikelkarte mit Link der zur Artikelseite führt
            for (const a of articleList) {
                html += `
                    <div class="col">
                        <a href="#article?id=${a.articleUid}" class="text-decoration-none text-dark">
                            <div class="card border-0" data-uid="${a.articleId}">
                                <img src="${this.#apiUrl}shop/article/${a.articleId}/thumbnail" class="card-img-top" alt="${a.name}" style="height: 320px; object-fit: contain; background: var(--sd-grey); border-radius: 0;" onerror="this.style.display='none'">
                                <div class="card-body px-0">
                                    <p class="card-text">
                                        <strong>${a.name}</strong>
                                        <br>
                                        <strong>${a.price} €</strong>
                                    </p>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            }
            container.innerHTML = html;
        }, (ex) => { alert(ex); });
  }

  loadOrders(listContainer, emptyContainer, userId, limit) {
        const STATUS = {
            0: 'Neu', 10: 'Bezahlt', 20: 'Bearbeitung', 30: 'Versandbereit',
            40: 'Versendet', 50: 'Zugestellt', 60: 'Abgeschlossen',
            70: 'Storniert', 80: 'Abgebrochen', 90: 'Retoure', 99: 'Erstattet'
        };

        this.apiGet('order/byuser/' + userId + '?limit=' + limit, (orders) => {
            if (orders.length === 0) {
                emptyContainer.style.display = '';
                listContainer.innerHTML = '';
                return;
            }

            emptyContainer.style.display = 'none';

            let html = `
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Bestellnr.</th>
                            <th>Datum</th>
                            <th>Status</th>
                            <th>Zahlungsmethode</th>
                            <th class="text-end">Gesamt</th>
                        </tr>
                    </thead>
                    <tbody>`;
            for (const o of orders) {
                const datum  = o.orderTime ? this.formatDate(o.orderTime) : '—';
                const gesamt = ((o.priceArticles ?? 0) + (o.priceShipping ?? 0)).toFixed(2);
                const status = STATUS[o.status] ?? '—';
                html += `
                        <tr>
                            <td>${o.orderNumber ?? '—'}</td>
                            <td>${datum}</td>
                            <td>${status}</td>
                            <td>${o.paymethod ?? '—'}</td>
                            <td class="text-end">${gesamt} €</td>
                        </tr>`;
            }
            html += `
                    </tbody>
                </table>`;
            listContainer.innerHTML = html;
        }, (ex) => {
            if (ex.message && ex.message.startsWith('401')) {
                emptyContainer.style.display = 'none';
                listContainer.innerHTML = '<p class="text-danger">Sitzung abgelaufen — bitte <a href="#login">neu anmelden</a>.</p>';
            } else {
                alert(ex);
            }
        });
  }

  //Funktion zum Hinzufügen eines Artikels zum Warenkorb, speichert den Warenkorb im LocalStorage
  addToCart(article) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ articleUid: article.articleUid, articleId: article.articleId, name: article.name, price: article.price });
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    //Entfernt einen Artikel an der angegebenen Position
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  formatDate(d) {
    let dateVal = null;

    if (d instanceof Date) dateVal = d;
    else dateVal = new Date(d);

    const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
        month: '2-digit',
        year: 'numeric',
        day: '2-digit'
    });
    return dateFormatter.format(dateVal);
  }
}