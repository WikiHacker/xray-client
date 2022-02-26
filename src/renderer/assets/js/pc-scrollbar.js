'use strict';

/**
 * Created by LOLO on 2022/02/21.
 */


((href) => {
    if (/macintosh|mac os x/i.test(navigator.userAgent)) return;

    let link = document.createElement('link')
    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.href = href
    let head = document.getElementsByTagName('head')[0]
    head.appendChild(link)
})('./assets/css/pc-scrollbar.css');