askUserByAlertRedirect(
    '.log-out', 
    '¿Estas seguro de que deseas cerrar sesión?'
);

askUserByAlertRedirect(
    '.edit-ITBIS', 
    '¿Estas seguro de que deseas editar las ITBIS?'
);

askUserByAlert(
    '.delete-commerce-type',
    '¿Estas seguro de que deseas eliminar el tipo de comercio? *SE ELIMINARÁN TAMBIÉN TODOS LOS COMERCIOS RELACIONADOS*'
)

askUserByAlert(
    '.delete-categoria',
    '¿Estas seguro que quieres eliminar esta categoria? *SE ELIMINARÁN TAMBIÉN TODOS LOS PRODUCTOS RELACIONADOS*'
)

askUserByAlert(
    '.delete-producto',
    '¿Estas seguro que quieres eliminar este producto?'
)


askUserByAlert(
    '.deactivate-admin',
    '¿Estas seguro de que deseas desactivar al administrador?'
)

askUserByAlert(
    '.activate-admin',
    '¿Estas seguro de que deseas activar al administrador?'
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
