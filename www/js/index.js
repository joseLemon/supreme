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
        window.addEventListener('filePluginIsReady', function(){ console.log('File plugin is ready');}, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var events = {
    getEventFiles: function () {
        var ev_ctnr = $('#events-list');
        if(ev_ctnr.length !== 0) {
            ev_ctnr.html('');
            /*ev_ctnr.html(
                '<div class="preloader">' +
                '<div class="loader"></div>' +
                '</div>'
            );*/
            $.getJSON("db/events/events.json", function (data) {
                events.events_json = data;
                //ev_ctnr.find('.preloader').fadeOut('fast');
                $.each(data, function (index, value) {
                    events.setEventContainer(ev_ctnr,value,index);
                });
            });
        }
    },
    setEventContainer: function (main,event,index) {
        main.append(
            '<div class="row event-single">' +
            '<button class="ui-btn no-margin" onclick="events.setSelectedEvent('+index+')">' +
            '<div class="datetime"><span class="start">'+ event.start_time + '</span> - <span class="end">'+ event.end_time + '</span></div>' +
            '<div class="title">'+ event.title + '</div>' +
            '<div class="excerpt">'+ event.excerpt + '</div>' +
            '</button>' +
            '</div>'
        );
    },
    setSelectedEvent: function (id) {
        events.selected_event = events.events_json[id];
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
        events.selected_event.participants.forEach(function (id) {
            participants.getParticipantInfo(id,events.setParticipants);
        });
    },
    setParticipants: function (id,el) {
        var participants = $('#single-event').find('.participants');
        participants.append('<div><button class="ui-btn no-margin" onclick="participants.setSelectedParticipant('+id+')">' + el.name + '</button></div>');
    },
    events_json: null,
    selected_event: null
}

var participants = {
    getParticipantFiles: function () {
        var par_ctnr = $('#participants-list');
        if(par_ctnr.length !== 0) {
            par_ctnr.html('');
            $.getJSON("db/participants/participants.json", function (data) {
                participants.participants_json = data;
                $.each(data, function (index, value) {
                    participants.setParticipantContainer(par_ctnr,value,index);
                });
            });
        }
    },
    setParticipantContainer: function (main,event,index) {
        main.append(
            '<div class="row event-single">' +
            '<button class="ui-btn no-margin" onclick="participants.setSelectedParticipant('+index+')">' +
            /*'<div class="datetime"><span class="start">'+ event.start_time + '</span> - <span class="end">'+ event.end_time + '</span></div>' +
            '<div class="title">'+ event.title + '</div>' +
            '<div class="excerpt">'+ event.excerpt + '</div>' +
            '</button>' +*/
            '</div>'
        );
    },
    setSelectedParticipant: function (id) {
        participants.selected_participant = participants.participants_json[id];
        console.log(participants.selected_participant);
        loadPage("participant.html");
    },
    getParticipantInfo: function (id,callback) {
        $.getJSON("db/participants/participants.json", function (data) {
            participants.participants_json = data;
            participants.selected_participant = data[id];
        }).then(function () {
            callback(id,participants.selected_participant);
        });
    },
    loadParticipant: function () {
        var par = $('#single-event'),
            name = par.find('.name'),
            description = par.find('.description'),
            phone = par.find('.phone'),
            email = par.find('.email'),
            evArr = [];
        console.log(participants.selected_participant);
        name.html(participants.selected_participant.name);
        description.html(participants.selected_participant.desc);
        phone.html(participants.selected_participant.contact.phone);
        email.html(participants.selected_participant.contact.email);
        $.getJSON("db/events/events.json", function (index) {
            /*$.each(data, function (index, value) {
                events.setEventContainer(ev_ctnr,value,index);
            });*/
            var events = Object.keys(data).filter(function(i) {
                return data[i].participants == ;
            });
        });
    },
    participants_json: null,
    selected_participant: null
}

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
        $(marker).addClass('active');
        bottom.find('.title').html(location.title);
        bottom.find('.desc').html(location.desc);
        bottom.addClass('shown');
        top.addClass('shown');
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
}

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
            events.getEventFiles();
            break;
        case 'event.html':
            events.loadEvent();
            break;
        case 'map.html':
            map.getLocations();
            break
        case 'participant.html':
            participants.loadParticipant();
            break;
    }
}

function reverseString(str) {
    return str.split("").reverse().join("");
}