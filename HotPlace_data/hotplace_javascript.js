
var data_path = "/HotPlace_data/HotPlace_DB_filtered(35-10-20).json"

// (37.2804721840256, 127.11467724252604) 기흥구청
// (37.38279059708606, 127.11882455528438) 분당구청

/* ---------- 카카오맵 생성 ---------- */
var mapContainer = document.getElementById('map_id'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.38279059708606, 127.11882455528438),
        level: 4 // 지도의 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.BOTTOMLEFT);
/* ---------- 카카오맵 생성 ---------- */


/* ---------- 검색 관련 함수 ---------- */
function keysearchPlaces() {
    currCategory = 'keyword'
    var keyword = document.getElementById('keyword').value;
    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        toast_message('키워드를 입력해주세요!')
        return false
    }
    
    search_success = search_in_DB(keyword);
    console.log(search_success);
    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    // ps.keywordSearch(keyword, placesSearchCB)
}

function search_in_DB(keyword) {
    var is_in_data
    var is_in_alldata=false
    clusterer.clear();
    
    for (index in store_data) {
        is_in_data = false;
        /*
        // category 검색
        for (jj in store_data[index].category) {
            if (store_data[index].category[jj].indexOf(keyword)!=-1){is_in_data = true;is_in_alldata=true;}
        }
        // 상호명 검색
        if (store_data[index].name.indexOf(keyword)!=-1){is_in_data = true;is_in_alldata=true;}
        
        if (is_in_data){
            clusterer.addMarker(cluster_markers[index]);
            infowindow_set[index].setMap(map);
            //overlay_set[index].setMap(map);
            //marker_onoff[index]=false;
        } else {
            infowindow_set[index].setMap(null);
            overlay_set[index].setMap(null);
            marker_onoff[index]=false;
        }*/
    }
    
    return is_in_alldata
}
/* ---------- 검색 관련 함수 ---------- */



/* ---------- DEBUGing용 함수 ---------- */
function getInfo() {
    var center = map.getCenter(); 
    var level = map.getLevel();
    var mapTypeId = map.getMapTypeId();
    var bounds = map.getBounds();
    var swLatLng = bounds.getSouthWest();
    var neLatLng = bounds.getNorthEast();
    var boundsStr = bounds.toString();
    
    var message = '지도 중심좌표는 위도 ' + center.getLat() + ',\n';
    message += '경도 ' + center.getLng() + ' 이고\n';
    message += '지도 레벨은 ' + level + ' 입니다 \n\n';
    message += '지도 타입은 ' + mapTypeId + ' 이고\n ';
    message += '지도의 남서쪽 좌표는 ' + swLatLng.getLat() + ', ' + swLatLng.getLng() + ' 이고 \n';
    message += '북동쪽 좌표는 ' + neLatLng.getLat() + ', ' + neLatLng.getLng() + ' 입니다';
    console.log(message)
}

/*
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {        
    
    // 클릭한 위도, 경도 정보를 가져옵니다 
    var latlng = mouseEvent.latLng;
    
    var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
    message += '경도는 ' + latlng.getLng() + ' 입니다';
    
    console.log(message)
});*/
/* ---------- DEBUGing용 함수 ---------- */



/* ---------- GPS 관련 함수 ---------- */

var gps_use = null; //gps의 사용가능 여부
var gps_lat = null; // 위도
var gps_lng = null; // 경도
var gps_overlay;


