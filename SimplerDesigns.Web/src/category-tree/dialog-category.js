import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';
import HTML from './dialog-category.html';

export default class DialogCategory {
  //============================================================
  // private
  //============================================================
  #args = null;
  #modal = null;
  #category = null;
  #parentcategory = null;

  //============================================================
  constructor(args) {
    this.#args = args;
    this.#args.target.insertAdjacentHTML('beforeEnd', HTML);

    const modalCategory = this.#args.target.querySelector('#modalCategory');
    this.#modal = new bootstrap.Modal(modalCategory);
    const buttonSave = this.#args.target.querySelector('#buttonSaveDialogCategory');
    const textName = this.#args.target.querySelector('#textNameDialogCategory');

    //-----------------------------------------------
    // events
    //-----------------------------------------------
    buttonSave.addEventListener('click', () => {

      if (textName.value) {
        if (!this.#category) this.#category = {
          categoryId: null,
          categoryRefId: this.#parentcategory?.categoryId
        };

        this.#category.name = textName.value;

      this.#args.app.apiSet('category', (r) => {
        if (r.ok) {
          this.#modal.hide(); 
          if (args.saveClick && typeof args.saveClick === 'function') args.saveClick();
        }
      }, (ex) => {
        alert(ex);
      }, this.#category.categoryId, this.#category);

      } else {
        alert('Bitte einen Wert in das Feld eintragen.');
      }

    });

  }

  //============================================================
  // public
  //============================================================
  show(p) {
    const textName = this.#args.target.querySelector('#textNameDialogCategory');

    this.#parentcategory = null;
    this.#category = null;
    textName.value = '';

    if (p) {
      if (p.category) {
        this.#category = p.category;
        textName.value = this.#category.name;
      }
      if (p.parentcategory) {
        this.#parentcategory = p.parentcategory;
      }
    }

    this.#modal.show();

  }


}