/*
keysearchPlaces() 를 만들어야합!!!
GPS 안쓰게 토글도 만들어야지 

*/

var data_path = "/HotPlace_data/Nonhyeon_boondang_giheung_filtered(35-10-20).json"

// (37.2804721840256, 127.11467724252604) 기흥구청
// (37.38279059708606, 127.11882455528438) 분당구청

var mapContainer = document.getElementById('map_id'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.38279059708606, 127.11882455528438),
        level: 4 // 지도의 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

/*
// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
    */
// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.BOTTOMLEFT);





var gps_use = null; //gps의 사용가능 여부
var gps_lat = null; // 위도
var gps_lng = null; // 경도
var gps_position; // gps 위치 객체

gps_check();
// gps가 이용가능한지 체크하는 함수이며, 이용가능하다면 show location 함수를 불러온다.
// 만약 작동되지 않는다면 경고창을 띄우고, 에러가 있다면 errorHandler 함수를 불러온다.
// timeout을 통해 시간제한을 둔다.
function gps_check(){
    if (navigator.geolocation) {
        var options = {timeout:5000, enableHighAccuracy: true};
        navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
        console.log(gps_lat,gps_lng)
    } else {
        alert("GPS_추적이 불가합니다.");
        gps_use = false;
    }
}


// gps 이용 가능 시, 위도와 경도를 반환하는 showlocation함수.
function showLocation(position) {
    gps_use = true;
    gps_lat = position.coords.latitude;
    gps_lng = position.coords.longitude;
}


// error발생 시 에러의 종류를 알려주는 함수.
function errorHandler(error) {
    if(error.code == 1) {
        console.log("permission denied");
    } else if( err.code == 2) {
        console.log("position unavailable (error response from location provider)");
    } else if( err.code == 3) {
        console.log("timeout");
    } else if( err.code == 0) {
        console.log("unknown error");
    }
    gps_use = false;
}

function onClickGPS() {
    gps_check()
    changeCategoryClass(this)
    if (gps_use) {
        map.panTo(new kakao.maps.LatLng(gps_lat,gps_lng))
        var gps_content = '<div><img class="pulse" draggable="false" unselectable="on" src="https://ssl.pstatic.net/static/maps/m/pin_rd.png" alt=""></div>';
        var currentOverlay = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(gps_lat,gps_lng),
            content: gps_content,
        })
        currentOverlay.setMap(map)
    } else {
        alert("접근차단하신 경우 새로고침, 아닌 경우 잠시만 기다려주세요.")
        gps_check()
    }
}

addCategoryClickEvent()

function addCategoryClickEvent() {
    var category = document.getElementById('category'),
        children = category.children
    
    /*
    // category의 하위 항목에 onclick 함수를 할당해줌
    for (var i=0; i<children.length-1; i++) {
        children[i].onclick = onClickCategory
    }
    */
    children[0].onclick = getInfo

    // gps(나의 위치 찾기)만 따로 함수를 만들어줘서 관리
    children[children.length-1].onclick = onClickGPS
}

// 카테고리를 클릭했을 때 호출되는 함수입니다
function onClickCategory() {
    var id = this.id,
        className = this.className

    // category 하위 항목을 선택하면 palce overlay가 꺼짐
    placeOverlay.setMap(null)

    // 현재 켜져있는 상태였던 걸 한번 더 클릭한 거면 꺼주고, 꺼진 상태였으면 활성화.
    if (className === 'on') {
        currCategory = ''
        changeCategoryClass()
        removeMarker()
    } else {
        currCategory = id
        changeCategoryClass(this)
        searchPlaces()
    }
}

// 클릭된 카테고리에만 클릭된 스타일을 적용하는 함수입니다
function changeCategoryClass(el) {
    var category = document.getElementById('category'),
        children = category.children
    // 다른 카테고리 하위 목록들은 다 꺼주고
    for (var i=0; i<children.length; i++ ) { 
        children[i].className = ''
    }
    // 현재 선택된 카테고리만 활성화 해 줍니다.
    if (el) {
        el.className = 'on'
    } 
}
/* 여기까지 GPS 관련 함수,,,,,,,, 추후에 정리 필요 */


function keysearchPlaces() {
    currCategory = 'keyword'
    var keyword = document.getElementById('keyword').value;
    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!')
        return false
    }
    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    // ps.keywordSearch(keyword, placesSearchCB)
}


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
        content += '    <a href="'+data.url+'"target="inner_iframe" onclick="show_inner_frame()"> <strong>'+ data.name + '</strong></a><div class="close" onclick="close_overlay('+i+')" title="닫기"></div>';
        content += '    <div class="desc">';
        content += '        <span class="address"> <span id="tvshow">'+ data.tvshow +'</span>(<span id="type">'+ data.type +'</span>) 리뷰 : '+ data.review +'명 <br>';
        content += '        <span id="star">☆</span> (평가) : <span id="star">'+ data.star + '점</span> (' + data.reply + ')</span>';
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
        /*
        for (i in store_data){
            
            if (cluster_markers[i].Ec == null){
                // infowindow_set[i].setMap(null);
                if (marker_onoff[i]==true && temp_overlay[i]==false){
                    overlay_set[i].setMap(null);
                    temp_overlay[i]=true;
                } else if (marker_onoff[i]==false){temp_overlay[i]=false;}
            }
            
            else if (cluster_markers[i].Ec != null){
                // infowindow_set[i].setMap(map);
                if (marker_onoff[i]==true && temp_overlay[i]==true){
                    overlay_set[i].setMap(map);
                    temp_overlay[i]=false;
                } else if (marker_onoff[i]==false){temp_overlay[i]=false;}
            }
        }*/
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
    /*
    if (map.getLevel()<clusterer.getMinLevel()){
        for (i in store_data){
            
            if (cluster_markers[i].Ec == null){
                infowindow_set[i].setMap(null);
            }
            
            if (cluster_markers[i].Ec != null){
                infowindow_set[i].setMap(map);
                if (marker_onoff[i]==true && temp_overlay[i]==true){
                    overlay_set[i].setMap(map);
                    temp_overlay[i]=false;
                }
            }
            
        }
    }*/
    if (map.getLevel()<clusterer.getMinLevel()){
        for (i in store_data){
            infowindow_set[i].setMap(map);
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
// document.querySelector('.overlay_info a').addEventListener('click',function(){
//     document.querySelector('.new_frame').classList.toggle('frame_on')
// }
/* ---------- iframe 요소 ---------- */
