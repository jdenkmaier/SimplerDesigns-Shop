import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';
import Toolbar      from '../navigation/toolbar.js';
import HTML from './sub-page-base.html';
import { ARTICLE_COLOR, ARTICLE_BRAND } from '../enum.js';


export default class SubPageBase {

  constructor(args) {

    args.target.innerHTML = HTML;

    //--------------------------------------------------------------
    const textNumber = args.target.querySelector('#textNumber');
    const numberColor = args.target.querySelector('#numberColor');
    const numberCategory = args.target.querySelector('#numberCategory');
    const textName = args.target.querySelector('#textName');
    const checkboxHide = args.target.querySelector('#checkboxHide');
    const checkboxHighlight = args.target.querySelector('#checkboxHighlight');
    const textDescription = args.target.querySelector('#textDescription');
    const numberInventory = args.target.querySelector('#numberInventory');
    const numberPrice = args.target.querySelector('#numberPrice');
    const numberBrand = args.target.querySelector('#numberBrand');
    let article = null;
    let categories = [];

    function populateCategories(list) {
      categories = list;
      numberCategory.innerHTML = '<option value="">Keine</option>';
      for (const c of categories) {
        const opt = document.createElement('option');
        opt.value = c.categoryId;
        opt.textContent = c.name;
        numberCategory.appendChild(opt);
      }
      if (article && article.a_CategoryId) numberCategory.value = article.a_CategoryId;
    }

    //Color und Brand Enums zuweisen und in Selects einfügen
    function populateSelect(select, enumObj) {
      for (const [value, label] of Object.entries(enumObj)) {
          const opt = document.createElement('option');
          opt.value = value;
          opt.textContent = label;
          select.appendChild(opt);
        }
      }
    populateSelect(numberColor, ARTICLE_COLOR);
    populateSelect(numberBrand, ARTICLE_BRAND);

    // Kategorien von der API laden und in Select einfügen
    args.app.apiGet('category', (categoryList) => {
      populateCategories(categoryList);
    }, (ex) => {
      console.error('Error loading categories', ex);
    });

    const toastSave = bootstrap.Toast.getOrCreateInstance(args.target.querySelector('#toastSave'));
    const toastBody = args.target.querySelector('#toastSave>.toast-body');

    //--------------------------------------------------------------
    new Toolbar({
      target: args.app.footer,
      tools: [
        {
          text: 'Speichern',
          class: 'btn-secondary',
          icon: 'bi-floppy-fill',
          click: () => {
            if (!article) article = {
              articleId: null,
              articleUid: null
            };

            article.number = textNumber.value ? textNumber.value : null;
            article.color = numberColor.value ? parseInt(numberColor.value, 10) : null;
            article.a_CategoryId = numberCategory.value ? parseInt(numberCategory.value, 10) : null;
            article.name = textName.value ? textName.value : null;
            article.hide = checkboxHide.checked;
            article.highlight = checkboxHighlight.checked;
            article.description = textDescription.value ? textDescription.value : null;
            article.inventory = numberInventory.value ? numberInventory.value : null;
            article.price = numberPrice.value ? numberPrice.value : null;
            article.brand = numberBrand.value ? parseInt(numberBrand.value, 10) : null;

            args.app.apiSet('Article', (r) => {
              if (r.ok) {

                toastBody.innerHTML = '<div class="alert alert-success" role="alert">Erfolgreich gespeichert.</div>';
                toastSave.show();

                if (r.data) {
                  article = r.data;
                  if (args.saveClick && typeof args.saveClick === 'function') args.saveClick(article);
                }
              } else {
                toastBody.innerHTML = '<div class="alert alert-danger" role="alert">Fehler beim Speichern: ' + r.message + '</div>';
                toastSave.show();
              }
            }, (ex) => {
              alert(ex);
            }, article.articleId, article);

          }
        }
      ]
    });

    //--------------------------------------------------------------
    //init
    //--------------------------------------------------------------
    if (args.id) {
      args.app.apiGet('article/' + args.id, (r) => {
        article = r;
        textNumber.value = article.number;
        numberColor.value = article.color  ?? 0;
        numberCategory.value = article.a_CategoryId || '';
        textName.value = article.name;
        checkboxHide.checked = article.hide;
        checkboxHighlight.checked = article.highlight;
        textDescription.value = article.description ? article.description : '';
        numberInventory.value = article.inventory || article.inventory == 0 ? article.inventory : '';
        numberPrice.value = article.price || article.price == 0 ? article.price : '';
        numberBrand.value = article.brand  ?? 0;
      }, (ex) => {
        alert(ex);
      });

    }

  }

}