/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log(cordova.plugins.email);
    },
    // Update DOM on a Received Event
    /*receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }*/
};

var onlineStatus = navigator.onLine;

var contact = {
    submit: function () {
        $('form').submit(function (e) {
            e.preventDefault();
            contact.sendEmail($(this));
        });
    },
    sendEmail: function (form) {
        var name = form.find('input[name=name]'),
            email = form.find('input[name=email]'),
            msg = form.find('textarea[name=msg]');

        cordova.plugins.email.open({
            to:      'pepe.lujan2@gmail.com',
            cc:      email.val(),
            subject: 'Mensaje enviado desde la forma de contacto de la app de SupremeFest',
            body:    "Nombre: " + name.val() + "\n" + "Mensage: " + msg.val()
        });

        name.val('').removeClass('has-content');
        email.val('').removeClass('has-content');
        msg.val('').removeClass('has-content');
    },
    inputEvents: function () {
        $('input,textarea').not(':input[type=submit]').blur(function () {
            var inp = $(this),
                val = inp.val();

            if(val !== '')
                inp.addClass('has-content');
            else
                inp.removeClass('has-content');
        });
    }
}

var events = {
    getEvents: function (main_load,callback,get_both) {
        $.getJSON(events.file, function (data) {
            events.events_json = data;
             console.log(events.events_json);
        }).then(function () {
            if(main_load)
                events.setEventsInfo();
            if(get_both) {
                events.db_filter("activities");
                $.getJSON(events.file, function (data) {
                    events.activities_json = data;
                     console.log(events.activities_json);
                }).then(function () {
                    if(callback)
                        callback();
                });
            }
            else if(callback)
                callback();
        });
    },
    setEventsInfo: function () {
        var ev_ctnr = $('#events-list');
        if(ev_ctnr.length !== 0) {
            ev_ctnr.html('');
            /*ev_ctnr.html(
                '<div class="preloader">' +
                '<div class="loader"></div>' +
                '</div>'
            );*/
            //ev_ctnr.find('.preloader').fadeOut('fast');
            $.each(events.events_json, function (index, value) {
                events.setEventContainer(ev_ctnr,value,index);
            });
        }
    },
    getEventInfo: function (id,obj_ref,type,callback) {
        var ev;
        events.db_filter(type);
        $.getJSON(events.file, function (data) {
            events[obj_ref] = data;
            ev = data[id];
        }).then(function () {
            callback(id,obj_ref,type,ev);
        });
    },
    setEventContainer: function (main,event,index) {
        main.append(
            '<div class="row event-single">' +
            '<button class="ui-btn no-margin" onclick="events.setSelectedEvent('+index+',\'events_json\')">' +
            '<div class="datetime"><span class="start">'+ event.start_time + '</span> - <span class="end">'+ event.end_time + '</span></div>' +
            '<div class="title">'+ event.title + '</div>' +
            '<div class="excerpt">'+ event.excerpt + '</div>' +
            '</button>' +
            '</div>'
        );
    },
    setSelectedEvent: function (id,obj_ref) {
        events.selected_event = events[obj_ref][id];
        loadPage("event.html");
    },
    loadEvent: function () {
        var ev = $('#single-event'),
            title = ev.find('.title'),
            datetime = ev.find('.datetime'),
            location = ev.find('.location'),
            description = ev.find('.description'),
            partArr = [];
        title.html(events.selected_event.title);
        datetime.html(events.selected_event.date + ' ' + events.selected_event.start_time + ' - ' + events.selected_event.end_time);
        location.html(events.selected_event.location);
        description.html(events.selected_event.desc);
        if(events.selected_event.participants) {
            events.selected_event.participants.forEach(function (id) {
                participants.getParticipantInfo(id,events.setParticipants);
            });
        }
    },
    setParticipants: function (id,el) {
        var ptcpts = $('#single-event').find('.participants');
        ptcpts.append('<div><button class="ui-btn no-margin" onclick="participants.setSelectedParticipant('+id+')">' + el.name + '</button></div>');
    },
    events_json: null,
    activities_json: null,
    selected_event: null,
    db_filter: function (filter) {
        switch (filter) {
            case 'events':
                events.file = "db/events/events.json";
                break;
            case 'activities':
                events.file = "db/events/activities.json";
                break;
        }
    },
    file: null
};

