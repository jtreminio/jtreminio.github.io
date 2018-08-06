$(document).ready(function () {
    $('div.post h2, div.post h3, div.post h4').each(function () {
        $(this)
            .append(
                '<a class="anchor-link" href="#' + $(this).context.id + '">' +
                '<i class="feather icon-link"></i></a>'
            )
            .addClass('anchor-link-container');
    });
});
