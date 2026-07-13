import HTML from './page-register.html';

export default class PageRegister {
    #args = null;

    constructor(args) {
        this.#args = args;
        args.target.innerHTML = HTML;

        const inputName            = args.target.querySelector('#inputName');
        const inputSurname         = args.target.querySelector('#inputSurname');
        const inputMail            = args.target.querySelector('#inputMail');
        const inputLoginName       = args.target.querySelector('#inputLoginName');
        const inputPassword        = args.target.querySelector('#inputPassword');
        const inputPasswordConfirm = args.target.querySelector('#inputPasswordConfirm');
        const inputAdress          = args.target.querySelector('#inputAdress');
        const inputCity            = args.target.querySelector('#inputCity');
        const inputCountry         = args.target.querySelector('#inputCountry');
        const checkNewsletter      = args.target.querySelector('#checkNewsletter');
        const buttonAddDelivery    = args.target.querySelector('#buttonAddDelivery');
        const deliveryList         = args.target.querySelector('#deliveryList');
        const buttonSave           = args.target.querySelector('#buttonSave');
        const buttonCancel         = args.target.querySelector('#buttonCancel');

        //Bearbeiten, wenn User angenmeldet ist, ansonsten Registrierung
        if (args.app.user) {
            buttonCancel.href = '#account';
            args.target.querySelector('h1').innerText = 'Konto bearbeiten';
            const u = args.app.user;
            buttonSave.innerHTML    = '<i class="bi bi-check-lg me-2 button-primary"></i>Speichern';
            inputName.value         = u.name      || '';
            inputSurname.value      = u.surname   || '';
            inputMail.value         = u.mail      || '';
            inputLoginName.value    = u.loginName || '';
            inputAdress.value       = u.adress    || '';
            inputCity.value         = u.city      || '';
            inputCountry.value      = u.country   || '';
            checkNewsletter.checked = u.newsletter || false;

            //Lieferadresse wird aus Datenbank als JSON übergeben und in Array umgewandelt
            if (u.deliveryAdress) {
                let list = [];
                try { list = JSON.parse(u.deliveryAdress); } catch (e) {}
                for (const d of list) deliveryList.insertAdjacentHTML('beforeend', this.#deliveryEntryHtml(d));
            }
        }

        //--------------------------------------------
        // events
        //--------------------------------------------
        buttonAddDelivery.addEventListener('click', () => {
            deliveryList.insertAdjacentHTML('beforeend', this.#deliveryEntryHtml());
        });

        //ein Listener für alle Entfernen-Buttons
        deliveryList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delivery-remove') || e.target.closest('.delivery-remove'))
                e.target.closest('.delivery-entry').remove();
        });

        buttonSave.addEventListener('click', () => {
            if (!this.#validate(inputName, inputSurname, inputMail, inputLoginName, inputPassword, inputPasswordConfirm)) return;
            if (!this.#validateDeliveries(deliveryList)) return;

            //alle Lieferadressen-Karten auslesen und als Array zusammenbauen
            const deliveries = this.#collectDeliveryAdresses(deliveryList);
            const data = {
                name:       inputName.value      || null,
                surname:    inputSurname.value   || null,
                mail:       inputMail.value       || null,
                loginName:  inputLoginName.value  || null,
                password:   inputPassword.value   || null,
                adress:     inputAdress.value     || null,
                city:       inputCity.value       || null,
                country:    inputCountry.value    || null,
                newsletter: checkNewsletter.checked,
                //JSON Array in String zurückwandeln
                deliveryAdress: deliveries.length > 0 ? JSON.stringify(deliveries) : null
            };

            if (args.app.user) {
                //wenn User angemeldet: Daten aktualisieren, ansonsten neuen User anlegen
                args.app.apiSet('user/edit', (r) => {
                    if (r.ok) {
                        const u = args.app.user;
                        u.name          = data.name;
                        u.surname       = data.surname;
                        u.mail          = data.mail;
                        u.loginName     = data.loginName;
                        u.adress        = data.adress;
                        u.city          = data.city;
                        u.country       = data.country;
                        u.newsletter    = data.newsletter;
                        u.deliveryAdress = data.deliveryAdress;
                        window.open('#account', '_self');
                    } else {
                        alert(r.message);
                    }
                }, (ex) => {
                    alert(ex.message);
                }, null, data);
            } else {
                // Registrierung
                args.app.apiSet('user/register', (r) => {
                    if (r.ok) {
                        window.open('#login', '_self');
                    } else if (r.errorCode === 3) {
                        alert('Dieser Nutzername ist bereits vergeben. Bitte wähle einen anderen.');
                    } else {
                        alert(r.message);
                    }
                }, (ex) => {
                    alert(ex.message);
                }, null, data);
            }
        });
    }

    //--------------------------------------------
    // private methods
    //--------------------------------------------

    #deliveryEntryHtml(data = {}) {
        return `
            <div class="card p-3 delivery-entry">
                <div class="row g-2">
                    <div class="col-12">
                        <label>Bezeichnung (z.B. Zuhause) <span class="text-danger">*</span></label>
                        <input type="text" class="form-control delivery-label" value="${data.label || ''}" required />
                    </div>
                    <div class="col-12">
                        <label>Straße &amp; Hausnummer <span class="text-danger">*</span></label>
                        <input type="text" class="form-control delivery-adress" value="${data.adress || ''}" required />
                    </div>
                    <div class="col-4">
                        <label>PLZ <span class="text-danger">*</span></label>
                        <input type="text" class="form-control delivery-zip" value="${data.zip || ''}" required />
                    </div>
                    <div class="col-4">
                        <label>Stadt <span class="text-danger">*</span></label>
                        <input type="text" class="form-control delivery-city" value="${data.city || ''}" required />
                    </div>
                    <div class="col-4">
                        <label>Land <span class="text-danger">*</span></label>
                        <select class="form-select delivery-country" required>
                            <option value="">-- bitte wählen --</option>
                            <option value="DE" ${data.country === 'DE' ? 'selected' : ''}>Deutschland</option>
                            <option value="AT" ${data.country === 'AT' ? 'selected' : ''}>Österreich</option>
                            <option value="CH" ${data.country === 'CH' ? 'selected' : ''}>Schweiz</option>
                        </select>
                    </div>
                    <div class="col-12 d-flex justify-content-end">
                        <button type="button" class="btn btn-secondary btn-sm delivery-remove">
                            <i class="bi bi-x-lg me-1"></i>Entfernen
                        </button>
                    </div>
                </div>
            </div>`;
    }

    #collectDeliveryAdresses(deliveryList) {
        const result = [];
        for (const entry of deliveryList.querySelectorAll('.delivery-entry')) {
            result.push({
                label:   entry.querySelector('.delivery-label').value   || '',
                adress:  entry.querySelector('.delivery-adress').value  || '',
                zip:     entry.querySelector('.delivery-zip').value     || '',
                city:    entry.querySelector('.delivery-city').value    || '',
                country: entry.querySelector('.delivery-country').value || ''
            });
        }
        return result;
    }