function clickGPS() {
    
    var geo_success = function(position) {
        //hide_toast();
        //clearTimeout(toast_timeout);
        
        gps_lat = position.coords.latitude;
        gps_lng = position.coords.longitude;
        
        if (gps_use) {
            var position = new kakao.maps.LatLng(gps_lat,gps_lng);
            map.panTo(position);
            gps_overlay.setPosition(position);
        } else {
            var position = new kakao.maps.LatLng(gps_lat,gps_lng);
            map.panTo(position);
            var gps_content = '<div><img class="pulse" draggable="false" unselectable="on" src="https://ssl.pstatic.net/static/maps/m/pin_rd.png" alt=""></div>';
            gps_overlay = new kakao.maps.CustomOverlay({
                position: position,
                content: gps_content,
            })
            gps_overlay.setMap(map)
            gps_use = true;
        };
    };
    var geo_error = function(error) {
        switch(error.code) {
            case error.TIMEOUT:
                toast_message('위치 정보를 읽어올 수 없습니다. <br> 다시 시도해 주세요.');
                gps_use = false;
                break;
            case error.PERMISSION_DENIED:
                toast_message('현재 위치를 사용하시려면,<br> 위치 권한을 허용해주세요.');
                gps_use = false;
                break;
            case error.POSITION_UNAVAILABLE:
                toast_message('위치 정보를 얻을 수 없습니다.');
                gps_use = false;
                break;
            case error.UNKNOWN_ERROR:
                toast_message('GPS UNKNOWN_ERROR');
                gps_use = false;
                break;
        };
    };
    var options = {timeout:3000, enableHighAccuracy: true};
    
    navigator.geolocation.getCurrentPosition(geo_success, geo_error, options);
}

/* ---------- GPS 관련 함수 ---------- */




/* ---------- Marker Cluster 및 Overlay 관련 함수 ---------- */
// 마커 클러스터러를 생성합니다
var clusterer = new kakao.maps.MarkerClusterer({
    map: map,
    averageCenter: true,
    minLevel: 4,
    disableClickZoom: true
});

// 마커 클러스터러 클릭이벤트
kakao.maps.event.addListener(clusterer, 'clusterclick', function(cluster) {
    var level = map.getLevel()-2;
    // 지도를 클릭된 클러스터의 마커의 위치를 기준으로 확대합니다
    map.setLevel(level, {anchor: cluster.getCenter(), animate:true});
    var cluster_center = new kakao.maps.LatLng(cluster.getCenter().Ma, cluster.getCenter().La);
    map.setCenter(cluster_center);
});



var store_data;
var cluster_markers = [];
var overlay_set = [];
var infowindow_set = [];
var temp_overlay = [];
var marker_onoff = [];

// HotPlace 데이터 로드
loadJSON(data_path,function(data) {
    store_data=data;
    make_cluster_marker(data);
    }, function(xhr) {console.error(xhr)}
);


function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function make_cluster_marker(data) {
    // marker와 overlay 생성
    for (i in data) {
        cluster_markers[i] = new kakao.maps.Marker({
            position : new kakao.maps.LatLng(data[i].lat, data[i].lng),
            title : data[i].name
        });
        (function (i,data){make_overlay(i,data)})(i,data[i]);
        (function (marker,i,data){make_infowindow(marker,i,data)})(cluster_markers[i],i,data[i]);
        marker_onoff[i]=false;
    };
    
    // overlay 클릭 이벤트 생성
    for (i in data) {
        (function (i,marker,overlay) {
            kakao.maps.event.addListener(marker, 'click', function() {
                console.log(i)
                if (marker_onoff[i]==false){overlay.setMap(map); marker_onoff[i]=true;}
                else if (marker_onoff[i]==true){overlay.setMap(null); marker_onoff[i]=false;}
            });
            kakao.maps.event.addListener(overlay, 'dragestart', kakao.maps.event.preventMap);
        })(i,cluster_markers[i], overlay_set[i]);
    };
    clusterer.addMarkers(cluster_markers);
}

