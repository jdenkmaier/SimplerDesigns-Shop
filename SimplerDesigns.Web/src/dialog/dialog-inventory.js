import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';
import HTML from './dialog-inventory.html';

export default class DialogInventory {
  //============================================================
  // private
  //============================================================
  #args = null;
  #modal = null;
  #inventory = null;
  #articleId = null;

  //============================================================
  constructor(args) {
    this.#args = args;
    this.#args.target.insertAdjacentHTML('beforeEnd', HTML);

    const modalInventory = this.#args.target.querySelector('#modalInventory');
    this.#modal = new bootstrap.Modal(modalInventory);
    const buttonSave = this.#args.target.querySelector('#buttonSaveDialogInventory');
    const numberAmount = this.#args.target.querySelector('#numberAmountDialogInventory');
    const selectOperation = this.#args.target.querySelector('#selectOperationDialogInventory');

    //-----------------------------------------------
    // events
    //-----------------------------------------------
    buttonSave.addEventListener('click', () => {

      if (numberAmount.value) {
        if (!this.#inventory) this.#inventory = {
          inventoryId: null,
          userId: args.app.user.userId,
          articleId: this.#articleId,
          datum: new Date().toISOString()
        };

        this.#inventory.amount = parseInt(numberAmount.value) * (selectOperation.value == '2' ? -1 : 1);
        this.#inventory.operation = parseInt(selectOperation.value);

        this.#args.app.apiSet('inventory', (r) => {
          if (r.ok) {
            this.#modal.hide(); 
            if (args.saveClick && typeof args.saveClick === 'function') args.saveClick();
          }
          
        }, (ex) => {
          alert(ex);
        }, null, this.#inventory);

      } else {
        alert('Angabe für Anzahl einfügen!');
      }

    });

  }

  //============================================================
  // public
  //============================================================
  show(p) {
    const numberAmount = this.#args.target.querySelector('#numberAmountDialogInventory');
    const selectOperation = this.#args.target.querySelector('#selectOperationDialogInventory');

    this.#articleId = null;
    numberAmount.value = '';
    selectOperation.value = '1';

    if (p) {
      if (p.articleId) this.#articleId = p.articleId;
    }

    this.#modal.show();

  }


}