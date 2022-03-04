# Developer's Resources

## Overview
The Javascript source are available in `app/js` which contains the following:

viz.js     : generates results for visualization
action.js  : manages controls for the visualization
compare.js : setup the "Compare" button screen and Visualization screen
main.js    : setup the first screen (Select Images, Use Samples, ...)
samples.js : setup the samples
sw.js      : service worker (makes the app. offline by downloading resources, ...)
```
*********************** use https://github.com/jnordberg/gif.js/ *************************

## Initializing a new component
1. Initialize the HTML component and use JS to initialize the component's behaviour
```
HTML

          <div class="mdc-menu mdc-menu-surface">
            <ul class="mdc-deprecated-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
              <li class="mdc-deprecated-list-item" role="menuitem">
                <span class="mdc-deprecated-list-item__ripple"></span>
                <span class="mdc-deprecated-list-item__text">A Menu Item</span>
              </li>
              <li class="mdc-deprecated-list-item" role="menuitem">
                <span class="mdc-deprecated-list-item__ripple"></span>
                <span class="mdc-deprecated-list-item__text">Another Menu Item</span>
              </li>
            </ul>
          </div>

JS
          const menu = new mdc.menu.MDCMenu(document.querySelector('.mdc-menu'));
          menu.open = true;

TIP: in Google Chrome console, type "mdc." to find the classes it contains and the available initializers

2. Using auto-init
          <div class="mdc-menu mdc-menu-surface" id="viz_tools" data-mdc-auto-init="MDCMenu">
            <ul class="mdc-deprecated-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
              <li class="mdc-deprecated-list-item" role="menuitem">
                <span class="mdc-deprecated-list-item__ripple"></span>
                <span class="mdc-deprecated-list-item__text">A Menu Item</span>
              </li>
              <li class="mdc-deprecated-list-item" role="menuitem">
                <span class="mdc-deprecated-list-item__ripple"></span>
                <span class="mdc-deprecated-list-item__text">Another Menu Item</span>
              </li>
            </ul>
          </div>

JS
window.mdc.autoInit();
...
document.getElementById("viz_tools").MDCMenu.open = true;

```
- MDCMenu is available under mdc.menu.MDCMenu namespace
-

## Buttons
See https://fonts.google.com/icons?selected=Material+Icons for name of icon.

```
          <button id="more" class="mdc-tab mdc-tab--stacked">
            <span class="mdc-tab__content">
              <span
                class="mdc-tab__icon material-icons mdc-typography--caption mdc-theme--on-primary"
                aria-hidden="true"
                >more_vert</span
              >
            </span>
          </button>
          
```
Tip: `more_vert` name is taken from https://fonts.google.com/icons?selected=Material+Icons&icon.query=more

### Listeners
Inside the constructor of `Compare()` class defined in `js/compare.js`
```
this.more_btn = document.getElementById('more');
...
this.more_btn.onclick = () => {
  this.c.dispatchEvent(new CustomEvent('more'));
}
```

## Menu
document.getElementById("viz_tools").addEventListener("MDCMenu:selected", function(e) {
  // e.detail = {item: Element, index: number}}
});

- "Events" section in https://material.io/components/menus/web#usage-within-web-frameworks shows that the menu emits this event when an item is selected, so we attach listener directly to the element 

## Downloading Visualization
- update the viz.js
- viz.js : generates results for visualization
- action.js : manages controls for the visualization
- compare.js : setup the "Compare" button screen and Visualization screen
- main.js : setup the first screen (Select Images, Use Samples, ...)
- samples.js : setup the samples

## Debugging
Create a simple HTML file and develop/refine your component in it and when you are happy with it, you can import it to the application's `index.html`.
@todo: this is not possible because the JS source used getElementById() and expects certain containers to be present.

 
## References
 * https://github.com/material-components/material-components-web
 * https://github.com/material-components/material-components-web/blob/master/docs/importing-js.md#global--cdn
 * https://material-components.github.io/material-components-web-catalog/#/