var participants = {
    getParticipants: function (main_load) {
        $.getJSON("db/participants/participants.json", function (data) {
            participants.participants_json = data;
        }).then(function () {
            participants.setParticipantsInfo();
        });
    },
    setParticipantsInfo: function () {
        var par_ctnr = $('#participants-list');
        if(par_ctnr.length !== 0) {
            par_ctnr.html('');
            $.each(participants.participants_json, function (index, value) {
                participants.setParticipantContainer(par_ctnr,value,index);
            });
        }
    },
    getParticipantInfo: function (id,callback) {
        var par;
        $.getJSON("db/participants/participants.json", function (data) {
            participants.participants_json = data;
            par = data[id];
        }).then(function () {
            callback(id,par);
        });
    },
    setParticipantContainer: function (main,participant,index) {
        main.append(
            '<div class="row event-single">' +
            '<button class="ui-btn no-margin" onclick="participants.setSelectedParticipant('+index+')">' +
            '<div class="name">'+ participant.name + '</div>' +
            '</button>' +
            '</div>'
        );
    },
    setSelectedParticipant: function (id) {
        participants.selected_participant = participants.participants_json[id];
        loadPage("participant.html");
    },
    loadParticipant: function () {
        //if($.isEmptyObject(events.events_json)) {
        events.db_filter("events");
        events.getEvents(false,participants.mapEventsToParticipant,true);
        /*} else {
            participants.mapEventsToParticipant();
        }*/
    },
    mapEventsToParticipant: function () {
        var par = $('#single-participant'),
            name = par.find('.name'),
            description = par.find('.description'),
            phone = par.find('.phone'),
            email = par.find('.email');
        name.html(participants.selected_participant.name);
        description.html(participants.selected_participant.desc);
        phone.html(participants.selected_participant.contact.phone);
        email.html(participants.selected_participant.contact.email);

        participants.mappingFunction('events');
        participants.mappingFunction('activities');
    },
    mappingFunction: function (type) {
        var params = [];
        switch (type) {
            case 'events':
                params.push('events_json');
                break;
            case 'activities':
                params.push('activities_json');
                break;
        }
        var ev_arr = $.map(events[params[0]], function(value, index) {
                return [value];
            }),
            par_ev = [];
        ev_arr.forEach(function (el) {
            if(el.participants) {
                var find = el.participants.indexOf(participants.selected_participant.participant_id);
                if(find !== -1) {
                    par_ev.push(el.event_id);
                }
            }
        });
        par_ev.forEach(function (id) {
            //console.log('sending: '+id);
            events.getEventInfo(id,params[0],type,participants.setEvents);
        });
    },
    setEvents: function (id,obj_ref,type,el) {
        //console.log('received: '+id); sometimes received out of order (async function?)
        var evts = $('#single-participant').find('.'+type),
            evts_ctnr = evts.closest('section');
        if(evts_ctnr.hasClass('d-none'))
            evts_ctnr.removeClass('d-none');
        evts.append('<div><button class="ui-btn no-margin" onclick="events.setSelectedEvent('+id+',\''+obj_ref+'\')">' + el.title + '</button></div>');
    },
    participants_json: null,
    selected_participant: null
};

var map = {
    getLocations: function () {
        $.getJSON("db/map/locations.json", function (data) {
            map.locations_json = data;
        });
    },
    getLocationInfo: function (marker,location_id) {
        var location = map.locations_json[location_id],
            top = $('#map-container'),
            bottom = $('#map .bottom-details');
        bottom.find('.title').html(location.title);
        bottom.find('.desc').html(location.desc);
        bottom.addClass('shown');
        top.addClass('shown');
        if(!$(marker).hasClass('active')) {
            setTimeout(function () {
                top.animate({scrollTop: ($(marker).position().top) - (top.height()/2)},500,'swing');
            },300);
        } else {
            top.animate({scrollTop: ($(marker).position().top) - (top.height()/2)},500,'swing');
        }
        $('.map-btn.active').removeClass('active');
        $(marker).addClass('active');
    },
    closeDetails: function () {
        var top = $('#map-container'),
            bottom = $('#map .bottom-details'),
            marker = $('.map-btn.active');
        marker.removeClass('active');
        bottom.removeClass('shown');
        top.removeClass('shown');
    },
    locations_json: null
};

function loadPage(page) {
    $( ":mobile-pagecontainer" ).pagecontainer( "change", page )
}

$(function() {
    $( "body>[data-role='panel']" ).panel();
    $( ":mobile-pagecontainer" ).pagecontainer({
        change: function( event, ui ) {
            var tgt = null;
            if(typeof ui.options.direction === 'undefined')
                tgt = ui.options.target;
            else {
                var hash = reverseString(ui.options.hash);
                tgt = reverseString(hash.substr(0, hash.indexOf('/')));
            }
            if(tgt)
                detectNav(tgt);
        }
    });
});

function detectNav(tgt) {
    switch (tgt) {
        case 'events.html':
            events.db_filter("events");
            events.getEvents(true);
            break;
        case 'event.html':
            events.loadEvent();
            break;
        case 'activities.html':
            events.db_filter("activities");
            events.getEvents(true);
            break;
        case 'map.html':
            map.getLocations();
            break;
        case 'participants.html':
            participants.getParticipants(true);
            break;
        case 'participant.html':
            participants.loadParticipant();
            break;
        case 'contact.html':
            onlineStatus = navigator.onLine;
            if(!onlineStatus) {
                $('form,.google-map iframe').addClass('d-none');
                $('.google-map').addClass('bg-img');
            } else {
                $('.d-none').removeClass('d-none');
                contact.inputEvents();
                contact.submit();
            }
            break;
    }
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

$(function () {
    // Set the date being counted down
    var countDownDate = new Date("Dec 22, 2018").getTime(),
        // Update the count down every second
        x = setInterval(function () {
            // Get today's date and time
            var now = new Date().getTime(),
                // Find the distance between now and the count down date
                distance = countDownDate - now,
                // Time calculations for days, hours, minutes and seconds
                days = setMinTwoDigitNum(Math.floor(distance / (1000 * 60 * 60 * 24))),
                hours = setMinTwoDigitNum(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
                minutes = setMinTwoDigitNum(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
                seconds = setMinTwoDigitNum(Math.floor((distance % (1000 * 60)) / 1000)),
                time_container = $('#countdown time');

            // Set count down value on iteration
            time_container.text(days + 'd:' + hours + 'h:' + minutes + 'm:' + seconds + 's');

            // If the count down is finished, set count down to 00:00:00:00
            if(distance < 0) {
                clearInterval(x);
                time_container.text('00:00:00:00');
            }
        }, 1000);
});

function setMinTwoDigitNum(number) {
    number = number.toString();
    if(number.length < 2)
        number = '0'+number;
    return number
}