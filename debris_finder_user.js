// ==UserScript==
// @name         debri_finder
// @namespace    http://travel4live.ru
// @version      1.0.0
// @description  Find debri
// @author       Volkv
// @include       http://*.ogame.gameforge.com/game/index.php?page=galaxy*
// @include       https://*.ogame.gameforge.com/game/index.php?page=galaxy*
// ==/UserScript==
'use strict';


//StupidTable

(function (c) {
    c.fn.stupidtable = function (b) {
        return this.each(function () {
            var a = c(this);
            b = b || {};
            b = c.extend({}, c.fn.stupidtable.default_sort_fns, b);
            a.data("sortFns", b);
            a.on("click.stupidtable", "thead th", function () {
                c(this).stupidsort()
            })
        })
    };
    c.fn.stupidsort = function (b) {
        var a = c(this), g = 0, f = c.fn.stupidtable.dir, e = a.closest("table"), k = a.data("sort") || null;
        if (null !== k) {
            a.parents("tr").find("th").slice(0, c(this).index()).each(function () {
                var a = c(this).attr("colspan") || 1;
                g += parseInt(a, 10)
            });
            var d;
            1 == arguments.length ?
                d = b : (d = b || a.data("sort-default") || f.ASC, a.data("sort-dir") && (d = a.data("sort-dir") === f.ASC ? f.DESC : f.ASC));
            e.trigger("beforetablesort", {column: g, direction: d});
            e.css("display");
            setTimeout(function () {
                var b = [], l = e.data("sortFns")[k], h = e.children("tbody").children("tr");
                h.each(function (a, e) {
                    var d = c(e).children().eq(g), f = d.data("sort-value");
                    "undefined" === typeof f && (f = d.text(), d.data("sort-value", f));
                    b.push([f, e])
                });
                b.sort(function (a, b) {
                    return l(a[0], b[0])
                });
                d != f.ASC && b.reverse();
                h = c.map(b, function (a) {
                    return a[1]
                });
                e.children("tbody").append(h);
                e.find("th").data("sort-dir", null).removeClass("sorting-desc sorting-asc");
                a.data("sort-dir", d).addClass("sorting-" + d);
                e.trigger("aftertablesort", {column: g, direction: d});
                e.css("display")
            }, 10);
            return a
        }
    };
    c.fn.updateSortVal = function (b) {
        var a = c(this);
        a.is("[data-sort-value]") && a.attr("data-sort-value", b);
        a.data("sort-value", b);
        return a
    };
    c.fn.stupidtable.dir = {ASC: "asc", DESC: "desc"};
    c.fn.stupidtable.default_sort_fns = {
        "int": function (b, a) {
            return parseInt(b, 10) - parseInt(a, 10)
        },
        "float": function (b, a) {
            return parseFloat(b) - parseFloat(a)
        }, string: function (b, a) {
            return b.localeCompare(a)
        }, "string-ins": function (b, a) {
            b = b.toLocaleLowerCase();
            a = a.toLocaleLowerCase();
            return b.localeCompare(a)
        }
    }
})(jQuery);


var debris = [];
var div = document.createElement('div');


$('<div id="finddebri" class="btn_blue float_right" style="margin-left: 30px;"">Find</div>').insertBefore('#expeditionbutton');
$('<span id="counter" style="float: left;">g:</span>').insertBefore('#expeditionbutton');
$('<input id="debri_gal" style="display: block;float: left;height: 14px;line-height: 16px;margin: 0 2px;padding: 0 3px;text-align: center;width: 20px;"class="hideNumberSpin" maxlength="1" type="text" pattern="[0-9]*" onfocus="clearInput(this);" onkeyup="checkIntInput(this, 1, 6)" value="' + $('#galaxy_input').val() + '" >').insertBefore('#expeditionbutton');
$('<span id="counter" style="float: left;">s:</span>').insertBefore('#expeditionbutton');
$('<input id="debri_s" style="display: block;float: left;height: 14px;line-height: 16px;margin: 0 2px;padding: 0 3px;text-align: center;width: 32px;"class="hideNumberSpin" maxlength="3" type="text" pattern="[0-9]*" onfocus="clearInput(this);" onkeyup="checkIntInput(this, 1, 499)" value="' + (parseFloat($('#system_input').val()) - 50) + '" >').insertBefore('#expeditionbutton');
$('<span id="counter" style="float: left;">-</span>').insertBefore('#expeditionbutton');
$('<input id="debri_po" style="display: block;float: left;height: 14px;line-height: 16px;margin: 0 2px;padding: 0 3px;text-align: center;width: 32px;"class="hideNumberSpin" maxlength="3" type="text" pattern="[0-9]*" onfocus="clearInput(this);" onkeyup="checkIntInput(this, 1, 499)" value="' + (parseFloat($('#system_input').val()) + 50) + '" >').insertBefore('#expeditionbutton');
$('<div id="stopdebri" class="btn_blue float_right";">Stop</div>').insertBefore('#expeditionbutton');


$('#expeditionbutton').remove();

var g;
var s;
var po;
var vozvrat = false;

function get_space(g, s) {

    if (vozvrat) return;

    $('#debri_s').val(s);

    $.post(contentLink, {
        galaxy: g,
        system: s
    }, galaxy_output);
}

$('#stopdebri').click(function () {
    vozvrat = true;
});

$('#finddebri').click(function () {
    vozvrat = false;

    g = parseInt($('#debri_gal').val());
    s = parseInt($('#debri_s').val());
    po = parseInt($('#debri_po').val());
    get_space(g, s);
    $("#galaxyContent").html('<table id="debritable"><thead><tr id="debrishead" class="ct_head_row" style=" height: 30px; text-align: center; cursor: pointer;"><th data-sort="float" style="width: 150px;">Coordinates</th><th data-sort="string" colspan="1"  style="width: 200px; overflow: hidden;">Resource</th><th data-sort="float" colspan="1" style="width:200px;">Amount</th><th colspan="1" style="width:50px;">Go for it</th></tr></thead><tbody></tbody></table>');
    $('#debritable').stupidtable();
});


function galaxy_output(o) {

    if (s < po) {

        div.innerHTML = o;
        var el = div.childNodes[0];

        $.each($(el).find("li.debris-content"), function (i, val) {

            if ($(val).text().split(":")[1].replace(/\D/g, '') > 100000 || (($(val).text().split(":")[0] === 'Dark Matter') && ($(val).text().split(":")[1] > 0))) {

                $('#debritable > tbody:last-child').append('<tr class="row ago_galaxy_row" style="background: transparent;"><td class="planetname">' +
                    g + ":" + s + ":" + $(val).closest("tr").children(".position").text() +
                    '</td><td class="playername js_playerName8 js_no_action"><span class="status_abbr_active">' +
                    $(val).text().split(":")[0] + '</span></td><td class="playername js_playerName8 js_no_action"><span class="status_abbr_active">' +
                    $(val).text().split(":")[1] +
                    '</span></td><td class="action"><a class="tooltip js_hideTipOnMobile espionage" title="Send recyclers" onclick="sendShipsWithPopup(8,2,379,7,2,1);return false" href="javascript:void(0);">'
                    + '<span class="tooltip planetMoveIcons colonize-active icon"></span></a></td></tr>');

            }

        });

        get_space(g, ++s);
    }


}

