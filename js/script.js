$(function() {
	$("button#go:submit").click(function() {
		$("button#go:submit").hide("slow");
		$(".refresh-me").html("<p>Refresh this page to play again.</p>");
	})
});