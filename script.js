"use strict";
var chat = document.getElementById('chat');
var userColorSheet = document.createElement('style');
var users = {
    lookup: function(name) {
        return name in this.data;
    },
    store: function(name, key, value) {
        console.log('storing ' + name + ' as ' + value);
        this.data[name] = {
            key: key,
            value: value
        };
        this.writeToSheet(key, value);
        return value;
    },
    load: function() {
        var data;
        try {
            data = JSON.parse(localStorage.getItem('so_colour_users'));
        } catch (err) {
            console.error(err, 'malformed json in localStorage. clearing localStorage object.');
            localStorage.setItem('so_colour_users', '{}');
        }
        if (!data) return;
        Object.keys(data).forEach(function(user) {
            this.data[user] = {
                key: data[user].key,
                value: data[user].value
            };
            this.writeToSheet(data[user].key, data[user].value);
        }.bind(this));
    },
    save: function() {
        var dataString = JSON.stringify(this.data);
        if (dataString) {
            localStorage.setItem('so_colour_users', dataString);
        } else {
            console.error('could not save');
        }
    },
    writeToSheet: function(key, value) {
        // dear sober me, I'm sorry
        userColorSheet.textContent += '.' + key + ' .messages { ' + (
            (options.useColorBorder.top ? ( 'border-top: solid .25em  ' + value + ' !important;' ) : '')  + 
            (options.useColorBorder.right ? ( 'border-right: solid .25em  ' + value + ' !important;' ) : '')  + 
            (options.useColorBorder.bottom ? ( 'border-bottom: solid .25em  ' + value + ' !important;' ) : '')  + 
            (options.useColorBorder.left ? ( 'border-left: solid .25em  ' + value + ' !important;' ) : '')  ) + 
        ' } ';
    },
    data: {}
};
var options = {
    useColorBorder: {
        top: undefined,
        right: undefined, 
        bottom: undefined,
        left: undefined
    }
};
chrome.storage.sync.get({
    colorBorderPositions: {
        top: false,
        right: false, 
        bottom: false,
        left: false
    }
}, function(savedOptions) {
    options.useColorBorder.top = savedOptions.colorBorderPositions.top;
    options.useColorBorder.right = savedOptions.colorBorderPositions.right;
    options.useColorBorder.bottom = savedOptions.colorBorderPositions.bottom;
    options.useColorBorder.left = savedOptions.colorBorderPositions.left;
    init();
});

function hashCode(str) {
    var hash = 0;
    str += '!';
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return -hash;
}

function colorCode(i) {
    // dear reader, my code formatter likes to do this from time to time...
    // I'm sick of fixing it and I'm not writing an exception to the extension. 
    // I'm sorry, deal with it. 
    return '#' + (Math.min((i >> 24) & 0xFF, 175).toString(16) + Math.min((i >> 16) & 0xFF, 175).toString(16) + Math.min((i >> 8) & 0xFF, 175).toString(16) + Math.min(i & 0xFF, 175).toString(16)).slice(0, 6);
}

function colorUsers(node) {
    if (node.classList && node.classList.contains('popup') && node.classList.contains('user-popup')) {
        var img = node.querySelector('img');
        var input = document.createElement('input');
        var name = node.querySelector('.username').textContent;
        input.type = 'color';
        input.value = users.data[name].value;
        img.parentNode.insertBefore(input, img);
        input.onchange = function () {
            users.data[name].value = this.value;
            users.save();
            userColorSheet.textContent = '';
            users.load();
        };
    }
    if (node.classList && node.classList.contains('user-container')) {
        var user = node.querySelector('a .username').textContent,
            existing = users.lookup(user);
        if (!existing && node.className) {
            var keys = node.className.match(/user-[0-9]+/g);
            if (keys) {
                users.store(user, keys[0], colorCode(hashCode(user + keys[0] + user)));
            }
        }
    }
}

function visualHexColors(node) {
    if (node.classList && node.classList.contains('message') && !node.classList.contains('pending') && !node.querySelector('.ob-post')) {
        [].forEach.call(node.childNodes, function(child) {
            if (child.parentNode.tagName === 'PRE') return;
            if (/\B#(?:[0-9a-f]{3}){1,2}\b/ig.test(child.textContent)) {
                // ummm.. 
                child.innerHTML = child.innerHTML.replace(/\B#(?:[0-9a-f]{3}){1,2}\b/ig, function(match) {
                    return '<span style="width:12px;height:12px;border:1px solid #222;background-color:' + match + ';display:inline-block;"></span>' + match;
                });
            }
        });
    }
}

function webmOnebox(node) {
    if (node.classList && node.classList.contains('message') && !node.classList.contains('pending')) {
        var content = node.querySelector('.content');
        if ( [].filter.call(content.childNodes, function (child) {
            return (child.nodeType === 1 || child.nodeType === 3)
        }).length > 1 ) return; // shut up
        var link = content.querySelector('a');
        if( !link || !/(webm|gifv)$/.test(link.href) ) return;
        var video = document.createElement('video');
        video.controls = true;
        video.src = link.href.replace(/(gifv)$/,'webm');
        video.width = 320;
        video.height = 240;
        link.parentNode.replaceChild(video, link);
    }
}

function parseNode(node) {
    colorUsers(node);
    visualHexColors(node);
    webmOnebox(node);
}

function randomColor() {
    return '#' + Math.random().toString(16).slice(-6);
}

function init(){
    document.head.appendChild(userColorSheet);
    users.load();

    setTimeout(function() {
        // this is where I just get lazy
        [].forEach.call(chat.querySelectorAll('.user-container'), colorUsers);
        [].forEach.call(chat.querySelectorAll('.user-container .message'), visualHexColors);
        [].forEach.call(chat.querySelectorAll('.user-container .message'), webmOnebox);
        users.save();
    }, 1000); // some users are never parsed. this solves that.

    new MutationObserver(function(records) {
        records.forEach(function(record) {
            [].forEach.call(record.addedNodes, parseNode);
        });
    }).observe(document.body, {
        childList: true,
        subtree: true
    });

}