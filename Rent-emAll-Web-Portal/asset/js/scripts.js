$(".num-only").keypress(function (e) {
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
        return false;
    }
});

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



/*********************************** Register Validation ***********************************/
/********** Validate when submit **********/
function formValidation() {
    // clearErrors();
    $(".errorMsg").empty();
    return validUsername() && validPassword() && validFirstName() && validLastName() && validEmail() && validPhoneNum() && validPostalCode();
}

/********** Validate when editing user profile **********/
function profileValidation() {
    // clearErrors();
    var validPW = true;
    $(".errorMsg").empty();
    if ($('#ChangePasswordBtn').data('clicked')) {
        validPW = validPassword()
    }
    return validPW && validEmail() && validPhoneNum() && validPostalCode();
}

/********** Username validation **********/
function validUsername() {
    var elem = document.querySelector("#username");
    var input = elem.value.trim();
    if (input.length < 6) {
        showErrors('username_errors', "Username must have at least 6 characters.");
        elem.focus(); return false;
    }
    if (input.length > 20) {
        showErrors('username_errors', "Username must be maximum 20 characters.");
        elem.focus(); return false;
    }
    if (/[^a-zA-Z0-9\-\_]/.test(input)) {
        showErrors('username_errors', "Only alphanumeric, - and _ are allowed.")
        elem.focus(); return false;
    }
    return true;
}

/********** Password validation **********/
function validPassword() {
    var valid = false;
    var alphaCap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var elem = document.querySelector("#password");
    var input = elem.value.trim();
    if (input.length < 8) {
        showErrors('password_errors', "Password must have at least 8 characters.");
        elem.focus(); return false;
    }
    if (input.length > 20) {
        showErrors('password_errors', "Password must be maximum 20 characters.");
        elem.focus(); return false;
    }
    for (var i = 0; i < input.length; i++) {
        if (alphaCap.indexOf(input.substr(i, 1)) >= 0) {
            valid = true;
        }
    }
    if (valid) {
        var digit = 0;
        for (var i = 0; i < input.length; i++) {
            if (parseInt(input[i])) {
                digit++;
            }
        }
        if (digit == 0) {
            valid = false;
        }
    }
    if (!valid) {
        showErrors('password_errors', "Password Must have at least 1 digit and 1 uppercase.");
        elem.focus(); return false;
    }
    var elem2 = document.querySelector("#retypePW");
    var input2 = elem2.value.trim();
    if (input != input2) {
        showErrors('password_errors', "Password does not match the confirm password.");
        elem2.focus(); return false;
    }
    return true;
}

