function InitLogger(divId) {

    var Logger = {};

    Logger.log = function name(event) {
        this.logText("Json Object\n" + JSON.stringify(event, null, "  "));
    };

    Logger.logText = function name(text) {
        var textbox = document.getElementById(divId);
    
        if (!textbox.value)
        {
            textbox.value = "";
        }

        textbox.value += "> " + text + "\n";

        textbox.scrollTop = textbox.scrollHeight;
    };

    return Logger;
}
