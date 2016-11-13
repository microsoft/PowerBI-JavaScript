function OpenReportOperations() {
	$("#report-operations-div").show();
	$("#page-operations-div").hide();
	
	$("#report-operations-li").addClass('active');
	$('#page-operations-li').removeClass('active');
}

function OpenPageOperations() {
	$("#page-operations-div").show();
	$("#report-operations-div").hide();
	
	$("#page-operations-li").addClass('active');
	$('#report-operations-li').removeClass('active');
}