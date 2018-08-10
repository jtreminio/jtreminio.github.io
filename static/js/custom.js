$(document).ready(function () {
    if (getCookie('lighttheme') == 1) {
        $('[data-style="dark"]').prop('disabled', true);
    }

    $('div.post h2, div.post h3, div.post h4').each(function () {
        $(this)
            .append(
                '<a class="anchor-link" href="#' + $(this).context.id + '">' +
                '<i class="feather icon-link"></i></a>'
            )
            .addClass('anchor-link-container');
    });

    $(document).on('click', '[data-toggle="collapse"]', function(e) {
        $($(this).data('target')).slideToggle();
    });

    $(document).on('click', 'a.theme-toggle', function(e) {
        e.preventDefault();

        var $darkCss = $('[data-style="dark"]');

        if ($darkCss.prop('disabled')) {
            setCookie('lighttheme', '0', 30);
            $darkCss.prop('disabled', false);

            return;
        }

        setCookie('lighttheme', '1', 30);
        $darkCss.prop('disabled', true);
    });
});

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name+'=; Max-Age=-99999999;';
}
