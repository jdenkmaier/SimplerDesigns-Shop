import Toolbar      from '../navigation/toolbar.js';
import HTML from './sub-page-file.html';

export default class SubPageFile {
  //=============================================================================================================================
  // private vars
  //=============================================================================================================================
  #args = null;
  #dateiList = null;

  //=============================================================================================================================
  constructor(args) {
    this.#args = args;
    args.target.innerHTML = HTML;

    //--------------------------------------------------------------
    const fileDatei = args.target.querySelector('#fileDatei');
    const listGroupDatei = args.target.querySelector('#listGroupDatei');

    //--------------------------------------------------------------
    // events
    //--------------------------------------------------------------
    fileDatei.addEventListener('change', () => {
      if (fileDatei.files && fileDatei.files.length > 0) {
        listGroupDatei.innerHTML = '';
        let reader = null;
        for (const file of fileDatei.files) {
          reader = new FileReader();
          reader.onload = (fr) => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerHTML = `
              <div class="d-flex flex-row align-items-center">
                <div>
                  <button type="button" class="btn btn-outline-secondary btn-lg"><i class="bi bi-trash fs-1"></i></button>
                </div>
                <div class="ms-3">
                  <img src="${fr.target.result}" type="${file.type}" style="height: 100px;" />
                </div>
                <div class="ms-3">
                  ${file.name}
                </div>
              </div>
            `;
            listGroupDatei.appendChild(li);
          };
          reader.readAsDataURL(file);
        }
      }
    });

    listGroupDatei.addEventListener('click', (e) => {
      let btn = null;

      if (e.target.nodeName === 'I' && e.target.parentElement.nodeName === 'BUTTON') btn = e.target.parentElement;
      else if (e.target.nodeName === 'BUTTON') btn = e.target;

      if (btn && btn.dataset.id && btn.dataset.aktion === 'del') {
        const datei = this.#dateiList.filter(d => d.fileId  == parseInt(btn.dataset.id, 10))[0];
        if (datei && confirm('Willst du wirklich ' + datei.name + ' löschen?')) {
          args.app.apiDelete('file', (r) => {
            if (r.ok) {
              this.#dataRead();
            }
          }, (ex) => {
            alert(ex);
          }, datei.fileId );
        }
      }
    });

    listGroupDatei.addEventListener('change', (e) => {
      if (e.target && e.target.name === 'articleThumbnail') {
        const fid = e.target.dataset.id;
        args.app.apiSet('file', (r) => {
          if (r.ok) this.#dataRead();
        }, (ex) => {
          alert(ex);
        }, fid + '/thumbnail', { thumbnail: true });
      }
    });

    //--------------------------------------------------------------
    new Toolbar({
        target: args.app.footer,
        tools: [
            {
                text: 'Speichern',
                class: 'btn-secondary',
                icon: 'bi-floppy-fill',
                click: () => {
                    if (fileDatei.files && fileDatei.files.length > 0) {
                        args.app.apiUpload('article/' + args.id + '/file', (r) => {
                            if (r.ok) {
                                this.#dataRead();
                                fileDatei.value = '';
                            }
                        }, (ex) => {
                            alert(ex);
                        }, fileDatei.files);
                    } else {
                        this.#dataRead();
                    }
                }
            }
        ]
    });

    //--------------------------------------------------------------
    // init
    //--------------------------------------------------------------
    if (args.id) {
      this.#dataRead();
    }
  } // constructor

  //=============================================================================================================================
  // private methoden
  //=============================================================================================================================
  #dataRead() {
    const listGroupDatei = this.#args.target.querySelector('#listGroupDatei');

    this.#args.app.apiGet('article/' + this.#args.id + '/file', (r) => {
      this.#dateiList = r;
      listGroupDatei.innerHTML = '';

      let li = null;
      for (const d of this.#dateiList) {
        li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
          <div class="d-flex flex-row align-items-center">
            <div>
              <button type="button" class="btn btn-outline-secondary btn-lg" data-id="${d.fileId}" data-aktion="del"><i class="bi bi-trash fs-1"></i></button>
            </div>
            <div class="ms-3">
              <img src="${d.content}" type="${d.mediaType}" style="width: 200px;" />
            </div>
            <div class="ms-3">
              ${d.name}
            </div>
            <div class="ms-3 form-check">
              <input class="form-check-input" type="radio" name="articleThumbnail" data-id="${d.fileId}" ${d.thumbnail ? 'checked' : ''}>
              <label class="form-check-label">Vorschaubild</label>
            </div>
          </div>
        `;
        listGroupDatei.appendChild(li);
      }
    }, (ex) => {
      alert(ex);
    });
  }
}
