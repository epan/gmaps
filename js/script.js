$(function() {
	$("button#go:submit").click(function() {
		$("button#go:submit").hide("slow");
		$(".refresh-me").html('<p>To play again, <a id="refresh">refresh this page</a>.</p>');
	});
	$("#refresh").click(function() {
		location.reload();
	});
});