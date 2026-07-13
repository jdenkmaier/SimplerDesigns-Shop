import DialogInventory  from '../dialog/dialog-inventory.js';
import HTML from './sub-page-inventory.html';

export default class SubPageInventory {
  //=============================================================================================================================
  // private vars
  //=============================================================================================================================
  #args = null;
  #bestandList = null;

  //=============================================================================================================================
  constructor(args) {
    this.#args = args;
    args.target.innerHTML = HTML;

    //--------------------------------------------------------------
    let article = null;
    const tableList = args.target.querySelector('#tableList>tbody');
    const buttonNew = args.target.querySelector('#buttonNew');
    const dialogInventory = new DialogInventory({
      target: args.target,
      app: args.app,
      saveClick: () => {
        this.#dataRead();
      }
    });


    //--------------------------------------------------------------
    //events
    //--------------------------------------------------------------
    buttonNew.addEventListener( 'click', () => {
      dialogInventory.show({
        articleId: article.articleId
      });
    });

    //--------------------------------------------------------------
    tableList.addEventListener( 'click', (e) => {
      let btn = null;

      if (e.target.nodeName == 'I' && e.target.parentElement.nodeName == 'BUTTON') btn = e.target.parentElement;
      else if (e.target.nodeName == 'BUTTON') btn = e.target;

      if (btn) {
          if (btn.dataset.id && btn.dataset.aktion == 'del') {
          const bestand = this.#bestandList.filter( d => d.bestandId == parseInt(btn.dataset.id))[0];
          if (confirm('Willst du wirklich den Eintrag vom ' + args.app.formatDate(bestand.datum) + ' mit Menge ' + bestand.anzahl + ' ' + bestand.einheit + ' löschen?')) {
            args.app.apiDelete('inventory', (r) => {
              if (r.ok) {
                this.#dataRead();
              }
            }, (ex) => {
              alert(ex);
            }, bestand.bestandId);
          }
        }
      }



    });

    //--------------------------------------------------------------
    //init
    //--------------------------------------------------------------
    if (args.id) {
      args.app.apiGet('article/' + args.id, (r) => {
        article = r;
        this.#dataRead();
      }, (ex) => {
        alert(ex);
      });
    }

  } // constructor

  //=============================================================================================================================
  // private methoden
  //=============================================================================================================================
  #dataRead() {
      const tableList = this.#args.target.querySelector('#tableList>tbody');
      const hGesamt = this.#args.target.querySelector('#hGesamt');


      this.#args.app.apiGet('article/' + this.#args.id + '/inventory', (r) => {
        this.#bestandList = r;
        tableList.innerHTML = '';

        let s = 0;
        let html = '';
        for (const b of this.#bestandList) {

          s += b.anzahl;

          html += `
            <tr>
              <td class="text-center">
                <button type="button" class="btn btn-outline-secondary" data-id="${b.bestandId}" data-aktion="del"><i class="bi bi-trash"></i></button>
              </td>
              <td>${this.#args.app.formatDate(b.datum)}</td>
              <td class="text-end">${b.anzahl}</td>
              <td class="">${(b.vorgang == 1 ? 'Eingang' : (b.vorgang == 2 ? 'Ausgang' : 'Unbekannt'))}</td>
              <td>${b.userName} ${b.userName} (${b.userNummer})</td>
            </tr>
          `;
        }
        tableList.innerHTML = html;
        hGesamt.innerHTML = 'Insgesamt: <strong>' + s + '</strong>';
      }, (ex) => {
        alert(ex);
      });

  }
}