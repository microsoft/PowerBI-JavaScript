function InitLogger(divId) {

    var Logger = {};

    // Normal character takes ~1.5 width more than a space ' '.
    Logger.spaceWidthCorrection = 1.3;

    Logger.log = function (event) {
        this.logText("Json Object\n" + JSON.stringify(event, null, "  "));
    };

    Logger.logText = function (text) {
        let textbox = document.getElementById(divId);

        if (!textbox.value)
        {
            textbox.value = "";
        }

        textbox.value += "> " + text + "\n";

        textbox.scrollTop = textbox.scrollHeight;
    };

    Logger.logCsv = function (text) {
        let textbox = document.getElementById(divId);

        if (!textbox.value)
        {
            textbox.value = "";
        }

        let maxLength = 0;
        let lines = text.split("\r\n");
        let valuesPerLine = [];

        let log = "> CSV result in table view: \n\n";
        if (!lines || lines.length === 0) {
            log += "No data";
        }
        else {
            // Calcualte values per line, and calculate max length for pretty print.
            for (let i = 0; i < lines.length; ++i) {
                valuesPerLine[i] = lines[i].split(",");
                valuesPerLine[i].forEach(function (val) {
                    if (val.length > maxLength) {
                        maxLength = val.length;
                    }
                });
            }

            // Add 2 spaces before and after.
            maxLength += 4;

            // Print title line
            var title = this.getLineText(valuesPerLine[0], maxLength);
            log += title + "\n";
            log += this.repeatChar("-", title.length) + "\n";

            // Print all lines
            for (let i = 1; i < lines.length; ++i) {
                log += this.getLineText(valuesPerLine[i], maxLength) + "\n"
            }
        }

        textbox.value += log;
        textbox.scrollTop = textbox.scrollHeight;
    };

    Logger.getLineText = function (values, spacesPerWord) {
        var text = "";
        _this = this;
        values.forEach(function (val) {
            text += _this.getCenteredText(val, spacesPerWord);
        });
        return text;
    };

    Logger.getCenteredText = function (value, spaces) {
        var text = "";

        let spacesBefore = (spaces - value.length) / 2;
        let spacesAfter = spaces - value.length - spacesBefore;
        text += this.repeatChar(" ", spacesBefore * this.spaceWidthCorrection);
        text += value;
        text += this.repeatChar(" ", spacesAfter * this.spaceWidthCorrection);
        return text;
    };

    Logger.repeatChar = function (char, times) {
        let text = "";
        for (let i = 0; i < times; ++i) {
            text += char;
        }
        return text;
    };

    return Logger;
}
