
var current_filters = {};
var active_filters  = {};
var ionslider = null;


function filter_by_handler()
{
    switch ( $( '#filter_by' ).val() )
    {
        case 'uuid':
            var filter_html = '<label>Serial Number:</label>';
            filter_html += '<input type="text" class="form-control" id="uuid_filter" style="margin-right: 10px;" />';
            filter_html += '<button class="btn btn-warning btn-sm" onclick="return add_filter_handler(event);">Add Filter</button>';

            $("#filter_by_box").html( filter_html );
            break;
        case 'dealership':
            require(['heartbeatmonitor/filter/dealership'], function(dealership) {
                dealership.renderTo(document.getElementById('filter_by_box'));
            });
            break;
        case 'dealergroup':
            require(['heartbeatmonitor/filter/dealergroup'], function(dealergroup) {
                dealergroup.renderTo(document.getElementById('filter_by_box'));
            });
            break;
        case 'status':
            var filter_html = '<label>Current Status:</label>';
            filter_html += '<select id="dev_status" class="form-control" style="margin-right: 10px;">';
            filter_html += '    <option value="">Any</option>';
            filter_html += '    <option value="green">Playing</option>';
            filter_html += '    <option value="yellow">Partially Playing</option>';
            filter_html += '    <option value="red" selected>Offline</option>';
            filter_html += '</select>';
            filter_html += '<button class="btn btn-warning btn-sm" onclick="return add_filter_handler(event);">Add Filter</button>';
            $("#filter_by_box").html( filter_html );
            break;
        case 'inventory_status':
            var filter_html = '<label>Inventory Status:</label>';
            filter_html += '<select id="inv_status" class="form-control" style="margin-right: 10px;">';
            filter_html += '    <option value="">Any</option>';
            filter_html += '    <option value="production" selected>Production</option>';
            filter_html += '    <option value="staging">Staging</option>';
            filter_html += '    <option value="testing">Testing</option>';
            filter_html += '    <option value="inventory">Inventory</option>';
            filter_html += '</select>';
            filter_html += '<button class="btn btn-warning btn-sm" onclick="return add_filter_handler(event);">Add Filter</button>';
            $("#filter_by_box").html( filter_html );
            break;
        case 'skip_empty':
            var filter_html = '<label><span style="margin-right: 5px;">Skip Empty:</span></span>';
            filter_html +=          '<input id="skip_empty" type="checkbox" class="form-control" checked="checked" style="margin-right: 10px;">';
            filter_html +=    '</label>';

            filter_html += '<button class="btn btn-warning btn-sm" onclick="return add_filter_handler(event);">Add Filter</button>';
            $("#filter_by_box").html( filter_html );
            break;
    }
}


function add_filter_handler(e)
{
    var el;

    if (e) {
        e.preventDefault();
    }

    switch ( $( "#filter_by" ).val() )
    {
        case 'uuid':
            var net_raw = $("#uuid_filter").val();

            add_filter('uuid', 'uuid', net_raw, 'Serial Number=' + net_raw);
            break;
        case 'dealership':
            require(['heartbeatmonitor/filter/dealership'], function(dealership) {
                var data = dealership.getValue(),
                    el;
                if (data) {
                    el = dealership.getSelectEl();
                    add_filter('dealership', 'dealership', data, 'Dealership="' + el.options[el.selectedIndex].innerHTML + '"');
                }
            });
            break;
        case 'dealergroup':
            require(['heartbeatmonitor/filter/dealergroup'], function(dealergroup) {
                var data = dealergroup.getValue(),
                    el;
                if (data) {
                    el = dealergroup.getSelectEl();
                    add_filter('dealergroup', 'dealergroup', data, 'Dealer Group="' + el.options[el.selectedIndex].innerHTML + '"');
                }
            });
            break;
        case 'status':
            el = document.getElementById('dev_status');
            add_filter('status', 'status', el.value, 'Current Status="' + el.options[el.selectedIndex].innerHTML + '"', true);
            break;
        case 'inventory_status':
            el = document.getElementById('inv_status');
            add_filter('inventory_status', 'inventory_status', el.value, 'Inventory Status="' + el.options[el.selectedIndex].innerHTML + '"');
            break;
        case 'skip_empty':
            el = document.getElementById('skip_empty');

            add_filter('skip_empty', 'skip_empty', $(el).is(':checked') ? 1 : 0, 'Skip Empty="' + ($(el).is(':checked') ? 'Yes' : 'No') + '"', true);
            break;

    }

    return false;
}

