$(function() {
  $(".list-group li").click(function(e) {
    e.preventDefault();
    $that = $(this);
    $that.parent().find('li').removeClass('active');
    $that.addClass('active');
 });
});
