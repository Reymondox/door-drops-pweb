askUserByAlertRedirect(
    '.log-out', 
    '¿Estas seguro de que deseas cerrar sesión?'
)

function askUserByAlert(idButton, message){
    $(document).ready(function () {
        $(idButton).on('click', function (e) {
           e.preventDefault();
           const form = $(this).closest('form');
           if (confirm(message)){
               form.submit();
           }
        });
       });
}

function askUserByAlertRedirect(idButton, message){
    $(idButton).on('click', function (e) {
        e.preventDefault();
        targetHref = $(this).attr('href'); 
        if (confirm(message)){
            window.location.href = targetHref;
        }
    });
}
