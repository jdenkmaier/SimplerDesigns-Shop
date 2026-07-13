import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';
import HTML from './dialog-password-set.html';

export default class DialogPasswordSet {
  //============================================================
  // private
  //============================================================
  #args = null;
  #modal = null;
  #user = null;

  //============================================================
  constructor(args) {
    this.#args = args;
    this.#args.target.insertAdjacentHTML('beforeEnd', HTML);

    const modalPasswordSet = this.#args.target.querySelector('#modalPasswordSet');
    this.#modal = new bootstrap.Modal(modalPasswordSet);
    const buttonSave = this.#args.target.querySelector('#buttonSaveDialogPasswordSet');
    const passwordPassword = this.#args.target.querySelector('#passwordPasswordDialogPasswordSet');
    const passwordPasswordWh = this.#args.target.querySelector('#passwordPasswordWhDialogPasswordSet');

    //-----------------------------------------------
    // events
    //-----------------------------------------------
    buttonSave.addEventListener('click', () => {
      if (passwordPassword.value == passwordPasswordWh.value) {
        this.#args.app.apiSet('user/pwd', (r) => {
          if (r.ok) {
            this.#modal.hide(); 
            if (args.saveClick && typeof args.saveClick === 'function') args.saveClick(r);
          }
        }, (ex) => {
          alert(ex);
        }, null, {
          userUid: this.#user.userId?.toString(),
          password: passwordPassword.value
        });
      } else {
        alert ( 'Passwörter stimmen nicht überein.')
      }

    });

  }

  //============================================================
  // public
  //============================================================
  show(user) {

    this.#user = user;
    this.#modal.show();

  }


}