    #validateDeliveries(deliveryList) {
        const entries = deliveryList.querySelectorAll('.delivery-entry');
        for (const entry of entries) {
            const label   = entry.querySelector('.delivery-label').value.trim();
            const adress  = entry.querySelector('.delivery-adress').value.trim();
            const zip     = entry.querySelector('.delivery-zip').value.trim();
            const city    = entry.querySelector('.delivery-city').value.trim();
            const country = entry.querySelector('.delivery-country').value;
            if (!label || !adress || !zip || !city || !country) {
                alert('Bitte fülle alle Pflichtfelder jeder Lieferadresse aus (Bezeichnung, Straße, PLZ, Stadt, Land).');
                return false;
            }
        }
        return true;
    }

    #validate(inputName, inputSurname, inputMail, inputLoginName, inputPassword, inputPasswordConfirm) {
        if (!inputName.value || !inputSurname.value || !inputMail.value || !inputLoginName.value) {
            alert('Bitte fülle alle Pflichtfelder aus (Vorname, Nachname, E-Mail, Nutzername).');
            return false;
        }
        if (!this.#args.app.user && !inputPassword.value) {
            alert('Bitte gib ein Passwort ein.');
            return false;
        }
        if (inputPassword.value && inputPassword.value !== inputPasswordConfirm.value) {
            alert('Die Passwörter stimmen nicht überein.');
            return false;
        }
        return true;
    }
}