/********** Name validation **********/
function validFirstName() {
    return validName("#firstname");
}
function validLastName() {
    return validName("#lastname");
}
function validName(name) {
    var charCount = 0;
    var elem = document.querySelector(name);
    var input = elem.value.trim();
    if (input.length == 0) {
        showErrors('name_errors', "Name is required.");
        elem.focus(); return false;
    }
    if (input.length > 30) {
        showErrors('name_errors', "Name must be maximum 30 characters.");
        elem.focus(); return false;
    }
    if (/[^a-zA-Z\-\']/.test(input)) {
        showErrors('name_errors', "Only alphabets and apostrophe/hyphen are allowed.")
        elem.focus(); return false;
    }
    input = input.toUpperCase();
    for (var i = 0; i < input.length; i++) {
        if (input.charAt(i) >= "A" && input.charAt(i) <= "Z") {
            charCount++;
        }
    }
    if (charCount === 0) {
        showErrors('name_errors', "Name must contain a letter.");
        elem.focus(); return false;
    }
    return true;
}

/********** Email address validation **********/
function validEmail() {
    var elem = document.querySelector("#email");
    var input = elem.value.trim();
    var regex = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;   // regex format: abc123@email.com
    if (!regex.test(input)) {
        showErrors('email_errors', "Email address is not valid.");
        elem.focus(); return false;
    }
    return true;
}

/********** Phone number validation **********/
function validPhoneNum() {
    var elem = document.querySelector("#phoneNum");
    var input = elem.value.trim();
    var regex = /^[0-9]{10}$/;           // regex format: 4161232345
    // array of all Canadian valid area codes
    var areaCodes = ["416", "647", "437", "403", "587", "825", "780", "250",
        "778", "236", "604", "204", "431", "506", "709", "867", "902", "782",
        "519", "226", "548", "613", "343", "705", "249", "807", "905", "289",
        "365", "418", "581", "450", "579", "514", "438", "819", "873", "306", "639"];
    var areaValid = false;
    if (input.length > 0) {
        if (!regex.test(input)) {
            showErrors('phone_errors', "Phone number must be 10 numeric characters only.");
            elem.focus(); return false;
        }
        var phoneArea = input.substr(0, 3);
        for (var i = 0; i < areaCodes.length; i++) {
            if (phoneArea == areaCodes[i]) {
                areaValid = true;
            }
        }
        if (!areaValid) {
            showErrors('phone_errors', "Invalid Canadian area code is entered.");
            elem.focus(); return false;
        }
    }
    return true;
}

/********** Postal code validation **********/
function validPostalCode() {
    var elem = document.querySelector("#postalcode");
    var input = elem.value.trim();
    var regex = /^[a-zA-Z][0-9][a-zA-Z][0-9][a-zA-Z][0-9]$/;   // regex format: A1A1A1
    if (!regex.test(input)) {
        showErrors('postal_errors', "Postal code is not valid.");
        elem.focus(); return false;
    }
    return true;
}

/********** Show error message function **********/
function showErrors(id, message) {
    document.getElementById(id).innerHTML = message;
}
function clearErrors() {
    document.querySelector(".errorMsg").innerHTML = "";
}


/**************************** User Profile Retype Password ****************************/
$('.retype').hide();
$('#ChangePasswordBtn').click(function () {
    $(this).data('clicked', true);
    $(this).hide();
    $('.retype').show();
})

/**************************** User Profile Retype Password ****************************/
$('#userprofile')
    .each(function () {
        $(this).data('serialized', $(this).serialize())
    })
    .on('change input', function () {
        $(this)
            .find('input:submit, button:submit')
            .prop('disabled', $(this).serialize() == $(this).data('serialized'))
            ;
    })
    .find('input:submit, button:submit')
    .prop('disabled', true);


/**************************** Post Item Validation ****************************/
$(function () {
    $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
        }
    });

    function imageIsLoaded(e) {
        $('#myImg').attr('src', e.target.result)
            .width(auto)
            .height(200);
    };

    $('.date-own').datepicker({
        format: "yyyy",
        viewMode: "years",
        minViewMode: "years",
        endDate: '+0d',
        autoclose: true,
    });

    $('#itemform').submit(function () {
        $('.errorMsg').text('');
        var img = $('#photoURL').val();
        var category = $('#categoryselect').val();
        var title = $('#name').val();
        var description = $('#description').val();
        var deposit = $('#depositPrice').val();
        var rent = $('#rentPerDay').val();
        var date = $('#purchasedYear').val();
        var valid = true;

        if (!img) {
            $('#imgError').text('Please upload an image.');
            valid = false;
        }
        if (!category) {
            $('#categoryError').text('Please select a category.');
            valid = false;
        }
        if (!title) {
            $('#nameError').text('Please enter a title.');
            valid = false;
        }
        if (!description) {
            $('#descError').text('Please enter a description.');
            valid = false;
        }
        if (!deposit) {
            $('#depositError').text('Please enter a deposit amount.');
            valid = false;
        } else if (deposit < 0) {
            $('#depositError').text('Deposit must be positive value.');
            valid = false;
        } else if (deposit > 10000) {
            $('#depositError').text('Deposit must be maximum $10000.');
            valid = false;
        }
        if (!rent) {
            $('#rentError').text('Please enter a rental price per day.');
            valid = false;
        } else if (rent < 0) {
            $('#rentError').text('Rental price must be positive value.');
            valid = false;
        } else if (rent > 500) {
            $('#rentError').text('Rental price must be maximum $500.');
            valid = false;
        }
        if (!date) {
            $('#dateError').text('Please enter a purchased year.');
            valid = false;
        } else if (date.length != 4) {
            $('#dateError').text('Purchased year must be 4 digits.');
            valid = false;
        } else if (isNaN(date)) {
            $('#dateError').text('Purchased year must be numbers.');
            valid = false;
        }
        return valid;
    })
});