function add_filter( filter_group, filter_type, filter_value_id, filter_value_txt, unique )
{
    unique = unique || false;

    if ( typeof current_filters[ filter_group ] != 'undefined' )
    {
        for ( var curr_filter_value_id in current_filters[ filter_group ] )
        {
            if (!current_filters[filter_group].hasOwnProperty(curr_filter_value_id)) {
                continue;
            }
            if ( curr_filter_value_id == filter_value_id )
                return;

            var id;
            if ( unique )
            {
                id =  filter_group + '-' + safe_id( curr_filter_value_id );
                $( document.getElementById( id ) ).remove();
                delete current_filters[ filter_group ][ curr_filter_value_id ];
            }
            else if ( curr_filter_value_id.substring( 0, filter_value_id.length ) == filter_value_id &&
                 curr_filter_value_id.charAt( filter_value_id.length ) == '-' )
            {
                id = filter_group + '-' + safe_id( curr_filter_value_id );
                $( document.getElementById( id ) ).remove();
                delete current_filters[ filter_group ][ curr_filter_value_id ];
            }
            else if ( filter_value_id.substring( 0, curr_filter_value_id.length ) == curr_filter_value_id &&
                      filter_value_id.charAt( curr_filter_value_id.length ) == '-' )
            {
                id = filter_group + '-' + safe_id( curr_filter_value_id );
                $( document.getElementById( id ) ).remove();
                delete current_filters[ filter_group ][ curr_filter_value_id ];
            }
        }
    }
    else
        current_filters[ filter_group ] = {};


    current_filters[ filter_group ][ filter_value_id ] = { 'type': filter_type, 'value_txt': filter_value_txt };
    $('#filters_json').val( JSON.stringify( current_filters ) ).trigger( 'change' );

    var filter_html = '<button id="'+ filter_group +'-'+ safe_id( filter_value_id ) +'" type="button" onclick="return remove_filter( \''+ filter_group +'\', \''+ filter_value_id +'\' )" class="btn btn-xs btn-'+ filter_type +'" style="margin-left:5px;">';
    filter_html += filter_value_txt +'<span style="margin-left: 15px;" class="glyphicon glyphicon-remove"></span>';
    filter_html += '</button>';

    $("#filters_box").append( filter_html );
}


function get_txt_filters()
{
    var txt_filters = [];
    for ( var filter_group in active_filters )
    {
        if ( active_filters.hasOwnProperty( filter_group ) ) {
            for ( var filter_value_id in active_filters[ filter_group ] )
            {
                if ( active_filters[ filter_group ].hasOwnProperty( filter_value_id ) ) {
                    txt_filters.push( active_filters[ filter_group ][ filter_value_id ].value_txt );
                }
            }

        }

    }
    return txt_filters;
}


function remove_filter( filter_group, filter_value )
{
    // jQuery requires escape ids. Eg, dots should be converted to \\.
    var id = filter_group + '-' + safe_id( filter_value );

    $(document.getElementById( id ) ).remove();

    if ( typeof current_filters[ filter_group ] != 'undefined' )
        delete current_filters[ filter_group ][ filter_value ];

    $('#filters_json').val( JSON.stringify( current_filters )).trigger( 'change' );
    return false;
}

function remove_all_filters()
{
    $("#filters_box button").remove();
    current_filters = {};
    $('#filters_json').val("{}").trigger( 'change' );
}


function safe_id( id )
{
    return id.toString().replace( / /g, '_' );
}

