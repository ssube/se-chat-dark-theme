function save_options() {
    var top,right,bottom,left,webm;
    top = document.getElementById('colorBorderTop').checked;
    right = document.getElementById('colorBorderRight').checked;
    bottom = document.getElementById('colorBorderBottom').checked;
    left = document.getElementById('colorBorderLeft').checked;
    webm = document.getElementById('webmSupported').checked;
    chrome.storage.sync.set({
        colorBorderPositions: {
            top: top,
            right: right, 
            bottom: bottom,
            left: left
        },
        webm: webm
    }, function(){ 
        var status = document.getElementById('status');
            status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        colorBorderPositions: {
            top: true,
            right: false, 
            bottom: false,
            left: false
        },
        webm: true
    }, function(options) {
        document.getElementById('colorBorderTop').checked = options.colorBorderPositions.top;
        document.getElementById('colorBorderRight').checked = options.colorBorderPositions.right;
        document.getElementById('colorBorderBottom').checked = options.colorBorderPositions.bottom;
        document.getElementById('colorBorderLeft').checked = options.colorBorderPositions.left;
        document.getElementById('webmSupported').checked = options.webm;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);