define(['module'], function(module) {
    var config = module.config();

    var serverErrorWin = $(document.getElementById(config.server_error_win_id));
    var cantDeleteWin = $(document.getElementById(config.cant_delete_win_id));
    var deleteWin = $(document.getElementById(config.confirm_delete_win_id));
    var deleteBtn = config.delete_btn_id;

    var deleteBtns =  $(config.buttons_remove);
    return {
        run: function() {
            var self = this;
            deleteBtns.on('click', function(e) {
                e.preventDefault();
                self.openWindow();
                var remove_url = this.href;

                $(document.getElementById(deleteBtn)).one('click', function(e) {
                    self.onDeleteClick(remove_url);
                });
            });
        },

        onDeleteClick: function(url) {
            var self = this;

            $.ajax({
                method: 'GET',
                url: url,
                dataType: 'json'
            }).then(function(result) {
                self.closeWindow();

                if (result.success) {
                    window.location = result.redirect;
                } else {
                    self.cantRemoveWin();
                }
            }, function() {
                self.serverException();
            });
        },

        openWindow: function() {
            return deleteWin.modal({ backdrop: 'static', keyboard: false });
        },

        /**
         * Delete is not allowed
         */
        closeWindow: function() {
            deleteWin.modal('hide');
        },

        cantRemoveWin: function() {
            cantDeleteWin.modal('show');
        },

        /**
         * Server Exception
         */
        serverException: function() {
            deleteWin.modal('hide');
            serverErrorWin.modal('show');
        }
    }
});