function make_overlay(i,data) {
    
    var overlay = new kakao.maps.CustomOverlay({zIndex:2, xAnchor:0.5, yAnchor:1.3});
    
    var content = '<div class="overlay_info">';
        content += '    <div id="store_name"><a href="'+ data.url +'"target="inner_iframe" onclick="show_inner_frame()"><strong>'+ data.name +'</strong></a></div>';
        content += '    <div id="overlay_close" onclick="close_overlay('+i+')"></div>';
        content += '    <div id="store_assessment">';
        content += '        <span id="assessment">';
        content += '            <span id="tvshow">'+ data.tvshow +'</span>  <span id="type">'+ data.type +'</span> 리뷰 : '+ data.review +'명 <br>';
        content += '            <span id="star">☆</span> (평가) : <span id="star">'+ data.star +'점</span> ('+ data.reply +')';
        content += '        </span>';
        content += '    </div>';
        content += '</div>';
    
    overlay.setContent(content);
    overlay.setPosition(new kakao.maps.LatLng(data.lat, data.lng));
    
    overlay_set[i] = overlay;
}

function close_overlay(index) {
    overlay_set[index].setMap(null);
    marker_onoff[index]=false;
}

function make_infowindow(marker,i,data){
    var info_window = new kakao.maps.CustomOverlay({zIndex:1, xAnchor:0.5, yAnchor:2.1});
    
    var info_content = '<div class="info_window">';
        info_content += data.type + '<br> <span id="star"><b>☆ ' + data.star + '</b></span></div>';
    
    info_window.setContent(info_content);
    info_window.setPosition(new kakao.maps.LatLng(data.lat, data.lng));
    
    //info_window.setMap(map);
    
    infowindow_set[i] = info_window;
}


// Zoom이 변경될 때 cluster가 작동하면 Overlay, info window를 없앱니다.
kakao.maps.event.addListener(clusterer, 'clustered', function(){
    
    if (map.getLevel()>=clusterer.getMinLevel()) {
        for (i in clusterer._clusters){
            if (clusterer._clusters[i]._markers.length != 1){
                
                for (j in clusterer._clusters[i]._markers){
                    var index = cluster_markers.indexOf(clusterer._clusters[i]._markers[j])
                    infowindow_set[index].setMap(null);
                    if (marker_onoff[index]==true && temp_overlay[index]==false){
                        overlay_set[index].setMap(null);
                        temp_overlay[index]=true;
                    } else if (marker_onoff[index]==false){temp_overlay[index]=false;}
                }
            } else if (clusterer._clusters[i]._markers.length == 1){
                index = cluster_markers.indexOf(clusterer._clusters[i]._markers[0])
                infowindow_set[index].setMap(map);
                if (marker_onoff[index]==true && temp_overlay[index]==true){
                    overlay_set[index].setMap(map);
                    temp_overlay[index]=false;
                } else if (marker_onoff[index]==false){temp_overlay[index]=false;}
            }
        }
    } else {for (i in store_data) {temp_overlay[i]=false;}}
});

kakao.maps.event.addListener(map, 'zoom_changed', function(){

    if (map.getLevel()<clusterer.getMinLevel()){
        for (i in store_data){
            if (cluster_markers[i].getMap()!=null){infowindow_set[i].setMap(map);}
            if (marker_onoff[i]==true && temp_overlay[i]==true){
                overlay_set[i].setMap(map);
                temp_overlay[i]=false;
            }
        }
    }
});
/* ---------- Marker Cluster 및 Overlay 관련 함수 ---------- */

/* ---------- iframe 요소 ---------- */
function show_inner_frame(){
    var newframe = document.getElementById('new_frame');
    newframe.classList.add('frame_on');
}

function close_inner_frame(){
    var newframe = document.getElementById('new_frame');
    var iframe = document.getElementById('inner_frame');
    
    iframe.src="about:blank"
    newframe.classList.remove('frame_on');
}
/* ---------- iframe 요소 ---------- */


/* ---------- toast message 관련 ---------- */
function toast_message(message){
    var toast_class = document.getElementsByClassName("toast");
    toast_class[0].innerHTML = message;
    toast_class[0].classList.add("toast_on");
    var remove_toast = function (){toast_class[0].classList.remove("toast_on");};
    setTimeout(remove_toast,3000);
}
/* ---------- toast message 관련 ---------- */
