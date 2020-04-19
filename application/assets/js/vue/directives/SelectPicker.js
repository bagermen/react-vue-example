import _ from 'lodash'
import eventHelper from '@/common/Event'
// select picker wrapper for select tag

export default {
    name: 'selectpicker',

    bind(el, bind) {
        $(el).selectpicker('destroy');
        setTimeout(() => {
            let val = el.value;
            $(el).selectpicker(bind.value);
            $(el).selectpicker('render');
            $(el).selectpicker('val', val);
        }, 0);

        $(el).on('changed.bs.select', () => {
            eventHelper.fireEvent(el, "change");
        });
    },

    componentUpdated(el, bind) {
        $(el).selectpicker('refresh');

    },

    unbind (el) {
        $(el).selectpicker('destroy');
    }
}
