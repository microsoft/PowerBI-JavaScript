const active_class = 'steps-li-active';

function OpenAuthStep() {
	$("#right-pane").load("step_authorize.html");

	$("#steps-auth").addClass(active_class);
	$('#steps-embed').removeClass(active_class);
	$('#steps-interact').removeClass(active_class);
	
	// Hide Embed view in authorization step.
	$("#embedArea").hide();
}

function OpenEmbedStep() {	
	$("#right-pane").load("step_embed.html");

	$("#steps-auth").removeClass(active_class);
	$('#steps-embed').addClass(active_class);
	$('#steps-interact').removeClass(active_class);
	
	// Show Embed view in Embed step.
	$("#embedArea").show();
}

function OpenInteractStep() {
	$("#right-pane").load("step_interact.html");

	$("#steps-auth").removeClass(active_class);
	$('#steps-embed').removeClass(active_class);
	$('#steps-interact').addClass(active_class);
	
	// Show Embed view in Interact step.
	$("#embedArea").show();
}
