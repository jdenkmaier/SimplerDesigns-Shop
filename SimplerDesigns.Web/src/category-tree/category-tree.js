import DialogCategory from './dialog-category.js';
import HTML from './category-tree.html';

export default class CategoryTree {
    //==============================================================================================================================================
    // private variablen
    //==============================================================================================================================================
    #args = null;
    #categoryList = null;

    //==============================================================================================================================================
    constructor(args) {
      this.#args = args;
      args.target.innerHTML = HTML;
      
      //-----------------------------------
      // init
      //-----------------------------------
      const tablecategory = this.#args.target.querySelector('#tableCategory>tbody');
      const thName = this.#args.target.querySelector('#thName');
      const toolbarLeft = this.#args.target.querySelector('#toolbarLeft');
      const dialogCategory = new DialogCategory({
          app: this.#args.app,
          target: this.#args.target,
          saveClick: () => {
              this.#dataRead();
          }
      });

      if (args.edit) {
          toolbarLeft.innerHTML = '<button type="button" class="btn btn-secondary" id="buttonNew"><i class="bi bi-plus me-2"></i>Neu</button>';
      }

      this.#dataRead();

      //-----------------------------------
      // events
      //-----------------------------------
      tablecategory.addEventListener( 'click', (e) => {

          let btn = null;
          let td = null;

          if ( e.target.nodeName == 'I' && e.target.parentElement.nodeName == 'BUTTON') btn = e.target.parentElement;
          else if (e.target.nodeName == 'BUTTON') btn = e.target;

          if (e.target.nodeName == 'DIV' && e.target.parentElement.nodeName == 'TD' && e.target.parentElement.dataset.id) td = e.target.parentElement;
          else if (e.target.nodeName == 'TD' && e.target.dataset.id) td = e.target;

          if (btn) {
              let k = this.#categoryList.filter( o => o.categoryId == parseInt(btn.dataset.id))[0];
                if (btn.dataset.aktion == 'del') {
                  if (confirm('Willst du wirklich die Kategorie ' + k.name + ' löschen?')) {
                      args.app.apiDelete('category', (r) => {
                          if (r.ok) this.#dataRead();
                      }, (ex) => {
                          alert(ex);
                      }, k.categoryId);
                  }

              } else if (btn.dataset.aktion == 'new' ) {
                  dialogCategory.show({
                      parentcategory: k
                  });
                  
              } else if (btn.dataset.aktion == 'expand' ) {
                  const tr = btn.parentElement.parentElement;
                  const icon = btn.querySelector('i');

                  icon.classList.remove('bi-chevron-down', 'bi-chevron-up');

                  if (tr.dataset.expanded == 'true') {
                      tr.dataset.expanded = 'false';
                      icon.classList.add('bi-chevron-down');    
                  } else {
                      tr.dataset.expanded = 'true';
                      icon.classList.add('bi-chevron-up');
                  }
                  this.#treeDisplay(tr);
              }

          } else {
              if (td) {
                let k = this.#categoryList.filter( o => o.categoryId == parseInt(td.dataset.id))[0];
                if (args.edit) {
                    dialogCategory.show({
                        category: k
                    });
                } else {
                    if (args.click && typeof args.click === 'function') args.click(k);
                }
              }
          }
      });

      if (args.edit) {
        tablecategory.addEventListener( 'dragstart', (e) => {
            if (e.target.nodeName == 'DIV' && e.target.dataset.id) {
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
            }
        });

        tablecategory.addEventListener( 'dragover', (e) => {
            e.preventDefault();
        });

        tablecategory.addEventListener( 'drop', (e) => {
            e.preventDefault();
            let cId = parseInt(e.dataTransfer.getData('text/plain'));
            let pId = parseInt(e.target.dataset.id);
            
            if (cId != pId) {
                let category = this.#categoryList.filter( k => k.categoryId == cId)[0];
                category.categoryRefId = pId;

                this.#args.app.apiSet('category', (r) => {
                    if (r.ok) {
                        this.#dataRead();
                    }
                }, (ex) => {
                    alert(ex);
                }, cId, category);
            }

        });

        thName.addEventListener( 'dragover', (e) => {
            e.preventDefault();
        });

        thName.addEventListener( 'drop', (e) => {
            e.preventDefault();
            let cId = parseInt(e.dataTransfer.getData('text/plain'));
            let category = this.#categoryList.filter( k => k.categoryId == cId)[0];
            category.categoryRefId = null;

            this.#args.app.apiSet('category', (r) => {
                if (r.ok) {
                    this.#dataRead();
                }
            }, (ex) => {
                alert(ex);
            }, cId, category);
        });

        const buttonNew = this.#args.target.querySelector('#buttonNew');
        buttonNew.addEventListener( 'click', () => {
            dialogCategory.show();
        });

      }

    }


    //==============================================================================================================================================
    // private methoden
    //==============================================================================================================================================
    #dataRead() {

       const tablecategory = this.#args.target.querySelector('#tableCategory>tbody');
 
        this.#args.app.apiGet('category', (categoryList) => {
            this.#categoryList = categoryList;
            tablecategory.innerHTML = this.#dataShow(null, 1);
        }, (ex) => {
            alert (ex);
        });

    }

    #dataShow(catParent, layer) {
        let html = '';
        let kl = null;

        if (catParent) kl = this.#categoryList.filter( k => k.categoryRefId == catParent.categoryId);
        else kl = this.#categoryList.filter( k => !k.categoryRefId);

        for (const k of kl) {
            html += `
                <tr data-id="${k.categoryId}" data-ref-id="${k.categoryRefId}" data-visible="true" data-expanded="true">
                    <td class="text-center ${(this.#args.edit ? '' : 'd-none')}">
                        <button type="button" class="btn btn-outline-danger" data-aktion="del" data-id="${k.categoryId}" title="Delete category"><i class="bi bi-trash"></i></button>
                        <button type="button" class="btn btn-outline-success" data-aktion="new" data-id="${k.categoryId}" title="Add category"><i class="bi bi-plus"></i></button>
                    </td>
                    <td style="width: 2rem;">
                        ${(this.#categoryList.filter( o => o.categoryRefId == k.categoryId).length > 0
                        ? `<button type="button" class="btn btn-outline-secondary" data-aktion="expand" data-id="${k.categoryId}"><i class="bi bi-chevron-up"></i></button>`
                        : '')}
                    </td>
                    <td class="element-clickable pt-3" data-id="${k.categoryId}" style="padding-left:${layer}rem;">
                        <div ${(this.#args.edit ? 'draggable="true"' : '')} data-id="${k.categoryId}">
                            ${k.name}
                        </div>
                    </td>
                </tr>
                ${this.#dataShow(k, layer + 1)}
            `;
        }
        return html;
    }

    #treeDisplay(parentTr) {
        const tablecategory = this.#args.target.querySelector('#tableCategory>tbody');

        tablecategory.querySelectorAll('tr[data-ref-id="' + parentTr.dataset.id + '"]').forEach( (tr) => {
            if (parentTr.dataset.visible == 'true' && parentTr.dataset.expanded == 'true') {
                tr.classList.remove('d-none');
                tr.dataset.visible = 'true';
            } else {
                tr.classList.add('d-none');
                tr.dataset.visible = 'false';
            }
            this.#treeDisplay(tr);
        });

    }

}