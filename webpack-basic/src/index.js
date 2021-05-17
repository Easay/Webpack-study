// src/index.js
// import './style.css'

const style = require('./style.css');
// console.log(style);
import Icon from './icon.jpg'
function component() {
    var element = document.createElement('div');

    element.innerHTML = "Hello Webpack";
    element.classList.add('color_red'); //添加类名

    var img = new Image(200,200);
    img.src = Icon;
    element.appendChild(img);
    
    return element;
}

document.body.appendChild(component());
