<template>
<div>
    <slot></slot>
    <div :id="confirmid" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="confirmCloseAction"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">{{ confirmationTitle }}</h4>
                </div>
                <div class="modal-body">
                    <p>{{ confirmationBody }}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" @click="confirmCloseAction">Close</button>
                    <button type="button" class="btn btn-primary" @click="confirmAction">OK</button>
                </div>
            </div>
        </div>
    </div>
    <div :id="errorid" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"  @click="confirmCloseAction"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">{{ errorTitle }}</h4>
                </div>
                <div class="modal-body">
                    <p>{{ errorBody }}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">OK</button>
                </div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<script>
import bus from '@/Bus'

export default {
    name: 'vi-analysis-filter',
    props: ['confirmid', 'errorid'],
    data() {
        return {
            confirmationTitle: 'Title',
            confirmationBody: 'Body',

            errorTitle: 'Error',
            errorBody: 'An error occured. Try again.',
        };
    },
    mounted() {
        let confirmid = this.confirmid;
        let errorid = this.errorid;
        bus.$on(confirmid, (title, body, action, cancel) => {
            if (title && body && action) {
                this.confirmationTitle = title ? title : 'Title';
                this.confirmationBody = body ? body : 'Body';
                this.confirmationAction = action ? action : {};
                this.confirmationCloseAction = cancel ? cancel : {};

                $('#' + confirmid).modal('show');
            }
        });
        bus.$on(errorid, (title, body) => {
            if (title && body && action) {
                this.errorTitle = title ? title : 'Error';
                this.errorBody = body ? body : 'An error occured. Try again.';

                $('#' + errorid).modal('show');
            }
        });
    },
    methods: {
        confirmAction() {
            let confirmid = this.confirmid;
            $('#' + confirmid).modal('hide');

            if (typeof this.confirmationAction == 'function') {
                this.confirmationAction();
            }
        },

        confirmCloseAction() {
            if (typeof this.confirmationCloseAction == 'function') {
                this.confirmationCloseAction();
            }
        }
    }
}

</script>

<style>

</style>

