window.addEventListener('load', 
  function() {
    // add inline_text_dropdown CSS
    var css = `
      select.inline_text_dropdown {
        background: transparent;
        border: none;
        outline: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        font: inherit;
        cursor: pointer;
        animation: jello_pause 9s infinite 8s;
        font-weight: bold;
      }
      
      @-moz-document url-prefix() {
          select.inline_text_dropdown, 
          select.inline_text_dropdown:-moz-focusring, 
          select.inline_text_dropdown::-moz-focus-inner {
             color: transparent !important;
             text-shadow: 0 0 0 #000 !important;
             background-image: none !important;
          }
      }
      
      @keyframes jello_pause {
        from, 1.2321%, to { transform: translate3d(0, 0, 0); }
        2.4642% { transform: skewX(-12.5deg) skewY(-12.5deg); }
        3.6963% { transform: skewX(6.25deg) skewY(6.25deg); }
        4.9284% { transform: skewX(-3.125deg) skewY(-3.125deg); }
        6.1605% { transform: skewX(1.5625deg) skewY(1.5625deg); }
        7.3926% { transform: skewX(-0.78125deg) skewY(-0.78125deg); }
        8.6247% { transform: skewX(0.390625deg) skewY(0.390625deg); }
        9.8568% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); }
        11.11%, to { transform: translate3d(0, 0, 0) skewX(0deg) skewY(0deg); }
      }
    `;
    
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    
    style.type = 'text/css';
    
    if (style.styleSheet) { // IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    
    head.appendChild(style);
    
    
    // attach text resizing eventListener
    document.querySelectorAll("select.inline_text_dropdown")
      .forEach(function(el) {
        el.addEventListener('change', resize_inline_text_dropdown, true);
        resize_inline_text_dropdown(this, el);
      });
    
  }, false);


function resize_inline_text_dropdown(ev, el) {
  if (el === undefined) { var el = ev.target; }
  var text = el.selectedOptions[0].text;
  var select_node = document.createElement("select");
  select_node.className = "inline_text_dropdown";
  var option_node = document.createElement("option");
  option_node.text = text;
  select_node.appendChild(option_node);
  el.parentNode.appendChild(select_node);
  el.style.width = select_node.clientWidth + "px";
  select_node.remove();
}
    

function initialize_inline_text_dropdown(el) {  
  el.addEventListener('change', resize_inline_text_dropdown, true);
  resize_inline_text_dropdown(this, el);
  
  function resize_inline_text_dropdown(ev, el) {
    if (el === undefined) { var el = ev.target; }
    var text = el.selectedOptions[0].text;
    var select_node = document.createElement("select");
    select_node.className = "inline_text_dropdown";
    var option_node = document.createElement("option");
    option_node.text = text;
    select_node.appendChild(option_node);
    el.parentNode.appendChild(select_node);
    el.style.width = select_node.clientWidth + "px";
    select_node.remove();
  }
}
