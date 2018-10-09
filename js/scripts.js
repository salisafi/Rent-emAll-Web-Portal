// Load components into divs (Please check 'index.html' file)
$('#header').load('header.html');
$('#navbar').load('navbar.html');
$('#footer').load('footer.html');
$('#content').load('cart.html');

// FAIL
// $('#link').click(function () {
//     var page = $(this).attr('rel');
//     $('#content').load(page);
//     return false;
// });

// FAIL
// $(document).ready(function () {
//     var trigger = $('#link');
//     trigger.click(function () {
//         var target = $(this).data('target');
//         $('#content').load(target + '.html');
//         return false;
//     });
// });

// FINALLY WORKS!!
// This makes loading page when a link is clicked
function linkClick(page) {
    $('#content').load(page + '.html');
}


// Post Item Image Loader
// $(function () {
//     $(":file").change(function () {
//         if (this.files && this.files[0]) {
//             var reader = new FileReader();
//             reader.onload = imageIsLoaded;
//             reader.readAsDataURL(this.files[0]);
//         }
//     });
// });

// function imageIsLoaded(e) {
//     $('#myImg').attr('src', e.target.result)
//         .width(350)
//         .height(300);
// };

/*********************************** Call Review Stars ***********************************/
$.fn.generateStars = function () {
    return this.each(function (i, e) {
        $(e).html($('<span/>').width($(e).text() * 16));
    });
};
$('.star-prototype').generateStars();


// FAQ
$('.collapse').on('shown.bs.collapse', function () {
    $(this).parent().find(".glyphicon-plus").removeClass("glyphicon-plus").addClass("glyphicon-minus");
}).on('hidden.bs.collapse', function () {
    $(this).parent().find(".glyphicon-minus").removeClass("glyphicon-minus").addClass("glyphicon-plus");
});