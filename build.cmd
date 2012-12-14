@ECHO OFF
ECHO Building Stylish version...
ECHO @-moz-document domain("chat.stackexchange.com")  { > firefox-stylish.css
TYPE chrome-stylebot.css >> firefox-stylish.css
ECHO } >> firefox-stylish.css
ECHO Done