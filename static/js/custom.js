$(document).ready(function () {
    $('div.post h2, div.post h3').each(function () {
        $(this)
            .append(
                '<a class="anchor-link" href=#' + $(this).context.id + '>' +
                '<i data-feather="link"></i></a>'
            )
            .addClass('anchor-link-container');
    });

    feather.replace();
});
