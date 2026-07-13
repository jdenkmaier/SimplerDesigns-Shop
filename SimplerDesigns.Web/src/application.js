import './../css/app.css';
import './../css/custom-style.css';


import MainNav              from './navigation/main-nav.js';
import StandardNav          from './navigation/standard-nav.js';
import PageMain             from "./page-main.js";
import PageLogin            from "./page-login.js";
import PageUserList         from './page-user-list.js';
import PageArticleDetail    from './page-article-detail.js';
import PageCategoryList     from './page-category-list.js';
import PageOrderList        from "./page-order-list.js";
import PageOrderDetail      from "./page-order-detail.js";
import PageAccounting       from "./page-accounting.js";


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
        
        //document.querySelector('body').dataset.bsTheme = 'dark';

        // ----------------------------
        this.#nav = new StandardNav({
            target: this.#header
        });


        // ----------------------------
        window.addEventListener( 'hashchange', (e) => {
            this.#navigate(e.target.location.hash);
        } );

        // ----------------------------
        if (document.cookie) {
			const loginCode = document.cookie.split('; ').find(row => row.startsWith('lagerverwaltunglogincode=')).split('=')[1];
            if (loginCode) {
                this.apiGet('page', (r) => {
                    if (r.ok && r.data) {
                        this.#user = r.data;
                        this.#nav = new MainNav({
                            target: this.#header,
                            user: this.#user
                        });
                        this.#navigate(location.hash);
                    }
                }, (ex) => {
                    alert(ex);
                });

            } else {
                this.#navigate('#login');    
            }
        } else {
            this.#navigate('#login');
        }
        
    }

    //====================================================================================
    // private methods
    //====================================================================================
    #navigate(l) {
        this.#footer.innerHTML = '';

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
            case '#userlist':
                new PageUserList(args);
                break;
            case '#articledetail':
                new PageArticleDetail(args);
                break;

            case '#categorylist':
                new PageCategoryList(args);
                break;

            case '#orderlist':
                new PageOrderList(args);
                break;
                
            case '#orderdetail':
                new PageOrderDetail(args);
                break;

            case '#accounting':
                new PageAccounting(args);
                break;

            case '#main':
                this.#nav = new MainNav({
                    target: this.#header,
                    user: this.#user
                });

            default:
                new PageMain(args);
                break;
        }
    }

    //=================================================================================================================
    // public properties
    //=================================================================================================================
    get apiUrl() {
        return this.#apiUrl;
    }

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

  apiUpload(controller, successCallback, errorCallback, fileList) {

    let fd = new FormData();
    let idx = 0;
    for (let f of fileList) {
        fd.append('file' + idx, f, f.name);
    }

    fetch(this.#apiUrl + controller, {
        credentials: 'include',
        method: 'POST',
        body: fd,
        cache: 'no-cache',
    })
    .then((r) => {
        if (r.status == 200) return r.json();
        else throw new Error(r.status + ' ' + r.statusText);
    })
    .then(successCallback)
    .catch(errorCallback);

  }
  


  //=================================================================================================================
  //Hilfsfunktionen
  //=================================================================================================================

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

  selectListSize(container, onChange, defaultValue = 10) {
        const OPTIONS = [5, 10, 25, 50, 0];
        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center gap-2 mb-2';
        wrapper.innerHTML = `
            <label class="form-label mb-0 justify-content-end">Anzeigen:</label>
            <select class="form-select form-select-sm w-auto justify-content-end">
                ${OPTIONS.map(n => `<option value="${n}" ${n === defaultValue ? 'selected' : ''}>${n === 0 ? 'Alle' : n}</option>`).join('')}
            </select>
        `;
        container.appendChild(wrapper);
        wrapper.querySelector('select').addEventListener('change', e => onChange(parseInt(e.target.value)));
    }
}