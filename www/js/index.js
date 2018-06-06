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
                    events.setEventContainer(ev_ctnr,value);
                });
            });
        }
    },
    setEventContainer: function (main,event) {
        main.append(
            '<div class="row event-single">' +
            '<div class="col-12 datetime"><span class="start">'+ event.start_time + '</span> - <span class="end">'+ event.end_time + '</span></div>' +
            '<div class="col-12 title">'+ event.title + '</div>' +
            '<div class="col-12 excerpt">'+ event.excerpt + '</div>' +
            '</div>'
        );
    },
    events_json: null
}