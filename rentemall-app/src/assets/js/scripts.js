// Post Item Image Loader
function imageLoad() {
    $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
        }
    });
};

function imageIsLoaded(e) {
    $('#myImg').attr('src', e.target.result)
        .width(350)
        .height(300);
};