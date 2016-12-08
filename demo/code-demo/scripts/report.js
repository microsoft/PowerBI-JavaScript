const active_class = 'active';
const active_div = 'active-step';

function OpenAuthStep() {
    $("#steps-auth a").addClass(active_class);
    $('#steps-embed a').removeClass(active_class);
    $('#steps-interact a').removeClass(active_class);

    $("#steps-auth .step-div").addClass(active_div);
    $('#steps-embed .step-div').removeClass(active_div);
    $('#steps-interact .step-div').removeClass(active_div);

    // Hide Embed view in authorization step.
    $("#authorize-step-wrapper").show();
    $("#embed-and-interact-steps-wrapper").hide();
}

function OpenEmbedStep() {
    $("#steps-auth a").removeClass(active_class);
    $('#steps-embed a').addClass(active_class);
    $('#steps-interact a').removeClass(active_class);

    $("#steps-auth .step-div").removeClass(active_div);
    $('#steps-embed .step-div').addClass(active_div);
    $('#steps-interact .step-div').removeClass(active_div);

    // Hide Embed view in authorization step.
    $("#authorize-step-wrapper").hide();
    $("#embed-and-interact-steps-wrapper").show();

    $("#settings").load("settings_embed.html", function() {
        SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
        LoadCodeArea("#embedCodeDiv", _Embed_BasicEmbed);
    });
}

function OpenInteractStep() {
    $("#steps-auth a").removeClass(active_class);
    $('#steps-embed a').removeClass(active_class);
    $('#steps-interact a').addClass(active_class);

    $("#steps-auth .step-div").removeClass(active_div);
    $('#steps-embed .step-div').removeClass(active_div);
    $('#steps-interact .step-div').addClass(active_div);

    // Hide Embed view in authorization step.
    $("#authorize-step-wrapper").hide();
    $("#embed-and-interact-steps-wrapper").show();

    $("#settings").load("settings_interact.html", function() {
        SetToggleHandler("report-operations-div");
        SetToggleHandler("page-operations-div");
        SetToggleHandler("events-operations-div");
        LoadCodeArea("#embedCodeDiv", _Report_GetId);
    });
}
