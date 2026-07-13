
import HTML from './toolbar.html';

export default class Toolbar {

  constructor(args) {
    args.target.innerHTML = HTML;

    //-----------------------------------------------
    const colTool = args.target.querySelector('#colTool');
    const body = document.querySelector('body');

    //-----------------------------------------------
    // events
    //-----------------------------------------------
    colTool.addEventListener('click', (e) => {

      let btn = null;

      if (e.target.nodeName == 'I' && e.target.parentElement.nodeName == 'BUTTON') btn = e.target.parentElement;
      else if (e.target.nodeName == 'BUTTON') btn = e.target;

      if (btn) {
        const idx = parseInt(btn.dataset.idx);
        const ct = args.tools[idx];

        if (ct.click && typeof ct.click === 'function') ct.click();

      }


    });

    //-----------------------------------------------
    // init
    //-----------------------------------------------

    body.style.paddingBottom = '75px';

    if (args.tools && args.tools.length > 0) {
      let html = '';
      let idx = 0;
      for (const tool of args.tools) {
        html += `<button type="button" data-idx="${idx}" class="btn ${tool.class}">${(tool.icon ? '<i class="bi me-2 ' + tool.icon + '"></i>' : '')}${tool.text}</button>`;
        idx++;
      }
      colTool.innerHTML = html;
    }
  }

}

