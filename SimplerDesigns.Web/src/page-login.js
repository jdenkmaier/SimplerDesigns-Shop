import DialogSetPassword         from './dialog/dialog-password-set.js';
import HTML                     from './page-login.html';

export default class PageLogin {

    constructor(args) {
        args.target.innerHTML = HTML;

        //--------------------------------------------
        const textLoginName = args.target.querySelector('#textLoginName');
        const textPassword = args.target.querySelector('#textPassword');
        const buttonLogin = args.target.querySelector('#buttonLogin');

        const dialogPwdSet = new DialogSetPassword({
            target: args.target,
            app: args.app,
            saveClick: (e) => {
                if (e.ok) window.open('#main', '_self');
            }
        });

        //--------------------------------------------
        // events
        //--------------------------------------------
        buttonLogin.addEventListener( 'click', () => {
            
            if (textLoginName.value && textPassword.value) {
                let loginData = {
                    loginName: textLoginName.value,
                    password: textPassword.value
                };

                args.app.apiSet('user/login', (r) => {
                    if (r.ok) {
                        console.log(r.data);
                        args.app.user = r.data;
                        window.location.hash = '#main';
                    } else {
                        if (r.errorCode == 2) {
                            args.app.user = r.data;
                            dialogPwdSet.show(r.data);
                        } else {
                            alert(r.message);
                        }
                    }
                }, (ex) => {
                    alert(ex.message);
                }, null, loginData);

            } else {
                alert('Es fehlt ein Passwort oder Nutzername. Bitte Anmeldedaten eingeben.');
            }


        });


    }



}